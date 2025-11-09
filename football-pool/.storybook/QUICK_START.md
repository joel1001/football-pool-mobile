# 🚀 Guía Rápida de Storybook

## ¿Qué es Storybook?

Storybook es una herramienta para desarrollar componentes UI de forma aislada. Te permite:

- 👁️ Visualizar componentes en diferentes estados
- 🎮 Interactuar con props en tiempo real
- 📱 Probar en web y dispositivos móviles
- 📝 Documentar componentes automáticamente
- 🐛 Detectar bugs visuales fácilmente

## Inicio Rápido - 3 Pasos

### 1️⃣ Ver Storybook en el Navegador

```bash
npm run storybook:web
```

Abre tu navegador en `http://localhost:6006`

### 2️⃣ Ver Storybook en tu Dispositivo/Emulador

```bash
npm run toggle-storybook  # Cambia al modo Storybook
npm run ios               # O npm run android
```

Para volver al modo app normal:
```bash
npm run toggle-storybook
```

### 3️⃣ Crear tu Primer Componente con Story

```bash
# Crea los archivos en atomic/atoms/mi-boton/
# Sigue la plantilla en atomic/COMPONENT_TEMPLATE.md
```

## 📁 ¿Dónde Crear Stories?

```
atomic/
  ├── atoms/        # Componentes básicos (Button, Input, Icon)
  ├── molecules/    # Combinación simple (FormField, Card)
  ├── organisms/    # Secciones complejas (Header, Form)
  └── templates/    # Páginas completas (Splash, Login)
```

## ✨ Ejemplo Mínimo

**my-button.tsx**
```tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export const MyButton = ({ label, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>{label}</Text>
  </TouchableOpacity>
);
```

**my-button.stories.tsx**
```tsx
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { MyButton } from './my-button';

const meta = {
  title: 'Atoms/MyButton',
  component: MyButton,
} satisfies Meta<typeof MyButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Click me!',
  },
};
```

## 🎨 Controles Interactivos

Agrega `argTypes` para controles interactivos:

```tsx
const meta = {
  title: 'Atoms/MyButton',
  component: MyButton,
  argTypes: {
    backgroundColor: { control: 'color' },
    size: { 
      control: 'select', 
      options: ['small', 'medium', 'large'] 
    },
    disabled: { control: 'boolean' },
  },
};
```

## 🔄 Workflow Recomendado

1. **Crea el componente** en `atomic/[nivel]/[componente]/`
2. **Crea la story** en el mismo directorio
3. **Visualiza en Storybook Web** con `npm run storybook:web`
4. **Ajusta props** usando los controles interactivos
5. **Prueba en dispositivo** si es necesario con `toggle-storybook`
6. **Integra en tu app** cuando esté listo

## 🎯 Tips Pro

### Múltiples Variantes
```tsx
export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Disabled: Story = { args: { disabled: true } };
```

### Decoradores para Layout
```tsx
decorators: [
  (Story) => (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f0f0f0' }}>
      <Story />
    </View>
  ),
],
```

### Actions (Log de Eventos)
```tsx
import { fn } from 'storybook/test';

args: {
  onPress: fn(), // Se mostrará en el panel de acciones
}
```

## 🆘 Solución de Problemas

### No veo mis stories
1. Verifica que el archivo termine en `.stories.tsx`
2. Asegúrate de que esté en `atomic/` o `stories/`
3. Ejecuta `npm run storybook-generate` (para móvil)

### Error al cambiar entre modos
```bash
# Limpia caché y reinicia
npx expo start -c
```

### Storybook no inicia
```bash
# Reinstala dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📚 Recursos

- [Documentación Storybook](https://storybook.js.org/docs)
- [Storybook React Native](https://github.com/storybookjs/react-native)
- [Plantilla de Componente](../atomic/COMPONENT_TEMPLATE.md)
- [README Completo](./README.md)

## 🎉 Ejemplos Incluidos

Ya tienes estos ejemplos funcionando:

- `stories/Button.stories.tsx` - Botón con múltiples variantes
- `stories/Header.stories.tsx` - Header con usuario
- `stories/Page.stories.tsx` - Página completa
- `atomic/templates/splash/splash.stories.tsx` - Splash screen

¡Explora estos ejemplos en Storybook para aprender más!

