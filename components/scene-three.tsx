"use client";

import XpBar from "@/components/ui/8bit/xp-bar";

export function SceneThree() {
  const rankTiers = [
    { tier: 1, name: "Sprout Scout" },
    { tier: 2, name: "Bud Runner" },
    { tier: 3, name: "Leafkeeper" },
    { tier: 4, name: "Canopy Cadet" },
    { tier: 5, name: "Grove Guardian" },
    { tier: 6, name: "Root Ranger" },
    { tier: 7, name: "Forest Warden" },
    { tier: 8, name: "Wildwood Knight" },
    { tier: 9, name: "Emerald Captain" },
    { tier: 10, name: "Ancient Sentinel" },
    { tier: 11, name: "Mythic Arbor" },
    { tier: 12, name: "Treeconomy Legend" },
  ];

  const topRankings = [
    { rank: 1, name: "Linda", xp: 664, tier: 12 },
    { rank: 2, name: "Stanislav", xp: 655, tier: 11 },
    { rank: 3, name: "Cezary", xp: 573, tier: 11 },
    { rank: 4, name: "Arsen", xp: 536, tier: 10 },
    { rank: 5, name: "Maya", xp: 518, tier: 10 },
    { rank: 6, name: "Kaito", xp: 503, tier: 9 },
    { rank: 7, name: "Noura", xp: 489, tier: 9 },
    { rank: 8, name: "Jules", xp: 474, tier: 8 },
    { rank: 9, name: "Imani", xp: 456, tier: 8 },
    { rank: 10, name: "Hector", xp: 441, tier: 7 },
    { rank: 11, name: "Dina", xp: 433, tier: 7 },
    { rank: 12, name: "Ravi", xp: 425, tier: 6 },
  ];

  const lowerRankings = [
    { rank: 25, name: "Vladymyr V.", xp: 208, tier: 3 },
    { rank: 26, name: "Bardha", xp: 195, tier: 2 },
    { rank: 27, name: "Turpin-S", xp: 172, tier: 2 },
    { rank: 28, name: "Noel", xp: 168, tier: 2 },
    { rank: 29, name: "Sasha", xp: 161, tier: 1 },
    { rank: 30, name: "Priya", xp: 158, tier: 1 },
    { rank: 31, name: "Gio", xp: 152, tier: 1 },
    { rank: 32, name: "Mina", xp: 149, tier: 1 },
  ];

  const currentTier = 8;
  const getRankShield = (tier: number) =>
    `/pixel_ranks/shield-wood-${Math.max(1, Math.min(12, tier))}.png`;

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
        <div className="w-full max-w-[1200px] border-4 border-border bg-card/95 pixel-border p-4 md:p-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl text-primary">TREECONOMY LEADERBOARDS</h2>
            <p className="text-[11px] text-muted-foreground mt-1">SEASON ENDS IN 3 DAYS</p>
          </div>

          <div className="mt-2 mb-4 border-2 border-border bg-muted/25 p-3 pixel-border">
            <div className="flex items-center justify-between mb-2 text-[10px] text-muted-foreground">
              <span>CHRONOLOGICAL RANK TRACK</span>
              <span className="inline-flex items-center gap-2 text-secondary">
                <img src={getRankShield(currentTier)} alt="Current rank" className="w-4 h-4 object-contain" />
                YOUR CURRENT TIER
              </span>
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-4 min-w-max">
                {rankTiers.map((tier) => (
                  <div
                    key={tier.tier}
                    className={`relative min-w-[120px] h-[96px] bg-transparent overflow-hidden flex-shrink-0 ${
                      tier.tier === currentTier ? "text-primary" : ""
                    }`}
                  >
                    <div className="absolute top-1 left-1 text-[8px] text-muted-foreground">T{tier.tier}</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={getRankShield(tier.tier)}
                        alt={`Rank ${tier.tier}: ${tier.name}`}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-1">
                      <div className="text-[8px] text-center text-foreground px-1 leading-tight">{tier.name}</div>
                      {tier.tier === currentTier && (
                        <div className="text-[8px] text-primary text-center animate-pulse">CURRENT</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2">
              <XpBar
                value={(currentTier / rankTiers.length) * 100}
                levelUpMessage="TREECONOMY LEGEND!"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-border bg-card/85 pixel-border overflow-hidden">
              <div className="border-b-2 border-border p-3 bg-muted/40">
                <div className="text-sm text-primary text-center">DIAMOND LEAGUE</div>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                <div className="divide-y-2 divide-border/60">
                  {topRankings.map((player) => (
                    <div key={player.rank} className="p-3 flex items-center justify-between text-sm bg-card/90">
                      <div className="flex items-center gap-3">
                        <span className="w-8 text-primary">{player.rank}</span>
                        <img src={getRankShield(player.tier)} alt={`${player.name} rank`} className="w-6 h-6 object-contain" />
                        <span className="text-foreground">{player.name}</span>
                      </div>
                      <span className="text-accent">{player.xp} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-2 border-border bg-card/85 pixel-border overflow-hidden">
              <div className="border-b-2 border-border p-3 bg-muted/40">
                <div className="text-sm text-primary text-center">RISK ZONE</div>
              </div>
              <div className="p-3 border-b-2 border-border text-center text-destructive text-xs">
                <span className="inline-flex items-center gap-2">
                  <img src="/ui_helper/UI_Flat_IconArrow01c.png" alt="Demotion down" className="w-4 h-4 object-contain" />
                  DEMOTION ZONE
                  <img src="/ui_helper/UI_Flat_IconArrow01c.png" alt="Demotion down" className="w-4 h-4 object-contain" />
                </span>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                <div className="divide-y-2 divide-border/60">
                  {lowerRankings.map((player) => (
                    <div key={player.rank} className="p-3 flex items-center justify-between text-sm bg-card/90">
                      <div className="flex items-center gap-3">
                        <span className="w-8 text-destructive">{player.rank}</span>
                        <img src={getRankShield(player.tier)} alt={`${player.name} rank`} className="w-6 h-6 object-contain" />
                        <span className="text-foreground">{player.name}</span>
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
    </div>
  );
}
