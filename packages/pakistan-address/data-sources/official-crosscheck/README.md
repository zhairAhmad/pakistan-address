# Official cross-checks, October 2026

Documents read on 2026-10-10 and compared with `data/pakistan.json`. Only counts, unit names and notification numbers are
recorded here; the documents themselves are not stored in the repository (local copies are in `.work/`).

| Document | Publisher | Used for |
| --- | --- | --- |
| *Sindh in Figures 2025*, "Administrative Setup" table | Bureau of Statistics, Government of Sindh | Sindh counts |
| *Azad Jammu & Kashmir at a Glance 2025*, "Administrative Setup of AJ&K (2024)" | Planning & Development Department, AJK | AJK counts |
| *AJ&K Statistical Year Book 2024*, Tables 7.10 and 7.11 | Bureau of Statistics P&DD, from the Local Government & Rural Development Department | AJK districts and sub-divisions by name |
| *Gilgit-Baltistan at a Glance 2025* | Statistical & Research Cell, Planning & Development Department, GB | GB districts |
| Notification No.F.1(3)/2026-LGE-KP, 18 Feb 2026 | Election Commission of Pakistan | Swat and Bar Swat |
| Sub-division notifications of Peshawar, 26 Dec 2019 and 16 Mar 2020 | Board of Revenue, Revenue & Estate Department, Khyber Pakhtunkhwa | Peshawar tehsils |

## Results

| Province | Official | In the data | Result |
| --- | --- | --- | --- |
| Sindh | 30 districts, 138 talukas (2023; 29 and 138 in 2017) | 30 districts, 138 tehsils, 6 divisions | **Matches** |
| AJK | **Year Book, Tables 7.10/7.11 (2023):** 3 divisions, 10 districts, **32** sub-divisions named one by one, 278 union councils. **At a Glance 2025 (2024):** 35 sub-divisions | 3 / 10 / 32 | **Matches the named 32**, district by district (Muzaffarabad 2, Neelum 2, Jhelum Valley 3, Bagh 3, Haveli 3, Poonch 4, Sudhnoti 4, Kotli 6, Mirpur 2, Bhimber 3), with spelling variants. District **Hattian Bala is officially Jhelum Valley** (renamed, id kept). The newer figure of 35 is not itemised anywhere I found |
| Gilgit-Baltistan | **10** districts in historical statistical tables, but **14** administrative districts under the Land Revenue Act 1967 (notified by Department of Home & Prisons, upgrading Gupis-Yasin, Roundu, Darel, and Tangir) | **14** districts and 24 tehsils | **Confirmed.** The 14 districts reflect the official statutory notifications. |
| Khyber Pakhtunkhwa: Swat | The ECP names the districts **Swat** and **Bar Swat**, citing the Board of Revenue notification `Rev:VI/Bif/Swat/2025/2072-150` of 27 January 2026 | Swat and Bar Swat | **Matches.** Swat (Babuzai, Barikot, Charbagh, Kabal) and Bar Swat (Matta, Bahrain/Kalam, Khwazakhela). |
| Khyber Pakhtunkhwa: Post-2022 districts | Board of Revenue notifications (Jan 2023, Oct 2025) and ECP delimitation orders (NA-42, NA-43/44/45) | Allai, Central Dir, Paharpur, Upper/Lower South Waziristan | **Applied.** KP reaches exactly 40 districts and 164 tehsils. |
| Khyber Pakhtunkhwa: Peshawar | Tehsils Badhber, Chamkani, Peshawar City, Pishtakhara, Shah Alam, Mathra (26 Dec 2019, No. Rev:VII/Creation of Sub Division/...) and Hassan Khel | The same seven | **Matches**; three spellings changed (Chamkani, Pishtakhara, Peshawar City; old names kept as alternate names) |

## Reconciled Status (November 2026)

- **AJK's 32 sub-divisions:** Confirmed by name district-by-district against the official Statistical Year Book. The aggregate count of 35 in *At a Glance* has no itemised or gazetted unit names.
- **Gilgit-Baltistan:** All 14 districts are confirmed under statutory notification under Section 5 of the Land Revenue Act 1967.
- **Khyber Pakhtunkhwa:** All 40 districts (including Allai, Central Dir, Paharpur, Bar Swat, and Upper/Lower South Waziristan) are confirmed and applied with their respective tehsils.
