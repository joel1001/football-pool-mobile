# 🔧 Facebook Login Troubleshooting

## ⚠️ Error: "Sin URI de redireccionamiento"

### 📋 Checklist de Solución:

#### 1️⃣ **Configurar Facebook Developers Console**

Ve a: https://developers.facebook.com/apps/764260709993014

**A. Settings → Basic:**
- App Domains: `localhost`
- App Mode: `Development`

**B. Facebook Login → Settings:**

En "Valid OAuth Redirect URIs", agrega:

```
football-pool://redirect
fb764260709993014://redirect
http://localhost:19000/
http://localhost:19006/
exp://localhost:19000/
exp://localhost:19006/
http://192.168.0.2:19000/
http://192.168.0.2:19006/
```

**C. Roles → Test Users:**
- Agrega tu email como Test User

---

#### 2️⃣ **Verificar Configuración Local**

**En tu consola de Expo:**
1. Busca el log: `📱 Facebook Redirect URI: ...`
2. Copia el URI exacto que aparece
3. Agrégalo a Facebook Developers Console si es diferente

---

#### 3️⃣ **Reiniciar Todo**

```bash
# 1. Detén Expo
Ctrl + C

# 2. Limpia cache
expo start --clear

# 3. En iOS Simulator o Android Emulator
# Desinstala y vuelve a instalar la app
```

---

## 🐛 Otros Errores Comunes:

### Error: "App ID inválido"
- Verifica que `FACEBOOK_APP_ID` en `facebook-auth.ts` sea: `764260709993014`
- Verifica que `app.json` tenga: `"facebookAppId": "764260709993014"`

### Error: "Permission denied"
- Asegúrate de solicitar permisos: `scopes: ['public_profile', 'email']`
- En Facebook Developers, activa: `email` permission

### Error: "Connection refused"
- Verifica que el backend esté corriendo: `http://localhost:8080`
- Prueba el endpoint: `curl http://localhost:8080/football-pool/v1/api/auth`

---

## ✅ Solución Alternativa (Proxy de Expo)

Si los URIs personalizados no funcionan, usa el proxy de Expo:

**En `facebook-auth.ts`:**

```typescript
const redirectUri = makeRedirectUri({
  useProxy: true  // Usa proxy de Expo
});
```

Esto generará un URI como:
```
https://auth.expo.io/@your-username/your-slug
```

Agrégalo a Facebook Developers Console.

---

## 🧪 Testing Paso a Paso:

1. **Inicia Expo:**
   ```bash
   expo start --clear
   ```

2. **Busca en consola:**
   ```
   📱 Facebook Redirect URI: football-pool://redirect
   🔑 Facebook App ID: 764260709993014
   ```

3. **Verifica que el URI esté en Facebook:**
   - Ve a Facebook Login → Settings
   - Busca el URI en "Valid OAuth Redirect URIs"

4. **Presiona el botón de Facebook en la app**

5. **Observa la consola:**
   - Debería abrir el navegador
   - Debería redirigir de vuelta a la app
   - Debería aparecer: `✅ Facebook token received`

---

## 📱 Links Importantes:

- **Tu App en Facebook:** https://developers.facebook.com/apps/764260709993014
- **Facebook Login Settings:** https://developers.facebook.com/apps/764260709993014/fb-login/settings/
- **Test Users:** https://developers.facebook.com/apps/764260709993014/roles/test-users/

---

## 💡 Tips:

- Los cambios en Facebook pueden tardar 2-3 minutos en aplicarse
- Siempre reinicia Expo después de cambiar configuración
- Verifica que estés en la misma red WiFi (IP: 192.168.0.2)
- En producción, necesitarás HTTPS y URIs de producción

