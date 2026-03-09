"use client";

import {useRouter} from "next/navigation";
import SectionForm from "@/components/forms/SectionForm";
import {SectionFormValues} from "@/types/section-form";
import {configureSection} from "@/lib/actions/section.actions";

interface ConfigureSectionFormProps {
  tournamentId: string;
  sectionId: string;
  defaultValues: SectionFormValues;
}

export default function ConfigureSectionForm({
  tournamentId,
  sectionId,
  defaultValues,
}: ConfigureSectionFormProps) {
  const router = useRouter();

  const handleSubmit = async (data: SectionFormValues) => {
    await configureSection(tournamentId, sectionId, data);
    router.push(`/dashboard/tournament/${tournamentId}`);
  };

  return (
    <SectionForm
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
      submitLabel="Save Section"
    />
  );
}
