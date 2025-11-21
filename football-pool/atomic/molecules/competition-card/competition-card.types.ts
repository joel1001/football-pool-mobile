import { ViewStyle, StyleProp } from 'react-native';

export interface CompetitionCardProps {
  id: string;
  name: string;
  shortName: string;
  region?: string;
  country?: string;
  icon?: string;
  image?: string;
  color?: string;
  poolAvailableDay?: string;
  poolaAvailableDay?: string; // Backend typo support
  poolDisabledDate?: string;
  poolDisbaledDate?: string; // Backend typo support
  hasGroup?: boolean; // Si el usuario ya tiene un grupo para esta competencia
  onPress?: (id: string) => void;
  onPressViewGroups?: (id: string, name: string) => void; // Navegar a ver grupos
  style?: StyleProp<ViewStyle>;
}

