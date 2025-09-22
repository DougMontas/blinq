import { withInfoPlist } from "@expo/config-plugins";

export default function withInfoPlistPermissions(config) {
  console.log("✅ Injecting NSUsageDescription keys...");
  return withInfoPlist(config, (config) => {
    config.modResults.NSCameraUsageDescription =
      "We use the camera to allow users to upload service-related photos.";
    config.modResults.NSLocationWhenInUseUsageDescription =
      "We use your location to match you with nearby service providers.";
    config.modResults.NSLocationAlwaysAndWhenInUseUsageDescription =
      "Your location improves emergency dispatch, even in the background.";
    return config;
  });
}
