import {NextResponse} from "next/server";
import bcrypt from "bcrypt";
import {connectToDB} from "@/lib/mongoose";
import User from "@/lib/models/user.model";

export async function POST(req: Request) {
  try {
    await connectToDB();

    const {email, username, password, name} = await req.json();

    // Basic validation
    if (!email || !username || !password || !name) {
      return NextResponse.json(
        {error: "Missing required fields"},
        {status: 400},
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {error: "Password must be at least 8 characters"},
        {status: 400},
      );
    }

    // Prevent duplicate users
    const existingUser = await User.findOne({
      $or: [{email}, {username}],
    });

    if (existingUser) {
      return NextResponse.json({error: "User already exists"}, {status: 409});
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email,
      username,
      name,
      passwordHash,
    });

    // Never return sensitive fields
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          name: user.name,
        },
      },
      {status: 201},
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({error: "Failed to create user"}, {status: 500});
  }
}
