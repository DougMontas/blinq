// screens/EmergencyForm.js // working with Beta
// import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Alert,
//   StyleSheet,
//   Animated,
//   Pressable,
//   KeyboardAvoidingView,
//   ScrollView,
//   Platform,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import {
//   MapPin,
//   CreditCard,
//   Shield,
//   Clock,
//   CheckCircle,
//   ArrowLeft,
//   Zap,
// } from "lucide-react-native";
// import questionsData, {
//   getBasePrice,
//   estimateTotal,
//   getCoveredDescription,
// } from "../utils/serviceMatrix.js";
// import api from "../api/client";
// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const FEE_RATE = 0.07;

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export function HoverableCard({ style, onPress, children }) {
//   const scale = useRef(new Animated.Value(1)).current;
//   const elevation = useRef(new Animated.Value(2)).current;

//   const animate = (toScale, toElev) => {
//     Animated.parallel([
//       Animated.spring(scale, {
//         toValue: toScale,
//         friction: 6,
//         useNativeDriver: false,
//       }),
//       Animated.timing(elevation, {
//         toValue: toElev,
//         duration: 200,
//         useNativeDriver: false,
//       }),
//     ]).start();
//   };

//   return (
//     <Pressable
//       onPress={onPress}
//       onPressIn={() => animate(0.97, 8)}
//       onPressOut={() => animate(1, 2)}
//       {...(Platform.OS === "web"
//         ? {
//             onHoverIn: () => animate(1.03, 12),
//             onHoverOut: () => animate(1, 2),
//           }
//         : {})}
//     >
//       <Animated.View
//         style={[
//           style,
//           {
//             transform: [{ scale }],
//             shadowColor: "#000",
//             shadowOffset: { width: 0, height: elevation },
//             shadowOpacity: 0.15,
//             shadowRadius: elevation,
//             elevation,
//           },
//         ]}
//       >
//         {children}
//       </Animated.View>
//     </Pressable>
//   );
// }

// export default function EmergencyForm() {
//   const route = useRoute();
//   const navigation = useNavigation();

//   // Read params safely (don’t cause any updates here)
//   const category = route?.params?.category;
//   const subcategory = route?.params?.subcategory;

//   // Form state
//   const [address, setAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [zipcode, setZipcode] = useState("");
//   const [selectedService, setSelected] = useState(subcategory || "");
//   const [answers, setAnswers] = useState({});
//   const [otherAnswers, setOtherAnswers] = useState({});
//   const [submitting, setSubmitting] = useState(false);

//   // Smart Estimate V2 (secondary) state
//   const [smartStatus, setSmartStatus] = useState("idle"); // idle | loading | ready | error
//   const [smartPrice, setSmartPrice] = useState(null);
//   const [smartResult, setSmartResult] = useState(null);
//   const smartReqId = useRef(0); // prevent stale updates

//   // Questions for the chosen category/service
//   const categoryQuestion = (questionsData.questions[category] || [])[0] || null;
//   const serviceQuestions = selectedService
//     ? questionsData.questions[selectedService] || []
//     : [];

//   // Map question id → question text (stable across renders)
//   const idToQuestion = useMemo(() => {
//     const m = {};
//     serviceQuestions.forEach((q) => {
//       m[q.id] = q.question;
//     });
//     return m;
//   }, [serviceQuestions]);

//   // Your existing pricing (primary)
//   const basePrice = useMemo(
//     () => (selectedService ? getBasePrice(selectedService) : 0),
//     [selectedService]
//   );

//   // answers → { "Question text": "answer" }
//   const answersObj = useMemo(() => {
//     const out = {};
//     serviceQuestions.forEach((q) => {
//       const val = answers[q.id];
//       if (val != null) out[q.question] = val;
//     });
//     return out;
//   }, [answers, serviceQuestions]);

//   const adjustmentTotal = useMemo(
//     () => (selectedService ? estimateTotal(selectedService, answersObj) : 0),
//     [selectedService, answersObj]
//   );

//   const rushFee = selectedService ? 100 : 0;
//   const subtotal = basePrice + adjustmentTotal + rushFee;
//   const convFee = Number((subtotal * FEE_RATE).toFixed(2));
//   const grandTotal = Number((subtotal + convFee).toFixed(2));

//   // Secondary “Smart” details (normalized) for the API
//   const detailsForSmart = useMemo(() => {
//     const obj = {};
//     Object.entries(answers).forEach(([id, val]) => {
//       const qText = idToQuestion[id];
//       if (!qText) return;
//       if (val === "Other") {
//         const txt = (otherAnswers[id] || "").trim();
//         if (txt) obj[qText] = txt;
//       } else if (val) {
//         obj[qText] = val;
//       }
//     });
//     return obj;
//   }, [answers, otherAnswers, idToQuestion]);

//   // Stable hash to avoid infinite loops (sorted keys → JSON string)
//   const smartDetailsHash = useMemo(() => {
//     const keys = Object.keys(detailsForSmart).sort();
//     const ordered = {};
//     keys.forEach((k) => (ordered[k] = detailsForSmart[k]));
//     return JSON.stringify(ordered);
//   }, [detailsForSmart]);

//   const handleServiceSelect = (svc) => {
//     setSelected(svc);
//     setAnswers({});
//     setOtherAnswers({});
//     // Reset smart estimate when service changes
//     setSmartStatus("idle");
//     setSmartPrice(null);
//     setSmartResult(null);
//   };

//   const handleAnswerChange = (qId, val) =>
//     setAnswers((prev) => ({ ...prev, [qId]: val }));
//   const handleOtherChange = (qId, val) =>
//     setOtherAnswers((prev) => ({ ...prev, [qId]: val }));

//   // Geocoder for your existing payload
//   const fetchCoordinates = async () => {
//     try {
//       const query = encodeURIComponent(`${address}, ${city}, ${zipcode}`);
//       const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
//       const res = await fetch(url);
//       const json = await res.json();
//       const loc = json.results[0]?.geometry?.location;
//       return loc ? [loc.lng, loc.lat] : null;
//     } catch (e) {
//       console.warn("Geocode failed", e);
//       return null;
//     }
//   };

//   const registerPushToken = async () => {
//     if (!Device.isDevice) return;
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return;
//     const token = (await Notifications.getExpoPushTokenAsync()).data;
//     await AsyncStorage.setItem("expoPushToken", token);
//   };

//   // ===== Smart Estimate V2 – stable, debounced effect (no loops) =====
//   const callSmartEstimate = useCallback(
//     async (svc, addr, cty, zip, details, reqId) => {
//       try {
//         setSmartStatus("loading");
//         const { data } = await api.post("/price/v2/estimate", {
//           service: svc,
//           address: addr,
//           city: cty,
//           zipcode: zip,
//           details,
//         });
//         // Ignore outdated responses
//         if (reqId !== smartReqId.current) return;
//         if (data?.ok) {
//           setSmartPrice(data.priceUSD);
//           setSmartResult(data);
//           setSmartStatus("ready");
//         } else {
//           setSmartStatus("error");
//         }
//       } catch (e) {
//         if (reqId !== smartReqId.current) return;
//         setSmartStatus("error");
//       }
//     },
//     []
//   );

//   useEffect(() => {
//     // Only run when we actually have the inputs
//     if (
//       !selectedService ||
//       !address.trim() ||
//       !city.trim() ||
//       !zipcode.trim()
//     ) {
//       setSmartStatus("idle");
//       setSmartPrice(null);
//       setSmartResult(null);
//       return;
//     }
//     const reqId = ++smartReqId.current;
//     // Debounce slightly to avoid hammering the API while user is typing
//     const t = setTimeout(() => {
//       callSmartEstimate(
//         selectedService,
//         address,
//         city,
//         zipcode,
//         detailsForSmart,
//         reqId
//       );
//     }, 350);
//     return () => clearTimeout(t);
//     // Depend on primitive inputs + stable hash (not the object)
//   }, [
//     selectedService,
//     address,
//     city,
//     zipcode,
//     smartDetailsHash,
//     callSmartEstimate,
//     detailsForSmart, // captured as argument; not used for comparison itself
//   ]);

//   const handleSubmit = async () => {
//     if (!address.trim() || !city.trim() || !zipcode.trim()) {
//       return Alert.alert("Info", "Please enter address, city, and zip code.");
//     }
//     if (!selectedService) {
//       return Alert.alert("Info", "Please choose your specific issue.");
//     }

//     // Build the FINAL answers you already send today
//     const finalAns = {};
//     serviceQuestions.forEach((q) => {
//       const val = answers[q.id];
//       if (val === "Other") {
//         const txt = (otherAnswers[q.id] || "").trim();
//         if (!txt) {
//           return Alert.alert(
//             "Info",
//             `Specify your 'Other' answer for: ${q.question}`
//           );
//         }
//         finalAns[q.question] = txt;
//       } else if (val) {
//         finalAns[q.question] = val;
//       }
//     });

//     setSubmitting(true);
//     try {
//       const coords = await fetchCoordinates();
//       if (!coords) {
//         Alert.alert(
//           "Error",
//           "Failed to get coordinates from address. Please check your address."
//         );
//         setSubmitting(false);
//         return;
//       }

//       await registerPushToken();

//       // ⬇️ Smart estimate attached (does NOT replace your totals)
//       const pricingV2 =
//         smartStatus === "ready" && smartResult
//           ? {
//               ...smartResult,
//               usedInTotal: false, // explicitly not used for checkout totals
//               quotedAt: new Date().toISOString(),
//             }
//           : undefined;

//       const payload = {
//         category,
//         service: selectedService,
//         address,
//         serviceCity: city,
//         serviceZipcode: zipcode,
//         details: finalAns,
//         // Your existing numbers remain unchanged
//         baseAmount: basePrice,
//         adjustmentAmount: adjustmentTotal,
//         rushFee,
//         convenienceFee: convFee,
//         estimatedTotal: grandTotal,
//         coveredDescription: getCoveredDescription(selectedService),
//         location: { type: "Point", coordinates: coords },
//         // New, optional attachment
//         pricingV2,
//       };

//       const { data: job } = await api.post("/jobs", payload);
//       navigation.navigate("PaymentScreen", { jobId: job._id });
//     } catch (err) {
//       console.error(err?.response?.data || err);
//       Alert.alert("Error", "Submission failed – please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const cancelEstimate = () => navigation.goBack();

//   useEffect(() => {
//     Alert.alert(
//       "Note",
//       "Enter your address, city, zip code, choose the issue, review the estimate (including the 7% BlinqFix fee), then pay & book."
//     );
//   }, []);

//   const description = useMemo(() => {
//     return selectedService ? getCoveredDescription(selectedService) : "";
//   }, [selectedService]);

//   return (
//     <LinearGradient
//       colors={["#0f172a", "#1e3a8a", "#312e81"]}
//       style={styles.container}
//     >
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={100}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Header */}
//           <View style={styles.header}>
//             <Pressable
//               onPress={() => navigation.goBack()}
//               style={styles.backButton}
//             >
//               <ArrowLeft color="#fff" size={24} />
//             </Pressable>
//             <View style={styles.headerBadge}>
//               <Zap color="#facc15" size={16} />
//               <Text style={styles.headerBadgeText}>Emergency Request</Text>
//             </View>
//             <Text style={styles.title}>{category} Emergency Form</Text>
//             <Text style={styles.subtitle}>
//               Get connected with a professional in minutes
//             </Text>
//           </View>

//           {/* Location Section */}
//           <View style={styles.card}>
//             <View style={styles.cardHeader}>
//               <MapPin color="#60a5fa" size={24} />
//               <Text style={styles.cardTitle}>Service Location</Text>
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Address *</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter your address"
//                 placeholderTextColor="#94a3b8"
//                 value={address}
//                 onChangeText={setAddress}
//               />
//             </View>

//             <View style={styles.inputRow}>
//               <View style={[styles.inputGroup, { flex: 2 }]}>
//                 <Text style={styles.label}>City *</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter city"
//                   placeholderTextColor="#94a3b8"
//                   value={city}
//                   onChangeText={setCity}
//                 />
//               </View>
//               <View style={[styles.inputGroup, { flex: 1 }]}>
//                 <Text style={styles.label}>Zip Code *</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="12345"
//                   placeholderTextColor="#94a3b8"
//                   keyboardType="numeric"
//                   value={zipcode}
//                   onChangeText={setZipcode}
//                 />
//               </View>
//             </View>
//           </View>

//           {/* Service Selection */}
//           {!subcategory && categoryQuestion && (
//             <View style={styles.card}>
//               <View style={styles.cardHeader}>
//                 <Shield color="#4ade80" size={24} />
//                 <Text style={styles.cardTitle}>Select Your Issue</Text>
//               </View>
//               <Text style={styles.questionText}>
//                 {categoryQuestion.question}
//               </Text>
//               <View style={styles.optionsContainer}>
//                 {categoryQuestion.options.map((svc) => (
//                   <HoverableCard
//                     key={svc}
//                     style={[
//                       styles.optionCard,
//                       selectedService === svc && styles.optionCardSelected,
//                     ]}
//                     onPress={() => handleServiceSelect(svc)}
//                   >
//                     <Text
//                       style={[
//                         styles.optionText,
//                         selectedService === svc && styles.optionTextSelected,
//                       ]}
//                     >
//                       {svc}
//                     </Text>
//                     {selectedService === svc && (
//                       <CheckCircle color="#22c55e" size={20} />
//                     )}
//                   </HoverableCard>
//                 ))}
//               </View>
//             </View>
//           )}

//           {/* Service Questions */}
//           {selectedService &&
//             serviceQuestions.map((q) => {
//               const selectedVal = answers[q.id] || "";
//               return (
//                 <View key={q.id} style={styles.card}>
//                   <Text style={styles.questionText}>{q.question}</Text>
//                   <View style={styles.optionsContainer}>
//                     {q.options.map((opt) => (
//                       <HoverableCard
//                         key={opt.value}
//                         style={[
//                           styles.optionCard,
//                           selectedVal === opt.value && styles.optionCardSelected,
//                         ]}
//                         onPress={() => handleAnswerChange(q.id, opt.value)}
//                       >
//                         <Text
//                           style={[
//                             styles.optionText,
//                             selectedVal === opt.value &&
//                               styles.optionTextSelected,
//                           ]}
//                         >
//                           {opt.value}
//                         </Text>
//                         {selectedVal === opt.value && (
//                           <CheckCircle color="#22c55e" size={20} />
//                         )}
//                       </HoverableCard>
//                     ))}
//                     {!q.options.some((o) => o.value === "Other") && (
//                       <HoverableCard
//                         style={[
//                           styles.optionCard,
//                           selectedVal === "Other" && styles.optionCardSelected,
//                         ]}
//                         onPress={() => handleAnswerChange(q.id, "Other")}
//                       >
//                         <Text
//                           style={[
//                             styles.optionText,
//                             selectedVal === "Other" &&
//                               styles.optionTextSelected,
//                           ]}
//                         >
//                           Other
//                         </Text>
//                         {selectedVal === "Other" && (
//                           <CheckCircle color="#22c55e" size={20} />
//                         )}
//                       </HoverableCard>
//                     )}
//                   </View>
//                   {selectedVal === "Other" && (
//                     <TextInput
//                       style={[styles.input, styles.otherInput]}
//                       placeholder="Please specify..."
//                       placeholderTextColor="#94a3b8"
//                       value={otherAnswers[q.id] || ""}
//                       onChangeText={(txt) => handleOtherChange(q.id, txt)}
//                     />
//                   )}
//                 </View>
//               );
//             })}

//           {/* Price Summary (PRIMARY – unchanged) */}
//           {selectedService && (
//             <View style={styles.summaryCard}>
//               <LinearGradient
//                 colors={["rgba(34, 197, 94, 0.1)", "rgba(16, 185, 129, 0.1)"]}
//                 style={styles.summaryGradient}
//               >
//                 <View style={styles.cardHeader}>
//                   <CreditCard color="#22c55e" size={24} />
//                   <Text style={styles.summaryTitle}>Price Summary</Text>
//                 </View>

//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>
//                     includes BlinqFix Fee ({(FEE_RATE * 100).toFixed(0)}%)
//                   </Text>
//                   <Text style={styles.priceValue}>${convFee.toFixed(2)}</Text>
//                 </View>

//                 <View className="divider" style={styles.divider} />

//                 <View style={styles.totalRow}>
//                   <Text style={styles.totalLabel}>Estimated Total</Text>
//                   <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
//                 </View>

//                 <View style={styles.coveredSection}>
//                   <Text style={styles.coveredTitle}>What's Covered</Text>
//                   <Text style={styles.coveredText}>{description}</Text>
//                 </View>

//                 <View style={styles.guaranteeBadge}>
//                   <Shield color="#22c55e" size={16} />
//                   <Text style={styles.guaranteeText}>
//                     100% Satisfaction Guaranteed
//                   </Text>
//                 </View>
//               </LinearGradient>
//             </View>
//           )}

//           {/* Smart Estimate (SECONDARY – does not change totals) */}
//           {selectedService && address && city && zipcode && (
//             <View style={styles.smartCard}>
//               <Text style={styles.smartTitle}>Smart Estimate (beta)</Text>
//               {smartStatus === "loading" && (
//                 <Text style={styles.smartSub}>Calculating for your area…</Text>
//               )}
//               {smartStatus === "error" && (
//                 <Text style={styles.smartSub}>
//                   Couldn’t fetch a location-based estimate right now.
//                 </Text>
//               )}
//               {smartStatus === "ready" && smartPrice != null && (
//                 <>
//                   <Text style={styles.smartPrice}>${smartPrice.toFixed(2)}</Text>
//                   <Text style={styles.smartNote}>
//                     This estimate uses public location & competition data and is{" "}
//                     <Text style={{ fontWeight: "700" }}>not</Text> applied to
//                     checkout. Your total above stays the same.
//                   </Text>
//                 </>
//               )}
//             </View>
//           )}

//           {/* Action Buttons */}
//           <View style={styles.actionContainer}>
//             <HoverableCard style={styles.primaryButton} onPress={handleSubmit}>
//               <LinearGradient
//                 colors={["#22c55e", "#16a34a"]}
//                 style={styles.buttonGradient}
//               >
//                 <CreditCard color="#fff" size={20} />
//                 <Text style={styles.primaryButtonText}>
//                   {submitting ? "Processing..." : "Pay & Book Service"}
//                 </Text>
//               </LinearGradient>
//             </HoverableCard>

//             <HoverableCard
//               style={styles.secondaryButton}
//               onPress={cancelEstimate}
//             >
//               <Text style={styles.secondaryButtonText}>Cancel Estimate</Text>
//             </HoverableCard>
//           </View>

//           {/* Trust Indicators */}
//           <View style={styles.trustSection}>
//             <View style={styles.trustItem}>
//               <Clock color="#60a5fa" size={16} />
//               <Text style={styles.trustText}>Under 30 min response</Text>
//             </View>
//             <View style={styles.trustItem}>
//               <Shield color="#22c55e" size={16} />
//               <Text style={styles.trustText}>Licensed & Insured</Text>
//             </View>
//             <View style={styles.trustItem}>
//               <CheckCircle color="#c084fc" size={16} />
//               <Text style={styles.trustText}>Quality Guaranteed</Text>
//             </View>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
//   header: {
//     alignItems: "center",
//     paddingTop: 60,
//     paddingBottom: 32,
//     position: "relative",
//   },
//   backButton: {
//     position: "absolute",
//     borderRadius: 99,
//     borderColor: "white",
//     borderStyle: "solid",
//     width: 44,
//     height: 44,
//     top: 60,
//     left: 0,
//     padding: 8,
//   },
//   headerBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.1)",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginBottom: 16,
//   },
//   headerBadgeText: { color: "#fff", marginLeft: 8, fontWeight: "500" },
//   title: {
//     fontSize: 32,
//     fontWeight: "900",
//     color: "#fff",
//     textAlign: "center",
//     marginBottom: 8,
//   },
//   subtitle: { fontSize: 16, color: "#e0e7ff", textAlign: "center" },
//   card: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
//   cardTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginLeft: 12 },
//   inputGroup: { marginBottom: 16 },
//   inputRow: { flexDirection: "row", gap: 12 },
//   label: { fontSize: 16, fontWeight: "600", color: "#e0e7ff", marginBottom: 8 },
//   input: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     color: "#fff",
//   },
//   questionText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#fff",
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   optionsContainer: { gap: 12 },
//   optionCard: {
//     backgroundColor: "green",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//     borderRadius: 12,
//     padding: 16,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   optionCardSelected: { backgroundColor: "rgba(255,255,255,0.4)", borderColor: "#22c55e" },
//   optionText: { fontSize: 16, color: "#e0e7ff", flex: 1 },
//   optionTextSelected: { color: "#fff", fontWeight: "600" },
//   otherInput: { marginTop: 12 },
//   summaryCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
//   summaryGradient: { padding: 20 },
//   summaryTitle: { fontSize: 22, fontWeight: "bold", color: "#fff", marginLeft: 12 },
//   priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
//   priceLabel: { fontSize: 16, color: "#e0e7ff" },
//   priceValue: { fontSize: 16, fontWeight: "600", color: "#fff" },
//   divider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 12 },
//   totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
//   totalLabel: { fontSize: 20, fontWeight: "bold", color: "#fff" },
//   totalValue: { fontSize: 24, fontWeight: "900", color: "#22c55e" },
//   coveredSection: { marginTop: 20, padding: 16, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12 },
//   coveredTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 8 },
//   coveredText: { fontSize: 14, color: "#e0e7ff", lineHeight: 20 },
//   guaranteeBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 16,
//     padding: 12,
//     backgroundColor: "rgba(34, 197, 94, 0.2)",
//     borderRadius: 8,
//   },
//   guaranteeText: { color: "#22c55e", fontWeight: "600", marginLeft: 8 },
//   // Smart Estimate (secondary)
//   smartCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderColor: "rgba(255,255,255,0.1)",
//     borderWidth: 1,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//   },
//   smartTitle: { color: "#fff", fontWeight: "700", fontSize: 16, marginBottom: 6, textAlign: "center" },
//   smartSub: { color: "#e0e7ff", textAlign: "center" },
//   smartPrice: { color: "#22c55e", fontWeight: "900", fontSize: 28, textAlign: "center", marginVertical: 6 },
//   smartNote: { color: "#94a3b8", fontSize: 12, textAlign: "center" },
//   actionContainer: { gap: 12, marginBottom: 32 },
//   primaryButton: { borderRadius: 16, overflow: "hidden" },
//   buttonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 18,
//     paddingHorizontal: 24,
//     gap: 12,
//   },
//   primaryButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
//   secondaryButton: {
//     backgroundColor: "red",
//     borderWidth: 2,
//     borderColor: "rgba(239, 68, 68, 0.3)",
//     borderRadius: 16,
//     paddingVertical: 16,
//     alignItems: "center",
//   },
//   secondaryButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
//   trustSection: {
//     flexDirection: "column",
//     alignItems: "center",
//     paddingVertical: 16,
//     gap: 8,
//   },
//   trustItem: { flexDirection: "row", alignItems: "center", gap: 6 },
//   trustText: { color: "#e0e7ff", fontSize: 16, fontWeight: "500" },
// });

//old code
// import React, { useState, useMemo, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Alert,
//   StyleSheet,
//   Animated,
//   Pressable,
//   KeyboardAvoidingView,
//   ScrollView,
//   Platform,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import {
//   MapPin,
//   CreditCard,
//   Shield,
//   Clock,
//   CheckCircle,
//   ArrowLeft,
//   Zap,
// } from "lucide-react-native";

// import questionsData, { getCoveredDescription } from "../utils/serviceMatrix.js";
// import api from "../api/client";
// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const FEE_RATE = 0.07; // 7% BlinqFix fee

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export function HoverableCard({ style, onPress, children }) {
//   const scale = useRef(new Animated.Value(1)).current;
//   const elevation = useRef(new Animated.Value(2)).current;

//   const animate = (toScale, toElev) => {
//     Animated.parallel([
//       Animated.spring(scale, {
//         toValue: toScale,
//         friction: 6,
//         useNativeDriver: false,
//       }),
//       Animated.timing(elevation, {
//         toValue: toElev,
//         duration: 200,
//         useNativeDriver: false,
//       }),
//     ]).start();
//   };

//   return (
//     <Pressable
//       onPress={onPress}
//       onPressIn={() => animate(0.97, 8)}
//       onPressOut={() => animate(1, 2)}
//       {...(Platform.OS === "web"
//         ? {
//             onHoverIn: () => animate(1.03, 12),
//             onHoverOut: () => animate(1, 2),
//           }
//         : {})}
//     >
//       <Animated.View
//         style={[
//           style,
//           {
//             transform: [{ scale }],
//             shadowColor: "#000",
//             shadowOffset: { width: 0, height: elevation },
//             shadowOpacity: 0.15,
//             shadowRadius: elevation,
//             elevation,
//           },
//         ]}
//       >
//         {children}
//       </Animated.View>
//     </Pressable>
//   );
// }

// export default function EmergencyForm() {
//   // Safer param access (prevents update-depth loops)
//   const route = useRoute();
//   const params = route?.params || {};
//   const category = params.category;
//   const subcategory = params.subcategory;

//   const navigation = useNavigation();

//   const [address, setAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [zipcode, setZipcode] = useState("");
//   const [selectedService, setSelected] = useState(subcategory || "");
//   const [answers, setAnswers] = useState({});
//   const [otherAnswers, setOtherAnswers] = useState({});
//   const [submitting, setSubmitting] = useState(false);

//   // Smart (beta) estimate state
//   const [beta, setBeta] = useState(null); // whole response
//   const [betaLoading, setBetaLoading] = useState(false);
//   const [betaError, setBetaError] = useState("");

//   const categoryQuestion = (questionsData.questions[category] || [])[0] || null;
//   const serviceQuestions = selectedService
//     ? questionsData.questions[selectedService] || []
//     : [];

//   // Build the questionnaire answers object for the API
//   const detailsForBeta = useMemo(() => {
//     const out = {};
//     serviceQuestions.forEach((q) => {
//       const val = answers[q.id];
//       if (!val) return;
//       if (val === "Other") {
//         const txt = (otherAnswers[q.id] || "").trim();
//         if (txt) out[q.question] = txt;
//       } else {
//         out[q.question] = val;
//       }
//     });
//     return out;
//   }, [answers, otherAnswers, serviceQuestions]);

//   // Derived money amounts from beta response
//   const serviceFeeUSD = Math.max(100, beta?.serviceFeeUSD ?? 0); // enforce min $100
//   const smartPriceUSD = beta?.priceUSD ?? 0;
//   const subtotal = smartPriceUSD + serviceFeeUSD;
//   const convFee = Number((subtotal * FEE_RATE).toFixed(2));
//   const grandTotal = Number((subtotal + convFee).toFixed(2));

//   const handleServiceSelect = (svc) => {
//     setSelected(svc);
//     setAnswers({});
//     setOtherAnswers({});
//     setBeta(null);
//     setBetaError("");
//   };

//   const handleAnswerChange = (qId, val) =>
//     setAnswers((prev) => ({ ...prev, [qId]: val }));
//   const handleOtherChange = (qId, val) =>
//     setOtherAnswers((prev) => ({ ...prev, [qId]: val }));

//   // Geocode (client-side) for job payload location only
//   const fetchCoordinates = async () => {
//     try {
//       const query = encodeURIComponent(`${address}, ${city}, ${zipcode}`);
//       const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
//       const res = await fetch(url);
//       const json = await res.json();
//       const loc = json.results[0]?.geometry?.location;
//       return loc ? [loc.lng, loc.lat] : null;
//     } catch (e) {
//       console.warn("Geocode failed", e);
//       return null;
//     }
//   };

//   const registerPushToken = async () => {
//     if (Device.isDevice) {
//       const { status: existingStatus } = await Notifications.getPermissionsAsync();
//       let finalStatus = existingStatus;
//       if (existingStatus !== "granted") {
//         const { status } = await Notifications.requestPermissionsAsync();
//         finalStatus = status;
//       }
//       if (finalStatus !== "granted") return;

//       const token = (await Notifications.getExpoPushTokenAsync()).data;
//       await AsyncStorage.setItem("expoPushToken", token);
//     }
//   };

//   // Debounced call to Smart Estimate API when inputs are ready
//   useEffect(() => {
//     if (!selectedService) return;
//     if (!address.trim() || !city.trim() || !zipcode.trim()) return;

//     let cancelled = false;
//     const t = setTimeout(async () => {
//       try {
//         setBetaLoading(true);
//         setBetaError("");

//         // NOTE: client baseURL likely prefixes /api
//         const resp = await api.post("/routes/pricing/v2/estimate", {
//           service: selectedService,
//           address,
//           city,
//           zipcode,
//           details: detailsForBeta,
//         });

//         if (cancelled) return;
//         const data = resp?.data || {};
//         if (!data.ok) {
//           setBeta(null);
//           setBetaError(data.error || "Could not fetch estimate");
//         } else {
//           setBeta(data);
//         }
//       } catch (err) {
//         if (!cancelled) {
//           console.warn("Smart estimate failed", err?.response?.data || err);
//           setBeta(null);
//           setBetaError("Could not fetch estimate");
//         }
//       } finally {
//         if (!cancelled) setBetaLoading(false);
//       }
//     }, 350);

//     return () => {
//       cancelled = true;
//       clearTimeout(t);
//     };
//   }, [selectedService, address, city, zipcode, detailsForBeta]);

//   const handleSubmit = async () => {
//     if (!address.trim() || !city.trim() || !zipcode.trim()) {
//       return Alert.alert("Info", "Please enter address, city, and zip code.");
//     }
//     if (!selectedService) {
//       return Alert.alert("Info", "Please choose your specific issue.");
//     }
//     if (!beta || betaLoading) {
//       return Alert.alert("Info", "Getting your smart estimate. Please wait a moment.");
//     }

//     setSubmitting(true);
//     try {
//       const coords = await fetchCoordinates();
//       if (!coords) {
//         Alert.alert("Error", "Failed to get coordinates from address. Please check your address.");
//         setSubmitting(false);
//         return;
//       }

//       await registerPushToken();

//       // Build job payload: only the smart (beta) pricing is used
//       const payload = {
//         category,
//         service: selectedService,
//         address,
//         serviceCity: city,
//         serviceZipcode: zipcode,
//         details: detailsForBeta,

//         baseAmount: smartPriceUSD, // smart price from beta
//         adjustmentAmount: 0,       // beta already bakes adjustments in
//         rushFee: serviceFeeUSD,    // reuse field; this is our service/dispatch fee (min $100)
//         convenienceFee: convFee,   // 7%
//         estimatedTotal: grandTotal,

//         coveredDescription: getCoveredDescription(selectedService),
//         smartEstimateV2: { ...beta }, // keep full server response for reference
//         location: { type: "Point", coordinates: coords },
//       };

//       // Create job
//       const resp = await api.post("/jobs", payload);

//       // Be robust to either { job: {...} } or { ...jobFields }
//       const createdJob = resp?.data?.job || resp?.data;
//       const createdJobId = createdJob?._id || createdJob?.id;

//       if (!createdJobId) {
//         throw new Error("No job id returned from /jobs");
//       }

//       // Persist for safety in case navigation/route drops params
//       await AsyncStorage.setItem("activeJobId", createdJobId);

//       // Navigate to payment with explicit param
//       navigation.navigate("PaymentScreen", { jobId: createdJobId });
//     } catch (err) {
//       console.error(err?.response?.data || err);
//       Alert.alert("Error", "Submission failed – please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const cancelEstimate = () => navigation.goBack();

//   useEffect(() => {
//     Alert.alert(
//       "Note",
//       "Enter your address, city, zip code, choose the issue, review the smart estimate (includes a minimum $100 service fee and a 7% BlinqFix fee), then pay & book."
//     );
//   }, []);

//   const description = useMemo(() => {
//     return selectedService ? getCoveredDescription(selectedService) : "";
//   }, [selectedService]);

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={100}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Header */}
//           <View style={styles.header}>
//             <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
//               <ArrowLeft color="#fff" size={24} />
//             </Pressable>
//             <View style={styles.headerBadge}>
//               <Zap color="#facc15" size={16} />
//               <Text style={styles.headerBadgeText}>Emergency Request</Text>
//             </View>
//             <Text style={styles.title}>{category} Emergency Form</Text>
//             <Text style={styles.subtitle}>Get connected with a professional in minutes</Text>
//           </View>

//           {/* Location Section */}
//           <View style={styles.card}>
//             <View style={styles.cardHeader}>
//               <MapPin color="#60a5fa" size={24} />
//               <Text style={styles.cardTitle}>Service Location</Text>
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Address *</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter your address"
//                 placeholderTextColor="#94a3b8"
//                 value={address}
//                 onChangeText={setAddress}
//               />
//             </View>

//             <View style={styles.inputRow}>
//               <View style={[styles.inputGroup, { flex: 2 }]}>
//                 <Text style={styles.label}>City *</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter city"
//                   placeholderTextColor="#94a3b8"
//                   value={city}
//                   onChangeText={setCity}
//                 />
//               </View>
//               <View style={[styles.inputGroup, { flex: 1 }]}>
//                 <Text style={styles.label}>Zip Code *</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="12345"
//                   placeholderTextColor="#94a3b8"
//                   keyboardType="numeric"
//                   value={zipcode}
//                   onChangeText={setZipcode}
//                 />
//               </View>
//             </View>
//           </View>

//           {/* Service Selection */}
//           {!subcategory && categoryQuestion && (
//             <View style={styles.card}>
//               <View style={styles.cardHeader}>
//                 <Shield color="#4ade80" size={24} />
//                 <Text style={styles.cardTitle}>Select Your Issue</Text>
//               </View>
//               <Text style={styles.questionText}>{categoryQuestion.question}</Text>
//               <View style={styles.optionsContainer}>
//                 {categoryQuestion.options.map((svc) => (
//                   <HoverableCard
//                     key={svc}
//                     style={[
//                       styles.optionCard,
//                       selectedService === svc && styles.optionCardSelected,
//                     ]}
//                     onPress={() => handleServiceSelect(svc)}
//                   >
//                     <Text
//                       style={[
//                         styles.optionText,
//                         selectedService === svc && styles.optionTextSelected,
//                       ]}
//                     >
//                       {svc}
//                     </Text>
//                     {selectedService === svc && (
//                       <CheckCircle color="#22c55e" size={20} />
//                     )}
//                   </HoverableCard>
//                 ))}
//               </View>
//             </View>
//           )}

//           {/* Service Questions */}
//           {selectedService &&
//             serviceQuestions.map((q) => {
//               const selectedVal = answers[q.id] || "";
//               return (
//                 <View key={q.id} style={styles.card}>
//                   <Text style={styles.questionText}>{q.question}</Text>
//                   <View style={styles.optionsContainer}>
//                     {q.options.map((opt) => (
//                       <HoverableCard
//                         key={opt.value}
//                         style={[
//                           styles.optionCard,
//                           selectedVal === opt.value && styles.optionCardSelected,
//                         ]}
//                         onPress={() => handleAnswerChange(q.id, opt.value)}
//                       >
//                         <Text
//                           style={[
//                             styles.optionText,
//                             selectedVal === opt.value && styles.optionTextSelected,
//                           ]}
//                         >
//                           {opt.value}
//                         </Text>
//                         {selectedVal === opt.value && (
//                           <CheckCircle color="#22c55e" size={20} />
//                         )}
//                       </HoverableCard>
//                     ))}
//                     {!q.options.some((o) => o.value === "Other") && (
//                       <HoverableCard
//                         style={[
//                           styles.optionCard,
//                           selectedVal === "Other" && styles.optionCardSelected,
//                         ]}
//                         onPress={() => handleAnswerChange(q.id, "Other")}
//                       >
//                         <Text
//                           style={[
//                             styles.optionText,
//                             selectedVal === "Other" && styles.optionTextSelected,
//                           ]}
//                         >
//                           Other
//                         </Text>
//                         {selectedVal === "Other" && (
//                           <CheckCircle color="#22c55e" size={20} />
//                         )}
//                       </HoverableCard>
//                     )}
//                   </View>
//                   {selectedVal === "Other" && (
//                     <TextInput
//                       style={[styles.input, styles.otherInput]}
//                       placeholder="Please specify..."
//                       placeholderTextColor="#94a3b8"
//                       value={otherAnswers[q.id] || ""}
//                       onChangeText={(txt) => handleOtherChange(q.id, txt)}
//                     />
//                   )}
//                 </View>
//               );
//             })}

//           {/* Price Summary (Smart estimate only) */}
//           {selectedService && (
//             <View style={styles.summaryCard}>
//               <LinearGradient
//                 colors={["rgba(34, 197, 94, 0.1)", "rgba(16, 185, 129, 0.1)"]}
//                 style={styles.summaryGradient}
//               >
//                 <View style={styles.cardHeader}>
//                   <CreditCard color="#22c55e" size={24} />
//                   <Text style={styles.summaryTitle}>Price Summary</Text>
//                 </View>

//                 {betaLoading && (
//                   <Text style={{ color: "#e0e7ff", textAlign: "center", marginBottom: 8 }}>
//                     Calculating smart price…
//                   </Text>
//                 )}
//                 {!!betaError && (
//                   <Text style={{ color: "#fecaca", textAlign: "center", marginBottom: 8 }}>
//                     {betaError}
//                   </Text>
//                 )}

//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>Smart Price</Text>
//                   <Text style={styles.priceValue}>${smartPriceUSD.toFixed(2)}</Text>
//                 </View>

//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>Service/Dispatch Fee (min $100)</Text>
//                   <Text style={styles.priceValue}>${serviceFeeUSD.toFixed(2)}</Text>
//                 </View>

//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>
//                     BlinqFix Fee ({(FEE_RATE * 100).toFixed(0)}%)
//                   </Text>
//                   <Text style={styles.priceValue}>${convFee.toFixed(2)}</Text>
//                 </View>

//                 <View style={styles.divider} />

//                 <View style={styles.totalRow}>
//                   <Text style={styles.totalLabel}>Estimated Total</Text>
//                   <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
//                 </View>

//                 <View style={styles.coveredSection}>
//                   <Text style={styles.coveredTitle}>What's Covered</Text>
//                   <Text style={styles.coveredText}>{description}</Text>
//                 </View>

//                 <View className="guaranteeBadge" style={styles.guaranteeBadge}>
//                   <Shield color="#22c55e" size={16} />
//                   <Text style={styles.guaranteeText}>100% Satisfaction Guaranteed</Text>
//                 </View>
//               </LinearGradient>
//             </View>
//           )}

//           {/* Action Buttons */}
//           <View style={styles.actionContainer}>
//             <HoverableCard style={styles.primaryButton} onPress={handleSubmit}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.buttonGradient}>
//                 <CreditCard color="#fff" size={20} />
//                 <Text style={styles.primaryButtonText}>
//                   {submitting ? "Processing..." : "Pay & Book Service"}
//                 </Text>
//               </LinearGradient>
//             </HoverableCard>

//             <HoverableCard style={styles.secondaryButton} onPress={cancelEstimate}>
//               <Text style={styles.secondaryButtonText}>Cancel Estimate</Text>
//             </HoverableCard>
//           </View>

//           {/* Trust Indicators */}
//           <View style={styles.trustSection}>
//             <View style={styles.trustItem}>
//               <Clock color="#60a5fa" size={16} />
//               <Text style={styles.trustText}>Under 30 min response</Text>
//             </View>
//             <View style={styles.trustItem}>
//               <Shield color="#22c55e" size={16} />
//               <Text style={styles.trustText}>Licensed & Insured</Text>
//             </View>
//             <View style={styles.trustItem}>
//               <CheckCircle color="#c084fc" size={16} />
//               <Text style={styles.trustText}>Quality Guaranteed</Text>
//             </View>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
//   header: {
//     alignItems: "center",
//     paddingTop: 60,
//     paddingBottom: 32,
//     position: "relative",
//   },
//   backButton: {
//     position: "absolute",
//     borderRadius: 99,
//     borderColor: "white",
//     borderStyle: "solid",
//     width: 44,
//     height: 44,
//     top: 60,
//     left: 0,
//     padding: 8,
//   },
//   headerBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.1)",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginBottom: 16,
//   },
//   headerBadgeText: { color: "#fff", marginLeft: 8, fontWeight: "500" },
//   title: {
//     fontSize: 32,
//     fontWeight: "900",
//     color: "#fff",
//     textAlign: "center",
//     marginBottom: 8,
//   },
//   subtitle: { fontSize: 16, color: "#e0e7ff", textAlign: "center" },
//   card: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
//   cardTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginLeft: 12 },
//   inputGroup: { marginBottom: 16 },
//   inputRow: { flexDirection: "row", gap: 12 },
//   label: { fontSize: 16, fontWeight: "600", color: "#e0e7ff", marginBottom: 8 },
//   input: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     color: "#fff",
//   },
//   questionText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#fff",
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   optionsContainer: { gap: 12 },
//   optionCard: {
//     backgroundColor: "green",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//     borderRadius: 12,
//     padding: 16,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   optionCardSelected: { backgroundColor: "rgba(255,255,255,0.4)", borderColor: "#22c55e" },
//   optionText: { fontSize: 16, color: "#e0e7ff", flex: 1 },
//   optionTextSelected: { color: "#fff", fontWeight: "600" },
//   otherInput: { marginTop: 12 },
//   summaryCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
//   summaryGradient: { padding: 20 },
//   summaryTitle: { fontSize: 22, fontWeight: "bold", color: "#fff", marginLeft: 12 },
//   priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
//   priceLabel: { fontSize: 16, color: "#e0e7ff" },
//   priceValue: { fontSize: 16, fontWeight: "600", color: "#fff" },
//   divider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 12 },
//   totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
//   totalLabel: { fontSize: 20, fontWeight: "bold", color: "#fff" },
//   totalValue: { fontSize: 24, fontWeight: "900", color: "#22c55e" },
//   coveredSection: { marginTop: 20, padding: 16, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12 },
//   coveredTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 8 },
//   coveredText: { fontSize: 14, color: "#e0e7ff", lineHeight: 20 },
//   guaranteeBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 16,
//     padding: 12,
//     backgroundColor: "rgba(34, 197, 94, 0.2)",
//     borderRadius: 8,
//   },
//   guaranteeText: { color: "#22c55e", fontWeight: "600", marginLeft: 8 },
//   actionContainer: { gap: 12, marginBottom: 32 },
//   primaryButton: { borderRadius: 16, overflow: "hidden" },
//   buttonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 18,
//     paddingHorizontal: 24,
//     gap: 12,
//   },
//   primaryButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
//   secondaryButton: {
//     backgroundColor: "red",
//     borderWidth: 2,
//     borderColor: "rgba(239, 68, 68, 0.3)",
//     borderRadius: 16,
//     paddingVertical: 16,
//     alignItems: "center",
//   },
//   secondaryButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
//   trustSection: {
//     flexDirection: "column",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 16,
//     gap: 8,
//   },
//   trustItem: { flexDirection: "row", alignItems: "center", gap: 6 },
//   trustText: { color: "#e0e7ff", fontSize: 16, fontWeight: "500" },
// });


// //test button code
// import React, { useState, useMemo, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Alert,
//   StyleSheet,
//   Animated,
//   Pressable,
//   KeyboardAvoidingView,
//   ScrollView,
//   Platform,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import {
//   MapPin,
//   CreditCard,
//   Shield,
//   Clock,
//   CheckCircle,
//   ArrowLeft,
//   Zap,
// } from "lucide-react-native";

// import questionsData, { getCoveredDescription } from "../utils/serviceMatrix.js";
// import api from "../api/client";
// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // ─────────────────────────────────────────────────────────────
// // 🔧 Test service name (must match back-end pricing switch)
// // ─────────────────────────────────────────────────────────────
// const TEST_SERVICE_NAME = "Test: $1 Flat (No Fees)";

// const FEE_RATE = 0.07; // 7% BlinqFix fee
// const L = (...args) => console.log("🚑 [EmergencyForm]", ...args);

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export function HoverableCard({ style, onPress, children }) {
//   const scale = useRef(new Animated.Value(1)).current;
//   const elevation = useRef(new Animated.Value(2)).current;

//   const animate = (toScale, toElev) => {
//     Animated.parallel([
//       Animated.spring(scale, { toValue: toScale, friction: 6, useNativeDriver: false }),
//       Animated.timing(elevation, { toValue: toElev, duration: 200, useNativeDriver: false }),
//     ]).start();
//   };

//   return (
//     <Pressable
//       onPress={onPress}
//       onPressIn={() => animate(0.97, 8)}
//       onPressOut={() => animate(1, 2)}
//       {...(Platform.OS === "web"
//         ? { onHoverIn: () => animate(1.03, 12), onHoverOut: () => animate(1, 2) }
//         : {})}
//     >
//       <Animated.View
//         style={[
//           style,
//           {
//             transform: [{ scale }],
//             shadowColor: "#000",
//             shadowOffset: { width: 0, height: elevation },
//             shadowOpacity: 0.15,
//             shadowRadius: elevation,
//             elevation,
//           },
//         ]}
//       >
//         {children}
//       </Animated.View>
//     </Pressable>
//   );
// }

// export default function EmergencyForm() {
//   const route = useRoute();
//   const params = route?.params || {};
//   const category = params.category;          // e.g., "Electrician"
//   const preselected = params.subcategory;    // may be undefined
//   const navigation = useNavigation();

//   useEffect(() => {
//     L("Mounted. route.name:", route?.name, "params:", params);
//   }, [route, params]);

//   // 🔧 Service location (restored)
//   const [address, setAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [zipcode, setZipcode] = useState("");

//   // Service & Q&A
//   const [selectedService, setSelected] = useState(preselected || "");
//   const [answers, setAnswers] = useState({});
//   const [otherAnswers, setOtherAnswers] = useState({});
//   const [submitting, setSubmitting] = useState(false);

//   // Smart (beta) estimate state
//   const [beta, setBeta] = useState(null); // whole response
//   const [betaLoading, setBetaLoading] = useState(false);
//   const [betaError, setBetaError] = useState("");

//   // Category‑level question that provides the service list
//   const categoryQuestion = (questionsData.questions[category] || [])[0] || null;

//   // 🔧 Build category options and inject TEST service if missing
//   const categoryOptions = useMemo(() => {
//     const opts = Array.isArray(categoryQuestion?.options)
//       ? [...categoryQuestion.options]
//       : [];
//     if (!opts.includes(TEST_SERVICE_NAME)) {
//       opts.push(TEST_SERVICE_NAME);
//     }
//     return opts;
//   }, [categoryQuestion]);

//   // Per‑service follow‑up questions
//   const serviceQuestions = selectedService
//     ? questionsData.questions[selectedService] || []
//     : [];

//   const detailsForBeta = useMemo(() => {
//     const out = {};
//     serviceQuestions.forEach((q) => {
//       const val = answers[q.id];
//       if (!val) return;
//       if (val === "Other") {
//         const txt = (otherAnswers[q.id] || "").trim();
//         if (txt) out[q.question] = txt;
//       } else {
//         out[q.question] = val;
//       }
//     });
//     return out;
//   }, [answers, otherAnswers, serviceQuestions]);

//   // 🔧 Fee overrides for TEST service
//   const isTestService = selectedService === TEST_SERVICE_NAME;

//   // Derived money amounts from beta response
//   const rawServiceFee = isTestService ? 0 : Math.max(100, beta?.serviceFeeUSD ?? 0);
//   const smartPriceUSD = isTestService ? 1 : (beta?.priceUSD ?? 0);
//   const subtotal = smartPriceUSD + rawServiceFee;
//   const effectiveFeeRate = isTestService ? 0 : FEE_RATE;
//   const convFee = Number((subtotal * effectiveFeeRate).toFixed(2));
//   const grandTotal = Number((subtotal + convFee).toFixed(2));

//   useEffect(() => {
//     L(
//       "Amounts → smartPriceUSD:",
//       smartPriceUSD,
//       "serviceFeeUSD:",
//       rawServiceFee,
//       "convFee:",
//       convFee,
//       "grandTotal:",
//       grandTotal
//     );
//   }, [smartPriceUSD, rawServiceFee, convFee, grandTotal]);

//   const handleServiceSelect = (svc) => {
//     L("Service selected:", svc);
//     setSelected(svc);
//     setAnswers({});
//     setOtherAnswers({});
//     setBeta(null);
//     setBetaError("");
//   };

//   const handleAnswerChange = (qId, val) => {
//     L("Answer change:", qId, "→", val);
//     setAnswers((prev) => ({ ...prev, [qId]: val }));
//   };
//   const handleOtherChange = (qId, val) => {
//     L("Other answer change:", qId, "→", val);
//     setOtherAnswers((prev) => ({ ...prev, [qId]: val }));
//   };

//   const fetchCoordinates = async () => {
//     try {
//       const query = encodeURIComponent(`${address}, ${city}, ${zipcode}`);
//       const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
//       L("Geocode request →", url.replace(/key=[^&]+/, "key=***"));
//       const res = await fetch(url);
//       const json = await res.json();
//       const loc = json.results[0]?.geometry?.location;
//       L("Geocode response ok:", Boolean(loc));
//       return loc ? [loc.lng, loc.lat] : null;
//     } catch (e) {
//       L("Geocode failed", e?.message || e);
//       return null;
//     }
//   };

//   const registerPushToken = async () => {
//     if (Device.isDevice) {
//       const { status: existingStatus } = await Notifications.getPermissionsAsync();
//       let finalStatus = existingStatus;
//       if (existingStatus !== "granted") {
//         const { status } = await Notifications.requestPermissionsAsync();
//         finalStatus = status;
//       }
//       L("Push perms:", finalStatus);
//       if (finalStatus !== "granted") return;

//       const token = (await Notifications.getExpoPushTokenAsync()).data;
//       L("Expo push token acquired:", Boolean(token));
//       await AsyncStorage.setItem("expoPushToken", token);
//     }
//   };

//   // Debounced call to Smart Estimate API when inputs are ready
//   useEffect(() => {
//     if (!selectedService) return;
//     if (!address.trim() || !city.trim() || !zipcode.trim()) return;

//     let cancelled = false;
//     const t = setTimeout(async () => {
//       try {
//         setBetaLoading(true);
//         setBetaError("");

//         // 🔧 Short‑circuit for TEST service
//         if (isTestService) {
//           const fake = {
//             ok: true,
//             service: TEST_SERVICE_NAME,
//             priceUSD: 1,
//             serviceFeeUSD: 0,
//             suggestedSubtotalUSD: 1,
//             address: `${address}, ${city} ${zipcode}`,
//             breakdown: { note: "Local test override; no remote pricing call" },
//           };
//           if (!cancelled) {
//             setBeta(fake);
//             setBetaLoading(false);
//             L("Smart estimate (TEST) → local stub applied", fake);
//           }
//           return;
//         }

//         L("Smart estimate → POST start", {
//           service: selectedService,
//           addr: address,
//           city,
//           zipcode,
//           detailsKeys: Object.keys(detailsForBeta),
//         });

//         const resp = await api.post("/routes/pricing/v2/estimate", {
//           service: selectedService,
//           address,
//           city,
//           zipcode,
//           details: detailsForBeta,
//         });

//         if (cancelled) return;
//         const data = resp?.data || {};
//         L(
//           "Smart estimate → response ok:",
//           data?.ok,
//           "priceUSD:",
//           data?.priceUSD,
//           "serviceFeeUSD:",
//           data?.serviceFeeUSD
//         );
//         if (!data.ok) {
//           setBeta(null);
//           setBetaError(data.error || "Could not fetch estimate");
//         } else {
//           setBeta(data);
//         }
//       } catch (err) {
//         if (!cancelled) {
//           L("Smart estimate failed", err?.response?.data || err?.message || err);
//           setBeta(null);
//           setBetaError("Could not fetch estimate");
//         }
//       } finally {
//         if (!cancelled) setBetaLoading(false);
//       }
//     }, 350);

//     return () => {
//       cancelled = true;
//       clearTimeout(t);
//     };
//   }, [selectedService, address, city, zipcode, detailsForBeta, isTestService]);

//   const handleSubmit = async () => {
//     if (!address.trim() || !city.trim() || !zipcode.trim()) {
//       return Alert.alert("Info", "Please enter address, city, and zip code.");
//     }
//     if (!selectedService) {
//       return Alert.alert("Info", "Please choose your specific issue.");
//     }
//     if (!beta || betaLoading) {
//       return Alert.alert("Info", "Getting your smart estimate. Please wait a moment.");
//     }

//     setSubmitting(true);
//     try {
//       L("Submit → start");
//       const coords = await fetchCoordinates();
//       if (!coords) {
//         Alert.alert("Error", "Failed to get coordinates from address. Please check your address.");
//         setSubmitting(false);
//         return;
//       }

//       await registerPushToken();

//       const payload = {
//         category,
//         service: selectedService,
//         address,
//         serviceCity: city,
//         serviceZipcode: zipcode,
//         details: detailsForBeta,

//         baseAmount: smartPriceUSD,
//         adjustmentAmount: 0,
//         rushFee: rawServiceFee,     // 0 for test
//         convenienceFee: convFee,    // 0 for test
//         estimatedTotal: grandTotal, // 1.00 for test

//         coveredDescription: getCoveredDescription(selectedService),
//         smartEstimateV2: { ...beta },
//         location: { type: "Point", coordinates: coords },
//       };

//       L("POST /jobs payload amounts:", {
//         baseAmount: payload.baseAmount,
//         rushFee: payload.rushFee,
//         convenienceFee: payload.convenienceFee,
//         estimatedTotal: payload.estimatedTotal,
//       });

//       const resp = await api.post("/jobs", payload);

//       const createdJob = resp?.data?.job || resp?.data;
//       const createdJobId = createdJob?._id || createdJob?.id;
//       L("POST /jobs response keys:", Object.keys(resp?.data || {}));
//       L("POST /jobs extracted jobId:", createdJobId);

//       if (!createdJobId) throw new Error("No job id returned from /jobs");

//       try {
//         await AsyncStorage.setItem("activeJobId", String(createdJobId));
//         await AsyncStorage.setItem("lastCreatedJobId", String(createdJobId));
//         L("Persisted activeJobId & lastCreatedJobId:", createdJobId);
//       } catch (e) {
//         L("Persist jobId error:", e?.message || e);
//       }

//       L("Navigating → PaymentScreen with jobId:", createdJobId);
//       navigation.navigate("PaymentScreen", { jobId: String(createdJobId) });
//     } catch (err) {
//       L("Submit error", err?.response?.data || err?.message || err);
//       Alert.alert("Error", "Submission failed – please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const cancelEstimate = () => {
//     L("Cancel pressed → goBack");
//     navigation.goBack();
//   };

//   useEffect(() => {
//     Alert.alert(
//       "Note",
//       "Enter your address, city, zip code, choose the service, review the estimate, then pay & book."
//     );
//   }, []);

//   const description = useMemo(() => {
//     return selectedService ? getCoveredDescription(selectedService) : "";
//   }, [selectedService]);

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={100}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Header */}
//           <View style={styles.header}>
//             <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
//               <ArrowLeft color="#fff" size={24} />
//             </Pressable>
//             <View style={styles.headerBadge}>
//               <Zap color="#facc15" size={16} />
//               <Text style={styles.headerBadgeText}>Emergency Request</Text>
//             </View>
//             <Text style={styles.title}>{category} Emergency Form</Text>
//             <Text style={styles.subtitle}>Get connected with a professional in minutes</Text>
//           </View>

//           {/* 🔧 Service Location (restored) */}
//           <View style={styles.card}>
//             <View style={styles.cardHeader}>
//               <MapPin color="#60a5fa" size={24} />
//               <Text style={styles.cardTitle}>Service Location</Text>
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Address *</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Enter your address"
//                 placeholderTextColor="#94a3b8"
//                 value={address}
//                 onChangeText={setAddress}
//               />
//             </View>

//             <View style={styles.inputRow}>
//               <View style={[styles.inputGroup, { flex: 2 }]}>
//                 <Text style={styles.label}>City *</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter city"
//                   placeholderTextColor="#94a3b8"
//                   value={city}
//                   onChangeText={setCity}
//                 />
//               </View>
//               <View style={[styles.inputGroup, { flex: 1 }]}>
//                 <Text style={styles.label}>Zip Code *</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="12345"
//                   placeholderTextColor="#94a3b8"
//                   keyboardType="numeric"
//                   value={zipcode}
//                   onChangeText={setZipcode}
//                 />
//               </View>
//             </View>
//           </View>

//           {/* Service Selection (always visible so you can pick TEST) */}
//           {categoryQuestion && (
//             <View style={styles.card}>
//               <View style={styles.cardHeader}>
//                 <Shield color="#4ade80" size={24} />
//                 <Text style={styles.cardTitle}>Select Your Issue</Text>
//               </View>

//               {preselected ? (
//                 <Text style={{ color: "#cbd5e1", marginBottom: 10 }}>
//                   Current selection:{" "}
//                   <Text style={{ fontWeight: "700", color: "#fff" }}>
//                     {selectedService || preselected}
//                   </Text>
//                 </Text>
//               ) : null}

//               <Text style={styles.questionText}>{categoryQuestion.question}</Text>

//               <View style={styles.optionsContainer}>
//                 {categoryOptions.map((svc) => (
//                   <HoverableCard
//                     key={svc}
//                     style={[
//                       styles.optionCard,
//                       selectedService === svc && styles.optionCardSelected,
//                     ]}
//                     onPress={() => handleServiceSelect(svc)}
//                   >
//                     <Text
//                       style={[
//                         styles.optionText,
//                         selectedService === svc && styles.optionTextSelected,
//                       ]}
//                     >
//                       {svc}
//                     </Text>
//                     {selectedService === svc && <CheckCircle color="#22c55e" size={20} />}
//                   </HoverableCard>
//                 ))}
//               </View>
//             </View>
//           )}

//           {/* Service Questions */}
//           {selectedService &&
//             serviceQuestions.map((q) => {
//               const selectedVal = answers[q.id] || "";
//               return (
//                 <View key={q.id} style={styles.card}>
//                   <Text style={styles.questionText}>{q.question}</Text>
//                   <View style={styles.optionsContainer}>
//                     {q.options.map((opt) => (
//                       <HoverableCard
//                         key={opt.value}
//                         style={[
//                           styles.optionCard,
//                           selectedVal === opt.value && styles.optionCardSelected,
//                         ]}
//                         onPress={() => handleAnswerChange(q.id, opt.value)}
//                       >
//                         <Text
//                           style={[
//                             styles.optionText,
//                             selectedVal === opt.value && styles.optionTextSelected,
//                           ]}
//                         >
//                           {opt.value}
//                         </Text>
//                         {selectedVal === opt.value && <CheckCircle color="#22c55e" size={20} />}
//                       </HoverableCard>
//                     ))}
//                     {!q.options.some((o) => o.value === "Other") && (
//                       <HoverableCard
//                         style={[
//                           styles.optionCard,
//                           selectedVal === "Other" && styles.optionCardSelected,
//                         ]}
//                         onPress={() => handleAnswerChange(q.id, "Other")}
//                       >
//                         <Text
//                           style={[
//                             styles.optionText,
//                             selectedVal === "Other" && styles.optionTextSelected,
//                           ]}
//                         >
//                           Other
//                         </Text>
//                         {selectedVal === "Other" && <CheckCircle color="#22c55e" size={20} />}
//                       </HoverableCard>
//                     )}
//                   </View>
//                   {selectedVal === "Other" && (
//                     <TextInput
//                       style={[styles.input, styles.otherInput]}
//                       placeholder="Please specify..."
//                       placeholderTextColor="#94a3b8"
//                       value={otherAnswers[q.id] || ""}
//                       onChangeText={(txt) => handleOtherChange(q.id, txt)}
//                     />
//                   )}
//                 </View>
//               );
//             })}

//           {/* Price Summary */}
//           {selectedService && (
//             <View style={styles.summaryCard}>
//               <LinearGradient
//                 colors={["rgba(34, 197, 94, 0.1)", "rgba(16, 185, 129, 0.1)"]}
//                 style={styles.summaryGradient}
//               >
//                 <View style={styles.cardHeader}>
//                   <CreditCard color="#22c55e" size={24} />
//                   <Text style={styles.summaryTitle}>Price Summary</Text>
//                 </View>

//                 {betaLoading && (
//                   <Text style={{ color: "#e0e7ff", textAlign: "center", marginBottom: 8 }}>
//                     Calculating smart price…
//                   </Text>
//                 )}
//                 {!!betaError && (
//                   <Text style={{ color: "#fecaca", textAlign: "center", marginBottom: 8 }}>
//                     {betaError}
//                   </Text>
//                 )}

//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>Smart Price</Text>
//                   <Text style={styles.priceValue}>${smartPriceUSD.toFixed(2)}</Text>
//                 </View>

//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>Emergency/On-Demand Fee</Text>
//                   <Text style={styles.priceValue}>${rawServiceFee.toFixed(2)}</Text>
//                 </View>

//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>
//                     BlinqFix Fee ({(effectiveFeeRate * 100).toFixed(0)}%)
//                   </Text>
//                   <Text style={styles.priceValue}>${convFee.toFixed(2)}</Text>
//                 </View>

//                 <View style={styles.divider} />

//                 <View style={styles.totalRow}>
//                   <Text style={styles.totalLabel}>Estimated Total</Text>
//                   <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
//                 </View>

//                 <View style={styles.coveredSection}>
//                   <Text style={styles.coveredTitle}>What's Covered</Text>
//                   <Text style={styles.coveredText}>
//                     {getCoveredDescription(selectedService) || "Basic diagnostic for testing purposes."}
//                   </Text>
//                 </View>

//                 <View style={styles.guaranteeBadge}>
//                   <Shield color="#22c55e" size={16} />
//                   <Text style={styles.guaranteeText}>100% On-Demand Guaranteed</Text>
//                 </View>
//               </LinearGradient>
//             </View>
//           )}

//           {/* Action Buttons */}
//           <View style={styles.actionContainer}>
//             <HoverableCard style={styles.primaryButton} onPress={handleSubmit}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.buttonGradient}>
//                 <CreditCard color="#fff" size={20} />
//                 <Text style={styles.primaryButtonText}>
//                   {submitting ? "Processing..." : "Pay & Book Service"}
//                 </Text>
//               </LinearGradient>
//             </HoverableCard>

//             <HoverableCard style={styles.secondaryButton} onPress={cancelEstimate}>
//               <Text style={styles.secondaryButtonText}>Cancel Estimate</Text>
//             </HoverableCard>
//           </View>

//           {/* Trust Indicators */}
//           <View style={styles.trustSection}>
//             <View style={styles.trustItem}>
//               <Clock color="#60a5fa" size={16} />
//               <Text style={styles.trustText}>Under 30 min response</Text>
//             </View>
//             <View style={styles.trustItem}>
//               <Shield color="#22c55e" size={16} />
//               <Text style={styles.trustText}>Licensed & Insured</Text>
//             </View>
//             <View style={styles.trustItem}>
//               <CheckCircle color="#c084fc" size={16} />
//               <Text style={styles.trustText}>Quality Guaranteed</Text>
//             </View>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
//   header: {
//     alignItems: "center",
//     paddingTop: 60,
//     paddingBottom: 32,
//     position: "relative",
//   },
//   backButton: {
//     position: "absolute",
//     borderRadius: 99,
//     borderColor: "white",
//     borderStyle: "solid",
//     width: 44,
//     height: 44,
//     top: 60,
//     left: 0,
//     padding: 8,
//   },
//   headerBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.1)",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginBottom: 16,
//   },
//   headerBadgeText: { color: "#fff", marginLeft: 8, fontWeight: "500" },
//   title: {
//     fontSize: 32,
//     fontWeight: "900",
//     color: "#fff",
//     textAlign: "center",
//     marginBottom: 8,
//   },
//   subtitle: { fontSize: 16, color: "#e0e7ff", textAlign: "center" },
//   card: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
//   cardTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginLeft: 12 },
//   inputGroup: { marginBottom: 16 },
//   inputRow: { flexDirection: "row", gap: 12 },
//   label: { fontSize: 16, fontWeight: "600", color: "#e0e7ff", marginBottom: 8 },
//   input: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     color: "#fff",
//   },
//   questionText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#fff",
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   optionsContainer: { gap: 12 },
//   optionCard: {
//     backgroundColor: "green",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//     borderRadius: 12,
//     padding: 16,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   optionCardSelected: { backgroundColor: "rgba(255,255,255,0.4)", borderColor: "#22c55e" },
//   optionText: { fontSize: 16, color: "#e0e7ff", flex: 1 },
//   optionTextSelected: { color: "#fff", fontWeight: "600" },
//   otherInput: { marginTop: 12 },
//   summaryCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
//   summaryGradient: { padding: 20 },
//   summaryTitle: { fontSize: 22, fontWeight: "bold", color: "#fff", marginLeft: 12 },
//   priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
//   priceLabel: { fontSize: 16, color: "#e0e7ff" },
//   priceValue: { fontSize: 16, fontWeight: "600", color: "#fff" },
//   divider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 12 },
//   totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
//   totalLabel: { fontSize: 20, fontWeight: "bold", color: "#fff" },
//   totalValue: { fontSize: 24, fontWeight: "900", color: "#22c55e" },
//   coveredSection: { marginTop: 20, padding: 16, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12 },
//   coveredTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 8 },
//   coveredText: { fontSize: 14, color: "#e0e7ff", lineHeight: 20 },
//   guaranteeBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 16,
//     padding: 12,
//     backgroundColor: "rgba(34, 197, 94, 0.2)",
//     borderRadius: 8,
//   },
//   guaranteeText: { color: "#22c55e", fontWeight: "600", marginLeft: 8 },
//   actionContainer: { gap: 12, marginBottom: 32 },
//   primaryButton: { borderRadius: 16, overflow: "hidden" },
//   buttonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 18,
//     paddingHorizontal: 24,
//     gap: 12,
//   },
//   primaryButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
//   secondaryButton: {
//     backgroundColor: "rgba(255, 0, 0, 0.9)",
//     borderWidth: 2,
//     borderColor: "rgba(239, 68, 68, 0.3)",
//     borderRadius: 16,
//     paddingVertical: 16,
//     alignItems: "center",
//   },
//   secondaryButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
//   trustSection: {
//     flexDirection: "column",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 16,
//     gap: 8,
//   },
//   trustItem: { flexDirection: "row", alignItems: "center", gap: 6 },
//   trustText: { color: "#e0e7ff", fontSize: 16, fontWeight: "500" },
// });

//working - Smart Pricing
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Animated,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  MapPin,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  ArrowLeft,
  Zap,
} from "lucide-react-native";

import questionsData, { getCoveredDescription } from "../utils/serviceMatrix.js";
import api from "../api/client";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FEE_RATE = 0.07; // 7% BlinqFix fee
const L = (...args) => console.log("🚑 [EmergencyForm]", ...args);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function HoverableCard({ style, onPress, children }) {
  const scale = useRef(new Animated.Value(1)).current;
  const elevation = useRef(new Animated.Value(2)).current;

  const animate = (toScale, toElev) => {
    Animated.parallel([
      Animated.spring(scale, { toValue: toScale, friction: 6, useNativeDriver: false }),
      Animated.timing(elevation, { toValue: toElev, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animate(0.97, 8)}
      onPressOut={() => animate(1, 2)}
      {...(Platform.OS === "web"
        ? { onHoverIn: () => animate(1.03, 12), onHoverOut: () => animate(1, 2) }
        : {})}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: elevation },
            shadowOpacity: 0.15,
            shadowRadius: elevation,
            elevation,
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function EmergencyForm() {
  const route = useRoute();
  const params = route?.params || {};
  const category = params.category;
  const subcategory = params.subcategory;
  const navigation = useNavigation();

  useEffect(() => {
    L("Mounted. route.name:", route?.name, "params:", params);
  }, [route, params]);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [selectedService, setSelected] = useState(subcategory || "");
  const [answers, setAnswers] = useState({});
  const [otherAnswers, setOtherAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Smart (beta) estimate state
  const [beta, setBeta] = useState(null); // whole response
  const [betaLoading, setBetaLoading] = useState(false);
  const [betaError, setBetaError] = useState("");

  const categoryQuestion = (questionsData.questions[category] || [])[0] || null;
  const serviceQuestions = selectedService ? questionsData.questions[selectedService] || [] : [];

  const detailsForBeta = useMemo(() => {
    const out = {};
    serviceQuestions.forEach((q) => {
      const val = answers[q.id];
      if (!val) return;
      if (val === "Other") {
        const txt = (otherAnswers[q.id] || "").trim();
        if (txt) out[q.question] = txt;
      } else {
        out[q.question] = val;
      }
    });
    return out;
  }, [answers, otherAnswers, serviceQuestions]);

  // Derived money amounts from beta response
  const serviceFeeUSD = Math.max(100, beta?.serviceFeeUSD ?? 0); // enforce min $100
  const smartPriceUSD = beta?.priceUSD ?? 0;
  const subtotal = smartPriceUSD + serviceFeeUSD;
  const convFee = Number((subtotal * FEE_RATE).toFixed(2));
  const grandTotal = Number((subtotal + convFee).toFixed(2));

  useEffect(() => {
    L("Amounts → smartPriceUSD:", smartPriceUSD, "serviceFeeUSD:", serviceFeeUSD, "convFee:", convFee, "grandTotal:", grandTotal);
  }, [smartPriceUSD, serviceFeeUSD, convFee, grandTotal]);

  const handleServiceSelect = (svc) => {
    L("Service selected:", svc);
    setSelected(svc);
    setAnswers({});
    setOtherAnswers({});
    setBeta(null);
    setBetaError("");
  };

  const handleAnswerChange = (qId, val) => {
    L("Answer change:", qId, "→", val);
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };
  const handleOtherChange = (qId, val) => {
    L("Other answer change:", qId, "→", val);
    setOtherAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const fetchCoordinates = async () => {
    try {
      const query = encodeURIComponent(`${address}, ${city}, ${zipcode}`);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      L("Geocode request →", url.replace(/key=[^&]+/, "key=***"));
      const res = await fetch(url);
      const json = await res.json();
      const loc = json.results[0]?.geometry?.location;
      L("Geocode response ok:", Boolean(loc));
      return loc ? [loc.lng, loc.lat] : null;
    } catch (e) {
      L("Geocode failed", e?.message || e);
      return null;
    }
  };

  const registerPushToken = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      L("Push perms:", finalStatus);
      if (finalStatus !== "granted") return;

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      L("Expo push token acquired:", Boolean(token));
      await AsyncStorage.setItem("expoPushToken", token);
    }
  };

  // Debounced call to Smart Estimate API when inputs are ready
  useEffect(() => {
    if (!selectedService) return;
    if (!address.trim() || !city.trim() || !zipcode.trim()) return;

    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        setBetaLoading(true);
        setBetaError("");
        L("Smart estimate → POST start", {
          service: selectedService,
          addr: address,
          city,
          zipcode,
          detailsKeys: Object.keys(detailsForBeta),
        });

        const resp = await api.post("/routes/pricing/v2/estimate", {
          service: selectedService,
          address,
          city,
          zipcode,
          details: detailsForBeta,
        });

        if (cancelled) return;
        const data = resp?.data || {};
        L("Smart estimate → response ok:", data?.ok, "priceUSD:", data?.priceUSD, "serviceFeeUSD:", data?.serviceFeeUSD);
        if (!data.ok) {
          setBeta(null);
          setBetaError(data.error || "Could not fetch estimate");
        } else {
          setBeta(data);
        }
      } catch (err) {
        if (!cancelled) {
          L("Smart estimate failed", err?.response?.data || err?.message || err);
          setBeta(null);
          setBetaError("Could not fetch estimate");
        }
      } finally {
        if (!cancelled) setBetaLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [selectedService, address, city, zipcode, detailsForBeta]);

  const handleSubmit = async () => {
    if (!address.trim() || !city.trim() || !zipcode.trim()) {
      return Alert.alert("Info", "Please enter address, city, and zip code.");
    }
    if (!selectedService) {
      return Alert.alert("Info", "Please choose your specific issue.");
    }
    if (!beta || betaLoading) {
      return Alert.alert("Info", "Getting your smart estimate. Please wait a moment.");
    }

    setSubmitting(true);
    try {
      L("Submit → start");
      const coords = await fetchCoordinates();
      if (!coords) {
        Alert.alert("Error", "Failed to get coordinates from address. Please check your address.");
        setSubmitting(false);
        return;
      }

      await registerPushToken();

      const payload = {
        category,
        service: selectedService,
        address,
        serviceCity: city,
        serviceZipcode: zipcode,
        details: detailsForBeta,

        baseAmount: smartPriceUSD,
        adjustmentAmount: 0,
        rushFee: serviceFeeUSD,
        convenienceFee: convFee,
        estimatedTotal: grandTotal,

        coveredDescription: getCoveredDescription(selectedService),
        smartEstimateV2: { ...beta },
        location: { type: "Point", coordinates: coords },
      };

      L("POST /jobs payload amounts:", {
        baseAmount: payload.baseAmount,
        rushFee: payload.rushFee,
        convenienceFee: payload.convenienceFee,
        estimatedTotal: payload.estimatedTotal,
      });

      const resp = await api.post("/jobs", payload);

      const createdJob = resp?.data?.job || resp?.data;
      const createdJobId = createdJob?._id || createdJob?.id;
      L("POST /jobs response keys:", Object.keys(resp?.data || {}));
      L("POST /jobs extracted jobId:", createdJobId);

      if (!createdJobId) throw new Error("No job id returned from /jobs");

      try {
        await AsyncStorage.setItem("activeJobId", String(createdJobId));
        await AsyncStorage.setItem("lastCreatedJobId", String(createdJobId));
        L("Persisted activeJobId & lastCreatedJobId:", createdJobId);
      } catch (e) {
        L("Persist jobId error:", e?.message || e);
      }

      L("Navigating → PaymentScreen with jobId:", createdJobId);
      navigation.navigate("PaymentScreen", { jobId: String(createdJobId) });
    } catch (err) {
      L("Submit error", err?.response?.data || err?.message || err);
      Alert.alert("Error", "Submission failed – please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEstimate = () => {
    L("Cancel pressed → goBack");
    navigation.goBack();
  };

  useEffect(() => {
    Alert.alert(
      "Note",
      "Enter your address, city, zip code, choose the service, review the estimate, then pay & book."
    );
  }, []);

  const description = useMemo(() => {
    return selectedService ? getCoveredDescription(selectedService) : "";
  }, [selectedService]);

  return (
    <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeft color="#fff" size={24} />
            </Pressable>
            <View style={styles.headerBadge}>
              <Zap color="#facc15" size={16} />
              <Text style={styles.headerBadgeText}>Emergency Request</Text>
            </View>
            <Text style={styles.title}>{category} Emergency Form</Text>
            <Text style={styles.subtitle}>Get connected with a professional in minutes</Text>
          </View>

          {/* Location Section */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MapPin color="#60a5fa" size={24} />
              <Text style={styles.cardTitle}>Service Location</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your address"
                placeholderTextColor="#94a3b8"
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter city"
                  placeholderTextColor="#94a3b8"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Zip Code *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="12345"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={zipcode}
                  onChangeText={setZipcode}
                />
              </View>
            </View>
          </View>

          {/* Service Selection */}
          {!subcategory && categoryQuestion && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Shield color="#4ade80" size={24} />
                <Text style={styles.cardTitle}>Select Your Issue</Text>
              </View>
              <Text style={styles.questionText}>{categoryQuestion.question}</Text>
              <View style={styles.optionsContainer}>
                {categoryQuestion.options.map((svc) => (
                  <HoverableCard
                    key={svc}
                    style={[
                      styles.optionCard,
                      selectedService === svc && styles.optionCardSelected,
                    ]}
                    onPress={() => handleServiceSelect(svc)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedService === svc && styles.optionTextSelected,
                      ]}
                    >
                      {/* {svc} //test payment */}
                      {svc}
                    </Text>
                    {selectedService === svc && <CheckCircle color="#22c55e" size={20} />}
                  </HoverableCard>
                ))}
              </View>
            </View>
          )}

          {/* Service Questions */}
          {selectedService &&
            serviceQuestions.map((q) => {
              const selectedVal = answers[q.id] || "";
              return (
                <View key={q.id} style={styles.card}>
                  <Text style={styles.questionText}>{q.question}</Text>
                  <View style={styles.optionsContainer}>
                    {q.options.map((opt) => (
                      <HoverableCard
                        key={opt.value}
                        style={[
                          styles.optionCard,
                          selectedVal === opt.value && styles.optionCardSelected,
                        ]}
                        onPress={() => handleAnswerChange(q.id, opt.value)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedVal === opt.value && styles.optionTextSelected,
                          ]}
                        >
                          {opt.value}
                        </Text>
                        {selectedVal === opt.value && <CheckCircle color="#22c55e" size={20} />}
                      </HoverableCard>
                    ))}
                    {!q.options.some((o) => o.value === "Other") && (
                      <HoverableCard
                        style={[
                          styles.optionCard,
                          selectedVal === "Other" && styles.optionCardSelected,
                        ]}
                        onPress={() => handleAnswerChange(q.id, "Other")}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedVal === "Other" && styles.optionTextSelected,
                          ]}
                        >
                          Other
                        </Text>
                        {selectedVal === "Other" && <CheckCircle color="#22c55e" size={20} />}
                      </HoverableCard>
                    )}
                  </View>
                  {selectedVal === "Other" && (
                    <TextInput
                      style={[styles.input, styles.otherInput]}
                      placeholder="Please specify..."
                      placeholderTextColor="#94a3b8"
                      value={otherAnswers[q.id] || ""}
                      onChangeText={(txt) => handleOtherChange(q.id, txt)}
                    />
                  )}
                </View>
              );
            })}

          {/* Price Summary (Smart estimate only) */}
          {selectedService && (
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={["rgba(34, 197, 94, 0.1)", "rgba(16, 185, 129, 0.1)"]}
                style={styles.summaryGradient}
              >
                <View style={styles.cardHeader}>
                  <CreditCard color="#22c55e" size={24} />
                  <Text style={styles.summaryTitle}>Price Summary</Text>
                </View>

                {betaLoading && (
                  <Text style={{ color: "#e0e7ff", textAlign: "center", marginBottom: 8 }}>
                    Calculating smart price…
                  </Text>
                )}
                {!!betaError && (
                  <Text style={{ color: "#fecaca", textAlign: "center", marginBottom: 8 }}>
                    {betaError}
                  </Text>
                )}

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Smart Price</Text>
                  <Text style={styles.priceValue}>${(beta?.priceUSD ?? 0).toFixed(2)}</Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Emergency/On-Demand Fee</Text>
                  <Text style={styles.priceValue}>{`$${Math.max(100, beta?.serviceFeeUSD ?? 0).toFixed(2)}`}</Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>
                    BlinqFix Fee ({(FEE_RATE * 100).toFixed(0)}%)
                  </Text>
                  <Text style={styles.priceValue}>${(Number(((beta?.priceUSD ?? 0) + Math.max(100, beta?.serviceFeeUSD ?? 0)) * FEE_RATE)).toFixed(2)}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Estimated Total</Text>
                  <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
                </View>

                <View style={styles.coveredSection}>
                  <Text style={styles.coveredTitle}>What's Covered</Text>
                  <Text style={styles.coveredText}>{getCoveredDescription(selectedService)}</Text>
                </View>

                <View className="guaranteeBadge" style={styles.guaranteeBadge}>
                  <Shield color="#22c55e" size={16} />
                  <Text style={styles.guaranteeText}>100% On-Demand Guaranteed</Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <HoverableCard style={styles.primaryButton} onPress={handleSubmit}>
              <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.buttonGradient}>
                <CreditCard color="#fff" size={20} />
                <Text style={styles.primaryButtonText}>
                  {submitting ? "Processing..." : "Pay & Book Service"}
                </Text>
              </LinearGradient>
            </HoverableCard>

            <HoverableCard style={styles.secondaryButton} onPress={cancelEstimate}>
              <Text style={styles.secondaryButtonText}>Cancel Estimate</Text>
            </HoverableCard>
          </View>

          {/* Trust Indicators */}
          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <Clock color="#60a5fa" size={16} />
              <Text style={styles.trustText}>Under 30 min response</Text>
            </View>
            <View style={styles.trustItem}>
              <Shield color="#22c55e" size={16} />
              <Text style={styles.trustText}>Licensed & Insured</Text>
            </View>
            <View style={styles.trustItem}>
              <CheckCircle color="#c084fc" size={16} />
              <Text style={styles.trustText}>Quality Guaranteed</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 32,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    borderRadius: 99,
    borderColor: "white",
    borderStyle: "solid",
    width: 44,
    height: 44,
    top: 60,
    left: 0,
    padding: 8,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  headerBadgeText: { color: "#fff", marginLeft: 8, fontWeight: "500" },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: "#e0e7ff", textAlign: "center" },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginLeft: 12 },
  inputGroup: { marginBottom: 16 },
  inputRow: { flexDirection: "row", gap: 12 },
  label: { fontSize: 16, fontWeight: "600", color: "#e0e7ff", marginBottom: 8 },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  optionsContainer: { gap: 12 },
  optionCard: {
    backgroundColor: "green",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionCardSelected: { backgroundColor: "rgba(255,255,255,0.4)", borderColor: "#22c55e" },
  optionText: { fontSize: 16, color: "#e0e7ff", flex: 1 },
  optionTextSelected: { color: "#fff", fontWeight: "600" },
  otherInput: { marginTop: 12 },
  summaryCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
  summaryGradient: { padding: 20 },
  summaryTitle: { fontSize: 22, fontWeight: "bold", color: "#fff", marginLeft: 12 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  priceLabel: { fontSize: 16, color: "#e0e7ff" },
  priceValue: { fontSize: 16, fontWeight: "600", color: "#fff" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 12 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  totalLabel: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  totalValue: { fontSize: 24, fontWeight: "900", color: "#22c55e" },
  coveredSection: { marginTop: 20, padding: 16, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12 },
  coveredTitle: { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  coveredText: { fontSize: 14, color: "#e0e7ff", lineHeight: 20 },
  guaranteeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderRadius: 8,
  },
  guaranteeText: { color: "#22c55e", fontWeight: "600", marginLeft: 8 },
  actionContainer: { gap: 12, marginBottom: 32 },
  primaryButton: { borderRadius: 16, overflow: "hidden" },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  secondaryButton: {
    backgroundColor: "rgba(255, 0, 0, 0.9)",
    borderWidth: 2,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  trustSection: {
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  trustText: { color: "#e0e7ff", fontSize: 16, fontWeight: "500" },
});