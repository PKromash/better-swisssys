import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongoose";
import Tournament from "@/lib/models/tournament.model";
import Section from "@/lib/models/section.model";

void Section;

export async function GET(
  req: Request,
  context: {params: Promise<{tournamentId: string}>},
) {
  try {
    await connectToDB();

    const {tournamentId} = await context.params;
    const tournament =
      await Tournament.findById(tournamentId).populate("sections");

    if (!tournament) {
      return NextResponse.json({error: "Tournament not found"}, {status: 404});
    }
    return NextResponse.json({
      ...tournament.toObject(),
      _id: tournament._id.toString(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error: "Failed to fetch tournament"},
      {status: 500},
    );
  }
}

export async function PATCH(
  req: Request,
  context: {params: Promise<{tournamentId: string}>},
) {
  try {
    await connectToDB();

    const {tournamentId} = await context.params;
    const {sections, ...updateData} = await req.json();

    console.log("Received update data:", tournamentId, updateData);

    const tournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      {
        $set: {
          metadata: updateData.metadata,
          tournamentDirectors: updateData.tournamentDirectors,
        },
      },
      {new: true},
    );
    if (!tournament) {
      return NextResponse.json({error: "Tournament not found"}, {status: 404});
    }
    return NextResponse.json(tournament);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error: "Failed to update tournament"},
      {status: 500},
    );
  }
}
