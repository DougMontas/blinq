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

/**
 * POST /api/billing/subscribe
 * Subscribes a provider to a monthly plan via Stripe.
 */
router.post("/subscribe", auth, async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (
      user.role !== "serviceProvider" ||
      user.billingTier !== "subscription"
    ) {
      return res.status(400).json({ msg: "User is not a subscription member" });
    }

    // Create or reuse Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
    }

    // Attach payment method & set default
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env.STRIPE_PLAN_ID }],
      expand: ["latest_invoice.payment_intent"],
    });

    user.subscriptionId = subscription.id;
    await user.save();

    res.json({ subscription });
  } catch (error) {
    console.error("Error in subscription endpoint:", error);
    res
      .status(500)
      .json({ msg: "Subscription creation failed", error: error.message });
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
