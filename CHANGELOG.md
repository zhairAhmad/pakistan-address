# Changelog

Data and ids are part of the public contract. Changes to ids, names or the shape of `data/pakistan.json` are recorded here.


## Unreleased

### Data: small corrections from official documents, and cross-checks (October 2026)
- **Khyber Pakhtunkhwa:** the district split from Swat is named **Bar Swat** in an Election Commission notification (18 Feb 2026) citing the Board of Revenue notification of 27 Jan 2026. Renamed from "Upper Swat"; the id `kp-upper-swat` is kept and "Upper Swat" is an alternate name. Its tehsils are unchanged (press-reported).
- **Peshawar tehsils** follow the Board of Revenue notifications of 26 Dec 2019: Cham Kani to Chamkani, Pishta Khara to Pishtakhara, Peshawar to Peshawar City (ids kept, old names are alternate names).
- **Cross-checks, no data change:** Sindh matches *Sindh in Figures 2025* (30 districts, 138 talukas). AJK's official count is 35 tehsils against 32 here; Gilgit-Baltistan's official statistics report 10 districts against 14 here. See `packages/pakistan-address/data-sources/official-crosscheck/`.

### Data: Balochistan follows the Board of Revenue notifications up to April 2026
Source: the scanned notifications at <https://bor.balochistan.gov.pk/notifications/> (`packages/pakistan-address/data-sources/balochistan-bor/`). Balochistan is now 9 divisions, 39 districts and 167 tehsils (was 8 / 34 / 164); all provinces are 38 / 172 / 681.
- **Added districts:** `bl-hub` (from Lasbela), `bl-usta-muhammad` (from Jaffarabad), `bl-tump` (from Kech), `bl-barshore` (from Pishin), `bl-upper-dera-bugti` (from Dera Bugti). **Added division:** `bl-koh-e-suleman-div` (Barkhan, Kohlu, Upper Dera Bugti). **Renamed:** division `bl-sibi-div` is now **Sevi** (id kept).
- **Added tehsils:** Karbala, Ahmed Wal, Kishingi, Sufaid, Chief Ali Muhammad, Nabi Dad Shaheed, Sar Loop. **Renamed (ids kept):** Lairi to Liari, Huramzai to Hurramzai, Karezat to Karezat Khanozai, Kech to Turbat, Balnigor to Balnigore, Dak to Daak, Jhal Jhao to Jhao, Sangsillah to Sangseelah (the old names are alternate names).
- **Ids that changed (moved tehsils):** `bl-lasbela-{hub,gaddani,sonmiani,dureji}` are now `bl-hub-*`; `bl-jaffarabad-{usta-mohammad,gandakha}` are now `bl-usta-muhammad-{usta-muhammad,gandakha}`; `bl-kech-{tump,mand}` are now `bl-tump-*`; `bl-pishin-barshore` is now `bl-barshore-barshore`; `bl-dera-bugti-{qadirabad,pir-koh}` are now `bl-upper-dera-bugti-*`.
- **Removed ids:** `bl-dera-bugti-phelawagh` (the old name of Qadirabad, whose alternate name it is now), `bl-dera-bugti-baiker`, `bl-dera-bugti-loti`, `bl-dera-bugti-malam` (union councils or towns, not tehsils, in the February 2026 notification).
- **Not applied:** the July 2026 restructuring, which is press-reported only; the province `notice` is reworded and stays. `Surab` is left under its census name although the September 2025 notification renamed it Shaheed Sikandarabad (the press says it was reverted).

## 0.3.0 (2026-10-10)

Both packages are released together at 0.3.0. **No ids or official data changed since 0.2.0** (`data/pakistan.json` is the same); this release adds an opt-in list and changes the React dropdowns. `pakistan-address-react` now depends on `pakistan-address ^0.3.0`, and it is a minor (breaking) version for the React package because the default dropdown changed (see "Changed").

### Added: unofficial delivery areas (new entry points; nothing existing changes)
- `pakistan-address/delivery`: province, city, area and zone names (8 / 682 / 407 / 11,356) taken from an online store's address form, collected 2026-10-09. The store's "City - Area" entries are split into a city and its areas for the 17 cities that have two or more; other cities have no areas. They are courier delivery places, not administrative units, and are labelled `unofficial` (`getDeliveryMeta().unofficial` is always `true`). Functions: `getDeliveryProvinces`, `getDeliveryCities`, `getDeliveryAreas`, `getDeliveryZones` (takes an area id, or a city id for a city without areas), `getDeliveryProvince`, `getDeliveryCity`, `getDeliveryArea`, `getDeliveryZone`, `getDeliveryMeta`. Ids start with `dl-`. The main entry point does not include this data. Raw JSON: `pakistan-address/delivery-areas.json`. See `NOTICE` and `DATA.md` for the source and its licence caveat.
- `pakistan-address-react/delivery`: `DeliveryAddressFields`, `useDeliveryCascade` and `SwitchableAddressFields` (switch between the official hierarchy and the delivery areas).
- The demo has a switch between the two lists.

### Changed: custom searchable dropdowns in `pakistan-address-react`
- `AddressFields` and `DeliveryAddressFields` now use a custom, accessible dropdown (WAI-ARIA combobox) instead of the browser `<select>`. Lists with more than 10 options get a search box (type to filter, arrow keys, Enter, Escape), alternate names match ("Nawabshah" finds Shaheed Benazir Abad), and "Other / not listed" stays at the bottom of every search. Short lists stay a plain dropdown.
- New props: `native` (use the browser `<select>` as before), `searchThreshold`, `unstyled`, and more `classNames` keys (`combobox`, `control`, `clear`, `toggle`, `listbox`, `option`, `empty`). New `labels`: `searchPlaceholder`, `noResults`, `clear`.
- The `Combobox` component and `filterOptions` are exported. `Option` gains optional `keywords` and `pinned`.
- Behaviour change: options are no longer in the server-rendered HTML of the default dropdown (they render when it opens), and it needs JavaScript to open. Use `native` for a no-JavaScript form. The chosen id is still posted under the same field names, through a hidden input.

## 0.2.1 (2026-10-09)

`pakistan-address-react` only; `pakistan-address` stays at 0.2.0.

### Docs
- Fixed the react-select example in the README. It went from province straight to district, but districts only appear once a division is chosen, so the district select never showed for most provinces. The example now includes the division level. Documented the `notice` class name.

### Tests
- Added DOM interaction, accessibility (axe-core) and react-select tests. The published code is unchanged.

## 0.2.0 (2026-10-07)

Data release. **Ids changed**, so this is a minor (breaking) version while the packages are below 1.0. `pakistan-address-react` is released with it, depending on `pakistan-address ^0.2.0`; its code is unchanged.

### Data
- Applied the PBS Census 2023 lists (`data-sources/census2023/`): added the Loralai division (Barkhan, Duki, Loralai and Musakhel move out of Zhob), the Keamari district, and the census's Balochistan, Khyber Pakhtunkhwa, Punjab and Sindh tehsils where missing. Karachi's tehsils are now the census sub-divisions (instead of COD-AB towns) and Peshawar's the census tehsils (instead of Town-I to Town-IV). Added `pbsCode`.
- Id changes: `bl-shaheed-sikandarabad` is now `bl-surab` (the old name is an alternate name). Removed `bl-lehri` (a sub-division of Sibi in the census). Tehsil ids in Karachi, Peshawar and the renamed tehsils (Layyah, Koh-e-Suleman, Mirwah, Kazi Ahmed, Dera Ismail Khan, Shaktoi) changed with their names.
- Removed the press-reported South Waziristan tehsils Shawal and Shakai, which the census does not list.
- Applied the Punjab Board of Revenue notification of 18 December 2024 (`data-sources/punjab-2024/`): Punjab is now exactly 10 divisions, 41 districts and 156 tehsils. Added the Taunsa district (`pb-taunsa`) and 11 tehsils (five in Lahore, Jalalpur Jattan and Kunjah in Gujrat, Alipur Chatha, Vehova, Rawalpindi Saddar and Rawalpindi Cantt); moved Kotli Sattian to Murree, Lawa to Talagang, Taunsa and Koh-e-Suleman to Taunsa and Chowk Sarwar Shaheed to Kot Addu; removed "Rajanpur (Tribal Area)". Tehsils follow the notification's spelling; older spellings are alternate names. Ids of renamed and moved tehsils changed.
- Removed the `sd-banbhore-div` division. Badin, Sujawal and Thatta are in Hyderabad division, as in the census 2023. Banbhore was proposed in 2014 and the census does not list it.

### Ids removed or renamed since 0.1.0
`bl-shaheed-sikandarabad` (now `bl-surab`), `bl-lehri`, `sd-banbhore-div` (Badin, Sujawal and Thatta are in `sd-hyderabad-div`), all Karachi and Peshawar tehsil ids, and the ids of the Punjab tehsils that were renamed, moved or removed (see `packages/pakistan-address/data-sources/punjab-2024/apply-report.md`). If you stored ids from 0.1.0, look records up again by name, or by `pcode` or `pbsCode`.

### API
- Added the optional `pbsCode` field to provinces, divisions, districts and tehsils. No functions changed.

## 0.1.0 (2026-10-06)

First release: a snapshot built from OCHA/WFP COD-AB and geo-pakistan, with some press-reported changes.

### Data
- Districts and tehsils from OCHA/WFP COD-AB (valid from September 2022), merged with geo-pakistan; see `packages/pakistan-address/DATA.md`.
- Added the districts Lower Chitral, Upper Chitral, Lower Kohistan, Upper Kohistan, Kolai-Palas, Chaman, Duki and Shaheed Sikandarabad. Removed Chitral and Kohistan (replaced by the above).
- Added `pcode` (OCHA place code) and optional `altNames` to districts and tehsils.
- Gilgit-Baltistan, AJK and Islamabad now have tehsils.
- Id and name changes made before the release: `bl-sheerani` is now `bl-sherani`, `ajk-sudhnati` is `ajk-sudhnoti`, `kp-tor-ghar` is `kp-torghar`, `gb-roundu` is `gb-rondu`. Parentheses removed from district names. Five duplicate tehsils removed.
- Press-reported changes (notifications not located; see `DATA.md`): South Waziristan split into Upper and Lower South Waziristan, and Swat split into Swat and Upper Swat (Khyber Pakhtunkhwa); Murree, Talagang, Kot Addu and Wazirabad added as Punjab districts (namesake tehsil each) and a Gujrat division. Removed `kp-south-waziristan`.
- Added an optional `notice` on provinces. Balochistan carries a notice that its divisions and districts were reorganised in July 2026 and are not yet updated.
