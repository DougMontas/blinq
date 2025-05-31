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

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.25;

// export default function CustomerJobStatus() {
//   const { jobId } = useRoute().params;
//   const navigation = useNavigation();

//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [confirming, setConfirming] = useState(false);
//   const details = job?.details ?? {};
//   const description = details.issue ? getCoveredDescription(details.issue) : null;

//   // 1) Socket “join” to receive real-time updates
//   useEffect(() => {
//     const socket = io(api.defaults.baseURL.replace(/\/api$/, ""), {
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

//   // 2) Fetch job + auto-redirect for payment
//   useEffect(() => {
//     let alive = true;

//     const fetchJob = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
//         if (!alive) return;
//         setJob(data);

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

//   // 3) Navigate to rate screen after completion
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
//       <BackButton />
//       <View style={styles.containerLogo}>
//             <Image
//               source={require("../assets/blinqfix_logo-new.jpeg")}
//               style={[
//                 { width: LOGO_SIZE, height: LOGO_SIZE, marginHorizontal: 120},
//               ]}
//               resizeMode="contain"
//             />
//           </View>
//           <Text>{"\n"}</Text>
//       <Text style={styles.title}>Your Job Status</Text>
//       <Text style={{ marginBottom: 16 }}>Status: {job.status}</Text>

//       {job.status === "accepted" && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>
//             Your emergency service pro is now in route
//           </Text>
//           <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
//             Make the necessary preparations. Put away pets, ensure gate access,
//             and prepare directions if needed.
//           </Text>
//           {description && (
//             <>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </>
//           )}
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
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 24,
//     backgroundColor: "#fff",
//     marginTop: 50,
//   },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
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
// });

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

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.25;

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
//     const socket = io(api.defaults.baseURL.replace(/\/api$/, ""), {
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

//         if (data.acceptedProvider) {
//           const { data: provider } = await api.get(
//             `/users/${data.acceptedProvider}`
//           );
//           setProviderInfo(provider);
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
//       <BackButton />
//       <View style={styles.containerLogo}>
//         <Image
//           source={require("../assets/blinqfix_logo-new.jpeg")}
//           style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginHorizontal: 120 }}
//           resizeMode="contain"
//         />
//       </View>
//       <Text>{"\n"}</Text>
//       <Text style={styles.title}>Your Job Status</Text>
//       <Text style={{ marginBottom: 16 }}>Status: {job.status}</Text>
//       {/*
//       {providerInfo && (
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Your Service Pro</Text>
//           {providerInfo.profilePicture && (
//             <Image
//               source={{ uri: providerInfo.profilePicture }}
//               style={{ width: 80, height: 80, borderRadius: 40, alignSelf: "center" }}
//             />
//           )}
//           <Text style={{ fontWeight: "bold", fontSize: 16 }}>{providerInfo.name}</Text>
//           <Text>{providerInfo.businessName}</Text>
//           <Text>{providerInfo.aboutMe}</Text>
//         </View>
//       )} */}

//       {job.status === "accepted" && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>
//             Your emergency service pro is now in route
//           </Text>
//           <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
//             Make the necessary preparations. Put away pets, ensure gate access,
//             and prepare directions if needed.
//           </Text>
//           {description && (
//             <>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </>
//           )}

//           {providerInfo && (
//             <View style={styles.card}>
//               <Text style={styles.sectionTitle}>Your Service Pro</Text>
//               {providerInfo.profilePicture && (
//                 <Image
//                   source={{ uri: providerInfo.profilePicture }}
//                   style={{
//                     width: 80,
//                     height: 80,
//                     borderRadius: 40,
//                     alignSelf: "center",
//                   }}
//                 />
//               )}
//               <Text style={{ fontWeight: "bold", fontSize: 16 }}>
//                 {providerInfo.name}
//               </Text>
//               <Text>{providerInfo.businessName}</Text>
//               <Text>{providerInfo.aboutMe}</Text>
//             </View>
//           )}
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
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 24,
//     backgroundColor: "#fff",
//     marginTop: 50,
//   },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
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

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.25;

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
//     const socket = io(api.defaults.baseURL.replace(/\/api$/, ""), {
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

//         if (data.acceptedProvider) {
//           try {
//             const { data: provider } = await api.get(
//               `/users/${data.acceptedProvider}`
//             );
//             setProviderInfo({
//               name: provider.name,
//               businessName: provider.businessName,
//               aboutMe: provider.aboutMe,
//               profilePictureUrl: provider.profilePictureUrl || null,
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
//       <BackButton />
//       <View style={styles.containerLogo}>
//         <Image
//           source={require("../assets/blinqfix_logo-new.jpeg")}
//           style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginHorizontal: 120 }}
//           resizeMode="contain"
//         />
//       </View>
//       <Text>{"\n"}</Text>
//       <Text style={styles.title}>Your Job Status</Text>
//       <Text style={{ marginBottom: 16 }}>Status: {job.status}</Text>

//       {/* {providerInfo && (
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Your Service Pro</Text>
//           {providerInfo.profilePictureUrl && (
//             <Image
//               source={{ uri: providerInfo.profilePictureUrl }}
//               style={{ width: 80, height: 80, borderRadius: 40, alignSelf: "center" }}
//             />
//           )}
//           <Text style={{ fontWeight: "bold", fontSize: 16 }}>{providerInfo.name}</Text>
//           <Text>{providerInfo.businessName}</Text>
//           <Text>{providerInfo.aboutMe}</Text>
//         </View>
//       )} */}

//       {job.status === "accepted" && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>
//             Your emergency service pro is now in route
//           </Text>
//           <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
//             Make the necessary preparations. Put away pets, ensure gate access,
//             and prepare directions if needed.
//           </Text>
//           {description && (
//             <>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </>
//           )}

//           {providerInfo && (
//             <View style={styles.card}>
//               <Text style={styles.sectionTitle}>Your Service Pro</Text>
//               {providerInfo.profilePictureUrl && (
//                 <Image
//                   source={{ uri: providerInfo.profilePictureUrl }}
//                   style={{
//                     width: 80,
//                     height: 80,
//                     borderRadius: 40,
//                     alignSelf: "center",
//                   }}
//                 />
//               )}
//               <Text style={{ fontWeight: "bold", fontSize: 16 }}>
//                 {providerInfo.name}
//               </Text>
//               <Text>{providerInfo.businessName}</Text>
//               <Text>{providerInfo.aboutMe}</Text>
//             </View>
//           )}
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
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 24,
//     backgroundColor: "#fff",
//     marginTop: 50,
//   },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
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

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.25;

// export default function CustomerJobStatus() {
//   const { jobId } = useRoute().params;
//   const navigation = useNavigation();

//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [confirming, setConfirming] = useState(false);
//   const [providerInfo, setProviderInfo] = useState(null);
//   const details = job?.details ?? {};
//   const description = details.issue ? getCoveredDescription(details.issue) : null;

//   useEffect(() => {
//     const socket = io(api.defaults.baseURL.replace(/\/api$/, ""), {
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

//         if (data.acceptedProvider) {
//           console.log("Fetching provider info for:", data.acceptedProvider);
//           try {
//             const { data: provider } = await api.get(`/users/${data.acceptedProvider}`);
//             console.log("Provider data:", provider);
//             setProviderInfo({
//               name: provider.name,
//               businessName: provider.businessName,
//               aboutMe: provider.aboutMe,
//               profilePictureUrl: provider.profilePicture || null,
//             });
//             console.log("ProviedrInfo: >>>>", providerInfo)
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
//       <BackButton />
//       <View style={styles.containerLogo}>
//         <Image
//           source={require("../assets/blinqfix_logo-new.jpeg")}
//           style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginHorizontal: 120 }}
//           resizeMode="contain"
//         />
//       </View>
//       <Text>{"\n"}</Text>
//       <Text style={styles.title}>Your Job Status</Text>
//       <Text style={{ marginBottom: 16 }}>Status: {job.status}</Text>

//       {providerInfo && job.status === "accepted" && (
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Your Service Pro</Text>
//           {providerInfo.profilePictureUrl && (
//             <Image
//               source={{ uri: providerInfo.profilePictureUrl }}
//               style={{ width: 80, height: 80, borderRadius: 40, alignSelf: "center" }}
//             />
//           )}
//           <Text style={{ fontWeight: "bold", fontSize: 16 }}>{providerInfo.name}</Text>
//           <Text>{providerInfo.businessName}</Text>
//           <Text>{providerInfo.aboutMe}</Text>
//         </View>
//       )}

//       {job.status === "accepted" && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>
//             Your emergency service pro is now in route
//           </Text>
//           <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
//             Make the necessary preparations. Put away pets, ensure gate access,
//             and prepare directions if needed.
//           </Text>
//           {description && (
//             <>
//               <Text style={styles.sectionTitle}>What’s Covered:</Text>
//               <Text style={styles.descriptionText}>{description}</Text>
//             </>
//           )}
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
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 24,
//     backgroundColor: "#fff",
//     marginTop: 50,
//   },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
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
//working for
import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import io from "socket.io-client";
import api from "../api/client";
import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
import BackButton from "../components/BackButton";
import { saveSession } from "../utils/sessionManager";

const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.55;

export default function CustomerJobStatus() {
  const { jobId } = useRoute().params;
  const navigation = useNavigation();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [providerInfo, setProviderInfo] = useState(null);
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
    const socket = io(api.defaults.baseURL.replace(/\/api$/, ""), {
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

    return () => socket.disconnect();
  }, [jobId, navigation]);

  useEffect(() => {
    let alive = true;

    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
        if (!alive) return;
        setJob(data);

        if (data.acceptedProvider && data.status === "accepted") {
          try {
            const res = await api.get(`/users/${data.acceptedProvider}`);
            const provider = res.data;
            // console.log("Provider data:", provider);
            setProviderInfo({
              name: provider.name,
              businessName: provider.businessName,
              aboutMe: provider.aboutMe,
              profilePictureUrl: provider.profilePicture || null,
              averageRating: provider.averageRating ?? null,
            });
          } catch (err) {
            console.warn("Could not load provider info", err);
          }
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

  useEffect(() => {
    if (job?.status === "completed") {
      Alert.alert("Job Complete", "Thank you! Please rate your provider.", [
        {
          text: "OK",
          onPress: () => navigation.replace("RateProvider", { jobId }),
        },
      ]);
    }
  }, [job?.status, navigation]);

  const handleCustomerComplete = async () => {
    setConfirming(true);
    try {
      const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
      setJob(data);
    } catch {
      Alert.alert("Error", "Could not confirm completion");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;
  if (!job) return <Text style={styles.center}>Job not found.</Text>;

  const subtotal =
    (job.baseAmount || 0) +
    (job.adjustmentAmount || 0) +
    (job.rushFee || 0) +
    (job.additionalCharge || 0);
  const convFee =
    job.convenienceFee ??
    Math.round((subtotal * 0.07 + Number.EPSILON) * 100) / 100;
  const totalDue = job.estimatedTotal ?? subtotal + convFee;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <BackButton /> */}
      <View style={styles.containerLogo}>
        <Image
          source={require("../assets/blinqfix_logo-new.jpeg")}
          style={{
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            justifyContent: "center",
            alignItems: "center",
            marginInline: "auto",
          }}
          resizeMode="contain"
        />
      </View>
      <Text>{"\n"}</Text>
      <Text style={styles.title}>Job Status</Text>
      <Text style={{ marginBottom: 16 }}>Status: {job.status}</Text>

      {providerInfo && job.status === "accepted" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Service Pro</Text>
          {providerInfo.profilePictureUrl && (
            <Image
              source={{ uri: providerInfo.profilePictureUrl }}
              style={{
                width: 160,
                height: 160,
                borderRadius: 100,
                alignSelf: "center",
              }}
            />
          )}
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {providerInfo.name}
          </Text>
          <Text>{providerInfo.businessName}</Text>
          <Text>{providerInfo.aboutMe}</Text>
          <Text>
            Rating:{" "}
            {"★".repeat(Math.round(providerInfo.averageRating)) +
              "★".repeat(5 - Math.round(providerInfo.averageRating))}{" "}
            
          </Text>
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

      {(job.status === "pending" || job.status === "invited") && (
        <View style={styles.waiting}>
          <Text style={styles.heading}>Please Wait…</Text>
          <Text>
            Your BlinqFix emergency request has been sent to a local
            professional.
          </Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  pending: {
    padding: 12,
    backgroundColor: "#fff3e0",
    borderRadius: 6,
    marginBottom: 16,
  },
  pendingText: { color: "orange", fontWeight: "600", marginBottom: 4 },
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
  confirmText: {
    marginBottom: 10,
    fontSize: 15,
  },
  confirmButton: {
    backgroundColor: "#1976d2",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#999",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
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
});
