"use client";

import {useEffect, useState} from "react";
import SectionForm, {SectionFormValues} from "./SectionForm";
import {configureSection} from "@/lib/actions/section.actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfigureSectionFormProps {
  tournamentId: string;
  sectionId: string;
  /** Pass existing section data to enable edit mode */
  defaultValues?: Partial<SectionFormValues>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateInput(date: string | Date | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConfigureSectionForm({
  tournamentId,
  sectionId,
  defaultValues,
}: ConfigureSectionFormProps) {
  const [tournamentDefaults, setTournamentDefaults] = useState<
    Partial<SectionFormValues>
  >({});
  const [loading, setLoading] = useState(!defaultValues);

  // Fetch tournament to get default dates (only needed when not in edit mode,
  // since edit mode will already have dates from the existing section)
  useEffect(() => {
    if (defaultValues) return;

    async function fetchTournament() {
      try {
        const res = await fetch(`/api/tournaments/${tournamentId}`);
        if (!res.ok) throw new Error("Failed to fetch tournament");
        const data = await res.json();

        setTournamentDefaults({
          beginningDate: toDateInput(data.metadata?.startDate),
          endDate: toDateInput(data.metadata?.endDate),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTournament();
  }, [tournamentId, defaultValues]);

  const handleSubmit = async (data: SectionFormValues) => {
    await configureSection(tournamentId, sectionId, data);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  return (
    <SectionForm
      onSubmit={handleSubmit}
      defaultValues={defaultValues ?? tournamentDefaults}
      submitLabel={defaultValues ? "Save Changes" : "Configure Section"}
    />
  );
}
