import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Service } from "@/models/Service";
import { checkAdmin } from "@/lib/checkAdmin";

export async function POST(req: Request) {
  try {
    await connectDB();

    const admin = checkAdmin(req);
    if (!admin)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, price, description, image, category, duration } = await req.json();

    if (!title || !price)
      return NextResponse.json(
        { error: "Title & price are required" },
        { status: 400 }
      );

    const service = await Service.create({
      title,
      price,
      description,
      image,
      category,
      duration,
    });

    return NextResponse.json({ success: true, service });
  } catch (err) {
    console.error("CREATE SERVICE ERROR:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
