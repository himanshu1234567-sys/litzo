import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

import { checkAdmin } from "@/lib/auth/checkAdmin";

export async function POST(req: Request) {
  try {
    const admin = await checkAdmin(req);
            if (!admin) {
              return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "services", // 👈 Cloudinary folder
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      imageUrl: uploadResult.secure_url,
    });
  } catch (err) {
    console.error("IMAGE UPLOAD ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
