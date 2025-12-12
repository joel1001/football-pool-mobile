import axiosBase from "../services-config";
import {
  CreateGroupRequest,
  CreateGroupResponse,
  GetGroupResponse,
  GetUserGroupsResponse,
  UpdateGroupRequest,
  UpdateGroupResponse,
  InviteUserRequest,
  InviteUserResponse,
  JoinGroupResponse,
  DeleteGroupResponse,
  ValidateEmailsRequest,
  ValidateEmailsResponse,
  GetMatchesResponse,
  GetMatchResponse,
  RegisterMatchResultRequest,
  RegisterMatchResultResponse,
  SavePredictionRequest,
  SavePredictionResponse,
  GetPredictionsResponse,
  GetPredictionResponse,
  CalculateScoresResponse,
  UpdateMatchesDetailMultipleRequest,
  UpdateMatchesDetailMultipleResponse,
} from "./group-types";

/**
 * POST /groups
 * Create a new group for a competition
 */
export const createGroup = async (
  data: CreateGroupRequest
): Promise<CreateGroupResponse> => {
  const response = await axiosBase.post<CreateGroupResponse>("groups", data);
  return response.data;
};

export const getGroupById = async (id: string): Promise<GetGroupResponse> => {
  const response = await axiosBase.get<GetGroupResponse>(`groups/${id}`);
  return response.data;
};

export const getUserGroups = async (): Promise<GetUserGroupsResponse> => {
  try {
    const response = await axiosBase.get<GetUserGroupsResponse>("groups");

    return response.data;
  } catch (error: any) {
    console.warn('❌ getUserGroups API Error:', {
      status: error.response?.status,
      error: error.response?.data?.error,
      message: error.message,
    });
    throw error;
  }
};


export const updateGroup = async (
  id: string,
  data: UpdateGroupRequest
): Promise<UpdateGroupResponse> => {
  const response = await axiosBase.put<UpdateGroupResponse>(
    `groups/${id}`,
    data
  );
  return response.data;
};


export const patchGroup = async (
  id: string,
  data: Partial<UpdateGroupRequest>
): Promise<UpdateGroupResponse> => {
  const response = await axiosBase.patch<UpdateGroupResponse>(
    `groups/${id}`,
    data
  );
  return response.data;
};

export const deleteGroup = async (id: string): Promise<DeleteGroupResponse> => {
  const response = await axiosBase.delete<DeleteGroupResponse>(`groups/${id}`);
  return response.data;
};

export const inviteUser = async (
  id: string,
  data: InviteUserRequest
): Promise<InviteUserResponse> => {
  const response = await axiosBase.post<InviteUserResponse>(
    `groups/${id}/invite`,
    data
  );
  return response.data;
};

export const joinGroup = async (id: string): Promise<JoinGroupResponse> => {
  const response = await axiosBase.post<JoinGroupResponse>(
    `groups/${id}/join`,
    {}
  );
  return response.data;
};

export const validateEmails = async (
  emails: string[]
): Promise<ValidateEmailsResponse> => {
  const response = await axiosBase.post<ValidateEmailsResponse>(
    "groups/validate-emails",
    { emails }
  );
  return response.data;
};

export const getGroupMatches = async (
  groupId: string,
  filters?: {
    stageId?: string;
    groupLetter?: string;
    status?: string;
  }
): Promise<GetMatchesResponse> => {
  
  const params = new URLSearchParams();
  if (filters?.stageId) params.append('stageId', filters.stageId);
  if (filters?.groupLetter) params.append('groupLetter', filters.groupLetter);
  if (filters?.status) params.append('status', filters.status);
  
  const queryString = params.toString();
  const url = `groups/${groupId}/matches${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await axiosBase.get<GetMatchesResponse>(url);
    console.log('response', response.data);
    return response.data;
  } catch (error: any) {
    console.warn('❌ Error in getGroupMatches:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const getGroupMatch = async (
  groupId: string,
  matchId: string
): Promise<GetMatchResponse> => {
  const response = await axiosBase.get<GetMatchResponse>(
    `groups/${groupId}/matches/${matchId}`
  );
  return response.data;
};

export const registerMatchResult = async (
  groupId: string,
  matchId: string,
  data: RegisterMatchResultRequest
): Promise<RegisterMatchResultResponse> => {
  const response = await axiosBase.post<RegisterMatchResultResponse>(
    `groups/${groupId}/matches/${matchId}/result`,
    data
  );
  return response.data;
};

export const savePrediction = async (
  groupId: string,
  matchId: string,
  data: SavePredictionRequest
): Promise<SavePredictionResponse> => {
  const response = await axiosBase.patch<SavePredictionResponse>(
    `groups/${groupId}/matches/${matchId}`,
    data
  );
  return response.data;
};

export const getGroupPredictions = async (
  groupId: string
): Promise<GetPredictionsResponse> => {
  const response = await axiosBase.get<GetPredictionsResponse>(
    `groups/${groupId}/predictions`
  );
  return response.data;
};

export const getMatchPrediction = async (
  groupId: string,
  matchId: string
): Promise<GetPredictionResponse> => {
  const response = await axiosBase.get<GetPredictionResponse>(
    `groups/${groupId}/matches/${matchId}/predict`
  );
  return response.data;
};

export const calculateScores = async (
  groupId: string
): Promise<CalculateScoresResponse> => {
  const response = await axiosBase.post<CalculateScoresResponse>(
    `groups/${groupId}/calculate-scores`
  );
  return response.data;
};

/**
 * Obtiene los IDs de los grupos del usuario para una competencia específica
 * 
 * Esta función es útil para obtener los `groupIds` que se deben enviar cuando se guarda una predicción.
 * Los `groupIds` son los IDs de los grupos donde el usuario fue agregado en la misma competencia.
 * 
 * @param competitionId - ID de la competencia para filtrar grupos
 * @returns Array de IDs de grupos (groupIds) donde el usuario participa en esa competencia
 * 
 * @example
 * // Obtener groupIds para enviar al guardar una predicción
 * const groupIds = await getGroupIdsForCompetition('club-world-cup');
 * await savePrediction(userId, {
 *   matchId: 'match-1',
 *   competitionId: 'club-world-cup',
 *   groupIds: groupIds, // Usar los IDs obtenidos
 *   ...
 * });
 */
export const getGroupIdsForCompetition = async (
  competitionId: string
): Promise<string[]> => {
  try {
    if (!competitionId || competitionId.trim() === '') {
      throw new Error('competitionId is required');
    }

    console.log('📤 [GROUPS] Getting group IDs for competition:', {
      competitionId,
    });

    // Obtener todos los grupos del usuario
    const response = await getUserGroups();

    // Filtrar grupos por competitionId y extraer los IDs
    // IMPORTANTE: Según documentación, usar _id PRIMERO (son los IDs de MongoDB)
    // Si no existe _id, usar groupId como fallback
    const groupIds = response.groups
      .filter((group) => group.competitionId === competitionId)
      .map((group) => (group as any)._id || group.groupId)
      .filter((id): id is string => !!id); // Filtrar valores null/undefined

    console.log('✅ [GROUPS] Group IDs retrieved:', {
      competitionId,
      groupIdsCount: groupIds.length,
      groupIds,
    });

    if (groupIds.length === 0) {
      console.warn('⚠️ [GROUPS] No groups found for competition:', {
        competitionId,
        message: 'User is not in any groups for this competition',
      });
    }

    return groupIds;
  } catch (error: any) {
    console.error('❌ [GROUPS] Error getting group IDs for competition:', {
      competitionId,
      error: error.response?.data || error.message,
      status: error.response?.status,
    });

    throw new Error(
      error.response?.data?.error ||
        error.message ||
        'Failed to get group IDs for competition'
    );
  }
};

/**
 * Actualiza el campo users (score y matchesInfo) en múltiples grupos
 * 
 * IMPORTANTE:
 * - Este es un endpoint INTERNO que debe ser llamado desde auth_service después de guardar una predicción
 * - El Frontend NO debería llamar este endpoint directamente en producción
 * - Este endpoint requiere autenticación especial (X-Service-Token) para service-to-service calls
 * - Si se llama desde el frontend, el token de usuario debe estar presente y el backend debe permitirlo
 * 
 * Este endpoint actualiza:
 * - users[].score: Score acumulado del usuario en cada grupo
 * - users[].matchesInfo: Array completo de predicciones del usuario para la competencia
 * 
 * @param request - Datos de la actualización
 * @returns Response con información de los grupos actualizados
 * 
 * @example
 * const result = await updateMatchesDetailMultiple({
 *   groupIds: ['groupId1', 'groupId2'],
 *   userId: 'userId123',
 *   competitionId: 'club-world-cup',
 *   matchesDetail: [...],
 *   userScore: 150
 * });
 */
export const updateMatchesDetailMultiple = async (
  request: UpdateMatchesDetailMultipleRequest
): Promise<UpdateMatchesDetailMultipleResponse> => {
  try {
    console.log('📤 [GROUPS] Updating matches detail in multiple groups:', {
      userId: request.userId,
      competitionId: request.competitionId,
      groupIdsCount: request.groupIds.length,
      matchesDetailCount: request.matchesDetail.length,
      userScore: request.userScore,
    });

    // Llamar al endpoint interno
    // NOTA: Este endpoint puede requerir X-Service-Token para autenticación service-to-service
    // El backend debería validar si el request viene del frontend autorizado o de otro servicio
    const response = await axiosBase.post<UpdateMatchesDetailMultipleResponse>(
      'groups/internal/update-matches-detail-multiple',
      request
    );

    console.log('✅ [GROUPS] Groups updated successfully:', {
      userId: response.data.userId,
      competitionId: response.data.competitionId,
      successCount: response.data.successCount,
      errorCount: response.data.errorCount,
      matchesDetailCount: response.data.matchesDetailCount,
      userScore: response.data.userScore,
    });

    if (response.data.errorCount > 0) {
      console.warn('⚠️ [GROUPS] Some groups failed to update:', {
        errorCount: response.data.errorCount,
        results: response.data.results.filter((r) => r.status === 'error'),
      });
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ [GROUPS] Error updating matches detail in multiple groups:', {
      userId: request.userId,
      competitionId: request.competitionId,
      groupIdsCount: request.groupIds.length,
      error: error.response?.data || error.message,
      status: error.response?.status,
    });

    throw new Error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to update matches detail in multiple groups'
    );
  }
};

