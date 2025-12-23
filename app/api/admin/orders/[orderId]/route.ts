import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  await connectDB();

  // ✅ MUST await params
  const { orderId } = await params;

  const order = await Order.findById(orderId)
    .populate("userId", "firstName lastName phone email");

  if (!order) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    order,
  });
}
