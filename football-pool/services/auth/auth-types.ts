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
    groupScores?: Record<string, number>; // Contador de puntos por grupo: { "groupId": totalPoints }
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
    matchId: string; // OBLIGATORIO
    team1Score: number; // OBLIGATORIO
    team2Score: number; // OBLIGATORIO
    groupIds: string[]; // REQUERIDO: Array con los IDs de los grupos donde guardar la predicción
    // Campos opcionales para ayudar al backend
    competitionId?: string; // OPCIONAL: Para ayudar al backend a calcular puntos si el partido ya se jugó
    category?: 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues'; // OPCIONAL: Para ayudar al backend a calcular puntos
    userExtraTime?: boolean | null; // Opcional, solo para fases de eliminación
    userPenalties?: boolean | null; // Opcional, solo para fases de eliminación
    userPenaltiesTeam1Score?: number | null; // Opcional, solo para fases de eliminación
    userPenaltiesTeam2Score?: number | null; // Opcional, solo para fases de eliminación
}

// Respuesta de un grupo donde se aplicó la predicción
export interface GroupAppliedResult {
    groupId: string;
    groupName: string;
    pointsCalculated: boolean; // true si el partido ya se jugó
    points: number; // puntos ganados (si pointsCalculated = true)
    totalScore: number; // Score total del usuario en este grupo
}

export interface SavePredictionResponse {
    message: string;
    userId: string;
    matchId: string;
    team1Score?: number;
    team2Score?: number;
    userExtraTime?: boolean | null;
    userPenalties?: boolean | null;
    userPenaltiesTeam1Score?: number | null;
    userPenaltiesTeam2Score?: number | null;
    groupsApplied?: GroupAppliedResult[]; // Lista de grupos donde se aplicó la predicción
    // Campos legacy para compatibilidad (deprecados, usar groupsApplied)
    groupId?: string;
    pointsCalculated?: boolean; // true si se calcularon los puntos automáticamente
    points?: number; // puntos obtenidos por esta predicción
    totalScore?: number; // Score total en el grupo
}

export interface GetPredictionsResponse {
    userId: string;
    groupId?: string; // Puede ser "all" si no se filtró por grupo
    predictions: UserPrediction[];
    count: number;
    totalScore?: number; // Score total para este grupo (de groupScores)
}

export interface GetPredictionResponse {
    prediction: UserPrediction | null;
}