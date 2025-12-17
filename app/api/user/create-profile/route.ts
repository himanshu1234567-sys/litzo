import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded: any = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { firstName, lastName, email } = await req.json();

    if (!firstName || !email) {
      return NextResponse.json(
        { error: "firstName, lastName, email required" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        firstName,
        lastName,
        email,
        isProfileCompleted: true
      },
      { new: true }
    );

    return NextResponse.json({ success: true, user });

  } catch (err) {
    console.error("Create Profile Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
