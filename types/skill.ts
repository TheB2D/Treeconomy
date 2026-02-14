export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  column: number;
  maxLevel: number;
  currentLevel: number;
  unlocked: boolean;
  prerequisites: string[];
  cost: number;
  pathId?: string;
  pathName?: string;
  recommendedLevel?: number;
  scoreImpact?: string;
  xpReward?: number;
  badge?: string;
  tips?: string;
  tasks?: string[];
}

export interface SkillConnection {
  from: string;
  to: string;
}

export interface SkillPathMeta {
  pathId: string;
  pathName: string;
  pathIcon: string;
  primaryImpact: string;
}

export interface ProgressionTierMeta {
  tier: number;
  name: string;
  scoreRange: string;
  level: string;
}
