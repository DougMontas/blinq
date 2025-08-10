// import React, { useEffect, useState } from "react";
// import {
//   View,
//   TouchableOpacity,
//   Text,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { useStripe, StripeProvider } from "@stripe/stripe-react-native";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import api from "../api/client";
// import Constants from "expo-constants";
// import LoadingScreen from "./LoadingScreen";
// import { getCoveredDescription } from "../utils/serviceMatrix";

// const FEE_RATE = 0.07;

// export default function PaymentScreen() {
//   const navigation = useNavigation();

//   // ✅ Safely extract jobId from route params
//   const route = useRoute();
//   const jobId = route?.params?.jobId;

//   if (!jobId) {
//     console.warn("⚠️ Missing jobId param on PaymentScreen route");
//     return (
//       <View style={styles.container}>
//         <Text>Missing job reference. Cannot proceed with payment.</Text>
//       </View>
//     );
//   }

//   const { initPaymentSheet, presentPaymentSheet } = useStripe();
//   const [loadingSheet, setLoadingSheet] = useState(false);
//   const [paymentReady, setPaymentReady] = useState(false);
//   const [showAnimation, setShowAnimation] = useState(false);
//   const [job, setJob] = useState(null);

//   const validateSheetParams = (params) => {
//     if (!params?.customer?.startsWith("cus_")) return false;
//     if (!params?.ephemeralKey?.startsWith("ek_")) return false;
//     if (!params?.paymentIntentClientSecret?.includes("_secret_")) return false;
//     return true;
//   };

//   useEffect(() => {
//     const preparePayment = async () => {
//       setLoadingSheet(true);
//       try {
//         const { data: jobData } = await api.get(`/jobs/${jobId}`);
//         setJob(jobData);

//         const customerName = `${
//           jobData?.customer?.name || jobData?.firstName || ""
//         } ${jobData?.customer?.lastName || jobData?.lastName || ""}`.trim();
//         const customerEmail =
//           jobData?.customer?.email ||
//           jobData?.email ||
//           jobData?.customerEmail ||
//           "";

//         const { data: sheetParams } = await api.post(
//           "/payments/payment-sheet",
//           {
//             jobId,
//             customerName,
//             customerEmail,
//           }
//         );

//         if (!validateSheetParams(sheetParams)) {
//           Alert.alert("Stripe Error", "Invalid payment session returned.");
//           return;
//         }

//         const { error: initError } = await initPaymentSheet({
//           merchantDisplayName: "BlinqFix",
//           customerId: sheetParams.customer,
//           customerEphemeralKeySecret: sheetParams.ephemeralKey,
//           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
//           allowsDelayedPaymentMethods: true,
//           returnURL:
//             "https://blinqfrontend-y6jd-git-master-blinqfixs-projects.vercel.app/app/stripe/onboarding-success",
//         });

//         if (initError) {
//           Alert.alert(
//             "Stripe Error",
//             initError.message || "Could not initialize payment sheet."
//           );
//           return;
//         }

//         setPaymentReady(true);
//       } catch (err) {
//         Alert.alert("Stripe Error", "Could not initialize payment sheet.");
//       } finally {
//         setLoadingSheet(false);
//       }
//     };

//     preparePayment();
//   }, [jobId]);

//   const handlePay = async () => {
//     if (!paymentReady)
//       return Alert.alert(
//         "Payment not ready",
//         "Please wait while we prepare your payment."
//       );
//     try {
//       const { error } = await presentPaymentSheet();
//       if (error)
//         return Alert.alert(
//           "Payment Failed",
//           error.message || "Unknown error occurred."
//         );

//       setShowAnimation(true);
//       await api.put(`/jobs/complete-payment/${jobId}`);
//     } catch (err) {
//       Alert.alert("Error", "Failed to complete payment.");
//     }
//   };

//   const description = getCoveredDescription(job?.details?.issue);

//   if (loadingSheet || !job) {
//     return (
//       <View style={styles.container} key="loading">
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   if (showAnimation) {
//     return (
//       <LoadingScreen
//         animationOnly
//         enterDuration={800}
//         holdDuration={400}
//         exitDuration={800}
//         onAnimationEnd={() =>
//           navigation.navigate("CustomerJobStatus", { jobId })
//         }
//       />
//     );
//   }

//   return (
//     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
//       <View style={styles.container} key={jobId}>
//         <View style={styles.summaryCard}>
//           <Text style={styles.summaryTitle}>Estimate Details</Text>
//           {job.additionalCharge > 0 && (
//             <Text style={{ textAlign: "center" }}>
//               Extra charge: ${job.additionalCharge.toFixed(2)}
//             </Text>
//           )}
//           <Text style={styles.totalLine}>
//             Total: ${job.estimatedTotal.toFixed(2)}
//           </Text>
//           <Text style={styles.sectionTitle}>What’s Covered:</Text>
//           <Text style={styles.descriptionText}>{description}</Text>
//         </View>

//         {job.additionalCharge > 0 && (
//           <View style={styles.additionalCard}>
//             <Text style={styles.additionalCardTitle}>Additional Charge</Text>
//             <Text style={styles.additionalCardText}>
//               Amount: ${job.additionalCharge.toFixed(2)}
//             </Text>
//             {job.additionalChargeReason && (
//               <Text style={styles.additionalCardText}>
//                 Description: {job.additionalChargeReason}
//               </Text>
//             )}
//           </View>
//         )}

//         <TouchableOpacity
//           style={[
//             styles.payButton,
//             !paymentReady && { backgroundColor: "#ccc" },
//           ]}
//           onPress={handlePay}
//           disabled={!paymentReady}
//         >
//           <Text style={styles.payButtonText}>Pay & Book</Text>
//         </TouchableOpacity>
//       </View>
//     </StripeProvider>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center" },
//   payButton: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     marginTop: 16,
//   },
//   payButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   summaryCard: {
//     width: "90%",
//     backgroundColor: "#fff",
//     padding: 16,
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     marginBottom: 24,
//   },
//   summaryTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     marginBottom: 8,
//     textAlign: "center",
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
//   },
//   totalLine: {
//     marginTop: 8,
//     fontSize: 20,
//     fontWeight: "700",
//     textAlign: "center",
//   },
//   sectionTitle: {
//     fontWeight: "bold",
//     marginTop: 20,
//     fontSize: 18,
//     textAlign: "center",
//   },
//   descriptionText: {
//     color: "red",
//     fontSize: 16,
//     textAlign: "center",
//   },
//   additionalCard: {
//     width: "90%",
//     backgroundColor: "#fdf6ec",
//     borderLeftWidth: 4,
//     borderLeftColor: "#ffa726",
//     padding: 16,
//     borderRadius: 10,
//     marginTop: 16,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   additionalCardTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#e65100",
//     marginBottom: 4,
//     textAlign: "center",
//   },
//   additionalCardText: {
//     fontSize: 15,
//     color: "#5d4037",
//     fontWeight: "600",
//     marginBottom: 2,
//     textAlign: "center",
//   },
// });


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
import { useStripe, StripeProvider } from "@stripe/stripe-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  CreditCard,
  Shield,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Zap,
  DollarSign,
  Lock
} from "lucide-react-native";
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
      <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertTriangle color="#f87171" size={48} />
          <Text style={styles.errorText}>Missing job reference. Cannot proceed with payment.</Text>
        </View>
      </LinearGradient>
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
      <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Preparing your payment...</Text>
        </View>
      </LinearGradient>
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
      <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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

            {/* Payment Summary Card */}
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.summaryGradient}
              >
                <View style={styles.cardHeader}>
                  <DollarSign color="#22c55e" size={24} />
                  <Text style={styles.summaryTitle}>Payment Summary</Text>
                </View>
                
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalAmount}>${job.estimatedTotal.toFixed(2)}</Text>
                </View>

                {job.additionalCharge > 0 && (
                  <View style={styles.additionalChargeContainer}>
                    <Text style={styles.additionalChargeLabel}>Additional Charge</Text>
                    <Text style={styles.additionalChargeAmount}>+${job.additionalCharge.toFixed(2)}</Text>
                  </View>
                )}

                <View style={styles.divider} />

                <View style={styles.coveredSection}>
                  <Text style={styles.coveredTitle}>What's Included</Text>
                  <Text style={styles.coveredDescription}>{description}</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Additional Charge Details */}
            {job.additionalCharge > 0 && (
              <View style={styles.additionalCard}>
                <LinearGradient
                  colors={['rgba(251, 146, 60, 0.1)', 'rgba(234, 88, 12, 0.05)']}
                  style={styles.additionalGradient}
                >
                  <View style={styles.additionalHeader}>
                    <AlertTriangle color="#fb923c" size={24} />
                    <Text style={styles.additionalTitle}>Additional Services</Text>
                  </View>
                  
                  <Text style={styles.additionalAmount}>
                    ${job.additionalCharge.toFixed(2)}
                  </Text>
                  
                  {job.additionalChargeReason && (
                    <Text style={styles.additionalReason}>
                      {job.additionalChargeReason}
                    </Text>
                  )}
                </LinearGradient>
              </View>
            )}

            {/* Security Features */}
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
                <Text style={styles.securityText}>100% satisfaction guaranteed</Text>
              </View>
            </View>

            {/* Payment Button */}
            <TouchableOpacity
              style={[styles.payButton, !paymentReady && styles.payButtonDisabled]}
              onPress={handlePay}
              disabled={!paymentReady}
            >
              <LinearGradient
                colors={paymentReady ? ['#22c55e', '#16a34a'] : ['#6b7280', '#4b5563']}
                style={styles.payButtonGradient}
              >
                <CreditCard color="#fff" size={20} />
                <Text style={styles.payButtonText}>
                  {paymentReady ? "Pay & Book Service" : "Preparing Payment..."}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <Text style={styles.footerText}>
              By proceeding, you agree to BlinqFix's terms of service and privacy policy
            </Text>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContent: { 
    padding: 20,
    paddingBottom: 40, 
    marginTop:40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  errorText: {
    color: '#f87171',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 99,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8
  },
  headerBadgeText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  summaryCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden'
  },
  summaryGradient: {
    padding: 24
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: 16
  },
  totalLabel: {
    fontSize: 16,
    color: '#e0e7ff',
    marginBottom: 8
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#22c55e'
  },
  additionalChargeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  additionalChargeLabel: {
    fontSize: 16,
    color: '#e0e7ff'
  },
  additionalChargeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fb923c'
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 20
  },
  coveredSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12
  },
  coveredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  coveredDescription: {
    fontSize: 14,
    color: '#e0e7ff',
    lineHeight: 20
  },
  additionalCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden'
  },
  additionalGradient: {
    padding: 20
  },
  additionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  additionalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12
  },
  additionalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fb923c',
    textAlign: 'center',
    marginBottom: 8
  },
  additionalReason: {
    fontSize: 14,
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 20
  },
  securitySection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingVertical: 16
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  securityText: {
    color: '#e0e7ff',
    fontSize: 12,
    fontWeight: '500'
  },
  payButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20
  },
  payButtonDisabled: {
    opacity: 0.6
  },
  payButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16
  }
});