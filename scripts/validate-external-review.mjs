import { access, readFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const input = process.argv[2];

if (!input) {
  console.error("사용법: npm run data:review -- <검증 결과 폴더>");
  process.exit(2);
}

const reviewRoot = isAbsolute(input) ? input : resolve(process.cwd(), input);
const requiredFiles = [
  "matchup_review.json",
  "matchup_corrections.json",
  "matchups_expanded_master.json",
];

for (const file of requiredFiles) {
  try {
    await access(join(reviewRoot, file));
  } catch {
    console.error(`필수 파일 누락: ${file}`);
    process.exit(2);
  }
}

const loadJson = (path) => readFile(path, "utf8").then(JSON.parse);
const [heroes, reviewDocument, corrections, expanded] = await Promise.all([
  loadJson(join(root, "data", "heroes.json")),
  loadJson(join(reviewRoot, "matchup_review.json")),
  loadJson(join(reviewRoot, "matchup_corrections.json")),
  loadJson(join(reviewRoot, "matchups_expanded_master.json")),
]);

const heroKeys = new Set(heroes.map((hero) => hero.key));
const grammarPattern = /은\(는\)|이\(가\)|을\(를\)/;
const genericPattern = /핵심 운영을 무력화|전술적 교전 조건을 형성|유기적인 협공으로 .* 먼저 정리/;
const validCounterPickPath = /^https:\/\/counterpickgg\.com\/heroes\/[a-z0-9-]+\/?$/i;
const issues = [];

function addIssue(severity, code, message, ids = []) {
  issues.push({ severity, code, message, ids: ids.slice(0, 8) });
}

function validateRows(label, rows, fields) {
  if (!Array.isArray(rows)) {
    addIssue("error", `${label}.type`, `${label} 항목이 배열이 아닙니다.`);
    return;
  }

  const ids = new Set();
  const duplicates = [];
  const unknown = [];
  const incomplete = [];
  const templated = [];

  for (const row of rows) {
    if (!row?.id || ids.has(row.id)) duplicates.push(row?.id ?? "(id 없음)");
    if (row?.id) ids.add(row.id);
    if (!heroKeys.has(row?.hero) || !heroKeys.has(row?.counter)) unknown.push(row?.id ?? "(id 없음)");

    const copy = fields.map((field) => row?.[field] ?? "").join(" ");
    if (grammarPattern.test(copy)) incomplete.push(row?.id ?? "(id 없음)");
    if (genericPattern.test(copy)) templated.push(row?.id ?? "(id 없음)");
  }

  if (duplicates.length) addIssue("error", `${label}.duplicate`, `${label}에 중복 또는 누락 ID가 ${duplicates.length}건 있습니다.`, duplicates);
  if (unknown.length) addIssue("error", `${label}.hero`, `${label}에 현재 사이트에 없는 영웅 키가 ${unknown.length}건 있습니다.`, unknown);
  if (incomplete.length) addIssue("error", `${label}.grammar`, `${label}에 미완성 조사 표기가 ${incomplete.length}/${rows.length}건 있습니다.`, incomplete);
  if (templated.length) addIssue("error", `${label}.template`, `${label}에 일반화된 템플릿 문장이 ${templated.length}/${rows.length}건 있습니다.`, templated);
}

const reviews = reviewDocument?.reviews;
validateRows("reviews", reviews, ["reasonKo", "conditionKo", "counterplayKo"]);
validateRows("corrections", corrections, ["reason", "condition", "counterplay"]);
validateRows("expanded", expanded, ["reason", "condition", "counterplay"]);

if (Array.isArray(reviews) && reviewDocument?.metadata?.total !== reviews.length) {
  addIssue("error", "metadata.total", `metadata.total(${reviewDocument?.metadata?.total})과 실제 reviews(${reviews.length})가 다릅니다.`);
}

const confirmed = Array.isArray(reviews) ? reviews.filter((row) => row.verdict === "confirmed") : [];
const confirmedWithBadCopy = confirmed.filter((row) => grammarPattern.test(`${row.reasonKo} ${row.conditionKo} ${row.counterplayKo}`));
if (confirmedWithBadCopy.length) {
  addIssue("error", "confirmed.quality", `확정 판정 중 ${confirmedWithBadCopy.length}/${confirmed.length}건이 미완성 문장을 포함합니다.`, confirmedWithBadCopy.map((row) => row.id));
}

const evidenceRows = Array.isArray(corrections)
  ? corrections.flatMap((row) => (row.evidence ?? []).map((evidence) => ({ id: row.id, evidence })))
  : [];
const malformedEvidence = evidenceRows.filter(({ evidence }) => !evidence || typeof evidence !== "object" || !evidence.url || !evidence.title);
if (malformedEvidence.length) {
  addIssue("error", "evidence.shape", `구조가 불완전한 출처가 ${malformedEvidence.length}건 있습니다.`, malformedEvidence.map((row) => row.id));
}

const invalidCounterPick = evidenceRows.filter(({ evidence }) =>
  typeof evidence?.url === "string" && evidence.url.includes("counterpickgg.com") && !validCounterPickPath.test(evidence.url),
);
if (invalidCounterPick.length) {
  addIssue("error", "evidence.counterpick-path", `실제 CounterPickGG 영웅 페이지 형식과 다른 출처 URL이 ${invalidCounterPick.length}건 있습니다.`, invalidCounterPick.map((row) => row.id));
}

const counts = {
  heroes: heroes.length,
  reviews: Array.isArray(reviews) ? reviews.length : 0,
  corrections: Array.isArray(corrections) ? corrections.length : 0,
  expanded: Array.isArray(expanded) ? expanded.length : 0,
  confirmed: confirmed.length,
  errors: issues.filter((issue) => issue.severity === "error").length,
};

console.log(`외부 데이터 검증: 영웅 ${counts.heroes}, 검토 ${counts.reviews}, 수정 ${counts.corrections}, 확장 ${counts.expanded}`);
for (const issue of issues) {
  const examples = issue.ids.length ? ` 예: ${issue.ids.join(", ")}` : "";
  console.error(`[${issue.severity.toUpperCase()}] ${issue.code}: ${issue.message}${examples}`);
}

if (counts.errors) {
  console.error(`병합 차단: 오류 범주 ${counts.errors}개를 먼저 해결해야 합니다.`);
  process.exit(1);
}

console.log("병합 전 자동 검사 통과");
