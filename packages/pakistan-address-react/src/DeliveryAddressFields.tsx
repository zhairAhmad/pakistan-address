import { useId } from 'react';
import { getDeliveryMeta } from 'pakistan-address/delivery';
import { OTHER, type Option } from './cascade';
import { Combobox, type ComboboxClassNames } from './Combobox';
import type { DeliveryLevel } from './deliveryCascade';
import { type UseDeliveryCascadeOptions, useDeliveryCascade } from './useDeliveryCascade';

export interface DeliveryAddressFieldsProps extends UseDeliveryCascadeOptions {
  labels?: Partial<
    Record<
      DeliveryLevel | 'addressLine' | 'other' | 'placeholder' | 'searchPlaceholder' | 'noResults' | 'clear' | 'notice',
      string
    >
  >;
  /**
   * Class names for styling: `root`, `field`, `label`, `select` (the text box of each dropdown, or the native
   * `<select>`), `input` (typed-in text and the address line), `notice`, plus `control`, `clear`, `toggle`, `listbox`,
   * `option` and `empty` for the custom dropdown.
   */
  classNames?: Partial<Record<'root' | 'field' | 'label' | 'select' | 'input' | 'notice', string>> &
    Omit<ComboboxClassNames, 'root' | 'input'> & { combobox?: string };
  /** Prefix for form field names: `name[provinceId]`, `name[cityId]`, `name[areaId]`, `name[zoneId]`, ... */
  name?: string;
  /** Hide the "unofficial" notice. Only do this if you tell your users the source some other way. */
  hideNotice?: boolean;
  /** Use the browser's native `<select>` instead of the custom searchable dropdown. */
  native?: boolean;
  /** Lists longer than this get a search box (custom dropdown only). Default 10. */
  searchThreshold?: number;
  /** Drop the dropdown's built-in inline styles so your own CSS decides how it looks. */
  unstyled?: boolean;
}

const DEFAULT_LABELS = {
  province: 'Province',
  city: 'City',
  area: 'Area',
  zone: 'Zone / neighbourhood',
  addressLine: 'Full address / landmark',
  other: 'Other / not listed',
  placeholder: 'Select...',
  searchPlaceholder: 'Select or type to search...',
  noResults: 'No matches',
  clear: 'Clear',
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
  native,
  searchThreshold,
  unstyled,
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
        const listed: Option[] = state.allowOther
          ? [...state.options, { value: OTHER, label: text.other, pinned: true }]
          : state.options;
        return (
          <div key={level} className={classNames.field}>
            <label htmlFor={id} className={classNames.label}>
              {text[level]}
            </label>
            {hasList &&
              (native ? (
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
              ) : (
                <Combobox
                  id={id}
                  name={field(`${level}Id`)}
                  options={listed}
                  value={c.value[level].id}
                  onChange={(v) => c.select(level, v)}
                  placeholder={text.placeholder}
                  searchPlaceholder={text.searchPlaceholder}
                  noResultsText={text.noResults}
                  clearLabel={`${text.clear} ${text[level]}`}
                  searchThreshold={searchThreshold}
                  unstyled={unstyled}
                  classNames={{
                    root: classNames.combobox,
                    control: classNames.control,
                    input: classNames.select,
                    clear: classNames.clear,
                    toggle: classNames.toggle,
                    listbox: classNames.listbox,
                    option: classNames.option,
                    empty: classNames.empty,
                  }}
                />
              ))}
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
