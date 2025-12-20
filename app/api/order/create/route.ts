import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Order } from "@/models/Order";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cartId } = await req.json();

    const cart = await Cart.findOne({
      _id: cartId,
      userId: user._id,
      status: "DRAFT",
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    const order = await Order.create({
      userId: user._id,
      cartId: cart._id,
      items: cart.items,
      bookingDetails: cart.bookingDetails,
      bill: cart.bill,
      paymentStatus: "PENDING",
      orderStatus: "CREATED",
    });

    return NextResponse.json({
      success: true,
      orderId: order._id,
      amount: cart.bill.total,
    });
  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
