"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { decodeTeam, encodeTeam, TEAM_SAVE_KEY, type SharedTeam } from "@/lib/team-share";
import { AlertTriangle, Info, Check, ChevronRight, Cross, RotateCcw, Shield, Sparkles, Swords, UsersRound, WandSparkles } from "lucide-react";
import type { Combo, MapGuide, Role, TeamCaution, TeamSynergy } from "@/lib/data";
import { roleLabels, subroleLabels } from "@/lib/data";

import { assessTeam, fixedSlots, roleOrder, rankCandidates, getIssues, selectionBlockReason, type BuilderHero, type Mode, type Team } from "@/lib/team-builder";

export function TeamBuilder({ heroes, combos, maps, synergies, cautions }: { heroes: BuilderHero[]; combos: Combo[]; maps: MapGuide[]; synergies: TeamSynergy[]; cautions: TeamCaution[] }) {
  const [mode, setMode] = useState<Mode>("5v5");
  const [teams, setTeams] = useState<Record<Mode, Team>>({ "5v5": Array(5).fill(null), "6v6": Array(6).fill(null) });
  const [activeSlot, setActiveSlot] = useState(0);
  const [selectedMapId, setSelectedMapId] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const restore = () => {
      if (!window.location.hash.startsWith("#v=")) return;
      try {
        const state = decodeTeam(window.location.hash, heroes, maps.map(map => map.id));
        setMode(state.mode);
        setTeams(current => ({ ...current, [state.mode]: state.team }));
        setSelectedMapId(state.mapId);
        setActiveSlot(Math.max(0, state.team.findIndex(key => key === null)));
        setShareMessage("공유 링크의 조합을 불러왔습니다.");
      } catch (error) {
        setShareMessage(`조합을 불러오지 못했습니다. ${error instanceof Error ? error.message : "링크를 확인하세요."}`);
      }
    };
    const frame = requestAnimationFrame(restore);
    window.addEventListener("hashchange", restore);
    window.addEventListener("popstate", restore);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", restore);
      window.removeEventListener("popstate", restore);
    };
  }, [heroes, maps]);

  const team = teams[mode];
  const selectedKeys = team.filter(Boolean) as string[];
  const selectedHeroes = selectedKeys.map((key) => heroes.find((hero) => hero.key === key)).filter(Boolean) as BuilderHero[];
  const slotRole = mode === "5v5" ? fixedSlots[activeSlot]?.role ?? "tank" : null;
  const roleCounts = roleOrder.reduce((counts, role) => ({ ...counts, [role]: selectedHeroes.filter((hero) => hero.role === role).length }), { tank: 0, damage: 0, support: 0 } as Record<Role, number>);
  const matchedCombos = combos.filter((combo) => combo.modes.includes(mode) && combo.heroes.every((key) => selectedKeys.includes(key)));
  const activeSynergies = synergies.filter((synergy) => synergy.modes.includes(mode) && synergy.heroes.every((key) => selectedKeys.includes(key)));
  const activeCautions = cautions.filter((caution) => caution.modes.includes(mode) && caution.heroes.every((key) => selectedKeys.includes(key)));
  const selectedMap = maps.find((map) => map.id === selectedMapId);
  const filled = selectedKeys.length;
  const assessment = assessTeam(selectedKeys, mode, combos, synergies, cautions, selectedMap);
  const issues = getIssues(mode, team, roleCounts, matchedCombos.length, activeSynergies.length, activeCautions);
  const targetSlot = activeSlot;
  const remainingKeys = team.filter((key, index) => index !== targetSlot && key) as string[];
  const remainingCounts = roleOrder.reduce((counts, role) => ({ ...counts, [role]: heroes.filter(hero => remainingKeys.includes(hero.key) && hero.role === role).length }), { tank: 0, damage: 0, support: 0 } as Record<Role, number>);
  const recommendations = rankCandidates(heroes, combos, synergies, cautions, selectedMap, mode, team, targetSlot).slice(0, 5);

  const currentState = (): SharedTeam => ({ mode, team, mapId: selectedMapId });
  const saveTeam = () => {
    try {
      localStorage.setItem(TEAM_SAVE_KEY, encodeTeam(currentState()));
      setShareMessage("이 브라우저에 현재 조합 1개를 저장했습니다.");
    } catch { setShareMessage("브라우저 저장을 사용할 수 없습니다. 공유 링크를 보관해 주세요."); }
  };
  const loadTeam = () => {
    try {
      const saved = localStorage.getItem(TEAM_SAVE_KEY);
      if (!saved) { setShareMessage("이 브라우저에 저장된 조합이 없습니다."); return; }
      const state = decodeTeam(saved, heroes, maps.map(map => map.id));
      setMode(state.mode);
      setTeams(current => ({ ...current, [state.mode]: state.team }));
      setSelectedMapId(state.mapId);
      setActiveSlot(Math.max(0, state.team.findIndex(key => key === null)));
      setShareMessage("저장된 조합을 불러왔습니다.");
      setShareUrl("");
    } catch (error) { setShareMessage(`저장된 조합을 불러오지 못했습니다. ${error instanceof Error ? error.message : "브라우저 설정을 확인하세요."}`); }
  };
  const shareTeam = async () => {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = encodeTeam(currentState());
    setShareUrl(url.href);
    try {
      await navigator.clipboard.writeText(url.href);
      setShareMessage("현재 조합의 공유 링크를 복사했습니다.");
    } catch { setShareMessage("자동 복사가 제한되어 있습니다. 아래 링크를 선택해 직접 복사하세요."); }
  };

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setActiveSlot(0);
  };

  const chooseHero = (hero: BuilderHero) => {
    if (selectionBlockReason(heroes, hero, mode, team, activeSlot)) return;
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
        <div><span className="section-kicker">VIRTUAL TEAM LAB</span><h1>팀 조합 연구소</h1><p>아군 픽을 직접 구성하고 역할 균형과 일반 기술·궁극기 연계를 함께 확인하세요.</p></div>
        <div className="mode-switch" role="tablist" aria-label="게임 인원 선택">
          <button role="tab" aria-selected={mode === "5v5"} className={mode === "5v5" ? "active" : ""} onClick={() => changeMode("5v5")}><strong>5대5</strong><small>1돌격 · 2공격 · 2지원</small></button>
          <button role="tab" aria-selected={mode === "6v6"} className={mode === "6v6" ? "active" : ""} onClick={() => changeMode("6v6")}><strong>6대6</strong><small>돌격 최대 2명</small></button>
        </div>
      </header>

      <nav className="builder-jump-nav" aria-label="팀 구성 바로가기"><a href="#team-slots">팀 선택</a><a href="#hero-roster">영웅 목록</a><a href="#team-analysis">추천·진단</a><a href="#team-sharing">저장·공유</a></nav>
      <div className="builder-priority-note">
        <Sparkles aria-hidden="true" /><div><strong>{mode === "5v5" ? "역할 고정 규칙 적용" : "6대6 돌격 인원 제한"}</strong><span>{mode === "5v5" ? "슬롯에 맞는 역할의 영웅만 선택할 수 있습니다." : "돌격은 최대 2명까지 선택할 수 있습니다. 기존 돌격 영웅의 교체는 가능합니다. 5v5 전용 연계는 점수에 반영하지 않습니다."}</span></div>
        <label className="builder-map-select"><span>전장 반영</span><select value={selectedMapId} onChange={(event) => setSelectedMapId(event.target.value)}><option value="">전장 미선택</option>{maps.map((map) => <option key={map.id} value={map.id}>{map.name} · {map.mode}</option>)}</select></label>
      </div>


      <div className="builder-layout">
        <section id="team-slots" className="builder-workbench">
          <div className="team-slots-heading"><div><span className="section-kicker">ALLY TEAM</span><h2>아군 영웅 구성</h2></div><div><button onClick={clearTeam}><RotateCcw />초기화</button><button className="auto-complete" onClick={completeTeam}><WandSparkles />추천으로 완성</button></div></div>
          <div className={`team-slots mode-${mode}`}>
            {team.map((key, index) => {
              const hero = heroes.find((item) => item.key === key);
              const role = mode === "5v5" ? fixedSlots[index].role : hero?.role;
              return (
                <button key={index} className={activeSlot === index ? "team-slot active" : "team-slot"} onClick={() => setActiveSlot(index)} aria-label={`${index + 1}번 슬롯 ${hero ? hero.name : "비어 있음"}`}>
                  <span className={`slot-role ${role ?? "free"}`}>{mode === "5v5" ? fixedSlots[index].label : hero ? roleLabels[hero.role] : "자유"}</span>
                  {hero ? <><img src={hero.portrait} alt="" /><strong>{hero.name}</strong><small>{subroleLabels[hero.subrole] ?? hero.subrole}</small><span className="slot-remove" onClick={(event) => { event.stopPropagation(); removeHero(index); }} aria-label={`${hero.name} 제거`}>×</span></> : <><UsersRound aria-hidden="true" /><strong>영웅 선택</strong><small>{mode === "5v5" ? `${roleLabels[fixedSlots[index].role]} 전용` : "돌격 최대 2명"}</small></>}
                </button>
              );
            })}
          </div>

          <section id="hero-roster" className="builder-roster" aria-label="영웅 목록">
            <header><div><span className="section-kicker">HERO ROSTER</span><h2>{activeSlot + 1}번 슬롯에 영웅 선택</h2></div><span>{slotRole ? `${roleLabels[slotRole]} 영웅만 표시` : "돌격 최대 2명 · 기존 돌격 교체 가능"}</span></header>
            <div className="builder-role-groups">
              {roleOrder.map((role) => {
                const roleHeroes = heroes.filter((hero) => hero.role === role);
                return <section key={role} className="builder-role-group"><h3>{role === "tank" ? <Shield /> : role === "damage" ? <Swords /> : <Cross />}{roleLabels[role]}<small>{roleHeroes.length}명</small></h3><div>{roleHeroes.map((hero) => {
                  const usedAt = team.findIndex((key) => key === hero.key);
                  const blockedReason = selectionBlockReason(heroes, hero, mode, team, activeSlot);
                  const disabled = Boolean(blockedReason);
                  return <button key={hero.key} disabled={disabled} className={team[activeSlot] === hero.key ? "selected" : ""} onClick={() => chooseHero(hero)} title={blockedReason ?? hero.name}><img src={hero.portrait} alt="" /><span>{hero.name}</span>{usedAt >= 0 && <em>{usedAt + 1}</em>}</button>;
                })}</div></section>;
              })}
            </div>
          </section>
        </section>

        <aside id="team-analysis" className="builder-analysis">
          <section className="analysis-score-card">
            <div className="team-score" style={{ "--team-score": `${filled / team.length * 360}deg` } as React.CSSProperties}><span><strong>{filled}/{team.length}</strong><small>인원 구성</small></span></div>
            <div><span className="section-kicker">TEAM COMPLETENESS</span><h2>{filled === team.length ? "인원 구성 완료" : `${team.length - filled}자리 남음`}</h2><p>인원 충원은 전술 점수에 더하지 않습니다. 등록된 근거가 적으면 점수가 낮을 수 있으며, 승률이나 실제 강함을 뜻하지 않습니다.</p></div>
          </section>

          <section className="analysis-card evidence-score-card"><header><h3>등록 근거 점수</h3><strong>{assessment.total} / 32</strong></header><p>연계 {assessment.linkage}/22 + 전장 {assessment.mapPoints}/10 − 주의 조합 {assessment.penalty}/15</p><p>{selectedMap ? "전장은 등록된 추천 영웅의 평균값입니다." : "전장 미선택: 전장 점수는 미평가(0점)입니다."} 역할 구성과 인원은 아래에서 따로 확인하세요.</p><details><summary>점수 계산 기준</summary><p>일반 시너지 평점×2와 궁극기 평점을 합산해 최대 22점. 전장 1·2·3그룹은 10·6.25·3.125점으로 변환해 선택 인원 평균을 반올림합니다. 주의 조합은 위험도×2, 최대 15점을 차감합니다. 합계 하한은 0점입니다. 미등록은 약점이 아닙니다.</p></details></section>

          <section className="analysis-card role-balance-card"><header><h3>역할 구성</h3><span>{filled}/{team.length}</span></header><div>{roleOrder.map((role) => <span key={role} className={role}><strong>{roleLabels[role]}</strong><em>{roleCounts[role]}</em></span>)}</div></section>

          <section className="analysis-card issues-card"><header><h3>조합 진단</h3><span>{issues.length}</span></header><div>{issues.map((issue, index) => <p key={index} className={issue.neutral ? "neutral" : issue.good ? "good" : "warning"}>{issue.neutral ? <Info /> : issue.good ? <Check /> : <AlertTriangle />}<span>{issue.text}</span></p>)}</div></section>

          <section className="analysis-card recommendation-card"><header><h3>{team[targetSlot] ? "선택 슬롯 교체 추천" : "선택 슬롯 픽 추천"}</h3><span>{targetSlot + 1}번 슬롯</span></header><div>{recommendations.map((hero, index) => <button key={hero.key} onClick={() => chooseHero(hero)}><em>{index + 1}</em><img src={hero.portrait} alt="" /><span><strong>{hero.name}</strong><small>{roleLabels[hero.role]} · {recommendReason(hero, remainingKeys, combos, synergies, selectedMap, remainingCounts, mode)}</small><small>근거 점수 {assessment.total} → {assessTeam([...remainingKeys, hero.key], mode, combos, synergies, cautions, selectedMap).total} · 선택한 {targetSlot + 1}번 슬롯{team[targetSlot] ? " 교체" : " 채우기"}</small></span><ChevronRight /></button>)}</div></section>

          <section className="analysis-card detected-synergies"><header><h3>활성 전술 시너지</h3><span>{activeSynergies.length}</span></header>{activeSynergies.length ? activeSynergies.map((synergy) => <div key={synergy.id}><Sparkles /><span><strong>{synergy.name}</strong><small>{synergy.category === "mixed" ? "궁극기 준비 필요 · " : ""}{synergy.heroes.map((key) => heroes.find((hero) => hero.key === key)?.name ?? key).join(" + ")}</small><p>{synergy.reason}</p><Link href={`/combos/#${synergy.id}`}>조건·사례·실행 순서 보기</Link></span><em>{synergy.score}/5</em></div>) : <p>{mode === "6v6" ? "6v6 연계는 별도 사례 검토 전입니다. 5v5의 추천 점수를 그대로 적용하지 않습니다." : "사례와 기술 근거를 확인한 조합만 표시합니다. 보류 항목은 자동 추천 점수에서 제외됩니다."}</p>}</section>

          <section className="analysis-card detected-combos"><header><h3>활성 궁 조합</h3><span>{matchedCombos.length}</span></header>{matchedCombos.length ? matchedCombos.map((combo) => <Link href={`/combos/#${combo.id}`} key={combo.id}><Sparkles /><span><strong>{combo.name}</strong><small>추천 {combo.score}/5 · 난이도 {combo.difficulty}/5</small></span><ChevronRight /></Link>) : <p>두 영웅 이상을 선택하면 등록된 궁극기 연계를 찾아 표시합니다.</p>}</section>
        </aside>
      </div>
      <section id="team-sharing" className="builder-sharing" aria-label="조합 저장 및 공유">
        <div><button onClick={saveTeam}>이 브라우저에 저장</button><button onClick={loadTeam}>저장 조합 불러오기</button><button onClick={shareTeam}>공유 링크 복사</button></div>
        <p>모드·영웅·빈 슬롯·전장을 저장합니다. 브라우저 저장은 1개이며 다시 저장하면 덮어씁니다. 공유 링크는 생성 당시의 조합을 담습니다.</p>
        <p role="status" aria-live="polite">{shareMessage}</p>
        {shareUrl && <label>공유 링크<input aria-label="공유 링크" readOnly value={shareUrl} onFocus={event => event.target.select()} /></label>}
      </section>

    </div>
  );
}

function recommendReason(hero: BuilderHero, selected: string[], combos: Combo[], synergies: TeamSynergy[], selectedMap: MapGuide | undefined, counts: Record<Role, number>, mode: Mode) {
  const synergy = synergies.find((item) => item.modes.includes(mode) && item.heroes.includes(hero.key) && item.heroes.some((key) => selected.includes(key)));
  if (synergy) return `${synergy.type} 시너지`;
  const linked = combos.find((combo) => combo.modes.includes(mode) && combo.heroes.includes(hero.key) && combo.heroes.some((key) => selected.includes(key)));
  if (linked) return `${linked.name} 연계 가능`;
  const mapPick = selectedMap?.recommendations.find((recommendation) => recommendation.hero === hero.key);
  if (mapPick) return `${selectedMap?.name} 추천 ${mapPick.rank}그룹`;
  if (mode === "6v6" && counts[hero.role] === 0) return `부족한 ${roleLabels[hero.role]} 역할 보완`;
  if (mode === "6v6" && hero.role === "support" && counts.support < 2) return "팀 유지력 보완";
  return `${subroleLabels[hero.subrole] ?? hero.subrole} 후보`;
}
