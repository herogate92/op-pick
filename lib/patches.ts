import { combos, getHero, heldCombos, heldTeamSynergies, heroes, maps, matchups, patchReviewDecisions, patches, teamCautions, teamSynergies } from "./data";
import type { Hero, PatchRecord, ReviewDecision } from "./data";

export const decisionLabels: Record<ReviewDecision, string> = { updated: "내용 갱신", "no-change": "변경 없음 확인", deferred: "근거 보강 대기" };
const decisionOrder: ReviewDecision[] = ["updated", "no-change", "deferred"];
const categoryOrder = ["기술", "상성", "조합", "주의 조합", "맵"];

export interface PatchHeroChange { hero: Hero; summary?: string; abilities: { name: string; summary: string }[] }
export interface PatchReviewItem {
  key: string; category: string; label: string; href?: string; decision: ReviewDecision;
  reviewedAt: string; summary: string; recheckRequirement?: string;
}
export interface PatchSummary extends PatchRecord {
  changes: PatchHeroChange[];
  // The per-patch "전체 규칙" decision, written after reading the whole official entry.
  scope?: string;
  reviews: PatchReviewItem[];
  counts: Record<ReviewDecision, number>;
  lastReviewedAt?: string;
}

const heroName = (key: string) => getHero(key)?.name ?? key;

function reviewTarget(category: string, id: string): { label: string; href?: string } {
  if (category === "기술") return { label: `${heroName(id)} 기술 설명`, href: `/heroes/${id}/` };
  if (category === "상성") {
    const matchup = matchups.find(item => item.id === id);
    if (matchup) return {
      label: `${heroName(matchup.hero)} vs ${heroName(matchup.counter)}`,
      href: matchup.status === "verified" ? `/matchups/${matchup.hero}-vs-${matchup.counter}/` : `/matchups/?hero=${matchup.hero}&opponent=${matchup.counter}`,
    };
  }
  if (category === "조합" || category === "주의 조합") {
    const record = [...combos, ...heldCombos, ...teamSynergies, ...heldTeamSynergies, ...teamCautions].find(item => item.id === id);
    if (record) return { label: "name" in record && record.name ? record.name : record.heroes.map(heroName).join(" · "), href: "/combos/" };
  }
  if (category === "맵") {
    const [mapId, heroKey] = id.split(":");
    const map = maps.find(item => item.id === mapId);
    if (map) return { label: `${map.name} · ${heroName(heroKey)}`, href: `/maps/${map.id}/` };
  }
  return { label: id };
}

function patchChanges(date: string): PatchHeroChange[] {
  return heroes.flatMap(hero => {
    const abilities = [...hero.abilities, ...hero.perks.minor, ...hero.perks.major]
      .filter(ability => ability.patchNote?.date === date)
      .map(ability => ({ name: ability.name, summary: ability.patchNote!.summary }));
    const summary = hero.patchNote?.date === date ? hero.patchNote.summary : undefined;
    return summary || abilities.length ? [{ hero, summary, abilities }] : [];
  }).sort((a, b) => b.abilities.length - a.abilities.length || a.hero.name.localeCompare(b.hero.name, "ko"));
}

function summarize(patch: PatchRecord): PatchSummary {
  const decisions = patchReviewDecisions.filter(item => item.patchDigest === patch.digest);
  const reviews = decisions.filter(item => item.category !== "전체 규칙").map(item => ({
    ...reviewTarget(item.category, item.id), key: `${item.category}:${item.id}`, category: item.category, decision: item.decision,
    reviewedAt: item.reviewedAt, summary: item.summary, recheckRequirement: item.recheckRequirement,
  })).sort((a, b) => decisionOrder.indexOf(a.decision) - decisionOrder.indexOf(b.decision)
    || categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
    || a.label.localeCompare(b.label, "ko"));
  const counts = { updated: 0, "no-change": 0, deferred: 0 };
  for (const item of reviews) counts[item.decision] += 1;
  return {
    ...patch, changes: patchChanges(patch.date), reviews, counts,
    scope: decisions.find(item => item.category === "전체 규칙")?.summary,
    lastReviewedAt: decisions.map(item => item.reviewedAt).sort().at(-1),
  };
}

export const patchSummaries = patches.map(summarize);
export const patchesLastReviewedAt = patchSummaries.map(patch => patch.lastReviewedAt ?? patch.date).sort().at(-1);
export function getPatchSummary(date: string) { return patchSummaries.find(patch => patch.date === date); }

export function patchDateLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { short: `${month}월 ${day}일`, long: `${year}년 ${month}월 ${day}일` };
}
export function patchTitle(patch: PatchSummary) {
  const names = patch.changes.map(change => change.hero.name).join("·");
  return `오버워치 ${patchDateLabel(patch.date).short} 패치${names ? `: ${names}` : ""} 변경 정리`;
}
export function patchDescription(patch: PatchSummary) {
  const names = patch.changes.map(change => change.hero.name).join("·");
  return `${patchDateLabel(patch.date).long} 오버워치 라이브 패치의 ${names ? `${names} 변경 내용, ` : ""}상성·조합·맵 추천 재검토 결과와 현재 승률을 정리했습니다.`;
}
