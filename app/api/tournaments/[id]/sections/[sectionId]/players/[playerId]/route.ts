import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongoose";
import Section from "@/lib/models/section.model";

interface RouteContext {
  params: Promise<{
    tournamentId: string;
    sectionId: string;
    playerId: string;
  }>;
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    await connectToDB();
    const {sectionId, playerId} = await context.params;
    const body = await req.json();

    const section = await Section.findById(sectionId);
    if (!section) {
      return NextResponse.json({error: "Section not found"}, {status: 404});
    }

    const player = section.players.id(playerId);
    if (!player) {
      return NextResponse.json({error: "Player not found"}, {status: 404});
    }

    // Apply updates
    Object.assign(player, body);
    await section.save();

    return NextResponse.json(player);
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Failed to update player"}, {status: 500});
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    await connectToDB();
    const {sectionId, playerId} = await context.params;

    const section = await Section.findById(sectionId);
    if (!section) {
      return NextResponse.json({error: "Section not found"}, {status: 404});
    }

    const player = section.players.id(playerId);
    if (!player) {
      return NextResponse.json({error: "Player not found"}, {status: 404});
    }

    player.deleteOne();
    await section.save();

    return NextResponse.json({success: true});
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Failed to delete player"}, {status: 500});
  }
}
