import { describe, expect, it } from 'vitest';
import { OTHER } from '../src/cascade';
import {
  emptyDeliveryAddress,
  getDeliveryLevelStates,
  resolveDeliveryAddress,
  selectDeliveryLevel,
  setDeliveryLevelText,
} from '../src/deliveryCascade';

const pickDelivery = (...steps: [Parameters<typeof selectDeliveryLevel>[1], string][]) =>
  steps.reduce((v, [level, id]) => selectDeliveryLevel(v, level, id), emptyDeliveryAddress());

describe('delivery cascade logic', () => {
  it('starts with only the province list', () => {
    const s = getDeliveryLevelStates(emptyDeliveryAddress());
    expect(s.province.options.length).toBeGreaterThanOrEqual(7);
    expect([s.city.visible, s.area.visible, s.zone.visible]).toEqual([false, false, false]);
  });

  it('shows areas for large cities like Lahore', () => {
    const v = pickDelivery(['province', 'dl-pb'], ['city', 'dl-pb-lahore']);
    const s = getDeliveryLevelStates(v);
    expect(s.area.visible).toBe(true);
    expect(s.area.options.length).toBeGreaterThan(0);
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

  it('clears lower levels when an upper level changes', () => {
    let v = selectDeliveryLevel(emptyDeliveryAddress(), 'province', 'dl-pb');
    v = selectDeliveryLevel(selectDeliveryLevel(v, 'city', 'dl-pb-lahore'), 'area', 'dl-pb-lahore-ali-town');
    v = selectDeliveryLevel(v, 'city', 'dl-pb-multan');
    expect([v.area.id, v.zone.id]).toEqual([null, null]);
  });

  it('resolves delivery address values properly', () => {
    let v = pickDelivery(
      ['province', 'dl-pb'],
      ['city', 'dl-pb-lahore'],
      ['area', 'dl-pb-lahore-gulberg'],
      ['zone', OTHER],
    );
    v = setDeliveryLevelText(v, 'zone', 'Near Main Market');
    v = { ...v, addressLine: 'Office 402, Al-Hafeez Tower' };
    const res = resolveDeliveryAddress(v);
    expect(res.province).toBe('Punjab');
    expect(res.city).toBe('Lahore');
    expect(res.area).toContain('Gulberg');
    expect(res.zone).toBe('Near Main Market');
    expect(res.addressLine).toBe('Office 402, Al-Hafeez Tower');
    expect(res.ids.zone).toBeNull();
    expect(res.ids.city).toBe('dl-pb-lahore');
  });
});
