import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";

export async function GET() {
  await connectDB();

  const orders = await Order.find()
    .populate("userId", "firstName lastName phone email")
    .sort({ createdAt: -1 });

  return NextResponse.json({
    success: true,
    orders: orders.map((o) => ({
      orderId: o._id,
      user: {
        name: `${o.userId?.firstName || ""} ${o.userId?.lastName || ""}`,
        phone: o.userId?.phone,
        email: o.userId?.email,
      },
      items: o.items,
      bookingDetails: o.bookingDetails,
      bill: o.bill,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      createdAt: o.createdAt,
    })),
  });
}
