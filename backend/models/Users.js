// backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const REQUIRED_FOR_PROVIDER = [
  "w9",
  "businessLicense",
  "proofOfInsurance",
  "independentContractorAgreement",
];

const usersSchema = new mongoose.Schema(
  {
    /* ---------- core identity ---------- */
    name: { type: String, required: true },
    businessName: { type: String },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: false },
    phoneNumber: { type: String, required: false },

    /* ---------- auth ---------- */
    password: { type: String, required: true, select: false },

    pushToken: { type: String },
    expoPushToken: { type: String }, // <-- must be set from frontend after login

    role: {
      type: String,
      enum: ["customer", "serviceProvider", "admin"],
      default: "customer",
    },

    /* ---------- provider docs ---------- */
    w9: { type: String, default: null },
    businessLicense: { type: String, default: null },
    proofOfInsurance: { type: String, default: null },
    independentContractorAgreement: { type: String, default: null },
    yearsExperience: { type: Number },
    profilePicture: {
      type: String, // base64-encoded string
      default: "",
    },
    optInSms: {
      type: Boolean,
      default: false,
    },
    trade: [
      {
        type: String,
        enum: [
          "Roofing",
          "Plumbing",
          "HVAC",
          "Electrical",
          "Handyman",
          "Cleaning",
          "Odd_Jobs",
        ],
      },
    ],
    aboutMe: { type: String },
    serviceType: { type: String },
    portfolio: [{ type: String }],
    zipcode: [{ type: String }],
    // ssnLast4: {
    //   type: String,
    //   minlength: 4,
    //   maxlength: 4,
    //   match: /^\d{4}$/, // must be four digits
    // },
    // dob: {
    //   type: Date,
    // },
    averageRating: { type: Number, default: null },
    reviewCount: { type: Number, default: 0 },

    /* at least one zip when provider */
    serviceZipcode: {
      type: [{ type: Number }],
      validate: {
        validator(arr) {
          return this.role !== "serviceProvider" || (arr && arr.length > 0);
        },
        message: "serviceZipcode is required for serviceProvider",
      },
    },

    /* ---------- misc flags ---------- */
    isActive: { type: Boolean, default: false },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deleteReason: {
      type: String,
      default: "",
    },
    deletedAt: {
      type: Date,
    },
    acceptedICA: {
      type: Boolean,
      default: false,
    },

    /* ---------- geo ----------- */
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },

    /* ---------- billing ---------- */
    billingTier: {
      type: String,
      enum: ["subscription", "profit_sharing", "hybrid"],
      default: "profit_sharing",
      select: true,
    },
    stripeCustomerId: { type: String },
    cardOnFile: { type: String },
    stripeAccountId: { type: String },
    // profitSharingFeePercentage: { type: Number, default: 0.3 },
    profitSharingFeePercentage: {
      type: Number,
      default: function () {
        return this.billingTier === "hybrid" ? 0.07 : 0.07; //? hybrid : profit sharing. set both to 7%
      },
    },
    refreshToken: { type: String, default: "" },

    /* ---------- timestamps ---------- */
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

/* -------- compound indexes -------- */
// usersSchema.index({ email: 1 });

usersSchema.index({ role: 1, isActive: 1 });
usersSchema.index({ location: "2dsphere" });
/* -------- virtuals -------- */
usersSchema.virtual("firstName").get(function () {
  return this.name?.split(" ")[0] || "";
});

/* -------- pre-save hooks -------- */
usersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* -------- provider-required docs -------- */
// usersSchema.pre("validate", function (next) {
//   if (this.role === "serviceProvider") {
//     const missing = REQUIRED_FOR_PROVIDER.filter((f) => !this[f]);
//     if (missing.length) {
//       this.invalidate(
//         missing[0],
//         `${missing.join(", ")} required for serviceProvider`
//       );
//     }
//   }
//   next();
// });

usersSchema.pre("validate", function (next) {
  if (this.role === "serviceProvider" && this.isActive) {
    const missing = REQUIRED_FOR_PROVIDER.filter((f) => !this[f]);
    if (missing.length) {
      this.invalidate(
        missing[0],
        `${missing.join(", ")} required to activate account`
      );
    }
  }
  next();
});

/* -------- methods -------- */
usersSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("Users", usersSchema);
