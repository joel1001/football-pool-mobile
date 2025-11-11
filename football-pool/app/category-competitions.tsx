import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CompetitionCard } from '@/atomic';
import competitionsData from '@/context/mocks/competitions-data.json';

export default function CategoryCompetitionsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { category, title } = params;

  // Obtener datos según la categoría
  const getCategoryData = () => {
    switch (category) {
      case 'fifaNationalTeamCups':
        return competitionsData.fifaNationalTeamCups;
      case 'fifaOfficialClubCups':
        return competitionsData.fifaOfficialClubCups;
      case 'nationalClubLeagues':
        return competitionsData.nationalClubLeagues;
      default:
        return [];
    }
  };

  const competitions = getCategoryData();

  const handleCardPress = (id: string) => {
    console.log('Competition selected:', id);
    // Aquí puedes navegar a detalles específicos de la competición
    router.push({
      pathname: '/competition-details',
      params: { id },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title as string}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {competitions.map((comp) => (
            <CompetitionCard
              key={comp.id}
              id={comp.id}
              name={comp.name}
              shortName={comp.shortName}
              region={comp.region}
              country={comp.country}
              icon={comp.icon}
              color={comp.color}
              onPress={handleCardPress}
              style={styles.card}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#11181C',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  card: {
    marginRight: 0,
    marginBottom: 16,
  },
});

