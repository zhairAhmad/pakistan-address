# pakistan-address-react

Cascading **Province → Division → District → Tehsil** address fields for React, built on [`pakistan-address`](../pakistan-address).

- Each level filters from the previous one.
- **"Other / not listed"** at every level below province, revealing a free-text input.
- Islamabad (no divisions) and areas with no tehsil data fall back to the right inputs automatically.
- A separate **full address / landmark** field.
- Native `<select>`s: accessible, no extra dependencies, easy to style. Or use the headless hook with any select library.

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

Props: `value` / `defaultValue` / `onChange` (controlled or uncontrolled), `labels` (translate or rename), `classNames` (`root`, `field`, `label`, `select`, `input`, `notice`), `name` (prefix, so the fields post with a native form: `shipping[provinceId]`, `shipping[districtOther]`, `shipping[addressLine]`, …).

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
