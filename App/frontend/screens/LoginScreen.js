// screens/LoginScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as IntentLauncher from "expo-intent-launcher";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";

import api from "../api/client";
import { useAuth, navigationRef } from "../context/AuthProvider";
import TestMapScreen from "./TestMapScreen";

/** ---------- helpers ---------- */
function parseJwt(token) {
  if (!token) return null;
  const base64Url = token.split(".")[1];
  if (!base64Url) return null;
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const binary =
    typeof atob === "function"
      ? atob(base64)
      : Buffer.from(base64, "base64").toString("binary");
  const jsonPayload = decodeURIComponent(
    binary
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

function roleToScreen(role) {
  const r = role?.toLowerCase();
  if (r === "serviceprovider" || r === "provider")
    return "ServiceProviderDashboard";
  if (r === "admin") return "AdminDashboard";
  return "CustomerDashboard";
}

// Minimal push registration
async function registerForPushNotificationsAsync() {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return null;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData?.data || null;
  } catch {
    return null;
  }
}

export default function Screen() {
  const navigation = useNavigation();
  const { setRole } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { width } = Dimensions.get("window");
  const LOGO_SIZE = width * 0.55;

  /** ---------- side effects: permissions (no push-token POST here) ---------- */
  useEffect(() => {
    (async () => {
      try {
        // Location
        const { status: locStatus } =
          await Location.getForegroundPermissionsAsync();
        if (locStatus !== "granted") {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Location Required", "Enable location in settings.", [
              {
                text: "Open Settings",
                onPress: () => {
                  if (Platform.OS === "ios") {
                    Linking.openURL("app-settings:");
                  } else {
                    IntentLauncher.startActivityAsync(
                      IntentLauncher.ACTION_LOCATION_SOURCE_SETTINGS
                    );
                  }
                },
              },
            ]);
          }
        }

        // Notifications
        const notifPerm = await Notifications.getPermissionsAsync();
        if (notifPerm.status !== "granted") {
          const req = await Notifications.requestPermissionsAsync();
          if (req.status !== "granted") {
            Alert.alert("Notifications", "Enable notifications for updates.", [
              { text: "Open Settings", onPress: () => Linking.openSettings() },
              { text: "Cancel", style: "cancel" },
            ]);
          }
        }
      } catch {
        // permission checks are non-blocking
      }
    })();
  }, []);

  /** ---------- handlers ---------- */
  const onSubmit = async () => {
    try {
      setLoading(true);
      const creds = { email: email.trim().toLowerCase(), password };

      const { data } = await api.post("/auth/login", creds, {
        headers: { "Content-Type": "application/json" },
      });
      if (!data?.token) throw new Error("Token missing from response");

      // store tokens
      await AsyncStorage.setItem("token", data.token);
      if (data.refreshToken) {
        await AsyncStorage.setItem("refreshToken", data.refreshToken);
      }

      // read role + stripe account from access token
      const payload = parseJwt(data.token);
      const role = payload?.role || "customer";
      const stripeAccountId = payload?.stripeAccountId;
      setRole(role);

      // send push token AFTER login so it's authenticated
      try {
        const expoPushToken = await registerForPushNotificationsAsync();
        if (expoPushToken) {
          await api.post("/users/push-token", { token: expoPushToken });
        }
      } catch {
        // non-blocking
      }

      // Service providers: check Stripe onboarding (non-heavy)
      if (role === "serviceProvider" && stripeAccountId) {
        try {
          const checkRes = await api.post("/routes/stripe/check-onboarding", {
            stripeAccountId,
          });
          const { needsOnboarding, stripeOnboardingUrl, stripeDashboardUrl } =
            checkRes.data || {};
          if (needsOnboarding) {
            const redirectUrl = stripeOnboardingUrl || stripeDashboardUrl;
            if (!redirectUrl || typeof redirectUrl !== "string") {
              Alert.alert("Error", "Onboarding link is invalid or missing.");
            } else {
              Alert.alert("Redirecting", "Complete onboarding with Stripe.");
              await Linking.openURL(redirectUrl);
            }
            return; // stop here; user will return after onboarding
          }
        } catch {
          Alert.alert(
            "Error",
            "Unable to check onboarding. Please try again later."
          );
          return;
        }
      }

      // 🔹 Decide route via tiny summary (avoid heavy profile/doc fetches)
      try {
        const { data: summary } = await api.get("/users/me/summary");
        const bootRole = summary?.user?.role || role;
        let target = "LandingPage";
        if (bootRole === "serviceProvider") {
          target = summary.profileComplete
            ? "ServiceProviderDashboard"
            : "ProviderProfile";
        } else if (bootRole === "customer") {
          target = "CustomerDashboard";
        } else if (bootRole === "admin") {
          target = "AdminDashboard";
        }

        const action = { index: 0, routes: [{ name: target }] };
        if (navigationRef?.isReady?.()) navigationRef.reset(action);
        else if (navigation && typeof navigation.reset === "function")
          navigation.reset(action);
      } catch {
        // fallback by role if summary fails
        const target = roleToScreen(role);
        const action = { index: 0, routes: [{ name: target }] };
        if (navigationRef?.isReady?.()) navigationRef.reset(action);
        else if (navigation && typeof navigation.reset === "function")
          navigation.reset(action);
      }
    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        err.message ||
        "Login failed – check credentials.";
      Alert.alert("Error", msg);
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/blinqfix_logo-new.jpeg")}
                  style={{
                    width: LOGO_SIZE,
                    height: LOGO_SIZE,
                    marginInline: "auto",
                  }}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>
                Enter your credentials to access your account
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View className="row" style={styles.inputContainer}>
                <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff color="#94a3b8" size={20} />
                  ) : (
                    <Eye color="#94a3b8" size={20} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() =>
                  navigation.navigate("RequestPasswordResetScreen")
                }
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={onSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={["#22c55e", "#16a34a"]}
                style={styles.loginButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Secure Login</Text>
                    <ArrowRight color="#fff" size={20} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer / Sign Up Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Registration")}
              >
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Trust Indicator */}
            <View style={styles.trustIndicator}>
              <Shield color="#22c55e" size={16} />
              <Text style={styles.trustText}>Your connection is secure</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: { alignItems: "center", marginBottom: 40 },
  logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
  title: { fontSize: 32, fontWeight: "900", color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#e0e7ff", textAlign: "center" },
  formContainer: { gap: 16 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  inputIcon: { paddingHorizontal: 16 },
  input: { flex: 1, paddingVertical: 18, fontSize: 16, color: "#fff" },
  eyeIcon: { paddingHorizontal: 16 },
  forgotPasswordButton: { alignSelf: "flex-end", marginTop: 4 },
  forgotPasswordText: { color: "#60a5fa", fontSize: 14, fontWeight: "600" },
  loginButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  loginButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
  },
  loginButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  footerText: { color: "#e0e7ff", fontSize: 16 },
  footerLink: {
    color: "#60a5fa",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 6,
  },
  trustIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  trustText: {
    color: "#22c55e",
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "500",
  },
});
