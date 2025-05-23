// invites/sendInAppInvite.js
export default async function sendInAppInvite(provider, job) {
    console.log(`📬 Sent full invite to ${provider.name} for job ${job._id}`);
    return Promise.resolve();
  }
  