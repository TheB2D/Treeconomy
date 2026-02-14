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
const pathProgressionIconMap: Record<string, string[]> = {
  PATH_001: [
    "/icons/swipe_t1.png",
    "/icons/swipe_t2.png",
    "/icons/swipe_t3.png",
    "/icons/swipe_t5.png",
    "/icons/swipe_t6.png",
    "/icons/swipe_t7.png",
    "/icons/swipe_t8.png",
  ],
  PATH_002: [
    "/icons/stackcoin_t1.png",
    "/icons/stackcoin_t2.png",
    "/icons/stackcoin_t3.png",
    "/icons/stackcoin_t4.png",
    "/icons/gold_plus.png",
    "/icons/gold_increase.png",
  ],
  PATH_003: [
    "/icons/key_t1.png",
    "/icons/key_t2.png",
    "/icons/key_t3.png",
    "/icons/ring_t1.png",
    "/icons/ring_t2.png",
    "/icons/ring_t3.png",
    "/icons/ring_t4.png",
    "/icons/ring_t5.png",
  ],
  PATH_004: [
    "/icons/scroll_t1.png",
    "/icons/scroll_t2.png",
    "/icons/scroll_t3.png",
    "/icons/scroll_t4.png",
    "/icons/scroll_t5.png",
    "/icons/scroll_t6.png",
    "/icons/scroll_t7.png",
  ],
  PATH_005: [
    "/icons/question.png",
    "/icons/comment.png",
    "/icons/red_flag.png",
    "/icons/gree_flag.png",
    "/icons/thumbs_up.png",
    "/icons/trophy.png",
  ],
  PATH_006: [
    "/icons/shield_t1.png",
    "/icons/shield_t2.png",
    "/icons/cross.png",
    "/icons/fire_t1.png",
    "/icons/fire_t2.png",
    "/icons/fire_t3.png",
    "/icons/fire_t4.png",
    "/icons/leaf_upgrade.png",
  ],
};

const pathProgressCounters: Record<string, number> = {};
const progressionIndexBySkillId: Record<string, number> = {};
sourceSkills
  .slice()
  .sort((a, b) => a.pathId.localeCompare(b.pathId) || a.level - b.level || a.skillId.localeCompare(b.skillId))
  .forEach((skill) => {
    pathProgressCounters[skill.pathId] = pathProgressCounters[skill.pathId] ?? 0;
    progressionIndexBySkillId[skill.skillId] = pathProgressCounters[skill.pathId];
    pathProgressCounters[skill.pathId] += 1;
  });

const getProgressionIcon = (pathId: string, progressionIndex: number): string => {
  const iconSet = pathProgressionIconMap[pathId];
  if (!iconSet || iconSet.length === 0) {
    return iconByPath[pathId] ?? "/icons/question.png";
  }
  const clampedIndex = Math.max(0, Math.min(iconSet.length - 1, progressionIndex));
  return iconSet[clampedIndex];
};

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
    icon: getProgressionIcon(skill.pathId, progressionIndexBySkillId[skill.skillId] ?? 0),
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
