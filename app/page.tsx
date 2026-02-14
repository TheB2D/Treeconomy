"use client";

import { useState, useEffect } from "react";
import { SkillTree } from "@/components/skill-tree";
import { DynamicBackground } from "@/components/dynamic-background";
import { ParallaxForeground } from "@/components/parallax-foreground";
import { SceneTransition } from "@/components/scene-transition";
import { SceneTwo } from "@/components/scene-two";
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
  const [currentScene, setCurrentScene] = useState<1 | 2>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scene1FadeIn, setScene1FadeIn] = useState(false);

  const handleOffsetChange = (offset: { x: number; y: number }, zoom: number) => {
    setPanOffset(offset);
    setPanZoom(zoom);
  };

  const handleSceneChange = () => {
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    setCurrentScene(2);
  };

  const handleBackToScene1 = () => {
    setCurrentScene(1);
  };

  // Trigger fade-in when Scene 1 is shown
  useEffect(() => {
    if (currentScene === 1) {
      setScene1FadeIn(false);
      setTimeout(() => setScene1FadeIn(true), 50);
    }
  }, [currentScene]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Scene 1: Skill Tree */}
      {currentScene === 1 && (
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
      )}

      {/* Scene 2: Nature's Thought */}
      {currentScene === 2 && (
        <SceneTwo onBack={handleBackToScene1} />
      )}

      {/* Transition Animation */}
      <SceneTransition 
        isActive={isTransitioning}
        onComplete={handleTransitionComplete}
      />
    </main>
  );
}
