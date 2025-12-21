// POST /api/payment/dev-success
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

export async function POST(req: Request) {
  await connectDB();

  const { orderId } = await req.json();

  const order = await Order.findById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  order.paymentStatus = "SUCCESS";
  order.orderStatus = "CONFIRMED";
  await order.save();

  return NextResponse.json({ success: true });
}
