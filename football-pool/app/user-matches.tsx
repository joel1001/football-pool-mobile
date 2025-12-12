import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TeamImage } from '@/atomic/atoms/team-image';
import { getCompetitionTeams } from '@/services/competitions';
import { Team } from '@/services/competitions/competition-types';
import { AnimatedBackgroundSidePass } from '@/atomic';

interface MatchInfo {
  matchId: string;
  team1: string;
  team2: string;
  team1Score: number;
  team2Score: number;
  realTeam1Score?: number;
  realTeam2Score?: number;
  predictedDate?: string | { $numberLong: string };
}

export default function UserMatchesScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { userId, userName, matchesInfo: matchesInfoParam, competitionId, groupId } = params;
  
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [teamsMap, setTeamsMap] = useState<Map<string, Team>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues' | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, [matchesInfoParam, competitionId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Parse matchesInfo
      if (matchesInfoParam && typeof matchesInfoParam === 'string') {
        const parsedMatches = JSON.parse(matchesInfoParam);
        setMatches(parsedMatches);
      }

      // Determinar categoría basada en competitionId
      let determinedCategory: 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues' | undefined = undefined;
      if (competitionId === 'club-world-cup') {
        determinedCategory = 'fifaOfficialClubCups';
      }
      setCategory(determinedCategory);

      // Cargar equipos si tenemos categoría y competitionId
      if (determinedCategory && competitionId) {
        try {
          const teamsResponse = await getCompetitionTeams(determinedCategory, competitionId as string);
          const teams: Team[] = teamsResponse.teams || [];
          const teamsMapInstance = new Map<string, Team>();
          teams.forEach(team => {
            teamsMapInstance.set(team.teamId, team);
          });
          setTeamsMap(teamsMapInstance);
        } catch (teamsError) {
          console.warn('Error loading teams:', teamsError);
        }
      }
    } catch (err: any) {
      console.error('Error loading user matches:', err);
      setError(err.message || 'Error al cargar las predicciones del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateValue: string | { $numberLong: string } | undefined): string => {
    if (!dateValue) return '';
    
    try {
      let date: Date;
      if (typeof dateValue === 'object' && '$numberLong' in dateValue) {
        date = new Date(parseInt(dateValue.$numberLong));
      } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else {
        return '';
      }

      if (isNaN(date.getTime())) return '';

      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AnimatedBackgroundSidePass />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#E8F5E9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('matches.userPredictions') || 'Predicciones'}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>{t('common.loading') || 'Cargando...'}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <AnimatedBackgroundSidePass />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#E8F5E9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('common.error') || 'Error'}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadData}
          >
            <Text style={styles.retryButtonText}>{t('common.retry') || 'Reintentar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedBackgroundSidePass />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#E8F5E9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {userName || 'Usuario'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {matches.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="football-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>
                {t('matches.noPredictions') || 'No hay predicciones disponibles'}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                  {t('matches.totalPredictions') || 'Total de Predicciones'}
                </Text>
                <Text style={styles.summaryValue}>{matches.length}</Text>
              </View>

              <View style={styles.matchesList}>
                {matches.map((match, index) => {
                  const hasRealScores = match.realTeam1Score !== undefined && match.realTeam2Score !== undefined;
                  
                  return (
                    <View key={match.matchId || index} style={styles.matchCard}>
                      <View style={styles.matchHeader}>
                        <Text style={styles.matchNumber}>
                          {t('matches.match') || 'Partido'} {index + 1}
                        </Text>
                        {match.predictedDate && (
                          <Text style={styles.matchDate}>
                            {formatDate(match.predictedDate)}
                          </Text>
                        )}
                      </View>

                      <View style={styles.matchTeams}>
                        <View style={styles.matchTeam}>
                          <View style={styles.matchTeamContent}>
                            <TeamImage
                              teamId={match.team1.toLowerCase().replace(/\s+/g, '-') + '-cwc'}
                              teamsMap={teamsMap}
                              category={category}
                              fallbackFlag={undefined}
                              style="match"
                            />
                            {hasRealScores && (
                              <Text style={styles.realScoreBadge}>
                                {match.realTeam1Score}
                              </Text>
                            )}
                          </View>
                          <Text style={styles.matchTeamName} numberOfLines={1}>
                            {match.team1}
                          </Text>
                          <Text style={styles.predictionScore}>
                            {match.team1Score}
                          </Text>
                        </View>

                        <View style={styles.matchScore}>
                          <Text style={styles.matchScoreText}>vs</Text>
                          {hasRealScores && (
                            <View style={styles.realScoresContainer}>
                              <Text style={styles.realScoreText}>
                                {match.realTeam1Score} - {match.realTeam2Score}
                              </Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.matchTeam}>
                          <View style={styles.matchTeamContent}>
                            <TeamImage
                              teamId={match.team2.toLowerCase().replace(/\s+/g, '-') + '-cwc'}
                              teamsMap={teamsMap}
                              category={category}
                              fallbackFlag={undefined}
                              style="match"
                            />
                            {hasRealScores && (
                              <Text style={styles.realScoreBadge}>
                                {match.realTeam2Score}
                              </Text>
                            )}
                          </View>
                          <Text style={styles.matchTeamName} numberOfLines={1}>
                            {match.team2}
                          </Text>
                          <Text style={styles.predictionScore}>
                            {match.team2Score}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.matchPrediction}>
                        <Text style={styles.predictionLabel}>
                          {t('matches.yourPrediction') || 'Predicción'}: 
                        </Text>
                        <Text style={styles.predictionValue}>
                          {match.team1Score} - {match.team2Score}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
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
    marginHorizontal: 16,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#E8F5E9',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#10B981',
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
  scrollViewContent: {
    paddingBottom: 32,
  },
  content: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#2D5A47',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#A7F3D0',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  matchesList: {
    gap: 16,
  },
  matchCard: {
    backgroundColor: '#2D5A47',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  matchNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A7F3D0',
  },
  matchDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  matchTeam: {
    flex: 1,
    alignItems: 'center',
  },
  matchTeamContent: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 8,
  },
  realScoreBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  matchTeamName: {
    fontSize: 12,
    color: '#E8F5E9',
    textAlign: 'center',
    marginBottom: 4,
  },
  predictionScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  matchScore: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  matchScoreText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  realScoresContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  realScoreText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  matchPrediction: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.2)',
  },
  predictionLabel: {
    fontSize: 14,
    color: '#A7F3D0',
    marginRight: 8,
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
});
