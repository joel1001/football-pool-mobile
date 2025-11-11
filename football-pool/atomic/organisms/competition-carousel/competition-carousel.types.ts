import { ViewStyle, StyleProp } from 'react-native';
import { CompetitionCardProps } from '../../molecules/competition-card/competition-card.types';

export interface CompetitionCarouselProps {
  title: string;
  data: CompetitionCardProps[];
  onPressCard?: (id: string) => void;
  onPressTitle?: () => void;
  style?: StyleProp<ViewStyle>;
}

