// backend/routes/zipMultiplier.js

import express from "express";
const router = express.Router();

router.post("/zip-multiplier", async (req, res) => {
  const { zip } = req.body;

  if (!zip) return res.status(400).json({ message: "Zip code is required." });

  const zipPrefix = zip.toString().substring(0, 2);
  const multiplierMap = {
    "33": 1.25,
    "90": 1.4,
    "10": 0.9,
    "60": 1.1,
  };

  const multiplier = multiplierMap[zipPrefix] ?? 1.0;
  res.json({ multiplier });
});

export default router;
