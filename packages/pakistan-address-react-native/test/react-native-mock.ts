import React from 'react';

const cleanProps = (props: any) => {
  const {
    testID,
    accessibilityRole,
    accessibilityLabel,
    accessibilityHint,
    accessibilityState,
    numberOfLines,
    placeholderTextColor,
    clearButtonMode,
    autoCorrect,
    autoCapitalize,
    returnKeyType,
    multiline,
    ...rest
  } = props;
  return {
    ...(testID ? { 'data-testid': testID } : {}),
    ...rest,
  };
};

export const View = ({ children, ...props }: any) =>
  React.createElement('div', cleanProps(props), children);

export const Text = ({ children, ...props }: any) =>
  React.createElement('span', cleanProps(props), children);

export const TextInput = ({ onChangeText, ...props }: any) =>
  React.createElement('input', {
    ...cleanProps(props),
    onChange: onChangeText ? (e: any) => onChangeText(e.target.value) : undefined,
  });

export const Modal = ({ children, visible, ...props }: any) =>
  visible ? React.createElement('div', { role: 'dialog', ...cleanProps(props) }, children) : null;

export const Pressable = ({ children, onPress, disabled, ...props }: any) =>
  React.createElement('button', { ...cleanProps(props), onClick: onPress, disabled }, children);

export const FlatList = ({ data, renderItem, ListEmptyComponent, ...props }: any) => {
  const items =
    data && data.length > 0
      ? data.map((item: any, index: number) => renderItem({ item, index }))
      : ListEmptyComponent;
  return React.createElement('div', cleanProps(props), items);
};

export const StyleSheet = {
  create: <T>(styles: T): T => styles,
  flatten: <T>(style: any): T => style,
  hairlineWidth: 1,
};
