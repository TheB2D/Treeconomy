// ==========================================
// API ROUTE: /api/test-personas
// Returns sandbox test personas for development
// ==========================================

import { NextResponse } from "next/server";
import { TEST_PERSONAS } from "@/lib/backend/creditOrchestrator";
import { config } from "@/lib/backend/config";

export async function GET() {
  // Only expose test personas in sandbox environment
  if (config.crs.environment !== "sandbox") {
    return NextResponse.json(
      { error: "Test personas only available in sandbox environment" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    personas: TEST_PERSONAS,
    usage: "Use these personas to test credit pulls in sandbox environment",
    note: "All SSNs start with 666 (sandbox indicator)",
  });
}
