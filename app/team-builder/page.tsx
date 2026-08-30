import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { SiteHeader } from "@/components/SiteHeader";
import { TeamBuilder } from "@/components/TeamBuilder";
import { combos, heroes, maps, teamCautions, teamSynergies } from "@/lib/data";

export const metadata: Metadata = {
  title: "팀 조합 연구소",
  description: "5대5 역할 고정과 6대6 자유 구성으로 아군 영웅을 조합하고 역할 균형과 궁극기 연계를 확인합니다.",
  alternates: { canonical: "/team-builder/" },
};

export default function TeamBuilderPage() {
  const roster = heroes.map(({ key, name, role, subrole, portrait, reviewStatus }) => ({ key, name, role, subrole, portrait, reviewStatus }));
  return (
    <main className="page-shell team-builder-page">
      <SiteHeader active="team-builder" />
      <TeamBuilder heroes={roster} combos={combos} maps={maps} synergies={teamSynergies} cautions={teamCautions} />
      <AdSlot kind="banner" />
    </main>
  );
}
