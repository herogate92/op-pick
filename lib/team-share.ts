import type { BuilderHero, Mode, Team } from "./team-builder";
import { selectionBlockReason } from "./team-builder.ts";

export interface SharedTeam { mode: Mode; team: Team; mapId: string }
export const TEAM_SAVE_KEY = "op-pick-team-v1";

export function encodeTeam(state: SharedTeam): string {
  return new URLSearchParams({ v: "1", mode: state.mode, team: state.team.map(key => key ?? "").join(","), map: state.mapId }).toString();
}

export function decodeTeam(value: string, heroes: BuilderHero[], mapIds: string[]): SharedTeam {
  if (value.length > 2048) throw new Error("조합 링크가 너무 깁니다.");
  const params = new URLSearchParams(value.replace(/^#/, ""));
  for (const key of ["v", "mode", "team", "map"]) {
    if (params.getAll(key).length !== 1) throw new Error("조합 링크 형식이 올바르지 않습니다.");
  }
  if (params.get("v") !== "1") throw new Error("지원하지 않는 조합 링크 버전입니다.");
  const mode = params.get("mode");
  if (mode !== "5v5" && mode !== "6v6") throw new Error("게임 모드가 올바르지 않습니다.");
  const keys = params.get("team")!.split(",");
  if (keys.length !== (mode === "5v5" ? 5 : 6)) throw new Error("팀 인원이 올바르지 않습니다.");
  const mapId = params.get("map")!;
  if (mapId && !mapIds.includes(mapId)) throw new Error("등록되지 않은 전장입니다.");
  const team: Team = Array(keys.length).fill(null);
  for (const [index, key] of keys.entries()) {
    if (!key) continue;
    const hero = heroes.find(item => item.key === key);
    if (!hero) throw new Error("등록되지 않은 영웅이 포함되어 있습니다.");
    const reason = selectionBlockReason(heroes, hero, mode, team, index);
    if (reason) throw new Error(reason);
    team[index] = key;
  }
  return { mode, team, mapId };
}
