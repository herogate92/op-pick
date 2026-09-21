"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BarChart3, Cross, ExternalLink, Search, Shield, Swords, Trophy } from "lucide-react";
import type { Hero, HeroRateSnapshot, Role } from "@/lib/data";
import { summarizeRates } from "@/lib/stats-summary";
import { rateDelta, type StatsComparison } from "@/lib/stats-history";

type SortKey = "winRate" | "pickRate" | "banRate";

const roleLabels: Record<"all" | Role, string> = { all: "전체", tank: "돌격", damage: "공격", support: "지원" };
const roleIcons = { all: BarChart3, tank: Shield, damage: Swords, support: Cross };
const metricLabels: Record<SortKey, string> = { winRate: "승률", pickRate: "픽률", banRate: "밴률" };
const formatRate = (value: number | null) => value === null ? "--" : `${value.toFixed(1)}%`;

export function StatsExplorer({ snapshots, heroes, fetchedAt, comparisons }: { snapshots: HeroRateSnapshot[]; heroes: Hero[]; fetchedAt: string; comparisons: StatsComparison[] }) {
  const [comparisonMode, setComparisonMode] = useState<"previous" | "priorPatch">("previous");
  const [snapshotId, setSnapshotId] = useState(snapshots[0]?.id ?? "");
  const [role, setRole] = useState<"all" | Role>("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("winRate");
  const snapshot = snapshots.find((item) => item.id === snapshotId) ?? snapshots[0];
  const baseline = comparisons.find(item => item.id === snapshot.id)?.[comparisonMode];
  const priorRows = new Map(baseline?.snapshot.rows.map(row => [row.hero, row]));
  const modeOf = (item: HeroRateSnapshot) => item.gameMode ?? item.id;
  const gameMode = modeOf(snapshot);
  const changeCondition = (field: "input" | "region" | "tier", value: string) => {
    const filters = { ...snapshot.filters, [field]: value };
    const candidates = snapshots.filter(item => modeOf(item) === gameMode && item.filters.input === filters.input && item.filters.region === filters.region);
    const next = candidates.find(item => item.filters.tier === filters.tier) ?? candidates.find(item => item.filters.tier === "All");
    if (next) setSnapshotId(next.id);
  };
  const metrics = (["winRate", "pickRate", "banRate"] as SortKey[]).filter((metric) => metric !== "banRate" || snapshot.rows.some((row) => row.banRate !== null));
  const activeSortKey = metrics.includes(sortKey) ? sortKey : "winRate";
  const heroByKey = useMemo(() => new Map(heroes.map((hero) => [hero.key, hero])), [heroes]);

  const rows = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ko");
    return snapshot.rows
      .map((row) => ({ ...row, heroData: heroByKey.get(row.hero) }))
      .filter((row) => row.heroData && (role === "all" || row.heroData.role === role))
      .filter((row) => !normalized || row.heroData!.name.toLocaleLowerCase("ko").includes(normalized))
      .sort((a, b) => (b[activeSortKey] ?? -1) - (a[activeSortKey] ?? -1));
  }, [activeSortKey, heroByKey, query, role, snapshot]);

  const { leaders, available } = summarizeRates(rows);
  const maxValues = {
    winRate: Math.max(...rows.map((row) => row.winRate ?? 0), 1),
    pickRate: Math.max(...rows.map((row) => row.pickRate ?? 0), 1),
    banRate: Math.max(...rows.map((row) => row.banRate ?? 0), 1),
  };

  return (
    <div className="stats-explorer">
      <div className="stats-source-bar">
        <span><strong>Blizzard 기반 통계 스냅샷</strong><small>마지막 성공 수집: {fetchedAt} · {snapshot.dataProviderLabel}로 갱신</small></span>
        <a href={snapshot.sourceUrl} target="_blank" rel="noreferrer">Blizzard에서 상세 필터 열기<ExternalLink aria-hidden="true" /></a>
      </div>
      <p className="stats-context" aria-live="polite">{snapshot.label} · {snapshot.filters.inputLabel} · {snapshot.filters.regionLabel} · {snapshot.filters.tierLabel} · {roleLabels[role]}{query.trim() ? ` · 검색: ${query.trim()}` : ""} 기준 요약</p>
      <section className="stats-summary" aria-label="선택 조건의 통계 요약">
        {metrics.map((metric) => {
          const leader = leaders[metric];
          const hero = leader ? heroByKey.get(leader.hero) : undefined;
          return (
            <button type="button" key={metric} className={sortKey === metric ? "selected" : ""} onClick={() => setSortKey(metric)}>
              <span>{metricLabels[metric]} 1위</span>
              <strong>{hero?.name ?? "데이터 부족"}</strong>
              <em>{leader ? formatRate(leader[metric]) : "--"}</em>
            </button>
          );
        })}
        <div className="stats-count-card"><span>통계 제공 영웅</span><strong>{available}명</strong><em>표시 {rows.length}명 · 통계 없음 {rows.length - available}명</em></div>
      </section>

      <section className="stats-panel">
        <div className="stats-mode-tabs" role="tablist" aria-label="게임 모드">
          {snapshots.filter(item => item.id === "quickplay" || item.id === "competitive").map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={gameMode === item.id} className={gameMode === item.id ? "selected" : ""} onClick={() => setSnapshotId(snapshots.find(candidate => modeOf(candidate) === item.id && candidate.filters.input === snapshot.filters.input && candidate.filters.region === snapshot.filters.region && candidate.filters.tier === "All")?.id ?? item.id)}>
              <span>{item.id === "competitive" ? "COMP" : "QUICK"}</span><strong>{item.label}</strong>
            </button>
          ))}
        </div>

        <div className="stats-condition-filters">
          {(["input", "region", "tier"] as const).map(field => {
            const options = snapshots.filter(item => modeOf(item) === gameMode && (field !== "tier" || (item.filters.input === snapshot.filters.input && item.filters.region === snapshot.filters.region)));
            const values = [...new Map(options.map(item => [item.filters[field], item.filters[`${field}Label`]])).entries()];
            return <label key={field}>{field === "input" ? "입력 장치" : field === "region" ? "지역" : "경쟁전 등급"}<select value={snapshot.filters[field]} disabled={values.length < 2} onChange={event => changeCondition(field, event.target.value)}>{values.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>;
          })}
        </div>
        <p className="stats-filter-note">모든 전장 합산 · 등급별 통계는 PC 아시아 경쟁전에서 제공합니다. 모드 변경 또는 지원하지 않는 조건으로 변경하면 전체 등급으로 전환됩니다.</p>
        {!metrics.includes("banRate") && <p className="stats-filter-note">{gameMode === "quickplay" ? "빠른 대전은 밴률을 제공하지 않습니다." : "현재 조건의 밴률 자료가 없습니다."}</p>}
        <div className="stats-history-controls">
          <label>증감 비교<select value={comparisonMode} onChange={event => setComparisonMode(event.target.value as "previous" | "priorPatch")}><option value="previous">이전 수집 대비</option><option value="priorPatch">이전 패치 기록 대비</option></select></label>
          <p aria-live="polite">{baseline ? `비교 기준: ${new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date(baseline.collectedAt))} KST${baseline.patchDate ? ` · 감지 패치 ${baseline.patchDate}` : ""}` : "같은 조건의 비교 기록이 아직 없습니다."}<br />증감 단위는 %p입니다. 패치별 경기 표본을 분리한 자료가 아니므로 패치 효과를 뜻하지 않습니다.</p>
        </div>

        <div className="stats-toolbar">
          <div className="stats-role-tabs" role="tablist" aria-label="역할 필터">
            {(Object.keys(roleLabels) as Array<"all" | Role>).map((item) => {
              const Icon = roleIcons[item];
              return <button key={item} type="button" role="tab" aria-selected={role === item} className={role === item ? "selected" : ""} onClick={() => setRole(item)}><Icon aria-hidden="true" />{roleLabels[item]}</button>;
            })}
          </div>
          <label className="stats-search"><Search aria-hidden="true" /><span className="sr-only">영웅 검색</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="영웅 이름 검색" /></label>
        </div>

        <div className="stats-context">
          <span>{snapshot.filters.inputLabel}</span><span>{snapshot.filters.regionLabel}</span><span>{snapshot.filters.mapLabel}</span><span>{snapshot.filters.tierLabel}</span>
          <strong>{rows.length}명 표시</strong>
        </div>

        <div className="stats-table-wrap">
          <table className="stats-table">
            <thead><tr><th scope="col">순위</th><th scope="col">영웅</th>{metrics.map((metric) => <th scope="col" key={metric}><button type="button" className={activeSortKey === metric ? "selected" : ""} onClick={() => setSortKey(metric)}>{metricLabels[metric]}</button></th>)}</tr></thead>
            <tbody>
              {rows.map((row, index) => {
                const hero = row.heroData!;
                return (
                  <tr key={row.hero}>
                    <td><span className={index < 3 ? "stats-rank top" : "stats-rank"}>{index < 3 && <Trophy aria-hidden="true" />}{index + 1}</span></td>
                    <td><Link href={`/heroes/${hero.key}/${snapshot.id === gameMode ? `#stats-${snapshot.id}` : ""}`} className="stats-hero"><span className={`stats-portrait role-${hero.role}`}><Image src={hero.portrait} alt="" width={44} height={44} /></span><span><strong>{hero.name}</strong><small>{roleLabels[hero.role]} · 영웅 정보</small></span></Link></td>
                    {metrics.map((metric) => {
                      const delta = rateDelta(row[metric], priorRows.get(row.hero)?.[metric]);
                      return <td key={metric}><div className={`rate-cell ${activeSortKey === metric ? "active" : ""}`}><strong>{formatRate(row[metric])}</strong><small className="stats-rate-delta">{delta === null ? "비교 자료 없음" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%p`}</small><span><i style={{ width: `${Math.max(0, ((row[metric] ?? 0) / maxValues[metric]) * 100)}%` }} /></span></div></td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length && <div className="stats-empty">검색 조건에 맞는 영웅이 없습니다.</div>}
        </div>
      </section>
    </div>
  );
}
