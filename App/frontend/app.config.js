// import "dotenv/config";

// export default {
//   expo: {
//     name: "BlinqFix",
//     slug: "blinqfix",
//     scheme: "blinqfix",
//     version: "1.0.4",
//     orientation: "portrait",
//     icon: "./assets/driver_marker.png",
//     userInterfaceStyle: "light",
//     splash: {
//       image: "./assets/blinqfix_logo-new.jpeg",
//       resizeMode: "contain",
//       backgroundColor: "#ffffff",
//     },
//     updates: {
//       fallbackToCacheTimeout: 0,
//     },
//     assetBundlePatterns: ["**/*"],

//     ios: {
//       bundleIdentifier: "com.doug30.blinqfix.app",
//       buildNumber: "195",
//       supportsTablet: true,
//       associatedDomains: ["applinks:blinqfix.app"],
//       infoPlist: {
//         NSUserTrackingUsageDescription:
//           "BlinqFix uses your device’s identifier only to measure distance for job alerts and to track arrival at customer location. We do not sell personal data.",
//         NSCameraUsageDescription:
//           "We need access to your camera to let providers upload arrival/completion photos.",
//         NSLocationWhenInUseUsageDescription:
//           "We use your location to find or provide local emergency services.",
//         NSLocationAlwaysAndWhenInUseUsageDescription:
//           "We need background location for real-time tracking of your service provider.",
//         NSLocationAlwaysUsageDescription:
//           "We use your location to keep you connected with your service provider.",
//         NSPhotoLibraryUsageDescription:
//           "This is required to upload photos from your library.",
//         NSUserTrackingUsageDescription:
//           "We use this for push notification delivery.",
//         UIBackgroundModes: ["location", "remote-notification"],
//         ITSAppUsesNonExemptEncryption: false,
//         NSPushNotificationUsageDescription:
//           "We use this to alert you of emergency job offers.",
//       },
//       config: {
//         googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
//       },
//     },

//     android: {
//       package: "com.doug30.blinqfix.app",
//       versionCode: 2,
//       permissions: [
//         "ACCESS_FINE_LOCATION",
//         "ACCESS_COARSE_LOCATION",
//         "CAMERA",
//         "READ_EXTERNAL_STORAGE",
//         "SEND_SMS",
//       ],
//       intentFilters: [
//         {
//           action: "VIEW",
//           data: [
//             { scheme: "https", host: "blinqfix.app", pathPrefix: "/open" },
//             { scheme: "https", host: "blinqfix.app", pathPrefix: "/job" },
//             { scheme: "https", host: "blinqfix.app", pathPrefix: "/home" },
//             { scheme: "https", host: "blinqfix.app", pathPrefix: "/upgrade" },
//           ],
//           category: ["BROWSABLE", "DEFAULT"],
//         },
//       ],
//       config: {
//         googleMaps: {
//           apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
//         },
//       },
//     },

//     plugins: [
//       [
//         "expo-notifications",
//         "expo-barcode-scanner",

//         {
//           sounds: ["./assets/notification.mp3"],
//         },
//       ],
//       "expo-location",
//       "expo-image-picker",
//       "expo-audio",
//     ],

//     extra: {
//       eas: { projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce" },
//       stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
//       EXPO_PUBLIC_API_URL:
//         process.env.EXPO_PUBLIC_API_URL || "https://blinqfix.onrender.com",
//       EXPO_PUBLIC_GOOGLE_MAPS_API_KEY:
//         process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
//       EXPO_PUBLIC_SHOW_TEST_SERVICE: "1",
//     },

//     runtimeVersion: { policy: "sdkVersion" },
//     platforms: ["ios", "android", "web"],
//   },
// };

// import "dotenv/config";

// export default {
//   expo: {
//     name: "BlinqFix",
//     slug: "blinqfix",
//     scheme: "blinqfix",
//     version: "1.0.4",
//     orientation: "portrait",
//     icon: "./assets/driver_marker.png",
//     userInterfaceStyle: "light",
//     splash: {
//       image: "./assets/blinqfix_logo-new.jpeg",
//       resizeMode: "contain",
//       backgroundColor: "#ffffff",
//     },
//     updates: { fallbackToCacheTimeout: 0 },
//     assetBundlePatterns: ["**/*"],

//     ios: {
//       bundleIdentifier: "com.doug30.blinqfix.app",
//       buildNumber: "195",
//       supportsTablet: true,
//       associatedDomains: ["applinks:blinqfix.app"],
//       infoPlist: {
//         NSUserTrackingUsageDescription:
//           "We use this for push notification delivery.",
//         NSCameraUsageDescription:
//           "We need access to your camera to let providers upload arrival/completion photos.",
//         NSLocationWhenInUseUsageDescription:
//           "We use your location to find or provide local emergency services.",
//         NSLocationAlwaysAndWhenInUseUsageDescription:
//           "We need background location for real-time tracking of your service provider.",
//         NSLocationAlwaysUsageDescription:
//           "We use your location to keep you connected with your service provider.",
//         NSPhotoLibraryUsageDescription:
//           "This is required to upload photos from your library.",
//         UIBackgroundModes: ["location", "remote-notification"],
//         ITSAppUsesNonExemptEncryption: false,
//         NSPushNotificationUsageDescription:
//           "We use this to alert you of emergency job offers.",
//       },
//       config: {
//         googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
//       },
//     },

//     android: {
//       package: "com.doug30.blinqfix.app",
//       versionCode: 2,
//       permissions: [
//         "ACCESS_FINE_LOCATION",
//         "ACCESS_COARSE_LOCATION",
//         "CAMERA",
//         "READ_EXTERNAL_STORAGE",
//         "SEND_SMS",
//       ],
//       intentFilters: [
//         {
//           action: "VIEW",
//           data: [
//             { scheme: "https", host: "blinqfix.app", pathPrefix: "/open" },
//             { scheme: "https", host: "blinqfix.app", pathPrefix: "/job" },
//             { scheme: "https", host: "blinqfix.app", pathPrefix: "/home" },
//             { scheme: "https", host: "blinqfix.app", pathPrefix: "/upgrade" },
//           ],
//           category: ["BROWSABLE", "DEFAULT"],
//         },
//       ],
//       config: {
//         googleMaps: {
//           apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
//         },
//       },
//     },

//     plugins: [
//       // ✅ each plugin stands alone
//       ["expo-notifications", { sounds: ["./assets/notification.mp3"] }],
//       "expo-location",
//       "expo-image-picker",
//       // If you actually use Expo Audio (SDK 51+), keep this.
//       // If you meant the classic media lib, the plugin is "expo-av".
//       "expo-audio",
//     ],

//     extra: {
//       eas: { projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce" },
//       stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
//       EXPO_PUBLIC_API_URL:
//         process.env.EXPO_PUBLIC_API_URL || "https://blinqfix.onrender.com",
//       EXPO_PUBLIC_GOOGLE_MAPS_API_KEY:
//         process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
//       EXPO_PUBLIC_SHOW_TEST_SERVICE: "1",
//     },

//     runtimeVersion: { policy: "sdkVersion" },
//     platforms: ["ios", "android", "web"],
//   },
// };


import "dotenv/config";

export default {
  expo: {
    name: "BlinqFix",
    slug: "blinqfix",
    scheme: "blinqfix",
    version: "1.0.4",
    orientation: "portrait",
    icon: "./assets/driver_marker.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/blinqfix_logo-new.jpeg",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    updates: { fallbackToCacheTimeout: 0 },
    assetBundlePatterns: ["**/*"],

    ios: {
      bundleIdentifier: "com.doug30.blinqfix.app",
      buildNumber: "195",
      supportsTablet: true,
      associatedDomains: ["applinks:blinqfix.app"],
      infoPlist: {
        
        NSUserTrackingUsageDescription: "BlinqFix uses your device’s identifier only to measure distance for job alerts and to track arrival at customer location. We do not sell personal data.",
        NSCameraUsageDescription:
          "We need access to your camera so providers and customers can take job photos.",
        NSPhotoLibraryUsageDescription:
          "We may allow you to pick existing photos from your library.",
        NSPhotoLibraryAddUsageDescription:
          "We may save captured photos to your library if you choose to.",
        NSLocationWhenInUseUsageDescription:
          "Your location helps us find nearby emergency services and show provider ETA.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "Background location enables real-time provider tracking during active jobs.",
        UIBackgroundModes: ["location", "remote-notification"],
        ITSAppUsesNonExemptEncryption: false,
        
      },
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },

    android: {
      package: "com.doug30.blinqfix.app",
      versionCode: 2,
      // Keep permissions minimal; remove SEND_SMS unless you programmatically send SMS
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "SEND_SMS"
      ],
      intentFilters: [
        {
          action: "VIEW",
          data: [
            { scheme: "https", host: "blinqfix.app", pathPrefix: "/open" },
            { scheme: "https", host: "blinqfix.app", pathPrefix: "/job" },
            { scheme: "https", host: "blinqfix.app", pathPrefix: "/home" },
            { scheme: "https", host: "blinqfix.app", pathPrefix: "/upgrade" },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },

    plugins: [
      [
        "expo-notifications",
        {
          
          sounds: ["./assets/notification.mp3"],
        },
      ],
      "expo-location",
      "expo-image-picker",
      // Use expo-av for audio playback/recording. "expo-audio" is not required here.
      "expo-av",
      // Keep iOS frameworks consistent (Xcode 15+); remove if not needed.
      ["expo-build-properties", { ios: { useFrameworks: "static" } }],
    ],

    extra: {
      eas: { projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce" },
      stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      EXPO_PUBLIC_API_URL:
        process.env.EXPO_PUBLIC_API_URL || "https://blinqfix.onrender.com",
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY:
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      EXPO_PUBLIC_SHOW_TEST_SERVICE: "1",
    },

    runtimeVersion: { policy: "sdkVersion" },
    platforms: ["ios", "android", "web"],
  },
};
