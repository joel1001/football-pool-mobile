import React from 'react';
import { View, Image, Text, StyleSheet, ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { getTeamImageUrlById } from '@/utils/team-image-helper';
import { Team } from '@/services/competitions/competition-types';

type CompetitionCategory = 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues';

interface TeamImageProps {
  teamId: string | null | undefined;
  teamsMap: Map<string, Team>;
  category: CompetitionCategory | undefined;
  fallbackFlag?: string | null;
  style?: 'table' | 'match' | 'modal';
}

export const TeamImage: React.FC<TeamImageProps> = ({
  teamId,
  teamsMap,
  category,
  fallbackFlag,
  style: imageStyle = 'table',
}) => {
  const styles = getStyleForType(imageStyle);
  
  if (!category || !teamId) {
    // Fallback a emoji si no hay categoría o teamId
    return fallbackFlag ? (
      <Text style={styles.flag}>{fallbackFlag}</Text>
    ) : null;
  }

  const imageUrl = getTeamImageUrlById(teamId, teamsMap, category);

  if (imageUrl) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
          onError={() => {
            console.log('Error loading team image:', imageUrl);
          }}
        />
      </View>
    );
  }

  // Fallback a emoji si no hay imagen disponible
  return fallbackFlag ? (
    <Text style={styles.flag}>{fallbackFlag}</Text>
  ) : null;
};

const getStyleForType = (type: 'table' | 'match' | 'modal') => {
  switch (type) {
    case 'table':
      return StyleSheet.create({
        container: {
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 8,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
        image: {
          width: 28,
          height: 28,
        } as ImageStyle,
        flag: {
          fontSize: 20,
          marginRight: 4,
        } as TextStyle,
      });
    case 'match':
      return StyleSheet.create({
        container: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 4,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.15,
          shadowRadius: 3,
          elevation: 3,
        },
        image: {
          width: 36,
          height: 36,
        } as ImageStyle,
        flag: {
          fontSize: 24,
        } as TextStyle,
      });
    case 'modal':
      return StyleSheet.create({
        container: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 8,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        },
        image: {
          width: 44,
          height: 44,
        } as ImageStyle,
        flag: {
          fontSize: 32,
        } as TextStyle,
      });
    default:
      return StyleSheet.create({
        container: {
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 8,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
        image: {
          width: 28,
          height: 28,
        } as ImageStyle,
        flag: {
          fontSize: 20,
          marginRight: 4,
        } as TextStyle,
      });
  }
};

