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
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Key,
  CheckCircle,
  AlertTriangle,
} from "lucide-react-native";
import api from "../api/client";

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Keep all original backend logic exactly the same
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert("Error", "All fields are required.");
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert("Error", "New passwords do not match.");
    }

    if (newPassword.length < 6) {
      return Alert.alert(
        "Error",
        "New password must be at least 6 characters."
      );
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      Alert.alert("Success", res.data.msg || "Password changed successfully.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      console.error(
        "Change password error:",
        err.response?.data || err.message
      );
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
                <Lock color="#60a5fa" size={16} />
                <Text style={styles.headerBadgeText}>Security Update</Text>
              </View>
              <Text style={styles.headerTitle}>Change Password</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Info Card */}
            <View style={styles.infoCard}>
              <LinearGradient
                colors={[
                  "rgba(96, 165, 250, 0.15)",
                  "rgba(59, 130, 246, 0.05)",
                ]}
                style={styles.infoGradient}
              >
                <View style={styles.infoHeader}>
                  <Shield color="#60a5fa" size={24} />
                  <Text style={styles.infoTitle}>Update Your Password</Text>
                </View>
                <Text style={styles.infoText}>
                  Keep your account secure by updating your password regularly.
                  Make sure your new password is strong and unique.
                </Text>
              </LinearGradient>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Current Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.inputWrapper}>
                  <Key color="#94a3b8" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter current password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showCurrentPassword}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={styles.eyeIcon}
                  >
                    {showCurrentPassword ? (
                      <EyeOff color="#94a3b8" size={20} />
                    ) : (
                      <Eye color="#94a3b8" size={20} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
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
                    <View style={styles.strengthBarBackground}>
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
                    </View>
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
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
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
                    {passwordsMatch ? (
                      <CheckCircle color="#22c55e" size={16} />
                    ) : (
                      <AlertTriangle color="#ef4444" size={16} />
                    )}
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

              {/* Update Button */}
              <TouchableOpacity
                style={[
                  styles.updateButton,
                  loading && styles.updateButtonDisabled,
                ]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <LinearGradient
                  colors={
                    loading ? ["#6b7280", "#4b5563"] : ["#60a5fa", "#3b82f6"]
                  }
                  style={styles.updateButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Key color="#fff" size={20} />
                      <Text style={styles.updateButtonText}>
                        Update Password
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Security Tips */}
            <View style={styles.tipsCard}>
              <LinearGradient
                colors={["rgba(34, 197, 94, 0.1)", "rgba(16, 185, 129, 0.05)"]}
                style={styles.tipsGradient}
              >
                <View style={styles.tipsHeader}>
                  <Shield color="#22c55e" size={20} />
                  <Text style={styles.tipsTitle}>Security Tips</Text>
                </View>
                <Text style={styles.tipsText}>
                  • Use at least 8 characters{"\n"}• Include uppercase and
                  lowercase letters{"\n"}• Add numbers and special characters
                  {"\n"}• Don't reuse old passwords
                </Text>
              </LinearGradient>
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
    paddingBottom: 20,
  },
  infoCard: {
    marginBottom: 24,
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
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e0e7ff",
    marginBottom: 4,
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
    gap: 12,
    paddingHorizontal: 4,
  },
  strengthBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
  },
  strengthBar: {
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 60,
    textAlign: "right",
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
  updateButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 12,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  tipsCard: {
    marginTop: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  tipsGradient: {
    padding: 16,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 13,
    color: "#e0e7ff",
    lineHeight: 18,
  },
});
