import express from "express";
import Job from "../models/Job.js";

const router = express.Router();

router.get("/images/:jobId/all", async (req, res) => {
    try {
      const { jobId } = req.params;
      // Find the job by ID.
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ msg: "Job not found" });
      }
  
      // Build an array of images. Adjust the fields as needed.
      const images = [];
      if (job.arrivalImage) {
        images.push({
          type: "arrival",
          // Convert Buffer to Base64 string.
          data: job.arrivalImage.toString("base64"),
          // Optionally include MIME type if you know it.
          mimeType: "image/png"
        });
      }
      if (job.completionImage) {
        images.push({
          type: "completion",
          data: job.completionImage.toString("base64"),
          mimeType: "image/png"
        });
      }
  
      if (images.length === 0) {
        return res.status(404).json({ msg: "No images found" });
      }
  
      res.json({ images });
    } catch (err) {
      console.error("Error retrieving images:", err);
      res.status(500).json({ msg: "Server error" });
    }
  });
  export default router;