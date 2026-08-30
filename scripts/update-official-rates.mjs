import { writeFile } from "node:fs/promises";
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
  notice: "Blizzard 공개 통계를 OverFast API 우선, 공식 페이지 대체 방식으로 갱신한 조건별 스냅샷입니다.",
  snapshots: await Promise.all(snapshots.map(fetchSnapshot)),
};

await writeFile(join(root, "data", "hero-rates.json"), `${JSON.stringify(document, null, 2)}\n`, "utf8");
const providers = [...new Set(document.snapshots.map((snapshot) => snapshot.dataProviderLabel))].join(", ");
console.log(`통계 저장 완료: ${document.snapshots.length}개 조건, 각 ${document.snapshots[0].rows.length}명, ${providers}, ${fetchedAt}`);
