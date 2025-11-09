import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { ButtonProps } from './button.types';
import { styles } from './button.styles';

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  color = '#fff',
  backgroundColor = '#3B82F6',
  disabled = false,
  width,
  style,
  textStyle,
  ...rest
}) => {
  const buttonStyle: StyleProp<ViewStyle> = [
    styles.base,
    { 
      backgroundColor, 
      ...(width !== undefined ? { width: width as unknown as number } : {}) 
    },
    style,
    disabled && styles.disabled,
  ];

  const labelStyle: StyleProp<TextStyle> = [
    styles.text,
    { color },
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={buttonStyle}
      activeOpacity={0.7}
      disabled={disabled}
      {...rest}
    >
      <Text style={labelStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;