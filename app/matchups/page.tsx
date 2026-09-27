import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdSlot } from "@/components/AdSlot";
import { MatchupExplorer, MatchupExplorerFromUrl } from "@/components/MatchupExplorer";
import { SiteHeader } from "@/components/SiteHeader";
import { detailedMatchups, getHero, heroCards, matchups } from "@/lib/data";

export const metadata: Metadata = {
  title: "오버워치 영웅 상성·카운터 픽 비교",
  description: "두 영웅의 카운터 관계, 상성 강도와 실제 운영 조건을 비교합니다.",
  alternates: { canonical: "/matchups/" },
};

export default function MatchupsPage() {
  const counterIndex = [...new Set(detailedMatchups.map((matchup) => matchup.hero))]
    .map((key) => ({ hero: getHero(key)!, items: detailedMatchups.filter((matchup) => matchup.hero === key).sort((a, b) => b.score - a.score) }))
    .sort((a, b) => a.hero.name.localeCompare(b.hero.name, "ko"));
  return <main className="page-shell comparison-page"><SiteHeader active="matchups" /><section className="page-intro"><span className="section-kicker">COUNTER LAB</span><h1>영웅 <em>상성 비교</em></h1><p>내 영웅과 상대 영웅을 고르면 카운터 관계와 실제 운영 조건을 바로 보여드립니다.</p></section><div className="content-with-rail"><div className="page-content">
    <Suspense fallback={<MatchupExplorer heroes={heroCards} matchups={matchups} />}><MatchupExplorerFromUrl heroes={heroCards} matchups={matchups} /></Suspense>
    <section className="content-section matchup-index" aria-labelledby="matchup-index-title">
      <div className="section-heading"><span className="section-kicker">COUNTER INDEX</span><h2 id="matchup-index-title">영웅별 카운터 상세 분석</h2><p>검토를 마친 상성 {detailedMatchups.length}개입니다. 상대하기 까다로운 영웅을 상성 강도 순으로 정리했습니다.</p></div>
      <div className="matchup-index-grid">{counterIndex.map(({ hero, items }) => <section key={hero.key} className="matchup-index-group" aria-labelledby={`counter-index-${hero.key}`}>
        <h3 id={`counter-index-${hero.key}`}>{hero.name} 카운터</h3>
        <ul>{items.map((matchup) => <li key={matchup.id}><Link prefetch={false} href={`/matchups/${matchup.hero}-vs-${matchup.counter}/`}>{getHero(matchup.counter)!.name}</Link></li>)}</ul>
      </section>)}</div>
    </section>
    <AdSlot kind="banner" /></div><AdSlot kind="rail" /></div></main>;
}
