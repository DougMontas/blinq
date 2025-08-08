import express from "express";
import Stripe from "stripe";
import Users from "../models/Users.js";
import { auth } from "../middlewares/auth.js";
import { issueRefund, chargeTravelFee } from "../utils/refunds.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});
const baseUrl =
  process.env.FRONTEND_BASE_URL ||
  "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app";

const refreshUrl = process.env.STRIPE_ONBOARDING_REFRESH_URL?.startsWith("http")
  ? process.env.STRIPE_ONBOARDING_REFRESH_URL
  : "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/onboarding-success";

const returnUrl = process.env.STRIPE_ONBOARDING_RETURN_URL?.startsWith("http")
  ? process.env.STRIPE_ONBOARDING_RETURN_URL
  : "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/onboarding-success";

router.post("/update-billing", auth, async (req, res) => {
  try {
    const { billingTier } = req.body;
    const userId = req.user?.id; // ✅ req.user now reliably set by middleware

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
        allow_promotion_codes: true,
        success_url: `${process.env.BASE_URL}/onboarding-success`,
        cancel_url: `${process.env.BASE_URL}/onboarding-cancelled`,
      });

      // await user.save();
      await user.save({ validateBeforeSave: false }); // ✅ Skip doc validation

      return res.status(200).json({ url: session.url });
    } else if (billingTier === "profit_sharing") {
      // For downgrade, also generate new onboarding link if connected account exists
      if (user.stripeAccountId) {
        const accountLink = await stripe.accountLinks.create({
          account: user.stripeAccountId,
          refresh_url: `${process.env.BASE_URL}/onboarding-cancelled`,
          return_url: `${process.env.BASE_URL}/onboarding-success`,
          type: "account_onboarding",
        });

        // await user.save();
        await user.save({ validateBeforeSave: false }); // ✅ Skip doc validation

        return res.status(200).json({ url: accountLink.url });
      } else {
        // await user.save();
        await user.save({ validateBeforeSave: false }); // ✅ Skip doc validation

        return res.status(200).json({ msg: "Switched to profit_sharing." });
      }
    }

    // await user.save();
    await user.save({ validateBeforeSave: false }); // ✅ Skip doc validation

    return res.status(200).json({ msg: `Switched to ${billingTier}` });
  } catch (err) {
    console.error("Billing update error:", err);
    return res
      .status(500)
      .json({ msg: "Billing update failed", error: err.message });
  }
});

router.post("/onboard-stripe", auth, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    console.log("🔐 Incoming onboard-stripe request for:", user?.email);

    if (!user || user.role !== "serviceProvider") {
      console.warn("⛔ Unauthorized or missing user.");
      return res
        .status(403)
        .json({ msg: "Only service providers can onboard." });
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
    res
      .status(500)
      .json({ msg: "Stripe onboarding failed.", error: err.message });
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
    res
      .status(500)
      .json({ msg: "Failed to check onboarding status", error: err.message });
  }
});

export default router;
