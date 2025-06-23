import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

export async function registerForPushNotificationsAsync() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert("Notifications Disabled", "Enable notifications in settings.");
      return null;
    }

    if (Device.isDevice) {
      const { data: token } = await Notifications.getExpoPushTokenAsync();
      return token;
    } else {
      Alert.alert("Use a physical device to receive push notifications.");
      return null;
    }
  } catch (err) {
    Alert.alert("Notification Error", "Could not register for push notifications.");
    return null;
  }
}
