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

export interface Group {
  groupId: string;
  creatorUserId: string;
  competitionId: string;
  competitionName: string;
  competitionImage?: string;
  teamIds: string[];
  userIds: string[];
  invitedEmails: string[];
  scoreboard: Scoreboard;
  createdAt: string;
  updatedAt: string;
  enabledAt?: string;
  disabledAt?: string | null;
}

export interface CreateGroupRequest {
  competitionId: string;
  category: 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues';
  name?: string;
}

export interface CreateGroupResponse {
  message: string;
  group: Group;
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

