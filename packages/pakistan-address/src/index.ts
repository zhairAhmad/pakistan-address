import raw from '../data/pakistan.json';
import type {
  DataMeta,
  District,
  Division,
  Locality,
  LocalityType,
  PakistanData,
  Province,
  Tehsil,
} from './types';

export type * from './types';

const data = raw as PakistanData;

function groupBy<T>(items: readonly T[], key: (item: T) => string | null): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    if (k === null) continue;
    const list = map.get(k);
    if (list) list.push(item);
    else map.set(k, [item]);
  }
  return map;
}

function indexById<T extends { id: string }>(items: readonly T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

const provinceById = indexById(data.provinces);
const divisionById = indexById(data.divisions);
const districtById = indexById(data.districts);
const tehsilById = indexById(data.tehsils);

const divisionsByProvince = groupBy(data.divisions, (d) => d.provinceId);
const districtsByDivision = groupBy(data.districts, (d) => d.divisionId);
const districtsByProvince = groupBy(data.districts, (d) => d.provinceId);
const tehsilsByDistrict = groupBy(data.tehsils, (t) => t.districtId);
const localitiesByDistrict = groupBy(data.localities, (l) => l.districtId);

// Lists are returned as copies so callers can sort or mutate them freely.
const list = <T>(map: Map<string, T[]>, id: string): T[] => [...(map.get(id) ?? [])];

/** All provinces and territories, sorted by name. */
export const getProvinces = (): Province[] => [...data.provinces];

/** Divisions of a province. Empty for Islamabad Capital Territory. */
export const getDivisions = (provinceId: string): Division[] => list(divisionsByProvince, provinceId);

/** Districts of a division. */
export const getDistricts = (divisionId: string): District[] => list(districtsByDivision, divisionId);

/** Every district of a province, regardless of division. Use this for provinces without divisions. */
export const getDistrictsByProvince = (provinceId: string): District[] =>
  list(districtsByProvince, provinceId);

/** Tehsils of a district. Empty where no tehsil data exists (Islamabad, Gilgit-Baltistan, AJK). */
export const getTehsils = (districtId: string): Tehsil[] => list(tehsilsByDistrict, districtId);

/** Chaks, towns and mouzas of a district. Always empty in v1; reserved for v2. */
export const getLocalities = (districtId: string, type?: LocalityType): Locality[] =>
  list(localitiesByDistrict, districtId).filter((l) => !type || l.type === type);

export const getProvince = (id: string): Province | undefined => provinceById.get(id);
export const getDivision = (id: string): Division | undefined => divisionById.get(id);
export const getDistrict = (id: string): District | undefined => districtById.get(id);
export const getTehsil = (id: string): Tehsil | undefined => tehsilById.get(id);

/** Version, baseline and sources of the bundled data. */
export const getMeta = (): DataMeta => ({ ...data.meta, sources: data.meta.sources.map((s) => ({ ...s })) });
