import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
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

    // ❌ NO COUPON APPLIED
    if (!cart.appliedCoupon) {
      return NextResponse.json(
        {
          success: true,
          message: "No coupon applied",
          cart,
        }
      );
    }

    // 🔥 REMOVE COUPON
    cart.appliedCoupon = undefined;

    // 🔄 RECALCULATE BILL (without coupon)
    calculateBill(cart);

    // 🔐 FORCE RESET DISCOUNT
    cart.bill.discount = 0;

    // 🔐 FORCE TOTAL RECALCULATION
    cart.bill.total =
      cart.bill.subTotal +
      cart.bill.gst +
      cart.bill.cleaningFee +
      cart.bill.cleaningKitFee;

    await cart.save();

    return NextResponse.json({
      success: true,
      message: "Coupon removed successfully",
      cart,
    });
  } catch (err: any) {
    console.error("REMOVE COUPON ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
