import { patchDescription, patchesLastReviewedAt, patchSummaries, patchTitle } from "@/lib/patches";

export const dynamic = "force-static";

const base = "https://opick.ggwp.kr";
const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]!);
// Patch dates are Korean publication days; midnight KST keeps the item on that day for Korean readers.
const rssDate = (date: string) => new Date(`${date}T00:00:00+09:00`).toUTCString();

export function GET() {
  const items = patchSummaries.map((patch) => {
    const url = `${base}/patches/${patch.date}/`;
    return `<item><title>${escapeXml(patchTitle(patch))}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${rssDate(patch.date)}</pubDate><description>${escapeXml(patchDescription(patch))}</description></item>`;
  }).join("");
  const updated = patchesLastReviewedAt ? `<lastBuildDate>${rssDate(patchesLastReviewedAt)}</lastBuildDate>` : "";
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>OP PICK LAB 패치 변경 정리</title><link>${base}/patches/</link><atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/><description>오버워치 라이브 패치별 영웅 변경과 상성·조합 재검토 결과</description><language>ko</language>${updated}${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
