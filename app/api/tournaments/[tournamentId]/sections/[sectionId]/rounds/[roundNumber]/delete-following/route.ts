import {NextRequest, NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongoose";
import Section from "@/lib/models/section.model";

interface RouteContext {
  params: Promise<{
    tournamentId: string;
    sectionId: string;
    roundNumber: string;
  }>;
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const {sectionId, roundNumber} = await context.params;
    const targetRound = parseInt(roundNumber);

    await connectToDB();

    const section = await Section.findById(sectionId);
    if (!section) {
      return NextResponse.json({error: "Section not found"}, {status: 404});
    }

    // Validate that we're not deleting the current or earlier rounds incorrectly
    if (targetRound >= section.currentRound) {
      return NextResponse.json(
        {error: "Cannot delete the current round or future rounds"},
        {status: 400},
      );
    }

    // Remove all rounds after targetRound
    section.rounds = section.rounds.filter(
      (r: any) => r.roundNumber <= targetRound,
    );

    // Update currentRound to targetRound
    section.currentRound = targetRound;

    // Remove opponents, results, and colors from players for rounds after targetRound
    section.players = section.players.map((player: any) => ({
      ...player,
      opponents: player.opponents.slice(0, targetRound),
      results: player.results.slice(0, targetRound),
      colors: player.colors.slice(0, targetRound),
    }));

    await section.save();

    return NextResponse.json({
      success: true,
      message: `Deleted rounds after round ${targetRound}`,
      newCurrentRound: targetRound,
    });
  } catch (error) {
    console.error("Error deleting rounds:", error);
    return NextResponse.json({error: "Failed to delete rounds"}, {status: 500});
  }
}
