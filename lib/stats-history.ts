import type { HeroRatesDocument, HeroRateSnapshot } from "./data.ts";

export type StatsPatch = { patchDate: string; digest: string; sourceUrl: string };
export type StatsEntry = HeroRatesDocument & { fetchedAtIso: string; patch: StatsPatch | null };
export type StatsHistory = { version: 1; entries: StatsEntry[] };
export type StatsBaseline = { collectedAt: string; patchDate: string | null; snapshot: HeroRateSnapshot };
export type StatsComparison = { id: string; previous: StatsBaseline | null; priorPatch: StatsBaseline | null };

export function conditionKey(snapshot: HeroRateSnapshot) {
  return JSON.stringify([snapshot.gameMode ?? snapshot.id, snapshot.filters.input, snapshot.filters.region, snapshot.filters.map, snapshot.filters.tier, snapshot.dataProvider]);
}

export function validateHistory(value: unknown): asserts value is StatsHistory {
  const history = value as StatsHistory;
  if (history?.version !== 1 || !Array.isArray(history.entries) || !history.entries.length || history.entries.length > 30) throw new Error("통계 이력 형식 오류");
  let previousTime = -Infinity;
  for (const entry of history.entries) {
    const time = Date.parse(entry.fetchedAtIso);
    if (!Number.isFinite(time) || time <= previousTime || !entry.fetchedAt || !Array.isArray(entry.snapshots) || !entry.snapshots.length) throw new Error("통계 이력 수집 시각 오류");
    previousTime = time;
    if (entry.patch !== null && (!entry.patch?.patchDate || !entry.patch.digest || !entry.patch.sourceUrl?.startsWith("https://overwatch.blizzard.com/"))) throw new Error("통계 이력 패치 정보 오류");
    const conditions = new Set<string>();
    for (const snapshot of entry.snapshots) {
      if (!snapshot.id || !snapshot.label || !["overfast", "blizzard"].includes(snapshot.dataProvider) || !snapshot.sourceUrl?.startsWith("https://overwatch.blizzard.com/") || !snapshot.rows?.length) throw new Error("통계 이력 조건 오류");
      for (const key of ["input", "region", "map", "tier"] as const) if (!snapshot.filters?.[key]) throw new Error("통계 이력 필터 누락");
      const key = conditionKey(snapshot);
      if (conditions.has(key)) throw new Error("통계 이력 중복 조건");
      conditions.add(key);
      const heroes = new Set<string>();
      for (const row of snapshot.rows) {
        if (!row.hero || heroes.has(row.hero)) throw new Error("통계 이력 중복 영웅");
        heroes.add(row.hero);
        for (const value of [row.winRate, row.pickRate, row.banRate]) if (value !== null && (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100)) throw new Error("통계 이력 수치 오류");
      }
    }
  }
}

export function appendHistory(history: StatsHistory, current: StatsEntry): StatsHistory {
  validateHistory(history);
  validateHistory({ version: 1, entries: [current] });
  const latest = history.entries.at(-1)!;
  if (current.fetchedAtIso === latest.fetchedAtIso) {
    if (JSON.stringify(current) !== JSON.stringify(latest)) throw new Error("같은 수집 시각의 통계가 다릅니다");
    return history;
  }
  if (Date.parse(current.fetchedAtIso) < Date.parse(latest.fetchedAtIso)) throw new Error("이전 수집 자료로 이력을 덮어쓸 수 없습니다");
  return { version: 1, entries: [...history.entries, current].slice(-30) };
}

export function getComparisons(current: HeroRatesDocument, history: StatsHistory): StatsComparison[] {
  const currentEntry = history.entries.find(entry => entry.fetchedAtIso === current.fetchedAtIso);
  const older = [...history.entries].reverse().filter(entry => Date.parse(entry.fetchedAtIso) < Date.parse(current.fetchedAtIso ?? ""));
  return current.snapshots.map(snapshot => {
    const find = (priorPatch: boolean): StatsBaseline | null => {
      for (const entry of older) {
        if (priorPatch && (!currentEntry?.patch || !entry.patch || entry.patch.digest === currentEntry.patch.digest)) continue;
        const baseline = entry.snapshots.find(item => conditionKey(item) === conditionKey(snapshot));
        if (baseline) return { collectedAt: entry.fetchedAtIso, patchDate: entry.patch?.patchDate ?? null, snapshot: baseline };
      }
      return null;
    };
    return { id: snapshot.id, previous: find(false), priorPatch: find(true) };
  });
}

export function rateDelta(current: number | null | undefined, previous: number | null | undefined) {
  return current == null || previous == null ? null : Math.round((current - previous) * 10) / 10;
}
