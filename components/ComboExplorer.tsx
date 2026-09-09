"use client";
import { useState, type ReactNode } from "react";
import { matchesCombo } from "@/lib/combo-search";
const groups = [
  { id: "ability", title: "일반 기술", description: "이동·고지·화력을 연결합니다." },
  { id: "mixed", title: "일반 기술 + 궁극기", description: "궁극기 하나에 이동이나 방어 기술을 맞춥니다." },
  { id: "pair", title: "영웅 궁합", description: "접근·화력·지원을 함께 운용합니다." },
  { id: "ultimate", title: "궁극기 + 궁극기", description: "두 궁극기의 준비와 방어 기술 소모를 확인하세요." },
];
type Card = { id: string; heroes: string[]; category: string; searchText: string; content: ReactNode };
export function ComboExplorer({ cards, heroes }: { cards: Card[]; heroes: { key: string; name: string }[] }) {
  const [query, setQuery] = useState("");
  const [hero, setHero] = useState("");
  const [category, setCategory] = useState("");
  const visible = cards.filter(card => matchesCombo(card, query, hero, category));
  return <>
    <section className="combo-filters" aria-label="조합 검색과 필터">
      <label>이름·별칭·기술 검색<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="냥바스, 위버, 맥크리, 연꽃" /></label>
      <label>영웅<select value={hero} onChange={event => setHero(event.target.value)}><option value="">모든 영웅</option>{heroes.map(item => <option key={item.key} value={item.key}>{item.name}</option>)}</select></label>
      <label>유형<select value={category} onChange={event => setCategory(event.target.value)}><option value="">모든 유형</option>{groups.map(group => <option key={group.id} value={group.id}>{group.title}</option>)}</select></label>
      <button onClick={() => { setQuery(""); setHero(""); setCategory(""); }}>필터 초기화</button>
    </section>
    <p role="status" aria-live="polite">추천 {cards.length}개 중 {visible.length}개 표시 · 보류 조합은 아래에서 별도 확인</p>
    {visible.length === 0 && <p className="seo-guide-note">조건에 맞는 등록 조합이 없습니다. 필터를 줄여 보세요. 검색 결과가 없다고 궁합이 나쁜 것은 아닙니다.</p>}
    {groups.map(group => <section key={group.id} id={group.id === "ultimate" ? "ultimate-combos" : `${group.id}-synergies`} hidden={!visible.some(card => card.category === group.id)} className="content-section synergy-category-section">
      <div className="section-heading"><h2>{group.title}</h2><p>{group.description}</p></div>
      <div className="combo-grid">{cards.filter(card => card.category === group.id).map(card => <div key={card.id} hidden={!matchesCombo(card, query, hero, category)}>{card.content}</div>)}</div>
    </section>)}
  </>;
}
