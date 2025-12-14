import { NextResponse } from "next/server";
import { Cart } from "@/models/Cart";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { serviceId, quantity } = await req.json();

    if (!serviceId || quantity < 1) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex(
      (i:any) => i.serviceId.toString() === serviceId
    );

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.calculateTotal();

    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Cart updated",
      cart,
    });
  } catch (err) {
    console.error("Cart Update Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
