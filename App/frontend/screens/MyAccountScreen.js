import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import api from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import BackButton from "../components/BackButton";

export default function MyAccountScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState("Loading...");
  const [isActive, setIsActive] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await api.get("/users/billing-info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { billingTier, isActive } = res.data || {};

        setCurrentTier(billingTier || "Not Set");
        setIsActive(
          isActive === true
            ? "Active"
            : isActive === false
            ? "Inactive"
            : "Unknown"
        );
      } catch (err) {
        console.error("Failed to fetch billing info:", err);
        setCurrentTier("Unavailable");
        setIsActive("Unavailable");
      }
    };
    fetchUser();
  }, []);

  const confirmAndUpdateTier = (tier) => {
    if (tier === currentTier) {
      Alert.alert("No Change", `You are already on the ${tier} plan.`);
      return;
    }

    Alert.alert(
      "Confirm Subscription Change",
      `Switch to ${
        tier === "hybrid" ? "Gold Subscription" : "Profit Sharing"
      }?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => handleUpdateTier(tier),
        },
      ]
    );
  };

  const handleUpdateTier = async (tier) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const { data } = await api.post(
        "/routes/stripe/update-billing",
        { billingTier: tier },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data?.url) {
        // Redirect to Stripe Checkout or Account Onboarding
        navigation.navigate("WebViewScreen", { url: data.url });
      } else {
        // No URL, just success
        setSuccessMessage(`✔️ Subscription updated to ${tier}.`);
        setCurrentTier(tier);
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (err) {
      console.error("❌ Billing update failed:", err);
      Alert.alert(
        "Error",
        err.response?.data?.msg || "Could not update billing."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await api.delete("/users/delete", {
                headers: { Authorization: `Bearer ${token}` },
                data: { reason: "Deleted from My Account Screen" },
              });
              await AsyncStorage.clear();
              Alert.alert("Deleted", "Your account has been deleted.");
              navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            } catch (err) {
              Alert.alert("Error", "Failed to delete account");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <BackButton />
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <Text style={styles.title}>My Account</Text>

          <Text style={styles.label}>Current Billing Tier: {currentTier}</Text>
          <Text style={styles.label}>Account Status: {isActive}</Text>
          {successMessage ? (
            <Text style={styles.successBanner}>{successMessage}</Text>
          ) : null}

          <Text style={styles.label}>Manage Billing Below:</Text>

          <TouchableOpacity
            style={[styles.button, currentTier === "hybrid" && styles.selected]}
            onPress={() => confirmAndUpdateTier("hybrid")}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Priority Subscription</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              currentTier === "profit_sharing" && styles.selected,
            ]}
            onPress={() => confirmAndUpdateTier("profit_sharing")}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Free Subscription</Text>
          </TouchableOpacity>

          {/* <Text style={styles.label}>Delete Account  Below:</Text> */}

          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              const token = await AsyncStorage.getItem("token");
              if (!token) {
                Alert.alert(
                  "Missing Token",
                  "You are not authorized to reset password this way."
                );
                return;
              }
              navigation.navigate("ResetPasswordScreen", { token });
            }}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.danger]}
            onPress={handleDeleteAccount}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Delete My Account</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    marginTop: 24,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  successBanner: {
    fontSize: 16,
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: 10,
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 4,
    textAlign: "center",
    fontWeight: "500",
  },
  button: {
    padding: 14,
    borderRadius: 6,
    backgroundColor: "#1976d2",
    marginBottom: 12,
    alignItems: "center",
    marginHorizontal: 24,
  },
  selected: {
    backgroundColor: "#004aad",
  },
  danger: {
    backgroundColor: "red",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});
