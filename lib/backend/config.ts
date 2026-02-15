// ==========================================
// TREECONOMY BACKEND CONFIGURATION
// Environment and system configuration
// ==========================================

export const config = {
  // Gemini AI Configuration
  gemini: {
    enabled: true, // Flip to true when you want Gemini features back on
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    model: "gemini-2.0-flash-lite", // Stable default model for v1beta generateContent
    maxTokens: 2048,
    temperature: 0.7,
  },

  // CRS Credit API Configuration
  crs: {
    username: process.env.CRS_USERNAME || "",
    password: process.env.CRS_PASSWORD || "",
    environment: process.env.CRS_ENVIRONMENT || "sandbox",
    baseUrl:
      process.env.CRS_BASE_URL ||
      "https://api-sandbox.stitchcredit.com/api",
    timeout: 30000, // 30 seconds
  },

  // Security Configuration
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || "",
    sessionSecret: process.env.SESSION_SECRET || "",
    sessionExpiryHours: 24,
    dataRetentionMinutes: 15, // Delete raw credit data after 15 minutes
  },

  // Game Mechanics Configuration
  game: {
    xpRules: {
      utilizationImprovement: {
        perPoint: 5, // XP per 1% utilization decrease
        threshold: 30, // Target utilization %
        bonus: 50, // Bonus XP for reaching ideal utilization
      },
      scoreIncrease: {
        perPoint: 2, // XP per 1 point score increase
        milestones: {
          650: 100,
          700: 200,
          750: 300,
          800: 500,
        },
      },
      paymentStreak: {
        perMonth: 10, // XP per month of on-time payments
        streakBonus: {
          6: 50,
          12: 150,
          24: 300,
        },
      },
      inquiryReduction: {
        perInquiry: 20, // XP when hard inquiries age off
      },
    },
    tiers: [
      { name: "Sprout I", minXP: 0, shield: "shield-wood-1" },
      { name: "Sprout II", minXP: 80, shield: "shield-wood-2" },
      { name: "Sprout III", minXP: 170, shield: "shield-wood-3" },
      { name: "Guardian I", minXP: 300, shield: "shield-wood-4" },
      { name: "Guardian II", minXP: 450, shield: "shield-wood-5" },
      { name: "Guardian III", minXP: 650, shield: "shield-wood-6" },
      { name: "Warden I", minXP: 900, shield: "shield-wood-7" },
      { name: "Warden II", minXP: 1200, shield: "shield-wood-8" },
      { name: "Warden III", minXP: 1600, shield: "shield-wood-9" },
      { name: "Sentinel I", minXP: 2100, shield: "shield-wood-10" },
      { name: "Sentinel II", minXP: 2800, shield: "shield-wood-11" },
      { name: "Sentinel III", minXP: 3600, shield: "shield-wood-12" },
    ],
  },

  // Identity Verification Thresholds
  identity: {
    minimumCVIScore: 25, // Minimum FlexID CVI score to proceed (0-50 scale)
    requireIdentityCheck: true, // Enforce identity verification before credit pull
  },

  // Application Settings
  app: {
    nodeEnv: process.env.NODE_ENV || "development",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    logLevel: process.env.LOG_LEVEL || "info",
  },
};

// Validation function
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.gemini.enabled && !config.gemini.apiKey) {
    errors.push("Missing GOOGLE_GENERATIVE_AI_API_KEY");
  }

  if (!config.crs.username) {
    errors.push("Missing CRS_USERNAME");
  }

  if (!config.crs.password) {
    errors.push("Missing CRS_PASSWORD");
  }

  if (!config.security.encryptionKey) {
    errors.push("Missing ENCRYPTION_KEY");
  }

  if (!config.security.sessionSecret) {
    errors.push("Missing SESSION_SECRET");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export helper to get current tier
export function getTierByXP(xp: number): (typeof config.game.tiers)[number] {
  const tiers = config.game.tiers;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (xp >= tiers[i].minXP) {
      return tiers[i];
    }
  }
  return tiers[0];
}
