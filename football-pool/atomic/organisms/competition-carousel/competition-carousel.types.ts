import { ViewStyle, StyleProp } from 'react-native';
import { CompetitionCardProps } from '../../molecules/competition-card/competition-card.types';

export interface CompetitionCarouselProps {
  title: string;
  data: CompetitionCardProps[];
  onPressCard?: (id: string) => void;
  onPressTitle?: () => void;
  onPressViewGroups?: (id: string, name: string, category: string) => void; // Navegar a ver grupos
  userGroups?: Set<string>; // Set de competitionIds donde el usuario tiene grupos
  category?: string; // Categoría de las competencias en este carousel
  style?: StyleProp<ViewStyle>;
}

