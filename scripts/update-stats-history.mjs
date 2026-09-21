import { readFile, writeFile, rename } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { appendHistory, validateHistory } from "../lib/stats-history.ts";

const path = fileURLToPath(new URL("../public/stats-history.json", import.meta.url));
let history;
const source = process.env.STATS_HISTORY_URL;
if (source) {
  const response = await fetch(source, { cache: "no-store", signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`이전 이력을 복원하지 못했습니다 (${response.status}); 기존 운영 자료를 유지합니다`);
  history = await response.json();
} else {
  history = JSON.parse(await readFile(path, "utf8"));
}
validateHistory(history);
const current = JSON.parse(await readFile(new URL("../data/hero-rates.json", import.meta.url), "utf8"));
const patch = JSON.parse(await readFile(new URL("../public/patch-state.json", import.meta.url), "utf8"));
const updated = appendHistory(history, { ...current, patch });
await writeFile(`${path}.tmp`, `${JSON.stringify(updated)}\n`);
await rename(`${path}.tmp`, path);
console.log(`통계 이력 ${updated.entries.length}회 저장 (최근 최대 30회)`);
