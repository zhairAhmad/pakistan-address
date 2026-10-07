# pakistan-address

Pakistan's administrative hierarchy for address forms: **Province → Division → District → Tehsil**.

| Package | What it is |
| --- | --- |
| [`pakistan-address`](./packages/pakistan-address) | Typed JSON data + helpers. Zero dependencies, ESM and CJS. |
| [`pakistan-address-react`](./packages/pakistan-address-react) | Cascading select fields and a headless hook for React. |
| [`demo/`](./demo) | Static demo page (GitHub Pages). |

7 provinces/territories, 38 divisions, 166 districts, 668 tehsils, from the Pakistan Bureau of Statistics Census 2023 lists merged with OCHA/WFP COD-AB and older geo-pakistan data. Not yet verified against official lists; see [DATA.md](./packages/pakistan-address/DATA.md) for coverage and known gaps. Corrections welcome: [CONTRIBUTING.md](./CONTRIBUTING.md).

```bash
npm install
npm test        # data validation + unit tests for both packages
npm run build
npm run demo    # builds and serves demo/ locally
```

MIT. Data derived from the [PBS Census 2023 portal](https://census23.pbos.gov.pk/), [OCHA/WFP COD-AB](https://data.humdata.org/dataset/cod-ab-pak) (CC BY-IGO) and [aaqibmehran/geo-pakistan](https://github.com/aaqibmehran/geo-pakistan) (MIT); see [NOTICE](./packages/pakistan-address/NOTICE).
