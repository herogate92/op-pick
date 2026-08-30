import Link from "next/link";
import { ArrowRight, Shield, Sparkles, Swords, UsersRound } from "lucide-react";
import { HomeBackgroundMedia } from "@/components/HomeBackgroundMedia";
import { SiteHeader } from "@/components/SiteHeader";
import { getHero } from "@/lib/data";

export default function HomePage() {
  const poster = getHero("tracer")?.background ?? getHero("ana")?.background;
  return (
    <main className="cinematic-home">
      <HomeBackgroundMedia poster={poster} />
      <div className="home-video-overlay" />
      <SiteHeader active="home" />
      <section className="cinematic-home-content">
        <h1><span>OP</span> PICK LAB</h1>
        <p>영웅을 이해하고, 상성을 확인하고, 가장 잘 맞는 아군 조합을 설계하세요.</p>
        <div className="cinematic-actions">
          <Link href="/heroes/" className="cinematic-primary"><Shield aria-hidden="true" /> 영웅 선택 <ArrowRight aria-hidden="true" /></Link>
          <Link href="/team-builder/" className="cinematic-secondary"><UsersRound aria-hidden="true" /> 팀 조합 만들기</Link>
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
