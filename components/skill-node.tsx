"use client";

import { Skill } from "@/types/skill";
import { cn } from "@/lib/utils";
import { Lock, Star } from "lucide-react";
import { useRef, useState } from "react";

interface SkillNodeProps {
  skill: Skill;
  onUnlock: (skillId: string) => void;
  canUnlock: boolean;
  skillPoints: number;
  onNodeRef?: (skillId: string, node: HTMLButtonElement | null) => void;
}

export function SkillNode({
  skill,
  onUnlock,
  canUnlock,
  skillPoints,
  onNodeRef,
}: SkillNodeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPlacement, setTooltipPlacement] = useState<"top" | "bottom">("top");
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const isLocked = !skill.unlocked;
  const isMaxLevel = skill.currentLevel >= skill.maxLevel;
  const canAfford = skillPoints >= skill.cost;
  const isAvailable = canUnlock && canAfford && !isMaxLevel;

  const handleClick = () => {
    if (isAvailable || (skill.unlocked && !isMaxLevel && canAfford)) {
      onUnlock(skill.id);
    }
  };

  const updateTooltipPlacement = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltipPlacement(rect.top < 340 ? "bottom" : "top");
  };

  const skillAltText = `${skill.name} icon`;
  const hoverFrameVariant = isLocked && !isAvailable ? "4" : isLocked && isAvailable ? "2" : isMaxLevel ? "3" : "1";
  const hoverFrameSrc = `/ui_helper/UI_Flat_Select02a_${hoverFrameVariant}.png`;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center group z-10",
        showTooltip && "z-[2000]"
      )}
      onMouseEnter={() => {
        updateTooltipPlacement();
        setShowTooltip(true);
      }}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Skill Node */}
      <button
        ref={(node) => {
          buttonRef.current = node;
          onNodeRef?.(skill.id, node);
        }}
        onClick={handleClick}
        disabled={isLocked ? !isAvailable : (isMaxLevel || !canAfford)}
        className={cn(
          "relative w-20 h-20 flex flex-col items-center justify-center",
          "border-4 transition-all duration-200 pixel-border",
          "disabled:cursor-not-allowed",
          {
            // Locked state
            "bg-gray-800 border-gray-600 text-gray-500": isLocked && !isAvailable,
            
            // Can unlock
            "bg-blue-900 border-blue-400 text-blue-300 hover:bg-blue-800 cursor-pointer pixel-hover skill-glow": 
              isLocked && isAvailable,
            
            // Unlocked but not maxed
            "bg-green-900 border-green-400 text-green-300 hover:bg-green-800 cursor-pointer pixel-hover": 
              !isLocked && !isMaxLevel && canAfford,
            
            // Maxed out
            "bg-yellow-700 border-yellow-400 text-yellow-200 skill-glow": 
              !isLocked && isMaxLevel,
            
            // Unlocked but can't afford
            "bg-green-900 border-green-400 text-green-300 cursor-not-allowed": 
              !isLocked && !isMaxLevel && !canAfford,
          }
        )}
      >
        {showTooltip && (
          <img
            src={hoverFrameSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] object-contain pointer-events-none"
          />
        )}

        {/* Icon */}
        <div className="mb-1 drop-shadow-lg">
          {isLocked && !isAvailable ? (
            <Lock className="w-6 h-6" />
          ) : (
            <img src={skill.icon} alt={skillAltText} className="w-8 h-8 object-contain pixelated" />
          )}
        </div>

        {/* Level indicators */}
        <div className="flex gap-1">
          {Array.from({ length: skill.maxLevel }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 border border-current",
                i < skill.currentLevel ? "bg-current" : "bg-transparent"
              )}
            />
          ))}
        </div>

        {/* Max level star */}
        {isMaxLevel && (
          <Star className="absolute -top-2 -right-2 w-5 h-5 fill-yellow-400 text-yellow-400 animate-pulse" />
        )}

        {/* Cost badge */}
        {!isMaxLevel && skill.unlocked && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-2 border-current px-2 py-0.5 text-xs">
            {skill.cost}
          </div>
        )}
      </button>

      {/* Skill name below node */}
      <div className="mt-3 text-center max-w-24">
        <p className={cn(
          "text-[8px] leading-tight",
          isLocked && !isAvailable ? "text-gray-500" : "text-foreground"
        )}>
          {skill.name}
        </p>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute z-[1200] pointer-events-none left-1/2 -translate-x-1/2"
          style={
            tooltipPlacement === "top"
              ? { bottom: "calc(100% + 12px)" }
              : { top: "calc(100% + 12px)" }
          }
        >
          <div className="bg-card border-4 border-border p-4 w-[360px] max-w-[calc(100vw-24px)] pixel-border">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-bold text-foreground">{skill.name}</h3>
              <img src={skill.icon} alt={skillAltText} className="w-8 h-8 ml-2 object-contain pixelated" />
            </div>
            
            <div className="space-y-2 text-[10px] leading-relaxed">
              <p className="text-muted-foreground">{skill.description}</p>
              {skill.pathName && (
                <p className="text-[9px] text-secondary">
                  Path: {skill.pathName}
                </p>
              )}
              
              <div className="flex justify-between pt-2 border-t-2 border-border">
                <span className="text-foreground">
                  Level: {skill.currentLevel}/{skill.maxLevel}
                </span>
                {!isMaxLevel && (
                  <span className="text-accent">Cost: {skill.cost} SP</span>
                )}
              </div>
              {(skill.recommendedLevel || skill.scoreImpact) && (
                <div className="flex justify-between text-[9px] text-muted-foreground border-t-2 border-border pt-2">
                  <span>{skill.recommendedLevel ? `Req Lv ${skill.recommendedLevel}` : ""}</span>
                  <span>{skill.scoreImpact ? `Impact ${skill.scoreImpact}` : ""}</span>
                </div>
              )}
              {(skill.xpReward || skill.badge) && (
                <div className="text-[9px] text-primary border-t-2 border-border pt-2">
                  {skill.xpReward ? `XP +${skill.xpReward}` : ""}
                  {skill.badge ? ` | Badge: ${skill.badge}` : ""}
                </div>
              )}
              {skill.tasks && skill.tasks.length > 0 && (
                <div className="text-[9px] text-muted-foreground border-t-2 border-border pt-2">
                  Task: {skill.tasks[0]}
                </div>
              )}
              {skill.tips && (
                <div className="text-[9px] text-secondary border-t-2 border-border pt-2">
                  Tip: {skill.tips}
                </div>
              )}

              {skill.prerequisites.length > 0 && (
                <div className="pt-2 border-t-2 border-border">
                  <span className="text-destructive text-[9px]">
                    Requires: {skill.prerequisites.join(", ")}
                  </span>
                </div>
              )}

              {isLocked && !isAvailable && (
                <div className="pt-2 text-destructive text-center">
                  LOCKED
                </div>
              )}

              {!isLocked && isMaxLevel && (
                <div className="pt-2 text-yellow-400 text-center flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  MAX LEVEL
                  <Star className="w-3 h-3 fill-current" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
