"use client";

import {useRouter} from "next/navigation";
import {ChevronRight, Medal} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StandingEntry {
  place: number;
  pairingNumber: number;
  name: string;
  rating: number | string;
  score: number;
  USCF_id?: string;
  opponents?: number[];
  results?: string[];
  colors?: string[];
}

interface StandingsViewProps {
  tournamentId: string;
  sectionId: string;
  standings: StandingEntry[];
  currentRound: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// function placeStyle(place: number) {
//   if (place === 1) return "text-amber-400 font-bold";
//   if (place === 2) return "text-zinc-300 font-semibold";
//   if (place === 3) return "text-amber-700 font-semibold";
//   return "text-zinc-500";
// }

function getResultDisplay(
  result: string | undefined,
  opponentNumber: number | undefined,
  color: string | undefined,
) {
  if (!result || result === "U") return {text: "-", style: "text-zinc-700"};

  const displayText =
    opponentNumber !== undefined
      ? `${result + (opponentNumber !== 0 ? opponentNumber : "")}`
      : "-";

  let resultStyle = "";
  if (result === "W" || result === "1") {
    resultStyle = "text-green-400 font-semibold";
  } else if (result === "L" || result === "0") {
    resultStyle = "text-red-400";
  } else if (result === "D" || result === "0.5") {
    resultStyle = "text-yellow-400";
  } else if (result === "B" || result === "F") {
    resultStyle = "text-zinc-500 italic";
  }

  return {text: displayText, style: resultStyle};
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StandingsView({
  tournamentId,
  sectionId,
  standings,
  currentRound,
}: StandingsViewProps) {
  const router = useRouter();

  // Generate round columns
  const rounds = Array.from({length: currentRound}, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100">
      <div className="mx-auto max-w-7xl">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
              <Medal className="h-3.5 w-3.5 text-amber-400" />
              <span>Current Standings</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
              Crosstable
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {standings.length} player{standings.length !== 1 ? "s" : ""} •
              Round {currentRound}
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

        {/* ── Scrollable table container ───────────────────────────── */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
          <table className="w-full border-collapse text-sm">
            {/* Table Header */}
            <thead className="sticky top-0 bg-zinc-900 text-xs uppercase tracking-wider">
              <tr className="border-b border-zinc-800">
                <th className="border-r border-zinc-800 px-3 py-3 text-left font-medium text-zinc-500">
                  Rank
                </th>
                <th className="border-r border-zinc-800 px-4 py-3 text-left font-medium text-zinc-500">
                  Player
                </th>
                <th className="border-r border-zinc-800 px-3 py-3 text-right font-medium text-zinc-500">
                  Rating
                </th>
                {rounds.map((round) => (
                  <th
                    key={round}
                    className="border-r border-zinc-800 px-3 py-3 text-center font-medium text-zinc-500">
                    R{round}
                  </th>
                ))}
                <th className="px-3 py-3 text-right font-medium text-zinc-500">
                  Score
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {standings.map((entry) => {
                return (
                  <tr
                    key={entry.pairingNumber}
                    className={`border-b border-zinc-800/60 transition hover:bg-zinc-800/30`}>
                    {/* Place */}
                    <td className="border-r border-zinc-800 px-3 py-3 text-center tabular-nums">
                      {entry.place}
                    </td>

                    {/* Player Name */}
                    <td className="border-r border-zinc-800 px-4 py-3">
                      <div className="min-w-[200px]">
                        <p className="font-medium text-zinc-100">
                          {entry.name}
                        </p>
                        {entry.USCF_id && (
                          <p className="text-xs text-zinc-600">
                            {entry.USCF_id}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="border-r border-zinc-800 px-3 py-3 text-right tabular-nums text-zinc-400">
                      {entry.rating}
                    </td>

                    {/* Round Results */}
                    {rounds.map((round) => {
                      const roundIndex = round - 1;
                      const opponent = entry.opponents?.[roundIndex];
                      const result = entry.results?.[roundIndex];
                      const color = entry.colors?.[roundIndex];
                      const {text, style} = getResultDisplay(
                        result,
                        opponent,
                        color,
                      );

                      return (
                        <td
                          key={round}
                          className="border-r border-zinc-800 px-3 py-3 text-center tabular-nums">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className={style}>{text}</span>
                            {color && opponent !== undefined && (
                              <span className="text-[10px] text-zinc-600">
                                {color === "W"
                                  ? "⚪"
                                  : color === "B"
                                    ? "⚫"
                                    : ""}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Total Score */}
                    <td className="px-3 py-3 text-right">
                      <span className="font-bold tabular-nums text-amber-400">
                        {entry.score % 1 === 0
                          ? entry.score
                          : entry.score.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Legend ─────────────────────────────────────────────── */}
        <div className="mt-4 flex gap-6 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="text-green-400">●</span>
            <span>Win</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400">●</span>
            <span>Draw</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-400">●</span>
            <span>Loss</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>⚪</span>
            <span>White</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>⚫</span>
            <span>Black</span>
          </div>
        </div>
      </div>
    </div>
  );
}
