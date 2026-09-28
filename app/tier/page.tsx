import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, CalendarDays, TrendingDown, TrendingUp } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { ShareButton } from "@/components/ShareButton";
import { SiteHeader } from "@/components/SiteHeader";
import { TierImageButton } from "@/components/TierImageButton";
import { getHero, heroRates, roleLabels, type HeroRateSnapshot } from "@/lib/data";
import { findRateMovers, getComparisons, rateDelta, validateHistory, type RateMover, type StatsBaseline, type StatsHistory } from "@/lib/stats-history";
import { buildTierList, tierRoles } from "@/lib/tier-list";
import historyJson from "@/public/stats-history.json";

const condition = (snapshot: HeroRateSnapshot) => `${snapshot.filters.inputLabel} · ${snapshot.filters.regionLabel} · ${snapshot.filters.tierLabel} · ${snapshot.filters.mapLabel}`;

export const metadata: Metadata = {
  title: "오버워치 영웅 티어표 · 경쟁전 승률 구간",
  description: `오버워치 돌격·공격·지원 영웅을 경쟁전과 빠른 대전 승률 구간(S·A·B·C)으로 나눈 티어표입니다. ${heroRates.fetchedAt} 수집 통계와 직전 수집 대비 승률 급상승·급하락 영웅을 함께 보여 줍니다.`,
  alternates: { canonical: "/tier/" },
};

export default function TierPage() {
  validateHistory(historyJson);
  const history: StatsHistory = historyJson;
  const comparisons = getComparisons(heroRates, history);
  const boards = (["competitive", "quickplay"] as const)
    .map((id) => ({ snapshot: heroRates.snapshots.find((item) => item.id === id), previous: comparisons.find((item) => item.id === id)?.previous ?? null }))
    .filter((board): board is { snapshot: HeroRateSnapshot; previous: StatsBaseline | null } => Boolean(board.snapshot));
  const competitive = boards.find((board) => board.snapshot.id === "competitive");
  const movers = competitive?.previous ? findRateMovers(competitive.snapshot, competitive.previous.snapshot, 5) : null;
  const pageUrl = "https://opick.ggwp.kr/tier/";
  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "WebPage", name: "오버워치 영웅 티어표", description: metadata.description,
      url: pageUrl, inLanguage: "ko-KR", dateModified: heroRates.fetchedAtIso ?? heroRates.fetchedAt,
      isPartOf: { "@type": "WebSite", name: "OP PICK LAB", url: "https://opick.ggwp.kr/" },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: "https://opick.ggwp.kr/" },
        { "@type": "ListItem", position: 2, name: "영웅 티어표", item: pageUrl },
      ],
    },
  ];

  return (
    <main className="page-shell tier-page">
      <JsonLd data={jsonLd} />
      <SiteHeader active="tier" />
      <section className="page-intro">
        <span className="section-kicker">HERO TIER LIST</span>
        <h1>영웅 <em>티어표</em></h1>
        <p>Blizzard 공개 통계의 승률을 구간으로 나눴습니다. 숙련도·조합·상성을 반영한 종합 추천 순위가 아닙니다.</p>
      </section>
      <div className="content-with-rail">
        <div className="page-content">
          <section className="seo-guide-summary">
            <span><CalendarDays aria-hidden="true" />수집 {heroRates.fetchedAt}</span>
            <span><BarChart3 aria-hidden="true" />S ≥55% · A ≥52% · B ≥49% · C &lt;49%</span>
            <ShareButton title="오버워치 영웅 티어표 · OP PICK LAB" path="/tier/" />
          </section>

          {movers && competitive?.previous && (movers.rising.length > 0 || movers.falling.length > 0) && <section className="content-section tier-movers" aria-labelledby="tier-movers-title">
            <div className="section-heading"><span className="section-kicker">WIN RATE MOVERS</span><h2 id="tier-movers-title">직전 수집 대비 승률 변화</h2><p>{competitive.snapshot.label} · {condition(competitive.snapshot)} · {competitive.previous.collectedAt.slice(0, 10)} 수집 대비. 두 수집 모두 픽률 1% 이상인 영웅만 비교하며, 패치별 경기만 따로 집계한 자료가 아닙니다.</p></div>
            <div className="tier-mover-columns">
              <MoverList title="승률 상승" icon={<TrendingUp aria-hidden="true" />} movers={movers.rising} tone="up" />
              <MoverList title="승률 하락" icon={<TrendingDown aria-hidden="true" />} movers={movers.falling} tone="down" />
            </div>
          </section>}

          {boards.map(({ snapshot, previous }) => {
            const tiers = buildTierList(snapshot);
            const priorRows = new Map(previous?.snapshot.rows.map((row) => [row.hero, row]));
            return (
              <section key={snapshot.id} className="content-section tier-section" aria-labelledby={`tier-${snapshot.id}`}>
                <div className="section-heading tier-heading">
                  <div><span className="section-kicker">{snapshot.id === "competitive" ? "COMPETITIVE" : "QUICK PLAY"}</span><h2 id={`tier-${snapshot.id}`}>{snapshot.label} 티어표</h2><p>{condition(snapshot)}{previous ? ` · 증감은 ${previous.collectedAt.slice(0, 10)} 수집 대비 %p` : ""}</p></div>
                  <TierImageButton
                    title={`오버워치 ${snapshot.label} 티어표`}
                    subtitle={`${condition(snapshot)} · 수집 ${heroRates.fetchedAt}`}
                    footer="Blizzard 공개 통계 승률 구간 · 픽률 1% 미만·체험 영웅은 미분류 · 종합 추천 순위 아님"
                    fileName={`op-pick-tier-${snapshot.id}-${heroRates.fetchedAt}.png`}
                    rows={tiers.map(({ tier, roles }) => ({ tier, roles: Object.fromEntries(tierRoles.map((role) => [role, roles[role].map(({ hero }) => hero.name)])) as Record<typeof tierRoles[number], string[]> }))}
                  />
                </div>
                <div className="tier-board" role="table" aria-label={`${snapshot.label} 승률 구간 티어표`}>
                  <div className="tier-board-head" role="row"><span role="columnheader">구간</span>{tierRoles.map((role) => <span key={role} role="columnheader" className={`role-${role}`}>{roleLabels[role]}</span>)}</div>
                  {tiers.map(({ tier, roles }) => (
                    <div key={tier} className={`tier-row tier-${tier === "미분류" ? "none" : tier}`} role="row">
                      <strong role="rowheader">{tier}</strong>
                      {tierRoles.map((role) => (
                        <div key={role} role="cell" className={`tier-cell role-${role}`}>
                          <span className="tier-cell-role">{roleLabels[role]}</span>
                          {roles[role].length ? roles[role].map(({ hero, row }) => {
                            const delta = rateDelta(row?.winRate, priorRows.get(hero.key)?.winRate);
                            return <Link key={hero.key} href={`/heroes/${hero.key}/#stats-${snapshot.id}`} className="tier-hero">
                              {/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt="" loading="lazy" />
                              <span><strong>{hero.name}</strong><small>{row?.winRate == null ? "자료 없음" : `${row.winRate.toFixed(1)}%`}{delta ? <em className={delta > 0 ? "up" : "down"}>{delta > 0 ? "+" : ""}{delta.toFixed(1)}</em> : null}</small></span>
                            </Link>;
                          }) : <span className="tier-empty">—</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          <p className="seo-guide-note">승률 구간은 공개 승률만으로 나눈 기술적 분류입니다. 표본 경기 수가 제공되지 않아 신뢰도를 보장하지 않으며, 픽률 1% 미만·자료 없음·체험 영웅은 미분류입니다. 다른 지역·입력 장치·등급·전장은 <Link href="/rates/">승률·픽률·밴률 통계</Link>에서, 기술 기반 상성은 <Link href="/matchups/">상성 비교</Link>에서 확인하세요.</p>
          <AdSlot kind="banner" />
        </div>
        <AdSlot kind="rail" />
      </div>
    </main>
  );
}

function MoverList({ title, icon, movers, tone }: { title: string; icon: React.ReactNode; movers: RateMover[]; tone: "up" | "down" }) {
  return (
    <div className={`tier-mover-list ${tone}`}>
      <h3>{icon}{title}</h3>
      {movers.length ? <ol>{movers.map((mover) => {
        const hero = getHero(mover.hero);
        return <li key={mover.hero}><Link href={`/heroes/${mover.hero}/#stats-competitive`}>{hero?.name ?? mover.hero}</Link><span>{mover.value.toFixed(1)}%</span><em>{mover.delta > 0 ? "+" : ""}{mover.delta.toFixed(1)}%p</em></li>;
      })}</ol> : <p>해당 영웅이 없습니다.</p>}
    </div>
  );
}
