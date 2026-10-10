// One-time, small corrections from the official documents read on 2026-10-10 (data-sources/official-crosscheck/README.md).
// After this, data/pakistan.json is edited directly (see CONTRIBUTING.md); re-running overwrites later edits.
//
//   node scripts/apply-official-crosscheck-2026.mjs
//
// - Khyber Pakhtunkhwa: the district split from Swat is "Bar Swat" in the Election Commission's notification of 18 Feb 2026,
//   which cites the Board of Revenue notification Rev:VI/Bif/Swat/2025/2072-150 of 27 Jan 2026. Its tehsils are NOT
//   changed: no official list was found (press-reported only).
// - Peshawar: spellings of three tehsils follow the Board of Revenue notifications of 26 Dec 2019.
// Ids are kept; the previous names stay as alternate names.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(here, '..', 'data', 'pakistan.json');
const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const must = (v, what) => {
  if (!v) throw new Error(`Not found: ${what}`);
  return v;
};

const swat = must(data.districts.find((d) => d.id === 'kp-upper-swat'), 'kp-upper-swat');
swat.name = 'Bar Swat';
swat.altNames = ['Upper Swat', 'Upper Bar Swat'];

const rename = (id, name, altNames) => {
  const t = must(data.tehsils.find((x) => x.id === id), id);
  t.name = name;
  t.altNames = altNames;
};
rename('kp-peshawar-cham-kani', 'Chamkani', ['Cham Kani']);
rename('kp-peshawar-pishta-khara', 'Pishtakhara', ['Pishta Khara']);
rename('kp-peshawar-peshawar', 'Peshawar City', ['Peshawar']);

data.meta.sources.push(
  {
    name: 'Election Commission of Pakistan, Notification No.F.1(3)/2026-LGE-KP, 18 February 2026',
    url: 'https://ecp.gov.pk/storage/uploads/zR2pNbmDLyqbGvZkiVwo1a7vEPSmlo4yHywsGMJ2.pdf',
    license: 'Official government notification; only unit names are used',
    note: 'Names the districts Swat and Bar Swat and cites the Board of Revenue notification Rev:VI/Bif/Swat/2025/2072-150 of 27 January 2026',
  },
  {
    name: 'Government of Khyber Pakhtunkhwa, Board of Revenue, Revenue & Estate Department, Peshawar sub-division notifications of 26 December 2019 and 16 March 2020',
    url: 'https://revenue.kp.gov.pk/notification/sub-divisions-and-tehsils-in-district-peshawar/',
    license: 'Official government notification; only unit names are used',
    note: 'Badhber, Chamkani, Peshawar City, Pishtakhara, Shah Alam and Mathra tehsils of Peshawar',
  },
);
data.meta.dataVersion = new Date().toISOString().slice(0, 10);

const ORDER = ['id', 'provinceId', 'divisionId', 'districtId', 'name', 'notice', 'altNames', 'pcode', 'pbsCode'];
const tidy = (r) => Object.fromEntries(ORDER.filter((k) => k in r).map((k) => [k, r[k]]));
const byName = (a, b) => a.name.localeCompare(b.name, 'en');
for (const k of ['districts', 'tehsils']) data[k] = data[k].map(tidy).sort(byName);

fs.writeFileSync(dataFile, JSON.stringify(data, null, 1) + '\n');
console.log('Bar Swat renamed (id kp-upper-swat kept); 3 Peshawar tehsils respelled.');
