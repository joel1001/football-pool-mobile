import { ViewStyle, StyleProp } from 'react-native';

export interface CompetitionCardProps {
  id: string;
  name: string;
  shortName: string;
  region?: string;
  country?: string;
  icon?: string;
  color?: string;
  onPress?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

