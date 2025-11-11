import { StyleSheet, ScrollView, View } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { CompetitionCarousel, SearchBar, AnimatedBackground } from '@/atomic';
import competitionsData from '@/context/mocks/competitions-data.json';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleCategoryPress = (category: string, title: string) => {
    console.log('Category selected:', category);
    router.push({
      pathname: '/category-competitions',
      params: { category, title },
    });
  };

  const handleCardPress = (id: string) => {
    console.log('Competition selected:', id);
    router.push({
      pathname: '/competition-details',
      params: { id },
    });
  };

  // Filtrar competiciones basado en el search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) {
      return competitionsData;
    }

    const query = searchQuery.toLowerCase();

    return {
      fifaNationalTeamCups: competitionsData.fifaNationalTeamCups.filter(
        (comp) =>
          comp.name.toLowerCase().includes(query) ||
          comp.shortName.toLowerCase().includes(query) ||
          comp.region?.toLowerCase().includes(query)
      ),
      fifaOfficialClubCups: competitionsData.fifaOfficialClubCups.filter(
        (comp) =>
          comp.name.toLowerCase().includes(query) ||
          comp.shortName.toLowerCase().includes(query) ||
          comp.region?.toLowerCase().includes(query)
      ),
      nationalClubLeagues: competitionsData.nationalClubLeagues.filter(
        (comp) =>
          comp.name.toLowerCase().includes(query) ||
          comp.country?.toLowerCase().includes(query)
      ),
    };
  }, [searchQuery]);

  return (
    <View style={homeStyles.container}>
      <AnimatedBackground />
      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar competiciones..."
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredData.fifaNationalTeamCups.length > 0 && (
          <CompetitionCarousel
            title="Copas FIFA Selecciones"
            data={filteredData.fifaNationalTeamCups}
            onPressCard={handleCardPress}
            onPressTitle={() => handleCategoryPress('fifaNationalTeamCups', 'Copas FIFA Selecciones')}
          />
        )}

        {filteredData.fifaOfficialClubCups.length > 0 && (
          <CompetitionCarousel
            title="Copas FIFA Clubes"
            data={filteredData.fifaOfficialClubCups}
            onPressCard={handleCardPress}
            onPressTitle={() => handleCategoryPress('fifaOfficialClubCups', 'Copas FIFA Clubes')}
          />
        )}

        {filteredData.nationalClubLeagues.length > 0 && (
          <CompetitionCarousel
            title="Ligas Nacionales"
            data={filteredData.nationalClubLeagues}
            onPressCard={handleCardPress}
            onPressTitle={() => handleCategoryPress('nationalClubLeagues', 'Ligas Nacionales')}
          />
        )}
      </ScrollView>
    </View>
  );
}

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A4D3A', // Verde del login
  },
});
