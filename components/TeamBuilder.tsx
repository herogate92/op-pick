"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, ChevronRight, Cross, RotateCcw, Shield, Sparkles, Swords, UsersRound, WandSparkles } from "lucide-react";
import type { Combo, MapGuide, Role, TeamCaution, TeamMode, TeamSynergy } from "@/lib/data";
import { roleLabels, subroleLabels } from "@/lib/data";

interface BuilderHero {
  key: string;
  name: string;
  role: Role;
  subrole: string;
  portrait: string;
  reviewStatus: "verified" | "review-needed";
}

type Mode = TeamMode;
type Team = Array<string | null>;

const fixedSlots: Array<{ role: Role; label: string }> = [
  { role: "tank", label: "돌격" },
  { role: "damage", label: "공격 1" },
  { role: "damage", label: "공격 2" },
  { role: "support", label: "지원 1" },
  { role: "support", label: "지원 2" },
];

const roleOrder: Role[] = ["tank", "damage", "support"];

export function TeamBuilder({ heroes, combos, maps, synergies, cautions }: { heroes: BuilderHero[]; combos: Combo[]; maps: MapGuide[]; synergies: TeamSynergy[]; cautions: TeamCaution[] }) {
  const [mode, setMode] = useState<Mode>("5v5");
  const [teams, setTeams] = useState<Record<Mode, Team>>({ "5v5": Array(5).fill(null), "6v6": Array(6).fill(null) });
  const [activeSlot, setActiveSlot] = useState(0);
  const [selectedMapId, setSelectedMapId] = useState("");
  const team = teams[mode];
  const selectedKeys = team.filter(Boolean) as string[];
  const selectedHeroes = selectedKeys.map((key) => heroes.find((hero) => hero.key === key)).filter(Boolean) as BuilderHero[];
  const slotRole = mode === "5v5" ? fixedSlots[activeSlot]?.role ?? "tank" : null;
  const roleCounts = roleOrder.reduce((counts, role) => ({ ...counts, [role]: selectedHeroes.filter((hero) => hero.role === role).length }), { tank: 0, damage: 0, support: 0 } as Record<Role, number>);
  const matchedCombos = combos.filter((combo) => combo.heroes.every((key) => selectedKeys.includes(key)));
  const activeSynergies = synergies.filter((synergy) => synergy.modes.includes(mode) && synergy.heroes.every((key) => selectedKeys.includes(key)));
  const activeCautions = cautions.filter((caution) => caution.modes.includes(mode) && caution.heroes.every((key) => selectedKeys.includes(key)));
  const selectedMap = maps.find((map) => map.id === selectedMapId);
  const filled = selectedKeys.length;
  const completeness = filled / team.length;
  const balanceScore = mode === "5v5"
    ? Math.round(completeness * 20)
    : (roleCounts.tank > 0 ? 6 : 0) + (roleCounts.damage > 0 ? 5 : 0) + (roleCounts.support > 0 ? 6 : 0) + (roleCounts.support >= 2 ? 3 : 0);
  const linkageScore = Math.min(22, activeSynergies.reduce((sum, synergy) => sum + synergy.score * 2, 0) + matchedCombos.reduce((sum, combo) => sum + combo.score, 0));
  const mapScore = selectedMap ? getMapTeamScore(selectedMap, selectedKeys) : (filled ? 4 : 0);
  const cautionPenalty = Math.min(15, activeCautions.reduce((sum, caution) => sum + caution.penalty * 2, 0));
  const teamScore = Math.max(0, Math.min(100, Math.round(completeness * 54 + balanceScore + linkageScore + mapScore - cautionPenalty)));
  const issues = getIssues(mode, team, roleCounts, matchedCombos.length, activeCautions);
  const targetSlot = team[activeSlot] === null ? activeSlot : Math.max(0, team.findIndex((key) => key === null));
  const recommendations = rankCandidates(heroes, combos, synergies, cautions, selectedMap, mode, team, targetSlot).slice(0, 5);

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setActiveSlot(0);
  };

  const chooseHero = (hero: BuilderHero) => {
    const usedAt = team.findIndex((key) => key === hero.key);
    if (usedAt >= 0 && usedAt !== activeSlot) return;
    if (mode === "5v5" && fixedSlots[activeSlot].role !== hero.role) return;
    const next = [...team];
    next[activeSlot] = hero.key;
    setTeams((current) => ({ ...current, [mode]: next }));
    const nextEmpty = next.findIndex((key, index) => key === null && index > activeSlot);
    if (nextEmpty >= 0) setActiveSlot(nextEmpty);
  };

  const removeHero = (index: number) => {
    const next = [...team];
    next[index] = null;
    setTeams((current) => ({ ...current, [mode]: next }));
    setActiveSlot(index);
  };

  const clearTeam = () => {
    setTeams((current) => ({ ...current, [mode]: Array(mode === "5v5" ? 5 : 6).fill(null) }));
    setActiveSlot(0);
  };

  const completeTeam = () => {
    const draft = [...team];
    for (let index = 0; index < draft.length; index += 1) {
      if (draft[index] !== null) continue;
      const [best] = rankCandidates(heroes, combos, synergies, cautions, selectedMap, mode, draft, index);
      if (best) draft[index] = best.key;
    }
    setTeams((current) => ({ ...current, [mode]: draft }));
    setActiveSlot(Math.max(0, draft.findIndex((key) => key === null)));
  };

  return (
    <div className="team-builder-shell">
      <header className="builder-intro">
        <div><span className="section-kicker">VIRTUAL TEAM LAB</span><h1>팀 조합 연구소</h1><p>아군 픽을 직접 구성하고 역할 균형과 대표 궁극기 연계를 함께 확인하세요.</p></div>
        <div className="mode-switch" role="tablist" aria-label="게임 인원 선택">
          <button role="tab" aria-selected={mode === "5v5"} className={mode === "5v5" ? "active" : ""} onClick={() => changeMode("5v5")}><strong>5대5</strong><small>1돌격 · 2공격 · 2지원</small></button>
          <button role="tab" aria-selected={mode === "6v6"} className={mode === "6v6" ? "active" : ""} onClick={() => changeMode("6v6")}><strong>6대6 자유</strong><small>역할 균형 + 궁 연계 평가</small></button>
        </div>
      </header>

      <div className="builder-priority-note">
        <Sparkles aria-hidden="true" /><div><strong>{mode === "5v5" ? "역할 고정 규칙 적용" : "6대6 추천 우선순위"}</strong><span>{mode === "5v5" ? "슬롯에 맞는 역할의 영웅만 선택할 수 있습니다." : "① 세 역할 확보 ② 전선과 유지력 ③ 대표 궁극기 조합 순으로 평가합니다."}</span></div>
        <label className="builder-map-select"><span>전장 반영</span><select value={selectedMapId} onChange={(event) => setSelectedMapId(event.target.value)}><option value="">전장 미선택</option>{maps.map((map) => <option key={map.id} value={map.id}>{map.name} · {map.mode}</option>)}</select></label>
      </div>

      <div className="builder-layout">
        <section className="builder-workbench">
          <div className="team-slots-heading"><div><span className="section-kicker">ALLY TEAM</span><h2>아군 영웅 구성</h2></div><div><button onClick={clearTeam}><RotateCcw />초기화</button><button className="auto-complete" onClick={completeTeam}><WandSparkles />추천으로 완성</button></div></div>
          <div className={`team-slots mode-${mode}`}>
            {team.map((key, index) => {
              const hero = heroes.find((item) => item.key === key);
              const role = mode === "5v5" ? fixedSlots[index].role : hero?.role;
              return (
                <button key={index} className={activeSlot === index ? "team-slot active" : "team-slot"} onClick={() => setActiveSlot(index)} aria-label={`${index + 1}번 슬롯 ${hero ? hero.name : "비어 있음"}`}>
                  <span className={`slot-role ${role ?? "free"}`}>{mode === "5v5" ? fixedSlots[index].label : hero ? roleLabels[hero.role] : "자유"}</span>
                  {hero ? <><img src={hero.portrait} alt="" /><strong>{hero.name}</strong><small>{subroleLabels[hero.subrole] ?? hero.subrole}</small><span className="slot-remove" onClick={(event) => { event.stopPropagation(); removeHero(index); }} aria-label={`${hero.name} 제거`}>×</span></> : <><UsersRound aria-hidden="true" /><strong>영웅 선택</strong><small>{mode === "5v5" ? `${roleLabels[fixedSlots[index].role]} 전용` : "모든 역할 가능"}</small></>}
                </button>
              );
            })}
          </div>

          <section className="builder-roster" aria-label="영웅 목록">
            <header><div><span className="section-kicker">HERO ROSTER</span><h2>{activeSlot + 1}번 슬롯에 영웅 선택</h2></div><span>{slotRole ? `${roleLabels[slotRole]} 영웅만 표시` : "모든 역할 선택 가능"}</span></header>
            <div className="builder-role-groups">
              {roleOrder.map((role) => {
                const roleHeroes = heroes.filter((hero) => hero.role === role);
                return <section key={role} className="builder-role-group"><h3>{role === "tank" ? <Shield /> : role === "damage" ? <Swords /> : <Cross />}{roleLabels[role]}<small>{roleHeroes.length}명</small></h3><div>{roleHeroes.map((hero) => {
                  const usedAt = team.findIndex((key) => key === hero.key);
                  const roleBlocked = mode === "5v5" && fixedSlots[activeSlot].role !== hero.role;
                  const disabled = roleBlocked || (usedAt >= 0 && usedAt !== activeSlot);
                  return <button key={hero.key} disabled={disabled} className={team[activeSlot] === hero.key ? "selected" : ""} onClick={() => chooseHero(hero)} title={disabled ? "현재 슬롯에서 선택할 수 없습니다" : hero.name}><img src={hero.portrait} alt="" /><span>{hero.name}</span>{usedAt >= 0 && <em>{usedAt + 1}</em>}</button>;
                })}</div></section>;
              })}
            </div>
          </section>
        </section>

        <aside className="builder-analysis">
          <section className="analysis-score-card">
            <div className="team-score" style={{ "--team-score": `${teamScore * 3.6}deg` } as React.CSSProperties}><span><strong>{teamScore}</strong><small>/ 100</small></span></div>
            <div><span className="section-kicker">COMPOSITION SCORE</span><h2>{filled === team.length ? "조합 평가 완료" : `${team.length - filled}자리 남음`}</h2><p>역할, 전술 시너지, 궁극기, 전장 적합도와 주의 조합을 반영한 규칙 기반 참고 점수입니다.</p></div>
          </section>

          <section className="analysis-card role-balance-card"><header><h3>역할 구성</h3><span>{filled}/{team.length}</span></header><div>{roleOrder.map((role) => <span key={role} className={role}><strong>{roleLabels[role]}</strong><em>{roleCounts[role]}</em></span>)}</div></section>

          <section className="analysis-card issues-card"><header><h3>조합 진단</h3><span>{issues.length}</span></header><div>{issues.map((issue, index) => <p key={index} className={issue.good ? "good" : "warning"}>{issue.good ? <Check /> : <AlertTriangle />}<span>{issue.text}</span></p>)}</div></section>

          <section className="analysis-card recommendation-card"><header><h3>다음 픽 추천</h3><span>{targetSlot + 1}번 슬롯</span></header><div>{recommendations.map((hero, index) => <button key={hero.key} onClick={() => { setActiveSlot(targetSlot); chooseHeroAt(hero, targetSlot, team, mode, setTeams); }}><em>{index + 1}</em><img src={hero.portrait} alt="" /><span><strong>{hero.name}</strong><small>{roleLabels[hero.role]} · {recommendReason(hero, selectedKeys, combos, synergies, selectedMap, roleCounts, mode)}</small></span><ChevronRight /></button>)}</div></section>

          <section className="analysis-card detected-synergies"><header><h3>활성 전술 시너지</h3><span>{activeSynergies.length}</span></header>{activeSynergies.length ? activeSynergies.map((synergy) => <div key={synergy.id}><Sparkles /><span><strong>{synergy.type}</strong><small>{synergy.heroes.map((key) => heroes.find((hero) => hero.key === key)?.name ?? key).join(" + ")}</small><p>{synergy.reason}</p></span><em>{synergy.score}/5</em></div>) : <p>영웅을 둘 이상 선택하면 공식 기술 구조로 검토한 전술 시너지를 표시합니다.</p>}</section>

          <section className="analysis-card detected-combos"><header><h3>활성 궁 조합</h3><span>{matchedCombos.length}</span></header>{matchedCombos.length ? matchedCombos.map((combo) => <Link href={`/combos/#${combo.id}`} key={combo.id}><Sparkles /><span><strong>{combo.name}</strong><small>추천 {combo.score}/5 · 난이도 {combo.difficulty}/5</small></span><ChevronRight /></Link>) : <p>두 영웅 이상을 선택하면 등록된 궁극기 연계를 찾아 표시합니다.</p>}</section>
        </aside>
      </div>
    </div>
  );
}

function rankCandidates(heroes: BuilderHero[], combos: Combo[], synergies: TeamSynergy[], cautions: TeamCaution[], selectedMap: MapGuide | undefined, mode: Mode, team: Team, slotIndex: number) {
  const selected = team.filter(Boolean) as string[];
  const counts = roleOrder.reduce((value, role) => ({ ...value, [role]: selected.map((key) => heroes.find((hero) => hero.key === key)).filter((hero) => hero?.role === role).length }), { tank: 0, damage: 0, support: 0 } as Record<Role, number>);
  const requiredRole = mode === "5v5" ? fixedSlots[slotIndex].role : null;
  return heroes.filter((hero) => !selected.includes(hero.key) && (!requiredRole || hero.role === requiredRole)).map((hero) => {
    let score = combos.filter((combo) => combo.heroes.includes(hero.key) && combo.heroes.some((key) => selected.includes(key))).reduce((sum, combo) => sum + combo.score * 9, 0);
    score += synergies.filter((synergy) => synergy.modes.includes(mode) && synergy.heroes.includes(hero.key) && synergy.heroes.some((key) => selected.includes(key))).reduce((sum, synergy) => sum + synergy.score * 10, 0);
    score -= cautions.filter((caution) => caution.modes.includes(mode) && caution.heroes.includes(hero.key) && caution.heroes.some((key) => selected.includes(key))).reduce((sum, caution) => sum + caution.penalty * 8, 0);
    score += getMapCandidateScore(selectedMap, hero.key);
    if (!selected.length) {
      score += combos.filter((combo) => combo.heroes.includes(hero.key)).reduce((sum, combo) => sum + combo.score * 2, 0);
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

function getIssues(mode: Mode, team: Team, counts: Record<Role, number>, comboCount: number, activeCautions: TeamCaution[]) {
  const issues: Array<{ text: string; good: boolean }> = [];
  const filled = team.filter(Boolean).length;
  if (filled < team.length) issues.push({ text: `영웅 ${team.length - filled}명을 더 선택하세요.`, good: false });
  if (mode === "5v5") issues.push({ text: "역할 고정 비율이 자동으로 유지됩니다.", good: true });
  if (mode === "6v6") {
    if (!counts.tank) issues.push({ text: "전선을 만들 돌격 영웅이 없습니다.", good: false });
    if (counts.support < 2) issues.push({ text: "안정적인 유지력을 위해 지원 2명을 우선 권장합니다.", good: false });
    if (counts.tank && counts.damage && counts.support) issues.push({ text: "돌격·공격·지원 역할이 모두 포함됐습니다.", good: true });
    if (Math.max(counts.tank, counts.damage, counts.support) >= 4) issues.push({ text: "한 역할에 4명 이상 집중되어 대응 폭이 좁습니다.", good: false });
  }
  if (comboCount) issues.push({ text: `궁극기 연계 ${comboCount}개가 활성화됐습니다.`, good: true });
  else if (filled >= 2) issues.push({ text: "현재 선택에서 등록된 궁 연계를 찾지 못했습니다.", good: false });
  activeCautions.forEach((caution) => issues.push({ text: `${caution.reason} ${caution.mitigation}`, good: false }));
  return issues;
}

function recommendReason(hero: BuilderHero, selected: string[], combos: Combo[], synergies: TeamSynergy[], selectedMap: MapGuide | undefined, counts: Record<Role, number>, mode: Mode) {
  const synergy = synergies.find((item) => item.modes.includes(mode) && item.heroes.includes(hero.key) && item.heroes.some((key) => selected.includes(key)));
  if (synergy) return `${synergy.type} 시너지`;
  const linked = combos.find((combo) => combo.heroes.includes(hero.key) && combo.heroes.some((key) => selected.includes(key)));
  if (linked) return `${linked.name} 연계 가능`;
  const mapPick = selectedMap?.recommendations.find((recommendation) => recommendation.hero === hero.key);
  if (mapPick) return `${selectedMap?.name} 추천 ${mapPick.rank}그룹`;
  if (mode === "6v6" && counts[hero.role] === 0) return `부족한 ${roleLabels[hero.role]} 역할 보완`;
  if (mode === "6v6" && hero.role === "support" && counts.support < 2) return "팀 유지력 보완";
  return `${subroleLabels[hero.subrole] ?? hero.subrole} 후보`;
}

function getMapCandidateScore(map: MapGuide | undefined, heroKey: string) {
  const rank = map?.recommendations.find((recommendation) => recommendation.hero === heroKey)?.rank;
  if (rank === 1) return 16;
  if (rank === 2) return 10;
  if (rank === 3) return 5;
  return 0;
}

function getMapTeamScore(map: MapGuide, selectedKeys: string[]) {
  if (!selectedKeys.length) return 0;
  const total = selectedKeys.reduce((sum, key) => sum + Math.min(10, getMapCandidateScore(map, key) * .625), 0);
  return Math.round(total / selectedKeys.length);
}

function chooseHeroAt(hero: BuilderHero, index: number, team: Team, mode: Mode, setTeams: React.Dispatch<React.SetStateAction<Record<Mode, Team>>>) {
  const next = [...team];
  if (next.includes(hero.key)) return;
  if (mode === "5v5" && fixedSlots[index].role !== hero.role) return;
  next[index] = hero.key;
  setTeams((current) => ({ ...current, [mode]: next }));
}
