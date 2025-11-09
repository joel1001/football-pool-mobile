import React, { memo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { InputProps } from "./input.types";
import { styles } from "./input.styles";

export const Input = memo(({
  size = "medium",
  placeholder,
  type = "text",
  value,
  onChangeText,
  secureTextEntry,
  style,
  dataTestId,
  inputError,
  errorColor,
  label,
  keyboardType,
  revertInput,
  passwordIcons,
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const s = styles({ size, errorColor });

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <View style={s.container}>
      {label && <Text style={s.label}>{label}</Text>}

      <View style={[s.inputParent, style]}>
        <TextInput
          placeholder={placeholder}
          secureTextEntry={type === "password" ? !showPassword : secureTextEntry}
          value={value}
          onChangeText={onChangeText}
          data-testid={dataTestId}
          style={s.textInput}
          keyboardType={keyboardType}
        />

        {type === "password" && passwordIcons && (
          <TouchableOpacity onPress={handleTogglePassword} style={{ paddingLeft: 8 }}>
            {showPassword
              ? passwordIcons.hidePasswordIcon
              : passwordIcons.displayPasswordIcon}
          </TouchableOpacity>
        )}
      </View>

      {inputError && <Text style={s.errorText}>{inputError}</Text>}

      {revertInput && (
        <TouchableOpacity onPress={revertInput.revertCallback}>
          <Text style={s.revertText}>{revertInput.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});