import {notFound} from "next/navigation";
import {connectToDB} from "@/lib/mongoose";
import Tournament from "@/lib/models/tournament.model";
import Section from "@/lib/models/section.model";
import EditTournamentForm from "@/components/forms/EditTournamentForm";
import {TournamentFormValues} from "@/types/tournament-form";

interface PageProps {
  params: Promise<{tournamentId: string}>;
}

function toDateInput(date: string | Date | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

export default async function EditTournamentPage({params}: PageProps) {
  const {tournamentId} = await params;

  await connectToDB();
  void Section;

  const tournament = await Tournament.findById(tournamentId)
    .populate("sections")
    .lean<{
      metadata: {
        name: string;
        startDate: string;
        endDate: string;
        affiliateID: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
        chiefTD: string;
        assistantChiefTD: string;
      };
      tournamentDirectors: {USCF_id: string}[];
      sections: {name: string}[];
    }>();

  if (!tournament) notFound();

  const defaultValues: TournamentFormValues = {
    metadata: {
      name: tournament.metadata.name ?? "",
      startDate: toDateInput(tournament.metadata.startDate),
      endDate: toDateInput(tournament.metadata.endDate),
      affiliateID: tournament.metadata.affiliateID ?? "",
      city: tournament.metadata.city ?? "",
      state: tournament.metadata.state ?? "",
      country: tournament.metadata.country ?? "",
      zipCode: tournament.metadata.zipCode ?? "",
      chiefTD: tournament.metadata.chiefTD ?? "",
      assistantChiefTD: tournament.metadata.assistantChiefTD ?? "",
    },
    tournamentDirectors: tournament.tournamentDirectors?.length
      ? tournament.tournamentDirectors
      : [{USCF_id: ""}],
    sections: tournament.sections.map((s) => ({name: s.name})),
  };

  const serialized = JSON.parse(JSON.stringify(defaultValues));

  return (
    <EditTournamentForm
      tournamentId={tournamentId}
      defaultValues={serialized}
    />
  );
}
