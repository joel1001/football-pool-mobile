import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  
  // Gradientes simulados con overlays
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    backgroundColor: 'rgba(37, 99, 235, 0.15)', // Azul suave
  },
  gradientOverlay2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    backgroundColor: 'rgba(168, 85, 247, 0.1)', // Morado suave
  },
  
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  
  // Logo con efecto glow
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  logoGlow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#2563eb',
    opacity: 0.2,
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 40,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  logo: {
    width: 200,
    height: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  
  // App Name con estilo moderno
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  
  // Línea decorativa bajo el título
  underline: {
    width: 80,
    height: 4,
    backgroundColor: '#2563eb',
    borderRadius: 2,
    marginTop: 8,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
      },
    }),
  },
  
  // Loader container
  loaderContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loader: {
    transform: [{ scale: 1.3 }],
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.7,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  
  // Círculos decorativos flotantes
  decorCircle1: {
    position: 'absolute',
    top: height * 0.1,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
      },
    }),
  },
  decorCircle2: {
    position: 'absolute',
    bottom: height * 0.15,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 40,
      },
    }),
  },
  decorCircle3: {
    position: 'absolute',
    top: height * 0.4,
    right: width * 0.1,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
    }),
  },
});

