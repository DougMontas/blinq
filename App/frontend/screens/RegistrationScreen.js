import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Linking,
  Platform,
  Switch,
} from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as IntentLauncher from "expo-intent-launcher";
import * as Permissions from "expo-permissions";
import * as SMS from "expo-sms";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useStripe } from "@stripe/stripe-react-native";
import { Ionicons } from "@expo/vector-icons";

import api from "../api/client";
import BackButton from "../components/BackButton";
import ScreenWrapper from "../components/ScreenWrapper";

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
    // ssnLast4: "",
    // dob: "",
    zipcode: "",
    role: "customer",
    serviceType: "00000",
    billingTier: "",
  });
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [optInSms, setOptInSms] = useState(false);


  
  useEffect(() => {
    (async () => {
      try {
        // 📍 Location permission
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus === "granted") {
          const pos = await Location.getCurrentPositionAsync({});
          setLocation([pos.coords.latitude, pos.coords.longitude]);
        } else {
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
        }
  
        // 🔔 Notification permission
        const { status: notifStatus } = await Notifications.requestPermissionsAsync();
        if (notifStatus !== "granted") {
          Alert.alert("Notifications", "Enable notifications for updates.", [
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
            { text: "Cancel", style: "cancel" },
          ]);
        }
  
        // 📱 SMS (optional/logging only on Android)
        if (Platform.OS === "android") {
          console.log("ℹ️ Skipping SMS permission — not available in expo-permissions");
        }
  
      } catch (err) {
        console.warn("⚠️ Device permission check failed:", err.message);
        Alert.alert("Permissions Error", "Could not check device permissions.");
      }
    })();
  }, []);
  
  

  const onChange = (field, value) => {
    setFormData((prev) => {
      if (field === "role") {
        return {
          ...prev,
          role: value,
          serviceType: value === "serviceProvider" ? prev.serviceType || SERVICES[0] : "",
          billingTier: value === "serviceProvider" ? prev.billingTier || BILLING[0] : "",
        };
      }
      return { ...prev, [field]: value };
    });
  };

  
  const onSubmit = async () => {
    const requiredFields = ["name", "email", "password", "address", "phoneNumber", "zipcode"];
    if (formData.role === "serviceProvider") {
      requiredFields.push("billingTier", "serviceType");
    }
  
    for (let field of requiredFields) {
      if (!formData[field] || !formData[field].trim()) {
        Alert.alert("Error", `Please enter your ${field}`);
        return;
      }
    }
  
    setLoading(true);
    try {
      const payload = { ...formData, optInSms };
      if (location) {
        payload.location = {
          type: "Point",
          coordinates: [location[1], location[0]],
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
  
      // ✅ Confirm SetupIntent via PaymentSheet for hybrid tier
      if (formData.role === "serviceProvider" && formData.billingTier === "hybrid") {
        if (!subscriptionClientSecret) {
          Alert.alert("Stripe Error", "Missing client secret for setup intent.");
          return;
        }
  
        console.log("💳 Initializing PaymentSheet with SetupIntent:", subscriptionClientSecret);
  
        const { error: initError } = await initPaymentSheet({
          setupIntentClientSecret: subscriptionClientSecret,
          merchantDisplayName: "BlinqFix",
        });
  
        if (initError) {
          console.error("❌ PaymentSheet init error:", initError);
          Alert.alert("Stripe Error", initError.message);
          return;
        }
  
        const { error: presentError } = await presentPaymentSheet();
        if (presentError) {
          console.error("❌ PaymentSheet present error:", presentError);
          Alert.alert("Payment Error", presentError.message);
          return;
        }
  
        console.log("✅ Payment method setup complete");
      }
  
      if (!token) throw new Error("No token returned.");
      await AsyncStorage.setItem("token", token);
      if (refreshToken) await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("userName", formData.name);
  
      if (formData.role === "customer") {
        Alert.alert("Success", "Signed up! Please log in.");
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        return;
      }
  
      if (stripeOnboardingUrl || stripeDashboardUrl) {
        Alert.alert("Redirecting", "Complete onboarding with Stripe.");
        Linking.openURL(stripeOnboardingUrl || stripeDashboardUrl);
      }
  
      navigation.reset({ index: 0, routes: [{ name: "ServiceProviderDashboard" }] });
    } catch (err) {
      console.error("❌ Registration flow failed:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.msg || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };
  
 
  


  return (
    <ScreenWrapper>
      <BackButton />
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ padding: 16, marginBottom: "2rem" }}
        >
          <Text style={styles.title}>Signup</Text>
    
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(val) => onChange("name", val)}
          />
    
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(val) => onChange("email", val)}
          />
    
          <Text style={styles.label}>Password</Text>
          <View style={{ position: "relative" }}>
            <TextInput
              style={styles.input}
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(val) => onChange("password", val)}
            />
            <TouchableOpacity
              style={{
                position: "absolute",
                right: 16,
                top: "center",
                height: "100%",
                justifyContent: "center",
              }}
              onPress={() => setShowPassword((prev) => !prev)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#1976d2"
              />
            </TouchableOpacity>
          </View>
    
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(val) => onChange("address", val)}
          />
    
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={formData.phoneNumber}
            onChangeText={(val) => onChange("phoneNumber", val)}
          />
    
          <Text style={styles.label}>Zipcode</Text>
          <TextInput
            style={styles.input}
            value={formData.zipcode}
            onChangeText={(val) => onChange("zipcode", val)}
          />
    
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}
          >
            <Switch value={optInSms} onValueChange={setOptInSms} />
            <Text style={{ marginLeft: 8 }}>I agree to receive SMS alerts</Text>
          </View>
    
          <Text style={styles.label}>Select Role</Text>
          <View style={styles.selectRow}>
            <TouchableOpacity
              style={[
                styles.selectOption,
                formData.role === "serviceProvider" && styles.selectOptionSelected,
              ]}
              onPress={() => onChange("role", "serviceProvider")}
            >
              <Text style={styles.selectOptionText}>Earn with BlinqFix</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.selectOption,
                formData.role === "customer" && styles.selectOptionSelected,
              ]}
              onPress={() => onChange("role", "customer")}
            >
              <Text style={styles.selectOptionText}>Book a BlinqFix Job</Text>
            </TouchableOpacity>
          </View>
    
          {formData.role === "serviceProvider" && (
            <>
              {/* <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={formData.dob}
                onChangeText={(val) => onChange("dob", val)}
                placeholder="1980-12-31"
              />
    
              <Text style={styles.label}>Last 4 of SSN</Text>
              <TextInput
                style={styles.input}
                value={formData.ssnLast4}
                onChangeText={(val) => onChange("ssnLast4", val)}
                placeholder="1234"
                keyboardType="numeric"
                maxLength={4}
              /> */}
  
              <Text style={styles.label}>Select Service Type</Text>
              <View style={styles.selectRow}>
                {SERVICES.map((svc) => (
                  <TouchableOpacity
                    key={svc}
                    style={[
                      styles.selectOptionSmall,
                      formData.serviceType === svc && styles.selectOptionSelected,
                    ]}
                    onPress={() => onChange("serviceType", svc)}
                  >
                    <Text style={styles.selectOptionText}>{svc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Select Subscription</Text>
              <View style={styles.selectRow}>
                {BILLING.map((tier) => (
                  <TouchableOpacity
                    key={tier}
                    style={[
                      styles.selectOptionSmall,
                      formData.billingTier === tier && styles.selectOptionSelected,
                    ]}
                    onPress={() => onChange("billingTier", tier)}
                  >
                    <Text style={styles.selectOptionText}>
                      {tier === "hybrid"
                        ? "BlinqFix Priority"
                        : "BlinqFix Go (Free)"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
    
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? "Signing Up…" : "Sign Up"}
            </Text>
          </TouchableOpacity>
    
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate("Login")}
            >
              Login
            </Text>
          </Text>
        </ScrollView>
        </ScreenWrapper>
      );
    }
    
    const styles = StyleSheet.create({
      container: { backgroundColor: "#fff", marginVertical: 25 },
      title: {
        fontSize: 24,
        fontWeight: "bold",
        marginVertical: 26,
        textAlign: "center",
      },
      label: { fontSize: 16, marginTop: 12, marginBottom: 4 },
      input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10 },
      selectRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
      selectOption: {
        flex: 1,
        padding: 10,
        marginHorizontal: 4,
        backgroundColor: "#eee",
        borderRadius: 6,
        alignItems: "center",
      },
      selectOptionSmall: {
        padding: 8,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: "#eee",
        borderRadius: 6,
      },
      selectOptionSelected: {
        backgroundColor: "#a6e1fa",
        borderColor: "#1976d2",
        borderWidth: 1,
      },
      selectOptionText: { fontSize: 14 },
      submitBtn: {
        marginTop: 20,
        padding: 16,
        backgroundColor: "#1976d2",
        borderRadius: 6,
        alignItems: "center",
      },
      submitBtnText: { color: "#fff", fontWeight: "600" },
      footerText: { marginTop: 16, textAlign: "center", marginBottom: "-2rem" },
      linkText: {
        color: "#1976d2",
        fontWeight: "600",
        textDecorationLine: "underline",
      },
    });
