//previous
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
import BackButton from "../components/BackButton.js";

// import { estimateTotal } from "../utils/serviceMatrix";

// const zip = user.zipcode || user.serviceZirpcode; // or wherever the zip is sourced from
// const zipMultiplier = await fetchZipMultiplier(zip);
// const totalEstimate = estimateTotal(service, answers, zipMultiplier);

// then use totalEstimate as needed...

// const [job, setJob] = useState(null);
const FEE_RATE = 0.07; // 7%

// a reusable hover/press card
export function HoverableCard({ style, onPress, children }) {
  const scale = useRef(new Animated.Value(1)).current;
  const elevation = useRef(new Animated.Value(2)).current;

  const animate = (toScale, toElev) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: toScale,
        friction: 6,
        useNativeDriver: false, // JS-driven animation
      }),
      Animated.timing(elevation, {
        toValue: toElev,
        duration: 200,
        useNativeDriver: false, // JS-driven animation
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
            useNativeDriver: false,
            elevation, // android
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function EmergencyForm() {
  const { category } = useRoute().params || {};
  const navigation = useNavigation();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [selectedService, setSelected] = useState("");
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
    setAnswers((p) => ({ ...p, [qId]: val }));
  const handleOtherChange = (qId, val) =>
    setOtherAnswers((p) => ({ ...p, [qId]: val }));

  // const handleSubmit = async () => {
  //   if (!address.trim() || !city.trim() || !zipcode.trim()) {
  //     return Alert.alert("Info", "Please enter address, city, and zip code.");
  //   }
  //   if (!selectedService) {
  //     return Alert.alert("Info", "Please choose your specific issue.");
  //   }
  //   // finalize Other
  //   const finalAns = { ...answersObj };
  //   for (const [qid, v] of Object.entries(finalAns)) {
  //     if (v === "Other") {
  //       const txt = (otherAnswers[qid] || "").trim();
  //       if (!txt)
  //         return Alert.alert("Info", "Please specify your 'Other' answer.");
  //       finalAns[qid] = txt;
  //     }
  //   }

  //   setSubmitting(true);
  //   try {
  //     const payload = {
  //       category,
  //       service: selectedService,
  //       address,
  //       serviceCity: city,
  //       serviceZipcode: zipcode,
  //       details: finalAns,
  //       baseAmount: basePrice,
  //       adjustmentAmount: adjustmentTotal,
  //       rushFee,
  //       convenienceFee: convFee,
  //       estimatedTotal: grandTotal,
  //       coveredDescription: getCoveredDescription(selectedService),
  //     };
  //     const { data: job } = await api.post("/jobs", payload);
  //     navigation.navigate("PaymentScreen", { jobId: job._id });
  //   } catch (err) {
  //     console.error(err.response?.data || err);
  //     Alert.alert("Error", "Submission failed – please try again.");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleSubmit = async () => {
    if (!address.trim() || !city.trim() || !zipcode.trim()) {
      return Alert.alert("Info", "Please enter address, city, and zip code.");
    }
    if (!selectedService) {
      return Alert.alert("Info", "Please choose your specific issue.");
    }

    // Merge answers and resolve 'Other' selections
    const finalAns = {};
    serviceQuestions.forEach((q) => {
      const val = answers[q.id];
      if (val === "Other") {
        const txt = (otherAnswers[q.id] || "").trim();
        if (!txt) {
          return Alert.alert(
            "Info",
            `Please specify your 'Other' answer for: ${q.question}`
          );
        }
        finalAns[q.question] = txt;
      } else if (val) {
        finalAns[q.question] = val;
      }
    });

    setSubmitting(true);
    try {
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 36 }}
    >
      <BackButton />
      <Text style={styles.title}>{category} Emergency Form</Text>

      {/* Address */}
      <Text style={styles.label}>Your Address *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter address"
        value={address}
        onChangeText={setAddress}
      />

      {/* City */}
      <Text style={styles.label}>City *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter city"
        value={city}
        onChangeText={setCity}
      />

      {/* Zip Code */}
      <Text style={styles.label}>Zip Code *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter zip code"
        keyboardType="numeric"
        value={zipcode}
        onChangeText={setZipcode}
      />

      {/* Tier-1 */}
      {categoryQuestion && (
        <View style={styles.section}>
          <Text style={styles.label}>{categoryQuestion.question}</Text>
          {categoryQuestion.options.map((svc) => (
            <HoverableCard
              key={svc}
              style={[
                styles.radioRow,
                selectedService === svc && styles.radioRowSelected,
              ]}
              onPress={() => handleServiceSelect(svc)}
            >
              <Text style={styles.radioLabel}>Click to start estimate</Text>
            </HoverableCard>
          ))}
        </View>
      )}

      {/* Tier-2 */}
      {selectedService &&
        serviceQuestions.map((q) => {
          const selectedVal = answers[q.id] || "";
          return (
            <View key={q.id} style={styles.section}>
              <Text style={styles.label}>{q.question}</Text>
              {q.options.map((opt) => (
                <HoverableCard
                  key={opt.value}
                  style={[
                    styles.radioRow,
                    selectedVal === opt.value && styles.radioRowSelected,
                  ]}
                  onPress={() => handleAnswerChange(q.id, opt.value)}
                >
                  <Text style={styles.radioLabel}>{opt.value}</Text>
                </HoverableCard>
              ))}
              {!q.options.some((o) => o.value === "Other") && (
                <HoverableCard
                  style={[
                    styles.radioRow,
                    selectedVal === "Other" && styles.radioRowSelected,
                  ]}
                  onPress={() => handleAnswerChange(q.id, "Other")}
                >
                  <Text style={styles.radioLabel}>Other</Text>
                </HoverableCard>
              )}
              {selectedVal === "Other" && (
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  placeholder="Please specify"
                  value={otherAnswers[q.id] || ""}
                  onChangeText={(txt) => handleOtherChange(q.id, txt)}
                />
              )}
            </View>
          );
        })}

      {/* Price Summary */}
      {selectedService && (
        <HoverableCard style={styles.summary}>
          <Text style={styles.summaryTitle}>Price Summary</Text>
          {/* <Text>Base price: ${basePrice.toFixed(2)}</Text>
          <Text>Adjustments: ${adjustmentTotal.toFixed(2)}</Text>
          <Text>Rush fee: ${rushFee.toFixed(2)}</Text> */}
          <Text style={styles.summaryLine}>
            Subtotal: ${subtotal.toFixed(2)}
          </Text>
          <Text style={styles.fee}>
            BlinqFix fee ({(FEE_RATE * 100).toFixed(0)}%): ${convFee.toFixed(2)}
          </Text>
          <Text style={styles.summaryLine}>
            <Text style={{ fontWeight: "700" }}>Estimated Total:</Text> $
            {grandTotal.toFixed(2)}
          </Text>
          <Text style={styles.sectionTitle}>What’s Covered:</Text>
          <Text style={styles.descriptionText}>{description}</Text>
          <Text>{"\n"}</Text>
          
          <Text style={styles.titleHeading}>
            ** Make sure all provided info are accurate. We will not be
            responsible for typos or incorrect info. **{" "}
          </Text>
        </HoverableCard>
      )}

      {/* Actions */}
      <View style={styles.actionRow}>
        <HoverableCard
          style={[styles.btn, styles.btnPrimary]}
          onPress={handleSubmit}
        >
          <Text style={styles.btnText}>
            {submitting ? "Processing…" : "Pay & Book"}
          </Text>
        </HoverableCard>
        <HoverableCard
          style={[styles.btn, styles.btnSecondary]}
          onPress={cancelEstimate}
        >
          <Text style={styles.btnText}>Cancel Estimate</Text>
        </HoverableCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", marginVertical: 52 },
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
  radioLabel: { fontSize: 15,textAlign: "center", },
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
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    textAlign: "center",
  },
  fee: {
    textAlign: "center",
  },
  btn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#1976d2",
  },
  btnPrimary: { backgroundColor: "#1976d2" },
  btnSecondary: { backgroundColor: "#aaa" },
  btnText: { color: "#fff", fontWeight: "bold" },
  titleHeading: {
    fontSize: 12,
    color: "red",
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
});

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
//   fetchZipMultiplier, // ✅ ensure this is imported
// } from "../utils/serviceMatrix.js";
// import api from "../api/client";
// import BackButton from "../components/BackButton.js";

// const FEE_RATE = 0.07;

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
//       {...(Platform.OS === "web" ? {
//         onHoverIn: () => animate(1.03, 12),
//         onHoverOut: () => animate(1, 2),
//       } : {})}
//     >
//       <Animated.View style={[style, {
//         transform: [{ scale }],
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: elevation },
//         shadowOpacity: 0.15,
//         shadowRadius: elevation,
//         elevation,
//       }]}>
//         {children}
//       </Animated.View>
//     </Pressable>
//   );
// }

// export default function EmergencyForm() {
//   const { category } = useRoute().params || {};
//   const navigation = useNavigation();

//   const [address, setAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [zipcode, setZipcode] = useState("");
//   const [selectedService, setSelected] = useState("");
//   const [answers, setAnswers] = useState({});
//   const [otherAnswers, setOtherAnswers] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [zipMultiplier, setZipMultiplier] = useState(1); // ✅ new

//   useEffect(() => {
//     if (zipcode.length === 5) {
//       fetchZipMultiplier(zipcode)
//         .then(setZipMultiplier)
//         .catch(() => setZipMultiplier(1));
//     }
//   }, [zipcode]);

//   const categoryQuestion = (questionsData.questions[category] || [])[0] || null;
//   const serviceQuestions = selectedService ? questionsData.questions[selectedService] || [] : [];

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
//     () => selectedService ? estimateTotal(selectedService, answersObj, zipMultiplier) : 0,
//     [selectedService, answersObj, zipMultiplier]
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
//     setAnswers((p) => ({ ...p, [qId]: val }));

//   const handleOtherChange = (qId, val) =>
//     setOtherAnswers((p) => ({ ...p, [qId]: val }));

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
//           return Alert.alert("Info", `Please specify your 'Other' answer for: ${q.question}`);
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
//       "Enter your address, city, zip code, choose the issue, review the estimate (including the 7% convenience fee), then pay & book."
//     );
//   }, []);

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ padding: 36 }}>
//       <BackButton />
//       <Text style={styles.title}>{category} Emergency Form</Text>

//       <Text style={styles.label}>Your Address *</Text>
//       <TextInput style={styles.input} placeholder="Enter address" value={address} onChangeText={setAddress} />

//       <Text style={styles.label}>City *</Text>
//       <TextInput style={styles.input} placeholder="Enter city" value={city} onChangeText={setCity} />

//       <Text style={styles.label}>Zip Code *</Text>
//       <TextInput style={styles.input} placeholder="Enter zip code" keyboardType="numeric" value={zipcode} onChangeText={setZipcode} />

//       {categoryQuestion && (
//         <View style={styles.section}>
//           <Text style={styles.label}>{categoryQuestion.question}</Text>
//           {categoryQuestion.options.map((svc) => (
//             <HoverableCard
//               key={svc}
//               style={[styles.radioRow, selectedService === svc && styles.radioRowSelected]}
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
//           <Text style={styles.titleHeading}>** Make sure all provided info is accurate. We will not be responsible for typos or incorrect info. **</Text>
//           <Text style={styles.summaryTitle}>Price Summary</Text>
//           <Text style={styles.summaryLine}>Subtotal: ${subtotal.toFixed(2)}</Text>
//           <Text>
//             Convenience fee ({(FEE_RATE * 100).toFixed(0)}%): ${convFee.toFixed(2)}
//           </Text>
//           <Text style={styles.summaryLine}>
//             <Text style={{ fontWeight: "700" }}>Estimated Total:</Text> ${grandTotal.toFixed(2)}
//           </Text>
//         </HoverableCard>
//       )}

//       <View style={styles.actionRow}>
//         <HoverableCard style={[styles.btn, styles.btnPrimary]} onPress={handleSubmit}>
//           <Text style={styles.btnText}>{submitting ? "Processing…" : "Pay & Book"}</Text>
//         </HoverableCard>
//         <HoverableCard style={[styles.btn, styles.btnSecondary]} onPress={cancelEstimate}>
//           <Text style={styles.btnText}>Cancel Estimate</Text>
//         </HoverableCard>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", marginVertical: 52 },
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
//   radioLabel: { fontSize: 15 },
//   summary: {
//     padding: 16,
//     backgroundColor: "#f2f2f2",
//     borderRadius: 8,
//     marginVertical: 16,
//   },
//   summaryTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
//   summaryLine: { fontSize: 16, marginTop: 6 },
//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 8,
//   },
//   btn: {
//     flex: 1,
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//     backgroundColor: "#1976d2",
//   },
//   btnPrimary: { backgroundColor: "#1976d2" },
//   btnSecondary: { backgroundColor: "#aaa" },
//   btnText: { color: "#fff", fontWeight: "bold" },
//   titleHeading: {
//     fontSize: 12,
//     color: "red",
//     textAlign: "center",
//   },
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
//   fetchZipMultiplier,
// } from "../utils/serviceMatrix.js";
// import api from "../api/client";
// import BackButton from "../components/BackButton.js";

// const FEE_RATE = 0.07;

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
//         ? {
//             onHoverIn: () => animate(1.03, 12),
//             onHoverOut: () => animate(1, 2),
//           }
//         : {})}
//     >
//       <Animated.View style={[style, {
//         transform: [{ scale }],
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: elevation },
//         shadowOpacity: 0.15,
//         shadowRadius: elevation,
//         elevation,
//       }]}>
//         {children}
//       </Animated.View>
//     </Pressable>
//   );
// }

// export default function EmergencyForm() {
//   const { category } = useRoute().params || {};
//   const navigation = useNavigation();

//   const [address, setAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [zipcode, setZipcode] = useState("");
//   const [selectedService, setSelected] = useState("");
//   const [answers, setAnswers] = useState({});
//   const [otherAnswers, setOtherAnswers] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [zipMultiplier, setZipMultiplier] = useState(1.0);
//   const [adjustedEstimate, setAdjustedEstimate] = useState(0);

//   const categoryQuestion = (questionsData.questions[category] || [])[0] || null;
//   const serviceQuestions = selectedService ? questionsData.questions[selectedService] || [] : [];

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

//   useEffect(() => {
//     const computeEstimate = async () => {
//       if (!selectedService || !zipcode.trim()) return;
//       try {
//         const multiplier = await fetchZipMultiplier(zipcode);
//         setZipMultiplier(multiplier);
//         const estimate = estimateTotal(selectedService, answersObj, multiplier);
//         setAdjustedEstimate(estimate);
//       } catch (err) {
//         console.error("Multiplier calc failed:", err);
//         setZipMultiplier(1.0);
//         setAdjustedEstimate(estimateTotal(selectedService, answersObj));
//       }
//     };

//     computeEstimate();
//   }, [selectedService, zipcode, answersObj]);

//   const rushFee = selectedService ? 100 : 0;
//   const subtotal = basePrice + adjustedEstimate + rushFee;
//   const convFee = Number((subtotal * FEE_RATE).toFixed(2));
//   const grandTotal = Number((subtotal + convFee).toFixed(2));

//   const handleServiceSelect = (svc) => {
//     setSelected(svc);
//     setAnswers({});
//     setOtherAnswers({});
//   };

//   const handleAnswerChange = (qId, val) =>
//     setAnswers((p) => ({ ...p, [qId]: val }));

//   const handleOtherChange = (qId, val) =>
//     setOtherAnswers((p) => ({ ...p, [qId]: val }));

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
//           return Alert.alert("Info", `Please specify your 'Other' answer for: ${q.question}`);
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
//         adjustmentAmount: adjustedEstimate,
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
//       "Enter your address, city, zip code, choose the issue, review the estimate (including the 7% convenience fee), then pay & book."
//     );
//   }, []);

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ padding: 36 }}>
//       <BackButton />
//       <Text style={styles.title}>{category} Emergency Form</Text>

//       <Text style={styles.label}>Your Address *</Text>
//       <TextInput style={styles.input} placeholder="Enter address" value={address} onChangeText={setAddress} />

//       <Text style={styles.label}>City *</Text>
//       <TextInput style={styles.input} placeholder="Enter city" value={city} onChangeText={setCity} />

//       <Text style={styles.label}>Zip Code *</Text>
//       <TextInput style={styles.input} placeholder="Enter zip code" keyboardType="numeric" value={zipcode} onChangeText={setZipcode} />

//       {categoryQuestion && (
//         <View style={styles.section}>
//           <Text style={styles.label}>{categoryQuestion.question}</Text>
//           {categoryQuestion.options.map((svc) => (
//             <HoverableCard
//               key={svc}
//               style={[styles.radioRow, selectedService === svc && styles.radioRowSelected]}
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
//           <Text style={styles.titleHeading}>** Make sure all provided info is accurate. We will not be responsible for typos or incorrect info. **</Text>
//           <Text style={styles.summaryTitle}>Price Summary</Text>
//           <Text style={styles.summaryLine}>Subtotal: ${subtotal.toFixed(2)}</Text>
//           <Text>
//             Convenience fee ({(FEE_RATE * 100).toFixed(0)}%): ${convFee.toFixed(2)}
//           </Text>
//           <Text style={styles.summaryLine}>
//             <Text style={{ fontWeight: "700" }}>Estimated Total:</Text> ${grandTotal.toFixed(2)}
//           </Text>
//         </HoverableCard>
//       )}

//       <View style={styles.actionRow}>
//         <HoverableCard style={[styles.btn, styles.btnPrimary]} onPress={handleSubmit}>
//           <Text style={styles.btnText}>{submitting ? "Processing…" : "Pay & Book"}</Text>
//         </HoverableCard>
//         <HoverableCard style={[styles.btn, styles.btnSecondary]} onPress={cancelEstimate}>
//           <Text style={styles.btnText}>Cancel Estimate</Text>
//         </HoverableCard>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", marginVertical: 52 },
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
//   radioLabel: { fontSize: 15 },
//   summary: {
//     padding: 16,
//     backgroundColor: "#f2f2f2",
//     borderRadius: 8,
//     marginVertical: 16,
//   },
//   summaryTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
//   summaryLine: { fontSize: 16, marginTop: 6 },
//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 8,
//   },
//   btn: {
//     flex: 1,
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//     backgroundColor: "#1976d2",
//   },
//   btnPrimary: { backgroundColor: "#1976d2" },
//   btnSecondary: { backgroundColor: "#aaa" },
//   btnText: { color: "#fff", fontWeight: "bold" },
//   titleHeading: {
//     fontSize: 12,
//     color: "red",
//     textAlign: "center",
//   },
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
//   fetchZipMultiplier,
// } from "../utils/serviceMatrix.js";
// import api from "../api/client";
// import BackButton from "../components/BackButton.js";

// const FEE_RATE = 0.07;

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
//       {...(Platform.OS === "web" ? {
//         onHoverIn: () => animate(1.03, 12),
//         onHoverOut: () => animate(1, 2),
//       } : {})}
//     >
//       <Animated.View style={[style, {
//         transform: [{ scale }],
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: elevation },
//         shadowOpacity: 0.15,
//         shadowRadius: elevation,
//         elevation,
//       }]}> {children} </Animated.View>
//     </Pressable>
//   );
// }

// export default function EmergencyForm() {
//   const { category } = useRoute().params || {};
//   const navigation = useNavigation();

//   const [address, setAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [zipcode, setZipcode] = useState("");
//   const [selectedService, setSelected] = useState("");
//   const [answers, setAnswers] = useState({});
//   const [otherAnswers, setOtherAnswers] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [zipMultiplier, setZipMultiplier] = useState(1.0);
//   const [adjustedEstimate, setAdjustedEstimate] = useState(0);

//   const categoryQuestion = (questionsData.questions[category] || [])[0] || null;
//   const serviceQuestions = selectedService ? questionsData.questions[selectedService] || [] : [];

//   const basePrice = useMemo(() => (selectedService ? getBasePrice(selectedService) : 0), [selectedService]);

//   const answersObj = useMemo(() => {
//     const out = {};
//     serviceQuestions.forEach((q) => {
//       if (answers[q.id] != null) out[q.question] = answers[q.id];
//     });
//     return out;
//   }, [answers, serviceQuestions]);

//   useEffect(() => {
//     const computeEstimate = async () => {
//       if (!selectedService || !zipcode.trim()) return;
//       try {
//         const multiplier = await fetchZipMultiplier(zipcode);
//         setZipMultiplier(multiplier);
//         const estimate = estimateTotal(selectedService, answersObj, multiplier);
//         setAdjustedEstimate(estimate);
//       } catch (err) {
//         console.error("Multiplier calc failed:", err);
//         setZipMultiplier(1.0);
//         setAdjustedEstimate(estimateTotal(selectedService, answersObj));
//       }
//     };
//     computeEstimate();
//   }, [selectedService, zipcode, answersObj]);

//   const rushFee = selectedService ? 100 : 0;
//   const subtotal = basePrice + adjustedEstimate + rushFee;
//   const convFee = Number((subtotal * FEE_RATE).toFixed(2));
//   const grandTotal = Number((subtotal + convFee).toFixed(2));

//   const handleServiceSelect = (svc) => {
//     setSelected(svc);
//     setAnswers({});
//     setOtherAnswers({});
//   };

//   const handleAnswerChange = (qId, val) => setAnswers((p) => ({ ...p, [qId]: val }));
//   const handleOtherChange = (qId, val) => setOtherAnswers((p) => ({ ...p, [qId]: val }));

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
//           return Alert.alert("Info", `Please specify your 'Other' answer for: ${q.question}`);
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
//         adjustmentAmount: adjustedEstimate,
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
//       "Enter your address, city, zip code, choose the issue, review the estimate (including the 7% convenience fee), then pay & book."
//     );
//   }, []);

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ padding: 36 }}>
//       <BackButton />
//       <Text style={styles.title}>{category} Emergency Form</Text>

//       <Text style={styles.label}>Your Address *</Text>
//       <TextInput style={styles.input} placeholder="Enter address" value={address} onChangeText={setAddress} />

//       <Text style={styles.label}>City *</Text>
//       <TextInput style={styles.input} placeholder="Enter city" value={city} onChangeText={setCity} />

//       <Text style={styles.label}>Zip Code *</Text>
//       <TextInput style={styles.input} placeholder="Enter zip code" keyboardType="numeric" value={zipcode} onChangeText={setZipcode} />

//       {categoryQuestion && (
//         <View style={styles.section}>
//           <Text style={styles.label}>{categoryQuestion.question}</Text>
//           {categoryQuestion.options.map((svc) => (
//             <HoverableCard
//               key={svc}
//               style={[styles.radioRow, selectedService === svc && styles.radioRowSelected]}
//               onPress={() => handleServiceSelect(svc)}
//             >
//               <Text style={styles.radioLabel}>{svc}</Text>
//             </HoverableCard>
//           ))}
//         </View>
//       )}

//       {selectedService && serviceQuestions.map((q) => {
//         const selectedVal = answers[q.id] || "";
//         return (
//           <View key={q.id} style={styles.section}>
//             <Text style={styles.label}>{q.question}</Text>
//             {q.options.map((opt) => (
//               <HoverableCard
//                 key={opt.value}
//                 style={[styles.radioRow, selectedVal === opt.value && styles.radioRowSelected]}
//                 onPress={() => handleAnswerChange(q.id, opt.value)}
//               >
//                 <Text style={styles.radioLabel}>{opt.value}</Text>
//               </HoverableCard>
//             ))}
//             {!q.options.some((o) => o.value === "Other") && (
//               <HoverableCard
//                 style={[styles.radioRow, selectedVal === "Other" && styles.radioRowSelected]}
//                 onPress={() => handleAnswerChange(q.id, "Other")}
//               >
//                 <Text style={styles.radioLabel}>Other</Text>
//               </HoverableCard>
//             )}
//             {selectedVal === "Other" && (
//               <TextInput
//                 style={[styles.input, { marginTop: 8 }]}
//                 placeholder="Please specify"
//                 value={otherAnswers[q.id] || ""}
//                 onChangeText={(txt) => handleOtherChange(q.id, txt)}
//               />
//             )}
//           </View>
//         );
//       })}

//       {selectedService && (
//         <HoverableCard style={styles.summary}>
//           <Text style={styles.titleHeading}>** Make sure all provided info is accurate. We will not be responsible for typos or incorrect info. **</Text>
//           <Text style={styles.summaryTitle}>Price Summary</Text>
//           <Text style={styles.summaryLine}>Subtotal: ${subtotal.toFixed(2)}</Text>
//           <Text>Convenience fee ({(FEE_RATE * 100).toFixed(0)}%): ${convFee.toFixed(2)}</Text>
//           <Text style={styles.summaryLine}><Text style={{ fontWeight: "700" }}>Estimated Total:</Text> ${grandTotal.toFixed(2)}</Text>
//         </HoverableCard>
//       )}

//       <View style={styles.actionRow}>
//         <HoverableCard style={[styles.btn, styles.btnPrimary]} onPress={handleSubmit}>
//           <Text style={styles.btnText}>{submitting ? "Processing…" : "Pay & Book"}</Text>
//         </HoverableCard>
//         <HoverableCard style={[styles.btn, styles.btnSecondary]} onPress={cancelEstimate}>
//           <Text style={styles.btnText}>Cancel Estimate</Text>
//         </HoverableCard>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", marginVertical: 52 },
//   title: { fontSize: 24, fontWeight: "bold", marginVertical: 12, textAlign: "center" },
//   label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
//   input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, marginBottom: 10 },
//   section: { marginBottom: 16 },
//   radioRow: { paddingVertical: 8, borderWidth: 1, borderColor: "#ccc", borderRadius: 6, marginBottom: 6, paddingHorizontal: 10, backgroundColor: "#fff" },
//   radioRowSelected: { backgroundColor: "#a6e1fa", borderColor: "#1976d2" },
//   radioLabel: { fontSize: 15 },
//   summary: { padding: 16, backgroundColor: "#f2f2f2", borderRadius: 8, marginVertical: 16 },
//   summaryTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
//   summaryLine: { fontSize: 16, marginTop: 6 },
//   actionRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
//   btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center", backgroundColor: "#1976d2" },
//   btnPrimary: { backgroundColor: "#1976d2" },
//   btnSecondary: { backgroundColor: "#aaa" },
//   btnText: { color: "#fff", fontWeight: "bold" },
//   titleHeading: { fontSize: 12, color: "red", textAlign: "center" },
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
//   fetchZipMultiplier,
// } from "../utils/serviceMatrix.js";
// import api from "../api/client";
// import BackButton from "../components/BackButton.js";

// const FEE_RATE = 0.07;

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
//       {...(Platform.OS === "web" ? {
//         onHoverIn: () => animate(1.03, 12),
//         onHoverOut: () => animate(1, 2),
//       } : {})}
//     >
//       <Animated.View style={[style, {
//         transform: [{ scale }],
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: elevation },
//         shadowOpacity: 0.15,
//         shadowRadius: elevation,
//         elevation,
//       }]}
//       >
//         {typeof children === "string" ? <Text>{children}</Text> : children}
//       </Animated.View>
//     </Pressable>
//   );
// }

// export default function EmergencyForm() {
//   const { category } = useRoute().params || {};
//   const navigation = useNavigation();

//   const [address, setAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [zipcode, setZipcode] = useState("");
//   const [selectedService, setSelected] = useState("");
//   const [answers, setAnswers] = useState({});
//   const [otherAnswers, setOtherAnswers] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [zipMultiplier, setZipMultiplier] = useState(1.0);
//   const [adjustedEstimate, setAdjustedEstimate] = useState(0);

//   const categoryQuestion = (questionsData.questions[category] || [])[0] || null;
//   const serviceQuestions = selectedService ? questionsData.questions[selectedService] || [] : [];

//   const basePrice = useMemo(() => (selectedService ? getBasePrice(selectedService) : 0), [selectedService]);

//   const answersObj = useMemo(() => {
//     const out = {};
//     serviceQuestions.forEach((q) => {
//       if (answers[q.id] != null) out[q.question] = answers[q.id];
//     });
//     return out;
//   }, [answers, serviceQuestions]);

//   useEffect(() => {
//     const computeEstimate = async () => {
//       if (!selectedService || !zipcode.trim()) return;
//       try {
//         const multiplier = await fetchZipMultiplier(zipcode);
//         setZipMultiplier(multiplier);
//         const estimate = estimateTotal(selectedService, answersObj, multiplier);
//         setAdjustedEstimate(estimate);
//       } catch (err) {
//         console.error("Multiplier calc failed:", err);
//         setZipMultiplier(1.0);
//         setAdjustedEstimate(estimateTotal(selectedService, answersObj));
//       }
//     };
//     computeEstimate();
//   }, [selectedService, zipcode, answersObj]);

//   const rushFee = selectedService ? 100 : 0;
//   const subtotal = basePrice + adjustedEstimate + rushFee;
//   const convFee = Number((subtotal * FEE_RATE).toFixed(2));
//   const grandTotal = Number((subtotal + convFee).toFixed(2));

//   const handleServiceSelect = (svc) => {
//     setSelected(svc);
//     setAnswers({});
//     setOtherAnswers({});
//   };

//   const handleAnswerChange = (qId, val) => setAnswers((p) => ({ ...p, [qId]: val }));
//   const handleOtherChange = (qId, val) => setOtherAnswers((p) => ({ ...p, [qId]: val }));

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
//           return Alert.alert("Info", `Please specify your 'Other' answer for: ${q.question}`);
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
//         adjustmentAmount: adjustedEstimate,
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
//       "Enter your address, city, zip code, choose the issue, review the estimate (including the 7% convenience fee), then pay & book."
//     );
//   }, []);

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ padding: 36 }}>
//       <BackButton />
//       <Text style={styles.title}>{category} Emergency Form</Text>
//       <Text style={styles.label}>Your Address *</Text>
//       <TextInput style={styles.input} placeholder="Enter address" value={address} onChangeText={setAddress} />
//       <Text style={styles.label}>City *</Text>
//       <TextInput style={styles.input} placeholder="Enter city" value={city} onChangeText={setCity} />
//       <Text style={styles.label}>Zip Code *</Text>
//       <TextInput style={styles.input} placeholder="Enter zip code" keyboardType="numeric" value={zipcode} onChangeText={setZipcode} />
//       {categoryQuestion && (
//         <View style={styles.section}>
//           <Text style={styles.label}>{categoryQuestion.question}</Text>
//           {categoryQuestion.options.map((svc) => (
//             <HoverableCard
//               key={svc}
//               style={[styles.radioRow, selectedService === svc && styles.radioRowSelected]}
//               onPress={() => handleServiceSelect(svc)}
//             >
//               <Text style={styles.radioLabel}>{svc}</Text>
//             </HoverableCard>
//           ))}
//         </View>
//       )}
//       {selectedService && serviceQuestions.map((q) => {
//         const selectedVal = answers[q.id] || "";
//         return (
//           <View key={q.id} style={styles.section}>
//             <Text style={styles.label}>{q.question}</Text>
//             {q.options.map((opt) => (
//               <HoverableCard
//                 key={opt.value}
//                 style={[styles.radioRow, selectedVal === opt.value && styles.radioRowSelected]}
//                 onPress={() => handleAnswerChange(q.id, opt.value)}
//               >
//                 <Text style={styles.radioLabel}>{opt.value}</Text>
//               </HoverableCard>
//             ))}
//             {!q.options.some((o) => o.value === "Other") && (
//               <HoverableCard
//                 style={[styles.radioRow, selectedVal === "Other" && styles.radioRowSelected]}
//                 onPress={() => handleAnswerChange(q.id, "Other")}
//               >
//                 <Text style={styles.radioLabel}>Other</Text>
//               </HoverableCard>
//             )}
//             {selectedVal === "Other" && (
//               <TextInput
//                 style={[styles.input, { marginTop: 8 }]}
//                 placeholder="Please specify"
//                 value={otherAnswers[q.id] || ""}
//                 onChangeText={(txt) => handleOtherChange(q.id, txt)}
//               />
//             )}
//           </View>
//         );
//       })}
//       {selectedService && (
//         <HoverableCard style={styles.summary}>
//           <Text style={styles.titleHeading}>** Make sure all provided info is accurate. We will not be responsible for typos or incorrect info. **</Text>
//           <Text style={styles.summaryTitle}>Price Summary</Text>
//           <Text style={styles.summaryLine}>Subtotal: ${subtotal.toFixed(2)}</Text>
//           <Text>Convenience fee ({(FEE_RATE * 100).toFixed(0)}%): ${convFee.toFixed(2)}</Text>
//           <Text style={styles.summaryLine}><Text style={{ fontWeight: "700" }}>Estimated Total:</Text> ${grandTotal.toFixed(2)}</Text>
//         </HoverableCard>
//       )}
//       <View style={styles.actionRow}>
//         <HoverableCard style={[styles.btn, styles.btnPrimary]} onPress={handleSubmit}>
//           <Text style={styles.btnText}>{submitting ? "Processing…" : "Pay & Book"}</Text>
//         </HoverableCard>
//         <HoverableCard style={[styles.btn, styles.btnSecondary]} onPress={cancelEstimate}>
//           <Text style={styles.btnText}>Cancel Estimate</Text>
//         </HoverableCard>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff", marginVertical: 52 },
//   title: { fontSize: 24, fontWeight: "bold", marginVertical: 12, textAlign: "center" },
//   label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
//   input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, marginBottom: 10 },
//   section: { marginBottom: 16 },
//   radioRow: { paddingVertical: 8, borderWidth: 1, borderColor: "#ccc", borderRadius: 6, marginBottom: 6, paddingHorizontal: 10, backgroundColor: "#fff" },
//   radioRowSelected: { backgroundColor: "#a6e1fa", borderColor: "#1976d2" },
//   radioLabel: { fontSize: 15 },
//   summary: { padding: 16, backgroundColor: "#f2f2f2", borderRadius: 8, marginVertical: 16 },
//   summaryTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
//   summaryLine: { fontSize: 16, marginTop: 6 },
//   actionRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
//   btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center", backgroundColor: "#1976d2" },
//   btnPrimary: { backgroundColor: "#1976d2" },
//   btnSecondary: { backgroundColor: "#aaa" },
//   btnText: { color: "#fff", fontWeight: "bold" },
//   titleHeading: { fontSize: 12, color: "red", textAlign: "center" },
// });
