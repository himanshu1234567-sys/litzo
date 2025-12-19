import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Order } from "@/models/Order";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  await connectDB();

  const user = await getUserFromToken(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cartId } = await req.json();
  if (!cartId)
    return NextResponse.json({ error: "cartId required" }, { status: 400 });

  const cart = await Cart.findOne({
    _id: cartId,
    userId: user._id,
    status: "DRAFT",
  });

  if (!cart)
    return NextResponse.json(
      { error: "Cart not found or already locked" },
      { status: 404 }
    );

  if (!cart.items.length)
    return NextResponse.json({ error: "Cart empty" }, { status: 400 });

  if (!cart.bookingDetails?.slotDate || !cart.bookingDetails?.slotTime)
    return NextResponse.json(
      { error: "Booking slot missing" },
      { status: 400 }
    );

  const order = await Order.create({
    userId: user._id,
    cartId: cart._id,
    items: cart.items,
    bookingDetails: cart.bookingDetails,
    bill: cart.bill,
  });

  cart.status = "LOCKED";
  await cart.save();

  return NextResponse.json({
    success: true,
    orderId: order._id,
    amount: cart.bill.total,
  });
}
