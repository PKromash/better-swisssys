"use client";

import TournamentForm from "./TournamentForm";
import {createTournament} from "@/lib/actions/tournament.actions";
import {TournamentFormValues} from "@/types/tournament-form";
import {redirect} from "next/navigation";

export default function CreateTournamentForm() {
  const handleSubmit = async (data: TournamentFormValues) => {
    const tournament = await createTournament(data);
    redirect(`/dashboard/tournament/${tournament._id}`);
  };

  return (
    <TournamentForm onSubmit={handleSubmit} submitLabel="Create Tournament" />
  );
}
