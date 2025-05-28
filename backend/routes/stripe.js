//stripe hybrid onboarding route
import express from "express";
import Stripe from "stripe";
import Users from "../models/Users.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

router.get("/onboard", auth, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (
      user.role !== "serviceProvider" ||
      !["hybrid", "profit_sharing"].includes(user.billingTier)
    ) {
      return res.status(400).json({ msg: "Invalid billing tier." });
    }

    if (!user.stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
      });
      user.stripeAccountId = account.id;
      await user.save();
    }

    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url:
        process.env.STRIPE_ONBOARDING_REFRESH_URL ||
        "http://localhost:3000/onboarding/refresh",
      return_url:
        process.env.STRIPE_ONBOARDING_RETURN_URL ||
        "http://localhost:3000/provider",
      type: "account_onboarding",
    });
    // console.log('url:>>>backend',accountLink.url)
    return res.json({ url: accountLink.url });
  } catch (err) {
    console.error("Stripe onboarding failed:", err);
    return res
      .status(500)
      .json({ msg: "Onboarding failed", error: err.message });
  }
});

export default router;
