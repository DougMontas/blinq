//stripe hybrid onboarding route
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
//       return res
//         .status(403)
//         .json({ msg: "Only service providers can onboard." });
//     }

//     const [firstName, ...lastParts] = req.user.name.trim().split(" ");
//     const lastName = lastParts.length ? lastParts.join(" ") : "Provider";

//     const dobDate = new Date(req.user.dob);
//     if (isNaN(dobDate.getTime())) {
//       return res.status(400).json({ msg: "Invalid date of birth format." });
//     }

//     // If account already exists, update it to ensure all fields are set
//     if (req.user.stripeAccountId) {
//       await stripe.accounts.update(req.user.stripeAccountId, {
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

//       const link = await stripe.accountLinks.create({
//         account: req.user.stripeAccountId,
//         refresh_url: process.env.STRIPE_ONBOARDING_REFRESH_URL || 'https://blinqfix.com/onboarding-refresh',
//         return_url: process.env.STRIPE_ONBOARDING_RETURN_URL || 'https://blinqfix.com/onboarding-complete',
//         // refresh_url: `${baseUrl}/onboard-refresh`,
//         // return_url: `${baseUrl}/onboard-complete`,
//         type: "account_onboarding",
//       });

//       return res.json({ url: link.url });
//     }

//     // Create Stripe account from scratch
//     const account = await stripe.accounts.create({
//       type: "express",
//       country: "US",
//       business_type: "individual",
//       email: req.user.email,
//       individual: {
//         first_name: firstName,
//         last_name: lastName,
//         ssn_last_4: req.user.ssnLast4,
//         dob: {
//           day: dobDate.getUTCDate(),
//           month: dobDate.getUTCMonth() + 1,
//           year: dobDate.getUTCFullYear(),
//         },
//         phone: req.user.phoneNumber,
//         email: req.user.email,
//       },
//       capabilities: {
//         card_payments: { requested: true },
//         transfers: { requested: true },
//       },
//     });

//     req.user.stripeAccountId = account.id;
//     await req.user.save();

//     const link = await stripe.accountLinks.create({
//       account: account.id,
//       refresh_url: process.env.STRIPE_ONBOARDING_REFRESH_URL || 'https://blinqfix.com/onboarding-refresh',
//         return_url: process.env.STRIPE_ONBOARDING_RETURN_URL || 'https://blinqfix.com/onboarding-complete',
//       type: "account_onboarding",
//     });

//     res.json({ url: link.url });
//   } catch (err) {
//     console.error("Onboard error:", err);
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

//     user.billingTier = billingTier;
//     await user.save();

//     // Optional: Generate Stripe URL to confirm subscription update
//     // const url = await generateStripePortalLink(user.stripeCustomerId); // optional

//     return res.status(200).json({ msg: "Billing updated", billingTier });
//   } catch (err) {
//     console.error("Error updating billing tier:", err);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// });


router.get("/onboard", auth, async (req, res) => {
  try {
    if (req.user.role !== "serviceProvider") {
      return res.status(403).json({ msg: "Only service providers can onboard." });
    }

    const [firstName, ...lastParts] = req.user.name.trim().split(" ");
    const lastName = lastParts.length ? lastParts.join(" ") : "Provider";
    const dobDate = new Date(req.user.dob);

    if (isNaN(dobDate.getTime())) {
      return res.status(400).json({ msg: "Invalid date of birth format." });
    }


    console.log("🚀 Stripe Onboarding Payload", {
  account: stripeAccountId,
  return_url: returnUrl,
  refresh_url: refreshUrl,
});

    // Create or update Stripe Connect account
    let stripeAccountId = req.user.stripeAccountId;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        business_type: "individual",
        email: req.user.email,
        individual: {
          first_name: firstName,
          last_name: lastName,
          ssn_last_4: req.user.ssnLast4,
          dob: {
            day: dobDate.getUTCDate(),
            month: dobDate.getUTCMonth() + 1,
            year: dobDate.getUTCFullYear(),
          },
          phone: req.user.phoneNumber,
          email: req.user.email,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      req.user.stripeAccountId = account.id;
      await req.user.save();
      stripeAccountId = account.id;
    } else {
      await stripe.accounts.update(stripeAccountId, {
        individual: {
          first_name: firstName,
          last_name: lastName,
          ssn_last_4: req.user.ssnLast4,
          dob: {
            day: dobDate.getUTCDate(),
            month: dobDate.getUTCMonth() + 1,
            year: dobDate.getUTCFullYear(),
          },
          phone: req.user.phoneNumber,
          email: req.user.email,
        },
      });
    }

 
  

    console.log("🚀 Stripe Onboarding Payload", {
      account: stripeAccountId,
      return_url: process.env.STRIPE_ONBOARDING_RETURN_URL,
      refresh_url: process.env.STRIPE_ONBOARDING_REFRESH_URL,
    });

    const link = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    res.json({ url: link.url });
  } catch (err) {
    console.error("Onboard error:", err.message, err?.raw || err);
    res.status(500).json({ msg: "Failed to onboard provider." });
  }
});


router.post("/update-billing", auth, async (req, res) => {
  try {
    const { billingTier } = req.body;

    if (!["profit_sharing", "hybrid"].includes(billingTier)) {
      return res.status(400).json({ msg: "Invalid billing tier." });
    }

    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found." });

    // Cancel subscription if downgrading
    if (billingTier === "profit_sharing" && user.stripeCustomerId) {
      const subs = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active",
        limit: 1,
      });

      if (subs.data.length) {
        await stripe.subscriptions.del(subs.data[0].id);
        console.log(`📉 Cancelled hybrid subscription for user ${user._id}`);
      }
    }

    user.billingTier = billingTier;
    await user.save();

    return res.status(200).json({ msg: "Billing updated", billingTier });
  } catch (err) {
    console.error("Error updating billing tier:", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});




export default router;
