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

// invitePhaseOne.js
import { getEligibleProviders } from "../utils/providerFilters.js";
import sendInAppInvite from "../invites/sendInAppInvite.js";
import sendTeaserInvite from "../invites/sendTeaserInvite.js";
import sendSMS from "../utils/sendSMS.js";
import Users from "../models/Users.js";
import mongoose from "mongoose";

const MILES_TO_METERS = 1609.34;
const RADIUS_TIERS = [
  { miles: 5, durationMs: .1 * .1 * 10 },
  { miles: 15, durationMs: 5 * 60 * 1000 },
  { miles: 30, durationMs: 5 * 60 * 1000 },
];

export async function invitePhaseOne(job, allProvidersFromZip, io, phase = 1) {
  console.log(`🚀 Inviting providers for job ${job._id} – Phase ${phase}`);

  if (job.acceptedProvider || job.status === "accepted") {
    console.warn(`Job ${job._id} is already accepted. Skipping invites.`);
    return;
  }

  let hybrid = [],
    profit = [],
    allProviders = [];

  const location = job.location; // { type: 'Point', coordinates: [lng, lat] }
  console.log("📍 Raw job.location:", location);

  if (
    !location ||
    !Array.isArray(location.coordinates) ||
    location.coordinates.length !== 2 ||
    location.coordinates.some((n) => typeof n !== "number" || isNaN(n))
  ) {
    console.error("❌ Missing or invalid job location", location);
    return;
  }

  // if (typeof location?.coordinates === "string") {
  //   try {
  //     location.coordinates = JSON.parse(location.coordinates);
  //     console.log("✅ Parsed stringified coordinates:", location.coordinates);
  //   } catch {
  //     console.warn("⚠️ Failed to parse coordinates string.");
  //   }
  // }

  console.log("📍 Type:", typeof location);
  console.log("📍 location.coordinates:", location?.coordinates);
  console.log(
    "📍 Coordinates valid array?",
    Array.isArray(location?.coordinates)
  );
  console.log("📍 Coordinates length:", location?.coordinates?.length);
  console.log(
    "📍 Coordinate types:",
    Array.isArray(location?.coordinates)
      ? location.coordinates.map((n, i) => `index ${i}: ${n} (${typeof n})`)
      : "N/A"
  );
  console.log("✅ Final coordinates used in invitePhaseOne:", location.coordinates);


  if (
    !location ||
    !Array.isArray(location.coordinates) ||
    location.coordinates.length !== 2 ||
    location.coordinates.some((n) => typeof n !== "number" || isNaN(n))
  ) {
    console.error("❌ Missing or invalid job location", location);
    return;
  }

  const jobId = job._id.toString();
  const tier = RADIUS_TIERS[Math.min(phase - 1, RADIUS_TIERS.length - 1)];
  const expiresAt = new Date(Date.now() + tier.durationMs);
  console.log(`📆 Phase ${phase} will expire at: ${expiresAt.toISOString()}`);

  if (phase === 1) {
    console.log("🔍 Matching providers by zipcode...");
    allProviders = await Users.find({
      role: "serviceProvider",
      isActive: true,
      serviceType: job.serviceType,
      serviceZipcode: job.serviceZipcode,
      _id: { $nin: job.cancelledProviders || [] },
    }).lean();
  } else if (phase >= 2 && phase <= 4) {
    const radiusMiles = tier.miles;
    const maxMeters = radiusMiles * MILES_TO_METERS;
    console.log(
      `📍 Searching within ${radiusMiles} miles (${maxMeters} meters)...`
    );
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
  } else {
    console.log("🛑 Final fallback – inviting all active providers");
    allProviders = await Users.find({
      role: "serviceProvider",
      isActive: true,
      serviceType: job.serviceType,
      _id: { $nin: job.cancelledProviders || [] },
    }).lean();
  }

  hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
  profit = getEligibleProviders(
    allProviders,
    "profit_sharing",
    job.serviceZipcode
  );

  console.log(
    `📦 Hybrid count: ${hybrid.length}, Profit-sharing count: ${profit.length}`
  );

  job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
  job.invitationPhase = phase;
  job.invitationExpiresAt = expiresAt;
  await job.save();
  console.log(
    `💾 Job updated with ${job.invitedProviders.length} invited providers.`
  );

  const jobIdStr = job._id.toString();
  const inviteTasks = [];

  // for (const p of profit) {
  //   const teaserPayload = {
  //     jobId: jobIdStr,
  //     invitationExpiresAt: expiresAt,
  //     clickable: phase >= 5, // round 5 and later get real invites
  //   };
  //   io.to(p._id.toString()).emit("jobInvitation", teaserPayload);
  //   console.log(`📨 Sent teaser invite to profit-sharing ${p._id}`);
  //   const redactedJob = { ...job.toObject(), address: "[Address Hidden]" };
  //   inviteTasks.push(sendTeaserInvite(p, redactedJob));
  // }

  for (const p of profit) {
    const teaserPayload = {
      jobId: jobIdStr,
      invitationExpiresAt: expiresAt,
      clickable: phase >= 5,
    };
  
    io.to(p._id.toString()).emit("jobInvitation", teaserPayload);
    console.log(`📨 Sent teaser invite to profit-sharing ${p._id}`);
  
    const redactedJob = { ...job.toObject(), address: "[Address Hidden]" };
    inviteTasks.push(sendTeaserInvite(p, redactedJob));
  
    if (p.expoPushToken) {
      inviteTasks.push(
        sendPushNotification({
          to: p.expoPushToken,
          sound: "default",
          title: "New Emergency Job",
          body: "Open BlinqFix to view the job details.",
          data: { jobId: jobIdStr, clickable: teaserPayload.clickable },
        })
      );
    }
  }

  for (const p of hybrid) {
    io.to(p._id.toString()).emit("jobInvitation", {
      jobId: jobIdStr,
      invitationExpiresAt: expiresAt,
      clickable: true,
    });
    console.log(`📨 Sent real invite to hybrid ${p._id}`);
    inviteTasks.push(sendInAppInvite(p, job));
    if (p.phone) {
      inviteTasks.push(sendSMS(p.phone, job));
    }
  }

  await Promise.allSettled(inviteTasks);
  console.log(`✅ Phase ${phase} invites dispatched for job ${job._id}`);

  // 🔁 Schedule next phase if needed
  if (phase < 5) {
    console.log(
      `⏳ Scheduling next phase (${phase + 1}) in ${tier.durationMs / 1000}s`
    );
    setTimeout(async () => {
      const latest = await mongoose.model("Job").findById(job._id);
      if (!latest || latest.status === "accepted" || latest.acceptedProvider) {
        console.log(`🛑 Job ${job._id} already accepted. Stopping escalation.`);
        return;
      }
      invitePhaseOne(latest, null, io, phase + 1); // ✅ use passed-in io
    }, tier.durationMs);
    // setTimeout(async () => {
    //   const latest = await mongoose.model("Job").findById(job._id);
    //   if (!latest || latest.status === "accepted" || latest.acceptedProvider) {
    //     console.log(`🛑 Job ${job._id} already accepted. Stopping escalation.`);
    //     return;
    //   }
    //   invitePhaseOne(latest, null, req.io, phase + 1);
    // }, tier.durationMs);
  } else {
    console.log(
      `🎯 Final phase reached for job ${job._id}. No further escalation.`
    );
  }
}
