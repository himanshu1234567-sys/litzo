import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { UserCoupon } from "@/models/UserCoupon";

export async function GET(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userCoupons = await UserCoupon.find({
      userId: user._id,
      isUsed: false,
    }).populate("couponId");

    // 🔥 SAFETY FILTER (very important)
    const coupons = userCoupons
      .filter((uc: any) => uc.couponId) // avoid null coupon
      .map((uc: any) => ({
        couponId: uc.couponId._id,
        code: uc.couponId.code,
        discountAmount: uc.couponId.value,
        minBillAmount: uc.couponId.minBillAmount,
      }));

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (err) {
    console.error("GET USER COUPONS ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
