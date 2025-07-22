// import mongoose from "mongoose";

// const { Schema, Types } = mongoose;

// const jobSchema = new Schema(
//   {
//     customer: { type: Types.ObjectId, ref: "Users", required: true },
//     serviceProvider: { type: Types.ObjectId, ref: "Users" },

//     serviceType: {
//       type: String,
//       enum: [
//         "Roofing",
//         "Plumbing",
//         "HVAC",
//         "Electrician",
//         "Handyman",
//         "LockSmith",
//         "Cleaning",
//         "Odd_Jobs",
//       ],
//       required: true,
//     },

//     address: { type: String, required: true },
//     details: { type: Object }, // emergency-form answers
//     serviceCity: { type: String },
//     serviceZipcode: { type: String },

//     /* status */
//     status: {
//       type: String,
//       enum: [
//         "pending",
//         "invited",
//         "accepted",
//         "in_progress",
//         "awaiting-additional-payment",
//         "paid",
//         "provider_completed",
//         "cancelled_by_provider",
//         "completed",
//         "canceled",
//       ],
//       default: "pending",
//     },

//     // invitedProviders: [{ type: Types.ObjectId, ref: "Users" }],
//     acceptedProvider: { type: Types.ObjectId, ref: "Users" },
//     invitedProviders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],

//     /* money */
//     baseAmount: { type: Number, default: 0 },
//     adjustmentAmount: { type: Number, default: 0 },
//     rushFee: { type: Number, default: 0 },
//     estimatedTotal: { type: Number, default: 0 },
//     serviceCost: { type: Number, default: 0 },

//     paymentStatus: {
//       type: String,
//       enum: [
//         "refunded",
//         "unpaid",
//         "paid",
//         "balancePending",
//         "awaiting-additional-payment",
//         "cancelled,",
//       ],
//       default: "unpaid",
//     },
//     totalAmountPaid: { type: Number, default: 0 },
//     additionalCharge: { type: Number, default: 0 },
//     additionalChargeReason: { type: String, default: "" },
//     additionalChargePaid: { type: Boolean, default: false },
//     convenienceFee: { type: Number, default: 0 },
//     customerFee: { type: Number },
//     providerFee: { type: Number },
//     paymentToProvider: { type: Number },

//     chargeApproved: { type: Boolean, default: false },

//     refundAmount: { type: Number, default: 0 },

//     /* workflow flags */
//     customerCompleted: { type: Boolean, default: false },
//     customerAccepted: { type: Boolean, default: false },
//     providerCompleted: { type: Boolean, default: false },

//     cancelledProviders: [{ type: Types.ObjectId, ref: "Users" }],

//     /* media */
//     arrivalImage: { type: Buffer },
//     completionImage: { type: Buffer },

//     arrivalImageId: mongoose.Schema.Types.ObjectId,
//     completionImageId: mongoose.Schema.Types.ObjectId,
//     completedAt: { type: Date },

//     /* misc */
//     eta: { type: Number }, // minutes
//     rating: { type: Number },
//     comments: { type: String },

//     /* invitation v2 */
//     invitationPhase: { type: Number, default: 1 },
//     invitationExpiresAt: { type: Date },
//   },

//   { timestamps: true }
// );

// jobSchema.add({
//   location: {
//     type: { type: String, enum: ["Point"], default: "Point" },
//     coordinates: { type: [Number], required: true }, // [lng, lat]
//   },
// }),

// /* helpful indexes */
// jobSchema.index({ customer: 1, status: 1 });
// jobSchema.index({ serviceProvider: 1, status: 1 });

// export default mongoose.model("Job", jobSchema);

// import mongoose from "mongoose";

// const { Schema, Types } = mongoose;

// const jobSchema = new Schema(
//   {
//     customer: { type: Types.ObjectId, ref: "Users", required: true },
//     serviceProvider: { type: Types.ObjectId, ref: "Users" },

//     serviceType: {
//       type: String,
//       enum: [
//         "Roofing",
//         "Plumbing",
//         "HVAC",
//         "Electrician",
//         "Handyman",
//         "LockSmith",
//         "Cleaning",
//         "Odd_Jobs",
//       ],
//       required: true,
//     },

//     address: { type: String, required: true },
//     details: { type: Object }, // emergency-form answers
//     serviceCity: { type: String },
//     serviceZipcode: { type: String },

//     status: {
//       type: String,
//       enum: [
//         "pending",
//         "invited",
//         "accepted",
//         "in_progress",
//         "awaiting-additional-payment",
//         "paid",
//         "provider_completed",
//         "cancelled_by_provider",
//         "completed",
//         "canceled",
//       ],
//       default: "pending",
//     },

//     acceptedProvider: { type: Types.ObjectId, ref: "Users" },
//     invitedProviders: [{ type: Types.ObjectId, ref: "Users" }],

//     baseAmount: { type: Number, default: 0 },
//     adjustmentAmount: { type: Number, default: 0 },
//     rushFee: { type: Number, default: 0 },
//     estimatedTotal: { type: Number, default: 0 },
//     serviceCost: { type: Number, default: 0 },

//     paymentStatus: {
//       type: String,
//       enum: [
//         "refunded",
//         "unpaid",
//         "paid",
//         "balancePending",
//         "awaiting-additional-payment",
//         "cancelled,",
//       ],
//       default: "unpaid",
//     },
//     totalAmountPaid: { type: Number, default: 0 },
//     additionalCharge: { type: Number, default: 0 },
//     additionalChargeReason: { type: String, default: "" },
//     additionalChargePaid: { type: Boolean, default: false },
//     convenienceFee: { type: Number, default: 0 },
//     customerFee: { type: Number },
//     providerFee: { type: Number },
//     paymentToProvider: { type: Number },

//     chargeApproved: { type: Boolean, default: false },
//     refundAmount: { type: Number, default: 0 },

//     customerCompleted: { type: Boolean, default: false },
//     customerAccepted: { type: Boolean, default: false },
//     providerCompleted: { type: Boolean, default: false },

//     cancelledProviders: [{ type: Types.ObjectId, ref: "Users" }],

//     arrivalImage: { type: Buffer },
//     completionImage: { type: Buffer },
//     arrivalImageId: Types.ObjectId,
//     completionImageId: Types.ObjectId,
//     completedAt: { type: Date },

//     eta: { type: Number },
//     rating: { type: Number },
//     comments: { type: String },

//     invitationPhase: { type: Number, default: 1 },
//     invitationExpiresAt: { type: Date },

//     location: {
//       type: {
//         type: String,
//         enum: ["Point"],
//         default: "Point",
//       },
//       coordinates: {
//         type: [Number],
//         required: true,
//         validate: {
//           validator: (val) =>
//             Array.isArray(val) &&
//             val.length === 2 &&
//             val.every((n) => typeof n === "number" && !isNaN(n)),
//           message: "Coordinates must be an array of two numbers [lng, lat]",
//         },
//       },
//     },
//   },
//   { timestamps: true }
// );

// jobSchema.index({ customer: 1, status: 1 });
// jobSchema.index({ serviceProvider: 1, status: 1 });
// jobSchema.index({ location: "2dsphere" }); // 🔥 Required for geospatial queries

// export default mongoose.model("Job", jobSchema);

import mongoose from "mongoose";

const { Schema, Types } = mongoose;

const jobSchema = new Schema(
  {
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
    details: { type: Object },
    serviceCity: { type: String },
    serviceZipcode: { type: String },

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
        "cancelled-by-customer",
        "cancelled-by-serviceProvider",
        "cancelled-by-customer",
        "cancelled-by-serviceProvider",
        "cancelled-auto",
        "completed",
        "canceled",
        "disputed",
      ],
      default: "pending",
    },

    acceptedProvider: { type: Types.ObjectId, ref: "Users" },
    invitedProviders: [{ type: Types.ObjectId, ref: "Users" }],

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
        "cancelled",
      ],
      default: "unpaid",
    },
    totalAmountPaid: { type: Number, default: 0 },
    additionalCharge: { type: Number, default: 0 },
    additionalChargeReason: { type: String, default: "" },
    additionalChargePaid: { type: Boolean, default: false },
    convenienceFee: { type: Number, default: 0 },
    customerFee: { type: Number },
    providerFee: { type: Number },
    paymentToProvider: { type: Number },

    chargeApproved: { type: Boolean, default: false },
    refundAmount: { type: Number, default: 0 },

    customerCompleted: { type: Boolean, default: false },
    customerAccepted: { type: Boolean, default: false },
    providerCompleted: { type: Boolean, default: false },

    cancelledProviders: [{ type: Types.ObjectId, ref: "Users" }],

    cancelledBy: {
      type: String, // 'customer', 'provider', or 'unknown'
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    auditLog: [
      {
        action: String, // e.g., 'cancel', 'accept', 'reinvite'
        by: String, // 'customer' or 'provider'
        user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    arrivalImage: { type: Buffer },
    completionImage: { type: Buffer },
    arrivalImageId: Types.ObjectId,
    completionImageId: Types.ObjectId,
    completedAt: { type: Date },

    eta: { type: Number },
    rating: { type: Number },
    comments: { type: String },

    invitationPhase: { type: Number, default: 1 },
    invitationExpiresAt: { type: Date },

    customerMarkedIncomplete: { type: Boolean, default: false },
    lastNotCompleteAt: { type: Date, default: null },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (val) {
            if (typeof val === "string") {
              try {
                val = JSON.parse(val);
              } catch {
                return false;
              }
            }
            return (
              Array.isArray(val) &&
              val.length === 2 &&
              val.every((n) => typeof n === "number" && !isNaN(n))
            );
          },
          message: "Coordinates must be an array of two numbers [lng, lat]",
        },
      },
    },
  },
  { timestamps: true }
);

jobSchema.index({ customer: 1, status: 1 });
jobSchema.index({ serviceProvider: 1, status: 1 });
jobSchema.index({ location: "2dsphere" });

export default mongoose.model("Job", jobSchema);
