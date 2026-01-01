import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { UserCoupon } from "@/models/UserCoupon";

export async function GET(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();

    const userCoupons = await UserCoupon.find({
      userId: user._id,
    })
      .populate({
        path: "couponId",
        match: {
          isActive: true,
          expiryDate: { $gte: now },
        },
      })
      .lean();

    // 🧹 Remove entries where coupon is deleted / inactive / expired
    const coupons = userCoupons
      .filter((uc: any) => uc.couponId)
      .map((uc: any) => ({
        couponUserMapId: uc._id,
        couponId: uc.couponId._id,
        code: uc.couponId.code,
        type: uc.couponId.type, // FLAT | PERCENT
        value: uc.couponId.value,
        minBillAmount: uc.couponId.minBillAmount,
        maxDiscount: uc.couponId.maxDiscount || null,
        expiryDate: uc.couponId.expiryDate,
        isActive: uc.couponId.isActive,
        isUsed: uc.isUsed,
        usedAt: uc.usedAt || null,
      }))
      // 🟢 Active & unused coupons first
      .sort((a, b) => Number(a.isUsed) - Number(b.isUsed));

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (err) {
    console.error("GET USER COUPONS ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
