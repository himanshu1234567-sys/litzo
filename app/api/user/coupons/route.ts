import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { UserCoupon } from "@/models/UserCoupon";
import { Coupon } from "@/models/Coupon";

export async function GET(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userCoupons = await UserCoupon.find({ userId: user._id })
      .populate("couponId")
      .lean();

    const coupons = userCoupons.map((uc: any) => ({
      couponUserMapId: uc._id,
      couponId: uc.couponId._id,
      code: uc.couponId.code,
      type: uc.couponId.type,               // "FLAT" or "PERCENT"
      discountAmount: uc.couponId.value,
      minBillAmount: uc.couponId.minBillAmount,
      expiryDate: uc.couponId.expiryDate,
      isActive: uc.couponId.isActive,
      isUsed: uc.isUsed
    }));

    return NextResponse.json({ success: true, coupons });

  } catch (err) {
    console.error("GET USER COUPONS ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
