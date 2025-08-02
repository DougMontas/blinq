// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // for reset tokens
import Users from "../models/Users.js";
import sendEmail from "../utils/sendEmail.js";
import { auth } from "../middlewares/auth.js";
import mongoose from "mongoose";
import Stripe from "stripe";

const router = express.Router();
const baseUrl = process.env.FRONTEND_BASE_URL;

const refreshUrl = process.env.STRIPE_ONBOARDING_REFRESH_URL?.startsWith("http")
  ? process.env.STRIPE_ONBOARDING_REFRESH_URL
  : "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/onboarding-success";

const returnUrl = process.env.STRIPE_ONBOARDING_RETURN_URL?.startsWith("http")
  ? process.env.STRIPE_ONBOARDING_RETURN_URL
  : "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/onboarding-success";

router.post("/register", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
      optInSms,
    } = req.body;

    if (!name || !email || !password || !address || !phoneNumber) {
      return res.status(400).json({
        msg: "Name, email, password, address and phoneNumber are required.",
      });
    }

    email = email.toLowerCase().trim();
    const existingUser = await Users.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const zipArray = Array.isArray(zipcode) ? zipcode.map(Number) : [Number(zipcode)];

    const userData = {
      name,
      email,
      password,
      role,
      address,
      phoneNumber,
      zipcode: zipArray,
      location,
      optInSms,
      isActive: role === "serviceProvider" ? false : true,
    };

    let dobDate;
    if (role === "serviceProvider") {
      if (!ssnLast4 || !dob) {
        return res.status(400).json({
          msg: "SSN last 4 digits and DOB are required for providers.",
        });
      }

      dobDate = new Date(dob);
      if (isNaN(dobDate.getTime())) {
        return res.status(400).json({
          msg: "Invalid DOB format. Use YYYY-MM-DD.",
        });
      }

      Object.assign(userData, {
        serviceType,
        billingTier,
        serviceZipcode: zipArray,
        ssnLast4,
        dob,
        w9: null,
        businessLicense: null,
        proofOfInsurance: null,
        independentContractorAgreement: null,
      });
    }

    const [newUser] = await Users.create([userData], { session });

    let clientSecret = null;

    if (role === "serviceProvider") {
      const [firstName, ...lastParts] = name.trim().split(" ");
      const lastName = lastParts.length ? lastParts.join(" ") : "Provider";

      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email,
        business_type: "individual",
        individual: {
          first_name: firstName,
          last_name: lastName,
          ssn_last_4: ssnLast4,
          dob: {
            day: dobDate.getUTCDate(),
            month: dobDate.getUTCMonth() + 1,
            year: dobDate.getUTCFullYear(),
          },
          phone: phoneNumber,
          email,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      newUser.stripeAccountId = account.id;

      if (billingTier === "hybrid") {
        const stripeCustomer = await stripe.customers.create({
          email,
          name,
          phone: phoneNumber,
          metadata: {
            userId: newUser._id.toString(),
            billingTier: "hybrid",
          },
        });

        newUser.stripeCustomerId = stripeCustomer.id;

        let subscription;
        try {
          subscription = await stripe.subscriptions.create({
            customer: stripeCustomer.id,
            items: [{ price: process.env.STRIPE_HYBRID_PRICE_ID }],
            trial_period_days: 1,
            payment_behavior: "default_incomplete",
            collection_method: "charge_automatically",
            payment_settings: {
              save_default_payment_method: "on_subscription",
              payment_method_types: ["card"],
            },
            metadata: { userId: newUser._id.toString() },
            expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
          });
        } catch (stripeSubErr) {
          console.error("❌ Stripe subscription creation failed:", stripeSubErr);
          throw new Error("Stripe subscription creation error: " + stripeSubErr.message);
        }

        const paymentIntent = subscription.latest_invoice?.payment_intent;
        const setupIntent = subscription.pending_setup_intent;

        if (paymentIntent?.client_secret) {
          clientSecret = paymentIntent.client_secret;
        } else if (setupIntent?.client_secret) {
          clientSecret = setupIntent.client_secret;
        } else {
          console.error("❌ Missing both paymentIntent and setupIntent:", subscription);
          throw new Error("Stripe subscription missing client secret.");
        }
      }

      const accountLink = await stripe.accountLinks.create({
        account: newUser.stripeAccountId,
        refresh_url: process.env.STRIPE_ONBOARDING_REFRESH_URL,
        return_url: process.env.STRIPE_ONBOARDING_RETURN_URL,
        type: "account_onboarding",
      });

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
      // await newUser.save({ session });
      await newUser.save({ session, validateBeforeSave: false }); // ✅ prevents required field error

      await session.commitTransaction();
      session.endSession();

      return res.json({
        token,
        refreshToken,
        stripeOnboardingUrl: accountLink.url,
        stripeDashboardUrl: `https://dashboard.stripe.com/express/${newUser.stripeAccountId}`,
        subscriptionClientSecret: clientSecret,
      });
    } else {
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
      // await newUser.save({ session });
      await newUser.save({ session, validateBeforeSave: false }); // ✅ prevents required field error

      await session.commitTransaction();
      session.endSession();

      return res.json({
        token,
        refreshToken,
      });
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Registration failed:", err);
    return res.status(500).json({
      msg: "Registration failed",
      error: err.message,
    });
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
    // const token = jwt.sign(
    //   { id: user._id, role: user.role },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "1h" }
    // );

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        stripeAccountId: user.stripeAccountId, // ✅ add this
      },
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
    // await user.save();
    await user.save({ validateBeforeSave: false });


    // 6. Send both tokens back to client
    res.json({ token, refreshToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


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
    console.log("✅ Stored token:", token);

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
  const { token } = req.params
  const { password } = req.body;
  console.log("🟡 Received token from frontend:", token);

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ msg: "Password must be at least 6 characters." });
  }

  try {
    const decodedToken = decodeURIComponent(token);
    console.log("🟡 Received token from frontend:", token);

    console.log("🔍 Looking for user with resetToken:", decodedToken);

    const user = await Users.findOne({
      resetToken: decodedToken,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.warn("❌ Invalid or expired token:", decodedToken);
      return res.status(400).json({ msg: "Token is invalid or expired." });
    }

    console.log("🔐 Resetting password for:", user.email || user._id);

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();
    console.log("✅ Password reset successful");

    res.json({ msg: "Password has been reset." });
  } catch (err) {
    console.error("❌ Reset error:", err);
    res.status(500).json({ msg: "Failed to reset password." });
  }
});

router.post("/change-password", auth, async (req, res) => {
  console.log("🔐 Incoming /change-password request");

  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  console.log("📦 req.user:", user);
  console.log("📝 Request body:", { currentPassword, newPassword });

  if (!user || !user._id) {
    console.warn("❌ No authenticated user found in request.");
    return res.status(401).json({ msg: "Unauthorized or invalid user context." });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ msg: "New password must be at least 6 characters." });
  }

  try {
    const existingUser = await Users.findById(user._id).select("+password");
    if (!existingUser) {
      console.error("❌ User not found in database after auth:", user._id);
      return res.status(404).json({ msg: "User not found." });
    }

    console.log("👤 Existing user email:", existingUser.email);
    console.log("🔐 Existing password hash:", existingUser.password);

    const isMatch = await bcrypt.compare(currentPassword, existingUser.password);
    console.log("🔎 Password match result:", isMatch);

    if (!isMatch) {
      console.warn("❌ Current password does not match for user:", existingUser._id);
      return res.status(401).json({ msg: "Current password is incorrect." });
    }

    // ✅ Let schema pre-save hook hash the new password
    existingUser.password = newPassword;
    await existingUser.save();
    console.log("✅ Password successfully updated for user:", existingUser._id);

    // Confirm password update by reloading user
    const confirmUser = await Users.findById(user._id).select("+password");
    console.log("🔁 Confirmed saved password hash:", confirmUser.password);

    res.json({ msg: "Password successfully changed." });
  } catch (err) {
    console.error("❌ Error changing password:", err.message);
    res.status(500).json({ msg: "Server error. Please try again later." });
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
