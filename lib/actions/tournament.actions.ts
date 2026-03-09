import {TournamentFormValues} from "@/types/tournament-form";

export async function fetchTournaments() {
  const res = await fetch("/api/tournaments");
  const data = await res.json();
  return data;
}

export async function createTournament(
  data: TournamentFormValues,
): Promise<{_id: string}> {
  const res = await fetch("/api/tournaments", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create tournament");
  }

  return res.json();
}

export async function updateTournament(
  tournamentId: string,
  data: TournamentFormValues,
): Promise<void> {
  const res = await fetch(`/api/tournaments/${tournamentId}`, {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update tournament");
  }
}
