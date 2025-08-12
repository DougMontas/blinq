// // backend/routes/users.js
// import express from "express";
// import mongoose from "mongoose";
// import crypto from "crypto";
// import NodeGeocoder from "node-geocoder";
// import multer from "multer";

// import { auth } from "../middlewares/auth.js";
// import Users from "../models/Users.js";
// import Job from "../models/Job.js";

// const router = express.Router();

// // Geocoder + multer setup
// const geocoder = NodeGeocoder({ provider: "openstreetmap" });
// const storage = multer.memoryStorage();
// // const upload = multer({ storage });
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB max file
//   },
// });

// // Encryption helper
// const algorithm = "aes-256-cbc";
// const encryptionKey = process.env.ENCRYPTION_KEY;
// const encryptionIV = process.env.ENCRYPTION_IV;

// function encrypt(text) {
//   if (!encryptionKey || !encryptionIV) return text;
//   const key = Buffer.from(encryptionKey, "hex");
//   const iv = Buffer.from(encryptionIV, "hex");
//   const cipher = crypto.createCipheriv(algorithm, key, iv);
//   let encrypted = cipher.update(text, "utf8", "hex");
//   return encrypted + cipher.final("hex");
// }

// function slimUser(user) {
//   if (!user || typeof user !== "object") {
//     console.warn("⚠️ slimUser received invalid input:", user);
//     return {};
//   }

//   const {
//     password,
//     w9,
//     businessLicense,
//     proofOfInsurance,
//     independentContractorAgreement,
//     ...rest
//   } = user;

//   return rest;
// }

// router.get("/me", auth, async (req, res) => {
//   try {
//     console.time("🔍 MongoDB user fetch");

//     const fields = [
//       "name",
//       "role",
//       "trade",
//       "serviceType",
//       "portfolio",
//       "serviceZipcode",
//       "billingTier",
//       "zipcode",
//       "address",
//       "aboutMe",
//       "yearsExperience",
//       "serviceCost",
//       "businessName",
//       "profilePicture",
//       "w9",
//       "businessLicense",
//       "proofOfInsurance",
//       "independentContractorAgreement",
//       "isActive",
//     ].join(" ");

//     const user = await Users.findById(req.user.id, fields).lean();
//     console.timeEnd("🔍 MongoDB user fetch");

//     if (!user) return res.status(404).json({ msg: "User not found" });

//     // console.log("📦 slimUser output keys:", Object.keys(user));
//     res.json(user);
//   } catch (err) {
//     console.error("GET /me error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // ✅ Add this BEFORE the '/:id' route
// router.get("/active-providers", async (req, res) => {
//   try {
//     const activeProviders = await Users.find({
//       role: "serviceProvider",
//       isOnline: true, // or whatever field you use
//       location: { $exists: true }, // ensure location data exists
//     }).select("name serviceType location");

//     res.json(
//       activeProviders.map((pro) => ({
//         id: pro._id,
//         name: pro.name,
//         category: pro.serviceType,
//         coords: {
//           latitude: pro.location?.coordinates?.[1],
//           longitude: pro.location?.coordinates?.[0],
//         },
//       }))
//     );
//   } catch (err) {
//     console.error("Failed to fetch active providers:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // backend/routes/users.js
// router.get("/billing-info", auth, async (req, res) => {
//   try {
//     const user = await Users.findById(req.user.id)
//       .select("billingTier isActive")
//       .lean();
//     if (!user) return res.status(404).json({ msg: "User not found" });
//     res.json(user);
//   } catch (err) {
//     console.error("Billing info fetch failed:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// router.get("/:id([0-9a-fA-F]{24})", auth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = id === "me" ? req.user.id : id;

//     const user = await Users.findById(userId).select(
//       "name email role aboutMe businessName profilePicture averageRating"
//     );

//     if (!user) return res.status(404).json({ msg: "User not found" });

//     res.json(user);
//   } catch (err) {
//     console.error("GET /users/:id error", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// //fetching the users documents
// router.get("/me/documents", auth, async (req, res) => {
//   try {
//     const user = await Users.findById(
//       req.user.id,
//       "w9 businessLicense proofOfInsurance independentContractorAgreement"
//     ).lean();

//     if (!user) return res.status(404).json({ msg: "User not found" });

//     res.json({
//       w9: user.w9 || null,
//       businessLicense: user.businessLicense || null,
//       proofOfInsurance: user.proofOfInsurance || null,
//       independentContractorAgreement:
//         user.independentContractorAgreement || null,
//     });
//   } catch (err) {
//     console.error("GET /me/documents error:", err);
//     res.status(500).json({ msg: "Server error fetching documents" });
//   }
// });

// router.get("/me/stats", auth, async (req, res) => {
//   if (req.user.role !== "serviceProvider")
//     return res.status(403).json({ msg: "Only service providers have stats" });

//   const year = parseInt(req.query.year) || new Date().getFullYear();
//   const providerId = new mongoose.Types.ObjectId(req.user.id);

//   try {
//     const stats = await Job.aggregate([
//       {
//         $match: {
//           acceptedProvider: providerId,
//           status: "completed",
//           $expr: { $eq: [{ $year: "$createdAt" }, year] },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           completedJobsCount: { $sum: 1 },
//           totalAmountPaid: { $sum: "$totalAmountPaid" },
//         },
//       },
//     ]);

//     if (!stats.length) {
//       return res.json({ completedJobsCount: 0, totalAmountPaid: 0 });
//     }
//     const { completedJobsCount, totalAmountPaid } = stats[0];
//     res.json({ completedJobsCount, totalAmountPaid });
//   } catch (err) {
//     console.error("Error fetching provider stats:", err);
//     res.status(500).json({ msg: "Server error fetching stats" });
//   }
// });

// /**
//  * GET /api/users/providers/active
//  * Returns all active service providers (minimal fields)
//  */
// router.get("/providers/active", async (req, res) => {
//   try {
//     const providers = await Users.find(
//       { role: "serviceProvider", isActive: true },
//       "name serviceType location.coordinates"
//     ).lean();

//     const data = providers.map((p) => {
//       const [lng, lat] = p.location?.coordinates || [];
//       return {
//         id: p._id,
//         name: p.name,
//         serviceType: p.serviceType,
//         position: lat != null && lng != null ? [lat, lng] : null,
//       };
//     });

//     res.json(data);
//   } catch (err) {
//     console.error("GET /providers/active error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// router.put("/profile",
//   auth,
//   upload.fields([
//     { name: "w9", maxCount: 1 },
//     { name: "businessLicense", maxCount: 1 },
//     { name: "proofOfInsurance", maxCount: 1 },
//     { name: "independentContractorAgreement", maxCount: 1 },
//     { name: "profilePicture", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       const user = await Users.findById(req.user.id);
//       if (!user) return res.status(404).json({ msg: "User not found" });

//       // ✅ Update text fields
//       for (const [key, value] of Object.entries(req.body)) {
//         if (value !== undefined && value !== "") {
//           // ✅ Special handling for acceptedICA boolean
//           if (key === "acceptedICA") {
//             user.acceptedICA = value === "true";
//           } else {
//             user[key] = value;
//           }
//         }
//       }

//       // ✅ Save file uploads
//       const files = req.files;

//       if (files?.profilePicture?.[0]) {
//         const { buffer, mimetype } = files.profilePicture[0];
//         user.profilePicture = `data:${mimetype};base64,${buffer.toString(
//           "base64"
//         )}`;
//       }

//       if (files?.w9?.[0]) {
//         user.w9 = files.w9[0].buffer.toString("base64");
//       }

//       if (files?.businessLicense?.[0]) {
//         user.businessLicense =
//           files.businessLicense[0].buffer.toString("base64");
//       }

//       if (files?.proofOfInsurance?.[0]) {
//         user.proofOfInsurance =
//           files.proofOfInsurance[0].buffer.toString("base64");
//       }

//       if (files?.independentContractorAgreement?.[0]) {
//         user.independentContractorAgreement =
//           files.independentContractorAgreement[0].buffer.toString("base64");
//       }

//       // await user.save();
//       await user.save({ validateBeforeSave: false });

//       res.json({ msg: "Profile updated", user });
//     } catch (err) {
//       console.error("PUT /profile error:", err);
//       if (err instanceof multer.MulterError) {
//         return res.status(400).json({ msg: `MulterError: ${err.message}` });
//       }
//       res.status(500).json({ msg: "Server error updating profile" });
//     }
//   }
// );

// /**
//  * PUT /api/users/location
//  * Updates only the user’s geolocation
//  */
// router.put("/location", auth, async (req, res) => {
//   try {
//     const loc = req.body.location;
//     if (!Array.isArray(loc) || loc.length !== 2)
//       return res.status(400).json({ msg: "Location must be [lat, lng]" });

//     const user = await Users.findById(req.user.id);
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     user.location = {
//       type: "Point",
//       coordinates: [Number(loc[1]), Number(loc[0])],
//     };
//     // await user.save();
//     await user.save({ validateBeforeSave: false }); // ✅ prevents validation on incomplete fields

//     res.json({ msg: "Location updated", location: user.location });
//   } catch (err) {
//     console.error("PUT /location error:", err);
//     res.status(500).json({ msg: "Server error updating location" });
//   }
// });

// router.post("/push-token", auth, async (req, res) => {
//   try {
//     const { token } = req.body;
//     if (!token || typeof token !== "string") {
//       return res.status(400).json({ msg: "Invalid or missing push token." });
//     }

//     const user = await Users.findById(req.user.id);
//     if (!user) return res.status(404).json({ msg: "User not found." });

//     user.expoPushToken = token;
//     await user.save();

//     res.status(200).json({ msg: "Push token saved." });
//   } catch (err) {
//     console.error("❌ Error saving push token:", err);
//     res.status(500).json({ msg: "Failed to save push token." });
//   }
// });

// router.post("/save-session", auth, async (req, res) => {
//   try {
//     const { jobId } = req.body;
//     if (!jobId) return res.status(400).json({ msg: "Missing jobId." });

//     const user = await Users.findById(req.user.id);
//     if (!user) return res.status(404).json({ msg: "User not found." });

//     user.lastActiveJobId = jobId;
//     await user.save();

//     res.status(200).json({ msg: "Session saved." });
//   } catch (err) {
//     console.error("Error saving session:", err);
//     res.status(500).json({ msg: "Server error saving session." });
//   }
// });

// router.delete("/delete", auth, async (req, res) => {
//   try {
//     const userId = req.user._id || req.user.id;
//     const { reason } = req.body;
//     const updatedUser = await Users.findByIdAndUpdate(
//       userId,
//       {
//         isDeleted: true,
//         isActive: false,
//         deleteReason: reason || "",
//         deletedAt: new Date(),
//       },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ msg: "User not found" });
//     }

//     res.json({ msg: "Account successfully marked as deleted" });
//   } catch (err) {
//     console.error("❌ Delete user error", err);
//     res.status(500).json({ msg: "Server error" });
//   }

 
// });

// router.patch("/users/profile", auth, async (req, res) => {
//   const updates = {};
//   const bool = (v) => v === true || v === "true" || v === 1 || v === "1";

//   if (typeof req.body.optInSms !== "undefined") updates.optInSms = bool(req.body.optInSms);
//   if (typeof req.body.acceptedICA !== "undefined") updates.acceptedICA = bool(req.body.acceptedICA);
//   if (typeof req.body.independentContractorAgreement !== "undefined") {
//     updates.independentContractorAgreement = String(req.body.independentContractorAgreement || "");
//   }
//   if (req.body.email) updates.email = String(req.body.email).toLowerCase();
//   if (req.body.phoneNumber) updates.phoneNumber = String(req.body.phoneNumber);


//   const user = await Users.findByIdAndUpdate(req.user.id, updates, { new: true });
//   return res.json(user);
// });

// export default router;

// // backend/routes/users.js
// import express from "express";
// import mongoose from "mongoose";
// import crypto from "crypto";
// import NodeGeocoder from "node-geocoder";
// import multer from "multer";

// import { auth } from "../middlewares/auth.js";
// import Users from "../models/Users.js";
// import Job from "../models/Job.js";

// const router = express.Router();

// // Geocoder + multer setup
// const geocoder = NodeGeocoder({ provider: "openstreetmap" });
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// });

// // --- helpers ---
// const algorithm = "aes-256-cbc";
// const encryptionKey = process.env.ENCRYPTION_KEY;
// const encryptionIV = process.env.ENCRYPTION_IV;

// function encrypt(text) {
//   if (!encryptionKey || !encryptionIV) return text;
//   const key = Buffer.from(encryptionKey, "hex");
//   const iv = Buffer.from(encryptionIV, "hex");
//   const cipher = crypto.createCipheriv(algorithm, key, iv);
//   let encrypted = cipher.update(text, "utf8", "hex");
//   return encrypted + cipher.final("hex");
// }

// const toBool = (v) =>
//   v === true ||
//   v === "true" ||
//   v === 1 ||
//   v === "1" ||
//   v === "on" ||
//   v === "yes" ||
//   v === "y";

// // NOTE: not used by /me; kept for reference
// // function slimUser(user) {
// //   if (!user || typeof user !== "object") {
// //     console.warn("⚠️ slimUser received invalid input:", user);
// //     return {};
// //   }
// //   const {
// //     password,
// //     w9,
// //     businessLicense,
// //     proofOfInsurance,
// //     independentContractorAgreement,
// //     ...rest
// //   } = user;
// //   return rest;
// // }

// // put this helper near the top
// function toSlimUser(u) {
//   if (!u) return {};
//   return {
//     _id: u._id,
//     name: u.name,
//     role: u.role,
//     trade: u.trade,
//     serviceType: u.serviceType,
//     portfolio: u.portfolio || [],
//     serviceZipcode: u.serviceZipcode || [],
//     billingTier: u.billingTier,
//     zipcode: u.zipcode || [],
//     address: u.address || "",
//     aboutMe: u.aboutMe || "",
//     yearsExperience: u.yearsExperience ?? null,
//     businessName: u.businessName || "",
//     isActive: !!u.isActive,

//     // ✅ the fields you were missing on the client:
//     email: u.email || "",
//     phoneNumber: u.phoneNumber || "",
//     optInSms: !!u.optInSms,
//     acceptedICA: !!u.acceptedICA,
//     // “viewed” isn’t stored; infer it if a doc exists or it’s accepted
//     icaViewed: !!u.acceptedICA || !!u.independentContractorAgreement,

//     // stripe id if you need it client-side
//     stripeAccountId: u.stripeAccountId || "",

//     // DO NOT send blobs here
//     hasDocs: {
//       w9: !!u.w9,
//       businessLicense: !!u.businessLicense,
//       proofOfInsurance: !!u.proofOfInsurance,
//       independentContractorAgreement: !!u.independentContractorAgreement,
//     },
//     hasProfilePicture: !!u.profilePicture, // boolean only
//   };
// }

// /**
//  * GET /api/users/me
//  * Return all fields the app needs for readiness checks & hydration.
//  */
// router.get("/me", auth, async (req, res) => {
//   try {
//     const user = await Users.findById(req.user.id)
//       .select([
//         "name",
//         "role",
//         "trade",
//         "serviceType",
//         "portfolio",
//         "serviceZipcode",
//         "billingTier",
//         "zipcode",
//         "address",
//         "aboutMe",
//         "yearsExperience",
//         "businessName",
//         "isActive",
//         // ✅ include the fields your app couldn’t see
//         "email",
//         "phoneNumber",
//         "optInSms",
//         "acceptedICA",
//         "stripeAccountId",
//         // we’ll compute booleans from these but won’t send the raw values back
//         "w9",
//         "businessLicense",
//         "proofOfInsurance",
//         "independentContractorAgreement",
//         "profilePicture",
//       ].join(" "))
//       .lean();

//     if (!user) return res.status(404).json({ msg: "User not found" });

//     res.json(toSlimUser(user)); // ✅ slim
//   } catch (err) {
//     console.error("GET /me error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // router.get("/me", auth, async (req, res) => {
// //   try {
// //     console.time("🔍 MongoDB user fetch");

// //     const fields = [
// //       // identity & contact
// //       "name",
// //       "email",
// //       "phoneNumber",
// //       "role",

// //       // business/profile
// //       "businessName",
// //       "address",
// //       "zipcode",
// //       "serviceZipcode",
// //       "aboutMe",
// //       "yearsExperience",
// //       "serviceType",
// //       "serviceCost",
// //       "profilePicture",

// //       // docs & flags
// //       "w9",
// //       "businessLicense",
// //       "proofOfInsurance",
// //       "independentContractorAgreement",
// //       "acceptedICA",
// //       "optInSms",
// //       "isActive",

// //       // billing
// //       "billingTier",
// //       "stripeAccountId",

// //       // (in case you later store it)
// //       "icaViewed",
// //     ].join(" ");

// //     // Use .select(fields) to avoid accidental projection issues
// //     const user = await Users.findById(req.user.id).select(fields).lean();
// //     console.timeEnd("🔍 MongoDB user fetch");

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     // Return the plain object (client handles both {user} and raw)
// //     return res.json(user);
// //   } catch (err) {
// //     console.error("GET /me error:", err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// /**
//  * GET /api/users/active-providers
//  */
// router.get("/active-providers", async (req, res) => {
//   try {
//     const activeProviders = await Users.find({
//       role: "serviceProvider",
//       isOnline: true, // adjust if needed
//       location: { $exists: true },
//     }).select("name serviceType location");

//     res.json(
//       activeProviders.map((pro) => ({
//         id: pro._id,
//         name: pro.name,
//         category: pro.serviceType,
//         coords: {
//           latitude: pro.location?.coordinates?.[1],
//           longitude: pro.location?.coordinates?.[0],
//         },
//       }))
//     );
//   } catch (err) {
//     console.error("Failed to fetch active providers:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// /**
//  * GET /api/users/billing-info
//  */
// router.get("/billing-info", auth, async (req, res) => {
//   try {
//     const user = await Users.findById(req.user.id)
//       .select("billingTier isActive")
//       .lean();
//     if (!user) return res.status(404).json({ msg: "User not found" });
//     res.json(user);
//   } catch (err) {
//     console.error("Billing info fetch failed:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// /**
//  * GET /api/users/:id
//  */
// router.get("/:id([0-9a-fA-F]{24})", auth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = id === "me" ? req.user.id : id;

//     const user = await Users.findById(userId).select(
//       "name email role aboutMe businessName profilePicture averageRating"
//     );

//     if (!user) return res.status(404).json({ msg: "User not found" });

//     res.json(user);
//   } catch (err) {
//     console.error("GET /users/:id error", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// /**
//  * GET /api/users/me/documents
//  */
// router.get("/me/documents", auth, async (req, res) => {
//   try {
//     const user = await Users.findById(
//       req.user.id,
//       "w9 businessLicense proofOfInsurance independentContractorAgreement"
//     ).lean();

//     if (!user) return res.status(404).json({ msg: "User not found" });

//     res.json({
//       w9: user.w9 || null,
//       businessLicense: user.businessLicense || null,
//       proofOfInsurance: user.proofOfInsurance || null,
//       independentContractorAgreement:
//         user.independentContractorAgreement || null,
//     });
//   } catch (err) {
//     console.error("GET /me/documents error:", err);
//     res.status(500).json({ msg: "Server error fetching documents" });
//   }
// });

// /**
//  * GET /api/users/me/stats
//  */
// router.get("/me/stats", auth, async (req, res) => {
//   if (req.user.role !== "serviceProvider")
//     return res.status(403).json({ msg: "Only service providers have stats" });

//   const year = parseInt(req.query.year) || new Date().getFullYear();
//   const providerId = new mongoose.Types.ObjectId(req.user.id);

//   try {
//     const stats = await Job.aggregate([
//       {
//         $match: {
//           acceptedProvider: providerId,
//           status: "completed",
//           $expr: { $eq: [{ $year: "$createdAt" }, year] },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           completedJobsCount: { $sum: 1 },
//           totalAmountPaid: { $sum: "$totalAmountPaid" },
//         },
//       },
//     ]);

//     if (!stats.length) {
//       return res.json({ completedJobsCount: 0, totalAmountPaid: 0 });
//     }
//     const { completedJobsCount, totalAmountPaid } = stats[0];
//     res.json({ completedJobsCount, totalAmountPaid });
//   } catch (err) {
//     console.error("Error fetching provider stats:", err);
//     res.status(500).json({ msg: "Server error fetching stats" });
//   }
// });

// /**
//  * GET /api/users/providers/active
//  */
// router.get("/providers/active", async (req, res) => {
//   try {
//     const providers = await Users.find(
//       { role: "serviceProvider", isActive: true },
//       "name serviceType location.coordinates"
//     ).lean();

//     const data = providers.map((p) => {
//       const [lng, lat] = p.location?.coordinates || [];
//       return {
//         id: p._id,
//         name: p.name,
//         serviceType: p.serviceType,
//         position: lat != null && lng != null ? [lat, lng] : null,
//       };
//     });

//     res.json(data);
//   } catch (err) {
//     console.error("GET /providers/active error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// /**
//  * PUT /api/users/profile
//  * Multipart profile update (files + fields). Coerces booleans explicitly.
//  */
// router.put(
//   "/profile",
//   auth,
//   upload.fields([
//     { name: "w9", maxCount: 1 },
//     { name: "businessLicense", maxCount: 1 },
//     { name: "proofOfInsurance", maxCount: 1 },
//     { name: "independentContractorAgreement", maxCount: 1 },
//     { name: "profilePicture", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       const user = await Users.findById(req.user.id);
//       if (!user) return res.status(404).json({ msg: "User not found" });

//       // text fields (coerce booleans)
//       for (const [key, value] of Object.entries(req.body)) {
//         if (value === undefined || value === "") continue;

//         if (key === "acceptedICA") {
//           user.acceptedICA = toBool(value);
//         } else if (key === "optInSms" || key === "optInSMS" || key === "acceptSMS") {
//           user.optInSms = toBool(value);
//         } else if (key === "email") {
//           user.email = String(value).toLowerCase();
//         } else if (key === "phoneNumber") {
//           user.phoneNumber = String(value);
//         } else {
//           user[key] = value;
//         }
//       }

//       // files
//       const files = req.files;
//       if (files?.profilePicture?.[0]) {
//         const { buffer, mimetype } = files.profilePicture[0];
//         user.profilePicture = `data:${mimetype};base64,${buffer.toString("base64")}`;
//       }
//       if (files?.w9?.[0]) {
//         user.w9 = files.w9[0].buffer.toString("base64");
//       }
//       if (files?.businessLicense?.[0]) {
//         user.businessLicense = files.businessLicense[0].buffer.toString("base64");
//       }
//       if (files?.proofOfInsurance?.[0]) {
//         user.proofOfInsurance = files.proofOfInsurance[0].buffer.toString("base64");
//       }
//       if (files?.independentContractorAgreement?.[0]) {
//         user.independentContractorAgreement =
//           files.independentContractorAgreement[0].buffer.toString("base64");
//       }

//       await user.save({ validateBeforeSave: false });
//       return res.json({ msg: "Profile updated", user });
//     } catch (err) {
//       console.error("PUT /profile error:", err);
//       if (err instanceof multer.MulterError) {
//         return res.status(400).json({ msg: `MulterError: ${err.message}` });
//       }
//       return res.status(500).json({ msg: "Server error updating profile" });
//     }
//   }
// );

// /**
//  * PATCH /api/users/profile  (JSON-only updates; boolean-safe)
//  * Also keeps legacy alias /api/users/users/profile for backward compatibility.
//  */
// async function patchProfileHandler(req, res) {
//   try {
//     const updates = {};
//     const b = req.body;

//     if (typeof b.optInSms !== "undefined" || typeof b.optInSMS !== "undefined" || typeof b.acceptSMS !== "undefined") {
//       updates.optInSms = toBool(b.optInSms ?? b.optInSMS ?? b.acceptSMS);
//     }
//     if (typeof b.acceptedICA !== "undefined") {
//       updates.acceptedICA = toBool(b.acceptedICA);
//     }
//     if (typeof b.independentContractorAgreement !== "undefined") {
//       updates.independentContractorAgreement = String(b.independentContractorAgreement || "");
//     }
//     if (b.email) updates.email = String(b.email).toLowerCase();
//     if (b.phoneNumber) updates.phoneNumber = String(b.phoneNumber);

//     const user = await Users.findByIdAndUpdate(req.user.id, updates, { new: true });
//     return res.json({ user });
//   } catch (err) {
//     console.error("PATCH /profile error:", err);
//     return res.status(500).json({ msg: "Server error updating profile" });
//   }
// }

// router.patch("/profile", auth, patchProfileHandler);
// // legacy alias in case the app was calling /users/profile
// router.patch("/users/profile", auth, patchProfileHandler);

// /**
//  * PUT /api/users/location
//  */
// router.put("/location", auth, async (req, res) => {
//   try {
//     const loc = req.body.location;
//     if (!Array.isArray(loc) || loc.length !== 2)
//       return res.status(400).json({ msg: "Location must be [lat, lng]" });

//     const user = await Users.findById(req.user.id);
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     user.location = {
//       type: "Point",
//       coordinates: [Number(loc[1]), Number(loc[0])],
//     };
//     await user.save({ validateBeforeSave: false });

//     res.json({ msg: "Location updated", location: user.location });
//   } catch (err) {
//     console.error("PUT /location error:", err);
//     res.status(500).json({ msg: "Server error updating location" });
//   }
// });

// /**
//  * POST /api/users/push-token
//  */
// router.post("/push-token", auth, async (req, res) => {
//   try {
//     const { token } = req.body;
//     if (!token || typeof token !== "string") {
//       return res.status(400).json({ msg: "Invalid or missing push token." });
//     }

//     const user = await Users.findById(req.user.id);
//     if (!user) return res.status(404).json({ msg: "User not found." });

//     user.expoPushToken = token;
//     await user.save();

//     res.status(200).json({ msg: "Push token saved." });
//   } catch (err) {
//     console.error("❌ Error saving push token:", err);
//     res.status(500).json({ msg: "Failed to save push token." });
//   }
// });

// /**
//  * POST /api/users/save-session
//  */
// router.post("/save-session", auth, async (req, res) => {
//   try {
//     const { jobId } = req.body;
//     if (!jobId) return res.status(400).json({ msg: "Missing jobId." });

//     const user = await Users.findById(req.user.id);
//     if (!user) return res.status(404).json({ msg: "User not found." });

//     user.lastActiveJobId = jobId;
//     await user.save();

//     res.status(200).json({ msg: "Session saved." });
//   } catch (err) {
//     console.error("Error saving session:", err);
//     res.status(500).json({ msg: "Server error saving session." });
//   }
// });

// /**
//  * DELETE /api/users/delete
//  */
// router.delete("/delete", auth, async (req, res) => {
//   try {
//     const userId = req.user._id || req.user.id;
//     const { reason } = req.body;
//     const updatedUser = await Users.findByIdAndUpdate(
//       userId,
//       {
//         isDeleted: true,
//         isActive: false,
//         deleteReason: reason || "",
//         deletedAt: new Date(),
//       },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ msg: "User not found" });
//     }

//     res.json({ msg: "Account successfully marked as deleted" });
//   } catch (err) {
//     console.error("❌ Delete user error", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// export default router;

// backend/routes/users.js
import express from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import NodeGeocoder from "node-geocoder";
import multer from "multer";

import { auth } from "../middlewares/auth.js";
import Users from "../models/Users.js";
import Job from "../models/Job.js";

const router = express.Router();

// Geocoder + multer setup
const geocoder = NodeGeocoder({ provider: "openstreetmap" });
const storage = multer.memoryStorage();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// --- helpers ---
const algorithm = "aes-256-cbc";
const encryptionKey = process.env.ENCRYPTION_KEY;
const encryptionIV = process.env.ENCRYPTION_IV;

function encrypt(text) {
  if (!encryptionKey || !encryptionIV) return text;
  const key = Buffer.from(encryptionKey, "hex");
  const iv = Buffer.from(encryptionIV, "hex");
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  return encrypted + cipher.final("hex");
}

const toBool = (v) =>
  v === true ||
  v === "true" ||
  v === 1 ||
  v === "1" ||
  v === "on" ||
  v === "yes" ||
  v === "y";

const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// NOTE: not used by /me; kept for reference
// function slimUser(user) {
//   if (!user || typeof user !== "object") {
//     console.warn("⚠️ slimUser received invalid input:", user);
//     return {};
//   }
//   const {
//     password,
//     w9,
//     businessLicense,
//     proofOfInsurance,
//     independentContractorAgreement,
//     ...rest
//   } = user;
//   return rest;
// }

// put this helper near the top
function toSlimUser(u) {
  if (!u) return {};
  return {
    _id: u._id,
    name: u.name,
    role: u.role,
    trade: u.trade,
    serviceType: u.serviceType,
    portfolio: u.portfolio || [],
    serviceZipcode: u.serviceZipcode || [],
    billingTier: u.billingTier,
    zipcode: u.zipcode || [],
    address: u.address || "",
    aboutMe: u.aboutMe || "",
    yearsExperience: u.yearsExperience ?? null,
    businessName: u.businessName || "",
    isActive: !!u.isActive,

    // ✅ the fields you were missing on the client:
    email: u.email || "",
    phoneNumber: u.phoneNumber || "",
    optInSms: !!u.optInSms,
    acceptedICA: !!u.acceptedICA,
    // “viewed” isn’t stored; infer it if a doc exists or it’s accepted
    icaViewed: !!u.acceptedICA || !!u.independentContractorAgreement,

    // stripe id if you need it client-side
    stripeAccountId: u.stripeAccountId || "",

    // DO NOT send blobs here
    hasDocs: {
      w9: !!u.w9,
      businessLicense: !!u.businessLicense,
      proofOfInsurance: !!u.proofOfInsurance,
      independentContractorAgreement: !!u.independentContractorAgreement,
    },
    hasProfilePicture: !!u.profilePicture, // boolean only
  };
}

/**
 * GET /api/users/me
 * Return all fields the app needs for readiness checks & hydration.
 */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id)
      .select([
        "name",
        "role",
        "trade",
        "serviceType",
        "portfolio",
        "serviceZipcode",
        "billingTier",
        "zipcode",
        "address",
        "aboutMe",
        "yearsExperience",
        "businessName",
        "isActive",
        // ✅ include the fields your app couldn’t see
        "email",
        "phoneNumber",
        "optInSms",
        "acceptedICA",
        "stripeAccountId",
        // we’ll compute booleans from these but won’t send the raw values back
        "w9",
        "businessLicense",
        "proofOfInsurance",
        "independentContractorAgreement",
        "profilePicture",
      ].join(" "))
      .lean();

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(toSlimUser(user)); // ✅ slim
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// router.get("/me", auth, async (req, res) => {
//   try {
//     console.time("🔍 MongoDB user fetch");

//     const fields = [
//       // identity & contact
//       "name",
//       "email",
//       "phoneNumber",
//       "role",

//       // business/profile
//       "businessName",
//       "address",
//       "zipcode",
//       "serviceZipcode",
//       "aboutMe",
//       "yearsExperience",
//       "serviceType",
//       "serviceCost",
//       "profilePicture",

//       // docs & flags
//       "w9",
//       "businessLicense",
//       "proofOfInsurance",
//       "independentContractorAgreement",
//       "acceptedICA",
//       "optInSms",
//       "isActive",

//       // billing
//       "billingTier",
//       "stripeAccountId",

//       // (in case you later store it)
//       "icaViewed",
//     ].join(" ");

//     // Use .select(fields) to avoid accidental projection issues
//     const user = await Users.findById(req.user.id).select(fields).lean();
//     console.timeEnd("🔍 MongoDB user fetch");

//     if (!user) return res.status(404).json({ msg: "User not found" });

//     // Return the plain object (client handles both {user} and raw)
//     return res.json(user);
//   } catch (err) {
//     console.error("GET /me error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

/**
 * GET /api/users/active-providers
 */
router.get("/active-providers", async (req, res) => {
  try {
    const activeProviders = await Users.find({
      role: "serviceProvider",
      isOnline: true, // adjust if needed
      location: { $exists: true },
    }).select("name serviceType location");

    res.json(
      activeProviders.map((pro) => ({
        id: pro._id,
        name: pro.name,
        category: pro.serviceType,
        coords: {
          latitude: pro.location?.coordinates?.[1],
          longitude: pro.location?.coordinates?.[0],
        },
      }))
    );
  } catch (err) {
    console.error("Failed to fetch active providers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/users/billing-info
 */
router.get("/billing-info", auth, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id)
      .select("billingTier isActive")
      .lean();
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Billing info fetch failed:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * GET /api/users/:id
 */
router.get("/:id([0-9a-fA-F]{24})", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = id === "me" ? req.user.id : id;

    const user = await Users.findById(userId).select(
      "name email role aboutMe businessName profilePicture averageRating"
    );

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("GET /users/:id error", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * GET /api/users/me/documents
 */
router.get("/me/documents", auth, async (req, res) => {
  try {
    const user = await Users.findById(
      req.user.id,
      "w9 businessLicense proofOfInsurance independentContractorAgreement"
    ).lean();

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      w9: user.w9 || null,
      businessLicense: user.businessLicense || null,
      proofOfInsurance: user.proofOfInsurance || null,
      independentContractorAgreement:
        user.independentContractorAgreement || null,
    });
  } catch (err) {
    console.error("GET /me/documents error:", err);
    res.status(500).json({ msg: "Server error fetching documents" });
  }
});

/**
 * GET /api/users/me/stats
 */
router.get("/me/stats", auth, async (req, res) => {
  if (req.user.role !== "serviceProvider")
    return res.status(403).json({ msg: "Only service providers have stats" });

  const year = parseInt(req.query.year) || new Date().getFullYear();
  const providerId = new mongoose.Types.ObjectId(req.user.id);

  try {
    const stats = await Job.aggregate([
      {
        $match: {
          acceptedProvider: providerId,
          status: "completed",
          $expr: { $eq: [{ $year: "$createdAt" }, year] },
        },
      },
      {
        $group: {
          _id: null,
          completedJobsCount: { $sum: 1 },
          totalAmountPaid: { $sum: "$totalAmountPaid" },
        },
      },
    ]);

    if (!stats.length) {
      return res.json({ completedJobsCount: 0, totalAmountPaid: 0 });
    }
    const { completedJobsCount, totalAmountPaid } = stats[0];
    res.json({ completedJobsCount, totalAmountPaid });
  } catch (err) {
    console.error("Error fetching provider stats:", err);
    res.status(500).json({ msg: "Server error fetching stats" });
  }
});

/**
 * GET /api/users/providers/active
 */
router.get("/providers/active", async (req, res) => {
  try {
    const providers = await Users.find(
      { role: "serviceProvider", isActive: true },
      "name serviceType location.coordinates"
    ).lean();

    const data = providers.map((p) => {
      const [lng, lat] = p.location?.coordinates || [];
      return {
        id: p._id,
        name: p.name,
        serviceType: p.serviceType,
        position: lat != null && lng != null ? [lat, lng] : null,
      };
    });

    res.json(data);
  } catch (err) {
    console.error("GET /providers/active error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * PUT /api/users/profile
 * Multipart profile update (files + fields). Coerces booleans explicitly.
 */
router.put(
  "/profile",
  auth,
  upload.fields([
    { name: "w9", maxCount: 1 },
    { name: "businessLicense", maxCount: 1 },
    { name: "proofOfInsurance", maxCount: 1 },
    { name: "independentContractorAgreement", maxCount: 1 },
    { name: "profilePicture", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const user = await Users.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: "User not found" });

      // text fields (coerce booleans)
      for (const [key, value] of Object.entries(req.body)) {
        if (value === undefined || value === "") continue;

        if (key === "acceptedICA") {
          user.acceptedICA = toBool(value);
        } else if (key === "optInSms" || key === "optInSMS" || key === "acceptSMS") {
          user.optInSms = toBool(value);
        } else if (key === "email") {
          user.email = String(value).toLowerCase();
        } else if (key === "phoneNumber") {
          user.phoneNumber = String(value);
        } else if (key === "zipcode") {
          user.zipcode = toArray(value).map((z) => String(z).trim());
        } else if (key === "serviceZipcode") {
          user.serviceZipcode = toArray(value).map((z) => String(z).trim());
        } else if (key === "yearsExperience") {
          user.yearsExperience = Number.isFinite(Number(value))
            ? Number(value)
            : user.yearsExperience;
        } else {
          user[key] = value;
        }
      }

      // files
      const files = req.files;
      if (files?.profilePicture?.[0]) {
        const { buffer, mimetype } = files.profilePicture[0];
        user.profilePicture = `data:${mimetype};base64,${buffer.toString("base64")}`;
      }
      if (files?.w9?.[0]) {
        user.w9 = files.w9[0].buffer.toString("base64");
      }
      if (files?.businessLicense?.[0]) {
        user.businessLicense = files.businessLicense[0].buffer.toString("base64");
      }
      if (files?.proofOfInsurance?.[0]) {
        user.proofOfInsurance = files.proofOfInsurance[0].buffer.toString("base64");
      }
      if (files?.independentContractorAgreement?.[0]) {
        user.independentContractorAgreement =
          files.independentContractorAgreement[0].buffer.toString("base64");
      }

      await user.save({ validateBeforeSave: false });

      // 🔒 Return slim user (no base64 docs) to avoid large payload crashes
      const fresh = await Users.findById(req.user.id)
        .select([
          "name","role","trade","serviceType","portfolio","serviceZipcode","billingTier",
          "zipcode","address","aboutMe","yearsExperience","businessName","isActive",
          "email","phoneNumber","optInSms","acceptedICA","stripeAccountId",
          "w9","businessLicense","proofOfInsurance","independentContractorAgreement","profilePicture",
        ].join(" "))
        .lean();

      return res.json({ msg: "Profile updated", user: toSlimUser(fresh) });
    } catch (err) {
      console.error("PUT /profile error:", err);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ msg: `MulterError: ${err.message}` });
      }
      return res.status(500).json({ msg: "Server error updating profile" });
    }
  }
);

/**
 * PATCH /api/users/profile  (JSON-only updates; boolean-safe)
 * Also keeps legacy alias /api/users/users/profile for backward compatibility.
 */
async function patchProfileHandler(req, res) {
  try {
    const updates = {};
    const b = req.body;

    if (typeof b.optInSms !== "undefined" || typeof b.optInSMS !== "undefined" || typeof b.acceptSMS !== "undefined") {
      updates.optInSms = toBool(b.optInSms ?? b.optInSMS ?? b.acceptSMS);
    }
    if (typeof b.acceptedICA !== "undefined") {
      updates.acceptedICA = toBool(b.acceptedICA);
    }
    if (typeof b.independentContractorAgreement !== "undefined") {
      updates.independentContractorAgreement = String(b.independentContractorAgreement || "");
    }
    if (b.email) updates.email = String(b.email).toLowerCase();
    if (b.phoneNumber) updates.phoneNumber = String(b.phoneNumber);

    await Users.findByIdAndUpdate(req.user.id, updates, { new: false });

    // 🔒 Return slim user instead of full doc with blobs
    const fresh = await Users.findById(req.user.id)
      .select([
        "name","role","trade","serviceType","portfolio","serviceZipcode","billingTier",
        "zipcode","address","aboutMe","yearsExperience","businessName","isActive",
        "email","phoneNumber","optInSms","acceptedICA","stripeAccountId",
        "w9","businessLicense","proofOfInsurance","independentContractorAgreement","profilePicture",
      ].join(" "))
      .lean();

    return res.json({ user: toSlimUser(fresh) });
  } catch (err) {
    console.error("PATCH /profile error:", err);
    return res.status(500).json({ msg: "Server error updating profile" });
  }
}

router.patch("/profile", auth, patchProfileHandler);
// legacy alias in case the app was calling /users/profile
router.patch("/users/profile", auth, patchProfileHandler);

/**
 * PUT /api/users/location
 */
router.put("/location", auth, async (req, res) => {
  try {
    const loc = req.body.location;
    if (!Array.isArray(loc) || loc.length !== 2)
      return res.status(400).json({ msg: "Location must be [lat, lng]" });

    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.location = {
      type: "Point",
      coordinates: [Number(loc[1]), Number(loc[0])],
    };
    await user.save({ validateBeforeSave: false });

    res.json({ msg: "Location updated", location: user.location });
  } catch (err) {
    console.error("PUT /location error:", err);
    res.status(500).json({ msg: "Server error updating location" });
  }
});

/**
 * POST /api/users/push-token
 */
router.post("/push-token", auth, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ msg: "Invalid or missing push token." });
    }

    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found." });

    user.expoPushToken = token;
    await user.save();

    res.status(200).json({ msg: "Push token saved." });
  } catch (err) {
    console.error("❌ Error saving push token:", err);
    res.status(500).json({ msg: "Failed to save push token." });
  }
});

/**
 * POST /api/users/save-session
 */
router.post("/save-session", auth, async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ msg: "Missing jobId." });

    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found." });

    user.lastActiveJobId = jobId;
    await user.save();

    res.status(200).json({ msg: "Session saved." });
  } catch (err) {
    console.error("Error saving session:", err);
    res.status(500).json({ msg: "Server error saving session." });
  }
});

/**
 * DELETE /api/users/delete
 */
router.delete("/delete", auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { reason } = req.body;
    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      {
        isDeleted: true,
        isActive: false,
        deleteReason: reason || "",
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ msg: "Account successfully marked as deleted" });
  } catch (err) {
    console.error("❌ Delete user error", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;

