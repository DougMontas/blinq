// backend/routes/admin.js
import express from "express";
const router = express.Router();
import { auth } from "../middlewares/auth.js";

import Users from "../models/Users.js";
import Job from "../models/Job.js";
import Configuration from "../models/Configuration.js";
import mongoose from "mongoose";
import { Types } from "mongoose";

// import { isAdmin } from "../middleware/auth"

const FEE_RATE = parseFloat(process.env.CONVENIENCE_FEE_RATE) || 0.07;

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ msg: "Access denied" });
  next();
};

router.get("/users", auth, async (req, res) => {
  // console.log("📥 Admin route hit: /admin/users");
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

router.get("/admin/stats", async (req, res) => {
  try {
    const [customerCount, providerCount] = await Promise.all([
      Users.countDocuments({ role: "customer" }),
      Users.countDocuments({ role: "serviceProvider" }),
    ]);

    // console.log("customer count:", customerCount),
    // console.log("provider count", providerCount);

    res.json({ totalCustomers: customerCount, totalProviders: providerCount });
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ msg: "Failed to fetch stats" });
  }
});

router.get("/convenience-fees", auth, async (req, res) => {
  try {
    const PRO_SHARE_RATE = 0.07; // Provider profit-sharing
    const CUSTOMER_FEE_RATE = 0.07; // Customer markup
    const TOTAL_FEE_RATE = PRO_SHARE_RATE + CUSTOMER_FEE_RATE;

    const pipeline = [
      // Match paid jobs only
      { $match: { paymentStatus: "paid" } },

      // Compute subtotal and any additional charge if paid
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

      // Calculate final total with extra
      {
        $addFields: {
          totalBilled: { $add: ["$baseTotal", "$extra"] },
        },
      },

      // Apply total 14% fee (7% customer + 7% provider)
      {
        $addFields: {
          convenienceFee: {
            $round: [{ $multiply: ["$totalBilled", TOTAL_FEE_RATE] }, 2],
          },
        },
      },

      // Group by month/year
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalConvenienceFee: { $sum: "$convenienceFee" },
        },
      },

      // Sort results
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

// PUT /admin/jobs/cancel-stale
router.put("/jobs/cancel-stale", auth, async (req, res) => {
  try {
    const result = await Job.updateMany(
      {
        status: {
          $in: [
            "pending",
            "cancelled-by-customer",
            "cancelled-by-serviceProvider",
          ],
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

router.get("/configuration", auth, async (req, res) => {
  try {
    const cfg = await Configuration.findOne().lean();
    res.json({ hardcodedEnabled: cfg?.hardcodedEnabled ?? false });
  } catch (err) {
    console.error("GET /admin/configuration error:", err);
    res.status(500).json({ msg: "Server error fetching configuration." });
  }
});

// **NEW** GET /api/admin/jobs
router.put("/configuration", auth, checkAdmin, async (req, res) => {
  try {
    const { hardcodedEnabled } = req.body;
    if (typeof hardcodedEnabled !== "boolean")
      return res.status(400).json({ msg: "Invalid value" });

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

router.get("/jobs", auth, async (req, res) => {
  console.log("✅ /admin/jobs hit");

  try {
    // Check DB connection
    console.log(
      "📡 Mongoose connection state:",
      mongoose.connection.readyState
    );

    //
    const jobs = await Job.find({})
      .select("status createdAt serviceType") // Avoid large buffers
      .limit(1000)
      .lean();

    console.log("📦 Total jobs found:", jobs.length);

    // Optional: limit fields to prevent large payload crashes
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

// PUT /admin/provider/:id/activate
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

router.put(
  "/provider/:providerId/active",
  auth,
  checkAdmin,
  async (req, res) => {
    try {
      const { providerId } = req.params;
      const { isActive } = req.body; // expected boolean

      // Fetch provider
      let provider = await Users.findById(providerId);
      if (!provider) {
        return res.status(404).json({ msg: "Provider not found" });
      }
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
  }
);

router.put(
  "/provider/:providerId/zipcodes",
  auth,
  checkAdmin,
  async (req, res) => {
    try {
      const { providerId } = req.params;
      const { zipCodes } = req.body;

      const provider = await Users.findById(providerId);
      if (!provider || provider.role !== "serviceProvider") {
        return res
          .status(404)
          .json({ msg: "Provider not found or invalid role" });
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
  },

  // helper to unify binary -> base64 data URL
  function toDataUrl(binOrBuf, mime = "image/jpeg") {
    if (!binOrBuf) return null;
    // Mongo Binary or Buffer both handled:
    const buf = binOrBuf.buffer
      ? Buffer.from(binOrBuf.buffer) // Mongo Binary
      : Buffer.isBuffer(binOrBuf)
      ? binOrBuf
      : Buffer.from(binOrBuf); // fallback
    return `data:${mime};base64,${buf.toString("base64")}`;
  },

  function escapeRegex(str = "") {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  },

  router.get("/job-media", auth, checkAdmin, async (req, res) => {
    try {
      const { jobId, address } = req.query;

      if (!jobId && !address) {
        return res.status(400).json({ msg: "Provide jobId or address" });
      }

      let query = {};
      if (jobId) {
        if (!Types.ObjectId.isValid(jobId)) {
          return res.status(400).json({ msg: "Invalid jobId" });
        }
        query._id = jobId;
      } else if (address) {
        // starts-with match; tweak as needed
        query.address = { $regex: "^" + escapeRegex(address), $options: "i" };
      }

      // Select only media-related + helpful fields
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
            src: toDataUrl(
              j.completionImage,
              j.completionImageMime || "image/jpeg"
            ),
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
  }),


  // Stream arrival/completion/progress image
// router.get("/job-media/:jobId/:kindOrImageId", auth, checkAdmin, async (req, res) => {
//   try {
//     const { jobId, kindOrImageId } = req.params;
//     if (!Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ msg: "Invalid jobId" });
//     }

//     const job = await Job.findById(jobId)
//       .select("arrivalImage arrivalImageMime completionImage completionImageMime progressImages")
//       .lean();
//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     let buf, mime;

//     if (kindOrImageId === "arrival") {
//       buf = job.arrivalImage?.buffer ? Buffer.from(job.arrivalImage.buffer) : job.arrivalImage;
//       mime = job.arrivalImageMime || "image/jpeg";
//     } else if (kindOrImageId === "completion") {
//       buf = job.completionImage?.buffer ? Buffer.from(job.completionImage.buffer) : job.completionImage;
//       mime = job.completionImageMime || "image/jpeg";
//     } else {
//       // progress image id
//       const p = (job.progressImages || []).find(pi => String(pi._id) === kindOrImageId);
//       if (p) {
//         buf = p.data?.buffer ? Buffer.from(p.data.buffer) : p.data;
//         mime = p.mimeType || "image/jpeg";
//       }
//     }

//     if (!buf) return res.status(404).json({ msg: "Image not found" });

//     res.set("Content-Type", mime);
//     return res.send(Buffer.isBuffer(buf) ? buf : Buffer.from(buf));
//   } catch (err) {
//     console.error("GET /admin/job-media/:jobId/:kind error:", err);
//     return res.status(500).json({ msg: "Server error streaming image" });
//   }
// })

);

export default router;
