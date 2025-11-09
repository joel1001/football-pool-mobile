# 📋 Resumen Rápido: Backend para Facebook Auth

## 🎯 Lo que el Backend RECIBE del Frontend

```json
POST /auth/social
{
  "accessToken": "EAAKx...",
  "provider": "facebook"
}
```

## 🔍 Lo que el Backend OBTIENE de Facebook

Con el `accessToken`, el backend hace esto:

```javascript
GET https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture.type(large)

// Facebook devuelve:
{
  "id": "facebook_user_id_123",
  "name": "Joel Leon Gonzalez",
  "email": "joleogon174@gmail.com",
  "picture": {
    "data": {
      "url": "https://graph.facebook.com/..."
    }
  }
}
```

## ✅ Campos que el Backend PUEDE OBTENER automáticamente

| Campo | Fuente | Disponible |
|-------|--------|------------|
| `email` | Facebook | ✅ Sí |
| `name` | Facebook (parte 1 de "Joel Leon") | ✅ Sí |
| `lastName` | Facebook (parte 2 de "Leon Gonzalez") | ✅ Sí |
| `profilePicture` | Facebook | ✅ Sí |
| `facebookId` | Facebook | ✅ Sí |

## ❌ Campos que FALTAN (el usuario debe completar después)

| Campo | Requerido | Nota |
|-------|-----------|------|
| `preferredTeams` | ⚠️ SÍ | **Requerido en tu Sign Up** |
| `preferredLeagues` | ⚠️ SÍ | **Requerido en tu Sign Up** |
| `birth` | No | Opcional |
| `country` | No | Opcional |
| `state` | No | Opcional |
| `city` | No | Opcional |
| `phone` | No | Opcional |
| `zipcode` | No | Opcional |
| `password` | N/A | No aplica para OAuth |

## 📤 Lo que el Backend debe DEVOLVER

### Primera vez (perfil incompleto):
```json
{
  "_id": "user_id",
  "email": "joleogon174@gmail.com",
  "name": "Joel",
  "lastName": "Leon Gonzalez",
  "preferredTeams": [],
  "preferredLeagues": [],
  "profilePicture": "https://...",
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "tokenType": "Bearer",
  "expiresIn": "24h",
  "profileIncomplete": true,  // ⚠️ IMPORTANTE
  "missingFields": ["preferredTeams", "preferredLeagues"]
}
```

### Usuario que ya completó su perfil:
```json
{
  "_id": "user_id",
  "email": "joleogon174@gmail.com",
  "name": "Joel",
  "lastName": "Leon Gonzalez",
  "birth": "1990-01-01",
  "preferredTeams": ["Real Madrid", "Barcelona"],
  "preferredLeagues": ["La Liga"],
  "profilePicture": "https://...",
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token",
  "tokenType": "Bearer",
  "expiresIn": "24h",
  "profileIncomplete": false  // ✅ Perfil completo
}
```

## 🔄 Endpoint adicional para completar perfil

```json
PUT /auth/complete-profile
Headers: { Authorization: "Bearer jwt_token" }

Body:
{
  "preferredTeams": ["Real Madrid", "Barcelona"],
  "preferredLeagues": ["La Liga", "Champions League"],
  "birth": "1990-01-01",  // opcional
  "country": "US",  // opcional
  "state": "CA",  // opcional
  "city": "LA",  // opcional
  "phone": "+123",  // opcional
  "zipcode": "90001"  // opcional
}

Response: (mismo formato que /auth/social pero con profileIncomplete: false)
```

## 🗄️ Campos nuevos en el modelo User

```javascript
{
  // Campos nuevos para OAuth
  facebookId: String,  // ID único de Facebook
  authProvider: String,  // 'email' | 'facebook' | 'google'
  profilePicture: String,  // URL de la foto
  profileIncomplete: Boolean,  // true si faltan preferredTeams/Leagues
  
  // Password ahora es opcional
  password: String | null  // null para usuarios OAuth
}
```

## ⚡ Flujo Rápido

1. Frontend envía `accessToken` de Facebook
2. Backend valida con Facebook Graph API
3. Backend obtiene: `id`, `name`, `email`, `picture`
4. Backend busca/crea usuario
5. Backend genera JWT
6. Backend devuelve:
   - Si es nuevo → `profileIncomplete: true`
   - Si ya existe con datos completos → `profileIncomplete: false`
7. Frontend:
   - Si `profileIncomplete: true` → Muestra formulario para preferredTeams/Leagues
   - Si `profileIncomplete: false` → Login directo ✅



