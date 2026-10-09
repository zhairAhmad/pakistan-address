// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DeliveryAddressFields,
  SwitchableAddressFields,
  emptyDeliveryAddress,
  getDeliveryLevelStates,
  resolveDeliveryAddress,
  selectDeliveryLevel,
  setDeliveryLevelText,
  type ResolvedAnyAddress,
} from '../src/delivery';
import { OTHER } from '../src/index';

afterEach(cleanup);

const combo = (name: string) => screen.getByRole('combobox', { name }) as HTMLSelectElement;
const hasCombo = (name: string) => screen.queryByRole('combobox', { name }) !== null;
const optionLabels = (select: HTMLElement) => within(select).getAllByRole('option').map((o) => o.textContent);

describe('delivery cascade logic', () => {
  it('starts with only the province list', () => {
    const s = getDeliveryLevelStates(emptyDeliveryAddress());
    expect(s.province.options).toHaveLength(8);
    expect([s.city.visible, s.area.visible, s.zone.visible]).toEqual([false, false, false]);
  });

  it('goes province > city > area > zone for a city that has areas', () => {
    let v = selectDeliveryLevel(emptyDeliveryAddress(), 'province', 'dl-pb');
    let s = getDeliveryLevelStates(v);
    expect(s.city.options.some((o) => o.label === 'Lahore')).toBe(true);
    expect(s.city.options.some((o) => o.label.startsWith('Lahore -'))).toBe(false);

    v = selectDeliveryLevel(v, 'city', 'dl-pb-lahore');
    s = getDeliveryLevelStates(v);
    expect(s.area.visible).toBe(true);
    expect(s.area.options.some((o) => o.label === 'Ali Town')).toBe(true);
    expect(s.zone.visible).toBe(false); // zones wait for an area

    v = selectDeliveryLevel(v, 'area', 'dl-pb-lahore-ali-town');
    s = getDeliveryLevelStates(v);
    expect(s.zone.visible).toBe(true);
    expect(s.zone.options.length).toBeGreaterThan(0);
  });

  it('skips the area step for a city without areas', () => {
    let v = selectDeliveryLevel(emptyDeliveryAddress(), 'province', 'dl-ajk');
    const bagh = getDeliveryLevelStates(v).city.options.find((o) => o.label === 'Bagh')!;
    v = selectDeliveryLevel(v, 'city', bagh.value);
    const s = getDeliveryLevelStates(v);
    expect(s.area.visible).toBe(false);
    expect(s.zone.visible).toBe(true);
    expect(s.zone.options.length).toBeGreaterThan(0);
  });

  it('clears the levels below when a higher level changes', () => {
    let v = selectDeliveryLevel(emptyDeliveryAddress(), 'province', 'dl-pb');
    v = selectDeliveryLevel(selectDeliveryLevel(v, 'city', 'dl-pb-lahore'), 'area', 'dl-pb-lahore-ali-town');
    v = selectDeliveryLevel(v, 'city', 'dl-pb-multan');
    expect([v.area.id, v.zone.id]).toEqual([null, null]);
  });

  it('falls back to text for "Other" at city, area and zone', () => {
    let v = selectDeliveryLevel(emptyDeliveryAddress(), 'province', 'dl-pb');
    v = selectDeliveryLevel(v, 'city', OTHER);
    const s = getDeliveryLevelStates(v);
    expect(s.city.showText).toBe(true);
    expect(s.area.visible).toBe(false);
    expect(s.zone.showText).toBe(true);
    v = setDeliveryLevelText(setDeliveryLevelText(v, 'city', ' New Town '), 'zone', 'Block 1');
    expect(resolveDeliveryAddress({ ...v, addressLine: ' House 1 ' })).toEqual({
      province: 'Punjab',
      city: 'New Town',
      area: '',
      zone: 'Block 1',
      addressLine: 'House 1',
      ids: { province: 'dl-pb', city: null, area: null, zone: null },
    });
  });
});

describe('<DeliveryAddressFields />', () => {
  it('always shows the unofficial notice', () => {
    render(<DeliveryAddressFields />);
    expect(screen.getByRole('note').textContent).toMatch(/unofficial/i);
  });

  it('can hide the notice', () => {
    render(<DeliveryAddressFields hideNotice />);
    expect(screen.queryByRole('note')).toBeNull();
  });

  it('shows the Area select for Lahore, reports ids and names, and posts under the name prefix', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <form>
        <DeliveryAddressFields name="ship" onChange={onChange} />
      </form>,
    );
    await user.selectOptions(combo('Province'), 'Punjab');
    await user.selectOptions(combo('City'), 'Lahore');
    expect(hasCombo('Zone / neighbourhood')).toBe(false);
    await user.selectOptions(combo('Area'), 'Ali Town');
    const zone = optionLabels(combo('Zone / neighbourhood')).find((l) => l && !/Select|Other/.test(l))!;
    await user.selectOptions(combo('Zone / neighbourhood'), zone);

    const resolved = onChange.mock.lastCall![1];
    expect(resolved).toMatchObject({ province: 'Punjab', city: 'Lahore', area: 'Ali Town', zone });
    expect(resolved.ids).toMatchObject({ city: 'dl-pb-lahore', area: 'dl-pb-lahore-ali-town' });
    const data = new FormData(container.querySelector('form')!);
    expect(data.get('ship[cityId]')).toBe('dl-pb-lahore');
    expect(data.get('ship[areaId]')).toBe('dl-pb-lahore-ali-town');
  });

  it('skips the Area select for a plain city', async () => {
    const user = userEvent.setup();
    render(<DeliveryAddressFields />);
    await user.selectOptions(combo('Province'), 'Azad Kashmir');
    await user.selectOptions(combo('City'), 'Bagh');
    expect(hasCombo('Area')).toBe(false);
    expect(hasCombo('Zone / neighbourhood')).toBe(true);
  });

  it('has no accessibility violations (axe-core), including with an "Other" input', async () => {
    const user = userEvent.setup();
    const { container } = render(<DeliveryAddressFields />);
    await user.selectOptions(combo('Province'), 'Punjab');
    await user.selectOptions(combo('City'), 'Lahore');
    await user.selectOptions(combo('Area'), 'Other / not listed');
    const results = await axe.run(container, { rules: { region: { enabled: false } } });
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});

describe('<SwitchableAddressFields />', () => {
  it('starts on official data and switches to the unofficial delivery areas', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(a: ResolvedAnyAddress) => void>();
    render(<SwitchableAddressFields onChange={onChange} />);

    expect(screen.getByRole('radio', { name: 'Official administrative units' })).toHaveProperty('checked', true);
    await user.selectOptions(combo('Province'), 'Punjab');
    expect(onChange.mock.lastCall![0]).toMatchObject({ source: 'official', province: 'Punjab' });
    expect(screen.queryByRole('note')).toBeNull();

    await user.click(screen.getByRole('radio', { name: 'Delivery areas (unofficial)' }));
    expect(screen.getByRole('note').textContent).toMatch(/unofficial/i);
    expect(combo('Province').value).toBe(''); // switching clears the fields
    await user.selectOptions(combo('Province'), 'Punjab');
    await user.selectOptions(combo('City'), 'Lahore');
    await user.selectOptions(combo('Area'), 'Ali Town');
    expect(onChange.mock.lastCall![0]).toMatchObject({ source: 'delivery', city: 'Lahore', area: 'Ali Town' });
  });

  it('supports a controlled source and a hidden switch', () => {
    render(<SwitchableAddressFields source="delivery" hideSwitch />);
    expect(screen.queryByRole('radio')).toBeNull();
    expect(screen.getByRole('note')).toBeTruthy();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<SwitchableAddressFields />);
    const results = await axe.run(container, { rules: { region: { enabled: false } } });
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
