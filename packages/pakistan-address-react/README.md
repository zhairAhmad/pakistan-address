# pakistan-address-react

Cascading **Province → Division → District → Tehsil** address fields for React, built on [`pakistan-address`](../pakistan-address).

- Each level filters from the previous one.
- **"Other / not listed"** at every level below province, revealing a free-text input.
- Islamabad (no divisions) and areas with no tehsil data fall back to the right inputs automatically.
- A separate **full address / landmark** field.
- **Searchable dropdowns.** Long lists (more than 10 options, such as districts and delivery cities) get a search box: type to filter, arrow keys to move, Enter to choose. Alternate names match too ("Nawabshah" finds Shaheed Benazir Abad). Short lists stay a plain dropdown.
- Custom, accessible dropdowns (WAI-ARIA combobox), no extra dependencies, styled through class names. A native `<select>` is one prop away (`native`). Or use the headless hook with any select library.

> Data baseline is the 2017 census; see the [data notes](../pakistan-address/DATA.md) for what is and isn't covered.

## Install

```bash
npm install pakistan-address-react pakistan-address
```

Requires React 18+.

## Ready-made fields

```tsx
import { AddressFields, type ResolvedAddress } from 'pakistan-address-react';

function Checkout() {
  const [address, setAddress] = useState<ResolvedAddress>();
  return (
    <form>
      <AddressFields name="shipping" onChange={(_value, resolved) => setAddress(resolved)} />
    </form>
  );
}
```

`resolved` looks like:

```json
{
  "province": "Punjab", "division": "Multan", "district": "Vehari", "tehsil": "Mailsi",
  "addressLine": "House 5, near Jamia Masjid",
  "ids": { "province": "pb", "division": "pb-multan-div", "district": "pb-vehari", "tehsil": "pb-vehari-mailsi" }
}
```

Where the user typed their own text, the name is that text and the matching `ids` entry is `null`.

Props: `value` / `defaultValue` / `onChange` (controlled or uncontrolled), `labels` (translate or rename), `classNames`, `name` (prefix, so the fields post with a native form: `shipping[provinceId]`, `shipping[districtOther]`, `shipping[addressLine]`, …), `native`, `searchThreshold` and `unstyled`.

### The dropdowns

```tsx
<AddressFields
  searchThreshold={5}   // search box for lists longer than 5 options (default 10)
  native                // or: use the browser's own <select> (no search box)
  unstyled              // drop the built-in inline styles and style everything yourself
  labels={{ searchPlaceholder: 'Type to search…', noResults: 'Nothing found', placeholder: 'Choose…' }}
  classNames={{ select: 'input', listbox: 'menu', option: 'menu-item', clear: 'clear-btn' }}
/>
```

- `classNames` keys: `root`, `field`, `label`, `select` (the dropdown's text box, or the `<select>` when `native`), `input` (typed-in text and the address line), `notice`, and for the custom dropdown `combobox`, `control`, `clear`, `toggle`, `listbox`, `option`, `empty`. The active and selected options carry `data-active` / `aria-selected` for CSS (`[data-active] { … }`), and the list sets `data-open` on the root.
- Without `unstyled` the dropdown uses a few inline styles so it works with no CSS (system colours, positioned list).
- The chosen id is posted by a hidden input, so native forms and `FormData` see `name[provinceId]` as before. With JavaScript off the custom dropdown can't open; use `native` if you need a no-JS form.
- The dropdown is exported on its own as `Combobox` (with `filterOptions`) if you want the same control elsewhere: `options` of `{ value, label, keywords?, pinned? }`, `value`, `onChange`.

## Headless hook (react-select, MUI, Radix…)

```tsx
import Select from 'react-select';
import { OTHER, useAddressCascade } from 'pakistan-address-react';

function ProvinceDivisionDistrict() {
  const c = useAddressCascade();
  const withOther = (level: 'division' | 'district') => [
    ...c.levels[level].options,
    { value: OTHER, label: 'Other / not listed' },
  ];
  const find = (options: { value: string }[], id: string | null) => options.find((o) => o.value === id) ?? null;

  return (
    <>
      <Select
        aria-label="Province"
        options={c.levels.province.options}
        value={find(c.levels.province.options, c.value.province.id)}
        onChange={(o) => c.select('province', o?.value ?? null)}
      />
      {c.levels.division.visible && (
        <Select
          aria-label="Division"
          options={withOther('division')}
          value={find(withOther('division'), c.value.division.id)}
          onChange={(o) => c.select('division', o?.value ?? null)}
        />
      )}
      {c.levels.district.visible && (
        <Select
          aria-label="District"
          options={withOther('district')}
          value={find(withOther('district'), c.value.district.id)}
          onChange={(o) => c.select('district', o?.value ?? null)}
        />
      )}
      {c.levels.district.showText && (
        <input
          aria-label="District (other)"
          value={c.value.district.text}
          onChange={(e) => c.setText('district', e.target.value)}
        />
      )}
    </>
  );
}
```

Levels appear one at a time (division, then district, then tehsil), so render each one only when `c.levels[level].visible` is true. `c.levels[level]` gives `{ visible, options, allowOther, showText }` for each level, `c.address` the resolved value, and `c.select`, `c.setText`, `c.setAddressLine`, `c.reset` update it. The same logic is available without React as `getLevelStates`, `selectLevel`, `setLevelText` and `resolveAddress`.

## Unofficial delivery areas, and switching between the two lists

Besides the official hierarchy, `pakistan-address` has an optional, **unofficial** list of courier delivery areas (province, city, zone) taken from an online store's address form; see its [README](../pakistan-address#unofficial-delivery-areas-optional). The fields for it live in a separate entry point, so the main bundle does not include that data:

```tsx
import { DeliveryAddressFields, SwitchableAddressFields } from 'pakistan-address-react/delivery';

// Delivery areas only (shows a note that the list is unofficial)
<DeliveryAddressFields name="shipping" onChange={(_value, resolved) => setAddress(resolved)} />

// A switch between "Official administrative units" and "Delivery areas (unofficial)"
<SwitchableAddressFields
  defaultSource="official"
  onChange={(address) => setAddress(address)} // address.source is 'official' or 'delivery'
/>
```

- `DeliveryAddressFields` takes the same props as `AddressFields` (`value`, `defaultValue`, `onChange`, `labels`, `classNames`, `name`) plus `hideNotice`. Its `resolved` value is `{ province, city, area, zone, addressLine, ids }` with `dl-...` ids (`area` is empty for cities that have no areas, and the Area field is then not shown). There is also a headless `useDeliveryCascade`.
- `SwitchableAddressFields` takes `source` / `defaultSource` / `onSourceChange`, `hideSwitch`, `switchLabels`, and `officialProps` / `deliveryProps`. Switching clears the fields, and `onChange` tags each value with its `source`. Importing it includes both datasets (the delivery one is about 1.2 MB unpacked).
- The delivery note is on by default. Only turn it off if you tell your users some other way that the list is unofficial.

## Behaviour notes

- Changing a level clears every level below it.
- Choosing "Other" for a division shows all districts of the province; "Other" for a district makes tehsil a text input.
- Tehsil is shown as plain text input whenever the district has no tehsil data.
