// 

// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   ActivityIndicator,
//   StyleSheet,
//   TextInput,
//   Alert,
//   Image,
//   Dimensions,
//   TouchableOpacity,
//   Platform,
//   KeyboardAvoidingView,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import JobDetails from "../components/JobDetails";
// import api from "../api/client";
// import { saveSession } from "../utils/sessionManager";

// const TRAVEL_FEE = 100;
// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// const CustomButton = ({ title, onPress, disabled, color = "#1976d2" }) => (
//   <TouchableOpacity
//     onPress={onPress}
//     disabled={disabled}
//     style={[
//       styles.customButton,
//       { backgroundColor: disabled ? "#ccc" : color },
//     ]}
//   >
//     <Text style={styles.customButtonText}>{title}</Text>
//   </TouchableOpacity>
// );

// export default function ProviderJobStatus() {
//   const route = useRoute();
//   const jobId = route?.params?.jobId;
//   const navigation = useNavigation();
//   const scrollRef = useRef();

//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [cancelling, setCancelling] = useState(false);
//   const [notifiedComplete, setNotifiedComplete] = useState(false);
//   const [showPhone, setShowPhone] = useState(false);
//   const [additionalCharge, setAdditionalCharge] = useState("");
//   const [additionalChargeReason, setAdditionalChargeReason] = useState("");
//   const [confirmingCancel, setConfirmingCancel] = useState(false);

//   const phoneTimer = useRef(null);
//   const confirmTimeout = useRef(null);



//   useEffect(() => {
//     let alive = true;
//     const fetchJob = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
//         if (!alive) return;
//         setJob(data);

//         if (data.status === "completed" && !notifiedComplete) {
//           setNotifiedComplete(true);
//           Alert.alert("Job Complete", "This job is now fully completed.", [
//             {
//               text: "OK",
//               onPress: () => navigation.navigate("ServiceProviderDashboard"),
//             },
//           ]);
//           await clearSession();
//         }

//         if (data.acceptedProvider && !phoneTimer.current) {
//           phoneTimer.current = setTimeout(
//             () => setShowPhone(true),
//             6 * 60 * 1000
//           );
//         }
//       } catch {
//         alive && Alert.alert("Error", "Unable to load job");
//       } finally {
//         alive && setLoading(false);
//       }
//     };
//     fetchJob();
//     const interval = setInterval(fetchJob, 25000);
//     return () => {
//       alive = false;
//       clearInterval(interval);
//       if (phoneTimer.current) clearTimeout(phoneTimer.current);
//     };
//   }, [jobId, notifiedComplete, navigation]);

//   const handleUpdateCharge = async () => {
//     const amt = Number(additionalCharge);
//     if (!amt || !additionalChargeReason) {
//       return Alert.alert(
//         "Missing Info",
//         "Both charge and reason are required."
//       );
//     }

//     try {
//       const { data } = await api.put(`/jobs/${jobId}/additional-charge`, {
//         additionalCharge: amt,
//         reason: additionalChargeReason,
//       });
//       setJob(data);
//       Alert.alert("Extra Charge Recorded", "Redirecting homeowner to payment…");
//     } catch (err) {
//       console.error("Update-charge error:", err);
//       Alert.alert("Error", "Failed to record extra charge.");
//     }
//   };

//   // const handleCancelJob = async () => {
//   //   if (!confirmingCancel) {
//   //     setConfirmingCancel(true);
//   //     Alert.alert(
//   //       "Confirm Cancellation",
//   //       "Tap again to confirm job cancellation."
//   //     );
//   //     confirmTimeout.current = setTimeout(
//   //       () => setConfirmingCancel(false),
//   //       5000
//   //     );
//   //     return;
//   //   }

//   //   setCancelling(true);
//   //   try {
//   //     await api.put(`/jobs/${jobId}/cancel`, { travelFee: TRAVEL_FEE });
//   //     Alert.alert(
//   //       "Cancelled",
//   //       `Job cancelled; a $${TRAVEL_FEE} travel fee applies.`,
//   //       [
//   //         {
//   //           text: "OK",
//   //           onPress: () => navigation.navigate("ServiceProviderDashboard"),
//   //         },
//   //       ]
//   //     );
//   //   } catch (err) {
//   //     console.error("Cancel-job error:", err);
//   //     Alert.alert("Error", "Cancellation failed.");
//   //   } finally {
//   //     setCancelling(false);
//   //     setConfirmingCancel(false);
//   //     if (confirmTimeout.current) clearTimeout(confirmTimeout.current);
//   //   }
//   // };

//   const handleCancelJob = async () => {
//     Alert.alert(
//       "Cancel Job",
//       "Are you sure you want to cancel this job? The customer will be notified and the search will restart.",
//       [
//         {
//           text: "No",
//           style: "cancel",
//         },
//         {
//           text: "Yes, Cancel",
//           style: "destructive",
//           onPress: async () => {
//             setCancelling(true);
//             try {
//               await api.put(`/jobs/${jobId}/cancelled`, {
//                 cancelledBy: "serviceProvider",
//                 travelFee: TRAVEL_FEE,
//               });
//               Alert.alert("Cancelled", "The job has been cancelled.");
//               navigation.navigate("ServiceProviderDashboard");
//             } catch (err) {
//               console.error("Cancel-job error:", err);
//               Alert.alert("Error", "Cancellation failed.");
//             } finally {
//               setCancelling(false);
//             }
//           },
//         },
//       ]
//     );
//   };
  

//   const pickAndUpload = async (phase) => {
//     const status = await ImagePicker.requestCameraPermissionsAsync();
//     if (status.status !== "granted") {
//       return Alert.alert("Permission denied", "Camera access is required.");
//     }

//     const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
//     if (result.cancelled || result.canceled) return;

//     const uri = result.uri ?? result.assets?.[0]?.uri;
//     if (!uri) return Alert.alert("Error", "Could not read image.");

//     const name = uri.split("/").pop();
//     const match = /\.(\w+)$/.exec(name);
//     const type = match ? `image/${match[1]}` : "image";

//     const form = new FormData();
//     form.append("image", { uri, name, type });

//     try {
//       const { data } = await api.post(`/jobs/${jobId}/upload/${phase}`, form, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       setJob(data);
//       Alert.alert("Uploaded", `Successfully uploaded ${phase} image.`);
//     } catch (err) {
//       const msg = err.response?.data?.msg || err.message || "Upload failed.";
//       Alert.alert("Upload failed", msg);
//     }
//   };

//   const handleFinalize = async () => {
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/complete/provider`);
//       setJob(data);
//       Alert.alert("Done", "You’ve marked the job complete.", [
//         {
//           text: "OK",
//           onPress: () => navigation.navigate("ServiceProviderDashboard"),
//         },
//       ]);
//     } catch (err) {
//       console.error("Finalize error:", err);
//       Alert.alert("Error", "Could not finalize job.");
//     }
//   };

//   if (loading) return <ActivityIndicator style={styles.center} size="large" />;
//   if (!job) return <Text style={styles.center}>No job found.</Text>;

//   const awaitingAdditional = job.status === "awaiting-additional-payment";
//   const { additionalCharge: ac, estimatedTotal } = job;

 

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       keyboardVerticalOffset={100}
//     >
//       <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
//         <View style={styles.containerLogo}>
//           <Image
//             source={require("../assets/blinqfix_logo-new.jpeg")}
//             style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
//             resizeMode="contain"
//           />
//         </View>

//         {job.paymentStatus !== "paid" && (
//           <Text style={styles.alert}>** Status will update live **</Text>
//         )}

//         <JobDetails jobId={jobId} job={job} />

//         {showPhone && job?.customer?.phoneNumber && (
//           <Text style={styles.phone}>
//             Customer Phone: {job.customer.phoneNumber}
//           </Text>
//         )}

//         <View style={styles.card}>
//           <Text style={styles.title}>Provider Actions</Text>

//           <Text style={{ textAlign: "center", marginBottom: 10 }}>
//             Additional Charge: ${ac.toFixed(2)}
//             {"\n"}
//             Estimate Total: ${estimatedTotal.toFixed(2)}
//           </Text>

//           <Text style={styles.label}>Step1: Arrival Photo</Text>
//           <CustomButton
//             title="Capture Arrival Photo"
//             onPress={() => pickAndUpload("arrival")}
//             disabled={awaitingAdditional}
//           />

//           <Text style={styles.label}>Step2: Additional Charge</Text>
//           <TextInput
//             style={styles.input}
//             keyboardType="numeric"
//             value={additionalCharge}
//             onChangeText={setAdditionalCharge}
//             placeholder="e.g. 50.00"
//           />
//           <TextInput
//             style={styles.input}
//             value={additionalChargeReason}
//             onChangeText={setAdditionalChargeReason}
//             placeholder="Reason for additional charge"
//           />
//           <CustomButton
//             title="Submit Additional Charge"
//             onPress={handleUpdateCharge}
//             disabled={awaitingAdditional}
//           />
//           {awaitingAdditional && (
//             <Text style={styles.warn}>Awaiting homeowner payment…</Text>
//           )}

//           <Text style={styles.label}>Step3: Completion Photo</Text>
//           <CustomButton
//             title="Capture Completion Photo"
//             onPress={() => pickAndUpload("completion")}
//             disabled={awaitingAdditional}
//           />

//           <Text style={styles.label}>Step4: Finalize Job</Text>
//           <CustomButton
//             title="Mark Job Completed"
//             onPress={handleFinalize}
//             disabled={!job.arrivalImage || !job.completionImage}
//           />

//           <CustomButton
//             title={cancelling ? "Cancelling…" : "Cancel Job"}
//             onPress={handleCancelJob}
//             color="red"
//             disabled={cancelling}
//           />
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 24, backgroundColor: "#fff" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   containerLogo: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 40,
//   },
//   alert: {
//     color: "red",
//     textAlign: "center",
//     fontWeight: "bold",
//     marginBottom: 12,
//   },
//   card: {
//     backgroundColor: "#f2f2f2",
//     padding: 16,
//     borderRadius: 8,
//     marginTop: 24,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   section: { marginTop: 12 },
//   label: { fontWeight: "600", marginTop: 10 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 8,
//     marginVertical: 6,
//   },
//   warn: { color: "orange", marginTop: 6 },
//   phone: {
//     marginTop: 20,
//     fontSize: 16,
//     fontWeight: "800",
//     color: "red",
//     textAlign: "center",
//   },
//   customButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 6,
//     alignItems: "center",
//     marginVertical: 6,
//   },
//   customButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });



// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   ActivityIndicator,
//   StyleSheet,
//   TextInput,
//   Alert,
//   Image,
//   Dimensions,
//   TouchableOpacity,
//   Platform,
//   KeyboardAvoidingView,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import JobDetails from "../components/JobDetails";
// import api from "../api/client";
// import { saveSession } from "../utils/sessionManager";

// const TRAVEL_FEE = 100;
// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// const CustomButton = ({ title, onPress, disabled, color = "#1976d2" }) => (
//   <TouchableOpacity
//     onPress={onPress}
//     disabled={disabled}
//     style={[styles.customButton, { backgroundColor: disabled ? "#ccc" : color }]}
//   >
//     <Text style={styles.customButtonText}>{title}</Text>
//   </TouchableOpacity>
// );

// export default function ProviderJobStatus() {
//   const route = useRoute();
//   const jobId = route?.params?.jobId;
//   const navigation = useNavigation();
//   const scrollRef = useRef();

//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [cancelling, setCancelling] = useState(false);
//   const [notifiedComplete, setNotifiedComplete] = useState(false);
//   const [showPhone, setShowPhone] = useState(false);
//   const [additionalCharge, setAdditionalCharge] = useState("");
//   const [additionalChargeReason, setAdditionalChargeReason] = useState("");

//   const phoneTimer = useRef(null);

//   useEffect(() => {
//     if (job && job._id && job.status !== "completed") {
//       api.post("/users/save-session", { jobId: job._id });
//       saveSession({ role: "serviceProvider", jobId: job._id });
//     }
//   }, [job]);

//   useEffect(() => {
//     let alive = true;
//     const fetchJob = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
//         if (!alive) return;
//         setJob(data);

//         if (data.status === "completed" && !notifiedComplete) {
//           setNotifiedComplete(true);
//           await api.post("/users/clear-session");
//           Alert.alert("Job Complete", "This job is now fully completed.", [
//             { text: "OK", onPress: () => navigation.navigate("ServiceProviderDashboard") },
//           ]);
//         }

//         if (data.acceptedProvider && !phoneTimer.current) {
//           phoneTimer.current = setTimeout(() => setShowPhone(true), 6 * 60 * 1000);
//         }
//       } catch {
//         alive && Alert.alert("Error", "Unable to load job");
//       } finally {
//         alive && setLoading(false);
//       }
//     };
//     fetchJob();
//     const interval = setInterval(fetchJob, 25000);
//     return () => {
//       alive = false;
//       clearInterval(interval);
//       if (phoneTimer.current) clearTimeout(phoneTimer.current);
//     };
//   }, [jobId, notifiedComplete, navigation]);

//   const handleUpdateCharge = async () => {
//     const amt = Number(additionalCharge);
//     if (!amt || !additionalChargeReason) {
//       return Alert.alert("Missing Info", "Both charge and reason are required.");
//     }
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/additional-charge`, {
//         additionalCharge: amt,
//         reason: additionalChargeReason,
//       });
//       setJob(data);
//       Alert.alert("Extra Charge Recorded", "Redirecting homeowner to payment…");
//     } catch (err) {
//       console.error("Update-charge error:", err);
//       Alert.alert("Error", "Failed to record extra charge.");
//     }
//   };

//   const handleCancelJob = async () => {
//     Alert.alert(
//       "Cancel Job",
//       "Are you sure you want to cancel this job? The customer will be notified and the search will restart.",
//       [
//         { text: "No", style: "cancel" },
//         {
//           text: "Yes, Cancel",
//           style: "destructive",
//           onPress: async () => {
//             setCancelling(true);
//             try {
//               await api.put(`/jobs/${jobId}/cancelled`, {
//                 cancelledBy: "serviceProvider",
//                 travelFee: TRAVEL_FEE,
//               });
//               await api.post("/users/clear-session");
//               Alert.alert("Cancelled", "The job has been cancelled.");
//               navigation.navigate("ServiceProviderDashboard");
//             } catch (err) {
//               console.error("Cancel-job error:", err);
//               Alert.alert("Error", "Cancellation failed.");
//             } finally {
//               setCancelling(false);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const pickAndUpload = async (phase) => {
//     const status = await ImagePicker.requestCameraPermissionsAsync();
//     if (status.status !== "granted") {
//       return Alert.alert("Permission denied", "Camera access is required.");
//     }
//     const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
//     if (result.cancelled || result.canceled) return;

//     const uri = result.uri ?? result.assets?.[0]?.uri;
//     if (!uri) return Alert.alert("Error", "Could not read image.");

//     const name = uri.split("/").pop();
//     const match = /\.(\w+)$/.exec(name);
//     const type = match ? `image/${match[1]}` : "image";

//     const form = new FormData();
//     form.append("image", { uri, name, type });

//     try {
//       const { data } = await api.post(`/jobs/${jobId}/upload/${phase}`, form, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       setJob(data);
//       Alert.alert("Uploaded", `Successfully uploaded ${phase} image.`);
//     } catch (err) {
//       const msg = err.response?.data?.msg || err.message || "Upload failed.";
//       Alert.alert("Upload failed", msg);
//     }
//   };

//   const handleFinalize = async () => {
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/complete/provider`);
//       await api.post("/users/clear-session");
//       setJob(data);
//       Alert.alert("Done", "You’ve marked the job complete.", [
//         {
//           text: "OK",
//           onPress: () => navigation.navigate("ServiceProviderDashboard"),
//         },
//       ]);
//     } catch (err) {
//       console.error("Finalize error:", err);
//       Alert.alert("Error", "Could not finalize job.");
//     }
//   };

//   if (loading) return <ActivityIndicator style={styles.center} size="large" />;
//   if (!job) return <Text style={styles.center}>No job found.</Text>;

//   const awaitingAdditional = job.status === "awaiting-additional-payment";
//   const { additionalCharge: ac, estimatedTotal } = job;

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       keyboardVerticalOffset={100}
//     >
//       <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
//         <Image
//           source={require("../assets/blinqfix_logo-new.jpeg")}
//           style={{ width: LOGO_SIZE, height: LOGO_SIZE, alignSelf: "center" }}
//           resizeMode="contain"
//         />

//         <JobDetails jobId={jobId} job={job} />

//         {showPhone && job?.customer?.phoneNumber && (
//           <Text style={styles.phone}>
//             Customer Phone: {job.customer.phoneNumber}
//           </Text>
//         )}

//         <View style={styles.card}>
//           <Text style={styles.title}>Provider Actions</Text>

//           <Text style={{ textAlign: "center", marginBottom: 10 }}>
//             Additional Charge: ${ac.toFixed(2)}
//             {"\n"}
//             Estimate Total: ${estimatedTotal.toFixed(2)}
//           </Text>

//           <Text style={styles.label}>Step1: Arrival Photo</Text>
//           <CustomButton
//             title="Capture Arrival Photo"
//             onPress={() => pickAndUpload("arrival")}
//             disabled={awaitingAdditional}
//           />

//           <Text style={styles.label}>Step2: Additional Charge</Text>
//           <TextInput
//             style={styles.input}
//             keyboardType="numeric"
//             value={additionalCharge}
//             onChangeText={setAdditionalCharge}
//             placeholder="e.g. 50.00"
//           />
//           <TextInput
//             style={styles.input}
//             value={additionalChargeReason}
//             onChangeText={setAdditionalChargeReason}
//             placeholder="Reason for additional charge"
//           />
//           <CustomButton
//             title="Submit Additional Charge"
//             onPress={handleUpdateCharge}
//             disabled={awaitingAdditional}
//           />
//           {awaitingAdditional && <Text style={styles.warn}>Awaiting homeowner payment…</Text>}

//           <Text style={styles.label}>Step3: Completion Photo</Text>
//           <CustomButton
//             title="Capture Completion Photo"
//             onPress={() => pickAndUpload("completion")}
//             disabled={awaitingAdditional}
//           />

//           <Text style={styles.label}>Step4: Finalize Job</Text>
//           <CustomButton
//             title="Mark Job Completed"
//             onPress={handleFinalize}
//             disabled={!job.arrivalImage || !job.completionImage}
//           />

//           <CustomButton
//             title={cancelling ? "Cancelling…" : "Cancel Job"}
//             onPress={handleCancelJob}
//             color="red"
//             disabled={cancelling}
//           />
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 24, backgroundColor: "#fff" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   card: {
//     backgroundColor: "#f2f2f2",
//     padding: 16,
//     borderRadius: 8,
//     marginTop: 24,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   label: { fontWeight: "600", marginTop: 10 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 8,
//     marginVertical: 6,
//   },
//   warn: { color: "orange", marginTop: 6 },
//   phone: {
//     marginTop: 20,
//     fontSize: 16,
//     fontWeight: "800",
//     color: "red",
//     textAlign: "center",
//   },
//   customButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderRadius: 6,
//     alignItems: "center",
//     marginVertical: 6,
//   },
//   customButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });

// ProviderJobStatus.js (restored styling + session logic)
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRoute, useNavigation } from "@react-navigation/native";
import JobDetails from "../components/JobDetails";
import api from "../api/client";
import { saveSession } from "../utils/sessionManager";

const TRAVEL_FEE = 100;
const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.55;

const CustomButton = ({ title, onPress, disabled, color = "#1976d2" }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[styles.customButton, { backgroundColor: disabled ? "#ccc" : color }]}
  >
    <Text style={styles.customButtonText}>{title}</Text>
  </TouchableOpacity>
);

export default function ProviderJobStatus() {
  const route = useRoute();
  const jobId = route?.params?.jobId;
  const navigation = useNavigation();
  const scrollRef = useRef();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [notifiedComplete, setNotifiedComplete] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [additionalCharge, setAdditionalCharge] = useState("");
  const [additionalChargeReason, setAdditionalChargeReason] = useState("");

  const phoneTimer = useRef(null);

  useEffect(() => {
    if (job && job._id && job.status !== "completed") {
      api.post("/users/save-session", { jobId: job._id });
      saveSession({ role: "serviceProvider", jobId: job._id });
    }
  }, [job]);

  useEffect(() => {
    let alive = true;
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
        if (!alive) return;
        setJob(data);

        if (data.status === "completed" && !notifiedComplete) {
          setNotifiedComplete(true);
          await api.post("/users/clear-session");
          Alert.alert("Job Complete", "This job is now fully completed.", [
            { text: "OK", onPress: () => navigation.navigate("ServiceProviderDashboard") },
          ]);
        }

        if (data.acceptedProvider && !phoneTimer.current) {
          phoneTimer.current = setTimeout(() => setShowPhone(true), 6 * 60 * 1000);
        }
      } catch {
        alive && Alert.alert("Error", "Unable to load job");
      } finally {
        alive && setLoading(false);
      }
    };
    fetchJob();
    const interval = setInterval(fetchJob, 25000);
    return () => {
      alive = false;
      clearInterval(interval);
      if (phoneTimer.current) clearTimeout(phoneTimer.current);
    };
  }, [jobId, notifiedComplete, navigation]);

  const handleUpdateCharge = async () => {
    const amt = Number(additionalCharge);
    if (!amt || !additionalChargeReason) {
      return Alert.alert("Missing Info", "Both charge and reason are required.");
    }
    try {
      const { data } = await api.put(`/jobs/${jobId}/additional-charge`, {
        additionalCharge: amt,
        reason: additionalChargeReason,
      });
      setJob(data);
      Alert.alert("Extra Charge Recorded", "Redirecting homeowner to payment…");
    } catch (err) {
      console.error("Update-charge error:", err);
      Alert.alert("Error", "Failed to record extra charge.");
    }
  };

  const handleCancelJob = async () => {
    Alert.alert(
      "Cancel Job",
      "Are you sure you want to cancel this job? The customer will be notified and the search will restart.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await api.put(`/jobs/${jobId}/cancelled`, {
                cancelledBy: "serviceProvider",
                travelFee: TRAVEL_FEE,
              });
              await api.post("/users/clear-session");
              Alert.alert("Cancelled", "The job has been cancelled.");
              navigation.navigate("ServiceProviderDashboard");
            } catch (err) {
              console.error("Cancel-job error:", err);
              Alert.alert("Error", "Cancellation failed.");
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const pickAndUpload = async (phase) => {
    const status = await ImagePicker.requestCameraPermissionsAsync();
    if (status.status !== "granted") {
      return Alert.alert("Permission denied", "Camera access is required.");
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (result.cancelled || result.canceled) return;

    const uri = result.uri ?? result.assets?.[0]?.uri;
    if (!uri) return Alert.alert("Error", "Could not read image.");

    const name = uri.split("/").pop();
    const match = /\.(\w+)$/.exec(name);
    const type = match ? `image/${match[1]}` : "image";

    const form = new FormData();
    form.append("image", { uri, name, type });

    try {
      const { data } = await api.post(`/jobs/${jobId}/upload/${phase}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setJob(data);
      Alert.alert("Uploaded", `Successfully uploaded ${phase} image.`);
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Upload failed.";
      Alert.alert("Upload failed", msg);
    }
  };

  const handleFinalize = async () => {
    try {
      const { data } = await api.put(`/jobs/${jobId}/complete/provider`);
      await api.post("/users/clear-session");
      setJob(data);
      Alert.alert("Done", "You’ve marked the job complete.", [
        { text: "OK", onPress: () => navigation.navigate("ServiceProviderDashboard") },
      ]);
    } catch (err) {
      console.error("Finalize error:", err);
      Alert.alert("Error", "Could not finalize job.");
    }
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;
  if (!job) return <Text style={styles.center}>No job found.</Text>;

  const awaitingAdditional = job.status === "awaiting-additional-payment";
  const { additionalCharge: ac, estimatedTotal } = job;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
        <View style={styles.containerLogo}>
          <Image
            source={require("../assets/blinqfix_logo-new.jpeg")}
            style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
            resizeMode="contain"
          />
        </View>

        {job.paymentStatus !== "paid" && (
          <Text style={styles.alert}>** Status will update live **</Text>
        )}

        <JobDetails jobId={jobId} job={job} />

        {showPhone && job?.customer?.phoneNumber && (
          <Text style={styles.phone}>Customer Phone: {job.customer.phoneNumber}</Text>
        )}

        <View style={styles.card}>
          <Text style={styles.title}>Provider Actions</Text>

          <Text style={{ textAlign: "center", marginBottom: 10 }}>
            Additional Charge: ${ac.toFixed(2)}
            {"\n"}
            Estimate Total: ${estimatedTotal.toFixed(2)}
          </Text>

          <Text style={styles.label}>Step1: Arrival Photo</Text>
          <CustomButton
            title="Capture Arrival Photo"
            onPress={() => pickAndUpload("arrival")}
            disabled={awaitingAdditional}
          />

          <Text style={styles.label}>Step2: Additional Charge</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={additionalCharge}
            onChangeText={setAdditionalCharge}
            placeholder="e.g. 50.00"
          />
          <TextInput
            style={styles.input}
            value={additionalChargeReason}
            onChangeText={setAdditionalChargeReason}
            placeholder="Reason for additional charge"
          />
          <CustomButton
            title="Submit Additional Charge"
            onPress={handleUpdateCharge}
            disabled={awaitingAdditional}
          />
          {awaitingAdditional && <Text style={styles.warn}>Awaiting homeowner payment…</Text>}

          <Text style={styles.label}>Step3: Completion Photo</Text>
          <CustomButton
            title="Capture Completion Photo"
            onPress={() => pickAndUpload("completion")}
            disabled={awaitingAdditional}
          />

          <Text style={styles.label}>Step4: Finalize Job</Text>
          <CustomButton
            title="Mark Job Completed"
            onPress={handleFinalize}
            disabled={!job.arrivalImage || !job.completionImage}
          />

          <CustomButton
            title={cancelling ? "Cancelling…" : "Cancel Job"}
            onPress={handleCancelJob}
            color="red"
            disabled={cancelling}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  containerLogo: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 40,
  },
  alert: {
    color: "red",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#f2f2f2",
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  section: { marginTop: 12 },
  label: { fontWeight: "600", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
  },
  warn: { color: "orange", marginTop: 6 },
  phone: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "800",
    color: "red",
    textAlign: "center",
  },
  customButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    marginVertical: 6,
  },
  customButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
