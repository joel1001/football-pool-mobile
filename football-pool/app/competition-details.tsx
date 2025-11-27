import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { getCompetitionDetails } from '@/services/competitions';
import { CompetitionDetailsResponse } from '@/services/competitions/competition-types';
import { createGroup, inviteUser, patchGroup, getUserGroups } from '@/services/groups';
import type { Group } from '@/services/groups/group-types';
import { AnimatedBackgroundCorner, CreateGroupModal, ProfileBadge } from '@/atomic';
import { useTranslation } from 'react-i18next';

export default function CompetitionDetailsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { id, category } = params;
  
  const [competition, setCompetition] = useState<CompetitionDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [isLoadingUserGroups, setIsLoadingUserGroups] = useState(false);

  useEffect(() => {
    loadCompetitionDetails();
  }, [id, category]);

  useEffect(() => {
    if (!id) return;
    loadUserGroups();
  }, [id]);

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
      setError(err.response?.data?.error || t('competitions.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserGroups = async () => {
    try {
      setIsLoadingUserGroups(true);
      const response = await getUserGroups();
      const competitionId = id as string;
      const groupsForCompetition = response.groups.filter(
        (group) => group.competitionId === competitionId
      );
      console.log('📚 User groups for competition:', {
        competitionId,
        total: response.count,
        filtered: groupsForCompetition.length,
      });
      setUserGroups(groupsForCompetition);
    } catch (err: any) {
      console.error('❌ Error loading user groups:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        error: err.response?.data?.error,
        message: err.response?.data?.message,
        url: err.config?.url,
        fullError: err,
      });
      
      // Si es un error 500 del backend, mostrar mensaje específico
      if (err.response?.status === 500) {
        const backendError = err.response?.data?.error || '';
        console.warn('⚠️ Backend error 500:', {
          error: backendError,
          url: err.config?.url,
        });
        
        if (backendError.includes('converting from type') || backendError.includes('converter')) {
          console.warn('⚠️ Backend error: Type conversion issue. This is a backend bug that needs to be fixed.');
          // No mostrar alert al usuario, solo mantener grupos vacíos
          // El usuario puede seguir usando la app, solo no verá sus grupos hasta que el backend se corrija
        }
      } else {
        // Para otros errores, también mantener grupos vacíos pero loguear
        console.warn('⚠️ Error loading groups (non-500):', {
          status: err.response?.status,
          error: err.response?.data?.error,
        });
      }
      
      // Mantener grupos vacíos en lugar de fallar completamente
      // Esto permite que la app continúe funcionando aunque no se puedan cargar los grupos
      setUserGroups([]);
    } finally {
      setIsLoadingUserGroups(false);
    }
  };

  // Check if competition is OPEN (available for group creation)
  // Lógica:
  // - Cuando está EN CURSO: se puede crear y acceder a grupos
  // - Cuando está CERRADA: NO se pueden crear más grupos, PERO se pueden ver los existentes
  const isCompetitionOpen = (comp: CompetitionDetailsResponse | null): boolean => {
    if (!comp) {
      console.log('🔍 isCompetitionOpen: Competition is null');
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Verificar si la competencia está cerrada (poolDisabledDate)
    const disabledDate = comp.poolDisabledDate || comp.poolDisbaledDate;
    if (disabledDate) {
      const closedDate = new Date(disabledDate);
      closedDate.setHours(0, 0, 0, 0);
      
      // Si hoy es después de la fecha de cierre, no se puede crear grupos
      if (today > closedDate) {
        console.log('🔍 isCompetitionOpen: Competition is CLOSED (disabled date passed)');
        return false;
      }
    }
    
    const availableDay = comp.poolAvailableDay || comp.poolaAvailableDay;
    console.log('🔍 isCompetitionOpen:', {
      competitionId: comp.id,
      poolAvailableDay: comp.poolAvailableDay,
      poolaAvailableDay: comp.poolaAvailableDay,
      poolDisabledDate: comp.poolDisabledDate,
      poolDisbaledDate: comp.poolDisbaledDate,
      availableDay,
      hasAvailableDay: !!availableDay,
    });
    
    if (!availableDay) {
      console.log('🔍 isCompetitionOpen: No availableDay found - BUTTON HIDDEN');
      return false;
    }
    
    const startDate = new Date(availableDay);
    startDate.setHours(0, 0, 0, 0);
    
    // Se puede crear grupos desde el día de inicio (poolAvailableDay) en adelante
    // Mientras la competencia esté en curso (no cerrada)
    const isOpen = today >= startDate;
    
    console.log('🔍 isCompetitionOpen:', {
      today: today.toISOString().split('T')[0],
      startDate: startDate.toISOString().split('T')[0],
      isOpen,
      buttonVisible: isOpen,
    });
    
    if (isOpen) {
      console.log('✅ BUTTON VISIBLE - Competition is OPEN (in progress)!');
    } else {
      console.log('❌ BUTTON HIDDEN - Competition has not started yet');
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
    inviteEmails: string[],
    totalBetAmount: number
  ) => {
    if (!competition) return;
    
    // Validate group name is provided (required by backend)
    if (!groupName || groupName.trim() === '') {
      Alert.alert(
        t('groups.nameRequired'),
        t('groups.nameRequiredMessage'),
        [{ text: t('common.close') }]
      );
      return;
    }
    
    try {
      console.log('🚀 Starting group creation process');
      console.log('📊 Competition:', { id, category, competitionName: competition?.name });
      console.log('📝 Group name:', groupName);
      console.log('👥 Existing users to add:', existingUserIds.length, existingUserIds);
      console.log('📧 Emails to invite:', inviteEmails.length, inviteEmails);
      console.log('📅 Competition dates:', {
        poolaAvailableDay: competition?.poolaAvailableDay,
        startDate: competition?.startDate,
        endDate: competition?.endDate,
      });
      
      // PASO 2: Create group with all users and emails in one request
      console.log('📤 Step 2: Creating group with participants...');
      // Validar monto mínimo total fijo de $50 (se divide entre todos los participantes)
      const MINIMUM_TOTAL_BET_AMOUNT = 50;
      
      if (totalBetAmount < MINIMUM_TOTAL_BET_AMOUNT) {
        Alert.alert(
          t('createGroupModal.minimumAmountError'),
          t('createGroupModal.minimumAmountMessage', {
            minimum: MINIMUM_TOTAL_BET_AMOUNT
          })
        );
        return;
      }
      
      const requestBody = {
        competitionId: id as string,
        category: category as 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues',
        name: groupName.trim(),
        totalBetAmount: totalBetAmount,
        userIds: existingUserIds.length > 0 ? existingUserIds : undefined,
        invitedEmails: inviteEmails.length > 0 ? inviteEmails : undefined,
      };
      console.log('📦 Request body:', requestBody);
      
      const response = await createGroup(requestBody);
      
      const groupId = response.group.groupId;
      console.log('✅ Step 2 Complete: Group created successfully');
      console.log('📦 Group ID:', groupId);
      console.log('📦 Group response:', {
        groupId: response.group.groupId,
        competitionName: response.group.competitionName,
        invitedEmails: response.invitedEmails,
        addedUserIds: response.addedUserIds,
      });
      
      // Close modal
      setShowCreateModal(false);
      
      // Recargar lista de grupos para incluir el nuevo grupo
      await loadUserGroups();
      
      // Show success message
      let message = t('groups.groupCreatedSuccess', { name: response.group.competitionName || groupName }) + '\n\n';
      
      if (response.addedUserIds && response.addedUserIds > 0) {
        message += t('groups.usersAdded', { count: response.addedUserIds }) + '\n';
      }
      
      if (response.invitedEmails && response.invitedEmails > 0) {
        message += t('groups.invitationsSent', { count: response.invitedEmails }) + '\n\n';
        message += t('groups.emailInstructions');
      }
      
      Alert.alert(
        t('groups.groupCreated'),
        message,
        [
            {
              text: t('groups.viewGroups'),
              onPress: () => {
                // Navegar a la vista de grupos de la competencia
                router.push({
                  pathname: '/competition-groups',
                  params: { 
                    competitionId: id,
                    competitionName: competition.name,
                    category: category as string,
                  },
                });
              },
            },
          {
            text: t('common.close'),
            style: 'cancel',
          },
        ]
      );
    } catch (err: any) {
      console.error('❌ Error creating group:', err);
      console.error('❌ Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      });
      
      // Handle 409 Conflict - Group already exists
      // Backend validates: creatorUserId + competitionId already exists in database
      if (err.response?.status === 409) {
        const conflictData = err.response.data;
        console.log('⚠️ Group already exists:', {
          existingGroupId: conflictData.existingGroupId,
          existingGroupName: conflictData.existingGroupName,
          message: conflictData.message,
          fullGroup: conflictData.existingGroup,
        });
        
        Alert.alert(
          t('groups.groupAlreadyExists'),
          `${conflictData.message || t('groups.groupAlreadyExistsMessage')}\n\n` +
          `${t('groups.existingGroup')}: ${conflictData.existingGroupName || t('groups.noName')}\n` +
          `${t('groups.competition')}: ${competition?.shortName || competition?.name || 'N/A'}`,
          [
            {
              text: t('groups.viewExistingGroup'),
              onPress: () => {
                router.push({
                  pathname: '/group-details',
                  params: { id: conflictData.existingGroupId },
                });
              },
            },
            {
              text: t('common.close'),
              style: 'cancel',
            },
          ]
        );
        return;
      }
      
      // Handle other errors
      let errorMessage = t('groups.createGroupError');
      
      if (err.response?.status === 400) {
        const backendErrorMessage = err.response.data?.error || '';
        
        // Interceptar error del backend con lógica antigua ($50 por usuario)
        if (backendErrorMessage.includes('totalBetAmount must be at least') || 
            backendErrorMessage.includes('monto mínimo por usuario') ||
            backendErrorMessage.includes('usuarios estimados')) {
          // El backend todavía está usando la lógica antigua, mostrar mensaje claro
          errorMessage = t('groups.backendValidationError') + '\n\n' +
                        t('groups.backendValidationMessage') + '\n\n' +
                        t('groups.correctMinimumInfo');
        } else {
          errorMessage = backendErrorMessage || t('groups.invalidFields');
        }
      } else if (err.response?.status === 404) {
        errorMessage = t('competitions.notFound');
      } else if (err.response?.status === 500) {
        const backendError = err.response.data?.error || '';
        
        // Errores específicos del backend
        if (backendError.includes('/ by zero') || backendError.includes('division by zero')) {
          errorMessage = t('groups.divisionByZeroError') + '\n\n' + 
                        t('groups.divisionByZeroMessage') + '\n\n' +
                        `Competencia: ${competition?.name || id}\n` +
                        `Fecha de inicio (poolaAvailableDay): ${competition?.poolaAvailableDay || 'No disponible'}\n` +
                        `Usuarios: ${existingUserIds.length}\n` +
                        `Monto enviado: $1.00`;
        } else {
          errorMessage = backendError || t('groups.serverError');
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      Alert.alert(t('common.error'), errorMessage, [{ text: t('common.close') }]);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AnimatedBackgroundCorner />
        <ProfileBadge />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#E8F5E9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('common.loading')}</Text>
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
        <ProfileBadge />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#E8F5E9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('common.error')}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>
            {error || t('competitions.notFound')}
          </Text>
          <TouchableOpacity onPress={loadCompetitionDetails} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
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
      <ProfileBadge />
      
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
          <Text style={styles.sectionTitle}>{t('competitionDetails.generalInfo')}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="football" size={20} color="#1A4D3A" />
              <Text style={styles.infoLabelText}>{t('competitionDetails.fullName')}</Text>
            </View>
            <Text style={styles.infoValue}>{competition.name}</Text>
          </View>

          {competition.type && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="trophy" size={20} color="#1A4D3A" />
                <Text style={styles.infoLabelText}>{t('competitionDetails.type')}</Text>
              </View>
              <Text style={styles.infoValue}>
                {competition.type === 'national-team' ? t('competitionDetails.nationalTeam') : t('competitionDetails.clubs')}
              </Text>
            </View>
          )}

          {competition.region && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="location" size={20} color="#1A4D3A" />
                <Text style={styles.infoLabelText}>{t('competitionDetails.region')}</Text>
              </View>
              <Text style={styles.infoValue}>{competition.region}</Text>
            </View>
          )}

          {competition.country && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="flag" size={20} color="#1A4D3A" />
                <Text style={styles.infoLabelText}>{t('competitionDetails.country')}</Text>
              </View>
              <Text style={styles.infoValue}>{competition.country}</Text>
            </View>
          )}

          {competition.frequency && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="calendar" size={20} color="#1A4D3A" />
                <Text style={styles.infoLabelText}>{t('competitionDetails.frequency')}</Text>
              </View>
              <Text style={styles.infoValue}>{competition.frequency}</Text>
            </View>
          )}
        </View>

        {/* Botón para ver grupos existentes (vista dedicada) */}
        {/* SIEMPRE visible si hay grupos, incluso cuando la competencia está cerrada */}
        <View style={styles.userGroupsSection}>
          <Text style={styles.sectionTitle}>{t('competitionDetails.existingGroups')}</Text>
          {isLoadingUserGroups ? (
            <View style={styles.userGroupsLoadingRow}>
              <ActivityIndicator size="small" color="#1A4D3A" />
              <Text style={styles.userGroupsLoadingText}>{t('groups.loading')}</Text>
            </View>
          ) : userGroups.length === 0 ? (
            <Text style={styles.userGroupsEmptyText}>
              {t('competitionDetails.noGroupsForCompetition')}
            </Text>
          ) : (
            <TouchableOpacity
              style={styles.userGroupItem}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/competition-groups',
                  params: { 
                    competitionId: id,
                    competitionName: competition.name,
                    category: category as string,
                  },
                })
              }
            >
              <Ionicons name="list" size={20} color="#1A4D3A" />
              <Text style={styles.userGroupName} numberOfLines={1}>
                {t('competitionDetails.viewGroupsAndTables')}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#1A4D3A" />
            </TouchableOpacity>
          )}
        </View>

        {/* Botón Crear Grupo - Solo visible si la competencia está EN CURSO (no cerrada) */}
        {/* Cuando está cerrada, este botón NO se muestra, pero se pueden ver grupos existentes */}
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
              <Text style={styles.createGroupText}>{t('groups.createGroup')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          /* Próximamente - Solo se muestra si NO está abierto */
          <View style={styles.comingSoonCard}>
            <Ionicons name="construct" size={40} color="#1A4D3A" />
            <Text style={styles.comingSoonTitle}>{t('competitionDetails.comingSoon')}</Text>
            <Text style={styles.comingSoonText}>
              {t('competitionDetails.comingSoonFeatures')}
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
  userGroupsSection: {
    backgroundColor: 'rgba(232, 245, 233, 0.35)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3.84,
    elevation: 10,
  },
  userGroupsLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userGroupsLoadingText: {
    fontSize: 14,
    color: '#1A4D3A',
  },
  userGroupsEmptyText: {
    fontSize: 14,
    color: '#1A4D3A',
    opacity: 0.8,
  },
  userGroupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
  },
  userGroupName: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A4D3A',
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
