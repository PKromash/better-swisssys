"use client";

import {useEffect, useRef, useState} from "react";
import {useRouter, usePathname} from "next/navigation";
import {ChevronLeft, Trophy, Layers, ChevronDown, LogOut} from "lucide-react";
import {signOut} from "next-auth/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TournamentNavbarProps {
  tournamentId: string;
  tournamentName: string;
  userName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractSectionId(pathname: string): string | null {
  const match = pathname.match(/\/section\/([^/]+)/);
  return match ? match[1] : null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TournamentNavbar({
  tournamentId,
  tournamentName,
  userName,
}: TournamentNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const sectionId = extractSectionId(pathname);
  const [sectionName, setSectionName] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ── Section name fetch ─────────────────────────────────────────────────────

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
      setSectionName(null);
    };
  }, [sectionId, tournamentId]);

  // ── Close menu on outside click ────────────────────────────────────────────

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
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

        {/* User menu */}
        <div className="relative shrink-0" ref={menuRef}>
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
  );
}
