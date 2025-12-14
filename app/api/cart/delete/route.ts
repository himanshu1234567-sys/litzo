import { NextResponse } from "next/server";
import { Cart } from "@/models/Cart";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get("serviceId");

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID missing" }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    cart.items = cart.items.filter(
      (item:any) => item.serviceId.toString() !== serviceId
    );

    cart.calculateTotal();
    await cart.save();

    return NextResponse.json({ success: true, message: "Item removed", cart });
  } catch (err) {
    console.error("Delete Cart Item Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
