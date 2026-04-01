"use client";

import {useRouter} from "next/navigation";
import {ChevronRight, Medal, Layers} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StandingEntry {
  place: number;
  pairingNumber: number;
  name: string;
  rating: number | string;
  score: number;
  USCF_id?: string;
}

interface StandingsViewProps {
  tournamentId: string;
  sectionId: string;
  standings: StandingEntry[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function placeStyle(place: number) {
  if (place === 1) return "text-amber-400 font-bold";
  if (place === 2) return "text-zinc-300 font-semibold";
  if (place === 3) return "text-amber-700 font-semibold";
  return "text-zinc-500";
}

function scoreBadgeStyle(score: number, maxScore: number) {
  const pct = score / maxScore;
  if (pct >= 0.8) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  if (pct >= 0.5) return "bg-zinc-800 text-zinc-300 border-zinc-700";
  return "bg-zinc-900 text-zinc-500 border-zinc-800";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StandingsView({
  tournamentId,
  sectionId,
  standings,
}: StandingsViewProps) {
  const router = useRouter();
  const maxScore = Math.max(...standings.map((s) => s.score));

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
              <Medal className="h-3.5 w-3.5 text-amber-400" />
              <span>Current Standings</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
              Standings
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {standings.length} player{standings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() =>
              router.push(
                `/dashboard/tournament/${tournamentId}/section/${sectionId}/pairings`,
              )
            }
            className="flex items-center gap-1 text-xs text-amber-400 transition hover:text-amber-300">
            Pairings
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Table header ────────────────────────────────────────── */}
        <div className="mb-2 grid grid-cols-[2.5rem_1fr_5rem_4rem] gap-2 px-4 text-xs font-medium uppercase tracking-widest text-zinc-600">
          <span>#</span>
          <span>Player</span>
          <span className="text-right">Rating</span>
          <span className="text-right">Score</span>
        </div>

        {/* ── Standings rows ───────────────────────────────────────── */}
        <div className="flex flex-col gap-1.5">
          {standings.map((entry, i) => {
            const isTop3 = entry.place <= 3;
            return (
              <div
                key={entry.pairingNumber}
                className={`grid grid-cols-[2.5rem_1fr_5rem_4rem] items-center gap-2 rounded-xl border px-4 py-3 transition
                  ${
                    isTop3
                      ? "border-zinc-700 bg-zinc-900"
                      : "border-zinc-800/60 bg-zinc-900/40"
                  }`}>
                {/* Place */}
                <span
                  className={`text-sm tabular-nums ${placeStyle(entry.place)}`}>
                  {entry.place}
                </span>

                {/* Player */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-100">
                    {entry.name}
                  </p>
                  {entry.USCF_id && (
                    <p className="text-xs text-zinc-600">{entry.USCF_id}</p>
                  )}
                </div>

                {/* Rating */}
                <span className="text-right text-sm tabular-nums text-zinc-400">
                  {entry.rating}
                </span>

                {/* Score */}
                <div className="flex justify-end">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-sm font-semibold tabular-nums ${scoreBadgeStyle(entry.score, maxScore)}`}>
                    {entry.score % 1 === 0
                      ? entry.score
                      : entry.score.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
