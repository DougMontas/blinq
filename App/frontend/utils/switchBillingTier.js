// utils/switchBillingTier.js
import Stripe from "stripe";
import Users from "../models/Users.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function switchToHybrid(user) {
  // Cancel any active subscriptions first
  if (user.stripeCustomerId) {
    const subs = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "active",
      limit: 1,
    });
    if (subs.data.length) {
      await stripe.subscriptions.del(subs.data[0].id);
    }
  }

  // Create Stripe Customer if not present
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      phone: user.phoneNumber,
      metadata: { userId: user._id.toString(), billingTier: "hybrid" },
    });
    user.stripeCustomerId = customer.id;
    await user.save();
  }

  // Create new subscription
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

  user.billingTier = "hybrid";
  await user.save();
  return session.url;
}

export async function switchToProfitSharing(user) {
  // Cancel any active subscriptions
  if (user.stripeCustomerId) {
    const subs = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "active",
      limit: 1,
    });
    if (subs.data.length) {
      await stripe.subscriptions.del(subs.data[0].id);
    }
  }

  user.billingTier = "profit_sharing";
  await user.save();
  return null; // No URL needed for profit sharing
}
