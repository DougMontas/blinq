// screens/NotFoundScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function NotFoundScreen() {
  const navigation = useNavigation();
  const [role, setRole] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem("userRole").then((r) => {
      setRole(r);
    });
  }, []);

  const handleRedirect = () => {
    if (role === "serviceProvider") {
      navigation.replace("ProviderDashboard");
    } else if (role === "homeowner") {
      navigation.replace("HomeDashboard");
    } else {
      navigation.replace("Home");
    }
  };

  const buttonLabel =
    role === "serviceProvider"
      ? "Provider Dashboard"
      : role === "homeowner"
      ? "Home Dashboard"
      : "Home Page";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>Oops! Page not found.</Text>
        <Text style={styles.body}>
          The page you are looking for does not exist or might have been moved.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleRedirect}>
          <Text style={styles.buttonText}>Go to {buttonLabel}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  box: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    width: "100%",
    maxWidth: 360,
  },
  code: {
    fontSize: 48,
    fontWeight: "700",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#1976d2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
