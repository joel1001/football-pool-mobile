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

const StickFigure: React.FC<{ x: number; y: number; index: number; isInArea: boolean }> = ({ x, y, index, isInArea }) => {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const delay = index * 200;
    
    if (isInArea) {
      // Area players: more intense movements (pushes, jumps)
      offsetX.value = withRepeat(
        withSequence(
          withTiming(5, { duration: 800, delay, easing: Easing.out(Easing.ease) }),
          withTiming(-4, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(3, { duration: 700, easing: Easing.in(Easing.ease) }),
          withTiming(0, { duration: 500 })
        ),
        -1,
        false
      );

      offsetY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 600, delay, easing: Easing.out(Easing.ease) }), // Jump
          withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) }), // Falls
          withTiming(-5, { duration: 500, easing: Easing.out(Easing.ease) }), // Another jump
          withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) }),
          withTiming(0, { duration: 800 }) // Pause
        ),
        -1,
        false
      );

      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600, delay }),
          withTiming(1, { duration: 400 }),
          withTiming(1.05, { duration: 500 }),
          withTiming(1, { duration: 1100 })
        ),
        -1,
        false
      );
    } else {
      // Other players: subtle movements
      offsetX.value = withRepeat(
        withSequence(
          withTiming(2, { duration: 1500, delay, easing: Easing.inOut(Easing.ease) }),
          withTiming(-2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      offsetY.value = withRepeat(
        withSequence(
          withTiming(-1, { duration: 1800, delay, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [index, isInArea]);

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
        <Circle cx="22.5" cy="9" r="6" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.15" />
        <Line x1="22.5" y1="15" x2="22.5" y2="33" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.15" />
        <Line x1="22.5" y1="21" x2="12" y2="27" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.15" />
        <Line x1="22.5" y1="21" x2="33" y2="27" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.15" />
        <Line x1="22.5" y1="33" x2="15" y2="52" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.15" />
        <Line x1="22.5" y1="33" x2="30" y2="52" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.15" />
      </Svg>
    </Animated.View>
  );
};

const CornerKickBall: React.FC = () => {
  const translateY = useSharedValue(height * 0.1);
  const translateX = useSharedValue(width * 0.1);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  // ONLY 6 players: 1 in corner + 5 in the area (CENTERED - LOWER)
  const allPlayerPositions = [
    // 1 player in pure corner (edge) - ABOVE the corner mark
    { x: -10, y: height * 0.42, isInArea: false },
    
    // 5 players in the area (waiting for the cross) - vertically centered
    { x: width * 0.38, y: height * 0.50, isInArea: true },
    { x: width * 0.5, y: height * 0.52, isInArea: true },
    { x: width * 0.62, y: height * 0.50, isInArea: true },
    { x: width * 0.44, y: height * 0.57, isInArea: true },
    { x: width * 0.56, y: height * 0.57, isInArea: true },
  ];

  // Positions of the 5 area players for ball movement
  const ballPositions = [
    { x: -10, y: height * 0.42 }, // Pure corner (with player on the corner mark)
    { x: width * 0.38, y: height * 0.50 }, // Player 1
    { x: width * 0.5, y: height * 0.52 }, // Player 2
    { x: width * 0.62, y: height * 0.50 }, // Player 3
    { x: width * 0.44, y: height * 0.57 }, // Player 4
    { x: width * 0.56, y: height * 0.57 }, // Player 5
  ];

  useEffect(() => {
    // Ball passes through each position (corner + 5 players) + goal
    const movementsY = [];
    const movementsX = [];
    
    // Pass through each player
    ballPositions.forEach((pos, index) => {
      const duration = index === 0 ? 600 : 1000;
      movementsY.push(withTiming(pos.y + 40, { duration, easing: Easing.inOut(Easing.ease) }));
      movementsX.push(withTiming(pos.x, { duration, easing: Easing.inOut(Easing.ease) }));
    });
    
    // After the last player: GOAL!
    movementsY.push(withTiming(height * 0.40, { duration: 800, easing: Easing.out(Easing.ease) })); // Towards the goal (centered)
    movementsX.push(withTiming(width * 0.5, { duration: 800, easing: Easing.out(Easing.ease) })); // Center
    
    // Pause after goal
    movementsY.push(withTiming(height * 0.40, { duration: 500 }));
    movementsX.push(withTiming(width * 0.5, { duration: 500 }));
    
    translateY.value = withRepeat(
      withSequence(...movementsY),
      -1,
      false
    );

    translateX.value = withRepeat(
      withSequence(...movementsX),
      -1,
      false
    );

    // Smooth rotation with acceleration during goal
    const totalDuration = 600 + (1000 * 5) + 800 + 500;
    rotate.value = withRepeat(
      withTiming(360 * 8, { 
        duration: totalDuration, 
        easing: Easing.linear 
      }),
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
      ],
      opacity: opacity.value,
    };
  });

  return (
    <>
      {/* 6 players: 1 in corner + 5 in area */}
      {allPlayerPositions.map((pos, index) => (
        <StickFigure key={index} x={pos.x} y={pos.y} index={index} isInArea={pos.isInArea} />
      ))}
      
      {/* Ball passing between them */}
      <Animated.View style={[styles.ball, ballAnimatedStyle]}>
        <Ionicons name="football-outline" size={28} color="#FFFFFF" />
      </Animated.View>
    </>
  );
};

const AnimatedBackgroundCorner: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Focused view of the area - zoom in */}
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
          
          {/* Section separators with stronger lines */}
          <View style={[styles.standSeparator, { top: '12%' }]} />
          <View style={[styles.standSeparator, { top: '24%' }]} />
          <View style={[styles.standSeparator, { top: '36%' }]} />
          <View style={[styles.standSeparator, { top: '48%' }]} />
          <View style={[styles.standSeparator, { top: '60%' }]} />
          <View style={[styles.standSeparator, { top: '72%' }]} />
          <View style={[styles.standSeparator, { top: '84%' }]} />
          
          {/* Security fence at the end of the stands */}
          <View style={styles.securityFence} />
        </View>
        
        {/* Top boundary line of the field */}
        <View style={styles.fieldTopBoundary} />
        
        {/* Only the top area (closed framing) */}
        <View style={styles.penaltyAreaZoomed}>
          {/* Area lines */}
          <View style={styles.areaTopLine} />
          <View style={styles.areaLeftLine} />
          <View style={styles.areaRightLine} />
          
          {/* Goal box/goal area */}
          <View style={styles.goalAreaBox}>
            <View style={styles.goalLine} />
          </View>
          
          {/* Penalty arc (half-moon) */}
          <View style={styles.penaltyArcZoomed} />
        </View>

        {/* Top left corner mark (highlighted) */}
        <View style={styles.cornerMarkZoomed} />
        <View style={styles.cornerArcZoomed} />
      </View>

      {/* Subtle overlay */}
      <View style={styles.overlay} />

      {/* Animation: 1 in corner + 5 in area + ball */}
      <CornerKickBall />
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
  // Stands (area above the boundary line)
  stands: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '45%', // Up to the boundary line
    overflow: 'hidden',
  },
  // Stands background with depth
  standsBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(35, 40, 50, 0.6)', // Dark background of the stands
  },
  // Stands seat rows
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
  // Container of dots simulating people
  crowdDots: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
  },
  // Individual dots simulating people in the stands
  crowdDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(80, 90, 110, 0.7)',
  },
  // Section separators with stronger lines
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
  // Security fence at the edge of the stands
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
  // Top boundary line of the field (end line)
  fieldTopBoundary: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '45%', // Aligned with the area - LOWER
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  // Focused framing on the area - CENTERED
  penaltyAreaZoomed: {
    position: 'absolute',
    left: '30%',
    right: '30%',
    top: '45%', // Vertically centered - LOWER
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
  // Corner mark at the PURE corner (left edge) - Aligned with end line
  cornerMarkZoomed: {
    position: 'absolute',
    left: 0, // Pure corner (left edge)
    top: '45%', // Aligned with top boundary line - LOWER
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  cornerArcZoomed: {
    position: 'absolute',
    left: 0, // Pure corner (left edge)
    top: '45%', // Aligned with top boundary line - LOWER
    width: 25,
    height: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderTopLeftRadius: 25,
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

export default AnimatedBackgroundCorner;

