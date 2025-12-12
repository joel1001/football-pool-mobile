import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import es from './locales/es.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import pt from './locales/pt.json';
import ja from './locales/ja.json';
import it from './locales/it.json';
import de from './locales/de.json';
import hi from './locales/hi.json';
import fr from './locales/fr.json';

const LANGUAGE_STORAGE_KEY = '@football_pool:language';

// Get saved language or default to Spanish
const getSavedLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return savedLanguage || 'es';
  } catch (error) {
    return 'es';
  }
};

// Save language preference
export const saveLanguage = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Initialize i18n
export const initI18n = async () => {
  const savedLanguage = await getSavedLanguage();
  
  return new Promise<void>((resolve) => {
    i18n
      .use(initReactI18next)
      .init({
        compatibilityJSON: 'v3',
        resources: {
          en: { translation: en },
          es: { translation: es },
          ru: { translation: ru },
          zh: { translation: zh },
          pt: { translation: pt },
          ja: { translation: ja },
          it: { translation: it },
          de: { translation: de },
          hi: { translation: hi },
          fr: { translation: fr },
        },
        lng: savedLanguage,
        fallbackLng: 'es',
        interpolation: {
          escapeValue: false,
        },
      })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.warn('❌ Error initializing i18n:', error);
        resolve();
      });
  });
};

export default i18n;

