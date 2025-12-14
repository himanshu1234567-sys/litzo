import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { User } from "@/models/User";

// CREATE TOKEN
export function createToken(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
}

// VERIFY TOKEN  ⭐ REQUIRED BY MIDDLEWARE
export function verifyToken(token: string) {
  console.log(token, process.env.JWT_SECRET);
  
  try {
    
    return jwt.verify(token, process.env.JWT_SECRET!);
    
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

// SAVE TOKEN IN COOKIE

// SET COOKIE
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

// CLEAR COOKIE
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}


// GET LOGGED-IN USER (Used in API routes)
export async function getUserFromToken(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded: any = verifyToken(token);
    if (!decoded) return null;

    // If token contains userId (normal login)
    if (decoded.userId) {
      return await User.findById(decoded.userId);
    }

    // If token contains phone (from OTP flow)
    if (decoded.phone) {
      return await User.findOne({ phone: decoded.phone });
    }

    return null;
  } catch (err) {
    console.error("getUserFromToken Error:", err);
    return null;
  }
}
