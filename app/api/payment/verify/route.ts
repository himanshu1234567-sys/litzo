import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Cart } from "@/models/Cart";
import { UserCoupon } from "@/models/UserCoupon";

export async function POST(req: Request) {
  try {
    await connectDB();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { error: "Missing payment params" },
        { status: 400 }
      );
    }

    // 🔐 VERIFY SIGNATURE
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET!
      )
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // ❌ PAYMENT FAILED
      await Order.updateOne(
        { razorpayOrderId: razorpay_order_id },
        {
          paymentStatus: "FAILED",
          orderStatus: "CANCELLED",
        }
      );

      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // 📦 FIND ORDER
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // 🔁 PREVENT DOUBLE VERIFY
    if (order.paymentStatus === "SUCCESS") {
      return NextResponse.json({
        success: true,
        message: "Payment already verified",
      });
    }

    // ✅ PAYMENT SUCCESS
    order.paymentStatus = "SUCCESS";
    order.orderStatus = "CONFIRMED";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    await order.save();

    // 🎟️ MARK COUPON USED (IF ANY)
    if (order.bill?.coupon?.couponId) {
      await UserCoupon.updateOne(
        {
          userId: order.userId,
          couponId: order.bill.coupon.couponId,
        },
        {
          isUsed: true,
          usedAt: new Date(),
        }
      );
    }

    // 🗑️ DELETE CART (ONLY AFTER SUCCESS)
    await Cart.deleteOne({ _id: order.cartId });

    return NextResponse.json({
      success: true,
      message: "Payment successful, order confirmed",
      orderId: order._id,
    });
  } catch (err) {
    console.error("PAYMENT VERIFY ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
