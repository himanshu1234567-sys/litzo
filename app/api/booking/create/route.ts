import { NextResponse } from "next/server";
import { Booking } from "@/models/Booking";
import { Service } from "@/models/Service";
import { connectDB } from "@/lib/db";
import {
  timeToMinutes,
  calculateEndTime,
  isOverlapping
} from "@/lib/bookingUtils";

export async function POST(req: Request) {
  await connectDB();

  const {
    serviceId,
    bookingDate,
    startTime
  } = await req.json();

  const service = await Service.findById(serviceId);
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const endTime = calculateEndTime(startTime, service.duration);

  const existingBookings = await Booking.find({
    bookingDate,
    status: { $ne: "cancelled" }
  });

  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  for (const booking of existingBookings) {
    const bookedStart = timeToMinutes(booking.startTime);
    const bookedEnd = timeToMinutes(booking.endTime);

    if (isOverlapping(newStart, newEnd, bookedStart, bookedEnd)) {
      return NextResponse.json(
        { error: "Selected slot is already booked" },
        { status: 409 }
      );
    }
  }

  // ✅ create booking
}
