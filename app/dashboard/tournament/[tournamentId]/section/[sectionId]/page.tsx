import {notFound} from "next/navigation";
import {connectToDB} from "@/lib/mongoose";
import Section from "@/lib/models/section.model";
import Tournament from "@/lib/models/tournament.model";
import ConfigureSectionForm from "@/components/forms/ConfigureSectionForm";
import {SectionFormValues} from "@/types/section-form";

interface PageProps {
  params: Promise<{tournamentId: string; sectionId: string}>;
}

function toDateInput(date: string | Date | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

export default async function SectionConfigPage({params}: PageProps) {
  const {tournamentId, sectionId} = await params;

  await connectToDB();

  const [section, tournament] = await Promise.all([
    Section.findById(sectionId).lean<{
      name: string;
      timeControl: string;
      sectionChiefTD: string;
      sectionAssistantChiefTD: string;
      sectionType: 0 | 1 | 2 | 3;
      numberRounds: number;
      beginningDate: string;
      endDate: string;
    }>(),
    Tournament.findById(tournamentId).lean<{
      metadata: {startDate: string; endDate: string};
    }>(),
  ]);

  if (!section || !tournament) notFound();

  // Use section dates if set, otherwise fall back to tournament dates
  const defaultValues: SectionFormValues = {
    name: section.name ?? "",
    timeControl: section.timeControl ?? "",
    sectionChiefTD: section.sectionChiefTD ?? "",
    sectionAssistantChiefTD: section.sectionAssistantChiefTD ?? "",
    sectionType: section.sectionType ?? 0,
    numberRounds: section.numberRounds ?? 0,
    beginningDate:
      toDateInput(section.beginningDate) ||
      toDateInput(tournament.metadata.startDate),
    endDate:
      toDateInput(section.endDate) || toDateInput(tournament.metadata.endDate),
  };

  const serialized = JSON.parse(JSON.stringify(defaultValues));

  return (
    <ConfigureSectionForm
      tournamentId={tournamentId}
      sectionId={sectionId}
      defaultValues={serialized}
    />
  );
}
