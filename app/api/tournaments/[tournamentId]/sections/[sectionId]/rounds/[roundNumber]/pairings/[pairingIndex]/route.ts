import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongoose";
import Section from "@/lib/models/section.model";

interface Pairing {
  white: number;
  black: number | null;
  result: string;
}

interface Round {
  roundNumber: number;
  pairings: Pairing[];
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

const RESULT_MAP: Record<
  string,
  {white: string; black: string; whiteColor: string; blackColor: string}
> = {
  "1-0": {white: "W", black: "L", whiteColor: "W", blackColor: "B"},
  "0-1": {white: "L", black: "W", whiteColor: "W", blackColor: "B"},
  "1/2-1/2": {white: "D", black: "D", whiteColor: "W", blackColor: "B"},
  "1F-0F": {white: "FW", black: "FL", whiteColor: "X", blackColor: "X"},
  "0F-1F": {white: "FL", black: "FW", whiteColor: "X", blackColor: "X"},
  "0F-0F": {white: "FL", black: "FL", whiteColor: "X", blackColor: "X"},
};

export async function PATCH(
  req: Request,
  context: {
    params: Promise<{
      tournamentId: string;
      sectionId: string;
      roundNumber: string;
      pairingIndex: string;
    }>;
  },
) {
  await connectToDB();
  const {sectionId, roundNumber, pairingIndex} = await context.params;
  const {result} = await req.json();

  if (!RESULT_MAP[result]) {
    return NextResponse.json({error: "Invalid result"}, {status: 400});
  }

  const section = await Section.findById(sectionId);
  if (!section) {
    return NextResponse.json({error: "Section not found"}, {status: 404});
  }

  const round = section.rounds.find(
    (r: Round) => r.roundNumber === parseInt(roundNumber),
  );
  if (!round) {
    return NextResponse.json({error: "Round not found"}, {status: 404});
  }

  const pairing = round.pairings[parseInt(pairingIndex)];
  if (!pairing) {
    return NextResponse.json({error: "Pairing not found"}, {status: 404});
  }

  const previousResult = pairing.result;
  const wasPlayed = previousResult !== "-";
  pairing.result = result;

  const {white, black, whiteColor, blackColor} = RESULT_MAP[result];

  // Update white player
  const whitePlayer = section.players.find(
    (p: SectionPlayer) => p.pairingNumber === pairing.white,
  );
  if (whitePlayer) {
    if (wasPlayed) {
      // Overwrite the last entry for this round
      const idx = whitePlayer.opponents.length - 1;
      whitePlayer.opponents[idx] = pairing.black;
      whitePlayer.results[idx] = white;
      whitePlayer.colors[idx] = whiteColor;
    } else {
      whitePlayer.opponents.push(pairing.black);
      whitePlayer.results.push(white);
      whitePlayer.colors.push(whiteColor);
    }
  }

  // Update black player (null = bye round, no black player to update)
  if (pairing.black !== null) {
    const blackPlayer = section.players.find(
      (p: SectionPlayer) => p.pairingNumber === pairing.black,
    );
    if (blackPlayer) {
      if (wasPlayed) {
        const idx = blackPlayer.opponents.length - 1;
        blackPlayer.opponents[idx] = pairing.white;
        blackPlayer.results[idx] = black;
        blackPlayer.colors[idx] = blackColor;
      } else {
        blackPlayer.opponents.push(pairing.white);
        blackPlayer.results.push(black);
        blackPlayer.colors.push(blackColor);
      }
    }
  }

  section.markModified("players");
  section.markModified("rounds");
  await section.save();

  return NextResponse.json({success: true, pairing});
}
