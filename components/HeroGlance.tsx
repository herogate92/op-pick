import Link from "next/link";
import type { Combo, Hero, HeroRateSnapshot, Matchup } from "@/lib/data";
import { getHero, roleLabels, subroleLabels } from "@/lib/data";
import { patchDateLabel } from "@/lib/patches";
import { statsTier } from "@/lib/stats-tier";

// Answers "○○ 카운터" searches at the top of the page from data shown in full further down.
export function HeroGlance({ hero, counters, strongAgainst, combos, snapshot, patchDate }: {
  hero: Hero; counters: Matchup[]; strongAgainst: Matchup[]; combos: Combo[];
  snapshot?: HeroRateSnapshot; patchDate?: string;
}) {
  const row = snapshot?.rows.find((item) => item.hero === hero.key);
  const trial = hero.releaseStatus === "trial";
  const tier = row ? statsTier(row, trial) : "미분류";
  const matchupLinks = (items: Matchup[], side: "hero" | "counter") => items.length
    ? items.slice(0, 3).map((matchup) => <Link key={matchup.id} href={`/matchups/${matchup.hero}-vs-${matchup.counter}/`}>{getHero(matchup[side])?.name ?? matchup[side]}</Link>)
    : <span className="hero-glance-empty">검토 중</span>;
  return (
    <section className="hero-glance" aria-labelledby="hero-glance-title">
      <h2 id="hero-glance-title">{hero.name} 한눈에 보기</h2>
      <dl>
        <div><dt>역할</dt><dd>{roleLabels[hero.role]} · {subroleLabels[hero.subrole] ?? hero.subrole}</dd></div>
        <div><dt>경쟁전 승률 구간</dt><dd>{tier === "미분류"
          ? <span className="hero-glance-empty">{trial ? "미분류 · 체험 영웅" : "미분류"}</span>
          : <Link href="/tier/">{tier} 구간</Link>}{row?.winRate != null && <span> · 승률 {row.winRate.toFixed(1)}%</span>}</dd></div>
        <div><dt>상대하기 까다로운 영웅</dt><dd className="hero-glance-links">{matchupLinks(counters, "counter")}</dd></div>
        <div><dt>상대하기 유리한 영웅</dt><dd className="hero-glance-links">{matchupLinks(strongAgainst, "hero")}</dd></div>
        <div><dt>추천 조합</dt><dd className="hero-glance-links">{combos.length
          ? [...combos].sort((a, b) => b.score - a.score).slice(0, 2).map((combo) => <Link key={combo.id} href={`/combos/#${combo.id}`}>{combo.name}</Link>)
          : <span className="hero-glance-empty">등록된 조합 없음</span>}</dd></div>
        {patchDate && <div><dt>최근 패치</dt><dd><Link href={`/patches/${patchDate}/`}>{patchDateLabel(patchDate).short} 패치 변경 내용</Link></dd></div>}
      </dl>
      {snapshot && <p>승률 구간은 {snapshot.label} · {snapshot.filters.inputLabel} · {snapshot.filters.regionLabel} · {snapshot.filters.tierLabel} 기준이며 종합 추천 순위가 아닙니다. 상성은 검토를 마친 항목만 상성 강도 순으로 표시합니다.</p>}
    </section>
  );
}
