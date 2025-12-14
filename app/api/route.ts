import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { User } from "@/models/User"


export async function GET() {
  try {
    await connectDB()
    return Response.json({
      status: "success",
      message: "MongoDB Connected 🎉"
    })
  } catch (error: any) {
    return Response.json({
      status: "failed",
      error: error.message
    })
  }
}

// export async function GET() {
//   try {
//     console.log("[v0] Testing DB connection...")
//     await connectDB()

//     const userCount = await User.countDocuments()
//     const adminUser = await User.findOne({ email: "admin@serviceapp.com" })

//     return NextResponse.json({
//       success: true,
//       message: "Database connected successfully",
//       userCount,
//       adminExists: !!adminUser,
//       adminEmail: adminUser?.email || "Not found",
//     })
//   } catch (error) {
//     console.error("[v0] DB test error:", error)
//     return NextResponse.json(
//       {
//         success: false,
//         error: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 },
//     )
//   }
// }
