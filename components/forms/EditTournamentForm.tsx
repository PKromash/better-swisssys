"use client";

import {useRouter} from "next/navigation";
import TournamentForm from "@/components/forms/TournamentForm";
import {TournamentFormValues} from "@/types/tournament-form";
import {updateTournament} from "@/lib/actions/tournament.actions";

interface EditTournamentFormProps {
  tournamentId: string;
  defaultValues: TournamentFormValues;
}

export default function EditTournamentForm({
  tournamentId,
  defaultValues,
}: EditTournamentFormProps) {
  const router = useRouter();

  const handleSubmit = async (data: TournamentFormValues) => {
    await updateTournament(tournamentId, data);
    router.push(`/dashboard/tournament/${tournamentId}`);
  };

  return (
    <TournamentForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
    />
  );
}
