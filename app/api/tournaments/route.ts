import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {connectToDB} from "@/lib/mongoose";
import Tournament from "@/lib/models/tournament.model";

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

    const {name} = await req.json();

    if (!name) {
      return NextResponse.json(
        {error: "Tournament name required"},
        {status: 400},
      );
    }

    await connectToDB();

    const tournament = await Tournament.create({
      metadata: {name},
      owner: session.user.id,
      players: [],
      rounds: [],
    });

    return NextResponse.json(tournament);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error: "Failed to create tournament"},
      {status: 500},
    );
  }
}
