import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";
import { checkAdmin } from "@/lib/checkAdmin";

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const admin = checkAdmin(req);
    if (!admin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();

    if (!id)
      return NextResponse.json({ error: "Service ID required" }, { status: 400 });

    const service = await Service.findByIdAndDelete(id);

    if (!service)
      return NextResponse.json({ error: "Service not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE SERVICE ERROR:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
