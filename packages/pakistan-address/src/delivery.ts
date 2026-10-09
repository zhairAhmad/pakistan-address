/**
 * UNOFFICIAL delivery areas: province, city and zone names taken from an online store's address form.
 * These are courier delivery areas, not administrative units, and are not checked against any official source.
 * Import from `pakistan-address/delivery`; the main entry point does not include this data.
 */
import raw from '../data/delivery-areas.json';
import type {
  DeliveryArea,
  DeliveryCity,
  DeliveryData,
  DeliveryMeta,
  DeliveryProvince,
  DeliveryZone,
} from './types';

export type {
  DeliveryArea,
  DeliveryCity,
  DeliveryData,
  DeliveryMeta,
  DeliveryProvince,
  DeliveryZone,
} from './types';

const data = raw as DeliveryData;

function groupBy<T>(items: readonly T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = map.get(k);
    if (list) list.push(item);
    else map.set(k, [item]);
  }
  return map;
}

const indexById = <T extends { id: string }>(items: readonly T[]) => new Map(items.map((i) => [i.id, i]));

const provinceById = indexById(data.provinces);
const cityById = indexById(data.cities);
const areaById = indexById(data.areas);
const zoneById = indexById(data.zones);
const citiesByProvince = groupBy(data.cities, (c) => c.provinceId);
const areasByCity = groupBy(data.areas, (a) => a.cityId);
// A zone sits under its area when its city has areas, otherwise directly under the city.
const zonesByParent = groupBy(data.zones, (z) => z.areaId ?? z.cityId);

const list = <T>(map: Map<string, T[]>, id: string): T[] => [...(map.get(id) ?? [])];

/** All provinces and territories in the delivery list, sorted by name. */
export const getDeliveryProvinces = (): DeliveryProvince[] => [...data.provinces];

/** Cities and delivery areas of a province. */
export const getDeliveryCities = (provinceId: string): DeliveryCity[] => list(citiesByProvince, provinceId);

/**
 * Areas of a city. Only large cities (Lahore, Karachi, Islamabad...) have them; the list is empty for the rest,
 * and their zones come straight from `getDeliveryZones(cityId)`.
 */
export const getDeliveryAreas = (cityId: string): DeliveryArea[] => list(areasByCity, cityId);

/**
 * Zones (neighbourhoods) of an area, or of a city that has no areas. Pass an area id for a city that is split into
 * areas. Empty for the few places that list none.
 */
export const getDeliveryZones = (areaOrCityId: string): DeliveryZone[] => list(zonesByParent, areaOrCityId);

export const getDeliveryProvince = (id: string): DeliveryProvince | undefined => provinceById.get(id);
export const getDeliveryCity = (id: string): DeliveryCity | undefined => cityById.get(id);
export const getDeliveryArea = (id: string): DeliveryArea | undefined => areaById.get(id);
export const getDeliveryZone = (id: string): DeliveryZone | undefined => zoneById.get(id);

/** Collection date, label and source of the delivery data. `unofficial` is always `true`. */
export const getDeliveryMeta = (): DeliveryMeta => ({ ...data.meta, source: { ...data.meta.source } });
