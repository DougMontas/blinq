// // // utils/sendSMS.js -- working latest
// import twilio from "twilio";
// import dotenv from "dotenv";
// dotenv.config();

// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// export default async function sendSMS(to, body) {
//   try {
//     const res = await client.messages.create({
//       body,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to,
//     });
//     console.log(`📨 SMS sent to ${to}: SID=${res.sid}, Status=${res.status}`);
//     console.log("🔍 Twilio SID:", process.env.TWILIO_ACCOUNT_SID);
//     console.log(
//       "🔍 Twilio Token:",
//       process.env.TWILIO_AUTH_TOKEN ? "Loaded" : "Missing"
//     );
//     console.log("🔍 Twilio From Number:", process.env.TWILIO_PHONE_NUMBER);
//     return res;
//   } catch (err) {
//     console.error(`❌ SMS sending failed to ${to}: ${err.message}`);
//     throw err;
//   }
// }


// utils/sendSMS.js — corrected & hardened (keeps TWILIO_PHONE_NUMBER)
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,             // ← keep existing env
  TWILIO_MESSAGING_SERVICE_SID,    // optional (used if present)
  SMS_STATUS_WEBHOOK_URL,          // optional delivery callback
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.warn("[sendSMS] ⚠️ Missing Twilio credentials (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN)");
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Basic E.164 normalizer (US default): 305-555-1212 → +13055551212
const e164 = (n) => {
  if (!n) return null;
  const s = String(n).trim();
  if (s.startsWith("+")) return s; // assume already E.164
  const d = s.replace(/\D/g, "");
  if (!d) return null;
  if (d.length === 10) return "+1" + d;                 // US default
  if (d.length === 11 && d.startsWith("1")) return "+" + d; // US 11-digit
  return "+" + d; // best-effort fallback
};

export default async function sendSMS(to, body) {
  const toNum = e164(to);
  if (!toNum) throw new Error(`sendSMS: invalid recipient number → ${to}`);

  const payload = {
    to: toNum,
    body: String(body || "").slice(0, 1600), // Twilio hard cap safeguard
  };

  if (SMS_STATUS_WEBHOOK_URL) payload.statusCallback = SMS_STATUS_WEBHOOK_URL;

  // Prefer Messaging Service if available; otherwise use TWILIO_PHONE_NUMBER
  if (TWILIO_MESSAGING_SERVICE_SID) {
    payload.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
  } else {
    const fromNum = e164(TWILIO_PHONE_NUMBER);
    if (!fromNum) throw new Error("sendSMS: TWILIO_PHONE_NUMBER is not set or invalid");
    payload.from = fromNum;
  }

  console.log(
    `[sendSMS] → to=${payload.to} via=${payload.messagingServiceSid ? "service" : "from"} statusCb=${
      !!payload.statusCallback
    } len=${payload.body.length}`
  );

  try {
    const res = await client.messages.create(payload);
    console.log(
      `[sendSMS] ✔ queued sid=${res.sid} status=${res.status} segments=${res.numSegments} price=${res.price || "?"}`
    );
    return res;
  } catch (err) {
    // Twilio REST errors include code/message/moreInfo
    console.warn("[sendSMS] ✖ create failed:", {
      code: err.code,
      message: err.message,
      moreInfo: err.moreInfo,
      status: err.status,
    });
    throw err;
  }
}
