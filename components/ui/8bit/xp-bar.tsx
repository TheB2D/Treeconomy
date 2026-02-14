"use client";

interface XpBarProps {
  value: number;
  levelUpMessage?: string;
}

export default function XpBar({ value, levelUpMessage = "LEVEL UP!" }: XpBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const isLevelUp = clampedValue >= 100;

  return (
    <div className="w-full">
      <div className="relative h-5 border-2 border-border bg-card/70 overflow-hidden pixel-border">
        <div
          className="absolute inset-y-0 left-0 bg-primary transition-all duration-700 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[8px] text-foreground">
          XP {Math.round(clampedValue)}%
        </div>
      </div>
      {isLevelUp && (
        <div className="mt-1 text-center text-[8px] text-accent animate-pulse">
          {levelUpMessage}
        </div>
      )}
    </div>
  );
}
