export interface LoginProps {
    email: string;
    password: string;
}

export interface SignUpProps {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    lastName: string;
    birth: string;
    country?: string;
    state?: string;
    city?: string;
    phone?: string;
    zipcode?: string;
    preferredTeams: string[];
    preferredLeagues: string[];
}

export interface UserInfoProps {
    _id: string;
    email: string;
    passwords: string[];
    name: string;
    birth: Date;
    preferredTeams: string[];
    preferredLeagues: string[];
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: string;
}

export interface ForgotPasswordProps {
    email: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
}

export interface ResetPasswordProps {
    email: string;
    code: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ResetPasswordResponse {
    success: boolean;
}

export interface SocialAuthProps {
    accessToken: string;
    provider: 'facebook' | 'google';
}

export interface SocialAuthResponse extends UserInfoProps {
    profileIncomplete?: boolean;
    missingFields?: string[];
}

export interface CompleteSocialProfileProps {
    preferredTeams: string[];
    preferredLeagues: string[];
    birth?: string;
    country?: string;
    state?: string;
    city?: string;
    phone?: string;
    zipcode?: string;
}