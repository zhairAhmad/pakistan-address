import { describe, expect, it } from 'vitest';
import {
  getDeliveryArea,
  getDeliveryAreas,
  getDeliveryCities,
  getDeliveryCity,
  getDeliveryMeta,
  getDeliveryProvince,
  getDeliveryProvinces,
  getDeliveryZone,
  getDeliveryZones,
} from '../src/delivery';
import { getProvince, getProvinces } from '../src/index';

const allCities = () => getDeliveryProvinces().flatMap((p) => getDeliveryCities(p.id));

describe('delivery areas (unofficial)', () => {
  it('is labelled unofficial', () => {
    const meta = getDeliveryMeta();
    expect(meta.unofficial).toBe(true);
    expect(meta.label).toMatch(/unofficial/i);
    expect(meta.description).toMatch(/not checked/i);
    expect(meta.description).toMatch(/not administrative units/i);
  });

  it('has the expected totals', () => {
    const provinces = getDeliveryProvinces();
    const cities = allCities();
    const areas = cities.flatMap((c) => getDeliveryAreas(c.id));
    const zones = [...cities.filter((c) => !getDeliveryAreas(c.id).length), ...areas].flatMap((p) => getDeliveryZones(p.id));
    expect([provinces.length, cities.length, areas.length, zones.length]).toEqual([8, 682, 407, 11356]);
  });

  it('splits "Lahore - Ali Town" into the city Lahore and its area Ali Town', () => {
    const pb = getDeliveryProvinces().find((p) => p.name === 'Punjab')!;
    expect(pb.id).toBe('dl-pb');
    const cities = getDeliveryCities(pb.id);
    expect(cities.filter((c) => c.name === 'Lahore')).toHaveLength(1);
    expect(cities.some((c) => c.name.startsWith('Lahore -'))).toBe(false);

    const lahore = cities.find((c) => c.name === 'Lahore')!;
    expect(lahore.id).toBe('dl-pb-lahore');
    const areas = getDeliveryAreas(lahore.id);
    expect(areas).toHaveLength(103);
    const aliTown = areas.find((a) => a.name === 'Ali Town')!;
    expect(aliTown).toEqual({ id: 'dl-pb-lahore-ali-town', cityId: 'dl-pb-lahore', name: 'Ali Town' });

    const zones = getDeliveryZones(aliTown.id);
    expect(zones.length).toBeGreaterThan(0);
    expect(zones.every((z) => z.areaId === aliTown.id && z.cityId === lahore.id)).toBe(true);
    // a city that has areas keeps no zones directly under it
    expect(getDeliveryZones(lahore.id)).toEqual([]);
  });

  it('keeps plain cities without an area step', () => {
    const bagh = getDeliveryCities('dl-ajk').find((c) => c.name === 'Bagh')!;
    expect(getDeliveryAreas(bagh.id)).toEqual([]);
    const zones = getDeliveryZones(bagh.id);
    expect(zones.length).toBeGreaterThan(0);
    expect(zones.every((z) => z.areaId === undefined && z.cityId === bagh.id)).toBe(true);
  });

  it('does not split a name that has only one entry', () => {
    const names = allCities().map((c) => c.name);
    expect(names).toContain('Gojra - Toba Tek Singh');
    expect(names).not.toContain('Gojra');
  });

  it('keeps the zones of cities listed both ways in an area named after the city', () => {
    const sargodha = getDeliveryCities('dl-pb').find((c) => c.name === 'Sargodha')!;
    const main = getDeliveryAreas(sargodha.id).find((a) => a.name === 'Sargodha')!;
    expect(main).toBeDefined();
    expect(getDeliveryZones(main.id).length).toBeGreaterThan(100);
    expect(getDeliveryAreas(sargodha.id).map((a) => a.name)).toContain('Bhalwal');
  });

  it('links provinces to the official data where one exists', () => {
    for (const p of getDeliveryProvinces()) {
      if (p.officialProvinceId) expect(getProvince(p.officialProvinceId)).toBeDefined();
    }
    const withoutLink = getDeliveryProvinces().filter((p) => !p.officialProvinceId);
    expect(withoutLink.map((p) => p.name)).toEqual(['Federally Administered Tribal Areas']);
    // every official province has a delivery counterpart
    const linked = new Set(getDeliveryProvinces().map((p) => p.officialProvinceId));
    expect(getProvinces().every((p) => linked.has(p.id))).toBe(true);
  });

  it('keeps its ids apart from the official ids and looks records up by id', () => {
    expect(getDeliveryProvince('pb')).toBeUndefined();
    expect(getDeliveryCity('pb-lahore')).toBeUndefined();
    expect(getDeliveryProvince('dl-pb')?.name).toBe('Punjab');
    expect(getDeliveryCity('dl-pb-lahore')?.name).toBe('Lahore');
    expect(getDeliveryArea('dl-pb-lahore-ali-town')?.name).toBe('Ali Town');
    const zone = getDeliveryZones('dl-pb-lahore-ali-town')[0];
    expect(getDeliveryZone(zone.id)).toEqual(zone);
  });

  it('returns copies and empty lists for unknown ids', () => {
    const a = getDeliveryProvinces();
    a.pop();
    expect(getDeliveryProvinces()).toHaveLength(8);
    expect(getDeliveryCities('nope')).toEqual([]);
    expect(getDeliveryAreas('nope')).toEqual([]);
    expect(getDeliveryZones('nope')).toEqual([]);
    expect(getDeliveryZone('nope')).toBeUndefined();
  });

  it('has a few places with no zones', () => {
    const cities = allCities();
    const emptyPlaces = [
      ...cities.filter((c) => !getDeliveryAreas(c.id).length),
      ...cities.flatMap((c) => getDeliveryAreas(c.id)),
    ].filter((p) => getDeliveryZones(p.id).length === 0);
    expect(emptyPlaces).toHaveLength(6);
  });
});
