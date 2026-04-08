import {notFound} from "next/navigation";
import {connectToDB} from "@/lib/mongoose";
import Section from "@/lib/models/section.model";
import calculateStandings from "@/engine/standings/standings";
import Player from "@/engine/player";
import StandingsView from "@/components/StandingsView";

interface PageProps {
  params: Promise<{tournamentId: string; sectionId: string}>;
}

interface SectionPlayer {
  pairingNumber: number;
  name: string;
  rating: number | string;
  USCF_id?: string;
  opponents: number[];
  results: string[];
  colors: string[];
  withdrawn: boolean;
}

interface EnginePlayer {
  id: number;
  score: number;
}

export default async function StandingsPage({params}: PageProps) {
  const {tournamentId, sectionId} = await params;

  await connectToDB();

  const section = await Section.findById(sectionId).lean<{
    currentRound: number;
    players: SectionPlayer[];
  }>();

  if (!section) notFound();

  if (section.currentRound === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-zinc-500">No rounds have been played yet.</p>
      </div>
    );
  }

  const enginePlayers = section.players
    .filter((p) => !p.withdrawn)
    .map(
      (p) =>
        new Player({
          id: p.pairingNumber,
          name: p.name,
          rating: p.rating,
          opponents: [...p.opponents],
          results: [...p.results],
          colors: [...p.colors],
        }),
    );

  const standingsResult = calculateStandings(enginePlayers);

  const standings = standingsResult.map((ep: EnginePlayer, index: number) => {
    const dbPlayer = section.players.find((p) => p.pairingNumber === ep.id)!;
    return {
      place: index + 1,
      pairingNumber: dbPlayer.pairingNumber,
      name: dbPlayer.name,
      rating: dbPlayer.rating,
      score: ep.score,
      USCF_id: dbPlayer.USCF_id,
      opponents: dbPlayer.opponents,
      results: dbPlayer.results,
      colors: dbPlayer.colors,
    };
  });

  return (
    <StandingsView
      tournamentId={tournamentId}
      sectionId={sectionId}
      standings={standings}
      currentRound={section.currentRound}
    />
  );
}
