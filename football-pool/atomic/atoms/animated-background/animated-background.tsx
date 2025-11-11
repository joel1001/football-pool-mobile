import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const FloatingBall: React.FC = () => {
  const translateY = useSharedValue(height * 0.25);
  const translateX = useSharedValue(width * 0.15);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Movimiento vertical por toda la cancha en pasos cortos
    translateY.value = withRepeat(
      withSequence(
        withTiming(height * 0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(height * 0.45, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(height * 0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(height * 0.75, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(height * 0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(height * 0.45, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(height * 0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(height * 0.25, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Movimiento horizontal por toda la cancha en pasos cortos
    translateX.value = withRepeat(
      withSequence(
        withTiming(width * 0.25, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(width * 0.4, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(width * 0.55, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(width * 0.7, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(width * 0.85, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(width * 0.7, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(width * 0.55, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(width * 0.4, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(width * 0.25, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(width * 0.15, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Rotación continua del balón
    rotate.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );

    // Fade in suave
    opacity.value = withTiming(0.25, { duration: 1500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.ball, animatedStyle]}>
      <Ionicons name="football-outline" size={40} color="#FFFFFF" />
    </Animated.View>
  );
};

const AnimatedBackground: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Campo de fútbol horizontal */}
      <View style={styles.field}>
        {/* Línea central horizontal */}
        <View style={styles.centerLineHorizontal} />
        
        {/* Círculo central */}
        <View style={styles.centerCircle} />
        <View style={styles.centerDot} />
        
        {/* Área superior */}
        <View style={[styles.penaltyArea, styles.penaltyAreaTop]}>
          <View style={[styles.goalArea, styles.goalAreaTop]} />
          <View style={styles.penaltyArc} />
        </View>
        
        {/* Área inferior */}
        <View style={[styles.penaltyArea, styles.penaltyAreaBottom]}>
          <View style={[styles.goalArea, styles.goalAreaBottom]} />
        </View>

        {/* Esquinas */}
        <View style={[styles.cornerArc, styles.cornerTopLeft]} />
        <View style={[styles.cornerArc, styles.cornerTopRight]} />
        <View style={[styles.cornerArc, styles.cornerBottomLeft]} />
        <View style={[styles.cornerArc, styles.cornerBottomRight]} />
      </View>

      {/* Overlay sutil para legibilidad */}
      <View style={styles.overlay} />

      {/* Un solo balón flotante (al final para que esté detrás) */}
      <FloatingBall />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#1A4D3A', // Verde del login
  },
  field: {
    flex: 1,
    position: 'relative',
  },
  centerLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  centerCircle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  centerDot: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ translateX: -4 }, { translateY: -4 }],
  },
  penaltyArea: {
    position: 'absolute',
    left: '50%',
    height: 120,
    width: 200,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ translateX: -100 }],
  },
  penaltyAreaTop: {
    top: 0,
    borderTopWidth: 0,
  },
  penaltyAreaBottom: {
    bottom: 0,
    borderBottomWidth: 0,
  },
  goalArea: {
    position: 'absolute',
    left: '50%',
    width: 80,
    height: 40,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ translateX: -40 }],
  },
  goalAreaTop: {
    top: 0,
    borderTopWidth: 0,
  },
  goalAreaBottom: {
    bottom: 0,
    borderBottomWidth: 0,
  },
  penaltyArc: {
    position: 'absolute',
    left: '50%',
    top: 120,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  cornerArc: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderBottomRightRadius: 20,
  },
  ball: {
    position: 'absolute',
    zIndex: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 77, 58, 0.2)',
  },
});

export default AnimatedBackground;

