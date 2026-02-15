// ==========================================
// API ROUTE: /api/health
// Health check and configuration validation
// ==========================================

import { NextResponse } from "next/server";
import { validateConfig, config } from "@/lib/backend/config";

export async function GET() {
  const configCheck = validateConfig();

  const health = {
    status: configCheck.valid ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    environment: config.app.nodeEnv,
    crsEnvironment: config.crs.environment,
    checks: {
      geminiConfigured: !!config.gemini.apiKey,
      crsConfigured: !!config.crs.username && !!config.crs.password,
      securityConfigured: !!config.security.encryptionKey,
    },
    errors: configCheck.errors,
  };

  const status = configCheck.valid ? 200 : 503;
  return NextResponse.json(health, { status });
}
