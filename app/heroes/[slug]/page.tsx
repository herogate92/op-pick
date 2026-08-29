import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, ArrowRight, BookOpen, CalendarDays, Crosshair, ExternalLink, Film, HeartPulse, MapPin, PlayCircle, ShieldCheck, Sparkles, Swords } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { AbilityStats } from "@/components/AbilityStats";
import { HeroMiniCard } from "@/components/HeroMiniCard";
import { HeroBackgroundMedia } from "@/components/HeroBackgroundMedia";
import { ScoreMeter } from "@/components/ScoreMeter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCombosFor, getCountersFor, getHero, getStrongAgainst, heroes, roleAccent, roleLabels, subroleLabels } from "@/lib/data";
import { getHeroVideo } from "@/lib/hero-videos";

export function generateStaticParams() { return heroes.map((hero) => ({ slug: hero.key })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const hero = getHero(slug);
  if (!hero) return {};
  const description = `${hero.name}의 기술, 특전, 카운터 픽과 추천 조합을 확인하세요.`;
  return {
    title: `${hero.name} 정보와 상성`,
    description,
    openGraph: { title: `${hero.name} 정보와 상성`, description, images: hero.portrait ? [{ url: hero.portrait }] : [] },
    twitter: { card: "summary", title: `${hero.name} 정보와 상성`, description, images: hero.portrait ? [hero.portrait] : [] },
  };
}

export default async function HeroDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hero = getHero(slug);
  if (!hero) notFound();
  const counters = getCountersFor(hero.key);
  const strongAgainst = getStrongAgainst(hero.key);
  const heroCombos = getCombosFor(hero.key);
  const heroVideo = getHeroVideo(hero.key);
  const related = heroes.filter((item) => item.role === hero.role && item.key !== hero.key).slice(0, 6);

  return (
    <main className="page-shell hero-detail-page" style={{ "--hero-accent": roleAccent[hero.role] } as React.CSSProperties}>
      <SiteHeader active="heroes" />
      <section className="detail-hero">
        <HeroBackgroundMedia videoId={heroVideo?.id} poster={hero.background} heroName={hero.name} />
        <div className="detail-overlay" />
        <div className="detail-hero-inner">
          <div className="detail-title">
            <span className="eyebrow">HERO DATABASE / {roleLabels[hero.role]}</span>
            <h1>{hero.name}</h1>
            <div className="detail-tags"><span>{roleLabels[hero.role]}</span><span>{subroleLabels[hero.subrole] ?? hero.subrole}</span></div>
            <p>{hero.description || "영웅 소개가 아직 등록되지 않았습니다."}</p>
            <div className="detail-links">
              <a href={hero.sourceUrl} target="_blank" rel="noreferrer" className="text-link">공식 영웅 페이지 <ExternalLink size={14} /></a>
              {heroVideo && <a href={`https://www.youtube.com/watch?v=${heroVideo.id}`} target="_blank" rel="noreferrer" className="text-link hero-video-link" title={heroVideo.title}><PlayCircle size={15} /> 공식 영상 보기</a>}
            </div>
          </div>
          <div className="detail-portrait-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt={`${hero.name} 영웅 초상`} />
          </div>
          <dl className="hero-facts">
            <div><MapPin /><dt>활동 지역</dt><dd>{hero.location || "정보 없음"}</dd></div>
            <div><CalendarDays /><dt>생일 / 나이</dt><dd>{hero.birthday || "-"}{hero.age ? ` · ${hero.age}세` : ""}</dd></div>
            <div><HeartPulse /><dt>기본 생명력</dt><dd>{hero.hitpoints?.total ? `${hero.hitpoints.total}` : "정보 없음"}</dd></div>
            <div><ShieldCheck /><dt>마지막 확인</dt><dd>{hero.checkedAt}</dd></div>
          </dl>
        </div>
      </section>

      <div className="content-with-rail">
        <div className="page-content">
          <section className="content-section">
            <div className="section-heading"><span className="section-kicker">01 · ABILITIES</span><h2>기술</h2><p>공식 페이지에서 확인한 현재 영웅 기술입니다.</p></div>
            {hero.abilities.length ? <div className="ability-grid">{hero.abilities.map((ability) => <article key={ability.name} className={`ability-card${ability.video ? " has-media" : ""}`}>{/* eslint-disable-next-line @next/next/no-img-element */}<img className="ability-icon" src={ability.icon} alt="" /><div><h3>{ability.name}</h3><p>{ability.description}</p><AbilityStats ability={ability} /></div>{ability.video && <video className="ability-demo" controls muted playsInline preload="metadata" poster={ability.video.thumbnail} aria-label={`${hero.name} ${ability.name} 기술 시연`}><source src={ability.video.webm} type="video/webm" /><source src={ability.video.mp4} type="video/mp4" /></video>}</article>)}</div> : <ReviewPending />}
          </section>

          <section className="content-section tinted-section">
            <div className="section-heading"><span className="section-kicker">02 · PERKS</span><h2>특전</h2><p>게임 중 선택 가능한 보조·주요 특전입니다.</p></div>
            {hero.perks.minor.length || hero.perks.major.length ? <div className="perk-columns"><PerkGroup title="보조 특전 · 2레벨" items={hero.perks.minor} /><PerkGroup title="주요 특전 · 3레벨" items={hero.perks.major} /></div> : <ReviewPending />}
          </section>

          <AdSlot kind="mobile" />

          <section className="content-section">
            <div className="section-heading"><span className="section-kicker">03 · MATCHUPS</span><h2>상성 리포트</h2><p>맵, 사거리와 팀 조합에 따라 결과가 달라질 수 있습니다.</p></div>
            <div className="matchup-columns">
              <MatchupGroup title="상대하기 까다로운 영웅" icon={<Swords />} items={counters.map((matchup) => ({ matchup, hero: getHero(matchup.counter)! }))} />
              <MatchupGroup title="상대하기 유리한 영웅" icon={<Crosshair />} items={strongAgainst.map((matchup) => ({ matchup, hero: getHero(matchup.hero)! }))} />
            </div>
            <Link href={`/matchups/?hero=${hero.key}`} className="wide-action">상성 비교 도구 열기 <ArrowRight size={17} /></Link>
          </section>

          <section className="content-section tinted-section">
            <div className="section-heading"><span className="section-kicker">04 · SYNERGY</span><h2>추천 조합</h2></div>
            {heroCombos.length ? <div className="combo-strip">{heroCombos.map((combo) => <Link href={`/combos/#${combo.id}`} key={combo.id} className="combo-inline"><Sparkles /><span><strong>{combo.name}</strong><small>{combo.description}</small></span><ScoreMeter value={combo.score} /></Link>)}</div> : <ReviewPending text="등록된 대표 조합이 아직 없습니다." />}
          </section>

          {(hero.storySummary || hero.storyMedia || hero.storyChapters.length > 0) && <section className="content-section story-section">
            <div className="section-heading"><span className="section-kicker">05 · STORY</span><h2>영웅 이야기</h2><p>공식 영웅 페이지의 배경 요약과 스토리 구성을 정리했습니다.</p></div>
            {hero.storySummary && <blockquote>{hero.storySummary}</blockquote>}
            <div className="story-actions">
              {hero.storyMedia && <a href={hero.storyMedia.link} target="_blank" rel="noreferrer"><Film /> 공식 스토리 영상 보기 <ExternalLink /></a>}
              <a href={hero.sourceUrl} target="_blank" rel="noreferrer"><BookOpen /> 공식 페이지에서 전체 이야기 읽기 <ExternalLink /></a>
            </div>
            {hero.storyChapters.length > 0 && <div className="story-chapter-grid">{hero.storyChapters.map((chapter) => <a href={hero.sourceUrl} target="_blank" rel="noreferrer" key={chapter.title} className="story-chapter-card">{chapter.picture && <span>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={chapter.picture} alt="" loading="lazy" /></span>}<strong>{chapter.title}</strong><small>공식 페이지에서 챕터 전문 보기 <ArrowRight /></small></a>)}</div>}
            <p>저작권을 고려해 긴 원문은 복제하지 않고, 챕터 제목과 공식 링크만 제공합니다.</p>
          </section>}
          <AdSlot kind="banner" />
          <section className="content-section compact-section"><div className="section-heading"><h2>같은 역할의 영웅</h2></div><div className="mini-card-grid">{related.map((item) => <HeroMiniCard key={item.key} hero={item} />)}</div></section>
        </div>
        <AdSlot kind="rail" />
      </div>
    </main>
  );
}

function ReviewPending({ text = "등록된 정보가 아직 없습니다." }: { text?: string }) {
  return <div className="review-pending"><Activity /><span><strong>정보 준비 중</strong><small>{text}</small></span></div>;
}

function PerkGroup({ title, items }: { title: string; items: { name: string; description: string; icon: string }[] }) {
  return <div className="perk-group"><h3>{title}</h3>{items.map((item) => <article key={item.name} className="perk-card">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={item.icon} alt="" /><div><strong>{item.name}</strong><p>{item.description}</p></div></article>)}</div>;
}

function MatchupGroup({ title, icon, items }: { title: string; icon: React.ReactNode; items: { matchup: ReturnType<typeof getCountersFor>[number]; hero: NonNullable<ReturnType<typeof getHero>> }[] }) {
  return <div className="matchup-group"><h3>{icon}{title}</h3>{items.length ? items.slice(0, 5).map(({ matchup, hero }) => <article key={matchup.id} className="matchup-row"><HeroMiniCard hero={hero} suffix={<ScoreMeter value={matchup.score} />} /><p>{matchup.reason}</p><small>{matchup.condition}</small></article>) : <ReviewPending text="등록된 상성 정보가 아직 없습니다." />}</div>;
}
