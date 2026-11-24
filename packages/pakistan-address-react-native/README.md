# pakistan-address-react-native

[![npm version](https://img.shields.io/npm/v/pakistan-address-react-native.svg)](https://www.npmjs.com/package/pakistan-address-react-native)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Cascading **Province → Division → District → Tehsil** address fields for **React Native** and **Expo**, built on [`pakistan-address`](https://www.npmjs.com/package/pakistan-address).

- **Zero native dependencies:** 100% pure JavaScript/TypeScript. Compatible immediately with Expo Go, Expo EAS, and bare React Native (iOS, Android, and Web) with no CocoaPods, Gradle configs, or native linking required.
- Each level filters automatically from the previous level.
- **"Other / not listed"** at every level below province, revealing a custom text input for unlisted or newly created units.
- Islamabad (no divisions) and areas with no tehsil data fall back to the right inputs automatically.
- Built-in **searchable modal picker** with search filter for long lists (districts, tehsils). Matches both primary and alternate names ("DG Khan" finds Dera Ghazi Khan, "Nawabshah" finds Shaheed Benazir Abad).
- Separate **full address / landmark** field.
- Headless hooks (`useAddressCascade`, `useDeliveryCascade`) to power your own custom pickers, bottom sheets, or UI component libraries (React Native Paper, Tamagui, NativeBase).

> **Status: 0.5.0.** Built on [`pakistan-address`](https://www.npmjs.com/package/pakistan-address) 0.5.0 (Punjab BoR notification, KP 40 districts, PBS Census 2023 lists, and Balochistan BoR notifications up to 2026).

---

## Install

```bash
npm install pakistan-address-react-native pakistan-address
```

Requires React 18+ and React Native 0.70+.

---

## Ready-Made Fields

```tsx
import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { AddressFields, type ResolvedAddress } from 'pakistan-address-react-native';

export function CheckoutScreen() {
  const [address, setAddress] = useState<ResolvedAddress>();

  return (
    <View style={styles.container}>
      <AddressFields
        onChange={(_value, resolved) => setAddress(resolved)}
      />
      <Button
        title="Submit"
        disabled={!address?.province || !address?.district}
        onPress={() => console.log('Submitting address:', address)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
});
```

`resolved` looks like:

```json
{
  "province": "Punjab",
  "division": "Multan",
  "district": "Vehari",
  "tehsil": "Mailsi",
  "addressLine": "House 5, near Jamia Masjid",
  "ids": {
    "province": "pb",
    "division": "pb-multan-div",
    "district": "pb-vehari",
    "tehsil": "pb-vehari-mailsi"
  }
}
```

Where the user typed their own text via "Other / not listed", the field name is their text and the matching `ids` entry is `null`.

---

## Customizing Picker & Styling

Every element has sensible, modern mobile defaults and can be customized via `styles`:

```tsx
<AddressFields
  searchThreshold={5} // Show search box when options count >= 5 (default: 10)
  showAddressLine={true} // Set false to omit the addressLine field
  labels={{
    province: 'Select Province',
    district: 'Your District',
    other: 'Not listed here',
    searchPlaceholder: 'Search district or tehsil...',
    noResults: 'No matches found',
    close: 'Done',
  }}
  styles={{
    label: { fontSize: 13, color: '#4b5563', textTransform: 'uppercase' },
    pickerButton: { borderColor: '#10b981', borderRadius: 10 },
    pickerButtonText: { color: '#065f46' },
    searchInput: { backgroundColor: '#f3f4f6' },
    optionItemSelected: { backgroundColor: '#ecfdf5' },
    optionItemSelectedText: { color: '#047857', fontWeight: 'bold' },
    input: { borderColor: '#10b981' },
    notice: { backgroundColor: '#fef3c7' },
  }}
/>
```

Available `styles` slots:
- `container`, `field`, `label`
- `pickerButton`, `pickerButtonText`, `pickerButtonPlaceholder`, `pickerButtonDisabled`, `pickerButtonIcon`
- `input`, `addressLineInput`
- `notice`, `noticeText`
- `modalOverlay`, `modalContent`, `modalHeader`, `modalTitle`, `modalCloseButton`, `modalCloseButtonText`
- `searchInput`, `optionItem`, `optionItemText`, `optionItemSelected`, `optionItemSelectedText`, `emptyText`

The standalone modal picker is also exported as `ModalPicker` (with `filterOptions`) for reuse in your app:

```tsx
import { ModalPicker } from 'pakistan-address-react-native';

<ModalPicker
  label="Gender"
  options={[
    { value: 'm', label: 'Male' },
    { value: 'f', label: 'Female' },
    { value: 'o', label: 'Other' },
  ]}
  value={selectedGender}
  onSelect={(val) => setSelectedGender(val)}
/>
```

---

## Headless Hook (`useAddressCascade`)

If you are using a UI framework (e.g. React Native Paper, Tamagui, `@gorhom/bottom-sheet`, or `@react-native-picker/picker`), use the headless hook:

```tsx
import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useAddressCascade, OTHER } from 'pakistan-address-react-native';

export function CustomAddressForm() {
  const c = useAddressCascade({
    onChange: (_val, resolved) => console.log('Resolved address:', resolved),
  });

  return (
    <View>
      {/* Province */}
      <Text>Province</Text>
      {c.levels.province.options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => c.select('province', option.value)}
        >
          <Text>{option.label} {c.value.province.id === option.value ? '✓' : ''}</Text>
        </Pressable>
      ))}

      {/* Division (if applicable) */}
      {c.levels.division.visible && (
        <View>
          <Text>Division</Text>
          {c.levels.division.options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => c.select('division', option.value)}
            >
              <Text>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* "Other" text input fallback */}
      {c.levels.division.showText && (
        <TextInput
          placeholder="Type division name"
          value={c.value.division.text}
          onChangeText={(txt) => c.setText('division', txt)}
        />
      )}
    </View>
  );
}
```

---

## Unofficial Delivery Areas & Switchable Fields

For e-commerce and courier shipping, an optional, **unofficial** list of delivery areas (province → city → area → zone) is available under `pakistan-address-react-native/delivery`:

```tsx
import {
  DeliveryAddressFields,
  SwitchableAddressFields,
} from 'pakistan-address-react-native/delivery';

// 1. Delivery areas only
<DeliveryAddressFields
  onChange={(_value, resolved) => console.log(resolved)}
  hideNotice={false} // Shows the unofficial notice note
/>

// 2. Tabbed switch between Official administrative units and Courier delivery areas
<SwitchableAddressFields
  defaultSource="official"
  onSourceChange={(source) => console.log('Current source:', source)}
/>
```

- `DeliveryAddressFields` accepts the same props as `AddressFields` (`value`, `defaultValue`, `onChange`, `labels`, `styles`, `searchThreshold`, `showAddressLine`, `hideNotice`).
- `SwitchableAddressFields` provides a clean segmented tab toggle between administrative and delivery hierarchies.

---

## Behaviour Notes

- **Cascading reset:** Changing a level resets every level below it.
- **"Other" division:** Choosing "Other" for a division displays all districts in the province.
- **"Other" district:** Choosing "Other" for a district turns the tehsil level into a free-text input.
- **Islamabad Capital Territory:** Skips the division step and transitions directly to district.

---

## License

MIT © Zhair Ahmad
