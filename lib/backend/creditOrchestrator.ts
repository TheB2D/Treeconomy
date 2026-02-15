// ==========================================
// TREECONOMY CREDIT ORCHESTRATOR
// Main orchestration layer: Gemini + CRS Credit API + Game Engine
// ==========================================

import axios, { AxiosInstance } from "axios";
import { config } from "./config";
import {
  encrypt,
  decrypt,
  sanitizeForLogging,
  validateEnvironment,
  storeTemporary,
  retrieveTemporary,
  deleteTemporary,
} from "./security";
import { updateGameState } from "./gameStateEngine";
import {
  generateSceneTwoEnvironmentalNarrative,
  generateSkillTreeGuideMessage,
} from "./narrativeEngine";
import type {
  CreditRequest,
  CreditReportResponse,
  FlexIDRequest,
  FlexIDResponse,
  CreditOrchestrationRequest,
  CreditOrchestrationResponse,
  GameState,
  BureauType,
} from "./types";
import { BUREAU_CONFIGS } from "./types";

function isFlexIdProductUnavailable(error: any): boolean {
  const codes = Array.isArray(error?.response?.data?.codes) ? error.response.data.codes : [];
  const message = String(error?.response?.data?.messages?.[0] || error?.message || "");
  return (
    codes.includes("CRS102") ||
    /required configuration for this product is not available/i.test(message)
  );
}

// ------------------------------------------
// CRS API CLIENT
// ------------------------------------------

class CRSApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    // Debug logging
    console.log("🔧 CRS API Client Configuration:");
    console.log("  - Username:", config.crs.username ? `✅ Set (${config.crs.username})` : "❌ Missing");
    console.log("  - Password:", config.crs.password ? `✅ Set (length: ${config.crs.password.length})` : "❌ Missing");
    console.log("  - Base URL:", config.crs.baseUrl);
    console.log("  - Environment:", config.crs.environment);

    this.client = axios.create({
      baseURL: config.crs.baseUrl,
      timeout: config.crs.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ CRS API Success: ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`❌ CRS API Error: ${error.config?.url}`);
        console.error(`   Status: ${error.response?.status}`);
        console.error(`   Message: ${error.message}`);
        if (error.response?.status === 401) {
          console.error(`   🔑 Authentication failed! Token may have expired.`);
        }
        console.error(`   Response:`, sanitizeForLogging(error.response?.data));
        return Promise.reject(error);
      }
    );
  }

  /**
   * Login to CRS API and get authentication token
   */
  private async login(): Promise<string> {
    console.log("🔐 Logging in to CRS API...");

    try {
      const response = await this.client.post("/users/login", {
        username: config.crs.username,
        password: config.crs.password,
      });

      const token = response.data.token || response.data.accessToken || response.headers['authorization'];
      
      if (!token) {
        console.error("❌ No token in login response:", response.data);
        throw new Error("Login successful but no token received");
      }

      this.authToken = String(token).replace(/^Bearer\s+/i, "");
      this.tokenExpiry = Date.now() + (55 * 60 * 1000); // 55 minutes (assuming 60min expiry)
      
      console.log("✅ Login successful! Token obtained.");
      return token;
    } catch (error: any) {
      console.error("❌ Login failed:", error.response?.data || error.message);
      throw new Error(`CRS login failed: ${error.message}`);
    }
  }

  /**
   * Ensures we have a valid auth token
   */
  private async ensureAuthenticated(): Promise<string> {
    // If we have a token and it's not expired, use it
    if (this.authToken && Date.now() < this.tokenExpiry) {
      return this.authToken;
    }

    // Otherwise, login to get a new token
    return await this.login();
  }

  /**
   * Pulls credit report from specified bureau
   */
  async pullCreditReport(
    bureau: BureauType,
    request: CreditRequest
  ): Promise<CreditReportResponse> {
    // Validate environment vs SSN
    const envCheck = validateEnvironment(request.ssn);
    if (!envCheck.valid) {
      throw new Error(envCheck.error);
    }

    // Ensure we're authenticated
    const token = await this.ensureAuthenticated();

    const bureauConfig = BUREAU_CONFIGS[bureau];
    const endpoint = bureauConfig.endpoint;

    console.log(`📊 Pulling ${bureauConfig.name} credit report...`);

    try {
      const requestBody = this.buildCreditReportRequestBody(bureau, request);
      const response = await this.client.post(endpoint, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const sandboxFallback = this.getSandboxProfileFromSSN(request.ssn);
      const raw = response.data || {};

      // Extract request ID from response headers
      const requestId =
        response.headers["x-request-id"] ||
        raw.requestId ||
        `req_${Date.now()}`;

      // Parse response into standardized format.
      const parsed = this.parseCreditReportResponse(raw, bureau, sandboxFallback);
      const creditReport: CreditReportResponse = {
        requestId,
        ...parsed,
        rawPayload: raw,
      };

      // Store temporarily (will be deleted after transformation)
      storeTemporary(requestId, creditReport, 15, "credit_report");

      console.log(`✅ Credit report retrieved: ${requestId}`);
      return creditReport;
    } catch (error: any) {
      throw new Error(
        `Failed to pull ${bureauConfig.name} report: ${error.message}`
      );
    }
  }

  /**
   * Performs identity verification via FlexID
   */
  async verifyIdentity(request: FlexIDRequest): Promise<FlexIDResponse> {
    // Ensure we're authenticated
    const token = await this.ensureAuthenticated();

    const endpoint = "/flex-id/standard";

    console.log("🔐 Verifying identity via FlexID...");

    try {
      const response = await this.client.post(endpoint, request, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const requestId =
        response.headers["x-request-id"] ||
        response.data.requestId ||
        `flexid_${Date.now()}`;

      const flexIdResponse: FlexIDResponse = {
        requestId,
        cviScore: response.data.cviScore || 0,
        riskIndicators: response.data.riskIndicators || [],
        verified:
          response.data.cviScore >= config.identity.minimumCVIScore,
      };

      console.log(`✅ Identity verification complete: CVI ${flexIdResponse.cviScore}`);
      return flexIdResponse;
    } catch (error: any) {
      throw new Error(`Identity verification failed: ${error.message}`);
    }
  }

  /**
   * Calculates utilization from tradelines if not provided
   */
  private calculateUtilization(data: any): number {
    if (!data.tradelines || data.tradelines.length === 0) {
      return 0;
    }

    let totalBalance = 0;
    let totalLimit = 0;

    for (const tradeline of data.tradelines) {
      if (tradeline.creditLimit && tradeline.balance) {
        totalBalance += tradeline.balance;
        totalLimit += tradeline.creditLimit;
      }
    }

    return totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;
  }

  private buildCreditReportRequestBody(bureau: BureauType, request: CreditRequest): Record<string, unknown> {
    const normalizedRequestData = {
      firstName: request.firstName,
      middleName: request.middleName || "",
      lastName: request.lastName,
      suffix: request.suffix || "",
      birthDate: request.birthDate,
      ssn: request.ssn,
      addresses: (request.addresses || []).map((address) => ({
        borrowerResidencyType: address.borrowerResidencyType || "Current",
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || "",
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
      })),
    };

    // TransUnion prequal endpoint expects requestData envelope and repository flags.
    if (bureau === "transunion") {
      return {
        requestData: normalizedRequestData,
        repositoryIncluded: {
          transunion: true,
          experian: false,
          equifax: false,
        },
      };
    }

    return normalizedRequestData;
  }

  private parseCreditReportResponse(
    raw: any,
    bureau: BureauType,
    sandboxFallback: {
      creditScore: number;
      utilization: number;
      onTimePaymentPercent: number;
      inquiryCount: number;
      totalAccounts: number;
      openAccounts: number;
    }
  ): Omit<CreditReportResponse, "requestId"> {
    const parsedTradelines = this.parseTradelines(raw);
    const parsedInquiries = this.parseInquiries(raw);
    const parsedScore = this.extractScore(raw);
    const parsedUtilization = this.extractUtilization(raw, parsedTradelines);
    const onTimePaymentPercent = this.deriveOnTimePaymentPercent(raw, parsedTradelines);
    const totalAccounts = parsedTradelines.length || sandboxFallback.totalAccounts;
    const openAccounts =
      parsedTradelines.filter((tradeline: any) => String(tradeline.accountStatusType || "").toLowerCase() === "open")
        .length || sandboxFallback.openAccounts;

    return {
      creditScore: {
        score: parsedScore ?? sandboxFallback.creditScore,
        scoreModel: BUREAU_CONFIGS[bureau].scoreModel,
        scoreFactors: this.extractScoreFactors(raw),
      },
      tradelines: parsedTradelines.length > 0 ? parsedTradelines : (raw.tradelines || []),
      inquiries: parsedInquiries.length > 0 ? parsedInquiries : this.syntheticInquiries(sandboxFallback.inquiryCount),
      utilization: parsedUtilization ?? sandboxFallback.utilization,
      onTimePaymentPercent: onTimePaymentPercent ?? sandboxFallback.onTimePaymentPercent,
      totalAccounts,
      openAccounts,
    };
  }

  private parseTradelines(raw: any): any[] {
    const tradelines = Array.isArray(raw?.tradelines) ? raw.tradelines : [];
    return tradelines.map((tl: any) => ({
      accountNumber: tl.accountIdentifier || tl.accountNumber,
      accountType: tl.accountType || tl.loanType,
      balance: this.toNumber(tl.currentBalanceAmount ?? tl.balance),
      creditLimit: this.toNumber(tl.creditLimitAmount ?? tl.creditLimit),
      paymentStatus: tl.currentRatingType || tl.paymentStatus,
      monthsReviewed: this.toNumber(tl.monthsReviewedCount ?? tl.monthsReviewed),
      dateOpened: tl.accountOpenedDate || tl.dateOpened,
      accountStatusType: tl.accountStatusType,
      _30DayLates: this.toNumber(tl._30DayLates),
      _60DayLates: this.toNumber(tl._60DayLates),
      _90DayLates: this.toNumber(tl._90DayLates),
      monthlyPaymentAmount: this.toNumber(tl.monthlyPaymentAmount),
      interestRatePercent: this.toNumber(tl.interestRatePercent),
      creditorName: tl.creditorName,
    }));
  }

  private parseInquiries(raw: any): Array<{ inquiryDate: string; inquiryType: string; subscriberName: string }> {
    const inquiries = Array.isArray(raw?.inquiries) ? raw.inquiries : [];
    return inquiries.map((inq: any) => ({
      inquiryDate: inq.inquiryDate || inq.date || new Date().toISOString().slice(0, 10),
      inquiryType: inq.inquiryType || "hard",
      subscriberName: inq.subscriberName || inq.creditorName || "Unknown",
    }));
  }

  private extractScore(raw: any): number | null {
    if (typeof raw?.creditScore === "number") return raw.creditScore;
    if (typeof raw?.score === "number") return raw.score;
    if (Array.isArray(raw?.scores) && raw.scores.length > 0) {
      const firstScore = raw.scores.find((s: any) => s?.scoreValue) || raw.scores[0];
      const parsed = this.toNumber(firstScore?.scoreValue);
      return parsed > 0 ? parsed : null;
    }
    return null;
  }

  private extractScoreFactors(raw: any): string[] {
    if (Array.isArray(raw?.scoreFactors)) {
      return raw.scoreFactors
        .map((factor: any) => (typeof factor === "string" ? factor : factor?.scoreFactorText))
        .filter(Boolean);
    }

    if (Array.isArray(raw?.scores) && raw.scores.length > 0) {
      const firstScore = raw.scores.find((s: any) => Array.isArray(s?.scoreFactors)) || raw.scores[0];
      return (firstScore?.scoreFactors || [])
        .map((factor: any) => factor?.scoreFactorText || factor?.scoreFactorCode)
        .filter(Boolean);
    }

    return [];
  }

  private extractUtilization(raw: any, parsedTradelines: any[]): number | null {
    const direct = this.toNumber(raw?.utilization);
    if (direct > 0) return direct;

    const summaryUtil = this.toNumber(raw?.summaries?.tradeSummary?.revolvingCreditUtilization);
    if (summaryUtil > 0) return summaryUtil;

    const fromTradelines = this.calculateUtilization({ tradelines: parsedTradelines });
    if (fromTradelines > 0) return fromTradelines;

    return null;
  }

  private deriveOnTimePaymentPercent(raw: any, parsedTradelines: any[]): number | null {
    const direct = this.toNumber(raw?.onTimePaymentPercent);
    if (direct > 0) return direct;

    if (parsedTradelines.length === 0) return null;

    let totalLateCount = 0;
    for (const tl of parsedTradelines) {
      totalLateCount += this.toNumber((tl as any)._30DayLates);
      totalLateCount += this.toNumber((tl as any)._60DayLates);
      totalLateCount += this.toNumber((tl as any)._90DayLates);
    }

    if (totalLateCount === 0) return 99;
    const penalty = Math.min(80, totalLateCount * 5);
    return Math.max(10, 100 - penalty);
  }

  private toNumber(value: unknown): number {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^0-9.-]/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  }

  /**
   * CRS sandbox may return NoFileReturnedError for some test pulls.
   * Use deterministic profile bands by known sandbox SSNs so gameplay can still be tested end-to-end.
   */
  private getSandboxProfileFromSSN(ssn: string): {
    creditScore: number;
    utilization: number;
    onTimePaymentPercent: number;
    inquiryCount: number;
    totalAccounts: number;
    openAccounts: number;
  } {
    const normalized = ssn.replace(/\D/g, "");
    const map: Record<string, { creditScore: number; utilization: number; onTimePaymentPercent: number; inquiryCount: number; totalAccounts: number; openAccounts: number; }> = {
      "666001001": { creditScore: 768, utilization: 14, onTimePaymentPercent: 99, inquiryCount: 1, totalAccounts: 9, openAccounts: 6 },
      "666002002": { creditScore: 704, utilization: 33, onTimePaymentPercent: 96, inquiryCount: 3, totalAccounts: 7, openAccounts: 5 },
      "666003003": { creditScore: 648, utilization: 58, onTimePaymentPercent: 89, inquiryCount: 5, totalAccounts: 5, openAccounts: 4 },
      "666004004": { creditScore: 582, utilization: 86, onTimePaymentPercent: 74, inquiryCount: 8, totalAccounts: 4, openAccounts: 3 },
    };

    if (map[normalized]) return map[normalized];

    // Generic sandbox fallback.
    return {
      creditScore: 640,
      utilization: 55,
      onTimePaymentPercent: 90,
      inquiryCount: 4,
      totalAccounts: 5,
      openAccounts: 4,
    };
  }

  private syntheticInquiries(count: number): Array<{ inquiryDate: string; inquiryType: string; subscriberName: string }> {
    return Array.from({ length: count }).map((_, idx) => ({
      inquiryDate: new Date(Date.now() - idx * 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      inquiryType: "hard",
      subscriberName: `Sandbox Lender ${idx + 1}`,
    }));
  }

  /**
   * Debugs a previous request by ID
   */
  async debugRequest(requestId: string): Promise<any> {
    const stored = retrieveTemporary(requestId);
    if (stored) {
      return {
        found: true,
        data: sanitizeForLogging(stored),
        message: "Request found in temporary storage",
      };
    }

    // In production, this would query CRS's debug endpoint
    return {
      found: false,
      message: "Request not found or expired (15min retention)",
    };
  }
}

// ------------------------------------------
// CREDIT ORCHESTRATOR
// ------------------------------------------

export class CreditOrchestrator {
  private crsClient: CRSApiClient;
  private gameStateCache: Map<string, GameState>;

  constructor() {
    this.crsClient = new CRSApiClient();
    this.gameStateCache = new Map();
  }

  /**
   * Main orchestration method: Pull credit + Transform + Generate narrative
   */
  async orchestrateSync(
    request: CreditOrchestrationRequest
  ): Promise<CreditOrchestrationResponse> {
    const startTime = Date.now();
    console.log(`🌲 Starting credit orchestration for user: ${request.userId}`);

    try {
      // STEP 1: Identity Verification (if enabled)
      if (request.includeIdentityCheck && config.identity.requireIdentityCheck) {
        console.log("🔐 STEP 1: Identity Verification");
        let identityResult;
        try {
          identityResult = await this.crsClient.verifyIdentity(request.personalInfo);
        } catch (error: any) {
          // Some sandbox accounts do not have FlexID enabled (CRS102). Skip identity for demo flows.
          if (isFlexIdProductUnavailable(error)) {
            console.warn("⚠️ FlexID not configured for this account (CRS102). Continuing without identity check.");
            identityResult = { verified: true, cviScore: 0, requestId: "flexid_skipped" };
          } else {
            throw error;
          }
        }

        if (!identityResult.verified) {
          return {
            success: false,
            error: `Identity verification failed. CVI Score: ${identityResult.cviScore} (minimum: ${config.identity.minimumCVIScore})`,
          };
        }

        console.log("✅ Identity verified");
      }

      // STEP 2: Pull Credit Report
      console.log(`📊 STEP 2: Pulling ${request.bureau} credit report`);
      const creditReport = await this.crsClient.pullCreditReport(
        request.bureau,
        request.personalInfo
      );

      // STEP 3: Transform into Game State
      console.log("🎮 STEP 3: Transforming to game state");
      const previousState = this.gameStateCache.get(request.userId) || null;
      
      const { gameState, xpEvents, newUnlocks, tierUp } = updateGameState(
        previousState,
        creditReport,
        request.userId
      );

      // Cache new state
      this.gameStateCache.set(request.userId, gameState);

      // STEP 4: Generate AI Narrative
      console.log("🤖 STEP 4: Generating AI Ranger narrative");
      const narrative = await generateSceneTwoEnvironmentalNarrative(
        gameState.metrics,
        creditReport,
        previousState?.metrics || null
      );
      const guideMessage = await generateSkillTreeGuideMessage(gameState.metrics);

      // STEP 5: Cleanup raw credit data
      console.log("🧹 STEP 5: Cleaning up sensitive data");
      deleteTemporary(creditReport.requestId);

      const duration = Date.now() - startTime;
      console.log(`✅ Orchestration complete in ${duration}ms`);

      return {
        success: true,
        gameState,
        narrative,
        guideMessage,
        newUnlocks,
        xpEvents,
      };
    } catch (error: any) {
      console.error("❌ Orchestration failed:", error);
      return {
        success: false,
        error: error.message || "Unknown error occurred",
      };
    }
  }

  /**
   * Gets cached game state for user
   */
  getGameState(userId: string): GameState | null {
    return this.gameStateCache.get(userId) || null;
  }

  /**
   * Manually updates game state (for testing)
   */
  setGameState(userId: string, state: GameState): void {
    this.gameStateCache.set(userId, state);
  }

  /**
   * Debugs a previous CRS request
   */
  async debugRequest(requestId: string): Promise<any> {
    return this.crsClient.debugRequest(requestId);
  }

  /**
   * Multi-bureau comparison (advanced feature)
   */
  async compareBureaus(
    request: Omit<CreditOrchestrationRequest, "bureau">
  ): Promise<{
    experian?: CreditReportResponse;
    transunion?: CreditReportResponse;
    equifax?: CreditReportResponse;
    comparison?: any;
  }> {
    console.log("🔄 Pulling reports from all three bureaus...");

    const [experian, transunion, equifax] = await Promise.allSettled([
      this.crsClient.pullCreditReport("experian", request.personalInfo),
      this.crsClient.pullCreditReport("transunion", request.personalInfo),
      this.crsClient.pullCreditReport("equifax", request.personalInfo),
    ]);

    const results: any = {};

    if (experian.status === "fulfilled") results.experian = experian.value;
    if (transunion.status === "fulfilled") results.transunion = transunion.value;
    if (equifax.status === "fulfilled") results.equifax = equifax.value;

    // Generate comparison
    results.comparison = this.generateComparison(results);

    return results;
  }

  /**
   * Generates bureau comparison insights
   */
  private generateComparison(reports: any): any {
    const scores: number[] = [];
    const utils: number[] = [];

    if (reports.experian) {
      scores.push(reports.experian.creditScore?.score || 0);
      utils.push(reports.experian.utilization || 0);
    }
    if (reports.transunion) {
      scores.push(reports.transunion.creditScore?.score || 0);
      utils.push(reports.transunion.utilization || 0);
    }
    if (reports.equifax) {
      scores.push(reports.equifax.creditScore?.score || 0);
      utils.push(reports.equifax.utilization || 0);
    }

    return {
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      scoreSpread: Math.max(...scores) - Math.min(...scores),
      averageUtilization: utils.reduce((a, b) => a + b, 0) / utils.length,
    };
  }
}

// ------------------------------------------
// SINGLETON INSTANCE
// ------------------------------------------

let orchestratorInstance: CreditOrchestrator | null = null;

export function getOrchestrator(): CreditOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new CreditOrchestrator();
  }
  return orchestratorInstance;
}

// ------------------------------------------
// TESTING UTILITIES
// ------------------------------------------

/**
 * Creates test personas for sandbox testing
 */
export const TEST_PERSONAS = {
  excellent: {
    firstName: "Alice",
    lastName: "Excellent",
    ssn: "666001001",
    birthDate: "1990-01-01",
    addresses: [
      {
        addressLine1: "123 Perfect St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
      },
    ],
  },
  good: {
    firstName: "Bob",
    lastName: "Good",
    ssn: "666002002",
    birthDate: "1985-05-15",
    addresses: [
      {
        addressLine1: "456 Decent Ave",
        city: "Los Angeles",
        state: "CA",
        postalCode: "90001",
      },
    ],
  },
  fair: {
    firstName: "Charlie",
    lastName: "Fair",
    ssn: "666003003",
    birthDate: "1992-07-20",
    addresses: [
      {
        addressLine1: "789 Average Blvd",
        city: "Chicago",
        state: "IL",
        postalCode: "60601",
      },
    ],
  },
  poor: {
    firstName: "Diana",
    lastName: "Poor",
    ssn: "666004004",
    birthDate: "1988-03-10",
    addresses: [
      {
        addressLine1: "321 Struggle Rd",
        city: "Houston",
        state: "TX",
        postalCode: "77001",
      },
    ],
  },
};
