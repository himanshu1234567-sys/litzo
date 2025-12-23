import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 AUTH
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded: any = verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 📥 BODY
    const { firstName, lastName, email } = await req.json();

    // ✅ REQUIRED FIELDS
    if (!firstName || !email) {
      return NextResponse.json(
        { error: "firstName and email are required" },
        { status: 400 }
      );
    }

    // 🚫 EMAIL UNIQUE CHECK (ignore current user)
    const existingUser = await User.findOne({
      email,
      _id: { $ne: decoded.userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // 🧠 BUILD UPDATE OBJECT (lastName OPTIONAL)
    const updateData: any = {
      firstName,
      email,
      isProfileCompleted: true,
    };

    if (lastName) {
      updateData.lastName = lastName;
    }

    // 🔄 UPDATE USER
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile saved successfully",
      user,
    });
  } catch (err) {
    console.error("Create/Update Profile Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
