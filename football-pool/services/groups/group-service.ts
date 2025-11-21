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

/**
 * GET /groups/:id
 * Get group details by ID
 */
export const getGroupById = async (id: string): Promise<GetGroupResponse> => {
  const response = await axiosBase.get<GetGroupResponse>(`groups/${id}`);
  return response.data;
};

/**
 * GET /groups
 * Get all groups where the user is creator or member
 */
export const getUserGroups = async (): Promise<GetUserGroupsResponse> => {
  const response = await axiosBase.get<GetUserGroupsResponse>("groups");
  return response.data;
};

/**
 * PUT /groups/:id
 * Update group completely (only creator)
 */
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

/**
 * PATCH /groups/:id
 * Update group partially (only creator)
 */
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

/**
 * DELETE /groups/:id
 * Delete group permanently (only creator)
 */
export const deleteGroup = async (id: string): Promise<DeleteGroupResponse> => {
  const response = await axiosBase.delete<DeleteGroupResponse>(`groups/${id}`);
  return response.data;
};

/**
 * POST /groups/:id/invite
 * Send invitation email to join the group
 */
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

/**
 * POST /groups/:id/join
 * Join a group (if invited)
 */
export const joinGroup = async (id: string): Promise<JoinGroupResponse> => {
  const response = await axiosBase.post<JoinGroupResponse>(
    `groups/${id}/join`,
    {}
  );
  return response.data;
};

/**
 * POST /groups/validate-emails
 * Validate if emails exist in the system (for modal)
 */
export const validateEmails = async (
  emails: string[]
): Promise<ValidateEmailsResponse> => {
  const response = await axiosBase.post<ValidateEmailsResponse>(
    "groups/validate-emails",
    { emails }
  );
  return response.data;
};

/**
 * GET /groups/:id/matches
 * Get all matches for a group (with optional filters)
 */
export const getGroupMatches = async (
  groupId: string,
  filters?: {
    stageId?: string;
    groupLetter?: string;
    status?: string;
  }
): Promise<GetMatchesResponse> => {
  // Debug logging
  console.log('🔍 DEBUG - getGroupMatches');
  console.log('Group ID:', groupId);
  console.log('Filters:', filters);
  
  const params = new URLSearchParams();
  if (filters?.stageId) params.append('stageId', filters.stageId);
  if (filters?.groupLetter) params.append('groupLetter', filters.groupLetter);
  if (filters?.status) params.append('status', filters.status);
  
  const queryString = params.toString();
  const url = `groups/${groupId}/matches${queryString ? `?${queryString}` : ''}`;
  
  console.log('Full URL:', url);
  console.log('Request will be made to:', `${axiosBase.defaults.baseURL}${url}`);
  
  try {
    const response = await axiosBase.get<GetMatchesResponse>(url);
    console.log('✅ getGroupMatches SUCCESS:', {
      count: response.data.count,
      matchesReceived: response.data.matches?.length || 0,
    });
    return response.data;
  } catch (error: any) {
    console.error('❌ Error in getGroupMatches:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

/**
 * GET /groups/:id/matches/:matchId
 * Get a specific match details
 */
export const getGroupMatch = async (
  groupId: string,
  matchId: string
): Promise<GetMatchResponse> => {
  const response = await axiosBase.get<GetMatchResponse>(
    `groups/${groupId}/matches/${matchId}`
  );
  return response.data;
};

/**
 * POST /groups/:id/matches/:matchId/result
 * Register match result (only creator)
 */
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

/**
 * POST /groups/:id/matches/:matchId/predict
 * Save or update user prediction for a match
 */
export const savePrediction = async (
  groupId: string,
  matchId: string,
  data: SavePredictionRequest
): Promise<SavePredictionResponse> => {
  const response = await axiosBase.post<SavePredictionResponse>(
    `groups/${groupId}/matches/${matchId}/predict`,
    data
  );
  return response.data;
};

/**
 * GET /groups/:id/predictions
 * Get all user predictions for a group
 */
export const getGroupPredictions = async (
  groupId: string
): Promise<GetPredictionsResponse> => {
  const response = await axiosBase.get<GetPredictionsResponse>(
    `groups/${groupId}/predictions`
  );
  return response.data;
};

/**
 * GET /groups/:id/matches/:matchId/predict
 * Get user prediction for a specific match
 */
export const getMatchPrediction = async (
  groupId: string,
  matchId: string
): Promise<GetPredictionResponse> => {
  const response = await axiosBase.get<GetPredictionResponse>(
    `groups/${groupId}/matches/${matchId}/predict`
  );
  return response.data;
};

/**
 * POST /groups/:id/calculate-scores
 * Calculate scores for all predictions (only creator)
 */
export const calculateScores = async (
  groupId: string
): Promise<CalculateScoresResponse> => {
  const response = await axiosBase.post<CalculateScoresResponse>(
    `groups/${groupId}/calculate-scores`
  );
  return response.data;
};

