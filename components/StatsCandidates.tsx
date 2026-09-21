"use client";
import { useState } from "react";
import type { Hero, HeroRateSnapshot } from "@/lib/data";
import { statsTier } from "@/lib/stats-tier";

export function StatsCandidates({snapshot,heroes}:{snapshot:HeroRateSnapshot;heroes:Hero[]}) {
  const [selected,setSelected]=useState<string[]>([]);
  const [role,setRole]=useState("tank");
  const [query,setQuery]=useState("");
  const format=(value:number|null|undefined)=>value==null?"자료 없음":`${value.toFixed(1)}%`;
  const roster=heroes.filter(hero=>hero.role===role && hero.name.includes(query.trim()));
  return <details className="stats-candidates">
    <summary>영웅 후보 비교 · 승률 구간 티어표</summary>
    <p>{snapshot.label} · {snapshot.filters.inputLabel} · {snapshot.filters.regionLabel} · {snapshot.filters.tierLabel} · {snapshot.filters.mapLabel}</p>
    <p>최대 3명을 선택하세요. 조건을 바꾸면 선택한 영웅도 같은 새 조건으로 비교합니다.</p>
    <div className="stats-candidate-roles">{[["tank","돌격"],["damage","공격"],["support","지원"]].map(([key,label])=><button type="button" key={key} aria-pressed={role===key} onClick={()=>setRole(key)}>{label}</button>)}<label>후보 검색<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="영웅 이름"/></label></div>
    <div className="stats-candidate-picker">{roster.map(hero=><button type="button" key={hero.key} aria-pressed={selected.includes(hero.key)} disabled={selected.length===3&&!selected.includes(hero.key)} onClick={()=>setSelected(old=>old.includes(hero.key)?old.filter(key=>key!==hero.key):[...old,hero.key])}>{hero.name}</button>)}</div>
    {!roster.length&&<p>검색 결과가 없습니다.</p>}
    <div className="stats-candidate-cards" aria-live="polite">{selected.map(key=>{const hero=heroes.find(h=>h.key===key)!;const row=snapshot.rows.find(r=>r.hero===key);return <article key={key}><header><strong>{hero.name}</strong><button type="button" onClick={()=>setSelected(old=>old.filter(k=>k!==key))} aria-label={`${hero.name} 비교에서 제거`}>제거</button></header><dl>{[["승률",row?.winRate],["픽률",row?.pickRate],["밴률",row?.banRate]].map(([label,value])=><div key={String(label)}><dt>{label}</dt><dd>{format(value as number|null|undefined)}</dd></div>)}</dl><small>승률 구간 {row?statsTier(row,hero.releaseStatus==="trial"):"미분류"}</small></article>})}</div>
    <h3>승률 구간 티어표 · {role==="tank"?"돌격":role==="damage"?"공격":"지원"}</h3>
    <p>S ≥55%, A ≥52%, B ≥49%, C &lt;49%. 픽률 1% 미만·자료 없음·체험 영웅은 미분류입니다. 표본 경기 수가 제공되지 않아 신뢰도를 보장하지 않습니다. 숙련도·조합·상성을 반영한 종합 추천 순위가 아닙니다.</p>
    {(["S","A","B","C","미분류"] as const).map(tier=><div className="stats-tier-row" key={tier}><strong>{tier}</strong><span>{roster.filter(hero=>{const row=snapshot.rows.find(r=>r.hero===hero.key);return (row?statsTier(row,hero.releaseStatus==="trial"):"미분류")===tier;}).map(hero=>hero.name).join(" · ")||"해당 없음"}</span></div>)}
  </details>;
}
