## What and why

<!-- What does this change, and why? -->

## Type

- [ ] Data change (`packages/pakistan-address/data/pakistan.json`)
- [ ] Code or tests
- [ ] Docs

## Data changes only

- Source (link and date of the notification, gazette or list): 
- [ ] The source is official, or I have said below that it is a press report
- [ ] I did not copy data from a source whose licence doesn't allow it
- [ ] Ids are kebab-case, arrays stay sorted by `name`, no invented `pcode` / `pbsCode`
- [ ] `meta.dataVersion` is bumped to today's date
- [ ] I removed any resolved item from DATA.md → Known gaps
- [ ] If a unit is abolished or renamed, I described it here so it can go in the changelog

## Checks

- [ ] `npm test` passes (it includes `npm run validate -w pakistan-address`)
- [ ] `npm run build` passes
