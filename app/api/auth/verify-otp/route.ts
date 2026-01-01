import { NextResponse } from "next/server";
import { verifyOTP } from "@/lib/twilio";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { createJWT } from "@/lib/jwt";

const isDev = process.env.NODE_ENV !== "production";

function errorResponse(
  message: string,
  status = 400,
  errorCode = "UNKNOWN_ERROR",
  debug?: any
) {
  return NextResponse.json(
    {
      success: false,
      message,
      errorCode,
      ...(isDev && debug ? { debug } : {}),
    },
    { status }
  );
}

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    // 🔴 VALIDATION
    if (!phone || !otp) {
      return errorResponse(
        "Phone & OTP are required",
        400,
        "MISSING_FIELDS",
        { phone, otp }
      );
    }

    // ⭐⭐⭐ APP REVIEWER / TEST LOGIN
    if (phone === "+919999999999") {
      if (otp !== "123456") {
        return errorResponse(
          "Invalid OTP",
          400,
          "OTP_INVALID",
          { phone }
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
        isSignup: 1, // ✅ ALWAYS 1 FOR REVIEWER
        token: `Bearer ${token}`,
        user: {
          phone: user.phone,
          role: user.role,
          isProfileCompleted: user.isProfileCompleted,
        },
      });
    }

    // ⭐⭐⭐ NORMAL USERS → TWILIO OTP VERIFY
    const result = await verifyOTP(phone, otp);

    if (!result?.success) {
      return errorResponse(
        "Invalid or expired OTP",
        400,
        "OTP_VERIFICATION_FAILED",
        result
      );
    }

    await connectDB();

    let user = await User.findOne({ phone });

    // 🆕 FIRST TIME USER
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

    // 🔁 EXISTING USER LOGIN
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

    return errorResponse(
      "Something went wrong",
      500,
      "SERVER_ERROR",
      {
        message: err?.message,
        stack: err?.stack,
      }
    );
  }
}
