// app/api/address/list/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,

      // ✅ USER BASIC INFO
      user: {
        email: user.email ?? null,
        phone: user.phone,
      },

      // ✅ ADDRESS LIST
      addresses: user.addresses,
    });
  } catch (err) {
    console.error("LIST ADDRESS ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
