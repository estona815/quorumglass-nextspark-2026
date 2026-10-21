// Independent expanded-ballot verification of QuorumGlass's declared tie policy.
// No production functions are reused except the public analyze/parse interfaces.
// Run: node THIS_FILE.mjs [absolute-or-relative-path-to-engine.mjs]
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const defaultEngine = fileURLToPath(new URL('./engine.mjs', import.meta.url));
const enginePath = process.argv[2] ? resolve(process.argv[2]) : defaultEngine;
const {analyze, parse} = await import(pathToFileURL(enginePath).href);
const permutations = ['ABC', 'ACB', 'BAC', 'BCA', 'CAB', 'CBA'];

// This reference expands every weighted group to individual complete ballots,
// rescans each ballot's letters against a Set of live options, and counts one
// vote at a time. It intentionally does not use the production weighted tally,
// its returned rounds, matrix, plurality, candidate IDs or helper functions.
function reference(ballots) {
  const live = new Set(['A', 'B', 'C']);
  for (let turn = 0; turn < 3; turn++) {
    const votes = {};
    for (const id of live) votes[id] = 0;
    for (const ballot of ballots) {
      for (const id of ballot) {
        if (live.has(id)) {
          votes[id]++;
          break;
        }
      }
    }
    for (const id of live) {
      if (votes[id] * 2 > ballots.length) {
        return {status: 'winner', winner: id, votes: votes[id]};
      }
    }
    let bottom = Infinity;
    let lowest = [];
    for (const id of live) {
      if (votes[id] < bottom) {
        bottom = votes[id];
        lowest = [id];
      } else if (votes[id] === bottom) {
        lowest.push(id);
      }
    }
    if (lowest.length !== 1) {
      return {status: 'unresolved-tie', tied: lowest};
    }
    live.delete(lowest[0]);
  }
  throw Error('Reference termination failed');
}

let profiles = 0;
let majority = 0;
let ties = 0;
// Six permutation multiplicities 0..5 give 6^6 - 1 = 46,655 nonempty profiles.
for (let code = 1; code < 46656; code++) {
  let digits = code;
  const lines = [];
  const expanded = [];
  for (const permutation of permutations) {
    const count = digits % 6;
    digits = Math.floor(digits / 6);
    if (count) {
      lines.push(`${count} ${permutation.split('').join(' ')}`);
      for (let j = 0; j < count; j++) expanded.push(permutation);
    }
  }
  const got = analyze(lines.join('\n'));
  const expected = reference(expanded);
  assert.deepEqual(got.irv, expected, `IRV profile ${code}`);
  profiles++;
  if (expected.status === 'winner') majority++;
  else ties++;
  const first = {A: 0, B: 0, C: 0};
  for (const ballot of expanded) first[ballot[0]]++;
  assert.deepEqual(got.first, first, `First-choice profile ${code}`);
}
// Preserve the four boundary checks performed in the original review run.
assert.equal(parse(Array(100).fill('10000 A B C').join('\n')).length, 100);
assert.equal(analyze('1000000 A B C').total, 1000000);
assert.throws(() => parse('500001 A B C\n500000 C B A'));
assert.throws(() => parse(' '.repeat(20001)));
console.log(JSON.stringify({
  independentExpandedIRVProfiles: profiles,
  strictMajorityResults: majority,
  unresolvedTieResults: ties,
  boundaryCases: 4,
  pass: true
}));
