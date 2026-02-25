import ConfigureSectionForm from "@/components/forms/ConfigureSectionForm";

export default async function SectionConfigPage({
  params,
}: {
  params: Promise<{tournamentId: string; sectionId: string}>;
}) {
  const {tournamentId, sectionId} = await params;

  return (
    <ConfigureSectionForm
      tournamentId={tournamentId}
      sectionId={sectionId}
      // No defaultValues here = create/configure mode.
      // For edit mode, fetch the section server-side and pass it in:
      // defaultValues={existingSectionData}
    />
  );
}
