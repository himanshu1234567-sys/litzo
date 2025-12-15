import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: Request) {
  await connectDB();

  const user = await getUserFromToken(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cart = await Cart.findOne({
    userId: user._id,
    status: "DRAFT",
  });

  return NextResponse.json({
    success: true,
    cart: cart || null,
  });
}
