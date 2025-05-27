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
const storage  = multer.memoryStorage();
const upload   = multer({ storage });

// Encryption helper
const algorithm     = "aes-256-cbc";
const encryptionKey = process.env.ENCRYPTION_KEY;
const encryptionIV  = process.env.ENCRYPTION_IV;

function encrypt(text) {
  if (!encryptionKey || !encryptionIV) return text;
  const key    = Buffer.from(encryptionKey, "hex");
  const iv     = Buffer.from(encryptionIV,  "hex");
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  return encrypted + cipher.final("hex");
}


// Utility to return a smaller version of user data
// function slimUser(user) {
//   const {
//     password,
//     w9,
//     businessLicense,
//     proofOfInsurance,
//     independentContractorAgreement,
//     ...rest
//   } = user;
//   return rest;

// function slimUser(user) {
//   if (!user) {
//     console.warn("⚠️ slimUser received null or undefined input");
//     return {};
//   }

//   if (typeof user.toObject === "function") {
//     const raw = user.toObject();
//     delete raw.password;
//     delete raw.w9;
//     delete raw.businessLicense;
//     delete raw.proofOfInsurance;
//     delete raw.independentContractorAgreement;
//     return raw;
//   }

//   // If already a plain object
//   if (typeof user === "object") {
//     const { password, w9, businessLicense, proofOfInsurance, independentContractorAgreement, ...rest } = user;
//     return rest;
//   }

//   console.warn("⚠️ slimUser received unexpected input:", user);
//   return {};
// }

function slimUser(user) {
  if (!user || typeof user !== "object") {
    console.warn("⚠️ slimUser received invalid input:", user);
    return {};
  }

  const {
    password,
    w9,
    businessLicense,
    proofOfInsurance,
    independentContractorAgreement,
    ...rest
  } = user;

  return rest;
}

// }
/**
 * GET /api/users/me
 * Returns the current user (minus their password)
 */
// router.get("/me", auth, async (req, res) => {
//   try {
//     console.log("🔍 Looking up user:", req.user.id);
//     const user = await Users.findById(req.user.id, "-password").lean();
//     console.log("✅ User fetchred:", user);
//     console.log("🔐 Authenticated user ID:", req.user?.id);
//     if (!user) return res.status(404).json({ msg: "User not found" });
//     res.json(user);
//   } catch (err) {
//     console.error("GET /me error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// router.get("/me", auth, async (req, res) => {
//   try {
//     console.log("🔍 Looking up user:", req.user.id);

//     const user = await Users.findById(req.user.id, "-password")
//       .lean();

//     if (!user) return res.status(404).json({ msg: "User not found" });

//     // Strip heavy fields unless explicitly requested
//     delete user.w9;
//     delete user.businessLicense;
//     delete user.proofOfInsurance;
//     delete user.independentContractorAgreement;

//     res.json(user);
//   } catch (err) {
//     console.error("GET /me error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

//previous
// router.get("/me", auth, async (req, res) => {
//   try {
//     const user = await Users.findById(req.user.id).lean();
//     if (!user) return res.status(404).json({ msg: "User not found" });
//     res.json(slimUser(user));
//   } catch (err) {
//     console.error("GET /me error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// router.get("/me", auth, async (req, res) => {
//   try {
//     const user = await Users.findById(req.user.id).lean();
//     if (!user) return res.status(404).json({ msg: "User not found" });
//     console.log(slimUser(user.name),'slim')
//     res.json(slimUser(user.name));
//   } catch (err) {
//     console.error("GET /me error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// backend/routes/users.js
// router.get("/me", auth, async (req, res) => {
//   const start = Date.now();
//   try {
//     const user = await Users.findById(req.user.id).lean();
//     if (!user) return res.status(404).json({ msg: "User not found" });

//     // Explicit field stripping
//     delete user.password;
//     delete user.w9;
//     delete user.businessLicense;
//     delete user.proofOfInsurance;
//     delete user.independentContractorAgreement;

//     const duration = Date.now() - start;
//     const payloadSize = Buffer.byteLength(JSON.stringify(user), "utf8");

//     console.log(`✅ /users/me response time: ${duration}ms`);
//     console.log(`📦 /users/me response size: ${payloadSize} bytes`);

//     res.json(user);
//   } catch (err) {
//     const duration = Date.now() - start;
//     console.error("GET /me error after", duration, "ms:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

router.get("/me", auth, async (req, res) => {
  try {
    console.time("🔍 MongoDB user fetch");

    const fields = [
      "name",
      "role",
      "trade",
      "serviceType",
      "portfolio",
      "serviceZipcode",
      "isActive",
    ].join(" ");

    const user = await Users.findById(req.user.id, fields).lean();

    console.timeEnd("🔍 MongoDB user fetch");

    if (!user) return res.status(404).json({ msg: "User not found" });

    console.log("📦 slimUser output keys:", Object.keys(user));
    res.json(user);
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

//fetching the users documents
router.get("/me/documents", auth, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id, "w9 businessLicense proofOfInsurance independentContractorAgreement").lean();

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      w9: user.w9 || null,
      businessLicense: user.businessLicense || null,
      proofOfInsurance: user.proofOfInsurance || null,
      independentContractorAgreement: user.independentContractorAgreement || null,
    });
  } catch (err) {
    console.error("GET /me/documents error:", err);
    res.status(500).json({ msg: "Server error fetching documents" });
  }
});

/**
 * GET /api/users/me/stats
 * Returns provider stats for current year
 */
//previous
// router.get("/me/stats", auth, async (req, res) => {
//   if (req.user.role !== "serviceProvider")
//     return res.status(403).json({ msg: "Only service providers have stats" });

//   const year       = parseInt(req.query.year) || new Date().getFullYear();
//   const providerId = new mongoose.Types.ObjectId(req.user.id);

//   try {
//     const stats = await Job.aggregate([
//       {
//         $match: {
//           acceptedProvider: providerId,
//           status: "completed",
//           $expr: { $eq: [{ $year: "$createdAt" }, year] }
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           completedJobsCount: { $sum: 1 },
//           totalAmountPaid:   { $sum: "$totalAmountPaid" }
//         }
//       }
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
          $expr: { $eq: [{ $year: "$createdAt" }, year] }
        }
      },
      {
        $group: {
          _id: null,
          completedJobsCount: { $sum: 1 },
          totalAmountPaid: { $sum: "$totalAmountPaid" }
        }
      }
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
 * Returns all active service providers (minimal fields)
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
        position: (lat != null && lng != null) ? [lat, lng] : null
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
 * Updates profile text fields and file uploads
 */
router.put("/profile",auth,
  upload.fields([
    { name: "w9", maxCount: 1 },
    { name: "businessLicense", maxCount: 1 },
    { name: "proofOfInsurance", maxCount: 1 },
    { name: "independentContractorAgreement", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        aboutMe,
        yearsExperience,
        serviceType,
        serviceCost,
        address,
        zipcode,
        serviceZipcode,
        businessName,
      } = req.body;

      const user = await Users.findById(req.user.id);
      if (!user) return res.status(404).json({ msg: "User not found" });

      // track change for geocoding
      const oldAddress = user.address;
      if (aboutMe         != null) user.aboutMe         = aboutMe;
      if (yearsExperience != null) user.yearsExperience = yearsExperience;
      if (serviceType     != null) user.serviceType     = serviceType;
      if (serviceCost     != null) user.serviceCost     = serviceCost;
      if (address         != null) user.address         = address;
      if (zipcode         != null) user.zipcode         = zipcode;
      if (serviceZipcode  != null) user.serviceZipcode  = serviceZipcode;
      if (businessName    != null) user.businessName    = businessName;

      // handle uploads
      const files = req.files;
      if (files?.w9?.[0])                       user.w9                           = files.w9[0].buffer.toString("base64");
      if (files?.businessLicense?.[0])          user.businessLicense             = files.businessLicense[0].buffer.toString("base64");
      if (files?.proofOfInsurance?.[0])         user.proofOfInsurance            = files.proofOfInsurance[0].buffer.toString("base64");
      if (files?.independentContractorAgreement?.[0])
        user.independentContractorAgreement = files.independentContractorAgreement[0].buffer.toString("base64");

      // only re-geocode if address changed
      if (address && address !== oldAddress) {
        const geo = await geocoder.geocode(address);
        if (geo.length) {
          user.location = {
            type: "Point",
            coordinates: [geo[0].longitude, geo[0].latitude],
          };
        }
      }

      await user.save();
      res.json({ msg: "Profile updated", user });
    } catch (err) {
      console.error("PUT /profile error:", err);
      res.status(500).json({ msg: "Server error updating profile" });
    }
  }
);

/**
 * PUT /api/users/location
 * Updates only the user’s geolocation
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
    await user.save();
    res.json({ msg: "Location updated", location: user.location });
  } catch (err) {
    console.error("PUT /location error:", err);
    res.status(500).json({ msg: "Server error updating location" });
  }
});

export default router;
