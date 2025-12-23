import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AdminNotification } from "@/models/AdminNotification";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  // ✅ MUST await params
  const { id } = await params;

  await AdminNotification.findByIdAndUpdate(id, {
    isRead: true,
  });

  return NextResponse.json({ success: true });
}
