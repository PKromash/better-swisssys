import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongoose";
import Section from "@/lib/models/section.model";

export async function GET(
  req: Request,
  context: {params: Promise<{id: string}>},
) {
  try {
    await connectToDB();

    const {id} = await context.params;
    const section = await Section.findById(id);
    if (!section) {
      return NextResponse.json({error: "Section not found"}, {status: 404});
    }
    return NextResponse.json(section);
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: "Failed to fetch section"}, {status: 500});
  }
}

export async function PATCH(
  req: Request,
  context: {params: Promise<{id: string}>},
) {
  try {
    await connectToDB();

    const {id} = await context.params;
    const updateData = await req.json();

    const section = await Section.findByIdAndUpdate(id, updateData, {
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
