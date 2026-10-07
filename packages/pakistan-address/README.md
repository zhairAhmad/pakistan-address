# pakistan-address

Pakistan's administrative hierarchy — **Province → Division → District → Tehsil** — as typed JSON plus tiny helpers for cascading address dropdowns. Zero dependencies, ESM + CJS, framework-agnostic.

> **Status: 0.1.0, follows the official PBS census 2023 lists plus a few press-reported changes; not verified against the provincial notifications.** Several provinces have changed since the census (notably Balochistan, whose divisions and districts were reorganised in 2026 and are not yet updated here). Read [What is covered](#what-is-covered) and the [known gaps](./DATA.md#known-gaps) before relying on it, and always give users an "Other / not listed" escape hatch.

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
  "districts":  [{ "id": "sd-shaheed-benazir-abad", "provinceId": "sd", "divisionId": "sd-shaheed-benazir-abad-div", "name": "Shaheed Benazir Abad", "altNames": ["Nawabshah"], "pcode": "PK7…" }],
  "tehsils":    [{ "id": "pb-vehari-mailsi", "districtId": "pb-vehari", "name": "Mailsi" }],
  "localities": []
}
```

## What is covered

Data version **2026-10-07**. Three sources, in order of authority: the [Pakistan Bureau of Statistics Census 2023 portal](https://census23.pbos.gov.pk/) (official lists for Balochistan, Islamabad, Khyber Pakhtunkhwa, Punjab and Sindh, about early 2023), [OCHA/WFP COD-AB](https://data.humdata.org/dataset/cod-ab-pak) (CC BY-IGO, valid from September 2022; also covers Gilgit-Baltistan and AJK) and [aaqibmehran/geo-pakistan](https://github.com/aaqibmehran/geo-pakistan) (census 2017 units, MIT). How they were merged is in [DATA.md](./DATA.md).

| Province / territory | Divisions | Districts | Tehsils |
| --- | --: | --: | --: |
| Azad Jammu & Kashmir | 3 | 10 | 32 |
| Balochistan | 8 | 34 | 164 |
| Gilgit-Baltistan | 3 | 14 | 24 |
| Islamabad Capital Territory | 0 | 1 | 1 |
| Khyber Pakhtunkhwa | 7 | 37 | 163 |
| Punjab | 10 | 40 | 146 |
| Sindh | 7 | 30 | 138 |
| **Total** | **38** | **166** | **668** |

- **Tehsil counts are not comparable across provinces.** Balochistan includes sub-tehsils, Karachi uses sub-divisions, Sindh uses talukas.
- **Codes.** `pbsCode` is the PBS census code and `pcode` the OCHA COD-AB code. A tehsil with neither (about 20 in the five census provinces, plus the Gilgit-Baltistan and AJK tehsils, which have a `pcode` only) comes from older data and is unverified; see [DATA.md](./DATA.md).
- **Alternate names.** Districts and tehsils can carry `altNames` ("Nawabshah", "DG Khan", old spellings) so your search box can match what people actually type.
- **Not covered in v1:** union councils, towns, chaks, mouzas, villages, postal codes, Urdu names.
- **Partly updated from press reports.** Four Punjab districts and the Gujrat division, and the Swat and South Waziristan splits in Khyber Pakhtunkhwa, are included (the notifications themselves were not located). **Not included:** Balochistan's July 2026 restructuring (a `notice` on the province warns users), Punjab's Taunsa and Khyber Pakhtunkhwa's Paharpur. The census lists Sindh with 6 divisions where the data keeps a 7th (Banbhore). See [DATA.md](./DATA.md#known-gaps).
- **Province `notice`.** A province can carry a `notice` string to show users when it is selected; the demo and the React component do this for Balochistan.

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
