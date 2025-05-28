// backend/routes/payments.js
import express from "express";
import Stripe from "stripe";
import xrpl from "xrpl";
import { auth } from "../middlewares/auth.js";
const router = express.Router();

// instantiate Stripe with your secret key
// (make sure STRIPE_SECRET_KEY is set in your .env)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15", // or whatever version you're on
  timeout: 120000,
});

router.post("/stripe", async (req, res) => {
  const { amount, currency = "usd" } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents
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

router.post("/payment-sheet", auth, async (req, res) => {
  try {
    const { amount, currency = "usd" } = req.body;

    // 1) Create a new Stripe Customer
    const customer = await stripe.customers.create();

    // 2) Create an ephemeral key so the client can fetch the customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2022-11-15" }
    );

    // 3) Create a PaymentIntent with automatic PMs
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
    });

    // 4) Send the client everything it needs
    res.json({
      paymentIntentClientSecret: paymentIntent.client_secret,
      customer: customer.id,
      ephemeralKey: ephemeralKey.secret,
      publishableKey: process.env.STRIPE_PUBLIC_KEY,
    });
  } catch (err) {
    console.error("POST /api/payments/payment-sheet error:", err);
    res.status(500).json({ msg: err.message });
  }
});

// @route   POST /api/payments/xrpl
// @desc    Process XRP payment (stub)
router.post("/xrpl", async (req, res) => {
  const { amount, destination } = req.body;
  try {
    // TODO: implement real xrpl.Client logic here
    res.json({ success: true, msg: "XRP payment processed (stub)" });
  } catch (err) {
    console.error("XRPL error:", err);
    res.status(500).json({ msg: "XRP payment failed" });
  }
});

export default router;
