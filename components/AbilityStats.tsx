import type { Ability } from "@/lib/data";

export function AbilityStats({ ability, compact = false }: { ability: Ability; compact?: boolean }) {
  if (!ability.stats?.length) {
    return <small className="ability-stats-pending">세부 수치는 준비 중입니다.</small>;
  }

  return (
    <div className={compact ? "ability-stats ability-stats-compact" : "ability-stats"}>
      <dl>
        {ability.stats.map((stat) => (
          <div key={`${stat.label}-${stat.value}`}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>
        ))}
      </dl>
      <small>{ability.statsScope} · {ability.statsBasis}</small>
      {ability.statsSourceUrl ? <small><a href={ability.statsSourceUrl} target="_blank" rel="noreferrer">공식 패치 {ability.statsPatchDate}</a> · 확인 {ability.statsCheckedAt}</small> : <small>기존 입력일 {ability.statsCheckedAt} · 최신 수치 검증 전</small>}
    </div>
  );
}
