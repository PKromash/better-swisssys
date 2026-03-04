import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongoose";
import Section from "@/lib/models/section.model";

interface RouteContext {
  params: Promise<{tournamentId: string; sectionId: string}>;
}

export async function POST(req: Request, context: RouteContext) {
  try {
    await connectToDB();
    const {sectionId} = await context.params;
    const body = await req.json();

    const section = await Section.findById(sectionId);
    if (!section) {
      return NextResponse.json({error: "Section not found"}, {status: 404});
    }

    section.players.push(body);
    await section.save();

    const newPlayer = section.players[section.players.length - 1];
    return NextResponse.json(newPlayer, {status: 201});
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Failed to add player"}, {status: 500});
  }
}
