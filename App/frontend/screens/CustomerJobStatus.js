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


import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Linking,
  StyleSheet,
  Platform,
  TextInput,
  Modal,
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import io from "socket.io-client";
import api from "../api/client";
import { getCoveredDescription } from "../utils/serviceMatrix";
import { saveSession, clearSession } from "../utils/sessionManager";
import StarRating from "../components/StarRating";
import { Buffer } from "buffer";
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  X, 
  AlertTriangle, 
  User, 
  Phone,
  ArrowLeft,
  Zap,
  Shield
} from "lucide-react-native";

const { width } = Dimensions.get("window");

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
    case 'pending':
    case 'invited':
      return { color: '#facc15', icon: Clock, text: 'Finding Professional' };
    case 'accepted':
      return { color: '#60a5fa', icon: MapPin, text: 'Professional En Route' };
    case 'completed':
      return { color: '#22c55e', icon: CheckCircle, text: 'Job Completed' };
    default:
      return { color: '#94a3b8', icon: Clock, text: status };
  }
};

export default function CustomerJobStatus() {
  const route = useRoute();
  const { jobId: routeJobId } = route?.params || {};
  const navigation = useNavigation();

  const [jobId, setJobId] = useState(routeJobId);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [providerInfo, setProviderInfo] = useState(null);
  const [providerCoords, setProviderCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [jobLocation, setJobLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [notCompletePressed, setNotCompletePressed] = useState(false);
  const [showNotCompleteModal, setShowNotCompleteModal] = useState(false);
  const hasSeenNotCompleteRef = useRef(false);
  const [disputeMessage, setDisputeMessage] = useState("");
  const [notifiedComplete, setNotifiedComplete] = useState(false);
  const mapRef = useRef(null);
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    if (!routeJobId) {
      Alert.alert(
        "Navigation Error",
        "Missing job ID. Returning to dashboard.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("CustomerDashboard"),
          },
        ]
      );
    }
  }, [routeJobId]);

  const handleNotComplete = async () => {
    try {
      console.log("[NotComplete] marking status accepted");
      await api.put(`/jobs/${jobId}/status`, {
        status: "accepted",
        providerCompleted: false,
      });
      console.log("[NotComplete] notifying service pro");
      await api.post(`/jobs/${jobId}/notify-not-complete`);
      Alert.alert(
        "Noted",
        "The service pro has been notified. Please await their update."
      );
      setJob((prev) => ({ ...prev, providerCompleted: false }));
    } catch (err) {
      console.error("[NotComplete Error]:", err);
      Alert.alert("Error", "Failed to update status");
    }
  };

  useEffect(() => {
    if (job && job.status !== "completed") {
      saveSession({ role: "customer", jobId: job._id });
    }
  }, [job]);

  useEffect(() => {
    if (!jobId) return;
    const socket = io(api.defaults.baseURL?.replace("/api", ""), {
      transports: ["websocket"],
    });
    socket.emit("join", jobId);
    socket.on("jobUpdated", (updatedJob) => {
      if (updatedJob._id === jobId) setJob(updatedJob);
    });
    return () => socket.disconnect();
  }, [jobId]);

  useEffect(() => {
    let alive = true;
    const fetchJob = async () => {
      try {
        console.log("📦 Fetching job", jobId);
        const { data } = await api.get(`/jobs/${jobId}`);
        if (!alive) return;
        console.log("✅ Job data loaded", data.status);
        setJob(data);

        if (
          data.customerMarkedIncomplete &&
          !hasSeenNotCompleteRef.current &&
          data.status !== "completed"
        ) {
          setShowNotCompleteModal(true);
          hasSeenNotCompleteRef.current = true;
        }

        if (!jobId) setJobId(data._id);

        if (
          data.customerCompleted &&
          data.providerCompleted &&
          !notifiedComplete
        ) {
          setNotifiedComplete(true);
          await clearSession();
          navigation.replace("RateProvider", { jobId: data._id });
          await clearSession();
          return;
        }

        if (data.status === "awaiting-additional-payment") {
          navigation.replace("PaymentScreen", { jobId });
          return;
        }

        if (data.acceptedProvider) {
          const res = await api.get(`/users/${data.acceptedProvider}`);
          const provider = res.data;
          setProviderInfo({
            name: provider.name,
            businessName: provider.businessName,
            aboutMe: provider.aboutMe,
            profilePictureUrl: provider.profilePicture || null,
            averageRating: provider.averageRating ?? null,
          });
        }

        const jobLoc = data.location?.coordinates;
        if (jobLoc) {
          const [lng, lat] = jobLoc;
          setJobLocation({ latitude: lat, longitude: lng });
        }
      } catch (err) {
        if (alive) {
          console.error("[FetchJob Error]:", err);
          Alert.alert("Error", "Unable to load job status.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
      const iv = setInterval(fetchJob, 25000);
      return () => {
        alive = false;
        clearInterval(iv);
      };
    }
  }, [jobId, navigation, notifiedComplete]);

  const handleCustomerComplete = async () => {
    setConfirming(true);
    try {
      const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
      console.log("[CustomerComplete] response:", data?._id);
      setJob(data);
    } catch (err) {
      console.error("[CustomerComplete Error]:", err);
      Alert.alert("Error", "Could not confirm completion");
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelJob = async () => {
    try {
      const confirmed = await new Promise((resolve) =>
        Alert.alert(
          "Cancel Job",
          "Are you sure you want to cancel this job?",
          [
            { text: "No", onPress: () => resolve(false), style: "cancel" },
            { text: "Yes, Cancel", onPress: () => resolve(true) },
          ],
          { cancelable: true }
        )
      );
      await clearSession();
      if (!confirmed) return;

      const acceptedAt = job.acceptedAt ? new Date(job.acceptedAt) : null;
      const now = new Date();
      let refundEligible = true;

      if (acceptedAt && !isNaN(acceptedAt.getTime())) {
        const diffMinutes = Math.floor((now - acceptedAt) / 60000);
        refundEligible = diffMinutes < 5;
      }

      const { data } = await api.put(`/jobs/${jobId}/cancelled`, {
        cancelledBy: "customer",
        refundEligible,
      });

      Alert.alert(
        "Job Cancelled",
        refundEligible
          ? "Your job was cancelled within 5 minutes. You are eligible for a full refund."
          : "Your job was cancelled after 5 minutes. A $120 travel fee will be deducted."
      );

      setTimeout(() => {
        navigation.navigate("CustomerDashboard");
      }, 10000);
    } catch (err) {
      console.error("[CancelJob Error]:", err);
      Alert.alert("Error", "Unable to cancel the job. Try again.");
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  if (!job) {
    return (
      <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.centered}>
        <Text style={styles.errorText}>Job not found.</Text>
      </LinearGradient>
    );
  }

  const statusConfig = getStatusConfig(job.status);

  return (
    <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
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
                <Text style={styles.headerBadgeText}>Emergency Service</Text>
              </View>
              <Text style={styles.headerTitle}>Job Status</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <LinearGradient
              colors={[
                `${statusConfig.color}20`,
                `${statusConfig.color}10`
              ]}
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
                <Text style={styles.serviceText}>{job.service} • {job.address}</Text>
              )}
            </LinearGradient>
          </View>

          {/* Waiting for Professional */}
          {(job.status === "pending" || job.status === "invited") && (
            <View style={styles.waitingCard}>
              <View style={styles.pulseContainer}>
                <View style={styles.pulseDot} />
              </View>
              <Text style={styles.waitingTitle}>Finding Your Professional</Text>
              <Text style={styles.waitingText}>
                We're locating the nearest emergency BlinqFix Pro. This typically takes less than 3 minutes.
              </Text>
            </View>
          )}

          {/* Professional En Route Alert */}
          {job?.status === "accepted" && showNotification && (
            <View style={styles.alertCard}>
              <LinearGradient
                colors={['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.1)']}
                style={styles.alertGradient}
              >
                <View style={styles.alertHeader}>
                  <CheckCircle color="#22c55e" size={24} />
                  <Text style={styles.alertTitle}>Professional Located!</Text>
                </View>
                <Text style={styles.alertText}>
                  Your BlinqFix professional is en route. Please make necessary preparations. 
                  This screen will update automatically when the job is completed.
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Provider Info Card */}
          {providerInfo && (
            <View style={styles.providerCard}>
              <Text style={styles.cardTitle}>Your Service Professional</Text>
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
                  ref={mapRef}
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
                  <LinearGradient
                    colors={['#22c55e', '#16a34a']}
                    style={styles.buttonGradient}
                  >
                    <CheckCircle color="#fff" size={20} />
                    <Text style={styles.confirmButtonText}>
                      {confirming ? "Confirming..." : "Confirm Complete"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => {
                    if (!notCompletePressed) {
                      setNotCompletePressed(true);
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

          {/* Cancel Button */}
          {job?.status === "accepted" && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelJob}>
              <X color="#f87171" size={20} />
              <Text style={styles.cancelButtonText}>Cancel Job</Text>
            </TouchableOpacity>
          )}

          {/* Trust Indicators */}
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 99,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8
  },
  headerBadgeText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  statusCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden'
  },
  statusGradient: {
    padding: 20
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  statusInfo: {
    marginLeft: 16,
    flex: 1
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 2
  },
  serviceText: {
    fontSize: 16,
    color: '#e0e7ff'
  },
  waitingCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  pulseContainer: {
    marginBottom: 16
  },
  pulseDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#facc15'
  },
  waitingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  waitingText: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 24
  },
  alertCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden'
  },
  alertGradient: {
    padding: 20
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12
  },
  alertText: {
    fontSize: 16,
    color: '#e0e7ff',
    lineHeight: 24
  },
  providerCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  providerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16
  },
  providerImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  providerDetails: {
    flex: 1
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4
  },
  providerBusiness: {
    fontSize: 16,
    color: '#e0e7ff',
    marginBottom: 8
  },
  providerAbout: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8
  },
  ratingContainer: {
    alignItems: 'flex-start'
  },
  mapCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden'
  },
  map: {
    flex: 1
  },
  completionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center'
  },
  completionText: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24
  },
  completionImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16
  },
  completionButtons: {
    gap: 12
  },
  confirmButton: {
    borderRadius: 16,
    overflow: 'hidden'
  },
  confirmButtonDisabled: {
    opacity: 0.6
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  rejectButton: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  rejectButtonText: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: 'bold'
  },
  cancelButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32
  },
  cancelButtonText: {
    color: '#f87171',
    fontSize: 16,
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