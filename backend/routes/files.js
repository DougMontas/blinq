// backend/routes/files.js
import express from "express";
import multer from "multer";

const router = express.Router();

// Configure multer storage (here, storing files in /uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/**
 * @route   POST /api/files/upload
 * @desc    Upload a file (license, insurance, job photo, etc.)
 * @access  Protected or public depending on your needs
 */
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded." });
  }
  // Return the path or URL where you store the file
  res.json({ filePath: req.file.path });
});

export default router;
