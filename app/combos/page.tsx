import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { SiteHeader } from "@/components/SiteHeader";
import { SynergyCard } from "@/components/SynergyCard";
import { ComboExplorer } from "@/components/ComboExplorer";
import { UltimateComboCard } from "@/components/UltimateComboCard";
import { heroSearchTerms } from "@/lib/combo-search";
import { combos, getHero, heroes, heldCombos, heldTeamSynergies, teamSynergies } from "@/lib/data";

export const metadata: Metadata = {
  title: "오버워치 궁극기와 팀 조합",
  description: "냥바스와 위버–캐서디 등 일반 기술, 궁극기 연계와 영웅 궁합을 사례·조건·출처와 함께 확인합니다.",
  alternates: { canonical: "/combos/" },
};

export default function CombosPage() {
  return (
    <main className="page-shell combos-page">
      <SiteHeader active="combos" />
      <section className="page-intro">
        <span className="section-kicker">TEAM SYNERGY</span>
        <h1>조합 <em>찾기</em></h1>
        <p>영웅을 골라 함께 쓰기 좋은 조합을 확인하세요.</p>
      </section>
      <div className="content-with-rail">
        <div className="page-content">
          <details className="combo-basis"><summary>5v5 추천 · 자료 기준 안내</summary><p>5v5 기준 조건부 추천입니다. 공개 사례·기술 설명을 검토했으며 게임 내 직접 재현은 하지 않았습니다. 과거 사례가 현재 승률 우위를 보장하지는 않습니다.</p></details>
          <ComboExplorer heroes={heroes.map(({ key, name, role, portrait }) => ({ key, name, role, portrait }))} cards={[
            ...teamSynergies.map(synergy => ({ id: synergy.id, heroes: synergy.heroes, category: synergy.category, searchText: [synergy.name, synergy.type, ...synergy.abilities.map(a => a.name), ...synergy.heroes.map(key => heroSearchTerms(key, getHero(key)!.name))].join(" "), content: <SynergyCard synergy={synergy} /> })),
            ...combos.map(combo => ({ id: combo.id, heroes: combo.heroes, category: "ultimate", searchText: [combo.name, ...combo.heroes.map(key => heroSearchTerms(key, getHero(key)!.name))].join(" "), content: <UltimateComboCard combo={combo} /> })),
          ]} />
          <section id="held-synergies" className="content-section synergy-category-section">
            <div className="section-heading"><h2>사례 보강 전 보류</h2><p>보류는 시너지가 없다는 뜻이 아닙니다. 근거를 확인하기 전에는 팀 구성의 자동 추천 점수에도 반영하지 않습니다.</p></div>
            <details className="synergy-held-list"><summary>보류한 {heldTeamSynergies.length + heldCombos.length}개 조합과 이유 보기</summary>
              <ul>{heldCombos.map(item => <li id={item.id} key={item.id}><strong>{item.name} · 궁극기 연계</strong><p>{item.holdReason}</p>{item.reviewEvidence && <><p><strong>검토한 근거</strong> · {item.reviewEvidence.summary} <a href={item.reviewEvidence.url} target="_blank" rel="noreferrer">검토 출처</a></p><p><strong>추천 복귀 조건</strong> · {item.recheckRequirement}</p><small>자료 검토 {item.reviewedAt} · 게임 내 직접 재현 미실시</small></>}</li>)}{heldTeamSynergies.map((item) => <li key={item.id}><strong>{item.heroes.map((key) => getHero(key)!.name).join(" + ")} · {item.type}</strong><p>{item.holdReason}</p>{item.reviewEvidence && <><p><strong>검토한 근거</strong> · {item.reviewEvidence.summary} <a href={item.reviewEvidence.url} target="_blank" rel="noreferrer">검토 출처</a></p><p><strong>추천 복귀 조건</strong> · {item.recheckRequirement}</p><small>자료 검토 {item.reviewedAt} · 게임 내 직접 재현 미실시</small></>}</li>)}</ul>
            </details>
          </section>
          <AdSlot kind="banner" />
        </div>
        <AdSlot kind="rail" />
      </div>
    </main>
  );
}
