import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { SiteHeader } from "@/components/SiteHeader";
import { StatsExplorer } from "@/components/StatsExplorer";
import { heroRates, heroes } from "@/lib/data";
import historyJson from "@/public/stats-history.json";
import { getComparisons, validateHistory, type StatsHistory } from "@/lib/stats-history";

export const metadata: Metadata = {
  title: "오버워치 영웅 승률·픽률·밴률 통계",
  description: "Blizzard 공개 통계로 지역·입력 장치별 승률·픽률·밴률과 PC 아시아 경쟁전 등급별 영웅 성적을 비교합니다.",
  alternates: { canonical: "/rates/" },
};

export default function RatesPage() {
  validateHistory(historyJson);
  const history: StatsHistory = historyJson;
  const comparisons = getComparisons(heroRates, history);
  return (
    <main className="page-shell rates-page">
      <SiteHeader active="rates" />
      <section className="page-intro rates-intro">
        <span className="section-kicker">OFFICIAL HERO STATS</span>
        <h1>영웅 <em>통계</em></h1>
        <p>지역·입력 장치·등급을 골라 승률·픽률·밴률을 비교하세요.</p>
      </section>
      <div className="content-with-rail rates-layout">
        <div className="page-content">
          <StatsExplorer snapshots={heroRates.snapshots} heroes={heroes} comparisons={comparisons} fetchedAt={heroRates.fetchedAtIso ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date(heroRates.fetchedAtIso)) + " KST" : heroRates.fetchedAt} />
          <details className="stats-history-list"><summary>저장된 수집 이력 {history.entries.length}회</summary><p>최근 최대 30회 보관합니다. 패치 날짜는 수집 당시 감지한 패치이며, 해당 패치 이후 경기만의 통계는 아닙니다.</p><ol>{[...history.entries].reverse().map(entry => <li key={entry.fetchedAtIso}><time dateTime={entry.fetchedAtIso}>{new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.fetchedAtIso))} KST</time> · {entry.snapshots.length}개 조건 · {entry.patch ? `감지 패치 ${entry.patch.patchDate}` : "당시 패치 기록 없음"}</li>)}</ol><a href="/stats-history.json" download>통계 이력 JSON 내려받기</a></details>
          <p className="stats-disclaimer">{heroRates.notice}</p>
          <p className="stats-disclaimer">매주 수요일 오전 8:17(한국 시간)에 공식 패치를 확인하고, 내용이 변경된 경우에만 예약 갱신합니다. 핫픽스는 다음 점검 또는 수동 실행 시 반영됩니다. 통계는 패치 사이에도 변할 수 있습니다. 실행 지연이나 수집·검증 실패 시 마지막 성공 자료를 유지합니다. <a href="https://github.com/herogate92/op-pick/actions/workflows/pages.yml" target="_blank" rel="noreferrer">갱신 상태 확인</a></p>
          <p className="stats-disclaimer">제공되지 않은 값은 <strong>--</strong>로 표시하며 0%와 구분합니다. 역할 고정 경기 자료이며 전장 필터의 선택 조건을 따릅니다. 수치는 패치·지역·입력 방식·등급·전장에 따라 달라집니다.</p>
          <AdSlot kind="banner" />
        </div>
        <AdSlot kind="rail" />
      </div>
    </main>
  );
}
