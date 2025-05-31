// utils/sessionManager.js
import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveSession = async (session) => {
  try {
    await AsyncStorage.setItem("session", JSON.stringify(session));
  } catch (e) {
    console.warn("Error saving session", e);
  }
};

export const loadSession = async () => {
  try {
    const session = await AsyncStorage.getItem("session");
    return session ? JSON.parse(session) : null;
  } catch (e) {
    console.warn("Error loading session", e);
    return null;
  }
};

export const clearSession = async () => {
  try {
    await AsyncStorage.removeItem("session");
  } catch (e) {
    console.warn("Error clearing session", e);
  }
};
