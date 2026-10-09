// Builds data/delivery-areas.json (the UNOFFICIAL delivery-areas dataset) from a local collection of an online
// store's address-form lists (province > city > zone). The raw collection is not part of the repository.
//
//   node scripts/build-delivery-data.mjs path/to/collection.json
//
// The collection is a local file (not in the repository) with provinces > cities > zones, marked "complete": true.
// Writes data/delivery-areas.json and data-sources/delivery/build-report.md. The official data (data/pakistan.json)
// is never touched.
//
// Shape: province > city > (area) > zone. The store lists big cities as many "City - Area" entries; those are split at
// the first " - " into one city with areas. Plain entries ("Bagh") stay cities with no areas.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv[2]) throw new Error('Usage: node scripts/build-delivery-data.mjs path/to/collection.json');
const input = path.resolve(process.argv[2]);
const src = JSON.parse(fs.readFileSync(input, 'utf8'));
if (!src.complete) throw new Error('The collection is marked incomplete; collect it again before building.');

// Our own ids, so the dataset does not depend on the store's identifiers. `officialProvinceId` links to data/pakistan.json.
const PROVINCES = {
  'Azad Kashmir': 'ajk',
  Balochistan: 'bl',
  'Federally Administered Tribal Areas': null,
  'Gilgit-Baltistan': 'gb',
  Islamabad: 'ict',
  'Khyber Pakhtunkhwa': 'kp',
  Punjab: 'pb',
  Sindh: 'sd',
};
const PROVINCE_ID = { 'Federally Administered Tribal Areas': 'fata' };

// Known mistakes in the source list, removed (recorded in the build report).
const DROP_CITY_IDS = new Map([['R80302384', 'Kamalia listed under Khyber Pakhtunkhwa with no zones; Kamalia is in Punjab (Toba Tek Singh), and a Punjab entry exists']]);

const clean = (s) => s.replace(/–|—/g, '-').replace(/\s+/g, ' ').trim();
const slug = (s) =>
  clean(s)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
const byName = (a, b) => a.name.localeCompare(b.name, 'en');
const SPLIT = /^(.+?) - (.+)$/;

const report = { renamed: [], dropped: [], merged: [], emptyPlaces: [], dedupedIds: [], splitCities: [], mainAreas: [], keptWhole: [] };
const provinces = [];
const cities = [];
const areas = [];
const zones = [];
const taken = new Set();

function uniqueId(base) {
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  if (id !== base) report.dedupedIds.push(id);
  taken.add(id);
  return id;
}

// Zones of one place, cleaned; a zone that differs only by capitalisation from an earlier one is merged into it.
function cleanZones(rawZones, label) {
  const seen = new Map();
  const out = [];
  for (const z of rawZones) {
    const name = clean(z.name);
    if (name !== z.name) report.renamed.push(`${JSON.stringify(z.name)} -> ${JSON.stringify(name)}`);
    const first = seen.get(name.toLowerCase());
    if (first !== undefined) {
      report.merged.push(`${JSON.stringify(name)} merged into ${JSON.stringify(first)} (${label})`);
      continue;
    }
    seen.set(name.toLowerCase(), name);
    out.push(name);
  }
  return out;
}

for (const p of src.provinces) {
  if (!(p.name in PROVINCES)) throw new Error(`Unmapped province "${p.name}"`);
  const provinceId = `dl-${PROVINCE_ID[p.name] ?? PROVINCES[p.name]}`;
  taken.add(provinceId);
  provinces.push({ id: provinceId, name: p.name, ...(PROVINCES[p.name] ? { officialProvinceId: PROVINCES[p.name] } : {}) });

  // Pass 1: gather what the store lists, grouped by city name.
  const places = new Map(); // lower-case city name -> { name, areas: [{ name, zones }], direct: zones | null }
  const place = (name) => {
    const key = name.toLowerCase();
    if (!places.has(key)) places.set(key, { name, areas: [], direct: null });
    return places.get(key);
  };
  for (const c of p.cities) {
    if (DROP_CITY_IDS.has(c.id)) {
      report.dropped.push(`${c.name} (${p.name}): ${DROP_CITY_IDS.get(c.id)}`);
      continue;
    }
    const name = clean(c.name);
    if (name !== c.name) report.renamed.push(`${JSON.stringify(c.name)} -> ${JSON.stringify(name)}`);
    const m = name.match(SPLIT);
    if (m) {
      place(m[1].trim()).areas.push({ name: m[2].trim(), fullName: name, zones: cleanZones(c.zones, name) });
    } else {
      place(name).direct = cleanZones(c.zones, name);
    }
  }

  // Pass 2: emit cities, areas and zones with our own ids.
  for (const pl of places.values()) {
    // A "group" with a single entry ("Bara - Khyber Agency") gains nothing from an area step: keep it as a plain city.
    if (pl.areas.length === 1 && pl.direct === null) {
      const only = pl.areas[0];
      report.keptWhole.push(only.fullName + ` (${p.name})`);
      pl.name = only.fullName;
      pl.direct = only.zones;
      pl.areas = [];
    }
    const cityId = uniqueId(`${provinceId}-${slug(pl.name)}`);
    cities.push({ id: cityId, provinceId, name: pl.name });

    if (!pl.areas.length) {
      if (!pl.direct.length) report.emptyPlaces.push(`${pl.name} (${p.name})`);
      for (const z of pl.direct) zones.push({ id: uniqueId(`${cityId}-${slug(z)}`), cityId, name: z });
      continue;
    }

    report.splitCities.push(`${pl.name} (${p.name}): ${pl.areas.length} areas`);
    const list = [...pl.areas];
    if (pl.direct !== null) {
      // The store also lists the bare city with its own zones: keep them in an area named after the city.
      list.push({ name: pl.name, zones: pl.direct });
      report.mainAreas.push(`${pl.name} (${p.name}): ${pl.direct.length} zones kept in an area named "${pl.name}"`);
    }
    for (const a of list) {
      const areaId = uniqueId(`${cityId}-${slug(a.name)}`);
      areas.push({ id: areaId, cityId, name: a.name });
      if (!a.zones.length) report.emptyPlaces.push(`${pl.name} - ${a.name} (${p.name})`);
      for (const z of a.zones) zones.push({ id: uniqueId(`${areaId}-${slug(z)}`), cityId, areaId, name: z });
    }
  }
}

provinces.sort(byName);
cities.sort(byName);
areas.sort(byName);
zones.sort(byName);

const collected = (src.source.match(/collected (\d{4}-\d{2}-\d{2})/) ?? [])[1];
const out = {
  meta: {
    dataVersion: collected,
    unofficial: true,
    label: 'Delivery areas (unofficial)',
    description:
      'Place names from the address form of an online store, collected in October 2026. ' +
      'They are courier delivery areas, not administrative units: not checked against any official source, ' +
      'and they do not map one-to-one to divisions, districts or tehsils.',
    source: { name: 'Address form of an online store', collected },
  },
  provinces,
  cities,
  areas,
  zones,
};

fs.writeFileSync(path.join(root, 'data', 'delivery-areas.json'), JSON.stringify(out) + '\n');

fs.mkdirSync(path.join(root, 'data-sources', 'delivery'), { recursive: true });
const list = (items, none = '- none') => items.map((r) => `- ${r}`).join('\n') || none;
const md = `# Delivery areas: build report

Built by \`scripts/build-delivery-data.mjs\` from a local collection of the address-form lists of an online store,
collected ${collected}. The raw collection is **not** in the repository.

Result: ${provinces.length} provinces, ${cities.length} cities, ${areas.length} areas, ${zones.length} zones.

## How the store's lists were reshaped
The store lists big cities as many separate "City - Area" entries. Each entry is split at the first " - ": the part
before is the **city**, the part after is an **area** of it. Plain entries stay cities with no areas, and their zones sit
directly under the city. A city is only split when the store lists two or more areas for it. So the levels are
province > city > area (only for the cities below) > zone.

Cities that were split (${report.splitCities.length}):
${list(report.splitCities)}

Entries that looked like "City - Area" but are the only one for that city, kept as plain cities (${report.keptWhole.length}):
${list(report.keptWhole)}

Cities listed both with areas and as a bare city with its own zones (${report.mainAreas.length}):
${list(report.mainAreas)}

## Other cleaning
Names: runs of spaces collapsed, ends trimmed, en dashes written as hyphens. Ids are this package's own
(\`dl-<province>-<city>-<area>-<zone>\`), not the store's.

### Removed
${list(report.dropped, '- nothing')}

### Merged: same name with different capitalisation (${report.merged.length})
${list(report.merged)}

### Names changed by cleaning (${report.renamed.length})
${list(report.renamed)}

### Places with no zones (${report.emptyPlaces.length})
${list(report.emptyPlaces)}

### Ids that needed a numeric suffix (${report.dedupedIds.length})
${list(report.dedupedIds)}
`;
fs.writeFileSync(path.join(root, 'data-sources', 'delivery', 'build-report.md'), md);

console.log(`delivery-areas.json: ${provinces.length} provinces, ${cities.length} cities, ${areas.length} areas, ${zones.length} zones`);
console.log(`split cities ${report.splitCities.length}, kept whole ${report.keptWhole.length}, main-areas ${report.mainAreas.length}, dropped ${report.dropped.length}, merged ${report.merged.length}, renamed ${report.renamed.length}, empty places ${report.emptyPlaces.length}, suffixed ids ${report.dedupedIds.length}`);
