import { AppProvider } from '@/context/app-context';
import { store } from '@/redux/store';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { initI18n } from '@/i18n';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  useEffect(() => {
    const initializeI18n = async () => {
      await initI18n();
    };
    initializeI18n();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppProvider>
          <ThemeProvider value={DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="category-competitions" options={{ headerShown: false }} />
              <Stack.Screen name="competition-details" options={{ headerShown: false }} />
              <Stack.Screen name="competition-groups" options={{ headerShown: false }} />
              <Stack.Screen name="group-details" options={{ headerShown: false }} />
              <Stack.Screen name="user-matches" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AppProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}