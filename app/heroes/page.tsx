import { HeroStage } from "@/components/HeroStage";
import { combos, heroes, matchups } from "@/lib/data";

export default function HeroesPage() {
  const summary = heroes.map(({ key, name, role, subrole, portrait, background, description, abilities, perks, hitpoints }) => ({
    key, name, role, subrole, portrait, background, description, abilities, perks, hitpoints,
  }));
  return <HeroStage heroes={summary} matchups={matchups} combos={combos} />;
}
