// One-time import of the vendored aaqibmehran/geo-pakistan PHP seeders into
// data/pakistan.json. After the initial import, data/pakistan.json is the source
// of truth and is edited directly (see CONTRIBUTING.md); re-running this script
// would overwrite those edits.
//
//   node scripts/import-geo-pakistan.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, '..', 'data-sources', 'geo-pakistan');
const outFile = path.join(here, '..', 'data', 'pakistan.json');

function parseSeeder(file) {
  const src = fs.readFileSync(path.join(srcDir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  return src
    .split(/'id'\s*=>/)
    .slice(1)
    .map((chunk) => {
      const rec = { id: parseInt(chunk, 10) };
      const re = /'(\w+)'\s*=>\s*('(?:[^'\\]|\\.)*'|-?[\d.]+|null)/g;
      let m;
      while ((m = re.exec(chunk))) {
        const v = m[2];
        rec[m[1]] = v === 'null' ? null : v.startsWith("'") ? v.slice(1, -1).replace(/\\'/g, "'").trim() : Number(v);
      }
      return rec;
    });
}

const slug = (s) =>
  s
    .replace(/\(.*?\)/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const raw = {
  provinces: parseSeeder('PakistanProvinceTableSeeder.php'),
  divisions: parseSeeder('PakistanDivisionsTableSeeder.php'),
  districts: parseSeeder('PakistanDistrictTableSeeder.php'),
  tehsils: parseSeeder('PakistanTehsilTableSeeder.php'),
};

const PROVINCE_IDS = {
  Balochistan: 'bl',
  Islamabad: 'ict',
  'Khyber Pakhtunkhwa': 'kp',
  Punjab: 'pb',
  Sindh: 'sd',
  'Gilgit Baltistan': 'gb',
  'Azad Jammu and Kashmir': 'ajk',
};
const PROVINCE_NAMES = { ict: 'Islamabad Capital Territory', gb: 'Gilgit-Baltistan', ajk: 'Azad Jammu & Kashmir' };

// Structural fix: the source files Mirpur / Muzaffarabad / Poonch divisions under
// Gilgit-Baltistan, but they are Azad Jammu & Kashmir divisions (and every AJK
// district in the source already points at them).
const DIVISION_PROVINCE_OVERRIDE = { Mirpur: 'ajk', Muzaffarabad: 'ajk', Poonch: 'ajk' };

const byName = (a, b) => a.name.localeCompare(b.name, 'en');

const provinceId = new Map(); // raw id -> id
const provinces = raw.provinces.map((p) => {
  const id = PROVINCE_IDS[p.name];
  if (!id) throw new Error(`Unmapped province ${p.name}`);
  provinceId.set(p.id, id);
  return { id, name: PROVINCE_NAMES[id] ?? p.name };
});

const divisionId = new Map();
const divisions = raw.divisions.map((d) => {
  const pid = DIVISION_PROVINCE_OVERRIDE[d.name] ?? provinceId.get(d.province_id);
  const id = `${pid}-${slug(d.name)}-div`;
  divisionId.set(d.id, id);
  return { id, provinceId: pid, name: d.name };
});

const districtId = new Map();
const districts = raw.districts.map((d) => {
  const pid = provinceId.get(d.province_id);
  const id = `${pid}-${slug(d.name)}`;
  districtId.set(d.id, id);
  return { id, provinceId: pid, divisionId: divisionId.get(d.division_id) ?? null, name: d.name };
});

const seen = new Set();
const tehsils = raw.tehsils.map((t) => {
  const did = districtId.get(t.district_id);
  let id = `${did}-${slug(t.name)}`;
  for (let n = 2; seen.has(id); n++) id = `${did}-${slug(t.name)}-${n}`;
  seen.add(id);
  return { id, districtId: did, name: t.name };
});

const data = {
  meta: {
    dataVersion: new Date().toISOString().slice(0, 10),
    baseline: 'Pakistan census 2017 administrative units',
    sources: [
      {
        name: 'aaqibmehran/geo-pakistan',
        url: 'https://github.com/aaqibmehran/geo-pakistan',
        license: 'MIT (declared in composer.json)',
        note: 'Provinces, divisions, districts and tehsils; last upstream update 2020',
      },
    ],
  },
  provinces: provinces.sort(byName),
  divisions: divisions.sort(byName),
  districts: districts.sort(byName),
  tehsils: tehsils.sort(byName),
  localities: [],
};

fs.writeFileSync(outFile, JSON.stringify(data, null, 1) + '\n');
console.log(
  `provinces ${provinces.length}, divisions ${divisions.length}, districts ${districts.length}, tehsils ${tehsils.length}`,
);
