# pakistan-address

Pakistan's administrative hierarchy — **Province → Division → District → Tehsil** — as typed JSON plus tiny helpers for cascading address dropdowns. Zero dependencies, ESM + CJS, framework-agnostic.

> **Status: 0.1.0, not yet verified against official lists.** Districts and tehsils follow the OCHA/WFP COD-AB boundaries (valid from September 2022), divisions come from older 2017-era data, and some later changes are not applied. Read [What is covered](#what-is-covered) and [DATA.md](./DATA.md) before relying on it, and always give users an "Other / not listed" escape hatch.

## Install

```bash
npm install pakistan-address
```

## Usage

```ts
import { getProvinces, getDivisions, getDistricts, getTehsils } from 'pakistan-address';

const provinces = getProvinces();                                  // 7, sorted by name: [{ id: 'ajk', … }, …]
const divisions = getDivisions('pb');                              // Punjab's 9 divisions
const districts = getDistricts('pb-multan-div');                   // Khanewal, Lodhran, Multan, Vehari
const tehsils   = getTehsils('pb-vehari');                         // Burewala, Mailsi, Vehari
```

```js
// CommonJS
const { getTehsils } = require('pakistan-address');
```

### API

| Function | Returns |
| --- | --- |
| `getProvinces()` | All 7 provinces/territories |
| `getDivisions(provinceId)` | Divisions of a province (`[]` for Islamabad) |
| `getDistricts(divisionId)` | Districts of a division |
| `getDistrictsByProvince(provinceId)` | All districts of a province — use where there are no divisions (Islamabad) or the user's division isn't listed |
| `getTehsils(districtId)` | Tehsils of a district |
| `getLocalities(districtId, type?)` | Reserved for v2 (chaks, towns, mouzas). Always `[]` in v1 |
| `getProvince(id)` `getDivision(id)` `getDistrict(id)` `getTehsil(id)` | One record by id, or `undefined` |
| `getMeta()` | `{ dataVersion, baseline, sources }` |

Unknown ids return `[]` / `undefined`. Returned arrays are copies, so you can sort or mutate them.

### IDs

Stable, lowercase, kebab-case, and prefixed by the province: `pb` → `pb-multan-div` (division) → `pb-vehari` (district) → `pb-vehari-mailsi` (tehsil). Province ids: `bl`, `ict`, `kp`, `pb`, `sd`, `gb`, `ajk`. Store ids, not names, if you want your records to survive spelling fixes. Ids are not renamed once released; a record that is wrong is corrected in place, and one that ceases to exist is removed with a changelog entry.

### Raw data

```js
import data from 'pakistan-address/data.json' with { type: 'json' };
```

The flat, normalized shape (every record points at its parent by id):

```json
{
  "meta": { "dataVersion": "2026-10-06", "baseline": "…", "sources": [ … ] },
  "provinces":  [{ "id": "pb", "name": "Punjab" }],
  "divisions":  [{ "id": "pb-multan-div", "provinceId": "pb", "name": "Multan" }],
  "districts":  [{ "id": "pb-vehari", "provinceId": "pb", "divisionId": "pb-multan-div", "name": "Vehari" }],
  "tehsils":    [{ "id": "pb-vehari-mailsi", "districtId": "pb-vehari", "name": "Mailsi" }],
  "localities": []
}
```

## What is covered

Data version **2026-10-06**. Districts and tehsils: [OCHA/WFP COD-AB](https://data.humdata.org/dataset/cod-ab-pak) (CC BY-IGO, valid from September 2022), merged with [aaqibmehran/geo-pakistan](https://github.com/aaqibmehran/geo-pakistan) (census 2017 units, MIT), which also provides the divisions. How the two were merged is in [DATA.md](./DATA.md).

| Province / territory | Divisions | Districts | Tehsils |
| --- | --: | --: | --: |
| Azad Jammu & Kashmir | 3 | 10 | 32 |
| Balochistan | 7 | 35 | 140 |
| Gilgit-Baltistan | 3 | 14 | 24 |
| Islamabad Capital Territory | 0 | 1 | 1 |
| Khyber Pakhtunkhwa | 7 | 35 | 157 |
| Punjab | 9 | 36 | 146 |
| Sindh | 7 | 29 | 125 |
| **Total** | **36** | **160** | **625** |

- **Tehsil counts are not comparable across provinces.** Balochistan includes sub-tehsils, Karachi uses the town scheme, Sindh uses talukas.
- **Records with a `pcode`** match the OCHA COD-AB data. About 50 tehsils have no `pcode`: they come from geo-pakistan only and are unverified.
- **Not covered in v1:** union councils, towns, chaks, mouzas, villages, postal codes, Urdu names.
- **Known gaps:** units created after the COD-AB baseline (for example Punjab's Murree, Kot Addu, Wazirabad and Talagang, and Keamari in Karachi) are not included; divisions of the new districts were inferred. See [DATA.md](./DATA.md#known-gaps).

Nothing here has yet been checked line-by-line against the Pakistan Bureau of Statistics or the provincial notifications. Treat it as a good starting list, not an authority.

## Using it in a form

Recommended pattern:

1. Chained selects, each filtered by the previous one.
2. An **"Other / not listed"** option at every level below province, which reveals a free-text input.
3. A separate **full address / landmark** field. Don't try to derive the street from the data.
4. Store ids *and* the resolved names.

For React, [`pakistan-address-react`](../pakistan-address-react) implements exactly this.

## Sources & licence

Code and data in this package: MIT. Upstream data © its authors; see [NOTICE](./NOTICE) and [DATA.md](./DATA.md).

## Contributing corrections

Spotted a wrong, missing or renamed unit? Open a PR that edits `data/pakistan.json` and cites an official source (PBS, a provincial notification, a gazette). See [CONTRIBUTING.md](../../CONTRIBUTING.md).
