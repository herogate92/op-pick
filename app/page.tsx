import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, MapPinned, Shield, Sparkles, Swords, UsersRound } from "lucide-react";
import { HomeBackgroundMedia } from "@/components/HomeBackgroundMedia";
import { SiteHeader } from "@/components/SiteHeader";
import { JsonLd } from "@/components/JsonLd";
import { getHero, heroes, heroRates, roleLabels } from "@/lib/data";
import { summarizeRates } from "@/lib/stats-summary";

export const metadata: Metadata = {
  title: "오버워치 영웅 상성·카운터 픽·맵별 추천",
  description: "오버워치 영웅 정보와 카운터 픽, 맵별 추천, 궁극기 조합과 팀 구성을 한곳에서 확인하세요.",
  alternates: { canonical: "/" },
};

function CtaElectricity() {
  return <span className="cta-electricity" aria-hidden="true" />;
}

export default function HomePage() {
  const poster = getHero("tracer")?.background ?? getHero("ana")?.background;
  const snapshot = heroRates.snapshots.find(item => item.id === "competitive");
  const patchedHeroes = heroes.filter(hero => hero.patchNote).sort((a, b) => b.patchNote!.date.localeCompare(a.patchNote!.date));
  const latestPatchDate = patchedHeroes[0]?.patchNote?.date;
  const latestPatchedHeroes = patchedHeroes.filter(hero => hero.patchNote?.date === latestPatchDate);
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OP PICK LAB",
    alternateName: "오버워치 픽 연구소",
    url: "https://opick.ggwp.kr/",
    inLanguage: "ko-KR",
    description: "오버워치 영웅 상성, 카운터 픽, 맵별 추천과 팀 조합을 제공하는 팬 가이드",
  };
  return (
    <main className="cinematic-home home-dashboard">
      <JsonLd data={websiteJsonLd} />
      <HomeBackgroundMedia poster={poster} />
      <div className="home-video-overlay" />
      <SiteHeader active="home" />
      <section className="cinematic-home-content">
        <h1><span>OP</span> PICK LAB</h1>
        <p>영웅 정보부터 상성·팀 조합까지, 바로 찾아보세요.</p>
        <div className="cinematic-actions">
          <Link href="/heroes/" className="cinematic-primary">
            <CtaElectricity />
            <span className="cta-content"><Shield aria-hidden="true" /> 영웅 선택 <ArrowRight aria-hidden="true" /></span>
          </Link>
          <Link href="/team-builder/" className="cinematic-secondary">
            <CtaElectricity />
            <span className="cta-content"><UsersRound aria-hidden="true" /> 팀 조합 만들기</span>
          </Link>
        </div>
      </section>
      <nav className="home-quick-nav" aria-label="빠른 메뉴">
        <Link href="/heroes/"><Shield /><span><strong>영웅 도감</strong><small>스킬과 역할 확인</small></span><ArrowRight /></Link>
        <Link href="/matchups/"><Swords /><span><strong>상성 비교</strong><small>두 영웅 유불리 확인</small></span><ArrowRight /></Link>
        <Link href="/combos/"><Sparkles /><span><strong>시너지·궁 조합</strong><small>일반 스킬과 궁극기 연계</small></span><ArrowRight /></Link>
        <Link href="/team-builder/"><UsersRound /><span><strong>팀 구성</strong><small>5대5·6대6 가상 조합</small></span><ArrowRight /></Link>
        <Link href="/maps/"><MapPinned /><span><strong>맵별 추천</strong><small>전장에 맞는 영웅 찾기</small></span><ArrowRight /></Link>
        <Link href="/rates/"><BarChart3 /><span><strong>영웅 통계</strong><small>승률과 픽률 확인</small></span><ArrowRight /></Link>
      </nav>
      <div className="home-updates">
        {snapshot && <section className="home-rates-summary" aria-labelledby="home-stats-title">
          <header><h2 id="home-stats-title">역할별 승률 상위</h2><Link href="/rates/">통계 전체 <ArrowRight aria-hidden="true" /></Link></header>
          <p>{snapshot.label} · {snapshot.filters.inputLabel} · {snapshot.filters.regionLabel} · {snapshot.filters.tierLabel} · {snapshot.filters.mapLabel}</p>
          <div className="home-role-stats">
            {(["tank", "damage", "support"] as const).map(role => {
              const rows = snapshot.rows.filter(row => getHero(row.hero)?.role === role);
              const leader = summarizeRates(rows).leaders.winRate;
              const hero = leader ? getHero(leader.hero) : undefined;
              return <div key={role}><small>{roleLabels[role]}</small>{hero && leader ? <Link href={`/heroes/${hero.key}/#stats-${snapshot.id}`}><strong>{hero.name}</strong><span>{leader.winRate!.toFixed(1)}%</span></Link> : <strong>자료 없음</strong>}</div>;
            })}
          </div>
          <small className="home-data-note">수집 {heroRates.fetchedAt} · 통계 제공 영웅 기준이며 상성 순위가 아닙니다.</small>
        </section>}
        {latestPatchDate && <section className="home-patch" aria-labelledby="home-patch-title">
          <header><h2 id="home-patch-title">최근 반영한 영웅 패치</h2><time dateTime={latestPatchDate}>{latestPatchDate}</time></header>
          <div className="home-patch-links">{latestPatchedHeroes.map(hero => <Link key={hero.key} href={`/heroes/${hero.key}/`}>{hero.name} 변경 내용 <ArrowRight aria-hidden="true" /></Link>)}</div>
          <p>영웅 설명 반영 기준입니다. 관련 상성·조합의 검토 상태는 별도로 확인하세요.</p>
          <Link className="home-review-link" href="/patch-review.html">패치 재검토 현황 <ArrowRight aria-hidden="true" /></Link>
        </section>}
      </div>
    </main>
  );
}
