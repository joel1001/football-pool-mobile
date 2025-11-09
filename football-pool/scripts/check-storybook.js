#!/usr/bin/env node

/**
 * Script para verificar la configuración de Storybook
 */

const fs = require('fs');
const path = require('path');
const checks = [];

// 1. Verificar archivos de configuración Web
const webMainPath = path.join(__dirname, '..', '.storybook', 'main.ts');
const webPreviewPath = path.join(__dirname, '..', '.storybook', 'preview.ts');

if (fs.existsSync(webMainPath)) {
  checks.push({ name: '✅ .storybook/main.ts', status: true });
} else {
  checks.push({ name: '❌ .storybook/main.ts', status: false });
}

if (fs.existsSync(webPreviewPath)) {
  checks.push({ name: '✅ .storybook/preview.ts', status: true });
} else {
  checks.push({ name: '❌ .storybook/preview.ts', status: false });
}

// 2. Verificar archivos de configuración Native
const nativeMainPath = path.join(__dirname, '..', '.rnstorybook', 'main.ts');
const nativePreviewPath = path.join(__dirname, '..', '.rnstorybook', 'preview.tsx');
const nativeIndexPath = path.join(__dirname, '..', '.rnstorybook', 'index.ts');

if (fs.existsSync(nativeMainPath)) {
  checks.push({ name: '✅ .rnstorybook/main.ts', status: true });
} else {
  checks.push({ name: '❌ .rnstorybook/main.ts', status: false });
}

if (fs.existsSync(nativePreviewPath)) {
  checks.push({ name: '✅ .rnstorybook/preview.tsx', status: true });
} else {
  checks.push({ name: '❌ .rnstorybook/preview.tsx', status: false });
}

if (fs.existsSync(nativeIndexPath)) {
  checks.push({ name: '✅ .rnstorybook/index.ts', status: true });
} else {
  checks.push({ name: '❌ .rnstorybook/index.ts', status: false });
}

// 3. Verificar package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const requiredScripts = ['storybook', 'storybook-generate', 'build-storybook'];
const hasAllScripts = requiredScripts.every(script => packageJson.scripts[script]);

if (hasAllScripts) {
  checks.push({ name: '✅ Scripts de NPM configurados', status: true });
} else {
  checks.push({ name: '❌ Scripts de NPM configurados', status: false });
}

// 4. Verificar dependencias
const requiredDeps = [
  '@storybook/react-native',
  '@storybook/react-native-web-vite',
  '@storybook/addon-ondevice-controls',
  '@storybook/addon-ondevice-actions',
];

const allDepsInstalled = requiredDeps.every(dep => 
  packageJson.devDependencies && packageJson.devDependencies[dep]
);

if (allDepsInstalled) {
  checks.push({ name: '✅ Dependencias de Storybook instaladas', status: true });
} else {
  checks.push({ name: '❌ Dependencias de Storybook instaladas', status: false });
}

// 5. Verificar estructura de carpetas
const atomicPath = path.join(__dirname, '..', 'atomic');
const storiesPath = path.join(__dirname, '..', 'stories');

if (fs.existsSync(atomicPath)) {
  checks.push({ name: '✅ Carpeta atomic/ existe', status: true });
} else {
  checks.push({ name: '❌ Carpeta atomic/ existe', status: false });
}

if (fs.existsSync(storiesPath)) {
  checks.push({ name: '✅ Carpeta stories/ existe', status: true });
} else {
  checks.push({ name: '❌ Carpeta stories/ existe', status: false });
}

// 6. Verificar modo actual (App vs Storybook)
const currentMain = packageJson.main;
const isStorybookMode = currentMain === '.rnstorybook/index.ts';

if (isStorybookMode) {
  checks.push({ name: '📱 Modo STORYBOOK activo', status: true, warning: true });
} else {
  checks.push({ name: '📱 Modo APP activo', status: true, info: true });
}

// Mostrar resultados
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('RESULTADOS DE VERIFICACIÓN');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

checks.forEach(check => {
  if (check.warning) {
    console.log(`⚠️  ${check.name}`);
  } else if (check.info) {
    console.log(`ℹ️  ${check.name}`);
  } else {
    console.log(check.name);
  }
});

const allPassed = checks.filter(c => !c.warning && !c.info).every(check => check.status);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (allPassed) {
  console.log('✨ ¡Todo está configurado correctamente!\n');
  console.log('Comandos disponibles:');
  console.log('  npm run storybook:web      - Storybook en navegador');
  console.log('  npm run storybook:ios      - Storybook en iOS');
  console.log('  npm run storybook:android  - Storybook en Android');
  console.log('  npm run toggle-storybook   - Cambiar entre modos\n');
  
  if (isStorybookMode) {
    console.log('⚠️  NOTA: Estás en modo STORYBOOK');
    console.log('   Para volver al modo app: npm run toggle-storybook\n');
  }
} else {
  console.log('❌ Hay problemas en la configuración.\n');
  console.log('Ejecuta estos comandos para arreglar:');
  console.log('  npm install');
  console.log('  npm run storybook-generate\n');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

