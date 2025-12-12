import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { CompetitionCard, ProfileBadge } from '@/atomic';
import { getCompetitionsByCategory } from '@/services/competitions';
import { Competition } from '@/services/competitions/competition-types';
import { getUserGroups } from '@/services/groups';
import { useTranslation } from 'react-i18next';

export default function CategoryCompetitionsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { category, title } = params;
  
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userGroupsCompetitionIds, setUserGroupsCompetitionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCategoryCompetitions();
    loadUserGroups();
  }, [category]);

  const loadUserGroups = async () => {
    try {
      const response = await getUserGroups();
      const competitionIds = new Set(
        response.groups.map((group) => group.competitionId)
      );
      setUserGroupsCompetitionIds(competitionIds);
    } catch (err: any) {
      console.error('Error loading user groups:', err);
    }
  };

  const loadCategoryCompetitions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCompetitionsByCategory(
        category as 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues'
      );
      setCompetitions(data);
    } catch (err: any) {
      console.error('Error loading category competitions:', err);
      setError(err.response?.data?.error || t('competitions.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardPress = (id: string) => {
    router.push({
      pathname: '/competition-details',
      params: { id, category },
    });
  };

  const handleViewGroups = (competitionId: string, competitionName: string) => {
    router.push({
      pathname: '/competition-groups',
      params: { 
        competitionId,
        competitionName,
        category: category as string,
      },
    });
  };

  if (isLoading) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A4D3A" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
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
            <Ionicons name="arrow-back" size={24} color="#11181C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title as string}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadCategoryCompetitions} style={styles.retryButton}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProfileBadge />
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
          {competitions.map((comp) => {
            const hasGroup = userGroupsCompetitionIds.has(comp.id);
            return (
              <CompetitionCard
                key={comp.id}
                id={comp.id}
                name={comp.name}
                shortName={comp.shortName}
                region={comp.region}
                country={comp.country}
                image={comp.image}
                poolAvailableDay={comp.poolAvailableDay}
                poolaAvailableDay={comp.poolaAvailableDay}
                poolDisabledDate={comp.poolDisabledDate}
                poolDisbaledDate={comp.poolDisbaledDate}
                hasGroup={hasGroup}
                onPress={handleCardPress}
                onPressViewGroups={handleViewGroups}
                category={category as string}
                style={styles.card}
              />
            );
          })}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#687076',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#687076',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1A4D3A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
});

