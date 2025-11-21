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
import Svg, { Circle, Line, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Goalkeeper figure
const Goalkeeper: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Goalkeeper movements: diving left/right, jumping
    offsetX.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 800, easing: Easing.out(Easing.ease) }), // Dive left
        withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) }), // Return
        withTiming(15, { duration: 800, easing: Easing.out(Easing.ease) }), // Dive right
        withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) }), // Return
        withTiming(0, { duration: 1000 }) // Pause
      ),
      -1,
      false
    );

    offsetY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 600, easing: Easing.out(Easing.ease) }), // Jump
        withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) }), // Fall
        withTiming(-5, { duration: 500, easing: Easing.out(Easing.ease) }), // Another jump
        withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) }),
        withTiming(0, { duration: 1200 }) // Pause
      ),
      -1,
      false
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 600 }),
        withTiming(1, { duration: 400 }),
        withTiming(1.05, { duration: 500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offsetX.value },
        { translateY: offsetY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={[styles.goalkeeper, { left: x, top: y }, animatedStyle]}>
      <Svg width="50" height="70" viewBox="0 0 50 70">
        {/* Head */}
        <Circle cx="25" cy="10" r="7" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.2" />
        {/* Body */}
        <Line x1="25" y1="17" x2="25" y2="40" stroke="#FFFFFF" strokeWidth="2" opacity="0.2" />
        {/* Arms (spread wide like goalkeeper) */}
        <Line x1="25" y1="25" x2="8" y2="30" stroke="#FFFFFF" strokeWidth="2" opacity="0.2" />
        <Line x1="25" y1="25" x2="42" y2="30" stroke="#FFFFFF" strokeWidth="2" opacity="0.2" />
        {/* Legs (wider stance) */}
        <Line x1="25" y1="40" x2="15" y2="60" stroke="#FFFFFF" strokeWidth="2" opacity="0.2" />
        <Line x1="25" y1="40" x2="35" y2="60" stroke="#FFFFFF" strokeWidth="2" opacity="0.2" />
      </Svg>
    </Animated.View>
  );
};

// Penalty taker figure
const PenaltyTaker: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Penalty taker: subtle movements before kick
    offsetX.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(-2, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    offsetY.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offsetX.value },
        { translateY: offsetY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={[styles.stickFigure, { left: x, top: y }, animatedStyle]}>
      <Svg width="45" height="60" viewBox="0 0 45 60">
        {/* Head */}
        <Circle cx="22.5" cy="9" r="6" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.15" />
        {/* Body */}
        <Line x1="22.5" y1="15" x2="22.5" y2="33" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.15" />
        {/* Arms */}
        <Line x1="22.5" y1="21" x2="12" y2="27" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.15" />
        <Line x1="22.5" y1="21" x2="33" y2="27" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.15" />
        {/* Legs - feet should be at bottom (y=52) */}
        <Line x1="22.5" y1="33" x2="15" y2="52" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.15" />
        <Line x1="22.5" y1="33" x2="30" y2="52" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.15" />
      </Svg>
    </Animated.View>
  );
};

const PenaltyKickBall: React.FC = () => {
  const translateY = useSharedValue(height * 0.65);
  const translateX = useSharedValue(width * 0.5);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  // Penalty spot position - must match the penaltySpot style position exactly
  // penaltySpot style: 
  //   - left: 50% (centered in penaltyAreaZoomed)
  //   - bottom: 30% (from bottom of penaltyAreaZoomed)
  // penaltyAreaZoomed:
  //   - top: 45% (from screen top)
  //   - height: 18% (of screen height)
  // So penalty spot Y position = 45% (area start) + (18% * 0.7) = 45% + 12.6% = 57.6% from screen top
  // But we need to account for the spot's own height (8px = ~0.1% of typical screen)
  const penaltySpotX = width * 0.5; // Center horizontally
  const penaltySpotY = height * 0.576; // Matches the penaltySpot bottom: 30% position

  // Goal center position
  const goalCenterX = width * 0.5;
  const goalCenterY = height * 0.45;

  useEffect(() => {
    // Ball starts at penalty spot
    translateY.value = withRepeat(
      withSequence(
        // Stay at penalty spot (preparation)
        withTiming(penaltySpotY, { duration: 1000 }),
        // Kick towards goal (fast)
        withTiming(goalCenterY, { duration: 600, easing: Easing.out(Easing.ease) }),
        // Pause at goal
        withTiming(goalCenterY, { duration: 800 }),
        // Reset to penalty spot
        withTiming(penaltySpotY, { duration: 400, easing: Easing.in(Easing.ease) }),
        // Pause before next kick
        withTiming(penaltySpotY, { duration: 1200 })
      ),
      -1,
      false
    );

    translateX.value = withRepeat(
      withSequence(
        // Stay at penalty spot
        withTiming(penaltySpotX, { duration: 1000 }),
        // Kick towards goal (slight variation left/right)
        withTiming(goalCenterX + (Math.random() * 20 - 10), { duration: 600, easing: Easing.out(Easing.ease) }),
        // Pause at goal
        withTiming(goalCenterX, { duration: 800 }),
        // Reset
        withTiming(penaltySpotX, { duration: 400, easing: Easing.in(Easing.ease) }),
        // Pause
        withTiming(penaltySpotX, { duration: 1200 })
      ),
      -1,
      false
    );

    // Ball rotation during kick
    const totalDuration = 1000 + 600 + 800 + 400 + 1200;
    rotate.value = withRepeat(
      withTiming(360 * 5, { 
        duration: totalDuration, 
        easing: Easing.linear 
      }),
      -1,
      false
    );

    // Scale effect during kick
    scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(1.2, { duration: 300, easing: Easing.out(Easing.ease) }), // Kick
        withTiming(1, { duration: 300, easing: Easing.in(Easing.ease) }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      false
    );

    opacity.value = withTiming(0.25, { duration: 1500 });
  }, []);

  const ballAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <>
      {/* Penalty taker at penalty spot - feet positioned at the spot */}
      {/* Stick figure: 45px wide (center at penaltySpotX - 22.5), 60px tall (feet at y=52 in SVG) */}
      {/* Position so feet (bottom of SVG at y=52) align with penalty spot center */}
      <PenaltyTaker x={penaltySpotX - 22.5} y={penaltySpotY - 52} />
      
      {/* Goalkeeper at goal line */}
      <Goalkeeper x={goalCenterX - 25} y={goalCenterY - 35} />
      
      {/* Ball */}
      <Animated.View style={[styles.ball, ballAnimatedStyle]}>
        <Ionicons name="football-outline" size={28} color="#FFFFFF" />
      </Animated.View>
    </>
  );
};

const AnimatedBackgroundPenalty: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Focused view of the penalty area */}
      <View style={styles.field}>
        {/* Stands (above the boundary line) */}
        <View style={styles.stands}>
          {/* Gradient background of the stands */}
          <View style={styles.standsBackground} />
          
          {/* Rows of seats with alternating colors and people */}
          {[...Array(45)].map((_, index) => (
            <View key={index}>
              {/* Seat row */}
              <View 
                style={[
                  styles.standRow,
                  { 
                    top: `${index * 1.05}%`,
                    backgroundColor: index % 4 === 0 
                      ? 'rgba(220, 50, 50, 0.6)' // Red
                      : index % 4 === 1
                      ? 'rgba(255, 255, 255, 0.65)' // White
                      : index % 4 === 2
                      ? 'rgba(200, 200, 220, 0.55)' // Light gray
                      : 'rgba(240, 60, 60, 0.5)', // Light red
                    height: 2,
                  }
                ]} 
              />
              {/* People in the stands (dots) */}
              {index % 2 === 0 && (
                <View style={[styles.crowdDots, { top: `${index * 1.05 - 0.4}%` }]}>
                  {[...Array(25)].map((_, i) => (
                    <View 
                      key={i}
                      style={[
                        styles.crowdDot,
                        { left: `${i * 4}%`, opacity: Math.random() * 0.5 + 0.4 }
                      ]} 
                    />
                  ))}
                </View>
              )}
            </View>
          ))}
          
          {/* Section separators */}
          <View style={[styles.standSeparator, { top: '12%' }]} />
          <View style={[styles.standSeparator, { top: '24%' }]} />
          <View style={[styles.standSeparator, { top: '36%' }]} />
          <View style={[styles.standSeparator, { top: '48%' }]} />
          <View style={[styles.standSeparator, { top: '60%' }]} />
          <View style={[styles.standSeparator, { top: '72%' }]} />
          <View style={[styles.standSeparator, { top: '84%' }]} />
          
          {/* Security fence */}
          <View style={styles.securityFence} />
        </View>
        
        {/* Top boundary line of the field */}
        <View style={styles.fieldTopBoundary} />
        
        {/* Penalty area (zoomed) */}
        <View style={styles.penaltyAreaZoomed}>
          {/* Area lines */}
          <View style={styles.areaTopLine} />
          <View style={styles.areaLeftLine} />
          <View style={styles.areaRightLine} />
          
          {/* Goal box/goal area */}
          <View style={styles.goalAreaBox}>
            <View style={styles.goalLine} />
          </View>
          
          {/* Goal posts */}
          <View style={styles.goalPostLeft} />
          <View style={styles.goalPostRight} />
          <View style={styles.goalCrossbar} />
          
          {/* Penalty arc (half-moon) */}
          <View style={styles.penaltyArcZoomed} />
          
          {/* Penalty spot (circle) */}
          <View style={styles.penaltySpot} />
        </View>
      </View>

      {/* Subtle overlay */}
      <View style={styles.overlay} />

      {/* Animation: penalty taker + goalkeeper + ball */}
      <PenaltyKickBall />
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
  // Stands
  stands: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '45%',
    overflow: 'hidden',
  },
  standsBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(35, 40, 50, 0.6)',
  },
  standRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 2,
  },
  crowdDots: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
  },
  crowdDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(80, 90, 110, 0.7)',
  },
  standSeparator: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  securityFence: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 8,
    backgroundColor: 'rgba(100, 120, 140, 0.5)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(150, 150, 150, 0.6)',
  },
  fieldTopBoundary: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '45%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  penaltyAreaZoomed: {
    position: 'absolute',
    left: '30%',
    right: '30%',
    top: '45%',
    height: '18%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopWidth: 0,
    borderRadius: 8,
  },
  areaTopLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  areaLeftLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  areaRightLine: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  goalAreaBox: {
    position: 'absolute',
    left: '30%',
    right: '30%',
    top: 0,
    height: '40%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderTopWidth: 0,
  },
  goalLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  goalPostLeft: {
    position: 'absolute',
    left: '30%',
    top: 0,
    width: 3,
    height: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  goalPostRight: {
    position: 'absolute',
    right: '30%',
    top: 0,
    width: 3,
    height: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  goalCrossbar: {
    position: 'absolute',
    left: '30%',
    right: '30%',
    top: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  penaltyArcZoomed: {
    position: 'absolute',
    left: '50%',
    bottom: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    transform: [{ translateX: -40 }],
  },
  penaltySpot: {
    position: 'absolute',
    left: '50%',
    bottom: '30%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ translateX: -4 }],
  },
  ball: {
    position: 'absolute',
    zIndex: 0,
  },
  stickFigure: {
    position: 'absolute',
    zIndex: 0,
  },
  goalkeeper: {
    position: 'absolute',
    zIndex: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 77, 58, 0.3)',
  },
});

export default AnimatedBackgroundPenalty;

