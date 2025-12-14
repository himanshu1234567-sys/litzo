import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";
import { checkAdmin } from "@/lib/checkAdmin";

export async function POST(req: Request) {
  try {
    await connectDB();

    const admin = checkAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      title,
      description,
      category,
      image,

      price,
      discountPrice,

      baseDuration,
      unitLabel,
      pricePerUnit,
      durationUnit = 15,

      includes = [],
      excludes = []
    } = body;

    if (!title || !price) {
      return NextResponse.json(
        { error: "Title & price are required" },
        { status: 400 }
      );
    }

    const service = await Service.create({
      title,
      description,
      category,
      image,

      price,
      discountPrice,

      baseDuration,
      unitLabel,
      pricePerUnit,
      durationUnit,

      includes,
      excludes
    });

    return NextResponse.json({
      success: true,
      service
    });
  } catch (err) {
    console.error("CREATE SERVICE ERROR:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
