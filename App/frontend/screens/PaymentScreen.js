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

// //latest working - not beta
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   TouchableOpacity,
//   Text,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
// } from "react-native";
// import { useStripe, StripeProvider } from "@stripe/stripe-react-native";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   CreditCard,
//   Shield,
//   CheckCircle,
//   AlertTriangle,
//   ArrowLeft,
//   Zap,
//   DollarSign,
//   Lock
// } from "lucide-react-native";
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
//       <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
//         <View style={styles.errorContainer}>
//           <AlertTriangle color="#f87171" size={48} />
//           <Text style={styles.errorText}>Missing job reference. Cannot proceed with payment.</Text>
//         </View>
//       </LinearGradient>
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
//       <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#fff" />
//           <Text style={styles.loadingText}>Preparing your payment...</Text>
//         </View>
//       </LinearGradient>
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
//       <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
//         <SafeAreaView style={{ flex: 1 }}>
//           <ScrollView contentContainerStyle={styles.scrollContent}>
//             {/* Header */}
//             <View style={styles.header}>
//               <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//                 <ArrowLeft color="#fff" size={24} />
//               </TouchableOpacity>
//               <View style={styles.headerCenter}>
//                 <View style={styles.headerBadge}>
//                   <Zap color="#facc15" size={16} />
//                   <Text style={styles.headerBadgeText}>Secure Payment</Text>
//                 </View>
//                 <Text style={styles.headerTitle}>Complete Your Order</Text>
//               </View>
//               <View style={{ width: 40 }} />
//             </View>

//             {/* Payment Summary Card */}
//             <View style={styles.summaryCard}>
//               <LinearGradient
//                 colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
//                 style={styles.summaryGradient}
//               >
//                 <View style={styles.cardHeader}>
//                   <DollarSign color="#22c55e" size={24} />
//                   <Text style={styles.summaryTitle}>Payment Summary</Text>
//                 </View>
                
//                 <View style={styles.totalContainer}>
//                   <Text style={styles.totalLabel}>Total Amount</Text>
//                   <Text style={styles.totalAmount}>${job.estimatedTotal.toFixed(2)}</Text>
//                 </View>

//                 {job.additionalCharge > 0 && (
//                   <View style={styles.additionalChargeContainer}>
//                     <Text style={styles.additionalChargeLabel}>Additional Charge</Text>
//                     <Text style={styles.additionalChargeAmount}>+${job.additionalCharge.toFixed(2)}</Text>
//                   </View>
//                 )}

//                 <View style={styles.divider} />

//                 <View style={styles.coveredSection}>
//                   <Text style={styles.coveredTitle}>What's Included</Text>
//                   <Text style={styles.coveredDescription}>{description}</Text>
//                 </View>
//               </LinearGradient>
//             </View>

//             {/* Additional Charge Details */}
//             {job.additionalCharge > 0 && (
//               <View style={styles.additionalCard}>
//                 <LinearGradient
//                   colors={['rgba(251, 146, 60, 0.1)', 'rgba(234, 88, 12, 0.05)']}
//                   style={styles.additionalGradient}
//                 >
//                   <View style={styles.additionalHeader}>
//                     <AlertTriangle color="#fb923c" size={24} />
//                     <Text style={styles.additionalTitle}>Additional Services</Text>
//                   </View>
                  
//                   <Text style={styles.additionalAmount}>
//                     ${job.additionalCharge.toFixed(2)}
//                   </Text>
                  
//                   {job.additionalChargeReason && (
//                     <Text style={styles.additionalReason}>
//                       {job.additionalChargeReason}
//                     </Text>
//                   )}
//                 </LinearGradient>
//               </View>
//             )}

//             {/* Security Features */}
//             <View style={styles.securitySection}>
//               <View style={styles.securityItem}>
//                 <Shield color="#22c55e" size={16} />
//                 <Text style={styles.securityText}>256-bit SSL encryption</Text>
//               </View>
//               <View style={styles.securityItem}>
//                 <Lock color="#60a5fa" size={16} />
//                 <Text style={styles.securityText}>Secure payment processing</Text>
//               </View>
//               <View style={styles.securityItem}>
//                 <CheckCircle color="#c084fc" size={16} />
//                 <Text style={styles.securityText}>100% satisfaction guaranteed</Text>
//               </View>
//             </View>

//             {/* Payment Button */}
//             <TouchableOpacity
//               style={[styles.payButton, !paymentReady && styles.payButtonDisabled]}
//               onPress={handlePay}
//               disabled={!paymentReady}
//             >
//               <LinearGradient
//                 colors={paymentReady ? ['#22c55e', '#16a34a'] : ['#6b7280', '#4b5563']}
//                 style={styles.payButtonGradient}
//               >
//                 <CreditCard color="#fff" size={20} />
//                 <Text style={styles.payButtonText}>
//                   {paymentReady ? "Pay & Book Service" : "Preparing Payment..."}
//                 </Text>
//               </LinearGradient>
//             </TouchableOpacity>

//             {/* Footer */}
//             <Text style={styles.footerText}>
//               By proceeding, you agree to BlinqFix's terms of service and privacy policy
//             </Text>
//           </ScrollView>
//         </SafeAreaView>
//       </LinearGradient>
//     </StripeProvider>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1 
//   },
//   scrollContent: { 
//     padding: 20,
//     paddingBottom: 40, 
//     marginTop:40,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 40
//   },
//   errorText: {
//     color: '#f87171',
//     fontSize: 18,
//     textAlign: 'center',
//     marginTop: 16
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   loadingText: {
//     color: '#fff',
//     fontSize: 16,
//     marginTop: 16
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingTop: 10,
//     paddingBottom: 20,
//   },
//   backButton: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     padding: 10,
//     borderRadius: 99,
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   headerCenter: {
//     alignItems: 'center',
//     flex: 1
//   },
//   headerBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginBottom: 8
//   },
//   headerBadgeText: {
//     color: '#fff',
//     marginLeft: 6,
//     fontSize: 12,
//     fontWeight: '500'
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#fff'
//   },
//   summaryCard: {
//     marginBottom: 20,
//     borderRadius: 16,
//     overflow: 'hidden'
//   },
//   summaryGradient: {
//     padding: 24
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20
//   },
//   summaryTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginLeft: 12
//   },
//   totalContainer: {
//     alignItems: 'center',
//     marginBottom: 16
//   },
//   totalLabel: {
//     fontSize: 16,
//     color: '#e0e7ff',
//     marginBottom: 8
//   },
//   totalAmount: {
//     fontSize: 36,
//     fontWeight: '900',
//     color: '#22c55e'
//   },
//   additionalChargeContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16
//   },
//   additionalChargeLabel: {
//     fontSize: 16,
//     color: '#e0e7ff'
//   },
//   additionalChargeAmount: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fb923c'
//   },
//   divider: {
//     height: 1,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     marginVertical: 20
//   },
//   coveredSection: {
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     padding: 16,
//     borderRadius: 12
//   },
//   coveredTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 8
//   },
//   coveredDescription: {
//     fontSize: 14,
//     color: '#e0e7ff',
//     lineHeight: 20
//   },
//   additionalCard: {
//     marginBottom: 20,
//     borderRadius: 16,
//     overflow: 'hidden'
//   },
//   additionalGradient: {
//     padding: 20
//   },
//   additionalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12
//   },
//   additionalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginLeft: 12
//   },
//   additionalAmount: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#fb923c',
//     textAlign: 'center',
//     marginBottom: 8
//   },
//   additionalReason: {
//     fontSize: 14,
//     color: '#e0e7ff',
//     textAlign: 'center',
//     lineHeight: 20
//   },
//   securitySection: {
//     flexDirection: 'column',
//     justifyContent: 'space-around',
//     marginBottom: 32,
//     paddingVertical: 16,
//     marginLeft: 100,
//   },
//   securityItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//     gap: 6
//   },
//   securityText: {
//     color: '#e0e7ff',
//     fontSize: 12,
//     fontWeight: '500'
//   },
//   payButton: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginBottom: 20
//   },
//   payButtonDisabled: {
//     opacity: 0.6
//   },
//   payButtonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 18,
//     paddingHorizontal: 24,
//     gap: 12
//   },
//   payButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold'
//   },
//   footerText: {
//     color: '#94a3b8',
//     fontSize: 12,
//     textAlign: 'center',
//     lineHeight: 16
//   }
// });

// // screens/PaymentScreen.js
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   TouchableOpacity,
//   Text,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
// } from "react-native";
// import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   CreditCard,
//   Shield,
//   CheckCircle,
//   AlertTriangle,
//   ArrowLeft,
//   Zap,
//   DollarSign,
//   Lock,
// } from "lucide-react-native";
// import api from "../api/client";
// import Constants from "expo-constants";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { getCoveredDescription } from "../utils/serviceMatrix";

// // ---------- Helpers ----------
// const getPublishableKey = () =>
//   Constants?.expoConfig?.extra?.stripeKey ||
//   Constants?.manifest?.extra?.stripeKey ||
//   process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
//   "";

// const validateSheetParams = (params) => {
//   if (!params) return false;
//   if (!params.customer) return false;
//   if (!params.ephemeralKey) return false;
//   if (!params.paymentIntentClientSecret) return false;
//   if (!String(params.paymentIntentClientSecret).includes("_secret_")) return false;
//   return true;
// };

// // =====================================================
// // Outer component: provides StripeProvider
// // =====================================================
// export default function PaymentScreen() {
//   const pk = getPublishableKey();
//   console.log("🧾 [PaymentScreen] Stripe publishable key present:", Boolean(pk));
//   if (!pk) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//         <View style={styles.errorContainer}>
//           <AlertTriangle color="#f87171" size={48} />
//           <Text style={styles.errorText}>
//             Stripe publishable key is missing. Please configure it in your app config.
//           </Text>
//         </View>
//       </LinearGradient>
//     );
//   }

//   return (
//     <StripeProvider publishableKey={pk}>
//       <PaymentScreenInner />
//     </StripeProvider>
//   );
// }

// // =====================================================
// // Inner component: all payment logic + navigation
// // =====================================================
// function PaymentScreenInner() {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { initPaymentSheet, presentPaymentSheet } = useStripe();

//   const L = (...args) => console.log("🧾 [PaymentScreen]", ...args);

//   useEffect(() => {
//     L("Mounted. route.name:", route?.name, "route.params:", route?.params);
//     try {
//       const navState = navigation?.getState?.();
//       L("Navigation state keys:", Object.keys(navState || {}));
//       L("Nav routes length:", navState?.routes?.length, "index:", navState?.index);
//       L(
//         "Nav current route:",
//         navState?.routes?.[navState?.index || 0]?.name,
//         "params:",
//         navState?.routes?.[navState?.index || 0]?.params
//       );
//     } catch (e) {
//       L("Navigation state read error", e?.message || e);
//     }
//   }, [navigation, route]);

//   // Try to grab it from the route
//   const routeJobId =
//     route?.params?.jobId ||
//     route?.params?.id ||
//     route?.params?.job?._id ||
//     route?.params?.job?.id ||
//     null;

//   const [resolvingJobId, setResolvingJobId] = useState(!routeJobId);
//   const [effectiveJobId, setEffectiveJobId] = useState(routeJobId);

//   const [loadingSheet, setLoadingSheet] = useState(false);
//   const [paymentReady, setPaymentReady] = useState(false);
//   const [job, setJob] = useState(null);

//   // ---- Resolve jobId if not passed on route ----
//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       if (routeJobId) {
//         L("Using routeJobId:", routeJobId);
//         try {
//           await AsyncStorage.setItem("activeJobId", String(routeJobId));
//           L("Stored activeJobId (route)");
//         } catch (e) {
//           L("Store activeJobId (route) error", e?.message || e);
//         }
//         if (!cancelled) {
//           setEffectiveJobId(routeJobId);
//           setResolvingJobId(false);
//         }
//         return;
//       }

//       setResolvingJobId(true);
//       L("No routeJobId, trying AsyncStorage fallbacks…");

//       let id = null;
//       try {
//         id = await AsyncStorage.getItem("activeJobId");
//         L("activeJobId from storage:", id);
//       } catch (e) {
//         L("Read activeJobId error:", e?.message || e);
//       }

//       if (!id) {
//         try {
//           const lastId = await AsyncStorage.getItem("lastCreatedJobId");
//           L("lastCreatedJobId from storage:", lastId);
//           if (lastId) id = lastId;
//         } catch (e) {
//           L("Read lastCreatedJobId error:", e?.message || e);
//         }
//       }

//       if (!id) {
//         try {
//           const raw = await AsyncStorage.getItem("session");
//           L("session raw present:", Boolean(raw));
//           if (raw) {
//             const parsed = JSON.parse(raw);
//             id = parsed?.jobId || parsed?.session?.jobId || null;
//             L("session parsed jobId:", id);
//           }
//         } catch (e) {
//           L("Read session error:", e?.message || e);
//         }
//       }

//       if (!cancelled) {
//         setEffectiveJobId(id || null);
//         setResolvingJobId(false);
//         L("Resolved effectiveJobId:", id || null);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, []); // run once

//   // ---- Prepare Stripe payment sheet once we have a jobId ----
//   useEffect(() => {
//     if (!effectiveJobId || resolvingJobId) {
//       if (!effectiveJobId) L("⛔ No effectiveJobId yet. Skipping preparePayment.");
//       if (resolvingJobId) L("…still resolvingJobId, wait.");
//       return;
//     }

//     let cancelled = false;

//     const preparePayment = async () => {
//       setLoadingSheet(true);
//       L("preparePayment start. jobId=", effectiveJobId);
//       try {
//         // 1) Fetch job (must include estimatedTotal etc.)
//         const { data: jobData } = await api.get(`/jobs/${effectiveJobId}`);
//         if (cancelled) return;
//         setJob(jobData);
//         L("GET /jobs response keys:", Object.keys(jobData || {}));
//         L(
//           "Job amounts → estimatedTotal:",
//           jobData?.estimatedTotal,
//           "additionalCharge:",
//           jobData?.additionalCharge
//         );

//         // 2) Build customer hints
//         const customerName = `${jobData?.customer?.name || jobData?.firstName || ""} ${
//           jobData?.customer?.lastName || jobData?.lastName || ""
//         }`.trim();
//         const customerEmail =
//           jobData?.customer?.email || jobData?.email || jobData?.customerEmail || "";
//         L("Customer hints:", { customerName, customerEmailPresent: Boolean(customerEmail) });

//         // 3) Ask backend for PaymentSheet params
//         const { data: sheetParams } = await api.post("/payments/payment-sheet", {
//           jobId: effectiveJobId,
//           customerName,
//           customerEmail,
//         });
//         if (cancelled) return;

//         L("Payment sheet params present:", {
//           hasCustomer: Boolean(sheetParams?.customer),
//           hasEphemeralKey: Boolean(sheetParams?.ephemeralKey),
//           hasPISecret: Boolean(sheetParams?.paymentIntentClientSecret),
//         });

//         if (!validateSheetParams(sheetParams)) {
//           Alert.alert("Stripe Error", "Invalid payment session returned.");
//           L("⛔ validateSheetParams failed. Raw keys:", Object.keys(sheetParams || {}));
//           return;
//         }

//         // 4) Init payment sheet
//         const { error: initError } = await initPaymentSheet({
//           merchantDisplayName: "BlinqFix",
//           customerId: sheetParams.customer,
//           customerEphemeralKeySecret: sheetParams.ephemeralKey,
//           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
//           allowsDelayedPaymentMethods: true,
//         });

//         if (initError) {
//           L("initPaymentSheet error:", initError);
//           Alert.alert("Stripe Error", initError.message || "Could not initialize payment sheet.");
//           return;
//         }

//         L("Payment sheet ready ✅");
//         setPaymentReady(true);
//       } catch (err) {
//         L("Stripe init error", err?.response?.data || err?.message || err);
//         Alert.alert("Stripe Error", "Could not initialize payment sheet.");
//       } finally {
//         if (!cancelled) setLoadingSheet(false);
//       }
//     };

//     preparePayment();
//     return () => {
//       cancelled = true;
//     };
//   }, [effectiveJobId, resolvingJobId, initPaymentSheet]);

//   // ---- Pay handler ----
//   // const handlePay = async () => {
//   //   if (!paymentReady) {
//   //     L("Pay tapped but sheet not ready");
//   //     return Alert.alert("Payment not ready", "Please wait while we prepare your payment.");
//   //   }

//   //   try {
//   //     L("presentPaymentSheet → begin");
//   //     const { error } = await presentPaymentSheet();
//   //     if (error) {
//   //       L("presentPaymentSheet → error:", error?.message || error);
//   //       return Alert.alert("Payment Failed", error.message || "Unknown error occurred.");
//   //     }
//   //     L("presentPaymentSheet → success ✅");

//   //     // Persist for safety
//   //     try {
//   //       await AsyncStorage.setItem("activeJobId", String(effectiveJobId));
//   //       L("Persisted activeJobId after payment:", String(effectiveJobId));
//   //     } catch (e) {
//   //       L("Persist activeJobId error:", e?.message || e);
//   //     }

//   //     // ✅ Hard reset the stack to a single screen: CustomerJobStatus
//   //     L("RESET → CustomerJobStatus with jobId:", effectiveJobId);
//   //     navigation.dispatch(
//   //       CommonActions.reset({
//   //         index: 0,
//   //         routes: [{ name: "CustomerJobStatus", params: { jobId: String(effectiveJobId) } }],
//   //       })
//   //     );

//   //     // Mark paid (non‑blocking)
//   //     api
//   //       .put(`/jobs/complete-payment/${effectiveJobId}`)
//   //       .then(() => L("complete-payment marked ✓"))
//   //       .catch((e) =>
//   //         L("complete-payment warning", e?.response?.data || e?.message || e)
//   //       );
//   //   } catch (err) {
//   //     L("presentPaymentSheet fatal error", err?.response?.data || err?.message || err);
//   //     Alert.alert("Error", "Failed to complete payment.");
//   //   }
//   // };

//   const handlePay = async () => {
//     if (!paymentReady) {
//       return Alert.alert("Payment not ready", "Please wait while we prepare your payment.");
//     }
//     try {
//       console.log("🧾 [PaymentScreen] presentPaymentSheet → begin");
//       const { error } = await presentPaymentSheet();
//       if (error) {
//         return Alert.alert("Payment Failed", error.message || "Unknown error occurred.");
//       }
//       console.log("🧾 [PaymentScreen] presentPaymentSheet → success ✅");
  
//       // Mark paid (non-blocking)
//       try {
//         await api.put(`/jobs/complete-payment/${effectiveJobId}`);
//         console.log("🧾 [PaymentScreen] complete-payment marked ✓");
//       } catch (e) {
//         console.warn("complete-payment warning", e?.response?.data || e?.message || e);
//       }
  
//       // Persist for safety
//       try {
//         await AsyncStorage.setItem("activeJobId", String(effectiveJobId));
//         await AsyncStorage.setItem("postPaymentJobId", String(effectiveJobId)); // 👈 sentinel
//         console.log("🧾 [PaymentScreen] Persisted activeJobId after payment:", effectiveJobId);
//       } catch {}
  
//       // Hard reset to the status screen
//       console.log("🧾 [PaymentScreen] RESET → CustomerJobStatus with jobId:", effectiveJobId);
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "CustomerJobStatus", params: { jobId: effectiveJobId, from: "payment" } }],
//       });
  
//       // Fallback (in case root nav re-renders right after reset)
//       setTimeout(() => {
//         const s = navigation.getState?.();
//         const top = s?.routes?.[s?.index || 0];
//         console.log("🧾 [PaymentScreen] Post-reset top route:", top?.name, "params:", top?.params);
//         if (top?.name !== "CustomerJobStatus") {
//           console.warn("🧾 [PaymentScreen] Fallback navigate → CustomerJobStatus");
//           navigation.navigate("CustomerJobStatus", { jobId: effectiveJobId, from: "payment-fallback" });
//         }
//       }, 60);
//     } catch (err) {
//       console.warn("presentPaymentSheet error", err?.response?.data || err?.message || err);
//       Alert.alert("Error", "Failed to complete payment.");
//     }
//   };
  

//   const estimatedTotal = Number(job?.estimatedTotal ?? 0);
//   const additionalCharge = Number(job?.additionalCharge ?? 0);
//   const totalToday = Number((estimatedTotal + additionalCharge).toFixed(2));
//   useEffect(() => {
//     L("Render amounts → totalToday:", totalToday, "estimatedTotal:", estimatedTotal, "additionalCharge:", additionalCharge);
//   }, [totalToday, estimatedTotal, additionalCharge]);

//   // ---- UI states ----
//   if (resolvingJobId) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#fff" />
//           <Text style={styles.loadingText}>Preparing your payment…</Text>
//         </View>
//       </LinearGradient>
//     );
//   }

//   if (!effectiveJobId) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//         <View style={styles.errorContainer}>
//           <AlertTriangle color="#f87171" size={48} />
//           <Text style={styles.errorText}>
//             Missing job reference. Please start your booking again from the dashboard.
//           </Text>
//         </View>
//       </LinearGradient>
//     );
//   }

//   if (loadingSheet || !job) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#fff" />
//           <Text style={styles.loadingText}>Preparing your payment…</Text>
//         </View>
//       </LinearGradient>
//     );
//   }

//   // ---- Render ----
//   const description =
//     job?.coveredDescription || getCoveredDescription(job?.service || job?.details?.issue || "");

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//               <ArrowLeft color="#fff" size={24} />
//             </TouchableOpacity>
//             <View style={styles.headerCenter}>
//               <View style={styles.headerBadge}>
//                 <Zap color="#facc15" size={16} />
//                 <Text style={styles.headerBadgeText}>Secure Payment</Text>
//               </View>
//               <Text style={styles.headerTitle}>Complete Your Order</Text>
//             </View>
//             <View style={{ width: 40 }} />
//           </View>

//           {/* Payment Summary Card */}
//           <View style={styles.summaryCard}>
//             <LinearGradient
//               colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
//               style={styles.summaryGradient}
//             >
//               <View style={styles.cardHeader}>
//                 <DollarSign color="#22c55e" size={24} />
//                 <Text style={styles.summaryTitle}>Payment Summary</Text>
//               </View>

//               <View style={styles.totalContainer}>
//                 <Text style={styles.totalLabel}>Total Today</Text>
//                 <Text style={styles.totalAmount}>${totalToday.toFixed(2)}</Text>
//               </View>

//               {additionalCharge > 0 && (
//                 <View style={styles.additionalChargeContainer}>
//                   <Text style={styles.additionalChargeLabel}>Includes Additional Charge</Text>
//                   <Text style={styles.additionalChargeAmount}>+${additionalCharge.toFixed(2)}</Text>
//                 </View>
//               )}

//               <View style={styles.divider} />

//               <View style={styles.coveredSection}>
//                 <Text style={styles.coveredTitle}>What's Included</Text>
//                 <Text style={styles.coveredDescription}>{description}</Text>
//               </View>
//             </LinearGradient>
//           </View>

//           {/* Security Features */}
//           <View style={styles.securitySection}>
//             <View style={styles.securityItem}>
//               <Shield color="#22c55e" size={16} />
//               <Text style={styles.securityText}>256-bit SSL encryption</Text>
//             </View>
//             <View style={styles.securityItem}>
//               <Lock color="#60a5fa" size={16} />
//               <Text style={styles.securityText}>Secure payment processing</Text>
//             </View>
//             <View style={styles.securityItem}>
//               <CheckCircle color="#c084fc" size={16} />
//               <Text style={styles.securityText}>100% satisfaction guaranteed</Text>
//             </View>
//           </View>

//           {/* Pay Button */}
//           <TouchableOpacity
//             style={[styles.payButton, !paymentReady && styles.payButtonDisabled]}
//             onPress={handlePay}
//             disabled={!paymentReady}
//           >
//             <LinearGradient
//               colors={paymentReady ? ["#22c55e", "#16a34a"] : ["#6b7280", "#4b5563"]}
//               style={styles.payButtonGradient}
//             >
//               <CreditCard color="#fff" size={20} />
//               <Text style={styles.payButtonText}>
//                 {paymentReady ? "Pay & Book Service" : "Preparing Payment..."}
//               </Text>
//             </LinearGradient>
//           </TouchableOpacity>

//           {/* Footer */}
//           <Text style={styles.footerText}>
//             By proceeding, you agree to BlinqFix&apos;s terms of service and privacy policy.
//           </Text>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// // ---------- Styles ----------
// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },
//   errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
//   errorText: { color: "#f87171", fontSize: 18, textAlign: "center", marginTop: 16 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   loadingText: { color: "#fff", fontSize: 16, marginTop: 16 },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: 10,
//     paddingBottom: 20,
//   },
//   backButton: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     padding: 10,
//     borderRadius: 99,
//     width: 44,
//     height: 44,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   headerCenter: { alignItems: "center", flex: 1 },
//   headerBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.1)",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginBottom: 8,
//   },
//   headerBadgeText: { color: "#fff", marginLeft: 6, fontSize: 12, fontWeight: "500" },
//   headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
//   summaryCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
//   summaryGradient: { padding: 24 },
//   cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
//   summaryTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginLeft: 12 },
//   totalContainer: { alignItems: "center", marginBottom: 16 },
//   totalLabel: { fontSize: 16, color: "#e0e7ff", marginBottom: 8 },
//   totalAmount: { fontSize: 36, fontWeight: "900", color: "#22c55e" },
//   additionalChargeContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   additionalChargeLabel: { fontSize: 16, color: "#e0e7ff" },
//   additionalChargeAmount: { fontSize: 18, fontWeight: "bold", color: "#fb923c" },
//   divider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 20 },
//   coveredSection: { backgroundColor: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 12 },
//   coveredTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 8 },
//   coveredDescription: { fontSize: 14, color: "#e0e7ff", lineHeight: 20 },
//   securitySection: {
//     flexDirection: "column",
//     justifyContent: "space-around",
//     marginBottom: 32,
//     paddingVertical: 16,
//     marginLeft: 100,
//   },
//   securityItem: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 6 },
//   securityText: { color: "#e0e7ff", fontSize: 12, fontWeight: "500" },
//   payButton: { borderRadius: 16, overflow: "hidden", marginBottom: 20 },
//   payButtonDisabled: { opacity: 0.6 },
//   payButtonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 18,
//     paddingHorizontal: 24,
//     gap: 12,
//   },
//   payButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
//   footerText: { color: "#94a3b8", fontSize: 12, textAlign: "center", lineHeight: 16 },
// });


// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   TouchableOpacity,
//   Text,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   InteractionManager, // ✅ defer navigation until after UI settles
// } from "react-native";
// import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   CreditCard,
//   Shield,
//   CheckCircle,
//   AlertTriangle,
//   ArrowLeft,
//   Zap,
//   DollarSign,
//   Lock,
// } from "lucide-react-native";
// import api from "../api/client";
// import Constants from "expo-constants";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { navigationRef } from "../context/AuthProvider"; // ✅ root navigator ref
// import { getCoveredDescription } from "../utils/serviceMatrix";

// // ---------- Helpers ----------
// const getPublishableKey = () =>
//   Constants?.expoConfig?.extra?.stripeKey ||
//   Constants?.manifest?.extra?.stripeKey ||
//   process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
//   "";

// const validateSheetParams = (params) => {
//   if (!params) return false;
//   if (!params.customer) return false;
//   if (!params.ephemeralKey) return false;
//   if (!params.paymentIntentClientSecret) return false;
//   if (!String(params.paymentIntentClientSecret).includes("_secret_")) return false;
//   return true;
// };

// // =====================================================
// // Outer component: provides StripeProvider
// // =====================================================
// export default function PaymentScreen() {
//   const pk = getPublishableKey();
//   console.log("🧾 [PaymentScreen] Stripe publishable key present:", Boolean(pk));
//   if (!pk) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//         <View style={styles.errorContainer}>
//           <AlertTriangle color="#f87171" size={48} />
//           <Text style={styles.errorText}>
//             Stripe publishable key is missing. Please configure it in your app config.
//           </Text>
//         </View>
//       </LinearGradient>
//     );
//   }

//   return (
//     <StripeProvider publishableKey={pk}>
//       <PaymentScreenInner />
//     </StripeProvider>
//   );
// }

// // =====================================================
// // Inner component: all payment logic + navigation
// // =====================================================
// function PaymentScreenInner() {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { initPaymentSheet, presentPaymentSheet } = useStripe();

//   const L = (...args) => console.log("🧾 [PaymentScreen]", ...args);

//   useEffect(() => {
//     L("Mounted. route.name:", route?.name, "route.params:", route?.params);
//     try {
//       const navState = navigation?.getState?.();
//       L("Navigation state keys:", Object.keys(navState || {}));
//       L("Nav routes length:", navState?.routes?.length, "index:", navState?.index);
//       L(
//         "Nav current route:",
//         navState?.routes?.[navState?.index || 0]?.name,
//         "params:",
//         navState?.routes?.[navState?.index || 0]?.params
//       );
//     } catch (e) {
//       L("Navigation state read error", e?.message || e);
//     }
//   }, [navigation, route]);

//   // Try to grab it from the route
//   const routeJobId =
//     route?.params?.jobId ||
//     route?.params?.id ||
//     route?.params?.job?._id ||
//     route?.params?.job?.id ||
//     null;

//   const [resolvingJobId, setResolvingJobId] = useState(!routeJobId);
//   const [effectiveJobId, setEffectiveJobId] = useState(routeJobId);

//   const [loadingSheet, setLoadingSheet] = useState(false);
//   const [paymentReady, setPaymentReady] = useState(false);
//   const [job, setJob] = useState(null);

//   // ---- Resolve jobId if not passed on route ----
//   useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       if (routeJobId) {
//         L("Using routeJobId:", routeJobId);
//         try {
//           await AsyncStorage.setItem("activeJobId", String(routeJobId));
//           L("Stored activeJobId (route)");
//         } catch (e) {
//           L("Store activeJobId (route) error", e?.message || e);
//         }
//         if (!cancelled) {
//           setEffectiveJobId(routeJobId);
//           setResolvingJobId(false);
//         }
//         return;
//       }

//       setResolvingJobId(true);
//       L("No routeJobId, trying AsyncStorage fallbacks…");

//       let id = null;
//       try {
//         id = await AsyncStorage.getItem("activeJobId");
//         L("activeJobId from storage:", id);
//       } catch (e) {
//         L("Read activeJobId error:", e?.message || e);
//       }

//       if (!id) {
//         try {
//           const lastId = await AsyncStorage.getItem("lastCreatedJobId");
//           L("lastCreatedJobId from storage:", lastId);
//           if (lastId) id = lastId;
//         } catch (e) {
//           L("Read lastCreatedJobId error:", e?.message || e);
//         }
//       }

//       if (!id) {
//         try {
//           const raw = await AsyncStorage.getItem("session");
//           L("session raw present:", Boolean(raw));
//           if (raw) {
//             const parsed = JSON.parse(raw);
//             id = parsed?.jobId || parsed?.session?.jobId || null;
//             L("session parsed jobId:", id);
//           }
//         } catch (e) {
//           L("Read session error:", e?.message || e);
//         }
//       }

//       if (!cancelled) {
//         setEffectiveJobId(id || null);
//         setResolvingJobId(false);
//         L("Resolved effectiveJobId:", id || null);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, []); // run once

//   // ---- Prepare Stripe payment sheet once we have a jobId ----
//   useEffect(() => {
//     if (!effectiveJobId || resolvingJobId) {
//       if (!effectiveJobId) L("⛔ No effectiveJobId yet. Skipping preparePayment.");
//       if (resolvingJobId) L("…still resolvingJobId, wait.");
//       return;
//     }

//     let cancelled = false;

//     const preparePayment = async () => {
//       setLoadingSheet(true);
//       L("preparePayment start. jobId=", effectiveJobId);
//       try {
//         // 1) Fetch job (must include estimatedTotal etc.)
//         const { data: jobData } = await api.get(`/jobs/${effectiveJobId}`);
//         if (cancelled) return;
//         setJob(jobData);
//         L("GET /jobs response keys:", Object.keys(jobData || {}));
//         L(
//           "Job amounts → estimatedTotal:",
//           jobData?.estimatedTotal,
//           "additionalCharge:",
//           jobData?.additionalCharge
//         );

//         // 2) Build customer hints
//         const customerName = `${jobData?.customer?.name || jobData?.firstName || ""} ${
//           jobData?.customer?.lastName || jobData?.lastName || ""
//         }`.trim();
//         const customerEmail =
//           jobData?.customer?.email || jobData?.email || jobData?.customerEmail || "";
//         L("Customer hints:", { customerName, customerEmailPresent: Boolean(customerEmail) });

//         // 3) Ask backend for PaymentSheet params
//         const { data: sheetParams } = await api.post("/payments/payment-sheet", {
//           jobId: effectiveJobId,
//           customerName,
//           customerEmail,
//         });
//         if (cancelled) return;

//         L("Payment sheet params present:", {
//           hasCustomer: Boolean(sheetParams?.customer),
//           hasEphemeralKey: Boolean(sheetParams?.ephemeralKey),
//           hasPISecret: Boolean(sheetParams?.paymentIntentClientSecret),
//         });

//         if (!validateSheetParams(sheetParams)) {
//           Alert.alert("Stripe Error", "Invalid payment session returned.");
//           L("⛔ validateSheetParams failed. Raw keys:", Object.keys(sheetParams || {}));
//           return;
//         }

//         // 4) Init payment sheet
//         const { error: initError } = await initPaymentSheet({
//           merchantDisplayName: "BlinqFix",
//           customerId: sheetParams.customer,
//           customerEphemeralKeySecret: sheetParams.ephemeralKey,
//           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
//           allowsDelayedPaymentMethods: true,
//         });

//         if (initError) {
//           L("initPaymentSheet error:", initError);
//           Alert.alert("Stripe Error", initError.message || "Could not initialize payment sheet.");
//           return;
//         }

//         L("Payment sheet ready ✅");
//         setPaymentReady(true);
//       } catch (err) {
//         L("Stripe init error", err?.response?.data || err?.message || err);
//         Alert.alert("Stripe Error", "Could not initialize payment sheet.");
//       } finally {
//         if (!cancelled) setLoadingSheet(false);
//       }
//     };

//     preparePayment();
//     return () => {
//       cancelled = true;
//     };
//   }, [effectiveJobId, resolvingJobId, initPaymentSheet]);

//   // ---- Post-payment: reset from the ROOT and defer until after interactions ----
//   const resetToJobStatus = async (jid) => {
//     const id = String(jid);

//     // Persist both durable and sentinel ids
//     try {
//       await AsyncStorage.multiSet([
//         ["activeJobId", id],
//         ["postPaymentJobId", id],
//       ]);
//     } catch {}

//     const resetAction = CommonActions.reset({
//       index: 0,
//       routes: [{ name: "CustomerJobStatus", params: { jobId: id, from: "payment" } }],
//     });

//     // Prefer root ref; fall back to local nav if needed
//     if (navigationRef?.isReady?.()) {
//       console.log("🧾 [PaymentScreen] Dispatching reset via root ref");
//       navigationRef.dispatch(resetAction);
//     } else {
//       console.log("🧾 [PaymentScreen] Root ref not ready, using local navigation");
//       navigation.dispatch(resetAction);
//       navigation.getParent?.()?.dispatch?.(resetAction); // nested fallback
//     }

//     // Debug: confirm where we landed
//     setTimeout(() => {
//       try {
//         const st = navigationRef?.getRootState?.() || navigation.getState?.();
//         const top = st?.routes?.[st?.index || 0];
//         console.log("🧾 [PaymentScreen] Post-reset top route:", top?.name, "params:", top?.params);
//       } catch {}
//     }, 0);
//   };

//   // ---- Pay handler ----
//   const handlePay = async () => {
//     if (!paymentReady) {
//       return Alert.alert("Payment not ready", "Please wait while we prepare your payment.");
//     }
//     try {
//       L("presentPaymentSheet → begin");
//       const { error } = await presentPaymentSheet();
//       if (error) {
//         L("presentPaymentSheet → error:", error?.message || error);
//         return Alert.alert("Payment Failed", error.message || "Unknown error occurred.");
//       }
//       L("presentPaymentSheet → success ✅");

//       // Mark paid (non-blocking)
//       api
//         .put(`/jobs/complete-payment/${effectiveJobId}`)
//         .then(() => L("complete-payment marked ✓"))
//         .catch((e) => L("complete-payment warning", e?.response?.data || e?.message || e));

//       // Persist for safety
//       try {
//         await AsyncStorage.setItem("activeJobId", String(effectiveJobId));
//         await AsyncStorage.setItem("postPaymentJobId", String(effectiveJobId));
//         L("Persisted activeJobId after payment:", String(effectiveJobId));
//       } catch (e) {
//         L("Persist activeJobId error:", e?.message || e);
//       }

//       // Defer the reset until after current UI / Stripe tasks finish
//       InteractionManager.runAfterInteractions(() => {
//         L("RESET → CustomerJobStatus with jobId:", String(effectiveJobId));
//         resetToJobStatus(effectiveJobId);
//       });
//     } catch (err) {
//       L("presentPaymentSheet fatal error", err?.response?.data || err?.message || err);
//       Alert.alert("Error", "Failed to complete payment.");
//     }
//   };

//   const estimatedTotal = Number(job?.estimatedTotal ?? 0);
//   const additionalCharge = Number(job?.additionalCharge ?? 0);
//   const totalToday = Number((estimatedTotal + additionalCharge).toFixed(2));
//   useEffect(() => {
//     L(
//       "Render amounts → totalToday:",
//       totalToday,
//       "estimatedTotal:",
//       estimatedTotal,
//       "additionalCharge:",
//       additionalCharge
//     );
//   }, [totalToday, estimatedTotal, additionalCharge]);

//   // ---- UI states ----
//   if (resolvingJobId) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#fff" />
//           <Text style={styles.loadingText}>Preparing your payment…</Text>
//         </View>
//       </LinearGradient>
//     );
//   }

//   if (!effectiveJobId) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//         <View style={styles.errorContainer}>
//           <AlertTriangle color="#f87171" size={48} />
//           <Text style={styles.errorText}>
//             Missing job reference. Please start your booking again from the dashboard.
//           </Text>
//         </View>
//       </LinearGradient>
//     );
//   }

//   if (loadingSheet || !job) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#fff" />
//           <Text style={styles.loadingText}>Preparing your payment…</Text>
//         </View>
//       </LinearGradient>
//     );
//   }

//   // ---- Render ----
//   const description =
//     job?.coveredDescription || getCoveredDescription(job?.service || job?.details?.issue || "");

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//               <ArrowLeft color="#fff" size={24} />
//             </TouchableOpacity>
//             <View style={styles.headerCenter}>
//               <View style={styles.headerBadge}>
//                 <Zap color="#facc15" size={16} />
//                 <Text style={styles.headerBadgeText}>Secure Payment</Text>
//               </View>
//               <Text style={styles.headerTitle}>Complete Your Order</Text>
//             </View>
//             <View style={{ width: 40 }} />
//           </View>

//           {/* Payment Summary Card */}
//           <View style={styles.summaryCard}>
//             <LinearGradient
//               colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
//               style={styles.summaryGradient}
//             >
//               <View style={styles.cardHeader}>
//                 <DollarSign color="#22c55e" size={24} />
//                 <Text style={styles.summaryTitle}>Payment Summary</Text>
//               </View>

//               <View style={styles.totalContainer}>
//                 <Text style={styles.totalLabel}>Total Today</Text>
//                 <Text style={styles.totalAmount}>${totalToday.toFixed(2)}</Text>
//               </View>

//               {additionalCharge > 0 && (
//                 <View style={styles.additionalChargeContainer}>
//                   <Text style={styles.additionalChargeLabel}>Includes Additional Charge</Text>
//                   <Text style={styles.additionalChargeAmount}>+${additionalCharge.toFixed(2)}</Text>
//                 </View>
//               )}

//               <View style={styles.divider} />

//               <View style={styles.coveredSection}>
//                 <Text style={styles.coveredTitle}>What's Included</Text>
//                 <Text style={styles.coveredDescription}>{description}</Text>
//               </View>
//             </LinearGradient>
//           </View>

//           {/* Security Features */}
//           <View style={styles.securitySection}>
//             <View style={styles.securityItem}>
//               <Shield color="#22c55e" size={16} />
//               <Text style={styles.securityText}>256-bit SSL encryption</Text>
//             </View>
//             <View style={styles.securityItem}>
//               <Lock color="#60a5fa" size={16} />
//               <Text style={styles.securityText}>Secure payment processing</Text>
//             </View>
//             <View style={styles.securityItem}>
//               <CheckCircle color="#c084fc" size={16} />
//               <Text style={styles.securityText}>100% satisfaction guaranteed</Text>
//             </View>
//           </View>

//           {/* Pay Button */}
//           <TouchableOpacity
//             style={[styles.payButton, !paymentReady && styles.payButtonDisabled]}
//             onPress={handlePay}
//             disabled={!paymentReady}
//           >
//             <LinearGradient
//               colors={paymentReady ? ["#22c55e", "#16a34a"] : ["#6b7280", "#4b5563"]}
//               style={styles.payButtonGradient}
//             >
//               <CreditCard color="#fff" size={20} />
//               <Text style={styles.payButtonText}>
//                 {paymentReady ? "Pay & Book Service" : "Preparing Payment..."}
//               </Text>
//             </LinearGradient>
//           </TouchableOpacity>

//           {/* Footer */}
//           <Text style={styles.footerText}>
//             By proceeding, you agree to BlinqFix&apos;s terms of service and privacy policy.
//           </Text>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// // ---------- Styles ----------
// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },
//   errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
//   errorText: { color: "#f87171", fontSize: 18, textAlign: "center", marginTop: 16 },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   loadingText: { color: "#fff", fontSize: 16, marginTop: 16 },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: 10,
//     paddingBottom: 20,
//   },
//   backButton: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     padding: 10,
//     borderRadius: 99,
//     width: 44,
//     height: 44,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   headerCenter: { alignItems: "center", flex: 1 },
//   headerBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.1)",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginBottom: 8,
//   },
//   headerBadgeText: { color: "#fff", marginLeft: 6, fontSize: 12, fontWeight: "500" },
//   headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
//   summaryCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
//   summaryGradient: { padding: 24 },
//   cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
//   summaryTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginLeft: 12 },
//   totalContainer: { alignItems: "center", marginBottom: 16 },
//   totalLabel: { fontSize: 16, color: "#e0e7ff", marginBottom: 8 },
//   totalAmount: { fontSize: 36, fontWeight: "900", color: "#22c55e" },
//   additionalChargeContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   additionalChargeLabel: { fontSize: 16, color: "#e0e7ff" },
//   additionalChargeAmount: { fontSize: 18, fontWeight: "bold", color: "#fb923c" },
//   divider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 20 },
//   coveredSection: { backgroundColor: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 12 },
//   coveredTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 8 },
//   coveredDescription: { fontSize: 14, color: "#e0e7ff", lineHeight: 20 },
//   securitySection: {
//     flexDirection: "column",
//     justifyContent: "space-around",
//     marginBottom: 32,
//     paddingVertical: 16,
//     marginLeft: 100,
//   },
//   securityItem: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 6 },
//   securityText: { color: "#e0e7ff", fontSize: 12, fontWeight: "500" },
//   payButton: { borderRadius: 16, overflow: "hidden", marginBottom: 20 },
//   payButtonDisabled: { opacity: 0.6 },
//   payButtonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 18,
//     paddingHorizontal: 24,
//     gap: 12,
//   },
//   payButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
//   footerText: { color: "#94a3b8", fontSize: 12, textAlign: "center", lineHeight: 16 },
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
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
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

  L("Stripe publishable key present:", Boolean(pk), "acct:", stripeAccountId || "(platform)");

  if (!pk) {
    return (
      <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertTriangle color="#f87171" size={48} />
          <Text style={styles.errorText}>
            Stripe publishable key is missing. Please configure it in app config.
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
      L("Nav current route:", s?.routes?.[s?.index || 0]?.name, "params:", s?.routes?.[s?.index || 0]?.params);
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
        L("GET /jobs ok. status:", jobData?.status, "estimatedTotal:", jobData?.estimatedTotal);

        const customerName = `${jobData?.customer?.name || jobData?.firstName || ""} ${
          jobData?.customer?.lastName || jobData?.lastName || ""
        }`.trim();
        const customerEmail = jobData?.customer?.email || jobData?.email || jobData?.customerEmail || "";

        const { data: raw1 } = await api.post("/payments/payment-sheet", {
          jobId: effectiveJobId,
          customerName,
          customerEmail,
        });
        if (cancelled) return;

        const p1 = normalizeSheetParams(raw1);
        L("Sheet params (1st):", { customer: p1.customer, hasEK: !!p1.ephemeralKey, hasPI: !!p1.paymentIntentClientSecret });

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
          L("Sheet params (retry):", { customer: p2.customer, hasEK: !!p2.ephemeralKey, hasPI: !!p2.paymentIntentClientSecret });
          if (!isValidSheetParams(p2)) {
            Alert.alert("Stripe Error", "Could not initialize payment sheet (invalid retry).");
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
            Alert.alert("Stripe Error", initErr2.message || "Could not initialize payment sheet.");
            return;
          }
        }

        L("Payment sheet ready ✅");
        setPaymentReady(true);
      } catch (err) {
        L("preparePayment exception:", err?.response?.data || err?.message || err);
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
      return Alert.alert("Payment not ready", "Please wait while we prepare your payment.");
    }

    try {
      L("presentPaymentSheet → begin");
      const { error } = await presentPaymentSheet();
      if (error) {
        L("presentPaymentSheet → error:", error?.message || error);
        return Alert.alert("Payment Failed", error.message || "Unknown error occurred.");
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
          routes: [{ name: "CustomerJobStatus", params: { jobId: String(effectiveJobId), from: "payment" } }],
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
      L("presentPaymentSheet fatal:", err?.response?.data || err?.message || err);
      Alert.alert("Error", "Failed to complete payment.");
    }
  };

  const estimatedTotal = Number(job?.estimatedTotal ?? 0);
  const additionalCharge = Number(job?.additionalCharge ?? 0);
  const totalToday = Number((estimatedTotal + additionalCharge).toFixed(2));
  useEffect(() => {
    L("Render amounts → totalToday:", totalToday, "estimatedTotal:", estimatedTotal, "additionalCharge:", additionalCharge);
  }, [totalToday, estimatedTotal, additionalCharge]);

  /* UI states */
  if (resolvingJobId) {
    return (
      <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Preparing your payment…</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!effectiveJobId) {
    return (
      <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertTriangle color="#f87171" size={48} />
          <Text style={styles.errorText}>Missing job reference. Please start again.</Text>
        </View>
      </LinearGradient>
    );
  }

  if (loadingSheet || !job) {
    return (
      <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Preparing your payment…</Text>
        </View>
      </LinearGradient>
    );
  }

  const description =
    job?.coveredDescription || getCoveredDescription(job?.service || job?.details?.issue || "");

  return (
    <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
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

          {/* Summary */}
          <View style={styles.summaryCard}>
            <LinearGradient colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]} style={styles.summaryGradient}>
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
                  <Text style={styles.additionalChargeLabel}>Includes Additional Charge</Text>
                  <Text style={styles.additionalChargeAmount}>+${additionalCharge.toFixed(2)}</Text>
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
              <Text style={styles.securityText}>100% satisfaction guaranteed</Text>
            </View>
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            style={[styles.payButton, !paymentReady && styles.payButtonDisabled]}
            onPress={handlePay}
            disabled={!paymentReady}
          >
            <LinearGradient
              colors={paymentReady ? ["#22c55e", "#16a34a"] : ["#6b7280", "#4b5563"]}
              style={styles.payButtonGradient}
            >
              <CreditCard color="#fff" size={20} />
              <Text style={styles.payButtonText}>
                {paymentReady ? "Pay & Book Service" : "Preparing Payment..."}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            By proceeding, you agree to BlinqFix&apos;s terms of service and privacy policy.
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
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  errorText: { color: "#f87171", fontSize: 18, textAlign: "center", marginTop: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#fff", fontSize: 16, marginTop: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, paddingBottom: 20 },
  backButton: { backgroundColor: "rgba(255,255,255,0.1)", padding: 10, borderRadius: 99, width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  headerCenter: { alignItems: "center", flex: 1 },
  headerBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 8 },
  headerBadgeText: { color: "#fff", marginLeft: 6, fontSize: 12, fontWeight: "500" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  summaryCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
  summaryGradient: { padding: 24 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  summaryTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginLeft: 12 },
  totalContainer: { alignItems: "center", marginBottom: 16 },
  totalLabel: { fontSize: 16, color: "#e0e7ff", marginBottom: 8 },
  totalAmount: { fontSize: 36, fontWeight: "900", color: "#22c55e" },
  additionalChargeContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  additionalChargeLabel: { fontSize: 16, color: "#e0e7ff" },
  additionalChargeAmount: { fontSize: 18, fontWeight: "bold", color: "#fb923c" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 20 },
  coveredSection: { backgroundColor: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 12 },
  coveredTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  coveredDescription: { fontSize: 14, color: "#e0e7ff", lineHeight: 20 },
  securitySection: { flexDirection: "column", justifyContent: "space-around", marginBottom: 32, paddingVertical: 16, marginLeft: 100 },
  securityItem: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 6 },
  securityText: { color: "#e0e7ff", fontSize: 12, fontWeight: "500" },
  payButton: { borderRadius: 16, overflow: "hidden", marginBottom: 20 },
  payButtonDisabled: { opacity: 0.6 },
  payButtonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 18, paddingHorizontal: 24, gap: 12 },
  payButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  footerText: { color: "#94a3b8", fontSize: 12, textAlign: "center", lineHeight: 16 },
});
