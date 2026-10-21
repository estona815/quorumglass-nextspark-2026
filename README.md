# QuorumGlass

A local educational tool for student clubs to compare plurality, instant-runoff and pairwise results before choosing a counting rule. Built from scratch on 2026-10-22 during NextSpark's published submission period. Not yet submitted.

## Run

No packages, API, build step or paid service. Run `python3 -m http.server 8841` in this directory and open `http://localhost:8841`. Tests: `node --test engine.test.mjs`.

Each line is a positive integer count and a complete ordering of A B C. At most 100 groups and 1,000,000 ballots. The fixed options are fictional student-club activities. Use Compare rankings, inspect the head-to-head matrix and round audit, load the cycle example, and export the reproducible JSON calculation.

## Policy and limits

Strict majority means greater than half the total. Instant-runoff removes a unique lowest candidate. When the lowest count is tied, this implementation deliberately stops as unresolved, rather than silently selecting an alphabetical winner. Only full rankings are accepted; there are no exhausted ballots. Pairwise reports a candidate only if they strictly beat every rival. A three-option cycle and pairwise ties remain visible. This is a comparison lab, not a secure voting service, certified election system or recommendation of a universally fair rule. It has no identities, duplicate-vote protection, remote ballot collection or verified real-world deployment. Data stays in memory unless the user exports a local file. No network calls in application code.

## Provenance

AI assistance: OpenAI Codex generated implementation, tests, explanations and design prompting; built-in Image Gen created the UI concept. User supplied contest goals and constraints. No third-party code, fonts, datasets, music, footage or API services are embedded. Synthetic examples only. No claimed user study, award or production deployment.

## Current state

Source publication: https://github.com/estona815/quorumglass-nextspark-2026 . Live-demo deployment is being prepared. This project has not been submitted to NextSpark.

The six engine tests pass. A separate expanded-ballot reference matched instant-runoff results on all 46,655 profiles with each of the six ranking counts from 0 through 5 (excluding the empty profile). Desktop/mobile browser captures and a downloaded audit JSON have been checked. Independent review covers calculation and static code, not a complete contest package approval.

Devpost gallery attachment, the required 1–3 minute demo video, and final submission review remain pending. No video or public user study is claimed.
