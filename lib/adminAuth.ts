// lib/adminAuth.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "admin-token";

// Create admin token
export function createAdminToken(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
}

// Verify admin token
export function verifyAdminToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (err) {
    console.error("JWT Admin Verify Error:", err);
    return null;
  }
}

// ✅ REQUIRED FUNCTION (MISSING)
export async function requireAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;

    if (!token) return null;

    const decoded: any = verifyAdminToken(token);

    if (!decoded || decoded.role !== "admin") {
      return null;
    }

    return decoded; // admin payload
  } catch (err) {
    console.error("requireAdmin error:", err);
    return null;
  }
}

// Set admin cookie
export async function setAdminCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

// Clear admin cookie
export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
