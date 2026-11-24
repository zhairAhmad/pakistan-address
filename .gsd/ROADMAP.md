# Roadmap: `pakistan-address-react-native`

## Phases

- [ ] **Phase 1: Package Foundation & Cascade Logic**
  - Setup `packages/pakistan-address-react-native` directory, `package.json`, `tsconfig.json`, `tsup.config.ts`.
  - Wire root monorepo scripts (`package.json`) to include the new package.
  - Implement and test pure cascade logic (`cascade.ts`, `deliveryCascade.ts`, hooks `useAddressCascade.ts`, `useDeliveryCascade.ts`).
  - Unit tests covering cascade transitions, "Other" behavior, and resolution.

- [ ] **Phase 2: React Native UI Components**
  - Implement `ModalPicker.tsx`: zero-dependency modal/bottom-sheet picker with search filtering, accessible pressables, and "Other" support.
  - Implement `AddressFields.tsx`: main administrative component with province notices, picker triggers, conditional text inputs, and addressLine.
  - Implement `styles.ts`: default React Native styling system with clear extension points.
  - Implement `DeliveryAddressFields.tsx` & `SwitchableAddressFields.tsx`.

- [ ] **Phase 3: Integration, Testing & Packaging**
  - Setup Vitest / component tests for React Native components.
  - Implement index exports for both `.` and `./delivery`.
  - Build package with `tsup` (ESM + CJS + DTS) and verify outputs.
  - Author comprehensive `README.md` with usage examples (Expo, vanilla RN, custom styling, headless hooks).
  - Verify complete monorepo build and test suite pass.
