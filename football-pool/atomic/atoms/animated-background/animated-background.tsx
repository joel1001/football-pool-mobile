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
import Svg, { Circle, Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const StickFigure: React.FC<{ x: number; y: number; index: number }> = ({ x, y, index }) => {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  useEffect(() => {
    // Cada jugador se mueve ligeramente con un delay diferente
    const delay = index * 200;
    
    offsetX.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 1500, delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(-3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    offsetY.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 1800, delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(2, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offsetX.value },
        { translateY: offsetY.value },
      ],
    };
  });

  return (
    <Animated.View style={[styles.stickFigure, { left: x, top: y }, animatedStyle]}>
      <Svg width="45" height="60" viewBox="0 0 45 60">
        {/* Cabeza */}
        <Circle cx="22.5" cy="9" r="6" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.1" />
        {/* Cuerpo */}
        <Line x1="22.5" y1="15" x2="22.5" y2="33" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.1" />
        {/* Brazo izquierdo */}
        <Line x1="22.5" y1="21" x2="12" y2="27" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.1" />
        {/* Brazo derecho */}
        <Line x1="22.5" y1="21" x2="33" y2="27" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.1" />
        {/* Pierna izquierda */}
        <Line x1="22.5" y1="33" x2="15" y2="52" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.1" />
        {/* Pierna derecha */}
        <Line x1="22.5" y1="33" x2="30" y2="52" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.1" />
      </Svg>
    </Animated.View>
  );
};

const FloatingBall: React.FC = () => {
  const translateY = useSharedValue(height * 0.75);
  const translateX = useSharedValue(width * 0.5);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Positions of the 11 players (4-3-3 formation)
  const playerPositions = [
    // Goalkeeper
    { x: width * 0.5, y: height * 0.85 },
    // Defenders (4)
    { x: width * 0.2, y: height * 0.7 },
    { x: width * 0.4, y: height * 0.73 },
    { x: width * 0.6, y: height * 0.73 },
    { x: width * 0.8, y: height * 0.7 },
    // Midfielders (3)
    { x: width * 0.3, y: height * 0.5 },
    { x: width * 0.5, y: height * 0.48 },
    { x: width * 0.7, y: height * 0.5 },
    // Forwards (3)
    { x: width * 0.25, y: height * 0.28 },
    { x: width * 0.5, y: height * 0.25 },
    { x: width * 0.75, y: height * 0.28 },
  ];

  useEffect(() => {
    // Ball moves to the feet of each player (adjust +35px down)
    const movements = playerPositions.map((pos) => 
      withTiming(pos.y + 35, { duration: 1200, easing: Easing.inOut(Easing.ease) })
    );

    const movementsX = playerPositions.map((pos) => 
      withTiming(pos.x, { duration: 1200, easing: Easing.inOut(Easing.ease) })
    );

    // Add final movement towards the goal (GOAL!)
    const goalY = withTiming(height * 0.08, { duration: 800, easing: Easing.out(Easing.ease) });
    const goalX = withTiming(width * 0.5, { duration: 800, easing: Easing.out(Easing.ease) });
    
    // Pause after goal
    const pauseY = withTiming(height * 0.08, { duration: 500 });
    const pauseX = withTiming(width * 0.5, { duration: 500 });

    translateY.value = withRepeat(
      withSequence(...movements, goalY, pauseY),
      -1,
      false
    );

    translateX.value = withRepeat(
      withSequence(...movementsX, goalX, pauseX),
      -1,
      false
    );

    // Rotation with spin
    const totalDuration = 1200 * playerPositions.length + 800 + 500;
    rotate.value = withRepeat(
      withTiming(360 * (playerPositions.length + 2), { 
        duration: totalDuration, 
        easing: Easing.linear 
      }),
      -1,
      false
    );

    // Fade in suave
    opacity.value = withTiming(0.15, { duration: 1500 });
  }, []);

  const ballAnimatedStyle = useAnimatedStyle(() => {
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
    <>
      {/* 11 jugadores con movimiento ligero */}
      {playerPositions.map((pos, index) => (
        <StickFigure key={index} x={pos.x} y={pos.y} index={index} />
      ))}
      
      {/* Balón moviéndose entre jugadores */}
      <Animated.View style={[styles.ball, ballAnimatedStyle]}>
        <Ionicons name="football-outline" size={28} color="#FFFFFF" />
      </Animated.View>
    </>
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

      {/* Jugadores y balón */}
      <FloatingBall />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#1A4D3A',
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
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  centerCircle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  centerDot: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    transform: [{ translateX: -3 }, { translateY: -3 }],
  },
  penaltyArea: {
    position: 'absolute',
    left: '50%',
    height: 120,
    width: 200,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  cornerArc: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
  stickFigure: {
    position: 'absolute',
    zIndex: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 77, 58, 0.3)',
  },
});

export default AnimatedBackground;
