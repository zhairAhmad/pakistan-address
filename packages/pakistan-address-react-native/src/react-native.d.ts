declare module 'react-native' {
  import * as React from 'react';

  export interface ViewStyle {
    flex?: number;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    margin?: number | string;
    marginBottom?: number | string;
    marginTop?: number | string;
    marginLeft?: number | string;
    marginRight?: number | string;
    marginHorizontal?: number | string;
    marginVertical?: number | string;
    padding?: number | string;
    paddingBottom?: number | string;
    paddingTop?: number | string;
    paddingLeft?: number | string;
    paddingRight?: number | string;
    paddingHorizontal?: number | string;
    paddingVertical?: number | string;
    width?: number | string;
    height?: number | string;
    minWidth?: number | string;
    minHeight?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderBottomWidth?: number;
    borderTopWidth?: number;
    borderLeftWidth?: number;
    borderRightWidth?: number;
    borderLeftColor?: string;
    borderRightColor?: string;
    borderTopColor?: string;
    borderBottomColor?: string;
    borderRadius?: number;
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
    position?: 'absolute' | 'relative';
    top?: number | string;
    bottom?: number | string;
    left?: number | string;
    right?: number | string;
    zIndex?: number;
    overflow?: 'visible' | 'hidden' | 'scroll';
    opacity?: number;
    elevation?: number;
    shadowColor?: string;
    shadowOffset?: { width: number; height: number };
    shadowOpacity?: number;
    shadowRadius?: number;
    [key: string]: any;
  }

  export interface TextStyle extends ViewStyle {
    color?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    fontStyle?: 'normal' | 'italic';
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through';
    lineHeight?: number;
    letterSpacing?: number;
    textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
    [key: string]: any;
  }

  export type StyleProp<T> = T | undefined | null | false | (T | undefined | null | false | StyleProp<T>)[];

  export interface ViewProps extends React.PropsWithChildren<{}> {
    style?: StyleProp<ViewStyle>;
    testID?: string;
    accessible?: boolean;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    [key: string]: any;
  }

  export const View: React.FC<ViewProps>;

  export interface TextProps extends React.PropsWithChildren<{}> {
    style?: StyleProp<TextStyle>;
    numberOfLines?: number;
    testID?: string;
    accessible?: boolean;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    [key: string]: any;
  }

  export const Text: React.FC<TextProps>;

  export interface TextInputProps {
    value?: string;
    defaultValue?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    placeholderTextColor?: string;
    style?: StyleProp<TextStyle>;
    multiline?: boolean;
    numberOfLines?: number;
    editable?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
    testID?: string;
    accessible?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    clearButtonMode?: 'never' | 'while-editing' | 'unless-editing' | 'always';
    [key: string]: any;
  }

  export const TextInput: React.FC<TextInputProps>;

  export interface ModalProps extends React.PropsWithChildren<{}> {
    visible?: boolean;
    transparent?: boolean;
    animationType?: 'none' | 'slide' | 'fade';
    onRequestClose?: () => void;
    testID?: string;
    [key: string]: any;
  }

  export const Modal: React.FC<ModalProps>;

  export interface PressableStateCallbackType {
    pressed: boolean;
  }

  export interface PressableProps extends React.PropsWithChildren<{}> {
    onPress?: (event: any) => void;
    disabled?: boolean | null;
    style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
    testID?: string;
    accessible?: boolean;
    accessibilityRole?: string;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityState?: { disabled?: boolean; selected?: boolean; [key: string]: any };
    [key: string]: any;
  }

  export const Pressable: React.FC<PressableProps>;

  export interface ListRenderItemInfo<ItemT> {
    item: ItemT;
    index: number;
    separators: {
      highlight: () => void;
      unhighlight: () => void;
      updateProps: (select: 'leading' | 'trailing', newProps: any) => void;
    };
  }

  export type ListRenderItem<ItemT> = (info: ListRenderItemInfo<ItemT>) => React.ReactElement | null;

  export interface FlatListProps<ItemT> {
    data: readonly ItemT[] | null | undefined;
    renderItem: ListRenderItem<ItemT> | null | undefined;
    keyExtractor?: (item: ItemT, index: number) => string;
    keyboardShouldPersistTaps?: boolean | 'always' | 'never' | 'handled';
    ItemSeparatorComponent?: React.ComponentType<any> | null;
    ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    testID?: string;
    initialNumToRender?: number;
    maxToRenderPerBatch?: number;
    windowSize?: number;
    [key: string]: any;
  }

  export class FlatList<ItemT = any> extends React.Component<FlatListProps<ItemT>> {}

  export namespace StyleSheet {
    type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle };
    export function create<T extends NamedStyles<T> | NamedStyles<any>>(styles: T | NamedStyles<T>): T;
    export const flatten: <T>(style: StyleProp<T>) => T;
    export const hairlineWidth: number;
  }
}
