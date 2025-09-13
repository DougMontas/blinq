// import "dotenv/config";

// export default {
//   expo: {
//     name: "BlinqFix",
//     slug: "blinqfix",
//     scheme: "blinqfix",
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
//       associatedDomains: [
//         "applinks:blinqfix.com", // ✅ for universal links
//       ],
//       infoPlist: {
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
//     },
//     android: {
//       package: "com.doug30.blinqfix.app",
//       versionCode: 1,
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
//           data: {
//             scheme: "https",
//             host: "blinqfix.com",
//             pathPrefix: "/reset-password", // ✅ link targeting
//           },
//           category: ["BROWSABLE", "DEFAULT"],
//         },
//       ],
//     },
//     plugins: ["expo-notifications", "expo-location", "expo-image-picker"],

//     extra: {
//       eas: {
//         projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce",
//       },
//       stripeKey:
//         process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_...",
//       EXPO_PUBLIC_API_URL:
//         process.env.EXPO_PUBLIC_API_URL || "https://blinqfix.onrender.com",
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
//     scheme: "blinqfix",
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
//       associatedDomains: ["applinks:blinqfix.com"],
//       infoPlist: {
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
//       // 👇 Add this to inject your iOS Maps key
//       config: {
//         googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
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
//         "SEND_SMS",
//       ],
//       intentFilters: [
//         {
//           action: "VIEW",
//           data: {
//             scheme: "https",
//             host: "blinqfix.com",
//             pathPrefix: "/reset-password",
//           },
//           category: ["BROWSABLE", "DEFAULT"],
//         },
//       ],
//       // 👇 And this for Android Google Maps
//       config: {
//         googleMaps: {
//           apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
//         },
//       },
//     },
//     plugins: ["expo-notifications", "expo-location", "expo-image-picker"],
//     extra: {
//       eas: { projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce" },
//       stripeKey:
//         process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_...",
//       EXPO_PUBLIC_API_URL:
//         process.env.EXPO_PUBLIC_API_URL || "https://blinqfix.onrender.com",
//       EXPO_PUBLIC_GOOGLE_MAPS_API_KEY:
//         process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
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
//       associatedDomains: ["applinks:blinqfix.com"],
//       infoPlist: {
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
//       // iOS Google Maps key
//       config: {
//         googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
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
//         "SEND_SMS",
//       ],
//       intentFilters: [
//         {
//           action: "VIEW",
//           data: {
//             scheme: "https",
//             host: "blinqfix.com",
//             pathPrefix: "/reset-password",
//           },
//           category: ["BROWSABLE", "DEFAULT"],
//         },
//       ],
//       // Android Google Maps key
//       config: {
//         googleMaps: {
//           apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
//         },
//       },
//     },

//     // ✅ Configure custom notification sounds here
//     plugins: [
//       [
//         "expo-notifications",
//         {
//           // These files must exist in your project; keep a .wav for iOS reliability
//           sounds: [
//             "./assets/notification.mp3", // Android
//             "./assets/notification.wav", // iOS (recommended format)
//           ],
//         },
//       ],
//       "expo-location",
//       "expo-image-picker",
//     ],

//     extra: {
//       eas: { projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce" },
//       stripeKey:
//         process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_...",
//       EXPO_PUBLIC_API_URL:
//         process.env.EXPO_PUBLIC_API_URL || "https://blinqfix.onrender.com",
//       EXPO_PUBLIC_GOOGLE_MAPS_API_KEY:
//         process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
//     },

//     runtimeVersion: { policy: "sdkVersion" },
//     platforms: ["ios", "android", "web"],
//   },
// };

// //latest
// import "dotenv/config";

// export default {
//   expo: {
//     name: "BlinqFix",
//     slug: "blinqfix",
//     scheme: "blinqfix",
//     version: "1.0.0", // app version shown to users; EAS can bump build numbers separately
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
//       // Keep this a *string* and valid starting point; EAS will auto-increment it.
//       buildNumber: "144",
//       supportsTablet: true,
//       associatedDomains: ["applinks:blinqfix.com"],
//       infoPlist: {
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
//       // Keep this a *number* and valid starting point; EAS will auto-increment it.
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
//           data: {
//             scheme: "https",
//             host: "blinqfix.com",
//             pathPrefix: "/reset-password",
//           },
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
//         {
//           sounds: [
//             "./assets/notification.mp3", // Android
//             "./assets/notification.wav", // iOS
//           ],
//         },
//       ],
//       "expo-location",
//       "expo-image-picker",
//     ],

//     extra: {
//       eas: { projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce" },
//       stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
//       EXPO_PUBLIC_API_URL:
//         process.env.EXPO_PUBLIC_API_URL || "https://blinqfix.onrender.com",
//       EXPO_PUBLIC_GOOGLE_MAPS_API_KEY:
//         process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
//       EXPO_PUBLIC_SHOW_TEST_SERVICE: "1", // show it
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
      buildNumber: "144",
      supportsTablet: true,
      associatedDomains: [
        "applinks:blinqfix.app"
      ],
      infoPlist: {
        NSUserTrackingUsageDescription:
        "BlinqFix uses your device’s identifier only to measure distance for job alerts and to track arrival at customer location. We do not sell personal data.",
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
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },

    android: {
      package: "com.doug30.blinqfix.app",
      versionCode: 2,
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
          data: [
            { scheme: "https", host: "blinqfix.app", pathPrefix: "/open" },
            { scheme: "https", host: "blinqfix.app", pathPrefix: "/job" },
            { scheme: "https", host: "blinqfix.app", pathPrefix: "/home" },
            { scheme: "https", host: "blinqfix.app", pathPrefix: "/upgrade" }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
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
          sounds: [
            "./assets/notification.mp3",
            "./assets/notification.wav",
          ],
        },
      ],
      "expo-location",
      "expo-image-picker",
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
