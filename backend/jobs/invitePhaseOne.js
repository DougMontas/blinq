// // // jobs/invitePhaseOne.js
// // import { getEligibleProviders } from "../utils/providerFilters.js";
// // import sendInAppInvite from "../invites/sendInAppInvite.js";
// // import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// // import sendSMS from "../utils/sendSMS.js";

// // export async function invitePhaseOne(job, allProviders, io) {
// //   if (!Array.isArray(allProviders)) {
// //     throw new Error("invitePhaseOne expects an array of allProviders");
// //   }

// //   const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
// //   const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

// //   console.log("🧪 Providers passed to filter:", allProviders.length);
// //   console.log("🧪 Hybrid eligible:", hybrid.length);
// //   console.log("🧪 Profit-sharing eligible:", profit.length);

// //   const invites = [];

// //   for (const p of hybrid) {
// //     io.to(p._id.toString()).emit("jobInvitation", {
// //       jobId: job._id.toString(),
// //       invitationExpiresAt: job.invitationExpiresAt,
// //       clickable: true,
// //     });
// //     console.log("📣 Emitting invite to", p._id.toString(), "(clickable: true)");
// //     invites.push(sendInAppInvite(p, job));
// //     invites.push(sendSMS(p.phone, job));
// //   }

// //   for (const p of profit) {
// //     io.to(p._id.toString()).emit("jobInvitation", {
// //       jobId: job._id.toString(),
// //       invitationExpiresAt: job.invitationExpiresAt,
// //       clickable: false,
// //     });
// //     console.log("📣 Emitting teaser to", p._id.toString(), "(clickable: false)");
// //     invites.push(sendTeaserInvite(p, job));
// //   }

// //   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
// //   job.invitationPhase = 1;
// //   job.invitationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
// //   await job.save();

// //   await Promise.all(invites);
// // }

// // jobs/invitePhaseOne.js
// // import { getEligibleProviders } from "../utils/providerFilters.js";
// // import sendInAppInvite from "../invites/sendInAppInvite.js";
// // import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// // import sendSMS from "../utils/sendSMS.js";

// // export async function invitePhaseOne(job, allProviders, io) {
// //   if (!Array.isArray(allProviders)) {
// //     throw new Error("invitePhaseOne expects an array of allProviders");
// //   }

// //   const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
// //   const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

// //   console.log("🧪 Providers passed to filter:", allProviders.length);
// //   console.log("🧪 Hybrid eligible:", hybrid.length);
// //   console.log("🧪 Profit-sharing eligible:", profit.length);

// //   const invites = [];

// //   for (const p of hybrid) {
// //     console.log("📣 Emitting invite to", p._id.toString(), "(clickable: true)");
// //     invites.push(sendInAppInvite(p, job));
// //     if (p.phone) invites.push(sendSMS(p.phone, job));
// //   }

// //   for (const p of profit) {
// //     console.log("📣 Emitting teaser to", p._id.toString(), "(clickable: false)");
// //     invites.push(sendTeaserInvite(p, job));
// //   }

// //   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
// //   job.invitationPhase = 1;
// //   job.invitationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
// //   await job.save();

// //   await Promise.all(invites);
// // }

// // // jobs/invitePhaseOne.js
// // import { getEligibleProviders } from "../utils/providerFilters.js";
// // import sendInAppInvite from "../invites/sendInAppInvite.js";
// // import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// // import sendSMS from "../utils/sendSMS.js";

// // export async function invitePhaseOne(job, allProviders, io) {
// //   if (!Array.isArray(allProviders)) {
// //     throw new Error("invitePhaseOne expects an array of allProviders");
// //   }

// //   const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
// //   const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

// //   console.log("\uD83D\uDD2A Providers passed to filter:", allProviders.length);
// //   console.log("\uD83D\uDD2A Hybrid eligible:", hybrid.length);
// //   console.log("\uD83D\uDD2A Profit-sharing eligible:", profit.length);

// //   const invites = [];

// //   for (const p of hybrid) {
// //     io.to(p._id.toString()).emit("jobInvitation", {
// //       jobId: job._id.toString(),
// //       invitationExpiresAt: job.invitationExpiresAt,
// //       clickable: true,
// //     });
// //     invites.push(sendInAppInvite(p, job));
// //     if (p.phone) invites.push(sendSMS(p.phone, job));
// //   }

// //   for (const p of profit) {
// //     io.to(p._id.toString()).emit("jobInvitation", {
// //       jobId: job._id.toString(),
// //       invitationExpiresAt: job.invitationExpiresAt,
// //       clickable: false,
// //     });
// //     invites.push(sendTeaserInvite(p, job));
// //   }

// //   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
// //   job.invitationPhase = 1;
// //   job.invitationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
// //   await job.save();

// //   await Promise.all(invites);
// // }

// // jobs/invitePhaseOne.js
// // import { getEligibleProviders } from "../utils/providerFilters.js";
// // import sendInAppInvite from "../invites/sendInAppInvite.js";
// // import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// // import sendSMS from "../utils/sendSMS.js";

// // export async function invitePhaseOne(job, allProviders, io) {
// //   if (!Array.isArray(allProviders)) {
// //     throw new Error("invitePhaseOne expects an array of allProviders");
// //   }

// //   const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
// //   const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

// //   console.log("\uD83D\uDD2A Providers passed to filter:", allProviders.length);
// //   console.log("\uD83D\uDD2A Hybrid eligible:", hybrid.length);
// //   console.log("\uD83D\uDD2A Profit-sharing eligible:", profit.length);

// //   const invites = [];

// //   for (const p of hybrid) {
// //     io.to(p._id.toString()).emit("jobInvitation", {
// //       jobId: job._id.toString(),
// //       invitationExpiresAt: job.invitationExpiresAt,
// //       clickable: true,
// //     });
// //     invites.push(sendInAppInvite(p, job));
// //     if (p.phone) invites.push(sendSMS(p.phone, job));
// //   }

// //   for (const p of profit) {
// //     io.to(p._id.toString()).emit("jobInvitation", {
// //       jobId: job._id.toString(),
// //       invitationExpiresAt: job.invitationExpiresAt,
// //       clickable: false,
// //     });
// //     invites.push(sendTeaserInvite(p, job));
// //   }

// //   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
// //   job.invitationPhase = 1;
// //   job.invitationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
// //   await job.save();

// //   await Promise.all(invites);
// // }

// // export async function invitePhaseOne(job, io) {
// //     const zip = job.serviceZipcode?.toString().trim();
// //     const serviceType = job.serviceType;

// //     const hybrid = await Users.find({
// //       role: "serviceProvider",
// //       serviceZipcode: zip,
// //       serviceType,
// //       billingTier: "hybrid",
// //       _id: { $nin: job.cancelledProviders || [] },
// //     }).lean();

// //     const profit = await Users.find({
// //       role: "serviceProvider",
// //       serviceZipcode: zip,
// //       serviceType,
// //       billingTier: "profit_sharing",
// //       _id: { $nin: job.cancelledProviders || [] },
// //     }).lean();

// //     const invited = [...hybrid, ...profit];
// //     job.invitedProviders = invited.map(p => p._id);
// //     job.invitationPhase = 1;
// //     job.invitationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
// //     await job.save();

// //     const payload = {
// //       jobId: job._id.toString(),
// //       invitationExpiresAt: job.invitationExpiresAt,
// //       clickable: true,
// //     };

// //     hybrid.forEach(p => io.to(p._id.toString()).emit("jobInvitation", { ...payload, clickable: true }));
// //     profit.forEach(p => io.to(p._id.toString()).emit("jobInvitation", { ...payload, clickable: false }));
// //   }

// // jobs/invitePhaseOne.js
// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";

// export async function invitePhaseOne(job, allProviders, io) {
//   if (!Array.isArray(allProviders)) {
//     throw new Error("invitePhaseOne expects an array of allProviders");
//   }

//   const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
//   const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

//   console.log("\uD83D\uDD2A Providers passed to filter:", allProviders.length);
//   console.log("\uD83D\uDD2A Hybrid eligible:", hybrid.length);
//   console.log("\uD83D\uDD2A Profit-sharing eligible:", profit.length);

//   const invites = [];

//   for (const p of hybrid) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: job.invitationExpiresAt,
//       clickable: true,
//     });
//     invites.push(sendInAppInvite(p, job));
//     if (p.phone) invites.push(sendSMS(p.phone, job));
//   }

//   for (const p of profit) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: job.invitationExpiresAt,
//       clickable: false,
//     });
//     invites.push(sendTeaserInvite(p, job));
//   }

//   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
//   await job.save();

//   await Promise.all(invites);
// }

// // jobs/invitePhaseOne.js
// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";

// export async function invitePhaseOne(job, maybeAllProviders, io) {
//   let allProviders;

//   // Dynamically fetch if not passed
//   if (!Array.isArray(maybeAllProviders)) {
//     const emergencyZip = job.serviceZipcode?.toString().trim();
//     if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

//     allProviders = await Users.find({
//       role: "serviceProvider",
//       serviceType: job.serviceType,
//       serviceZipcode: emergencyZip,
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else {
//     allProviders = maybeAllProviders;
//   }

//   const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
//   const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

//   console.log("\uD83D\uDD2A Providers passed to filter:", allProviders.length);
//   console.log("\uD83D\uDD2A Hybrid eligible:", hybrid.length);
//   console.log("\uD83D\uDD2A Profit-sharing eligible:", profit.length);

//   const invites = [];

//   for (const p of hybrid) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: job.invitationExpiresAt,
//       clickable: true,
//     });
//     invites.push(sendInAppInvite(p, job));
//     if (p.phone) invites.push(sendSMS(p.phone, job));
//   }

//   for (const p of profit) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: job.invitationExpiresAt,
//       clickable: false,
//     });
//     invites.push(sendTeaserInvite(p, job));
//   }

//   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
//   await job.save();

//   await Promise.all(invites);
// }

// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";

// export async function invitePhaseOne(job, maybeAllProviders, io) {
//   let allProviders;

//   // Dynamically fetch if not passed
//   if (!Array.isArray(maybeAllProviders)) {
//     const emergencyZip = job.serviceZipcode?.toString().trim();
//     if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

//     allProviders = await Users.find({
//       role: "serviceProvider",
//       serviceType: job.serviceType,
//       serviceZipcode: emergencyZip,
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else {
//     allProviders = maybeAllProviders;
//   }

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

//   console.log("🔪 Providers passed to filter:", allProviders.length);
//   console.log("🔪 Hybrid eligible:", hybrid.length);
//   console.log("🔪 Profit-sharing eligible:", profit.length);

//   const invites = [];

//   for (const p of hybrid) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: job.invitationExpiresAt,
//       clickable: true,
//     });
//     invites.push(sendInAppInvite(p, job));
//     if (p.phone) invites.push(sendSMS(p.phone, job));
//   }

//   for (const p of profit) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: job.invitationExpiresAt,
//       clickable: false,
//     });
//     invites.push(sendTeaserInvite(p, job));
//   }

//   const allInvited = [...hybrid, ...profit].map((p) => p._id);
//   job.invitedProviders = allInvited;
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
//   await job.save();

//   console.log(
//     "📬 Saved invitedProviders:",
//     allInvited.map((id) => id.toString())
//   );

//   await Promise.all(invites);
// }

// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";

// export async function invitePhaseOne(job, maybeAllProviders, io) {
//   let allProviders;

//   if (!Array.isArray(maybeAllProviders)) {
//     const emergencyZip = job.serviceZipcode?.toString().trim();
//     if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

//     allProviders = await Users.find({
//       role: "serviceProvider",
//       serviceType: job.serviceType,
//       serviceZipcode: emergencyZip,
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else {
//     allProviders = maybeAllProviders;
//   }

//   const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
//   const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

//   console.log("🔪 Providers passed to filter:", allProviders.length);
//   console.log("🔪 Hybrid eligible:", hybrid.length);
//   console.log("🔪 Profit-sharing eligible:", profit.length);

//   const expiresAt = new Date(Date.now() + 1 * 60 * 1000);
//   const invites = [];

//   for (const p of hybrid) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: expiresAt,
//       clickable: true,
//     });
//     invites.push(sendInAppInvite(p, job));
//     if (p.phone) invites.push(sendSMS(p.phone, job));
//   }

//   for (const p of profit) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: expiresAt,
//       clickable: false,
//     });
//     invites.push(sendTeaserInvite(p, job));
//   }

//   job.invitedProviders = [...hybrid, ...profit].map(p => p._id);
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = expiresAt;
//   await job.save();

//   console.log("📬 Saved invitedProviders:", job.invitedProviders.map(id => id.toString()));
//   await Promise.all(invites);
// }

// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";

// export async function invitePhaseOne(job, maybeAllProviders, io) {
//     let allProviders;

//     if (!Array.isArray(maybeAllProviders)) {
//       const emergencyZip = job.serviceZipcode?.toString().trim();
//       if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

//       allProviders = await Users.find({
//         role: "serviceProvider",
//         serviceType: job.serviceType,
//         serviceZipcode: emergencyZip,
//         _id: { $nin: job.cancelledProviders || [] },
//       }).lean();
//     } else {
//       allProviders = maybeAllProviders;
//     }

//     const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
//     const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

//     console.log("🔪 Providers passed to filter:", allProviders.length);
//     console.log("🔪 Hybrid eligible:", hybrid.length);
//     console.log("🔪 Profit-sharing eligible:", profit.length);

//     const invites = [];

//     for (const p of hybrid) {
//       io.to(p._id.toString()).emit("providerInvitation", {
//         jobId: job._id.toString(),
//         invitationExpiresAt: job.invitationExpiresAt,
//         clickable: true,
//       });
//       invites.push(sendInAppInvite(p, job));
//       if (p.phone) invites.push(sendSMS(p.phone, job));
//     }

//     for (const p of profit) {
//       io.to(p._id.toString()).emit("providerInvitation", {
//         jobId: job._id.toString(),
//         invitationExpiresAt: job.invitationExpiresAt,
//         clickable: false,
//       });
//       invites.push(sendTeaserInvite(p, job));
//     }

//     const allInvited = [...hybrid, ...profit].map(p => p._id);
//     job.invitedProviders = allInvited;
//     job.invitationPhase = 1;
//     job.invitationExpiresAt = new Date(Date.now() + 1 * 60 * 1000);
//     await job.save();

//     console.log("📬 Saved invitedProviders:", allInvited.map(id => id.toString()));

//     await Promise.all(invites);
//   }

// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";

// // export async function invitePhaseOne(job, maybeAllProviders, io) {
// //   let allProviders;

// //   if (!Array.isArray(maybeAllProviders)) {
// //     const emergencyZip = job.serviceZipcode?.toString().trim();
// //     if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

// //     allProviders = await Users.find({
// //       role: "serviceProvider",
// //       serviceType: job.serviceType,
// //       serviceZipcode: emergencyZip,
// //       _id: { $nin: job.cancelledProviders || [] },
// //     }).lean();
// //   } else {
// //     allProviders = maybeAllProviders;
// //   }

// //   const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
// //   const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

// //   console.log("🔪 Providers passed to filter:", allProviders.length);
// //   console.log("🔪 Hybrid eligible:", hybrid.length);
// //   console.log("🔪 Profit-sharing eligible:", profit.length);

// //   const expiresAt = new Date(Date.now() + 1 * 60 * 1000);
// //   const invites = [];

// //   for (const p of hybrid) {
// //     console.log(`📬 Sending full invite to hybrid: ${p.name} (${p._id})`);
// //     io.to(p._id.toString()).emit("jobInvitation", {
// //       jobId: job._id.toString(),
// //       invitationExpiresAt: expiresAt,
// //       clickable: true,
// //     });
// //     invites.push(sendInAppInvite(p, job));
// //     if (p.phone) invites.push(sendSMS(p.phone, job));
// //   }

// //   console.log("📭 Sending teaser to profit-sharing:", profit.map(p => p._id.toString()));

// //   for (const p of profit) {
// //     io.to(p._id.toString()).emit("jobInvitation", {
// //       jobId: job._id.toString(),
// //       invitationExpiresAt: expiresAt,
// //       clickable: false,
// //     });
// //     invites.push(sendTeaserInvite(p, job));
// //   }

// //   job.invitedProviders = [...hybrid, ...profit].map(p => p._id);
// //   job.invitationPhase = 1;
// //   job.invitationExpiresAt = expiresAt;
// //   await job.save();

// //   console.log("📬 Saved invitedProviders:", job.invitedProviders.map(id => id.toString()));
// //   await Promise.all(invites);
// // }

// // export async function invitePhaseOne(job, maybeAllProviders, io) {
// //     let allProviders;

// //     if (!Array.isArray(maybeAllProviders)) {
// //       const emergencyZip = job.serviceZipcode?.toString().trim();
// //       if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

// //       allProviders = await Users.find({
// //         role: "serviceProvider",
// //         serviceType: job.serviceType,
// //         serviceZipcode: emergencyZip,
// //         _id: { $nin: job.cancelledProviders || [] },
// //       }).lean();
// //     } else {
// //       allProviders = maybeAllProviders;
// //     }

// //     const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
// //     const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

// //     console.log("🔪 Providers passed to filter:", allProviders.length);
// //     console.log("🔪 Hybrid eligible:", hybrid.length);
// //     console.log("🔪 Profit-sharing eligible:", profit.length);

// //     const invites = [];

// //     for (const p of hybrid) {
// //       io.to(p._id.toString()).emit("providerInvitation", {
// //         jobId: job._id.toString(),
// //         invitationExpiresAt: job.invitationExpiresAt,
// //         clickable: true,
// //       });
// //       invites.push(sendInAppInvite(p, job));
// //       if (p.phone) invites.push(sendSMS(p.phone, job));
// //     }

// //     for (const p of profit) {
// //       io.to(p._id.toString()).emit("providerInvitation", {
// //         jobId: job._id.toString(),
// //         invitationExpiresAt: job.invitationExpiresAt,
// //         clickable: false,
// //       });
// //       invites.push(sendTeaserInvite(p, job));
// //     }

// //     const allInvited = [...hybrid, ...profit].map(p => p._id);
// //     job.invitedProviders = allInvited;
// //     job.invitationPhase = 1;
// //     job.invitationExpiresAt = new Date(Date.now() + 1 * 60 * 1000);
// //     await job.save();

// //     console.log("📬 Saved invitedProviders:", allInvited.map(id => id.toString()));

// //     await Promise.all(invites);
// //   }

// export async function invitePhaseOne(job, maybeAllProviders, io) {
//   let allProviders;

//   if (!Array.isArray(maybeAllProviders)) {
//     const emergencyZip = job.serviceZipcode?.toString().trim();
//     if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

//     allProviders = await Users.find({
//       role: "serviceProvider",
//       serviceType: job.serviceType,
//       serviceZipcode: emergencyZip,
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else {
//     allProviders = maybeAllProviders;
//   }

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

//   console.log("🔪 Providers passed to filter:", allProviders.length);
//   console.log("🔪 Hybrid eligible:", hybrid.length);
//   console.log("🔪 Profit-sharing eligible:", profit.length);
//   console.log("📋 Billing tiers of matched providers:");
//   allProviders.forEach((p) => {
//     console.log(`- ${p.name || p._id}: ${p.billingTier}`);
//   });

//   const invites = [];

//   for (const p of hybrid) {
//     io.to(p._id.toString()).emit("providerInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: job.invitationExpiresAt,
//       clickable: true,
//     });
//     invites.push(sendInAppInvite(p, job));
//     if (p.phone) invites.push(sendSMS(p.phone, job));
//   }

//   for (const p of profit) {
//     io.to(p._id.toString()).emit("providerInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: job.invitationExpiresAt,
//       clickable: false,
//     });
//     invites.push(sendTeaserInvite(p, job));
//   }

//   const allInvited = [...hybrid, ...profit].map((p) => p._id);
//   job.invitedProviders = allInvited;
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
//   await job.save();

//   console.log(
//     "📬 Saved invitedProviders:",
//     allInvited.map((id) => id.toString())
//   );

//   await Promise.all(invites);
// }

// Phase 1 Invite Logic
// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";

// export async function invitePhaseOne(job, maybeAllProviders, io) {
//   let allProviders;

//   if (!Array.isArray(maybeAllProviders)) {
//     const emergencyZip = job.serviceZipcode?.toString().trim();
//     if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

//     allProviders = await Users.find({
//       role: "serviceProvider",
//       serviceType: job.serviceType,
//       serviceZipcode: { $elemMatch: { $eq: emergencyZip } },

//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else {
//     allProviders = maybeAllProviders;
//   }
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

//   //   console.log('allProviders >>>>',allProviders);
//   console.log("🔪 Providers passed to filter:", allProviders.length);
//   console.log("🔪 Hybrid eligible:", hybrid.length);
//   console.log("🔪 Profit-sharing eligible:", profit.length);
//   console.log("🔪 Profit-sharing eligible2:", profit);
//   console.log("📋 Raw matched providers:");
//   console.log(
//     "🧾 Cancelled Providers:",
//     (job.cancelledProviders || []).map((id) => id.toString())
//   );

//   console.log("🧾 All fetched providers:");
//   allProviders.forEach((p) => {
//     console.log(
//       `- ${p.name} (${p._id}) | Tier: ${p.billingTier} | Zips: ${p.serviceZipcode}`
//     );
//   });

//   const expiresAt = new Date(Date.now() + 1 * 60 * 1000);
//   const invites = [];

//   for (const p of hybrid) {
//     // console.log('hybrid >>>>',p)
//     console.log(`📬 Sending full invite to hybrid: ${p.name} (${p._id})`);
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: expiresAt,
//       clickable: true,
//     });
//     invites.push(sendInAppInvite(p, job));
//     if (p.phone) invites.push(sendSMS(p.phone, job));
//   }

//   for (const p of profit) {
//     console.log('profit >>>>',p)
//     console.log(`📭 Sending teaser to profit-sharing: ${p.name} (${p._id})`);
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: expiresAt,
//       clickable: false,
//     });
//     invites.push(sendTeaserInvite(p, job));
//   }

//   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = expiresAt;
//   await job.save();

//   console.log(
//     "📬 Saved invitedProviders:",
//     job.invitedProviders.map((id) => id.toString())
//   );
//   await Promise.all(invites);
// }

// Phase 1 Invite Logic
// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";

// export async function invitePhaseOne(job, maybeAllProviders, io) {
//   let allProviders;

//   if (!Array.isArray(maybeAllProviders)) {
//     const emergencyZip = job.serviceZipcode?.toString().trim();
//     if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

//     allProviders = await Users.find({
//       role: "serviceProvider",
//       serviceType: job.serviceType,
//       serviceZipcode: { $in: [emergencyZip] },
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else {
//     allProviders = maybeAllProviders;
//   }

//   const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
//   const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

//   console.log("🔪 Providers passed to filter:", allProviders.length);
//   console.log("🔪 Hybrid eligible:", hybrid.length);
//   console.log("🔪 Profit-sharing eligible:", profit.length);

//   const expiresAt = new Date(Date.now() + 1 * 60 * 1000);
//   const invites = [];

//   for (const p of hybrid) {
//     console.log(`📬 Sending full invite to hybrid: ${p.name} (${p._id})`);
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: expiresAt,
//       clickable: true,
//     });
//     invites.push(sendInAppInvite(p, job));
//     if (p.phone) invites.push(sendSMS(p.phone, job));
//   }

//   for (const p of profit) {
//     console.log(`📭 Sending teaser to profit-sharing: ${p.name} (${p._id})`);
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: expiresAt,
//       clickable: false,
//     });
//     invites.push(sendTeaserInvite(p, job));
//   }

//   job.invitedProviders = [...hybrid, ...profit].map(p => p._id);
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = expiresAt;
//   await job.save();

//   console.log("📬 Saved invitedProviders:", job.invitedProviders.map(id => id.toString()));
//   await Promise.all(invites);
// }

// Phase 1 Invite Logic -- previous
// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";

// export async function invitePhaseOne(job, maybeAllProviders, io) {
//   let allProviders;

//   if (!Array.isArray(maybeAllProviders)) {
//     const emergencyZip = job.serviceZipcode?.toString().trim();
//     if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

//     allProviders = await Users.find({
//       role: "serviceProvider",
//       serviceType: job.serviceType,
//       serviceZipcode: { $in: [emergencyZip] },
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else {
//     allProviders = maybeAllProviders;
//   }

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

// //   console.log("🔪 Providers passed to filter:", allProviders.length);
// //   console.log("🔪 Hybrid eligible:", hybrid.length);
// //   console.log("🔪 Profit-sharing eligible:", profit.length);
// //   console.log("🧾 Raw providers returned from DB:");
// //   allProviders.forEach((p) => {
// //     console.log(
// //       `- ${p.name} (${p.billingTier}) | zips: ${JSON.stringify(
// //         p.serviceZipcode
// //       )}`
// //     );
// //   });

//   const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
//   const invites = [];

//   for (const p of profit) {
//     // console.log(`📭 Sending teaser to profit-sharing: ${p.name} (${p._id})`);
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: expiresAt,
//       clickable: false,
//     });
//     invites.push(sendTeaserInvite(p, job));
//   }

//   for (const p of hybrid) {
//     // console.log(`📬 Sending full invite to hybrid: ${p.name} (${p._id})`);
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId: job._id.toString(),
//       invitationExpiresAt: expiresAt,
//       clickable: true,
//     });
//     invites.push(sendInAppInvite(p, job));
//     if (p.phone) invites.push(sendSMS(p.phone, job));
//   }

//   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = expiresAt;
//   await job.save();

// //   console.log(
// //     "📬 Saved invitedProviders:",
// //     job.invitedProviders.map((id) => id.toString())
// //   );
//   await Promise.all(invites);
// }

// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";

// const EXPIRY_DURATION_MS =
//   Number(process.env.PHASE_ONE_EXPIRY_MS) || 2 * 60 * 1000;

// export async function invitePhaseOne(job, maybeAllProviders, io) {
//   let allProviders;

//   if (!Array.isArray(maybeAllProviders)) {
//     const emergencyZip = job.serviceZipcode?.toString().trim();
//     if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

//     allProviders = await Users.find({
//       role: "serviceProvider",
//       serviceType: job.serviceType,
//       serviceZipcode: { $in: [emergencyZip] },
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else {
//     allProviders = maybeAllProviders;
//   }

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

//   const jobId = job._id?.toString?.();
//   if (!jobId) throw new Error("Missing job._id in invitePhaseOne");

//   const expiresAt = new Date(Date.now() + EXPIRY_DURATION_MS);
//   const invites = [];

//   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = expiresAt;
//   await job.save(); // ✅ save first to persist invitation state

//   for (const p of profit) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId,
//       invitationExpiresAt: expiresAt,
//       clickable: false,
//     });
//     invites.push(sendTeaserInvite(p, job));
//   }

//   for (const p of hybrid) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId,
//       invitationExpiresAt: expiresAt,
//       clickable: true,
//     });
//     console.time("🔵 Fetch providers");
//     invites.push(sendInAppInvite(p, job));
//     console.timeEnd("🔵 Fetch providers");

//     if (p.phone) {
//       try {
//         invites.push(sendSMS(p.phone, job));
//       } catch (err) {
//         console.error(`SMS failed for ${p.phone}`, err);
//       }
//     }
//   }

//   console.time("🟣 Send all invites");
//   await Promise.all(invites);
//   console.timeEnd("🟣 Send all invites");
// }

// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";

// const EXPIRY_DURATION_MS = Number(process.env.PHASE_ONE_EXPIRY_MS) || 2 * 60 * 1000;

// export async function invitePhaseOne(job, maybeAllProviders, io) {
//   console.time("🟡 invitePhaseOne total");

//   let allProviders;
//   if (!Array.isArray(maybeAllProviders)) {
//     const emergencyZip = job.serviceZipcode?.toString().trim();
//     if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

//     allProviders = await Users.find({
//       role: "serviceProvider",
//       serviceType: job.serviceType,
//       serviceZipcode: { $in: [emergencyZip] },
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else {
//     allProviders = maybeAllProviders;
//   }

//   const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
//   const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

//   const jobId = job._id?.toString?.();
//   if (!jobId) throw new Error("Missing job._id in invitePhaseOne");

//   const expiresAt = new Date(Date.now() + EXPIRY_DURATION_MS);

//   // Persist invitation state before sending anything
//   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = expiresAt;
//   await job.save();

//   const invites = [];

//   // Teaser invites to profit-sharing providers
//   for (const p of profit) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId,
//       invitationExpiresAt: expiresAt,
//       clickable: false,
//     });
//     invites.push(sendTeaserInvite(p, job));
//   }

//   // Full invites to hybrid providers
//   for (const p of hybrid) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId,
//       invitationExpiresAt: expiresAt,
//       clickable: true,
//     });

//     invites.push(sendInAppInvite(p, job));

//     if (p.phone) {
//       invites.push(
//         sendSMS(p.phone, job).catch((err) => {
//           console.error(`SMS failed for ${p.phone}`, err);
//         })
//       );
//     }
//   }

//   console.time("🟣 Send all invites");
//   await Promise.all(invites);
//   console.timeEnd("🟣 Send all invites");
//   console.timeEnd("🟡 invitePhaseOne total");
// }


// import { inviteQueue } from './jobQueue.js';
// import Users from '../models/Users.js';
// import { getEligibleProviders } from '../utils/providerFilters.js';

// const EXPIRY_DURATION_MS = Number(process.env.PHASE_ONE_EXPIRY_MS) || 2 * 60 * 1000;

// export async function invitePhaseOne(job, maybeAllProviders, io) {
//   let allProviders;

//   if (!Array.isArray(maybeAllProviders)) {
//     const emergencyZip = job.serviceZipcode?.toString().trim();
//     if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

//     allProviders = await Users.find({
//       role: "serviceProvider",
//       serviceType: job.serviceType,
//       serviceZipcode: { $in: [emergencyZip] },
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else {
//     allProviders = maybeAllProviders;
//   }

//   const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
//   const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

//   const jobId = job._id?.toString?.();
//   if (!jobId) throw new Error("Missing job._id in invitePhaseOne");

//   const expiresAt = new Date(Date.now() + EXPIRY_DURATION_MS);
//   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = expiresAt;
//   await job.save();

//   for (const p of profit) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId,
//       invitationExpiresAt: expiresAt,
//       clickable: false,
//     });
//     inviteQueue.add({ provider: p, jobData: job, type: 'teaser' });
//   }

//   for (const p of hybrid) {
//     io.to(p._id.toString()).emit("jobInvitation", {
//       jobId,
//       invitationExpiresAt: expiresAt,
//       clickable: true,
//     });
//     inviteQueue.add({ provider: p, jobData: job, type: 'inApp' });
//   }
// }
// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";

// const EXPIRY_DURATION_MS = Number(process.env.PHASE_ONE_EXPIRY_MS) || 2 * 60 * 1000;

// export async function invitePhaseOne(job, maybeAllProviders, io) {
//   let allProviders;

//   if (!Array.isArray(maybeAllProviders)) {
//     const emergencyZip = job.serviceZipcode?.toString().trim();
//     if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

//     allProviders = await Users.find({
//       role: "serviceProvider",
//       serviceType: job.serviceType,
//       serviceZipcode: { $in: [emergencyZip] },
//       _id: { $nin: job.cancelledProviders || [] },
//     }).lean();
//   } else {
//     allProviders = maybeAllProviders;
//   }

//   const hybrid = getEligibleProviders(allProviders, "hybrid", job.serviceZipcode);
//   const profit = getEligibleProviders(allProviders, "profit_sharing", job.serviceZipcode);

//   const jobId = job._id?.toString?.();
//   if (!jobId) throw new Error("Missing job._id in invitePhaseOne");

//   const expiresAt = new Date(Date.now() + EXPIRY_DURATION_MS);
//   job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = expiresAt;
//   await job.save();

//   const sendInvites = async (providers, sendInviteFn, clickable) => {
//     for (const p of providers) {
//       try {
//         io.to(p._id.toString()).emit("jobInvitation", {
//           jobId,
//           invitationExpiresAt: expiresAt,
//           clickable,
//         });
//         await sendInviteFn(p, job);
//         if (clickable && p.phone) {
//           await sendSMS(p.phone, job);
//         }
//       } catch (err) {
//         console.error(`Failed to send invite to ${p._id}:`, err);
//       }
//     }
//   };

//   await sendInvites(profit, sendTeaserInvite, false);
//   await sendInvites(hybrid, sendInAppInvite, true);
// }

//working
// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";

// const EXPIRY_DURATION_MS =
//   Number(process.env.PHASE_ONE_EXPIRY_MS) || 2 * 60 * 1000;

// export async function invitePhaseOne(job, maybeAllProviders, io) {
//   console.time("🟡 invitePhaseOne");

//   let allProviders;

//   console.time("🔍 Provider lookup");
//   if (!Array.isArray(maybeAllProviders)) {
//     const emergencyZip = job.serviceZipcode?.toString().trim();
//     if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

//     // allProviders = await Users.find({
//     //   role: "serviceProvider",
//     //   serviceType: job.serviceType,
//     //   serviceZipcode: { $in: [emergencyZip] },
//     //   _id: { $nin: job.cancelledProviders || [] },
//     // }).lean();

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
//     inviteTasks.push(sendTeaserInvite(p, job));
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

import { getEligibleProviders } from "../utils/providerFilters.js";
import sendInAppInvite from "../invites/sendInAppInvite.js";
import sendTeaserInvite from "../invites/sendTeaserInvite.js";
import sendSMS from "../utils/sendSMS.js";
import Users from "../models/Users.js";

const EXPIRY_DURATION_MS =
  Number(process.env.PHASE_ONE_EXPIRY_MS) || 15 * 60 * 1000; // 15 min count down for job acceptance

export async function invitePhaseOne(job, maybeAllProviders, io) {
  console.time("🟡 invitePhaseOne");

  if (job.acceptedProvider || job.status === "accepted") {
    console.warn(`Job ${job._id} is already accepted. Skipping invites.`);
    return;
  }

  let allProviders;

  console.time("🔍 Provider lookup");
  if (!Array.isArray(maybeAllProviders)) {
    const emergencyZip = job.serviceZipcode?.toString().trim();
    if (!emergencyZip) throw new Error("Missing job.serviceZipcode");

    allProviders = await Users.find(
      {
        role: "serviceProvider",
        serviceType: job.serviceType,
        serviceZipcode: { $in: [emergencyZip] },
        _id: { $nin: job.cancelledProviders || [] },
      },
      {
        _id: 1,
        name: 1,
        billingTier: 1,
        serviceZipcode: 1,
        phone: 1,
      }
    ).lean();
  } else {
    allProviders = maybeAllProviders;
  }
  console.timeEnd("🔍 Provider lookup");

  console.time("🧮 Filtering");
  const hybrid = getEligibleProviders(
    allProviders,
    "hybrid",
    job.serviceZipcode
  );
  const profit = getEligibleProviders(
    allProviders,
    "profit_sharing",
    job.serviceZipcode
  );
  console.timeEnd("🧮 Filtering");

  const jobId = job._id?.toString?.();
  if (!jobId) throw new Error("Missing job._id in invitePhaseOne");

  const expiresAt = new Date(Date.now() + EXPIRY_DURATION_MS);

  console.time("📝 Update job");
  job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
  job.invitationPhase = 1;
  job.invitationExpiresAt = expiresAt;
  await job.save();
  console.timeEnd("📝 Update job");

  const inviteTasks = [];

  console.time("📡 Emit + Invite");

  for (const p of profit) {
    io.to(p._id.toString()).emit("jobInvitation", {
      jobId,
      invitationExpiresAt: expiresAt,
      clickable: false,
    });
    inviteTasks.push(sendTeaserInvite(p, job));
  }

  for (const p of hybrid) {
    io.to(p._id.toString()).emit("jobInvitation", {
      jobId,
      invitationExpiresAt: expiresAt,
      clickable: true,
    });
    inviteTasks.push(sendInAppInvite(p, job));
    if (p.phone) {
      inviteTasks.push(
        sendSMS(p.phone, job).catch((err) =>
          console.error(`SMS failed for ${p.phone}`, err)
        )
      );
    }
  }

  await Promise.all(inviteTasks);

  console.timeEnd("📡 Emit + Invite");
  console.timeEnd("🟡 invitePhaseOne");
}


// import { getEligibleProviders } from "../utils/providerFilters.js";
// import sendInAppInvite from "../invites/sendInAppInvite.js";
// import sendTeaserInvite from "../invites/sendTeaserInvite.js";
// import sendSMS from "../utils/sendSMS.js";
// import Users from "../models/Users.js";

// const EXPIRY_DURATION_MS =
//   Number(process.env.PHASE_ONE_EXPIRY_MS) || 2 * 60 * 1000;


// export async function invitePhaseOne(job, customer, io) {
//   if (job.status === "accepted") {
//     console.log("🚫 Job already accepted. Skipping invitations.");
//     return;
//   }

//   const homeZips = [
//     ...(Array.isArray(customer.zipcode) ? customer.zipcode : []),
//     ...(customer.serviceZipcode ? [customer.serviceZipcode] : []),
//   ].map((z) => z.toString().trim());

//   const hybrid = await Users.find({
//     role: "serviceProvider",
//     serviceType: job.serviceType,
//     serviceZipcode: { $in: homeZips },
//     billingTier: "hybrid",
//     _id: { $nin: job.cancelledProviders || [] },
//   }).lean();

//   const profit = await Users.find({
//     role: "serviceProvider",
//     serviceType: job.serviceType,
//     serviceZipcode: { $in: homeZips },
//     billingTier: "profit_sharing",
//     _id: { $nin: job.cancelledProviders || [] },
//   }).lean();

//   const toHybrid = hybrid.slice(0, MAX_INVITES_PER_ZIP);
//   const slotsLeft = MAX_INVITES_PER_ZIP - toHybrid.length;
//   const toProfit = slotsLeft > 0 ? profit.slice(0, slotsLeft) : [];

//   const invited = [...toHybrid, ...toProfit];
//   job.invitedProviders = invited.map((p) => p._id);
//   job.invitationPhase = 1;
//   job.invitationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
//   await job.save();

//   const basePayload = {
//     jobId: job._id.toString(),
//     invitationExpiresAt: job.invitationExpiresAt,
//     clickable: true,
//     customer: { name: customer.name, email: customer.email },
//     serviceType: job.serviceType,
//     covered: coveredDescriptions[job.serviceType] || "",
//     address: job.address,
//     baseAmount: job.baseAmount,
//     adjustmentAmount: job.adjustmentAmount,
//     rushFee: job.rushFee,
//     convenienceFee: job.convenienceFee,
//     details: job.details,
//   };

//   toHybrid.forEach((p) =>
//     io.to(p._id.toString()).emit("jobInvitation", basePayload)
//   );

//   const teaser = { ...basePayload, clickable: false };
//   toProfit.forEach((p) =>
//     io.to(p._id.toString()).emit("jobInvitation", teaser)
//   );
// }