import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompetitionCardProps } from './competition-card.types';
import { styles } from './competition-card.styles';

const CompetitionCard: React.FC<CompetitionCardProps> = ({
  id,
  name,
  shortName,
  region,
  country,
  icon = 'football',
  color = '#3B82F6',
  onPress,
  style,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(id);
    }
  };

  const displaySubtitle = region || country || '';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: color || '#3B82F6' }, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.topSection}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={56} color="#fff" />
        </View>
      </View>
      <View style={styles.bottomSection}>
        <Text style={styles.name} numberOfLines={2}>
          {shortName}
        </Text>
        {displaySubtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {displaySubtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default CompetitionCard;

