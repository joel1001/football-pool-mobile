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
  onPress?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

