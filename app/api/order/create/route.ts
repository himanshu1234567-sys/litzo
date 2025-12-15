import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Order } from "@/models/Order";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 AUTH
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cartId } = await req.json();
    if (!cartId) {
      return NextResponse.json({ error: "cartId required" }, { status: 400 });
    }

    // 🛒 FETCH CART (IMPORTANT: userId match)
    const cart = await Cart.findOne({
      _id: cartId,
      userId: user._id,
      status: "DRAFT",
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found or already locked" },
        { status: 404 }
      );
    }

    // ❗ BASIC VALIDATION
    if (!cart.items.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!cart.bookingDetails?.slotDate || !cart.bookingDetails?.slotTime) {
      return NextResponse.json(
        { error: "Booking slot missing" },
        { status: 400 }
      );
    }

    // 📦 CREATE ORDER (SNAPSHOT)
    const order = await Order.create({
      userId: user._id,
      cartId: cart._id,

      items: cart.items,
      bookingDetails: cart.bookingDetails,
      bill: cart.bill,

      paymentStatus: "PENDING",
      orderStatus: "CREATED",
    });

    // 🔒 LOCK CART
    cart.status = "LOCKED";
    await cart.save();

    return NextResponse.json({
      success: true,
      orderId: order._id,
      order,
    });
  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
