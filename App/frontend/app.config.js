// import 'dotenv/config';

// export default {
//   expo: {
//     name: 'blinqfix',
//     slug: 'blinqfix',
//     version: '1.0.0',
//     // … any other Expo config you already have …
//     extra: {
//       apiUrl: process.env.EXPO_PUBLIC_API_URL,
//       stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
//     },
//   },
// };

//previous
// app.config.js
// import 'dotenv/config';

// export default {
//   expo: {
//     name: 'blinqfix',
//     slug: 'blinqfix',
//     version: '1.0.0',
//     scheme: "blinqfix",
//     // keep any other Expo config you already have here…
//     extra: {
//       // Base URL for your API (used in ../api/client.js)
//       apiUrl: process.env.EXPO_PUBLIC_API_URL,
//       // Stripe publishable key (used by stripe-react-native)
//       stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
//       googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
//     },
//     // (Optional) if you ever need to reference these at runtime via Constants.manifest.extra
//     // no plugins or build‐properties changes required unless you choose to.
//   },
// };

import 'dotenv/config';

export default {
  expo: {
    name: 'blinqfix',
    slug: 'blinqfix',
    version: '1.0.0',
    scheme: 'blinqfix',
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8888/api',
      stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    },
    android: {
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    ios: {
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    plugins: ['expo-location'], // ✅ removed "react-native-maps"
  },
};

