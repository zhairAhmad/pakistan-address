import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Option } from './cascade';
import { type AddressFieldsStyles, defaultStyles } from './styles';

export interface ModalPickerProps {
  label?: string;
  title?: string;
  value: string | null;
  options: Option[];
  onSelect: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  closeText?: string;
  disabled?: boolean;
  searchThreshold?: number;
  styles?: Partial<AddressFieldsStyles>;
  testID?: string;
}

export function filterOptions(options: Option[], query: string): Option[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;

  return options.filter((option) => {
    if (option.pinned) return true;
    if (option.label.toLowerCase().includes(q)) return true;
    if (option.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
    return false;
  });
}

/**
 * Accessible, zero-dependency searchable Modal Picker for React Native & Expo.
 */
export function ModalPicker({
  label,
  title,
  value,
  options,
  onSelect,
  placeholder = 'Select...',
  searchPlaceholder = 'Type to search...',
  noResultsText = 'No matches found',
  closeText = 'Done',
  disabled = false,
  searchThreshold = 10,
  styles: customStyles = {},
  testID,
}: ModalPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const shouldShowSearch = options.length >= searchThreshold;

  const filteredOptions = useMemo(
    () => (shouldShowSearch ? filterOptions(options, searchQuery) : options),
    [options, searchQuery, shouldShowSearch],
  );

  const handleOpen = () => {
    if (disabled) return;
    setSearchQuery('');
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleSelect = (val: string) => {
    onSelect(val);
    handleClose();
  };

  const displayText = selectedOption ? selectedOption.label : placeholder;
  const isPlaceholder = !selectedOption;

  return (
    <View style={customStyles.container}>
      <Pressable
        testID={testID ? `${testID}-button` : undefined}
        accessibilityRole="button"
        accessibilityLabel={label ? `${label}: ${displayText}` : displayText}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={handleOpen}
        style={[
          defaultStyles.pickerButton,
          customStyles.pickerButton,
          disabled ? [defaultStyles.pickerButtonDisabled, customStyles.pickerButtonDisabled] : null,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            defaultStyles.pickerButtonText,
            customStyles.pickerButtonText,
            isPlaceholder ? [defaultStyles.pickerButtonPlaceholder, customStyles.pickerButtonPlaceholder] : null,
          ]}
        >
          {displayText}
        </Text>
        <Text style={[defaultStyles.pickerButtonIcon, customStyles.pickerButtonIcon]}>
          ▼
        </Text>
      </Pressable>

      <Modal
        testID={testID ? `${testID}-modal` : undefined}
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={[defaultStyles.modalOverlay, customStyles.modalOverlay]}>
          <View style={[defaultStyles.modalContent, customStyles.modalContent]}>
            <View style={[defaultStyles.modalHeader, customStyles.modalHeader]}>
              <Text style={[defaultStyles.modalTitle, customStyles.modalTitle]}>
                {title || label || 'Select'}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close picker"
                onPress={handleClose}
                style={[defaultStyles.modalCloseButton, customStyles.modalCloseButton]}
              >
                <Text style={[defaultStyles.modalCloseButtonText, customStyles.modalCloseButtonText]}>
                  {closeText}
                </Text>
              </Pressable>
            </View>

            {shouldShowSearch && (
              <TextInput
                testID={testID ? `${testID}-search-input` : undefined}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor="#9ca3af"
                clearButtonMode="while-editing"
                autoCorrect={false}
                autoCapitalize="none"
                style={[defaultStyles.searchInput, customStyles.searchInput]}
              />
            )}

            <FlatList
              testID={testID ? `${testID}-list` : undefined}
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    testID={testID ? `${testID}-option-${item.value}` : undefined}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => handleSelect(item.value)}
                    style={[
                      defaultStyles.optionItem,
                      customStyles.optionItem,
                      isSelected ? [defaultStyles.optionItemSelected, customStyles.optionItemSelected] : null,
                    ]}
                  >
                    <Text
                      style={[
                        defaultStyles.optionItemText,
                        customStyles.optionItemText,
                        isSelected
                          ? [defaultStyles.optionItemSelectedText, customStyles.optionItemSelectedText]
                          : null,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={[defaultStyles.emptyText, customStyles.emptyText]}>
                  {noResultsText}
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
