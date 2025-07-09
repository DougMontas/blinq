// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // for reset tokens
import Users from "../models/Users.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();
const baseUrl = process.env.FRONTEND_BASE_URL;

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
      ssnLast4,
      dob,
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

    const zipArray = Array.isArray(zipcode)
      ? zipcode.map(Number)
      : [Number(zipcode)];

    const userData = {
      name,
      email,
      password, // let Mongoose pre-save hook hash it
      role,
      address,
      phoneNumber,
      zipcode: zipArray,
      location,
      isActive: role === "serviceProvider" ? false : true,
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
        ssnLast4,
        dob,
      });

      const stripe = await import("stripe").then((m) => m.default);
      const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

      const account = await stripeInstance.accounts.create({
        type: "express",
        country: "US",
        email,
        capabilities: { transfers: { requested: true } },
        business_type: "individual",
      });

      userData.stripeAccountId = account.id;
    }

    const newUser = await Users.create(userData);

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: newUser._id },
      process.env.REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    newUser.refreshToken = refreshToken;
    await newUser.save();

    if (role === "serviceProvider") {
      const stripe = await import("stripe").then((m) => m.default);
      const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

      const baseUrl =
        process.env.FRONTEND_BASE_URL || "https://www.blinqfix.com"; // Use HTTPS!

      const accountLink = await stripeInstance.accountLinks.create({
        account: newUser.stripeAccountId,
        refresh_url: `https://blinqfix.com/onboard-refresh`,
        return_url: `blinqfix://onboarding-complete`,
        type: "account_onboarding",
      });


      return res.json({
        token,
        refreshToken,
        stripeOnboardingUrl: accountLink.url,
      });
    }

    return res.json({ token, refreshToken });
  } catch (err) {
    console.error("Error in POST /register:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Look up user with password
    const user = await Users.findOne({ email }).select("+password");
    if (!user || !user.password) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    if (user.isDeleted)
      return res
        .status(403)
        .json({ msg: "Account has been deleted or does not exist" });

    // 2. Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // 3. Generate short-lived access token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 4. Generate long-lived refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Save refresh token to DB
    user.refreshToken = refreshToken;
    await user.save();

    // 6. Send both tokens back to client
    res.json({ token, refreshToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// router.post("/login", async (req, res) => {
//   console.log("📥 Received login request:", req.body);

//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       console.warn("❌ Missing email or password");
//       return res.status(400).json({ msg: "Missing email or password" });
//     }

//     const user = await Users.findOne({ email });
//     if (!user) {
//       console.warn("❌ User not found for email:", email);
//       return res.status(401).json({ msg: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       console.warn("❌ Password mismatch for email:", email);
//       return res.status(401).json({ msg: "Invalid credentials" });
//     }

//     const token = generateToken(user);
//     const refreshToken = generateRefreshToken(user);

//     console.log("✅ Auth successful:", user.email);
//     res.json({ token, refreshToken });
//   } catch (err) {
//     console.error("🔥 Login route error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });



/**
 * POST /api/auth/request-reset
 */
// router.post("/request-reset", async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await Users.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ msg: "No user with that email" });
//     }
//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const expiry = Date.now() + 60 * 60 * 1000; // 1h
//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExp = expiry;
//     await user.save();
//     // In a real app: email the link containing resetToken
//     return res.json({ msg: "Reset token set. Email user with this token." });
//   } catch (err) {
//     console.error("requestReset error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// router.post("/request-password-reset", async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await Users.findOne({ email });

//     if (!user) {
//       return res
//         .status(200)
//         .json({ msg: "If the email is valid, a reset link was sent." });
//     }

//     // Generate secure token
//     const token = crypto.randomBytes(32).toString("hex");
//     user.resetPasswordToken = token;
//     user.resetPasswordExp = Date.now() + 3600000; // 1 hour
//     await user.save();

//     const resetUrl = `https://yourfrontend.com/reset-password/${token}`;
//     const message = `To reset your password, click here: ${resetUrl}`;

//     await sendEmail({
//       to: user.email,
//       subject: "Password Reset",
//       text: message,
//     });

//     res.json({ msg: "Password reset link sent." });
//   } catch (err) {
//     console.error("Reset request error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });
// /**
//  * PUT /api/auth/reset-password/:token
//  */
// router.put("/reset-password/:token", async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { email, password } = req.body;
//     const user = await Users.findOne({
//       email,
//       resetPasswordToken: token,
//       resetPasswordExp: { $gt: Date.now() },
//     }).select("+password");
//     if (!user) {
//       return res.status(400).json({ msg: "Invalid or expired reset token" });
//     }
//     // Hash new password and clear reset fields
//     user.password = await bcrypt.hash(password, 10);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExp = undefined;
//     await user.save();
//     return res.json({ msg: "Password reset successfully" });
//   } catch (err) {
//     console.error("Reset password error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// POST /request-password-reset

router.post("/request-password-reset", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(200).json({ msg: "If the email is valid, a reset link was sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExp = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/reset-password/${token}`;
    const message = `To reset your password, tap here: ${resetUrl}`;

    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      text: message,
    });

    res.json({ msg: "Password reset link sent." });
  } catch (err) {
    console.error("Reset request error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await Users.findOne({
      resetPasswordToken: token,
      resetPasswordExp: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired reset token." });
    }

    const hashed = await bcrypt.hash(password, 12);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExp = undefined;

    await user.save();
    res.json({ msg: "Password has been reset successfully." });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ msg: "Missing refresh token" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const user = await Users.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ msg: "Invalid or expired refresh token" });
    }

    // Generate new access token and refresh token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    // Save new refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();

    return res.json({ token, refreshToken: newRefreshToken });
  } catch (err) {
    console.error("Refresh error:", err.message);
    return res.status(401).json({ msg: "Token refresh failed" });
  }
});

export default router;
