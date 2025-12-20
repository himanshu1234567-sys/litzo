import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { getUserFromToken } from "@/lib/auth";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: user._id,
      paymentStatus: "PENDING",
    });

    if (!order) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }

    // Razorpay amount is in paise
    const amountInPaise = order.bill.total * 100;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${order._id}`,
    });

    // save razorpay order id
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return NextResponse.json({
      success: true,

      // ✅ SEND KEY ID TO FRONTEND
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,

      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,

      orderId: order._id,
    });
  } catch (err) {
    console.error("PAYMENT INITIATE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
