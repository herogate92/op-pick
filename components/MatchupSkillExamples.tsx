import type { Matchup } from "@/lib/data";

export function MatchupSkillExamples({ matchup, heroName, counterName }: {
  matchup: Matchup; heroName: string; counterName: string;
}) {
  if (!matchup.skillInteractions?.length) return null;
  return (
    <section className="matchup-skill-examples" aria-label="기술로 보는 상성 사례">
      <h3>기술로 보는 상성 사례</h3>
      <p className="skill-example-notice">공개 기술 설명을 바탕으로 정리한 조건부 상성입니다. 기술 하나의 우위가 모든 교전의 승리를 뜻하지는 않습니다.</p>
      {matchup.skillInteractions.map((example) => (
        <article key={`${example.heroAbility}-${example.counterAbility}`}>
          <h4>{heroName} · {example.heroAbility} <span>vs</span> {counterName} · {example.counterAbility}</h4>
          <p>{example.interaction}</p>
          <dl>
            <div><dt>성립 조건</dt><dd>{example.condition}</dd></div>
            <div><dt>{heroName} 대응법</dt><dd>{example.counterplay}</dd></div>
          </dl>
        </article>
      ))}
      <div className="skill-example-sources">
        <span>기술 설명 출처</span>
        {matchup.sourceUrls?.map((url, index) => (
          <a key={url} href={url} target="_blank" rel="noreferrer">{index === 0 ? heroName : counterName} 기술 정보</a>
        ))}
      </div>
    </section>
  );
}
