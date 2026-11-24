import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { getDeliveryMeta } from 'pakistan-address/delivery';
import { OTHER, type Option } from './cascade';
import { type DeliveryLevel } from './deliveryCascade';
import { ModalPicker } from './ModalPicker';
import { type AddressFieldsStyles, defaultStyles } from './styles';
import { type UseDeliveryCascadeOptions, useDeliveryCascade } from './useDeliveryCascade';

export interface DeliveryAddressFieldsLabels {
  province?: string;
  city?: string;
  area?: string;
  zone?: string;
  addressLine?: string;
  other?: string;
  otherPlaceholder?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  noResults?: string;
  close?: string;
  notice?: string;
}

export interface DeliveryAddressFieldsProps extends UseDeliveryCascadeOptions {
  labels?: Partial<DeliveryAddressFieldsLabels>;
  styles?: Partial<AddressFieldsStyles>;
  searchThreshold?: number;
  showAddressLine?: boolean;
  hideNotice?: boolean;
  testID?: string;
}

const DEFAULT_LABELS: Required<DeliveryAddressFieldsLabels> = {
  province: 'Province',
  city: 'City',
  area: 'Area',
  zone: 'Zone / neighbourhood',
  addressLine: 'Full address / landmark',
  other: 'Other / not listed',
  otherPlaceholder: 'Type your custom value...',
  placeholder: 'Select...',
  searchPlaceholder: 'Type to search...',
  noResults: 'No matches found',
  close: 'Done',
  notice:
    'Unofficial list of delivery areas taken from logistics data. These are courier delivery destinations and may not strictly match official administrative units.',
};

const LEVELS: DeliveryLevel[] = ['province', 'city', 'area', 'zone'];

/**
 * Cascading delivery address fields for React Native & Expo (Province -> City -> Area -> Zone).
 * Built on unofficial courier delivery areas.
 */
export function DeliveryAddressFields({
  labels,
  styles: customStyles = {},
  searchThreshold = 10,
  showAddressLine = true,
  hideNotice = false,
  testID = 'delivery-address-fields',
  ...options
}: DeliveryAddressFieldsProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const c = useDeliveryCascade(options);

  return (
    <View testID={testID} style={[defaultStyles.container, customStyles.container]}>
      {!hideNotice && (
        <View testID={`${testID}-notice`} style={[defaultStyles.notice, customStyles.notice]}>
          <Text style={[defaultStyles.noticeText, customStyles.noticeText]}>
            {text.notice}
          </Text>
        </View>
      )}

      {LEVELS.map((level) => {
        const state = c.levels[level];
        if (!state.visible) return null;

        const hasList = state.options.length > 0;
        const listed: Option[] = state.allowOther
          ? [...state.options, { value: OTHER, label: text.other, pinned: true }]
          : state.options;

        return (
          <View key={level} testID={`${testID}-field-${level}`} style={[defaultStyles.field, customStyles.field]}>
            <Text style={[defaultStyles.label, customStyles.label]}>
              {text[level]}
            </Text>

            {hasList && (
              <ModalPicker
                testID={`${testID}-picker-${level}`}
                label={text[level]}
                title={`Select ${text[level]}`}
                options={listed}
                value={c.value[level].id}
                onSelect={(val) => c.select(level, val)}
                placeholder={text.placeholder}
                searchPlaceholder={text.searchPlaceholder}
                noResultsText={text.noResults}
                closeText={text.close}
                searchThreshold={searchThreshold}
                styles={customStyles}
              />
            )}

            {state.showText && (
              <TextInput
                testID={`${testID}-input-${level}`}
                value={c.value[level].text}
                onChangeText={(val) => c.setText(level, val)}
                placeholder={text.otherPlaceholder}
                placeholderTextColor="#9ca3af"
                accessibilityLabel={`${text[level]} custom text`}
                style={[defaultStyles.input, customStyles.input]}
              />
            )}
          </View>
        );
      })}

      {showAddressLine && (
        <View testID={`${testID}-field-addressLine`} style={[defaultStyles.field, customStyles.field]}>
          <Text style={[defaultStyles.label, customStyles.label]}>
            {text.addressLine}
          </Text>
          <TextInput
            testID={`${testID}-input-addressLine`}
            multiline
            numberOfLines={3}
            value={c.value.addressLine}
            onChangeText={c.setAddressLine}
            placeholder={text.addressLine}
            placeholderTextColor="#9ca3af"
            accessibilityLabel={text.addressLine}
            style={[defaultStyles.addressLineInput, customStyles.addressLineInput]}
          />
        </View>
      )}
    </View>
  );
}
