import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { SiteHeader } from "@/components/SiteHeader";
import { decisionLabels, patchDateLabel, patchSummaries } from "@/lib/patches";

export const metadata: Metadata = {
  title: "오버워치 패치 변경 정리",
  description: "오버워치 라이브 패치별 영웅 변경 내용과 상성·조합·맵 추천 재검토 결과, 변경 영웅의 현재 통계를 정리합니다.",
  alternates: { canonical: "/patches/" },
};

export default function PatchesPage() {
  const first = patchSummaries.at(-1);
  return (
    <main className="page-shell patch-page">
      <SiteHeader active="patches" />
      <section className="page-intro">
        <span className="section-kicker">PATCH NOTES</span>
        <h1>패치 <em>변경 정리</em></h1>
        <p>공식 라이브 패치에서 바뀐 영웅과, 그에 맞춰 다시 확인한 상성·조합·맵 추천을 패치별로 모았습니다.</p>
      </section>
      <div className="content-with-rail">
        <div className="page-content">
          <div className="patch-list">{patchSummaries.map((patch) => {
            const label = patchDateLabel(patch.date);
            return (
              <Link key={patch.date} href={`/patches/${patch.date}/`} className="patch-list-card">
                <time dateTime={patch.date}>{label.long}</time>
                <strong>{patch.changes.length ? `${patch.changes.map((change) => change.hero.name).join(" · ")} 변경` : "영웅 변경 없음"}</strong>
                {patch.scope && <p>{patch.scope}</p>}
                <small>{(["updated", "no-change", "deferred"] as const).map((decision) => `${decisionLabels[decision]} ${patch.counts[decision]}`).join(" · ")}</small>
                <span>{label.short} 패치 정리 보기 <ArrowRight aria-hidden="true" /></span>
              </Link>
            );
          })}</div>
          {first && <p className="seo-guide-note">{patchDateLabel(first.date).long} 패치부터 제공합니다. 전체 원문은 공식 패치 노트에서 확인하세요.</p>}
          <AdSlot kind="banner" />
        </div>
        <AdSlot kind="rail" />
      </div>
    </main>
  );
}
