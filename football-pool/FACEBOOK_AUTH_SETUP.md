# Configuración de Autenticación con Facebook

## Pasos para configurar Facebook Login

### 1. Crear una aplicación en Facebook Developers

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Crea una nueva aplicación o selecciona una existente
3. En el panel de control, ve a **Settings** > **Basic**
4. Copia tu **App ID** (lo necesitarás en los siguientes pasos)

### 2. Configurar Facebook Login

1. En el panel de tu app, ve a **Add Product** y selecciona **Facebook Login**
2. Selecciona la plataforma que estás usando (iOS, Android, o Web)
3. Configura los **Valid OAuth Redirect URIs**:
   - Para desarrollo: `https://auth.expo.io/@your-username/football-pool`
   - Para producción: Agrega tu dominio personalizado

### 3. Actualizar el código con tu Facebook App ID

#### Archivo: `services/auth/facebook-auth.ts`

Reemplaza `YOUR_FACEBOOK_APP_ID` con tu Facebook App ID real:

```typescript
export const FACEBOOK_APP_ID = 'TU_FACEBOOK_APP_ID_AQUI';
```

#### Archivo: `app.json`

Reemplaza todos los `[YOUR_FACEBOOK_APP_ID]` con tu Facebook App ID:

```json
"facebookScheme": "fbTU_APP_ID",
"facebookAppId": "TU_APP_ID",
```

Y en las secciones de iOS:

```json
"CFBundleURLSchemes": ["fbTU_APP_ID", "football-pool"]
"FacebookAppID": "TU_APP_ID"
```

### 4. Configurar el Backend

Tu backend debe tener un endpoint para manejar la autenticación social:

**Endpoint:** `POST /auth/social`

**Body:**
```json
{
  "accessToken": "facebook_access_token",
  "provider": "facebook"
}
```

**Respuesta esperada:**
```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "tokenType": "Bearer",
  "expiresIn": "24h",
  ...
}
```

El backend debe:
1. Validar el access token con Facebook Graph API
2. Obtener la información del usuario desde Facebook
3. Crear o actualizar el usuario en la base de datos
4. Retornar un JWT token para la aplicación

### 5. Probar la integración

1. Ejecuta `npm start` o `expo start`
2. Abre la app en tu dispositivo o emulador
3. Haz clic en el icono de Facebook en la pantalla de login
4. Se abrirá el navegador para la autenticación de Facebook
5. Después de autorizar, deberías ser redirigido de vuelta a la app y autenticado

### 6. Configuración para producción

#### iOS
1. En Facebook Developers, agrega tu **Bundle ID** (`com.footballpool.app`)
2. Configura el archivo `Info.plist` con tu App ID (ya está en `app.json`)

#### Android
1. En Facebook Developers, agrega tu **Package Name** (`com.footballpool.app`)
2. Genera un hash de tu keystore:
   ```bash
   keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
   ```
3. Agrega este hash en la configuración de Facebook

### 7. Permisos de Facebook

La aplicación solicita los siguientes permisos:
- `public_profile`: Nombre e ID del usuario
- `email`: Dirección de email del usuario

Si necesitas permisos adicionales, modifica el archivo `facebook-auth.ts` agregando el campo `scopes` en `useAuthRequest`.

### Troubleshooting

**Error: "Invalid redirect URI"**
- Verifica que el redirect URI en Facebook Developers coincida con tu configuración

**Error: "App ID no válido"**
- Verifica que hayas reemplazado todos los `YOUR_FACEBOOK_APP_ID` con tu App ID real

**Error: "Cannot connect to server"**
- Verifica que tu backend tenga el endpoint `/auth/social` configurado
- Verifica que el backend esté corriendo y accesible

## Recursos adicionales

- [Facebook Login for React Native](https://docs.expo.dev/guides/authentication/#facebook)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)


