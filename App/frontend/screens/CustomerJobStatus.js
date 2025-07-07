// import React, { useEffect, useState } from "react";
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
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import io from "socket.io-client";
// import api from "../api/client";
// import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
// import BackButton from "../components/BackButton";
// import { saveSession } from "../utils/sessionManager";
// import StarRating from "../components/StarRating";
// import ProviderMap from "../components/ProviderMap";

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// export default function CustomerJobStatus() {
//   const { jobId } = useRoute().params;
//   const navigation = useNavigation();

//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [confirming, setConfirming] = useState(false);
//   const [providerInfo, setProviderInfo] = useState(null);
//   const details = job?.details ?? {};
//   const description = details.issue
//     ? getCoveredDescription(details.issue)
//     : null;

//   useEffect(() => {
//     if (job && job.status !== "completed") {
//       saveSession({ role: "customer", jobId: job._id });
//     }
//   }, [job]);

//   useEffect(() => {
//     const socket = io(api.defaults.baseURL?.replace(/\/api$/, "") || "", {
//       transports: ["websocket"],
//     });
//     socket.emit("join", jobId);

//     socket.on("jobAccepted", ({ jobId: acceptedId }) => {
//       if (acceptedId === jobId) {
//         navigation.replace("CustomerJobStatus", { jobId });
//       }
//     });

//     socket.on("jobUpdated", (updatedJob) => {
//       if (updatedJob._id === jobId) setJob(updatedJob);
//     });

//     return () => socket.disconnect();
//   }, [jobId, navigation]);

//   useEffect(() => {
//     let alive = true;

//     const fetchJob = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
//         if (!alive) return;
//         setJob(data);

//         if (data.acceptedProvider && data.status === "accepted") {
//           try {
//             const res = await api.get(`/users/${data.acceptedProvider}`);
//             const provider = res.data;
//             // console.log("Provider data:", provider);
//             setProviderInfo({
//               name: provider.name,
//               businessName: provider.businessName,
//               aboutMe: provider.aboutMe,
//               profilePictureUrl: provider.profilePicture || null,
//               averageRating: provider.averageRating ?? null,
//             });
//           } catch (err) {
//             console.warn("Could not load provider info", err);
//           }
//         }

//         if (data.status === "awaiting-additional-payment") {
//           navigation.replace("PaymentScreen", { jobId });
//         }
//       } catch (err) {
//         if (alive) Alert.alert("Error", "Unable to load job status.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     };

//     fetchJob();
//     const iv = setInterval(fetchJob, 25000);
//     return () => {
//       alive = false;
//       clearInterval(iv);
//     };
//   }, [jobId, navigation]);

//   useEffect(() => {
//     if (job?.status === "completed") {
//       Alert.alert("Job Complete", "Thank you! Please rate your provider.", [
//         {
//           text: "OK",
//           onPress: () => navigation.replace("RateProvider", { jobId }),
//         },
//       ]);
//     }
//   }, [job?.status, navigation]);

//   const handleCustomerComplete = async () => {
//     setConfirming(true);
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
//       setJob(data);
//     } catch {
//       Alert.alert("Error", "Could not confirm completion");
//     } finally {
//       setConfirming(false);
//     }
//   };

//   if (loading) return <ActivityIndicator style={styles.center} size="large" />;
//   if (!job) return <Text style={styles.center}>Job not found.</Text>;

//   const subtotal =
//     (job.baseAmount || 0) +
//     (job.adjustmentAmount || 0) +
//     (job.rushFee || 0) +
//     (job.additionalCharge || 0);
//   const convFee =
//     job.convenienceFee ??
//     Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//   const totalDue = job.estimatedTotal ?? subtotal + convFee;

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* <BackButton /> */}
//       <View style={styles.containerLogo}>
//         <Image
//           source={require("../assets/blinqfix_logo-new.jpeg")}
//           style={{
//             width: LOGO_SIZE,
//             height: LOGO_SIZE,
//             justifyContent: "center",
//             alignItems: "center",
//             marginInline: "auto",
//           }}
//           resizeMode="contain"
//         />
//       </View>
//       <Text>{"\n"}</Text>
//       <Text style={styles.title}>Job Status</Text>
//       <Text style={{ marginBottom: 16 }}>Status: {job.status}</Text>

//       {providerInfo && job.status === "accepted" && (
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Your Service Pro</Text>
//           {providerInfo.profilePictureUrl && (
//             <Image
//               source={{ uri: providerInfo.profilePictureUrl }}
//               style={{
//                 width: 160,
//                 height: 160,
//                 borderRadius: 100,
//                 alignSelf: "center",
//               }}
//             />
//           )}
//           <Text style={{ fontWeight: "bold", fontSize: 16 }}>
//             {providerInfo.name}
//           </Text>
//           <Text>{providerInfo.businessName}</Text>
//           <Text>{providerInfo.aboutMe}</Text>
//           <View style={{ alignItems: "center", marginVertical: 8 }}>
//             <StarRating rating={providerInfo.averageRating} size={22} />
//           </View>
//         </View>
//       )}

//       {job.status === "accepted" && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>
//             Your emergency service pro is now in route
//           </Text>
//           <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
//             Make the necessary preparations. Put away pets, ensure gate access,
//             and prepare for all necessary access if needed.
//           </Text>
//           {description && (
//             <>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </>
//           )}

//           {/* <ProviderMap customerCoords={{ latitude: 25.7617, longitude: -80.1918 }} /> */}
//           {/* <ProviderMap /> */}
//           {/* <ProviderMap customerAddress={job.address} /> */}
//         </View>
//       )}

//       {(job.status === "pending" || job.status === "invited") && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>Please Wait…</Text>
//           <Text>
//             Your BlinqFix emergency request has been sent to a local
//             professional.
//           </Text>
//           {description && (
//             <>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </>
//           )}
//         </View>
//       )}

//       {job.paymentStatus === "awaiting-additional-payment" && (
//         <View style={styles.pending}>
//           <Text style={styles.pendingText}>
//             Additional charge of ${job.additionalCharge.toFixed(2)} pending…
//           </Text>
//           <Text>Convenience fee: ${convFee.toFixed(2)}</Text>
//           <Text>Total due: ${totalDue.toFixed(2)}</Text>
//         </View>
//       )}

//       {job.providerCompleted && !job.customerCompleted && (
//         <View style={styles.confirm}>
//           <Text style={styles.heading}>Confirm Job Complete</Text>
//           <Text style={styles.confirmText}>
//             The provider marked this job complete. Please confirm below:
//           </Text>
//           <TouchableOpacity
//             style={[
//               styles.confirmButton,
//               confirming && styles.confirmButtonDisabled,
//             ]}
//             onPress={handleCustomerComplete}
//             disabled={confirming}
//           >
//             <Text style={styles.confirmButtonText}>
//               {confirming ? "Confirming…" : "Confirm Job Complete"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//       {/* <ProviderMap customerAddress={job.address} /> */}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 24,
//     backgroundColor: "#fff",
//     marginTop: 0,
//   },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   pending: {
//     padding: 12,
//     backgroundColor: "#fff3e0",
//     borderRadius: 6,
//     marginBottom: 16,
//   },
//   pendingText: { color: "orange", fontWeight: "600", marginBottom: 4 },
//   waiting: {
//     padding: 12,
//     backgroundColor: "#e3f2fd",
//     borderRadius: 6,
//     marginVertical: 16,
//   },
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
//   confirmText: {
//     marginBottom: 10,
//     fontSize: 15,
//   },
//   confirmButton: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 12,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   confirmButtonDisabled: {
//     backgroundColor: "#999",
//   },
//   confirmButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginTop: 20,
//     marginBottom: 4,
//     textAlign: "center",
//   },
//   descriptionText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//     textAlign: "center",
//   },
//   card: {
//     backgroundColor: "#f0f0f0",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     alignItems: "center",
//   },
// });

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
//   StyleSheet,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import MapView, { Marker, AnimatedRegion } from "react-native-maps";
// import io from "socket.io-client";
// import api from "../api/client";
// import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
// import { saveSession } from "../utils/sessionManager";
// import StarRating from "../components/StarRating";

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// export default function CustomerJobStatus() {
//   const { jobId } = useRoute().params;
//   const navigation = useNavigation();

//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [confirming, setConfirming] = useState(false);
//   const [providerInfo, setProviderInfo] = useState(null);
//   const [providerCoords, setProviderCoords] = useState(null);
//   const [eta, setEta] = useState(null);
//   const animatedRegion = useRef(null);
//   const details = job?.details ?? {};
//   const description = details.issue ? getCoveredDescription(details.issue) : null;

//   useEffect(() => {
//     if (job && job.status !== "completed") {
//       saveSession({ role: "customer", jobId: job._id });
//     }
//   }, [job]);

//   useEffect(() => {
//     const socket = io(api.defaults.baseURL?.replace(/\/api$/, "") || "", {
//       transports: ["websocket"],
//     });
//     socket.emit("join", jobId);

//     socket.on("jobAccepted", ({ jobId: acceptedId }) => {
//       if (acceptedId === jobId) {
//         navigation.replace("CustomerJobStatus", { jobId });
//       }
//     });

//     socket.on("jobUpdated", (updatedJob) => {
//       if (updatedJob._id === jobId) setJob(updatedJob);
//     });

//     socket.on("locationUpdate", ({ provider }) => {
//       const coords = { latitude: provider.lat, longitude: provider.lng };
//       if (animatedRegion.current) {
//         animatedRegion.current.timing({
//           latitude: coords.latitude,
//           longitude: coords.longitude,
//           duration: 1000,
//           useNativeDriver: false,
//         }).start();
//       }
//       setProviderCoords(coords);

//       if (job?.location?.coordinates) {
//         const toRad = (value) => (value * Math.PI) / 180;
//         const lat1 = coords.latitude;
//         const lon1 = coords.longitude;
//         const lat2 = job.location.coordinates[1];
//         const lon2 = job.location.coordinates[0];
//         const R = 6371;
//         const dLat = toRad(lat2 - lat1);
//         const dLon = toRad(lon2 - lon1);
//         const a = Math.sin(dLat / 2) ** 2 +
//                   Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
//                   Math.sin(dLon / 2) ** 2;
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         const distance = R * c;
//         const etaMin = Math.round((distance / 0.6) * 60);
//         setEta(etaMin);

//         if (distance < 0.15) {
//           Alert.alert("Heads Up!", "Your service provider is almost there.");
//         }
//       }
//     });

//     return () => socket.disconnect();
//   }, [jobId, navigation, job]);

//   useEffect(() => {
//     let alive = true;
//     const fetchJob = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
//         if (!alive) return;
//         setJob(data);

//         if (data.acceptedProvider && data.status === "accepted") {
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

//         if (data.status === "awaiting-additional-payment") {
//           navigation.replace("PaymentScreen", { jobId });
//         }
//       } catch (err) {
//         if (alive) Alert.alert("Error", "Unable to load job status.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     };
//     fetchJob();
//     const iv = setInterval(fetchJob, 25000);
//     return () => {
//       alive = false;
//       clearInterval(iv);
//     };
//   }, [jobId, navigation]);

//   useEffect(() => {
//     if (job?.status === "completed") {
//       Alert.alert("Job Complete", "Thank you! Please rate your provider.", [
//         { text: "OK", onPress: () => navigation.replace("RateProvider", { jobId }) },
//       ]);
//     }
//   }, [job?.status, navigation]);

//   const handleCustomerComplete = async () => {
//     setConfirming(true);
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
//       setJob(data);
//     } catch {
//       Alert.alert("Error", "Could not confirm completion");
//     } finally {
//       setConfirming(false);
//     }
//   };

//   if (loading) return <ActivityIndicator style={styles.center} size="large" />;
//   if (!job) return <Text style={styles.center}>Job not found.</Text>;

//   const subtotal = (job.baseAmount || 0) + (job.adjustmentAmount || 0) + (job.rushFee || 0) + (job.additionalCharge || 0);
//   const convFee = job.convenienceFee ?? Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//   const totalDue = job.estimatedTotal ?? subtotal + convFee;

//   const jobLocation = {
//     latitude: job.location?.coordinates?.[1] || 0,
//     longitude: job.location?.coordinates?.[0] || 0,
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.containerLogo}>
//         <Image
//           source={require("../assets/blinqfix_logo-new.jpeg")}
//           style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
//           resizeMode="contain"
//         />
//       </View>
//       <Text>{"\n"}</Text>
//       <Text style={styles.title}>Job Status</Text>
//       <Text style={{ marginBottom: 16 }}>Status: {job.status}</Text>

//       {providerInfo && job.status === "accepted" && (
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Your Service Pro</Text>
//           {providerInfo.profilePictureUrl && (
//             <Image
//               source={{ uri: providerInfo.profilePictureUrl }}
//               style={{ width: 160, height: 160, borderRadius: 100, alignSelf: "center" }}
//             />
//           )}
//           <Text style={{ fontWeight: "bold", fontSize: 16 }}>{providerInfo.name}</Text>
//           <Text>{providerInfo.businessName}</Text>
//           <Text>{providerInfo.aboutMe}</Text>
//           <View style={{ alignItems: "center", marginVertical: 8 }}>
//             <StarRating rating={providerInfo.averageRating} size={22} />
//           </View>
//         </View>
//       )}

//       {job.status === "accepted" && providerCoords && (
//         <MapView
//           style={{ height: 220, marginVertical: 12, borderRadius: 10 }}
//           region={{
//             latitude: providerCoords.latitude,
//             longitude: providerCoords.longitude,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//         >
//           <Marker coordinate={jobLocation} title="Your Location" />
//           <Marker
//             coordinate={providerCoords}
//             title="Service Pro"
//             pinColor="blue"
//           />
//         </MapView>
//       )}

//       {eta && job.status === "accepted" && (
//         <Text style={{ textAlign: "center", marginBottom: 10 }}>
//           Estimated Arrival: {eta} min
//         </Text>
//       )}

//       {(job.status === "pending" || job.status === "invited") && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>Please Wait…</Text>
//           <Text>Your BlinqFix emergency request has been sent to a local professional.</Text>
//           {description && (
//             <>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </>
//           )}
//         </View>
//       )}

//       {job.paymentStatus === "awaiting-additional-payment" && (
//         <View style={styles.pending}>
//           <Text style={styles.pendingText}>
//             Additional charge of ${job.additionalCharge.toFixed(2)} pending…
//           </Text>
//           <Text>Convenience fee: ${convFee.toFixed(2)}</Text>
//           <Text>Total due: ${totalDue.toFixed(2)}</Text>
//         </View>
//       )}

//       {job.providerCompleted && !job.customerCompleted && (
//         <View style={styles.confirm}>
//           <Text style={styles.heading}>Confirm Job Complete</Text>
//           <Text style={styles.confirmText}>
//             The provider marked this job complete. Please confirm below:
//           </Text>
//           <TouchableOpacity
//             style={[styles.confirmButton, confirming && styles.confirmButtonDisabled]}
//             onPress={handleCustomerComplete}
//             disabled={confirming}
//           >
//             <Text style={styles.confirmButtonText}>
//               {confirming ? "Confirming…" : "Confirm Job Complete"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 24,
//     backgroundColor: "#fff",
//     marginTop: 0,
//   },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   pending: {
//     padding: 12,
//     backgroundColor: "#fff3e0",
//     borderRadius: 6,
//     marginBottom: 16,
//   },
//   pendingText: { color: "orange", fontWeight: "600", marginBottom: 4 },
//   waiting: {
//     padding: 12,
//     backgroundColor: "#e3f2fd",
//     borderRadius: 6,
//     marginVertical: 16,
//   },
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
//   confirmText: {
//     marginBottom: 10,
//     fontSize: 15,
//   },
//   confirmButton: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 12,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   confirmButtonDisabled: {
//     backgroundColor: "#999",
//   },
//   confirmButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginTop: 20,
//     marginBottom: 4,
//     textAlign: "center",
//   },
//   descriptionText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//     textAlign: "center",
//   },
//   card: {
//     backgroundColor: "#f0f0f0",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     alignItems: "center",
//   },
// });

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
//   StyleSheet,
//   Platform,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import MapView, { Marker, AnimatedRegion, PROVIDER_GOOGLE } from "react-native-maps";
// import io from "socket.io-client";
// import api from "../api/client";
// import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
// import { saveSession } from "../utils/sessionManager";
// import StarRating from "../components/StarRating";

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// export default function CustomerJobStatus() {
//   const { jobId } = useRoute().params;
//   const navigation = useNavigation();

//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [confirming, setConfirming] = useState(false);
//   const [providerInfo, setProviderInfo] = useState(null);
//   const [providerCoords, setProviderCoords] = useState(null);
//   const [eta, setEta] = useState(null);
//   const [animatedRegion, setAnimatedRegion] = useState(null);

//   const details = job?.details ?? {};
//   const description = details.issue
//     ? getCoveredDescription(details.issue)
//     : null;

//   useEffect(() => {
//     if (job && job.status !== "completed") {
//       saveSession({ role: "customer", jobId: job._id });
//     }
//   }, [job]);

//   useEffect(() => {
//     const socket = io(api.defaults.baseURL?.replace("/api", ""), {
//       transports: ["websocket"],
//     });

//     socket.emit("join", jobId);

//     socket.on("jobAccepted", ({ jobId: acceptedId }) => {
//       if (acceptedId === jobId) {
//         navigation.replace("CustomerJobStatus", { jobId });
//       }
//     });

//     socket.on("jobUpdated", (updatedJob) => {
//       if (updatedJob._id === jobId) setJob(updatedJob);
//     });

//     socket.on("locationUpdate", ({ provider }) => {
//       const coords = { latitude: provider.lat, longitude: provider.lng };
//       setProviderCoords(coords);

//       if (animatedRegion) {
//         animatedRegion
//           .timing({
//             latitude: coords.latitude,
//             longitude: coords.longitude,
//             duration: 1000,
//             useNativeDriver: false,
//           })
//           .start();
//       }

//       if (job?.location?.coordinates) {
//         const toRad = (val) => (val * Math.PI) / 180;
//         const lat1 = coords.latitude;
//         const lon1 = coords.longitude;
//         const lat2 = job.location.coordinates[1];
//         const lon2 = job.location.coordinates[0];
//         const R = 6371;
//         const dLat = toRad(lat2 - lat1);
//         const dLon = toRad(lon2 - lon1);
//         const a =
//           Math.sin(dLat / 2) ** 2 +
//           Math.cos(toRad(lat1)) *
//             Math.cos(toRad(lat2)) *
//             Math.sin(dLon / 2) ** 2;
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         const distance = R * c;
//         const etaMin = Math.round((distance / 0.6) * 60);
//         setEta(etaMin);

//         if (distance < 0.15) {
//           Alert.alert("Heads Up!", "Your service provider is almost there.");
//         }
//       }
//     });

//     return () => socket.disconnect();
//   }, [jobId, navigation, job, animatedRegion]);

//   useEffect(() => {
//     let alive = true;
//     const fetchJob = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (!alive) return;
//         setJob(data);

//         if (data.acceptedProvider && data.status === "accepted") {
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
//         if (jobLoc && !animatedRegion) {
//           const [lng, lat] = jobLoc;
//           setAnimatedRegion(
//             new AnimatedRegion({
//               latitude: lat,
//               longitude: lng,
//               latitudeDelta: 0.01,
//               longitudeDelta: 0.01,
//             })
//           );
//         }

//         if (data.status === "awaiting-additional-payment") {
//           navigation.replace("PaymentScreen", { jobId });
//         }
//       } catch (err) {
//         if (alive) Alert.alert("Error", "Unable to load job status.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     };
//     fetchJob();
//     const iv = setInterval(fetchJob, 25000);
//     return () => {
//       alive = false;
//       clearInterval(iv);
//     };
//   }, [jobId, navigation]);

//   const handleCustomerComplete = async () => {
//     setConfirming(true);
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
//       setJob(data);
//     } catch {
//       Alert.alert("Error", "Could not confirm completion");
//     } finally {
//       setConfirming(false);
//     }
//   };

//   if (loading) return <ActivityIndicator style={styles.center} size="large" />;
//   if (!job) return <Text style={styles.center}>Job not found.</Text>;

//   const subtotal =
//     (job.baseAmount || 0) +
//     (job.adjustmentAmount || 0) +
//     (job.rushFee || 0) +
//     (job.additionalCharge || 0);
//   const convFee =
//     job.convenienceFee ??
//     Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//   const totalDue = job.estimatedTotal ?? subtotal + convFee;

//   const jobLocation = {
//     latitude: job.location?.coordinates?.[1] || 0,
//     longitude: job.location?.coordinates?.[0] || 0,
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.containerLogo}>
//         <Image
//           source={require("../assets/blinqfix_logo-new.jpeg")}
//           style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
//           resizeMode="contain"
//         />
//       </View>
//       <Text style={styles.title}>Job Status</Text>
//       <Text style={{ marginBottom: 16 }}>Status: {job.status}</Text>
//       {providerInfo && job.status === "accepted" && (
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Your Service Pro</Text>
//           {providerInfo.profilePictureUrl && (
//             <Image
//               source={{ uri: providerInfo.profilePictureUrl }}
//               style={{ width: 160, height: 160, borderRadius: 100 }}
//             />
//           )}
//           <Text style={{ fontWeight: "bold", fontSize: 16 }}>
//             {providerInfo.name}
//           </Text>
//           <Text>{providerInfo.businessName}</Text>
//           <Text>{providerInfo.aboutMe}</Text>
//           <View style={{ alignItems: "center", marginVertical: 8 }}>
//             <StarRating rating={providerInfo.averageRating} size={22} />
//           </View>
//         </View>
//       )}

//       {/* {animatedRegion && providerCoords && (
//         <MapView
//           style={{ height: 220, borderRadius: 10, marginVertical: 12 }}
//           region={animatedRegion.__getValue()}
//         >
//           <Marker coordinate={jobLocation} title="Your Location" />
//           <Marker.Animated
//             coordinate={animatedRegion}
//             title="Service Pro"
//             pinColor="blue"
//           />
//         </MapView>
//       )} */}
//       {/* {(providerCoords?.latitude && providerCoords?.longitude) && (
//   <MapView
//     style={{ height: 220, borderRadius: 10, marginVertical: 12 }}
//     initialRegion={{
//       latitude: providerCoords.latitude,
//       longitude: providerCoords.longitude,
//       latitudeDelta: 0.01,
//       longitudeDelta: 0.01,
//     }}
//   >
//     {/* Customer Location Marker */}
//       {/* <Marker
//       coordinate={jobLocation}
//       title="Your Location"
//     />

//     {/* Service Provider Marker */}
//       {/* <Marker
//       coordinate={providerCoords}
//       title="Service Pro"
//       pinColor="blue"
//     />
//   </MapView> */}
//       {/* )} */}

//       {jobLocation.latitude && jobLocation.longitude && (
//         <MapView
//           provider={Platform.OS === "ios" ? PROVIDER_GOOGLE : undefined}
//           style={{ height: 220, borderRadius: 10, marginVertical: 12 }}
//           initialRegion={{
//             latitude: jobLocation.latitude,
//             longitude: jobLocation.longitude,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//         >
//           <Marker coordinate={jobLocation} title="Your Location" />
//           {providerCoords && (
//             <Marker
//               coordinate={providerCoords}
//               title="Service Pro"
//               pinColor="blue"
//             />
//           )}
//         </MapView>
//       )}
//       {eta && (
//         <Text style={{ textAlign: "center", marginBottom: 10 }}>
//           Estimated Arrival: {eta} min
//         </Text>
//       )}
//       {(job.status === "pending" || job.status === "invited") && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>Please Wait…</Text>
//           <Text>Your request has been sent to a local professional.</Text>
//           {description && (
//             <>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </>
//           )}
//         </View>
//       )}
//       {job.paymentStatus === "awaiting-additional-payment" && (
//         <View style={styles.pending}>
//           <Text style={styles.pendingText}>
//             Additional charge of ${job.additionalCharge.toFixed(2)} pending…
//           </Text>
//           <Text>Convenience fee: ${convFee.toFixed(2)}</Text>
//           <Text>Total due: ${totalDue.toFixed(2)}</Text>
//         </View>
//       )}
//       {job.providerCompleted && !job.customerCompleted && (
//         <View style={styles.confirm}>
//           <Text style={styles.heading}>Confirm Job Complete</Text>
//           <Text style={styles.confirmText}>
//             The provider marked this job complete. Please confirm below:
//           </Text>
//           <TouchableOpacity
//             style={[
//               styles.confirmButton,
//               confirming && styles.confirmButtonDisabled,
//             ]}
//             onPress={handleCustomerComplete}
//             disabled={confirming}
//           >
//             <Text style={styles.confirmButtonText}>
//               {confirming ? "Confirming…" : "Confirm Job Complete"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 24,
//     backgroundColor: "#fff",
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   containerLogo: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 30,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   card: {
//     backgroundColor: "#f0f0f0",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     alignItems: "center",
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginTop: 12,
//     marginBottom: 4,
//     textAlign: "center",
//   },
//   descriptionText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//     textAlign: "center",
//   },
//   pending: {
//     padding: 12,
//     backgroundColor: "#fff3e0",
//     borderRadius: 6,
//     marginBottom: 16,
//   },
//   pendingText: {
//     color: "orange",
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   waiting: {
//     padding: 12,
//     backgroundColor: "#e3f2fd",
//     borderRadius: 6,
//     marginVertical: 16,
//   },
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
//   confirmText: {
//     marginBottom: 10,
//     fontSize: 15,
//   },
//   confirmButton: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 12,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   confirmButtonDisabled: {
//     backgroundColor: "#999",
//   },
//   confirmButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });
/**
 * CustomerJobStatus.js (Updated)
 * - Adds live animated provider tracking
 * - Draws Polyline from provider to customer
 * - Includes ETA calculation + proximity alert
 */

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
//   StyleSheet,
//   Platform,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import MapView, { Marker, Polyline, AnimatedRegion, PROVIDER_GOOGLE } from "react-native-maps";
// import io from "socket.io-client";
// import api from "../api/client";
// import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
// import { saveSession } from "../utils/sessionManager";
// import StarRating from "../components/StarRating";

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// export default function CustomerJobStatus() {
//   const { jobId } = useRoute().params;
//   const navigation = useNavigation();

//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [confirming, setConfirming] = useState(false);
//   const [providerInfo, setProviderInfo] = useState(null);
//   const [providerCoords, setProviderCoords] = useState(null);
//   const [eta, setEta] = useState(null);
//   const [animatedRegion, setAnimatedRegion] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);

//   const details = job?.details ?? {};
//   const description = details.issue ? getCoveredDescription(details.issue) : null;

//   useEffect(() => {
//     if (job && job.status !== "completed") {
//       saveSession({ role: "customer", jobId: job._id });
//     }
//   }, [job]);

//   useEffect(() => {
//     const socket = io(api.defaults.baseURL?.replace("/api", ""), {
//       transports: ["websocket"],
//     });

//     socket.emit("join", jobId);

//     socket.on("jobAccepted", ({ jobId: acceptedId }) => {
//       if (acceptedId === jobId) {
//         navigation.replace("CustomerJobStatus", { jobId });
//       }
//     });

//     socket.on("jobUpdated", (updatedJob) => {
//       if (updatedJob._id === jobId) setJob(updatedJob);
//     });

//     socket.on("locationUpdate", ({ provider }) => {
//       const coords = { latitude: provider.lat, longitude: provider.lng };

//       if (animatedRegion) {
//         animatedRegion.timing({
//           latitude: coords.latitude,
//           longitude: coords.longitude,
//           duration: 1000,
//           useNativeDriver: false,
//         }).start();
//       } else {
//         setAnimatedRegion(new AnimatedRegion({
//           latitude: coords.latitude,
//           longitude: coords.longitude,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         }));
//       }

//       setProviderCoords(coords);

//       if (job?.location?.coordinates) {
//         const toRad = (val) => (val * Math.PI) / 180;
//         const lat1 = coords.latitude;
//         const lon1 = coords.longitude;
//         const lat2 = job.location.coordinates[1];
//         const lon2 = job.location.coordinates[0];
//         const R = 6371;
//         const dLat = toRad(lat2 - lat1);
//         const dLon = toRad(lon2 - lon1);
//         const a = Math.sin(dLat / 2) ** 2 +
//           Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
//           Math.sin(dLon / 2) ** 2;
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         const distance = R * c;
//         const etaMin = Math.round((distance / 0.6) * 60);
//         setEta(etaMin);

//         setRouteCoords([
//           coords,
//           { latitude: lat2, longitude: lon2 },
//         ]);

//         if (distance < 0.15) {
//           Alert.alert("Heads Up!", "Your service provider is almost there.");
//         }
//       }
//     });

//     return () => socket.disconnect();
//   }, [jobId, navigation, job, animatedRegion]);

//   useEffect(() => {
//     let alive = true;
//     const fetchJob = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (!alive) return;
//         setJob(data);

//         if (data.acceptedProvider && data.status === "accepted") {
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
//         if (jobLoc && !animatedRegion) {
//           const [lng, lat] = jobLoc;
//           setAnimatedRegion(new AnimatedRegion({
//             latitude: lat,
//             longitude: lng,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }));
//         }

//         if (data.status === "awaiting-additional-payment") {
//           navigation.replace("PaymentScreen", { jobId });
//         }
//       } catch (err) {
//         if (alive) Alert.alert("Error", "Unable to load job status.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     };
//     fetchJob();
//     const iv = setInterval(fetchJob, 25000);
//     return () => {
//       alive = false;
//       clearInterval(iv);
//     };
//   }, [jobId, navigation]);

//   const handleCustomerComplete = async () => {
//     setConfirming(true);
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
//       setJob(data);
//     } catch {
//       Alert.alert("Error", "Could not confirm completion");
//     } finally {
//       setConfirming(false);
//     }
//   };

//   if (loading) return <ActivityIndicator style={styles.center} size="large" />;
//   if (!job) return <Text style={styles.center}>Job not found.</Text>;

//   const subtotal =
//     (job.baseAmount || 0) +
//     (job.adjustmentAmount || 0) +
//     (job.rushFee || 0) +
//     (job.additionalCharge || 0);
//   const convFee =
//     job.convenienceFee ??
//     Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//   const totalDue = job.estimatedTotal ?? subtotal + convFee;

//   const jobLocation = {
//     latitude: job.location?.coordinates?.[1] || 0,
//     longitude: job.location?.coordinates?.[0] || 0,
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.containerLogo}>
//         <Image
//           source={require("../assets/blinqfix_logo-new.jpeg")}
//           style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
//           resizeMode="contain"
//         />
//       </View>
//       <Text style={styles.title}>Job Status</Text>
//       <Text style={{ marginBottom: 16 }}>Status: {job.status}</Text>

//       {providerInfo && job.status === "accepted" && (
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Your Service Pro</Text>
//           {providerInfo.profilePictureUrl && (
//             <Image
//               source={{ uri: providerInfo.profilePictureUrl }}
//               style={{ width: 160, height: 160, borderRadius: 100 }}
//             />
//           )}
//           <Text style={{ fontWeight: "bold", fontSize: 16 }}>{providerInfo.name}</Text>
//           <Text>{providerInfo.businessName}</Text>
//           <Text>{providerInfo.aboutMe}</Text>
//           <View style={{ alignItems: "center", marginVertical: 8 }}>
//             <StarRating rating={providerInfo.averageRating} size={22} />
//           </View>
//         </View>
//       )}

//       {(jobLocation.latitude && jobLocation.longitude) && (
//         <MapView
//           provider={Platform.OS === "ios" ? PROVIDER_GOOGLE : undefined}
//           style={{ height: 220, borderRadius: 10, marginVertical: 12 }}
//           region={animatedRegion ? animatedRegion.__getValue() : {
//             latitude: jobLocation.latitude,
//             longitude: jobLocation.longitude,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//         >
//           <Marker coordinate={jobLocation} title="Customer" />
//           {animatedRegion && (
//             <Marker.Animated coordinate={animatedRegion} title="Service Pro" pinColor="blue" />
//           )}
//           {routeCoords.length === 2 && (
//             <Polyline
//               coordinates={routeCoords}
//               strokeColor="#1976d2"
//               strokeWidth={3}
//             />
//           )}
//         </MapView>
//       )}

//       {eta && (
//         <Text style={{ textAlign: "center", marginBottom: 10 }}>
//           Estimated Arrival: {eta} min
//         </Text>
//       )}

//       {(job.status === "pending" || job.status === "invited") && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>Please Wait…</Text>
//           <Text>Your request has been sent to a local professional.</Text>
//           {description && (
//             <>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </>
//           )}
//         </View>
//       )}

//       {job.paymentStatus === "awaiting-additional-payment" && (
//         <View style={styles.pending}>
//           <Text style={styles.pendingText}>
//             Additional charge of ${job.additionalCharge.toFixed(2)} pending…
//           </Text>
//           <Text>Convenience fee: ${convFee.toFixed(2)}</Text>
//           <Text>Total due: ${totalDue.toFixed(2)}</Text>
//         </View>
//       )}

//       {job.providerCompleted && !job.customerCompleted && (
//         <View style={styles.confirm}>
//           <Text style={styles.heading}>Confirm Job Complete</Text>
//           <Text style={styles.confirmText}>
//             The provider marked this job complete. Please confirm below:
//           </Text>
//           <TouchableOpacity
//             style={[styles.confirmButton, confirming && styles.confirmButtonDisabled]}
//             onPress={handleCustomerComplete}
//             disabled={confirming}
//           >
//             <Text style={styles.confirmButtonText}>
//               {confirming ? "Confirming…" : "Confirm Job Complete"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 24,
//     backgroundColor: "#fff",
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   containerLogo: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 30,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   card: {
//     backgroundColor: "#f0f0f0",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     alignItems: "center",
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginTop: 12,
//     marginBottom: 4,
//     textAlign: "center",
//   },
//   descriptionText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//     textAlign: "center",
//   },
//   pending: {
//     padding: 12,
//     backgroundColor: "#fff3e0",
//     borderRadius: 6,
//     marginBottom: 16,
//   },
//   pendingText: {
//     color: "orange",
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   waiting: {
//     padding: 12,
//     backgroundColor: "#e3f2fd",
//     borderRadius: 6,
//     marginVertical: 16,
//   },
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
//   confirmText: {
//     marginBottom: 10,
//     fontSize: 15,
//   },
//   confirmButton: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 12,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   confirmButtonDisabled: {
//     backgroundColor: "#999",
//   },
//   confirmButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });

/**
 * CustomerJobStatus.js (Enhanced)
 * - Live animated provider tracking
 * - Polyline + ETA between provider and customer
 * - Zoom-to-fit both markers on map load
 */

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
//   StyleSheet,
//   Platform,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import MapView, { Marker, Polyline, AnimatedRegion, PROVIDER_GOOGLE } from "react-native-maps";
// import io from "socket.io-client";
// import api from "../api/client";
// import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
// import { saveSession } from "../utils/sessionManager";
// import StarRating from "../components/StarRating";

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// export default function CustomerJobStatus() {
//   const { jobId } = useRoute().params;
//   const navigation = useNavigation();

//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [confirming, setConfirming] = useState(false);
//   const [providerInfo, setProviderInfo] = useState(null);
//   const [providerCoords, setProviderCoords] = useState(null);
//   const [eta, setEta] = useState(null);
//   const [animatedRegion, setAnimatedRegion] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);

//   const mapRef = useRef(null);
//   const details = job?.details ?? {};
//   const description = details.issue ? getCoveredDescription(details.issue) : null;

//   useEffect(() => {
//     if (job && job.status !== "completed") {
//       saveSession({ role: "customer", jobId: job._id });
//     }
//   }, [job]);

//   useEffect(() => {
//     const socket = io(api.defaults.baseURL?.replace("/api", ""), {
//       transports: ["websocket"],
//     });

//     socket.emit("join", jobId);

//     socket.on("jobAccepted", ({ jobId: acceptedId }) => {
//       if (acceptedId === jobId) {
//         navigation.replace("CustomerJobStatus", { jobId });
//       }
//     });

//     socket.on("jobUpdated", (updatedJob) => {
//       if (updatedJob._id === jobId) setJob(updatedJob);
//     });

//     socket.on("locationUpdate", ({ provider }) => {
//       const coords = { latitude: provider.lat, longitude: provider.lng };
//       setProviderCoords(coords);

//       if (animatedRegion) {
//         animatedRegion.timing({
//           latitude: coords.latitude,
//           longitude: coords.longitude,
//           duration: 1000,
//           useNativeDriver: false,
//         }).start();
//       } else {
//         setAnimatedRegion(new AnimatedRegion({
//           latitude: coords.latitude,
//           longitude: coords.longitude,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         }));
//       }

//       if (job?.location?.coordinates) {
//         const toRad = (val) => (val * Math.PI) / 180;
//         const lat1 = coords.latitude;
//         const lon1 = coords.longitude;
//         const lat2 = job.location.coordinates[1];
//         const lon2 = job.location.coordinates[0];
//         const R = 6371;
//         const dLat = toRad(lat2 - lat1);
//         const dLon = toRad(lon2 - lon1);
//         const a = Math.sin(dLat / 2) ** 2 +
//           Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
//           Math.sin(dLon / 2) ** 2;
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         const distance = R * c;
//         const etaMin = Math.round((distance / 0.6) * 60);
//         setEta(etaMin);

//         const customerCoords = { latitude: lat2, longitude: lon2 };
//         setRouteCoords([coords, customerCoords]);

//         if (distance < 0.15) {
//           Alert.alert("Heads Up!", "Your service provider is almost there.");
//         }

//         // zoom map to both points
//         if (mapRef.current) {
//           mapRef.current.fitToCoordinates([coords, customerCoords], {
//             edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
//             animated: true,
//           });
//         }
//       }
//     });

//     return () => socket.disconnect();
//   }, [jobId, navigation, job, animatedRegion]);

//   useEffect(() => {
//     let alive = true;
//     const fetchJob = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (!alive) return;
//         setJob(data);

//         if (data.acceptedProvider && data.status === "accepted") {
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
//         if (jobLoc && !animatedRegion) {
//           const [lng, lat] = jobLoc;
//           setAnimatedRegion(new AnimatedRegion({
//             latitude: lat,
//             longitude: lng,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }));
//         }

//         if (data.status === "awaiting-additional-payment") {
//           navigation.replace("PaymentScreen", { jobId });
//         }
//       } catch (err) {
//         if (alive) Alert.alert("Error", "Unable to load job status.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     };
//     fetchJob();
//     const iv = setInterval(fetchJob, 25000);
//     return () => {
//       alive = false;
//       clearInterval(iv);
//     };
//   }, [jobId, navigation]);

//   const handleCustomerComplete = async () => {
//     setConfirming(true);
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
//       setJob(data);
//     } catch {
//       Alert.alert("Error", "Could not confirm completion");
//     } finally {
//       setConfirming(false);
//     }
//   };

//   if (loading) return <ActivityIndicator style={styles.center} size="large" />;
//   if (!job) return <Text style={styles.center}>Job not found.</Text>;

//   const subtotal =
//     (job.baseAmount || 0) +
//     (job.adjustmentAmount || 0) +
//     (job.rushFee || 0) +
//     (job.additionalCharge || 0);
//   const convFee =
//     job.convenienceFee ??
//     Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//   const totalDue = job.estimatedTotal ?? subtotal + convFee;

//   const jobLocation = {
//     latitude: job.location?.coordinates?.[1] || 0,
//     longitude: job.location?.coordinates?.[0] || 0,
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.containerLogo}>
//         <Image
//           source={require("../assets/blinqfix_logo-new.jpeg")}
//           style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
//           resizeMode="contain"
//         />
//       </View>
//       <Text style={styles.title}>Job Status</Text>
//       <Text style={{ marginBottom: 16 }}>Status: {job.status}</Text>

//       {providerInfo && job.status === "accepted" && (
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Your Service Pro</Text>
//           {providerInfo.profilePictureUrl && (
//             <Image
//               source={{ uri: providerInfo.profilePictureUrl }}
//               style={{ width: 160, height: 160, borderRadius: 100 }}
//             />
//           )}
//           <Text style={{ fontWeight: "bold", fontSize: 16 }}>{providerInfo.name}</Text>
//           <Text>{providerInfo.businessName}</Text>
//           <Text>{providerInfo.aboutMe}</Text>
//           <View style={{ alignItems: "center", marginVertical: 8 }}>
//             <StarRating rating={providerInfo.averageRating} size={22} />
//           </View>
//         </View>
//       )}

//       {jobLocation.latitude && jobLocation.longitude && (
//         <MapView
//           ref={mapRef}
//           provider={Platform.OS === "ios" ? PROVIDER_GOOGLE : undefined}
//           style={{ height: 220, borderRadius: 10, marginVertical: 12 }}
//           region={animatedRegion ? animatedRegion.__getValue() : {
//             latitude: jobLocation.latitude,
//             longitude: jobLocation.longitude,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//         >
//           <Marker coordinate={jobLocation} title="Customer" />
//           {animatedRegion && (
//             <Marker.Animated coordinate={animatedRegion} title="Service Pro" pinColor="blue" />
//           )}
//           {routeCoords.length === 2 && (
//             <Polyline
//               coordinates={routeCoords}
//               strokeColor="#1976d2"
//               strokeWidth={3}
//             />
//           )}
//         </MapView>
//       )}

//       {eta && (
//         <Text style={{ textAlign: "center", marginBottom: 10 }}>
//           Estimated Arrival: {eta} min
//         </Text>
//       )}

//       {(job.status === "pending" || job.status === "invited") && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>Please Wait…</Text>
//           <Text>Your request has been sent to a local professional.</Text>
//           {description && (
//             <>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </>
//           )}
//         </View>
//       )}

//       {job.paymentStatus === "awaiting-additional-payment" && (
//         <View style={styles.pending}>
//           <Text style={styles.pendingText}>
//             Additional charge of ${job.additionalCharge.toFixed(2)} pending…
//           </Text>
//           <Text>Convenience fee: ${convFee.toFixed(2)}</Text>
//           <Text>Total due: ${totalDue.toFixed(2)}</Text>
//         </View>
//       )}

//       {job.providerCompleted && !job.customerCompleted && (
//         <View style={styles.confirm}>
//           <Text style={styles.heading}>Confirm Job Complete</Text>
//           <Text style={styles.confirmText}>
//             The provider marked this job complete. Please confirm below:
//           </Text>
//           <TouchableOpacity
//             style={[styles.confirmButton, confirming && styles.confirmButtonDisabled]}
//             onPress={handleCustomerComplete}
//             disabled={confirming}
//           >
//             <Text style={styles.confirmButtonText}>
//               {confirming ? "Confirming…" : "Confirm Job Complete"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 24,
//     backgroundColor: "#fff",
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   containerLogo: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 30,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   card: {
//     backgroundColor: "#f0f0f0",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     alignItems: "center",
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginTop: 12,
//     marginBottom: 4,
//     textAlign: "center",
//   },
//   descriptionText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//     textAlign: "center",
//   },
//   pending: {
//     padding: 12,
//     backgroundColor: "#fff3e0",
//     borderRadius: 6,
//     marginBottom: 16,
//   },
//   pendingText: {
//     color: "orange",
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   waiting: {
//     padding: 12,
//     backgroundColor: "#e3f2fd",
//     borderRadius: 6,
//     marginVertical: 16,
//     textAlign: "center",
//   },
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
//   confirmText: {
//     marginBottom: 10,
//     fontSize: 15,
//   },
//   confirmButton: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 12,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   confirmButtonDisabled: {
//     backgroundColor: "#999",
//   },
//   confirmButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });

// /**
//  * CustomerJobStatus.js (Enhanced)
//  * - Live animated provider tracking
//  * - Polyline + ETA between provider and customer
//  * - Zoom-to-fit both markers on map load
//  */

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
//   StyleSheet,
//   Platform,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import MapView, { Marker, Polyline, AnimatedRegion, PROVIDER_GOOGLE } from "react-native-maps";
// import io from "socket.io-client";
// import api from "../api/client";
// import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
// import { saveSession } from "../utils/sessionManager";
// import StarRating from "../components/StarRating";

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// export default function CustomerJobStatus() {
//   const { jobId } = useRoute().params;
//   const navigation = useNavigation();

//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [confirming, setConfirming] = useState(false);
//   const [providerInfo, setProviderInfo] = useState(null);
//   const [providerCoords, setProviderCoords] = useState(null);
//   const [eta, setEta] = useState(null);
//   const [animatedRegion, setAnimatedRegion] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);

//   const mapRef = useRef(null);
//   const details = job?.details ?? {};
//   const description = details.issue ? getCoveredDescription(details.issue) : null;

//   useEffect(() => {
//     if (job && job.status !== "completed") {
//       saveSession({ role: "customer", jobId: job._id });
//     }
//   }, [job]);

//   useEffect(() => {
//     const socket = io(api.defaults.baseURL?.replace("/api", ""), {
//       transports: ["websocket"],
//     });

//     socket.emit("join", jobId);

//     socket.on("jobAccepted", ({ jobId: acceptedId }) => {
//       if (acceptedId === jobId) {
//         navigation.replace("CustomerJobStatus", { jobId });
//       }
//     });

//     socket.on("jobUpdated", (updatedJob) => {
//       if (updatedJob._id === jobId) setJob(updatedJob);
//     });

//     socket.on("locationUpdate", ({ provider }) => {
//       const coords = { latitude: provider.lat, longitude: provider.lng };
//       setProviderCoords(coords);

//       if (animatedRegion) {
//         animatedRegion.timing({
//           latitude: coords.latitude,
//           longitude: coords.longitude,
//           duration: 1000,
//           useNativeDriver: false,
//         }).start();
//       } else {
//         setAnimatedRegion(new AnimatedRegion({
//           latitude: coords.latitude,
//           longitude: coords.longitude,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         }));
//       }

//       if (job?.location?.coordinates) {
//         const toRad = (val) => (val * Math.PI) / 180;
//         const lat1 = coords.latitude;
//         const lon1 = coords.longitude;
//         const lat2 = job.location.coordinates[1];
//         const lon2 = job.location.coordinates[0];
//         const R = 6371;
//         const dLat = toRad(lat2 - lat1);
//         const dLon = toRad(lon2 - lon1);
//         const a = Math.sin(dLat / 2) ** 2 +
//           Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
//           Math.sin(dLon / 2) ** 2;
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         const distance = R * c;
//         const etaMin = Math.round((distance / 0.6) * 60);
//         setEta(etaMin);

//         const customerCoords = { latitude: lat2, longitude: lon2 };
//         setRouteCoords([coords, customerCoords]);

//         if (distance < 0.15) {
//           Alert.alert("Heads Up!", "Your service provider is almost there.");
//         }

//         if (mapRef.current) {
//           mapRef.current.fitToCoordinates([coords, customerCoords], {
//             edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
//             animated: true,
//           });
//         }
//       }
//     });

//     return () => socket.disconnect();
//   }, [jobId, navigation, job, animatedRegion]);

//   useEffect(() => {
//     let alive = true;
//     const fetchJob = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (!alive) return;
//         setJob(data);

//         if (data.acceptedProvider && data.status === "accepted") {
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
//         if (jobLoc && !animatedRegion) {
//           const [lng, lat] = jobLoc;
//           setAnimatedRegion(new AnimatedRegion({
//             latitude: lat,
//             longitude: lng,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }));
//         }

//         if (data.status === "awaiting-additional-payment") {
//           navigation.replace("PaymentScreen", { jobId });
//         }
//       } catch (err) {
//         if (alive) Alert.alert("Error", "Unable to load job status.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     };
//     fetchJob();
//     const iv = setInterval(fetchJob, 25000);
//     return () => {
//       alive = false;
//       clearInterval(iv);
//     };
//   }, [jobId, navigation]);

//   const handleCustomerComplete = async () => {
//     setConfirming(true);
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
//       setJob(data);

//       // ✅ Redirect to Ratings screen after completion
//       navigation.replace("RateProvider", { jobId: data._id });
//     } catch {
//       Alert.alert("Error", "Could not confirm completion");
//     } finally {
//       setConfirming(false);
//     }
//   };

//   if (loading) return <ActivityIndicator style={styles.center} size="large" />;
//   if (!job) return <Text style={styles.center}>Job not found.</Text>;

//   const subtotal =
//     (job.baseAmount || 0) +
//     (job.adjustmentAmount || 0) +
//     (job.rushFee || 0) +
//     (job.additionalCharge || 0);
//   const convFee =
//     job.convenienceFee ??
//     Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
//   const totalDue = job.estimatedTotal ?? subtotal + convFee;

//   const jobLocation = {
//     latitude: job.location?.coordinates?.[1] || 0,
//     longitude: job.location?.coordinates?.[0] || 0,
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.containerLogo}>
//         <Image
//           source={require("../assets/blinqfix_logo-new.jpeg")}
//           style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
//           resizeMode="contain"
//         />
//       </View>
//       <Text style={styles.title}>Job Status</Text>
//       <Text style={{ marginBottom: 16 }}>Status: {job.status}</Text>

//       {providerInfo && job.status === "accepted" && (
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Your Service Pro</Text>
//           {providerInfo.profilePictureUrl && (
//             <Image
//               source={{ uri: providerInfo.profilePictureUrl }}
//               style={{ width: 160, height: 160, borderRadius: 100 }}
//             />
//           )}
//           <Text style={{ fontWeight: "bold", fontSize: 16 }}>{providerInfo.name}</Text>
//           <Text>{providerInfo.businessName}</Text>
//           <Text>{providerInfo.aboutMe}</Text>
//           <View style={{ alignItems: "center", marginVertical: 8 }}>
//             <StarRating rating={providerInfo.averageRating} size={22} />
//           </View>
//         </View>
//       )}

//       {job.status === "accepted" && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>
//             Your emergency service pro is now in route
//           </Text>
//           <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
//             Make the necessary preparations. Put away pets, ensure gate access,
//             and prepare for all necessary access if needed.
//           </Text>
//           {description && (
//             <>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </>
//           )}
//         </View>
//       )}

//       {/* {jobLocation.latitude && jobLocation.longitude && (
//         <MapView
//           ref={mapRef}
//           provider={Platform.OS === "ios" ? PROVIDER_GOOGLE : undefined}
//           style={{ height: 220, borderRadius: 10, marginVertical: 12 }}
//           region={animatedRegion ? animatedRegion.__getValue() : {
//             latitude: jobLocation.latitude,
//             longitude: jobLocation.longitude,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//         >
//           <Marker coordinate={jobLocation} title="Customer" />
//           {animatedRegion && (
//             <Marker.Animated coordinate={animatedRegion} title="Service Pro" pinColor="blue" />
//           )}
//           {routeCoords.length === 2 && (
//             <Polyline
//               coordinates={routeCoords}
//               strokeColor="#1976d2"
//               strokeWidth={3}
//             />
//           )}
//         </MapView>
//       )} */}

// {jobLocation.latitude && jobLocation.longitude && (
//   <MapView
//     ref={mapRef}
//     style={{ height: 220, borderRadius: 10, marginVertical: 12 }}
//     initialRegion={{
//       latitude: jobLocation.latitude,
//       longitude: jobLocation.longitude,
//       latitudeDelta: 0.01,
//       longitudeDelta: 0.01,
//     }}
//     onMapReady={() => {
//       if (providerCoords && mapRef.current) {
//         mapRef.current.fitToCoordinates([jobLocation, providerCoords], {
//           edgePadding: { top: 80, bottom: 80, left: 80, right: 80 },
//           animated: true,
//         });
//       }
//     }}
//   >
//     <Marker coordinate={jobLocation} title="Customer" />
//     {providerCoords && (
//       <Marker coordinate={providerCoords} title="Service Pro" pinColor="blue" />
//     )}
//     {routeCoords.length === 2 && (
//       <Polyline
//         coordinates={routeCoords}
//         strokeColor="#1976d2"
//         strokeWidth={3}
//       />
//     )}
//   </MapView>
// )}

//       {eta && (
//         <Text style={{ textAlign: "center", marginBottom: 10 }}>
//           Estimated Arrival: {eta} min
//         </Text>
//       )}

//       {(job.status === "pending" || job.status === "invited") && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>Please Wait…</Text>
//           <Text>Your request has been sent to a local professional.</Text>
//           {description && (
//             <>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </>
//           )}
//         </View>
//       )}

//       {job.paymentStatus === "awaiting-additional-payment" && (
//         <View style={styles.pending}>
//           <Text style={styles.pendingText}>
//             Additional charge of ${job.additionalCharge.toFixed(2)} pending…
//           </Text>
//           <Text>Convenience fee: ${convFee.toFixed(2)}</Text>
//           <Text>Total due: ${totalDue.toFixed(2)}</Text>
//         </View>
//       )}

//       {job.providerCompleted && !job.customerCompleted && (
//         <View style={styles.confirm}>
//           <Text style={styles.heading}>Confirm Job Complete</Text>
//           <Text style={styles.confirmText}>
//             The provider marked this job complete. Please confirm below:
//           </Text>
//           <TouchableOpacity
//             style={[styles.confirmButton, confirming && styles.confirmButtonDisabled]}
//             onPress={handleCustomerComplete}
//             disabled={confirming}
//           >
//             <Text style={styles.confirmButtonText}>
//               {confirming ? "Confirming…" : "Confirm Job Complete"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 24,
//     backgroundColor: "#fff",
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   containerLogo: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 30,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   card: {
//     backgroundColor: "#f0f0f0",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     alignItems: "center",
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginTop: 12,
//     marginBottom: 4,
//     textAlign: "center",
//   },
//   descriptionText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//     textAlign: "center",
//   },
//   pending: {
//     padding: 12,
//     backgroundColor: "#fff3e0",
//     borderRadius: 6,
//     marginBottom: 16,
//   },
//   pendingText: {
//     color: "orange",
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   waiting: {
//     padding: 12,
//     backgroundColor: "#e3f2fd",
//     borderRadius: 6,
//     marginVertical: 16,
//   },
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
//   confirmText: {
//     marginBottom: 10,
//     fontSize: 15,
//   },
//   confirmButton: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 12,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   confirmButtonDisabled: {
//     backgroundColor: "#999",
//   },
//   confirmButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });

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
//   StyleSheet,
//   Platform,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import MapView, {
//   Marker,
//   Polyline,
//   AnimatedRegion,
//   PROVIDER_GOOGLE,
// } from "react-native-maps";
// import io from "socket.io-client";
// import api from "../api/client";
// import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
// import { saveSession } from "../utils/sessionManager";
// import StarRating from "../components/StarRating";

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// export default function CustomerJobStatus() {
//   const { jobId } = useRoute().params;
//   const navigation = useNavigation();

//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [confirming, setConfirming] = useState(false);
//   const [providerInfo, setProviderInfo] = useState(null);
//   const [providerCoords, setProviderCoords] = useState(null);
//   const [eta, setEta] = useState(null);
//   const [animatedRegion, setAnimatedRegion] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);

//   const mapRef = useRef(null);
//   const details = job?.details ?? {};
//   const description = details.issue
//     ? getCoveredDescription(details.issue)
//     : null;

//   useEffect(() => {
//     if (job && job.status !== "completed") {
//       saveSession({ role: "customer", jobId: job._id });
//     }
//   }, [job]);

//   useEffect(() => {
//     const socket = io(api.defaults.baseURL?.replace("/api", ""), {
//       transports: ["websocket"],
//     });

//     socket.emit("join", jobId);

//     socket.on("jobAccepted", ({ jobId: acceptedId }) => {
//       if (acceptedId === jobId) {
//         navigation.replace("CustomerJobStatus", { jobId });
//       }
//     });

//     socket.on("jobUpdated", (updatedJob) => {
//       if (updatedJob._id === jobId) setJob(updatedJob);
//     });

//     socket.on("locationUpdate", ({ provider }) => {
//       const coords = { latitude: provider.lat, longitude: provider.lng };
//       setProviderCoords(coords);

//       if (animatedRegion) {
//         animatedRegion
//           .timing({
//             latitude: coords.latitude,
//             longitude: coords.longitude,
//             duration: 1000,
//             useNativeDriver: false,
//           })
//           .start();
//       } else {
//         setAnimatedRegion(
//           new AnimatedRegion({
//             latitude: coords.latitude,
//             longitude: coords.longitude,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           })
//         );
//       }

//       if (job?.location?.coordinates) {
//         const toRad = (val) => (val * Math.PI) / 180;
//         const lat1 = coords.latitude;
//         const lon1 = coords.longitude;
//         const lat2 = job.location.coordinates[1];
//         const lon2 = job.location.coordinates[0];
//         const R = 6371;
//         const dLat = toRad(lat2 - lat1);
//         const dLon = toRad(lon2 - lon1);
//         const a =
//           Math.sin(dLat / 2) ** 2 +
//           Math.cos(toRad(lat1)) *
//             Math.cos(toRad(lat2)) *
//             Math.sin(dLon / 2) ** 2;
//         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         const distance = R * c;
//         const etaMin = Math.round((distance / 0.6) * 60);
//         setEta(etaMin);

//         const customerCoords = { latitude: lat2, longitude: lon2 };
//         setRouteCoords([coords, customerCoords]);

//         if (distance < 0.15) {
//           Alert.alert("Heads Up!", "Your service provider is almost there.");
//         }

//         if (mapRef.current) {
//           mapRef.current.fitToCoordinates([coords, customerCoords], {
//             edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
//             animated: true,
//           });
//         }
//       }
//     });

//     return () => socket.disconnect();
//   }, [jobId, navigation, job, animatedRegion]);

//   useEffect(() => {
//     let alive = true;
//     const fetchJob = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (!alive) return;
//         setJob(data);

//         if (data.acceptedProvider && data.status === "accepted") {
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
//         if (jobLoc && !animatedRegion) {
//           const [lng, lat] = jobLoc;
//           setAnimatedRegion(
//             new AnimatedRegion({
//               latitude: lat,
//               longitude: lng,
//               latitudeDelta: 0.01,
//               longitudeDelta: 0.01,
//             })
//           );
//         }

//         if (data.status === "awaiting-additional-payment") {
//           navigation.replace("PaymentScreen", { jobId });
//         }
//       } catch (err) {
//         if (alive) Alert.alert("Error", "Unable to load job status.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     };
//     fetchJob();
//     const iv = setInterval(fetchJob, 25000);
//     return () => {
//       alive = false;
//       clearInterval(iv);
//     };
//   }, [jobId, navigation]);

//   const handleCustomerComplete = async () => {
//     setConfirming(true);
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
//       setJob(data);
//       navigation.replace("RateProvider", { jobId: data._id });
//     } catch {
//       Alert.alert("Error", "Could not confirm completion");
//     } finally {
//       setConfirming(false);
//     }
//   };

//   const handleReinvite = async () => {
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/reinvite`);
//       Alert.alert("Reinvited", "We’re searching again for a provider.");
//       setJob(data);
//     } catch (err) {
//       Alert.alert("Error", "Failed to reinvite provider.");
//     }
//   };

//   const handleCancelJob = async () => {
//     try {
//       const { data } = await api.put(`/jobs/${jobId}/cancelled`, {
//         cancelledBy: "customer",
//       });
//       Alert.alert("Cancelled", "The job has been cancelled.");
//       setJob(data);
//     } catch (err) {
//       Alert.alert("Error", "Failed to cancel job.");
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* existing content omitted for brevity */}
//       <View style={styles.containerLogo}>
//         <Image
//           source={require("../assets/blinqfix_logo-new.jpeg")}
//           style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
//           resizeMode="contain"
//         />
//       </View>
//       <Text style={styles.title}>Job Status</Text>
//       <Text style={{ marginBottom: 16 }}>Status: {job.status}</Text>
//       {providerInfo && job.status === "accepted" && (
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Your Service Pro</Text>
//           {providerInfo.profilePictureUrl && (
//             <Image
//               source={{ uri: providerInfo.profilePictureUrl }}
//               style={{ width: 160, height: 160, borderRadius: 100 }}
//             />
//           )}
//           <Text style={{ fontWeight: "bold", fontSize: 16 }}>
//             {providerInfo.name}
//           </Text>
//           <Text>{providerInfo.businessName}</Text>
//           <Text>{providerInfo.aboutMe}</Text>
//           <View style={{ alignItems: "center", marginVertical: 8 }}>
//             <StarRating rating={providerInfo.averageRating} size={22} />
//           </View>
//         </View>
//       )}

//       {job.status === "accepted" && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>
//             Your emergency service pro is now in route
//           </Text>
//           <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
//             Make the necessary preparations. Put away pets, ensure gate access,
//             and prepare for all necessary access if needed.
//           </Text>
//           {description && (
//             <>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </>
//           )}
//         </View>
//       )}

//       {/* {jobLocation.latitude && jobLocation.longitude && (
//         <MapView
//           ref={mapRef}
//           style={{ height: 220, borderRadius: 10, marginVertical: 12 }}
//           initialRegion={{
//             latitude: jobLocation.latitude,
//             longitude: jobLocation.longitude,
//             latitudeDelta: 0.01,
//             longitudeDelta: 0.01,
//           }}
//           onMapReady={() => {
//             if (providerCoords && mapRef.current) {
//               mapRef.current.fitToCoordinates([jobLocation, providerCoords], {
//                 edgePadding: { top: 80, bottom: 80, left: 80, right: 80 },
//                 animated: true,
//               });
//             }
//           }}
//         >
//           <Marker coordinate={jobLocation} title="Customer" />
//           {providerCoords && (
//             <Marker
//               coordinate={providerCoords}
//               title="Service Pro"
//               pinColor="blue"
//             />
//           )}
//           {routeCoords.length === 2 && (
//             <Polyline
//               coordinates={routeCoords}
//               strokeColor="#1976d2"
//               strokeWidth={3}
//             />
//           )}
//         </MapView>
//       )} */}

// {jobLocation.latitude && jobLocation.longitude && (
//   <MapView
//     ref={mapRef}
//     provider={Platform.OS === "ios" ? PROVIDER_GOOGLE : undefined}
//     style={{ height: 220, borderRadius: 10, marginVertical: 12 }}
//     initialRegion={{
//       latitude: jobLocation.latitude,
//       longitude: jobLocation.longitude,
//       latitudeDelta: 0.01,
//       longitudeDelta: 0.01,
//     }}
//     onMapReady={() => {
//       if (providerCoords && mapRef.current) {
//         mapRef.current.fitToCoordinates(
//           [jobLocation, providerCoords],
//           {
//             edgePadding: { top: 80, bottom: 80, left: 80, right: 80 },
//             animated: true,
//           }
//         );
//       }
//     }}
//   >
//     {/* Customer Marker */}
//     <Marker coordinate={jobLocation} title="Customer" />

//     {/* Provider Marker */}
//     {providerCoords && providerCoords.latitude && providerCoords.longitude && (
//       <Marker
//         coordinate={providerCoords}
//         title="Service Pro"
//         pinColor="blue"
//         description="Provider's current location"
//       />
//     )}

//     {/* Route Line */}
//     {routeCoords.length === 2 && (
//       <Polyline
//         coordinates={routeCoords}
//         strokeColor="#1976d2"
//         strokeWidth={4}
//         lineCap="round"
//       />
//     )}
//   </MapView>
// )}

//       {eta && (
//         <Text style={{ textAlign: "center", marginBottom: 10 }}>
//           Estimated Arrival: {eta} min
//         </Text>
//       )}

//       {(job.status === "pending" || job.status === "invited") && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>Please Wait…</Text>
//           <Text>Your request has been sent to a local professional.</Text>
//           {description && (
//             <>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </>
//           )}
//         </View>
//       )}

//       {job.paymentStatus === "awaiting-additional-payment" && (
//         <View style={styles.pending}>
//           <Text style={styles.pendingText}>
//             Additional charge of ${job.additionalCharge.toFixed(2)} pending…
//           </Text>
//           <Text>Convenience fee: ${convFee.toFixed(2)}</Text>
//           <Text>Total due: ${totalDue.toFixed(2)}</Text>
//         </View>
//       )}

//       {job.providerCompleted && !job.customerCompleted && (
//         <View style={styles.confirm}>
//           <Text style={styles.heading}>Confirm Job Complete</Text>
//           <Text style={styles.confirmText}>
//             The provider marked this job complete. Please confirm below:
//           </Text>
//           <TouchableOpacity
//             style={[
//               styles.confirmButton,
//               confirming && styles.confirmButtonDisabled,
//             ]}
//             onPress={handleCustomerComplete}
//             disabled={confirming}
//           >
//             <Text style={styles.confirmButtonText}>
//               {confirming ? "Confirming…" : "Confirm Job Complete"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {job?.status?.startsWith("cancelled") && (
//         <View style={styles.confirm}>
//           <Text style={styles.heading}>Your job was cancelled.</Text>
//           <TouchableOpacity
//             style={styles.confirmButton}
//             onPress={handleReinvite}
//           >
//             <Text style={styles.confirmButtonText}>Reinvite Providers</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.confirmButton, { backgroundColor: "#d32f2f" }]}
//             onPress={handleCancelJob}
//           >
//             <Text style={styles.confirmButtonText}>Cancel Job</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 24,
//     backgroundColor: "#fff",
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   containerLogo: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginVertical: 30,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   card: {
//     backgroundColor: "#f0f0f0",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//     alignItems: "center",
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginTop: 12,
//     marginBottom: 4,
//     textAlign: "center",
//   },
//   descriptionText: {
//     fontSize: 14,
//     color: "#555",
//     lineHeight: 20,
//     textAlign: "center",
//   },
//   confirm: {
//     padding: 12,
//     backgroundColor: "#e8f5e9",
//     borderRadius: 6,
//     marginTop: 16,
//     alignItems: "center",
//   },
//   confirmButton: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 12,
//     borderRadius: 6,
//     alignItems: "center",
//     marginTop: 12,
//     paddingHorizontal: 20,
//   },
//   confirmButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
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
  StyleSheet,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import MapView, {
  Marker,
  Polyline,
  AnimatedRegion,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import io from "socket.io-client";
import api from "../api/client";
import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
import { saveSession } from "../utils/sessionManager";
import StarRating from "../components/StarRating";

const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.55;

export default function CustomerJobStatus() {
  const { jobId } = useRoute().params;
  const navigation = useNavigation();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [providerInfo, setProviderInfo] = useState(null);
  const [providerCoords, setProviderCoords] = useState(null);
  const [eta, setEta] = useState(null);
  const [animatedRegion, setAnimatedRegion] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [jobLocation, setJobLocation] = useState(null);

  const mapRef = useRef(null);
  const details = job?.details ?? {};
  const description = details.issue
    ? getCoveredDescription(details.issue)
    : null;

  useEffect(() => {
    if (job && job.status !== "completed") {
      saveSession({ role: "customer", jobId: job._id });
    }
  }, [job]);

  useEffect(() => {
    const socket = io(api.defaults.baseURL?.replace("/api", ""), {
      transports: ["websocket"],
    });

    socket.emit("join", jobId);

    socket.on("jobAccepted", ({ jobId: acceptedId }) => {
      if (acceptedId === jobId) {
        navigation.replace("CustomerJobStatus", { jobId });
      }
    });

    socket.on("jobUpdated", (updatedJob) => {
      if (updatedJob._id === jobId) setJob(updatedJob);
    });

    socket.on("locationUpdate", ({ provider }) => {
      const coords = { latitude: provider.lat, longitude: provider.lng };
      setProviderCoords(coords);

      if (animatedRegion) {
        animatedRegion
          .timing({
            latitude: coords.latitude,
            longitude: coords.longitude,
            duration: 1000,
            useNativeDriver: false,
          })
          .start();
      } else {
        setAnimatedRegion(
          new AnimatedRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          })
        );
      }

      if (job?.location?.coordinates) {
        const toRad = (val) => (val * Math.PI) / 180;
        const lat1 = coords.latitude;
        const lon1 = coords.longitude;
        const lat2 = job.location.coordinates[1];
        const lon2 = job.location.coordinates[0];
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        const etaMin = Math.round((distance / 0.6) * 60);
        setEta(etaMin);

        const customerCoords = { latitude: lat2, longitude: lon2 };
        setJobLocation(customerCoords);
        setRouteCoords([coords, customerCoords]);

        if (distance < 0.15) {
          Alert.alert("Heads Up!", "Your service provider is almost there.");
        }

        if (mapRef.current) {
          mapRef.current.fitToCoordinates([coords, customerCoords], {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: true,
          });
        }
      }
    });

    return () => socket.disconnect();
  }, [jobId, navigation, job, animatedRegion]);

  useEffect(() => {
    let alive = true;
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${jobId}`);
        if (!alive) return;
        setJob(data);

        if (data.acceptedProvider && data.status === "accepted") {
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
        if (jobLoc && !animatedRegion) {
          const [lng, lat] = jobLoc;
          const customerCoords = { latitude: lat, longitude: lng };
          setJobLocation(customerCoords);
          setAnimatedRegion(
            new AnimatedRegion({
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            })
          );
        }

        if (data.status === "awaiting-additional-payment") {
          navigation.replace("PaymentScreen", { jobId });
        }
      } catch (err) {
        if (alive) Alert.alert("Error", "Unable to load job status.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchJob();
    const iv = setInterval(fetchJob, 25000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [jobId, navigation]);

  const handleCustomerComplete = async () => {
    setConfirming(true);
    try {
      const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
      setJob(data);
      navigation.replace("RateProvider", { jobId: data._id });
    } catch {
      Alert.alert("Error", "Could not confirm completion");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;
  if (!job) return <Text style={styles.center}>Job not found.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.containerLogo}>
        <Image
          source={require("../assets/blinqfix_logo-new.jpeg")}
          style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title}>Job Status</Text>
      <Text style={{ marginBottom: 16 }}>Status: {job.status}</Text>

      {providerInfo && job.status === "accepted" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Service Pro</Text>
          {providerInfo.profilePictureUrl && (
            <Image
              source={{ uri: providerInfo.profilePictureUrl }}
              style={{ width: 160, height: 160, borderRadius: 100 }}
            />
          )}
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {providerInfo.name}
          </Text>
          <Text>{providerInfo.businessName}</Text>
          <Text>{providerInfo.aboutMe}</Text>
          <View style={{ alignItems: "center", marginVertical: 8 }}>
            <StarRating rating={providerInfo.averageRating} size={22} />
          </View>
        </View>
      )}

      {job.status === "accepted" && (
        <View style={styles.waiting}>
          <Text style={styles.heading}>
            Your emergency service pro is now in route
          </Text>
          <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
            Make the necessary preparations. Put away pets, ensure gate access,
            and prepare for all necessary access if needed.
          </Text>
          {description && (
            <>
              <Text style={styles.sectionTitle}>What’s Covered:</Text>
              <Text style={styles.descriptionText}>{description}</Text>
            </>
          )}
        </View>
      )}

      {jobLocation?.latitude && jobLocation?.longitude && (
        <MapView
          ref={mapRef}
          provider={Platform.OS === "ios" ? PROVIDER_GOOGLE : undefined}
          style={{ height: 220, borderRadius: 10, marginVertical: 12 }}
          initialRegion={{
            latitude: jobLocation.latitude,
            longitude: jobLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onMapReady={() => {
            if (providerCoords && mapRef.current) {
              mapRef.current.fitToCoordinates([jobLocation, providerCoords], {
                edgePadding: { top: 80, bottom: 80, left: 80, right: 80 },
                animated: true,
              });
            }
          }}
        >
          <Marker coordinate={jobLocation} title="Customer" />
          {/* Provider Marker */}
          {providerCoords &&
            providerCoords.latitude &&
            providerCoords.longitude && (
              <Marker
                coordinate={providerCoords}
                title="Service Pro"
                pinColor="blue"
                description="Provider's current location"
              />
            )}

          {/* Route Line */}
          {routeCoords.length === 2 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#1976d2"
              strokeWidth={4}
              lineCap="round"
            />
          )}
        </MapView>
      )}

      {eta && (
        <Text style={{ textAlign: "center", marginBottom: 10 }}>
          Estimated Arrival: {eta} min
        </Text>
      )}

      {(job.status === "pending" || job.status === "invited") && (
        <View style={styles.waiting}>
          <Text style={styles.heading}>Please Wait…</Text>
          <Text>Your request has been sent to a local professional.</Text>
          {description && (
            <>
              <Text style={styles.sectionTitle}>What’s Covered:</Text>
              <Text style={styles.descriptionText}>{description}</Text>
            </>
          )}
        </View>
      )}
      {job.paymentStatus === "awaiting-additional-payment" && (
        <View style={styles.pending}>
          <Text style={styles.pendingText}>
            Additional charge of ${job.additionalCharge.toFixed(2)} pending…
          </Text>
          <Text>Convenience fee: ${convFee.toFixed(2)}</Text>
          <Text>Total due: ${totalDue.toFixed(2)}</Text>
        </View>
      )}

      {job.providerCompleted && !job.customerCompleted && (
        <View style={styles.confirm}>
          <Text style={styles.heading}>Confirm Job Complete</Text>
          <Text style={styles.confirmText}>
            The provider marked this job complete. Please confirm below:
          </Text>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              confirming && styles.confirmButtonDisabled,
            ]}
            onPress={handleCustomerComplete}
            disabled={confirming}
          >
            <Text style={styles.confirmButtonText}>
              {confirming ? "Confirming…" : "Confirm Job Complete"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {job?.status?.startsWith("cancelled") && (
        <View style={styles.confirm}>
          <Text style={styles.heading}>Your job was cancelled.</Text>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleReinvite}
          >
            <Text style={styles.confirmButtonText}>Reinvite Providers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: "#d32f2f" }]}
            onPress={handleCancelJob}
          >
            <Text style={styles.confirmButtonText}>Cancel Job</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  containerLogo: { justifyContent: "center", alignItems: "center" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 4,
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  waiting: {
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderRadius: 6,
    marginVertical: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  confirm: {
    padding: 12,
    backgroundColor: "#e8f5e9",
    borderRadius: 6,
    marginTop: 16,
  },
  confirmText: { marginBottom: 10, fontSize: 15 },
  confirmButton: {
    backgroundColor: "#1976d2",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  confirmButtonDisabled: { backgroundColor: "#999" },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
