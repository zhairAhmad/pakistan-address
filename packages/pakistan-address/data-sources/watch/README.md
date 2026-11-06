# Source watch

`npm run watch` (or `node scripts/check-official-sources.mjs`) reads public listing pages that
publish notifications of administrative units and reports what is new since `snapshot.json`:

- Balochistan Board of Revenue, notifications: <https://bor.balochistan.gov.pk/notifications/>
- Khyber Pakhtunkhwa Board of Revenue, notifications: <https://revenue.kp.gov.pk/notification/>
- Provincial Assembly of Balochistan, acts: <https://pabalochistan.gov.pk/acts>

It contacts nobody and needs no login.

## Automated Monitoring

A GitHub Action ([`.github/workflows/source-watch.yml`](../../../../.github/workflows/source-watch.yml)) runs this script automatically on the **1st of every month** at 06:00 UTC.

When new notifications are detected:
1. GitHub Actions automatically opens or updates a GitHub Issue with the Markdown report containing links to the new gazettes/documents.
2. The maintainer reviews the flagged documents.
3. If relevant administrative boundary changes (districts, tehsils, divisions) are confirmed:
   - Add the notification details to the appropriate `data-sources/` directory.
   - Apply the changes to `data/pakistan.json`.
   - Run `npm test` and record changes in `CHANGELOG.md`.
4. Update `snapshot.json` by running `npm run watch -- --update` (or trigger the GitHub Action manually with the `update_snapshot` checkbox).
5. Close the GitHub Issue.

The notification most worth waiting for: the Balochistan Revenue Department notification of about 8 July 2026, which would replace the press-reported division and district level (see `../balochistan-bor/july-2026-press-report.md`).
