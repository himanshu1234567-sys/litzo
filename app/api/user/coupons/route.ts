export const runtime = "nodejs";
import "@/models";

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

    const userCoupons = await UserCoupon.find({
      userId: user._id,
    })
      .populate("couponId")
      .lean();

    const now = new Date();

    const coupons = userCoupons
      .filter((uc: any) => uc.couponId) // coupon exists
      .map((uc: any) => {
        const c = uc.couponId;
        const expiry = new Date(c.expiryDate);

        const isExpired = expiry < now;
        const isUsable = c.isActive && !isExpired && !uc.isUsed;

        return {
          couponUserMapId: uc._id,
          couponId: c._id,
          code: c.code,
          type: c.type,
          value: c.value,
          minBillAmount: c.minBillAmount,
          maxDiscount: c.maxDiscount ?? null,
          expiryDate: c.expiryDate,

          isActive: c.isActive,
          isExpired,
          isUsed: uc.isUsed,
          isUsable,

          usedAt: uc.usedAt ?? null,
        };
      })
      // 🟢 usable first → unused → expired last
      .sort((a, b) => Number(b.isUsable) - Number(a.isUsable));

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
