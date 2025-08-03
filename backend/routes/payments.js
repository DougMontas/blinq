import express from "express";
import Stripe from "stripe";
import xrpl from "xrpl";
import { auth } from "../middlewares/auth.js";
import Job from "../models/Job.js";
import Users from "../models/Users.js";
// import { createJobPaymentIntent } from "./payments.js";

const router = express.Router();

// Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
  timeout: 120000,
});

console.log("🔐 Stripe key in use:", stripe._apiKey?.slice(0, 10));
console.log(
  "🧾 Stripe Secret Key in use:",
  process.env.STRIPE_SECRET_KEY?.slice(0, 8)
);
console.log("stripe ::::: ", stripe);

export async function createJobPaymentIntent({
  amountUsd,
  customerStripeId,
  provider, // optional
}) {
  const JOB_CENTS = Math.round(amountUsd * 100);
  const CUSTOMER_FEE = Math.round(JOB_CENTS * 0.07);
  const TOTAL_CENTS = JOB_CENTS + CUSTOMER_FEE;

  const baseParams = {
    amount: TOTAL_CENTS,
    currency: "usd",
    customer: customerStripeId,
    description: "BlinqFix Job Prepayment",
    metadata: {
      type: provider ? provider.tier : "pre-dispatch",
    },
  };

  if (provider?.stripeAccountId) {
    baseParams.application_fee_amount =
      CUSTOMER_FEE + Math.round(JOB_CENTS * 0.07); // platform fee
    baseParams.transfer_data = {
      destination: provider.stripeAccountId,
    };
  }

  const intent = await stripe.paymentIntents.create(baseParams); // ✅ define it

  console.log("✅ Stripe intent created:", {
    id: intent.id,
    secret: intent.client_secret,
  });

  return intent;
}

/********************************************************************************************
 * @route   POST /api/payments/stripe
 * @desc    Generic Stripe PaymentIntent (testing)
 *******************************************************************************************/

router.post("/stripe", async (req, res) => {
  const { amount, currency = "usd" } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
    res.json(paymentIntent);
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({
      code: err.code || "stripe_error",
      message: err.message,
    });
  }
});

/********************************************************************************************
 * @route   POST /api/payments/payment-sheet
 * @desc    Create ephemeral key + payment intent for mobile app
 *******************************************************************************************/

router.post("/payment-sheet", auth, async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ msg: "Missing job ID." });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found." });

    const customerName =
      req.body.customerName || req.user.name || "BlinqFix User";
    const customerEmail = req.body.customerEmail || req.user.email || "";

    const customer = await stripe.customers.create({
      name: customerName,
      email: customerEmail,
      metadata: { jobId, userId: req.user.id },
    });

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2022-11-15" }
    );

    const amountCents = Math.round((job.estimatedTotal || 0) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      customer: customer.id,
      description: "BlinqFix Emergency Job",
      automatic_payment_methods: { enabled: true },
      metadata: {
        stripeAccount: stripe._apiKey?.slice(0, 8),
        jobId: job._id.toString(),
      },
    });

    console.log("🎯 PaymentIntent Created:", {
      id: paymentIntent.id,
      secret: paymentIntent.client_secret,
      mode: stripe._apiKey?.includes("live") ? "LIVE" : "TEST",
    });

    return res.json({
      paymentIntentClientSecret: paymentIntent.client_secret,
      customer: customer.id,
      ephemeralKey: ephemeralKey.secret,
      publishableKey: process.env.STRIPE_PUBLIC_KEY,
    });
  } catch (err) {
    console.error("❌ /payment-sheet error:", err.message, err);
    res.status(500).json({ msg: err.message || "Stripe Payment Init Failed" });
  }
});

/********************************************************************************************
 * @route   POST /api/payments/xrpl
 * @desc    Process XRP payment (stub)
 *******************************************************************************************/
router.post("/xrpl", async (req, res) => {
  const { amount, destination } = req.body;
  try {
    res.json({ success: true, msg: "XRP payment processed (stub)" });
  } catch (err) {
    console.error("XRPL error:", err);
    res.status(500).json({ msg: "XRP payment failed" });
  }
});

export default router;
