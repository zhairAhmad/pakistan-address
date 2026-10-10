# Balochistan, July 2026 restructuring: press-reported

**Status: press-reported. The Revenue Department notification itself (about 8 July 2026) has not been found** on the
Board of Revenue page (<https://bor.balochistan.gov.pk/notifications/>, read 2026-10-10), which lists notifications only
up to 29 April 2026. This is applied at division and district level only, where the reports agree.

## Reports used (facts only, no text copied)

| Outlet | Date | URL |
| --- | --- | --- |
| Dawn | 11 Jul 2026 | <https://www.dawn.com/news/2014627/quetta-split-into-two-districts-as-balochistan-undergoes-administrative-restructuring> |
| ProPakistani | 12 Jul 2026 | <https://propakistani.pk/2026/07/12/balochistan-govt-notifies-new-divisions-and-districts/> |
| The Express Tribune | 12 Jul 2026 | <https://tribune.com.pk/story/2617792/quetta-split-into-two-districts-in-major-administrative-revamp> |
| Quetta Voice | 11 Jul 2026 | <https://quettavoice.com/2026/07/11/balochistan-announces-major-administrative-restructuring-creates-new-divisions-districts-and-tehsils/> |

They agree that the restructuring is notified under sections 5, 6 and 6-A of the Balochistan Land Revenue Act, 1967, and
makes **11 divisions and 41 districts** (from 8 and 36).

## Applied (`scripts/apply-balochistan-july-2026-press.mjs`)

| Division | Districts |
| --- | --- |
| Quetta | Quetta East, Quetta West, Mastung |
| Khuzdar (new; Kalat division abolished) | Khuzdar, Kalat, Surab, Wadh |
| Lasbela (new) | Lasbela, Hub, Awaran |
| Pishin (new) | Pishin, Killa Abdullah, Chaman, Barshore |
| Sevi | Sevi, South Dera Bugti, Kachhi |
| Loralai | Loralai, Musakhel, Duki, Ziarat, Harnai |
| Koh-e-Suleman | Barkhan, Kohlu, North Dera Bugti |
| Makuran (was Makran) | Gwadar, Kech, Tump, Panjgur |
| Naseerabad | Naseerabad, Jaffarabad, Usta Muhammad, Sohbatpur, Jhal Magsi |
| Rakhshan | Chagai, Kharan, Nushki, Washuk |
| Zhob | Zhob, Killa Saifullah, Sherani |

- **Quetta** is split into **Quetta East** (Saddar, City, Sariab; the existing office is its headquarters, so it keeps the
  old district's id and codes) and **Quetta West** (Kuchlak, Brewery, Panjpai; new, no codes). All five tehsils already
  existed; **Brewery** is new and is named by Dawn and Quetta Voice.
- **Wadh** is a new district separated from Khuzdar: the existing Wadh, Ornach and Naal tehsils move to it.
- Renames: Upper Dera Bugti to **North**, and Dera Bugti to **South** Dera Bugti; Sibi district to **Sevi**; Makran to
  **Makuran**. The old names are alternate names.

## Not applied, and why

- The many other new sub-divisions, sub-tehsils and tehsils (Baghbana, Moola, Zeedi, Karkh, Gresha, Aranji, Yak Mach, Nag,
  Ormara, Jiwani, Khanpur, Jia Khan, Murgha Kibzai, Mani Khawa, Shinghar, Mach, Balanari, Rara Sham, Hosarhi, Jandran,
  Toba Kakari and others): the reports give them inconsistently (a unit is a sub-division in one and a tehsil in another,
  and many have no district stated).
- Shaheed Sikandarabad reverting to Surab: the district is left as `Surab` (the September 2025 notification said
  Shaheed Sikandarabad, which is an alternate name).
- Any tehsil codes: none exist for the new units.
