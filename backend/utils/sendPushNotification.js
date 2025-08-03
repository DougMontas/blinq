//utils/sendPushNotification.js
import { Expo } from "expo-server-sdk";
const expo = new Expo();

export default async function sendPushNotification({ to, title, body, data }) {
  if (!expo.isExpoPushToken(to)) {
    console.error("❌ Invalid Expo push token:", to);
    return;
  }

  const notification = {
    to,
    sound: "default",
    title,
    body,
    data,
  };

  try {
    const chunks = expo.chunkPushNotifications([notification]);
    for (let chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
    console.log("📬 Push notification sent:", title);
  } catch (err) {
    console.error("❌ Push notification error:", err.message);
  }
}
