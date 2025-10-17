import React, { useEffect, useRef } from 'react';
import { View, Text, Image, ActivityIndicator, Animated, Easing } from 'react-native';
import { styles } from './splash.styles';
import { SplashProps } from './splash.types';

export const Splash: React.FC<SplashProps> = ({
  logoSource = require('../../../assets/images/football-pool.png'),
  showLoading = true,
  backgroundColor = '#1a1a1a',
  appName = 'Football Pool',
}) => {
  // Animaciones usando Animated API (compatible con web)
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: -1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.spring(textTranslateY, {
        toValue: 0,
        friction: 10,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(loaderOpacity, {
      toValue: 1,
      duration: 400,
      delay: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const logoRotateInterpolate = logoRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.gradientOverlay} />
      <View style={styles.gradientOverlay2} />
      
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.logoContainer, 
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { rotate: logoRotateInterpolate },
              ],
            }
          ]}
        >
          <View style={styles.logoGlow} />
          <Image 
            source={logoSource} 
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {appName && (
          <Animated.View 
            style={{
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            }}
          >
            <Text style={styles.appName}>{appName}</Text>
            <View style={styles.underline} />
          </Animated.View>
        )}

        {showLoading && (
          <Animated.View 
            style={[
              styles.loaderContainer, 
              { opacity: loaderOpacity }
            ]}
          >
            <ActivityIndicator 
              size="large" 
              color="#ffffff" 
              style={styles.loader}
            />
            <Text style={styles.loadingText}>Loading...</Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />
    </View>
  );
};

