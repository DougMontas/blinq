// backend/routes/admin.js
import express from "express";
const router = express.Router();
import { auth } from "../middlewares/auth.js";

import Users from "../models/Users.js";
import Job from "../models/Job.js";
import Configuration from "../models/Configuration.js";

const FEE_RATE = parseFloat(process.env.CONVENIENCE_FEE_RATE) || 0.07;

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ msg: "Access denied" });
  next();
};

// router.get("/users", auth, async (req, res) => {
//   console.log("📥 Admin route hit: /admin/users");
//   try {
//     const users = await Users.find(
//       { role: { $in: ["customer", "serviceProvider"] } },
//       "-password -location -portfolio"
//     ).lean();
//     res.json(users);
//   } catch (err) {
//     console.error("GET /admin/users error:", err);
//     res.status(500).json({ msg: "Server error fetching users." });
//   }
// });

// router.get("/users", auth, async (req, res) => {
//   console.log("📥 Admin route hit: /admin/users");
//   try {
//     const users = await Users.find(
//       { role: { $in: ["customer", "serviceProvider"] } },
//       "_id name email role serviceType isActive serviceZipcode billingTier"
//     ).lean(); // only fetch essential fields
//     res.json(users);
//   } catch (err) {
//     console.error("GET /admin/users error:", err);
//     res.status(500).json({ msg: "Server error fetching users." });
//   }
// });


router.get("/users", auth, async (req, res) => {
  console.log("📥 Admin route hit: /admin/users");
  try {
    const providers = await Users.find(
      { role: "serviceProvider" },
      "_id name email role serviceType isActive serviceZipcode, billingTier"
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

    console.log('customer count:',customerCount), console.log('provider count', providerCount);

    res.json({ totalCustomers: customerCount, totalProviders: providerCount });
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ msg: "Failed to fetch stats" });
  }
});

// router.get("/users", auth, async (req, res) => {
//   try {
//     const users = await Users.find().lean();
//     res.json(users);
//   } catch (err) {
//     console.error("GET /admin/users error:", err);
//     res.status(500).json({ msg: "Server error fetching users." });
//   }
// });

// router.get("/users", auth, async (req, res) => {
//   try {
//     const users = await Users.find(
//       { role: { $in: ["customer", "serviceProvider"] } },
//       "-password -location -portfolio"
//     ).lean();
//     res.json(users);
//   } catch (err) {
//     console.error("GET /admin/users error:", err);
//     res.status(500).json({ msg: "Server error fetching users." });
//   }
// });



router.get("/convenience-fees", auth, async (req, res) => {
  try {
    const pipeline = [
      // only count jobs that have been paid
      { $match: { paymentStatus: "paid" } },
      // compute month, year and the fee for each job
      {
        $project: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          convenienceFee: {
            // round((base + adjustment + rush) * FEE_RATE, 2)
            $round: [
              {
                $multiply: [
                  { $add: ["$baseAmount", "$adjustmentAmount", "$rushFee"] },
                  FEE_RATE,
                ],
              },
              2,
            ],
          },
        },
      },
      // group by month/year
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalConvenienceFee: { $sum: "$convenienceFee" },
        },
      },
      // sort chronologically
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

// GET /api/admin/configuration
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

// returns every job so your dashboard can count statuses
router.get("/jobs", auth, async (req, res) => {
  try {
    const jobs = await Job.find().lean();
    res.json(jobs);
  } catch (err) {
    console.error("GET /admin/jobs error:", err);
    res.status(500).json({ msg: "Server error fetching jobs." });
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
    const { providerId } = req.params;
    const { zipCodes } = req.body; // <-- grab the array your client is sending

    if (!zipCodes) {
      return res.status(400).json({ msg: "`zipCodes` is required" });
    }
    if (!Array.isArray(zipCodes)) {
      return res
        .status(400)
        .json({ msg: "`zipCodes` must be an array of zip strings" });
    }

    try {
      const provider = await Users.findById(providerId);
      if (!provider) {
        return res.status(404).json({ msg: "Provider not found" });
      }
      if (provider.role !== "serviceProvider") {
        return res.status(400).json({ msg: "User is not a service provider" });
      }

      // 2) Overwrite with the new array
      provider.serviceZipcode = zipCodes;

      if (typeof provider.markModified === "function") {
        provider.markModified("serviceZipcode");
      }

      await provider.save();

      return res.json({
        msg: "Zip codes updated successfully",
        provider,
      });
    } catch (err) {
      console.error("Update provider zipCodes error:", err);
      return res.status(500).send("Server error");
    }
  }
);

export default router;
