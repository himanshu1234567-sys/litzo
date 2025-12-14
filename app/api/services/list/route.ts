import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";

export async function GET() {
  try {
    await connectDB();

    // Fetch all fields of active services
    const services = await Service.find({ isActive: true }).lean();

    return NextResponse.json({
      success: true,
      services,
    });

  } catch (err) {
    console.error("Get Service List Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
