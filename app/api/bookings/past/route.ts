import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: Request) {
  await connectDB();

  const user = await getUserFromToken(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookings = await Order.find({
    userId: user._id,
    paymentStatus: "SUCCESS",
    "bookingDetails.slotDate": { $lt: today },
  }).sort({ "bookingDetails.slotDate": -1 });

  return NextResponse.json({
    success: true,
    bookings,
  });
}
