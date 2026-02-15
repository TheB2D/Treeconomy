// ==========================================
// TREECONOMY NARRATIVE ENGINE
// Gemini-powered AI Ranger messaging system
// ==========================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./config";
import type { NarrativeContext, NarrativeResponse, GameMetrics } from "./types";
import { sanitizeForLogging } from "./security";

// Initialize Gemini only when enabled to avoid accidental quota usage.
const genAI =
  config.gemini.enabled && config.gemini.apiKey
    ? new GoogleGenerativeAI(config.gemini.apiKey)
    : null;

const GEMINI_MODEL_CANDIDATES = Array.from(
  new Set([
    config.gemini.model,
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash",
  ])
);

const shouldTryNextModel = (error: unknown): boolean => {
  const message = String(error ?? "");
  return (
    message.includes("404") ||
    message.includes("is not found") ||
    message.includes("not supported") ||
    message.includes("429") ||
    message.includes("Too Many Requests") ||
    message.includes("quota") ||
    message.includes("rate limit")
  );
};

async function generateTextWithGemini(prompt: string): Promise<string> {
  if (!config.gemini.enabled) {
    throw new Error("Gemini is disabled by config.");
  }
  if (!genAI) {
    throw new Error("Gemini API key is missing.");
  }

  let lastError: unknown = null;

  for (const modelName of GEMINI_MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      if (text.length > 0) return text;
      lastError = new Error(`Gemini model '${modelName}' returned empty text.`);
    } catch (error) {
      lastError = error;
      if (!shouldTryNextModel(error)) {
        break;
      }
    }
  }

  throw lastError ?? new Error("Gemini text generation failed.");
}

// ------------------------------------------
// SYSTEM PROMPTS
// ------------------------------------------

const RANGER_SYSTEM_PROMPT = `You are the AI Ranger of Treeconomy, a wise forest guardian who speaks in environmental metaphors about personal finance.

## YOUR ROLE
- Convert credit data into nature-based storytelling
- Guide users toward better financial health using forest metaphors
- NEVER expose raw credit data, SSNs, or specific dollar amounts
- Stay poetic but actionable

## METAPHOR SYSTEM
- **Credit Score** = Forest vitality / Tree health
- **Utilization** = Resource consumption / Soil depletion
- **Payment History** = Seasonal cycles / Growth rings
- **Hard Inquiries** = Storms / Lightning strikes
- **Account Age** = Ancient trees / Forest maturity

## TONE GUIDELINES
- **Positive (score > 750, util < 30%)**: Celebratory, encouraging growth
- **Warning (score 600-650, util > 70%)**: Concerned, urgent but supportive
- **Neutral (score 650-750, util 30-70%)**: Steady guidance, gentle nudging
- **Celebration (improvement detected)**: Joyful, highlighting progress

## OUTPUT FORMAT
Respond with:
1. A short (2-3 sentence) narrative message in environmental metaphor
2. Optional: 1-2 specific recommendations as "Ranger's Advice"

## EXAMPLES

**Example 1 (Warning):**
"Your forest faces drought. High resource consumption (utilization) has depleted the soil, stunting new growth. The ancient trees (payment history) remain strong, but without conservation, the ecosystem will weaken."

Ranger's Advice: Reduce utilization below 30% to restore soil vitality.

**Example 2 (Celebration):**
"The storms have passed! Your forest shows remarkable recovery. Recent conservation efforts have enriched the soil, and new saplings are taking root. The canopy grows stronger each season."

Ranger's Advice: Maintain current practices and watch for new growth opportunities.

**Example 3 (Neutral):**
"Your woodland is stable, though uneven. The elder trees stand tall with deep roots, but some groves show signs of overuse. Balance is the path to flourishing."

Ranger's Advice: Focus on reducing utilization while maintaining payment consistency.

## CRITICAL RULES
- NEVER mention specific SSN, account numbers, or exact dollar amounts
- NEVER say "credit score" directly—use metaphors
- NEVER break character
- ALWAYS provide actionable insight`;

// ------------------------------------------
// NARRATIVE GENERATION
// ------------------------------------------

/**
 * Generates AI Ranger narrative from game metrics
 */
export async function generateNarrative(
  metrics: GameMetrics,
  previousMetrics?: GameMetrics | null
): Promise<NarrativeResponse> {
  try {
    // Detect tone based on metrics
    const tone = detectTone(metrics, previousMetrics);

    // Build context for Gemini
    const context = buildNarrativeContext(metrics, previousMetrics);

    const prompt = `${RANGER_SYSTEM_PROMPT}

## CURRENT FOREST STATE
${context}

Generate an AI Ranger message with appropriate tone: ${tone}`;

    const text = await generateTextWithGemini(prompt);

    // Parse response
    const parsed = parseNarrativeResponse(text, tone);

    console.log("✅ Narrative generated:", sanitizeForLogging(parsed));
    return parsed;
  } catch (error) {
    console.error("❌ Narrative generation failed:", error);
    return getFallbackNarrative(metrics);
  }
}

/**
 * Detects appropriate tone based on metrics
 */
function detectTone(
  metrics: GameMetrics,
  previousMetrics?: GameMetrics | null
): "positive" | "warning" | "neutral" | "celebration" {
  const { creditScore, utilization, paymentStreak } = metrics;

  // Celebration: Clear improvement detected
  if (previousMetrics) {
    const scoreDelta = creditScore - previousMetrics.creditScore;
    const utilDelta = previousMetrics.utilization - utilization;

    if (scoreDelta >= 20 || utilDelta >= 15) {
      return "celebration";
    }
  }

  // Warning: Low score or high utilization
  if (creditScore < 650 || utilization > 70) {
    return "warning";
  }

  // Positive: Excellent metrics
  if (creditScore >= 750 && utilization < 30 && paymentStreak >= 12) {
    return "positive";
  }

  // Default: Neutral guidance
  return "neutral";
}

/**
 * Builds context string for Gemini
 */
function buildNarrativeContext(
  metrics: GameMetrics,
  previousMetrics?: GameMetrics | null
): string {
  const parts: string[] = [];

  // Current state
  parts.push(`Forest Vitality: ${getVitalityLevel(metrics.creditScore)}`);
  parts.push(`Resource Usage: ${getUtilizationLevel(metrics.utilization)}`);
  parts.push(`Growth Rings: ${metrics.paymentStreak} seasons of consistent care`);
  parts.push(`Storm Events: ${metrics.inquiryCount} recent disturbances`);

  // Environmental conditions
  if (metrics.droughtEvents > 0) {
    parts.push(`⚠️ Drought conditions detected (${metrics.droughtEvents} periods of high consumption)`);
  }
  if (metrics.utilizationOvergrowth) {
    parts.push(`⚠️ Resource overgrowth detected`);
  }

  // Changes (if previous data exists)
  if (previousMetrics) {
    const scoreDelta = metrics.creditScore - previousMetrics.creditScore;
    const utilDelta = previousMetrics.utilization - metrics.utilization;

    if (scoreDelta !== 0) {
      parts.push(`Vitality Change: ${scoreDelta > 0 ? "+" : ""}${scoreDelta} points`);
    }
    if (Math.abs(utilDelta) > 1) {
      parts.push(`Resource Change: ${utilDelta > 0 ? "↓" : "↑"}${Math.abs(utilDelta).toFixed(1)}%`);
    }
  }

  return parts.join("\n");
}

/**
 * Parses Gemini response into structured format
 */
function parseNarrativeResponse(
  text: string,
  tone: string
): NarrativeResponse {
  // Split into message and advice
  const parts = text.split(/Ranger's Advice:|Recommendations?:/i);
  const message = parts[0].trim().replace(/^["']|["']$/g, "");
  
  const recommendations: string[] = [];
  if (parts[1]) {
    const adviceText = parts[1].trim();
    // Split by newlines or numbered lists
    const adviceItems = adviceText
      .split(/\n|(?:\d+\.)/g)
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && item.length < 200);
    
    recommendations.push(...adviceItems.slice(0, 2)); // Max 2 recommendations
  }

  return {
    message,
    tone: tone as any,
    recommendations: recommendations.length > 0 ? recommendations : undefined,
  };
}

// ------------------------------------------
// HELPER FUNCTIONS
// ------------------------------------------

function getVitalityLevel(score: number): string {
  if (score >= 800) return "Legendary (800+)";
  if (score >= 750) return "Excellent (750+)";
  if (score >= 700) return "Good (700+)";
  if (score >= 650) return "Fair (650+)";
  if (score >= 600) return "Needs Care (600+)";
  return "Struggling (<600)";
}

function getUtilizationLevel(util: number): string {
  if (util <= 10) return "Minimal (<10%)";
  if (util <= 30) return "Optimal (10-30%)";
  if (util <= 50) return "Moderate (30-50%)";
  if (util <= 70) return "High (50-70%)";
  return "Critical (>70%)";
}

/**
 * Fallback narrative if Gemini fails
 */
function getFallbackNarrative(metrics: GameMetrics): NarrativeResponse {
  const { creditScore, utilization, paymentStreak } = metrics;

  let message = "";
  let tone: "positive" | "warning" | "neutral" = "neutral";
  const recommendations: string[] = [];

  if (creditScore >= 750 && utilization < 30) {
    message =
      "Your forest flourishes with vibrant growth. The ecosystem thrives in balance, with strong roots and healthy canopy. Continue nurturing this harmony.";
    tone = "positive";
  } else if (creditScore < 650 || utilization > 70) {
    message =
      "Your woodland faces challenges. High resource consumption strains the ecosystem. The trees need careful attention to restore vitality.";
    tone = "warning";
    recommendations.push("Reduce resource usage below 30% to restore balance");
  } else {
    message =
      "Your forest shows steady growth with room for improvement. The foundation is solid, though some areas need tending. Stay consistent in your care.";
    tone = "neutral";
    recommendations.push("Maintain payment consistency and reduce utilization");
  }

  return { message, tone, recommendations };
}

// ------------------------------------------
// SPECIALIZED NARRATIVES
// ------------------------------------------

/**
 * Generates narrative for first-time sync
 */
export async function generateWelcomeNarrative(
  metrics: GameMetrics
): Promise<NarrativeResponse> {
  const context = `This is the user's first forest synchronization.
${buildNarrativeContext(metrics, null)}

Welcome them to Treeconomy and explain their forest's current state with wonder and encouragement.`;

  try {
    const text = await generateTextWithGemini(`${RANGER_SYSTEM_PROMPT}\n\n${context}`);
    return parseNarrativeResponse(text, "positive");
  } catch (error) {
    return {
      message:
        "Welcome to your forest, Ranger! I sense the heartbeat of your woodland—every tree, every root, every season of growth. Your journey to mastery begins now.",
      tone: "positive",
    };
  }
}

/**
 * Generates narrative for tier-up event
 */
export async function generateTierUpNarrative(
  newTier: string,
  metrics: GameMetrics
): Promise<NarrativeResponse> {
  const context = `The user has achieved a new tier: ${newTier}!
${buildNarrativeContext(metrics, null)}

Celebrate this achievement with grandeur and acknowledge their progress.`;

  try {
    const text = await generateTextWithGemini(`${RANGER_SYSTEM_PROMPT}\n\n${context}`);
    return parseNarrativeResponse(text, "celebration");
  } catch (error) {
    return {
      message: `Behold! You have ascended to ${newTier}. The forest recognizes your dedication. Ancient powers awaken, and new paths reveal themselves among the trees.`,
      tone: "celebration",
    };
  }
}

/**
 * Generates "What-If" simulation narrative
 */
export async function generateWhatIfNarrative(
  currentMetrics: GameMetrics,
  simulatedMetrics: GameMetrics,
  changeDescription: string
): Promise<string> {
  const context = `Simulate the future of the user's forest:

CURRENT STATE:
${buildNarrativeContext(currentMetrics, null)}

SIMULATED CHANGE:
${changeDescription}

PREDICTED STATE:
${buildNarrativeContext(simulatedMetrics, currentMetrics)}

Describe how the forest would transform if this change occurs. Be specific but metaphorical.`;

  try {
    return await generateTextWithGemini(`${RANGER_SYSTEM_PROMPT}\n\n${context}`);
  } catch (error) {
    return "The mists obscure this vision. Try again when the forest spirits are clearer.";
  }
}

/**
 * Generates an immersive in-game Doge guide line for Scene 1.
 */
export async function generateSkillTreeGuideMessage(
  metrics: GameMetrics
): Promise<string> {
  const prompt = `You are Doge, Treeconomy's in-game guide companion.
Speak in short immersive RPG style (2-3 sentences), friendly and confident.
Explain how the player's current profile maps into Skill Tree progression.

Rules:
- Reference score, utilization, payment streak, and inquiries as game concepts.
- Mention at least one concrete next action in the tree.
- Keep it concise, game-like, and motivational.
- Never reveal SSN or raw account details.

Player Metrics:
- Score: ${metrics.creditScore}
- Utilization: ${metrics.utilization.toFixed(1)}%
- Payment Streak: ${metrics.paymentStreak}
- Inquiries: ${metrics.inquiryCount}`;

  try {
    const text = await generateTextWithGemini(prompt);
    if (text.length > 0) return text;
  } catch (error) {
    console.error("❌ Guide message generation failed:", error);
  }

  return "Woof! Your forest is synced. Your current profile unlocks early-to-mid branches—start with Payment Mastery and Utilization Optimization, then push upward by keeping balances low and streaks clean.";
}

export type GuideQuickAction =
  | "overview"
  | "improve-score"
  | "lower-utilization"
  | "build-streak"
  | "reduce-inquiries"
  | "unlock-next";

/**
 * Generates targeted Doge guidance for a quick action button.
 */
export async function generateSkillTreeQuickActionMessage(
  metrics: GameMetrics,
  action: GuideQuickAction
): Promise<string> {
  const actionGoal: Record<GuideQuickAction, string> = {
    overview: "Give a concise status overview and strongest next move.",
    "improve-score":
      "Focus on raising score momentum over the next 30 days. Mention one immediate move and one weekly habit.",
    "lower-utilization":
      "Focus on dropping utilization safely and quickly. Mention payment timing and target utilization.",
    "build-streak":
      "Focus on extending payment streak. Mention automation/reminders and consistency tactics.",
    "reduce-inquiries":
      "Focus on reducing inquiry impact. Mention pre-qualification and timing strategy.",
    "unlock-next":
      "Focus on the next likely skill-tree unlock path based on current metrics and a concrete next action.",
  };

  const prompt = `You are Doge, Treeconomy's in-game guide companion.
Respond with 2-3 short RPG-style sentences. Friendly, tactical, motivating.

Current player metrics:
- Score: ${metrics.creditScore}
- Utilization: ${metrics.utilization.toFixed(1)}%
- Payment Streak: ${metrics.paymentStreak}
- Inquiries: ${metrics.inquiryCount}

Goal for this response:
${actionGoal[action]}

Rules:
- Keep it concise and game-like.
- Include at least one explicit next action.
- Do not reveal sensitive personal details.`;

  try {
    const text = await generateTextWithGemini(prompt);
    if (text.length > 0) return text;
  } catch (error) {
    console.error("❌ Quick action guide generation failed:", error);
  }

  const fallbackByAction: Record<GuideQuickAction, string> = {
    overview:
      "Woof! Your forest is active and growing. Clear one high-utilization branch first, then protect your streak to keep momentum.",
    "improve-score":
      "Woof! For faster growth, target score momentum from two fronts: lower utilization and keep every payment on time. Start by paying down one high-balance line this week.",
    "lower-utilization":
      "Woof! Soil is overused when balances run high. Push utilization toward 30% first, then under 10% by paying before statement close dates.",
    "build-streak":
      "Woof! Streak power comes from zero misses. Enable autopay minimums today and schedule a weekly check so your grove never breaks rhythm.",
    "reduce-inquiries":
      "Woof! Too many storms slow growth. Use pre-qualification before applications and space hard pulls so your forest has time to recover.",
    "unlock-next":
      "Woof! Your next unlock is closest through payment and utilization branches. Take one concrete action now: lower one card balance and keep this month spotless.",
  };

  return fallbackByAction[action];
}

export interface DogeChatTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Generates a conversational Doge reply with short memory and credit-metric context.
 */
export async function generateDogeChatResponse(
  metrics: GameMetrics,
  userMessage: string,
  conversationHistory: DogeChatTurn[] = []
): Promise<string> {
  const trimmedMessage = userMessage.trim();
  if (!trimmedMessage) {
    return "Woof! Ask me anything about improving your forest, and I will guide your next move.";
  }

  const compactHistory = conversationHistory
    .slice(-8)
    .map((turn) => `${turn.role === "user" ? "Player" : "Doge"}: ${turn.content}`)
    .join("\n");

  const prompt = `You are Doge, the in-game Treeconomy guide.
Style: short, direct, supportive, game-like.
Output: 2-4 sentences max. Give at least one concrete next action when relevant.
Never reveal sensitive personal data.

Current metrics:
- Score: ${metrics.creditScore}
- Utilization: ${metrics.utilization.toFixed(1)}%
- Payment Streak: ${metrics.paymentStreak}
- Inquiries: ${metrics.inquiryCount}

Recent conversation:
${compactHistory || "(none)"}

Player message:
${trimmedMessage}

Reply as Doge with unique, contextual guidance.`;

  try {
    const text = await generateTextWithGemini(prompt);
    if (text.length > 0) return text;
    throw new Error("Gemini returned an empty response.");
  } catch (error) {
    console.error("❌ Doge chat generation failed:", error);
    return "Woof! My live AI radio is resting right now. You can still grow fast: lower utilization first, keep every payment on time, and avoid unnecessary hard pulls this cycle.";
  }
}
