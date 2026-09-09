import type { Metadata } from "next";
import { ArrowDown, Gauge, ShieldAlert, Sparkles } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { ScoreMeter } from "@/components/ScoreMeter";
import { SiteHeader } from "@/components/SiteHeader";
import { SynergyCard } from "@/components/SynergyCard";
import { combos, getHero, heldTeamSynergies, teamSynergies } from "@/lib/data";

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
        <h1>기술 연계부터 <em>영웅 궁합까지</em></h1>
        <p>일반 기술끼리, 일반 기술과 궁극기, 함께 쓰기 좋은 영웅의 역할 분담을 살펴보세요. 구체적인 활용 사례와 기술 근거가 있는 조합만 추천합니다.</p>
      </section>
      <div className="content-with-rail">
        <div className="page-content">
          <nav className="synergy-category-nav" aria-label="조합 유형">
            <a href="#ability-synergies">일반 기술</a><a href="#mixed-synergies">일반 기술 + 궁극기</a><a href="#pair-synergies">영웅 궁합</a><a href="#ultimate-combos">궁극기 연계</a><a href="#held-synergies">검토 보류</a>
          </nav>
          <p className="seo-guide-note">우선 5v5 일반 모드 기준 {teamSynergies.length}개를 제공합니다. 사례 출처와 실행 절차는 구분하며, 과거 대회 활용이 현재 승률 우위를 보장하지는 않습니다. 게임 내 직접 재현은 하지 않았습니다.</p>
          {([
            ["ability", "일반 기술로 만드는 기회", "궁극기를 기다리지 않고 이동·고지·화력을 연결합니다."],
            ["mixed", "일반 기술 + 궁극기", "궁극기 하나에 이동이나 방어 기술을 맞춰 사격 기회를 만듭니다."],
            ["pair", "함께 쓰기 좋은 영웅 궁합", "각 영웅의 사거리·접근·지원 능력을 구체적인 교전에서 연결합니다."],
          ] as const).map(([category, title, description]) => <section key={category} id={`${category}-synergies`} className="content-section synergy-category-section">
            <div className="section-heading"><h2>{title}</h2><p>{description}</p></div>
            <div className="combo-grid">{teamSynergies.filter((item) => item.category === category).map((synergy) => <SynergyCard key={synergy.id} synergy={synergy} />)}</div>
          </section>)}
          <section id="ultimate-combos" className="content-section synergy-category-section">
          <div className="section-heading"><h2>궁극기 + 궁극기 연계</h2><p>기존 궁극기 가이드입니다. 일반 기술 시너지의 이번 사례 검토와는 별도입니다.</p></div>
          <div className="combo-grid">
            {combos.map((combo, index) => (
              <article key={combo.id} id={combo.id} className="combo-card">
                <header><span className="combo-index">{String(index + 1).padStart(2, "0")}</span><div><span className="section-kicker">ULTIMATE COMBO</span><h2>{combo.name}</h2></div><ScoreMeter value={combo.score} label="추천도" /></header>
                <div className="combo-heroes">
                  {combo.heroes.map((key, heroIndex) => {
                    const hero = getHero(key)!;
                    return <div key={key} className="combo-hero">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt={`${hero.name} 초상`} /><strong>{hero.name}</strong>{heroIndex === 0 && <Sparkles className="combo-plus" />}</div>;
                  })}
                </div>
                <p className="combo-description">{combo.description}</p>
                <div className="combo-meta"><span><Gauge />난이도 <ScoreMeter value={combo.difficulty} /></span><span><ArrowDown />타이밍 <small>{combo.timing}</small></span></div>
                <div className="combo-counters"><span><ShieldAlert />대표 대응</span><div>{combo.counters.map((key) => { const hero = getHero(key)!; return <a href={`/heroes/${hero.key}/`} key={key}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt="" /><span>{hero.name}</span></a>; })}</div></div>
              </article>
            ))}
          </div>
          </section>
          <section id="held-synergies" className="content-section synergy-category-section">
            <div className="section-heading"><h2>사례 보강 전 보류</h2><p>보류는 시너지가 없다는 뜻이 아닙니다. 근거를 확인하기 전에는 팀 구성의 자동 추천 점수에도 반영하지 않습니다.</p></div>
            <details className="synergy-held-list"><summary>보류한 {heldTeamSynergies.length}개 조합과 이유 보기</summary>
              <ul>{heldTeamSynergies.map((item) => <li key={item.id}><strong>{item.heroes.map((key) => getHero(key)!.name).join(" + ")} · {item.type}</strong><p>{item.holdReason}</p></li>)}</ul>
            </details>
          </section>
          <AdSlot kind="banner" />
        </div>
        <AdSlot kind="rail" />
      </div>
    </main>
  );
}
