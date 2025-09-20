// app/screens/RegistrationScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Link,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Linking,
  Platform,
  Switch,
  SafeAreaView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as IntentLauncher from "expo-intent-launcher";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useStripe } from "@stripe/stripe-react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Briefcase,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  UserCircle,
  ArrowRight,
} from "lucide-react-native";

import api from "../api/client";
import FooterPro from "../components/FooterPro";

const SERVICES = ["Electrician", "HVAC", "Plumbing", "Roofing", "Handyman"];
const BILLING = ["profit_sharing", "hybrid"];

const BILLING_PRODUCTS = {
  profit_sharing: "prod_Se5JgrG5D9G2Wq",
  hybrid: "prod_Se4dOaW9m5lRpw",
};

export default function RegistrationScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phoneNumber: "",
    zipcode: "",
    role: "customer",
    serviceType: SERVICES[0],
    billingTier: BILLING[0],
  });

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ SMS preferences (two separate opt-ins)
  const [smsJobUpdates, setSmsJobUpdates] = useState(false);
  const [smsMarketing, setSmsMarketing] = useState(false);
  const [savingSmsPrefs, setSavingSmsPrefs] = useState(false);

  // Helpers to normalize zip data to what the backend model expects
  const normalizeZipArray = (zip) => {
    const z = String(zip || "").trim();
    return z ? [z] : [];
  };
  const serviceZipsFromZipcode = (zip) => {
    const n = parseInt(String(zip || "").replace(/\D/g, ""), 10);
    return Number.isFinite(n) ? [n] : [];
  };

  const registerPushTokenIfPossible = async () => {
    // Try to get an Expo push token and store it if we already have an auth token.
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const settings = await Notifications.getPermissionsAsync();
      if (settings.status !== "granted") return;

      const expoPushToken = await Notifications.getExpoPushTokenAsync();
      if (expoPushToken?.data) {
        await api.post("/users/push-token", { token: expoPushToken.data });
      }
    } catch (e) {
      // Non-fatal
      console.log("push token registration skipped:", e?.message);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { status: locStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (locStatus !== "granted") {
          Alert.alert("Location Required", "Enable location in settings.", [
            {
              text: "Go to Settings",
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
        } else {
          const pos = await Location.getCurrentPositionAsync({});
          setLocation([pos.coords.latitude, pos.coords.longitude]); // [lat, lng]
        }

        const { status: notifStatus } =
          await Notifications.requestPermissionsAsync();
        if (notifStatus !== "granted") {
          Alert.alert("Notifications", "Enable notifications for updates.", [
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
            { text: "Cancel", style: "cancel" },
          ]);
        }
      } catch (err) {
        console.warn("⚠️ Device permission check failed:", err.message);
      }
    })();
  }, []);

  // Load locally-stored SMS prefs (user likely not logged in yet)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("smsPrefs");
        if (raw) {
          const parsed = JSON.parse(raw);
          setSmsJobUpdates(!!parsed.jobUpdates);
          setSmsMarketing(!!parsed.marketing);
        }
      } catch {}
    })();
  }, []);

  const onChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Save button on the card — stores locally; if already authenticated, also hits the API
  const handleSaveSmsPreferences = async () => {
    setSavingSmsPrefs(true);
    try {
      await AsyncStorage.setItem(
        "smsPrefs",
        JSON.stringify({ jobUpdates: smsJobUpdates, marketing: smsMarketing })
      );

      // If token exists, try to persist to backend too
      const existingToken = await AsyncStorage.getItem("token");
      if (existingToken) {
        try {
          await api.put("/users/me/sms-preferences", {
            jobUpdates: smsJobUpdates,
            marketing: smsMarketing,
          });
          Alert.alert("Saved", "Your SMS preferences have been updated.");
        } catch {
          Alert.alert(
            "Saved Locally",
            "We’ll sync these preferences to your account shortly."
          );
        }
      } else {
        Alert.alert(
          "Saved",
          "We’ll apply these preferences to your new account on signup."
        );
      }
    } catch {
      Alert.alert("Error", "Could not save your SMS preferences.");
    } finally {
      setSavingSmsPrefs(false);
    }
  };

  const onSubmit = async () => {
    const requiredFields = [
      "name",
      "email",
      "password",
      "address",
      "phoneNumber",
      "zipcode",
    ];
    if (formData.role === "serviceProvider") {
      requiredFields.push("billingTier", "serviceType");
    }

    for (let field of requiredFields) {
      if (!formData[field] || !String(formData[field]).trim()) {
        Alert.alert("Error", `Please enter your ${field}`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        // ✅ model expects arrays for zipcode; send as [string]
        zipcode: normalizeZipArray(formData.zipcode),
        // ✅ include SMS prefs in registration payload
        smsPreferences: {
          jobUpdates: smsJobUpdates,
          marketing: smsMarketing,
        },
      };

      // ✅ add serviceZipcode for providers (model validator requires at least one)
      if (formData.role === "serviceProvider") {
        payload.serviceZipcode = serviceZipsFromZipcode(formData.zipcode);
      }

      if (location) {
        payload.location = {
          type: "Point",
          coordinates: [location[1], location[0]], // [lng, lat]
        };
      }

      if (formData.role === "customer") {
        payload.isActive = true;
        delete payload.serviceType;
        delete payload.billingTier;
      } else {
        payload.isActive = false;
        payload.stripeProductId = BILLING_PRODUCTS[formData.billingTier];
      }

      console.log("📤 Registering user with payload:", payload);
      const signupRes = await api.post("/auth/register", payload);

      const {
        token,
        refreshToken,
        stripeOnboardingUrl,
        stripeDashboardUrl,
        subscriptionClientSecret,
      } = signupRes.data || {};

      // Stripe (hybrid) – set up payment method
      if (
        formData.role === "serviceProvider" &&
        formData.billingTier === "hybrid"
      ) {
        if (!subscriptionClientSecret) {
          Alert.alert(
            "Stripe Error",
            "Missing client secret for setup intent."
          );
          setLoading(false);
          return;
        }

        const { error: initError } = await initPaymentSheet({
          setupIntentClientSecret: subscriptionClientSecret,
          merchantDisplayName: "BlinqFix",
          style: "alwaysDark",
        });

        if (initError) {
          Alert.alert("Stripe Error", initError.message);
          setLoading(false);
          return;
        }

        const { error: presentError } = await presentPaymentSheet();
        if (presentError) {
          Alert.alert("Payment Error", presentError.message);
          setLoading(false);
          return;
        }
      }

      if (!token) throw new Error("No token returned.");
      await AsyncStorage.setItem("token", token);
      if (refreshToken)
        await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("userName", formData.name);

      // Persist SMS prefs (now authenticated)
      try {
        await api.put("/users/me/sms-preferences", {
          jobUpdates: smsJobUpdates,
          marketing: smsMarketing,
        });
      } catch {}

      // Try to register push token quietly (non-blocking)
      registerPushTokenIfPossible();

      if (formData.role === "customer") {
        Alert.alert(
          "Success",
          "Welcome to BlinqFix! Please log in to continue."
        );
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      } else {
        if (stripeOnboardingUrl || stripeDashboardUrl) {
          Alert.alert(
            "Almost there!",
            "Complete your secure onboarding with Stripe to activate your account."
          );
          Linking.openURL(stripeOnboardingUrl || stripeDashboardUrl);
        }
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }
    } catch (err) {
      console.error(
        "❌ Registration flow failed:",
        err.response?.data || err.message
      );
      Alert.alert(
        "Error",
        err.response?.data?.msg ||
          "Signup failed. Please check your details and try again."
      );
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
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <ArrowLeft color="#fff" size={24} />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <View style={styles.headerBadge}>
                  <Shield color="#22c55e" size={14} />
                  <Text style={styles.headerBadgeText}>
                    Secure & Fast Signup
                  </Text>
                </View>
                <Text style={styles.title}>Create Your Account</Text>
              </View>
              <View style={{ width: 44 }} />
            </View>

            {/* Role Selection */}
            <View style={styles.roleSelectionContainer}>
              {[
                { role: "customer", label: "Book a Job", icon: UserCircle },
                {
                  role: "serviceProvider",
                  label: "Earn with Blinqfix",
                  icon: Briefcase,
                },
              ].map(({ role, label, icon: Icon }) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleCard,
                    formData.role === role && styles.roleCardSelected,
                  ]}
                  onPress={() => onChange("role", role)}
                >
                  <Icon
                    color={formData.role === role ? "#fff" : "#60a5fa"}
                    size={28}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      formData.role === role && styles.roleTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form Inputs */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <User color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#94a3b8"
                  value={formData.name}
                  onChangeText={(val) => onChange("name", val)}
                />
              </View>
              <View style={styles.inputContainer}>
                <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(val) => onChange("email", val)}
                />
              </View>
              <View style={styles.inputContainer}>
                <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(val) => onChange("password", val)}
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
              <View style={styles.inputContainer}>
                <MapPin color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Address"
                  placeholderTextColor="#94a3b8"
                  value={formData.address}
                  onChangeText={(val) => onChange("address", val)}
                />
              </View>
              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <MapPin color="#94a3b8" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Zip Code"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={formData.zipcode}
                    onChangeText={(val) => onChange("zipcode", val)}
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1.5 }]}>
                  <Phone color="#94a3b8" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    value={formData.phoneNumber}
                    onChangeText={(val) => onChange("phoneNumber", val)}
                  />
                </View>
              </View>
            </View>

            {/* Service Provider Options */}
            {formData.role === "serviceProvider" && (
              <View style={styles.providerSection}>
                <Text style={styles.sectionTitle}>Your Service Details</Text>

                <Text style={styles.label}>Primary Service</Text>
                <View style={styles.chipsContainer}>
                  {SERVICES.map((svc) => (
                    <TouchableOpacity
                      key={svc}
                      style={[
                        styles.chip,
                        formData.serviceType === svc && styles.chipSelected,
                      ]}
                      onPress={() => onChange("serviceType", svc)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          formData.serviceType === svc &&
                            styles.chipTextSelected,
                        ]}
                      >
                        {svc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Subscription Plan</Text>
                <View style={styles.chipsContainer}>
                  {BILLING.map((tier) => (
                    <TouchableOpacity
                      key={tier}
                      style={[
                        styles.chip,
                        formData.billingTier === tier && styles.chipSelected,
                      ]}
                      onPress={() => onChange("billingTier", tier)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          formData.billingTier === tier &&
                            styles.chipTextSelected,
                        ]}
                      >
                        {tier === "hybrid"
                          ? "BlinqFix Priority"
                          : "BlinqFix Go (Free)"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.planDescription}>
                  {formData.billingTier === "hybrid"
                    ? "Priority access to jobs and lower platform fees. A payment method is required for the monthly subscription."
                    : "Get started with no upfront cost. Standard platform fees apply to completed jobs."}
                </Text>
              </View>
            )}

            {/* ✅ SMS Preferences Card */}
            <View style={styles.prefsCard}>
              <Text style={styles.prefsHeadline}>
                Stay Connected with BlinqFix
              </Text>
              {/* <Text style={styles.prefsIntro}>
                Message &amp; data rates may apply.
              </Text> */}

              {/* Job Notifications & Updates */}
              <View style={styles.preferenceBlock}>
                <View style={styles.preferenceHeader}>
                  <Text style={styles.preferenceTitle}>
                    Job Notifications &amp; Updates
                  </Text>
                  <Switch
                    value={smsJobUpdates}
                    onValueChange={setSmsJobUpdates}
                    trackColor={{
                      false: "rgba(255,255,255,0.2)",
                      true: "#22c55e",
                    }}
                    thumbColor={Platform.OS === "android" ? "#fff" : undefined}
                  />
                </View>
                <Text style={styles.preferenceDesc}>
                  Customers opt in on the BlinqFix website or app to receive SMS
                  notifications for emergency repair updates and appointment
                  reminders. Opt-in is collected via an unchecked checkbox with
                  full disclosure, including message purpose, frequency,
                  STOP/HELP instructions, data rate notice, and a direct Privacy
                  Policy link.
                </Text>
                <View
                  style={{
                    marginTop: 10,
                    flexWrap: "wrap",
                    flexDirection: "row",
                  }}
                >
                  <Text style={styles.preferenceDesc}>
                    <Text
                      onPress={() =>
                        navigation.navigate("ProviderTermsAndAgreement")
                      }
                    >
                      <Text
                        style={[
                          styles.preferenceDesc,
                          { textDecorationLine: "underline", color: "#60a5fa" },
                        ]}
                      >
                        Terms of Service
                      </Text>{" "}
                      {""}
                      and{" "}
                      <Text
                        style={{
                          textDecorationLine: "underline",
                          color: "#60a5fa",
                        }}
                        onPress={() => navigation.navigate("PrivacyPolicy")}
                      >
                        Privacy Policy
                      </Text>
                      .
                    </Text>
                  </Text>
                </View>
                {/* <Text style={styles.preferenceMeta}>
                  Frequency: As needed per job and for the occasional promtion
                  and or discounts we will offer. Reply STOP to unsubscribe at
                  any time. Msg & data rates may apply. Reply HELP for help.
                </Text> */}
              </View>

              {/* Promotions & Marketing */}
              {/* <View style={styles.preferenceBlock}>
                <View style={styles.preferenceHeader}>
                  <Text style={styles.preferenceTitle}>
                    Promotions &amp; Marketing Messages
                  </Text>
                  <Switch
                    value={smsMarketing}
                    onValueChange={setSmsMarketing}
                    trackColor={{
                      false: "rgba(255,255,255,0.2)",
                      true: "#22c55e",
                    }}
                    thumbColor={Platform.OS === "android" ? "#fff" : undefined}
                  />
                </View>
                <View
                  style={{
                    marginTop: 10,
                    flexWrap: "wrap",
                    flexDirection: "row",
                  }}
                >
                  <Text style={styles.preferenceDesc}>
                    I agree to receive SMS messages about special offers,
                    promotions, platform updates, and new services from
                    BlinqFix. 
                      
                    
                  </Text>
                </View>
                <Text style={styles.preferenceMeta}>
                  Reply STOP to unsubscribe at any time. Reply HELP for help.
                </Text>
              </View> */}

              <TouchableOpacity
                onPress={handleSaveSmsPreferences}
                disabled={savingSmsPrefs}
                style={[
                  styles.savePrefsButton,
                  savingSmsPrefs && { opacity: 0.8 },
                ]}
              >
                <LinearGradient
                  colors={["#22c55e", "#16a34a"]}
                  style={styles.savePrefsGradient}
                >
                  {savingSmsPrefs ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.savePrefsButtonText}>
                      Save My Preferences
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.prefsSmallPrint}>
                By tapping “Save My Preferences,” you consent to receive the
                selected types of automated SMS messages from BlinqFix at the
                phone number provided. Your consent is not a condition of
                purchase. You can opt out of each type separately by replying
                STOP.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={onSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={
                  loading ? ["#4ade80", "#3b82f6"] : ["#22c55e", "#16a34a"]
                }
                style={styles.submitButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Create Account</Text>
                    <ArrowRight color="#fff" size={20} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.footerLink}>Log In</Text>
              </TouchableOpacity>
            </View>
            <FooterPro />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, marginTop: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: { alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  headerBadgeText: {
    color: "#22c55e",
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "500",
  },

  roleSelectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 16,
  },
  roleCard: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    gap: 12,
  },
  roleCardSelected: {
    backgroundColor: "rgba(96, 165, 250, 0.2)",
    borderColor: "#60a5fa",
  },
  roleText: { fontSize: 16, color: "#e0e7ff", fontWeight: "600" },
  roleTextSelected: { color: "#fff" },

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
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: "#fff" },
  eyeIcon: { paddingHorizontal: 16 },
  row: { flexDirection: "row", gap: 16 },

  providerSection: {
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e0e7ff",
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  chipSelected: { backgroundColor: "#60a5fa", borderColor: "#60a5fa" },
  chipText: { color: "#e0e7ff", fontWeight: "600" },
  chipTextSelected: { color: "#fff" },
  planDescription: { fontSize: 13, color: "#94a3b8", lineHeight: 18 },

  // ✅ SMS Prefs styles
  prefsCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  prefsHeadline: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  prefsIntro: {
    color: "#e0e7ff",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  preferenceBlock: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 14,
  },
  preferenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  preferenceTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
    paddingRight: 8,
  },
  preferenceDesc: { color: "#e0e7ff", fontSize: 14, lineHeight: 20 },
  preferenceMeta: {
    color: "#c7d2fe",
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
    textAlign: "center",
  },
  savePrefsButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  savePrefsGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  savePrefsButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  prefsSmallPrint: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
    textAlign: "center",
  },

  submitButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
  },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: { color: "#e0e7ff", fontSize: 16 },
  footerLink: { color: "#60a5fa", fontSize: 16, fontWeight: "bold" },
});
