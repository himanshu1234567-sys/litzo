import { NextResponse } from "next/server";
import { Cart } from "@/models/Cart";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cart = await Cart.findOne({ userId: user._id });

    return NextResponse.json({ success: true, cart });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
