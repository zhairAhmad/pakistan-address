import { useCallback, useMemo, useState } from 'react';
import {
  type AddressValue,
  type Level,
  type LevelState,
  emptyAddress,
  getLevelStates,
  resolveAddress,
  selectLevel,
  setLevelText,
  type ResolvedAddress,
} from './cascade';

export interface UseAddressCascadeOptions {
  /** Controlled value. Omit to let the hook hold the state. */
  value?: AddressValue;
  defaultValue?: AddressValue;
  onChange?: (value: AddressValue, address: ResolvedAddress) => void;
}

/**
 * Headless state for the cascade. Use it directly to wire the levels into any
 * select component (react-select, Radix, MUI...); `AddressFields` is built on it.
 */
export function useAddressCascade({ value: controlled, defaultValue, onChange }: UseAddressCascadeOptions = {}) {
  const [inner, setInner] = useState<AddressValue>(defaultValue ?? emptyAddress());
  const value = controlled ?? inner;

  const commit = useCallback(
    (next: AddressValue) => {
      if (controlled === undefined) setInner(next);
      onChange?.(next, resolveAddress(next));
    },
    [controlled, onChange],
  );

  const levels = useMemo<Record<Level, LevelState>>(() => getLevelStates(value), [value]);
  const address = useMemo(() => resolveAddress(value), [value]);

  return {
    value,
    levels,
    /** Resolved names and ids, e.g. for submitting. */
    address,
    select: (level: Level, id: string | null) => commit(selectLevel(value, level, id)),
    setText: (level: Level, text: string) => commit(setLevelText(value, level, text)),
    setAddressLine: (addressLine: string) => commit({ ...value, addressLine }),
    reset: () => commit(emptyAddress()),
  };
}
