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
// import { useRoute, useNavigation } from "@react-navigation/native";
// import questionsData, {
//   getBasePrice,
//   estimateTotal,
//   getCoveredDescription,
// } from "../utils/serviceMatrix.js";
// import api from "../api/client";
// import BackButton from "../components/BackButton";
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

//   const registerPushToken = async () => {
//     if (Device.isDevice) {
//       const { status: existingStatus } =
//         await Notifications.getPermissionsAsync();
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
//       if (!coords) {
//         Alert.alert(
//           "Error",
//           "Failed to get coordinates from address. Please check your address."
//         );
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
//         details: finalAns,
//         baseAmount: basePrice,
//         adjustmentAmount: adjustmentTotal,
//         rushFee,
//         convenienceFee: convFee,
//         estimatedTotal: grandTotal,
//         coveredDescription: getCoveredDescription(selectedService),
//         location: { type: "Point", coordinates: coords },
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
//               BlinqFix fee ({(FEE_RATE * 100).toFixed(0)}%): $
//               {convFee.toFixed(2)}
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
//   container: { flex: 1, backgroundColor: "#fff", marginVertical: 0 },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginVertical: 82,
//     textAlign: "center",
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
//   },
//   label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 10,
//   },
//   section: { marginBottom: 16, },
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
  Zap
} from "lucide-react-native";
import questionsData, {
  getBasePrice,
  estimateTotal,
  getCoveredDescription,
} from "../utils/serviceMatrix.js";
import api from "../api/client";
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
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
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
        Alert.alert(
          "Error",
          "Failed to get coordinates from address. Please check your address."
        );
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

  return (
    <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
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
                    <Text style={[
                      styles.optionText,
                      selectedService === svc && styles.optionTextSelected
                    ]}>
                      {svc}
                    </Text>
                    {selectedService === svc && (
                      <CheckCircle color="#22c55e" size={20} />
                    )}
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
                        <Text style={[
                          styles.optionText,
                          selectedVal === opt.value && styles.optionTextSelected
                        ]}>
                          {opt.value}
                        </Text>
                        {selectedVal === opt.value && (
                          <CheckCircle color="#22c55e" size={20} />
                        )}
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
                        <Text style={[
                          styles.optionText,
                          selectedVal === "Other" && styles.optionTextSelected
                        ]}>
                          Other
                        </Text>
                        {selectedVal === "Other" && (
                          <CheckCircle color="#22c55e" size={20} />
                        )}
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

          {/* Price Summary */}
          {selectedService && (
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['rgba(34, 197, 94, 0.1)', 'rgba(16, 185, 129, 0.1)']}
                style={styles.summaryGradient}
              >
                <View style={styles.cardHeader}>
                  <CreditCard color="#22c55e" size={24} />
                  <Text style={styles.summaryTitle}>Price Summary</Text>
                </View>
                
                {/* <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Base Service</Text>
                  <Text style={styles.priceValue}>${basePrice.toFixed(2)}</Text>
                </View>
                
                {adjustmentTotal > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Service Adjustments</Text>
                    <Text style={styles.priceValue}>${adjustmentTotal.toFixed(2)}</Text>
                  </View>
                )}
                
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Emergency Rush Fee</Text>
                  <Text style={styles.priceValue}>${rushFee.toFixed(2)}</Text>
                </View> */}
                
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>BlinqFix Fee ({(FEE_RATE * 100).toFixed(0)}%)</Text>
                  <Text style={styles.priceValue}>${convFee.toFixed(2)}</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Estimated Total</Text>
                  <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
                </View>

                <View style={styles.coveredSection}>
                  <Text style={styles.coveredTitle}>What's Covered</Text>
                  <Text style={styles.coveredText}>{description}</Text>
                </View>

                <View style={styles.guaranteeBadge}>
                  <Shield color="#22c55e" size={16} />
                  <Text style={styles.guaranteeText}>100% Satisfaction Guaranteed</Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <HoverableCard
              style={styles.primaryButton}
              onPress={handleSubmit}
            >
              <LinearGradient
                colors={['#22c55e', '#16a34a']}
                style={styles.buttonGradient}
              >
                <CreditCard color="#fff" size={20} />
                <Text style={styles.primaryButtonText}>
                  {submitting ? "Processing..." : "Pay & Book Service"}
                </Text>
              </LinearGradient>
            </HoverableCard>
            
            <HoverableCard
              style={styles.secondaryButton}
              onPress={cancelEstimate}
            >
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
  container: { 
    flex: 1 
  },
  scrollContent: { 
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    position: 'relative'
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 0,
    padding: 8
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16
  },
  headerBadgeText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500'
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center'
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12
  },
  inputGroup: {
    marginBottom: 16
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e7ff',
    marginBottom: 8
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff'
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center'
  },
  optionsContainer: {
    gap: 12
  },
  optionCard: {
    backgroundColor: 'green',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  optionCardSelected: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderColor: '#22c55e'
  },
  optionText: {
    fontSize: 16,
    color: '#e0e7ff',
    flex: 1
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600'
  },
  otherInput: {
    marginTop: 12
  },
  summaryCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden'
  },
  summaryGradient: {
    padding: 20
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  priceLabel: {
    fontSize: 16,
    color: '#e0e7ff'
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 12
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#22c55e'
  },
  coveredSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12
  },
  coveredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  coveredText: {
    fontSize: 14,
    color: '#e0e7ff',
    lineHeight: 20
  },
  guaranteeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 8
  },
  guaranteeText: {
    color: '#22c55e',
    fontWeight: '600',
    marginLeft: 8
  },
  actionContainer: {
    gap: 12,
    marginBottom: 32
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden'
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  secondaryButton: {
    backgroundColor: 'red',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center'
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  trustText: {
    color: '#e0e7ff',
    fontSize: 12,
    fontWeight: '500'
  }
});