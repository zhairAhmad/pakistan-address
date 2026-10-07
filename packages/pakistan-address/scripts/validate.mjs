// Integrity checks for data/pakistan.json. Run on every PR: npm run validate
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'pakistan.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];
const err = (msg) => errors.push(msg);

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const LOCALITY_TYPES = new Set(['chak', 'town', 'mouza', 'village']);

if (!/^\d{4}-\d{2}-\d{2}$/.test(data.meta?.dataVersion ?? '')) err('meta.dataVersion must be YYYY-MM-DD');
if (!data.meta?.sources?.length) err('meta.sources must list at least one source');

const allIds = new Set();
function collect(kind, items) {
  const ids = new Map();
  for (const it of items) {
    if (!ID.test(it.id)) err(`${kind} id "${it.id}" is not lowercase-kebab`);
    if (ids.has(it.id)) err(`duplicate ${kind} id "${it.id}"`);
    if (allIds.has(it.id)) err(`id "${it.id}" is used by more than one kind of record`);
    if (typeof it.name !== 'string' || !it.name.trim() || it.name !== it.name.trim()) {
      err(`${kind} "${it.id}" has a missing or untrimmed name`);
    }
    ids.set(it.id, it);
    allIds.add(it.id);
  }
  return ids;
}

const provinces = collect('province', data.provinces);
const divisions = collect('division', data.divisions);
const districts = collect('district', data.districts);
const tehsils = collect('tehsil', data.tehsils);
const localities = collect('locality', data.localities);

for (const p of data.provinces) {
  if (p.notice !== undefined && (typeof p.notice !== 'string' || !p.notice.trim() || p.notice !== p.notice.trim())) {
    err(`province "${p.id}": notice must be a non-empty trimmed string`);
  }
}

// Alternate names: optional, trimmed, distinct from the name and from each other.
for (const [kind, items] of [['district', data.districts], ['tehsil', data.tehsils]]) {
  for (const it of items) {
    if (it.altNames === undefined) continue;
    if (!Array.isArray(it.altNames) || !it.altNames.length) { err(`${kind} "${it.id}": altNames must be a non-empty array`); continue; }
    const seen = new Set([it.name.toLowerCase()]);
    for (const a of it.altNames) {
      if (typeof a !== 'string' || !a.trim() || a !== a.trim()) err(`${kind} "${it.id}": bad alternate name ${JSON.stringify(a)}`);
      else if (seen.has(a.toLowerCase())) err(`${kind} "${it.id}": alternate name "${a}" repeats another name`);
      else seen.add(a.toLowerCase());
    }
  }
}

// PBS census codes: optional digit strings, unique per level.
for (const [kind, items] of [['province', data.provinces], ['division', data.divisions], ['district', data.districts], ['tehsil', data.tehsils]]) {
  const seen = new Set();
  for (const it of items) {
    if (it.pbsCode === undefined) continue;
    if (!/^\d+$/.test(it.pbsCode)) err(`${kind} "${it.id}": malformed pbsCode "${it.pbsCode}"`);
    if (seen.has(it.pbsCode)) err(`${kind} "${it.id}": duplicate pbsCode "${it.pbsCode}"`);
    seen.add(it.pbsCode);
  }
}

// p-codes are optional but, where present, must look right and be unique per level.
for (const [kind, items] of [['province', data.provinces], ['district', data.districts], ['tehsil', data.tehsils]]) {
  const seen = new Set();
  for (const it of items) {
    if (it.pcode === undefined) continue;
    if (!/^PK\d+$/.test(it.pcode)) err(`${kind} "${it.id}": malformed pcode "${it.pcode}"`);
    if (seen.has(it.pcode)) err(`${kind} "${it.id}": duplicate pcode "${it.pcode}"`);
    seen.add(it.pcode);
  }
}

for (const d of divisions.values()) {
  if (!provinces.has(d.provinceId)) err(`division "${d.id}": unknown provinceId "${d.provinceId}"`);
}
for (const d of districts.values()) {
  if (!provinces.has(d.provinceId)) err(`district "${d.id}": unknown provinceId "${d.provinceId}"`);
  if (d.divisionId !== null) {
    const div = divisions.get(d.divisionId);
    if (!div) err(`district "${d.id}": unknown divisionId "${d.divisionId}"`);
    else if (div.provinceId !== d.provinceId) err(`district "${d.id}": division is in a different province`);
  }
}
for (const t of tehsils.values()) {
  if (!districts.has(t.districtId)) err(`tehsil "${t.id}": unknown districtId "${t.districtId}"`);
}
for (const l of localities.values()) {
  if (!districts.has(l.districtId)) err(`locality "${l.id}": unknown districtId "${l.districtId}"`);
  if (l.tehsilId && tehsils.get(l.tehsilId)?.districtId !== l.districtId) {
    err(`locality "${l.id}": tehsilId is missing or in another district`);
  }
  if (!LOCALITY_TYPES.has(l.type)) err(`locality "${l.id}": unknown type "${l.type}"`);
}

// Same name twice under one parent is almost always a copy-paste error.
function noSiblingDuplicates(kind, items, parentKey) {
  const seen = new Set();
  for (const it of items) {
    const k = `${it[parentKey]}|${it.name.toLowerCase()}`;
    if (seen.has(k)) err(`${kind} "${it.name}" appears twice under "${it[parentKey]}"`);
    seen.add(k);
  }
}
noSiblingDuplicates('division', data.divisions, 'provinceId');
noSiblingDuplicates('district', data.districts, 'provinceId');
noSiblingDuplicates('tehsil', data.tehsils, 'districtId');

if (errors.length) {
  console.error(`data/pakistan.json: ${errors.length} problem(s)\n` + errors.map((e) => ` - ${e}`).join('\n'));
  process.exit(1);
}
console.log(
  `data/pakistan.json OK: ${provinces.size} provinces, ${divisions.size} divisions, ` +
    `${districts.size} districts, ${tehsils.size} tehsils, ${localities.size} localities`,
);
