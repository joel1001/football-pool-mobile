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

// Running player figure (stick figure running)
const RunningPlayer: React.FC<{ x: number; y: number; delay?: number }> = ({ x, y, delay = 0 }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Running animation - moving horizontally (right)
    translateX.value = withRepeat(
      withSequence(
        withTiming(0, { duration: delay }),
        withTiming(width * 0.5, { 
          duration: 3500, 
          easing: Easing.linear 
        }),
        withTiming(0, { duration: 0 }) // Reset instantly
      ),
      -1,
      false
    );

    // Running bounce effect (up and down while running)
    translateY.value = withRepeat(
      withSequence(
        withTiming(0, { duration: delay }),
        withTiming(-4, { duration: 175, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 175, easing: Easing.in(Easing.ease) }),
        withTiming(-4, { duration: 175, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 175, easing: Easing.in(Easing.ease) }),
        withTiming(-4, { duration: 175, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 175, easing: Easing.in(Easing.ease) }),
        withTiming(-4, { duration: 175, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 175, easing: Easing.in(Easing.ease) }),
        withTiming(-4, { duration: 175, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 175, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <Animated.View style={[styles.player, { left: x, top: y }, animatedStyle]}>
      <Svg width="40" height="55" viewBox="0 0 40 55">
        {/* Head */}
        <Circle cx="20" cy="8" r="6" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.2" />
        {/* Body */}
        <Line x1="20" y1="14" x2="20" y2="32" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.2" />
        {/* Arms (running motion) */}
        <Line x1="20" y1="20" x2="28" y2="28" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.2" />
        <Line x1="20" y1="20" x2="12" y2="28" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.2" />
        {/* Legs (running position) */}
        <Line x1="20" y1="32" x2="25" y2="50" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.2" />
        <Line x1="20" y1="32" x2="15" y2="50" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.2" />
      </Svg>
    </Animated.View>
  );
};

// Ball being passed between players - synchronized with their movement
const PassingBall: React.FC = () => {
  const translateX = useSharedValue(width * 0.05 + 25);
  const translateY = useSharedValue(height * 0.70);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    const cycleDuration = 3500; // Same as players' movement duration
    const player1StartX = width * 0.05;
    const player2StartX = width * 0.20;
    const playerDistance = player2StartX - player1StartX; // ~15% of width
    const ballOffset = 25; // Ball position relative to player center
    const movementDistance = width * 0.5; // Players move this distance
    
    // Calculate positions: players move from startX to startX + movementDistance
    // Ball should move with them, passing between them
    translateX.value = withRepeat(
      withSequence(
        // Start with first player (absolute position)
        withTiming(player1StartX + ballOffset, { duration: 0 }),
        // Move forward with first player for 1000ms (same speed: movementDistance/cycleDuration)
        withTiming(player1StartX + ballOffset + (movementDistance / cycleDuration) * 1000, { 
          duration: 1000, 
          easing: Easing.linear 
        }),
        // Quick pass to second player (second player is at player2StartX + same forward movement)
        withTiming(player2StartX + ballOffset + (movementDistance / cycleDuration) * 1000, { 
          duration: 300, 
          easing: Easing.inOut(Easing.ease) 
        }),
        // Move forward with second player for 1000ms
        withTiming(player2StartX + ballOffset + (movementDistance / cycleDuration) * 2000, { 
          duration: 1000, 
          easing: Easing.linear 
        }),
        // Pass back to first player (first player is now ahead by playerDistance)
        withTiming(player1StartX + ballOffset + (movementDistance / cycleDuration) * 2000, { 
          duration: 300, 
          easing: Easing.inOut(Easing.ease) 
        }),
        // Continue with first player for remaining time
        withTiming(player1StartX + ballOffset + movementDistance, { 
          duration: cycleDuration - 2600, 
          easing: Easing.linear 
        }),
        // Reset to start position (same as players reset)
        withTiming(player1StartX + ballOffset, { duration: 0 })
      ),
      -1,
      false
    );

    // Ball bounce effect - synchronized with movement
    translateY.value = withRepeat(
      withSequence(
        // Running with first player (bouncing on ground)
        withTiming(height * 0.70, { duration: 500 }),
        withTiming(height * 0.68, { duration: 100, easing: Easing.out(Easing.ease) }),
        withTiming(height * 0.70, { duration: 100, easing: Easing.in(Easing.ease) }),
        withTiming(height * 0.70, { duration: 300 }),
        // Pass to second player (lift up)
        withTiming(height * 0.65, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(height * 0.70, { duration: 150, easing: Easing.in(Easing.ease) }),
        // Running with second player
        withTiming(height * 0.70, { duration: 500 }),
        withTiming(height * 0.68, { duration: 100, easing: Easing.out(Easing.ease) }),
        withTiming(height * 0.70, { duration: 100, easing: Easing.in(Easing.ease) }),
        withTiming(height * 0.70, { duration: 300 }),
        // Pass back to first player
        withTiming(height * 0.65, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(height * 0.70, { duration: 150, easing: Easing.in(Easing.ease) }),
        // Continue running
        withTiming(height * 0.70, { duration: 1900 })
      ),
      -1,
      false
    );

    // Ball rotation - continuous rotation
    rotate.value = withRepeat(
      withTiming(360 * 20, { 
        duration: cycleDuration, 
        easing: Easing.linear 
      }),
      -1,
      false
    );

    opacity.value = withTiming(0.4, { duration: 1000 });
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
      {/* Two running players on the left side, passing the ball */}
      <RunningPlayer x={width * 0.05} y={height * 0.63} delay={0} />
      <RunningPlayer x={width * 0.20} y={height * 0.66} delay={1750} />
      
      {/* Ball being passed - synchronized with players */}
      <Animated.View style={[styles.ball, ballAnimatedStyle]}>
        <Ionicons name="football" size={24} color="#FFFFFF" />
      </Animated.View>
    </>
  );
};

const AnimatedBackgroundSidePass: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Field background - simple green field */}
      <View style={styles.field}>
        {/* Left sideline indicator */}
        <View style={styles.sideline} />
      </View>

      {/* Subtle overlay */}
      <View style={styles.overlay} />

      {/* Animation: two players running and passing ball on left side */}
      <PassingBall />
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
  sideline: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  player: {
    position: 'absolute',
    zIndex: 1,
  },
  ball: {
    position: 'absolute',
    zIndex: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 77, 58, 0.3)',
  },
});

export default AnimatedBackgroundSidePass;
