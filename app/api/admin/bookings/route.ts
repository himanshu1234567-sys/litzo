import { NextResponse } from "next/server";
import { Booking } from "@/models/Booking";
import { connectDB } from "@/lib/db";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  const bookings = await Booking.find({ bookingDate: date })
    .populate("userId", "name phone")
    .populate("serviceId", "title duration")
    .sort({ startTime: 1 });

  return NextResponse.json({
    success: true,
    bookings
  });
}
