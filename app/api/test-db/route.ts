// app/api/test-db/route.ts
import mongoose from "mongoose";
import {connectToDB} from "@/lib/mongoose";

// To test this route, send a GET request to /api/test-db

export async function GET() {
  try {
    await connectToDB();

    const db = mongoose.connection.db;
    if (!db) {
      return new Response("Database not initialized", {status: 500});
    }

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
