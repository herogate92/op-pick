import type { Metadata } from "next";
import { HeroStage } from "@/components/HeroStage";
import { combos, heroes, matchups } from "@/lib/data";

export const metadata: Metadata = {
  title: "오버워치 영웅 도감",
  description: "역할별 오버워치 영웅을 선택하고 기술, 특전, 상성 및 추천 조합을 확인하세요.",
  alternates: { canonical: "/heroes/" },
};

export default function HeroesPage() {
  const summary = heroes.map(({ key, name, role, subrole, portrait, background, description, abilities, perks, hitpoints }) => ({
    key, name, role, subrole, portrait, background, description, abilities, perks, hitpoints,
  }));
  return <HeroStage heroes={summary} matchups={matchups} combos={combos} />;
}
