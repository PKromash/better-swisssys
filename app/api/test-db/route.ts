import clientPromise from "@/lib/mongoose";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const collections = await db.listCollections().toArray();

    return Response.json({
      success: true,
      collections: collections.map((c) => c.name),
    });
  } catch (error) {
    console.error(error);
    return new Response("Database connection failed", {status: 500});
  }
}
