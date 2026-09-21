import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, mkdir, readFile, copyFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

// Isolate the updater from the real data and exercise the full fetch -> validate -> write path.
test("statistics refresh replaces only complete valid snapshots", async () => {
  const root = await mkdtemp(join(tmpdir(), "op-rates-test-"));
  let competitiveRows;
  let invalidTier = false;
  const good = [{ hero: "ana", winrate: 51, pickrate: 4, banrate: 0 }, { hero: "dva", winrate: 49, pickrate: 3, banrate: 12.5 }];
  const requests = [];
  const server = createServer((request, response) => {
    const competitive = new URL(request.url, "http://localhost").searchParams.get("gamemode") === "competitive";
    requests.push(new URL(request.url, "http://localhost"));
    response.writeHead(200, { "Content-Type": "application/json" });
    const tier = new URL(request.url, "http://localhost").searchParams.get("competitive_division");
    response.end(JSON.stringify(invalidTier && tier === "diamond" ? good.slice(0, 1) : competitive ? competitiveRows : good));
  });
  try {
    await mkdir(join(root, "scripts"));
    await mkdir(join(root, "data"));
    await copyFile(new URL("./update-official-rates.mjs", import.meta.url), join(root, "scripts", "update.mjs"));
    await writeFile(join(root, "data", "heroes.json"), JSON.stringify([{ key: "ana" }, { key: "dva" }]));
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const run = () => new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [join(root, "scripts", "update.mjs")], {
        env: { ...process.env, OVERFAST_API_BASE_URL: `http://127.0.0.1:${server.address().port}/heroes/stats` },
        stdio: "ignore",
      });
      child.on("error", reject);
      child.on("close", resolve);
    });
    const destination = join(root, "data", "hero-rates.json");
    for (const rows of [good.slice(0, 1), [good[0], good[0]], [good[0], { ...good[1], hero: "unknown" }], [good[0], { ...good[1], winrate: 101 }], [good[0], { ...good[1], banrate: -1 }], good.map((r) => ({ hero: r.hero, winrate: null, pickrate: null }))]) {
      competitiveRows = rows;
      await writeFile(destination, "last-good-snapshot\n");
      assert.notEqual(await run(), 0);
      assert.equal(await readFile(destination, "utf8"), "last-good-snapshot\n", "invalid competitive data must preserve both previous modes");
    }
    competitiveRows = good;
    assert.equal(await run(), 0);
    const result = JSON.parse(await readFile(destination, "utf8"));
    assert.equal(result.snapshots.length, 20);
    const competitive = result.snapshots.find(item => item.id === "competitive");
    assert.deepEqual(competitive.rows.map((r) => r.hero), ["ana", "dva"]);
    assert.equal(competitive.rows[0].winRate, 51);
    assert.deepEqual(competitive.rows.map(r => r.banRate), [0, 12.5]);
    assert.equal(result.snapshots[0].rows[0].banRate, null);
    const diamond = result.snapshots.find(item => item.filters.tier === "Diamond");
    assert.equal(new URL(diamond.dataProviderUrl).searchParams.get("competitive_division"), "diamond");
    assert.equal(new URL(diamond.sourceUrl).searchParams.get("tier"), "Diamond");
    assert.ok(requests.some(url => url.searchParams.get("platform") === "console" && url.searchParams.get("region") === "europe"));
    const previous = await readFile(destination, "utf8");
    invalidTier = true;
    assert.notEqual(await run(), 0);
    assert.equal(await readFile(destination, "utf8"), previous, "a broken tier must not overwrite the last complete collection");
    invalidTier = false;
    competitiveRows = good.map(row => ({ hero: row.hero, winrate: row.winrate, pickrate: row.pickrate }));
    assert.equal(await run(), 0);
    const missingBan = JSON.parse(await readFile(destination, "utf8"));
    assert.equal(missingBan.snapshots.find(item => item.id === "competitive").rows[0].banRate, null);
    await writeFile(join(root, "data", "heroes.json"), JSON.stringify([{ key: "ana" }, { key: "dva" }, { key: "doctrine", releaseStatus: "trial" }]));
    assert.equal(await run(), 0);
    const withTrial = JSON.parse(await readFile(destination, "utf8"));
    assert.deepEqual(withTrial.snapshots[0].rows.find(row => row.hero === "doctrine"), { hero: "doctrine", winRate: null, pickRate: null, banRate: null });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
});
