import type { HeroRateRow } from "./data.ts";

export function summarizeRates(rows: readonly HeroRateRow[]) {
  const metrics = ["winRate", "pickRate", "banRate"] as const;
  const leaders = Object.fromEntries(metrics.map(metric => {
    const available = rows.filter(row => row[metric] !== null);
    const leader = available.reduce<HeroRateRow | undefined>((best, row) =>
      !best || row[metric]! > best[metric]! ? row : best, undefined);
    return [metric, leader];
  })) as Record<typeof metrics[number], HeroRateRow | undefined>;
  return {
    leaders,
    available: rows.filter(row => metrics.some(metric => row[metric] !== null)).length,
    total: rows.length,
  };
}
