import { decodeJWT } from "@/lib/jwt";

export function checkAdmin(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded: any = decodeJWT(token);
    if (decoded.role === "admin") {
      return decoded; // return admin data
    }
    return null;
  } catch (err) {
    return null;
  }
}
