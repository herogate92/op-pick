import type { HeroRateRow } from "./data.ts";

// Descriptive win-rate bands, not a confidence estimate or matchup recommendation.
export function statsTier(row: HeroRateRow, trial = false): "S" | "A" | "B" | "C" | "미분류" {
  if (trial || row.winRate === null || row.pickRate === null || row.pickRate < 1) return "미분류";
  return row.winRate >= 55 ? "S" : row.winRate >= 52 ? "A" : row.winRate >= 49 ? "B" : "C";
}
