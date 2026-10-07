// Copy of the react-select example in README.md ("Headless hook"), plus a readout of the resolved value.
// Keep the two in sync.
import Select from 'react-select';
import { OTHER, useAddressCascade } from '../src/index';

export function ProvinceDivisionDistrict() {
  const c = useAddressCascade();
  const withOther = (level: 'division' | 'district') => [
    ...c.levels[level].options,
    { value: OTHER, label: 'Other / not listed' },
  ];
  const find = (options: { value: string }[], id: string | null) => options.find((o) => o.value === id) ?? null;

  return (
    <>
      <Select
        aria-label="Province"
        options={c.levels.province.options}
        value={find(c.levels.province.options, c.value.province.id)}
        onChange={(o) => c.select('province', o?.value ?? null)}
      />
      {c.levels.division.visible && (
        <Select
          aria-label="Division"
          options={withOther('division')}
          value={find(withOther('division'), c.value.division.id)}
          onChange={(o) => c.select('division', o?.value ?? null)}
        />
      )}
      {c.levels.district.visible && (
        <Select
          aria-label="District"
          options={withOther('district')}
          value={find(withOther('district'), c.value.district.id)}
          onChange={(o) => c.select('district', o?.value ?? null)}
        />
      )}
      {c.levels.district.showText && (
        <input
          aria-label="District (other)"
          value={c.value.district.text}
          onChange={(e) => c.setText('district', e.target.value)}
        />
      )}
      <output data-testid="resolved">{JSON.stringify(c.address)}</output>
    </>
  );
}
