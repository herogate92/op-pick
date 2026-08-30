import type { MetadataRoute } from "next";
import { detailedMatchups, heroes, maps } from "@/lib/data";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://opick.ggwp.kr";
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/heroes/`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/overview/`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/matchups/`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/maps/`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/combos/`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/team-builder/`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/sources/`, changeFrequency: "monthly", priority: 0.5 },
    ...heroes.map((hero) => ({ url: `${base}/heroes/${hero.key}/`, lastModified: hero.checkedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...maps.map((map) => ({ url: `${base}/maps/${map.id}/`, lastModified: map.reviewedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...detailedMatchups.map((matchup) => ({ url: `${base}/matchups/${matchup.hero}-vs-${matchup.counter}/`, lastModified: matchup.reviewedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
