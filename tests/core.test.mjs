// Node test for the pure puzzle core in index.html (the block between CORE BEGIN and CORE END).
// Run: node tests/core.test.mjs   (no dependencies; exits 1 on the first failed check)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html'), 'utf8');
const src = html.slice(html.indexOf('// ==== CORE BEGIN ===='), html.indexOf('// ==== CORE END ===='));
const core = new Function(src + '\nreturn { LEVEL_DEFS, DAILY_DEF, generateLevel, levelSeed, dailySeed, homeSolution, planMoves, isSolved, solvePuzzle, starsFor, edgeTotal, evaluate };')();

let passed = 0, failed = 0;
const check = (ok, msg) => { if (ok) passed++; else { failed++; console.error('FAIL', msg); } };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const boards = core.LEVEL_DEFS.map((def, i) => ['L' + (i + 1), def, core.levelSeed(i)]);
for (const d of ['2026-01-01', '2026-06-15', '2026-10-20', '2026-10-21', '2027-02-28']) boards.push(['D' + d, core.DAILY_DEF, core.dailySeed(d)]);

for (const [name, def, seed] of boards) {
  const pz = core.generateLevel(def, seed);
  const n = pz.n;
  check(pz.tiles.length === n * n && pz.start.length === n * n, `${name}: full board`);
  check(same(core.generateLevel(def, seed).start, pz.start), `${name}: deterministic`);
  const home = core.homeSolution(pz);
  check(core.isSolved(pz, home), `${name}: home solution is solved`);
  check(core.evaluate(pz, home).matched.length === core.edgeTotal(n), `${name}: edge total`);
  check(!core.isSolved(pz, pz.start), `${name}: start is scrambled`);
  const plan = core.planMoves(pz, pz.start, home);
  check(plan.length === pz.par, `${name}: par = home plan length`);
  check(core.starsFor(plan.length, pz.par) === 3, `${name}: following the plan earns 3 stars`);
  for (const p of pz.start.keys()) if (pz.tiles[pz.start[p].t].fixed) check(pz.start[p].t === p && pz.start[p].rot === 0 && pz.start[p].face === 0, `${name}: fixed tile ${p} at home`);
  // apply the plan to a copy of the start state and check that it solves the board
  const cur = pz.start.map(s => ({ ...s }));
  for (const m of plan) {
    if (m.type === 'swap') { const t = cur[m.a]; cur[m.a] = cur[m.b]; cur[m.b] = t; }
    else if (m.type === 'flip') cur[m.p].face ^= 1;
    else cur[m.p].rot = (cur[m.p].rot + 1) % 4;
  }
  check(core.isSolved(pz, cur), `${name}: plan solves the board`);
  const t0 = performance.now(); const sol = core.solvePuzzle(pz, pz.start);
  check(!!sol && core.isSolved(pz, sol), `${name}: solver finds a solution (${(performance.now() - t0).toFixed(0)} ms)`);
}
console.log(failed ? `TESTS FAILED ${failed} (passed ${passed})` : `TESTS PASSED ${passed}/${passed}`);
process.exit(failed ? 1 : 0);
