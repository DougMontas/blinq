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
    } = req.body;

    if (!category || !address) {
      return res
        .status(400)
        .json({ msg: "`category` and `address` are required." });
    }

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

//working
// router.put("/complete-payment/:jobId", auth, async (req, res) => {
//   const { jobId } = req.params;

//   const CUSTOMER_FEE_RATE = 0.07;
//   const PROVIDER_FEE_RATE = 0.07;

//   try {
//     const job = await Job.findById(jobId);
//     if (!job) {
//       return res.status(404).json({ msg: "Job not found" });
//     }

//     const isAdditionalOnly = job.status === "awaiting-additional-payment";

//     const base = job.baseAmount || 0;
//     const adjust = job.adjustmentAmount || 0;
//     const rush = job.rushFee || 0;
//     const extra = job.additionalCharge || 0;

//     const subtotal = base + adjust + rush + extra;

//     const customerFee = Math.round((subtotal * CUSTOMER_FEE_RATE + Number.EPSILON) * 100) / 100;
//     const providerFee = Math.round((subtotal * PROVIDER_FEE_RATE + Number.EPSILON) * 100) / 100;
//     const totalConvenienceFee = customerFee + providerFee;
//     const paymentToProvider = subtotal - providerFee;

//     // console.log("/complete-payment/:jobId", subtotal, paymentToProvider);
//     // console.log("customerFee", customerFee);
//     // console.log("providerFee", providerFee);

//     job.customerFee = customerFee;
//     job.providerFee = providerFee;
//     job.convenienceFee = totalConvenienceFee;
//     job.totalAmountPaid = subtotal + customerFee;
//     job.paymentToProvider = paymentToProvider;
//     job.paymentStatus = "paid";

//     if (isAdditionalOnly) {
//       job.status = "accepted";
//       await job.save();
//       return res.json(job);
//     }

//     if (job.status === "accepted") {
//       await job.save();
//       return res.json(job);
//     }

//     job.status = "invited";
//     await job.save();

//     const customer = await Users.findById(job.customer).lean();
//     if (!customer) {
//       return res.status(500).json({ msg: "Customer not found." });
//     }

//     await invitePhaseOne(job, customer, req.io);

//     setTimeout(() => {
//       invitePhaseTwo(job._id, req.io).catch((err) => {
//         console.error("🔥 Phase 2 invite error:", err);
//       });
//     }, 15 * 60 * 1000);

//     return res.json(job);
//   } catch (err) {
//     console.error("❌ PUT /complete-payment/:jobId error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// router.put("/complete-payment/:jobId", auth, async (req, res) => {
//   const { jobId } = req.params;

//   const CUSTOMER_FEE_RATE = 0.07;
//   const PROVIDER_FEE_RATE = 0.07;

//   try {
//     const job = await Job.findById(jobId);
//     if (!job) {
//       return res.status(404).json({ msg: "Job not found" });
//     }

//     // ✅ Prevent further invitations if job already accepted
//     if (job.status === "accepted" || job.acceptedProvider) {
//       return res.status(400).json({ msg: "Job already accepted. No further invitations allowed." });
//     }

//     const isAdditionalOnly = job.status === "awaiting-additional-payment";

//     const base = job.baseAmount || 0;
//     const adjust = job.adjustmentAmount || 0;
//     const rush = job.rushFee || 0;
//     const extra = job.additionalCharge || 0;

//     const subtotal = base + adjust + rush + extra;

//     const customerFee = Math.round((subtotal * CUSTOMER_FEE_RATE + Number.EPSILON) * 100) / 100;
//     const providerFee = Math.round((subtotal * PROVIDER_FEE_RATE + Number.EPSILON) * 100) / 100;
//     const totalConvenienceFee = customerFee + providerFee;
//     const paymentToProvider = subtotal - providerFee;

//     job.customerFee = customerFee;
//     job.providerFee = providerFee;
//     job.convenienceFee = totalConvenienceFee;
//     job.totalAmountPaid = subtotal + customerFee;
//     job.paymentToProvider = paymentToProvider;
//     job.paymentStatus = "paid";

//     if (isAdditionalOnly) {
//       job.status = "accepted";
//       await job.save();
//       return res.json(job);
//     }

//     if (job.status === "accepted") {
//       await job.save();
//       return res.json(job);
//     }

//     job.status = "invited";
//     await job.save();

//     const customer = await Users.findById(job.customer).lean();
//     if (!customer) {
//       return res.status(500).json({ msg: "Customer not found." });
//     }

//     await invitePhaseOne(job, customer, req.io);

//     setTimeout(() => {
//       invitePhaseTwo(job._id, req.io).catch((err) => {
//         console.error("🔥 Phase 2 invite error:", err);
//       });
//     }, 15 * 60 * 1000);

//     return res.json(job);
//   } catch (err) {
//     console.error("❌ PUT /complete-payment/:jobId error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

router.put("/complete-payment/:jobId", auth, async (req, res) => {
  const { jobId } = req.params;

  const CUSTOMER_FEE_RATE = 0.07;
  const PROVIDER_FEE_RATE = 0.07;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    // ✅ Prevent further invitations if job already accepted or has an accepted provider
    if (job.status === "accepted" || job.acceptedProvider) {
      return res.status(400).json({ msg: "Job already accepted. No further invitations allowed." });
    }

    const isAdditionalOnly = job.status === "awaiting-additional-payment";

    const base = job.baseAmount || 0;
    const adjust = job.adjustmentAmount || 0;
    const rush = job.rushFee || 0;
    const extra = job.additionalCharge || 0;

    const subtotal = base + adjust + rush + extra;

    const customerFee = Math.round((subtotal * CUSTOMER_FEE_RATE + Number.EPSILON) * 100) / 100;
    const providerFee = Math.round((subtotal * PROVIDER_FEE_RATE + Number.EPSILON) * 100) / 100;
    const totalConvenienceFee = customerFee + providerFee;
    const paymentToProvider = subtotal - providerFee;

    job.customerFee = customerFee;
    job.providerFee = providerFee;
    job.convenienceFee = totalConvenienceFee;
    job.totalAmountPaid = subtotal + customerFee;
    job.paymentToProvider = paymentToProvider;
    job.paymentStatus = "paid";

    if (isAdditionalOnly) {
      job.status = "accepted";
      await job.save();
      return res.json(job);
    }

    if (job.status === "accepted") {
      await job.save();
      return res.json(job);
    }

    // ✅ Final safeguard: prevent invites if job is now accepted mid-way
    if (job.acceptedProvider || job.status === "accepted") {
      return res.status(400).json({ msg: "Job has already been accepted. No invitations sent." });
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
      if (latestJob.acceptedProvider || latestJob.status === "accepted") {
        console.log("⏸️ Skipping phase 2 invite - job already accepted.");
        return;
      }
      invitePhaseTwo(job._id, req.io).catch((err) => {
        console.error("🔥 Phase 2 invite error:", err);
      });
    }, 15 * 60 * 1000);

    return res.json(job);
  } catch (err) {
    console.error("❌ PUT /complete-payment/:jobId error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});



router.put("/:jobId/additional-charge", auth, async (req, res) => {
  const { jobId } = req.params;
  const { additionalCharge, reason } = req.body;

  const CUSTOMER_FEE_RATE = 0.07;
  const PROVIDER_FEE_RATE = 0.07;

  if (typeof additionalCharge !== "number" || !reason) {
    return res.status(400).json({ error: "Additional charge and reason are required." });
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
    const customerFee = Math.round((subtotal * CUSTOMER_FEE_RATE + Number.EPSILON) * 100) / 100;
    const providerFee = Math.round((subtotal * PROVIDER_FEE_RATE + Number.EPSILON) * 100) / 100;
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
  // console.log("🔥 POST /payments/payment-sheet triggered");
  // console.log("🧾 Incoming body:", req.body);

  const { amount, currency, jobId } = req.body;
  if (!amount || !currency || !jobId) {
    // console.error("❌ Missing required fields:", { amount, currency, jobId });
    return res.status(400).json({ msg: "Missing required fields." });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      console.error("❌ Job not found:", jobId);
      return res.status(404).json({ msg: "Job not found" });
    }

    const customer = await Users.findById(job.customer);
    if (!customer?.stripeCustomerId) {
      // console.error("❌ Missing stripeCustomerId for user:", job.customer);
      return res.status(400).json({ msg: "Missing stripe customer id" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customer.stripeCustomerId,
      automatic_payment_methods: { enabled: true },
    });

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.stripeCustomerId },
      { apiVersion: "2022-11-15" }
    );

    // console.log("✅ Payment intent created:>>>", paymentIntent.id);

    return res.json({
      paymentIntentClientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.stripeCustomerId,
    });
  } catch (err) {
    console.error("🔥 Stripe payment-sheet error:", err);
    return res.status(500).json({ msg: "Stripe error", error: err.message });
  }
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
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ msg: "Job not found." });

  job.customerCompleted = true;
  job.status = "completed";
  await job.save();

  return res.json(job);
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

/**
 * GET /api/jobs/me/stats
 * Returns how many jobs this provider has completed, and their total earnings.
 */


router.get("/me/stats", auth, async (req, res) => {
  try {
    const jobs = await Job.find({
      serviceProvider: req.user._id,
      status: "completed",
      paymentStatus: "paid",
    });

    let grossTotal = 0;
    let completedJobsCount = 0;
    let totalRating = 0;
    let reviewCount = 0;
    
    const reviews = [];

    jobs.forEach((job) => {
      const base = job.baseAmount || 0;
      const adjust = job.adjustmentAmount || 0;
      const rush = job.rushFee || 0;
      const extra = job.additionalCharge || 0;

      const subtotal = base + adjust + rush + extra;
      const providerShare = subtotal * 0.93; // Provider keeps 93% (7% fee retained by platform)

      grossTotal += providerShare;
      completedJobsCount++;

      if (typeof job.rating === "number") {
        totalRating += job.rating;
        reviewCount++;
      }

      if (job.comments) {
        reviews.push({
          rating: job.rating || null,
          comment: job.comments,
          date: job.completedAt,
        });
      }
    });

    const averageRating = reviewCount > 0 ? (totalRating / reviewCount) : null;

    res.json({
      completedJobsCount,
      totalAmountPaid: parseFloat(grossTotal.toFixed(2)),
      averageRating,
      reviews,
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
