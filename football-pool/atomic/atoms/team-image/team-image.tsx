import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const [imageError, setImageError] = useState(false);
  const styles = getStyleForType(imageStyle);
  
  // Siempre renderizar el contenedor circular para mantener el tamaño consistente
  const renderContainer = (content: React.ReactNode) => (
    <View style={styles.container}>
      {content}
    </View>
  );

  if (!category || !teamId) {
    // Fallback a emoji si no hay categoría o teamId, pero dentro del contenedor circular
    return renderContainer(
      fallbackFlag ? (
        <Text style={styles.flag}>{fallbackFlag}</Text>
      ) : (
        <Ionicons name="football-outline" size={styles.iconSize} color="#9CA3AF" />
      )
    );
  }

  const imageUrl = getTeamImageUrlById(teamId, teamsMap, category);

  if (!imageUrl) {
    // Si no hay URL, mostrar fallback dentro del contenedor
    return renderContainer(
      fallbackFlag ? (
        <Text style={styles.flag}>{fallbackFlag}</Text>
      ) : (
        <Ionicons name="football-outline" size={styles.iconSize} color="#9CA3AF" />
      )
    );
  }

  // Si hubo error o no hay imagen válida, mostrar fallback
  if (imageError) {
    return renderContainer(
      fallbackFlag ? (
        <Text style={styles.flag}>{fallbackFlag}</Text>
      ) : (
        <Ionicons name="football-outline" size={styles.iconSize} color="#9CA3AF" />
      )
    );
  }

  // Intentar cargar la imagen
  return renderContainer(
    <Image
      source={{ uri: imageUrl }}
      style={styles.image}
      resizeMode="contain"
      onError={() => {
        setImageError(true);
        console.warn('Error loading team image, using fallback');
      }}
      onLoadStart={() => {
        setImageError(false);
      }}
    />
  );
};

const getStyleForType = (type: 'table' | 'match' | 'modal') => {
  switch (type) {
    case 'table':
      return {
        container: {
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 6,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        } as ViewStyle,
        image: {
          width: 20,
          height: 20,
        } as ImageStyle,
        flag: {
          fontSize: 16,
        } as TextStyle,
        iconSize: 14,
      };
    case 'match':
      return {
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
        } as ViewStyle,
        image: {
          width: 36,
          height: 36,
        } as ImageStyle,
        flag: {
          fontSize: 24,
        } as TextStyle,
        iconSize: 22,
      };
    case 'modal':
      return {
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
        } as ViewStyle,
        image: {
          width: 44,
          height: 44,
        } as ImageStyle,
        flag: {
          fontSize: 32,
        } as TextStyle,
        iconSize: 26,
      };
    default:
      return {
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
        } as ViewStyle,
        image: {
          width: 28,
          height: 28,
        } as ImageStyle,
        flag: {
          fontSize: 20,
        } as TextStyle,
        iconSize: 18,
      };
  }
};

