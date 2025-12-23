import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserCoupon } from "@/models/UserCoupon";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  await connectDB();

  // ✅ REQUIRED FIX
  const { couponId } = await params;

  const users = await UserCoupon.find({
    couponId,
  })
    .populate("userId", "firstName lastName phone email")
    .sort({ createdAt: -1 });

  return NextResponse.json({
    success: true,
    users: users.map((u: any) => ({
      userId: u.userId?._id,
      name: `${u.userId?.firstName || ""} ${u.userId?.lastName || ""}`.trim(),
      phone: u.userId?.phone || null,
      email: u.userId?.email || null,
      isUsed: u.isUsed,
      usedAt: u.usedAt,
    })),
  });
}
