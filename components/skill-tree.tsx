"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  ProgressionTierMeta,
  Skill,
  SkillConnection,
  SkillPathMeta,
} from "@/types/skill";
import { SkillNode } from "./skill-node";
import { Button } from "./ui/8bit-button";

interface SkillTreeProps {
  initialSkills: Skill[];
  connections: SkillConnection[];
  title?: string;
  description?: string;
  targetScore?: number;
  maxLevel?: number;
  skillPaths?: SkillPathMeta[];
  progressionTiers?: ProgressionTierMeta[];
  onOffsetChange?: (offset: { x: number; y: number }, zoom: number) => void;
  onSceneChange?: () => void;
}

const MIN_ZOOM = 0.65;
const MAX_ZOOM = 1.8;
const TIER_VERTICAL_GAP = 210;
const NODE_HORIZONTAL_GAP = 210;
const TIER_COLLISION_GAP = 150;
const ROOT_GROUP_GAP = 190;

interface NodePosition {
  x: number;
  y: number;
}

export function SkillTree({
  initialSkills,
  connections,
  title = "SKILL TREE",
  description = "UPGRADE YOUR ABILITIES",
  targetScore,
  maxLevel,
  skillPaths = [],
  progressionTiers = [],
  onOffsetChange,
  onSceneChange,
}: SkillTreeProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [skillPoints, setSkillPoints] = useState(20);
  const [linePaths, setLinePaths] = useState<
    Array<{ id: string; d: string; active: boolean; secondary: boolean }>
  >([]);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  // Notify parent of offset changes for parallax foreground
  useEffect(() => {
    if (onOffsetChange) {
      onOffsetChange(offset, zoom);
    }
  }, [offset, zoom, onOffsetChange]);

  const canUnlockSkill = useCallback(
    (skill: Skill): boolean => {
      if (skill.unlocked) return true;
      if (skill.prerequisites.length === 0) return true;

      return skill.prerequisites.every((prereqId) => {
        const prereqSkill = skills.find((s) => s.id === prereqId);
        return prereqSkill?.unlocked && prereqSkill.currentLevel > 0;
      });
    },
    [skills]
  );

  const handleUnlockSkill = useCallback(
    (skillId: string) => {
      setSkills((prevSkills) => {
        const skillIndex = prevSkills.findIndex((s) => s.id === skillId);
        if (skillIndex === -1) return prevSkills;

        const skill = prevSkills[skillIndex];
        if (skill.currentLevel >= skill.maxLevel) return prevSkills;
        if (skillPoints < skill.cost) return prevSkills;
        if (!skill.unlocked && !canUnlockSkill(skill)) return prevSkills;

        const newSkills = [...prevSkills];
        newSkills[skillIndex] = {
          ...skill,
          unlocked: true,
          currentLevel: skill.currentLevel + 1,
        };

        setSkillPoints((prev) => prev - skill.cost);
        return newSkills;
      });
    },
    [skillPoints, canUnlockSkill]
  );

  const handleReset = () => {
    const resetSkills = initialSkills.map((skill) => ({
      ...skill,
      currentLevel: 0,
      unlocked: skill.tier === 1,
    }));
    setSkills(resetSkills);
    setSkillPoints(20);
    setZoom(1);
  };

  const setNodeRef = useCallback((skillId: string, node: HTMLButtonElement | null) => {
    nodeRefs.current[skillId] = node;
  }, []);

  const { nodePositions, boardWidth, boardHeight, tierLabelY, primaryParentById } = useMemo(() => {
    const skillsById = Object.fromEntries(skills.map((skill) => [skill.id, skill]));
    const primaryChildrenById: Record<string, string[]> = Object.fromEntries(
      skills.map((skill) => [skill.id, [] as string[]])
    );
    const primaryParentLookup: Record<string, string> = {};

    skills.forEach((skill) => {
      if (skill.prerequisites.length === 0) return;

      const primaryParent =
        skill.prerequisites.find((prereqId) => skillsById[prereqId]?.pathId === skill.pathId) ??
        skill.prerequisites.find((prereqId) => Boolean(skillsById[prereqId]));

      if (!primaryParent) return;
      primaryParentLookup[skill.id] = primaryParent;
      if (primaryChildrenById[primaryParent]) {
        primaryChildrenById[primaryParent].push(skill.id);
      }
    });

    const roots = skills
      .filter((skill) => !primaryParentLookup[skill.id])
      .sort((a, b) => a.tier - b.tier || a.column - b.column || a.name.localeCompare(b.name));

    const widthMemo: Record<string, number> = {};
    const computeSubtreeWidth = (skillId: string, seen: Set<string>): number => {
      if (widthMemo[skillId]) return widthMemo[skillId];
      if (seen.has(skillId)) return 1;

      const nextSeen = new Set(seen);
      nextSeen.add(skillId);

      const children = (primaryChildrenById[skillId] || [])
        .map((childId) => skillsById[childId])
        .filter((skill): skill is Skill => Boolean(skill))
        .sort((a, b) => a.column - b.column || a.name.localeCompare(b.name));

      if (children.length === 0) {
        widthMemo[skillId] = 1;
        return 1;
      }

      const width = children.reduce(
        (sum, child) => sum + computeSubtreeWidth(child.id, nextSeen),
        0
      );
      widthMemo[skillId] = Math.max(1, width);
      return widthMemo[skillId];
    };

    const rawPositions: Record<string, NodePosition> = {};
    const placeSubtree = (skillId: string, centerX: number, visited: Set<string>) => {
      if (visited.has(skillId)) return;
      const skill = skillsById[skillId];
      if (!skill) return;

      const nextVisited = new Set(visited);
      nextVisited.add(skillId);
      rawPositions[skillId] = { x: centerX, y: (skill.tier - 1) * TIER_VERTICAL_GAP };

      const children = (primaryChildrenById[skillId] || [])
        .map((childId) => skillsById[childId])
        .filter((child): child is Skill => Boolean(child))
        .sort((a, b) => a.column - b.column || a.name.localeCompare(b.name));

      if (children.length === 0) return;

      const widthUnits = children.map((child) => computeSubtreeWidth(child.id, new Set()));
      const totalWidth = widthUnits.reduce((sum, value) => sum + value, 0) * NODE_HORIZONTAL_GAP;
      let cursorX = centerX - totalWidth / 2;

      children.forEach((child, index) => {
        const childWidth = widthUnits[index] * NODE_HORIZONTAL_GAP;
        const childCenter = cursorX + childWidth / 2;
        placeSubtree(child.id, childCenter, nextVisited);
        cursorX += childWidth;
      });
    };

    let rootCursor = 0;
    roots.forEach((rootSkill) => {
      const rootWidth = computeSubtreeWidth(rootSkill.id, new Set()) * NODE_HORIZONTAL_GAP;
      const rootCenter = rootCursor + rootWidth / 2;
      placeSubtree(rootSkill.id, rootCenter, new Set());
      rootCursor += rootWidth + ROOT_GROUP_GAP;
    });

    const fallbackByTierCount: Record<number, number> = {};
    skills.forEach((skill) => {
      if (rawPositions[skill.id]) return;
      const fallbackIndex = fallbackByTierCount[skill.tier] ?? 0;
      fallbackByTierCount[skill.tier] = fallbackIndex + 1;
      rawPositions[skill.id] = {
        x: rootCursor + fallbackIndex * NODE_HORIZONTAL_GAP,
        y: (skill.tier - 1) * TIER_VERTICAL_GAP,
      };
    });

    const skillsByTier = skills.reduce<Record<number, Skill[]>>((acc, skill) => {
      if (!acc[skill.tier]) acc[skill.tier] = [];
      acc[skill.tier].push(skill);
      return acc;
    }, {});

    Object.entries(skillsByTier).forEach(([tierKey, tierSkills]) => {
      const tier = Number(tierKey);
      const sortedIds = tierSkills
        .map((skill) => skill.id)
        .sort((a, b) => (rawPositions[a]?.x ?? 0) - (rawPositions[b]?.x ?? 0));

      let lastX = Number.NEGATIVE_INFINITY;
      sortedIds.forEach((skillId) => {
        const current = rawPositions[skillId];
        if (!current) return;
        const nextX = Math.max(current.x, lastX + TIER_COLLISION_GAP);
        rawPositions[skillId] = { x: nextX, y: (tier - 1) * TIER_VERTICAL_GAP };
        lastX = nextX;
      });
    });

    const allPositions = Object.values(rawPositions);
    const minX = Math.min(...allPositions.map((pos) => pos.x));
    const maxX = Math.max(...allPositions.map((pos) => pos.x));
    const minY = Math.min(...allPositions.map((pos) => pos.y));
    const maxY = Math.max(...allPositions.map((pos) => pos.y));
    const padX = 230;
    const padY = 120;

    const shiftedPositions = Object.fromEntries(
      Object.entries(rawPositions).map(([skillId, pos]) => [
        skillId,
        {
          x: pos.x - minX + padX,
          y: pos.y - minY + padY,
        },
      ])
    ) as Record<string, NodePosition>;

    const maxTier = Math.max(...skills.map((skill) => skill.tier));
    const tierLabelMap = Object.fromEntries(
      Array.from({ length: maxTier }).map((_, idx) => {
        const tier = idx + 1;
        return [tier, idx * TIER_VERTICAL_GAP + padY - 56];
      })
    ) as Record<number, number>;

    return {
      nodePositions: shiftedPositions,
      boardWidth: Math.max(1500, maxX - minX + padX * 2),
      boardHeight: Math.max(1100, maxY - minY + padY * 2 + 120),
      tierLabelY: tierLabelMap,
      primaryParentById: primaryParentLookup,
    };
  }, [skills]);

  const totalSpent = initialSkills.reduce((sum, skill) => {
    const current = skills.find((s) => s.id === skill.id);
    return sum + (current ? current.currentLevel * skill.cost : 0);
  }, 0);

  useEffect(() => {
    const computeLines = () => {
      if (!boardRef.current) return;

      const boardRect = boardRef.current.getBoundingClientRect();
      const boardWidthPx = boardRef.current.offsetWidth || 1;
      const boardHeightPx = boardRef.current.offsetHeight || 1;
      const scaleX = boardRect.width / boardWidthPx;
      const scaleY = boardRect.height / boardHeightPx;
      const nextPaths = connections
        .map((conn, index) => {
          const fromNode = nodeRefs.current[conn.from];
          const toNode = nodeRefs.current[conn.to];
          if (!fromNode || !toNode) return null;

          const fromRect = fromNode.getBoundingClientRect();
          const toRect = toNode.getBoundingClientRect();

          // Convert measured viewport-space coordinates into board-local SVG coordinates.
          const startX = (fromRect.left + fromRect.width / 2 - boardRect.left) / scaleX;
          const startY = (fromRect.top + fromRect.height / 2 - boardRect.top) / scaleY;
          const endX = (toRect.left + toRect.width / 2 - boardRect.left) / scaleX;
          const endY = (toRect.top + toRect.height / 2 - boardRect.top) / scaleY;
          const midY = (startY + endY) / 2;

          const fromSkill = skills.find((s) => s.id === conn.from);
          const active = Boolean(fromSkill?.unlocked && fromSkill.currentLevel > 0);
          const isPrimaryPath = primaryParentById[conn.to] === conn.from;

          return {
            id: `${conn.from}-${conn.to}-${index}`,
            d: isPrimaryPath
              ? `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`
              : `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`,
            active,
            secondary: !isPrimaryPath,
          };
        })
        .filter(
          (item): item is { id: string; d: string; active: boolean; secondary: boolean } =>
            Boolean(item)
        );

      setLinePaths(nextPaths);
    };

    computeLines();
    window.addEventListener("resize", computeLines);
    return () => window.removeEventListener("resize", computeLines);
  }, [connections, skills, zoom, offset, boardWidth, boardHeight, primaryParentById]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    setOffset({
      x: (rect.width - boardWidth) / 2,
      y: Math.max(24, (rect.height - boardHeight) / 2),
    });
  }, [boardWidth, boardHeight]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!viewportRef.current) return;

    const rect = viewportRef.current.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;

    const worldX = (cursorX - offset.x) / zoom;
    const worldY = (cursorY - offset.y) / zoom;

    const delta = event.deltaY > 0 ? -0.08 : 0.08;
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((zoom + delta).toFixed(2))));

    setZoom(nextZoom);
    setOffset({
      x: cursorX - worldX * nextZoom,
      y: cursorY - worldY * nextZoom,
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button")) return;

    setIsPanning(true);
    panStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return;

    const dx = event.clientX - panStartRef.current.x;
    const dy = event.clientY - panStartRef.current.y;
    setOffset({
      x: panStartRef.current.offsetX + dx,
      y: panStartRef.current.offsetY + dy,
    });
  };

  const endPanning = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const centerMap = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    setOffset({
      x: (rect.width - boardWidth * zoom) / 2,
      y: (rect.height - boardHeight * zoom) / 2,
    });
  };

  return (
    <div className="w-full min-h-screen bg-transparent scanlines flex items-center justify-center p-5 relative">
      <div className="relative w-full max-w-[1700px] h-[92vh] border-4 border-border bg-card/40 pixel-border overflow-hidden">
        <div className="absolute inset-x-0 top-0 z-20 bg-card/75 backdrop-blur-[1px] border-b-4 border-border p-4">
          <div className="text-center">
            <h1 className="text-2xl text-primary">{title}</h1>
            <p className="text-[10px] text-muted-foreground mt-1">{description}</p>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs">
            <div className="bg-card border-2 border-primary px-3 py-2">SP {skillPoints}</div>
            <div className="bg-card border-2 border-secondary px-3 py-2">SPENT {totalSpent}</div>
            {targetScore && <div className="bg-card border-2 border-accent px-3 py-2">TARGET {targetScore}</div>}
            {maxLevel && <div className="bg-card border-2 border-primary px-3 py-2">MAX {maxLevel}</div>}
            <div className="bg-card border-2 border-border px-3 py-2">ZOOM {(zoom * 100).toFixed(0)}%</div>
            <Button size="sm" variant="secondary" onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.1))}>+</Button>
            <Button size="sm" variant="secondary" onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.1))}>-</Button>
            <Button size="sm" variant="outline" onClick={centerMap}>CENTER</Button>
            <Button size="sm" variant="destructive" onClick={handleReset}>RESET</Button>
          </div>

          {progressionTiers.length > 0 && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-2">
              {progressionTiers.map((tier) => (
                <div key={tier.tier} className="border-2 border-border bg-muted/60 p-2 text-center">
                  <div className="text-[10px]">TIER {tier.tier}</div>
                  <div className="text-[11px] text-primary mt-1">{tier.name}</div>
                  <div className="text-[8px] text-muted-foreground mt-1">{tier.scoreRange} | Lv {tier.level}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          ref={viewportRef}
          className={`absolute left-4 right-4 bottom-16 top-[220px] bg-card/20 overflow-hidden ${
            isPanning ? "cursor-grabbing" : "cursor-grab"
          }`}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPanning}
          onPointerLeave={endPanning}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              width: boardWidth,
              height: boardHeight,
            }}
          >
            <div
              ref={boardRef}
              className="relative bg-card/45 p-8"
              style={{ width: boardWidth, minHeight: boardHeight }}
            >
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                {linePaths.map((line) => (
                  <path
                    key={line.id}
                    d={line.d}
                    stroke={line.active ? (line.secondary ? "#67d9a0" : "#48bb78") : "#4a5568"}
                    strokeWidth={line.secondary ? 2.5 : 4}
                    strokeDasharray={line.secondary ? "3 10" : "8 8"}
                    opacity={line.secondary ? 0.45 : 0.9}
                    fill="none"
                    className="transition-colors duration-300"
                  />
                ))}
              </svg>

              <div className="relative" style={{ zIndex: 1, width: boardWidth, height: boardHeight }}>
                {Object.entries(tierLabelY).map(([tier, y]) => (
                  <div
                    key={tier}
                    className="absolute left-6 bg-muted/80 border-2 border-border px-3 py-2 pixel-border"
                    style={{ top: y }}
                  >
                    <div className="text-[10px] text-center text-muted-foreground">TIER {tier}</div>
                  </div>
                ))}

                {skills.map((skill) => {
                  const pos = nodePositions[skill.id];
                  if (!pos) return null;

                  return (
                    <div
                      key={skill.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: pos.x, top: pos.y }}
                    >
                      <SkillNode
                        skill={skill}
                        onUnlock={handleUnlockSkill}
                        canUnlock={canUnlockSkill(skill)}
                        skillPoints={skillPoints}
                        onNodeRef={setNodeRef}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 border-t-4 border-border bg-card/75 p-3 text-center text-[10px] text-muted-foreground">
          DRAG EMPTY SPACE TO PAN • SCROLL TO ZOOM • CLICK NODES TO UNLOCK • HOVER FOR DETAILS
          {skillPaths.length > 0 && (
            <div className="mt-1 text-[9px]">
              {skillPaths.map((p) => `${p.pathIcon} ${p.pathName}`).join("  |  ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
