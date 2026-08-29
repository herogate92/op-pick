import fs from "node:fs/promises";
import heroes from "../data/heroes.json" with { type: "json" };

const source = await fs.readFile(new URL("../lib/hero-videos.ts", import.meta.url), "utf8");
const sharedMatch = source.match(/const NEW_HERO_GAMEPLAY:[\s\S]*?id: "([^"]+)"/);
const sharedId = sharedMatch?.[1];
const mappings = new Map();

for (const line of source.split(/\r?\n/)) {
  const match = line.match(/^\s{2}(?:"([^"]+)"|([a-z0-9]+)):\s*(?:NEW_HERO_GAMEPLAY|\{ id: "([^"]+)")/);
  if (!match) continue;
  mappings.set(match[1] ?? match[2], match[3] ?? sharedId);
}

const aliases = {
  cassidy: ["캐서디", "맥크리"],
  dva: ["D.Va", "슈팅 스타"],
};
const sharedHeroes = new Set(["domina", "mizuki", "anran", "emre", "jetpack-cat"]);
const embedChecks = new Map();

function checkEmbed(id) {
  if (!embedChecks.has(id)) {
    embedChecks.set(id, (async () => {
      const response = await fetch(`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0`, {
        headers: {
          "user-agent": "Mozilla/5.0",
          referer: "https://opick.ggwp.kr/",
        },
      });
      if (!response.ok) return false;
      const html = await response.text();
      return html.includes('previewPlayabilityStatus\\":{\\"status\\":\\"OK\\"')
        && html.includes('playableInEmbed\\":true');
    })());
  }
  return embedChecks.get(id);
}

async function inspect(hero) {
  const id = mappings.get(hero.key);
  if (!id) return { key: hero.key, name: hero.name, status: "missing-mapping" };
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`;
  const response = await fetch(url);
  if (!response.ok) return { key: hero.key, name: hero.name, id, status: `youtube-${response.status}` };
  const metadata = await response.json();
  const embedOk = await checkEmbed(id);
  const names = aliases[hero.key] ?? [hero.name];
  const titleMatches = sharedHeroes.has(hero.key) || names.some((name) => metadata.title.toLocaleLowerCase("ko-KR").includes(name.toLocaleLowerCase("ko-KR")));
  const official = metadata.author_url === "https://www.youtube.com/@OverwatchKR";
  return {
    key: hero.key,
    name: hero.name,
    id,
    title: metadata.title,
    official,
    titleMatches,
    embedOk,
    status: official && titleMatches && embedOk ? "ok" : "review",
  };
}

const results = [];
for (let index = 0; index < heroes.length; index += 8) {
  results.push(...await Promise.all(heroes.slice(index, index + 8).map(inspect)));
}

console.log(JSON.stringify({
  summary: {
    heroes: heroes.length,
    mapped: mappings.size,
    ok: results.filter((result) => result.status === "ok").length,
    review: results.filter((result) => result.status !== "ok").length,
  },
  review: results.filter((result) => result.status !== "ok"),
  results,
}, null, 2));
