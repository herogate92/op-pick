import Link from "next/link";
import { getHero, type TeamSynergy } from "@/lib/data";

const evidenceLabels = {
  "official-match": "공식 대회 사례",
  "official-example": "공식 활용 예시",
  "guide-example": "전략 가이드 사례",
};

export function SynergyCard({ synergy }: { synergy: TeamSynergy }) {
  return (
    <article id={synergy.id} className="combo-card synergy-guide-card">
      <header><div><span className="section-kicker">{synergy.type}</span><h3>{synergy.name}</h3></div><span className="synergy-evidence-badge">{evidenceLabels[synergy.evidence.type]}</span></header>
      <div className="synergy-roster">{synergy.heroes.map((key) => {
        const hero = getHero(key)!;
        return <Link key={key} href={`/heroes/${key}/`}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt="" /><strong>{hero.name}</strong></Link>;
      })}</div>
      <p className="combo-description">{synergy.reason}</p>
      <ul className="synergy-abilities">{synergy.abilities.map((ability) => <li key={`${ability.hero}:${ability.name}`}>{getHero(ability.hero)!.name} · {ability.name}</li>)}</ul>
      <p><strong>추천 조건</strong> · {synergy.condition}</p>
      <details className="synergy-details">
        <summary>활용 예시·실행·근거 보기</summary>
        <p><strong>교전 예시</strong> · {synergy.example}</p>
        <ol>{synergy.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        <p><strong>실패·대응 조건</strong> · {synergy.failure}</p>
        <p><strong>패치 주의</strong> · {synergy.patchNote}</p>
        <p><strong>사례 근거</strong> · {synergy.evidence.summary} <a href={synergy.evidence.url} target="_blank" rel="noreferrer">사례 원문</a></p>
        <div className="synergy-source-links">{synergy.sourceUrls.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer">{index < synergy.heroes.length ? `${getHero(synergy.heroes[index])!.name} 기술 설명` : "최신 패치 근거"}</a>)}</div>
        <small>{synergy.verificationNote}</small>
      </details>
      <footer>{synergy.modes.join(" · ")} 일반 모드 · 검토 {synergy.reviewedAt}</footer>
    </article>
  );
}
