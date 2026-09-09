import { ArrowDown, Gauge, ShieldAlert, Sparkles } from "lucide-react";
import { ScoreMeter } from "@/components/ScoreMeter";
import { getHero, type Combo } from "@/lib/data";

export function UltimateComboCard({ combo }: { combo: Combo }) {
 return (<article id={combo.id} className="combo-card">
                <header><span className="combo-index">궁</span><div><span className="section-kicker">ULTIMATE COMBO</span><h2>{combo.name}</h2></div><ScoreMeter value={combo.score} label="추천도" /></header>
                <div className="combo-heroes">
                  {combo.heroes.map((key, heroIndex) => {
                    const hero = getHero(key)!;
                    return <div key={key} className="combo-hero">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt={`${hero.name} 초상`} /><strong>{hero.name}</strong>{heroIndex === 0 && <Sparkles className="combo-plus" />}</div>;
                  })}
                </div>
                <p className="combo-description">{combo.description}</p>
                <div className="combo-meta"><span><Gauge />난이도 <ScoreMeter value={combo.difficulty} /></span><span><ArrowDown />타이밍 <small>{combo.timing}</small></span></div>
                <div className="combo-counters"><span><ShieldAlert />대표 대응</span><div>{combo.counters.map((key) => { const hero = getHero(key)!; return <a href={`/heroes/${hero.key}/`} key={key}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt="" /><span>{hero.name}</span></a>; })}</div></div>
                <details className="synergy-details"><summary>실행 순서 · 실패 조건 · 근거 보기</summary><p><strong>추천 조건</strong> · {combo.condition}</p><ol>{combo.steps?.map(step => <li key={step}>{step}</li>)}</ol><p><strong>실패 조건</strong> · {combo.failure}</p><p>{combo.evidence?.summary} <a href={combo.evidence?.url} target="_blank" rel="noreferrer">전략 가이드 원문</a></p><div className="synergy-source-links">{combo.sourceUrls?.map((url, i) => <a key={url} href={url} target="_blank" rel="noreferrer">{getHero(combo.heroes[i])!.name} 기술 설명</a>)}</div><small>{combo.verificationNote}</small></details><footer>5v5 · 검토 {combo.reviewedAt}</footer>
              </article>);
}
