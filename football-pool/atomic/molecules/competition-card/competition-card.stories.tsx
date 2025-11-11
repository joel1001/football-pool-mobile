import React from 'react';
import { View } from 'react-native';
import CompetitionCard from './competition-card';

export default {
  title: 'Molecules/CompetitionCard',
  component: CompetitionCard,
};

export const Default = () => (
  <View style={{ padding: 20 }}>
    <CompetitionCard
      id="world-cup"
      name="Copa Mundial FIFA"
      shortName="Mundial"
      region="Global"
      emoji="🏆"
      color="#3B82F6"
      onPress={(id) => console.log('Pressed:', id)}
    />
  </View>
);

export const CopaAmerica = () => (
  <View style={{ padding: 20 }}>
    <CompetitionCard
      id="copa-america"
      name="Copa América"
      shortName="Copa América"
      region="CONMEBOL"
      emoji="🏆"
      color="#0033A0"
      onPress={(id) => console.log('Pressed:', id)}
    />
  </View>
);

export const ChampionsLeague = () => (
  <View style={{ padding: 20 }}>
    <CompetitionCard
      id="champions-league"
      name="UEFA Champions League"
      shortName="Champions"
      region="UEFA"
      emoji="⭐"
      color="#00539F"
      onPress={(id) => console.log('Pressed:', id)}
    />
  </View>
);

export const PremierLeague = () => (
  <View style={{ padding: 20 }}>
    <CompetitionCard
      id="premier-league"
      name="Premier League"
      shortName="Premier League"
      country="Inglaterra"
      emoji="⚽"
      color="#37003C"
      onPress={(id) => console.log('Pressed:', id)}
    />
  </View>
);

export const Multiple = () => (
  <View style={{ padding: 20, flexDirection: 'row', gap: 16 }}>
    <CompetitionCard
      id="world-cup"
      name="Copa Mundial FIFA"
      shortName="Mundial"
      region="Global"
      emoji="🏆"
      color="#3B82F6"
    />
    <CompetitionCard
      id="champions"
      name="UEFA Champions League"
      shortName="Champions"
      region="UEFA"
      emoji="⭐"
      color="#00539F"
    />
  </View>
);

