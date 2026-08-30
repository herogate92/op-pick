import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = async (name) => JSON.parse(await readFile(join(root, "data", name), "utf8"));
const [heroes, matchups, combos, maps, teamSynergies, teamCautions, heroRates] = await Promise.all([
  read("heroes.json"),
  read("matchups.json"),
  read("combos.json"),
  read("maps.json"),
  read("team-synergies.json"),
  read("team-cautions.json"),
  read("hero-rates.json"),
]);

const errors = [];
const keys = new Set();
for (const hero of heroes) {
  if (!hero.key || keys.has(hero.key)) errors.push(`중복 또는 빈 hero key: ${hero.key}`);
  keys.add(hero.key);
  if (!hero.name || !["tank", "damage", "support"].includes(hero.role)) errors.push(`영웅 기본값 오류: ${hero.key}`);
  if (!hero.sourceUrl || !hero.checkedAt) errors.push(`영웅 출처 누락: ${hero.key}`);
  if (!Array.isArray(hero.abilities)) errors.push(`기술 목록 오류: ${hero.key}`);
  for (const ability of hero.abilities ?? []) {
    if (ability.video && (!ability.video.mp4 && !ability.video.webm)) errors.push(`기술 영상 주소 누락: ${hero.key}/${ability.name}`);
    if (ability.stats && (!Array.isArray(ability.stats) || !ability.stats.length)) errors.push(`기술 수치 형식 오류: ${hero.key}/${ability.name}`);
    if (ability.stats?.some((stat) => !stat.label || !stat.value)) errors.push(`기술 수치 값 누락: ${hero.key}/${ability.name}`);
    if (ability.stats && !ability.statsCheckedAt) errors.push(`기술 수치 확인일 누락: ${hero.key}/${ability.name}`);
  }
  if (!Array.isArray(hero.storyChapters)) errors.push(`스토리 챕터 형식 오류: ${hero.key}`);
  if (hero.storyMedia && !hero.storyMedia.link) errors.push(`스토리 미디어 주소 누락: ${hero.key}`);
}

const matchupIds = new Set();
const genericMatchupPattern = /핵심 운영을 방해하거나|통계·평가는 패치/;
const validMatchupStatuses = new Set(["verified", "provisional"]);
const validMatchupConfidence = new Set(["high", "medium", "low"]);
for (const matchup of matchups) {
  if (!keys.has(matchup.hero) || !keys.has(matchup.counter)) errors.push(`존재하지 않는 상성 영웅: ${matchup.hero}/${matchup.counter}`);
  if (matchup.score < 1 || matchup.score > 5) errors.push(`상성 점수 범위 오류: ${matchup.id}`);
  if (!matchup.reviewedAt) errors.push(`상성 검수일 누락: ${matchup.id}`);
  if (!validMatchupStatuses.has(matchup.status)) errors.push(`상성 검증 상태 오류: ${matchup.id}`);
  if (!validMatchupConfidence.has(matchup.confidence)) errors.push(`상성 신뢰도 오류: ${matchup.id}`);
  if (!matchup.patchBasis || !matchup.counterplay) errors.push(`상성 기준 또는 대응법 누락: ${matchup.id}`);
  if (matchup.status === "verified" && genericMatchupPattern.test(`${matchup.reason} ${matchup.condition}`)) errors.push(`검증 상성에 일반 문구 사용: ${matchup.id}`);
  if (matchup.status === "provisional" && matchup.confidence !== "low") errors.push(`미검증 상성 신뢰도 오류: ${matchup.id}`);
  if (matchup.confidence === "high" && (!Array.isArray(matchup.evidence) || matchup.evidence.length < 2)) errors.push(`고신뢰 상성 교차 검증 근거 누락: ${matchup.id}`);
  const id = `${matchup.hero}:${matchup.counter}`;
  if (matchupIds.has(id)) errors.push(`중복 상성: ${id}`);
  matchupIds.add(id);
}

const mapIds = new Set();
const validMapModes = new Set(["쟁탈", "호위", "혼합", "밀기", "플래시포인트", "기타"]);
for (const map of maps) {
  if (!map.id || mapIds.has(map.id)) errors.push(`중복 또는 빈 맵 ID: ${map.id}`);
  mapIds.add(map.id);
  if (!map.name || !validMapModes.has(map.mode)) errors.push(`맵 기본값 오류: ${map.id}`);
  if (!map.reviewedAt) errors.push(`맵 검수일 누락: ${map.id}`);
  if (!Array.isArray(map.recommendations) || !map.recommendations.length) errors.push(`맵 추천 누락: ${map.id}`);
  for (const recommendation of map.recommendations ?? []) {
    if (!keys.has(recommendation.hero)) errors.push(`존재하지 않는 맵 추천 영웅: ${map.id}/${recommendation.hero}`);
    if (recommendation.rank < 1 || recommendation.rank > 3) errors.push(`맵 추천 순위 오류: ${map.id}/${recommendation.hero}`);
    if (recommendation.winRate < 0 || recommendation.winRate > 100) errors.push(`맵 추천 승률 오류: ${map.id}/${recommendation.hero}`);
    if (!recommendation.note) errors.push(`맵 추천 설명 누락: ${map.id}/${recommendation.hero}`);
  }
}

for (const combo of combos) {
  if (!combo.heroes?.every((key) => keys.has(key))) errors.push(`존재하지 않는 조합 영웅: ${combo.id}`);
  if (combo.score < 1 || combo.score > 5 || combo.difficulty < 1 || combo.difficulty > 5) errors.push(`조합 점수 범위 오류: ${combo.id}`);
  if (!combo.reviewedAt) errors.push(`조합 검수일 누락: ${combo.id}`);
}

const validTeamModes = new Set(["5v5", "6v6"]);
const synergyIds = new Set();
for (const synergy of teamSynergies) {
  if (!synergy.id || synergyIds.has(synergy.id)) errors.push(`중복 또는 빈 팀 시너지 ID: ${synergy.id}`);
  synergyIds.add(synergy.id);
  if (synergy.heroes?.length !== 2 || !synergy.heroes.every((key) => keys.has(key)) || synergy.heroes[0] === synergy.heroes[1]) errors.push(`팀 시너지 영웅 오류: ${synergy.id}`);
  if (synergy.score < 1 || synergy.score > 5) errors.push(`팀 시너지 점수 범위 오류: ${synergy.id}`);
  if (!synergy.reason || !synergy.type || !synergy.reviewedAt) errors.push(`팀 시너지 설명 또는 검수일 누락: ${synergy.id}`);
  if (!synergy.modes?.length || !synergy.modes.every((mode) => validTeamModes.has(mode))) errors.push(`팀 시너지 모드 오류: ${synergy.id}`);
}

const cautionIds = new Set();
for (const caution of teamCautions) {
  if (!caution.id || cautionIds.has(caution.id)) errors.push(`중복 또는 빈 주의 조합 ID: ${caution.id}`);
  cautionIds.add(caution.id);
  if (caution.heroes?.length !== 2 || !caution.heroes.every((key) => keys.has(key)) || caution.heroes[0] === caution.heroes[1]) errors.push(`주의 조합 영웅 오류: ${caution.id}`);
  if (caution.penalty < 1 || caution.penalty > 5) errors.push(`주의 조합 감점 범위 오류: ${caution.id}`);
  if (!caution.reason || !caution.mitigation || !caution.reviewedAt) errors.push(`주의 조합 설명 또는 검수일 누락: ${caution.id}`);
  if (!caution.modes?.length || !caution.modes.every((mode) => validTeamModes.has(mode))) errors.push(`주의 조합 모드 오류: ${caution.id}`);
}

if (!heroRates.fetchedAt || !Array.isArray(heroRates.snapshots) || !heroRates.snapshots.length) errors.push("공식 통계 스냅샷 누락");
for (const snapshot of heroRates.snapshots ?? []) {
  if (!snapshot.id || !snapshot.label || !snapshot.sourceUrl?.startsWith("https://overwatch.blizzard.com/")) errors.push(`공식 통계 메타데이터 오류: ${snapshot.id}`);
  if (snapshot.rows?.length !== heroes.length) errors.push(`공식 통계 영웅 수 불일치: ${snapshot.id}/${snapshot.rows?.length}`);
  const rateKeys = new Set();
  for (const row of snapshot.rows ?? []) {
    if (!keys.has(row.hero) || rateKeys.has(row.hero)) errors.push(`공식 통계 영웅 키 오류: ${snapshot.id}/${row.hero}`);
    rateKeys.add(row.hero);
    for (const [label, value] of [["승률", row.winRate], ["픽률", row.pickRate], ["금지율", row.banRate]]) {
      if (value !== null && (typeof value !== "number" || value < 0 || value > 100)) errors.push(`공식 통계 ${label} 범위 오류: ${snapshot.id}/${row.hero}`);
    }
  }
}

if (!heroes.some((hero) => hero.name === "D.Va")) errors.push("D.Va 이름 검증 실패");
if (!heroes.some((hero) => hero.name === "솔저: 76")) errors.push("솔저: 76 이름 검증 실패");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const verifiedMatchups = matchups.filter((matchup) => matchup.status === "verified").length;
console.log(`데이터 검증 완료: 영웅 ${heroes.length}, 상성 ${matchups.length}(검증 ${verifiedMatchups}, 검토 필요 ${matchups.length - verifiedMatchups}), 궁 조합 ${combos.length}, 팀 시너지 ${teamSynergies.length}, 주의 조합 ${teamCautions.length}, 맵 ${maps.length}, 맵 추천 ${maps.reduce((sum, map) => sum + map.recommendations.length, 0)}, 공식 통계 ${heroRates.snapshots.length}개 조건`);
