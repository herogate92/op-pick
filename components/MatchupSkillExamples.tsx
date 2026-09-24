import type { Matchup } from "@/lib/data";

export function MatchupSkillExamples({ matchup, heroName, counterName }: {
  matchup: Matchup; heroName: string; counterName: string;
}) {
  if (!matchup.skillInteractions?.length) return null;
  return (
    <section className="matchup-skill-examples" aria-label="기술로 보는 상성 사례">
      <h3>{matchup.status === "provisional" ? "기술별 검토 조건" : "기술로 보는 상성 사례"}</h3>
      <p className="skill-example-notice">{matchup.status === "provisional" ? "기술 설명은 확인했지만 두 영웅의 우위는 아직 판단하지 않았습니다. 아래 조건과 대응은 검토 참고용이며, 실전 검증을 마친 사례가 아닙니다." : "공개 기술 설명을 바탕으로 정리한 조건부 상성입니다. 기술 하나의 우위가 모든 교전의 승리를 뜻하지는 않습니다."}</p>
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
      {matchup.reviewSources?.length ? <div className="skill-example-sources"><span>추가 검토 자료 · 최신 판정 확정 아님</span>{matchup.reviewSources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}</a>)}</div> : null}
    </section>
  );
}
