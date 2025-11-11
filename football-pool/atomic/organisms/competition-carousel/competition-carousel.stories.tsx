import React from 'react';
import { View } from 'react-native';
import CompetitionCarousel from './competition-carousel';
import competitionsData from '@/context/mocks/competitions-data.json';

export default {
  title: 'Organisms/CompetitionCarousel',
  component: CompetitionCarousel,
};

export const FifaNationalTeamCups = () => (
  <View style={{ backgroundColor: '#F5F5F5', flex: 1 }}>
    <CompetitionCarousel
      title="🏆 Copas FIFA Selecciones"
      data={competitionsData.fifaNationalTeamCups}
      onPressCard={(id) => console.log('Selected:', id)}
    />
  </View>
);

export const FifaOfficialClubCups = () => (
  <View style={{ backgroundColor: '#F5F5F5', flex: 1 }}>
    <CompetitionCarousel
      title="⭐ Copas FIFA Clubes"
      data={competitionsData.fifaOfficialClubCups}
      onPressCard={(id) => console.log('Selected:', id)}
    />
  </View>
);

export const InternationalClubLeagues = () => (
  <View style={{ backgroundColor: '#F5F5F5', flex: 1 }}>
    <CompetitionCarousel
      title="🌍 Ligas Internacionales"
      data={competitionsData.internationalClubLeagues}
      onPressCard={(id) => console.log('Selected:', id)}
    />
  </View>
);

export const NationalClubLeagues = () => (
  <View style={{ backgroundColor: '#F5F5F5', flex: 1 }}>
    <CompetitionCarousel
      title="🏟️ Ligas Nacionales"
      data={competitionsData.nationalClubLeagues}
      onPressCard={(id) => console.log('Selected:', id)}
    />
  </View>
);

export const AllCarousels = () => (
  <View style={{ backgroundColor: '#F5F5F5', flex: 1 }}>
    <CompetitionCarousel
      title="🏆 Copas FIFA Selecciones"
      data={competitionsData.fifaNationalTeamCups}
      onPressCard={(id) => console.log('Selected:', id)}
    />
    <CompetitionCarousel
      title="⭐ Copas FIFA Clubes"
      data={competitionsData.fifaOfficialClubCups}
      onPressCard={(id) => console.log('Selected:', id)}
    />
    <CompetitionCarousel
      title="🌍 Ligas Internacionales"
      data={competitionsData.internationalClubLeagues}
      onPressCard={(id) => console.log('Selected:', id)}
    />
  </View>
);

