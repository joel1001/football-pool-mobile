# Football Pool Mobile App ⚽

Este es un proyecto de [Expo](https://expo.dev) con React Native que incluye configuración completa de Storybook para desarrollo de componentes.

## 🚀 Inicio Rápido

1. Instalar dependencias

   ```bash
   npm install
   ```

2. Iniciar la app

   ```bash
   npm start
   # o
   npx expo start
   ```

3. Ver Storybook (Opcional)

   ```bash
   npm run storybook:web
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## 📚 Storybook

Este proyecto tiene Storybook configurado para desarrollo de componentes aislados.

### Ver en Navegador (Recomendado)
```bash
npm run storybook:web
```
Abre `http://localhost:6006` en tu navegador.

### Ver en Dispositivo/Emulador
```bash
npm run toggle-storybook  # Cambiar al modo Storybook
npm run ios               # o npm run android
npm run toggle-storybook  # Volver al modo app
```

### Comandos Disponibles
- `npm run storybook:web` - Storybook en navegador
- `npm run storybook:ios` - Storybook en iOS
- `npm run storybook:android` - Storybook en Android
- `npm run check-storybook` - Verificar configuración
- `npm run toggle-storybook` - Cambiar entre app/storybook
- `npm run storybook-generate` - Regenerar stories para móvil

### Documentación
- [Guía Rápida](.storybook/QUICK_START.md) - Primeros pasos con Storybook
- [README Completo](.storybook/README.md) - Documentación detallada
- [Plantilla de Componente](atomic/COMPONENT_TEMPLATE.md) - Crear nuevos componentes
- [Setup Completo](STORYBOOK_SETUP.md) - Información de configuración

## 🏗️ Estructura del Proyecto

```
football-pool/
├── app/              # Rutas y pantallas (Expo Router)
├── atomic/           # Componentes Atomic Design
│   ├── atoms/        # Componentes básicos
│   ├── molecules/    # Combinaciones simples
│   ├── organisms/    # Secciones complejas
│   └── templates/    # Layouts completos
├── stories/          # Stories de ejemplo
├── redux/            # Redux store y slices
├── context/          # React Context providers
├── constants/        # Constantes y temas
├── hooks/            # Custom hooks
├── .storybook/       # Config Storybook Web
└── .rnstorybook/     # Config Storybook Native
```

## 🎨 Atomic Design

Los componentes siguen la metodología Atomic Design:
- **Atoms**: Botones, inputs, iconos, texto
- **Molecules**: Campos de formulario, cards, items
- **Organisms**: Headers, formularios, listas
- **Templates**: Páginas completas, layouts

## 🧪 Scripts Disponibles

```bash
# App
npm start              # Iniciar Expo
npm run ios            # Abrir en iOS
npm run android        # Abrir en Android
npm run web            # Abrir en web

# Storybook
npm run storybook:web       # Storybook en navegador
npm run storybook:ios       # Storybook en iOS
npm run storybook:android   # Storybook en Android
npm run check-storybook     # Verificar configuración
npm run toggle-storybook    # Cambiar modo app/storybook

# Desarrollo
npm run lint           # Ejecutar ESLint
npm run reset-project  # Reiniciar proyecto
```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
