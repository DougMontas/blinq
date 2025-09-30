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

// console.log("🔐 Stripe key in use:", stripe._apiKey?.slice(0, 10));
// console.log(
//   "🧾 Stripe Secret Key in use:",
//   process.env.STRIPE_SECRET_KEY?.slice(0, 8)
// );
// console.log("stripe ::::: ", stripe);

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

// routes/payments.js (or wherever your router lives)

// IMPORTANT: This version must be compatible with your stripe-react-native SDK.
// 2022-11-15 is safe for current SDKs.
const STRIPE_EPH_API_VERSION = "2022-11-15";

/**
 * Helper: coerce an amount (dollars or cents) into integer cents.
 * Accepts numbers like 502.9 -> 50290; if caller already passed cents (e.g., 50290), it still works.
 */
function toCents(amount) {
  if (amount == null) return null;
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return null;

  // If it's an integer and reasonably large, we assume it's already cents (e.g., >= 50 = $0.50).
  if (Number.isInteger(n) && n >= 50) return n;

  // Otherwise treat as dollars and convert to cents
  return Math.round(n * 100);
}

/**
 * OPTIONAL: fetch your job by id and return the amount (in cents) you want to charge.
 * This prevents client-side tampering. Replace this stub with your DB lookup.
 */
async function resolveAmountCentsFromJob(jobId) {
  if (!jobId) return null;
  // TODO: Replace with your DB code:
  // const job = await Job.findById(jobId).lean();
  // if (!job) throw new Error("Job not found");
  // return Math.round(Number(job.estimatedTotal) * 100);
  return null; // keep null to fall back to body.amount for now
}

/**
 * Create (or reuse) a Stripe customer for the current user.
 * - You can wire this to req.user if you have auth, and persist customer.id in your DB.
 */
async function getOrCreateCustomer({ customerId, customerEmail, customerName }) {
  if (customerId) {
    // Optionally verify it exists; otherwise just return it.
    return customerId;
  }
  const customer = await stripe.customers.create({
    email: customerEmail || undefined,
    name: customerName || undefined,
    metadata: {
      source: "blinqfix-app",
    },
  });
  // TODO: persist `customer.id` to your user in DB so you can reuse it later
  return customer.id;
}

/**
 * Build everything the PaymentSheet needs.
 * Supports Connect when `connectAccountId` is provided.
 */
async function buildPaymentSheetSession({
  jobId,
  amount,                 // dollars or cents
  currency = "usd",
  customerId,             // optional, if you already have one stored
  customerEmail,          // optional (helps receipts and contact)
  customerName,           // optional
  connectAccountId,       // optional Stripe Connect account id (acct_xxx)
  idempotencyKey,         // optional; recommended (e.g., "job:<id>")
}) {
  // 1) Determine amount (prefer server-calculated by jobId)
  let amountCents = await resolveAmountCentsFromJob(jobId);
  if (!amountCents) {
    amountCents = toCents(amount);
  }
  if (!amountCents) {
    const err = new Error("Invalid or missing amount");
    err.status = 400;
    throw err;
  }

  // 2) Ensure a customer exists
  const custId = await getOrCreateCustomer({ customerId, customerEmail, customerName });

  // 3) Ephemeral key for the mobile SDK (must pass apiVersion here)
  const ephKey = await stripe.ephemeralKeys.create(
    { customer: custId },
    {
      apiVersion: STRIPE_EPH_API_VERSION,
      ...(connectAccountId ? { stripeAccount: connectAccountId } : {}),
    }
  );

  // 4) PaymentIntent for the total amount
  const piCreateArgs = {
    amount: amountCents,
    currency,
    customer: custId,
    // Let Stripe pick available payment methods in the user’s region
    automatic_payment_methods: { enabled: true },
    // Save the card for future off-session charges (e.g., add-ons)
    setup_future_usage: "off_session",
    receipt_email: customerEmail || undefined,
    metadata: {
      jobId: jobId || "",
      source: "blinqfix-app",
    },
  };

  const piOpts = { ...(idempotencyKey ? { idempotencyKey } : {}) };
  const pi =
    connectAccountId
      ? await stripe.paymentIntents.create(piCreateArgs, {
          ...piOpts,
          stripeAccount: connectAccountId,
        })
      : await stripe.paymentIntents.create(piCreateArgs, piOpts);

  return {
    ok: true,
    customer: custId,
    ephemeralKey: ephKey.secret,
    paymentIntentClientSecret: pi.client_secret,
    stripeAccountId: connectAccountId || undefined,
  };
}

/**
 * NEW: PaymentSheet session endpoint (recommended)
 * Your RN app should POST here with { jobId } OR { amount }, plus optional customer info.
 */
//old works with core categories
// router.post("/payments/payment-sheet", async (req, res) => {
//   try {
//     const {
//       jobId,
//       amount,           // dollars or cents
//       currency,
//       customerId,
//       customerEmail,
//       customerName,
//       connectAccountId, // for Connect (optional)
//     } = req.body || {};

//     const out = await buildPaymentSheetSession({
//       jobId,
//       amount,
//       currency,
//       customerId,
//       customerEmail,
//       customerName,
//       connectAccountId,
//       idempotencyKey: jobId ? `job:${jobId}:initial` : undefined,
//     });

//     return res.json(out);
//   } catch (err) {
//     console.error("[/payments/payment-sheet] error:", err);
//     return res.status(err.status || 500).json({
//       ok: false,
//       code: err.code || "stripe_error",
//       message: err.message || "Stripe error",
//     });
//   }
// });

// /api/jobs/payments/payment-sheet
// Creates a PaymentIntent for the customer to fund the job (subtotal + 7% customer fee)
// Returns { customer, ephemeralKey, paymentIntentClientSecret }
router.post("/payments/payment-sheet", auth, async (req, res) => {
  try {
    const { jobId } = req.body || {};
    if (!jobId) return res.status(400).json({ msg: "Missing jobId" });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    // Only the job's customer can pay
    if (String(job.customer) !== String(req.user._id)) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    // ---- Compute dollars on the server (never trust client) ----
    const base   = job.baseAmount || 0;
    const adjust = job.adjustmentAmount || 0;
    const rush   = job.rushFee || 0;
    const extra  = job.additionalCharge || 0;

    const subtotal = base + adjust + rush + extra;
    const CUSTOMER_FEE_RATE = 0.07;                          // 7%
    const customerFee = +(subtotal * CUSTOMER_FEE_RATE).toFixed(2);
    const totalToCharge = subtotal + customerFee;            // dollars
    const amount = Math.round(totalToCharge * 100);          // cents

    // ---- Stripe customer (reuse if we have one) ----
    let stripeCustomerId = req.user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.user.email || undefined,
        name:  req.user.name  || undefined,
        metadata: { userId: String(req.user._id) }
      });
      stripeCustomerId = customer.id;
      await Users.findByIdAndUpdate(req.user._id, { stripeCustomerId }, { new: true });
    }

    // ---- Ephemeral key for PaymentSheet ----
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: stripeCustomerId },
      { apiVersion: "2022-11-15" } // keep in sync with your Stripe version
    );

    // ---- PaymentIntent (no transfer/application_fee here) ----
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: stripeCustomerId,
      automatic_payment_methods: { enabled: true },
      metadata: {
        jobId: String(job._id),
        userId: String(req.user._id),
        purpose: "blinqfix_initial_payment"
      }
    });

    return res.json({
      customer: stripeCustomerId,
      ephemeralKey: ephemeralKey.secret,
      paymentIntentClientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    console.error("Stripe payment-sheet error:", err);
    return res.status(500).json({ msg: "Stripe error", error: err.message });
  }
});


/**
 * LEGACY: Keep /stripe route working but return what PaymentSheet needs.
 * If your app currently calls /payments/payment-sheet, you can remove this.
 */
router.post("/stripe", async (req, res) => {
  try {
    const {
      jobId,
      amount,
      currency,
      customerId,
      customerEmail,
      customerName,
      connectAccountId,
    } = req.body || {};

    const out = await buildPaymentSheetSession({
      jobId,
      amount,
      currency,
      customerId,
      customerEmail,
      customerName,
      connectAccountId,
      idempotencyKey: jobId ? `job:${jobId}:legacy` : undefined,
    });

    return res.json(out);
  } catch (err) {
    console.error("[/stripe] error:", err);
    return res.status(err.status || 500).json({
      ok: false,
      code: err.code || "stripe_error",
      message: err.message || "Stripe error",
    });
  }
});


//working
// router.post("/stripe", async (req, res) => {
//   const { amount, currency = "usd" } = req.body;
//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency,
//     });
//     res.json(paymentIntent);
//   } catch (err) {
//     console.error("Stripe error:", err);
//     res.status(500).json({
//       code: err.code || "stripe_error",
//       message: err.message,
//     });
//   }
// });

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
