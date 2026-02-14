"use client";

interface UniversalGuideProps {
  isOpen: boolean;
  message: string;
}

export function UniversalGuide({ isOpen, message }: UniversalGuideProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed right-4 bottom-20 z-[1300] w-[340px] max-w-[calc(100vw-24px)] pointer-events-auto">
      <div className="relative">
        <div className="mr-20 bg-card/95 border-4 border-border p-3 pixel-border">
          <div className="text-[10px] text-primary mb-1">DOGE GUIDE</div>
          <p className="text-[11px] leading-relaxed text-foreground">{message}</p>
        </div>
        <img
          src="/guide.gif"
          alt="Guide Doge"
          className="absolute right-0 bottom-0 w-24 h-24 object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </div>
  );
}
