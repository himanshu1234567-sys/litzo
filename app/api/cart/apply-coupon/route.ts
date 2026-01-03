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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // 🚫 EMPTY CART
    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json(
        {
          error: "Please add at least one service to cart before applying coupon",
          code: "EMPTY_CART",
        },
        { status: 400 }
      );
    }

    // 🚫 ALREADY APPLIED
    if (cart.couponApplied) {
      return NextResponse.json(
        {
          error: "Coupon already applied",
          code: "COUPON_ALREADY_APPLIED",
        },
        { status: 400 }
      );
    }

    // 🎟️ FIND COUPON
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

    // 🔢 CALCULATE BILL
    calculateBill(cart);

    // 🚫 MIN ORDER CHECK
    if (cart.bill.subTotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Coupon will be applicable on minimum order of ₹${coupon.minOrderAmount}`,
          code: "MIN_ORDER_NOT_MET",
          minOrderAmount: coupon.minOrderAmount,
          currentAmount: cart.bill.subTotal,
        },
        { status: 400 }
      );
    }

    // 💸 DISCOUNT
    let discountAmount = 0;

    if (coupon.type === "FLAT") {
      discountAmount = coupon.value;
    }

    if (coupon.type === "PERCENT") {
      discountAmount = Math.round(
        (cart.bill.subTotal * coupon.value) / 100
      );
    }

    discountAmount = Math.min(discountAmount, cart.bill.subTotal);

    // 🧮 UPDATE BILL
    cart.bill.discount = discountAmount;
    cart.bill.total =
      cart.bill.subTotal +
      cart.bill.gst +
      cart.bill.cleaningFee +
      cart.bill.cleaningKitFee -
      discountAmount;

    // ✅ MARK COUPON APPLIED
    cart.couponApplied = true;

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
  } catch (err) {
    console.error("APPLY COUPON ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
