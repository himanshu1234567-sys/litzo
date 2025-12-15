// app/api/env-check/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    jwt: !!process.env.JWT_SECRET,
    twilio: !!process.env.TWILIO_ACCOUNT_SID,
    mongo: !!process.env.MONGODB_URI,
  });
}
