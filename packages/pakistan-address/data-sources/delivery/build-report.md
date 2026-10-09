# Delivery areas: build report

Built by `scripts/build-delivery-data.mjs` from a local collection of the address-form lists of an online store,
collected 2026-10-09. The raw collection is **not** in the repository.

Result: 8 provinces, 682 cities, 407 areas, 11356 zones.

## How the store's lists were reshaped
The store lists big cities as many separate "City - Area" entries. Each entry is split at the first " - ": the part
before is the **city**, the part after is an **area** of it. Plain entries stay cities with no areas, and their zones sit
directly under the city. A city is only split when the store lists two or more areas for it. So the levels are
province > city > area (only for the cities below) > zone.

Cities that were split (17):
- Quetta (Balochistan): 11 areas
- Islamabad (Islamabad): 62 areas
- Peshawar (Khyber Pakhtunkhwa): 13 areas
- Bahawalpur (Punjab): 12 areas
- Faisalabad (Punjab): 16 areas
- Gujranwala (Punjab): 27 areas
- Gujrat (Punjab): 4 areas
- Lahore (Punjab): 103 areas
- Multan (Punjab): 16 areas
- Okara (Punjab): 7 areas
- Rawalpindi (Punjab): 29 areas
- Sargodha (Punjab): 3 areas
- Sargodha Chak (Punjab): 2 areas
- Sheikhupura (Punjab): 3 areas
- Sialkot (Punjab): 8 areas
- Hyderabad (Sindh): 5 areas
- Karachi (Sindh): 84 areas

Entries that looked like "City - Area" but are the only one for that city, kept as plain cities (6):
- Bara - Khyber Agency (Khyber Pakhtunkhwa)
- Jamrud - Khyber Agency (Khyber Pakhtunkhwa)
- Landikotal - Khyber Agency (Khyber Pakhtunkhwa)
- Faisalabad Chak - Jhumra (Punjab)
- Gojra - Toba Tek Singh (Punjab)
- Sahiwal Chota - Sargodha (Punjab)

Cities listed both with areas and as a bare city with its own zones (2):
- Sargodha (Punjab): 224 zones kept in an area named "Sargodha"
- Sheikhupura (Punjab): 54 zones kept in an area named "Sheikhupura"

## Other cleaning
Names: runs of spaces collapsed, ends trimmed, en dashes written as hyphens. Ids are this package's own
(`dl-<province>-<city>-<area>-<zone>`), not the store's.

### Removed
- Kamalia (Khyber Pakhtunkhwa): Kamalia listed under Khyber Pakhtunkhwa with no zones; Kamalia is in Punjab (Toba Tek Singh), and a Punjab entry exists

### Merged: same name with different capitalisation (2)
- "Chak 239 GB Galhar" merged into "Chak 239 Gb Galhar" (Jaranwala)
- "Tameer-E-Hayat Colony" merged into "Tameer-e-Hayat Colony" (Wah)

### Names changed by cleaning (3)
- "Islamabad – Airport New Societies" -> "Islamabad - Airport New Societies"
- "Ghulam Muhammadabad  2" -> "Ghulam Muhammadabad 2"
- "Chak -  8 Nb" -> "Chak - 8 Nb"

### Places with no zones (6)
- Winder (Balochistan)
- Chowk Munda (Punjab)
- Fortabbas (Punjab)
- Jamalpur (Punjab)
- Lahore - Thokar Multan Road (Punjab)
- Multan - Vehari Chowk (Punjab)

### Ids that needed a numeric suffix (9)
- dl-pb-faisalabad-satayana-road-al-najaf-colony-2
- dl-pb-jaranwala-chak-128-gb-2
- dl-pb-okara-main-city-b-line-2
- dl-pb-rahim-yar-khan-chak-110-p-2
- dl-pb-sahiwal-93-9-l-2
- dl-pb-sahiwal-91-6-r-2
- dl-pb-sahiwal-92-6-r-2
- dl-pb-sahiwal-95-6-r-2
- dl-pb-sargodha-sargodha-khayaban-e-sher-2
