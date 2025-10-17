import type { StorybookConfig } from '@storybook/react-native-web-vite';

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.stories.@(js|jsx|ts|tsx)",
    "../atomic/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [],
  framework: {
    name: "@storybook/react-native-web-vite",
    options: {}
  }
};
export default config;