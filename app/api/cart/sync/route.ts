import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { getUserFromToken } from "@/lib/auth";
import { calculateBill } from "@/lib/cartUtils";

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { items } = await req.json();
    if (!items || !items.length)
      return NextResponse.json({ error: "Items required" }, { status: 400 });

    let cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      cart = new Cart({
        userId: user._id,
        items,
        status: "DRAFT",
      });
    } else {
      cart.items = items; // 🔥 SYNC = overwrite snapshot
    }

    // ✅ SINGLE SOURCE OF TRUTH
    calculateBill(cart);

    await cart.save();

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (err) {
    console.error("CART SYNC ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
