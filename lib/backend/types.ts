// ==========================================
// TREECONOMY BACKEND TYPES
// Core type definitions for the AI Credit Orchestrator
// ==========================================

// ------------------------------------------
// CREDIT DATA TYPES (From CRS API)
// ------------------------------------------

export interface CreditAddress {
  borrowerResidencyType?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface CreditRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  ssn: string;
  birthDate: string; // YYYY-MM-DD
  addresses: CreditAddress[];
}

export interface CreditTradeline {
  accountNumber?: string;
  accountType?: string;
  balance?: number;
  creditLimit?: number;
  paymentStatus?: string;
  monthsReviewed?: number;
  dateOpened?: string;
}

export interface CreditInquiry {
  inquiryDate?: string;
  inquiryType?: string;
  subscriberName?: string;
}

export interface CreditScore {
  score: number;
  scoreFactors?: string[];
  scoreModel?: string;
}

export interface CreditReportResponse {
  requestId: string;
  creditScore?: CreditScore;
  tradelines?: CreditTradeline[];
  inquiries?: CreditInquiry[];
  utilization?: number;
  onTimePaymentPercent?: number;
  totalAccounts?: number;
  openAccounts?: number;
  rawPayload?: unknown;
}

// ------------------------------------------
// IDENTITY VERIFICATION TYPES (FlexID)
// ------------------------------------------

export interface FlexIDRequest {
  firstName: string;
  lastName: string;
  ssn: string;
  birthDate: string;
  addresses: CreditAddress[];
}

export interface FlexIDResponse {
  requestId: string;
  cviScore: number; // 0-50, higher is better
  riskIndicators?: string[];
  verified: boolean;
}

// ------------------------------------------
// TREECONOMY GAME STATE TYPES
// ------------------------------------------

export interface GameState {
  userId: string;
  forestHealth: number; // 0-100
  xp: number;
  tier: string;
  unlockedSkills: string[];
  metrics: GameMetrics;
  lastSync: string; // ISO timestamp
}

export interface GameMetrics {
  creditScore: number;
  utilization: number;
  paymentStreak: number;
  inquiryCount: number;
  droughtEvents: number; // High utilization periods
  stormEvents: number; // Hard inquiry spikes
  utilizationOvergrowth: boolean;
}

export interface SkillUnlock {
  skillId: string;
  name: string;
  xpAwarded: number;
  tier: number;
  unlockedAt: string;
}

export interface XPEvent {
  type: "utilization_improvement" | "score_increase" | "payment_streak" | "inquiry_reduction";
  amount: number;
  reason: string;
  timestamp: string;
}

// ------------------------------------------
// AI NARRATIVE TYPES
// ------------------------------------------

export interface NarrativeContext {
  creditScore: number;
  utilization: number;
  inquiries: number;
  onTimePayments: number;
  recentChanges?: {
    scoreDelta?: number;
    utilizationDelta?: number;
  };
}

export interface NarrativeResponse {
  message: string;
  tone: "positive" | "warning" | "neutral" | "celebration";
  recommendations?: string[];
}

// ------------------------------------------
// ORCHESTRATOR TYPES
// ------------------------------------------

export interface CreditOrchestrationRequest {
  userId: string;
  bureau: "experian" | "transunion" | "equifax";
  personalInfo: CreditRequest;
  includeIdentityCheck?: boolean;
}

export interface CreditOrchestrationResponse {
  success: boolean;
  gameState?: GameState;
  narrative?: NarrativeResponse;
  guideMessage?: string;
  newUnlocks?: SkillUnlock[];
  xpEvents?: XPEvent[];
  error?: string;
}

// ------------------------------------------
// SESSION & SECURITY TYPES
// ------------------------------------------

export interface UserSession {
  userId: string;
  sessionToken: string;
  consentGranted: boolean;
  consentTimestamp?: string;
  expiresAt: string;
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

// ------------------------------------------
// MCP TOOL TYPES
// ------------------------------------------

export interface MCPToolCall {
  toolName: string;
  parameters: Record<string, any>;
}

export interface MCPToolResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// ------------------------------------------
// BUREAU CONFIGURATION
// ------------------------------------------

export type BureauType = "experian" | "transunion" | "equifax";

export interface BureauConfig {
  name: string;
  endpoint: string;
  scoreModel: string;
  features: string[];
}

export const BUREAU_CONFIGS: Record<BureauType, BureauConfig> = {
  experian: {
    name: "Experian",
    endpoint: "/experian/credit-profile/credit-report/standard/exp-prequal-vantage4",
    scoreModel: "VantageScore 4.0",
    features: ["tradelines", "inquiries", "publicRecords"]
  },
  transunion: {
    name: "TransUnion",
    endpoint: "/transunion/credit-report/standard/tu-prequal-vantage4",
    scoreModel: "VantageScore 4.0 + FICO Auto 8",
    features: ["tradelines", "inquiries", "multipleScores"]
  },
  equifax: {
    name: "Equifax",
    endpoint: "/equifax/credit-report/standard/efx-prequal-vantage4",
    scoreModel: "VantageScore 4.0",
    features: ["tradelines", "inquiries"]
  }
};
