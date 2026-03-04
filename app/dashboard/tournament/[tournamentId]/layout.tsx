import {notFound} from "next/navigation";
import {connectToDB} from "@/lib/mongoose";
import Tournament from "@/lib/models/tournament.model";
import Section from "@/lib/models/section.model";
import TournamentNavbar from "@/components/TournamentNavBar";

export default async function TournamentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{tournamentId: string}>;
}) {
  const {tournamentId} = await params;

  await connectToDB();
  void Section; // ensure Section schema is registered for populate

  const tournament = await Tournament.findById(tournamentId).lean<{
    metadata: {name: string};
  }>();

  console.log("Layout tournament:", tournament, "id:", tournamentId);

  if (!tournament) notFound();

  return (
    <div className="min-h-screen bg-zinc-950">
      <TournamentNavbar
        tournamentId={tournamentId}
        tournamentName={tournament.metadata.name}
      />
      {children}
    </div>
  );
}
