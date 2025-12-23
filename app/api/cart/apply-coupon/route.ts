import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Coupon } from "@/models/Coupon";
import { UserCoupon } from "@/models/UserCoupon";
import { getUserFromToken } from "@/lib/auth";
import { calculateBill } from "@/lib/cartUtils";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 AUTH
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { couponCode } = await req.json();
    if (!couponCode) {
      return NextResponse.json(
        { error: "couponCode required" },
        { status: 400 }
      );
    }

    // 🛒 GET CART
    const cart = await Cart.findOne({
      userId: user._id,
      status: "DRAFT",
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Active cart not found" },
        { status: 404 }
      );
    }

    // 🎟️ GET COUPON
    const coupon = await Coupon.findOne({
      code: couponCode,
      isActive: true,
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon" },
        { status: 404 }
      );
    }

    // 👤 CHECK USER COUPON
    const userCoupon = await UserCoupon.findOne({
      userId: user._id,
      couponId: coupon._id,
      isUsed: false,
    });

    if (!userCoupon) {
      return NextResponse.json(
        { error: "Coupon not available or already used" },
        { status: 400 }
      );
    }

    // 🔢 CALCULATE BILL FIRST (WITHOUT COUPON)
    calculateBill(cart);

    if (cart.bill.subTotal < coupon.minBillAmount) {
      return NextResponse.json(
        {
          error: `Minimum bill ₹${coupon.minBillAmount} required`,
        },
        { status: 400 }
      );
    }

    // 💸 APPLY DISCOUNT
    let discountAmount = 0;

    if (coupon.type === "FLAT") {
      discountAmount = coupon.value;
    }

    if (coupon.type === "PERCENT") {
      discountAmount = Math.round(
        (cart.bill.subTotal * coupon.value) / 100
      );
    }

    // 🧮 UPDATE BILL
    cart.bill.discount = discountAmount;
    cart.bill.total =
      cart.bill.subTotal +
      cart.bill.gst +
      cart.bill.cleaningFee -
      discountAmount;

    // 🔖 SAVE APPLIED COUPON INFO
    cart.appliedCoupon = {
      couponId: coupon._id,
      code: coupon.code,
      discountAmount,
    };

    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Coupon applied successfully",
      cart,
    });
  } catch (err: any) {
    console.error("APPLY COUPON ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
