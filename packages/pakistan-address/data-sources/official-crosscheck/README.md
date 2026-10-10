# Official cross-checks, October 2026

Documents read on 2026-10-10 and compared with `data/pakistan.json`. Only counts, unit names and notification numbers are
recorded here; the documents themselves are not stored in the repository (local copies are in `.work/`).

| Document | Publisher | Used for |
| --- | --- | --- |
| *Sindh in Figures 2025*, "Administrative Setup" table | Bureau of Statistics, Government of Sindh | Sindh counts |
| *Azad Jammu & Kashmir at a Glance 2025*, "Administrative Setup of AJ&K (2024)" | Planning & Development Department, AJK | AJK counts |
| *Gilgit-Baltistan at a Glance 2025* | Statistical & Research Cell, Planning & Development Department, GB | GB districts |
| Notification No.F.1(3)/2026-LGE-KP, 18 Feb 2026 | Election Commission of Pakistan | Swat and Bar Swat |
| Sub-division notifications of Peshawar, 26 Dec 2019 and 16 Mar 2020 | Board of Revenue, Revenue & Estate Department, Khyber Pakhtunkhwa | Peshawar tehsils |

## Results

| Province | Official | In the data | Result |
| --- | --- | --- | --- |
| Sindh | 30 districts, 138 talukas (2023; 29 and 138 in 2017) | 30 districts, 138 tehsils, 6 divisions | **Matches** |
| AJK | 3 divisions, 10 districts, **35** sub-divisions (tehsils), 278 union councils (2024; the 2023 and 2024 *At a Glance* editions said 32) | 3 / 10 / **32** | Districts match. **Three tehsils missing**; the document gives no names |
| Gilgit-Baltistan | **10** districts in its tables and 10 district councils: Astore, Diamer, Ghanche, Ghizer, Gilgit, Hunza, Kharmang, Nagar, Shigar, Skardu. No tehsil list | **14** districts (those plus Gupis-Yasin, Rondu, Darel, Tangir) and 24 tehsils | **Differs.** The four extra districts come from OCHA and a press-reported 2019 notification; the official statistics still report 10. Tehsils unverified |
| Khyber Pakhtunkhwa: Swat | The ECP names the districts **Swat** and **Bar Swat**, citing the Board of Revenue notification `Rev:VI/Bif/Swat/2025/2072-150` of 27 January 2026 | "Upper Swat" | **Renamed to Bar Swat** (id `kp-upper-swat` kept; "Upper Swat" is an alternate name). The tehsil list is still press-reported: no official list was found |
| Khyber Pakhtunkhwa: Peshawar | Tehsils Badhber, Chamkani, Peshawar City, Pishtakhara, Shah Alam, Mathra (26 Dec 2019, No. Rev:VII/Creation of Sub Division/...) and Hassan Khel | The same seven | **Matches**; three spellings changed (Chamkani, Pishtakhara, Peshawar City; old names kept as alternate names) |

## Not resolved

- **AJK's three missing tehsils** need a document that names the 35 sub-divisions (the Statistical Year Book 2024 may).
- **Gilgit-Baltistan:** whether Gupis-Yasin, Rondu, Darel and Tangir should be districts is open. The official statistical
  tables use ten; the data keeps fourteen.
- **Paharpur and South Waziristan** (Khyber Pakhtunkhwa): no primary document found; still press-reported or not applied.
- **Bar Swat tehsils:** the press lists Matta, Bahrain and Khwazakhela; the data has five (adds Kalam and a second Matta
  entry from the census). Needs the notification text.
