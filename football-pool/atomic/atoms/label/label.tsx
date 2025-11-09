import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { LabelProps } from './label.types';
import { styles } from './label.styles';

const Label: React.FC<LabelProps> = ({
  text,
  color = '#000',
  size = 'medium',
  weight = 'normal',
  width,
  style,
  ...rest
}) => {
  const widthStyle: StyleProp<TextStyle> | undefined =
    typeof width === 'number' ? { width } : width ? { width: width as any } : undefined;

  return (
    <Text
      style={[styles.base, styles[size], { color, fontWeight: weight }, style, widthStyle]}
      {...rest}
    >
      {text}
    </Text>
  );
};

export default Label;