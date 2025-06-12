import "dotenv/config";

export default {
  expo: {
    name: "blinqfix",
    slug: "blinqfix",
    version: "1.0.0",
    scheme: "blinqfix",
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8888/api",
      stripeKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
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
    plugins: ["expo-location"], // ✅ removed "react-native-maps"
  },
};
