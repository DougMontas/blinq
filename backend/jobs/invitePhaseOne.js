// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import sendPushNotification from "../utils/sendPushNotification.js";
// import Users from "../models/Users.js";
// import mongoose from "mongoose";

// const MILES_TO_METERS = 1609.34;
// const RADIUS_TIERS = [
//   { miles: 5, durationMs: 5 * 60 * 1000 },
//   { miles: 15, durationMs: 5 * 60 * 1000 },
//   { miles: 30, durationMs: 5 * 60 * 1000 },
//   { miles: 50, durationMs: 5 * 60 * 1000 },
// ];

// export async function invitePhaseOne(job, customer, io, phase = 1) {
//   try {
//     console.log(
//       `\u{1F4E3} invitePhaseOne: Starting Phase ${phase} for job ${job._id}`
//     );

//     if (!job || job.status === "accepted" || job.acceptedProvider) {
//       console.log("\u{2705} Job already accepted. Skipping invite phase.");
//       return;
//     }

//     const location = job.location;
//     if (!location?.coordinates || location.coordinates.length !== 2) {
//       console.warn("\u{274C} Invalid job location. Skipping invite.", location);
//       return;
//     }

//     const tier = RADIUS_TIERS[Math.min(phase - 1, RADIUS_TIERS.length - 1)];
//     const expiresAt = new Date(Date.now() + tier.durationMs);

//     const excludeIds = job.cancelledProviders?.map((id) => id.toString()) || [];
//     let allProviders = [];

//     if (phase === 1) {
//       // Phase 1: match by zipcode
//       allProviders = await Users.find({
//         role: "serviceProvider",
//         isActive: true,
//         serviceType: job.serviceType,
//         serviceZipcode: job.serviceZipcode,
//         _id: { $nin: excludeIds },
//       }).lean();
//     } else {
//       // Phase 2+: match by radius regardless of zipcode
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
//         _id: { $nin: excludeIds },
//       }).lean();
//     }

//     const hybrid = getEligibleProviders(
//       allProviders,
//       "hybrid",
//       job.serviceZipcode
//     );
//     const profit = getEligibleProviders(
//       allProviders,
//       "profit_sharing",
//       job.serviceZipcode
//     );

//     const jobIdStr = job._id.toString();
//     job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
//     job.invitationPhase = phase;
//     job.invitationExpiresAt = expiresAt;
//     await job.save();

//     const tasks = [];

//     for (const p of profit) {
//       if (excludeIds.includes(p._id.toString())) continue;
//       const teaserPayload = {
//         jobId: jobIdStr,
//         invitationExpiresAt: expiresAt,
//         clickable: phase >= 5,
//       };
//       io.to(p._id.toString()).emit("jobInvitation", teaserPayload);
//       tasks.push(
//         sendTeaserInvite(p, { ...job.toObject(), address: "[Hidden]" })
//       );

//       if (typeof p.expoPushToken === "string") {
//         tasks.push(
//           sendPushNotification({
//             to: p.expoPushToken,
//             title: "\u{1F6A8} New Emergency Job",
//             body: "Tap to view teaser.",
//             data: { jobId: jobIdStr, type: "jobInvite", clickable: phase >= 5 },
//           })
//         );
//       }

//       if (p.phone) {
//         tasks.push(
//           sendSMS(
//             p.phone,
//             `BlinqFix Teaser: Emergency job ID ${jobIdStr}. Open app to learn more.`
//           )
//         );
//       }
//     }

//     for (const p of hybrid) {
//       if (excludeIds.includes(p._id.toString())) continue;
//       const payload = {
//         jobId: jobIdStr,
//         invitationExpiresAt: expiresAt,
//         clickable: true,
//       };
//       io.to(p._id.toString()).emit("jobInvitation", payload);
//       tasks.push(sendInAppInvite(p, job));

//       if (typeof p.expoPushToken === "string") {
//         tasks.push(
//           sendPushNotification({
//             to: p.expoPushToken,
//             title: "\u{1F6A8} New Emergency Job",
//             body: "Tap to accept now!",
//             data: { jobId: jobIdStr, type: "jobInvite", clickable: true },
//           })
//         );
//       }

//       if (p.phone) {
//         tasks.push(
//           sendSMS(
//             p.phone,
//             `\u{1F4E2} BlinqFix Alert: New job ID ${jobIdStr} available! Tap to accept.`
//           )
//         );
//       }
//     }

//     await Promise.allSettled(tasks);
//     console.log(`\u{2705} Phase ${phase} invites dispatched.`);

//     if (phase < 5) {
//       console.log(`\u{23F3} Scheduling Phase ${phase + 1}`);
//       setTimeout(async () => {
//         const latest = await mongoose.model("Job").findById(job._id);
//         if (latest.status === "accepted" || latest.acceptedProvider) {
//           console.log("\u{1F6D1} Job already accepted. Ending invites.");
//           return;
//         }
//         invitePhaseOne(latest, customer, io, phase + 1);
//       }, tier.durationMs);
//     }
//   } catch (err) {
//     console.error("\u{274C} Error in invitePhaseOne:", err);
//   }
// }

// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import sendPushNotification from "../utils/sendPushNotification.js";
// import Users from "../models/Users.js";
// import mongoose from "mongoose";

// const MILES_TO_METERS = 1609.34;
// const RADIUS_TIERS = [
//   { miles: 5, durationMs: 5 * 60 * 1000 },
//   { miles: 15, durationMs: 5 * 60 * 1000 },
//   { miles: 30, durationMs: 5 * 60 * 1000 },
//   { miles: 50, durationMs: 5 * 60 * 1000 },
// ];

// // ⬇️ we keep one extra "final phase" after the radius tiers
// const FINAL_PHASE = RADIUS_TIERS.length + 1; // e.g., 5

// export async function invitePhaseOne(job, customer, io, phase = 1) {
//   try {
//     console.log(`📣 invitePhaseOne: Starting Phase ${phase} for job ${job?._id}`);

//     // Guard: invalid job or already accepted
//     if (!job || job.status === "accepted" || job.acceptedProvider) {
//       console.log("✅ Job already accepted. Skipping invite phase.");
//       return;
//     }

//     const location = job.location;
//     if (!location?.coordinates || location.coordinates.length !== 2) {
//       console.warn("❌ Invalid job location. Skipping invite.", location);
//       return;
//     }

//     // Phase timing + expiry
//     const tierIdx = Math.min(phase - 1, RADIUS_TIERS.length - 1);
//     const tier = RADIUS_TIERS[tierIdx];
//     const expiresAt = new Date(Date.now() + tier.durationMs);

//     // Build exclude set: cancelled + already invited (avoid spamming across phases)
//     const previouslyInvited = new Set((job.invitedProviders || []).map((id) => id.toString()));
//     const cancelled = new Set((job.cancelledProviders || []).map((id) => id.toString()));
//     const excludeIds = new Set([...previouslyInvited, ...cancelled]);
//     const excludeArray = Array.from(excludeIds);

//     // ---------- Query pools ----------
//     // 1) HYBRID candidates: phase 1 by zipcode; phase >=2 by radius
//     let hybridPool = [];
//     if (phase === 1) {
//       hybridPool = await Users.find({
//         role: "serviceProvider",
//         isActive: true,
//         serviceType: job.serviceType,
//         serviceZipcode: job.serviceZipcode,
//         _id: { $nin: excludeArray },
//       }).lean();
//     } else {
//       const maxMeters = tier.miles * MILES_TO_METERS;
//       hybridPool = await Users.find({
//         role: "serviceProvider",
//         isActive: true,
//         serviceType: job.serviceType,
//         location: {
//           $nearSphere: {
//             $geometry: location, // GeoJSON: { type: "Point", coordinates: [lng, lat] }
//             $maxDistance: maxMeters,
//           },
//         },
//         _id: { $nin: excludeArray },
//       }).lean();
//     }

//     // 2) PROFIT-SHARING candidates: ALWAYS global (category-only), regardless of distance/zip
//     //    (still only active service pros)
//     const profitPool = await Users.find({
//       role: "serviceProvider",
//       isActive: true,
//       serviceType: job.serviceType,
//       _id: { $nin: excludeArray },
//     }).lean();

//     // ---------- Split cohorts ----------
//     const hybrid = getEligibleProviders(hybridPool, "hybrid", job.serviceZipcode);
//     const profit = getEligibleProviders(profitPool, "profit_sharing", job.serviceZipcode);

//     // ---------- Persist invite bookkeeping ----------
//     const jobIdStr = job._id.toString();
//     const invitedThisPhaseIds = [...hybrid, ...profit].map((p) => p._id.toString());
//     const mergedInviteIds = Array.from(new Set([...(job.invitedProviders || []), ...invitedThisPhaseIds]));

//     job.invitedProviders = mergedInviteIds;
//     job.invitationPhase = phase;
//     job.invitationExpiresAt = expiresAt;
//     await job.save();

//     // ---------- Fan-out sends ----------
//     const tasks = [];

//     // Profit-sharing: teaser to ALL active providers in this category (global).
//     // Becomes clickable ONLY in the final phase.
//     const profitClickable = phase >= FINAL_PHASE;
//     for (const p of profit) {
//       const id = p._id.toString();
//       if (excludeIds.has(id)) continue;

//       const teaserPayload = {
//         jobId: jobIdStr,
//         invitationExpiresAt: expiresAt,
//         clickable: profitClickable,
//         buttonsActive: profitClickable, // for client compatibility
//       };

//       io.to(id).emit("jobInvitation", teaserPayload);
//       tasks.push(sendTeaserInvite(p, { ...job.toObject(), address: "[Hidden]" }));

//       if (typeof p.expoPushToken === "string") {
//         tasks.push(
//           sendPushNotification({
//             to: p.expoPushToken,
//             title: "🚨 New Emergency Job",
//             body: profitClickable ? "Tap to view & accept." : "Tap to view teaser.",
//             data: { jobId: jobIdStr, type: "jobInvite", clickable: profitClickable },
//           })
//         );
//       }

//       if (p.phone) {
//         tasks.push(
//           sendSMS(
//             p.phone,
//             profitClickable
//               ? `BlinqFix: Job ${jobIdStr} — open the app to accept now.`
//               : `BlinqFix Teaser: Emergency job ${jobIdStr}. Open the app to learn more.`
//           )
//         );
//       }
//     }

//     // Hybrid: location-gated, always clickable
//     for (const p of hybrid) {
//       const id = p._id.toString();
//       if (excludeIds.has(id)) continue;

//       const payload = {
//         jobId: jobIdStr,
//         invitationExpiresAt: expiresAt,
//         clickable: true,
//         buttonsActive: true,
//       };

//       io.to(id).emit("jobInvitation", payload);
//       tasks.push(sendInAppInvite(p, job));

//       if (typeof p.expoPushToken === "string") {
//         tasks.push(
//           sendPushNotification({
//             to: p.expoPushToken,
//             title: "🚨 New Emergency Job",
//             body: "Tap to accept now!",
//             data: { jobId: jobIdStr, type: "jobInvite", clickable: true },
//           })
//         );
//       }

//       if (p.phone) {
//         tasks.push(sendSMS(p.phone, `📢 BlinqFix: New job ${jobIdStr} available! Tap to accept.`));
//       }
//     }

//     await Promise.allSettled(tasks);
//     console.log(`✅ Phase ${phase} invites dispatched (hybrid: ${hybrid.length}, profit: ${profit.length}).`);

//     // ---------- Next phase scheduling ----------
//     if (phase < FINAL_PHASE) {
//       console.log(`⏳ Scheduling Phase ${phase + 1}`);
//       setTimeout(async () => {
//         const latest = await mongoose.model("Job").findById(job._id);
//         if (!latest) return;
//         if (latest.status === "accepted" || latest.acceptedProvider) {
//           console.log("🛑 Job already accepted. Ending invites.");
//           return;
//         }
//         invitePhaseOne(latest, customer, io, phase + 1);
//       }, tier.durationMs);
//     }
//   } catch (err) {
//     console.error("❌ Error in invitePhaseOne:", err);
//   }
// }


// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import sendPushNotification from "../utils/sendPushNotification.js";
// import Users from "../models/Users.js";
// import mongoose from "mongoose";

// const MILES_TO_METERS = 1609.34;
// const RADIUS_TIERS = [
//   { miles: 5,  durationMs: 5 * 60 * 1000 },
//   { miles: 15, durationMs: 5 * 60 * 1000 },
//   { miles: 30, durationMs: 5 * 60 * 1000 },
//   { miles: 50, durationMs: 5 * 60 * 1000 },
// ];

// const FINAL_PHASE = RADIUS_TIERS.length + 1; // phase 5

// export async function invitePhaseOne(job, customer, io, phase = 1) {
//   try {
//     console.log(`📣 invitePhaseOne: Phase ${phase} for job ${job?._id}`);

//     if (!job || job.status === "accepted" || job.acceptedProvider) {
//       console.log("✅ Job already accepted. Skipping.");
//       return;
//     }

//     const location = job.location;
//     if (!location?.coordinates || location.coordinates.length !== 2) {
//       console.warn("❌ Invalid job location. Skipping invite.", location);
//       return;
//     }

//     // phase timing + expiry
//     const tierIdx = Math.min(phase - 1, RADIUS_TIERS.length - 1);
//     const tier = RADIUS_TIERS[tierIdx];
//     const expiresAt = new Date(Date.now() + tier.durationMs);

//     // avoid re-inviting/cancelled
//     const previouslyInvited = new Set((job.invitedProviders || []).map((id) => id.toString()));
//     const cancelled = new Set((job.cancelledProviders || []).map((id) => id.toString()));
//     const excludeIds = new Set([...previouslyInvited, ...cancelled]);
//     const excludeArray = Array.from(excludeIds);

//     // HYBRID candidates (zip in phase 1, radius later)
//     let hybridPool = [];
//     if (phase === 1) {
//       hybridPool = await Users.find({
//         role: "serviceProvider",
//         isActive: true,
//         serviceType: job.serviceType,
//         serviceZipcode: job.serviceZipcode,
//         _id: { $nin: excludeArray },
//       }).lean();
//     } else {
//       const maxMeters = tier.miles * MILES_TO_METERS;
//       hybridPool = await Users.find({
//         role: "serviceProvider",
//         isActive: true,
//         serviceType: job.serviceType,
//         location: {
//           $nearSphere: { $geometry: location, $maxDistance: maxMeters },
//         },
//         _id: { $nin: excludeArray },
//       }).lean();
//     }

//     // PROFIT-SHARING candidates (GLOBAL: active + same category ONLY)
//     const profitPool = await Users.find({
//       role: "serviceProvider",
//       isActive: true,
//       serviceType: job.serviceType,
//       _id: { $nin: excludeArray },
//     }).lean();

//     // Split cohorts
//     const hybrid = getEligibleProviders(hybridPool, "hybrid", job.serviceZipcode);

//     // 🚫 IMPORTANT: do NOT pass ZIP for profit_sharing (avoid unintended ZIP gating)
//     let profit = getEligibleProviders(profitPool, "profit_sharing");

//     // Fallback in case the helper still zip-filters internally
//     if (!profit?.length) {
//       const isProfit = (p) => {
//         const val = String(
//           p.payoutModel || p.contractType || p.planType || p.billingModel || ""
//         ).toLowerCase();
//         return val.includes("profit"); // match "profit_sharing", "profit-share", etc.
//       };
//       profit = profitPool.filter(isProfit);
//     }

//     console.log(
//       `ℹ️ Pools — hybridPool:${hybridPool.length}, profitPool:${profitPool.length} → hybrid:${hybrid.length}, profit:${profit.length}`
//     );

//     // Persist invite bookkeeping
//     const jobIdStr = job._id.toString();
//     const invitedThisPhaseIds = [...hybrid, ...profit].map((p) => p._id.toString());
//     const mergedInviteIds = Array.from(new Set([...(job.invitedProviders || []), ...invitedThisPhaseIds]));
//     job.invitedProviders = mergedInviteIds;
//     job.invitationPhase = phase;
//     job.invitationExpiresAt = expiresAt;
//     await job.save();

//     // Fan-out
//     const tasks = [];

//     // Profit-sharing: teaser; clickable only in final phase
//     const profitClickable = phase >= FINAL_PHASE;
//     for (const p of profit) {
//       const id = p._id.toString();
//       if (excludeIds.has(id)) continue;

//       const teaserPayload = {
//         jobId: jobIdStr,
//         invitationExpiresAt: expiresAt,
//         clickable: profitClickable,
//         buttonsActive: profitClickable,
//       };

//       io.to(id).emit("jobInvitation", teaserPayload);
//       tasks.push(sendTeaserInvite(p, { ...job.toObject(), address: "[Hidden]" }));

//       if (typeof p.expoPushToken === "string") {
//         tasks.push(
//           sendPushNotification({
//             to: p.expoPushToken,
//             title: "🚨 New Emergency Job",
//             body: profitClickable ? "Tap to view & accept." : "Tap to view teaser.",
//             data: { jobId: jobIdStr, type: "jobInvite", clickable: profitClickable },
//           })
//         );
//       }

//       if (p.phone) {
//         tasks.push(
//           sendSMS(
//             p.phone,
//             profitClickable
//               ? `BlinqFix: Job ${jobIdStr} — open the app to accept now.`
//               : `BlinqFix Teaser: Emergency job ${jobIdStr}. Open the app to learn more.`
//           )
//         );
//       }
//     }

//     // Hybrid: always clickable
//     for (const p of hybrid) {
//       const id = p._id.toString();
//       if (excludeIds.has(id)) continue;

//       const payload = {
//         jobId: jobIdStr,
//         invitationExpiresAt: expiresAt,
//         clickable: true,
//         buttonsActive: true,
//       };

//       io.to(id).emit("jobInvitation", payload);
//       tasks.push(sendInAppInvite(p, job));

//       if (typeof p.expoPushToken === "string") {
//         tasks.push(
//           sendPushNotification({
//             to: p.expoPushToken,
//             title: "🚨 New Emergency Job",
//             body: "Tap to accept now!",
//             data: { jobId: jobIdStr, type: "jobInvite", clickable: true },
//           })
//         );
//       }

//       if (p.phone) {
//         tasks.push(sendSMS(p.phone, `📢 BlinqFix: New job ${jobIdStr} available! Tap to accept.`));
//       }
//     }

//     await Promise.allSettled(tasks);
//     console.log(`✅ Phase ${phase} invites sent — hybrid:${hybrid.length}, profit:${profit.length}`);

//     // Next phase
//     if (phase < FINAL_PHASE) {
//       console.log(`⏳ Scheduling phase ${phase + 1}`);
//       setTimeout(async () => {
//         const latest = await mongoose.model("Job").findById(job._id);
//         if (!latest) return;
//         if (latest.status === "accepted" || latest.acceptedProvider) {
//           console.log("🛑 Job accepted. Stopping invites.");
//           return;
//         }
//         invitePhaseOne(latest, customer, io, phase + 1);
//       }, tier.durationMs);
//     }
//   } catch (err) {
//     console.error("❌ Error in invitePhaseOne:", err);
//   }
// }


// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import sendPushNotification from "../utils/sendPushNotification.js";
// import Users from "../models/Users.js";
// import mongoose from "mongoose";

// const MILES_TO_METERS = 1609.34;
// const RADIUS_TIERS = [
//   { miles: 5,  durationMs: 5 * 60 * 1000 },
//   { miles: 15, durationMs: 5 * 60 * 1000 },
//   { miles: 30, durationMs: 5 * 60 * 1000 },
//   { miles: 50, durationMs: 5 * 60 * 1000 },
// ];

// const FINAL_PHASE = RADIUS_TIERS.length + 1; // e.g. 5

// export async function invitePhaseOne(job, customer, io, phase = 1) {
//   try {
//     console.log(`📣 invitePhaseOne: Phase ${phase} for job ${job?._id}`);

//     if (!job || job.status === "accepted" || job.acceptedProvider) {
//       console.log("✅ Job already accepted. Skipping.");
//       return;
//     }

//     const location = job.location;
//     if (!location?.coordinates || location.coordinates.length !== 2) {
//       console.warn("❌ Invalid job location. Skipping invite.", location);
//       return;
//     }

//     const idx = Math.min(phase - 1, RADIUS_TIERS.length - 1);
//     const tier = RADIUS_TIERS[idx];
//     const expiresAt = new Date(Date.now() + tier.durationMs);

//     // ⛔ Exclude cancelled AND already-invited to prevent hybrid “real” re-invites
//     const previouslyInvited = new Set((job.invitedProviders || []).map((id) => id.toString()));
//     const cancelled = new Set((job.cancelledProviders || []).map((id) => id.toString()));
//     const excludeIds = new Set([...previouslyInvited, ...cancelled]);
//     const excludeArray = Array.from(excludeIds);

//     // HYBRID pool = ZIP in phase 1, radius in later phases
//     let hybridPool = [];
//     if (phase === 1) {
//       hybridPool = await Users.find({
//         role: "serviceProvider",
//         isActive: true,
//         serviceType: job.serviceType,
//         serviceZipcode: job.serviceZipcode,
//         _id: { $nin: excludeArray },
//       }).lean();
//     } else {
//       const maxMeters = tier.miles * MILES_TO_METERS;
//       hybridPool = await Users.find({
//         role: "serviceProvider",
//         isActive: true,
//         serviceType: job.serviceType,
//         location: {
//           $nearSphere: { $geometry: location, $maxDistance: maxMeters },
//         },
//         _id: { $nin: excludeArray },
//       }).lean();
//     }

//     // PROFIT-SHARING pool = GLOBAL (active + same category only)
//     const profitPool = await Users.find({
//       role: "serviceProvider",
//       isActive: true,
//       serviceType: job.serviceType,
//       _id: { $nin: excludeArray },
//     }).lean();

//     // Split cohorts
//     const hybridRaw = getEligibleProviders(hybridPool, "hybrid", job.serviceZipcode);

//     // 🚫 Do NOT pass ZIP for profit_sharing (avoid accidental ZIP gating)
//     let profit = getEligibleProviders(profitPool, "profit_sharing");

//     // Fallback if helper is too strict: detect profit by common fields
//     if (!profit?.length) {
//       const isProfit = (p) =>
//         String(p.payoutModel || p.contractType || p.planType || p.billingModel || "")
//           .toLowerCase()
//           .includes("profit");
//       profit = profitPool.filter(isProfit);
//     }

//     // 🔒 Make cohorts disjoint: remove any profit IDs from hybrid
//     const profitIds = new Set(profit.map((p) => p._id.toString()));
//     const hybrid = hybridRaw.filter((p) => !profitIds.has(p._id.toString()));

//     console.log(
//       `ℹ️ Pools — hybridPool:${hybridPool.length}, profitPool:${profitPool.length} → hybrid:${hybrid.length}, profit:${profit.length}`
//     );

//     // Persist invite bookkeeping (also prevents re-invites next phases)
//     const jobIdStr = job._id.toString();
//     const invitedThisPhaseIds = [...hybrid, ...profit].map((p) => p._id.toString());
//     job.invitedProviders = Array.from(
//       new Set([...(job.invitedProviders || []).map(String), ...invitedThisPhaseIds])
//     );
//     job.invitationPhase = phase;
//     job.invitationExpiresAt = expiresAt;
//     await job.save();

//     // Fan-out
//     const tasks = [];

//     // Profit-sharing: teaser only (not clickable) until FINAL_PHASE
//     const profitClickable = phase >= FINAL_PHASE;
//     for (const p of profit) {
//       const id = p._id.toString();
//       if (excludeIds.has(id)) continue;

//       const teaserPayload = {
//         jobId: jobIdStr,
//         invitationExpiresAt: expiresAt,
//         clickable: profitClickable,      // false before final
//         buttonsActive: profitClickable,  // false before final
//       };

//       io.to(id).emit("jobInvitation", teaserPayload);
//       tasks.push(
//         sendTeaserInvite(p, { ...job.toObject(), address: "[Hidden]" })
//       );

//       if (typeof p.expoPushToken === "string") {
//         tasks.push(
//           sendPushNotification({
//             to: p.expoPushToken,
//             title: "🚨 New Emergency Job",
//             body: profitClickable ? "Tap to view & accept." : "Tap to view teaser.",
//             data: { jobId: jobIdStr, type: "jobInvite", clickable: profitClickable },
//           })
//         );
//       }

//       if (p.phone) {
//         tasks.push(
//           sendSMS(
//             p.phone,
//             profitClickable
//               ? `BlinqFix: Job ${jobIdStr} — open the app to accept now.`
//               : `BlinqFix Teaser: Emergency job ${jobIdStr}. Open the app to learn more.`
//           )
//         );
//       }
//     }

//     // Hybrid: always real invite (clickable)
//     for (const p of hybrid) {
//       const id = p._id.toString();
//       if (excludeIds.has(id)) continue; // still guard

//       const payload = {
//         jobId: jobIdStr,
//         invitationExpiresAt: expiresAt,
//         clickable: true,
//         buttonsActive: true,
//       };

//       io.to(id).emit("jobInvitation", payload);
//       tasks.push(sendInAppInvite(p, job));

//       if (typeof p.expoPushToken === "string") {
//         tasks.push(
//           sendPushNotification({
//             to: p.expoPushToken,
//             title: "🚨 New Emergency Job",
//             body: "Tap to accept now!",
//             data: { jobId: jobIdStr, type: "jobInvite", clickable: true },
//           })
//         );
//       }

//       if (p.phone) {
//         tasks.push(
//           sendSMS(p.phone, `📢 BlinqFix: New job ${jobIdStr} available! Tap to accept.`)
//         );
//       }
//     }

//     await Promise.allSettled(tasks);
//     console.log(`✅ Phase ${phase} invites sent — hybrid:${hybrid.length}, profit:${profit.length}`);

//     // Next phase schedule
//     if (phase < FINAL_PHASE) {
//       console.log(`⏳ Scheduling phase ${phase + 1}`);
//       setTimeout(async () => {
//         const latest = await mongoose.model("Job").findById(job._id);
//         if (!latest) return;
//         if (latest.status === "accepted" || latest.acceptedProvider) {
//           console.log("🛑 Job accepted. Stopping invites.");
//           return;
//         }
//         invitePhaseOne(latest, customer, io, phase + 1);
//       }, tier.durationMs);
//     }
//   } catch (err) {
//     console.error("❌ Error in invitePhaseOne:", err);
//   }
// }

// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import sendPushNotification from "../utils/sendPushNotification.js";
// import Users from "../models/Users.js";
// import mongoose from "mongoose";

// const MILES_TO_METERS = 1609.34;
// const RADIUS_TIERS = [
//   { miles: 5,  durationMs: 5 * 60 * 1000 },
//   { miles: 15, durationMs: 5 * 60 * 1000 },
//   { miles: 30, durationMs: 5 * 60 * 1000 },
//   { miles: 50, durationMs: 5 * 60 * 1000 },
// ];

// // profit_sharing NEVER becomes clickable
// const PROFIT_SHARING_CLICKABLE = false;

// function isProfitSharing(p) {
//   const v = String(
//     p.payoutModel || p.contractType || p.planType || p.billingModel || p.inviteCohort || ""
//   ).toLowerCase();
//   return v.includes("profit");
// }

// export async function invitePhaseOne(job, customer, io, phase = 1) {
//   try {
//     console.log(`📣 invitePhaseOne: Phase ${phase} for job ${job?._id}`);

//     if (!job || job.status === "accepted" || job.acceptedProvider) {
//       console.log("✅ Job already accepted. Skipping.");
//       return;
//     }

//     const loc = job.location;
//     if (!loc?.coordinates || loc.coordinates.length !== 2) {
//       console.warn("❌ Invalid job location. Skipping invites.", loc);
//       return;
//     }

//     const idx = Math.min(phase - 1, RADIUS_TIERS.length - 1);
//     const tier = RADIUS_TIERS[idx];
//     const expiresAt = new Date(Date.now() + tier.durationMs);

//     // Exclusions: cancelled + already invited (no double invites across phases)
//     const prevInvited = new Set((job.invitedProviders || []).map((id) => id.toString()));
//     const cancelled   = new Set((job.cancelledProviders || []).map((id) => id.toString()));
//     const excludeIds  = new Set([...prevInvited, ...cancelled]);
//     const excludeArr  = Array.from(excludeIds);

//     // 1) Build a base pool for this CATEGORY (serviceType) & active
//     const baseQuery = {
//       role: "serviceProvider",
//       isActive: true,
//       serviceType: job.serviceType,
//       _id: { $nin: excludeArr },
//     };

//     // 2) PROFIT-SHARING cohort (GLOBAL within category) — always teaser
//     const profitPool = await Users.find(baseQuery).lean();
//     const profit = profitPool.filter(isProfitSharing);

//     // 3) HYBRID cohort (within ZIP on phase 1, otherwise radius), EXCLUDING profit_sharing
//     let hybridPool = [];
//     if (phase === 1) {
//       hybridPool = await Users.find({
//         ...baseQuery,
//         serviceZipcode: job.serviceZipcode,
//       }).lean();
//     } else {
//       const maxMeters = tier.miles * MILES_TO_METERS;
//       hybridPool = await Users.find({
//         ...baseQuery,
//         location: {
//           $nearSphere: { $geometry: loc, $maxDistance: maxMeters },
//         },
//       }).lean();
//     }
//     const hybrid = hybridPool.filter((p) => !isProfitSharing(p));

//     // Persist union of invited (append, don't overwrite)
//     const jobIdStr = job._id.toString();
//     const invitedThisPhase = [...profit, ...hybrid].map((p) => p._id.toString());
//     job.invitedProviders = Array.from(new Set([...(job.invitedProviders || []).map(String), ...invitedThisPhase]));
//     job.invitationPhase = phase;
//     job.invitationExpiresAt = expiresAt;
//     await job.save();

//     const tasks = [];

//     // ---- PROFIT-SHARING: TEASER ONLY (never clickable), address hidden ----
//     for (const p of profit) {
//       const id = p._id.toString();
//       if (excludeIds.has(id)) continue;

//       const teaserPayload = {
//         jobId: jobIdStr,
//         invitationExpiresAt: expiresAt,
//         clickable: PROFIT_SHARING_CLICKABLE, // always false
//         buttonsActive: PROFIT_SHARING_CLICKABLE,
//         cohort: "profit_sharing",
//         inviteKind: "teaser",
//       };

//       io.to(id).emit("jobInvitation", teaserPayload);
//       tasks.push(sendTeaserInvite(p, { ...job.toObject(), address: "[Hidden]" }));

//       if (typeof p.expoPushToken === "string") {
//         tasks.push(
//           sendPushNotification({
//             to: p.expoPushToken,
//             title: "🚨 New Emergency Job",
//             body: "Tap to view teaser.",
//             data: { jobId: jobIdStr, type: "jobInvite", clickable: PROFIT_SHARING_CLICKABLE },
//           })
//         );
//       }

//       if (p.phone) {
//         tasks.push(sendSMS(p.phone, `BlinqFix Teaser: Emergency job ${jobIdStr}. Open the app to learn more.`));
//       }
//     }

//     // ---- HYBRID: REAL INVITE (clickable) ----
//     for (const p of hybrid) {
//       const id = p._id.toString();
//       if (excludeIds.has(id)) continue;

//       const payload = {
//         jobId: jobIdStr,
//         invitationExpiresAt: expiresAt,
//         clickable: true,
//         buttonsActive: true,
//         cohort: "hybrid",
//         inviteKind: "full",
//       };

//       io.to(id).emit("jobInvitation", payload);
//       tasks.push(sendInAppInvite(p, job));

//       if (typeof p.expoPushToken === "string") {
//         tasks.push(
//           sendPushNotification({
//             to: p.expoPushToken,
//             title: "🚨 New Emergency Job",
//             body: "Tap to accept now!",
//             data: { jobId: jobIdStr, type: "jobInvite", clickable: true },
//           })
//         );
//       }

//       if (p.phone) {
//         tasks.push(sendSMS(p.phone, `📢 BlinqFix: New job ${jobIdStr} available! Tap to accept.`));
//       }
//     }

//     await Promise.allSettled(tasks);
//     console.log(`✅ Phase ${phase} invites — hybrid:${hybrid.length}, profit:${profit.length}`);

//     // Schedule next phase until we exhaust tiers
//     if (phase < RADIUS_TIERS.length) {
//       console.log(`⏳ Scheduling phase ${phase + 1}`);
//       setTimeout(async () => {
//         const latest = await mongoose.model("Job").findById(job._id);
//         if (!latest) return;
//         if (latest.status === "accepted" || latest.acceptedProvider) {
//           console.log("🛑 Job accepted. Stopping invites.");
//           return;
//         }
//         invitePhaseOne(latest, customer, io, phase + 1);
//       }, tier.durationMs);
//     }
//   } catch (err) {
//     console.error("❌ Error in invitePhaseOne:", err);
//   }
// }

//latest working
// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import sendPushNotification from "../utils/sendPushNotification.js";
// import Users from "../models/Users.js";
// import mongoose from "mongoose";

// const MILES_TO_METERS = 1609.34;
// const RADIUS_TIERS = [
//   { miles: 5, durationMs: 5 * 60 * 1000 },
//   { miles: 15, durationMs: 5 * 60 * 1000 },
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

//     // NOTE: still excluding only cancelled providers (keeps prior behavior)
//     const excludeIds = job.cancelledProviders?.map((id) => id.toString()) || [];
//     let allProviders = [];

//     if (phase === 1) {
//       // Phase 1: match by zipcode
//       allProviders = await Users.find({
//         role: "serviceProvider",
//         isActive: true,
//         serviceType: job.serviceType,
//         serviceZipcode: job.serviceZipcode,
//         _id: { $nin: excludeIds },
//       }).lean();
//     } else {
//       // Phase 2+: match by radius regardless of zipcode
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
//         _id: { $nin: excludeIds },
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

//     // -------- PROFIT_SHARING → TEASER ONLY (never clickable) ----------
//     for (const p of profit) {
//       if (excludeIds.includes(p._id.toString())) continue;

//       const teaserPayload = {
//         jobId: jobIdStr,
//         invitationExpiresAt: expiresAt,
//         clickable: false,            // 🔒 was: phase >= 5  → ALWAYS false
//         buttonsActive: false,        // 🔒 extra guard for client fallback
//         cohort: "profit_sharing",    // 🧪 debug/telemetry
//         inviteKind: "teaser",        // 🧪 debug/telemetry
//       };

//       io.to(p._id.toString()).emit("jobInvitation", teaserPayload);

//       // Hide address in teaser
//       tasks.push(sendTeaserInvite(p, { ...job.toObject(), address: "[Hidden]" }));

//       if (typeof p.expoPushToken === "string") {
//         tasks.push(
//           sendPushNotification({
//             to: p.expoPushToken,
//             title: "🚨 New Emergency Job",
//             body: "Tap to view teaser.",
//             data: { jobId: jobIdStr, type: "jobInvite", clickable: false },
//           })
//         );
//       }

//       if (p.phone) {
//         tasks.push(
//           sendSMS(p.phone, `BlinqFix Teaser: Emergency job ID ${jobIdStr}. Open app to learn more.`)
//         );
//       }
//     }

//     // -------- HYBRID → FULL INVITE (clickable) ----------
//     for (const p of hybrid) {
//       if (excludeIds.includes(p._id.toString())) continue;

//       const payload = {
//         jobId: jobIdStr,
//         invitationExpiresAt: expiresAt,
//         clickable: true,
//         buttonsActive: true,
//         cohort: "hybrid",
//         inviteKind: "full",
//       };

//       io.to(p._id.toString()).emit("jobInvitation", payload);
//       tasks.push(sendInAppInvite(p, job));

//       if (typeof p.expoPushToken === "string") {
//         tasks.push(
//           sendPushNotification({
//             to: p.expoPushToken,
//             title: "🚨 New Emergency Job",
//             body: "Tap to accept now!",
//             data: { jobId: jobIdStr, type: "jobInvite", clickable: true },
//           })
//         );
//       }

//       if (p.phone) {
//         tasks.push(
//           sendSMS(p.phone, `📢 BlinqFix Alert: New job ID ${jobIdStr} available! Tap to accept.`)
//         );
//       }
//     }

//     await Promise.allSettled(tasks);
//     console.log(`✅ Phase ${phase} invites dispatched.`);

//     if (phase < 5) {
//       console.log(`⏳ Scheduling Phase ${phase + 1}`);
//       setTimeout(async () => {
//         const latest = await mongoose.model("Job").findById(job._id);
//         if (latest.status === "accepted" || latest.acceptedProvider) {
//           console.log("🛑 Job already accepted. Ending invites.");
//           return;
//         }
//         invitePhaseOne(latest, customer, io, phase + 1);
//       }, tier.durationMs);
//     }
//   } catch (err) {
//     console.error("❌ Error in invitePhaseOne:", err);
//   }
// }

//the latest sent trying
import { getEligibleProviders } from "../utils/providerFilters.js";
import sendInAppInvite from "../invites/sendInAppInvite.js";
import sendTeaserInvite from "../invites/sendTeaserInvite.js";
import sendSMS from "../utils/sendSMS.js";
import sendPushNotification from "../utils/sendPushNotification.js";
import Users from "../models/Users.js";
import mongoose from "mongoose";

/* -------------------------------------------------------------------------- */
/*                         PHONE HELPERS (resolve + log)                       */
/* -------------------------------------------------------------------------- */
const PHONE_KEYS = [
  "phone",
  "phoneNumber",
  "mobile",
  "mobileNumber",
  "contactPhone",
  "phone_number",
  "tel",
  "telephone",
];

function maskPhone(p) {
  if (!p) return "-";
  const d = String(p).replace(/\D/g, "");
  if (d.length < 4) return "***";
  return `***${d.slice(-4)}`;
}

function getPhoneWithKey(obj) {
  if (!obj || typeof obj !== "object") return { value: null, key: null };
  for (const k of PHONE_KEYS) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return { value: v.trim(), key: k };
  }
  if (obj.contact?.phone) return { value: String(obj.contact.phone).trim(), key: "contact.phone" };
  if (obj.profile?.phone) return { value: String(obj.profile.phone).trim(), key: "profile.phone" };
  return { value: null, key: null };
}

function toIdString(v) {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if (v._id) return String(v._id);
    if (typeof v.toString === "function") return String(v.toString());
  }
  return null;
}

function extractCustomerId(job, customer) {
  const ids = [];
  const add = (src, val) => { const id = toIdString(val); if (id) ids.push({ src, id }); };
  add("arg.customer._id", customer?._id);
  add("job.customer", job?.customer);
  add("job.customerId", job?.customerId);
  add("job.createdBy", job?.createdBy);
  add("job.owner", job?.owner);
  add("job.ownerId", job?.ownerId);
  add("job.user", job?.user);
  add("job.userId", job?.userId);
  add("job.requester", job?.requester);
  add("job.requesterId", job?.requesterId);
  add("job.customerUserId", job?.customerUserId);
  return ids.length ? ids[0] : null;
}

async function resolveCustomerDoc(job, customer) {
  // If caller already passed a phone-bearing customer, use it.
  const direct = getPhoneWithKey(customer);
  if (direct.value) {
    console.log(`[SMS_DEBUG] customer from arg has ${direct.key} ${maskPhone(direct.value)}`);
    return customer;
  }

  // Try job-level phone first (best effort immediate send)
  const jobLevelPhone = job?.customerPhone || job?.customer_phone || job?.contactPhone;
  if (jobLevelPhone) {
    console.log(`[SMS_DEBUG] customerPhone present on job: ${maskPhone(jobLevelPhone)}`);
    return { _id: null, phone: jobLevelPhone };
  }

  // Fetch by id from job fields
  const cand = extractCustomerId(job, customer);
  if (!cand) {
    console.log("[SMS_DEBUG] no customer id resolvable from job — will skip customer SMS");
    return null;
  }
  try {
    const fresh = await Users.findById(cand.id).select(
      "phone phoneNumber mobile contactPhone optInSms smsPreferences name"
    ).lean();
    if (fresh) {
      const ph = getPhoneWithKey(fresh);
      console.log(
        `[SMS_DEBUG] customer loaded by ${cand.src}=${cand.id} phoneKey=${ph.key} phone=${maskPhone(ph.value)} optIn=${fresh.optInSms}`
      );
    }
    return fresh || null;
  } catch (e) {
    console.warn("[SMS_DEBUG] customer fetch failed:", e?.message || e);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                               CONFIG + TIERS                               */
/* -------------------------------------------------------------------------- */
const MILES_TO_METERS = 1609.34;
const RADIUS_TIERS = [
  { miles: 5, durationMs: 5 * 60 * 1000 },
  { miles: 15, durationMs: 5 * 60 * 1000 },
  { miles: 30, durationMs: 5 * 60 * 1000 },
  { miles: 50, durationMs: 5 * 60 * 1000 },
];

const pid = (p) => (typeof p === "string" ? p : p?._id?.toString?.() || "");

function summarizeSettled(label, settled) {
  const summary = settled.reduce(
    (acc, r) => {
      if (r.status === "fulfilled") acc.fulfilled += 1; else { acc.rejected += 1; acc.errors.push(r.reason?.message || r.reason || "Unknown error"); }
      return acc;
    },
    { fulfilled: 0, rejected: 0, errors: [] }
  );
  console.log(`\n📊 ${label} — fulfilled=${summary.fulfilled}, rejected=${summary.rejected}`);
  if (summary.errors.length) summary.errors.forEach((e, i) => console.warn(`   └─ (${i + 1}) ${e}`));
  return summary;
}

/* -------------------------------------------------------------------------- */
/*                     ORDERED DISPATCH (socket → push → SMS)                  */
/* -------------------------------------------------------------------------- */
async function sendOrderedInvites({ io, provider, payload, jobIdStr, isTeaser, job }) {
  const providerId = pid(provider);
  const cohort = isTeaser ? "profit_sharing" : "hybrid";
  const inviteKind = isTeaser ? "teaser" : "full";

  // socket first
  try {
    io.to(providerId).emit("jobInvitation", payload);
    console.log(`📨 socket → provider=${providerId} cohort=${cohort} kind=${inviteKind} job=${jobIdStr} clickable=${payload.clickable}`);
  } catch (e) {
    console.warn(`⚠️ socket emit failed → provider=${providerId} job=${jobIdStr}:`, e?.message || e);
  }

  const tasks = [];

  try {
    if (isTeaser) tasks.push(sendTeaserInvite(provider, { ...job.toObject?.() ?? job, address: "[Hidden]" }));
    else tasks.push(sendInAppInvite(provider, job));
  } catch (e) {
    console.warn(`⚠️ in-app invite func error → provider=${providerId}:`, e?.message || e);
  }

  // push
  if (typeof provider.expoPushToken === "string" && provider.expoPushToken.trim()) {
    tasks.push(
      sendPushNotification({
        to: provider.expoPushToken,
        title: "🚨 New Emergency Job",
        body: isTeaser ? "Tap to view teaser." : "Tap to accept now!",
        data: { jobId: jobIdStr, type: "jobInvite", clickable: !!payload.clickable },
      }).then(() => console.log(`📲 push ok → provider=${providerId} cohort=${cohort} kind=${inviteKind} job=${jobIdStr}`))
        .catch((e) => console.warn(`📵 push failed → provider=${providerId} job=${jobIdStr}:`, e?.message || e))
    );
  } else {
    console.log(`ℹ️ no push token → provider=${providerId}`);
  }

  // sms
  const ph = getPhoneWithKey(provider);
  if (ph.value) {
    const smsText = isTeaser
      ? `BlinqFix Teaser: Emergency job ID ${jobIdStr}. Open app to learn more.`
      : `📢 BlinqFix Alert: New job ID ${jobIdStr} available! Tap to accept.`;

    tasks.push(
      sendSMS(ph.value, smsText)
        .then(() => console.log(`📟 sms ok → provider=${providerId} phoneKey=${ph.key} phone=${maskPhone(ph.value)} cohort=${cohort} kind=${inviteKind} job=${jobIdStr}`))
        .catch((e) => console.warn(`📴 sms failed → provider=${providerId} phoneKey=${ph.key} phone=${maskPhone(ph.value)} job=${jobIdStr}:`, e?.message || e))
    );
  } else {
    console.log(`ℹ️ no phone on file → provider=${providerId}`);
  }

  const settled = await Promise.allSettled(tasks);
  summarizeSettled(`provider=${providerId} (${cohort}/${inviteKind})`, settled);
}

/* -------------------------------------------------------------------------- */
/*                 CUSTOMER NOTIFY (one SMS per phase, with fallback)          */
/* -------------------------------------------------------------------------- */
async function notifyCustomerForPhase({ job, customer, phase, hybridCount, profitCount, tierMiles, expiresAt }) {
  try {
    job.customerNotifiedPhases = Array.from(new Set([...(job.customerNotifiedPhases || []).map(String)]));
    const already = new Set(job.customerNotifiedPhases);
    if (already.has(String(phase))) {
      console.log(`ℹ️ Customer already notified for phase ${phase}.`);
      return;
    }

    const custDoc = await resolveCustomerDoc(job, customer);
    const ph = getPhoneWithKey(custDoc);
    if (!ph.value) {
      console.log("ℹ️ Customer has no phone on file — skipping customer SMS.");
      return;
    }

    // Optional: honor opt-in flags if present
    if (custDoc?.optInSms === false) {
      console.log("ℹ️ Customer opted out of SMS — skipping.");
      return;
    }
    if (custDoc?.smsPreferences && custDoc.smsPreferences.jobUpdates === false) {
      console.log("ℹ️ Customer disabled jobUpdates SMS — skipping.");
      return;
    }

    const etaMin = Math.max(1, Math.round((expiresAt.getTime() - Date.now()) / 60000));
    const base = phase === 1
      ? `BlinqFix: We’re notifying nearby pros now for your ${job.serviceType} request.`
      : `BlinqFix: Expanding search to ${tierMiles} miles for faster response.`;
    const details = ` Invites sent: ${hybridCount} direct + ${profitCount} teaser. Window ~${etaMin} min.`;
    const msg = `${base}${details}`;

    await sendSMS(ph.value, msg);
    console.log(`👤 customer sms ok → phase=${phase} phoneKey=${ph.key} phone=${maskPhone(ph.value)}`);

    job.customerNotifiedPhases.push(String(phase));
    await job.save();
  } catch (e) {
    console.warn(`⚠️ customer sms failed → phase=${phase}:`, e?.message || e);
  }
}

/* -------------------------------------------------------------------------- */
/*                                MAIN FLOW                                   */
/* -------------------------------------------------------------------------- */
export async function invitePhaseOne(job, customer, io, phase = 1) {
  const startedAt = Date.now();
  try {
    const jobIdStr = job?._id?.toString?.() || "unknown";
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📣 invitePhaseOne: Phase ${phase} for job ${jobIdStr}`);

    if (!job || job.status === "accepted" || job.acceptedProvider) {
      console.log("✅ Job already accepted. Skipping invite phase.");
      return;
    }

    const location = job.location;
    if (!location?.coordinates || location.coordinates.length !== 2) {
      console.warn("❌ Invalid job location. Skipping invite.", location);
      return;
    }

    const tier = RADIUS_TIERS[Math.min(phase - 1, RADIUS_TIERS.length - 1)];
    const expiresAt = new Date(Date.now() + tier.durationMs);

    const excludeIds = new Set((job.cancelledProviders || []).map((id) => id.toString()));
    const invitedAlready = new Set((job.invitedProviders || []).map((id) => id.toString()));

    let allProviders = [];
    if (phase === 1) {
      console.log(`🔍 Phase 1 query → type=${job.serviceType} zipcode=${job.serviceZipcode} exclude=${excludeIds.size}`);
      allProviders = await Users.find({
        role: "serviceProvider",
        isActive: true,
        serviceType: job.serviceType,
        serviceZipcode: job.serviceZipcode,
        _id: { $nin: Array.from(excludeIds) },
      }).select("_id name expoPushToken phone phoneNumber mobile contactPhone location serviceType serviceZipcode").lean();
    } else {
      const maxMeters = tier.miles * MILES_TO_METERS;
      console.log(`🔍 Phase ${phase} radius query → type=${job.serviceType} radius=${tier.miles}mi (${maxMeters.toFixed(0)}m) exclude=${excludeIds.size}`);
      allProviders = await Users.find({
        role: "serviceProvider",
        isActive: true,
        serviceType: job.serviceType,
        location: { $nearSphere: { $geometry: location, $maxDistance: maxMeters } },
        _id: { $nin: Array.from(excludeIds) },
      }).select("_id name expoPushToken phone phoneNumber mobile contactPhone location serviceType serviceZipcode").lean();
    }

    console.log(`👥 matched providers: ${allProviders.length}`);

    const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode) || [];
    const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode) || [];

    const withPhoneCounts = {
      hybrid: hybrid.filter((p) => !!getPhoneWithKey(p).value).length,
      profit: profit.filter((p) => !!getPhoneWithKey(p).value).length,
    };
    console.log(`📞 phone-ready → hybrid=${withPhoneCounts.hybrid}/${hybrid.length}, profit=${withPhoneCounts.profit}/${profit.length}`);

    const newlyInvited = [...hybrid, ...profit].map((p) => pid(p)).filter((id) => id && !invitedAlready.has(id));
    job.invitedProviders = Array.from(new Set([...(job.invitedProviders || []).map(String), ...newlyInvited]));
    job.invitationPhase = phase;
    job.invitationExpiresAt = expiresAt;
    await job.save();
    console.log(`🧾 saved job invitations → phase=${phase}, newlyInvited=${newlyInvited.length}`);

    await notifyCustomerForPhase({ job, customer, phase, hybridCount: hybrid.length, profitCount: profit.length, tierMiles: tier.miles, expiresAt });

    const perProviderPromises = [];
    for (const p of profit) {
      const providerId = pid(p);
      if (!providerId || excludeIds.has(providerId) || invitedAlready.has(providerId)) {
        console.log(`⏭️ skip profit provider=${providerId} (excluded or already invited)`);
        continue;
      }
      const teaserPayload = { jobId: jobIdStr, invitationExpiresAt: expiresAt, clickable: false, buttonsActive: false, cohort: "profit_sharing", inviteKind: "teaser" };
      perProviderPromises.push(sendOrderedInvites({ io, provider: p, payload: teaserPayload, jobIdStr, isTeaser: true, job }));
    }

    for (const p of hybrid) {
      const providerId = pid(p);
      if (!providerId || excludeIds.has(providerId) || invitedAlready.has(providerId)) {
        console.log(`⏭️ skip hybrid provider=${providerId} (excluded or already invited)`);
        continue;
      }
      const payload = { jobId: jobIdStr, invitationExpiresAt: expiresAt, clickable: true, buttonsActive: true, cohort: "hybrid", inviteKind: "full" };
      perProviderPromises.push(sendOrderedInvites({ io, provider: p, payload, jobIdStr, isTeaser: false, job }));
    }

    const settled = await Promise.allSettled(perProviderPromises);
    summarizeSettled(`phase ${phase} per‑provider dispatch`, settled);
    console.log(`✅ Phase ${phase} invites dispatched in ${Date.now() - startedAt}ms.`);

    if (phase < 5) {
      console.log(`⏳ Scheduling Phase ${phase + 1} in ${Math.round(tier.durationMs / 1000)}s`);
      setTimeout(async () => {
        try {
          const latest = await mongoose.model("Job").findById(job._id);
          if (!latest) return console.warn(`⚠️ Job not found when scheduling next phase: ${jobIdStr}`);
          if (latest.status === "accepted" || latest.acceptedProvider) return console.log("🛑 Job already accepted. Ending invites.");
          await invitePhaseOne(latest, customer, io, phase + 1);
        } catch (e) {
          console.error("❌ Error in scheduled next phase:", e?.message || e);
        }
      }, tier.durationMs);
    }
  } catch (err) {
    console.error("❌ Error in invitePhaseOne!:", err?.message || err);
  }
}

/* -------------------------------------------------------------------------- */
/*                                 CHECKLIST                                  */
/* -------------------------------------------------------------------------- */
// • Ensure provider Users have a phone field populated (phone/phoneNumber/mobile/etc.).
// • Prefer storing `job.customerPhone` at job creation time for deterministic customer SMS.
// • sendSMS() normalizes to E.164 and logs Twilio REST errors with code/moreInfo if any.
// • Use Twilio status webhook to observe delivered/undelivered + ErrorCode.
