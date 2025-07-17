// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";

// const EXPIRY_DURATION_MS =
//   Number(process.env.PHASE_ONE_EXPIRY_MS) || 15 * 60 * 1000; // 15 min count down for job acceptance

// export async function invitePhaseOne(job, maybeAllProviders, io) {
//   console.time("🟡 invitePhaseOne");

//   if (job.acceptedProvider || job.status === "accepted") {
//     console.warn(`Job ${job._id} is already accepted. Skipping invites.`);
//     return;
//   }

//   let allProviders;

//   console.time("🔍 Provider lookup");
//   if (!Array.isArray(maybeAllProviders)) {
//     const emergencyZip = job.serviceZipcode?.toString().trim();
//     if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

//     allProviders = await Users.find(
//       {
//         role: "serviceProvider",
//         serviceType: job.serviceType,
//         serviceZipcode: { $in: [emergencyZip] },
//         _id: { $nin: job.cancelledProviders || [] },
//       },
//       {
//         _id: 1,
//         name: 1,
//         billingTier: 1,
//         serviceZipcode: 1,
//         phone: 1,
//       }
//     ).lean();
//   } else {
//     allProviders = maybeAllProviders;
//   }
//   console.timeEnd("🔍 Provider lookup");

//   console.time("🧮 Filtering");
//   const hybrid = getEligibleProviders(
//     allProviders,
//     "hybrid",
//     job.serviceZipcode
//   );
//   const profit = getEligibleProviders(
//     allProviders,
//     "profit_sharing",
//     job.serviceZipcode
//   );
//   console.timeEnd("🧮 Filtering");

//   const jobId = job._id?.toString?.();
//   if (!jobId) throw new Error("Missing job._id in invitePhaseOne");

//   const expiresAt = new Date(Date.now() + EXPIRY_DURATION_MS);

//   console.time("📝 Update job");
//   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = expiresAt;
//   await job.save();
//   console.timeEnd("📝 Update job");

//   const inviteTasks = [];

//   console.time("📡 Emit + Invite");

//   for (const p of profit) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId,
//       invitationExpiresAt: expiresAt,
//       clickable: false,
//     });

//     // Blur address before sending teaser invite
//     const redactedJob = {
//       ...job.toObject(),
//       address: "[Address Hidden]",
//     };
//     inviteTasks.push(sendTeaserInvite(p, redactedJob));
//   }

//   for (const p of hybrid) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId,
//       invitationExpiresAt: expiresAt,
//       clickable: true,
//     });
//     inviteTasks.push(sendInAppInvite(p, job));
//     if (p.phone) {
//       inviteTasks.push(
//         sendSMS(p.phone, job).catch((err) =>
//           console.error(`SMS failed for ${p.phone}`, err)
//         )
//       );
//     }
//   }

//   await Promise.all(inviteTasks);

//   console.timeEnd("📡 Emit + Invite");
//   console.timeEnd("🟡 invitePhaseOne");
// }

// // invitePhaseOne.js// invitePhaseOne.js
// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";
// import mongoose from "mongoose";

// const MILES_TO_METERS = 1609.34;
// const RADIUS_TIERS = [
//   { miles: 5, durationMs: 5 * 60 * 1000 },
//   { miles: 15, durationMs: 5 * 60 * 1000 },
//   { miles: 30, durationMs: 5 * 60 * 1000 },
// ];

// export async function invitePhaseOne(job, allProvidersFromZip, io, phase = 1) {
//   console.log(`🚀 Inviting providers for job ${job._id} – Phase ${phase}`);

//   if (job.acceptedProvider || job.status === "accepted") {
//     console.warn(`Job ${job._id} is already accepted. Skipping invites.`);
//     return;
//   }

//   let hybrid = [], profit = [], allProviders = [];
//   const location = job.location;
//   if (
//     !location ||
//     location.type !== "Point" ||
//     !Array.isArray(location.coordinates) ||
//     location.coordinates.length !== 2 ||
//     location.coordinates.some((n) => typeof n !== "number" || isNaN(n))
//   ) {
//     console.error("❌ Invalid job.location:", location);
//     return;
//   }

//   const jobId = job._id.toString();
//   const tier = RADIUS_TIERS[Math.min(phase - 1, RADIUS_TIERS.length - 1)];
//   const expiresAt = new Date(Date.now() + tier.durationMs);
//   console.log(`📆 Phase ${phase} will expire at: ${expiresAt.toISOString()}`);

//   if (phase === 1) {
//     console.log("🔍 Matching providers by zipcode...");
//     allProviders = await Users.find({
//       role: "serviceProvider",
//       isActive: true,
//       serviceType: job.serviceType,
//       serviceZipcode: job.serviceZipcode,
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else if (phase >= 2 && phase <= 4) {
//     const radiusMiles = tier.miles;
//     const maxMeters = radiusMiles * MILES_TO_METERS;
//     console.log(`📍 Searching within ${radiusMiles} miles (${maxMeters} meters)...`);
//     allProviders = await Users.find({
//       role: "serviceProvider",
//       isActive: true,
//       serviceType: job.serviceType,
//       location: {
//         $nearSphere: {
//           $geometry: location,
//           $maxDistance: maxMeters,
//         },
//       },
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else {
//     console.log("🛑 Final fallback – inviting all active providers");
//     allProviders = await Users.find({
//       role: "serviceProvider",
//       isActive: true,
//       serviceType: job.serviceType,
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   }

//   hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
//   profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

//   console.log(`📦 Hybrid count: ${hybrid.length}, Profit-sharing count: ${profit.length}`);

//   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
//   job.invitationPhase = phase;
//   job.invitationExpiresAt = expiresAt;
//   await job.save();
//   console.log(`💾 Job updated with ${job.invitedProviders.length} invited providers.`);

//   const jobIdStr = job._id.toString();
//   const inviteTasks = [];

//   for (const p of profit) {
//     const teaserPayload = {
//       jobId: jobIdStr,
//       invitationExpiresAt: expiresAt,
//       clickable: phase >= 5, // round 5 and later get real invites
//     };
//     io.to(p._id.toString()).emit("jobInvitation", teaserPayload);
//     console.log(`📨 Sent teaser invite to profit-sharing ${p._id}`);
//     const redactedJob = { ...job.toObject(), address: "[Address Hidden]" };
//     inviteTasks.push(sendTeaserInvite(p, redactedJob));
//   }

//   for (const p of hybrid) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: jobIdStr,
//       invitationExpiresAt: expiresAt,
//       clickable: true,
//     });
//     console.log(`📨 Sent real invite to hybrid ${p._id}`);
//     inviteTasks.push(sendInAppInvite(p, job));
//     if (p.phone) {
//       inviteTasks.push(sendSMS(p.phone, job));
//     }
//   }

//   await Promise.allSettled(inviteTasks);
//   console.log(`✅ Phase ${phase} invites dispatched for job ${job._id}`);

//   // 🔁 Schedule next phase if needed
//   if (phase < 5) {
//     console.log(`⏳ Scheduling next phase (${phase + 1}) in ${tier.durationMs / 1000}s`);
//     setTimeout(async () => {
//       const latest = await mongoose.model("Job").findById(job._id);
//       if (!latest || latest.status === "accepted" || latest.acceptedProvider) {
//         console.log(`🛑 Job ${job._id} already accepted. Stopping escalation.`);
//         return;
//       }
//       invitePhaseOne(latest, null, io, phase + 1);
//     }, tier.durationMs);
//   } else {
//     console.log(`🎯 Final phase reached for job ${job._id}. No further escalation.`);
//   }
// }

// // invitePhaseOne.js
// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";
// import mongoose from "mongoose";

// const MILES_TO_METERS = 1609.34;
// const RADIUS_TIERS = [
//   { miles: 5, durationMs: .1 * .1 * 10 },
//   { miles: 15, durationMs: 5 * 60 * 1000 },
//   { miles: 30, durationMs: 5 * 60 * 1000 },
// ];

// export async function invitePhaseOne(job, allProvidersFromZip, io, phase = 1) {
//   console.log(`🚀 Inviting providers for job ${job._id} – Phase ${phase}`);

//   if (job.acceptedProvider || job.status === "accepted") {
//     console.warn(`Job ${job._id} is already accepted. Skipping invites.`);
//     return;
//   }

//   let hybrid = [],
//     profit = [],
//     allProviders = [];

//   const location = job.location; // { type: 'Point', coordinates: [lng, lat] }
//   console.log("📍 Raw job.location:", location);

//   if (
//     !location ||
//     !Array.isArray(location.coordinates) ||
//     location.coordinates.length !== 2 ||
//     location.coordinates.some((n) => typeof n !== "number" || isNaN(n))
//   ) {
//     console.error("❌ Missing or invalid job location", location);
//     return;
//   }

//   // if (typeof location?.coordinates === "string") {
//   //   try {
//   //     location.coordinates = JSON.parse(location.coordinates);
//   //     console.log("✅ Parsed stringified coordinates:", location.coordinates);
//   //   } catch {
//   //     console.warn("⚠️ Failed to parse coordinates string.");
//   //   }
//   // }

//   console.log("📍 Type:", typeof location);
//   console.log("📍 location.coordinates:", location?.coordinates);
//   console.log(
//     "📍 Coordinates valid array?",
//     Array.isArray(location?.coordinates)
//   );
//   console.log("📍 Coordinates length:", location?.coordinates?.length);
//   console.log(
//     "📍 Coordinate types:",
//     Array.isArray(location?.coordinates)
//       ? location.coordinates.map((n, i) => `index ${i}: ${n} (${typeof n})`)
//       : "N/A"
//   );
//   console.log("✅ Final coordinates used in invitePhaseOne:", location.coordinates);


//   if (
//     !location ||
//     !Array.isArray(location.coordinates) ||
//     location.coordinates.length !== 2 ||
//     location.coordinates.some((n) => typeof n !== "number" || isNaN(n))
//   ) {
//     console.error("❌ Missing or invalid job location", location);
//     return;
//   }

//   const jobId = job._id.toString();
//   const tier = RADIUS_TIERS[Math.min(phase - 1, RADIUS_TIERS.length - 1)];
//   const expiresAt = new Date(Date.now() + tier.durationMs);
//   console.log(`📆 Phase ${phase} will expire at: ${expiresAt.toISOString()}`);

//   if (phase === 1) {
//     console.log("🔍 Matching providers by zipcode...");
//     allProviders = await Users.find({
//       role: "serviceProvider",
//       isActive: true,
//       serviceType: job.serviceType,
//       serviceZipcode: job.serviceZipcode,
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else if (phase >= 2 && phase <= 4) {
//     const radiusMiles = tier.miles;
//     const maxMeters = radiusMiles * MILES_TO_METERS;
//     console.log(
//       `📍 Searching within ${radiusMiles} miles (${maxMeters} meters)...`
//     );
//     allProviders = await Users.find({
//       role: "serviceProvider",
//       isActive: true,
//       serviceType: job.serviceType,
//       location: {
//         $nearSphere: {
//           $geometry: location,
//           $maxDistance: maxMeters,
//         },
//       },
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else {
//     console.log("🛑 Final fallback – inviting all active providers");
//     allProviders = await Users.find({
//       role: "serviceProvider",
//       isActive: true,
//       serviceType: job.serviceType,
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   }

//   hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
//   profit = getEligibleProviders(
//     allProviders,
//     "profit_sharing",
//     job.serviceZipcode
//   );

//   console.log(
//     `📦 Hybrid count: ${hybrid.length}, Profit-sharing count: ${profit.length}`
//   );

//   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
//   job.invitationPhase = phase;
//   job.invitationExpiresAt = expiresAt;
//   await job.save();
//   console.log(
//     `💾 Job updated with ${job.invitedProviders.length} invited providers.`
//   );

//   const jobIdStr = job._id.toString();
//   const inviteTasks = [];

//   // for (const p of profit) {
//   //   const teaserPayload = {
//   //     jobId: jobIdStr,
//   //     invitationExpiresAt: expiresAt,
//   //     clickable: phase >= 5, // round 5 and later get real invites
//   //   };
//   //   io.to(p._id.toString()).emit("jobInvitation", teaserPayload);
//   //   console.log(`📨 Sent teaser invite to profit-sharing ${p._id}`);
//   //   const redactedJob = { ...job.toObject(), address: "[Address Hidden]" };
//   //   inviteTasks.push(sendTeaserInvite(p, redactedJob));
//   // }

//   for (const p of profit) {
//     const teaserPayload = {
//       jobId: jobIdStr,
//       invitationExpiresAt: expiresAt,
//       clickable: phase >= 5,
//     };
  
//     io.to(p._id.toString()).emit("jobInvitation", teaserPayload);
//     console.log(`📨 Sent teaser invite to profit-sharing ${p._id}`);
  
//     const redactedJob = { ...job.toObject(), address: "[Address Hidden]" };
//     inviteTasks.push(sendTeaserInvite(p, redactedJob));
  
//     if (p.expoPushToken) {
//       inviteTasks.push(
//         sendPushNotification({
//           to: p.expoPushToken,
//           sound: "default",
//           title: "New Emergency Job",
//           body: "Open BlinqFix to view the job details.",
//           data: { jobId: jobIdStr, clickable: teaserPayload.clickable },
//         })
//       );
//     }
//   }

//   for (const p of hybrid) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: jobIdStr,
//       invitationExpiresAt: expiresAt,
//       clickable: true,
//     });
//     console.log(`📨 Sent real invite to hybrid ${p._id}`);
//     inviteTasks.push(sendInAppInvite(p, job));
//     if (p.phone) {
//       inviteTasks.push(sendSMS(p.phone, job));
//     }
//   }

//   await Promise.allSettled(inviteTasks);
//   console.log(`✅ Phase ${phase} invites dispatched for job ${job._id}`);

//   // 🔁 Schedule next phase if needed
//   if (phase < 5) {
//     console.log(
//       `⏳ Scheduling next phase (${phase + 1}) in ${tier.durationMs / 1000}s`
//     );
//     setTimeout(async () => {
//       const latest = await mongoose.model("Job").findById(job._id);
//       if (!latest || latest.status === "accepted" || latest.acceptedProvider) {
//         console.log(`🛑 Job ${job._id} already accepted. Stopping escalation.`);
//         return;
//       }
//       invitePhaseOne(latest, null, io, phase + 1); // ✅ use passed-in io
//     }, tier.durationMs);
//     // setTimeout(async () => {
//     //   const latest = await mongoose.model("Job").findById(job._id);
//     //   if (!latest || latest.status === "accepted" || latest.acceptedProvider) {
//     //     console.log(`🛑 Job ${job._id} already accepted. Stopping escalation.`);
//     //     return;
//     //   }
//     //   invitePhaseOne(latest, null, req.io, phase + 1);
//     // }, tier.durationMs);
//   } else {
//     console.log(
//       `🎯 Final phase reached for job ${job._id}. No further escalation.`
//     );
//   }
// // }


// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import sendPushNotification from "../utils/sendPushNotification.js";
// import Users from "../models/Users.js";
// import mongoose from "mongoose";
// import { Expo } from "expo-server-sdk";

// const expo = new Expo();

// const MILES_TO_METERS = 1609.34;
// const RADIUS_TIERS = [
//   { miles: 5, durationMs: 0.1 * 0.1 * 10 },
//   { miles: 15, durationMs: 5 * 60 * 1000 },
//   { miles: 30, durationMs: 5 * 60 * 1000 },
//   { miles: 50, durationMs: 5 * 60 * 1000 },
// ];

// export async function invitePhaseOne(job, allProvidersFromZip, io, phase = 1) {
//   console.log(`🚀 Inviting providers for job ${job._id} – Phase ${phase}`);

//   if (job.acceptedProvider || job.status === "accepted") {
//     console.warn(`Job ${job._id} is already accepted. Skipping invites.`);
//     return;
//   }

//   let hybrid = [],
//     profit = [],
//     allProviders = [];

//   const location = job.location;
//   if (!location || !Array.isArray(location.coordinates) || location.coordinates.length !== 2 || location.coordinates.some((n) => typeof n !== "number" || isNaN(n))) {
//     console.error("❌ Missing or invalid job location", location);
//     return;
//   }

//   const jobId = job._id.toString();
//   const tier = RADIUS_TIERS[Math.min(phase - 1, RADIUS_TIERS.length - 1)];
//   const expiresAt = new Date(Date.now() + tier.durationMs);
//   console.log(`📆 Phase ${phase} will expire at: ${expiresAt.toISOString()}`);

//   if (phase === 1) {
//     console.log("🔍 Matching providers by zipcode...");
//     allProviders = await Users.find({
//       role: "serviceProvider",
//       isActive: true,
//       serviceType: job.serviceType,
//       serviceZipcode: job.serviceZipcode,
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else if (phase >= 2 && phase <= 4) {
//     const radiusMiles = tier.miles;
//     const maxMeters = radiusMiles * MILES_TO_METERS;
//     allProviders = await Users.find({
//       role: "serviceProvider",
//       isActive: true,
//       serviceType: job.serviceType,
//       location: {
//         $nearSphere: {
//           $geometry: location,
//           $maxDistance: maxMeters,
//         },
//       },
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else {
//     allProviders = await Users.find({
//       role: "serviceProvider",
//       isActive: true,
//       serviceType: job.serviceType,
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   }

//   hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
//   profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

//   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
//   job.invitationPhase = phase;
//   job.invitationExpiresAt = expiresAt;
//   await job.save();

//   const jobIdStr = job._id.toString();
//   const inviteTasks = [];

//   for (const p of profit) {
//     const teaserPayload = {
//       jobId: jobIdStr,
//       invitationExpiresAt: expiresAt,
//       clickable: phase >= 5,
//     };
//     io.to(p._id.toString()).emit("jobInvitation", teaserPayload);
//     const redactedJob = { ...job.toObject(), address: "[Address Hidden]" };
//     inviteTasks.push(sendTeaserInvite(p, redactedJob));

//     if (p.expoPushToken) {
//       inviteTasks.push(
//         sendPushNotification({
//           to: p.expoPushToken,
//           sound: "default",
//           title: "Blinqfix sent you a New Emergency Job",
//           body: "Open BlinqFix to view the job details.",
//           data: {
//             jobId: jobIdStr,
//             clickable: teaserPayload.clickable,
//             type: "jobInvite",
//           },
//         })
//       );
//     }

//     if (p.phone) {
//       inviteTasks.push(
//         sendSMS(
//           p.phone,
//           `🚨 Blinqfix sent you a New Emergency Job Nearby!
// Open the BlinqFix app to review and accept the job (ID: ${jobIdStr}).`
//         )
//       );
//     }
//   }

//   for (const p of hybrid) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: jobIdStr,
//       invitationExpiresAt: expiresAt,
//       clickable: true,
//     });
//     inviteTasks.push(sendInAppInvite(p, job));

//     if (p.expoPushToken) {
//       inviteTasks.push(
//         sendPushNotification({
//           to: p.expoPushToken,
//           sound: "default",
//           title: "Blinqfix sent you a New Emergency Job",
//           body: "Check BlinqFix for the details.",
//           data: {
//             jobId: jobIdStr,
//             clickable: true,
//             type: "jobInvite",
//           },
//         })
//       );
//     }

//     if (p.phone) {
//       inviteTasks.push(
//         sendSMS(
//           p.phone,
//           `🚨 Blinqfix sent you a Emergency Job Alert!
// A new job (ID: ${jobIdStr}) is available. Open BlinqFix to view and accept.`
//         )
//       );
//     }
//   }

//   await Promise.allSettled(inviteTasks);
//   console.log(`✅ Phase ${phase} invites dispatched for job ${job._id}`);

//   if (phase < 5) {
//     console.log(`⏳ Scheduling next phase (${phase + 1}) in ${tier.durationMs / 1000}s`);
//     setTimeout(async () => {
//       const latest = await mongoose.model("Job").findById(job._id);
//       if (!latest || latest.status === "accepted" || latest.acceptedProvider) {
//         console.log(`🛑 Job ${job._id} already accepted. Stopping escalation.`);
//         return;
//       }
//       invitePhaseOne(latest, null, io, phase + 1);
//     }, tier.durationMs);
//   } else {
//     console.log(`🎯 Final phase reached for job ${job._id}. No further escalation.`);
//   }
// }

// invitePhaseOne.js (enhanced version with full logging)
import { getEligibleProviders } from "../utils/providerFilters.js";
import sendInAppInvite from "../invites/sendInAppInvite.js";
import sendTeaserInvite from "../invites/sendTeaserInvite.js";
import sendSMS from "../utils/sendSMS.js";
import sendPushNotification from "../utils/sendPushNotification.js";
import Users from "../models/Users.js";
import mongoose from "mongoose";

const MILES_TO_METERS = 1609.34;
const RADIUS_TIERS = [
  { miles: 5, durationMs: 60 * 1000 },
  { miles: 15, durationMs: 5 * 60 * 1000 },
  { miles: 30, durationMs: 5 * 60 * 1000 },
  { miles: 50, durationMs: 5 * 60 * 1000 },
];

export async function invitePhaseOne(job, allProvidersFromZip, io, phase = 1) {
  try {
    console.log("🚨 invitePhaseOne START", job?._id, "Phase", phase);
    console.log("📋 Job status:", job.status);
    console.log("📋 AcceptedProvider:", job.acceptedProvider);
    console.log("📋 Job location:", job?.location?.coordinates);
    console.log("📡 Socket IO passed:", !!io);

    if (!io) {
      console.warn("⚠️ Socket instance not available. Skipping emits.");
    }

    if (job.acceptedProvider || job.status === "accepted") {
      console.warn(`⚠️ Job ${job._id} already accepted. Skipping invites.`);
      return;
    }

    let hybrid = [],
      profit = [],
      allProviders = [];

    const location = job.location;
    if (!location ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2 ||
      location.coordinates.some((n) => typeof n !== "number" || isNaN(n))
    ) {
      console.error("❌ Invalid job location:", location);
      return;
    }

    const jobIdStr = job._id.toString();
    const tier = RADIUS_TIERS[Math.min(phase - 1, RADIUS_TIERS.length - 1)];
    const expiresAt = new Date(Date.now() + tier.durationMs);
    console.log(`📆 Phase ${phase} expires at: ${expiresAt.toISOString()}`);

    if (phase === 1) {
      console.log("🔍 Finding providers by zipcode...");
      allProviders = await Users.find({
        role: "serviceProvider",
        isActive: true,
        serviceType: job.serviceType,
        serviceZipcode: job.serviceZipcode,
        _id: { $nin: job.cancelledProviders || [] },
      }).lean();
    } else {
      const radiusMiles = tier.miles;
      const maxMeters = radiusMiles * MILES_TO_METERS;
      console.log(`📏 Searching providers within ${radiusMiles} miles`);
      allProviders = await Users.find({
        role: "serviceProvider",
        isActive: true,
        serviceType: job.serviceType,
        location: {
          $nearSphere: {
            $geometry: location,
            $maxDistance: maxMeters,
          },
        },
        _id: { $nin: job.cancelledProviders || [] },
      }).lean();
    }

    hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
    profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

    const allTargetProviders = [...hybrid, ...profit];
    console.log(`✅ Providers to invite in Phase ${phase}:`, allTargetProviders.length);

    if (allTargetProviders.length === 0) {
      console.warn("⚠️ No eligible providers found for this phase.");
    }

    job.invitedProviders = allTargetProviders.map((p) => p._id);
    job.invitationPhase = phase;
    job.invitationExpiresAt = expiresAt;
    await job.save();

    const inviteTasks = [];

    for (const p of profit) {
      const teaserPayload = {
        jobId: jobIdStr,
        invitationExpiresAt: expiresAt,
        clickable: phase >= 5,
      };
      io?.to(p._id.toString()).emit("jobInvitation", teaserPayload);
      const redactedJob = { ...job.toObject(), address: "[Address Hidden]" };
      inviteTasks.push(sendTeaserInvite(p, redactedJob));

      if (p.expoPushToken) {
        inviteTasks.push(
          sendPushNotification({
            to: p.expoPushToken,
            sound: "default",
            title: "Blinqfix sent you a New Emergency Job",
            body: "Open BlinqFix to view the job details.",
            data: {
              jobId: jobIdStr,
              clickable: teaserPayload.clickable,
              type: "jobInvite",
            },
          })
        );
      }

      if (p.phone) {
        inviteTasks.push(
          sendSMS(
            p.phone,
            `🚨 Blinqfix: New Emergency Job! Open the app to review and accept (ID: ${jobIdStr}).`
          )
        );
      }
    }

    for (const p of hybrid) {
      io?.to(p._id.toString()).emit("jobInvitation", {
        jobId: jobIdStr,
        invitationExpiresAt: expiresAt,
        clickable: true,
      });
      inviteTasks.push(sendInAppInvite(p, job));

      if (p.expoPushToken) {
        inviteTasks.push(
          sendPushNotification({
            to: p.expoPushToken,
            sound: "default",
            title: "Blinqfix sent you a New Emergency Job",
            body: "Check BlinqFix for the details.",
            data: {
              jobId: jobIdStr,
              clickable: true,
              type: "jobInvite",
            },
          })
        );
      }

      if (p.phone) {
        inviteTasks.push(
          sendSMS(
            p.phone,
            `🚨 Blinqfix Alert! A new job (ID: ${jobIdStr}) is available. Check the app.`
          )
        );
      }
    }

    await Promise.allSettled(inviteTasks);
    console.log(`✅ All invites sent for job ${job._id} - Phase ${phase}`);

    if (phase < 5) {
      console.log(`⏳ Scheduling next phase (${phase + 1}) in ${tier.durationMs / 1000}s`);
      setTimeout(async () => {
        try {
          const latest = await mongoose.model("Job").findById(job._id);
          if (!latest || latest.status === "accepted" || latest.acceptedProvider) {
            console.log(`🛑 Job ${job._id} already accepted. Stopping escalation.`);
            return;
          }
          invitePhaseOne(latest, null, io, phase + 1);
        } catch (err) {
          console.error("❌ Escalation error:", err);
        }
      }, tier.durationMs);
    } else {
      console.log(`🎯 Final phase reached for job ${job._id}. No further escalation.`);
    }
  } catch (err) {
    console.error("❌ invitePhaseOne critical error:", err);
  }
}

//nope
// invitePhaseOne.js (updated with original structure preserved)
// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import sendPushNotification from "../utils/sendPushNotification.js";
// import Users from "../models/Users.js";
// import mongoose from "mongoose";

// const MILES_TO_METERS = 1609.34;
// const RADIUS_TIERS = [
//   { miles: 5, durationMs: 60 * 1000 },
//   { miles: 15, durationMs: 3 * 60 * 1000 },
//   { miles: 30, durationMs: 5 * 60 * 1000 },
//   { miles: 50, durationMs: 5 * 60 * 1000 },
// ];

// export async function invitePhaseOne(job, customer, io, phase = 1) {
//   try {
//     console.log(`📣 invitePhaseOne: Starting Phase ${phase} for job ${job._id}`);

//     if (!job || job.status === "accepted" || job.acceptedProvider) {
//       console.log("✅ Job already accepted. Skipping invite phase.");
//       return;
//     }

//     const location = job.location;
//     if (!location?.coordinates || location.coordinates.length !== 2) {
//       console.warn("❌ Invalid job location. Skipping invite.", location);
//       return;
//     }

//     const tier = RADIUS_TIERS[Math.min(phase - 1, RADIUS_TIERS.length - 1)];
//     const expiresAt = new Date(Date.now() + tier.durationMs);

//     let allProviders = [];
//     if (phase === 1) {
//       allProviders = await Users.find({
//         role: "serviceProvider",
//         isActive: true,
//         serviceType: job.serviceType,
//         serviceZipcode: job.serviceZipcode,
//         _id: { $nin: job.cancelledProviders || [] },
//       }).lean();
//     } else {
//       const maxMeters = tier.miles * MILES_TO_METERS;
//       allProviders = await Users.find({
//         role: "serviceProvider",
//         isActive: true,
//         serviceType: job.serviceType,
//         location: {
//           $nearSphere: {
//             $geometry: location,
//             $maxDistance: maxMeters,
//           },
//         },
//         _id: { $nin: job.cancelledProviders || [] },
//       }).lean();
//     }

//     const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
//     const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);
//     const jobIdStr = job._id.toString();

//     job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
//     job.invitationPhase = phase;
//     job.invitationExpiresAt = expiresAt;
//     await job.save();

//     const tasks = [];

//     for (const p of profit) {
//       const redactedJob = { ...job.toObject(), address: "[Hidden]" };
//       const teaserPayload = {
//         jobId: jobIdStr,
//         invitationExpiresAt: expiresAt,
//         clickable: phase >= 5,
//       };
//       io.to(p._id.toString()).emit("jobInvitation", teaserPayload);
//       tasks.push(sendTeaserInvite(p, redactedJob));
//       if (p.expoPushToken) {
//         tasks.push(
//           sendPushNotification({
//             to: p.expoPushToken,
//             sound: "default",
//             title: "🚨 New Emergency Job",
//             body: "Tap to review job opportunity.",
//             data: { jobId: jobIdStr, type: "jobInvite", clickable: teaserPayload.clickable },
//           })
//         );
//       }
//       if (p.phone) {
//         tasks.push(sendSMS(p.phone, `BlinqFix Alert: Emergency job ID ${jobIdStr} nearby! Open the app to view.`));
//       }
//     }

//     for (const p of hybrid) {
//       const hybridPayload = {
//         jobId: jobIdStr,
//         invitationExpiresAt: expiresAt,
//         clickable: true,
//       };
//       io.to(p._id.toString()).emit("jobInvitation", hybridPayload);
//       tasks.push(sendInAppInvite(p, job));
//       if (p.expoPushToken) {
//         tasks.push(
//           sendPushNotification({
//             to: p.expoPushToken,
//             sound: "default",
//             title: "🚨 New Emergency Job",
//             body: "Tap to view and accept.",
//             data: { jobId: jobIdStr, type: "jobInvite", clickable: true },
//           })
//         );
//       }
//       if (p.phone) {
//         tasks.push(sendSMS(p.phone, `🚨 Emergency job alert! ID ${jobIdStr} available. Check BlinqFix now.`));
//       }
//     }

//     await Promise.allSettled(tasks);
//     console.log(`✅ Phase ${phase} invites dispatched.`);

//     if (phase < 5) {
//       console.log(`⏳ Scheduling Phase ${phase + 1}`);
//       setTimeout(async () => {
//         const latest = await mongoose.model("Job").findById(job._id);
//         if (latest.status === "accepted" || latest.acceptedProvider) {
//           console.log("🚫 Job accepted before next phase. Aborting further invites.");
//           return;
//         }
//         invitePhaseOne(latest, customer, io, phase + 1);
//       }, tier.durationMs);
//     }
//   } catch (err) {
//     console.error("❌ Error in invitePhaseOne:", err);
//   }
// }
