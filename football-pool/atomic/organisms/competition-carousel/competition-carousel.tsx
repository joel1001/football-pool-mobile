import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompetitionCarouselProps } from './competition-carousel.types';
import { styles } from './competition-carousel.styles';
import CompetitionCard from '../../molecules/competition-card/competition-card';

const CompetitionCarousel: React.FC<CompetitionCarouselProps> = ({
  title,
  data,
  onPressCard,
  onPressTitle,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={styles.header}
        onPress={onPressTitle}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>{title}</Text>
        <Ionicons name="chevron-forward" size={24} color="#11181C" />
      </TouchableOpacity>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollContainer}
      >
        {data.map((item) => (
          <CompetitionCard
            key={item.id}
            id={item.id}
            name={item.name}
            shortName={item.shortName}
            region={item.region}
            country={item.country}
            icon={item.icon}
            color={item.color}
            onPress={onPressCard}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default CompetitionCarousel;

