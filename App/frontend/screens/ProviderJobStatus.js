// //ProviderJobStatus.js
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
//   Modal,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import JobDetails from "../components/JobDetails";
// import api from "../api/client";
// import { saveSession, clearSession } from "../utils/sessionManager";
// import ScreenWrapper from "../components/ScreenWrapper";

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
//   const [showNotCompleteModal, setShowNotCompleteModal] = useState(false);
//   const hasSeenNotCompleteRef = useRef(false);
//   const [showNotification, setShowNotification] = useState(true);
//   const modalDisplayedRef = useRef(false);

//   const phoneTimer = useRef(null);

//   useEffect(() => {
//     const timer = setTimeout(() => setShowNotification(false), 10000);
//     return () => clearTimeout(timer);
//   }, []);

//   useEffect(() => {
//     let alive = true;
//     const fetchJob = async () => {
//       let jobFetched = false;
//       try {
//         const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
//         if (!alive) return;
//         setJob(data);
//         jobFetched = true;

//         if (
//           data.customerMarkedIncomplete &&
//           !hasSeenNotCompleteRef.current &&
//           data.status !== "completed"
//         ) {
//           setShowNotCompleteModal(true);
//           hasSeenNotCompleteRef.current = true;
//         }

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

//         if (
//           data.status !== "completed" &&
//           data.customerMarkedIncomplete === true &&
//           data.lastNotCompleteAt &&
//           (!job?.lastNotCompleteAt ||
//             new Date(data.lastNotCompleteAt).getTime() !==
//               new Date(job.lastNotCompleteAt).getTime())
//         ) {
//           setShowNotCompleteModal(true);
//           modalDisplayedRef.current = true;
//           try {
//             await api.post(`/jobs/${jobId}/log`, {
//               event: "modal_not_complete_shown",
//               timestamp: new Date().toISOString(),
//               jobId,
//               triggeredBy: "customerMarkedIncomplete",
//             });
//           } catch (logErr) {
//             console.error("Logging modal event failed:", logErr);
//           }
//         }

//         if (data.acceptedProvider && !phoneTimer.current) {
//           phoneTimer.current = setTimeout(
//             () => setShowPhone(true),
//             6 * 60 * 1000
//           );
//         }
//       } catch (err) {
//         console.error("Fetch job failed:", err);
//         if (!jobFetched) alive && Alert.alert("Error", "Unable to load job");
//       } finally {
//         alive && setLoading(false);
//       }
//     };

//     fetchJob();
//     const interval = setInterval(fetchJob, 20000);
//     return () => {
//       alive = false;
//       clearInterval(interval);
//       if (phoneTimer.current) clearTimeout(phoneTimer.current);
//     };
//   }, [jobId, notifiedComplete, navigation]);

//   // ✅ Always declare hooks at top level; use conditions inside only
//   useEffect(() => {
//     if (job?.status === "cancelled-by-customer") {
//       Alert.alert("Job Cancelled", "The customer has cancelled this job.", [
//         {
//           text: "OK",
//           onPress: () => navigation.navigate("ServiceProviderDashboard"),
//         },
//       ]);
//     }
//   }, [job?.status]);

//   useEffect(() => {
//     if (job && job.status !== "completed") {
//       saveSession({ role: "serviceProvider", jobId: job._id });
//     }
//   }, [job]);

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

//   const handleCancelJob = async () => {
//     Alert.alert("Cancel Job", "Are you sure you want to cancel this job?", [
//       { text: "No", style: "cancel" },
//       {
//         text: "Yes, Cancel",
//         style: "destructive",
//         onPress: async () => {
//           setCancelling(true);
//           await clearSession();

//           try {
//             await api.put(`/jobs/${jobId}/cancelled`, {
//               cancelledBy: "serviceProvider",
//               travelFee: TRAVEL_FEE,
//             });
//             Alert.alert("Cancelled", "The job has been cancelled.");
//             navigation.navigate("ServiceProviderDashboard");
//           } catch (err) {
//             console.error("Cancel-job error:", err);
//             Alert.alert("Error", "Cancellation failed.");
//           } finally {
//             setCancelling(false);
//           }
//         },
//       },
//     ]);
//   };

//   const pickAndUpload = async (phase) => {
//     const status = await ImagePicker.requestCameraPermissionsAsync();
//     if (status.status !== "granted") {
//       return Alert.alert("Permission denied", "Camera access is required.");
//     }
//     const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
//     const uri = result.assets?.[0]?.uri;
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
//       Alert.alert(
//         "Done",
//         "You’ve marked the job complete. Waiting for customer confirmation."
//       );
//     } catch (err) {
//       console.error("Finalize error:", err);
//       Alert.alert("Error", "Could not finalize job.");
//     }
//   };

//   if (loading) return <ActivityIndicator style={styles.center} size="large" />;
//   if (!job) return <Text style={styles.center}>No job found.</Text>;

//   const awaitingAdditional = job.status === "awaiting-additional-payment";
//   const ac = job.additionalCharge || 0;
//   const estimatedTotal = job.estimatedTotal || 0;

//   return (
//     <ScreenWrapper>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={100}
//       >
//         <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
//           <View style={styles.containerLogo}>
//             <Image
//               source={require("../assets/blinqfix_logo-new.jpeg")}
//               style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
//               resizeMode="contain"
//             />
//           </View>
//           {showNotification && (
//             <View
//               style={{
//                 backgroundColor: "#e0f7fa",
//                 padding: 12,
//                 borderRadius: 8,
//                 marginBottom: 10,
//               }}
//             >
//               <Text
//                 style={[
//                   styles.notification,
//                   { color: "#00796b", fontWeight: "bold", fontSize: 22 },
//                 ]}
//               >
//                 Emergency Job Awarded!
//               </Text>
//               <Text style={[styles.notification, { color: "#004d40" }]}>
//                 Congrats you got the job. Customer has been notified that you
//                 will be in route shortly.
//               </Text>
//             </View>
//           )}

//           {job.paymentStatus !== "paid" && (
//             <Text style={styles.alert}>** Status will update live **</Text>
//           )}
//           <JobDetails jobId={jobId} job={job} />
//           {showPhone && job?.customer?.phoneNumber && (
//             <Text style={styles.phone}>
//               Customer Phone: {job.customer.phoneNumber}
//             </Text>
//           )}

//           <View style={styles.card}>
//             <Text style={styles.title}>Provider Actions</Text>
//             <Text style={{ textAlign: "center", marginBottom: 10 }}>
//               Additional Charge: ${ac.toFixed(2)}
//               {"\n"}
//               Estimate Total: ${estimatedTotal.toFixed(2)}
//             </Text>
//             <Text style={styles.label}>Step1: Arrival Photo</Text>
//             <CustomButton
//               title="Capture Arrival Photo"
//               onPress={() => pickAndUpload("arrival")}
//               disabled={awaitingAdditional}
//             />
//             <Text style={styles.label}>Step2: Additional Charge</Text>
//             <TextInput
//               style={styles.input}
//               keyboardType="numeric"
//               value={additionalCharge}
//               onChangeText={setAdditionalCharge}
//               placeholder="e.g. 50.00"
//             />
//             <TextInput
//               style={styles.input}
//               value={additionalChargeReason}
//               onChangeText={setAdditionalChargeReason}
//               placeholder="Reason for additional charge"
//             />
//             <CustomButton
//               title="Submit Additional Charge"
//               onPress={handleUpdateCharge}
//               disabled={awaitingAdditional}
//             />
//             {awaitingAdditional && (
//               <Text style={styles.warn}>Awaiting homeowner payment…</Text>
//             )}
//             <Text style={styles.label}>Step3: Completion Photo</Text>
//             <CustomButton
//               title="Capture Completion Photo"
//               onPress={() => pickAndUpload("completion")}
//               disabled={awaitingAdditional}
//             />
//             <Text style={styles.label}>Step4: Finalize Job</Text>
//             <CustomButton
//               title="Mark Job Completed"
//               onPress={handleFinalize}
//               disabled={!job.arrivalImage || !job.completionImage}
//             />
//             <CustomButton
//               title={cancelling ? "Cancelling…" : "Cancel Job"}
//               onPress={handleCancelJob}
//               color="red"
//               disabled={cancelling}
//             />
//           </View>
//         </ScrollView>

//         {showNotCompleteModal && (
//           <Modal visible transparent animationType="slide">
//             <View style={styles.modalOverlay}>
//               <View style={styles.modalContent}>
//                 <Text style={styles.title}>Job Marked as Incomplete</Text>
//                 <Text style={{ marginVertical: 10 }}>
//                   The customer marked this job as not complete. Please review
//                   and address any issues before re-submitting completion.
//                 </Text>
//                 <TouchableOpacity
//                   style={styles.confirmButton}
//                   onPress={() => setShowNotCompleteModal(false)}
//                 >
//                   <Text style={styles.confirmButtonText}>OK</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </Modal>
//         )}
//       </KeyboardAvoidingView>
//     </ScreenWrapper>
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
//   notification: { color: "red", textAlign: "center" },
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
//   customButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.4)",
//   },
//   modalContent: {
//     backgroundColor: "white",
//     padding: 20,
//     borderRadius: 10,
//     width: "90%",
//     alignItems: "center",
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
//   TouchableOpacity,
//   Platform,
//   KeyboardAvoidingView,
//   Modal,
//   SafeAreaView,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   ArrowLeft,
//   Briefcase,
//   Camera,
//   CheckCircle,
//   Circle,
//   DollarSign,
//   AlertTriangle,
//   Send,
//   Flag,
//   XCircle,
//   Phone,
//   UserCircle,
// } from "lucide-react-native";
// import JobDetails from "../components/JobDetails";
// import api from "../api/client";
// import { saveSession, clearSession } from "../utils/sessionManager";

// const TRAVEL_FEE = 100;

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
//   const [showNotCompleteModal, setShowNotCompleteModal] = useState(false);
//   const hasSeenNotCompleteRef = useRef(false);

//   const phoneTimer = useRef(null);
//   //loops job fetch
//   useEffect(() => {
//     let alive = true;
//     const fetchJob = async () => {
//       let jobFetched = false;
//       try {
//         const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
//         if (!alive) return;
//         setJob(data);
//         jobFetched = true;
        
//         if (
//           data.customerMarkedIncomplete &&
//           !hasSeenNotCompleteRef.current &&
//           data.status !== "completed"
//           ) {
//             setShowNotCompleteModal(true);
//             hasSeenNotCompleteRef.current = true;
            
//         }

//        {
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
//       } catch (err) {
//         console.error("Fetch job failed:", err);
//         if (!jobFetched) alive && Alert.alert("Error", "Unable to load job");
//       } finally {
//         alive && setLoading(false);
//       }
//     };

//     fetchJob();
//     const interval = setInterval(fetchJob, 20000);
//     return () => {
//       alive = false;
//       clearInterval(interval);
//       if (phoneTimer.current) clearTimeout(phoneTimer.current);
//     };
//   }, [jobId, notifiedComplete, navigation]);

//   useEffect(() => {
//     if (job?.status === "cancelled-by-customer") {
//       Alert.alert("Job Cancelled", "The customer has cancelled this job.", [
//         {
//           text: "OK",
//           onPress: () => navigation.navigate("ServiceProviderDashboard"),
//         },
//       ]);
//     }
//   }, [job?.status]);

//   useEffect(() => {
//     if (job && job.status !== "completed") {
//       saveSession({ role: "serviceProvider", jobId: job._id });
//     }
//   }, [job]);

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
//       setAdditionalCharge("");
//       setAdditionalChargeReason("");
//       Alert.alert("Extra Charge Recorded", "Redirecting homeowner to payment…");
//     } catch (err) {
//       console.error("Update-charge error:", err);
//       Alert.alert("Error", "Failed to record extra charge.");
//     }
//   };

//   const handleCancelJob = async () => {
//     Alert.alert("Cancel Job", "Are you sure you want to cancel this job?", [
//       { text: "No", style: "cancel" },
//       {
//         text: "Yes, Cancel",
//         style: "destructive",
//         onPress: async () => {
//           setCancelling(true);
//           await clearSession();

//           try {
//             await api.put(`/jobs/${jobId}/cancelled`, {
//               cancelledBy: "serviceProvider",
//               travelFee: TRAVEL_FEE,
//             });
//             Alert.alert("Cancelled", "The job has been cancelled.");
//             navigation.navigate("ServiceProviderDashboard");
//           } catch (err) {
//             console.error("Cancel-job error:", err);
//             Alert.alert("Error", "Cancellation failed.");
//           } finally {
//             setCancelling(false);
//           }
//         },
//       },
//     ]);
//   };

//   const pickAndUpload = async (phase) => {
//     const status = await ImagePicker.requestCameraPermissionsAsync();
//     if (status.status !== "granted") {
//       return Alert.alert("Permission denied", "Camera access is required.");
//     }
//     const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
//     const uri = result.assets?.[0]?.uri;
//     if (!uri) return; // No need for an alert if user cancels picker
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
//       Alert.alert(
//         "Done",
//         "You’ve marked the job complete. Waiting for customer confirmation."
//       );
//     } catch (err) {
//       console.error("Finalize error:", err);
//       Alert.alert("Error", "Could not finalize job.");
//     }
//   };

//   if (loading) {
//      return (
//         <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.center}>
//             <ActivityIndicator size="large" color="#fff" />
//         </LinearGradient>
//     );
//   }

//   if (!job) {
//      return (
//         <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.center}>
//             <Text style={styles.errorText}>No job found.</Text>
//         </LinearGradient>
//     );
//   }

//   const awaitingAdditional = job.status === "awaiting-additional-payment";
  
//   return (
//      <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={{ flex: 1 }}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//             style={{ flex: 1 }}
//             behavior={Platform.OS === "ios" ? "padding" : "height"}
//             keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
//         >
//             <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
//                 {/* Header */}
//                 <View style={styles.header}>
//                     <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//                         <ArrowLeft color="#fff" size={24} />
//                     </TouchableOpacity>
//                     <View style={styles.headerTitleContainer}>
//                         <View style={styles.headerBadge}>
//                             <Briefcase color="#60a5fa" size={14} />
//                             <Text style={styles.headerBadgeText}>Live Job Status</Text>
//                         </View>
//                         <Text style={styles.title}>Job Workflow</Text>
//                     </View>
//                     <View style={{width: 44}} />
//                 </View>

//                 {/* Customer Details Card */}
//                 <View style={styles.card}>
//                     <View style={styles.cardHeader}>
//                         <UserCircle color="#c084fc" size={24} />
//                         <Text style={styles.cardTitle}>Customer & Job Details</Text>
//                     </View>
//                     <JobDetails jobId={jobId} job={job} textStyle={{color: '#e0e7ff'}} />
//                     {showPhone && job?.customer?.phoneNumber && (
//                        <View style={styles.phoneContainer}>
//                             <Phone color="#22c55e" size={16} />
//                             <Text style={styles.phoneText}>{job.customer.phoneNumber}</Text>
//                        </View>
//                     )}
//                 </View>

//                 {/* Workflow Steps */}
//                 <View style={styles.workflowContainer}>
//                     {/* Step 1: Arrival Photo */}
//                     <View style={styles.stepCard}>
//                         <View style={styles.stepHeader}>
//                             {job.arrivalImage ? <CheckCircle color="#22c55e" size={24} /> : <Circle color="#94a3b8" size={24} />}
//                             <Text style={styles.stepTitle}>Step 1: Arrival Photo</Text>
//                         </View>
//                         <Text style={styles.stepDescription}>Capture a photo upon arriving at the job location.</Text>
//                         <TouchableOpacity 
//                             style={[styles.actionButton, job.arrivalImage && styles.actionButtonCompleted]} 
//                             onPress={() => pickAndUpload("arrival")}
//                             disabled={awaitingAdditional}
//                         >
//                             <Camera color={job.arrivalImage ? "#22c55e" : "#fff"} size={20} />
//                             <Text style={[styles.actionButtonText, job.arrivalImage && {color: '#22c55e'}]}>{job.arrivalImage ? "Arrival Photo Uploaded" : "Capture Arrival Photo"}</Text>
//                         </TouchableOpacity>
//                     </View>

//                     {/* Step 2: Additional Charge */}
//                     <View style={styles.stepCard}>
//                         <View style={styles.stepHeader}>
//                             {job.additionalCharge ? <CheckCircle color="#22c55e" size={24} /> : <Circle color="#94a3b8" size={24} />}
//                             <Text style={styles.stepTitle}>Step 2: Add-ons & Charges (Optional)</Text>
//                         </View>
//                         <Text style={styles.stepDescription}>If required, add any additional charges for parts or labor not in the original estimate.</Text>
//                         <TextInput
//                             style={styles.input}
//                             keyboardType="numeric"
//                             value={additionalCharge}
//                             onChangeText={setAdditionalCharge}
//                             placeholder="Amount (e.g., 50.00)"
//                             placeholderTextColor="#94a3b8"
//                         />
//                         <TextInput
//                             style={[styles.input, {height: 80}]}
//                             value={additionalChargeReason}
//                             onChangeText={setAdditionalChargeReason}
//                             placeholder="Reason for charge (e.g., replacement part)"
//                             placeholderTextColor="#94a3b8"
//                             multiline
//                         />
//                         <TouchableOpacity 
//                             style={[styles.actionButton, awaitingAdditional && styles.actionButtonDisabled]} 
//                             onPress={handleUpdateCharge}
//                             disabled={awaitingAdditional}
//                         >
//                             <DollarSign color="#fff" size={20} />
//                             <Text style={styles.actionButtonText}>{awaitingAdditional ? "Awaiting Customer Payment" : "Submit Additional Charge"}</Text>
//                         </TouchableOpacity>
//                     </View>

//                     {/* Step 3: Completion Photo */}
//                     <View style={styles.stepCard}>
//                         <View style={styles.stepHeader}>
//                             {job.completionImage ? <CheckCircle color="#22c55e" size={24} /> : <Circle color="#94a3b8" size={24} />}
//                             <Text style={styles.stepTitle}>Step 3: Completion Photo</Text>
//                         </View>
//                         <Text style={styles.stepDescription}>Capture a photo showing the completed work.</Text>
//                         <TouchableOpacity 
//                             style={[styles.actionButton, job.completionImage && styles.actionButtonCompleted]} 
//                             onPress={() => pickAndUpload("completion")}
//                             disabled={awaitingAdditional}
//                         >
//                             <Camera color={job.completionImage ? "#22c55e" : "#fff"} size={20} />
//                             <Text style={[styles.actionButtonText, job.completionImage && {color: '#22c55e'}]}>{job.completionImage ? "Completion Photo Uploaded" : "Capture Completion Photo"}</Text>
//                         </TouchableOpacity>
//                     </View>

//                     {/* Step 4: Finalize */}
//                     <View style={styles.stepCard}>
//                         <View style={styles.stepHeader}>
//                             {job.providerCompleted ? <CheckCircle color="#22c55e" size={24} /> : <Circle color="#94a3b8" size={24} />}
//                             <Text style={styles.stepTitle}>Step 4: Finalize Job</Text>
//                         </View>
//                         <Text style={styles.stepDescription}>Once all work is done and photos are uploaded, mark the job as completed to notify the customer.</Text>
//                         <TouchableOpacity 
//                             style={[
//                                 styles.primaryButton, 
//                                 (!job.arrivalImage || !job.completionImage) && styles.actionButtonDisabled
//                             ]}
//                             onPress={handleFinalize}
//                             disabled={!job.arrivalImage || !job.completionImage}
//                         >
//                             <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.buttonGradient}>
//                                 <Flag color="#fff" size={20} />
//                                 <Text style={styles.primaryButtonText}>{job.providerCompleted ? "Waiting for Customer" : "Mark Job Completed"}</Text>
//                             </LinearGradient>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
                
//                 {/* Danger Zone */}
//                 <View style={styles.dangerZone}>
//                      <View style={styles.cardHeader}>
//                         <AlertTriangle color="#ef4444" size={24} />
//                         <Text style={styles.cardTitle}>Danger Zone</Text>
//                     </View>
//                     <TouchableOpacity
//                         style={styles.dangerButton}
//                         onPress={handleCancelJob}
//                         disabled={cancelling}
//                     >
//                         <XCircle color="#ef4444" size={20} />
//                         <Text style={styles.dangerButtonText}>
//                             {cancelling ? "Cancelling…" : "Cancel Job"}
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//             </ScrollView>

//             {/* Modal for Incomplete Job */}
//             <Modal
//                 visible={showNotCompleteModal}
//                 transparent
//                 animationType="fade"
//                 onRequestClose={() => setShowNotCompleteModal(false)}
//             >
//                 <View style={styles.modalOverlay}>
//                     <View style={styles.modalContent}>
//                         <AlertTriangle color="#fb923c" size={48} style={{ marginBottom: 16 }} />
//                         <Text style={styles.modalTitle}>Job Marked as Incomplete</Text>
//                         <Text style={styles.modalText}>
//                             The customer marked this job as not complete. Please review
//                             and address any issues before re-submitting completion.
//                         </Text>
//                         <TouchableOpacity
//                             style={styles.modalButton}
//                             onPress={() => setShowNotCompleteModal(false)}
//                         >
//                            <Text style={styles.modalButtonText}>OK, Understood</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </Modal>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   center: { 
//     flex: 1, 
//     justifyContent: "center", 
//     alignItems: "center",
    
//   },
//   errorText: {
//     color: '#fff',
//     fontSize: 18,
//     textAlign: 'center'
//   },
//   container: { 
//     paddingHorizontal: 20, 
//     paddingBottom: 40,
//     marginTop:40, 
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingTop: 20,
//     paddingBottom: 20,
//   },
//   backButton: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     padding: 10,
//     borderRadius: 22,
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitleContainer: {
//     alignItems: 'center'
//   },
//   headerBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(96, 165, 250, 0.15)',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 16,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: 'rgba(96, 165, 250, 0.3)'
//   },
//   headerBadgeText: {
//     color: '#60a5fa',
//     marginLeft: 6,
//     fontSize: 12,
//     fontWeight: '500'
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   card: {
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.1)',
   
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginLeft: 12,
//   },
//   phoneContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginTop: 16,
//       backgroundColor: 'rgba(34, 197, 94, 0.1)',
//       padding: 12,
//       borderRadius: 12,
//       justifyContent: 'center',
//       gap: 8,
//   },
//   phoneText: {
//       color: '#22c55e',
//       fontSize: 16,
//       fontWeight: '600'
//   },
//   workflowContainer: {
//       gap: 16
//   },
//   stepCard: {
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.1)'
//   },
//   stepHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 8
//   },
//   stepTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   stepDescription: {
//     fontSize: 14,
//     color: '#94a3b8',
//     marginBottom: 16,
//     lineHeight: 20
//   },
//   input: {
//     backgroundColor: 'rgba(0,0,0,0.2)',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     color: '#fff',
//     marginBottom: 12
//   },
//   actionButton: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 12,
//     paddingVertical: 14,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//   },
//   actionButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600'
//   },
//   actionButtonCompleted: {
//     backgroundColor: 'rgba(34, 197, 94, 0.1)',
//     borderColor: 'rgba(34, 197, 94, 0.3)',
//   },
//   actionButtonDisabled: {
//       backgroundColor: 'rgba(255,255,255,0.05)',
//       opacity: 0.6
//   },
//   primaryButton: {
//     borderRadius: 12,
//     overflow: 'hidden'
//   },
//   buttonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 16,
//     gap: 8
//   },
//   primaryButtonText: {
//       color: '#fff',
//       fontSize: 16,
//       fontWeight: 'bold'
//   },
//   dangerZone: {
//     marginTop: 24,
//     backgroundColor: 'rgba(239, 68, 68, 0.05)',
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(239, 68, 68, 0.2)'
//   },
//   dangerButton: {
//     backgroundColor: 'rgba(239, 68, 68, 0.1)',
//     borderRadius: 12,
//     paddingVertical: 14,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     borderWidth: 1,
//     borderColor: 'rgba(239, 68, 68, 0.3)',
//   },
//   dangerButtonText: {
//     color: '#ef4444',
//     fontSize: 16,
//     fontWeight: '600'
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.7)",
//   },
//   modalContent: {
//     backgroundColor: "#1e293b",
//     padding: 24,
//     borderRadius: 16,
//     width: "90%",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.1)'
//   },
//   modalTitle: {
//       fontSize: 20,
//       fontWeight: 'bold',
//       color: '#fff',
//       marginBottom: 12,
//       textAlign: 'center'
//   },
//   modalText: {
//       fontSize: 16,
//       color: '#e0e7ff',
//       textAlign: 'center',
//       lineHeight: 24,
//       marginBottom: 24
//   },
//   modalButton: {
//       backgroundColor: '#fb923c',
//       borderRadius: 12,
//       paddingVertical: 14,
//       width: '100%',
//       alignItems: 'center'
//   },
//   modalButtonText: {
//       color: '#fff',
//       fontSize: 16,
//       fontWeight: 'bold'
//   }
// });

// import React, { useEffect, useState, useRef, useCallback } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   ActivityIndicator,
//   StyleSheet,
//   TextInput,
//   Alert,
//   Image,
//   TouchableOpacity,
//   Platform,
//   KeyboardAvoidingView,
//   Modal,
//   SafeAreaView,
//   Vibration,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import * as Notifications from "expo-notifications";
// import { Audio } from "expo-av";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   ArrowLeft,
//   Briefcase,
//   Camera,
//   CheckCircle,
//   Circle,
//   DollarSign,
//   AlertTriangle,
//   Flag,
//   XCircle,
//   Phone,
//   UserCircle,
//   CreditCard,
// } from "lucide-react-native";
// import JobDetails from "../components/JobDetails";
// import api from "../api/client";
// import { saveSession, clearSession } from "../utils/sessionManager";

// const TRAVEL_FEE = 100;

// // 🔊 local chime for foreground (same sound as invitations)
// const NOTIF_SOUND = require("../assets/notification.mp3");

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
//   const [showNotCompleteModal, setShowNotCompleteModal] = useState(false);

//   // NEW: “Additional payment received” banner state
//   const [showPaidBanner, setShowPaidBanner] = useState(false);

//   const hasSeenNotCompleteRef = useRef(false);
//   const phoneTimer = useRef(null);

//   // track transition from awaiting -> paid
//   const prevAwaitingRef = useRef(false);
//   const paidBannerTimerRef = useRef(null);

//   // ---------- helpers to detect states ----------
//   const isAwaitingAdditional = useCallback((j) => {
//     if (!j) return false;
//     return (
//       j.status === "awaiting-additional-payment" ||
//       j?.billingStatus === "awaiting-additional" ||
//       j?.additionalPaymentStatus === "awaiting" ||
//       j?.paymentStatus === "awaiting_additional"
//     );
//   }, []);

//   const isAdditionalPaid = useCallback((j) => {
//     if (!j) return false;
//     const hasAddon = Number(j?.additionalCharge) > 0;
//     if (!hasAddon) return false;
//     return (
//       j?.additionalPaymentStatus === "paid" ||
//       j?.additionalPaid === true ||
//       j?.paymentStatus === "paid_additional" ||
//       j?.billingStatus === "additional_paid" ||
//       // generic: no longer awaiting but there WAS an additional charge
//       (!isAwaitingAdditional(j) &&
//         (j?.status === "accepted" ||
//           j?.status === "in-progress" ||
//           j?.status === "arrived" ||
//           j?.paymentStatus === "paid"))
//     );
//   }, [isAwaitingAdditional]);

//   // 🔔 play chime
//   const playChime = useCallback(async () => {
//     try {
//       Vibration.vibrate([0, 300, 150, 300]);
//       const { sound } = await Audio.Sound.createAsync(NOTIF_SOUND, {
//         shouldPlay: true,
//         isLooping: false,
//         volume: 1.0,
//       });
//       sound.setOnPlaybackStatusUpdate(async (s) => {
//         if (s.didJustFinish) {
//           try {
//             await sound.unloadAsync();
//           } catch {}
//         }
//       });
//     } catch {}
//   }, []);

//   // 📨 local OS banner
//   const notifyPaid = useCallback(async (amount) => {
//     try {
//       await Notifications.scheduleNotificationAsync({
//         content: {
//           title: "Additional Payment Received",
//           body:
//             Number.isFinite(Number(amount)) && Number(amount) > 0
//               ? `Customer paid $${Number(amount).toFixed(2)}. You can proceed.`
//               : "Customer’s additional payment is complete. You can proceed.",
//           data: { jobId, type: "additional_payment_paid" },
//           sound: Platform.OS === "ios" ? "notification.wav" : undefined,
//         },
//         trigger: Platform.select({
//           android: { channelId: "job-invites-v2" }, // custom-sound channel from App.js
//           ios: null,
//         }),
//       });
//     } catch {}
//   }, [jobId]);

//   // ---------- bootstrap / polling ----------
//   useEffect(() => {
//     let alive = true;

//     const fetchJob = async () => {
//       let jobFetched = false;
//       try {
//         const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
//         if (!alive) return;
//         jobFetched = true;

//         // detect awaiting->paid transition BEFORE setJob
//         const wasAwaiting = prevAwaitingRef.current;
//         const nowAwaiting = isAwaitingAdditional(data);

//         // set new job
//         setJob(data);

//         // show incomplete modal
//         if (
//           data.customerMarkedIncomplete &&
//           !hasSeenNotCompleteRef.current &&
//           data.status !== "completed"
//         ) {
//           setShowNotCompleteModal(true);
//           hasSeenNotCompleteRef.current = true;
//         }

//         // phone reveal after accept
//         if (data.acceptedProvider && !phoneTimer.current) {
//           phoneTimer.current = setTimeout(() => setShowPhone(true), 6 * 60 * 1000);
//         }

//         // completion routing
//         if (data.customerCompleted && data.providerCompleted && !notifiedComplete) {
//           setNotifiedComplete(true);
//           Alert.alert("Job Complete", "This job is now fully completed.", [
//             { text: "OK", onPress: () => navigation.navigate("ServiceProviderDashboard") },
//           ]);
//           await clearSession();
//         }

//         // ---------- NEW: paid transition banner + notification ----------
//         if (wasAwaiting && !nowAwaiting && isAdditionalPaid(data)) {
//           setShowPaidBanner(true);
//           playChime();
//           notifyPaid(data.additionalCharge);

//           if (paidBannerTimerRef.current) clearTimeout(paidBannerTimerRef.current);
//           paidBannerTimerRef.current = setTimeout(() => setShowPaidBanner(false), 10000);
//         }

//         // update prev flag last
//         prevAwaitingRef.current = nowAwaiting;
//       } catch (err) {
//         console.error("Fetch job failed:", err);
//         if (!jobFetched && alive) Alert.alert("Error", "Unable to load job");
//       } finally {
//         alive && setLoading(false);
//       }
//     };

//     fetchJob();
//     const interval = setInterval(fetchJob, 20000);
//     return () => {
//       alive = false;
//       clearInterval(interval);
//       if (phoneTimer.current) clearTimeout(phoneTimer.current);
//       if (paidBannerTimerRef.current) clearTimeout(paidBannerTimerRef.current);
//     };
//   }, [jobId, navigation, notifiedComplete, isAwaitingAdditional, isAdditionalPaid, playChime, notifyPaid]);

//   // cancelled by customer quick exit
//   useEffect(() => {
//     if (job?.status === "cancelled-by-customer") {
//       Alert.alert("Job Cancelled", "The customer has cancelled this job.", [
//         { text: "OK", onPress: () => navigation.navigate("ServiceProviderDashboard") },
//       ]);
//     }
//   }, [job?.status, navigation]);

//   // persist session while active
//   useEffect(() => {
//     if (job && job.status !== "completed") {
//       saveSession({ role: "serviceProvider", jobId: job._id });
//     }
//   }, [job, jobId]);

//   // ----- actions -----
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
//       setAdditionalCharge("");
//       setAdditionalChargeReason("");
//       Alert.alert("Extra Charge Recorded", "Redirecting homeowner to payment…");
//       // mark current state as awaiting so we can detect completion later
//       prevAwaitingRef.current = true;
//     } catch (err) {
//       console.error("Update-charge error:", err);
//       Alert.alert("Error", "Failed to record extra charge.");
//     }
//   };

//   const handleCancelJob = async () => {
//     Alert.alert("Cancel Job", "Are you sure you want to cancel this job?", [
//       { text: "No", style: "cancel" },
//       {
//         text: "Yes, Cancel",
//         style: "destructive",
//         onPress: async () => {
//           setCancelling(true);
//           await clearSession();
//           try {
//             await api.put(`/jobs/${jobId}/cancelled`, {
//               cancelledBy: "serviceProvider",
//               travelFee: TRAVEL_FEE,
//             });
//             Alert.alert("Cancelled", "The job has been cancelled.");
//             navigation.navigate("ServiceProviderDashboard");
//           } catch (err) {
//             console.error("Cancel-job error:", err);
//             Alert.alert("Error", "Cancellation failed.");
//           } finally {
//             setCancelling(false);
//           }
//         },
//       },
//     ]);
//   };

//   const pickAndUpload = async (phase) => {
//     const status = await ImagePicker.requestCameraPermissionsAsync();
//     if (status.status !== "granted") {
//       return Alert.alert("Permission denied", "Camera access is required.");
//     }
//     const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
//     const uri = result.assets?.[0]?.uri;
//     if (!uri) return;
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
//       Alert.alert("Done", "You’ve marked the job complete. Waiting for customer confirmation.");
//     } catch (err) {
//       console.error("Finalize error:", err);
//       Alert.alert("Error", "Could not finalize job.");
//     }
//   };

//   // ---------- loading / empty ----------
//   if (loading) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.center}>
//         <ActivityIndicator size="large" color="#fff" />
//       </LinearGradient>
//     );
//   }

//   if (!job) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.center}>
//         <Text style={styles.errorText}>No job found.</Text>
//       </LinearGradient>
//     );
//   }

//   const awaitingAdditional = isAwaitingAdditional(job);
//   const additionalPaid = isAdditionalPaid(job);
//   const hasAddon = Number(job?.additionalCharge) > 0;

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={{ flex: 1 }}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
//         >
//           <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
//             {/* Header */}
//             <View style={styles.header}>
//               <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//                 <ArrowLeft color="#fff" size={24} />
//               </TouchableOpacity>
//               <View style={styles.headerTitleContainer}>
//                 <View style={styles.headerBadge}>
//                   <Briefcase color="#60a5fa" size={14} />
//                   <Text style={styles.headerBadgeText}>Live Job Status</Text>
//                 </View>
//                 <Text style={styles.title}>Job Workflow</Text>
//               </View>
//               <View style={{ width: 44 }} />
//             </View>

//             {/* NEW: Additional payment paid banner (10s) */}
//             {showPaidBanner && (
//               <View style={styles.paidBanner}>
//                 <LinearGradient
//                   colors={["rgba(34,197,94,0.20)", "rgba(16,185,129,0.10)"]}
//                   style={styles.paidBannerGradient}
//                 >
//                   <View style={styles.paidBannerHeader}>
//                     <CreditCard color="#22c55e" size={22} />
//                     <Text style={styles.paidBannerTitle}>Additional Payment Received</Text>
//                   </View>
//                   <Text style={styles.paidBannerText}>
//                     {hasAddon
//                       ? `Customer paid $${Number(job.additionalCharge).toFixed(2)}. You can continue the work.`
//                       : "Customer's additional payment is complete. You can continue the work."}
//                   </Text>
//                 </LinearGradient>
//               </View>
//             )}

//             {/* Customer Details Card */}
//             <View style={styles.card}>
//               <View style={styles.cardHeader}>
//                 <UserCircle color="#c084fc" size={24} />
//                 <Text style={styles.cardTitle}>Customer & Job Details</Text>
//               </View>
//               <JobDetails jobId={jobId} job={job} textStyle={{ color: "#e0e7ff" }} />
//               {showPhone && job?.customer?.phoneNumber && (
//                 <View style={styles.phoneContainer}>
//                   <Phone color="#22c55e" size={16} />
//                   <Text style={styles.phoneText}>{job.customer.phoneNumber}</Text>
//                 </View>
//               )}
//             </View>

//             {/* Workflow Steps */}
//             <View style={styles.workflowContainer}>
//               {/* Step 1: Arrival Photo */}
//               <View style={styles.stepCard}>
//                 <View style={styles.stepHeader}>
//                   {job.arrivalImage ? (
//                     <CheckCircle color="#22c55e" size={24} />
//                   ) : (
//                     <Circle color="#94a3b8" size={24} />
//                   )}
//                   <Text style={styles.stepTitle}>Step 1: Arrival Photo</Text>
//                 </View>
//                 <Text style={styles.stepDescription}>
//                   Capture a photo upon arriving at the job location.
//                 </Text>
//                 <TouchableOpacity
//                   style={[styles.actionButton, job.arrivalImage && styles.actionButtonCompleted]}
//                   onPress={() => pickAndUpload("arrival")}
//                   disabled={awaitingAdditional}
//                 >
//                   <Camera color={job.arrivalImage ? "#22c55e" : "#fff"} size={20} />
//                   <Text
//                     style={[
//                       styles.actionButtonText,
//                       job.arrivalImage && { color: "#22c55e" },
//                     ]}
//                   >
//                     {job.arrivalImage ? "Arrival Photo Uploaded" : "Capture Arrival Photo"}
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               {/* Step 2: Additional Charge */}
//               <View style={styles.stepCard}>
//                 <View style={styles.stepHeader}>
//                   {hasAddon && additionalPaid ? (
//                     <CheckCircle color="#22c55e" size={24} />
//                   ) : hasAddon && awaitingAdditional ? (
//                     <Circle color="#f59e0b" size={24} />
//                   ) : hasAddon ? (
//                     <CheckCircle color="#22c55e" size={24} />
//                   ) : (
//                     <Circle color="#94a3b8" size={24} />
//                   )}
//                   <Text style={styles.stepTitle}>Step 2: Add-ons & Charges (Optional)</Text>

//                   {/* status pill */}
//                   {hasAddon && (
//                     <View
//                       style={[
//                         styles.statusPill,
//                         awaitingAdditional
//                           ? styles.statusPillAwaiting
//                           : styles.statusPillPaid,
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           styles.statusPillText,
//                           awaitingAdditional && { color: "#f59e0b" },
//                         ]}
//                       >
//                         {awaitingAdditional ? "Awaiting Payment" : "Paid"}
//                       </Text>
//                     </View>
//                   )}
//                 </View>

//                 <Text style={styles.stepDescription}>
//                   If required, add any additional charges for parts or labor not in the original
//                   estimate.
//                 </Text>

//                 {!hasAddon || awaitingAdditional ? (
//                   <>
//                     <TextInput
//                       style={styles.input}
//                       keyboardType="numeric"
//                       value={additionalCharge}
//                       onChangeText={setAdditionalCharge}
//                       placeholder="Amount (e.g., 50.00)"
//                       placeholderTextColor="#94a3b8"
//                     />
//                     <TextInput
//                       style={[styles.input, { height: 80 }]}
//                       value={additionalChargeReason}
//                       onChangeText={setAdditionalChargeReason}
//                       placeholder="Reason for charge (e.g., replacement part)"
//                       placeholderTextColor="#94a3b8"
//                       multiline
//                     />
//                     <TouchableOpacity
//                       style={[styles.actionButton, awaitingAdditional && styles.actionButtonDisabled]}
//                       onPress={handleUpdateCharge}
//                       disabled={awaitingAdditional}
//                     >
//                       <DollarSign color="#fff" size={20} />
//                       <Text style={styles.actionButtonText}>
//                         {awaitingAdditional ? "Awaiting Customer Payment" : "Submit Additional Charge"}
//                       </Text>
//                     </TouchableOpacity>
//                   </>
//                 ) : (
//                   <View style={styles.paidLine}>
//                     <CreditCard color="#22c55e" size={18} />
//                     <Text style={styles.paidLineText}>
//                       Additional payment of ${Number(job.additionalCharge).toFixed(2)} received.
//                     </Text>
//                   </View>
//                 )}
//               </View>

//               {/* Step 3: Completion Photo */}
//               <View style={styles.stepCard}>
//                 <View style={styles.stepHeader}>
//                   {job.completionImage ? (
//                     <CheckCircle color="#22c55e" size={24} />
//                   ) : (
//                     <Circle color="#94a3b8" size={24} />
//                   )}
//                   <Text style={styles.stepTitle}>Step 3: Completion Photo</Text>
//                 </View>
//                 <Text style={styles.stepDescription}>Capture a photo showing the completed work.</Text>
//                 <TouchableOpacity
//                   style={[styles.actionButton, job.completionImage && styles.actionButtonCompleted]}
//                   onPress={() => pickAndUpload("completion")}
//                   disabled={awaitingAdditional}
//                 >
//                   <Camera color={job.completionImage ? "#22c55e" : "#fff"} size={20} />
//                   <Text
//                     style={[
//                       styles.actionButtonText,
//                       job.completionImage && { color: "#22c55e" },
//                     ]}
//                   >
//                     {job.completionImage ? "Completion Photo Uploaded" : "Capture Completion Photo"}
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               {/* Step 4: Finalize */}
//               <View style={styles.stepCard}>
//                 <View style={styles.stepHeader}>
//                   {job.providerCompleted ? (
//                     <CheckCircle color="#22c55e" size={24} />
//                   ) : (
//                     <Circle color="#94a3b8" size={24} />
//                   )}
//                   <Text style={styles.stepTitle}>Step 4: Finalize Job</Text>
//                 </View>
//                 <Text style={styles.stepDescription}>
//                   Once all work is done and photos are uploaded, mark the job as completed to notify
//                   the customer.
//                 </Text>
//                 <TouchableOpacity
//                   style={[
//                     styles.primaryButton,
//                     (!job.arrivalImage || !job.completionImage) && styles.actionButtonDisabled,
//                   ]}
//                   onPress={handleFinalize}
//                   disabled={!job.arrivalImage || !job.completionImage}
//                 >
//                   <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.buttonGradient}>
//                     <Flag color="#fff" size={20} />
//                     <Text style={styles.primaryButtonText}>
//                       {job.providerCompleted ? "Waiting for Customer" : "Mark Job Completed"}
//                     </Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Danger Zone */}
//             <View style={styles.dangerZone}>
//               <View style={styles.cardHeader}>
//                 <AlertTriangle color="#ef4444" size={24} />
//                 <Text style={styles.cardTitle}>Danger Zone</Text>
//               </View>
//               <TouchableOpacity style={styles.dangerButton} onPress={handleCancelJob} disabled={cancelling}>
//                 <XCircle color="#ef4444" size={20} />
//                 <Text style={styles.dangerButtonText}>
//                   {cancelling ? "Cancelling…" : "Cancel Job"}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>

//           {/* Modal for Incomplete Job */}
//           <Modal
//             visible={showNotCompleteModal}
//             transparent
//             animationType="fade"
//             onRequestClose={() => setShowNotCompleteModal(false)}
//           >
//             <View style={styles.modalOverlay}>
//               <View style={styles.modalContent}>
//                 <AlertTriangle color="#fb923c" size={48} style={{ marginBottom: 16 }} />
//                 <Text style={styles.modalTitle}>Job Marked as Incomplete</Text>
//                 <Text style={styles.modalText}>
//                   The customer marked this job as not complete. Please review and address any issues
//                   before re-submitting completion.
//                 </Text>
//                 <TouchableOpacity style={styles.modalButton} onPress={() => setShowNotCompleteModal(false)}>
//                   <Text style={styles.modalButtonText}>OK, Understood</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </Modal>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   errorText: { color: "#fff", fontSize: 18, textAlign: "center" },

//   container: { paddingHorizontal: 20, paddingBottom: 40, marginTop: 40 },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingTop: 20,
//     paddingBottom: 20,
//   },
//   backButton: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     padding: 10,
//     borderRadius: 22,
//     width: 44,
//     height: 44,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   headerTitleContainer: { alignItems: "center" },
//   headerBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(96, 165, 250, 0.15)",
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 16,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: "rgba(96, 165, 250, 0.3)",
//   },
//   headerBadgeText: { color: "#60a5fa", marginLeft: 6, fontSize: 12, fontWeight: "500" },
//   title: { fontSize: 24, fontWeight: "bold", color: "#fff" },

//   // NEW: Paid banner
//   paidBanner: { marginBottom: 16, borderRadius: 16, overflow: "hidden" },
//   paidBannerGradient: { padding: 16 },
//   paidBannerHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
//   paidBannerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
//   paidBannerText: { color: "#e0e7ff", fontSize: 14, lineHeight: 20 },

//   card: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
//   cardTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginLeft: 12 },

//   phoneContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 16,
//     backgroundColor: "rgba(34, 197, 94, 0.1)",
//     padding: 12,
//     borderRadius: 12,
//     justifyContent: "center",
//     gap: 8,
//   },
//   phoneText: { color: "#22c55e", fontSize: 16, fontWeight: "600" },

//   workflowContainer: { gap: 16 },
//   stepCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   stepHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
//   stepTitle: { fontSize: 16, fontWeight: "bold", color: "#fff" },
//   stepDescription: { fontSize: 14, color: "#94a3b8", marginBottom: 16, lineHeight: 20 },

//   input: {
//     backgroundColor: "rgba(0,0,0,0.2)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     color: "#fff",
//     marginBottom: 12,
//   },

//   actionButton: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     borderRadius: 12,
//     paddingVertical: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//   },
//   actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
//   actionButtonCompleted: {
//     backgroundColor: "rgba(34, 197, 94, 0.1)",
//     borderColor: "rgba(34, 197, 94, 0.3)",
//   },
//   actionButtonDisabled: { backgroundColor: "rgba(255,255,255,0.05)", opacity: 0.6 },

//   // finalize
//   primaryButton: { borderRadius: 12, overflow: "hidden" },
//   buttonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 16,
//     gap: 8,
//   },
//   primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

//   // status pill on step 2
//   statusPill: {
//     marginLeft: "auto",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 999,
//     borderWidth: 1,
//   },
//   statusPillAwaiting: {
//     backgroundColor: "rgba(245, 158, 11, 0.12)",
//     borderColor: "rgba(245, 158, 11, 0.35)",
//   },
//   statusPillPaid: {
//     backgroundColor: "rgba(34, 197, 94, 0.12)",
//     borderColor: "rgba(34, 197, 94, 0.35)",
//   },
//   statusPillText: { color: "#22c55e", fontSize: 11, fontWeight: "700" },

//   paidLine: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
//   paidLineText: { color: "#e0e7ff", fontSize: 14, fontWeight: "600" },

//   // danger zone
//   dangerZone: {
//     marginTop: 24,
//     backgroundColor: "rgba(239, 68, 68, 0.05)",
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: "rgba(239, 68, 68, 0.2)",
//   },
//   dangerButton: {
//     backgroundColor: "rgba(239, 68, 68, 0.1)",
//     borderRadius: 12,
//     paddingVertical: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     borderWidth: 1,
//     borderColor: "rgba(239, 68, 68, 0.3)",
//   },
//   dangerButtonText: { color: "#ef4444", fontSize: 16, fontWeight: "600" },

//   // modal
//   modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.7)" },
//   modalContent: {
//     backgroundColor: "#1e293b",
//     padding: 24,
//     borderRadius: 16,
//     width: "90%",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   modalTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 12, textAlign: "center" },
//   modalText: { fontSize: 16, color: "#e0e7ff", textAlign: "center", lineHeight: 24, marginBottom: 24 },
//   modalButton: { backgroundColor: "#fb923c", borderRadius: 12, paddingVertical: 14, width: "100%", alignItems: "center" },
//   modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
// });

// import React, { useEffect, useState, useRef, useCallback } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   ActivityIndicator,
//   StyleSheet,
//   TextInput,
//   Alert,
//   Image,
//   TouchableOpacity,
//   Platform,
//   KeyboardAvoidingView,
//   Modal,
//   SafeAreaView,
//   Vibration,
//   Linking, // ⬅️ added
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import * as Notifications from "expo-notifications";
// import { Audio } from "expo-av";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   ArrowLeft,
//   Briefcase,
//   Camera,
//   CheckCircle,
//   Circle,
//   DollarSign,
//   AlertTriangle,
//   Flag,
//   XCircle,
//   Phone,
//   UserCircle,
//   CreditCard,
// } from "lucide-react-native";
// import JobDetails from "../components/JobDetails";
// import api from "../api/client";
// import { saveSession, clearSession } from "../utils/sessionManager";

// const TRAVEL_FEE = 100;

// // 🔊 local chime for foreground (same sound as invitations)
// const NOTIF_SOUND = require("../assets/notification.mp3");

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
//   const [showNotCompleteModal, setShowNotCompleteModal] = useState(false);

//   // NEW: “Additional payment received” banner state
//   const [showPaidBanner, setShowPaidBanner] = useState(false);

//   const hasSeenNotCompleteRef = useRef(false);
//   const phoneTimer = useRef(null);

//   // track transition from awaiting -> paid
//   const prevAwaitingRef = useRef(false);
//   const paidBannerTimerRef = useRef(null);

//   // ---------- helpers to detect states ----------
//   const isAwaitingAdditional = useCallback((j) => {
//     if (!j) return false;
//     return (
//       j.status === "awaiting-additional-payment" ||
//       j?.billingStatus === "awaiting-additional" ||
//       j?.additionalPaymentStatus === "awaiting" ||
//       j?.paymentStatus === "awaiting_additional"
//     );
//   }, []);

//   const isAdditionalPaid = useCallback(
//     (j) => {
//       if (!j) return false;
//       const hasAddon = Number(j?.additionalCharge) > 0;
//       if (!hasAddon) return false;
//       return (
//         j?.additionalPaymentStatus === "paid" ||
//         j?.additionalPaid === true ||
//         j?.paymentStatus === "paid_additional" ||
//         j?.billingStatus === "additional_paid" ||
//         // generic: no longer awaiting but there WAS an additional charge
//         (!isAwaitingAdditional(j) &&
//           (j?.status === "accepted" ||
//             j?.status === "in-progress" ||
//             j?.status === "arrived" ||
//             j?.paymentStatus === "paid"))
//       );
//     },
//     [isAwaitingAdditional]
//   );

//   // 🔔 play chime
//   const playChime = useCallback(async () => {
//     try {
//       Vibration.vibrate([0, 300, 150, 300]);
//       const { sound } = await Audio.Sound.createAsync(NOTIF_SOUND, {
//         shouldPlay: true,
//         isLooping: false,
//         volume: 1.0,
//       });
//       sound.setOnPlaybackStatusUpdate(async (s) => {
//         if (s.didJustFinish) {
//           try {
//             await sound.unloadAsync();
//           } catch {}
//         }
//       });
//     } catch {}
//   }, []);

//   // 📨 local OS banner
//   const notifyPaid = useCallback(
//     async (amount) => {
//       try {
//         await Notifications.scheduleNotificationAsync({
//           content: {
//             title: "Additional Payment Received",
//             body:
//               Number.isFinite(Number(amount)) && Number(amount) > 0
//                 ? `Customer paid $${Number(amount).toFixed(2)}. You can proceed.`
//                 : "Customer’s additional payment is complete. You can proceed.",
//             data: { jobId, type: "additional_payment_paid" },
//             sound: Platform.OS === "ios" ? "notification.wav" : undefined,
//           },
//           trigger: Platform.select({
//             android: { channelId: "job-invites-v2" }, // custom-sound channel from App.js
//             ios: null,
//           }),
//         });
//       } catch {}
//     },
//     [jobId]
//   );

//   // 📞 call helper
//   const handleCallCustomer = useCallback(async () => {
//     const raw = job?.customer?.phoneNumber;
//     if (!raw) return;

//     // keep digits and a leading +
//     const sanitized = raw.replace(/[^\d+]/g, "");
//     const url = Platform.OS === "ios" ? `telprompt:${sanitized}` : `tel:${sanitized}`;

//     try {
//       const supported = await Linking.canOpenURL(url);
//       if (supported) {
//         await Linking.openURL(url);
//       } else {
//         Alert.alert("Cannot place call", `Please dial ${raw} manually.`);
//       }
//     } catch (e) {
//       Alert.alert("Call failed", `Please dial ${raw} manually.`);
//     }
//   }, [job?.customer?.phoneNumber]);

//   // ---------- bootstrap / polling ----------
//   useEffect(() => {
//     let alive = true;

//     const fetchJob = async () => {
//       let jobFetched = false;
//       try {
//         const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
//         if (!alive) return;
//         jobFetched = true;

//         // detect awaiting->paid transition BEFORE setJob
//         const wasAwaiting = prevAwaitingRef.current;
//         const nowAwaiting = isAwaitingAdditional(data);

//         // set new job
//         setJob(data);

//         // show incomplete modal
//         if (
//           data.customerMarkedIncomplete &&
//           !hasSeenNotCompleteRef.current &&
//           data.status !== "completed"
//         ) {
//           setShowNotCompleteModal(true);
//           hasSeenNotCompleteRef.current = true;
//         }

//         // phone reveal after accept
//         if (data.acceptedProvider && !phoneTimer.current) {
//           phoneTimer.current = setTimeout(() => setShowPhone(true), 6 * 60 * 1000);
//         }

//         // completion routing
//         if (data.customerCompleted && data.providerCompleted && !notifiedComplete) {
//           setNotifiedComplete(true);
//           Alert.alert("Job Complete", "This job is now fully completed.", [
//             { text: "OK", onPress: () => navigation.navigate("ServiceProviderDashboard") },
//           ]);
//           await clearSession();
//         }

//         // ---------- NEW: paid transition banner + notification ----------
//         if (wasAwaiting && !nowAwaiting && isAdditionalPaid(data)) {
//           setShowPaidBanner(true);
//           playChime();
//           notifyPaid(data.additionalCharge);

//           if (paidBannerTimerRef.current) clearTimeout(paidBannerTimerRef.current);
//           paidBannerTimerRef.current = setTimeout(() => setShowPaidBanner(false), 10000);
//         }

//         // update prev flag last
//         prevAwaitingRef.current = nowAwaiting;
//       } catch (err) {
//         console.error("Fetch job failed:", err);
//         if (!jobFetched && alive) Alert.alert("Error", "Unable to load job");
//       } finally {
//         alive && setLoading(false);
//       }
//     };

//     fetchJob();
//     const interval = setInterval(fetchJob, 20000);
//     return () => {
//       alive = false;
//       clearInterval(interval);
//       if (phoneTimer.current) clearTimeout(phoneTimer.current);
//       if (paidBannerTimerRef.current) clearTimeout(paidBannerTimerRef.current);
//     };
//   }, [
//     jobId,
//     navigation,
//     notifiedComplete,
//     isAwaitingAdditional,
//     isAdditionalPaid,
//     playChime,
//     notifyPaid,
//   ]);

//   // cancelled by customer quick exit
//   useEffect(() => {
//     if (job?.status === "cancelled-by-customer") {
//       Alert.alert("Job Cancelled", "The customer has cancelled this job.", [
//         { text: "OK", onPress: () => navigation.navigate("ServiceProviderDashboard") },
//       ]);
//     }
//   }, [job?.status, navigation]);

//   // persist session while active
//   useEffect(() => {
//     if (job && job.status !== "completed") {
//       saveSession({ role: "serviceProvider", jobId: job._id });
//     }
//   }, [job, jobId]);

//   // ----- actions -----
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
//       setAdditionalCharge("");
//       setAdditionalChargeReason("");
//       Alert.alert("Extra Charge Recorded", "Redirecting homeowner to payment…");
//       // mark current state as awaiting so we can detect completion later
//       prevAwaitingRef.current = true;
//     } catch (err) {
//       console.error("Update-charge error:", err);
//       Alert.alert("Error", "Failed to record extra charge.");
//     }
//   };

//   const handleCancelJob = async () => {
//     Alert.alert("Cancel Job", "Are you sure you want to cancel this job?", [
//       { text: "No", style: "cancel" },
//       {
//         text: "Yes, Cancel",
//         style: "destructive",
//         onPress: async () => {
//           setCancelling(true);
//           await clearSession();
//           try {
//             await api.put(`/jobs/${jobId}/cancelled`, {
//               cancelledBy: "serviceProvider",
//               travelFee: TRAVEL_FEE,
//             });
//             Alert.alert("Cancelled", "The job has been cancelled.");
//             navigation.navigate("ServiceProviderDashboard");
//           } catch (err) {
//             console.error("Cancel-job error:", err);
//             Alert.alert("Error", "Cancellation failed.");
//           } finally {
//             setCancelling(false);
//           }
//         },
//       },
//     ]);
//   };

//   const pickAndUpload = async (phase) => {
//     const status = await ImagePicker.requestCameraPermissionsAsync();
//     if (status.status !== "granted") {
//       return Alert.alert("Permission denied", "Camera access is required.");
//     }
//     const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
//     const uri = result.assets?.[0]?.uri;
//     if (!uri) return;
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
//       Alert.alert("Done", "You’ve marked the job complete. Waiting for customer confirmation.");
//     } catch (err) {
//       console.error("Finalize error:", err);
//       Alert.alert("Error", "Could not finalize job.");
//     }
//   };

//   // ---------- loading / empty ----------
//   if (loading) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.center}>
//         <ActivityIndicator size="large" color="#fff" />
//       </LinearGradient>
//     );
//   }

//   if (!job) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.center}>
//         <Text style={styles.errorText}>No job found.</Text>
//       </LinearGradient>
//     );
//   }

//   const awaitingAdditional = isAwaitingAdditional(job);
//   const additionalPaid = isAdditionalPaid(job);
//   const hasAddon = Number(job?.additionalCharge) > 0;

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={{ flex: 1 }}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//           keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
//         >
//           <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
//             {/* Header */}
//             <View style={styles.header}>
//               <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//                 <ArrowLeft color="#fff" size={24} />
//               </TouchableOpacity>
//               <View style={styles.headerTitleContainer}>
//                 <View style={styles.headerBadge}>
//                   <Briefcase color="#60a5fa" size={14} />
//                   <Text style={styles.headerBadgeText}>Live Job Status</Text>
//                 </View>
//                 <Text style={styles.title}>Job Workflow</Text>
//               </View>
//               <View style={{ width: 44 }} />
//             </View>

//             {/* NEW: Additional payment paid banner (10s) */}
//             {showPaidBanner && (
//               <View style={styles.paidBanner}>
//                 <LinearGradient
//                   colors={["rgba(34,197,94,0.20)", "rgba(16,185,129,0.10)"]}
//                   style={styles.paidBannerGradient}
//                 >
//                   <View style={styles.paidBannerHeader}>
//                     <CreditCard color="#22c55e" size={22} />
//                     <Text style={styles.paidBannerTitle}>Additional Payment Received</Text>
//                   </View>
//                   <Text style={styles.paidBannerText}>
//                     {hasAddon
//                       ? `Customer paid $${Number(job.additionalCharge).toFixed(2)}. You can continue the work.`
//                       : "Customer's additional payment is complete. You can continue the work."}
//                   </Text>
//                 </LinearGradient>
//               </View>
//             )}

//             {/* Customer Details Card */}
//             <View style={styles.card}>
//               <View style={styles.cardHeader}>
//                 <UserCircle color="#c084fc" size={24} />
//                 <Text style={styles.cardTitle}>Customer & Job Details</Text>
//               </View>
//               <JobDetails jobId={jobId} job={job} textStyle={{ color: "#e0e7ff" }} />
//               {showPhone && job?.customer?.phoneNumber && (
//                 <TouchableOpacity
//                   activeOpacity={0.85}
//                   onPress={handleCallCustomer}
//                   accessibilityRole="button"
//                   accessibilityLabel={`Call ${job.customer.phoneNumber}`}
//                   style={styles.phoneContainer}
//                 >
//                   <Phone color="#22c55e" size={16} />
//                   <Text style={styles.phoneText}>{job.customer.phoneNumber}</Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             {/* Workflow Steps */}
//             <View style={styles.workflowContainer}>
//               {/* Step 1: Arrival Photo */}
//               <View style={styles.stepCard}>
//                 <View style={styles.stepHeader}>
//                   {job.arrivalImage ? (
//                     <CheckCircle color="#22c55e" size={24} />
//                   ) : (
//                     <Circle color="#94a3b8" size={24} />
//                   )}
//                   <Text style={styles.stepTitle}>Step 1: Arrival Photo</Text>
//                 </View>
//                 <Text style={styles.stepDescription}>
//                   Capture a photo upon arriving at the job location.
//                 </Text>
//                 <TouchableOpacity
//                   style={[styles.actionButton, job.arrivalImage && styles.actionButtonCompleted]}
//                   onPress={() => pickAndUpload("arrival")}
//                   disabled={awaitingAdditional}
//                 >
//                   <Camera color={job.arrivalImage ? "#22c55e" : "#fff"} size={20} />
//                   <Text
//                     style={[
//                       styles.actionButtonText,
//                       job.arrivalImage && { color: "#22c55e" },
//                     ]}
//                   >
//                     {job.arrivalImage ? "Arrival Photo Uploaded" : "Capture Arrival Photo"}
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               {/* Step 2: Additional Charge */}
//               <View style={styles.stepCard}>
//                 <View style={styles.stepHeader}>
//                   {hasAddon && additionalPaid ? (
//                     <CheckCircle color="#22c55e" size={24} />
//                   ) : hasAddon && awaitingAdditional ? (
//                     <Circle color="#f59e0b" size={24} />
//                   ) : hasAddon ? (
//                     <CheckCircle color="#22c55e" size={24} />
//                   ) : (
//                     <Circle color="#94a3b8" size={24} />
//                   )}
//                   <Text style={styles.stepTitle}>Step 2: Add-ons & Charges (Optional)</Text>

//                   {/* status pill */}
//                   {hasAddon && (
//                     <View
//                       style={[
//                         styles.statusPill,
//                         awaitingAdditional
//                           ? styles.statusPillAwaiting
//                           : styles.statusPillPaid,
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           styles.statusPillText,
//                           awaitingAdditional && { color: "#f59e0b" },
//                         ]}
//                       >
//                         {awaitingAdditional ? "Awaiting Payment" : "Paid"}
//                       </Text>
//                     </View>
//                   )}
//                 </View>

//                 <Text style={styles.stepDescription}>
//                   If required, add any additional charges for parts or labor not in the original
//                   estimate.
//                 </Text>

//                 {!hasAddon || awaitingAdditional ? (
//                   <>
//                     <TextInput
//                       style={styles.input}
//                       keyboardType="numeric"
//                       value={additionalCharge}
//                       onChangeText={setAdditionalCharge}
//                       placeholder="Amount (e.g., 50.00)"
//                       placeholderTextColor="#94a3b8"
//                     />
//                     <TextInput
//                       style={[styles.input, { height: 80 }]}
//                       value={additionalChargeReason}
//                       onChangeText={setAdditionalChargeReason}
//                       placeholder="Reason for charge (e.g., replacement part)"
//                       placeholderTextColor="#94a3b8"
//                       multiline
//                     />
//                     <TouchableOpacity
//                       style={[styles.actionButton, awaitingAdditional && styles.actionButtonDisabled]}
//                       onPress={handleUpdateCharge}
//                       disabled={awaitingAdditional}
//                     >
//                       <DollarSign color="#fff" size={20} />
//                       <Text style={styles.actionButtonText}>
//                         {awaitingAdditional ? "Awaiting Customer Payment" : "Submit Additional Charge"}
//                       </Text>
//                     </TouchableOpacity>
//                   </>
//                 ) : (
//                   <View style={styles.paidLine}>
//                     <CreditCard color="#22c55e" size={18} />
//                     <Text style={styles.paidLineText}>
//                       Additional payment of ${Number(job.additionalCharge).toFixed(2)} received.
//                     </Text>
//                   </View>
//                 )}
//               </View>

//               {/* Step 3: Completion Photo */}
//               <View style={styles.stepCard}>
//                 <View style={styles.stepHeader}>
//                   {job.completionImage ? (
//                     <CheckCircle color="#22c55e" size={24} />
//                   ) : (
//                     <Circle color="#94a3b8" size={24} />
//                   )}
//                   <Text style={styles.stepTitle}>Step 3: Completion Photo</Text>
//                 </View>
//                 <Text style={styles.stepDescription}>Capture a photo showing the completed work.</Text>
//                 <TouchableOpacity
//                   style={[styles.actionButton, job.completionImage && styles.actionButtonCompleted]}
//                   onPress={() => pickAndUpload("completion")}
//                   disabled={awaitingAdditional}
//                 >
//                   <Camera color={job.completionImage ? "#22c55e" : "#fff"} size={20} />
//                   <Text
//                     style={[
//                       styles.actionButtonText,
//                       job.completionImage && { color: "#22c55e" },
//                     ]}
//                   >
//                     {job.completionImage ? "Completion Photo Uploaded" : "Capture Completion Photo"}
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               {/* Step 4: Finalize */}
//               <View style={styles.stepCard}>
//                 <View style={styles.stepHeader}>
//                   {job.providerCompleted ? (
//                     <CheckCircle color="#22c55e" size={24} />
//                   ) : (
//                     <Circle color="#94a3b8" size={24} />
//                   )}
//                   <Text style={styles.stepTitle}>Step 4: Finalize Job</Text>
//                 </View>
//                 <Text style={styles.stepDescription}>
//                   Once all work is done and photos are uploaded, mark the job as completed to notify
//                   the customer.
//                 </Text>
//                 <TouchableOpacity
//                   style={[
//                     styles.primaryButton,
//                     (!job.arrivalImage || !job.completionImage) && styles.actionButtonDisabled,
//                   ]}
//                   onPress={handleFinalize}
//                   disabled={!job.arrivalImage || !job.completionImage}
//                 >
//                   <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.buttonGradient}>
//                     <Flag color="#fff" size={20} />
//                     <Text style={styles.primaryButtonText}>
//                       {job.providerCompleted ? "Waiting for Customer" : "Mark Job Completed"}
//                     </Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Danger Zone */}
//             <View style={styles.dangerZone}>
//               <View style={styles.cardHeader}>
//                 <AlertTriangle color="#ef4444" size={24} />
//                 <Text style={styles.cardTitle}>Danger Zone</Text>
//               </View>
//               <TouchableOpacity style={styles.dangerButton} onPress={handleCancelJob} disabled={cancelling}>
//                 <XCircle color="#ef4444" size={20} />
//                 <Text style={styles.dangerButtonText}>
//                   {cancelling ? "Cancelling…" : "Cancel Job"}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </ScrollView>

//           {/* Modal for Incomplete Job */}
//           <Modal
//             visible={showNotCompleteModal}
//             transparent
//             animationType="fade"
//             onRequestClose={() => setShowNotCompleteModal(false)}
//           >
//             <View style={styles.modalOverlay}>
//               <View style={styles.modalContent}>
//                 <AlertTriangle color="#fb923c" size={48} style={{ marginBottom: 16 }} />
//                 <Text style={styles.modalTitle}>Job Marked as Incomplete</Text>
//                 <Text style={styles.modalText}>
//                   The customer marked this job as not complete. Please review and address any issues
//                   before re-submitting completion.
//                 </Text>
//                 <TouchableOpacity style={styles.modalButton} onPress={() => setShowNotCompleteModal(false)}>
//                   <Text style={styles.modalButtonText}>OK, Understood</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </Modal>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   errorText: { color: "#fff", fontSize: 18, textAlign: "center" },

//   container: { paddingHorizontal: 20, paddingBottom: 40, marginTop: 40 },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingTop: 20,
//     paddingBottom: 20,
//   },
//   backButton: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     padding: 10,
//     borderRadius: 22,
//     width: 44,
//     height: 44,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   headerTitleContainer: { alignItems: "center" },
//   headerBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(96, 165, 250, 0.15)",
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 16,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: "rgba(96, 165, 250, 0.3)",
//   },
//   headerBadgeText: { color: "#60a5fa", marginLeft: 6, fontSize: 12, fontWeight: "500" },
//   title: { fontSize: 24, fontWeight: "bold", color: "#fff" },

//   // NEW: Paid banner
//   paidBanner: { marginBottom: 16, borderRadius: 16, overflow: "hidden" },
//   paidBannerGradient: { padding: 16 },
//   paidBannerHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
//   paidBannerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
//   paidBannerText: { color: "#e0e7ff", fontSize: 14, lineHeight: 20 },

//   card: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
//   cardTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginLeft: 12 },

//   phoneContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 16,
//     backgroundColor: "rgba(34, 197, 94, 0.1)",
//     padding: 12,
//     borderRadius: 12,
//     justifyContent: "center",
//     gap: 8,
//   },
//   phoneText: { color: "#22c55e", fontSize: 16, fontWeight: "600", textDecorationLine: "underline" },

//   workflowContainer: { gap: 16 },
//   stepCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   stepHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
//   stepTitle: { fontSize: 16, fontWeight: "bold", color: "#fff" },
//   stepDescription: { fontSize: 14, color: "#94a3b8", marginBottom: 16, lineHeight: 20 },

//   input: {
//     backgroundColor: "rgba(0,0,0,0.2)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     color: "#fff",
//     marginBottom: 12,
//   },

//   actionButton: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     borderRadius: 12,
//     paddingVertical: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//   },
//   actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
//   actionButtonCompleted: {
//     backgroundColor: "rgba(34, 197, 94, 0.1)",
//     borderColor: "rgba(34, 197, 94, 0.3)",
//   },
//   actionButtonDisabled: { backgroundColor: "rgba(255,255,255,0.05)", opacity: 0.6 },

//   // finalize
//   primaryButton: { borderRadius: 12, overflow: "hidden" },
//   buttonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 16,
//     gap: 8,
//   },
//   primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

//   // status pill on step 2
//   statusPill: {
//     marginLeft: "auto",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 999,
//     borderWidth: 1,
//   },
//   statusPillAwaiting: {
//     backgroundColor: "rgba(245, 158, 11, 0.12)",
//     borderColor: "rgba(245, 158, 11, 0.35)",
//   },
//   statusPillPaid: {
//     backgroundColor: "rgba(34, 197, 94, 0.12)",
//     borderColor: "rgba(34, 197, 94, 0.35)",
//   },
//   statusPillText: { color: "#22c55e", fontSize: 11, fontWeight: "700" },

//   paidLine: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
//   paidLineText: { color: "#e0e7ff", fontSize: 14, fontWeight: "600" },

//   // danger zone
//   dangerZone: {
//     marginTop: 24,
//     backgroundColor: "rgba(239, 68, 68, 0.05)",
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: "rgba(239, 68, 68, 0.2)",
//   },
//   dangerButton: {
//     backgroundColor: "rgba(239, 68, 68, 0.1)",
//     borderRadius: 12,
//     paddingVertical: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     borderWidth: 1,
//     borderColor: "rgba(239, 68, 68, 0.3)",
//   },
//   dangerButtonText: { color: "#ef4444", fontSize: 16, fontWeight: "600" },

//   // modal
//   modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.7)" },
//   modalContent: {
//     backgroundColor: "#1e293b",
//     padding: 24,
//     borderRadius: 16,
//     width: "90%",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   modalTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 12, textAlign: "center" },
//   modalText: { fontSize: 16, color: "#e0e7ff", textAlign: "center", lineHeight: 24, marginBottom: 24 },
//   modalButton: { backgroundColor: "#fb923c", borderRadius: 12, paddingVertical: 14, width: "100%", alignItems: "center" },
//   modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
// });


import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Modal,
  SafeAreaView,
  Vibration,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Briefcase,
  Camera,
  CheckCircle,
  Circle,
  DollarSign,
  AlertTriangle,
  Flag,
  XCircle,
  Phone,
  UserCircle,
  CreditCard,
} from "lucide-react-native";
import JobDetails from "../components/JobDetails";
import api from "../api/client";
import { saveSession, clearSession } from "../utils/sessionManager";

const TRAVEL_FEE = 100;
const NOTIF_SOUND = require("../assets/notification.mp3");

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
  const [showNotCompleteModal, setShowNotCompleteModal] = useState(false);

  const [showPaidBanner, setShowPaidBanner] = useState(false);

  const hasSeenNotCompleteRef = useRef(false);
  const phoneTimer = useRef(null);

  // polling & alert guards
  const pollRef = useRef(null);
  const notFoundHandledRef = useRef(false);
  const firstErrorAlertRef = useRef(false);

  // track transition from awaiting -> paid
  const prevAwaitingRef = useRef(false);
  const paidBannerTimerRef = useRef(null);

  // ---------- helpers to detect states ----------
  const isAwaitingAdditional = useCallback((j) => {
    if (!j) return false;
    return (
      j.status === "awaiting-additional-payment" ||
      j?.billingStatus === "awaiting-additional" ||
      j?.additionalPaymentStatus === "awaiting" ||
      j?.paymentStatus === "awaiting_additional"
    );
  }, []);

  const isAdditionalPaid = useCallback((j) => {
    if (!j) return false;
    const hasAddon = Number(j?.additionalCharge) > 0;
    if (!hasAddon) return false;
    return (
      j?.additionalPaymentStatus === "paid" ||
      j?.additionalPaid === true ||
      j?.paymentStatus === "paid_additional" ||
      j?.billingStatus === "additional_paid" ||
      (!isAwaitingAdditional(j) &&
        (j?.status === "accepted" ||
          j?.status === "in-progress" ||
          j?.status === "arrived" ||
          j?.paymentStatus === "paid"))
    );
  }, [isAwaitingAdditional]);

  // 🔔 play chime
  const playChime = useCallback(async () => {
    try {
      Vibration.vibrate([0, 300, 150, 300]);
      const { sound } = await Audio.Sound.createAsync(NOTIF_SOUND, {
        shouldPlay: true,
        isLooping: false,
        volume: 1.0,
      });
      sound.setOnPlaybackStatusUpdate(async (s) => {
        if (s.didJustFinish) {
          try {
            await sound.unloadAsync();
          } catch {}
        }
      });
    } catch {}
  }, []);

  // 📨 local OS banner
  const notifyPaid = useCallback(async (amount) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Additional Payment Received",
          body:
            Number.isFinite(Number(amount)) && Number(amount) > 0
              ? `Customer paid $${Number(amount).toFixed(2)}. You can proceed.`
              : "Customer’s additional payment is complete. You can proceed.",
          data: { jobId, type: "additional_payment_paid" },
          sound: Platform.OS === "ios" ? "notification.wav" : undefined,
        },
        trigger: Platform.select({
          android: { channelId: "job-invites-v2" },
          ios: null,
        }),
      });
    } catch {}
  }, [jobId]);

  // 📞 call helper
  const handleCallCustomer = useCallback(async () => {
    const raw = job?.customer?.phoneNumber;
    if (!raw) return;
    const sanitized = raw.replace(/[^\d+]/g, "");
    const url = Platform.OS === "ios" ? `telprompt:${sanitized}` : `tel:${sanitized}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Cannot place call", `Please dial ${raw} manually.`);
      }
    } catch {
      Alert.alert("Call failed", `Please dial ${raw} manually.`);
    }
  }, [job?.customer?.phoneNumber]);

  // ---------- bootstrap / polling ----------
  useEffect(() => {
    let alive = true;

    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
        if (!alive) return;

        // detect awaiting->paid transition BEFORE setJob
        const wasAwaiting = prevAwaitingRef.current;
        const nowAwaiting = isAwaitingAdditional(data);

        setJob(data);

        // show incomplete modal
        if (
          data.customerMarkedIncomplete &&
          !hasSeenNotCompleteRef.current &&
          data.status !== "completed"
        ) {
          setShowNotCompleteModal(true);
          hasSeenNotCompleteRef.current = true;
        }

        // customer phone number reveal after accept
        if (data.acceptedProvider && !phoneTimer.current) {
          phoneTimer.current = setTimeout(() => setShowPhone(true), 6 * 60 * 1000);
        }

        // completion routing
        if (data.customerCompleted && data.providerCompleted && !notifiedComplete) {
          setNotifiedComplete(true);
          stopPolling(); // ✅ stop loop before leaving
          Alert.alert("Job Complete", "This job is now fully completed.", [
            { text: "OK", onPress: () => navigation.replace("ServiceProviderDashboard") },
          ]);
          await clearSession();
        }

        // NEW: paid transition banner + notification
        if (wasAwaiting && !nowAwaiting && isAdditionalPaid(data)) {
          setShowPaidBanner(true);
          playChime();
          notifyPaid(data.additionalCharge);

          if (paidBannerTimerRef.current) clearTimeout(paidBannerTimerRef.current);
          paidBannerTimerRef.current = setTimeout(() => setShowPaidBanner(false), 10000);
        }

        // update prev flag last
        prevAwaitingRef.current = nowAwaiting;
      } catch (err) {
        if (!alive) return;

        const status = err?.response?.status;
        if (status === 404) {
          // ✅ handle once, stop loop, and bounce out
          if (!notFoundHandledRef.current) {
            notFoundHandledRef.current = true;
            stopPolling();
            await clearSession();
            Alert.alert(
              "Job Not Found",
              "This job may have been closed or removed. Returning to your dashboard.",
              [{ text: "OK", onPress: () => navigation.replace("ServiceProviderDashboard") }]
            );
          }
          setJob(null);
          setLoading(false);
          return;
        }

        // Other errors -> show only once
        if (!firstErrorAlertRef.current) {
          firstErrorAlertRef.current = true;
          Alert.alert("Error", "Unable to load job.");
        }
        console.error("Fetch job failed:", err?.message || err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchJob();
    pollRef.current = setInterval(fetchJob, 20000);

    return () => {
      alive = false;
      if (phoneTimer.current) clearTimeout(phoneTimer.current);
      if (paidBannerTimerRef.current) clearTimeout(paidBannerTimerRef.current);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [
    jobId,
    navigation,
    notifiedComplete,
    isAwaitingAdditional,
    isAdditionalPaid,
    playChime,
    notifyPaid,
  ]);

  // cancelled by customer quick exit
  useEffect(() => {
    if (job?.status === "cancelled-by-customer") {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      Alert.alert("Job Cancelled", "The customer has cancelled this job.", [
        { text: "OK", onPress: () => navigation.replace("ServiceProviderDashboard") },
      ]);
    }
  }, [job?.status, navigation]);

  // persist session while active
  useEffect(() => {
    if (job && job.status !== "completed") {
      saveSession({ role: "serviceProvider", jobId: job._id });
    }
  }, [job, jobId]);

  // ----- actions -----
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
      setAdditionalCharge("");
      setAdditionalChargeReason("");
      Alert.alert("Extra Charge Recorded", "Redirecting homeowner to payment…");
      prevAwaitingRef.current = true; // so we can catch the "paid" transition
    } catch (err) {
      console.error("Update-charge error:", err);
      Alert.alert("Error", "Failed to record extra charge.");
    }
  };

  const handleCancelJob = async () => {
    Alert.alert("Cancel Job", "Are you sure you want to cancel this job?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          setCancelling(true);
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          await clearSession();
          try {
            await api.put(`/jobs/${jobId}/cancelled`, {
              cancelledBy: "serviceProvider",
              travelFee: TRAVEL_FEE,
            });
            Alert.alert("Cancelled", "The job has been cancelled.");
            navigation.replace("ServiceProviderDashboard");
          } catch (err) {
            console.error("Cancel-job error:", err);
            Alert.alert("Error", "Cancellation failed.");
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  const pickAndUpload = async (phase) => {
    const status = await ImagePicker.requestCameraPermissionsAsync();
    if (status.status !== "granted") {
      return Alert.alert("Permission denied", "Camera access is required.");
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    const uri = result.assets?.[0]?.uri;
    if (!uri) return;
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
      setJob(data);
      Alert.alert("Done", "You’ve marked the job complete. Waiting for customer confirmation.");
    } catch (err) {
      console.error("Finalize error:", err);
      Alert.alert("Error", "Could not finalize job.");
    }
  };

  // ---------- loading / empty ----------
  if (loading) {
    return (
      <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  if (!job) {
    return (
      <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.center}>
        <Text style={styles.errorText}>No job found.</Text>
      </LinearGradient>
    );
  }

  const awaitingAdditional = isAwaitingAdditional(job);
  const additionalPaid = isAdditionalPaid(job);
  const hasAddon = Number(job?.additionalCharge) > 0;

  return (
    <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              {/* <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <ArrowLeft color="#fff" size={24} />
              </TouchableOpacity> */}
              <View style={styles.headerTitleContainer}>
                <View style={styles.headerBadge}>
                  <Briefcase color="#60a5fa" size={14} />
                  <Text style={styles.headerBadgeText}>Live Job Status</Text>
                </View>
                <Text style={styles.title}>Job Workflow</Text>
              </View>
              <View style={{ width: 44 }} />
            </View>

            {/* NEW: Additional payment paid banner (10s) */}
            {showPaidBanner && (
              <View style={styles.paidBanner}>
                <LinearGradient
                  colors={["rgba(34,197,94,0.20)", "rgba(16,185,129,0.10)"]}
                  style={styles.paidBannerGradient}
                >
                  <View style={styles.paidBannerHeader}>
                    <CreditCard color="#22c55e" size={22} />
                    <Text style={styles.paidBannerTitle}>Additional Payment Received</Text>
                  </View>
                  <Text style={styles.paidBannerText}>
                    {hasAddon
                      ? `Customer paid $${Number(job.additionalCharge).toFixed(2)}. You can continue the work.`
                      : "Customer's additional payment is complete. You can continue the work."}
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Customer Details Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <UserCircle color="#c084fc" size={24} />
                <Text style={styles.cardTitle}>Customer & Job Details</Text>
              </View>
              <JobDetails jobId={jobId} job={job} textStyle={{ color: "#e0e7ff" }} />
              {showPhone && job?.customer?.phoneNumber && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleCallCustomer}
                  accessibilityRole="button"
                  accessibilityLabel={`Call ${job.customer.phoneNumber}`}
                  style={styles.phoneContainer}
                >
                  <Phone color="#22c55e" size={16} />
                  <Text style={styles.phoneText}>{job.customer.phoneNumber}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Workflow Steps */}
            <View style={styles.workflowContainer}>
              {/* Step 1: Arrival Photo */}
              <View style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  {job.arrivalImage ? (
                    <CheckCircle color="#22c55e" size={24} />
                  ) : (
                    <Circle color="#94a3b8" size={24} />
                  )}
                  <Text style={styles.stepTitle}>Step 1: Arrival Photo</Text>
                </View>
                <Text style={styles.stepDescription}>
                  Capture a photo upon arriving at the job location.
                </Text>
                <TouchableOpacity
                  style={[styles.actionButton, job.arrivalImage && styles.actionButtonCompleted]}
                  onPress={() => pickAndUpload("arrival")}
                  disabled={awaitingAdditional}
                >
                  <Camera color={job.arrivalImage ? "#22c55e" : "#fff"} size={20} />
                  <Text
                    style={[
                      styles.actionButtonText,
                      job.arrivalImage && { color: "#22c55e" },
                    ]}
                  >
                    {job.arrivalImage ? "Arrival Photo Uploaded" : "Capture Arrival Photo"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Step 2: Additional Charge */}
              <View style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  {hasAddon && additionalPaid ? (
                    <CheckCircle color="#22c55e" size={24} />
                  ) : hasAddon && awaitingAdditional ? (
                    <Circle color="#f59e0b" size={24} />
                  ) : hasAddon ? (
                    <CheckCircle color="#22c55e" size={24} />
                  ) : (
                    <Circle color="#94a3b8" size={24} />
                  )}
                  <Text style={styles.stepTitle}>Step 2: Add-ons & Charges (Optional)</Text>

                  {hasAddon && (
                    <View
                      style={[
                        styles.statusPill,
                        awaitingAdditional
                          ? styles.statusPillAwaiting
                          : styles.statusPillPaid,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          awaitingAdditional && { color: "#f59e0b" },
                        ]}
                      >
                        {awaitingAdditional ? "Awaiting Payment" : "Paid"}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.stepDescription}>
                  If required, add any additional charges for parts or labor not in the original
                  estimate.
                </Text>

                {!hasAddon || awaitingAdditional ? (
                  <>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={additionalCharge}
                      onChangeText={setAdditionalCharge}
                      placeholder="Amount (e.g., 50.00)"
                      placeholderTextColor="#94a3b8"
                    />
                    <TextInput
                      style={[styles.input, { height: 80 }]}
                      value={additionalChargeReason}
                      onChangeText={setAdditionalChargeReason}
                      placeholder="Reason for charge (e.g., replacement part)"
                      placeholderTextColor="#94a3b8"
                      multiline
                    />
                    <TouchableOpacity
                      style={[styles.actionButton, awaitingAdditional && styles.actionButtonDisabled]}
                      onPress={handleUpdateCharge}
                      disabled={awaitingAdditional}
                    >
                      <DollarSign color="#fff" size={20} />
                      <Text style={styles.actionButtonText}>
                        {awaitingAdditional ? "Awaiting Customer Payment" : "Submit Additional Charge"}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.paidLine}>
                    <CreditCard color="#22c55e" size={18} />
                    <Text style={styles.paidLineText}>
                      Additional payment of ${Number(job.additionalCharge).toFixed(2)} received.
                    </Text>
                  </View>
                )}
              </View>

              {/* Step 3: Completion Photo */}
              <View style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  {job.completionImage ? (
                    <CheckCircle color="#22c55e" size={24} />
                  ) : (
                    <Circle color="#94a3b8" size={24} />
                  )}
                  <Text style={styles.stepTitle}>Step 3: Completion Photo</Text>
                </View>
                <Text style={styles.stepDescription}>Capture a photo showing the completed work.</Text>
                <TouchableOpacity
                  style={[styles.actionButton, job.completionImage && styles.actionButtonCompleted]}
                  onPress={() => pickAndUpload("completion")}
                  disabled={awaitingAdditional}
                >
                  <Camera color={job.completionImage ? "#22c55e" : "#fff"} size={20} />
                  <Text
                    style={[
                      styles.actionButtonText,
                      job.completionImage && { color: "#22c55e" },
                    ]}
                  >
                    {job.completionImage ? "Completion Photo Uploaded" : "Capture Completion Photo"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Step 4: Finalize */}
              <View style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  {job.providerCompleted ? (
                    <CheckCircle color="#22c55e" size={24} />
                  ) : (
                    <Circle color="#94a3b8" size={24} />
                  )}
                  <Text style={styles.stepTitle}>Step 4: Finalize Job</Text>
                </View>
                <Text style={styles.stepDescription}>
                  Once all work is done and photos are uploaded, mark the job as completed to notify
                  the customer.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (!job.arrivalImage || !job.completionImage) && styles.actionButtonDisabled,
                  ]}
                  onPress={handleFinalize}
                  disabled={!job.arrivalImage || !job.completionImage}
                >
                  <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.buttonGradient}>
                    <Flag color="#fff" size={20} />
                    <Text style={styles.primaryButtonText}>
                      {job.providerCompleted ? "Waiting for Customer" : "Mark Job Completed"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Danger Zone */}
            <View style={styles.dangerZone}>
              <View style={styles.cardHeader}>
                <AlertTriangle color="#ef4444" size={24} />
                <Text style={styles.cardTitle}>Danger Zone</Text>
              </View>
              <TouchableOpacity style={styles.dangerButton} onPress={handleCancelJob} disabled={cancelling}>
                <XCircle color="#ef4444" size={20} />
                <Text style={styles.dangerButtonText}>
                  {cancelling ? "Cancelling…" : "Cancel Job"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Modal for Incomplete Job */}
          <Modal
            visible={showNotCompleteModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowNotCompleteModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <AlertTriangle color="#fb923c" size={48} style={{ marginBottom: 16 }} />
                <Text style={styles.modalTitle}>Job Marked as Incomplete</Text>
                <Text style={styles.modalText}>
                  The customer marked this job as not complete. Please review and address any issues
                  before re-submitting completion.
                </Text>
                <TouchableOpacity style={styles.modalButton} onPress={() => setShowNotCompleteModal(false)}>
                  <Text style={styles.modalButtonText}>OK, Understood</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#fff", fontSize: 18, textAlign: "center" },

  container: { paddingHorizontal: 20, paddingBottom: 40, marginTop: 40 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: { alignItems: "center" },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(96, 165, 250, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.3)",
  },
  headerBadgeText: { color: "#60a5fa", marginLeft: 6, fontSize: 12, fontWeight: "500" },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff" },

  paidBanner: { marginBottom: 16, borderRadius: 16, overflow: "hidden" },
  paidBannerGradient: { padding: 16 },
  paidBannerHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  paidBannerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  paidBannerText: { color: "#e0e7ff", fontSize: 14, lineHeight: 20 },

  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginLeft: 12 },

  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    padding: 12,
    borderRadius: 12,
    justifyContent: "center",
    gap: 8,
  },
  phoneText: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  workflowContainer: { gap: 16 },
  stepCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  stepHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  stepTitle: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  stepDescription: { fontSize: 14, color: "#94a3b8", marginBottom: 16, lineHeight: 20 },

  input: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    marginBottom: 12,
  },

  actionButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  actionButtonCompleted: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  actionButtonDisabled: { backgroundColor: "rgba(255,255,255,0.05)", opacity: 0.6 },

  primaryButton: { borderRadius: 12, overflow: "hidden" },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  statusPill: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillAwaiting: {
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderColor: "rgba(245, 158, 11, 0.35)",
  },
  statusPillPaid: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderColor: "rgba(34, 197, 94, 0.35)",
  },
  statusPillText: { color: "#22c55e", fontSize: 11, fontWeight: "700" },

  paidLine: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  paidLineText: { color: "#e0e7ff", fontSize: 14, fontWeight: "600" },

  dangerZone: {
    marginTop: 24,
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  dangerButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  dangerButtonText: { color: "#ef4444", fontSize: 16, fontWeight: "600" },

  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.7)" },
  modalContent: {
    backgroundColor: "#1e293b",
    padding: 24,
    borderRadius: 16,
    width: "90%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 12, textAlign: "center" },
  modalText: { fontSize: 16, color: "#e0e7ff", textAlign: "center", lineHeight: 24, marginBottom: 24 },
  modalButton: { backgroundColor: "#fb923c", borderRadius: 12, paddingVertical: 14, width: "100%", alignItems: "center" },
  modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
