//Payment Screen
import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  CreditCard,
  Shield,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Zap,
  DollarSign,
  Lock,
} from "lucide-react-native";
import api from "../api/client";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCoveredDescription } from "../utils/serviceMatrix";

/* ---------- helpers ---------- */
const L = (...args) => console.log("🧾 [PaymentScreen]", ...args);

const getPublishableKey = () =>
  Constants?.expoConfig?.extra?.stripeKey ||
  Constants?.manifest?.extra?.stripeKey ||
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "";

const normalizeSheetParams = (raw) => {
  if (!raw || typeof raw !== "object") return {};
  const customer = raw.customer || raw.customerId || raw.cus || null;
  const ephemeralKey =
    raw.ephemeralKey?.secret ||
    raw.ephemeral_key?.secret ||
    raw.ephemeralKey ||
    raw.ephemeral_key ||
    null;
  const paymentIntentClientSecret =
    raw.paymentIntentClientSecret ||
    raw.payment_intent_client_secret ||
    raw.clientSecret ||
    null;
  const stripeAccountId = raw.stripeAccountId || raw.account || undefined;
  return { customer, ephemeralKey, paymentIntentClientSecret, stripeAccountId };
};

const isValidSheetParams = (p) =>
  !!p &&
  typeof p.customer === "string" &&
  typeof p.ephemeralKey === "string" &&
  typeof p.paymentIntentClientSecret === "string" &&
  p.paymentIntentClientSecret.includes("_secret_");

const ensureAuthHeader = async () => {
  try {
    if (!api.defaults.headers?.common?.Authorization) {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        L("Auth header set from storage");
      } else {
        L("No token in storage; proceeding without Authorization header");
      }
    } else {
      L("Auth header already present");
    }
  } catch (e) {
    L("ensureAuthHeader error:", e?.message || e);
  }
};

const deriveRouteJobId = (params) =>
  params?.jobId || params?.id || params?.job?._id || params?.job?.id || null;

/* ---------- outer provider ---------- */
export default function PaymentScreen() {
  const route = useRoute();
  const pk = getPublishableKey();
  const stripeAccountId = route?.params?.stripeAccountId || undefined;

  L(
    "Stripe publishable key present:",
    Boolean(pk),
    "acct:",
    stripeAccountId || "(platform)"
  );

  if (!pk) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#312e81"]}
        style={styles.container}
      >
        <View style={styles.errorContainer}>
          <AlertTriangle color="#f87171" size={48} />
          <Text style={styles.errorText}>
            Stripe publishable key is missing. Please configure it in app
            config.
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <StripeProvider publishableKey={pk} stripeAccountId={stripeAccountId}>
      <PaymentScreenInner />
    </StripeProvider>
  );
}

/* ---------- inner ---------- */
function PaymentScreenInner() {
  const navigation = useNavigation();
  const route = useRoute();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    L("Mounted. route.name:", route?.name, "params:", route?.params);
    try {
      const s = navigation?.getState?.();
      L(
        "Nav current route:",
        s?.routes?.[s?.index || 0]?.name,
        "params:",
        s?.routes?.[s?.index || 0]?.params
      );
    } catch (e) {
      L("Nav state read error:", e?.message || e);
    }
  }, [navigation, route]);

  const routeJobId = deriveRouteJobId(route?.params);
  const [resolvingJobId, setResolvingJobId] = useState(!routeJobId);
  const [effectiveJobId, setEffectiveJobId] = useState(routeJobId);

  const [loadingSheet, setLoadingSheet] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [job, setJob] = useState(null);

  /* resolve job id */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (routeJobId) {
        L("Using routeJobId:", routeJobId);
        try {
          await AsyncStorage.setItem("activeJobId", String(routeJobId));
          L("Stored activeJobId (route)");
        } catch {}
        if (!cancelled) {
          setEffectiveJobId(String(routeJobId));
          setResolvingJobId(false);
        }
        return;
      }

      setResolvingJobId(true);
      L("No routeJobId, trying storage fallbacks…");

      let id = null;

      try {
        id = await AsyncStorage.getItem("activeJobId");
        L("activeJobId:", id);
      } catch {}

      if (!id) {
        try {
          const lastId = await AsyncStorage.getItem("lastCreatedJobId");
          L("lastCreatedJobId:", lastId);
          if (lastId) id = lastId;
        } catch {}
      }

      if (!id) {
        try {
          const raw = await AsyncStorage.getItem("session");
          const parsed = raw ? JSON.parse(raw) : null;
          id = parsed?.jobId || parsed?.session?.jobId || null;
          L("session jobId:", id);
        } catch {}
      }

      if (!cancelled) {
        setEffectiveJobId(id || null);
        setResolvingJobId(false);
        L("Resolved effectiveJobId:", id || null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []); // once

  /* prepare sheet */
  useEffect(() => {
    if (!effectiveJobId || resolvingJobId) {
      if (!effectiveJobId) L("⛔ No effectiveJobId yet; skip preparePayment");
      if (resolvingJobId) L("…still resolvingJobId; skip preparePayment");
      return;
    }

    let cancelled = false;

    const preparePayment = async () => {
      setLoadingSheet(true);
      try {
        await ensureAuthHeader();
        L("preparePayment start; jobId:", effectiveJobId);

        const { data: jobData } = await api.get(`/jobs/${effectiveJobId}`);
        if (cancelled) return;
        setJob(jobData);
        L(
          "GET /jobs ok. status:",
          jobData?.status,
          "estimatedTotal:",
          jobData?.estimatedTotal
        );

        const customerName = `${
          jobData?.customer?.name || jobData?.firstName || ""
        } ${jobData?.customer?.lastName || jobData?.lastName || ""}`.trim();
        const customerEmail =
          jobData?.customer?.email ||
          jobData?.email ||
          jobData?.customerEmail ||
          "";

        const { data: raw1 } = await api.post("/payments/payment-sheet", {
          jobId: effectiveJobId,
          customerName,
          customerEmail,
        });
        if (cancelled) return;

        const p1 = normalizeSheetParams(raw1);
        L("Sheet params (1st):", {
          customer: p1.customer,
          hasEK: !!p1.ephemeralKey,
          hasPI: !!p1.paymentIntentClientSecret,
        });

        if (!isValidSheetParams(p1)) {
          L("⛔ Invalid sheet params:", raw1);
          Alert.alert("Stripe Error", "Invalid payment session returned.");
          return;
        }

        let { error: initErr } = await initPaymentSheet({
          merchantDisplayName: "BlinqFix",
          customerId: p1.customer,
          customerEphemeralKeySecret: p1.ephemeralKey,
          paymentIntentClientSecret: p1.paymentIntentClientSecret,
          allowsDelayedPaymentMethods: true,
        });

        if (initErr) {
          L("initPaymentSheet error (1st):", JSON.stringify(initErr));
          // retry once
          const { data: raw2 } = await api.post("/payments/payment-sheet", {
            jobId: effectiveJobId,
            customerName,
            customerEmail,
          });
          const p2 = normalizeSheetParams(raw2);
          L("Sheet params (retry):", {
            customer: p2.customer,
            hasEK: !!p2.ephemeralKey,
            hasPI: !!p2.paymentIntentClientSecret,
          });
          if (!isValidSheetParams(p2)) {
            Alert.alert(
              "Stripe Error",
              "Could not initialize payment sheet (invalid retry)."
            );
            return;
          }
          const { error: initErr2 } = await initPaymentSheet({
            merchantDisplayName: "BlinqFix",
            customerId: p2.customer,
            customerEphemeralKeySecret: p2.ephemeralKey,
            paymentIntentClientSecret: p2.paymentIntentClientSecret,
            allowsDelayedPaymentMethods: true,
          });
          if (initErr2) {
            L("initPaymentSheet error (2nd):", JSON.stringify(initErr2));
            Alert.alert(
              "Stripe Error",
              initErr2.message || "Could not initialize payment sheet."
            );
            return;
          }
        }

        L("Payment sheet ready ✅");
        setPaymentReady(true);
      } catch (err) {
        L(
          "preparePayment exception:",
          err?.response?.data || err?.message || err
        );
        Alert.alert("Stripe Error", "Could not initialize payment sheet.");
      } finally {
        if (!cancelled) setLoadingSheet(false);
      }
    };

    preparePayment();
    return () => {
      cancelled = true;
    };
  }, [effectiveJobId, resolvingJobId, initPaymentSheet]);

  const handlePay = async () => {
    if (!paymentReady) {
      return Alert.alert(
        "Payment not ready",
        "Please wait while we prepare your payment."
      );
    }

    try {
      L("presentPaymentSheet → begin");
      const { error } = await presentPaymentSheet();
      if (error) {
        L("presentPaymentSheet → error:", error?.message || error);
        return Alert.alert(
          "Payment Failed",
          error.message || "Unknown error occurred."
        );
      }
      L("presentPaymentSheet → success ✅");

      // Mark paid first to reduce redirect race
      try {
        await api.put(`/jobs/complete-payment/${effectiveJobId}`);
        L("complete-payment marked ✓");
      } catch (e) {
        L("complete-payment warning:", e?.response?.data || e?.message || e);
      }

      // Persist fallbacks
      try {
        await AsyncStorage.setItem("activeJobId", String(effectiveJobId));
        await AsyncStorage.setItem("postPaymentJobId", String(effectiveJobId));
        await AsyncStorage.setItem("__redirectStamp", String(Date.now()));
        L("Persisted activeJobId & postPaymentJobId");
      } catch {}

      // Short delay to let storage settle and root navigators finish re-rendering
      await new Promise((r) => setTimeout(r, 160));

      // Hard reset → CustomerJobStatus
      L("RESET → CustomerJobStatus with jobId:", effectiveJobId);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: "CustomerJobStatus",
              params: { jobId: String(effectiveJobId), from: "payment" },
            },
          ],
        })
      );

      // Watchdog: confirm stack top shortly after
      setTimeout(() => {
        const s = navigation.getState?.();
        const top = s?.routes?.[s?.index || 0];
        L("Post-reset top route:", top?.name, "params:", top?.params);
        if (top?.name !== "CustomerJobStatus") {
          L("Fallback navigate → CustomerJobStatus");
          navigation.replace("CustomerJobStatus", {
            jobId: String(effectiveJobId),
            from: "payment-fallback",
          });
        }
      }, 120);
    } catch (err) {
      L(
        "presentPaymentSheet fatal:",
        err?.response?.data || err?.message || err
      );
      Alert.alert("Error", "Failed to complete payment.");
    }
  };

  const estimatedTotal = Number(job?.estimatedTotal ?? 0);
  const additionalCharge = Number(job?.additionalCharge ?? 0);
  const totalToday = Number((estimatedTotal + additionalCharge).toFixed(2));
  useEffect(() => {
    L(
      "Render amounts → totalToday:",
      totalToday,
      "estimatedTotal:",
      estimatedTotal,
      "additionalCharge:",
      additionalCharge
    );
  }, [totalToday, estimatedTotal, additionalCharge]);

  /* UI states */
  if (resolvingJobId) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#312e81"]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Preparing your payment…</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!effectiveJobId) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#312e81"]}
        style={styles.container}
      >
        <View style={styles.errorContainer}>
          <AlertTriangle color="#f87171" size={48} />
          <Text style={styles.errorText}>
            Missing job reference. Please start again.
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (loadingSheet || !job) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#312e81"]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Preparing your payment…</Text>
        </View>
      </LinearGradient>
    );
  }

  const description =
    job?.coveredDescription ||
    getCoveredDescription(job?.service || job?.details?.issue || "");

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#312e81"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
                <Zap color="#facc15" size={16} />
                <Text style={styles.headerBadgeText}>Secure Payment</Text>
              </View>
              <Text style={styles.headerTitle}>Complete Your Order</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
              style={styles.summaryGradient}
            >
              <View style={styles.cardHeader}>
                <DollarSign color="#22c55e" size={24} />
                <Text style={styles.summaryTitle}>Payment Summary</Text>
              </View>

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Today</Text>
                <Text style={styles.totalAmount}>${totalToday.toFixed(2)}</Text>
              </View>

              {additionalCharge > 0 && (
                <View style={styles.additionalChargeContainer}>
                  <Text style={styles.additionalChargeLabel}>
                    Includes Additional Charge
                  </Text>
                  <Text style={styles.additionalChargeAmount}>
                    +${additionalCharge.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.coveredSection}>
                <Text style={styles.coveredTitle}>What's Included</Text>
                <Text style={styles.coveredDescription}>{description}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Security */}
          <View style={styles.securitySection}>
            <View style={styles.securityItem}>
              <Shield color="#22c55e" size={16} />
              <Text style={styles.securityText}>256-bit SSL encryption</Text>
            </View>
            <View style={styles.securityItem}>
              <Lock color="#60a5fa" size={16} />
              <Text style={styles.securityText}>Secure payment processing</Text>
            </View>
            <View style={styles.securityItem}>
              <CheckCircle color="#c084fc" size={16} />
              <Text style={styles.securityText}>
                100% satisfaction guaranteed
              </Text>
            </View>
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            style={[
              styles.payButton,
              !paymentReady && styles.payButtonDisabled,
            ]}
            onPress={handlePay}
            disabled={!paymentReady}
          >
            <LinearGradient
              colors={
                paymentReady ? ["#22c55e", "#16a34a"] : ["#6b7280", "#4b5563"]
              }
              style={styles.payButtonGradient}
            >
              <CreditCard color="#fff" size={20} />
              <Text style={styles.payButtonText}>
                {paymentReady ? "Pay & Book Service" : "Preparing Payment..."}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            By proceeding, you agree to BlinqFix&apos;s terms of service and
            privacy policy.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    color: "#f87171",
    fontSize: 18,
    textAlign: "center",
    marginTop: 16,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#fff", fontSize: 16, marginTop: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  headerCenter: { alignItems: "center", flex: 1 },
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
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  summaryCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
  summaryGradient: { padding: 24 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },
  totalContainer: { alignItems: "center", marginBottom: 16 },
  totalLabel: { fontSize: 16, color: "#e0e7ff", marginBottom: 8 },
  totalAmount: { fontSize: 36, fontWeight: "900", color: "#22c55e" },
  additionalChargeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  additionalChargeLabel: { fontSize: 16, color: "#e0e7ff" },
  additionalChargeAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fb923c",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 20,
  },
  coveredSection: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 12,
  },
  coveredTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  coveredDescription: { fontSize: 14, color: "#e0e7ff", lineHeight: 20 },
  securitySection: {
    flexDirection: "column",
    justifyContent: "space-around",
    marginBottom: 32,
    paddingVertical: 16,
    marginLeft: 100,
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 6,
  },
  securityText: { color: "#e0e7ff", fontSize: 12, fontWeight: "500" },
  payButton: { borderRadius: 16, overflow: "hidden", marginBottom: 20 },
  payButtonDisabled: { opacity: 0.6 },
  payButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  payButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  footerText: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});
