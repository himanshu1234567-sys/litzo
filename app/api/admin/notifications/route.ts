import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AdminNotification } from "@/models/AdminNotification";

export async function GET() {
  await connectDB();

  const notifications = await AdminNotification.find()
    .sort({ createdAt: -1 })
    .limit(20);

  return NextResponse.json({
    success: true,
    notifications,
  });
}
