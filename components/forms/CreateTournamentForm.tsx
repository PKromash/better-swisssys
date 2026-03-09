"use client";

import {useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {Upload, X, FileJson} from "lucide-react";
import TournamentForm from "@/components/forms/TournamentForm";
import {TournamentFormValues} from "@/types/tournament-form";
import {createTournament} from "@/lib/actions/tournament.actions";
import {parseImportFile, ParsedImport} from "@/lib/Importparser";

export default function CreateTournamentForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importedData, setImportedData] = useState<ParsedImport | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // ── Import handling ────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const parsed = parseImportFile(json);
        setImportedData(parsed);
      } catch (err) {
        setImportError(
          err instanceof Error ? err.message : "Failed to parse file",
        );
        setImportedData(null);
        setFileName(null);
      }
    };
    reader.readAsText(file);
  }

  function clearImport() {
    setImportedData(null);
    setImportError(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (data: TournamentFormValues) => {
    const payload = importedData
      ? {...data, sectionsWithPlayers: importedData.sectionsWithPlayers}
      : data;

    const tournament = await createTournament(payload);
    router.push(`/dashboard/tournament/${tournament._id}`);
  };

  return (
    <div>
      {/* Import banner */}
      <div className="mx-auto max-w-2xl px-4 pt-12">
        {!importedData ? (
          <div className="mb-8 rounded-xl border border-dashed border-zinc-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-300">
                  Import from file
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Upload a ChessRegister JSON file to pre-fill the form
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-md border border-zinc-600 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-amber-500 hover:text-amber-400">
                <Upload className="h-3.5 w-3.5" />
                Choose file
              </button>
            </div>

            {importError && (
              <p className="mt-3 text-xs text-red-400">{importError}</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".sjson"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="mb-8 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4">
            <div className="flex items-center gap-3">
              <FileJson className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-sm font-medium text-zinc-200">{fileName}</p>
                <p className="text-xs text-zinc-500">
                  {importedData.sectionsWithPlayers.length} section
                  {importedData.sectionsWithPlayers.length !== 1
                    ? "s"
                    : ""},{" "}
                  {importedData.sectionsWithPlayers.reduce(
                    (acc, s) => acc + s.players.length,
                    0,
                  )}{" "}
                  players imported
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearImport}
              className="rounded p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
              aria-label="Clear import">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {/* Form — pre-filled with import data if available */}
      <TournamentForm
        key={importedData ? "imported" : "empty"}
        defaultValues={importedData?.tournamentData}
        onSubmit={handleSubmit}
        submitLabel="Create Tournament"
      />
    </div>
  );
}
