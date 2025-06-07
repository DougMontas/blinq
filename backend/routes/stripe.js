//stripe hybrid onboarding route
import express from "express";
import Stripe from "stripe";
import Users from "../models/Users.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});
const baseUrl = process.env.FRONTEND_BASE_URL || "https://1234abcd.ngrok.io";



//working
// router.get("/onboard", auth, async (req, res) => {
//   try {
//     const account = await stripe.accounts.create({
//       type: "express",
//       country: "US",
//       email: req.user.email,
//       capabilities: {
//         card_payments: { requested: true },
//         transfers: { requested: true },
//       },
//     });

//     req.user.stripeAccountId = account.id;
//     await req.user.save();

//     const link = await stripe.accountLinks.create({
//       account: account.id,
//       refresh_url: `${baseUrl}/onboard-refresh`,
//       return_url: `${baseUrl}onboard-complete`,
//       type: "account_onboarding",
//     });

//     res.json({ url: link.url });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Failed to onboard provider." });
//   }
// });

//testing
router.get("/onboard", auth, async (req, res) => {
  try {
    const { tier } = req.body;
    if (!tier) return res.status(400).json({ msg: 'tier is required' });

    let { stripeAccountId } = req.user;
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: req.user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
      });
      stripeAccountId = account.id;
      req.user.stripeAccountId = stripeAccountId;
    }

    req.user.tier = tier;
    await req.user.save();

    const link = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/onboard-refresh`,
      return_url: `${baseUrl}/onboard-complete`,
      type: 'account_onboarding',
    });

    res.json({ url: link.url });
  } catch (err) {
    console.error('Onboard error', err);
    res.status(500).json({ msg: 'Failed to onboard provider.' });
  }
});

export default router;
