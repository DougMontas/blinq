// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   Image,
//   Dimensions,
//   Linking,
//   StyleSheet,
//   Platform,
//   TextInput,
//   Modal,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
// import io from "socket.io-client";
// import api from "../api/client";
// import { getCoveredDescription } from "../utils/serviceMatrix";
// import { saveSession, clearSession } from "../utils/sessionManager";
// import StarRating from "../components/StarRating";
// import { Buffer } from "buffer";
// import ScreenWrapper from "../components/ScreenWrapper";

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// const convertToBase64Uri = (input) => {
//   if (!input) return null;
//   if (typeof input === "string") {
//     if (input.startsWith("data:image")) return input;
//     return `data:image/jpeg;base64,${input}`;
//   }
//   if (input?.type === "Buffer" && Array.isArray(input.data)) {
//     return `data:image/jpeg;base64,${Buffer.from(input.data).toString(
//       "base64"
//     )}`;
//   }
//   return null;
// };

// export default function CustomerJobStatus() {
//   const route = useRoute();
//   const { jobId: routeJobId } = route?.params || {};
//   const navigation = useNavigation();

//   const [jobId, setJobId] = useState(routeJobId);
//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [confirming, setConfirming] = useState(false);
//   const [providerInfo, setProviderInfo] = useState(null);
//   const [providerCoords, setProviderCoords] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [jobLocation, setJobLocation] = useState(null);
//   const [eta, setEta] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [notCompletePressed, setNotCompletePressed] = useState(false);
//   const [showNotCompleteModal, setShowNotCompleteModal] = useState(false);
//   const hasSeenNotCompleteRef = useRef(false);
//   const [disputeMessage, setDisputeMessage] = useState("");
//   const [notifiedComplete, setNotifiedComplete] = useState(false);
//   const mapRef = useRef(null);
//   const [showNotification, setShowNotification] = useState(true);

//   useEffect(() => {
//     if (!routeJobId) {
//       Alert.alert(
//         "Navigation Error",
//         "Missing job ID. Returning to dashboard.",
//         [
//           {
//             text: "OK",
//             onPress: () => navigation.navigate("CustomerDashboard"),
//           },
//         ]
//       );
//     }
//   }, [routeJobId]);

//   const handleNotComplete = async () => {
//     try {
//       console.log("[NotComplete] marking status accepted");
//       await api.put(`/jobs/${jobId}/status`, {
//         status: "accepted",
//         providerCompleted: false,
//       });
//       console.log("[NotComplete] notifying service pro");
//       await api.post(`/jobs/${jobId}/notify-not-complete`);
//       Alert.alert(
//         "Noted",
//         "The service pro has been notified. Please await their update."
//       );
//       setJob((prev) => ({ ...prev, providerCompleted: false }));
//     } catch (err) {
//       console.error("[NotComplete Error]:", err);
//       Alert.alert("Error", "Failed to update status");
//     }
//   };

//   useEffect(() => {
//     if (job && job.status !== "completed") {
//       saveSession({ role: "customer", jobId: job._id });
//     }
//   }, [job]);

//   useEffect(() => {
//     if (!jobId) return;
//     const socket = io(api.defaults.baseURL?.replace("/api", ""), {
//       transports: ["websocket"],
//     });
//     socket.emit("join", jobId);
//     socket.on("jobUpdated", (updatedJob) => {
//       if (updatedJob._id === jobId) setJob(updatedJob);
//     });
//     return () => socket.disconnect();
//   }, [jobId]);

//   useEffect(() => {
//     let alive = true;
//     const fetchJob = async () => {
//       try {
//         console.log("📦 Fetching job", jobId);
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (!alive) return;
//         console.log("✅ Job data loaded", data.status);
//         setJob(data);

//         if (
//           data.customerMarkedIncomplete &&
//           !hasSeenNotCompleteRef.current &&
//           data.status !== "completed"
//         ) {
//           setShowNotCompleteModal(true);
//           hasSeenNotCompleteRef.current = true;
//         }

//         if (!jobId) setJobId(data._id);

//         if (
//           data.customerCompleted &&
//           data.providerCompleted &&
//           !notifiedComplete
//         ) {
//           setNotifiedComplete(true);
//           await clearSession();
//           navigation.replace("RateProvider", { jobId: data._id });
//           await clearSession();
//           return;
//         }

//         if (data.status === "awaiting-additional-payment") {
//           navigation.replace("PaymentScreen", { jobId });
//           return;
//         }

//         if (data.acceptedProvider) {
//           const res = await api.get(`/users/${data.acceptedProvider}`);
//           const provider = res.data;
//           setProviderInfo({
//             name: provider.name,
//             businessName: provider.businessName,
//             aboutMe: provider.aboutMe,
//             profilePictureUrl: provider.profilePicture || null,
//             averageRating: provider.averageRating ?? null,
//           });
//         }

//         const jobLoc = data.location?.coordinates;
//         if (jobLoc) {
//           const [lng, lat] = jobLoc;
//           setJobLocation({ latitude: lat, longitude: lng });
//         }
//       } catch (err) {
//         if (alive) {
//           console.error("[FetchJob Error]:", err);
//           Alert.alert("Error", "Unable to load job status.");
//         }
//       } finally {
//         if (alive) setLoading(false);
//       }
//     };

//     if (jobId) {
//       fetchJob();
//       const iv = setInterval(fetchJob, 25000);
//       return () => {
//         alive = false;
//         clearInterval(iv);
//       };
//     }
//   }, [jobId, navigation, notifiedComplete]);

//   const handleCustomerComplete = async () => {
//     setConfirming(true);
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
//       console.log("[CustomerComplete] response:", data?._id);
//       setJob(data);
//     } catch (err) {
//       console.error("[CustomerComplete Error]:", err);
//       Alert.alert("Error", "Could not confirm completion");
//     } finally {
//       setConfirming(false);
//     }
//   };

//   const renderConfirmationButtons = () => (
//     <View style={styles.confirm}>
//       <Text style={styles.heading}>Confirm Job Complete</Text>
//       <Text style={styles.confirmText}>
//         The provider marked this job complete. Please confirm below:
//       </Text>
//       {job.arrivalImage && (
//         <Image
//           source={{ uri: convertToBase64Uri(job.arrivalImage) }}
//           style={styles.image}
//         />
//       )}
//       {job.completionImage && (
//         <Image
//           source={{ uri: convertToBase64Uri(job.completionImage) }}
//           style={styles.image}
//         />
//       )}
//       <TouchableOpacity
//         style={[
//           styles.confirmButton,
//           confirming && styles.confirmButtonDisabled,
//         ]}
//         onPress={handleCustomerComplete}
//         disabled={confirming}
//       >
//         <Text style={styles.confirmButtonText}>
//           {confirming ? "Confirming…" : "Confirm Job Complete"}
//         </Text>
//       </TouchableOpacity>
//       <TouchableOpacity
//         style={[styles.confirmButton, { backgroundColor: "red" }]}
//         onPress={() => {
//           if (!notCompletePressed) {
//             setNotCompletePressed(true);
//             handleNotComplete();
//           }
//         }}
//       >
//         <Text style={styles.confirmButtonText}>Not Complete</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const handleCancelJob = async () => {
//     try {
//       const confirmed = await new Promise((resolve) =>
//         Alert.alert(
//           "Cancel Job",
//           "Are you sure you want to cancel this job?",
//           [
//             { text: "No", onPress: () => resolve(false), style: "cancel" },
//             { text: "Yes, Cancel", onPress: () => resolve(true) },
//           ],
//           { cancelable: true }
//         )
        
//       );
//       await clearSession();
//       if (!confirmed) return;

//       const acceptedAt = job.acceptedAt ? new Date(job.acceptedAt) : null;
//       const now = new Date();
//       let refundEligible = true;

//       if (acceptedAt && !isNaN(acceptedAt.getTime())) {
//         const diffMinutes = Math.floor((now - acceptedAt) / 60000);
//         refundEligible = diffMinutes < 5;
//       }

//       const { data } = await api.put(`/jobs/${jobId}/cancelled`, {
//         cancelledBy: "customer",
//         refundEligible,
//       });

//       Alert.alert(
//         "Job Cancelled",
//         refundEligible
//           ? "Your job was cancelled within 5 minutes. You are eligible for a full refund."
//           : "Your job was cancelled after 5 minutes. A $120 travel fee will be deducted."
//       );

//       setTimeout(() => {
//         navigation.navigate("CustomerDashboard");
//       }, 10000);
//     } catch (err) {
//       console.error("[CancelJob Error]:", err);
//       Alert.alert("Error", "Unable to cancel the job. Try again.");
//     }
//   };

//   const renderCancelButton = () => (
//     <TouchableOpacity
//       style={[styles.confirmButton, { backgroundColor: "#d32f2f" }]}
//       onPress={handleCancelJob}
//     >
//       <Text style={styles.confirmButtonText}>Cancel Job</Text>
//     </TouchableOpacity>
//   );

//   if (loading) return <ActivityIndicator style={styles.center} size="large" />;
//   if (!job) return <Text style={styles.center}>Job not found.</Text>;

//   return (
//     <ScreenWrapper>
//       <ScrollView contentContainerStyle={styles.container}>
//         <View style={styles.containerLogo}>
//           <Image
//             source={require("../assets/blinqfix_logo-new.jpeg")}
//             style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
//             resizeMode="contain"
//           />
//         </View>

//         {job.providerCompleted &&
//           !job.customerCompleted &&
//           renderConfirmationButtons()}

//         {job?.status === "accepted" && showNotification && (
//           <View
//             style={{
//               backgroundColor: "#e0f7fa",
//               padding: 12,
//               borderRadius: 8,
//               marginBottom: 10,
//             }}
//           >
//             <Text
//               style={[
//                 styles.notification,
//                 { color: "#00796b", fontWeight: "bold", fontSize: 22 },
//               ]}
//             >
//               Emergency Service Pro Located
//             </Text>
//             <Text style={[styles.notification, { color: "#004d40" }]}>
//               Your service Blinqfix professional is in route. Make the necessary
//               preparations. This screen will update once the job is completed.
//             </Text>
//           </View>
//         )}

//         <Text style={styles.title}>Your Job Status</Text>
//         <Text style={{ marginBottom: 16, color: "white" }}>
//           Status: {job.status}
//         </Text>

//         {(job.status === "pending" || job.status === "invited") && (
//           <View style={styles.confirm}>
//             <Text style={styles.heading}>Please Wait…</Text>
//             <Text style={styles.confirmText}>
//               We are locating an emergency Blinqfix Pro for your job. Leave this
//               page open, this will not take long.
//             </Text>
//           </View>
//         )}

//         {providerInfo && (
//           <View style={styles.card}>
//             <Text style={styles.sectionTitle}>Your Service Pro</Text>
//             {providerInfo.profilePictureUrl && (
//               <Image
//                 source={{
//                   uri: convertToBase64Uri(providerInfo.profilePictureUrl),
//                 }}
//                 style={{ width: 160, height: 160, borderRadius: 100 }}
//               />
//             )}
//             <Text style={{ fontWeight: "bold", fontSize: 16 }}>
//               {providerInfo.name}
//             </Text>
//             <Text>{providerInfo.businessName}</Text>
//             <Text>{providerInfo.aboutMe}</Text>
//             <View style={{ alignItems: "center", marginVertical: 8 }}>
//               <StarRating rating={providerInfo.averageRating} size={22} />
//             </View>
//           </View>
//         )}

//         {jobLocation?.latitude && jobLocation?.longitude && (
//           <View
//             style={{
//               height: 220,
//               borderRadius: 10,
//               marginVertical: 12,
//               overflow: "hidden",
//             }}
//           >
//             <MapView
//               key={`map-${jobId}-${jobLocation.latitude}-${jobLocation.longitude}`}
//               ref={mapRef}
//               provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
//               style={{ flex: 1 }}
//               initialRegion={{
//                 latitude: jobLocation.latitude,
//                 longitude: jobLocation.longitude,
//                 latitudeDelta: 0.01,
//                 longitudeDelta: 0.01,
//               }}
//             >
//               <Marker coordinate={jobLocation} title="Customer" />
//               {providerCoords && (
//                 <Marker
//                   coordinate={providerCoords}
//                   title="Service Pro"
//                   pinColor="blue"
//                   description="Provider's current location"
//                 />
//               )}
//               {routeCoords.length === 2 && (
//                 <Polyline
//                   coordinates={routeCoords}
//                   strokeColor="#1976d2"
//                   strokeWidth={4}
//                   lineCap="round"
//                 />
//               )}
//             </MapView>
//           </View>
//         )}

//         {job?.status === "accepted" && renderCancelButton()}
//       </ScrollView>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flexGrow: 1, padding: 24, backgroundColor: "#fff" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   heading: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   confirm: {
//     padding: 12,
//     backgroundColor: "#e8f5e9",
//     borderRadius: 6,
//     marginTop: 16,
//   },
//   notification: {
//     textAlign: "center",
//   },
//   confirmText: { marginBottom: 10, fontSize: 15 },
//   confirmButton: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 12,
//     borderRadius: 6,
//     alignItems: "center",
//     marginVertical: 5,
//   },
//   confirmButtonDisabled: { backgroundColor: "#999" },
//   confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
//   image: { height: 160, width: "100%", marginBottom: 12, borderRadius: 8 },
//   containerLogo: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   card: {
//     backgroundColor: "#f0f0f0",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     marginTop: 24,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginTop: 20,
//     marginBottom: 4,
//     textAlign: "center",
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginTop: 24,
//     marginBottom: 0,
//     textAlign: "center",
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   modalContent: {
//     backgroundColor: "white",
//     padding: 20,
//     borderRadius: 10,
//     width: "90%",
//   },
//   input: {
//     borderColor: "#ccc",
//     borderWidth: 1,
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 12,
//     minHeight: 100,
//     textAlignVertical: "top",
//   },
// });

//working
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   Image,
//   Dimensions,
//   Linking,
//   StyleSheet,
//   Platform,
//   TextInput,
//   Modal,
//   SafeAreaView,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
// import { LinearGradient } from "expo-linear-gradient";
// import io from "socket.io-client";
// import api from "../api/client";
// import { getCoveredDescription } from "../utils/serviceMatrix";
// import { saveSession, clearSession } from "../utils/sessionManager";
// import StarRating from "../components/StarRating";
// import { Buffer } from "buffer";
// import { 
//   MapPin, 
//   Clock, 
//   CheckCircle, 
//   X, 
//   AlertTriangle, 
//   User, 
//   Phone,
//   ArrowLeft,
//   Zap,
//   Shield
// } from "lucide-react-native";

// const { width } = Dimensions.get("window");

// const convertToBase64Uri = (input) => {
//   if (!input) return null;
//   if (typeof input === "string") {
//     if (input.startsWith("data:image")) return input;
//     return `data:image/jpeg;base64,${input}`;
//   }
//   if (input?.type === "Buffer" && Array.isArray(input.data)) {
//     return `data:image/jpeg;base64,${Buffer.from(input.data).toString("base64")}`;
//   }
//   return null;
// };

// const getStatusConfig = (status) => {
//   switch (status) {
//     case 'pending':
//     case 'invited':
//       return { color: '#facc15', icon: Clock, text: 'Finding Service Pro' };
//     case 'accepted':
//       return { color: '#60a5fa', icon: MapPin, text: 'Professional In Route' };
//     case 'completed':
//       return { color: '#22c55e', icon: CheckCircle, text: 'Job Completed' };
//     default:
//       return { color: '#94a3b8', icon: Clock, text: status };
//   }
// };

// export default function CustomerJobStatus() {
//   const route = useRoute();
//   const { jobId: routeJobId } = route?.params || {};
//   const navigation = useNavigation();

//   const [jobId, setJobId] = useState(routeJobId);
//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [confirming, setConfirming] = useState(false);
//   const [providerInfo, setProviderInfo] = useState(null);
//   const [providerCoords, setProviderCoords] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);
//   const [jobLocation, setJobLocation] = useState(null);
//   const [eta, setEta] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [notCompletePressed, setNotCompletePressed] = useState(false);
//   const [showNotCompleteModal, setShowNotCompleteModal] = useState(false);
//   const hasSeenNotCompleteRef = useRef(false);
//   const [disputeMessage, setDisputeMessage] = useState("");
//   const [notifiedComplete, setNotifiedComplete] = useState(false);
//   const mapRef = useRef(null);
//   const [showNotification, setShowNotification] = useState(true);

//   useEffect(() => {
//     if (!routeJobId) {
//       Alert.alert(
//         "Navigation Error",
//         "Missing job ID. Returning to dashboard.",
//         [
//           {
//             text: "OK",
//             onPress: () => navigation.navigate("CustomerDashboard"),
//           },
//         ]
//       );
//     }
//   }, [routeJobId]);

//   const handleNotComplete = async () => {
//     try {
//       console.log("[NotComplete] marking status accepted");
//       await api.put(`/jobs/${jobId}/status`, {
//         status: "accepted",
//         providerCompleted: false,
//       });
//       console.log("[NotComplete] notifying service pro");
//       await api.post(`/jobs/${jobId}/notify-not-complete`);
//       Alert.alert(
//         "Noted",
//         "The service pro has been notified. Please await their update."
//       );
//       setJob((prev) => ({ ...prev, providerCompleted: false }));
//     } catch (err) {
//       console.error("[NotComplete Error]:", err);
//       Alert.alert("Error", "Failed to update status");
//     }
//   };

//   useEffect(() => {
//     if (job && job.status !== "completed") {
//       saveSession({ role: "customer", jobId: job._id });
//     }
//   }, [job]);

//   useEffect(() => {
//     if (!jobId) return;
//     const socket = io(api.defaults.baseURL?.replace("/api", ""), {
//       transports: ["websocket"],
//     });
//     socket.emit("join", jobId);
//     socket.on("jobUpdated", (updatedJob) => {
//       if (updatedJob._id === jobId) setJob(updatedJob);
//     });
//     return () => socket.disconnect();
//   }, [jobId]);

//   useEffect(() => {
//     let alive = true;
//     const fetchJob = async () => {
//       try {
//         console.log("📦 Fetching job", jobId);
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (!alive) return;
//         console.log("✅ Job data loaded", data.status);
//         setJob(data);

//         if (
//           data.customerMarkedIncomplete &&
//           !hasSeenNotCompleteRef.current &&
//           data.status !== "completed"
//         ) {
//           setShowNotCompleteModal(true);
//           hasSeenNotCompleteRef.current = true;
//         }

//         if (!jobId) setJobId(data._id);

//         if (
//           data.customerCompleted &&
//           data.providerCompleted &&
//           !notifiedComplete
//         ) {
//           setNotifiedComplete(true);
//           await clearSession();
//           navigation.replace("RateProvider", { jobId: data._id });
//           await clearSession();
//           return;
//         }

//         if (data.status === "awaiting-additional-payment") {
//           navigation.replace("PaymentScreen", { jobId });
//           return;
//         }

//         if (data.acceptedProvider) {
//           const res = await api.get(`/users/${data.acceptedProvider}`);
//           const provider = res.data;
//           setProviderInfo({
//             name: provider.name,
//             businessName: provider.businessName,
//             aboutMe: provider.aboutMe,
//             profilePictureUrl: provider.profilePicture || null,
//             averageRating: provider.averageRating ?? null,
//           });
//         }

//         const jobLoc = data.location?.coordinates;
//         if (jobLoc) {
//           const [lng, lat] = jobLoc;
//           setJobLocation({ latitude: lat, longitude: lng });
//         }
//       } catch (err) {
//         if (alive) {
//           console.error("[FetchJob Error]:", err);
//           Alert.alert("Error", "Unable to load job status.");
//         }
//       } finally {
//         if (alive) setLoading(false);
//       }
//     };

//     if (jobId) {
//       fetchJob();
//       const iv = setInterval(fetchJob, 25000);
//       return () => {
//         alive = false;
//         clearInterval(iv);
//       };
//     }
//   }, [jobId, navigation, notifiedComplete]);

//   const handleCustomerComplete = async () => {
//     setConfirming(true);
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
//       console.log("[CustomerComplete] response:", data?._id);
//       setJob(data);
//     } catch (err) {
//       console.error("[CustomerComplete Error]:", err);
//       Alert.alert("Error", "Could not confirm completion");
//     } finally {
//       setConfirming(false);
//     }
//   };

//   const handleCancelJob = async () => {
//     try {
//       const confirmed = await new Promise((resolve) =>
//         Alert.alert(
//           "Cancel Job",
//           "Are you sure you want to cancel this job?",
//           [
//             { text: "No", onPress: () => resolve(false), style: "cancel" },
//             { text: "Yes, Cancel", onPress: () => resolve(true) },
//           ],
//           { cancelable: true }
//         )
//       );
//       await clearSession();
//       if (!confirmed) return;

//       const acceptedAt = job.acceptedAt ? new Date(job.acceptedAt) : null;
//       const now = new Date();
//       let refundEligible = true;

//       if (acceptedAt && !isNaN(acceptedAt.getTime())) {
//         const diffMinutes = Math.floor((now - acceptedAt) / 60000);
//         refundEligible = diffMinutes < 5;
//       }

//       const { data } = await api.put(`/jobs/${jobId}/cancelled`, {
//         cancelledBy: "customer",
//         refundEligible,
//       });

//       Alert.alert(
//         "Job Cancelled",
//         refundEligible
//           ? "Your job was cancelled within 5 minutes. You are eligible for a full refund."
//           : "Your job was cancelled after 5 minutes. A $120 travel fee will be deducted."
//       );

//       setTimeout(() => {
//         navigation.navigate("CustomerDashboard");
//       }, 10000);
//     } catch (err) {
//       console.error("[CancelJob Error]:", err);
//       Alert.alert("Error", "Unable to cancel the job. Try again.");
//     }
//   };

//   if (loading) {
//     return (
//       <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.centered}>
//         <ActivityIndicator size="large" color="#fff" />
//       </LinearGradient>
//     );
//   }

//   if (!job) {
//     return (
//       <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.centered}>
//         <Text style={styles.errorText}>Job not found.</Text>
//       </LinearGradient>
//     );
//   }

//   const statusConfig = getStatusConfig(job.status);

//   return (
//     <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
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
//                 <Text style={styles.headerBadgeText}>Emergency Service</Text>
//               </View>
//               <Text style={styles.headerTitle}>Job Status</Text>
//             </View>
//             <View style={{ width: 40 }} />
//           </View>

//           {/* Status Card */}
//           <View style={styles.statusCard}>
//             <LinearGradient
//               colors={[
//                 `${statusConfig.color}20`,
//                 `${statusConfig.color}10`
//               ]}
//               style={styles.statusGradient}
//             >
//               <View style={styles.statusHeader}>
//                 <statusConfig.icon color={statusConfig.color} size={32} />
//                 <View style={styles.statusInfo}>
//                   <Text style={styles.statusTitle}>{statusConfig.text}</Text>
//                   <Text style={styles.statusSubtitle}>Job ID: {jobId?.slice(-6)}</Text>
//                 </View>
//               </View>
              
//               {job?.service && (
//                 <Text style={styles.serviceText}>{job.service} • {job.address}</Text>
//               )}
//             </LinearGradient>
//           </View>

//           {/* Waiting for Professional */}
//           {(job.status === "pending" || job.status === "invited") && (
//             <View style={styles.waitingCard}>
//               <View style={styles.pulseContainer}>
//                 <View style={styles.pulseDot} />
//               </View>
//               <Text style={styles.waitingTitle}>Finding Your Professional</Text>
//               <Text style={styles.waitingText}>
//                 We're locating the nearest emergency BlinqFix Pro. This typically takes less than 3 minutes.
//               </Text>
//             </View>
//           )}

//           {/* Professional En Route Alert */}
//           {job?.status === "accepted" && showNotification && (
//             <View style={styles.alertCard}>
//               <LinearGradient
//                 colors={['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.1)']}
//                 style={styles.alertGradient}
//               >
//                 <View style={styles.alertHeader}>
//                   <CheckCircle color="#22c55e" size={24} />
//                   <Text style={styles.alertTitle}>Service Pro Located!</Text>
//                 </View>
//                 <Text style={styles.alertText}>
//                   Your BlinqFix professional is in route. Please make necessary preparations. 
//                   This screen will update automatically when the job is completed.
//                 </Text>
//               </LinearGradient>
//             </View>
//           )}

//           {/* Provider Info Card */}
//           {providerInfo && (
//             <View style={styles.providerCard}>
//               <Text style={styles.cardTitle}>Your Service Pro</Text>
//               <View style={styles.providerInfo}>
//                 {providerInfo.profilePictureUrl ? (
//                   <Image
//                     source={{ uri: convertToBase64Uri(providerInfo.profilePictureUrl) }}
//                     style={styles.providerImage}
//                   />
//                 ) : (
//                   <View style={styles.providerImagePlaceholder}>
//                     <User color="#94a3b8" size={40} />
//                   </View>
//                 )}
//                 <View style={styles.providerDetails}>
//                   <Text style={styles.providerName}>{providerInfo.name}</Text>
//                   <Text style={styles.providerBusiness}>{providerInfo.businessName}</Text>
//                   {providerInfo.aboutMe && (
//                     <Text style={styles.providerAbout}>{providerInfo.aboutMe}</Text>
//                   )}
//                   <View style={styles.ratingContainer}>
//                     <StarRating rating={providerInfo.averageRating} size={18} />
//                   </View>
//                 </View>
//               </View>
//             </View>
//           )}

//            {/* Completion Confirmation */}
//            {job.providerCompleted && !job.customerCompleted && (
//             <View style={styles.completionCard}>
//               <Text style={styles.completionTitle}>Confirm Job Completion</Text>
//               <Text style={styles.completionText}>
//                 The professional has marked this job as complete. Please review and confirm:
//               </Text>
              
//               {job.arrivalImage && (
//                 <Image
//                   source={{ uri: convertToBase64Uri(job.arrivalImage) }}
//                   style={styles.completionImage}
//                 />
//               )}
              
//               {job.completionImage && (
//                 <Image
//                   source={{ uri: convertToBase64Uri(job.completionImage) }}
//                   style={styles.completionImage}
//                 />
//               )}
              
//               <View style={styles.completionButtons}>
//                 <TouchableOpacity
//                   style={[styles.confirmButton, confirming && styles.confirmButtonDisabled]}
//                   onPress={handleCustomerComplete}
//                   disabled={confirming}
//                 >
//                   <LinearGradient
//                     colors={['#22c55e', '#16a34a']}
//                     style={styles.buttonGradient}
//                   >
//                     <CheckCircle color="#fff" size={20} />
//                     <Text style={styles.confirmButtonText}>
//                       {confirming ? "Confirming..." : "Confirm Complete"}
//                     </Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity
//                   style={styles.rejectButton}
//                   onPress={() => {
//                     if (!notCompletePressed) {
//                       setNotCompletePressed(true);
//                       handleNotComplete();
//                     }
//                   }}
//                 >
//                   <X color="#f87171" size={20} />
//                   <Text style={styles.rejectButtonText}>Not Complete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}


//           {/* Map */}
//           {jobLocation?.latitude && jobLocation?.longitude && (
//             <View style={styles.mapCard}>
//               <Text style={styles.cardTitle}>Location & Tracking</Text>
//               <View style={styles.mapContainer}>
//                 <MapView
//                   key={`map-${jobId}-${jobLocation.latitude}-${jobLocation.longitude}`}
//                   ref={mapRef}
//                   provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
//                   style={styles.map}
//                   initialRegion={{
//                     latitude: jobLocation.latitude,
//                     longitude: jobLocation.longitude,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                   }}
//                 >
//                   <Marker coordinate={jobLocation} title="Service Location" />
//                   {providerCoords && (
//                     <Marker
//                       coordinate={providerCoords}
//                       title="Service Professional"
//                       pinColor="blue"
//                       description="Professional's current location"
//                     />
//                   )}
//                   {routeCoords.length === 2 && (
//                     <Polyline
//                       coordinates={routeCoords}
//                       strokeColor="#60a5fa"
//                       strokeWidth={4}
//                       lineCap="round"
//                     />
//                   )}
//                 </MapView>
//               </View>
//             </View>
//           )}

//           {/* Completion Confirmation
//           {job.providerCompleted && !job.customerCompleted && (
//             <View style={styles.completionCard}>
//               <Text style={styles.completionTitle}>Confirm Job Completion</Text>
//               <Text style={styles.completionText}>
//                 The professional has marked this job as complete. Please review and confirm:
//               </Text>
              
//               {job.arrivalImage && (
//                 <Image
//                   source={{ uri: convertToBase64Uri(job.arrivalImage) }}
//                   style={styles.completionImage}
//                 />
//               )}
              
//               {job.completionImage && (
//                 <Image
//                   source={{ uri: convertToBase64Uri(job.completionImage) }}
//                   style={styles.completionImage}
//                 />
//               )}
              
//               <View style={styles.completionButtons}>
//                 <TouchableOpacity
//                   style={[styles.confirmButton, confirming && styles.confirmButtonDisabled]}
//                   onPress={handleCustomerComplete}
//                   disabled={confirming}
//                 >
//                   <LinearGradient
//                     colors={['#22c55e', '#16a34a']}
//                     style={styles.buttonGradient}
//                   >
//                     <CheckCircle color="#fff" size={20} />
//                     <Text style={styles.confirmButtonText}>
//                       {confirming ? "Confirming..." : "Confirm Complete"}
//                     </Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity
//                   style={styles.rejectButton}
//                   onPress={() => {
//                     if (!notCompletePressed) {
//                       setNotCompletePressed(true);
//                       handleNotComplete();
//                     }
//                   }}
//                 >
//                   <X color="#f87171" size={20} />
//                   <Text style={styles.rejectButtonText}>Not Complete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )} */}

//           {/* Cancel Button */}
//           {job?.status === "accepted" && (
//             <TouchableOpacity style={styles.cancelButton} onPress={handleCancelJob}>
//               <X color="#f87171" size={20} />
//               <Text style={styles.cancelButtonText}>Cancel Job</Text>
//             </TouchableOpacity>
//           )}

//           {/* Trust Indicators */}
//           <View style={styles.trustSection}>
//             <View style={styles.trustItem}>
//               <Shield color="#22c55e" size={16} />
//               <Text style={styles.trustText}>Licensed & Insured</Text>
//             </View>
//             <View style={styles.trustItem}>
//               <Clock color="#60a5fa" size={16} />
//               <Text style={styles.trustText}>Real-time Updates</Text>
//             </View>
//             <View style={styles.trustItem}>
//               <CheckCircle color="#c084fc" size={16} />
//               <Text style={styles.trustText}>Quality Guaranteed</Text>
//             </View>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   errorText: {
//     color: '#fff',
//     fontSize: 18,
//     textAlign: 'center'
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
//   statusCard: {
//     marginBottom: 20,
//     borderRadius: 16,
//     overflow: 'hidden'
//   },
//   statusGradient: {
//     padding: 20
//   },
//   statusHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12
//   },
//   statusInfo: {
//     marginLeft: 16,
//     flex: 1
//   },
//   statusTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#fff'
//   },
//   statusSubtitle: {
//     fontSize: 14,
//     color: '#e0e7ff',
//     marginTop: 2
//   },
//   serviceText: {
//     fontSize: 16,
//     color: '#e0e7ff'
//   },
//   waitingCard: {
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 16,
//     padding: 24,
//     alignItems: 'center',
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.1)'
//   },
//   pulseContainer: {
//     marginBottom: 16
//   },
//   pulseDot: {
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: '#facc15'
//   },
//   waitingTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 8
//   },
//   waitingText: {
//     fontSize: 16,
//     color: '#e0e7ff',
//     textAlign: 'center',
//     lineHeight: 24
//   },
//   alertCard: {
//     marginBottom: 20,
//     borderRadius: 16,
//     overflow: 'hidden'
//   },
//   alertGradient: {
//     padding: 20
//   },
//   alertHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12
//   },
//   alertTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginLeft: 12
//   },
//   alertText: {
//     fontSize: 16,
//     color: '#e0e7ff',
//     lineHeight: 24
//   },
//   providerCard: {
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.1)'
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 16
//   },
//   providerInfo: {
//     flexDirection: 'row',
//     alignItems: 'center'
//   },
//   providerImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     marginRight: 16
//   },
//   providerImagePlaceholder: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16
//   },
//   providerDetails: {
//     flex: 1
//   },
//   providerName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 4
//   },
//   providerBusiness: {
//     fontSize: 16,
//     color: '#e0e7ff',
//     marginBottom: 8
//   },
//   providerAbout: {
//     fontSize: 14,
//     color: '#94a3b8',
//     marginBottom: 8
//   },
//   ratingContainer: {
//     alignItems: 'flex-start'
//   },
//   mapCard: {
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.1)'
//   },
//   mapContainer: {
//     height: 250,
//     borderRadius: 12,
//     // overflow: 'hidden'
//   },
//   map: {
//     flex: 1
//   },
//   completionCard: {
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.1)'
//   },
//   completionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 12,
//     textAlign: 'center'
//   },
//   completionText: {
//     fontSize: 16,
//     color: '#e0e7ff',
//     textAlign: 'center',
//     marginBottom: 20,
//     lineHeight: 24
//   },
//   completionImage: {
//     width: '100%',
//     height: 200,
//     borderRadius: 12,
//     marginBottom: 16
//   },
//   completionButtons: {
//     gap: 12
//   },
//   confirmButton: {
//     borderRadius: 16,
//     overflow: 'hidden'
//   },
//   confirmButtonDisabled: {
//     opacity: 0.6
//   },
//   buttonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 24,
//     gap: 8
//   },
//   confirmButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold'
//   },
//   rejectButton: {
//     backgroundColor: 'rgba(248, 113, 113, 0.1)',
//     borderWidth: 2,
//     borderColor: 'rgba(248, 113, 113, 0.3)',
//     borderRadius: 16,
//     paddingVertical: 14,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8
//   },
//   rejectButtonText: {
//     color: '#f87171',
//     fontSize: 16,
//     fontWeight: 'bold'
//   },
//   cancelButton: {
//     backgroundColor: 'rgba(239, 68, 68, 0.1)',
//     borderWidth: 2,
//     borderColor: 'rgba(239, 68, 68, 0.3)',
//     borderRadius: 16,
//     paddingVertical: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     marginBottom: 32
//   },
//   cancelButtonText: {
//     color: '#f87171',
//     fontSize: 16,
//     fontWeight: 'bold'
//   },
//   trustSection: {
//     flexDirection: 'column',
//     justifyContent: 'space-around',
//     paddingVertical: 16
//   },
//   trustItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginLeft: 140,
//     marginBottom: 20,
//   },
//   trustText: {
//     color: '#e0e7ff',
//     fontSize: 12,
//     fontWeight: '500'
//   }
// });


// import React, { useEffect, useState, useRef, useCallback } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   Image,
//   Dimensions,
//   StyleSheet,
//   Platform,
//   SafeAreaView,
//   Vibration,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
// import { LinearGradient } from "expo-linear-gradient";
// import io from "socket.io-client";
// import * as Notifications from "expo-notifications";
// import { Audio } from "expo-av";

// import api from "../api/client";
// import { saveSession, clearSession } from "../utils/sessionManager";
// import StarRating from "../components/StarRating";
// import { Buffer } from "buffer";
// import {
//   MapPin,
//   Clock,
//   CheckCircle,
//   X,
//   AlertTriangle,
//   User,
//   ArrowLeft,
//   Zap,
//   Shield,
// } from "lucide-react-native";

// const { width } = Dimensions.get("window");

// // 🔊 local chime for foreground (same sound as invitations)
// const NOTIF_SOUND = require("../assets/notification.mp3");

// // ---- small utils ----
// const convertToBase64Uri = (input) => {
//   if (!input) return null;
//   if (typeof input === "string") {
//     if (input.startsWith("data:image")) return input;
//     return `data:image/jpeg;base64,${input}`;
//   }
//   if (input?.type === "Buffer" && Array.isArray(input.data)) {
//     return `data:image/jpeg;base64,${Buffer.from(input.data).toString("base64")}`;
//   }
//   return null;
// };

// const getStatusConfig = (status) => {
//   switch (status) {
//     case "pending":
//     case "invited":
//       return { color: "#facc15", icon: Clock, text: "Finding Service Pro" };
//     case "accepted":
//       return { color: "#60a5fa", icon: MapPin, text: "Professional En Route" };
//     case "arrived":
//       return { color: "#22c55e", icon: CheckCircle, text: "Pro Has Arrived" };
//     case "completed":
//       return { color: "#22c55e", icon: CheckCircle, text: "Job Completed" };
//     default:
//       return { color: "#94a3b8", icon: Clock, text: status };
//   }
// };

// // meters between two LatLngs
// const distanceMeters = (a, b) => {
//   if (!a || !b) return Infinity;
//   const toRad = (d) => (d * Math.PI) / 180;
//   const R = 6371000;
//   const dLat = toRad(b.latitude - a.latitude);
//   const dLon = toRad(b.longitude - a.longitude);
//   const lat1 = toRad(a.latitude);
//   const lat2 = toRad(b.latitude);
//   const h =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
//   return 2 * R * Math.asin(Math.sqrt(h));
// };

// // ---------------- Component ----------------
// export default function CustomerJobStatus() {
//   const route = useRoute();
//   const { jobId: routeJobId } = route?.params || {};
//   const navigation = useNavigation();

//   const [jobId, setJobId] = useState(routeJobId);
//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [confirming, setConfirming] = useState(false);

//   const [providerInfo, setProviderInfo] = useState(null);
//   const [providerCoords, setProviderCoords] = useState(null);
//   const [jobLocation, setJobLocation] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);

//   // NEW banners
//   const [showEnRouteBanner, setShowEnRouteBanner] = useState(false);
//   const [showArrivalBanner, setShowArrivalBanner] = useState(false);

//   const notCompletePressedRef = useRef(false);
//   const hasShownEnRouteRef = useRef(false); // prevent re-spam on polls
//   const hasShownArrivalRef = useRef(false);

//   const mapRef = useRef(null);
//   const socketRef = useRef(null);
//   const prevStatusRef = useRef(null);
//   const arrivalTimeoutRef = useRef(null);
//   const enRouteTimeoutRef = useRef(null);

//   // ---- chime helper ----
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

//   // ---- local notification helper ----
//   const sendLocalNotification = useCallback(async (title, body, data = {}) => {
//     try {
//       await Notifications.scheduleNotificationAsync({
//         content: {
//           title,
//           body,
//           data,
//           sound: Platform.OS === "ios" ? "notification.wav" : undefined, // iOS bundle
//         },
//         trigger: Platform.select({
//           android: { channelId: "job-invites-v2" }, // 🔔 custom sound channel
//           ios: null,
//         }),
//       });
//     } catch (e) {
//       // no-op
//     }
//   }, []);

//   // ---- guard invalid nav ----
//   useEffect(() => {
//     if (!routeJobId) {
//       Alert.alert("Navigation Error", "Missing job ID. Returning to dashboard.", [
//         { text: "OK", onPress: () => navigation.navigate("CustomerDashboard") },
//       ]);
//     }
//   }, [routeJobId, navigation]);

//   // ---- persist session until complete ----
//   useEffect(() => {
//     if (job && job.status !== "completed") {
//       saveSession({ role: "customer", jobId: job._id });
//     }
//   }, [job]);

//   // ---- socket: job updates + live provider GPS ----
//   useEffect(() => {
//     if (!jobId) return;
//     const base = api.defaults.baseURL?.replace("/api", "");
//     const socket = io(base, { transports: ["websocket"] });
//     socketRef.current = socket;

//     socket.emit("join", jobId);

//     socket.on("jobUpdated", (updatedJob) => {
//       if (updatedJob._id === jobId) setJob(updatedJob);
//     });

//     // OPTIONAL: if your backend emits live GPS
//     // payload shape expected: { lat, lng } or { latitude, longitude }
//     socket.on("providerLocation", (loc) => {
//       const lat = Number(loc?.lat ?? loc?.latitude);
//       const lng = Number(loc?.lng ?? loc?.longitude);
//       if (Number.isFinite(lat) && Number.isFinite(lng)) {
//         setProviderCoords({ latitude: lat, longitude: lng });
//       }
//     });

//     return () => {
//       socket.disconnect();
//       socketRef.current = null;
//     };
//   }, [jobId]);

//   // ---- poll job ----
//   useEffect(() => {
//     let alive = true;

//     const fetchJob = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (!alive) return;
//         setJob(data);

//         if (!jobId) setJobId(data._id);

//         // provider info
//         if (data.acceptedProvider) {
//           try {
//             const res = await api.get(`/users/${data.acceptedProvider}`);
//             const p = res.data;
//             setProviderInfo({
//               name: p.name,
//               businessName: p.businessName,
//               aboutMe: p.aboutMe,
//               profilePictureUrl: p.profilePicture || null,
//               averageRating: p.averageRating ?? null,
//             });
//           } catch {}
//         }

//         const jobLoc = data.location?.coordinates;
//         if (Array.isArray(jobLoc) && jobLoc.length >= 2) {
//           const [lng, lat] = jobLoc;
//           setJobLocation({ latitude: lat, longitude: lng });
//         }

//         // handle completion auto-redirect (unchanged from your flow)
//         if (data.customerCompleted && data.providerCompleted) {
//           await clearSession();
//           navigation.replace("RateProvider", { jobId: data._id });
//           return;
//         }

//         if (data.status === "awaiting-additional-payment") {
//           navigation.replace("PaymentScreen", { jobId: data._id });
//           return;
//         }

//         // Fallback arrival via server flags
//         if (
//           !hasShownArrivalRef.current &&
//           (data.status === "arrived" || data.arrivedAt || data.providerArrived)
//         ) {
//           hasShownArrivalRef.current = true;
//           setShowArrivalBanner(true);
//           playChime();
//           sendLocalNotification("Your Pro Has Arrived", "Your BlinqFix pro is at your location.", {
//             jobId: data._id,
//             type: "arrival",
//           });
//           if (arrivalTimeoutRef.current) clearTimeout(arrivalTimeoutRef.current);
//           arrivalTimeoutRef.current = setTimeout(() => setShowArrivalBanner(false), 10000);
//         }
//       } catch (err) {
//         if (alive) {
//           console.error("[FetchJob Error]:", err?.message);
//           Alert.alert("Error", "Unable to load job status.");
//         }
//       } finally {
//         if (alive) setLoading(false);
//       }
//     };

//     if (jobId) {
//       fetchJob();
//       const iv = setInterval(fetchJob, 25000);
//       return () => {
//         alive = false;
//         clearInterval(iv);
//       };
//     }
//   }, [jobId, navigation, playChime, sendLocalNotification]);

//   // ---- watch status transitions for “located” alert ----
//   useEffect(() => {
//     const prev = prevStatusRef.current;
//     const curr = job?.status;

//     // when transitioning into "accepted", show 10s banner + alert once
//     if (
//       curr === "accepted" &&
//       prev !== "accepted" &&
//       !hasShownEnRouteRef.current
//     ) {
//       hasShownEnRouteRef.current = true;
//       setShowEnRouteBanner(true);
//       playChime();
//       sendLocalNotification(
//         "Service Pro Located",
//         "Your BlinqFix pro is on the way.",
//         { jobId, type: "service_pro_found" }
//       );
//       if (enRouteTimeoutRef.current) clearTimeout(enRouteTimeoutRef.current);
//       enRouteTimeoutRef.current = setTimeout(
//         () => setShowEnRouteBanner(false),
//         10000
//       );
//     }

//     prevStatusRef.current = curr;
//   }, [job?.status, jobId, playChime, sendLocalNotification]);

//   // ---- build a line on the map (optional visual) ----
//   useEffect(() => {
//     if (providerCoords && jobLocation) {
//       setRouteCoords([providerCoords, jobLocation]);
//     } else {
//       setRouteCoords([]);
//     }
//   }, [providerCoords, jobLocation]);

//   // ---- proximity arrival detection (100m) ----
//   useEffect(() => {
//     if (
//       providerCoords &&
//       jobLocation &&
//       !hasShownArrivalRef.current
//     ) {
//       const d = distanceMeters(providerCoords, jobLocation);
//       if (d <= 100) {
//         hasShownArrivalRef.current = true;
//         setShowArrivalBanner(true);
//         playChime();
//         sendLocalNotification(
//           "Your Pro Has Arrived",
//           "Your BlinqFix pro is at your location.",
//           { jobId, type: "arrival_proximity" }
//         );

//         // Optionally let backend know (ignore errors)
//         (async () => {
//           try {
//             await api.put(`/jobs/${jobId}/status`, { status: "arrived" });
//           } catch {}
//         })();

//         if (arrivalTimeoutRef.current) clearTimeout(arrivalTimeoutRef.current);
//         arrivalTimeoutRef.current = setTimeout(
//           () => setShowArrivalBanner(false),
//           10000
//         );
//       }
//     }
//   }, [providerCoords, jobLocation, jobId, playChime, sendLocalNotification]);

//   // ---- cleanup timers ----
//   useEffect(() => {
//     return () => {
//       if (arrivalTimeoutRef.current) clearTimeout(arrivalTimeoutRef.current);
//       if (enRouteTimeoutRef.current) clearTimeout(enRouteTimeoutRef.current);
//     };
//   }, []);

//   // ---- actions ----
//   const handleNotComplete = useCallback(async () => {
//     try {
//       await api.put(`/jobs/${jobId}/status`, {
//         status: "accepted",
//         providerCompleted: false,
//       });
//       await api.post(`/jobs/${jobId}/notify-not-complete`);
//       Alert.alert("Noted", "The service pro has been notified. Please await their update.");
//       setJob((prev) => ({ ...prev, providerCompleted: false }));
//     } catch (err) {
//       Alert.alert("Error", "Failed to update status");
//     }
//   }, [jobId]);

//   const handleCustomerComplete = useCallback(async () => {
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
//       setJob(data);
//     } catch {
//       Alert.alert("Error", "Could not confirm completion");
//     }
//   }, [jobId]);

//   const handleCancelJob = useCallback(async () => {
//     try {
//       const confirmed = await new Promise((resolve) =>
//         Alert.alert("Cancel Job", "Are you sure you want to cancel this job?", [
//           { text: "No", onPress: () => resolve(false), style: "cancel" },
//           { text: "Yes, Cancel", onPress: () => resolve(true) },
//         ])
//       );
//       await clearSession();
//       if (!confirmed) return;

//       const acceptedAt = job?.acceptedAt ? new Date(job.acceptedAt) : null;
//       const now = new Date();
//       let refundEligible = true;
//       if (acceptedAt && !isNaN(acceptedAt.getTime())) {
//         const diffMinutes = Math.floor((now - acceptedAt) / 60000);
//         refundEligible = diffMinutes < 5;
//       }

//       await api.put(`/jobs/${jobId}/cancelled`, {
//         cancelledBy: "customer",
//         refundEligible,
//       });

//       Alert.alert(
//         "Job Cancelled",
//         refundEligible
//           ? "Your job was cancelled within 5 minutes. You are eligible for a full refund."
//           : "Your job was cancelled after 5 minutes. A $120 travel fee will be deducted."
//       );

//       setTimeout(() => navigation.navigate("CustomerDashboard"), 10000);
//     } catch {
//       Alert.alert("Error", "Unable to cancel the job. Try again.");
//     }
//   }, [jobId, job, navigation]);

//   // ---- loading / not-found ----
//   if (loading) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.centered}>
//         <ActivityIndicator size="large" color="#fff" />
//       </LinearGradient>
//     );
//   }

//   if (!job) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.centered}>
//         <Text style={styles.errorText}>Job not found.</Text>
//       </LinearGradient>
//     );
//   }

//   const statusConfig = getStatusConfig(job.status);

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
//                 <Text style={styles.headerBadgeText}>Emergency Service</Text>
//               </View>
//               <Text style={styles.headerTitle}>Job Status</Text>
//             </View>
//             <View style={{ width: 40 }} />
//           </View>

//           {/* Status Card */}
//           <View style={styles.statusCard}>
//             <LinearGradient
//               colors={[`${statusConfig.color}20`, `${statusConfig.color}10`]}
//               style={styles.statusGradient}
//             >
//               <View style={styles.statusHeader}>
//                 <statusConfig.icon color={statusConfig.color} size={32} />
//                 <View style={styles.statusInfo}>
//                   <Text style={styles.statusTitle}>{statusConfig.text}</Text>
//                   <Text style={styles.statusSubtitle}>Job ID: {jobId?.slice(-6)}</Text>
//                 </View>
//               </View>
//               {job?.service && (
//                 <Text style={styles.serviceText}>
//                   {job.service} • {job.address}
//                 </Text>
//               )}
//             </LinearGradient>
//           </View>

//           {/* “Service Pro Located” banner (10s) */}
//           {job.status === "accepted" && showEnRouteBanner && (
//             <View style={styles.alertCard}>
//               <LinearGradient
//                 colors={["rgba(34, 197, 94, 0.2)", "rgba(16, 185, 129, 0.1)"]}
//                 style={styles.alertGradient}
//               >
//                 <View style={styles.alertHeader}>
//                   <CheckCircle color="#22c55e" size={24} />
//                   <Text style={styles.alertTitle}>Service Pro Located!</Text>
//                 </View>
//                 <Text style={styles.alertText}>
//                   Your BlinqFix professional is in route. We’ll notify you again upon arrival.
//                 </Text>
//               </LinearGradient>
//             </View>
//           )}

//           {/* Arrival banner (10s) */}
//           {showArrivalBanner && (
//             <View style={styles.alertCard}>
//               <LinearGradient
//                 colors={["rgba(96, 165, 250, 0.25)", "rgba(59, 130, 246, 0.12)"]}
//                 style={styles.alertGradient}
//               >
//                 <View style={styles.alertHeader}>
//                   <MapPin color="#60a5fa" size={24} />
//                   <Text style={styles.alertTitle}>Your Blinqfix Service Pro Has Arrived</Text>
//                 </View>
//                 <Text style={styles.alertText}>
//                   Your BlinqFix service pro is at your location.
//                 </Text>
//               </LinearGradient>
//             </View>
//           )}

//           {/* Provider Info */}
//           {providerInfo && (
//             <View style={styles.providerCard}>
//               <Text style={styles.cardTitle}>Your Service Pro</Text>
//               <View style={styles.providerInfo}>
//                 {providerInfo.profilePictureUrl ? (
//                   <Image
//                     source={{ uri: convertToBase64Uri(providerInfo.profilePictureUrl) }}
//                     style={styles.providerImage}
//                   />
//                 ) : (
//                   <View style={styles.providerImagePlaceholder}>
//                     <User color="#94a3b8" size={40} />
//                   </View>
//                 )}
//                 <View style={styles.providerDetails}>
//                   <Text style={styles.providerName}>{providerInfo.name}</Text>
//                   <Text style={styles.providerBusiness}>{providerInfo.businessName}</Text>
//                   {providerInfo.aboutMe && (
//                     <Text style={styles.providerAbout}>{providerInfo.aboutMe}</Text>
//                   )}
//                   <View style={styles.ratingContainer}>
//                     <StarRating rating={providerInfo.averageRating} size={18} />
//                   </View>
//                 </View>
//               </View>
//             </View>
//           )}

//           {/* Map */}
//           {jobLocation?.latitude && jobLocation?.longitude && (
//             <View style={styles.mapCard}>
//               <Text style={styles.cardTitle}>Location & Tracking</Text>
//               <View style={styles.mapContainer}>
//                 <MapView
//                   key={`map-${jobId}-${jobLocation.latitude}-${jobLocation.longitude}`}
//                   ref={mapRef}
//                   provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
//                   style={styles.map}
//                   initialRegion={{
//                     latitude: jobLocation.latitude,
//                     longitude: jobLocation.longitude,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                   }}
//                 >
//                   <Marker coordinate={jobLocation} title="Service Location" />
//                   {providerCoords && (
//                     <Marker
//                       coordinate={providerCoords}
//                       title="Service Professional"
//                       pinColor="blue"
//                       description="Professional's current location"
//                     />
//                   )}
//                   {routeCoords.length === 2 && (
//                     <Polyline
//                       coordinates={routeCoords}
//                       strokeColor="#60a5fa"
//                       strokeWidth={4}
//                       lineCap="round"
//                     />
//                   )}
//                 </MapView>
//               </View>
//             </View>
//           )}

//           {/* Completion Confirmation */}
//           {job.providerCompleted && !job.customerCompleted && (
//             <View style={styles.completionCard}>
//               <Text style={styles.completionTitle}>Confirm Job Completion</Text>
//               <Text style={styles.completionText}>
//                 The professional has marked this job as complete. Please review and confirm:
//               </Text>

//               {job.arrivalImage && (
//                 <Image
//                   source={{ uri: convertToBase64Uri(job.arrivalImage) }}
//                   style={styles.completionImage}
//                 />
//               )}
//               {job.completionImage && (
//                 <Image
//                   source={{ uri: convertToBase64Uri(job.completionImage) }}
//                   style={styles.completionImage}
//                 />
//               )}

//               <View style={styles.completionButtons}>
//                 <TouchableOpacity
//                   style={[styles.confirmButton, confirming && styles.confirmButtonDisabled]}
//                   onPress={handleCustomerComplete}
//                   disabled={confirming}
//                 >
//                   <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.buttonGradient}>
//                     <CheckCircle color="#fff" size={20} />
//                     <Text style={styles.confirmButtonText}>
//                       {confirming ? "Confirming..." : "Confirm Complete"}
//                     </Text>
//                   </LinearGradient>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.rejectButton}
//                   onPress={() => {
//                     if (!notCompletePressedRef.current) {
//                       notCompletePressedRef.current = true;
//                       handleNotComplete();
//                     }
//                   }}
//                 >
//                   <X color="#f87171" size={20} />
//                   <Text style={styles.rejectButtonText}>Not Complete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}

//           {/* Cancel Button */}
//           {job?.status === "accepted" && (
//             <TouchableOpacity style={styles.cancelButton} onPress={handleCancelJob}>
//               <X color="#f87171" size={20} />
//               <Text style={styles.cancelButtonText}>Cancel Job</Text>
//             </TouchableOpacity>
//           )}

//           {/* Trust Indicators (centered vertical) */}
//           <View style={styles.trustSection}>
//             <View style={styles.trustItem}>
//               <Shield color="#22c55e" size={16} />
//               <Text style={styles.trustText}>Licensed & Insured</Text>
//             </View>
//             <View style={styles.trustItem}>
//               <Clock color="#60a5fa" size={16} />
//               <Text style={styles.trustText}>Real-time Updates</Text>
//             </View>
//             <View style={styles.trustItem}>
//               <CheckCircle color="#c084fc" size={16} />
//               <Text style={styles.trustText}>Quality Guaranteed</Text>
//             </View>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// // ---------------- Styles ----------------
// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },

//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },
//   errorText: { color: "#fff", fontSize: 18, textAlign: "center" },

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

//   statusCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
//   statusGradient: { padding: 20 },
//   statusHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
//   statusInfo: { marginLeft: 16, flex: 1 },
//   statusTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
//   statusSubtitle: { fontSize: 14, color: "#e0e7ff", marginTop: 2 },
//   serviceText: { fontSize: 16, color: "#e0e7ff" },

//   alertCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
//   alertGradient: { padding: 20 },
//   alertHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
//   alertTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginLeft: 12 },
//   alertText: { fontSize: 16, color: "#e0e7ff", lineHeight: 24 },

//   providerCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   cardTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 16 },
//   providerInfo: { flexDirection: "row", alignItems: "center" },
//   providerImage: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
//   providerImagePlaceholder: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: "rgba(255,255,255,0.1)",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 16,
//   },
//   providerDetails: { flex: 1 },
//   providerName: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 4 },
//   providerBusiness: { fontSize: 16, color: "#e0e7ff", marginBottom: 8 },
//   providerAbout: { fontSize: 14, color: "#94a3b8", marginBottom: 8 },
//   ratingContainer: { alignItems: "flex-start" },

//   mapCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   mapContainer: { height: 250, borderRadius: 12 },
//   map: { flex: 1 },

//   completionCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   completionTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 12, textAlign: "center" },
//   completionText: { fontSize: 16, color: "#e0e7ff", textAlign: "center", marginBottom: 20, lineHeight: 24 },
//   completionImage: { width: "100%", height: 200, borderRadius: 12, marginBottom: 16 },
//   completionButtons: { gap: 12 },
//   confirmButton: { borderRadius: 16, overflow: "hidden" },
//   confirmButtonDisabled: { opacity: 0.6 },
//   buttonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 16,
//     paddingHorizontal: 24,
//     gap: 8,
//   },
//   confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
//   rejectButton: {
//     backgroundColor: "rgba(248, 113, 113, 0.1)",
//     borderWidth: 2,
//     borderColor: "rgba(248, 113, 113, 0.3)",
//     borderRadius: 16,
//     paddingVertical: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//   },
//   rejectButtonText: { color: "#f87171", fontSize: 16, fontWeight: "bold" },

//   cancelButton: {
//     backgroundColor: "rgba(239, 68, 68, 0.1)",
//     borderWidth: 2,
//     borderColor: "rgba(239, 68, 68, 0.3)",
//     borderRadius: 16,
//     paddingVertical: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     marginBottom: 32,
//   },
//   cancelButtonText: { color: "#f87171", fontSize: 16, fontWeight: "bold" },

//   // ✅ centered vertical trust section
//   trustSection: {
//     paddingVertical: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 12,
//   },
//   trustItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   trustText: { color: "#e0e7ff", fontSize: 12, fontWeight: "500" },
// });

// //working
// import React, { useEffect, useState, useRef, useCallback } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   Image,
//   StyleSheet,
//   Platform,
//   SafeAreaView,
//   Vibration,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
// import { LinearGradient } from "expo-linear-gradient";
// import io from "socket.io-client";
// import * as Notifications from "expo-notifications";
// import { Audio } from "expo-av";

// import api from "../api/client";
// import { saveSession, clearSession } from "../utils/sessionManager";
// import StarRating from "../components/StarRating";
// import { Buffer } from "buffer";
// import {
//   MapPin,
//   Clock,
//   CheckCircle,
//   X,
//   User,
//   ArrowLeft,
//   Zap,
//   Shield,
// } from "lucide-react-native";

// // 🔊 local chime for foreground (same sound as invitations)
// const NOTIF_SOUND = require("../assets/notification.mp3");

// // --- Cancellation policy ---
// const CANCELLATION_GRACE_MINUTES = 5;
// const CANCELLATION_FEE_USD = 120; // change here if your fee differs

// // ---- small utils ----
// const convertToBase64Uri = (input) => {
//   if (!input) return null;
//   if (typeof input === "string") {
//     if (input.startsWith("data:image")) return input;
//     return `data:image/jpeg;base64,${input}`;
//   }
//   if (input?.type === "Buffer" && Array.isArray(input.data)) {
//     return `data:image/jpeg;base64,${Buffer.from(input.data).toString("base64")}`;
//   }
//   return null;
// };

// const getStatusConfig = (status) => {
//   switch (status) {
//     case "pending":
//     case "invited":
//       return { color: "#facc15", icon: Clock, text: "Finding Service Pro" };
//     case "accepted":
//       return { color: "#60a5fa", icon: MapPin, text: "Professional En Route" };
//     case "arrived":
//       return { color: "#22c55e", icon: CheckCircle, text: "Pro Has Arrived" };
//     case "completed":
//       return { color: "#22c55e", icon: CheckCircle, text: "Job Completed" };
//     default:
//       return { color: "#94a3b8", icon: Clock, text: status };
//   }
// };

// // meters between two LatLngs
// const distanceMeters = (a, b) => {
//   if (!a || !b) return Infinity;
//   const toRad = (d) => (d * Math.PI) / 180;
//   const R = 6371000;
//   const dLat = toRad(b.latitude - a.latitude);
//   const dLon = toRad(b.longitude - a.longitude);
//   const lat1 = toRad(a.latitude);
//   const lat2 = toRad(b.latitude);
//   const h =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
//   return 2 * R * Math.asin(Math.sqrt(h));
// };

// // ---------------- Component ----------------
// export default function CustomerJobStatus() {
//   const route = useRoute();
//   const { jobId: routeJobId } = route?.params || {};
//   const navigation = useNavigation();

//   const [jobId, setJobId] = useState(routeJobId);
//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [confirming, setConfirming] = useState(false);

//   const [providerInfo, setProviderInfo] = useState(null);
//   const [providerCoords, setProviderCoords] = useState(null);
//   const [jobLocation, setJobLocation] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);

//   // Banners
//   const [showEnRouteBanner, setShowEnRouteBanner] = useState(false);
//   const [showArrivalBanner, setShowArrivalBanner] = useState(false);

//   const notCompletePressedRef = useRef(false);
//   const hasShownEnRouteRef = useRef(false); // prevent re-spam on polls
//   const hasShownArrivalRef = useRef(false);

//   const mapRef = useRef(null);
//   const socketRef = useRef(null);
//   const prevStatusRef = useRef(null);
//   const arrivalTimeoutRef = useRef(null);
//   const enRouteTimeoutRef = useRef(null);

//   // ---- chime helper ----
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

//   // ---- local notification helper ----
//   const sendLocalNotification = useCallback(async (title, body, data = {}) => {
//     try {
//       await Notifications.scheduleNotificationAsync({
//         content: {
//           title,
//           body,
//           data,
//           sound: Platform.OS === "ios" ? "notification.wav" : undefined, // iOS bundle name
//         },
//         trigger: Platform.select({
//           android: { channelId: "job-invites-v2" }, // 🔔 custom sound channel
//           ios: null,
//         }),
//       });
//     } catch (e) {
//       // no-op
//     }
//   }, []);

//   // ---- guard invalid nav ----
//   useEffect(() => {
//     if (!routeJobId) {
//       Alert.alert("Navigation Error", "Missing job ID. Returning to dashboard.", [
//         { text: "OK", onPress: () => navigation.navigate("CustomerDashboard") },
//       ]);
//     }
//   }, [routeJobId, navigation]);

//   // ---- persist session until complete ----
//   useEffect(() => {
//     if (job && job.status !== "completed") {
//       saveSession({ role: "customer", jobId: job._id });
//     }
//   }, [job]);

//   // ---- socket: job updates + live provider GPS ----
//   useEffect(() => {
//     if (!jobId) return;
//     const base = api.defaults.baseURL?.replace("/api", "");
//     const socket = io(base, { transports: ["websocket"] });
//     socketRef.current = socket;

//     socket.emit("join", jobId);
//     socket.on("jobUpdated", (updatedJob) => {
//       if (updatedJob._id === jobId) setJob(updatedJob);
//     });

//     // if your backend emits live GPS { lat, lng }
//     socket.on("providerLocation", (loc) => {
//       const lat = Number(loc?.lat ?? loc?.latitude);
//       const lng = Number(loc?.lng ?? loc?.longitude);
//       if (Number.isFinite(lat) && Number.isFinite(lng)) {
//         setProviderCoords({ latitude: lat, longitude: lng });
//       }
//     });

//     return () => {
//       socket.disconnect();
//       socketRef.current = null;
//     };
//   }, [jobId]);

//   // ---- poll job ----
//   useEffect(() => {
//     let alive = true;

//     const fetchJob = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (!alive) return;
//         setJob(data);

//         if (!jobId) setJobId(data._id);

//         // provider info
//         if (data.acceptedProvider) {
//           try {
//             const res = await api.get(`/users/${data.acceptedProvider}`);
//             const p = res.data;
//             setProviderInfo({
//               name: p.name,
//               businessName: p.businessName,
//               aboutMe: p.aboutMe,
//               profilePictureUrl: p.profilePicture || null,
//               averageRating: p.averageRating ?? null,
//             });
//           } catch {}
//         }

//         const jobLoc = data.location?.coordinates;
//         if (Array.isArray(jobLoc) && jobLoc.length >= 2) {
//           const [lng, lat] = jobLoc;
//           setJobLocation({ latitude: lat, longitude: lng });
//         }

//         // completion flow
//         if (data.customerCompleted && data.providerCompleted) {
//           await clearSession();
//           navigation.replace("RateProvider", { jobId: data._id });
//           return;
//         }

//         if (data.status === "awaiting-additional-payment") {
//           navigation.replace("PaymentScreen", { jobId: data._id });
//           return;
//         }

//         // Fallback arrival via server flags
//         if (
//           !hasShownArrivalRef.current &&
//           (data.status === "arrived" || data.arrivedAt || data.providerArrived)
//         ) {
//           hasShownArrivalRef.current = true;
//           setShowArrivalBanner(true);
//           playChime();
//           sendLocalNotification("Your Pro Has Arrived", "Your BlinqFix pro is at your location.", {
//             jobId: data._id,
//             type: "arrival",
//           });
//           if (arrivalTimeoutRef.current) clearTimeout(arrivalTimeoutRef.current);
//           arrivalTimeoutRef.current = setTimeout(() => setShowArrivalBanner(false), 10000);
//         }
//       } catch (err) {
//         if (alive) {
//           console.error("[FetchJob Error]:", err?.message);
//           Alert.alert("Error", "Unable to load job status.");
//         }
//       } finally {
//         if (alive) setLoading(false);
//       }
//     };

//     if (jobId) {
//       fetchJob();
//       const iv = setInterval(fetchJob, 25000);
//       return () => {
//         alive = false;
//         clearInterval(iv);
//       };
//     }
//   }, [jobId, navigation, playChime, sendLocalNotification]);

//   // ---- watch status transitions for “located” alert ----
//   useEffect(() => {
//     const prev = prevStatusRef.current;
//     const curr = job?.status;

//     if (curr === "accepted" && prev !== "accepted" && !hasShownEnRouteRef.current) {
//       hasShownEnRouteRef.current = true;
//       setShowEnRouteBanner(true);
//       playChime();
//       sendLocalNotification("Service Pro Located", "Your BlinqFix pro is on the way.", {
//         jobId,
//         type: "service_pro_found",
//       });
//       if (enRouteTimeoutRef.current) clearTimeout(enRouteTimeoutRef.current);
//       enRouteTimeoutRef.current = setTimeout(() => setShowEnRouteBanner(false), 10000);
//     }

//     prevStatusRef.current = curr;
//   }, [job?.status, jobId, playChime, sendLocalNotification]);

//   // ---- proximity arrival detection (100m) ----
//   useEffect(() => {
//     if (providerCoords && jobLocation && !hasShownArrivalRef.current) {
//       const d = distanceMeters(providerCoords, jobLocation);
//       if (d <= 100) {
//         hasShownArrivalRef.current = true;
//         setShowArrivalBanner(true);
//         playChime();
//         sendLocalNotification("Your Pro Has Arrived", "Your BlinqFix pro is at your location.", {
//           jobId,
//           type: "arrival_proximity",
//         });

//         // Optionally tell backend
//         (async () => {
//           try {
//             await api.put(`/jobs/${jobId}/status`, { status: "arrived" });
//           } catch {}
//         })();

//         if (arrivalTimeoutRef.current) clearTimeout(arrivalTimeoutRef.current);
//         arrivalTimeoutRef.current = setTimeout(() => setShowArrivalBanner(false), 10000);
//       }
//     }
//   }, [providerCoords, jobLocation, jobId, playChime, sendLocalNotification]);

//   // ---- cleanup timers ----
//   useEffect(() => {
//     return () => {
//       if (arrivalTimeoutRef.current) clearTimeout(arrivalTimeoutRef.current);
//       if (enRouteTimeoutRef.current) clearTimeout(enRouteTimeoutRef.current);
//     };
//   }, []);

//   // ---- actions ----
//   const handleNotComplete = useCallback(async () => {
//     try {
//       await api.put(`/jobs/${jobId}/status`, {
//         status: "accepted",
//         providerCompleted: false,
//       });
//       await api.post(`/jobs/${jobId}/notify-not-complete`);
//       Alert.alert("Noted", "The service pro has been notified. Please await their update.");
//       setJob((prev) => ({ ...prev, providerCompleted: false }));
//     } catch (err) {
//       Alert.alert("Error", "Failed to update status");
//     }
//   }, [jobId]);

//   const handleCustomerComplete = useCallback(async () => {
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
//       setJob(data);
//     } catch {
//       Alert.alert("Error", "Could not confirm completion");
//     }
//   }, [jobId]);

//   // NEW: Cancel with policy (5-minute grace, otherwise fee + partial refund)
//   const handleCancelJob = useCallback(async () => {
//     try {
//       // Determine paid amount from common fields
//       const pickPaid = (j) => {
//         const candidates = [
//           j?.totalAmountPaid,
//           j?.amountPaid,
//           j?.capturedAmount,
//           j?.estimatedTotal,
//           j?.customerTotal,
//           j?.totalWithFees,
//           j?.total,
//         ];
//         for (const n of candidates) {
//           const v = Number(n);
//           if (Number.isFinite(v) && v >= 0) return v;
//         }
//         return 0;
//       };

//       const amountPaid = pickPaid(job);

//       // Determine if within grace period (5 minutes from acceptance)
//       const acceptedAtRaw = job?.acceptedAt || job?.accepted_at;
//       let refundEligible = true; // default to full refund if there's no acceptance timestamp yet
//       if (acceptedAtRaw) {
//         const acceptedAt = new Date(acceptedAtRaw);
//         const diffMs = Date.now() - acceptedAt.getTime();
//         if (Number.isFinite(diffMs)) {
//           refundEligible = diffMs < CANCELLATION_GRACE_MINUTES * 60 * 1000;
//         }
//       }

//       // Fee + refund math
//       const cancellationFee = refundEligible ? 0 : CANCELLATION_FEE_USD;
//       const refundAmount = refundEligible
//         ? amountPaid
//         : Math.max(0, amountPaid - cancellationFee);

//       // Confirmation prompt with accurate amounts
//       const msg = refundEligible
//         ? `Cancel now for a full refund of $${amountPaid.toFixed(2)}.`
//         : `Canceling now incurs a $${cancellationFee.toFixed(
//             2
//           )} cancellation fee.\nEstimated refund: $${refundAmount.toFixed(2)}.`;

//       const confirmed = await new Promise((resolve) =>
//         Alert.alert("Cancel Job", msg, [
//           { text: "No", style: "cancel", onPress: () => resolve(false) },
//           { text: "Yes, Cancel", onPress: () => resolve(true) },
//         ])
//       );
//       if (!confirmed) return;

//       // Inform backend (extra fields are harmless if ignored)
//       await api.put(`/jobs/${jobId}/cancelled`, {
//         cancelledBy: "customer",
//         refundEligible,
//         cancellationFee,
//         refundAmount,
//       });

//       // Final note to user
//       Alert.alert(
//         "Job Cancelled",
//         refundEligible
//           ? `You cancelled within ${CANCELLATION_GRACE_MINUTES} minutes. A full refund of $${amountPaid.toFixed(
//               2
//             )} will be issued.`
//           : `A $${cancellationFee.toFixed(
//               2
//             )} cancellation fee applies. Your estimated refund is $${refundAmount.toFixed(
//               2
//             )}.`
//       );

//       // Leave the screen after a moment
//       setTimeout(() => {
//         navigation.navigate("CustomerDashboard");
//       }, 10000);
//     } catch (err) {
//       Alert.alert("Error", "Unable to cancel the job. Try again.");
//     }
//   }, [job, jobId, navigation]);

//   // ---- loading / not-found ----
//   if (loading) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.centered}>
//         <ActivityIndicator size="large" color="#fff" />
//       </LinearGradient>
//     );
//   }

//   if (!job) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.centered}>
//         <Text style={styles.errorText}>Job not found.</Text>
//       </LinearGradient>
//     );
//   }

//   const statusConfig = getStatusConfig(job.status);

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
//               <View className="align-center" style={styles.headerBadge}>
//                 <Zap color="#facc15" size={16} />
//                 <Text style={styles.headerBadgeText}>Emergency Service</Text>
//               </View>
//               <Text style={styles.headerTitle}>Job Status</Text>
//             </View>
//             <View style={{ width: 40 }} />
//           </View>

//           {/* Status Card */}
//           <View style={styles.statusCard}>
//             <LinearGradient
//               colors={[`${statusConfig.color}20`, `${statusConfig.color}10`]}
//               style={styles.statusGradient}
//             >
//               <View style={styles.statusHeader}>
//                 <statusConfig.icon color={statusConfig.color} size={32} />
//                 <View style={styles.statusInfo}>
//                   <Text style={styles.statusTitle}>{statusConfig.text}</Text>
//                   <Text style={styles.statusSubtitle}>Job ID: {jobId?.slice(-6)}</Text>
//                 </View>
//               </View>
//               {job?.service && (
//                 <Text style={styles.serviceText}>
//                   {job.service} • {job.address}
//                 </Text>
//               )}
//             </LinearGradient>
//           </View>

//           {/* “Service Pro Located” banner (10s) */}
//           {job.status === "accepted" && showEnRouteBanner && (
//             <View style={styles.alertCard}>
//               <LinearGradient
//                 colors={["rgba(34, 197, 94, 0.2)", "rgba(16, 185, 129, 0.1)"]}
//                 style={styles.alertGradient}
//               >
//                 <View style={styles.alertHeader}>
//                   <CheckCircle color="#22c55e" size={24} />
//                   <Text style={styles.alertTitle}>Service Pro Located!</Text>
//                 </View>
//                 <Text style={styles.alertText}>
//                   Your BlinqFix professional is en route. We’ll notify you again upon arrival.
//                 </Text>
//               </LinearGradient>
//             </View>
//           )}

//           {/* Arrival banner (10s) */}
//           {showArrivalBanner && (
//             <View style={styles.alertCard}>
//               <LinearGradient
//                 colors={["rgba(96, 165, 250, 0.25)", "rgba(59, 130, 246, 0.12)"]}
//                 style={styles.alertGradient}
//               >
//                 <View style={styles.alertHeader}>
//                   <MapPin color="#60a5fa" size={24} />
//                   <Text style={styles.alertTitle}>Your Pro Has Arrived</Text>
//                 </View>
//                 <Text style={styles.alertText}>
//                   Your BlinqFix professional is at your location.
//                 </Text>
//               </LinearGradient>
//             </View>
//           )}

//           {/* Provider Info */}
//           {providerInfo && (
//             <View style={styles.providerCard}>
//               <Text style={styles.cardTitle}>Your Service Pro</Text>
//               <View style={styles.providerInfo}>
//                 {providerInfo.profilePictureUrl ? (
//                   <Image
//                     source={{ uri: convertToBase64Uri(providerInfo.profilePictureUrl) }}
//                     style={styles.providerImage}
//                   />
//                 ) : (
//                   <View style={styles.providerImagePlaceholder}>
//                     <User color="#94a3b8" size={40} />
//                   </View>
//                 )}
//                 <View style={styles.providerDetails}>
//                   <Text style={styles.providerName}>{providerInfo.name}</Text>
//                   <Text style={styles.providerBusiness}>{providerInfo.businessName}</Text>
//                   {providerInfo.aboutMe && (
//                     <Text style={styles.providerAbout}>{providerInfo.aboutMe}</Text>
//                   )}
//                   <View style={styles.ratingContainer}>
//                     <StarRating rating={providerInfo.averageRating} size={18} />
//                   </View>
//                 </View>
//               </View>
//             </View>
//           )}

//           {/* Map */}
//           {jobLocation?.latitude && jobLocation?.longitude && (
//             <View style={styles.mapCard}>
//               <Text style={styles.cardTitle}>Location & Tracking</Text>
//               <View style={styles.mapContainer}>
//                 <MapView
//                   key={`map-${jobId}-${jobLocation.latitude}-${jobLocation.longitude}`}
//                   provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
//                   style={styles.map}
//                   initialRegion={{
//                     latitude: jobLocation.latitude,
//                     longitude: jobLocation.longitude,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                   }}
//                 >
//                   <Marker coordinate={jobLocation} title="Service Location" />
//                   {providerCoords && (
//                     <Marker
//                       coordinate={providerCoords}
//                       title="Service Professional"
//                       pinColor="blue"
//                       description="Professional's current location"
//                     />
//                   )}
//                   {routeCoords.length === 2 && (
//                     <Polyline
//                       coordinates={routeCoords}
//                       strokeColor="#60a5fa"
//                       strokeWidth={4}
//                       lineCap="round"
//                     />
//                   )}
//                 </MapView>
//               </View>
//             </View>
//           )}

//           {/* Completion Confirmation */}
//           {job.providerCompleted && !job.customerCompleted && (
//             <View style={styles.completionCard}>
//               <Text style={styles.completionTitle}>Confirm Job Completion</Text>
//               <Text style={styles.completionText}>
//                 The professional has marked this job as complete. Please review and confirm:
//               </Text>

//               {job.arrivalImage && (
//                 <Image
//                   source={{ uri: convertToBase64Uri(job.arrivalImage) }}
//                   style={styles.completionImage}
//                 />
//               )}
//               {job.completionImage && (
//                 <Image
//                   source={{ uri: convertToBase64Uri(job.completionImage) }}
//                   style={styles.completionImage}
//                 />
//               )}

//               <View style={styles.completionButtons}>
//                 <TouchableOpacity
//                   style={[styles.confirmButton, confirming && styles.confirmButtonDisabled]}
//                   onPress={handleCustomerComplete}
//                   disabled={confirming}
//                 >
//                   <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.buttonGradient}>
//                     <CheckCircle color="#fff" size={20} />
//                     <Text style={styles.confirmButtonText}>
//                       {confirming ? "Confirming..." : "Confirm Complete"}
//                     </Text>
//                   </LinearGradient>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.rejectButton}
//                   onPress={() => {
//                     if (!notCompletePressedRef.current) {
//                       notCompletePressedRef.current = true;
//                       handleNotComplete();
//                     }
//                   }}
//                 >
//                   <X color="#f87171" size={20} />
//                   <Text style={styles.rejectButtonText}>Not Complete</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}

//           {/* Cancel Button + policy note */}
//           {job?.status === "accepted" && (
//             <>
//               <TouchableOpacity style={styles.cancelButton} onPress={handleCancelJob}>
//                 <X color="#f87171" size={20} />
//                 <Text style={styles.cancelButtonText}>Cancel Job</Text>
//               </TouchableOpacity>
//               <Text style={styles.policyNote}>
//                 Cancel within {CANCELLATION_GRACE_MINUTES} minutes of acceptance for a full refund.
//                 After that, a ${CANCELLATION_FEE_USD.toFixed(2)} cancellation fee applies and the
//                 remainder will be refunded.
//               </Text>
//             </>
//           )}

//           {/* Trust Indicators (centered vertical) */}
//           <View style={styles.trustSection}>
//             <View style={styles.trustItem}>
//               <Shield color="#22c55e" size={16} />
//               <Text style={styles.trustText}>Licensed & Insured</Text>
//             </View>
//             <View style={styles.trustItem}>
//               <Clock color="#60a5fa" size={16} />
//               <Text style={styles.trustText}>Real-time Updates</Text>
//             </View>
//             <View style={styles.trustItem}>
//               <CheckCircle color="#c084fc" size={16} />
//               <Text style={styles.trustText}>Quality Guaranteed</Text>
//             </View>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// // ---------------- Styles ----------------
// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },

//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },
//   errorText: { color: "#fff", fontSize: 18, textAlign: "center" },

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

//   statusCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
//   statusGradient: { padding: 20 },
//   statusHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
//   statusInfo: { marginLeft: 16, flex: 1 },
//   statusTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
//   statusSubtitle: { fontSize: 14, color: "#e0e7ff", marginTop: 2 },
//   serviceText: { fontSize: 16, color: "#e0e7ff" },

//   alertCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
//   alertGradient: { padding: 20 },
//   alertHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
//   alertTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginLeft: 12 },
//   alertText: { fontSize: 16, color: "#e0e7ff", lineHeight: 24 },

//   providerCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   cardTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 16 },
//   providerInfo: { flexDirection: "row", alignItems: "center" },
//   providerImage: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
//   providerImagePlaceholder: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: "rgba(255,255,255,0.1)",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 16,
//   },
//   providerDetails: { flex: 1 },
//   providerName: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 4 },
//   providerBusiness: { fontSize: 16, color: "#e0e7ff", marginBottom: 8 },
//   providerAbout: { fontSize: 14, color: "#94a3b8", marginBottom: 8 },
//   ratingContainer: { alignItems: "flex-start" },

//   mapCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   mapContainer: { height: 250, borderRadius: 12 },
//   map: { flex: 1 },

//   completionCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   completionTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 12, textAlign: "center" },
//   completionText: { fontSize: 16, color: "#e0e7ff", textAlign: "center", marginBottom: 20, lineHeight: 24 },
//   completionImage: { width: "100%", height: 200, borderRadius: 12, marginBottom: 16 },
//   completionButtons: { gap: 12 },
//   confirmButton: { borderRadius: 16, overflow: "hidden" },
//   confirmButtonDisabled: { opacity: 0.6 },
//   buttonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 16,
//     paddingHorizontal: 24,
//     gap: 8,
//   },
//   confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
//   rejectButton: {
//     backgroundColor: "rgba(248, 113, 113, 0.1)",
//     borderWidth: 2,
//     borderColor: "rgba(248, 113, 113, 0.3)",
//     borderRadius: 16,
//     paddingVertical: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//   },
//   rejectButtonText: { color: "#f87171", fontSize: 16, fontWeight: "bold" },

//   cancelButton: {
//     backgroundColor: "rgba(239, 68, 68, 0.1)",
//     borderWidth: 2,
//     borderColor: "rgba(239, 68, 68, 0.3)",
//     borderRadius: 16,
//     paddingVertical: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     marginBottom: 8,
//   },
//   cancelButtonText: { color: "#f87171", fontSize: 16, fontWeight: "bold" },
//   policyNote: {
//     color: "#e0e7ff",
//     fontSize: 12,
//     textAlign: "center",
//     marginBottom: 32,
//     opacity: 0.8,
//   },

//   // ✅ centered vertical trust section
//   trustSection: {
//     paddingVertical: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 12,
//   },
//   trustItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   trustText: { color: "#e0e7ff", fontSize: 12, fontWeight: "500" },
// });

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Platform,
  SafeAreaView,
  Vibration,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import io from "socket.io-client";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";

import api from "../api/client";
import * as session from "../utils/sessionManager"; // ← use namespace (save, clear, and optional load)
import StarRating from "../components/StarRating";
import { Buffer } from "buffer";
import {
  MapPin,
  Clock,
  CheckCircle,
  X,
  User,
  ArrowLeft,
  Zap,
  Shield,
  RefreshCw, // ← for Resume button
} from "lucide-react-native";

// 🔊 local chime for foreground (same sound as invitations)
const NOTIF_SOUND = require("../assets/notification.mp3");

// --- Cancellation policy ---
const CANCELLATION_GRACE_MINUTES = 5;
const CANCELLATION_FEE_USD = 120; // change here if your fee differs

// ---- small utils ----
const convertToBase64Uri = (input) => {
  if (!input) return null;
  if (typeof input === "string") {
    if (input.startsWith("data:image")) return input;
    return `data:image/jpeg;base64,${input}`;
  }
  if (input?.type === "Buffer" && Array.isArray(input.data)) {
    return `data:image/jpeg;base64,${Buffer.from(input.data).toString("base64")}`;
  }
  return null;
};

const getStatusConfig = (status) => {
  switch (status) {
    case "pending":
    case "invited":
      return { color: "#facc15", icon: Clock, text: "Finding Service Pro" };
    case "accepted":
      return { color: "#60a5fa", icon: MapPin, text: "Professional En Route" };
    case "arrived":
      return { color: "#22c55e", icon: CheckCircle, text: "Pro Has Arrived" };
    case "completed":
      return { color: "#22c55e", icon: CheckCircle, text: "Job Completed" };
    default:
      return { color: "#94a3b8", icon: Clock, text: status };
  }
};

// meters between two LatLngs
const distanceMeters = (a, b) => {
  if (!a || !b) return Infinity;
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// ---------------- Component ----------------
export default function CustomerJobStatus() {
  const route = useRoute();
  const { jobId: routeJobId } = route?.params || {};
  const navigation = useNavigation();

  const [jobId, setJobId] = useState(routeJobId);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [resuming, setResuming] = useState(false); // ← for Resume button

  const [providerInfo, setProviderInfo] = useState(null);
  const [providerCoords, setProviderCoords] = useState(null);
  const [jobLocation, setJobLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  // Banners
  const [showEnRouteBanner, setShowEnRouteBanner] = useState(false);
  const [showArrivalBanner, setShowArrivalBanner] = useState(false);

  const notCompletePressedRef = useRef(false);
  const hasShownEnRouteRef = useRef(false); // prevent re-spam on polls
  const hasShownArrivalRef = useRef(false);

  const mapRef = useRef(null);
  const socketRef = useRef(null);
  const prevStatusRef = useRef(null);
  const arrivalTimeoutRef = useRef(null);
  const enRouteTimeoutRef = useRef(null);

  // polling + alert guards (avoid infinite loop on 404)
  const pollRef = useRef(null);
  const notFoundHandledRef = useRef(false);
  const firstErrorAlertRef = useRef(false);

  // ---- chime helper ----
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

  // ---- local notification helper ----
  const sendLocalNotification = useCallback(async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: Platform.OS === "ios" ? "notification.wav" : undefined, // iOS bundle name
        },
        trigger: Platform.select({
          android: { channelId: "job-invites-v2" }, // 🔔 custom sound channel
          ios: null,
        }),
      });
    } catch (e) {
      // no-op
    }
  }, []);

  // ---- guard invalid nav ----
  useEffect(() => {
    if (!routeJobId) {
      Alert.alert("Navigation Error", "Missing job ID. Returning to dashboard.", [
        { text: "OK", onPress: () => navigation.navigate("CustomerDashboard") },
      ]);
    }
  }, [routeJobId, navigation]);

  // ---- persist session until complete ----
  useEffect(() => {
    if (job && job.status !== "completed") {
      session.saveSession?.({ role: "customer", jobId: job._id });
    }
  }, [job]);

  // ---- socket: job updates + live provider GPS ----
  useEffect(() => {
    if (!jobId) return;
    const base = api.defaults.baseURL?.replace("/api", "");
    const socket = io(base, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("join", jobId);
    socket.on("jobUpdated", (updatedJob) => {
      if (updatedJob._id === jobId) setJob(updatedJob);
    });

    // if your backend emits live GPS { lat, lng }
    socket.on("providerLocation", (loc) => {
      const lat = Number(loc?.lat ?? loc?.latitude);
      const lng = Number(loc?.lng ?? loc?.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setProviderCoords({ latitude: lat, longitude: lng });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [jobId]);

  // ---- poll job (with 404 guard) ----
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
        setJob(data);

        if (!jobId) setJobId(data._id);

        // provider info
        if (data.acceptedProvider) {
          try {
            const res = await api.get(`/users/${data.acceptedProvider}`);
            const p = res.data;
            setProviderInfo({
              name: p.name,
              businessName: p.businessName,
              aboutMe: p.aboutMe,
              profilePictureUrl: p.profilePicture || null,
              averageRating: p.averageRating ?? null,
            });
          } catch {}
        }

        const jobLoc = data.location?.coordinates;
        if (Array.isArray(jobLoc) && jobLoc.length >= 2) {
          const [lng, lat] = jobLoc;
          setJobLocation({ latitude: lat, longitude: lng });
        }

        // completion flow
        if (data.customerCompleted && data.providerCompleted) {
          stopPolling();
          await session.clearSession?.();
          navigation.replace("RateProvider", { jobId: data._id });
          return;
        }

        if (
          data.status === "awaiting-additional-payment" ||
          data?.paymentStatus === "awaiting_additional" ||
          data?.billingStatus === "awaiting-additional" ||
          data?.additionalPaymentStatus === "awaiting"
        ) {
          stopPolling();
          navigation.replace("PaymentScreen", { jobId: data._id });
          return;
        }

        // Fallback arrival via server flags
        if (
          !hasShownArrivalRef.current &&
          (data.status === "arrived" || data.arrivedAt || data.providerArrived)
        ) {
          hasShownArrivalRef.current = true;
          setShowArrivalBanner(true);
          playChime();
          sendLocalNotification("Your Pro Has Arrived", "Your BlinqFix pro is at your location.", {
            jobId: data._id,
            type: "arrival",
          });
          if (arrivalTimeoutRef.current) clearTimeout(arrivalTimeoutRef.current);
          arrivalTimeoutRef.current = setTimeout(() => setShowArrivalBanner(false), 10000);
        }
      } catch (err) {
        if (!alive) return;

        const status = err?.response?.status;
        if (status === 404) {
          if (!notFoundHandledRef.current) {
            notFoundHandledRef.current = true;
            stopPolling();
            await session.clearSession?.();
            Alert.alert(
              "Job Not Found",
              "This job may have been closed or removed. Returning to your dashboard.",
              [{ text: "OK", onPress: () => navigation.replace("CustomerDashboard") }]
            );
          }
          setJob(null);
          setLoading(false);
          return;
        }

        if (!firstErrorAlertRef.current) {
          firstErrorAlertRef.current = true;
          Alert.alert("Error", "Unable to load job status.");
        }
        console.error("[FetchJob Error]:", err?.message || err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
      pollRef.current = setInterval(fetchJob, 25000);
      return () => {
        alive = false;
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };
    }
  }, [jobId, navigation, playChime, sendLocalNotification]);

  // ---- watch status transitions for “located” alert ----
  useEffect(() => {
    const prev = prevStatusRef.current;
    const curr = job?.status;

    if (curr === "accepted" && prev !== "accepted" && !hasShownEnRouteRef.current) {
      hasShownEnRouteRef.current = true;
      setShowEnRouteBanner(true);
      playChime();
      sendLocalNotification("Service Pro Located", "Your BlinqFix pro is on the way.", {
        jobId,
        type: "service_pro_found",
      });
      if (enRouteTimeoutRef.current) clearTimeout(enRouteTimeoutRef.current);
      enRouteTimeoutRef.current = setTimeout(() => setShowEnRouteBanner(false), 10000);
    }

    prevStatusRef.current = curr;
  }, [job?.status, jobId, playChime, sendLocalNotification]);

  // ---- proximity arrival detection (100m) ----
  useEffect(() => {
    if (providerCoords && jobLocation && !hasShownArrivalRef.current) {
      const d = distanceMeters(providerCoords, jobLocation);
      if (d <= 100) {
        hasShownArrivalRef.current = true;
        setShowArrivalBanner(true);
        playChime();
        sendLocalNotification("Your Pro Has Arrived", "Your BlinqFix pro is at your location.", {
          jobId,
          type: "arrival_proximity",
        });

        // Optionally tell backend
        (async () => {
          try {
            await api.put(`/jobs/${jobId}/status`, { status: "arrived" });
          } catch {}
        })();

        if (arrivalTimeoutRef.current) clearTimeout(arrivalTimeoutRef.current);
        arrivalTimeoutRef.current = setTimeout(() => setShowArrivalBanner(false), 10000);
      }
    }
  }, [providerCoords, jobLocation, jobId, playChime, sendLocalNotification]);

  // ---- cleanup timers ----
  useEffect(() => {
    return () => {
      if (arrivalTimeoutRef.current) clearTimeout(arrivalTimeoutRef.current);
      if (enRouteTimeoutRef.current) clearTimeout(enRouteTimeoutRef.current);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  // ---- RESUME ACTIVE JOB (customer) ----
  const resumeActiveJob = useCallback(async () => {
    setResuming(true);
    try {
      // 1) Try local session first (if sessionManager exposes it)
      let active = null;
      try {
        const s = await session.loadSession?.();
        if (s?.role === "customer" && s?.jobId) {
          const { data } = await api.get(`/jobs/${s.jobId}`);
          active = data;
        }
      } catch {}

      // 2) Fallback: ask backend for active job
      if (!active) {
        try {
          // Prefer a dedicated endpoint if you have one
          // Example tries:
          //   /jobs/active?role=customer  OR /jobs/active
          let res = await api.get("/jobs/active?role=customer");
          active = Array.isArray(res.data) ? res.data[0] : res.data;
        } catch (e1) {
          // graceful degradation if the above 404s
          try {
            let res2 = await api.get("/jobs/active");
            active = Array.isArray(res2.data) ? res2.data[0] : res2.data;
          } catch {}
        }
      }

      if (active && active._id) {
        // Route based on state
        if (active.customerCompleted && active.providerCompleted) {
          navigation.replace("RateProvider", { jobId: active._id });
          return;
        }
        if (
          active.status === "awaiting-additional-payment" ||
          active?.paymentStatus === "awaiting_additional" ||
          active?.billingStatus === "awaiting-additional" ||
          active?.additionalPaymentStatus === "awaiting"
        ) {
          navigation.replace("PaymentScreen", { jobId: active._id });
          return;
        }
        navigation.replace("CustomerJobStatus", { jobId: active._id });
      } else {
        Alert.alert("No Active Job", "We couldn’t find an in-progress job to resume.");
      }
    } catch (e) {
      Alert.alert("Resume Failed", "Something went wrong while looking up your active job.");
    } finally {
      setResuming(false);
    }
  }, [navigation]);

  // ---- actions ----
  const handleNotComplete = useCallback(async () => {
    try {
      await api.put(`/jobs/${jobId}/status`, {
        status: "accepted",
        providerCompleted: false,
      });
      await api.post(`/jobs/${jobId}/notify-not-complete`);
      Alert.alert("Noted", "The service pro has been notified. Please await their update.");
      setJob((prev) => ({ ...prev, providerCompleted: false }));
    } catch (err) {
      Alert.alert("Error", "Failed to update status");
    }
  }, [jobId]);

  const handleCustomerComplete = useCallback(async () => {
    try {
      const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
      setJob(data);
    } catch {
      Alert.alert("Error", "Could not confirm completion");
    }
  }, [jobId]);

  // NEW: Cancel with policy (5-minute grace, otherwise fee + partial refund)
  const handleCancelJob = useCallback(async () => {
    try {
      const pickPaid = (j) => {
        const candidates = [
          j?.totalAmountPaid,
          j?.amountPaid,
          j?.capturedAmount,
          j?.estimatedTotal,
          j?.customerTotal,
          j?.totalWithFees,
          j?.total,
        ];
        for (const n of candidates) {
          const v = Number(n);
          if (Number.isFinite(v) && v >= 0) return v;
        }
        return 0;
      };

      const amountPaid = pickPaid(job);

      const acceptedAtRaw = job?.acceptedAt || job?.accepted_at;
      let refundEligible = true;
      if (acceptedAtRaw) {
        const acceptedAt = new Date(acceptedAtRaw);
        const diffMs = Date.now() - acceptedAt.getTime();
        if (Number.isFinite(diffMs)) {
          refundEligible = diffMs < CANCELLATION_GRACE_MINUTES * 60 * 1000;
        }
      }

      const cancellationFee = refundEligible ? 0 : CANCELLATION_FEE_USD;
      const refundAmount = refundEligible
        ? amountPaid
        : Math.max(0, amountPaid - cancellationFee);

      const msg = refundEligible
        ? `Cancel now for a full refund of $${amountPaid.toFixed(2)}.`
        : `Canceling now incurs a $${cancellationFee.toFixed(
            2
          )} cancellation fee.\nEstimated refund: $${refundAmount.toFixed(2)}.`;

      const confirmed = await new Promise((resolve) =>
        Alert.alert("Cancel Job", msg, [
          { text: "No", style: "cancel", onPress: () => resolve(false) },
          { text: "Yes, Cancel", onPress: () => resolve(true) },
        ])
      );
      if (!confirmed) return;

      await api.put(`/jobs/${jobId}/cancelled`, {
        cancelledBy: "customer",
        refundEligible,
        cancellationFee,
        refundAmount,
      });

      Alert.alert(
        "Job Cancelled",
        refundEligible
          ? `You cancelled within ${CANCELLATION_GRACE_MINUTES} minutes. A full refund of $${amountPaid.toFixed(
              2
            )} will be issued.`
          : `A $${cancellationFee.toFixed(
              2
            )} cancellation fee applies. Your estimated refund is $${refundAmount.toFixed(
              2
            )}.`
      );

      setTimeout(() => {
        navigation.navigate("CustomerDashboard");
      }, 10000);
    } catch (err) {
      Alert.alert("Error", "Unable to cancel the job. Try again.");
    }
  }, [job, jobId, navigation]);

  // ---- loading / not-found ----
  if (loading) {
    return (
      <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  if (!job) {
    return (
      <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.centered}>
        <Text style={styles.errorText}>Job not found.</Text>
      </LinearGradient>
    );
  }

  const statusConfig = getStatusConfig(job.status);

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
              <View className="align-center" style={styles.headerBadge}>
                <Zap color="#facc15" size={16} />
                <Text style={styles.headerBadgeText}>Emergency Service</Text>
              </View>
              <Text style={styles.headerTitle}>Job Status</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>

          {/* ▶️ Resume Active Job pill (works from dashboard OR here) */}
          <View style={{ alignItems: "center", marginBottom: 12 }}>
            <TouchableOpacity
              onPress={resumeActiveJob}
              disabled={resuming}
              style={[styles.resumePill, resuming && { opacity: 0.7 }]}
            >
              {resuming ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <RefreshCw color="#60a5fa" size={16} />
                  <Text style={styles.resumePillText}>Resume Active Job</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <LinearGradient
              colors={[`${statusConfig.color}20`, `${statusConfig.color}10`]}
              style={styles.statusGradient}
            >
              <View style={styles.statusHeader}>
                <statusConfig.icon color={statusConfig.color} size={32} />
                <View style={styles.statusInfo}>
                  <Text style={styles.statusTitle}>{statusConfig.text}</Text>
                  <Text style={styles.statusSubtitle}>Job ID: {jobId?.slice(-6)}</Text>
                </View>
              </View>
              {job?.service && (
                <Text style={styles.serviceText}>
                  {job.service} • {job.address}
                </Text>
              )}
            </LinearGradient>
          </View>

          {/* “Service Pro Located” banner (10s) */}
          {job.status === "accepted" && showEnRouteBanner && (
            <View style={styles.alertCard}>
              <LinearGradient
                colors={["rgba(34, 197, 94, 0.2)", "rgba(16, 185, 129, 0.1)"]}
                style={styles.alertGradient}
              >
                <View style={styles.alertHeader}>
                  <CheckCircle color="#22c55e" size={24} />
                  <Text style={styles.alertTitle}>Service Pro Located!</Text>
                </View>
                <Text style={styles.alertText}>
                  Your BlinqFix professional is en route. We’ll notify you again upon arrival.
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Arrival banner (10s) */}
          {showArrivalBanner && (
            <View style={styles.alertCard}>
              <LinearGradient
                colors={["rgba(96, 165, 250, 0.25)", "rgba(59, 130, 246, 0.12)"]}
                style={styles.alertGradient}
              >
                <View style={styles.alertHeader}>
                  <MapPin color="#60a5fa" size={24} />
                  <Text style={styles.alertTitle}>Your Pro Has Arrived</Text>
                </View>
                <Text style={styles.alertText}>
                  Your BlinqFix professional is at your location.
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Provider Info */}
          {providerInfo && (
            <View style={styles.providerCard}>
              <Text style={styles.cardTitle}>Your Service Pro</Text>
              <View style={styles.providerInfo}>
                {providerInfo.profilePictureUrl ? (
                  <Image
                    source={{ uri: convertToBase64Uri(providerInfo.profilePictureUrl) }}
                    style={styles.providerImage}
                  />
                ) : (
                  <View style={styles.providerImagePlaceholder}>
                    <User color="#94a3b8" size={40} />
                  </View>
                )}
                <View style={styles.providerDetails}>
                  <Text style={styles.providerName}>{providerInfo.name}</Text>
                  <Text style={styles.providerBusiness}>{providerInfo.businessName}</Text>
                  {providerInfo.aboutMe && (
                    <Text style={styles.providerAbout}>{providerInfo.aboutMe}</Text>
                  )}
                  <View style={styles.ratingContainer}>
                    <StarRating rating={providerInfo.averageRating} size={18} />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Map */}
          {jobLocation?.latitude && jobLocation?.longitude && (
            <View style={styles.mapCard}>
              <Text style={styles.cardTitle}>Location & Tracking</Text>
              <View style={styles.mapContainer}>
                <MapView
                  key={`map-${jobId}-${jobLocation.latitude}-${jobLocation.longitude}`}
                  provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                  style={styles.map}
                  initialRegion={{
                    latitude: jobLocation.latitude,
                    longitude: jobLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker coordinate={jobLocation} title="Service Location" />
                  {providerCoords && (
                    <Marker
                      coordinate={providerCoords}
                      title="Service Professional"
                      pinColor="blue"
                      description="Professional's current location"
                    />
                  )}
                  {routeCoords.length === 2 && (
                    <Polyline
                      coordinates={routeCoords}
                      strokeColor="#60a5fa"
                      strokeWidth={4}
                      lineCap="round"
                    />
                  )}
                </MapView>
              </View>
            </View>
          )}

          {/* Completion Confirmation */}
          {job.providerCompleted && !job.customerCompleted && (
            <View style={styles.completionCard}>
              <Text style={styles.completionTitle}>Confirm Job Completion</Text>
              <Text style={styles.completionText}>
                The professional has marked this job as complete. Please review and confirm:
              </Text>

              {job.arrivalImage && (
                <Image
                  source={{ uri: convertToBase64Uri(job.arrivalImage) }}
                  style={styles.completionImage}
                />
              )}
              {job.completionImage && (
                <Image
                  source={{ uri: convertToBase64Uri(job.completionImage) }}
                  style={styles.completionImage}
                />
              )}

              <View style={styles.completionButtons}>
                <TouchableOpacity
                  style={[styles.confirmButton, confirming && styles.confirmButtonDisabled]}
                  onPress={handleCustomerComplete}
                  disabled={confirming}
                >
                  <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.buttonGradient}>
                    <CheckCircle color="#fff" size={20} />
                    <Text style={styles.confirmButtonText}>
                      {confirming ? "Confirming..." : "Confirm Complete"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => {
                    if (!notCompletePressedRef.current) {
                      notCompletePressedRef.current = true;
                      handleNotComplete();
                    }
                  }}
                >
                  <X color="#f87171" size={20} />
                  <Text style={styles.rejectButtonText}>Not Complete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Cancel Button + policy note */}
          {job?.status === "accepted" && (
            <>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelJob}>
                <X color="#f87171" size={20} />
                <Text style={styles.cancelButtonText}>Cancel Job</Text>
              </TouchableOpacity>
              <Text style={styles.policyNote}>
                Cancel within {CANCELLATION_GRACE_MINUTES} minutes of acceptance for a full refund.
                After that, a ${CANCELLATION_FEE_USD.toFixed(2)} cancellation fee applies and the
                remainder will be refunded.
              </Text>
            </>
          )}

          {/* Trust Indicators (centered vertical) */}
          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <Shield color="#22c55e" size={16} />
              <Text style={styles.trustText}>Licensed & Insured</Text>
            </View>
            <View style={styles.trustItem}>
              <Clock color="#60a5fa" size={16} />
              <Text style={styles.trustText}>Real-time Updates</Text>
            </View>
            <View style={styles.trustItem}>
              <CheckCircle color="#c084fc" size={16} />
              <Text style={styles.trustText}>Quality Guaranteed</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#fff", fontSize: 18, textAlign: "center" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 99,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: { alignItems: "center", flex: 1 },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  headerBadgeText: { color: "#fff", marginLeft: 6, fontSize: 12, fontWeight: "500" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },

  // Resume pill
  resumePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(96,165,250,0.12)",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.35)",
  },
  resumePillText: { color: "#e0e7ff", fontSize: 14, fontWeight: "600" },

  statusCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
  statusGradient: { padding: 20 },
  statusHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  statusInfo: { marginLeft: 16, flex: 1 },
  statusTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  statusSubtitle: { fontSize: 14, color: "#e0e7ff", marginTop: 2 },
  serviceText: { fontSize: 16, color: "#e0e7ff" },

  alertCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
  alertGradient: { padding: 20 },
  alertHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  alertTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginLeft: 12 },
  alertText: { fontSize: 16, color: "#e0e7ff", lineHeight: 24 },

  providerCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 16 },
  providerInfo: { flexDirection: "row", alignItems: "center" },
  providerImage: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
  providerImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  providerDetails: { flex: 1 },
  providerName: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  providerBusiness: { fontSize: 16, color: "#e0e7ff", marginBottom: 8 },
  providerAbout: { fontSize: 14, color: "#94a3b8", marginBottom: 8 },
  ratingContainer: { alignItems: "flex-start" },

  mapCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  mapContainer: { height: 250, borderRadius: 12 },
  map: { flex: 1 },

  completionCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  completionTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 12, textAlign: "center" },
  completionText: { fontSize: 16, color: "#e0e7ff", textAlign: "center", marginBottom: 20, lineHeight: 24 },
  completionImage: { width: "100%", height: 200, borderRadius: 12, marginBottom: 16 },
  completionButtons: { gap: 12 },
  confirmButton: { borderRadius: 16, overflow: "hidden" },
  confirmButtonDisabled: { opacity: 0.6 },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  rejectButton: {
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(248, 113, 113, 0.3)",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  rejectButtonText: { color: "#f87171", fontSize: 16, fontWeight: "bold" },

  cancelButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  cancelButtonText: { color: "#f87171", fontSize: 16, fontWeight: "bold" },
  policyNote: {
    color: "#e0e7ff",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.8,
  },

  // ✅ centered vertical trust section
  trustSection: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  trustText: { color: "#e0e7ff", fontSize: 12, fontWeight: "500" },
});
