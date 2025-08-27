// backend/server.js
import express from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import { auth } from "./middlewares/auth.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/users.js";
import jobRoutes from "./routes/jobs.js";
import adminRoutes from "./routes/admin.js";
import billingRoutes from "./routes/billingRoutes.js";
import paymentsRoutes from "./routes/payments.js";
import filesRoutes from "./routes/files.js";
import imagesRoutes from "./routes/images.js";
import zipMultiplierRoute from "./routes/zipMultiplier.js";
import providers from "./routes/providers.js";
import stripe from "./routes/stripe.js";
import mapsRoutes from "./routes/maps.js";
import userStatsRoutes from "./routes/userStats.js";
import adminDocumentsRoutes from "./routes/adminDocumentsRoutes.js";
// _________
import pricingV2Router from "./routes/pricing.js"
// _________
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
await connectDB();

const app = express();

app.use(
  cors({
    origin: [
      "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app",
      "https://blinqfix.onrender.com",
      "blinqfix://",
    ],
    credentials: true,
  })
);

app.options("*", cors());
app.use(express.json());

// ✅ Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.post("/api/auth/test", (req, res) => {
  console.log("Test endpoint hit", req.body);
  res.json({ ok: true });
});

// HTTP server and socket.io
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("joinUserRoom", ({ userId }) => {
    socket.join(userId);
    // console.log(`Socket ${socket.id} joined room for user ${userId}`);
  });
});

io.on("connection", (socket) => {
  socket.on("providerLocationUpdate", ({ jobId, coords }) => {
    io.to(`job_${jobId}`).emit("locationUpdate", { provider: coords });
  });
});

// Make io available in routes
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// Strip heavy user fields from any outgoing response that includes `.user`
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    const stripLargeUserFields = (u) => {
      if (u && typeof u === "object" && u.role === "serviceProvider") {
        delete u.w9;
        delete u.proofOfInsurance;
        delete u.businessLicense;
        delete u.independentContractorAgreement;
      }
      return u;
    };

    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item.user) item.user = stripLargeUserFields(item.user);
        if (item.customer) item.customer = stripLargeUserFields(item.customer);
        if (item.provider) item.provider = stripLargeUserFields(item.provider);
      });
    } else if (typeof data === "object") {
      if (data.user) data.user = stripLargeUserFields(data.user);
      if (data.customer) data.customer = stripLargeUserFields(data.customer);
      if (data.provider) data.provider = stripLargeUserFields(data.provider);
    }

    return originalJson.call(this, data);
  };
  next();
});

app.use("/api/routes", providers);
// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/routes/providers", providers);
app.use("/api/admin", adminDocumentsRoutes);

// Protected routes
app.use("/api/maps", mapsRoutes);
app.use("/api/users", auth, userRoutes);
app.use("/api/userStats", auth, userStatsRoutes);
app.use("/api/jobs", auth, jobRoutes);
app.use("/api/admin", auth, adminRoutes);
app.use("/api/billing", auth, billingRoutes);
app.use("/api/payments", auth, paymentsRoutes);
app.use("/api/routes/stripe", auth, stripe);
// _________
app.use("/api/routes/pricing/v2", auth, pricingV2Router);
app.use("/api/price", auth, pricingV2Router);   
// _________

// File and Image routes
app.use("/api/files", auth, filesRoutes);
app.use("/api/images", auth, imagesRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const PORT = process.env.PORT || 10000;
const PUBLIC_URL = process.env.SERVER_URL || `https://blinqfix.onrender.com`;

server.listen(PORT, () => {
  console.log(`✅ Server running on ${PUBLIC_URL}`);
});
