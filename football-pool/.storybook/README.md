# Storybook Configuration

Este proyecto tiene configurado Storybook para React Native en dos modalidades:

## 🌐 Storybook Web (Navegador)

Para ejecutar Storybook en el navegador:

```bash
npm run storybook
```

Esto iniciará Storybook en `http://localhost:6006`

## 📱 Storybook Native (Dispositivo/Emulador)

Para ejecutar Storybook en el dispositivo o emulador:

1. **Configurar el modo Storybook**: Necesitas cambiar el punto de entrada de la app temporalmente.

2. **Modificar `package.json`**: Cambia el `main` de:
   ```json
   "main": "expo-router/entry"
   ```
   a:
   ```json
   "main": ".rnstorybook/index.ts"
   ```

3. **Iniciar la app**:
   ```bash
   npm run ios
   # o
   npm run android
   ```

4. **Volver al modo normal**: Restaura el `main` a `expo-router/entry`

### Alternativa: Script Automatizado

Puedes agregar estos scripts a `package.json` para facilitar el cambio:

```json
"storybook:mobile": "npm run storybook-generate && expo start",
"storybook:ios": "npm run storybook-generate && expo start --ios",
"storybook:android": "npm run storybook-generate && expo start --android"
```

## 📁 Estructura de Stories

Las stories se pueden crear en dos ubicaciones:

1. **`/stories`**: Para ejemplos y documentación general
2. **`/atomic`**: Para componentes siguiendo Atomic Design
   - `/atomic/atoms/**/*.stories.tsx`
   - `/atomic/molecules/**/*.stories.tsx`
   - `/atomic/organisms/**/*.stories.tsx`
   - `/atomic/templates/**/*.stories.tsx`

## 📝 Crear una Story

Ejemplo de una story básica:

```tsx
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { MiComponente } from './mi-componente';

const meta = {
  title: 'Atoms/MiComponente',
  component: MiComponente,
  tags: ['autodocs'],
  argTypes: {
    // Definir controles aquí
  },
} satisfies Meta<typeof MiComponente>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Props por defecto
  },
};
```

## 🎨 Decoradores Globales

Los decoradores globales están configurados en `.storybook/preview.ts` y `.rnstorybook/preview.tsx` e incluyen:

- Redux Store Provider
- App Context Provider
- Theme Provider (React Navigation)
- View wrapper con padding

## 🔧 Addons Disponibles

### Web:
- `@storybook/addon-docs`: Documentación automática
- `@storybook/addon-controls`: Controles interactivos
- `@storybook/addon-actions`: Log de acciones

### Native (On-Device):
- `@storybook/addon-ondevice-controls`: Controles en el dispositivo
- `@storybook/addon-ondevice-actions`: Log de acciones en el dispositivo

## 🚀 Comandos Útiles

```bash
# Storybook web
npm run storybook              # Iniciar en modo desarrollo
npm run build-storybook        # Build para producción

# Generar stories para React Native
npm run storybook-generate     # Actualizar el archivo de requires

# Linting
npm run lint                   # Ejecutar ESLint
```

## 📚 Recursos

- [Storybook React Native](https://storybook.js.org/tutorials/intro-to-storybook/react-native/en/get-started/)
- [Storybook React Native Web](https://github.com/storybookjs/react-native)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)

