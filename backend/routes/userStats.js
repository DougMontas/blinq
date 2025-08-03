import express from "express";
import { auth } from "../middlewares/auth.js";
import Job from "../models/Job.js";

const router = express.Router();

router.get("/invitation-stats", auth, async (req, res) => {
  console.log("✅ HIT: /api/userStats/invitation-stats");
  try {
    const providerId = req.user._id || req.user.id;
    const sentCount = await Job.countDocuments({
      invitedProviders: providerId,
    });
    const acceptedCount = await Job.countDocuments({
      acceptedProvider: providerId,
    });
    res.json({ sent: sentCount, accepted: acceptedCount });
  } catch (err) {
    console.error("Error fetching invitation stats:", err);
    res.status(500).json({ msg: "Failed to fetch invitation statistics." });
  }
});

export default router;
