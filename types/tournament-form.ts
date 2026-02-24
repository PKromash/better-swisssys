export interface TournamentFormValues {
  metadata: {
    name: string;
    startDate?: string;
    endDate?: string;
    affiliateID?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    chiefTD?: string;
    assistantChiefTD?: string;
  };
  tournamentDirectors?: {USCF_id: string}[];
  sections?: {name: string}[];
}
