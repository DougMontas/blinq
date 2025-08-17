// //utils/sendPushNotification.js working
// import { Expo } from "expo-server-sdk";
// const expo = new Expo();

// export default async function sendPushNotification({ to, title, body, data }) {
//   if (!expo.isExpoPushToken(to)) {
//     console.error("❌ Invalid Expo push token:", to);
//     return;
//   }

//   const notification = {
//     to,
//     sound: "default",
//     title,
//     body,
//     data,
//   };

//   try {
//     const chunks = expo.chunkPushNotifications([notification]);
//     for (let chunk of chunks) {
//       await expo.sendPushNotificationsAsync(chunk);
//     }
//     console.log("📬 Push notification sent:", title);
//   } catch (err) {
//     console.error("❌ Push notification error:", err.message);
//   }
// }

// backend/utils/sendPushNotification.js
import { Expo } from "expo-server-sdk";

// If you're using an Expo access token, you can pass it here.
// const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
const expo = new Expo();

export default async function sendPushNotification({
  to,                 // string | string[]
  title,
  body,
  data = {},
  sound = "default",
  channelId = "job-invites-v2",
  priority = "high",
}) {
  try {
    // Accept a single token or an array
    const tokens = Array.isArray(to) ? to : [to];

    // Separate valid/invalid tokens (static method!)
    const valid = tokens.filter((t) => Expo.isExpoPushToken(t));
    const invalid = tokens.filter((t) => !Expo.isExpoPushToken(t));

    if (invalid.length) {
      console.warn("⚠️ Ignoring invalid Expo tokens:", invalid);
    }
    if (valid.length === 0) {
      console.error("❌ No valid Expo tokens to send.");
      return { ok: false, sent: 0, tickets: [] };
    }

    // Build messages
    const messages = valid.map((token) => ({
      to: token,
      sound,
      title,
      body,
      data,
      channelId, // Android channel id you created
      priority,  // "high" by default
    }));

    // Chunk + send
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    console.log(`📬 Push sent: ${valid.length} message(s). tickets=${tickets.length}`);
    return { ok: true, sent: valid.length, tickets };
  } catch (err) {
    console.error("❌ Push notification error:", err?.message || err);
    return { ok: false, error: err?.message || String(err) };
  }
}
