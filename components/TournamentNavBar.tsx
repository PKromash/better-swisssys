"use client";

import {useEffect, useState} from "react";
import {useRouter, usePathname} from "next/navigation";
import {ChevronLeft, Trophy, Layers} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TournamentNavbarProps {
  tournamentId: string;
  tournamentName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Extracts sectionId from paths like:
// /tournament/[tournamentId]/section/[sectionId]
// /tournament/[tournamentId]/section/[sectionId]/players
function extractSectionId(pathname: string): string | null {
  const match = pathname.match(/\/section\/([^/]+)/);
  return match ? match[1] : null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TournamentNavbar({
  tournamentId,
  tournamentName,
}: TournamentNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const sectionId = extractSectionId(pathname);
  const [sectionName, setSectionName] = useState<string | null>(null);

  useEffect(() => {
    if (!sectionId) return;

    let cancelled = false;

    async function fetchSectionName() {
      try {
        const res = await fetch(
          `/api/tournaments/${tournamentId}/sections/${sectionId}`,
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setSectionName(data.name ?? null);
      } catch {
        // Non-critical
      }
    }

    fetchSectionName();

    return () => {
      cancelled = true;
      setSectionName(null); // cleanup runs outside render, so this is safe
    };
  }, [sectionId, tournamentId]);

  const isOnSectionPage = !!sectionId;
  const backTarget = isOnSectionPage
    ? `/dashboard/tournament/${tournamentId}`
    : "/dashboard";

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
        {/* Back button */}
        <button
          onClick={() => router.push(backTarget)}
          className="flex shrink-0 items-center gap-1 rounded-md p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
          aria-label="Go back">
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-zinc-800" />

        {/* Breadcrumb */}
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Trophy className="h-3.5 w-3.5 shrink-0 text-amber-400" />
          <button
            onClick={() => router.push(`/dashboard/tournament/${tournamentId}`)}
            className={`truncate transition ${
              isOnSectionPage
                ? "text-zinc-500 hover:text-zinc-300"
                : "text-zinc-100 hover:text-zinc-100"
            }`}>
            {tournamentName}
          </button>

          {isOnSectionPage && (
            <>
              <span className="shrink-0 text-zinc-700">/</span>
              <Layers className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span className="truncate text-zinc-100">
                {sectionName ?? "…"}
              </span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
