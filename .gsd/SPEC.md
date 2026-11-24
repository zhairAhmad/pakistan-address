# Specification: `pakistan-address-react-native`

**Status:** FINALIZED  
**Date:** 2026-11-24  
**Author:** Zhair Ahmad / Antigravity  

### User-Approved Decisions:
1. **Picker Approach:** Built-in pure React Native Modal Picker with search filter (zero native binary dependencies, 100% Expo Go & bare RN compatible) plus headless hooks (`useAddressCascade`, `useDeliveryCascade`) for custom UI design systems.
2. **Feature Scope:** Complete parity with `pakistan-address-react` — both Administrative (`<AddressFields>`) and Delivery (`<DeliveryAddressFields>`), plus `<SwitchableAddressFields>`.  

---

## 1. Executive Summary

Bring the functionality of `pakistan-address-react` to React Native and Expo applications through a new package: `pakistan-address-react-native`.

This package will provide ready-made cascading address fields (Province → Division → District → Tehsil) and delivery fields (Province → City → Area → Zone) built directly on `pakistan-address`, with zero native binary dependencies (pure JavaScript/TypeScript), ensuring immediate compatibility with Expo (Go, Managed, Bare) and vanilla React Native.

---

## 2. Goals & Key Principles

1. **Zero Native Dependencies:** Rely purely on `react` and `react-native` core primitives (`View`, `Text`, `TextInput`, `Modal`, `Pressable`, `FlatList`, `StyleSheet`). No CocoaPods, no Gradle modifications, no native linking required.
2. **Feature Parity with `pakistan-address-react`:**
   - Full cascading logic: Province → Division → District → Tehsil.
   - "Other / not listed" (`__other__`) fallback at every level, revealing custom text inputs.
   - Built-in search filtering in the modal picker for long lists (districts and tehsils), matching primary and alternate names (`altNames`).
   - Official provincial boundary notices (e.g., Balochistan warning).
   - Headless hooks (`useAddressCascade`, `useDeliveryCascade`) for custom UI design systems.
   - Delivery areas entry point: `pakistan-address-react-native/delivery` with `<DeliveryAddressFields>` and `<SwitchableAddressFields>`.
3. **Flexible & Customizable Styling:**
   - Pre-styled, clean mobile UI out of the box with sensible defaults.
   - Comprehensive `styles` prop allowing overrides for every visual element (container, field, label, button, modal, search input, options, notices).
   - Custom labels support for localization or application-specific terminology.
4. **TypeScript First & Dual ESM/CJS Output:**
   - Complete type definitions (`.d.ts`).
   - Bundled using `tsup` with dual export paths (`.` and `./delivery`).

---

## 3. Package Architecture & Exports

### Monorepo Structure
```
packages/
├── pakistan-address/              # Core data and helpers
├── pakistan-address-react/        # React DOM web components
└── pakistan-address-react-native/ # NEW: React Native components & hooks
    ├── package.json
    ├── tsconfig.json
    ├── tsup.config.ts
    ├── README.md
    ├── src/
    │   ├── index.ts               # Main entry point (administrative)
    │   ├── AddressFields.tsx       # Main RN address fields component
    │   ├── ModalPicker.tsx        # Searchable bottom-sheet/modal picker
    │   ├── cascade.ts             # Cascade logic & types
    │   ├── useAddressCascade.ts   # Headless hook
    │   ├── styles.ts              # Default styles & style types
    │   ├── delivery.ts            # Delivery entry point
    │   ├── DeliveryAddressFields.tsx
    │   ├── deliveryCascade.ts
    │   ├── useDeliveryCascade.ts
    │   └── SwitchableAddressFields.tsx
    └── test/
        ├── cascade.test.ts
        ├── deliveryCascade.test.ts
        ├── AddressFields.test.tsx
        └── DeliveryAddressFields.test.tsx
```

### Main Entry (`pakistan-address-react-native`)
- `<AddressFields />`
- `<ModalPicker />`
- `useAddressCascade()`
- `emptyAddress()`, `resolveAddress()`, `getLevelStates()`, `selectLevel()`, `setLevelText()`
- `OTHER`
- Types: `AddressFieldsProps`, `AddressFieldsStyles`, `AddressValue`, `ResolvedAddress`, `Level`, `LevelState`, `Option`, etc.

### Delivery Entry (`pakistan-address-react-native/delivery`)
- `<DeliveryAddressFields />`
- `<SwitchableAddressFields />`
- `useDeliveryCascade()`
- `emptyDeliveryAddress()`, `resolveDeliveryAddress()`, `getDeliveryLevelStates()`, `selectDeliveryLevel()`, `setDeliveryLevelText()`
- Types: `DeliveryAddressFieldsProps`, `DeliveryAddressValue`, `ResolvedDeliveryAddress`, `DeliveryLevel`, etc.

---

## 4. Component API Specifications

### `<AddressFields />`
```tsx
export interface AddressFieldsProps extends UseAddressCascadeOptions {
  /** Optional custom labels */
  labels?: Partial<AddressFieldsLabels>;
  /** Style overrides for all sub-components */
  styles?: Partial<AddressFieldsStyles>;
  /** Minimum options count before showing the search input in the modal (default: 10) */
  searchThreshold?: number;
  /** Whether to show the address line text input (default: true) */
  showAddressLine?: boolean;
}
```

### `<DeliveryAddressFields />`
```tsx
export interface DeliveryAddressFieldsProps extends UseDeliveryCascadeOptions {
  labels?: Partial<DeliveryAddressFieldsLabels>;
  styles?: Partial<AddressFieldsStyles>;
  searchThreshold?: number;
  showAddressLine?: boolean;
  /** Hide the unofficial source notice (default: false) */
  hideNotice?: boolean;
}
```

---

## 5. Verification & Testing Criteria

1. **Unit & Cascade Tests:**
   - Initial empty state generation.
   - Cascading transitions: selecting province loads divisions; selecting division loads districts; selecting district loads tehsils.
   - Territories without divisions (e.g. Islamabad) transition directly to districts.
   - Unlisted divisions (`OTHER`) allow selecting from all provincial districts.
   - "Other" selections trigger free-text input requirements and correctly resolve text values.
   - Delivery cascade (Province → City → Area → Zone) behaves correctly for both area-segmented cities (Lahore/Karachi) and direct-to-zone cities.
2. **Component & Rendering Tests:**
   - Picker modal triggers, renders options, filters on search input, and selects option.
   - Notice banners display when applicable (e.g. Balochistan notice, unofficial delivery notice).
3. **Build & Type Check:**
   - `npm run build -w pakistan-address-react-native` produces valid ESM and CJS bundles with declarations.
   - Monorepo `npm run build` and `npm test` execute cleanly across all packages.
