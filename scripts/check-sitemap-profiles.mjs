#!/usr/bin/env node
// Sitemap <-> page-set parity gate (BP-010). The served profile sitemap must list exactly the
// /profile/{id}/index.html pages this repo serves, in the static path form, and be wired into
// sitemap_index.xml and robots.txt. Both artifacts are written by ONE generator run
// (canadaaccountants-backend tools/tier1-pregen/gen-db.js); this gate refuses any commit where
// they drifted apart, which is how the pre-2026-06 raw id-range sitemap fed Google thousands of
// 404 / thin URLs. Hermetic: filesystem only, no network.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://canadaaccountants.app';
const failures = [];
const fail = (msg) => failures.push(msg);

const shardFiles = readdirSync(ROOT).filter(f => /^sitemap-profiles-\d+\.xml$/.test(f)).sort();
if (shardFiles.length === 0) fail('no sitemap-profiles-N.xml at repo root. Expected at least sitemap-profiles-1.xml. Fix: run the generator (see below).');

const listed = new Map(); // id -> shard file
for (const f of shardFiles) {
  const xml = readFileSync(join(ROOT, f), 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1]);
  if (locs.length > 50000) fail(`${f}: ${locs.length} urls exceeds Google's 50,000 per-sitemap cap. Fix: re-run the generator (it shards at 45,000).`);
  for (const loc of locs) {
    const m = loc.match(/^https:\/\/canadaaccountants\.app\/profile\/(\d+)\/$/);
    if (!m) { fail(`${f}: url "${loc}" is not the static form ${SITE}/profile/{id}/ (legacy ?id= urls are never listed).`); continue; }
    const id = Number(m[1]);
    if (listed.has(id)) fail(`${f}: id ${id} listed twice (also in ${listed.get(id)}).`);
    listed.set(id, f);
  }
}

const profileDir = join(ROOT, 'profile');
const onDisk = existsSync(profileDir)
  ? readdirSync(profileDir).filter(d => /^\d+$/.test(d) && existsSync(join(profileDir, d, 'index.html')) && statSync(join(profileDir, d, 'index.html')).size > 0).map(Number)
  : [];
const onDiskSet = new Set(onDisk);

const listedNoPage = [...listed.keys()].filter(id => !onDiskSet.has(id));
const pageNotListed = onDisk.filter(id => !listed.has(id));
if (listedNoPage.length) fail(`${listedNoPage.length} sitemap url(s) have no profile/{id}/index.html (would 404 at the page url), e.g. ${listedNoPage.slice(0, 5).join(', ')}.`);
if (pageNotListed.length) fail(`${pageNotListed.length} profile/{id}/index.html page(s) are not in the sitemap (orphan pages: stale prune or a claimed-profile hold), e.g. ${pageNotListed.slice(0, 5).join(', ')}.`);

const idx = existsSync(join(ROOT, 'sitemap_index.xml')) ? readFileSync(join(ROOT, 'sitemap_index.xml'), 'utf8') : '';
const robots = existsSync(join(ROOT, 'robots.txt')) ? readFileSync(join(ROOT, 'robots.txt'), 'utf8') : '';
for (const f of shardFiles) {
  if (!idx.includes(`${SITE}/${f}`)) fail(`sitemap_index.xml does not reference ${f}.`);
  if (!robots.includes(`Sitemap: ${SITE}/${f}`)) fail(`robots.txt has no "Sitemap: ${SITE}/${f}" line.`);
}
for (const m of idx.matchAll(/sitemap-profiles-(\d+)\.xml/g)) {
  if (!shardFiles.includes(`sitemap-profiles-${m[1]}.xml`)) fail(`sitemap_index.xml references sitemap-profiles-${m[1]}.xml which does not exist.`);
}

if (failures.length) {
  console.error(`SITEMAP PARITY FAILED: ${failures.length} problem(s). Expected: every sitemap-profiles-N.xml url = an existing /profile/{id}/index.html and vice versa.`);
  for (const f of failures.slice(0, 30)) console.error('  ' + f);
  console.error('Fix: in canadaaccountants-backend run `npm run tier1:regen -- --write` (railway run; add --admit-new for new admissions), then commit the regenerated profile/ pages AND sitemap-profiles-*.xml AND sitemap_index.xml / robots.txt together. Never hand-edit the sitemap.');
  process.exit(1);
}
console.log(`sitemap parity OK: ${listed.size} profile urls across ${shardFiles.length} shard(s) = ${onDisk.length} pages on disk; index + robots wired.`);
