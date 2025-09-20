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
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Key,
  CheckCircle,
} from "lucide-react-native";
import api from "../api/client";

export default function ResetPasswordLost() {
  const route = useRoute();
  const navigation = useNavigation();
  const token = route.params?.token;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Keep all original backend logic exactly the same
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      return Alert.alert("Error", "All fields are required.");
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match.");
    }

    if (newPassword.length < 6) {
      return Alert.alert("Error", "Password must be at least 6 characters.");
    }

    if (!token) {
      return Alert.alert("Error", "Missing or invalid token.");
    }

    try {
      setLoading(true);
      const res = await api.post(
        `/auth/reset-password/${encodeURIComponent(token)}`,
        {
          password: newPassword,
        }
      );

      Alert.alert("Success", res.data.msg || "Password reset successful", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (err) {
      console.error("Reset password error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.msg || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length < 6)
      return { strength: "weak", color: "#ef4444", text: "Weak" };
    if (password.length < 8)
      return { strength: "medium", color: "#f59e0b", text: "Medium" };
    return { strength: "strong", color: "#22c55e", text: "Strong" };
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;

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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.headerBadge}>
                <Shield color="#22c55e" size={16} />
                <Text style={styles.headerBadgeText}>Secure Reset</Text>
              </View>
              <Text style={styles.headerTitle}>Reset Password</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Info Card */}
            <View style={styles.infoCard}>
              <LinearGradient
                colors={["rgba(34, 197, 94, 0.15)", "rgba(16, 185, 129, 0.05)"]}
                style={styles.infoGradient}
              >
                <View style={styles.infoHeader}>
                  <Key color="#22c55e" size={24} />
                  <Text style={styles.infoTitle}>Create New Password</Text>
                </View>
                <Text style={styles.infoText}>
                  Choose a strong password that you haven't used before. It
                  should be at least 6 characters long.
                </Text>
              </LinearGradient>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* New Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeIcon}
                  >
                    {showNewPassword ? (
                      <EyeOff color="#94a3b8" size={20} />
                    ) : (
                      <Eye color="#94a3b8" size={20} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Password Strength Indicator */}
                {newPassword.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor: passwordStrength.color,
                          width:
                            newPassword.length < 6
                              ? "33%"
                              : newPassword.length < 8
                              ? "66%"
                              : "100%",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.strengthText,
                        { color: passwordStrength.color },
                      ]}
                    >
                      {passwordStrength.text}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm New Password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    {showConfirmPassword ? (
                      <EyeOff color="#94a3b8" size={20} />
                    ) : (
                      <Eye color="#94a3b8" size={20} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Password Match Indicator */}
                {confirmPassword.length > 0 && (
                  <View style={styles.matchContainer}>
                    <CheckCircle
                      color={passwordsMatch ? "#22c55e" : "#ef4444"}
                      size={16}
                    />
                    <Text
                      style={[
                        styles.matchText,
                        { color: passwordsMatch ? "#22c55e" : "#ef4444" },
                      ]}
                    >
                      {passwordsMatch
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </Text>
                  </View>
                )}
              </View>

              {/* Reset Button */}
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  loading && styles.resetButtonDisabled,
                ]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <LinearGradient
                  colors={
                    loading ? ["#6b7280", "#4b5563"] : ["#22c55e", "#16a34a"]
                  }
                  style={styles.resetButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Key color="#fff" size={20} />
                      <Text style={styles.resetButtonText}>Reset Password</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Security Features */}
            <View style={styles.securitySection}>
              <View style={styles.securityItem}>
                <Shield color="#22c55e" size={16} />
                <Text style={styles.securityText}>256-bit encryption</Text>
              </View>
              <View style={styles.securityItem}>
                <Lock color="#60a5fa" size={16} />
                <Text style={styles.securityText}>Secure password reset</Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
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
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  headerBadgeText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  infoCard: {
    marginBottom: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  infoGradient: {
    padding: 20,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#e0e7ff",
    lineHeight: 20,
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
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
  eyeIcon: {
    paddingHorizontal: 16,
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
    flex: 1,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
  },
  matchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  matchText: {
    fontSize: 12,
    fontWeight: "600",
  },
  resetButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 12,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  securitySection: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 32,
    paddingVertical: 16,
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  securityText: {
    color: "#e0e7ff",
    fontSize: 12,
    fontWeight: "500",
  },
});
