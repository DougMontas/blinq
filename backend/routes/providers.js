// routes/users.js

import express from "express";
import Users from "../models/Users.js"

const router = express.Router();

router.get("/providers", async (req, res) => {
    try {
      const providers = await Users.find(
        { role: "serviceProvider", isActive: true },
        "name serviceType location.coordinates"
      ).lean();
  
      const data = providers.map((p) => {
        const [lng, lat] = p.location?.coordinates || [];
        return {
          _id: p._id,
          name: p.name,
          serviceType: p.serviceType,
          location: (lat != null && lng != null) ? { lat, lng } : null
        };
      });
  
      res.json(data);
    } catch (err) {
      console.error("GET /providers/active error:", err);
      res.status(500).json({ msg: "Server error" });
    }
  });
  
  

export default router;
