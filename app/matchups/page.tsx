import type { Metadata } from "next";
import { Suspense } from "react";
import { AdSlot } from "@/components/AdSlot";
import { MatchupExplorer } from "@/components/MatchupExplorer";
import { SiteHeader } from "@/components/SiteHeader";
import { heroes, matchups } from "@/lib/data";

export const metadata: Metadata = {
  title: "오버워치 영웅 상성·카운터 픽 비교",
  description: "두 영웅의 카운터 관계, 상성 강도와 실제 운영 조건을 비교합니다.",
  alternates: { canonical: "/matchups/" },
};

export default function MatchupsPage() {
  return <main className="page-shell comparison-page"><SiteHeader active="matchups" /><section className="page-intro"><span className="section-kicker">COUNTER LAB</span><h1>영웅 <em>상성 비교</em></h1><p>내 영웅과 상대 영웅을 고르면 카운터 관계와 실제 운영 조건을 바로 보여드립니다.</p></section><div className="content-with-rail"><div className="page-content"><Suspense fallback={<div className="review-pending">상성 도구를 불러오는 중입니다.</div>}><MatchupExplorer heroes={heroes} matchups={matchups} /></Suspense><AdSlot kind="banner" /></div><AdSlot kind="rail" /></div></main>;
}
