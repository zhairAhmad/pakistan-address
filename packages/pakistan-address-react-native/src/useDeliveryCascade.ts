import { useCallback, useMemo, useState } from 'react';
import type { LevelState } from './cascade';
import {
  type DeliveryAddressValue,
  type DeliveryLevel,
  type ResolvedDeliveryAddress,
  emptyDeliveryAddress,
  getDeliveryLevelStates,
  resolveDeliveryAddress,
  selectDeliveryLevel,
  setDeliveryLevelText,
} from './deliveryCascade';

export interface UseDeliveryCascadeOptions {
  /** Controlled value. Omit to let the hook hold the state. */
  value?: DeliveryAddressValue;
  defaultValue?: DeliveryAddressValue;
  onChange?: (value: DeliveryAddressValue, address: ResolvedDeliveryAddress) => void;
}

/** Headless state for the unofficial delivery-areas cascade (province > city > zone). */
export function useDeliveryCascade({ value: controlled, defaultValue, onChange }: UseDeliveryCascadeOptions = {}) {
  const [inner, setInner] = useState<DeliveryAddressValue>(defaultValue ?? emptyDeliveryAddress());
  const value = controlled ?? inner;

  const commit = useCallback(
    (next: DeliveryAddressValue) => {
      if (controlled === undefined) setInner(next);
      onChange?.(next, resolveDeliveryAddress(next));
    },
    [controlled, onChange],
  );

  const levels = useMemo<Record<DeliveryLevel, LevelState>>(() => getDeliveryLevelStates(value), [value]);
  const address = useMemo(() => resolveDeliveryAddress(value), [value]);

  return {
    value,
    levels,
    address,
    select: (level: DeliveryLevel, id: string | null) => commit(selectDeliveryLevel(value, level, id)),
    setText: (level: DeliveryLevel, text: string) => commit(setDeliveryLevelText(value, level, text)),
    setAddressLine: (addressLine: string) => commit({ ...value, addressLine }),
    reset: () => commit(emptyDeliveryAddress()),
  };
}
