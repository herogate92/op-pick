import Link from "next/link";
import { seasonHeroNotes } from "@/lib/season";

export function SeasonHeroNotice({ heroKey }: { heroKey: string }) {
  const note = seasonHeroNotes[heroKey];
  if (!note) return null;
  return <aside className="season-hero-notice"><strong>5시즌 적용 안내</strong><p>{note}</p><Link href={`/season/#${heroKey}`}>시즌 변경 내용 보기 →</Link></aside>;
}
