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
