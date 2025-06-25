//stripe hybrid onboarding route
import express from "express";
import Stripe from "stripe";
import Users from "../models/Users.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});
const baseUrl = process.env.FRONTEND_BASE_URL || "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/onboarding-success"

router.get("/onboard", auth, async (req, res) => {
  try {
    if (req.user.role !== "serviceProvider") {
      return res
        .status(403)
        .json({ msg: "Only service providers can onboard." });
    }

    const [firstName, ...lastParts] = req.user.name.trim().split(" ");
    const lastName = lastParts.length ? lastParts.join(" ") : "Provider";

    const dobDate = new Date(req.user.dob);
    if (isNaN(dobDate.getTime())) {
      return res.status(400).json({ msg: "Invalid date of birth format." });
    }

    // If account already exists, update it to ensure all fields are set
    if (req.user.stripeAccountId) {
      await stripe.accounts.update(req.user.stripeAccountId, {
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

      const link = await stripe.accountLinks.create({
        account: req.user.stripeAccountId,
        refresh_url: `${baseUrl}/onboard-refresh`,
        return_url: `${baseUrl}/onboard-complete`,
        type: "account_onboarding",
      });

      return res.json({ url: link.url });
    }

    // Create Stripe account from scratch
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

    const link = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${baseUrl}/onboard-refresh`,
      return_url: `${baseUrl}/onboard-complete`,
      type: "account_onboarding",
    });

    res.json({ url: link.url });
  } catch (err) {
    console.error("Onboard error:", err);
    res.status(500).json({ msg: "Failed to onboard provider." });
  }
});

export default router;
