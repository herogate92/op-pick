import type { Metadata } from "next";
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
          <StatsExplorer snapshots={heroRates.snapshots} heroes={heroes} fetchedAt={heroRates.fetchedAtIso ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date(heroRates.fetchedAtIso)) + " KST" : heroRates.fetchedAt} />
          <p className="stats-disclaimer">{heroRates.notice}</p>
          <p className="stats-disclaimer">매주 수요일 오전 8:17(한국 시간)에 공식 패치를 확인하고, 내용이 변경된 경우에만 예약 갱신합니다. 핫픽스는 다음 점검 또는 수동 실행 시 반영됩니다. 통계는 패치 사이에도 변할 수 있습니다. 실행 지연이나 수집·검증 실패 시 마지막 성공 자료를 유지합니다. <a href="https://github.com/herogate92/op-pick/actions/workflows/pages.yml" target="_blank" rel="noreferrer">갱신 상태 확인</a></p>
          <p className="stats-disclaimer">픽률은 전체 영웅 플레이 시간 대비 비율입니다. 표본이 부족한 값은 <strong>--</strong>로 표시하며, 수치는 패치·지역·입력 방식·등급·전장에 따라 달라집니다.</p>
          <AdSlot kind="banner" />
        </div>
        <AdSlot kind="rail" />
      </div>
    </main>
  );
}
