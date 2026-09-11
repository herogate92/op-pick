"use client";

import { useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { Role } from "@/lib/data";
import { roleLabels } from "@/lib/data";
import { heroSearchTerms } from "@/lib/combo-search";

export type PickerHero = { key: string; name: string; role: Role; portrait: string };
const roles: Role[] = ["tank", "damage", "support"];

export function HeroPicker({ heroes, value, onChange, label, allowAll = false }: {
  heroes: PickerHero[]; value: string; onChange: (key: string) => void; label: string; allowAll?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const selected = heroes.find(hero => hero.key === value);
  const [role, setRole] = useState<Role>(selected?.role ?? "tank");
  const [query, setQuery] = useState("");
  const normalize = (text: string) => text.toLowerCase().replace(/[\s.\-:]/g, "");
  const visible = heroes.filter(hero => query.trim()
    ? normalize(heroSearchTerms(hero.key, hero.name)).includes(normalize(query))
    : hero.role === role);
  const choose = (key: string) => { dialog.current?.close(); onChange(key); };
  return <div className="hero-picker-control">
    <button type="button" className="hero-picker-trigger" aria-haspopup="dialog" onClick={() => {
      setRole(selected?.role ?? "tank"); setQuery(""); dialog.current?.showModal();
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {selected ? <img src={selected.portrait} alt="" /> : <Search aria-hidden="true" />}
      <span><small>{label}</small><strong>{selected?.name ?? "모든 영웅"}</strong><em>{selected ? "변경" : "영웅 고르기"}</em></span>
    </button>
    <dialog ref={dialog} className="hero-picker-dialog" aria-labelledby={`${id}-title`} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="hero-picker-sheet">
        <header><h2 id={`${id}-title`}>{label} 선택</h2><button type="button" onClick={() => dialog.current?.close()} aria-label="영웅 선택 닫기"><X aria-hidden="true" /></button></header>
        <label className="picker-search"><Search aria-hidden="true" /><input autoFocus type="search" aria-label="영웅 이름·별칭 검색" placeholder="이름·별칭 검색 (예: 위버, 맥크리)" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <div className="picker-role-buttons" aria-label="역할 카테고리">{roles.map(item => <button type="button" key={item} aria-pressed={!query.trim() && role === item} onClick={() => { setRole(item); setQuery(""); }}>{roleLabels[item]} <small>{heroes.filter(hero => hero.role === item).length}</small></button>)}</div>
        <div className="picker-result-caption"><span role="status">{query.trim() ? "전체 역할 검색" : roleLabels[role]} · {visible.length}명</span>{allowAll && <button type="button" onClick={() => choose("")}>모든 영웅 보기</button>}</div>
        <div className="picker-portrait-grid">{visible.map(hero => <button type="button" key={hero.key} aria-pressed={value === hero.key} aria-label={`${hero.name} 선택`} onClick={() => choose(hero.key)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt="" /><span>{hero.name}</span>
        </button>)}{!visible.length && <p>검색 결과가 없습니다. 다른 이름으로 검색해 주세요.</p>}</div>
      </div>
    </dialog>
  </div>;
}
