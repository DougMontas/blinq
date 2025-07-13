// backend/routes/payments.js
//working
// import express from "express";
// import Stripe from "stripe";
// import xrpl from "xrpl";
// import { auth } from "../middlewares/auth.js";
// const router = express.Router();

// // instantiate Stripe with your secret key
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2022-11-15", // or whatever version you're on
//   timeout: 120000,
// });

// router.post("/stripe", async (req, res) => {
//   const { amount, currency = "usd" } = req.body;
//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount, // in cents
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

// router.post("/payment-sheet", auth, async (req, res) => {
//   try {
//     const { amount, currency = "usd" } = req.body;

//     // 1) Create a new Stripe Customer
//     const customer = await stripe.customers.create();

//     // 2) Create an ephemeral key so the client can fetch the customer
//     const ephemeralKey = await stripe.ephemeralKeys.create(
//       { customer: customer.id },
//       { apiVersion: "2022-11-15" }
//     );

//     // 3) Create a PaymentIntent with automatic PMs
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency,
//       customer: customer.id,
//       automatic_payment_methods: { enabled: true },
//     });

//     // 4) Send the client everything it needs
//     res.json({
//       paymentIntentClientSecret: paymentIntent.client_secret,
//       customer: customer.id,
//       ephemeralKey: ephemeralKey.secret,
//       publishableKey: process.env.STRIPE_PUBLIC_KEY,
//     });
//   } catch (err) {
//     console.error("POST /api/payments/payment-sheet error:", err);
//     res.status(500).json({ msg: err.message });
//   }
// });

// // @route   POST /api/payments/xrpl
// // @desc    Process XRP payment (stub)
// router.post("/xrpl", async (req, res) => {
//   const { amount, destination } = req.body;
//   try {
//     // TODO: implement real xrpl.Client logic here
//     res.json({ success: true, msg: "XRP payment processed (stub)" });
//   } catch (err) {
//     console.error("XRPL error:", err);
//     res.status(500).json({ msg: "XRP payment failed" });
//   }
// });

// export default router;

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
console.log("🧾 Stripe Secret Key in use:", process.env.STRIPE_SECRET_KEY?.slice(0, 8));
console.log("stripe ::::: ",stripe)

/********************************************************************************************
 * ✅ JOB PAYMENT INTENT HELPER FUNCTION (add near the top of this file)
 *******************************************************************************************/
// export async function createJobPaymentIntent({
//   amountUsd,
//   customerStripeId,
//   provider, // { stripeAccountId, tier }
// }) {
//   const JOB_CENTS = Math.round(amountUsd * 100);
//   const CUSTOMER_FEE = Math.round(JOB_CENTS * 0.07);
//   const PROVIDER_FEE = Math.round(JOB_CENTS * 0.07);
//   const TOTAL_CENTS = JOB_CENTS + CUSTOMER_FEE;
//   const PLATFORM_FEE = CUSTOMER_FEE + PROVIDER_FEE;

//   return stripe.paymentIntents.create({
//     amount: TOTAL_CENTS,
//     currency: "usd",
//     customer: customerStripeId,
//     payment_method_types: ["card"],
//     description: "BlinqFix Job",
//     application_fee_amount: PLATFORM_FEE,
//     transfer_data: { destination: provider.stripeAccountId },
//   });
// }

// export async function createJobPaymentIntent({
//   amountUsd,
//   customerStripeId,
//   provider, // optional
// }) {
//   const JOB_CENTS = Math.round(amountUsd * 100);
//   const CUSTOMER_FEE = Math.round(JOB_CENTS * 0.07);
//   const TOTAL_CENTS = JOB_CENTS + CUSTOMER_FEE;

//   const baseParams = {
//     amount: TOTAL_CENTS,
//     currency: "usd",
//     customer: customerStripeId,
//     description: "BlinqFix Job Prepayment",
//     metadata: {
//       type: provider ? provider.tier : "pre-dispatch",
//     },
//   };

//   if (provider?.stripeAccountId) {
//     baseParams.application_fee_amount =
//       CUSTOMER_FEE + Math.round(JOB_CENTS * 0.07); // platform fee
//     baseParams.transfer_data = {
//       destination: provider.stripeAccountId,
//     };
//   }

//   console.log("✅ Stripe intent created:", {
//     id: intent.id,
//     secret: intent.client_secret,
//   });

//   return stripe.paymentIntents.create(baseParams);
// }

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

// router.post("/payment-sheet", auth, async (req, res) => {
//   try {
//     const { amount, currency = "usd" } = req.body;

//     const customer = await stripe.customers.create();
//     const ephemeralKey = await stripe.ephemeralKeys.create(
//       { customer: customer.id },
//       { apiVersion: "2022-11-15" }
//     );

//     const provider = await Users.findById(req.user.id); // or linked job
//     const paymentIntent = await createJobPaymentIntent({
//       amountUsd: amount / 100,
//       customerStripeId: customer.id,
//       provider: {
//         stripeAccountId: provider.stripeAccountId,
//         tier: provider.billingTier,
//       },
//     });
//     // const paymentIntent = await stripe.paymentIntents.create({
//     //   amount,
//     //   currency,
//     //   customer: customer.id,
//     //   automatic_payment_methods: { enabled: true },
//     // });

//     res.json({
//       paymentIntentClientSecret: paymentIntent.client_secret,
//       customer: customer.id,
//       ephemeralKey: ephemeralKey.secret,
//       publishableKey: process.env.STRIPE_PUBLIC_KEY,
//     });
//   } catch (err) {
//     console.error("POST /api/payments/payment-sheet error:", err);
//     res.status(500).json({ msg: err.message });
//   }
// });

// router.post("/payment-sheet", auth, async (req, res) => {
//   try {
//     const { jobId } = req.body;
//     if (!jobId) return res.status(400).json({ msg: "Missing job ID." });

//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     const customer = await stripe.customers.create();
//     const ephemeralKey = await stripe.ephemeralKeys.create(
//       { customer: customer.id },
//       { apiVersion: "2022-11-15" }
//     );

//     const provider = await Users.findById(job.acceptedProvider);
//     if (!provider || !provider.stripeAccountId) {
//       return res.status(400).json({ msg: "Provider is not ready for payment." });
//     }

//     const paymentIntent = await createJobPaymentIntent({
//       amountUsd: job.estimatedTotal,
//       customerStripeId: customer.id,
//       provider: {
//         stripeAccountId: provider.stripeAccountId,
//         tier: provider.billingTier,
//       },
//     });

//     res.json({
//       paymentIntentClientSecret: paymentIntent.client_secret,
//       customer: customer.id,
//       ephemeralKey: ephemeralKey.secret,
//       publishableKey: process.env.STRIPE_PUBLIC_KEY,
//     });
//   } catch (err) {
//     console.error("💥 Error creating payment sheet:", err);
//     res.status(500).json({ msg: err.message });
//   }
// });

// router.post("/payment-sheet", auth, async (req, res) => {
//   try {
//     const { jobId } = req.body;
//     if (!jobId) return res.status(400).json({ msg: "Missing job ID." });

//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     const provider = await Users.findById(job.acceptedProvider);
//     if (!provider || !provider.stripeAccountId) {
//       return res.status(400).json({ msg: "Invalid provider or missing Stripe account." });
//     }

//     const customer = await stripe.customers.create({
//       metadata: {
//         jobId,
//         userId: req.user.id,
//       },
//     });

//     const ephemeralKey = await stripe.ephemeralKeys.create(
//       { customer: customer.id },
//       { apiVersion: "2022-11-15" }
//     );

//     const paymentIntent = await createJobPaymentIntent({
//       amountUsd: job.estimatedTotal,
//       customerStripeId: customer.id,
//       provider: {
//         stripeAccountId: provider.stripeAccountId,
//         tier: provider.billingTier,
//       },
//     });

//     res.json({
//       paymentIntentClientSecret: paymentIntent.client_secret,
//       customer: customer.id,
//       ephemeralKey: ephemeralKey.secret,
//       publishableKey: process.env.STRIPE_PUBLIC_KEY,
//     });
//   } catch (err) {
//     console.error("❌ /payment-sheet error:", err.message, err?.raw || err);
//     res.status(500).json({ msg: err.message || "Payment sheet setup failed." });
//   }
// });

// router.post("/payment-sheet", auth, async (req, res) => {
//   try {
//     const { jobId } = req.body;
//     if (!jobId) return res.status(400).json({ msg: "Missing job ID." });

//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     if (!job.acceptedProvider) {
//       return res.status(400).json({ msg: "No provider assigned to this job yet." });
//     }

//     const provider = await Users.findById(job.acceptedProvider);
//     if (!provider) {
//       return res.status(404).json({ msg: "Provider not found." });
//     }

//     if (!provider.stripeAccountId) {
//       return res.status(400).json({ msg: "Provider missing Stripe account ID." });
//     }

//     console.log("✅ Preparing customer...");
//     const customer = await stripe.customers.create({
//       metadata: {
//         jobId,
//         customerId: req.user.id,
//       },
//     });

//     console.log("✅ Creating ephemeral key...");
//     const ephemeralKey = await stripe.ephemeralKeys.create(
//       { customer: customer.id },
//       { apiVersion: "2022-11-15" }
//     );

//     console.log("✅ Creating payment intent...");

//     const paymentIntent = await createJobPaymentIntent({
//       amountUsd: job.estimatedTotal,
//       customerStripeId: customer.id,
//       provider: {
//         stripeAccountId: provider.stripeAccountId,
//         tier: provider.billingTier,
//       },
//     });

//     if (!paymentIntent?.client_secret) {
//       throw new Error("Failed to create PaymentIntent.");
//     }

//     res.json({
//       paymentIntentClientSecret: paymentIntent.client_secret,
//       customer: customer.id,
//       ephemeralKey: ephemeralKey.secret,
//       publishableKey: process.env.STRIPE_PUBLIC_KEY,
//     });
//   } catch (err) {
//     console.error("❌ /payment-sheet server error:", err.message, err);
//     res.status(500).json({ msg: err.message || "Payment sheet setup failed." });
//   }
// });

// router.post("/payment-sheet", auth, async (req, res) => {
//   try {
//     const { jobId } = req.body;
//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     const customer = await stripe.customers.create({
//       metadata: { jobId, userId: req.user.id },
//     });

//     const ephemeralKey = await stripe.ephemeralKeys.create(
//       { customer: customer.id },
//       { apiVersion: "2022-11-15" }
//     );

//     let provider = null;
//     if (job.acceptedProvider) {
//       provider = await Users.findById(job.acceptedProvider);
//     }

//     const paymentIntent = await createJobPaymentIntent({
//       amountUsd: job.estimatedTotal,
//       customerStripeId: customer.id,
//       provider: provider?.stripeAccountId
//         ? {
//             stripeAccountId: provider.stripeAccountId,
//             tier: provider.billingTier,
//           }
//         : null,
//     });

//     res.json({
//       paymentIntentClientSecret: paymentIntent.client_secret,
//       customer: customer.id,
//       ephemeralKey: ephemeralKey.secret,
//       publishableKey: process.env.STRIPE_PUBLIC_KEY,
//     });
//     console.log("✅ Created PaymentIntent:");
//     console.log("  ID:      ", paymentIntent.id);
//     console.log("  Secret:  ", paymentIntent.client_secret);
//     console.log(
//       "  Mode:    ",
//       process.env.STRIPE_SECRET_KEY?.includes("live") ? "LIVE" : "TEST"
//     );

//     console.log("✅ Created PaymentIntent:", paymentIntent.id);
//     console.log("✅ Returning client secret:", paymentIntent.client_secret);
//     console.log(
//       "🔑 Stripe mode:",
//       process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") ? "LIVE" : "TEST"
//     );
//   } catch (err) {
//     console.error("❌ /payment-sheet error:", err.message, err?.raw || err);
//     res
//       .status(500)
//       .json({ msg: err.message || "Failed to setup payment sheet" });
//   }
// });


// router.post("/payment-sheet", auth, async (req, res) => {
//   try {
//     const { jobId } = req.body;
//     if (!jobId) return res.status(400).json({ msg: "Missing job ID." });

//     const job = await Jobs.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found." });

//     const customer = await stripe.customers.create({
//       metadata: { jobId, userId: req.user.id },
//     });

//     const ephemeralKey = await stripe.ephemeralKeys.create(
//       { customer: customer.id },
//       { apiVersion: "2022-11-15" }
//     );

//     // Optional: allow intent without provider (if job is still pending)
//     let provider = null;
//     if (job.acceptedProvider) {
//       provider = await Users.findById(job.acceptedProvider);
//     }

//     // const paymentIntent = await createJobPaymentIntent({
//     //   amountUsd: job.estimatedTotal,
//     //   customerStripeId: customer.id,
//     //   provider: provider?.stripeAccountId
//     //     ? {
//     //         stripeAccountId: provider.stripeAccountId,
//     //         tier: provider.billingTier,
//     //       }
//     //     : null,
//     // });

//     // console.log("✅ Returning PaymentIntent:", paymentIntent.id);

//     res.json({
//       paymentIntentClientSecret: paymentIntent.client_secret,
//       customer: customer.id,
//       ephemeralKey: ephemeralKey.secret,
//       publishableKey: process.env.STRIPE_PUBLIC_KEY,
//     });
//   } catch (err) {
//     console.error("❌ /payment-sheet error:", err.message, err);
//     res.status(500).json({ msg: err.message || "Failed to setup payment sheet" });
//   }
// });

// router.post("/payment-sheet", auth, async (req, res) => {
//   try {
//     const { jobId } = req.body;
//     if (!jobId) return res.status(400).json({ msg: "Missing job ID" });

//     const job = await Job.findById(jobId);
//     if (!job) return res.status(404).json({ msg: "Job not found" });

//     const customer = await stripe.customers.create({
//       metadata: { jobId, userId: req.user.id },
//     });

//     const ephemeralKey = await stripe.ephemeralKeys.create(
//       { customer: customer.id },
//       { apiVersion: "2022-11-15" }
//     );

//     const amountCents = Math.round((job.estimatedTotal || 0) * 100);

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amountCents,
//       currency: "usd",
//       customer: customer.id,
//       description: "BlinqFix Emergency Job",
//       automatic_payment_methods: { enabled: true },
//     });

//     console.log("🎯 Returning client secret:", paymentIntent.client_secret);

//     return res.json({
//       paymentIntentClientSecret: paymentIntent.client_secret,
//       customer: customer.id,
//       ephemeralKey: ephemeralKey.secret,
//       publishableKey: process.env.STRIPE_PUBLIC_KEY,
//     });
//   } catch (err) {
//     console.error("❌ /payment-sheet error:", err.message, err);
//     res.status(500).json({ msg: err.message || "Stripe Payment Init Failed" });
//   }
// });

router.post("/payment-sheet", auth, async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ msg: "Missing job ID." });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found." });

    const customer = await stripe.customers.create({
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
