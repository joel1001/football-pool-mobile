import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
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
  image,
  color,
  poolAvailableDay,
  poolaAvailableDay, // Backend typo support
  poolDisabledDate,
  poolDisbaledDate, // Backend typo support
  onPress,
  style,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(id);
    }
  };

  // Calculate competition status based on poolAvailableDay
  const getCompetitionStatus = () => {
    // Support both correct and typo versions from backend
    const availableDay = poolAvailableDay || poolaAvailableDay;
    
    if (!availableDay) {
      console.log(`[${shortName}] No poolAvailableDay found`);
      return { type: 'none', label: '', dateLabel: '', daysRemaining: 0 };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to midnight for accurate day comparison
    const startDate = new Date(availableDay);
    startDate.setHours(0, 0, 0, 0);
    
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    console.log(`[${shortName}] Days until start (poolAvailableDay - today): ${diffDays}`);
    
    // 1. EN CURSO (Rojo tenue): Ya es día 0 o pasó (poolAvailableDay <= hoy)
    if (diffDays <= 0) {
      console.log(`[${shortName}] 🔴 EN CURSO - already started`);
      return { type: 'ongoing', label: 'EN CURSO', dateLabel: '', daysRemaining: 0 };
    }
    
    // 2. SE CERRARÁ EN X DÍAS (Naranja): 1-3 días antes de poolAvailableDay
    if (diffDays >= 1 && diffDays <= 3) {
      console.log(`[${shortName}] 🟠 CLOSING SOON - ${diffDays} days until start`);
      return { type: 'closing', label: `SE CERRARÁ EN ${diffDays} DÍA${diffDays > 1 ? 'S' : ''}`, dateLabel: '', daysRemaining: diffDays };
    }
    
    // 3. ABIERTO (Azul): 4-15 días antes de poolAvailableDay
    if (diffDays >= 4 && diffDays <= 15) {
      console.log(`[${shortName}] 🔵 ABIERTO - ${diffDays} days until start`);
      return { type: 'open', label: 'ABIERTO', dateLabel: '', daysRemaining: diffDays };
    }
    
    // 4. PRÓXIMAMENTE (Verde con 2 labels): 16 días hasta 2 meses en el futuro
    if (diffDays > 15 && diffDays <= 60) {
      const currentYear = today.getFullYear();
      const startYear = startDate.getFullYear();
      const includeYear = startYear !== currentYear;
      
      const dateStr = startDate.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short',
        ...(includeYear && { year: 'numeric' })
      });
      console.log(`[${shortName}] 🟢 PRÓXIMAMENTE - ${diffDays} days, starts: ${dateStr}`);
      return { 
        type: 'soon', 
        label: 'PRÓXIMAMENTE', 
        dateLabel: dateStr.toUpperCase(),
        daysRemaining: diffDays 
      };
    }
    
    // 5. Fecha en gris: Más de 2 meses en el futuro (siempre con año)
    if (diffDays > 60) {
      const dateStr = startDate.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
      });
      console.log(`[${shortName}] ⚪ FAR FUTURE - ${diffDays} days, date: ${dateStr}`);
      return { type: 'future', label: dateStr.toUpperCase(), dateLabel: '', daysRemaining: diffDays };
    }
    
    return { type: 'none', label: '', dateLabel: '', daysRemaining: 0 };
  };

  const displaySubtitle = region || country || '';
  const status = getCompetitionStatus();
  
  console.log(`[${shortName}] Status:`, status);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Imagen de fondo */}
      {image ? (
        typeof image === 'string' ? (
          <Image
            source={{ uri: image }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={image}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        )
      ) : null}
      
      {/* Overlay con gradiente */}
      <View style={styles.overlay} />
      
      {/* Labels dinámicos según el estado */}
      {status.type === 'open' && (
        <View style={styles.openLabel}>
          <Text style={styles.openLabelText}>{status.label}</Text>
        </View>
      )}
      
      {status.type === 'closing' && (
        <View style={styles.closingLabel}>
          <Text style={styles.closingLabelText}>{status.label}</Text>
        </View>
      )}
      
      {status.type === 'ongoing' && (
        <View style={styles.ongoingLabel}>
          <Text style={styles.ongoingLabelText}>{status.label}</Text>
        </View>
      )}
      
      {/* PRÓXIMAMENTE: 2 labels (texto + fecha) */}
      {status.type === 'soon' && (
        <>
          <View style={styles.soonLabel}>
            <Text style={styles.soonLabelText}>PRÓXIMAMENTE</Text>
          </View>
          <View style={styles.soonDateLabel}>
            <Text style={styles.soonDateLabelText}>{status.dateLabel}</Text>
          </View>
        </>
      )}
      
      {status.type === 'future' && (
        <View style={styles.futureLabel}>
          <Text style={styles.futureLabelText}>{status.label}</Text>
        </View>
      )}
      
      {/* Contenido */}
      <View style={styles.content}>
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

