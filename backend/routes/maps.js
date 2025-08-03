import express from "express";
import axios from "axios";

const router = express.Router();
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// 🔹 Geocode Route
router.get("/geocode", async (req, res) => {
  const { address } = req.query;
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${GOOGLE_API_KEY}`
    );
    res.json(response.data);
  } catch (err) {
    console.error("Geocode backend error:", err.message);
    res.status(500).json({ msg: "Failed to geocode address." });
  }
});

// 🔹 Directions Route
router.get("/directions", async (req, res) => {
  const { origin, destination } = req.query;
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_API_KEY}`
    );
    res.json(response.data);
  } catch (err) {
    console.error("Directions backend error:", err.message);
    res.status(500).json({ msg: "Failed to fetch directions." });
  }
});

export default router;
