// screens/ResetPasswordScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import api from "../api/client"; // your axios instance
import BackButton from "../components/BackButton";

export default function ResetPasswordScreen() {
  // React Navigation approach to get URL-like params
  const route = useRoute();
  const navigation = useNavigation();
  // e.g. route.params = { token: "...someToken..." }
  const { token } = route.params || {};

  // local form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  // Check if token is missing
  useEffect(() => {
    if (!token) {
      Alert.alert("Error", "Reset token is missing from the route params.");
    }
  }, [token]);

  // event handlers
  const onChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async () => {
    if (!token) {
      Alert.alert(
        "Error",
        "Reset token is missing. Please request a new password reset."
      );
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // prepare payload
      const payload = {
        email: formData.email.trim(),
        password: formData.password
      };
      // console.log("Reset payload:", payload);

      // Make the PUT request to your backend: /auth/reset-password/:token
      await api.put(`/auth/reset-password/${token}`, payload);
      Alert.alert("Success", "Password reset successfully!");

      // Navigate back to login or home
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }] // or your main route
      });
    } catch (err) {
      console.error("Reset password error:", err.response?.data || err);
      const msg = err.response?.data?.msg || "Failed to reset password";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />
      <Text style={styles.title}>Reset Password</Text>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        keyboardType="email-address"
        onChangeText={(val) => onChange("email", val)}
        value={formData.email}
      />

      {/* New Password */}
      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        onChangeText={(val) => onChange("password", val)}
        value={formData.password}
      />

      {/* Confirm New Password */}
      <Text style={styles.label}>Confirm New Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        onChangeText={(val) => onChange("confirmPassword", val)}
        value={formData.confirmPassword}
      />

      <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={loading}>
        <Text style={styles.btnText}>
          {loading ? "Resetting..." : "Reset Password"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
    textAlign: "center"
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 16
  },
  btn: {
    padding: 16,
    borderRadius: 6,
    backgroundColor: "#1976d2",
    alignItems: "center"
  },
  btnText: {
    color: "#fff",
    fontWeight: "600"
  }
});
