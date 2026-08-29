import heroesJson from "@/data/heroes.json";
import matchupsJson from "@/data/matchups.json";
import combosJson from "@/data/combos.json";
import mapsJson from "@/data/maps.json";

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
export interface Matchup { id: string; hero: string; counter: string; score: number; reason: string; condition: string; reviewedAt: string; }
export interface Combo { id: string; name: string; heroes: string[]; score: number; difficulty: number; description: string; timing: string; counters: string[]; reviewedAt: string; }
export interface MapRecommendation { hero: string; rank: number; winRate: number; note: string; }
export interface MapGuide { id: string; name: string; mode: string; recommendations: MapRecommendation[]; reviewedAt: string; }

export const heroes = heroesJson as Hero[];
export const matchups = matchupsJson as Matchup[];
export const combos = combosJson as Combo[];
export const maps = mapsJson as MapGuide[];
export const roleLabels: Record<Role, string> = { tank: "돌격", damage: "공격", support: "지원" };
export const subroleLabels: Record<string, string> = {
  stalwart: "강건한 자", initiator: "개시자", bruiser: "투사", sharpshooter: "명사수", recon: "수색가",
  specialist: "전문가", flanker: "측면 공격가", survivor: "생존왕", medic: "의무관", tactician: "전술가",
};
export const roleAccent: Record<Role, string> = { tank: "#5fd4ff", damage: "#ff7153", support: "#5af0bd" };
export function getHero(key: string) { return heroes.find((hero) => hero.key === key); }
export function getCountersFor(key: string) { return matchups.filter((matchup) => matchup.hero === key); }
export function getStrongAgainst(key: string) { return matchups.filter((matchup) => matchup.counter === key); }
export function getCombosFor(key: string) { return combos.filter((combo) => combo.heroes.includes(key)); }
