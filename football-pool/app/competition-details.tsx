import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import competitionsData from '@/context/mocks/competitions-data.json';

export default function CompetitionDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { id } = params;

  // Buscar la competición en todos los datos
  const competition = useMemo(() => {
    const allCompetitions = [
      ...competitionsData.fifaNationalTeamCups,
      ...competitionsData.fifaOfficialClubCups,
      ...competitionsData.nationalClubLeagues,
    ];
    return allCompetitions.find((comp) => comp.id === id);
  }, [id]);

  if (!competition) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#11181C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>Competición no encontrada</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {competition.shortName}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Card con icono y color */}
        <View style={[styles.heroCard, { backgroundColor: competition.color || '#3B82F6' }]}>
          <Ionicons name={competition.icon as any} size={80} color="#fff" />
          <Text style={styles.heroTitle}>{competition.name}</Text>
          {competition.region && (
            <Text style={styles.heroSubtitle}>{competition.region}</Text>
          )}
          {competition.country && (
            <Text style={styles.heroSubtitle}>{competition.country}</Text>
          )}
        </View>

        {/* Información General */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Información General</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="football" size={20} color="#687076" />
              <Text style={styles.infoLabelText}>Nombre Completo</Text>
            </View>
            <Text style={styles.infoValue}>{competition.name}</Text>
          </View>

          {competition.type && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="trophy" size={20} color="#687076" />
                <Text style={styles.infoLabelText}>Tipo</Text>
              </View>
              <Text style={styles.infoValue}>
                {competition.type === 'national-team' ? 'Selecciones' : 'Clubes'}
              </Text>
            </View>
          )}

          {competition.region && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="location" size={20} color="#687076" />
                <Text style={styles.infoLabelText}>Región</Text>
              </View>
              <Text style={styles.infoValue}>{competition.region}</Text>
            </View>
          )}

          {competition.country && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="flag" size={20} color="#687076" />
                <Text style={styles.infoLabelText}>País</Text>
              </View>
              <Text style={styles.infoValue}>{competition.country}</Text>
            </View>
          )}

          {competition.frequency && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="calendar" size={20} color="#687076" />
                <Text style={styles.infoLabelText}>Frecuencia</Text>
              </View>
              <Text style={styles.infoValue}>{competition.frequency}</Text>
            </View>
          )}
        </View>

        {/* Próximamente */}
        <View style={styles.comingSoonCard}>
          <Ionicons name="construct" size={40} color="#687076" />
          <Text style={styles.comingSoonTitle}>Próximamente</Text>
          <Text style={styles.comingSoonText}>
            • Partidos y resultados en vivo{'\n'}
            • Tabla de posiciones{'\n'}
            • Equipos participantes{'\n'}
            • Goleadores y estadísticas{'\n'}
            • Calendario de partidos
          </Text>
        </View>

        <View style={{ height: 40 }} />
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
    paddingHorizontal: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#687076',
    textAlign: 'center',
    marginTop: 40,
  },
  heroCard: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  infoLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#687076',
  },
  infoValue: {
    fontSize: 16,
    color: '#11181C',
    fontWeight: '500',
  },
  comingSoonCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#11181C',
    marginTop: 16,
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 15,
    color: '#687076',
    lineHeight: 24,
    textAlign: 'center',
  },
});

