import { useId, useState } from 'react';
import { AddressFields, type AddressFieldsProps } from './AddressFields';
import { DeliveryAddressFields, type DeliveryAddressFieldsProps } from './DeliveryAddressFields';
import type { ResolvedAddress } from './cascade';
import type { ResolvedDeliveryAddress } from './deliveryCascade';

export type AddressSource = 'official' | 'delivery';

export type ResolvedAnyAddress =
  | ({ source: 'official' } & ResolvedAddress)
  | ({ source: 'delivery' } & ResolvedDeliveryAddress);

export interface SwitchableAddressFieldsProps {
  /** Controlled source. Omit to let the component hold it. */
  source?: AddressSource;
  /** Initial source when uncontrolled. Defaults to `official`. */
  defaultSource?: AddressSource;
  onSourceChange?: (source: AddressSource) => void;
  /** Called with the resolved address, tagged with the source it came from. */
  onChange?: (address: ResolvedAnyAddress) => void;
  /** Hide the switch (to fix the source from your own UI). */
  hideSwitch?: boolean;
  switchLabels?: Partial<Record<'legend' | AddressSource, string>>;
  /** Passed to whichever fields are showing. */
  name?: string;
  classNames?: AddressFieldsProps['classNames'];
  /** Use the browser's native `<select>` instead of the custom searchable dropdown. */
  native?: boolean;
  /** Lists longer than this get a search box. Default 10. */
  searchThreshold?: number;
  unstyled?: boolean;
  officialProps?: Omit<AddressFieldsProps, 'name' | 'classNames' | 'onChange'>;
  deliveryProps?: Omit<DeliveryAddressFieldsProps, 'name' | 'classNames' | 'onChange'>;
}

const SWITCH_LABELS = {
  legend: 'Address list',
  official: 'Official administrative units',
  delivery: 'Delivery areas (unofficial)',
};

/**
 * Lets the user switch between the official administrative hierarchy (province, division, district, tehsil)
 * and the unofficial delivery areas (province, city, zone). Switching clears the fields.
 * Importing this component includes both datasets in your bundle.
 */
export function SwitchableAddressFields({
  source: controlled,
  defaultSource = 'official',
  onSourceChange,
  onChange,
  hideSwitch,
  switchLabels,
  name,
  classNames,
  native,
  searchThreshold,
  unstyled,
  officialProps,
  deliveryProps,
}: SwitchableAddressFieldsProps) {
  const [inner, setInner] = useState<AddressSource>(defaultSource);
  const source = controlled ?? inner;
  const text = { ...SWITCH_LABELS, ...switchLabels };
  const group = useId();

  const choose = (next: AddressSource) => {
    if (controlled === undefined) setInner(next);
    onSourceChange?.(next);
  };

  return (
    <div>
      {!hideSwitch && (
        <fieldset className={classNames?.field}>
          <legend className={classNames?.label}>{text.legend}</legend>
          {(['official', 'delivery'] as const).map((s) => (
            <label key={s} className={classNames?.label}>
              <input
                type="radio"
                name={`${group}-source`}
                value={s}
                checked={source === s}
                onChange={() => choose(s)}
              />{' '}
              {text[s]}
            </label>
          ))}
        </fieldset>
      )}
      {source === 'official' ? (
        <AddressFields
          key="official"
          {...officialProps}
          name={name}
          classNames={classNames}
          native={native}
          searchThreshold={searchThreshold}
          unstyled={unstyled}
          onChange={(_value, resolved) => onChange?.({ source: 'official', ...resolved })}
        />
      ) : (
        <DeliveryAddressFields
          key="delivery"
          {...deliveryProps}
          name={name}
          classNames={classNames}
          native={native}
          searchThreshold={searchThreshold}
          unstyled={unstyled}
          onChange={(_value, resolved) => onChange?.({ source: 'delivery', ...resolved })}
        />
      )}
    </div>
  );
}
