# pakistan-address

Pakistan's administrative hierarchy — **Province → Division → District → Tehsil** — as typed JSON plus tiny helpers for cascading address dropdowns. Zero dependencies, ESM + CJS, framework-agnostic.

> **Status: 0.3.0.** Punjab follows the Board of Revenue notification of 18 December 2024; Balochistan follows the Board of Revenue notifications up to April 2026; Khyber Pakhtunkhwa, Sindh and Islamabad follow the official PBS census 2023 lists (about early 2023), plus two press-reported splits in Khyber Pakhtunkhwa. **Balochistan's July 2026 restructuring is not applied here.** Read [What is covered](#what-is-covered) and the [known gaps](./DATA.md#known-gaps) before relying on it, and always give users an "Other / not listed" escape hatch.

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

Data version **2026-10-07**. Sources, in order of authority: the [Punjab Board of Revenue notification of 18 December 2024](./data-sources/punjab-2024/README.md) (Punjab only), the [Pakistan Bureau of Statistics Census 2023 portal](https://census23.pbos.gov.pk/) (official lists for Balochistan, Islamabad, Khyber Pakhtunkhwa, Punjab and Sindh, about early 2023), [OCHA/WFP COD-AB](https://data.humdata.org/dataset/cod-ab-pak) (CC BY-IGO, valid from September 2022; also covers Gilgit-Baltistan and AJK) and [aaqibmehran/geo-pakistan](https://github.com/aaqibmehran/geo-pakistan) (census 2017 units, MIT). How they were merged is in [DATA.md](./DATA.md).

| Province / territory | Divisions | Districts | Tehsils |
| --- | --: | --: | --: |
| Azad Jammu & Kashmir | 3 | 10 | 32 |
| Balochistan | 9 | 39 | 167 |
| Gilgit-Baltistan | 3 | 14 | 24 |
| Islamabad Capital Territory | 0 | 1 | 1 |
| Khyber Pakhtunkhwa | 7 | 37 | 163 |
| Punjab | 10 | 41 | 156 |
| Sindh | 6 | 30 | 138 |
| **Total** | **38** | **172** | **681** |

- **Tehsil counts are not comparable across provinces.** Balochistan includes sub-tehsils, Karachi uses sub-divisions, Sindh uses talukas.
- **Cross-checked against official statistics (Oct 2026):** Sindh matches *Sindh in Figures 2025* (30 districts, 138 talukas). the AJK Statistical Year Book names the same 32 sub-divisions as here (its newer count is 35, unnamed), and Gilgit-Baltistan's official statistics report 10 districts against 14 here; see [data-sources/official-crosscheck](./data-sources/official-crosscheck/README.md).
- **Codes.** `pbsCode` is the PBS census code and `pcode` the OCHA COD-AB code. 38 tehsils in the five census provinces have no `pbsCode`: 18 were created by official notifications after the census (11 in Punjab, 7 in Balochistan) and 20 are kept from older data that the census list does not include (15 in Khyber Pakhtunkhwa, 5 in Balochistan). Codes are never invented. Twelve districts and two divisions that are newer than the census have none either; Gilgit-Baltistan and AJK have a `pcode` only. See [DATA.md](./DATA.md).
- **Alternate names.** Districts and tehsils can carry `altNames` ("Nawabshah", "DG Khan", old spellings) so your search box can match what people actually type.
- **Not covered in v1:** union councils, towns, chaks, mouzas, villages, postal codes, Urdu names.
- **Press-reported:** the tehsils of the Swat / Bar Swat split and the South Waziristan split in Khyber Pakhtunkhwa (the notifications were not located; the Election Commission confirms that Bar Swat exists). **Not included:** Balochistan's July 2026 restructuring (press-reported only; a `notice` on the province warns users) and Khyber Pakhtunkhwa's Paharpur. See [DATA.md](./DATA.md#known-gaps).
- **Province `notice`.** A province can carry a `notice` string to show users when it is selected; the demo and the React component do this for Balochistan.

Nothing here has yet been checked line-by-line against the Pakistan Bureau of Statistics or the provincial notifications. Treat it as a good starting list, not an authority.

## Unofficial delivery areas (optional)

A second, separate list for courier-style addresses: **Province → City → Area → Zone**, taken from the address form of an online store (collected October 2026). It exists because delivery addresses use places ("Lahore - Gulberg", "Islamabad - F-10") that the administrative hierarchy does not have.

```ts
import {
  getDeliveryProvinces, getDeliveryCities, getDeliveryAreas, getDeliveryZones, getDeliveryMeta,
} from 'pakistan-address/delivery';

const cities = getDeliveryCities('dl-pb');                    // 389 cities in Punjab, "Lahore" once
const areas = getDeliveryAreas('dl-pb-lahore');               // 103 areas: Agrics, Ali Town, Askari...
const zones = getDeliveryZones('dl-pb-lahore-ali-town');      // neighbourhoods of that area
getDeliveryZones('dl-ajk-bagh');                              // a city with no areas: zones come straight from the city
getDeliveryMeta().unofficial;                                 // always true
```

- **Areas exist only for large cities.** The store lists them as many "Lahore - Ali Town" entries; those were split at the first " - " into the city (Lahore) and its area (Ali Town). 17 cities are split (Lahore, Karachi, Islamabad, Rawalpindi, Gujranwala...). Every other city has no areas: `getDeliveryAreas(id)` is empty and `getDeliveryZones(cityId)` returns its zones. A name with only one entry for that city ("Gojra - Toba Tek Singh") is left whole.
- **It is not official and not an administrative list.** "Cities" are often towns, and Islamabad's areas are sectors and societies. They do not map to districts or tehsils, and nothing in it is checked against any official source.
- **It is a separate entry point.** `import ... from 'pakistan-address'` does not include it, so it costs nothing unless you import `pakistan-address/delivery` (about 1.2 MB unpacked).
- **Own ids.** `dl-pb` → `dl-pb-lahore` → `dl-pb-lahore-ali-town` → `dl-pb-lahore-ali-town-<zone>`. Provinces carry `officialProvinceId` (`pb`) where the official data has a matching one; the former Federally Administered Tribal Areas have none.
- Totals: 8 provinces, 682 cities, 407 areas, 11,356 zones. How it was split and cleaned is in [data-sources/delivery/build-report.md](./data-sources/delivery/build-report.md); the raw collection is not in the repository.
- Raw JSON: `import data from 'pakistan-address/delivery-areas.json'`.

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
