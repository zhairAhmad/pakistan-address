# pakistan-address

Pakistan's administrative hierarchy for address forms: **Province → Division → District → Tehsil**.

| Package | What it is |
| --- | --- |
| [`pakistan-address`](./packages/pakistan-address) | Typed JSON data + helpers. Zero dependencies, ESM and CJS. |
| [`pakistan-address-react`](./packages/pakistan-address-react) | Cascading select fields and a headless hook for React. |
| [`demo/`](./demo) | Static demo page (GitHub Pages). |

7 provinces/territories, 38 divisions, 172 districts, 681 tehsils: Punjab from the Board of Revenue notification of 18 December 2024, the other provinces from the Pakistan Bureau of Statistics Census 2023 lists, with OCHA/WFP COD-AB and older geo-pakistan data underneath. Not yet verified against official lists; see [DATA.md](./packages/pakistan-address/DATA.md) for coverage and known gaps. Corrections welcome: [CONTRIBUTING.md](./CONTRIBUTING.md).

Also included, as a separate opt-in entry point: an **unofficial** list of courier delivery areas (province, city, area, zone) taken from an online store's address form, with a switch between the two lists in the React package and the demo. It is not an administrative list; see [the package README](./packages/pakistan-address#unofficial-delivery-areas-optional).

```bash
npm install
npm test        # data validation + unit tests for both packages
npm run build
npm run demo    # builds and serves demo/ locally
```

MIT. Data derived from the [Punjab Board of Revenue notification of 18 December 2024](./packages/pakistan-address/data-sources/punjab-2024/README.md), the [PBS Census 2023 portal](https://census23.pbos.gov.pk/), [OCHA/WFP COD-AB](https://data.humdata.org/dataset/cod-ab-pak) (CC BY-IGO) and [aaqibmehran/geo-pakistan](https://github.com/aaqibmehran/geo-pakistan) (MIT); see [NOTICE](./packages/pakistan-address/NOTICE).
