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
    profileImage?: string; // Base64 string
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: string;
    predictions?: UserPrediction[]; // Array de predicciones del usuario
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
    profileImage?: string; // Base64 string
}

export interface UpdateUserProfileProps {
    profileImage?: string | null; // Base64 string o null para eliminar
    name?: string;
    lastName?: string;
    birth?: string;
    country?: string;
    state?: string;
    city?: string;
    phone?: string;
    zipcode?: string;
}

// Prediction types
export interface UserPrediction {
    groupId: string;
    matchId: string;
    team1Score: number;
    team2Score: number;
    predictedDate?: string;
    points?: number;
}

export interface SavePredictionRequest {
    groupId: string;
    matchId: string;
    team1Score: number;
    team2Score: number;
}

export interface SavePredictionResponse {
    message: string;
    userId: string;
    groupId: string;
    matchId: string;
}

export interface GetPredictionsResponse {
    predictions: UserPrediction[];
    count: number;
}

export interface GetPredictionResponse {
    prediction: UserPrediction | null;
}