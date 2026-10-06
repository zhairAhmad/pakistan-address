# Data notes

## Provenance

`data/pakistan.json` was built in two one-time steps, and is now the source of truth, edited directly by PR.

| Step | Source | What it provides |
| --- | --- | --- |
| 1. `scripts/import-geo-pakistan.mjs` | [aaqibmehran/geo-pakistan](https://github.com/aaqibmehran/geo-pakistan) (MIT declared in `composer.json`; last updated 2020; census 2017 units) | Provinces, **divisions**, and the first set of districts and tehsils |
| 2. `scripts/merge-hdx.mjs` | [OCHA / WFP COD-AB Pakistan](https://data.humdata.org/dataset/cod-ab-pak) (CC BY-IGO; valid from 2022-09-09, reviewed Sept 2024) | Which districts and tehsils exist (160 / 577), their p-codes, newer names |

The original files are kept in `data-sources/`. Re-running either script overwrites later edits.

COD-AB has no divisions, so divisions still come only from step 1.

## How the two sources were merged

Every decision is listed in [`data-sources/hdx/merge-report.md`](./data-sources/hdx/merge-report.md). In short:

- COD-AB decides which districts exist. Existing names and ids were kept where COD-AB spells a district differently (for example Layyah / "Leiah", Qambar Shahdadkot / "Kambar Shahdad Kot").
- COD-AB decides each district's tehsils. geo-pakistan tehsils that COD-AB does not list were **kept** (48, mostly Balochistan sub-tehsils, plus Lahore's Model Town, Raiwind and Shalimar), with "Taluka" / "Sub-Tehsil" style suffixes removed. Spelling variants of the same tehsil (63, e.g. "Hassan Abdal" / "Hasan Abdal") were matched by approximate name and the COD-AB spelling used.
- **Karachi's six districts use COD-AB only.** The sources describe different sub-district schemes (towns vs sub-divisions) and mixing them would confuse users.
- Tehsils carry a `pcode` when COD-AB lists them. A tehsil **without** a `pcode` comes from geo-pakistan only and has not been cross-checked.

### Corrections to the geo-pakistan data

1. The Mirpur, Muzaffarabad and Poonch divisions were filed under Gilgit-Baltistan; they belong to AJK.
2. Islamabad's district has no division (`divisionId: null`).
3. Names trimmed; province display names normalised.

### Districts created since 2017

Added from COD-AB, replacing the older combined districts:

| New district | Replaces / carved from | Division (**inherited, verify**) |
| --- | --- | --- |
| Lower Chitral, Upper Chitral | Chitral | Malakand |
| Lower Kohistan, Upper Kohistan, Kolai-Palas | Kohistan | Hazara |
| Chaman | Killa Abdullah | Quetta |
| Duki | Loralai | Zhob |
| Shaheed Sikandarabad | Kalat | Kalat |

COD-AB does not give divisions, so each new district was put in the division of the district it was carved from. That is an assumption.

## Known gaps

| Area | Gap | Status |
| --- | --- | --- |
| Punjab | Wazirabad, Murree, Kot Addu and Talagang were reported notified as districts in late 2022 (40 districts); a Taunsa notification was reportedly withheld; a 10th (Gujrat) division was reportedly restored. COD-AB's baseline predates these. | Not applied; verify against Punjab Board of Revenue notifications |
| Sindh | Keamari district (21 Aug 2020, from Karachi West) is not in COD-AB either. Karachi's sub-district structure has changed repeatedly. | Not applied |
| Balochistan | Reports say Duki and Surab were upgraded to districts together (34 in total at the time); COD-AB has Duki and a "Shaheed Sikandarabad" district whose only tehsil is Surab, presumably the same unit, which is worth confirming. Lehri was reportedly abolished in 2018; the data still has it. Sub-tehsils come from geo-pakistan only. | Verify |
| Divisions | All divisions come from the 2017-era geo-pakistan data and have not been cross-checked | Verify against PBS |
| Tehsils | Boundaries change often; the 48 geo-pakistan-only tehsils are unverified | Verify |
| Names | Names follow the sources' English spellings; some are variants (for example "Sudhnati" vs the usual "Sudhnoti") and Urdu names are absent | PRs welcome |

Nothing has been checked line-by-line against the Pakistan Bureau of Statistics or provincial notifications.

## Release checklist for a "verified" data release

- [ ] Cross-check divisions and districts against the PBS administrative-units list
- [ ] Cross-check each province's tehsils against its Board of Revenue / Local Government notifications
- [ ] Apply and cite each item in *Known gaps*
- [ ] Review every "kept from geo-pakistan only" line in the merge report
- [ ] Bump `meta.dataVersion`, update the README coverage table
- [ ] Record removed/renamed ids in the changelog
