import Link from "next/link";
import type { HeroRatesDocument } from "@/lib/data";

export function HeroStatistics({ heroKey, heroName, rates }: { heroKey: string; heroName: string; rates: HeroRatesDocument }) {
  const collected = rates.fetchedAtIso
    ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date(rates.fetchedAtIso)) + " KST"
    : rates.fetchedAt;
  return <section className="hero-statistics" aria-label={`${heroName} 통계`}>
    <header><h2>{heroName} 통계</h2><Link href="/rates/">전체 영웅 통계 →</Link></header>
    <p>마지막 수집: {collected}</p>
    <div className="hero-statistics-grid">
      {rates.snapshots.filter(snapshot => snapshot.id === "quickplay" || snapshot.id === "competitive").map(snapshot => {
        const row = snapshot.rows.find(item => item.hero === heroKey);
        const values = [["승률", row?.winRate], ["픽률", row?.pickRate], ["밴률", row?.banRate]] as const;
        return <article key={snapshot.id} id={`stats-${snapshot.id}`}>
          <h3>{snapshot.label}</h3>
          <p>{[snapshot.filters.inputLabel, snapshot.filters.regionLabel, snapshot.filters.tierLabel, snapshot.filters.mapLabel].join(" · ")}</p>
          <dl>{values.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value == null ? "자료 없음" : `${value.toFixed(1)}%`}</dd></div>)}</dl>
          <a href={snapshot.sourceUrl} target="_blank" rel="noopener noreferrer">공식 통계에서 조건 확인 ↗</a>
        </article>;
      })}
    </div>
    <small>수집 시점의 통계이며 최신 패치 이후 경기만의 성적을 뜻하지 않습니다. 자료가 없는 값은 0%로 표시하지 않습니다.</small>
    <nav aria-label="영웅 분석 바로가기"><Link href={`/matchups/?hero=${heroKey}`}>상성 비교</Link><Link href="/combos/">조합 보기</Link><Link href="/team-builder/">팀 구성</Link></nav>
  </section>;
}
