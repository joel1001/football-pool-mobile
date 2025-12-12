// ================================================================================
// PREDICTION SERVICE - Football Pool Frontend
// ================================================================================
// Este servicio maneja todas las operaciones relacionadas con predicciones
// Basado en la documentación: DOCUMENTACION_GUARDAR_PREDICCIONES.md

import axiosBase from '../services-config';
import {
  SavePredictionRequest,
  SavePredictionResponse,
  GetPredictionsResponse,
  GetPredictionResponse,
  PredictionErrorResponse,
  CompetitionPrediction,
  PREDICTION_ENDPOINTS,
  validateSavePredictionRequest,
} from './prediction-types';
import { TournamentMatch } from '../competitions/competition-types';

// ================================================================================
// SAVE PREDICTION
// ================================================================================

/**
 * Guarda una predicción para un partido
 * 
 * IMPORTANTE:
 * - La predicción se guarda UNA SOLA VEZ por COMPETICIÓN (competitionId)
 * - Se aplica a TODOS los grupos enviados en groupIds
 * - El backend CALCULA AUTOMÁTICAMENTE los puntos comparando predicción vs resultado real
 * - Si el partido ya se jugó, los puntos se calculan inmediatamente
 * - Si el partido no se jugó, usar 0 en realTeam1Score y realTeam2Score
 * - userId va en el BODY del request, no en la URL
 * 
 * 🚨 CRÍTICO: groupIds es REQUERIDO
 * - Los groupIds son los IDs de los grupos donde el usuario fue agregado en la misma competencia
 * - El backend necesita estos groupIds para actualizar el campo users en cada grupo
 * - Si no se envían groupIds, el backend NO sabrá en qué grupos actualizar el usuario
 * - Puedes usar getGroupIdsForCompetition() para obtenerlos automáticamente
 * - O usar savePredictionWithAutoGroupIds() que los obtiene automáticamente
 * 
 * NOTA SOBRE RESULTADOS REALES:
 * - realTeam1Score y realTeam2Score deben obtenerse del servicio de tournaments
 * - Usar la función helper getRealMatchScores() para obtenerlos de TournamentMatch
 * - El usuario SOLO ingresa team1Score y team2Score (su predicción)
 * 
 * ⚠️ IMPORTANTE: team1 y team2 son REQUERIDOS
 * - team1: Nombre del equipo 1 (local) - obtener de match.team1Name
 * - team2: Nombre del equipo 2 (visitante) - obtener de match.team2Name
 * 
 * @param userId - ID del usuario (se incluye en el body del request)
 * @param request - Datos de la predicción
 * @returns Response con información de cada grupo donde se aplicó la predicción
 * @throws Error si la validación falla o el request es inválido
 * 
 * @example
 * // Opción 1: Obtener groupIds manualmente (más eficiente si ya los tienes)
 * import { getGroupIdsForCompetition } from '@/services/groups';
 * 
 * const groupIds = await getGroupIdsForCompetition('club-world-cup');
 * const realScores = getRealMatchScores(match);
 * 
 * const response = await savePrediction('userId123', {
 *   matchId: 'group-a-match-1',
 *   competitionId: 'club-world-cup',
 *   team1: match.team1Name,
 *   team2: match.team2Name,
 *   team1Score: 2,
 *   team2Score: 1,
 *   realTeam1Score: realScores.realTeam1Score,
 *   realTeam2Score: realScores.realTeam2Score,
 *   groupIds: groupIds, // ⚠️ CRÍTICO: IDs de los grupos de la competencia
 * });
 * 
 * @example
 * // Opción 2: Obtener groupIds automáticamente (más fácil pero hace una llamada extra)
 * const response = await savePredictionWithAutoGroupIds('userId123', {
 *   matchId: 'group-a-match-1',
 *   competitionId: 'club-world-cup',
 *   team1: match.team1Name,
 *   team2: match.team2Name,
 *   team1Score: 2,
 *   team2Score: 1,
 *   realTeam1Score: realScores.realTeam1Score,
 *   realTeam2Score: realScores.realTeam2Score,
 *   // groupIds se obtienen automáticamente
 * });
 */
export const savePrediction = async (
  userId: string,
  request: SavePredictionRequest
): Promise<SavePredictionResponse> => {
  try {
    // Validar request
    const errors = validateSavePredictionRequest(request);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Validar userId
    if (!userId || userId.trim() === '') {
      throw new Error('userId is required');
    }

    // Construir el body según la documentación del backend
    // REQUERIDOS: matchId, competitionId, team1, team2, team1Score, team2Score, realTeam1Score, realTeam2Score, groupIds
    // NOTA: userId se obtiene automáticamente del token JWT (header Authorization)
    //       Pero lo incluimos en el body para compatibilidad con versiones anteriores
    // NOTA: realTeam1Score y realTeam2Score deben obtenerse del servicio de tournaments (no los digita el usuario)
    const body: any = {
      userId: userId, // ← Incluido para compatibilidad, pero se obtiene del token JWT
      matchId: request.matchId,
      competitionId: request.competitionId, // REQUERIDO
      team1: request.team1, // ⚠️ REQUERIDO: Nombre del equipo 1 (local)
      team2: request.team2, // ⚠️ REQUERIDO: Nombre del equipo 2 (visitante)
      team1Score: request.team1Score, // ← Usuario ingresa esto (su predicción)
      team2Score: request.team2Score, // ← Usuario ingresa esto (su predicción)
      realTeam1Score: request.realTeam1Score, // ⚠️ REQUERIDO: Obtener del servicio tournaments (0 si no se ha jugado)
      realTeam2Score: request.realTeam2Score, // ⚠️ REQUERIDO: Obtener del servicio tournaments (0 si no se ha jugado)
    };

    // El backend REQUIERE groupIds (error 400 si no se envía)
    // Incluir groupIds si está presente y es un array válido
    if (request.groupIds && Array.isArray(request.groupIds) && request.groupIds.length > 0) {
      body.groupIds = request.groupIds;
      console.log('✅ [GROUP_IDS] Enviando groupIds al backend:', request.groupIds);
    } else if (request.groupIds === undefined || !Array.isArray(request.groupIds)) {
      // Si no se proporcionó groupIds o no es un array, enviar array vacío
      body.groupIds = [];
      console.warn('⚠️ [GROUP_IDS] groupIds no válido, enviando array vacío');
    } else {
      // Array vacío - el backend puede que no lo acepte, pero intentamos
      body.groupIds = [];
      console.warn('⚠️ [GROUP_IDS] groupIds está vacío, enviando array vacío');
    }

    // Agregar campos opcionales para fases de eliminación
    if (request.extraTime !== undefined) {
      body.extraTime = request.extraTime;
    }

    if (request.realExtraTime !== undefined) {
      body.realExtraTime = request.realExtraTime;
    }

    if (request.penaltiesteam1Score !== undefined && request.penaltiesteam1Score !== null) {
      body.penaltiesteam1Score = request.penaltiesteam1Score;
    }

    if (request.penaltiesteam2Score !== undefined && request.penaltiesteam2Score !== null) {
      body.penaltiesteam2Score = request.penaltiesteam2Score;
    }

    // Logs detallados para verificar groupIds
    console.log('🚨 [GROUP_IDS_CHECK] Verificando groupIds antes de enviar:', {
      groupIdsReceived: request.groupIds || [],
      groupIdsCount: request.groupIds?.length || 0,
      groupIdsIsArray: Array.isArray(request.groupIds),
      groupIdsType: typeof request.groupIds,
      groupIdsStringified: JSON.stringify(request.groupIds || []),
      competitionId: request.competitionId,
    });

    // Validar que groupIds sea un array válido
    if (!request.groupIds || !Array.isArray(request.groupIds)) {
      console.error('❌ [GROUP_IDS_ERROR] groupIds no es un array válido:', {
        groupIds: request.groupIds,
        type: typeof request.groupIds,
        isArray: Array.isArray(request.groupIds),
      });
    } else if (request.groupIds.length === 0) {
      console.warn('⚠️ [GROUP_IDS_WARNING] groupIds está vacío. La predicción se guardará pero no se actualizará ningún grupo.');
    } else {
      console.log('✅ [GROUP_IDS_OK] groupIds válido:', {
        count: request.groupIds.length,
        ids: request.groupIds,
        allAreStrings: request.groupIds.every(id => typeof id === 'string'),
      });
    }

    console.log('📤 [PREDICTION] Saving prediction:', {
      userId: userId || 'UNDEFINED',
      matchId: request.matchId || 'UNDEFINED',
      competitionId: request.competitionId || 'NOT_PROVIDED',
      team1: request.team1 || 'NOT_PROVIDED',
      team2: request.team2 || 'NOT_PROVIDED',
      team1Score: request.team1Score,
      team2Score: request.team2Score,
      realTeam1Score: request.realTeam1Score,
      realTeam2Score: request.realTeam2Score,
      groupIds: request.groupIds || [],
      groupIdsCount: request.groupIds?.length || 0,
      extraTime: request.extraTime,
      realExtraTime: request.realExtraTime,
      penaltiesteam1Score: request.penaltiesteam1Score,
      penaltiesteam2Score: request.penaltiesteam2Score,
    });

    console.log('📤 [PREDICTION] Request body to send (JSON completo):', JSON.stringify(body, null, 2));
    console.log('🚨 [GROUP_IDS_IN_BODY] groupIds en el body final:', {
      groupIdsInBody: body.groupIds,
      groupIdsCountInBody: body.groupIds?.length || 0,
      groupIdsStringified: JSON.stringify(body.groupIds || []),
    });
    console.log('🚨 [FULL_BODY_CHECK] Verificación completa del body:', {
      hasUserId: !!body.userId,
      userId: body.userId,
      hasMatchId: !!body.matchId,
      matchId: body.matchId,
      hasCompetitionId: !!body.competitionId,
      competitionId: body.competitionId,
      hasTeam1: !!body.team1,
      team1: body.team1,
      hasTeam2: !!body.team2,
      team2: body.team2,
      hasTeam1Score: typeof body.team1Score === 'number',
      team1Score: body.team1Score,
      hasTeam2Score: typeof body.team2Score === 'number',
      team2Score: body.team2Score,
      hasRealTeam1Score: typeof body.realTeam1Score === 'number',
      realTeam1Score: body.realTeam1Score,
      hasRealTeam2Score: typeof body.realTeam2Score === 'number',
      realTeam2Score: body.realTeam2Score,
      hasGroupIds: Array.isArray(body.groupIds),
      groupIds: body.groupIds,
      groupIdsCount: body.groupIds?.length || 0,
    });

    // Hacer la petición al backend
    // IMPORTANTE: userId va en el body, no en la URL
    const response = await axiosBase.post<SavePredictionResponse>(
      PREDICTION_ENDPOINTS.SAVE(),
      body
    );

    console.log('✅ [PREDICTION] Prediction saved successfully:', {
      userId: response.data.userId || 'UNDEFINED',
      matchId: response.data.matchId || 'UNDEFINED',
      competitionId: response.data.competitionId || 'UNDEFINED',
      points: response.data.points || 0, // Puntos acumulados de la competencia
      groupsApplied: response.data.groupsApplied?.length || 0,
      groupsAppliedDetails: response.data.groupsApplied?.map(g => ({
        groupId: g.groupId || 'UNDEFINED',
        groupName: g.groupName || 'UNDEFINED',
        points: g.points,
        totalScore: g.totalScore,
        pointsCalculated: g.pointsCalculated
      })) || [],
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ [PREDICTION] Error saving prediction:', {
      userId: userId || 'UNDEFINED',
      matchId: request.matchId || 'UNDEFINED',
      groupIds: request.groupIds || [],
      error: error.response?.data || error.message,
      status: error.response?.status,
      fullError: error,
    });

    console.error('❌ [PREDICTION] Request that failed:', JSON.stringify(request, null, 2));
    console.error('❌ [PREDICTION] Body that was sent:', JSON.stringify({
      userId,
      ...request,
    }, null, 2));
    console.error('❌ [PREDICTION] Error response details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
    });

    // Lanzar error con mensaje apropiado
    if (error.response?.data?.error) {
      const errorMessage = typeof error.response.data.error === 'string' 
        ? error.response.data.error 
        : error.response.data.error?.error || 'Internal Server Error';
      throw new Error(errorMessage);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to save prediction');
    }
  }
};

// ================================================================================
// GET PREDICTIONS
// ================================================================================

/**
 * Obtiene todas las predicciones de un usuario
 * Opcionalmente puede filtrar por grupo
 * 
 * @param userId - ID del usuario
 * @param groupId - (Opcional) ID del grupo para filtrar predicciones
 * @returns Lista de predicciones del usuario
 * 
 * @example
 * // Obtener todas las predicciones
 * const allPredictions = await getPredictions('userId123');
 * 
 * @example
 * // Obtener predicciones de un grupo específico
 * const groupPredictions = await getPredictions('userId123', 'groupId1');
 */
export const getPredictions = async (
  userId: string,
  groupId?: string
): Promise<GetPredictionsResponse> => {
  try {
    if (!userId || userId.trim() === '') {
      throw new Error('userId is required');
    }

    const endpoint = groupId
      ? PREDICTION_ENDPOINTS.GET_BY_GROUP(userId, groupId)
      : PREDICTION_ENDPOINTS.GET_ALL(userId);

    console.log('📤 [PREDICTION] Getting predictions:', {
      userId: userId || 'UNDEFINED',
      groupId: groupId || 'all',
      endpoint,
    });

    const response = await axiosBase.get<GetPredictionsResponse>(endpoint);

    console.log('✅ [PREDICTION] Predictions retrieved:', {
      userId: response.data.userId || 'UNDEFINED',
      groupId: response.data.groupId || 'all',
      count: response.data.count || 0,
      competitions: Object.keys(response.data.predictions || {}),
      predictionsByCompetition: Object.entries(response.data.predictions || {}).map(([competitionId, competitionPrediction]) => ({
        competitionId,
        matchesCount: competitionPrediction.matchInfo?.length || 0,
        points: competitionPrediction.points || 0,
      })),
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ [PREDICTION] Error getting predictions:', {
      userId: userId || 'UNDEFINED',
      groupId: groupId || 'all',
      error: error.response?.data || error.message,
      status: error.response?.status,
    });

    // Si es un error 404 o 500 conocido, devolver array vacío
    if (
      error.response?.status === 404 ||
      error.response?.data?.error?.includes('prediction')
    ) {
      console.warn('⚠️ [PREDICTION] No predictions found, returning empty object');
      return {
        userId: userId || '',
        groupId: groupId || 'all',
        predictions: {},
        count: 0,
      };
    }

    throw new Error(
      error.response?.data?.error || error.message || 'Failed to get predictions'
    );
  }
};

/**
 * Obtiene una predicción específica de un usuario para un partido
 * 
 * @param userId - ID del usuario
 * @param matchId - ID del partido
 * @returns Predicción del usuario para ese partido (null si no existe)
 * 
 * @example
 * const prediction = await getPrediction('userId123', 'match-1');
 * if (prediction.prediction) {
 *   console.log('User predicted:', prediction.prediction.team1Score, '-', prediction.prediction.team2Score);
 * }
 */
export const getPrediction = async (
  userId: string,
  matchId: string
): Promise<GetPredictionResponse> => {
  try {
    if (!userId || userId.trim() === '') {
      throw new Error('userId is required');
    }

    if (!matchId || matchId.trim() === '') {
      throw new Error('matchId is required');
    }

    console.log('📤 [PREDICTION] Getting prediction:', {
      userId: userId || 'UNDEFINED',
      matchId: matchId || 'UNDEFINED',
      endpoint: PREDICTION_ENDPOINTS.GET_ONE(userId, matchId),
    });

    const response = await axiosBase.get<GetPredictionResponse>(
      PREDICTION_ENDPOINTS.GET_ONE(userId, matchId)
    );

    console.log('✅ [PREDICTION] Prediction retrieved:', {
      userId: userId || 'UNDEFINED',
      matchId: matchId || 'UNDEFINED',
      exists: !!response.data.prediction,
      prediction: response.data.prediction ? {
        matchId: response.data.prediction.matchId || 'UNDEFINED',
        team1Score: response.data.prediction.team1Score,
        team2Score: response.data.prediction.team2Score,
        points: response.data.prediction.points,
      } : null,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ [PREDICTION] Error getting prediction:', {
      userId: userId || 'UNDEFINED',
      matchId: matchId || 'UNDEFINED',
      error: error.response?.data || error.message,
      status: error.response?.status,
    });

    // Si es un error 404 o 500 conocido, devolver null
    if (
      error.response?.status === 404 ||
      error.response?.data?.error?.includes('prediction')
    ) {
      console.warn('⚠️ [PREDICTION] Prediction not found, returning null');
      return {
        prediction: null,
      };
    }

    throw new Error(
      error.response?.data?.error || error.message || 'Failed to get prediction'
    );
  }
};

// ================================================================================
// HELPER FUNCTIONS
// ================================================================================

/**
 * Helper para guardar una predicción obteniendo automáticamente los groupIds
 * 
 * Esta función es una conveniencia que obtiene los groupIds del usuario para la competencia
 * antes de guardar la predicción. Es útil cuando no tienes los groupIds previamente cargados.
 * 
 * ⚠️ NOTA: Si ya tienes los groupIds en tu estado/context, es más eficiente usar `savePrediction`
 * directamente y pasar los groupIds que ya conoces.
 * 
 * @param userId - ID del usuario
 * @param request - Datos de la predicción (sin groupIds, se obtienen automáticamente)
 * @returns Response de guardar predicción
 * 
 * @example
 * // Obtener groupIds automáticamente
 * const response = await savePredictionWithAutoGroupIds(userId, {
 *   matchId: 'match-1',
 *   competitionId: 'club-world-cup',
 *   team1: 'Team 1',
 *   team2: 'Team 2',
 *   team1Score: 2,
 *   team2Score: 1,
 *   realTeam1Score: 2,
 *   realTeam2Score: 1,
 *   // groupIds se obtienen automáticamente
 * });
 */
export const savePredictionWithAutoGroupIds = async (
  userId: string,
  request: Omit<SavePredictionRequest, 'groupIds'>
): Promise<SavePredictionResponse> => {
  // Importar dinámicamente para evitar dependencia circular
  const { getGroupIdsForCompetition } = await import('../groups');

  try {
    // Obtener los groupIds del usuario para esta competencia
    const groupIds = await getGroupIdsForCompetition(request.competitionId);

    if (groupIds.length === 0) {
      console.warn(
        '⚠️ [PREDICTION] User is not in any groups for this competition. Prediction will be saved but no groups will be updated.',
        {
          userId,
          competitionId: request.competitionId,
        }
      );
    }

    // Guardar predicción con los groupIds obtenidos
    return await savePrediction(userId, {
      ...request,
      groupIds,
    });
  } catch (error: any) {
    console.error(
      '❌ [PREDICTION] Error getting groupIds or saving prediction:',
      {
        userId,
        competitionId: request.competitionId,
        error: error.message,
      }
    );
    throw error;
  }
};

/**
 * Obtiene los resultados reales de un partido desde la estructura del torneo
 * 
 * IMPORTANTE:
 * - Los resultados reales vienen del servicio de tournaments, NO los digita el usuario
 * - El usuario solo ingresa su predicción (team1Score, team2Score)
 * - Esta función ayuda a obtener los resultados reales para enviarlos al backend
 * 
 * @param match - Partido de la estructura del torneo (TournamentMatch)
 * @returns Objeto con los resultados reales (0 si el partido no se ha jugado)
 * 
 * @example
 * const match = tournamentStructure.stages['groups'].groups[0].matches[0];
 * const realScores = getRealMatchScores(match);
 * // { realTeam1Score: 2, realTeam2Score: 1, realExtraTime: false, ... }
 */
export const getRealMatchScores = (match: TournamentMatch | null | undefined): {
  realTeam1Score: number;
  realTeam2Score: number;
  realExtraTime?: boolean;
  penaltiesteam1Score?: number | null;
  penaltiesteam2Score?: number | null;
} => {
  // Si no hay partido o no se ha jugado, retornar 0
  if (!match || !match.isPlayed) {
    return {
      realTeam1Score: 0,
      realTeam2Score: 0,
    };
  }

  // Obtener resultados reales del partido
  const realTeam1Score = match.team1Score ?? 0;
  const realTeam2Score = match.team2Score ?? 0;

  const result: {
    realTeam1Score: number;
    realTeam2Score: number;
    realExtraTime?: boolean;
    penaltiesteam1Score?: number | null;
    penaltiesteam2Score?: number | null;
  } = {
    realTeam1Score,
    realTeam2Score,
  };

  // Agregar campos opcionales si están presentes
  if (match.extraTime !== undefined && match.extraTime !== null) {
    result.realExtraTime = match.extraTime;
  }

  if (match.penalties !== undefined && match.penalties !== null) {
    result.penaltiesteam1Score = match.penaltiesTeam1Score ?? null;
    result.penaltiesteam2Score = match.penaltiesTeam2Score ?? null;
  }

  return result;
};

/**
 * Calcula el total de puntos de todas las predicciones
 * NOTA: Esta función es solo para mostrar en el frontend
 * El backend es la fuente de verdad para los puntos
 * 
 * @param predictions - Lista de predicciones organizadas por competitionId
 * @returns Total de puntos acumulados de todas las competencias
 */
export const calculateTotalPoints = (predictions: GetPredictionsResponse): number => {
  return Object.values(predictions.predictions).reduce(
    (sum, competitionPrediction) => sum + (competitionPrediction.points || 0),
    0
  );
};

/**
 * Filtra competencias que ya tienen puntos calculados
 * 
 * @param predictions - Lista de predicciones organizadas por competitionId
 * @returns Predicciones con puntos calculados
 */
export const getCalculatedPredictions = (
  predictions: GetPredictionsResponse
): GetPredictionsResponse => {
  const calculated: Record<string, CompetitionPrediction> = {};
  
  Object.entries(predictions.predictions).forEach(([competitionId, competitionPrediction]) => {
    if (competitionPrediction.points > 0) {
      calculated[competitionId] = competitionPrediction;
    }
  });

  return {
    ...predictions,
    predictions: calculated,
    count: Object.keys(calculated).length,
  };
};

/**
 * Filtra competencias pendientes (sin puntos calculados)
 * 
 * @param predictions - Lista de predicciones organizadas por competitionId
 * @returns Predicciones pendientes
 */
export const getPendingPredictions = (
  predictions: GetPredictionsResponse
): GetPredictionsResponse => {
  const pending: Record<string, CompetitionPrediction> = {};
  
  Object.entries(predictions.predictions).forEach(([competitionId, competitionPrediction]) => {
    if (competitionPrediction.points === 0) {
      pending[competitionId] = competitionPrediction;
    }
  });

  return {
    ...predictions,
    predictions: pending,
    count: Object.keys(pending).length,
  };
};

/**
 * Obtiene todas las predicciones de una competencia específica
 * 
 * @param predictions - Lista de predicciones organizadas por competitionId
 * @param competitionId - ID de la competencia
 * @returns Predicción de la competencia o null si no existe
 */
export const getCompetitionPredictions = (
  predictions: GetPredictionsResponse,
  competitionId: string
): CompetitionPrediction | null => {
  return predictions.predictions[competitionId] || null;
};

// ================================================================================
// EXPORTS
// ================================================================================

export default {
  savePrediction,
  getPredictions,
  getPrediction,
  calculateTotalPoints,
  getCalculatedPredictions,
  getPendingPredictions,
  getCompetitionPredictions,
  getRealMatchScores,
};

