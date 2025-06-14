// import "dotenv/config";

// export default {
//   expo: {
//     name: "blinqfix",
//     slug: "blinqfix",
//     version: "1.0.0",
//     scheme: "blinqfix",
//     extra: {
//       apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8888/api",
//       stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
//       googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
//     },
//     android: {
//       config: {
//         googleMaps: {
//           apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
//         },
//       },
//     },
//     ios: {
//       config: {
//         bundleIdentifier: com.anonymous.blinqfix,
//         googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
//       },
//     },
//     // plugins: [
//     //   [
//     //     "react-native-maps",
//     //     {
//     //       "config": {
//     //         "googleMapsApiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
//     //       }
//     //     }
//     //   ]
//     // ],
//     // plugins: ["expo-location"], // ✅ removed "react-native-maps"
//     // plugins: ["expo-location", "react-native-maps"],
//     // plugins: [
//     //   "expo-location",
//     //   [
//     //     "react-native-maps",
//     //     {
//     //       googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
//     //     },
//     //   ],
//     // ],
//   },
// };

// import "dotenv/config";

// export default {
//   expo: {
//     name: "blinqfix",
//     slug: "blinqfix",
//     version: "1.0.0",
//     scheme: "blinqfix",
//     extra: {
//       apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8888/api",
//       stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
//       googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
//     },
//     android: {
//       package: "com.blinqfix.app",
//       config: {
//         googleMaps: {
//           apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
//         },
//       },
//     },
//     ios: {
//       bundleIdentifier: "com.blinqfix.app", // ✅ required
//       config: {
//         googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
//       },
//     },
//     plugins: ["expo-location"],
//   },
// };

// app.config.js
import "dotenv/config";

export default {
  expo: {
    /* ───────── General ───────── */
    name: "BlinqFix", // capitalized display name
    slug: "blinqfix",
    version: "1.0.0",
    scheme: "blinqfix",
 
    /* ───────── Extra (env-driven) ───────── */
    extra: {
      /** production URL first, fallback to local dev */
      apiUrl:
        process.env.EXPO_PUBLIC_API_URL ||
        "https://blinqfix-server.onrender.com",
      stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",

      eas: {
        projectId: "05911a90-207f-46d5-802a-05f6b45fd4ce",
      },
    },

    /* ───────── iOS settings ───────── */
    ios: {
      bundleIdentifier: "com.doug30.blinqfixbackend", // ← must match Apple App ID
      buildNumber: "1", // added per snippet
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },

    /* ───────── Android settings ───────── */
    android: {
      package: "com.doug30.blinqfixbackend",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },

    /* ───────── Plugins, etc. ───────── */
    plugins: ["expo-location"], // keep your existing plugins
  },
};
