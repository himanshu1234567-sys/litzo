import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { decodeJWT, createJWT } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload: any = decodeJWT(token);

    const { firstName, lastName, email } = await req.json();

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await User.findOne({ phone: payload.phone });

    if (existing && existing.email) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { phone: payload.phone },
      {
        firstName,
        lastName,
        email,
      },
      { new: true, upsert: true }
    );

    const newToken = createJWT({
      userId: user._id.toString(),
      phone: user.phone,
      role: user.role,
      isSignup: 0
    });

    return NextResponse.json({
      success: true,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email
      },
      token: `Bearer ${newToken}`,
      isSignup: 0
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
