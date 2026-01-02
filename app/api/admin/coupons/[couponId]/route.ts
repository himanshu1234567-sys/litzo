export const runtime = "nodejs";
import "@/models";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { UserCoupon } from "@/models/UserCoupon";
import { getUserFromToken } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ couponId: string }> }
) {
  try {
    await connectDB();

    // 🔐 ADMIN AUTH
    const admin = await getUserFromToken(req);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ IMPORTANT FIX
    const { couponId } = await context.params;

    // 🗑️ Delete coupon
    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    // 🧹 Delete all user-coupon mappings
    await UserCoupon.deleteMany({ couponId });

    return NextResponse.json({
      success: true,
      message: "Coupon deleted permanently",
    });
  } catch (err) {
    console.error("DELETE COUPON ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
