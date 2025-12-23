import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  await connectDB();

  // ✅ MUST await params
  const { couponId } = await params;

  const coupon = await Coupon.findByIdAndUpdate(
    couponId,
    { isActive: true },
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
}
