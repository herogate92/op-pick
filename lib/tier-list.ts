import { heroes, type Hero, type HeroRateRow, type HeroRateSnapshot, type Role } from "./data";
import { statsTier } from "./stats-tier";

export type TierName = ReturnType<typeof statsTier>;
export const tierOrder: TierName[] = ["S", "A", "B", "C", "미분류"];
export const tierRoles: Role[] = ["tank", "damage", "support"];
export type TierEntry = { hero: Hero; row: HeroRateRow | undefined };

// Same win-rate bands as the /rates/ tier table, grouped by role and sorted by win rate within a band.
export function buildTierList(snapshot: HeroRateSnapshot) {
  const rows = new Map(snapshot.rows.map((row) => [row.hero, row]));
  return tierOrder.map((tier) => ({
    tier,
    roles: Object.fromEntries(tierRoles.map((role) => [role, heroes
      .filter((hero) => hero.role === role)
      .map((hero) => ({ hero, row: rows.get(hero.key) }))
      .filter(({ hero, row }) => (row ? statsTier(row, hero.releaseStatus === "trial") : "미분류") === tier)
      .sort((a, b) => (b.row?.winRate ?? -1) - (a.row?.winRate ?? -1))])) as Record<Role, TierEntry[]>,
  }));
}
