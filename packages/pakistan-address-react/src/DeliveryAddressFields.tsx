import { useId } from 'react';
import { getDeliveryMeta } from 'pakistan-address/delivery';
import { OTHER } from './cascade';
import type { DeliveryLevel } from './deliveryCascade';
import { type UseDeliveryCascadeOptions, useDeliveryCascade } from './useDeliveryCascade';

export interface DeliveryAddressFieldsProps extends UseDeliveryCascadeOptions {
  labels?: Partial<Record<DeliveryLevel | 'addressLine' | 'other' | 'placeholder' | 'notice', string>>;
  /** Class names for styling: `root`, `field`, `label`, `select`, `input`, `notice`. */
  classNames?: Partial<Record<'root' | 'field' | 'label' | 'select' | 'input' | 'notice', string>>;
  /** Prefix for form field names: `name[provinceId]`, `name[cityId]`, `name[areaId]`, `name[zoneId]`, ... */
  name?: string;
  /** Hide the "unofficial" notice. Only do this if you tell your users the source some other way. */
  hideNotice?: boolean;
}

const DEFAULT_LABELS = {
  province: 'Province',
  city: 'City',
  area: 'Area',
  zone: 'Zone / neighbourhood',
  addressLine: 'Full address / landmark',
  other: 'Other / not listed',
  placeholder: 'Select...',
  notice:
    'Unofficial list of delivery areas taken from an online store. These are not administrative units (districts, tehsils) and may be incomplete or out of date.',
};

const LEVELS: DeliveryLevel[] = ['province', 'city', 'area', 'zone'];

/**
 * Province, city, area and zone fields built on the UNOFFICIAL delivery areas (names from an online store's address
 * form). The area step shows only for the large cities that have areas. They suit courier addresses; for
 * administrative units use `AddressFields`.
 */
export function DeliveryAddressFields({
  labels,
  classNames = {},
  name,
  hideNotice,
  ...options
}: DeliveryAddressFieldsProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const c = useDeliveryCascade(options);
  const uid = useId();
  const field = (key: string) => (name ? `${name}[${key}]` : key);

  return (
    <div className={classNames.root} data-source="delivery" data-unofficial={getDeliveryMeta().unofficial}>
      {!hideNotice && (
        <p role="note" className={classNames.notice}>
          {text.notice}
        </p>
      )}
      {LEVELS.map((level) => {
        const state = c.levels[level];
        if (!state.visible) return null;
        const id = `${uid}-${level}`;
        const hasList = state.options.length > 0;
        return (
          <div key={level} className={classNames.field}>
            <label htmlFor={id} className={classNames.label}>
              {text[level]}
            </label>
            {hasList && (
              <select
                id={id}
                name={field(`${level}Id`)}
                className={classNames.select}
                value={c.value[level].id ?? ''}
                onChange={(e) => c.select(level, e.target.value || null)}
              >
                <option value="">{text.placeholder}</option>
                {state.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
                {state.allowOther && <option value={OTHER}>{text.other}</option>}
              </select>
            )}
            {state.showText && (
              <input
                id={hasList ? undefined : id}
                type="text"
                name={field(`${level}Other`)}
                className={classNames.input}
                value={c.value[level].text}
                aria-label={hasList ? `${text[level]} (${text.other})` : undefined}
                onChange={(e) => c.setText(level, e.target.value)}
              />
            )}
          </div>
        );
      })}
      <div className={classNames.field}>
        <label htmlFor={`${uid}-addressLine`} className={classNames.label}>
          {text.addressLine}
        </label>
        <textarea
          id={`${uid}-addressLine`}
          name={field('addressLine')}
          className={classNames.input}
          value={c.value.addressLine}
          onChange={(e) => c.setAddressLine(e.target.value)}
        />
      </div>
    </div>
  );
}
