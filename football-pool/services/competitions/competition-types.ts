export interface Competition {
  id: string;
  name: string;
  shortName: string;
  region?: string;
  country?: string;
  type?: 'national-team' | 'club';
  frequency?: string;
  image?: string;
  poolAvailableDay?: string;
  poolaAvailableDay?: string; // Backend typo support
  poolDisabledDate?: string | null;
  poolDisbaledDate?: string | null; // Backend typo support
  groupsKindTournament?: TournamentStructure; // Estructura del torneo con grupos, partidos y RESULTADOS REALES (específico para Club World Cup y otras competencias con grupos)
}

export interface CompetitionsResponse {
  fifaNationalTeamCups: Competition[];
  fifaOfficialClubCups: Competition[];
  nationalClubLeagues: Competition[];
}

export type CompetitionDetailsResponse = Competition;

export interface Team {
  id: string;
  name: string;
  country: string;
  flag?: string;
  image?: string;
  group?: string | null;
  seed?: number;
}

export type GetTeamsResponse = Team[];

// Tournament Structure Types
export interface TournamentMatch {
  matchId: string;
  matchNumber?: string;
  stageId?: string;
  team1Id: string;
  team1Name: string;
  team1Flag?: string;
  team2Id: string;
  team2Name: string;
  team2Flag?: string;
  team1Score?: number | null; // Resultado real
  team2Score?: number | null; // Resultado real
  isPlayed?: boolean;
  winnerTeamId?: string | null;
  isDraw?: boolean;
  extraTime?: boolean | null;
  penalties?: boolean | null;
  penaltiesTeam1Score?: number | null;
  penaltiesTeam2Score?: number | null;
  matchDate?: string | null;
  matchday?: number | string | { $date: string } | null;
  matchDay?: string | null;
  groupLetter?: string | null;
  status?: string;
}

// Team statistics for tournament groups (with stats like played, won, points, etc.)
export interface TournamentGroupTeam {
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
  position?: number;
}

export interface TournamentGroup {
  groupLetter: string;
  groupName: string;
  teamsPerGroup?: number;
  teamsQualify?: number;
  teams?: TournamentGroupTeam[]; // Teams with statistics
  matches?: TournamentMatch[];
  qualifiedTeamIds?: string[];
}

export interface TournamentStage {
  stageId: string;
  stageName?: string;
  type: 'groups' | 'knockout';
  groups?: TournamentGroup[];
  matches?: TournamentMatch[];
}

export interface TournamentStructure {
  tournamentFormat?: string;
  currentStage?: string;
  stages?: {
    [key: string]: TournamentStage | undefined;
  };
}

export interface GetTournamentStructureResponse {
  tournamentStructure: TournamentStructure;
}


