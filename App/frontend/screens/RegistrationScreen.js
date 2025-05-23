// frontend/screens/RegistrationScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
// If using @stripe/stripe-react-native (not modified here):
import { useStripe } from "@stripe/stripe-react-native";

import api from "../api/client";

const SERVICES = [
  "Electrician",
  "HVAC",
  "Plumbing",
  "Roofing",
  "Cleaning",
  "Handyman",
  "Odd_Jobs"
];
const BILLING = ["profit_sharing", "hybrid"]; // you can add "subscription" later

export default function RegistrationScreen() {
  const navigation = useNavigation();
  const stripe = useStripe();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phoneNumber: "",
    zipcode: "",
    role: "customer",
    serviceType: "",
    billingTier: ""
  });
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Acquire geolocation if permitted
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        setLocation([pos.coords.latitude, pos.coords.longitude]);
      }
    })();
  }, []);

  // Handle form field changes, plus reset provider-only fields when switching back to customer
  const onChange = (field, value) => {
    setFormData(prev => {
      if (field === "role") {
        return {
          ...prev,
          role: value,
          serviceType: value === "serviceProvider" ? prev.serviceType || SERVICES[0] : "",
          billingTier: value === "serviceProvider" ? prev.billingTier || BILLING[0] : ""
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const onSubmit = async () => {
    // must have address & zipcode
    if (!formData.address.trim() || !formData.zipcode.trim()) {
      Alert.alert("Error", "Address and zipcode are required.");
      return;
    }

    setLoading(true);
    try {
      // build payload
      const payload = { ...formData };
      if (location) {
        payload.location = {
          type: "Point",
          coordinates: [location[1], location[0]]
        };
      }

      if (formData.role === "customer") {
        // customer → always active & no provider fields
        payload.isActive = true;
        delete payload.serviceType;
        delete payload.billingTier;
      } else {
        // serviceProvider → always inactive until approved
        payload.isActive = false;
      }

      // register
      const signupRes = await api.post("/auth/register", payload);
      console.log("signupRes.data:", signupRes.data);

      // get token (fallback to login if none)
      let token = signupRes.data.token || signupRes.data.jwt;
      if (!token) {
        const loginRes = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password
        });
        token = loginRes.data.token || loginRes.data.jwt;
      }
      if (!token) throw new Error("No JWT returned.");

      // store token & name
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userName", signupRes.data.name || formData.name);

      // navigate
      if (formData.role === "customer") {
        Alert.alert("Success", "Signed up! Please log in.");
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }]   // ← fixed route name
        });
      } else {
        // service provider lands in their dashboard
        navigation.reset({
          index: 0,
          routes: [{ name: "ServiceProviderDashboard" }]
        });
      }
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Signup</Text>

      {/* Name */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={formData.name}
        onChangeText={val => onChange("name", val)}
      />

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        keyboardType="email-address"
        value={formData.email}
        onChangeText={val => onChange("email", val)}
      />

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={formData.password}
        onChangeText={val => onChange("password", val)}
      />

      {/* Address */}
      <Text style={styles.label}>Property Address</Text>
      <TextInput
        style={styles.input}
        value={formData.address}
        onChangeText={val => onChange("address", val)}
      />

      {/* Phone */}
      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        value={formData.phoneNumber}
        onChangeText={val => onChange("phoneNumber", val)}
      />

      {/* Zip */}
      <Text style={styles.label}>Zipcode</Text>
      <TextInput
        style={styles.input}
        value={formData.zipcode}
        onChangeText={val => onChange("zipcode", val)}
      />

      {/* Role */}
      <Text style={styles.label}>Select Role</Text>
      <View style={styles.selectRow}>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.role === "serviceProvider" && styles.selectOptionSelected
          ]}
          onPress={() => onChange("role", "serviceProvider")}
        >
          <Text style={styles.selectOptionText}>Earn with BlinqFix</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.role === "customer" && styles.selectOptionSelected
          ]}
          onPress={() => onChange("role", "customer")}
        >
          <Text style={styles.selectOptionText}>Book a BlinqFix Job</Text>
        </TouchableOpacity>
      </View>

      {/* Provider-only fields */}
      {formData.role === "serviceProvider" && (
        <>
          <Text style={styles.label}>Select Service Type</Text>
          <View style={styles.selectRow}>
            {SERVICES.map(svc => (
              <TouchableOpacity
                key={svc}
                style={[
                  styles.selectOptionSmall,
                  formData.serviceType === svc && styles.selectOptionSelected
                ]}
                onPress={() => onChange("serviceType", svc)}
              >
                <Text style={styles.selectOptionText}>{svc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={styles.submitBtnText}>
          {loading ? "Signing Up…" : "Sign Up"}
        </Text>
      </TouchableOpacity>

      {/* Already have an account */}
      <Text style={styles.footerText}>
        Already have an account?{" "}
        <Text style={styles.linkText} onPress={() => navigation.navigate("Login")}>
          Login
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", marginVertical: 25 },
  title: { fontSize: 24, fontWeight: "bold", marginVertical: 26, textAlign: "center" },
  label: { fontSize: 16, marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10 },
  selectRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  selectOption: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    backgroundColor: "#eee",
    borderRadius: 6,
    alignItems: "center"
  },
  selectOptionSmall: {
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#eee",
    borderRadius: 6
  },
  selectOptionSelected: {
    backgroundColor: "#a6e1fa",
    borderColor: "#1976d2",
    borderWidth: 1
  },
  selectOptionText: { fontSize: 14 },
  submitBtn: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#1976d2",
    borderRadius: 6,
    alignItems: "center"
  },
  submitBtnText: { color: "#fff", fontWeight: "600" },
  footerText: { marginTop: 16, textAlign: "center" },
  linkText: { color: "#1976d2", fontWeight: "600", textDecorationLine: "underline" }
});

