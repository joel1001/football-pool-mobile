import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { getUserGroups, getGroupMatches, patchGroup, inviteUser, deleteGroup } from '@/services/groups';
import { Group, Match } from '@/services/groups/group-types';
import { saveUserPrediction, getUserPredictions, getUserPrediction } from '@/services/auth/auth-service';
import { UserPrediction } from '@/services/auth/auth-types';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedBackgroundPenalty, ProfileBadge } from '@/atomic';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '@/context/app-context';
import { getUserIdFromToken } from '@/services/services-config';
import { getCompetitionTeams } from '@/services/competitions';
import { Team } from '@/services/competitions/competition-types';
import { TeamImage } from '@/atomic/atoms/team-image';

export default function CompetitionGroupsScreen() {
  const { t } = useTranslation();
  const { localData } = useAppContext();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { competitionId, competitionName, category: categoryParam } = params;
  
  // Determinar categoría: primero de params, si no está, intentar obtenerla del primer grupo
  const category = (categoryParam as 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues') || undefined;
  
  // Obtener userId: primero de localData, si no está disponible, extraerlo del token
  const currentUserId = localData.userId || getUserIdFromToken(localData.token || null);
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [expandedMatchGroups, setExpandedMatchGroups] = useState<Set<string>>(new Set());
  const [expandedTournamentGroups, setExpandedTournamentGroups] = useState<Set<string>>(new Set()); // Para grupos del torneo (A, B, C, etc.)
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<{ groupId: string; match: Match } | null>(null);
  const [predictionModalVisible, setPredictionModalVisible] = useState(false);
  const [team1Score, setTeam1Score] = useState('');
  const [team2Score, setTeam2Score] = useState('');
  const [savingPrediction, setSavingPrediction] = useState(false);
  const [userPredictions, setUserPredictions] = useState<Record<string, UserPrediction>>({});
  
  // Estados para edición de monto de apuesta
  const [editingBetAmount, setEditingBetAmount] = useState<Record<string, boolean>>({});
  const [betAmountInputs, setBetAmountInputs] = useState<Record<string, string>>({});
  const [savingBetAmount, setSavingBetAmount] = useState<Record<string, boolean>>({});
  
  // Estados para invitar usuarios
  const [inviteEmailInputs, setInviteEmailInputs] = useState<Record<string, string>>({});
  const [invitingUsers, setInvitingUsers] = useState<Record<string, boolean>>({});
  
  // Estado para cancelar grupo
  const [deletingGroups, setDeletingGroups] = useState<Record<string, boolean>>({});
  
  // Estados para equipos e imágenes
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsMap, setTeamsMap] = useState<Map<string, Team>>(new Map());
  const [loadingTeams, setLoadingTeams] = useState(false);

  useEffect(() => {
    loadGroups();
    // Asegurar que todos los grupos estén colapsados al cargar
    setExpandedGroupId(null);
    setExpandedMatchGroups(new Set());
    setExpandedTournamentGroups(new Set());
  }, [competitionId]);

  // Cargar equipos cuando tenemos category y competitionId
  useEffect(() => {
    if (category && competitionId) {
      loadTeams();
    }
  }, [category, competitionId]);

  // Cargar matches una sola vez cuando se cargan los grupos
  useEffect(() => {
    if (groups.length > 0 && allMatches.length === 0) {
      // Cargar matches usando el primer grupo (los matches son los mismos para todos)
      loadAllMatches(groups[0].groupId);
    }
    // Asegurar que todos los grupos estén colapsados cuando se cargan
    setExpandedGroupId(null);
    setExpandedMatchGroups(new Set());
    setExpandedTournamentGroups(new Set());
  }, [groups]);

  const loadTeams = async () => {
    if (!category || !competitionId) return;
    
    try {
      setLoadingTeams(true);
      const teamsData = await getCompetitionTeams(
        category as 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues',
        competitionId as string
      );
      
      setTeams(teamsData);
      
      // Crear mapa de equipos (teamId -> Team) para búsqueda rápida
      const map = new Map<string, Team>();
      teamsData.forEach(team => {
        map.set(team.id, team);
      });
      setTeamsMap(map);
      
      console.log('⚽ Teams Loaded:', {
        competitionId,
        category,
        count: teamsData.length,
      });
    } catch (err: any) {
      console.error('Error loading teams:', err);
      // No mostrar error al usuario, solo log
    } finally {
      setLoadingTeams(false);
    }
  };

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getUserGroups();
      console.log('📊 User Groups Loaded:', {
        totalGroups: response.count,
        competitionId,
      });
      
      // Filtrar grupos solo de esta competencia
      const filteredGroups = response.groups.filter(
        (group) => group.competitionId === competitionId
      );
      
      console.log('📊 Filtered Groups for Competition:', {
        competitionId,
        count: filteredGroups.length,
      });
      
      // Log para debug: verificar userId del usuario actual vs creatorUserId de cada grupo
      const currentUserIdForCheck = localData.userId || getUserIdFromToken(localData.token || null);
      console.log('🔍 Creator Check Debug:', {
        localDataUserId: localData.userId,
        tokenUserId: getUserIdFromToken(localData.token || null),
        currentUserIdForCheck,
        localDataUserIdType: typeof localData.userId,
        groups: filteredGroups.map(g => ({
          groupId: g.groupId,
          creatorUserId: g.creatorUserId,
          creatorUserIdType: typeof g.creatorUserId,
          isCreatorWithLocalData: g.creatorUserId === localData.userId,
          isCreatorWithCurrentUserId: g.creatorUserId === currentUserIdForCheck,
        })),
      });
      
      setGroups(filteredGroups);
    } catch (err: any) {
      console.error('❌ Error loading groups:', {
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
        if (backendError.includes('converting from type') || backendError.includes('converter')) {
          setError(
            t('groups.backendError') + '\n\n' +
            t('groups.backendTypeConversionError') + '\n\n' +
            t('groups.backendErrorInstructions')
          );
        } else {
          setError(err.response?.data?.error || t('groups.loadError'));
        }
      } else {
        setError(err.response?.data?.error || t('groups.loadError'));
      }
      
      // Mantener grupos vacíos en lugar de fallar completamente
      // Esto permite que la app continúe funcionando aunque no se puedan cargar los grupos
      setGroups([]);
      
      // Log adicional para debugging
      console.warn('⚠️ Groups set to empty array due to error. App will continue to function.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllMatches = async (groupId: string) => {
    if (allMatches.length > 0) {
      return; // Ya están cargados
    }

    try {
      setLoadingMatches(true);
      
      const response = await getGroupMatches(groupId);
      console.log('⚽ Matches Loaded from API:', {
        groupId,
        count: response.count,
      });
      
      // Debug: Verificar si matchDay está llegando
      if (response.matches && response.matches.length > 0) {
        console.log('📅 Sample Match Data:', {
          matchId: response.matches[0].matchId,
          matchDay: response.matches[0].matchDay,
          matchDate: response.matches[0].matchDate,
          matchday: response.matches[0].matchday,
          fullMatch: response.matches[0],
        });
      }
      
      setAllMatches(response.matches);
      
      // Cargar predicciones del usuario para estos matches
      // Usar el primer grupo para cargar predicciones (son las mismas para todos)
      loadUserPredictions(groupId, response.matches);
    } catch (err: any) {
      console.error('❌ Error loading matches:', {
        groupId,
        status: err.response?.status,
        error: err.response?.data?.error,
        message: err.response?.data?.message,
        url: err.config?.url,
      });
      
      // Si es error 401, el token puede haber expirado
      if (err.response?.status === 401) {
        Alert.alert(
          t('common.sessionExpired'),
          t('common.sessionExpiredMessage'),
          [
            {
              text: 'OK',
              onPress: () => {
                // Opcional: redirigir al login
                // router.replace('/(tabs)');
              },
            },
          ]
        );
      }
      
      // Re-lanzar el error para que se propague
      throw err;
    } finally {
      setLoadingMatches(false);
    }
  };

  const loadUserPredictions = async (groupId: string, matches: Match[]) => {
    if (!currentUserId) {
      console.log('⚠️ No userId available, skipping predictions load');
      return;
    }

    try {
      // Obtener todas las predicciones del usuario para este grupo desde auth_service
      const response = await getUserPredictions(currentUserId, groupId);
      
      // Crear un mapa de predicciones por matchId para acceso rápido
      const predictionsMap: Record<string, UserPrediction> = {};
      
      if (response.predictions && response.predictions.length > 0) {
        response.predictions.forEach((prediction) => {
          // Usar matchId como clave para acceso rápido
          predictionsMap[prediction.matchId] = prediction;
        });
      }
      
      setUserPredictions(prev => ({ ...prev, ...predictionsMap }));
      console.log('✅ User predictions loaded:', {
        groupId,
        count: response.count,
        predictionsLoaded: Object.keys(predictionsMap).length,
      });
    } catch (err: any) {
      console.log('⚠️ Error loading user predictions:', {
        status: err.response?.status,
        error: err.response?.data?.error,
        message: err.message,
      });
      // No mostrar error al usuario, simplemente no cargar predicciones
    }
  };

  /**
   * Función para verificar si la predicción está deshabilitada (1 día antes del matchDay)
   * 
   * Formato esperado de matchDay en la base de datos (MongoDB):
   * - ISO 8601 con timezone: "2025-11-25T15:00:00.000+00:00"
   * - ISO 8601 con UTC: "2025-11-20T15:00:00Z"
   * - ISO 8601 solo fecha: "2025-11-20" (se interpreta como medianoche UTC)
   * 
   * La predicción se deshabilita si quedan 1 día o menos antes del matchDay
   */
  const isPredictionDisabled = (match: Match): boolean => {
    // matchday puede ser number, date (string ISO), o objeto MongoDB Date {"$date": "..."}
    // Intentar obtener la fecha del partido (prioridad: matchDay > matchDate > matchday si es fecha)
    let matchDateValue: string | null = null;
    
    // Verificar si matchday es un objeto MongoDB Date
    if (match.matchday && typeof match.matchday === 'object' && match.matchday !== null) {
      const mongoDate = match.matchday as any;
      if (mongoDate.$date) {
        matchDateValue = mongoDate.$date;
      }
    }
    // Verificar si matchday es una fecha (string ISO)
    else if (match.matchday && typeof match.matchday === 'string') {
      matchDateValue = match.matchday;
    }
    // Si matchday es un número, no es una fecha
    else {
      // Usar matchDay o matchDate como fallback
      matchDateValue = match.matchDay || match.matchDate;
    }
    
    if (!matchDateValue) {
      return false; // Si no hay fecha, permitir predicción
    }
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Resetear a medianoche para comparación precisa
      
      // Parsear la fecha (acepta ISO 8601: "2025-11-20T15:00:00.000+00:00" o "2025-11-20T15:00:00Z" o "2025-11-20")
      const matchDate = new Date(matchDateValue);
      
      // Validar que la fecha sea válida
      if (isNaN(matchDate.getTime())) {
        console.warn('Invalid matchDay/matchDate/matchday format:', matchDateValue);
        return false; // Si la fecha es inválida, permitir predicción
      }
      
      matchDate.setHours(0, 0, 0, 0);
      
      // Calcular diferencia en días
      const diffTime = matchDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Deshabilitar si es 1 día antes o menos (diffDays <= 1)
      return diffDays <= 1;
    } catch (error) {
      console.error('Error parsing matchDay/matchDate/matchday:', error);
      return false; // Si hay error, permitir predicción
    }
  };

  const handleOpenPredictionModal = async (groupId: string, match: Match) => {
    if (match.isPlayed) {
      Alert.alert(t('predictions.matchPlayed'), t('predictions.cannotPredict'));
      return;
    }

    // Verificar si la predicción está deshabilitada por fecha
    if (isPredictionDisabled(match)) {
      Alert.alert(
        t('predictions.predictionDisabled'),
        t('predictions.predictionDisabledMessage')
      );
      return;
    }

    setSelectedMatch({ groupId, match });
    
    // Cargar predicción existente si hay (desde userPredictions)
    const existingPrediction = userPredictions[match.matchId];
    if (existingPrediction) {
      setTeam1Score(existingPrediction.team1Score.toString());
      setTeam2Score(existingPrediction.team2Score.toString());
    } else {
      // Si no hay predicción guardada, intentar cargarla desde el backend
      if (currentUserId) {
        try {
          const predictionResponse = await getUserPrediction(currentUserId, groupId, match.matchId);
          if (predictionResponse.prediction) {
            setTeam1Score(predictionResponse.prediction.team1Score.toString());
            setTeam2Score(predictionResponse.prediction.team2Score.toString());
            // Actualizar el estado local también
            setUserPredictions(prev => ({
              ...prev,
              [match.matchId]: predictionResponse.prediction!,
            }));
          } else {
            setTeam1Score('');
            setTeam2Score('');
          }
        } catch (err) {
          console.log('No existing prediction found, starting fresh');
          setTeam1Score('');
          setTeam2Score('');
        }
      } else {
        setTeam1Score('');
        setTeam2Score('');
      }
    }
    
    setPredictionModalVisible(true);
  };

  // Agrupar matches por grupo (groupLetter) - solo los que tienen groupLetter
  const matchesByGroup = allMatches
    .filter(m => m.groupLetter) // Solo matches con grupo
    .reduce((acc, match) => {
      const groupLetter = match.groupLetter!;
      if (!acc[groupLetter]) {
        acc[groupLetter] = [];
      }
      acc[groupLetter].push(match);
      return acc;
    }, {} as Record<string, Match[]>);

  // Obtener matches sin grupo (eliminatorias, etc.)
  const matchesWithoutGroup = allMatches.filter(m => !m.groupLetter);

  const handleSavePrediction = async () => {
    if (!selectedMatch || !currentUserId) return;

    const score1 = parseInt(team1Score);
    const score2 = parseInt(team2Score);

    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
      Alert.alert(t('common.error'), t('common.invalidScores'));
      return;
    }

    // Validar que el partido no haya sido jugado
    if (selectedMatch.match.isPlayed) {
      Alert.alert(
        t('predictions.matchPlayed'),
        t('predictions.cannotPredict')
      );
      return;
    }

    try {
      setSavingPrediction(true);
      
      // Guardar predicción en el documento del usuario usando auth_service
      await saveUserPrediction(currentUserId, {
        groupId: selectedMatch.groupId,
        matchId: selectedMatch.match.matchId,
        team1Score: score1,
        team2Score: score2,
      });

      // Actualizar predicción local
      const newPrediction: UserPrediction = {
        groupId: selectedMatch.groupId,
        matchId: selectedMatch.match.matchId,
        team1Score: score1,
        team2Score: score2,
        predictedDate: new Date().toISOString(),
      };
      
      setUserPredictions(prev => ({
        ...prev,
        [selectedMatch.match.matchId]: newPrediction,
      }));

      Alert.alert(t('common.success'), t('predictions.saved'));
      setPredictionModalVisible(false);
      setSelectedMatch(null);
      setTeam1Score('');
      setTeam2Score('');
    } catch (err: any) {
      console.error('Error saving prediction:', err);
      Alert.alert(
        t('common.error'),
        err.response?.data?.error || t('predictions.error')
      );
    } finally {
      setSavingPrediction(false);
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
          <Text style={styles.headerTitle}>{t('common.loading')}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8F5E9" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
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
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadGroups}
          >
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedBackgroundPenalty />
      <ProfileBadge />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#E8F5E9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('groups.title')} - {competitionName || t('groups.competition')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {groups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#A7F3D0" />
              <Text style={styles.emptyText}>
                {t('groups.noGroups')}
              </Text>
            </View>
          ) : (
            <>
              {/* SECCIÓN 1: GRUPOS DE USUARIOS */}
              <View style={styles.sectionContainer}>
                {groups.map((group) => {
                  const isExpanded = expandedGroupId === group.groupId;
                  return (
                    <View key={group.groupId} style={styles.groupAccordion}>
                      {/* Header del acordeón */}
                      <TouchableOpacity
                        style={styles.groupHeader}
                        activeOpacity={0.8}
                        onPress={() =>
                          setExpandedGroupId(isExpanded ? null : group.groupId)
                        }
                      >
                        <View style={styles.groupHeaderLeft}>
                          <Ionicons name="people" size={24} color="#1A4D3A" />
                          <Text style={styles.groupName} numberOfLines={1}>
                            {group.name || group.competitionName}
                          </Text>
                        </View>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color="#1A4D3A"
                        />
                      </TouchableOpacity>

                      {/* Contenido expandido: información del grupo y tabla */}
                      {isExpanded && (
                        <View style={styles.expandedContent}>
                          {/* Información del grupo */}
                          <View style={styles.groupInfoSection}>
                            <Text style={styles.groupInfoTitle}>{t('groups.groupInfo')}</Text>
                            
                            <View style={styles.infoRow}>
                              <Ionicons name="trophy" size={18} color="#1A4D3A" />
                              <Text style={styles.infoLabel}>{t('groups.competition')}:</Text>
                              <Text style={styles.infoValue}>{group.competitionName}</Text>
                            </View>

                            {group.name && (
                              <View style={styles.infoRow}>
                                <Ionicons name="people" size={18} color="#1A4D3A" />
                                <Text style={styles.infoLabel}>{t('groups.groupName')}:</Text>
                                <Text style={styles.infoValue}>{group.name}</Text>
                              </View>
                            )}

                            <View style={styles.participantsSection}>
                              <View style={styles.infoRow}>
                                <Ionicons name="person" size={18} color="#1A4D3A" />
                                <Text style={styles.infoLabel}>{t('groups.participants')} ({group.userIds?.length || 0}):</Text>
                              </View>
                              {(() => {
                                // Crear un mapa de userId -> información del usuario
                                const userMap = new Map<string, { name?: string; email?: string; userId: string }>();
                                
                                // Primero, agregar usuarios del campo `users` si existe
                                if (group.users && group.users.length > 0) {
                                  group.users.forEach(user => {
                                    userMap.set(user.userId, {
                                      name: user.name,
                                      email: user.email,
                                      userId: user.userId,
                                    });
                                  });
                                }
                                
                                // Si tenemos userPayments, usar eso como fallback para obtener emails
                                if (group.userPayments) {
                                  Object.values(group.userPayments).forEach(payment => {
                                    if (!userMap.has(payment.userId)) {
                                      userMap.set(payment.userId, {
                                        email: payment.userEmail,
                                        userId: payment.userId,
                                      });
                                    } else {
                                      // Si ya existe pero no tiene email, agregarlo
                                      const existing = userMap.get(payment.userId)!;
                                      if (!existing.email && payment.userEmail) {
                                        existing.email = payment.userEmail;
                                      }
                                    }
                                  });
                                }
                                
                                // Si tenemos userIds pero no usuarios completos, intentar usar el mapa
                                const participantIds = group.userIds || [];
                                const participants = participantIds.map(userId => {
                                  const userInfo = userMap.get(userId);
                                  
                                  // Determinar el nombre a mostrar: nombre > email (sin @domain) > userId
                                  let displayName = userInfo?.name;
                                  if (!displayName && userInfo?.email) {
                                    // Extraer la parte antes del @ del email como nombre
                                    const emailParts = userInfo.email.split('@');
                                    displayName = emailParts[0] || userInfo.email;
                                  }
                                  if (!displayName) {
                                    // Si no hay nombre ni email, usar el userId pero truncado
                                    displayName = userId.length > 12 ? `${userId.substring(0, 10)}...` : userId;
                                  }
                                  
                                  return {
                                    userId,
                                    name: userInfo?.name,
                                    email: userInfo?.email,
                                    displayName,
                                  };
                                });
                                
                                if (participants.length > 0) {
                                  return (
                                    <View style={styles.participantsList}>
                                      {participants.map((participant) => (
                                        <View key={participant.userId} style={styles.participantItem}>
                                          <Ionicons name="person-circle" size={16} color="#1A4D3A" />
                                          <Text style={styles.participantName}>
                                            {participant.displayName}
                                          </Text>
                                          {participant.userId === group.creatorUserId && (
                                            <View style={styles.creatorBadge}>
                                              <Text style={styles.creatorBadgeText}>
                                                {t('groups.creator')}
                                              </Text>
                                            </View>
                                          )}
                                        </View>
                                      ))}
                                    </View>
                                  );
                                }
                                
                                return (
                                  <Text style={styles.noParticipantsText}>{t('groups.noParticipants')}</Text>
                                );
                              })()}
                            </View>

                            {group.invitedEmails && group.invitedEmails.length > 0 && (
                              <View style={styles.infoRow}>
                                <Ionicons name="mail" size={18} color="#1A4D3A" />
                                <Text style={styles.infoLabel}>{t('groups.invitedEmails')}:</Text>
                                <Text style={styles.infoValue}>
                                  {group.invitedEmails.length}
                                </Text>
                              </View>
                            )}

                            {/* Botón para invitar usuarios (solo creador) */}
                            {group.creatorUserId === currentUserId && (
                              <View style={styles.inviteSection}>
                                <TextInput
                                  style={styles.inviteEmailInput}
                                  placeholder={t('groups.inviteEmailPlaceholder')}
                                  placeholderTextColor="rgba(26, 77, 58, 0.4)"
                                  value={inviteEmailInputs[group.groupId] || ''}
                                  onChangeText={(text) => {
                                    setInviteEmailInputs(prev => ({
                                      ...prev,
                                      [group.groupId]: text.trim(),
                                    }));
                                  }}
                                  keyboardType="email-address"
                                  autoCapitalize="none"
                                  autoCorrect={false}
                                />
                                <TouchableOpacity
                                  onPress={async () => {
                                    const email = inviteEmailInputs[group.groupId]?.trim();
                                    if (!email) {
                                      Alert.alert(
                                        t('common.error'),
                                        t('groups.emailRequired')
                                      );
                                      return;
                                    }
                                    
                                    // Validar formato de email básico
                                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                    if (!emailRegex.test(email)) {
                                      Alert.alert(
                                        t('common.error'),
                                        t('groups.invalidEmailFormat')
                                      );
                                      return;
                                    }

                                    try {
                                      setInvitingUsers(prev => ({ ...prev, [group.groupId]: true }));
                                      await inviteUser(group.groupId, { email });
                                      
                                      // Limpiar input
                                      setInviteEmailInputs(prev => {
                                        const newInputs = { ...prev };
                                        delete newInputs[group.groupId];
                                        return newInputs;
                                      });
                                      
                                      // Recargar grupos para obtener la actualización
                                      await loadGroups();
                                      
                                      Alert.alert(
                                        t('common.success'),
                                        t('groups.invitationSent', { email })
                                      );
                                    } catch (err: any) {
                                      console.error('Error inviting user:', err);
                                      Alert.alert(
                                        t('common.error'),
                                        err.response?.data?.error || t('groups.invitationError')
                                      );
                                    } finally {
                                      setInvitingUsers(prev => ({ ...prev, [group.groupId]: false }));
                                    }
                                  }}
                                  disabled={invitingUsers[group.groupId] || !inviteEmailInputs[group.groupId]?.trim()}
                                  style={[
                                    styles.inviteButton,
                                    (invitingUsers[group.groupId] || !inviteEmailInputs[group.groupId]?.trim()) && styles.inviteButtonDisabled
                                  ]}
                                >
                                  {invitingUsers[group.groupId] ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                  ) : (
                                    <>
                                      <Ionicons name="person-add" size={16} color="#FFFFFF" />
                                      <Text style={styles.inviteButtonText}>{t('groups.inviteUser')}</Text>
                                    </>
                                  )}
                                </TouchableOpacity>
                              </View>
                            )}

                            {group.createdAt && (
                              <View style={styles.infoRow}>
                                <Ionicons name="calendar" size={18} color="#1A4D3A" />
                                <Text style={styles.infoLabel}>{t('groups.created')}:</Text>
                                <Text style={styles.infoValue}>
                                  {new Date(group.createdAt).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Sección de Información de Apuestas */}
                          <View style={styles.bettingSection}>
                            <View style={styles.bettingHeader}>
                              <View style={styles.bettingHeaderLeft}>
                                <Ionicons name="cash" size={20} color="#1A4D3A" />
                                <Text style={styles.bettingTitle}>{t('groups.bettingInfo')}</Text>
                              </View>
                              {(() => {
                                const isCreator = group.creatorUserId === currentUserId;
                                return isCreator;
                              })() && !editingBetAmount[group.groupId] && (
                                <TouchableOpacity
                                  onPress={() => {
                                    setEditingBetAmount(prev => ({ ...prev, [group.groupId]: true }));
                                    setBetAmountInputs(prev => ({
                                      ...prev,
                                      [group.groupId]: group.totalBetAmount?.toString() || '',
                                    }));
                                  }}
                                  style={styles.editBetButton}
                                >
                                  <Ionicons name="create-outline" size={18} color="#10B981" />
                                  <Text style={styles.editBetButtonText}>{t('groups.editBetAmount')}</Text>
                                </TouchableOpacity>
                              )}
                            </View>

                            {editingBetAmount[group.groupId] ? (
                              <View style={styles.bettingEditContainer}>
                                <View style={styles.betAmountInputContainer}>
                                  <Text style={styles.currencySymbol}>$</Text>
                                  <TextInput
                                    style={styles.betAmountInput}
                                    value={betAmountInputs[group.groupId] || ''}
                                    onChangeText={(text) => {
                                      const numericValue = text.replace(/[^0-9.]/g, '');
                                      const parts = numericValue.split('.');
                                      const formattedValue = parts.length > 2 
                                        ? parts[0] + '.' + parts.slice(1).join('')
                                        : numericValue;
                                      setBetAmountInputs(prev => ({
                                        ...prev,
                                        [group.groupId]: formattedValue,
                                      }));
                                    }}
                                    placeholder={t('groups.betAmountPlaceholder')}
                                    placeholderTextColor="rgba(26, 77, 58, 0.4)"
                                    keyboardType="decimal-pad"
                                    maxLength={10}
                                  />
                                </View>
                                <View style={styles.betAmountActions}>
                                  <TouchableOpacity
                                    onPress={async () => {
                                      const newAmount = parseFloat(betAmountInputs[group.groupId] || '0');
                                      if (isNaN(newAmount) || newAmount <= 0) {
                                        Alert.alert(
                                          t('common.error'),
                                          t('groups.invalidBetAmount')
                                        );
                                        return;
                                      }

                                      // Validar monto mínimo total fijo de $50 (se divide entre todos los participantes)
                                      const MINIMUM_TOTAL_BET_AMOUNT = 50;
                                      
                                      if (newAmount < MINIMUM_TOTAL_BET_AMOUNT) {
                                        Alert.alert(
                                          t('createGroupModal.minimumAmountError'),
                                          t('createGroupModal.minimumAmountMessage', {
                                            minimum: MINIMUM_TOTAL_BET_AMOUNT
                                          })
                                        );
                                        return;
                                      }

                                      try {
                                        setSavingBetAmount(prev => ({ ...prev, [group.groupId]: true }));
                                        const response = await patchGroup(group.groupId, { totalBetAmount: newAmount });
                                        
                                        // Actualizar el grupo localmente con la respuesta del backend
                                        setGroups(prev => prev.map(g => 
                                          g.groupId === group.groupId 
                                            ? { 
                                                ...g, 
                                                totalBetAmount: response.group.totalBetAmount,
                                                equitableAmountPerUser: response.group.equitableAmountPerUser
                                              }
                                            : g
                                        ));
                                        
                                        setEditingBetAmount(prev => ({ ...prev, [group.groupId]: false }));
                                        Alert.alert(t('common.success'), t('groups.betAmountUpdated'));
                                      } catch (err: any) {
                                        console.error('Error updating bet amount:', err);
                                        Alert.alert(
                                          t('common.error'),
                                          err.response?.data?.error || t('groups.betAmountUpdateError')
                                        );
                                      } finally {
                                        setSavingBetAmount(prev => ({ ...prev, [group.groupId]: false }));
                                      }
                                    }}
                                    disabled={savingBetAmount[group.groupId]}
                                    style={[styles.saveBetButton, savingBetAmount[group.groupId] && styles.saveBetButtonDisabled]}
                                  >
                                    <Text style={styles.saveBetButtonText}>
                                      {savingBetAmount[group.groupId] ? t('common.saving') : t('common.save')}
                                    </Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => {
                                      setEditingBetAmount(prev => ({ ...prev, [group.groupId]: false }));
                                      setBetAmountInputs(prev => {
                                        const newInputs = { ...prev };
                                        delete newInputs[group.groupId];
                                        return newInputs;
                                      });
                                    }}
                                    style={styles.cancelBetButton}
                                  >
                                    <Text style={styles.cancelBetButtonText}>{t('common.cancel')}</Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            ) : (
                              <>
                                <View style={styles.bettingInfoRow}>
                                  <Text style={styles.bettingLabel}>{t('groups.totalBetAmount')}:</Text>
                                  <Text style={styles.bettingValue}>
                                    ${group.totalBetAmount?.toFixed(2) || '0.00'}
                                  </Text>
                                </View>

                                {(group.equitableAmountPerUser || (group.totalBetAmount && group.totalBetAmount > 0 && group.userIds && group.userIds.length > 0)) && (
                                  <View style={styles.bettingInfoRow}>
                                    <Text style={styles.bettingLabel}>{t('groups.betPerUser')}:</Text>
                                    <Text style={styles.bettingValue}>
                                      ${(group.equitableAmountPerUser || (group.totalBetAmount! / (group.userIds?.length || 1))).toFixed(2)}
                                    </Text>
                                  </View>
                                )}

                                {group.paymentDeadline && (
                                  <>
                                    <View style={styles.bettingInfoRow}>
                                      <Text style={styles.bettingLabel}>{t('groups.paymentDeadline')}:</Text>
                                      <Text style={[
                                        styles.bettingValue,
                                        new Date() > new Date(group.paymentDeadline) && styles.bettingValueExpired
                                      ]}>
                                        {new Date(group.paymentDeadline).toLocaleDateString('es-ES', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                        })}
                                      </Text>
                                    </View>

                                    {(() => {
                                      const deadline = new Date(group.paymentDeadline);
                                      const now = new Date();
                                      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                      
                                      if (now > deadline) {
                                        return (
                                          <View style={styles.bettingWarning}>
                                            <Ionicons name="alert-circle" size={16} color="#EF4444" />
                                            <Text style={styles.bettingWarningText}>
                                              {t('groups.deadlinePassed')}
                                            </Text>
                                          </View>
                                        );
                                      } else if (daysLeft <= 7) {
                                        return (
                                          <View style={styles.bettingWarning}>
                                            <Ionicons name="time-outline" size={16} color="#F97316" />
                                            <Text style={styles.bettingWarningText}>
                                              {t('groups.daysLeft', { days: daysLeft })}
                                            </Text>
                                          </View>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </>
                                )}

                                {!group.paymentDeadline && (
                                  <View style={styles.bettingWarning}>
                                    <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                                    <Text style={styles.bettingWarningText}>
                                      {t('groups.noDeadline')}
                                    </Text>
                                  </View>
                                )}
                              </>
                            )}
                            
                            {/* Botón para cancelar grupo (solo creador) */}
                            {group.creatorUserId === currentUserId && (
                              <TouchableOpacity
                                style={styles.cancelGroupButton}
                                onPress={() => {
                                  Alert.alert(
                                    t('groups.cancelGroup'),
                                    t('groups.cancelGroupConfirm'),
                                    [
                                      {
                                        text: t('common.cancel'),
                                        style: 'cancel',
                                      },
                                      {
                                        text: t('groups.cancelGroupConfirmButton'),
                                        style: 'destructive',
                                        onPress: async () => {
                                          try {
                                            setDeletingGroups(prev => ({ ...prev, [group.groupId]: true }));
                                            await deleteGroup(group.groupId);
                                            Alert.alert(
                                              t('groups.groupCancelled'),
                                              t('groups.groupCancelledMessage')
                                            );
                                            // Recargar grupos para actualizar la lista
                                            await loadGroups();
                                          } catch (err: any) {
                                            console.error('Error deleting group:', err);
                                            Alert.alert(
                                              t('common.error'),
                                              err.response?.data?.error || t('groups.cancelGroupError')
                                            );
                                          } finally {
                                            setDeletingGroups(prev => ({ ...prev, [group.groupId]: false }));
                                          }
                                        },
                                      },
                                    ]
                                  );
                                }}
                                disabled={deletingGroups[group.groupId]}
                                activeOpacity={0.8}
                              >
                                <LinearGradient
                                  colors={['#EF4444', '#DC2626']}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={[styles.cancelGroupGradient, deletingGroups[group.groupId] && styles.cancelGroupGradientDisabled]}
                                >
                                  {deletingGroups[group.groupId] ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                  ) : (
                                    <>
                                      <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                                      <Text style={styles.cancelGroupButtonText}>
                                        {t('groups.cancelGroup')}
                                      </Text>
                                    </>
                                  )}
                                </LinearGradient>
                              </TouchableOpacity>
                            )}
                          </View>

                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* SECCIÓN 2: PARTIDOS (separada, agrupada por grupos) */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>{t('matches.title')}</Text>
                {loadingMatches ? (
                  <View style={styles.matchesLoadingContainer}>
                    <ActivityIndicator size="small" color="#1A4D3A" />
                    <Text style={styles.matchesLoadingText}>{t('matches.loading')}</Text>
                  </View>
                ) : allMatches.length > 0 ? (
                  <>
                    {/* Partidos agrupados por grupo */}
                    {Object.entries(matchesByGroup).map(([groupLetter, matches]) => {
                      const isMatchGroupExpanded = expandedMatchGroups.has(groupLetter);
                      
                      // Obtener la tabla de posiciones para este grupo del torneo
                      const firstGroup = groups[0];
                      const groupStage = firstGroup?.tournamentStructure?.stages?.['group-stage'];
                      const tournamentGroup = groupStage?.groups?.find(g => g.groupLetter === groupLetter);
                      
                      return (
                        <View key={groupLetter} style={styles.groupMatchesSection}>
                          <TouchableOpacity
                            style={styles.groupMatchesHeader}
                            onPress={() => {
                              const newSet = new Set(expandedMatchGroups);
                              if (isMatchGroupExpanded) {
                                newSet.delete(groupLetter);
                              } else {
                                newSet.add(groupLetter);
                              }
                              setExpandedMatchGroups(newSet);
                            }}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="list" size={20} color="#1A4D3A" />
                            <Text style={styles.groupMatchesTitle}>{t('matches.group')} {groupLetter}</Text>
                            <Ionicons
                              name={isMatchGroupExpanded ? 'chevron-up' : 'chevron-down'}
                              size={18}
                              color="#1A4D3A"
                            />
                          </TouchableOpacity>
                          {isMatchGroupExpanded && (
                            <>
                              {/* Tabla de posiciones del grupo */}
                              {tournamentGroup?.teams && tournamentGroup.teams.length > 0 && (
                                <View style={styles.tableWrapper}>
                                  <View style={styles.table}>
                                    {/* Encabezados */}
                                    <View style={[styles.tableRow, styles.tableHeaderRow]}>
                                      {/* Columna de posición (vacía en el header) */}
                                      <View style={styles.tableCellPosition}>
                                        <Text style={styles.tableHeaderText}></Text>
                                      </View>
                                      <View style={[styles.tableCell, styles.tableCellTeam]}>
                                        <Text style={styles.tableHeaderText}>{t('groups.teamShort')}</Text>
                                      </View>
                                      <Text style={[styles.tableCell, styles.tableCellStat, styles.tableHeaderText]}>{t('groups.playedShort')}</Text>
                                      <Text style={[styles.tableCell, styles.tableCellStat, styles.tableHeaderText]}>{t('groups.wonShort')}</Text>
                                      <Text style={[styles.tableCell, styles.tableCellStat, styles.tableHeaderText]}>{t('groups.drawnShort')}</Text>
                                      <Text style={[styles.tableCell, styles.tableCellStat, styles.tableHeaderText]}>{t('groups.lostShort')}</Text>
                                      <Text style={[styles.tableCell, styles.tableCellStat, styles.tableHeaderText]}>{t('groups.goalsForShort')}</Text>
                                      <Text style={[styles.tableCell, styles.tableCellStat, styles.tableHeaderText]}>{t('groups.goalsAgainstShort')}</Text>
                                      <Text style={[styles.tableCell, styles.tableCellStat, styles.tableHeaderText]}>{t('groups.goalDifferenceShort')}</Text>
                                      <Text style={[styles.tableCell, styles.tableCellPoints, styles.tableHeaderText]}>{t('groups.pointsShort')}</Text>
                                    </View>

                                    {/* Filas de datos - ordenadas por posición */}
                                    {tournamentGroup.teams
                                      .slice() // Crear copia para no mutar el array original
                                      .sort((a, b) => {
                                        // Ordenar primero por puntos (descendente)
                                        if (b.points !== a.points) {
                                          return b.points - a.points;
                                        }
                                        // Si hay empate en puntos, ordenar por diferencia de goles (descendente)
                                        if (b.goalDifference !== a.goalDifference) {
                                          return b.goalDifference - a.goalDifference;
                                        }
                                        // Si hay empate en diferencia, ordenar por goles a favor (descendente)
                                        if (b.goalsFor !== a.goalsFor) {
                                          return b.goalsFor - a.goalsFor;
                                        }
                                        // Si todo está empatado, usar la posición del backend como último criterio
                                        return (a.position || 999) - (b.position || 999);
                                      })
                                      .map((team, index) => {
                                        // Calcular la posición real basada en el ordenamiento
                                        const actualPosition = index + 1;
                                        const isQualified = actualPosition <= (tournamentGroup.teamsQualify || 2);
                                        const isEvenRow = index % 2 === 0;
                                        return (
                                          <View 
                                            key={team.teamId} 
                                            style={[
                                              styles.tableRow,
                                              isEvenRow && styles.tableRowEven,
                                              isQualified && styles.tableRowQualified,
                                            ]}
                                          >
                                            <View style={styles.tableCellPosition}>
                                              <View style={[
                                                styles.positionBadge,
                                                actualPosition === 1 && styles.positionBadgeGold,
                                                actualPosition === 2 && styles.positionBadgeSilver,
                                                actualPosition === 3 && styles.positionBadgeBronze,
                                              ]}>
                                                <Text style={[
                                                  styles.positionText,
                                                  (actualPosition <= 3) && styles.positionTextHighlight
                                                ]}>
                                                  {actualPosition}
                                                </Text>
                                              </View>
                                            </View>
                                            <View style={[styles.tableCell, styles.tableCellTeam]}>
                                              <TeamImage
                                                teamId={team.teamId}
                                                teamsMap={teamsMap}
                                                category={category as 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues' | undefined}
                                                fallbackFlag={team.teamFlag}
                                                style="table"
                                              />
                                              <Text
                                                style={[
                                                  styles.tableCellTeamText,
                                                  isQualified && styles.tableCellTeamTextQualified,
                                                ]}
                                                numberOfLines={1}
                                              >
                                                {team.teamName}
                                              </Text>
                                            </View>
                                            <Text style={[styles.tableCell, styles.tableCellStat]}>{team.played}</Text>
                                            <Text style={[styles.tableCell, styles.tableCellStat, styles.tableCellWin]}>{team.won}</Text>
                                            <Text style={[styles.tableCell, styles.tableCellStat]}>{team.drawn}</Text>
                                            <Text style={[styles.tableCell, styles.tableCellStat, styles.tableCellLoss]}>{team.lost}</Text>
                                            <Text style={[styles.tableCell, styles.tableCellStat]}>{team.goalsFor}</Text>
                                            <Text style={[styles.tableCell, styles.tableCellStat]}>{team.goalsAgainst}</Text>
                                            <Text style={[
                                              styles.tableCell,
                                              styles.tableCellStat,
                                              team.goalDifference > 0 && styles.tableCellPositive,
                                              team.goalDifference < 0 && styles.tableCellNegative,
                                            ]}>
                                              {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                                            </Text>
                                            <Text style={[
                                              styles.tableCell,
                                              styles.tableCellPoints,
                                              isQualified && styles.tableCellPointsQualified,
                                            ]}>
                                              {team.points}
                                            </Text>
                                          </View>
                                        );
                                      })}
                                  </View>
                                </View>
                              )}
                              
                              {/* Lista de partidos */}
                              <View style={styles.matchesList}>
                          {matches.map((match) => {
                            const userPrediction = userPredictions[match.matchId];
                            // Usar el primer grupo para las predicciones (son las mismas para todos)
                            const firstGroupId = groups[0]?.groupId || '';
                            
                            // Debug: Log para verificar si matchDay existe
                            if (match.matchDay || match.matchDate) {
                              console.log('📅 Match date found:', {
                                matchId: match.matchId,
                                matchDay: match.matchDay,
                                matchDate: match.matchDate,
                              });
                            }
                            
                            return (
                              <View key={match.matchId} style={styles.matchCard}>
                                <View style={styles.matchHeader}>
                                  <Text style={styles.matchNumber}>{t('matches.match')} {match.matchNumber}</Text>
                                  <View style={styles.matchHeaderCenter}>
                                    {(() => {
                                      // matchday puede ser number, date (string ISO), o objeto MongoDB Date {"$date": "..."}
                                      // Intentar obtener la fecha del partido (prioridad: matchDay > matchDate > matchday si es fecha)
                                      let dateValue: string | null = null;
                                      
                                      // Verificar si matchday es un objeto MongoDB Date
                                      if (match.matchday && typeof match.matchday === 'object' && match.matchday !== null) {
                                        const mongoDate = match.matchday as any;
                                        if (mongoDate.$date) {
                                          dateValue = mongoDate.$date;
                                        }
                                      }
                                      // Verificar si matchday es una fecha (string ISO)
                                      else if (match.matchday && typeof match.matchday === 'string') {
                                        dateValue = match.matchday;
                                      }
                                      // Si matchday es un número, no es una fecha
                                      else {
                                        // Usar matchDay o matchDate como fallback
                                        dateValue = match.matchDay || match.matchDate;
                                      }
                                      
                                      if (dateValue) {
                                        try {
                                          const matchDate = new Date(dateValue);
                                          
                                          // Validar que la fecha sea válida
                                          if (!isNaN(matchDate.getTime())) {
                                            const formattedDate = matchDate.toLocaleDateString('es-ES', {
                                              day: 'numeric',
                                              month: 'short',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                            });
                                            
                                            return (
                                              <Text style={styles.matchDateText}>
                                                {formattedDate}
                                              </Text>
                                            );
                                          }
                                        } catch (e) {
                                          console.error('Error formatting match date:', e, dateValue);
                                        }
                                      }
                                      
                                      // Si no hay fecha disponible, mostrar placeholder
                                      return (
                                        <Text style={styles.matchDateTextPlaceholder}>
                                          {t('matches.dateNotAvailable')}
                                        </Text>
                                      );
                                    })()}
                                  </View>
                                  {/* Mostrar jornada solo si matchday es un número */}
                                  {match.matchday && typeof match.matchday === 'number' && (
                                    <Text style={styles.matchDay}>{t('matches.matchday')} {match.matchday}</Text>
                                  )}
                                </View>
                                
                                <View style={styles.matchTeams}>
                                  <View style={styles.matchTeam}>
                                    <View style={styles.matchTeamContent}>
                                      <TeamImage
                                        teamId={match.team1Id}
                                        teamsMap={teamsMap}
                                        category={category as 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues' | undefined}
                                        fallbackFlag={match.team1Flag}
                                        style="match"
                                      />
                                      {/* Mostrar marcador real junto al logo del equipo 1 */}
                                      {match.team1Score !== null && (
                                        <Text style={styles.realScoreNextToLogo}>
                                          {match.team1Score}
                                        </Text>
                                      )}
                                    </View>
                                    <Text style={styles.matchTeamName} numberOfLines={1}>
                                      {match.team1Name}
                                    </Text>
                                  </View>
                                  
                                  <View style={styles.matchScore}>
                                    {/* Mostrar "vs" o separador si no hay marcadores reales */}
                                    {match.team1Score === null || match.team2Score === null ? (
                                      <Text style={styles.matchScoreText}>{t('matches.vs')}</Text>
                                    ) : (
                                      <Text style={styles.matchScoreSeparator}>-</Text>
                                    )}
                                    {/* Mostrar predicción del usuario si existe */}
                                    {userPrediction && (
                                      <Text style={styles.predictionBadge}>
                                        {t('matches.yourPrediction')}: {userPrediction.team1Score} - {userPrediction.team2Score}
                                      </Text>
                                    )}
                                  </View>
                                  
                                  <View style={styles.matchTeam}>
                                    <View style={styles.matchTeamContent}>
                                      <TeamImage
                                        teamId={match.team2Id}
                                        teamsMap={teamsMap}
                                        category={category as 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues' | undefined}
                                        fallbackFlag={match.team2Flag}
                                        style="match"
                                      />
                                      {/* Mostrar marcador real junto al logo del equipo 2 */}
                                      {match.team2Score !== null && (
                                        <Text style={styles.realScoreNextToLogo}>
                                          {match.team2Score}
                                        </Text>
                                      )}
                                    </View>
                                    <Text style={styles.matchTeamName} numberOfLines={1}>
                                      {match.team2Name}
                                    </Text>
                                  </View>
                                </View>

                                {!match.isPlayed && (
                                  <TouchableOpacity
                                    style={styles.detailsButton}
                                    onPress={() => handleOpenPredictionModal(firstGroupId, match)}
                                    activeOpacity={0.8}
                                  >
                                    <LinearGradient
                                      colors={['#10B981', '#059669']}
                                      start={{ x: 0, y: 0 }}
                                      end={{ x: 1, y: 0 }}
                                      style={styles.detailsButtonGradient}
                                    >
                                      <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                                      <Text style={styles.detailsButtonText}>
                                        {userPrediction ? t('matches.editPrediction') : t('common.details')}
                                      </Text>
                                    </LinearGradient>
                                  </TouchableOpacity>
                                )}
                              </View>
                            );
                          })}
                              </View>
                            </>
                          )}
                        </View>
                      );
                    })}

                    {/* Partidos sin grupo (eliminatorias, etc.) */}
                    {matchesWithoutGroup.length > 0 && (() => {
                      const isEliminationsExpanded = expandedMatchGroups.has('eliminations');
                      return (
                        <View style={styles.groupMatchesSection}>
                          <TouchableOpacity
                            style={styles.groupMatchesHeader}
                            onPress={() => {
                              const newSet = new Set(expandedMatchGroups);
                              if (isEliminationsExpanded) {
                                newSet.delete('eliminations');
                              } else {
                                newSet.add('eliminations');
                              }
                              setExpandedMatchGroups(newSet);
                            }}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="trophy" size={20} color="#1A4D3A" />
                            <Text style={styles.groupMatchesTitle}>{t('matches.eliminations')}</Text>
                            <Ionicons
                              name={isEliminationsExpanded ? 'chevron-up' : 'chevron-down'}
                              size={18}
                              color="#1A4D3A"
                            />
                          </TouchableOpacity>
                          {isEliminationsExpanded && (
                            <View style={styles.matchesList}>
                          {matchesWithoutGroup.map((match) => {
                            const userPrediction = userPredictions[match.matchId];
                            const firstGroupId = groups[0]?.groupId || '';
                            return (
                              <View key={match.matchId} style={styles.matchCard}>
                                <View style={styles.matchHeader}>
                                  <Text style={styles.matchNumber}>Partido {match.matchNumber}</Text>
                                  <View style={styles.matchHeaderCenter}>
                                    {(() => {
                                      // matchday puede ser number, date (string ISO), o objeto MongoDB Date {"$date": "..."}
                                      // Intentar obtener la fecha del partido (prioridad: matchDay > matchDate > matchday si es fecha)
                                      let dateValue: string | null = null;
                                      
                                      // Verificar si matchday es un objeto MongoDB Date
                                      if (match.matchday && typeof match.matchday === 'object' && match.matchday !== null) {
                                        const mongoDate = match.matchday as any;
                                        if (mongoDate.$date) {
                                          dateValue = mongoDate.$date;
                                        }
                                      }
                                      // Verificar si matchday es una fecha (string ISO)
                                      else if (match.matchday && typeof match.matchday === 'string') {
                                        dateValue = match.matchday;
                                      }
                                      // Si matchday es un número, no es una fecha
                                      else {
                                        // Usar matchDay o matchDate como fallback
                                        dateValue = match.matchDay || match.matchDate;
                                      }
                                      
                                      if (dateValue) {
                                        try {
                                          const matchDate = new Date(dateValue);
                                          
                                          // Validar que la fecha sea válida
                                          if (!isNaN(matchDate.getTime())) {
                                            const formattedDate = matchDate.toLocaleDateString('es-ES', {
                                              day: 'numeric',
                                              month: 'short',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                            });
                                            
                                            return (
                                              <Text style={styles.matchDateText}>
                                                {formattedDate}
                                              </Text>
                                            );
                                          }
                                        } catch (e) {
                                          console.error('Error formatting match date:', e, dateValue);
                                        }
                                      }
                                      
                                      // Si no hay fecha disponible, mostrar placeholder
                                      return (
                                        <Text style={styles.matchDateTextPlaceholder}>
                                          {t('matches.dateNotAvailable')}
                                        </Text>
                                      );
                                    })()}
                                  </View>
                                  {/* Mostrar jornada solo si matchday es un número, o stageId si existe */}
                                  {match.matchday && typeof match.matchday === 'number' ? (
                                    <Text style={styles.matchDay}>{t('matches.matchday')} {match.matchday}</Text>
                                  ) : match.stageId ? (
                                    <Text style={styles.matchDay}>{match.stageId}</Text>
                                  ) : null}
                                </View>
                                
                                <View style={styles.matchTeams}>
                                  <View style={styles.matchTeam}>
                                    <View style={styles.matchTeamContent}>
                                      <TeamImage
                                        teamId={match.team1Id}
                                        teamsMap={teamsMap}
                                        category={category as 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues' | undefined}
                                        fallbackFlag={match.team1Flag}
                                        style="match"
                                      />
                                      {/* Mostrar marcador real junto al logo del equipo 1 */}
                                      {match.team1Score !== null && (
                                        <Text style={styles.realScoreNextToLogo}>
                                          {match.team1Score}
                                        </Text>
                                      )}
                                    </View>
                                    <Text style={styles.matchTeamName} numberOfLines={1}>
                                      {match.team1Name}
                                    </Text>
                                  </View>
                                  
                                  <View style={styles.matchScore}>
                                    {/* Mostrar "vs" o separador si no hay marcadores reales */}
                                    {match.team1Score === null || match.team2Score === null ? (
                                      <Text style={styles.matchScoreText}>{t('matches.vs')}</Text>
                                    ) : (
                                      <Text style={styles.matchScoreSeparator}>-</Text>
                                    )}
                                    {/* Mostrar predicción del usuario si existe */}
                                    {userPrediction && (
                                      <Text style={styles.predictionBadge}>
                                        {t('matches.yourPrediction')}: {userPrediction.team1Score} - {userPrediction.team2Score}
                                      </Text>
                                    )}
                                  </View>
                                  
                                  <View style={styles.matchTeam}>
                                    <View style={styles.matchTeamContent}>
                                      <TeamImage
                                        teamId={match.team2Id}
                                        teamsMap={teamsMap}
                                        category={category as 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues' | undefined}
                                        fallbackFlag={match.team2Flag}
                                        style="match"
                                      />
                                      {/* Mostrar marcador real junto al logo del equipo 2 */}
                                      {match.team2Score !== null && (
                                        <Text style={styles.realScoreNextToLogo}>
                                          {match.team2Score}
                                        </Text>
                                      )}
                                    </View>
                                    <Text style={styles.matchTeamName} numberOfLines={1}>
                                      {match.team2Name}
                                    </Text>
                                  </View>
                                </View>

                                {!match.isPlayed && (
                                  <TouchableOpacity
                                    style={styles.detailsButton}
                                    onPress={() => handleOpenPredictionModal(firstGroupId, match)}
                                    activeOpacity={0.8}
                                  >
                                    <LinearGradient
                                      colors={['#10B981', '#059669']}
                                      start={{ x: 0, y: 0 }}
                                      end={{ x: 1, y: 0 }}
                                      style={styles.detailsButtonGradient}
                                    >
                                      <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                                      <Text style={styles.detailsButtonText}>
                                        {userPrediction ? t('matches.editPrediction') : t('common.details')}
                                      </Text>
                                    </LinearGradient>
                                  </TouchableOpacity>
                                )}
                              </View>
                            );
                          })}
                            </View>
                          )}
                        </View>
                      );
                    })()}
                  </>
                ) : (
                  <View style={styles.emptyMatchesContainer}>
                    <Ionicons name="football-outline" size={32} color="#A7F3D0" />
                    <Text style={styles.emptyMatchesText}>
                      {t('matches.noMatches')}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal de Predicción */}
      <Modal
        visible={predictionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setPredictionModalVisible(false);
          setSelectedMatch(null);
          setTeam1Score('');
          setTeam2Score('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('predictions.title')}</Text>
              <TouchableOpacity
                onPress={() => {
                  setPredictionModalVisible(false);
                  setSelectedMatch(null);
                  setTeam1Score('');
                  setTeam2Score('');
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#1A4D3A" />
              </TouchableOpacity>
            </View>

            {selectedMatch && (
              <>
                <View style={styles.modalMatchInfo}>
                  <View style={styles.modalTeam}>
                    <TeamImage
                      teamId={selectedMatch.match.team1Id}
                      teamsMap={teamsMap}
                      category={category as 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues' | undefined}
                      fallbackFlag={selectedMatch.match.team1Flag}
                      style="modal"
                    />
                    <Text style={styles.modalTeamName}>{selectedMatch.match.team1Name}</Text>
                  </View>
                  <Text style={styles.modalVs}>{t('matches.vs')}</Text>
                  <View style={styles.modalTeam}>
                    <TeamImage
                      teamId={selectedMatch.match.team2Id}
                      teamsMap={teamsMap}
                      category={category as 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues' | undefined}
                      fallbackFlag={selectedMatch.match.team2Flag}
                      style="modal"
                    />
                    <Text style={styles.modalTeamName}>{selectedMatch.match.team2Name}</Text>
                  </View>
                </View>

                <View style={styles.modalInputsContainer}>
                  <View style={styles.modalInputGroup}>
                    <Text style={styles.modalInputLabel}>{selectedMatch.match.team1Name} ({t('predictions.team1')})</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={team1Score}
                      onChangeText={setTeam1Score}
                      placeholder="0"
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>

                  <Text style={styles.modalInputSeparator}>-</Text>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.modalInputLabel}>{selectedMatch.match.team2Name} ({t('predictions.team2')})</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={team2Score}
                      onChangeText={setTeam2Score}
                      placeholder="0"
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleSavePrediction}
                  disabled={savingPrediction}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalSaveButtonGradient}
                  >
                    {savingPrediction ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.modalSaveButtonText}>{t('predictions.savePrediction')}</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A4D3A',
  },
  header: {
    position: 'relative',
    zIndex: 10,
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
    fontSize: 18,
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
    position: 'relative',
    zIndex: 10,
  },
  content: {
    padding: 16,
    position: 'relative',
    zIndex: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#E8F5E9',
    textAlign: 'center',
    marginTop: 16,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E8F5E9',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  groupAccordion: {
    marginBottom: 16,
    backgroundColor: 'rgba(232, 245, 233, 0.85)',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(232, 245, 233, 0.95)',
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A4D3A',
    flex: 1,
  },
  expandedContent: {
    padding: 16,
  },
  groupInfoSection: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    padding: 16,
  },
  groupInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A4D3A',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A4D3A',
    minWidth: 120,
  },
  infoValue: {
    fontSize: 13,
    color: '#1A4D3A',
    flex: 1,
    fontWeight: '500',
  },
  participantsSection: {
    marginTop: 4,
  },
  participantsList: {
    marginTop: 8,
    gap: 6,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 26,
    flexWrap: 'wrap',
  },
  participantName: {
    fontSize: 13,
    color: '#1A4D3A',
    fontWeight: '500',
    flex: 1,
  },
  creatorBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginLeft: 4,
  },
  creatorBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  noParticipantsText: {
    fontSize: 12,
    color: '#1A4D3A',
    fontStyle: 'italic',
    marginLeft: 26,
    opacity: 0.7,
  },
  tournamentGroupAccordion: {
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tournamentGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  tournamentGroupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  tournamentGroupName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A4D3A',
    flex: 1,
  },
  tournamentGroupTableWrapper: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  tableWrapper: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(26, 77, 58, 0.1)',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(26, 77, 58, 0.2)',
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A4D3A',
    flex: 1,
    letterSpacing: 0.5,
  },
  editBetAmountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  editBetAmountButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyTableContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 16,
  },
  emptyTableText: {
    fontSize: 14,
    color: '#1A4D3A',
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.7,
  },
  table: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(26, 77, 58, 0.1)',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 77, 58, 0.08)',
    alignItems: 'center',
    minHeight: 48,
  },
  tableRowEven: {
    backgroundColor: 'rgba(232, 245, 233, 0.3)',
  },
  tableRowQualified: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  tableHeaderRow: {
    backgroundColor: '#1A4D3A',
    borderBottomWidth: 0,
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 13,
    color: '#1A4D3A',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCellPosition: {
    width: 40,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableCellTeam: {
    flex: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    textAlign: 'left',
    paddingLeft: 12,
  },
  tableCellTeamText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A4D3A',
    flex: 1,
  },
  tableCellTeamTextQualified: {
    fontWeight: '700',
    color: '#059669',
  },
  tableCellStat: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  tableCellWin: {
    color: '#10B981',
    fontWeight: '600',
  },
  tableCellLoss: {
    color: '#EF4444',
    fontWeight: '500',
  },
  tableCellPoints: {
    flex: 1.2,
    fontSize: 14,
    fontWeight: '700',
    color: '#1A4D3A',
  },
  tableCellPointsQualified: {
    color: '#059669',
    fontSize: 15,
  },
  tableCellPositive: {
    color: '#10B981',
    fontWeight: '600',
  },
  tableCellNegative: {
    color: '#EF4444',
    fontWeight: '600',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  positionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(26, 77, 58, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(26, 77, 58, 0.2)',
  },
  positionBadgeGold: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: '#FBBF24',
  },
  positionBadgeSilver: {
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    borderColor: '#9CA3AF',
  },
  positionBadgeBronze: {
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    borderColor: '#D97706',
  },
  positionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A4D3A',
  },
  positionTextHighlight: {
    fontSize: 13,
  },
  teamFlag: {
    fontSize: 20,
    marginRight: 4,
  },
  teamImage: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  matchTeamImage: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  modalTeamImage: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  // Matches styles
  matchesSection: {
    marginTop: 20,
  },
  matchesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A4D3A',
    marginBottom: 12,
  },
  matchesLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  matchesLoadingText: {
    fontSize: 14,
    color: '#1A4D3A',
  },
  matchesList: {
    gap: 12,
  },
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  matchHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  matchNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A4D3A',
  },
  matchGroup: {
    fontSize: 11,
    color: '#1A4D3A',
    opacity: 0.7,
  },
  matchDay: {
    fontSize: 11,
    color: '#1A4D3A',
    opacity: 0.7,
  },
  matchDateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
  },
  matchDateTextPlaceholder: {
    fontSize: 11,
    fontWeight: '400',
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  matchTeam: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  matchTeamContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  matchTeamFlag: {
    fontSize: 24,
  },
  matchTeamName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A4D3A',
    textAlign: 'center',
  },
  matchScore: {
    alignItems: 'center',
    minWidth: 80,
    gap: 4,
  },
  matchScoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A4D3A',
  },
  matchScoreSeparator: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A4D3A',
  },
  realScoreNextToLogo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  realScoreLabel: {
    fontSize: 9,
    color: '#1A4D3A',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  predictionBadge: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  detailsButton: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  detailsButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyMatchesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyMatchesText: {
    fontSize: 14,
    color: '#E8F5E9',
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.8,
  },
  groupMatchesSection: {
    marginBottom: 24,
    backgroundColor: 'rgba(232, 245, 233, 0.75)',
    borderRadius: 12,
    padding: 16,
  },
  groupMatchesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(26, 77, 58, 0.2)',
  },
  groupMatchesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A4D3A',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#E8F5E9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
    zIndex: 1001,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A4D3A',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalMatchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingVertical: 16,
    backgroundColor: 'rgba(26, 77, 58, 0.1)',
    borderRadius: 12,
  },
  modalTeam: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  modalTeamFlag: {
    fontSize: 32,
  },
  modalTeamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A4D3A',
    textAlign: 'center',
  },
  modalVs: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A4D3A',
    marginHorizontal: 16,
  },
  modalInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  modalInputGroup: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A4D3A',
    textAlign: 'center',
  },
  modalInput: {
    width: 80,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1A4D3A',
    fontSize: 24,
    fontWeight: '700',
    color: '#1A4D3A',
    textAlign: 'center',
  },
  modalInputSeparator: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A4D3A',
    marginHorizontal: 16,
  },
  modalSaveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalSaveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  modalSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Betting section styles
  bettingSection: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  bettingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bettingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bettingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A4D3A',
  },
  editBetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
  },
  editBetButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  bettingEditContainer: {
    gap: 12,
  },
  betAmountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A4D3A',
    marginRight: 8,
  },
  betAmountInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A4D3A',
  },
  betAmountActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveBetButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBetButtonDisabled: {
    opacity: 0.6,
  },
  saveBetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelBetButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A4D3A',
  },
  cancelGroupButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cancelGroupGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  cancelGroupGradientDisabled: {
    opacity: 0.6,
  },
  cancelGroupButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bettingInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bettingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A4D3A',
    opacity: 0.8,
  },
  bettingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  bettingValueExpired: {
    color: '#EF4444',
  },
  bettingWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 10,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 8,
  },
  bettingWarningText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F97316',
    flex: 1,
  },
  // Invite section styles
  inviteSection: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  inviteEmailInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1A4D3A',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  inviteButtonDisabled: {
    opacity: 0.6,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

