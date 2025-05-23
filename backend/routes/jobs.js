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
// const upload = multer({ storage });

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

// function slimUser(user) {
//   if (!user) {
//     console.warn("⚠️ slimUser received null or undefined input");
//     return {};
//   }

//   if (typeof user.toObject === "function") {
//     const raw = user.toObject();
//     delete raw.password;
//     delete raw.w9;
//     delete raw.businessLicense;
//     delete raw.proofOfInsurance;
//     delete raw.independentContractorAgreement;
//     return raw;
//   }

//   // If already a plain object
//   if (typeof user === "object") {
//     const { password, w9, businessLicense, proofOfInsurance, independentContractorAgreement, ...rest } = user;
//     return rest;
//   }

//   console.warn("⚠️ slimUser received unexpected input:", user);
//   return {};
// }

/**
 * GET /api/jobs/:jobId
 */

// router.get("/:jobId", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const job = await Job.findById(jobId).populate("customer");

//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     const userId = req.user?.id?.toString();
//     const isCustomer = job.customer?._id?.toString() === userId;
//     const isInvited = job.invitedProviders?.map(p => p.toString()).includes(userId);

//     if (!isCustomer && !isInvited) {
//       return res.status(403).json({ msg: "Forbidden: Not authorized to view this job" });
//     }

//     return res.json(job);
//   } catch (err) {
//     console.error("GET /api/jobs/:jobId error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// // router.get("/:jobId([0-9a-fA-F]{24})", auth, async (req, res) => {
// //   try {
// //     const { jobId } = req.params;
// //     if (!mongoose.Types.ObjectId.isValid(jobId)) {
// //       return res.status(400).json({ msg: "Invalid job id." });
// //     }
// //     const job = await Job.findById(jobId).populate("customer");
// //     if (!job) return res.status(404).json({ msg: "Job not found" });
// //     return res.json(job);
// //   } catch (err) {
// //     console.error("GET /api/jobs/:jobId error:", err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // router.get("/:jobId([0-9a-fA-F]{24})", auth, async (req, res) => {
// //   try {
// //     const { jobId } = req.params;
// //     if (!mongoose.Types.ObjectId.isValid(jobId)) {
// //       return res.status(400).json({ msg: "Invalid job id." });
// //     }

// //     const job = await Job.findById(jobId).populate("customer");
// //     if (!job) return res.status(404).json({ msg: "Job not found" });

// //     // ✅ Allow access if user is the customer
// //     if (req.user.role === "customer" && job.customer._id.equals(req.user.id)) {
// //       return res.json(job);
// //     }

// //     // ✅ Allow access if user is an invited serviceProvider
// //     if (
// //       req.user.role === "serviceProvider" &&
// //       (job.invitedProviders || []).map(id => id.toString()).includes(req.user.id.toString())
// //     ) {
// //       return res.json(job);
// //     }

// //     return res.status(403).json({ msg: "You are not authorized to view this job." });
// //   } catch (err) {
// //     console.error("GET /api/jobs/:jobId error:", err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // router.get("/:jobId([0-9a-fA-F]{24})", auth, async (req, res) => {
// //   try {
// //     const { jobId } = req.params;
// //     if (!mongoose.Types.ObjectId.isValid(jobId)) {
// //       return res.status(400).json({ msg: "Invalid job id." });
// //     }

// //     const job = await Job.findById(jobId).populate("customer");
// //     if (!job) return res.status(404).json({ msg: "Job not found" });

// //     // ✅ Allow access if user is the customer
// //     if (req.user.role === "customer" && job.customer._id.equals(req.user.id)) {
// //       return res.json(job);
// //     }

// //     // ✅ Allow access if user is an invited serviceProvider
// //     if (
// //       req.user.role === "serviceProvider" &&
// //       (job.invitedProviders || []).map(id => id.toString()).includes(req.user.id.toString())
// //     ) {
// //       return res.json(job);
// //     }

// //     return res.status(403).json({ msg: "You are not authorized to view this job." });
// //   } catch (err) {
// //     console.error("GET /api/jobs/:jobId error:", err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// // router.get("/:jobId([0-9a-fA-F]{24})", auth, async (req, res) => {
// //   try {
// //     const { jobId } = req.params;
// //     if (!mongoose.Types.ObjectId.isValid(jobId)) {
// //       return res.status(400).json({ msg: "Invalid job id." });
// //     }

// //     const job = await Job.findById(jobId).populate("customer");
// //     if (!job) return res.status(404).json({ msg: "Job not found" });

// //     // ✅ Allow access if user is the customer
// //     if (req.user.role === "customer" && job.customer._id.equals(req.user.id)) {
// //       return res.json(job);
// //     }

// //     // ✅ Allow access if user is an invited serviceProvider
// //     if (
// //       req.user.role === "serviceProvider" &&
// //       (job.invitedProviders || []).map(id => id.toString()).includes(req.user.id.toString())
// //     ) {
// //       return res.json(job);
// //     }

// //     return res.status(403).json({ msg: "You are not authorized to view this job." });
// //   } catch (err) {
// //     console.error("GET /api/jobs/:jobId error:", err);
// //     return res.status(500).json({ msg: "Server error" });
// //   }
// // });

// router.get("/:jobId([0-9a-fA-F]{24})", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ msg: "Invalid job id." });
//     }

//     const job = await Job.findById(jobId).populate("customer");
//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     // ✅ Allow access if user is the customer
//     if (req.user.role === "customer" && job.customer._id.equals(req.user.id)) {
//       return res.json(job);
//     }

//     // ✅ Allow access if user is an invited serviceProvider
//     if (
//       req.user.role === "serviceProvider" &&
//       (job.invitedProviders || []).map(id => id.toString()).includes(req.user.id.toString())
//     ) {
//       return res.json(job);
//     }

//     return res.status(403).json({ msg: "You are not authorized to view this job." });
//   } catch (err) {
//     console.error("GET /api/jobs/:jobId error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

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
// router.put("/:jobId/accept", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ msg: "Invalid job id." });
//     }

//     const job = await Job.findByIdAndUpdate(
//       jobId,
//       {
//         acceptedProvider: req.user.id,
//         status: "accepted",
//       },
//       { new: true }
//     );
//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     // notify the customer
//     req.io.to(job.customer.toString()).emit("jobAccepted", {
//       jobId: job._id.toString(),
//     });

//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /api/jobs/:jobId/accept error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

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

/**
 * GET /api/jobs/homeowner/active
 */
// router.get("/homeowner/active", auth, async (req, res) => {
//   try {
//     const job = await Job.findOne({
//       customer: req.user.id,
//       status: { $in: ["pending", "invited", "accepted", "in_progress"] },
//     }).lean();
//     return res.json(job);
//   } catch (err) {
//     console.error("GET /api/jobs/homeowner/active error:", err);
//     return res.status(500).json({ msg: err.message });
//   }
// });

router.get("/homeowner/active", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "Unauthorized: Missing user context" });
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


/**
 * POST /api/jobs/:jobId/pay/stripe
 * (your existing stripe logic unchanged)
 */
// router.post("/:jobId/pay/stripe", auth, async (req, res) => {
//   // … your stripe‐manual logic here …
// });

/**
 * Phase‐1 invites: hybrid (clickable) + profit_sharing (teaser)
 */
// async function invitePhase1(job, customer, io) {
//   const homeZips = [
//     ...(Array.isArray(customer.zipcode) ? customer.zipcode : []),
//     ...(customer.serviceZipcode ? [customer.serviceZipcode] : []),
//   ].map((z) => z.toString().trim());

//   const hybrid = await Users.find({
//     role: "serviceProvider",
//     serviceType: job.serviceType,
//     serviceZipcode: { $in: homeZips },
//     billingTier: "hybrid",
//     _id: { $nin: job.cancelledProviders || [] },
//   }).lean();

//   const profit = await Users.find({
//     role: "serviceProvider",
//     serviceType: job.serviceType,
//     serviceZipcode: { $in: homeZips },
//     billingTier: "profit_sharing",
//     _id: { $nin: job.cancelledProviders || [] },
//   }).lean();

//   const toHybrid = hybrid.slice(0, MAX_INVITES_PER_ZIP);
//   const toProfit = profit.slice(0, MAX_INVITES_PER_ZIP);

//   job.invitedProviders = toHybrid.map((p) => p._id);
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
//   await job.save();

//   const payload = {
//     jobId: job._id.toString(),
//     invitationExpiresAt: job.invitationExpiresAt,
//     clickable: true,
//     customer: { name: customer.name, email: customer.email },
//     serviceType: job.serviceType,
//     covered: coveredDescriptions[job.serviceType] || "",
//     address: job.address,
//     baseAmount: job.baseAmount,
//     adjustmentAmount: job.adjustmentAmount,
//     rushFee: job.rushFee,
//     convenienceFee: job.convenienceFee,
//     details: job.details,
//   };

//   toHybrid.forEach((p) => io.to(p._id.toString()).emit("jobInvitation", payload));
//   toProfit.forEach((p) =>
//     io.to(p._id.toString()).emit("jobInvitation", { ...payload, clickable: false })
//   );
// }

// async function invitePhase1(job, customer, io) {
//   // build list of zip codes to match against
//   const homeZips = [
//     ...(Array.isArray(customer.zipcode) ? customer.zipcode : []),
//     ...(customer.serviceZipcode ? [customer.serviceZipcode] : []),
//   ].map((z) => z.toString().trim());

//   // find all eligible hybrid & profit_sharing providers
//   const hybrid = await Users.find({
//     role: "serviceProvider",
//     serviceType: job.serviceType,
//     serviceZipcode: { $in: homeZips },
//     billingTier: "hybrid",
//     _id: { $nin: job.cancelledProviders || [] },
//   }).lean();

//   const profit = await Users.find({
//     role: "serviceProvider",
//     serviceType: job.serviceType,
//     serviceZipcode: { $in: homeZips },
//     billingTier: "profit_sharing",
//     _id: { $nin: job.cancelledProviders || [] },
//   }).lean();

//   // take up to MAX invites total: hybrid first, then profit_sharing
//   const toHybrid = hybrid.slice(0, MAX_INVITES_PER_ZIP);
//   const slotsLeft = MAX_INVITES_PER_ZIP - toHybrid.length;
//   const toProfit = slotsLeft > 0 ? profit.slice(0, slotsLeft) : [];

//   // persist exactly those 7 (or fewer) into invitedProviders
//   const invited = [...toHybrid, ...toProfit];
//   job.invitedProviders = invited.map((p) => p._id);
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
//   await job.save();

//   // core payload for clickable invites
//   const basePayload = {
//     jobId: job._id.toString(),
//     invitationExpiresAt: job.invitationExpiresAt,
//     clickable: true,
//     customer: { name: customer.name, email: customer.email },
//     serviceType: job.serviceType,
//     covered: coveredDescriptions[job.serviceType] || "",
//     address: job.address,
//     baseAmount: job.baseAmount,
//     adjustmentAmount: job.adjustmentAmount,
//     rushFee: job.rushFee,
//     convenienceFee: job.convenienceFee,
//     details: job.details,
//   };

//   // send clickable invites to hybrid
//   toHybrid.forEach((p) =>
//     io.to(p._id.toString()).emit("jobInvitation", basePayload)
//   );

//   // send teaser (unclickable) invites to profit_sharing
//   const teaser = { ...basePayload, clickable: false };
//   toProfit.forEach((p) =>
//     io.to(p._id.toString()).emit("jobInvitation", teaser)
//   );
// }

// /**
//  * Phase‐2 invites: everyone clickable after 15 minutes
//  */
// async function invitePhaseTwo(jobId, io) {
//   const job = await Job.findById(jobId).lean();
//   if (!job) return;

//   const customer = await Users.findById(job.customer).lean();
//   const homeZips = [
//     ...(Array.isArray(customer.zipcode) ? customer.zipcode : []),
//     ...(customer.serviceZipcode ? [customer.serviceZipcode] : []),
//   ].map((z) => z.toString().trim());

//   const allProviders = await Users.find({
//     role: "serviceProvider",
//     serviceType: job.serviceType,
//     serviceZipcode: { $in: homeZips },
//     _id: { $nin: job.cancelledProviders || [] },
//   }).lean();

//   const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
//   await Job.findByIdAndUpdate(
//     jobId,
//     {
//       invitedProviders: allProviders.map((p) => p._id),
//       invitationPhase: 2,
//       invitationExpiresAt: expiresAt,
//     },
//     { new: true }
//   );

//   const payload = {
//     jobId: jobId.toString(),
//     invitationExpiresAt: expiresAt,
//     clickable: true,
//     customer: { name: customer.name, email: customer.email },
//     serviceType: job.serviceType,
//     address: job.address,
//     baseAmount: job.baseAmount,
//     adjustmentAmount: job.adjustmentAmount,
//     rushFee: job.rushFee,
//     convenienceFee: job.convenienceFee,
//     details: job.details,
//   };

//   allProviders.forEach((p) => io.to(p._id.toString()).emit("jobInvitation", payload));
// }

// async function invitePhase1(job, customer, io) {
//   // Use zip from emergency form, not from saved profile
//   const emergencyZip = job.serviceZipcode?.toString().trim();
//   if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

//   // find all eligible hybrid & profit_sharing providers
//   const hybrid = await Users.find({
//     role: "serviceProvider",
//     serviceType: job.serviceType,
//     serviceZipcode: emergencyZip,
//     billingTier: "hybrid",
//     _id: { $nin: job.cancelledProviders || [] },
//   }).lean();

//   const profit = await Users.find({
//     role: "serviceProvider",
//     serviceType: job.serviceType,
//     serviceZipcode: emergencyZip,
//     billingTier: "profit_sharing",
//     _id: { $nin: job.cancelledProviders || [] },
//   }).lean();

//   const toHybrid = hybrid.slice(0, MAX_INVITES_PER_ZIP);
//   const slotsLeft = MAX_INVITES_PER_ZIP - toHybrid.length;
//   const toProfit = slotsLeft > 0 ? profit.slice(0, slotsLeft) : [];

//   const invited = [...toHybrid, ...toProfit];
//   job.invitedProviders = invited.map((p) => p._id);
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
//   await job.save();

//   const basePayload = {
//     jobId: job._id.toString(),
//     invitationExpiresAt: job.invitationExpiresAt,
//     clickable: true,
//     customer: { name: customer.name, email: customer.email },
//     serviceType: job.serviceType,
//     covered: coveredDescriptions[job.serviceType] || "",
//     address: job.address,
//     baseAmount: job.baseAmount,
//     adjustmentAmount: job.adjustmentAmount,
//     rushFee: job.rushFee,
//     convenienceFee: job.convenienceFee,
//     details: job.details,
//   };

//   toHybrid.forEach((p) =>
//     io.to(p._id.toString()).emit("jobInvitation", basePayload)
//   );

//   const teaser = { ...basePayload, clickable: false };
//   toProfit.forEach((p) =>
//     io.to(p._id.toString()).emit("jobInvitation", teaser)
//   );
// }

// async function invitePhaseTwo(jobId, io) {
//   const job = await Job.findById(jobId).lean();
//   if (!job) return;

//   const emergencyZip = job.serviceZipcode?.toString().trim();
//   if (!emergencyZip) return;

//   const customer = await Users.findById(job.customer).lean();

//   const allProviders = await Users.find({
//     role: "serviceProvider",
//     serviceType: job.serviceType,
//     serviceZipcode: emergencyZip,
//     _id: { $nin: job.cancelledProviders || [] },
//   }).lean();

//   const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
//   await Job.findByIdAndUpdate(
//     jobId,
//     {
//       invitedProviders: allProviders.map((p) => p._id),
//       invitationPhase: 2,
//       invitationExpiresAt: expiresAt,
//     },
//     { new: true }
//   );

//   const payload = {
//     jobId: jobId.toString(),
//     invitationExpiresAt: expiresAt,
//     clickable: true,
//     customer: { name: customer.name, email: customer.email },
//     serviceType: job.serviceType,
//     address: job.address,
//     baseAmount: job.baseAmount,
//     adjustmentAmount: job.adjustmentAmount,
//     rushFee: job.rushFee,
//     convenienceFee: job.convenienceFee,
//     details: job.details,
//   };

//   allProviders.forEach((p) =>
//     io.to(p._id.toString()).emit("jobInvitation", payload)
//   );
// }

/**
 * PUT /api/jobs/complete-payment/:jobId
 */
// router.put("/complete-payment/:jobId", auth, async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     // 7% convenience fee
//     const rawFee = (job.estimatedTotal || 0) * 0.07;
//     job.convenienceFee = Math.round((rawFee + Number.EPSILON) * 100) / 100;

//     job.paymentStatus = "paid";
//     job.status = "invited";
//     await job.save();

//     const customer = await Users.findById(job.customer).lean();
//     if (!customer) return res.status(500).json({ msg: "Customer not found." });

//     await invitePhase1(job, customer, req.io);
//     setTimeout(() => invitePhaseTwo(job._id, req.io), 15 * 60 * 1000);

//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /api/jobs/complete-payment error:", err);
//     return res
//       .status(500)
//       .json({ msg: "Could not complete payment.", error: err.message });
//   }
// });

// router.put("/complete-payment/:jobId", auth, async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     // 7% convenience fee if not already set
//     const rawFee = (job.estimatedTotal || 0) * 0.07;
//     job.convenienceFee = Math.round((rawFee + Number.EPSILON) * 100) / 100;

//     job.paymentStatus = "paid";
//     job.status = "invited";
//     await job.save();

//     const customer = await Users.findById(job.customer).lean();
//     if (!customer) return res.status(500).json({ msg: "Customer not found." });

//     // launch phase-1 invites
//     await invitePhase1(job, customer, req.io);
//     // schedule phase-2
//     setTimeout(() => invitePhaseTwo(job._id, req.io), 15 * 60 * 1000);

//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /api/jobs/complete-payment error:", err);
//     return res
//       .status(500)
//       .json({ msg: "Could not complete payment.", error: err.message });
//   }
// });

// router.put("/complete-payment/:jobId", auth, async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     // calculate 7% convenience fee
//     const subtotal =
//       (job.baseAmount || 0) +
//       (job.adjustmentAmount || 0) +
//       (job.rushFee || 0) +
//       (job.additionalCharge || 0);
//     job.convenienceFee =
//       Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;

//     job.totalAmountPaid = subtotal + job.convenienceFee;
//     job.paymentStatus = "paid";

//     // If this was *only* an additional‐charge payment, do NOT re-invite:
//     if (job.status === "awaiting-additional-payment") {
//       // provider already accepted—just move it into progress
//       job.status = "accepted";
//       await job.save();
//       return res.json(job);
//     }

//     // --- otherwise, treat as initial payment ---
//     job.status = "invited";
//     await job.save();

//     const customer = await Users.findById(job.customer).lean();
//     if (!customer) return res.status(500).json({ msg: "Customer not found." });

//     console.log("💬 Job", job._id.toString());
//     console.log("💬 Service Type:", job.serviceType);
//     console.log("💬 ZIP:", job.serviceZipcode);

//     // const allProviders = await Users.find({
//     //   role: "serviceProvider",
//     //   serviceType: job.serviceType,
//     //   serviceZipcode: job.serviceZipcode,
//     // }).lean();

//     const allProviders = await Users.find({
//       role: "serviceProvider",
//       serviceType: job.serviceType,
//       serviceZipcode: job.serviceZipcode,
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();

//     console.log("💬 Providers fetched:", allProviders.length);

//     // Phase-1 invites now
//     // await invitePhaseOne(job, allProviders, req.io);
//     // await invitePhaseOne(job, customer, req.io)
//     // await invitePhaseOne(job, allProviders, req.io);
//     await invitePhaseOne(job, req.io);

//     // schedule Phase-2 in 15 minutes
//     setTimeout(() => {
//       invitePhaseTwo(job._id, req.io).catch((err) =>
//         console.error("Phase 2 invite error:", err)
//       );
//     }, 15 * 60 * 1000);

//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /api/jobs/complete-payment error:", err);
//     return res
//       .status(500)
//       .json({ msg: "Could not complete payment.", error: err.message });
//   }
// });

// router.put("/complete-payment/:jobId", auth, async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     // calculate 7% convenience fee
//     const subtotal =
//       (job.baseAmount || 0) +
//       (job.adjustmentAmount || 0) +
//       (job.rushFee || 0) +
//       (job.additionalCharge || 0);
//     job.convenienceFee =
//       Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;

//     job.totalAmountPaid = subtotal + job.convenienceFee;
//     job.paymentStatus = "paid";

//     if (job.status === "awaiting-additional-payment") {
//       job.status = "accepted";
//       await job.save();
//       return res.json(job);
//     }

//     job.status = "invited";
//     await job.save();

//     const customer = await Users.findById(job.customer).lean();
//     if (!customer) return res.status(500).json({ msg: "Customer not found." });

//     console.log("💬 Job", job._id.toString());
//     console.log("💬 Service Type:", job.serviceType);
//     console.log("💬 ZIP:", job.serviceZipcode);
//     console.log("🔍 req.user.id:", req.user.id);

//     await invitePhaseOne(job, customer, req.io);

//     setTimeout(() => {
//       invitePhaseTwo(job._id, req.io).catch((err) =>
//         console.error("Phase 2 invite error:", err)
//       );
//     }, 15 * 60 * 1000);

//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /api/jobs/complete-payment error:", err);
//     return res
//       .status(500)
//       .json({ msg: "Could not complete payment.", error: err.message });
//   }
// });

// router.put("/complete-payment/:jobId", auth, async (req, res) => {
//   try {
//     console.log("💳 Finalizing payment for job:", req.params.jobId);

//     const job = await Job.findById(req.params.jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     // Calculate 7% convenience fee
//     const subtotal =
//       (job.baseAmount || 0) +
//       (job.adjustmentAmount || 0) +
//       (job.rushFee || 0) +
//       (job.additionalCharge || 0);

//     job.convenienceFee =
//       Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;

//     job.totalAmountPaid = subtotal + job.convenienceFee;
//     job.paymentStatus = "paid";

//     if (job.status === "awaiting-additional-payment") {
//       job.status = "accepted";
//       await job.save();
//       return res.json(job);
//     }

//     job.status = "invited";
//     await job.save();

//     const customer = await Users.findById(job.customer).lean();
//     if (!customer) {
//       console.error("❌ Customer not found for job:", job._id.toString());
//       return res.status(500).json({ msg: "Customer not found." });
//     }

//     console.log("💬 Job", job._id.toString());
//     console.log("💬 Service Type:", job.serviceType);
//     console.log("💬 ZIP:", job.serviceZipcode);
//     console.log("🔍 Inviting providers...");

//     try {
//       await invitePhaseOne(job, customer, req.io);
//     } catch (inviteErr) {
//       console.error("🔥 invitePhaseOne failed:", inviteErr);
//       return res
//         .status(500)
//         .json({ msg: "Invite failed.", error: inviteErr.message });
//     }

//     setTimeout(() => {
//       invitePhaseTwo(job._id, req.io).catch((err) =>
//         console.error("Phase 2 invite error:", err)
//       );
//     }, 15 * 60 * 1000);

//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /api/jobs/complete-payment error:", err);
//     return res
//       .status(500)
//       .json({ msg: "Could not complete payment.", error: err.message });
//   }
// });

// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";

// router.put("/complete-payment/:jobId", auth, async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.jobId)
//       .populate("customer")
//       .populate("invitedProviders"); // added invitedProviders for access control

//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     // calculate 7% convenience fee
//     const subtotal =
//       (job.baseAmount || 0) +
//       (job.adjustmentAmount || 0) +
//       (job.rushFee || 0) +
//       (job.additionalCharge || 0);
//     job.convenienceFee =
//       Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;

//     job.totalAmountPaid = subtotal + job.convenienceFee;
//     job.paymentStatus = "paid";

//     if (job.status === "awaiting-additional-payment") {
//       job.status = "accepted";
//       await job.save();
//       return res.json(job);
//     }

//     job.status = "invited";
//     await job.save();

//     const customer = await Users.findById(job.customer).lean();
//     if (!customer) return res.status(500).json({ msg: "Customer not found." });

//     console.log("💬 Job", job._id.toString());
//     console.log("💬 Service Type:", job.serviceType);
//     console.log("💬 ZIP:", job.serviceZipcode);

//     await invitePhaseOne(job, customer, req.io);

//     setTimeout(() => {
//       invitePhaseTwo(job._id, req.io).catch((err) =>
//         console.error("Phase 2 invite error:", err)
//       );
//     }, 1 * 60 * 1000);

//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /api/jobs/complete-payment error:", err);
//     return res
//       .status(500)
//       .json({ msg: "Could not complete payment.", error: err.message });
//   }
// });

//previous
// router.put("/complete-payment/:jobId", auth, async (req, res) => {
//   // try {
//   //   const job = await Job.findById(req.params.jobId)
//   //     .populate("customer")
//   //     .populate("invitedProviders"); // added invitedProviders for access control

//   //   if (!job) return res.status(404).json({ msg: "Job not found." });

//   //   // calculate 7% convenience fee
//   //   const subtotal =
//   //     (job.baseAmount || 0) +
//   //     (job.adjustmentAmount || 0) +
//   //     (job.rushFee || 0) +
//   //     (job.additionalCharge || 0);
//   //   job.convenienceFee =
//   //     Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;

//   //   job.totalAmountPaid = subtotal + job.convenienceFee;
//   //   job.paymentStatus = "paid";

//   //   if (job.status === "awaiting-additional-payment") {
//   //     job.status = "accepted";
//   //     await job.save();
//   //     return res.json(job);
//   //   }

//   //   job.status = "invited";
//   //   await job.save();

//   //   const customer = await Users.findById(job.customer).lean();
//   //   if (!customer) return res.status(500).json({ msg: "Customer not found." });

//   //   console.log("💬 Job", job._id.toString());
//   //   console.log("💬 Service Type:", job.serviceType);
//   //   console.log("💬 ZIP:", job.serviceZipcode);

//   //   await invitePhaseOne(job, customer, req.io);

//   //   setTimeout(() => {
//   //     invitePhaseTwo(job._id, req.io).catch((err) =>
//   //       console.error("Phase 2 invite error:", err)
//   //     );
//   //   }, 1 * 60 * 1000);

//   //   return res.json(job);
//   // } catch (err) {
//   //   console.error("PUT /api/jobs/complete-payment error:", err);
//   //   return res
//   //     .status(500)
//   //     .json({ msg: "Could not complete payment.", error: err.message });
//   // }

//   try {
//     const job = await Job.findById(req.params.jobId)
//       .populate("customer")
//       .populate("invitedProviders"); // added invitedProviders for access control

//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     // calculate 7% convenience fee
//     const subtotal =
//       (job.baseAmount || 0) +
//       (job.adjustmentAmount || 0) +
//       (job.rushFee || 0) +
//       (job.additionalCharge || 0);
//     job.convenienceFee =
//       Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;

//     job.totalAmountPaid = subtotal + job.convenienceFee;
//     job.paymentStatus = "paid";

//     if (job.status === "awaiting-additional-payment") {
//       job.status = "accepted";
//       await job.save();
//       return res.json(job);
//     }

//     job.status = "invited";
//     await job.save();

//     const customer = await Users.findById(job.customer).lean();
//     if (!customer) return res.status(500).json({ msg: "Customer not found." });

//     // console.log("💬 Job", job._id.toString());
//     // console.log("💬 Service Type:", job.serviceType);
//     // console.log("💬 ZIP:", job.serviceZipcode);

//     await invitePhaseOne(job, customer, req.io);

//     setTimeout(() => {
//       invitePhaseTwo(job._id, req.io).catch((err) =>
//         console.error("Phase 2 invite error:", err)
//       );
//     }, 2 * 60 * 1000);

//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /api/jobs/complete-payment error:", err);
//     return res
//       .status(500)
//       .json({ msg: "Could not complete payment.", error: err.message });
//   }
// });

// router.put("/complete-payment/:jobId", auth, async (req, res) => {
//   // try {
//   //   const job = await Job.findById(req.params.jobId)
//   //     .populate("customer")
//   //     .populate("invitedProviders"); // added invitedProviders for access control

//   //   if (!job) return res.status(404).json({ msg: "Job not found." });

//   //   // calculate 7% convenience fee
//   //   const subtotal =
//   //     (job.baseAmount || 0) +
//   //     (job.adjustmentAmount || 0) +
//   //     (job.rushFee || 0) +
//   //     (job.additionalCharge || 0);
//   //   job.convenienceFee =
//   //     Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;

//   //   job.totalAmountPaid = subtotal + job.convenienceFee;
//   //   job.paymentStatus = "paid";

//   //   if (job.status === "awaiting-additional-payment") {
//   //     job.status = "accepted";
//   //     await job.save();
//   //     return res.json(job);
//   //   }

//   //   job.status = "invited";
//   //   await job.save();

//   //   const customer = await Users.findById(job.customer).lean();
//   //   if (!customer) return res.status(500).json({ msg: "Customer not found." });

//   //   console.log("💬 Job", job._id.toString());
//   //   console.log("💬 Service Type:", job.serviceType);
//   //   console.log("💬 ZIP:", job.serviceZipcode);

//   //   await invitePhaseOne(job, customer, req.io);

//   //   setTimeout(() => {
//   //     invitePhaseTwo(job._id, req.io).catch((err) =>
//   //       console.error("Phase 2 invite error:", err)
//   //     );
//   //   }, 1 * 60 * 1000);

//   //   return res.json(job);
//   // } catch (err) {
//   //   console.error("PUT /api/jobs/complete-payment error:", err);
//   //   return res
//   //     .status(500)
//   //     .json({ msg: "Could not complete payment.", error: err.message });
//   // }

//   try {
//     const job = await Job.findById(req.params.jobId)
//       .populate("customer")
//       .populate("invitedProviders"); // added invitedProviders for access control

//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     // calculate 7% convenience fee
//     const subtotal =
//       (job.baseAmount || 0) +
//       (job.adjustmentAmount || 0) +
//       (job.rushFee || 0) +
//       (job.additionalCharge || 0);
//     job.convenienceFee =
//       Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;

//     job.totalAmountPaid = subtotal + job.convenienceFee;
//     job.paymentStatus = "paid";

//     if (job.status === "awaiting-additional-payment") {
//       job.status = "accepted";
//       await job.save();
//       return res.json(job);
//     }

//     job.status = "invited";
//     await job.save();

//     const customer = await Users.findById(job.customer).lean();
//     if (!customer) return res.status(500).json({ msg: "Customer not found." });

//     // console.log("💬 Job", job._id.toString());
//     // console.log("💬 Service Type:", job.serviceType);
//     // console.log("💬 ZIP:", job.serviceZipcode);

//     await invitePhaseOne(job, customer, req.io);

//     setTimeout(() => {
//       invitePhaseTwo(job._id, req.io).catch((err) =>
//         console.error("Phase 2 invite error:", err)
//       );
//     }, 2 * 60 * 1000);

//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /api/jobs/complete-payment error:", err);
//     return res
//       .status(500)
//       .json({ msg: "Could not complete payment.", error: err.message });
//   }
// });

//working
// router.put("/complete-payment/:jobId", auth, async (req, res) => {
//   const { jobId } = req.params;

//   // Respond quickly to frontend
//   res.status(202).json({ msg: "Payment processing started." });

//   try {
//     console.time("⏱️ complete-payment");

//     const job = await Job.findById(jobId);
//     if (!job) {
//       console.error(`❌ Job not found: ${jobId}`);
//       return;
//     }

//     if (job.paymentStatus === "paid") {
//       console.log(`✅ Payment already marked paid for job ${jobId}`);
//       return;
//     }

//     // 1. Update payment status and convenience fee
//     const subtotal =
//       (job.baseAmount || 0) +
//       (job.adjustmentAmount || 0) +
//       (job.rushFee || 0) +
//       (job.additionalCharge || 0);
//     const convFee = Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//     job.convenienceFee = convFee;
//     job.totalAmountPaid = subtotal + convFee;
//     job.paymentStatus = "paid";

//     // 2. If this was only an additional payment
//     if (job.status === "awaiting-additional-payment") {
//       job.status = "accepted";
//     } else {
//       job.status = "invited";
//     }

//     await job.save();

//     // 3. Begin invitations
//     const customer = await Users.findById(job.customer).lean();
//     if (!customer) {
//       console.error(`❌ Customer not found for job ${jobId}`);
//       return;
//     }

//     console.time("🟡 invitePhaseOne duration");
//     await invitePhaseOne(job, customer, req.io);
//     console.timeEnd("🟡 invitePhaseOne duration");

//     setTimeout(() => {
//       invitePhaseTwo(job._id, req.io)
//         .then(() => console.log('✅ Phase 2 triggered successfully'))
//         .catch((err) => {
//           console.error("🔥 Phase 2 invite error:", err),
//           console.log("🚀 invitePhaseTwo launched for job", jobId);
//         });
//     }, 1 * 60 * 1000);

//     console.timeEnd("⏱️ complete-payment");
//   } catch (err) {
//     console.error("❌ PUT /complete-payment/:jobId error:", err);
//   }
// });


router.put("/complete-payment/:jobId", auth, async (req, res) => {
  const { jobId } = req.params;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    const isAdditionalOnly = job.status === "awaiting-additional-payment";

    const subtotal =
      (job.baseAmount || 0) +
      (job.adjustmentAmount || 0) +
      (job.rushFee || 0) +
      (job.additionalCharge || 0);
    const convFee = Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;

    job.convenienceFee = convFee;
    job.totalAmountPaid = subtotal + convFee;
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

    job.status = "invited";
    await job.save();

    const customer = await Users.findById(job.customer).lean();
    if (!customer) {
      return res.status(500).json({ msg: "Customer not found." });
    }

    await invitePhaseOne(job, customer, req.io);

    setTimeout(() => {
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

// router.put("/:jobId/update-charge", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { additionalCharge = 0 } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ msg: "Invalid job id." });
//     }

//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     // 1) Store extra charge
//     job.additionalCharge = Number(additionalCharge) || 0;

//     // 2) Recompute fees & total
//     const subtotal =
//       job.baseAmount +
//       job.adjustmentAmount +
//       job.rushFee +
//       job.additionalCharge;
//     const convFee = Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//     job.convenienceFee = convFee;
//     job.estimatedTotal = subtotal + convFee;

//     // 3) Flip to awaiting-additional state
//     job.status = "awaiting-additional-payment";
//     job.paymentStatus = "awaiting-additional-payment";

//     await job.save();
//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /api/jobs/:jobId/update-charge error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// router.put("/:jobId/complete-additional",
//  auth,
//  async (req, res) => {
//    try {
//      const job = await Job.findById(req.params.jobId);
//      if (!job) return res.status(404).json({ msg: "Job not found." });

//      // mark that additionalCharge has been paid
//      job.paymentStatus = "paid";
//      // put the job back into in_progress so provider can finish
//      job.status = "in_progress";
//      await job.save();

//      return res.json(job);
//    } catch (err) {
//      console.error("PUT /complete-additional error:", err);
//      return res.status(500).json({ msg: "Server error" });
//    }
//  }
// );

// router.put("/:jobId/update-charge", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { additionalCharge = 0 } = req.body;
//     if (!mongoose.Types.ObjectId.isValid(jobId))
//       return res.status(400).json({ msg: "Invalid job id." });

//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     // store the extra charge
//     job.additionalCharge = Number(additionalCharge) || 0;

//     // recompute fees
//     const subtotal =
//       job.baseAmount +
//       job.adjustmentAmount +
//       job.rushFee +
//       job.additionalCharge;
//     const convFee = Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//     job.convenienceFee = convFee;
//     job.estimatedTotal = subtotal + convFee;

//     // flip into “awaiting additional payment”
//     job.status = "awaiting-additional-payment";
//     job.paymentStatus = "awaiting-additional-payment";

//     await job.save();

//     // broadcast to that customer’s socket room
//     req.io.to(job.customer.toString()).emit("awaitingAdditionalPayment", {
//       jobId: job._id.toString(),
//     });

//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /update-charge error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// router.put("/:jobId/update-charge", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { additionalCharge = 0 } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(jobId))
//       return res.status(400).json({ msg: "Invalid job id." });

//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     // 1) Store extra charge
//     job.additionalCharge = Number(additionalCharge) || 0;

//     // 2) Recompute fees & total
//     const subtotal =
//       job.baseAmount +
//       job.adjustmentAmount +
//       job.rushFee +
//       job.additionalCharge;
//     const convFee = Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//     job.convenienceFee = convFee;
//     job.estimatedTotal = subtotal + convFee;

//     // 3) Flip to awaiting-additional state
//     job.status = "awaiting-additional-payment";
//     job.paymentStatus = "awaiting-additional-payment";

//     await job.save();
//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /api/jobs/:jobId/update-charge error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// router.put("/:jobId/update-charge", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { additionalCharge = 0 } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ msg: "Invalid job id." });
//     }

//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     // 1) store extra
//     job.additionalCharge = Number(additionalCharge) || 0;

//     // 2) recompute all fees & total
//     const subtotal =
//       job.baseAmount +
//       job.adjustmentAmount +
//       job.rushFee +
//       job.additionalCharge;
//     const convFee = Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//     job.convenienceFee = convFee;
//     job.estimatedTotal = subtotal + convFee;

//     // 3) flip to awaiting-additional-payment
//     job.status = "awaiting-additional-payment";
//     job.paymentStatus = "awaiting-additional-payment";

//     await job.save();
//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /api/jobs/:jobId/update-charge error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// router.put("/:jobId/update-charge", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { additionalCharge = 0 } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ msg: "Invalid job id." });
//     }
//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     // 1) Store extra charge
//     job.additionalCharge = Number(additionalCharge) || 0;

//     // 2) Recompute subtotal + 7% convenience fee
//     const subtotal = job.additionalCharge;
//     const convFee = Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//     job.convenienceFee = convFee;

//     // 3) New estimated total
//     job.estimatedTotal = subtotal + convFee;

//     // 4) Flip to awaiting-additional state so homeowner is prompted to pay
//     job.status = "awaiting-additional-payment";
//     job.paymentStatus = "awaiting-additional-payment";

//     await job.save();
//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /api/jobs/:jobId/update-charge error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// const handleUpdateCharge = async () => {
//   const amt = Number(additionalCharge) || 0;
//   try {
//     const { data } = await api.put(`/jobs/${jobId}/additional-charge`, {
//       additionalCharge: amt,
//       reason: additionalChargeReason,
//     });
//     setJob(data);
//     Alert.alert("Extra Charge Recorded", "Redirecting homeowner to payment…");
//   } catch (err) {
//     console.error("Update-charge error:", err);
//     Alert.alert("Error", "Failed to record extra charge.");
//   }
// };

// router.put("/:jobId/complete-additional", auth, async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     // we assume convenienceFee & estimatedTotal were already updated
//     job.paymentStatus = "paid";
//     job.status = "paid";
//     await job.save();

//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /api/jobs/:jobId/complete-additional error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// PUT /jobs/:id/additional-charge
// router.put("/:id/additional-charge", async (req, res) => {
//   const { additionalCharge, reason } = req.body;

//   if (!additionalCharge || !reason) {
//     return res.status(400).json({ error: "Charge amount and reason are required." });
//   }

//   try {
//     const job = await Job.findById(req.params.id);
//     if (!job) return res.status(404).json({ error: "Job not found" });

//     job.additionalCharge = additionalCharge;
//     job.additionalChargeReason = reason;
//     job.additionalChargePaid = false; // reset if updating again
//     await job.save();

//     return res.json(job);
//   } catch (err) {
//     console.error("Failed to record additional charge:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// PUT /jobs/:id/additional-charge

router.put("/jobs/:id/complete-additional", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    job.additionalChargePaid = true;
    job.chargeApproved = true;

    // You can also update status/paymentStatus if needed:
    job.status = "in_progress";
    job.paymentStatus = "paid";

    await job.save();
    res.json(job);
  } catch (err) {
    console.error("Failed to complete additional payment:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// router.put("/:id/additional-charge", async (req, res) => {
//   const { additionalCharge, reason } = req.body;

//   if (typeof additionalCharge !== "number" || !reason) {
//     return res
//       .status(400)
//       .json({ error: "Additional charge and reason are required." });
//   }

//   try {
//     const job = await Job.findById(req.params.id);
//     if (!job) return res.status(404).json({ error: "Job not found" });

//     job.additionalCharge = additionalCharge;
//     job.additionalChargeReason = reason;
//     job.status = "awaiting-additional-payment";
//     job.paymentStatus = "awaiting-additional-payment";
//     job.additionalChargePaid = false;

//     await job.save();
//     return res.json(job);
//   } catch (err) {
//     console.error("Failed to update charge:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// router.put("/:jobId/additional-charge", async (req, res) => {
//   const { jobId } = req.params;
//   const { additionalCharge, reason } = req.body;

//   if (!additionalCharge || !reason) {
//     return res.status(400).json({ error: "Charge amount and reason are required." });
//   }

//   try {
//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ error: "Job not found" });

//     job.additionalCharge = additionalCharge;
//     job.additionalChargeReason = reason;
//     job.status = "awaiting-additional-payment";
//     job.paymentStatus = "awaiting-additional-payment";
//     job.additionalChargePaid = false;

//     const subtotal = additionalCharge;
//     const convFee = Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//     job.convenienceFee = convFee;
//     job.estimatedTotal = subtotal + convFee;

//     await job.save();
//     return res.json(job);
//   } catch (err) {
//     console.error("❌ Failed to update charge:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

//worked
// router.put("/:jobId/additional-charge", async (req, res) => {
//   const { jobId } = req.params;
//   const { additionalCharge, reason } = req.body;

//   if (typeof additionalCharge !== "number" || !reason) {
//     return res
//       .status(400)
//       .json({ error: "Additional charge and reason are required." });
//   }

//   try {
//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ error: "Job not found" });

//     job.additionalCharge = additionalCharge;
//     job.additionalChargeReason = reason;
//     job.status = "awaiting-additional-payment";
//     job.paymentStatus = "awaiting-additional-payment";
//     job.additionalChargePaid = false;

//     const subtotal = additionalCharge;
//     const convFee = Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//     job.convenienceFee = convFee;
//     job.estimatedTotal = subtotal + convFee;

//     await job.save();
//     return res.json(job);
//   } catch (err) {
//     console.error("❌ Failed to update charge:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// router.put("/:jobId/additional-charge", async (req, res) => {
//   const { jobId } = req.params;
//   const { additionalCharge, reason } = req.body;

//   if (typeof additionalCharge !== "number" || !reason) {
//     return res
//       .status(400)
//       .json({ error: "Additional charge and reason are required." });
//   }

//   try {
//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ error: "Job not found" });

//     job.additionalCharge = additionalCharge;
//     job.additionalChargeReason = reason;
//     job.status = "awaiting-additional-payment";
//     job.paymentStatus = "awaiting-additional-payment";
//     job.additionalChargePaid = false;

//     const subtotal = additionalCharge;
//     const convFee = Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//     job.convenienceFee = convFee;
//     job.estimatedTotal = subtotal + convFee;

//     await job.save();
//     return res.json(job);
//   } catch (err) {
//     console.error("❌ Failed to update charge:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

router.put("/:jobId/additional-charge", auth, async (req, res) => {
  const { jobId } = req.params;
  const { additionalCharge, reason } = req.body;

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
    const convFee = Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
    job.convenienceFee = convFee;
    job.estimatedTotal = subtotal + convFee;

    await job.save();
    return res.json(job);
  } catch (err) {
    console.error("❌ Failed to update charge:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id/pay-additional", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });

    job.additionalChargePaid = true;
    await job.save();

    return res.json(job);
  } catch (err) {
    console.error("Failed to mark additional charge as paid:", err);
    return res.status(500).json({ error: "Server error" });
  }
});
// ✅ FIXED: Refactored /complete-payment/:jobId to conditionally skip invites for additional-only
// ✅ FIXED: Removed unused logic and duplicate routes
// ✅ FIXED: Added extraChargeOnly flag and early return

//current used
// router.put("/complete-payment/:jobId", auth, async (req, res) => {
//   const { jobId } = req.params;

//   try {
//     const job = await Job.findById(jobId);
//     if (!job) {
//       return res.status(404).json({ msg: "Job not found" });
//     }

//     const isAdditionalOnly = job.status === "awaiting-additional-payment";

//     // 1. Calculate convenience fee
//     const subtotal =
//       (job.baseAmount || 0) +
//       (job.adjustmentAmount || 0) +
//       (job.rushFee || 0) +
//       (job.additionalCharge || 0);
//     const convFee = Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;

//     job.convenienceFee = convFee;
//     job.totalAmountPaid = subtotal + convFee;
//     job.paymentStatus = "paid";

//     if (isAdditionalOnly) {
//       job.status = "accepted";
//       await job.save();
//       return res.json(job);
//     }

//     // 2. Standard payment (initial)
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

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    const isAdditionalOnly = job.status === "awaiting-additional-payment";

    // 1. Calculate convenience fee
    const subtotal =
      (job.baseAmount || 0) +
      (job.adjustmentAmount || 0) +
      (job.rushFee || 0) +
      (job.additionalCharge || 0);
    const convFee = Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;

    job.convenienceFee = convFee;
    job.totalAmountPaid = subtotal + convFee;
    job.paymentStatus = "paid";

    if (isAdditionalOnly) {
      job.status = "accepted";
      await job.save();
      return res.json(job);
    }

    // 2. Standard payment (initial)
    job.status = "invited";
    await job.save();

    const customer = await Users.findById(job.customer).lean();
    if (!customer) {
      return res.status(500).json({ msg: "Customer not found." });
    }

    await invitePhaseOne(job, customer, req.io);

    setTimeout(() => {
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
      return res.status(400).json({ msg: "Nothing to charge or already paid." });
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

// router.post("/payments/payment-sheet", auth, async (req, res) => {
//   try {
//     const { jobId } = req.body;
//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     const customer = await Users.findById(job.customer);
//     if (!customer?.stripeCustomerId)
//       return res.status(400).json({ msg: "Missing stripe customer id" });

//     // Determine amount for initial payment
//     const subtotal =
//       (job.baseAmount || 0) +
//       (job.adjustmentAmount || 0) +
//       (job.rushFee || 0);
//     const convFee = Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//     const total = subtotal + convFee;
//     const amountInCents = Math.round(total * 100);

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amountInCents,
//       currency: "usd",
//       customer: customer.stripeCustomerId,
//       automatic_payment_methods: { enabled: true },
//     });

//     const ephemeralKey = await stripe.ephemeralKeys.create(
//       { customer: customer.stripeCustomerId },
//       { apiVersion: "2022-11-15" }
//     );

//     return res.json({
//       paymentIntentClientSecret: paymentIntent.client_secret,
//       ephemeralKey: ephemeralKey.secret,
//       customer: customer.stripeCustomerId,
//     });
//   } catch (err) {
//     console.error("Stripe init payment error:", err);
//     return res.status(500).json({ msg: "Stripe error", error: err.message });
//   }
// });

// Add these logs in your backend to trace the payment-sheet call

// router.post("/payments/payment-sheet", async (req, res) => {
//   console.log("🔥 POST /payments/payment-sheet triggered");
//   console.log("🧾 Incoming body:", req.body);

//   const { amount, currency, jobId } = req.body;
//   if (!amount || !currency || !jobId) {
//     console.error("❌ Missing required fields:", { amount, currency, jobId });
//     return res.status(400).json({ msg: "Missing required fields." });
//   }

//   try {
//     const job = await Job.findById(jobId);
//     if (!job) {
//       console.error("❌ Job not found:", jobId);
//       return res.status(404).json({ msg: "Job not found" });
//     }

//     const customer = await Users.findById(job.customer);
//     if (!customer?.stripeCustomerId) {
//       console.error("❌ Missing stripeCustomerId for user:", job.customer);
//       return res.status(400).json({ msg: "Missing stripe customer id" });
//     }

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency,
//       customer: customer.stripeCustomerId,
//       automatic_payment_methods: { enabled: true },
//     });

//     const ephemeralKey = await stripe.ephemeralKeys.create(
//       { customer: customer.stripeCustomerId },
//       { apiVersion: "2022-11-15" }
//     );

//     console.log("✅ Payment intent created:", paymentIntent.id);

//     return res.json({
//       paymentIntentClientSecret: paymentIntent.client_secret,
//       ephemeralKey: ephemeralKey.secret,
//       customer: customer.stripeCustomerId,
//     });
//   } catch (err) {
//     console.error("🔥 Stripe payment-sheet error:", err);
//     return res.status(500).json({ msg: "Stripe error", error: err.message });
//   }
// });

// Add these logs in your backend to trace the payment-sheet call

// Add these logs in your backend to trace the payment-sheet call

router.post("/payments/payment-sheet", async (req, res) => {
  console.log("🔥 POST /payments/payment-sheet triggered");
  console.log("🧾 Incoming body:", req.body);

  const { amount, currency, jobId } = req.body;
  if (!amount || !currency || !jobId) {
    console.error("❌ Missing required fields:", { amount, currency, jobId });
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
      console.error("❌ Missing stripeCustomerId for user:", job.customer);
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

    console.log("✅ Payment intent created:", paymentIntent.id);

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

/**
 * Homeowner confirms completion
 * PUT  /api/jobs/:jobId/complete/customer
 */
// router.put("/:jobId/complete/customer", auth, async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     job.customerCompleted = true;
//     if (job.providerCompleted) job.status = "completed";

//     await job.save();
//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /complete/customer error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// router.put("/:jobId/complete/customer", auth, async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     job.customerCompleted = true;
//     // only flip fully to “completed” once both have done their parts
//     if (job.providerCompleted) {
//       job.status = "completed";
//     }
//     await job.save();
//     return res.json(job);
//   } catch (err) {
//     console.error("Customer complete error:", err);
//     return res.status(500).json({ msg: "Server error." });
//   }
// });

router.put("/:jobId/complete/customer", auth, async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ msg: "Job not found." });

  job.customerCompleted = true;
  job.status = "completed";
  await job.save();

  return res.json(job);
});

/**
 * Save rating once both have completed
 * PUT /api/jobs/:jobId/rate
 */
// router.put("/:jobId/rate", auth, async (req, res) => {
//   try {
//     const { rating } = req.body;
//     if (typeof rating !== "number") {
//       return res.status(400).json({ msg: "Rating must be a number." });
//     }
//     const job = await Job.findById(req.params.jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     job.rating = rating;
//     await job.save();
//     return res.json(job);
//   } catch (err) {
//     console.error("PUT /rate error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

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
    const providerId = req.user.id;

    // Only count fully completed jobs
    const completedJobs = await Job.find({
      acceptedProvider: providerId,
      status: "completed",
    }).lean();

    const completedJobsCount = completedJobs.length;
    // Sum up the total amount paid (you can choose estimatedTotal or stored payment amount)
    const totalAmountPaid = completedJobs.reduce(
      (sum, j) => sum + (j.estimatedTotal || 0),
      0
    );

    return res.json({ completedJobsCount, totalAmountPaid });
  } catch (err) {
    console.error("GET /api/jobs/me/stats error:", err);
    return res.status(500).json({ msg: "Server error" });
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

// PUT /api/jobs/:jobId/cancel
// router.put('/:jobId/cancel', auth, async (req, res) => {
//   const { jobId } = req.params;
//   const { travelFee = 0 } = req.body;

//   try {
//     const job = await Job.findById(jobId);
//     if (!job) {
//       return res.status(404).json({ msg: 'Job not found.' });
//     }

//     if (job.status === 'completed') {
//       return res.status(400).json({ msg: 'Cannot cancel a completed job.' });
//     }

//     job.status = 'cancelled_by_provider';
//     job.paymentStatus = 'cancelled';
//     job.travelFee = travelFee;

//     await job.save();
//     return res.json({ msg: 'Job successfully cancelled.', job });
//   } catch (err) {
//     console.error('Cancel job error:', err);
//     return res.status(500).json({ msg: 'Server error' });
//   }
// });

router.put('/:jobId/cancel', auth, async (req, res) => {
  const { jobId } = req.params;
  const { travelFee = 0 } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found.' });
    }

    if (job.status === 'completed') {
      return res.status(400).json({ msg: 'Cannot cancel a completed job.' });
    }

    job.status = 'cancelled_by_provider';
    job.paymentStatus = 'refunded'; // Changed from 'cancelled' to a valid enum value
    job.travelFee = travelFee;

    await job.save();
    return res.json({ msg: 'Job successfully cancelled.', job });
  } catch (err) {
    console.error('Cancel job error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// router.get("/:jobId", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const job = await Job.findById(jobId).populate("customer");

//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     const userId = req.user?.id?.toString();
//     const isCustomer = job.customer?._id?.toString() === userId;
//     const isInvited = job.invitedProviders
//       ?.map((p) => p.toString())
//       .includes(userId);

//     if (!isCustomer && !isInvited) {
//       return res
//         .status(403)
//         .json({ msg: "Forbidden: Not authorized to view this job" });
//     }

//     return res.json(job);
//   } catch (err) {
//     console.error("GET /api/jobs/:jobId error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// router.get("/:jobId", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;

//     const job = await Job.findById(jobId)
//       .populate("customer")
//       .populate("serviceProviders");

//     if (!job) {
//       return res.status(404).json({ msg: "Job not found" });
//     }

//     const userId = req.user?.id?.toString();

//     const isCustomer = job.customer?._id?.toString() === userId;
//     const isInvited = (job.invitedProviders || []).some(
//       (p) => p._id?.toString() === userId
//     );

//     if (!isCustomer && !isInvited) {
//       return res.status(403).json({ msg: "Forbidden: Not authorized to view this job" });
//     }

//     return res.json(job);
//   } catch (err) {
//     console.error("GET /api/jobs/:jobId error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// router.get("/:jobId([0-9a-fA-F]{24})", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ msg: "Invalid job id." });
//     }

//     const job = await Job.findById(jobId).populate("customer");
//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     // ✅ Allow access if user is the customer
//     if (req.user.role === "customer" && job.customer._id.equals(req.user.id)) {
//       return res.json(job);
//     }

//     // ✅ Allow access if user is an invited serviceProvider
//     if (
//       req.user.role === "serviceProvider" &&
//       (job.invitedProviders || []).map(id => id.toString()).includes(req.user.id.toString())
//     ) {
//       return res.json(job);
//     }

//     return res.status(403).json({ msg: "You are not authorized to view this job." });
//   } catch (err) {
//     console.error("GET /api/jobs/:jobId error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// router.get("/:jobId", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;

//     const job = await Job.findById(jobId)
//       .populate("customer")
//       .populate("invitedProviders");

//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     const userId = req.user?.id?.toString();
//     const isCustomer = job.customer?._id?.toString() === userId;

//     const isInvited = job.invitedProviders?.some(
//       (p) => p._id?.toString() === userId
//     );

//     if (!isCustomer && !isInvited) {
//       return res
//         .status(403)
//         .json({ msg: "Forbidden: Not authorized to view this job" });
//     }

//     return res.json(job);
//   } catch (err) {
//     console.error("GET /api/jobs/:jobId error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// router.get("/:jobId([0-9a-fA-F]{24})", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(jobId)) {
//       return res.status(400).json({ msg: "Invalid job id." });
//     }

//     const job = await Job.findById(jobId)
//       .populate("customer")
//       .populate("invitedProviders");

//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     const userId = req.user?.id?.toString();
//     const isCustomer =
//       req.user.role === "customer" && job.customer?._id?.toString() === userId;

//     const isInvited =
//       req.user.role === "serviceProvider" &&
//       job.invitedProviders?.some((p) => p._id?.toString() === userId);

//     if (!isCustomer && !isInvited) {
//       return res
//         .status(403)
//         .json({ msg: "You are not authorized to view this job." });
//     }

//     return res.json(job);
//   } catch (err) {
//     console.error("GET /api/jobs/:jobId error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// router.get("/:jobId", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;

//     const job = await Job.findById(jobId)
//       .populate("customer")
//       .populate("invitedProviders");

//     if (!job) {
//       return res.status(404).json({ msg: "Job not found" });
//     }

//     const userId = req.user?.id?.toString();

//     const isCustomer = job.customer?._id?.toString() === userId;
//     const isInvited = job.invitedProviders?.some(
//       (p) => p?._id?.toString() === userId
//     );

//     if (!isCustomer && !isInvited) {
//       return res.status(403).json({ msg: "Forbidden: Not authorized to view this job" });
//     }

//     return res.json(job);
//   } catch (err) {
//     console.error("GET /api/jobs/:jobId error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

//working invite logic
// router.get("/:jobId([0-9a-fA-F]{24})", auth, async (req, res) => {
//   // try {
//   //   const { jobId } = req.params;

//   //   if (!mongoose.Types.ObjectId.isValid(jobId)) {
//   //     return res.status(400).json({ msg: "Invalid job id." });
//   //   }

//   //   const job = await Job.findById(jobId)
//   //     .populate("customer")
//   //     .populate("invitedProviders");

//   //   if (!job) return res.status(404).json({ msg: "Job not found" });

//   //   const userId = req.user?.id?.toString();

//   //   const isCustomer =
//   //     req.user.role === "customer" && job.customer?._id?.toString() === userId;

//   //   const isInvited =
//   //     req.user.role === "serviceProvider" &&
//   //     job.invitedProviders?.some((p) => p._id?.toString() === userId);

//   //   console.log("🔍 Checking access for user:", userId);
//   //   console.log("🔍 Job invitedProviders:", job.invitedProviders?.map(p => p._id.toString()));

//   //   if (!isCustomer && !isInvited) {
//   //     return res
//   //       .status(403)
//   //       .json({ msg: "You are not authorized to view this job." });
//   //   }

//   //   return res.json(job);
//   // } catch (err) {
//   //   console.error("GET /api/jobs/:jobId error:", err);
//   //   return res.status(500).json({ msg: "Server error" });
//   // }
//   //   try {
//   //     const { jobId } = req.params;

//   //     const job = await Job.findById(jobId)
//   //       .populate("customer")
//   //       .populate("invitedProviders");

//   //     if (!job) {
//   //       return res.status(404).json({ msg: "Job not found" });
//   //     }

//   //     const userId = req.user?.id?.toString();

//   //     const isCustomer = job.customer?._id?.toString() === userId;
//   //     const isInvited = job.invitedProviders?.some(
//   //       (p) => p?._id?.toString() === userId
//   //     );

//   //     if (!isCustomer && !isInvited) {
//   //       return res.status(403).json({ msg: "Forbidden: Not authorized to view this job" });
//   //     }

//   //     return res.json(job);
//   //   } catch (err) {
//   //     console.error("GET /api/jobs/:jobId error:", err);
//   //     return res.status(500).json({ msg: "Server error" });
//   //   }
//   // });

//   try {
//     const { jobId } = req.params;

//     const job = await Job.findById(jobId)
//       .populate("customer")
//       .populate("invitedProviders");

//     if (!job) {
//       return res.status(404).json({ msg: "Job not found" });
//     }

//     const userId = req.user?.id?.toString();

//     const isCustomer = job.customer?._id?.toString() === userId;
//     const isInvited = job.invitedProviders?.some(
//       (p) => p?._id?.toString() === userId
//     );

//     if (!isCustomer && !isInvited) {
//       return res
//         .status(403)
//         .json({ msg: "Forbidden: Not authorized to view this job" });
//     }

//     // console.log("👤 Customer resolved:", job.customer);
//     // console.log("📦 Full job response keys:", Object.keys(job.toObject()));

//     return res.json(job);
//   } catch (err) {
//     console.error("GET /api/jobs/:jobId error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

// const slimUser = (user) => {
//   if (!user) return user;
//   const clone = { ...user };
//   delete clone.w9;
//   delete clone.businessLicense;
//   delete clone.proofOfInsurance;
//   delete clone.independentContractorAgreement;
//   return clone;
// };

// router.get("/:jobId([0-9a-fA-F]{24})", auth, async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.jobId)
//       .populate("customer")
//       .populate("invitedProviders")
//       .lean();

//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     // Slim customer
//     if (job.customer) {
//       job.customer = slimUser(job.customer);
//     }

//     // Slim invited providers
//     if (Array.isArray(job.invitedProviders)) {
//       job.invitedProviders = job.invitedProviders.map(slimUser);
//     }

//     const userId = req.user?.id?.toString();
//     const isCustomer = job.customer?._id?.toString() === userId;
//     const isInvited = job.invitedProviders?.some(
//       (p) => p?._id?.toString() === userId
//     );

//     if (!isCustomer && !isInvited) {
//       return res
//         .status(403)
//         .json({ msg: "Forbidden: Not authorized to view this job" });
//     }

//     res.json(job);
//   } catch (err) {
//     console.error("GET /api/jobs/:jobId error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// router.get("/:jobId([0-9a-fA-F]{24})", auth, async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const job = await Job.findById(jobId)
//       .populate("customer")
//       .populate("invitedProviders");

//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     const userId = req.user?.id?.toString();
//     const isCustomer = job.customer?._id?.toString() === userId;
//     const isInvited = job.invitedProviders?.some(
//       (p) => p?._id?.toString() === userId
//     );

//     if (!isCustomer && !isInvited) {
//       return res.status(403).json({ msg: "Forbidden: Not authorized to view this job" });
//     }

//     const jobObj = job.toObject();
//     jobObj.customer = slimUser(jobObj.customer);
//     jobObj.invitedProviders = jobObj.invitedProviders?.map(slimUser);
//     return res.json(jobObj);
//   } catch (err) {
//     console.error("GET /api/jobs/:jobId error:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// });

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
