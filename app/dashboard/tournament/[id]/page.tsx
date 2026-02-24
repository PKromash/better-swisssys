const page = async ({params}: {params: Promise<{id: string}>}) => {
  const {id} = await params;
  console.log("Tournament ID:", id);
  return <div>{id}</div>;
};
export default page;
