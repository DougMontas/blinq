// //stripe hybrid onboarding route
// import express from "express";
// import Stripe from "stripe";
// import Users from "../models/Users.js";
// import { auth } from "../middlewares/auth.js";
// import { issueRefund, chargeTravelFee } from "../utils/refunds.js";

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: "2022-11-15",
// });
// const baseUrl = process.env.FRONTEND_BASE_URL || "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app"

// const refreshUrl = process.env.STRIPE_ONBOARDING_REFRESH_URL?.startsWith("http")
// ? process.env.STRIPE_ONBOARDING_REFRESH_URL
// : "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/onboarding-success";

// const returnUrl = process.env.STRIPE_ONBOARDING_RETURN_URL?.startsWith("http")
// ? process.env.STRIPE_ONBOARDING_RETURN_URL
// : "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/onboarding-success";

// // router.get("/onboard", auth, async (req, res) => {
// //   try {
// //     if (req.user.role !== "serviceProvider") {
// //       return res
// //         .status(403)
// //         .json({ msg: "Only service providers can onboard." });
// //     }

// //     const [firstName, ...lastParts] = req.user.name.trim().split(" ");
// //     const lastName = lastParts.length ? lastParts.join(" ") : "Provider";

// //     const dobDate = new Date(req.user.dob);
// //     if (isNaN(dobDate.getTime())) {
// //       return res.status(400).json({ msg: "Invalid date of birth format." });
// //     }

// //     // If account already exists, update it to ensure all fields are set
// //     if (req.user.stripeAccountId) {
// //       await stripe.accounts.update(req.user.stripeAccountId, {
// //         individual: {
// //           first_name: firstName,
// //           last_name: lastName,
// //           ssn_last_4: req.user.ssnLast4,
// //           dob: {
// //             day: dobDate.getUTCDate(),
// //             month: dobDate.getUTCMonth() + 1,
// //             year: dobDate.getUTCFullYear(),
// //           },
// //           phone: req.user.phoneNumber,
// //           email: req.user.email,
// //         },
// //       });

// //       const link = await stripe.accountLinks.create({
// //         account: req.user.stripeAccountId,
// //         refresh_url: process.env.STRIPE_ONBOARDING_REFRESH_URL || 'https://blinqfix.com/onboarding-refresh',
// //         return_url: process.env.STRIPE_ONBOARDING_RETURN_URL || 'https://blinqfix.com/onboarding-complete',
// //         // refresh_url: `${baseUrl}/onboard-refresh`,
// //         // return_url: `${baseUrl}/onboard-complete`,
// //         type: "account_onboarding",
// //       });

// //       return res.json({ url: link.url });
// //     }

// //     // Create Stripe account from scratch
// //     const account = await stripe.accounts.create({
// //       type: "express",
// //       country: "US",
// //       business_type: "individual",
// //       email: req.user.email,
// //       individual: {
// //         first_name: firstName,
// //         last_name: lastName,
// //         ssn_last_4: req.user.ssnLast4,
// //         dob: {
// //           day: dobDate.getUTCDate(),
// //           month: dobDate.getUTCMonth() + 1,
// //           year: dobDate.getUTCFullYear(),
// //         },
// //         phone: req.user.phoneNumber,
// //         email: req.user.email,
// //       },
// //       capabilities: {
// //         card_payments: { requested: true },
// //         transfers: { requested: true },
// //       },
// //     });

// //     req.user.stripeAccountId = account.id;
// //     await req.user.save();

// //     const link = await stripe.accountLinks.create({
// //       account: account.id,
// //       refresh_url: process.env.STRIPE_ONBOARDING_REFRESH_URL || 'https://blinqfix.com/onboarding-refresh',
// //         return_url: process.env.STRIPE_ONBOARDING_RETURN_URL || 'https://blinqfix.com/onboarding-complete',
// //       type: "account_onboarding",
// //     });

// //     res.json({ url: link.url });
// //   } catch (err) {
// //     console.error("Onboard error:", err);
// //     res.status(500).json({ msg: "Failed to onboard provider." });
// //   }
// // });


// // router.post("/update-billing", auth, async (req, res) => {
// //   try {
// //     const { billingTier } = req.body;

// //     if (!["profit_sharing", "hybrid"].includes(billingTier)) {
// //       return res.status(400).json({ msg: "Invalid billing tier." });
// //     }

// //     const user = await Users.findById(req.user.id);
// //     if (!user) return res.status(404).json({ msg: "User not found." });

// //     user.billingTier = billingTier;
// //     await user.save();

// //     // Optional: Generate Stripe URL to confirm subscription update
// //     // const url = await generateStripePortalLink(user.stripeCustomerId); // optional

// //     return res.status(200).json({ msg: "Billing updated", billingTier });
// //   } catch (err) {
// //     console.error("Error updating billing tier:", err);
// //     res.status(500).json({ msg: "Internal server error" });
// //   }
// // });


// router.get("/onboard", auth, async (req, res) => {
//   try {
//     if (req.user.role !== "serviceProvider") {
//       return res.status(403).json({ msg: "Only service providers can onboard." });
//     }

//     const [firstName, ...lastParts] = req.user.name.trim().split(" ");
//     const lastName = lastParts.length ? lastParts.join(" ") : "Provider";
//     const dobDate = new Date(req.user.dob);

//     if (isNaN(dobDate.getTime())) {
//       return res.status(400).json({ msg: "Invalid date of birth format." });
//     }


//     console.log("🚀 Stripe Onboarding Payload", {
//   account: stripeAccountId,
//   return_url: returnUrl,
//   refresh_url: refreshUrl,
// });

//     // Create or update Stripe Connect account
//     let stripeAccountId = req.user.stripeAccountId;

//     if (!stripeAccountId) {
//       const account = await stripe.accounts.create({
//         type: "express",
//         country: "US",
//         business_type: "individual",
//         email: req.user.email,
//         individual: {
//           first_name: firstName,
//           last_name: lastName,
//           ssn_last_4: req.user.ssnLast4,
//           dob: {
//             day: dobDate.getUTCDate(),
//             month: dobDate.getUTCMonth() + 1,
//             year: dobDate.getUTCFullYear(),
//           },
//           phone: req.user.phoneNumber,
//           email: req.user.email,
//         },
//         capabilities: {
//           card_payments: { requested: true },
//           transfers: { requested: true },
//         },
//       });

//       req.user.stripeAccountId = account.id;
//       await req.user.save();
//       stripeAccountId = account.id;
//     } else {
//       await stripe.accounts.update(stripeAccountId, {
//         individual: {
//           first_name: firstName,
//           last_name: lastName,
//           ssn_last_4: req.user.ssnLast4,
//           dob: {
//             day: dobDate.getUTCDate(),
//             month: dobDate.getUTCMonth() + 1,
//             year: dobDate.getUTCFullYear(),
//           },
//           phone: req.user.phoneNumber,
//           email: req.user.email,
//         },
//       });
//     }

 
  

//     console.log("🚀 Stripe Onboarding Payload", {
//       account: stripeAccountId,
//       return_url: process.env.STRIPE_ONBOARDING_RETURN_URL,
//       refresh_url: process.env.STRIPE_ONBOARDING_REFRESH_URL,
//     });

//     const link = await stripe.accountLinks.create({
//       account: stripeAccountId,
//       refresh_url: refreshUrl,
//       return_url: returnUrl,
//       type: "account_onboarding",
//     });

//     res.json({ url: link.url });
//   } catch (err) {
//     console.error("Onboard error:", err.message, err?.raw || err);
//     res.status(500).json({ msg: "Failed to onboard provider." });
//   }
// });


// router.post("/update-billing", auth, async (req, res) => {
//   try {
//     const { billingTier } = req.body;

//     if (!["profit_sharing", "hybrid"].includes(billingTier)) {
//       return res.status(400).json({ msg: "Invalid billing tier." });
//     }

//     const user = await Users.findById(req.user.id);
//     if (!user) return res.status(404).json({ msg: "User not found." });

//     // Cancel subscription if downgrading
//     if (billingTier === "profit_sharing" && user.stripeCustomerId) {
//       const subs = await stripe.subscriptions.list({
//         customer: user.stripeCustomerId,
//         status: "active",
//         limit: 1,
//       });

//       if (subs.data.length) {
//         await stripe.subscriptions.del(subs.data[0].id);
//         console.log(`📉 Cancelled hybrid subscription for user ${user._id}`);
//       }
//     }

//     user.billingTier = billingTier;
//     await user.save();

//     return res.status(200).json({ msg: "Billing updated", billingTier });
//   } catch (err) {
//     console.error("Error updating billing tier:", err);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// });




// export default router;


import express from "express";
import Stripe from "stripe";
import Users from "../models/Users.js";
import { auth } from "../middlewares/auth.js";
import { issueRefund, chargeTravelFee } from "../utils/refunds.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});
const baseUrl = process.env.FRONTEND_BASE_URL || "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app"

const refreshUrl = process.env.STRIPE_ONBOARDING_REFRESH_URL?.startsWith("http")
  ? process.env.STRIPE_ONBOARDING_REFRESH_URL
  : "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/onboarding-success";

const returnUrl = process.env.STRIPE_ONBOARDING_RETURN_URL?.startsWith("http")
  ? process.env.STRIPE_ONBOARDING_RETURN_URL
  : "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/onboarding-success";

// router.get("/onboard", auth, async (req, res) => {
//   try {
//     if (req.user.role !== "serviceProvider") {
//       return res.status(403).json({ msg: "Only service providers can onboard." });
//     }

//     const [firstName, ...lastParts] = req.user.name.trim().split(" ");
//     const lastName = lastParts.length ? lastParts.join(" ") : "Provider";
//     const dobDate = new Date(req.user.dob);

//     if (isNaN(dobDate.getTime())) {
//       return res.status(400).json({ msg: "Invalid date of birth format." });
//     }

//     let stripeAccountId = req.user.stripeAccountId;

//     if (!stripeAccountId) {
//       const account = await stripe.accounts.create({
//         type: "express",
//         country: "US",
//         business_type: "individual",
//         email: req.user.email,
//         individual: {
//           first_name: firstName,
//           last_name: lastName,
//           ssn_last_4: req.user.ssnLast4,
//           dob: {
//             day: dobDate.getUTCDate(),
//             month: dobDate.getUTCMonth() + 1,
//             year: dobDate.getUTCFullYear(),
//           },
//           phone: req.user.phoneNumber,
//           email: req.user.email,
//         },
//         capabilities: {
//           card_payments: { requested: true },
//           transfers: { requested: true },
//         },
//       });

//       req.user.stripeAccountId = account.id;
//       await req.user.save();
//       stripeAccountId = account.id;
//     } else {
//       await stripe.accounts.update(stripeAccountId, {
//         individual: {
//           first_name: firstName,
//           last_name: lastName,
//           ssn_last_4: req.user.ssnLast4,
//           dob: {
//             day: dobDate.getUTCDate(),
//             month: dobDate.getUTCMonth() + 1,
//             year: dobDate.getUTCFullYear(),
//           },
//           phone: req.user.phoneNumber,
//           email: req.user.email,
//         },
//       });
//     }

//     const link = await stripe.accountLinks.create({
//       account: stripeAccountId,
//       refresh_url: refreshUrl,
//       return_url: returnUrl,
//       type: "account_onboarding",
//     });

//     // Hybrid tier: create Stripe customer and subscription
//     if (req.user.billingTier === "hybrid") {
//       let stripeCustomerId = req.user.stripeCustomerId;

//       if (!stripeCustomerId) {
//         const customer = await stripe.customers.create({
//           email: req.user.email,
//           name: req.user.name,
//           metadata: { userId: req.user._id.toString() },
//         });
//         stripeCustomerId = customer.id;
//         req.user.stripeCustomerId = stripeCustomerId;
//         await req.user.save();
//       }

//       const prices = await stripe.prices.list({
//         product: req.user.stripeProductId,
//         active: true,
//         limit: 1,
//       });

//       if (!prices.data.length) {
//         return res.status(400).json({ msg: "No price found for selected tier." });
//       }

//       const subscription = await stripe.subscriptions.create({
//         customer: stripeCustomerId,
//         items: [{ price: prices.data[0].id }],
//         payment_behavior: "default_incomplete",
//         expand: ["latest_invoice.payment_intent"],
//       });

//       req.user.stripeSubscriptionId = subscription.id;
//       await req.user.save();
//     }

//     res.json({ url: link.url });
//   } catch (err) {
//     console.error("Onboard error:", err.message, err?.raw || err);
//     res.status(500).json({ msg: "Failed to onboard provider." });
//   }
// });

// router.post("/update-billing", auth, async (req, res) => {
//   try {
//     const { billingTier } = req.body;

//     if (!["profit_sharing", "hybrid"].includes(billingTier)) {
//       return res.status(400).json({ msg: "Invalid billing tier." });
//     }

//     const user = await Users.findById(req.user.id);
//     if (!user) return res.status(404).json({ msg: "User not found." });

//     // Cancel subscription if downgrading
//     if (billingTier === "profit_sharing" && user.stripeCustomerId) {
//       const subs = await stripe.subscriptions.list({
//         customer: user.stripeCustomerId,
//         status: "active",
//         limit: 1,
//       });

//       if (subs.data.length) {
//         await stripe.subscriptions.del(subs.data[0].id);
//         console.log(`📉 Cancelled hybrid subscription for user ${user._id}`);
//       }
//     }

//     user.billingTier = billingTier;
//     await user.save();

//     return res.status(200).json({ msg: "Billing updated", billingTier });
//   } catch (err) {
//     console.error("Error updating billing tier:", err);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// });

// routes/stripe.js

//latest
// router.post("/update-billing", auth, async (req, res) => {
//   try {
//     const { billingTier } = req.body;

//     if (!["profit_sharing", "hybrid"].includes(billingTier)) {
//       return res.status(400).json({ msg: "Invalid billing tier." });
//     }

//     const user = await Users.findById(req.user.id);
//     if (!user) return res.status(404).json({ msg: "User not found." });

//     // ⛔ Downgrade: cancel active hybrid subscription if it exists
//     if (billingTier === "profit_sharing" && user.stripeCustomerId) {
//       const subs = await stripe.subscriptions.list({
//         customer: user.stripeCustomerId,
//         status: "active",
//         limit: 1,
//       });

//       if (subs.data.length) {
//         await stripe.subscriptions.del(subs.data[0].id);
//         console.log(`📉 Cancelled hybrid subscription for user ${user._id}`);
//       }

//       user.billingTier = billingTier;
//       await user.save();
//       return res.status(200).json({ msg: "Downgraded to profit sharing", billingTier });
//     }

//     // ✅ Upgrade to hybrid: Create subscription if needed
//     if (billingTier === "hybrid") {
//       if (!user.stripeCustomerId) {
//         const customer = await stripe.customers.create({ email: user.email });
//         user.stripeCustomerId = customer.id;
//         await user.save();
//       }

//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         mode: "subscription",
//         customer: user.stripeCustomerId,
//         line_items: [
//           {
//             price: process.env.STRIPE_HYBRID_SUBSCRIPTION_PRICE_ID, // set in your .env
//             quantity: 1,
//           },
//         ],
//         success_url: `${process.env.BASE_URL}/onboarding-success`,
//         cancel_url: `${process.env.BASE_URL}/onboarding-cancelled`,
//       });

//       user.billingTier = billingTier;
//       await user.save();

//       // ⏩ Return Stripe Checkout URL to frontend
//       return res.status(200).json({ url: session.url });
//     }

//     return res.status(400).json({ msg: "No update performed" });
//   } catch (err) {
//     console.error("❌ Error updating billing tier:", err);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// });

router.get("/ping", (req, res) => {
  console.log("✅ /stripe/ping route is live");
  res.send("Yep")
  res.json({ msg: "Stripe route is alive" });
});

//latest
// router.post("/update-billing", auth, async (req, res) => {
//   console.log("📥 POST /update-billing hit");

//   try {
//     const { billingTier } = req.body;
//     console.log("➡️ Billing tier requested:", billingTier);

//     if (!["profit_sharing", "hybrid"].includes(billingTier)) {
//       console.warn("⚠️ Invalid billing tier received:", billingTier);
//       return res.status(400).json({ msg: "Invalid billing tier." });
//     }

//     const user = await Users.findById(req.user.id);
//     if (!user) {
//       console.error("❌ User not found for ID:", req.user.id);
//       return res.status(404).json({ msg: "User not found." });
//     }

//     console.log("👤 User found:", user.email, "| Current tier:", user.billingTier);

//     // Handle downgrade
//     if (billingTier === "profit_sharing" && user.stripeCustomerId) {
//       console.log("🔻 Initiating downgrade to profit_sharing");

//       const subs = await stripe.subscriptions.list({
//         customer: user.stripeCustomerId,
//         status: "active",
//         limit: 1,
//       });

//       console.log("📄 Active subscriptions found:", subs.data.length);

//       if (subs.data.length) {
//         await stripe.subscriptions.del(subs.data[0].id);
//         console.log("✅ Subscription cancelled:", subs.data[0].id);
//       }

//       user.billingTier = billingTier;
//       await user.save({ validateBeforeSave: false });
//       // await user.save();
//       console.log("💾 User updated to profit_sharing:", user._id);

//       return res.status(200).json({ msg: "Downgraded to profit sharing", billingTier });
//     }

//     // Handle upgrade
//     if (billingTier === "hybrid") {
//       console.log("🔺 Initiating upgrade to hybrid");

//       if (!user.stripeCustomerId) {
//         const customer = await stripe.customers.create({ email: user.email });
//         user.stripeCustomerId = customer.id;
//         await user.save();
//         console.log("👤 Created Stripe customer:", customer.id);
//       }

//       const session = await stripe.checkout.sessions.create({
//         mode: "subscription",
//         payment_method_types: ["card"],
//         customer: user.stripeCustomerId,
//         line_items: [
//           {
//             price: process.env.STRIPE_HYBRID_SUBSCRIPTION_PRICE_ID,
//             quantity: 1,
//           },
//         ],
//         success_url: `${process.env.BASE_URL}/onboarding-success`,
//         cancel_url: `${process.env.BASE_URL}/onboarding-cancelled`,
//       });

//       console.log("✅ Created checkout session:", session.id);

//       user.billingTier = billingTier;
//       await user.save();
//       console.log("💾 User billing tier updated to hybrid");

//       return res.status(200).json({ url: session.url });
//     }

//     console.warn("⚠️ No billing logic matched");
//     return res.status(400).json({ msg: "No update performed" });
//   } catch (err) {
//     console.error("❌ Error in /update-billing:", err);
//     return res.status(500).json({ msg: "Internal server error" });
//   }
// });

router.post("/update-billing", async (req, res) => {
  try {
    const { billingTier } = req.body;
    const userId = req.user?.id;

    if (!userId || !["profit_sharing", "hybrid"].includes(billingTier)) {
      return res.status(400).json({ msg: "Invalid billing request." });
    }

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found." });

    // Cancel existing subscription if exists
    if (user.stripeCustomerId) {
      const subs = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active",
        limit: 1,
      });

      if (subs.data.length) {
        await stripe.subscriptions.cancel(subs.data[0].id);
      }
    }

    user.billingTier = billingTier;

    if (billingTier === "hybrid") {
      if (!user.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user._id.toString(), billingTier },
        });
        user.stripeCustomerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer: user.stripeCustomerId,
        line_items: [
          {
            price: process.env.STRIPE_HYBRID_SUBSCRIPTION_PRICE_ID,
            quantity: 1,
          },
        ],
        success_url: `${process.env.BASE_URL}/onboarding-success`,
        cancel_url: `${process.env.BASE_URL}/onboarding-cancelled`,
      });

      await user.save();
      return res.status(200).json({ url: session.url });
    }

    // If downgrading
    await user.save();
    return res.status(200).json({ msg: `Switched to ${billingTier}` });
  } catch (err) {
    console.error("Billing update error:", err);
    return res.status(500).json({ msg: "Billing update failed", error: err.message });
  }
});


// router.post("/onboard-stripe", auth, async (req, res) => {
//   try {
//     const user = req.user;
//     if (user.role !== "serviceProvider") {
//       return res.status(403).json({ msg: "Only service providers can onboard." });
//     }

//     const [firstName, ...lastParts] = user.name.trim().split(" ");
//     const lastName = lastParts.length ? lastParts.join(" ") : "Provider";
//     const dobDate = new Date(user.dob);

//     if (isNaN(dobDate.getTime())) {
//       return res.status(400).json({ msg: "Invalid date of birth format." });
//     }

//     let stripeAccountId = user.stripeAccountId;

//     if (!stripeAccountId) {
//       const account = await stripe.accounts.create({
//         type: "express",
//         country: "US",
//         business_type: "individual",
//         email: user.email,
//         individual: {
//           first_name: firstName,
//           last_name: lastName,
//           ssn_last_4: user.ssnLast4,
//           dob: {
//             day: dobDate.getUTCDate(),
//             month: dobDate.getUTCMonth() + 1,
//             year: dobDate.getUTCFullYear(),
//           },
//           phone: user.phoneNumber,
//           email: user.email,
//         },
//         capabilities: {
//           card_payments: { requested: true },
//           transfers: { requested: true },
//         },
//       });

//       user.stripeAccountId = account.id;
//       await user.save();
//       stripeAccountId = account.id;
//     } else {
//       await stripe.accounts.update(stripeAccountId, {
//         individual: {
//           first_name: firstName,
//           last_name: lastName,
//           ssn_last_4: user.ssnLast4,
//           dob: {
//             day: dobDate.getUTCDate(),
//             month: dobDate.getUTCMonth() + 1,
//             year: dobDate.getUTCFullYear(),
//           },
//           phone: user.phoneNumber,
//           email: user.email,
//         },
//       });
//     }

//     const accountLink = await stripe.accountLinks.create({
//       account: stripeAccountId,
//       refresh_url: refreshUrl,
//       return_url: returnUrl,
//       type: "account_onboarding",
//     });

//     return res.json({ stripeOnboardingUrl: accountLink.url });
//   } catch (err) {
//     console.error("❌ Onboard Stripe error:", err);
//     res.status(500).json({ msg: "Stripe onboarding failed." });
//   }
// });

// router.post("/onboard-stripe", auth, async (req, res) => {
//   try {
//     const user = await Users.findById(req.user.id);
//     console.log("🔐 Incoming onboard-stripe request for:", user.email);

//     if (!user || user.role !== "serviceProvider") {
//       console.warn("⛔ Unauthorized or missing user.");
//       return res.status(403).json({ msg: "Only service providers can onboard." });
//     }

//     if (!user.name || !user.dob || !user.ssnLast4 || !user.phoneNumber || !user.email) {
//       console.warn("❗ Missing required user fields:", {
//         name: user.name,
//         dob: user.dob,
//         ssnLast4: user.ssnLast4,
//         phoneNumber: user.phoneNumber,
//         email: user.email,
//       });
//       return res.status(400).json({ msg: "Missing required fields for onboarding." });
//     }

//     const [firstName, ...lastParts] = user.name.trim().split(" ");
//     const lastName = lastParts.length ? lastParts.join(" ") : "Provider";
//     const dobDate = new Date(user.dob);

//     if (isNaN(dobDate.getTime())) {
//       console.warn("⚠️ Invalid DOB format:", user.dob);
//       return res.status(400).json({ msg: "Invalid date of birth format." });
//     }

//     let stripeAccountId = user.stripeAccountId;

//     if (!stripeAccountId) {
//       console.log("📦 Creating Stripe Express account for:", user.email);
//       const account = await stripe.accounts.create({
//         type: "express",
//         country: "US",
//         business_type: "individual",
//         email: user.email,
//         individual: {
//           first_name: firstName,
//           last_name: lastName,
//           ssn_last_4: user.ssnLast4,
//           dob: {
//             day: dobDate.getUTCDate(),
//             month: dobDate.getUTCMonth() + 1,
//             year: dobDate.getUTCFullYear(),
//           },
//           phone: user.phoneNumber,
//           email: user.email,
//         },
//         capabilities: {
//           card_payments: { requested: true },
//           transfers: { requested: true },
//         },
//       });

//       user.stripeAccountId = account.id;
//       await user.save();
//       stripeAccountId = account.id;
//       console.log("✅ Stripe account created:", stripeAccountId);
//     } else {
//       console.log("♻️ Updating existing Stripe account:", stripeAccountId);
//       await stripe.accounts.update(stripeAccountId, {
//         individual: {
//           first_name: firstName,
//           last_name: lastName,
//           ssn_last_4: user.ssnLast4,
//           dob: {
//             day: dobDate.getUTCDate(),
//             month: dobDate.getUTCMonth() + 1,
//             year: dobDate.getUTCFullYear(),
//           },
//           phone: user.phoneNumber,
//           email: user.email,
//         },
//       });
//     }

//     console.log("🔗 Creating account link for onboarding...");
//     const accountLink = await stripe.accountLinks.create({
//       account: stripeAccountId,
//       refresh_url: refreshUrl,
//       return_url: returnUrl,
//       type: "account_onboarding",
//     });

//     console.log("🔗 Onboarding link generated:", accountLink.url);

//     const stripeDashboardUrl = `https://dashboard.stripe.com/express/${stripeAccountId}`;

//     return res.json({
//       stripeOnboardingUrl: accountLink.url,
//       stripeDashboardUrl,
//     });
//   } catch (err) {
//     console.error("❌ Stripe onboarding failed:", err.message);
//     console.error(err);
//     res.status(500).json({ msg: "Stripe onboarding failed.", error: err.message });
//   }
// });

// router.post("/onboard-stripe", auth, async (req, res) => {
//   try {
//     const user = await Users.findById(req.user.id);
//     console.log("🔐 Incoming onboard-stripe request for:", user?.email);

//     if (!user || user.role !== "serviceProvider") {
//       console.warn("⛔ Unauthorized or missing user.");
//       return res.status(403).json({ msg: "Only service providers can onboard." });
//     }

//     // if (!user.name || !user.dob || !user.ssnLast4 || !user.phoneNumber || !user.email) {
//     //   console.warn("❗ Missing required user fields:", {
//     //     name: user.name,
//     //     dob: user.dob,
//     //     ssnLast4: user.ssnLast4,
//     //     phoneNumber: user.phoneNumber,
//     //     email: user.email,
//     //   });
//     //   return res.status(400).json({ msg: "Missing required fields for onboarding." });
//     // }

//     const [firstName, ...lastParts] = user.name.trim().split(" ");
//     const lastName = lastParts.length ? lastParts.join(" ") : "Provider";
//     const dobDate = new Date(user.dob);

//     if (isNaN(dobDate.getTime())) {
//       console.warn("⚠️ Invalid DOB format:", user.dob);
//       return res.status(400).json({ msg: "Invalid date of birth format." });
//     }

//     let stripeAccountId = user.stripeAccountId;

//     if (!stripeAccountId) {
//       console.log("📦 Creating Stripe Express account for:", user.email);
//       const account = await stripe.accounts.create({
//         type: "express",
//         country: "US",
//         business_type: "individual",
//         email: user.email,
//         individual: {
//           first_name: firstName,
//           last_name: lastName,
//           ssn_last_4: user.ssnLast4,
//           dob: {
//             day: dobDate.getUTCDate(),
//             month: dobDate.getUTCMonth() + 1,
//             year: dobDate.getUTCFullYear(),
//           },
//           phone: user.phoneNumber,
//           email: user.email,
//         },
//         capabilities: {
//           card_payments: { requested: true },
//           transfers: { requested: true },
//         },
//       });

//       await Users.updateOne({ _id: user._id }, { stripeAccountId: account.id });
//       stripeAccountId = account.id;
//       console.log("✅ Stripe account created:", stripeAccountId);
//     } else {
//       console.log("♻️ Updating existing Stripe account:", stripeAccountId);
//       await stripe.accounts.update(stripeAccountId, {
//         individual: {
//           first_name: firstName,
//           last_name: lastName,
//           ssn_last_4: user.ssnLast4,
//           dob: {
//             day: dobDate.getUTCDate(),
//             month: dobDate.getUTCMonth() + 1,
//             year: dobDate.getUTCFullYear(),
//           },
//           phone: user.phoneNumber,
//           email: user.email,
//         },
//       });
//     }

//     console.log("🔗 Creating account link for onboarding...");
//     const accountLink = await stripe.accountLinks.create({
//       account: stripeAccountId,
//       refresh_url: refreshUrl,
//       return_url: returnUrl,
//       type: "account_onboarding",
//     });

//     console.log("🔗 Onboarding link generated:", accountLink.url);

//     const stripeDashboardUrl = `https://dashboard.stripe.com/express/${stripeAccountId}`;

//     return res.json({
//       stripeOnboardingUrl: accountLink.url,
//       stripeDashboardUrl,
//     });
//   } catch (err) {
//     console.error("❌ Stripe onboarding failed:", err.message);
//     console.error(err);
//     res.status(500).json({ msg: "Stripe onboarding failed.", error: err.message });
//   }
// });

// router.post("/onboard-stripe", auth, async (req, res) => {
//   let user;
//   try {
//     user = await Users.findById(req.user.id);
//     console.log("🔐 Incoming onboard-stripe request for:", user?.email);

//     if (!user || user.role !== "serviceProvider") {
//       console.warn("⛔ Unauthorized or missing user.");
//       return res.status(403).json({ msg: "Only service providers can onboard." });
//     }

//     if (!user.name || !user.dob || !user.ssnLast4 || !user.phoneNumber || !user.email) {
//       console.warn("❗ Missing required user fields:", {
//         name: user.name,
//         dob: user.dob,
//         ssnLast4: user.ssnLast4,
//         phoneNumber: user.phoneNumber,
//         email: user.email,
//       });
//       return res.status(400).json({ msg: "Missing required fields for onboarding." });
//     }

//     const [firstName, ...lastParts] = user.name.trim().split(" ");
//     const lastName = lastParts.length ? lastParts.join(" ") : "Provider";
//     const dobDate = new Date(user.dob);

//     if (isNaN(dobDate.getTime())) {
//       console.warn("⚠️ Invalid DOB format:", user.dob);
//       return res.status(400).json({ msg: "Invalid date of birth format." });
//     }

//     let stripeAccountId = user.stripeAccountId;

//     if (!stripeAccountId) {
//       console.log("📦 Creating Stripe Express account for:", user.email);
//       const account = await stripe.accounts.create({
//         type: "express",
//         country: "US",
//         business_type: "individual",
//         email: user.email,
//         individual: {
//           first_name: firstName,
//           last_name: lastName,
//           ssn_last_4: user.ssnLast4,
//           dob: {
//             day: dobDate.getUTCDate(),
//             month: dobDate.getUTCMonth() + 1,
//             year: dobDate.getUTCFullYear(),
//           },
//           phone: user.phoneNumber,
//           email: user.email,
//         },
//         capabilities: {
//           card_payments: { requested: true },
//           transfers: { requested: true },
//         },
//       });

//       await Users.updateOne({ _id: user._id }, { stripeAccountId: account.id });
//       stripeAccountId = account.id;
//       console.log("✅ Stripe account created:", stripeAccountId);
//     } else {
//       console.log("♻️ Updating existing Stripe account:", stripeAccountId);
//       await stripe.accounts.update(stripeAccountId, {
//         individual: {
//           first_name: firstName,
//           last_name: lastName,
//           ssn_last_4: user.ssnLast4,
//           dob: {
//             day: dobDate.getUTCDate(),
//             month: dobDate.getUTCMonth() + 1,
//             year: dobDate.getUTCFullYear(),
//           },
//           phone: user.phoneNumber,
//           email: user.email,
//         },
//       });
//     }

//     console.log("🔗 Creating account link for onboarding...");
//     const accountLink = await stripe.accountLinks.create({
//       account: stripeAccountId,
//       refresh_url: refreshUrl,
//       return_url: returnUrl,
//       type: "account_onboarding",
//     });

//     console.log("🔗 Onboarding link generated:", accountLink.url);

//     const stripeDashboardUrl = `https://dashboard.stripe.com/express/${stripeAccountId}`;

//     return res.json({
//       stripeOnboardingUrl: accountLink.url,
//       stripeDashboardUrl,
//     });
//   } catch (err) {
//     console.error("❌ Stripe onboarding failed:", err.message);

//     if (user && !user.stripeAccountId) {
//       console.log("🧹 Cleaning up incomplete user registration:", user.email);
//       try {
//         await Users.deleteOne({ _id: user._id });
//       } catch (delErr) {
//         console.error("⚠️ Failed to clean up incomplete user:", delErr.message);
//       }
//     }

//     res.status(500).json({ msg: "Stripe onboarding failed.", error: err.message });
//   }
// });

// router.post("/onboard-stripe", auth, async (req, res) => {
//   let user;
//   try {
//     user = await Users.findById(req.user.id);
//     console.log("🔐 Incoming onboard-stripe request for:", user?.email);

//     if (!user || user.role !== "serviceProvider") {
//       console.warn("⛔ Unauthorized or missing user.");
//       return res.status(403).json({ msg: "Only service providers can onboard." });
//     }

//     const requiredFields = [user.name, user.dob, user.ssnLast4, user.phoneNumber, user.email];
//     if (requiredFields.some((f) => !f)) {
//       console.warn("❗ Missing required user fields:", {
//         name: user.name,
//         dob: user.dob,
//         ssnLast4: user.ssnLast4,
//         phoneNumber: user.phoneNumber,
//         email: user.email,
//       });
//       return res.status(400).json({ msg: "Missing required fields for onboarding." });
//     }

//     const [firstName, ...lastParts] = user.name.trim().split(" ");
//     const lastName = lastParts.length ? lastParts.join(" ") : "Provider";
//     const dobDate = new Date(user.dob);

//     if (isNaN(dobDate.getTime())) {
//       console.warn("⚠️ Invalid DOB format:", user.dob);
//       return res.status(400).json({ msg: "Invalid date of birth format." });
//     }

//     let stripeAccountId = user.stripeAccountId;

//     if (!stripeAccountId) {
//       console.log("📦 Creating Stripe Express account for:", user.email);
//       const account = await stripe.accounts.create({
//         type: "express",
//         country: "US",
//         business_type: "individual",
//         email: user.email,
//         individual: {
//           first_name: firstName,
//           last_name: lastName,
//           ssn_last_4: user.ssnLast4,
//           dob: {
//             day: dobDate.getUTCDate(),
//             month: dobDate.getUTCMonth() + 1,
//             year: dobDate.getUTCFullYear(),
//           },
//           phone: user.phoneNumber,
//           email: user.email,
//         },
//         capabilities: {
//           card_payments: { requested: true },
//           transfers: { requested: true },
//         },
//       });

//       // Use updateOne to avoid Mongoose schema validation errors
//       await Users.updateOne({ _id: user._id }, { stripeAccountId: account.id });
//       stripeAccountId = account.id;
//       console.log("✅ Stripe account created:", stripeAccountId);
//     } else {
//       console.log("♻️ Updating existing Stripe account:", stripeAccountId);
//       await stripe.accounts.update(stripeAccountId, {
//         individual: {
//           first_name: firstName,
//           last_name: lastName,
//           ssn_last_4: user.ssnLast4,
//           dob: {
//             day: dobDate.getUTCDate(),
//             month: dobDate.getUTCMonth() + 1,
//             year: dobDate.getUTCFullYear(),
//           },
//           phone: user.phoneNumber,
//           email: user.email,
//         },
//       });
//     }

//     console.log("🔗 Creating account link for onboarding...");
//     const accountLink = await stripe.accountLinks.create({
//       account: stripeAccountId,
//       refresh_url: refreshUrl,
//       return_url: returnUrl,
//       type: "account_onboarding",
//     });

//     console.log("🔗 Onboarding link generated:", accountLink.url);

//     const stripeDashboardUrl = `https://dashboard.stripe.com/express/${stripeAccountId}`;

//     return res.json({
//       stripeOnboardingUrl: accountLink.url,
//       stripeDashboardUrl,
//     });
//   } catch (err) {
//     console.error("❌ Stripe onboarding failed:", err.message);

//     if (user && !user.stripeAccountId) {
//       console.log("🧹 Cleaning up incomplete user registration:", user.email);
//       try {
//         await Users.deleteOne({ _id: user._id });
//       } catch (delErr) {
//         console.error("⚠️ Failed to clean up user:", delErr.message);
//       }
//     }

//     res.status(500).json({ msg: "Stripe onboarding failed.", error: err.message });
//   }
// });

router.post("/onboard-stripe", auth, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    console.log("🔐 Incoming onboard-stripe request for:", user?.email);

    if (!user || user.role !== "serviceProvider") {
      console.warn("⛔ Unauthorized or missing user.");
      return res.status(403).json({ msg: "Only service providers can onboard." });
    }

    const [firstName, ...lastParts] = user.name.trim().split(" ");
    const lastName = lastParts.length ? lastParts.join(" ") : "Provider";
    const dobDate = new Date(user.dob);

    if (isNaN(dobDate.getTime())) {
      console.warn("⚠️ Invalid DOB format:", user.dob);
      return res.status(400).json({ msg: "Invalid date of birth format." });
    }

    let stripeAccountId;
    try {
      console.log("📦 Creating Stripe Express account for:", user.email);
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        business_type: "individual",
        email: user.email,
        individual: {
          first_name: firstName,
          last_name: lastName,
          ssn_last_4: user.ssnLast4,
          dob: {
            day: dobDate.getUTCDate(),
            month: dobDate.getUTCMonth() + 1,
            year: dobDate.getUTCFullYear(),
          },
          phone: user.phoneNumber,
          email: user.email,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;
      await Users.updateOne({ _id: user._id }, { stripeAccountId });
      console.log("✅ Stripe account created:", stripeAccountId);
    } catch (stripeErr) {
      console.error("❌ Failed to create Stripe account:", stripeErr.message);
      await Users.deleteOne({ _id: user._id });
      console.log("🧹 User creation rolled back for:", user.email);
      return res.status(500).json({ msg: "Stripe account creation failed." });
    }

    console.log("🔗 Creating account link for onboarding...");
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    console.log("🔗 Onboarding link generated:", accountLink.url);

    const stripeDashboardUrl = `https://dashboard.stripe.com/express/${stripeAccountId}`;

    return res.json({
      stripeOnboardingUrl: accountLink.url,
      stripeDashboardUrl,
    });
  } catch (err) {
    console.error("❌ Stripe onboarding route failed:", err.message);
    res.status(500).json({ msg: "Stripe onboarding failed.", error: err.message });
  }
});

router.post("/check-onboarding", async (req, res) => {
  const { stripeAccountId } = req.body;

  if (!stripeAccountId) {
    return res.status(400).json({ msg: "Missing stripeAccountId" });
  }

  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);

    const missingFields = account.requirements?.currently_due || [];
    const pastDue = account.requirements?.past_due || [];

    if (missingFields.length > 0 || pastDue.length > 0) {
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: process.env.STRIPE_ONBOARDING_REFRESH_URL,
        return_url: process.env.STRIPE_ONBOARDING_RETURN_URL,
        type: "account_onboarding",
      });

      return res.status(200).json({
        needsOnboarding: true,
        stripeOnboardingUrl: accountLink.url,
      });
    }

    return res.status(200).json({ needsOnboarding: false });
  } catch (err) {
    console.error("❌ check-onboarding error:", err);
    res.status(500).json({ msg: "Failed to check onboarding status", error: err.message });
  }
});






export default router;

