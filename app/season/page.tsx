import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { season } from "@/lib/season";

export const metadata: Metadata = {
  title: `5시즌 ${season.title} · 공식 영상과 공개 내용`,
  description: "독트린, 솜브라·로드호그 개편, 그림스뵈튼과 시즌 이벤트의 공식 공개 내용을 확인하세요.",
  alternates: { canonical: "/season/" },
};

export default function SeasonPage() {
  return <main className="page-shell season-page">
    <SiteHeader active="season" />
    <div className="season-content">
    <section className="page-intro"><span className="section-kicker">REIGN OF TALON · SEASON 5</span><h1>5시즌 <em>{season.title}</em></h1><p>시작 예정 <time dateTime={season.startsAt}>{season.startsLabel}</time> · 공개 내용 확인 {season.checkedAt}</p></section>
    <div className="season-video"><iframe src={`https://www.youtube-nocookie.com/embed/${season.videoId}?rel=0&playsinline=1`} title={season.videoTitle} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></div>
    <div className="season-links"><a href={`https://www.youtube.com/watch?v=${season.videoId}`} target="_blank" rel="noreferrer">한국 공식 채널에서 영상 보기 ↗</a><a href={season.sourceUrl} target="_blank" rel="noreferrer">공식 시즌 소개 원문 ↗</a></div>
    <p className="seo-guide-note">출시 전 공식 소개를 정리했습니다. 영웅의 상세 수치와 추천은 표시된 라이브 패치 기준이며, 출시 패치와 구분해 확인하세요.</p>
    <section className="content-section"><div className="section-heading"><span className="section-kicker">HEROES & MAP</span><h2>전장에 생기는 변화</h2></div><div className="season-grid">{season.highlights.map(item => <article id={item.id} key={item.id} className="season-card"><h3>{item.title}</h3><p>{item.text}</p>{"href" in item && <Link href={item.href}>{item.link} →</Link>}</article>)}</div></section>
    <section className="content-section"><div className="section-heading"><span className="section-kicker">EVENTS</span><h2>시즌 일정</h2><p>아래 기간은 공식 북미 안내 날짜입니다. 한국에서는 시차에 따라 다음 날 시작·종료될 수 있습니다.</p></div><div className="season-grid">{season.events.map(item => <article key={item.title} className="season-card"><small>{item.dates} · 북미 기준</small><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>
    <section className="content-section"><div className="section-heading"><span className="section-kicker">REWARDS</span><h2>배틀 패스와 신화</h2></div><div className="season-grid">{season.rewards.map(item => <article key={item.title} className="season-card"><h3>{item.title}</h3><p>{item.text}</p></article>)}</div><p className="stats-disclaimer">이전 패스에는 코인·경험치 부스트·신화 프리즘·명성 칭호·신화 영웅 및 무기 스킨이 포함되지 않습니다. 보상과 구매 조건은 게임 내 안내를 확인하세요.</p></section>
    </div>
  </main>;
}
