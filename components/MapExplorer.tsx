"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronsRight,
  Cross,
  Layers3,
  Map as MapIcon,
  MapPinned,
  Radar,
  Shield,
  Swords,
  Target,
  Truck,
} from "lucide-react";
import type { Hero, Role } from "@/lib/data";

interface PublicMapRecommendation { hero: string; rank: number; winRate: number; }
interface PublicMapGuide { id: string; name: string; mode: string; recommendations: PublicMapRecommendation[]; }

const roleIcons = { tank: Shield, damage: Swords, support: Cross };
const roleLabels: Record<Role, string> = { tank: "돌격", damage: "공격", support: "지원" };
const modeOrder = ["전체", "쟁탈", "호위", "혼합", "밀기", "플래시포인트"];
const modeIcons = {
  "전체": Layers3,
  "쟁탈": Target,
  "호위": Truck,
  "혼합": MapIcon,
  "밀기": ChevronsRight,
  "플래시포인트": Radar,
} as const;

const getMapImage = (id: string) => `/maps/${id}.webp`;

export function MapExplorer({ maps, heroes }: { maps: PublicMapGuide[]; heroes: Hero[] }) {
  const [mode, setMode] = useState("전체");
  const visibleMaps = useMemo(() => mode === "전체" ? maps : maps.filter((map) => map.mode === mode), [maps, mode]);
  const [selectedId, setSelectedId] = useState(maps[0]?.id ?? "");
  const selected = visibleMaps.find((map) => map.id === selectedId) ?? visibleMaps[0];
  const SelectedModeIcon = selected ? modeIcons[selected.mode as keyof typeof modeIcons] ?? MapPinned : MapPinned;
  const heroByKey = new Map(heroes.map((hero) => [hero.key, hero]));

  const changeMode = (nextMode: string) => {
    setMode(nextMode);
    const first = nextMode === "전체" ? maps[0] : maps.find((map) => map.mode === nextMode);
    if (first) setSelectedId(first.id);
  };

  return (
    <div className="map-explorer">
      <div className="map-mode-tabs" role="tablist" aria-label="맵 모드 필터">
        {modeOrder.filter((item) => item === "전체" || maps.some((map) => map.mode === item)).map((item) => {
          const Icon = modeIcons[item as keyof typeof modeIcons];
          const count = item === "전체" ? maps.length : maps.filter((map) => map.mode === item).length;
          return (
            <button key={item} type="button" role="tab" aria-selected={mode === item} className={mode === item ? "selected" : ""} onClick={() => changeMode(item)}>
              <span className="map-mode-icon"><Icon aria-hidden="true" /></span>
              <span><strong>{item}</strong><small>{count}개 전장</small></span>
            </button>
          );
        })}
      </div>

      <div className="map-guide-layout">
        <aside className="map-list" aria-label="맵 목록">
          <header><MapPinned aria-hidden="true" /><span><strong>{mode === "전체" ? "전체 전장" : `${mode} 전장`}</strong><small>{visibleMaps.length}개 맵</small></span></header>
          <div>
            {visibleMaps.map((map) => (
              <button type="button" key={map.id} className={selected?.id === map.id ? "selected" : ""} onClick={() => setSelectedId(map.id)}>
                <span className="map-list-thumbnail"><Image src={getMapImage(map.id)} alt="" fill sizes="72px" /></span>
                <span className="map-list-copy"><strong>{map.name}</strong><small>{map.mode}</small></span>
                <em>{map.recommendations.length}</em>
              </button>
            ))}
          </div>
        </aside>

        {selected && (
          <section className="map-recommend-panel" aria-live="polite">
            <header className="map-recommend-heading">
              <Image src={getMapImage(selected.id)} alt={`${selected.name} 전장 전경`} fill sizes="(max-width: 760px) 100vw, 900px" priority />
              <div className="map-recommend-shade" aria-hidden="true" />
              <div className="map-recommend-copy">
                <span className="map-selected-mode"><SelectedModeIcon aria-hidden="true" />{selected.mode}</span>
                <span className="section-kicker">SELECTED BATTLEGROUND</span>
                <h2>{selected.name}</h2>
                <p>추천 영웅 {selected.recommendations.length}명 · 역할별 성과 순위</p>
              </div>
              <Link href={`/maps/${selected.id}/`} className="map-detail-link text-link">상세 추천 보기</Link>
            </header>
            <div className="map-role-sections">
              {(["tank", "damage", "support"] as Role[]).map((role) => {
                const Icon = roleIcons[role];
                const recommendations = selected.recommendations.filter((item) => heroByKey.get(item.hero)?.role === role);
                if (!recommendations.length) return null;
                return (
                  <section key={role} className={`map-role-section map-role-${role}`}>
                    <h3><Icon aria-hidden="true" />{roleLabels[role]}<small>{recommendations.length}명</small></h3>
                    <div className="map-hero-grid">
                      {recommendations.map((item) => {
                        const hero = heroByKey.get(item.hero)!;
                        return (
                          <Link href={`/heroes/${hero.key}/`} key={hero.key} className="map-hero-card">
                            {/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt="" />
                            <span><strong>{hero.name}</strong><small>적합 맵 {item.rank}순위 · 기본 승률 {item.winRate.toFixed(1)}%</small></span>
                            <em>TOP {item.rank}</em>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
