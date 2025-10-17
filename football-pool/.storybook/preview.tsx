import type { Preview } from '@storybook/react-native-web-vite';
import React from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { AppProvider } from '../context/app-context';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';

const preview: Preview = {
  decorators: [
    (Story: any) => {
      return React.createElement(
        Provider,
        { store },
        React.createElement(
          AppProvider,
          null,
          React.createElement(
            ThemeProvider,
            { value: DefaultTheme },
            React.createElement(
              View,
              { style: { flex: 1, padding: 20 } },
              React.createElement(Story, null)
            )
          )
        )
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
};

export default preview;