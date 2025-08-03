import "dotenv/config";

export default {
  expo: {
    name: "BlinqFix",
    slug: "blinqfix",
    scheme: "blinqfix",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/driver_marker.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/blinqfix_logo-new.jpeg",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "com.doug30.blinqfix.app",
      buildNumber: "1.0.0",
      supportsTablet: true,
      associatedDomains: [
        "applinks:blinqfix.com", // ✅ for universal links
      ],
      infoPlist: {
        NSCameraUsageDescription:
          "We need access to your camera to let providers upload arrival/completion photos.",
        NSLocationWhenInUseUsageDescription:
          "We use your location to find or provide local emergency services.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "We need background location for real-time tracking of your service provider.",
        NSLocationAlwaysUsageDescription:
          "We use your location to keep you connected with your service provider.",
        NSPhotoLibraryUsageDescription:
          "This is required to upload photos from your library.",
        NSUserTrackingUsageDescription:
          "We use this for push notification delivery.",
        UIBackgroundModes: ["location", "remote-notification"],
        ITSAppUsesNonExemptEncryption: false,
        NSPushNotificationUsageDescription:
          "We use this to alert you of emergency job offers.",
      },
    },
    android: {
      package: "com.doug30.blinqfix.app",
      versionCode: 1,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "SEND_SMS",
      ],
      intentFilters: [
        {
          action: "VIEW",
          data: {
            scheme: "https",
            host: "blinqfix.com",
            pathPrefix: "/reset-password", // ✅ link targeting
          },
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    plugins: ["expo-notifications", "expo-location", "expo-image-picker"],

    extra: {
      eas: {
        projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce",
      },
      stripeKey:
        process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_...",
      EXPO_PUBLIC_API_URL:
        process.env.EXPO_PUBLIC_API_URL || "https://blinqfix.onrender.com",
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY:
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    },
    runtimeVersion: {
      policy: "sdkVersion",
    },
    platforms: ["ios", "android", "web"],
  },
};
