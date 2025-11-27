# 🐛 Reporte: Error de Conversión de Tipo en GET /groups

## 📋 Resumen

El endpoint `GET /groups` está fallando con un error de conversión de tipo cuando intenta retornar los grupos del usuario después de crear un nuevo grupo.

---

## 🔍 Error

### Error del Backend:
```
Error retrieving groups: No converter found capable of converting from type [java.util.Date] to type [java.lang.Integer]
```

### Status Code:
```
500 Internal Server Error
```

### Endpoint:
```
GET /groups
```

### Headers:
```
Authorization: Bearer {jwt_token}
```

---

## 📝 Contexto

Este error ocurre cuando:
1. El usuario crea un nuevo grupo exitosamente
2. El frontend intenta recargar la lista de grupos llamando a `GET /groups`
3. El backend falla al intentar convertir un campo `Date` a `Integer`

---

## 🔍 Análisis del Error

El error indica que el backend está intentando convertir un campo de tipo `java.util.Date` a `java.lang.Integer`, lo cual es imposible sin una conversión explícita.

### Posibles Causas:

1. **Campo de fecha mal mapeado en el DTO:**
   - Un campo que debería ser `Date` está siendo tratado como `Integer` en algún lugar del código
   - O viceversa: un campo que debería ser `Integer` está siendo tratado como `Date`

2. **Problema en el mapeo de entidad a DTO:**
   - El mapeo entre la entidad `Group` y el DTO de respuesta puede tener un error de tipo
   - Posibles campos afectados:
     - `createdAt` (Date)
     - `updatedAt` (Date)
     - `enabledAt` (Date)
     - `poolAvailableDay` (Date)
     - `poolDisabledDate` (Date)
     - `paymentDeadline` (Date)
     - Cualquier campo numérico que esté siendo interpretado como Date

3. **Problema en la consulta de base de datos:**
   - La consulta puede estar retornando un campo Date cuando se espera un Integer
   - O un campo Integer cuando se espera un Date

---

## 🎯 Campos Potencialmente Afectados

Basándome en la estructura de `Group`, estos campos podrían estar causando el problema:

### Campos de Fecha (Date):
```java
- createdAt: Date
- updatedAt: Date
- enabledAt: Date
- poolAvailableDay: Date (si está en Group)
- poolDisabledDate: Date (si está en Group)
- paymentDeadline: Date
- matchDay: Date (en Match)
- matchDate: Date (en Match)
- playedDate: Date (en Match)
```

### Campos Numéricos (Integer):
```java
- matchday: Integer (número de jornada)
- matchNumber: Integer
- totalBetAmount: Integer/Double
- equitableAmountPerUser: Integer/Double
- points: Integer
- played: Integer
- won: Integer
- drawn: Integer
- lost: Integer
- goalsFor: Integer
- goalsAgainst: Integer
- goalDifference: Integer
```

---

## 🔧 Solución Sugerida

### 1. Verificar el Mapeo de Entidad a DTO

Revisar el mapeo en el servicio o repositorio que retorna los grupos:

```java
// Ejemplo de posible problema
@Query("SELECT g FROM Group g WHERE ...")
List<Group> findUserGroups(String userId);

// El DTO podría tener un campo mal tipado:
public class GroupResponse {
    private Date createdAt;  // ✅ Correcto
    private Integer matchday;  // ❌ Podría estar recibiendo un Date
    // ...
}
```

### 2. Verificar Anotaciones de Mapeo

Si estás usando `@Mapping` o similar, verificar que los tipos coincidan:

```java
@Mapping(source = "matchday", target = "matchday")
// Si matchday en la entidad es Date pero en el DTO es Integer, esto fallará
```

### 3. Verificar la Consulta SQL/JPQL

Si hay una consulta personalizada, verificar que los tipos de retorno sean correctos:

```java
@Query("SELECT g.createdAt, g.matchday FROM Group g WHERE ...")
// Si matchday es Date en la BD pero Integer en el DTO, esto causará el error
```

### 4. Verificar Serialización JSON

Si estás usando Jackson o similar, verificar que los campos estén correctamente anotados:

```java
@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
private Date createdAt;

// vs

private Integer matchday;  // No debería tener @JsonFormat para Date
```

---

## 🧪 Pasos para Reproducir

1. Usuario autenticado con JWT token válido
2. Crear un nuevo grupo usando `POST /groups`
3. Inmediatamente después, llamar a `GET /groups`
4. El backend retorna error 500 con el mensaje de conversión

---

## 📊 Request/Response Esperado

### Request:
```http
GET /groups
Authorization: Bearer {jwt_token}
```

### Response Esperado (200 OK):
```json
{
  "groups": [
    {
      "groupId": "6923da8daf258e4c81793b31",
      "name": "Mi Grupo",
      "competitionId": "club-world-cup",
      "competitionName": "FIFA Club World Cup",
      "createdAt": "2025-11-25T02:55:00.000+00:00",
      "updatedAt": "2025-11-25T02:55:00.000+00:00",
      "enabledAt": "2025-11-25T02:55:00.000+00:00",
      // ... otros campos
    }
  ],
  "count": 1
}
```

### Response Actual (500 Error):
```json
{
  "error": "Error retrieving groups: No converter found capable of converting from type [java.util.Date] to type [java.lang.Integer]"
}
```

---

## 🔍 Debugging Sugerido

1. **Revisar logs del backend** cuando se ejecuta `GET /groups`:
   - Ver qué campos se están intentando mapear
   - Identificar qué campo específico está causando el problema

2. **Verificar el DTO de respuesta:**
   - Comparar tipos de campos en `Group` entity vs `GroupResponse` DTO
   - Buscar discrepancias entre Date e Integer

3. **Verificar consultas personalizadas:**
   - Si hay `@Query` personalizadas, revisar los tipos de retorno
   - Verificar que los campos seleccionados coincidan con los tipos del DTO

4. **Probar con un grupo existente:**
   - Verificar si el error solo ocurre con grupos recién creados
   - O si ocurre con todos los grupos

---

## 📞 Información Adicional

- **Fecha del error:** 2025-11-25
- **Endpoint afectado:** `GET /groups`
- **Método HTTP:** GET
- **Autenticación requerida:** Sí (JWT Token)
- **Frecuencia:** Ocurre después de crear un nuevo grupo

---

## ✅ Checklist para Backend

- [ ] Identificar el campo específico que está causando el error
- [ ] Verificar tipos de campos en `Group` entity
- [ ] Verificar tipos de campos en `GroupResponse` DTO
- [ ] Revisar mapeo entre entity y DTO
- [ ] Revisar consultas personalizadas (`@Query`)
- [ ] Verificar anotaciones de serialización JSON
- [ ] Probar con grupos existentes vs grupos recién creados
- [ ] Corregir el tipo de dato o el mapeo
- [ ] Probar que `GET /groups` funciona correctamente después de crear un grupo
- [ ] Verificar que no hay otros endpoints afectados

---

**Prioridad:** Alta (bloquea la funcionalidad de ver grupos después de crearlos)

