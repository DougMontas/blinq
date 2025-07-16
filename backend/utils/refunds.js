import stripe from "./stripeClient";

export async function issueRefund(paymentIntentId, reason = "Customer cancelled quickly") {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: "requested_by_customer",
      metadata: { note: reason },
    });
    console.log("✅ Stripe refund issued:", refund.id);
  } catch (err) {
    console.error("❌ Failed to issue refund:", err.message);
  }
}

export async function chargeTravelFee(job) {
  try {
    // Adjust your logic as needed (e.g., create invoice or partial refund)
    console.log("🚗 Charging travel fee for job", job._id);
    // Example: issue partial refund here
    await stripe.refunds.create({
      payment_intent: job.paymentIntentId,
      amount: Math.round((job.estimatedTotal - 100) * 100), // refund minus $100
      metadata: { note: "Travel fee retained after customer cancellation" },
    });
  } catch (err) {
    console.error("❌ Travel fee logic failed:", err.message);
  }
}
