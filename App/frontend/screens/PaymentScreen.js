// // // screens/PaymentScreen.js
// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   View,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   Text,
// // // } from "react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// // // import * as Linking from "expo-linking";
// // // import api from "../api/client";
// // // import Constants from "expo-constants";
// // // import LoadingScreen from "./LoadingScreen";

// // // const FEE_RATE = 0.07; // 7%

// // // export default function PaymentScreen() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);
// // //   const [onlyAdditional, setOnlyAdditional] = useState(false);

// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         // 1) Fetch the job
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);

// // //         // 2) Are we just paying the extra?
// // //         const addOn = job.status === "awaiting-additional-payment";
// // //         setOnlyAdditional(addOn);

// // //         // 3) Compute amount in cents
// // //         let amountCents;
// // //         if (addOn) {
// // //           const add = job.additionalCharge || 0;
// // //           const convFee = Number((add * FEE_RATE).toFixed(2));
// // //           amountCents = Math.round((add + convFee) * 100);
// // //         } else {
// // //           const { baseAmount = 0, adjustmentAmount = 0, rushFee = 0 } = job;
// // //           const subtotal = baseAmount + adjustmentAmount + rushFee;
// // //           const convFee = Number((subtotal * FEE_RATE).toFixed(2));
// // //           amountCents = Math.round((subtotal + convFee) * 100);
// // //         }

// // //         // 4) Create PaymentSheet session
// // //         const { data: sheetParams } = await api.post(
// // //           "/payments/payment-sheet",
// // //           { amount: amountCents, currency: "usd" }
// // //         );

// // //         // build a returnURL for iOS
// // //         const returnURL = Linking.createURL("/");
// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: sheetParams.customer,
// // //           customerEphemeralKeySecret: sheetParams.ephemeralKey,
// // //           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //           returnURL,
// // //         });
// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert(
// // //           "Error",
// // //           "Unable to initialize payment. Please try again."
// // //         );
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   // show your “success” animation then go back
// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() =>
// // //           navigation.replace("CustomerJobStatus", { jobId })
// // //         }
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
// // //       <View style={styles.container}>
// // //         {loadingSheet ? (
// // //           <ActivityIndicator size="large" />
// // //         ) : (
// // //           <TouchableOpacity
// // //             style={styles.payButton}
// // //             onPress={async () => {
// // //               const { error } = await presentPaymentSheet();
// // //               if (error) {
// // //                 console.error("❌ presentPaymentSheet error:", error);
// // //                 Alert.alert("Payment failed", error.message);
// // //                 return;
// // //               }

// // //               // 5) Call correct endpoint
// // //               try {
// // //                 const endpoint = onlyAdditional
// // //                   ? `/jobs/${jobId}/complete-additional`
// // //                   : `/jobs/complete-payment/${jobId}`;
// // //                 await api.put(endpoint);
// // //               } catch (e) {
// // //                 console.error("Complete‐payment error:", e);
// // //                 // you can choose to re‐alert or still proceed
// // //               }

// // //               // 6) run success animation
// // //               setShowAnimation(true);
// // //             }}
// // //           >
// // //             <Text style={styles.payButtonText}>
// // //               {onlyAdditional ? "Pay Additional & Book" : "Pay & Book"}
// // //             </Text>
// // //           </TouchableOpacity>
// // //         )}
// // //       </View>
// // //     </StripeProvider>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     justifyContent: "center",
// // //     alignItems: "center",
// // //   },
// // //   payButton: {
// // //     backgroundColor: "#1976d2",
// // //     paddingVertical: 14,
// // //     paddingHorizontal: 24,
// // //     borderRadius: 8,
// // //   },
// // //   payButtonText: {
// // //     color: "#fff",
// // //     fontSize: 16,
// // //     fontWeight: "bold",
// // //   },
// // // });

// // // screens/PaymentScreen.js
// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   View,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   Text,
// // // } from "react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// // // import * as Linking from "expo-linking";
// // // import api from "../api/client";
// // // import Constants from "expo-constants";
// // // import LoadingScreen from "./LoadingScreen";

// // // const FEE_RATE = 0.07; // 7%

// // // export default function PaymentScreen() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);
// // //   const [onlyAdditional, setOnlyAdditional] = useState(false);

// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         // 1) Grab the latest job
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);

// // //         // 2) Are we here just to pay an extra‐charge?
// // //         const addOn = job.status === "awaiting-additional-payment";
// // //         setOnlyAdditional(addOn);

// // //         // 3) Figure out exactly how much (in cents) we’re charging:
// // //         let amount = 0;
// // //         if (addOn) {
// // //           // just the extra + fee
// // //           const add = job.additionalCharge || 0;
// // //           const conv = Number((add * FEE_RATE).toFixed(2));
// // //           amount = Math.round((add + conv) * 100);
// // //         } else {
// // //           // full subtotal + fee
// // //           const { baseAmount = 0, adjustmentAmount = 0, rushFee = 0 } = job;
// // //           const sub = baseAmount + adjustmentAmount + rushFee;
// // //           const conv = Number((sub * FEE_RATE).toFixed(2));
// // //           amount = Math.round((sub + conv) * 100);
// // //         }

// // //         // 4) Create a PaymentSheet session
// // //         const { data: sheetParams } = await api.post("/payments/payment-sheet", {
// // //           amount,
// // //           currency: "usd",
// // //         });

// // //         // build a returnURL for deep‐linking on iOS
// // //         const returnURL = Linking.createURL("/");
// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: sheetParams.customer,
// // //           customerEphemeralKeySecret: sheetParams.ephemeralKey,
// // //           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //           returnURL,
// // //         });
// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert(
// // //           "Error",
// // //           "Unable to initialize payment. Please try again."
// // //         );
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   // show your success animation then navigate
// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() =>
// // //           navigation.replace("CustomerJobStatus", { jobId })
// // //         }
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
// // //       <View style={styles.container}>
// // //         {loadingSheet ? (
// // //           <ActivityIndicator size="large" />
// // //         ) : (
// // //           <TouchableOpacity
// // //             style={styles.payButton}
// // //             onPress={async () => {
// // //               const { error } = await presentPaymentSheet();
// // //               if (error) {
// // //                 console.error("❌ presentPaymentSheet error:", error);
// // //                 Alert.alert("Payment failed", error.message);
// // //                 return;
// // //               }

// // //               // 5) Tell backend we’ve paid
// // //               try {
// // //                 const endpoint = onlyAdditional
// // //                   ? `/jobs/${jobId}/complete-additional`
// // //                   : `/jobs/complete-payment/${jobId}`;
// // //                 await api.put(endpoint);
// // //               } catch (e) {
// // //                 console.error("Complete‐payment error:", e);
// // //                 // even if this fails, we still show success animation
// // //               }

// // //               // 6) run success animation & navigate
// // //               setShowAnimation(true);
// // //             }}
// // //           >
// // //             <Text style={styles.payButtonText}>
// // //               {onlyAdditional ? "Pay Additional & Book" : "Pay & Book"}
// // //             </Text>
// // //           </TouchableOpacity>
// // //         )}
// // //       </View>
// // //     </StripeProvider>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     justifyContent: "center",
// // //     alignItems: "center",
// // //   },
// // //   payButton: {
// // //     backgroundColor: "#1976d2",
// // //     paddingVertical: 14,
// // //     paddingHorizontal: 24,
// // //     borderRadius: 8,
// // //   },
// // //   payButtonText: {
// // //     color: "#fff",
// // //     fontSize: 16,
// // //     fontWeight: "bold",
// // //   },
// // // });

// // // screens/PaymentScreenInner.js
// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   View,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   Text,
// // // } from "react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import { useStripe } from "@stripe/stripe-react-native";
// // // import * as Linking from "expo-linking";
// // // import api from "../api/client";
// // // import LoadingScreen from "./LoadingScreen";

// // // const FEE_RATE = 0.07; // 7%

// // // export default function PaymentScreenInner() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);
// // //   const [onlyAdditional, setOnlyAdditional] = useState(false);

// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);
// // //         const addOn = job.status === "awaiting-additional-payment";
// // //         setOnlyAdditional(addOn);

// // //         let amount = 0;
// // //         if (addOn) {
// // //           const add = job.additionalCharge || 0;
// // //           const conv = Number((add * FEE_RATE).toFixed(2));
// // //           amount = Math.round((add + conv) * 100);
// // //         } else {
// // //           const { baseAmount = 0, adjustmentAmount = 0, rushFee = 0 } = job;
// // //           const sub = baseAmount + adjustmentAmount + rushFee;
// // //           const conv = Number((sub * FEE_RATE).toFixed(2));
// // //           amount = Math.round((sub + conv) * 100);
// // //         }

// // //         const { data: sheetParams } = await api.post(
// // //           "/payments/payment-sheet",
// // //           {
// // //             amount,
// // //             currency: "usd",
// // //           }
// // //         );

// // //         const returnURL = Linking.createURL("/");
// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: sheetParams.customer,
// // //           customerEphemeralKeySecret: sheetParams.ephemeralKey,
// // //           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //           returnURL,
// // //         });
// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert("Error", "Unable to initialize payment. Please try again.");
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() =>
// // //           navigation.replace({
// // //             index: 0,
// // //             routes: [{ name: "CustomerJobStatus", params: { jobId } }],
// // //           })
// // //         }
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <View style={styles.container}>
// // //       {loadingSheet ? (
// // //         <ActivityIndicator size="large" />
// // //       ) : (
// // //         <TouchableOpacity
// // //           style={styles.payButton}
// // //           onPress={async () => {
// // //             const { error } = await presentPaymentSheet();
// // //             if (error) {
// // //               console.error("❌ presentPaymentSheet error:", error);
// // //               Alert.alert("Payment failed", error.message);
// // //               return;
// // //             }

// // //             // notify backend
// // //             try {
// // //               const endpoint = onlyAdditional
// // //                 ? `/jobs/${jobId}/complete-additional`
// // //                 : `/jobs/complete-payment/${jobId}`;
// // //               await api.put(endpoint);
// // //             } catch (e) {
// // //               console.error("Complete‐payment error:", e);
// // //             }

// // //             setShowAnimation(true);
// // //           }}
// // //         >
// // //           <Text style={styles.payButtonText}>
// // //             {onlyAdditional ? "Pay Additional & Book" : "Pay & Book"}
// // //           </Text>
// // //         </TouchableOpacity>
// // //       )}
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// // //   payButton: {
// // //     backgroundColor: "#1976d2",
// // //     paddingVertical: 14,
// // //     paddingHorizontal: 24,
// // //     borderRadius: 8,
// // //   },
// // //   payButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
// // // });

// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   View,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   Text,
// // // } from "react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import { useStripe } from "@stripe/stripe-react-native";
// // // import * as Linking from "expo-linking";
// // // import api from "../api/client";
// // // import LoadingScreen from "./LoadingScreen";

// // // const FEE_RATE = 0.07; // 7%

// // // export default function PaymentScreenInner() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);
// // //   const [onlyAdditional, setOnlyAdditional] = useState(false);

// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);
// // //         const isAddOn = job.status === "awaiting-additional-payment";
// // //         setOnlyAdditional(isAddOn);

// // //         let amount = 0;
// // //         if (isAddOn) {
// // //           const add = job.additionalCharge || 0;
// // //           const conv = Number((add * FEE_RATE).toFixed(2));
// // //           amount = Math.round((add + conv) * 100);
// // //         } else {
// // //           const { baseAmount = 0, adjustmentAmount = 0, rushFee = 0 } = job;
// // //           const sub = baseAmount + adjustmentAmount + rushFee;
// // //           const conv = Number((sub * FEE_RATE).toFixed(2));
// // //           amount = Math.round((sub + conv) * 100);
// // //         }

// // //         const { data: sheetParams } = await api.post(
// // //           "/payments/payment-sheet",
// // //           { amount, currency: "usd" }
// // //         );

// // //         const returnURL = Linking.createURL("/");
// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: sheetParams.customer,
// // //           customerEphemeralKeySecret: sheetParams.ephemeralKey,
// // //           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //           returnURL,
// // //         });
// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert(
// // //           "Error",
// // //           "Unable to initialize payment. Please try again."
// // //         );
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() =>
// // //           navigation.replace("CustomerJobStatus", { jobId })
// // //         }
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <View style={styles.container}>
// // //       {loadingSheet ? (
// // //         <ActivityIndicator size="large" />
// // //       ) : (
// // //         <TouchableOpacity
// // //           style={styles.payButton}
// // //           onPress={async () => {
// // //             const { error } = await presentPaymentSheet();
// // //             if (error) {
// // //               console.error("❌ presentPaymentSheet error:", error);
// // //               Alert.alert("Payment failed", error.message);
// // //               return;
// // //             }

// // //             // tell your backend the payment succeeded
// // //             try {
// // //               const endpoint = onlyAdditional
// // //                 ? `/jobs/${jobId}/complete-additional`
// // //                 : `/jobs/complete-payment/${jobId}`;
// // //               await api.put(endpoint);
// // //             } catch (e) {
// // //               console.error("Complete‐payment error:", e);
// // //             }

// // //             // show the "booking" animation, then go back
// // //             setShowAnimation(true);
// // //           }}
// // //         >
// // //           <Text style={styles.payButtonText}>
// // //             {onlyAdditional ? "Pay Additional & Book" : "Pay & Book"}
// // //           </Text>
// // //         </TouchableOpacity>
// // //       )}
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// // //   payButton: {
// // //     backgroundColor: "#1976d2",
// // //     paddingVertical: 14,
// // //     paddingHorizontal: 24,
// // //     borderRadius: 8,
// // //   },
// // //   payButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
// // // });

// // // screens/PaymentScreenInner.js

// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   View,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   Text,
// // // } from "react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import { useStripe } from "@stripe/stripe-react-native";
// // // import * as Linking from "expo-linking";
// // // import api from "../api/client";
// // // import LoadingScreen from "./LoadingScreen";
// // // import CustomerJobStatus from "./CustomerJobStatus";

// // // const FEE_RATE = 0.07; // 7%

// // // export default function PaymentScreenInner() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);
// // //   const [onlyAdditional, setOnlyAdditional] = useState(false);

// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         // 1) fetch the job
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);

// // //         // are we only charging the provider's extra add-on?
// // //         const isAddOn = job.status === "awaiting-additional-payment";
// // //         setOnlyAdditional(isAddOn);

// // //         // 2) pick the right amount (in cents)
// // //         let amountCents = 0;
// // //         if (isAddOn) {
// // //           const add = job.additionalCharge || 0;
// // //           const conv = Number((add * FEE_RATE).toFixed(2));
// // //           amountCents = Math.round((add + conv) * 100);
// // //         } else {
// // //           const { baseAmount = 0, adjustmentAmount = 0, rushFee = 0 } = job;
// // //           const subtotal = baseAmount + adjustmentAmount + rushFee;
// // //           const conv = Number((subtotal * FEE_RATE).toFixed(2));
// // //           amountCents = Math.round((subtotal + conv) * 100);
// // //         }

// // //         // 3) get PaymentSheet params
// // //         const { data: sheetParams } = await api.post(
// // //           "/payments/payment-sheet",
// // //           {
// // //             amount: amountCents,
// // //             currency: "usd",
// // //           }
// // //         );

// // //         // 4) init stripe sheet
// // //         const returnURL = Linking.createURL("/");
// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: sheetParams.customer,
// // //           customerEphemeralKeySecret: sheetParams.ephemeralKey,
// // //           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //           returnURL,
// // //         });
// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert("Error", "Unable to initialize payment. Please try again.");
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   // show your booking animation then back to CustomerJobStatus
// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() =>
// // //           navigation.navigate("CustomerJobStatus", { jobId })
// // //         }
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <View style={styles.container}>
// // //       {loadingSheet ? (
// // //         <ActivityIndicator size="large" />
// // //       ) : (
// // //         <TouchableOpacity
// // //           style={styles.payButton}
// // //           onPress={async () => {
// // //             const { error } = await presentPaymentSheet();
// // //             if (error) {
// // //               console.error("❌ presentPaymentSheet error:", error);
// // //               Alert.alert("Payment failed", error.message);
// // //               return;
// // //             }

// // //             // 5) tell your backend we succeeded
// // //             try {
// // //               const endpoint = onlyAdditional
// // //                 ? `/jobs/${jobId}/complete-additional`
// // //                 : `/jobs/complete-payment/${jobId}`;
// // //               await api.put(endpoint);
// // //             } catch (e) {
// // //               console.error("Complete‐payment error:", e);
// // //             }

// // //             // 6) show animation → back to customer status
// // //             setShowAnimation(true);
// // //           }}
// // //         >
// // //           <Text style={styles.payButtonText}>
// // //             {onlyAdditional ? "Pay Additional & Book" : "Pay & Book"}
// // //           </Text>
// // //         </TouchableOpacity>
// // //       )}
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, justifyContent: "center", alignItems: "center", },
// // //   payButton: {
// // //     backgroundColor: "#1976d2",
// // //     paddingVertical: 14,
// // //     paddingHorizontal: 24,
// // //     borderRadius: 8,
// // //   },
// // //   payButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
// // // });

// // // screens/PaymentScreenInner.js
// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   View,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   Text,
// // // } from "react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import { useStripe } from "@stripe/stripe-react-native";
// // // import * as Linking from "expo-linking";
// // // import api from "../api/client";
// // // import LoadingScreen from "./LoadingScreen";

// // // const FEE_RATE = 0.07; // 7%

// // // export default function PaymentScreenInner() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);
// // //   const [onlyAdditional, setOnlyAdditional] = useState(false);

// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         // 1) fetch the job
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);
// // //         // 2) detect which flow we’re in
// // //         const isAddOn = job.status === "awaiting-additional-payment";
// // //         setOnlyAdditional(isAddOn);

// // //         // 3) compute amount in cents
// // //         let amountCents = 0;
// // //         if (isAddOn) {
// // //           const add = job.additionalCharge || 0;
// // //           const conv = Number((add * FEE_RATE).toFixed(2));
// // //           amountCents = Math.round((add + conv) * 100);
// // //         } else {
// // //           const { baseAmount = 0, adjustmentAmount = 0, rushFee = 0 } = job;
// // //           const subtotal = baseAmount + adjustmentAmount + rushFee;
// // //           const conv = Number((subtotal * FEE_RATE).toFixed(2));
// // //           amountCents = Math.round((subtotal + conv) * 100);
// // //         }

// // //         // 4) get sheet params
// // //         const { data: sheetParams } = await api.post(
// // //           "/payments/payment-sheet",
// // //           {
// // //             amount: amountCents,
// // //             currency: "usd",
// // //           }
// // //         );

// // //         // 5) initialize
// // //         const returnURL = Linking.createURL("/");
// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: sheetParams.customer,
// // //           customerEphemeralKeySecret: sheetParams.ephemeralKey,
// // //           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //           returnURL,
// // //         });
// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert("Error", "Unable to initialize payment. Please try again.");
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   //  ➤ Show your animation and then go to CustomerJobStatus
// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() =>
// // //           navigation.replace("CustomerJobStatus", { jobId })
// // //         }
// // //       />
// // //     );
// // //   }

// // //   //  ➤ Otherwise show spinner or the Pay button
// // //   return (
// // //     <View style={styles.container}>
// // //       {loadingSheet ? (
// // //         <ActivityIndicator size="large" />
// // //       ) : (
// // //         <TouchableOpacity
// // //           style={styles.payButton}
// // //           onPress={async () => {
// // //             const { error } = await presentPaymentSheet();
// // //             if (error) {
// // //               console.error("❌ presentPaymentSheet error:", error);
// // //               Alert.alert("Payment failed", error.message);
// // //               return;
// // //             }

// // //             // 6) Notify your backend
// // //             try {
// // //               const endpoint = onlyAdditional
// // //                 ? `/jobs/${jobId}/complete-additional`
// // //                 : `/jobs/complete-payment/${jobId}`;
// // //               await api.put(endpoint);
// // //             } catch (e) {
// // //               console.error("Complete‐payment error:", e);
// // //             }

// // //             // 7) show animation → back to CustomerJobStatus
// // //             setShowAnimation(true);
// // //           }}
// // //         >
// // //           <Text style={styles.payButtonText}>
// // //             {onlyAdditional ? "Pay Additional & Book" : "Pay & Book"}
// // //           </Text>
// // //         </TouchableOpacity>
// // //       )}
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     justifyContent: "center",
// // //     alignItems: "center",
// // //   },
// // //   payButton: {
// // //     backgroundColor: "#1976d2",
// // //     paddingVertical: 14,
// // //     paddingHorizontal: 24,
// // //     borderRadius: 8,
// // //   },
// // //   payButtonText: {
// // //     color: "#fff",
// // //     fontSize: 16,
// // //     fontWeight: "bold",
// // //   },
// // // });

// // // screens/PaymentScreen.js

// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   View,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   Text,
// // // } from "react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import { useStripe } from "@stripe/stripe-react-native";
// // // import * as Linking from "expo-linking";
// // // import api from "../api/client";
// // // import LoadingScreen from "./LoadingScreen";

// // // const FEE_RATE = 0.07; // 7%

// // // export default function PaymentScreenInner() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);
// // //   const [onlyAdditional, setOnlyAdditional] = useState(false);

// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);
// // //         const isAddOn = job.status === "awaiting-additional-payment";
// // //         setOnlyAdditional(isAddOn);

// // //         let amount = 0;
// // //         if (isAddOn) {
// // //           const add = job.additionalCharge || 0;
// // //           const conv = Number((add * FEE_RATE).toFixed(2));
// // //           amount = Math.round((add + conv) * 100);
// // //         } else {
// // //           const { baseAmount = 0, adjustmentAmount = 0, rushFee = 0 } = job;
// // //           const sub = baseAmount + adjustmentAmount + rushFee;
// // //           const conv = Number((sub * FEE_RATE).toFixed(2));
// // //           amount = Math.round((sub + conv) * 100);
// // //         }

// // //         const { data: sheetParams } = await api.post(
// // //           "/payments/payment-sheet",
// // //           { amount, currency: "usd" }
// // //         );

// // //         const returnURL = Linking.createURL("/");
// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: sheetParams.customer,
// // //           customerEphemeralKeySecret: sheetParams.ephemeralKey,
// // //           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //           returnURL,
// // //         });
// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert(
// // //           "Error",
// // //           "Unable to initialize payment. Please try again."
// // //         );
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() =>
// // //           navigation.replace("CustomerJobStatus", { jobId })
// // //         }
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <View style={styles.container}>
// // //       {loadingSheet ? (
// // //         <ActivityIndicator size="large" />
// // //       ) : (
// // //         <TouchableOpacity
// // //           style={styles.payButton}
// // //           onPress={async () => {
// // //             const { error } = await presentPaymentSheet();
// // //             if (error) {
// // //               console.error("❌ presentPaymentSheet error:", error);
// // //               Alert.alert("Payment failed", error.message);
// // //               return;
// // //             }

// // //             // tell your backend the payment succeeded
// // //             try {
// // //               const endpoint = onlyAdditional
// // //                 ? `/jobs/${jobId}/complete-additional`
// // //                 : `/jobs/complete-payment/${jobId}`;
// // //               await api.put(endpoint);
// // //             } catch (e) {
// // //               console.error("Complete‐payment error:", e);
// // //             }

// // //             // show the "booking" animation, then go back
// // //             setShowAnimation(true);
// // //           }}
// // //         >
// // //           <Text style={styles.payButtonText}>
// // //             {onlyAdditional ? "Pay Additional & Book" : "Pay & Book"}
// // //           </Text>
// // //         </TouchableOpacity>
// // //       )}
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// // //   payButton: {
// // //     backgroundColor: "#1976d2",
// // //     paddingVertical: 14,
// // //     paddingHorizontal: 24,
// // //     borderRadius: 8,
// // //   },
// // //   payButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
// // // });

// // // screens/PaymentScreen.js

// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   View,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   Text,
// // // } from "react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// // // import * as Linking from "expo-linking";
// // // import Constants from "expo-constants";
// // // import api from "../api/client";
// // // import LoadingScreen from "./LoadingScreen";

// // // const FEE_RATE = 0.07; // 7%

// // // export default function PaymentScreen() {
// // //   const { publishableKey } = Constants.expoConfig.extra;
// // //   return (
// // //     <StripeProvider publishableKey={publishableKey}>
// // //       <InnerPayment />
// // //     </StripeProvider>
// // //   );
// // // }

// // // function InnerPayment() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);
// // //   const [onlyAdditional, setOnlyAdditional] = useState(false);

// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         // 1) fetch job
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);

// // //         // 2) determine if it's just extra charge
// // //         const isAddOn = job.status === "awaiting-additional-payment";
// // //         setOnlyAdditional(isAddOn);

// // //         // 3) compute amount + 7% fee
// // //         let subtotal = isAddOn
// // //           ? (job.additionalCharge || 0)
// // //           : (job.baseAmount || 0) + (job.adjustmentAmount || 0) + (job.rushFee || 0);

// // //         const conv = Number((subtotal * FEE_RATE).toFixed(2));
// // //         const total = subtotal + conv;
// // //         const amount = Math.round(total * 100);

// // //         // 4) get PaymentSheet params
// // //         const { data: sheetParams } = await api.post("/payments/payment-sheet", {
// // //           amount,
// // //           currency: "usd",
// // //         });

// // //         // 5) init
// // //         const returnURL = Linking.createURL("/");
// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: sheetParams.customer,
// // //           customerEphemeralKeySecret: sheetParams.ephemeralKey,
// // //           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //           returnURL,
// // //         });
// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert("Error", "Unable to initialize payment. Please try again.");
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   // 6) show animation on success
// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() =>
// // //           navigation.replace("CustomerJobStatus", { jobId })
// // //         }
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <View style={styles.container}>
// // //       {loadingSheet ? (
// // //         <ActivityIndicator size="large" />
// // //       ) : (
// // //         <TouchableOpacity
// // //           style={styles.payButton}
// // //           onPress={async () => {
// // //             const { error } = await presentPaymentSheet();
// // //             if (error) {
// // //               console.error("❌ presentPaymentSheet error:", error);
// // //               Alert.alert("Payment failed", error.message);
// // //               return;
// // //             }

// // //             // 7) Tell backend to record the payment & advance status
// // //             try {
// // //               const endpoint = onlyAdditional
// // //                 ? `/jobs/complete-additional/${jobId}`
// // //                 : `/jobs/complete-payment/${jobId}`;
// // //               await api.put(endpoint);
// // //             } catch (e) {
// // //               console.error("Complete-payment error:", e);
// // //             }

// // //             // 8) fire animation → then nav
// // //             setShowAnimation(true);
// // //           }}
// // //         >
// // //           <Text style={styles.payButtonText}>
// // //             {onlyAdditional ? "Pay Additional & Book" : "Pay & Book"}
// // //           </Text>
// // //         </TouchableOpacity>
// // //       )}
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// // //   payButton: {
// // //     backgroundColor: "#1976d2",
// // //     paddingVertical: 14,
// // //     paddingHorizontal: 24,
// // //     borderRadius: 8,
// // //   },
// // //   payButtonText: {
// // //     color: "#fff",
// // //     fontSize: 16,
// // //     fontWeight: "bold",
// // //   },
// // // });

// // // screens/PaymentScreen.js
// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   View,
// // //   Button,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // // } from "react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// // // import api from "../api/client";
// // // import Constants from "expo-constants";
// // // import LoadingScreen from "./LoadingScreen";

// // // const FEE_RATE = 0.07; // 7%

// // // export default function PaymentScreen() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);

// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         // 1) fetch the job, now including any additionalCharge
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);
// // //         const {
// // //           baseAmount = 0,
// // //           adjustmentAmount = 0,
// // //           rushFee = 0,
// // //           additionalCharge = 0,
// // //         } = job;

// // //         // 2) compute subtotal + extra + conv fee
// // //         const subtotal =
// // //           baseAmount + adjustmentAmount + rushFee + additionalCharge;
// // //         const convFee = Number((subtotal * FEE_RATE).toFixed(2));
// // //         const total = subtotal + convFee;
// // //         const amount = Math.round(total * 100); // in cents

// // //         // 3) get PaymentSheet params
// // //         const { data } = await api.post("/payments/payment-sheet", {
// // //           amount,
// // //           currency: "usd",
// // //         });

// // //         // 4) init
// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: data.customer,
// // //           customerEphemeralKeySecret: data.ephemeralKey,
// // //           paymentIntentClientSecret: data.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //         });
// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert(
// // //           "Error",
// // //           "Unable to initialize payment. Please try again."
// // //         );
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   // once payment (initial or additional) succeeds…
// // //   const handlePay = async () => {
// // //     const { error } = await presentPaymentSheet();
// // //     if (error) {
// // //       console.error("❌ presentPaymentSheet error:", error);
// // //       Alert.alert("Payment failed", error.message);
// // //       return;
// // //     }
// // //     // mark job paid (initial or additional) on your backend
// // //     try {
// // //       await api.put(`/jobs/complete-payment/${jobId}`);
// // //     } catch (e) {
// // //       console.error("Failed to complete-payment:", e);
// // //     }
// // //     // show success animation then nav
// // //     setShowAnimation(true);
// // //   };

// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() => {
// // //           navigation.replace("CustomerJobStatus", { jobId });
// // //         }}
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
// // //       <View style={styles.container}>
// // //         {loadingSheet ? (
// // //           <ActivityIndicator size="large" />
// // //         ) : (
// // //           <Button title="Pay & Book" onPress={handlePay} />
// // //         )}
// // //       </View>
// // //     </StripeProvider>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// // // });

// // // screens/PaymentScreen.js
// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   View,
// // //   TouchableOpacity,
// // //   Text,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // //   Dimensions,
// // // } from "react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// // // import api from "../api/client";
// // // import Constants from "expo-constants";
// // // import LoadingScreen from "./LoadingScreen";

// // // const FEE_RATE = 0.07; // 7%
// // // const { width } = Dimensions.get("window");

// // // export default function PaymentScreen() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);
// // //   const [isAdditional, setIsAdditional] = useState(false);

// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         // grab the job, see if we're only paying extra
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);
// // //         const {
// // //           baseAmount = 0,
// // //           adjustmentAmount = 0,
// // //           rushFee = 0,
// // //           additionalCharge = 0,
// // //           status,
// // //         } = job;

// // //         // compute once from the fetched status
// // //         const addOnly = status === "awaiting-additional-payment";
// // //         setIsAdditional(addOnly);

// // //         // now use that local flag, not stale state
// // //         const subtotal = addOnly
// // //           ? additionalCharge
// // //           : baseAmount + adjustmentAmount + rushFee + additionalCharge;
// // //         // const {
// // //         //   baseAmount = 0,
// // //         //   adjustmentAmount = 0,
// // //         //   rushFee = 0,
// // //         //   additionalCharge = 0,
// // //         //   status,
// // //         // } = job;

// // //         // setIsAdditional(status === "awaiting-additional-payment");

// // //         // // if it's an extra, we charge only that + 7%
// // //         // const subtotal = isAdditional
// // //         //   ? additionalCharge
// // //         //   : baseAmount + adjustmentAmount + rushFee + additionalCharge;

// // //         const convFee = Number((subtotal * FEE_RATE).toFixed(2));
// // //         const total = subtotal + convFee;
// // //         const amount = Math.round(total * 100);

// // //         const { data } = await api.post("/payments/payment-sheet", {
// // //           amount,
// // //           currency: "usd",
// // //         });

// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: data.customer,
// // //           customerEphemeralKeySecret: data.ephemeralKey,
// // //           paymentIntentClientSecret: data.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //         });
// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert("Error", "Unable to initialize payment. Please try again.");
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   const handlePay = async () => {
// // //     const { error } = await presentPaymentSheet();
// // //     if (error) {
// // //       console.error("❌ presentPaymentSheet error:", error);
// // //       return Alert.alert("Payment failed", error.message);
// // //     }

// // //     // mark paid on backend
// // //     try {
// // //       await api.put(`/jobs/complete-payment/${jobId}`);
// // //     } catch (e) {
// // //       console.error("Failed to complete-payment:", e);
// // //       // fall through anyway
// // //     }

// // //     if (isAdditional) {
// // //       // just go back to the provider status screen
// // //       navigation.replace("ProviderJobStatus", { jobId });
// // //     } else {
// // //       // initial flow: show success animation then to customer status
// // //       setShowAnimation(true);
// // //     }
// // //   };

// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() => {
// // //           navigation.replace("CustomerJobStatus", { jobId });
// // //         }}
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
// // //       <View style={styles.container}>
// // //         {loadingSheet ? (
// // //           <ActivityIndicator size="large" />
// // //         ) : (
// // //           <TouchableOpacity
// // //             style={styles.payButton}
// // //             onPress={handlePay}
// // //             activeOpacity={0.8}
// // //           >
// // //             <Text style={styles.payButtonText}>
// // //               {isAdditional ? "Pay Additional Charge" : "Pay & Book"}
// // //             </Text>
// // //           </TouchableOpacity>
// // //         )}
// // //       </View>
// // //     </StripeProvider>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// // //   payButton: {
// // //     width: width * 0.9,
// // //     paddingVertical: 16,
// // //     backgroundColor: "#1976d2",
// // //     borderRadius: 8,
// // //     alignItems: "center",
// // //   },
// // //   payButtonText: {
// // //     color: "#fff",
// // //     fontSize: 18,
// // //     fontWeight: "bold",
// // //   },
// // // });

// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   View,
// // //   TouchableOpacity,
// // //   Text,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // //   Dimensions,
// // // } from "react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// // // import api from "../api/client";
// // // import Constants from "expo-constants";
// // // import LoadingScreen from "./LoadingScreen";
// // // import * as Linking from "expo-linking";

// // // const FEE_RATE = 0.07; // 7%
// // // const { width } = Dimensions.get("window");

// // // export default function PaymentScreen() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);
// // //   const [isAdditional, setIsAdditional] = useState(false);

// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         // ✅ fetch job with a proper string path
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);
// // //         const {
// // //           baseAmount = 0,
// // //           adjustmentAmount = 0,
// // //           rushFee = 0,
// // //           additionalCharge = 0,
// // //           status,
// // //         } = job;

// // //         setIsAdditional(status === "awaiting-additional-payment");

// // //         // if it's an extra, we charge only that + 7%
// // //         const subtotal = status === "awaiting-additional-payment"
// // //           ? additionalCharge
// // //           : baseAmount + adjustmentAmount + rushFee + additionalCharge;

// // //         const convFee = Number((subtotal * FEE_RATE).toFixed(2));
// // //         const total = subtotal + convFee;
// // //         const amount = Math.round(total * 100);

// // //         const { data } = await api.post("/payments/payment-sheet", {
// // //           amount,
// // //           currency: "usd",
// // //         });

// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: data.customer,
// // //           customerEphemeralKeySecret: data.ephemeralKey,
// // //           paymentIntentClientSecret: data.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //           returnURL: Linking.createURL("stripe-redirect"),
// // //         });
// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert("Error", "Unable to initialize payment. Please try again.");
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   const handlePay = async () => {
// // //     const { error } = await presentPaymentSheet();
// // //     if (error) {
// // //       console.error("❌ presentPaymentSheet error:", error);
// // //       return Alert.alert("Payment failed", error.message);
// // //     }

// // //     // ✅ mark paid on backend with a proper string path
// // //     try {
// // //       await api.put(`/jobs/complete-payment/${jobId}`);
// // //     } catch (e) {
// // //       console.error("Failed to complete-payment:", e);
// // //     }

// // //     if (isAdditional) {
// // //       navigation.replace("CustomerJobStatus", { jobId });
// // //     } else {
// // //       setShowAnimation(true);
// // //     }
// // //   };

// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() =>
// // //           navigation.replace("CustomerJobStatus", { jobId })
// // //         }
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
// // //       <View style={styles.container}>
// // //         {loadingSheet ? (
// // //           <ActivityIndicator size="large" />
// // //         ) : (
// // //           <TouchableOpacity
// // //             style={styles.payButton}
// // //             onPress={handlePay}
// // //             activeOpacity={0.8}
// // //           >
// // //             <Text style={styles.payButtonText}>
// // //               {isAdditional ? "Pay Additional Charge" : "Pay & Book"}
// // //             </Text>
// // //           </TouchableOpacity>
// // //         )}
// // //       </View>
// // //     </StripeProvider>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// // //   payButton: {
// // //     width: width * 0.9,
// // //     paddingVertical: 16,
// // //     backgroundColor: "#1976d2",
// // //     borderRadius: 8,
// // //     alignItems: "center",
// // //   },
// // //   payButtonText: {
// // //     color: "#fff",
// // //     fontSize: 18,
// // //     fontWeight: "bold",
// // //   },
// // // });

// // // import React, { useEffect, useState } from "react";
// // // import {
// // //   View,
// // //   Button,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // // } from "react-native";
// // // import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import api from "../api/client";
// // // import Constants from "expo-constants";
// // // import LoadingScreen from "./LoadingScreen";

// // // export default function PaymentScreen() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);

// // //   // 1) initialize with the up-to-date estimatedTotal from backend
// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         // pull the full job, which now includes additionalCharge & convenienceFee
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);
// // //         const amountInCents = Math.round((job.estimatedTotal || 0) * 100);

// // //         // server-side: create PaymentIntent / ephemeral key
// // //         const { data: sheetParams } = await api.post("/payments/payment-sheet", {
// // //           amount: amountInCents,
// // //           currency: "usd",
// // //         });

// // //         // initialize
// // //         const { error: initErr } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: sheetParams.customer,
// // //           customerEphemeralKeySecret: sheetParams.ephemeralKey,
// // //           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //         });
// // //         if (initErr) throw initErr;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert("Error", "Unable to initialize payment. Please try again.");
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() =>
// // //           navigation.replace("CustomerJobStatus", { jobId })
// // //         }
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
// // //       <View style={styles.container}>
// // //         {loadingSheet ? (
// // //           <ActivityIndicator size="large" />
// // //         ) : (
// // //           <Button
// // //             title="Pay & Book"
// // //             onPress={async () => {
// // //               const { error } = await presentPaymentSheet();
// // //               if (error) {
// // //                 console.error("❌ presentPaymentSheet error:", error);
// // //                 Alert.alert("Payment failed", error.message);
// // //               } else {
// // //                 // mark paid & kick off invites
// // //                 api.put(`/jobs/complete-payment/${jobId}`).catch(console.error);
// // //                 // show “success” animation then nav back
// // //                 setShowAnimation(true);
// // //               }
// // //             }}
// // //           />
// // //         )}
// // //       </View>
// // //     </StripeProvider>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// // // });

// // // screens/PaymentScreen.js

// // // import React, { useEffect, useState } from "react";
// // // import {
// // //   View,
// // //   Button,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // // } from "react-native";
// // // import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import api from "../api/client";
// // // import Constants from "expo-constants";
// // // import LoadingScreen from "./LoadingScreen";

// // // export default function PaymentScreen() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);

// // //   // 1) Initialize PaymentSheet with backend's estimatedTotal
// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         // fetch the complete job (now includes additionalCharge & convenienceFee)
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);
// // //         const amountInCents = Math.round((job.estimatedTotal || 0) * 100);

// // //         // get Stripe PaymentSheet params from your backend
// // //         const { data: sheetParams } = await api.post(
// // //           "/payments/payment-sheet",
// // //           { amount: amountInCents, currency: "usd" }
// // //         );

// // //         // initialize the sheet
// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: sheetParams.customer,
// // //           customerEphemeralKeySecret: sheetParams.ephemeralKey,
// // //           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //         });
// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert(
// // //           "Error",
// // //           "Unable to initialize payment. Please try again."
// // //         );
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   // 2) After completing payment → show animation → navigate to customer status
// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() =>
// // //           navigation.replace("CustomerJobStatus", { jobId })
// // //         }
// // //       />
// // //     );
// // //   }

// // //   // 3) Render spinner or Pay button
// // //   return (
// // //     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
// // //       <View style={styles.container}>
// // //         {loadingSheet ? (
// // //           <ActivityIndicator size="large" />
// // //         ) : (
// // //           <Button
// // //             title="Pay & Book"
// // //             onPress={async () => {
// // //               const { error } = await presentPaymentSheet();
// // //               if (error) {
// // //                 console.error("❌ presentPaymentSheet error:", error);
// // //                 Alert.alert("Payment failed", error.message);
// // //               } else {
// // //                 // mark the job paid on your backend (this will also fire invites)
// // //                 api.put(`/jobs/complete-payment/${jobId}`).catch(console.error);

// // //                 // show success animation, then nav
// // //                 setShowAnimation(true);
// // //               }
// // //             }}
// // //           />
// // //         )}
// // //       </View>
// // //     </StripeProvider>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// // // });

// // // screens/PaymentScreen.js
// // // import React, { useEffect, useState } from "react";
// // // import {
// // //   View,
// // //   Button,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // // } from "react-native";
// // // import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import api from "../api/client";
// // // import Constants from "expo-constants";
// // // import LoadingScreen from "./LoadingScreen";

// // // const FEE_RATE = 0.07; // 7%

// // // export default function PaymentScreen() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);

// // //   // Initialize PaymentSheet with the job's estimatedTotal (which now
// // //   // already includes baseAmount + adjustments + rush + extraCharge + convFee)
// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         // 1) Fetch full job including any extraCharge & convenienceFee
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);
// // //         const totalDollars = job.estimatedTotal || 0;
// // //         const amountInCents = Math.round(totalDollars * 100);

// // //         // 2) Ask our backend to create PaymentIntent + ephemeralKey
// // //         const { data: sheetParams } = await api.post(
// // //           "/payments/payment-sheet",
// // //           { amount: amountInCents, currency: "usd" }
// // //         );

// // //         // 3) Initialize Stripe PaymentSheet
// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: sheetParams.customer,
// // //           customerEphemeralKeySecret: sheetParams.ephemeralKey,
// // //           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //         });
// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert(
// // //           "Error",
// // //           "Unable to initialize payment. Please try again."
// // //         );
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   // After a successful payment, play the animation then go to status screen
// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() =>
// // //           navigation.replace("CustomerJobStatus", { jobId })
// // //         }
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
// // //       <View style={styles.container}>
// // //         {loadingSheet ? (
// // //           <ActivityIndicator size="large" />
// // //         ) : (
// // //           <Button
// // //             title="Pay & Book"
// // //             onPress={async () => {
// // //               const { error } = await presentPaymentSheet();
// // //               if (error) {
// // //                 console.error("❌ presentPaymentSheet error:", error);
// // //                 Alert.alert("Payment failed", error.message);
// // //               } else {
// // //                 // 1) Mark job paid & trigger invites on our backend
// // //                 api.put(`/jobs/complete-payment/${jobId}`).catch(console.error);
// // //                 // 2) Play the success animation, then jump to status
// // //                 setShowAnimation(true);
// // //               }
// // //             }}
// // //           />
// // //         )}
// // //       </View>
// // //     </StripeProvider>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// // // });

// // // screens/PaymentScreen.js

// // // import React, { useEffect, useState } from "react";
// // // import {
// // //   View,
// // //   Button,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // // } from "react-native";
// // // import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import api from "../api/client";
// // // import Constants from "expo-constants";
// // // import LoadingScreen from "./LoadingScreen";

// // // export default function PaymentScreen() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);

// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         // 1) Grab the job with its server-computed estimatedTotal (inc. any extraCharge + convenienceFee)
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);

// // //         // 2) Convert to cents for Stripe
// // //         const amountInCents = Math.round((job.estimatedTotal || 0) * 100);

// // //         // 3) Ask your backend for the PaymentSheet params
// // //         const { data: sheetParams } = await api.post(
// // //           "/payments/payment-sheet",
// // //           { amount: amountInCents, currency: "usd" }
// // //         );

// // //         // 4) Initialize the native PaymentSheet
// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: sheetParams.customer,
// // //           customerEphemeralKeySecret: sheetParams.ephemeralKey,
// // //           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //         });
// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert(
// // //           "Error",
// // //           "Unable to initialize payment – please try again."
// // //         );
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   // while our success animation is running
// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() =>
// // //           navigation.replace("CustomerJobStatus", { jobId })
// // //         }
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
// // //       <View style={styles.container}>
// // //         {loadingSheet ? (
// // //           <ActivityIndicator size="large" />
// // //         ) : (
// // //           <Button
// // //             title="Pay & Book"
// // //             onPress={async () => {
// // //               const { error } = await presentPaymentSheet();
// // //               if (error) {
// // //                 console.error("❌ presentPaymentSheet error:", error);
// // //                 Alert.alert("Payment failed", error.message);
// // //               } else {
// // //                 // 1) Tell your backend the payment succeeded
// // //                 api.put(`/jobs/complete-payment/${jobId}`).catch(console.error);
// // //                 // 2) Show the success animation and then go to the status screen
// // //                 setShowAnimation(true);
// // //               }
// // //             }}
// // //           />
// // //         )}
// // //       </View>
// // //     </StripeProvider>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// // // });

// // // screens/PaymentScreen.js

// // // import React, { useEffect, useState } from "react";
// // // import {
// // //   View,
// // //   TouchableOpacity,
// // //   Button,
// // //   Text,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // // } from "react-native";
// // // import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import api from "../api/client";
// // // import Constants from "expo-constants";
// // // import LoadingScreen from "./LoadingScreen";
// // // import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";

// // // export default function PaymentScreen() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);
// // //   const [job, setJob] = useState(null);

// // //   const details = job?.details ?? {};

// // //   // pull description from util map
// // //   const issueKey = details.issue;
// // //   const description = issueKey ? getCoveredDescription(issueKey) : null;

// // //   let entries = [];
// // //   if (typeof details === "object") {
// // //     entries = Object.entries(details);
// // //   }

// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         // 1) Grab the job with its server-computed estimatedTotal (inc. any extraCharge + convenienceFee)
// // //         const { data: job } = await api.get(`/jobs/${jobId}`);
// // //         setJob(job);
// // //         // 2) Convert to cents for Stripe
// // //         const amountInCents = Math.round((job.estimatedTotal || 0) * 100);

// // //         // 3) Ask your backend for the PaymentSheet params
// // //         const { data: sheetParams } = await api.post(
// // //           "/payments/payment-sheet",
// // //           { amount: amountInCents, currency: "usd" }
// // //         );

// // //         // 4) Initialize the native PaymentSheet
// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: sheetParams.customer,
// // //           customerEphemeralKeySecret: sheetParams.ephemeralKey,
// // //           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //         });
// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert(
// // //           "Error",
// // //           "Unable to initialize payment – please try again."
// // //         );
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   // while our success animation is running
// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() =>
// // //           navigation.replace("CustomerJobStatus", { jobId })
// // //         }
// // //       />
// // //     );
// // //   }

// // //   return (
// // //     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
// // //       <View style={styles.container}>

// // //         {job && (
// // //           <View style={styles.summaryCard}>
// // //             <Text style={styles.summaryTitle}>Estimate Details</Text>
// // //             {/* <Text>Base price:   ${job.baseAmount.toFixed(2)}</Text>
// // //            <Text>Adjustments:  ${job.adjustmentAmount.toFixed(2)}</Text>
// // //            <Text>Rush fee:     ${job.rushFee.toFixed(2)}</Text> */}
// // //             {job.additionalCharge > 0 && (
// // //               <Text>Extra charge: ${job.additionalCharge.toFixed(2)}</Text>
// // //             )}
// // //             <Text>{/* Convenience:  ${job.convenienceFee.toFixed(2)} */}</Text>
// // //             <Text style={styles.totalLine}>
// // //               Total:{"\n"} ${job.estimatedTotal.toFixed(2)}
// // //             </Text>
// // //             <Text style={styles.sectionTitle}>What’s Covered:</Text>
// // //             <Text style={styles.descriptionText}>{description}</Text>
// // //           </View>
// // //         )}

// // //         {job.additionalCharge > 0 && (
// // //           <View style={styles.section}>
// // //             <Text style={styles.label}>Extra Charge Details</Text>
// // //             <Text style={{ fontWeight: "600" }}>
// // //               Amount: ${job.additionalCharge.toFixed(2)}
// // //             </Text>
// // //             {job.additionalChargeReason && (
// // //               <Text>Reason: {job.additionalChargeReason}</Text>
// // //             )}
// // //           </View>
// // //         )}
// // //         {loadingSheet ? (
// // //           <ActivityIndicator size="large" />
// // //         ) : (
// // //           <TouchableOpacity
// // //             style={styles.payButton}
// // //             onPress={async () => {
// // //               const { error } = await presentPaymentSheet();
// // //               if (error) {
// // //                 console.error("❌ presentPaymentSheet error:", error);
// // //                 Alert.alert("Payment failed", error.message);
// // //               } else {
// // //                 api.put(`/jobs/complete-payment/${jobId}`).catch(console.error);
// // //                 setShowAnimation(true);
// // //               }
// // //             }}
// // //           >
// // //             <Text style={styles.payButtonText}>Pay & Book</Text>
// // //           </TouchableOpacity>
// // //           // <Button
// // //           //   title="Pay & Book"
// // //           //   onPress={async () => {
// // //           //     const { error } = await presentPaymentSheet();
// // //           //     if (error) {
// // //           //       console.error("❌ presentPaymentSheet error:", error);
// // //           //       Alert.alert("Payment failed", error.message);
// // //           //     } else {
// // //           //       // 1) Tell your backend the payment succeeded
// // //           //       api.put(`/jobs/complete-payment/${jobId}`).catch(console.error);
// // //           //       // 2) Show the success animation and then go to the status screen
// // //           //       setShowAnimation(true);
// // //           //     }
// // //           //   }}
// // //           // />
// // //         )}
// // //       </View>
// // //     </StripeProvider>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// // //   payButton: {
// // //     backgroundColor: "#1976d2",
// // //     paddingVertical: 14,
// // //     paddingHorizontal: 24,
// // //     borderRadius: 8,
// // //   },
// // //   payButtonText: {
// // //     color: "#fff",
// // //     fontWeight: "bold",
// // //     fontSize: 16,
// // //   },

// // //   summaryCard: {
// // //     width: "90%",
// // //     backgroundColor: "#fff",
// // //     padding: 16,
// // //     borderRadius: 10,
// // //     shadowColor: "#000",
// // //     shadowOpacity: 0.1,
// // //     shadowOffset: { width: 0, height: 2 },
// // //     shadowRadius: 4,
// // //     marginBottom: 24,
// // //   },
// // //   summaryTitle: {
// // //     fontSize: 28,
// // //     fontWeight: "700",
// // //     marginBottom: 8,
// // //     textAlign: "center",
// // //   },
// // //   totalLine: {
// // //     marginTop: 8,
// // //     fontSize: 26,
// // //     fontWeight: "700",
// // //     textAlign: "center",
// // //   },
// // //   sectionTitle: {
// // //     fontWeight: "bold",
// // //     marginTop: 20,
// // //     fontSize: 18,
// // //     textAlign: "center",
// // //   },
// // //   descriptionText: {
// // //     color: "red",
// // //     fontSize: 18,
// // //     textAlign: "center",
// // //   },
// // // });

// // // import React, { useEffect, useState } from "react";
// // // import {
// // //   View,
// // //   TouchableOpacity,
// // //   Text,
// // //   ActivityIndicator,
// // //   Alert,
// // //   StyleSheet,
// // // } from "react-native";
// // // import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// // // import { useNavigation, useRoute } from "@react-navigation/native";
// // // import api from "../api/client";
// // // import Constants from "expo-constants";
// // // import LoadingScreen from "./LoadingScreen";
// // // import { getCoveredDescription } from "../utils/serviceMatrix";

// // // const FEE_RATE = 0.07;

// // // export default function PaymentScreen() {
// // //   const navigation = useNavigation();
// // //   const { jobId } = useRoute().params;
// // //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// // //   const [loadingSheet, setLoadingSheet] = useState(false);
// // //   const [showAnimation, setShowAnimation] = useState(false);
// // //   const [job, setJob] = useState(null);

// // //   useEffect(() => {
// // //     (async () => {
// // //       setLoadingSheet(true);
// // //       try {
// // //         const { data: jobData } = await api.get(`/jobs/${jobId}`);
// // //         setJob(jobData);

// // //         const amountInCents = Math.round((jobData.estimatedTotal || 0) * 100);
// // //         const { data: sheetParams } = await api.post(
// // //           "/payments/payment-sheet",
// // //           {
// // //             amount: amountInCents,
// // //             currency: "usd",
// // //           }
// // //         );

// // //         const { error: initError } = await initPaymentSheet({
// // //           merchantDisplayName: "BlinqFix",
// // //           customerId: sheetParams.customer,
// // //           customerEphemeralKeySecret: sheetParams.ephemeralKey,
// // //           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
// // //           allowsDelayedPaymentMethods: true,
// // //         });

// // //         if (initError) throw initError;
// // //       } catch (err) {
// // //         console.error("❌ PaymentSheet init error:", err);
// // //         Alert.alert("Error", "Unable to initialize payment. Please try again.");
// // //       } finally {
// // //         setLoadingSheet(false);
// // //       }
// // //     })();
// // //   }, [jobId, initPaymentSheet]);

// // //   const handlePay = async () => {
// // //     const { error } = await presentPaymentSheet();
// // //     if (error) {
// // //       console.error("❌ presentPaymentSheet error:", error);
// // //       Alert.alert("Payment failed", error.message);
// // //       return;
// // //     }

// // //     try {
// // //       await api.put(`/jobs/complete-payment/${jobId}`);
// // //     } catch (err) {
// // //       console.error("Complete-payment error:", err);
// // //     }

// // //     setShowAnimation(true);
// // //   };

// // //   if (showAnimation) {
// // //     return (
// // //       <LoadingScreen
// // //         animationOnly
// // //         enterDuration={800}
// // //         holdDuration={400}
// // //         exitDuration={800}
// // //         onAnimationEnd={() =>
// // //           navigation.replace("CustomerJobStatus", { jobId })
// // //         }
// // //       />
// // //     );
// // //   }

// // //   const description = getCoveredDescription(job?.details?.issue);

// // //   return (
// // //     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
// // //       <View style={styles.container}>
// // //         {loadingSheet || !job ? (
// // //           <ActivityIndicator size="large" />
// // //         ) : (
// // //           <>
// // //             <View style={styles.summaryCard}>
// // //               <Text style={styles.summaryTitle}>Estimate Details</Text>
// // //               {job.additionalCharge > 0 && (
// // //                 <Text style={{textAlign: 'center'}}>Extra charge: ${job.additionalCharge.toFixed(2)}</Text>
// // //               )}
// // //               <Text style={styles.totalLine}>
// // //                 Total: ${job.estimatedTotal.toFixed(2)}
// // //               </Text>
// // //               <Text style={styles.sectionTitle}>What’s Covered:</Text>
// // //               <Text style={styles.descriptionText}>{description}</Text>
// // //             </View>

// // //             {job.additionalCharge > 0 && (
// // //               <View style={styles.additionalCard}>
// // //                 <Text style={styles.additionalCardTitle}>Additional Charge</Text>
// // //                 <Text style={styles.additionalCardText}>
// // //                   Amount: ${job.additionalCharge.toFixed(2)}
// // //                 </Text>
// // //                 {job.additionalChargeReason && (
// // //                   <Text style={styles.additionalCardText}>
// // //                     Description: {job.additionalChargeReason}
// // //                   </Text>
// // //                 )}
// // //               </View>
// // //             )}

// // //             {/* {job.additionalCharge > 0 && (
// // //               <View style={styles.section}>
// // //                 <Text style={styles.label}>Extra Charge Details</Text>
// // //                 <Text style={{ fontWeight: "600" }}>
// // //                   Amount: ${job.additionalCharge.toFixed(2)}
// // //                 </Text>
// // //                 {job.additionalChargeReason && (
// // //                   <Text>Reason: {job.additionalChargeReason}</Text>
// // //                 )}
// // //               </View>
// // //             )} */}

// // //             <TouchableOpacity style={styles.payButton} onPress={handlePay}>
// // //               <Text style={styles.payButtonText}>Pay & Book</Text>
// // //             </TouchableOpacity>
// // //           </>
// // //         )}
// // //       </View>
// // //     </StripeProvider>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// // //   payButton: {
// // //     backgroundColor: "#1976d2",
// // //     paddingVertical: 14,
// // //     paddingHorizontal: 24,
// // //     borderRadius: 8,
// // //     marginTop: 16,
// // //   },
// // //   payButtonText: {
// // //     color: "#fff",
// // //     fontWeight: "bold",
// // //     fontSize: 16,
// // //   },
// // //   summaryCard: {
// // //     width: "90%",
// // //     backgroundColor: "#fff",
// // //     padding: 16,
// // //     borderRadius: 10,
// // //     shadowColor: "#000",
// // //     shadowOpacity: 0.1,
// // //     shadowOffset: { width: 0, height: 2 },
// // //     shadowRadius: 4,
// // //     marginBottom: 24,
// // //   },
// // //   summaryTitle: {
// // //     fontSize: 24,
// // //     fontWeight: "700",
// // //     marginBottom: 8,
// // //     textAlign: "center",
// // //   },
// // //   totalLine: {
// // //     marginTop: 8,
// // //     fontSize: 20,
// // //     fontWeight: "700",
// // //     textAlign: "center",
// // //   },
// // //   section: { marginTop: 16 },
// // //   sectionTitle: {
// // //     fontWeight: "bold",
// // //     marginTop: 20,
// // //     fontSize: 18,
// // //     textAlign: "center",
// // //   },
// // //   label: {
// // //     fontWeight: "600",
// // //     fontSize: 16,
// // //     marginBottom: 4,
// // //   },
// // //   descriptionText: {
// // //     color: "red",
// // //     fontSize: 16,
// // //     textAlign: "center",
// // //   },
// // //   additionalCard: {
// // //     width: "90%",
// // //     backgroundColor: "#fdf6ec",
// // //     borderLeftWidth: 4,
// // //     borderLeftColor: "#ffa726",
// // //     padding: 16,
// // //     borderRadius: 10,
// // //     marginTop: 16,
// // //     shadowColor: "#000",
// // //     shadowOpacity: 0.05,
// // //     shadowOffset: { width: 0, height: 2 },
// // //     shadowRadius: 4,
// // //   },
// // //   additionalCardTitle: {
// // //     fontSize: 24,
// // //     fontWeight: "700",
// // //     color: "#e65100",
// // //     marginBottom: 4,
// // //     textAlign: "center",
// // //   },
// // //   additionalCardText: {
// // //     fontSize: 15,
// // //     color: "#5d4037",
// // //     fontWeight: 600,
// // //     marginBottom: 2,
// // //     textAlign: "center",
// // //   },
// // // });


// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   TouchableOpacity,
// //   Text,
// //   ActivityIndicator,
// //   Alert,
// //   StyleSheet,
// // } from "react-native";
// // import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
// // import { useNavigation, useRoute } from "@react-navigation/native";
// // import api from "../api/client";
// // import Constants from "expo-constants";
// // import LoadingScreen from "./LoadingScreen";
// // import { getCoveredDescription } from "../utils/serviceMatrix";

// // const FEE_RATE = 0.07;

// // export default function PaymentScreen() {
// //   const navigation = useNavigation();
// //   const { jobId } = useRoute().params;
// //   const { initPaymentSheet, presentPaymentSheet } = useStripe();

// //   const [loadingSheet, setLoadingSheet] = useState(false);
// //   const [paymentReady, setPaymentReady] = useState(false);
// //   const [showAnimation, setShowAnimation] = useState(false);
// //   const [job, setJob] = useState(null);

// //   useEffect(() => {
// //     (async () => {
// //       setLoadingSheet(true);
// //       try {
// //         const { data: jobData } = await api.get(`/jobs/${jobId}`);
// //         setJob(jobData);

// //         const amountInCents = Math.round((jobData.estimatedTotal || 0) * 100);
// //         const { data: sheetParams } = await api.post(
// //           "/payments/payment-sheet",
// //           {
// //             amount: amountInCents,
// //             currency: "usd",
// //           }
// //         );

// //         const { error: initError } = await initPaymentSheet({
// //           merchantDisplayName: "BlinqFix",
// //           customerId: sheetParams.customer,
// //           customerEphemeralKeySecret: sheetParams.ephemeralKey,
// //           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
// //           allowsDelayedPaymentMethods: true,
// //         });

// //         if (initError) throw initError;
// //         setPaymentReady(true); // ✅ mark as ready only if init succeeded
// //       } catch (err) {
// //         console.error("❌ PaymentSheet init error:", err);
// //         Alert.alert("Error", "Unable to initialize payment. Please try again.");
// //       } finally {
// //         setLoadingSheet(false);
// //       }
// //     })();
// //   }, [jobId, initPaymentSheet]);

// //   const handlePay = async () => {
// //     if (!paymentReady) {
// //       return Alert.alert("Not Ready", "Payment is not ready yet.");
// //     }

// //     const { error } = await presentPaymentSheet();
// //     if (error) {
// //       console.error("❌ presentPaymentSheet error:", error);
// //       Alert.alert("Payment failed", error.message);
// //       return;
// //     }

// //     try {
// //       await api.put(`/jobs/complete-payment/${jobId}`);
// //     } catch (err) {
// //       console.error("Complete-payment error:", err);
// //     }

// //     setShowAnimation(true);
// //   };

// //   if (showAnimation) {
// //     return (
// //       <LoadingScreen
// //         animationOnly
// //         enterDuration={800}
// //         holdDuration={400}
// //         exitDuration={800}
// //         onAnimationEnd={() =>
// //           navigation.replace("CustomerJobStatus", { jobId })
// //         }
// //       />
// //     );
// //   }

// //   const description = getCoveredDescription(job?.details?.issue);

// //   return (
// //     <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
// //       <View style={styles.container}>
// //         {loadingSheet || !job ? (
// //           <ActivityIndicator size="large" />
// //         ) : (
// //           <>
// //             <View style={styles.summaryCard}>
// //               <Text style={styles.summaryTitle}>Estimate Details</Text>
// //               {job.additionalCharge > 0 && (
// //                 <Text style={{ textAlign: "center" }}>
// //                   Extra charge: ${job.additionalCharge.toFixed(2)}
// //                 </Text>
// //               )}
// //               <Text style={styles.totalLine}>
// //                 Total: ${job.estimatedTotal.toFixed(2)}
// //               </Text>
// //               <Text style={styles.sectionTitle}>What’s Covered:</Text>
// //               <Text style={styles.descriptionText}>{description}</Text>
// //             </View>

// //             {job.additionalCharge > 0 && (
// //               <View style={styles.additionalCard}>
// //                 <Text style={styles.additionalCardTitle}>Additional Charge</Text>
// //                 <Text style={styles.additionalCardText}>
// //                   Amount: ${job.additionalCharge.toFixed(2)}
// //                 </Text>
// //                 {job.additionalChargeReason && (
// //                   <Text style={styles.additionalCardText}>
// //                     Description: {job.additionalChargeReason}
// //                   </Text>
// //                 )}
// //               </View>
// //             )}

// //             <TouchableOpacity
// //               style={[
// //                 styles.payButton,
// //                 !paymentReady && { backgroundColor: "#ccc" },
// //               ]}
// //               onPress={handlePay}
// //               disabled={!paymentReady}
// //             >
// //               <Text style={styles.payButtonText}>Pay & Book</Text>
// //             </TouchableOpacity>
// //           </>
// //         )}
// //       </View>
// //     </StripeProvider>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, justifyContent: "center", alignItems: "center" },
// //   payButton: {
// //     backgroundColor: "#1976d2",
// //     paddingVertical: 14,
// //     paddingHorizontal: 24,
// //     borderRadius: 8,
// //     marginTop: 16,
// //   },
// //   payButtonText: {
// //     color: "#fff",
// //     fontWeight: "bold",
// //     fontSize: 16,
// //   },
// //   summaryCard: {
// //     width: "90%",
// //     backgroundColor: "#fff",
// //     padding: 16,
// //     borderRadius: 10,
// //     shadowColor: "#000",
// //     shadowOpacity: 0.1,
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowRadius: 4,
// //     marginBottom: 24,
// //   },
// //   summaryTitle: {
// //     fontSize: 24,
// //     fontWeight: "700",
// //     marginBottom: 8,
// //     textAlign: "center",
// //   },
// //   totalLine: {
// //     marginTop: 8,
// //     fontSize: 20,
// //     fontWeight: "700",
// //     textAlign: "center",
// //   },
// //   section: { marginTop: 16 },
// //   sectionTitle: {
// //     fontWeight: "bold",
// //     marginTop: 20,
// //     fontSize: 18,
// //     textAlign: "center",
// //   },
// //   label: {
// //     fontWeight: "600",
// //     fontSize: 16,
// //     marginBottom: 4,
// //   },
// //   descriptionText: {
// //     color: "red",
// //     fontSize: 16,
// //     textAlign: "center",
// //   },
// //   additionalCard: {
// //     width: "90%",
// //     backgroundColor: "#fdf6ec",
// //     borderLeftWidth: 4,
// //     borderLeftColor: "#ffa726",
// //     padding: 16,
// //     borderRadius: 10,
// //     marginTop: 16,
// //     shadowColor: "#000",
// //     shadowOpacity: 0.05,
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowRadius: 4,
// //   },
// //   additionalCardTitle: {
// //     fontSize: 24,
// //     fontWeight: "700",
// //     color: "#e65100",
// //     marginBottom: 4,
// //     textAlign: "center",
// //   },
// //   additionalCardText: {
// //     fontSize: 15,
// //     color: "#5d4037",
// //     fontWeight: "600",
// //     marginBottom: 2,
// //     textAlign: "center",
// //   },
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

//   useEffect(() => {
//     (async () => {
//       setLoadingSheet(true);
//       setPaymentReady(false); // always reset
//       try {
//         const { data: jobData } = await api.get(`/jobs/${jobId}`);
//         setJob(jobData);

//         const amountInCents = Math.round((jobData.estimatedTotal || 0) * 100);
//         const { data: sheetParams } = await api.post(
//           "/payments/payment-sheet",
//           {
//             amount: amountInCents,
//             currency: "usd",
//           }
//         );

//         const { error: initError } = await initPaymentSheet({
//           merchantDisplayName: "BlinqFix",
//           customerId: sheetParams.customer,
//           customerEphemeralKeySecret: sheetParams.ephemeralKey,
//           paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
//           allowsDelayedPaymentMethods: true,
//         });

//         if (initError) throw initError;
//         setPaymentReady(true); // mark sheet as ready
//       } catch (err) {
//         console.error("❌ initPaymentSheet error:", err);
//         Alert.alert("Stripe Error", "Could not initialize payment sheet.");
//       } finally {
//         setLoadingSheet(false);
//       }
//     })();
//   }, [jobId, initPaymentSheet]);

//   const handlePay = async () => {
//     if (!paymentReady) {
//       return Alert.alert("Payment not ready", "Please wait while we prepare your payment.");
//     }

//     const { error } = await presentPaymentSheet();
//     if (error) {
//       console.error("❌ presentPaymentSheet error:", error);
//       return Alert.alert("Payment Failed", error.message);
//     }

//     try {
//       await api.put(`/jobs/complete-payment/${jobId}`);
//     } catch (err) {
//       console.error("Failed to finalize payment:", err);
//     }

//     setShowAnimation(true);
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

//previous
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
//     (async () => {
//       setLoadingSheet(true);
//       setPaymentReady(false);
//       try {
//         const { data: jobData } = await api.get(`/jobs/${jobId}`);
//         setJob(jobData);

//         const amountInCents = Math.round((jobData.estimatedTotal || 0) * 100);
//         const { data: sheetParams } = await api.post("/payments/payment-sheet", {
//           amount: amountInCents,
//           currency: "usd",
//         });

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
//     })();
//   }, [jobId, initPaymentSheet]);

//   const handlePay = async () => {
//     if (!paymentReady) {
//       return Alert.alert("Payment not ready", "Please wait while we prepare your payment.");
//     }

//     const { error } = await presentPaymentSheet();
//     if (error) {
//       console.error("❌ presentPaymentSheet error:", error);
//       return Alert.alert("Payment Failed", error.message);
//     }

//     try {
//       await api.put(`/jobs/complete-payment/${jobId}`);
//     } catch (err) {
//       console.error("Failed to finalize payment:", err);
//     }

//     setShowAnimation(true);
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
//     (async () => {
//       setLoadingSheet(true);
//       setPaymentReady(false);
//       try {
//         const { data: jobData } = await api.get(`/jobs/${jobId}`);
//         setJob(jobData);

//         const amountInCents = Math.round((jobData.estimatedTotal || 0) * 100);
//         const { data: sheetParams } = await api.post("/payments/payment-sheet", {
//           amount: amountInCents,
//           currency: "usd",
//         });

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
//         console.error("\u274C initPaymentSheet error:", err);
//         Alert.alert("Stripe Error", "Could not initialize payment sheet.");
//       } finally {
//         setLoadingSheet(false);
//       }
//     })();
//   }, [jobId, initPaymentSheet]);

//   const handlePay = async () => {
//     if (!paymentReady) {
//       return Alert.alert("Payment not ready", "Please wait while we prepare your payment.");
//     }

//     const { error } = await presentPaymentSheet();
//     if (error) {
//       console.error("\u274C presentPaymentSheet error:", error);
//       return Alert.alert("Payment Failed", error.message);
//     }

//     try {
//       await api.put(`/jobs/complete-payment/${jobId}`);
//     } catch (err) {
//       console.error("Failed to finalize payment:", err);
//     }

//     setShowAnimation(true);
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

//previous
import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../api/client";
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

  useEffect(() => {
    const preparePayment = async () => {
      setLoadingSheet(true);
      setPaymentReady(false);
      try {
        const { data: jobData } = await api.get(`/jobs/${jobId}`);
        setJob(jobData);

        const amountInCents = Math.round((jobData.estimatedTotal || 0) * 100);
        const { data: sheetParams } = await api.post("/payments/payment-sheet", {
          amount: amountInCents,
          currency: "usd",
        });

        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: "BlinqFix",
          customerId: sheetParams.customer,
          customerEphemeralKeySecret: sheetParams.ephemeralKey,
          paymentIntentClientSecret: sheetParams.paymentIntentClientSecret,
          allowsDelayedPaymentMethods: true,
        });

        if (initError) throw initError;
        setPaymentReady(true);
      } catch (err) {
        console.error("\u274C initPaymentSheet error:", err);
        Alert.alert("Stripe Error", "Could not initialize payment sheet.");
      } finally {
        setLoadingSheet(false);
      }
    };

    preparePayment();
  }, [jobId]);

  const handlePay = async () => {
    if (!paymentReady) {
      return Alert.alert("Payment not ready", "Please wait while we prepare your payment.");
    }

    try {
      const { error } = await presentPaymentSheet();
      if (error) {
        console.error("\u274C presentPaymentSheet error:", error);
        return Alert.alert("Payment Failed", error.message || "Unknown error occurred.");
      }

      await api.put(`/jobs/complete-payment/${jobId}`);
      setShowAnimation(true);
    } catch (err) {
      console.error("Payment handling error:", err);
      Alert.alert("Error", "Failed to complete payment.");
    }
  };

  if (showAnimation) {
    return (
      <LoadingScreen
        animationOnly
        enterDuration={800}
        holdDuration={400}
        exitDuration={800}
        onAnimationEnd={() => navigation.replace("CustomerJobStatus", { jobId })}
      />
    );
  }

  const description = getCoveredDescription(job?.details?.issue);

  return (
    <StripeProvider publishableKey={Constants.expoConfig.extra.stripeKey}>
      <View style={styles.container}>
        {loadingSheet || !job ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
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
          </>
        )}
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

//         const isExtraCharge = jobData.status === "awaiting-additional-payment";
//         const amountToCharge = isExtraCharge
//           ? jobData.additionalCharge || 0
//           : jobData.estimatedTotal || 0;

//         const amountInCents = Math.round(amountToCharge * 100);
//         const endpoint = isExtraCharge
//           ? "/payments/additional-charge-sheet"
//           : "/payments/payment-sheet";

//         const { data: sheetParams } = await api.post(endpoint, {
//           amount: amountInCents,
//           jobId,
//           currency: "usd",
//         });

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
//       return Alert.alert("Payment not ready", "Please wait while we prepare your payment.");
//     }

//     try {
//       const { error } = await presentPaymentSheet();
//       if (error) {
//         console.error("\u274C presentPaymentSheet error:", error);
//         return Alert.alert("Payment Failed", error.message || "Unknown error occurred.");
//       }

//       const endpoint = job.status === "awaiting-additional-payment"
//         ? `/jobs/${jobId}/complete-additional`
//         : `/jobs/complete-payment/${jobId}`;
//       await api.put(endpoint);
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

//         const isExtraCharge = jobData.status === "awaiting-additional-payment";
//         const endpoint = isExtraCharge
//           ? "/payments/additional-charge-sheet"
//           : "/payments/payment-sheet";

//         const { data: sheetParams } = await api.post(endpoint, {
//           jobId,
//           currency: "usd",
//         });

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
//       return Alert.alert("Payment not ready", "Please wait while we prepare your payment.");
//     }

//     try {
//       const { error } = await presentPaymentSheet();
//       if (error) {
//         console.error("\u274C presentPaymentSheet error:", error);
//         return Alert.alert("Payment Failed", error.message || "Unknown error occurred.");
//       }

//       const endpoint = job.status === "awaiting-additional-payment"
//         ? `/jobs/${jobId}/complete-additional`
//         : `/jobs/complete-payment/${jobId}`;
//       await api.put(endpoint);
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
//     (async () => {
//       setLoadingSheet(true);
//       setPaymentReady(false);
//       try {
//         const { data: jobData } = await api.get(`/jobs/${jobId}`);
//         setJob(jobData);

//         let amountToCharge = 0;
//         if (jobData.status === "awaiting-additional-payment") {
//           amountToCharge = jobData.additionalCharge || 0;
//         } else {
//           const subtotal =
//             (jobData.baseAmount || 0) +
//             (jobData.adjustmentAmount || 0) +
//             (jobData.rushFee || 0);
//           const convFee = Math.round((subtotal * FEE_RATE + Number.EPSILON) * 100) / 100;
//           amountToCharge = subtotal + convFee;
//         }

//         const amountInCents = Math.round(amountToCharge * 100);
//         const { data: sheetParams } = await api.post("/payments/payment-sheet", {
//           amount: amountInCents,
//           currency: "usd",
//         });

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
//         console.error("\u274C initPaymentSheet error:", err);
//         Alert.alert("Stripe Error", "Could not initialize payment sheet.");
//       } finally {
//         setLoadingSheet(false);
//       }
//     })();
//   }, [jobId, initPaymentSheet]);

//   const handlePay = async () => {
//     if (!paymentReady) {
//       return Alert.alert("Payment not ready", "Please wait while we prepare your payment.");
//     }

//     const { error } = await presentPaymentSheet();
//     if (error) {
//       console.error("\u274C presentPaymentSheet error:", error);
//       return Alert.alert("Payment Failed", error.message);
//     }

//     try {
//       await api.put(`/jobs/complete-payment/${jobId}`);
//     } catch (err) {
//       console.error("Failed to finalize payment:", err);
//     }

//     setShowAnimation(true);
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
