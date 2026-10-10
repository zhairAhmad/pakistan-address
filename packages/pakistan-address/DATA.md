# Data notes

## Provenance

`data/pakistan.json` was built from several sources in one-time steps and is now the source of truth, edited directly by PR. Each step's script is kept in `scripts/`; re-running one overwrites later edits.

| Step | Source | What it provides |
| --- | --- | --- |
| 1. `import-geo-pakistan.mjs` | [aaqibmehran/geo-pakistan](https://github.com/aaqibmehran/geo-pakistan) (MIT declared in `composer.json`; last updated 2020; census 2017 units) | Provinces, **divisions**, and a first set of districts and tehsils |
| 2. `merge-hdx.mjs` | [OCHA / WFP COD-AB Pakistan](https://data.humdata.org/dataset/cod-ab-pak) (CC BY-IGO; valid from 2022-09-09) | Which districts and tehsils exist, their `pcode`s, newer names |
| 3. `apply-census2023.mjs` | [Pakistan Bureau of Statistics, Census 2023 portal](https://census23.pbos.gov.pk/) (official; no licence stated) | The official division, district and tehsil lists for Balochistan, Islamabad, Khyber Pakhtunkhwa, Punjab and Sindh, and their `pbsCode`s |
| 4. `apply-punjab-2024.mjs` | [Punjab Board of Revenue notification of 18 December 2024](./data-sources/punjab-2024/README.md) (official) | **Punjab only**: the schedule of 10 divisions, 41 districts and 156 tehsils, which supersedes the older Punjab lists |

5. `apply-balochistan-bor.mjs`: the [Balochistan Board of Revenue notifications](./data-sources/balochistan-bor/README.md) (official, 2021 to 29 April 2026): the Hub, Usta Muhammad, Tump, Barshore and Upper Dera Bugti districts, the Koh-e-Suleman division, Sibi division renamed Sevi, and the new tehsils. **Balochistan only.** See the [report](./data-sources/balochistan-bor/apply-report.md).

On top of these, two district splits in Khyber Pakhtunkhwa were applied from press reports (below). The original files and each step's report are in `data-sources/`.

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

### Where the census and the data disagree

| | Census 2023 | Data | Why |
| --- | --- | --- | --- |
| Islamabad | A division called "Federal Capital Area" | No division | One division with one district adds a pointless dropdown level |
| Khyber Pakhtunkhwa | Swat and South Waziristan are single districts | Both split (below) | The splits post-date the census frame |
| Punjab | 9 divisions, 36 districts, 146 tehsils | 10, 41 and 156 | Punjab follows the later official notification (below) |

**Resolved: Sindh's Banbhore division.** The data used to have a seventh Sindh division, "Banbhore" (Badin, Sujawal, Thatta), inherited from geo-pakistan. The census, an official source, lists only six divisions and puts those districts in Hyderabad division; Banbhore was announced as a proposal in 2014, and a search found no sign that it was ever notified. It was removed and the three districts moved to Hyderabad. If a notification for it turns up, restoring it is a small change.

## Step 4: Punjab, from the Board of Revenue notification

[`data-sources/punjab-2024/`](./data-sources/punjab-2024/README.md) holds a transcription of the **Notification No. 479-2024/6904-DIR(DEV&G) of 18 December 2024**, signed by the Senior Member, Board of Revenue, Punjab, which re-divides the province "in supersession of all previous Notifications". It is an official schedule of every division, district and tehsil, so Punjab now matches it exactly (10 / 41 / 156) and its totals agree with *Punjab in Figures 2025*. What it changed, in [`apply-report.md`](./data-sources/punjab-2024/apply-report.md):

- added the **Taunsa** district and 11 tehsils, including five in Lahore, Kunjah and Jalalpur Jattan (Gujrat) and Alipur Chatha (Wazirabad);
- moved Kotli Sattian to Murree, Lawa to Talagang, Taunsa and Koh-e-Suleman to Taunsa, Chowk Sarwar Shaheed to Kot Addu;
- removed "Rajanpur (Tribal Area)", which the notification does not list;
- spellings follow the notification; the older spellings are alternate names.

The copy used is a scan republished by a news site; the original on a government site was not found. The Gujrat division, Murree, Talagang, Kot Addu and Wazirabad, which were first applied from press reports, are all in this notification.

## Applied from press reports

These two changes were made from news reports that quote a provincial notification and list the units. **The notifications themselves could not be located online**, so they are labelled *press-reported* and are not verified. Anyone holding a notification can confirm or correct them by pull request.

| Change | Reported by | Notes |
| --- | --- | --- |
| South Waziristan split into **Upper South Waziristan** and **Lower South Waziristan** | [Dawn, 14 Oct 2022](https://www.dawn.com/news/1714876) | Tehsils follow the census list for the old district (Upper: Tiarza, Serwakai, Ladha, Makin, Shaktoi, Sararogha; Lower: Wana, Birmal, Toi Khulla). Dawn also named **Shawal** and **Shakai**, which the census does not list; they were removed as unconfirmed. Both districts are in Dera Ismail Khan division (inherited, an assumption) |
| Swat split into **Swat** (Babuzai, Kabal, Charbagh, Barikot) and **Upper Swat** (Matta, Bahrain, Khwazakhela) | [APP](https://www.app.com.pk/national/swat-divided-into-two-separate-districts/) | **Kalam** is not named in the report; it is in Upper Swat because of where it lies (inferred). Reports disagree on the date. Malakand division |


## Cross-checks against official publications

| Province | Publication | Official | In the data | Result |
| --- | --- | --- | --- | --- |
| Punjab | [Punjab in Figures 2025](https://bos.punjab.gov.pk/system/files/Punjab%20In%20Figures%202025Pd.pdf), Bureau of Statistics Punjab (file dated April 2026), "Administrative set-up, the Punjab: 2024" | 10 divisions, 41 districts, 156 tehsils | 10, 41, 156 | **Matches**, after step 4. Before it, the data had one district and 10 tehsils fewer |
| Balochistan, KP, Sindh, Islamabad | PBS Census 2023 portal | 8/34/158, 7/35/148, 6/30/138, 1/1/1 (divisions/districts/tehsils) | 8/34/164, 7/37/163, 6/30/138, 0/1/1 | Agree, except where the data adds press-reported units or keeps extra tehsils the census does not list |

The Punjab PDF (11.4 MB, retrieved 7 Oct 2026) is not stored in the repository. The Khyber Pakhtunkhwa and Sindh Bureau of Statistics publications have not been cross-checked.

## Unofficial delivery areas

`data/delivery-areas.json` is **not** part of the administrative hierarchy above. It holds the province, city and zone names that an online store offers in its address form, collected on 2026-10-09 by reading the store's address-form lists while logged in, at a slow pace. The raw collection is not stored in the repository.

- **What it is:** courier delivery places: 8 provinces, 682 cities, 407 areas, 11,356 zones.
- **What it is not:** districts, tehsils or any official unit. Islamabad's areas are sectors and societies, and many "cities" are towns. It was not compared with any official source.
- **Reshaping:** the store lists big cities as many "City - Area" entries. They were split at the first " - " into a city and its areas, for the 17 cities with two or more such entries (Lahore 103 areas, Karachi 84, Islamabad 62...). This is a text rule, not something the store states. Single entries ("Gojra - Toba Tek Singh") stay whole, and Sargodha and Sheikhupura, which the store lists both as bare cities and with areas, keep their bare-city zones in an area named after the city.
- **Cleaning:** names trimmed and spaces collapsed, en dashes written as hyphens, two zones that differed only by capitalisation merged, and one entry removed (Kamalia listed under Khyber Pakhtunkhwa with no zones; Kamalia is in Punjab). Everything changed is in [data-sources/delivery/build-report.md](./data-sources/delivery/build-report.md). Rebuild with `node scripts/build-delivery-data.mjs <collection.json>`.
- **Ids:** this package's own (`dl-...`), not the store's. Stable only as long as the names are.
- **Licence:** the lists are the store's. They are included as place names only, kept separate and labelled; see [NOTICE](./NOTICE). The MIT licence of this package does not grant rights in them.

## Known gaps

**Punjab follows the December 2024 notification; the other provinces follow the census 2023 frame (about early 2023), plus the press-reported changes above.** Administrative units are still being created. What news reports describe and is **not** applied (checked October 2026):

| Province | Reported change | Source | Status |
| --- | --- | --- | --- |
| Balochistan | Revenue Department notification of about 8 July 2026: 11 divisions and 41 districts. Reported changes still unapplied: Quetta split into Quetta East and West, a new Wadh district, Kalat division abolished (Khuzdar and Lasbela divisions), Mastung to Quetta division, Kachhi to Sevi division, Ziarat and Harnai to Loralai division, Makran renamed Makuran, Upper/Lower Dera Bugti renamed North/South, Shaheed Sikandarabad renamed back to Surab, and more tehsils. (Barshore, Koh-e-Suleman, Sevi and the others of Feb to Apr 2026 **are** applied from their own notifications.) | [ProPakistani, 12 Jul 2026](https://propakistani.pk/2026/07/12/balochistan-govt-notifies-new-divisions-and-districts/), [Dawn](https://www.dawn.com/news/2014627/quetta-split-into-two-districts-as-balochistan-undergoes-administrative-restructuring) | **Not applied; the province carries a `notice`.** The notification is not on the Board of Revenue page; needs the document itself |
| Khyber Pakhtunkhwa | District Paharpur created from Dera Ismail Khan (cabinet approval reported October 2025); reports give 40 districts | [Aaj](https://english.aaj.tv/news/30301132) | Not applied: only a cabinet approval was reported |
| Gilgit-Baltistan, AJK | Not checked for changes; no tehsil-level official source was found | | Unknown |

Other gaps: all divisions except those the census confirms come from the 2017-era geo-pakistan data; names follow the sources' English spellings and Urdu names are absent; tehsil boundaries change often.

Only Punjab has been matched against a provincial notification. For the other provinces, news reports are listed only to say *what to look for*; the data should be changed from the notifications themselves.

## Release checklist for a "verified" data release

- [x] Punjab matches the Board of Revenue notification and the official counts
- [x] Sindh's divisions match the census (Banbhore removed)
- [ ] Find the notifications for the Khyber Pakhtunkhwa splits and for the Sindh and Khyber Pakhtunkhwa changes since 2023
- [ ] Cross-check the KP and Sindh Bureau of Statistics publications
- [x] Balochistan follows the Board of Revenue notifications up to April 2026
- [ ] Apply Balochistan's July 2026 restructuring from the notification, then remove the province `notice`
- [ ] Review the "kept though not in the census list" entries in the apply report
- [ ] Bump `meta.dataVersion`, update the README coverage table
- [ ] Record removed/renamed ids in the changelog
