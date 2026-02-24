"use client";

import {useForm, useFieldArray} from "react-hook-form";
import {Plus, Trash2, Trophy, MapPin, Users, Layers} from "lucide-react";
import {TournamentFormValues} from "@/types/tournament-form";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TournamentFormProps {
  defaultValues?: Partial<TournamentFormValues>;
  onSubmit: (data: TournamentFormValues) => Promise<void>;
  submitLabel?: string;
}
// ─── Default empty values ─────────────────────────────────────────────────────

const emptyDefaults: TournamentFormValues = {
  metadata: {
    name: "",
    startDate: "",
    endDate: "",
    affiliateID: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    chiefTD: "",
    assistantChiefTD: "",
  },
  tournamentDirectors: [{USCF_id: ""}],
  sections: [{name: ""}],
};

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-md border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-zinc-700 pb-2">
      <Icon className="h-4 w-4 text-amber-400" />
      <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-400">
        {title}
      </h2>
    </div>
  );
}

function Field({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TournamentForm({
  defaultValues,
  onSubmit, // was: action
  submitLabel = "Create Tournament",
}: TournamentFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: {isSubmitting},
  } = useForm<TournamentFormValues>({
    defaultValues: defaultValues
      ? {...emptyDefaults, ...defaultValues}
      : emptyDefaults,
  });

  const {
    fields: directorFields,
    append: appendDirector,
    remove: removeDirector,
  } = useFieldArray({control, name: "tournamentDirectors"});

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({control, name: "sections"});

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <Trophy className="mx-auto mb-3 h-8 w-8 text-amber-400" />
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            {submitLabel}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-10"
          noValidate>
          {/* ── Tournament Info ─────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <SectionHeader icon={Trophy} title="Tournament Info" />

            <Field label="Tournament Name">
              <input
                {...register("metadata.name")}
                placeholder="e.g. Spring Open 2025"
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Date">
                <input
                  type="date"
                  {...register("metadata.startDate")}
                  className={inputCls}
                />
              </Field>
              <Field label="End Date">
                <input
                  type="date"
                  {...register("metadata.endDate")}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Affiliate ID">
              <input
                {...register("metadata.affiliateID")}
                placeholder="USCF Affiliate ID"
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Chief Tournament Director">
                <input
                  {...register("metadata.chiefTD")}
                  placeholder="USCF ID"
                  className={inputCls}
                />
              </Field>
              <Field label="Assistant Chief TD">
                <input
                  {...register("metadata.assistantChiefTD")}
                  placeholder="USCF ID"
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          {/* ── Location ────────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <SectionHeader icon={MapPin} title="Location" />

            <div className="grid grid-cols-2 gap-4">
              <Field label="City">
                <input
                  {...register("metadata.city")}
                  placeholder="City"
                  className={inputCls}
                />
              </Field>
              <Field label="State">
                <input
                  {...register("metadata.state")}
                  placeholder="State"
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Country">
                <input
                  {...register("metadata.country")}
                  placeholder="Country"
                  className={inputCls}
                />
              </Field>
              <Field label="Zip Code">
                <input
                  {...register("metadata.zipCode")}
                  placeholder="Zip Code"
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          {/* ── Tournament Directors ─────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <SectionHeader
              icon={Users}
              title="Additional Tournament Directors"
            />

            <div className="flex flex-col gap-2">
              {directorFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    {...register(`tournamentDirectors.${index}.USCF_id`)}
                    placeholder={`Director ${index + 1} USCF ID`}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => removeDirector(index)}
                    // disabled={directorFields.length === 1}
                    className="shrink-0 rounded-md p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Remove director">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => appendDirector({USCF_id: ""})}
              className="flex items-center gap-1.5 self-start rounded-md border border-dashed border-zinc-600 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-amber-500 hover:text-amber-400">
              <Plus className="h-3.5 w-3.5" />
              Add Director
            </button>
          </section>

          {/* ── Sections ─────────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <SectionHeader icon={Layers} title="Sections" />
            <p className="text-xs text-zinc-500">
              Name each section now — configure them individually after creating
              the tournament.
            </p>

            <div className="flex flex-col gap-2">
              {sectionFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    {...register(`sections.${index}.name`)}
                    placeholder={`Section ${index + 1} name (e.g. Open, U1800)`}
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    disabled={sectionFields.length === 1}
                    className="shrink-0 rounded-md p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Remove section">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => appendSection({name: ""})}
              className="flex items-center gap-1.5 self-start rounded-md border border-dashed border-zinc-600 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-amber-500 hover:text-amber-400">
              <Plus className="h-3.5 w-3.5" />
              Add Section
            </button>
          </section>

          {/* ── Submit ───────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-amber-500 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50">
            {isSubmitting ? "Saving…" : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
