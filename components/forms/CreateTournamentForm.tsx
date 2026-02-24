"use client";

import TournamentForm from "./TournamentForm";
import {createTournament} from "@/lib/actions/tournament.actions";
import {TournamentFormValues} from "@/types/tournament-form";

export default function CreateTournamentForm() {
  const handleSubmit = async (data: TournamentFormValues) => {
    await createTournament(data);
  };

  return (
    <TournamentForm onSubmit={handleSubmit} submitLabel="Create Tournament" />
  );
}
