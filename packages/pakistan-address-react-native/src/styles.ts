import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

export interface AddressFieldsStyles {
  container?: ViewStyle;
  field?: ViewStyle;
  label?: TextStyle;
  pickerButton?: ViewStyle;
  pickerButtonText?: TextStyle;
  pickerButtonPlaceholder?: TextStyle;
  pickerButtonDisabled?: ViewStyle;
  pickerButtonIcon?: TextStyle;
  input?: TextStyle;
  notice?: ViewStyle;
  noticeText?: TextStyle;
  modalOverlay?: ViewStyle;
  modalContent?: ViewStyle;
  modalHeader?: ViewStyle;
  modalTitle?: TextStyle;
  modalCloseButton?: ViewStyle;
  modalCloseButtonText?: TextStyle;
  searchInput?: TextStyle;
  optionItem?: ViewStyle;
  optionItemText?: TextStyle;
  optionItemSelected?: ViewStyle;
  optionItemSelectedText?: TextStyle;
  emptyText?: TextStyle;
  addressLineInput?: TextStyle;
}

export const defaultStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151', // gray-700
    marginBottom: 6,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 8,
    minHeight: 48,
  },
  pickerButtonText: {
    fontSize: 15,
    color: '#111827', // gray-900
    flex: 1,
  },
  pickerButtonPlaceholder: {
    color: '#9ca3af', // gray-400
  },
  pickerButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    opacity: 0.6,
  },
  pickerButtonIcon: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    marginTop: 8,
    minHeight: 44,
  },
  addressLineInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    minHeight: 72,
    textAlignVertical: 'top',
  },
  notice: {
    backgroundColor: '#fef3c7', // amber-100
    borderLeftWidth: 4,
    borderLeftColor: '#d97706', // amber-600
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 13,
    color: '#92400e', // amber-800
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    paddingBottom: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  modalCloseButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modalCloseButtonText: {
    fontSize: 15,
    color: '#4b5563',
    fontWeight: '500',
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionItemText: {
    fontSize: 15,
    color: '#1f2937',
  },
  optionItemSelected: {
    backgroundColor: '#ecfdf5', // green-50
  },
  optionItemSelectedText: {
    color: '#065f46', // green-800
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    padding: 24,
    color: '#9ca3af',
    fontSize: 14,
  },
});
