// ==========================================
// API ROUTE: /api/credit/debug
// Debug previous credit API requests
// ==========================================

import { NextRequest, NextResponse } from "next/server";
import { getOrchestrator } from "@/lib/backend/creditOrchestrator";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: "Missing requestId parameter" },
        { status: 400 }
      );
    }

    const orchestrator = getOrchestrator();
    const debugInfo = await orchestrator.debugRequest(requestId);

    return NextResponse.json({ success: true, ...debugInfo }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
