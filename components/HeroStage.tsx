"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Cross, HeartPulse, Home, MapPinned, Menu, Search, Shield, Sparkles, Swords, UsersRound, X, Zap } from "lucide-react";
import { AbilityStats } from "@/components/AbilityStats";
import type { Ability, Combo, Matchup, Role } from "@/lib/data";
import { roleAccent, roleLabels, subroleLabels } from "@/lib/data";

interface HeroSummary {
  key: string; name: string; role: Role; subrole: string; portrait: string; background: string; description: string;
  abilities: Ability[]; perks: { minor: Ability[]; major: Ability[] };
  hitpoints: { shields: number; armor: number; health: number; total: number } | null;
}

const navItems = [
  { href: "/", label: "홈", icon: Home },
  { href: "/heroes/", label: "영웅", icon: Shield },
  { href: "/maps/", label: "맵별 추천", icon: MapPinned },
  { href: "/matchups/", label: "상성", icon: Swords },
  { href: "/combos/", label: "조합", icon: Sparkles },
  { href: "/team-builder/", label: "팀 구성", icon: UsersRound },
];

const heroRoleOrder: Role[] = ["tank", "damage", "support"];
const heroRosterOrder: Record<Role, string[]> = {
  tank: ["dmon", "dva", "domina", "doomfist", "ramattra", "reinhardt", "wrecking-ball", "roadhog", "mauga", "sigma", "orisa", "winston", "zarya", "junker-queen", "hazard"],
  damage: ["genji", "reaper", "mei", "bastion", "vendetta", "venture", "sojourn", "soldier-76", "sombra", "symmetra", "sierra", "shion", "anran", "ashe", "echo", "emre", "widowmaker", "junkrat", "cassidy", "torbjorn", "tracer", "pharah", "freja", "hanzo"],
  support: ["lifeweaver", "lucio", "mercy", "moira", "mizuki", "baptiste", "brigitte", "ana", "wuyang", "illari", "jetpack-cat", "zenyatta", "juno", "kiriko"],
};

export function HeroStage({ heroes, matchups, combos }: { heroes: HeroSummary[]; matchups: Matchup[]; combos: Combo[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const hero = selected === null ? null : heroes[selected];
  const weakAgainst = hero ? matchups.filter((item) => item.hero === hero.key).sort((a, b) => b.score - a.score).slice(0, 2) : [];
  const strongAgainst = hero ? matchups.filter((item) => item.counter === hero.key).sort((a, b) => b.score - a.score).slice(0, 2) : [];
  const heroCombos = hero ? combos.filter((item) => item.heroes.includes(hero.key)).sort((a, b) => b.score - a.score).slice(0, 2) : [];
  const heroByKey = (key: string) => heroes.find((item) => item.key === key);
  const roleGridColumns = heroRoleOrder.map((role) => `${Math.ceil(heroes.filter((item) => item.role === role).length / 2)}fr`).join(" ");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/" && !searchOpen) { event.preventDefault(); setSearchOpen(true); }
      if (event.key === "ArrowRight") setSelected((value) => value === null ? 0 : (value + 1) % heroes.length);
      if (event.key === "ArrowLeft") setSelected((value) => value === null ? heroes.length - 1 : (value - 1 + heroes.length) % heroes.length);
      if (event.key === "Escape") { setSearchOpen(false); setSkillsOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [heroes.length, searchOpen]);

  const selectHero = (key: string) => {
    const index = heroes.findIndex((item) => item.key === key);
    if (index >= 0) setSelected(index);
  };

  return (
    <main className={hero ? "hero-shell" : "hero-shell no-hero-selected"} style={{ "--hero-accent": hero ? roleAccent[hero.role] : "#08dcf3" } as React.CSSProperties}>
      <div className="hero-backdrop" style={hero?.background ? { backgroundImage: `url(${hero.background})` } : undefined} />
      <div className="hero-vignette" />
      <header className="topbar">
        <nav className="primary-nav" aria-label="주요 메뉴">
          {navItems.map(({ href, label, icon: Icon }, index) => (
            <Link key={href} href={href} className={index === 1 ? "nav-link active" : "nav-link"}><Icon size={17} aria-hidden="true" /><span>{label}</span></Link>
          ))}
        </nav>
        <Link href="/" className="brand" aria-label="OP PICK LAB 홈">
          <span className="brand-mark">OP</span><span><strong>OP PICK LAB</strong><small>오버워치 픽 연구소</small></span>
        </Link>
        <div className="top-actions">
          <button className="icon-button" onClick={() => setSearchOpen(true)} aria-label="영웅 검색"><Search size={20} /></button>
          <Link href="/sources/" className="update-chip">영웅 {heroes.length}명 · 안내</Link>
          <button className="menu-button" onClick={() => setSearchOpen(true)} aria-label="메뉴와 검색 열기"><Menu size={21} /></button>
        </div>
      </header>

      <section className="hero-content hero-dashboard" aria-live="polite">
        {hero ? <>
        <article className="dashboard-card hero-profile-card">
          <div className="hero-profile-top">
            <div className="compact-portrait">
              {/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt={`${hero.name} 영웅 초상`} />
            </div>
            <div className="profile-title">
              <span className="eyebrow">SELECTED HERO</span>
              <h1>{hero.name}</h1>
              <p>{roleLabels[hero.role]} · {subroleLabels[hero.subrole] ?? hero.subrole}</p>
            </div>
          </div>
          <div className="profile-stats">
            <span><HeartPulse aria-hidden="true" /> 생명력 <strong>{hero.hitpoints?.total ?? "-"}</strong></span>
            <span><Shield aria-hidden="true" /> 역할 <strong>{roleLabels[hero.role]}</strong></span>
          </div>
          <p className="profile-description">{hero.description || "영웅 소개가 아직 등록되지 않았습니다."}</p>
          <div className="hero-actions compact-actions">
            <Link href={`/heroes/${hero.key}/`} className="primary-button">전체 정보 <ChevronRight aria-hidden="true" /></Link>
            <button type="button" className="secondary-button skill-open-button" onClick={() => setSkillsOpen(true)}>스킬 보기</button>
          </div>
        </article>

        <section className="dashboard-card quick-matchups-card" aria-labelledby="quick-matchups-title">
          <header className="dashboard-heading">
            <div><span className="eyebrow">MATCHUP</span><h2 id="quick-matchups-title">상성 요약</h2></div>
            <Link href={`/matchups/?hero=${hero.key}`}>전체 비교 <ChevronRight aria-hidden="true" /></Link>
          </header>
          <div className="matchup-quick-columns">
            <QuickMatchupColumn title="주의할 상대" items={weakAgainst} opponentKey="counter" heroes={heroes} />
            <QuickMatchupColumn title="유리한 상대" items={strongAgainst} opponentKey="hero" heroes={heroes} />
          </div>
        </section>
        <section className="dashboard-card quick-synergy-card" aria-labelledby="quick-synergy-title">
          <header className="dashboard-heading">
            <div><span className="eyebrow">SYNERGY</span><h2 id="quick-synergy-title">궁합 좋은 영웅</h2></div>
            <Link href="/combos/">전체 조합 <ChevronRight aria-hidden="true" /></Link>
          </header>
          <div className="synergy-quick-list">
            {heroCombos.map((combo) => {
              const partners = combo.heroes.filter((key) => key !== hero.key).map(heroByKey).filter(Boolean) as HeroSummary[];
              return (
                <Link href={`/combos/#${combo.id}`} className="synergy-quick" key={combo.id}>
                  <div className="synergy-portraits">
                    {partners.map((partner) => <img key={partner.key} src={partner.portrait} alt="" />)}
                    {!partners.length && <Zap aria-hidden="true" />}
                  </div>
                  <span><strong>{partners.map((partner) => partner.name).join(" · ") || combo.name}</strong><small>{combo.name} · 추천 {combo.score}/5</small></span>
                  <ChevronRight aria-hidden="true" />
                </Link>
              );
            })}
            {!heroCombos.length && <div className="dashboard-empty">등록된 추천 조합이 아직 없습니다.</div>}
          </div>
          <Link href={`/matchups/?hero=${hero.key}`} className="synergy-secondary-link"><Swords aria-hidden="true" /> 이 영웅으로 상성 직접 비교하기</Link>
        </section>
        </> : <EmptySelection heroes={heroes.length} matchups={matchups.length} combos={combos.length} />}
      </section>

      <section className="selector-dock" aria-label="영웅 선택">
        <div className="dock-heading">
          <strong>영웅 선택</strong>
          <div><button type="button" className="clear-selection" onClick={() => { setSelected(null); setSkillsOpen(false); }} disabled={!hero}>선택 해제</button><small>← → 탐색 · / 검색</small></div>
        </div>
        <div className="role-groups" style={{ "--role-grid": roleGridColumns } as React.CSSProperties}>
          {heroRoleOrder.map((groupRole) => {
            const order = heroRosterOrder[groupRole];
            const groupHeroes = heroes.filter((item) => item.role === groupRole).sort((a, b) => {
              const aIndex = order.indexOf(a.key);
              const bIndex = order.indexOf(b.key);
              return (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex);
            });
            return (
              <section
                className={`role-group role-group-${groupRole}`}
                key={groupRole}
                aria-labelledby={`role-${groupRole}`}
                style={{ "--role-columns": Math.ceil(groupHeroes.length / 2) } as React.CSSProperties}
              >
                <h3 id={`role-${groupRole}`}>
                  {groupRole === "tank" && <Shield aria-hidden="true" />}
                  {groupRole === "damage" && <Swords aria-hidden="true" />}
                  {groupRole === "support" && <Cross aria-hidden="true" />}
                  <span>{roleLabels[groupRole]}</span>
                  <small>{groupHeroes.length}명</small>
                </h3>
                <div className="role-roster">
                  {groupHeroes.map((item) => {
                    const index = heroes.findIndex((candidate) => candidate.key === item.key);
                    const isSelected = selected === index;
                    return (
                      <button
                        key={item.key}
                        className={isSelected ? "hero-thumb selected" : "hero-thumb"}
                        onClick={() => { setSelected(isSelected ? null : index); setSkillsOpen(false); }}
                        aria-pressed={isSelected}
                        aria-label={isSelected ? `${item.name} 선택 해제` : `${item.name} 선택`}
                        title={item.name}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}<img src={item.portrait} alt="" />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </section>
      {skillsOpen && hero && (
        <div className="skill-overlay" role="dialog" aria-modal="true" aria-labelledby="skill-sheet-title">
          <button className="overlay-close" onClick={() => setSkillsOpen(false)} aria-label="스킬 정보 닫기"><X /></button>
          <section className="skill-sheet">
            <header className="skill-sheet-header">
              <div className="skill-hero-id">
                {/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt="" />
                <div><span className="eyebrow">HERO ABILITIES</span><h2 id="skill-sheet-title">{hero.name} 스킬 정보</h2><p>{roleLabels[hero.role]} · {subroleLabels[hero.subrole] ?? hero.subrole}</p></div>
              </div>
              <Link href={`/heroes/${hero.key}/`}>상세 페이지 <ChevronRight aria-hidden="true" /></Link>
            </header>
            <div className="skill-sheet-grid">
              <section className="skill-sheet-column">
                <h3><Zap aria-hidden="true" /> 기술</h3>
                <div className="skill-sheet-list">
                  {hero.abilities.map((ability) => (
                    <article key={ability.name}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}<img src={ability.icon} alt="" />
                      <div><strong>{ability.name}</strong><p>{ability.description}</p><AbilityStats ability={ability} compact /></div>
                    </article>
                  ))}
                  {!hero.abilities.length && <div className="dashboard-empty">기술 정보가 준비 중입니다.</div>}
                </div>
              </section>
              <section className="skill-sheet-column perk-sheet-column">
                <h3><Sparkles aria-hidden="true" /> 특전</h3>
                <div className="perk-sheet-groups">
                  <div><h4>보조 특전</h4>{hero.perks.minor.map((perk) => <SkillPerk key={perk.name} perk={perk} />)}</div>
                  <div><h4>주요 특전</h4>{hero.perks.major.map((perk) => <SkillPerk key={perk.name} perk={perk} />)}</div>
                  {!hero.perks.minor.length && !hero.perks.major.length && <div className="dashboard-empty">특전 정보가 준비 중입니다.</div>}
                </div>
              </section>
            </div>
          </section>
        </div>
      )}

      {searchOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="영웅 검색">
          <button className="overlay-close" onClick={() => setSearchOpen(false)} aria-label="검색 닫기"><X /></button>
          <div className="search-card">
            <span className="eyebrow">QUICK SEARCH</span>
            <label htmlFor="hero-search">어떤 영웅을 찾고 있나요?</label>
            <div className="search-input-wrap"><Search size={20} /><input id="hero-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="영웅 이름 입력" /></div>
            <div className="search-results all-results">
              {heroes.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())).map((item) => (
                <button key={item.key} onClick={() => { selectHero(item.key); setSearchOpen(false); setQuery(""); }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}<img src={item.portrait} alt="" />
                  <span><strong>{item.name}</strong><small>{roleLabels[item.role]} · {subroleLabels[item.subrole] ?? item.subrole}</small></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function EmptySelection({ heroes, matchups, combos }: { heroes: number; matchups: number; combos: number }) {
  return <>
    <article className="dashboard-card empty-pick-card">
      <div className="empty-pick-icon"><Shield aria-hidden="true" /></div>
      <span className="eyebrow">READY TO PICK</span>
      <h1>영웅을 선택하세요</h1>
      <p>아래 초상을 누르면 스킬, 상성, 추천 조합이 이 자리에 바로 표시됩니다. 선택한 영웅을 다시 누르면 이 안내 화면으로 돌아옵니다.</p>
      <div className="empty-role-guide">
        <span><Shield aria-hidden="true" /><strong>돌격</strong><small>전선과 공간 확보</small></span>
        <span><Swords aria-hidden="true" /><strong>공격</strong><small>화력과 처치 기회</small></span>
        <span><Cross aria-hidden="true" /><strong>지원</strong><small>회복과 전투 보조</small></span>
      </div>
    </article>
    <article className="dashboard-card empty-feature-card">
      <span className="eyebrow">AFTER SELECT</span>
      <h2>선택 후 표시할 정보</h2>
      <ul>
        <li><HeartPulse aria-hidden="true" /><span><strong>영웅 핵심 정보</strong><small>역할, 생명력, 공식 설명</small></span></li>
        <li><Swords aria-hidden="true" /><span><strong>상성 요약</strong><small>주의할 상대와 유리한 상대</small></span></li>
        <li><Sparkles aria-hidden="true" /><span><strong>추천 궁합</strong><small>대표 궁극기 및 팀 조합</small></span></li>
        <li><Zap aria-hidden="true" /><span><strong>스킬 보기</strong><small>버튼으로 기술과 특전 열기</small></span></li>
      </ul>
    </article>
    <article className="dashboard-card empty-data-card">
      <span className="eyebrow">GUIDE OVERVIEW</span>
      <h2>도감 수록 현황</h2>
      <div><span><strong>{heroes}</strong>영웅</span><span><strong>{matchups}</strong>상성</span><span><strong>{combos}</strong>조합</span></div>
      <p>영웅 정보와 상성, 추천 조합 자료를 한곳에서 확인할 수 있습니다.</p>
      <Link href="/overview/">전체 가이드 보기 <ChevronRight aria-hidden="true" /></Link>
    </article>
  </>;
}

function SkillPerk({ perk }: { perk: Ability }) {
  return (
    <article className="skill-perk">
      {/* eslint-disable-next-line @next/next/no-img-element */}<img src={perk.icon} alt="" />
      <div><strong>{perk.name}</strong><p>{perk.description}</p></div>
    </article>
  );
}

function QuickMatchupColumn({ title, items, opponentKey, heroes }: { title: string; items: Matchup[]; opponentKey: "hero" | "counter"; heroes: HeroSummary[] }) {
  return (
    <div className="matchup-quick-group">
      <h3>{title}</h3>
      {items.map((matchup) => {
        const opponent = heroes.find((item) => item.key === matchup[opponentKey]);
        return (
          <Link href={`/matchups/?hero=${matchup.hero}&opponent=${matchup.counter}`} className="matchup-quick" key={matchup.id} title={matchup.reason}>
            {opponent && <img src={opponent.portrait} alt="" />}
            <span><strong>{opponent?.name ?? matchup[opponentKey]}</strong><small>{matchup.reason}</small></span>
            <em>{matchup.score}</em>
          </Link>
        );
      })}
      {!items.length && <div className="dashboard-empty compact-empty">등록된 정보가 없습니다.</div>}
    </div>
  );
}
