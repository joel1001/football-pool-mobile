# 🎉 ¡Bienvenido a Storybook!

## 🚀 Empieza en 30 Segundos

### Opción 1: Ver en tu Navegador (Más Fácil)

```bash
npm run storybook:web
```

Luego abre: `http://localhost:6006` 🌐

### Opción 2: Ver en tu Dispositivo

```bash
npm run toggle-storybook
npm run ios  # o android
```

---

## 📚 ¿Qué Puedo Ver?

Ya tienes **4 componentes de ejemplo** listos para explorar:

1. **Button** - Botón con variantes (Primary, Secondary, Large, Small)
2. **Header** - Header con usuario
3. **Page** - Página completa de ejemplo
4. **Splash** - Pantalla de splash (¡Nuevo! ✨)

---

## 🎨 ¿Cómo Creo mi Primer Componente?

### Paso 1: Crea los archivos

```bash
mkdir -p atomic/atoms/mi-boton
```

### Paso 2: Usa la plantilla

Abre: `atomic/COMPONENT_TEMPLATE.md` y sigue el ejemplo 📖

### Paso 3: Crea el componente

```typescript
// atomic/atoms/mi-boton/mi-boton.tsx
export const MiBoton = ({ label }) => (
  <TouchableOpacity>
    <Text>{label}</Text>
  </TouchableOpacity>
);
```

### Paso 4: Crea la story

```typescript
// atomic/atoms/mi-boton/mi-boton.stories.tsx
export default {
  title: 'Atoms/MiBoton',
  component: MiBoton,
};

export const Default = {
  args: { label: '¡Hola!' }
};
```

### Paso 5: ¡Míralo en Storybook!

Ya aparecerá automáticamente en Storybook Web 🎉

Para móvil, ejecuta: `npm run storybook-generate`

---

## 🔧 Comandos Importantes

| Comando | ¿Para qué? |
|---------|-----------|
| `npm run storybook:web` | Ver Storybook en navegador |
| `npm run storybook:ios` | Ver en iOS |
| `npm run storybook:android` | Ver en Android |
| `npm run toggle-storybook` | Cambiar entre app y Storybook |
| `npm run check-storybook` | Verificar que todo funciona |

---

## 📖 Documentación Completa

¿Necesitas más detalles?

- **[Guía Rápida](.storybook/QUICK_START.md)** ⚡ - 3 pasos para empezar
- **[README Completo](.storybook/README.md)** 📚 - Todo sobre Storybook
- **[Plantilla de Componente](atomic/COMPONENT_TEMPLATE.md)** 🎨 - Cómo crear componentes
- **[Setup Completo](STORYBOOK_SETUP.md)** 🔧 - Qué se configuró
- **[Checklist](STORYBOOK_CHECKLIST.md)** ✅ - Estado de la configuración

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar Storybook y mi app al mismo tiempo?

**Web:** ¡Sí! Storybook Web corre en puerto 6006, no interfiere con tu app.

**Móvil:** No directamente. Usa `toggle-storybook` para cambiar entre modos.

### ¿Cómo vuelvo al modo app normal?

```bash
npm run toggle-storybook
```

Este comando cambia automáticamente entre los dos modos.

### ¿Mis stories no aparecen en móvil?

Ejecuta:
```bash
npm run storybook-generate
```

Y reinicia la app.

### ¿Cómo verifico que todo funciona?

```bash
npm run check-storybook
```

Este comando revisa toda la configuración.

### ¿Dónde pongo mis componentes?

Sigue Atomic Design en la carpeta `atomic/`:

```
atomic/
├── atoms/       ← Botones, inputs básicos
├── molecules/   ← Campos de formulario, cards
├── organisms/   ← Headers, forms complejos
└── templates/   ← Páginas completas
```

---

## 🎯 Tips Pro

1. **Usa Storybook Web** para desarrollo rápido
2. **Prueba en dispositivo** solo cuando sea necesario
3. **Crea múltiples variantes** de cada componente
4. **Usa controles** para probar props interactivamente
5. **Documenta con comentarios** JSDoc en tus props

---

## 💡 Ejemplo Completo Mínimo

```typescript
// mi-componente.tsx
export const MiComponente = ({ texto }) => (
  <Text>{texto}</Text>
);

// mi-componente.stories.tsx
import { MiComponente } from './mi-componente';

export default {
  title: 'Atoms/MiComponente',
  component: MiComponente,
};

export const Default = {
  args: { texto: '¡Hola Mundo!' }
};
```

¡Eso es todo! Ya tienes una story funcionando 🎉

---

## 🆘 ¿Necesitas Ayuda?

1. Lee [QUICK_START.md](.storybook/QUICK_START.md)
2. Revisa [COMPONENT_TEMPLATE.md](atomic/COMPONENT_TEMPLATE.md)
3. Ejecuta `npm run check-storybook` para verificar

---

## 🎊 ¡Ahora sí, Manos a la Obra!

```bash
npm run storybook:web
```

**¡Disfruta desarrollando tus componentes!** 🚀

---

_Configuración realizada con ❤️ - Todo listo para usar_

