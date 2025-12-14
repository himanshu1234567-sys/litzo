import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";

export async function GET() {
  try {
    await connectDB();

    const services = await Service.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, services });
  } catch (err) {
    console.error("LIST SERVICE ERROR:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
