"use client";
import { useState, type ReactNode } from "react";
import { HeroPicker, type PickerHero } from "./HeroPicker";
import { matchesCombo } from "@/lib/combo-search";
const groups = [
  { id: "ability", title: "일반 기술", short: "기술", description: "이동·고지·화력을 연결합니다." },
  { id: "mixed", title: "일반 기술 + 궁극기", short: "혼합", description: "궁극기 하나에 이동이나 방어 기술을 맞춥니다." },
  { id: "pair", title: "영웅 궁합", short: "궁합", description: "접근·화력·지원을 함께 운용합니다." },
  { id: "ultimate", title: "궁극기 + 궁극기", short: "궁극기", description: "두 궁극기의 준비와 방어 기술 소모를 확인하세요." },
];
type Card = { id: string; heroes: string[]; category: string; modes: string[]; searchText: string; content: ReactNode };
export function ComboExplorer({ cards, heroes }: { cards: Card[]; heroes: PickerHero[] }) {
  const [mode, setMode] = useState("5v5");
  const [query, setQuery] = useState("");
  const [hero, setHero] = useState("");
  const [category, setCategory] = useState("");
  const visible = cards.filter(card => matchesCombo(card, query, hero, category, mode));
  return <>
    <section className="combo-filters" aria-label="조합 검색과 필터">
      <div className="combo-type-buttons" aria-label="게임 모드">{["5v5", "6v6"].map(value => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)}>{value === "5v5" ? "5대5" : "6대6"}</button>)}</div>
      <div className="combo-primary-controls"><HeroPicker heroes={heroes} value={hero} onChange={setHero} label="조합 영웅" allowAll /><button type="button" onClick={() => { setQuery(""); setHero(""); setCategory(""); }}>초기화</button></div>
      <div className="combo-type-buttons" aria-label="조합 유형"><button type="button" aria-pressed={!category} onClick={() => setCategory("")}>전체</button>{groups.map(group => <button type="button" key={group.id} aria-label={group.title} aria-pressed={category === group.id} onClick={() => setCategory(group.id)}>{group.short}</button>)}</div>
      <label className="combo-query"><span>조합 검색</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="이름·별칭·기술 검색 (위버, 맥크리)" /></label>

    </section>
    <div className="combo-result-line"><p role="status" aria-live="polite">{mode === "5v5" ? "5대5" : "6대6"} 추천 조합 <strong>{visible.length}개</strong></p><a href="#held-synergies">보류 조합 보기</a></div>
    {visible.length === 0 && <p className="seo-guide-note">조건에 맞는 등록 조합이 없습니다. 필터를 줄여 보세요. 검색 결과가 없다고 궁합이 나쁜 것은 아닙니다.</p>}
    {groups.map(group => <section key={group.id} id={group.id === "ultimate" ? "ultimate-combos" : `${group.id}-synergies`} hidden={!visible.some(card => card.category === group.id)} className="content-section synergy-category-section">
      <div className="section-heading"><h2>{group.title}</h2><p>{group.description}</p></div>
      <div className="combo-grid">{cards.filter(card => card.category === group.id).map(card => <div key={card.id} hidden={!matchesCombo(card, query, hero, category, mode)}>{card.content}</div>)}</div>
    </section>)}
  </>;
}
