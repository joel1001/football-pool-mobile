# 🐛 Reporte de Error: 401 Unauthorized en Endpoint `/groups/{groupId}/matches`

## 📋 Resumen del Problema

El frontend está recibiendo un error **401 Unauthorized** al intentar acceder al endpoint `GET /groups/{groupId}/matches`, aunque el token JWT se está enviando correctamente en el header.

---

## 🔍 Detalles del Error

### Endpoint Afectado
```
GET /football-pool/v1/api/groups/{groupId}/matches
```

### Request Details
- **Method:** `GET`
- **URL Completa:** `http://localhost:8080/football-pool/v1/api/groups/691a192a53148e413d0e49b0/matches`
- **Headers Enviados:**
  ```
  Authorization: Bearer {jwt_token}
  Content-Type: application/json
  ```
- **Token Status:** ✅ El token se está enviando (verificado en logs del frontend)

### Response del Backend
```json
{
  "error": "Unauthorized",
  "message": "Authentication required. Please provide a valid JWT token.",
  "path": "/error",
  "status": 401
}
```

### Headers de Respuesta
```
cache-control: no-cache, no-store, max-age=0, must-revalidate
content-type: application/json;charset=ISO-8859-1
status: 401
```

---

## 🔎 Análisis del Problema

### ✅ Lo que SÍ funciona:
1. **Token se envía correctamente:** Los logs del frontend confirman que el header `Authorization: Bearer {token}` se está agregando
2. **Otros endpoints funcionan:** El endpoint `GET /groups` funciona correctamente con el mismo token
3. **Formato del token:** El token tiene el formato correcto `Bearer {jwt_token}`

### ❌ Lo que NO funciona:
1. **Endpoint específico rechaza el token:** Solo `/groups/{groupId}/matches` retorna 401
2. **Path en error response:** El `path` en la respuesta es `/error` en lugar del path real del endpoint

---

## 🤔 Posibles Causas

### 1. **Endpoint no configurado en Gateway**
   - El endpoint `/groups/{groupId}/matches` puede no estar registrado en el Gateway Service
   - El Gateway puede estar redirigiendo a un handler de error genérico

### 2. **JWT Secret no coincide**
   - El `groups_service` puede estar usando un `jwt.secret` diferente al `auth_service`
   - El token generado por `auth_service` no puede ser validado por `groups_service`

### 3. **Filtro de seguridad en Gateway**
   - El Gateway puede tener un filtro de seguridad que bloquea rutas específicas
   - La ruta `/groups/{groupId}/matches` puede no estar en la whitelist de rutas permitidas

### 4. **Token expirado**
   - Aunque menos probable (otros endpoints funcionan), el token puede haber expirado justo antes de esta request

### 5. **Endpoint no implementado**
   - El endpoint puede no estar implementado en el `groups_service`
   - El Gateway puede estar retornando un error genérico

---

## 📊 Comparación con Otros Endpoints

### ✅ Endpoints que SÍ funcionan:
- `GET /groups` → ✅ Funciona correctamente
- `GET /groups/{groupId}` → ✅ Funciona correctamente (asumido, no probado)
- `POST /groups` → ✅ Funciona correctamente

### ❌ Endpoint que NO funciona:
- `GET /groups/{groupId}/matches` → ❌ Retorna 401 Unauthorized

---

## 🔧 Información Técnica para Debugging

### Frontend (React Native)
- **Base URL:** `http://localhost:8080/football-pool/v1/api/`
- **Token Source:** `AsyncStorage` → `@football_pool:auth_data`
- **Token Format:** `Bearer {jwt_token}`
- **Axios Interceptor:** Configura el token automáticamente en cada request

### Request Log del Frontend
```
🌐 API REQUEST: {
  "method": "GET",
  "url": "http://localhost:8080/football-pool/v1/api/groups/691a192a53148e413d0e49b0/matches",
  "hasToken": true,
  "token": "Bearer eyJhbGciOiJIU..."
}
```

### Error Log del Frontend
```
❌ API ERROR: {
  "status": 401,
  "url": "groups/691a192a53148e413d0e49b0/matches",
  "data": {
    "error": "Unauthorized",
    "message": "Authentication required. Please provide a valid JWT token.",
    "path": "/error"
  }
}
```

---

## 🎯 Acciones Recomendadas para el Backend

### 1. Verificar Gateway Configuration
   - ✅ Confirmar que la ruta `/groups/{groupId}/matches` está registrada en el Gateway
   - ✅ Verificar que el Gateway está enrutando correctamente a `groups_service`

### 2. Verificar Groups Service
   - ✅ Confirmar que el endpoint `GET /groups/{groupId}/matches` está implementado
   - ✅ Verificar que el endpoint tiene la anotación `@PreAuthorize` o similar configurada correctamente
   - ✅ Verificar que el filtro de seguridad permite esta ruta

### 3. Verificar JWT Configuration
   - ✅ Confirmar que `groups_service` usa el mismo `jwt.secret` que `auth_service`
   - ✅ Verificar que el JWT decoder está configurado correctamente en `groups_service`
   - ✅ Verificar que el token se está validando correctamente

### 4. Verificar Logs del Backend
   - Revisar logs del Gateway Service cuando se recibe esta request
   - Revisar logs del Groups Service para ver si la request llega al servicio
   - Verificar si hay algún error de validación JWT en los logs

### 5. Probar con Postman/curl
   ```bash
   curl -X GET \
     "http://localhost:8080/football-pool/v1/api/groups/691a192a53148e413d0e49b0/matches" \
     -H "Authorization: Bearer {jwt_token}" \
     -H "Content-Type: application/json"
   ```

---

## 📝 Notas Adicionales

1. **El mismo token funciona para otros endpoints:** Esto sugiere que el problema es específico del endpoint `/matches`, no del token en sí.

2. **Path en error response:** El `path: "/error"` sugiere que el Gateway está retornando un error genérico, posiblemente porque la ruta no está configurada.

3. **Fallback implementado:** El frontend ahora tiene un fallback que extrae los matches del objeto `Group` completo si el endpoint falla, pero esto es una solución temporal.

---

## 🔗 Archivos Relacionados

- **Frontend Service:** `services/groups/group-service.ts` (línea 139-157)
- **Frontend Component:** `app/competition-groups.tsx` (línea 67-148)
- **Axios Config:** `services/services-config.ts`

---

## 🔧 Mejoras Implementadas en el Frontend

### 1. Logging Detallado
- ✅ Agregado logging completo en `getGroupMatches` con información del request
- ✅ Logging mejorado en el interceptor de Axios con detalles del token (userId, email, expiración)
- ✅ Logs de éxito y error con información estructurada

### 2. Verificación de Token
- ✅ Verificación automática del formato del token (`Bearer {token}`)
- ✅ Corrección automática si el token no tiene el prefijo `Bearer`
- ✅ Validación del token antes de hacer requests

### 3. Fallback Mejorado
- ✅ Función dedicada `extractMatchesFromGroup` para extraer matches del objeto Group
- ✅ Soporte para filtros (stageId, groupLetter, status) en el fallback
- ✅ Segundo nivel de fallback: si el grupo no está en memoria, intenta obtenerlo completo
- ✅ Logging claro de la fuente de los datos (API endpoint vs fallback)

### 4. Manejo de Errores
- ✅ Logging estructurado de errores con status, URL, y mensaje
- ✅ Alertas específicas para errores 401 (sesión expirada)
- ✅ Información detallada para debugging

---

## 📞 Información de Contacto

Si necesitas más información o logs adicionales del frontend, por favor solicítalos.

**Fecha del Reporte:** 2025-11-18
**Endpoint Afectado:** `GET /groups/{groupId}/matches`
**Status Code:** 401 Unauthorized
**Última Actualización:** 2025-11-18 (Mejoras de debugging implementadas)

