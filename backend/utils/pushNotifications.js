// utils/pushNotifications.js
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import api from "../api/client";

export const createAndroidChannels = async () => {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("job-invites-v2", {
        name: "Job & Status",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 300, 150, 300],
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC
      });
      console.log("🔔 [push] Android channel ensured: job-invites-v2");
    }
  } catch (e) {
    console.warn("🔔 [push] setNotificationChannelAsync failed", e?.message || e);
  }
};

const getProjectId = () => {
  // Prefer EAS projectId from config; provide multiple fallbacks for SDK differences
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.expoConfig?.projectId ||           // newer SDKs
    Constants?.easConfig?.projectId ||            // managed at runtime
    Constants?.manifest?.extra?.eas?.projectId || // legacy fallback
    null
  );
};

/**
 * Register for push notifications but NEVER block login or navigation.
 * Returns the Expo push token string or null if unavailable.
 */
export async function registerPushTokenNonBlocking({ userId } = {}) {
  try {
    // Physical device required for push tokens
    if (!Device.isDevice) {
      console.warn("🔔 [push] Skipping: not a physical device.");
      return null;
    }

    // Permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    console.log("🔔 [push] Notification permission:", finalStatus);
    if (finalStatus !== "granted") return null;

    // Required projectId (SDK 48+)
    const projectId = getProjectId();
    console.log("🔔 [push] Using projectId:", projectId || "(none)");
    if (!projectId) {
      console.warn("🔔 [push] Missing EAS projectId – token fetch may fail.");
    }

    // Get Expo push token
    const tokenResp = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const token = tokenResp?.data || null;
    console.log("🔔 [push] Expo push token:", token ? token.slice(0, 12) + "…" : "(none)");

    // Best effort: store on server (don’t block if this fails)
    if (token) {
      try {
        await api.post("/users/me/push-token", {
          token,
          platform: Platform.OS,
          userId: userId || undefined,
        });
        console.log("🔔 [push] Token sent to server ✓");
      } catch (e) {
        console.warn("🔔 [push] Failed sending token to server (non-fatal):", e?.message || e);
      }
    }

    return token;
  } catch (e) {
    // This is where your “Network request failed” was coming from.
    // We swallow it and keep the app flowing.
    console.warn("🔔 [push] registerPushTokenNonBlocking error:", e?.message || e);
    return null;
  }
}
