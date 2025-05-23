// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // for reset tokens
import Users from "../models/Users.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    let {
      name,
      email,
      password,
      role = "customer",
      address,
      phoneNumber,
      zipcode,
      serviceType,
      billingTier,
      location,
      isActive,
    } = req.body;

    if (!name || !email || !password || !address || !phoneNumber) {
      return res.status(400).json({
        msg: "Name, email, password, address and phoneNumber are required.",
      });
    }

    email = email.toLowerCase().trim();

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const zipArray = zipcode
      ? Array.isArray(zipcode)
        ? zipcode.map(Number)
        : [Number(zipcode)]
      : [];

    if (role !== "serviceProvider") {
      serviceType = undefined;
      billingTier = undefined;
      isActive = true;
    } else {
      isActive = false;
    }

    const userData = {
      name,
      email,
      password,
      role,
      address,
      phoneNumber,
      zipcode: zipArray,
      location,
      isActive,
    };

    if (role === "serviceProvider") {
      Object.assign(userData, {
        serviceType,
        billingTier,
        serviceZipcode: zipArray,
        w9: "fill out",
        businessLicense: "fill out",
        proofOfInsurance: "fill out",
        independentContractorAgreement: "fill out",
      });
    }

    const newUser = await Users.create(userData);

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token });
  } catch (err) {
    console.error("Error in POST /register:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

//previous
// router.post("/login", async (req, res) => {
//   try {
//     let { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ msg: "Email and password required." });
//     }

//     email = email.toLowerCase().trim();

//     const user = await Users.findOne({ email }).select("+password role");

//     if (!user) {
//       return res.status(400).json({ msg: "Invalid credentials" });
//     }

//     // This will only work if the stored password is a bcrypt hash

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ msg: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.json({ token });
//   } catch (err) {
//     console.error("Error in POST /login:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ensure password is selected from DB
    const user = await Users.findOne({ email }).select("+password");
    if (!user || !user.password) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.json({ token, refreshToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});



/**
 * POST /api/auth/request-reset
 */
router.post("/request-reset", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "No user with that email" });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 60 * 60 * 1000; // 1h
    user.resetPasswordToken = resetToken;
    user.resetPasswordExp = expiry;
    await user.save();
    // In a real app: email the link containing resetToken
    return res.json({ msg: "Reset token set. Email user with this token." });
  } catch (err) {
    console.error("requestReset error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

/**
 * PUT /api/auth/reset-password/:token
 */
router.put("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { email, password } = req.body;
    const user = await Users.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExp: { $gt: Date.now() },
    }).select("+password");
    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired reset token" });
    }
    // Hash new password and clear reset fields
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExp = undefined;
    await user.save();
    return res.json({ msg: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ msg: "Missing refresh token" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await Users.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ msg: "Invalid or expired refresh token" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    return res.json({ token });
  } catch (err) {
    console.error("Refresh error:", err.message);
    return res.status(401).json({ msg: "Token refresh failed" });
  }
});

export default router;
