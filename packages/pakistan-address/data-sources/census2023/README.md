# PBS Population Census 2023: administrative hierarchy

| | |
| --- | --- |
| Publisher | Pakistan Bureau of Statistics (PBS), Government of Pakistan |
| Where | Digital Census 2023 portal, <https://census23.pbos.gov.pk/> |
| What | The Province > Division > District > Tehsil dropdown lists (names and PBS codes) |
| Retrieved | 7 October 2026 |
| Coverage | Balochistan, Islamabad, Khyber Pakhtunkhwa, Punjab, Sindh. Gilgit-Baltistan and AJK are not in the census |
| Reflects | The administrative frame used for the census, about early 2023 |
| Licence | The portal states none. This is official government statistics; only unit names and codes are used, with attribution |

## How it was read

The portal fills each dropdown from the previous selection by calling its own `LoadDropDownData(code, level, ...)` function (levels 2, 3 and 4 for division, district and tehsil). Each list was read once, in the page, with a short pause between requests (172 requests for the run that produced the file; two earlier attempts that called an old, unused loader returned no usable data and were stopped). Nothing below tehsil level was read, and nothing was downloaded from PBS file servers.

`census2023-hierarchy.json` has the shape `{ provinces: { <name>: [ { code, name, districts: [ { code, name, tehsils: [ { code, name } ] } ] } ] } }`. The province codes (not in the file) are 1 KP, 2 Punjab, 3 Sindh, 4 Balochistan and 6 Islamabad.

`../../scripts/apply-census2023.mjs` merged it into `data/pakistan.json`; its changes are listed in `apply-report.md`.
