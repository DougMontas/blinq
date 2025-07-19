// export default router;
import express from "express";
import { auth } from "../middlewares/auth.js";
import Job from "../models/Job.js";
import Users from "../models/Users.js";
import mongoose from "mongoose";
import Stripe from "stripe";
import "dotenv/config";
import multer from "multer";
import path from "path";
import { Router } from "express";
import coveredDescriptions from "../../App/frontend/utils/coveredDescriptions.js";
import { invitePhaseOne } from "../jobs/invitePhaseOne.js";
import { invitePhaseTwo } from "../jobs/invitePhaseTwo.js";
import cron from "node-cron";
import { chargeTravelFee, issueRefund } from "../utils/refunds.js"; // add these helpers if needed
import nodemailer from "nodemailer"

const router = express.Router();
const storage = multer.memoryStorage();

const upload = multer({ storage: multer.memoryStorage() });
const MAX_INVITES_PER_ZIP = parseInt(process.env.MAX_INVITES_PER_ZIP, 10) || 7;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

const fields = [
  "name",
  "email",
  "address",
  "phoneNumber",
  "serviceType",
  "serviceZipcode",
  "isActive",
  "billingTier",
  "profitSharingFeePercentage",
  "stripeAccountId",
  "stripeCustomerId",
].join(" ");

/**
 * POST /api/jobs
 */
// router.post("/", auth, async (req, res) => {
//   try {
//     const {
//       category,
//       service,
//       address,
//       serviceCity,
//       serviceZipcode,
//       details = {},
//       baseAmount = 0,
//       adjustmentAmount = 0,
//       rushFee = 0,
//       estimatedTotal = baseAmount + adjustmentAmount + rushFee,
//     } = req.body;

//     if (!category || !address) {
//       return res
//         .status(400)
//         .json({ msg: "`category` and `address` are required." });
//     }
//     console.log("🛠️ Incoming job req.body:", req.body);

//     const job = await Job.create({
//       customer: req.user.id,
//       address,
//       serviceCity,
//       serviceZipcode,
//       serviceType: category,
//       details: {
//         issue: service,
//         ...details,
//       },
//       baseAmount,
//       adjustmentAmount,
//       rushFee,
//       estimatedTotal,
//       paymentStatus: "unpaid",
//       status: "pending",
//       invitedProviders: [],
//       invitationPhase: 0,
//     });

//     return res.status(201).json(job);
//   } catch (err) {
//     console.error("POST /api/jobs error:", err);
//     return res
//       .status(500)
//       .json({ msg: "Could not create job", error: err.message });
//   }
// });

router.post("/", auth, async (req, res) => {
  try {
    const {
      category,
      service,
      address,
      serviceCity,
      serviceZipcode,
      details = {},
      baseAmount = 0,
      adjustmentAmount = 0,
      rushFee = 0,
      estimatedTotal = baseAmount + adjustmentAmount + rushFee,
      location, // <-- ✅ include location
    } = req.body;

    if (!category || !address) {
      return res
        .status(400)
        .json({ msg: "`category` and `address` are required." });
    }

    if (
      !location ||
      location.type !== "Point" ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2 ||
      location.coordinates.some((n) => typeof n !== "number" || isNaN(n))
    ) {
      return res.status(400).json({ msg: "Invalid or missing coordinates." });
    }

    console.log("🛠️ Incoming job req.body:", req.body);

    const job = await Job.create({
      customer: req.user.id,
      address,
      serviceCity,
      serviceZipcode,
      serviceType: category,
      details: {
        issue: service,
        ...details,
      },
      baseAmount,
      adjustmentAmount,
      rushFee,
      estimatedTotal,
      paymentStatus: "unpaid",
      status: "pending",
      invitedProviders: [],
      invitationPhase: 0,
      location, // ✅ Required for geospatial queries and validation
    });

    return res.status(201).json(job);
  } catch (err) {
    console.error("POST /api/jobs error:", err);
    return res
      .status(500)
      .json({ msg: "Could not create job", error: err.message });
  }
});


/**
 * PUT /api/jobs/:jobId/accept
 */

router.put("/:jobId/accept", auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ msg: "Invalid job id." });
    }

    // Check existing job state first
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    // Prevent double acceptance
    if (job.acceptedProvider || job.status === "accepted") {
      return res
        .status(409)
        .json({ msg: "This job has already been accepted." });
    }

    // Now update it safely

    if (!job) return res.status(404).json({ msg: "Job not found" });
    if (job.status === "accepted") {
      return res.status(409).json({ msg: "Job already accepted" });
    }

    // Optional: Lock emit to acceptedProvider only once:
    if (!job.acceptedProvider) {
      job.acceptedProvider = req.user.id;
      job.status = "accepted";
      job.acceptedAt = new Date();

      await job.save();
      req.io.to(job.customer.toString()).emit("jobAccepted", {
        jobId: job._id.toString(),
      });
      return res.json(job);
    }

    return res.status(409).json({ msg: "This job has already been accepted." });

    // job.acceptedProvider = req.user.id;
    // job.status = "accepted";
    // await job.save();

    // // Notify customer
    // req.io.to(job.customer.toString()).emit("jobAccepted", {
    //   jobId: job._id.toString(),
    // });

    // return res.json(job);
    // } catch (err) {
    //   console.error("PUT /api/jobs/:jobId/accept error:", err);
    //   return res.status(500).json({ msg: "Server error" });
    // }
  } catch (err) {
    console.log(err);
  }
});

router.get("/homeowner/active", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ msg: "Unauthorized: Missing user context" });
    }

    const job = await Job.findOne({
      customer: req.user.id,
      status: { $in: ["pending", "invited", "accepted", "in_progress"] },
    }).lean();

    return res.json(job || {}); // ensure consistent return shape
  } catch (err) {
    console.error("GET /api/jobs/homeowner/active error:", err);
    return res.status(500).json({ msg: err.message });
  }
});

router.put("/complete-payment/:jobId", auth, async (req, res) => {
  const { jobId } = req.params;
  const { paymentIntentId } = req.body || {};

  const CUSTOMER_FEE_RATE = 0.07;
  const PROVIDER_FEE_RATE = 0.07;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    const isAdditionalOnly = job.status === "awaiting-additional-payment";

    // 🚫 Block only new invites when job already accepted (still allow extra‑charge payment)
    if (
      !isAdditionalOnly &&
      (job.status === "accepted" || job.acceptedProvider)
    ) {
      return res
        .status(400)
        .json({ msg: "Job already accepted. No further invitations allowed." });
    }

    // 🔒 Verify Stripe PaymentIntent if provided
    let capturedCents = 0;
    if (paymentIntentId) {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (intent.status !== "succeeded") {
        return res.status(400).json({ msg: "Payment not completed" });
      }
      capturedCents = intent.amount_received;
    }

    // 💰 Recalculate totals (includes any additionalCharge already set on Job)
    const base = job.baseAmount || 0;
    const adjust = job.adjustmentAmount || 0;
    const rush = job.rushFee || 0;
    const extra = job.additionalCharge || 0;

    const subtotal = base + adjust + rush + extra;

    const customerFee = +(subtotal * CUSTOMER_FEE_RATE).toFixed(2);
    const providerFee = +(subtotal * PROVIDER_FEE_RATE).toFixed(2);
    const totalConvenienceFee = customerFee + providerFee;
    const paymentToProvider = subtotal - providerFee;

    job.customerFee = customerFee;
    job.providerFee = providerFee;
    job.convenienceFee = totalConvenienceFee;
    job.totalAmountPaid = subtotal + customerFee;
    job.paymentToProvider = paymentToProvider;

    // 📝 Record new payment when additional‑only
    if (isAdditionalOnly) {
      job.paymentStatus = "paid";
      job.status = "accepted"; // revert to accepted after payment

      // 🔧 Ensure array exists before pushing
      if (!Array.isArray(job.additionalPayments)) job.additionalPayments = [];

      job.additionalPayments.push({
        paymentIntentId,
        amount: capturedCents || extra * 100, // cents
        capturedAt: new Date(),
      });

      await job.save();
      return res.json(job);
    }

    // ============== ORIGINAL INVITE LOGIC (unchanged) ==============

    job.paymentStatus = "paid";

    // Final safeguard: prevent invites if job is now accepted mid‑way
    if (job.acceptedProvider || job.status === "accepted") {
      await job.save();
      return res.json(job);
    }

    job.status = "invited";
    await job.save();

    const customer = await Users.findById(job.customer).lean();
    if (!customer) {
      return res.status(500).json({ msg: "Customer not found." });
    }

    await invitePhaseOne(job, customer, req.io);

    setTimeout(async () => {
      const latestJob = await Job.findById(job._id);
      if (latestJob.acceptedProvider || latestJob.status === "accepted") return;
      invitePhaseTwo(job._id, req.io).catch((err) => {
        console.error("🔥 Phase 2 invite error:", err);
      });
    }, 15 * 60 * 1000);

    res.json(job);
  } catch (err) {
    console.error("❌ PUT /complete-payment/:jobId error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/:jobId/additional-charge", auth, async (req, res) => {
  const { jobId } = req.params;
  const { additionalCharge, reason } = req.body;

  const CUSTOMER_FEE_RATE = 0.07;
  const PROVIDER_FEE_RATE = 0.07;

  if (typeof additionalCharge !== "number" || !reason) {
    return res
      .status(400)
      .json({ error: "Additional charge and reason are required." });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    job.additionalCharge = additionalCharge;
    job.additionalChargeReason = reason;
    job.status = "awaiting-additional-payment";
    job.paymentStatus = "awaiting-additional-payment";
    job.additionalChargePaid = false;

    const subtotal = additionalCharge;
    const customerFee =
      Math.round((subtotal * CUSTOMER_FEE_RATE + Number.EPSILON) * 100) / 100;
    const providerFee =
      Math.round((subtotal * PROVIDER_FEE_RATE + Number.EPSILON) * 100) / 100;
    const paymentToProvider = subtotal - providerFee;

    job.convenienceFee = customerFee;
    job.estimatedTotal = subtotal + customerFee;
    job.paymentToProvider = (job.paymentToProvider || 0) + paymentToProvider; // accumulate with any previous

    // console.log("/:jobId/additional-charge", subtotal, paymentToProvider)

    await job.save();
    return res.json(job);
  } catch (err) {
    console.error("❌ Failed to update charge:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/jobs/pending
 */
router.get("/pending", auth, async (req, res) => {
  try {
    const { serviceZipcode, serviceType } = req.query;
    if (!serviceZipcode || !serviceType) {
      return res.status(400).json({ msg: "Need serviceZipcode & serviceType" });
    }

    const providerId = req.user._id;
    const jobs = await Job.find({
      status: "invited",
      serviceType,
      invitedProviders: { $in: [providerId] },
    })
      .populate("customer")
      .lean();

    const filtered = jobs.filter(
      (j) =>
        j.customer?.serviceZipcode?.toString().trim() === serviceZipcode.trim()
    );

    const isPro = String(req.user.billingTier || "").toLowerCase() === "hybrid";

    const list = filtered.map((j) => ({
      ...j,
      buttonsActive: j.invitationPhase === 1 ? isPro : true,
    }));

    res.json(list);
  } catch (err) {
    console.error("GET /api/jobs/pending error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ———————— MULTER UPLOAD CONFIG ————————

router.post("/:jobId/upload/arrival",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.jobId);
      if (!job) return res.status(404).json({ msg: "Job not found." });

      // store the raw buffer in your Buffer field
      job.arrivalImage = req.file.buffer;
      await job.save();

      // turn it into a data-URI for the client
      const base64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${base64}`;

      // send back the job, overriding arrivalImage to be the data-URI
      const jobObj = job.toObject();
      jobObj.arrivalImage = dataUri;
      return res.json(jobObj);
    } catch (err) {
      console.error("Arrival upload error:", err);
      return res.status(500).json({ msg: "Upload failed." });
    }
  }
);

// Completion photo
router.post("/:jobId/upload/completion",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {
      const job = await Job.findById(req.params.jobId);
      if (!job) return res.status(404).json({ msg: "Job not found." });

      job.completionImage = req.file.buffer;
      await job.save();

      const base64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${base64}`;

      const jobObj = job.toObject();
      jobObj.completionImage = dataUri;
      return res.json(jobObj);
    } catch (err) {
      console.error("Completion upload error:", err);
      return res.status(500).json({ msg: "Upload failed." });
    }
  }
);

router.put("/jobs/:id/complete-additional", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    job.additionalChargePaid = true;
    job.chargeApproved = true;

    // You can also update status/paymentStatus if needed:
    job.status = "in_progress";
    job.paymentStatus = "paid";

    // console.log("/jobs/:id/complete-additional", "status update only")

    await job.save();
    res.json(job);
  } catch (err) {
    console.error("Failed to complete additional payment:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id/pay-additional", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    job.additionalChargePaid = true;
    // console.log("/:id/pay-additional", "status update only")
    await job.save();

    return res.json(job);
  } catch (err) {
    console.error("Failed to mark additional charge as paid:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/payments/additional-charge-sheet", auth, async (req, res) => {
  try {
    const { jobId } = req.body;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    const customer = await Users.findById(job.customer);
    if (!customer?.stripeCustomerId)
      return res.status(400).json({ msg: "Missing stripe customer id" });

    const extraAmount = Math.round((job.additionalCharge || 0) * 100);

    if (!extraAmount || job.additionalChargePaid) {
      return res
        .status(400)
        .json({ msg: "Nothing to charge or already paid." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: extraAmount,
      currency: "usd",
      customer: customer.stripeCustomerId,
      automatic_payment_methods: { enabled: true },
    });

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.stripeCustomerId },
      { apiVersion: "2022-11-15" }
    );

    // console.log("/payments/additional-charge-sheet", paymentIntent, extraAmount)

    return res.json({
      paymentIntentClientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.stripeCustomerId,
    });
  } catch (err) {
    console.error("Stripe additional charge sheet error:", err);
    return res.status(500).json({ msg: "Stripe error", error: err.message });
  }
});

router.post("/payments/payment-sheet", async (req, res) => {
  // const { amount, currency, jobId } = req.body;

  const job = await Job.findById(jobId).populate("acceptedProvider");
  if (!job || !job.acceptedProvider?.stripeAccountId) {
    return res.status(400).json({ msg: "Invalid provider or job" });
  }

  const customer = await stripe.customers.create({ email: req.user.email });
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2023-08-16" }
  );

  const applicationFee = Math.round(amount * 0.07); // 7% platform fee

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customer.id,
    automatic_payment_methods: { enabled: true },
    application_fee_amount: applicationFee,
    transfer_data: {
      destination: job.acceptedProvider.stripeAccountId,
    },
  });

  res.json({
    customer: customer.id,
    ephemeralKey: ephemeralKey.secret,
    paymentIntentClientSecret: paymentIntent.client_secret,
  });
});

/**
 * PUT /api/jobs/:jobId/finalize
 * Customer confirms the job is done.
 */
router.put("/:jobId/finalize", auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId))
      return res.status(400).json({ msg: "Invalid job id." });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found." });

    // flag customer done
    job.customerCompleted = true;

    // if provider already marked done, complete the workflow
    if (job.providerCompleted) {
      job.status = "completed";
    }

    await job.save();

    // notify the provider if you want:
    if (job.acceptedProvider) {
      req.io.to(job.acceptedProvider.toString()).emit("jobFinalized", {
        jobId: job._id.toString(),
      });
    }

    return res.json(job);
  } catch (err) {
    console.error("PUT /api/jobs/:jobId/finalize error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.put("/:jobId/complete/provider", auth, async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ msg: "Job not found." });

  job.providerCompleted = true;
  job.status = "provider_completed";
  job.completedAt = new Date();

  await job.save();

  // notify the customer in real‐time if you like
  req.io.to(job.customer.toString()).emit("providerCompleted", {
    jobId: job._id.toString(),
  });

  return res.json(job);
});

router.put("/:jobId/complete/customer", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ msg: "Job not found." });

    job.customerCompleted = true;
    job.status = "completed";
    await job.save();

    // ✅ Recalculate and update provider rating after job is completed
    const providerId = job.acceptedProvider;
    if (providerId) {
      const completedJobs = await Job.find({
        acceptedProvider: providerId,
        status: "completed",
        rating: { $exists: true },
      });

      const totalRating = completedJobs.reduce(
        (sum, job) => sum + job.rating,
        0
      );
      const averageRating =
        completedJobs.length > 0 ? totalRating / completedJobs.length : 0;

      await Users.findByIdAndUpdate(providerId, {
        averageRating: averageRating.toFixed(2),
        reviewCount: completedJobs.length,
      });
    }

    return res.json(job);
  } catch (err) {
    console.error("Error completing job:", err);
    return res.status(500).json({ msg: "Server error completing job." });
  }
});

router.put("/:id/rate", async (req, res) => {
  const { rating, comments } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5." });
  }

  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    job.rating = rating;
    job.comments = comments ?? ""; // safe default
    await job.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to save rating:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me/stats", auth, async (req, res) => {
  try {
    const providerIdStr = String(
      (req.user && (req.user._id || req.user.id)) || ""
    );
    if (!providerIdStr) {
      return res
        .status(400)
        .json({ msg: "Provider ID not found in auth token" });
    }

    const pipeline = [
      {
        $match: {
          status: "completed",
          paymentStatus: { $in: ["paid", "succeeded"] },
          $expr: {
            $or: [
              { $eq: [{ $toString: "$serviceProvider" }, providerIdStr] },
              { $eq: [{ $toString: "$acceptedProvider" }, providerIdStr] },
            ],
          },
        },
      },
      {
        $addFields: {
          subtotal: {
            $add: [
              { $ifNull: ["$baseAmount", 0] },
              { $ifNull: ["$adjustmentAmount", 0] },
              { $ifNull: ["$rushFee", 0] },
              { $ifNull: ["$additionalCharge", 0] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          completedJobsCount: { $sum: 1 },
          grossTotal: { $sum: { $multiply: ["$subtotal", 0.93] } },
          ratings: { $push: "$rating" },
          reviews: {
            $push: {
              $cond: [
                {
                  $or: [
                    { $gt: ["$rating", null] },
                    { $ifNull: ["$comments", false] },
                  ],
                },
                {
                  rating: "$rating",
                  comment: "$comments",
                  date: "$completedAt",
                },
                "$$REMOVE",
              ],
            },
          },
        },
      },
    ];

    const [stats] = await Job.aggregate(pipeline);

    if (!stats) {
      return res.json({
        completedJobsCount: 0,
        totalAmountPaid: 0,
        averageRating: null,
        reviews: [],
      });
    }

    const validRatings = stats.ratings.filter(
      (r) => typeof r === "number" && !isNaN(r)
    );
    const totalRating = validRatings.reduce((sum, r) => sum + r, 0);
    const averageRating = validRatings.length
      ? totalRating / validRatings.length
      : null;

    res.json({
      completedJobsCount: stats.completedJobsCount,
      totalAmountPaid: +stats.grossTotal.toFixed(2),
      averageRating,
      reviews: stats.reviews,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error generating provider stats." });
  }
});

/**
 * PUT /api/jobs/:jobId/deny
 * — Service-provider passes on the invitation
 */
router.put("/:jobId/deny", auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ msg: "Invalid job id." });
    }
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found." });

    // record that this provider declined
    job.cancelledProviders = job.cancelledProviders || [];
    if (!job.cancelledProviders.includes(req.user.id)) {
      job.cancelledProviders.push(req.user.id);
    }

    // also remove them from the active invitedProviders list
    job.invitedProviders = (job.invitedProviders || []).filter(
      (pid) => pid.toString() !== req.user.id.toString()
    );

    await job.save();
    return res.json(job);
  } catch (err) {
    console.error("PUT /api/jobs/:jobId/deny error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.put("/:jobId/cancel", auth, async (req, res) => {
  const { jobId } = req.params;
  const { travelFee = 0 } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: "Job not found." });
    }

    if (job.status === "completed") {
      return res.status(400).json({ msg: "Cannot cancel a completed job." });
    }

    job.status = "cancelled_by_provider";
    job.paymentStatus = "refunded"; // Changed from 'cancelled' to a valid enum value
    job.travelFee = travelFee;

    await job.save();
    return res.json({ msg: "Job successfully cancelled.", job });
  } catch (err) {
    console.error("Cancel job error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// router.put("/:jobId/cancelled", auth, async (req, res) => {
//   const { jobId } = req.params;
//   const { travelFee = 0, cancelledBy = "unknown" } = req.body;

//   try {
//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     // Audit log setup
//     job.auditLog = job.auditLog || [];
//     job.auditLog.push({
//       action: "cancel",
//       by: cancelledBy,
//       user: req.user.id,
//       timestamp: new Date(),
//     });

//     // Apply cancellation metadata
//     job.status = `cancelled_by_${cancelledBy}`;
//     job.paymentStatus = "refunded"; // Or other appropriate enum
//     job.travelFee = travelFee;
//     job.cancelledBy = cancelledBy;
//     job.cancelledAt = new Date();

//     await job.save();
//     return res.json({ msg: "Job successfully cancelled.", job });
//   } catch (err) {
//     console.error("Cancel job error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// router.put("/:jobId/cancelled", async (req, res) => {
//   const job = await Job.findById(req.params.jobId); // ✅ Correct param
//   if (!job) return res.status(404).json({ msg: "Job not found" });

//   const { cancelledBy } = req.body;

//   if (!['serviceProvider', 'customer'].includes(cancelledBy)) {
//     return res.status(400).json({ msg: 'Invalid cancellation source' });
//   }
  
//   job.status = `cancelled-by-${cancelledBy}`;

//   if (cancelledBy === "serviceProvider") {
//     // Reset accepted provider
//     job.acceptedProvider = null;
//     await job.save();

//     // Reinvite logic
//     invitePhaseOne(job, null, req.io, 1);
//   } else {
//     await job.save();
//   }

//   res.json(job);
// });



// router.put("/:jobId/cancelled", async (req, res) => {
//   const job = await Job.findById(req.params.id);
//   if (!job) return res.status(404).json({ msg: "Job not found" });

//   const { cancelledBy } = req.body;
//   job.status = `cancelled-by-${cancelledBy}`;

//   if (cancelledBy === "serviceProvider") {
//     // Reinvite logic (phase 1)
//     job.acceptedProvider = null;
//     await job.save();
//     invitePhaseOne(job, null, io, 1);
//   } else {
//     await job.save();
//   }
//   res.json(job);
// });

// router.put("/:jobId/cancelled", async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     const { cancelledBy } = req.body;

//     if (!['serviceProvider', 'customer'].includes(cancelledBy)) {
//       return res.status(400).json({ msg: 'Invalid cancellation source' });
//     }

//     job.status = `cancelled-by-${cancelledBy}`;

//     if (cancelledBy === "serviceProvider") {
//       job.acceptedProvider = null;
//       await job.save();

//       if (req.io) {
//         invitePhaseOne(job, null, req.io, 1);
//       } else {
//         console.warn("⚠️ Socket.io instance (req.io) is missing");
//       }
//     } else {
//       await job.save();
//     }

//     res.json(job);
//   } catch (err) {
//     console.error("❌ Job cancel error:", err);
//     res.status(500).json({ msg: "Server error during cancellation" });
//   }
// });

router.put("/:jobId/cancelled", async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    const { cancelledBy } = req.body;

    if (!['serviceProvider', 'customer'].includes(cancelledBy)) {
      return res.status(400).json({ msg: 'Invalid cancellation source' });
    }

    // Log cancellation
    job.auditLog.push({
      action: "cancel",
      by: cancelledBy,
      user: req.user?._id, // If available
      timestamp: new Date(),
    });

    if (cancelledBy === "serviceProvider") {
      job.acceptedProvider = null;
      job.status = "invited"; // ✅ Reset status for reinvite
      job.invitationPhase = 1;
      job.invitationExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // Optional: new 5 min window

      await job.save();

      if (req.io) {
        invitePhaseOne(job, null, req.io, 1);
      } else {
        console.warn("⚠️ Socket.io instance (req.io) is missing");
      }
    } else {
      job.status = "cancelled-by-customer";
      await job.save();
    }

    res.json(job);
  } catch (err) {
    console.error("❌ Job cancel error:", err);
    res.status(500).json({ msg: "Server error during cancellation" });
  }
});

// router.post("/:jobId/dispute", async (req, res) => {
//   const { jobId, message = "Customer has disputed this job." } = req.body;

//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.GODADDY_EMAIL_USER, // e.g. blinqfixmailer@gmail.com
//         pass: process.env.GODADDY_EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"BlinqFix Support" <${process.env.GODADDY_EMAIL_USER}>`,
//       to: "support@blinqfix.com",
//       subject: `🚨 Job Dispute Raised – Job ID: ${jobId}`,
//       text: `A dispute was raised for job ${jobId}.\n\nDetails: ${message}`,
//     });

//     res.status(200).json({ msg: "Support email sent." });
//   } catch (err) {
//     console.error("❌ Failed to send dispute email:", err);
//     res.status(500).json({ msg: "Failed to send email" });
//   }
// });



// PUT /jobs/:jobId/cancelled
// router.put("/:jobId/cancelled", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { cancelledBy } = req.body; // Expect 'customer' or 'serviceProvider'

//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     job.status = "cancelled";
//     job.cancelledBy = cancelledBy;
//     job.updatedAt = new Date();

//     // Optional: stop invitation logic if needed
//     job.invitationActive = false;

//     await job.save();

//     // Emit update via socket (optional)
//     const io = req.app.get("io");
//     if (io) io.to(jobId).emit("jobUpdated", job);

//     return res.json(job);
//   } catch (err) {
//     console.error("❌ Error cancelling job:", err);
//     res.status(500).json({ msg: "Server error cancelling job" });
//   }
// });

//nope
// router.put("/:jobId/cancelled", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { cancelledBy } = req.body; // 'customer' or 'serviceProvider'
//     const userId = req.user._id;

//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     const now = new Date();
//     const acceptedAt = job.acceptedAt || job.updatedAt || job.createdAt;
//     const minutesSinceAcceptance = (now - new Date(acceptedAt)) / (1000 * 60);

//     job.status =
//     cancelledBy === "customer"
//       ? "cancelled-by-customer"
//       : "cancelled-by-serviceProvider";
  
//     job.cancelledBy = cancelledBy;
//     job.updatedAt = now;
//     job.invitationActive = false;

//     await job.save();

//     const io = req.app.get("io");
//     if (io) io.to(jobId).emit("jobUpdated", job);

//     if (cancelledBy === "customer") {
//       if (minutesSinceAcceptance <= 5) {
//         console.log("💰 Customer cancelled within 5 minutes – full refund");
//         await issueRefund(job.paymentIntentId, "Full refund due to quick cancellation");
//       } else {
//         console.log("💰 Customer cancelled after 5 minutes – applying travel fee");
//         await chargeTravelFee(job);
//       }

//       return res.json({ msg: "Job cancelled by customer", fee: minutesSinceAcceptance > 5 });
//     }

//     if (cancelledBy === "serviceProvider") {
//       console.log("🔁 Reopening job after provider cancellation");
//       job.status = "invited";
//       job.cancelledBy = "serviceProvider";
//       await job.save();

//       if (io) io.to(jobId).emit("jobUpdated", job);

//       invitePhaseOne(job, null, io, 1); // re-trigger invites
//       return res.json({ msg: "Job reopened and reinvited", status: "invited" });
//     }

//     return res.json({ msg: "Job cancelled", job });

//   } catch (err) {
//     console.error("❌ Error cancelling job:", err);
//     res.status(500).json({ msg: "Server error cancelling job" });
//   }
// });

// router.put("/:jobId/cancelled", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { cancelledBy } = req.body; // 'customer' or 'serviceProvider'
//     const userId = req.user?._id;

//     console.log("🚨 /:jobId/cancelled HIT", { jobId, cancelledBy, userId });

//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       console.warn("❌ Invalid jobId");
//       return res.status(400).json({ msg: "Invalid job ID format" });
//     }

//     const job = await Job.findById(jobId);
//     if (!job) {
//       console.warn("❌ Job not found");
//       return res.status(404).json({ msg: "Job not found" });
//     }

//     const now = new Date();
//     const acceptedAt = job.acceptedAt || job.updatedAt || job.createdAt;
//     const minutesSinceAcceptance = (now - new Date(acceptedAt)) / (1000 * 60);

//     console.log("🕒 Minutes since acceptance:", minutesSinceAcceptance);

//     // Set basic cancellation metadata
//     job.status =
//       cancelledBy === "customer"
//         ? "cancelled-by-customer"
//         : "cancelled-by-serviceProvider";

//     job.cancelledBy = cancelledBy;
//     job.updatedAt = now;
//     job.invitationActive = false;

//     await job.save();
//     console.log("✅ Job cancelled:", job._id, job.status);

//     const io = req.app.get("io");
//     if (io) io.to(jobId).emit("jobUpdated", job);

//     if (cancelledBy === "customer") {
//       if (minutesSinceAcceptance <= 5) {
//         console.log("💰 Customer cancelled within 5 minutes — issuing refund");
//         await issueRefund(job.paymentIntentId, "Quick cancel within 5 min");
//       } else {
//         console.log("💰 Customer cancelled after 5 min — applying travel fee");
//         await chargeTravelFee(job);
//       }

//       return res.json({
//         msg: "Job cancelled by customer",
//         fee: minutesSinceAcceptance > 5,
//       });
//     }

//     if (cancelledBy === "serviceProvider") {
//       console.log("🔁 Reopening job after provider cancellation");

//       job.status = "invited";
//       job.cancelledBy = "serviceProvider";
//       job.invitationPhase = 1;
//       await job.save();

//       if (io) io.to(jobId).emit("jobUpdated", job);

//       try {
//         await invitePhaseOne(job, null, io, 1); // Re-trigger invitations
//         console.log("📣 Re-invitation triggered");
//       } catch (inviteErr) {
//         console.error("🔥 invitePhaseOne error:", inviteErr);
//       }

//       return res.json({ msg: "Job reopened and reinvited", status: "invited" });
//     }

//     return res.json({ msg: "Job cancelled", job });
//   } catch (err) {
//     console.error("❌ Error cancelling job:", err);
//     return res.status(500).json({ msg: "Server error cancelling job" });
//   }
// });

// router.put('/:jobId/status', auth, async (req, res) => {
//   const { jobId } = req.params;
//   const { status, inDispute } = req.body;

//   if (!status) return res.status(400).json({ msg: "Missing status." });

//   try {
//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     job.status = status;

//     if (typeof inDispute === "boolean") {
//       job.inDispute = inDispute;
//     }

//     await job.save();
//     req.io.to(job._id.toString()).emit("jobUpdated", job);

//     res.json({ msg: "Status updated.", job });
//   } catch (err) {
//     console.error("PUT /:jobId/status error:", err);
//     res.status(500).json({ msg: "Server error updating job status" });
//   }
// });



// router.post("/:jobId/dispute", async (req, res) => {
//   const { jobId } = req.params;
//   const { message = "Customer has disputed this job." } = req.body;

//   try {
//     // Create transporter using SMTP (not 'service') to support any provider
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_SMTP_HOST,         // e.g., "smtp.secureserver.net" for GoDaddy
//       port: parseInt(process.env.EMAIL_SMTP_PORT), // typically 465 or 587
//       secure: process.env.EMAIL_SMTP_SECURE === "true", // true for port 465, false for 587
//       auth: {
//         user: process.env.GODADDY_EMAIL_USER,
//         pass: process.env.GODADDY_EMAIL_PASS,
//       },
//     });

//     // Send support email
//     await transporter.sendMail({
//       from: `"BlinqFix Support" <${process.env.EMAIL_USER}>`,
//       to: "support@blinqfix.com",
//       subject: `🚨 Job Dispute Raised – Job ID: ${jobId}`,
//       text: `A dispute was raised for job ${jobId}.\n\nDetails: ${message}`,
//     });

//     // Mark the job in dispute
//     const job = await Job.findByIdAndUpdate(
//       jobId,
//       { inDispute: true, status: "disputed" },
//       { new: true }
//     );

//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     res.status(200).json({ msg: "Dispute submitted and job flagged." });
//   } catch (err) {
//     console.error("❌ Failed to process dispute:", err);
//     res.status(500).json({ msg: "Failed to process dispute." });
//   }
// });

router.put("/:jobId/status", auth, async (req, res) => {
  const { jobId } = req.params;
  const { status, inDispute } = req.body;

  if (!status && inDispute === undefined) {
    return res.status(400).json({ msg: "Nothing to update." });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found." });

    if (status) job.status = status;
    if (inDispute !== undefined) job.inDispute = inDispute;

    await job.save();
    req.io.to(job._id.toString()).emit("jobUpdated", job); // optional

    res.json(job);
  } catch (err) {
    console.error("PUT /jobs/:jobId/status error:", err);
    res.status(500).json({ msg: "Server error updating job status." });
  }
});


router.post("/:jobId/dispute", async (req, res) => {
  const { jobId } = req.params;
  const { message = "Customer has disputed this job." } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_HOST,
      port: parseInt(process.env.EMAIL_SMTP_PORT),
      secure: process.env.EMAIL_SMTP_SECURE === "true",
      auth: {
        user: process.env.GODADDY_EMAIL_USER,
        pass: process.env.GODADDY_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"BlinqFix Support" <${process.env.GODADDY_EMAIL_USER}>`,
      to: "support@blinqfix.com",
      subject: `🚨 Job Dispute Raised – Job ID: ${jobId}`,
      text: `A dispute was raised for job ${jobId}.\n\nDetails: ${message}`,
    });

    const job = await Job.findByIdAndUpdate(
      jobId,
      { inDispute: true, status: "disputed" },
      { new: true }
    );

    if (!job) return res.status(404).json({ msg: "Job not found." });
    res.status(200).json({ msg: "Dispute submitted and job flagged." });
  } catch (err) {
    console.error("❌ Failed to process dispute:", err);
    res.status(500).json({ msg: "Failed to process dispute." });
  }
});


cron.schedule("0 * * * *", async () => {
  const cutoff = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const oldJobs = await Job.find({
    status: { $in: ["invited", "accepted"] },
    createdAt: { $lt: cutoff },
  });

  for (const job of oldJobs) {
    if (!job.location?.coordinates) {
      console.warn(`Skipping auto-cancel for job ${job._id} — missing location`);
      continue;
    }

    job.status = "cancelled-auto";
    await job.save();
  }
});


router.get("/:jobId([0-9a-fA-F]{24})", auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId)
      .populate("customer", fields)
      .populate("invitedProviders", fields);

    if (!job) return res.status(404).json({ msg: "Job not found" });

    const userId = req.user?.id?.toString();
    const isCustomer = job.customer?._id?.toString() === userId;
    const isInvited = job.invitedProviders?.some(
      (p) => p?._id?.toString() === userId
    );

    if (!isCustomer && !isInvited) {
      return res
        .status(403)
        .json({ msg: "Forbidden: Not authorized to view this job" });
    }

    return res.json(job);
  } catch (err) {
    console.error("GET /api/jobs/:jobId error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default router;
