import { StyleSheet, ScrollView, View, ActivityIndicator, Text } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { CompetitionCarousel, SearchBar, AnimatedBackground } from '@/atomic';
import { getAllCompetitions, searchCompetitions } from '@/services/competitions';
import { CompetitionsResponse } from '@/services/competitions/competition-types';
import { useAppContext } from '@/context/app-context';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [competitionsData, setCompetitionsData] = useState<CompetitionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { localData } = useAppContext();

  // Cargar competiciones del backend
  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllCompetitions();
      setCompetitionsData(data);
    } catch (err: any) {
      console.error('Error loading competitions:', err);
      setError(err.response?.data?.error || 'Error al cargar competiciones');
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar competiciones cuando cambia el query
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      loadCompetitions();
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      const data = await searchCompetitions(searchQuery);
      setCompetitionsData(data);
    } catch (err: any) {
      console.error('Error searching competitions:', err);
      setError(err.response?.data?.error || 'Error en la búsqueda');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryPress = (category: string, title: string) => {
    console.log('Category selected:', category);
    router.push({
      pathname: '/category-competitions',
      params: { category, title },
    });
  };

  const handleCardPress = (id: string, category: string) => {
    console.log('Competition selected:', id);
    router.push({
      pathname: '/competition-details',
      params: { id, category },
    });
  };

  if (isLoading && !competitionsData) {
    return (
      <View style={homeStyles.container}>
        <AnimatedBackground />
        <View style={homeStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8F5E9" />
          <Text style={homeStyles.loadingText}>Cargando competiciones...</Text>
        </View>
      </View>
    );
  }

  if (error && !competitionsData) {
    return (
      <View style={homeStyles.container}>
        <AnimatedBackground />
        <View style={homeStyles.errorContainer}>
          <Text style={homeStyles.errorText}>{error}</Text>
          <Text style={homeStyles.retryText} onPress={loadCompetitions}>
            Reintentar
          </Text>
        </View>
      </View>
    );
  }

  if (!competitionsData) {
    return (
      <View style={homeStyles.container}>
        <AnimatedBackground />
        <View style={homeStyles.errorContainer}>
          <Text style={homeStyles.errorText}>No hay competiciones disponibles</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={homeStyles.container}>
      <AnimatedBackground />
      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar competiciones..."
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={homeStyles.scrollContent}
      >
        {competitionsData.fifaNationalTeamCups?.length > 0 && (
          <CompetitionCarousel
            title="Copas FIFA Selecciones"
            data={competitionsData.fifaNationalTeamCups}
            onPressCard={(id) => handleCardPress(id, 'fifaNationalTeamCups')}
            onPressTitle={() => handleCategoryPress('fifaNationalTeamCups', 'Copas FIFA Selecciones')}
          />
        )}

        {competitionsData.fifaOfficialClubCups?.length > 0 && (
          <CompetitionCarousel
            title="Copas FIFA Clubes"
            data={competitionsData.fifaOfficialClubCups}
            onPressCard={(id) => handleCardPress(id, 'fifaOfficialClubCups')}
            onPressTitle={() => handleCategoryPress('fifaOfficialClubCups', 'Copas FIFA Clubes')}
          />
        )}

        {competitionsData.nationalClubLeagues?.length > 0 && (
          <CompetitionCarousel
            title="Ligas Nacionales"
            data={competitionsData.nationalClubLeagues}
            onPressCard={(id) => handleCardPress(id, 'nationalClubLeagues')}
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
    backgroundColor: '#1A4D3A',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#E8F5E9',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#E8F5E9',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryText: {
    fontSize: 16,
    color: '#E8F5E9',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
