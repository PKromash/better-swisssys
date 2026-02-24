import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongoose";
import Tournament from "@/lib/models/tournament.model";

export async function GET(
  req: Request,
  context: {params: Promise<{id: string}>},
) {
  try {
    await connectToDB();

    const {id} = await context.params;
    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return NextResponse.json({error: "Tournament not found"}, {status: 404});
    }
    return NextResponse.json(tournament);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error: "Failed to fetch tournament"},
      {status: 500},
    );
  }
}
