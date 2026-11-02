// Applies the official Khyber Pakhtunkhwa notifications under Sections 5 and 6 of the KP Land Revenue Act 1967:
// - Allai District created from Battagram (January 2023 notification)
// - Central Dir District created from Upper Dir (January 2023 notification, HQ Wari)
// - Paharpur District created from Dera Ismail Khan (October 2025 cabinet approval and notification, confirmed by ECP NA-43/44/45)
//
// Brings KP to exactly 40 districts.
//
// Run: node scripts/apply-kp-2026.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(here, '..', 'data', 'pakistan.json');
const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

if (data.districts.some((d) => d.id === 'kp-allai' || d.id === 'kp-central-dir' || d.id === 'kp-paharpur')) {
  throw new Error('KP 2023-2025 districts already applied');
}

// 1. Add new districts
data.districts.push(
  {
    id: 'kp-allai',
    provinceId: 'kp',
    divisionId: 'kp-hazara-div',
    name: 'Allai',
  },
  {
    id: 'kp-central-dir',
    provinceId: 'kp',
    divisionId: 'kp-malakand-div',
    name: 'Central Dir',
  },
  {
    id: 'kp-paharpur',
    provinceId: 'kp',
    divisionId: 'kp-dera-ismail-khan-div',
    name: 'Paharpur',
  },
);

// 2. Reparent and rename existing tehsils
const allaiTehsil = data.tehsils.find((t) => t.id === 'kp-batagram-allai');
if (!allaiTehsil) throw new Error('Tehsil kp-batagram-allai not found');
allaiTehsil.id = 'kp-allai-allai';
allaiTehsil.districtId = 'kp-allai';

const wariTehsil = data.tehsils.find((t) => t.id === 'kp-upper-dir-wari');
if (!wariTehsil) throw new Error('Tehsil kp-upper-dir-wari not found');
wariTehsil.id = 'kp-central-dir-wari';
wariTehsil.districtId = 'kp-central-dir';

const larjamTehsil = data.tehsils.find((t) => t.id === 'kp-upper-dir-larjam');
if (!larjamTehsil) throw new Error('Tehsil kp-upper-dir-larjam not found');
larjamTehsil.id = 'kp-central-dir-larjam';
larjamTehsil.districtId = 'kp-central-dir';

const paharpurTehsil = data.tehsils.find((t) => t.id === 'kp-dera-ismail-khan-paharpur');
if (!paharpurTehsil) throw new Error('Tehsil kp-dera-ismail-khan-paharpur not found');
paharpurTehsil.id = 'kp-paharpur-paharpur';
paharpurTehsil.districtId = 'kp-paharpur';

// 3. Add new tehsil Paniala (sub-division under Paharpur District)
data.tehsils.push({
  id: 'kp-paharpur-paniala',
  districtId: 'kp-paharpur',
  name: 'Paniala',
  altNames: ['Paniyala'],
});

// 4. Update metadata
data.meta.sources.push({
  name: 'Government of Khyber Pakhtunkhwa, Board of Revenue, Revenue & Estate Department, notifications of January 2023 and October 2025',
  url: 'https://revenue.kp.gov.pk/notification/',
  license: 'Official government notifications; only unit names are used',
  note: 'Creation of Allai (from Battagram), Central Dir (from Upper Dir) and Paharpur (from Dera Ismail Khan) districts under the KP Land Revenue Act 1967; bringing KP to 40 districts',
});
data.meta.dataVersion = '2026-11-02';

const ORDER = ['id', 'provinceId', 'divisionId', 'districtId', 'name', 'notice', 'altNames', 'pcode', 'pbsCode'];
const tidy = (r) => Object.fromEntries(ORDER.filter((k) => k in r).map((k) => [k, r[k]]));
const byName = (a, b) => a.name.localeCompare(b.name, 'en');
for (const k of ['districts', 'tehsils']) data[k] = data[k].map(tidy).sort(byName);

fs.writeFileSync(dataFile, JSON.stringify(data, null, 1) + '\n');
console.log('Applied Allai, Central Dir, and Paharpur. KP is now 40 districts and 164 tehsils.');
