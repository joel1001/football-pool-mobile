import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  
  subtleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 77, 58, 0.2)',
  },
  
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 40,
      },
      android: {
        elevation: 10,
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
  
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#E8F5E9',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  
  underline: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 8,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
    }),
  },
  
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
    color: '#E8F5E9',
    opacity: 0.8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  
  // Football field elements - subtle like animated backgrounds
  centerCircle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ translateX: -60 }, { translateY: -60 }],
  },
  cornerArc1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderTopLeftRadius: 40,
  },
  cornerArc2: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderTopRightRadius: 40,
  },
  cornerArc3: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderBottomLeftRadius: 40,
  },
  cornerArc4: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderBottomRightRadius: 40,
  },
});

