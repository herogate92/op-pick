import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile, mkdtemp, mkdir, writeFile, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { appendHistory, getComparisons, rateDelta, validateHistory } from "../lib/stats-history.ts";

const seed = JSON.parse(await readFile(new URL("../public/stats-history.json", import.meta.url), "utf8"));
const entry = (day, digest = "a") => ({ ...structuredClone(seed.entries[0]), fetchedAtIso: `2026-08-${String(day).padStart(2, "0")}T00:00:00.000Z`, patch: { patchDate: "2026-08-01", digest, sourceUrl: "https://overwatch.blizzard.com/en-us/news/patch-notes/" } });

test("이력은 수집 시각별로 유지하며 같은 시각 중복·변조와 역순 입력을 구분한다", () => {
  const first = entry(1);
  const history = { version: 1, entries: [first] };
  assert.equal(appendHistory(history, first), history);
  const altered = structuredClone(first); altered.snapshots[0].rows[0].winRate = 99;
  assert.throws(() => appendHistory(history, altered));
  assert.throws(() => appendHistory({version: 1, entries: [entry(2)]}, first));
  let rolling = history;
  for (let i=2; i<=31; i++) rolling = appendHistory(rolling, entry(i));
  assert.equal(rolling.entries.length, 30);
  assert.equal(rolling.entries[0].fetchedAtIso, entry(2).fetchedAtIso);
});

test("이전 수집과 이전 감지 패치를 구분하고 미기록 패치는 추측하지 않는다", () => {
  const first = entry(1), second = entry(2, "b"), current = entry(3, "b");
  const history = { version: 1, entries: [first, second, current] };
  const result = getComparisons(current, history)[0];
  assert.equal(result.previous.collectedAt, second.fetchedAtIso);
  assert.equal(result.priorPatch.collectedAt, first.fetchedAtIso);
  first.patch = null;
  assert.equal(getComparisons(current, history)[0].priorPatch, null);
});

test("다른 집계 조건·제공자·미래 자료와 비교하지 않는다", () => {
  const old = entry(1), current = entry(2);
  for (const field of ["input", "region", "map", "tier"]) {
    const changed = structuredClone(old); changed.snapshots[0].filters[field] = "different";
    assert.equal(getComparisons(current, {version:1,entries:[changed,current]})[0].previous, null);
  }
  const changed = structuredClone(old); changed.snapshots[0].dataProvider = "blizzard";
  assert.equal(getComparisons(current, {version:1,entries:[changed,current]})[0].previous, null);
  assert.equal(getComparisons(old, {version:1,entries:[old,current]})[0].previous, null);
});

test("증감은 %p로 계산하고 0과 누락을 구분한다", () => {
  assert.equal(rateDelta(51.2, 50.1), 1.1);
  assert.equal(rateDelta(0, 0.2), -0.2);
  assert.equal(rateDelta(0, 0), 0);
  assert.equal(rateDelta(null, 1), null);
  assert.equal(rateDelta(1, undefined), null);
});

test("손상된 이력을 승인하지 않는다", () => {
  assert.throws(() => validateHistory({version:1,entries:[]}));
  const current = entry(1); current.snapshots[0].rows[0].banRate = 101;
  assert.throws(() => validateHistory({version:1,entries:[current]}));
  assert.throws(() => validateHistory({version:1,entries:[entry(2),entry(1)]}));
});

test("공개 이력 복원 실패 시 파일을 보존하고 성공 시 기존 기록에 추가한다", async () => {
  const root = await mkdtemp(join(tmpdir(), "op-history-"));
  let status = 503;
  const history = {version:1,entries:[entry(1)]};
  const server = createServer((req, res) => { res.writeHead(status, {"Content-Type":"application/json"}); res.end(JSON.stringify(history)); });
  try {
    for (const dir of ["scripts", "lib", "data", "public"]) await mkdir(join(root, dir));
    await copyFile(new URL("./update-stats-history.mjs", import.meta.url), join(root,"scripts/update-stats-history.mjs"));
    await copyFile(new URL("../lib/stats-history.ts", import.meta.url), join(root,"lib/stats-history.ts"));
    await writeFile(join(root,"data/hero-rates.json"), JSON.stringify(entry(2)));
    await writeFile(join(root,"public/patch-state.json"), JSON.stringify(entry(2).patch));
    const destination = join(root,"public/stats-history.json");
    await writeFile(destination,"keep-local-history");
    await new Promise(resolve => server.listen(0,"127.0.0.1",resolve));
    const run = () => new Promise((resolve,reject) => {
      const child=spawn(process.execPath,[join(root,"scripts/update-stats-history.mjs")],{env:{...process.env,STATS_HISTORY_URL:`http://127.0.0.1:${server.address().port}/history`},stdio:"ignore"});
      child.on("error",reject);child.on("close",resolve);
    });
    for (const failure of [404,503]) {
      status=failure;assert.notEqual(await run(),0);assert.equal(await readFile(destination,"utf8"),"keep-local-history");
    }
    status=200;assert.equal(await run(),0);
    const result=JSON.parse(await readFile(destination,"utf8"));
    assert.deepEqual(result.entries.map(item=>item.fetchedAtIso),[entry(1).fetchedAtIso,entry(2).fetchedAtIso]);
  } finally { await new Promise(resolve=>server.close(resolve));await rm(root,{recursive:true,force:true}); }
});
