"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BarChart3, Cross, Search, Shield, Swords, Trophy } from "lucide-react";
import type { Hero, HeroRateSnapshot, Role } from "@/lib/data";

type SortKey = "winRate" | "pickRate" | "banRate";

const roleLabels: Record<"all" | Role, string> = { all: "전체", tank: "돌격", damage: "공격", support: "지원" };
const roleIcons = { all: BarChart3, tank: Shield, damage: Swords, support: Cross };
const metricLabels: Record<SortKey, string> = { winRate: "승률", pickRate: "픽률", banRate: "금지율" };
const formatRate = (value: number | null) => value === null ? "--" : `${value.toFixed(1)}%`;

export function StatsExplorer({ snapshots, heroes }: { snapshots: HeroRateSnapshot[]; heroes: Hero[] }) {
  const [snapshotId, setSnapshotId] = useState(snapshots[0]?.id ?? "");
  const [role, setRole] = useState<"all" | Role>("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("winRate");
  const snapshot = snapshots.find((item) => item.id === snapshotId) ?? snapshots[0];
  const heroByKey = useMemo(() => new Map(heroes.map((hero) => [hero.key, hero])), [heroes]);

  const rows = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("ko");
    return snapshot.rows
      .map((row) => ({ ...row, heroData: heroByKey.get(row.hero) }))
      .filter((row) => row.heroData && (role === "all" || row.heroData.role === role))
      .filter((row) => !normalized || row.heroData!.name.toLocaleLowerCase("ko").includes(normalized))
      .sort((a, b) => (b[sortKey] ?? -1) - (a[sortKey] ?? -1));
  }, [heroByKey, query, role, snapshot, sortKey]);

  const topFor = (metric: SortKey) => snapshot.rows
    .filter((row) => row[metric] !== null && (metric !== "banRate" || (row[metric] ?? 0) > 0))
    .reduce<(typeof snapshot.rows)[number] | undefined>((top, row) => !top || (row[metric] ?? -1) > (top[metric] ?? -1) ? row : top, undefined);
  const leaders = { winRate: topFor("winRate"), pickRate: topFor("pickRate"), banRate: topFor("banRate") };
  const maxValues = {
    winRate: Math.max(...rows.map((row) => row.winRate ?? 0), 1),
    pickRate: Math.max(...rows.map((row) => row.pickRate ?? 0), 1),
    banRate: Math.max(...rows.map((row) => row.banRate ?? 0), 1),
  };

  return (
    <div className="stats-explorer">
      <section className="stats-summary" aria-label="통계 요약">
        {(["winRate", "pickRate", "banRate"] as SortKey[]).map((metric) => {
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
        <div className="stats-count-card"><span>분석 영웅</span><strong>{snapshot.rows.length}명</strong><em>공식 집계</em></div>
      </section>

      <section className="stats-panel">
        <div className="stats-mode-tabs" role="tablist" aria-label="게임 모드">
          {snapshots.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={snapshot.id === item.id} className={snapshot.id === item.id ? "selected" : ""} onClick={() => setSnapshotId(item.id)}>
              <span>{item.id === "competitive" ? "COMP" : "QUICK"}</span><strong>{item.label}</strong>
            </button>
          ))}
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
            <thead><tr><th scope="col">순위</th><th scope="col">영웅</th>{(["winRate", "pickRate", "banRate"] as SortKey[]).map((metric) => <th scope="col" key={metric}><button type="button" className={sortKey === metric ? "selected" : ""} onClick={() => setSortKey(metric)}>{metricLabels[metric]}</button></th>)}</tr></thead>
            <tbody>
              {rows.map((row, index) => {
                const hero = row.heroData!;
                return (
                  <tr key={row.hero}>
                    <td><span className={index < 3 ? "stats-rank top" : "stats-rank"}>{index < 3 && <Trophy aria-hidden="true" />}{index + 1}</span></td>
                    <td><Link href={`/heroes/${hero.key}/`} className="stats-hero"><span className={`stats-portrait role-${hero.role}`}><Image src={hero.portrait} alt="" width={44} height={44} /></span><span><strong>{hero.name}</strong><small>{roleLabels[hero.role]}</small></span></Link></td>
                    {(["winRate", "pickRate", "banRate"] as SortKey[]).map((metric) => <td key={metric}><div className={`rate-cell ${sortKey === metric ? "active" : ""}`}><strong>{formatRate(row[metric])}</strong><span><i style={{ width: `${Math.max(0, ((row[metric] ?? 0) / maxValues[metric]) * 100)}%` }} /></span></div></td>)}
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
