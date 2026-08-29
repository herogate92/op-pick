import type { Metadata } from "next";
import { Code2, Database, ExternalLink, Scale } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "운영 및 라이선스", description: "OP PICK LAB의 데이터 운영 원칙과 오픈소스 라이선스 안내입니다." };

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
            <ul>
              <li>데이터는 외부 API 및 공개 정보를 기반으로 합니다. 따라서 공식 데이터와 다를 수 있습니다.</li>
              <li>변경 사항은 내용을 확인한 뒤 사이트에 반영합니다.</li>
              <li>직접 비교 자료가 없는 상성은 정보가 없음을 명확히 표시합니다.</li>
              <li>패치, 플랫폼, 지역, 등급과 맵에 따라 상성 및 추천 결과가 달라질 수 있습니다.</li>
            </ul>
          </div>
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
