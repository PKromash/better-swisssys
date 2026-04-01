import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongoose";
import Section from "@/lib/models/section.model";
import calculateStandings from "@/engine/standings/standings";
import Player from "@/engine/player";

interface PlayerDocument {
  pairingNumber: number;
  name: string;
  rating: number;
  opponents: number[];
  results: string[];
  colors: string[];
  byes: string[];
  withdrawn: boolean;
}

interface Pairing {
  result: string;
}

export async function GET(
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

    if (section.currentRound === 0) {
      return NextResponse.json(
        {error: "No rounds have been played yet"},
        {status: 400},
      );
    }

    console.log("Current round pairings:", section.currentRound.pairings);
    const allResultsEntered = section.currentRound.pairings.every(
      (pairing: Pairing) => pairing.result !== "-",
    );

    if (!allResultsEntered) {
      return NextResponse.json(
        {error: "Not all results for the current round have been entered"},
        {status: 400},
      );
    }

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
            byes: p.byes,
          }),
      );

    const standings = calculateStandings(enginePlayers);

    // Map back to DB player data for the response
    const response = standings.map((enginePlayer, index) => {
      const dbPlayer = section.players.find(
        (p: PlayerDocument) => p.pairingNumber === enginePlayer.id,
      );
      return {
        place: index + 1,
        pairingNumber: dbPlayer.pairingNumber,
        name: dbPlayer.name,
        rating: dbPlayer.rating,
        score: enginePlayer.score,
        USCF_id: dbPlayer.USCF_id,
      };
    });

    return NextResponse.json({standings: response});
  } catch (error) {
    console.error("Error calculating standings:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
