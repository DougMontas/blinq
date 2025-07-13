// import React, { useEffect, useState } from "react";
// import {
//   View,
//   TouchableOpacity,
//   Text,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import api from "../api/client";
// import Constants from "expo-constants";
// import LoadingScreen from "./LoadingScreen";
// import { getCoveredDescription } from "../utils/serviceMatrix";

// const FEE_RATE = 0.07;

// export default function PaymentScreen() {
//   const navigation = useNavigation();
//   const { jobId } = useRoute().params;
//   const { initPaymentSheet, presentPaymentSheet } = useStripe();

//   const [loadingSheet, setLoadingSheet] = useState(false);
//   const [paymentReady, setPaymentReady] = useState(false);
//   const [showAnimation, setShowAnimation] = useState(false);
//   const [job, setJob] = useState(null);

//   useEffect(() => {
//     const preparePayment = async () => {
//       setLoadingSheet(true);
//       setPaymentReady(false);
//       try {
//         const { data: jobData } = await api.get(`/jobs/${jobId}`);
//         setJob(jobData);

//         const amountInCents = Math.round((jobData.estimatedTotal || 0) * 100);

//         const { data: sheetParams } = await api.post("/payments/payment-sheet", {
//           jobId,
//         });
//         // const { data: sheetParams } = await api.post(
//         //   "/payments/payment-sheet",
//         //   {
//         //     amount: amountInCents,
//         //     currency: "usd",
//         //   }
//         // );

//         const { error: initError } = await initPaymentSheet({
//           merchantDisplayName: "BlinqFix",
//           customerId: sheetParams.customer,
//           customerEphemeralKeySecret: sheetParams.ephemeralKey,
//           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
//           allowsDelayedPaymentMethods: true,
//           returnURL: "https://blinqfix.com/onboarding-complete", // required for iOS redirect methods
//         });

//         if (initError) throw initError;
//         setPaymentReady(true);
//       } catch (err) {
//         console.error("\u274C initPaymentSheet error:", err);
//         Alert.alert("Stripe Error", "Could not initialize payment sheet.");
//       } finally {
//         setLoadingSheet(false);
//       }
//     };

//     preparePayment();
//   }, [jobId]);

//   const handlePay = async () => {
//     if (!paymentReady) {
//       return Alert.alert(
//         "Payment not ready",
//         "Please wait while we prepare your payment."
//       );
//     }

//     try {
//       const { error } = await presentPaymentSheet();
//       if (error) {
//         console.error("\u274C presentPaymentSheet error:", error);
//         return Alert.alert(
//           "Payment Failed",
//           error.message || "Unknown error occurred."
//         );
//       }

//       await api.put(`/jobs/complete-payment/${jobId}`);
//       setShowAnimation(true);
//     } catch (err) {
//       console.error("Payment handling error:", err);
//       Alert.alert("Error", "Failed to complete payment.");
//     }
//   };

//   if (showAnimation) {
//     return (
//       <LoadingScreen
//         animationOnly
//         enterDuration={800}
//         holdDuration={400}
//         exitDuration={800}
//         onAnimationEnd={() =>
//           navigation.replace("CustomerJobStatus", { jobId })
//         }
//       />
//     );
//   }

//   const description = getCoveredDescription(job?.details?.issue);

//   return (
//     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
//       <View style={styles.container}>
//         {loadingSheet || !job ? (
//           <ActivityIndicator size="large" />
//         ) : (
//           <>
//             <View style={styles.summaryCard}>
//               <Text style={styles.summaryTitle}>Estimate Details</Text>
//               {job.additionalCharge > 0 && (
//                 <Text style={{ textAlign: "center" }}>
//                   Extra charge: ${job.additionalCharge.toFixed(2)}
//                 </Text>
//               )}
//               <Text style={styles.totalLine}>
//                 Total: ${job.estimatedTotal.toFixed(2)}
//               </Text>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </View>

//             {job.additionalCharge > 0 && (
//               <View style={styles.additionalCard}>
//                 <Text style={styles.additionalCardTitle}>
//                   Additional Charge
//                 </Text>
//                 <Text style={styles.additionalCardText}>
//                   Amount: ${job.additionalCharge.toFixed(2)}
//                 </Text>
//                 {job.additionalChargeReason && (
//                   <Text style={styles.additionalCardText}>
//                     Description: {job.additionalChargeReason}
//                   </Text>
//                 )}
//               </View>
//             )}

//             <TouchableOpacity
//               style={[
//                 styles.payButton,
//                 !paymentReady && { backgroundColor: "#ccc" },
//               ]}
//               onPress={handlePay}
//               disabled={!paymentReady}
//             >
//               <Text style={styles.payButtonText}>Pay & Book</Text>
//             </TouchableOpacity>
//           </>
//         )}
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

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   TouchableOpacity,
//   Text,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import api from "../api/client";
// import Constants from "expo-constants";
// import LoadingScreen from "./LoadingScreen";
// import { getCoveredDescription } from "../utils/serviceMatrix";

// const FEE_RATE = 0.07;

// export default function PaymentScreen() {
//   const navigation = useNavigation();
//   const { jobId } = useRoute().params;
//   const { initPaymentSheet, presentPaymentSheet } = useStripe();

//   const [loadingSheet, setLoadingSheet] = useState(false);
//   const [paymentReady, setPaymentReady] = useState(false);
//   const [showAnimation, setShowAnimation] = useState(false);
//   const [job, setJob] = useState(null);

//   const validateSheetParams = (params) => {
//     console.log("🧪 Validating Stripe Sheet Params:", params);

//     if (!params?.customer || !params?.customer.startsWith("cus_")) {
//       console.warn("⚠️ Invalid or missing customer ID");
//       return false;
//     }

//     if (!params?.ephemeralKey || !params.ephemeralKey.startsWith("ek_")) {
//       console.warn("⚠️ Invalid or missing ephemeral key");
//       return false;
//     }

//     if (
//       !params?.paymentIntentClientSecret ||
//       !params.paymentIntentClientSecret.includes("_secret_") ||
//       !params.paymentIntentClientSecret.startsWith("pi_")
//     ) {
//       console.warn("⚠️ Invalid or missing client secret");
//       return false;
//     }

//     return true;
//   };

//   // useEffect(() => {
//   //   const preparePayment = async () => {
//   //     setLoadingSheet(true);
//   //     setPaymentReady(false);
//   //     try {
//   //       const { data: jobData } = await api.get(`/jobs/${jobId}`);
//   //       setJob(jobData);

//   //       const { data: sheetParams } = await api.post("/payments/payment-sheet", {
//   //         jobId,
//   //       });

//   //       if (!validateSheetParams(sheetParams)) {
//   //         Alert.alert("Stripe Error", "Invalid payment session returned.");
//   //         return;
//   //       }
//   //       console.log("🧾 Received sheetParams:", sheetParams);

//   //       const { error: initError } = await initPaymentSheet({
//   //         merchantDisplayName: "BlinqFix",
//   //         customerId: sheetParams.customer,
//   //         customerEphemeralKeySecret: sheetParams.ephemeralKey,
//   //         paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
//   //         allowsDelayedPaymentMethods: true,
//   //         returnURL: "https://blinqfix.com/onboarding-complete",
//   //       });

//   //       if (initError) {
//   //         console.error("❌ initPaymentSheet failed:", initError);
//   //         Alert.alert("Stripe Error", initError.message || "Could not initialize payment sheet.");
//   //         return;
//   //       }

//   //       setPaymentReady(true);
//   //     } catch (err) {
//   //       console.error("❌ initPaymentSheet error:", err.response?.data || err.message || err);
//   //       Alert.alert("Stripe Error", "Could not initialize payment sheet.");
//   //     } finally {
//   //       setLoadingSheet(false);
//   //     }
//   //   };

//   //   preparePayment();
//   // }, [jobId]);

//   useEffect(() => {
//     const preparePayment = async () => {
//       setLoadingSheet(true);
//       setPaymentReady(false);
//       try {
//         const { data: jobData } = await api.get(`/jobs/${jobId}`);
//         setJob(jobData);

//         const { data: sheetParams } = await api.post("/payments/payment-sheet", {
//           jobId,
//         });

//         console.log("🧾 Received sheetParams:", sheetParams);

//         const { error: initError } = await initPaymentSheet({
//           merchantDisplayName: "BlinqFix",
//           customerId: sheetParams.customer,
//           customerEphemeralKeySecret: sheetParams.ephemeralKey,
//           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
//           allowsDelayedPaymentMethods: true,
//         });

//         if (initError) throw initError;
//         setPaymentReady(true);
//       } catch (err) {
//         console.error("❌ initPaymentSheet error:", err);
//         Alert.alert("Stripe Error", "Could not initialize payment sheet.");
//       } finally {
//         setLoadingSheet(false);
//       }
//     };

//     preparePayment();
//   }, [jobId]);

//   const handlePay = async () => {
//     if (!paymentReady) {
//       return Alert.alert("Payment not ready", "Please wait while we prepare your payment.");
//     }

//     try {
//       const { error } = await presentPaymentSheet();
//       if (error) {
//         console.error("❌ presentPaymentSheet error:", error);
//         return Alert.alert("Payment Failed", error.message || "Unknown error occurred.");
//       }

//       await api.put(`/jobs/complete-payment/${jobId}`);
//       setShowAnimation(true);
//     } catch (err) {
//       console.error("Payment handling error:", err);
//       Alert.alert("Error", "Failed to complete payment.");
//     }
//   };

//   if (showAnimation) {
//     return (
//       <LoadingScreen
//         animationOnly
//         enterDuration={800}
//         holdDuration={400}
//         exitDuration={800}
//         onAnimationEnd={() => navigation.replace("CustomerJobStatus", { jobId })}
//       />
//     );
//   }

//   const description = getCoveredDescription(job?.details?.issue);

//   return (
//     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
//       <View style={styles.container}>
//         {loadingSheet || !job ? (
//           <ActivityIndicator size="large" />
//         ) : (
//           <>
//             <View style={styles.summaryCard}>
//               <Text style={styles.summaryTitle}>Estimate Details</Text>
//               {job.additionalCharge > 0 && (
//                 <Text style={{ textAlign: "center" }}>
//                   Extra charge: ${job.additionalCharge.toFixed(2)}
//                 </Text>
//               )}
//               <Text style={styles.totalLine}>
//                 Total: ${job.estimatedTotal.toFixed(2)}
//               </Text>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </View>

//             {job.additionalCharge > 0 && (
//               <View style={styles.additionalCard}>
//                 <Text style={styles.additionalCardTitle}>Additional Charge</Text>
//                 <Text style={styles.additionalCardText}>
//                   Amount: ${job.additionalCharge.toFixed(2)}
//                 </Text>
//                 {job.additionalChargeReason && (
//                   <Text style={styles.additionalCardText}>
//                     Description: {job.additionalChargeReason}
//                   </Text>
//                 )}
//               </View>
//             )}

//             <TouchableOpacity
//               style={[styles.payButton, !paymentReady && { backgroundColor: "#ccc" }]}
//               onPress={handlePay}
//               disabled={!paymentReady}
//             >
//               <Text style={styles.payButtonText}>Pay & Book</Text>
//             </TouchableOpacity>
//           </>
//         )}
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
// // });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   TouchableOpacity,
//   Text,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import api from "../api/client";
// import Constants from "expo-constants";
// import LoadingScreen from "./LoadingScreen";
// import { getCoveredDescription } from "../utils/serviceMatrix";

// const FEE_RATE = 0.07;

// export default function PaymentScreen() {
//   const navigation = useNavigation();
//   const { jobId } = useRoute().params;
//   const { initPaymentSheet, presentPaymentSheet } = useStripe();

//   const [loadingSheet, setLoadingSheet] = useState(false);
//   const [paymentReady, setPaymentReady] = useState(false);
//   const [showAnimation, setShowAnimation] = useState(false);
//   const [job, setJob] = useState(null);

//   const validateSheetParams = (params) => {
//     console.log("🧪 Validating Stripe Sheet Params:", params);

//     if (!params?.customer || !params?.customer.startsWith("cus_")) {
//       console.warn("⚠️ Invalid or missing customer ID");
//       return false;
//     }

//     if (!params?.ephemeralKey || !params.ephemeralKey.startsWith("ek_")) {
//       console.warn("⚠️ Invalid or missing ephemeral key");
//       return false;
//     }

//     if (
//       !params?.paymentIntentClientSecret ||
//       !params.paymentIntentClientSecret.includes("_secret_") ||
//       !params.paymentIntentClientSecret.startsWith("pi_")
//     ) {
//       console.warn("⚠️ Invalid or missing client secret");
//       return false;
//     }

//     return true;
//   };

//   useEffect(() => {
//     const preparePayment = async () => {
//       setLoadingSheet(true);
//       setPaymentReady(false);
//       try {
//         const { data: jobData } = await api.get(`/jobs/${jobId}`);
//         setJob(jobData);

//         const { data: sheetParams } = await api.post("/payments/payment-sheet", {
//           jobId,
//         });

//         if (!validateSheetParams(sheetParams)) {
//           Alert.alert("Stripe Error", "Invalid payment session returned.");
//           return;
//         }

//         console.log("🧾 Received sheetParams:", sheetParams);

//         const { error: initError } = await initPaymentSheet({
//           merchantDisplayName: "BlinqFix",
//           customerId: sheetParams.customer,
//           customerEphemeralKeySecret: sheetParams.ephemeralKey,
//           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
//           allowsDelayedPaymentMethods: true,
//           returnURL: "https://blinqfix.com/onboarding-complete",
//         });

//         if (initError) {
//           console.error("❌ initPaymentSheet failed:", initError);
//           Alert.alert("Stripe Error", initError.message || "Could not initialize payment sheet.");
//           return;
//         }

//         setPaymentReady(true);
//       } catch (err) {
//         console.error("❌ initPaymentSheet error:", err.response?.data || err.message || err);
//         Alert.alert("Stripe Error", "Could not initialize payment sheet.");
//       } finally {
//         setLoadingSheet(false);
//       }
//     };

//     preparePayment();
//   }, [jobId]);

//   const handlePay = async () => {
//     if (!paymentReady) {
//       return Alert.alert("Payment not ready", "Please wait while we prepare your payment.");
//     }

//     try {
//       const { error } = await presentPaymentSheet();
//       if (error) {
//         console.error("❌ presentPaymentSheet error:", error);
//         return Alert.alert("Payment Failed", error.message || "Unknown error occurred.");
//       }

//       await api.put(`/jobs/complete-payment/${jobId}`);
//       setShowAnimation(true);
//     } catch (err) {
//       console.error("Payment handling error:", err);
//       Alert.alert("Error", "Failed to complete payment.");
//     }
//   };

//   if (showAnimation) {
//     return (
//       <LoadingScreen
//         animationOnly
//         enterDuration={800}
//         holdDuration={400}
//         exitDuration={800}
//         onAnimationEnd={() => navigation.replace("CustomerJobStatus", { jobId })}
//       />
//     );
//   }

//   const description = getCoveredDescription(job?.details?.issue);

//   return (
//     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
//       <View style={styles.container}>
//         {loadingSheet || !job ? (
//           <ActivityIndicator size="large" />
//         ) : (
//           <>
//             <View style={styles.summaryCard}>
//               <Text style={styles.summaryTitle}>Estimate Details</Text>
//               {job.additionalCharge > 0 && (
//                 <Text style={{ textAlign: "center" }}>
//                   Extra charge: ${job.additionalCharge.toFixed(2)}
//                 </Text>
//               )}
//               <Text style={styles.totalLine}>
//                 Total: ${job.estimatedTotal.toFixed(2)}
//               </Text>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </View>

//             {job.additionalCharge > 0 && (
//               <View style={styles.additionalCard}>
//                 <Text style={styles.additionalCardTitle}>Additional Charge</Text>
//                 <Text style={styles.additionalCardText}>
//                   Amount: ${job.additionalCharge.toFixed(2)}
//                 </Text>
//                 {job.additionalChargeReason && (
//                   <Text style={styles.additionalCardText}>
//                     Description: {job.additionalChargeReason}
//                   </Text>
//                 )}
//               </View>
//             )}

//             <TouchableOpacity
//               style={[styles.payButton, !paymentReady && { backgroundColor: "#ccc" }]}
//               onPress={handlePay}
//               disabled={!paymentReady}
//             >
//               <Text style={styles.payButtonText}>Pay & Book</Text>
//             </TouchableOpacity>
//           </>
//         )}
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
} from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../api/client";
import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import LoadingScreen from "./LoadingScreen";
import { getCoveredDescription } from "../utils/serviceMatrix";

const FEE_RATE = 0.07;

export default function PaymentScreen() {
  const navigation = useNavigation();
  const { jobId } = useRoute().params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [loadingSheet, setLoadingSheet] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [job, setJob] = useState(null);

  const validateSheetParams = (params) => {
    console.log("\uD83D\uDD6A Validating Stripe Sheet Params:", params);

    if (!params?.customer || !params?.customer.startsWith("cus_")) {
      console.warn("⚠️ Invalid or missing customer ID");
      return false;
    }

    if (!params?.ephemeralKey || !params.ephemeralKey.startsWith("ek_")) {
      console.warn("⚠️ Invalid or missing ephemeral key");
      return false;
    }

    if (
      !params?.paymentIntentClientSecret ||
      !params.paymentIntentClientSecret.includes("_secret_") ||
      !params.paymentIntentClientSecret.startsWith("pi_")
    ) {
      console.warn("⚠️ Invalid or missing client secret");
      return false;
    }

    return true;
  };

  useEffect(() => {
    const preparePayment = async () => {
      setLoadingSheet(true);
      setPaymentReady(false);
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

        console.log("\uD83D\uDCBE Received sheetParams:", sheetParams);

        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: "BlinqFix",
          customerId: sheetParams.customer,
          customerEphemeralKeySecret: sheetParams.ephemeralKey,
          paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
          allowsDelayedPaymentMethods: true,
          returnURL: "https://blinqfix.com/onboarding-complete",
        });

        if (initError) {
          console.error("❌ initPaymentSheet failed:", initError);
          Alert.alert(
            "Stripe Error",
            initError.message || "Could not initialize payment sheet."
          );
          return;
        }

        setPaymentReady(true);
      } catch (err) {
        console.error(
          "❌ initPaymentSheet error:",
          err.response?.data || err.message || err
        );
        Alert.alert("Stripe Error", "Could not initialize payment sheet.");
      } finally {
        setLoadingSheet(false);
      }
    };

    preparePayment();
  }, [jobId]);

  const handlePay = async () => {
    if (!paymentReady) {
      return Alert.alert(
        "Payment not ready",
        "Please wait while we prepare your payment."
      );
    }

    try {
      const { error } = await presentPaymentSheet();
      if (error) {
        console.error("❌ presentPaymentSheet error:", error);
        return Alert.alert(
          "Payment Failed",
          error.message || "Unknown error occurred."
        );
      }

      setShowAnimation(true);
      await api.put(`/jobs/complete-payment/${jobId}`);
    } catch (err) {
      console.error("Payment handling error:", err);
      Alert.alert("Error", "Failed to complete payment.");
    }
  };

  if (showAnimation && !loadingSheet) {
    return (
      <LoadingScreen
        animationOnly
        enterDuration={800}
        holdDuration={400}
        exitDuration={800}
        onAnimationEnd={() =>
          navigation.replace("CustomerJobStatus", { jobId })
        }
      />
    );
  }

  const description = getCoveredDescription(job?.details?.issue);

  if (loadingSheet || !job) {
    return (
      <View style={styles.container} key="loading">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View key={jobId} style={styles.container}>
      {showAnimation ? (
        <LoadingScreen
          animationOnly
          enterDuration={800}
          holdDuration={400}
          exitDuration={800}
          onAnimationEnd={() =>
            navigation.replace("CustomerJobStatus", { jobId })
          }
        />
      ) : (
        <>{/* existing summary and payment UI here */}</>
      )}

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
        style={[styles.payButton, !paymentReady && { backgroundColor: "#ccc" }]}
        onPress={handlePay}
        disabled={!paymentReady}
      >
        <Text style={styles.payButtonText}>Pay & Book</Text>
      </TouchableOpacity>
    </View>
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
