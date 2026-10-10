# Source watch

`npm run watch -w pakistan-address` (or `node scripts/check-official-sources.mjs`) reads a few public listing pages that
publish notifications of administrative units and reports what is new since `snapshot.json`:

- Balochistan Board of Revenue, notifications: <https://bor.balochistan.gov.pk/notifications/>
- Khyber Pakhtunkhwa Board of Revenue, notifications: <https://revenue.kp.gov.pk/notification/>
- Provincial Assembly of Balochistan, acts: <https://pabalochistan.gov.pk/acts>

It contacts nobody and needs no login. Run it about monthly. When it prints `NEW ... (looks relevant)`:

1. open the document and read it;
2. add what it says to the matching `data-sources/` folder (names and notification numbers only);
3. apply it to `data/pakistan.json` (as `apply-balochistan-bor.mjs` did), run `npm test`, and add a changelog entry;
4. run `npm run watch -w pakistan-address -- --update` to save the new snapshot.

The one most worth waiting for: the Balochistan Revenue Department notification of about 8 July 2026, which would
replace the press-reported division and district level (see `../balochistan-bor/july-2026-press-report.md`).
