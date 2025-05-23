// backend/middlewares/auth.js
import jwt from "jsonwebtoken";


/**
 * Named export "auth": checks for a token and sets req.user if valid
 */
export function auth(req, res, next) {
  try {
    // 1. get token
    const token =
      req.headers["x-auth-token"] ||
      (req.headers["authorization"]?.split(" ")[1] ?? "");

      console.log("🔐 Incoming token:", req.headers.authorization);


    if (!token) {
      console.log("AUTH MIDDLEWARE: No token found in headers.");
      return res.status(401).json({ msg: "No token provided" });
    }

    // 2. verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. attach to req
    req.user = { id: decoded.id, role: decoded.role };
    console.log("AUTH MIDDLEWARE: req.user =", req.user);

    next();
  } catch (err) {
    console.error("AUTH MIDDLEWARE ERROR:", err);
    return res.status(401).json({ msg: "Invalid token" });
  }
}
