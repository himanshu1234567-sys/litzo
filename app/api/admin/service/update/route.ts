import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";
import { checkAdmin } from "@/lib/checkAdmin";

export async function PUT(req: Request) {
  try {
    await connectDB();

    const admin = await checkAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { serviceId, update } = await req.json();

    // ✅ FIX 1: correct id check
    if (!serviceId) {
      return NextResponse.json(
        { error: "Service ID required" },
        { status: 400 }
      );
    }

    // ✅ FIX 2: update object required
    if (!update || typeof update !== "object") {
      return NextResponse.json(
        { error: "Update data required" },
        { status: 400 }
      );
    }

    const service = await Service.findByIdAndUpdate(
      serviceId,
      { $set: update },
      { new: true }
    );

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (err) {
    console.error("UPDATE SERVICE ERROR:", err);
    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}
