import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let cart = await Cart.findOne({
      userId: user._id,
      status: "DRAFT",
    });

    // 🟢 IF CART DOES NOT EXIST → CREATE WITH USER DATA
    if (!cart) {
      cart = await Cart.create({
        userId: user._id,
        items: [],
        couponApplied: false,
        bookingDetails: {
          addressText: "",
          receiverName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
          receiverPhone: user.phone ?? "",
          slotDate: "",
          slotTime: "",
        },
        bill: {
          subTotal: 0,
          gst: 0,
          discount: 0,
          cleaningFee: 0,
          cleaningKitFee: 0,
          total: 0,
        },
        status: "DRAFT",
      });
    }

    // 🟡 IF CART EXISTS → FILL MISSING BOOKING DETAILS
    let updated = false;

    if (!cart.bookingDetails) {
      cart.bookingDetails = {};
      updated = true;
    }

    if (!cart.bookingDetails.receiverName) {
      cart.bookingDetails.receiverName =
        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
      updated = true;
    }

    if (!cart.bookingDetails.receiverPhone) {
      cart.bookingDetails.receiverPhone = user.phone ?? "";
      updated = true;
    }

    if (!cart.bookingDetails.addressText) {
      cart.bookingDetails.addressText = "";
    }

    if (!cart.bookingDetails.slotDate) {
      cart.bookingDetails.slotDate = "";
    }

    if (!cart.bookingDetails.slotTime) {
      cart.bookingDetails.slotTime = "";
    }

    if (updated) {
      await cart.save();
    }

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (err) {
    console.error("GET CURRENT CART ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
