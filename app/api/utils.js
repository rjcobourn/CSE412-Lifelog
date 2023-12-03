import jwt from "jsonwebtoken";
import cookie from "cookie";

export async function authenticateToken(request) {
  try {
    const authToken = cookie.parse(request.headers.get("cookie")).authToken;

    if (!authToken) {
      return { error: "No token provided", status: 401 };
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    return { decoded };
  } catch (error) {
    console.log(error);
    return { error: "Invalid or expired token", status: 403 };
  }
}
