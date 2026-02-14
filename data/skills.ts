import {
  ProgressionTierMeta,
  Skill,
  SkillConnection,
  SkillPathMeta,
} from "@/types/skill";
import configJson from "./skill-tree-config.json";

interface ConfigSkill {
  skillId: string;
  pathId: string;
  tier: number;
  level: number;
  name: string;
  description: string;
  prerequisites?: string[];
  rewards?: {
    xp?: number;
    scoreImpact?: string;
    badge?: string;
  };
  tasks?: string[];
  tips?: string;
}

interface SkillTreeConfig {
  skillTree: {
    name: string;
    description: string;
    targetScore: number;
    maxLevel: number;
    progressionTiers: ProgressionTierMeta[];
    skillPaths: SkillPathMeta[];
    skills: ConfigSkill[];
  };
}

const config = (configJson as SkillTreeConfig).skillTree;

export const skillTreeMeta = {
  name: config.name,
  description: config.description,
  targetScore: config.targetScore,
  maxLevel: config.maxLevel,
};

export const progressionTiers: ProgressionTierMeta[] = config.progressionTiers.map((tier) => ({
  tier: tier.tier,
  name: tier.name,
  scoreRange: tier.scoreRange,
  level: tier.level,
}));

export const skillPaths: SkillPathMeta[] = config.skillPaths.map((path) => ({
  pathId: path.pathId,
  pathName: path.pathName,
  pathIcon: path.pathIcon,
  primaryImpact: path.primaryImpact,
}));

const sourceSkills = config.skills;

const iconByPath = Object.fromEntries(skillPaths.map((path) => [path.pathId, path.pathIcon]));
const nameByPath = Object.fromEntries(skillPaths.map((path) => [path.pathId, path.pathName]));
const pathColumnById = Object.fromEntries(
  skillPaths.map((path, index) => [path.pathId, index])
);

const tierGrouped = sourceSkills.reduce<Record<number, CreditSkillSource[]>>((acc, skill) => {
  if (!acc[skill.tier]) {
    acc[skill.tier] = [];
  }
  acc[skill.tier].push(skill);
  return acc;
}, {});

export const skills: Skill[] = Object.entries(tierGrouped).flatMap(([tierKey, tierSkills]) => {
  const tier = Number(tierKey);
  const sorted = tierSkills.sort((a, b) => a.level - b.level || a.pathId.localeCompare(b.pathId));
  return sorted.map((skill, index) => ({
    id: skill.skillId,
    name: skill.name,
    description: skill.description,
    icon: iconByPath[skill.pathId] ?? "⭐",
    tier,
    column: pathColumnById[skill.pathId] ?? index,
    maxLevel: 1,
    currentLevel: 0,
    unlocked: (skill.prerequisites ?? []).length === 0,
    prerequisites: skill.prerequisites ?? [],
    cost: Math.min(5, Math.max(1, Math.ceil(skill.level / 20))),
    pathId: skill.pathId,
    pathName: nameByPath[skill.pathId],
    recommendedLevel: skill.level,
    scoreImpact: skill.rewards?.scoreImpact,
    xpReward: skill.rewards?.xp,
    badge: skill.rewards?.badge,
    tips: skill.tips,
    tasks: skill.tasks ?? [],
  }));
});

export const connections: SkillConnection[] = sourceSkills.flatMap((skill) =>
  (skill.prerequisites ?? []).map((prereq) => ({ from: prereq, to: skill.skillId }))
);
