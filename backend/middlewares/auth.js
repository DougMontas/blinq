// backend/middlewares/auth.js
// //old
// import jwt from "jsonwebtoken";

// export function auth(req, res, next) {
//   try {
//     // 1. get token
//     const token =
//       req.headers["x-auth-token"] ||
//       (req.headers["authorization"]?.split(" ")[1] ?? "");

//     // console.log("🔐 Incoming token:", req.headers.authorization);

//     if (!token) {
//       console.log("AUTH MIDDLEWARE: No token found in headers.");
//       return res.status(401).json({ msg: "No token provided" });
//     }

//     // 2. verify
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // 3. attach to req
//     req.user = { id: decoded.id, role: decoded.role };
//     // console.log("AUTH MIDDLEWARE: req.user =", req.user);

//     next();
//   } catch (err) {
//     console.error("AUTH MIDDLEWARE ERROR:", err);
//     return res.status(401).json({ msg: "Invalid token" });
//   }
// }


// middlewares/auth.js
import jwt from "jsonwebtoken";
import Users from "../models/Users.js";

export const auth = async (req, res, next) => {
  // Get token from headers: support both 'Authorization' and 'x-auth-token'
  const token =
    req.headers["x-auth-token"] ||
    (req.headers["authorization"]?.startsWith("Bearer ")
      ? req.headers["authorization"].split(" ")[1]
      : "");

  if (!token) {
    console.log("🔒 AUTH MIDDLEWARE: No token provided.");
    return res.status(401).json({ msg: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optionally fetch full user (if needed later)
    const user = await Users.findById(decoded.id).select("-password");
    if (!user) {
      console.log("🔒 AUTH MIDDLEWARE: User not found for decoded ID.");
      return res.status(401).json({ msg: "User not found." });
    }

    // Attach full user or just essentials
    req.user = { id: user._id.toString(), role: user.role };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.warn("🔐 TokenExpiredError at:", err.expiredAt);
      return res.status(401).json({ msg: "Token expired." });
    }

    console.error("🔐 Token verification error:", err.message);
    return res.status(401).json({ msg: "Invalid token." });
  }
};
