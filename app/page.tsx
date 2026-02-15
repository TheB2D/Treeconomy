"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SkillTree } from "@/components/skill-tree";
import { DynamicBackground } from "@/components/dynamic-background";
import { ParallaxForeground } from "@/components/parallax-foreground";
import { SceneTransition } from "@/components/scene-transition";
import { SceneTwo } from "@/components/scene-two";
import { SceneThree } from "@/components/scene-three";
import { UniversalGuide } from "@/components/universal-guide";
import { Button } from "@/components/ui/8bit-button";
import { EntrySyncScreen } from "@/components/entry-sync-screen";
import type { PersonalInfo } from "@/components/identity-gate-modal";
import { useGameState } from "@/lib/gameStateContext";
import {
  connections,
  progressionTiers,
  skillPaths,
  skills,
  skillTreeMeta,
} from "@/data/skills";

export default function Home() {
  const {
    gameState,
    setGameState,
    setNewUnlocks,
    setIsSynced,
    guideMessage,
    setGuideMessage,
  } = useGameState();
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panZoom, setPanZoom] = useState(1);
  const [currentScene, setCurrentScene] = useState<1 | 2 | 3>(1);
  const [pendingScene, setPendingScene] = useState<1 | 2 | 3 | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSoftFading, setIsSoftFading] = useState(false);
  const [softFadeOpacity, setSoftFadeOpacity] = useState(0);
  const [scene1FadeIn, setScene1FadeIn] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [entrySyncLoading, setEntrySyncLoading] = useState(false);
  const [entrySyncError, setEntrySyncError] = useState<string | null>(null);
  const [didShowPostSyncGuide, setDidShowPostSyncGuide] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const daisiesAudioRef = useRef<HTMLAudioElement | null>(null);
  const junaAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const trackLevelsRef = useRef({ daisies: 0, juna: 0 });
  const isMutedRef = useRef(false);
  const hasEnteredRef = useRef(false);
  const currentSceneRef = useRef<1 | 2 | 3>(1);

  const getTargetTrack = useCallback((): "daisies" | "juna" => {
    if (!hasEntered || currentScene === 1) return "daisies";
    return "juna";
  }, [hasEntered, currentScene]);

  const applyVolumes = useCallback((daisiesLevel: number, junaLevel: number) => {
    trackLevelsRef.current = { daisies: daisiesLevel, juna: junaLevel };
    if (daisiesAudioRef.current) {
      daisiesAudioRef.current.volume = isMutedRef.current ? 0 : daisiesLevel;
    }
    if (junaAudioRef.current) {
      junaAudioRef.current.volume = isMutedRef.current ? 0 : junaLevel;
    }
  }, []);

  const crossfadeToTrack = useCallback(
    (target: "daisies" | "juna", durationMs = 1200) => {
      const daisies = daisiesAudioRef.current;
      const juna = junaAudioRef.current;
      if (!daisies || !juna) return;
      const ensureTrackReady = (track: HTMLAudioElement) => {
        // If a paused track sits at/near the end, restart it to avoid end-state glitches.
        if (Number.isFinite(track.duration) && track.duration > 0) {
          const remaining = track.duration - track.currentTime;
          if (remaining <= 0.05) {
            track.currentTime = 0;
          }
        }
      };

      const startDaisies = trackLevelsRef.current.daisies;
      const startJuna = trackLevelsRef.current.juna;
      const endDaisies = target === "daisies" ? 1 : 0;
      const endJuna = target === "juna" ? 1 : 0;

      if (fadeFrameRef.current !== null) {
        cancelAnimationFrame(fadeFrameRef.current);
      }

      if (target === "daisies") {
        ensureTrackReady(daisies);
        void daisies.play().catch(() => {});
      } else {
        ensureTrackReady(juna);
        void juna.play().catch(() => {});
      }

      if (durationMs <= 0) {
        applyVolumes(endDaisies, endJuna);
        if (endDaisies === 0) daisies.pause();
        if (endJuna === 0) juna.pause();
        return;
      }

      const startTime = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - startTime) / durationMs, 1);
        const nextDaisies = startDaisies + (endDaisies - startDaisies) * progress;
        const nextJuna = startJuna + (endJuna - startJuna) * progress;
        applyVolumes(nextDaisies, nextJuna);

        if (progress < 1) {
          fadeFrameRef.current = requestAnimationFrame(animate);
        } else {
          if (endDaisies === 0) daisies.pause();
          if (endJuna === 0) juna.pause();
          fadeFrameRef.current = null;
        }
      };

      fadeFrameRef.current = requestAnimationFrame(animate);
    },
    [applyVolumes]
  );

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    hasEnteredRef.current = hasEntered;
  }, [hasEntered]);

  useEffect(() => {
    currentSceneRef.current = currentScene;
  }, [currentScene]);

  useEffect(() => {
    const daisies = new Audio("/music/Daisies%20By%20Justin%20Bieber.mp3");
    daisies.loop = true;
    daisies.preload = "auto";
    daisies.volume = 0;

    const juna = new Audio("/music/Juna%20by%20Clairo.mp3");
    juna.loop = true;
    juna.preload = "auto";
    juna.volume = 0;

    const forceLoop = (track: HTMLAudioElement) => {
      track.currentTime = 0;
      void track.play().catch(() => {});
    };
    const onDaisiesEnded = () => forceLoop(daisies);
    const onJunaEnded = () => forceLoop(juna);
    daisies.addEventListener("ended", onDaisiesEnded);
    juna.addEventListener("ended", onJunaEnded);

    daisiesAudioRef.current = daisies;
    junaAudioRef.current = juna;
    applyVolumes(1, 0);
    void daisies.play().catch(() => {});

    const resumeMusic = () => {
      const targetTrack =
        !hasEnteredRef.current || currentSceneRef.current === 1 ? "daisies" : "juna";
      crossfadeToTrack(targetTrack, 0);
    };

    window.addEventListener("pointerdown", resumeMusic, { once: true });
    window.addEventListener("keydown", resumeMusic, { once: true });

    return () => {
      window.removeEventListener("pointerdown", resumeMusic);
      window.removeEventListener("keydown", resumeMusic);
      if (fadeFrameRef.current !== null) {
        cancelAnimationFrame(fadeFrameRef.current);
      }
      daisies.pause();
      juna.pause();
      daisies.removeEventListener("ended", onDaisiesEnded);
      juna.removeEventListener("ended", onJunaEnded);
    };
  }, [applyVolumes, crossfadeToTrack]);

  useEffect(() => {
    const targetTrack = getTargetTrack();
    crossfadeToTrack(targetTrack);
  }, [getTargetTrack, crossfadeToTrack]);

  useEffect(() => {
    applyVolumes(trackLevelsRef.current.daisies, trackLevelsRef.current.juna);
    if (!isMuted) {
      const targetTrack = getTargetTrack();
      const activeTrack =
        targetTrack === "daisies" ? daisiesAudioRef.current : junaAudioRef.current;
      if (activeTrack?.paused) {
        void activeTrack.play().catch(() => {});
      }
    }
  }, [isMuted, applyVolumes, getTargetTrack]);

  const handleInitialSync = async (personalInfo: PersonalInfo) => {
    setEntrySyncLoading(true);
    setEntrySyncError(null);

    try {
      const response = await fetch("/api/credit/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: `demo_user_${Date.now()}`,
          bureau: "transunion",
          personalInfo,
          includeIdentityCheck: false,
        }),
      });
      const result = await response.json();

      if (!result.success || !result.gameState) {
        throw new Error(result.error || "Sync failed");
      }

      setGameState(result.gameState);
      setNewUnlocks(result.newUnlocks || []);
      setIsSynced(true);
      setGuideMessage(result.narrative?.message || result.guideMessage || null);
      setCurrentScene(1);
      setHasEntered(true);
    } catch (error: any) {
      setEntrySyncError(error?.message || "Unable to sync. Try again.");
    } finally {
      setEntrySyncLoading(false);
    }
  };

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

  // Auto-open Doge guide once right after successful login/sync on Scene 1.
  useEffect(() => {
    if (hasEntered && currentScene === 1 && gameState && !didShowPostSyncGuide) {
      setIsGuideOpen(true);
      setDidShowPostSyncGuide(true);
    }
  }, [hasEntered, currentScene, gameState, didShowPostSyncGuide]);

  const guideText =
    currentScene === 1
      ? gameState
        ? guideMessage ??
          `Woof! Sync complete. Your score is ${gameState.metrics.creditScore}, so your tree opens to roughly your current progression band. Utilization ${gameState.metrics.utilization.toFixed(
            0
          )}% powers Utilization Optimization, payment streak ${gameState.metrics.paymentStreak} boosts Payment Mastery, and ${gameState.metrics.inquiryCount} inquiries shape Inquiry Intelligence. Start with glowing unlocked nodes and build upward.`
        : "Woof! I am your Treeconomy guide. Hover skills to read details, unlock nodes when ready, and pan around to explore each path."
      : currentScene === 2
      ? "Woof! This panel explains your impact. For now I use placeholder dialogue, but I will later be powered by an LLM for live guidance."
      : "Woof! Welcome to leaderboards. Here you can track league standings, top ranks, and demotion risk zones.";

  return (
    <main className="relative min-h-screen overflow-hidden">
      {!hasEntered ? (
        <EntrySyncScreen
          onSync={handleInitialSync}
          loading={entrySyncLoading}
          error={entrySyncError}
        />
      ) : (
        <>
          {/* Scene 1: Skill Tree */}
          {currentScene === 1 && (
            <>
              <div
                style={{
                  opacity: scene1FadeIn ? 1 : 0,
                  transition: "opacity 1s ease-in-out",
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
                    right: "8px",
                    top: "50%",
                    zIndex: 1001,
                    transform: "translateY(-50%)",
                    pointerEvents: "auto",
                  }}
                >
                  <Button
                    onClick={handleSceneChange}
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
                    <img
                      src="/ui_helper/UI_Flat_ButtonArrow01a.png"
                      alt="Nature thoughts"
                      className="w-4 h-4 object-contain"
                    />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Scene 2: Nature's Thought */}
          {currentScene === 2 && <SceneTwo />}

          {/* Scene 3: Leaderboards */}
          {currentScene === 3 && <SceneThree />}

          {/* Scene Back Button - Left Edge (uniform with scene change button) */}
          {currentScene === 2 && !isTransitioning && !isSoftFading && (
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
                onClick={handleBackToScene1}
                variant="default"
                className="h-auto min-h-0 w-auto min-w-0 px-2 py-3 flex items-center gap-2"
                style={{
                  width: "fit-content",
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  textOrientation: "mixed",
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
          <UniversalGuide isOpen={isGuideOpen} message={guideText} gameState={gameState} />
        </>
      )}

      {/* Global Music Toggle */}
      <div className="fixed right-4 top-4 z-[1301] pointer-events-auto">
        <Button
          onClick={() => setIsMuted((muted) => !muted)}
          variant={isMuted ? "destructive" : "secondary"}
          className="px-3 py-2"
        >
          <img
            src={isMuted ? "/icons/sound_off.png" : "/icons/sound_on.png"}
            alt={isMuted ? "Unmute music" : "Mute music"}
            className="w-4 h-4 object-contain"
          />
          {isMuted ? "UNMUTE" : "MUTE"}
        </Button>
      </div>
    </main>
  );
}
