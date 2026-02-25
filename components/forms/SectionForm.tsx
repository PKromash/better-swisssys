"use client";

import {useEffect} from "react";
import {useForm} from "react-hook-form";
import {Layers} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SectionFormValues {
  name: string;
  timeControl: string;
  sectionChiefTD: string;
  sectionAssistantChiefTD: string;
  sectionType: 0 | 1 | 2 | 3;
  numberRounds: number;
  players: number;
  beginningDate: string;
  endDate: string;
}

interface SectionFormProps {
  onSubmit: (data: SectionFormValues) => Promise<void>;
  defaultValues?: Partial<SectionFormValues>;
  submitLabel?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTION_TYPES = [
  {value: 0, label: "Swiss"},
  {value: 1, label: "Round Robin"},
  {value: 2, label: "Double Round Robin"},
  {value: 3, label: "Match"},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcRounds(sectionType: number, players: number): number | null {
  if (sectionType === 1) return Math.max(0, players - 1);
  if (sectionType === 2) return Math.max(0, 2 * (players - 1));
  return null;
}

function isAutoCalculated(sectionType: number) {
  return sectionType === 1 || sectionType === 2;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-md border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50";

const selectCls =
  "w-full rounded-md border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500";

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

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SectionForm({
  onSubmit,
  defaultValues,
  submitLabel = "Save Section",
}: SectionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: {isSubmitting},
  } = useForm<SectionFormValues>({
    defaultValues: {
      name: "",
      timeControl: "",
      sectionChiefTD: "",
      sectionAssistantChiefTD: "",
      sectionType: 0,
      numberRounds: 0,
      players: 0,
      beginningDate: "",
      endDate: "",
      ...defaultValues,
    },
  });

  const sectionType = Number(watch("sectionType")) as 0 | 1 | 2 | 3;
  const players = Number(watch("players"));
  const autoCalculated = isAutoCalculated(sectionType);

  // Auto-calculate rounds when sectionType or players changes
  useEffect(() => {
    const rounds = calcRounds(sectionType, players);
    if (rounds !== null) {
      setValue("numberRounds", rounds);
    }
  }, [sectionType, players, setValue]);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <Layers className="mx-auto mb-3 h-8 w-8 text-amber-400" />
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            {submitLabel}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-10"
          noValidate>
          {/* ── General ──────────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <SectionHeader icon={Layers} title="General" />

            <Field label="Section Name">
              <input
                {...register("name")}
                placeholder="e.g. Open, U1800"
                className={inputCls}
              />
            </Field>

            <Field label="Section Type">
              <select
                {...register("sectionType", {valueAsNumber: true})}
                className={selectCls}>
                {SECTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Number of Players">
                <input
                  type="number"
                  min={0}
                  {...register("players", {valueAsNumber: true})}
                  className={inputCls}
                />
              </Field>

              <Field
                label="Number of Rounds"
                hint={
                  autoCalculated
                    ? "Auto-calculated from player count"
                    : undefined
                }>
                <input
                  type="number"
                  min={0}
                  {...register("numberRounds", {valueAsNumber: true})}
                  disabled={autoCalculated}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Time Control" hint="e.g. G/90;d5 or 40/120:SD/30;d5">
              <input
                {...register("timeControl")}
                placeholder="G/90;d5"
                className={inputCls}
              />
            </Field>
          </section>

          {/* ── Directors ────────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <SectionHeader icon={Layers} title="Directors" />

            <div className="grid grid-cols-2 gap-4">
              <Field label="Section Chief TD">
                <input
                  {...register("sectionChiefTD")}
                  placeholder="Full name or USCF ID"
                  className={inputCls}
                />
              </Field>
              <Field label="Assistant Chief TD">
                <input
                  {...register("sectionAssistantChiefTD")}
                  placeholder="Full name or USCF ID"
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          {/* ── Dates ────────────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <SectionHeader icon={Layers} title="Dates" />

            <div className="grid grid-cols-2 gap-4">
              <Field label="Beginning Date">
                <input
                  type="date"
                  {...register("beginningDate")}
                  className={inputCls}
                />
              </Field>
              <Field label="End Date">
                <input
                  type="date"
                  {...register("endDate")}
                  className={inputCls}
                />
              </Field>
            </div>
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
