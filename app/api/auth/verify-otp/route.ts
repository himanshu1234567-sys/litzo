import { NextResponse } from "next/server";
import { verifyOTP } from "@/lib/twilio";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { createJWT } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    // ✅ VALIDATION
    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone & OTP are required" },
        { status: 400 }
      );
    }

    // ✅ VERIFY OTP
    const result = await verifyOTP(phone, otp);
    if (!result?.success) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // ✅ CONNECT DB
    await connectDB();

    // ✅ CHECK USER
    let user = await User.findOne({ phone });

    // 🟢 FIRST TIME USER
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
        isSignup: 1,
        token: `Bearer ${token}`,
        user: {
          phone: user.phone,
          role: user.role,
        },
      });
    }

    // 🔵 EXISTING USER
    const token = createJWT({
      userId: user._id.toString(),
      phone,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      isSignup: 0,
      token: `Bearer ${token}`,
      user: {
        phone: user.phone,
        role: user.role,
        isProfileCompleted: user.isProfileCompleted,
      },
    });

  } catch (err: any) {
    console.error("VERIFY OTP ERROR FULL:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
