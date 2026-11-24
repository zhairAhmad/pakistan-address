import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { getProvince } from 'pakistan-address';
import { OTHER, type Level, type Option } from './cascade';
import { ModalPicker } from './ModalPicker';
import { type AddressFieldsStyles, defaultStyles } from './styles';
import { type UseAddressCascadeOptions, useAddressCascade } from './useAddressCascade';

export interface AddressFieldsLabels {
  province?: string;
  division?: string;
  district?: string;
  tehsil?: string;
  addressLine?: string;
  other?: string;
  otherPlaceholder?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  noResults?: string;
  close?: string;
}

export interface AddressFieldsProps extends UseAddressCascadeOptions {
  labels?: Partial<AddressFieldsLabels>;
  styles?: Partial<AddressFieldsStyles>;
  searchThreshold?: number;
  showAddressLine?: boolean;
  testID?: string;
}

const DEFAULT_LABELS: Required<AddressFieldsLabels> = {
  province: 'Province',
  division: 'Division',
  district: 'District',
  tehsil: 'Tehsil',
  addressLine: 'Full address / landmark',
  other: 'Other / not listed',
  otherPlaceholder: 'Type your custom value...',
  placeholder: 'Select...',
  searchPlaceholder: 'Type to search...',
  noResults: 'No matches found',
  close: 'Done',
};

const LEVELS: Level[] = ['province', 'division', 'district', 'tehsil'];

/**
 * Cascading administrative address fields for React Native & Expo.
 * Supports Province -> Division -> District -> Tehsil with "Other / not listed" fallbacks.
 */
export function AddressFields({
  labels,
  styles: customStyles = {},
  searchThreshold = 10,
  showAddressLine = true,
  testID = 'address-fields',
  ...options
}: AddressFieldsProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const c = useAddressCascade(options);

  const provinceId = c.address.ids.province;
  const provinceNotice = provinceId ? getProvince(provinceId)?.notice : undefined;

  return (
    <View testID={testID} style={[defaultStyles.container, customStyles.container]}>
      {provinceNotice ? (
        <View testID={`${testID}-notice`} style={[defaultStyles.notice, customStyles.notice]}>
          <Text style={[defaultStyles.noticeText, customStyles.noticeText]}>
            {provinceNotice}
          </Text>
        </View>
      ) : null}

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
