import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const jobSchema = new Schema(
  {
    /* who / what */
    customer: { type: Types.ObjectId, ref: "Users", required: true },
    serviceProvider: { type: Types.ObjectId, ref: "Users" },

    serviceType: {
      type: String,
      enum: [
        "Roofing",
        "Plumbing",
        "HVAC",
        "Electrician",
        "Handyman",
        "LockSmith",
        "Cleaning",
        "Odd_Jobs",
      ],
      required: true,
    },

    address: { type: String, required: true },
    details: { type: Object }, // emergency-form answers
    serviceCity: { type: String },
    serviceZipcode: { type: String },

    /* status */
    status: {
      type: String,
      enum: [
        "pending",
        "invited",
        "accepted",
        "in_progress",
        "awaiting-additional-payment",
        "paid",
        "provider_completed",
        "cancelled_by_provider",
        "completed",
        "canceled",
      ],
      default: "pending",
    },

    // invitedProviders: [{ type: Types.ObjectId, ref: "Users" }],
    acceptedProvider: { type: Types.ObjectId, ref: "Users" },
    invitedProviders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],

    /* money */
    baseAmount: { type: Number, default: 0 },
    adjustmentAmount: { type: Number, default: 0 },
    rushFee: { type: Number, default: 0 },
    estimatedTotal: { type: Number, default: 0 },
    serviceCost: { type: Number, default: 0 },

    paymentStatus: {
      type: String,
      enum: [
        "refunded",
        "unpaid",
        "paid",
        "balancePending",
        "awaiting-additional-payment",
        "cancelled,",
      ],
      default: "unpaid",
    },
    totalAmountPaid: { type: Number, default: 0 },
    additionalCharge: { type: Number, default: 0 },
    additionalChargeReason: { type: String, default: "" },
    additionalChargePaid: { type: Boolean, default: false },
    convenienceFee: { type: Number, default: 0 },

    chargeApproved: { type: Boolean, default: false },

    refundAmount: { type: Number, default: 0 },

    /* workflow flags */
    customerCompleted: { type: Boolean, default: false },
    customerAccepted: { type: Boolean, default: false },
    providerCompleted: { type: Boolean, default: false },

    cancelledProviders: [{ type: Types.ObjectId, ref: "Users" }],

    /* media */
    arrivalImage: { type: Buffer },
    completionImage: { type: Buffer },

    arrivalImageId: mongoose.Schema.Types.ObjectId,
    completionImageId: mongoose.Schema.Types.ObjectId,
    completedAt: { type: Date },

    /* misc */
    eta: { type: Number }, // minutes
    rating: { type: Number },
    comments: { type: String },

    /* invitation v2 */
    invitationPhase: { type: Number, default: 1 },
    invitationExpiresAt: { type: Date },
  },
  { timestamps: true }
);

/* helpful indexes */
jobSchema.index({ customer: 1, status: 1 });
jobSchema.index({ serviceProvider: 1, status: 1 });

export default mongoose.model("Job", jobSchema);
