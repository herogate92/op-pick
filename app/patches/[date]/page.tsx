import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, ClipboardCheck, ExternalLink, Shield } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { ShareButton } from "@/components/ShareButton";
import { SiteHeader } from "@/components/SiteHeader";
import { heroRates, patches, roleLabels } from "@/lib/data";
import { decisionLabels, getPatchSummary, patchDateLabel, patchDescription, patchSummaries, patchTitle, type PatchReviewItem } from "@/lib/patches";
import { findPrePatchBaseline, rateDelta, validateHistory, type StatsHistory } from "@/lib/stats-history";
import historyJson from "@/public/stats-history.json";

export function generateStaticParams() {
  return patches.map((patch) => ({ date: patch.date }));
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  const patch = getPatchSummary(date);
  if (!patch) return {};
  const title = patchTitle(patch);
  const description = patchDescription(patch);
  return {
    title, description, alternates: { canonical: `/patches/${patch.date}/` },
    openGraph: { title, description, url: `/patches/${patch.date}/`, type: "article" },
  };
}

const percent = (value: number | null | undefined) => value == null ? "--" : `${value.toFixed(1)}%`;
function Delta({ value }: { value: number | null }) {
  if (value == null) return null;
  return <em className={value > 0 ? "up" : value < 0 ? "down" : undefined}>{value > 0 ? "+" : ""}{value.toFixed(1)}%p</em>;
}

export default async function PatchDetailPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const patch = getPatchSummary(date);
  if (!patch) notFound();
  const label = patchDateLabel(patch.date);
  const index = patchSummaries.indexOf(patch);
  const newer = patchSummaries[index - 1];
  const older = patchSummaries[index + 1];

  validateHistory(historyJson);
  const history: StatsHistory = historyJson;
  const snapshot = heroRates.snapshots.find((item) => item.id === "competitive");
  // Before/after only makes sense for the newest patch; older pages show today's numbers, which include later patches.
  const isLatest = index === 0;
  const collectedAfter = (heroRates.fetchedAtIso ?? "").slice(0, 10) >= patch.date;
  const baseline = snapshot && isLatest && collectedAfter ? findPrePatchBaseline(history, snapshot, patch.date) : null;
  const reviewTotal = patch.reviews.length;

  const pageUrl = `https://opick.ggwp.kr/patches/${patch.date}/`;
  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "WebPage", name: patchTitle(patch), description: patchDescription(patch),
      url: pageUrl, inLanguage: "ko-KR", dateModified: patch.lastReviewedAt ?? patch.date,
      isPartOf: { "@type": "WebSite", name: "OP PICK LAB", url: "https://opick.ggwp.kr/" },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: "https://opick.ggwp.kr/" },
        { "@type": "ListItem", position: 2, name: "패치 정리", item: "https://opick.ggwp.kr/patches/" },
        { "@type": "ListItem", position: 3, name: `${label.short} 패치`, item: pageUrl },
      ],
    },
  ];

  return (
    <main className="page-shell patch-page seo-detail-page">
      <JsonLd data={jsonLd} />
      <SiteHeader active="patches" />
      <section className="page-intro seo-detail-intro">
        <span className="section-kicker">PATCH NOTES · {patch.date}</span>
        <h1>{label.short} 패치 <em>변경 정리</em></h1>
        <p>{patchDescription(patch)}</p>
      </section>
      <div className="content-with-rail">
        <div className="page-content">
          <section className="seo-guide-summary">
            <span><CalendarDays aria-hidden="true" />{label.long} 라이브 패치</span>
            <span><Shield aria-hidden="true" />영웅 변경 {patch.changes.length}명</span>
            <span><ClipboardCheck aria-hidden="true" />콘텐츠 재검토 {reviewTotal}건</span>
            <Link href="/patches/"><ArrowLeft aria-hidden="true" />전체 패치</Link>
            <ShareButton title={`${patchTitle(patch)} · OP PICK LAB`} path={`/patches/${patch.date}/`} />
          </section>
          {patch.scope && <p className="seo-guide-note">패치 범위: {patch.scope}</p>}

          <section className="content-section patch-section" aria-labelledby="patch-changes-title">
            <div className="section-heading"><span className="section-kicker">01 · HERO CHANGES</span><h2 id="patch-changes-title">영웅 변경 사항</h2><p>공식 패치 노트를 한국어로 정리했습니다. 공개되지 않은 수치는 추정하지 않습니다. <a href={patch.sourceUrl} target="_blank" rel="noreferrer">공식 패치 노트 원문(영문) <ExternalLink size={12} aria-hidden="true" /></a></p></div>
            {patch.changes.length ? <div className="patch-change-grid">{patch.changes.map(({ hero, summary, abilities }) => (
              <article key={hero.key} className="patch-change-card">
                <Link href={`/heroes/${hero.key}/`} className="seo-guide-hero">
                  {/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt={`${hero.name} 영웅 초상`} />
                  <span><strong>{hero.name}</strong><small>{roleLabels[hero.role]}</small></span>
                  <em>영웅 정보</em>
                </Link>
                {summary && <p>{summary}</p>}
                {abilities.length > 0 && <ul>{abilities.map((ability) => <li key={ability.name}><strong>{ability.name}</strong>{ability.summary}</li>)}</ul>}
              </article>
            ))}</div> : <p className="seo-guide-note">이 패치에서 영웅 설명에 반영한 변경이 없습니다.</p>}
          </section>

          {snapshot && patch.changes.length > 0 && <section className="content-section patch-section" aria-labelledby="patch-stats-title">
            <div className="section-heading"><span className="section-kicker">02 · CURRENT STATS</span><h2 id="patch-stats-title">변경 영웅의 현재 통계</h2><p>{snapshot.label} · {snapshot.filters.inputLabel} · {snapshot.filters.regionLabel} · {snapshot.filters.tierLabel} · {snapshot.filters.mapLabel} · 수집 {heroRates.fetchedAt}</p></div>
            <div className="patch-stats-wrap"><table className="patch-stats-table">
              <thead><tr><th scope="col">영웅</th><th scope="col">승률</th><th scope="col">픽률</th><th scope="col">밴률</th></tr></thead>
              <tbody>{patch.changes.map(({ hero }) => {
                const row = snapshot.rows.find((item) => item.hero === hero.key);
                const before = baseline?.snapshot.rows.find((item) => item.hero === hero.key);
                return <tr key={hero.key}>
                  <th scope="row"><Link href={`/heroes/${hero.key}/#stats-${snapshot.id}`}>{hero.name}</Link></th>
                  <td>{percent(row?.winRate)}<Delta value={rateDelta(row?.winRate, before?.winRate)} /></td>
                  <td>{percent(row?.pickRate)}<Delta value={rateDelta(row?.pickRate, before?.pickRate)} /></td>
                  <td>{percent(row?.banRate)}<Delta value={rateDelta(row?.banRate, before?.banRate)} /></td>
                </tr>;
              })}</tbody>
            </table></div>
            <p className="seo-guide-note">{baseline
              ? `증감은 패치 전 마지막 수집(${baseline.collectedAt.slice(0, 10)}) 대비 %p입니다. 제공자의 집계 기간 기준이며 패치 이후 경기만의 통계가 아닙니다.`
              : isLatest ? "이 패치 이전에 같은 조건으로 수집한 자료가 없어 증감은 표시하지 않습니다." : "이후 패치가 반영된 현재 수치이며 이 패치의 전후 비교가 아닙니다."} 다른 지역·등급·전장은 <Link href="/rates/">승률·픽률·밴률</Link>에서 확인하세요.</p>
          </section>}

          <section className="content-section patch-section" aria-labelledby="patch-review-title">
            <div className="section-heading"><span className="section-kicker">03 · CONTENT REVIEW</span><h2 id="patch-review-title">상성·조합·맵 재검토 기록</h2><p>이 패치와 관련된 OP PICK LAB 콘텐츠를 다시 확인한 기록입니다. 자료 검토이며 게임 내 재현 검증이 아닙니다.</p></div>
            {reviewTotal ? <>
              <p className="patch-review-counts">{(["updated", "no-change", "deferred"] as const).map((decision) => <span key={decision} className={`decision-${decision}`}>{decisionLabels[decision]} <strong>{patch.counts[decision]}</strong>건</span>)}</p>
              {(["updated", "no-change", "deferred"] as const).map((decision) => {
                const items = patch.reviews.filter((item) => item.decision === decision);
                if (!items.length) return null;
                return decision === "updated"
                  ? <section key={decision} className="patch-review-group"><h3>{decisionLabels[decision]} <small>{items.length}건</small></h3><ReviewList items={items} /></section>
                  : <details key={decision} className="patch-review-group"><summary>{decisionLabels[decision]} <small>{items.length}건</small></summary><ReviewList items={items} /></details>;
              })}
            </> : <p className="seo-guide-note">아직 기록한 재검토 결과가 없습니다.</p>}
            <p className="seo-guide-note">검토 당시 기록입니다. 이후 내용이 바뀐 항목과 대기 중인 항목은 <a href="/patch-review.html">패치 재검토 현황</a>에서 확인하세요.</p>
          </section>

          <nav className="patch-pager" aria-label="다른 패치">
            {older ? <Link href={`/patches/${older.date}/`}><ArrowLeft aria-hidden="true" /><span><small>이전 패치</small>{patchDateLabel(older.date).short}</span></Link> : <span />}
            {newer && <Link href={`/patches/${newer.date}/`}><span><small>다음 패치</small>{patchDateLabel(newer.date).short}</span><ArrowRight aria-hidden="true" /></Link>}
          </nav>
          <AdSlot kind="banner" />
        </div>
        <AdSlot kind="rail" />
      </div>
    </main>
  );
}

function ReviewList({ items }: { items: PatchReviewItem[] }) {
  return <ul className="patch-review-list">{items.map((item) => (
    <li key={item.key}>
      <div><span>{item.category}</span>{item.href ? <Link prefetch={false} href={item.href}>{item.label}</Link> : <strong>{item.label}</strong>}</div>
      <p>{item.summary}</p>
      {item.recheckRequirement && <p className="patch-recheck">다시 확인할 조건: {item.recheckRequirement}</p>}
      <small>기록 {item.reviewedAt}</small>
    </li>
  ))}</ul>;
}
