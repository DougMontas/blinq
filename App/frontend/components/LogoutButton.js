// components/LogoutButton.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthProvider"; // adjust the path if needed

export default function LogoutButton() {
  const navigation = useNavigation();
  const { setRole } = useAuth(); // grab the setter to clear the role

  const handleLogout = async () => {
    // 1) Remove token and any stored user info
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userName");

    // 2) Clear our in-memory auth state
    setRole(null);

    // 3) Wipe the nav stack and send the user back to "Login"
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }], // <-- make sure this matches your Stack.Screen name
    });
  };

  return (
    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
      <Text style={styles.logoutBtnText}>Log Off</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    backgroundColor: "#1976d2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "flex-end",
    marginVertical: 8,
    marginHorizontal: 12,
  },
  logoutBtnText: {
    color: "#fff",
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
});
