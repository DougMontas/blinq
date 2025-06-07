// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // for reset tokens
import Users from "../models/Users.js";

const router = express.Router();
const baseUrl = process.env.FRONTEND_BASE_URL || "https://1234abcd.ngrok.io";

//working
// router.post("/register", async (req, res) => {
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
//       location,
//       isActive,
//     } = req.body;

//     if (!name || !email || !password || !address || !phoneNumber) {
//       return res.status(400).json({
//         msg: "Name, email, password, address and phoneNumber are required.",
//       });
//     }

//     email = email.toLowerCase().trim();

//     const existingUser = await Users.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ msg: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const zipArray = zipcode
//       ? Array.isArray(zipcode)
//         ? zipcode.map(Number)
//         : [Number(zipcode)]
//       : [];

//     if (role !== "serviceProvider") {
//       serviceType = undefined;
//       billingTier = undefined;
//       isActive = true;
//     } else {
//       isActive = false;
//     }

//     const userData = {
//       name,
//       email,
//       password,
//       role,
//       address,
//       phoneNumber,
//       zipcode: zipArray,
//       location,
//       isActive,
//     };

//     if (role === "serviceProvider") {
//       Object.assign(userData, {
//         serviceType,
//         billingTier,
//         serviceZipcode: zipArray,
//         w9: "fill out",
//         businessLicense: "fill out",
//         proofOfInsurance: "fill out",
//         independentContractorAgreement: "fill out",
//       });
//     }

//     const newUser = await Users.create(userData);

//     const token = jwt.sign(
//       { id: newUser._id, role: newUser.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.json({ token });
//   } catch (err) {
//     console.error("Error in POST /register:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// router.post("/register", async (req, res) => {
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
//       location,
//       isActive,
//     } = req.body;

//     if (!name || !email || !password || !address || !phoneNumber) {
//       return res.status(400).json({
//         msg: "Name, email, password, address and phoneNumber are required.",
//       });
//     }

//     email = email.toLowerCase().trim();

//     const existingUser = await Users.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ msg: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const zipArray = zipcode
//       ? Array.isArray(zipcode)
//         ? zipcode.map(Number)
//         : [Number(zipcode)]
//       : [];

//     if (role !== "serviceProvider") {
//       serviceType = undefined;
//       billingTier = undefined;
//       isActive = true;
//     } else {
//       isActive = false;
//     }

//     const userData = {
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       address,
//       phoneNumber,
//       zipcode: zipArray,
//       location,
//       isActive,
//     };

//     if (role === "serviceProvider") {
//       Object.assign(userData, {
//         serviceType,
//         billingTier,
//         serviceZipcode: zipArray,
//         w9: "fill out",
//         businessLicense: "fill out",
//         proofOfInsurance: "fill out",
//         independentContractorAgreement: "fill out",
//       });

//       const stripe = await import("stripe").then((m) => m.default);
//       const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

//       const account = await stripeInstance.accounts.create({
//         type: "express",
//         capabilities: { transfers: { requested: true } },
//         business_type: "individual",
//         country: "US",
//         email,
//       });

//       userData.stripeAccountId = account.id;
//       const newUser = await Users.create(userData);

//       const token = jwt.sign(
//         { id: newUser._id, role: newUser.role },
//         process.env.JWT_SECRET,
//         { expiresIn: "7d" }
//       );

//       const accountLink = await stripeInstance.accountLinks.create({
//         account: account.id,
//         refresh_url: `${baseUrl}/stripe/onboarding-failed`,
//         return_url: `${baseUrl}/stripe/onboarding-success`,
//         type: "account_onboarding",
//       });

//       return res.json({ token, stripeOnboardingUrl: accountLink.url });
//     }

//     const newUser = await Users.create(userData);

//     const token = jwt.sign(
//       { id: newUser._id, role: newUser.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.json({ token });
//   } catch (err) {
//     console.error("Error in POST /register:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// refreshToken
// router.post("/register", async (req, res) => {
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
//       location,
//       isActive,
//     } = req.body;

//     if (!name || !email || !password || !address || !phoneNumber) {
//       return res.status(400).json({
//         msg: "Name, email, password, address and phoneNumber are required.",
//       });
//     }

//     email = email.toLowerCase().trim();

//     const existingUser = await Users.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ msg: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const zipArray = zipcode
//       ? Array.isArray(zipcode)
//         ? zipcode.map(Number)
//         : [Number(zipcode)]
//       : [];

//     if (role !== "serviceProvider") {
//       serviceType = undefined;
//       billingTier = undefined;
//       isActive = true;
//     } else {
//       isActive = false;
//     }

//     const userData = {
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       address,
//       phoneNumber,
//       zipcode: zipArray,
//       location,
//       isActive,
//     };

//     if (role === "serviceProvider") {
//       Object.assign(userData, {
//         serviceType,
//         billingTier,
//         serviceZipcode: zipArray,
//         w9: "fill out",
//         businessLicense: "fill out",
//         proofOfInsurance: "fill out",
//         independentContractorAgreement: "fill out",
//       });

//       const stripe = await import("stripe").then((m) => m.default);
//       const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

//       const account = await stripeInstance.accounts.create({
//         type: "express",
//         capabilities: { transfers: { requested: true } },
//         business_type: "individual",
//         country: "US",
//         email,
//       });

//       userData.stripeAccountId = account.id;
//       const newUser = await Users.create(userData);

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
//       await newUser.save();

//       const accountLink = await stripeInstance.accountLinks.create({
//         account: account.id,
//         refresh_url: `${baseUrl}/stripe/onboarding-failed`,
//         return_url: `${baseUrl}/stripe/onboarding-success`,
//         type: "account_onboarding",
//       });

//       return res.json({ token, refreshToken, stripeOnboardingUrl: accountLink.url });
//     }

//     const newUser = await Users.create(userData);

//     const token = jwt.sign(
//       { id: newUser._id, role: newUser.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "15m" }
//     );

//     const refreshToken = jwt.sign(
//       { id: newUser._id },
//       process.env.REFRESH_SECRET,
//       { expiresIn: "30d" }
//     );

//     newUser.refreshToken = refreshToken;
//     await newUser.save();

//     return res.json({ token, refreshToken });
//   } catch (err) {
//     console.error("Error in POST /register:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

//working
// router.post("/register", async (req, res) => {
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
//       location,
//       isActive,
//     } = req.body;

//     if (!name || !email || !password || !address || !phoneNumber) {
//       return res.status(400).json({
//         msg: "Name, email, password, address and phoneNumber are required.",
//       });
//     }

//     email = email.toLowerCase().trim();

//     const existingUser = await Users.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ msg: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const zipArray = Array.isArray(zipcode) ? zipcode.map(Number) : [Number(zipcode)];

//     const userData = {
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       address,
//       phoneNumber,
//       zipcode: zipArray,
//       location,
//       isActive: role === "serviceProvider" ? false : true,
//     };

//     if (role === "serviceProvider") {
//       Object.assign(userData, {
//         serviceType,
//         billingTier,
//         serviceZipcode: zipArray,
//         w9: "fill out",
//         businessLicense: "fill out",
//         proofOfInsurance: "fill out",
//         independentContractorAgreement: "fill out",
//       });

//       const stripe = await import("stripe").then((m) => m.default);
//       const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

//       const account = await stripeInstance.accounts.create({
//         type: "express",
//         country: "US",
//         email,
//         capabilities: { transfers: { requested: true } },
//         business_type: "individual",
//       });

//       userData.stripeAccountId = account.id;
//     }

//     const newUser = await Users.create(userData);

//     const token = jwt.sign(
//       { id: newUser._id, role: newUser.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "15m" }
//     );

//     const refreshToken = jwt.sign(
//       { id: newUser._id },
//       process.env.REFRESH_SECRET,
//       { expiresIn: "30d" }
//     );

//     newUser.refreshToken = refreshToken;
//     await newUser.save();

//     if (role === "serviceProvider") {
//       const stripe = await import("stripe").then((m) => m.default);
//       const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

//       const accountLink = await stripeInstance.accountLinks.create({
//         account: newUser.stripeAccountId,
//         refresh_url: `${baseUrl}/stripe/onboarding-failed`,
//         return_url: `${baseUrl}/stripe/onboarding-success`,
//         type: "account_onboarding",
//       });

//       return res.json({
//         token,
//         refreshToken,
//         stripeOnboardingUrl: accountLink.url,
//       });
//     }

//     return res.json({ token, refreshToken });
//   } catch (err) {
//     console.error("Error in POST /register:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

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

    const zipArray = Array.isArray(zipcode) ? zipcode.map(Number) : [Number(zipcode)];

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

      const accountLink = await stripeInstance.accountLinks.create({
        account: newUser.stripeAccountId,
        refresh_url: `${baseUrl}/stripe/onboarding-failed`,
        return_url: `${baseUrl}/stripe/onboarding-success`,
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



//working
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Ensure password is selected from DB
//     const user = await Users.findOne({ email }).select("+password");
//     if (!user || !user.password) {
//       return res.status(401).json({ msg: "Invalid credentials" });
//     }

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) {
//       return res.status(401).json({ msg: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     const refreshToken = jwt.sign(
//       { id: user._id },
//       process.env.REFRESH_SECRET,
//       { expiresIn: "7d" }
//     );

//     user.refreshToken = refreshToken;
//     await user.save();

//     res.json({ token, refreshToken });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Look up user with password
    const user = await Users.findOne({ email }).select("+password");
    if (!user || !user.password) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

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

//old
// router.post("/refresh-token", async (req, res) => {
//   try {
//     const { refreshToken } = req.body;
//     if (!refreshToken)
//       return res.status(400).json({ msg: "Missing refresh token" });

//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
//     const user = await Users.findById(decoded.id);
//     if (!user || user.refreshToken !== refreshToken) {
//       return res.status(401).json({ msg: "Invalid or expired refresh token" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "15m",
//       }
//     );

//     return res.json({ token });
//   } catch (err) {
//     console.error("Refresh error:", err.message);
//     return res.status(401).json({ msg: "Token refresh failed" });
//   }
// });



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


// router.post("/refresh-token", async (req, res) => {
//   try {
//     const { refreshToken } = req.body;
//     if (!refreshToken)
//       return res.status(400).json({ msg: "Missing refresh token" });

//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
//     const user = await Users.findById(decoded.id);
//     if (!user || user.refreshToken !== refreshToken) {
//       return res.status(401).json({ msg: "Invalid or expired refresh token" });
//     }

//     // Issue new access & refresh tokens
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

//     user.refreshToken = newRefreshToken;
//     await user.save();

//     return res.json({ token, refreshToken: newRefreshToken });
//   } catch (err) {
//     console.error("Refresh error:", err.message);
//     return res.status(401).json({ msg: "Token refresh failed" });
//   }
// });



// router.post("/refresh-token", async (req, res) => {
//   try {
//     const { refreshToken } = req.body;
//     if (!refreshToken) {
//       return res.status(400).json({ msg: "Missing refresh token" });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
//     } catch (err) {
//       console.error("Invalid or expired refresh token:", err.message);
//       return res.status(401).json({ msg: "Invalid or expired refresh token" });
//     }

//     const user = await Users.findById(decoded.id);
//     if (!user || user.refreshToken !== refreshToken) {
//       return res.status(401).json({ msg: "Refresh token mismatch or user not found" });
//     }

//     // Generate new access token
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "15m" }
//     );

//     // Rotate refresh token for added security
//     const newRefreshToken = jwt.sign(
//       { id: user._id },
//       process.env.REFRESH_SECRET,
//       { expiresIn: "30d" }
//     );

//     user.refreshToken = newRefreshToken;
//     await user.save();

//     return res.json({ token, refreshToken: newRefreshToken });
//   } catch (err) {
//     console.error("Refresh error:", err.message);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });



export default router;
