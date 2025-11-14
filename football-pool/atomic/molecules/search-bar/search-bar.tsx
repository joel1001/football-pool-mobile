import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchBarProps } from './search-bar.types';
import { styles } from './search-bar.styles';

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Buscar competiciones...',
  onClear,
  style,
  ...rest
}) => {
  const handleClear = () => {
    onChangeText('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={20} color="#1A4D3A" style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(26, 77, 58, 0.6)"
        returnKeyType="search"
        autoCorrect={false}
        {...rest}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={20} color="#1A4D3A" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;

