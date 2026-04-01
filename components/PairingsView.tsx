"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {Trophy, Layers, ChevronRight, Check, X} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Player {
  pairingNumber: number;
  name: string;
  rating: number | string;
  USCF_id?: string;
}

interface Pairing {
  white: number;
  black: number | null;
  result: string;
}

interface PairingsViewProps {
  tournamentId: string;
  sectionId: string;
  sectionName: string;
  roundNumber: number;
  pairings: Pairing[];
  playerMap: Record<string, Player>;
}

// ─── Result options ───────────────────────────────────────────────────────────

const RESULTS = [
  {value: "1-0", label: "1-0", title: "White wins"},
  {value: "0-1", label: "0-1", title: "Black wins"},
  {value: "1/2-1/2", label: "½-½", title: "Draw"},
  {value: "1F-0F", label: "1F-0F", title: "White forfeit win"},
  {value: "0F-1F", label: "0F-1F", title: "Black forfeit win"},
  {value: "0F-0F", label: "0F-0F", title: "Double forfeit"},
];

function resultColor(result: string) {
  if (result === "-") return "text-zinc-600";
  if (result === "1-0") return "text-amber-400";
  if (result === "0-1") return "text-blue-400";
  if (result === "1/2-1/2") return "text-emerald-400";
  return "text-zinc-400";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PairingsView({
  tournamentId,
  sectionId,
  sectionName,
  roundNumber,
  pairings: initialPairings,
  playerMap,
}: PairingsViewProps) {
  const router = useRouter();
  const [pairings, setPairings] = useState(initialPairings);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function submitResult(pairingIndex: number, result: string) {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/tournaments/${tournamentId}/sections/${sectionId}/rounds/${roundNumber}/pairings/${pairingIndex}`,
        {
          method: "PATCH",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({result}),
        },
      );
      if (!res.ok) throw new Error("Failed to save result");
      setPairings((prev) =>
        prev.map((p, i) => (i === pairingIndex ? {...p, result} : p)),
      );
      setOpenIndex(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const pending = pairings.filter((p) => p.result === "-").length;
  const complete = pairings.length - pending;

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            <span>{sectionName}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
                Round {roundNumber} Pairings
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {complete} of {pairings.length} results entered
              </p>
            </div>
            <button
              onClick={() =>
                router.push(
                  `/dashboard/tournament/${tournamentId}/section/${sectionId}/standings`,
                )
              }
              className="flex items-center gap-1 text-xs text-amber-400 transition hover:text-amber-300">
              Standings
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-500"
              style={{width: `${(complete / pairings.length) * 100}%`}}
            />
          </div>
        </div>

        {/* ── Column headers ──────────────────────────────────────── */}
        <div className="mb-2 grid grid-cols-[2rem_1fr_6rem_1fr] gap-2 px-1 text-xs font-medium uppercase tracking-widest text-zinc-600">
          <span className="ml-3">#</span>
          <span className="ml-2.5">White</span>
          <span className="text-center">Result</span>
          <span className="text-right mr-3">Black</span>
        </div>

        {/* ── Pairing rows ────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          {pairings.map((pairing, index) => {
            const white = playerMap[pairing.white];
            const black =
              pairing.black !== null ? playerMap[pairing.black] : null;
            const isOpen = openIndex === index;
            const isBye = pairing.black === null;

            return (
              <div
                key={index}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60">
                {/* Main row */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="grid w-full grid-cols-[2rem_1fr_6rem_1fr] items-center gap-2 px-4 py-3 text-left transition hover:bg-zinc-800/50">
                  {/* Board number */}
                  <span className="text-xs font-bold text-zinc-600">
                    {index + 1}
                  </span>

                  {/* White player */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 shrink-0 rounded-full border border-zinc-400 bg-white" />
                      <span
                        className="truncate text-sm font-medium text-zinc-100"
                        onClick={(e) => {
                          submitResult(index, RESULTS[0].value);
                          e.stopPropagation();
                        }}>
                        {white?.name ?? "—"}
                      </span>
                    </div>
                    <span className="mt-0.5 block pl-3.5 text-xs text-zinc-500">
                      {white?.rating ?? "—"}
                    </span>
                  </div>

                  {/* Result */}
                  <div className="flex justify-center">
                    <span
                      onClick={(e) => {
                        submitResult(index, RESULTS[2].value);
                        e.stopPropagation();
                      }}
                      className={`text-sm font-semibold tabular-nums ${resultColor(pairing.result)}`}>
                      {pairing.result === "-"
                        ? "—"
                        : pairing.result === "1/2-1/2"
                          ? "½-½"
                          : pairing.result}
                    </span>
                  </div>

                  {/* Black player / Bye */}
                  <div className="min-w-0">
                    {isBye ? (
                      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
                        BYE
                      </span>
                    ) : (
                      <>
                        {/* Black player */}
                        <div className="min-w-0 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span
                              className="truncate text-sm font-medium text-zinc-100"
                              onClick={(e) => {
                                submitResult(index, RESULTS[1].value);
                                e.stopPropagation();
                              }}>
                              {black?.name ?? "—"}
                            </span>
                            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-zinc-800 ring-1 ring-zinc-600" />
                          </div>
                          <span className="mt-0.5 block pr-3.5 text-xs text-zinc-500">
                            {black?.rating ?? "—"}
                          </span>
                        </div>{" "}
                      </>
                    )}
                  </div>
                </button>

                {/* Result entry dropdown */}
                {isOpen && !isBye && (
                  <div className="border-t border-zinc-800 px-4 py-3">
                    <p className="mb-2 text-xs text-zinc-500">Enter result</p>
                    <div className="flex flex-wrap gap-2">
                      {RESULTS.map((r) => (
                        <button
                          key={r.value}
                          disabled={saving}
                          onClick={() => submitResult(index, r.value)}
                          title={r.title}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition
                            ${
                              pairing.result === r.value
                                ? "border-amber-500 bg-amber-500/10 text-amber-400"
                                : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                            } disabled:cursor-not-allowed disabled:opacity-50`}>
                          {pairing.result === r.value && (
                            <Check className="h-3 w-3" />
                          )}
                          {r.label}
                        </button>
                      ))}
                      {/* {pairing.result !== "-" && (
                        <button
                          disabled={saving}
                          onClick={() => submitResult(index, "-")}
                          title="Clear result"
                          className="flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-600 transition hover:border-red-500/50 hover:text-red-400 disabled:opacity-50">
                          <X className="h-3 w-3" />
                          Clear
                        </button>
                      )} */}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
