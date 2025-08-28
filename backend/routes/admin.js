// // backend/routes/admin.js
// import express from "express";
// const router = express.Router();
// import { auth } from "../middlewares/auth.js";

// import Users from "../models/Users.js";
// import Job from "../models/Job.js";
// import Configuration from "../models/Configuration.js";
// import mongoose from "mongoose";
// import { Types } from "mongoose";


// // import { isAdmin } from "../middleware/auth"

// const FEE_RATE = parseFloat(process.env.CONVENIENCE_FEE_RATE) || 0.07;

// // Middleware to check admin role
// const checkAdmin = (req, res, next) => {
//   if (req.user.role !== "admin")
//     return res.status(403).json({ msg: "Access denied" });
//   next();
// };

// router.get("/users", auth, async (req, res) => {
//   // console.log("📥 Admin route hit: /admin/users");
//   try {
//     const providers = await Users.find(
//       { role: "serviceProvider" },
//       "_id name email role serviceType isActive serviceZipcode billingTier"
//     ).lean();

//     res.json({ providers });
//   } catch (err) {
//     console.error("GET /admin/users error:", err);
//     res.status(500).json({ msg: "Server error fetching users." });
//   }
// });

// router.get("/admin/stats", async (req, res) => {
//   try {
//     const [customerCount, providerCount] = await Promise.all([
//       Users.countDocuments({ role: "customer" }),
//       Users.countDocuments({ role: "serviceProvider" }),
//     ]);

//     // console.log("customer count:", customerCount),
//     // console.log("provider count", providerCount);

//     res.json({ totalCustomers: customerCount, totalProviders: providerCount });
//   } catch (err) {
//     console.error("Error fetching user stats:", err);
//     res.status(500).json({ msg: "Failed to fetch stats" });
//   }
// });

// router.get("/convenience-fees", auth, async (req, res) => {
//   try {
//     const PRO_SHARE_RATE = 0.07; // Provider profit-sharing
//     const CUSTOMER_FEE_RATE = 0.07; // Customer markup
//     const TOTAL_FEE_RATE = PRO_SHARE_RATE + CUSTOMER_FEE_RATE;

//     const pipeline = [
//       // Match paid jobs only
//       { $match: { paymentStatus: "paid" } },

//       // Compute subtotal and any additional charge if paid
//       {
//         $project: {
//           month: { $month: "$createdAt" },
//           year: { $year: "$createdAt" },
//           baseTotal: {
//             $add: [
//               { $ifNull: ["$baseAmount", 0] },
//               { $ifNull: ["$adjustmentAmount", 0] },
//               { $ifNull: ["$rushFee", 0] },
//             ],
//           },
//           extra: {
//             $cond: {
//               if: { $eq: ["$additionalChargePaid", true] },
//               then: { $ifNull: ["$additionalCharge", 0] },
//               else: 0,
//             },
//           },
//         },
//       },

//       // Calculate final total with extra
//       {
//         $addFields: {
//           totalBilled: { $add: ["$baseTotal", "$extra"] },
//         },
//       },

//       // Apply total 14% fee (7% customer + 7% provider)
//       {
//         $addFields: {
//           convenienceFee: {
//             $round: [{ $multiply: ["$totalBilled", TOTAL_FEE_RATE] }, 2],
//           },
//         },
//       },

//       // Group by month/year
//       {
//         $group: {
//           _id: { month: "$month", year: "$year" },
//           totalConvenienceFee: { $sum: "$convenienceFee" },
//         },
//       },

//       // Sort results
//       { $sort: { "_id.year": 1, "_id.month": 1 } },
//     ];

//     const monthlyFees = await Job.aggregate(pipeline);

//     const ytdTotal = monthlyFees.reduce(
//       (sum, f) => sum + (f.totalConvenienceFee || 0),
//       0
//     );

//     res.json({ monthlyFees, ytdTotal });
//   } catch (err) {
//     console.error("GET /admin/convenience-fees error:", err);
//     res.status(500).json({ msg: "Server error fetching fees." });
//   }
// });

// // PUT /admin/jobs/cancel-stale
// router.put("/jobs/cancel-stale", auth, async (req, res) => {
//   try {
//     const result = await Job.updateMany(
//       {
//         status: {
//           $in: [
//             "pending",
//             "cancelled-by-customer",
//             "cancelled-by-serviceProvider",
//           ],
//         },
//       },
//       { $set: { status: "cancelled-auto" } }
//     );

//     res.json({ message: `Cancelled ${result.modifiedCount} stale jobs.` });
//   } catch (err) {
//     console.error("❌ Failed to cancel stale jobs:", err);
//     res.status(500).json({ msg: "Failed to cancel stale jobs" });
//   }
// });

// router.get("/configuration", auth, async (req, res) => {
//   try {
//     const cfg = await Configuration.findOne().lean();
//     res.json({ hardcodedEnabled: cfg?.hardcodedEnabled ?? false });
//   } catch (err) {
//     console.error("GET /admin/configuration error:", err);
//     res.status(500).json({ msg: "Server error fetching configuration." });
//   }
// });

// // **NEW** GET /api/admin/jobs
// router.put("/configuration", auth, checkAdmin, async (req, res) => {
//   try {
//     const { hardcodedEnabled } = req.body;
//     if (typeof hardcodedEnabled !== "boolean")
//       return res.status(400).json({ msg: "Invalid value" });

//     let config = await Configuration.findOne({});
//     if (!config) config = new Configuration({ hardcodedEnabled });
//     else config.hardcodedEnabled = hardcodedEnabled;

//     await config.save();
//     res.json(config);
//   } catch (err) {
//     console.error("Error updating config:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// router.get("/jobs", auth, async (req, res) => {
//   console.log("✅ /admin/jobs hit");

//   try {
//     // Check DB connection
//     console.log(
//       "📡 Mongoose connection state:",
//       mongoose.connection.readyState
//     );

//     //
//     const jobs = await Job.find({})
//       .select("status createdAt serviceType") // Avoid large buffers
//       .limit(1000)
//       .lean();

//     console.log("📦 Total jobs found:", jobs.length);

//     // Optional: limit fields to prevent large payload crashes
//     const safeJobs = jobs.map((job) => ({
//       _id: job._id,
//       status: job.status,
//       createdAt: job.createdAt,
//       serviceType: job.serviceType,
//     }));

//     return res.json({ jobs: safeJobs });
//   } catch (err) {
//     console.error("❌ GET /admin/jobs error:", err);
//     return res.status(500).json({ msg: "Server error fetching jobs." });
//   }
// });

// router.get("/complete-providers", auth, async (req, res) => {
//   try {
//     const providers = await Users.find({
//       role: "serviceProvider",
//       isActive: false,
//       w9: { $ne: null },
//       businessLicense: { $ne: null },
//       proofOfInsurance: { $ne: null },
//       independentContractorAgreement: { $ne: null },
//     }).select("_id name");

//     res.json({ providers });
//   } catch (err) {
//     console.error("❌ Failed to fetch complete providers:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // PUT /admin/provider/:id/activate
// router.put("/provider/:id/activate", auth, async (req, res) => {
//   try {
//     const user = await Users.findByIdAndUpdate(
//       req.params.id,
//       { isActive: true },
//       { new: true }
//     );

//     if (!user) return res.status(404).json({ msg: "User not found." });

//     res.json({ msg: "User activated", user });
//   } catch (err) {
//     console.error("❌ Error activating user:", err);
//     res.status(500).json({ msg: "Failed to activate user." });
//   }
// });

// router.put("/provider/:providerId/active",
//   auth,
//   checkAdmin,
//   async (req, res) => {
//     try {
//       const { providerId } = req.params;
//       const { isActive } = req.body; // expected boolean

//       // Fetch provider
//       let provider = await Users.findById(providerId);
//       if (!provider) {
//         return res.status(404).json({ msg: "Provider not found" });
//       }
//       if (provider.role !== "serviceProvider") {
//         return res.status(400).json({ msg: "User is not a service provider" });
//       }

//       provider.isActive = Boolean(isActive);
//       await provider.save();

//       res.json({ msg: "Provider status updated", provider });
//     } catch (err) {
//       console.error("Error updating provider status:", err.message);
//       res.status(500).send("Server error");
//     }
//   }
// );

// router.put("/provider/:providerId/zipcodes",
//   auth,
//   checkAdmin,
//   async (req, res) => {
//     try {
//       const { providerId } = req.params;
//       const { zipCodes } = req.body;

//       const provider = await Users.findById(providerId);
//       if (!provider || provider.role !== "serviceProvider") {
//         return res
//           .status(404)
//           .json({ msg: "Provider not found or invalid role" });
//       }

//       const zipArray = Array.isArray(zipCodes)
//         ? zipCodes.map((z) => String(z).trim()).filter(Boolean)
//         : [String(zipCodes).trim()].filter(Boolean);

//       provider.serviceZipcode = zipArray;
//       await provider.save();

//       return res.json({ msg: "Service ZIP codes updated successfully" });
//     } catch (err) {
//       console.error("PUT /admin/provider/:providerId/zipcodes error:", err);
//       return res.status(500).json({ msg: "Server error updating zip codes" });
//     }
//   }
// );

// export default router;


// // backend/routes/admin.js /latest
// import express from "express";
// const router = express.Router();
// import { auth } from "../middlewares/auth.js";

// import Users from "../models/Users.js";
// import Job from "../models/Job.js";
// import Configuration from "../models/Configuration.js";
// import mongoose, { Types } from "mongoose";

// const FEE_RATE = parseFloat(process.env.CONVENIENCE_FEE_RATE) || 0.07;

// // Middleware to check admin role
// const checkAdmin = (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ msg: "Access denied" });
//   }
//   next();
// };

// // helper to unify binary -> base64 data URL
// function toDataUrl(binOrBuf, mime = "image/jpeg") {
//   if (!binOrBuf) return null;
//   const buf = binOrBuf?.buffer
//     ? Buffer.from(binOrBuf.buffer) // Mongo Binary
//     : Buffer.isBuffer(binOrBuf)
//     ? binOrBuf
//     : Buffer.from(binOrBuf);       // fallback
//   return `data:${mime};base64,${buf.toString("base64")}`;
// }

// function escapeRegex(str = "") {
//   return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

// // ------- USERS LIST -------
// router.get("/users", auth, async (req, res) => {
//   try {
//     const providers = await Users.find(
//       { role: "serviceProvider" },
//       "_id name email role serviceType isActive serviceZipcode billingTier"
//     ).lean();
//     res.json({ providers });
//   } catch (err) {
//     console.error("GET /admin/users error:", err);
//     res.status(500).json({ msg: "Server error fetching users." });
//   }
// });

// // ------- STATS -------
// router.get("/admin/stats", async (req, res) => {
//   try {
//     const [customerCount, providerCount] = await Promise.all([
//       Users.countDocuments({ role: "customer" }),
//       Users.countDocuments({ role: "serviceProvider" }),
//     ]);
//     res.json({ totalCustomers: customerCount, totalProviders: providerCount });
//   } catch (err) {
//     console.error("Error fetching user stats:", err);
//     res.status(500).json({ msg: "Failed to fetch stats" });
//   }
// });

// // ------- FEES -------
// router.get("/convenience-fees", auth, async (req, res) => {
//   try {
//     const PRO_SHARE_RATE = 0.07;
//     const CUSTOMER_FEE_RATE = 0.07;
//     const TOTAL_FEE_RATE = PRO_SHARE_RATE + CUSTOMER_FEE_RATE;

//     const pipeline = [
//       { $match: { paymentStatus: "paid" } },
//       {
//         $project: {
//           month: { $month: "$createdAt" },
//           year: { $year: "$createdAt" },
//           baseTotal: {
//             $add: [
//               { $ifNull: ["$baseAmount", 0] },
//               { $ifNull: ["$adjustmentAmount", 0] },
//               { $ifNull: ["$rushFee", 0] },
//             ],
//           },
//           extra: {
//             $cond: {
//               if: { $eq: ["$additionalChargePaid", true] },
//               then: { $ifNull: ["$additionalCharge", 0] },
//               else: 0,
//             },
//           },
//         },
//       },
//       { $addFields: { totalBilled: { $add: ["$baseTotal", "$extra"] } } },
//       {
//         $addFields: {
//           convenienceFee: {
//             $round: [{ $multiply: ["$totalBilled", TOTAL_FEE_RATE] }, 2],
//           },
//         },
//       },
//       {
//         $group: {
//           _id: { month: "$month", year: "$year" },
//           totalConvenienceFee: { $sum: "$convenienceFee" },
//         },
//       },
//       { $sort: { "_id.year": 1, "_id.month": 1 } },
//     ];

//     const monthlyFees = await Job.aggregate(pipeline);
//     const ytdTotal = monthlyFees.reduce(
//       (sum, f) => sum + (f.totalConvenienceFee || 0),
//       0
//     );

//     res.json({ monthlyFees, ytdTotal });
//   } catch (err) {
//     console.error("GET /admin/convenience-fees error:", err);
//     res.status(500).json({ msg: "Server error fetching fees." });
//   }
// });

// // ------- CANCEL STALE JOBS -------
// router.put("/jobs/cancel-stale", auth, async (req, res) => {
//   try {
//     const result = await Job.updateMany(
//       {
//         status: {
//           $in: ["pending", "cancelled-by-customer", "cancelled-by-serviceProvider"],
//         },
//       },
//       { $set: { status: "cancelled-auto" } }
//     );
//     res.json({ message: `Cancelled ${result.modifiedCount} stale jobs.` });
//   } catch (err) {
//     console.error("❌ Failed to cancel stale jobs:", err);
//     res.status(500).json({ msg: "Failed to cancel stale jobs" });
//   }
// });

// // ------- CONFIG GET/PUT -------
// router.get("/configuration", auth, async (req, res) => {
//   try {
//     const cfg = await Configuration.findOne().lean();
//     res.json({ hardcodedEnabled: cfg?.hardcodedEnabled ?? false });
//   } catch (err) {
//     console.error("GET /admin/configuration error:", err);
//     res.status(500).json({ msg: "Server error fetching configuration." });
//   }
// });

// router.put("/configuration", auth, checkAdmin, async (req, res) => {
//   try {
//     const { hardcodedEnabled } = req.body;
//     if (typeof hardcodedEnabled !== "boolean") {
//       return res.status(400).json({ msg: "Invalid value" });
//     }
//     let config = await Configuration.findOne({});
//     if (!config) config = new Configuration({ hardcodedEnabled });
//     else config.hardcodedEnabled = hardcodedEnabled;
//     await config.save();
//     res.json(config);
//   } catch (err) {
//     console.error("Error updating config:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // ------- JOBS LIST -------
// router.get("/jobs", auth, async (req, res) => {
//   console.log("✅ /admin/jobs hit");
//   try {
//     console.log("📡 Mongoose connection state:", mongoose.connection.readyState);
//     const jobs = await Job.find({})
//       .select("status createdAt serviceType")
//       .limit(1000)
//       .lean();

//     console.log("📦 Total jobs found:", jobs.length);

//     const safeJobs = jobs.map((job) => ({
//       _id: job._id,
//       status: job.status,
//       createdAt: job.createdAt,
//       serviceType: job.serviceType,
//     }));

//     return res.json({ jobs: safeJobs });
//   } catch (err) {
//     console.error("❌ GET /admin/jobs error:", err);
//     return res.status(500).json({ msg: "Server error fetching jobs." });
//   }
// });

// // ------- COMPLETE PROVIDERS -------
// router.get("/complete-providers", auth, async (req, res) => {
//   try {
//     const providers = await Users.find({
//       role: "serviceProvider",
//       isActive: false,
//       w9: { $ne: null },
//       businessLicense: { $ne: null },
//       proofOfInsurance: { $ne: null },
//       independentContractorAgreement: { $ne: null },
//     }).select("_id name");

//     res.json({ providers });
//   } catch (err) {
//     console.error("❌ Failed to fetch complete providers:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // ------- ACTIVATE ONE PROVIDER -------
// router.put("/provider/:id/activate", auth, async (req, res) => {
//   try {
//     const user = await Users.findByIdAndUpdate(
//       req.params.id,
//       { isActive: true },
//       { new: true }
//     );
//     if (!user) return res.status(404).json({ msg: "User not found." });
//     res.json({ msg: "User activated", user });
//   } catch (err) {
//     console.error("❌ Error activating user:", err);
//     res.status(500).json({ msg: "Failed to activate user." });
//   }
// });

// // ------- TOGGLE ACTIVE -------
// router.put("/provider/:providerId/active", auth, checkAdmin, async (req, res) => {
//   try {
//     const { providerId } = req.params;
//     const { isActive } = req.body;

//     const provider = await Users.findById(providerId);
//     if (!provider) return res.status(404).json({ msg: "Provider not found" });
//     if (provider.role !== "serviceProvider") {
//       return res.status(400).json({ msg: "User is not a service provider" });
//     }

//     provider.isActive = Boolean(isActive);
//     await provider.save();

//     res.json({ msg: "Provider status updated", provider });
//   } catch (err) {
//     console.error("Error updating provider status:", err.message);
//     res.status(500).send("Server error");
//   }
// });

// // ------- UPDATE ZIP CODES -------
// router.put("/provider/:providerId/zipcodes", auth, checkAdmin, async (req, res) => {
//   try {
//     const { providerId } = req.params;
//     const { zipCodes } = req.body;

//     const provider = await Users.findById(providerId);
//     if (!provider || provider.role !== "serviceProvider") {
//       return res.status(404).json({ msg: "Provider not found or invalid role" });
//     }

//     const zipArray = Array.isArray(zipCodes)
//       ? zipCodes.map((z) => String(z).trim()).filter(Boolean)
//       : [String(zipCodes).trim()].filter(Boolean);

//     provider.serviceZipcode = zipArray;
//     await provider.save();

//     return res.json({ msg: "Service ZIP codes updated successfully" });
//   } catch (err) {
//     console.error("PUT /admin/provider/:providerId/zipcodes error:", err);
//     return res.status(500).json({ msg: "Server error updating zip codes" });
//   }
// });

// // ------- JOB MEDIA (JSON with data URLs) -------
// router.get("/job-media", auth, checkAdmin, async (req, res) => {
//   try {
//     const { jobId, address } = req.query;

//     if (!jobId && !address) {
//       return res.status(400).json({ msg: "Provide jobId or address" });
//     }

//     const query = {};
//     if (jobId) {
//       if (!Types.ObjectId.isValid(jobId)) {
//         return res.status(400).json({ msg: "Invalid jobId" });
//       }
//       query._id = jobId;
//     } else if (address) {
//       query.address = { $regex: "^" + escapeRegex(address), $options: "i" };
//     }

//     const jobs = await Job.find(query)
//       .select(
//         "_id address arrivalImage arrivalImageMime completionImage completionImageMime progressImages createdAt"
//       )
//       .limit(20)
//       .lean();

//     const payload = jobs.map((j) => {
//       const images = [];

//       if (j.arrivalImage) {
//         images.push({
//           kind: "arrival",
//           at: j.createdAt,
//           src: toDataUrl(j.arrivalImage, j.arrivalImageMime || "image/jpeg"),
//         });
//       }
//       if (j.completionImage) {
//         images.push({
//           kind: "completion",
//           at: j.createdAt,
//           src: toDataUrl(
//             j.completionImage,
//             j.completionImageMime || "image/jpeg"
//           ),
//         });
//       }
//       if (Array.isArray(j.progressImages)) {
//         for (const p of j.progressImages) {
//           images.push({
//             kind: "progress",
//             id: String(p._id || ""),
//             at: p.createdAt || j.createdAt,
//             src: toDataUrl(p.data, p.mimeType || "image/jpeg"),
//           });
//         }
//       }

//       return {
//         jobId: String(j._id),
//         address: j.address,
//         imageCount: images.length,
//         images,
//       };
//     });

//     return res.json({ jobs: payload });
//   } catch (err) {
//     console.error("GET /admin/job-media error:", err);
//     return res.status(500).json({ msg: "Server error fetching media" });
//   }
// });

// export default router;
// backend/routes/admin.js


// import express from "express";
// const router = express.Router();

// import crypto from "crypto";
// import mongoose, { Types } from "mongoose";

// import { auth } from "../middlewares/auth.js";
// import Users from "../models/Users.js";
// import Job from "../models/Job.js";
// import Configuration from "../models/Configuration.js";
// import sendEmail from "../utils/sendEmail.js";


// const FEE_RATE = parseFloat(process.env.CONVENIENCE_FEE_RATE) || 0.07;
// const SIGNING_SECRET =
//   process.env.DOCS_SIGNING_SECRET || process.env.JWT_SECRET || "change-me";

// /* -------------------------------------------------------------------------- */
// /*                               Admin guard                                  */
// /* -------------------------------------------------------------------------- */
// const checkAdmin = (req, res, next) => {
//   if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
//     return res.status(403).json({ msg: "Access denied" });
//   }
//   next();
// };

// /* -------------------------------------------------------------------------- */
// /*                                   Helpers                                  */
// /* -------------------------------------------------------------------------- */

// // Unify binary -> base64 data URL
// function toDataUrl(binOrBuf, mime = "image/jpeg") {
//   if (!binOrBuf) return null;
//   const buf = binOrBuf?.buffer
//     ? Buffer.from(binOrBuf.buffer) // Mongo Binary
//     : Buffer.isBuffer(binOrBuf)
//     ? binOrBuf
//     : Buffer.from(binOrBuf); // fallback
//   return `data:${mime};base64,${buf.toString("base64")}`;
// }

// function escapeRegex(str = "") {
//   return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

// // Absolute URL for RN/email
// function absoluteUrl(req, path) {
//   if (!path) return null;
//   if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
//   const proto = (req.headers["x-forwarded-proto"] || req.protocol || "https")
//     .split(",")[0]
//     .trim();
//   const host = (req.headers["x-forwarded-host"] || req.get("host"))
//     .split(",")[0]
//     .trim();
//   return `${proto}://${host}${path.startsWith("/") ? path : "/" + path}`;
// }

// // base64 “magic bytes” → content-type
// function detectContentType(raw) {
//   if (!raw) return "application/octet-stream";
//   const head = String(raw).slice(0, 12);
//   if (head.startsWith("JVBERi0")) return "application/pdf"; // %PDF
//   if (head.startsWith("iVBORw0")) return "image/png";       // PNG
//   if (head.startsWith("/9j/")) return "image/jpeg";          // JPG
//   return "application/octet-stream";
// }

// // HMAC-signed links so emails / RN can open without Authorization header
// function signDocUrl(req, userId, key, ttlSec = 3600) {
//   const base = req.baseUrl || ""; // e.g. /api/admin
//   const exp = Math.floor(Date.now() / 1000) + ttlSec;
//   const payload = `${userId}:${key}:${exp}`;
//   const sig = crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");
//   const unsignedPath = `${base}/provider/${userId}/documents/${key}/download`;
//   const url = `${unsignedPath}?exp=${exp}&sig=${sig}`;
//   return absoluteUrl(req, url);
// }

// function verifySignature(userId, key, exp, sig) {
//   if (!exp || !sig) return false;
//   const now = Math.floor(Date.now() / 1000);
//   if (Number.isNaN(+exp) || +exp < now) return false;
//   const payload = `${userId}:${key}:${exp}`;
//   const expected = crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");
//   try {
//     return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
//   } catch {
//     return false;
//   }
// }

// // pick nested fields
// const pick = (obj, paths = []) => {
//   for (const p of paths) {
//     const parts = p.split(".");
//     let cur = obj;
//     for (const part of parts) {
//       if (!cur) break;
//       cur = cur[part];
//     }
//     if (cur !== undefined && cur !== null && cur !== "") return cur;
//   }
//   return undefined;
// };

// /* -------------------------------------------------------------------------- */
// /*                             Provider documents                              */
// /* -------------------------------------------------------------------------- */

// function collectProviderDocs(req, user) {
//   const docs = [];
//   const fields = [
//     { key: "id",        label: "Government ID", value: user.idDocument || user.governmentId },
//     { key: "w9",        label: "W-9",           value: user.w9 },
//     { key: "license",   label: "Business License", value: user.businessLicense },
//     { key: "insurance", label: "Insurance",     value: user.proofOfInsurance },
//     { key: "background",label: "Background Check", value: user.backgroundCheck },
//     { key: "ica",       label: "Independent Contractor Agreement", value: user.independentContractorAgreement },
//   ];

//   for (const d of fields) {
//     const raw = d.value;
//     if (!raw) continue;
//     if (typeof raw === "string" && /^viewed@/i.test(raw)) continue; // status string, not a file

//     let url;
//     if (typeof raw === "string" && (raw.startsWith("http") || raw.startsWith("data:") || raw.startsWith("/uploads/"))) {
//       url = absoluteUrl(req, raw);
//     } else {
//       // raw base64 in Mongo (your case) → sign a view URL
//       url = signDocUrl(req, user._id, d.key, 3600);
//     }

//     docs.push({ type: d.label, filename: `${d.key}.pdf`, url });
//   }
//   return docs;
// }

// async function serveDoc(req, res, id, key) {
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     res.status(400).send("Invalid id");
//     return;
//   }
//   const user = await Users.findById(id).lean();
//   if (!user) {
//     res.status(404).send("Provider not found");
//     return;
//   }

//   const raw = {
//     id:        user.idDocument || user.governmentId,
//     w9:        user.w9,
//     license:   user.businessLicense,
//     insurance: user.proofOfInsurance,
//     background:user.backgroundCheck,
//     ica:       user.independentContractorAgreement,
//   }[key];

//   if (!raw || typeof raw !== "string") {
//     res.status(404).send("Document not found");
//     return;
//   }

//   // External URLs or data URLs:
//   if (raw.startsWith("http")) {
//     res.redirect(absoluteUrl(req, raw));
//     return;
//   }
//   if (raw.startsWith("data:")) {
//     const m = raw.match(/^data:([^;]+);base64,(.+)$/);
//     if (!m) { res.status(400).send("Invalid data URL"); return; }
//     const contentType = m[1];
//     const data = Buffer.from(m[2], "base64");
//     res.setHeader("Content-Type", contentType);
//     res.setHeader("Content-Disposition", `inline; filename="${key}.pdf"`);
//     res.send(data);
//     return;
//   }
//   if (raw.startsWith("/uploads/")) {
//     res.redirect(absoluteUrl(req, raw));
//     return;
//   }

//   // Raw base64 stored in Mongo (W-9/license/insurance/background/governmentId)
//   const contentType = detectContentType(raw);
//   const data = Buffer.from(raw, "base64");
//   res.setHeader("Content-Type", contentType);
//   res.setHeader("Content-Disposition", `inline; filename="${key}.pdf"`);
//   res.send(data);
// }

// /* -------------------------------------------------------------------------- */
// /*                                   Routes                                   */
// /* -------------------------------------------------------------------------- */

// /* USERS LIST */
// router.get("/users", auth, async (req, res) => {
//   try {
//     const providers = await Users.find(
//       { role: "serviceProvider" },
//       "_id name email role serviceType isActive serviceZipcode billingTier"
//     ).lean();
//     res.json({ providers });
//   } catch (err) {
//     console.error("GET /admin/users error:", err);
//     res.status(500).json({ msg: "Server error fetching users." });
//   }
// });

// /* STATS (secure) */
// router.get("/admin/stats", auth, checkAdmin, async (req, res) => {
//   try {
//     const [customerCount, providerCount] = await Promise.all([
//       Users.countDocuments({ role: "customer" }),
//       Users.countDocuments({ role: "serviceProvider" }),
//     ]);
//     res.json({ totalCustomers: customerCount, totalProviders: providerCount });
//   } catch (err) {
//     console.error("Error fetching user stats:", err);
//     res.status(500).json({ msg: "Failed to fetch stats" });
//   }
// });

// /* FEES (secure) */
// router.get("/convenience-fees", auth, checkAdmin, async (req, res) => {
//   try {
//     const PRO_SHARE_RATE = 0.07;
//     const CUSTOMER_FEE_RATE = 0.07;
//     const TOTAL_FEE_RATE = PRO_SHARE_RATE + CUSTOMER_FEE_RATE;

//     const pipeline = [
//       { $match: { paymentStatus: "paid" } },
//       {
//         $project: {
//           month: { $month: "$createdAt" },
//           year: { $year: "$createdAt" },
//           baseTotal: {
//             $add: [
//               { $ifNull: ["$baseAmount", 0] },
//               { $ifNull: ["$adjustmentAmount", 0] },
//               { $ifNull: ["$rushFee", 0] },
//             ],
//           },
//           extra: {
//             $cond: {
//               if: { $eq: ["$additionalChargePaid", true] },
//               then: { $ifNull: ["$additionalCharge", 0] },
//               else: 0,
//             },
//           },
//         },
//       },
//       { $addFields: { totalBilled: { $add: ["$baseTotal", "$extra"] } } },
//       {
//         $addFields: {
//           convenienceFee: { $round: [{ $multiply: ["$totalBilled", TOTAL_FEE_RATE] }, 2] },
//         },
//       },
//       {
//         $group: {
//           _id: { month: "$month", year: "$year" },
//           totalConvenienceFee: { $sum: "$convenienceFee" },
//         },
//       },
//       { $sort: { "_id.year": 1, "_id.month": 1 } },
//     ];

//     const monthlyFees = await Job.aggregate(pipeline);
//     const ytdTotal = monthlyFees.reduce(
//       (sum, f) => sum + (f.totalConvenienceFee || 0),
//       0
//     );

//     res.json({ monthlyFees, ytdTotal });
//   } catch (err) {
//     console.error("GET /admin/convenience-fees error:", err);
//     res.status(500).json({ msg: "Server error fetching fees." });
//   }
// });

// /* CANCEL STALE JOBS (secure) */
// router.put("/jobs/cancel-stale", auth, checkAdmin, async (req, res) => {
//   try {
//     const result = await Job.updateMany(
//       {
//         status: {
//           $in: ["pending", "cancelled-by-customer", "cancelled-by-serviceProvider"],
//         },
//       },
//       { $set: { status: "cancelled-auto" } }
//     );
//     res.json({ message: `Cancelled ${result.modifiedCount} stale jobs.` });
//   } catch (err) {
//     console.error("❌ Failed to cancel stale jobs:", err);
//     res.status(500).json({ msg: "Failed to cancel stale jobs" });
//   }
// });

// /* CONFIG GET/PUT (secure) */
// router.get("/configuration", auth, checkAdmin, async (req, res) => {
//   try {
//     const cfg = await Configuration.findOne().lean();
//     res.json({ hardcodedEnabled: cfg?.hardcodedEnabled ?? false });
//   } catch (err) {
//     console.error("GET /admin/configuration error:", err);
//     res.status(500).json({ msg: "Server error fetching configuration." });
//   }
// });

// router.put("/configuration", auth, checkAdmin, async (req, res) => {
//   try {
//     const { hardcodedEnabled } = req.body;
//     if (typeof hardcodedEnabled !== "boolean") {
//       return res.status(400).json({ msg: "Invalid value" });
//     }
//     let config = await Configuration.findOne({});
//     if (!config) config = new Configuration({ hardcodedEnabled });
//     else config.hardcodedEnabled = hardcodedEnabled;
//     await config.save();
//     res.json(config);
//   } catch (err) {
//     console.error("Error updating config:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// /* JOBS LIST (secure) */
// router.get("/jobs", auth, checkAdmin, async (req, res) => {
//   try {
//     const jobs = await Job.find({})
//       .select("status createdAt serviceType")
//       .limit(1000)
//       .lean();

//     const safeJobs = jobs.map((job) => ({
//       _id: job._id,
//       status: job.status,
//       createdAt: job.createdAt,
//       serviceType: job.serviceType,
//     }));

//     return res.json({ jobs: safeJobs });
//   } catch (err) {
//     console.error("❌ GET /admin/jobs error:", err);
//     return res.status(500).json({ msg: "Server error fetching jobs." });
//   }
// });

// /* COMPLETE PROVIDERS (secure) */
// router.get("/complete-providers", auth, checkAdmin, async (req, res) => {
//   try {
//     const providers = await Users.find({
//       role: "serviceProvider",
//       isActive: false,
//       w9: { $ne: null },
//       businessLicense: { $ne: null },
//       proofOfInsurance: { $ne: null },
//       independentContractorAgreement: { $ne: null },
//     }).select("_id name");

//     res.json({ providers });
//   } catch (err) {
//     console.error("❌ Failed to fetch complete providers:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// /* ACTIVATE ONE PROVIDER (secure) */
// router.put("/provider/:id/activate", auth, checkAdmin, async (req, res) => {
//   try {
//     const user = await Users.findByIdAndUpdate(
//       req.params.id,
//       { isActive: true },
//       { new: true }
//     );
//     if (!user) return res.status(404).json({ msg: "User not found." });
//     res.json({ msg: "User activated", user });
//   } catch (err) {
//     console.error("❌ Error activating user:", err);
//     res.status(500).json({ msg: "Failed to activate user." });
//   }
// });

// /* TOGGLE ACTIVE (secure) */
// router.put("/provider/:providerId/active", auth, checkAdmin, async (req, res) => {
//   try {
//     const { providerId } = req.params;
//     const { isActive } = req.body;

//     const provider = await Users.findById(providerId);
//     if (!provider) return res.status(404).json({ msg: "Provider not found" });
//     if (provider.role !== "serviceProvider") {
//       return res.status(400).json({ msg: "User is not a service provider" });
//     }

//     provider.isActive = Boolean(isActive);
//     await provider.save();

//     res.json({ msg: "Provider status updated", provider });
//   } catch (err) {
//     console.error("Error updating provider status:", err.message);
//     res.status(500).send("Server error");
//   }
// });

// /* UPDATE ZIP CODES (secure) */
// router.put("/provider/:providerId/zipcodes", auth, checkAdmin, async (req, res) => {
//   try {
//     const { providerId } = req.params;
//     const { zipCodes } = req.body;

//     const provider = await Users.findById(providerId);
//     if (!provider || provider.role !== "serviceProvider") {
//       return res.status(404).json({ msg: "Provider not found or invalid role" });
//     }

//     const zipArray = Array.isArray(zipCodes)
//       ? zipCodes.map((z) => String(z).trim()).filter(Boolean)
//       : [String(zipCodes).trim()].filter(Boolean);

//     provider.serviceZipcode = zipArray;
//     await provider.save();

//     return res.json({ msg: "Service ZIP codes updated successfully" });
//   } catch (err) {
//     console.error("PUT /admin/provider/:providerId/zipcodes error:", err);
//     return res.status(500).json({ msg: "Server error updating zip codes" });
//   }
// });

// /* JOB MEDIA (secure) */
// router.get("/job-media", auth, checkAdmin, async (req, res) => {
//   try {
//     const { jobId, address } = req.query;

//     if (!jobId && !address) {
//       return res.status(400).json({ msg: "Provide jobId or address" });
//     }

//     const query = {};
//     if (jobId) {
//       if (!Types.ObjectId.isValid(jobId)) {
//         return res.status(400).json({ msg: "Invalid jobId" });
//       }
//       query._id = jobId;
//     } else if (address) {
//       query.address = { $regex: "^" + escapeRegex(address), $options: "i" };
//     }

//     const jobs = await Job.find(query)
//       .select(
//         "_id address arrivalImage arrivalImageMime completionImage completionImageMime progressImages createdAt"
//       )
//       .limit(20)
//       .lean();

//     const payload = jobs.map((j) => {
//       const images = [];

//       if (j.arrivalImage) {
//         images.push({
//           kind: "arrival",
//           at: j.createdAt,
//           src: toDataUrl(j.arrivalImage, j.arrivalImageMime || "image/jpeg"),
//         });
//       }
//       if (j.completionImage) {
//         images.push({
//           kind: "completion",
//           at: j.createdAt,
//           src: toDataUrl(j.completionImage, j.completionImageMime || "image/jpeg"),
//         });
//       }
//       if (Array.isArray(j.progressImages)) {
//         for (const p of j.progressImages) {
//           images.push({
//             kind: "progress",
//             id: String(p._id || ""),
//             at: p.createdAt || j.createdAt,
//             src: toDataUrl(p.data, p.mimeType || "image/jpeg"),
//           });
//         }
//       }

//       return {
//         jobId: String(j._id),
//         address: j.address,
//         imageCount: images.length,
//         images,
//       };
//     });

//     return res.json({ jobs: payload });
//   } catch (err) {
//     console.error("GET /admin/job-media error:", err);
//     return res.status(500).json({ msg: "Server error fetching media" });
//   }
// });

// /* -------------------------------------------------------------------------- */
// /*                      PROVIDER DOCUMENTS (list / view / email)              */
// /* -------------------------------------------------------------------------- */

// /** Returns absolute (signed) links so RN/email can open without auth header */
// router.get("/provider/:id/documents", auth, checkAdmin, async (req, res) => {
//   try {
//     const provider = await Users.findById(req.params.id).lean();
//     if (!provider) return res.status(404).json({ error: "Provider not found" });

//     const documents = collectProviderDocs(req, provider);
//     res.json({ ok: true, documents });
//   } catch (err) {
//     console.error("GET /admin/provider/:id/documents error:", err);
//     res.status(500).json({ error: "Failed to load documents" });
//   }
// });

// /**
//  * View/download a document.
//  * Access:
//  *  - If (?sig&exp) are valid → allow without auth (for email/RN).
//  *  - Else require admin auth + role.
//  */
// router.get("/provider/:id/documents/:key/download", async (req, res, next) => {
//   try {
//     const { id, key } = req.params;
//     const { sig, exp } = req.query;

//     const hasValidSig = verifySignature(id, key, exp, sig);
//     if (!hasValidSig) {
//       return auth(req, res, () =>
//         checkAdmin(req, res, () => serveDoc(req, res, id, key).catch(next))
//       );
//     }

//     await serveDoc(req, res, id, key);
//   } catch (err) {
//     console.error("download doc error", err);
//     return res.status(500).send("Download failed");
//   }
// });

// /** Email all provider docs to support (signed links) */
// // router.post("/provider/:id/documents/email", auth, checkAdmin, async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const user = await Users.findById(id).lean();
// //     if (!user) return res.status(404).json({ ok: false, error: "Provider not found" });

// //     const docs = collectProviderDocs(req, user);
// //     const rows = docs
// //       .map((d) => `<tr><td>${d.type}</td><td><a href="${d.url}">${d.filename}</a></td></tr>`)
// //       .join("");

// //     const html = `
// //       <p>Documents for <strong>${user.name || user.email}</strong></p>
// //       <table border="1" cellspacing="0" cellpadding="4">
// //         ${rows || "<tr><td colspan='2'>No documents.</td></tr>"}
// //       </table>
// //     `;
// //     const text = [
// //       `Documents for ${user.name || user.email}`,
// //       ...docs.map((d) => `${d.type}: ${d.url}`),
// //     ].join("\n");

// //     const to = process.env.SUPPORT_EMAIL || "support@blinqfix.com";
// //     await sendEmail({
// //       to,
// //       subject: `Provider Documents – ${user.name || user.email}`,
// //       text,
// //       html,
// //     });

// //     return res.json({ ok: true, message: `Email sent to ${to}` });
// //   } catch (err) {
// //     console.error("email docs error", err);
// //     return res.status(500).json({ ok: false, error: "Failed to send email" });
// //   }
// // });

// router.post("/provider/:id/documents/email", auth, checkAdmin, async (req, res) => {
//   const rid = (crypto.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2);
//   const t0 = Date.now();

//   try {
//     const { id } = req.params;
//     console.log(`[email-docs:${rid}] start for provider=${id}`);

//     const user = await Users.findById(id).lean();
//     if (!user) {
//       console.warn(`[email-docs:${rid}] provider not found`);
//       return res.status(404).json({ ok: false, error: "Provider not found", rid });
//     }

//     const docs = collectProviderDocs(req, user);
//     console.log(`[email-docs:${rid}] docs collected`, {
//       count: docs.length,
//       names: docs.map((d) => d.filename),
//       to: process.env.SUPPORT_EMAIL || "support@blinqfix.com",
//     });

//     const rows = docs
//       .map((d) => `<tr><td>${d.type}</td><td><a href="${d.url}">${d.filename}</a></td></tr>`)
//       .join("");

//     const html = `
//       <p>Documents for <strong>${user.name || user.email}</strong></p>
//       <table border="1" cellspacing="0" cellpadding="4">
//         ${rows || "<tr><td colspan='2'>No documents.</td></tr>"}
//       </table>
//     `;
//     const text = [
//       `Documents for ${user.name || user.email}`,
//       ...docs.map((d) => `${d.type}: ${d.url}`),
//     ].join("\n");

//     const to = process.env.SUPPORT_EMAIL || "support@blinqfix.com";
//     console.log(`[email-docs:${rid}] calling sendEmail`, {
//       to,
//       subject: `Provider Documents – ${user.name || user.email}`,
//       textPreview: text.slice(0, 80) + (text.length > 80 ? "…" : ""),
//     });

//     await sendEmail({
//       to,
//       subject: `Provider Documents – ${user.name || user.email}`,
//       text,
//       html,
//     });

//     const ms = Date.now() - t0;
//     console.log(`[email-docs:${rid}] SUCCESS in ${ms}ms`);
//     return res.json({ ok: true, message: `Email sent to ${to}`, rid });
//   } catch (err) {
//     const ms = Date.now() - t0;
//     // Pull out sanitized nodemailer fields if present
//     const meta = {
//       message: err?.message,
//       code: err?.code,
//       responseCode: err?.responseCode,
//       command: err?.command,
//       // err.response may contain provider’s "535 authentication rejected" text — useful for debugging
//       response: err?.response,
//     };
//     console.error(`[email-docs:${rid}] ERROR after ${ms}ms`, meta);
//     return res.status(500).json({
//       ok: false,
//       error: "Failed to send email",
//       rid,
//       meta, // this is safe, no secrets
//     });
//   }
// });



// // --- small helpers for this test ---
// function detectContentTypeFromBase64(b64) {
//   if (!b64) return "application/octet-stream";
//   const head = String(b64).slice(0, 12);
//   if (head.startsWith("JVBERi0")) return "application/pdf"; // PDF
//   if (head.startsWith("iVBORw0")) return "image/png";       // PNG
//   if (head.startsWith("/9j/"))     return "image/jpeg";      // JPG
//   return "application/octet-stream";
// }

// // If you already have signDocUrl(req, userId, key, ttlSec), reuse that; otherwise:
// function signDocUrl(req, userId, key, ttlSec = 3600) {
//   // unsigned path under /api/admin
//   const base = req.baseUrl || ""; // e.g. "/api/admin"
//   const unsigned = `${base}/provider/${userId}/documents/${key}/download`;
//   // absolute URL
//   const proto = (req.headers["x-forwarded-proto"] || req.protocol || "https").split(",")[0].trim();
//   const host  = (req.headers["x-forwarded-host"]  || req.get("host")).split(",")[0].trim();
//   return `${proto}://${host}${unsigned}`;
// }

// /**
//  * POST /api/admin/provider/:id/documents/email-one
//  * Body: { key?: "w9"|"license"|"insurance"|"background"|"id"|"ica", mode?: "link"|"attachment" }
//  *
//  * Sends exactly ONE document by email:
//  *  - mode="link"       -> email contains a single hyperlink to view/download
//  *  - mode="attachment" -> email contains the actual file attached (tests size)
//  */
// router.post("/provider/:id/documents/email-one", auth, checkAdmin, async (req, res) => {
//   const rid = (crypto.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2);
//   const t0 = Date.now();

//   try {
//     const { id } = req.params;
//     const key = (req.body?.key || "w9").toLowerCase(); // default 'w9'
//     const mode = (req.body?.mode || "link").toLowerCase(); // default 'link'

//     console.log(`[email-one:${rid}] start`, { providerId: id, key, mode });

//     const user = await Users.findById(id).lean();
//     if (!user) {
//       console.warn(`[email-one:${rid}] provider not found`);
//       return res.status(404).json({ ok: false, error: "Provider not found", rid });
//     }

//     // map key -> stored value
//     const fieldMap = {
//       id:         user.idDocument || user.governmentId,
//       w9:         user.w9,
//       license:    user.businessLicense,
//       insurance:  user.proofOfInsurance,
//       background: user.backgroundCheck,
//       ica:        user.independentContractorAgreement,
//     };

//     let raw = fieldMap[key];
//     if (!raw || typeof raw !== "string" || /^viewed@/i.test(raw)) {
//       console.warn(`[email-one:${rid}] doc not found or not a file`, { key });
//       return res.status(404).json({ ok: false, error: `Document not found for key "${key}"`, rid });
//     }

//     const to = process.env.SUPPORT_EMAIL || "support@blinqfix.com";
//     const subject = `TEST: single doc (${key}) – ${user.name || user.email || user._id}`;
//     let html, text, attachments;

//     if (mode === "attachment") {
//       // Prepare single attachment from base64/data URL
//       let contentType, buffer;
//       if (raw.startsWith("data:")) {
//         const m = raw.match(/^data:([^;]+);base64,(.+)$/);
//         if (!m) {
//           console.error(`[email-one:${rid}] invalid data URL for ${key}`);
//           return res.status(400).json({ ok: false, error: "Invalid data URL", rid });
//         }
//         contentType = m[1];
//         buffer = Buffer.from(m[2], "base64");
//       } else {
//         contentType = detectContentTypeFromBase64(raw);
//         buffer = Buffer.from(raw, "base64");
//       }
//       const filename = `${key}${contentType === "application/pdf" ? ".pdf" : contentType.startsWith("image/") ? ".jpg" : ""}`;
//       console.log(`[email-one:${rid}] attachment prepared`, {
//         key, contentType, bytes: buffer.length, filename,
//       });

//       attachments = [{ filename, content: buffer, contentType }];
//       html = `<p>Attached: <strong>${key}</strong> (${contentType}, ${buffer.length} bytes)</p>`;
//       text = `Attached: ${key} (${contentType}, ${buffer.length} bytes)`;
//     } else {
//       // Link-only email (tiny; rules out size/attachment as cause)
//       const url = signDocUrl(req, user._id, key, 3600);
//       html = `<p>Single document link (<strong>${key}</strong>): <a href="${url}">${url}</a></p>`;
//       text = `Single document link (${key}): ${url}`;
//       console.log(`[email-one:${rid}] link prepared`, { key, url });
//     }

//     // Call your mailer. If your sendEmail supports attachments (optional param), they’ll be included.
//     await sendEmail({ to, subject, text, html, attachments });

//     const ms = Date.now() - t0;
//     console.log(`[email-one:${rid}] SUCCESS in ${ms}ms`);
//     return res.json({
//       ok: true,
//       rid,
//       message: `Single document (${key}) email sent to ${to} in ${ms}ms`,
//       mode,
//     });
//   } catch (err) {
//     const ms = Date.now() - t0;
//     const meta = {
//       message: err?.message,
//       code: err?.code,
//       responseCode: err?.responseCode,
//       command: err?.command,
//       response: err?.response,
//     };
//     console.error(`[email-one:${rid}] ERROR after ${ms}ms`, meta);
//     return res.status(500).json({ ok: false, rid, error: "Failed to send test email", meta });
//   }
// });


// export default router;


// import express from "express";
// const router = express.Router();

// import crypto from "crypto";
// import mongoose, { Types } from "mongoose";

// import { auth } from "../middlewares/auth.js";
// import Users from "../models/Users.js";
// import Job from "../models/Job.js";
// import Configuration from "../models/Configuration.js";
// import sendEmail from "../utils/sendEmail.js";

// const FEE_RATE = parseFloat(process.env.CONVENIENCE_FEE_RATE) || 0.07;
// const SIGNING_SECRET =
//   process.env.DOCS_SIGNING_SECRET || process.env.JWT_SECRET || "change-me";

// /* -------------------------------------------------------------------------- */
// /*                               Admin guard                                  */
// /* -------------------------------------------------------------------------- */
// const checkAdmin = (req, res, next) => {
//   if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
//     return res.status(403).json({ msg: "Access denied" });
//   }
//   next();
// };

// /* -------------------------------------------------------------------------- */
// /*                                   Helpers                                  */
// /* -------------------------------------------------------------------------- */

// // Unify binary -> base64 data URL
// function toDataUrl(binOrBuf, mime = "image/jpeg") {
//   if (!binOrBuf) return null;
//   const buf = binOrBuf?.buffer
//     ? Buffer.from(binOrBuf.buffer) // Mongo Binary
//     : Buffer.isBuffer(binOrBuf)
//     ? binOrBuf
//     : Buffer.from(binOrBuf); // fallback
//   return `data:${mime};base64,${buf.toString("base64")}`;
// }

// function escapeRegex(str = "") {
//   return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

// // Absolute URL for RN/email
// function absoluteUrl(req, path) {
//   if (!path) return null;
//   if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
//   const proto = (req.headers["x-forwarded-proto"] || req.protocol || "https")
//     .split(",")[0]
//     .trim();
//   const host = (req.headers["x-forwarded-host"] || req.get("host"))
//     .split(",")[0]
//     .trim();
//   return `${proto}://${host}${path.startsWith("/") ? path : "/" + path}`;
// }

// // base64 “magic bytes” → content-type
// function detectContentType(raw) {
//   if (!raw) return "application/octet-stream";
//   const head = String(raw).slice(0, 12);
//   if (head.startsWith("JVBERi0")) return "application/pdf"; // %PDF
//   if (head.startsWith("iVBORw0")) return "image/png";       // PNG
//   if (head.startsWith("/9j/")) return "image/jpeg";          // JPG
//   return "application/octet-stream";
// }

// // HMAC-signed links so emails / RN can open without Authorization header
// function signDocUrl(req, userId, key, ttlSec = 3600) {
//   const base = req.baseUrl || ""; // e.g. /api/admin
//   const exp = Math.floor(Date.now() / 1000) + ttlSec;
//   const payload = `${userId}:${key}:${exp}`;
//   const sig = crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");
//   const unsignedPath = `${base}/provider/${userId}/documents/${key}/download`;
//   const url = `${unsignedPath}?exp=${exp}&sig=${sig}`;
//   return absoluteUrl(req, url);
// }

// function verifySignature(userId, key, exp, sig) {
//   if (!exp || !sig) return false;
//   const now = Math.floor(Date.now() / 1000);
//   if (Number.isNaN(+exp) || +exp < now) return false;
//   const payload = `${userId}:${key}:${exp}`;
//   const expected = crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");
//   try {
//     return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
//   } catch {
//     return false;
//   }
// }

// // pick nested fields
// const pick = (obj, paths = []) => {
//   for (const p of paths) {
//     const parts = p.split(".");
//     let cur = obj;
//     for (const part of parts) {
//       if (!cur) break;
//       cur = cur[part];
//     }
//     if (cur !== undefined && cur !== null && cur !== "") return cur;
//   }
//   return undefined;
// };

// /* -------------------------------------------------------------------------- */
// /*                             Provider documents                              */
// /* -------------------------------------------------------------------------- */

// function collectProviderDocs(req, user) {
//   const docs = [];
//   const fields = [
//     { key: "id",        label: "Government ID", value: user.idDocument || user.governmentId },
//     { key: "w9",        label: "W-9",           value: user.w9 },
//     { key: "license",   label: "Business License", value: user.businessLicense },
//     { key: "insurance", label: "Insurance",     value: user.proofOfInsurance },
//     { key: "background",label: "Background Check", value: user.backgroundCheck },
//     { key: "ica",       label: "Independent Contractor Agreement", value: user.independentContractorAgreement },
//   ];

//   for (const d of fields) {
//     const raw = d.value;
//     if (!raw) continue;
//     if (typeof raw === "string" && /^viewed@/i.test(raw)) continue; // status string, not a file

//     let url;
//     if (typeof raw === "string" && (raw.startsWith("http") || raw.startsWith("data:") || raw.startsWith("/uploads/"))) {
//       url = absoluteUrl(req, raw);
//     } else {
//       // raw base64 in Mongo (your case) → sign a view URL
//       url = signDocUrl(req, user._id, d.key, 3600);
//     }

//     docs.push({ type: d.label, filename: `${d.key}.pdf`, url });
//   }
//   return docs;
// }

// async function serveDoc(req, res, id, key) {
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     res.status(400).send("Invalid id");
//     return;
//   }
//   const user = await Users.findById(id).lean();
//   if (!user) {
//     res.status(404).send("Provider not found");
//     return;
//   }

//   const raw = {
//     id:        user.idDocument || user.governmentId,
//     w9:        user.w9,
//     license:   user.businessLicense,
//     insurance: user.proofOfInsurance,
//     background:user.backgroundCheck,
//     ica:       user.independentContractorAgreement,
//   }[key];

//   if (!raw || typeof raw !== "string") {
//     res.status(404).send("Document not found");
//     return;
//   }

//   // External URLs or data URLs:
//   if (raw.startsWith("http")) {
//     res.redirect(absoluteUrl(req, raw));
//     return;
//   }
//   if (raw.startsWith("data:")) {
//     const m = raw.match(/^data:([^;]+);base64,(.+)$/);
//     if (!m) { res.status(400).send("Invalid data URL"); return; }
//     const contentType = m[1];
//     const data = Buffer.from(m[2], "base64");
//     res.setHeader("Content-Type", contentType);
//     res.setHeader("Content-Disposition", `inline; filename="${key}.pdf"`);
//     res.send(data);
//     return;
//   }
//   if (raw.startsWith("/uploads/")) {
//     res.redirect(absoluteUrl(req, raw));
//     return;
//   }

//   // Raw base64 stored in Mongo (W-9/license/insurance/background/governmentId)
//   const contentType = detectContentType(raw);
//   const data = Buffer.from(raw, "base64");
//   res.setHeader("Content-Type", contentType);
//   res.setHeader("Content-Disposition", `inline; filename="${key}.pdf"`);
//   res.send(data);
// }

// /* -------------------------------------------------------------------------- */
// /*                                   Routes                                   */
// /* -------------------------------------------------------------------------- */

// /* USERS LIST */
// router.get("/users", auth, async (req, res) => {
//   try {
//     const providers = await Users.find(
//       { role: "serviceProvider" },
//       "_id name email role serviceType isActive serviceZipcode billingTier"
//     ).lean();
//     res.json({ providers });
//   } catch (err) {
//     console.error("GET /admin/users error:", err);
//     res.status(500).json({ msg: "Server error fetching users." });
//   }
// });

// /* STATS (secure) */
// router.get("/admin/stats", auth, checkAdmin, async (req, res) => {
//   try {
//     const [customerCount, providerCount] = await Promise.all([
//       Users.countDocuments({ role: "customer" }),
//       Users.countDocuments({ role: "serviceProvider" }),
//     ]);
//     res.json({ totalCustomers: customerCount, totalProviders: providerCount });
//   } catch (err) {
//     console.error("Error fetching user stats:", err);
//     res.status(500).json({ msg: "Failed to fetch stats" });
//   }
// });

// /* FEES (secure) */
// router.get("/convenience-fees", auth, checkAdmin, async (req, res) => {
//   try {
//     const PRO_SHARE_RATE = 0.07;
//     const CUSTOMER_FEE_RATE = 0.07;
//     const TOTAL_FEE_RATE = PRO_SHARE_RATE + CUSTOMER_FEE_RATE;

//     const pipeline = [
//       { $match: { paymentStatus: "paid" } },
//       {
//         $project: {
//           month: { $month: "$createdAt" },
//           year: { $year: "$createdAt" },
//           baseTotal: {
//             $add: [
//               { $ifNull: ["$baseAmount", 0] },
//               { $ifNull: ["$adjustmentAmount", 0] },
//               { $ifNull: ["$rushFee", 0] },
//             ],
//           },
//           extra: {
//             $cond: {
//               if: { $eq: ["$additionalChargePaid", true] },
//               then: { $ifNull: ["$additionalCharge", 0] },
//               else: 0,
//             },
//           },
//         },
//       },
//       { $addFields: { totalBilled: { $add: ["$baseTotal", "$extra"] } } },
//       {
//         $addFields: {
//           convenienceFee: { $round: [{ $multiply: ["$totalBilled", TOTAL_FEE_RATE] }, 2] },
//         },
//       },
//       {
//         $group: {
//           _id: { month: "$month", year: "$year" },
//           totalConvenienceFee: { $sum: "$convenienceFee" },
//         },
//       },
//       { $sort: { "_id.year": 1, "_id.month": 1 } },
//     ];

//     const monthlyFees = await Job.aggregate(pipeline);
//     const ytdTotal = monthlyFees.reduce(
//       (sum, f) => sum + (f.totalConvenienceFee || 0),
//       0
//     );

//     res.json({ monthlyFees, ytdTotal });
//   } catch (err) {
//     console.error("GET /admin/convenience-fees error:", err);
//     res.status(500).json({ msg: "Server error fetching fees." });
//   }
// });

// /* CANCEL STALE JOBS (secure) */
// router.put("/jobs/cancel-stale", auth, checkAdmin, async (req, res) => {
//   try {
//     const result = await Job.updateMany(
//       {
//         status: {
//           $in: ["pending", "cancelled-by-customer", "cancelled-by-serviceProvider"],
//         },
//       },
//       { $set: { status: "cancelled-auto" } }
//     );
//     res.json({ message: `Cancelled ${result.modifiedCount} stale jobs.` });
//   } catch (err) {
//     console.error("❌ Failed to cancel stale jobs:", err);
//     res.status(500).json({ msg: "Failed to cancel stale jobs" });
//   }
// });

// /* CONFIG GET/PUT (secure) */
// router.get("/configuration", auth, checkAdmin, async (req, res) => {
//   try {
//     const cfg = await Configuration.findOne().lean();
//     res.json({ hardcodedEnabled: cfg?.hardcodedEnabled ?? false });
//   } catch (err) {
//     console.error("GET /admin/configuration error:", err);
//     res.status(500).json({ msg: "Server error fetching configuration." });
//   }
// });

// router.put("/configuration", auth, checkAdmin, async (req, res) => {
//   try {
//     const { hardcodedEnabled } = req.body;
//     if (typeof hardcodedEnabled !== "boolean") {
//       return res.status(400).json({ msg: "Invalid value" });
//     }
//     let config = await Configuration.findOne({});
//     if (!config) config = new Configuration({ hardcodedEnabled });
//     else config.hardcodedEnabled = hardcodedEnabled;
//     await config.save();
//     res.json(config);
//   } catch (err) {
//     console.error("Error updating config:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// /* JOBS LIST (secure) */
// router.get("/jobs", auth, checkAdmin, async (req, res) => {
//   try {
//     const jobs = await Job.find({})
//       .select("status createdAt serviceType")
//       .limit(1000)
//       .lean();

//     const safeJobs = jobs.map((job) => ({
//       _id: job._id,
//       status: job.status,
//       createdAt: job.createdAt,
//       serviceType: job.serviceType,
//     }));

//     return res.json({ jobs: safeJobs });
//   } catch (err) {
//     console.error("❌ GET /admin/jobs error:", err);
//     return res.status(500).json({ msg: "Server error fetching jobs." });
//   }
// });

// /* COMPLETE PROVIDERS (secure) */
// router.get("/complete-providers", auth, checkAdmin, async (req, res) => {
//   try {
//     const providers = await Users.find({
//       role: "serviceProvider",
//       isActive: false,
//       w9: { $ne: null },
//       businessLicense: { $ne: null },
//       proofOfInsurance: { $ne: null },
//       independentContractorAgreement: { $ne: null },
//     }).select("_id name");

//     res.json({ providers });
//   } catch (err) {
//     console.error("❌ Failed to fetch complete providers:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// /* ACTIVATE ONE PROVIDER (secure) */
// router.put("/provider/:id/activate", auth, checkAdmin, async (req, res) => {
//   try {
//     const user = await Users.findByIdAndUpdate(
//       req.params.id,
//       { isActive: true },
//       { new: true }
//     );
//     if (!user) return res.status(404).json({ msg: "User not found." });
//     res.json({ msg: "User activated", user });
//   } catch (err) {
//     console.error("❌ Error activating user:", err);
//     res.status(500).json({ msg: "Failed to activate user." });
//   }
// });

// /* TOGGLE ACTIVE (secure) */
// router.put("/provider/:providerId/active", auth, checkAdmin, async (req, res) => {
//   try {
//     const { providerId } = req.params;
//     const { isActive } = req.body;

//     const provider = await Users.findById(providerId);
//     if (!provider) return res.status(404).json({ msg: "Provider not found" });
//     if (provider.role !== "serviceProvider") {
//       return res.status(400).json({ msg: "User is not a service provider" });
//     }

//     provider.isActive = Boolean(isActive);
//     await provider.save();

//     res.json({ msg: "Provider status updated", provider });
//   } catch (err) {
//     console.error("Error updating provider status:", err.message);
//     res.status(500).send("Server error");
//   }
// });

// /* UPDATE ZIP CODES (secure) */
// router.put("/provider/:providerId/zipcodes", auth, checkAdmin, async (req, res) => {
//   try {
//     const { providerId } = req.params;
//     const { zipCodes } = req.body;

//     const provider = await Users.findById(providerId);
//     if (!provider || provider.role !== "serviceProvider") {
//       return res.status(404).json({ msg: "Provider not found or invalid role" });
//     }

//     const zipArray = Array.isArray(zipCodes)
//       ? zipCodes.map((z) => String(z).trim()).filter(Boolean)
//       : [String(zipCodes).trim()].filter(Boolean);

//     provider.serviceZipcode = zipArray;
//     await provider.save();

//     return res.json({ msg: "Service ZIP codes updated successfully" });
//   } catch (err) {
//     console.error("PUT /admin/provider/:providerId/zipcodes error:", err);
//     return res.status(500).json({ msg: "Server error updating zip codes" });
//   }
// });

// /* JOB MEDIA (secure) */
// router.get("/job-media", auth, checkAdmin, async (req, res) => {
//   try {
//     const { jobId, address } = req.query;

//     if (!jobId && !address) {
//       return res.status(400).json({ msg: "Provide jobId or address" });
//     }

//     const query = {};
//     if (jobId) {
//       if (!Types.ObjectId.isValid(jobId)) {
//         return res.status(400).json({ msg: "Invalid jobId" });
//       }
//       query._id = jobId;
//     } else if (address) {
//       query.address = { $regex: "^" + escapeRegex(address), $options: "i" };
//     }

//     const jobs = await Job.find(query)
//       .select(
//         "_id address arrivalImage arrivalImageMime completionImage completionImageMime progressImages createdAt"
//       )
//       .limit(20)
//       .lean();

//     const payload = jobs.map((j) => {
//       const images = [];

//       if (j.arrivalImage) {
//         images.push({
//           kind: "arrival",
//           at: j.createdAt,
//           src: toDataUrl(j.arrivalImage, j.arrivalImageMime || "image/jpeg"),
//         });
//       }
//       if (j.completionImage) {
//         images.push({
//           kind: "completion",
//           at: j.createdAt,
//           src: toDataUrl(j.completionImage, j.completionImageMime || "image/jpeg"),
//         });
//       }
//       if (Array.isArray(j.progressImages)) {
//         for (const p of j.progressImages) {
//           images.push({
//             kind: "progress",
//             id: String(p._id || ""),
//             at: p.createdAt || j.createdAt,
//             src: toDataUrl(p.data, p.mimeType || "image/jpeg"),
//           });
//         }
//       }

//       return {
//         jobId: String(j._id),
//         address: j.address,
//         imageCount: images.length,
//         images,
//       };
//     });

//     return res.json({ jobs: payload });
//   } catch (err) {
//     console.error("GET /admin/job-media error:", err);
//     return res.status(500).json({ msg: "Server error fetching media" });
//   }
// });

// /* -------------------------------------------------------------------------- */
// /*                      PROVIDER DOCUMENTS (list / view / email)              */
// /* -------------------------------------------------------------------------- */

// /** Returns absolute (signed) links so RN/email can open without auth header */
// router.get("/provider/:id/documents", auth, checkAdmin, async (req, res) => {
//   try {
//     const provider = await Users.findById(req.params.id).lean();
//     if (!provider) return res.status(404).json({ error: "Provider not found" });

//     const documents = collectProviderDocs(req, provider);
//     res.json({ ok: true, documents });
//   } catch (err) {
//     console.error("GET /admin/provider/:id/documents error:", err);
//     res.status(500).json({ error: "Failed to load documents" });
//   }
// });

// /**
//  * View/download a document.
//  * Access:
//  *  - If (?sig&exp) are valid → allow without auth (for email/RN).
//  *  - Else require admin auth + role.
//  */
// router.get("/provider/:id/documents/:key/download", async (req, res, next) => {
//   try {
//     const { id, key } = req.params;
//     const { sig, exp } = req.query;

//     const hasValidSig = verifySignature(id, key, exp, sig);
//     if (!hasValidSig) {
//       return auth(req, res, () =>
//         checkAdmin(req, res, () => serveDoc(req, res, id, key).catch(next))
//       );
//     }

//     await serveDoc(req, res, id, key);
//   } catch (err) {
//     console.error("download doc error", err);
//     return res.status(500).send("Download failed");
//   }
// });

// /** Email all provider docs to support (signed links) */
// router.post("/provider/:id/documents/email", auth, checkAdmin, async (req, res) => {
//   const rid = (crypto.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2);
//   const t0 = Date.now();

//   try {
//     const { id } = req.params;
//     console.log(`[email-docs:${rid}] start for provider=${id}`);

//     const user = await Users.findById(id).lean();
//     if (!user) {
//       console.warn(`[email-docs:${rid}] provider not found`);
//       return res.status(404).json({ ok: false, error: "Provider not found", rid });
//     }

//     const docs = collectProviderDocs(req, user);
//     console.log(`[email-docs:${rid}] docs collected`, {
//       count: docs.length,
//       names: docs.map((d) => d.filename),
//       to: process.env.SUPPORT_EMAIL || "support@blinqfix.com",
//     });

//     const rows = docs
//       .map((d) => `<tr><td>${d.type}</td><td><a href="${d.url}">${d.filename}</a></td></tr>`)
//       .join("");

//     const html = `
//       <p>Documents for <strong>${user.name || user.email}</strong></p>
//       <table border="1" cellspacing="0" cellpadding="4">
//         ${rows || "<tr><td colspan='2'>No documents.</td></tr>"}
//       </table>
//     `;
//     const text = [
//       `Documents for ${user.name || user.email}`,
//       ...docs.map((d) => `${d.type}: ${d.url}`),
//     ].join("\n");

//     const to = process.env.SUPPORT_EMAIL || "support@blinqfix.com";
//     console.log(`[email-docs:${rid}] calling sendEmail`, {
//       to,
//       subject: `Provider Documents – ${user.name || user.email}`,
//       textPreview: text.slice(0, 80) + (text.length > 80 ? "…" : ""),
//     });

//     await sendEmail({
//       to,
//       subject: `Provider Documents – ${user.name || user.email}`,
//       text,
//       html,
//       // If your sendEmail supports attachments, you could attach small files here.
//       // To avoid size/policy issues, we keep links-only for "email all".
//     });

//     const ms = Date.now() - t0;
//     console.log(`[email-docs:${rid}] SUCCESS in ${ms}ms`);
//     return res.json({ ok: true, message: `Email sent to ${to}`, rid });
//   } catch (err) {
//     const ms = Date.now() - t0;
//     const meta = {
//       message: err?.message,
//       code: err?.code,
//       responseCode: err?.responseCode,
//       command: err?.command,
//       response: err?.response,
//     };
//     console.error(`[email-docs:${rid}] ERROR after ${ms}ms`, meta);
//     return res.status(500).json({
//       ok: false,
//       error: "Failed to send email",
//       rid,
//       meta,
//     });
//   }
// });

// /**
//  * TEST endpoint: send exactly ONE provider document by email.
//  * Body: { key?: "w9"|"license"|"insurance"|"background"|"id"|"ica", mode?: "link"|"attachment" }
//  * - mode="link"      : tiny email with 1 clickable signed link (rules out size/attachments)
//  * - mode="attachment": attaches 1 file (tests message size / provider attachment policy)
//  */
// router.post("/provider/:id/documents/email-one", auth, checkAdmin, async (req, res) => {
//   const rid = (crypto.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2);
//   const t0 = Date.now();

//   try {
//     const { id } = req.params;
//     const key = (req.body?.key ?? "w9").toLowerCase();
//     const mode = (req.body?.mode || "link").toLowerCase();

//     console.log(`[email-one:${rid}] start`, { providerId: id, key, mode });

//     const user = await Users.findById(id).lean();
//     if (!user) {
//       console.warn(`[email-one:${rid}] provider not found`);
//       return res.status(404).json({ ok: false, error: "Provider not found", rid });
//     }

//     const fieldMap = {
//       id:         user.idDocument || user.governmentId,
//       w9:         user.w9,
//       license:    user.businessLicense,
//       insurance:  user.proofOfInsurance,
//       background: user.backgroundCheck,
//       ica:        user.independentContractorAgreement,
//     };

//     let raw = fieldMap[key];
//     if (!raw || typeof raw !== "string" || /^viewed@/i.test(raw)) {
//       console.warn(`[email-one:${rid}] doc not found or not a file`, { key });
//       return res.status(404).json({ ok: false, error: `Document not found for key "${key}"`, rid });
//     }

//     const to = process.env.SUPPORT_EMAIL || "support@blinqfix.com";
//     const subject = `TEST: single doc (${key}) – ${user.name || user.email || user._id}`;
//     let html, text, attachments;

//     if (mode === "attachment") {
//       // Prepare single attachment from base64/data URL
//       let contentType, buffer;
//       if (raw.startsWith("data:")) {
//         const m = raw.match(/^data:([^;]+);base64,(.+)$/);
//         if (!m) {
//           console.error(`[email-one:${rid}] invalid data URL for ${key}`);
//           return res.status(400).json({ ok: false, error: "Invalid data URL", rid });
//         }
//         contentType = m[1];
//         buffer = Buffer.from(m[2], "base64");
//       } else {
//         contentType = detectContentType(raw);
//         buffer = Buffer.from(raw, "base64");
//       }
//       const filename =
//         contentType === "application/pdf" ? `${key}.pdf`
//         : contentType.startsWith("image/") ? `${key}.jpg`
//         : `${key}.bin`;
//       console.log(`[email-one:${rid}] attachment prepared`, {
//         key, contentType, bytes: buffer.length, filename,
//       });

//       attachments = [{ filename, content: buffer, contentType }];
//       html = `<p>Attached: <strong>${key}</strong> (${contentType}, ${buffer.length} bytes)</p>`;
//       text = `Attached: ${key} (${contentType}, ${buffer.length} bytes)`;
//     } else {
//       // Link-only test (tiny email). Signed so it opens without auth.
//       const url = signDocUrl(req, user._id, key, 3600);
//       html = `<p>Single document link (<strong>${key}</strong>): <a href="${url}">${url}</a></p>`;
//       text = `Single document link (${key}): ${url}`;
//       console.log(`[email-one:${rid}] link prepared`, { key, url });
//     }

//     // If your sendEmail supports attachments, they’ll be included (non-breaking).
//     await sendEmail({ to, subject, text, html, attachments });

//     const ms = Date.now() - t0;
//     console.log(`[email-one:${rid}] SUCCESS in ${ms}ms`);
//     return res.json({
//       ok: true,
//       rid,
//       message: `Single document (${key}) email sent to ${to} in ${ms}ms`,
//       mode,
//     });
//   } catch (err) {
//     const ms = Date.now() - t0;
//     const meta = {
//       message: err?.message,
//       code: err?.code,
//       responseCode: err?.responseCode,
//       command: err?.command,
//       response: err?.response,
//     };
//     console.error(`[email-one:${rid}] ERROR after ${ms}ms`, meta);
//     return res.status(500).json({ ok: false, rid, error: "Failed to send test email", meta });
//   }
// });

// export default router;

// import express from "express";
// const router = express.Router();

// import crypto from "crypto";
// import mongoose, { Types } from "mongoose";

// import { auth } from "../middlewares/auth.js";
// import Users from "../models/Users.js";
// import Job from "../models/Job.js";
// import Configuration from "../models/Configuration.js";
// import sendEmail from "../utils/sendEmail.js";

// const FEE_RATE = parseFloat(process.env.CONVENIENCE_FEE_RATE) || 0.07;
// const SIGNING_SECRET =
//   process.env.DOCS_SIGNING_SECRET || process.env.JWT_SECRET || "change-me";

// // Optional safety cap for attachments
// const MAX_ATTACHMENT_BYTES =
//   parseInt(process.env.EMAIL_MAX_ATTACHMENT_BYTES, 10) || 15 * 1024 * 1024;

// /* -------------------------------------------------------------------------- */
// /*                               Admin guard                                  */
// /* -------------------------------------------------------------------------- */
// const checkAdmin = (req, res, next) => {
//   if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
//     return res.status(403).json({ msg: "Access denied" });
//   }
//   next();
// };

// /* -------------------------------------------------------------------------- */
// /*                                   Helpers                                  */
// /* -------------------------------------------------------------------------- */

// // robust coercion + validation for doc keys and modes
// const VALID_DOC_KEYS = new Set(["id", "w9", "license", "insurance", "background", "ica"]);

// function isReactEvent(obj) {
//   // Detect common React SyntheticEvent shapes accidentally sent from the client
//   return !!(
//     obj &&
//     typeof obj === "object" &&
//     ("nativeEvent" in obj ||
//       "_dispatchListeners" in obj ||
//       "isDefaultPrevented" in obj ||
//       "_reactName" in obj ||
//       ("dispatchConfig" in obj && "_targetInst" in obj))
//   );
// }

// function coerceString(value, fallback = "") {
//   if (value == null) return fallback;

//   // Ignore accidentally-posted React events; use fallback
//   if (isReactEvent(value)) return fallback;

//   if (typeof value === "string") return value;
//   if (Array.isArray(value)) return value[0] == null ? fallback : String(value[0]);
//   if (typeof value === "object") {
//     if ("value" in value && value.value != null) return String(value.value);
//     if ("key" in value && value.key != null) return String(value.key);
//     if ("docKey" in value && value.docKey != null) return String(value.docKey);
//   }
//   return String(value);
// }

// function normalizeDocKey(input, fallback = "w9") {
//   const key = coerceString(input, fallback).trim().toLowerCase();
//   if (!VALID_DOC_KEYS.has(key)) {
//     const allowed = Array.from(VALID_DOC_KEYS).join(", ");
//     const err = new Error(`Invalid document key: ${JSON.stringify(input)}. Allowed: ${allowed}`);
//     err.status = 400;
//     throw err;
//   }
//   return key;
// }

// function normalizeMode(input, fallback = "link") {
//   const mode = coerceString(input, fallback).trim().toLowerCase();
//   if (mode !== "link" && mode !== "attachment") {
//     const err = new Error(`Invalid mode: ${JSON.stringify(input)}. Must be "link" or "attachment".`);
//     err.status = 400;
//     throw err;
//   }
//   return mode;
// }

// // Unify binary -> base64 data URL
// function toDataUrl(binOrBuf, mime = "image/jpeg") {
//   if (!binOrBuf) return null;
//   const buf = binOrBuf?.buffer
//     ? Buffer.from(binOrBuf.buffer) // Mongo Binary
//     : Buffer.isBuffer(binOrBuf)
//     ? binOrBuf
//     : Buffer.from(binOrBuf); // fallback
//   return `data:${mime};base64,${buf.toString("base64")}`;
// }

// function escapeRegex(str = "") {
//   return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

// // Absolute URL for RN/email
// function absoluteUrl(req, path) {
//   if (!path) return null;
//   if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
//   const proto = (req.headers["x-forwarded-proto"] || req.protocol || "https")
//     .split(",")[0]
//     .trim();
//   const host = (req.headers["x-forwarded-host"] || req.get("host"))
//     .split(",")[0]
//     .trim();
//   return `${proto}://${host}${path.startsWith("/") ? path : "/" + path}`;
// }

// // base64 “magic bytes” → content-type
// function detectContentType(raw) {
//   if (!raw) return "application/octet-stream";
//   const head = String(raw).slice(0, 12);
//   if (head.startsWith("JVBERi0")) return "application/pdf"; // %PDF
//   if (head.startsWith("iVBORw0")) return "image/png"; // PNG
//   if (head.startsWith("/9j/")) return "image/jpeg"; // JPG
//   return "application/octet-stream";
// }

// // HMAC-signed links so emails / RN can open without Authorization header
// function signDocUrl(req, userId, key, ttlSec = 3600) {
//   const safeKey = normalizeDocKey(key);
//   const base = req.baseUrl || ""; // e.g. /api/admin
//   const exp = Math.floor(Date.now() / 1000) + ttlSec;
//   const payload = `${userId}:${safeKey}:${exp}`;
//   const sig = crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");
//   const unsignedPath = `${base}/provider/${userId}/documents/${safeKey}/download`;
//   const url = `${unsignedPath}?exp=${exp}&sig=${sig}`;
//   return absoluteUrl(req, url);
// }

// function verifySignature(userId, key, exp, sig) {
//   if (!exp || !sig) return false;
//   const now = Math.floor(Date.now() / 1000);
//   if (Number.isNaN(+exp) || +exp < now) return false;
//   const safeKey = normalizeDocKey(key);
//   const payload = `${userId}:${safeKey}:${exp}`;
//   const expected = crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");
//   try {
//     return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
//   } catch {
//     return false;
//   }
// }

// // pick nested fields
// const pick = (obj, paths = []) => {
//   for (const p of paths) {
//     const parts = p.split(".");
//     let cur = obj;
//     for (const part of parts) {
//       if (!cur) break;
//       cur = cur[part];
//     }
//     if (cur !== undefined && cur !== null && cur !== "") return cur;
//   }
//   return undefined;
// };

// /* -------------------------------------------------------------------------- */
// /*                             Provider documents                              */
// /* -------------------------------------------------------------------------- */

// function collectProviderDocs(req, user) {
//   const docs = [];
//   const fields = [
//     { key: "id",        label: "Government ID", value: user.idDocument || user.governmentId },
//     { key: "w9",        label: "W-9",           value: user.w9 },
//     { key: "license",   label: "Business License", value: user.businessLicense },
//     { key: "insurance", label: "Insurance",     value: user.proofOfInsurance },
//     { key: "background",label: "Background Check", value: user.backgroundCheck },
//     { key: "ica",       label: "Independent Contractor Agreement", value: user.independentContractorAgreement },
//   ];

//   for (const d of fields) {
//     const raw = d.value;
//     if (!raw) continue;
//     if (typeof raw === "string" && /^viewed@/i.test(raw)) continue; // status string, not a file

//     let url;
//     if (typeof raw === "string" && (raw.startsWith("http") || raw.startsWith("data:") || raw.startsWith("/uploads/"))) {
//       url = absoluteUrl(req, raw);
//     } else {
//       // raw base64 in Mongo (your case) → sign a view URL
//       url = signDocUrl(req, user._id, d.key, 3600);
//     }

//     docs.push({ type: d.label, filename: `${d.key}.pdf`, url });
//   }
//   return docs;
// }

// async function serveDoc(req, res, id, key) {
//   const safeKey = normalizeDocKey(key);

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     res.status(400).send("Invalid id");
//     return;
//   }
//   const user = await Users.findById(id).lean();
//   if (!user) {
//     res.status(404).send("Provider not found");
//     return;
//   }

//   const raw = {
//     id:        user.idDocument || user.governmentId,
//     w9:        user.w9,
//     license:   user.businessLicense,
//     insurance: user.proofOfInsurance,
//     background:user.backgroundCheck,
//     ica:       user.independentContractorAgreement,
//   }[safeKey];

//   if (!raw || typeof raw !== "string") {
//     res.status(404).send("Document not found");
//     return;
//   }

//   // External URLs or data URLs:
//   if (raw.startsWith("http")) {
//     res.redirect(absoluteUrl(req, raw));
//     return;
//   }
//   if (raw.startsWith("data:")) {
//     const m = raw.match(/^data:([^;]+);base64,(.+)$/);
//     if (!m) { res.status(400).send("Invalid data URL"); return; }
//     const contentType = m[1];
//     const data = Buffer.from(m[2], "base64");
//     res.setHeader("Content-Type", contentType);
//     res.setHeader("Content-Disposition", `inline; filename="${safeKey}.pdf"`);
//     res.send(data);
//     return;
//   }
//   if (raw.startsWith("/uploads/")) {
//     res.redirect(absoluteUrl(req, raw));
//     return;
//   }

//   // Raw base64 stored in Mongo (W-9/license/insurance/background/governmentId)
//   const contentType = detectContentType(raw);
//   const data = Buffer.from(raw, "base64");
//   res.setHeader("Content-Type", contentType);
//   res.setHeader("Content-Disposition", `inline; filename="${safeKey}.pdf"`);
//   res.send(data);
// }

// /* -------------------------------------------------------------------------- */
// /*                                   Routes                                   */
// /* -------------------------------------------------------------------------- */

// /* USERS LIST */
// router.get("/users", auth, async (req, res) => {
//   try {
//     const providers = await Users.find(
//       { role: "serviceProvider" },
//       "_id name email role serviceType isActive serviceZipcode billingTier"
//     ).lean();
//     res.json({ providers });
//   } catch (err) {
//     console.error("GET /admin/users error:", err);
//     res.status(500).json({ msg: "Server error fetching users." });
//   }
// });

// /* STATS (secure) */
// // NOTE: If this router mounts at /api/admin, this path becomes /api/admin/admin/stats.
// router.get("/admin/stats", auth, checkAdmin, async (req, res) => {
//   try {
//     const [customerCount, providerCount] = await Promise.all([
//       Users.countDocuments({ role: "customer" }),
//       Users.countDocuments({ role: "serviceProvider" }),
//     ]);
//     res.json({ totalCustomers: customerCount, totalProviders: providerCount });
//   } catch (err) {
//     console.error("Error fetching user stats:", err);
//     res.status(500).json({ msg: "Failed to fetch stats" });
//   }
// });

// /* FEES (secure) */
// router.get("/convenience-fees", auth, checkAdmin, async (req, res) => {
//   try {
//     const PRO_SHARE_RATE = 0.07;
//     const CUSTOMER_FEE_RATE = 0.07;
//     const TOTAL_FEE_RATE = PRO_SHARE_RATE + CUSTOMER_FEE_RATE;

//     const pipeline = [
//       { $match: { paymentStatus: "paid" } },
//       {
//         $project: {
//           month: { $month: "$createdAt" },
//           year: { $year: "$createdAt" },
//           baseTotal: {
//             $add: [
//               { $ifNull: ["$baseAmount", 0] },
//               { $ifNull: ["$adjustmentAmount", 0] },
//               { $ifNull: ["$rushFee", 0] },
//             ],
//           },
//           extra: {
//             $cond: {
//               if: { $eq: ["$additionalChargePaid", true] },
//               then: { $ifNull: ["$additionalCharge", 0] },
//               else: 0,
//             },
//           },
//         },
//       },
//       { $addFields: { totalBilled: { $add: ["$baseTotal", "$extra"] } } },
//       {
//         $addFields: {
//           convenienceFee: { $round: [{ $multiply: ["$totalBilled", TOTAL_FEE_RATE] }, 2] },
//         },
//       },
//       {
//         $group: {
//           _id: { month: "$month", year: "$year" },
//           totalConvenienceFee: { $sum: "$convenienceFee" },
//         },
//       },
//       { $sort: { "_id.year": 1, "_id.month": 1 } },
//     ];

//     const monthlyFees = await Job.aggregate(pipeline);
//     const ytdTotal = monthlyFees.reduce(
//       (sum, f) => sum + (f.totalConvenienceFee || 0),
//       0
//     );

//     res.json({ monthlyFees, ytdTotal });
//   } catch (err) {
//     console.error("GET /admin/convenience-fees error:", err);
//     res.status(500).json({ msg: "Server error fetching fees." });
//   }
// });

// /* CANCEL STALE JOBS (secure) */
// router.put("/jobs/cancel-stale", auth, checkAdmin, async (req, res) => {
//   try {
//     const result = await Job.updateMany(
//       {
//         status: {
//           $in: ["pending", "cancelled-by-customer", "cancelled-by-serviceProvider"],
//         },
//       },
//       { $set: { status: "cancelled-auto" } }
//     );
//     res.json({ message: `Cancelled ${result.modifiedCount} stale jobs.` });
//   } catch (err) {
//     console.error("❌ Failed to cancel stale jobs:", err);
//     res.status(500).json({ msg: "Failed to cancel stale jobs" });
//   }
// });

// /* CONFIG GET/PUT (secure) */
// router.get("/configuration", auth, checkAdmin, async (req, res) => {
//   try {
//     const cfg = await Configuration.findOne().lean();
//     res.json({ hardcodedEnabled: cfg?.hardcodedEnabled ?? false });
//   } catch (err) {
//     console.error("GET /admin/configuration error:", err);
//     res.status(500).json({ msg: "Server error fetching configuration." });
//   }
// });

// router.put("/configuration", auth, checkAdmin, async (req, res) => {
//   try {
//     const { hardcodedEnabled } = req.body;
//     if (typeof hardcodedEnabled !== "boolean") {
//       return res.status(400).json({ msg: "Invalid value" });
//     }
//     let config = await Configuration.findOne({});
//     if (!config) config = new Configuration({ hardcodedEnabled });
//     else config.hardcodedEnabled = hardcodedEnabled;
//     await config.save();
//     res.json(config);
//   } catch (err) {
//     console.error("Error updating config:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// /* JOBS LIST (secure) */
// router.get("/jobs", auth, checkAdmin, async (req, res) => {
//   try {
//     const jobs = await Job.find({})
//       .select("status createdAt serviceType")
//       .limit(1000)
//       .lean();

//     const safeJobs = jobs.map((job) => ({
//       _id: job._id,
//       status: job.status,
//       createdAt: job.createdAt,
//       serviceType: job.serviceType,
//     }));

//     return res.json({ jobs: safeJobs });
//   } catch (err) {
//     console.error("❌ GET /admin/jobs error:", err);
//     return res.status(500).json({ msg: "Server error fetching jobs." });
//   }
// });

// /* COMPLETE PROVIDERS (secure) */
// router.get("/complete-providers", auth, checkAdmin, async (req, res) => {
//   try {
//     const providers = await Users.find({
//       role: "serviceProvider",
//       isActive: false,
//       w9: { $ne: null },
//       businessLicense: { $ne: null },
//       proofOfInsurance: { $ne: null },
//       independentContractorAgreement: { $ne: null },
//     }).select("_id name");

//     res.json({ providers });
//   } catch (err) {
//     console.error("❌ Failed to fetch complete providers:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// /* ACTIVATE ONE PROVIDER (secure) */
// router.put("/provider/:id/activate", auth, checkAdmin, async (req, res) => {
//   try {
//     const user = await Users.findByIdAndUpdate(
//       req.params.id,
//       { isActive: true },
//       { new: true }
//     );
//     if (!user) return res.status(404).json({ msg: "User not found." });
//     res.json({ msg: "User activated", user });
//   } catch (err) {
//     console.error("❌ Error activating user:", err);
//     res.status(500).json({ msg: "Failed to activate user." });
//   }
// });

// /* TOGGLE ACTIVE (secure) */
// router.put("/provider/:providerId/active", auth, checkAdmin, async (req, res) => {
//   try {
//     const { providerId } = req.params;
//     const { isActive } = req.body;

//     const provider = await Users.findById(providerId);
//     if (!provider) return res.status(404).json({ msg: "Provider not found" });
//     if (provider.role !== "serviceProvider") {
//       return res.status(400).json({ msg: "User is not a service provider" });
//     }

//     provider.isActive = Boolean(isActive);
//     await provider.save();

//     res.json({ msg: "Provider status updated", provider });
//   } catch (err) {
//     console.error("Error updating provider status:", err.message);
//     res.status(500).send("Server error");
//   }
// });

// /* UPDATE ZIP CODES (secure) */
// router.put("/provider/:providerId/zipcodes", auth, checkAdmin, async (req, res) => {
//   try {
//     const { providerId } = req.params;
//     const { zipCodes } = req.body;

//     const provider = await Users.findById(providerId);
//     if (!provider || provider.role !== "serviceProvider") {
//       return res.status(404).json({ msg: "Provider not found or invalid role" });
//     }

//     const zipArray = Array.isArray(zipCodes)
//       ? zipCodes.map((z) => String(z).trim()).filter(Boolean)
//       : [String(zipCodes).trim()].filter(Boolean);

//     provider.serviceZipcode = zipArray;
//     await provider.save();

//     return res.json({ msg: "Service ZIP codes updated successfully" });
//   } catch (err) {
//     console.error("PUT /admin/provider/:providerId/zipcodes error:", err);
//     return res.status(500).json({ msg: "Server error updating zip codes" });
//   }
// });

// /* JOB MEDIA (secure) */
// router.get("/job-media", auth, checkAdmin, async (req, res) => {
//   try {
//     const { jobId, address } = req.query;

//     if (!jobId && !address) {
//       return res.status(400).json({ msg: "Provide jobId or address" });
//     }

//     const query = {};
//     if (jobId) {
//       if (!Types.ObjectId.isValid(jobId)) {
//         return res.status(400).json({ msg: "Invalid jobId" });
//       }
//       query._id = jobId;
//     } else if (address) {
//       query.address = { $regex: "^" + escapeRegex(address), $options: "i" };
//     }

//     const jobs = await Job.find(query)
//       .select(
//         "_id address arrivalImage arrivalImageMime completionImage completionImageMime progressImages createdAt"
//       )
//       .limit(20)
//       .lean();

//     const payload = jobs.map((j) => {
//       const images = [];

//       if (j.arrivalImage) {
//         images.push({
//           kind: "arrival",
//           at: j.createdAt,
//           src: toDataUrl(j.arrivalImage, j.arrivalImageMime || "image/jpeg"),
//         });
//       }
//       if (j.completionImage) {
//         images.push({
//           kind: "completion",
//           at: j.createdAt,
//           src: toDataUrl(j.completionImage, j.completionImageMime || "image/jpeg"),
//         });
//       }
//       if (Array.isArray(j.progressImages)) {
//         for (const p of j.progressImages) {
//           images.push({
//             kind: "progress",
//             id: String(p._id || ""),
//             at: p.createdAt || j.createdAt,
//             src: toDataUrl(p.data, p.mimeType || "image/jpeg"),
//           });
//         }
//       }

//       return {
//         jobId: String(j._id),
//         address: j.address,
//         imageCount: images.length,
//         images,
//       };
//     });

//     return res.json({ jobs: payload });
//   } catch (err) {
//     console.error("GET /admin/job-media error:", err);
//     return res.status(500).json({ msg: "Server error fetching media" });
//   }
// });

// /* -------------------------------------------------------------------------- */
// /*                      PROVIDER DOCUMENTS (list / view / email)              */
// /* -------------------------------------------------------------------------- */

// /** Returns absolute (signed) links so RN/email can open without auth header */
// router.get("/provider/:id/documents", auth, checkAdmin, async (req, res) => {
//   try {
//     const provider = await Users.findById(req.params.id).lean();
//     if (!provider) return res.status(404).json({ error: "Provider not found" });

//     const documents = collectProviderDocs(req, provider);
//     res.json({ ok: true, documents });
//   } catch (err) {
//     console.error("GET /admin/provider/:id/documents error:", err);
//     res.status(500).json({ error: "Failed to load documents" });
//   }
// });

// /**
//  * View/download a document.
//  * Access:
//  *  - If (?sig&exp) are valid → allow without auth (for email/RN).
//  *  - Else require admin auth + role.
//  */
// router.get("/provider/:id/documents/:key/download", async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const rawKey = req.params.key;
//     const safeKey = normalizeDocKey(rawKey);
//     const { sig, exp } = req.query;

//     const hasValidSig = verifySignature(id, safeKey, exp, sig);
//     if (!hasValidSig) {
//       return auth(req, res, () =>
//         checkAdmin(req, res, async () => {
//           try {
//             await serveDoc(req, res, id, safeKey);
//           } catch (e) {
//             next(e);
//           }
//         })
//       );
//     }

//     await serveDoc(req, res, id, safeKey);
//   } catch (err) {
//     console.error("download doc error", err);
//     return res.status(500).send("Download failed");
//   }
// });

// /** Email all provider docs to support (signed links) */
// router.post("/provider/:id/documents/email", auth, checkAdmin, async (req, res) => {
//   const rid = (crypto.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2);
//   const t0 = Date.now();

//   try {
//     const { id } = req.params;
//     console.log(`[email-docs:${rid}] start for provider=${id}`);

//     const user = await Users.findById(id).lean();
//     if (!user) {
//       console.warn(`[email-docs:${rid}] provider not found`);
//       return res.status(404).json({ ok: false, error: "Provider not found", rid });
//     }

//     const docs = collectProviderDocs(req, user);
//     console.log(`[email-docs:${rid}] docs collected`, {
//       count: docs.length,
//       names: docs.map((d) => d.filename),
//       to: process.env.SUPPORT_EMAIL || "support@blinqfix.com",
//     });

//     const rows = docs
//       .map((d) => `<tr><td>${d.type}</td><td><a href="${d.url}">${d.filename}</a></td></tr>`)
//       .join("");

//     const html = `
//       <p>Documents for <strong>${user.name || user.email}</strong></p>
//       <table border="1" cellspacing="0" cellpadding="4">
//         ${rows || "<tr><td colspan='2'>No documents.</td></tr>"}
//       </table>
//     `;
//     const text = [
//       `Documents for ${user.name || user.email}`,
//       ...docs.map((d) => `${d.type}: ${d.url}`),
//     ].join("\n");

//     const to = process.env.SUPPORT_EMAIL || "support@blinqfix.com";
//     console.log(`[email-docs:${rid}] calling sendEmail`, {
//       to,
//       subject: `Provider Documents – ${user.name || user.email}`,
//       textPreview: text.slice(0, 80) + (text.length > 80 ? "…" : ""),
//     });

//     await sendEmail({
//       to,
//       subject: `Provider Documents – ${user.name || user.email}`,
//       text,
//       html,
//     });

//     const ms = Date.now() - t0;
//     console.log(`[email-docs:${rid}] SUCCESS in ${ms}ms`);
//     return res.json({ ok: true, message: `Email sent to ${to}`, rid });
//   } catch (err) {
//     const ms = Date.now() - t0;
//     const meta = {
//       message: err?.message,
//       code: err?.code,
//       responseCode: err?.responseCode,
//       command: err?.command,
//       response: err?.response,
//     };
//     console.error(`[email-docs:${rid}] ERROR after ${ms}ms`, meta);
//     return res.status(500).json({
//       ok: false,
//       error: "Failed to send email",
//       rid,
//       meta,
//     });
//   }
// });

// /**
//  * TEST endpoint: send exactly ONE provider document by email.
//  * Body/query: key? = "w9"|"license"|"insurance"|"background"|"id"|"ica", mode? = "link"|"attachment"
//  * - mode="link"      : tiny email with 1 clickable signed link (rules out size/attachments)
//  * - mode="attachment": attaches 1 file (tests message size / provider attachment policy)
//  */
// router.post("/provider/:id/documents/email-one", auth, checkAdmin, async (req, res) => {
//   const rid = (crypto.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2);
//   const t0 = Date.now();

//   try {
//     const { id } = req.params;

//     // accept multiple shapes/locations + guard against React events
//     const rawKey  = req.body?.key ?? req.body?.docKey ?? req.query?.key ?? "w9";
//     const rawMode = req.body?.mode ?? req.query?.mode ?? "link";

//     const key  = normalizeDocKey(rawKey, "w9");
//     const mode = normalizeMode(rawMode, "link");

//     console.log(`[email-one:${rid}] start`, { providerId: id, key, mode });

//     const user = await Users.findById(id).lean();
//     if (!user) {
//       console.warn(`[email-one:${rid}] provider not found`);
//       return res.status(404).json({ ok: false, error: "Provider not found", rid });
//     }

//     const fieldMap = {
//       id:         user.idDocument || user.governmentId,
//       w9:         user.w9,
//       license:    user.businessLicense,
//       insurance:  user.proofOfInsurance,
//       background: user.backgroundCheck,
//       ica:        user.independentContractorAgreement,
//     };

//     let raw = fieldMap[key];
//     if (!raw || typeof raw !== "string" || /^viewed@/i.test(raw)) {
//       console.warn(`[email-one:${rid}] doc not found or not a file`, { key });
//       return res.status(404).json({ ok: false, error: `Document not found for key "${key}"`, rid });
//     }

//     const to = process.env.SUPPORT_EMAIL || "support@blinqfix.com";
//     const subject = `TEST: single doc (${key}) – ${user.name || user.email || user._id}`;
//     let html, text, attachments;

//     if (mode === "attachment") {
//       // Prepare single attachment from base64/data URL
//       let contentType, buffer;
//       if (raw.startsWith("data:")) {
//         const m = raw.match(/^data:([^;]+);base64,(.+)$/);
//         if (!m) {
//           console.error(`[email-one:${rid}] invalid data URL for ${key}`);
//           return res.status(400).json({ ok: false, error: "Invalid data URL", rid });
//         }
//         contentType = m[1];
//         buffer = Buffer.from(m[2], "base64");
//       } else if (raw.startsWith("http") || raw.startsWith("/uploads/")) {
//         // Prefer link mode for external URLs
//         return res.status(400).json({ ok: false, rid, error: "Attachment mode not supported for external URLs. Use mode=\"link\"." });
//       } else {
//         contentType = detectContentType(raw);
//         buffer = Buffer.from(raw, "base64");
//       }

//       if (buffer.length > MAX_ATTACHMENT_BYTES) {
//         return res.status(413).json({
//           ok: false,
//           rid,
//           error: `Attachment too large (${buffer.length} bytes > ${MAX_ATTACHMENT_BYTES}). Use mode="link".`,
//         });
//       }

//       const filename =
//         contentType === "application/pdf" ? `${key}.pdf`
//         : contentType.startsWith("image/") ? `${key}.jpg`
//         : `${key}.bin`;

//       console.log(`[email-one:${rid}] attachment prepared`, {
//         key, contentType, bytes: buffer.length, filename,
//       });

//       attachments = [{ filename, content: buffer, contentType }];
//       html = `<p>Attached: <strong>${key}</strong> (${contentType}, ${buffer.length} bytes)</p>`;
//       text = `Attached: ${key} (${contentType}, ${buffer.length} bytes)`;
//     } else {
//       // Link-only test (tiny email). Signed so it opens without auth.
//       const url = signDocUrl(req, user._id, key, 3600);
//       html = `<p>Single document link (<strong>${key}</strong>): <a href="${url}">${url}</a></p>`;
//       text = `Single document link (${key}): ${url}`;
//       console.log(`[email-one:${rid}] link prepared`, { key, url });
//     }

//     await sendEmail({ to, subject, text, html, attachments });

//     const ms = Date.now() - t0;
//     console.log(`[email-one:${rid}] SUCCESS in ${ms}ms`);
//     return res.json({
//       ok: true,
//       rid,
//       message: `Single document (${key}) email sent to ${to} in ${ms}ms`,
//       mode,
//     });
//   } catch (err) {
//     const ms = Date.now() - t0;
//     const meta = {
//       message: err?.message,
//       code: err?.code,
//       responseCode: err?.responseCode,
//       command: err?.command,
//       response: err?.response,
//     };
//     console.error(`[email-one:${rid}] ERROR after ${ms}ms`, meta);
//     return res.status(500).json({ ok: false, rid, error: "Failed to send test email", meta });
//   }
// });

// export default router;

import express from "express";
const router = express.Router();

import crypto from "crypto";
import mongoose, { Types } from "mongoose";

import { auth } from "../middlewares/auth.js";
import Users from "../models/Users.js";
import Job from "../models/Job.js";
import Configuration from "../models/Configuration.js";
import sendEmail from "../utils/sendEmail.js";

const FEE_RATE = parseFloat(process.env.CONVENIENCE_FEE_RATE) || 0.07;
const SIGNING_SECRET =
  process.env.DOCS_SIGNING_SECRET || process.env.JWT_SECRET || "change-me";

// Optional safety cap for attachments
const MAX_ATTACHMENT_BYTES =
  parseInt(process.env.EMAIL_MAX_ATTACHMENT_BYTES, 10) || 15 * 1024 * 1024;

/* -------------------------------------------------------------------------- */
/*                               Admin guard                                  */
/* -------------------------------------------------------------------------- */
const checkAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
    return res.status(403).json({ msg: "Access denied" });
  }
  next();
};

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

// robust coercion + validation for doc keys and modes
const VALID_DOC_KEYS = new Set(["id", "w9", "license", "insurance", "background", "ica"]);

function isReactEvent(obj) {
  // Detect common React SyntheticEvent shapes accidentally sent from the client
  return !!(
    obj &&
    typeof obj === "object" &&
    ("nativeEvent" in obj ||
      "_dispatchListeners" in obj ||
      "isDefaultPrevented" in obj ||
      "_reactName" in obj ||
      ("dispatchConfig" in obj && "_targetInst" in obj))
  );
}

function coerceString(value, fallback = "") {
  if (value == null) return fallback;

  // Ignore accidentally-posted React events; use fallback
  if (isReactEvent(value)) return fallback;

  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] == null ? fallback : String(value[0]);
  if (typeof value === "object") {
    if ("value" in value && value.value != null) return String(value.value);
    if ("key" in value && value.key != null) return String(value.key);
    if ("docKey" in value && value.docKey != null) return String(value.docKey);
  }
  return String(value);
}

function normalizeDocKey(input, fallback = "w9") {
  const key = coerceString(input, fallback).trim().toLowerCase();
  if (!VALID_DOC_KEYS.has(key)) {
    const allowed = Array.from(VALID_DOC_KEYS).join(", ");
    const err = new Error(`Invalid document key: ${JSON.stringify(input)}. Allowed: ${allowed}`);
    err.status = 400;
    throw err;
  }
  return key;
}

function normalizeMode(input, fallback = "link") {
  const mode = coerceString(input, fallback).trim().toLowerCase();
  if (mode !== "link" && mode !== "attachment") {
    const err = new Error(`Invalid mode: ${JSON.stringify(input)}. Must be "link" or "attachment".`);
    err.status = 400;
    throw err;
  }
  return mode;
}

// Unify binary -> base64 data URL
function toDataUrl(binOrBuf, mime = "image/jpeg") {
  if (!binOrBuf) return null;
  const buf = binOrBuf?.buffer
    ? Buffer.from(binOrBuf.buffer) // Mongo Binary
    : Buffer.isBuffer(binOrBuf)
    ? binOrBuf
    : Buffer.from(binOrBuf); // fallback
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function escapeRegex(str = "") {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Absolute URL for RN/email
function absoluteUrl(req, path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  const proto = (req.headers["x-forwarded-proto"] || req.protocol || "https")
    .split(",")[0]
    .trim();
  const host = (req.headers["x-forwarded-host"] || req.get("host"))
    .split(",")[0]
    .trim();
  return `${proto}://${host}${path.startsWith("/") ? path : "/" + path}`;
}

// base64 “magic bytes” → content-type
function detectContentType(raw) {
  if (!raw) return "application/octet-stream";
  const head = String(raw).slice(0, 12);
  if (head.startsWith("JVBERi0")) return "application/pdf"; // %PDF
  if (head.startsWith("iVBORw0")) return "image/png"; // PNG
  if (head.startsWith("/9j/")) return "image/jpeg"; // JPG
  return "application/octet-stream";
}

// HMAC-signed links so emails / RN can open without Authorization header
function signDocUrl(req, userId, key, ttlSec = 3600) {
  const safeKey = normalizeDocKey(key);
  const base = req.baseUrl || ""; // e.g. /api/admin
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const payload = `${userId}:${safeKey}:${exp}`;
  const sig = crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");
  const unsignedPath = `${base}/provider/${userId}/documents/${safeKey}/download`;
  const url = `${unsignedPath}?exp=${exp}&sig=${sig}`;
  return absoluteUrl(req, url);
}

function verifySignature(userId, key, exp, sig) {
  if (!exp || !sig) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Number.isNaN(+exp) || +exp < now) return false;
  const safeKey = normalizeDocKey(key);
  const payload = `${userId}:${safeKey}:${exp}`;
  const expected = crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

// pick nested fields
const pick = (obj, paths = []) => {
  for (const p of paths) {
    const parts = p.split(".");
    let cur = obj;
    for (const part of parts) {
      if (!cur) break;
      cur = cur[part];
    }
    if (cur !== undefined && cur !== null && cur !== "") return cur;
  }
  return undefined;
};

/* -------------------------------------------------------------------------- */
/*                             Provider documents                              */
/* -------------------------------------------------------------------------- */

function collectProviderDocs(req, user) {
  const FIELDS = [
    { key: "id",        label: "Government ID",                    value: user.idDocument || user.governmentId },
    { key: "w9",        label: "W-9",                              value: user.w9 },
    { key: "license",   label: "Business License",                  value: user.businessLicense },
    { key: "insurance", label: "Insurance",                         value: user.proofOfInsurance },
    { key: "background",label: "Background Check",                  value: user.backgroundCheck },
    { key: "ica",       label: "Independent Contractor Agreement",  value: user.independentContractorAgreement },
  ];

  return FIELDS.map(({ key, label, value }) => {
    // Skip non-file status markers like 'viewed@...'
    if (typeof value === "string" && /^viewed@/i.test(value)) value = null;

    let url = null;
    if (typeof value === "string") {
      if (value.startsWith("http") || value.startsWith("data:") || value.startsWith("/uploads/")) {
        url = absoluteUrl(req, value);
      } else {
        // Raw base64 stored in Mongo → sign a view URL (3-day TTL)
        url = signDocUrl(req, user._id, key, 60 * 60 * 24 * 3);
      }
    }

    return { key, type: label, filename: `${key}.pdf`, url, present: Boolean(url) };
  });
}

async function serveDoc(req, res, id, key) {
  const safeKey = normalizeDocKey(key);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).send("Invalid id");
    return;
  }
  const user = await Users.findById(id).lean();
  if (!user) {
    res.status(404).send("Provider not found");
    return;
  }

  const raw = {
    id:        user.idDocument || user.governmentId,
    w9:        user.w9,
    license:   user.businessLicense,
    insurance: user.proofOfInsurance,
    background:user.backgroundCheck,
    ica:       user.independentContractorAgreement,
  }[safeKey];

  if (!raw || typeof raw !== "string") {
    res.status(404).send("Document not found");
    return;
  }

  // External URLs or data URLs:
  if (raw.startsWith("http")) {
    res.redirect(absoluteUrl(req, raw));
    return;
  }
  if (raw.startsWith("data:")) {
    const m = raw.match(/^data:([^;]+);base64,(.+)$/);
    if (!m) { res.status(400).send("Invalid data URL"); return; }
    const contentType = m[1];
    const data = Buffer.from(m[2], "base64");
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${safeKey}.pdf"`);
    res.send(data);
    return;
  }
  if (raw.startsWith("/uploads/")) {
    res.redirect(absoluteUrl(req, raw));
    return;
  }

  // Raw base64 stored in Mongo (W-9/license/insurance/background/governmentId)
  const contentType = detectContentType(raw);
  const data = Buffer.from(raw, "base64");
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `inline; filename="${safeKey}.pdf"`);
  res.send(data);
}

/* -------------------------------------------------------------------------- */
/*                                   Routes                                   */
/* -------------------------------------------------------------------------- */

/* USERS LIST */
router.get("/users", auth, async (req, res) => {
  try {
    const providers = await Users.find(
      { role: "serviceProvider" },
      "_id name email role serviceType isActive serviceZipcode billingTier"
    ).lean();
    res.json({ providers });
  } catch (err) {
    console.error("GET /admin/users error:", err);
    res.status(500).json({ msg: "Server error fetching users." });
  }
});

/* STATS (secure) */
// NOTE: If this router mounts at /api/admin, this path becomes /api/admin/admin/stats.
router.get("/admin/stats", auth, checkAdmin, async (req, res) => {
  try {
    const [customerCount, providerCount] = await Promise.all([
      Users.countDocuments({ role: "customer" }),
      Users.countDocuments({ role: "serviceProvider" }),
    ]);
    res.json({ totalCustomers: customerCount, totalProviders: providerCount });
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ msg: "Failed to fetch stats" });
  }
});

/* FEES (secure) */
router.get("/convenience-fees", auth, checkAdmin, async (req, res) => {
  try {
    const PRO_SHARE_RATE = 0.07;
    const CUSTOMER_FEE_RATE = 0.07;
    const TOTAL_FEE_RATE = PRO_SHARE_RATE + CUSTOMER_FEE_RATE;

    const pipeline = [
      { $match: { paymentStatus: "paid" } },
      {
        $project: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          baseTotal: {
            $add: [
              { $ifNull: ["$baseAmount", 0] },
              { $ifNull: ["$adjustmentAmount", 0] },
              { $ifNull: ["$rushFee", 0] },
            ],
          },
          extra: {
            $cond: {
              if: { $eq: ["$additionalChargePaid", true] },
              then: { $ifNull: ["$additionalCharge", 0] },
              else: 0,
            },
          },
        },
      },
      { $addFields: { totalBilled: { $add: ["$baseTotal", "$extra"] } } },
      {
        $addFields: {
          convenienceFee: { $round: [{ $multiply: ["$totalBilled", TOTAL_FEE_RATE] }, 2] },
        },
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalConvenienceFee: { $sum: "$convenienceFee" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ];

    const monthlyFees = await Job.aggregate(pipeline);
    const ytdTotal = monthlyFees.reduce(
      (sum, f) => sum + (f.totalConvenienceFee || 0),
      0
    );

    res.json({ monthlyFees, ytdTotal });
  } catch (err) {
    console.error("GET /admin/convenience-fees error:", err);
    res.status(500).json({ msg: "Server error fetching fees." });
  }
});

/* CANCEL STALE JOBS (secure) */
router.put("/jobs/cancel-stale", auth, checkAdmin, async (req, res) => {
  try {
    const result = await Job.updateMany(
      {
        status: {
          $in: ["pending", "cancelled-by-customer", "cancelled-by-serviceProvider"],
        },
      },
      { $set: { status: "cancelled-auto" } }
    );
    res.json({ message: `Cancelled ${result.modifiedCount} stale jobs.` });
  } catch (err) {
    console.error("❌ Failed to cancel stale jobs:", err);
    res.status(500).json({ msg: "Failed to cancel stale jobs" });
  }
});

/* CONFIG GET/PUT (secure) */
router.get("/configuration", auth, checkAdmin, async (req, res) => {
  try {
    const cfg = await Configuration.findOne().lean();
    res.json({ hardcodedEnabled: cfg?.hardcodedEnabled ?? false });
  } catch (err) {
    console.error("GET /admin/configuration error:", err);
    res.status(500).json({ msg: "Server error fetching configuration." });
  }
});

router.put("/configuration", auth, checkAdmin, async (req, res) => {
  try {
    const { hardcodedEnabled } = req.body;
    if (typeof hardcodedEnabled !== "boolean") {
      return res.status(400).json({ msg: "Invalid value" });
    }
    let config = await Configuration.findOne({});
    if (!config) config = new Configuration({ hardcodedEnabled });
    else config.hardcodedEnabled = hardcodedEnabled;
    await config.save();
    res.json(config);
  } catch (err) {
    console.error("Error updating config:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* JOBS LIST (secure) */
router.get("/jobs", auth, checkAdmin, async (req, res) => {
  try {
    const jobs = await Job.find({})
      .select("status createdAt serviceType")
      .limit(1000)
      .lean();

    const safeJobs = jobs.map((job) => ({
      _id: job._id,
      status: job.status,
      createdAt: job.createdAt,
      serviceType: job.serviceType,
    }));

    return res.json({ jobs: safeJobs });
  } catch (err) {
    console.error("❌ GET /admin/jobs error:", err);
    return res.status(500).json({ msg: "Server error fetching jobs." });
  }
});

/* COMPLETE PROVIDERS (secure) */
router.get("/complete-providers", auth, checkAdmin, async (req, res) => {
  try {
    const providers = await Users.find({
      role: "serviceProvider",
      isActive: false,
      w9: { $ne: null },
      businessLicense: { $ne: null },
      proofOfInsurance: { $ne: null },
      independentContractorAgreement: { $ne: null },
    }).select("_id name");

    res.json({ providers });
  } catch (err) {
    console.error("❌ Failed to fetch complete providers:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ACTIVATE ONE PROVIDER (secure) */
router.put("/provider/:id/activate", auth, checkAdmin, async (req, res) => {
  try {
    const user = await Users.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ msg: "User not found." });
    res.json({ msg: "User activated", user });
  } catch (err) {
    console.error("❌ Error activating user:", err);
    res.status(500).json({ msg: "Failed to activate user." });
  }
});

/* TOGGLE ACTIVE (secure) */
router.put("/provider/:providerId/active", auth, checkAdmin, async (req, res) => {
  try {
    const { providerId } = req.params;
    const { isActive } = req.body;

    const provider = await Users.findById(providerId);
    if (!provider) return res.status(404).json({ msg: "Provider not found" });
    if (provider.role !== "serviceProvider") {
      return res.status(400).json({ msg: "User is not a service provider" });
    }

    provider.isActive = Boolean(isActive);
    await provider.save();

    res.json({ msg: "Provider status updated", provider });
  } catch (err) {
    console.error("Error updating provider status:", err.message);
    res.status(500).send("Server error");
  }
});

/* UPDATE ZIP CODES (secure) */
router.put("/provider/:providerId/zipcodes", auth, checkAdmin, async (req, res) => {
  try {
    const { providerId } = req.params;
    const { zipCodes } = req.body;

    const provider = await Users.findById(providerId);
    if (!provider || provider.role !== "serviceProvider") {
      return res.status(404).json({ msg: "Provider not found or invalid role" });
    }

    const zipArray = Array.isArray(zipCodes)
      ? zipCodes.map((z) => String(z).trim()).filter(Boolean)
      : [String(zipCodes).trim()].filter(Boolean);

    provider.serviceZipcode = zipArray;
    await provider.save();

    return res.json({ msg: "Service ZIP codes updated successfully" });
  } catch (err) {
    console.error("PUT /admin/provider/:providerId/zipcodes error:", err);
    return res.status(500).json({ msg: "Server error updating zip codes" });
  }
});

/* JOB MEDIA (secure) */
router.get("/job-media", auth, checkAdmin, async (req, res) => {
  try {
    const { jobId, address } = req.query;

    if (!jobId && !address) {
      return res.status(400).json({ msg: "Provide jobId or address" });
    }

    const query = {};
    if (jobId) {
      if (!Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ msg: "Invalid jobId" });
      }
      query._id = jobId;
    } else if (address) {
      query.address = { $regex: "^" + escapeRegex(address), $options: "i" };
    }

    const jobs = await Job.find(query)
      .select(
        "_id address arrivalImage arrivalImageMime completionImage completionImageMime progressImages createdAt"
      )
      .limit(20)
      .lean();

    const payload = jobs.map((j) => {
      const images = [];

      if (j.arrivalImage) {
        images.push({
          kind: "arrival",
          at: j.createdAt,
          src: toDataUrl(j.arrivalImage, j.arrivalImageMime || "image/jpeg"),
        });
      }
      if (j.completionImage) {
        images.push({
          kind: "completion",
          at: j.createdAt,
          src: toDataUrl(j.completionImage, j.completionImageMime || "image/jpeg"),
        });
      }
      if (Array.isArray(j.progressImages)) {
        for (const p of j.progressImages) {
          images.push({
            kind: "progress",
            id: String(p._id || ""),
            at: p.createdAt || j.createdAt,
            src: toDataUrl(p.data, p.mimeType || "image/jpeg"),
          });
        }
      }

      return {
        jobId: String(j._id),
        address: j.address,
        imageCount: images.length,
        images,
      };
    });

    return res.json({ jobs: payload });
  } catch (err) {
    console.error("GET /admin/job-media error:", err);
    return res.status(500).json({ msg: "Server error fetching media" });
  }
});

/* -------------------------------------------------------------------------- */
/*                      PROVIDER DOCUMENTS (list / view / email)              */
/* -------------------------------------------------------------------------- */

/** Returns absolute (signed) links so RN/email can open without auth header */
router.get("/provider/:id/documents", auth, checkAdmin, async (req, res) => {
  try {
    const provider = await Users.findById(req.params.id).lean();
    if (!provider) return res.status(404).json({ error: "Provider not found" });

    const documents = collectProviderDocs(req, provider);
    res.json({ ok: true, documents });
  } catch (err) {
    console.error("GET /admin/provider/:id/documents error:", err);
    res.status(500).json({ error: "Failed to load documents" });
  }
});

/**
 * View/download a document.
 * Access:
 *  - If (?sig&exp) are valid → allow without auth (for email/RN).
 *  - Else require admin auth + role.
 */
router.get("/provider/:id/documents/:key/download", async (req, res, next) => {
  try {
    const { id } = req.params;
    const rawKey = req.params.key;
    const safeKey = normalizeDocKey(rawKey);
    const { sig, exp } = req.query;

    const hasValidSig = verifySignature(id, safeKey, exp, sig);
    if (!hasValidSig) {
      return auth(req, res, () =>
        checkAdmin(req, res, async () => {
          try {
            await serveDoc(req, res, id, safeKey);
          } catch (e) {
            next(e);
          }
        })
      );
    }

    await serveDoc(req, res, id, safeKey);
  } catch (err) {
    console.error("download doc error", err);
    return res.status(500).send("Download failed");
  }
});

/** Email all provider docs to support (signed links) */
router.post("/provider/:id/documents/email", auth, checkAdmin, async (req, res) => {
  const rid = (crypto.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2);
  const t0 = Date.now();

  try {
    const { id } = req.params;
    console.log(`[email-docs:${rid}] start for provider=${id}`);

    const user = await Users.findById(id).lean();
    if (!user) {
      console.warn(`[email-docs:${rid}] provider not found`);
      return res.status(404).json({ ok: false, error: "Provider not found", rid });
    }

    const docs = collectProviderDocs(req, user);
    console.log(`[email-docs:${rid}] docs collected`, {
      count: docs.length,
      names: docs.map((d) => d.filename),
      to: process.env.SUPPORT_EMAIL || "support@blinqfix.com",
    });

    const rows = docs
      .map((d) => {
        const cell = d.present
          ? `<a href="${d.url}">${d.filename}</a>`
          : `<em>Not uploaded</em>`;
        return `<tr><td>${d.type}</td><td>${cell}</td></tr>`;
      })
      .join("");

    const html = `
      <p>Documents for <strong>${user.name || user.email}</strong></p>
      <table border="1" cellspacing="0" cellpadding="4">
        ${rows || "<tr><td colspan='2'>No documents.</td></tr>"}
      </table>
    `;
    const text = [
      `Documents for ${user.name || user.email}`,
      ...docs.map((d) => `${d.type}: ${d.url}`),
    ].join("\n");

    const to = process.env.SUPPORT_EMAIL || "support@blinqfix.com";
    console.log(`[email-docs:${rid}] calling sendEmail`, {
      to,
      subject: `Provider Documents – ${user.name || user.email}`,
      textPreview: text.slice(0, 80) + (text.length > 80 ? "…" : ""),
    });

    await sendEmail({
      to,
      subject: `Provider Documents – ${user.name || user.email}`,
      text,
      html,
    });

    const ms = Date.now() - t0;
    console.log(`[email-docs:${rid}] SUCCESS in ${ms}ms`);
    return res.json({ ok: true, message: `Email sent to ${to}`, rid });
  } catch (err) {
    const ms = Date.now() - t0;
    const meta = {
      message: err?.message,
      code: err?.code,
      responseCode: err?.responseCode,
      command: err?.command,
      response: err?.response,
    };
    console.error(`[email-docs:${rid}] ERROR after ${ms}ms`, meta);
    return res.status(500).json({
      ok: false,
      error: "Failed to send email",
      rid,
      meta,
    });
  }
});

/**
 * TEST endpoint: send exactly ONE provider document by email.
 * Body/query: key? = "w9"|"license"|"insurance"|"background"|"id"|"ica", mode? = "link"|"attachment"
 * - mode="link"      : tiny email with 1 clickable signed link (rules out size/attachments)
 * - mode="attachment": attaches 1 file (tests message size / provider attachment policy)
 */
router.post("/provider/:id/documents/email-one", auth, checkAdmin, async (req, res) => {
  const rid = (crypto.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2);
  const t0 = Date.now();

  try {
    const { id } = req.params;

    // accept multiple shapes/locations + guard against React events
    const rawKey  = req.body?.key ?? req.body?.docKey ?? req.query?.key ?? "w9";
    const rawMode = req.body?.mode ?? req.query?.mode ?? "link";

    const key  = normalizeDocKey(rawKey, "w9");
    const mode = normalizeMode(rawMode, "link");

    console.log(`[email-one:${rid}] start`, { providerId: id, key, mode });

    const user = await Users.findById(id).lean();
    if (!user) {
      console.warn(`[email-one:${rid}] provider not found`);
      return res.status(404).json({ ok: false, error: "Provider not found", rid });
    }

    const fieldMap = {
      id:         user.idDocument || user.governmentId,
      w9:         user.w9,
      license:    user.businessLicense,
      insurance:  user.proofOfInsurance,
      background: user.backgroundCheck,
      ica:        user.independentContractorAgreement,
    };

    let raw = fieldMap[key];
    if (!raw || typeof raw !== "string" || /^viewed@/i.test(raw)) {
      console.warn(`[email-one:${rid}] doc not found or not a file`, { key });
      return res.status(404).json({ ok: false, error: `Document not found for key "${key}"`, rid });
    }

    const to = process.env.SUPPORT_EMAIL || "support@blinqfix.com";
    const subject = `TEST: single doc (${key}) – ${user.name || user.email || user._id}`;
    let html, text, attachments;

    if (mode === "attachment") {
      // Prepare single attachment from base64/data URL
      let contentType, buffer;
      if (raw.startsWith("data:")) {
        const m = raw.match(/^data:([^;]+);base64,(.+)$/);
        if (!m) {
          console.error(`[email-one:${rid}] invalid data URL for ${key}`);
          return res.status(400).json({ ok: false, error: "Invalid data URL", rid });
        }
        contentType = m[1];
        buffer = Buffer.from(m[2], "base64");
      } else if (raw.startsWith("http") || raw.startsWith("/uploads/")) {
        // Prefer link mode for external URLs
        return res.status(400).json({ ok: false, rid, error: "Attachment mode not supported for external URLs. Use mode=\"link\"." });
      } else {
        contentType = detectContentType(raw);
        buffer = Buffer.from(raw, "base64");
      }

      if (buffer.length > MAX_ATTACHMENT_BYTES) {
        return res.status(413).json({
          ok: false,
          rid,
          error: `Attachment too large (${buffer.length} bytes > ${MAX_ATTACHMENT_BYTES}). Use mode="link".`,
        });
      }

      const filename =
        contentType === "application/pdf" ? `${key}.pdf`
        : contentType.startsWith("image/") ? `${key}.jpg`
        : `${key}.bin`;

      console.log(`[email-one:${rid}] attachment prepared`, {
        key, contentType, bytes: buffer.length, filename,
      });

      attachments = [{ filename, content: buffer, contentType }];
      html = `<p>Attached: <strong>${key}</strong> (${contentType}, ${buffer.length} bytes)</p>`;
      text = `Attached: ${key} (${contentType}, ${buffer.length} bytes)`;
    } else {
      // Link-only test (tiny email). Signed so it opens without auth.
      const url = signDocUrl(req, user._id, key, 3600);
      html = `<p>Single document link (<strong>${key}</strong>): <a href="${url}">${url}</a></p>`;
      text = `Single document link (${key}): ${url}`;
      console.log(`[email-one:${rid}] link prepared`, { key, url });
    }

    await sendEmail({ to, subject, text, html, attachments });

    const ms = Date.now() - t0;
    console.log(`[email-one:${rid}] SUCCESS in ${ms}ms`);
    return res.json({
      ok: true,
      rid,
      message: `Single document (${key}) email sent to ${to} in ${ms}ms`,
      mode,
    });
  } catch (err) {
    const ms = Date.now() - t0;
    const meta = {
      message: err?.message,
      code: err?.code,
      responseCode: err?.responseCode,
      command: err?.command,
      response: err?.response,
    };
    console.error(`[email-one:${rid}] ERROR after ${ms}ms`, meta);
    return res.status(500).json({ ok: false, rid, error: "Failed to send test email", meta });
  }
});

export default router;
