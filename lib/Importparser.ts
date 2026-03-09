import {TournamentFormValues} from "@/types/tournament-form";
import {ByeEntry} from "@/types/player-form";
// ─── Types matching the JSON format ──────────────────────────────────────────

interface ImportedPlayer {
  "Pair number": number;
  Name: string;
  ID: string;
  Rating: number | string;
  [key: string]: unknown;
}

interface ImportedSection {
  "Section name": string;
  Type: 0 | 1 | 2 | 3;
  "Number of players": number;
  Players: ImportedPlayer[];
  [key: string]: unknown;
}

interface ImportedTournament {
  Overview: {
    "Tournament title": string;
    [key: string]: unknown;
  };
  Sections: ImportedSection[];
}

export interface ParsedImport {
  tournamentData: TournamentFormValues;
  sectionsWithPlayers: {
    name: string;
    sectionType: 0 | 1 | 2 | 3;
    players: {
      name: string;
      USCF_id: string;
      rating: string;
      pairingNumber: number;
      state: string;
      byes: ByeEntry[];
      withdrawn: boolean;
    }[];
  }[];
}

// ─── Parser ───────────────────────────────────────────────────────────────────

export function parseImportFile(json: unknown): ParsedImport {
  const data = json as ImportedTournament;

  if (!data.Overview || !Array.isArray(data.Sections)) {
    throw new Error("Invalid file format: missing Overview or Sections");
  }

  const tournamentData: TournamentFormValues = {
    metadata: {
      name: data.Overview["Tournament title"] ?? "",
      startDate: "",
      endDate: "",
      affiliateID: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      chiefTD: "",
      assistantChiefTD: "",
    },
    tournamentDirectors: [{USCF_id: ""}],
    sections: data.Sections.map((s) => ({name: s["Section name"]})),
  };

  const sectionsWithPlayers = data.Sections.map((section) => ({
    name: section["Section name"],
    sectionType: section.Type,
    players: (section.Players ?? []).map((p) => ({
      name: p.Name ?? "",
      USCF_id: p.ID ?? "",
      rating: String(p.Rating ?? "unr"),
      pairingNumber: p["Pair number"] ?? 0,
      state: "",
      byes: [] as ByeEntry[],
      withdrawn: false,
    })),
  }));

  return {tournamentData, sectionsWithPlayers};
}
