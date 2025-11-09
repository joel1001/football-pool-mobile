import { TextProps, TextStyle } from 'react-native';

export interface LabelProps extends TextProps {
  text: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  weight?: TextStyle['fontWeight'];
  style?: TextStyle;
  width?: string | number;
}