// // payments.js – endpoints for handling payments via Stripe and xrpl
// const express = require('express');
// const router = express.Router();
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'your_stripe_key_here');
// const xrpl = require('xrpl'); // simple integration; in production, set up proper connection and keys

// // @route   POST /api/payments/stripe
// // @desc    Create a Stripe PaymentIntent for USD payments
// router.post('/stripe', async (req, res) => {
//   const { amount, currency = 'usd' } = req.body;
//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount, // amount in cents
//       currency,
//     });
//     res.json(paymentIntent);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: 'Stripe payment failed' });
//   }
// });

// // @route   POST /api/payments/xrpl
// // @desc    Process XRP payment using xrpl (this is a stub—implement proper transaction handling)
// router.post('/xrpl', async (req, res) => {
//   // In production, use xrpl.Client to connect to the network and submit transactions.
//   // This is a placeholder.
//   const { amount, destination } = req.body;
//   try {
//     // pseudo-code: create and submit XRP transaction
//     res.json({ success: true, msg: 'XRP payment processed (stub)' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: 'XRP payment failed' });
//   }
// });

// export default router;

// backend/routes/payments.js
import express from "express";
import Stripe from "stripe";
import xrpl from "xrpl";
import { auth } from "../middlewares/auth.js";
const router = express.Router();


// instantiate Stripe with your secret key
// (make sure STRIPE_SECRET_KEY is set in your .env)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",  // or whatever version you're on
  timeout: 120000,
});

// router.post("/payments/payment-sheet", auth, async (req, res) => {
//   // 1) Create (or reuse) your Stripe Customer
//   const customer = await stripe.customers.create({ email: req.user.email });
//   // 2) Create an ephemeral key tied to that customer
//   const ephemeralKey = await stripe.ephemeralKeys.create(
//     { customer: customer.id },
//     { apiVersion: "2022-11-15" }
//   );
//   // 3) Create a PaymentIntent for the amount
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: req.body.amount,
//     currency: "usd",
//     customer: customer.id,
//   });
//   res.json({
//     paymentIntentClientSecret: paymentIntent.client_secret,
//     ephemeralKey: ephemeralKey.secret,
//     customer: customer.id,
//   });
// });

// @route   POST /api/payments/stripe
// @desc    Create a Stripe PaymentIntent for USD payments




router.post("/stripe", async (req, res) => {
  const { amount, currency = "usd" } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,   // in cents
      currency,
    });
    res.json(paymentIntent);
  } catch (err) {
    console.error("Stripe error:", err);
    // send err.message so client can debug if needed
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
