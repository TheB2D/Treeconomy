import { NextRequest, NextResponse } from "next/server";
import { getOrchestrator } from "@/lib/backend/creditOrchestrator";
import { config } from "@/lib/backend/config";
import {
  generateDogeChatResponse,
  generateSkillTreeGuideMessage,
  generateSkillTreeQuickActionMessage,
  type DogeChatTurn,
  type GuideQuickAction,
} from "@/lib/backend/narrativeEngine";
import type { GameMetrics } from "@/lib/backend/types";

const QUICK_ACTIONS: Array<{ id: GuideQuickAction; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "improve-score", label: "Improve Score" },
  { id: "lower-utilization", label: "Lower Utilization" },
  { id: "build-streak", label: "Build Streak" },
  { id: "reduce-inquiries", label: "Reduce Inquiries" },
  { id: "unlock-next", label: "Next Unlock" },
];

const isGuideQuickAction = (value: string): value is GuideQuickAction =>
  QUICK_ACTIONS.some((action) => action.id === value);

const sanitizeHistory = (history: unknown): DogeChatTurn[] => {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (turn): turn is DogeChatTurn =>
        Boolean(
          turn &&
            typeof turn === "object" &&
            "role" in turn &&
            "content" in turn &&
            ((turn as any).role === "user" || (turn as any).role === "assistant") &&
            typeof (turn as any).content === "string"
        )
    )
    .slice(-12);
};

export async function POST(request: NextRequest) {
  try {
    if (config.gemini.enabled && !config.gemini.apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Gemini is not configured. Set GOOGLE_GENERATIVE_AI_API_KEY.",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const userId = typeof body.userId === "string" ? body.userId : undefined;
    const mode = body.mode === "chat" ? "chat" : "quick-action";
    const actionInput = typeof body.action === "string" ? body.action : "overview";
    const action: GuideQuickAction = isGuideQuickAction(actionInput) ? actionInput : "overview";
    const userMessage = typeof body.userMessage === "string" ? body.userMessage : "";
    const conversationHistory = sanitizeHistory(body.conversationHistory);

    const orchestrator = getOrchestrator();
    const cachedState = userId ? orchestrator.getGameState(userId) : null;
    const fallbackMetrics = (body.metrics || null) as GameMetrics | null;
    const metrics = cachedState?.metrics ?? fallbackMetrics;

    if (!metrics) {
      return NextResponse.json(
        {
          success: false,
          error: "No synced metrics found. Sync credit first, then ask Doge for guidance.",
        },
        { status: 400 }
      );
    }

    const message =
      mode === "chat"
        ? await generateDogeChatResponse(metrics, userMessage, conversationHistory)
        : action === "overview"
        ? await generateSkillTreeGuideMessage(metrics)
        : await generateSkillTreeQuickActionMessage(metrics, action);

    return NextResponse.json(
      {
        success: true,
        message,
        mode,
        action,
        quickActions: QUICK_ACTIONS,
        source: cachedState ? "cached-sync" : "client-metrics",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to generate Doge guidance.",
      },
      { status: 500 }
    );
  }
}
