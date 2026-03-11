"use client";

import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {signOut} from "next-auth/react";
import {
  Trophy,
  Plus,
  Calendar,
  Layers,
  Users,
  Trash2,
  ChevronRight,
  ChevronDown,
  LogOut,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Section {
  _id: string;
  name: string;
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

interface DashboardViewProps {
  tournaments: Tournament[];
  userName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(start: string, end: string) {
  const s = formatDate(start);
  const e = formatDate(end);
  if (!s) return "No dates set";
  if (!e || s === e) return s;
  return `${s} — ${e}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardView({
  tournaments: initial,
  userName,
}: DashboardViewProps) {
  const router = useRouter();
  const [tournaments, setTournaments] = useState(initial);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleDelete(tournamentId: string) {
    if (!confirm("Delete this tournament? This cannot be undone.")) return;
    setDeletingId(tournamentId);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete tournament");
      setTournaments((prev) => prev.filter((t) => t._id !== tournamentId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* ── Navbar ────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-zinc-100">
              SwissSys
            </span>
          </div>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200">
              <span className="max-w-[120px] truncate">{userName}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
                <button
                  onClick={() => signOut({callbackUrl: "/auth/signin"})}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-red-400">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            My Tournaments
          </h1>
          <button
            onClick={() => router.push("/dashboard/tournament/create")}
            className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400">
            <Plus className="h-4 w-4" />
            New Tournament
          </button>
        </div>

        {/* Tournament list */}
        {tournaments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 py-24 text-center">
            <Trophy className="mb-3 h-10 w-10 text-zinc-700" />
            <p className="text-sm text-zinc-500">No tournaments yet.</p>
            <button
              onClick={() => router.push("/dashboard/tournament/create")}
              className="mt-4 text-xs text-amber-400 underline underline-offset-2 hover:text-amber-300">
              Create your first tournament
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {tournaments.map((tournament) => {
              const totalPlayers = tournament.sections.reduce(
                (acc, s) => acc + (s.players?.length ?? 0),
                0,
              );
              const isDeleting = deletingId === tournament._id;

              return (
                <div
                  key={tournament._id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-zinc-700">
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-zinc-50">
                        {tournament.metadata.name || "Untitled Tournament"}
                      </h2>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {formatDateRange(
                            tournament.metadata.startDate,
                            tournament.metadata.endDate,
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => handleDelete(tournament._id)}
                        disabled={isDeleting}
                        className="rounded p-1.5 text-zinc-600 transition hover:bg-zinc-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Delete tournament">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/dashboard/tournament/${tournament._id}`)
                        }
                        className="flex items-center gap-1 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200">
                        Open
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-amber-400/70" />
                      {tournament.sections.length} section
                      {tournament.sections.length !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-amber-400/70" />
                      {totalPlayers} player
                      {totalPlayers !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Section breakdown */}
                  {tournament.sections.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tournament.sections.map((section) => (
                        <span
                          key={section._id}
                          className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-400">
                          {section.name}
                          <span className="ml-1.5 text-zinc-600">
                            {section.players?.length ?? 0}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
