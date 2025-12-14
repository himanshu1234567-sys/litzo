import { NextResponse } from "next/server";
import { Service } from "@/models/Service";
import { connectDB } from "@/lib/db";


export async function GET() {
  try {
    await connectDB();
    const services = await Service.find({ isActive: true });
    return NextResponse.json({ success: true, services });
  } catch (err) {
    return NextResponse.json({ error: "Server error" });
  }
}
