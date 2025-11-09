import { TouchableOpacityProps, StyleProp, ViewStyle, TextStyle } from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  color?: string;
  backgroundColor?: string;
  disabled?: boolean;
  width?: number | string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}