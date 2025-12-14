import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await User.findById(user._id).select("addresses");

    return NextResponse.json({
      success: true,
      addresses: dbUser?.addresses || [],
    });

  } catch (err) {
    console.error("Address List Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
