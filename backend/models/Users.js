// // backend/models/User.js
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const REQUIRED_FOR_PROVIDER = [
//   "w9",
//   "businessLicense",
//   "proofOfInsurance",
//   "independentContractorAgreement",
// ];

// const usersSchema = new mongoose.Schema(
//   {
//     /* ---------- core identity ---------- */
//     name: { type: String, required: true },
//     businessName: { type: String },
//     email: { type: String, required: true, unique: true },
//     address: { type: String, required: false },
//     phoneNumber: { type: String, required: false },

//     /* ---------- auth ---------- */
//     password: { type: String, required: true, select: false },

//     pushToken: { type: String },
//     expoPushToken: { type: String }, // <-- must be set from frontend after login

//     resetToken: {
//       type: String,
//       default: null,
//     },
    
//     resetTokenExpires: {
//       type: Date,
//       default: null,
//     },

//     role: {
//       type: String,
//       enum: ["customer", "serviceProvider", "admin"],
//       default: "customer",
//     },

//     /* ---------- provider docs ---------- */
//     w9: { type: String, default: null },
//     businessLicense: { type: String, default: null },
//     proofOfInsurance: { type: String, default: null },
//     independentContractorAgreement: { type: String, default: null },
//     yearsExperience: { type: Number },
//     profilePicture: {
//       type: String, // base64-encoded string
//       default: "",
//     },
//     optInSms: {
//       type: Boolean,
//       default: false,
//     },
//     trade: [
//       {
//         type: String,
//         enum: [
//           "Roofing",
//           "Plumbing",
//           "HVAC",
//           "Electrical",
//           "Handyman",
//           "Cleaning",
//           "Odd_Jobs",
//         ],
//       },
//     ],
//     aboutMe: { type: String },
//     serviceType: { type: String },
//     portfolio: [{ type: String }],
//     zipcode: [{ type: String }],
//     // ssnLast4: {
//     //   type: String,
//     //   minlength: 4,
//     //   maxlength: 4,
//     //   match: /^\d{4}$/, // must be four digits
//     // },
//     // dob: {
//     //   type: Date,
//     // },
//     averageRating: { type: Number, default: null },
//     reviewCount: { type: Number, default: 0 },

//     /* at least one zip when provider */
//     serviceZipcode: {
//       type: [{ type: Number }],
//       validate: {
//         validator(arr) {
//           return this.role !== "serviceProvider" || (arr && arr.length > 0);
//         },
//         message: "serviceZipcode is required for serviceProvider",
//       },
//     },

//     /* ---------- misc flags ---------- */
//     isActive: { type: Boolean, default: false },
//     isDeleted: {
//       type: Boolean,
//       default: false,
//     },
//     deleteReason: {
//       type: String,
//       default: "",
//     },
//     deletedAt: {
//       type: Date,
//     },
//     acceptedICA: {
//       type: Boolean,
//       default: false,
//     },

//     /* ---------- geo ----------- */
//     location: {
//       type: { type: String, enum: ["Point"], default: "Point" },
//       coordinates: {
//         type: [Number], // [lng, lat]
//         default: [0, 0],
//       },
//     },

//     /* ---------- billing ---------- */
//     billingTier: {
//       type: String,
//       enum: ["subscription", "profit_sharing", "hybrid"],
//       default: "profit_sharing",
//       select: true,
//     },
//     stripeCustomerId: { type: String },
//     cardOnFile: { type: String },
//     stripeAccountId: { type: String },
//     // profitSharingFeePercentage: { type: Number, default: 0.3 },
//     profitSharingFeePercentage: {
//       type: Number,
//       default: function () {
//         return this.billingTier === "hybrid" ? 0.07 : 0.07; //? hybrid : profit sharing. set both to 7%
//       },
//     },
//     refreshToken: { type: String, default: "" },

//     /* ---------- timestamps ---------- */
//     date: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// /* -------- compound indexes -------- */
// // usersSchema.index({ email: 1 });

// usersSchema.index({ role: 1, isActive: 1 });
// usersSchema.index({ location: "2dsphere" });
// /* -------- virtuals -------- */
// usersSchema.virtual("firstName").get(function () {
//   return this.name?.split(" ")[0] || "";
// });

// /* -------- pre-save hooks -------- */
// usersSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// /* -------- provider-required docs -------- */
// // usersSchema.pre("validate", function (next) {
// //   if (this.role === "serviceProvider") {
// //     const missing = REQUIRED_FOR_PROVIDER.filter((f) => !this[f]);
// //     if (missing.length) {
// //       this.invalidate(
// //         missing[0],
// //         `${missing.join(", ")} required for serviceProvider`
// //       );
// //     }
// //   }
// //   next();
// // });

// usersSchema.pre("validate", function (next) {
//   if (this.role === "serviceProvider" && this.isActive) {
//     const missing = REQUIRED_FOR_PROVIDER.filter((f) => !this[f]);
//     if (missing.length) {
//       this.invalidate(
//         missing[0],
//         `${missing.join(", ")} required to activate account`
//       );
//     }
//   }
//   next();
// });

// /* -------- methods -------- */
// usersSchema.methods.checkPassword = function (plain) {
//   return bcrypt.compare(plain, this.password);
// };

// export default mongoose.model("Users", usersSchema);


// // backend/models/User.js
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const REQUIRED_FOR_PROVIDER = [
//   "w9",
//   "businessLicense",
//   "proofOfInsurance",
//   "independentContractorAgreement",
// ];

// /* ---------- SMS Preferences (new) ---------- */
// const SmsPreferencesSchema = new mongoose.Schema(
//   {
//     // Job-related alerts: confirmations, scheduling changes, arrival ETA, progress, etc.
//     jobUpdates: { type: Boolean, default: false },

//     // Promotions & marketing messages
//     marketing: { type: Boolean, default: false },

//     // Optional timestamps if you want an audit trail
//     consentAt: { type: Date }, // when the user first opted in (any flag)
//     updatedAt: { type: Date }, // last time they changed SMS prefs
//   },
//   { _id: false }
// );

// const usersSchema = new mongoose.Schema(
//   {
//     /* ---------- core identity ---------- */
//     name: { type: String, required: true },
//     businessName: { type: String },
//     email: { type: String, required: true, unique: true },
//     address: { type: String, required: false },
//     phoneNumber: { type: String, required: false },

//     /* ---------- auth ---------- */
//     password: { type: String, required: true, select: false },

//     pushToken: { type: String },
//     expoPushToken: { type: String }, // <-- must be set from frontend after login

//     resetToken: {
//       type: String,
//       default: null,
//     },

//     resetTokenExpires: {
//       type: Date,
//       default: null,
//     },

//     role: {
//       type: String,
//       enum: ["customer", "serviceProvider", "admin"],
//       default: "customer",
//     },

//     /* ---------- provider docs ---------- */
//     w9: { type: String, default: null },
//     businessLicense: { type: String, default: null },
//     proofOfInsurance: { type: String, default: null },
//     independentContractorAgreement: { type: String, default: null },
//     yearsExperience: { type: Number },
//     profilePicture: {
//       type: String, // base64-encoded string
//       default: "",
//     },

//     /* DEPRECATED (legacy single-flag) — prefer smsPreferences.jobUpdates */
//     optInSms: {
//       type: Boolean,
//       default: false,
//     },

//     /* NEW: granular SMS preferences */
//     smsPreferences: {
//       type: SmsPreferencesSchema,
//       default: {}, // gives { jobUpdates:false, marketing:false }
//     },

//     trade: [
//       {
//         type: String,
//         enum: [
//           "Roofing",
//           "Plumbing",
//           "HVAC",
//           "Electrical",
//           "Handyman",
//           "Cleaning",
//           "Odd_Jobs",
//         ],
//       },
//     ],
//     aboutMe: { type: String },
//     serviceType: { type: String },
//     portfolio: [{ type: String }],
//     zipcode: [{ type: String }],
//     averageRating: { type: Number, default: null },
//     reviewCount: { type: Number, default: 0 },

//     /* at least one zip when provider */
//     serviceZipcode: {
//       type: [{ type: Number }],
//       validate: {
//         validator(arr) {
//           return this.role !== "serviceProvider" || (arr && arr.length > 0);
//         },
//         message: "serviceZipcode is required for serviceProvider",
//       },
//     },

//     /* ---------- misc flags ---------- */
//     isActive: { type: Boolean, default: false },
//     isDeleted: {
//       type: Boolean,
//       default: false,
//     },
//     deleteReason: {
//       type: String,
//       default: "",
//     },
//     deletedAt: {
//       type: Date,
//     },
//     acceptedICA: {
//       type: Boolean,
//       default: false,
//     },

//     /* ---------- geo ----------- */
//     location: {
//       type: { type: String, enum: ["Point"], default: "Point" },
//       coordinates: {
//         type: [Number], // [lng, lat]
//         default: [0, 0],
//       },
//     },

//     /* ---------- billing ---------- */
//     billingTier: {
//       type: String,
//       enum: ["subscription", "profit_sharing", "hybrid"],
//       default: "profit_sharing",
//       select: true,
//     },
//     stripeCustomerId: { type: String },
//     cardOnFile: { type: String },
//     stripeAccountId: { type: String },
//     profitSharingFeePercentage: {
//       type: Number,
//       default: function () {
//         return this.billingTier === "hybrid" ? 0.07 : 0.07; // both 7% in your current logic
//       },
//     },
//     refreshToken: { type: String, default: "" },

//     /* ---------- timestamps ---------- */
//     date: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// /* -------- indexes -------- */
// usersSchema.index({ role: 1, isActive: 1 });
// usersSchema.index({ location: "2dsphere" });

// /* -------- virtuals -------- */
// usersSchema.virtual("firstName").get(function () {
//   return this.name?.split(" ")[0] || "";
// });

// /* -------- pre-validate hooks --------
//    - Keep provider activation rule
//    - Light migration: if legacy optInSms is set and smsPreferences.jobUpdates
//      isn't explicitly set, seed it from optInSms.
// */
// usersSchema.pre("validate", function (next) {
//   // provider activation doc requirement
//   if (this.role === "serviceProvider" && this.isActive) {
//     const missing = REQUIRED_FOR_PROVIDER.filter((f) => !this[f]);
//     if (missing.length) {
//       this.invalidate(
//         missing[0],
//         `${missing.join(", ")} required to activate account`
//       );
//     }
//   }

//   // Ensure smsPreferences exists as an object
//   if (!this.smsPreferences || typeof this.smsPreferences !== "object") {
//     this.smsPreferences = {};
//   }

//   // Legacy migration: optInSms -> smsPreferences.jobUpdates (only if not set)
//   const hasJobUpdates =
//     typeof this.smsPreferences.jobUpdates === "boolean";
//   if (!hasJobUpdates && typeof this.optInSms === "boolean") {
//     this.smsPreferences.jobUpdates = !!this.optInSms;
//     // Set consent/update timestamps if first time opting in
//     if (this.smsPreferences.jobUpdates) {
//       if (!this.smsPreferences.consentAt) {
//         this.smsPreferences.consentAt = new Date();
//       }
//       this.smsPreferences.updatedAt = new Date();
//     }
//   }

//   next();
// });

// /* -------- pre-save hooks -------- */
// usersSchema.pre("save", async function (next) {
//   // hash password if changed
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }

//   // Maintain updatedAt for smsPreferences when it changes
//   if (
//     this.isModified("smsPreferences") ||
//     this.isModified("smsPreferences.jobUpdates") ||
//     this.isModified("smsPreferences.marketing")
//   ) {
//     if (!this.smsPreferences) this.smsPreferences = {};
//     // consentAt on first-ever opt-in (any flag)
//     const anyOptIn =
//       this.smsPreferences.jobUpdates === true ||
//       this.smsPreferences.marketing === true;

//     if (anyOptIn && !this.isModified("smsPreferences.consentAt")) {
//       if (!this.smsPreferences.consentAt) {
//         this.smsPreferences.consentAt = new Date();
//       }
//     }
//     this.smsPreferences.updatedAt = new Date();
//   }

//   next();
// });

// /* -------- methods -------- */
// usersSchema.methods.checkPassword = function (plain) {
//   return bcrypt.compare(plain, this.password);
// };

// // Optional helper to read final SMS preferences with legacy fallback
// usersSchema.methods.getSmsPreferences = function () {
//   const prefs = this.smsPreferences || {};
//   const jobUpdates =
//     typeof prefs.jobUpdates === "boolean"
//       ? prefs.jobUpdates
//       : !!this.optInSms; // legacy fallback
//   const marketing =
//     typeof prefs.marketing === "boolean" ? prefs.marketing : false;
//   return { jobUpdates, marketing, consentAt: prefs.consentAt, updatedAt: prefs.updatedAt };
// };

// export default mongoose.model("Users", usersSchema);

// backend/models/Users.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const REQUIRED_FOR_PROVIDER = [
  "w9",
  "businessLicense",
  "proofOfInsurance",
  "independentContractorAgreement",
];

/* ---------- SMS Preferences (new) ---------- */
const SmsPreferencesSchema = new mongoose.Schema(
  {
    // Job-related alerts: confirmations, scheduling changes, arrival ETA, progress, etc.
    jobUpdates: { type: Boolean, default: false },

    // Promotions & marketing messages
    marketing: { type: Boolean, default: false },

    // Optional timestamps if you want an audit trail
    consentAt: { type: Date }, // when the user first opted in (any flag)
    updatedAt: { type: Date }, // last time they changed SMS prefs
  },
  { _id: false }
);

const usersSchema = new mongoose.Schema(
  {
    /* ---------- core identity ---------- */
    name: { type: String, required: true },
    businessName: { type: String },
    email: { type: String, required: true, unique: true },
    address: { type: String },
    phoneNumber: { type: String },

    /* ---------- auth ---------- */
    password: { type: String, required: true, select: false },

    pushToken: { type: String },
    expoPushToken: { type: String }, // set from frontend after login

    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },

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
    governmentId: { type: String, trim: true },     // driver's license / federal ID
    backgroundCheck: { type: String, trim: true },  // PDF/image of receipt or result

    profilePicture: {
      type: String, // base64-encoded data URL
      default: "",
    },

    // LEGACY single-flag — prefer smsPreferences.jobUpdates
    optInSms: { type: Boolean, default: false },

    /* NEW: granular SMS preferences */
    smsPreferences: {
      type: SmsPreferencesSchema,
      default: {}, // -> { jobUpdates:false, marketing:false }
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

    // Media/links
    portfolio: { type: [String], default: [] },

    // Home zipcode(s)
    zipcode: { type: [String], default: [] },

    // Pricing
    serviceCost: { type: Number, default: 0 },

    // Ratings
    averageRating: { type: Number, default: null },
    reviewCount: { type: Number, default: 0 },

    /* At least one zip when provider */
    serviceZipcode: {
      type: [{ type: Number }],
      validate: {
        validator(arr) {
          return this.role !== "serviceProvider" || (arr && arr.length > 0);
        },
        message: "serviceZipcode is required for serviceProvider",
      },
    },

    /* ---------- presence / live state ---------- */
    isOnline: { type: Boolean, default: false }, // used by /active-providers

    /* ---------- misc flags ---------- */
    isActive: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deleteReason: { type: String, default: "" },
    deletedAt: { type: Date },
    acceptedICA: { type: Boolean, default: false },

    /* ---------- session helpers ---------- */
    lastActiveJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    }, // used by POST /users/save-session

    /* ---------- geo ----------- */
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
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
    profitSharingFeePercentage: {
      type: Number,
      default: function () {
        return this.billingTier === "hybrid" ? 0.07 : 0.07; // both 7% in current logic
      },
    },
    refreshToken: { type: String, default: "" },

    /* ---------- timestamps ---------- */
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

/* -------- indexes -------- */
usersSchema.index({ role: 1, isActive: 1 });
usersSchema.index({ location: "2dsphere" });

/* -------- virtuals -------- */
usersSchema.virtual("firstName").get(function () {
  return this.name?.split(" ")[0] || "";
});

/* -------- pre-validate hooks --------
   - Provider activation rule
   - Light migration: if legacy optInSms is set and smsPreferences.jobUpdates
     isn't explicitly set, seed it from optInSms.
*/
usersSchema.pre("validate", function (next) {
  // Provider activation doc requirement
  if (this.role === "serviceProvider" && this.isActive) {
    const missing = REQUIRED_FOR_PROVIDER.filter((f) => !this[f]);
    if (missing.length) {
      this.invalidate(
        missing[0],
        `${missing.join(", ")} required to activate account`
      );
    }
  }

  // Ensure smsPreferences exists as an object
  if (!this.smsPreferences || typeof this.smsPreferences !== "object") {
    this.smsPreferences = {};
  }

  // Legacy migration: optInSms -> smsPreferences.jobUpdates (only if not set)
  const hasJobUpdates = typeof this.smsPreferences.jobUpdates === "boolean";
  if (!hasJobUpdates && typeof this.optInSms === "boolean") {
    this.smsPreferences.jobUpdates = !!this.optInSms;
    // Seed timestamps when first opting in
    if (this.smsPreferences.jobUpdates) {
      if (!this.smsPreferences.consentAt) {
        this.smsPreferences.consentAt = new Date();
      }
      this.smsPreferences.updatedAt = new Date();
    }
  }

  next();
});

/* -------- pre-save hooks -------- */
usersSchema.pre("save", async function (next) {
  // Hash password if changed
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Maintain updatedAt for smsPreferences when it changes
  if (
    this.isModified("smsPreferences") ||
    this.isModified("smsPreferences.jobUpdates") ||
    this.isModified("smsPreferences.marketing")
  ) {
    if (!this.smsPreferences) this.smsPreferences = {};
    // consentAt on first-ever opt-in (any flag)
    const anyOptIn =
      this.smsPreferences.jobUpdates === true ||
      this.smsPreferences.marketing === true;

    if (anyOptIn && !this.isModified("smsPreferences.consentAt")) {
      if (!this.smsPreferences.consentAt) {
        this.smsPreferences.consentAt = new Date();
      }
    }
    this.smsPreferences.updatedAt = new Date();
  }

  next();
});

/* -------- methods -------- */
usersSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Optional helper to read final SMS preferences with legacy fallback
usersSchema.methods.getSmsPreferences = function () {
  const prefs = this.smsPreferences || {};
  const jobUpdates =
    typeof prefs.jobUpdates === "boolean"
      ? prefs.jobUpdates
      : !!this.optInSms; // legacy fallback
  const marketing =
    typeof prefs.marketing === "boolean" ? prefs.marketing : false;
  return {
    jobUpdates,
    marketing,
    consentAt: prefs.consentAt,
    updatedAt: prefs.updatedAt,
  };
};

export default mongoose.model("Users", usersSchema);
