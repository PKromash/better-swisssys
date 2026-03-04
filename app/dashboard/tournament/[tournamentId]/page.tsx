import TournamentView from "@/components/TournamentView";

interface PageProps {
  params: Promise<{tournamentId: string}>;
}

export default async function TournamentPage({params}: PageProps) {
  const {tournamentId} = await params;
  return <TournamentView tournamentId={tournamentId} />;
}
