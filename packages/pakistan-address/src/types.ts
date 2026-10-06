export interface Province {
  id: string;
  name: string;
  /** OCHA/WFP COD-AB place code (e.g. `PK6`), for linking to other datasets. */
  pcode?: string;
}

export interface Division {
  id: string;
  provinceId: string;
  name: string;
}

export interface District {
  id: string;
  provinceId: string;
  /** `null` where the district sits outside any division (Islamabad Capital Territory). */
  divisionId: string | null;
  name: string;
  /** OCHA/WFP COD-AB place code (e.g. `PK618`). */
  pcode?: string;
}

export interface Tehsil {
  id: string;
  districtId: string;
  name: string;
  /** OCHA/WFP COD-AB place code. Absent for tehsils the COD-AB data does not list. */
  pcode?: string;
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
