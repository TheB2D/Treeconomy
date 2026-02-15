// ==========================================
// API ROUTE: /api/credit/sync
// Main endpoint for syncing credit data and updating game state
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { getOrchestrator } from "@/lib/backend/creditOrchestrator";
import { checkRateLimit } from "@/lib/backend/security";
import type { CreditOrchestrationRequest } from "@/lib/backend/types";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    const { userId, bureau, personalInfo, includeIdentityCheck } = body;

    if (!userId || !bureau || !personalInfo) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: userId, bureau, personalInfo",
        },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimit = checkRateLimit(userId, 10, 60000); // 10 requests per minute
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    // Validate bureau
    if (!["experian", "transunion", "equifax"].includes(bureau)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid bureau. Must be: experian, transunion, or equifax",
        },
        { status: 400 }
      );
    }

    // Validate personal info structure
    if (
      !personalInfo.firstName ||
      !personalInfo.lastName ||
      !personalInfo.ssn ||
      !personalInfo.birthDate ||
      !personalInfo.addresses ||
      personalInfo.addresses.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid personalInfo. Required: firstName, lastName, ssn, birthDate, addresses",
        },
        { status: 400 }
      );
    }

    // Orchestrate credit sync
    const orchestrator = getOrchestrator();
    const orchestrationRequest: CreditOrchestrationRequest = {
      userId,
      bureau,
      personalInfo,
      includeIdentityCheck: false, // TEMPORARILY DISABLED FOR DEBUGGING 401 ERROR
    };

    console.log("🔧 DEBUG: Identity check disabled, testing credit pull only...");

    const result = await orchestrator.orchestrateSync(orchestrationRequest);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    // Return successful result
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Optional: GET method to retrieve cached state
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const orchestrator = getOrchestrator();
    const gameState = orchestrator.getGameState(userId);

    if (!gameState) {
      return NextResponse.json(
        { success: false, error: "No game state found for user" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, gameState }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
