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

## Applied from press reports

These changes were made after the merge, from news reports that quote the provincial notification and list the units. **The notifications themselves could not be located online** (the Punjab Board of Revenue's notifications page does not list them), so they are labelled *press-reported* and are not verified. Anyone holding the notification can confirm or correct them by pull request.

| Change | Reported by | Notes |
| --- | --- | --- |
| South Waziristan split into **Upper South Waziristan** (Tiarza, Serwakai, Shawal, Ladha, Makin, Shaktui, Sararogha) and **Lower South Waziristan** (Wana, Shakai, Tolkhela, Birmal) | [Dawn, 14 Oct 2022](https://www.dawn.com/news/1714876) | "Tolkhela" is COD-AB's "Toi Khulla" (kept as the name, with Tolkhela as an alternate). Shawal, Shaktui and Shakai have no COD-AB p-code. Both districts are placed in Dera Ismail Khan division (inherited, an assumption) |
| Swat split into **Swat** (Babuzai, Kabal, Charbagh, Barikot) and **Upper Swat** (Matta, Bahrain, Khwazakhela) | [APP](https://www.app.com.pk/national/swat-divided-into-two-separate-districts/) | COD-AB splits Matta into Matta Kharirai and Matta Sebujni; both go to Upper Swat. **Kalam** is not named in the report; it was put in Upper Swat because of where it lies (inferred). Reports disagree on the date of the notification. Placed in Malakand division |
| New Punjab districts **Murree** (from Rawalpindi), **Talagang** (from Chakwal), **Kot Addu** (from Muzaffargarh), **Wazirabad** (from Gujranwala) | [Dawn, 16 Oct 2022](https://www.dawn.com/news/1715267) (Board of Revenue notification), [Geo](https://www.geo.tv/latest/458487-there-are-at-the-moment-10-divisions-and-40-districts-in-punjab-as-per-the-official-notifications-of-the-punjab-board-of-revenue) | **Each has only its namesake tehsil.** Reports give no tehsil lists, so any other tehsils (for example Chowk Sarwar Shaheed, Lawa) are still listed under the parent district. Divisions: Murree and Talagang in Rawalpindi, Kot Addu in Dera Ghazi Khan, Wazirabad in Gujrat |
| **Gujrat division** (Gujrat, Hafizabad, Mandi Bahauddin, Wazirabad), taking Punjab to 10 divisions and 40 districts | Geo | A court reportedly reversed and later restored the division in 2022; a 2025 report still counts 10 divisions |

## Cross-checks against official publications

Counts in `data/pakistan.json` compared with government statistics publications. These checks give **counts only** (no named lists), so they show *that* something is missing, not *what*.

| Province | Publication | Official count | In the data | Result |
| --- | --- | --- | --- | --- |
| Punjab | [Punjab in Figures 2025](https://bos.punjab.gov.pk/system/files/Punjab%20In%20Figures%202025Pd.pdf), Bureau of Statistics Punjab (file dated April 2026), table "Administrative set-up, the Punjab: 2024" | 10 divisions, 41 districts, 156 tehsils, 25,894 mauzas | 10 divisions, 40 districts, 145 tehsils | Divisions match, which confirms the Gujrat division. **One district and 11 tehsils are missing.** The missing district is probably Taunsa (not applied), but the document does not name it |

The PDF (11.4 MB, retrieved 7 Oct 2026) is not stored in the repository. Other provinces are still to be cross-checked: the PBS Census 2023 tables, the KP and Sindh Bureau of Statistics publications and Balochistan's notification.

## Known gaps

**The data is a snapshot of roughly September 2022.** Administrative units are still being created, so several provinces have changed since. The table lists what news reports describe (checked October 2026). Items marked *applied* are in the data as *press-reported* (see above); the rest are not. Where reports disagree, the entry says so.

| Province | Reported change since the snapshot | Source (news report) | Status |
| --- | --- | --- | --- |
| Balochistan | Revenue Department notification of 8 July 2026: 11 divisions and 41 districts, up from 8 and 36. Reported changes include Quetta split into Quetta East and West, Barshore created from Pishin, a new Wadh district, a South Dera Bugti district, Kalat division abolished (replaced by Khuzdar and Lasbela divisions), Mastung moved to Quetta division, Sibi division renamed Sevi and Makran renamed Makuran. Reports also list Duki, Surab and Chaman as districts. | [ProPakistani, 12 Jul 2026](https://propakistani.pk/2026/07/12/balochistan-govt-notifies-new-divisions-and-districts/) | **Balochistan divisions and several districts are out of date.** Needs the notification itself |
| Khyber Pakhtunkhwa | Swat divided into Swat and Upper (Bar) Swat (reports give conflicting dates); South Waziristan divided into Upper and Lower (cabinet approved 2022); District Paharpur created from Dera Ismail Khan (cabinet approval reported October 2025). Reports give 40 districts. | [APP](https://www.app.com.pk/?p=1152035), [Aaj](https://english.aaj.tv/news/30301132) | Swat and South Waziristan **applied**. Paharpur (from Dera Ismail Khan) **not applied**: only a cabinet approval was reported |
| Punjab | Wazirabad, Murree, Kot Addu and Talagang notified as districts (reported December 2022, 40 districts); a Gujrat division (Gujrat, Hafizabad, Mandi Bahauddin, Wazirabad) was notified in October 2022 and later restored by the Lahore High Court; a 2025 report puts Punjab at 10 divisions and 41 districts (Taunsa is the likely 41st). | [Geo fact-check](https://www.geo.tv/latest/458487-there-are-at-the-moment-10-divisions-and-40-districts-in-punjab-as-per-the-official-notifications-of-the-punjab-board-of-revenue), [Dawn](https://www.dawn.com/news/1715267), [Bloom Pakistan](https://bloompakistan.com/districts-punjab-pakistan-list-2025/) | Four districts and the Gujrat division **applied** (namesake tehsils only). Taunsa **not applied** (its notification was reportedly withheld). The Punjab Bureau of Statistics counts 41 districts and 156 tehsils against 40 and 145 here (see cross-checks above) |
| Sindh | Keamari (a seventh Karachi district, from Karachi West) was notified in 2020 and is not in COD-AB. Reports give 30 districts. Karachi's sub-district structure has changed repeatedly. | [ARY](https://arynews.tv/en/sindh-govt-keamari-seventh-district-karachi/) | Not applied |
| Other | Gilgit-Baltistan, AJK and Islamabad were not checked for changes. | | Unknown |

Older, smaller items: Lehri district was reportedly abolished in 2018 and the data still has it; COD-AB's "Shaheed Sikandarabad" district has only the tehsil Surab and is presumably the same unit as the reported Surab district.

| Area | Gap | Status |
| --- | --- | --- |
| Divisions | All divisions come from the 2017-era geo-pakistan data and have not been cross-checked | Verify against PBS |
| Tehsils | Boundaries change often; the 43 geo-pakistan-only tehsils and the 3 press-reported South Waziristan tehsils are unverified | Verify |
| Names | Names follow the sources' English spellings; some are variants and Urdu names are absent | PRs welcome |

Nothing has been checked line-by-line against the Pakistan Bureau of Statistics or the provincial notifications. News reports are listed only to say *what to look for*; the data should be changed only from the notifications themselves.

## Release checklist for a "verified" data release

- [ ] Cross-check divisions and districts against the PBS administrative-units list
- [ ] Cross-check each province's tehsils against its Board of Revenue / Local Government notifications
- [ ] Apply and cite each item in *Known gaps*
- [ ] Review every "kept from geo-pakistan only" line in the merge report
- [ ] Bump `meta.dataVersion`, update the README coverage table
- [ ] Record removed/renamed ids in the changelog
