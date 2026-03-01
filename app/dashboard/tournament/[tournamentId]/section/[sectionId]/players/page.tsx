import PlayerList from "@/components/PlayerList";

export default async function PlayersPage({
  params,
}: {
  params: Promise<{tournamentId: string; sectionId: string}>;
}) {
  const {tournamentId, sectionId} = await params;

  return <PlayerList tournamentId={tournamentId} sectionId={sectionId} />;
}
