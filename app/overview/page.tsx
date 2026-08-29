import Link from "next/link";
import { ArrowRight, CheckCircle2, Database, Shield, Sparkles, Swords } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { SiteHeader } from "@/components/SiteHeader";
import { combos, getHero, heroes, matchups, roleLabels } from "@/lib/data";

export default function OverviewPage() {
  const featuredHeroes = ["ana", "dva", "genji", "kiriko", "reinhardt", "tracer"].map(getHero).filter(Boolean);
  return (
    <main className="page-shell home-page">
      <SiteHeader active="overview" />
      <section className="home-workspace">
        <header className="home-intro-panel">
          <div>
            <span className="section-kicker">OVERWATCH COUNTER GUIDE</span>
            <h1>픽을 고르는 가장 빠른 방법</h1>
            <p>영웅을 선택하고 스킬, 상성, 추천 조합을 한 화면에서 확인하세요.</p>
          </div>
          <Link href="/" className="home-primary-action"><Shield aria-hidden="true" /> 영웅 선택 시작 <ArrowRight aria-hidden="true" /></Link>
          <div className="home-stats" aria-label="데이터 현황">
            <span><strong>{heroes.length}</strong>영웅</span><span><strong>{matchups.length}</strong>수록 상성</span><span><strong>{combos.length}</strong>추천 조합</span>
          </div>
        </header>

        <div className="home-card-grid">
          <section className="home-tool-card home-heroes-card">
            <header><span><Shield aria-hidden="true" /></span><div><small>HEROES</small><h2>영웅 바로 선택</h2></div><Link href="/">전체 보기 <ArrowRight /></Link></header>
            <div className="home-hero-list">
              {featuredHeroes.map((hero) => hero && (
                <Link href={`/heroes/${hero.key}/`} key={hero.key}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt="" />
                  <span><strong>{hero.name}</strong><small>{roleLabels[hero.role]}</small></span>
                </Link>
              ))}
            </div>
            <Link href="/" className="home-card-action">선택 화면에서 모든 영웅 보기 <ArrowRight /></Link>
          </section>

          <section className="home-tool-card home-matchup-card">
            <header><span><Swords aria-hidden="true" /></span><div><small>MATCHUP</small><h2>상성 빠른 확인</h2></div><Link href="/matchups/">비교하기 <ArrowRight /></Link></header>
            <div className="home-matchup-list">
              {matchups.slice(0, 3).map((matchup) => {
                const hero = getHero(matchup.hero); const counter = getHero(matchup.counter);
                return <Link href={`/matchups/?hero=${matchup.hero}&opponent=${matchup.counter}`} key={matchup.id}>
                  <div>{hero && <img src={hero.portrait} alt="" />}<Swords aria-hidden="true" />{counter && <img src={counter.portrait} alt="" />}</div>
                  <span><strong>{hero?.name} vs {counter?.name}</strong><small>{matchup.reason}</small></span><em>{matchup.score}</em>
                </Link>;
              })}
            </div>
          </section>

          <section className="home-tool-card home-combo-card">
            <header><span><Sparkles aria-hidden="true" /></span><div><small>SYNERGY</small><h2>추천 궁극기 조합</h2></div><Link href="/combos/">조합표 <ArrowRight /></Link></header>
            <div className="home-combo-list">
              {combos.slice(0, 3).map((combo) => (
                <Link href={`/combos/#${combo.id}`} key={combo.id}>
                  <div>{combo.heroes.map((key) => { const hero = getHero(key); return hero ? <img key={key} src={hero.portrait} alt="" /> : null; })}</div>
                  <span><strong>{combo.name}</strong><small>{combo.description}</small></span><em>{combo.score}/5</em>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <section className="home-status-bar">
          <CheckCircle2 aria-hidden="true" /><div><strong>검토한 정보를 제공합니다.</strong><span>패치와 플레이 환경에 따라 실제 결과는 달라질 수 있습니다.</span></div>
          <Link href="/sources/"><Database aria-hidden="true" /> 출처 및 업데이트</Link>
        </section>
        <AdSlot kind="banner" />
      </section>
    </main>
  );
}
