import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { AdminNotification } from "@/models/AdminNotification";
import { requireAdmin } from "@/lib/adminAuth";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // ✅ IMPORTANT FIX
  const { id } = await context.params;

  const notification = await AdminNotification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return NextResponse.json(
      { error: "Notification not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    notification,
  });
}
