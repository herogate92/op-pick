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
        <p>역할별 추천 우선순위와 참고 승률을 한 페이지에서 확인하세요.</p>
      </section>
      <div className="content-with-rail">
        <div className="page-content">
          <section className="seo-guide-summary">
            <span><MapPinned aria-hidden="true" /><strong>{map.mode}</strong> 전장</span>
            <span><CalendarDays aria-hidden="true" />마지막 검수 {map.reviewedAt}</span>
            <Link href="/maps/"><ArrowLeft aria-hidden="true" />전체 맵 선택</Link>
          </section>
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
                          <em>TOP {item.rank}</em>
                        </Link>
                        <p>{item.note}</p><small>참고 승률 {item.winRate.toFixed(1)}%</small>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
          <p className="seo-guide-note">추천 결과는 패치, 플랫폼, 지역, 등급과 팀 조합에 따라 달라질 수 있습니다.</p>
          <AdSlot kind="banner" />
        </div>
        <AdSlot kind="rail" />
      </div>
    </main>
  );
}
