import axiosBase from "../services-config";
import { LoginProps, SignUpProps, UserInfoProps, ForgotPasswordProps, ForgotPasswordResponse, ResetPasswordProps, ResetPasswordResponse, SocialAuthProps, SocialAuthResponse, CompleteSocialProfileProps, UpdateUserProfileProps, SavePredictionRequest, SavePredictionResponse, GetPredictionsResponse, GetPredictionResponse } from "./auth-types";

export const loginService = async (
    body: LoginProps
  ): Promise<UserInfoProps> => {
    const response = await axiosBase.post<UserInfoProps>("auth", body);
    return response.data;
  };

export const signUpService = async (
    body: SignUpProps
  ): Promise<UserInfoProps> => {
    const response = await axiosBase.post<UserInfoProps>("auth/create", body);
    return response.data;
  };

export const forgotPasswordService = async (
    body: ForgotPasswordProps
  ): Promise<ForgotPasswordResponse> => {
    const response = await axiosBase.post<ForgotPasswordResponse>("auth/forgot-password", body);
    return response.data;
  };

export const resetPasswordService = async (
    body: ResetPasswordProps
  ): Promise<ResetPasswordResponse> => {
    const response = await axiosBase.post<ResetPasswordResponse>("auth/reset-password", body);
    return response.data;
  };

export const socialAuthService = async (
    body: SocialAuthProps
  ): Promise<SocialAuthResponse> => {
    const response = await axiosBase.post<SocialAuthResponse>("auth/social", body);
    return response.data;
  };

export const completeSocialProfileService = async (
    body: CompleteSocialProfileProps
  ): Promise<UserInfoProps> => {
    const response = await axiosBase.put<UserInfoProps>("auth/complete-profile", body);
    return response.data;
  };

export const updateUserProfileService = async (
    userId: string,
    body: UpdateUserProfileProps
  ): Promise<UserInfoProps> => {
    const response = await axiosBase.patch<UserInfoProps>(`auth/id?userId=${userId}`, body);
    return response.data;
  };

/**
 * POST /auth/{userId}/predictions
 * Save or update a user prediction for a match
 */
export const saveUserPrediction = async (
    userId: string,
    body: SavePredictionRequest
  ): Promise<SavePredictionResponse> => {
    const response = await axiosBase.post<SavePredictionResponse>(
      `auth/${userId}/predictions`,
      body
    );
    return response.data;
  };

/**
 * GET /auth/{userId}/predictions?groupId={groupId}
 * Get all user predictions, optionally filtered by groupId
 */
export const getUserPredictions = async (
    userId: string,
    groupId?: string
  ): Promise<GetPredictionsResponse> => {
    const url = groupId 
      ? `auth/${userId}/predictions?groupId=${groupId}`
      : `auth/${userId}/predictions`;
    const response = await axiosBase.get<GetPredictionsResponse>(url);
    return response.data;
  };

/**
 * GET /auth/{userId}/predictions/{groupId}/{matchId}
 * Get a specific user prediction for a match
 */
export const getUserPrediction = async (
    userId: string,
    groupId: string,
    matchId: string
  ): Promise<GetPredictionResponse> => {
    const response = await axiosBase.get<GetPredictionResponse>(
      `auth/${userId}/predictions/${groupId}/${matchId}`
    );
    return response.data;
  };
