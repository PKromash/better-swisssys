import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongoose";
import Tournament from "@/lib/models/tournament.model";
import Section from "@/lib/models/section.model";

interface RouteContext {
  params: Promise<{tournamentId: string; sectionId: string}>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    await connectToDB();
    const {sectionId} = await context.params;

    const section = await Section.findById(sectionId);
    if (!section) {
      return NextResponse.json({error: "Section not found"}, {status: 404});
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Failed to fetch section"}, {status: 500});
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    await connectToDB();
    const {sectionId} = await context.params;
    const body = await req.json();

    const section = await Section.findByIdAndUpdate(sectionId, body, {
      new: true,
    });
    if (!section) {
      return NextResponse.json({error: "Section not found"}, {status: 404});
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error: "Failed to update section"},
      {status: 500},
    );
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    await connectToDB();
    const {tournamentId, sectionId} = await context.params;

    // Remove section document
    await Section.findByIdAndDelete(sectionId);

    // Remove reference from tournament
    await Tournament.findByIdAndUpdate(tournamentId, {
      $pull: {sections: sectionId},
    });

    return NextResponse.json({success: true});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error: "Failed to delete section"},
      {status: 500},
    );
  }
}
