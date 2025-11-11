import React, { useState } from 'react';
import { View } from 'react-native';
import SearchBar from './search-bar';

export default {
  title: 'Molecules/SearchBar',
  component: SearchBar,
};

export const Default = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={{ backgroundColor: '#F5F5F5', padding: 20 }}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar competiciones..."
      />
    </View>
  );
};

export const WithText = () => {
  const [searchQuery, setSearchQuery] = useState('Champions');

  return (
    <View style={{ backgroundColor: '#F5F5F5', padding: 20 }}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar competiciones..."
      />
    </View>
  );
};

export const CustomPlaceholder = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={{ backgroundColor: '#F5F5F5', padding: 20 }}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Escribe para buscar..."
      />
    </View>
  );
};

export const WithCallback = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={{ backgroundColor: '#F5F5F5', padding: 20 }}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => console.log('Search cleared!')}
        placeholder="Buscar competiciones..."
      />
    </View>
  );
};

