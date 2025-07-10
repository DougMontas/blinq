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
import Job from "../models/Job.js"
import Users from "../models/Users.js"

const router = express.Router();

// Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
  timeout: 120000,
});

/********************************************************************************************
 * ✅ JOB PAYMENT INTENT HELPER FUNCTION (add near the top of this file)
 *******************************************************************************************/
export async function createJobPaymentIntent({
  amountUsd,
  customerStripeId,
  provider, // { stripeAccountId, tier }
}) {
  const JOB_CENTS = Math.round(amountUsd * 100);
  const CUSTOMER_FEE = Math.round(JOB_CENTS * 0.07);
  const PROVIDER_FEE = Math.round(JOB_CENTS * 0.07);
  const TOTAL_CENTS = JOB_CENTS + CUSTOMER_FEE;
  const PLATFORM_FEE = CUSTOMER_FEE + PROVIDER_FEE;

  return stripe.paymentIntents.create({
    amount: TOTAL_CENTS,
    currency: "usd",
    customer: customerStripeId,
    payment_method_types: ["card"],
    description: "BlinqFix Job",
    application_fee_amount: PLATFORM_FEE,
    transfer_data: { destination: provider.stripeAccountId },
  });
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

router.post("/payment-sheet", auth, async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ msg: "Missing job ID." });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: "Job not found." });

    if (!job.acceptedProvider) {
      return res.status(400).json({ msg: "No provider assigned to this job yet." });
    }

    const provider = await Users.findById(job.acceptedProvider);
    if (!provider) {
      return res.status(404).json({ msg: "Provider not found." });
    }

    if (!provider.stripeAccountId) {
      return res.status(400).json({ msg: "Provider missing Stripe account ID." });
    }

    console.log("✅ Preparing customer...");
    const customer = await stripe.customers.create({
      metadata: {
        jobId,
        customerId: req.user.id,
      },
    });

    console.log("✅ Creating ephemeral key...");
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2022-11-15" }
    );

    console.log("✅ Creating payment intent...");
    const paymentIntent = await createJobPaymentIntent({
      amountUsd: job.estimatedTotal,
      customerStripeId: customer.id,
      provider: {
        stripeAccountId: provider.stripeAccountId,
        tier: provider.billingTier,
      },
    });

    if (!paymentIntent?.client_secret) {
      throw new Error("Failed to create PaymentIntent.");
    }

    res.json({
      paymentIntentClientSecret: paymentIntent.client_secret,
      customer: customer.id,
      ephemeralKey: ephemeralKey.secret,
      publishableKey: process.env.STRIPE_PUBLIC_KEY,
    });
  } catch (err) {
    console.error("❌ /payment-sheet server error:", err.message, err);
    res.status(500).json({ msg: err.message || "Payment sheet setup failed." });
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
