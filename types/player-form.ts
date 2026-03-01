export interface ByeEntry {
  round: number;
  points: 0 | 0.5 | 1;
}

export interface PlayerFormValues {
  name: string;
  USCF_id: string;
  state: string;
  rating: string;
  withdrawn: boolean;
  byes: ByeEntry[];
}
