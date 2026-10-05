#!/usr/bin/env node
// Sitemap <-> page-set parity gate (BP-010, extended 2026-10-05 for the two-tier corpus).
// Two sitemap families are served, both written by ONE generator run
// (canadaaccountants-backend tools/tier1-pregen/gen-db.js):
//   sitemap-profiles-N.xml  STATIC tier: must list exactly the /profile/{id}/index.html pages this
//                           repo serves, in the static path form.
//   sitemap-spa-N.xml       SPA tier: indexable profiles with NO static file, listed in the
//                           /profile?id={id} form that profile.html self-canonicalises. None of
//                           these ids may have a static page (that would be two canonical forms
//                           for one profile), and no id may appear in both families.
// Both families must be wired into sitemap_index.xml and robots.txt. This gate refuses any
// commit where any of that drifted, which is how the pre-2026-06 raw id-range sitemap fed Google
// thousands of 404 / thin URLs. Hermetic: filesystem only, no network.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://canadaaccountants.app';
const failures = [];
const fail = (msg) => failures.push(msg);

const staticFiles = readdirSync(ROOT).filter(f => /^sitemap-profiles-\d+\.xml$/.test(f)).sort();
const spaFiles = readdirSync(ROOT).filter(f => /^sitemap-spa-\d+\.xml$/.test(f)).sort();
if (staticFiles.length === 0) fail('no sitemap-profiles-N.xml at repo root. Expected at least sitemap-profiles-1.xml. Fix: run the generator (see below).');

// id -> shard file, per family
function readFamily(files, re, formLabel) {
  const listed = new Map();
  for (const f of files) {
    const xml = readFileSync(join(ROOT, f), 'utf8');
    const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1]);
    if (locs.length > 50000) fail(`${f}: ${locs.length} urls exceeds Google's 50,000 per-sitemap cap. Fix: re-run the generator (it shards at 45,000).`);
    for (const loc of locs) {
      const m = loc.match(re);
      if (!m) { fail(`${f}: url "${loc}" is not the ${formLabel} form.`); continue; }
      const id = Number(m[1]);
      if (listed.has(id)) fail(`${f}: id ${id} listed twice (also in ${listed.get(id)}).`);
      listed.set(id, f);
    }
  }
  return listed;
}
const staticListed = readFamily(staticFiles, /^https:\/\/canadaaccountants\.app\/profile\/(\d+)\/$/, `static ${SITE}/profile/{id}/`);
const spaListed = readFamily(spaFiles, /^https:\/\/canadaaccountants\.app\/profile\?id=(\d+)$/, `SPA ${SITE}/profile?id={id}`);

const profileDir = join(ROOT, 'profile');
const onDisk = existsSync(profileDir)
  ? readdirSync(profileDir).filter(d => /^\d+$/.test(d) && existsSync(join(profileDir, d, 'index.html')) && statSync(join(profileDir, d, 'index.html')).size > 0).map(Number)
  : [];
const onDiskSet = new Set(onDisk);

// Static tier: 1:1 with the files on disk.
const listedNoPage = [...staticListed.keys()].filter(id => !onDiskSet.has(id));
const pageNotListed = onDisk.filter(id => !staticListed.has(id));
if (listedNoPage.length) fail(`${listedNoPage.length} static sitemap url(s) have no profile/{id}/index.html (would 404 at the page url), e.g. ${listedNoPage.slice(0, 5).join(', ')}.`);
if (pageNotListed.length) fail(`${pageNotListed.length} profile/{id}/index.html page(s) are not in the static sitemap (orphan pages: stale prune or a claimed-profile hold), e.g. ${pageNotListed.slice(0, 5).join(', ')}.`);

// SPA tier: never a file, never also static.
const spaWithPage = [...spaListed.keys()].filter(id => onDiskSet.has(id));
const inBoth = [...spaListed.keys()].filter(id => staticListed.has(id));
if (spaWithPage.length) fail(`${spaWithPage.length} SPA sitemap url(s) have a static profile/{id}/index.html (two canonical forms for one profile), e.g. ${spaWithPage.slice(0, 5).join(', ')}.`);
if (inBoth.length) fail(`${inBoth.length} id(s) appear in both the static and the SPA sitemaps, e.g. ${inBoth.slice(0, 5).join(', ')}.`);

const idx = existsSync(join(ROOT, 'sitemap_index.xml')) ? readFileSync(join(ROOT, 'sitemap_index.xml'), 'utf8') : '';
const robots = existsSync(join(ROOT, 'robots.txt')) ? readFileSync(join(ROOT, 'robots.txt'), 'utf8') : '';
const allFiles = [...staticFiles, ...spaFiles];
for (const f of allFiles) {
  if (!idx.includes(`${SITE}/${f}`)) fail(`sitemap_index.xml does not reference ${f}.`);
  if (!robots.includes(`Sitemap: ${SITE}/${f}`)) fail(`robots.txt has no "Sitemap: ${SITE}/${f}" line.`);
}
for (const m of idx.matchAll(/(sitemap-(?:profiles|spa)-\d+\.xml)/g)) {
  if (!allFiles.includes(m[1])) fail(`sitemap_index.xml references ${m[1]} which does not exist.`);
}
for (const m of robots.matchAll(/Sitemap: https:\/\/canadaaccountants\.app\/(sitemap-(?:profiles|spa)-\d+\.xml)/g)) {
  if (!allFiles.includes(m[1])) fail(`robots.txt references ${m[1]} which does not exist.`);
}
if (/^\s*Disallow:\s*\/profile/m.test(robots)) fail('robots.txt disallows /profile: the SPA tier (/profile?id=N) must stay crawlable.');

if (failures.length) {
  console.error(`SITEMAP PARITY FAILED: ${failures.length} problem(s). Expected: every sitemap-profiles-N.xml url = an existing /profile/{id}/index.html and vice versa; every sitemap-spa-N.xml url = an indexable profile with NO static page; index + robots wired for both.`);
  for (const f of failures.slice(0, 30)) console.error('  ' + f);
  console.error('Fix: in canadaaccountants-backend run `npm run tier1:regen -- --write` (railway run; add --admit-new [--admit-limit N] to promote ids to the static tier), then commit the regenerated profile/ pages AND sitemap-profiles-*.xml AND sitemap-spa-*.xml AND sitemap_index.xml / robots.txt together. Never hand-edit a sitemap.');
  process.exit(1);
}
console.log(`sitemap parity OK: static ${staticListed.size} urls across ${staticFiles.length} shard(s) = ${onDisk.length} pages on disk; spa ${spaListed.size} urls across ${spaFiles.length} shard(s), none with a static page; index + robots wired.`);
