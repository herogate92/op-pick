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
      {ability.statsCheckedAt && <small>수치 확인 {ability.statsCheckedAt}</small>}
    </div>
  );
}
