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

