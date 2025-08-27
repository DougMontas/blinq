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


import express from "express";
const router = express.Router();
import { auth } from "../middlewares/auth.js";

import Users from "../models/Users.js";
import Job from "../models/Job.js";
import Configuration from "../models/Configuration.js";
import mongoose, { Types } from "mongoose";
import sendEmail from "../utils/sendEmail.js";

const FEE_RATE = parseFloat(process.env.CONVENIENCE_FEE_RATE) || 0.07;

// -----------------------------------------------------------------------------
// Admin guard
// -----------------------------------------------------------------------------
const checkAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
    return res.status(403).json({ msg: "Access denied" });
  }
  next();
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function toDataUrl(binOrBuf, mime = "image/jpeg") {
  if (!binOrBuf) return null;
  const buf = binOrBuf?.buffer
    ? Buffer.from(binOrBuf.buffer)
    : Buffer.isBuffer(binOrBuf)
    ? binOrBuf
    : Buffer.from(binOrBuf);
  return `data:${mime};base64,${buf.toString("base64")}`;
}

function escapeRegex(str = "") {
  // correct escaping of ] and \
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function absoluteUrl(req, path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path; // already absolute
  const proto = (req.headers["x-forwarded-proto"] || req.protocol || "https").split(",")[0].trim();
  const host = (req.headers["x-forwarded-host"] || req.get("host")).split(",")[0].trim();
  return `${proto}://${host}${path.startsWith("/") ? path : "/" + path}`;
}

// pick nested property by dot path(s)
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

// Guess content-type from base64 prefix or filename
function inferContentTypeFromBase64(base64) {
  if (!base64) return "application/octet-stream";
  const head = String(base64).slice(0, 16);
  if (head.startsWith("JVBERi0")) return "application/pdf"; // %PDF
  if (head.startsWith("iVBORw0")) return "image/png";       // PNG
  if (head.startsWith("/9j/")) return "image/jpeg";          // JPEG
  return "application/octet-stream";
}

function inferTypeFromName(name) {
  const lower = String(name || "").toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".heic")) return "image/heic";
  return "application/octet-stream";
}

// Collect/normalize provider documents from various fields in Users
function collectProviderDocsRaw(user) {
  const docs = [];
  const defs = [
    { key: "id",        label: "Government ID", candidates: ["idDocument", "governmentId", "documents.id", "kyc.id", "id"] },
    { key: "w9",        label: "W-9",           candidates: ["w9", "documents.w9", "tax.w9", "tax.w9.url"] },
    { key: "license",   label: "Business License", candidates: ["businessLicense", "documents.businessLicense", "license", "license.url"] },
    { key: "insurance", label: "Insurance",     candidates: ["proofOfInsurance", "documents.insurance", "insurance", "insurance.url"] },
    { key: "background",label: "Background Check", candidates: ["backgroundCheck", "documents.backgroundCheck", "background", "background.url"] },
    { key: "ica",       label: "Independent Contractor Agreement", candidates: ["independentContractorAgreement", "documents.independentContractorAgreement", "ica", "ica.url"] },
  ];

  for (const d of defs) {
    const raw = pick(user, d.candidates);
    if (!raw) continue;

    // Skip sentinel strings like "viewed@..." (not a file)
    if (typeof raw === "string" && /^viewed@/i.test(raw)) continue;

    let url = null;
    let filename = d.key;
    let uploadedAt = null;

    if (typeof raw === "string") {
      if (raw.startsWith("http") || raw.startsWith("data:") || raw.startsWith("/uploads/")) {
        url = raw;
      } else {
        // base64-only stored in Mongo (your case)
        url = `/admin/provider/${user._id}/documents/${d.key}/download`;
      }
    } else if (typeof raw === "object") {
      if (raw.url) url = raw.url;
      if (!url) url = `/admin/provider/${user._id}/documents/${d.key}/download`;
      if (raw.filename) filename = raw.filename;
      if (raw.uploadedAt) uploadedAt = raw.uploadedAt;
    } else {
      url = `/admin/provider/${user._id}/documents/${d.key}/download`;
    }

    docs.push({ type: d.label, filename, url, uploadedAt });
  }

  return docs;
}

const collectProviderDocs = (req, user) =>
  collectProviderDocsRaw(user).map((d) => ({ ...d, url: absoluteUrl(req, d.url) }));

// -----------------------------------------------------------------------------
// USERS LIST
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// STATS
// -----------------------------------------------------------------------------
router.get("/admin/stats", async (req, res) => {
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

// -----------------------------------------------------------------------------
// FEES
// -----------------------------------------------------------------------------
router.get("/convenience-fees", auth, async (req, res) => {
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
          convenienceFee: {
            $round: [{ $multiply: ["$totalBilled", TOTAL_FEE_RATE] }, 2],
          },
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

// -----------------------------------------------------------------------------
// CANCEL STALE JOBS
// -----------------------------------------------------------------------------
router.put("/jobs/cancel-stale", auth, async (req, res) => {
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

// -----------------------------------------------------------------------------
// CONFIG GET/PUT
// -----------------------------------------------------------------------------
router.get("/configuration", auth, async (req, res) => {
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

// -----------------------------------------------------------------------------
// JOBS LIST
// -----------------------------------------------------------------------------
router.get("/jobs", auth, async (req, res) => {
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

// -----------------------------------------------------------------------------
// COMPLETE PROVIDERS
// -----------------------------------------------------------------------------
router.get("/complete-providers", auth, async (req, res) => {
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

// -----------------------------------------------------------------------------
// ACTIVATE ONE PROVIDER
// -----------------------------------------------------------------------------
router.put("/provider/:id/activate", auth, async (req, res) => {
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

// -----------------------------------------------------------------------------
// TOGGLE ACTIVE
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// UPDATE ZIP CODES
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// JOB MEDIA
// -----------------------------------------------------------------------------
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

      return { jobId: String(j._id), address: j.address, imageCount: images.length, images };
    });

    return res.json({ jobs: payload });
  } catch (err) {
    console.error("GET /admin/job-media error:", err);
    return res.status(500).json({ msg: "Server error fetching media" });
  }
});

// -----------------------------------------------------------------------------
// PROVIDER DOCUMENTS (list / download / email)
// -----------------------------------------------------------------------------
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

router.get("/provider/:id/documents/:key/download", auth, checkAdmin, async (req, res) => {
  try {
    const { id, key } = req.params;
    const user = await Users.findById(id).lean();
    if (!user) return res.status(404).send("Not found");

    const mapping = {
      id: ["idDocument", "governmentId", "documents.id", "kyc.id", "id"],
      w9: ["w9", "documents.w9", "tax.w9"],
      license: ["businessLicense", "documents.businessLicense", "license"],
      insurance: ["proofOfInsurance", "documents.insurance", "insurance"],
      background: ["backgroundCheck", "documents.backgroundCheck", "background"],
      ica: ["independentContractorAgreement", "documents.independentContractorAgreement", "ica"],
    };

    const raw = pick(user, mapping[key] || []);
    if (!raw) return res.status(404).send("Document not found");

    // Handle common storage forms
    let data;
    let filename = `${key}.pdf`;
    let contentType = "application/octet-stream";

    if (typeof raw === "string") {
      if (raw.startsWith("data:")) {
        const match = raw.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          contentType = match[1];
          data = Buffer.from(match[2], "base64");
        }
      } else if (raw.startsWith("http")) {
        return res.redirect(raw);
      } else if (raw.startsWith("/uploads/")) {
        return res.redirect(absoluteUrl(req, raw));
      } else {
        // base64-only (your current Mongo values like JVBERi0... for PDFs or iVBORw0... for PNGs)
        contentType = inferContentTypeFromBase64(raw) || inferTypeFromName(filename);
        data = Buffer.from(raw, "base64");
      }
    } else if (raw && typeof raw === "object") {
      if (raw.url && typeof raw.url === "string") {
        return res.redirect(raw.url);
      }
      if (raw.filename) filename = raw.filename;
      if (raw.contentType) contentType = raw.contentType;
      if (raw.data) data = Buffer.from(raw.data, "base64");
      if (!data && raw.buffer) data = Buffer.from(raw.buffer);
    }

    if (!data) return res.status(404).send("Document data not available");

    if (!contentType) contentType = inferTypeFromName(filename);

    // Inline so PDFs/images open in browser; swap to 'attachment' to force download
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    return res.send(data);
  } catch (err) {
    console.error("download doc error", err);
    return res.status(500).send("Download failed");
  }
});

router.post("/provider/:id/documents/email", auth, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findById(id).lean();
    if (!user) return res.status(404).json({ ok: false, error: "Provider not found" });

    const docs = collectProviderDocs(req, user);

    const rows = docs
      .map(
        (d) => `\n          <tr>\n            <td style="padding:6px 10px;border:1px solid #e5e7eb">${d.type}</td>\n            <td style="padding:6px 10px;border:1px solid #e5e7eb"><a href="${d.url}">${d.filename || "View"}</a></td>\n          </tr>`
      )
      .join("");

    const html = `\n      <p>Documents for <strong>${user.name || user.email || user._id}</strong></p>\n      <table style="border-collapse:collapse;border:1px solid #e5e7eb">\n        <thead>\n          <tr>\n            <th style="text-align:left;padding:6px 10px;border:1px solid #e5e7eb">Type</th>\n            <th style="text-align:left;padding:6px 10px;border:1px solid #e5e7eb">Link</th>\n          </tr>\n        </thead>\n        <tbody>${rows || '<tr><td colspan="2" style="padding:8px">No documents.</td></tr>'}</tbody>\n      </table>\n    `;

    const text = [
      `Documents for ${user.name || user.email || user._id}`,
      "",
      ...docs.map((d) => `• ${d.type} — ${d.filename || "file"} — ${d.url}`),
    ].join("\n");

    const to = process.env.SUPPORT_EMAIL || "support@blinqfix.com";
    await sendEmail({ to, subject: `Provider Documents – ${user.name || user.email || user._id}`, text, html });

    return res.json({ ok: true, message: `Email sent to ${to}` });
  } catch (err) {
    console.error("email docs error", err);
    return res.status(500).json({ ok: false, error: "Failed to send email" });
  }
});

export default router;
