# 🐛 Reporte: Campo `matchDay` faltante en respuesta de Matches

## 📋 Resumen

El endpoint `GET /groups/:groupId/matches` **NO está enviando** el campo `matchDay` en los objetos `Match` de la respuesta.

---

## 🔍 Evidencia

### Log del Frontend:
```json
{
  "matchId": "round-of-16-1",
  "matchDay": undefined,  // ❌ NO está llegando
  "matchDate": null,      // ❌ Tampoco está llegando
  "matchday": null,        // Este es el número de jornada, no la fecha
  "stageId": "round-of-16",
  "status": "scheduled"
}
```

### Respuesta Actual del Backend:
```json
{
  "matches": [
    {
      "matchId": "group-a-match-1",
      "matchNumber": "1",
      "stageId": "group-stage",
      "groupLetter": "A",
      "matchday": 1,            // ✅ Este SÍ existe (número de jornada)
      "matchDay": undefined,    // ❌ Este campo NO existe (fecha del partido)
      "matchDate": null,        // ❌ Tampoco existe
      "status": "scheduled",
      "isPlayed": false,
      // ... otros campos
    }
  ]
}
```

**Nota importante:** El backend SÍ está enviando `matchday` (número de jornada), pero NO está enviando `matchDay` (fecha del partido). Son dos campos diferentes.

---

## ✅ Comportamiento Esperado

### Campo Requerido: `matchDay`

**Tipo:** `String | null`  
**Formato:** ISO 8601 con timezone  
**Ejemplo:** `"2025-11-25T15:00:00.000+00:00"`

### Respuesta Esperada:
```json
{
  "matches": [
    {
      "matchId": "group-a-match-1",
      "matchNumber": "1",
      "stageId": "group-stage",
      "groupLetter": "A",
      "matchDay": "2025-11-25T15:00:00.000+00:00",  // ✅ FECHA DEL PARTIDO (NUEVO - AGREGAR)
      "matchday": 1,                                 // ✅ Número de jornada (YA EXISTE)
      "status": "scheduled",
      "isPlayed": false,
      // ... otros campos
    }
  ]
}
```

**Resumen:**
- ✅ `matchday: 1` → Ya existe (número de jornada)
- ❌ `matchDay: "2025-11-25T15:00:00.000+00:00"` → **FALTA AGREGAR** (fecha del partido)

---

## 🎯 Uso en Frontend

El frontend necesita `matchDay` para:

1. **Mostrar la fecha del partido** en el header de cada match card
2. **Deshabilitar predicciones** 1 día antes del partido (validación de negocio)
3. **Ordenar partidos** por fecha/hora

### Código Frontend Actual:
```typescript
// app/competition-groups.tsx
const isPredictionDisabled = (match: Match): boolean => {
  const matchDateValue = match.matchDay || match.matchDate; // Usa matchDay primero
  
  if (!matchDateValue) {
    return false; // Si no hay fecha, permitir predicción
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const matchDate = new Date(matchDateValue);
  matchDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.ceil((matchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Deshabilitar si es 1 día antes o menos
  return diffDays <= 1;
};
```

---

## 📝 Especificación Técnica

### Diferencia entre campos:

| Campo | Tipo | Estado Actual | Descripción | Ejemplo |
|-------|------|--------------|-------------|---------|
| `matchDay` | `String \| null` | ❌ **NO existe** | **Fecha y hora del partido** (ISO 8601) | `"2025-11-25T15:00:00.000+00:00"` |
| `matchDate` | `String \| null` | ❌ No existe | Fecha programada (fallback, opcional) | `"2025-11-25T15:00:00.000+00:00"` |
| `matchday` | `Number \| null` | ✅ **SÍ existe** | **Número de jornada** (1, 2, 3...) | `1` |
| `playedDate` | `String \| null` | ❓ No verificado | Fecha en que se jugó (si ya se jugó) | `"2025-11-25T15:00:00.000+00:00"` |

**⚠️ IMPORTANTE:** 
- `matchday` (minúscula) = número de jornada → **Ya existe en el backend**
- `matchDay` (mayúscula D) = fecha del partido → **NO existe, necesita agregarse**

---

## 🔧 Solución Requerida

### Backend debe:

1. **Agregar el campo `matchDay`** a todos los objetos `Match` en la respuesta de:
   - `GET /groups/:groupId/matches`
   - `GET /groups/:groupId/matches/:matchId`
   - `GET /groups/:groupId` (en `tournamentStructure.stages.*.groups.*.matches[]`)

2. **Formato del campo:**
   ```json
   "matchDay": "2025-11-25T15:00:00.000+00:00"
   ```
   - Formato ISO 8601 completo
   - Incluir timezone (`+00:00` o `-05:00`, etc.)
   - Incluir milisegundos (`.000`)
   - Si el partido no tiene fecha programada, enviar `null`

3. **Ejemplo de implementación (Java/Kotlin):**
   ```kotlin
   data class Match(
       val matchId: String,
       val matchNumber: String,
       val matchDay: String?, // ← Agregar este campo
       val matchDate: String?,
       val matchday: Int?,
       // ... otros campos
   ) {
       fun toResponse(): MatchResponse {
           return MatchResponse(
               matchId = this.matchId,
               matchNumber = this.matchNumber,
               matchDay = this.matchDay?.let { 
                   // Formatear a ISO 8601 con timezone
                   DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(it)
               },
               matchDate = this.matchDate,
               matchday = this.matchday,
               // ... otros campos
           )
       }
   }
   ```

---

## 🧪 Testing

### Casos de prueba:

1. **Match con fecha programada:**
   ```json
   {
     "matchId": "group-a-match-1",
     "matchDay": "2025-11-25T15:00:00.000+00:00",
     "matchday": 1
   }
   ```

2. **Match sin fecha (eliminatorias futuras):**
   ```json
   {
     "matchId": "round-of-16-1",
     "matchDay": null,
     "matchday": null
   }
   ```

3. **Match ya jugado:**
   ```json
   {
     "matchId": "group-a-match-1",
     "matchDay": "2025-11-20T15:00:00.000+00:00",
     "playedDate": "2025-11-20T15:30:00.000+00:00",
     "isPlayed": true
   }
   ```

---

## 📞 Contacto

Si necesitas más información sobre el formato o el uso en el frontend, contacta al equipo de frontend.

---

## ✅ Checklist para Backend

- [ ] Agregar campo `matchDay` a la entidad `Match`
- [ ] Agregar campo `matchDay` al DTO de respuesta `MatchResponse`
- [ ] Mapear `matchDay` desde la base de datos al DTO
- [ ] Formatear `matchDay` como ISO 8601 con timezone
- [ ] Probar que `matchDay` aparece en `GET /groups/:groupId/matches`
- [ ] Probar que `matchDay` aparece en `GET /groups/:groupId/matches/:matchId`
- [ ] Probar que `matchDay` aparece en `GET /groups/:groupId` (nested matches)
- [ ] Validar formato con frontend

---

**Fecha del reporte:** 2025-11-19  
**Prioridad:** Alta (afecta funcionalidad de predicciones y UX)

