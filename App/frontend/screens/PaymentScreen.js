import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useStripe, StripeProvider } from "@stripe/stripe-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../api/client";
import Constants from "expo-constants";
import LoadingScreen from "./LoadingScreen";
import { getCoveredDescription } from "../utils/serviceMatrix";

const FEE_RATE = 0.07;

export default function PaymentScreen() {
  const navigation = useNavigation();

  // ✅ Safely extract jobId from route params
  const route = useRoute();
  const jobId = route?.params?.jobId;

  if (!jobId) {
    console.warn("⚠️ Missing jobId param on PaymentScreen route");
    return (
      <View style={styles.container}>
        <Text>Missing job reference. Cannot proceed with payment.</Text>
      </View>
    );
  }

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [job, setJob] = useState(null);

  const validateSheetParams = (params) => {
    if (!params?.customer?.startsWith("cus_")) return false;
    if (!params?.ephemeralKey?.startsWith("ek_")) return false;
    if (!params?.paymentIntentClientSecret?.includes("_secret_")) return false;
    return true;
  };

  useEffect(() => {
    const preparePayment = async () => {
      setLoadingSheet(true);
      try {
        const { data: jobData } = await api.get(`/jobs/${jobId}`);
        setJob(jobData);

        const customerName = `${
          jobData?.customer?.name || jobData?.firstName || ""
        } ${jobData?.customer?.lastName || jobData?.lastName || ""}`.trim();
        const customerEmail =
          jobData?.customer?.email ||
          jobData?.email ||
          jobData?.customerEmail ||
          "";

        const { data: sheetParams } = await api.post(
          "/payments/payment-sheet",
          {
            jobId,
            customerName,
            customerEmail,
          }
        );

        if (!validateSheetParams(sheetParams)) {
          Alert.alert("Stripe Error", "Invalid payment session returned.");
          return;
        }

        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: "BlinqFix",
          customerId: sheetParams.customer,
          customerEphemeralKeySecret: sheetParams.ephemeralKey,
          paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
          allowsDelayedPaymentMethods: true,
          returnURL:
            "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/app/stripe/onboarding-success",
        });

        if (initError) {
          Alert.alert(
            "Stripe Error",
            initError.message || "Could not initialize payment sheet."
          );
          return;
        }

        setPaymentReady(true);
      } catch (err) {
        Alert.alert("Stripe Error", "Could not initialize payment sheet.");
      } finally {
        setLoadingSheet(false);
      }
    };

    preparePayment();
  }, [jobId]);

  const handlePay = async () => {
    if (!paymentReady)
      return Alert.alert(
        "Payment not ready",
        "Please wait while we prepare your payment."
      );
    try {
      const { error } = await presentPaymentSheet();
      if (error)
        return Alert.alert(
          "Payment Failed",
          error.message || "Unknown error occurred."
        );

      setShowAnimation(true);
      await api.put(`/jobs/complete-payment/${jobId}`);
    } catch (err) {
      Alert.alert("Error", "Failed to complete payment.");
    }
  };

  const description = getCoveredDescription(job?.details?.issue);

  if (loadingSheet || !job) {
    return (
      <View style={styles.container} key="loading">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (showAnimation) {
    return (
      <LoadingScreen
        animationOnly
        enterDuration={800}
        holdDuration={400}
        exitDuration={800}
        onAnimationEnd={() =>
          navigation.navigate("CustomerJobStatus", { jobId })
        }
      />
    );
  }

  return (
    <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
      <View style={styles.container} key={jobId}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Estimate Details</Text>
          {job.additionalCharge > 0 && (
            <Text style={{ textAlign: "center" }}>
              Extra charge: ${job.additionalCharge.toFixed(2)}
            </Text>
          )}
          <Text style={styles.totalLine}>
            Total: ${job.estimatedTotal.toFixed(2)}
          </Text>
          <Text style={styles.sectionTitle}>What’s Covered:</Text>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        {job.additionalCharge > 0 && (
          <View style={styles.additionalCard}>
            <Text style={styles.additionalCardTitle}>Additional Charge</Text>
            <Text style={styles.additionalCardText}>
              Amount: ${job.additionalCharge.toFixed(2)}
            </Text>
            {job.additionalChargeReason && (
              <Text style={styles.additionalCardText}>
                Description: {job.additionalChargeReason}
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.payButton,
            !paymentReady && { backgroundColor: "#ccc" },
          ]}
          onPress={handlePay}
          disabled={!paymentReady}
        >
          <Text style={styles.payButtonText}>Pay & Book</Text>
        </TouchableOpacity>
      </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  payButton: {
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  summaryCard: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  totalLine: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 20,
    fontSize: 18,
    textAlign: "center",
  },
  descriptionText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  additionalCard: {
    width: "90%",
    backgroundColor: "#fdf6ec",
    borderLeftWidth: 4,
    borderLeftColor: "#ffa726",
    padding: 16,
    borderRadius: 10,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  additionalCardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e65100",
    marginBottom: 4,
    textAlign: "center",
  },
  additionalCardText: {
    fontSize: 15,
    color: "#5d4037",
    fontWeight: "600",
    marginBottom: 2,
    textAlign: "center",
  },
});
