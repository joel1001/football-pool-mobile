import { KeyboardTypeOptions } from 'react-native';

export interface InputProps {
  size?: 'small' | 'medium' | 'large';
  placeholder?: string;
  type?: 'text' | 'password';
  value?: string;
  onChangeText: (value: string) => void
  secureTextEntry?: boolean;
  style?: object;
  dataTestId?: string;
  inputError?: string;
  errorColor?: string;
  label?: string;
  keyboardType?: KeyboardTypeOptions;
  revertInput?: {
    label: string;
    revertCallback: () => void;
  };
  passwordIcons?: {
    displayPasswordIcon: React.ReactNode;
    hidePasswordIcon: React.ReactNode;
  };
}

export type RevertInput ={
  label: string;
  revertCallback: () => void;
  revertClass?: string;
}

export type PasswordIcons = {
  displayPasswordIcon: React.ReactElement;
  hidePasswordIcon: React.ReactElement;
}