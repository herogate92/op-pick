"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeftRight, CheckCircle2, HelpCircle, ShieldAlert } from "lucide-react";
import type { Hero, Matchup } from "@/lib/data";
import { roleLabels } from "@/lib/data";
import { ScoreMeter } from "./ScoreMeter";
import { MatchupSkillExamples } from "./MatchupSkillExamples";

import { HeroPicker } from "./HeroPicker";

export function MatchupExplorer({ heroes, matchups }: { heroes: Hero[]; matchups: Matchup[] }) {
  const initialHero = useSearchParams().get("hero") ?? undefined;
  const initialOpponent = useSearchParams().get("opponent") ?? undefined;
  const firstKey = heroes.some((hero) => hero.key === initialHero) ? initialHero! : "ana";
  const firstCounter = heroes.some((hero) => hero.key === initialOpponent)
    ? initialOpponent!
    : matchups.find((item) => item.hero === firstKey)?.counter ?? "tracer";
  const [leftKey, setLeftKey] = useState(firstKey);
  const [rightKey, setRightKey] = useState(firstCounter);
  const left = heroes.find((hero) => hero.key === leftKey)!;
  const right = heroes.find((hero) => hero.key === rightKey)!;
  const direct = matchups.find((item) => item.hero === leftKey && item.counter === rightKey);
  const reverse = matchups.find((item) => item.hero === rightKey && item.counter === leftKey);
  const recommendations = useMemo(() => matchups
    .filter((item) => item.hero === leftKey)
    .sort((a, b) => Number(b.status === "verified") - Number(a.status === "verified") || b.score - a.score), [leftKey, matchups]);
  const relation = direct ? { data: direct, winner: right, loser: left } : reverse ? { data: reverse, winner: left, loser: right } : null;

  const showResult = () => requestAnimationFrame(() => {
    const result = document.getElementById("matchup-verdict");
    result?.scrollIntoView({ block: "start" });
    result?.focus({ preventScroll: true });
  });
  const swap = () => { setLeftKey(rightKey); setRightKey(leftKey); showResult(); };

  return (
    <div className="matchup-tool">
      <div className="matchup-selectors">
        <HeroPicker heroes={heroes} value={leftKey} onChange={key => { setLeftKey(key); showResult(); }} label="내 영웅" />
        <button className="swap-button" onClick={swap} aria-label="두 영웅 위치 바꾸기"><ArrowLeftRight /><span>VS</span></button>
        <HeroPicker heroes={heroes} value={rightKey} onChange={key => { setRightKey(key); showResult(); }} label="상대 영웅" />
      </div>

      <div className="matchup-results">
        <section id="matchup-verdict" tabIndex={-1} className={relation ? `verdict-card known ${relation.data.status}` : "verdict-card pending"} aria-live="polite">
          {relation ? <>
            <div className="verdict-icon"><ShieldAlert /></div>
            <div className="verdict-copy">
              <div className="matchup-quality-row"><span className="section-kicker">MATCHUP VERDICT</span><MatchupQualityBadge matchup={relation.data} /></div>
              <h2><strong>{relation.winner.name}</strong>이(가) {relation.loser.name}을(를) 상대하기 {relation.data.status === "verified" ? "유리합니다" : "유리할 가능성이 있습니다"}</h2>
              <ScoreMeter value={relation.data.score} label={relation.data.status === "verified" ? "상성 강도" : "초기 평가"} />
              <p>{relation.data.reason}</p>
              <details className="matchup-evidence" key={`${leftKey}-${rightKey}`}><summary>스킬 사례·검토 근거 보기</summary>
              <MatchupSkillExamples matchup={relation.data} heroName={relation.loser.name} counterName={relation.winner.name} />
              <div className="verdict-source-row"><small>{relation.data.patchBasis} · 마지막 검수 {relation.data.reviewedAt}</small></div></details>
              <div className="condition-box"><CheckCircle2 /><span><strong>대응 포인트</strong>{relation.data.counterplay}</span></div>
            </div>
          </> : <>
            <div className="verdict-icon"><HelpCircle /></div><div className="verdict-copy"><span className="section-kicker">NO DIRECT DATA</span><h2>직접 상성 정보 없음</h2><p>현재 두 영웅을 직접 비교한 자료가 없습니다. 역할, 사거리, 맵 구조와 숙련도를 함께 고려하세요.</p></div>
          </>}
        </section>

        <section className="recommend-section">
          <div className="section-heading"><span className="section-kicker">RECOMMENDED COUNTERS</span><h2>{left.name} 상대 추천 영웅</h2></div>
          {recommendations.length ? <div className="counter-recommend-grid">{recommendations.map((item) => {
            const hero = heroes.find((candidate) => candidate.key === item.counter)!;
            return <button key={item.id} onClick={() => { setRightKey(hero.key); showResult(); }} className={rightKey === hero.key ? "counter-recommend selected" : "counter-recommend"}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt="" /><span><strong>{hero.name}</strong><small>{roleLabels[hero.role]} · {item.status === "verified" ? "검증" : "검토 필요"}</small></span><ScoreMeter value={item.score} /></button>;
          })}</div> : <div className="review-pending"><HelpCircle /><span><strong>추천 정보 준비 중</strong><small>이 영웅은 아직 등록된 추천 카운터가 없습니다.</small></span></div>}
        </section>
      </div>
    </div>
  );
}

function MatchupQualityBadge({ matchup }: { matchup: Matchup }) {
  const label = matchup.status === "provisional"
    ? "검토 필요 · 낮은 신뢰도"
    : matchup.confidence === "high" ? "교차 검증 · 높은 신뢰도" : "개별 검토 · 중간 신뢰도";
  return <span className={`matchup-quality-badge ${matchup.status} ${matchup.confidence}`}>{label}</span>;
}
