import "dotenv/config";
import withInfoPlistPermissions from "./plugins/with-infoPlist-permissions.mjs";

export default {
  expo: {
    name: "BlinqFix",
    slug: "blinqfix",
    version: "1.0.0",
    scheme: "blinqfix",
    orientation: "portrait",
    platforms: ["ios", "android"],
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      bundleIdentifier: "com.doug30.blinqfix.app", // ✅ match Apple ID config
      buildNumber: "25", // ✅ increment every time
    },
    android: {
      package: "com.doug30.blinqfix.app",
    },
    extra: {
      apiUrl:
        process.env.EXPO_PUBLIC_API_URL ||
        "https://blinqfix-server.onrender.com",
      stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      eas: {
        projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce",
      },
    },
    plugins: [withInfoPlistPermissions, "expo-location"],
  },
};
