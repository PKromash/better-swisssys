import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {connectToDB} from "@/lib/mongoose";
import Tournament from "@/lib/models/tournament.model";
import Section from "@/lib/models/section.model";
// GET → Load all tournaments for logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    await connectToDB();

    const tournaments = await Tournament.find({
      owner: session.user.id,
    }).sort({createdAt: -1});

    return NextResponse.json(tournaments);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error: "Failed to fetch tournaments"},
      {status: 500},
    );
  }
}

// POST → Create new tournament
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const {metadata, tournamentDirectors, sections, sectionsWithPlayers} =
      await req.json();

    // console.log("Received tournament data:", {
    //   metadata,
    //   tournamentDirectors,
    //   sections,
    //   sectionsWithPlayers,
    // });

    if (!metadata?.name) {
      return NextResponse.json(
        {error: "Tournament name required"},
        {status: 400},
      );
    }

    await connectToDB();

    let sectionDocs;

    if (sectionsWithPlayers?.length) {
      // Import path: create sections with pre-populated players and sectionType
      sectionDocs = await Section.insertMany(
        sectionsWithPlayers.map(
          (s: {name: string; sectionType: number; players: object[]}) => ({
            name: s.name,
            sectionType: s.sectionType,
            players: s.players,
          }),
        ),
      );
    } else {
      // Manual path: create stub sections with just a name
      sectionDocs = await Section.insertMany(
        (sections as {name: string}[]).map((s) => ({name: s.name})),
      );
    }

    const tournament = await Tournament.create({
      metadata,
      owner: session.user.id,
      tournamentDirectors: tournamentDirectors || [],
      sections: sectionDocs.map((s) => s._id),
    });

    return NextResponse.json({
      ...tournament.toObject(),
      _id: tournament._id.toString(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error: "Failed to create tournament"},
      {status: 500},
    );
  }
}
