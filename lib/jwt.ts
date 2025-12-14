import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function createJWT(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}


export function decodeJWT(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}