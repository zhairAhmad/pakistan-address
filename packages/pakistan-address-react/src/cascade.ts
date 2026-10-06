import {
  getDistrict,
  getDistricts,
  getDistrictsByProvince,
  getDivision,
  getDivisions,
  getProvince,
  getProvinces,
  getTehsil,
  getTehsils,
} from 'pakistan-address';

/** Value of the "Other / not listed" option at any level. */
export const OTHER = '__other__';

export type Level = 'province' | 'division' | 'district' | 'tehsil';
const LEVELS: Level[] = ['province', 'division', 'district', 'tehsil'];

export interface LevelValue {
  /** A record id, `OTHER`, or `null` when nothing is chosen. */
  id: string | null;
  /** Free text, used when `id` is `OTHER` or when the level has no list to pick from. */
  text: string;
}

export interface AddressValue {
  province: LevelValue;
  division: LevelValue;
  district: LevelValue;
  tehsil: LevelValue;
  /** House number, street, landmark. Never derived from the data. */
  addressLine: string;
}

export interface Option {
  value: string;
  label: string;
}

export interface LevelState {
  /** Whether the level is relevant yet (e.g. no district until a province is chosen). */
  visible: boolean;
  options: Option[];
  /** Show an "Other / not listed" entry in the list. */
  allowOther: boolean;
  /** Show a text input: "Other" is chosen, or there is nothing to pick from. */
  showText: boolean;
}

export interface ResolvedAddress {
  province: string;
  division: string;
  district: string;
  tehsil: string;
  addressLine: string;
  /** Ids of the levels picked from the lists (`null` for free-text or empty levels). */
  ids: Record<Level, string | null>;
}

const emptyLevel = (): LevelValue => ({ id: null, text: '' });

export const emptyAddress = (): AddressValue => ({
  province: emptyLevel(),
  division: emptyLevel(),
  district: emptyLevel(),
  tehsil: emptyLevel(),
  addressLine: '',
});

const toOptions = (items: { id: string; name: string }[]): Option[] =>
  items.map((i) => ({ value: i.id, label: i.name }));

const chosen = (v: LevelValue) => v.id !== null;
const isListed = (v: LevelValue) => v.id !== null && v.id !== OTHER;

/** What each of the four levels should look like for the given value. */
export function getLevelStates(value: AddressValue): Record<Level, LevelState> {
  const provinceId = isListed(value.province) ? value.province.id! : null;
  const divisions = provinceId ? getDivisions(provinceId) : [];
  // Provinces without divisions (Islamabad) skip straight to districts.
  const hasDivisions = divisions.length > 0;

  const divisionId = isListed(value.division) ? value.division.id! : null;
  // An unlisted division leaves the whole province's districts to choose from.
  const districts = divisionId
    ? getDistricts(divisionId)
    : provinceId && (!hasDivisions || value.division.id === OTHER)
      ? getDistrictsByProvince(provinceId)
      : [];

  const districtId = isListed(value.district) ? value.district.id! : null;
  const tehsils = districtId ? getTehsils(districtId) : [];

  const districtVisible = !!provinceId && (!hasDivisions || chosen(value.division));
  const tehsilVisible = districtVisible && chosen(value.district);

  return {
    province: { visible: true, options: toOptions(getProvinces()), allowOther: false, showText: false },
    division: {
      visible: hasDivisions,
      options: toOptions(divisions),
      allowOther: true,
      showText: value.division.id === OTHER,
    },
    district: {
      visible: districtVisible,
      options: toOptions(districts),
      allowOther: true,
      showText: value.district.id === OTHER,
    },
    tehsil: {
      visible: tehsilVisible,
      options: toOptions(tehsils),
      // A district with no tehsil data (or an unlisted one): text only.
      allowOther: tehsils.length > 0,
      showText: tehsilVisible && (tehsils.length === 0 || value.tehsil.id === OTHER),
    },
  };
}

/** Choose (or clear, with `null`) an option at a level. Levels below it are reset. */
export function selectLevel(value: AddressValue, level: Level, id: string | null): AddressValue {
  const next: AddressValue = { ...value, [level]: { id, text: '' } };
  for (const lower of LEVELS.slice(LEVELS.indexOf(level) + 1)) next[lower] = emptyLevel();
  return next;
}

export function setLevelText(value: AddressValue, level: Level, text: string): AddressValue {
  return { ...value, [level]: { ...value[level], text } };
}

/** Names (or the user's free text) for each level, ready to submit with a form. */
export function resolveAddress(value: AddressValue): ResolvedAddress {
  const name = (v: LevelValue, lookup: (id: string) => { name: string } | undefined) =>
    isListed(v) ? (lookup(v.id!)?.name ?? '') : v.text.trim();
  const id = (v: LevelValue) => (isListed(v) ? v.id : null);
  return {
    province: name(value.province, getProvince),
    division: name(value.division, getDivision),
    district: name(value.district, getDistrict),
    tehsil: name(value.tehsil, getTehsil),
    addressLine: value.addressLine.trim(),
    ids: {
      province: id(value.province),
      division: id(value.division),
      district: id(value.district),
      tehsil: id(value.tehsil),
    },
  };
}
