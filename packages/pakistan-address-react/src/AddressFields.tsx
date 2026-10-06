import { useId } from 'react';
import { OTHER, type Level } from './cascade';
import { type UseAddressCascadeOptions, useAddressCascade } from './useAddressCascade';

export interface AddressFieldsProps extends UseAddressCascadeOptions {
  labels?: Partial<Record<Level | 'addressLine' | 'other' | 'placeholder', string>>;
  /** Class names for styling: `root`, `field`, `label`, `select`, `input`. */
  classNames?: Partial<Record<'root' | 'field' | 'label' | 'select' | 'input', string>>;
  /** Prefix for form field names so the fields submit with a native `<form>`: `name[provinceId]`, ... */
  name?: string;
}

const DEFAULT_LABELS = {
  province: 'Province',
  division: 'Division',
  district: 'District',
  tehsil: 'Tehsil',
  addressLine: 'Full address / landmark',
  other: 'Other / not listed',
  placeholder: 'Select...',
};

const LEVELS: Level[] = ['province', 'division', 'district', 'tehsil'];

export function AddressFields({ labels, classNames = {}, name, ...options }: AddressFieldsProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const c = useAddressCascade(options);
  const uid = useId();
  const field = (key: string) => (name ? `${name}[${key}]` : key);

  return (
    <div className={classNames.root}>
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
