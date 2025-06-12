// utils/sendSMS.js
export default function sendSMS(phone, job) {
  console.log(`📱 Would send SMS to ${phone} for job ${job._id}`);
  return Promise.resolve();
}
