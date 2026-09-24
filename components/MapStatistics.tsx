"use client";
import { useState } from "react";
import type { Hero, HeroRateSnapshot } from "@/lib/data";
import { StatsCandidates } from "@/components/StatsCandidates";

export function MapStatistics({ snapshots, heroes, fetchedAt, mapName }: { snapshots: HeroRateSnapshot[]; heroes: Hero[]; fetchedAt: string; mapName: string }) {
  const [selectedId, setSelectedId] = useState(snapshots[0]?.id);
  const snapshot = snapshots.find(item => item.id === selectedId) ?? snapshots[0];
  if (!snapshot) return <p className="seo-guide-note">이 전장의 통계 자료가 아직 없습니다.</p>;
  function change(field: "input" | "region", value: string) {
    const next = snapshots.find(item => item.filters[field] === value && item.filters[field === "input" ? "region" : "input"] === snapshot.filters[field === "input" ? "region" : "input"]);
    if (next) setSelectedId(next.id);
  }
  return <section className="map-statistics">
    <h2>{mapName} 통계로 후보 비교</h2>
    <p>수집 {fetchedAt} · 경쟁전·전체 등급 · 역할 고정</p>
    <div className="stats-condition-filters">{(["input", "region"] as const).map(field => <label key={field}>{field === "input" ? "입력 장치" : "지역"}<select value={snapshot.filters[field]} onChange={event => change(field,event.target.value)}>{[...new Map(snapshots.map(item => [item.filters[field], item.filters[`${field}Label`]])).entries()].map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}</div>
    <p>{snapshot.filters.inputLabel} · {snapshot.filters.regionLabel} · {snapshot.filters.mapLabel}</p>
    <a href={snapshot.sourceUrl} target="_blank" rel="noreferrer">동일 조건의 공식 통계 ↗</a>
    <StatsCandidates snapshot={snapshot} heroes={heroes}/>
  </section>;
}
