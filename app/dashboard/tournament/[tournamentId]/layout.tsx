import {notFound} from "next/navigation";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {connectToDB} from "@/lib/mongoose";
import Tournament from "@/lib/models/tournament.model";
import Section from "@/lib/models/section.model";
import TournamentNavbar from "@/components/TournamentNavBar";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{tournamentId: string}>;
}

export default async function TournamentLayout({
  children,
  params,
}: LayoutProps) {
  const {tournamentId} = await params;

  const session = await getServerSession(authOptions);
  const userName = session?.user?.name ?? "Unknown";

  await connectToDB();
  void Section;

  const tournament = await Tournament.findById(tournamentId).lean<{
    metadata: {name: string};
  }>();

  if (!tournament) notFound();

  return (
    <div className="min-h-screen bg-zinc-950">
      <TournamentNavbar
        tournamentId={tournamentId}
        tournamentName={tournament.metadata.name}
        userName={userName}
      />
      {children}
    </div>
  );
}
