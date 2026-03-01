"use client";

import {useEffect} from "react";
import {useForm, useFieldArray} from "react-hook-form";
import {X, Plus, Trash2} from "lucide-react";
import {PlayerFormValues} from "@/types/player-form";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlayerFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PlayerFormValues) => Promise<void>;
  defaultValues?: Partial<PlayerFormValues>;
  /** Total rounds in the section — used to populate round dropdown */
  numberRounds: number;
  mode: "add" | "edit";
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500";

const selectCls =
  "w-full rounded border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500";

const emptyDefaults: PlayerFormValues = {
  name: "",
  USCF_id: "",
  state: "",
  rating: "",
  withdrawn: false,
  byes: [],
};

function Field({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlayerFormModal({
  open,
  onClose,
  onSubmit,
  defaultValues,
  numberRounds,
  mode,
}: PlayerFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: {isSubmitting},
  } = useForm<PlayerFormValues>({
    defaultValues: {...emptyDefaults, ...defaultValues},
  });

  const {
    fields: byeFields,
    append: appendBye,
    remove: removeBye,
  } = useFieldArray({control, name: "byes"});

  // Reset form when modal opens with new defaultValues
  useEffect(() => {
    if (open) {
      reset({...emptyDefaults, ...defaultValues});
    }
  }, [open, defaultValues, reset]);

  const handleFormSubmit = async (data: PlayerFormValues) => {
    await onSubmit(data);
    onClose();
  };

  if (!open) return null;

  const roundOptions = Array.from({length: numberRounds}, (_, i) => i + 1);

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-700 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-400">
            {mode === "add" ? "Register Player" : "Edit Player"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-5 px-6 py-5"
          noValidate>
          {/* Name + USCF ID */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name">
              <input
                {...register("name")}
                placeholder="Full name"
                className={inputCls}
              />
            </Field>
            <Field label="USCF ID">
              <input
                {...register("USCF_id")}
                placeholder="12345678"
                className={inputCls}
              />
            </Field>
          </div>

          {/* State + Rating */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="State">
              <input
                {...register("state")}
                placeholder="e.g. FL"
                className={inputCls}
              />
            </Field>
            <Field label="Rating">
              <input
                {...register("rating")}
                placeholder="e.g. 1850 or unr"
                className={inputCls}
              />
            </Field>
          </div>

          {/* Withdrawn (edit mode only) */}
          {mode === "edit" && (
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                {...register("withdrawn")}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-amber-500"
              />
              <span className="text-sm text-zinc-300">Withdrawn</span>
            </label>
          )}

          {/* Byes */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Byes</span>
              <button
                type="button"
                onClick={() => appendBye({round: 1, points: 1})}
                disabled={numberRounds === 0}
                className="flex items-center gap-1 rounded border border-dashed border-zinc-600 px-2 py-1 text-xs text-zinc-400 transition hover:border-amber-500 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-30">
                <Plus className="h-3 w-3" />
                Add Bye
              </button>
            </div>

            {byeFields.length === 0 && (
              <p className="text-xs text-zinc-600">No byes assigned.</p>
            )}

            {byeFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <select
                    {...register(`byes.${index}.round`, {
                      valueAsNumber: true,
                    })}
                    className={selectCls}>
                    {roundOptions.map((r) => (
                      <option key={r} value={r}>
                        Round {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <select
                    {...register(`byes.${index}.points`, {
                      valueAsNumber: true,
                    })}
                    className={selectCls}>
                    <option value={0}>0 pts</option>
                    <option value={0.5}>½ pt</option>
                    <option value={1}>1 pt</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => removeBye(index)}
                  className="rounded p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-red-400"
                  aria-label="Remove bye">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-zinc-700 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting
                ? "Saving…"
                : mode === "add"
                  ? "Register"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
