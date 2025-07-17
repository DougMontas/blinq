// // backend/utils/sendPushNotification.js
// import fetch from "node-fetch";

// export async function sendPushNotification(pushToken, title, body, data = {}) {
//   if (!pushToken?.startsWith("ExponentPushToken")) return;

//   await fetch("https://exp.host/--/api/v2/push/send", {
//     method: "POST",
//     headers: {
//       Accept: "application/json",
//       "Accept-Encoding": "gzip, deflate",
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       to: pushToken,
//       sound: "default",
//       title,
//       body,
//       data,
//     }),
//   });
// }


// import fetch from "node-fetch";

// export async function sendPushNotification({ to, title, body, data = {} }) {
//   if (!to) return;

//   try {
//     const res = await fetch("https://exp.host/--/api/v2/push/send", {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Accept-Encoding": "gzip, deflate",
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         to,
//         sound: "default",
//         title,
//         body,
//         data,
//       }),
//     });

//     const json = await res.json();
//     if (json.data?.status !== "ok") {
//       console.warn("Expo push failed:", json);
//     }
//   } catch (err) {
//     console.error("❌ Push notification error:", err.message || err);
//   }
// }


// utils/pushNotifications.js
// import { Expo } from "expo-server-sdk";
// const expo = new Expo();

// export default async function sendPushNotification(pushToken, message, data = {}) {
//   if (!Expo.isExpoPushToken(pushToken)) {
//     console.error(`❌ Invalid Expo push token: ${pushToken}`);
//     return;
//   }

//   const notification = {
//     to: pushToken,
//     sound: "default",
//     body: message,
//     data,
//   };

//   try {
//     const chunks = expo.chunkPushNotifications([notification]);
//     for (let chunk of chunks) {
//       await expo.sendPushNotificationsAsync(chunk);
//     }
//     console.log("✅ Push notification sent to:", pushToken);
//   } catch (err) {
//     console.error("❌ Failed to send push notification:", err);
//   }
// }

export default async function sendPushNotification(message) {
  try {
    const token = message.to;
    if (!Expo.isExpoPushToken(token)) {
      console.warn(`❌ Invalid Expo push token: ${JSON.stringify(token)}`);
      return;
    }

    const payload = {
      to: token,
      sound: message.sound || "default",
      title: message.title,
      body: message.body,
      data: message.data || {},
    };

    const expo = new Expo();
    const ticketChunk = await expo.sendPushNotificationsAsync([payload]);
    console.log("✅ Push sent:", ticketChunk);
  } catch (err) {
    console.error("❌ Push notification error:", err.message);
  }
}
