import {SectionFormValues} from "@/components/forms/SectionForm";

export async function configureSection(
  tournamentId: string,
  sectionId: string,
  data: SectionFormValues,
): Promise<void> {
  const res = await fetch(`/api/sections/${sectionId}`, {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to configure section");
  }
}
