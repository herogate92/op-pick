import type { Combo, MapGuide, Role, TeamCaution, TeamMode, TeamSynergy } from "./data";

export interface BuilderHero {
  key: string;
  name: string;
  role: Role;
  subrole: string;
  portrait: string;
  reviewStatus: "verified" | "review-needed";
}

export type Mode = TeamMode;
export type Team = Array<string | null>;

export const fixedSlots: Array<{ role: Role; label: string }> = [
  { role: "tank", label: "돌격" },
  { role: "damage", label: "공격 1" },
  { role: "damage", label: "공격 2" },
  { role: "support", label: "지원 1" },
  { role: "support", label: "지원 2" },
];

export const roleOrder: Role[] = ["tank", "damage", "support"];

export function selectionBlockReason(heroes: BuilderHero[], hero: BuilderHero, mode: Mode, team: Team, slotIndex: number): string | null {
  if (slotIndex < 0 || slotIndex >= team.length) return "선택할 슬롯이 없습니다.";
  const remaining = team.filter((key, index) => index !== slotIndex && key);
  if (remaining.includes(hero.key)) return "이미 다른 슬롯에 선택한 영웅입니다.";
  if (mode === "5v5" && fixedSlots[slotIndex]?.role !== hero.role) return "슬롯에 맞는 역할만 선택할 수 있습니다.";
  if (mode === "6v6" && hero.role === "tank" && remaining.filter(key => heroes.find(item => item.key === key)?.role === "tank").length >= 2) {
    return "6대6에서는 돌격 영웅을 최대 2명까지 선택할 수 있습니다. 돌격 슬롯을 선택하면 교체할 수 있습니다.";
  }
  return null;
}

export function rankCandidates(heroes: BuilderHero[], combos: Combo[], synergies: TeamSynergy[], cautions: TeamCaution[], selectedMap: MapGuide | undefined, mode: Mode, team: Team, slotIndex: number) {
  const selected = team.filter((key, index) => index !== slotIndex && key) as string[];
  const counts = roleOrder.reduce((value, role) => ({ ...value, [role]: selected.map((key) => heroes.find((hero) => hero.key === key)).filter((hero) => hero?.role === role).length }), { tank: 0, damage: 0, support: 0 } as Record<Role, number>);
  return heroes.filter((hero) => hero.reviewStatus === "verified" && hero.key !== team[slotIndex] && !selectionBlockReason(heroes, hero, mode, team, slotIndex)).map((hero) => {
    let score = combos.filter((combo) => combo.modes.includes(mode) && combo.heroes.includes(hero.key) && combo.heroes.some((key) => selected.includes(key))).reduce((sum, combo) => sum + combo.score * 9, 0);
    score += synergies.filter((synergy) => synergy.modes.includes(mode) && synergy.heroes.includes(hero.key) && synergy.heroes.some((key) => selected.includes(key))).reduce((sum, synergy) => sum + synergy.score * 10, 0);
    score -= cautions.filter((caution) => caution.modes.includes(mode) && caution.heroes.includes(hero.key) && caution.heroes.some((key) => selected.includes(key))).reduce((sum, caution) => sum + caution.penalty * 8, 0);
    score += getMapCandidateScore(selectedMap, hero.key);
    if (!selected.length) {
      score += combos.filter((combo) => combo.modes.includes(mode) && combo.heroes.includes(hero.key)).reduce((sum, combo) => sum + combo.score * 2, 0);
      score += synergies.filter((synergy) => synergy.modes.includes(mode) && synergy.heroes.includes(hero.key)).reduce((sum, synergy) => sum + synergy.score * 2, 0);
    }
    if (mode === "6v6") {
      if (counts[hero.role] === 0) score += 28;
      if (hero.role === "support" && counts.support < 2) score += 22;
      if (hero.role === "tank" && counts.tank === 0) score += 20;
      if (counts[hero.role] >= 3) score -= 16;
    } else score += 10;
    return { hero, score };
  }).sort((a, b) => b.score - a.score || a.hero.name.localeCompare(b.hero.name, "ko")).map((item) => item.hero);
}

export function getIssues(mode: Mode, team: Team, counts: Record<Role, number>, comboCount: number, synergyCount: number, activeCautions: TeamCaution[]) {
  const issues: Array<{ text: string; good: boolean; neutral?: boolean }> = [];
  const filled = team.filter(Boolean).length;
  if (filled < team.length) issues.push({ text: `영웅 ${team.length - filled}명을 더 선택하세요.`, good: false });
  if (mode === "5v5") issues.push({ text: "역할 고정 비율이 자동으로 유지됩니다.", good: true });
  if (mode === "6v6") {
    if (counts.tank > 2) issues.push({ text: "6대6에서는 돌격 영웅을 최대 2명까지 선택할 수 있습니다.", good: false });
    if (!counts.tank) issues.push({ text: "전선을 만들 돌격 영웅이 없습니다.", good: false });
    if (counts.support < 2) issues.push({ text: "안정적인 유지력을 위해 지원 2명을 우선 권장합니다.", good: false });
    if (counts.tank && counts.damage && counts.support) issues.push({ text: "돌격·공격·지원 역할이 모두 포함됐습니다.", good: true });
    if (Math.max(counts.tank, counts.damage, counts.support) >= 4) issues.push({ text: "한 역할에 4명 이상 집중되어 대응 폭이 좁습니다.", good: false });
  }
  if (comboCount) issues.push({ text: `궁극기 연계 ${comboCount}개가 활성화됐습니다.`, good: true });
  if (synergyCount) issues.push({ text: `일반 기술·영웅 궁합 ${synergyCount}개가 연결됩니다. 각 실행 조건을 확인하세요.`, good: true });
  if (!comboCount && !synergyCount && filled >= 2) issues.push({ text: "현재 선택에 등록된 연계가 없습니다. 조합이 약하다는 뜻은 아니며 추가 근거 검토가 필요합니다.", good: false, neutral: true });
  activeCautions.forEach((caution) => issues.push({ text: `${caution.reason} ${caution.mitigation}`, good: false }));
  return issues;
}

export function getMapCandidateScore(map: MapGuide | undefined, heroKey: string) {
  const rank = map?.recommendations.find((recommendation) => recommendation.hero === heroKey)?.rank;
  if (rank === 1) return 16;
  if (rank === 2) return 10;
  if (rank === 3) return 5;
  return 0;
}

export function getMapTeamScore(map: MapGuide, selectedKeys: string[]) {
  if (!selectedKeys.length) return 0;
  const total = selectedKeys.reduce((sum, key) => sum + Math.min(10, getMapCandidateScore(map, key) * .625), 0);
  return Math.round(total / selectedKeys.length);
}


export function assessTeam(keys: string[], mode: Mode, combos: Combo[], synergies: TeamSynergy[], cautions: TeamCaution[], map?: MapGuide) {
  const matches = combos.filter(c => c.modes.includes(mode) && c.heroes.every(key => keys.includes(key)));
  const links = synergies.filter(c => c.modes.includes(mode) && c.heroes.every(key => keys.includes(key)));
  const risks = cautions.filter(c => c.modes.includes(mode) && c.heroes.every(key => keys.includes(key)));
  const linkage = Math.min(22, links.reduce((sum, c) => sum + c.score * 2, 0) + matches.reduce((sum, c) => sum + c.score, 0));
  const mapPoints = map ? getMapTeamScore(map, keys) : 0;
  const penalty = Math.min(15, risks.reduce((sum, c) => sum + c.penalty * 2, 0));
  return { linkage, mapPoints, penalty, total: Math.max(0, linkage + mapPoints - penalty) };
}
