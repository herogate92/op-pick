import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftRight, CalendarDays, CheckCircle2, ShieldAlert } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { ScoreMeter } from "@/components/ScoreMeter";
import { SiteHeader } from "@/components/SiteHeader";
import { detailedMatchups, getDetailedMatchup, getHero, roleLabels } from "@/lib/data";

export function generateStaticParams() {
  return detailedMatchups.map((matchup) => ({ pair: `${matchup.hero}-vs-${matchup.counter}` }));
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }): Promise<Metadata> {
  const { pair } = await params;
  const matchup = getDetailedMatchup(pair);
  if (!matchup) return {};
  const hero = getHero(matchup.hero)!;
  const counter = getHero(matchup.counter)!;
  const title = `${hero.name} 카운터: ${counter.name} 상성 분석`;
  const description = `${counter.name}이(가) ${hero.name}을(를) 상대하기 유리한 이유와 실제 운영 조건을 확인하세요.`;
  return {
    title, description, alternates: { canonical: `/matchups/${pair}/` },
    openGraph: { title, description, url: `/matchups/${pair}/`, images: counter.portrait ? [{ url: counter.portrait }] : [] },
  };
}

export default async function MatchupDetailPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const matchup = getDetailedMatchup(pair);
  if (!matchup) notFound();
  const hero = getHero(matchup.hero);
  const counter = getHero(matchup.counter);
  if (!hero || !counter) notFound();
  const pageUrl = `https://opick.ggwp.kr/matchups/${pair}/`;
  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "WebPage",
      name: `${hero.name} 카운터: ${counter.name} 상성 분석`, description: matchup.reason,
      url: pageUrl, inLanguage: "ko-KR", dateModified: matchup.reviewedAt,
      isPartOf: { "@type": "WebSite", name: "OP PICK LAB", url: "https://opick.ggwp.kr/" },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: "https://opick.ggwp.kr/" },
        { "@type": "ListItem", position: 2, name: "상성 비교", item: "https://opick.ggwp.kr/matchups/" },
        { "@type": "ListItem", position: 3, name: `${hero.name} vs ${counter.name}`, item: pageUrl },
      ],
    },
  ];

  return (
    <main className="page-shell comparison-page seo-detail-page">
      <JsonLd data={jsonLd} />
      <SiteHeader active="matchups" />
      <section className="page-intro seo-detail-intro">
        <span className="section-kicker">COUNTER GUIDE</span>
        <h1>{hero.name} <em>vs {counter.name}</em></h1>
        <p>{counter.name}이(가) {hero.name}을(를) 상대할 때 유리한 이유와 대응법입니다.</p>
      </section>
      <div className="content-with-rail">
        <div className="page-content">
          <section className="matchup-guide-card">
            <div className="matchup-guide-heroes">
              <Link href={`/heroes/${hero.key}/`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt={`${hero.name} 영웅 초상`} />
                <span><small>상대하기 불리</small><strong>{hero.name}</strong><em>{roleLabels[hero.role]}</em></span>
              </Link>
              <span className="matchup-guide-vs"><ArrowLeftRight aria-hidden="true" />VS</span>
              <Link href={`/heroes/${counter.key}/`} className="favored">
                {/* eslint-disable-next-line @next/next/no-img-element */}<img src={counter.portrait} alt={`${counter.name} 영웅 초상`} />
                <span><small>추천 카운터</small><strong>{counter.name}</strong><em>{roleLabels[counter.role]}</em></span>
              </Link>
            </div>
            <div className="matchup-guide-verdict">
              <ShieldAlert aria-hidden="true" />
              <div><div className="matchup-quality-row"><span className="section-kicker">MATCHUP VERDICT</span><span className={`matchup-quality-badge verified ${matchup.confidence}`}>{matchup.confidence === "high" ? "교차 검증 · 높은 신뢰도" : "개별 검토 · 중간 신뢰도"}</span></div><h2>{counter.name}이(가) 유리합니다</h2><ScoreMeter value={matchup.score} label="상성 강도" /><p>{matchup.reason}</p></div>
            </div>
            <div className="condition-box"><CheckCircle2 aria-hidden="true" /><span><strong>{hero.name} 대응 포인트</strong>{matchup.counterplay}</span></div>
            <footer><span><CalendarDays aria-hidden="true" />{matchup.patchBasis} · 마지막 검수 {matchup.reviewedAt}</span><Link href={`/matchups/?hero=${hero.key}&opponent=${counter.key}`}>비교 도구에서 보기</Link></footer>
          </section>
          <p className="seo-guide-note">상성은 맵, 사거리, 팀 조합과 숙련도에 따라 달라질 수 있습니다.</p>
          <AdSlot kind="banner" />
        </div>
        <AdSlot kind="rail" />
      </div>
    </main>
  );
}
