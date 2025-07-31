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

//latest
// router.post("/subscribe", auth, async (req, res) => {
//   try {
//     const provider = req.user;

//     if (provider.billingTier !== "hybrid") {
//       return res.status(400).json({ msg: "You must be in the hybrid tier to subscribe." });
//     }

//     if (!provider.stripeAccountId) {
//       return res.status(400).json({ msg: "Provider has no Stripe account yet." });
//     }

//     const { paymentMethodId } = req.body;

//     let customerId = provider.stripeCustomerId;

//     if (!customerId) {
//       const customer = await stripe.customers.create({
//         email: provider.email,
//         name: provider.businessName || provider.name,
//         phone: provider.phoneNumber,
//       });

//       customerId = customer.id;
//       provider.stripeCustomerId = customerId;
//       await provider.save();
//     }

//     // Attach and set default payment method
//     await stripe.paymentMethods.attach(paymentMethodId, {
//       customer: customerId,
//     });

//     await stripe.customers.update(customerId, {
//       invoice_settings: { default_payment_method: paymentMethodId },
//     });

//     // Check if already subscribed
//     const subs = await stripe.subscriptions.list({
//       customer: customerId,
//       status: "active",
//       limit: 1,
//     });

//     if (!subs.data.length) {
//       await stripe.subscriptions.create({
//         customer: customerId,
//         items: [{ price: process.env.STRIPE_HYBRID_PRICE_ID }],
//         metadata: { providerId: provider.id },
//       });
//     }

//     res.json({ msg: "Hybrid subscription active." });
//   } catch (err) {
//     console.error("Subscribe error", err.message, err?.raw || err);
//     res.status(500).json({ msg: "Failed to start hybrid subscription." });
//   }
// });
//last latest
// router.post("/subscribe", auth, async (req, res) => {
//   try {
//     const provider = req.user;
//     const { paymentMethodId } = req.body;

//     // Ensure Stripe Connect onboarding for payouts
//     if (!provider.stripeAccountId) {
//       const account = await stripe.accounts.create({
//         type: "express",
//         country: "US",
//         email: provider.email,
//         capabilities: { transfers: { requested: true } },
//         business_type: "individual",
//         individual: {
//           email: provider.email,
//           first_name: provider.name.split(" ")[0],
//           last_name: provider.name.split(" ").slice(1).join(" ") || "N/A",
//         },
//         metadata: {
//           providerId: provider._id.toString(),
//         },
//       });

//       provider.stripeAccountId = account.id;
//       await provider.save();
//     }

//     // PROFIT SHARING TIER — No subscription
//     if (provider.billingTier === "profit_sharing") {
//       if (!provider.stripeCustomerId) {
//         const customer = await stripe.customers.create({
//           email: provider.email,
//           name: provider.businessName || provider.name,
//           phone: provider.phoneNumber,
//           metadata: {
//             providerId: provider._id.toString(),
//             billingTier: "profit_sharing",
//           },
//         });
//         provider.stripeCustomerId = customer.id;
//         await provider.save();
//       }

//       return res.status(200).json({
//         msg: "Profit Sharing tier activated. Onboarding required.",
//         stripeAccountId: provider.stripeAccountId,
//       });
//     }

//     // HYBRID TIER — With subscription
//     if (provider.billingTier === "hybrid") {
//       if (!paymentMethodId) {
//         return res.status(400).json({ msg: "Payment method ID is required for hybrid tier." });
//       }

//       let customerId = provider.stripeCustomerId;

//       if (!customerId) {
//         const customer = await stripe.customers.create({
//           email: provider.email,
//           name: provider.businessName || provider.name,
//           phone: provider.phoneNumber,
//           metadata: {
//             providerId: provider._id.toString(),
//             billingTier: "hybrid",
//           },
//         });
//         customerId = customer.id;
//         provider.stripeCustomerId = customerId;
//         await provider.save();
//       }

//       await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
//       await stripe.customers.update(customerId, {
//         invoice_settings: {
//           default_payment_method: paymentMethodId,
//         },
//       });

//       const existing = await stripe.subscriptions.list({
//         customer: customerId,
//         status: "active",
//         limit: 1,
//       });
//       if (existing.data.length) {
//         return res.status(200).json({ msg: "Subscription already active." });
//       }

//       const subscription = await stripe.subscriptions.create({
//         customer: customerId,
//         items: [{ price: process.env.STRIPE_HYBRID_PRICE_ID }],
//         metadata: {
//           providerId: provider._id.toString(),
//           billingTier: "hybrid",
//         },
//         expand: ["latest_invoice.payment_intent"],
//       });

//       return res.status(200).json({
//         msg: "Hybrid subscription started.",
//         subscriptionId: subscription.id,
//         customerId,
//         clientSecret: subscription.latest_invoice?.payment_intent?.client_secret || null,
//         stripeAccountId: provider.stripeAccountId,
//       });
//     }

//     return res.status(400).json({ msg: "Unsupported billing tier." });
//   } catch (err) {
//     console.error("❌ Subscribe error", err.message, err?.raw || err);
//     return res.status(500).json({ msg: "Subscription error", error: err.message });
//   }
// });

router.post("/subscribe", auth, async (req, res) => {
  try {
    const provider = req.user;
    const { paymentMethodId } = req.body;

    console.log("🧾 Incoming subscription request for:", provider.email);

    if (!provider.billingTier) {
      return res.status(400).json({ msg: "Missing billing tier." });
    }

    // STEP 1: Ensure Stripe Connect account exists for payouts
    if (!provider.stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: provider.email,
        business_type: "individual",
        individual: {
          email: provider.email,
          first_name: provider.name.split(" ")[0],
          last_name: provider.name.split(" ").slice(1).join(" ") || "N/A",
        },
        capabilities: { transfers: { requested: true } },
        metadata: { providerId: provider._id.toString() },
      });

      provider.stripeAccountId = account.id;
      await provider.save();
      console.log("✅ Stripe Connect account created:", account.id);
    }

    // STEP 2: Profit sharing (no subscription)
    if (provider.billingTier === "profit_sharing") {
      if (!provider.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: provider.email,
          name: provider.businessName || provider.name,
          phone: provider.phoneNumber,
          metadata: {
            providerId: provider._id.toString(),
            billingTier: "profit_sharing",
          },
        });
        provider.stripeCustomerId = customer.id;
        await provider.save();
        console.log("✅ Stripe customer created for profit sharing:", customer.id);
      }

      return res.status(200).json({
        msg: "Profit Sharing tier activated. Onboarding required.",
        stripeAccountId: provider.stripeAccountId,
      });
    }

    // STEP 3: Hybrid billing tier
    if (provider.billingTier === "hybrid") {
      if (!paymentMethodId) {
        return res.status(400).json({ msg: "Payment method ID is required for hybrid tier." });
      }

      let customerId = provider.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: provider.email,
          name: provider.businessName || provider.name,
          phone: provider.phoneNumber,
          metadata: {
            providerId: provider._id.toString(),
            billingTier: "hybrid",
          },
        });
        customerId = customer.id;
        provider.stripeCustomerId = customerId;
        await provider.save();
        console.log("✅ Stripe customer created for hybrid:", customerId);
      } else {
        console.log("🔁 Using existing Stripe customer:", customerId);
      }

      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      const existing = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      if (existing.data.length) {
        console.log("🔁 Existing subscription found for:", customerId);
        return res.status(200).json({ msg: "Subscription already active." });
      }

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: process.env.STRIPE_HYBRID_PRICE_ID }],
        metadata: {
          providerId: provider._id.toString(),
          billingTier: "hybrid",
        },
        expand: ["latest_invoice.payment_intent"],
      });

      console.log("✅ Hybrid subscription created:", subscription.id);

      return res.status(200).json({
        msg: "Hybrid subscription started.",
        subscriptionId: subscription.id,
        customerId,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret || null,
        stripeAccountId: provider.stripeAccountId,
      });
    }

    return res.status(400).json({ msg: "Unsupported billing tier." });
  } catch (err) {
    console.error("❌ Subscribe error:", err.message, err?.raw || err);
    return res.status(500).json({ msg: "Subscription error", error: err.message });
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

// router.post("/create-payment-sheet", auth, async (req, res) => {
//   try {
//     const user = req.user;
//     const { email, name, phoneNumber } = req.body;

//     if (!user.stripeCustomerId) {
//       // Create a new Stripe customer if one doesn't exist
//       const customer = await stripeClient.customers.create({
//         email,
//         name,
//         phone: phoneNumber,
//         metadata: { userId: user._id.toString() },
//       });
//       user.stripeCustomerId = customer.id;
//       await user.save();
//     }

//     // Create an ephemeral key for the customer
//     const ephemeralKey = await stripeClient.ephemeralKeys.create(
//       { customer: user.stripeCustomerId },
//       { apiVersion: "2023-10-16" }
//     );

//     // Create a test payment intent for setup (value is symbolic)
//     const paymentIntent = await stripeClient.paymentIntents.create({
//       amount: 5000, // $50 test value, not charged immediately
//       currency: "usd",
//       customer: user.stripeCustomerId,
//       automatic_payment_methods: { enabled: true },
//       metadata: { userId: user._id.toString() },
//     });

//     res.json({
//       paymentIntent: paymentIntent.id,
//       clientSecret: paymentIntent.client_secret,
//       ephemeralKey: ephemeralKey.secret,
//       customer: user.stripeCustomerId,
//     });
//   } catch (err) {
//     console.error("❌ Error creating PaymentSheet:", err.message);
//     res.status(500).json({ msg: "Failed to initialize PaymentSheet." });
//   }
// });

//lstet
// router.post("/create-payment-sheet", auth, async (req, res) => {
//   try {
//     const user = req.user;
//     const { email, name, phoneNumber } = req.body;

//     console.log("📥 Creating payment sheet for:", email);

//     if (!user.stripeCustomerId) {
//       const customer = await stripe.customers.create({
//         email,
//         name,
//         phone: phoneNumber,
//         metadata: { userId: user._id.toString() },
//       });
//       user.stripeCustomerId = customer.id;
//       await user.save();
//       console.log("✅ Stripe customer created:", customer.id);
//     } else {
//       console.log("🔁 Using existing Stripe customer:", user.stripeCustomerId);
//     }

//     const ephemeralKey = await stripe.ephemeralKeys.create(
//       { customer: user.stripeCustomerId },
//       { apiVersion: "2023-10-16" }
//     );

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: 5000, // test value
//       currency: "usd",
//       customer: user.stripeCustomerId,
//       automatic_payment_methods: { enabled: true },
//       metadata: { userId: user._id.toString() },
//     });

//     console.log("🧾 PaymentIntent created:", paymentIntent.id);

//     res.json({
//       paymentIntent: paymentIntent.id,
//       clientSecret: paymentIntent.client_secret,
//       ephemeralKey: ephemeralKey.secret,
//       customer: user.stripeCustomerId,
//     });
//   } catch (err) {
//     console.error("❌ Error creating PaymentSheet:", err.message);
//     res.status(500).json({ msg: "Failed to initialize PaymentSheet." });
//   }
// });

router.post("/create-payment-sheet", auth, async (req, res) => {
  try {
    const user = req.user;
    const { email, name, phoneNumber } = req.body;

    console.log("📥 Creating payment sheet for:", email);

    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        name,
        phone: phoneNumber,
        metadata: { userId: user._id.toString() },
      });
      user.stripeCustomerId = customer.id;
      await user.save();
      console.log("✅ Stripe customer created:", customer.id);
    } else {
      console.log("🔁 Using existing Stripe customer:", user.stripeCustomerId);
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: user.stripeCustomerId },
      { apiVersion: "2023-10-16" }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 5000, // $50 test amount — not billed unless you confirm
      currency: "usd",
      customer: user.stripeCustomerId,
      automatic_payment_methods: { enabled: true },
      metadata: { userId: user._id.toString() },
    });

    console.log("🧾 PaymentIntent created:", paymentIntent.id);

    res.json({
      paymentIntent: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: user.stripeCustomerId,
    });
  } catch (err) {
    console.error("❌ Error creating PaymentSheet:", err.message);
    res.status(500).json({ msg: "Failed to initialize PaymentSheet." });
  }
});


export default router;
