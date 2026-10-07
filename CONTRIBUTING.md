# Contributing

The most valuable contribution is a **correction backed by an official source**: a Pakistan Bureau of Statistics list, a provincial Board of Revenue / Local Government notification, or a gazette (the Punjab one of 18 December 2024 is already applied; see `packages/pakistan-address/data-sources/punjab-2024/`).

## Fixing or adding a record

1. Edit `packages/pakistan-address/data/pakistan.json`:
   - Ids are lowercase kebab-case: `<province>-<name>` (divisions end in `-div`, tehsils are `<district-id>-<name>`).
   - Every record points to its parent by id (`provinceId`, `divisionId`, `districtId`). `divisionId` is `null` only for Islamabad.
   - Keep arrays sorted by `name`.
   - `pcode` is the OCHA COD-AB place code and `pbsCode` the PBS census 2023 code. Leave them out for units those sources do not list; never invent one.
   - Bump `meta.dataVersion` to today's date.
2. Run the checks:

   ```bash
   npm install
   npm test
   ```

   `npm run validate -w pakistan-address` checks ids, parents, duplicates and trimmed names; the same check runs in CI.
3. In the PR description, link the source (and, if relevant, the date of the notification).
4. If you resolve an item in [DATA.md → Known gaps](./packages/pakistan-address/DATA.md#known-gaps), remove it from the table.

Please do not copy data from a source whose licence doesn't allow it. Facts such as unit names are fine; wholesale copies of someone's database or PDF tables are not. When in doubt, say where the data came from and we'll check.

## Renaming or removing

Ids are meant to be stable. If a unit is renamed, keep the id and change `name`; if it is abolished, remove it and say so in the PR so it can go in the changelog.

## v2: chaks, towns and mouzas

`localities` is reserved in the data format (`{ id, districtId, tehsilId?, name, type }`, `type`: `chak` | `town` | `mouza` | `village`) but empty. Proposals for sourcing it are welcome as issues first.
