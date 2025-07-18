// backend/routes/billingRoutes.js
import dotenv from "dotenv";
dotenv.config(); //

import express from "express";
import { auth } from "../middlewares/auth.js";
import Users from "../models/Users.js";
import Job from "../models/Job.js";
import StripePackage from "stripe";

const stripe = StripePackage(process.env.STRIPE_SECRET_KEY, {
  timeout: 120000,
});

const router = express.Router();

// router.post("/subscribe", auth, async (req, res) => {
//   try {
//     const provider = req.user;
//     if (provider.tier !== "hybrid")
//       return res.status(400).json({ msg: "Provider is not in hybrid tier." });

//     if (!provider.stripeAccountId)
//       return res
//         .status(400)
//         .json({ msg: "Provider has no Stripe account yet." });

//     const { paymentMethodId } = req.body;

//     let customerId = provider.stripeCustomerId;
//     if (!customerId) {
//       const customer = await stripe.customers.create({
//         email: provider.email,
//         name: provider.businessName || provider.name,
//         payment_method: paymentMethodId,
//         dob: provider.dob,
//         ssnLast4: provider.ssnLast4,
//         invoice_settings: { default_payment_method: paymentMethodId },
//       });
//       customerId = customer.id;
//       provider.stripeCustomerId = customerId;
//       await provider.save();
//     } else {
//       await stripe.paymentMethods.attach(paymentMethodId, {
//         customer: customerId,
//       });
//       await stripe.customers.update(customerId, {
//         invoice_settings: { default_payment_method: paymentMethodId },
//       });
//     }

//     const subs = await stripe.subscriptions.list({
//       customer: customerId,
//       status: "all",
//       limit: 1,
//     });
//     if (!subs.data.length) {
//       await stripe.subscriptions.create({
//         customer: customerId,
//         items: [{ price: process.env.STRIPE_HYBRID_PRICE_ID }],
//         metadata: { providerId: provider.id },
//       });
//     }

//     res.json({ ok: true });
//   } catch (err) {
//     console.error("Subscribe error", err);
//     res.status(500).json({ msg: "Failed to start hybrid subscription." });
//   }
// });

router.post("/subscribe", auth, async (req, res) => {
  try {
    const provider = req.user;

    if (provider.billingTier !== "hybrid") {
      return res.status(400).json({ msg: "You must be in the hybrid tier to subscribe." });
    }

    if (!provider.stripeAccountId) {
      return res.status(400).json({ msg: "Provider has no Stripe account yet." });
    }

    const { paymentMethodId } = req.body;

    let customerId = provider.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: provider.email,
        name: provider.businessName || provider.name,
        phone: provider.phoneNumber,
      });

      customerId = customer.id;
      provider.stripeCustomerId = customerId;
      await provider.save();
    }

    // Attach and set default payment method
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Check if already subscribed
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (!subs.data.length) {
      await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: process.env.STRIPE_HYBRID_PRICE_ID }],
        metadata: { providerId: provider.id },
      });
    }

    res.json({ msg: "Hybrid subscription active." });
  } catch (err) {
    console.error("Subscribe error", err.message, err?.raw || err);
    res.status(500).json({ msg: "Failed to start hybrid subscription." });
  }
});


/**
 * PUT /api/billing/jobs/:jobId/complete
 * Completes a job and processes payout based on billing tier.
 */
router.put("/jobs/:jobId/complete", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    const provider = await Users.findById(job.acceptedProvider);
    if (!provider)
      return res.status(404).json({ msg: "Service provider not found" });

    // Subscription providers: mark paid
    if (provider.billingTier === "subscription") {
      job.paymentStatus = "paid";
      await job.save();
      return res.json({
        msg: "Job marked complete (subscription billing).",
        job,
      });
    }

    // Profit-sharing providers: calculate fee & transfer via Stripe Connect
    if (provider.billingTier === "profit_sharing") {
      const rate = Number(provider.profitSharingFeePercentage ?? 0.3);
      const base = Number(job.serviceCost) || 0;
      const extra = Number(job.additionalCharge) || 0;
      const total = base + extra;
      const fee = total * rate;
      const payout = total - fee;

      if (!provider.stripeAccountId) {
        return res
          .status(400)
          .json({ msg: "Provider Stripe account not configured." });
      }

      const transfer = await stripe.transfers.create({
        amount: Math.round(payout * 100),
        currency: "usd",
        destination: provider.stripeAccountId,
        transfer_group: job.id,
      });

      job.paymentStatus = "paid";
      job.convenienceFee = fee;
      await job.save();

      return res.json({
        msg: "Job payout processed successfully",
        job,
        transfer,
      });
    }

    res.status(400).json({ msg: "Invalid billing tier" });
  } catch (error) {
    console.error("Error completing job payment:", error);
    res
      .status(500)
      .json({ msg: "Job completion payout failed", error: error.message });
  }
});

export default router;
