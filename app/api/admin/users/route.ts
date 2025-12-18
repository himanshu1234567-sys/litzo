import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyAdminToken } from "@/lib/adminAuth";
;

export async function GET(req: Request) {
  await connectDB();

  const auth = req.headers.get("authorization");
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = auth.replace("Bearer ", "");
  const admin = verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await User.find().select("-password");

  return NextResponse.json({
    success: true,
    users,
  });
}
