# Changelog

Data and ids are part of the public contract. Changes to ids, names or the shape of `data/pakistan.json` are recorded here.


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
