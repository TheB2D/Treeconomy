// ==========================================
// TREECONOMY GAME STATE ENGINE
// XP calculation, skill unlocking, and tier progression
// ==========================================

import { config, getTierByXP } from "./config";
import type {
  GameState,
  GameMetrics,
  SkillUnlock,
  XPEvent,
  CreditReportResponse,
} from "./types";

// ------------------------------------------
// XP CALCULATION ENGINE
// ------------------------------------------

/**
 * Calculates XP events based on credit report changes
 */
export function calculateXPEvents(
  currentMetrics: GameMetrics,
  previousMetrics: GameMetrics | null
): XPEvent[] {
  const events: XPEvent[] = [];
  const rules = config.game.xpRules;

  // First time sync - award base XP for current state
  if (!previousMetrics) {
    if (currentMetrics.utilization <= rules.utilizationImprovement.threshold) {
      events.push({
        type: "utilization_improvement",
        amount: rules.utilizationImprovement.bonus,
        reason: "Excellent utilization maintained",
        timestamp: new Date().toISOString(),
      });
    }

    if (currentMetrics.paymentStreak >= 6) {
      events.push({
        type: "payment_streak",
        amount: currentMetrics.paymentStreak * rules.paymentStreak.perMonth,
        reason: `${currentMetrics.paymentStreak} months of on-time payments`,
        timestamp: new Date().toISOString(),
      });
    }

    return events;
  }

  // UTILIZATION IMPROVEMENT
  const utilizationDelta =
    previousMetrics.utilization - currentMetrics.utilization;
  if (utilizationDelta > 0) {
    const xp = Math.floor(utilizationDelta * rules.utilizationImprovement.perPoint);
    events.push({
      type: "utilization_improvement",
      amount: xp,
      reason: `Reduced utilization by ${utilizationDelta.toFixed(1)}%`,
      timestamp: new Date().toISOString(),
    });

    // Bonus for reaching ideal utilization
    if (
      currentMetrics.utilization <= rules.utilizationImprovement.threshold &&
      previousMetrics.utilization > rules.utilizationImprovement.threshold
    ) {
      events.push({
        type: "utilization_improvement",
        amount: rules.utilizationImprovement.bonus,
        reason: "Achieved ideal utilization level!",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // CREDIT SCORE INCREASE
  const scoreDelta = currentMetrics.creditScore - previousMetrics.creditScore;
  if (scoreDelta > 0) {
    const xp = Math.floor(scoreDelta * rules.scoreIncrease.perPoint);
    events.push({
      type: "score_increase",
      amount: xp,
      reason: `Credit score increased by ${scoreDelta} points`,
      timestamp: new Date().toISOString(),
    });

    // Check milestone bonuses
    for (const [milestone, bonus] of Object.entries(
      rules.scoreIncrease.milestones
    )) {
      const milestoneScore = parseInt(milestone);
      if (
        currentMetrics.creditScore >= milestoneScore &&
        previousMetrics.creditScore < milestoneScore
      ) {
        events.push({
          type: "score_increase",
          amount: bonus,
          reason: `Reached ${milestoneScore} credit score milestone!`,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  // PAYMENT STREAK
  if (currentMetrics.paymentStreak > previousMetrics.paymentStreak) {
    const streakIncrease =
      currentMetrics.paymentStreak - previousMetrics.paymentStreak;
    const xp = streakIncrease * rules.paymentStreak.perMonth;
    events.push({
      type: "payment_streak",
      amount: xp,
      reason: `Extended payment streak to ${currentMetrics.paymentStreak} months`,
      timestamp: new Date().toISOString(),
    });

    // Streak bonuses
    for (const [months, bonus] of Object.entries(
      rules.paymentStreak.streakBonus
    )) {
      const monthsNum = parseInt(months);
      if (
        currentMetrics.paymentStreak >= monthsNum &&
        previousMetrics.paymentStreak < monthsNum
      ) {
        events.push({
          type: "payment_streak",
          amount: bonus,
          reason: `${monthsNum}-month payment streak achieved!`,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  // INQUIRY REDUCTION
  if (currentMetrics.inquiryCount < previousMetrics.inquiryCount) {
    const inquiryReduction =
      previousMetrics.inquiryCount - currentMetrics.inquiryCount;
    const xp = inquiryReduction * rules.inquiryReduction.perInquiry;
    events.push({
      type: "inquiry_reduction",
      amount: xp,
      reason: `${inquiryReduction} hard inquiries aged off`,
      timestamp: new Date().toISOString(),
    });
  }

  return events;
}

/**
 * Calculates total XP from events
 */
export function calculateTotalXP(events: XPEvent[]): number {
  return events.reduce((total, event) => total + event.amount, 0);
}

// ------------------------------------------
// SKILL UNLOCK ENGINE
// ------------------------------------------

interface SkillRule {
  skillId: string;
  name: string;
  tier: number;
  xpReward: number;
  conditions: (metrics: GameMetrics) => boolean;
}

const SKILL_UNLOCK_RULES: SkillRule[] = [
  // TIER 1 - Beginner Skills
  {
    skillId: "credit-basics",
    name: "Credit Basics Mastery",
    tier: 1,
    xpReward: 20,
    conditions: (m) => m.creditScore > 0,
  },
  {
    skillId: "first-sync",
    name: "Forest Awakening",
    tier: 1,
    xpReward: 30,
    conditions: (m) => m.creditScore > 0,
  },

  // TIER 2 - Utilization Control
  {
    skillId: "util-opt-1",
    name: "Utilization Awareness",
    tier: 2,
    xpReward: 40,
    conditions: (m) => m.utilization < 50,
  },
  {
    skillId: "util-opt-2",
    name: "Utilization Optimization",
    tier: 2,
    xpReward: 50,
    conditions: (m) => m.utilization < 30,
  },
  {
    skillId: "util-master",
    name: "Utilization Master",
    tier: 3,
    xpReward: 100,
    conditions: (m) => m.utilization < 10,
  },

  // TIER 2-3 - Payment Consistency
  {
    skillId: "payment-streak-1",
    name: "Payment Discipline",
    tier: 2,
    xpReward: 40,
    conditions: (m) => m.paymentStreak >= 3,
  },
  {
    skillId: "payment-streak-2",
    name: "Payment Excellence",
    tier: 3,
    xpReward: 75,
    conditions: (m) => m.paymentStreak >= 6,
  },
  {
    skillId: "payment-streak-3",
    name: "Payment Legend",
    tier: 4,
    xpReward: 150,
    conditions: (m) => m.paymentStreak >= 12,
  },

  // TIER 3-4 - Credit Score Milestones
  {
    skillId: "score-650",
    name: "Fair Credit Achievement",
    tier: 2,
    xpReward: 50,
    conditions: (m) => m.creditScore >= 650,
  },
  {
    skillId: "score-700",
    name: "Good Credit Achievement",
    tier: 3,
    xpReward: 100,
    conditions: (m) => m.creditScore >= 700,
  },
  {
    skillId: "score-750",
    name: "Excellent Credit Achievement",
    tier: 4,
    xpReward: 200,
    conditions: (m) => m.creditScore >= 750,
  },
  {
    skillId: "score-800",
    name: "Elite Credit Achievement",
    tier: 5,
    xpReward: 400,
    conditions: (m) => m.creditScore >= 800,
  },

  // TIER 3-4 - Inquiry Management
  {
    skillId: "inquiry-control",
    name: "Inquiry Awareness",
    tier: 2,
    xpReward: 30,
    conditions: (m) => m.inquiryCount <= 3,
  },
  {
    skillId: "inquiry-master",
    name: "Inquiry Mastery",
    tier: 3,
    xpReward: 75,
    conditions: (m) => m.inquiryCount === 0,
  },

  // TIER 5 - Advanced Mastery
  {
    skillId: "credit-master",
    name: "Credit Master",
    tier: 5,
    xpReward: 250,
    conditions: (m) =>
      m.creditScore >= 750 && m.utilization < 20 && m.paymentStreak >= 12,
  },
  {
    skillId: "forest-sage",
    name: "Forest Sage",
    tier: 6,
    xpReward: 500,
    conditions: (m) =>
      m.creditScore >= 800 && m.utilization < 10 && m.paymentStreak >= 24,
  },
];

/**
 * Checks which new skills should be unlocked based on current metrics
 */
export function checkSkillUnlocks(
  currentMetrics: GameMetrics,
  alreadyUnlocked: string[]
): SkillUnlock[] {
  const newUnlocks: SkillUnlock[] = [];
  const now = new Date().toISOString();

  for (const rule of SKILL_UNLOCK_RULES) {
    // Skip if already unlocked
    if (alreadyUnlocked.includes(rule.skillId)) {
      continue;
    }

    // Check if conditions are met
    if (rule.conditions(currentMetrics)) {
      newUnlocks.push({
        skillId: rule.skillId,
        name: rule.name,
        xpAwarded: rule.xpReward,
        tier: rule.tier,
        unlockedAt: now,
      });
    }
  }

  return newUnlocks;
}

// ------------------------------------------
// GAME METRICS CALCULATION
// ------------------------------------------

/**
 * Transforms credit report into game metrics
 */
export function creditReportToGameMetrics(
  report: CreditReportResponse
): GameMetrics {
  const utilization = report.utilization || 0;
  const inquiryCount = report.inquiries?.length || 0;

  // Calculate payment streak (months of 100% on-time payments)
  const onTimePercent = report.onTimePaymentPercent || 0;
  const paymentStreak = onTimePercent >= 95 ? Math.floor(onTimePercent / 4) : 0; // Rough estimate

  // Environmental event detection
  const droughtEvents = utilization > 70 ? Math.floor(utilization / 20) : 0;
  const stormEvents = inquiryCount > 5 ? 1 : 0;
  const utilizationOvergrowth = utilization > 50;

  return {
    creditScore: report.creditScore?.score || 0,
    utilization,
    paymentStreak,
    inquiryCount,
    droughtEvents,
    stormEvents,
    utilizationOvergrowth,
  };
}

/**
 * Calculates overall forest health score (0-100)
 */
export function calculateForestHealth(metrics: GameMetrics): number {
  let health = 50; // Start neutral

  // Credit Score Impact (±30 points)
  if (metrics.creditScore >= 800) health += 30;
  else if (metrics.creditScore >= 750) health += 25;
  else if (metrics.creditScore >= 700) health += 15;
  else if (metrics.creditScore >= 650) health += 5;
  else if (metrics.creditScore < 600) health -= 20;

  // Utilization Impact (±25 points)
  if (metrics.utilization <= 10) health += 25;
  else if (metrics.utilization <= 30) health += 15;
  else if (metrics.utilization <= 50) health += 5;
  else if (metrics.utilization > 70) health -= 15;
  else if (metrics.utilization > 90) health -= 25;

  // Payment Streak Impact (±20 points)
  if (metrics.paymentStreak >= 24) health += 20;
  else if (metrics.paymentStreak >= 12) health += 15;
  else if (metrics.paymentStreak >= 6) health += 10;
  else health -= 10;

  // Inquiry Impact (±15 points)
  if (metrics.inquiryCount === 0) health += 15;
  else if (metrics.inquiryCount <= 2) health += 5;
  else if (metrics.inquiryCount > 5) health -= 10;

  // Clamp to 0-100
  return Math.max(0, Math.min(100, health));
}

// ------------------------------------------
// GAME STATE UPDATE
// ------------------------------------------

/**
 * Updates game state with new credit report data
 */
export function updateGameState(
  currentState: GameState | null,
  newReport: CreditReportResponse,
  userId: string
): {
  gameState: GameState;
  xpEvents: XPEvent[];
  newUnlocks: SkillUnlock[];
  tierUp: boolean;
} {
  const newMetrics = creditReportToGameMetrics(newReport);
  const previousMetrics = currentState?.metrics || null;

  // Calculate XP events
  const xpEvents = calculateXPEvents(newMetrics, previousMetrics);
  const xpGained = calculateTotalXP(xpEvents);

  // Calculate new total XP
  const currentXP = currentState?.xp || 0;
  const newXP = currentXP + xpGained;

  // Check skill unlocks
  const alreadyUnlocked = currentState?.unlockedSkills || [];
  const newUnlocks = checkSkillUnlocks(newMetrics, alreadyUnlocked);
  
  // Add XP from unlocks
  const unlockXP = newUnlocks.reduce((sum, unlock) => sum + unlock.xpAwarded, 0);
  const totalXP = newXP + unlockXP;

  // Determine tier
  const previousTier = currentState?.tier || "";
  const currentTier = getTierByXP(totalXP);
  const tierUp = currentTier.name !== previousTier;

  // Calculate forest health
  const forestHealth = calculateForestHealth(newMetrics);

  // Create updated game state
  const gameState: GameState = {
    userId,
    forestHealth,
    xp: totalXP,
    tier: currentTier.name,
    unlockedSkills: [...alreadyUnlocked, ...newUnlocks.map((u) => u.skillId)],
    metrics: newMetrics,
    lastSync: new Date().toISOString(),
  };

  return {
    gameState,
    xpEvents,
    newUnlocks,
    tierUp,
  };
}

/**
 * Gets XP required for next tier
 */
export function getXPToNextTier(currentXP: number): {
  current: string;
  next: string | null;
  xpNeeded: number;
  progress: number;
} {
  const currentTier = getTierByXP(currentXP);
  const currentIndex = config.game.tiers.findIndex(
    (t) => t.name === currentTier.name
  );
  const nextTier =
    currentIndex < config.game.tiers.length - 1
      ? config.game.tiers[currentIndex + 1]
      : null;

  if (!nextTier) {
    return {
      current: currentTier.name,
      next: null,
      xpNeeded: 0,
      progress: 100,
    };
  }

  const xpNeeded = nextTier.minXP - currentXP;
  const tierRange = nextTier.minXP - currentTier.minXP;
  const tierProgress = currentXP - currentTier.minXP;
  const progress = (tierProgress / tierRange) * 100;

  return {
    current: currentTier.name,
    next: nextTier.name,
    xpNeeded,
    progress: Math.min(100, Math.max(0, progress)),
  };
}
