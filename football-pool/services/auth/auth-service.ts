import axiosBase from "../services-config";
import { LoginProps, SignUpProps, UserInfoProps, ForgotPasswordProps, ForgotPasswordResponse, ResetPasswordProps, ResetPasswordResponse, SocialAuthProps, SocialAuthResponse, CompleteSocialProfileProps, UpdateUserProfileProps } from "./auth-types";

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
