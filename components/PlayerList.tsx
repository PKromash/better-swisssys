"use client";

import {useEffect, useState} from "react";
import {Plus, Pencil, Trash2, UserX, Users} from "lucide-react";
import PlayerFormModal from "@/components/PlayerFormModal";
import {PlayerFormValues} from "@/types/player-form";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Player extends PlayerFormValues {
  _id: string;
}

interface Section {
  _id: string;
  name: string;
  numberRounds: number;
  currentRound: number;
  players: Player[];
}

interface PlayerListProps {
  tournamentId: string;
  sectionId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlayerList({tournamentId, sectionId}: PlayerListProps) {
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [addDefaults, setAddDefaults] = useState<Partial<PlayerFormValues>>({});

  // ── Data fetching ──────────────────────────────────────────────────────────

  async function fetchSection() {
    try {
      const res = await fetch(
        `/api/tournaments/${tournamentId}/sections/${sectionId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch section");
      const data = await res.json();
      setSection(data);
    } catch (err) {
      setError("Failed to load section data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSection();
  }, [tournamentId, sectionId]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function openAdd() {
    setEditingPlayer(null);
    setModalMode("add");

    // Pre-populate 0-point byes for any rounds already completed (late entry)
    const missedRounds = section!.currentRound;
    const points = 0;
    if (missedRounds > 0) {
      setAddDefaults({
        byes: Array.from({length: missedRounds}, (_, i) => ({
          round: i + 1,
          points: points as 0,
        })),
      });
    } else {
      setAddDefaults({});
    }

    setModalOpen(true);
  }

  function openEdit(player: Player) {
    setEditingPlayer(player);
    setModalMode("edit");
    setModalOpen(true);
  }

  async function handleAddPlayer(data: PlayerFormValues) {
    const res = await fetch(
      `/api/tournaments/${tournamentId}/sections/${sectionId}/players`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      },
    );
    if (!res.ok) throw new Error("Failed to add player");
    await fetchSection();
  }

  async function handleEditPlayer(data: PlayerFormValues) {
    if (!editingPlayer) return;
    const res = await fetch(
      `/api/tournaments/${tournamentId}/sections/${sectionId}/players/${editingPlayer._id}`,
      {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      },
    );
    if (!res.ok) throw new Error("Failed to update player");
    await fetchSection();
  }

  async function handleDeletePlayer(playerId: string) {
    if (!confirm("Remove this player from the section?")) return;
    const res = await fetch(
      `/api/tournaments/${tournamentId}/sections/${sectionId}/players/${playerId}`,
      {method: "DELETE"},
    );
    if (!res.ok) throw new Error("Failed to delete player");
    await fetchSection();
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (error || !section) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-red-400">{error ?? "Section not found."}</p>
      </div>
    );
  }

  const players = [...section.players].sort((a, b) => {
    // Sort by rating descending; "unr" goes to the bottom
    const aRating = typeof a.rating === "number" ? a.rating : -Infinity;
    const bRating = typeof b.rating === "number" ? b.rating : -Infinity;
    const aNum = isNaN(Number(a.rating)) ? -Infinity : Number(a.rating);
    const bNum = isNaN(Number(b.rating)) ? -Infinity : Number(b.rating);
    return bNum - aNum;
  });

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-amber-400" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
                {section.name}
              </h1>
              <p className="text-xs text-zinc-500">
                {players.length} player{players.length !== 1 ? "s" : ""} ·{" "}
                {section.numberRounds} round
                {section.numberRounds !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400">
            <Plus className="h-4 w-4" />
            Register Player
          </button>
        </div>

        {/* Table */}
        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 py-20 text-center">
            <Users className="mb-3 h-8 w-8 text-zinc-600" />
            <p className="text-sm text-zinc-500">No players registered yet.</p>
            <button
              onClick={openAdd}
              className="mt-4 text-xs text-amber-400 underline underline-offset-2 hover:text-amber-300">
              Register the first player
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    USCF ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    State
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Byes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr
                    key={player._id}
                    className={`border-b border-zinc-800/60 transition hover:bg-zinc-800/40 ${
                      player.withdrawn ? "opacity-50" : ""
                    }`}>
                    <td className="px-4 py-3 text-zinc-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-zinc-100">
                      {player.name}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {player.USCF_id}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {player.state || "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {player.rating || "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {player.byes.length > 0
                        ? player.byes.map((b) => `R${b.round}`).join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {player.withdrawn ? (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <UserX className="h-3 w-3" />
                          Withdrawn
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-400">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(player)}
                          className="rounded p-1.5 text-zinc-500 transition hover:bg-zinc-700 hover:text-zinc-200"
                          aria-label="Edit player">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(player._id)}
                          className="rounded p-1.5 text-zinc-500 transition hover:bg-zinc-700 hover:text-red-400"
                          aria-label="Delete player">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <PlayerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={modalMode === "add" ? handleAddPlayer : handleEditPlayer}
        defaultValues={
          modalMode === "add" ? addDefaults : (editingPlayer ?? undefined)
        }
        numberRounds={section.numberRounds ?? 0}
        mode={modalMode}
      />
    </div>
  );
}
