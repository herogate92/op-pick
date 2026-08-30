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
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) return false;
      const html = await response.text();
      return html.includes('previewPlayabilityStatus\\":{\\"status\\":\\"OK\\"')
        && html.includes('playableInEmbed\\":true');
    })());
  }
  return embedChecks.get(id);
}

async function checkDirectVideo(video) {
  const responses = await Promise.all([
    [video.thumbnail, "image/"],
    [video.webm, "video/webm"],
    [video.mp4, "video/mp4"],
  ].map(async ([url, contentType]) => {
    const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(20_000) });
    return response.ok && response.headers.get("content-type")?.startsWith(contentType);
  }));
  return responses.every(Boolean);
}

async function inspect(hero) {
  const officialResponse = await fetch(hero.sourceUrl, { signal: AbortSignal.timeout(30_000) });
  const officialHtml = officialResponse.ok ? await officialResponse.text() : "";
  const abilityVideoUrls = hero.abilities.flatMap((ability) => ability.video ? Object.values(ability.video) : []);
  const abilitiesMatchOfficial = officialResponse.ok
    && abilityVideoUrls.length > 0
    && abilityVideoUrls.every((url) => officialHtml.includes(url));

  const id = mappings.get(hero.key);
  if (!id) {
    const ability = hero.abilities.find((item) => item.video);
    if (!ability?.video) return { key: hero.key, name: hero.name, status: "missing-video" };
    const directVideoOk = await checkDirectVideo(ability.video);
    return {
      key: hero.key,
      name: hero.name,
      kind: "official-ability",
      ability: ability.name,
      officialPageOk: officialResponse.ok,
      abilitiesMatchOfficial,
      directVideoOk,
      status: abilitiesMatchOfficial && directVideoOk ? "ok" : "review",
    };
  }

  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`;
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) return { key: hero.key, name: hero.name, id, status: `youtube-${response.status}` };
  const metadata = await response.json();
  const embedOk = await checkEmbed(id);
  const titleMatches = sharedHeroes.has(hero.key)
    || metadata.title.toLocaleLowerCase("ko-KR").includes(hero.name.toLocaleLowerCase("ko-KR"));
  const official = metadata.author_url === "https://www.youtube.com/@OverwatchKR";
  const legacyTitle = /게임플레이 미리 보기|맥크리/.test(metadata.title);
  return {
    key: hero.key,
    name: hero.name,
    kind: "youtube",
    id,
    title: metadata.title,
    official,
    titleMatches,
    legacyTitle,
    embedOk,
    officialPageOk: officialResponse.ok,
    abilitiesMatchOfficial,
    status: official && titleMatches && !legacyTitle && embedOk && abilitiesMatchOfficial ? "ok" : "review",
  };
}

const results = [];
for (let index = 0; index < heroes.length; index += 6) {
  results.push(...await Promise.all(heroes.slice(index, index + 6).map(inspect)));
}

const report = {
  summary: {
    heroes: heroes.length,
    youtube: results.filter((result) => result.kind === "youtube").length,
    officialAbility: results.filter((result) => result.kind === "official-ability").length,
    ok: results.filter((result) => result.status === "ok").length,
    review: results.filter((result) => result.status !== "ok").length,
  },
  review: results.filter((result) => result.status !== "ok"),
  results,
};

console.log(JSON.stringify(report, null, 2));
if (report.summary.review > 0) process.exit(1);
