// routes/userStats.js
import express from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import NodeGeocoder from "node-geocoder";
import multer from "multer";

import { auth } from "../middlewares/auth.js";
import Users from "../models/Users.js";
import Job from "../models/Job.js";

const router = express.Router();

console.log("✅ userStatsRoutes loaded");

router.get("/invitation-stats", auth, async (req, res) => {
    console.log("✅ Reached /users/invitation-stats");
    try {
    const providerId = req.user._id || req.user.id
    const sentCount = await Job.countDocuments({ invitedProviders: providerId });
    const acceptedCount = await Job.countDocuments({ acceptedProvider: providerId });
    console.log(sentCount, acceptedCount, "Parameters:::")
    res.json({ sent: sentCount, accepted: acceptedCount });
  } catch (err) {
    console.error("Error fetching invitation stats:", err);
    res.status(500).json({ msg: "Failed to fetch invitation statistics." });
  }
});

export default router;

