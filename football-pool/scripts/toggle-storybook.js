#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const APP_ENTRY = 'expo-router/entry';
const STORYBOOK_ENTRY = '.rnstorybook/index.ts';

const currentMain = packageJson.main;
const isAppMode = currentMain === APP_ENTRY;

if (isAppMode) {
  packageJson.main = STORYBOOK_ENTRY;
  console.log('✅ Cambiado a modo STORYBOOK');
  console.log('📱 Ahora puedes ejecutar:');
  console.log('   npm run ios');
  console.log('   npm run android');
  console.log('');
  console.log('⚠️  Para volver al modo app, ejecuta: npm run toggle-storybook');
} else {
  packageJson.main = APP_ENTRY;
  console.log('✅ Cambiado a modo APP');
  console.log('📱 Tu app está de vuelta al modo normal');
  console.log('');
  console.log('💡 Para volver a Storybook, ejecuta: npm run toggle-storybook');
}

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

