export interface CreateGroupModalProps {
  visible: boolean;
  competitionId: string;
  competitionName: string;
  category: 'fifaNationalTeamCups' | 'fifaOfficialClubCups' | 'nationalClubLeagues';
  onClose: () => void;
  onCreate: (
    groupName: string | undefined,
    existingUserIds: string[],
    inviteEmails: string[],
    totalBetAmount: number
  ) => Promise<void>;
}


