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

// // router.get("/me", auth, async (req, res) => {
// //   try {
// //     console.time("🔍 MongoDB user fetch");

// //     const fields = [
// //       "name",
// //       "role",
// //       "trade",
// //       "serviceType",
// //       "portfolio",
// //       "serviceZipcode",
// //       "billingTier",
// //       "zipcode",
// //       "address",
// //       "aboutMe",
// //       "yearsExperience",
// //       "serviceCost",
// //       "businessName",
// //       "profilePicture",
// //       "w9",
// //       "businessLicense",
// //       "proofOfInsurance",
// //       "independentContractorAgreement",
// //       "isActive",
// //     ].join(" ");

// //     const user = await Users.findById(req.user.id, fields).lean();
// //     console.timeEnd("🔍 MongoDB user fetch");

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     // console.log("📦 slimUser output keys:", Object.keys(user));
// //     res.json(user);
// //   } catch (err) {
// //     console.error("GET /me error:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // ✅ Add this BEFORE the '/:id' route

// // router.get("/me", auth, async (req, res) => {
// //   try {
// //     console.time("🔍 MongoDB user fetch");

// //     const fields = [
// //       "name",
// //       "role",
// //       "trade",
// //       "serviceType",
// //       "portfolio",
// //       "serviceZipcode",
// //       "billingTier",
// //       "zipcode",
// //       "address",
// //       "aboutMe",
// //       "yearsExperience",
// //       "serviceCost",
// //       "businessName",
// //       "profilePicture",
// //       "w9",
// //       "businessLicense",
// //       "proofOfInsurance",
// //       "independentContractorAgreement",
// //       "isActive",
// //       // 👇 add what the client expects
// //       "email",
// //       "phoneNumber",
// //       "acceptedICA",
// //       "optInSms",
// //     ].join(" ");

// //     const user = await Users.findById(req.user.id, fields).lean();
// //     console.timeEnd("🔍 MongoDB user fetch");

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     // Convenience boolean for the client
// //     user.icaViewed = !!(
// //       user.independentContractorAgreement &&
// //       String(user.independentContractorAgreement).trim()
// //     );

// //     res.json(user);
// //   } catch (err) {
// //     console.error("GET /me error:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // GET /api/users/me  (lightweight)
// router.get("/me", auth, async (req, res) => {
//   try {
//     const fields = [
//       "name",
//       "email",
//       "phoneNumber",
//       "role",
//       "trade",
//       "serviceType",
//       "serviceZipcode",
//       "billingTier",
//       "zipcode",
//       "address",
//       "aboutMe",
//       "yearsExperience",
//       "serviceCost",
//       "businessName",
//       "isActive",
//       "acceptedICA",
//       "optInSms",
//       "stripeAccountId",
//     ].join(" ");

//     const user = await Users.findById(req.user.id).select(fields).lean();
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     res.json(user);
//   } catch (err) {
//     console.error("GET /me error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });


// // GET /api/users/me/summary  (tiny, boolean-only)
// router.get("/me/summary", auth, async (req, res) => {
//   try {
//     const u = await Users.findById(req.user.id)
//       .select([
//         "name",
//         "email",
//         "phoneNumber",
//         "role",
//         "serviceType",
//         "serviceZipcode",
//         "zipcode",
//         "address",
//         "yearsExperience",
//         "isActive",
//         "acceptedICA",
//         "optInSms",
//         "stripeAccountId",
//         // selected only to compute booleans (NOT returned)
//         "w9",
//         "businessLicense",
//         "proofOfInsurance",
//         "independentContractorAgreement",
//         "profilePicture",
//       ].join(" "))
//       .lean();

//     if (!u) return res.status(404).json({ msg: "User not found" });

//     const zip = Array.isArray(u.zipcode) ? u.zipcode[0] : u.zipcode;

//     const hasDocs = {
//       w9: !!u.w9,
//       businessLicense: !!u.businessLicense,
//       proofOfInsurance: !!u.proofOfInsurance,
//       icaString: !!u.independentContractorAgreement,
//     };

//     const checklist = {
//       hasEmail: !!u.email,
//       hasPhone: !!u.phoneNumber,
//       hasServiceType: !!u.serviceType,
//       hasZip: !!zip,
//       hasAddress: !!u.address,
//       acceptedICA: !!u.acceptedICA,
//       hasDocsAll:
//         hasDocs.w9 &&
//         hasDocs.businessLicense &&
//         hasDocs.proofOfInsurance &&
//         hasDocs.icaString,
//       hasProfilePicture: !!u.profilePicture,
//     };

//     const profileComplete = Object.values(checklist).every(Boolean);

//     res.json({
//       user: {
//         id: String(u._id),
//         name: u.name,
//         firstName: (u.name || "").split(" ")[0] || "",
//         role: u.role,
//         serviceType: u.serviceType,
//         serviceZipcode: u.serviceZipcode,
//         zipcode: zip,
//         isActive: u.isActive,
//       },
//       checklist,
//       hasDocs,
//       profileComplete,
//       // you can tune this logic; this is a sensible default signal
//       needsOnboarding: !!u.stripeAccountId && !profileComplete,
//     });
//   } catch (err) {
//     console.error("GET /me/summary error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });



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
//         if (value === undefined || value === "") continue;
      
//         if (key === "acceptedICA") {
//           user.acceptedICA =
//             value === true || value === "true" || value === 1 || value === "1";
//         } else if (key === "optInSms") {
//           user.optInSms =
//             value === true || value === "true" || value === 1 || value === "1";
//         } else if (key === "email") {
//           user.email = String(value).toLowerCase();
//         } else {
//           user[key] = value; // includes independentContractorAgreement if sent
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

// // GET /users/me/sms-preferences
// router.get("/users/me/sms-preferences", requireAuth, async (req, res) => {
//   const user = await Users.findById(req.user.id).select("smsPreferences");
//   if (!user) return res.status(404).json({ error: "User not found" });
//   res.json({ smsPreferences: user.smsPreferences || { jobUpdates: false, marketing: false } });
// });

// // PUT /users/me/sms-preferences
// router.put("/users/me/sms-preferences", requireAuth, async (req, res) => {
//   const { jobUpdates, marketing } = req.body || {};

//   // Must include at least one boolean flag
//   const isBool = (v) => typeof v === "boolean";
//   if (!isBool(jobUpdates) && !isBool(marketing)) {
//     return res.status(400).json({
//       error: "Provide at least one boolean: jobUpdates or marketing",
//     });
//   }

//   const update = {};
//   if (isBool(jobUpdates)) update["smsPreferences.jobUpdates"] = jobUpdates;
//   if (isBool(marketing))  update["smsPreferences.marketing"]  = marketing;

//   const user = await User.findByIdAndUpdate(
//     req.user.id,
//     { $set: update },
//     { new: true, select: "smsPreferences" }
//   );
//   if (!user) return res.status(404).json({ error: "User not found" });

//   return res.json({ smsPreferences: user.smsPreferences });
// });

// export default router;

// // // backend/routes/users.js
// // import express from "express";
// // import mongoose from "mongoose";
// // import crypto from "crypto";
// // import NodeGeocoder from "node-geocoder";
// // import multer from "multer";

// // import { auth } from "../middlewares/auth.js";
// // import Users from "../models/Users.js";
// // import Job from "../models/Job.js";

// // const router = express.Router();


// // // Geocoder + multer setup (unchanged)
// // const geocoder = NodeGeocoder({ provider: "openstreetmap" });
// // const upload = multer({
// //   storage: multer.memoryStorage(),
// //   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// // });

// // // --- helpers ---
// // const algorithm = "aes-256-cbc";
// // const encryptionKey = process.env.ENCRYPTION_KEY;
// // const encryptionIV = process.env.ENCRYPTION_IV;

// // function encrypt(text) {
// //   if (!encryptionKey || !encryptionIV) return text;
// //   const key = Buffer.from(encryptionKey, "hex");
// //   const iv = Buffer.from(encryptionIV, "hex");
// //   const cipher = crypto.createCipheriv(algorithm, key, iv);
// //   let encrypted = cipher.update(text, "utf8", "hex");
// //   return encrypted + cipher.final("hex");
// // }

// // const asBool = (v) => v === true || v === 1 || v === "1" || String(v).toLowerCase() === "true";
// // const hasStr = (v) => typeof v === "string" && v.trim().length > 0;

// // // Compute readiness server-side (same rules as app)
// // function evaluateProviderReadiness(me, has) {
// //   const missing = [];

// //   // Stripe
// //   if (!has?.stripeAccountId) missing.push("Stripe onboarding");

// //   if (!hasStr(me?.aboutMe)) missing.push("About Me");
// //   const yearsOk =
// //     Number.isFinite(me?.yearsExperience) ||
// //     (hasStr(me?.yearsExperience) && !isNaN(Number(me?.yearsExperience)));
// //   if (!yearsOk) missing.push("Years of Experience");

// //   if (!hasStr(me?.serviceType)) missing.push("Primary Service");
// //   if (!hasStr(me?.businessName)) missing.push("Business Name");
// //   if (!hasStr(me?.address)) missing.push("Business Address");

// //   const zipFirst = Array.isArray(me?.zipcode) ? me.zipcode[0] : me?.zipcode;
// //   if (!hasStr(zipFirst)) missing.push("Zip Code");

// //   if (!has?.profilePicture) missing.push("Profile Picture");
// //   if (!hasStr(me?.email)) missing.push("Email");
// //   if (!hasStr(me?.phoneNumber)) missing.push("Phone Number");

// //   if (!asBool(me?.optInSms)) missing.push("SMS Consent");

// //   if (!has?.docs?.w9) missing.push("W-9");
// //   if (!has?.docs?.businessLicense) missing.push("Business License");
// //   if (!has?.docs?.proofOfInsurance) missing.push("Proof of Insurance");

// //   const icaViewed = asBool(me?.acceptedICA) || has?.docs?.independentContractorAgreement;
// //   if (!icaViewed) missing.push("ICA Viewed");
// //   if (!asBool(me?.acceptedICA)) missing.push("ICA Agreed");

// //   return { ok: missing.length === 0, missing };
// // }

// // // Return a SLIM user (no base64 blobs)
// // function toSlimUser(u, overrides = {}) {
// //   if (!u) return {};
// //   const slim = {
// //     _id: u._id,
// //     name: u.name,
// //     email: u.email || "",
// //     phoneNumber: u.phoneNumber || "",
// //     role: u.role,
// //     trade: u.trade,
// //     serviceType: u.serviceType,
// //     portfolio: u.portfolio || [],
// //     zipcode: u.zipcode || [],
// //     serviceZipcode: u.serviceZipcode || [],
// //     address: u.address || "",
// //     aboutMe: u.aboutMe || "",
// //     yearsExperience: u.yearsExperience ?? null,
// //     businessName: u.businessName || "",
// //     billingTier: u.billingTier,
// //     isActive: !!u.isActive,
// //     optInSms: !!u.optInSms,
// //     acceptedICA: !!u.acceptedICA,
// //     stripeAccountId: u.stripeAccountId || "",
// //     // These booleans are filled in by caller to avoid fetching blobs
// //     hasProfilePicture: !!overrides.hasProfilePicture,
// //     hasDocs: {
// //       w9: !!overrides.docs?.w9,
// //       businessLicense: !!overrides.docs?.businessLicense,
// //       proofOfInsurance: !!overrides.docs?.proofOfInsurance,
// //       independentContractorAgreement: !!overrides.docs?.independentContractorAgreement,
// //     },
// //   };
// //   return slim;
// // }

// // // Utility: existence checks WITHOUT pulling blob data
// // async function getDocExistence(uid) {
// //   const [w9, bl, poi, ica, pic] = await Promise.all([
// //     Users.exists({ _id: uid, w9: { $exists: true, $type: "string", $ne: "" } }),
// //     Users.exists({ _id: uid, businessLicense: { $exists: true, $type: "string", $ne: "" } }),
// //     Users.exists({ _id: uid, proofOfInsurance: { $exists: true, $type: "string", $ne: "" } }),
// //     Users.exists({
// //       _id: uid,
// //       independentContractorAgreement: { $exists: true, $type: "string", $ne: "" },
// //     }),
// //     Users.exists({ _id: uid, profilePicture: { $exists: true, $type: "string", $ne: "" } }),
// //   ]);
// //   return {
// //     docs: {
// //       w9: !!w9,
// //       businessLicense: !!bl,
// //       proofOfInsurance: !!poi,
// //       independentContractorAgreement: !!ica,
// //     },
// //     profilePicture: !!pic,
// //   };
// // }

// // /**
// //  * GET /api/users/me
// //  * - Honors header X-Users-Me-Mode: "slim" (no blobs) | "full" (legacy)
// //  * - Client (api client) already sends "slim" during login/hydration.
// //  */
// // router.get("/me", auth, async (req, res) => {
// //   const rid = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
// //   const mode = String(req.get("X-Users-Me-Mode") || req.query.mode || "full").toLowerCase();

// //   try {
// //     console.log(
// //       `👤 [${rid}] /me start`,
// //       JSON.stringify({ uid: req.user.id, role: req.user.role, mode })
// //     );

// //     // Never select blobs for SLIM mode
// //     const baseFields = [
// //       "name",
// //       "email",
// //       "phoneNumber",
// //       "role",
// //       "trade",
// //       "serviceType",
// //       "portfolio",
// //       "zipcode",
// //       "serviceZipcode",
// //       "address",
// //       "aboutMe",
// //       "yearsExperience",
// //       "businessName",
// //       "billingTier",
// //       "isActive",
// //       "optInSms",
// //       "acceptedICA",
// //       "stripeAccountId",
// //     ];

// //     const fullPlusBlobs = baseFields.concat([
// //       "profilePicture",
// //       "w9",
// //       "businessLicense",
// //       "proofOfInsurance",
// //       "independentContractorAgreement",
// //     ]);

// //     const fieldsToUse = mode === "slim" ? baseFields : fullPlusBlobs;

// //     const user = await Users.findById(req.user.id).select(fieldsToUse.join(" ")).lean();
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     if (mode === "slim") {
// //       // compute existence booleans WITHOUT fetching blobs
// //       const exist = await getDocExistence(req.user.id);
// //       const payload = toSlimUser(user, {
// //         hasProfilePicture: exist.profilePicture,
// //         docs: exist.docs,
// //       });

// //       console.log(
// //         `📤 [${rid}] /me SLIM keys=`,
// //         Object.keys(payload),
// //         "sizes={n/a}",
// //       );
// //       return res.json(payload);
// //     }

// //     // Legacy FULL mode (avoid using this in the app during login)
// //     const sizes = {
// //       profilePicture: hasStr(user.profilePicture) ? `${(user.profilePicture.length / 1024).toFixed(2)} KB` : "0 B",
// //       w9: hasStr(user.w9) ? `${(user.w9.length / 1024).toFixed(2)} KB` : "0 B",
// //       businessLicense: hasStr(user.businessLicense) ? `${(user.businessLicense.length / 1024).toFixed(2)} KB` : "0 B",
// //       proofOfInsurance: hasStr(user.proofOfInsurance) ? `${(user.proofOfInsurance.length / 1024).toFixed(2)} KB` : "0 B",
// //       independentContractorAgreement: hasStr(user.independentContractorAgreement)
// //         ? `${(user.independentContractorAgreement.length / 1024).toFixed(2)} KB`
// //         : "0 B",
// //     };
// //     console.log(`📦 [${rid}] /me FULL keys=`, Object.keys(user), "sizes=", sizes);
// //     return res.json(user);
// //   } catch (err) {
// //     console.error(`❌ [${rid}] /me error:`, err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * GET /api/users/me/readiness
// //  * Tiny, boolean-only payload to gate providers on login/dashboard.
// //  */
// // router.get("/me/readiness", auth, async (req, res) => {
// //   const rid = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
// //   try {
// //     const user = await Users.findById(req.user.id)
// //       .select(
// //         [
// //           "email",
// //           "phoneNumber",
// //           "role",
// //           "serviceType",
// //           "aboutMe",
// //           "yearsExperience",
// //           "businessName",
// //           "address",
// //           "zipcode",
// //           "optInSms",
// //           "acceptedICA",
// //           "stripeAccountId",
// //         ].join(" ")
// //       )
// //       .lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     const exist = await getDocExistence(req.user.id);
// //     const has = {
// //       docs: exist.docs,
// //       profilePicture: exist.profilePicture,
// //       stripeAccountId: !!user.stripeAccountId,
// //     };

// //     const readiness = evaluateProviderReadiness(user, {
// //       docs: has.docs,
// //       profilePicture: has.profilePicture,
// //       stripeAccountId: has.stripeAccountId,
// //     });

// //     const response = {
// //       role: user.role,
// //       profileComplete: readiness.ok,
// //       stripeComplete: has.stripeAccountId, // keep minimal; Stripe onboarding URL is handled elsewhere
// //       providerReady: readiness.ok && has.stripeAccountId,
// //       missing: readiness.missing, // useful for UI; small list of strings
// //     };

// //     console.log(`🧩 [/me/readiness ${rid}]`, response);
// //     return res.json(response);
// //   } catch (err) {
// //     console.error(`❌ [/me/readiness ${rid}] error:`, err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /* ---------- The rest of your routes (mostly unchanged), with small fixes ---------- */

// // // Active providers
// // router.get("/active-providers", async (req, res) => {
// //   try {
// //     const activeProviders = await Users.find({
// //       role: "serviceProvider",
// //       isOnline: true,
// //       location: { $exists: true },
// //     }).select("name serviceType location");
// //     res.json(
// //       activeProviders.map((pro) => ({
// //         id: pro._id,
// //         name: pro.name,
// //         category: pro.serviceType,
// //         coords: {
// //           latitude: pro.location?.coordinates?.[1],
// //           longitude: pro.location?.coordinates?.[0],
// //         },
// //       }))
// //     );
// //   } catch (err) {
// //     console.error("Failed to fetch active providers:", err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // // Billing info
// // router.get("/billing-info", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(req.user.id).select("billingTier isActive").lean();
// //     if (!user) return res.status(404).json({ msg: "User not found" });
// //     res.json(user);
// //   } catch (err) {
// //     console.error("Billing info fetch failed:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // // Public user by id (kept as-is, note: returns profilePicture inline)
// // router.get("/:id([0-9a-fA-F]{24})", auth, async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const userId = id === "me" ? req.user.id : id;

// //     const user = await Users.findById(userId).select(
// //       "name email role aboutMe businessName profilePicture averageRating"
// //     );
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json(user);
// //   } catch (err) {
// //     console.error("GET /users/:id error", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // // User documents (explicit fetch only)
// // router.get("/me/documents", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(
// //       req.user.id,
// //       "w9 businessLicense proofOfInsurance independentContractorAgreement"
// //     ).lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json({
// //       w9: user.w9 || null,
// //       businessLicense: user.businessLicense || null,
// //       proofOfInsurance: user.proofOfInsurance || null,
// //       independentContractorAgreement: user.independentContractorAgreement || null,
// //     });
// //   } catch (err) {
// //     console.error("GET /me/documents error:", err);
// //     res.status(500).json({ msg: "Server error fetching documents" });
// //   }
// // });

// // // Provider stats
// // router.get("/me/stats", auth, async (req, res) => {
// //   if (req.user.role !== "serviceProvider")
// //     return res.status(403).json({ msg: "Only service providers have stats" });

// //   const year = parseInt(req.query.year) || new Date().getFullYear();
// //   const providerId = new mongoose.Types.ObjectId(req.user.id);

// //   try {
// //     const stats = await Job.aggregate([
// //       {
// //         $match: {
// //           acceptedProvider: providerId,
// //           status: "completed",
// //           $expr: { $eq: [{ $year: "$createdAt" }, year] },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: null,
// //           completedJobsCount: { $sum: 1 },
// //           totalAmountPaid: { $sum: "$totalAmountPaid" },
// //         },
// //       },
// //     ]);

// //     if (!stats.length) {
// //       return res.json({ completedJobsCount: 0, totalAmountPaid: 0 });
// //     }
// //     const { completedJobsCount, totalAmountPaid } = stats[0];
// //     res.json({ completedJobsCount, totalAmountPaid });
// //   } catch (err) {
// //     console.error("Error fetching provider stats:", err);
// //     res.status(500).json({ msg: "Server error fetching stats" });
// //   }
// // });

// // // Active providers (minimal)
// // router.get("/providers/active", async (req, res) => {
// //   try {
// //     const providers = await Users.find(
// //       { role: "serviceProvider", isActive: true },
// //       "name serviceType location.coordinates"
// //     ).lean();

// //     const data = providers.map((p) => {
// //       const [lng, lat] = p.location?.coordinates || [];
// //       return {
// //         id: p._id,
// //         name: p.name,
// //         serviceType: p.serviceType,
// //         position: lat != null && lng != null ? [lat, lng] : null,
// //       };
// //     });

// //     res.json(data);
// //   } catch (err) {
// //     console.error("GET /providers/active error:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * Multipart profile update — responds with SLIM user (no blobs)
// //  */
// // router.put(
// //   "/profile",
// //   auth,
// //   upload.fields([
// //     { name: "w9", maxCount: 1 },
// //     { name: "businessLicense", maxCount: 1 },
// //     { name: "proofOfInsurance", maxCount: 1 },
// //     { name: "independentContractorAgreement", maxCount: 1 },
// //     { name: "profilePicture", maxCount: 1 },
// //   ]),
// //   async (req, res) => {
// //     try {
// //       const user = await Users.findById(req.user.id);
// //       if (!user) return res.status(404).json({ msg: "User not found" });

// //       // text fields (coerce a few booleans)
// //       for (const [key, value] of Object.entries(req.body)) {
// //         if (value === undefined || value === "") continue;
// //         if (key === "acceptedICA") user.acceptedICA = asBool(value);
// //         else if (key === "optInSms") user.optInSms = asBool(value);
// //         else if (key === "email") user.email = String(value).toLowerCase();
// //         else user[key] = value;
// //       }

// //       // files
// //       const f = req.files || {};
// //       if (f.profilePicture?.[0]) {
// //         const { buffer, mimetype } = f.profilePicture[0];
// //         user.profilePicture = `data:${mimetype};base64,${buffer.toString("base64")}`;
// //       }
// //       if (f.w9?.[0]) user.w9 = f.w9[0].buffer.toString("base64");
// //       if (f.businessLicense?.[0]) user.businessLicense = f.businessLicense[0].buffer.toString("base64");
// //       if (f.proofOfInsurance?.[0]) user.proofOfInsurance = f.proofOfInsurance[0].buffer.toString("base64");
// //       if (f.independentContractorAgreement?.[0])
// //         user.independentContractorAgreement = f.independentContractorAgreement[0].buffer.toString("base64");

// //       await user.save({ validateBeforeSave: false });

// //       // respond SLIM to avoid crashing client
// //       const payload = toSlimUser(user.toObject(), {
// //         hasProfilePicture: !!user.profilePicture,
// //         docs: {
// //           w9: !!user.w9,
// //           businessLicense: !!user.businessLicense,
// //           proofOfInsurance: !!user.proofOfInsurance,
// //           independentContractorAgreement: !!user.independentContractorAgreement,
// //         },
// //       });

// //       console.log("✅ PUT /profile -> SLIM response");
// //       return res.json({ msg: "Profile updated", user: payload });
// //     } catch (err) {
// //       console.error("PUT /profile error:", err);
// //       if (err instanceof multer.MulterError) {
// //         return res.status(400).json({ msg: `MulterError: ${err.message}` });
// //       }
// //       return res.status(500).json({ msg: "Server error updating profile" });
// //     }
// //   }
// // );

// // // JSON-only profile patch — also returns SLIM
// // router.patch("/users/profile", auth, async (req, res) => {
// //   try {
// //     const b = req.body || {};
// //     const updates = {};
// //     if (typeof b.optInSms !== "undefined") updates.optInSms = asBool(b.optInSms);
// //     if (typeof b.acceptedICA !== "undefined") updates.acceptedICA = asBool(b.acceptedICA);
// //     if (typeof b.independentContractorAgreement !== "undefined")
// //       updates.independentContractorAgreement = String(b.independentContractorAgreement || "");
// //     if (b.email) updates.email = String(b.email).toLowerCase();
// //     if (b.phoneNumber) updates.phoneNumber = String(b.phoneNumber);

// //     const user = await Users.findByIdAndUpdate(req.user.id, updates, { new: true, lean: true });
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     const exist = await getDocExistence(req.user.id);
// //     const payload = toSlimUser(user, {
// //       hasProfilePicture: exist.profilePicture,
// //       docs: exist.docs,
// //     });
// //     return res.json({ user: payload });
// //   } catch (err) {
// //     console.error("PATCH /users/profile error:", err);
// //     return res.status(500).json({ msg: "Server error updating profile" });
// //   }
// // });

// // // Location (unchanged except safe save)
// // router.put("/location", auth, async (req, res) => {
// //   try {
// //     const loc = req.body.location;
// //     if (!Array.isArray(loc) || loc.length !== 2)
// //       return res.status(400).json({ msg: "Location must be [lat, lng]" });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     user.location = {
// //       type: "Point",
// //       coordinates: [Number(loc[1]), Number(loc[0])],
// //     };
// //     await user.save({ validateBeforeSave: false });

// //     res.json({ msg: "Location updated", location: user.location });
// //   } catch (err) {
// //     console.error("PUT /location error:", err);
// //     res.status(500).json({ msg: "Server error updating location" });
// //   }
// // });

// // // Push token (unchanged)
// // router.post("/push-token", auth, async (req, res) => {
// //   try {
// //     const { token } = req.body;
// //     if (!token || typeof token !== "string") {
// //       return res.status(400).json({ msg: "Invalid or missing push token." });
// //     }

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.expoPushToken = token;
// //     await user.save();

// //     res.status(200).json({ msg: "Push token saved." });
// //   } catch (err) {
// //     console.error("❌ Error saving push token:", err);
// //     res.status(500).json({ msg: "Failed to save push token." });
// //   }
// // });

// // // Save session (unchanged)
// // router.post("/save-session", auth, async (req, res) => {
// //   try {
// //     const { jobId } = req.body;
// //     if (!jobId) return res.status(400).json({ msg: "Missing jobId." });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.lastActiveJobId = jobId;
// //     await user.save();

// //     res.status(200).json({ msg: "Session saved." });
// //   } catch (err) {
// //     console.error("Error saving session:", err);
// //     res.status(500).json({ msg: "Server error saving session." });
// //   }
// // });

// // // Soft delete (unchanged)
// // router.delete("/delete", auth, async (req, res) => {
// //   try {
// //     const userId = req.user._id || req.user.id;
// //     const { reason } = req.body;
// //     const updatedUser = await Users.findByIdAndUpdate(
// //       userId,
// //       { isDeleted: true, isActive: false, deleteReason: reason || "", deletedAt: new Date() },
// //       { new: true }
// //     );
// //     if (!updatedUser) return res.status(404).json({ msg: "User not found" });

// //     res.json({ msg: "Account successfully marked as deleted" });
// //   } catch (err) {
// //     console.error("❌ Delete user error", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // export default router;


// // // backend/routes/users.js
// // import express from "express";
// // import mongoose from "mongoose";
// // import crypto from "crypto";
// // import NodeGeocoder from "node-geocoder";
// // import multer from "multer";

// // import { auth } from "../middlewares/auth.js";
// // import Users from "../models/Users.js";
// // import Job from "../models/Job.js";

// // const router = express.Router();

// // // Geocoder + multer setup (geocoder kept for future use)
// // const geocoder = NodeGeocoder({ provider: "openstreetmap" });
// // const upload = multer({
// //   storage: multer.memoryStorage(),
// //   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// // });

// // // --- helpers ---------------------------------------------------------
// // const algorithm = "aes-256-cbc";
// // const encryptionKey = process.env.ENCRYPTION_KEY;
// // const encryptionIV = process.env.ENCRYPTION_IV;

// // function encrypt(text) {
// //   if (!encryptionKey || !encryptionIV) return text;
// //   const key = Buffer.from(encryptionKey, "hex");
// //   const iv = Buffer.from(encryptionIV, "hex");
// //   const cipher = crypto.createCipheriv(algorithm, key, iv);
// //   let encrypted = cipher.update(text, "utf8", "hex");
// //   return encrypted + cipher.final("hex");
// // }

// // const asBool = (v) =>
// //   v === true || v === 1 || v === "1" || String(v).toLowerCase() === "true";
// // const hasStr = (v) => typeof v === "string" && v.trim().length > 0;

// // // Compute readiness server-side (same rules as app)
// // function evaluateProviderReadiness(me, has) {
// //   const missing = [];

// //   // Stripe
// //   if (!has?.stripeAccountId) missing.push("Stripe onboarding");

// //   if (!hasStr(me?.aboutMe)) missing.push("About Me");
// //   const yearsOk =
// //     Number.isFinite(me?.yearsExperience) ||
// //     (hasStr(me?.yearsExperience) && !isNaN(Number(me?.yearsExperience)));
// //   if (!yearsOk) missing.push("Years of Experience");

// //   if (!hasStr(me?.serviceType)) missing.push("Primary Service");
// //   if (!hasStr(me?.businessName)) missing.push("Business Name");
// //   if (!hasStr(me?.address)) missing.push("Business Address");

// //   const zipFirst = Array.isArray(me?.zipcode) ? me.zipcode[0] : me?.zipcode;
// //   if (!hasStr(zipFirst)) missing.push("Zip Code");

// //   if (!has?.profilePicture) missing.push("Profile Picture");
// //   if (!hasStr(me?.email)) missing.push("Email");
// //   if (!hasStr(me?.phoneNumber)) missing.push("Phone Number");

// //   if (!asBool(me?.optInSms)) missing.push("SMS Consent");

// //   if (!has?.docs?.w9) missing.push("W-9");
// //   if (!has?.docs?.businessLicense) missing.push("Business License");
// //   if (!has?.docs?.proofOfInsurance) missing.push("Proof of Insurance");

// //   const icaViewed =
// //     asBool(me?.acceptedICA) || has?.docs?.independentContractorAgreement;
// //   if (!icaViewed) missing.push("ICA Viewed");
// //   if (!asBool(me?.acceptedICA)) missing.push("ICA Agreed");

// //   return { ok: missing.length === 0, missing };
// // }

// // // Return a SLIM user (no base64 blobs)
// // function toSlimUser(u, overrides = {}) {
// //   if (!u) return {};
// //   const docs = overrides.docs || {};
// //   const hasProfilePicture =
// //     typeof overrides.hasProfilePicture === "boolean"
// //       ? overrides.hasProfilePicture
// //       : false;

// //   // inferred: icaViewed is true if accepted OR ICA doc exists
// //   const icaViewed = !!u.acceptedICA || !!docs.independentContractorAgreement;

// //   return {
// //     _id: u._id,
// //     name: u.name || "",
// //     email: u.email || "",
// //     phoneNumber: u.phoneNumber || "",
// //     role: u.role || "",
// //     trade: u.trade || "",
// //     serviceType: u.serviceType || "",
// //     portfolio: Array.isArray(u.portfolio) ? u.portfolio : [],
// //     zipcode: Array.isArray(u.zipcode) ? u.zipcode : u.zipcode ? [u.zipcode] : [],
// //     serviceZipcode: Array.isArray(u.serviceZipcode) ? u.serviceZipcode : [],
// //     address: u.address || "",
// //     aboutMe: u.aboutMe || "",
// //     yearsExperience:
// //       Number.isFinite(u.yearsExperience) ? u.yearsExperience : u.yearsExperience ?? null,
// //     businessName: u.businessName || "",
// //     billingTier: u.billingTier ?? null,
// //     isActive: !!u.isActive,
// //     optInSms: !!u.optInSms,
// //     acceptedICA: !!u.acceptedICA,
// //     icaViewed,
// //     stripeAccountId: u.stripeAccountId || "",
// //     hasProfilePicture: !!hasProfilePicture,
// //     hasDocs: {
// //       w9: !!docs.w9,
// //       businessLicense: !!docs.businessLicense,
// //       proofOfInsurance: !!docs.proofOfInsurance,
// //       independentContractorAgreement: !!docs.independentContractorAgreement,
// //     },
// //   };
// // }

// // // Existence checks WITHOUT pulling blob data (single aggregation query)
// // async function getDocExistence(uid) {
// //   try {
// //     const [row] = await Users.aggregate([
// //       { $match: { _id: new mongoose.Types.ObjectId(uid) } },
// //       {
// //         $project: {
// //           _id: 0,
// //           profilePicture: {
// //             $gt: [{ $strLenCP: { $ifNull: ["$profilePicture", ""] } }, 0],
// //           },
// //           docs: {
// //             w9: { $gt: [{ $strLenCP: { $ifNull: ["$w9", ""] } }, 0] },
// //             businessLicense: {
// //               $gt: [{ $strLenCP: { $ifNull: ["$businessLicense", ""] } }, 0],
// //             },
// //             proofOfInsurance: {
// //               $gt: [{ $strLenCP: { $ifNull: ["$proofOfInsurance", ""] } }, 0],
// //             },
// //             independentContractorAgreement: {
// //               $gt: [
// //                 { $strLenCP: { $ifNull: ["$independentContractorAgreement", ""] } },
// //                 0,
// //               ],
// //             },
// //           },
// //         },
// //       },
// //     ]);
// //     return (
// //       row || {
// //         profilePicture: false,
// //         docs: {
// //           w9: false,
// //           businessLicense: false,
// //           proofOfInsurance: false,
// //           independentContractorAgreement: false,
// //         },
// //       }
// //     );
// //   } catch (e) {
// //     console.error("⚠️ getDocExistence error:", e?.message);
// //     return {
// //       profilePicture: false,
// //       docs: {
// //         w9: false,
// //         businessLicense: false,
// //         proofOfInsurance: false,
// //         independentContractorAgreement: false,
// //       },
// //     };
// //   }
// // }

// // // --- routes ----------------------------------------------------------

// // /**
// //  * GET /api/users/me
// //  * - Defaults to SLIM (no blobs). To request FULL, send:
// //  *   X-Users-Me-Mode: full  AND  X-Allow-Full-Me: 1
// //  */
// // router.get("/me", auth, async (req, res) => {
// //   const rid = crypto.randomUUID?.() || Math.random().toString(36).slice(2);

// //   let mode = String(
// //     req.get("X-Users-Me-Mode") || req.query.mode || "slim"
// //   ).toLowerCase();
// //   if (mode === "full" && req.get("X-Allow-Full-Me") !== "1") {
// //     mode = "slim";
// //   }

// //   try {
// //     console.log(
// //       `👤 [${rid}] /me start`,
// //       JSON.stringify({ uid: req.user.id, role: req.user.role, mode })
// //     );

// //     // Never select blobs for SLIM mode
// //     const baseFields = [
// //       "name",
// //       "email",
// //       "phoneNumber",
// //       "role",
// //       "trade",
// //       "serviceType",
// //       "portfolio",
// //       "zipcode",
// //       "serviceZipcode",
// //       "address",
// //       "aboutMe",
// //       "yearsExperience",
// //       "businessName",
// //       "billingTier",
// //       "isActive",
// //       "optInSms",
// //       "acceptedICA",
// //       "stripeAccountId",
// //     ];

// //     const fullPlusBlobs = baseFields.concat([
// //       "profilePicture",
// //       "w9",
// //       "businessLicense",
// //       "proofOfInsurance",
// //       "independentContractorAgreement",
// //     ]);

// //     const fieldsToUse = mode === "slim" ? baseFields : fullPlusBlobs;

// //     const user = await Users.findById(req.user.id)
// //       .select(fieldsToUse.join(" "))
// //       .lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.set("Cache-Control", "no-store");

// //     if (mode === "slim") {
// //       // compute existence booleans WITHOUT fetching blobs
// //       const exist = await getDocExistence(req.user.id);
// //       const payload = toSlimUser(user, {
// //         hasProfilePicture: exist.profilePicture,
// //         docs: exist.docs,
// //       });

// //       console.log(`📤 [${rid}] /me SLIM keys=`, Object.keys(payload));
// //       return res.json(payload);
// //     }

// //     // Legacy FULL mode (use sparingly)
// //     const sizes = {
// //       profilePicture: hasStr(user.profilePicture)
// //         ? `${(user.profilePicture.length / 1024).toFixed(2)} KB`
// //         : "0 B",
// //       w9: hasStr(user.w9) ? `${(user.w9.length / 1024).toFixed(2)} KB` : "0 B",
// //       businessLicense: hasStr(user.businessLicense)
// //         ? `${(user.businessLicense.length / 1024).toFixed(2)} KB`
// //         : "0 B",
// //       proofOfInsurance: hasStr(user.proofOfInsurance)
// //         ? `${(user.proofOfInsurance.length / 1024).toFixed(2)} KB`
// //         : "0 B",
// //       independentContractorAgreement: hasStr(user.independentContractorAgreement)
// //         ? `${(user.independentContractorAgreement.length / 1024).toFixed(2)} KB`
// //         : "0 B",
// //     };
// //     console.log(`📦 [${rid}] /me FULL keys=`, Object.keys(user), "sizes=", sizes);
// //     return res.json(user);
// //   } catch (err) {
// //     console.error(`❌ [${rid}] /me error:`, err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * GET /api/users/me/readiness
// //  * Tiny, boolean-only payload to gate providers on login/dashboard.
// //  */
// // router.get("/me/readiness", auth, async (req, res) => {
// //   const rid = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
// //   try {
// //     const user = await Users.findById(req.user.id)
// //       .select(
// //         [
// //           "email",
// //           "phoneNumber",
// //           "role",
// //           "serviceType",
// //           "aboutMe",
// //           "yearsExperience",
// //           "businessName",
// //           "address",
// //           "zipcode",
// //           "optInSms",
// //           "acceptedICA",
// //           "stripeAccountId",
// //         ].join(" ")
// //       )
// //       .lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     const exist = await getDocExistence(req.user.id);
// //     const has = {
// //       docs: exist.docs,
// //       profilePicture: exist.profilePicture,
// //       stripeAccountId: !!user.stripeAccountId,
// //     };

// //     const readiness = evaluateProviderReadiness(user, {
// //       docs: has.docs,
// //       profilePicture: has.profilePicture,
// //       stripeAccountId: has.stripeAccountId,
// //     });

// //     const response = {
// //       role: user.role,
// //       profileComplete: readiness.ok,
// //       stripeComplete: has.stripeAccountId,
// //       providerReady: readiness.ok && has.stripeAccountId,
// //       missing: readiness.missing,
// //     };

// //     console.log(`🧩 [/me/readiness ${rid}]`, response);
// //     return res.json(response);
// //   } catch (err) {
// //     console.error(`❌ [/me/readiness ${rid}] error:`, err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // // Active providers
// // router.get("/active-providers", async (req, res) => {
// //   try {
// //     const activeProviders = await Users.find({
// //       role: "serviceProvider",
// //       isOnline: true,
// //       location: { $exists: true },
// //     }).select("name serviceType location");
// //     res.json(
// //       activeProviders.map((pro) => ({
// //         id: pro._id,
// //         name: pro.name,
// //         category: pro.serviceType,
// //         coords: {
// //           latitude: pro.location?.coordinates?.[1],
// //           longitude: pro.location?.coordinates?.[0],
// //         },
// //       }))
// //     );
// //   } catch (err) {
// //     console.error("Failed to fetch active providers:", err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // // Billing info
// // router.get("/billing-info", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(req.user.id)
// //       .select("billingTier isActive")
// //       .lean();
// //     if (!user) return res.status(404).json({ msg: "User not found" });
// //     res.json(user);
// //   } catch (err) {
// //     console.error("Billing info fetch failed:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // // Public user by id (note: returns profilePicture inline)
// // router.get("/:id([0-9a-fA-F]{24})", auth, async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const userId = id === "me" ? req.user.id : id;

// //     const user = await Users.findById(userId).select(
// //       "name email role aboutMe businessName profilePicture averageRating"
// //     );
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json(user);
// //   } catch (err) {
// //     console.error("GET /users/:id error", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // // User documents (explicit fetch only)
// // router.get("/me/documents", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(
// //       req.user.id,
// //       "w9 businessLicense proofOfInsurance independentContractorAgreement"
// //     ).lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json({
// //       w9: user.w9 || null,
// //       businessLicense: user.businessLicense || null,
// //       proofOfInsurance: user.proofOfInsurance || null,
// //       independentContractorAgreement: user.independentContractorAgreement || null,
// //     });
// //   } catch (err) {
// //     console.error("GET /me/documents error:", err);
// //     res.status(500).json({ msg: "Server error fetching documents" });
// //   }
// // });

// // // Provider stats
// // router.get("/me/stats", auth, async (req, res) => {
// //   if (req.user.role !== "serviceProvider")
// //     return res.status(403).json({ msg: "Only service providers have stats" });

// //   const year = parseInt(req.query.year) || new Date().getFullYear();
// //   const providerId = new mongoose.Types.ObjectId(req.user.id);

// //   try {
// //     const stats = await Job.aggregate([
// //       {
// //         $match: {
// //           acceptedProvider: providerId,
// //           status: "completed",
// //           $expr: { $eq: [{ $year: "$createdAt" }, year] },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: null,
// //           completedJobsCount: { $sum: 1 },
// //           totalAmountPaid: { $sum: "$totalAmountPaid" },
// //         },
// //       },
// //     ]);

// //     if (!stats.length) {
// //       return res.json({ completedJobsCount: 0, totalAmountPaid: 0 });
// //     }
// //     const { completedJobsCount, totalAmountPaid } = stats[0];
// //     res.json({ completedJobsCount, totalAmountPaid });
// //   } catch (err) {
// //     console.error("Error fetching provider stats:", err);
// //     res.status(500).json({ msg: "Server error fetching stats" });
// //   }
// // });

// // // Active providers (minimal)
// // router.get("/providers/active", async (req, res) => {
// //   try {
// //     const providers = await Users.find(
// //       { role: "serviceProvider", isActive: true },
// //       "name serviceType location.coordinates"
// //     ).lean();

// //     const data = providers.map((p) => {
// //       const [lng, lat] = p.location?.coordinates || [];
// //       return {
// //         id: p._id,
// //         name: p.name,
// //         serviceType: p.serviceType,
// //         position: lat != null && lng != null ? [lat, lng] : null,
// //       };
// //     });

// //     res.json(data);
// //   } catch (err) {
// //     console.error("GET /providers/active error:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * Multipart profile update — responds with SLIM user (no blobs)
// //  */
// // router.put(
// //   "/profile",
// //   auth,
// //   upload.fields([
// //     { name: "w9", maxCount: 1 },
// //     { name: "businessLicense", maxCount: 1 },
// //     { name: "proofOfInsurance", maxCount: 1 },
// //     { name: "independentContractorAgreement", maxCount: 1 },
// //     { name: "profilePicture", maxCount: 1 },
// //   ]),
// //   async (req, res) => {
// //     try {
// //       const user = await Users.findById(req.user.id);
// //       if (!user) return res.status(404).json({ msg: "User not found" });

// //       // text fields (coerce a few booleans)
// //       for (const [key, value] of Object.entries(req.body)) {
// //         if (value === undefined || value === "") continue;
// //         if (key === "acceptedICA") user.acceptedICA = asBool(value);
// //         else if (key === "optInSms") user.optInSms = asBool(value);
// //         else if (key === "email") user.email = String(value).toLowerCase();
// //         else user[key] = value;
// //       }

// //       // files
// //       const f = req.files || {};
// //       if (f.profilePicture?.[0]) {
// //         const { buffer, mimetype } = f.profilePicture[0];
// //         user.profilePicture = `data:${mimetype};base64,${buffer.toString("base64")}`;
// //       }
// //       if (f.w9?.[0]) user.w9 = f.w9[0].buffer.toString("base64");
// //       if (f.businessLicense?.[0])
// //         user.businessLicense = f.businessLicense[0].buffer.toString("base64");
// //       if (f.proofOfInsurance?.[0])
// //         user.proofOfInsurance = f.proofOfInsurance[0].buffer.toString("base64");
// //       if (f.independentContractorAgreement?.[0])
// //         user.independentContractorAgreement =
// //           f.independentContractorAgreement[0].buffer.toString("base64");

// //       await user.save({ validateBeforeSave: false });

// //       // respond SLIM to avoid crashing client
// //       const payload = toSlimUser(user.toObject(), {
// //         hasProfilePicture: !!user.profilePicture,
// //         docs: {
// //           w9: !!user.w9,
// //           businessLicense: !!user.businessLicense,
// //           proofOfInsurance: !!user.proofOfInsurance,
// //           independentContractorAgreement: !!user.independentContractorAgreement,
// //         },
// //       });

// //       console.log("✅ PUT /profile -> SLIM response");
// //       return res.json({ msg: "Profile updated", user: payload });
// //     } catch (err) {
// //       console.error("PUT /profile error:", err);
// //       if (err instanceof multer.MulterError) {
// //         return res.status(400).json({ msg: `MulterError: ${err.message}` });
// //       }
// //       return res.status(500).json({ msg: "Server error updating profile" });
// //     }
// //   }
// // );

// // // JSON-only profile patch — also returns SLIM
// // router.patch("/profile", auth, async (req, res) => {
// //   try {
// //     const b = req.body || {};
// //     const updates = {};
// //     if (typeof b.optInSms !== "undefined") updates.optInSms = asBool(b.optInSms);
// //     if (typeof b.acceptedICA !== "undefined") updates.acceptedICA = asBool(b.acceptedICA);
// //     if (typeof b.independentContractorAgreement !== "undefined")
// //       updates.independentContractorAgreement = String(b.independentContractorAgreement || "");
// //     if (b.email) updates.email = String(b.email).toLowerCase();
// //     if (b.phoneNumber) updates.phoneNumber = String(b.phoneNumber);

// //     const user = await Users.findByIdAndUpdate(req.user.id, updates, {
// //       new: true,
// //       lean: true,
// //     });
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     const exist = await getDocExistence(req.user.id);
// //     const payload = toSlimUser(user, {
// //       hasProfilePicture: exist.profilePicture,
// //       docs: exist.docs,
// //     });
// //     return res.json({ user: payload });
// //   } catch (err) {
// //     console.error("PATCH /profile error:", err);
// //     return res.status(500).json({ msg: "Server error updating profile" });
// //   }
// // });

// // // Location (safe save)
// // router.put("/location", auth, async (req, res) => {
// //   try {
// //     const loc = req.body.location;
// //     if (!Array.isArray(loc) || loc.length !== 2)
// //       return res.status(400).json({ msg: "Location must be [lat, lng]" });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     user.location = {
// //       type: "Point",
// //       coordinates: [Number(loc[1]), Number(loc[0])],
// //     };
// //     await user.save({ validateBeforeSave: false });

// //     res.json({ msg: "Location updated", location: user.location });
// //   } catch (err) {
// //     console.error("PUT /location error:", err);
// //     res.status(500).json({ msg: "Server error updating location" });
// //   }
// // });

// // // Push token
// // router.post("/push-token", auth, async (req, res) => {
// //   try {
// //     const { token } = req.body;
// //     if (!token || typeof token !== "string") {
// //       return res.status(400).json({ msg: "Invalid or missing push token." });
// //     }

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.expoPushToken = token;
// //     await user.save();

// //     res.status(200).json({ msg: "Push token saved." });
// //   } catch (err) {
// //     console.error("❌ Error saving push token:", err);
// //     res.status(500).json({ msg: "Failed to save push token." });
// //   }
// // });

// // // Save session
// // router.post("/save-session", auth, async (req, res) => {
// //   try {
// //     const { jobId } = req.body;
// //     if (!jobId) return res.status(400).json({ msg: "Missing jobId." });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.lastActiveJobId = jobId;
// //     await user.save();

// //     res.status(200).json({ msg: "Session saved." });
// //   } catch (err) {
// //     console.error("Error saving session:", err);
// //     res.status(500).json({ msg: "Server error saving session." });
// //   }
// // });

// // // Soft delete
// // router.delete("/delete", auth, async (req, res) => {
// //   try {
// //     const userId = req.user._id || req.user.id;
// //     const { reason } = req.body;
// //     const updatedUser = await Users.findByIdAndUpdate(
// //       userId,
// //       { isDeleted: true, isActive: false, deleteReason: reason || "", deletedAt: new Date() },
// //       { new: true }
// //     );
// //     if (!updatedUser) return res.status(404).json({ msg: "User not found" });

// //     res.json({ msg: "Account successfully marked as deleted" });
// //   } catch (err) {
// //     console.error("❌ Delete user error", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // export default router;


// // import express from "express";
// // import mongoose from "mongoose";
// // import crypto from "crypto";
// // import NodeGeocoder from "node-geocoder";
// // import multer from "multer";

// // import { auth } from "../middlewares/auth.js";
// // import Users from "../models/Users.js";
// // import Job from "../models/Job.js";

// // const router = express.Router();

// // // Geocoder + multer setup (geocoder kept for future use)
// // const geocoder = NodeGeocoder({ provider: "openstreetmap" });
// // const upload = multer({
// //   storage: multer.memoryStorage(),
// //   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// // });

// // // --- helpers ---------------------------------------------------------
// // const algorithm = "aes-256-cbc";
// // const encryptionKey = process.env.ENCRYPTION_KEY;
// // const encryptionIV = process.env.ENCRYPTION_IV;

// // function encrypt(text) {
// //   if (!encryptionKey || !encryptionIV) return text;
// //   const key = Buffer.from(encryptionKey, "hex");
// //   const iv = Buffer.from(encryptionIV, "hex");
// //   const cipher = crypto.createCipheriv(algorithm, key, iv);
// //   let encrypted = cipher.update(text, "utf8", "hex");
// //   return encrypted + cipher.final("hex");
// // }

// // const asBool = (v) =>
// //   v === true || v === 1 || v === "1" || String(v).toLowerCase() === "true";
// // const hasStr = (v) => typeof v === "string" && v.trim().length > 0;

// // // Compute readiness server-side (same rules as app)
// // function evaluateProviderReadiness(me, has) {
// //   const missing = [];

// //   // Stripe
// //   if (!has?.stripeAccountId) missing.push("Stripe onboarding");

// //   if (!hasStr(me?.aboutMe)) missing.push("About Me");
// //   const yearsOk =
// //     Number.isFinite(me?.yearsExperience) ||
// //     (hasStr(me?.yearsExperience) && !isNaN(Number(me?.yearsExperience)));
// //   if (!yearsOk) missing.push("Years of Experience");

// //   if (!hasStr(me?.serviceType)) missing.push("Primary Service");
// //   if (!hasStr(me?.businessName)) missing.push("Business Name");
// //   if (!hasStr(me?.address)) missing.push("Business Address");

// //   const zipFirst = Array.isArray(me?.zipcode) ? me.zipcode[0] : me?.zipcode;
// //   if (!hasStr(zipFirst)) missing.push("Zip Code");

// //   if (!has?.profilePicture) missing.push("Profile Picture");
// //   if (!hasStr(me?.email)) missing.push("Email");
// //   if (!hasStr(me?.phoneNumber)) missing.push("Phone Number");

// //   if (!asBool(me?.optInSms)) missing.push("SMS Consent");

// //   if (!has?.docs?.w9) missing.push("W-9");
// //   if (!has?.docs?.businessLicense) missing.push("Business License");
// //   if (!has?.docs?.proofOfInsurance) missing.push("Proof of Insurance");

// //   const icaViewed =
// //     asBool(me?.acceptedICA) || has?.docs?.independentContractorAgreement;
// //   if (!icaViewed) missing.push("ICA Viewed");
// //   if (!asBool(me?.acceptedICA)) missing.push("ICA Agreed");

// //   return { ok: missing.length === 0, missing };
// // }

// // // Return a SLIM user (no base64 blobs)
// // function toSlimUser(u, overrides = {}) {
// //   if (!u) return {};
// //   const docs = overrides.docs || {};
// //   const hasProfilePicture =
// //     typeof overrides.hasProfilePicture === "boolean"
// //       ? overrides.hasProfilePicture
// //       : false;

// //   // inferred: icaViewed is true if accepted OR ICA doc exists
// //   const icaViewed = !!u.acceptedICA || !!docs.independentContractorAgreement;

// //   return {
// //     _id: u._id,
// //     name: u.name || "",
// //     email: u.email || "",
// //     phoneNumber: u.phoneNumber || "",
// //     role: u.role || "",
// //     trade: u.trade || "",
// //     serviceType: u.serviceType || "",
// //     portfolio: Array.isArray(u.portfolio) ? u.portfolio : [],
// //     zipcode: Array.isArray(u.zipcode) ? u.zipcode : u.zipcode ? [u.zipcode] : [],
// //     serviceZipcode: Array.isArray(u.serviceZipcode) ? u.serviceZipcode : [],
// //     address: u.address || "",
// //     aboutMe: u.aboutMe || "",
// //     yearsExperience:
// //       Number.isFinite(u.yearsExperience) ? u.yearsExperience : u.yearsExperience ?? null,
// //     businessName: u.businessName || "",
// //     billingTier: u.billingTier ?? null,
// //     isActive: !!u.isActive,
// //     optInSms: !!u.optInSms,
// //     acceptedICA: !!u.acceptedICA,
// //     icaViewed,
// //     stripeAccountId: u.stripeAccountId || "",
// //     hasProfilePicture: !!hasProfilePicture,
// //     hasDocs: {
// //       w9: !!docs.w9,
// //       businessLicense: !!docs.businessLicense,
// //       proofOfInsurance: !!docs.proofOfInsurance,
// //       independentContractorAgreement: !!docs.independentContractorAgreement,
// //     },
// //   };
// // }

// // // Existence checks WITHOUT pulling blob data (single aggregation query)
// // async function getDocExistence(uid) {
// //   try {
// //     const [row] = await Users.aggregate([
// //       { $match: { _id: new mongoose.Types.ObjectId(uid) } },
// //       {
// //         $project: {
// //           _id: 0,
// //           profilePicture: {
// //             $gt: [{ $strLenCP: { $ifNull: ["$profilePicture", ""] } }, 0],
// //           },
// //           docs: {
// //             w9: { $gt: [{ $strLenCP: { $ifNull: ["$w9", ""] } }, 0] },
// //             businessLicense: {
// //               $gt: [{ $strLenCP: { $ifNull: ["$businessLicense", ""] } }, 0],
// //             },
// //             proofOfInsurance: {
// //               $gt: [{ $strLenCP: { $ifNull: ["$proofOfInsurance", ""] } }, 0],
// //             },
// //             independentContractorAgreement: {
// //               $gt: [
// //                 { $strLenCP: { $ifNull: ["$independentContractorAgreement", ""] } },
// //                 0,
// //               ],
// //             },
// //           },
// //         },
// //       },
// //     ]);
// //     return (
// //       row || {
// //         profilePicture: false,
// //         docs: {
// //           w9: false,
// //           businessLicense: false,
// //           proofOfInsurance: false,
// //           independentContractorAgreement: false,
// //         },
// //       }
// //     );
// //   } catch (e) {
// //     console.error("⚠️ getDocExistence error:", e?.message);
// //     return {
// //       profilePicture: false,
// //       docs: {
// //         w9: false,
// //         businessLicense: false,
// //         proofOfInsurance: false,
// //         independentContractorAgreement: false,
// //       },
// //     };
// //   }
// // }

// // // --- routes ----------------------------------------------------------

// // /**
// //  * GET /api/users/me
// //  * - Defaults to SLIM (no blobs). To request FULL, send:
// //  *   X-Users-Me-Mode: full  AND  X-Allow-Full-Me: 1
// //  */
// // router.get("/me", auth, async (req, res) => {
// //   const rid = crypto.randomUUID?.() || Math.random().toString(36).slice(2);

// //   let mode = String(
// //     req.get("X-Users-Me-Mode") || req.query.mode || "slim"
// //   ).toLowerCase();
// //   if (mode === "full" && req.get("X-Allow-Full-Me") !== "1") {
// //     mode = "slim";
// //   }

// //   try {
// //     console.log(
// //       `👤 [${rid}] /me start`,
// //       JSON.stringify({ uid: req.user.id, role: req.user.role, mode })
// //     );

// //     // Never select blobs for SLIM mode
// //     const baseFields = [
// //       "name",
// //       "email",
// //       "phoneNumber",
// //       "role",
// //       "trade",
// //       "serviceType",
// //       "portfolio",
// //       "zipcode",
// //       "serviceZipcode",
// //       "address",
// //       "aboutMe",
// //       "yearsExperience",
// //       "businessName",
// //       "billingTier",
// //       "isActive",
// //       "optInSms",
// //       "acceptedICA",
// //       "stripeAccountId",
// //     ];

// //     const fullPlusBlobs = baseFields.concat([
// //       "profilePicture",
// //       "w9",
// //       "businessLicense",
// //       "proofOfInsurance",
// //       "independentContractorAgreement",
// //     ]);

// //     const fieldsToUse = mode === "slim" ? baseFields : fullPlusBlobs;

// //     const user = await Users.findById(req.user.id)
// //       .select(fieldsToUse.join(" "))
// //       .lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.set("Cache-Control", "no-store");

// //     if (mode === "slim") {
// //       // compute existence booleans WITHOUT fetching blobs
// //       const exist = await getDocExistence(req.user.id);
// //       const payload = toSlimUser(user, {
// //         hasProfilePicture: exist.profilePicture,
// //         docs: exist.docs,
// //       });

// //       console.log(`📤 [${rid}] /me SLIM keys=`, Object.keys(payload));
// //       return res.json(payload);
// //     }

// //     // Legacy FULL mode (use sparingly)
// //     const sizes = {
// //       profilePicture: hasStr(user.profilePicture)
// //         ? `${(user.profilePicture.length / 1024).toFixed(2)} KB`
// //         : "0 B",
// //       w9: hasStr(user.w9) ? `${(user.w9.length / 1024).toFixed(2)} KB` : "0 B",
// //       businessLicense: hasStr(user.businessLicense)
// //         ? `${(user.businessLicense.length / 1024).toFixed(2)} KB`
// //         : "0 B",
// //       proofOfInsurance: hasStr(user.proofOfInsurance)
// //         ? `${(user.proofOfInsurance.length / 1024).toFixed(2)} KB`
// //         : "0 B",
// //       independentContractorAgreement: hasStr(user.independentContractorAgreement)
// //         ? `${(user.independentContractorAgreement.length / 1024).toFixed(2)} KB`
// //         : "0 B",
// //     };
// //     console.log(`📦 [${rid}] /me FULL keys=`, Object.keys(user), "sizes=", sizes);
// //     return res.json(user);
// //   } catch (err) {
// //     console.error(`❌ [${rid}] /me error:`, err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * GET /api/users/me/readiness
// //  * Tiny, boolean-only payload to gate providers on login/dashboard.
// //  */
// // router.get("/me/readiness", auth, async (req, res) => {
// //   const rid = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
// //   try {
// //     const user = await Users.findById(req.user.id)
// //       .select(
// //         [
// //           "email",
// //           "phoneNumber",
// //           "role",
// //           "serviceType",
// //           "aboutMe",
// //           "yearsExperience",
// //           "businessName",
// //           "address",
// //           "zipcode",
// //           "optInSms",
// //           "acceptedICA",
// //           "stripeAccountId",
// //         ].join(" ")
// //       )
// //       .lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     const exist = await getDocExistence(req.user.id);
// //     const has = {
// //       docs: exist.docs,
// //       profilePicture: exist.profilePicture,
// //       stripeAccountId: !!user.stripeAccountId,
// //     };

// //     const readiness = evaluateProviderReadiness(user, {
// //       docs: has.docs,
// //       profilePicture: has.profilePicture,
// //       stripeAccountId: has.stripeAccountId,
// //     });

// //     const response = {
// //       role: user.role,
// //       profileComplete: readiness.ok,
// //       stripeComplete: has.stripeAccountId,
// //       providerReady: readiness.ok && has.stripeAccountId,
// //       missing: readiness.missing,
// //     };

// //     console.log(`🧩 [/me/readiness ${rid}]`, response);
// //     return res.json(response);
// //   } catch (err) {
// //     console.error(`❌ [/me/readiness ${rid}] error:`, err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * NEW: GET /api/users/me/stripe-status
// //  * Ultra-light check used at login to decide whether to show onboarding prompt.
// //  * Returns: { role, stripeAccountId, stripeComplete, provider }
// //  */
// // router.get("/me/stripe-status", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(req.user.id)
// //       .select("role stripeAccountId")
// //       .lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     const role = String(user.role || "");
// //     const roleLc = role.toLowerCase();
// //     const provider = roleLc === "serviceprovider" || roleLc === "provider";
// //     const stripeComplete = !!user.stripeAccountId;

// //     return res.json({ role, stripeAccountId: user.stripeAccountId || "", stripeComplete, provider });
// //   } catch (err) {
// //     console.error("GET /me/stripe-status error:", err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // // Active providers
// // router.get("/active-providers", async (req, res) => {
// //   try {
// //     const activeProviders = await Users.find({
// //       role: "serviceProvider",
// //       isOnline: true,
// //       location: { $exists: true },
// //     })
// //       .select("name serviceType location")
// //       .lean();

// //     res.json(
// //       activeProviders.map((pro) => ({
// //         id: pro._id,
// //         name: pro.name,
// //         category: pro.serviceType,
// //         coords: {
// //           latitude: pro.location?.coordinates?.[1],
// //           longitude: pro.location?.coordinates?.[0],
// //         },
// //       }))
// //     );
// //   } catch (err) {
// //     console.error("Failed to fetch active providers:", err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // // Billing info
// // router.get("/billing-info", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(req.user.id)
// //       .select("billingTier isActive")
// //       .lean();
// //     if (!user) return res.status(404).json({ msg: "User not found" });
// //     res.json(user);
// //   } catch (err) {
// //     console.error("Billing info fetch failed:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // // Public user by id (note: returns profilePicture inline)
// // router.get("/:id([0-9a-fA-F]{24})", auth, async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const userId = id === "me" ? req.user.id : id;

// //     const user = await Users.findById(userId).select(
// //       "name email role aboutMe businessName profilePicture averageRating"
// //     );
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json(user);
// //   } catch (err) {
// //     console.error("GET /users/:id error", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // // User documents (explicit fetch only)
// // router.get("/me/documents", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(
// //       req.user.id,
// //       "w9 businessLicense proofOfInsurance independentContractorAgreement"
// //     ).lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json({
// //       w9: user.w9 || null,
// //       businessLicense: user.businessLicense || null,
// //       proofOfInsurance: user.proofOfInsurance || null,
// //       independentContractorAgreement: user.independentContractorAgreement || null,
// //     });
// //   } catch (err) {
// //     console.error("GET /me/documents error:", err);
// //     res.status(500).json({ msg: "Server error fetching documents" });
// //   }
// // });

// // // Provider stats
// // router.get("/me/stats", auth, async (req, res) => {
// //   if (req.user.role !== "serviceProvider")
// //     return res.status(403).json({ msg: "Only service providers have stats" });

// //   const year = parseInt(req.query.year) || new Date().getFullYear();
// //   const providerId = new mongoose.Types.ObjectId(req.user.id);

// //   try {
// //     const stats = await Job.aggregate([
// //       {
// //         $match: {
// //           acceptedProvider: providerId,
// //           status: "completed",
// //           $expr: { $eq: [{ $year: "$createdAt" }, year] },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: null,
// //           completedJobsCount: { $sum: 1 },
// //           totalAmountPaid: { $sum: "$totalAmountPaid" },
// //         },
// //       },
// //     ]);

// //     if (!stats.length) {
// //       return res.json({ completedJobsCount: 0, totalAmountPaid: 0 });
// //     }
// //     const { completedJobsCount, totalAmountPaid } = stats[0];
// //     res.json({ completedJobsCount, totalAmountPaid });
// //   } catch (err) {
// //     console.error("Error fetching provider stats:", err);
// //     res.status(500).json({ msg: "Server error fetching stats" });
// //   }
// // });

// // // Active providers (minimal)
// // // router.get("/providers/active", async (req, res) => {
// // //   try {
// // //     const providers = await Users.find(
// // //       { role: "serviceProvider", isActive: true },
// // //       "name serviceType location.coordinates"
// // //     ).lean();

// // //     const data = providers.map((p) => {
// // //       const [lng, lat] = p.location?.coordinates || [];
// // //       return {
// // //         id: p._id,
// // //         name: p.name,
// // //         serviceType: p.serviceType,
// // //         position: lat != null && lng != null ? [lat, lng] : null,
// // //       };
// // //     });

// // //     res.json(data);
// // //   } catch (err) {
// // //     console.error("GET /providers/active error:", err);
// // //     res.status(500).json({ msg: "Server error" });
// // //   }
// // // });

// // router.get("/providers/active", async (req, res) => {
// //   try {
// //     const providers = await Users.find(
// //       { role: "serviceProvider", isActive: true },
// //       "name serviceType location.coordinates"
// //     ).lean();

// //     const data = providers.map((p) => {
// //       const [lng, lat] = (p.location?.coordinates || []).map(Number);
// //       const valid = Number.isFinite(lat) && Number.isFinite(lng);
// //       const coords = valid ? { latitude: lat, longitude: lng } : null;
// //       return {
// //         id: p._id,
// //         name: p.name,
// //         serviceType: p.serviceType,
// //         // Back-compat shapes ↓↓↓
// //         coords,                        // { latitude, longitude }
// //         position: valid ? [lat, lng] : null, // [lat, lng]
// //         lat: valid ? lat : null,
// //         lng: valid ? lng : null,
// //       };
// //     });

// //     res.json(data);
// //   } catch (err) {
// //     console.error("GET /providers/active error:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * Multipart profile update — responds with SLIM user (no blobs)
// //  */
// // router.put(
// //   "/profile",
// //   auth,
// //   upload.fields([
// //     { name: "w9", maxCount: 1 },
// //     { name: "businessLicense", maxCount: 1 },
// //     { name: "proofOfInsurance", maxCount: 1 },
// //     { name: "independentContractorAgreement", maxCount: 1 },
// //     { name: "profilePicture", maxCount: 1 },
// //   ]),
// //   async (req, res) => {
// //     try {
// //       const user = await Users.findById(req.user.id);
// //       if (!user) return res.status(404).json({ msg: "User not found" });

// //       // text fields (coerce a few booleans)
// //       for (const [key, value] of Object.entries(req.body)) {
// //         if (value === undefined || value === "") continue;
// //         if (key === "acceptedICA") user.acceptedICA = asBool(value);
// //         else if (key === "optInSms") user.optInSms = asBool(value);
// //         else if (key === "email") user.email = String(value).toLowerCase();
// //         else user[key] = value;
// //       }

// //       // files
// //       const f = req.files || {};
// //       if (f.profilePicture?.[0]) {
// //         const { buffer, mimetype } = f.profilePicture[0];
// //         user.profilePicture = `data:${mimetype};base64,${buffer.toString("base64")}`;
// //       }
// //       if (f.w9?.[0]) user.w9 = f.w9[0].buffer.toString("base64");
// //       if (f.businessLicense?.[0])
// //         user.businessLicense = f.businessLicense[0].buffer.toString("base64");
// //       if (f.proofOfInsurance?.[0])
// //         user.proofOfInsurance = f.proofOfInsurance[0].buffer.toString("base64");
// //       if (f.independentContractorAgreement?.[0])
// //         user.independentContractorAgreement =
// //           f.independentContractorAgreement[0].buffer.toString("base64");

// //       await user.save({ validateBeforeSave: false });

// //       // respond SLIM to avoid crashing client
// //       const payload = toSlimUser(user.toObject(), {
// //         hasProfilePicture: !!user.profilePicture,
// //         docs: {
// //           w9: !!user.w9,
// //           businessLicense: !!user.businessLicense,
// //           proofOfInsurance: !!user.proofOfInsurance,
// //           independentContractorAgreement: !!user.independentContractorAgreement,
// //         },
// //       });

// //       console.log("✅ PUT /profile -> SLIM response");
// //       return res.json({ msg: "Profile updated", user: payload });
// //     } catch (err) {
// //       console.error("PUT /profile error:", err);
// //       if (err instanceof multer.MulterError) {
// //         return res.status(400).json({ msg: `MulterError: ${err.message}` });
// //       }
// //       return res.status(500).json({ msg: "Server error updating profile" });
// //     }
// //   }
// // );

// // // JSON-only profile patch — also returns SLIM
// // router.patch("/profile", auth, async (req, res) => {
// //   try {
// //     const b = req.body || {};
// //     const updates = {};
// //     if (typeof b.optInSms !== "undefined") updates.optInSms = asBool(b.optInSms);
// //     if (typeof b.acceptedICA !== "undefined") updates.acceptedICA = asBool(b.acceptedICA);
// //     if (typeof b.independentContractorAgreement !== "undefined")
// //       updates.independentContractorAgreement = String(b.independentContractorAgreement || "");
// //     if (b.email) updates.email = String(b.email).toLowerCase();
// //     if (b.phoneNumber) updates.phoneNumber = String(b.phoneNumber);

// //     const user = await Users.findByIdAndUpdate(req.user.id, updates, {
// //       new: true,
// //       lean: true,
// //     });
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     const exist = await getDocExistence(req.user.id);
// //     const payload = toSlimUser(user, {
// //       hasProfilePicture: exist.profilePicture,
// //       docs: exist.docs,
// //     });
// //     return res.json({ user: payload });
// //   } catch (err) {
// //     console.error("PATCH /profile error:", err);
// //     return res.status(500).json({ msg: "Server error updating profile" });
// //   }
// // });

// // // Location (safe save)
// // router.put("/location", auth, async (req, res) => {
// //   try {
// //     const loc = req.body.location;
// //     if (!Array.isArray(loc) || loc.length !== 2)
// //       return res.status(400).json({ msg: "Location must be [lat, lng]" });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     user.location = {
// //       type: "Point",
// //       coordinates: [Number(loc[1]), Number(loc[0])],
// //     };
// //     await user.save({ validateBeforeSave: false });

// //     res.json({ msg: "Location updated", location: user.location });
// //   } catch (err) {
// //     console.error("PUT /location error:", err);
// //     res.status(500).json({ msg: "Server error updating location" });
// //   }
// // });

// // // Push token
// // router.post("/push-token", auth, async (req, res) => {
// //   try {
// //     const { token } = req.body;
// //     if (!token || typeof token !== "string") {
// //       return res.status(400).json({ msg: "Invalid or missing push token." });
// //     }

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.expoPushToken = token;
// //     await user.save();

// //     res.status(200).json({ msg: "Push token saved." });
// //   } catch (err) {
// //     console.error("❌ Error saving push token:", err);
// //     res.status(500).json({ msg: "Failed to save push token." });
// //   }
// // });

// // // Save session
// // router.post("/save-session", auth, async (req, res) => {
// //   try {
// //     const { jobId } = req.body;
// //     if (!jobId) return res.status(400).json({ msg: "Missing jobId." });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.lastActiveJobId = jobId;
// //     await user.save();

// //     res.status(200).json({ msg: "Session saved." });
// //   } catch (err) {
// //     console.error("Error saving session:", err);
// //     res.status(500).json({ msg: "Server error saving session." });
// //   }
// // });

// // // Soft delete
// // router.delete("/delete", auth, async (req, res) => {
// //   try {
// //     const userId = req.user._id || req.user.id;
// //     const { reason } = req.body;
// //     const updatedUser = await Users.findByIdAndUpdate(
// //       userId,
// //       { isDeleted: true, isActive: false, deleteReason: reason || "", deletedAt: new Date() },
// //       { new: true }
// //     );
// //     if (!updatedUser) return res.status(404).json({ msg: "User not found" });

// //     res.json({ msg: "Account successfully marked as deleted" });
// //   } catch (err) {
// //     console.error("❌ Delete user error", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // export default router;


// // // backend/routes/users.js
// // import express from "express";
// // import mongoose from "mongoose";
// // import crypto from "crypto";
// // import NodeGeocoder from "node-geocoder";
// // import multer from "multer";

// // import { auth } from "../middlewares/auth.js";
// // import Users from "../models/Users.js";
// // import Job from "../models/Job.js";

// // const router = express.Router();

// // // ---------- utils / setup ----------
// // const geocoder = NodeGeocoder({ provider: "openstreetmap" });
// // const upload = multer({
// //   storage: multer.memoryStorage(),
// //   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// // });

// // const ridFromReq = (req) =>
// //   req.headers["x-request-id"] ||
// //   (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

// // const memSnap = () => {
// //   const m = process.memoryUsage();
// //   const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;
// //   return {
// //     rss: mb(m.rss),
// //     heapUsed: mb(m.heapUsed),
// //     heapTotal: mb(m.heapTotal),
// //     ext: mb(m.external || 0),
// //   };
// // };

// // const bool = (v) =>
// //   v === true ||
// //   v === "true" ||
// //   v === 1 ||
// //   v === "1" ||
// //   v === "yes" ||
// //   v === "on";

// // // ---------- Slim /me via aggregation (no base64 blobs) ----------
// // /**
// //  * Returns a slim user object:
// //  * - primitives needed by the app
// //  * - booleans for docs/profilePicture (hasDocs, hasProfilePicture)
// //  * - never returns base64 blobs
// //  */
// // async function getSlimUserById(userId) {
// //   const _id = new mongoose.Types.ObjectId(userId);
// //   const [doc] = await Users.aggregate([
// //     { $match: { _id } },
// //     {
// //       $project: {
// //         // identity & contact
// //         _id: 1,
// //         name: 1,
// //         role: 1,
// //         email: 1,
// //         phoneNumber: 1,

// //         // business/profile
// //         businessName: 1,
// //         address: 1,
// //         zipcode: 1,
// //         serviceZipcode: 1,
// //         aboutMe: 1,
// //         yearsExperience: 1,
// //         serviceType: 1,
// //         trade: 1,
// //         portfolio: 1,
// //         isActive: 1,

// //         // billing
// //         billingTier: 1,
// //         stripeAccountId: 1,

// //         // flags (booleans only)
// //         optInSms: { $cond: [{ $eq: ["$optInSms", true] }, true, false] },
// //         acceptedICA: { $cond: [{ $eq: ["$acceptedICA", true] }, true, false] },

// //         // "has*" booleans derived from string lengths (never return the strings)
// //         hasProfilePicture: {
// //           $gt: [{ $strLenBytes: { $ifNull: ["$profilePicture", ""] } }, 0],
// //         },
// //         "hasDocs.w9": {
// //           $gt: [{ $strLenBytes: { $ifNull: ["$w9", ""] } }, 0],
// //         },
// //         "hasDocs.businessLicense": {
// //           $gt: [{ $strLenBytes: { $ifNull: ["$businessLicense", ""] } }, 0],
// //         },
// //         "hasDocs.proofOfInsurance": {
// //           $gt: [{ $strLenBytes: { $ifNull: ["$proofOfInsurance", ""] } }, 0],
// //         },
// //         "hasDocs.independentContractorAgreement": {
// //           $gt: [
// //             { $strLenBytes: { $ifNull: ["$independentContractorAgreement", ""] } },
// //             0,
// //           ],
// //         },
// //       },
// //     },
// //     {
// //       $addFields: {
// //         icaViewed: {
// //           $or: [
// //             "$acceptedICA",
// //             { $gt: [{ $strLenBytes: { $ifNull: ["$independentContractorAgreement", ""] } }, 0] },
// //           ],
// //         },
// //       },
// //     },
// //     {
// //       $project: {
// //         // ensure only the fields above are returned
// //         independentContractorAgreement: 0,
// //       },
// //     },
// //   ]);

// //   return doc || null;
// // }

// // // ---------- Readiness aggregation (boolean-only, tiny) ----------
// // async function getReadinessForUserId(userId) {
// //   const _id = new mongoose.Types.ObjectId(userId);

// //   const [doc] = await Users.aggregate([
// //     { $match: { _id } },
// //     {
// //       $project: {
// //         role: 1,
// //         stripeAccountId: 1,

// //         email: { $gt: [{ $strLenBytes: { $ifNull: ["$email", ""] } }, 0] },
// //         phoneNumber: { $gt: [{ $strLenBytes: { $ifNull: ["$phoneNumber", ""] } }, 0] },
// //         aboutMe: { $gt: [{ $strLenBytes: { $ifNull: ["$aboutMe", ""] } }, 0] },
// //         yearsExperience: { $gt: [{ $ifNull: ["$yearsExperience", 0] }, 0] },
// //         serviceType: { $gt: [{ $strLenBytes: { $ifNull: ["$serviceType", ""] } }, 0] },
// //         businessName: { $gt: [{ $strLenBytes: { $ifNull: ["$businessName", ""] } }, 0] },
// //         address: { $gt: [{ $strLenBytes: { $ifNull: ["$address", ""] } }, 0] },
// //         zipcodeFirst: { $ifNull: [{ $arrayElemAt: ["$zipcode", 0] }, "" ] },
// //         optInSms: { $cond: [{ $eq: ["$optInSms", true] }, true, false] },
// //         acceptedICA: { $cond: [{ $eq: ["$acceptedICA", true] }, true, false] },

// //         hasW9: { $gt: [{ $strLenBytes: { $ifNull: ["$w9", ""] } }, 0] },
// //         hasBusinessLicense: { $gt: [{ $strLenBytes: { $ifNull: ["$businessLicense", ""] } }, 0] },
// //         hasPOI: { $gt: [{ $strLenBytes: { $ifNull: ["$proofOfInsurance", ""] } }, 0] },
// //         hasICAString: {
// //           $gt: [{ $strLenBytes: { $ifNull: ["$independentContractorAgreement", ""] } }, 0],
// //         },
// //         hasProfilePicture: { $gt: [{ $strLenBytes: { $ifNull: ["$profilePicture", ""] } }, 0] },
// //       },
// //     },
// //     {
// //       $addFields: {
// //         zipcode: { $gt: [{ $strLenBytes: "$zipcodeFirst" }, 0] },
// //       },
// //     },
// //     {
// //       $project: {
// //         role: 1,
// //         stripeAccountId: 1,
// //         flags: {
// //           email: "$email",
// //           phoneNumber: "$phoneNumber",
// //           aboutMe: "$aboutMe",
// //           yearsExperience: "$yearsExperience",
// //           serviceType: "$serviceType",
// //           businessName: "$businessName",
// //           address: "$address",
// //           zipcode: "$zipcode",
// //           optInSms: "$optInSms",
// //           acceptedICA: "$acceptedICA",
// //           hasProfilePicture: "$hasProfilePicture",
// //           hasDocs: {
// //             w9: "$hasW9",
// //             businessLicense: "$hasBusinessLicense",
// //             proofOfInsurance: "$hasPOI",
// //             icaString: "$hasICAString",
// //           },
// //         },
// //       },
// //     },
// //   ]);

// //   if (!doc) return null;

// //   const f = doc.flags || {};
// //   const required = [
// //     ["About Me", f.aboutMe],
// //     ["Years of Experience", f.yearsExperience],
// //     ["Primary Service", f.serviceType],
// //     ["Business Name", f.businessName],
// //     ["Business Address", f.address],
// //     ["Zip Code", f.zipcode],
// //     ["Profile Picture", f.hasProfilePicture],
// //     ["Email", f.email],
// //     ["Phone Number", f.phoneNumber],
// //     ["SMS Consent", f.optInSms],
// //     ["W-9", f.hasDocs?.w9],
// //     ["Business License", f.hasDocs?.businessLicense],
// //     ["Proof of Insurance", f.hasDocs?.proofOfInsurance],
// //     ["ICA Viewed", f.hasDocs?.icaString || f.acceptedICA],
// //     ["ICA Agreed", f.acceptedICA],
// //   ];

// //   const missing = required.filter(([_, ok]) => !ok).map(([label]) => label);
// //   const profileComplete = missing.length === 0;
// //   const stripeComplete = !!doc.stripeAccountId;

// //   return {
// //     role: doc.role,
// //     hasStripeAccountId: !!doc.stripeAccountId,
// //     profileComplete,
// //     stripeComplete,
// //     flags: f,
// //     missing,
// //   };
// // }

// // // ---------- Routes ----------

// // // Tiny readiness route (boolean-only)
// // router.get("/me/readiness", auth, async (req, res) => {
// //   const rid = ridFromReq(req);
// //   const verbose = req.query.verbose === "1";
// //   try {
// //     console.log(`🧪 [${rid}] GET /users/me/readiness start`, { uid: req.user.id, mem: memSnap() });
// //     const r = await getReadinessForUserId(req.user.id);
// //     if (!r) return res.status(404).json({ msg: "User not found" });

// //     const payload = {
// //       profileComplete: r.profileComplete,
// //       stripeComplete: r.stripeComplete,
// //     };
// //     if (verbose) {
// //       payload.missing = r.missing;
// //       payload.flags = r.flags;
// //       payload.role = r.role;
// //       payload.hasStripeAccountId = r.hasStripeAccountId;
// //     }

// //     console.log(`🧪 [${rid}] /me/readiness result`, payload, { mem: memSnap() });
// //     res.json(payload);
// //   } catch (err) {
// //     console.error(`💥 [${rid}] GET /users/me/readiness error:`, err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // // Slim /me (no blobs)
// // router.get("/me", auth, async (req, res) => {
// //   const rid = ridFromReq(req);
// //   try {
// //     console.log(`➡️  [${rid}] GET /api/users/me`, { ip: req.ip, ua: req.headers["user-agent"], mem: memSnap() });
// //     const t0 = Date.now();
// //     const user = await getSlimUserById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     const resp = user; // already slim
// //     const bytes = Buffer.byteLength(JSON.stringify(resp));
// //     console.log(`📤 [${rid}] /users/me slim response ~${(bytes / 1024).toFixed(2)} KB, dur=${Date.now() - t0}ms, mem=`, memSnap());
// //     res.json(resp);
// //   } catch (err) {
// //     console.error(`GET /me error [${rid}]:`, err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // router.get("/me/profile-picture", auth, async (req, res) => {
// //   try {
// //     const u = await Users.findById(req.user.id).select("profilePicture").lean();
// //     return res.json({ profilePicture: u?.profilePicture || null });
// //   } catch (e) {
// //     console.error("GET /me/profile-picture error:", e);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // // Active providers (unchanged)
// // router.get("/active-providers", async (req, res) => {
// //   try {
// //     const activeProviders = await Users.find({
// //       role: "serviceProvider",
// //       isOnline: true,
// //       location: { $exists: true },
// //     }).select("name serviceType location");

// //     res.json(
// //       activeProviders.map((pro) => ({
// //         id: pro._id,
// //         name: pro.name,
// //         category: pro.serviceType,
// //         coords: {
// //           latitude: pro.location?.coordinates?.[1],
// //           longitude: pro.location?.coordinates?.[0],
// //         },
// //       }))
// //     );
// //   } catch (err) {
// //     console.error("Failed to fetch active providers:", err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // // Billing info (unchanged)
// // router.get("/billing-info", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(req.user.id).select("billingTier isActive").lean();
// //     if (!user) return res.status(404).json({ msg: "User not found" });
// //     res.json(user);
// //   } catch (err) {
// //     console.error("Billing info fetch failed:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // // Minimal public user by id (no blobs)
// // router.get("/:id([0-9a-fA-F]{24})", auth, async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const userId = id === "me" ? req.user.id : id;
// //     const user = await Users.findById(userId)
// //       .select("name email role aboutMe businessName profilePicture averageRating")
// //       .lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     // send hasProfilePicture boolean, not the data URL
// //     const hasProfilePicture = !!(user.profilePicture && user.profilePicture.length);
// //     const { profilePicture, ...rest } = user;
// //     res.json({ ...rest, hasProfilePicture });
// //   } catch (err) {
// //     console.error("GET /users/:id error", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // // Documents (when explicitly requested)
// // router.get("/me/documents", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(
// //       req.user.id,
// //       "w9 businessLicense proofOfInsurance independentContractorAgreement"
// //     ).lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json({
// //       w9: user.w9 || null,
// //       businessLicense: user.businessLicense || null,
// //       proofOfInsurance: user.proofOfInsurance || null,
// //       independentContractorAgreement: user.independentContractorAgreement || null,
// //     });
// //   } catch (err) {
// //     console.error("GET /me/documents error:", err);
// //     res.status(500).json({ msg: "Server error fetching documents" });
// //   }
// // });

// // // Provider stats (unchanged)
// // router.get("/me/stats", auth, async (req, res) => {
// //   if (req.user.role !== "serviceProvider")
// //     return res.status(403).json({ msg: "Only service providers have stats" });

// //   const year = parseInt(req.query.year) || new Date().getFullYear();
// //   const providerId = new mongoose.Types.ObjectId(req.user.id);

// //   try {
// //     const stats = await Job.aggregate([
// //       {
// //         $match: {
// //           acceptedProvider: providerId,
// //           status: "completed",
// //           $expr: { $eq: [{ $year: "$createdAt" }, year] },
// //         },
// //       },
// //       { $group: { _id: null, completedJobsCount: { $sum: 1 }, totalAmountPaid: { $sum: "$totalAmountPaid" } } },
// //     ]);

// //     if (!stats.length) return res.json({ completedJobsCount: 0, totalAmountPaid: 0 });
// //     const { completedJobsCount, totalAmountPaid } = stats[0];
// //     res.json({ completedJobsCount, totalAmountPaid });
// //   } catch (err) {
// //     console.error("Error fetching provider stats:", err);
// //     res.status(500).json({ msg: "Server error fetching stats" });
// //   }
// // });

// // // Active providers (map) (unchanged)
// // router.get("/providers/active", async (req, res) => {
// //   try {
// //     const providers = await Users.find(
// //       { role: "serviceProvider", isActive: true },
// //       "name serviceType location.coordinates"
// //     ).lean();

// //     const data = providers.map((p) => {
// //       const [lng, lat] = p.location?.coordinates || [];
// //       return {
// //         id: p._id,
// //         name: p.name,
// //         serviceType: p.serviceType,
// //         position: lat != null && lng != null ? [lat, lng] : null,
// //       };
// //     });

// //     res.json(data);
// //   } catch (err) {
// //     console.error("GET /providers/active error:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // // Multipart profile update — returns only readiness + slim user
// // router.put(
// //   "/profile",
// //   auth,
// //   upload.fields([
// //     { name: "w9", maxCount: 1 },
// //     { name: "businessLicense", maxCount: 1 },
// //     { name: "proofOfInsurance", maxCount: 1 },
// //     { name: "independentContractorAgreement", maxCount: 1 },
// //     { name: "profilePicture", maxCount: 1 },
// //   ]),
// //   async (req, res) => {
// //     const rid = ridFromReq(req);
// //     try {
// //       const user = await Users.findById(req.user.id);
// //       if (!user) return res.status(404).json({ msg: "User not found" });

// //       // text fields (coerce booleans + normalize)
// //       for (const [key, valueRaw] of Object.entries(req.body || {})) {
// //         if (valueRaw === undefined || valueRaw === "") continue;
// //         const value = valueRaw;

// //         if (key === "acceptedICA") user.acceptedICA = bool(value);
// //         else if (key === "optInSms" || key === "optInSMS" || key === "acceptSMS") user.optInSms = bool(value);
// //         else if (key === "email") user.email = String(value).toLowerCase();
// //         else if (key === "phoneNumber") user.phoneNumber = String(value);
// //         else if (key === "zipcode") user.zipcode = Array.isArray(value) ? value.map(String) : [String(value)];
// //         else if (key === "serviceZipcode")
// //           user.serviceZipcode = Array.isArray(value) ? value.map(String) : [String(value)];
// //         else if (key === "yearsExperience") {
// //           const n = Number(value);
// //           if (Number.isFinite(n)) user.yearsExperience = n;
// //         } else {
// //           user[key] = value;
// //         }
// //       }

// //       // files
// //       const f = req.files || {};
// //       const sizes = {};
// //       if (f.profilePicture?.[0]) {
// //         const { buffer, mimetype } = f.profilePicture[0];
// //         sizes.profilePicture = buffer.length;
// //         user.profilePicture = `data:${mimetype};base64,${buffer.toString("base64")}`;
// //       }
// //       if (f.w9?.[0]) {
// //         sizes.w9 = f.w9[0].buffer.length;
// //         user.w9 = f.w9[0].buffer.toString("base64");
// //       }
// //       if (f.businessLicense?.[0]) {
// //         sizes.businessLicense = f.businessLicense[0].buffer.length;
// //         user.businessLicense = f.businessLicense[0].buffer.toString("base64");
// //       }
// //       if (f.proofOfInsurance?.[0]) {
// //         sizes.proofOfInsurance = f.proofOfInsurance[0].buffer.length;
// //         user.proofOfInsurance = f.proofOfInsurance[0].buffer.toString("base64");
// //       }
// //       if (f.independentContractorAgreement?.[0]) {
// //         sizes.independentContractorAgreement = f.independentContractorAgreement[0].buffer.length;
// //         user.independentContractorAgreement = f.independentContractorAgreement[0].buffer.toString("base64");
// //       }

// //       await user.save({ validateBeforeSave: false });

// //       // respond with tiny payloads only
// //       const [slim, readiness] = await Promise.all([
// //         getSlimUserById(req.user.id),
// //         getReadinessForUserId(req.user.id),
// //       ]);

// //       const bytes = Buffer.byteLength(JSON.stringify({ ok: true, readiness, slimUser: slim }));
// //       console.log(`✅ [${rid}] PUT /users/profile updated`, {
// //         updatedKeys: Object.keys(req.body || {}),
// //         fileSizes: sizes,
// //         respKB: `${(bytes / 1024).toFixed(2)} KB`,
// //         mem: memSnap(),
// //       });

// //       return res.json({
// //         ok: true,
// //         readiness: {
// //           profileComplete: readiness?.profileComplete ?? false,
// //           stripeComplete: readiness?.stripeComplete ?? false,
// //         },
// //         slimUser: slim, // always blob-free
// //       });
// //     } catch (err) {
// //       console.error("PUT /profile error:", err);
// //       if (err instanceof multer.MulterError) {
// //         return res.status(400).json({ msg: `MulterError: ${err.message}` });
// //       }
// //       return res.status(500).json({ msg: "Server error updating profile" });
// //     }
// //   }
// // );

// // // JSON-only profile patch — returns slim + readiness
// // async function patchProfileHandler(req, res) {
// //   const rid = ridFromReq(req);
// //   try {
// //     const updates = {};
// //     const b = req.body || {};

// //     if (typeof b.optInSms !== "undefined" || typeof b.optInSMS !== "undefined" || typeof b.acceptSMS !== "undefined") {
// //       updates.optInSms = bool(b.optInSms ?? b.optInSMS ?? b.acceptSMS);
// //     }
// //     if (typeof b.acceptedICA !== "undefined") updates.acceptedICA = bool(b.acceptedICA);
// //     if (typeof b.independentContractorAgreement !== "undefined")
// //       updates.independentContractorAgreement = String(b.independentContractorAgreement || "");
// //     if (b.email) updates.email = String(b.email).toLowerCase();
// //     if (b.phoneNumber) updates.phoneNumber = String(b.phoneNumber);

// //     await Users.findByIdAndUpdate(req.user.id, updates, { new: false });

// //     const [slim, readiness] = await Promise.all([
// //       getSlimUserById(req.user.id),
// //       getReadinessForUserId(req.user.id),
// //     ]);

// //     const bytes = Buffer.byteLength(JSON.stringify({ slimUser: slim, readiness }));
// //     console.log(`🛠️ [${rid}] PATCH /users/profile`, {
// //       updates: Object.keys(updates),
// //       respKB: `${(bytes / 1024).toFixed(2)} KB`,
// //       mem: memSnap(),
// //     });

// //     return res.json({
// //       ok: true,
// //       readiness: {
// //         profileComplete: readiness?.profileComplete ?? false,
// //         stripeComplete: readiness?.stripeComplete ?? false,
// //       },
// //       slimUser: slim,
// //     });
// //   } catch (err) {
// //     console.error("PATCH /profile error:", err);
// //     return res.status(500).json({ msg: "Server error updating profile" });
// //   }
// // }

// // router.patch("/profile", auth, patchProfileHandler);
// // // legacy alias (if FE calls /users/profile)
// // router.patch("/users/profile", auth, patchProfileHandler);

// // // Location (unchanged)
// // router.put("/location", auth, async (req, res) => {
// //   try {
// //     const loc = req.body.location;
// //     if (!Array.isArray(loc) || loc.length !== 2)
// //       return res.status(400).json({ msg: "Location must be [lat, lng]" });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     user.location = {
// //       type: "Point",
// //       coordinates: [Number(loc[1]), Number(loc[0])],
// //     };
// //     await user.save({ validateBeforeSave: false });

// //     res.json({ msg: "Location updated", location: user.location });
// //   } catch (err) {
// //     console.error("PUT /location error:", err);
// //     res.status(500).json({ msg: "Server error updating location" });
// //   }
// // });

// // // Push token (unchanged)
// // router.post("/push-token", auth, async (req, res) => {
// //   try {
// //     const { token } = req.body;
// //     if (!token || typeof token !== "string") {
// //       return res.status(400).json({ msg: "Invalid or missing push token." });
// //     }

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.expoPushToken = token;
// //     await user.save();

// //     res.status(200).json({ msg: "Push token saved." });
// //   } catch (err) {
// //     console.error("❌ Error saving push token:", err);
// //     res.status(500).json({ msg: "Failed to save push token." });
// //   }
// // });

// // // Save session (unchanged)
// // router.post("/save-session", auth, async (req, res) => {
// //   try {
// //     const { jobId } = req.body;
// //     if (!jobId) return res.status(400).json({ msg: "Missing jobId." });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.lastActiveJobId = jobId;
// //     await user.save();

// //     res.status(200).json({ msg: "Session saved." });
// //   } catch (err) {
// //     console.error("Error saving session:", err);
// //     res.status(500).json({ msg: "Server error saving session." });
// //   }
// // });

// // // Soft delete (unchanged)
// // router.delete("/delete", auth, async (req, res) => {
// //   try {
// //     const userId = req.user._id || req.user.id;
// //     const { reason } = req.body;
// //     const updatedUser = await Users.findByIdAndUpdate(
// //       userId,
// //       {
// //         isDeleted: true,
// //         isActive: false,
// //         deleteReason: reason || "",
// //         deletedAt: new Date(),
// //       },
// //       { new: true }
// //     );

// //     if (!updatedUser) {
// //       return res.status(404).json({ msg: "User not found" });
// //     }

// //     res.json({ msg: "Account successfully marked as deleted" });
// //   } catch (err) {
// //     console.error("❌ Delete user error", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // export default router;


// // import express from "express";
// // import mongoose from "mongoose";
// // import crypto from "crypto";
// // import NodeGeocoder from "node-geocoder";
// // import multer from "multer";

// // import { auth } from "../middlewares/auth.js";
// // import Users from "../models/Users.js";
// // import Job from "../models/Job.js";

// // const router = express.Router();

// // /* -------------------- diagnostics helpers -------------------- */

// // const rid = () =>
// //   (crypto.randomUUID && crypto.randomUUID()) ||
// //   Math.random().toString(36).slice(2);

// // const short = (v, n = 64) =>
// //   typeof v === "string" ? (v.length > n ? `${v.slice(0, n)}…(${v.length})` : v) : v;

// // const bytes = (n) => {
// //   if (!Number.isFinite(n)) return "0B";
// //   const k = 1024;
// //   const units = ["B", "KB", "MB", "GB"];
// //   let i = 0;
// //   let v = n;
// //   while (v >= k && i < units.length - 1) {
// //     v /= k;
// //     i++;
// //   }
// //   return `${v.toFixed(2)} ${units[i]}`;
// // };

// // const lenOf = (s) => (typeof s === "string" ? Buffer.byteLength(s) : 0);

// // const maskEmail = (e = "") => {
// //   const at = e.indexOf("@");
// //   if (at <= 1) return "***";
// //   return `${e.slice(0, 2)}***${e.slice(at - 1)}`;
// // };
// // const maskPhone = (p = "") => (p ? `***${p.slice(-4)}` : "");

// // const mem = () => {
// //   const m = process.memoryUsage();
// //   return {
// //     rss: bytes(m.rss),
// //     heapUsed: bytes(m.heapUsed),
// //     heapTotal: bytes(m.heapTotal),
// //     ext: bytes(m.external),
// //   };
// // };

// // // register global crash handlers only once
// // if (!global.__USERS_ROUTES_CRASH_HOOKS__) {
// //   process.on("unhandledRejection", (e) => {
// //     console.error("💥 [users routes] UnhandledRejection:", e?.message, e);
// //   });
// //   process.on("uncaughtException", (e) => {
// //     console.error("💥 [users routes] UncaughtException:", e?.message, e);
// //   });
// //   global.__USERS_ROUTES_CRASH_HOOKS__ = true;
// // }

// // /* ------------ per-request logging & response size hook ----------- */
// // router.use((req, res, next) => {
// //   req._rid = rid();
// //   res.setHeader("x-request-id", req._rid);

// //   const started = Date.now();
// //   const hdrLen = Object.keys(req.headers || {}).length;
// //   console.log(
// //     `➡️  [${req._rid}] ${req.method} ${req.originalUrl} ` +
// //       JSON.stringify({
// //         ip: req.ip,
// //         ua: req.headers["user-agent"],
// //         hdrs: hdrLen,
// //         ct: req.headers["content-type"],
// //         cl: req.headers["content-length"],
// //         mem: mem(),
// //       })
// //   );

// //   // wrap res.json to measure payload size
// //   const _json = res.json.bind(res);
// //   res.json = (body) => {
// //     try {
// //       const size = Buffer.byteLength(JSON.stringify(body ?? {}));
// //       console.log(
// //         `📤 [${req._rid}] ${req.method} ${req.originalUrl} response ~${bytes(
// //           size
// //         )}, dur=${Date.now() - started}ms, mem=`,
// //         mem()
// //       );
// //     } catch (e) {
// //       console.log(`📤 [${req._rid}] res.json size calc error:`, e?.message);
// //     }
// //     return _json(body);
// //   };

// //   res.on("close", () => {
// //     if (!res.headersSent) {
// //       console.log(
// //         `⚠️  [${req._rid}] connection closed before headers; dur=${Date.now() - started}ms`
// //       );
// //     }
// //   });

// //   next();
// // });

// // /* ---------------- geocoder + multer ---------------- */
// // const geocoder = NodeGeocoder({ provider: "openstreetmap" });
// // const upload = multer({
// //   storage: multer.memoryStorage(),
// //   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// // });

// // /* ---------------- Encryption helper (if used elsewhere) ---------------- */
// // const algorithm = "aes-256-cbc";
// // const encryptionKey = process.env.ENCRYPTION_KEY;
// // const encryptionIV = process.env.ENCRYPTION_IV;

// // function encrypt(text) {
// //   if (!encryptionKey || !encryptionIV) return text;
// //   const key = Buffer.from(encryptionKey, "hex");
// //   const iv = Buffer.from(encryptionIV, "hex");
// //   const cipher = crypto.createCipheriv(algorithm, key, iv);
// //   let encrypted = cipher.update(text, "utf8", "hex");
// //   return encrypted + cipher.final("hex");
// // }

// // /* ---------------- GET /api/users/me ---------------- */
// // router.get("/me", auth, async (req, res) => {
// //   const t0 = Date.now();
// //   try {
// //     console.log(
// //       `👤 [${req._rid}] /me start`,
// //       JSON.stringify({
// //         uid: req.user?.id,
// //         role: req.user?.role,
// //         mem: mem(),
// //       })
// //     );

// //     const fields = [
// //       "name",
// //       "role",
// //       "trade",
// //       "serviceType",
// //       "portfolio",
// //       "serviceZipcode",
// //       "billingTier",
// //       "zipcode",
// //       "address",
// //       "aboutMe",
// //       "yearsExperience",
// //       "serviceCost",
// //       "businessName",
// //       "profilePicture",
// //       // blobs are included in your current version — we’ll log their sizes explicitly:
// //       "w9",
// //       "businessLicense",
// //       "proofOfInsurance",
// //       "independentContractorAgreement",
// //       "isActive",
// //       // (email/phone/flags were missing previously — add them if you want to hydrate UI immediately)
// //       "email",
// //       "phoneNumber",
// //       "optInSms",
// //       "acceptedICA",
// //       "stripeAccountId",
// //     ].join(" ");

// //     console.time(`⏱ [${req._rid}] findUser(me)`);
// //     const user = await Users.findById(req.user.id, fields).lean();
// //     console.timeEnd(`⏱ [${req._rid}] findUser(me)`);

// //     if (!user) {
// //       console.log(`❌ [${req._rid}] /me not found`);
// //       return res.status(404).json({ msg: "User not found" });
// //     }

// //     const sizes = {
// //       profilePictureB: lenOf(user.profilePicture),
// //       w9B: lenOf(user.w9),
// //       businessLicenseB: lenOf(user.businessLicense),
// //       proofOfInsuranceB: lenOf(user.proofOfInsurance),
// //       icaB: lenOf(user.independentContractorAgreement),
// //     };

// //     console.log(
// //       `📦 [${req._rid}] /me payload fields`,
// //       JSON.stringify({
// //         keys: Object.keys(user),
// //         email: maskEmail(user.email),
// //         phone: maskPhone(user.phoneNumber),
// //         optInSms: !!user.optInSms,
// //         acceptedICA: !!user.acceptedICA,
// //         hasStripe: !!user.stripeAccountId,
// //         sizes: {
// //           profilePicture: bytes(sizes.profilePictureB),
// //           w9: bytes(sizes.w9B),
// //           businessLicense: bytes(sizes.businessLicenseB),
// //           proofOfInsurance: bytes(sizes.proofOfInsuranceB),
// //           independentContractorAgreement: bytes(sizes.icaB),
// //         },
// //         mem: mem(),
// //         tookMs: Date.now() - t0,
// //       })
// //     );

// //     return res.json(user);
// //   } catch (err) {
// //     console.error(`💥 [${req._rid}] GET /me error:`, err?.message, err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /* -------------- GET /api/users/active-providers -------------- */
// // router.get("/active-providers", async (req, res) => {
// //   const t0 = Date.now();
// //   try {
// //     console.time(`⏱ [${req._rid}] active-providers`);
// //     const activeProviders = await Users.find({
// //       role: "serviceProvider",
// //       isOnline: true,
// //       location: { $exists: true },
// //     }).select("name serviceType location");
// //     console.timeEnd(`⏱ [${req._rid}] active-providers`);

// //     console.log(
// //       `📍 [${req._rid}] active-providers count=${activeProviders.length}, mem=`,
// //       mem()
// //     );

// //     return res.json(
// //       activeProviders.map((pro) => ({
// //         id: pro._id,
// //         name: pro.name,
// //         category: pro.serviceType,
// //         coords: {
// //           latitude: pro.location?.coordinates?.[1],
// //           longitude: pro.location?.coordinates?.[0],
// //         },
// //       }))
// //     );
// //   } catch (err) {
// //     console.error(`💥 [${req._rid}] active-providers error:`, err?.message, err);
// //     return res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // /* -------------- GET /api/users/billing-info -------------- */
// // router.get("/billing-info", auth, async (req, res) => {
// //   try {
// //     console.time(`⏱ [${req._rid}] billing-info`);
// //     const user = await Users.findById(req.user.id)
// //       .select("billingTier isActive")
// //       .lean();
// //     console.timeEnd(`⏱ [${req._rid}] billing-info`);
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     console.log(
// //       `🧾 [${req._rid}] billing-info`,
// //       JSON.stringify({ billingTier: user.billingTier, isActive: user.isActive })
// //     );

// //     return res.json(user);
// //   } catch (err) {
// //     console.error(`💥 [${req._rid}] billing-info error:`, err?.message, err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /* -------------- GET /api/users/:id -------------- */
// // router.get("/:id([0-9a-fA-F]{24})", auth, async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const userId = id === "me" ? req.user.id : id;
// //     console.log(`👀 [${req._rid}] GET /users/:id ${userId}`);

// //     console.time(`⏱ [${req._rid}] findUser(:id)`);
// //     const user = await Users.findById(userId)
// //       .select("name email role aboutMe businessName profilePicture averageRating")
// //       .lean();
// //     console.timeEnd(`⏱ [${req._rid}] findUser(:id)`);

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     console.log(
// //       `📄 [${req._rid}] /users/:id`,
// //       JSON.stringify({
// //         id: user._id,
// //         role: user.role,
// //         email: maskEmail(user.email),
// //         profilePictureB: bytes(lenOf(user.profilePicture)),
// //       })
// //     );

// //     return res.json(user);
// //   } catch (err) {
// //     console.error(`💥 [${req._rid}] GET /users/:id error:`, err?.message, err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /* -------------- GET /api/users/me/documents (blobs) -------------- */
// // router.get("/me/documents", auth, async (req, res) => {
// //   try {
// //     console.time(`⏱ [${req._rid}] me/documents`);
// //     const user = await Users.findById(
// //       req.user.id,
// //       "w9 businessLicense proofOfInsurance independentContractorAgreement"
// //     ).lean();
// //     console.timeEnd(`⏱ [${req._rid}] me/documents`);

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     console.log(
// //       `📚 [${req._rid}] me/documents sizes`,
// //       JSON.stringify({
// //         w9: bytes(lenOf(user.w9)),
// //         businessLicense: bytes(lenOf(user.businessLicense)),
// //         proofOfInsurance: bytes(lenOf(user.proofOfInsurance)),
// //         ica: bytes(lenOf(user.independentContractorAgreement)),
// //         mem: mem(),
// //       })
// //     );

// //     return res.json({
// //       w9: user.w9 || null,
// //       businessLicense: user.businessLicense || null,
// //       proofOfInsurance: user.proofOfInsurance || null,
// //       independentContractorAgreement:
// //         user.independentContractorAgreement || null,
// //     });
// //   } catch (err) {
// //     console.error(`💥 [${req._rid}] me/documents error:`, err?.message, err);
// //     return res.status(500).json({ msg: "Server error fetching documents" });
// //   }
// // });

// // /* -------------- GET /api/users/me/stats -------------- */
// // router.get("/me/stats", auth, async (req, res) => {
// //   if (req.user.role !== "serviceProvider")
// //     return res.status(403).json({ msg: "Only service providers have stats" });

// //   try {
// //     const year = parseInt(req.query.year) || new Date().getFullYear();
// //     const providerId = new mongoose.Types.ObjectId(req.user.id);
// //     console.log(`📊 [${req._rid}] stats year=${year}`);

// //     console.time(`⏱ [${req._rid}] statsAgg`);
// //     const stats = await Job.aggregate([
// //       {
// //         $match: {
// //           acceptedProvider: providerId,
// //           status: "completed",
// //           $expr: { $eq: [{ $year: "$createdAt" }, year] },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: null,
// //           completedJobsCount: { $sum: 1 },
// //           totalAmountPaid: { $sum: "$totalAmountPaid" },
// //         },
// //       },
// //     ]);
// //     console.timeEnd(`⏱ [${req._rid}] statsAgg`);

// //     const out = stats.length
// //       ? stats[0]
// //       : { completedJobsCount: 0, totalAmountPaid: 0 };

// //     console.log(`✅ [${req._rid}] stats`, out);
// //     return res.json(out);
// //   } catch (err) {
// //     console.error(`💥 [${req._rid}] stats error:`, err?.message, err);
// //     return res.status(500).json({ msg: "Server error fetching stats" });
// //   }
// // });

// // /* -------------- GET /api/users/providers/active -------------- */
// // router.get("/providers/active", async (req, res) => {
// //   try {
// //     console.time(`⏱ [${req._rid}] providers/active`);
// //     const providers = await Users.find(
// //       { role: "serviceProvider", isActive: true },
// //       "name serviceType location.coordinates"
// //     ).lean();
// //     console.timeEnd(`⏱ [${req._rid}] providers/active`);

// //     console.log(
// //       `🧭 [${req._rid}] providers/active count=${providers.length}`
// //     );

// //     const data = providers.map((p) => {
// //       const [lng, lat] = p.location?.coordinates || [];
// //       return {
// //         id: p._id,
// //         name: p.name,
// //         serviceType: p.serviceType,
// //         position: lat != null && lng != null ? [lat, lng] : null,
// //       };
// //     });

// //     return res.json(data);
// //   } catch (err) {
// //     console.error(
// //       `💥 [${req._rid}] providers/active error:`,
// //       err?.message,
// //       err
// //     );
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /* -------------- PUT /api/users/profile (multipart) -------------- */
// // router.put(
// //   "/profile",
// //   auth,
// //   upload.fields([
// //     { name: "w9", maxCount: 1 },
// //     { name: "businessLicense", maxCount: 1 },
// //     { name: "proofOfInsurance", maxCount: 1 },
// //     { name: "independentContractorAgreement", maxCount: 1 },
// //     { name: "profilePicture", maxCount: 1 },
// //   ]),
// //   async (req, res) => {
// //     const t0 = Date.now();
// //     try {
// //       console.log(
// //         `✏️  [${req._rid}] PUT /profile body keys=${Object.keys(req.body || {}).join(
// //           ","
// //         )}, files=${Object.keys(req.files || {}).join(",")}`
// //       );

// //       // file diagnostics
// //       if (req.files) {
// //         Object.entries(req.files).forEach(([field, arr]) => {
// //           const items = Array.isArray(arr) ? arr : [];
// //           items.forEach((f, i) => {
// //             console.log(
// //               `🗂️  [${req._rid}] file ${field}[${i}] ${f.mimetype} ${bytes(
// //                 f.size || f.buffer?.length || 0
// //               )}`
// //             );
// //           });
// //         });
// //       }

// //       const user = await Users.findById(req.user.id);
// //       if (!user) return res.status(404).json({ msg: "User not found" });

// //       // text fields
// //       for (const [key, value] of Object.entries(req.body || {})) {
// //         if (value === undefined || value === "") continue;

// //         if (key === "acceptedICA") {
// //           user.acceptedICA = value === "true" || value === true || value === 1 || value === "1";
// //         } else if (key === "optInSms" || key === "optInSMS" || key === "acceptSMS") {
// //           user.optInSms = value === "true" || value === true || value === 1 || value === "1";
// //         } else if (key === "email") {
// //           user.email = String(value).toLowerCase();
// //         } else if (key === "phoneNumber") {
// //           user.phoneNumber = String(value);
// //         } else if (key === "zipcode") {
// //           const arr = Array.isArray(value) ? value : [value];
// //           user.zipcode = arr.map((z) => String(z).trim());
// //         } else if (key === "serviceZipcode") {
// //           const arr = Array.isArray(value) ? value : [value];
// //           user.serviceZipcode = arr.map((z) => String(z).trim());
// //         } else if (key === "yearsExperience") {
// //           const n = Number(value);
// //           if (Number.isFinite(n)) user.yearsExperience = n;
// //         } else {
// //           user[key] = value;
// //         }
// //       }

// //       const files = req.files || {};
// //       if (files.profilePicture?.[0]) {
// //         const { buffer, mimetype } = files.profilePicture[0];
// //         user.profilePicture = `data:${mimetype};base64,${buffer.toString("base64")}`;
// //       }
// //       if (files.w9?.[0]) user.w9 = files.w9[0].buffer.toString("base64");
// //       if (files.businessLicense?.[0]) user.businessLicense = files.businessLicense[0].buffer.toString("base64");
// //       if (files.proofOfInsurance?.[0]) user.proofOfInsurance = files.proofOfInsurance[0].buffer.toString("base64");
// //       if (files.independentContractorAgreement?.[0]) {
// //         user.independentContractorAgreement =
// //           files.independentContractorAgreement[0].buffer.toString("base64");
// //       }

// //       console.time(`⏱ [${req._rid}] saveUser(profile)`);
// //       await user.save({ validateBeforeSave: false });
// //       console.timeEnd(`⏱ [${req._rid}] saveUser(profile)`);

// //       const lens = {
// //         profilePicture: bytes(lenOf(user.profilePicture)),
// //         w9: bytes(lenOf(user.w9)),
// //         businessLicense: bytes(lenOf(user.businessLicense)),
// //         proofOfInsurance: bytes(lenOf(user.proofOfInsurance)),
// //         ica: bytes(lenOf(user.independentContractorAgreement)),
// //       };

// //       console.log(
// //         `✅ [${req._rid}] profile saved`,
// //         JSON.stringify({
// //           email: maskEmail(user.email),
// //           phone: maskPhone(user.phoneNumber),
// //           optInSms: !!user.optInSms,
// //           acceptedICA: !!user.acceptedICA,
// //           sizes: lens,
// //           mem: mem(),
// //           tookMs: Date.now() - t0,
// //         })
// //       );

// //       // NOTE: returning full user as in your current code (can be heavy)
// //       const body = { msg: "Profile updated", user };
// //       // log response size explicitly
// //       const size = Buffer.byteLength(JSON.stringify(body));
// //       console.log(`📦 [${req._rid}] /profile response size ~${bytes(size)}`);

// //       return res.json(body);
// //     } catch (err) {
// //       console.error(`💥 [${req._rid}] PUT /profile error:`, err?.message, err);
// //       if (err instanceof multer.MulterError) {
// //         return res.status(400).json({ msg: `MulterError: ${err.message}` });
// //       }
// //       return res.status(500).json({ msg: "Server error updating profile" });
// //     }
// //   }
// // );

// // /* -------------- PUT /api/users/location -------------- */
// // router.put("/location", auth, async (req, res) => {
// //   try {
// //     const loc = req.body.location;
// //     console.log(`🗺️  [${req._rid}] PUT /location`, loc);
// //     if (!Array.isArray(loc) || loc.length !== 2)
// //       return res.status(400).json({ msg: "Location must be [lat, lng]" });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     user.location = {
// //       type: "Point",
// //       coordinates: [Number(loc[1]), Number(loc[0])],
// //     };
// //     console.time(`⏱ [${req._rid}] saveUser(location)`);
// //     await user.save({ validateBeforeSave: false });
// //     console.timeEnd(`⏱ [${req._rid}] saveUser(location)`);

// //     return res.json({ msg: "Location updated", location: user.location });
// //   } catch (err) {
// //     console.error(`💥 [${req._rid}] PUT /location error:`, err?.message, err);
// //     return res.status(500).json({ msg: "Server error updating location" });
// //   }
// // });

// // /* -------------- POST /api/users/push-token -------------- */
// // router.post("/push-token", auth, async (req, res) => {
// //   try {
// //     const { token } = req.body;
// //     console.log(
// //       `🔔 [${req._rid}] push-token tokenLen=${(token || "").length} tokenPreview=${short(
// //         token || "",
// //         12
// //       )}`
// //     );
// //     if (!token || typeof token !== "string") {
// //       return res.status(400).json({ msg: "Invalid or missing push token." });
// //     }

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.expoPushToken = token;
// //     await user.save();

// //     return res.status(200).json({ msg: "Push token saved." });
// //   } catch (err) {
// //     console.error(`💥 [${req._rid}] push-token error:`, err?.message, err);
// //     return res.status(500).json({ msg: "Failed to save push token." });
// //   }
// // });

// // /* -------------- POST /api/users/save-session -------------- */
// // router.post("/save-session", auth, async (req, res) => {
// //   try {
// //     const { jobId } = req.body;
// //     console.log(`🧠 [${req._rid}] save-session jobId=${jobId}`);
// //     if (!jobId) return res.status(400).json({ msg: "Missing jobId." });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.lastActiveJobId = jobId;
// //     await user.save();

// //     return res.status(200).json({ msg: "Session saved." });
// //   } catch (err) {
// //     console.error(`💥 [${req._rid}] save-session error:`, err?.message, err);
// //     return res.status(500).json({ msg: "Server error saving session." });
// //   }
// // });

// // /* -------------- DELETE /api/users/delete -------------- */
// // router.delete("/delete", auth, async (req, res) => {
// //   try {
// //     const userId = req.user._id || req.user.id;
// //     const { reason } = req.body;
// //     console.log(
// //       `🗑️  [${req._rid}] delete userId=${userId} reason=${short(reason || "", 32)}`
// //     );

// //     const updatedUser = await Users.findByIdAndUpdate(
// //       userId,
// //       {
// //         isDeleted: true,
// //         isActive: false,
// //         deleteReason: reason || "",
// //         deletedAt: new Date(),
// //       },
// //       { new: true }
// //     );

// //     if (!updatedUser) {
// //       return res.status(404).json({ msg: "User not found" });
// //     }

// //     return res.json({ msg: "Account successfully marked as deleted" });
// //   } catch (err) {
// //     console.error(`💥 [${req._rid}] delete error:`, err?.message, err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /* -------------- PATCH /api/users/users/profile (JSON) -------------- */
// // router.patch("/users/profile", auth, async (req, res) => {
// //   try {
// //     const bool = (v) => v === true || v === "true" || v === 1 || v === "1";
// //     const updates = {};

// //     if (typeof req.body.optInSms !== "undefined") updates.optInSms = bool(req.body.optInSms);
// //     if (typeof req.body.acceptedICA !== "undefined") updates.acceptedICA = bool(req.body.acceptedICA);
// //     if (typeof req.body.independentContractorAgreement !== "undefined") {
// //       updates.independentContractorAgreement = String(req.body.independentContractorAgreement || "");
// //     }
// //     if (req.body.email) updates.email = String(req.body.email).toLowerCase();
// //     if (req.body.phoneNumber) updates.phoneNumber = String(req.body.phoneNumber);

// //     console.log(`🧩 [${req._rid}] PATCH /users/profile updates=`, updates);

// //     console.time(`⏱ [${req._rid}] patchProfile`);
// //     const user = await Users.findByIdAndUpdate(req.user.id, updates, { new: true });
// //     console.timeEnd(`⏱ [${req._rid}] patchProfile`);

// //     const resp = user || {};
// //     const size = Buffer.byteLength(JSON.stringify(resp));
// //     console.log(`📦 [${req._rid}] PATCH /users/profile resp ~${bytes(size)}`);

// //     return res.json(resp);
// //   } catch (err) {
// //     console.error(`💥 [${req._rid}] PATCH /users/profile error:`, err?.message, err);
// //     return res.status(500).json({ msg: "Server error updating profile" });
// //   }
// // });

// // export default router;


// // // backend/routes/users.js
// // import express from "express";
// // import mongoose from "mongoose";
// // import crypto from "crypto";
// // import NodeGeocoder from "node-geocoder";
// // import multer from "multer";

// // import { auth } from "../middlewares/auth.js";
// // import Users from "../models/Users.js";
// // import Job from "../models/Job.js";

// // const router = express.Router();

// // // Geocoder + multer setup
// // const geocoder = NodeGeocoder({ provider: "openstreetmap" });
// // const storage = multer.memoryStorage();
// // const upload = multer({
// //   storage: multer.memoryStorage(),
// //   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// // });

// // // --- helpers ---
// // const algorithm = "aes-256-cbc";
// // const encryptionKey = process.env.ENCRYPTION_KEY;
// // const encryptionIV = process.env.ENCRYPTION_IV;

// // function encrypt(text) {
// //   if (!encryptionKey || !encryptionIV) return text;
// //   const key = Buffer.from(encryptionKey, "hex");
// //   const iv = Buffer.from(encryptionIV, "hex");
// //   const cipher = crypto.createCipheriv(algorithm, key, iv);
// //   let encrypted = cipher.update(text, "utf8", "hex");
// //   return encrypted + cipher.final("hex");
// // }

// // const toBool = (v) =>
// //   v === true ||
// //   v === "true" ||
// //   v === 1 ||
// //   v === "1" ||
// //   v === "on" ||
// //   v === "yes" ||
// //   v === "y";

// // // NOTE: not used by /me; kept for reference
// // // function slimUser(user) {
// // //   if (!user || typeof user !== "object") {
// // //     console.warn("⚠️ slimUser received invalid input:", user);
// // //     return {};
// // //   }
// // //   const {
// // //     password,
// // //     w9,
// // //     businessLicense,
// // //     proofOfInsurance,
// // //     independentContractorAgreement,
// // //     ...rest
// // //   } = user;
// // //   return rest;
// // // }

// // // put this helper near the top
// // function toSlimUser(u) {
// //   if (!u) return {};
// //   return {
// //     _id: u._id,
// //     name: u.name,
// //     role: u.role,
// //     trade: u.trade,
// //     serviceType: u.serviceType,
// //     portfolio: u.portfolio || [],
// //     serviceZipcode: u.serviceZipcode || [],
// //     billingTier: u.billingTier,
// //     zipcode: u.zipcode || [],
// //     address: u.address || "",
// //     aboutMe: u.aboutMe || "",
// //     yearsExperience: u.yearsExperience ?? null,
// //     businessName: u.businessName || "",
// //     isActive: !!u.isActive,

// //     // ✅ the fields you were missing on the client:
// //     email: u.email || "",
// //     phoneNumber: u.phoneNumber || "",
// //     optInSms: !!u.optInSms,
// //     acceptedICA: !!u.acceptedICA,
// //     // “viewed” isn’t stored; infer it if a doc exists or it’s accepted
// //     icaViewed: !!u.acceptedICA || !!u.independentContractorAgreement,

// //     // stripe id if you need it client-side
// //     stripeAccountId: u.stripeAccountId || "",

// //     // DO NOT send blobs here
// //     hasDocs: {
// //       w9: !!u.w9,
// //       businessLicense: !!u.businessLicense,
// //       proofOfInsurance: !!u.proofOfInsurance,
// //       independentContractorAgreement: !!u.independentContractorAgreement,
// //     },
// //     hasProfilePicture: !!u.profilePicture, // boolean only
// //   };
// // }

// // /**
// //  * GET /api/users/me
// //  * Return all fields the app needs for readiness checks & hydration.
// //  */
// // router.get("/me", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(req.user.id)
// //       .select([
// //         "name",
// //         "role",
// //         "trade",
// //         "serviceType",
// //         "portfolio",
// //         "serviceZipcode",
// //         "billingTier",
// //         "zipcode",
// //         "address",
// //         "aboutMe",
// //         "yearsExperience",
// //         "businessName",
// //         "isActive",
// //         // ✅ include the fields your app couldn’t see
// //         "email",
// //         "phoneNumber",
// //         "optInSms",
// //         "acceptedICA",
// //         "stripeAccountId",
// //         // we’ll compute booleans from these but won’t send the raw values back
// //         "w9",
// //         "businessLicense",
// //         "proofOfInsurance",
// //         "independentContractorAgreement",
// //         "profilePicture",
// //       ].join(" "))
// //       .lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json(toSlimUser(user)); // ✅ slim
// //   } catch (err) {
// //     console.error("GET /me error:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // // router.get("/me", auth, async (req, res) => {
// // //   try {
// // //     console.time("🔍 MongoDB user fetch");

// // //     const fields = [
// // //       // identity & contact
// // //       "name",
// // //       "email",
// // //       "phoneNumber",
// // //       "role",

// // //       // business/profile
// // //       "businessName",
// // //       "address",
// // //       "zipcode",
// // //       "serviceZipcode",
// // //       "aboutMe",
// // //       "yearsExperience",
// // //       "serviceType",
// // //       "serviceCost",
// // //       "profilePicture",

// // //       // docs & flags
// // //       "w9",
// // //       "businessLicense",
// // //       "proofOfInsurance",
// // //       "independentContractorAgreement",
// // //       "acceptedICA",
// // //       "optInSms",
// // //       "isActive",

// // //       // billing
// // //       "billingTier",
// // //       "stripeAccountId",

// // //       // (in case you later store it)
// // //       "icaViewed",
// // //     ].join(" ");

// // //     // Use .select(fields) to avoid accidental projection issues
// // //     const user = await Users.findById(req.user.id).select(fields).lean();
// // //     console.timeEnd("🔍 MongoDB user fetch");

// // //     if (!user) return res.status(404).json({ msg: "User not found" });

// // //     // Return the plain object (client handles both {user} and raw)
// // //     return res.json(user);
// // //   } catch (err) {
// // //     console.error("GET /me error:", err);
// // //     return res.status(500).json({ msg: "Server error" });
// // //   }
// // // });

// // /**
// //  * GET /api/users/active-providers
// //  */
// // router.get("/active-providers", async (req, res) => {
// //   try {
// //     const activeProviders = await Users.find({
// //       role: "serviceProvider",
// //       isOnline: true, // adjust if needed
// //       location: { $exists: true },
// //     }).select("name serviceType location");

// //     res.json(
// //       activeProviders.map((pro) => ({
// //         id: pro._id,
// //         name: pro.name,
// //         category: pro.serviceType,
// //         coords: {
// //           latitude: pro.location?.coordinates?.[1],
// //           longitude: pro.location?.coordinates?.[0],
// //         },
// //       }))
// //     );
// //   } catch (err) {
// //     console.error("Failed to fetch active providers:", err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // /**
// //  * GET /api/users/billing-info
// //  */
// // router.get("/billing-info", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(req.user.id)
// //       .select("billingTier isActive")
// //       .lean();
// //     if (!user) return res.status(404).json({ msg: "User not found" });
// //     res.json(user);
// //   } catch (err) {
// //     console.error("Billing info fetch failed:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * GET /api/users/:id
// //  */
// // router.get("/:id([0-9a-fA-F]{24})", auth, async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const userId = id === "me" ? req.user.id : id;

// //     const user = await Users.findById(userId).select(
// //       "name email role aboutMe businessName profilePicture averageRating"
// //     );

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json(user);
// //   } catch (err) {
// //     console.error("GET /users/:id error", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * GET /api/users/me/documents
// //  */
// // router.get("/me/documents", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(
// //       req.user.id,
// //       "w9 businessLicense proofOfInsurance independentContractorAgreement"
// //     ).lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json({
// //       w9: user.w9 || null,
// //       businessLicense: user.businessLicense || null,
// //       proofOfInsurance: user.proofOfInsurance || null,
// //       independentContractorAgreement:
// //         user.independentContractorAgreement || null,
// //     });
// //   } catch (err) {
// //     console.error("GET /me/documents error:", err);
// //     res.status(500).json({ msg: "Server error fetching documents" });
// //   }
// // });

// // /**
// //  * GET /api/users/me/stats
// //  */
// // router.get("/me/stats", auth, async (req, res) => {
// //   if (req.user.role !== "serviceProvider")
// //     return res.status(403).json({ msg: "Only service providers have stats" });

// //   const year = parseInt(req.query.year) || new Date().getFullYear();
// //   const providerId = new mongoose.Types.ObjectId(req.user.id);

// //   try {
// //     const stats = await Job.aggregate([
// //       {
// //         $match: {
// //           acceptedProvider: providerId,
// //           status: "completed",
// //           $expr: { $eq: [{ $year: "$createdAt" }, year] },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: null,
// //           completedJobsCount: { $sum: 1 },
// //           totalAmountPaid: { $sum: "$totalAmountPaid" },
// //         },
// //       },
// //     ]);

// //     if (!stats.length) {
// //       return res.json({ completedJobsCount: 0, totalAmountPaid: 0 });
// //     }
// //     const { completedJobsCount, totalAmountPaid } = stats[0];
// //     res.json({ completedJobsCount, totalAmountPaid });
// //   } catch (err) {
// //     console.error("Error fetching provider stats:", err);
// //     res.status(500).json({ msg: "Server error fetching stats" });
// //   }
// // });

// // /**
// //  * GET /api/users/providers/active
// //  */
// // router.get("/providers/active", async (req, res) => {
// //   try {
// //     const providers = await Users.find(
// //       { role: "serviceProvider", isActive: true },
// //       "name serviceType location.coordinates"
// //     ).lean();

// //     const data = providers.map((p) => {
// //       const [lng, lat] = p.location?.coordinates || [];
// //       return {
// //         id: p._id,
// //         name: p.name,
// //         serviceType: p.serviceType,
// //         position: lat != null && lng != null ? [lat, lng] : null,
// //       };
// //     });

// //     res.json(data);
// //   } catch (err) {
// //     console.error("GET /providers/active error:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * PUT /api/users/profile
// //  * Multipart profile update (files + fields). Coerces booleans explicitly.
// //  */
// // router.put(
// //   "/profile",
// //   auth,
// //   upload.fields([
// //     { name: "w9", maxCount: 1 },
// //     { name: "businessLicense", maxCount: 1 },
// //     { name: "proofOfInsurance", maxCount: 1 },
// //     { name: "independentContractorAgreement", maxCount: 1 },
// //     { name: "profilePicture", maxCount: 1 },
// //   ]),
// //   async (req, res) => {
// //     try {
// //       const user = await Users.findById(req.user.id);
// //       if (!user) return res.status(404).json({ msg: "User not found" });

// //       // text fields (coerce booleans)
// //       for (const [key, value] of Object.entries(req.body)) {
// //         if (value === undefined || value === "") continue;

// //         if (key === "acceptedICA") {
// //           user.acceptedICA = toBool(value);
// //         } else if (key === "optInSms" || key === "optInSMS" || key === "acceptSMS") {
// //           user.optInSms = toBool(value);
// //         } else if (key === "email") {
// //           user.email = String(value).toLowerCase();
// //         } else if (key === "phoneNumber") {
// //           user.phoneNumber = String(value);
// //         } else {
// //           user[key] = value;
// //         }
// //       }

// //       // files
// //       const files = req.files;
// //       if (files?.profilePicture?.[0]) {
// //         const { buffer, mimetype } = files.profilePicture[0];
// //         user.profilePicture = `data:${mimetype};base64,${buffer.toString("base64")}`;
// //       }
// //       if (files?.w9?.[0]) {
// //         user.w9 = files.w9[0].buffer.toString("base64");
// //       }
// //       if (files?.businessLicense?.[0]) {
// //         user.businessLicense = files.businessLicense[0].buffer.toString("base64");
// //       }
// //       if (files?.proofOfInsurance?.[0]) {
// //         user.proofOfInsurance = files.proofOfInsurance[0].buffer.toString("base64");
// //       }
// //       if (files?.independentContractorAgreement?.[0]) {
// //         user.independentContractorAgreement =
// //           files.independentContractorAgreement[0].buffer.toString("base64");
// //       }

// //       await user.save({ validateBeforeSave: false });
// //       return res.json({ msg: "Profile updated", user });
// //     } catch (err) {
// //       console.error("PUT /profile error:", err);
// //       if (err instanceof multer.MulterError) {
// //         return res.status(400).json({ msg: `MulterError: ${err.message}` });
// //       }
// //       return res.status(500).json({ msg: "Server error updating profile" });
// //     }
// //   }
// // );

// // /**
// //  * PATCH /api/users/profile  (JSON-only updates; boolean-safe)
// //  * Also keeps legacy alias /api/users/users/profile for backward compatibility.
// //  */
// // async function patchProfileHandler(req, res) {
// //   try {
// //     const updates = {};
// //     const b = req.body;

// //     if (typeof b.optInSms !== "undefined" || typeof b.optInSMS !== "undefined" || typeof b.acceptSMS !== "undefined") {
// //       updates.optInSms = toBool(b.optInSms ?? b.optInSMS ?? b.acceptSMS);
// //     }
// //     if (typeof b.acceptedICA !== "undefined") {
// //       updates.acceptedICA = toBool(b.acceptedICA);
// //     }
// //     if (typeof b.independentContractorAgreement !== "undefined") {
// //       updates.independentContractorAgreement = String(b.independentContractorAgreement || "");
// //     }
// //     if (b.email) updates.email = String(b.email).toLowerCase();
// //     if (b.phoneNumber) updates.phoneNumber = String(b.phoneNumber);

// //     const user = await Users.findByIdAndUpdate(req.user.id, updates, { new: true });
// //     return res.json({ user });
// //   } catch (err) {
// //     console.error("PATCH /profile error:", err);
// //     return res.status(500).json({ msg: "Server error updating profile" });
// //   }
// // }

// // router.patch("/profile", auth, patchProfileHandler);
// // // legacy alias in case the app was calling /users/profile
// // router.patch("/users/profile", auth, patchProfileHandler);

// // /**
// //  * PUT /api/users/location
// //  */
// // router.put("/location", auth, async (req, res) => {
// //   try {
// //     const loc = req.body.location;
// //     if (!Array.isArray(loc) || loc.length !== 2)
// //       return res.status(400).json({ msg: "Location must be [lat, lng]" });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     user.location = {
// //       type: "Point",
// //       coordinates: [Number(loc[1]), Number(loc[0])],
// //     };
// //     await user.save({ validateBeforeSave: false });

// //     res.json({ msg: "Location updated", location: user.location });
// //   } catch (err) {
// //     console.error("PUT /location error:", err);
// //     res.status(500).json({ msg: "Server error updating location" });
// //   }
// // });

// // /**
// //  * POST /api/users/push-token
// //  */
// // router.post("/push-token", auth, async (req, res) => {
// //   try {
// //     const { token } = req.body;
// //     if (!token || typeof token !== "string") {
// //       return res.status(400).json({ msg: "Invalid or missing push token." });
// //     }

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.expoPushToken = token;
// //     await user.save();

// //     res.status(200).json({ msg: "Push token saved." });
// //   } catch (err) {
// //     console.error("❌ Error saving push token:", err);
// //     res.status(500).json({ msg: "Failed to save push token." });
// //   }
// // });

// // /**
// //  * POST /api/users/save-session
// //  */
// // router.post("/save-session", auth, async (req, res) => {
// //   try {
// //     const { jobId } = req.body;
// //     if (!jobId) return res.status(400).json({ msg: "Missing jobId." });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.lastActiveJobId = jobId;
// //     await user.save();

// //     res.status(200).json({ msg: "Session saved." });
// //   } catch (err) {
// //     console.error("Error saving session:", err);
// //     res.status(500).json({ msg: "Server error saving session." });
// //   }
// // });

// // /**
// //  * DELETE /api/users/delete
// //  */
// // router.delete("/delete", auth, async (req, res) => {
// //   try {
// //     const userId = req.user._id || req.user.id;
// //     const { reason } = req.body;
// //     const updatedUser = await Users.findByIdAndUpdate(
// //       userId,
// //       {
// //         isDeleted: true,
// //         isActive: false,
// //         deleteReason: reason || "",
// //         deletedAt: new Date(),
// //       },
// //       { new: true }
// //     );

// //     if (!updatedUser) {
// //       return res.status(404).json({ msg: "User not found" });
// //     }

// //     res.json({ msg: "Account successfully marked as deleted" });
// //   } catch (err) {
// //     console.error("❌ Delete user error", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // export default router;

// // // backend/routes/users.js
// // import express from "express";
// // import mongoose from "mongoose";
// // import crypto from "crypto";
// // import NodeGeocoder from "node-geocoder";
// // import multer from "multer";

// // import { auth } from "../middlewares/auth.js";
// // import Users from "../models/Users.js";
// // import Job from "../models/Job.js";

// // const router = express.Router();

// // // Geocoder + multer setup
// // const geocoder = NodeGeocoder({ provider: "openstreetmap" });
// // const storage = multer.memoryStorage();
// // const upload = multer({
// //   storage: multer.memoryStorage(),
// //   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// // });

// // // --- helpers ---
// // const algorithm = "aes-256-cbc";
// // const encryptionKey = process.env.ENCRYPTION_KEY;
// // const encryptionIV = process.env.ENCRYPTION_IV;

// // function encrypt(text) {
// //   if (!encryptionKey || !encryptionIV) return text;
// //   const key = Buffer.from(encryptionKey, "hex");
// //   const iv = Buffer.from(encryptionIV, "hex");
// //   const cipher = crypto.createCipheriv(algorithm, key, iv);
// //   let encrypted = cipher.update(text, "utf8", "hex");
// //   return encrypted + cipher.final("hex");
// // }

// // const toBool = (v) =>
// //   v === true ||
// //   v === "true" ||
// //   v === 1 ||
// //   v === "1" ||
// //   v === "on" ||
// //   v === "yes" ||
// //   v === "y";

// // const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// // // NOTE: not used by /me; kept for reference
// // // function slimUser(user) {
// // //   if (!user || typeof user !== "object") {
// // //     console.warn("⚠️ slimUser received invalid input:", user);
// // //     return {};
// // //   }
// // //   const {
// // //     password,
// // //     w9,
// // //     businessLicense,
// // //     proofOfInsurance,
// // //     independentContractorAgreement,
// // //     ...rest
// // //   } = user;
// // //   return rest;
// // // }

// // // put this helper near the top
// // function toSlimUser(u) {
// //   if (!u) return {};
// //   return {
// //     _id: u._id,
// //     name: u.name,
// //     role: u.role,
// //     trade: u.trade,
// //     serviceType: u.serviceType,
// //     portfolio: u.portfolio || [],
// //     serviceZipcode: u.serviceZipcode || [],
// //     billingTier: u.billingTier,
// //     zipcode: u.zipcode || [],
// //     address: u.address || "",
// //     aboutMe: u.aboutMe || "",
// //     yearsExperience: u.yearsExperience ?? null,
// //     businessName: u.businessName || "",
// //     isActive: !!u.isActive,

// //     // ✅ the fields you were missing on the client:
// //     email: u.email || "",
// //     phoneNumber: u.phoneNumber || "",
// //     optInSms: !!u.optInSms,
// //     acceptedICA: !!u.acceptedICA,
// //     // “viewed” isn’t stored; infer it if a doc exists or it’s accepted
// //     icaViewed: !!u.acceptedICA || !!u.independentContractorAgreement,

// //     // stripe id if you need it client-side
// //     stripeAccountId: u.stripeAccountId || "",

// //     // DO NOT send blobs here
// //     hasDocs: {
// //       w9: !!u.w9,
// //       businessLicense: !!u.businessLicense,
// //       proofOfInsurance: !!u.proofOfInsurance,
// //       independentContractorAgreement: !!u.independentContractorAgreement,
// //     },
// //     hasProfilePicture: !!u.profilePicture, // boolean only
// //   };
// // }

// // /**
// //  * GET /api/users/me
// //  * Return all fields the app needs for readiness checks & hydration.
// //  */
// // router.get("/me", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(req.user.id)
// //       .select([
// //         "name",
// //         "role",
// //         "trade",
// //         "serviceType",
// //         "portfolio",
// //         "serviceZipcode",
// //         "billingTier",
// //         "zipcode",
// //         "address",
// //         "aboutMe",
// //         "yearsExperience",
// //         "businessName",
// //         "isActive",
// //         // ✅ include the fields your app couldn’t see
// //         "email",
// //         "phoneNumber",
// //         "optInSms",
// //         "acceptedICA",
// //         "stripeAccountId",
// //         // we’ll compute booleans from these but won’t send the raw values back
// //         "w9",
// //         "businessLicense",
// //         "proofOfInsurance",
// //         "independentContractorAgreement",
// //         "profilePicture",
// //       ].join(" "))
// //       .lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json(toSlimUser(user)); // ✅ slim
// //   } catch (err) {
// //     console.error("GET /me error:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // // router.get("/me", auth, async (req, res) => {
// // //   try {
// // //     console.time("🔍 MongoDB user fetch");

// // //     const fields = [
// // //       // identity & contact
// // //       "name",
// // //       "email",
// // //       "phoneNumber",
// // //       "role",

// // //       // business/profile
// // //       "businessName",
// // //       "address",
// // //       "zipcode",
// // //       "serviceZipcode",
// // //       "aboutMe",
// // //       "yearsExperience",
// // //       "serviceType",
// // //       "serviceCost",
// // //       "profilePicture",

// // //       // docs & flags
// // //       "w9",
// // //       "businessLicense",
// // //       "proofOfInsurance",
// // //       "independentContractorAgreement",
// // //       "acceptedICA",
// // //       "optInSms",
// // //       "isActive",

// // //       // billing
// // //       "billingTier",
// // //       "stripeAccountId",

// // //       // (in case you later store it)
// // //       "icaViewed",
// // //     ].join(" ");

// // //     // Use .select(fields) to avoid accidental projection issues
// // //     const user = await Users.findById(req.user.id).select(fields).lean();
// // //     console.timeEnd("🔍 MongoDB user fetch");

// // //     if (!user) return res.status(404).json({ msg: "User not found" });

// // //     // Return the plain object (client handles both {user} and raw)
// // //     return res.json(user);
// // //   } catch (err) {
// // //     console.error("GET /me error:", err);
// // //     return res.status(500).json({ msg: "Server error" });
// // //   }
// // // });

// // /**
// //  * GET /api/users/active-providers
// //  */
// // router.get("/active-providers", async (req, res) => {
// //   try {
// //     const activeProviders = await Users.find({
// //       role: "serviceProvider",
// //       isOnline: true, // adjust if needed
// //       location: { $exists: true },
// //     }).select("name serviceType location");

// //     res.json(
// //       activeProviders.map((pro) => ({
// //         id: pro._id,
// //         name: pro.name,
// //         category: pro.serviceType,
// //         coords: {
// //           latitude: pro.location?.coordinates?.[1],
// //           longitude: pro.location?.coordinates?.[0],
// //         },
// //       }))
// //     );
// //   } catch (err) {
// //     console.error("Failed to fetch active providers:", err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // /**
// //  * GET /api/users/billing-info
// //  */
// // router.get("/billing-info", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(req.user.id)
// //       .select("billingTier isActive")
// //       .lean();
// //     if (!user) return res.status(404).json({ msg: "User not found" });
// //     res.json(user);
// //   } catch (err) {
// //     console.error("Billing info fetch failed:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * GET /api/users/:id
// //  */
// // router.get("/:id([0-9a-fA-F]{24})", auth, async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const userId = id === "me" ? req.user.id : id;

// //     const user = await Users.findById(userId).select(
// //       "name email role aboutMe businessName profilePicture averageRating"
// //     );

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json(user);
// //   } catch (err) {
// //     console.error("GET /users/:id error", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * GET /api/users/me/documents
// //  */
// // router.get("/me/documents", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(
// //       req.user.id,
// //       "w9 businessLicense proofOfInsurance independentContractorAgreement"
// //     ).lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json({
// //       w9: user.w9 || null,
// //       businessLicense: user.businessLicense || null,
// //       proofOfInsurance: user.proofOfInsurance || null,
// //       independentContractorAgreement:
// //         user.independentContractorAgreement || null,
// //     });
// //   } catch (err) {
// //     console.error("GET /me/documents error:", err);
// //     res.status(500).json({ msg: "Server error fetching documents" });
// //   }
// // });

// // /**
// //  * GET /api/users/me/stats
// //  */
// // router.get("/me/stats", auth, async (req, res) => {
// //   if (req.user.role !== "serviceProvider")
// //     return res.status(403).json({ msg: "Only service providers have stats" });

// //   const year = parseInt(req.query.year) || new Date().getFullYear();
// //   const providerId = new mongoose.Types.ObjectId(req.user.id);

// //   try {
// //     const stats = await Job.aggregate([
// //       {
// //         $match: {
// //           acceptedProvider: providerId,
// //           status: "completed",
// //           $expr: { $eq: [{ $year: "$createdAt" }, year] },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: null,
// //           completedJobsCount: { $sum: 1 },
// //           totalAmountPaid: { $sum: "$totalAmountPaid" },
// //         },
// //       },
// //     ]);

// //     if (!stats.length) {
// //       return res.json({ completedJobsCount: 0, totalAmountPaid: 0 });
// //     }
// //     const { completedJobsCount, totalAmountPaid } = stats[0];
// //     res.json({ completedJobsCount, totalAmountPaid });
// //   } catch (err) {
// //     console.error("Error fetching provider stats:", err);
// //     res.status(500).json({ msg: "Server error fetching stats" });
// //   }
// // });

// // /**
// //  * GET /api/users/providers/active
// //  */
// // router.get("/providers/active", async (req, res) => {
// //   try {
// //     const providers = await Users.find(
// //       { role: "serviceProvider", isActive: true },
// //       "name serviceType location.coordinates"
// //     ).lean();

// //     const data = providers.map((p) => {
// //       const [lng, lat] = p.location?.coordinates || [];
// //       return {
// //         id: p._id,
// //         name: p.name,
// //         serviceType: p.serviceType,
// //         position: lat != null && lng != null ? [lat, lng] : null,
// //       };
// //     });

// //     res.json(data);
// //   } catch (err) {
// //     console.error("GET /providers/active error:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * PUT /api/users/profile
// //  * Multipart profile update (files + fields). Coerces booleans explicitly.
// //  */
// // router.put(
// //   "/profile",
// //   auth,
// //   upload.fields([
// //     { name: "w9", maxCount: 1 },
// //     { name: "businessLicense", maxCount: 1 },
// //     { name: "proofOfInsurance", maxCount: 1 },
// //     { name: "independentContractorAgreement", maxCount: 1 },
// //     { name: "profilePicture", maxCount: 1 },
// //   ]),
// //   async (req, res) => {
// //     try {
// //       const user = await Users.findById(req.user.id);
// //       if (!user) return res.status(404).json({ msg: "User not found" });

// //       // text fields (coerce booleans)
// //       for (const [key, value] of Object.entries(req.body)) {
// //         if (value === undefined || value === "") continue;

// //         if (key === "acceptedICA") {
// //           user.acceptedICA = toBool(value);
// //         } else if (key === "optInSms" || key === "optInSMS" || key === "acceptSMS") {
// //           user.optInSms = toBool(value);
// //         } else if (key === "email") {
// //           user.email = String(value).toLowerCase();
// //         } else if (key === "phoneNumber") {
// //           user.phoneNumber = String(value);
// //         } else if (key === "zipcode") {
// //           user.zipcode = toArray(value).map((z) => String(z).trim());
// //         } else if (key === "serviceZipcode") {
// //           user.serviceZipcode = toArray(value).map((z) => String(z).trim());
// //         } else if (key === "yearsExperience") {
// //           user.yearsExperience = Number.isFinite(Number(value))
// //             ? Number(value)
// //             : user.yearsExperience;
// //         } else {
// //           user[key] = value;
// //         }
// //       }

// //       // files
// //       const files = req.files;
// //       if (files?.profilePicture?.[0]) {
// //         const { buffer, mimetype } = files.profilePicture[0];
// //         user.profilePicture = `data:${mimetype};base64,${buffer.toString("base64")}`;
// //       }
// //       if (files?.w9?.[0]) {
// //         user.w9 = files.w9[0].buffer.toString("base64");
// //       }
// //       if (files?.businessLicense?.[0]) {
// //         user.businessLicense = files.businessLicense[0].buffer.toString("base64");
// //       }
// //       if (files?.proofOfInsurance?.[0]) {
// //         user.proofOfInsurance = files.proofOfInsurance[0].buffer.toString("base64");
// //       }
// //       if (files?.independentContractorAgreement?.[0]) {
// //         user.independentContractorAgreement =
// //           files.independentContractorAgreement[0].buffer.toString("base64");
// //       }

// //       await user.save({ validateBeforeSave: false });

// //       // 🔒 Return slim user (no base64 docs) to avoid large payload crashes
// //       const fresh = await Users.findById(req.user.id)
// //         .select([
// //           "name","role","trade","serviceType","portfolio","serviceZipcode","billingTier",
// //           "zipcode","address","aboutMe","yearsExperience","businessName","isActive",
// //           "email","phoneNumber","optInSms","acceptedICA","stripeAccountId",
// //           "w9","businessLicense","proofOfInsurance","independentContractorAgreement","profilePicture",
// //         ].join(" "))
// //         .lean();

// //       return res.json({ msg: "Profile updated", user: toSlimUser(fresh) });
// //     } catch (err) {
// //       console.error("PUT /profile error:", err);
// //       if (err instanceof multer.MulterError) {
// //         return res.status(400).json({ msg: `MulterError: ${err.message}` });
// //       }
// //       return res.status(500).json({ msg: "Server error updating profile" });
// //     }
// //   }
// // );

// // /**
// //  * PATCH /api/users/profile  (JSON-only updates; boolean-safe)
// //  * Also keeps legacy alias /api/users/users/profile for backward compatibility.
// //  */
// // async function patchProfileHandler(req, res) {
// //   try {
// //     const updates = {};
// //     const b = req.body;

// //     if (typeof b.optInSms !== "undefined" || typeof b.optInSMS !== "undefined" || typeof b.acceptSMS !== "undefined") {
// //       updates.optInSms = toBool(b.optInSms ?? b.optInSMS ?? b.acceptSMS);
// //     }
// //     if (typeof b.acceptedICA !== "undefined") {
// //       updates.acceptedICA = toBool(b.acceptedICA);
// //     }
// //     if (typeof b.independentContractorAgreement !== "undefined") {
// //       updates.independentContractorAgreement = String(b.independentContractorAgreement || "");
// //     }
// //     if (b.email) updates.email = String(b.email).toLowerCase();
// //     if (b.phoneNumber) updates.phoneNumber = String(b.phoneNumber);

// //     await Users.findByIdAndUpdate(req.user.id, updates, { new: false });

// //     // 🔒 Return slim user instead of full doc with blobs
// //     const fresh = await Users.findById(req.user.id)
// //       .select([
// //         "name","role","trade","serviceType","portfolio","serviceZipcode","billingTier",
// //         "zipcode","address","aboutMe","yearsExperience","businessName","isActive",
// //         "email","phoneNumber","optInSms","acceptedICA","stripeAccountId",
// //         "w9","businessLicense","proofOfInsurance","independentContractorAgreement","profilePicture",
// //       ].join(" "))
// //       .lean();

// //     return res.json({ user: toSlimUser(fresh) });
// //   } catch (err) {
// //     console.error("PATCH /profile error:", err);
// //     return res.status(500).json({ msg: "Server error updating profile" });
// //   }
// // }

// // router.patch("/profile", auth, patchProfileHandler);
// // // legacy alias in case the app was calling /users/profile
// // router.patch("/users/profile", auth, patchProfileHandler);

// // /**
// //  * PUT /api/users/location
// //  */
// // router.put("/location", auth, async (req, res) => {
// //   try {
// //     const loc = req.body.location;
// //     if (!Array.isArray(loc) || loc.length !== 2)
// //       return res.status(400).json({ msg: "Location must be [lat, lng]" });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     user.location = {
// //       type: "Point",
// //       coordinates: [Number(loc[1]), Number(loc[0])],
// //     };
// //     await user.save({ validateBeforeSave: false });

// //     res.json({ msg: "Location updated", location: user.location });
// //   } catch (err) {
// //     console.error("PUT /location error:", err);
// //     res.status(500).json({ msg: "Server error updating location" });
// //   }
// // });

// // /**
// //  * POST /api/users/push-token
// //  */
// // router.post("/push-token", auth, async (req, res) => {
// //   try {
// //     const { token } = req.body;
// //     if (!token || typeof token !== "string") {
// //       return res.status(400).json({ msg: "Invalid or missing push token." });
// //     }

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.expoPushToken = token;
// //     await user.save();

// //     res.status(200).json({ msg: "Push token saved." });
// //   } catch (err) {
// //     console.error("❌ Error saving push token:", err);
// //     res.status(500).json({ msg: "Failed to save push token." });
// //   }
// // });

// // /**
// //  * POST /api/users/save-session
// //  */
// // router.post("/save-session", auth, async (req, res) => {
// //   try {
// //     const { jobId } = req.body;
// //     if (!jobId) return res.status(400).json({ msg: "Missing jobId." });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.lastActiveJobId = jobId;
// //     await user.save();

// //     res.status(200).json({ msg: "Session saved." });
// //   } catch (err) {
// //     console.error("Error saving session:", err);
// //     res.status(500).json({ msg: "Server error saving session." });
// //   }
// // });

// // /**
// //  * DELETE /api/users/delete
// //  */
// // router.delete("/delete", auth, async (req, res) => {
// //   try {
// //     const userId = req.user._id || req.user.id;
// //     const { reason } = req.body;
// //     const updatedUser = await Users.findByIdAndUpdate(
// //       userId,
// //       {
// //         isDeleted: true,
// //         isActive: false,
// //         deleteReason: reason || "",
// //         deletedAt: new Date(),
// //       },
// //       { new: true }
// //     );

// //     if (!updatedUser) {
// //       return res.status(404).json({ msg: "User not found" });
// //     }

// //     res.json({ msg: "Account successfully marked as deleted" });
// //   } catch (err) {
// //     console.error("❌ Delete user error", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // export default router;


// // // backend/routes/users.js
// // import express from "express";
// // import mongoose from "mongoose";
// // import crypto from "crypto";
// // import NodeGeocoder from "node-geocoder";
// // import multer from "multer";

// // import { auth } from "../middlewares/auth.js";
// // import Users from "../models/Users.js";
// // import Job from "../models/Job.js";

// // const router = express.Router();

// // // Geocoder + multer setup
// // const geocoder = NodeGeocoder({ provider: "openstreetmap" });
// // const storage = multer.memoryStorage();
// // const upload = multer({
// //   storage: multer.memoryStorage(),
// //   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// // });

// // // --- helpers ---
// // const algorithm = "aes-256-cbc";
// // const encryptionKey = process.env.ENCRYPTION_KEY;
// // const encryptionIV = process.env.ENCRYPTION_IV;

// // function encrypt(text) {
// //   if (!encryptionKey || !encryptionIV) return text;
// //   const key = Buffer.from(encryptionKey, "hex");
// //   const iv = Buffer.from(encryptionIV, "hex");
// //   const cipher = crypto.createCipheriv(algorithm, key, iv);
// //   let encrypted = cipher.update(text, "utf8", "hex");
// //   return encrypted + cipher.final("hex");
// // }

// // const toBool = (v) =>
// //   v === true ||
// //   v === "true" ||
// //   v === 1 ||
// //   v === "1" ||
// //   v === "on" ||
// //   v === "yes" ||
// //   v === "y";

// // const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

// // // NOTE: not used by /me; kept for reference
// // // function slimUser(user) {
// // //   if (!user || typeof user !== "object") {
// // //     console.warn("⚠️ slimUser received invalid input:", user);
// // //     return {};
// // //   }
// // //   const {
// // //     password,
// // //     w9,
// // //     businessLicense,
// // //     proofOfInsurance,
// // //     independentContractorAgreement,
// // //     ...rest
// // //   } = user;
// // //   return rest;
// // // }

// // // ✅ Reverted to include full profilePicture string for rendering
// // function toSlimUser(u) {
// //   if (!u) return {};
// //   return {
// //     _id: u._id,
// //     name: u.name,
// //     role: u.role,
// //     trade: u.trade,
// //     serviceType: u.serviceType,
// //     portfolio: u.portfolio || [],
// //     serviceZipcode: u.serviceZipcode || [],
// //     billingTier: u.billingTier,
// //     zipcode: u.zipcode || [],
// //     address: u.address || "",
// //     aboutMe: u.aboutMe || "",
// //     yearsExperience: u.yearsExperience ?? null,
// //     businessName: u.businessName || "",
// //     isActive: !!u.isActive,

// //     // contact + flags
// //     email: u.email || "",
// //     phoneNumber: u.phoneNumber || "",
// //     optInSms: !!u.optInSms,
// //     acceptedICA: !!u.acceptedICA,
// //     icaViewed: !!u.acceptedICA || !!u.independentContractorAgreement,

// //     // billing
// //     stripeAccountId: u.stripeAccountId || "",

// //     // documents (booleans only; no blobs here)
// //     hasDocs: {
// //       w9: !!u.w9,
// //       businessLicense: !!u.businessLicense,
// //       proofOfInsurance: !!u.proofOfInsurance,
// //       independentContractorAgreement: !!u.independentContractorAgreement,
// //     },

// //     // 🔙 include the actual data URL again so Image can render like before
// //     profilePicture: u.profilePicture || "",

// //     // keep boolean for readiness checks (don’t use it to render)
// //     hasProfilePicture: !!u.profilePicture,
// //   };
// // }

// // /**
// //  * GET /api/users/me
// //  * Return all fields the app needs for readiness checks & hydration.
// //  */
// // router.get("/me", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(req.user.id)
// //       .select(
// //         [
// //           "name",
// //           "role",
// //           "trade",
// //           "serviceType",
// //           "portfolio",
// //           "serviceZipcode",
// //           "billingTier",
// //           "zipcode",
// //           "address",
// //           "aboutMe",
// //           "yearsExperience",
// //           "businessName",
// //           "isActive",
// //           "email",
// //           "phoneNumber",
// //           "optInSms",
// //           "acceptedICA",
// //           "stripeAccountId",
// //           // we compute booleans from these but won’t send the raw doc blobs back (except picture)
// //           "w9",
// //           "businessLicense",
// //           "proofOfInsurance",
// //           "independentContractorAgreement",
// //           // ✅ picture is allowed back to the client again
// //           "profilePicture",
// //         ].join(" ")
// //       )
// //       .lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json(toSlimUser(user));
// //   } catch (err) {
// //     console.error("GET /me error:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * GET /api/users/active-providers
// //  */
// // router.get("/active-providers", async (req, res) => {
// //   try {
// //     const activeProviders = await Users.find({
// //       role: "serviceProvider",
// //       isOnline: true, // adjust if needed
// //       location: { $exists: true },
// //     }).select("name serviceType location");

// //     res.json(
// //       activeProviders.map((pro) => ({
// //         id: pro._id,
// //         name: pro.name,
// //         category: pro.serviceType,
// //         coords: {
// //           latitude: pro.location?.coordinates?.[1],
// //           longitude: pro.location?.coordinates?.[0],
// //         },
// //       }))
// //     );
// //   } catch (err) {
// //     console.error("Failed to fetch active providers:", err);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // /**
// //  * GET /api/users/billing-info
// //  */
// // router.get("/billing-info", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(req.user.id)
// //       .select("billingTier isActive")
// //       .lean();
// //     if (!user) return res.status(404).json({ msg: "User not found" });
// //     res.json(user);
// //   } catch (err) {
// //     console.error("Billing info fetch failed:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * GET /api/users/:id
// //  */
// // router.get("/:id([0-9a-fA-F]{24})", auth, async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const userId = id === "me" ? req.user.id : id;

// //     const user = await Users.findById(userId).select(
// //       "name email role aboutMe businessName profilePicture averageRating"
// //     );

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json(user);
// //   } catch (err) {
// //     console.error("GET /users/:id error", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * GET /api/users/me/documents
// //  */
// // router.get("/me/documents", auth, async (req, res) => {
// //   try {
// //     const user = await Users.findById(
// //       req.user.id,
// //       "w9 businessLicense proofOfInsurance independentContractorAgreement"
// //     ).lean();

// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     res.json({
// //       w9: user.w9 || null,
// //       businessLicense: user.businessLicense || null,
// //       proofOfInsurance: user.proofOfInsurance || null,
// //       independentContractorAgreement:
// //         user.independentContractorAgreement || null,
// //     });
// //   } catch (err) {
// //     console.error("GET /me/documents error:", err);
// //     res.status(500).json({ msg: "Server error fetching documents" });
// //   }
// // });

// // /**
// //  * GET /api/users/me/stats
// //  */
// // router.get("/me/stats", auth, async (req, res) => {
// //   if (req.user.role !== "serviceProvider")
// //     return res.status(403).json({ msg: "Only service providers have stats" });

// //   const year = parseInt(req.query.year) || new Date().getFullYear();
// //   const providerId = new mongoose.Types.ObjectId(req.user.id);

// //   try {
// //     const stats = await Job.aggregate([
// //       {
// //         $match: {
// //           acceptedProvider: providerId,
// //           status: "completed",
// //           $expr: { $eq: [{ $year: "$createdAt" }, year] },
// //         },
// //       },
// //       {
// //         $group: {
// //           _id: null,
// //           completedJobsCount: { $sum: 1 },
// //           totalAmountPaid: { $sum: "$totalAmountPaid" },
// //         },
// //       },
// //     ]);

// //     if (!stats.length) {
// //       return res.json({ completedJobsCount: 0, totalAmountPaid: 0 });
// //     }
// //     const { completedJobsCount, totalAmountPaid } = stats[0];
// //     res.json({ completedJobsCount, totalAmountPaid });
// //   } catch (err) {
// //     console.error("Error fetching provider stats:", err);
// //     res.status(500).json({ msg: "Server error fetching stats" });
// //   }
// // });

// // /**
// //  * GET /api/users/providers/active
// //  */
// // router.get("/providers/active", async (req, res) => {
// //   try {
// //     const providers = await Users.find(
// //       { role: "serviceProvider", isActive: true },
// //       "name serviceType location.coordinates"
// //     ).lean();

// //     const data = providers.map((p) => {
// //       const [lng, lat] = p.location?.coordinates || [];
// //       return {
// //         id: p._id,
// //         name: p.name,
// //         serviceType: p.serviceType,
// //         position: lat != null && lng != null ? [lat, lng] : null,
// //       };
// //     });

// //     res.json(data);
// //   } catch (err) {
// //     console.error("GET /providers/active error:", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // /**
// //  * PUT /api/users/profile
// //  * Multipart profile update (files + fields). Coerces booleans explicitly.
// //  */
// // router.put(
// //   "/profile",
// //   auth,
// //   upload.fields([
// //     { name: "w9", maxCount: 1 },
// //     { name: "businessLicense", maxCount: 1 },
// //     { name: "proofOfInsurance", maxCount: 1 },
// //     { name: "independentContractorAgreement", maxCount: 1 },
// //     { name: "profilePicture", maxCount: 1 },
// //   ]),
// //   async (req, res) => {
// //     try {
// //       const user = await Users.findById(req.user.id);
// //       if (!user) return res.status(404).json({ msg: "User not found" });

// //       // text fields (coerce booleans)
// //       for (const [key, value] of Object.entries(req.body)) {
// //         if (value === undefined || value === "") continue;

// //         if (key === "acceptedICA") {
// //           user.acceptedICA = toBool(value);
// //         } else if (key === "optInSms" || key === "optInSMS" || key === "acceptSMS") {
// //           user.optInSms = toBool(value);
// //         } else if (key === "email") {
// //           user.email = String(value).toLowerCase();
// //         } else if (key === "phoneNumber") {
// //           user.phoneNumber = String(value);
// //         } else if (key === "zipcode") {
// //           user.zipcode = toArray(value).map((z) => String(z).trim());
// //         } else if (key === "serviceZipcode") {
// //           user.serviceZipcode = toArray(value).map((z) => String(z).trim());
// //         } else if (key === "yearsExperience") {
// //           user.yearsExperience = Number.isFinite(Number(value))
// //             ? Number(value)
// //             : user.yearsExperience;
// //         } else {
// //           user[key] = value;
// //         }
// //       }

// //       // files
// //       const files = req.files;
// //       if (files?.profilePicture?.[0]) {
// //         const { buffer, mimetype } = files.profilePicture[0];
// //         user.profilePicture = `data:${mimetype};base64,${buffer.toString("base64")}`;
// //       }
// //       if (files?.w9?.[0]) {
// //         user.w9 = files.w9[0].buffer.toString("base64");
// //       }
// //       if (files?.businessLicense?.[0]) {
// //         user.businessLicense = files.businessLicense[0].buffer.toString("base64");
// //       }
// //       if (files?.proofOfInsurance?.[0]) {
// //         user.proofOfInsurance = files.proofOfInsurance[0].buffer.toString("base64");
// //       }
// //       if (files?.independentContractorAgreement?.[0]) {
// //         user.independentContractorAgreement =
// //           files.independentContractorAgreement[0].buffer.toString("base64");
// //       }

// //       await user.save({ validateBeforeSave: false });

// //       // Return slim (with profilePicture string included again)
// //       const fresh = await Users.findById(req.user.id)
// //         .select(
// //           [
// //             "name","role","trade","serviceType","portfolio","serviceZipcode","billingTier",
// //             "zipcode","address","aboutMe","yearsExperience","businessName","isActive",
// //             "email","phoneNumber","optInSms","acceptedICA","stripeAccountId",
// //             "w9","businessLicense","proofOfInsurance","independentContractorAgreement","profilePicture",
// //           ].join(" ")
// //         )
// //         .lean();

// //       return res.json({ msg: "Profile updated", user: toSlimUser(fresh) });
// //     } catch (err) {
// //       console.error("PUT /profile error:", err);
// //       if (err instanceof multer.MulterError) {
// //         return res.status(400).json({ msg: `MulterError: ${err.message}` });
// //       }
// //       return res.status(500).json({ msg: "Server error updating profile" });
// //     }
// //   }
// // );

// // /**
// //  * PATCH /api/users/profile  (JSON-only updates; boolean-safe)
// //  * Also keeps legacy alias /api/users/users/profile for backward compatibility.
// //  */
// // async function patchProfileHandler(req, res) {
// //   try {
// //     const updates = {};
// //     const b = req.body;

// //     if (typeof b.optInSms !== "undefined" || typeof b.optInSMS !== "undefined" || typeof b.acceptSMS !== "undefined") {
// //       updates.optInSms = toBool(b.optInSms ?? b.optInSMS ?? b.acceptSMS);
// //     }
// //     if (typeof b.acceptedICA !== "undefined") {
// //       updates.acceptedICA = toBool(b.acceptedICA);
// //     }
// //     if (typeof b.independentContractorAgreement !== "undefined") {
// //       updates.independentContractorAgreement = String(b.independentContractorAgreement || "");
// //     }
// //     if (b.email) updates.email = String(b.email).toLowerCase();
// //     if (b.phoneNumber) updates.phoneNumber = String(b.phoneNumber);

// //     await Users.findByIdAndUpdate(req.user.id, updates, { new: false });

// //     const fresh = await Users.findById(req.user.id)
// //       .select(
// //         [
// //           "name","role","trade","serviceType","portfolio","serviceZipcode","billingTier",
// //           "zipcode","address","aboutMe","yearsExperience","businessName","isActive",
// //           "email","phoneNumber","optInSms","acceptedICA","stripeAccountId",
// //           "w9","businessLicense","proofOfInsurance","independentContractorAgreement","profilePicture",
// //         ].join(" ")
// //       )
// //       .lean();

// //     return res.json({ user: toSlimUser(fresh) });
// //   } catch (err) {
// //     console.error("PATCH /profile error:", err);
// //     return res.status(500).json({ msg: "Server error updating profile" });
// //   }
// // }

// // router.patch("/profile", auth, patchProfileHandler);
// // // legacy alias in case the app was calling /users/profile
// // router.patch("/users/profile", auth, patchProfileHandler);

// // /**
// //  * PUT /api/users/location
// //  */
// // router.put("/location", auth, async (req, res) => {
// //   try {
// //     const loc = req.body.location;
// //     if (!Array.isArray(loc) || loc.length !== 2)
// //       return res.status(400).json({ msg: "Location must be [lat, lng]" });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found" });

// //     user.location = {
// //       type: "Point",
// //       coordinates: [Number(loc[1]), Number(loc[0])],
// //     };
// //     await user.save({ validateBeforeSave: false });

// //     res.json({ msg: "Location updated", location: user.location });
// //   } catch (err) {
// //     console.error("PUT /location error:", err);
// //     res.status(500).json({ msg: "Server error updating location" });
// //   }
// // });

// // /**
// //  * POST /api/users/push-token
// //  */
// // router.post("/push-token", auth, async (req, res) => {
// //   try {
// //     const { token } = req.body;
// //     if (!token || typeof token !== "string") {
// //       return res.status(400).json({ msg: "Invalid or missing push token." });
// //     }

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.expoPushToken = token;
// //     await user.save();

// //     res.status(200).json({ msg: "Push token saved." });
// //   } catch (err) {
// //     console.error("❌ Error saving push token:", err);
// //     res.status(500).json({ msg: "Failed to save push token." });
// //   }
// // });

// // /**
// //  * POST /api/users/save-session
// //  */
// // router.post("/save-session", auth, async (req, res) => {
// //   try {
// //     const { jobId } = req.body;
// //     if (!jobId) return res.status(400).json({ msg: "Missing jobId." });

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.lastActiveJobId = jobId;
// //     await user.save();

// //     res.status(200).json({ msg: "Session saved." });
// //   } catch (err) {
// //     console.error("Error saving session:", err);
// //     res.status(500).json({ msg: "Server error saving session." });
// //   }
// // });

// // /**
// //  * DELETE /api/users/delete
// //  */
// // router.delete("/delete", auth, async (req, res) => {
// //   try {
// //     const userId = req.user._id || req.user.id;
// //     const { reason } = req.body;
// //     const updatedUser = await Users.findByIdAndUpdate(
// //       userId,
// //       {
// //         isDeleted: true,
// //         isActive: false,
// //         deleteReason: reason || "",
// //         deletedAt: new Date(),
// //       },
// //       { new: true }
// //     );

// //     if (!updatedUser) {
// //       return res.status(404).json({ msg: "User not found" });
// //     }

// //     res.json({ msg: "Account successfully marked as deleted" });
// //   } catch (err) {
// //     console.error("❌ Delete user error", err);
// //     res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // export default router;

// // backend/routes/users.js latest
// import express from "express";
// import mongoose from "mongoose";
// import crypto from "crypto";
// import NodeGeocoder from "node-geocoder";
// import multer from "multer";

// import { auth } from "../middlewares/auth.js";
// import Users from "../models/Users.js";
// import Job from "../models/Job.js";

// const router = express.Router();

// /* ---------------- geocoder + multer ---------------- */
// const geocoder = NodeGeocoder({ provider: "openstreetmap" });
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// });

// /* ---------------- helpers ---------------- */
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

// const asBool = (v) =>
//   v === true ||
//   v === 1 ||
//   v === "1" ||
//   String(v).toLowerCase() === "true";

// /* ---------------- routes ---------------- */

// // GET /api/users/me  (lightweight — no base64 docs)
// router.get("/me", auth, async (req, res) => {
//   try {
//     const fields = [
//       "name",
//       "email",
//       "phoneNumber",
//       "role",
//       "trade",
//       "serviceType",
//       "serviceZipcode",
//       "billingTier",
//       "zipcode",
//       "address",
//       "aboutMe",
//       "yearsExperience",
//       "serviceCost",
//       "businessName",
//       "isActive",
//       "acceptedICA",
//       "optInSms",
//       "stripeAccountId",
//     ].join(" ");

//     const user = await Users.findById(req.user.id).select(fields).lean();
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     res.json(user);
//   } catch (err) {
//     console.error("GET /me error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // GET /api/users/me/summary  (tiny, boolean-only)
// router.get("/me/summary", auth, async (req, res) => {
//   try {
//     const u = await Users.findById(req.user.id)
//       .select(
//         [
//           "name",
//           "email",
//           "phoneNumber",
//           "role",
//           "serviceType",
//           "serviceZipcode",
//           "zipcode",
//           "address",
//           "yearsExperience",
//           "isActive",
//           "acceptedICA",
//           "optInSms",
//           "stripeAccountId",
//           // selected only to compute booleans (NOT returned)
//           "w9",
//           "businessLicense",
//           "proofOfInsurance",
//           "independentContractorAgreement",
//           "profilePicture",
//         ].join(" ")
//       )
//       .lean();

//     if (!u) return res.status(404).json({ msg: "User not found" });

//     const zip = Array.isArray(u.zipcode) ? u.zipcode[0] : u.zipcode;

//     const hasDocs = {
//       w9: !!u.w9,
//       businessLicense: !!u.businessLicense,
//       proofOfInsurance: !!u.proofOfInsurance,
//       icaString: !!u.independentContractorAgreement,
//     };

//     const checklist = {
//       hasEmail: !!u.email,
//       hasPhone: !!u.phoneNumber,
//       hasServiceType: !!u.serviceType,
//       hasZip: !!zip,
//       hasAddress: !!u.address,
//       acceptedICA: !!u.acceptedICA,
//       hasDocsAll:
//         hasDocs.w9 &&
//         hasDocs.businessLicense &&
//         hasDocs.proofOfInsurance &&
//         hasDocs.icaString,
//       hasProfilePicture: !!u.profilePicture,
//     };

//     const profileComplete = Object.values(checklist).every(Boolean);

//     res.json({
//       user: {
//         id: String(u._id),
//         name: u.name,
//         firstName: (u.name || "").split(" ")[0] || "",
//         role: u.role,
//         serviceType: u.serviceType,
//         serviceZipcode: u.serviceZipcode,
//         zipcode: zip,
//         isActive: u.isActive,
//       },
//       checklist,
//       hasDocs,
//       profileComplete,
//       // reasonable signal; adjust as needed for your UX
//       needsOnboarding: !!u.stripeAccountId && !profileComplete,
//     });
//   } catch (err) {
//     console.error("GET /me/summary error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // GET /api/users/active-providers
// router.get("/active-providers", async (req, res) => {
//   try {
//     const activeProviders = await Users.find({
//       role: "serviceProvider",
//       isOnline: true,
//       location: { $exists: true },
//     })
//       .select("name serviceType location")
//       .lean();

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

// // GET /api/users/billing-info
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

// // GET /api/users/:id  (public/minimal)
// router.get("/:id([0-9a-fA-F]{24})", auth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await Users.findById(id)
//       .select("name email role aboutMe businessName profilePicture averageRating")
//       .lean();
//     if (!user) return res.status(404).json({ msg: "User not found" });
//     res.json(user);
//   } catch (err) {
//     console.error("GET /users/:id error", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // GET /api/users/me/documents (explicit blob fetch)
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

// // GET /api/users/me/stats (providers only)
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

// // GET /api/users/providers/active (map-friendly)
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

// // PUT /api/users/profile (multipart) — saves blobs and returns updated (heavy)
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

//       // text fields
//       for (const [key, value] of Object.entries(req.body || {})) {
//         if (value === undefined || value === "") continue;

//         if (key === "acceptedICA") user.acceptedICA = asBool(value);
//         else if (key === "optInSms") user.optInSms = asBool(value);
//         else if (key === "email") user.email = String(value).toLowerCase();
//         else if (key === "phoneNumber") user.phoneNumber = String(value);
//         else user[key] = value;
//       }

//       const files = req.files || {};
//       if (files.profilePicture?.[0]) {
//         const { buffer, mimetype } = files.profilePicture[0];
//         user.profilePicture = `data:${mimetype};base64,${buffer.toString(
//           "base64"
//         )}`;
//       }
//       if (files.w9?.[0]) user.w9 = files.w9[0].buffer.toString("base64");
//       if (files.businessLicense?.[0])
//         user.businessLicense = files.businessLicense[0].buffer.toString("base64");
//       if (files.proofOfInsurance?.[0])
//         user.proofOfInsurance =
//           files.proofOfInsurance[0].buffer.toString("base64");
//       if (files.independentContractorAgreement?.[0])
//         user.independentContractorAgreement =
//           files.independentContractorAgreement[0].buffer.toString("base64");

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

// // PATCH /api/users/profile (JSON-only quick updates)
// router.patch("/profile", auth, async (req, res) => {
//   try {
//     const b = req.body || {};
//     const updates = {};

//     if (typeof b.optInSms !== "undefined") updates.optInSms = asBool(b.optInSms);
//     if (typeof b.acceptedICA !== "undefined") updates.acceptedICA = asBool(b.acceptedICA);
//     if (typeof b.independentContractorAgreement !== "undefined")
//       updates.independentContractorAgreement = String(b.independentContractorAgreement || "");
//     if (b.email) updates.email = String(b.email).toLowerCase();
//     if (b.phoneNumber) updates.phoneNumber = String(b.phoneNumber);

//     const user = await Users.findByIdAndUpdate(req.user.id, updates, {
//       new: true,
//       lean: true,
//     });
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     return res.json(user);
//   } catch (err) {
//     console.error("PATCH /profile error:", err);
//     return res.status(500).json({ msg: "Server error updating profile" });
//   }
// });

// // PUT /api/users/location
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

// // POST /api/users/push-token
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

// // POST /api/users/save-session
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

// // DELETE /api/users/delete (soft delete)
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

// /* ---------------- FIXED: SMS preferences routes ----------------
//    - Path scoped correctly (no duplicate /users prefix)
//    - Uses the proper 'auth' middleware
//    - Uses the correct Users model (not 'User')
// ----------------------------------------------------------------- */

// // GET /api/users/me/sms-preferences
// router.get("/me/sms-preferences", auth, async (req, res) => {
//   try {
//     const user = await Users.findById(req.user.id).select("smsPreferences").lean();
//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json({
//       smsPreferences: user.smsPreferences || { jobUpdates: false, marketing: false },
//     });
//   } catch (err) {
//     console.error("GET /me/sms-preferences error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // PUT /api/users/me/sms-preferences
// router.put("/me/sms-preferences", auth, async (req, res) => {
//   try {
//     const { jobUpdates, marketing } = req.body || {};
//     const isBool = (v) => typeof v === "boolean";

//     if (!isBool(jobUpdates) && !isBool(marketing)) {
//       return res.status(400).json({
//         error: "Provide at least one boolean: jobUpdates or marketing",
//       });
//     }

//     const update = {};
//     if (isBool(jobUpdates)) update["smsPreferences.jobUpdates"] = jobUpdates;
//     if (isBool(marketing)) update["smsPreferences.marketing"] = marketing;

//     const user = await Users.findByIdAndUpdate(
//       req.user.id,
//       { $set: update },
//       { new: true, select: "smsPreferences" }
//     ).lean();

//     if (!user) return res.status(404).json({ error: "User not found" });
//     return res.json({ smsPreferences: user.smsPreferences || { jobUpdates: false, marketing: false } });
//   } catch (err) {
//     console.error("PUT /me/sms-preferences error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;

//working latest
import express from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import NodeGeocoder from "node-geocoder";
import multer from "multer";

import { auth } from "../middlewares/auth.js";
import Users from "../models/Users.js";
import Job from "../models/Job.js";

const router = express.Router();

/* ---------------- geocoder + multer ---------------- */
const geocoder = NodeGeocoder({ provider: "openstreetmap" });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/* ---------------- helpers ---------------- */
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

const asBool = (v) =>
  v === true || v === 1 || v === "1" || String(v).toLowerCase() === "true";

/* ---------------- routes ---------------- */

// GET /api/users/me  (lightweight — no base64 docs)
router.get("/me", auth, async (req, res) => {
  try {
    const fields = [
      "name",
      "email",
      "phoneNumber",
      "role",
      "trade",
      "serviceType",
      "serviceZipcode",
      "billingTier",
      "zipcode",
      "address",
      "aboutMe",
      "yearsExperience",
      "serviceCost",
      "businessName",
      "isActive",
      "acceptedICA",
      "optInSms",
      "stripeAccountId",
    ].join(" ");

    const user = await Users.findById(req.user.id).select(fields).lean();
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/users/me/summary  (tiny, boolean-only)
router.get("/me/summary", auth, async (req, res) => {
  try {
    const u = await Users.findById(req.user.id)
      .select(
        [
          "name",
          "email",
          "phoneNumber",
          "role",
          "serviceType",
          "serviceZipcode",
          "zipcode",
          "address",
          "yearsExperience",
          "isActive",
          "acceptedICA",
          "optInSms",
          "stripeAccountId",
          // selected only to compute booleans (NOT returned)
          "w9",
          "businessLicense",
          "proofOfInsurance",
          "independentContractorAgreement",
          "profilePicture",
          // NEW doc flags
          "governmentId",
          "backgroundCheck",
        ].join(" ")
      )
      .lean();

    if (!u) return res.status(404).json({ msg: "User not found" });

    const zip = Array.isArray(u.zipcode) ? u.zipcode[0] : u.zipcode;

    const hasDocs = {
      w9: !!u.w9,
      businessLicense: !!u.businessLicense,
      proofOfInsurance: !!u.proofOfInsurance,
      icaString: !!u.independentContractorAgreement,
      // NEW booleans
      governmentId: !!u.governmentId,
      backgroundCheck: !!u.backgroundCheck,
    };

    // Keep your existing gating intact (so we don't break onboarding UI);
    // you can add governmentId/backgroundCheck here later if you want them required:
    const checklist = {
      hasEmail: !!u.email,
      hasPhone: !!u.phoneNumber,
      hasServiceType: !!u.serviceType,
      hasZip: !!zip,
      hasAddress: !!u.address,
      acceptedICA: !!u.acceptedICA,
      hasDocsAll:
        hasDocs.w9 &&
        hasDocs.businessLicense &&
        hasDocs.proofOfInsurance &&
        hasDocs.icaString,
      hasProfilePicture: !!u.profilePicture,
      // FYI-only flags
      hasGovernmentId: hasDocs.governmentId,
      hasBackgroundCheck: hasDocs.backgroundCheck,
    };

    const profileComplete = Object.values(checklist).every(Boolean);

    res.json({
      user: {
        id: String(u._id),
        name: u.name,
        firstName: (u.name || "").split(" ")[0] || "",
        role: u.role,
        serviceType: u.serviceType,
        serviceZipcode: u.serviceZipcode,
        zipcode: zip,
        isActive: u.isActive,
      },
      checklist,
      hasDocs,
      profileComplete,
      // reasonable signal; adjust as needed for your UX
      needsOnboarding: !!u.stripeAccountId && !profileComplete,
    });
  } catch (err) {
    console.error("GET /me/summary error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

//update user customer

router.put("/update", auth, async (req, res) => {
  try {
  const { name, email, address, zipcode, phoneNumber } = req.body;
  
  
  const updates = {};
  if (name) updates.name = name;
  if (email) updates.email = String(email).toLowerCase();
  if (address) updates.address = address;
  if (phoneNumber) updates.phoneNumber = String(phoneNumber);
  if (zipcode) updates.zipcode = Array.isArray(zipcode) ? zipcode : [zipcode];
  
  
  const user = await Users.findByIdAndUpdate(req.user.id, updates, {
  new: true,
  lean: true,
  });
  
  
  if (!user) return res.status(404).json({ msg: "User not found" });
  
  
  res.json({ msg: "Profile updated successfully", user });
  } catch (err) {
  console.error("PUT /users/update error:", err);
  res.status(500).json({ msg: "Server error updating profile" });
  }
  });

// GET /api/users/active-providers
router.get("/active-providers", async (req, res) => {
  try {
    const activeProviders = await Users.find({
      role: "serviceProvider",
      isOnline: true,
      location: { $exists: true },
    })
      .select("name serviceType location")
      .lean();

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

// GET /api/users/billing-info
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

// GET /api/users/:id  (public/minimal)
router.get("/:id([0-9a-fA-F]{24})", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findById(id)
      .select("name email role aboutMe businessName profilePicture averageRating")
      .lean();
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GET /users/:id error", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/users/me/documents (explicit blob fetch)
router.get("/me/documents", auth, async (req, res) => {
  try {
    const user = await Users.findById(
      req.user.id,
      [
        "w9",
        "businessLicense",
        "proofOfInsurance",
        "independentContractorAgreement",
        // NEW fields
        "governmentId",
        "backgroundCheck",
      ].join(" ")
    ).lean();

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      w9: user.w9 || null,
      businessLicense: user.businessLicense || null,
      proofOfInsurance: user.proofOfInsurance || null,
      independentContractorAgreement:
        user.independentContractorAgreement || null,
      // NEW
      governmentId: user.governmentId || null,
      backgroundCheck: user.backgroundCheck || null,
    });
  } catch (err) {
    console.error("GET /me/documents error:", err);
    res.status(500).json({ msg: "Server error fetching documents" });
  }
});

// GET /api/users/me/stats (providers only)
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

// GET /api/users/providers/active (map-friendly)
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

// PUT /api/users/profile (multipart) — saves blobs and returns updated (heavy)
router.put(
  "/profile",
  auth,
  upload.fields([
    { name: "w9", maxCount: 1 },
    { name: "businessLicense", maxCount: 1 },
    { name: "proofOfInsurance", maxCount: 1 },
    { name: "independentContractorAgreement", maxCount: 1 },
    { name: "profilePicture", maxCount: 1 },
    // NEW uploads
    { name: "governmentId", maxCount: 1 },
    { name: "backgroundCheck", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const user = await Users.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: "User not found" });

      // text fields
      for (const [key, value] of Object.entries(req.body || {})) {
        if (value === undefined || value === "") continue;

        if (key === "acceptedICA") user.acceptedICA = asBool(value);
        else if (key === "optInSms") user.optInSms = asBool(value);
        else if (key === "email") user.email = String(value).toLowerCase();
        else if (key === "phoneNumber") user.phoneNumber = String(value);
        else user[key] = value;
      }

      const files = req.files || {};
      if (files.profilePicture?.[0]) {
        const { buffer, mimetype } = files.profilePicture[0];
        user.profilePicture = `data:${mimetype};base64,${buffer.toString(
          "base64"
        )}`;
      }
      if (files.w9?.[0]) user.w9 = files.w9[0].buffer.toString("base64");
      if (files.businessLicense?.[0])
        user.businessLicense = files.businessLicense[0].buffer.toString("base64");
      if (files.proofOfInsurance?.[0])
        user.proofOfInsurance =
          files.proofOfInsurance[0].buffer.toString("base64");
      if (files.independentContractorAgreement?.[0])
        user.independentContractorAgreement =
          files.independentContractorAgreement[0].buffer.toString("base64");

      // NEW base64 docs
      if (files.governmentId?.[0])
        user.governmentId = files.governmentId[0].buffer.toString("base64");
      if (files.backgroundCheck?.[0])
        user.backgroundCheck = files.backgroundCheck[0].buffer.toString("base64");

      await user.save({ validateBeforeSave: false });

      res.json({ msg: "Profile updated", user });
    } catch (err) {
      console.error("PUT /profile error:", err);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ msg: `MulterError: ${err.message}` });
      }
      res.status(500).json({ msg: "Server error updating profile" });
    }
  }
);

// PATCH /api/users/profile (JSON-only quick updates)
router.patch("/profile", auth, async (req, res) => {
  try {
    const b = req.body || {};
    const updates = {};

    if (typeof b.optInSms !== "undefined") updates.optInSms = asBool(b.optInSms);
    if (typeof b.acceptedICA !== "undefined") updates.acceptedICA = asBool(b.acceptedICA);
    if (typeof b.independentContractorAgreement !== "undefined")
      updates.independentContractorAgreement = String(b.independentContractorAgreement || "");
    if (b.email) updates.email = String(b.email).toLowerCase();
    if (b.phoneNumber) updates.phoneNumber = String(b.phoneNumber);

    const user = await Users.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      lean: true,
    });
    if (!user) return res.status(404).json({ msg: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error("PATCH /profile error:", err);
    return res.status(500).json({ msg: "Server error updating profile" });
  }
});

// PUT /api/users/location
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

// POST /api/users/push-token
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

// POST /api/users/save-session
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

// DELETE /api/users/delete (soft delete)
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

// --- helpers ---------------------------------------------------------------
const sanitizeLocalPart = (local) => String(local || "").replace(/[^a-zA-Z0-9._-]/g, "");

async function buildDeletedEmail(originalEmail, userId) {
  try {
    const email = String(originalEmail || "").trim();
    const at = email.indexOf("@");
    const domain = at > 0 ? email.slice(at + 1) : "example.invalid";
    const local = at > 0 ? email.slice(0, at) : `user${String(userId).slice(-6)}`;

    const base = `deleted_${sanitizeLocalPart(local)}`;
    let candidate = `${base}@${domain}`; // preferred: deleted_email@gmail.com

    // If someone actually owns candidate already, ensure uniqueness.
    const exists = await Users.exists({ email: candidate });
    if (!exists) return candidate;

    // Fall back to a unique alias with short suffix (keeps domain the same)
    const shortId = String(userId).slice(-6);
    const ts = Date.now().toString(36);
    candidate = `${base}__del_${shortId}_${ts}@${domain}`;
    return candidate;
  } catch {
    return `deleted_${String(userId).slice(-6)}@example.invalid`;
  }
}

// DELETE /api/users/delete (soft delete + email rename)
router.delete("/delete", auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { reason } = req.body || {};

    // Load current user to get existing email & flags
    const user = await Users.findById(userId).select("email isDeleted");
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Don’t double-rename if already deleted and already prefixed
    const alreadyPrefixed = user.email && /^deleted_/i.test(user.email);
    const newEmail = !alreadyPrefixed ? await buildDeletedEmail(user.email, userId) : user.email;

    const update = {
      isDeleted: true,
      isActive: false,
      deleteReason: reason || "",
      deletedAt: new Date(),
      // Email changes (free the original for future sign-up)
      ...(alreadyPrefixed ? {} : { email: newEmail, emailDeletedOriginal: user.email, emailDeletedAt: new Date() }),
      // Optional: ensure login stops working immediately if you rely on verified flag
      emailVerified: false,
    };

    await Users.findByIdAndUpdate(userId, update, { new: false });

    return res.json({ msg: "Account successfully marked as deleted" });
  } catch (err) {
    console.error("❌ Delete user error", err);
    return res.status(500).json({ msg: "Server error" });
  }
});


/* ---------------- FIXED: SMS preferences routes ----------------
   - Path scoped correctly (no duplicate /users prefix)
   - Uses the proper 'auth' middleware
   - Uses the correct Users model (not 'User')
----------------------------------------------------------------- */

// GET /api/users/me/sms-preferences
router.get("/me/sms-preferences", auth, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select("smsPreferences").lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      smsPreferences: user.smsPreferences || { jobUpdates: false, marketing: false },
    });
  } catch (err) {
    console.error("GET /me/sms-preferences error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/users/me/sms-preferences
router.put("/me/sms-preferences", auth, async (req, res) => {
  try {
    const { jobUpdates, marketing } = req.body || {};
    const isBool = (v) => typeof v === "boolean";

    if (!isBool(jobUpdates) && !isBool(marketing)) {
      return res.status(400).json({
        error: "Provide at least one boolean: jobUpdates or marketing",
      });
    }

    const update = {};
    if (isBool(jobUpdates)) update["smsPreferences.jobUpdates"] = jobUpdates;
    if (isBool(marketing)) update["smsPreferences.marketing"] = marketing;

    const user = await Users.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true, select: "smsPreferences" }
    ).lean();

    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ smsPreferences: user.smsPreferences || { jobUpdates: false, marketing: false } });
  } catch (err) {
    console.error("PUT /me/sms-preferences error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
