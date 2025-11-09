# Especificaciones del Backend para Autenticación con Facebook

## 📥 Endpoint 1: Autenticación/Registro Social

### `POST /auth/social`

Este endpoint recibe el access token de Facebook, valida con Facebook, y crea o actualiza el usuario.

### Request Body:
```json
{
  "accessToken": "EAAKx...(Facebook Access Token)",
  "provider": "facebook"
}
```

### Flujo del Backend:

#### 1. Validar el Access Token con Facebook Graph API

```javascript
// Llamada al Graph API de Facebook
const facebookResponse = await fetch(
  `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture.type(large)`
);

const facebookData = await facebookResponse.json();

// Ejemplo de respuesta de Facebook:
{
  "id": "123456789",
  "name": "Joel Leon Gonzalez",
  "email": "joleogon174@gmail.com",
  "picture": {
    "data": {
      "url": "https://platform-lookaside.fbsbx.com/platform/profilepic/..."
    }
  }
}
```

#### 2. Verificar si el usuario ya existe

```javascript
// Buscar usuario por facebookId o email
let user = await User.findOne({ 
  $or: [
    { facebookId: facebookData.id },
    { email: facebookData.email }
  ]
});
```

#### 3. Escenario A: Usuario NUEVO (primer login con Facebook)

```javascript
// Separar nombre completo en name y lastName
const nameParts = facebookData.name.split(' ');
const firstName = nameParts[0];
const lastName = nameParts.slice(1).join(' ') || '';

// Crear usuario con campos mínimos
user = await User.create({
  facebookId: facebookData.id,
  email: facebookData.email,
  name: firstName,
  lastName: lastName,
  profilePicture: facebookData.picture.data.url,
  authProvider: 'facebook',
  
  // Campos requeridos que faltan - marcados como vacíos
  preferredTeams: [],
  preferredLeagues: [],
  birth: null,
  
  // Campos opcionales
  country: null,
  state: null,
  city: null,
  phone: null,
  zipcode: null,
  
  // Flag para indicar que el perfil está incompleto
  profileIncomplete: true,
  
  // NO tiene password porque usa OAuth
  password: null
});
```

#### 4. Escenario B: Usuario EXISTENTE (ya se registró antes)

```javascript
// Actualizar información de Facebook si cambió
user.profilePicture = facebookData.picture.data.url;
user.name = firstName;
user.lastName = lastName;

// Si no tiene facebookId, agregarlo (caso: se registró con email/password primero)
if (!user.facebookId) {
  user.facebookId = facebookData.id;
}

await user.save();
```

#### 5. Generar JWT Token

```javascript
const accessToken = generateJWT({
  userId: user._id,
  email: user.email,
  name: user.name
});

const refreshToken = generateRefreshToken({
  userId: user._id
});
```

### Response:

#### Si el perfil está completo (tiene preferredTeams y preferredLeagues):
```json
{
  "_id": "user_id",
  "email": "joleogon174@gmail.com",
  "name": "Joel",
  "lastName": "Leon Gonzalez",
  "birth": "1990-01-01",
  "preferredTeams": ["Team A", "Team B"],
  "preferredLeagues": ["Premier League"],
  "profilePicture": "https://...",
  "accessToken": "jwt_token_aqui",
  "refreshToken": "refresh_token_aqui",
  "tokenType": "Bearer",
  "expiresIn": "24h",
  "profileIncomplete": false
}
```

#### Si el perfil está incompleto (primer login, sin preferredTeams/Leagues):
```json
{
  "_id": "user_id",
  "email": "joleogon174@gmail.com",
  "name": "Joel",
  "lastName": "Leon Gonzalez",
  "preferredTeams": [],
  "preferredLeagues": [],
  "profilePicture": "https://...",
  "accessToken": "jwt_token_aqui",
  "refreshToken": "refresh_token_aqui",
  "tokenType": "Bearer",
  "expiresIn": "24h",
  "profileIncomplete": true,
  "missingFields": ["preferredTeams", "preferredLeagues", "birth"]
}
```

---

## 📥 Endpoint 2: Completar Perfil Social

### `PUT /auth/complete-profile`

Este endpoint permite al usuario completar su perfil después del login con Facebook.

### Headers:
```
Authorization: Bearer <jwt_token>
```

### Request Body:
```json
{
  "preferredTeams": ["Real Madrid", "Barcelona"],
  "preferredLeagues": ["La Liga", "Champions League"],
  "birth": "1990-05-15",
  "country": "US",
  "state": "CA",
  "city": "Los Angeles",
  "phone": "+1234567890",
  "zipcode": "90001"
}
```

**Campos requeridos:**
- `preferredTeams` (array de strings, mínimo 1)
- `preferredLeagues` (array de strings, mínimo 1)

**Campos opcionales:**
- `birth` (string, formato: YYYY-MM-DD)
- `country`, `state`, `city`, `phone`, `zipcode`

### Flujo del Backend:

```javascript
// 1. Obtener usuario del JWT
const userId = req.user.id; // Del middleware de autenticación

// 2. Validar que tenga los campos requeridos
if (!preferredTeams || preferredTeams.length === 0) {
  return res.status(400).json({ error: "preferredTeams is required" });
}
if (!preferredLeagues || preferredLeagues.length === 0) {
  return res.status(400).json({ error: "preferredLeagues is required" });
}

// 3. Actualizar usuario
const user = await User.findByIdAndUpdate(
  userId,
  {
    preferredTeams,
    preferredLeagues,
    birth,
    country,
    state,
    city,
    phone,
    zipcode,
    profileIncomplete: false // Marcar como completo
  },
  { new: true }
);
```

### Response:
```json
{
  "_id": "user_id",
  "email": "joleogon174@gmail.com",
  "name": "Joel",
  "lastName": "Leon Gonzalez",
  "birth": "1990-05-15",
  "preferredTeams": ["Real Madrid", "Barcelona"],
  "preferredLeagues": ["La Liga", "Champions League"],
  "country": "US",
  "state": "CA",
  "city": "Los Angeles",
  "profilePicture": "https://...",
  "accessToken": "jwt_token_aqui",
  "refreshToken": "refresh_token_aqui",
  "tokenType": "Bearer",
  "expiresIn": "24h",
  "profileIncomplete": false
}
```

---

## 🗄️ Modelo de Usuario Actualizado

```javascript
const UserSchema = new mongoose.Schema({
  // Identificadores
  _id: ObjectId,
  email: { type: String, required: true, unique: true },
  
  // Auth providers
  password: { type: String, required: false }, // null para OAuth
  facebookId: { type: String, unique: true, sparse: true },
  googleId: { type: String, unique: true, sparse: true },
  authProvider: { 
    type: String, 
    enum: ['email', 'facebook', 'google'],
    default: 'email'
  },
  
  // Información básica
  name: { type: String, required: true },
  lastName: { type: String, required: false },
  birth: { type: Date, required: false },
  profilePicture: { type: String, required: false },
  
  // Preferencias (requeridas para completar perfil)
  preferredTeams: [{ type: String }],
  preferredLeagues: [{ type: String }],
  
  // Ubicación (opcional)
  country: String,
  state: String,
  city: String,
  phone: String,
  zipcode: String,
  
  // Estado del perfil
  profileIncomplete: { type: Boolean, default: false },
  
  // Tokens
  refreshTokens: [String],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

---

## 🔐 Validaciones Importantes

1. **Email único:** El email debe ser único en la base de datos
2. **FacebookId único:** El facebookId debe ser único
3. **Campos requeridos para perfil completo:**
   - `preferredTeams` (mínimo 1 elemento)
   - `preferredLeagues` (mínimo 1 elemento)
4. **No password para OAuth:** Los usuarios que se registran con Facebook no tienen password

---

## 🚨 Manejo de Errores

### Error 400 - Bad Request
```json
{
  "error": "Invalid Facebook access token",
  "statusCode": 400
}
```

### Error 401 - Unauthorized
```json
{
  "error": "Facebook authentication failed",
  "statusCode": 401
}
```

### Error 409 - Conflict
```json
{
  "error": "Email already registered with different provider",
  "statusCode": 409,
  "existingProvider": "email"
}
```

### Error 500 - Server Error
```json
{
  "error": "Failed to authenticate with Facebook",
  "statusCode": 500
}
```

---

## 📊 Resumen de Flujo Completo

```
1. Usuario → Click en Facebook
2. Frontend → Abre Facebook Login
3. Facebook → Devuelve access token
4. Frontend → POST /auth/social { accessToken, provider: 'facebook' }
5. Backend → Valida con Facebook Graph API
6. Backend → Obtiene: id, name, email, picture
7. Backend → Busca usuario por facebookId o email

   CASO A: Usuario nuevo
   8a. Backend → Crea usuario con datos mínimos
   9a. Backend → Marca profileIncomplete: true
   10a. Backend → Devuelve JWT + profileIncomplete: true
   11a. Frontend → Muestra formulario para completar perfil
   12a. Usuario → Completa preferredTeams y preferredLeagues
   13a. Frontend → PUT /auth/complete-profile
   14a. Backend → Actualiza usuario, profileIncomplete: false
   15a. Backend → Devuelve JWT actualizado
   16a. Frontend → Redirige a app autenticado

   CASO B: Usuario existente con perfil completo
   8b. Backend → Actualiza foto de perfil si cambió
   9b. Backend → Devuelve JWT + profileIncomplete: false
   10b. Frontend → Redirige a app autenticado directamente
```

---

## ✅ Checklist de Implementación Backend

- [ ] Endpoint `POST /auth/social` creado
- [ ] Validación de access token con Facebook Graph API
- [ ] Manejo de usuarios nuevos vs existentes
- [ ] Campo `facebookId` agregado al modelo User
- [ ] Campo `authProvider` agregado al modelo User
- [ ] Campo `profileIncomplete` agregado al modelo User
- [ ] Campo `profilePicture` agregado al modelo User
- [ ] Password opcional (null para OAuth)
- [ ] Endpoint `PUT /auth/complete-profile` creado
- [ ] Middleware de autenticación JWT
- [ ] Validación de campos requeridos (preferredTeams, preferredLeagues)
- [ ] Manejo de errores apropiado
- [ ] Tests de integración



