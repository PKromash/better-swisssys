// POST /api/tournaments/[tournamentId]/sections/[sectionId]/pairings

import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongoose";
import Section from "@/lib/models/section.model";
import generatePairings from "@/engine/pairings/pairings";
import Player from "@/engine/player";

interface byeDocument {
  round: {
    type: number;
    required: true;
  };
  points: {
    type: number;
    required: true;
  };
}

interface PlayerDocument {
  pairingNumber: number;
  name: string;
  rating: number;
  opponents: number[];
  results: string[];
  colors: string[];
  withdrawn: boolean;
  byes: byeDocument[];
}

// interface byeObject {
//   round: number,
//   points: number,
// }

// function requestedBye(byeArray: Array<byeObject>, currRound: number) {
//   for (let i = 0; i < byeArray.length; ++i) {
//     if (byeArray[i].round === currRound) {
//       return true;
//     }
//   }
//   return false;
// }

export async function POST(
  req: Request,
  context: {params: Promise<{tournamentId: string; sectionId: string}>},
) {
  try {
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
      .filter(
        (p: PlayerDocument) =>
          !p.byes.find(
            (b: byeDocument) => b.round === section.currentRound + 1,
          ),
      )
      .map((p: PlayerDocument) => {
        const plain = {
          id: p.pairingNumber,
          name: p.name,
          rating: p.rating,
          opponents: [...p.opponents],
          results: [...p.results],
          colors: [...p.colors],
        };
        return new Player(plain);
      });

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
        black: black?.id ?? null, // null = didn't play
        result: black ? "-" : "X",
      }),
    );
    const requestedByes = section.players
      .filter((p: PlayerDocument) => !p.withdrawn)
      .filter((p: PlayerDocument) =>
        p.byes.find((b: byeDocument) => b.round === roundNumber),
      )
      .map((p: PlayerDocument) => ({
        white: p.pairingNumber,
        black: null,
        result: "B",
      }));

    roundPairings.push(...requestedByes);

    await Section.findByIdAndUpdate(sectionId, {
      $push: {rounds: {roundNumber, pairings: roundPairings}},
      $set: {currentRound: roundNumber},
    });

    return NextResponse.json({roundNumber, pairings: roundPairings});
  } catch (error) {
    console.error("Error generating pairings:", error);

    return NextResponse.json(
      {error: "Failed to generate pairings"},
      {status: 500},
    );
  }
}
