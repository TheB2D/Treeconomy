"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Game State Interface
interface GameState {
  userId: string;
  forestHealth: number;
  xp: number;
  tier: string;
  unlockedSkills: string[];
  metrics: {
    creditScore: number;
    utilization: number;
    paymentStreak: number;
    inquiryCount: number;
    droughtEvents: number;
    stormEvents: number;
    utilizationOvergrowth: boolean;
  };
  lastSync: string;
}

interface SkillUnlock {
  skillId: string;
  name: string;
  xpAwarded: number;
  tier: number;
  unlockedAt: string;
}

interface GameStateContextType {
  gameState: GameState | null;
  setGameState: (state: GameState) => void;
  newUnlocks: SkillUnlock[];
  setNewUnlocks: (unlocks: SkillUnlock[]) => void;
  isSynced: boolean;
  setIsSynced: (synced: boolean) => void;
  guideMessage: string | null;
  setGuideMessage: (message: string | null) => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [newUnlocks, setNewUnlocks] = useState<SkillUnlock[]>([]);
  const [isSynced, setIsSynced] = useState(false);
  const [guideMessage, setGuideMessage] = useState<string | null>(null);

  return (
    <GameStateContext.Provider
      value={{
        gameState,
        setGameState,
        newUnlocks,
        setNewUnlocks,
        isSynced,
        setIsSynced,
        guideMessage,
        setGuideMessage,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}
