import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { getUserFromToken } from "@/lib/auth";
import { calculateBill } from "@/lib/cartUtils";

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { enabled } = await req.json();

    if (enabled === undefined) {
      return NextResponse.json(
        { error: "enabled flag required (true/false)" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({
      userId: user._id,
      status: "DRAFT",
    });

    if (!cart) {
      return NextResponse.json(
        { error: "No active cart found" },
        { status: 404 }
      );
    }

    // store kit selection in booking details
    cart.bookingDetails.cleaningKitRequired = enabled;

    // add ₹15 fee if enabled
    cart.bill.cleaningFee = enabled ? 15 : 0;

    // recalc totals
    calculateBill(cart);

    await cart.save();

    return NextResponse.json({
      success: true,
      cleaningKit: enabled,
      cart,
    });
  } catch (err) {
    console.error("TOGGLE KIT ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
