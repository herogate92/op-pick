import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { SiteHeader } from "@/components/SiteHeader";
import { StatsExplorer } from "@/components/StatsExplorer";
import { heroRates, heroes } from "@/lib/data";

export const metadata: Metadata = {
  title: "오버워치 영웅 승률·픽률 통계",
  description: "Blizzard 공개 통계를 기준으로 PC 아시아 지역의 영웅 승률과 픽률을 비교합니다.",
  alternates: { canonical: "/rates/" },
};

export default function RatesPage() {
  return (
    <main className="page-shell rates-page">
      <SiteHeader active="rates" />
      <section className="page-intro rates-intro">
        <span className="section-kicker">OFFICIAL HERO STATS</span>
        <h1>영웅 <em>통계</em></h1>
        <p>Blizzard 공개 수치를 기준으로 승률과 픽률을 빠르게 비교합니다.</p>
      </section>
      <div className="content-with-rail rates-layout">
        <div className="page-content">
          <div className="stats-source-bar">
            <span><strong>Blizzard 기반 통계 스냅샷</strong><small>{heroRates.fetchedAt} 확인 · {heroRates.snapshots[0].dataProviderLabel}로 갱신</small></span>
            <a href={heroRates.snapshots[0].sourceUrl} target="_blank" rel="noreferrer">Blizzard에서 상세 필터 열기<ExternalLink aria-hidden="true" /></a>
          </div>
          <StatsExplorer snapshots={heroRates.snapshots} heroes={heroes} />
          <p className="stats-disclaimer">픽률은 전체 영웅 플레이 시간 대비 비율입니다. 표본이 부족한 값은 <strong>--</strong>로 표시하며, 수치는 패치·지역·입력 방식·등급·전장에 따라 달라집니다.</p>
          <AdSlot kind="banner" />
        </div>
        <AdSlot kind="rail" />
      </div>
    </main>
  );
}
