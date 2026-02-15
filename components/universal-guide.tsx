"use client";

import { useEffect, useMemo, useState } from "react";

interface UniversalGuideProps {
  isOpen: boolean;
  message: string;
  gameState?: {
    userId: string;
    metrics: {
      creditScore: number;
      utilization: number;
      paymentStreak: number;
      inquiryCount: number;
      droughtEvents: number;
      stormEvents: number;
      utilizationOvergrowth: boolean;
    };
  } | null;
}

type QuickAction = {
  id: "overview" | "improve-score" | "lower-utilization" | "build-streak" | "reduce-inquiries" | "unlock-next";
  label: string;
};

type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: "overview", label: "Overview" },
  { id: "improve-score", label: "Improve Score" },
  { id: "lower-utilization", label: "Lower Utilization" },
  { id: "build-streak", label: "Build Streak" },
  { id: "reduce-inquiries", label: "Reduce Inquiries" },
  { id: "unlock-next", label: "Next Unlock" },
];

export function UniversalGuide({ isOpen, message, gameState }: UniversalGuideProps) {
  const [chatInput, setChatInput] = useState("");
  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([{ role: "assistant", content: message }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickActions, setQuickActions] = useState<QuickAction[]>(DEFAULT_QUICK_ACTIONS);
  const [activeAction, setActiveAction] = useState<QuickAction["id"] | null>(null);
  const canInteract = Boolean(gameState) && !isLoading;

  const recentConversation = useMemo(() => chatTurns.slice(-10), [chatTurns]);

  useEffect(() => {
    setChatTurns((prev) => {
      if (prev.length === 0) return [{ role: "assistant", content: message }];
      const next = [...prev];
      const last = next[next.length - 1];
      if (last?.role === "assistant") {
        next[next.length - 1] = { role: "assistant", content: message };
        return next;
      }
      return [...next, { role: "assistant", content: message }];
    });
  }, [message]);

  const runQuickAction = async (action: QuickAction["id"]) => {
    if (!gameState || isLoading) return;

    setIsLoading(true);
    setActiveAction(action);
    setError(null);
    try {
      const response = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: gameState.userId,
          mode: "quick-action",
          action,
          metrics: gameState.metrics,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch Doge guidance.");
      }
      if (typeof result.message === "string" && result.message.length > 0) {
        setChatTurns((prev) => [
          ...prev,
          { role: "user", content: `Quick action: ${action}` },
          { role: "assistant", content: result.message },
        ]);
      }
      if (Array.isArray(result.quickActions) && result.quickActions.length > 0) {
        setQuickActions(result.quickActions);
      }
    } catch (err: any) {
      setError(err?.message || "Doge could not fetch fresh guidance.");
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const sendChat = async () => {
    if (!gameState || isLoading) return;
    const userMessage = chatInput.trim();
    if (!userMessage) return;

    const nextTurns = [...chatTurns, { role: "user" as const, content: userMessage }];
    setChatTurns(nextTurns);
    setChatInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: gameState.userId,
          mode: "chat",
          userMessage,
          conversationHistory: [...recentConversation, { role: "user", content: userMessage }],
          metrics: gameState.metrics,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Doge could not reply.");
      }
      if (typeof result.message === "string" && result.message.length > 0) {
        setChatTurns((prev) => [...prev, { role: "assistant", content: result.message }]);
      }
    } catch (err: any) {
      setError(err?.message || "Doge could not fetch fresh guidance.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 bottom-20 z-[1300] w-[min(460px,calc(100vw-20px))] pointer-events-auto">
      <div className="relative bg-card/95 border-4 border-border pixel-border shadow-[6px_6px_0_rgba(0,0,0,0.45)] p-3 pr-24">
        <div className="mb-2 inline-flex items-center border-2 border-primary bg-background px-2 py-1 text-[10px] text-primary">
          DOGE GUIDE
        </div>

        <div className="max-h-[132px] overflow-y-auto border-2 border-border bg-muted/30 p-2 space-y-1.5">
          {chatTurns.slice(-6).map((turn, idx) => (
            <div key={`${turn.role}-${idx}`} className="text-[11px] leading-snug">
              <span className={turn.role === "assistant" ? "text-primary" : "text-secondary"}>
                {turn.role === "assistant" ? "DOGE:" : "YOU:"}
              </span>{" "}
              <span className="text-foreground">{turn.content}</span>
            </div>
          ))}
          {isLoading && <div className="text-[10px] text-muted-foreground">Doge is thinking...</div>}
        </div>

        {error && <div className="mt-1 text-[10px] text-destructive">{error}</div>}

        <div className="mt-2 flex flex-wrap gap-1">
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className="border border-border bg-muted/80 px-2 py-1 text-[9px] leading-none hover:bg-muted disabled:opacity-50"
              disabled={!canInteract}
              onClick={() => runQuickAction(action.id)}
            >
              {activeAction === action.id ? "..." : action.label}
            </button>
          ))}
        </div>

        <div className="mt-2 flex gap-1.5">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendChat();
              }
            }}
            placeholder={gameState ? "Ask Doge anything..." : "Sync first to chat with Doge"}
            className="flex-1 border-2 border-border bg-background px-2 py-1 text-[11px]"
            disabled={!canInteract}
          />
          <button
            type="button"
            className="border-2 border-primary bg-primary/20 px-3 py-1 text-[10px] disabled:opacity-50"
            onClick={sendChat}
            disabled={!canInteract || chatInput.trim().length === 0}
          >
            SEND
          </button>
        </div>

        <div className="absolute right-2 bottom-2 w-20 flex flex-col items-center">
          <div className="text-[9px] text-primary mb-1">DOGE</div>
          <img
            src="/guide.gif"
            alt="Guide Doge"
            className="w-16 h-16 object-contain"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      </div>
    </div>
  );
}
