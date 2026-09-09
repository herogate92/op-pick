import { readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const officialBaseUrl = "https://overwatch.blizzard.com/ko-kr/rates/";
const overfastBaseUrl = process.env.OVERFAST_API_BASE_URL ?? "https://overfast-api.tekrop.fr/heroes/stats";
const snapshots = [
  { id: "quickplay", label: "빠른 대전 · 역할 고정", rq: "0" },
  { id: "competitive", label: "경쟁전 · 역할 고정", rq: "1" },
];

function decodeAttribute(value) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function getOfficialSourceUrl(snapshot) {
  const params = new URLSearchParams({
    input: "PC",
    map: "all-maps",
    region: "Asia",
    role: "All",
    rq: snapshot.rq,
    tier: "All",
  });
  return `${officialBaseUrl}?${params}`;
}

function getFilters() {
  return {
    input: "PC",
    inputLabel: "마우스 및 키보드",
    region: "Asia",
    regionLabel: "아시아",
    map: "all-maps",
    mapLabel: "모든 전장",
    tier: "All",
    tierLabel: "모든 등급 단계",
  };
}

async function fetchFromOverfast(snapshot) {
  const params = new URLSearchParams({
    platform: "pc",
    gamemode: snapshot.id,
    region: "asia",
    order_by: "hero:asc",
  });
  const dataProviderUrl = `${overfastBaseUrl}?${params}`;
  const response = await fetch(dataProviderUrl, {
    headers: { "User-Agent": "OP-PICK-LAB statistics-snapshot" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`OverFast API 요청 실패: ${response.status}`);

  const rows = await response.json();
  if (!Array.isArray(rows) || !rows.length) throw new Error("OverFast API 통계가 비어 있습니다.");

  return {
    id: snapshot.id,
    label: snapshot.label,
    sourceUrl: getOfficialSourceUrl(snapshot),
    dataProvider: "overfast",
    dataProviderLabel: "OverFast API",
    dataProviderUrl,
    filters: getFilters(),
    rows: rows.map((row) => ({
      hero: row.hero,
      winRate: row.winrate ?? null,
      pickRate: row.pickrate ?? null,
      banRate: null,
    })),
  };
}

async function fetchFromBlizzard(snapshot) {
  const sourceUrl = getOfficialSourceUrl(snapshot);
  const response = await fetch(sourceUrl, {
    headers: { "User-Agent": "OP-PICK-LAB statistics-snapshot" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`공식 통계 요청 실패: ${response.status} ${sourceUrl}`);

  const html = await response.text();
  const match = html.match(/<blz-data-table[^>]+allrows="([^"]+)"/);
  if (!match) throw new Error(`공식 통계 표를 찾지 못했습니다: ${sourceUrl}`);
  const rows = JSON.parse(decodeAttribute(match[1]));

  return {
    id: snapshot.id,
    label: snapshot.label,
    sourceUrl,
    dataProvider: "blizzard",
    dataProviderLabel: "Blizzard 공식 통계",
    dataProviderUrl: sourceUrl,
    filters: getFilters(),
    rows: rows.map((row) => ({
      hero: row.id,
      winRate: row.cells.winrate ?? null,
      pickRate: row.cells.pickrate ?? null,
      banRate: row.cells.banrate ?? null,
    })),
  };
}

async function fetchSnapshot(snapshot) {
  try {
    return await fetchFromOverfast(snapshot);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[${snapshot.id}] ${reason} Blizzard 원문 수집으로 대체합니다.`);
    return fetchFromBlizzard(snapshot);
  }
}

const fetchedAt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const document = {
  fetchedAt,
  notice: "Blizzard 공개 통계를 OverFast API 우선, 공식 페이지 대체 방식으로 수집했습니다. 수집일은 제공자의 집계 종료일이나 최신 패치 이후 경기만을 의미하지 않습니다.",
  snapshots: await Promise.all(snapshots.map(fetchSnapshot)),
};

// Validate both snapshots before replacing the last good file, including provider fallbacks.
const heroes = JSON.parse(await readFile(join(root, "data", "heroes.json"), "utf8"));
const expectedKeys = new Set(heroes.map((hero) => hero.key));
for (const snapshot of document.snapshots) {
  const seen = new Set();
  if (snapshot.rows.length !== expectedKeys.size) throw new Error(`${snapshot.id}: 영웅 수 불일치; 기존 스냅샷을 보존합니다.`);
  for (const row of snapshot.rows) {
    if (!expectedKeys.has(row.hero) || seen.has(row.hero)) throw new Error(`${snapshot.id}: 중복 또는 알 수 없는 영웅 ${row.hero}`);
    seen.add(row.hero);
    for (const value of [row.winRate, row.pickRate, row.banRate]) {
      if (value !== null && (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100)) throw new Error(`${snapshot.id}/${row.hero}: 잘못된 통계 값`);
    }
  }
  if (!snapshot.rows.some((row) => row.winRate !== null && row.pickRate !== null)) throw new Error(`${snapshot.id}: 유효 통계 없음`);
}
const destination = join(root, "data", "hero-rates.json");
const temporary = `${destination}.${process.pid}.tmp`;
await writeFile(temporary, `${JSON.stringify(document, null, 2)}\n`, "utf8");
await rename(temporary, destination);
const providers = [...new Set(document.snapshots.map((snapshot) => snapshot.dataProviderLabel))].join(", ");
console.log(`통계 저장 완료: ${document.snapshots.length}개 조건, 각 ${document.snapshots[0].rows.length}명, ${providers}, ${fetchedAt}`);
