const page = async ({params}: {params: Promise<{tournamentId: string}>}) => {
  const {tournamentId} = await params;
  console.log("Tournament ID:", tournamentId);
  return <div>{tournamentId}</div>;
};
export default page;
