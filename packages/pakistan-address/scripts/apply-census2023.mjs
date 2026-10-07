// One-time merge of the PBS Census 2023 hierarchy (data-sources/census2023) into data/pakistan.json.
// After this, data/pakistan.json is edited directly (see CONTRIBUTING.md); re-running overwrites later edits.
//
//   node scripts/apply-census2023.mjs
//
// What it does (every decision is written to data-sources/census2023/apply-report.md):
//  * adds the Loralai division and moves Barkhan, Duki, Loralai and Musakhel into it;
//  * renames the Surab district, removes Lehri (a sub-division of Sibi in the census), adds Keamari;
//  * adds PBS codes (`pbsCode`) to every record that matches a census record;
//  * adds census tehsils the data lacks, and keeps the others;
//  * uses the census sub-division scheme for Karachi and the census tehsils for Peshawar, in place of the HDX towns.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(here, '..', 'data', 'pakistan.json');
const censusFile = path.join(here, '..', 'data-sources', 'census2023', 'census2023-hierarchy.json');
const reportFile = path.join(here, '..', 'data-sources', 'census2023', 'apply-report.md');

const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const census = JSON.parse(fs.readFileSync(censusFile, 'utf8'));
const PROV = { Balochistan: 'bl', ICT: 'ict', KP: 'kp', Punjab: 'pb', Sindh: 'sd' };
const PROVINCE_CODE = { bl: '4', ict: '6', kp: '1', pb: '2', sd: '3' }; // values of the portal's province dropdown
const report = [];
const log = (...lines) => report.push(...lines);

// ---------- name helpers ----------
const slugAll = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const SUFFIX = /\b(DIVISION|DISTRICT|TEHSIL|SUB-?TEHSIL|SUB-?DIVISION|TALUKA|PROTECTED AREA|F\.R)\b/g;
const strip = (s) => s.toUpperCase().replace(/\(.*?\)/g, ' ').replace(SUFFIX, ' ').replace(/[^A-Z0-9]+/g, '');
function lev(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}
function score(a, b) {
  if (a === b) return 0;
  const d = lev(a, b);
  if (d <= Math.min(3, Math.floor(Math.min(a.length, b.length) / 4))) return d;
  const [s, l] = a.length <= b.length ? [a, b] : [b, a];
  if (s.length >= 5 && l.includes(s)) return 10 + l.length - s.length;
  return Infinity;
}
/** One-to-one matching; each item is { keys: [normalized names] }. */
function match(as, bs) {
  const pairs = [];
  as.forEach((a, i) => bs.forEach((b, j) => {
    let best = Infinity;
    for (const x of a.keys) for (const y of b.keys) best = Math.min(best, score(x, y));
    if (best < Infinity) pairs.push({ i, j, d: best });
  }));
  pairs.sort((p, q) => p.d - q.d);
  const ua = new Set(), ub = new Set(), out = [];
  for (const p of pairs) { if (ua.has(p.i) || ub.has(p.j)) continue; ua.add(p.i); ub.add(p.j); out.push(p); }
  return { pairs: out, onlyA: as.map((_, i) => i).filter((i) => !ua.has(i)), onlyB: bs.map((_, j) => j).filter((j) => !ub.has(j)) };
}
const keysOf = (r) => [r.name, ...(r.altNames ?? [])].map(strip);
const capitalise = (s) => s.toLowerCase().replace(/(^|[\s.-])([a-z])/g, (_, p, c) => p + c.toUpperCase()).replace(/-E-/g, '-e-');
function censusTehsilName(raw) {
  let n = raw.toUpperCase().replace(/\(.*?\)/g, ' ').replace(/\bF\.R\b/g, ' ').replace(/\s+/g, ' ').trim();
  n = n.replace(/^(SUB-?DIVISION|SUB-?TEHSIL)\s+/, '');
  for (;;) { const m = n.replace(/\s+(SUB-?TEHSIL|SUB-?DIVISION|TEHSIL|TALUKA)$/, ''); if (m === n) break; n = m; }
  n = n.trim();
  return n === 'SITE' ? 'SITE' : capitalise(n);
}
const addAlt = (rec, name) => {
  const have = new Set([rec.name.toLowerCase(), ...(rec.altNames ?? []).map((a) => a.toLowerCase())]);
  if (name && !have.has(name.toLowerCase())) rec.altNames = [...(rec.altNames ?? []), name];
};

// ---------- tables of decisions ----------
// Census districts that correspond to more than one district in the data (splits applied from press reports).
// First id is the primary, which receives census tehsils nothing else matches.
const FAMILY = {
  'kp|SWAT': ['kp-swat', 'kp-upper-swat'],
  'kp|SOUTHWAZIRISTAN': ['kp-upper-south-waziristan', 'kp-lower-south-waziristan'],
  'pb|MUZAFFARGARH': ['pb-muzaffargarh', 'pb-kot-addu'],
  'pb|GUJRANWALA': ['pb-gujranwala', 'pb-wazirabad'],
  'pb|CHAKWAL': ['pb-chakwal', 'pb-talagang'],
  'pb|RAWALPINDI': ['pb-rawalpindi', 'pb-murree'],
};
// Same unit under a name too different to match automatically. Key: `<district id>|<our name>` -> census name.
const SAME_AS = {
  'bl-quetta|Quetta City': 'City',
  'pb-layyah|Leiah': 'Layyah',
  'pb-dera-ghazi-khan|D.G Khan (Tribal Area)': 'Koh-e-Suleman',
  'sd-khairpur|Thari Meer Wah': 'Mirwah',
  'sd-badin|Shaheed Fazil Rahu': 'Golarchi',
  'sd-shaheed-benazir-abad|Daulat Pur': 'Kazi Ahmed',
  'kp-dera-ismail-khan|D.I. Khan': 'Dera Ismail Khan',
  'kp-bajaur|Khar': 'Khar Bajaur',
  'kp-upper-south-waziristan|Shaktui': 'Shaktoi',
  'bl-kech|Buleda': 'Bulaida',
  'kp-kolai-palas|Battera Kolai': 'Battaira',
  'kp-lower-kohistan|Bankad': 'Bankand Ranolia',
  'kp-mardan|Garhi Kapura': 'Ghari Kapoora',
  'kp-shangla|Martoong': 'Martung',
};
// Where the census name is the better display name; ours becomes an alternate name.
const PREFER_CENSUS = new Set([
  'pb-layyah|Leiah', 'pb-dera-ghazi-khan|D.G Khan (Tribal Area)', 'sd-khairpur|Thari Meer Wah',
  'sd-shaheed-benazir-abad|Daulat Pur', 'kp-dera-ismail-khan|D.I. Khan', 'kp-upper-south-waziristan|Shaktui',
]);
// Tehsils reported by the press only, absent from the census frame: removed as unconfirmed.
const DROP = new Set(['kp-upper-south-waziristan|Shawal', 'kp-lower-south-waziristan|Shakai']);
// Districts where the census list replaces the HDX one entirely (different sub-district scheme).
const KARACHI = ['sd-karachi-central', 'sd-karachi-east', 'sd-karachi-south', 'sd-karachi-west', 'sd-korangi', 'sd-malir', 'sd-keamari'];
const REPLACE_ALL = new Set([...KARACHI, 'kp-peshawar']);

// ---------- structural changes ----------
const dist = (id) => data.districts.find((d) => d.id === id);
log('# Census 2023 merge report', '', 'Generated by `scripts/apply-census2023.mjs`.', '', '## Structural changes', '');

// Loralai division
data.divisions.push({ id: 'bl-loralai-div', provinceId: 'bl', name: 'Loralai' });
for (const id of ['bl-barkhan', 'bl-duki', 'bl-loralai', 'bl-musakhel']) {
  if (dist(id).divisionId !== 'bl-zhob-div') throw new Error(id + ' is not in Zhob division');
  dist(id).divisionId = 'bl-loralai-div';
}
log('- Added division **Loralai** (Barkhan, Duki, Loralai, Musakhel), moved out of Zhob division.');

// Surab (was "Shaheed Sikandarabad")
const surab = dist('bl-shaheed-sikandarabad');
surab.id = 'bl-surab'; surab.name = 'Surab'; surab.altNames = ['Shaheed Sikandarabad'];
for (const t of data.tehsils) if (t.districtId === 'bl-shaheed-sikandarabad') t.districtId = 'bl-surab';
log('- Renamed district `bl-shaheed-sikandarabad` to **Surab** (`bl-surab`); the old name is an alternate name.');

// Lehri: a sub-division of Sibi in the census (its tehsils come back below under Sibi and Kachhi)
data.districts.splice(data.districts.findIndex((d) => d.id === 'bl-lehri'), 1);
data.tehsils = data.tehsils.filter((t) => t.districtId !== 'bl-lehri');
log('- Removed district **Lehri**; the census lists Lehri as a sub-division of Sibi district and Bhag under Kachhi.');

// Keamari
data.districts.push({ id: 'sd-keamari', provinceId: 'sd', divisionId: 'sd-karachi-div', name: 'Keamari' });
log('- Added district **Keamari** (Karachi division).');

// ---------- divisions and districts: match and attach codes ----------
const censusDistricts = []; // { province, pid, div, node, ours: [ids] }
for (const [cname, pid] of Object.entries(PROV)) {
  const divs = census.provinces[cname];
  const oDivs = data.divisions.filter((d) => d.provinceId === pid);
  const dm = match(divs.map((v) => ({ keys: [strip(v.name)] })), oDivs.map((v) => ({ keys: keysOf(v) })));
  const byDiv = new Map();
  for (const p of dm.pairs) { oDivs[p.j].pbsCode = divs[p.i].code; byDiv.set(divs[p.i].name, oDivs[p.j]); }
  for (const i of dm.onlyA) log(`- Census division **${divs[i].name}** (${cname}) has no division in the data and was not added.`);
  for (const v of divs) for (const s of v.districts) censusDistricts.push({ cname, pid, div: v.name, node: s, ours: null });
}
const familyIds = new Set(Object.values(FAMILY).flat());
for (const pid of Object.values(PROV)) {
  const pool = data.districts.filter((d) => d.provinceId === pid && !familyIds.has(d.id));
  const cds = censusDistricts.filter((c) => c.pid === pid);
  const fam = [], rest = [];
  for (const c of cds) (FAMILY[`${pid}|${strip(c.node.name)}`] ? fam : rest).push(c);
  for (const c of fam) c.ours = FAMILY[`${pid}|${strip(c.node.name)}`];
  const m = match(rest.map((c) => ({ keys: [strip(c.node.name)] })), pool.map((d) => ({ keys: keysOf(d) })));
  for (const p of m.pairs) { rest[p.i].ours = [pool[p.j].id]; }
  for (const i of m.onlyA) throw new Error(`census district ${rest[i].node.name} (${pid}) has no match in the data`);
  for (const j of m.onlyB) log(`- District **${pool[j].name}** (${pid}) is not in the census frame; kept.`);
}
for (const c of censusDistricts) {
  const primary = dist(c.ours[0]);
  primary.pbsCode = c.node.code;
}
for (const [pid, code] of Object.entries(PROVINCE_CODE)) data.provinces.find((p) => p.id === pid).pbsCode = code;

// ---------- tehsils ----------
const tehsilsOf = (id) => data.tehsils.filter((t) => t.districtId === id);
const stats = { matched: 0, added: 0, kept: 0, dropped: 0, replaced: 0, renamed: 0 };
log('', '## Tehsil changes', '');
for (const c of censusDistricts) {
  const [primaryId] = c.ours;
  const notes = [];
  const cTeh = c.node.tehsils.map((t) => ({ code: t.code, raw: t.name, name: censusTehsilName(t.name) }));

  if (REPLACE_ALL.has(primaryId)) {
    const old = tehsilsOf(primaryId);
    data.tehsils = data.tehsils.filter((t) => t.districtId !== primaryId);
    stats.replaced += old.length;
    for (const t of cTeh) data.tehsils.push({ id: '', districtId: primaryId, name: t.name, pbsCode: t.code });
    notes.push(`  - replaced ${old.length} tehsils (${old.map((t) => t.name).join(', ')}) with the census list (${cTeh.length})`);
    log(`- \`${primaryId}\``, ...notes);
    continue;
  }

  const pool = c.ours.flatMap(tehsilsOf);
  for (const t of [...pool]) {
    if (DROP.has(`${t.districtId}|${t.name}`)) {
      data.tehsils.splice(data.tehsils.indexOf(t), 1); pool.splice(pool.indexOf(t), 1); stats.dropped++;
      notes.push(`  - removed "${t.name}": reported by the press but not in the census frame`);
    }
  }
  const ourKeys = pool.map((t) => ({ keys: [...keysOf(t), ...(SAME_AS[`${t.districtId}|${t.name}`] ? [strip(SAME_AS[`${t.districtId}|${t.name}`])] : [])] }));
  const m = match(cTeh.map((t) => ({ keys: [strip(t.name)] })), ourKeys);
  for (const p of m.pairs) {
    const ours = pool[p.j], theirs = cTeh[p.i];
    ours.pbsCode = theirs.code; stats.matched++;
    const key = `${ours.districtId}|${ours.name}`;
    if (PREFER_CENSUS.has(key)) {
      const old = ours.name;
      ours.name = theirs.name;
      ours.altNames = (ours.altNames ?? []).filter((a) => a.toLowerCase() !== theirs.name.toLowerCase());
      addAlt(ours, old);
      stats.renamed++; notes.push(`  - renamed "${old}" to the census name "${theirs.name}"`);
    }
    else if (strip(ours.name) !== strip(theirs.name) && !SAME_AS[key]) { addAlt(ours, theirs.name); notes.push(`  - "${ours.name}" matches census "${theirs.raw}" (alternate name added)`); }
    else if (SAME_AS[key]) { addAlt(ours, theirs.name); notes.push(`  - "${ours.name}" is census "${theirs.raw}" (alternate name added)`); }
  }
  for (const i of m.onlyA) {
    const t = cTeh[i];
    if (tehsilsOf(primaryId).some((x) => strip(x.name) === strip(t.name))) continue;
    data.tehsils.push({ id: '', districtId: primaryId, name: t.name, pbsCode: t.code }); stats.added++;
    notes.push(`  - added census tehsil "${t.name}"${c.ours.length > 1 ? ` to ${primaryId}` : ''}`);
  }
  for (const j of m.onlyB) { stats.kept++; notes.push(`  - kept "${pool[j].name}" (not in the census list)`); }
  if (notes.length) log(`- \`${primaryId}\``, ...notes);
}

// ---------- finish ----------
data.meta.sources.push({
  name: 'Pakistan Bureau of Statistics, Population Census 2023 (digital census portal)',
  url: 'https://census23.pbos.gov.pk/',
  license: 'Not stated by the publisher; official government statistics, used for unit names and codes with attribution',
  note: 'Divisions, districts and tehsils of Balochistan, Islamabad, Khyber Pakhtunkhwa, Punjab and Sindh as at the census frame (about early 2023); PBS codes in `pbsCode`. See data-sources/census2023/README.md',
});
data.meta.dataVersion = new Date().toISOString().slice(0, 10);

const seen = new Set();
for (const t of data.tehsils) {
  let id = `${t.districtId}-${slugAll(t.name)}`;
  for (let n = 2; seen.has(id); n++) id = `${t.districtId}-${slugAll(t.name)}-${n}`;
  seen.add(id); t.id = id;
}
for (const r of [...data.districts, ...data.tehsils]) if (r.altNames && !r.altNames.length) delete r.altNames;
const ORDER = ['id', 'provinceId', 'divisionId', 'districtId', 'name', 'notice', 'altNames', 'pcode', 'pbsCode'];
const tidy = (r) => Object.fromEntries(ORDER.filter((k) => k in r).map((k) => [k, r[k]]));
const byName = (a, b) => a.name.localeCompare(b.name, 'en');
for (const k of ['provinces', 'divisions', 'districts', 'tehsils']) data[k] = data[k].map(tidy).sort(byName);

log('', '## Totals', '', `- tehsils matched to a census tehsil: ${stats.matched}; added from the census: ${stats.added}; kept though not in the census list: ${stats.kept}; replaced (Karachi, Peshawar): ${stats.replaced}; renamed to the census name: ${stats.renamed}; removed as unconfirmed: ${stats.dropped}`,
  `- result: ${data.divisions.length} divisions, ${data.districts.length} districts, ${data.tehsils.length} tehsils`);
fs.writeFileSync(dataFile, JSON.stringify(data, null, 1) + '\n');
fs.writeFileSync(reportFile, report.join('\n') + '\n');
console.log(report.slice(-4).join('\n'));
