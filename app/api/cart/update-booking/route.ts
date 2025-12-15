import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 AUTH
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingDetails } = await req.json();

    if (!bookingDetails) {
      return NextResponse.json(
        { error: "bookingDetails required" },
        { status: 400 }
      );
    }

    // 🛒 FIND ACTIVE CART
    const cart = await Cart.findOne({
      userId: user._id,
      status: "DRAFT",
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Active cart not found" },
        { status: 404 }
      );
    }

    // 📝 UPDATE BOOKING DETAILS (MERGE)
    cart.bookingDetails = {
      ...cart.bookingDetails,
      ...bookingDetails,
    };

    await cart.save();

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (err) {
    console.error("UPDATE BOOKING ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
