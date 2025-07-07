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


import fetch from "node-fetch";

export async function sendPushNotification({ to, title, body, data = {} }) {
  if (!to) return;

  try {
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        sound: "default",
        title,
        body,
        data,
      }),
    });

    const json = await res.json();
    if (json.data?.status !== "ok") {
      console.warn("Expo push failed:", json);
    }
  } catch (err) {
    console.error("❌ Push notification error:", err.message || err);
  }
}
