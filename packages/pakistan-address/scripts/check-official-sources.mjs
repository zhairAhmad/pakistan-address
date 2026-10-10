// Watches the official pages that publish notifications of administrative units and reports what is new since the last
// snapshot. Needs no login and contacts nobody: it only reads public web pages, a few requests per run.
//
//   node scripts/check-official-sources.mjs            report new and removed entries
//   node scripts/check-official-sources.mjs --update    report, then save the current entries as the snapshot
//
// Exit code: 0 nothing new, 2 something new (so it can be used from a scheduler), 1 every source failed.
// The snapshot is data-sources/watch/snapshot.json. Run it monthly. When something relevant appears, read the
// document, then add it to the matching data-sources/ folder and apply it (see CONTRIBUTING.md).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const snapshotFile = path.join(here, '..', 'data-sources', 'watch', 'snapshot.json');

/** Each source is a public listing page; `keep` selects the links that are documents or notification entries. */
const SOURCES = [
  {
    id: 'bor-balochistan-notifications',
    name: 'Balochistan Board of Revenue: notifications',
    url: 'https://bor.balochistan.gov.pk/notifications/',
    keep: (href) => /wp-content\/uploads\//i.test(href),
  },
  {
    id: 'bor-kp-notifications',
    name: 'Khyber Pakhtunkhwa Board of Revenue: notifications',
    url: 'https://revenue.kp.gov.pk/notification/',
    keep: (href) => /revenue\.kp\.gov\.pk\/notification\/./i.test(href),
  },
  {
    id: 'pa-balochistan-acts',
    name: 'Provincial Assembly of Balochistan: acts',
    url: 'https://pabalochistan.gov.pk/acts',
    keep: (href) => /pabalochistan\.gov\.pk\/(acts?|storage)\//i.test(href),
  },
];

const RELEVANT = /district|tehsil|taluka|division|sub-?division|bifurcat|creation|upgrad|renam|local government|schedule/i;
const UA = 'Mozilla/5.0 (compatible; pakistan-address-source-watch; +https://github.com/zhairAhmad/pakistan-address)';

const clean = (s) => s.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;|&ndash;/g, '-').replace(/\s+/g, ' ').trim();

async function entries(source) {
  const res = await fetch(source.url, { headers: { 'user-agent': UA, accept: 'text/html' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const seen = new Map();
  for (const m of html.matchAll(/<a\b[^>]*?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let href;
    try {
      href = new URL(m[1], source.url).href;
    } catch {
      continue;
    }
    if (!source.keep(href)) continue;
    const text = clean(m[2]);
    const prev = seen.get(href);
    if (!prev || (!prev && text) || text.length > prev.length) seen.set(href, text || prev || '');
  }
  return [...seen].map(([href, text]) => ({ href, text: text || decodeURIComponent(href.split('/').pop() ?? href) }));
}

const snapshot = fs.existsSync(snapshotFile) ? JSON.parse(fs.readFileSync(snapshotFile, 'utf8')) : { sources: {} };
const update = process.argv.includes('--update');
const next = { checked: new Date().toISOString().slice(0, 10), sources: { ...snapshot.sources } };
let failed = 0;
let anyNew = false;

for (const source of SOURCES) {
  process.stdout.write(`${source.name}\n  ${source.url}\n`);
  let current;
  try {
    current = await entries(source);
  } catch (e) {
    failed++;
    console.log(`  ERROR: ${e.message} (not compared)\n`);
    continue;
  }
  const before = snapshot.sources[source.id];
  if (!before) {
    console.log(`  first run: ${current.length} entries recorded${update ? '' : ' (run with --update to save them)'}\n`);
  } else {
    const known = new Set(before.map((e) => e.href));
    const now = new Set(current.map((e) => e.href));
    const added = current.filter((e) => !known.has(e.href));
    const removed = before.filter((e) => !now.has(e.href));
    if (!added.length && !removed.length) console.log(`  no change (${current.length} entries)\n`);
    for (const e of added) {
      anyNew = true;
      console.log(`  NEW${RELEVANT.test(e.text + ' ' + e.href) ? ' (looks relevant)' : ''}: ${e.text}\n       ${e.href}`);
    }
    for (const e of removed) console.log(`  REMOVED: ${e.text}\n       ${e.href}`);
    if (added.length || removed.length) console.log('');
  }
  next.sources[source.id] = current;
}

if (update) {
  fs.mkdirSync(path.dirname(snapshotFile), { recursive: true });
  fs.writeFileSync(snapshotFile, JSON.stringify(next, null, 1) + '\n');
  console.log(`Snapshot saved: ${path.relative(process.cwd(), snapshotFile)}`);
}
if (failed === SOURCES.length) process.exit(1);
process.exit(anyNew ? 2 : 0);
