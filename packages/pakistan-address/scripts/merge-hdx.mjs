// One-time merge of the OCHA/WFP COD-AB workbook (data-sources/hdx) into data/pakistan.json,
// which was first imported from geo-pakistan. After this, data/pakistan.json is edited
// directly (see CONTRIBUTING.md); re-running this script would overwrite those edits.
//
//   node scripts/merge-hdx.mjs
//
// Rules:
//  * HDX decides which districts exist (160) and which tehsils each has, and supplies p-codes.
//  * Existing district names/ids are kept where HDX has the same district under another spelling.
//  * geo-pakistan tehsils that HDX does not list are kept (HDX omits Balochistan's sub-tehsils and
//    some Punjab tehsils), with "Taluka"/"Sub-Tehsil" style suffixes removed.
//  * Karachi's six districts use HDX only: the two sources describe different sub-district schemes
//    (towns vs sub-divisions) and mixing them would be confusing.
//  * Every non-exact name match is written to data-sources/hdx/merge-report.md for review.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(here, '..', 'data', 'pakistan.json');
const hdxFile = path.join(here, '..', 'data-sources', 'hdx', 'hdx-admin.json');
const reportFile = path.join(here, '..', 'data-sources', 'hdx', 'merge-report.md');

const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const hdx = JSON.parse(fs.readFileSync(hdxFile, 'utf8'));
const report = [];
const log = (...lines) => report.push(...lines);

// ---------- helpers ----------
const PROVINCE_BY_PCODE = { PK1: 'ajk', PK2: 'bl', PK3: 'gb', PK4: 'ict', PK5: 'kp', PK6: 'pb', PK7: 'sd' };
const SUFFIX = /\s+(sub[- ]?tehsil|sub[- ]?division|taluka|sub)$/i;

const slugAll = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const slug = (s) =>
  s.replace(/\(.*?\)/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function clean(name) {
  let n = name.trim().replace(/\s+/g, ' ');
  while (SUFFIX.test(n)) n = n.replace(SUFFIX, '');
  return n
    .replace(/-E-/g, '-e-')
    .replace(/\bIii\b/g, 'III')
    .replace(/\bIi\b/g, 'II')
    .replace(/\bIv\b/g, 'IV')
    .replace(/\bD\. I\. Khan\b/, 'D.I. Khan');
}
const norm = (s) => clean(s).toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '');

function lev(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}
const maxDist = (a, b) => Math.min(3, Math.floor(Math.min(a.length, b.length) / 4));

/**
 * One-to-one matching of two name lists: exact normalized matches first, then close spellings,
 * then one name contained in the other ("Daggar" in "Daggar Buner"; at least 5 letters).
 */
function matchNames(as, bs) {
  const pairs = [];
  as.forEach((a, i) => bs.forEach((b, j) => {
    const na = norm(a), nb = norm(b);
    const d = na === nb ? 0 : lev(na, nb);
    const [short, long] = na.length <= nb.length ? [na, nb] : [nb, na];
    if (d <= maxDist(na, nb)) pairs.push({ i, j, d });
    else if (short.length >= 5 && long.includes(short)) pairs.push({ i, j, d: 10 + long.length - short.length });
  }));
  pairs.sort((x, y) => x.d - y.d);
  const usedA = new Set(), usedB = new Set(), out = [];
  for (const p of pairs) {
    if (usedA.has(p.i) || usedB.has(p.j)) continue;
    usedA.add(p.i); usedB.add(p.j); out.push(p);
  }
  return out;
}

// ---------- districts ----------
// HDX districts that exist in the data under another spelling.
const DISTRICT_ALIAS = {
  'ajk|jhelumvalley': 'ajk-hattian-bala', // HDX uses the district's former name
  'ajk|sudhnoti': 'ajk-sudhnati',
  'bl|sherani': 'bl-sheerani',
  'gb|diamir': 'gb-diamer',
  'gb|rondu': 'gb-roundu',
  'kp|dikhan': 'kp-dera-ismail-khan',
  'pb|leiah': 'pb-layyah',
  'sd|kambarshahdadkot': 'sd-qambar-shahdadkot',
  'sd|centralkarachi': 'sd-karachi-central',
  'sd|eastkarachi': 'sd-karachi-east',
  'sd|southkarachi': 'sd-karachi-south',
  'sd|westkarachi': 'sd-karachi-west',
  'sd|korangikarachi': 'sd-korangi',
  'sd|malirkarachi': 'sd-malir',
};
const KARACHI = new Set(['sd-karachi-central', 'sd-karachi-east', 'sd-karachi-south', 'sd-karachi-west', 'sd-korangi', 'sd-malir']);

// Districts HDX has that the data did not: name, and the older district they were carved out of
// (the new district joins that district's division; the older district's tehsils move across).
const NEW_DISTRICTS = {
  'Chitral Lower': { name: 'Lower Chitral', from: 'kp-chitral' },
  'Chitral Upper': { name: 'Upper Chitral', from: 'kp-chitral' },
  'Kohistan Lower': { name: 'Lower Kohistan', from: 'kp-kohistan' },
  'Kohistan Upper': { name: 'Upper Kohistan', from: 'kp-kohistan' },
  'Kolai Palas Kohistan': { name: 'Kolai-Palas', from: 'kp-kohistan' },
  Chaman: { name: 'Chaman', from: 'bl-killa-abdullah' },
  Duki: { name: 'Duki', from: 'bl-loralai' },
  'Shaheed Sikandarabad': { name: 'Shaheed Sikandarabad', from: 'bl-kalat' },
};
const SPLIT_PARENTS = new Set(['kp-chitral', 'kp-kohistan']); // cease to exist

// Older tehsil names that are the same unit as an HDX tehsil under a name too different to match
// automatically. Key: `<district id>|<cleaned geo-pakistan name>`.
const SAME_AS = {
  'pb-layyah|Layyah': 'Leiah',
  'pb-khushab|Nurpur': 'Noorpur',
  'sd-khairpur|Mirwah': 'Thari Meer Wah',
  'sd-badin|Golarchi (Shaheed Fazal Rahu)': 'Shaheed Fazil Rahu',
  'sd-shaheed-benazir-abad|Kazi Ahmed (Daulatpur)': 'Daulat Pur',
  'kp-dera-ismail-khan|Dera Ismail Khan (D.I.Khan)': 'D. I. Khan',
  'kp-lakki-marwat|Naurang': 'Sarai Naurang',
  'kp-bajaur|Khar Bajaur': 'Khar',
  'bl-nasirabad|D.M.Jamali': 'Dera Murad Jamali',
};
// Older tehsils that no longer exist: HDX lists the units they were split into.
const SUPERSEDED = new Set(['kp-swat|Matta']); // now Matta Kharirai and Matta Sebujni
// Display fixes for names as HDX / geo-pakistan spell them.
const NAME_FIX = { Riawand: 'Raiwind', 'D. I. Khan': 'Dera Ismail Khan', 'Gujranwal Saddar': 'Gujranwala Saddar' };

const oldDistrict = new Map(data.districts.map((d) => [d.id, d]));
const oldByKey = new Map(data.districts.map((d) => [d.provinceId + '|' + norm(d.name), d]));
const oldTehsilsByDistrict = new Map();
for (const t of data.tehsils) {
  if (!oldTehsilsByDistrict.has(t.districtId)) oldTehsilsByDistrict.set(t.districtId, []);
  oldTehsilsByDistrict.get(t.districtId).push(t);
}

const districts = []; // final records, each with ._hdx and ._pool (older tehsil sources)
log('# HDX merge report', '', `Generated by scripts/merge-hdx.mjs. HDX districts: ${hdx.districts.length}, tehsils: ${hdx.tehsils.length}.`, '');
log('## District decisions', '');
for (const h of hdx.districts) {
  const provinceId = PROVINCE_BY_PCODE[h.adm1_pcode];
  const key = provinceId + '|' + norm(h.adm2_name);
  const existing = oldByKey.get(key) ?? oldDistrict.get(DISTRICT_ALIAS[key]);
  if (existing) {
    if (norm(existing.name) !== norm(h.adm2_name))
      log(`- \`${existing.id}\` "${existing.name}" = HDX "${h.adm2_name}" (${h.adm2_pcode}), existing name kept`);
    districts.push({ ...existing, pcode: h.adm2_pcode, _hdx: h, _pool: [existing.id] });
  } else {
    const n = NEW_DISTRICTS[h.adm2_name];
    if (!n) throw new Error(`Unhandled HDX district ${h.adm2_name}`);
    const parent = oldDistrict.get(n.from);
    const id = `${provinceId}-${slug(n.name)}`;
    log(`- NEW \`${id}\` "${n.name}" (${h.adm2_pcode}), division inherited from "${parent.name}": \`${parent.divisionId}\` **(verify)**`);
    districts.push({ id, provinceId, divisionId: parent.divisionId, name: n.name, pcode: h.adm2_pcode, _hdx: h, _pool: [n.from] });
  }
}
for (const id of SPLIT_PARENTS) log(`- REMOVED \`${id}\`: replaced by the districts split from it`);
const keptIds = new Set(districts.map((d) => d.id));
for (const d of data.districts)
  if (!keptIds.has(d.id) && !SPLIT_PARENTS.has(d.id)) throw new Error(`Existing district ${d.id} has no HDX counterpart`);

// ---------- tehsils ----------
const hdxByDistrict = new Map();
for (const t of hdx.tehsils) {
  if (!hdxByDistrict.has(t.adm2_pcode)) hdxByDistrict.set(t.adm2_pcode, []);
  hdxByDistrict.get(t.adm2_pcode).push(t);
}
const districtOfHdxTehsil = new Map(hdx.tehsils.map((t) => [t.adm3_pcode, t.adm2_pcode]));

// An older tehsil that HDX lists, by exact name, under a *different* district has moved there.
const hdxTehsilsByProvinceName = new Map();
for (const t of hdx.tehsils) {
  const k = PROVINCE_BY_PCODE[t.adm1_pcode] + '|' + norm(t.adm3_name);
  if (!hdxTehsilsByProvinceName.has(k)) hdxTehsilsByProvinceName.set(k, []);
  hdxTehsilsByProvinceName.get(k).push(t);
}

const tehsils = [];
const placedOld = new Set();
const stats = { hdxOnly: 0, matchedExact: 0, matchedClose: 0, keptOld: 0, moved: 0 };
log('', '## Tehsils', '');
for (const d of districts) {
  const hList = hdxByDistrict.get(d._hdx.adm2_pcode) ?? [];
  const oldPool = KARACHI.has(d.id) ? [] : d._pool.flatMap((id) => oldTehsilsByDistrict.get(id) ?? []);
  const matches = matchNames(
    hList.map((t) => t.adm3_name),
    oldPool.map((t) => SAME_AS[`${t.districtId}|${clean(t.name)}`] ?? t.name),
  );
  const matchedOld = new Set(matches.map((m) => m.j));
  const notes = [];

  hList.forEach((h, i) => {
    const m = matches.find((x) => x.i === i);
    if (m) {
      if (m.d === 0) stats.matchedExact++;
      else { stats.matchedClose++; notes.push(`  - close match: HDX "${h.adm3_name}" = geo-pakistan "${oldPool[m.j].name}"`); }
    } else stats.hdxOnly++;
    const name = clean(h.adm3_name);
    tehsils.push({ districtId: d.id, name: NAME_FIX[name] ?? name, pcode: h.adm3_pcode });
  });

  oldPool.forEach((t, j) => { if (matchedOld.has(j)) placedOld.add(t.id); });

  // A new district shares its pool with the district it was carved from; only the original
  // district decides what happens to the older tehsils HDX does not list.
  if (d._pool.includes(d.id)) {
    oldPool.forEach((t, j) => {
      if (matchedOld.has(j)) return;
      if (SUPERSEDED.has(`${t.districtId}|${clean(t.name)}`)) {
        notes.push(`  - superseded: "${t.name}" no longer exists as one tehsil`);
        return;
      }
      const elsewhere = (hdxTehsilsByProvinceName.get(d.provinceId + '|' + norm(t.name)) ?? []).filter(
        (x) => x.adm2_pcode !== d._hdx.adm2_pcode,
      );
      if (elsewhere.length) {
        stats.moved++;
        const to = districts.find((x) => x._hdx.adm2_pcode === elsewhere[0].adm2_pcode);
        notes.push(`  - moved out: "${t.name}" is listed by HDX under ${to.id}`);
        return;
      }
      stats.keptOld++;
      tehsils.push({ districtId: d.id, name: NAME_FIX[clean(t.name)] ?? clean(t.name) });
      notes.push(`  - kept from geo-pakistan only: "${t.name}"${clean(t.name) !== t.name ? ` → "${clean(t.name)}"` : ''}`);
    });
  }

  if (notes.length) log(`- \`${d.id}\` (HDX ${hList.length})`, ...notes);
}
for (const id of SPLIT_PARENTS)
  for (const t of oldTehsilsByDistrict.get(id) ?? [])
    if (!placedOld.has(t.id)) throw new Error(`Tehsil "${t.name}" of split district ${id} was not placed`);

// ---------- assemble ----------
const seen = new Set();
const finalTehsils = tehsils.map((t) => {
  let id = `${t.districtId}-${slugAll(t.name)}`;
  for (let n = 2; seen.has(id); n++) id = `${t.districtId}-${slugAll(t.name)}-${n}`;
  seen.add(id);
  const rec = { id, districtId: t.districtId, name: t.name };
  if (t.pcode) rec.pcode = t.pcode;
  return rec;
});

const pcodeOf = new Map(hdx.provinces.map((p) => [PROVINCE_BY_PCODE[p.adm1_pcode], p.adm1_pcode]));
const byName = (a, b) => a.name.localeCompare(b.name, 'en');
const next = {
  meta: {
    dataVersion: new Date().toISOString().slice(0, 10),
    baseline:
      'Pakistan census 2017 units (geo-pakistan) merged with the OCHA/WFP COD-AB boundaries valid from September 2022',
    sources: [
      {
        name: 'OCHA / WFP Pakistan Subnational Administrative Boundaries (COD-AB)',
        url: 'https://data.humdata.org/dataset/cod-ab-pak',
        license: 'CC BY-IGO',
        note: 'Districts, tehsils and p-codes; boundaries valid from 2022-09-09, reviewed September 2024',
      },
      {
        name: 'aaqibmehran/geo-pakistan',
        url: 'https://github.com/aaqibmehran/geo-pakistan',
        license: 'MIT (declared in composer.json)',
        note: 'Provinces, divisions and the tehsils HDX does not list; last upstream update 2020',
      },
    ],
  },
  provinces: data.provinces.map((p) => ({ ...p, pcode: pcodeOf.get(p.id) })).sort(byName),
  divisions: data.divisions,
  districts: districts
    .map(({ _hdx, _pool, ...d }) => ({ id: d.id, provinceId: d.provinceId, divisionId: d.divisionId, name: d.name, pcode: d.pcode }))
    .sort(byName),
  tehsils: finalTehsils.sort(byName),
  localities: [],
};

log('', '## Totals', '', `- districts: ${next.districts.length}`, `- tehsils: ${next.tehsils.length}`,
  `- HDX tehsils matched exactly: ${stats.matchedExact}; by close spelling: ${stats.matchedClose}; HDX only: ${stats.hdxOnly}`,
  `- geo-pakistan tehsils kept (not in HDX): ${stats.keptOld}; moved to another district: ${stats.moved}`);

fs.writeFileSync(dataFile, JSON.stringify(next, null, 1) + '\n');
fs.writeFileSync(reportFile, report.join('\n') + '\n');
console.log(report.slice(-6).join('\n'));
