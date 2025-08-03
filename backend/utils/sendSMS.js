// // utils/sendSMS.js

import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function sendSMS(to, body) {
  try {
    const res = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`📨 SMS sent to ${to}: SID=${res.sid}, Status=${res.status}`);
    console.log("🔍 Twilio SID:", process.env.TWILIO_ACCOUNT_SID);
    console.log(
      "🔍 Twilio Token:",
      process.env.TWILIO_AUTH_TOKEN ? "Loaded" : "Missing"
    );
    console.log("🔍 Twilio From Number:", process.env.TWILIO_PHONE_NUMBER);
    return res;
  } catch (err) {
    console.error(`❌ SMS sending failed to ${to}: ${err.message}`);
    throw err;
  }
}
