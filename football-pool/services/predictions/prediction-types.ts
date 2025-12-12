// ================================================================================
// PREDICTION TYPES - Football Pool Frontend
// ================================================================================
// Este archivo define los tipos para el sistema de predicciones
// Basado en la documentación: DOCUMENTACION_GUARDAR_PREDICCIONES.md

// ================================================================================
// REQUEST TYPES
// ================================================================================

/**
 * Request para guardar una predicción
 * El backend guardará la predicción UNA VEZ por COMPETICIÓN y la aplicará a todos los grupos enviados
 * 
 * IMPORTANTE:
 * - Las predicciones se organizan por COMPETICIÓN (competitionId), no por grupo
 * - Una misma predicción funciona para TODOS los grupos de la misma competencia
 * - El backend CALCULA automáticamente los puntos comparando predicción vs resultado real
 * - Los puntos se acumulan por competencia y se actualizan en todos los grupos
 * 
 * NOTA SOBRE RESULTADOS REALES:
 * - realTeam1Score y realTeam2Score deben obtenerse del servicio de tournaments
 * - Si el partido ya se jugó, usar los valores de TournamentMatch.team1Score y team2Score
 * - Si el partido NO se ha jugado, usar 0 para ambos valores
 * - El usuario SOLO ingresa team1Score y team2Score (su predicción)
 */
export interface SavePredictionRequest {
  // CAMPOS REQUERIDOS
  matchId: string; // ID del partido
  competitionId: string; // ID de la competencia (REQUERIDO: ej: "club-world-cup", "champions-league")
  team1: string; // ⚠️ REQUERIDO: Nombre del equipo 1 (local)
  team2: string; // ⚠️ REQUERIDO: Nombre del equipo 2 (visitante)
  team1Score: number; // Marcador PREDICHO por el usuario para equipo 1 (>= 0)
  team2Score: number; // Marcador PREDICHO por el usuario para equipo 2 (>= 0)
  realTeam1Score: number; // Marcador REAL del partido (obtenido del servicio tournaments, 0 si no se ha jugado)
  realTeam2Score: number; // Marcador REAL del partido (obtenido del servicio tournaments, 0 si no se ha jugado)
  groupIds?: string[]; // Array con los IDs de los grupos donde aplicar la predicción (opcional para compatibilidad)

  // CAMPOS OPCIONALES PARA FASES DE ELIMINACIÓN (Knockout)
  extraTime?: boolean; // Si predijiste tiempo extra
  realExtraTime?: boolean; // Si hubo tiempo extra real (obtenido del servicio tournaments)
  penaltiesteam1Score?: number | null; // Penales predichos equipo 1
  penaltiesteam2Score?: number | null; // Penales predichos equipo 2
}

/**
 * Validación de request para guardar predicción
 * @param request - Request a validar
 * @returns Array de errores (vacío si es válido)
 */
export const validateSavePredictionRequest = (
  request: Partial<SavePredictionRequest>
): string[] => {
  const errors: string[] = [];

  // Validar campos requeridos
  if (!request.matchId || request.matchId.trim() === '') {
    errors.push('matchId is required and cannot be empty');
  }

  if (!request.competitionId || request.competitionId.trim() === '') {
    errors.push('competitionId is required and cannot be empty');
  }

  if (!request.team1 || request.team1.trim() === '') {
    errors.push('team1 is required and cannot be empty');
  }

  if (!request.team2 || request.team2.trim() === '') {
    errors.push('team2 is required and cannot be empty');
  }

  if (typeof request.team1Score !== 'number' || request.team1Score < 0) {
    errors.push('team1Score must be a non-negative number');
  }

  if (typeof request.team2Score !== 'number' || request.team2Score < 0) {
    errors.push('team2Score must be a non-negative number');
  }

  // Validar realTeam1Score (debe ser número >= 0, puede ser 0 si el partido no se ha jugado)
  if (request.realTeam1Score === undefined || request.realTeam1Score === null) {
    errors.push('realTeam1Score is required');
  } else if (typeof request.realTeam1Score !== 'number' || request.realTeam1Score < 0) {
    errors.push('realTeam1Score must be a non-negative number (0 if match not played)');
  }

  // Validar realTeam2Score (debe ser número >= 0, puede ser 0 si el partido no se ha jugado)
  if (request.realTeam2Score === undefined || request.realTeam2Score === null) {
    errors.push('realTeam2Score is required');
  } else if (typeof request.realTeam2Score !== 'number' || request.realTeam2Score < 0) {
    errors.push('realTeam2Score must be a non-negative number (0 if match not played)');
  }

  // groupIds es opcional - si no se proporciona o está vacío, se envía como array vacío
  // El backend debería poder manejar tanto con groupIds como sin ellos
  if (request.groupIds !== undefined && !Array.isArray(request.groupIds)) {
    errors.push('groupIds must be an array');
  }

  // Validar que los marcadores sean enteros
  if (
    typeof request.team1Score === 'number' &&
    !Number.isInteger(request.team1Score)
  ) {
    errors.push('team1Score must be an integer');
  }

  if (
    typeof request.team2Score === 'number' &&
    !Number.isInteger(request.team2Score)
  ) {
    errors.push('team2Score must be an integer');
  }

  if (
    typeof request.realTeam1Score === 'number' &&
    !Number.isInteger(request.realTeam1Score)
  ) {
    errors.push('realTeam1Score must be an integer');
  }

  if (
    typeof request.realTeam2Score === 'number' &&
    !Number.isInteger(request.realTeam2Score)
  ) {
    errors.push('realTeam2Score must be an integer');
  }

  // Validar campos de penales si están presentes
  if (
    request.penaltiesteam1Score !== undefined &&
    request.penaltiesteam1Score !== null
  ) {
    if (
      typeof request.penaltiesteam1Score !== 'number' ||
      request.penaltiesteam1Score < 0 ||
      !Number.isInteger(request.penaltiesteam1Score)
    ) {
      errors.push('penaltiesteam1Score must be a non-negative integer');
    }
  }

  if (
    request.penaltiesteam2Score !== undefined &&
    request.penaltiesteam2Score !== null
  ) {
    if (
      typeof request.penaltiesteam2Score !== 'number' ||
      request.penaltiesteam2Score < 0 ||
      !Number.isInteger(request.penaltiesteam2Score)
    ) {
      errors.push('penaltiesteam2Score must be a non-negative integer');
    }
  }

  return errors;
};

// ================================================================================
// RESPONSE TYPES
// ================================================================================

/**
 * Resultado de aplicar la predicción a un grupo
 */
export interface GroupAppliedResult {
  groupId: string; // ID del grupo
  groupName: string; // Nombre del grupo
  pointsCalculated: boolean; // true si el backend calculó puntos (partido ya jugado)
  points: number; // Puntos obtenidos (calculados automáticamente por el backend)
  totalScore: number; // Score total del usuario en ese grupo
}

/**
 * Response de guardar predicción
 * El backend calcula automáticamente los puntos y los devuelve
 */
export interface SavePredictionResponse {
  message: string; // Mensaje de confirmación
  userId: string; // ID del usuario
  matchId: string; // ID del partido
  competitionId: string; // ID de la competencia
  team1Score: number; // Marcador predicho para equipo 1
  team2Score: number; // Marcador predicho para equipo 2
  realTeam1Score: number; // Marcador real para equipo 1
  realTeam2Score: number; // Marcador real para equipo 2
  points: number; // Puntos ACUMULADOS de la competencia (suma de todos los matches)

  // Campos opcionales (si se enviaron en el request)
  extraTime?: boolean;
  realExtraTime?: boolean;
  penaltiesteam1Score?: number | null;
  penaltiesteam2Score?: number | null;

  // Array con información de cada grupo donde se aplicó la predicción
  groupsApplied: GroupAppliedResult[];
}

/**
 * Información de un partido en la predicción (dentro de matchInfo[])
 */
export interface MatchInfo {
  matchId: string;
  team1: string; // ⚠️ REQUERIDO: Nombre del equipo 1
  team2: string; // ⚠️ REQUERIDO: Nombre del equipo 2
  team1Score: number;
  team2Score: number;
  realTeam1Score: number;
  realTeam2Score: number;
  predictedDate: string; // ISO 8601 date string

  // Campos opcionales para fases de eliminación
  extraTime?: boolean;
  realExtraTime?: boolean;
  penaltiesteam1Score?: number | null;
  penaltiesteam2Score?: number | null;
}

/**
 * Predicción del usuario por competencia (en users.predictions[competitionId])
 * Las predicciones están organizadas por competitionId
 */
export interface CompetitionPrediction {
  matchInfo: MatchInfo[]; // Array con todos los partidos de la competencia
  points: number; // Puntos ACUMULADOS de la competencia (suma de todos los matches)
}

/**
 * Predicción del usuario (en users.predictions[])
 * NO incluye groupId porque es global para el usuario
 * @deprecated Usar CompetitionPrediction y MatchInfo en su lugar
 */
export interface UserPrediction {
  matchId: string;
  team1Score: number;
  team2Score: number;
  predictedDate: string; // ISO 8601 date string
  points: number; // Calculado automáticamente por el backend

  // Campos opcionales para fases de eliminación
  extraTime?: boolean;
  realExtraTime?: boolean;
  penaltiesteam1Score?: number | null;
  penaltiesteam2Score?: number | null;
}

/**
 * Predicción del usuario en un grupo (en groups.userPredictions[])
 * Incluye userId y groupId para calcular scores por grupo
 */
export interface GroupUserPrediction {
  matchId: string;
  userId: string;
  userTeam1Score: number;
  userTeam2Score: number;
  predictedDate: string; // ISO 8601 date string
  points: number; // Mismo valor calculado que en UserPrediction

  // Campos opcionales para fases de eliminación
  userExtraTime?: boolean | null;
  userPenalties?: boolean | null;
  userPenaltiesTeam1Score?: number | null;
  userPenaltiesTeam2Score?: number | null;
}

/**
 * Response de obtener predicciones
 * Las predicciones están organizadas por competitionId
 */
export interface GetPredictionsResponse {
  userId: string;
  groupId?: string; // Puede ser "all" si no se filtró por grupo
  predictions: Record<string, CompetitionPrediction>; // Mapa de competitionId -> CompetitionPrediction
  count: number; // Número de competencias con predicciones
}

/**
 * Response de obtener una predicción específica
 */
export interface GetPredictionResponse {
  prediction: UserPrediction | null;
}

// ================================================================================
// ERROR TYPES
// ================================================================================

/**
 * Error response del backend
 */
export interface PredictionErrorResponse {
  error: string;
  message?: string;
  details?: string;
}

// ================================================================================
// HELPER TYPES
// ================================================================================

/**
 * Información resumida de una predicción para mostrar en la UI
 */
export interface PredictionSummary {
  matchId: string;
  team1Score: number;
  team2Score: number;
  points: number;
  pointsCalculated: boolean;
  groupsCount: number; // Número de grupos donde se aplicó
  predictedDate: string;
}

/**
 * Estado de una predicción
 */
export type PredictionStatus = 'pending' | 'calculated' | 'no-prediction';

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ================================================================================
// CONSTANTS
// ================================================================================

/**
 * Tabla de puntuación (para referencia del frontend)
 * NOTA: El backend calcula automáticamente los puntos
 * El frontend NO debe calcular puntos manualmente
 */
export const SCORING_TABLE = {
  EXACT_SCORE: 5, // Marcador exacto
  CORRECT_RESULT: 3, // Resultado correcto (ganar/empatar/perder)
  INCORRECT_RESULT: 0, // Resultado incorrecto

  // Puntos adicionales para fases de eliminación
  EXTRA_TIME_BONUS: 1, // +1 si predijiste tiempo extra y ocurrió
  PENALTIES_BONUS: 2, // +2 si predijiste penales y ocurrieron
  PENALTIES_EXACT_BONUS: 3, // +3 si predijiste el marcador exacto de penales
} as const;

/**
 * Endpoints de predicciones
 * 
 * IMPORTANTE: 
 * - SAVE: userId va en el BODY, no en la URL
 * - GET endpoints: userId va en la URL (sin cambios)
 */
export const PREDICTION_ENDPOINTS = {
  SAVE: () => `auth/predictions`, // userId va en el body
  GET_ALL: (userId: string) => `auth/${userId}/predictions`,
  GET_BY_GROUP: (userId: string, groupId: string) =>
    `auth/${userId}/predictions?groupId=${groupId}`,
  GET_ONE: (userId: string, matchId: string) =>
    `auth/${userId}/predictions/${matchId}`,
} as const;

// ================================================================================
// TYPE GUARDS
// ================================================================================

/**
 * Verifica si una respuesta es un error
 */
export const isPredictionError = (
  response: SavePredictionResponse | PredictionErrorResponse
): response is PredictionErrorResponse => {
  return 'error' in response;
};

/**
 * Verifica si una predicción tiene puntos calculados
 */
export const hasPredictionPoints = (
  prediction: UserPrediction | GroupUserPrediction | CompetitionPrediction
): boolean => {
  if ('points' in prediction) {
    return prediction.points > 0;
  }
  return false;
};

/**
 * Verifica si una predicción es para fase de eliminación
 */
export const isKnockoutPrediction = (
  prediction: UserPrediction | GroupUserPrediction | MatchInfo
): boolean => {
  return (
    prediction.extraTime !== undefined ||
    prediction.realExtraTime !== undefined ||
    prediction.penaltiesteam1Score !== undefined ||
    prediction.penaltiesteam2Score !== undefined
  );
};



