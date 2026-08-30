import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Sparkles, Swords, UsersRound } from "lucide-react";
import { HomeBackgroundMedia } from "@/components/HomeBackgroundMedia";
import { SiteHeader } from "@/components/SiteHeader";
import { JsonLd } from "@/components/JsonLd";
import { getHero } from "@/lib/data";

export const metadata: Metadata = {
  title: "오버워치 영웅 상성·카운터 픽·맵별 추천",
  description: "오버워치 영웅 정보와 카운터 픽, 맵별 추천, 궁극기 조합과 팀 구성을 한곳에서 확인하세요.",
  alternates: { canonical: "/" },
};

function CtaElectricity() {
  return <span className="cta-electricity" aria-hidden="true" />;
}

export default function HomePage() {
  const poster = getHero("tracer")?.background ?? getHero("ana")?.background;
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OP PICK LAB",
    alternateName: "오버워치 픽 연구소",
    url: "https://opick.ggwp.kr/",
    inLanguage: "ko-KR",
    description: "오버워치 영웅 상성, 카운터 픽, 맵별 추천과 팀 조합을 제공하는 팬 가이드",
  };
  return (
    <main className="cinematic-home">
      <JsonLd data={websiteJsonLd} />
      <HomeBackgroundMedia poster={poster} />
      <div className="home-video-overlay" />
      <SiteHeader active="home" />
      <section className="cinematic-home-content">
        <h1><span>OP</span> PICK LAB</h1>
        <p>영웅을 이해하고, 상성을 확인하고, 가장 잘 맞는 아군 조합을 설계하세요.</p>
        <div className="cinematic-actions">
          <Link href="/heroes/" className="cinematic-primary">
            <CtaElectricity />
            <span className="cta-content"><Shield aria-hidden="true" /> 영웅 선택 <ArrowRight aria-hidden="true" /></span>
          </Link>
          <Link href="/team-builder/" className="cinematic-secondary">
            <CtaElectricity />
            <span className="cta-content"><UsersRound aria-hidden="true" /> 팀 조합 만들기</span>
          </Link>
        </div>
      </section>
      <nav className="home-quick-nav" aria-label="빠른 메뉴">
        <Link href="/heroes/"><Shield /><span><strong>영웅 도감</strong><small>스킬과 역할 확인</small></span><ArrowRight /></Link>
        <Link href="/matchups/"><Swords /><span><strong>상성 비교</strong><small>두 영웅 유불리 확인</small></span><ArrowRight /></Link>
        <Link href="/combos/"><Sparkles /><span><strong>궁 조합</strong><small>대표 궁극기 연계</small></span><ArrowRight /></Link>
        <Link href="/team-builder/"><UsersRound /><span><strong>팀 구성</strong><small>5대5·6대6 가상 조합</small></span><ArrowRight /></Link>
      </nav>
    </main>
  );
}
