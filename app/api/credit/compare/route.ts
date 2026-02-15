// ==========================================
// API ROUTE: /api/credit/compare
// Multi-bureau comparison endpoint
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { getOrchestrator } from "@/lib/backend/creditOrchestrator";
import { checkRateLimit } from "@/lib/backend/security";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, personalInfo } = body;

    if (!userId || !personalInfo) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Stricter rate limit for multi-bureau (3 calls)
    const rateLimit = checkRateLimit(userId + "_compare", 3, 300000); // 3 per 5min
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded for bureau comparison",
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    const orchestrator = getOrchestrator();
    const result = await orchestrator.compareBureaus({ userId, personalInfo });

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Bureau comparison error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
