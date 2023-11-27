import jwt from "jsonwebtoken";

export async function authenticateToken(request) {
  try {
    const token = request.headers.get("authorization");

    if (!token) {
      return { error: "No token provided", status: 401 };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { decoded };
  } catch (error) {
    return { error: "Invalid or expired token", status: 403 };
  }
}
