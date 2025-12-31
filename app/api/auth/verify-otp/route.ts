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

    // ⭐⭐⭐ APP REVIEWER / TEST LOGIN (NO TWILIO REQUIRED)
    if (phone === "+919999999999") {
      if (otp !== "123456") {
        return NextResponse.json(
          { error: "Invalid OTP" },
          { status: 400 }
        );
      }

      await connectDB();

      let user = await User.findOne({ phone });

      if (!user) {
        user = await User.create({
          phone,
          role: "user",
          isProfileCompleted: false,
        });
      }

      const token = createJWT({
        userId: user._id.toString(),
        phone,
        role: user.role,
      });

      return NextResponse.json({
        success: true,
        isSignup: user.createdAt === user.updatedAt ? 1 : 0,
        token: `Bearer ${token}`,
        user: {
          phone: user.phone,
          role: user.role,
          isProfileCompleted: user.isProfileCompleted,
        },
      });
    }

    // ⭐⭐⭐ NORMAL USERS → VERIFY WITH TWILIO
    const result = await verifyOTP(phone, otp);

    if (!result?.success) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    await connectDB();

    let user = await User.findOne({ phone });

    // FIRST TIME USER → CREATE
    if (!user) {
      user = await User.create({
        phone,
        role: "user",
        isProfileCompleted: false,
      });

      const token = createJWT({
        userId: user._id.toString(),
        phone,
        role: user.role,
      });

      return NextResponse.json({
        success: true,
        isSignup: 1,
        token: `Bearer ${token}`,
        user: {
          phone: user.phone,
          role: user.role,
          isProfileCompleted: user.isProfileCompleted,
        },
      });
    }

    // EXISTING USER → LOGIN
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
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
