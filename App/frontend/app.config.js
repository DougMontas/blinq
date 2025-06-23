import "dotenv/config";
// import withInfoPlistPermissions from "./plugins/with-infoPlist-permissions.mjs";

console.log(
  "🔍 EXPO_PUBLIC_API_URL at config build:",
  process.env.EXPO_PUBLIC_API_URL
);

export default {
  expo: {
    name: "BlinqFix",
    slug: "blinqfix",
    version: "1.0.0",
    scheme: "blinqfix",
    orientation: "portrait",
    platforms: ["ios", "android"],
    icon: "./assets/driver_marker.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/driver_marker.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      bundleIdentifier: "com.doug30.blinqfix.app", // ✅ match Apple ID config
      buildNumber: "28", // ✅ increment every time
      infoPlist: {
        NSCameraUsageDescription:
          "Allow BlinqFix to use your camera to upload job photos.",
        NSLocationWhenInUseUsageDescription:
          "Allow location to match you with nearby service providers.",
        NSPhotoLibraryUsageDescription:
          "Needed to attach photos to your service requests.",
        NSMicrophoneUsageDescription: "Optional voice messages for providers.",
        ITSAppUsesNonExemptEncryption: false
      },
    },
    android: {
      package: "com.doug30.blinqfix.app",
    },
    extra: {
      apiUrl:
      `http://localhost:8888`,
        // process.env.EXPO_PUBLIC_API_URL || "https://blinqfix.onrender.com",
      stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      eas: {
        projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce",
      },
    },
    plugins: ["expo-location"],
  },
};
