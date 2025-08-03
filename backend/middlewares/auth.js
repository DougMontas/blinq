// middlewares/auth.js
import jwt from "jsonwebtoken";
import Users from "../models/Users.js";

export const auth = async (req, res, next) => {
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
    const user = await Users.findById(decoded.id).select(
      "_id name email phoneNumber role billingTier businessName stripeAccountId stripeCustomerId serviceZipcode location"
    );

    if (!user) {
      console.log("🔒 AUTH MIDDLEWARE: User not found.");
      return res.status(401).json({ msg: "User not found." });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.error("🔒 AUTH ERROR: Token expired at", err.expiredAt);
      return res
        .status(401)
        .json({ msg: "Session expired. Please log in again." });
    }
    console.error("🔒 AUTH ERROR:", err.message);
    return res.status(401).json({ msg: "Invalid token." });
  }
};
