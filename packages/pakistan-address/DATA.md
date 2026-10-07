# Data notes

## Provenance

`data/pakistan.json` was built from three sources in one-time steps and is now the source of truth, edited directly by PR. Each step's script is kept in `scripts/`; re-running one overwrites later edits.

| Step | Source | What it provides |
| --- | --- | --- |
| 1. `import-geo-pakistan.mjs` | [aaqibmehran/geo-pakistan](https://github.com/aaqibmehran/geo-pakistan) (MIT declared in `composer.json`; last updated 2020; census 2017 units) | Provinces, **divisions**, and a first set of districts and tehsils |
| 2. `merge-hdx.mjs` | [OCHA / WFP COD-AB Pakistan](https://data.humdata.org/dataset/cod-ab-pak) (CC BY-IGO; valid from 2022-09-09) | Which districts and tehsils exist, their `pcode`s, newer names |
| 3. `apply-census2023.mjs` | [Pakistan Bureau of Statistics, Census 2023 portal](https://census23.pbos.gov.pk/) (official; no licence stated) | The official division, district and tehsil lists for Balochistan, Islamabad, Khyber Pakhtunkhwa, Punjab and Sindh, and their `pbsCode`s |

On top of these, a few later changes were applied from press reports (below). The original files and each step's report are in `data-sources/`.

Gilgit-Baltistan and AJK come only from step 1 and 2: the census did not cover them.

## Identifiers

- `pcode`: OCHA COD-AB place code (step 2). Absent for units COD-AB does not list.
- `pbsCode`: PBS census code (step 3), a digit string unique per level. Absent for units the census does not list, and for Gilgit-Baltistan and AJK.
- A record with neither comes from geo-pakistan only, or from a press report, and has not been cross-checked against an official list.

## Step 2: how COD-AB was merged

Every decision is in [`data-sources/hdx/merge-report.md`](./data-sources/hdx/merge-report.md). COD-AB decided which districts and tehsils exist; geo-pakistan tehsils it did not list were kept; spelling variants were matched by approximate name. Eight districts created since 2017 (Lower and Upper Chitral, Lower and Upper Kohistan, Kolai-Palas, Chaman, Duki, Surab) came from COD-AB, each placed in its parent district's division (an assumption).

Corrections to geo-pakistan: the Mirpur, Muzaffarabad and Poonch divisions were filed under Gilgit-Baltistan and belong to AJK; Islamabad's district has no division (`divisionId: null`); names trimmed.

A manual cleanup then moved parenthesised names to `altNames` (Bolan, Nawabshah, Kala Dhaka), standardised spellings (Sherani, Sudhnoti, Torghar, Rondu), removed five duplicate tehsils and added alternate names for well-known short forms (DG Khan, DI Khan, RYK, TT Singh).

## Step 3: what the census 2023 list changed

Full list in [`data-sources/census2023/apply-report.md`](./data-sources/census2023/apply-report.md); how the list was read is in [`data-sources/census2023/README.md`](./data-sources/census2023/README.md). The census frame is as of about early 2023.

- **Balochistan:** added the official **Loralai division** (Barkhan, Duki, Loralai, Musakhel, previously in Zhob). The Surab district is named as the census names it (it was "Shaheed Sikandarabad" in COD-AB, kept as an alternate name). **Lehri** is removed: the census lists it as a sub-division of Sibi. The census's Balochistan tehsils and sub-tehsils were added where missing.
- **Sindh:** added **Keamari** (Karachi's seventh district). Karachi's districts now use the census's **sub-division scheme**, replacing the town scheme from COD-AB (Karachi tehsil entries therefore have a `pbsCode` but no `pcode`).
- **Khyber Pakhtunkhwa:** Peshawar now has the census's tehsils instead of "Town-I" to "Town-IV". Missing tehsils were added.
- **Punjab:** added the Chowk Sarwar Shaheed tehsil (Muzaffargarh); spellings follow the census (Layyah, Koh-e-Suleman).
- **Tehsils** the census lists were matched to ours and given a `pbsCode`, with the census spelling kept as an alternate name where it differs. Tehsils the census does not list (21 in these provinces, mostly sub-tehsils from geo-pakistan or COD-AB) were kept.

### Where the census and the data disagree (not changed)

| | Census 2023 | Data | Why it was left |
| --- | --- | --- | --- |
| Sindh divisions | 6; Badin, Sujawal and Thatta are in Hyderabad division | 7, with a separate **Banbhore** division | Banbhore came from geo-pakistan; it is unclear whether the census is out of date or the division is. Needs the Sindh notification |
| Islamabad | A division called "Federal Capital Area" | No division | One division with one district adds a pointless dropdown level |
| Khyber Pakhtunkhwa | Swat and South Waziristan are single districts | Both split (below) | The splits post-date the census frame |
| Punjab | 9 divisions, 36 districts | 10 and 40 (below) | The Oct 2022 changes post-date the census frame |

## Applied from press reports

These changes were made from news reports that quote a provincial notification and list the units. **The notifications themselves could not be located online**, so they are labelled *press-reported* and are not verified. Anyone holding a notification can confirm or correct them by pull request.

| Change | Reported by | Notes |
| --- | --- | --- |
| South Waziristan split into **Upper South Waziristan** and **Lower South Waziristan** | [Dawn, 14 Oct 2022](https://www.dawn.com/news/1714876) | Tehsils follow the census list for the old district (Upper: Tiarza, Serwakai, Ladha, Makin, Shaktoi, Sararogha; Lower: Wana, Birmal, Toi Khulla). Dawn also named **Shawal** and **Shakai**, which the census does not list; they were removed as unconfirmed. Both districts are in Dera Ismail Khan division (inherited, an assumption) |
| Swat split into **Swat** (Babuzai, Kabal, Charbagh, Barikot) and **Upper Swat** (Matta, Bahrain, Khwazakhela) | [APP](https://www.app.com.pk/national/swat-divided-into-two-separate-districts/) | **Kalam** is not named in the report; it is in Upper Swat because of where it lies (inferred). Reports disagree on the date. Malakand division |
| New Punjab districts **Murree** (from Rawalpindi), **Talagang** (from Chakwal), **Kot Addu** (from Muzaffargarh), **Wazirabad** (from Gujranwala) | [Dawn, 16 Oct 2022](https://www.dawn.com/news/1715267), [Geo](https://www.geo.tv/latest/458487-there-are-at-the-moment-10-divisions-and-40-districts-in-punjab-as-per-the-official-notifications-of-the-punjab-board-of-revenue) | **Each has only its namesake tehsil**; reports give no tehsil lists, so other tehsils (such as Chowk Sarwar Shaheed, Lawa) are still listed under the parent district |
| **Gujrat division** (Gujrat, Hafizabad, Mandi Bahauddin, Wazirabad): Punjab at 10 divisions and 40 districts | Geo | A court reportedly reversed and later restored it in 2022. Supported by *Punjab in Figures 2025* (10 divisions) |

## Cross-checks against official publications

| Province | Publication | Official | In the data | Result |
| --- | --- | --- | --- | --- |
| Punjab | [Punjab in Figures 2025](https://bos.punjab.gov.pk/system/files/Punjab%20In%20Figures%202025Pd.pdf), Bureau of Statistics Punjab (file dated April 2026), "Administrative set-up, the Punjab: 2024" | 10 divisions, 41 districts, 156 tehsils | 10, 40, 146 | Divisions match. **One district and 10 tehsils are missing**; the district is probably Taunsa (not applied), but the document names neither |
| Balochistan, KP, Punjab, Sindh, Islamabad | PBS Census 2023 portal | 8/34/158, 7/35/148, 9/36/146, 6/30/138, 1/1/1 (divisions/districts/tehsils) | 8/34/164, 7/37/163, 10/40/146, 7/30/138, 0/1/1 | Counts now agree except where the data adds press-reported units, kept extra tehsils or the Banbhore division, as listed above |

The Punjab PDF (11.4 MB, retrieved 7 Oct 2026) is not stored in the repository. The Khyber Pakhtunkhwa and Sindh Bureau of Statistics publications have not been cross-checked.

## Known gaps

**The data follows the census 2023 frame (about early 2023), plus the press-reported changes above.** Administrative units are still being created. What news reports describe and is **not** applied (checked October 2026):

| Province | Reported change | Source | Status |
| --- | --- | --- | --- |
| Balochistan | Revenue Department notification of 8 July 2026: 11 divisions and 41 districts, up from 8 and 36. Reported changes include Quetta split into Quetta East and West, Barshore created from Pishin, a new Wadh district, a South Dera Bugti district, Kalat division abolished (replaced by Khuzdar and Lasbela divisions), Mastung moved to Quetta division, Sibi division renamed Sevi and Makran renamed Makuran | [ProPakistani, 12 Jul 2026](https://propakistani.pk/2026/07/12/balochistan-govt-notifies-new-divisions-and-districts/) | **Not applied; the province carries a `notice` warning users.** Needs the notification itself |
| Khyber Pakhtunkhwa | District Paharpur created from Dera Ismail Khan (cabinet approval reported October 2025); reports give 40 districts | [Aaj](https://english.aaj.tv/news/30301132) | Not applied: only a cabinet approval was reported |
| Punjab | Taunsa Sharif as the 41st district; its notification was reportedly withheld | [Zameen](https://www.zameen.com/news/punjab-summary-of-new-districts.html) | Not applied. 10 tehsils are also missing against the official count |
| Gilgit-Baltistan, AJK | Not checked for changes; no tehsil-level official source was found | | Unknown |

Other gaps: all divisions except those the census confirms come from the 2017-era geo-pakistan data; names follow the sources' English spellings and Urdu names are absent; tehsil boundaries change often.

Nothing has been checked line-by-line against the provincial notifications. News reports are listed only to say *what to look for*; the data should be changed only from the notifications themselves.

## Release checklist for a "verified" data release

- [ ] Resolve the Sindh Banbhore division against the Sindh notification
- [ ] Find Punjab's missing district and tehsils (Punjab in Figures counts 41 and 156)
- [ ] Cross-check the KP and Sindh Bureau of Statistics publications
- [ ] Apply Balochistan's 2026 restructuring from the notification, then remove the province `notice`
- [ ] Review the "kept though not in the census list" entries in the apply report
- [ ] Bump `meta.dataVersion`, update the README coverage table
- [ ] Record removed/renamed ids in the changelog
