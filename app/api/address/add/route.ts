import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized user",
          },
        },
        { status: 401 }
      );
    }

    const {
      label,
      type,
      addressLine,
      landmark,
      city,
      state,
      pincode,
      country = "India",
      havePets = false,
      homeDetails = null,
    } = await req.json();

    // 🧠 FIELD LEVEL VALIDATION
    const errors: Record<string, string> = {};

    if (!addressLine) errors.addressLine = "Address line is required";
   

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Required address fields missing",
            fields: errors,
          },
        },
        { status: 400 }
      );
    }

    // First address becomes default
    const isFirst = user.addresses.length === 0;

    const newAddress = {
      label: label ?? "Home",
      type: type ?? "home",
      addressLine,
      landmark,
      city,
      state,
      pincode,
      country,
      havePets,
      homeDetails,
      isDefault: isFirst,
    };

    user.addresses.push(newAddress);
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (err) {
    console.error("ADD ADDRESS ERROR:", err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Something went wrong",
        },
      },
      { status: 500 }
    );
  }
}
