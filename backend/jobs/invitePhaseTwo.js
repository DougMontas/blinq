// invitePhaseTwo.js
import Job from "../models/Job.js";
import Users from "../models/Users.js";
import sendInAppInvite from "../invites/sendInAppInvite.js";
import sendSMS from "../utils/sendSMS.js";

export async function invitePhaseTwo(jobId, io) {
  console.time("🟢 invitePhaseTwo");

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      console.warn("⚠️ Phase 2: Job not found", jobId);
      return;
    }

    const emergencyZip = job.serviceZipcode?.toString().trim();
    if (!emergencyZip) {
      console.warn("⚠️ Phase 2: Missing serviceZipcode", jobId);
      return;
    }

    const customer = await Users.findById(job.customer).lean();
    if (!customer) {
      console.warn("⚠️ Phase 2: Customer not found", job.customer);
      return;
    }

    const allProviders = await Users.find({
      role: "serviceProvider",
      serviceType: job.serviceType,
      serviceZipcode: { $in: [emergencyZip] },
      _id: { $nin: job.cancelledProviders || [] },
    }).lean();

    job.invitedProviders = allProviders.map((p) => p._id);
    job.invitationPhase = 2;
    job.invitationExpiresAt = null;
    await job.save();

    const payload = {
      jobId: job._id.toString(),
      clickable: true,
      customer: { name: customer.name, email: customer.email },
      serviceType: job.serviceType,
      address: job.address,
      baseAmount: job.baseAmount,
      adjustmentAmount: job.adjustmentAmount,
      rushFee: job.rushFee,
      convenienceFee: job.convenienceFee,
      details: job.details,
    };

    console.log("📢 Phase 2: Inviting", allProviders.length, "providers");

    for (const p of allProviders) {
      console.log(`📡 Phase 2: Sending invite to ${p.name} (${p._id})`);
      io.to(p._id.toString()).emit("jobInvitation", payload);
      await sendInAppInvite(p, job);
      if (p.phone) await sendSMS(p.phone, job);
    }
  } catch (err) {
    console.error("🔥 Phase 2 invite error:", err);
  } finally {
    console.timeEnd("🟢 invitePhaseTwo");
  }
}
