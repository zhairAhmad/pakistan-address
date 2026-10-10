// One-time, small corrections from the AJK Statistical Year Book 2024, Tables 7.10 and 7.11 (Local Government & Rural
// Development Department, 2023): 3 divisions, 10 districts, 32 sub-divisions, 278 union councils.
//
//   node scripts/apply-ajk-yearbook-2024.mjs
//
// The 32 sub-divisions listed there match the 32 AJK tehsils in the data. This script only
// - renames the district "Hattian Bala" to its official name "Jhelum Valley" (id kept, old names as alternate names), and
// - adds the year book's spellings of nine tehsils as alternate names (primary names are unchanged).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(here, '..', 'data', 'pakistan.json');
const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const district = data.districts.find((d) => d.provinceId === 'ajk' && d.name === 'Hattian Bala');
if (!district) throw new Error('Hattian Bala not found (already applied?)');
district.name = 'Jhelum Valley';
// the new primary name must not also be an alternate name
district.altNames = [...new Set(['Hattian Bala', 'Hattian', ...(district.altNames ?? [])])].filter((n) => n !== district.name);

const spelling = {
  'Dulliya Jattan': 'Darlia Jattan',
  'Khui Ratta': 'Khuiratta',
  'Fatehpur Thakiala': 'Fatehpur Thakyala',
  'Dhir Kot': 'Dhirkot',
  'Khurshid Abad': 'Khurshidabad',
  Mong: 'Mung',
  'Tarar Khal': 'Trarkhal',
  Baluch: 'Baloch',
  Dadyal: 'Dudyal',
};
const ajkDistricts = new Set(data.districts.filter((d) => d.provinceId === 'ajk').map((d) => d.id));
let n = 0;
for (const t of data.tehsils) {
  if (!ajkDistricts.has(t.districtId) || !(t.name in spelling)) continue;
  t.altNames = [...new Set([...(t.altNames ?? []), spelling[t.name]])];
  n++;
}
if (n !== Object.keys(spelling).length) throw new Error(`expected ${Object.keys(spelling).length} tehsils, changed ${n}`);

data.meta.sources.push({
  name: 'Azad Jammu & Kashmir Statistical Year Book 2024, Tables 7.10 and 7.11 (Local Government & Rural Development Department)',
  url: 'https://www.pndajk.gov.pk/uploadfiles/downloads/AJ&K%20Statistical%20Year%20Book%202024(1).pdf',
  license: 'Official government statistics; only unit names are used',
  note: '3 divisions, 10 districts and 32 sub-divisions (tehsils) by name; matches the data, with spelling variants kept as alternate names',
});
data.meta.dataVersion = new Date().toISOString().slice(0, 10);

const ORDER = ['id', 'provinceId', 'divisionId', 'districtId', 'name', 'notice', 'altNames', 'pcode', 'pbsCode'];
const tidy = (r) => Object.fromEntries(ORDER.filter((k) => k in r).map((k) => [k, r[k]]));
const byName = (a, b) => a.name.localeCompare(b.name, 'en');
for (const k of ['districts', 'tehsils']) data[k] = data[k].map(tidy).sort(byName);

fs.writeFileSync(dataFile, JSON.stringify(data, null, 1) + '\n');
console.log('Hattian Bala renamed to Jhelum Valley; spellings added to', n, 'AJK tehsils.');
