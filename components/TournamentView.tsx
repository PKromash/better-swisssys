"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {
  Trophy,
  Calendar,
  Layers,
  Users,
  Settings,
  Trash2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Section {
  _id: string;
  name: string;
  numberRounds: number;
  currentRound: number;
  sectionType: 0 | 1 | 2 | 3;
  players: {_id: string}[];
}

interface Tournament {
  _id: string;
  metadata: {
    name: string;
    startDate: string;
    endDate: string;
  };
  sections: Section[];
}

interface TournamentViewProps {
  tournamentId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SECTION_TYPE_LABELS: Record<number, string> = {
  0: "Swiss",
  1: "Round Robin",
  2: "Double Round Robin",
  3: "Match",
};

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isConfigured(section: Section) {
  return section.numberRounds > 0;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({label, value}: {label: string; value: string | number}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-sm font-semibold text-zinc-100">{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TournamentView({tournamentId}: TournamentViewProps) {
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(
    null,
  );

  // ── Data fetching ──────────────────────────────────────────────────────────

  async function fetchTournament() {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`);
      if (!res.ok) throw new Error("Failed to fetch tournament");
      const data = await res.json();
      setTournament(data);
    } catch (err) {
      setError("Failed to load tournament.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTournament();
  }, [tournamentId]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleDeleteSection(sectionId: string) {
    if (
      !confirm(
        "Delete this section? This will also remove all registered players.",
      )
    )
      return;
    setDeletingSectionId(sectionId);
    try {
      const res = await fetch(
        `/api/tournaments/${tournamentId}/sections/${sectionId}`,
        {method: "DELETE"},
      );
      if (!res.ok) throw new Error("Failed to delete section");
      await fetchTournament();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingSectionId(null);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-red-400">
          {error ?? "Tournament not found."}
        </p>
      </div>
    );
  }

  const {metadata, sections} = tournament;

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* ── Tournament Header ──────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="mt-0.5 h-6 w-6 shrink-0 text-amber-400" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
                {metadata.name || "Untitled Tournament"}
              </h1>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {formatDate(metadata.startDate)}
                  {metadata.endDate &&
                    metadata.endDate !== metadata.startDate &&
                    ` — ${formatDate(metadata.endDate)}`}
                </span>
              </div>
            </div>
          </div>

          <button
            // TODO
            onClick={() =>
              router.push(`/dashboard/tournament/${tournamentId}/edit`)
            }
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200">
            <Settings className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>

        {/* ── Sections ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Layers className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-400">
              Sections
            </h2>
          </div>

          {sections.length === 0 ? (
            <p className="text-sm text-zinc-500">No sections found.</p>
          ) : (
            <div className="space-y-3">
              {sections.map((section) => {
                const configured = isConfigured(section);
                const playerCount = section.players?.length ?? 0;
                const isDeleting = deletingSectionId === section._id;

                return (
                  <div
                    key={section._id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-zinc-700">
                    {/* Section header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-100">
                          {section.name}
                        </span>
                        {section.sectionType !== undefined && (
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
                            {SECTION_TYPE_LABELS[section.sectionType] ?? "—"}
                          </span>
                        )}
                        {!configured && (
                          <span className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-400">
                            <AlertTriangle className="h-3 w-3" />
                            Not configured
                          </span>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteSection(section._id)}
                        disabled={isDeleting}
                        className="shrink-0 rounded p-1.5 text-zinc-600 transition hover:bg-zinc-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Delete section">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Stats row */}
                    <div className="mt-3 flex items-center gap-3">
                      <StatPill label="Players" value={playerCount} />
                      <StatPill
                        label="Round"
                        value={
                          section.currentRound === 0
                            ? "Not started"
                            : `${section.currentRound} / ${section.numberRounds}`
                        }
                      />
                    </div>

                    {/* Action links */}
                    <div className="mt-4 flex items-center gap-2 border-t border-zinc-800 pt-3">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/tournament/${tournamentId}/section/${section._id}`,
                          )
                        }
                        className="flex items-center gap-1 text-xs text-zinc-400 transition hover:text-amber-400">
                        <Settings className="h-3.5 w-3.5" />
                        Configure
                        <ChevronRight className="h-3 w-3" />
                      </button>

                      <span className="text-zinc-700">·</span>

                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/tournament/${tournamentId}/section/${section._id}/players`,
                          )
                        }
                        className="flex items-center gap-1 text-xs text-zinc-400 transition hover:text-amber-400">
                        <Users className="h-3.5 w-3.5" />
                        Players
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
