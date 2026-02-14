"use client";

export function SceneThree() {
  const topRankings = [
    { rank: 1, name: "Linda", xp: 664, badge: "/icons/gold_coin.png" },
    { rank: 2, name: "Stanislav", xp: 655, badge: "/icons/silver_coin.png" },
    { rank: 3, name: "Cezary", xp: 573, badge: "/icons/bronze_coin.png" },
    { rank: 4, name: "Arsen", xp: 536, badge: "/icons/stackcoin_t2.png" },
  ];

  const lowerRankings = [
    { rank: 25, name: "Vladymyr V.", xp: 208 },
    { rank: 26, name: "Bardha", xp: 195 },
    { rank: 27, name: "Turpin-S", xp: 172 },
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/background3.gif')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
        }}
      />

      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-20 w-full h-full flex items-center justify-center p-6">
        <div className="w-full max-w-[1080px] border-4 border-border bg-card/95 pixel-border p-4 md:p-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl text-primary">TREECONOMY LEADERBOARDS</h2>
            <p className="text-[11px] text-muted-foreground mt-1">SEASON ENDS IN 3 DAYS</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-border bg-card/85 pixel-border overflow-hidden">
              <div className="border-b-2 border-border p-3 bg-muted/40">
                <div className="text-sm text-primary text-center">DIAMOND LEAGUE</div>
              </div>
              <div className="divide-y-2 divide-border/60">
                {topRankings.map((player, idx) => (
                  <div
                    key={player.rank}
                    className={`p-3 flex items-center justify-between text-sm ${
                      idx === 1 ? "bg-muted/60" : "bg-card/90"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-primary">{player.rank}</span>
                      <img src={player.badge} alt={`${player.name} badge`} className="w-6 h-6 object-contain" />
                      <span>{player.name}</span>
                    </div>
                    <span className="text-accent">{player.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-2 border-border bg-card/85 pixel-border overflow-hidden">
              <div className="border-b-2 border-border p-3 bg-muted/40">
                <div className="text-sm text-primary text-center">RISK ZONE</div>
              </div>
              <div className="p-3 border-b-2 border-border text-center text-destructive text-xs">
                <span className="inline-flex items-center gap-2">
                  <img src="/icons/down.png" alt="Demotion down" className="w-4 h-4 object-contain" />
                  DEMOTION ZONE
                  <img src="/icons/down.png" alt="Demotion down" className="w-4 h-4 object-contain" />
                </span>
              </div>
              <div className="divide-y-2 divide-border/60">
                {lowerRankings.map((player) => (
                  <div key={player.rank} className="p-3 flex items-center justify-between text-sm bg-card/90">
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-destructive">{player.rank}</span>
                      <img src="/icons/question.png" alt={`${player.name} avatar`} className="w-6 h-6 object-contain" />
                      <span>{player.name}</span>
                    </div>
                    <span className="text-accent">{player.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
