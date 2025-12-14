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

// Set admin cookie
export function setAdminCookie(token: string) {
  const cookieStore = cookies();

  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

// Clear admin cookie
export function clearAdminCookie() {
  cookies().delete(ADMIN_COOKIE);
}
