# pakistan-address

[![npm (core)](https://img.shields.io/npm/v/pakistan-address.svg?label=pakistan-address)](https://www.npmjs.com/package/pakistan-address)
[![npm (react)](https://img.shields.io/npm/v/pakistan-address-react.svg?label=pakistan-address-react)](https://www.npmjs.com/package/pakistan-address-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Demo](https://img.shields.io/badge/demo-live%20on%20GitHub%20Pages-brightgreen)](https://zhairahmad.github.io/pakistan-address/)

Pakistan's administrative hierarchy — **Province → Division → District → Tehsil** — as typed JSON plus tiny zero-dependency helpers, with cascading address dropdowns and a headless hook for React.

[**Live Interactive Demo**](https://zhairahmad.github.io/pakistan-address/) · [**pakistan-address on npm**](https://www.npmjs.com/package/pakistan-address) · [**pakistan-address-react on npm**](https://www.npmjs.com/package/pakistan-address-react)

---

## Packages in this Repository

| Package | npm | Description |
| --- | --- | --- |
| [`pakistan-address`](./packages/pakistan-address) | [![npm](https://img.shields.io/npm/v/pakistan-address.svg)](https://www.npmjs.com/package/pakistan-address) | Typed administrative JSON dataset + fast helpers. Zero dependencies, ESM + CommonJS, full TypeScript definitions. |
| [`pakistan-address-react`](./packages/pakistan-address-react) | [![npm](https://img.shields.io/npm/v/pakistan-address-react.svg)](https://www.npmjs.com/package/pakistan-address-react) | Cascading address dropdowns (`<AddressFields>`), accessible comboboxes, and headless hook (`useAddressCascade`) for React 18+. |
| [`demo/`](./demo) | _GitHub Pages_ | Interactive static demo showcasing cascading selection and courier delivery areas. |

---

## Installation

```bash
# Core data and helpers (zero dependencies)
npm install pakistan-address

# Ready-made React component and headless hooks
npm install pakistan-address-react pakistan-address
```

---

## Quick Start

### 1. Core Package (`pakistan-address`)

```ts
import { getProvinces, getDivisions, getDistricts, getTehsils } from 'pakistan-address';

// 1. Get all 7 provinces/territories
const provinces = getProvinces(); // [{ id: 'pb', name: 'Punjab' }, ...]

// 2. Cascade down by parent ID
const divisions = getDivisions('pb'); // Punjab's divisions
const districts = getDistricts('pb-multan-div'); // Khanewal, Lodhran, Multan, Vehari
const tehsils   = getTehsils('pb-vehari'); // Burewala, Mailsi, Vehari
```

CommonJS is supported out of the box:

```js
const { getProvinces, getDistrictsByProvince } = require('pakistan-address');
```

#### Core API Reference

| Function | Returns | Description |
| --- | --- | --- |
| `getProvinces()` | `Province[]` | All 7 provinces and territories |
| `getDivisions(provinceId)` | `Division[]` | Divisions of a province (empty for Islamabad) |
| `getDistricts(divisionId)` | `District[]` | Districts belonging to a division |
| `getDistrictsByProvince(provinceId)` | `District[]` | All districts of a province (for territories without divisions or when division is unlisted) |
| `getTehsils(districtId)` | `Tehsil[]` | Tehsils of a district |
| `getLocalities(districtId, type?)` | `Locality[]` | Reserved for v2 (chaks, towns, mouzas; always `[]` in v1) |
| `getProvince(id)` `getDivision(id)` `getDistrict(id)` `getTehsil(id)` | `Record \| undefined` | Single record lookup by ID |
| `getMeta()` | `Meta` | Metadata including `dataVersion`, `baseline`, and `sources` |

---

### 2. React Package (`pakistan-address-react`)

Ready-made `<AddressFields>` handles cascading dropdowns, search filtering, accessibility, and an "Other / not listed" escape hatch automatically:

```tsx
import { useState } from 'react';
import { AddressFields, type ResolvedAddress } from 'pakistan-address-react';

export function CheckoutForm() {
  const [address, setAddress] = useState<ResolvedAddress>();

  return (
    <form>
      <AddressFields
        name="shipping"
        onChange={(_value, resolved) => setAddress(resolved)}
      />
    </form>
  );
}
```

The `resolved` callback parameter provides both human-readable names and stable IDs:

```json
{
  "province": "Punjab",
  "division": "Multan",
  "district": "Vehari",
  "tehsil": "Mailsi",
  "addressLine": "House 5, Street 2, Main Market",
  "ids": {
    "province": "pb",
    "division": "pb-multan-div",
    "district": "pb-vehari",
    "tehsil": "pb-vehari-mailsi"
  }
}
```

#### Headless Hook (`useAddressCascade`)

Prefer using your own UI library (e.g. `react-select`, MUI, Radix, Tailwind)? Use the headless hook:

```tsx
import { useAddressCascade, OTHER } from 'pakistan-address-react';

function CustomCascade() {
  const cascade = useAddressCascade();

  return (
    <div>
      <select
        value={cascade.value.province.id ?? ''}
        onChange={(e) => cascade.select('province', e.target.value || null)}
      >
        <option value="">Select Province</option>
        {cascade.levels.province.options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {cascade.levels.division.visible && (
        <select
          value={cascade.value.division.id ?? ''}
          onChange={(e) => cascade.select('division', e.target.value || null)}
        >
          <option value="">Select Division</option>
          {cascade.levels.division.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
    </div>
  );
}
```

---

## Key Features

- **4-Level Administrative Hierarchy:** Full Province → Division → District → Tehsil coverage across all 7 provinces and territories.
- **Stable Hierarchical IDs:** Predictable lowercase kebab-case IDs prefixed by province (`pb` → `pb-multan-div` → `pb-vehari` → `pb-vehari-mailsi`). Store IDs to protect your records from future spelling corrections.
- **"Other / not listed" Escape Hatch:** Built into the React package at every level below province. If a boundary was recently split or unlisted, users can enter free-text without breaking form submission.
- **Searchable Combobox Dropdowns:** Long lists (>10 options) automatically receive a keyboard-friendly search box. Alternate spellings and names are indexed (e.g., searching "Nawabshah" finds *Shaheed Benazir Abad*).
- **Native `<select>` Fallback:** Pass `native` prop to `<AddressFields native />` if you prefer native HTML dropdowns or zero-JavaScript form submissions.
- **Raw Normalized JSON:** Direct import supported via `import data from 'pakistan-address/data.json' with { type: 'json' }`.
- **Zero Dependencies:** The core `pakistan-address` library has zero runtime dependencies.

---

## Data Coverage (v0.4.0)

Data version **2026-11-02**. Current totals: **7 provinces/territories, 40 divisions, 177 districts, 683 tehsils**.

| Province / territory | Divisions | Districts | Tehsils | Primary source |
| --- | --: | --: | --: | --- |
| Azad Jammu & Kashmir | 3 | 10 | 32 | OCHA COD-AB & AJK Statistical Year Book |
| Balochistan | 11 | 41 | 168 | BoR notifications up to April 2026 + verified July 2026 restructuring |
| Gilgit-Baltistan | 3 | 14 | 24 | Department of Home & Prisons notification (Land Revenue Act) |
| Islamabad Capital Territory | 0 | 1 | 1 | PBS Census 2023 |
| Khyber Pakhtunkhwa | 7 | 40 | 164 | PBS Census 2023 + BoR notifications & ECP delimitation |
| Punjab | 10 | 41 | 156 | **Board of Revenue notification of 18 December 2024 (exact match)** |
| Sindh | 6 | 30 | 138 | PBS Census 2023 lists & *Sindh in Figures 2025* |
| **Total** | **40** | **177** | **683** | |

> [!NOTE]
> Tehsil counts are not uniform across Pakistan: Balochistan includes sub-tehsils, Karachi uses sub-divisions, and Sindh uses talukas. See [DATA.md](./packages/pakistan-address/DATA.md) for full provenance notes, known gaps, and verification details.

---

## Unofficial Courier Delivery Areas (Optional)

In addition to the official administrative hierarchy, an optional courier delivery dataset is included (**Province → City → Area → Zone**) derived from e-commerce delivery lists. This covers delivery areas like *"Lahore - Gulberg"* or *"Islamabad - F-10"*:

- **Totals:** 8 provinces, 682 cities, 407 areas, 11,356 zones.
- **Separate Entry Points:** Kept in separate entry points so that core imports remain lightweight:
  ```ts
  // Core helpers
  import { getDeliveryCities, getDeliveryAreas, getDeliveryZones } from 'pakistan-address/delivery';

  // React components
  import { DeliveryAddressFields, SwitchableAddressFields } from 'pakistan-address-react/delivery';
  ```
- **`<SwitchableAddressFields />`:** Allows users to toggle between official administrative units and courier delivery areas.

---

## Repository Development

```bash
# Clone and install dependencies
git clone https://github.com/zhairAhmad/pakistan-address.git
cd pakistan-address
npm install

# Run data validation and test suite (89 tests across both packages)
npm test

# Build packages (CJS, ESM, and TypeScript declarations)
npm run build -w pakistan-address
npm run build -w pakistan-address-react

# Run the local interactive demo
npm run demo
```

---

## Contributing

Found an outdated district, missing tehsil, or misspelled name? Corrections with official citations (gazettes, Board of Revenue notifications, Pakistan Bureau of Statistics lists) are very welcome!

Please check [CONTRIBUTING.md](./CONTRIBUTING.md) and open a pull request.

---

## License & Attribution

- Code & project data: [MIT License](./LICENSE).
- Data sources: Derived from [Punjab Board of Revenue notification of 18 December 2024](./packages/pakistan-address/data-sources/punjab-2024/README.md), [PBS Census 2023](https://census23.pbos.gov.pk/), [OCHA/WFP COD-AB](https://data.humdata.org/dataset/cod-ab-pak) (CC BY-IGO), and [aaqibmehran/geo-pakistan](https://github.com/aaqibmehran/geo-pakistan) (MIT).
- See [NOTICE](./packages/pakistan-address/NOTICE) and [DATA.md](./packages/pakistan-address/DATA.md) for full credits.
