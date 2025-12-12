import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { getGroupById } from '@/services/groups';
import { Group } from '@/services/groups/group-types';

export default function GroupDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { id } = params; // Group ID
  
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroupDetails();
  }, [id]);

  const loadGroupDetails = async () => {
    if (!id || typeof id !== 'string') {
      setError('ID de grupo no válido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await getGroupById(id);
      setGroup(response.group);
    } catch (err: any) {
      console.error('Error loading group details:', err);
      setError(err.response?.data?.error || 'Error al cargar detalles del grupo');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#E8F5E9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cargando...</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8F5E9" />
        </View>
      </View>
    );
  }

  if (error || !group) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#E8F5E9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error || 'Grupo no encontrado'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadGroupDetails}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
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
          <Ionicons name="arrow-back" size={24} color="#E8F5E9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {group.competitionName || 'Detalles del Grupo'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Group Name */}
          {group.name && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nombre del Grupo</Text>
              <Text style={styles.sectionValue}>{group.name}</Text>
            </View>
          )}

          {/* Competition Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Competencia</Text>
            <Text style={styles.sectionValue}>{group.competitionName}</Text>
          </View>

          {/* Participants Count */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participantes</Text>
            <Text style={styles.sectionValue}>
              {group.userIds?.length || 0} usuario(s)
            </Text>
            {group.invitedEmails && group.invitedEmails.length > 0 && (
              <Text style={styles.sectionSubValue}>
                {group.invitedEmails.length} invitación(es) pendiente(s)
              </Text>
            )}
          </View>

          {/* Created Date */}
          {group.createdAt && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Creado</Text>
              <Text style={styles.sectionValue}>
                {new Date(group.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          )}

          {/* Tabla de posiciones (scoreboard) */}
          {group.scoreboard && group.scoreboard.teams && group.scoreboard.teams.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tabla de posiciones</Text>
              <View style={styles.table}>
                {/* Encabezados */}
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <Text style={[styles.tableCell, styles.tableCellTeam]}>Equipo</Text>
                  <Text style={styles.tableCell}>PJ</Text>
                  <Text style={styles.tableCell}>G</Text>
                  <Text style={styles.tableCell}>E</Text>
                  <Text style={styles.tableCell}>P</Text>
                  <Text style={styles.tableCell}>GF</Text>
                  <Text style={styles.tableCell}>GC</Text>
                  <Text style={styles.tableCell}>DG</Text>
                  <Text style={styles.tableCell}>Pts</Text>
                </View>

                {/* Filas de datos */}
                {group.scoreboard.teams.map((team) => (
                  <View key={team.teamId} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableCellTeam]} numberOfLines={1}>
                      {team.teamName}
                    </Text>
                    <Text style={styles.tableCell}>{team.played}</Text>
                    <Text style={styles.tableCell}>{team.won}</Text>
                    <Text style={styles.tableCell}>{team.drawn}</Text>
                    <Text style={styles.tableCell}>{team.lost}</Text>
                    <Text style={styles.tableCell}>{team.goalsFor}</Text>
                    <Text style={styles.tableCell}>{team.goalsAgainst}</Text>
                    <Text style={styles.tableCell}>{team.goalDifference}</Text>
                    <Text style={styles.tableCell}>{team.points}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A4D3A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#1A4D3A',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E8F5E9',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#E8F5E9',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A7F3D0',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E8F5E9',
  },
  sectionSubValue: {
    fontSize: 14,
    color: '#D1FAE5',
    marginTop: 4,
  },
  table: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(231, 245, 253, 0.3)',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 118, 110, 0.15)',
  },
  tableHeaderRow: {
    backgroundColor: 'rgba(15, 118, 110, 0.35)',
  },
  tableCell: {
    flex: 0.8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 10,
    color: '#E6FFFA',
    textAlign: 'center',
  },
  tableCellTeam: {
    flex: 2.5,
    textAlign: 'left',
    paddingLeft: 8,
  },
});

