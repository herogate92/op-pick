import type { Metadata } from "next";
import { Code2, Copyright, Database, ExternalLink, Scale } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { PatchNotesLink } from "@/components/PatchNotesLink";

export const metadata: Metadata = {
  title: "운영 및 라이선스",
  description: "OP PICK LAB의 데이터 운영 원칙, Blizzard 저작권·상표 표기와 오픈소스 라이선스 안내입니다.",
  alternates: { canonical: "/sources/" },
};

const openSource = [
  { name: "Next.js", version: "16.3.3", license: "MIT", owner: "Vercel, Inc.", url: "https://github.com/vercel/next.js" },
  { name: "React · React DOM", version: "19.2.8", license: "MIT", owner: "Meta Platforms, Inc. and affiliates", url: "https://github.com/facebook/react" },
  { name: "Lucide React", version: "1.37.0", license: "ISC · 일부 아이콘 MIT", owner: "Lucide Icons and Contributors", url: "https://github.com/lucide-icons/lucide" },
] as const;

export default function SourcesPage() {
  return (
    <main className="page-shell sources-page">
      <SiteHeader active="sources" />
      <div className="source-dashboard source-dashboard-compact">
        <section className="policy-note policy-note-primary">
          <Database aria-hidden="true" />
          <div>
            <span className="section-kicker">DATA POLICY</span>
            <h1>운영 원칙</h1>
            <PatchNotesLink className="secondary-button" />
            <ul>
              <li>데이터는 외부 API 및 공개 정보를 기반으로 합니다. 따라서 공식 데이터와 다를 수 있습니다.</li>
              <li>변경 사항은 내용을 확인한 뒤 사이트에 반영합니다. <a href="/patch-review.html">패치 재검토 현황</a>에서 관련 콘텐츠의 검토 대기 상태를 확인할 수 있습니다.</li>
              <li>직접 비교 자료가 없는 상성은 정보가 없음을 명확히 표시합니다.</li>
              <li>패치, 플랫폼, 지역, 등급과 맵에 따라 상성 및 추천 결과가 달라질 수 있습니다.</li>
              <li>기술 사례가 있는 중간 신뢰도 상성은 공개 기술 설명을 연결한 조건부 분석입니다. 게임 내 재현 검증이나 승률 측정 결과를 의미하지 않습니다.</li>
              <li>맵 추천은 전장 구조와 기술을 연결한 전략 분석입니다. 수집 조건·원출처가 없는 기존 맵 승률은 표시하지 않습니다.</li>
              <li>스킬 수치는 공식 라이브 패치에 명시된 항목만 출처·적용 모드와 함께 보강합니다. 5v5, 6v6, 스타디움과 특전 수치를 혼합하지 않습니다.</li>
              <li>통계 수집일은 제공 API를 조회한 날짜이며, 제공자의 집계 종료일이나 최신 패치 이후의 경기만을 뜻하지 않습니다.</li>
            </ul>
          </div>
        </section>

        <section className="license-section copyright-section" id="copyright">
          <header><Copyright aria-hidden="true" /><div><span className="section-kicker">COPYRIGHT</span><h2>저작권·상표</h2><p>OP PICK LAB은 Blizzard Entertainment와 제휴하거나 보증을 받지 않은 비공식 팬 사이트입니다.</p></div></header>
          <ul>
            <li>Overwatch와 Blizzard Entertainment는 미국 및 기타 국가에서 Blizzard Entertainment, Inc.의 상표 또는 등록 상표입니다.</li>
            <li>영웅 초상·배경·스토리 이미지, 기술·특전 아이콘, 기술 시연 영상, 전장 이미지와 공식 유튜브 영상 등 게임 콘텐츠의 저작권은 Blizzard Entertainment, Inc.에 있습니다. 이미지와 영상은 대부분 Blizzard 공식 페이지·서버의 자료를 그대로 불러와 표시합니다.</li>
            <li>영웅·기술 설명과 승률·픽률·밴률은 Blizzard 공식 영웅 페이지·패치 노트와 공개 통계를 바탕으로 하며, 일부는 OverFast API를 거쳐 수집합니다. 상성·조합·맵 추천 분석과 패치 요약은 OP PICK LAB이 작성했습니다.</li>
            <li>권리자의 요청이 있으면 해당 자료를 교체하거나 삭제합니다.</li>
          </ul>
          <p lang="en">Overwatch is a trademark or registered trademark of Blizzard Entertainment, Inc. in the U.S. and/or other countries. Game content and materials © Blizzard Entertainment, Inc. All rights reserved. OP PICK LAB is not affiliated with or endorsed by Blizzard Entertainment.</p>
        </section>

        <section className="license-section">
          <header><Code2 aria-hidden="true" /><div><span className="section-kicker">OPEN SOURCE</span><h2>오픈소스 라이선스</h2><p>사이트 구현에 사용한 주요 오픈소스 소프트웨어입니다.</p></div></header>
          <div className="license-grid">
            {openSource.map((item) => (
              <article key={item.name}>
                <Scale aria-hidden="true" />
                <div><h3>{item.name}</h3><p>{item.owner}</p><small>v{item.version} · {item.license}</small></div>
                <a href={item.url} target="_blank" rel="noreferrer" aria-label={`${item.name} 프로젝트 열기`}><ExternalLink aria-hidden="true" /></a>
              </article>
            ))}
          </div>
          <a className="license-notice-link" href="/THIRD_PARTY_NOTICES.txt" target="_blank">전체 저작권 및 라이선스 원문 보기 <ExternalLink aria-hidden="true" /></a>
        </section>
      </div>
    </main>
  );
}
