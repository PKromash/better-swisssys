import {NextResponse} from "next/server";
import {connectToDB} from "@/lib/mongoose";
import Tournament from "@/lib/models/tournament.model";
import Section from "@/lib/models/section.model";
import JSZip from "jszip";

void Section;

// eslint-disable-next-line @typescript-eslint/no-require-imports
const generateDBFFiles = require("../../../../../../engine/DBF/dbfFormat") as (
  tournament: unknown,
  sections: unknown[],
  isTest?: boolean,
) => {THExport: Buffer; TSExport: Buffer; TDExport: Buffer};

export async function GET(
  _req: Request,
  context: {params: Promise<{tournamentId: string}>},
) {
  try {
    await connectToDB();
    const {tournamentId} = await context.params;

    const raw = await Tournament.findById(tournamentId)
      .populate("sections")
      .lean<{
        metadata: {
          name: string;
          startDate: Date;
          endDate: Date;
          affiliateID?: string;
          city?: string;
          state?: string;
          zipCode?: string;
          country?: string;
          chiefTD?: string;
          assistantChiefTD?: string;
        };
        tournamentDirectors: {USCF_id: string}[];
        sections: unknown[];
      }>();

    if (!raw) {
      return NextResponse.json({error: "Tournament not found"}, {status: 404});
    }

    const tournamentData = {
      name: raw.metadata.name,
      sections: raw.sections,
      startDate: new Date(raw.metadata.startDate),
      endDate: new Date(raw.metadata.endDate),
      affiliateID: raw.metadata.affiliateID,
      city: raw.metadata.city,
      state: raw.metadata.state,
      zipCode: raw.metadata.zipCode,
      country: raw.metadata.country,
      chiefTD: raw.metadata.chiefTD,
      assistantChiefTD: raw.metadata.assistantChiefTD,
      tournamentDirectors: raw.tournamentDirectors,
    };

    const {THExport, TSExport, TDExport} = generateDBFFiles(
      tournamentData,
      raw.sections,
    );

    const zip = new JSZip();
    zip.file("TH.DBF", THExport);
    zip.file("TS.DBF", TSExport);
    zip.file("TD.DBF", TDExport);

    const zipBuffer = await zip.generateAsync({type: "nodebuffer"});
    const filename = `${raw.metadata.name || "tournament"}.zip`;

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {error: "Failed to generate DBF files"},
      {status: 500},
    );
  }
}
