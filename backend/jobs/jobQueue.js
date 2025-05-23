// jobQueue.js
import Queue from 'bull';
import sendInAppInvite from '../invites/sendInAppInvite.js';
import sendTeaserInvite from '../invites/sendTeaserInvite.js';
import sendSMS from '../utils/sendSMS.js';

export const inviteQueue = new Queue('inviteQueue');

inviteQueue.process(async (job) => {
  const { provider, jobData, type } = job.data;

  if (type === 'teaser') {
    await sendTeaserInvite(provider, jobData);
  } else if (type === 'inApp') {
    await sendInAppInvite(provider, jobData);
    if (provider.phone) {
      await sendSMS(provider.phone, jobData);
    }
  }
});