import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";
import { checkAdmin } from "@/lib/auth/checkAdmin";



export async function PUT(req: Request) {
  try {
    await connectDB();

    const admin = await checkAdmin(req);
        if (!admin) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    const { serviceId, image } = await req.json();

    if (!serviceId || !image) {
      return NextResponse.json(
        { error: "serviceId & image required" },
        { status: 400 }
      );
    }

    const service = await Service.findByIdAndUpdate(
      serviceId,
      { image },
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
      service,
    });
  } catch (err) {
    console.error("UPDATE IMAGE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
