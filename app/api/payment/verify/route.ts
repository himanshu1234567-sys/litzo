import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { getUserFromToken } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
  await connectDB();

  const user = await getUserFromToken(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await req.json();

  const order = await Order.findOne({
    _id: orderId,
    userId: user._id,
    paymentStatus: "PENDING",
  });

  if (!order)
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });

  const rpOrder = await razorpay.orders.create({
    amount: order.bill.total * 100,
    currency: "INR",
    receipt: order._id.toString(),
  });

  order.razorpayOrderId = rpOrder.id;
  await order.save();

  return NextResponse.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
    amount: order.bill.total,
    currency: "INR",
    razorpayOrderId: rpOrder.id,
  });
}
