import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = async (name) => JSON.parse(await readFile(join(root, "data", name), "utf8"));
const [heroes, matchups, combos, maps] = await Promise.all([
  read("heroes.json"),
  read("matchups.json"),
  read("combos.json"),
  read("maps.json"),
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
for (const matchup of matchups) {
  if (!keys.has(matchup.hero) || !keys.has(matchup.counter)) errors.push(`존재하지 않는 상성 영웅: ${matchup.hero}/${matchup.counter}`);
  if (matchup.score < 1 || matchup.score > 5) errors.push(`상성 점수 범위 오류: ${matchup.id}`);
  if (!matchup.reviewedAt) errors.push(`상성 검수일 누락: ${matchup.id}`);
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

if (!heroes.some((hero) => hero.name === "D.Va")) errors.push("D.Va 이름 검증 실패");
if (!heroes.some((hero) => hero.name === "솔저: 76")) errors.push("솔저: 76 이름 검증 실패");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`데이터 검증 완료: 영웅 ${heroes.length}, 상성 ${matchups.length}, 조합 ${combos.length}, 맵 ${maps.length}, 맵 추천 ${maps.reduce((sum, map) => sum + map.recommendations.length, 0)}`);
