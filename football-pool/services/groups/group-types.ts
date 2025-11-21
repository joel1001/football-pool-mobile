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
}

export interface Scoreboard {
  teams: Team[];
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
  team1Score: number | null;
  team2Score: number | null;
  winnerTeamId: string | null;
  loserTeamId: string | null;
  isDraw: boolean | null;
  matchDate: string | null;
  playedDate: string | null;
  isPlayed: boolean;
  venue: string | null;
  status: 'scheduled' | 'in-progress' | 'finished' | 'postponed' | 'cancelled';
  matchday?: number | null;
  nextMatchId?: string | null;
  nextStageId?: string | null;
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
  team1Score: number;
  team2Score: number;
}

export interface SavePredictionResponse {
  message: string;
  prediction: {
    userId: string;
    groupId: string;
    matchId: string;
    team1Score: number;
    team2Score: number;
  };
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

