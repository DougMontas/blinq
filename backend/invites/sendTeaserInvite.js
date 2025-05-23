// invites/sendTeaserInvite.js
export default async function sendTeaserInvite(provider, job) {
    console.log(`👀 Sent teaser to ${provider.name} for job ${job._id}`);
    return Promise.resolve();
  }