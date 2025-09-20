import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, ArrowLeft, Key, Shield } from "lucide-react-native";
import api from "../api/client";

export default function ResetPasswordLost() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Keep all original backend logic exactly the same
  const handleRequestReset = async () => {
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail.includes("@") || cleanedEmail.length < 6) {
      return Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/request-password-reset", {
        email: cleanedEmail,
      });

      // console.log("[✅ Email Sent Response]:", response.data);

      Alert.alert("Email Sent", "Check your inbox to reset your password.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error(
        "[❌ Request Reset Error]:",
        err.response?.data || err.message
      );
      Alert.alert("Error", err.response?.data?.msg || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#312e81"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <ArrowLeft color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
              <View style={styles.iconContainer}>
                <Key color="#60a5fa" size={32} />
              </View>

              <Text style={styles.title}>Forgot Your Password?</Text>
              <Text style={styles.instructions}>
                No problem. Enter the email associated with your account and
                we'll send a secure link to reset your password.
              </Text>

              {/* Input Form */}
              <View style={styles.inputContainer}>
                <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRequestReset}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#22c55e", "#16a34a"]}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Trust Indicator */}
            <View style={styles.trustIndicator}>
              <Shield color="#22c55e" size={16} />
              <Text style={styles.trustText}>
                Your security is our priority
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 99,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "rgba(96, 165, 250, 0.1)",
    padding: 20,
    borderRadius: 99,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.2)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#fff",
  },
  instructions: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: "#e0e7ff",
    lineHeight: 24,
    maxWidth: "90%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    width: "100%",
    marginBottom: 24,
  },
  inputIcon: {
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#fff",
  },
  button: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  trustIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    paddingBottom: 20,
    gap: 8,
  },
  trustText: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "500",
  },
});
