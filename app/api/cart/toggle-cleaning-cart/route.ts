import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { getUserFromToken } from "@/lib/auth";
import { calculateBill } from "@/lib/cartUtils";

export async function POST(req: Request) {
  await connectDB();

  const user = await getUserFromToken(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { enabled } = await req.json();

  let cart = await Cart.findOne({
    userId: user._id,
    status: "DRAFT",
  });

  if (!cart) {
    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }

  cart.bill.cleaningKitFee = enabled ? 15 : 0;

  calculateBill(cart);
  await cart.save();

  return NextResponse.json({
    success: true,
    cart
  });
}
