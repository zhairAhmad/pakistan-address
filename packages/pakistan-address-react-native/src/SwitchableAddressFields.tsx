import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, type TextStyle, View, type ViewStyle } from 'react-native';
import { AddressFields, type AddressFieldsProps } from './AddressFields';
import { DeliveryAddressFields, type DeliveryAddressFieldsProps } from './DeliveryAddressFields';
import type { AddressFieldsStyles } from './styles';

export type AddressSource = 'official' | 'delivery';

export interface SwitchableAddressFieldsStyles extends AddressFieldsStyles {
  switchContainer?: ViewStyle;
  switchTab?: ViewStyle;
  switchTabActive?: ViewStyle;
  switchTabText?: TextStyle;
  switchTabTextActive?: TextStyle;
}

export interface SwitchableAddressFieldsProps {
  source?: AddressSource;
  defaultSource?: AddressSource;
  onSourceChange?: (source: AddressSource) => void;
  officialProps?: AddressFieldsProps;
  deliveryProps?: DeliveryAddressFieldsProps;
  labels?: {
    official?: string;
    delivery?: string;
  };
  styles?: Partial<SwitchableAddressFieldsStyles>;
  testID?: string;
}

const switchStyles = StyleSheet.create({
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  switchTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  switchTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  switchTabTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
});

/**
 * Switchable address form component allowing users to toggle between
 * Official Administrative units and Courier Delivery areas.
 */
export function SwitchableAddressFields({
  source: controlledSource,
  defaultSource = 'official',
  onSourceChange,
  officialProps = {},
  deliveryProps = {},
  labels = { official: 'Administrative (Official)', delivery: 'Courier / Delivery' },
  styles: customStyles = {},
  testID = 'switchable-address-fields',
}: SwitchableAddressFieldsProps) {
  const [internalSource, setInternalSource] = useState<AddressSource>(defaultSource);
  const currentSource = controlledSource ?? internalSource;

  const handleSwitch = (next: AddressSource) => {
    if (controlledSource === undefined) setInternalSource(next);
    onSourceChange?.(next);
  };

  return (
    <View testID={testID}>
      <View style={[switchStyles.switchContainer, customStyles.switchContainer]}>
        <Pressable
          testID={`${testID}-tab-official`}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentSource === 'official' }}
          onPress={() => handleSwitch('official')}
          style={[
            switchStyles.switchTab,
            customStyles.switchTab,
            currentSource === 'official'
              ? [switchStyles.switchTabActive, customStyles.switchTabActive]
              : null,
          ]}
        >
          <Text
            style={[
              switchStyles.switchTabText,
              customStyles.switchTabText,
              currentSource === 'official'
                ? [switchStyles.switchTabTextActive, customStyles.switchTabTextActive]
                : null,
            ]}
          >
            {labels.official ?? 'Official'}
          </Text>
        </Pressable>

        <Pressable
          testID={`${testID}-tab-delivery`}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentSource === 'delivery' }}
          onPress={() => handleSwitch('delivery')}
          style={[
            switchStyles.switchTab,
            customStyles.switchTab,
            currentSource === 'delivery'
              ? [switchStyles.switchTabActive, customStyles.switchTabActive]
              : null,
          ]}
        >
          <Text
            style={[
              switchStyles.switchTabText,
              customStyles.switchTabText,
              currentSource === 'delivery'
                ? [switchStyles.switchTabTextActive, customStyles.switchTabTextActive]
                : null,
            ]}
          >
            {labels.delivery ?? 'Delivery'}
          </Text>
        </Pressable>
      </View>

      {currentSource === 'official' ? (
        <AddressFields testID={`${testID}-official`} styles={customStyles} {...officialProps} />
      ) : (
        <DeliveryAddressFields testID={`${testID}-delivery`} styles={customStyles} {...deliveryProps} />
      )}
    </View>
  );
}
