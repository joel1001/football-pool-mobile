import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { saveLanguage } from '@/i18n';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '@/context/app-context';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import * as FileSystem from 'expo-file-system/legacy';
import { updateUserProfileService } from '@/services/auth/auth-service';
import { getUserIdFromToken } from '@/services/services-config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BADGE_WIDTH = 100; // Aumentado para incluir icono y texto de usuario
const BADGE_HEIGHT = 36;
const STORAGE_KEY = '@football_pool:badge_position';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Mandarin', nativeName: '中文', flag: '🇨🇳' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];

type SettingsSection = 'profile' | 'language' | 'notifications' | 'theme';

const ProfileBadge: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { localData, setLocalData } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[1]; // Default to Spanish

  // Position state for dragging - Completamente a la derecha
  const defaultX = SCREEN_WIDTH - BADGE_WIDTH; // Sin margen, completamente al borde derecho
  const defaultY = 60;
  
  const translateX = useSharedValue(defaultX);
  const translateY = useSharedValue(defaultY);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Load saved position on mount
  useEffect(() => {
    const loadPosition = async () => {
      try {
        const savedPosition = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedPosition) {
          const { x, y } = JSON.parse(savedPosition);
          // Si la posición guardada está muy a la derecha (cerca del borde) o muy a la izquierda, usar la nueva posición por defecto
          const isTooFarRight = x > SCREEN_WIDTH - BADGE_WIDTH - 20;
          const isTooFarLeft = x < 50; // Si está muy a la izquierda también ajustar
          if (isTooFarRight || isTooFarLeft) {
            // Usar nueva posición por defecto (más a la izquierda)
            translateX.value = defaultX;
            translateY.value = defaultY;
            // Actualizar AsyncStorage con la nueva posición
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ x: defaultX, y: defaultY }));
          } else {
            translateX.value = x;
            translateY.value = y || defaultY;
          }
        } else {
          // Si no hay posición guardada, usar la posición por defecto (más a la izquierda)
          translateX.value = defaultX;
          translateY.value = defaultY;
        }
      } catch (error) {
        console.error('Error loading badge position:', error);
        // En caso de error, usar posición por defecto
        translateX.value = defaultX;
        translateY.value = defaultY;
      }
    };
    loadPosition();
  }, []);

  // Save position to AsyncStorage
  const savePosition = async (x: number, y: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y }));
    } catch (error) {
      console.error('Error saving badge position:', error);
    }
  };

  // Pan gesture handler
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Calculate new position based on translation
      const newX = startX.value + event.translationX;
      const newY = startY.value + event.translationY;
      
      // Constrain to screen bounds
      const constrainedX = Math.max(0, Math.min(SCREEN_WIDTH - BADGE_WIDTH, newX));
      const constrainedY = Math.max(0, Math.min(SCREEN_HEIGHT - BADGE_HEIGHT - 100, newY));
      
      translateX.value = constrainedX;
      translateY.value = constrainedY;
    })
    .onEnd(() => {
      // Mantener la posición donde el usuario soltó el badge (sin snap)
      // Asegurar que esté dentro de los límites de la pantalla
      const finalX = Math.max(0, Math.min(SCREEN_WIDTH - BADGE_WIDTH, translateX.value));
      const finalY = Math.max(0, Math.min(SCREEN_HEIGHT - BADGE_HEIGHT - 100, translateY.value));
      
      // Animación suave a la posición final
      translateX.value = withSpring(finalX, {
        damping: 15,
        stiffness: 150,
      });
      
      translateY.value = withSpring(finalY, {
        damping: 15,
        stiffness: 150,
      });

      // Save position
      runOnJS(savePosition)(finalX, finalY);
    });

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  const handleLanguageChange = async (languageCode: string) => {
    await saveLanguage(languageCode);
    // No cerrar el modal, solo cambiar el idioma
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            // Limpiar datos de autenticación
            await setLocalData({
              isAuthenticated: false,
              username: '',
              email: '',
              userId: '',
              profileImage: '',
              token: '',
            });
            setModalVisible(false);
            // La navegación automáticamente mostrará el Login cuando isAuthenticated sea false
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Solicitar permisos de imagen
  const requestImagePermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          t('profile.permissionsRequired'),
          t('profile.imagePermissionsMessage'),
          [{ text: t('common.cancel') }]
        );
        return false;
      }
    }
    return true;
  };

  // Convertir imagen a base64
  const convertImageToBase64 = async (uri: string, mimeType?: string): Promise<string | null> => {
    try {
      // Validar tamaño del archivo (máx 2MB antes de convertir)
      // Usar API legacy de expo-file-system para evitar deprecación
      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (fileInfo.exists && fileInfo.size && fileInfo.size > 2 * 1024 * 1024) {
          Alert.alert(
            t('common.error'),
            t('profile.imageTooLarge')
          );
          return null;
        }
      } catch (statError) {
        // Si no se puede obtener el tamaño, continuar (puede que el archivo no exista aún)
        console.warn('Could not get file size, continuing anyway:', statError);
      }

      // Convertir a base64 usando API legacy
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Obtener tipo MIME desde el parámetro o inferirlo desde la URI
      let imageMimeType = mimeType;
      if (!imageMimeType) {
        imageMimeType = uri.toLowerCase().endsWith('.png') 
          ? 'image/png' 
          : uri.toLowerCase().endsWith('.jpg') || uri.toLowerCase().endsWith('.jpeg')
          ? 'image/jpeg'
          : 'image/jpeg'; // Por defecto JPEG
      }

      // Construir data URI
      const dataUri = `data:${imageMimeType};base64,${base64}`;
      
      return dataUri;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };

  // Seleccionar imagen desde galería
  const pickImageFromGallery = async () => {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const mimeType = result.assets[0].mimeType;
        
        // Convertir a base64
        const base64Image = await convertImageToBase64(imageUri, mimeType);
        if (!base64Image) return;

        // Obtener userId del contexto o del token
        const userId = localData.userId || getUserIdFromToken(localData.token || null);
        
        // Actualizar en backend si hay userId
        if (userId) {
          try {
            const updatedUser = await updateUserProfileService(userId, {
              profileImage: base64Image,
            });
            
            // Actualizar contexto con la imagen en base64 y userId
            await setLocalData({ 
              profileImage: base64Image,
              userId: updatedUser._id,
            });
            
            Alert.alert(t('common.success'), t('profile.imageUpdated'));
          } catch (error: any) {
            console.error('Error updating profile image:', error);
            Alert.alert(
              t('common.error'),
              error.response?.data?.error || t('profile.imageUpdateError')
            );
          }
        } else {
          // Si no hay userId, solo guardar localmente (por si acaso)
          await setLocalData({ profileImage: base64Image });
          Alert.alert(
            t('common.error'),
            t('profile.userIdNotFound')
          );
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), t('profile.imagePickError'));
    }
  };

  // Tomar foto con cámara
  const takePhoto = async () => {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const mimeType = result.assets[0].mimeType;
        
        // Convertir a base64
        const base64Image = await convertImageToBase64(imageUri, mimeType);
        if (!base64Image) return;

        // Obtener userId del contexto o del token
        const userId = localData.userId || getUserIdFromToken(localData.token || null);
        
        // Actualizar en backend si hay userId
        if (userId) {
          try {
            const updatedUser = await updateUserProfileService(userId, {
              profileImage: base64Image,
            });
            
            // Actualizar contexto con la imagen en base64 y userId
            await setLocalData({ 
              profileImage: base64Image,
              userId: updatedUser._id,
            });
            
            Alert.alert(t('common.success'), t('profile.imageUpdated'));
          } catch (error: any) {
            console.error('Error updating profile image:', error);
            Alert.alert(
              t('common.error'),
              error.response?.data?.error || t('profile.imageUpdateError')
            );
          }
        } else {
          // Si no hay userId, solo guardar localmente (por si acaso)
          await setLocalData({ profileImage: base64Image });
          Alert.alert(
            t('common.error'),
            t('profile.userIdNotFound')
          );
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(t('common.error'), t('profile.cameraError'));
    }
  };

  // Mostrar opciones para seleccionar imagen
  const showImagePickerOptions = () => {
    Alert.alert(
      t('profile.changePhoto'),
      t('profile.selectImageSource'),
      [
        {
          text: t('profile.takePhoto'),
          onPress: takePhoto,
        },
        {
          text: t('profile.chooseFromLibrary'),
          onPress: pickImageFromGallery,
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.badge, animatedStyle]}>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
            style={styles.badgeTouchable}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.badgeGradient}
            >
              {/* 6 puntos de arrastre (verticales: 2 columnas de 3 puntos) */}
              <View style={styles.dragHandle}>
                <View style={styles.dragDotsColumn}>
                  <View style={styles.dragDot} />
                  <View style={styles.dragDot} />
                  <View style={styles.dragDot} />
                </View>
                <View style={styles.dragDotsColumn}>
                  <View style={styles.dragDot} />
                  <View style={styles.dragDot} />
                  <View style={styles.dragDot} />
                </View>
              </View>
              
              <Ionicons name="person-circle-outline" size={20} color="#FFFFFF" />
              {localData.username ? (
                <Text style={styles.usernameText} numberOfLines={1}>
                  {localData.username.substring(0, 10)}
                </Text>
              ) : (
                <Text style={styles.usernameText}>{t('profile.profile')}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile.title')}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#1A4D3A" />
              </TouchableOpacity>
            </View>

            {/* Tabs de navegación */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeSection === 'profile' && styles.tabActive]}
                onPress={() => setActiveSection('profile')}
              >
                <Ionicons 
                  name="person-outline" 
                  size={18} 
                  color={activeSection === 'profile' ? '#10B981' : '#666'} 
                />
                <Text style={[styles.tabText, activeSection === 'profile' && styles.tabTextActive]}>
                  {t('profile.profile')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, activeSection === 'language' && styles.tabActive]}
                onPress={() => setActiveSection('language')}
              >
                <Ionicons 
                  name="language-outline" 
                  size={18} 
                  color={activeSection === 'language' ? '#10B981' : '#666'} 
                />
                <Text style={[styles.tabText, activeSection === 'language' && styles.tabTextActive]}>
                  {t('profile.language')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeSection === 'notifications' && styles.tabActive]}
                onPress={() => setActiveSection('notifications')}
              >
                <Ionicons 
                  name="notifications-outline" 
                  size={18} 
                  color={activeSection === 'notifications' ? '#10B981' : '#666'} 
                />
                <Text style={[styles.tabText, activeSection === 'notifications' && styles.tabTextActive]}>
                  {t('profile.notifications')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeSection === 'theme' && styles.tabActive]}
                onPress={() => setActiveSection('theme')}
              >
                <Ionicons 
                  name="color-palette-outline" 
                  size={18} 
                  color={activeSection === 'theme' ? '#10B981' : '#666'} 
                />
                <Text style={[styles.tabText, activeSection === 'theme' && styles.tabTextActive]}>
                  {t('profile.theme')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Contenido de cada sección */}
            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
              {activeSection === 'profile' && (
                <View style={styles.sectionContent}>
                  <View style={styles.profileHeader}>
                    <TouchableOpacity 
                      style={styles.profileAvatarContainer}
                      onPress={showImagePickerOptions}
                      activeOpacity={0.8}
                    >
                      {localData.profileImage ? (
                        <ExpoImage
                          source={{ uri: localData.profileImage }}
                          style={styles.profileAvatarImage}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={styles.profileAvatar}>
                          <Ionicons name="person" size={40} color="#10B981" />
                        </View>
                      )}
                      <View style={styles.profileAvatarEdit}>
                        <Ionicons name="camera" size={16} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                    <Text style={styles.profileName}>{localData.username || t('profile.user')}</Text>
                    {localData.isAuthenticated && (
                      <Text style={styles.profileStatus}>{t('profile.authenticated')}</Text>
                    )}
                  </View>
                  
                  <View style={styles.settingsItem}>
                    <Ionicons name="mail-outline" size={20} color="#1A4D3A" />
                    <Text style={styles.settingsItemText}>{t('profile.email')}: {localData.email || localData.username || 'N/A'}</Text>
                  </View>

                  <View style={styles.settingsItem}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#1A4D3A" />
                    <Text style={styles.settingsItemText}>
                      {localData.isAuthenticated ? t('profile.loggedIn') : t('profile.notLoggedIn')}
                    </Text>
                  </View>

                  {localData.isAuthenticated && (
                    <TouchableOpacity
                      style={styles.logoutButton}
                      onPress={handleLogout}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#EF4444', '#DC2626']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.logoutButtonGradient}
                      >
                        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.logoutButtonText}>{t('profile.logout')}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {activeSection === 'language' && (
                <View style={styles.sectionContent}>
                  {languages.map((language) => {
                    const isSelected = i18n.language === language.code;
                    return (
                      <TouchableOpacity
                        key={language.code}
                        style={[
                          styles.languageItem,
                          isSelected && styles.languageItemSelected,
                        ]}
                        onPress={() => handleLanguageChange(language.code)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.languageItemContent}>
                          <Text style={styles.languageFlag}>{language.flag}</Text>
                          <View style={styles.languageInfo}>
                            <Text style={styles.languageName}>{language.nativeName}</Text>
                            <Text style={styles.languageNameSecondary}>{language.name}</Text>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {activeSection === 'notifications' && (
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionTitle}>{t('profile.notificationSettings')}</Text>
                  <View style={styles.settingsItem}>
                    <Ionicons name="notifications-outline" size={20} color="#1A4D3A" />
                    <Text style={styles.settingsItemText}>{t('profile.pushNotifications')}</Text>
                    <Text style={styles.settingsComingSoon}>({t('profile.comingSoon')})</Text>
                  </View>
                  
                  <View style={styles.settingsItem}>
                    <Ionicons name="mail-outline" size={20} color="#1A4D3A" />
                    <Text style={styles.settingsItemText}>{t('profile.emailNotifications')}</Text>
                    <Text style={styles.settingsComingSoon}>({t('profile.comingSoon')})</Text>
                  </View>
                </View>
              )}

              {activeSection === 'theme' && (
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionTitle}>{t('profile.themeSettings')}</Text>
                  <View style={styles.settingsItem}>
                    <Ionicons name="sunny-outline" size={20} color="#1A4D3A" />
                    <Text style={styles.settingsItemText}>{t('profile.lightTheme')}</Text>
                    <Text style={styles.settingsComingSoon}>({t('profile.comingSoon')})</Text>
                  </View>
                  
                  <View style={styles.settingsItem}>
                    <Ionicons name="moon-outline" size={20} color="#1A4D3A" />
                    <Text style={styles.settingsItemText}>{t('profile.darkTheme')}</Text>
                    <Text style={styles.settingsComingSoon}>({t('profile.comingSoon')})</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
  badgeTouchable: {
    // Container for touchable
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    minWidth: 70,
  },
  dragHandle: {
    flexDirection: 'row',
    gap: 3,
    marginRight: 4,
  },
  dragDotsColumn: {
    flexDirection: 'column',
    gap: 2,
  },
  dragDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  usernameText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginLeft: 4,
    maxWidth: 70,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#E8F5E9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A4D3A',
  },
  closeButton: {
    padding: 4,
  },
  languagesList: {
    maxHeight: 500,
  },
  languageItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageItemSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageFlag: {
    fontSize: 32,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A4D3A',
    marginBottom: 2,
  },
  languageNameSecondary: {
    fontSize: 12,
    color: '#1A4D3A',
    opacity: 0.6,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 77, 58, 0.1)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#10B981',
  },
  contentScroll: {
    maxHeight: 500,
  },
  sectionContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A4D3A',
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26, 77, 58, 0.1)',
  },
  profileAvatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileAvatarEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A4D3A',
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  settingsItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A4D3A',
  },
  settingsComingSoon: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  logoutButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default ProfileBadge;

