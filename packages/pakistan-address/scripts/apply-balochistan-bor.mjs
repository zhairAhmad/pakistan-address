// One-time merge of the Balochistan Board of Revenue notifications (data-sources/balochistan-bor/README.md)
// into data/pakistan.json. After this, data/pakistan.json is edited directly (see CONTRIBUTING.md);
// re-running overwrites later edits.
//
//   node scripts/apply-balochistan-bor.mjs
//
// The notifications are the official changes since the census 2023 frame, up to 29 April 2026. Rules:
// - Ids are kept when a unit is only renamed. A tehsil that moves to another district gets an id under its new district.
// - Nothing is invented: new units have no pcode or pbsCode. A removed unit's codes are dropped, except where the
//   unit is the same one under a new name (Phelawagh -> Qadirabad keeps both codes).
// - The July 2026 restructuring (press-reported only) is NOT applied.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(here, '..', 'data', 'pakistan.json');
const reportFile = path.join(here, '..', 'data-sources', 'balochistan-bor', 'apply-report.md');

const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const log = [];
const note = (s) => log.push(s);

const division = (id) => data.divisions.find((x) => x.id === id);
const district = (id) => data.districts.find((x) => x.id === id);
const tehsil = (id) => data.tehsils.find((x) => x.id === id);
const must = (v, what) => {
  if (!v) throw new Error(`Not found: ${what}`);
  return v;
};
const has = (list, id) => list.some((x) => x.id === id);

// ---- divisions -------------------------------------------------------------------------------------------------
note('## Divisions', '');
must(division('bl-sibi-div'), 'bl-sibi-div').name = 'Sevi';
note('- **Sibi** division renamed **Sevi** (notification 13, 29 Apr 2026). The id `bl-sibi-div` is kept.');
if (has(data.divisions, 'bl-koh-e-suleman-div')) throw new Error('already applied');
data.divisions.push({ id: 'bl-koh-e-suleman-div', provinceId: 'bl', name: 'Koh-e-Suleman' });
note('- Added the **Koh-e-Suleman** division, headquarters Rakhni (notification 11, 26 Feb 2026): Barkhan, Kohlu, Upper Dera Bugti.');
must(district('bl-barkhan'), 'barkhan').divisionId = 'bl-koh-e-suleman-div';
must(district('bl-kohlu'), 'kohlu').divisionId = 'bl-koh-e-suleman-div';
note('- Barkhan (from Loralai division) and Kohlu (from Sibi/Sevi division) moved to Koh-e-Suleman.');

// ---- new districts ----------------------------------------------------------------------------------------------
note('', '## New districts', '');
const newDistricts = [
  { id: 'bl-hub', divisionId: 'bl-kalat-div', name: 'Hub', why: 'from Lasbela, in force 1 Sep 2022 (notification 2)' },
  { id: 'bl-usta-muhammad', divisionId: 'bl-naseerabad-div', name: 'Usta Muhammad', why: 'from Jaffarabad, 13 Sep 2022 (notification 3)' },
  { id: 'bl-tump', divisionId: 'bl-makran-div', name: 'Tump', why: 'from Kech, 24 Feb 2026 (notification 9)' },
  { id: 'bl-barshore', divisionId: 'bl-quetta-div', name: 'Barshore', why: 'from Pishin, 12 Mar 2026 (notification 12); the notification does not name a division, so it stays with Pishin' },
  { id: 'bl-upper-dera-bugti', divisionId: 'bl-koh-e-suleman-div', name: 'Upper Dera Bugti', why: 'from Dera Bugti, 26 Feb 2026 (notification 10), headquarters Baiker' },
];
for (const { why, ...d } of newDistricts) {
  data.districts.push({ provinceId: 'bl', ...d });
  note(`- **${d.name}** (\`${d.id}\`, division \`${d.divisionId}\`): ${why}.`);
}

// ---- tehsils: moves, renames, removals, additions -----------------------------------------------------------------
note('', '## Tehsils', '');
const move = (oldId, toDistrict, newName, altNames) => {
  const t = must(tehsil(oldId), oldId);
  const from = t.districtId;
  const name = newName ?? t.name;
  const id = `${toDistrict}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  if (has(data.tehsils, id)) throw new Error(`id exists: ${id}`);
  t.id = id;
  t.districtId = toDistrict;
  if (newName) t.name = newName;
  if (altNames) t.altNames = altNames;
  note(`- Moved **${name}** from \`${from}\` to \`${toDistrict}\` (id \`${oldId}\` -> \`${id}\`).`);
};
const rename = (id, name, altNames, why) => {
  const t = must(tehsil(id), id);
  const old = t.name;
  t.name = name;
  t.altNames = altNames;
  note(`- Renamed **${old}** to **${name}** (\`${id}\`, id kept)${why ? `: ${why}` : ''}.`);
};
const remove = (id, why) => {
  const t = must(tehsil(id), id);
  data.tehsils.splice(data.tehsils.indexOf(t), 1);
  note(`- Removed **${t.name}** (\`${id}\`): ${why}.`);
};
const add = (id, districtId, name, why) => {
  if (has(data.tehsils, id)) throw new Error(`id exists: ${id}`);
  data.tehsils.push({ id, districtId, name });
  note(`- Added **${name}** to \`${districtId}\`: ${why}.`);
};

// Hub district (notification 2)
for (const n of ['hub', 'gaddani', 'sonmiani', 'dureji']) move(`bl-lasbela-${n}`, 'bl-hub');
const sonmiani = must(tehsil('bl-hub-sonmiani'), 'sonmiani');
sonmiani.altNames = [...new Set([...(sonmiani.altNames ?? []), 'Sonmiani (Winder)', 'Winder'])];
rename('bl-lasbela-lairi', 'Liari', ['Lairi'], 'spelling in notification 2');

// Usta Muhammad district (notification 3)
move('bl-jaffarabad-usta-mohammad', 'bl-usta-muhammad', 'Usta Muhammad', ['Usta Mohammad']);
move('bl-jaffarabad-gandakha', 'bl-usta-muhammad');

// Awaran (notification 4), Kohlu (5), Nushki (6)
rename('bl-awaran-jhal-jhao', 'Jhao', ['Jhal Jhao', 'Jhal Jao'], 'notification 4 names Tehsil Jhao and Tehsil Korak Jhao');
add('bl-kohlu-sufaid', 'bl-kohlu', 'Sufaid', 'sub-tehsil, headquarters Rehmanabad (notification 5)');
rename('bl-nushki-dak', 'Daak', ['Dak'], 'upgraded from sub-tehsil to tehsil (notification 6)');
add('bl-nushki-ahmed-wal', 'bl-nushki', 'Ahmed Wal', 'new tehsil (notification 6)');
add('bl-nushki-kishingi', 'bl-nushki', 'Kishingi', 'new sub-tehsil (notification 6)');

// Pishin, Karbala, Barshore (notifications 8 and 12)
add('bl-pishin-karbala', 'bl-pishin', 'Karbala', 'new tehsil, bifurcated from Tehsil Pishin (notification 8)');
rename('bl-pishin-huramzai', 'Hurramzai', ['Huramzai', 'Hurram Zai'], 'spelling in notification 12');
rename('bl-pishin-karezat', 'Karezat Khanozai', ['Karezat'], 'name in notification 12');
move('bl-pishin-barshore', 'bl-barshore');

// Tump and Kech (notification 9)
move('bl-kech-tump', 'bl-tump');
move('bl-kech-mand', 'bl-tump');
rename('bl-kech-kech', 'Turbat', ['Kech', 'Kech (Turbat)'], 'notification 9 names Tehsil Turbat');
rename('bl-kech-balnigor', 'Balnigore', ['Balnigor'], 'spelling in notification 9');

// Dera Bugti and Upper Dera Bugti (notifications 7 and 10)
rename('bl-dera-bugti-sangsillah', 'Sangseelah', ['Sangsillah'], 'spelling in notification 10');
const qadirabad = must(tehsil('bl-dera-bugti-qadirabad'), 'qadirabad');
const phelawagh = must(tehsil('bl-dera-bugti-phelawagh'), 'phelawagh');
qadirabad.pcode = phelawagh.pcode; // the OCHA code of Phelawagh: the same tehsil under its new name
qadirabad.altNames = ['Phelawagh'];
remove('bl-dera-bugti-phelawagh', 'the old name of Qadirabad (notification 7, 24 Sep 2025); its OCHA code moved to Qadirabad');
move('bl-dera-bugti-qadirabad', 'bl-upper-dera-bugti');
move('bl-dera-bugti-pir-koh', 'bl-upper-dera-bugti');
note('  - Pir Koh is kept although notification 10 names only the Pirkoh sub-division, not a tehsil; unconfirmed.');
for (const [id, name] of [
  ['bl-dera-bugti-baiker', 'Baiker'],
  ['bl-dera-bugti-loti', 'Loti'],
  ['bl-dera-bugti-malam', 'Malam'],
]) {
  remove(id, `notification 10 lists the tehsils of Dera Bugti and Upper Dera Bugti, and ${name} is a union council or town there, not a tehsil`);
}
add('bl-upper-dera-bugti-chief-ali-muhammad', 'bl-upper-dera-bugti', 'Chief Ali Muhammad', 'new tehsil (notification 10)');
add('bl-upper-dera-bugti-nabi-dad-shaheed', 'bl-upper-dera-bugti', 'Nabi Dad Shaheed', 'new tehsil, at Qalandari (notification 10)');
add('bl-upper-dera-bugti-sar-loop', 'bl-upper-dera-bugti', 'Sar Loop', 'new tehsil (notification 10)');

// ---- province notice, sources, version ------------------------------------------------------------------------
const bl = must(data.provinces.find((p) => p.id === 'bl'), 'bl');
bl.notice =
  "Balochistan's divisions, districts and tehsils follow the Board of Revenue notifications up to April 2026. The restructuring reported for July 2026 is not applied yet, so your division or district may be missing or listed differently. Choose \"Other / not listed\" if you cannot find it.";
data.meta.sources.push({
  name: 'Government of Balochistan, Revenue Department (Board of Revenue), notifications 2021 to April 2026',
  url: 'https://bor.balochistan.gov.pk/notifications/',
  license: 'Official government notifications; only unit names are used',
  note: 'Hub, Usta Muhammad, Tump, Barshore and Upper Dera Bugti districts, the Koh-e-Suleman division, Sibi renamed Sevi, and new tehsils; see data-sources/balochistan-bor/',
});
data.meta.dataVersion = new Date().toISOString().slice(0, 10);

// ---- checks and write -----------------------------------------------------------------------------------------
const ORDER = ['id', 'provinceId', 'divisionId', 'districtId', 'name', 'notice', 'altNames', 'pcode', 'pbsCode'];
const tidy = (r) => Object.fromEntries(ORDER.filter((k) => k in r).map((k) => [k, r[k]]));
const byName = (a, b) => a.name.localeCompare(b.name, 'en');
for (const k of ['divisions', 'districts', 'tehsils']) data[k] = data[k].map(tidy).sort(byName);

const blDistricts = data.districts.filter((d) => d.provinceId === 'bl');
const blDivisions = data.divisions.filter((d) => d.provinceId === 'bl');
const blTehsils = data.tehsils.filter((t) => blDistricts.some((d) => d.id === t.districtId));
const expect = (what, got, want) => {
  if (got !== want) throw new Error(`${what}: ${got}, expected ${want}`);
};
expect('Balochistan divisions', blDivisions.length, 9);
expect('Balochistan districts', blDistricts.length, 39);
expect('divisions overall', data.divisions.length, 38);
expect('districts overall', data.districts.length, 172);
expect('tehsils overall', data.tehsils.length, 681);

const names = (id) => data.tehsils.filter((t) => t.districtId === id).map((t) => t.name).sort().join(', ');
note('', '## Tehsils of the districts touched', '');
for (const id of ['bl-hub', 'bl-lasbela', 'bl-usta-muhammad', 'bl-jaffarabad', 'bl-tump', 'bl-kech', 'bl-barshore', 'bl-pishin', 'bl-dera-bugti', 'bl-upper-dera-bugti', 'bl-nushki', 'bl-kohlu']) {
  note(`- **${district(id).name}**: ${names(id)}`);
}
note('', '## Totals', '', `- Balochistan: ${blDivisions.length} divisions, ${blDistricts.length} districts, ${blTehsils.length} tehsils.`, `- All provinces: ${data.divisions.length} divisions, ${data.districts.length} districts, ${data.tehsils.length} tehsils.`);

fs.writeFileSync(dataFile, JSON.stringify(data, null, 1) + '\n');
fs.writeFileSync(reportFile, '# Balochistan: what was applied\n\nGenerated by `scripts/apply-balochistan-bor.mjs` from the notifications in [README.md](./README.md).\n\n' + log.join('\n') + '\n');
console.log(log.slice(-4).join('\n'));
