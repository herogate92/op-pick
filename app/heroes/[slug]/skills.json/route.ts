import { getHero, heroes } from "@/lib/data";

// Per-hero abilities and perks for the /heroes/ skill sheet, fetched only when it opens.
export const dynamic = "force-static";

export function generateStaticParams() {
  return heroes.map((hero) => ({ slug: hero.key }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const hero = getHero((await params).slug);
  if (!hero) return new Response("Not found", { status: 404 });
  return Response.json({ abilities: hero.abilities, perks: hero.perks });
}
