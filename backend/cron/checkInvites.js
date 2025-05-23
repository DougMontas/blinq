import Job from "../models/Job";
import { getEligibleProviders } from "../utils/providerFilters";
import sendInAppInvite from "../invites/sendInAppInvite";
import { getAllProviders } from "../services/providerService";

export async function runPhaseTwoInvites() {
  const expired = await Job.find({
    invitationPhase: 1,
    invitationExpiresAt: { $lt: new Date() },
    status: { $in: ["pending", "invited"] },
  });

  for (const job of expired) {
    const providers = await getAllProviders();
    const hybrid = getEligibleProviders(providers, "hybrid", job.serviceZipcode);
    const profit = getEligibleProviders(providers, "profit_sharing", job.serviceZipcode);

    for (const p of [...hybrid, ...profit]) {
      await sendInAppInvite(p, job);
    }

    job.invitationPhase = 2;
    job.invitationExpiresAt = null;
    await job.save();
  }
}