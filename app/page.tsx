"use client";

import { useState, useEffect } from "react";
import { SkillTree } from "@/components/skill-tree";
import { DynamicBackground } from "@/components/dynamic-background";
import { ParallaxForeground } from "@/components/parallax-foreground";
import { SceneTransition } from "@/components/scene-transition";
import { SceneTwo } from "@/components/scene-two";
import { SceneThree } from "@/components/scene-three";
import { UniversalGuide } from "@/components/universal-guide";
import { Button } from "@/components/ui/8bit-button";
import {
  connections,
  progressionTiers,
  skillPaths,
  skills,
  skillTreeMeta,
} from "@/data/skills";

export default function Home() {
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panZoom, setPanZoom] = useState(1);
  const [currentScene, setCurrentScene] = useState<1 | 2 | 3>(1);
  const [pendingScene, setPendingScene] = useState<1 | 2 | 3 | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSoftFading, setIsSoftFading] = useState(false);
  const [softFadeOpacity, setSoftFadeOpacity] = useState(0);
  const [scene1FadeIn, setScene1FadeIn] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleOffsetChange = (offset: { x: number; y: number }, zoom: number) => {
    setPanOffset(offset);
    setPanZoom(zoom);
  };

  const handleSceneChange = () => {
    if (isTransitioning) return;
    setPendingScene(2);
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    if (pendingScene) {
      setCurrentScene(pendingScene);
    }
    setPendingScene(null);
    setIsTransitioning(false);
  };

  const handleBackToScene1 = () => {
    startSoftFadeTransition(1);
  };

  const startSoftFadeTransition = (targetScene: 1 | 2 | 3) => {
    if (isTransitioning || isSoftFading) return;
    setScene1FadeIn(false);
    setSoftFadeOpacity(0);
    setIsSoftFading(true);

    requestAnimationFrame(() => {
      setSoftFadeOpacity(1);
    });

    setTimeout(() => {
      setCurrentScene(targetScene);
      setIsSoftFading(false);
      setSoftFadeOpacity(0);
    }, 700);
  };

  // Trigger fade-in when Scene 1 is shown
  useEffect(() => {
    if (currentScene === 1) {
      setScene1FadeIn(false);
      setTimeout(() => setScene1FadeIn(true), 50);
    }
  }, [currentScene]);

  const guideMessage =
    currentScene === 1
      ? "Woof! I am your Treeconomy guide. Hover skills to read details, unlock nodes when ready, and pan around to explore each path."
      : currentScene === 2
      ? "Woof! This panel explains your impact. For now I use placeholder dialogue, but I will later be powered by an LLM for live guidance."
      : "Woof! Welcome to leaderboards. Here you can track league standings, top ranks, and demotion risk zones.";

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Scene 1: Skill Tree */}
      {currentScene === 1 && (
        <>
          <div 
            style={{
              opacity: scene1FadeIn ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
            }}
          >
            <DynamicBackground />
            <div className="relative z-10">
              <SkillTree
                initialSkills={skills}
                connections={connections}
                title={skillTreeMeta.name}
                description={skillTreeMeta.description}
                targetScore={skillTreeMeta.targetScore}
                maxLevel={skillTreeMeta.maxLevel}
                skillPaths={skillPaths}
                progressionTiers={progressionTiers}
                onOffsetChange={handleOffsetChange}
                onSceneChange={handleSceneChange}
              />
            </div>
            <ParallaxForeground offset={panOffset} zoom={panZoom} />
          </div>
          
          {/* Scene Change Button - Right Edge */}
          {!isTransitioning && (
            <div 
              className="fixed"
              style={{
                right: '8px',
                top: '50%',
                zIndex: 1001,
                transform: 'translateY(-50%)',
                pointerEvents: 'auto',
              }}
            >
              <Button
                onClick={handleSceneChange}
                variant="default"
                className="h-auto min-h-0 w-auto min-w-0 px-2 py-3 flex items-center gap-2"
                style={{
                  width: 'fit-content',
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  textOrientation: 'mixed',
                }}
              >
                NATURE&apos;S THOUGHT
                <img src="/ui_helper/UI_Flat_ButtonArrow01a.png" alt="Nature thoughts" className="w-4 h-4 object-contain" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Scene 2: Nature's Thought */}
      {currentScene === 2 && (
        <SceneTwo />
      )}

      {/* Scene 3: Leaderboards */}
      {currentScene === 3 && (
        <SceneThree />
      )}

      {/* Scene Back Button - Left Edge (uniform with scene change button) */}
      {currentScene === 2 && !isTransitioning && !isSoftFading && (
        <div
          className="fixed"
          style={{
            left: '8px',
            top: '50%',
            zIndex: 1001,
            transform: 'translateY(-50%)',
            pointerEvents: 'auto',
          }}
        >
          <Button
            onClick={handleBackToScene1}
            variant="default"
            className="h-auto min-h-0 w-auto min-w-0 px-2 py-3 flex items-center gap-2"
            style={{
              width: 'fit-content',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              textOrientation: 'mixed',
            }}
          >
            SKILL TREE
            <img src="/ui_helper/UI_Flat_ButtonArrow01a.png" alt="Skill tree" className="w-4 h-4 object-contain" />
          </Button>
        </div>
      )}

      {/* Scene Next Button - Right Edge (Nature's Thought -> Leaderboards) */}
      {currentScene === 2 && !isTransitioning && !isSoftFading && (
        <div
          className="fixed"
          style={{
            right: "8px",
            top: "50%",
            zIndex: 1001,
            transform: "translateY(-50%)",
            pointerEvents: "auto",
          }}
        >
          <Button
            onClick={() => startSoftFadeTransition(3)}
            variant="default"
            className="h-auto min-h-0 w-auto min-w-0 px-2 py-3 flex items-center gap-2"
            style={{
              width: "fit-content",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              textOrientation: "mixed",
            }}
          >
            LEADERBOARDS
            <img src="/ui_helper/UI_Flat_IconPlay01a.png" alt="Leaderboards" className="w-4 h-4 object-contain" />
          </Button>
        </div>
      )}

      {/* Scene Back Button - Left Edge (Leaderboards -> Nature's Thought) */}
      {currentScene === 3 && !isTransitioning && !isSoftFading && (
        <div
          className="fixed"
          style={{
            left: "8px",
            top: "50%",
            zIndex: 1001,
            transform: "translateY(-50%)",
            pointerEvents: "auto",
          }}
        >
          <Button
            onClick={() => startSoftFadeTransition(2)}
            variant="default"
            className="h-auto min-h-0 w-auto min-w-0 px-2 py-3 flex items-center gap-2"
            style={{
              width: "fit-content",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              textOrientation: "mixed",
            }}
          >
            NATURE&apos;S THOUGHT
            <img src="/ui_helper/UI_Flat_ButtonArrow01a.png" alt="Nature thoughts" className="w-4 h-4 object-contain" />
          </Button>
        </div>
      )}

      {/* Transition Animation */}
      <SceneTransition 
        isActive={isTransitioning}
        onComplete={handleTransitionComplete}
      />

      {/* Soft Transition: simple fade between non-cinematic scenes */}
      {isSoftFading && (
        <div
          className="fixed inset-0 z-[2000] bg-black pointer-events-none"
          style={{
            opacity: softFadeOpacity,
            transition: "opacity 700ms ease-in-out",
          }}
        />
      )}

      {/* Universal Guide Toggle Button */}
      <div className="fixed right-4 bottom-4 z-[1301] pointer-events-auto">
        <Button
          onClick={() => setIsGuideOpen((open) => !open)}
          variant={isGuideOpen ? "destructive" : "secondary"}
          className="px-3 py-2"
        >
          <img
            src={isGuideOpen ? "/ui_helper/UI_Flat_ToggleRightOn01a.png" : "/ui_helper/UI_Flat_ToggleRightOff01a.png"}
            alt={isGuideOpen ? "Close guide" : "Open guide"}
            className="w-4 h-4 object-contain"
          />
          {isGuideOpen ? "HIDE GUIDE" : "GUIDE"}
        </Button>
      </div>

      {/* Universal Guide Overlay */}
      <UniversalGuide isOpen={isGuideOpen} message={guideMessage} />
    </main>
  );
}
