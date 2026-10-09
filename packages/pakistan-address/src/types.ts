export interface Province {
  id: string;
  name: string;
  /** A caution to show users when this province is selected (for example, that its structure recently changed). */
  notice?: string;
  /** OCHA/WFP COD-AB place code (e.g. `PK6`), for linking to other datasets. */
  pcode?: string;
  /** Pakistan Bureau of Statistics Census 2023 code. */
  pbsCode?: string;
}

export interface Division {
  id: string;
  provinceId: string;
  name: string;
  /** Pakistan Bureau of Statistics Census 2023 code. */
  pbsCode?: string;
}

export interface District {
  id: string;
  provinceId: string;
  /** `null` where the district sits outside any division (Islamabad Capital Territory). */
  divisionId: string | null;
  name: string;
  /** Other names people use or search for (e.g. "Nawabshah" for Shaheed Benazir Abad). */
  altNames?: string[];
  /** OCHA/WFP COD-AB place code (e.g. `PK618`). */
  pcode?: string;
  /** Pakistan Bureau of Statistics Census 2023 code. */
  pbsCode?: string;
}

export interface Tehsil {
  id: string;
  districtId: string;
  name: string;
  /** Other spellings or names for the tehsil. */
  altNames?: string[];
  /** OCHA/WFP COD-AB place code. Absent for tehsils the COD-AB data does not list. */
  pcode?: string;
  /** Pakistan Bureau of Statistics Census 2023 code. Absent for units the census does not list. */
  pbsCode?: string;
}

/** Reserved for v2 (chaks, towns, mouzas). Always empty in v1. */
export type LocalityType = 'chak' | 'town' | 'mouza' | 'village';

export interface Locality {
  id: string;
  districtId: string;
  /** Optional: set once tehsil-level records exist for the locality. */
  tehsilId?: string;
  name: string;
  type: LocalityType;
}

export interface DataSource {
  name: string;
  url: string;
  license: string;
  note?: string;
}

export interface DataMeta {
  /** ISO date (YYYY-MM-DD) of the last data change. */
  dataVersion: string;
  baseline: string;
  sources: DataSource[];
}

export interface PakistanData {
  meta: DataMeta;
  provinces: Province[];
  divisions: Division[];
  districts: District[];
  tehsils: Tehsil[];
  localities: Locality[];
}

/** A province or territory as listed in the unofficial delivery-areas dataset. */
export interface DeliveryProvince {
  id: string;
  name: string;
  /** Id of the matching record in the official data (`getProvince`). Absent where there is none (the former FATA). */
  officialProvinceId?: string;
}

/** A city, town or delivery area ("Lahore - Gulberg"). Not an administrative unit. */
export interface DeliveryCity {
  id: string;
  provinceId: string;
  name: string;
}

/** An area of a large delivery city ("Ali Town" in Lahore). Only some cities have areas. */
export interface DeliveryArea {
  id: string;
  cityId: string;
  name: string;
}

/** A neighbourhood. Belongs to an area if its city has areas, otherwise directly to the city. */
export interface DeliveryZone {
  id: string;
  cityId: string;
  /** Present when the city is split into areas. */
  areaId?: string;
  name: string;
}

export interface DeliveryMeta {
  /** ISO date (YYYY-MM-DD) the lists were collected. */
  dataVersion: string;
  /** Always `true`: this dataset is not an official list. */
  unofficial: true;
  label: string;
  description: string;
  source: { name: string; collected: string };
}

export interface DeliveryData {
  meta: DeliveryMeta;
  provinces: DeliveryProvince[];
  cities: DeliveryCity[];
  areas: DeliveryArea[];
  zones: DeliveryZone[];
}
