import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongoose";
import Tournament from "@/lib/models/tournament.model";
import Section from "@/lib/models/section.model";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {sections, ...updateData} = await req.json();

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

export async function DELETE(
  req: Request,
  context: {params: Promise<{tournamentId: string}>},
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    await connectToDB();
    const {tournamentId} = await context.params;

    const tournament = await Tournament.findById(tournamentId).lean<{
      owner: string;
      sections: string[];
    }>();

    if (!tournament) {
      return NextResponse.json({error: "Tournament not found"}, {status: 404});
    }

    // Ensure the user owns this tournament
    if (tournament.owner.toString() !== session.user.id) {
      return NextResponse.json({error: "Forbidden"}, {status: 403});
    }

    // Delete all associated sections
    await Section.deleteMany({_id: {$in: tournament.sections}});

    // Delete the tournament
    await Tournament.findByIdAndDelete(tournamentId);

    return NextResponse.json({success: true});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error: "Failed to delete tournament"},
      {status: 500},
    );
  }
}
