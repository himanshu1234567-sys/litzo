import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";
import { checkAdmin } from "@/lib/checkAdmin";

export async function PUT(req: Request) {
  try {
    await connectDB();

    const admin = checkAdmin(req);
    if (!admin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, title, price, description, image, category, duration } =
      await req.json();

    if (!id)
      return NextResponse.json({ error: "Service ID required" }, { status: 400 });

    const service = await Service.findByIdAndUpdate(
      id,
      { title, price, description, image, category, duration },
      { new: true }
    );

    if (!service)
      return NextResponse.json({ error: "Service not found" }, { status: 404 });

    return NextResponse.json({ success: true, service });
  } catch (err) {
    console.error("UPDATE SERVICE ERROR:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
