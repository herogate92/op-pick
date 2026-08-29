import Link from "next/link";
import type { Hero } from "@/lib/data";
import { roleLabels } from "@/lib/data";

export function HeroMiniCard({ hero, suffix }: { hero: Hero; suffix?: React.ReactNode }) {
  return (
    <Link href={`/heroes/${hero.key}/`} className="hero-mini-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}<img src={hero.portrait} alt="" />
      <span><strong>{hero.name}</strong><small>{roleLabels[hero.role]}</small></span>
      {suffix}
    </Link>
  );
}
