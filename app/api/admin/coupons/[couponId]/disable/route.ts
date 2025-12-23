import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { getUserFromToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ couponId: string }> }
) {
  try {
    await connectDB();

    // 🔐 Admin auth
    const admin = await getUserFromToken(req);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ IMPORTANT FIX
    const { couponId } = await context.params;

    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      { isActive: false },
      { new: true }
    );

    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon,
    });
  } catch (err) {
    console.error("DISABLE COUPON ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
