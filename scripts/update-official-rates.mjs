import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = "https://overwatch.blizzard.com/ko-kr/rates/";
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

async function fetchSnapshot(snapshot) {
  const params = new URLSearchParams({
    input: "PC",
    map: "all-maps",
    region: "Asia",
    role: "All",
    rq: snapshot.rq,
    tier: "All",
  });
  const sourceUrl = `${baseUrl}?${params}`;
  const response = await fetch(sourceUrl, {
    headers: { "User-Agent": "OP-PICK-LAB official-statistics-snapshot" },
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
    filters: {
      input: "PC",
      inputLabel: "마우스 및 키보드",
      region: "Asia",
      regionLabel: "아시아",
      map: "all-maps",
      mapLabel: "모든 전장",
      tier: "All",
      tierLabel: "모든 등급 단계",
    },
    rows: rows.map((row) => ({
      hero: row.id,
      winRate: row.cells.winrate ?? null,
      pickRate: row.cells.pickrate ?? null,
      banRate: row.cells.banrate ?? null,
    })),
  };
}

const fetchedAt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const document = {
  fetchedAt,
  notice: "Blizzard 공식 영웅 통계의 공개 수치를 조건별 스냅샷으로 저장했습니다.",
  snapshots: await Promise.all(snapshots.map(fetchSnapshot)),
};

await writeFile(join(root, "data", "hero-rates.json"), `${JSON.stringify(document, null, 2)}\n`, "utf8");
console.log(`공식 통계 저장 완료: ${document.snapshots.length}개 조건, 각 ${document.snapshots[0].rows.length}명, ${fetchedAt}`);
