import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [heroes, matchups] = await Promise.all([
  readFile(join(root, "data", "heroes.json"), "utf8").then(JSON.parse),
  readFile(join(root, "data", "matchups.json"), "utf8").then(JSON.parse),
]);

const genericPattern = /핵심 운영을 방해하거나|통계·평가는 패치/;
const verified = matchups.filter((item) => item.status === "verified");
const provisional = matchups.filter((item) => item.status === "provisional");
const highConfidence = verified.filter((item) => item.confidence === "high");
const invalidVerified = verified.filter((item) => genericPattern.test(`${item.reason} ${item.condition}`));
const coverage = heroes.map((hero) => ({
  key: hero.key,
  name: hero.name,
  verified: verified.filter((item) => item.hero === hero.key).length,
  provisional: provisional.filter((item) => item.hero === hero.key).length,
}));
const uncovered = coverage.filter((item) => item.verified === 0);
const belowTarget = coverage.filter((item) => item.verified < 3);

console.log(`상성 데이터 감사: 전체 ${matchups.length}, 검증 ${verified.length}(교차 검증 ${highConfidence.length}), 검토 필요 ${provisional.length}`);
console.log(`영웅별 검증 3개 미만: ${belowTarget.length}명 / 검증 0개: ${uncovered.length}명`);
if (uncovered.length) console.log(`검증 0개 영웅: ${uncovered.map((item) => item.name).join(", ")}`);

if (invalidVerified.length) {
  console.error(`일반 문구가 포함된 검증 데이터: ${invalidVerified.map((item) => item.id).join(", ")}`);
  process.exit(1);
}
