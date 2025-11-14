import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { getCompetitionDetails } from '@/services/competitions';
import { CompetitionDetailsResponse } from '@/services/competitions/competition-types';
import { createGroup, inviteUser, patchGroup } from '@/services/groups';
import { AnimatedBackgroundCorner, CreateGroupModal } from '@/atomic';

export default function CompetitionDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { id, category } = params;
  
  const [competition, setCompetition] = useState<CompetitionDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadCompetitionDetails();
  }, [id, category]);

  const loadCompetitionDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCompetitionDetails(category as string, id as string);
      console.log('📊 Competition Details Loaded:', {
        id: data.id,
        shortName: data.shortName,
        poolAvailableDay: data.poolAvailableDay,
        poolaAvailableDay: data.poolaAvailableDay,
        hasAvailableDay: !!(data.poolAvailableDay || data.poolaAvailableDay),
      });
      setCompetition(data);
    } catch (err: any) {
      console.error('Error loading competition details:', err);
      setError(err.response?.data?.error || 'Error al cargar detalles');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if competition is OPEN (available for group creation)
  const isCompetitionOpen = (comp: CompetitionDetailsResponse | null): boolean => {
    if (!comp) {
      console.log('🔍 isCompetitionOpen: Competition is null');
      return false;
    }
    
    const availableDay = comp.poolAvailableDay || comp.poolaAvailableDay;
    console.log('🔍 isCompetitionOpen:', {
      competitionId: comp.id,
      poolAvailableDay: comp.poolAvailableDay,
      poolaAvailableDay: comp.poolaAvailableDay,
      availableDay,
      hasAvailableDay: !!availableDay,
    });
    
    if (!availableDay) {
      console.log('🔍 isCompetitionOpen: No availableDay found - BUTTON HIDDEN');
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(availableDay);
    startDate.setHours(0, 0, 0, 0);
    
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log('🔍 isCompetitionOpen:', {
      diffDays,
      isInRange: diffDays >= 4 && diffDays <= 15,
      buttonVisible: diffDays >= 4 && diffDays <= 15,
    });
    
    // Open if 4-15 days before start
    const isOpen = diffDays >= 4 && diffDays <= 15;
    
    if (isOpen) {
      console.log('✅ BUTTON VISIBLE - Competition is OPEN!');
    } else {
      console.log('❌ BUTTON HIDDEN - Competition is not OPEN');
    }
    
    return isOpen;
  };

  const handleOpenModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateGroupFromModal = async (
    groupName: string | undefined,
    existingUserIds: string[],
    inviteEmails: string[]
  ) => {
    if (!competition) return;
    
    try {
      console.log('Creating group for competition:', id, category);
      console.log('Group name:', groupName);
      console.log('Existing user IDs:', existingUserIds);
      console.log('Invite emails:', inviteEmails);
      
      // 1. Create group
      const response = await createGroup({
        competitionId: id as string,
        category: category as 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues',
        name: groupName,
      });
      
      const groupId = response.group.groupId;
      console.log('✅ Group created:', groupId);
      
      // 2. Add existing users to the group
      if (existingUserIds.length > 0) {
        console.log('Adding existing users to group...');
        await patchGroup(groupId, {
          userIds: [...response.group.userIds, ...existingUserIds],
        });
        console.log('✅ Existing users added');
      }
      
      // 3. Send invitations to non-existing users
      if (inviteEmails.length > 0) {
        console.log('Sending invitations...');
        for (const email of inviteEmails) {
          await inviteUser(groupId, { email });
        }
        console.log('✅ Invitations sent');
      }
      
      // Close modal
      setShowCreateModal(false);
      
      // Show success message
      Alert.alert(
        '✅ Grupo Creado',
        `Tu grupo "${response.group.competitionName}" ha sido creado exitosamente.\n\n` +
        `👥 ${existingUserIds.length} usuarios agregados\n` +
        `📧 ${inviteEmails.length} invitaciones enviadas`,
        [
          {
            text: 'Ver Grupo',
            onPress: () => {
              // TODO: Navigate to group details
              console.log('Navigate to group:', groupId);
            },
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (err: any) {
      console.error('❌ Error creating group:', err);
      Alert.alert(
        'Error',
        err.response?.data?.error || 'No se pudo crear el grupo. Intenta nuevamente.',
        [{ text: 'OK' }]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AnimatedBackgroundCorner />
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

  if (error || !competition) {
    return (
      <View style={styles.container}>
        <AnimatedBackgroundCorner />
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
        <View style={styles.content}>
          <Text style={styles.errorText}>
            {error || 'Competición no encontrada'}
          </Text>
          <TouchableOpacity onPress={loadCompetitionDetails} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Log before render
  const showCreateButton = isCompetitionOpen(competition);
  console.log('🎯 RENDER DECISION:', {
    competitionId: competition.id,
    showCreateButton,
  });

  return (
    <View style={styles.container}>
      <AnimatedBackgroundCorner />
      
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#E8F5E9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {competition.shortName}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Card con logo */}
        <View style={styles.heroCard}>
          {competition.image && (
            <View style={styles.imageContainer}>
              {/* Imagen con blur para suavizar líneas rectas */}
              <Image
                source={{ uri: competition.image }}
                style={styles.heroImageBlurred}
                resizeMode="contain"
                blurRadius={2}
              />
              {/* Imagen nítida encima */}
              <Image
                source={{ uri: competition.image }}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </View>
          )}
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
              <Ionicons name="football" size={20} color="#1A4D3A" />
              <Text style={styles.infoLabelText}>Nombre Completo</Text>
            </View>
            <Text style={styles.infoValue}>{competition.name}</Text>
          </View>

          {competition.type && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="trophy" size={20} color="#1A4D3A" />
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
                <Ionicons name="location" size={20} color="#1A4D3A" />
                <Text style={styles.infoLabelText}>Región</Text>
              </View>
              <Text style={styles.infoValue}>{competition.region}</Text>
            </View>
          )}

          {competition.country && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="flag" size={20} color="#1A4D3A" />
                <Text style={styles.infoLabelText}>País</Text>
              </View>
              <Text style={styles.infoValue}>{competition.country}</Text>
            </View>
          )}

          {competition.frequency && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="calendar" size={20} color="#1A4D3A" />
                <Text style={styles.infoLabelText}>Frecuencia</Text>
              </View>
              <Text style={styles.infoValue}>{competition.frequency}</Text>
            </View>
          )}
        </View>

        {/* Botón Crear Grupo - Solo visible si la competencia está ABIERTA (reemplaza el card de Próximamente) */}
        {showCreateButton ? (
          <TouchableOpacity 
            style={styles.createGroupButton}
            onPress={handleOpenModal}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.createGroupGradient}
            >
              <Ionicons name="people" size={24} color="#FFFFFF" />
              <Text style={styles.createGroupText}>Crear Grupo</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          /* Próximamente - Solo se muestra si NO está abierto */
          <View style={styles.comingSoonCard}>
            <Ionicons name="construct" size={40} color="#1A4D3A" />
            <Text style={styles.comingSoonTitle}>Próximamente</Text>
            <Text style={styles.comingSoonText}>
              • Partidos y resultados en vivo{'\n'}
              • Tabla de posiciones{'\n'}
              • Equipos participantes{'\n'}
              • Goleadores y estadísticas{'\n'}
              • Calendario de partidos
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal de Crear Grupo */}
      <CreateGroupModal
        visible={showCreateModal}
        competitionId={id as string}
        competitionName={competition.name}
        category={category as 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues'}
        onClose={handleCloseModal}
        onCreate={handleCreateGroupFromModal}
      />
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(26, 77, 58, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 100,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8F5E9',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#E8F5E9',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(232, 245, 233, 0.8)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    color: '#1A4D3A',
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(232, 245, 233, 0.5)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 15,
    minHeight: 280,
  },
  imageContainer: {
    width: 200,
    height: 200,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 100,
    overflow: 'hidden',
  },
  heroImageBlurred: {
    position: 'absolute',
    width: 210,
    height: 210,
    opacity: 0.4,
    borderRadius: 105,
  },
  heroImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A4D3A',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A4D3A',
    opacity: 0.8,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: 'rgba(232, 245, 233, 0.5)',
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
    elevation: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A4D3A',
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
    color: '#1A4D3A',
  },
  infoValue: {
    fontSize: 16,
    color: '#1A4D3A',
    fontWeight: '500',
  },
  comingSoonCard: {
    backgroundColor: 'rgba(232, 245, 233, 0.5)',
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
    elevation: 15,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A4D3A',
    marginTop: 16,
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 15,
    color: '#1A4D3A',
    lineHeight: 24,
    textAlign: 'center',
  },
  createGroupButton: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  createGroupGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  createGroupText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
