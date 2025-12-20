import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Cart } from "@/models/Cart";

export async function POST(req: Request) {
  try {
    await connectDB();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    // 🔐 VERIFY SIGNATURE
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // 📦 FIND ORDER
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // ✅ PAYMENT SUCCESS
    order.paymentStatus = "SUCCESS";
    order.orderStatus = "CONFIRMED";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    await order.save();

    // 🗑️ CLEAR CART (🔥 IMPORTANT 🔥)
    await Cart.deleteOne({ _id: order.cartId });

    return NextResponse.json({
      success: true,
      message: "Payment successful, order confirmed",
    });
  } catch (err) {
    console.error("PAYMENT VERIFY ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
