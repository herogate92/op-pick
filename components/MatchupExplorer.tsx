"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeftRight, CheckCircle2, Cross, HelpCircle, Shield, ShieldAlert, Swords } from "lucide-react";
import type { Hero, Matchup, Role } from "@/lib/data";
import { roleLabels } from "@/lib/data";
import { ScoreMeter } from "./ScoreMeter";

type RoleFilter = Role | "all";
const roleOptions: RoleFilter[] = ["all", "tank", "damage", "support"];

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
  const recommendations = useMemo(() => matchups.filter((item) => item.hero === leftKey).sort((a, b) => b.score - a.score), [leftKey, matchups]);
  const relation = direct ? { data: direct, winner: right, loser: left } : reverse ? { data: reverse, winner: left, loser: right } : null;

  const swap = () => { setLeftKey(rightKey); setRightKey(leftKey); };

  return (
    <div className="matchup-tool">
      <div className="matchup-selectors">
        <HeroSelect hero={left} heroes={heroes} value={leftKey} onChange={setLeftKey} label="내 영웅" />
        <button className="swap-button" onClick={swap} aria-label="두 영웅 위치 바꾸기"><ArrowLeftRight /><span>VS</span></button>
        <HeroSelect hero={right} heroes={heroes} value={rightKey} onChange={setRightKey} label="상대 영웅" />
      </div>

      <div className="matchup-results">
        <section className={relation ? "verdict-card known" : "verdict-card pending"} aria-live="polite">
          {relation ? <>
            <div className="verdict-icon"><ShieldAlert /></div>
            <div className="verdict-copy"><span className="section-kicker">MATCHUP VERDICT</span><h2><strong>{relation.winner.name}</strong>이(가) {relation.loser.name}을(를) 상대하기 유리합니다</h2><ScoreMeter value={relation.data.score} label="상성 강도" /><p>{relation.data.reason}</p><div className="condition-box"><CheckCircle2 /><span><strong>운영 조건</strong>{relation.data.condition}</span></div><div className="verdict-source-row"><small>마지막 검수 {relation.data.reviewedAt}</small></div></div>
          </> : <>
            <div className="verdict-icon"><HelpCircle /></div><div className="verdict-copy"><span className="section-kicker">NO DIRECT DATA</span><h2>직접 상성 정보 없음</h2><p>현재 두 영웅을 직접 비교한 자료가 없습니다. 역할, 사거리, 맵 구조와 숙련도를 함께 고려하세요.</p></div>
          </>}
        </section>

        <section className="recommend-section">
          <div className="section-heading"><span className="section-kicker">RECOMMENDED COUNTERS</span><h2>{left.name} 상대 추천 영웅</h2></div>
          {recommendations.length ? <div className="counter-recommend-grid">{recommendations.map((item) => {
            const hero = heroes.find((candidate) => candidate.key === item.counter)!;
            return <button key={item.id} onClick={() => setRightKey(hero.key)} className={rightKey === hero.key ? "counter-recommend selected" : "counter-recommend"}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt="" /><span><strong>{hero.name}</strong><small>{roleLabels[hero.role]}</small></span><ScoreMeter value={item.score} /></button>;
          })}</div> : <div className="review-pending"><HelpCircle /><span><strong>추천 정보 준비 중</strong><small>이 영웅은 아직 등록된 추천 카운터가 없습니다.</small></span></div>}
        </section>
      </div>
    </div>
  );
}

function HeroSelect({ hero, heroes, value, onChange, label }: { hero: Hero; heroes: Hero[]; value: string; onChange: (value: string) => void; label: string }) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(hero.role);
  const filteredHeroes = roleFilter === "all" ? heroes : heroes.filter((item) => item.role === roleFilter);

  return (
    <section className="matchup-picker" aria-label={`${label} 선택`}>
      <header className="matchup-picker-header">
        <div className="matchup-selected-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt="" />
          <div><span className="eyebrow">{label}</span><h2>{hero.name}</h2><small>{roleLabels[hero.role]}</small></div>
        </div>
        <Link href={`/heroes/${hero.key}/`}>상세 정보</Link>
      </header>
      <div className="matchup-role-tabs" aria-label={`${label} 역할 필터`}>
        {roleOptions.map((role) => (
          <button key={role} type="button" className={roleFilter === role ? "selected" : ""} onClick={() => setRoleFilter(role)} aria-pressed={roleFilter === role}>
            {role === "tank" && <Shield aria-hidden="true" />}
            {role === "damage" && <Swords aria-hidden="true" />}
            {role === "support" && <Cross aria-hidden="true" />}
            <span>{role === "all" ? "전체" : roleLabels[role]}</span>
          </button>
        ))}
      </div>
      <div className="matchup-roster">
        {filteredHeroes.map((item) => {
          const isSelected = item.key === value;
          return (
            <button
              key={item.key}
              type="button"
              className={isSelected ? "hero-thumb selected" : "hero-thumb"}
              onClick={() => onChange(item.key)}
              aria-pressed={isSelected}
              aria-label={`${label} ${item.name} 선택`}
              title={item.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}<img src={item.portrait} alt="" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
