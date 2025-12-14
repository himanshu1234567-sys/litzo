import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { addressId } = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $pull: { addresses: { _id: addressId } }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully"
    });

  } catch (err) {
    console.error("Address Delete Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
