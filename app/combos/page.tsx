import type { Metadata } from "next";
import { ArrowDown, Gauge, ShieldAlert, Sparkles } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { ScoreMeter } from "@/components/ScoreMeter";
import { SiteHeader } from "@/components/SiteHeader";
import { combos, getHero } from "@/lib/data";

export const metadata: Metadata = { title: "궁극기와 팀 조합", description: "대표 궁극기 연계, 사용 타이밍과 대응 영웅을 확인합니다." };

export default function CombosPage() {
  return (
    <main className="page-shell combos-page">
      <SiteHeader active="combos" />
      <section className="page-intro">
        <span className="section-kicker">TEAM SYNERGY</span>
        <h1>두 개의 궁극기로<br /><em>한타를 설계하세요</em></h1>
        <p>대표적인 궁극기 연계와 사용 타이밍, 상대가 대응할 수 있는 수단을 함께 정리했습니다.</p>
      </section>
      <div className="content-with-rail">
        <div className="page-content">
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
          <AdSlot kind="banner" />
        </div>
        <AdSlot kind="rail" />
      </div>
    </main>
  );
}
