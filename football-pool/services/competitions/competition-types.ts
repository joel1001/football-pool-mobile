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
}

export interface CompetitionsResponse {
  fifaNationalTeamCups: Competition[];
  fifaOfficialClubCups: Competition[];
  nationalClubLeagues: Competition[];
}

export type CompetitionDetailsResponse = Competition;


