import { getEligibleProviders } from "../utils/providerFilters.js";
import sendInAppInvite from "../invites/sendInAppInvite.js";
import sendTeaserInvite from "../invites/sendTeaserInvite.js";
import sendSMS from "../utils/sendSMS.js";
import sendPushNotification from "../utils/sendPushNotification.js";
import Users from "../models/Users.js";
import mongoose from "mongoose";

const MILES_TO_METERS = 1609.34;
const RADIUS_TIERS = [
  { miles: 5, durationMs: 5 * 60 * 1000 },
  { miles: 15, durationMs: 5 * 60 * 1000 },
  { miles: 30, durationMs: 5 * 60 * 1000 },
  { miles: 50, durationMs: 5 * 60 * 1000 },
];

export async function invitePhaseOne(job, customer, io, phase = 1) {
  try {
    console.log(
      `\u{1F4E3} invitePhaseOne: Starting Phase ${phase} for job ${job._id}`
    );

    if (!job || job.status === "accepted" || job.acceptedProvider) {
      console.log("\u{2705} Job already accepted. Skipping invite phase.");
      return;
    }

    const location = job.location;
    if (!location?.coordinates || location.coordinates.length !== 2) {
      console.warn("\u{274C} Invalid job location. Skipping invite.", location);
      return;
    }

    const tier = RADIUS_TIERS[Math.min(phase - 1, RADIUS_TIERS.length - 1)];
    const expiresAt = new Date(Date.now() + tier.durationMs);

    const excludeIds = job.cancelledProviders?.map((id) => id.toString()) || [];
    let allProviders = [];

    if (phase === 1) {
      // Phase 1: match by zipcode
      allProviders = await Users.find({
        role: "serviceProvider",
        isActive: true,
        serviceType: job.serviceType,
        serviceZipcode: job.serviceZipcode,
        _id: { $nin: excludeIds },
      }).lean();
    } else {
      // Phase 2+: match by radius regardless of zipcode
      const maxMeters = tier.miles * MILES_TO_METERS;
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
        _id: { $nin: excludeIds },
      }).lean();
    }

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

    const jobIdStr = job._id.toString();
    job.invitedProviders = [...hybrid, ...profit].map((p) => p._id);
    job.invitationPhase = phase;
    job.invitationExpiresAt = expiresAt;
    await job.save();

    const tasks = [];

    for (const p of profit) {
      if (excludeIds.includes(p._id.toString())) continue;
      const teaserPayload = {
        jobId: jobIdStr,
        invitationExpiresAt: expiresAt,
        clickable: phase >= 5,
      };
      io.to(p._id.toString()).emit("jobInvitation", teaserPayload);
      tasks.push(
        sendTeaserInvite(p, { ...job.toObject(), address: "[Hidden]" })
      );

      if (typeof p.expoPushToken === "string") {
        tasks.push(
          sendPushNotification({
            to: p.expoPushToken,
            title: "\u{1F6A8} New Emergency Job",
            body: "Tap to view teaser.",
            data: { jobId: jobIdStr, type: "jobInvite", clickable: phase >= 5 },
          })
        );
      }

      if (p.phone) {
        tasks.push(
          sendSMS(
            p.phone,
            `BlinqFix Teaser: Emergency job ID ${jobIdStr}. Open app to learn more.`
          )
        );
      }
    }

    for (const p of hybrid) {
      if (excludeIds.includes(p._id.toString())) continue;
      const payload = {
        jobId: jobIdStr,
        invitationExpiresAt: expiresAt,
        clickable: true,
      };
      io.to(p._id.toString()).emit("jobInvitation", payload);
      tasks.push(sendInAppInvite(p, job));

      if (typeof p.expoPushToken === "string") {
        tasks.push(
          sendPushNotification({
            to: p.expoPushToken,
            title: "\u{1F6A8} New Emergency Job",
            body: "Tap to accept now!",
            data: { jobId: jobIdStr, type: "jobInvite", clickable: true },
          })
        );
      }

      if (p.phone) {
        tasks.push(
          sendSMS(
            p.phone,
            `\u{1F4E2} BlinqFix Alert: New job ID ${jobIdStr} available! Tap to accept.`
          )
        );
      }
    }

    await Promise.allSettled(tasks);
    console.log(`\u{2705} Phase ${phase} invites dispatched.`);

    if (phase < 5) {
      console.log(`\u{23F3} Scheduling Phase ${phase + 1}`);
      setTimeout(async () => {
        const latest = await mongoose.model("Job").findById(job._id);
        if (latest.status === "accepted" || latest.acceptedProvider) {
          console.log("\u{1F6D1} Job already accepted. Ending invites.");
          return;
        }
        invitePhaseOne(latest, customer, io, phase + 1);
      }, tier.durationMs);
    }
  } catch (err) {
    console.error("\u{274C} Error in invitePhaseOne:", err);
  }
}
