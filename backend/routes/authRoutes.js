// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // for reset tokens
import Users from "../models/Users.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();
const baseUrl = process.env.FRONTEND_BASE_URL;

const refreshUrl = process.env.STRIPE_ONBOARDING_REFRESH_URL?.startsWith("http")
  ? process.env.STRIPE_ONBOARDING_REFRESH_URL
  : "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/onboarding-success";

const returnUrl = process.env.STRIPE_ONBOARDING_RETURN_URL?.startsWith("http")
  ? process.env.STRIPE_ONBOARDING_RETURN_URL
  : "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/onboarding-success";

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
      dob, // format: YYYY-MM-DD expected
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
      password,
      role,
      address,
      phoneNumber,
      zipcode: zipArray,
      location,
      isActive: role === "serviceProvider" ? false : true,
    };

    let dobDate;
    if (role === "serviceProvider") {
      if (!ssnLast4 || !dob) {
        return res
          .status(400)
          .json({
            msg: "SSN last 4 digits and DOB are required for providers.",
          });
      }

      dobDate = new Date(dob);
      if (isNaN(dobDate.getTime())) {
        return res
          .status(400)
          .json({ msg: "Invalid DOB format. Use YYYY-MM-DD." });
      }

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

      const [firstName, ...lastParts] = name.trim().split(" ");
      const lastName = lastParts.join(" ") || "Provider";

      const account = await stripeInstance.accounts.create({
        type: "express",
        country: "US",
        email,
        business_type: "individual",
        individual: {
          first_name: firstName,
          last_name: lastName,
          email,
          phone: phoneNumber,
          ssn_last_4: ssnLast4,
          dob: {
            day: dobDate.getUTCDate(),
            month: dobDate.getUTCMonth() + 1,
            year: dobDate.getUTCFullYear(),
          },
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
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
        process.env.FRONTEND_BASE_URL || "https://www.blinqfix.com";
      const accountLink = await stripeInstance.accountLinks.create({
        account: newUser.stripeAccountId,
        refresh_url:
          process.env.STRIPE_ONBOARDING_REFRESH_URL ||
          `${baseUrl}/onboarding-success`,
        return_url:
          process.env.STRIPE_ONBOARDING_RETURN_URL ||
          `${baseUrl}/onboarding-success`,
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

// router.post('/request-password-reset', async (req, res) => {
//   const { email } = req.body;
//   console.log("📨 Incoming password reset for:", email);

//   if (!email) return res.status(400).json({ msg: 'Email is required' });

//   try {
//     const user = await Users.findOne({ email });
//     if (!user) return res.status(200).json({ msg: 'If your account exists, a reset link has been sent.' });
//     // Prevent email enumeration

//     const token = crypto.randomBytes(32).toString("hex");

//     user.resetToken = token;
//     user.resetTokenExpires = Date.now() + 1000 * 60 * 60; // 1 hour from now
//     await user.save();

//     const resetLink = `https://your-app.com/reset-password/${token}`;
//     console.log("📬 Attempting to send reset email to:", user.email);
//     if (!user.email || typeof user.email !== "string") {
//       throw new Error("No valid email address on user object.");
//     }
//     await sendEmail(user.email, resetLink);

//     return res.json({ msg: "If your account exists, a reset link has been sent." });
//   } catch (err) {
//     console.error("Reset request error:", err);
//     res.status(500).json({ msg: "Server error. Please try again later." });
//   }
// });

// router.post("/request-password-reset", async (req, res) => {
//   const { email } = req.body;
//   if (!email) return res.status(400).json({ msg: "Email is required" });

//   try {
//     const user = await Users.findOne({ email });
//     if (!user) {
//       console.warn("🔍 No user found for:", email);
//       return res
//         .status(200)
//         .json({ msg: "If your account exists, a reset link has been sent." });
//     }

//     const token = crypto.randomBytes(32).toString("hex");
//     user.resetToken = token;
//     user.resetTokenExpires = Date.now() + 1000 * 60 * 60; // 1 hour
//     await user.save();

//     // const resetLink = `https://blinqfix.com/reset-password/${token}`;

//     // Add safe fallback logging
//     if (!user.email || typeof user.email !== "string") {
//       console.error("❌ Invalid user.email:", user.email);
//       return res.status(500).json({ msg: "User email is invalid." });
//     }

//     console.log("📬 Sending password reset to:", user.email);
//     console.log("🔗 Reset link:", resetLink);

//     const resetLink = `https://blinqfix.com/reset-password/${token}`;
//     console.log("📬 Attempting to send reset email to:", user.email);

//     await sendEmail({
//       to: user.email,
//       subject: "Reset Your BlinqFix Password",
//       text: `To reset your password, tap the link below:\n\n${resetLink}\n\nIf you didn’t request this, please ignore this email.`,
//     });

//     return res.json({
//       msg: "If your account exists, a reset link has been sent.",
//     });
//   } catch (err) {
//     console.error("Reset request error:", err);
//     res.status(500).json({ msg: "Server error. Please try again later." });
//   }
// });

router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Email is required" });

  try {
    const user = await Users.findOne({ email });
    if (!user) {
      console.warn("🔍 No user found for:", email);
      return res
        .status(200)
        .json({ msg: "If your account exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const resetLink = `https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/reset-password/${token}`;

    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    if (!user.email || typeof user.email !== "string") {
      console.error("❌ Invalid user.email:", user.email);
      return res.status(500).json({ msg: "User email is invalid." });
    }

    console.log("📬 Sending password reset to:", user.email);
    console.log("🔗 Reset link:", resetLink);

    await sendEmail({
      to: user.email,
      subject: "Reset Your BlinqFix Password",
      text: `To reset your password, tap the link below:\n\n${resetLink}\n\nIf you didn’t request this, please ignore this email.`,
    });

    return res.json({
      msg: "If your account exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Reset request error:", err);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
});


router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await Users.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ msg: "Token is invalid or expired." });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ msg: "Password has been reset." });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ msg: "Failed to reset password." });
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
