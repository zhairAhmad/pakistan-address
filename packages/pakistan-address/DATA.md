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
- COD-AB decides each district's tehsils. geo-pakistan tehsils that COD-AB does not list were **kept** (43 after the cleanup below, mostly Balochistan sub-tehsils, plus Lahore's Model Town, Raiwind and Shalimar), with "Taluka" / "Sub-Tehsil" style suffixes removed. Spelling variants of the same tehsil (63, e.g. "Hassan Abdal" / "Hasan Abdal") were matched by approximate name and the COD-AB spelling used.
- **Karachi's six districts use COD-AB only.** The sources describe different sub-district schemes (towns vs sub-divisions) and mixing them would confuse users.
- Tehsils carry a `pcode` when COD-AB lists them. A tehsil **without** a `pcode` comes from geo-pakistan only and has not been cross-checked.

### Cleanup after the merge

A second, manual pass (see `CHANGELOG.md`) before the first release:

- Removed parentheses from district names and moved the second name to `altNames` (Kachhi / Bolan, Shaheed Benazir Abad / Nawabshah, Torghar / Kala Dhaka).
- Standardised spellings: Sherani, Sudhnoti, Torghar, Rondu. Ids changed with them.
- Removed 5 tehsils that duplicated an HDX tehsil under another spelling (the old spelling is kept as an alternate name).
- Added alternate names for well-known short forms (DG Khan, DI Khan, RYK, TT Singh) and for the HDX spellings of the Karachi districts.
- Not changed: Peshawar's "Town-I" to "Town-IV" and Lahore's geo-pakistan-only tehsils.

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

**The data is a snapshot of roughly September 2022.** Administrative units are still being created, so several provinces have changed since. The table lists what news reports describe (checked October 2026). **None of it has been checked against the official notification yet, and none of it is applied.** Where reports disagree, the entry says so.

| Province | Reported change since the snapshot | Source (news report) | Status |
| --- | --- | --- | --- |
| Balochistan | Revenue Department notification of 8 July 2026: 11 divisions and 41 districts, up from 8 and 36. Reported changes include Quetta split into Quetta East and West, Barshore created from Pishin, a new Wadh district, a South Dera Bugti district, Kalat division abolished (replaced by Khuzdar and Lasbela divisions), Mastung moved to Quetta division, Sibi division renamed Sevi and Makran renamed Makuran. Reports also list Duki, Surab and Chaman as districts. | [ProPakistani, 12 Jul 2026](https://propakistani.pk/2026/07/12/balochistan-govt-notifies-new-divisions-and-districts/) | **Balochistan divisions and several districts are out of date.** Needs the notification itself |
| Khyber Pakhtunkhwa | Swat divided into Swat and Upper (Bar) Swat (reports give conflicting dates); South Waziristan divided into Upper and Lower (cabinet approved 2022); District Paharpur created from Dera Ismail Khan (cabinet approval reported October 2025). Reports give 40 districts. | [APP](https://www.app.com.pk/?p=1152035), [Aaj](https://english.aaj.tv/news/30301132) | Not applied; needs notifications and tehsil lists |
| Punjab | Wazirabad, Murree, Kot Addu and Talagang notified as districts (reported December 2022, 40 districts); a Gujrat division (Gujrat, Hafizabad, Mandi Bahauddin, Wazirabad) was notified in October 2022 and later restored by the Lahore High Court; a 2025 report puts Punjab at 10 divisions and 41 districts (Taunsa is the likely 41st). | [Geo fact-check](https://www.geo.tv/latest/458487-there-are-at-the-moment-10-divisions-and-40-districts-in-punjab-as-per-the-official-notifications-of-the-punjab-board-of-revenue), [Dawn](https://www.dawn.com/news/1715267), [Bloom Pakistan](https://bloompakistan.com/districts-punjab-pakistan-list-2025/) | Not applied; needs Board of Revenue notifications. Punjab has 9 divisions in the data, reports say 10 |
| Sindh | Keamari (a seventh Karachi district, from Karachi West) was notified in 2020 and is not in COD-AB. Reports give 30 districts. Karachi's sub-district structure has changed repeatedly. | [ARY](https://arynews.tv/en/sindh-govt-keamari-seventh-district-karachi/) | Not applied |
| Other | Gilgit-Baltistan, AJK and Islamabad were not checked for changes. | | Unknown |

Older, smaller items: Lehri district was reportedly abolished in 2018 and the data still has it; COD-AB's "Shaheed Sikandarabad" district has only the tehsil Surab and is presumably the same unit as the reported Surab district.

| Area | Gap | Status |
| --- | --- | --- |
| Divisions | All divisions come from the 2017-era geo-pakistan data and have not been cross-checked | Verify against PBS |
| Tehsils | Boundaries change often; the 43 geo-pakistan-only tehsils are unverified | Verify |
| Names | Names follow the sources' English spellings; some are variants and Urdu names are absent | PRs welcome |

Nothing has been checked line-by-line against the Pakistan Bureau of Statistics or the provincial notifications. News reports are listed only to say *what to look for*; the data should be changed only from the notifications themselves.

## Release checklist for a "verified" data release

- [ ] Cross-check divisions and districts against the PBS administrative-units list
- [ ] Cross-check each province's tehsils against its Board of Revenue / Local Government notifications
- [ ] Apply and cite each item in *Known gaps*
- [ ] Review every "kept from geo-pakistan only" line in the merge report
- [ ] Bump `meta.dataVersion`, update the README coverage table
- [ ] Record removed/renamed ids in the changelog
