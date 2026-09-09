import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPinned } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { getHero, maps, roleLabels, type Role } from "@/lib/data";

export function generateStaticParams() {
  return maps.map((map) => ({ map: map.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ map: string }> }): Promise<Metadata> {
  const { map: mapId } = await params;
  const map = maps.find((item) => item.id === mapId);
  if (!map) return {};
  const description = `${map.name} ${map.mode} 전장에서 추천하는 오버워치 영웅과 역할별 우선순위를 확인하세요.`;
  return {
    title: `${map.name} 추천 영웅`,
    description,
    alternates: { canonical: `/maps/${map.id}/` },
    openGraph: { title: `${map.name} 추천 영웅`, description, url: `/maps/${map.id}/` },
  };
}

export default async function MapDetailPage({ params }: { params: Promise<{ map: string }> }) {
  const { map: mapId } = await params;
  const map = maps.find((item) => item.id === mapId);
  if (!map) notFound();
  const pageUrl = `https://opick.ggwp.kr/maps/${map.id}/`;
  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "WebPage", name: `${map.name} 추천 영웅`,
      description: `${map.name} ${map.mode} 전장의 역할별 추천 영웅 가이드`, url: pageUrl,
      inLanguage: "ko-KR", dateModified: map.reviewedAt,
      isPartOf: { "@type": "WebSite", name: "OP PICK LAB", url: "https://opick.ggwp.kr/" },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "홈", item: "https://opick.ggwp.kr/" },
        { "@type": "ListItem", position: 2, name: "맵별 추천", item: "https://opick.ggwp.kr/maps/" },
        { "@type": "ListItem", position: 3, name: map.name, item: pageUrl },
      ],
    },
  ];

  return (
    <main className="page-shell maps-page seo-detail-page">
      <JsonLd data={jsonLd} />
      <SiteHeader active="maps" />
      <section className="page-intro seo-detail-intro">
        <span className="section-kicker">MAP GUIDE · {map.mode}</span>
        <h1>{map.name} <em>추천 영웅</em></h1>
        <p>{map.analysisBasis}</p>
      </section>
      <div className="content-with-rail">
        <div className="page-content">
          <section className="seo-guide-summary">
            <span><MapPinned aria-hidden="true" /><strong>{map.mode}</strong> 전장</span>
            <span><CalendarDays aria-hidden="true" />마지막 검수 {map.reviewedAt}</span>
            <Link href="/maps/"><ArrowLeft aria-hidden="true" />전체 맵 선택</Link>
          </section>
          <p className="seo-guide-note">전장 특징: {map.terrain}<br />{map.layoutCaveat}</p>
          {(["tank", "damage", "support"] as Role[]).map((role) => {
            const recommendations = map.recommendations.filter((item) => getHero(item.hero)?.role === role);
            if (!recommendations.length) return null;
            return (
              <section className="content-section seo-guide-section" key={role}>
                <div className="section-heading"><span className="section-kicker">{role.toUpperCase()}</span><h2>{roleLabels[role]} 추천</h2></div>
                <div className="seo-guide-grid">
                  {recommendations.map((item) => {
                    const hero = getHero(item.hero)!;
                    return (
                      <article className="seo-guide-card" key={item.hero}>
                        <Link href={`/heroes/${hero.key}/`} className="seo-guide-hero">
                          {/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt={`${hero.name} 영웅 초상`} />
                          <span><strong>{hero.name}</strong><small>{roleLabels[hero.role]}</small></span>
                        </Link>
                        <p>{item.note}</p>
                        <p><strong>유효한 조건</strong> · {item.condition}</p>
                        <p><strong>주의할 점</strong> · {item.caution}</p>
                        <small><a href={item.sourceUrls[0]} target="_blank" rel="noreferrer">기술 설명 근거</a></small>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
          <p className="seo-guide-note">추천은 조건부 전략 분석이며 패치·팀 조합에 따라 달라집니다. 기존 맵 승률은 수집 조건과 원출처가 확인되지 않아 표시를 보류했습니다. 최신 전체 맵 통계는 <Link href="/rates/">승률·픽률</Link>에서 확인하세요. {map.sourceUrls.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer"> 전장 자료 {index + 1}</a>)}</p>
          <AdSlot kind="banner" />
        </div>
        <AdSlot kind="rail" />
      </div>
    </main>
  );
}
