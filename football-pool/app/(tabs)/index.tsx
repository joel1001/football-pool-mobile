import { StyleSheet, ScrollView, View, ActivityIndicator, Text } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { CompetitionCarousel, SearchBar, AnimatedBackground, ProfileBadge } from '@/atomic';
import { getAllCompetitions, searchCompetitions } from '@/services/competitions';
import { CompetitionsResponse } from '@/services/competitions/competition-types';
import { getUserGroups } from '@/services/groups';
import { useAppContext } from '@/context/app-context';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [competitionsData, setCompetitionsData] = useState<CompetitionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userGroupsCompetitionIds, setUserGroupsCompetitionIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const { localData } = useAppContext();

  useEffect(() => {
    loadCompetitions();
    loadUserGroups();
  }, []);

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

  const loadCompetitions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllCompetitions();
      if (!data || typeof data !== 'object') {
        console.error('❌ Invalid response structure:', data);
        setError(t('competitions.error') + ': Invalid response structure');
        return;
      }
      
      const validatedData: CompetitionsResponse = {
        fifaNationalTeamCups: Array.isArray(data.fifaNationalTeamCups) 
          ? data.fifaNationalTeamCups 
          : [],
        fifaOfficialClubCups: Array.isArray(data.fifaOfficialClubCups) 
          ? data.fifaOfficialClubCups 
          : [],
        nationalClubLeagues: Array.isArray(data.nationalClubLeagues) 
          ? data.nationalClubLeagues 
          : [],
      };
      
      setCompetitionsData(validatedData);
    } catch (err: any) {
      console.error('❌ Error loading competitions:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });
      
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || t('competitions.error');
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
      setError(err.response?.data?.error || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryPress = (category: string, title: string) => {
    router.push({
      pathname: '/category-competitions',
      params: { category, title },
    });
  };

  const handleCardPress = (id: string, category: string) => {
    router.push({
      pathname: '/competition-details',
      params: { id, category },
    });
  };

  const handleViewGroups = (competitionId: string, competitionName: string, category: string) => {
    router.push({
      pathname: '/competition-groups',
      params: { 
        competitionId,
        competitionName,
        category,
      },
    });
  };

  if (isLoading && !competitionsData) {
    return (
      <View style={homeStyles.container}>
        <AnimatedBackground />
        <View style={homeStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8F5E9" />
          <Text style={homeStyles.loadingText}>{t('competitions.loading')}</Text>
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
            {t('common.retry')}
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
          <Text style={homeStyles.errorText}>{t('competitions.noCompetitions')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={homeStyles.container}>
      <AnimatedBackground />
      <ProfileBadge />
      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t('home.searchPlaceholder')}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={homeStyles.scrollContent}
      >
        {competitionsData.fifaNationalTeamCups?.length > 0 && (
          <CompetitionCarousel
            title={t('home.fifaNationalTeamCups')}
            data={competitionsData.fifaNationalTeamCups}
            onPressCard={(id) => handleCardPress(id, 'fifaNationalTeamCups')}
            onPressTitle={() => handleCategoryPress('fifaNationalTeamCups', t('home.fifaNationalTeamCups'))}
            onPressViewGroups={handleViewGroups}
            userGroups={userGroupsCompetitionIds}
            category="fifaNationalTeamCups"
          />
        )}

        {competitionsData.fifaOfficialClubCups?.length > 0 && (
          <CompetitionCarousel
            title={t('home.fifaOfficialClubCups')}
            data={competitionsData.fifaOfficialClubCups}
            onPressCard={(id) => handleCardPress(id, 'fifaOfficialClubCups')}
            onPressTitle={() => handleCategoryPress('fifaOfficialClubCups', t('home.fifaOfficialClubCups'))}
            onPressViewGroups={handleViewGroups}
            userGroups={userGroupsCompetitionIds}
            category="fifaOfficialClubCups"
          />
        )}

        {competitionsData.nationalClubLeagues?.length > 0 && (
          <CompetitionCarousel
            title={t('home.nationalClubLeagues')}
            data={competitionsData.nationalClubLeagues}
            onPressCard={(id) => handleCardPress(id, 'nationalClubLeagues')}
            onPressTitle={() => handleCategoryPress('nationalClubLeagues', t('home.nationalClubLeagues'))}
            onPressViewGroups={handleViewGroups}
            userGroups={userGroupsCompetitionIds}
            category="nationalClubLeagues"
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
