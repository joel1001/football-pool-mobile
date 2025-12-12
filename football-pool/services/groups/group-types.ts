export interface Team {
  teamId: string;
  teamName: string;
  teamFlag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position?: number; // Posición en la tabla
}

export interface ScoreboardUser {
  userId: string;
  userName: string;
  score: number;
  position: number;
  lastUpdated: string;
}

export interface Scoreboard {
  teams: Team[];
  users?: ScoreboardUser[]; // Usuarios con sus puntajes en el scoreboard
}

export interface GroupUser {
  userId: string;
  name?: string;
  email?: string;
}

export interface TournamentConfig {
  totalTeams: number;
  numberOfGroups: number;
  teamsPerGroup: number;
  teamsQualifyPerGroup: number;
  hasGroupStage?: boolean;
  hasKnockoutStage?: boolean;
  knockoutRounds?: string[];
}

export interface GroupStage {
  stageId: string;
  stageName: string;
  type: 'groups' | 'knockout';
  isActive: boolean;
  isCompleted?: boolean;
  order?: number;
  groups?: Array<{
    groupLetter: string;
    groupName: string;
    teamsPerGroup?: number;
    teamsQualify?: number;
    teams: Team[];
    qualifiedTeamIds?: string[];
    matches: Match[];
  }>;
  matches?: Match[];
  qualifiedTeamIds?: string[];
}

export interface TournamentStructure {
  tournamentFormat?: string;
  currentStage?: string;
  config?: TournamentConfig;
  stages?: {
    'group-stage'?: GroupStage;
    'round-of-16'?: GroupStage;
    'quarter-finals'?: GroupStage;
    'semi-finals'?: GroupStage;
    'third-place'?: GroupStage;
    'final'?: GroupStage;
    [key: string]: GroupStage | undefined;
  };
}

export interface Group {
  groupId: string;
  creatorUserId: string;
  competitionId: string;
  competitionName: string;
  name?: string;
  competitionImage?: string;
  teamIds: string[];
  userIds: string[];
  users?: GroupUser[]; // Información detallada de usuarios participantes
  invitedEmails: string[];
  scoreboard: Scoreboard;
  tournamentStructure?: TournamentStructure; // Estructura del torneo con matches
  totalBetAmount?: number; // Monto total que el grupo debe pagar
  equitableAmountPerUser?: number; // Monto equitativo por usuario (totalBetAmount / número de usuarios)
  paymentDeadline?: string | null; // Fecha límite de pago (calculada automáticamente: 15 días después de poolaAvailableDay)
  userPayments?: Record<string, {
    userId: string;
    userEmail: string;
    paymentAmount: number;
    hasPaid: boolean;
    paymentId: string | null;
    paidDate: string | null;
    isCreator: boolean;
  }>; // Estado de pagos por usuario
  createdAt: string;
  updatedAt: string;
  enabledAt?: string;
  disabledAt?: string | null;
}

export interface CreateGroupRequest {
  competitionId: string;
  category: 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues';
  name: string; // Required according to new spec
  totalBetAmount: number; // Required: Monto total que el grupo debe pagar (mínimo: $50 × número de usuarios)
  invitedEmails?: string[]; // Optional: emails of non-registered users
  userIds?: string[]; // Optional: IDs of existing users
}

export interface CreateGroupResponse {
  message: string;
  group: Group;
  invitedEmails?: number; // Count of emails sent
  addedUserIds?: number; // Count of users added
}

export interface CreateGroupConflictResponse {
  error: string;
  message: string;
  existingGroupId: string;
  existingGroupName: string;
  existingGroup: Group;
}

export interface GetGroupResponse {
  group: Group;
}

export interface GetUserGroupsResponse {
  groups: Group[];
  count: number;
}

export interface UpdateGroupRequest {
  userIds?: string[];
  invitedEmails?: string[];
  enabledAt?: number;
  disabledAt?: number | null;
  totalBetAmount?: number; // Monto total de apuesta
}

export interface UpdateGroupResponse {
  message: string;
  group: Group;
}

export interface InviteUserRequest {
  email: string;
}

export interface InviteUserResponse {
  message: string;
  invitedEmail: string;
}

export interface JoinGroupResponse {
  message: string;
  group: Group;
}

export interface DeleteGroupResponse {
  message: string;
}

export interface ValidatedUser {
  email: string;
  exists: boolean;
  userId?: string;
  name?: string;
  lastName?: string;
  profileImage?: string | null;
}

export interface ValidateEmailsRequest {
  emails: string[];
}

export interface ValidateEmailsResponse {
  users: ValidatedUser[];
  total: number;
  existing: number;
  nonExisting: number;
}

// Match types
export interface Match {
  matchId: string;
  matchNumber: string;
  stageId: string;
  groupLetter?: string | null;
  team1Id: string;
  team1Name: string;
  team1Flag: string;
  team2Id: string;
  team2Name: string;
  team2Flag: string;
  // Resultados reales (solo lectura para frontend)
  team1Score: number | null;
  team2Score: number | null;
  // Predicciones del usuario (el frontend puede modificar)
  userTeam1Score?: number | null;
  userTeam2Score?: number | null;
  winnerTeamId: string | null;
  loserTeamId: string | null;
  isDraw: boolean | null;
  matchDate: string | null;
  matchDay?: string | null; // Fecha del partido en formato ISO 8601
  playedDate: string | null;
  isPlayed: boolean;
  venue: string | null;
  status: 'scheduled' | 'in-progress' | 'finished' | 'postponed' | 'cancelled';
  matchday?: number | string | { $date: string } | null; // Número de jornada (1, 2, 3, etc.), fecha en formato ISO 8601, o objeto MongoDB Date {"$date": "..."}
  nextMatchId?: string | null;
  nextStageId?: string | null;
  // Campos para knockout stages (tiempo extra y penales)
  extraTime?: boolean | null;
  penalties?: boolean | null;
  penaltiesTeam1Score?: number | null;
  penaltiesTeam2Score?: number | null;
  // Predicciones del usuario para knockout
  userExtraTime?: boolean | null;
  userPenalties?: boolean | null;
  userPenaltiesTeam1Score?: number | null;
  userPenaltiesTeam2Score?: number | null;
}

export interface GetMatchesResponse {
  groupId: string;
  matches: Match[];
  count: number;
  filters: {
    stageId: string;
    groupLetter: string;
    status: string;
  };
}

export interface GetMatchResponse {
  groupId: string;
  match: Match;
}

export interface RegisterMatchResultRequest {
  team1Score: number;
  team2Score: number;
  playedDate?: string;
  venue?: string;
}

export interface RegisterMatchResultResponse {
  message: string;
  match: Match;
  groupId: string;
}

// Prediction types
export interface Prediction {
  groupId: string;
  matchId: string;
  team1Score: number;
  team2Score: number;
  predictedDate?: string;
  points?: number;
}

export interface SavePredictionRequest {
  userTeam1Score: number;
  userTeam2Score: number;
}

export interface SavePredictionResponse {
  message: string;
  match: Match;
}

export interface GetPredictionsResponse {
  userId: string;
  groupId: string;
  predictions: Prediction[];
  count: number;
}

export interface GetPredictionResponse {
  exists: boolean;
  prediction: Prediction | null;
}

export interface CalculateScoresResponse {
  message: string;
  groupId: string;
  totalMatchesProcessed: number;
  userScores: Record<string, number>;
}

// ================================================================================
// INTERNAL ENDPOINT TYPES - Update Matches Detail Multiple
// ================================================================================
// Tipos para el endpoint interno que actualiza score y matchesInfo en múltiples grupos

/**
 * Información detallada de un partido para actualizar en grupos
 * Este formato coincide con la estructura que el backend espera en matchesDetail
 */
export interface MatchDetailInfo {
  matchId: string;
  team1Id: string;
  team1Name: string;
  team1Flag: string;
  team2Id: string;
  team2Name: string;
  team2Flag: string;
  userTeam1Score: number;
  userTeam2Score: number;
  team1Score?: number; // Score real del equipo 1 (si el partido ya se jugó)
  team2Score?: number; // Score real del equipo 2 (si el partido ya se jugó)
  points?: number; // Puntos obtenidos por esta predicción
  matchDate: string; // Fecha del partido (ISO 8601)
  isPlayed: boolean;
  stageId: string; // ID de la etapa (ej: "group-stage", "round-of-16")
  groupLetter?: string; // Letra del grupo (solo para fase de grupos)
  // Campos opcionales para knockout stages
  userExtraTime?: boolean;
  userPenalties?: boolean;
  userPenaltiesTeam1Score?: number;
  userPenaltiesTeam2Score?: number;
  extraTime?: boolean;
  penalties?: boolean;
  penaltiesTeam1Score?: number;
  penaltiesTeam2Score?: number;
}

/**
 * Request para actualizar matches detail en múltiples grupos
 * Este endpoint es INTERNO y debe ser llamado desde auth_service después de guardar una predicción
 */
export interface UpdateMatchesDetailMultipleRequest {
  groupIds: string[]; // Lista de IDs de grupos donde se debe actualizar el usuario
  userId: string; // ID del usuario que hizo la predicción
  competitionId: string; // ID de la competencia
  matchesDetail: MatchDetailInfo[]; // Array con información de todas las predicciones del usuario para esta competencia
  userScore: number; // Score acumulado del usuario para esta competencia
}

/**
 * Resultado de la actualización de un grupo individual
 */
export interface GroupUpdateResult {
  groupId: string;
  status: 'success' | 'error';
  message: string;
}

/**
 * Response de actualizar matches detail en múltiples grupos
 */
export interface UpdateMatchesDetailMultipleResponse {
  message: string;
  successCount: number;
  errorCount: number;
  userId: string;
  competitionId: string;
  matchesDetailCount: number;
  userScore: number;
  results: GroupUpdateResult[];
}

