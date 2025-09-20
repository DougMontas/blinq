// // backend/routes/authRoutes.js
// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import crypto from "crypto";
// import Users from "../models/Users.js";
// import sendEmail from "../utils/sendEmail.js";
// import { auth } from "../middlewares/auth.js";
// import mongoose from "mongoose";
// import Stripe from "stripe";

// const router = express.Router();
// const baseUrl = process.env.FRONTEND_BASE_URL;

// const refreshUrl = process.env.STRIPE_ONBOARDING_REFRESH_URL?.startsWith("http")
//   ? process.env.STRIPE_ONBOARDING_REFRESH_URL
//   : "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/onboarding-success";

// const returnUrl = process.env.STRIPE_ONBOARDING_RETURN_URL?.startsWith("http")
//   ? process.env.STRIPE_ONBOARDING_RETURN_URL
//   : "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/onboarding-success";

// router.post("/register", async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//   try {
//     let {
//       name,
//       email,
//       password,
//       role = "customer",
//       address,
//       phoneNumber,
//       zipcode,
//       serviceType,
//       billingTier,
//       // ssnLast4,
//       // dob,
//       location,
//       isActive,
//       optInSms,
//     } = req.body;

//     if (!name || !email || !password || !address || !phoneNumber) {
//       return res.status(400).json({
//         msg: "Name, email, password, address and phoneNumber are required.",
//       });
//     }

//     email = email.toLowerCase().trim();
//     const existingUser = await Users.findOne({ email });
//     if (existingUser)
//       return res.status(400).json({ msg: "User already exists" });

//     const zipArray = Array.isArray(zipcode)
//       ? zipcode.map(Number)
//       : [Number(zipcode)];

//     const userData = {
//       name,
//       email,
//       password,
//       role,
//       address,
//       phoneNumber,
//       zipcode: zipArray,
//       location,
//       optInSms,
//       isActive: role === "serviceProvider" ? false : true,
//     };

//     // let dobDate;
//     if (typeof optInSms !== "boolean" || optInSms !== true) {
//       return res.status(400).json({
//         msg: "You must accept SMS notifications to register for BlinqFix.",
//       });
//     }

//     // dobDate = new Date(dob);
//     // if (isNaN(dobDate.getTime())) {
//     //   return res.status(400).json({
//     //     msg: "Invalid DOB format. Use YYYY-MM-DD.",
//     //   });
//     // }

//     if (role === "serviceProvider") {
//       Object.assign(userData, {
//         serviceType,
//         billingTier,
//         serviceZipcode: zipArray,
//         // ssnLast4,
//         // dob,
//         w9: null,
//         businessLicense: null,
//         proofOfInsurance: null,
//         independentContractorAgreement: null,
//       });
//     }

//     const [newUser] = await Users.create([userData], { session });

//     let clientSecret = null;

//     if (role === "serviceProvider") {
//       const [firstName, ...lastParts] = name.trim().split(" ");
//       const lastName = lastParts.length ? lastParts.join(" ") : "Provider";

//       const account = await stripe.accounts.create({
//         type: "express",
//         country: "US",
//         email,
//         business_type: "individual",
//         individual: {
//           first_name: firstName,
//           last_name: lastName,
//           // ssn_last_4: ssnLast4,
//           // dob: {
//           //   day: dobDate.getUTCDate(),
//           //   month: dobDate.getUTCMonth() + 1,
//           //   year: dobDate.getUTCFullYear(),
//           // },
//           phone: phoneNumber,
//           email,
//         },
//         capabilities: {
//           card_payments: { requested: true },
//           transfers: { requested: true },
//         },
//       });

//       newUser.stripeAccountId = account.id;

//       if (billingTier === "hybrid") {
//         const stripeCustomer = await stripe.customers.create({
//           email,
//           name,
//           phone: phoneNumber,
//           metadata: {
//             userId: newUser._id.toString(),
//             billingTier: "hybrid",
//           },
//         });

//         newUser.stripeCustomerId = stripeCustomer.id;

//         let subscription;
//         try {
//           subscription = await stripe.subscriptions.create({
//             customer: stripeCustomer.id,
//             items: [{ price: process.env.STRIPE_HYBRID_PRICE_ID }],
//             trial_period_days: 1,
//             payment_behavior: "default_incomplete",
//             collection_method: "charge_automatically",
//             payment_settings: {
//               save_default_payment_method: "on_subscription",
//               payment_method_types: ["card"],
//             },
//             metadata: { userId: newUser._id.toString() },
//             expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
//           });
//         } catch (stripeSubErr) {
//           console.error(
//             "❌ Stripe subscription creation failed:",
//             stripeSubErr
//           );
//           throw new Error(
//             "Stripe subscription creation error: " + stripeSubErr.message
//           );
//         }

//         const paymentIntent = subscription.latest_invoice?.payment_intent;
//         const setupIntent = subscription.pending_setup_intent;

//         if (paymentIntent?.client_secret) {
//           clientSecret = paymentIntent.client_secret;
//         } else if (setupIntent?.client_secret) {
//           clientSecret = setupIntent.client_secret;
//         } else {
//           console.error(
//             "❌ Missing both paymentIntent and setupIntent:",
//             subscription
//           );
//           throw new Error("Stripe subscription missing client secret.");
//         }
//       }

//       const accountLink = await stripe.accountLinks.create({
//         account: newUser.stripeAccountId,
//         refresh_url: process.env.STRIPE_ONBOARDING_REFRESH_URL,
//         return_url: process.env.STRIPE_ONBOARDING_RETURN_URL,
//         type: "account_onboarding",
//       });

//       const token = jwt.sign(
//         { id: newUser._id, role: newUser.role },
//         process.env.JWT_SECRET,
//         { expiresIn: "15m" }
//       );

//       const refreshToken = jwt.sign(
//         { id: newUser._id },
//         process.env.REFRESH_SECRET,
//         { expiresIn: "30d" }
//       );

//       newUser.refreshToken = refreshToken;
//       // await newUser.save({ session });
//       await newUser.save({ session, validateBeforeSave: false }); // ✅ prevents required field error

//       await session.commitTransaction();
//       session.endSession();

//       return res.json({
//         token,
//         refreshToken,
//         stripeOnboardingUrl: accountLink.url,
//         stripeDashboardUrl: `https://dashboard.stripe.com/express/${newUser.stripeAccountId}`,
//         subscriptionClientSecret: clientSecret,
//       });
//     } else {
//       const token = jwt.sign(
//         { id: newUser._id, role: newUser.role },
//         process.env.JWT_SECRET,
//         { expiresIn: "15m" }
//       );

//       const refreshToken = jwt.sign(
//         { id: newUser._id },
//         process.env.REFRESH_SECRET,
//         { expiresIn: "30d" }
//       );

//       newUser.refreshToken = refreshToken;
//       // await newUser.save({ session });
//       await newUser.save({ session, validateBeforeSave: false }); // ✅ prevents required field error

//       await session.commitTransaction();
//       session.endSession();

//       return res.json({
//         token,
//         refreshToken,
//       });
//     }
//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("❌ Registration failed:", err);
//     return res.status(500).json({
//       msg: "Registration failed",
//       error: err.message,
//     });
//   }
// });

// // router.post("/login", async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     // 1. Look up user with password
// //     const user = await Users.findOne({ email }).select("+password");
// //     if (!user || !user.password) {
// //       return res.status(401).json({ msg: "Invalid credentials" });
// //     }

// //     if (user.isDeleted)
// //       return res
// //         .status(403)
// //         .json({ msg: "Account has been deleted or does not exist" });

// //     // 2. Compare password
// //     const match = await bcrypt.compare(password, user.password);
// //     if (!match) {
// //       return res.status(401).json({ msg: "Invalid credentials" });
// //     }

// //     // 3. Generate short-lived access token
// //     // const token = jwt.sign(
// //     //   { id: user._id, role: user.role },
// //     //   process.env.JWT_SECRET,
// //     //   { expiresIn: "1h" }
// //     // );

// //     const token = jwt.sign(
// //       {
// //         id: user._id,
// //         role: user.role,
// //         stripeAccountId: user.stripeAccountId, // ✅ add this
// //       },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "1h" }
// //     );

// //     // 4. Generate long-lived refresh token
// //     const refreshToken = jwt.sign(
// //       { id: user._id },
// //       process.env.REFRESH_SECRET,
// //       { expiresIn: "7d" }
// //     );

// //     // 5. Save refresh token to DB
// //     user.refreshToken = refreshToken;
// //     // await user.save();
// //     await user.save({ validateBeforeSave: false });

// //     // 6. Send both tokens back to client
// //     res.json({ token, refreshToken });
// //   } catch (err) {
// //     console.error("Login error:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // POST /api/auth/login
// router.post("/login", async (req, res) => {
//   const rid =
//     (crypto.randomUUID && crypto.randomUUID()) ||
//     Math.random().toString(36).slice(2, 10);

//   const startedAt = Date.now();
//   const ua = req.get("user-agent");
//   const ip = req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress;

//   try {
//     const rawEmail = String(req.body?.email || "");
//     const password = String(req.body?.password || "");
//     const email = rawEmail.trim().toLowerCase();

//     console.log("🔐 [LOGIN:start]", {
//       rid,
//       ip,
//       ua,
//       emailLen: email.length,
//       hasPassword: password.length > 0,
//     });

//     if (!email || !password) {
//       console.warn("🔐 [LOGIN:bad-request]", { rid, emailMissing: !email, passwordMissing: !password });
//       return res.status(400).json({ msg: "Email and password are required" });
//     }

//     console.time(`⏱ [${rid}] findUser`);
//     // Include +password to compare hash; everything else comes normally
//     const user = await Users.findOne({ email }).select("+password");
//     console.timeEnd(`⏱ [${rid}] findUser`);

//     if (!user || !user.password) {
//       console.warn("🔐 [LOGIN:not-found-or-no-pass]", {
//         rid,
//         found: !!user,
//         hasPassword: !!user?.password,
//       });
//       return res.status(401).json({ msg: "Invalid credentials" });
//     }

//     if (user.isDeleted) {
//       console.warn("🔐 [LOGIN:deleted]", {
//         rid,
//         id: String(user._id),
//         role: user.role,
//       });
//       return res.status(403).json({ msg: "Account has been deleted or does not exist" });
//     }

//     console.time(`⏱ [${rid}] bcryptCompare`);
//     const match = await bcrypt.compare(password, user.password);
//     console.timeEnd(`⏱ [${rid}] bcryptCompare`);

//     if (!match) {
//       console.warn("🔐 [LOGIN:bad-password]", { rid, id: String(user._id), role: user.role });
//       return res.status(401).json({ msg: "Invalid credentials" });
//     }

//     // Helpful diagnostics for service providers (the ones crashing)
//     if ((user.role || "").toLowerCase() === "serviceprovider") {
//       console.log("🧩 [LOGIN:provider-diagnostics]", {
//         rid,
//         id: String(user._id),
//         role: user.role,
//         stripeAccountId: !!user.stripeAccountId,
//         optInSms: !!user.optInSms,
//         acceptedICA: !!user.acceptedICA,
//         hasDocs: {
//           w9: !!user.w9,
//           businessLicense: !!user.businessLicense,
//           proofOfInsurance: !!user.proofOfInsurance,
//           icaString: !!user.independentContractorAgreement,
//         },
//         contact: {
//           email: !!user.email,
//           phoneNumber: !!user.phoneNumber,
//         },
//         profilePicture: !!user.profilePicture,
//         zipcodeShape: Array.isArray(user.zipcode) ? "array" : typeof user.zipcode,
//         zipcodeFirst: Array.isArray(user.zipcode) ? user.zipcode?.[0] : user.zipcode,
//         addressPresent: !!user.address,
//         serviceTypePresent: !!user.serviceType,
//         yearsExperience: user.yearsExperience ?? null,
//       });
//     }

//     // Access token (short-lived)
//     const tokenPayload = {
//       id: user._id,
//       role: user.role,
//       stripeAccountId: user.stripeAccountId || null,
//     };

//     console.time(`⏱ [${rid}] jwtAccess`);
//     const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });
//     console.timeEnd(`⏱ [${rid}] jwtAccess`);

//     // Refresh token (long-lived)
//     console.time(`⏱ [${rid}] jwtRefresh`);
//     const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
//     console.timeEnd(`⏱ [${rid}] jwtRefresh`);

//     user.refreshToken = refreshToken;

//     console.time(`⏱ [${rid}] saveUser`);
//     await user.save({ validateBeforeSave: false });
//     console.timeEnd(`⏱ [${rid}] saveUser`);

//     res.setHeader("X-Request-Id", rid);
//     console.log("✅ [LOGIN:success]", {
//       rid,
//       id: String(user._id),
//       role: user.role,
//       hasStripe: !!user.stripeAccountId,
//       totalMs: Date.now() - startedAt,
//     });

//     return res.json({ token, refreshToken });
//   } catch (err) {
//     console.error("💥 [LOGIN:error]", { rid, msg: err?.message, stack: err?.stack });
//     res.setHeader("X-Request-Id", rid);
//     return res.status(500).json({ msg: "Server error", rid });
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
//     console.log("✅ Stored token:", token);

//     const resetLink = `https://blinqfix.com/reset-password/${token}`;
//     // const resetLink = `https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/reset-password/${token}`;

//     user.resetToken = token;
//     user.resetTokenExpires = Date.now() + 1000 * 60 * 60; // 1 hour
//     await user.save();
//     console.log("📥 Token saved:", user.resetToken);
//     console.log("📆 Expires at:", new Date(user.resetTokenExpires));

//     console.log("🔐 Token saved to DB for:", user.email);
//     console.log("📅 Expires at:", new Date(user.resetTokenExpires));

//     if (!user.email || typeof user.email !== "string") {
//       console.error("❌ Invalid user.email:", user.email);
//       return res.status(500).json({ msg: "User email is invalid." });
//     }

//     console.log("📬 Sending password reset to:", user.email);
//     console.log("🔗 Reset link:", resetLink);
//     console.log("🚀 Calling sendEmail() for:", user.email);

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

// // router.post("/reset-password/:token", async (req, res) => {
// //   const { token } = req.params;
// //   const { password } = req.body;
// //   console.log("🟡 Received token from frontend:", token);

// //   if (!password || typeof password !== "string" || password.length < 6) {
// //     return res
// //       .status(400)
// //       .json({ msg: "Password must be at least 6 characters." });
// //   }

// //   try {
// //     const decodedToken = decodeURIComponent(token);
// //     console.log("🟡 Received token from frontend:", token);

// //     console.log("🔍 Looking for user with resetToken:", decodedToken);

// //     const user = await Users.findOne({
// //       resetToken: decodedToken,
// //       resetTokenExpires: { $gt: Date.now() },
// //     });

// //     if (!user) {
// //       console.warn("❌ Invalid or expired token:", decodedToken);
// //       return res.status(400).json({ msg: "Token is invalid or expired." });
// //     }

// //     console.log("🔐 Resetting password for:", user.email || user._id);

// //     user.password = await bcrypt.hash(password, 10);
// //     user.resetToken = undefined;
// //     user.resetTokenExpires = undefined;

// //     await user.save();
// //     console.log("✅ Password reset successful");

// //     res.json({ msg: "Password has been reset." });
// //   } catch (err) {
// //     console.error("❌ Reset error:", err);
// //     res.status(500).json({ msg: "Failed to reset password." });
// //   }
// // });

// router.post("/reset-password/:token", async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;

//   if (!password || typeof password !== "string" || password.length < 6) {
//     return res
//       .status(400)
//       .json({ msg: "Password must be at least 6 characters." });
//   }

//   try {
//     const decodedToken = decodeURIComponent(token).trim();

//     console.log("🟡 Decoded token received from frontend:", decodedToken);
//     console.log("🔍 Looking for user with resetToken:", decodedToken);
//     console.log("Raw token:", token);
//     console.log("Decoded token:", decodedToken);

//     const user = await Users.findOne({
//       resetToken: decodedToken,
//       resetTokenExpires: { $gt: Date.now() },
//     }).select("+resetToken");
    

//     if (!user) {
//       console.warn("❌ Invalid or expired token:", decodedToken);
//       return res.status(400).json({ msg: "Token is invalid or expired." });
//     }

//     console.log("🔐 Resetting password for:", user.email || user._id);

//     user.password = password
//     // user.password = await bcrypt.hash(password, 10);
//     user.resetToken = undefined;
//     user.resetTokenExpires = undefined;

//     await user.save();
//     console.log("✅ Password reset successful for:", user.email);

//     res.json({ msg: "Password has been reset." });
//   } catch (err) {
//     console.error("❌ Reset error:", err);
//     res.status(500).json({ msg: "Failed to reset password." });
//   }
// });

// router.post("/change-password", auth, async (req, res) => {
//   console.log("🔐 Incoming /change-password request");

//   const { currentPassword, newPassword } = req.body;
//   const user = req.user;

//   console.log("📦 req.user:", user);
//   console.log("📝 Request body:", { currentPassword, newPassword });

//   if (!user || !user._id) {
//     console.warn("❌ No authenticated user found in request.");
//     return res
//       .status(401)
//       .json({ msg: "Unauthorized or invalid user context." });
//   }

//   if (!newPassword || newPassword.length < 6) {
//     return res
//       .status(400)
//       .json({ msg: "New password must be at least 6 characters." });
//   }

//   try {
//     const existingUser = await Users.findById(user._id).select("+password");
//     if (!existingUser) {
//       console.error("❌ User not found in database after auth:", user._id);
//       return res.status(404).json({ msg: "User not found." });
//     }

//     console.log("👤 Existing user email:", existingUser.email);
//     console.log("🔐 Existing password hash:", existingUser.password);

//     const isMatch = await bcrypt.compare(
//       currentPassword,
//       existingUser.password
//     );
//     console.log("🔎 Password match result:", isMatch);

//     if (!isMatch) {
//       console.warn(
//         "❌ Current password does not match for user:",
//         existingUser._id
//       );
//       return res.status(401).json({ msg: "Current password is incorrect." });
//     }

//     // ✅ Let schema pre-save hook hash the new password
//     existingUser.password = newPassword;
//     await existingUser.save();
//     console.log("✅ Password successfully updated for user:", existingUser._id);

//     // Confirm password update by reloading user
//     const confirmUser = await Users.findById(user._id).select("+password");
//     console.log("🔁 Confirmed saved password hash:", confirmUser.password);

//     res.json({ msg: "Password successfully changed." });
//   } catch (err) {
//     console.error("❌ Error changing password:", err.message);
//     res.status(500).json({ msg: "Server error. Please try again later." });
//   }
// });

// router.post("/refresh-token", async (req, res) => {
//   try {
//     const { refreshToken } = req.body;

//     if (!refreshToken) {
//       return res.status(400).json({ msg: "Missing refresh token" });
//     }

//     // Verify refresh token
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

//     const user = await Users.findById(decoded.id);
//     if (!user || user.refreshToken !== refreshToken) {
//       return res.status(401).json({ msg: "Invalid or expired refresh token" });
//     }

//     // Generate new access token and refresh token
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "15m" }
//     );

//     const newRefreshToken = jwt.sign(
//       { id: user._id },
//       process.env.REFRESH_SECRET,
//       { expiresIn: "30d" }
//     );

//     // Save new refresh token in DB
//     user.refreshToken = newRefreshToken;
//     await user.save();

//     return res.json({ token, refreshToken: newRefreshToken });
//   } catch (err) {
//     console.error("Refresh error:", err.message);
//     return res.status(401).json({ msg: "Token refresh failed" });
//   }
// });

// export default router;


// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Users from "../models/Users.js";
import sendEmail from "../utils/sendEmail.js";
import { auth } from "../middlewares/auth.js";
import mongoose from "mongoose";
import Stripe from "stripe";
import "dotenv/config";


const router = express.Router();
const baseUrl = process.env.FRONTEND_BASE_URL;

// Fallbacks for Stripe onboarding links if envs aren't http URLs
const refreshUrl = process.env.STRIPE_ONBOARDING_REFRESH_URL?.startsWith("http")
  ? process.env.STRIPE_ONBOARDING_REFRESH_URL
  : "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/onboarding-success";

const returnUrl = process.env.STRIPE_ONBOARDING_RETURN_URL?.startsWith("http")
  ? process.env.STRIPE_ONBOARDING_RETURN_URL
  : "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/onboarding-success";

// Initialize Stripe once
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ----------------------- helpers -----------------------
const asBool = (v) =>
  v === true || v === 1 || v === "1" || String(v).toLowerCase() === "true";

const normalizeZipStrings = (z) => {
  const arr = Array.isArray(z) ? z : [z];
  return arr
    .map((x) => (x == null ? "" : String(x).trim()))
    .filter((x) => x.length > 0);
};

const toZipNums = (zipStrArr) =>
  zipStrArr
    .map((z) => parseInt(String(z).replace(/\D/g, ""), 10))
    .filter((n) => Number.isFinite(n));

const BILLING = new Set(["profit_sharing", "hybrid", "subscription"]);

// ----------------------- REGISTER -----------------------
router.post("/register", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

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
      location,            // optional { type:'Point', coordinates:[lng,lat] }
      smsPreferences,      // optional { jobUpdates?: boolean, marketing?: boolean }
      // isActive,         // ignored on purpose; server decides
      // optInSms,         // legacy: ignored (we mirror from jobUpdates)
    } = req.body || {};

    // ---- basic validation
    if (!name || !email || !password || !address || !phoneNumber) {
      return res.status(400).json({
        msg: "Name, email, password, address and phoneNumber are required.",
      });
    }

    email = String(email).toLowerCase().trim();

    const existingUser = await Users.findOne({ email }).lean();
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // ---- normalize zips
    // Users.zipcode is array of STRING; Users.serviceZipcode is array of NUMBER
    const zipStrArr = normalizeZipStrings(zipcode);
    const serviceZipNums = toZipNums(zipStrArr);

    // ---- sms preferences (new) with legacy mirror to optInSms
    const jobUpdates = asBool(smsPreferences?.jobUpdates ?? false);
    const marketing = asBool(smsPreferences?.marketing ?? false);

    // Build base user
    const userData = {
      name,
      email,
      password, // schema pre-save hook will hash it
      role,
      address,
      phoneNumber: String(phoneNumber),
      zipcode: zipStrArr, // strings
      location, // optional
      isActive: role === "serviceProvider" ? false : true, // providers off until onboarding
      smsPreferences: { jobUpdates, marketing },
      optInSms: jobUpdates, // legacy mirror for backward compatibility
    };

    // Providers: extra requirements
    if (role === "serviceProvider") {
      if (!serviceType) {
        return res
          .status(400)
          .json({ msg: "serviceType is required for service providers." });
      }
      if (!billingTier || !BILLING.has(String(billingTier))) {
        return res.status(400).json({
          msg: "billingTier must be one of 'profit_sharing' or 'Priority'.",
        });
      }

      Object.assign(userData, {
        serviceType,
        billingTier,
        serviceZipcode: serviceZipNums, // numbers
        w9: null,
        businessLicense: null,
        proofOfInsurance: null,
        independentContractorAgreement: null,
      });
    }

    // Create user in a transaction
    const [newUser] = await Users.create([userData], { session });

    let subscriptionClientSecret = null;

    // Stripe Connect + optional subscription (hybrid)
    if (role === "serviceProvider") {
      const [firstName, ...lastParts] = String(name).trim().split(" ");
      const lastName = lastParts.length ? lastParts.join(" ") : "Provider";

      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email,
        business_type: "individual",
        individual: {
          first_name: firstName,
          last_name: lastName,
          phone: String(phoneNumber),
          email,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      newUser.stripeAccountId = account.id;

      if (billingTier === "hybrid") {
        const priceId = process.env.STRIPE_HYBRID_PRICE_ID;
        if (!priceId) {
          throw new Error("Missing STRIPE_HYBRID_PRICE_ID env var.");
        }

        const stripeCustomer = await stripe.customers.create({
          email,
          name,
          phone: String(phoneNumber),
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
            items: [{ price: priceId }],
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
          throw new Error(
            `Stripe subscription creation error: ${stripeSubErr.message}`
          );
        }

        const paymentIntent = subscription.latest_invoice?.payment_intent;
        const setupIntent = subscription.pending_setup_intent;

        if (paymentIntent?.client_secret) {
          subscriptionClientSecret = paymentIntent.client_secret;
        } else if (setupIntent?.client_secret) {
          subscriptionClientSecret = setupIntent.client_secret;
        } else {
          console.error("❌ Missing both paymentIntent and setupIntent:", subscription);
          throw new Error("Stripe subscription missing client secret.");
        }
      }

      const accountLink = await stripe.accountLinks.create({
        account: newUser.stripeAccountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: "account_onboarding",
      });

      // Tokens
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
      await newUser.save({ session, validateBeforeSave: false });

      await session.commitTransaction();
      session.endSession();

      return res.json({
        token,
        refreshToken,
        stripeOnboardingUrl: accountLink.url,
        stripeDashboardUrl: `https://dashboard.stripe.com/express/${newUser.stripeAccountId}`,
        subscriptionClientSecret,
      });
    }

    // Customer path (no Connect subscription)
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
    await newUser.save({ session, validateBeforeSave: false });

    await session.commitTransaction();
    session.endSession();

    return res.json({ token, refreshToken });
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

// ----------------------- LOGIN -----------------------
router.post("/login", async (req, res) => {
  const rid =
    (crypto.randomUUID && crypto.randomUUID()) ||
    Math.random().toString(36).slice(2, 10);

  const startedAt = Date.now();
  const ua = req.get("user-agent");
  const ip = req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress;

  try {
    const rawEmail = String(req.body?.email || "");
    const password = String(req.body?.password || "");
    const email = rawEmail.trim().toLowerCase();

    console.log("🔐 [LOGIN:start]", {
      rid,
      ip,
      ua,
      emailLen: email.length,
      hasPassword: password.length > 0,
    });

    if (!email || !password) {
      console.warn("🔐 [LOGIN:bad-request]", { rid, emailMissing: !email, passwordMissing: !password });
      return res.status(400).json({ msg: "Email and password are required" });
    }

    console.time(`⏱ [${rid}] findUser`);
    // Include +password to compare hash
    const user = await Users.findOne({ email }).select("+password");
    console.timeEnd(`⏱ [${rid}] findUser`);

    if (!user || !user.password) {
      console.warn("🔐 [LOGIN:not-found-or-no-pass]", {
        rid,
        found: !!user,
        hasPassword: !!user?.password,
      });
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    if (user.isDeleted) {
      console.warn("🔐 [LOGIN:deleted]", {
        rid,
        id: String(user._id),
        role: user.role,
      });
      return res.status(403).json({ msg: "Account has been deleted or does not exist" });
    }

    console.time(`⏱ [${rid}] bcryptCompare`);
    const match = await bcrypt.compare(password, user.password);
    console.timeEnd(`⏱ [${rid}] bcryptCompare`);

    if (!match) {
      console.warn("🔐 [LOGIN:bad-password]", { rid, id: String(user._id), role: user.role });
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Helpful diagnostics for service providers
    if ((user.role || "").toLowerCase() === "serviceprovider") {
      console.log("🧩 [LOGIN:provider-diagnostics]", {
        rid,
        id: String(user._id),
        role: user.role,
        stripeAccountId: !!user.stripeAccountId,
        optInSms: !!user.optInSms,
        acceptedICA: !!user.acceptedICA,
        hasDocs: {
          w9: !!user.w9,
          businessLicense: !!user.businessLicense,
          proofOfInsurance: !!user.proofOfInsurance,
          icaString: !!user.independentContractorAgreement,
        },
        contact: {
          email: !!user.email,
          phoneNumber: !!user.phoneNumber,
        },
        profilePicture: !!user.profilePicture,
        zipcodeShape: Array.isArray(user.zipcode) ? "array" : typeof user.zipcode,
        zipcodeFirst: Array.isArray(user.zipcode) ? user.zipcode?.[0] : user.zipcode,
        addressPresent: !!user.address,
        serviceTypePresent: !!user.serviceType,
        yearsExperience: user.yearsExperience ?? null,
      });
    }

    // Access token (short-lived)
    const tokenPayload = {
      id: user._id,
      role: user.role,
      stripeAccountId: user.stripeAccountId || null,
    };

    console.time(`⏱ [${rid}] jwtAccess`);
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.timeEnd(`⏱ [${rid}] jwtAccess`);

    // Refresh token (long-lived)
    console.time(`⏱ [${rid}] jwtRefresh`);
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, { expiresIn: "7d" });
    console.timeEnd(`⏱ [${rid}] jwtRefresh`);

    user.refreshToken = refreshToken;

    console.time(`⏱ [${rid}] saveUser`);
    await user.save({ validateBeforeSave: false });
    console.timeEnd(`⏱ [${rid}] saveUser`);

    res.setHeader("X-Request-Id", rid);
    console.log("✅ [LOGIN:success]", {
      rid,
      id: String(user._id),
      role: user.role,
      hasStripe: !!user.stripeAccountId,
      totalMs: Date.now() - startedAt,
    });

    return res.json({ token, refreshToken });
  } catch (err) {
    console.error("💥 [LOGIN:error]", { rid, msg: err?.message, stack: err?.stack });
    res.setHeader("X-Request-Id", rid);
    return res.status(500).json({ msg: "Server error", rid });
  }
});

// ----------------------- PASSWORD RESET (request) -----------------------
router.post("/request-password-reset", async (req, res) => {
  const raw = req.body?.email;
  const email = raw ? String(raw).toLowerCase().trim() : "";

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
    const resetLink = `https://blinqfix.com/reset-password/${token}`;

    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

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

// ----------------------- PASSWORD RESET (complete) -----------------------
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || typeof password !== "string" || password.length < 6) {
    return res
      .status(400)
      .json({ msg: "Password must be at least 6 characters." });
  }

  try {
    const decodedToken = decodeURIComponent(token).trim();

    const user = await Users.findOne({
      resetToken: decodedToken,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.warn("❌ Invalid or expired token:", decodedToken);
      return res.status(400).json({ msg: "Token is invalid or expired." });
    }

    // Let schema pre-save hook hash the new password
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();
    console.log("✅ Password reset successful for:", user.email);

    res.json({ msg: "Password has been reset." });
  } catch (err) {
    console.error("❌ Reset error:", err);
    res.status(500).json({ msg: "Failed to reset password." });
  }
});

// ----------------------- CHANGE PASSWORD (authed) -----------------------
router.post("/change-password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  if (!user || !user._id) {
    return res
      .status(401)
      .json({ msg: "Unauthorized or invalid user context." });
  }

  if (!newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ msg: "New password must be at least 6 characters." });
  }

  try {
    const existingUser = await Users.findById(user._id).select("+password");
    if (!existingUser) {
      return res.status(404).json({ msg: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Current password is incorrect." });
    }

    // Pre-save hook will hash
    existingUser.password = newPassword;
    await existingUser.save();

    res.json({ msg: "Password successfully changed." });
  } catch (err) {
    console.error("❌ Error changing password:", err.message);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
});

// ----------------------- REFRESH TOKEN -----------------------
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

    // Generate new tokens
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

    // Persist new refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    return res.json({ token, refreshToken: newRefreshToken });
  } catch (err) {
    console.error("Refresh error:", err.message);
    return res.status(401).json({ msg: "Token refresh failed" });
  }
});

// ----------------------- SMS PREFERENCES (authed) -----------------------
// Matches your frontend: api.put("/users/me/sms-preferences", { jobUpdates, marketing })
router.put("/users/me/sms-preferences", auth, async (req, res) => {
  try {
    const { jobUpdates, marketing } = req.body || {};
    const user = await Users.findById(req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const nextPrefs = {
      ...(user.smsPreferences?.toObject?.() || user.smsPreferences || {}),
      jobUpdates: asBool(jobUpdates),
      marketing: asBool(marketing),
    };

    user.smsPreferences = nextPrefs;
    user.optInSms = !!nextPrefs.jobUpdates; // legacy mirror
    await user.save(); // pre-save hook sets consentAt/updatedAt

    return res.json({
      smsPreferences: user.getSmsPreferences
        ? user.getSmsPreferences()
        : user.smsPreferences,
    });
  } catch (err) {
    console.error("❌ Update SMS preferences failed:", err);
    return res.status(500).json({ msg: "Failed to update SMS preferences" });
  }
});

export default router;
