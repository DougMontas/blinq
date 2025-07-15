// // utils/sendSMS.js
// export default function sendSMS(phone, job) {
//   console.log(`📱 Would send SMS to ${phone} for job ${job._id}`);
//   return Promise.resolve();
// }


import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function sendSMS(to, body) {
  try {
    return await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
  } catch (err) {
    console.error("❌ SMS sending failed:", err.message);
  }
}

