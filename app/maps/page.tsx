import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { MapExplorer } from "@/components/MapExplorer";
import { SiteHeader } from "@/components/SiteHeader";
import { heroes, maps } from "@/lib/data";

export const metadata: Metadata = {
  title: "오버워치 맵별 추천 영웅",
  description: "전장과 게임 모드별로 추천 영웅을 역할별로 빠르게 확인합니다.",
  alternates: { canonical: "/maps/" },
};

export default function MapsPage() {
  return (
    <main className="page-shell maps-page">
      <SiteHeader active="maps" />
      <section className="page-intro">
        <span className="section-kicker">MAP GUIDE</span>
        <h1>맵별 <em>추천 영웅</em></h1>
        <p>전장 구조와 영웅 기술을 연결한 추천 이유, 유효한 조건과 주의점을 확인하세요. 통계 순위가 아닌 전략 분석입니다.</p>
      </section>
      <div className="content-with-rail">
        <div className="page-content"><MapExplorer maps={maps} heroes={heroes} /><AdSlot kind="banner" /></div>
        <AdSlot kind="rail" />
      </div>
    </main>
  );
}
