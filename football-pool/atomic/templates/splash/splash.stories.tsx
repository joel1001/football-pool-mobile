import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { Splash } from './splash';

const meta = {
  title: 'Templates/Splash',
  component: Splash,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, width: '100%', height: 600 }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: {
      control: 'color',
      description: 'Color de fondo principal del splash',
    },
    showLoading: {
      control: 'boolean',
      description: 'Mostrar indicador de carga animado',
    },
    appName: {
      control: 'text',
      description: 'Nombre de la aplicación',
    },
  },
} satisfies Meta<typeof Splash>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    appName: 'Football Pool',
    showLoading: true,
    backgroundColor: '#1a1a1a',
  },
};

export const WithoutLoading: Story = {
  args: {
    appName: 'Football Pool',
    showLoading: false,
    backgroundColor: '#1a1a1a',
  },
};

export const DarkPurple: Story = {
  args: {
    appName: 'Football Pool',
    showLoading: true,
    backgroundColor: '#1e1b4b',
  },
};

export const OceanBlue: Story = {
  args: {
    appName: 'Football Pool',
    showLoading: true,
    backgroundColor: '#0c4a6e',
  },
};

export const EmeraldGreen: Story = {
  args: {
    appName: 'Football Pool',
    showLoading: true,
    backgroundColor: '#00B894',
  },
};

export const MinimalNoText: Story = {
  args: {
    appName: '',
    showLoading: false,
    backgroundColor: '#000000',
  },
};
