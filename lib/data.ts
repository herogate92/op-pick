import heroesJson from "@/data/heroes.json";
import matchupsJson from "@/data/matchups.json";
import combosJson from "@/data/combos.json";
import mapsJson from "@/data/maps.json";
import teamSynergiesJson from "@/data/team-synergies.json";
import teamCautionsJson from "@/data/team-cautions.json";

export type Role = "tank" | "damage" | "support";
export interface AbilityStat { label: string; value: string; }
export interface AbilityVideo { thumbnail: string; mp4: string; webm: string; }
export interface Ability {
  name: string; description: string; icon: string;
  video?: AbilityVideo;
  stats?: AbilityStat[]; statsCheckedAt?: string;
}
export interface StoryMedia { type: string; link: string; }
export interface StoryChapter { title: string; picture: string; }
export interface Hero {
  key: string; name: string; description: string; portrait: string; background: string;
  role: Role; subrole: string; gamemodes: string[]; location: string; birthday: string; age: number | null;
  hitpoints: { shields: number; armor: number; health: number; total: number } | null;
  abilities: Ability[]; perks: { minor: Ability[]; major: Ability[] }; storySummary: string;
  storyMedia: StoryMedia | null; storyChapters: StoryChapter[];
  sourceUrl: string; checkedAt: string; reviewStatus: "verified" | "review-needed";
}
export type MatchupStatus = "verified" | "provisional";
export type MatchupConfidence = "high" | "medium" | "low";
export interface Matchup {
  id: string; hero: string; counter: string; score: number; reason: string; condition: string;
  counterplay: string; status: MatchupStatus; confidence: MatchupConfidence; patchBasis: string; reviewedAt: string;
  evidence?: string[];
}
export interface Combo { id: string; name: string; heroes: string[]; score: number; difficulty: number; description: string; timing: string; counters: string[]; reviewedAt: string; }
export interface MapRecommendation { hero: string; rank: number; winRate: number; note: string; }
export interface MapGuide { id: string; name: string; mode: string; recommendations: MapRecommendation[]; reviewedAt: string; }
export type TeamMode = "5v5" | "6v6";
export interface TeamSynergy { id: string; heroes: [string, string]; score: number; type: string; reason: string; modes: TeamMode[]; reviewedAt: string; }
export interface TeamCaution { id: string; heroes: [string, string]; penalty: number; reason: string; mitigation: string; modes: TeamMode[]; reviewedAt: string; }

export const heroes = heroesJson as Hero[];
export const matchups = matchupsJson as Matchup[];
export const combos = combosJson as Combo[];
export const maps = mapsJson as MapGuide[];
export const teamSynergies = teamSynergiesJson as TeamSynergy[];
export const teamCautions = teamCautionsJson as TeamCaution[];
export const roleLabels: Record<Role, string> = { tank: "돌격", damage: "공격", support: "지원" };
export const subroleLabels: Record<string, string> = {
  stalwart: "강건한 자", initiator: "개시자", bruiser: "투사", sharpshooter: "명사수", recon: "수색가",
  specialist: "전문가", flanker: "측면 공격가", survivor: "생존왕", medic: "의무관", tactician: "전술가",
};
export const roleAccent: Record<Role, string> = { tank: "#5fd4ff", damage: "#ff7153", support: "#5af0bd" };
export function getHero(key: string) { return heroes.find((hero) => hero.key === key); }
export function getCountersFor(key: string) { return matchups.filter((matchup) => matchup.hero === key && matchup.status === "verified"); }
export function getStrongAgainst(key: string) { return matchups.filter((matchup) => matchup.counter === key && matchup.status === "verified"); }
export function getCombosFor(key: string) { return combos.filter((combo) => combo.heroes.includes(key)); }
export function hasDetailedMatchupData(matchup: Matchup) {
  return matchup.status === "verified";
}
export const detailedMatchups = matchups.filter(hasDetailedMatchupData);
export function getDetailedMatchup(pair: string) {
  return detailedMatchups.find((matchup) => `${matchup.hero}-vs-${matchup.counter}` === pair);
}
