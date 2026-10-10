# Balochistan: notifications of the Board of Revenue

**Source:** Government of Balochistan, Revenue Department (Board of Revenue), notifications published as scanned images on
<https://bor.balochistan.gov.pk/notifications/> (read 2026-10-10). Thirteen notifications about divisions, districts,
tehsils and sub-divisions were read from the scans. Only unit names and notification numbers are recorded here; the scans
themselves are not stored in the repository (a local copy is in `.work/balochistan-bor/`).

All are issued "under Section 5, 6 and/or 6-A of the Balochistan Land Revenue Act, 1967", by the Revenue Department
(Admn: Branch). Dates are the dates on the notification where legible.

**Not on that page:** the Revenue Department notification of about 8 July 2026 that reportedly makes 11 divisions and 41
districts (Quetta East/West, Wadh, Makuran, Khuzdar and Lasbela divisions, North/South Dera Bugti, Surab reverted). It is
press-reported only; see `DATA.md`. Several items below are affected by it (marked).

## The notifications (oldest first)

| # | Date | No. | What it does |
| --- | --- | --- | --- |
| 1 | June 2021 (day not clearly legible; cabinet decision 18 June 2021) | 294 A 13 | **Loralai Division** created: Zhob Division = Zhob, Killa Saifullah, Sherani; Loralai Division = Loralai, Musakhel, Barkhan, Duki. **Chaman District** created from Killa Abdullah. Killa Abdullah: sub-divisions Gulistan, Killa Abdullah; Tehsil Killa Abdullah, Tehsil Gulistan, Sub-Tehsil Dobandi. Chaman: sub-divisions City Chaman, Saddar Chaman; Tehsil City Chaman, Tehsil Saddar Chaman |
| 2 | 31 Aug 2022 (in force 1 Sep 2022) | 109 A 13 | **Hub District** created from Lasbela. Hub (HQ Hub): sub-divisions Hub, Dureji, Sonmiani (Winder); Tehsil Hub, Gaddani, Sonmiani (Winder), Dureji. Lasbela (HQ Uthal): sub-divisions Bela, Uthal, Kanraj; Tehsil Bela, Uthal, Lakhra, Kanraj; Sub-Tehsil Liari |
| 3 | 13 Sep 2022 (modifies 31 Aug 2022 for Jaffarabad) | 262 A 13 | **Usta Muhammad District** (HQ Usta Muhammad): sub-division Usta Muhammad; Tehsil Usta Muhammad, Tehsil Gandakha. **Jaffarabad** (HQ Dera Allahyar): sub-division Jhat Pat; Tehsil Jhat Pat |
| 4 | 14 Sep 2022 | 221 A 13 | Sub-Division **Jhao** in Awaran: Tehsil Jhao, Tehsil Korak Jhao |
| 5 | 3 Nov 2022 | 63 A 13 | Sub-Tehsil **Sufaid** (HQ Rehmanabad) in Kohlu |
| 6 | 20 Feb 2023 | 206 A 13 | Nushki: new Tehsil **Ahmed Wal**; Sub-Tehsil Daak upgraded to Tehsil **Daak**; new Sub-Tehsil **Kishingi** |
| 7 | 24 Sep 2025 | 103 A 13 | Renames: District **Surab** (Kalat Division) to **Shaheed Sikandarabad**; Sub-Division Mangochar to **Khaliqabad** (Kalat District); Tehsil Phelawagh to **Qadirabad** (Dera Bugti). *(The July 2026 press report says Shaheed Sikandarabad reverted to Surab.)* |
| 8 | 16 Dec 2025 | 111 A 13 | Tehsil Pishin bifurcated; new Tehsil **Karbala** (HQ Karbala), Pishin District |
| 9 | 24 Feb 2026 | 278 A 13 | **Tump District** (HQ Tump) created from Kech (Mekran Division): sub-divisions Tump, Mand (new); Tehsil Tump, Tehsil Mand. **Kech** (HQ Turbat): sub-divisions Turbat, Buleda, Dasht, Hoshab (new); Tehsil Turbat; Sub-Tehsil Buleda, Zamuran, Dasht, Balnigore, Hoshab |
| 10 | 26 Feb 2026 | 63 A 13 | **Upper Dera Bugti District** (HQ Baiker) created from Dera Bugti. Sub-Divisions Shaheed Fazal Khan Shambani (at Loti Bhee), Pirkoh, Qadirabad (Phelawagh renamed); Tehsil Chief Ali Muhammad, Nabi Dad Shaheed, Sar Loop, Qadirabad (at Phelawagh). **Dera Bugti** (HQ Dera Bugti): Sub-Division Dera Bugti (Tehsil Dera Bugti, Sub-Tehsil Sangseelah), Sub-Division Sui (Tehsil Sui). Also four wards of Barkhan district join Upper Dera Bugti. *(Press: renamed North Dera Bugti in July 2026.)* |
| 11 | 26 Feb 2026 | 294 A 13 | **Koh-e-Suleman Division** (HQ Rakhni) created: Barkhan (from Loralai Division), Kohlu (from Sibi Division), Upper Dera Bugti (new) |
| 12 | 12 Mar 2026 | 294 A 13 | **Barshore District** (HQ Barshore) created from Pishin: sub-division Barshore, Sub-Tehsil Barshore with the area of Toba Kakari. **Pishin** (HQ Pishin): sub-divisions Pishin, Karezat, Hurramzai; Tehsil Pishin, Karezat Khanozai, Bostan, Nana Sahib, Hurramzai, Saranan, Karbala |
| 13 | 29 Apr 2026 | 294 A 13 | **Sibi Division** renamed **Sevi Division** |

## What the data in `data/pakistan.json` (0.3.0) has against them

| Item | Notification | In the data now | Verdict |
| --- | --- | --- | --- |
| Loralai division with Loralai, Musakhel, Barkhan, Duki; Zhob with Zhob, Killa Saifullah, Sherani | 1 | Same | **Matches** |
| Chaman district; Killa Abdullah tehsils | 1 | Chaman (Chaman, Chaman Saddar); Killa Abdullah (Dobandi, Gulistan, Killa Abdullah) | **Matches** (spelling "Chaman" for "City Chaman") |
| Hub district | 2 | No Hub district; Hub, Gaddani, Sonmiani, Dureji are tehsils of Lasbela | **Missing district** |
| Lasbela tehsils | 2 | Bela, Dureji, Gaddani, Hub, Kanraj, Lairi, Lakhra, Sonmiani, Uthal | Dureji/Gaddani/Hub/Sonmiani belong to Hub; "Lairi" is spelled "Liari" |
| Usta Muhammad district | 3 | No such district; Usta Mohammad, Gandakha, Jhat Pat are tehsils of Jaffarabad | **Missing district**; spelling "Usta Mohammad" |
| Jhao | 4 | Awaran has "Jhal Jhao" and "Korak Jhao" | Name differs ("Jhao") |
| Sufaid | 5 | Not present in Kohlu | **Missing sub-tehsil** |
| Nushki: Ahmed Wal, Daak, Kishingi | 6 | Nushki has Dak and Nushki | **Missing Ahmed Wal and Kishingi**; "Dak" is "Daak" |
| Surab rename | 7 | District named "Surab" | Differs from the Sept 2025 notification (press says reverted July 2026; unconfirmed) |
| Phelawagh to Qadirabad | 7 | Both Phelawagh and Qadirabad listed in Dera Bugti | **Duplicate**: Phelawagh is the old name |
| Karbala tehsil | 8 | Not present in Pishin | **Missing tehsil** |
| Tump district | 9 | No Tump district; Tump and Mand are tehsils of Kech | **Missing district**; Kech tehsil "Kech" is "Turbat"; "Balnigor" is "Balnigore" |
| Upper Dera Bugti district | 10 | Not present | **Missing district**; tehsils differ from the notification |
| Koh-e-Suleman division | 11 | Not present (Barkhan in Loralai, Kohlu in Sibi) | **Missing division** |
| Barshore district | 12 | A "Barshore" tehsil in Pishin; no district | **Missing district**; "Huramzai" is "Hurramzai", "Karezat" is "Karezat Khanozai" |
| Sevi division | 13 | Division named Sibi | **Not applied** |

Summary: the data (census 2023 frame, about early 2023) agrees with notification 1 and is **behind on the other 12 of
the 13**. Five of those create districts (Hub, Usta Muhammad, Tump, Upper Dera Bugti, Barshore) and one a division
(Koh-e-Suleman). The July 2026 restructuring comes on top of these.

## Not yet decided

- How to name the Dera Bugti pair: the official text of February 2026 says "Dera Bugti" and "Upper Dera Bugti"; the press
  reports "North Dera Bugti" and "South Dera Bugti" after July 2026. Only the former is in a primary source so far.
- Surab / Shaheed Sikandarabad: the only primary source (Sept 2025) says Shaheed Sikandarabad.
- Tehsil lists of districts not mentioned above come from the census frame and are not checked here.
