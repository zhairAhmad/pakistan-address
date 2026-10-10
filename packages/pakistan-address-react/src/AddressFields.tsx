import { useId } from 'react';
import { getProvince } from 'pakistan-address';
import { OTHER, type Level, type Option } from './cascade';
import { Combobox, type ComboboxClassNames } from './Combobox';
import { type UseAddressCascadeOptions, useAddressCascade } from './useAddressCascade';

export interface AddressFieldsProps extends UseAddressCascadeOptions {
  labels?: Partial<
    Record<
      Level | 'addressLine' | 'other' | 'placeholder' | 'searchPlaceholder' | 'noResults' | 'clear',
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
  /** Prefix for form field names so the fields submit with a native `<form>`: `name[provinceId]`, ... */
  name?: string;
  /** Use the browser's native `<select>` instead of the custom searchable dropdown. */
  native?: boolean;
  /** Lists longer than this get a search box (custom dropdown only). Default 10. */
  searchThreshold?: number;
  /** Drop the dropdown's built-in inline styles so your own CSS decides how it looks. */
  unstyled?: boolean;
}

const DEFAULT_LABELS = {
  province: 'Province',
  division: 'Division',
  district: 'District',
  tehsil: 'Tehsil',
  addressLine: 'Full address / landmark',
  other: 'Other / not listed',
  placeholder: 'Select...',
  searchPlaceholder: 'Select or type to search...',
  noResults: 'No matches',
  clear: 'Clear',
};

const LEVELS: Level[] = ['province', 'division', 'district', 'tehsil'];

export function AddressFields({
  labels,
  classNames = {},
  name,
  native,
  searchThreshold,
  unstyled,
  ...options
}: AddressFieldsProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const c = useAddressCascade(options);
  const uid = useId();
  const field = (key: string) => (name ? `${name}[${key}]` : key);
  const provinceNotice = c.address.ids.province ? getProvince(c.address.ids.province)?.notice : undefined;

  return (
    <div className={classNames.root}>
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
                // With no list, the input is the label's target.
                id={hasList ? undefined : id}
                type="text"
                name={field(`${level}Other`)}
                className={classNames.input}
                value={c.value[level].text}
                aria-label={hasList ? `${text[level]} (${text.other})` : undefined}
                onChange={(e) => c.setText(level, e.target.value)}
              />
            )}
            {level === 'province' && provinceNotice && (
              <p role="note" className={classNames.notice}>
                {provinceNotice}
              </p>
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
