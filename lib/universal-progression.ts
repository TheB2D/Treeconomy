export interface UniversalProgressBand {
  tier: number;
  key: "no-score" | "sprout" | "guardian" | "warden" | "sentinel";
  phaseName: "Sprout" | "Guardian" | "Warden" | "Sentinel";
  minScore: number;
  maxScore: number;
  maxTierCap: number;
}

const SCORE_FLOOR = 300;
const SCORE_CEILING = 850;

export const UNIVERSAL_PROGRESS_BANDS: UniversalProgressBand[] = [
  {
    tier: 1,
    key: "no-score",
    phaseName: "Sprout",
    minScore: 0,
    maxScore: 0,
    maxTierCap: 1,
  },
  {
    tier: 2,
    key: "sprout",
    phaseName: "Sprout",
    minScore: SCORE_FLOOR,
    maxScore: 619,
    maxTierCap: 2,
  },
  {
    tier: 3,
    key: "guardian",
    phaseName: "Guardian",
    minScore: 620,
    maxScore: 679,
    maxTierCap: 3,
  },
  {
    tier: 4,
    key: "warden",
    phaseName: "Warden",
    minScore: 680,
    maxScore: 749,
    maxTierCap: 4,
  },
  {
    tier: 5,
    key: "sentinel",
    phaseName: "Sentinel",
    minScore: 750,
    maxScore: SCORE_CEILING,
    maxTierCap: 5,
  },
];

export interface UniversalRank {
  rankNumber: number;
  phaseName: "Sprout" | "Guardian" | "Warden" | "Sentinel";
  phaseLevel: 1 | 2 | 3;
  rankName: string;
}

const ROMAN_BY_LEVEL: Record<1 | 2 | 3, "I" | "II" | "III"> = {
  1: "I",
  2: "II",
  3: "III",
};

const PHASE_ORDER: Array<UniversalRank["phaseName"]> = ["Sprout", "Guardian", "Warden", "Sentinel"];

export interface UniversalProgressState {
  band: UniversalProgressBand;
  phaseName: UniversalRank["phaseName"];
  rank: UniversalRank;
  score: number;
  maxTierCap: number;
  totalProgressPercent: number;
  bandProgressPercent: number;
  nextBandStartScore: number | null;
}

const getPhaseBounds = (
  phaseName: UniversalRank["phaseName"]
): { minScore: number; maxScore: number } => {
  const phaseBands = UNIVERSAL_PROGRESS_BANDS.filter((band) => band.phaseName === phaseName);
  return {
    minScore: Math.min(...phaseBands.map((band) => band.minScore)),
    maxScore: Math.max(...phaseBands.map((band) => band.maxScore)),
  };
};

export const getUniversalRankFromCreditScore = (creditScore: number): UniversalRank => {
  const band = getBandByScore(creditScore);
  const phaseName = band.phaseName;
  const phaseIndex = PHASE_ORDER.indexOf(phaseName);
  const { minScore, maxScore } = getPhaseBounds(phaseName);

  let phaseLevel: 1 | 2 | 3 = 1;
  if (creditScore > 0) {
    const score = clampScore(creditScore);
    const range = Math.max(1, maxScore - minScore + 1);
    const normalized = (score - minScore) / range;
    phaseLevel = (Math.min(2, Math.max(0, Math.floor(normalized * 3))) + 1) as 1 | 2 | 3;
  }

  const rankNumber = phaseIndex * 3 + phaseLevel;
  return {
    rankNumber,
    phaseName,
    phaseLevel,
    rankName: `${phaseName} ${ROMAN_BY_LEVEL[phaseLevel]}`,
  };
};

const clampScore = (creditScore: number): number => {
  if (Number.isNaN(creditScore) || creditScore <= 0) return 0;
  return Math.max(SCORE_FLOOR, Math.min(SCORE_CEILING, creditScore));
};

const getBandByScore = (creditScore: number): UniversalProgressBand => {
  if (creditScore <= 0) {
    return UNIVERSAL_PROGRESS_BANDS[0];
  }

  const score = clampScore(creditScore);
  return (
    UNIVERSAL_PROGRESS_BANDS.find((band) => score >= band.minScore && score <= band.maxScore) ??
    UNIVERSAL_PROGRESS_BANDS[UNIVERSAL_PROGRESS_BANDS.length - 1]
  );
};

export const getMaxTierCapFromCreditScore = (creditScore: number): number =>
  getBandByScore(creditScore).maxTierCap;

export const getUniversalProgressState = (creditScore: number): UniversalProgressState => {
  const band = getBandByScore(creditScore);
  const rank = getUniversalRankFromCreditScore(creditScore);
  const score = clampScore(creditScore);
  const maxTierCap = band.maxTierCap;

  const totalProgressPercent =
    score <= 0 ? 0 : ((score - SCORE_FLOOR) / (SCORE_CEILING - SCORE_FLOOR)) * 100;

  let bandProgressPercent = 0;
  if (band.key !== "no-score") {
    const range = Math.max(1, band.maxScore - band.minScore);
    bandProgressPercent = ((score - band.minScore) / range) * 100;
  }

  const nextBand = UNIVERSAL_PROGRESS_BANDS.find((entry) => entry.tier === band.tier + 1);
  const nextBandStartScore =
    nextBand && nextBand.key !== "no-score" ? nextBand.minScore : null;

  return {
    band,
    phaseName: band.phaseName,
    rank,
    score,
    maxTierCap,
    totalProgressPercent: Math.max(0, Math.min(100, totalProgressPercent)),
    bandProgressPercent: Math.max(0, Math.min(100, bandProgressPercent)),
    nextBandStartScore,
  };
};
