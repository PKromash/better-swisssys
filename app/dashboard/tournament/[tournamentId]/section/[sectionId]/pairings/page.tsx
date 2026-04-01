import {notFound} from "next/navigation";
import {connectToDB} from "@/lib/mongoose";
import Section from "@/lib/models/section.model";
import PairingsView from "@/components/PairingsView";

interface PageProps {
  params: Promise<{tournamentId: string; sectionId: string}>;
}

interface DbPlayer {
  pairingNumber: number;
  name: string;
  rating: number | string;
  USCF_id?: string;
}

interface DbPairing {
  white: number;
  black: number | null;
  result: string;
}

interface DbRound {
  roundNumber: number;
  pairings: DbPairing[];
}

export default async function PairingsPage({params}: PageProps) {
  const {tournamentId, sectionId} = await params;

  await connectToDB();

  const section = await Section.findById(sectionId).lean<{
    name: string;
    currentRound: number;
    players: DbPlayer[];
    rounds: DbRound[];
  }>();

  if (!section) notFound();

  if (section.currentRound === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-zinc-500">No pairings have been generated yet.</p>
      </div>
    );
  }

  const currentRound = section.rounds.find(
    (r) => r.roundNumber === section.currentRound,
  );

  if (!currentRound) notFound();

  const playerMap = Object.fromEntries(
    section.players.map((p) => [p.pairingNumber, p]),
  );

  const serialized = JSON.parse(
    JSON.stringify({section, currentRound, playerMap}),
  );

  return (
    <PairingsView
      tournamentId={tournamentId}
      sectionId={sectionId}
      sectionName={serialized.section.name}
      roundNumber={serialized.section.currentRound}
      pairings={serialized.currentRound.pairings}
      playerMap={serialized.playerMap}
    />
  );
}
