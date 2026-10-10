// One-time merge of the PRESS-REPORTED July 2026 restructuring of Balochistan at division and district level
// (data-sources/balochistan-bor/july-2026-press-report.md). The Revenue Department notification itself has not been
// found, so everything here is labelled press-reported. After this, data/pakistan.json is edited directly
// (see CONTRIBUTING.md); re-running overwrites later edits.
//
//   node scripts/apply-balochistan-july-2026-press.mjs
//
// Applied (four outlets agree on the division and district level: 11 divisions, 41 districts): Quetta split into Quetta
// East and West, Mastung to Quetta division, Wadh district, Kalat division abolished (Khuzdar and Lasbela divisions),
// Pishin division, Kachhi to Sevi division, Ziarat and Harnai to Loralai division, renames (Makuran, Sevi, North and South
// Dera Bugti). Tehsil level: only moves of tehsils that already exist, and Brewery (named by Dawn and Quetta Voice).
// Not applied: the many other new sub-divisions and tehsils, which the reports give inconsistently.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(here, '..', 'data', 'pakistan.json');
const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const division = (id) => data.divisions.find((x) => x.id === id);
const district = (id) => data.districts.find((x) => x.id === id);
const tehsil = (id) => data.tehsils.find((x) => x.id === id);
const must = (v, what) => {
  if (!v) throw new Error(`Not found: ${what}`);
  return v;
};
if (district('bl-quetta-west')) throw new Error('already applied');

// ---- divisions ---------------------------------------------------------------------------------------------------
data.divisions.splice(data.divisions.indexOf(must(division('bl-kalat-div'), 'kalat')), 1); // abolished
for (const [id, name] of [['bl-khuzdar-div', 'Khuzdar'], ['bl-lasbela-div', 'Lasbela'], ['bl-pishin-div', 'Pishin']]) {
  data.divisions.push({ id, provinceId: 'bl', name });
}
must(division('bl-makran-div'), 'makran').name = 'Makuran';

// ---- new districts (no codes: never invented) --------------------------------------------------------------------
data.districts.push(
  { id: 'bl-quetta-west', provinceId: 'bl', divisionId: 'bl-quetta-div', name: 'Quetta West' },
  { id: 'bl-wadh', provinceId: 'bl', divisionId: 'bl-khuzdar-div', name: 'Wadh' },
);

// ---- renames (ids kept) ------------------------------------------------------------------------------------------
const rename = (id, name, altNames) => {
  const d = must(district(id), id);
  d.name = name;
  d.altNames = altNames;
};
// Quetta East continues the old district: its headquarters stays at the existing Deputy Commissioner's office.
rename('bl-quetta', 'Quetta East', ['Quetta']);
rename('bl-dera-bugti', 'South Dera Bugti', ['Dera Bugti', 'Lower Dera Bugti']);
rename('bl-upper-dera-bugti', 'North Dera Bugti', ['Upper Dera Bugti']);
rename('bl-sibi', 'Sevi', ['Sibi']);

// ---- which division each district belongs to ----------------------------------------------------------------------
const placement = {
  'bl-khuzdar-div': ['bl-khuzdar', 'bl-kalat', 'bl-surab', 'bl-wadh'],
  'bl-lasbela-div': ['bl-lasbela', 'bl-hub', 'bl-awaran'],
  'bl-quetta-div': ['bl-quetta', 'bl-quetta-west', 'bl-mastung'],
  'bl-pishin-div': ['bl-pishin', 'bl-killa-abdullah', 'bl-chaman', 'bl-barshore'],
  'bl-sibi-div': ['bl-sibi', 'bl-dera-bugti', 'bl-kachhi'],
  'bl-loralai-div': ['bl-loralai', 'bl-musakhel', 'bl-duki', 'bl-ziarat', 'bl-harnai'],
};
for (const [divId, ids] of Object.entries(placement)) {
  for (const id of ids) must(district(id), id).divisionId = divId;
}

// ---- tehsils: moves of existing units, and Brewery ----------------------------------------------------------------
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const move = (oldId, toDistrict) => {
  const t = must(tehsil(oldId), oldId);
  const id = `${toDistrict}-${slug(t.name)}`;
  if (tehsil(id)) throw new Error(`id exists: ${id}`);
  t.id = id;
  t.districtId = toDistrict;
};
// Quetta West: Kuchlak, Panjpai, Brewery (new). Quetta East keeps Quetta City, Quetta Saddar and Sariab.
move('bl-quetta-kuchlak', 'bl-quetta-west');
move('bl-quetta-panjpai', 'bl-quetta-west');
data.tehsils.push({ id: 'bl-quetta-west-brewery', districtId: 'bl-quetta-west', name: 'Brewery' });
// Wadh district: Wadh, Ornach, Naal, separated from Khuzdar.
for (const n of ['wadh', 'ornach', 'naal']) move(`bl-khuzdar-${n}`, 'bl-wadh');

// ---- province notice and sources ---------------------------------------------------------------------------------------
must(data.provinces.find((p) => p.id === 'bl'), 'bl').notice =
  'Balochistan follows the Board of Revenue notifications up to April 2026. The divisions and districts of the July 2026 restructuring are applied from press reports, because the notification itself has not been found, and its new sub-divisions and tehsils are not included, so your tehsil may be missing or listed differently. Choose "Other / not listed" if you cannot find it.';
data.meta.sources.push({
  name: 'Press reports of the Balochistan Revenue Department restructuring of July 2026 (Dawn, ProPakistani, The Express Tribune, Quetta Voice)',
  url: 'https://propakistani.pk/2026/07/12/balochistan-govt-notifies-new-divisions-and-districts/',
  license: 'Facts only; no text copied',
  note: 'Division and district level only (11 divisions, 41 districts); the notification itself was not located; see data-sources/balochistan-bor/july-2026-press-report.md',
});
data.meta.dataVersion = new Date().toISOString().slice(0, 10);

// ---- checks and write ---------------------------------------------------------------------------------------------
const ORDER = ['id', 'provinceId', 'divisionId', 'districtId', 'name', 'notice', 'altNames', 'pcode', 'pbsCode'];
const tidy = (r) => Object.fromEntries(ORDER.filter((k) => k in r).map((k) => [k, r[k]]));
const byName = (a, b) => a.name.localeCompare(b.name, 'en');
for (const k of ['divisions', 'districts', 'tehsils']) data[k] = data[k].map(tidy).sort(byName);

const blDivisions = data.divisions.filter((d) => d.provinceId === 'bl');
const blDistricts = data.districts.filter((d) => d.provinceId === 'bl');
const expect = (what, got, want) => {
  if (got !== want) throw new Error(`${what}: ${got}, expected ${want}`);
};
expect('Balochistan divisions', blDivisions.length, 11);
expect('Balochistan districts', blDistricts.length, 41);
expect('tehsils overall', data.tehsils.length, 682);
for (const d of blDistricts) must(blDivisions.find((x) => x.id === d.divisionId), `division of ${d.id}`);
for (const dv of blDivisions) {
  if (!blDistricts.some((d) => d.divisionId === dv.id)) throw new Error(`empty division ${dv.id}`);
}

fs.writeFileSync(dataFile, JSON.stringify(data, null, 1) + '\n');
for (const dv of blDivisions) {
  console.log(`${dv.name}: ${blDistricts.filter((d) => d.divisionId === dv.id).map((d) => d.name).join(', ')}`);
}
console.log(`Balochistan: ${blDivisions.length} divisions, ${blDistricts.length} districts. All: ${data.divisions.length} / ${data.districts.length} / ${data.tehsils.length}`);
