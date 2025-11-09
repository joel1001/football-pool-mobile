# ✅ Storybook - Configuración Completa

¡Storybook ha sido configurado exitosamente en tu proyecto de Football Pool!

## 🎯 ¿Qué se ha configurado?

### 1. Configuración Dual
- ✅ **Storybook Web**: Para desarrollo en el navegador
- ✅ **Storybook Native**: Para pruebas en dispositivos iOS/Android

### 2. Estructura de Archivos

```
.storybook/              # Config Web
├── main.ts              # Configuración principal
├── preview.ts           # Decoradores y parámetros globales
├── tsconfig.json        # TypeScript config
├── README.md            # Documentación completa
└── QUICK_START.md       # Guía rápida

.rnstorybook/            # Config Móvil
├── main.ts              # Configuración principal
├── preview.tsx          # Decoradores globales
├── index.ts             # Punto de entrada
├── storybook.requires.ts  # Auto-generado
└── stories/             # Stories de ejemplo

atomic/                  # Componentes Atomic Design
├── COMPONENT_TEMPLATE.md  # Plantilla para nuevos componentes
├── atoms/
├── molecules/
├── organisms/
└── templates/
    └── splash/          # Ejemplo completo
        ├── splash.tsx
        ├── splash.types.ts
        ├── splash.styles.ts
        ├── splash.stories.tsx
        └── index.ts

stories/                 # Stories de ejemplo existentes
├── Button.stories.tsx
├── Header.stories.tsx
└── Page.stories.tsx
```

### 3. Scripts NPM Configurados

```json
{
  "storybook": "storybook dev -p 6006",
  "storybook:web": "storybook dev -p 6006",
  "storybook:mobile": "npm run storybook-generate && expo start",
  "storybook:ios": "npm run storybook-generate && expo start --ios",
  "storybook:android": "npm run storybook-generate && expo start --android",
  "storybook-generate": "sb-rn-get-stories",
  "build-storybook": "storybook build",
  "toggle-storybook": "node ./scripts/toggle-storybook.js"
}
```

### 4. Addons Instalados

**Web:**
- `@storybook/addon-docs` - Documentación automática
- `@storybook/addon-controls` - Controles interactivos
- `@storybook/addon-actions` - Log de eventos

**Móvil:**
- `@storybook/addon-ondevice-controls` - Controles en dispositivo
- `@storybook/addon-ondevice-actions` - Log de eventos en dispositivo

### 5. Providers Configurados

Todos los componentes en Storybook tienen acceso a:
- ✅ Redux Store (`Provider`)
- ✅ App Context (`AppProvider`)
- ✅ Theme (`ThemeProvider` de React Navigation)
- ✅ View wrapper con padding

### 6. Componente de Ejemplo

Se creó un componente Splash completo con:
- `splash.tsx` - Componente funcional
- `splash.types.ts` - Types TypeScript
- `splash.styles.ts` - Estilos con StyleSheet
- `splash.stories.tsx` - 5 variantes en Storybook
- `index.ts` - Exportaciones limpias

## 🚀 Cómo Usar

### Opción 1: Storybook Web (Recomendado para desarrollo)

```bash
npm run storybook:web
```

Abre tu navegador en `http://localhost:6006`

### Opción 2: Storybook en Dispositivo/Emulador

```bash
# Cambia al modo Storybook
npm run toggle-storybook

# Inicia en iOS
npm run ios

# O en Android
npm run android

# Cuando termines, vuelve al modo app
npm run toggle-storybook
```

### Opción 3: Scripts Directos (Móvil)

```bash
# iOS con Storybook (genera y ejecuta)
npm run storybook:ios

# Android con Storybook
npm run storybook:android
```

**Nota:** Para las opciones 2 y 3, necesitas tener `package.json` con `"main": ".rnstorybook/index.ts"` activo. Usa `toggle-storybook` para cambiar automáticamente.

## 📝 Crear un Nuevo Componente con Story

1. **Crea la estructura de archivos:**

```bash
mkdir -p atomic/atoms/mi-componente
touch atomic/atoms/mi-componente/{index.ts,mi-componente.tsx,mi-componente.types.ts,mi-componente.styles.ts,mi-componente.stories.tsx}
```

2. **Sigue la plantilla** en `atomic/COMPONENT_TEMPLATE.md`

3. **Visualiza en Storybook:**

```bash
npm run storybook:web
```

## 🎨 Ejemplos Disponibles

Ya puedes ver estos ejemplos funcionando:

1. **Button** - `stories/Button.stories.tsx`
   - Primary, Secondary, Large, Small variants

2. **Header** - `stories/Header.stories.tsx`
   - Con usuario logueado y sin usuario

3. **Page** - `stories/Page.stories.tsx`
   - Página completa con header

4. **Splash** - `atomic/templates/splash/splash.stories.tsx`
   - Default, WithoutLoading, LightTheme, CustomColors, MinimalNoText

## 🔧 Troubleshooting

### No veo mis nuevas stories

**Web:**
- Reinicia el servidor de Storybook (`Ctrl+C` y `npm run storybook:web`)

**Móvil:**
- Ejecuta `npm run storybook-generate`
- Reinicia la app

### Error al cambiar entre modos

```bash
# Limpia la caché de Metro
npx expo start -c
```

### Storybook no inicia

```bash
# Reinstala dependencias
rm -rf node_modules package-lock.json
npm install
```

### Stories no se generan para móvil

Verifica que el archivo termine en `.stories.tsx` y esté en:
- `atomic/**/*.stories.tsx`
- `.rnstorybook/stories/**/*.stories.tsx`

## 📚 Documentación Adicional

- [Guía Rápida](.storybook/QUICK_START.md) - Inicio rápido en 3 pasos
- [README Completo](.storybook/README.md) - Documentación detallada
- [Plantilla de Componente](atomic/COMPONENT_TEMPLATE.md) - Template con ejemplos
- [Storybook Docs](https://storybook.js.org/docs) - Documentación oficial

## 🎯 Próximos Pasos

1. ✅ Ejecuta `npm run storybook:web` para ver los ejemplos
2. ✅ Explora los componentes existentes (Button, Header, Splash)
3. ✅ Crea tu primer componente siguiendo la plantilla
4. ✅ Prueba los controles interactivos
5. ✅ Experimenta con diferentes variantes
6. ✅ Prueba en dispositivo móvil con `toggle-storybook`

## 💡 Tips

- **Desarrollo rápido**: Usa Storybook Web para iterar rápido
- **Pruebas finales**: Usa Storybook Native para verificar en dispositivo
- **Documentación**: Los tags `autodocs` generan documentación automática
- **Controles**: Usa `argTypes` para controles interactivos
- **Actions**: Usa `fn()` de storybook/test para log de eventos

## ✨ Features Configurados

- ✅ Hot reload en web y móvil
- ✅ TypeScript completamente configurado
- ✅ Redux y Context API disponibles
- ✅ Theme de React Navigation activo
- ✅ Controles interactivos
- ✅ Panel de acciones/eventos
- ✅ Documentación automática
- ✅ Multiple viewports (web)
- ✅ Background switcher (web)
- ✅ Script para toggle entre modos

---

**¡Todo listo!** 🎉 Tu Storybook está completamente configurado y listo para usar.

Para comenzar ahora mismo:
```bash
npm run storybook:web
```

