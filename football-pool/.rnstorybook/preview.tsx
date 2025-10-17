import type { Preview } from '@storybook/react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { AppProvider } from '../context/app-context';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';

const preview: Preview = {
  decorators: [
    (Story) => (
      <Provider store={store}>
        <AppProvider>
          <ThemeProvider value={DefaultTheme}>
            <View style={{ flex: 1, padding: 20, backgroundColor: '#ffffff' }}>
              <Story />
            </View>
          </ThemeProvider>
        </AppProvider>
      </Provider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
