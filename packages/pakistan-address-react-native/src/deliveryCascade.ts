import {
  getDeliveryArea,
  getDeliveryAreas,
  getDeliveryCities,
  getDeliveryCity,
  getDeliveryProvince,
  getDeliveryProvinces,
  getDeliveryZone,
  getDeliveryZones,
} from 'pakistan-address/delivery';
import { type LevelState, type LevelValue, type Option, OTHER } from './cascade';

/**
 * Cascade logic for the UNOFFICIAL delivery areas: province > city > area > zone. The area step only exists for the
 * large cities that are split into areas (Lahore, Karachi, Islamabad...); other cities go straight to zones.
 * Delivery cities, areas and zones are courier delivery places, not administrative units.
 */
export type DeliveryLevel = 'province' | 'city' | 'area' | 'zone';
const LEVELS: DeliveryLevel[] = ['province', 'city', 'area', 'zone'];

export interface DeliveryAddressValue {
  province: LevelValue;
  city: LevelValue;
  area: LevelValue;
  zone: LevelValue;
  /** House number, street, landmark. */
  addressLine: string;
}

export interface ResolvedDeliveryAddress {
  province: string;
  city: string;
  /** Empty for cities that are not split into areas. */
  area: string;
  zone: string;
  addressLine: string;
  /** Ids (`dl-...`) of the levels picked from the lists; `null` for typed, skipped or empty levels. */
  ids: Record<DeliveryLevel, string | null>;
}

const emptyLevel = (): LevelValue => ({ id: null, text: '' });

export const emptyDeliveryAddress = (): DeliveryAddressValue => ({
  province: emptyLevel(),
  city: emptyLevel(),
  area: emptyLevel(),
  zone: emptyLevel(),
  addressLine: '',
});

const toOptions = (items: { id: string; name: string }[]): Option[] =>
  items.map((i) => ({ value: i.id, label: i.name }));
const isListed = (v: LevelValue) => v.id !== null && v.id !== OTHER;
const chosen = (v: LevelValue) => v.id !== null;

export function getDeliveryLevelStates(value: DeliveryAddressValue): Record<DeliveryLevel, LevelState> {
  const provinceId = isListed(value.province) ? value.province.id! : null;
  const cities = provinceId ? getDeliveryCities(provinceId) : [];

  const cityId = isListed(value.city) ? value.city.id! : null;
  const areas = cityId ? getDeliveryAreas(cityId) : [];
  const cityHasAreas = areas.length > 0;

  const areaId = isListed(value.area) ? value.area.id! : null;
  // Zones hang off the area when the city has areas, otherwise off the city itself.
  const zoneParent = cityHasAreas ? areaId : cityId;
  const zones = zoneParent ? getDeliveryZones(zoneParent) : [];

  const cityVisible = !!provinceId;
  const areaVisible = cityVisible && cityHasAreas;
  const zoneVisible = cityHasAreas ? chosen(value.area) : cityVisible && chosen(value.city);

  return {
    province: { visible: true, options: toOptions(getDeliveryProvinces()), allowOther: false, showText: false },
    city: {
      visible: cityVisible,
      options: toOptions(cities),
      allowOther: true,
      showText: value.city.id === OTHER,
    },
    area: {
      visible: areaVisible,
      options: toOptions(areas),
      allowOther: true,
      showText: value.area.id === OTHER,
    },
    zone: {
      visible: zoneVisible,
      options: toOptions(zones),
      // A place with no zones (or an unlisted one): text only.
      allowOther: zones.length > 0,
      showText: zoneVisible && (zones.length === 0 || value.zone.id === OTHER),
    },
  };
}

/** Choose (or clear, with `null`) a level; every level below it is cleared. */
export function selectDeliveryLevel(
  value: DeliveryAddressValue,
  level: DeliveryLevel,
  id: string | null,
): DeliveryAddressValue {
  const next = { ...value, [level]: { id, text: '' } };
  for (const lower of LEVELS.slice(LEVELS.indexOf(level) + 1)) next[lower] = emptyLevel();
  return next;
}

export function setDeliveryLevelText(
  value: DeliveryAddressValue,
  level: DeliveryLevel,
  text: string,
): DeliveryAddressValue {
  return { ...value, [level]: { ...value[level], text } };
}

const lookups = { province: getDeliveryProvince, city: getDeliveryCity, area: getDeliveryArea, zone: getDeliveryZone };

export function resolveDeliveryAddress(value: DeliveryAddressValue): ResolvedDeliveryAddress {
  const name = (level: DeliveryLevel) =>
    isListed(value[level]) ? (lookups[level](value[level].id!)?.name ?? '') : value[level].text.trim();
  const id = (level: DeliveryLevel) => (isListed(value[level]) ? value[level].id : null);
  return {
    province: name('province'),
    city: name('city'),
    area: name('area'),
    zone: name('zone'),
    addressLine: value.addressLine.trim(),
    ids: { province: id('province'), city: id('city'), area: id('area'), zone: id('zone') },
  };
}
