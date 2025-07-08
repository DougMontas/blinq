// // import "dotenv/config";
// // // import withInfoPlistPermissions from "./plugins/with-infoPlist-permissions.mjs";

// // console.log(
// //   "🔍 EXPO_PUBLIC_API_URL at config build:",
// //   process.env.EXPO_PUBLIC_API_URL
// // );

// // export default {
// //   expo: {
// //     name: "BlinqFix",
// //     slug: "blinqfix",
// //     version: "1.0.0",
// //     scheme: "blinqfix",
// //     orientation: "portrait",
// //     platforms: ["ios", "android"],
// //     icon: "./assets/driver_marker.png",
// //     userInterfaceStyle: "light",
// //     splash: {
// //       image: "./assets/driver_marker.png",
// //       resizeMode: "contain",
// //       backgroundColor: "#ffffff",
// //     },
// //     ios: {
// //       bundleIdentifier: "com.doug30.blinqfix.app", // ✅ match Apple ID config
// //       buildNumber: "28", // ✅ increment every time
// //       infoPlist: {
// //         NSCameraUsageDescription:
// //           "Allow BlinqFix to use your camera to upload job photos.",
// //         NSLocationWhenInUseUsageDescription:
// //           "Allow location to match you with nearby service providers.",
// //         NSPhotoLibraryUsageDescription:
// //           "Needed to attach photos to your service requests.",
// //         NSMicrophoneUsageDescription: "Optional voice messages for providers.",
// //         ITSAppUsesNonExemptEncryption: false
// //       },
// //     },
// //     android: {
// //       package: "com.doug30.blinqfix.app",
// //     },
// //     extra: {
// //       apiUrl:
// //       // `http://localhost:8888`,
// //         process.env.EXPO_PUBLIC_API_URL || "https://blinqfix.onrender.com",
// //       stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
// //       googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
// //       eas: {
// //         projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce",
// //       },
// //     },
// //     plugins: ["expo-location"],
// //   },
// // };

// import "dotenv/config";

// console.log(
//   "🔍 EXPO_PUBLIC_API_URL at config build:",
//   process.env.EXPO_PUBLIC_API_URL
// );

// export default {
//   expo: {
//     name: "BlinqFix",
//     slug: "blinqfix",
//     version: "1.0.0",
//     scheme: "blinqfix", // ✅ used for deep links
//     orientation: "portrait",
//     platforms: ["ios", "android"],
//     icon: "./assets/driver_marker.png",
//     userInterfaceStyle: "light",
//     splash: {
//       image: "./assets/driver_marker.png",
//       resizeMode: "contain",
//       backgroundColor: "#ffffff",
//     },
//     ios: {
//       bundleIdentifier: "com.doug30.blinqfix.app",
//       supportsTablet: true,
//       associatedDomains: [
//         "applinks:blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app"
//       ],
//       buildNumber: "28",
//       infoPlist: {
//         NSCameraUsageDescription: "Allow BlinqFix to use your camera to upload job photos.",
//         NSLocationWhenInUseUsageDescription: "Allow location to match you with nearby service providers.",
//         NSPhotoLibraryUsageDescription: "Needed to attach photos to your service requests.",
//         NSMicrophoneUsageDescription: "Optional voice messages for providers.",
//         ITSAppUsesNonExemptEncryption: false,
//         NSUserTrackingUsageDescription: "We use this to send you important service alerts",
//         UIBackgroundModes: "remote-notification",

//         // ✅ Persist ATS exception here:
//         NSAppTransportSecurity: {
//           NSAllowsArbitraryLoads: false,
//           NSExceptionDomains: {
//             "blinqfix.onrender.com": {
//               NSIncludesSubdomains: true,
//               NSExceptionAllowsInsecureHTTPLoads: false,
//               NSExceptionRequiresForwardSecrecy: false,
//               NSTemporaryExceptionMinimumTLSVersion: "TLSv1.2",
//             },
//           },
//         },
//       },
//     },
//     android: {
//       package: "com.doug30.blinqfix.app",
//       intentFilters: [
//         {
//           action: "VIEW",
//           data: {
//             scheme: "https",
//             host: "blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app",
//             pathPrefix: "/reset-password"
//           },
//           category: ["BROWSABLE", "DEFAULT"]
//         }
//       ]
//     },
//     extra: {
//       apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://blinqfix.onrender.com",
//       stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
//       googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
//       eas: {
//         projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce"
//       }
//     },
//     plugins: ["expo-location", "expo-audio", "expo-notifications",
//     "expo-video"]
//   }
// };

// // app.config.js
// import "dotenv/config";

// export default {
//   expo: {
//     name: "BlinqFix",
//     slug: "blinqfix",
//     version: "1.0.0",
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
//       buildNumber: "1.0.0",
//       supportsTablet: true,
//       infoPlist: {
//         NSCameraUsageDescription:
//           "We need access to your camera to let providers upload arrival/completion photos.",
//         NSLocationWhenInUseUsageDescription:
//           "We use your location to find or provide local emergency services.",
//         NSLocationAlwaysAndWhenInUseUsageDescription:
//           "We need background location for real-time tracking of your service provider.",
//         NSPhotoLibraryUsageDescription:
//           "This is required to upload photos from your library.",
//         UIBackgroundModes: ["location", "remote-notification"],
//         ITSAppUsesNonExemptEncryption: false,
//       },
//     },
//     android: {
//       package: "com.doug30.blinqfix.app",
//       versionCode: 1,
//       permissions: [
//         "ACCESS_FINE_LOCATION",
//         "ACCESS_COARSE_LOCATION",
//         "CAMERA",
//         "READ_EXTERNAL_STORAGE",
//       ],
//     },
//     plugins: ["expo-notifications", "expo-location", "expo-image-picker"],
//     extra: {
//       eas: {
//         projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce",
//       },
//       stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
//       EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || "https://blinqfix.onrender.com",
//       EXPO_PUBLIC_GOOGLE_MAPS_API_KEY:
//         process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
//     },
//     runtimeVersion: {
//       policy: "sdkVersion",
//     },
//     platforms: ["ios", "android", "web"],
//   },
// };


// import "dotenv/config";

// export default {
//   expo: {
//     name: "BlinqFix",
//     slug: "blinqfix",
//     version: "1.0.0",
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
//       buildNumber: "1.0.0",
//       supportsTablet: true,
//       infoPlist: {
//         NSCameraUsageDescription:
//           "We need access to your camera to let providers upload arrival/completion photos.",
//         NSLocationWhenInUseUsageDescription:
//           "We use your location to find or provide local emergency services.",
//         NSLocationAlwaysAndWhenInUseUsageDescription:
//           "We need background location for real-time tracking of your service provider.",
//         NSPhotoLibraryUsageDescription:
//           "This is required to upload photos from your library.",
//         UIBackgroundModes: ["location", "remote-notification"],
//         ITSAppUsesNonExemptEncryption: false,
//         NSPushNotificationUsageDescription: "We use this to alert you of emergency job offers."
//       },
//     },
//     android: {
//       package: "com.doug30.blinqfix.app",
//       versionCode: 1,
//       permissions: [
//         "ACCESS_FINE_LOCATION",
//         "ACCESS_COARSE_LOCATION",
//         "CAMERA",
//         "READ_EXTERNAL_STORAGE",
//       ],
//     },
//     plugins: ["expo-notifications", "expo-location", "expo-image-picker"],
//     extra: {
//       eas: {
//         projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce",
//       },
//       stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
//       EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || "https://blinqfix.onrender.com",
//       EXPO_PUBLIC_GOOGLE_MAPS_API_KEY:
//         process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
//     },
//     runtimeVersion: {
//       policy: "sdkVersion",
//     },
//     platforms: ["ios", "android", "web"],
//   },
// };

//working
// import "dotenv/config";

// export default {
//   expo: {
//     name: "BlinqFix",
//     slug: "blinqfix",
//     scheme: "blinqfix", // ✅ Needed for deep linking
//     version: "1.0.0",
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
//       buildNumber: "1.0.0",
//       supportsTablet: true,
//       associatedDomains: ["applinks:blinqfix.com"], // ✅ For iOS universal links
//       infoPlist: {
//         NSCameraUsageDescription:
//           "We need access to your camera to let providers upload arrival/completion photos.",
//         NSLocationWhenInUseUsageDescription:
//           "We use your location to find or provide local emergency services.",
//         NSLocationAlwaysAndWhenInUseUsageDescription:
//           "We need background location for real-time tracking of your service provider.",
//         NSPhotoLibraryUsageDescription:
//           "This is required to upload photos from your library.",
//         UIBackgroundModes: ["location", "remote-notification"],
//         ITSAppUsesNonExemptEncryption: false,
//         NSPushNotificationUsageDescription:
//           "We use this to alert you of emergency job offers.",
//       },
//     },
//     android: {
//       package: "com.doug30.blinqfix.app",
//       versionCode: 1,
//       permissions: [
//         "ACCESS_FINE_LOCATION",
//         "ACCESS_COARSE_LOCATION",
//         "CAMERA",
//         "READ_EXTERNAL_STORAGE",
//       ],
//       intentFilters: [
//         {
//           action: "VIEW",
//           data: {
//             scheme: "https",
//             host: "blinqfix.com",
//           },
//           category: ["BROWSABLE", "DEFAULT"],
//         },
//       ], // ✅ For Android deep/universal linking
//     },
//     plugins: ["expo-notifications", "expo-location", "expo-image-picker"],
//     extra: {
//       eas: {
//         projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce",
//       },
//       stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
//       EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || "https://blinqfix.onrender.com",
//       EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
//     },
//     runtimeVersion: {
//       policy: "sdkVersion",
//     },
//     platforms: ["ios", "android", "web"],
//   },
// };

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
      associatedDomains: ["applinks:blinqfix.com"],
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
      ],
      intentFilters: [
        {
          action: "VIEW",
          data: {
            scheme: "https",
            host: "blinqfix.com",
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
      stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || "https://blinqfix.onrender.com",
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    },
    runtimeVersion: {
      policy: "sdkVersion",
    },
    platforms: ["ios", "android", "web"],
  },
};

