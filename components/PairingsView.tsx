"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {
  Trophy,
  Layers,
  ChevronRight,
  Check,
  X,
  ChevronDown,
  Trash2,
  AlertTriangle,
} from "lucide-react";

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

interface RoundData {
  roundNumber: number;
  pairings: Pairing[];
}

interface PairingsViewProps {
  tournamentId: string;
  sectionId: string;
  sectionName: string;
  currentRound: number;
  allRounds: RoundData[];
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
  currentRound,
  allRounds,
  playerMap,
}: PairingsViewProps) {
  const router = useRouter();
  const [selectedRound, setSelectedRound] = useState(currentRound);
  const [pairings, setPairings] = useState(
    allRounds.find((r) => r.roundNumber === currentRound)?.pairings || [],
  );
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showRoundSelector, setShowRoundSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isCurrentRound = selectedRound === currentRound;
  const canDeleteFollowingRounds = selectedRound < currentRound;

  function handleRoundChange(roundNumber: number) {
    setSelectedRound(roundNumber);
    const round = allRounds.find((r) => r.roundNumber === roundNumber);
    if (round) {
      setPairings(round.pairings);
      setOpenIndex(null);
    }
    setShowRoundSelector(false);
  }

  async function submitResult(pairingIndex: number, result: string) {
    if (!isCurrentRound) return; // Can't edit past rounds

    setSaving(true);
    try {
      const res = await fetch(
        `/api/tournaments/${tournamentId}/sections/${sectionId}/rounds/${selectedRound}/pairings/${pairingIndex}`,
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

  async function deleteFollowingRounds() {
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/tournaments/${tournamentId}/sections/${sectionId}/rounds/${selectedRound}/delete-following`,
        {
          method: "DELETE",
          headers: {"Content-Type": "application/json"},
        },
      );
      if (!res.ok) throw new Error("Failed to delete rounds");

      // Refresh the page to reload the updated data
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete rounds. Please try again.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
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
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
                  Round {selectedRound} Pairings
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  {complete} of {pairings.length} results entered
                </p>
              </div>

              {/* Round selector dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowRoundSelector(!showRoundSelector)}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800">
                  Change Round
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {showRoundSelector && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowRoundSelector(false)}
                    />
                    {/* Dropdown */}
                    <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
                      {allRounds
                        .slice()
                        .reverse()
                        .map((round) => (
                          <button
                            key={round.roundNumber}
                            onClick={() => handleRoundChange(round.roundNumber)}
                            className={`w-full px-4 py-2 text-left text-sm transition ${
                              round.roundNumber === selectedRound
                                ? "bg-amber-500/10 text-amber-400"
                                : "text-zinc-300 hover:bg-zinc-800"
                            }`}>
                            <div className="flex items-center justify-between">
                              <span>Round {round.roundNumber}</span>
                              {round.roundNumber === currentRound && (
                                <span className="text-xs text-zinc-500">
                                  (current)
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </div>
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

          {/* Warning for past rounds */}
          {!isCurrentRound && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-blue-400">
                <span>ℹ️</span>
                <span>
                  Viewing past round (read-only). Switch to Round {currentRound}{" "}
                  to edit results.
                </span>
              </div>
              {canDeleteFollowingRounds && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 transition hover:border-red-500/50 hover:bg-red-500/20">
                  <Trash2 className="h-3 w-3" />
                  Delete Following Rounds
                </button>
              )}
            </div>
          )}

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
                  onClick={() =>
                    isCurrentRound && setOpenIndex(isOpen ? null : index)
                  }
                  disabled={!isCurrentRound}
                  className={`grid w-full grid-cols-[2rem_1fr_6rem_1fr] items-center gap-2 px-4 py-3 text-left transition ${
                    isCurrentRound
                      ? "hover:bg-zinc-800/50"
                      : "cursor-default opacity-75"
                  }`}>
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
                          if (isCurrentRound) {
                            submitResult(index, RESULTS[0].value);
                            e.stopPropagation();
                          }
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
                        if (isCurrentRound) {
                          submitResult(index, RESULTS[2].value);
                          e.stopPropagation();
                        }
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
                                if (isCurrentRound) {
                                  submitResult(index, RESULTS[1].value);
                                  e.stopPropagation();
                                }
                              }}>
                              {black?.name ?? "—"}
                            </span>
                            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-zinc-800 ring-1 ring-zinc-600" />
                          </div>
                          <span className="mt-0.5 block pr-3.5 text-xs text-zinc-500">
                            {black?.rating ?? "—"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </button>

                {/* Result entry dropdown */}
                {isOpen && !isBye && isCurrentRound && (
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
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Delete Confirmation Modal ──────────────────────────── */}
        {showDeleteConfirm && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
                {/* Header */}
                <div className="mb-4 flex items-start gap-3">
                  <div className="rounded-lg bg-red-500/10 p-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-50">
                      Delete Following Rounds?
                    </h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <p className="mb-2 text-sm text-zinc-300">
                    You are about to delete:
                  </p>
                  <ul className="space-y-1.5 text-sm text-zinc-400">
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">•</span>
                      <span>
                        Rounds {selectedRound + 1} through {currentRound}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">•</span>
                      <span>
                        {currentRound - selectedRound} round
                        {currentRound - selectedRound === 1 ? "" : "s"} of
                        pairings and results
                      </span>
                    </li>
                  </ul>
                  <div className="mt-3 border-t border-zinc-800 pt-3">
                    <p className="text-xs text-zinc-500">
                      The tournament will roll back to the end of Round{" "}
                      {selectedRound}. You'll need to re-pair and re-enter
                      results for subsequent rounds.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50">
                    Cancel
                  </button>
                  <button
                    onClick={deleteFollowingRounds}
                    disabled={deleting}
                    className="flex-1 rounded-lg border border-red-500/50 bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50">
                    {deleting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Deleting...
                      </span>
                    ) : (
                      "Delete Rounds"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
