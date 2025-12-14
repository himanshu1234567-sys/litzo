import { NextResponse } from "next/server";
import { verifyOTP } from "@/lib/twilio";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { createJWT } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone & OTP are required" },
        { status: 400 }
      );
    }

    // 🔐 Verify OTP
    const result = await verifyOTP(phone, otp);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    await connectDB();

    let user = await User.findOne({ phone });

    // ⭐ FIRST TIME USER → CREATE
    if (!user) {
      user = await User.create({
        phone,
        role: "user",
        isProfileCompleted: false,
      });

      const token = createJWT({
        userId: user._id.toString(),
        phone,
        role: "user",
      });

      return NextResponse.json({
        success: true,
        isSignup: 1, // 👈 ONLY ONCE
        token: `Bearer ${token}`,
        user,
      });
    }

    // ⭐ EXISTING USER → ALWAYS LOGIN
    const token = createJWT({
      userId: user._id.toString(),
      phone,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      isSignup: 0, // 👈 ALWAYS 0 AFTER USER EXISTS
      token: `Bearer ${token}`,
      user: {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone,
        role: user.role,
        isProfileCompleted: user.isProfileCompleted,
      },
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}