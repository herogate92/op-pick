import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { MapExplorer } from "@/components/MapExplorer";
import { SiteHeader } from "@/components/SiteHeader";
import { heroes, maps } from "@/lib/data";

export const metadata: Metadata = { title: "맵별 추천 영웅", description: "전장과 게임 모드별로 추천 영웅을 빠르게 확인합니다." };

export default function MapsPage() {
  const publicMaps = maps.map(({ id, name, mode, recommendations }) => ({
    id,
    name,
    mode,
    recommendations: recommendations.map(({ hero, rank, winRate }) => ({ hero, rank, winRate })),
  }));
  return (
    <main className="page-shell maps-page">
      <SiteHeader active="maps" />
      <section className="page-intro">
        <span className="section-kicker">MAP GUIDE</span>
        <h1>맵별 <em>추천 영웅</em></h1>
        <p>게임 모드와 전장을 선택하면 해당 맵에서 성과가 좋은 영웅을 역할별로 보여드립니다.</p>
      </section>
      <div className="content-with-rail">
        <div className="page-content"><MapExplorer maps={publicMaps} heroes={heroes} /><AdSlot kind="banner" /></div>
        <AdSlot kind="rail" />
      </div>
    </main>
  );
}
