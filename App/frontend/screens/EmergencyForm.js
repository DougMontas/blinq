// import React, { useState, useMemo, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   Alert,
//   StyleSheet,
//   Animated,
//   Pressable,
//   Platform,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import questionsData, {
//   getBasePrice,
//   estimateTotal,
//   getCoveredDescription,
// } from "../utils/serviceMatrix.js";
// import api from "../api/client";
// import BackButton from "../components/BackButton";

// const FEE_RATE = 0.07;

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
//   const { category, subcategory } = useRoute().params || {};
//   const navigation = useNavigation();

//   const [address, setAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [zipcode, setZipcode] = useState("");
//   const [selectedService, setSelected] = useState(subcategory || "");
//   const [answers, setAnswers] = useState({});
//   const [otherAnswers, setOtherAnswers] = useState({});
//   const [submitting, setSubmitting] = useState(false);

//   const categoryQuestion = (questionsData.questions[category] || [])[0] || null;
//   const serviceQuestions = selectedService
//     ? questionsData.questions[selectedService] || []
//     : [];

//   const basePrice = useMemo(
//     () => (selectedService ? getBasePrice(selectedService) : 0),
//     [selectedService]
//   );
//   const answersObj = useMemo(() => {
//     const out = {};
//     serviceQuestions.forEach((q) => {
//       if (answers[q.id] != null) out[q.question] = answers[q.id];
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

//   const handleServiceSelect = (svc) => {
//     setSelected(svc);
//     setAnswers({});
//     setOtherAnswers({});
//   };

//   const handleAnswerChange = (qId, val) =>
//     setAnswers((prev) => ({ ...prev, [qId]: val }));
//   const handleOtherChange = (qId, val) =>
//     setOtherAnswers((prev) => ({ ...prev, [qId]: val }));

//   const handleSubmit = async () => {
//     if (!address.trim() || !city.trim() || !zipcode.trim()) {
//       return Alert.alert("Info", "Please enter address, city, and zip code.");
//     }
//     if (!selectedService) {
//       return Alert.alert("Info", "Please choose your specific issue.");
//     }

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
//       const payload = {
//         category,
//         service: selectedService,
//         address,
//         serviceCity: city,
//         serviceZipcode: zipcode,
//         details: finalAns,
//         baseAmount: basePrice,
//         adjustmentAmount: adjustmentTotal,
//         rushFee,
//         convenienceFee: convFee,
//         estimatedTotal: grandTotal,
//         coveredDescription: getCoveredDescription(selectedService),
//       };
//       const { data: job } = await api.post("/jobs", payload);
//       navigation.navigate("PaymentScreen", { jobId: job._id });
//     } catch (err) {
//       console.error(err.response?.data || err);
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
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={{ padding: 36 }}
//     >
//       <BackButton />
//       <Text style={styles.title}>{category} Request Form</Text>

//       <Text style={styles.label}>Your Address *</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter address"
//         value={address}
//         onChangeText={setAddress}
//       />

//       <Text style={styles.label}>City *</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter city"
//         value={city}
//         onChangeText={setCity}
//       />

//       <Text style={styles.label}>Zip Code *</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter zip code"
//         keyboardType="numeric"
//         value={zipcode}
//         onChangeText={setZipcode}
//       />

//       {!subcategory && categoryQuestion && (
//         <View style={styles.section}>
//           <Text style={styles.label}>{categoryQuestion.question}</Text>
//           {categoryQuestion.options.map((svc) => (
//             <HoverableCard
//               key={svc}
//               style={[
//                 styles.radioRow,
//                 selectedService === svc && styles.radioRowSelected,
//               ]}
//               onPress={() => handleServiceSelect(svc)}
//             >
//               <Text style={styles.radioLabel}>{svc}</Text>
//             </HoverableCard>
//           ))}
//         </View>
//       )}

//       {selectedService &&
//         serviceQuestions.map((q) => {
//           const selectedVal = answers[q.id] || "";
//           return (
//             <View key={q.id} style={styles.section}>
//               <Text style={styles.label}>{q.question}</Text>
//               {q.options.map((opt) => (
//                 <HoverableCard
//                   key={opt.value}
//                   style={[
//                     styles.radioRow,
//                     selectedVal === opt.value && styles.radioRowSelected,
//                   ]}
//                   onPress={() => handleAnswerChange(q.id, opt.value)}
//                 >
//                   <Text style={styles.radioLabel}>{opt.value}</Text>
//                 </HoverableCard>
//               ))}
//               {!q.options.some((o) => o.value === "Other") && (
//                 <HoverableCard
//                   style={[
//                     styles.radioRow,
//                     selectedVal === "Other" && styles.radioRowSelected,
//                   ]}
//                   onPress={() => handleAnswerChange(q.id, "Other")}
//                 >
//                   <Text style={styles.radioLabel}>Other</Text>
//                 </HoverableCard>
//               )}
//               {selectedVal === "Other" && (
//                 <TextInput
//                   style={[styles.input, { marginTop: 8 }]}
//                   placeholder="Please specify"
//                   value={otherAnswers[q.id] || ""}
//                   onChangeText={(txt) => handleOtherChange(q.id, txt)}
//                 />
//               )}
//             </View>
//           );
//         })}

//       {selectedService && (
//         <HoverableCard style={styles.summary}>
//           <Text style={styles.summaryTitle}>Price Summary</Text>
//           <Text style={styles.summaryLine}>
//             Subtotal: ${subtotal.toFixed(2)}
//           </Text>
//           <Text style={styles.fee}>
//             BlinqFix fee ({(FEE_RATE * 100).toFixed(0)}%): ${convFee.toFixed(2)}
//           </Text>
//           <Text style={styles.summaryLine}>
//             <Text style={{ fontWeight: "700" }}>Estimated Total:</Text> $
//             {grandTotal.toFixed(2)}
//           </Text>
//           <Text style={styles.sectionTitle}>What’s Covered:</Text>
//           <Text style={styles.descriptionText}>{description}</Text>
//         </HoverableCard>
//       )}

//       <View style={styles.actionRow}>
//         <HoverableCard
//           style={[styles.btn, styles.btnPrimary]}
//           onPress={handleSubmit}
//         >
//           <Text style={styles.btnText}>
//             {submitting ? "Processing…" : "Pay & Book"}
//           </Text>
//         </HoverableCard>
//         <HoverableCard
//           style={[styles.btn, styles.btnSecondary]}
//           onPress={cancelEstimate}
//         >
//           <Text style={styles.btnText}>Cancel Estimate</Text>
//         </HoverableCard>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", marginVertical: 0 },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginVertical: 12,
//     textAlign: "center",
//   },
//   label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 10,
//   },
//   section: { marginBottom: 16 },
//   radioRow: {
//     paddingVertical: 8,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     marginBottom: 6,
//     paddingHorizontal: 10,
//     backgroundColor: "#fff",
//   },
//   radioRowSelected: {
//     backgroundColor: "#a6e1fa",
//     borderColor: "#1976d2",
//   },
//   radioLabel: { fontSize: 15, textAlign: "center" },
//   summary: {
//     padding: 16,
//     backgroundColor: "#f2f2f2",
//     borderRadius: 8,
//     marginVertical: 16,
//   },
//   summaryTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   summaryLine: { fontSize: 16, marginTop: 6, textAlign: "center" },
//   fee: { textAlign: "center" },
//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 8,
//     textAlign: "center",
//   },
//   btn: {
//     flex: 1,
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   btnPrimary: { backgroundColor: "#1976d2" },
//   btnSecondary: { backgroundColor: "#aaa" },
//   btnText: { color: "#fff", fontWeight: "bold" },
//   sectionTitle: {
//     fontWeight: "bold",
//     marginTop: 20,
//     fontSize: 18,
//     textAlign: "center",
//   },
//   descriptionText: { color: "red", fontSize: 16, textAlign: "center" },
// });

// import React, { useState, useMemo, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   Alert,
//   StyleSheet,
//   Animated,
//   Pressable,
//   Platform,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import questionsData, {
//   getBasePrice,
//   estimateTotal,
//   getCoveredDescription,
// } from "../utils/serviceMatrix.js";
// import api from "../api/client";
// import BackButton from "../components/BackButton";

// const FEE_RATE = 0.07;

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
//   const { category, subcategory } = useRoute().params || {};
//   const navigation = useNavigation();

//   const [address, setAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [zipcode, setZipcode] = useState("");
//   const [selectedService, setSelected] = useState(subcategory || "");
//   const [answers, setAnswers] = useState({});
//   const [otherAnswers, setOtherAnswers] = useState({});
//   const [submitting, setSubmitting] = useState(false);

//   const categoryQuestion = (questionsData.questions[category] || [])[0] || null;
//   const serviceQuestions = selectedService
//     ? questionsData.questions[selectedService] || []
//     : [];

//   const basePrice = useMemo(
//     () => (selectedService ? getBasePrice(selectedService) : 0),
//     [selectedService]
//   );
//   const answersObj = useMemo(() => {
//     const out = {};
//     serviceQuestions.forEach((q) => {
//       if (answers[q.id] != null) out[q.question] = answers[q.id];
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

//   const handleServiceSelect = (svc) => {
//     setSelected(svc);
//     setAnswers({});
//     setOtherAnswers({});
//   };

//   const handleAnswerChange = (qId, val) =>
//     setAnswers((prev) => ({ ...prev, [qId]: val }));
//   const handleOtherChange = (qId, val) =>
//     setOtherAnswers((prev) => ({ ...prev, [qId]: val }));

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

//   const handleSubmit = async () => {
//     if (!address.trim() || !city.trim() || !zipcode.trim()) {
//       return Alert.alert("Info", "Please enter address, city, and zip code.");
//     }
//     if (!selectedService) {
//       return Alert.alert("Info", "Please choose your specific issue.");
//     }

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
//       const payload = {
//         category,
//         service: selectedService,
//         address,
//         serviceCity: city,
//         serviceZipcode: zipcode,
//         details: finalAns,
//         baseAmount: basePrice,
//         adjustmentAmount: adjustmentTotal,
//         rushFee,
//         convenienceFee: convFee,
//         estimatedTotal: grandTotal,
//         coveredDescription: getCoveredDescription(selectedService),
//         location: coords ? { type: "Point", coordinates: coords } : undefined,
//       };
//       const { data: job } = await api.post("/jobs", payload);
//       navigation.navigate("PaymentScreen", { jobId: job._id });
//     } catch (err) {
//       console.error(err.response?.data || err);
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
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={{ padding: 36 }}
//     >
//       <BackButton />
//       <Text style={styles.title}>{category} Request Form</Text>

//       <Text style={styles.label}>Your Address *</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter address"
//         value={address}
//         onChangeText={setAddress}
//       />

//       <Text style={styles.label}>City *</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter city"
//         value={city}
//         onChangeText={setCity}
//       />

//       <Text style={styles.label}>Zip Code *</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter zip code"
//         keyboardType="numeric"
//         value={zipcode}
//         onChangeText={setZipcode}
//       />

//       {!subcategory && categoryQuestion && (
//         <View style={styles.section}>
//           <Text style={styles.label}>{categoryQuestion.question}</Text>
//           {categoryQuestion.options.map((svc) => (
//             <HoverableCard
//               key={svc}
//               style={[
//                 styles.radioRow,
//                 selectedService === svc && styles.radioRowSelected,
//               ]}
//               onPress={() => handleServiceSelect(svc)}
//             >
//               <Text style={styles.radioLabel}>{svc}</Text>
//             </HoverableCard>
//           ))}
//         </View>
//       )}

//       {selectedService &&
//         serviceQuestions.map((q) => {
//           const selectedVal = answers[q.id] || "";
//           return (
//             <View key={q.id} style={styles.section}>
//               <Text style={styles.label}>{q.question}</Text>
//               {q.options.map((opt) => (
//                 <HoverableCard
//                   key={opt.value}
//                   style={[
//                     styles.radioRow,
//                     selectedVal === opt.value && styles.radioRowSelected,
//                   ]}
//                   onPress={() => handleAnswerChange(q.id, opt.value)}
//                 >
//                   <Text style={styles.radioLabel}>{opt.value}</Text>
//                 </HoverableCard>
//               ))}
//               {!q.options.some((o) => o.value === "Other") && (
//                 <HoverableCard
//                   style={[
//                     styles.radioRow,
//                     selectedVal === "Other" && styles.radioRowSelected,
//                   ]}
//                   onPress={() => handleAnswerChange(q.id, "Other")}
//                 >
//                   <Text style={styles.radioLabel}>Other</Text>
//                 </HoverableCard>
//               )}
//               {selectedVal === "Other" && (
//                 <TextInput
//                   style={[styles.input, { marginTop: 8 }]}
//                   placeholder="Please specify"
//                   value={otherAnswers[q.id] || ""}
//                   onChangeText={(txt) => handleOtherChange(q.id, txt)}
//                 />
//               )}
//             </View>
//           );
//         })}

//       {selectedService && (
//         <HoverableCard style={styles.summary}>
//           <Text style={styles.summaryTitle}>Price Summary</Text>
//           <Text style={styles.summaryLine}>
//             Subtotal: ${subtotal.toFixed(2)}
//           </Text>
//           <Text style={styles.fee}>
//             BlinqFix fee ({(FEE_RATE * 100).toFixed(0)}%): ${convFee.toFixed(2)}
//           </Text>
//           <Text style={styles.summaryLine}>
//             <Text style={{ fontWeight: "700" }}>Estimated Total:</Text> $
//             {grandTotal.toFixed(2)}
//           </Text>
//           <Text style={styles.sectionTitle}>What’s Covered:</Text>
//           <Text style={styles.descriptionText}>{description}</Text>
//         </HoverableCard>
//       )}

//       <View style={styles.actionRow}>
//         <HoverableCard
//           style={[styles.btn, styles.btnPrimary]}
//           onPress={handleSubmit}
//         >
//           <Text style={styles.btnText}>
//             {submitting ? "Processing…" : "Pay & Book"}
//           </Text>
//         </HoverableCard>
//         <HoverableCard
//           style={[styles.btn, styles.btnSecondary]}
//           onPress={cancelEstimate}
//         >
//           <Text style={styles.btnText}>Cancel Estimate</Text>
//         </HoverableCard>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", marginVertical: 0 },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginVertical: 12,
//     textAlign: "center",
//   },
//   label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 10,
//   },
//   section: { marginBottom: 16 },
//   radioRow: {
//     paddingVertical: 8,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     marginBottom: 6,
//     paddingHorizontal: 10,
//     backgroundColor: "#fff",
//   },
//   radioRowSelected: {
//     backgroundColor: "#a6e1fa",
//     borderColor: "#1976d2",
//   },
//   radioLabel: { fontSize: 15, textAlign: "center" },
//   summary: {
//     padding: 16,
//     backgroundColor: "#f2f2f2",
//     borderRadius: 8,
//     marginVertical: 16,
//   },
//   summaryTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   summaryLine: { fontSize: 16, marginTop: 6, textAlign: "center" },
//   fee: { textAlign: "center" },
//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 8,
//     textAlign: "center",
//   },
//   btn: {
//     flex: 1,
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   btnPrimary: { backgroundColor: "#1976d2" },
//   btnSecondary: { backgroundColor: "#aaa" },
//   btnText: { color: "#fff", fontWeight: "bold" },
//   sectionTitle: {
//     fontWeight: "bold",
//     marginTop: 20,
//     fontSize: 18,
//     textAlign: "center",
//   },
//   descriptionText: { color: "red", fontSize: 16, textAlign: "center" },
// });

// import React, { useState, useMemo, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   Alert,
//   StyleSheet,
//   Animated,
//   Pressable,
//   Platform,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import questionsData, {
//   getBasePrice,
//   estimateTotal,
//   getCoveredDescription,
// } from "../utils/serviceMatrix.js";
// import api from "../api/client";
// import BackButton from "../components/BackButton";

// const FEE_RATE = 0.07;

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
//   const { category, subcategory } = useRoute().params || {};
//   const navigation = useNavigation();

//   const [address, setAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [zipcode, setZipcode] = useState("");
//   const [selectedService, setSelected] = useState(subcategory || "");
//   const [answers, setAnswers] = useState({});
//   const [otherAnswers, setOtherAnswers] = useState({});
//   const [submitting, setSubmitting] = useState(false);

//   const categoryQuestion = (questionsData.questions[category] || [])[0] || null;
//   const serviceQuestions = selectedService
//     ? questionsData.questions[selectedService] || []
//     : [];

//   const basePrice = useMemo(
//     () => (selectedService ? getBasePrice(selectedService) : 0),
//     [selectedService]
//   );
//   const answersObj = useMemo(() => {
//     const out = {};
//     serviceQuestions.forEach((q) => {
//       if (answers[q.id] != null) out[q.question] = answers[q.id];
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

//   const handleServiceSelect = (svc) => {
//     setSelected(svc);
//     setAnswers({});
//     setOtherAnswers({});
//   };

//   const handleAnswerChange = (qId, val) =>
//     setAnswers((prev) => ({ ...prev, [qId]: val }));
//   const handleOtherChange = (qId, val) =>
//     setOtherAnswers((prev) => ({ ...prev, [qId]: val }));

//   const fetchCoordinates = async () => {
//     try {
//       const query = encodeURIComponent(`${address}, ${city}, ${zipcode}`);
//       const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
//       const res = await fetch(url);
//       const json = await res.json();
//       const loc = json.results[0]?.geometry?.location;
//       console.log("location>>>>:::", loc)
//       return loc ? [loc.lng, loc.lat] : null;
//     } catch (e) {
//       console.warn("Geocode failed", e);
//       return null;
//     }
//   };

//   // const handleSubmit = async () => {
//   //   if (!address.trim() || !city.trim() || !zipcode.trim()) {
//   //     return Alert.alert("Info", "Please enter address, city, and zip code.");
//   //   }
//   //   if (!selectedService) {
//   //     return Alert.alert("Info", "Please choose your specific issue.");
//   //   }

//   //   const finalAns = {};
//   //   serviceQuestions.forEach((q) => {
//   //     const val = answers[q.id];
//   //     if (val === "Other") {
//   //       const txt = (otherAnswers[q.id] || "").trim();
//   //       if (!txt) {
//   //         return Alert.alert(
//   //           "Info",
//   //           `Specify your 'Other' answer for: ${q.question}`
//   //         );
//   //       }
//   //       finalAns[q.question] = txt;
//   //     } else if (val) {
//   //       finalAns[q.question] = val;
//   //     }
//   //   });

//   //   setSubmitting(true);
//   //   try {
//   //     const coords = await fetchCoordinates();
//   //     if (!coords || coords.length !== 2 || coords.some(n => typeof n !== "number" || isNaN(n))) {
//   //       Alert.alert("Error", "Invalid location data. Please check your address and try again.");
//   //       setSubmitting(false);
//   //       return;
//   //     }
      
//   //     const payload = {
//   //       category,
//   //       service: selectedService,
//   //       address,
//   //       serviceCity: city,
//   //       serviceZipcode: zipcode,
//   //       details: finalAns,
//   //       baseAmount: basePrice,
//   //       adjustmentAmount: adjustmentTotal,
//   //       rushFee,
//   //       convenienceFee: convFee,
//   //       estimatedTotal: grandTotal,
//   //       coveredDescription: getCoveredDescription(selectedService),
//   //       location: { type: "Point", coordinates: coords },
//   //     };
//   //     const { data: job } = await api.post("/jobs", payload);
//   //     navigation.navigate("PaymentScreen", { jobId: job._id });
//   //   } catch (err) {
//   //     console.error(err.response?.data || err);
//   //     Alert.alert("Error", "Submission failed – please try again.");
//   //   } finally {
//   //     setSubmitting(false);
//   //   }
//   // };


//   const handleSubmit = async () => {
//     if (!address.trim() || !city.trim() || !zipcode.trim()) {
//       return Alert.alert("Info", "Please enter address, city, and zip code.");
//     }
//     if (!selectedService) {
//       return Alert.alert("Info", "Please choose your specific issue.");
//     }
  
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
//       console.log("📍 Coordinates from geocoding:", coords);
  
//       if (
//         !coords ||
//         !Array.isArray(coords) ||
//         coords.length !== 2 ||
//         coords.some((n) => typeof n !== "number" || isNaN(n))
//       ) {
//         Alert.alert("Error", "Invalid coordinates received from geocoding.");
//         console.warn("⚠️ Invalid geocode result:", coords);
//         setSubmitting(false);
//         return;
//       }
  
//       const payload = {
//         category,
//         service: selectedService,
//         address,
//         serviceCity: city,
//         serviceZipcode: zipcode,
//         details: finalAns,
//         baseAmount: basePrice,
//         adjustmentAmount: adjustmentTotal,
//         rushFee,
//         convenienceFee: convFee,
//         estimatedTotal: grandTotal,
//         coveredDescription: getCoveredDescription(selectedService),
//         location: { type: "Point", coordinates: coords },
//       };
  
//       console.log("📦 Final job payload before POST:", payload);
//       console.log("📦 Sending job payload:", {
//         ...payload,
//         locationCoordinates: payload.location.coordinates,
//         locationType: payload.location.type,
//       });
      
//       const { data: job } = await api.post("/jobs", payload);
//       navigation.navigate("PaymentScreen", { jobId: job._id });
//     } catch (err) {
//       console.error(err.response?.data || err);
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
//         <ScrollView
//           style={styles.container}
//           contentContainerStyle={{ padding: 36 }}
//         >
//           <BackButton />
//           <Text style={styles.title}>{category} Request Form</Text>
    
//           <Text style={styles.label}>Your Address *</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter address"
//             value={address}
//             onChangeText={setAddress}
//           />
    
//           <Text style={styles.label}>City *</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter city"
//             value={city}
//             onChangeText={setCity}
//           />
    
//           <Text style={styles.label}>Zip Code *</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter zip code"
//             keyboardType="numeric"
//             value={zipcode}
//             onChangeText={setZipcode}
//           />
    
//           {!subcategory && categoryQuestion && (
//             <View style={styles.section}>
//               <Text style={styles.label}>{categoryQuestion.question}</Text>
//               {categoryQuestion.options.map((svc) => (
//                 <HoverableCard
//                   key={svc}
//                   style={[
//                     styles.radioRow,
//                     selectedService === svc && styles.radioRowSelected,
//                   ]}
//                   onPress={() => handleServiceSelect(svc)}
//                 >
//                   <Text style={styles.radioLabel}>{svc}</Text>
//                 </HoverableCard>
//               ))}
//             </View>
//           )}
    
//           {selectedService &&
//             serviceQuestions.map((q) => {
//               const selectedVal = answers[q.id] || "";
//               return (
//                 <View key={q.id} style={styles.section}>
//                   <Text style={styles.label}>{q.question}</Text>
//                   {q.options.map((opt) => (
//                     <HoverableCard
//                       key={opt.value}
//                       style={[
//                         styles.radioRow,
//                         selectedVal === opt.value && styles.radioRowSelected,
//                       ]}
//                       onPress={() => handleAnswerChange(q.id, opt.value)}
//                     >
//                       <Text style={styles.radioLabel}>{opt.value}</Text>
//                     </HoverableCard>
//                   ))}
//                   {!q.options.some((o) => o.value === "Other") && (
//                     <HoverableCard
//                       style={[
//                         styles.radioRow,
//                         selectedVal === "Other" && styles.radioRowSelected,
//                       ]}
//                       onPress={() => handleAnswerChange(q.id, "Other")}
//                     >
//                       <Text style={styles.radioLabel}>Other</Text>
//                     </HoverableCard>
//                   )}
//                   {selectedVal === "Other" && (
//                     <TextInput
//                       style={[styles.input, { marginTop: 8 }]}
//                       placeholder="Please specify"
//                       value={otherAnswers[q.id] || ""}
//                       onChangeText={(txt) => handleOtherChange(q.id, txt)}
//                     />
//                   )}
//                 </View>
//               );
//             })}
    
//           {selectedService && (
//             <HoverableCard style={styles.summary}>
//               <Text style={styles.summaryTitle}>Price Summary</Text>
//               <Text style={styles.summaryLine}>
//                 Subtotal: ${subtotal.toFixed(2)}
//               </Text>
//               <Text style={styles.fee}>
//                 BlinqFix fee ({(FEE_RATE * 100).toFixed(0)}%): ${convFee.toFixed(2)}
//               </Text>
//               <Text style={styles.summaryLine}>
//                 <Text style={{ fontWeight: "700" }}>Estimated Total:</Text> $
//                 {grandTotal.toFixed(2)}
//               </Text>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </HoverableCard>
//           )}
    
//           <View style={styles.actionRow}>
//             <HoverableCard
//               style={[styles.btn, styles.btnPrimary]}
//               onPress={handleSubmit}
//             >
//               <Text style={styles.btnText}>
//                 {submitting ? "Processing…" : "Pay & Book"}
//               </Text>
//             </HoverableCard>
//             <HoverableCard
//               style={[styles.btn, styles.btnSecondary]}
//               onPress={cancelEstimate}
//             >
//               <Text style={styles.btnText}>Cancel Estimate</Text>
//             </HoverableCard>
//           </View>
//         </ScrollView>
//       );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", marginVertical: 0 },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginVertical: 12,
//     textAlign: "center",
//   },
//   label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 10,
//   },
//   section: { marginBottom: 16 },
//   radioRow: {
//     paddingVertical: 8,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     marginBottom: 6,
//     paddingHorizontal: 10,
//     backgroundColor: "#fff",
//   },
//   radioRowSelected: {
//     backgroundColor: "#a6e1fa",
//     borderColor: "#1976d2",
//   },
//   radioLabel: { fontSize: 15, textAlign: "center" },
//   summary: {
//     padding: 16,
//     backgroundColor: "#f2f2f2",
//     borderRadius: 8,
//     marginVertical: 16,
//   },
//   summaryTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   summaryLine: { fontSize: 16, marginTop: 6, textAlign: "center" },
//   fee: { textAlign: "center" },
//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 8,
//     textAlign: "center",
//   },
//   btn: {
//     flex: 1,
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   btnPrimary: { backgroundColor: "#1976d2" },
//   btnSecondary: { backgroundColor: "#aaa" },
//   btnText: { color: "#fff", fontWeight: "bold" },
//   sectionTitle: {
//     fontWeight: "bold",
//     marginTop: 20,
//     fontSize: 18,
//     textAlign: "center",
//   },
//   descriptionText: { color: "red", fontSize: 16, textAlign: "center" },
// });


// import React, { useState, useMemo, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   Alert,
//   StyleSheet,
//   Animated,
//   Pressable,
//   Platform,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import questionsData, {
//   getBasePrice,
//   estimateTotal,
//   getCoveredDescription,
// } from "../utils/serviceMatrix.js";
// import api from "../api/client";
// import BackButton from "../components/BackButton";

// const FEE_RATE = 0.07;

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
//   const { category, subcategory } = useRoute().params || {};
//   const navigation = useNavigation();

//   const [address, setAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [zipcode, setZipcode] = useState("");
//   const [selectedService, setSelected] = useState(subcategory || "");
//   const [answers, setAnswers] = useState({});
//   const [otherAnswers, setOtherAnswers] = useState({});
//   const [submitting, setSubmitting] = useState(false);

//   const categoryQuestion = (questionsData.questions[category] || [])[0] || null;
//   const serviceQuestions = selectedService
//     ? questionsData.questions[selectedService] || []
//     : [];

//   const basePrice = useMemo(
//     () => (selectedService ? getBasePrice(selectedService) : 0),
//     [selectedService]
//   );
//   const answersObj = useMemo(() => {
//     const out = {};
//     serviceQuestions.forEach((q) => {
//       if (answers[q.id] != null) out[q.question] = answers[q.id];
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

//   const handleServiceSelect = (svc) => {
//     setSelected(svc);
//     setAnswers({});
//     setOtherAnswers({});
//   };

//   const handleAnswerChange = (qId, val) =>
//     setAnswers((prev) => ({ ...prev, [qId]: val }));
//   const handleOtherChange = (qId, val) =>
//     setOtherAnswers((prev) => ({ ...prev, [qId]: val }));

//   const fetchCoordinates = async () => {
//     try {
//       const query = encodeURIComponent(`${address}, ${city}, ${zipcode}`);
//       const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
//       const res = await fetch(url);
//       const json = await res.json();
//       const loc = json.results[0]?.geometry?.location;
//       console.log("📍 location from Google Maps:", loc);
//       return loc ? [loc.lng, loc.lat] : null;
//     } catch (e) {
//       console.warn("Geocode failed", e);
//       return null;
//     }
//   };

//   const handleSubmit = async () => {
//     if (!address.trim() || !city.trim() || !zipcode.trim()) {
//       return Alert.alert("Info", "Please enter address, city, and zip code.");
//     }
//     if (!selectedService) {
//       return Alert.alert("Info", "Please choose your specific issue.");
//     }

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
//       if (!coords || coords.length !== 2 || coords.some(n => typeof n !== "number" || isNaN(n))) {
//         Alert.alert("Error", "Failed to get coordinates from address. Please check your address.");
//         setSubmitting(false);
//         return;
//       }

//       const payload = {
//         category,
//         service: selectedService,
//         address,
//         serviceCity: city,
//         serviceZipcode: zipcode,
//         details: finalAns,
//         baseAmount: basePrice,
//         adjustmentAmount: adjustmentTotal,
//         rushFee,
//         convenienceFee: convFee,
//         estimatedTotal: grandTotal,
//         coveredDescription: getCoveredDescription(selectedService),
//         location: { type: "Point", coordinates: coords },
//       };

//       console.log("📤 Sending payload:", JSON.stringify(payload, null, 2));

//       const { data: job } = await api.post("/jobs", payload);
//       navigation.navigate("PaymentScreen", { jobId: job._id });
//     } catch (err) {
//       console.error(err.response?.data || err);
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
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={{ padding: 36 }}
//     >
//       <BackButton />
//       <Text style={styles.title}>{category} Request Form</Text>

//       <Text style={styles.label}>Your Address *</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter address"
//         value={address}
//         onChangeText={setAddress}
//       />

//       <Text style={styles.label}>City *</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter city"
//         value={city}
//         onChangeText={setCity}
//       />

//       <Text style={styles.label}>Zip Code *</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Enter zip code"
//         keyboardType="numeric"
//         value={zipcode}
//         onChangeText={setZipcode}
//       />

//       {!subcategory && categoryQuestion && (
//         <View style={styles.section}>
//           <Text style={styles.label}>{categoryQuestion.question}</Text>
//           {categoryQuestion.options.map((svc) => (
//             <HoverableCard
//               key={svc}
//               style={[
//                 styles.radioRow,
//                 selectedService === svc && styles.radioRowSelected,
//               ]}
//               onPress={() => handleServiceSelect(svc)}
//             >
//               <Text style={styles.radioLabel}>{svc}</Text>
//             </HoverableCard>
//           ))}
//         </View>
//       )}

//       {selectedService &&
//         serviceQuestions.map((q) => {
//           const selectedVal = answers[q.id] || "";
//           return (
//             <View key={q.id} style={styles.section}>
//               <Text style={styles.label}>{q.question}</Text>
//               {q.options.map((opt) => (
//                 <HoverableCard
//                   key={opt.value}
//                   style={[
//                     styles.radioRow,
//                     selectedVal === opt.value && styles.radioRowSelected,
//                   ]}
//                   onPress={() => handleAnswerChange(q.id, opt.value)}
//                 >
//                   <Text style={styles.radioLabel}>{opt.value}</Text>
//                 </HoverableCard>
//               ))}
//               {!q.options.some((o) => o.value === "Other") && (
//                 <HoverableCard
//                   style={[
//                     styles.radioRow,
//                     selectedVal === "Other" && styles.radioRowSelected,
//                   ]}
//                   onPress={() => handleAnswerChange(q.id, "Other")}
//                 >
//                   <Text style={styles.radioLabel}>Other</Text>
//                 </HoverableCard>
//               )}
//               {selectedVal === "Other" && (
//                 <TextInput
//                   style={[styles.input, { marginTop: 8 }]}
//                   placeholder="Please specify"
//                   value={otherAnswers[q.id] || ""}
//                   onChangeText={(txt) => handleOtherChange(q.id, txt)}
//                 />
//               )}
//             </View>
//           );
//         })}

//       {selectedService && (
//         <HoverableCard style={styles.summary}>
//           <Text style={styles.summaryTitle}>Price Summary</Text>
//           <Text style={styles.summaryLine}>
//             Subtotal: ${subtotal.toFixed(2)}
//           </Text>
//           <Text style={styles.fee}>
//             BlinqFix fee ({(FEE_RATE * 100).toFixed(0)}%): ${convFee.toFixed(2)}
//           </Text>
//           <Text style={styles.summaryLine}>
//             <Text style={{ fontWeight: "700" }}>Estimated Total:</Text> $
//             {grandTotal.toFixed(2)}
//           </Text>
//           <Text style={styles.sectionTitle}>What’s Covered:</Text>
//           <Text style={styles.descriptionText}>{description}</Text>
//         </HoverableCard>
//       )}

//       <View style={styles.actionRow}>
//         <HoverableCard
//           style={[styles.btn, styles.btnPrimary]}
//           onPress={handleSubmit}
//         >
//           <Text style={styles.btnText}>
//             {submitting ? "Processing…" : "Pay & Book"}
//           </Text>
//         </HoverableCard>
//         <HoverableCard
//           style={[styles.btn, styles.btnSecondary]}
//           onPress={cancelEstimate}
//         >
//           <Text style={styles.btnText}>Cancel Estimate</Text>
//         </HoverableCard>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", marginVertical: 0 },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginVertical: 12,
//     textAlign: "center",
//   },
//   label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 10,
//   },
//   section: { marginBottom: 16 },
//   radioRow: {
//     paddingVertical: 8,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     marginBottom: 6,
//     paddingHorizontal: 10,
//     backgroundColor: "#fff",
//   },
//   radioRowSelected: {
//     backgroundColor: "#a6e1fa",
//     borderColor: "#1976d2",
//   },
//   radioLabel: { fontSize: 15, textAlign: "center" },
//   summary: {
//     padding: 16,
//     backgroundColor: "#f2f2f2",
//     borderRadius: 8,
//     marginVertical: 16,
//   },
//   summaryTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   summaryLine: { fontSize: 16, marginTop: 6, textAlign: "center" },
//   fee: { textAlign: "center" },
//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 8,
//     textAlign: "center",
//   },
//   btn: {
//     flex: 1,
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   btnPrimary: { backgroundColor: "#1976d2" },
//   btnSecondary: { backgroundColor: "red" },
//   btnText: { color: "#fff", fontWeight: "bold" },
//   sectionTitle: {
//     fontWeight: "bold",
//     marginTop: 20,
//     fontSize: 18,
//     textAlign: "center",
//   },
//   descriptionText: { color: "red", fontSize: 16, textAlign: "center" },
// });

// import React, { useState, useMemo, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Alert,
//   StyleSheet,
//   Animated,
//   Pressable,
//   Platform,
//   KeyboardAvoidingView,
//   ScrollView,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import questionsData, {
//   getBasePrice,
//   estimateTotal,
//   getCoveredDescription,
// } from "../utils/serviceMatrix.js";
// import api from "../api/client";
// import BackButton from "../components/BackButton";

// const FEE_RATE = 0.07;

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
//   const { category, subcategory } = useRoute().params || {};
//   const navigation = useNavigation();

//   const [address, setAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [zipcode, setZipcode] = useState("");
//   const [selectedService, setSelected] = useState(subcategory || "");
//   const [answers, setAnswers] = useState({});
//   const [otherAnswers, setOtherAnswers] = useState({});
//   const [submitting, setSubmitting] = useState(false);

//   const categoryQuestion = (questionsData.questions[category] || [])[0] || null;
//   const serviceQuestions = selectedService
//     ? questionsData.questions[selectedService] || []
//     : [];

//   const basePrice = useMemo(
//     () => (selectedService ? getBasePrice(selectedService) : 0),
//     [selectedService]
//   );
//   const answersObj = useMemo(() => {
//     const out = {};
//     serviceQuestions.forEach((q) => {
//       if (answers[q.id] != null) out[q.question] = answers[q.id];
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

//   const handleServiceSelect = (svc) => {
//     setSelected(svc);
//     setAnswers({});
//     setOtherAnswers({});
//   };

//   const handleAnswerChange = (qId, val) =>
//     setAnswers((prev) => ({ ...prev, [qId]: val }));
//   const handleOtherChange = (qId, val) =>
//     setOtherAnswers((prev) => ({ ...prev, [qId]: val }));

//   // const fetchCoordinates = async () => {
//   //   try {
//   //     const query = encodeURIComponent(`${address}, ${city}, ${zipcode}`);
//   //     const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
//   //     const res = await fetch(url);
//   //     const json = await res.json();
//   //     const loc = json.results[0]?.geometry?.location;
//   //     console.log("📍 location from Google Maps:", loc);
//   //     return loc ? [loc.lng, loc.lat] : null;
//   //   } catch (e) {
//   //     console.warn("Geocode failed", e);
//   //     return null;
//   //   }
//   // };

//   const fetchCoordinates = async () => {
//     try {
//       if (!address || !city || !zipcode) {
//         console.warn("⚠️ Missing address/city/zipcode");
//         return null;
//       }
  
//       const query = encodeURIComponent(`${address}, ${city}, ${zipcode}`);
//       const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  
//       if (!key) {
//         console.error("❌ Missing Google Maps API key");
//         return null;
//       }
  
//       const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${key}`;
  
//       const response = await fetch(url);
//       const json = await response.json();
  
//       const loc = json.results?.[0]?.geometry?.location;
  
//       console.log("📍 Geocoded:", loc);
  
//       return loc ? [loc.lng, loc.lat] : null;
//     } catch (err) {
//       console.warn("❌ Geocode failed", err);
//       return null;
//     }
//   };

  
//   const handleSubmit = async () => {
//     if (!address.trim() || !city.trim() || !zipcode.trim()) {
//       return Alert.alert("Info", "Please enter address, city, and zip code.");
//     }
//     if (!selectedService) {
//       return Alert.alert("Info", "Please choose your specific issue.");
//     }

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
//       if (!coords || coords.length !== 2 || coords.some(n => typeof n !== "number" || isNaN(n))) {
//         Alert.alert("Error", "Failed to get coordinates from address. Please check your address.");
//         setSubmitting(false);
//         return;
//       }

//       const payload = {
//         category,
//         service: selectedService,
//         address,
//         serviceCity: city,
//         serviceZipcode: zipcode,
//         details: finalAns,
//         baseAmount: basePrice,
//         adjustmentAmount: adjustmentTotal,
//         rushFee,
//         convenienceFee: convFee,
//         estimatedTotal: grandTotal,
//         coveredDescription: getCoveredDescription(selectedService),
//         location: { type: "Point", coordinates: coords },
//       };

//       console.log("📤 Sending payload:", JSON.stringify(payload, null, 2));

//       const { data: job } = await api.post("/jobs", payload);
//       navigation.navigate("PaymentScreen", { jobId: job._id });
//     } catch (err) {
//       console.error(err.response?.data || err);
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
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       keyboardVerticalOffset={100}
//     >
//       <ScrollView
//         style={styles.container}
//         contentContainerStyle={{ padding: 36 }}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         <BackButton />
//         <Text style={styles.title}>{category} Request Form</Text>

//         <Text style={styles.label}>Your Address *</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter address"
//           value={address}
//           onChangeText={setAddress}
//         />

//         <Text style={styles.label}>City *</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter city"
//           value={city}
//           onChangeText={setCity}
//         />

//         <Text style={styles.label}>Zip Code *</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter zip code"
//           keyboardType="numeric"
//           value={zipcode}
//           onChangeText={setZipcode}
//         />

//         {!subcategory && categoryQuestion && (
//           <View style={styles.section}>
//             <Text style={styles.label}>{categoryQuestion.question}</Text>
//             {categoryQuestion.options.map((svc) => (
//               <HoverableCard
//                 key={svc}
//                 style={[
//                   styles.radioRow,
//                   selectedService === svc && styles.radioRowSelected,
//                 ]}
//                 onPress={() => handleServiceSelect(svc)}
//               >
//                 <Text style={styles.radioLabel}>{svc}</Text>
//               </HoverableCard>
//             ))}
//           </View>
//         )}

//         {selectedService &&
//           serviceQuestions.map((q) => {
//             const selectedVal = answers[q.id] || "";
//             return (
//               <View key={q.id} style={styles.section}>
//                 <Text style={styles.label}>{q.question}</Text>
//                 {q.options.map((opt) => (
//                   <HoverableCard
//                     key={opt.value}
//                     style={[
//                       styles.radioRow,
//                       selectedVal === opt.value && styles.radioRowSelected,
//                     ]}
//                     onPress={() => handleAnswerChange(q.id, opt.value)}
//                   >
//                     <Text style={styles.radioLabel}>{opt.value}</Text>
//                   </HoverableCard>
//                 ))}
//                 {!q.options.some((o) => o.value === "Other") && (
//                   <HoverableCard
//                     style={[
//                       styles.radioRow,
//                       selectedVal === "Other" && styles.radioRowSelected,
//                     ]}
//                     onPress={() => handleAnswerChange(q.id, "Other")}
//                   >
//                     <Text style={styles.radioLabel}>Other</Text>
//                   </HoverableCard>
//                 )}
//                 {selectedVal === "Other" && (
//                   <TextInput
//                     style={[styles.input, { marginTop: 8 }]}
//                     placeholder="Please specify"
//                     value={otherAnswers[q.id] || ""}
//                     onChangeText={(txt) => handleOtherChange(q.id, txt)}
//                   />
//                 )}
//               </View>
//             );
//           })}

//         {selectedService && (
//           <HoverableCard style={styles.summary}>
//             <Text style={styles.summaryTitle}>Price Summary</Text>
//             <Text style={styles.summaryLine}>
//               Subtotal: ${subtotal.toFixed(2)}
//             </Text>
//             <Text style={styles.fee}>
//               BlinqFix fee ({(FEE_RATE * 100).toFixed(0)}%): ${convFee.toFixed(2)}
//             </Text>
//             <Text style={styles.summaryLine}>
//               <Text style={{ fontWeight: "700" }}>Estimated Total:</Text> $
//               {grandTotal.toFixed(2)}
//             </Text>
//             <Text style={styles.sectionTitle}>What’s Covered:</Text>
//             <Text style={styles.descriptionText}>{description}</Text>
//           </HoverableCard>
//         )}

//         <View style={styles.actionRow}>
//           <HoverableCard
//             style={[styles.btn, styles.btnPrimary]}
//             onPress={handleSubmit}
//           >
//             <Text style={styles.btnText}>
//               {submitting ? "Processing…" : "Pay & Book"}
//             </Text>
//           </HoverableCard>
//           <HoverableCard
//             style={[styles.btn, styles.btnSecondary]}
//             onPress={cancelEstimate}
//           >
//             <Text style={styles.btnText}>Cancel Estimate</Text>
//           </HoverableCard>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }


// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: "#fff", marginVertical: 0 },
//     title: {
//       fontSize: 24,
//       fontWeight: "bold",
//       marginVertical: 12,
//       textAlign: "center",
//     },
//     label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
//     input: {
//       borderWidth: 1,
//       borderColor: "#ccc",
//       borderRadius: 6,
//       padding: 10,
//       marginBottom: 10,
//     },
//     section: { marginBottom: 16 },
//     radioRow: {
//       paddingVertical: 8,
//       borderWidth: 1,
//       borderColor: "#ccc",
//       borderRadius: 6,
//       marginBottom: 6,
//       paddingHorizontal: 10,
//       backgroundColor: "#fff",
//     },
//     radioRowSelected: {
//       backgroundColor: "#a6e1fa",
//       borderColor: "#1976d2",
//     },
//     radioLabel: { fontSize: 15, textAlign: "center" },
//     summary: {
//       padding: 16,
//       backgroundColor: "#f2f2f2",
//       borderRadius: 8,
//       marginVertical: 16,
//     },
//     summaryTitle: {
//       fontSize: 18,
//       fontWeight: "700",
//       marginBottom: 8,
//       textAlign: "center",
//     },
//     summaryLine: { fontSize: 16, marginTop: 6, textAlign: "center" },
//     fee: { textAlign: "center" },
//     actionRow: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       gap: 8,
//       textAlign: "center",
//     },
//     btn: {
//       flex: 1,
//       padding: 14,
//       borderRadius: 8,
//       alignItems: "center",
//     },
//     btnPrimary: { backgroundColor: "#1976d2" },
//     btnSecondary: { backgroundColor: "red" },
//     btnText: { color: "#fff", fontWeight: "bold" },
//     sectionTitle: {
//       fontWeight: "bold",
//       marginTop: 20,
//       fontSize: 18,
//       textAlign: "center",
//     },
//     descriptionText: { color: "red", fontSize: 16, textAlign: "center" },
//   });

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
  Animated,
  Pressable,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import questionsData, {
  getBasePrice,
  estimateTotal,
  getCoveredDescription,
} from "../utils/serviceMatrix.js";
import api from "../api/client";
import BackButton from "../components/BackButton";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FEE_RATE = 0.07;

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
      Animated.spring(scale, {
        toValue: toScale,
        friction: 6,
        useNativeDriver: false,
      }),
      Animated.timing(elevation, {
        toValue: toElev,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animate(0.97, 8)}
      onPressOut={() => animate(1, 2)}
      {...(Platform.OS === "web"
        ? {
            onHoverIn: () => animate(1.03, 12),
            onHoverOut: () => animate(1, 2),
          }
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
  const { category, subcategory } = useRoute().params || {};
  const navigation = useNavigation();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [selectedService, setSelected] = useState(subcategory || "");
  const [answers, setAnswers] = useState({});
  const [otherAnswers, setOtherAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const categoryQuestion = (questionsData.questions[category] || [])[0] || null;
  const serviceQuestions = selectedService
    ? questionsData.questions[selectedService] || []
    : [];

  const basePrice = useMemo(
    () => (selectedService ? getBasePrice(selectedService) : 0),
    [selectedService]
  );
  const answersObj = useMemo(() => {
    const out = {};
    serviceQuestions.forEach((q) => {
      if (answers[q.id] != null) out[q.question] = answers[q.id];
    });
    return out;
  }, [answers, serviceQuestions]);

  const adjustmentTotal = useMemo(
    () => (selectedService ? estimateTotal(selectedService, answersObj) : 0),
    [selectedService, answersObj]
  );
  const rushFee = selectedService ? 100 : 0;
  const subtotal = basePrice + adjustmentTotal + rushFee;
  const convFee = Number((subtotal * FEE_RATE).toFixed(2));
  const grandTotal = Number((subtotal + convFee).toFixed(2));

  const handleServiceSelect = (svc) => {
    setSelected(svc);
    setAnswers({});
    setOtherAnswers({});
  };

  const handleAnswerChange = (qId, val) =>
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  const handleOtherChange = (qId, val) =>
    setOtherAnswers((prev) => ({ ...prev, [qId]: val }));

  const fetchCoordinates = async () => {
    try {
      const query = encodeURIComponent(`${address}, ${city}, ${zipcode}`);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      const loc = json.results[0]?.geometry?.location;
      return loc ? [loc.lng, loc.lat] : null;
    } catch (e) {
      console.warn("Geocode failed", e);
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
      if (finalStatus !== "granted") return;

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      await AsyncStorage.setItem("expoPushToken", token);
    }
  };

  const handleSubmit = async () => {
    if (!address.trim() || !city.trim() || !zipcode.trim()) {
      return Alert.alert("Info", "Please enter address, city, and zip code.");
    }
    if (!selectedService) {
      return Alert.alert("Info", "Please choose your specific issue.");
    }

    const finalAns = {};
    serviceQuestions.forEach((q) => {
      const val = answers[q.id];
      if (val === "Other") {
        const txt = (otherAnswers[q.id] || "").trim();
        if (!txt) {
          return Alert.alert(
            "Info",
            `Specify your 'Other' answer for: ${q.question}`
          );
        }
        finalAns[q.question] = txt;
      } else if (val) {
        finalAns[q.question] = val;
      }
    });

    setSubmitting(true);
    try {
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
        details: finalAns,
        baseAmount: basePrice,
        adjustmentAmount: adjustmentTotal,
        rushFee,
        convenienceFee: convFee,
        estimatedTotal: grandTotal,
        coveredDescription: getCoveredDescription(selectedService),
        location: { type: "Point", coordinates: coords },
      };
      const { data: job } = await api.post("/jobs", payload);
      navigation.navigate("PaymentScreen", { jobId: job._id });
    } catch (err) {
      console.error(err.response?.data || err);
      Alert.alert("Error", "Submission failed – please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEstimate = () => navigation.goBack();

  useEffect(() => {
    Alert.alert(
      "Note",
      "Enter your address, city, zip code, choose the issue, review the estimate (including the 7% BlinqFix fee), then pay & book."
    );
  }, []);

  const description = useMemo(() => {
    return selectedService ? getCoveredDescription(selectedService) : "";
  }, [selectedService]);

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", marginVertical: 0 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 12,
    textAlign: "center",
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  section: { marginBottom: 16 },
  radioRow: {
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 6,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  radioRowSelected: {
    backgroundColor: "#a6e1fa",
    borderColor: "#1976d2",
  },
  radioLabel: { fontSize: 15, textAlign: "center" },
  summary: {
    padding: 16,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginVertical: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  summaryLine: { fontSize: 16, marginTop: 6, textAlign: "center" },
  fee: { textAlign: "center" },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    textAlign: "center",
  },
  btn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnPrimary: { backgroundColor: "#1976d2" },
  btnSecondary: { backgroundColor: "#aaa" },
  btnText: { color: "#fff", fontWeight: "bold" },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 20,
    fontSize: 18,
    textAlign: "center",
  },
  descriptionText: { color: "red", fontSize: 16, textAlign: "center" },
});
