// POST /api/tournaments/[tournamentId]/sections/[sectionId]/pairings

import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongoose";
import Section from "@/lib/models/section.model";
import generatePairings from "@/engine/pairings/pairings";
import Player from "@/engine/player";

interface PlayerDocument {
  pairingNumber: number;
  name: string;
  rating: number;
  opponents: number[];
  results: string[];
  colors: string[];
  withdrawn: boolean;
}

export async function POST(
  req: Request,
  context: {params: Promise<{tournamentId: string; sectionId: string}>},
) {
  await connectToDB();
  const {sectionId} = await context.params;
  const section = await Section.findById(sectionId);

  if (!section) {
    return NextResponse.json({error: "Section not found"}, {status: 404});
  }

  if (section.currentRound >= section.numberRounds) {
    return NextResponse.json(
      {error: "Tournament is already complete"},
      {status: 400},
    );
  }

  // Map DB players to engine Player objects
  const enginePlayers = section.players
    .filter((p: PlayerDocument) => !p.withdrawn)
    .map(
      (p: PlayerDocument) =>
        new Player({
          id: p.pairingNumber,
          name: p.name,
          rating: p.rating,
          opponents: p.opponents,
          results: p.results,
          colors: p.colors,
        }),
    );

  const pairings = generatePairings(enginePlayers);

  if (pairings.length === 0) {
    return NextResponse.json(
      {error: "Could not generate valid pairings"},
      {status: 400},
    );
  }

  // Build the round document
  const roundNumber = section.currentRound + 1;
  const roundPairings = (pairings as Array<[Player, Player | null]>).map(
    ([white, black]) => ({
      white: white?.id ?? null,
      black: black?.id ?? null, // null = bye
      result: "-",
    }),
  );

  section.rounds.push({roundNumber, pairings: roundPairings});
  section.currentRound = roundNumber;
  await section.save();

  return NextResponse.json({roundNumber, pairings: roundPairings});
}
