import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  AddressFields,
  OTHER,
  emptyAddress,
  getLevelStates,
  resolveAddress,
  selectLevel,
  setLevelText,
} from '../src/index';

const pick = (...steps: [Parameters<typeof selectLevel>[1], string][]) =>
  steps.reduce((v, [level, id]) => selectLevel(v, level, id), emptyAddress());

describe('cascade logic', () => {
  it('starts with only the province list', () => {
    const s = getLevelStates(emptyAddress());
    expect(s.province.options).toHaveLength(7);
    expect([s.division.visible, s.district.visible, s.tehsil.visible]).toEqual([false, false, false]);
  });

  it('filters each level from the previous one', () => {
    const v = pick(['province', 'pb'], ['division', 'pb-multan-div'], ['district', 'pb-vehari']);
    const s = getLevelStates(v);
    expect(s.division.options.map((o) => o.label)).toContain('Multan');
    expect(s.district.options.map((o) => o.label)).toEqual(['Khanewal', 'Lodhran', 'Multan', 'Vehari']);
    expect(s.tehsil.options.map((o) => o.label)).toContain('Mailsi');
    expect(s.tehsil.showText).toBe(false);
  });

  it('resets lower levels when a higher one changes', () => {
    const v = pick(['province', 'pb'], ['division', 'pb-multan-div'], ['district', 'pb-vehari']);
    const changed = selectLevel(v, 'division', 'pb-lahore-div');
    expect(changed.district).toEqual({ id: null, text: '' });
    expect(changed.tehsil).toEqual({ id: null, text: '' });
  });

  it('skips the division level for Islamabad', () => {
    const v = pick(['province', 'ict']);
    const s = getLevelStates(v);
    expect(s.division.visible).toBe(false);
    expect(s.district.visible).toBe(true);
    expect(s.district.options.map((o) => o.label)).toEqual(['Islamabad']);
    const withDistrict = getLevelStates(selectLevel(v, 'district', 'ict-islamabad'));
    expect(withDistrict.tehsil.visible).toBe(true);
    expect(withDistrict.tehsil.options.map((o) => o.label)).toEqual(['Islamabad']);
  });

  it('offers the whole province when the division is "Other"', () => {
    const v = pick(['province', 'pb'], ['division', OTHER]);
    const s = getLevelStates(v);
    expect(s.division.showText).toBe(true);
    expect(s.district.visible).toBe(true);
    expect(s.district.options.length).toBeGreaterThan(30);
  });

  it('turns tehsil into free text when the district is "Other"', () => {
    const v = pick(['province', 'pb'], ['division', 'pb-multan-div'], ['district', OTHER]);
    const s = getLevelStates(v);
    expect(s.district.showText).toBe(true);
    expect(s.tehsil.options).toEqual([]);
    expect(s.tehsil.showText).toBe(true);
  });

  it('resolves listed names and free text', () => {
    let v = pick(['province', 'pb'], ['division', 'pb-multan-div'], ['district', OTHER], ['tehsil', OTHER]);
    v = setLevelText(setLevelText(v, 'district', ' New District '), 'tehsil', 'New Tehsil');
    v = { ...v, addressLine: ' House 1, near the mosque ' };
    expect(resolveAddress(v)).toEqual({
      province: 'Punjab',
      division: 'Multan',
      district: 'New District',
      tehsil: 'New Tehsil',
      addressLine: 'House 1, near the mosque',
      ids: { province: 'pb', division: 'pb-multan-div', district: null, tehsil: null },
    });
  });
});

describe('<AddressFields />', () => {
  it('renders province plus the address line initially', () => {
    const html = renderToStaticMarkup(<AddressFields />);
    expect(html).toContain('Province');
    expect(html).toContain('Punjab');
    expect(html).toContain('Full address / landmark');
    expect(html).not.toContain('Division');
  });

  it('shows the province notice for Balochistan only', () => {
    const bl = renderToStaticMarkup(<AddressFields defaultValue={pick(['province', 'bl'])} />);
    expect(bl).toContain('role="note"');
    expect(bl).toContain('July 2026');
    const pb = renderToStaticMarkup(<AddressFields defaultValue={pick(['province', 'pb'])} />);
    expect(pb).not.toContain('role="note"');
  });

  it('renders an "Other / not listed" option once a level has choices', () => {
    const defaultValue = pick(['province', 'pb']);
    const html = renderToStaticMarkup(<AddressFields defaultValue={defaultValue} />);
    expect(html).toContain('Division');
    expect(html).toContain('Other / not listed');
  });
});
