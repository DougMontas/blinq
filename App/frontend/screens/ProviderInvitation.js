// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   Alert,
//   Image,
//   Dimensions,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Vibration,
//   Platform,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import JobDetails from "../components/JobDetails";
// import api from "../api/client";
// import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
// import { Audio } from "expo-av";
// import * as Notifications from "expo-notifications";
// import BackButton from "../components/BackButton";
// import ScreenWrapper from "../components/ScreenWrapper";

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// export default function ProviderInvitationScreen() {
//   const { jobId, invitationExpiresAt, clickable } = useRoute().params;
//   const navigation = useNavigation();

//   const [remaining, setRemaining] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [job, setJob] = useState(null);
//   const [jobLoading, setJobLoading] = useState(true);

//   useEffect(() => {
//     if (!invitationExpiresAt) return;
//     const expiry = Date.parse(invitationExpiresAt);
//     const tick = () => {
//       const secs = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
//       setRemaining(secs);
//     };
//     tick();
//     const iv = setInterval(tick, 1000);
//     return () => clearInterval(iv);
//   }, [invitationExpiresAt]);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         if (!jobId) throw new Error("Missing jobId param");
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (alive) setJob(data);

//         if (clickable || !clickable) {
//           try {
//             const { sound } = await Audio.Sound.createAsync(
//               require("../assets/notification.mp3")
//             );
//             await sound.playAsync();
//             Vibration.vibrate(1000);

//             await Notifications.scheduleNotificationAsync({
//               content: {
//                 title: "New Job Invitation",
//                 body: "Expires in 5 minutes",
//                 sound: "default",
//               },
//               trigger: null,
//             });
//           } catch (e) {
//             console.warn("🔈 Failed to play sound or schedule notification", e);
//           }
//         }
//       } catch (err) {
//         console.error("❌ Error fetching job details:", err);
//         Alert.alert("Error", "Failed to load job details.");
//       } finally {
//         if (alive) setJobLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [jobId]);

//   const fmt = (s) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
//       2,
//       "0"
//     )}`;

//   const handleAccept = async () => {
//     setLoading(true);
//     try {
//       await api.put(`/jobs/${jobId}/accept`);
//       Alert.alert("Accepted", "You’ve claimed this job.", [
//         {
//           text: "OK",
//           onPress: () => navigation.replace("ProviderJobStatus", { jobId }),
//         },
//       ]);
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", err.response?.data?.msg || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDecline = async () => {
//     setLoading(true);
//     try {
//       await api.put(`/jobs/${jobId}/deny`);
//       Alert.alert("Declined", "You’ve passed on this invitation.", [
//         {
//           text: "OK",
//           onPress: () => navigation.replace("ServiceProviderDashboard"),
//         },
//       ]);
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", err.response?.data?.msg || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getCoveredDescriptionFromJob = (job) => {
//     if (!job) return "No job data available.";
//     const key = job.details?.issue || job.service || job.category;
//     if (!key) return "Service key not available.";
//     const matched = Object.entries(serviceMatrix.coveredDescriptions).find(
//       ([k]) => k.toLowerCase().trim() === key.toLowerCase().trim()
//     );
//     return matched ? matched[1] : `No description found for service: "${key}"`;
//   };

//   const coveredText = getCoveredDescriptionFromJob(job);
//   const isTeaser = !clickable;

//   return (
//     <ScreenWrapper>
//       <ScrollView contentContainerStyle={styles.container}>
//         <BackButton />
//         <View style={styles.containerLogo}>
//           <Image
//             source={require("../assets/blinqfix_logo-new.jpeg")}
//             style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
//             resizeMode="contain"
//           />
//         </View>

//         <Text style={styles.header}>New Job Invitation</Text>

//         {remaining != null && (
//           <Text style={styles.timer}>
//             {remaining > 0
//               ? `Expires in ${fmt(remaining)}`
//               : "Invitation expired"}
//           </Text>
//         )}

//         {jobLoading ? (
//           <ActivityIndicator style={{ marginTop: 20 }} />
//         ) : job ? (
//           <>
//             <JobDetails job={job} isTeaser={isTeaser} />
//             <View style={styles.coveredContainer}>
//               <Text style={styles.coveredTitle}>What's Covered:</Text>
//               <Text style={styles.coveredText}>{coveredText}</Text>
//             </View>
//           </>
//         ) : (
//           <Text style={{ textAlign: "center", color: "red", marginTop: 20 }}>
//             Job not found or failed to load.
//           </Text>
//         )}

//         {loading ? (
//           <ActivityIndicator style={{ marginTop: 20 }} />
//         ) : (
//           <View style={styles.buttons}>
//             <TouchableOpacity
//               style={[styles.button, !clickable && styles.buttonDisabled]}
//               onPress={handleAccept}
//               disabled={!clickable}
//             >
//               <Text style={styles.buttonText}>Accept</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.button,
//                 styles.declineButton,
//                 remaining === 0 && styles.buttonDisabled,
//               ]}
//               onPress={handleDecline}
//               disabled={remaining === 0}
//             >
//               <Text style={styles.buttonText}>Decline</Text>
//             </TouchableOpacity>

//             {!clickable && (
//               <TouchableOpacity
//                 style={[styles.button, { backgroundColor: "#fbc02d" }]}
//                 onPress={() => navigation.navigate("MyAccountScreen")}
//               >
//                 <Text style={styles.buttonText}>Upgrade & Accept</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         )}
//       </ScrollView>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 10, backgroundColor: "#fff", marginTop: 50 },
//   containerLogo: {
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 12,
//     textAlign: "center",
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
//   },
//   timer: {
//     textAlign: "center",
//     marginBottom: 16,
//     fontSize: 16,
//     color: "red",
//     fontWeight: "bold",
//   },
//   buttons: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-around",
//     marginTop: 20,
//     paddingBottom: 100,
//   },
//   button: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderRadius: 6,
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   declineButton: {
//     backgroundColor: "#d32f2f",
//   },
//   buttonDisabled: {
//     backgroundColor: "#999",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   coveredContainer: {
//     marginTop: 20,
//     paddingHorizontal: 16,
//   },
//   coveredTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     textAlign: "center",
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
//   },
//   coveredText: {
//     fontSize: 14,
//     color: "#444",
//     marginTop: 4,
//     textAlign: "center",
//   },
// });

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Vibration,
//   Platform,
//   SafeAreaView,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   Clock,
//   Check,
//   X,
//   AlertTriangle,
//   ArrowLeft,
//   DollarSign,
//   MapPin,
//   Wrench,
//   ClipboardList,
//   Star,
//   Bell,
// } from "lucide-react-native";
// import api from "../api/client";
// import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
// import * as Notifications from "expo-notifications";
// import JobDetails from "../components/JobDetails"; // Assuming this component is flexible or we might need to adjust it

// export default function ProviderInvitationScreen() {
//   const { jobId, invitationExpiresAt, clickable } = useRoute().params;
//   const navigation = useNavigation();

//   const [remaining, setRemaining] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [job, setJob] = useState(null);
//   const [jobLoading, setJobLoading] = useState(true);

//   useEffect(() => {
//     async function triggerVibration() {
//       try {
//         Vibration.vibrate([500, 500, 500]);
//       } catch (e) {
//         console.warn("📳 Failed to vibrate", e);
//       }
//     }

//     if (clickable) {
//       triggerVibration();
//     }
//   }, [clickable]);

//   useEffect(() => {
//     if (!invitationExpiresAt) return;
//     const expiry = Date.parse(invitationExpiresAt);
//     const tick = () => {
//       const secs = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
//       setRemaining(secs);
//       if (secs === 0) {
//         // Optional: Navigate away or show expired message more prominently
//       }
//     };
//     tick();
//     const iv = setInterval(tick, 1000);
//     return () => clearInterval(iv);
//   }, [invitationExpiresAt]);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         if (!jobId) throw new Error("Missing jobId param");
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (alive) setJob(data);
//       } catch (err) {
//         console.error("❌ Error fetching job details:", err);
//         Alert.alert("Error", "Failed to load job details.");
//       } finally {
//         if (alive) setJobLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [jobId]);

//   const fmt = (s) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
//       2,
//       "0"
//     )}`;

//   const handleAccept = async () => {
//     setLoading(true);
//     try {
//       await api.put(`/jobs/${jobId}/accept`);
//       Alert.alert("Accepted", "You’ve claimed this job.", [
//         {
//           text: "OK",
//           onPress: () => navigation.replace("ProviderJobStatus", { jobId }),
//         },
//       ]);
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", err.response?.data?.msg || "Could not accept job.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDecline = async () => {
//     setLoading(true);
//     try {
//       await api.put(`/jobs/${jobId}/deny`);
//       Alert.alert("Declined", "You’ve passed on this invitation.", [
//         {
//           text: "OK",
//           onPress: () => navigation.replace("ServiceProviderDashboard"),
//         },
//       ]);
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", err.response?.data?.msg || "Could not decline job.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getCoveredDescriptionFromJob = (job) => {
//     if (!job) return "No job data available.";
//     const key = job.details?.issue || job.service || job.category;
//     if (!key) return "Service key not available.";
//     const matched = Object.entries(serviceMatrix.coveredDescriptions).find(
//       ([k]) => k.toLowerCase().trim() === key.toLowerCase().trim()
//     );
//     return matched ? matched[1] : `No description found for service: "${key}"`;
//   };

//   const coveredText = getCoveredDescriptionFromJob(job);
//   const isTeaser = !clickable;
//   const isExpired = remaining === 0;

//   if (jobLoading) {
//     return (
//       <LinearGradient
//         colors={["#0f172a", "#1e3a8a", "#312e81"]}
//         style={styles.centered}
//       >
//         <ActivityIndicator size="large" color="#fff" />
//         <Text style={styles.loadingText}>Loading Job Invitation...</Text>
//       </LinearGradient>
//     );
//   }

//   return (
//     <LinearGradient
//       colors={["#0f172a", "#1e3a8a", "#312e81"]}
//       style={styles.container}
//     >
//       <SafeAreaView style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity
//               onPress={() => navigation.goBack()}
//               style={styles.backButton}
//             >
//               <ArrowLeft color="#fff" size={24} />
//             </TouchableOpacity>
//             <View style={styles.headerCenter}>
//               <View style={styles.headerBadge}>
//                 <Bell color="#facc15" size={16} />
//                 <Text style={styles.headerBadgeText}>New Job Invitation</Text>
//               </View>
//             </View>
//             <View style={{ width: 44 }} />
//           </View>

//           {/* Timer Card */}
//           <View
//             style={[styles.timerCard, isExpired && styles.timerCardExpired]}
//           >
//             <LinearGradient
//               colors={
//                 isExpired
//                   ? ["rgba(239, 68, 68, 0.2)", "rgba(220, 38, 38, 0.1)"]
//                   : ["rgba(250, 204, 21, 0.2)", "rgba(234, 179, 8, 0.1)"]
//               }
//               style={styles.timerGradient}
//             >
//               <Clock color={isExpired ? "#ef4444" : "#facc15"} size={28} />
//               <Text
//                 style={[styles.timerText, isExpired && styles.timerTextExpired]}
//               >
//                 {isExpired
//                   ? "Invitation Expired"
//                   : `Expires in ${fmt(remaining)}`}
//               </Text>
//             </LinearGradient>
//           </View>

//           {job ? (
//             <>
//               {/* Job Details Card */}
//               <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                   <Wrench color="#60a5fa" size={24} />
//                   <Text style={styles.cardTitle}>Job Details</Text>
//                 </View>
//                 <View style={styles.detailRow}>
//                   <Text style={styles.detailLabel}>Service</Text>
//                   <Text style={styles.detailValue}>{job.service}</Text>
//                 </View>
//                 <View style={styles.detailRow}>
//                   <Text style={styles.detailLabel}>Location</Text>
//                   <Text style={styles.detailValue}>
//                     {job.address}, {job.serviceCity}
//                   </Text>
//                 </View>
//                 <View style={styles.detailRow}>
//                   <MapPin
//                     color="#e0e7ff"
//                     size={16}
//                     style={{ marginRight: 8 }}
//                   />
//                   <Text style={styles.detailValue}>
//                     {job.distanceFromProvider
//                       ? `${job.distanceFromProvider.toFixed(1)} miles away`
//                       : "Calculating distance..."}
//                   </Text>
//                 </View>
//               </View>

//               {/* Earnings Card */}
//               <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                   <DollarSign color="#22c55e" size={24} />
//                   <Text style={styles.cardTitle}>Potential Earnings</Text>
//                 </View>
//                 <Text style={styles.earningsAmount}>
//                   $
//                   {job.estimatedTotal
//                     ? (job.estimatedTotal * 0.7).toFixed(2)
//                     : "N/A"}
//                 </Text>
//                 <Text style={styles.earningsSubtext}>
//                   Estimated Payout (after 30% platform fee)
//                 </Text>
//               </View>

//               {/* Covered Work */}
//               <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                   <ClipboardList color="#c084fc" size={24} />
//                   <Text style={styles.cardTitle}>What's Covered</Text>
//                 </View>
//                 <Text style={styles.coveredText}>{coveredText}</Text>
//               </View>
//             </>
//           ) : (
//             <View style={styles.card}>
//               <Text style={styles.errorText}>
//                 Job not found or failed to load.
//               </Text>
//             </View>
//           )}

//           {/* Action Buttons */}
//           <View style={styles.buttonContainer}>
//             {isTeaser && !isExpired ? (
//               <TouchableOpacity
//                 style={styles.upgradeButton}
//                 onPress={() => navigation.navigate("MyAccountScreen")}
//               >
//                 <LinearGradient
//                   colors={["#facc15", "#eab308"]}
//                   style={styles.buttonGradient}
//                 >
//                   <Star color="#fff" size={20} />
//                   <Text style={styles.buttonText}>Upgrade to Accept</Text>
//                 </LinearGradient>
//               </TouchableOpacity>
//             ) : (
//               <>
//                 <TouchableOpacity
//                   style={[
//                     styles.actionButton,
//                     styles.declineButton,
//                     (isExpired || loading) && styles.buttonDisabled,
//                   ]}
//                   onPress={handleDecline}
//                   disabled={isExpired || loading}
//                 >
//                   <X color="#f87171" size={24} />
//                   <Text style={[styles.buttonText, styles.declineButtonText]}>
//                     Decline
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={[
//                     styles.actionButton,
//                     styles.acceptButton,
//                     (isExpired || loading) && styles.buttonDisabled,
//                   ]}
//                   onPress={handleAccept}
//                   disabled={isExpired || loading}
//                 >
//                   <LinearGradient
//                     colors={["#22c55e", "#16a34a"]}
//                     style={styles.buttonGradient}
//                   >
//                     <Check color="#fff" size={24} />
//                     <Text style={styles.buttonText}>
//                       {loading ? "Processing..." : "Accept Job"}
//                     </Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </>
//             )}
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     color: "#fff",
//     marginTop: 16,
//     fontSize: 16,
//   },
//   scrollContent: {
//     padding: 20,
//     paddingBottom: 40,
//     marginTop: 40,
//     marginBottom: 40,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
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
//   headerCenter: {
//     alignItems: "center",
//   },
//   headerBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(250, 204, 21, 0.1)",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: "rgba(250, 204, 21, 0.3)",
//   },
//   headerBadgeText: {
//     color: "#facc15",
//     marginLeft: 8,
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   timerCard: {
//     marginBottom: 20,
//     borderRadius: 16,
//     overflow: "hidden",
//   },
//   timerCardExpired: {
//     borderColor: "rgba(239, 68, 68, 0.3)",
//   },
//   timerGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 16,
//     gap: 12,
//   },
//   timerText: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#facc15",
//   },
//   timerTextExpired: {
//     color: "#ef4444",
//   },
//   card: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   cardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#fff",
//     marginLeft: 12,
//   },
//   detailRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: "rgba(255,255,255,0.1)",
//   },
//   detailLabel: {
//     fontSize: 16,
//     color: "#e0e7ff",
//     fontWeight: "600",
//   },
//   detailValue: {
//     fontSize: 16,
//     color: "#fff",
//     flex: 1,
//     textAlign: "right",
//   },
//   earningsAmount: {
//     fontSize: 36,
//     fontWeight: "900",
//     color: "#22c55e",
//     textAlign: "center",
//   },
//   earningsSubtext: {
//     fontSize: 14,
//     color: "#e0e7ff",
//     textAlign: "center",
//     marginTop: 4,
//   },
//   coveredText: {
//     fontSize: 16,
//     color: "#e0e7ff",
//     lineHeight: 24,
//   },
//   errorText: {
//     color: "#f87171",
//     fontSize: 16,
//     textAlign: "center",
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     marginTop: 20,
//     gap: 16,
//   },
//   actionButton: {
//     flex: 1,
//     borderRadius: 16,
//     overflow: "hidden",
//     // marginBottom:40,
//   },
//   acceptButton: { 
//     borderRadius: 16, 
//     marginBottom: 50 
//   },
//   declineButton: {
//     marginBottom: 40,
//     overflow: "hidden",
//     backgroundColor: "rgba(248, 113, 113, 0.1)",
//     borderWidth: 2,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 18,
//     gap: 12,
//     borderColor: "rgba(248, 113, 113, 0.3)",
//   },
//   buttonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 18,
//     gap: 8,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   declineButtonText: {
//     color: "#f87171",
//   },
//   buttonDisabled: {
//     opacity: 0.5,
//   },
//   upgradeButton: {
//     flex: 1,
//     borderRadius: 16,
//     overflow: "hidden",
//   },

// });

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Vibration,
//   Platform,
//   SafeAreaView,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   Clock,
//   Check,
//   X,
//   AlertTriangle,
//   ArrowLeft,
//   DollarSign,
//   MapPin,
//   Wrench,
//   ClipboardList,
//   Star,
//   Bell,
// } from "lucide-react-native";
// import api from "../api/client";
// import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
// import * as Notifications from "expo-notifications";
// import JobDetails from "../components/JobDetails";

// const BTN_HEIGHT = 56; // single source of truth for button height

// // Reusable uniform gradient button
// function GradientButton({ colors, onPress, disabled, icon: Icon, text }) {
//   return (
//     <TouchableOpacity
//       style={[styles.actionButton, disabled && styles.buttonDisabled]}
//       onPress={onPress}
//       activeOpacity={0.8}
//       disabled={disabled}
//     >
//       <LinearGradient colors={colors} style={styles.buttonGradient}>
//         {Icon ? <Icon color="#fff" size={22} /> : null}
//         <Text style={styles.buttonText}>{text}</Text>
//       </LinearGradient>
//     </TouchableOpacity>
//   );
// }

// export default function ProviderInvitationScreen() {
//   const { jobId, invitationExpiresAt, clickable } = useRoute().params;
//   const navigation = useNavigation();

//   const [remaining, setRemaining] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [job, setJob] = useState(null);
//   const [jobLoading, setJobLoading] = useState(true);

//   useEffect(() => {
//     async function triggerVibration() {
//       try {
//         Vibration.vibrate([500, 500, 500]);
//       } catch (e) {
//         console.warn("📳 Failed to vibrate", e);
//       }
//     }
//     if (clickable) triggerVibration();
//   }, [clickable]);

//   useEffect(() => {
//     if (!invitationExpiresAt) return;
//     const expiry = Date.parse(invitationExpiresAt);
//     const tick = () => {
//       const secs = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
//       setRemaining(secs);
//     };
//     tick();
//     const iv = setInterval(tick, 1000);
//     return () => clearInterval(iv);
//   }, [invitationExpiresAt]);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         if (!jobId) throw new Error("Missing jobId param");
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (alive) setJob(data);
//       } catch (err) {
//         console.error("❌ Error fetching job details:", err);
//         Alert.alert("Error", "Failed to load job details.");
//       } finally {
//         if (alive) setJobLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [jobId]);

//   const fmt = (s) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

//   const handleAccept = async () => {
//     setLoading(true);
//     try {
//       await api.put(`/jobs/${jobId}/accept`);
//       Alert.alert("Accepted", "You’ve claimed this job.", [
//         { text: "OK", onPress: () => navigation.replace("ProviderJobStatus", { jobId }) },
//       ]);
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", err.response?.data?.msg || "Could not accept job.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDecline = async () => {
//     setLoading(true);
//     try {
//       await api.put(`/jobs/${jobId}/deny`);
//       Alert.alert("Declined", "You’ve passed on this invitation.", [
//         { text: "OK", onPress: () => navigation.replace("ServiceProviderDashboard") },
//       ]);
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", err.response?.data?.msg || "Could not decline job.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getCoveredDescriptionFromJob = (job) => {
//     if (!job) return "No job data available.";
//     const key = job.details?.issue || job.service || job.category;
//     if (!key) return "Service key not available.";
//     const matched = Object.entries(serviceMatrix.coveredDescriptions).find(
//       ([k]) => k.toLowerCase().trim() === key.toLowerCase().trim()
//     );
//     return matched ? matched[1] : `No description found for service: "${key}"`;
//   };

//   const coveredText = getCoveredDescriptionFromJob(job);
//   const isTeaser = !clickable;
//   const isExpired = remaining === 0;

//   if (jobLoading) {
//     return (
//       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.centered}>
//         <ActivityIndicator size="large" color="#fff" />
//         <Text style={styles.loadingText}>Loading Job Invitation...</Text>
//       </LinearGradient>
//     );
//   }

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
//                 <Bell color="#facc15" size={16} />
//                 <Text style={styles.headerBadgeText}>New Job Invitation</Text>
//               </View>
//             </View>
//             <View style={{ width: 44 }} />
//           </View>

//           {/* Timer Card */}
//           <View style={[styles.timerCard, isExpired && styles.timerCardExpired]}>
//             <LinearGradient
//               colors={
//                 isExpired
//                   ? ["rgba(239, 68, 68, 0.2)", "rgba(220, 38, 38, 0.1)"]
//                   : ["rgba(250, 204, 21, 0.2)", "rgba(234, 179, 8, 0.1)"]
//               }
//               style={styles.timerGradient}
//             >
//               <Clock color={isExpired ? "#ef4444" : "#facc15"} size={28} />
//               <Text style={[styles.timerText, isExpired && styles.timerTextExpired]}>
//                 {isExpired ? "Invitation Expired" : `Expires in ${fmt(remaining)}`}
//               </Text>
//             </LinearGradient>
//           </View>

//           {job ? (
//             <>
//               {/* Job Details Card */}
//               <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                   <Wrench color="#60a5fa" size={24} />
//                   <Text style={styles.cardTitle}>Job Details</Text>
//                 </View>
//                 <View style={styles.detailRow}>
//                   <Text style={styles.detailLabel}>Service</Text>
//                   <Text style={styles.detailValue}>{job.service}</Text>
//                 </View>
//                 <View style={styles.detailRow}>
//                   <Text style={styles.detailLabel}>Location</Text>
//                   <Text style={styles.detailValue}>
//                     {job.address}, {job.serviceCity}
//                   </Text>
//                 </View>
//                 <View style={styles.detailRow}>
//                   <MapPin color="#e0e7ff" size={16} style={{ marginRight: 8 }} />
//                   <Text style={styles.detailValue}>
//                     {job.distanceFromProvider
//                       ? `${job.distanceFromProvider.toFixed(1)} miles away`
//                       : "Calculating distance..."}
//                   </Text>
//                 </View>
//               </View>

//               {/* Earnings Card */}
//               <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                   <DollarSign color="#22c55e" size={24} />
//                   <Text style={styles.cardTitle}>Potential Earnings</Text>
//                 </View>
//                 <Text style={styles.earningsAmount}>
//                   ${job.estimatedTotal ? (job.estimatedTotal * 0.7).toFixed(2) : "N/A"}
//                 </Text>
//                 <Text style={styles.earningsSubtext}>Estimated Payout (after 30% platform fee)</Text>
//               </View>

//               {/* Covered Work */}
//               <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                   <ClipboardList color="#c084fc" size={24} />
//                   <Text style={styles.cardTitle}>What's Covered</Text>
//                 </View>
//                 <Text style={styles.coveredText}>{coveredText}</Text>
//               </View>
//             </>
//           ) : (
//             <View style={styles.card}>
//               <Text style={styles.errorText}>Job not found or failed to load.</Text>
//             </View>
//           )}

//           {/* Action Buttons */}
//           <View style={styles.buttonContainer}>
//             {isTeaser && !isExpired ? (
//               <GradientButton
//                 colors={["#facc15", "#eab308"]}
//                 onPress={() => navigation.navigate("MyAccountScreen")}
//                 disabled={false}
//                 icon={Star}
//                 text="Upgrade to Accept"
//               />
//             ) : (
//               <>
//                 <GradientButton
//                   colors={["#ef4444", "#dc2626"]}
//                   onPress={handleDecline}
//                   disabled={isExpired || loading}
//                   icon={X}
//                   text="Decline"
//                 />
//                 <GradientButton
//                   colors={["#22c55e", "#16a34a"]}
//                   onPress={handleAccept}
//                   disabled={isExpired || loading}
//                   icon={Check}
//                   text={loading ? "Processing..." : "Accept Job"}
//                 />
//               </>
//             )}
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },
//   loadingText: { color: "#fff", marginTop: 16, fontSize: 16 },
//   scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40, marginBottom: 40 },

//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
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
//   headerCenter: { alignItems: "center" },
//   headerBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(250, 204, 21, 0.1)",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: "rgba(250, 204, 21, 0.3)",
//   },
//   headerBadgeText: {
//     color: "#facc15",
//     marginLeft: 8,
//     fontSize: 16,
//     fontWeight: "bold",
//   },

//   timerCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
//   timerCardExpired: { borderColor: "rgba(239, 68, 68, 0.3)" },
//   timerGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 16,
//     gap: 12,
//   },
//   timerText: { fontSize: 22, fontWeight: "bold", color: "#facc15" },
//   timerTextExpired: { color: "#ef4444" },

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
//   detailRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: "rgba(255,255,255,0.1)",
//   },
//   detailLabel: { fontSize: 16, color: "#e0e7ff", fontWeight: "600" },
//   detailValue: { fontSize: 16, color: "#fff", flex: 1, textAlign: "right" },
//   earningsAmount: { fontSize: 36, fontWeight: "900", color: "#22c55e", textAlign: "center" },
//   earningsSubtext: { fontSize: 14, color: "#e0e7ff", textAlign: "center", marginTop: 4 },
//   coveredText: { fontSize: 16, color: "#e0e7ff", lineHeight: 24 },
//   errorText: { color: "#f87171", fontSize: 16, textAlign: "center" },

//   buttonContainer: {
//     flexDirection: "row",
//     gap: 16,
//     marginTop: 20,
//   },
//   actionButton: {
//     flex: 1,
//     borderRadius: 16,
//     overflow: "hidden",
//   },
//   buttonGradient: {
//     height: BTN_HEIGHT,
//     paddingHorizontal: 16,
//     borderRadius: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//   },
//   buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
//   buttonDisabled: { opacity: 0.6 },
// });


// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Vibration,
//   Platform,
//   SafeAreaView,
//   AppState,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   Clock,
//   Check,
//   X,
//   AlertTriangle, // Not used but in original imports, keeping it.
//   ArrowLeft,
//   DollarSign,
//   MapPin,
//   Wrench,
//   ClipboardList,
//   Star,
//   Bell,
// } from "lucide-react-native";
// import api from "../api/client";
// import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";
// import { Audio } from 'expo-av';
// import JobDetails from "../components/JobDetails"; // Keeping this import, though not directly used in the provided outline.

// const BTN_HEIGHT = 56; // single source of truth for button height

// // Configure notification handler for maximum alertness
// Notifications.setNotificationHandler({
//   handleNotification: async (notification) => {
//     console.log('🔔 Notification received:', notification.request.content);
    
//     // Check if this is a job invitation
//     const isJobInvite = notification.request.content.data?.type === 'job_invitation' ||
//                        notification.request.content.title?.includes('Job Invitation');
    
//     if (isJobInvite) {
//       // Play custom sound and vibrate for job invitations
//       try {
//         // Load and play urgent sound
//         // IMPORTANT: For production, prefer a local asset like require('../assets/bell-sound.mp3')
//         // Remote URLs might fail if network is an issue or server is down.
//         const { sound } = await Audio.Sound.createAsync(
//           { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
//           { shouldPlay: true, isLooping: false, volume: 1.0 }
//         );
        
//         // Urgent vibration pattern
//         Vibration.vibrate([0, 500, 200, 500, 200, 500]);
        
//         // Unload sound after playing to free up resources
//         // Ensure this doesn't conflict with background playback.
//         setTimeout(() => {
//           sound.unloadAsync().catch(e => console.warn('Error unloading sound in handler:', e));
//         }, 3000);
        
//       } catch (error) {
//         console.warn('Failed to play custom sound:', error);
//         // Fallback to default system sound if custom sound fails
//       }
//     }

//     return {
//       shouldShowAlert: true,
//       shouldPlaySound: true,
//       shouldSetBadge: true,
//       priority: isJobInvite ? 
//         Notifications.AndroidNotificationPriority.MAX : 
//         Notifications.AndroidNotificationPriority.HIGH,
//     };
//   },
// });

// // Reusable uniform gradient button
// function GradientButton({ colors, onPress, disabled, icon: Icon, text }) {
//   return (
//     <TouchableOpacity
//       style={[styles.actionButton, disabled && styles.buttonDisabled]}
//       onPress={onPress}
//       activeOpacity={0.8}
//       disabled={disabled}
//     >
//       <LinearGradient colors={colors} style={styles.buttonGradient}>
//         {Icon ? <Icon color="#fff" size={22} /> : null}
//         <Text style={styles.buttonText}>{text}</Text>
//       </LinearGradient>
//     </TouchableOpacity>
//   );
// }

// export default function ProviderInvitationScreen() {
//   const { jobId, invitationExpiresAt, clickable } = useRoute().params;
//   const navigation = useNavigation();

//   const [remaining, setRemaining] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [job, setJob] = useState(null);
//   const [jobLoading, setJobLoading] = useState(true);
//   const notificationListener = useRef();
//   const responseListener = useRef();
//   const appStateRef = useRef(AppState.currentState);
//   const soundObject = useRef(null);
//   const appStateSubscription = useRef(null);


//   // Initialize notifications and audio
//   useEffect(() => {
//     initializeNotifications();
//     setupAudio();
    
//     return () => {
//       cleanupNotifications();
//       cleanupAudio();
//       appStateSubscription.current?.remove(); // Cleanup AppState listener
//     };
//   }, []);

//   // Setup comprehensive notification system
//   const initializeNotifications = async () => {
//     try {
//       // Request permissions with detailed settings
//       if (Device.isDevice) {
//         const { status: existingStatus } = await Notifications.getPermissionsAsync();
//         let finalStatus = existingStatus;
        
//         if (existingStatus !== 'granted') {
//           const { status } = await Notifications.requestPermissionsAsync({
//             ios: {
//               allowAlert: true,
//               allowBadge: true,
//               allowSound: true,
//               allowAnnouncements: true,
//               allowCriticalAlerts: true, // For critical alerts
//             },
//             android: {
//               allowAlert: true,
//               allowBadge: true,
//               allowSound: true,
//               priority: Notifications.AndroidNotificationPriority.MAX,
//             }
//           });
//           finalStatus = status;
//         }
        
//         if (finalStatus !== 'granted') {
//           Alert.alert(
//             'Notifications Required',
//             'Please enable notifications to receive urgent job invitations. This ensures you never miss important opportunities.',
//             [
//               { text: 'Later', style: 'cancel' },
//               { text: 'Enable Now', onPress: () => Notifications.openSettingsAsync() }
//             ]
//           );
//           // If permissions are not granted, we cannot proceed with push token registration
//           return;
//         }

//         // Create high-priority notification channel for Android
//         if (Platform.OS === 'android') {
//           await Notifications.setNotificationChannelAsync('urgent-jobs', {
//             name: 'Urgent Job Invitations',
//             importance: Notifications.AndroidImportance.MAX,
//             vibrationPattern: [0, 250, 250, 250, 250, 250],
//             lightColor: '#FF231F7C',
//             sound: 'default', // Using default sound managed by the channel
//             enableVibrate: true,
//             showBadge: true,
//             lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, // Show on lock screen
//           });
//         }
//       }

//       // Get push token and register with backend (moved from old registerForPushNotificationsAsync)
//       try {
//         const token = (await Notifications.getExpoPushTokenAsync()).data;
//         console.log('📱 Push token:', token);
        
//         // Register token with your backend
//         await api.post('/users/push-token', { 
//           token,
//           type: 'expo',
//           platform: Platform.OS 
//         });
//       } catch (error) {
//         console.error('Failed to register push token with backend:', error);
//       }

//       // Set up notification listeners
//       notificationListener.current = Notifications.addNotificationReceivedListener(handleNotificationReceived);
//       responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
      
//       // Monitor app state changes
//       appStateSubscription.current = AppState.addEventListener('change', handleAppStateChange);
      
//     } catch (error) {
//       console.error('Failed to initialize notifications:', error);
//     }
//   };

//   const setupAudio = async () => {
//     try {
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: false,
//         staysActiveInBackground: true, // Keep audio active when app is in background
//         playsInSilentModeIOS: true, // Play sound even if silent switch is on iOS
//         shouldDuckAndroid: true, // Duck audio from other apps on Android
//         playThroughEarpieceAndroid: false, // Play through speaker
//       });
//     } catch (error) {
//       console.warn('Failed to setup audio:', error);
//     }
//   };

//   const handleNotificationReceived = async (notification) => {
//     console.log('🔔 Foreground notification received:', notification);
    
//     // Check if this is specifically a job invitation from the backend (not a reminder)
//     if (notification.request.content.data?.type === 'job_invitation') {
//       const newJobId = notification.request.content.data?.jobId;
      
//       // If it's a new job ID different from the current one, alert the user
//       if (newJobId && newJobId !== jobId) {
//         // Play urgent sound and vibrate
//         await playUrgentAlert();
        
//         // Show alert with option to view new job
//         Alert.alert(
//           '🚨 New Urgent Job!',
//           `A new ${notification.request.content.data?.service || 'emergency'} job is available nearby!`,
//           [
//             { text: 'Later', style: 'cancel' },
//             { 
//               text: 'View Job', 
//               onPress: () => {
//                 // Ensure sound is stopped before navigating if it's still playing
//                 cleanupAudio(); 
//                 navigation.replace('ProviderInvitationScreen', {
//                   jobId: newJobId,
//                   invitationExpiresAt: notification.request.content.data?.expiresAt,
//                   clickable: true
//                 });
//               }
//             }
//           ],
//           { cancelable: false }
//         );
//       }
//     }
//   };

//   const handleNotificationResponse = (response) => {
//     console.log('🔔 Notification response received:', response);
    
//     const notificationData = response.notification.request.content.data;
//     // Handle opening of job invitation or reminder notifications
//     if (notificationData?.type?.includes('job_invitation') && notificationData?.jobId) {
//       // Ensure sound is stopped before navigating if it's still playing
//       cleanupAudio();
//       navigation.replace('ProviderInvitationScreen', {
//         jobId: notificationData.jobId,
//         invitationExpiresAt: notificationData.expiresAt,
//         clickable: true
//       });
//     }
//   };

//   const handleAppStateChange = (nextAppState) => {
//     console.log('📱 App state changed:', appStateRef.current, '->', nextAppState);
    
//     if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
//       console.log('App has come to the foreground, cancelling pending job notifications.');
//       // App came to foreground - cancel any pending job notifications for this job
//       cancelJobNotifications();
//     } else if (nextAppState.match(/inactive|background/)) {
//       console.log('App going to background, scheduling reminders.');
//       // App going to background - schedule reminder notifications
//       scheduleBackgroundReminders();
//     }
    
//     appStateRef.current = nextAppState;
//   };

//   const playUrgentAlert = async () => {
//     try {
//       // Vibrate with urgent pattern
//       const urgentPattern = [0, 300, 100, 300, 100, 300, 100, 800];
//       Vibration.vibrate(urgentPattern);

//       // Try to play custom urgent sound
//       if (soundObject.current) {
//         await soundObject.current.unloadAsync();
//       }
      
//       // Use a remote URL or create the sound with a web-accessible URL
//       // For now, using a basic notification sound approach
//       try {
//         const { sound } = await Audio.Sound.createAsync(
//           { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
//           { 
//             shouldPlay: true, 
//             isLooping: false, 
//             volume: 1.0,
//             rate: 1.0,
//             shouldCorrectPitch: true,
//           }
//         );
        
//         soundObject.current = sound;
        
//         // Auto-cleanup after playing
//         setTimeout(async () => {
//           try {
//             if (soundObject.current) {
//               await soundObject.current.stopAsync();
//               await soundObject.current.unloadAsync();
//               soundObject.current = null;
//             }
//           } catch (e) {
//             console.warn('Error cleaning up sound:', e);
//           }
//         }, 5000);
//       } catch (soundError) {
//         console.warn('Failed to play remote sound:', soundError);
//         // If remote sound fails, just use vibration
//         Vibration.vibrate([0, 1000, 500, 1000]);
//       }
      
//     } catch (error) {
//       console.warn('Failed to play urgent alert:', error);
//       // Fallback to basic vibration
//       Vibration.vibrate([0, 1000, 500, 1000]);
//     }
//   };

//   const scheduleBackgroundReminders = async () => {
//     // Only schedule if there's time remaining
//     if (!remaining || remaining <= 0) {
//       console.log('No time remaining or job expired, not scheduling reminders.');
//       return;
//     }
    
//     try {
//       // Cancel existing reminders for this job to avoid duplicates
//       await cancelJobNotifications();
      
//       // Schedule immediate background notification (e.g., 5 seconds from now)
//       // This acts as an initial alert when the app is backgrounded
//       await Notifications.scheduleNotificationAsync({
//         content: {
//           title: '⏰ Job Invitation Waiting!',
//           body: job ? `${job.service} job expires in ${Math.floor(remaining/60)}m ${remaining%60}s - Don't miss out!` : 'Job invitation expiring soon!',
//           sound: 'default', // Uses channel sound or default system sound
//           priority: Notifications.AndroidNotificationPriority.MAX,
//           data: { 
//             type: 'job_invitation_background',
//             jobId,
//             expiresAt: invitationExpiresAt,
//             service: job?.service 
//           },
//         },
//         trigger: { seconds: 5 }, // Triggers quickly
//         identifier: `job_background_${jobId}`,
//       });

//       // Schedule another reminder 30 seconds before expiry if enough time remains
//       const reminderTime = Math.max(remaining - 30, 10); // Minimum 10 seconds to allow for notification display
//       if (reminderTime > 5) { // Ensure it's scheduled after the immediate one
//         await Notifications.scheduleNotificationAsync({
//           content: {
//             title: '🚨 Job Expiring Soon!',
//             body: `Last chance: ${job?.service || 'Job'} invitation expires in 30 seconds!`,
//             sound: 'default',
//             priority: Notifications.AndroidNotificationPriority.MAX,
//             data: { 
//               type: 'job_invitation_urgent',
//               jobId,
//               expiresAt: invitationExpiresAt,
//               service: job?.service 
//             },
//           },
//           trigger: { seconds: reminderTime },
//           identifier: `job_urgent_${jobId}`,
//         });
//       }
      
//       console.log(`📅 Scheduled background reminders for job ${jobId}`);
      
//     } catch (error) {
//       console.error('Failed to schedule background reminders:', error);
//     }
//   };

//   const cancelJobNotifications = async () => {
//     try {
//       // Get all scheduled notifications
//       const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
//       // Cancel job invitation related notifications by identifier or data.jobId
//       for (const notification of scheduledNotifications) {
//         const data = notification.content.data;
//         if ((data?.type?.includes('job_invitation') || data?.type === 'job_invitation_reminder') && data?.jobId === jobId) {
//           await Notifications.cancelScheduledNotificationAsync(notification.identifier);
//           console.log(`Cancelled scheduled notification: ${notification.identifier}`);
//         }
//       }
      
//       // Dismiss any currently presented notifications that are job invitations
//       // This is important when the app comes to the foreground.
//       if (Platform.OS === 'ios') {
//         const presentedNotifications = await Notifications.getPresentedNotificationsAsync();
//         for (const notification of presentedNotifications) {
//           if (notification.request.content.data?.type?.includes('job_invitation') && notification.request.content.data?.jobId === jobId) {
//             await Notifications.dismissNotificationAsync(notification.request.identifier);
//             console.log(`Dismissed presented notification: ${notification.request.identifier}`);
//           }
//         }
//       } else { // Android can dismiss all presented
//         await Notifications.dismissAllNotificationsAsync();
//         console.log('Dismissed all presented notifications on Android.');
//       }

//       console.log(`🗑️ Cancelled specific notifications for job ${jobId}`);
//     } catch (error) {
//       console.error('Failed to cancel notifications:', error);
//     }
//   };

//   const cleanupNotifications = () => {
//     if (notificationListener.current) {
//       Notifications.removeNotificationSubscription(notificationListener.current);
//       notificationListener.current = null;
//     }
//     if (responseListener.current) {
//       Notifications.removeNotificationSubscription(responseListener.current);
//       responseListener.current = null;
//     }
//     // No need to cancel here, it's handled by handleAppStateChange when app comes to foreground.
//     // Or when job is accepted/declined, which calls cancelJobNotifications
//   };

//   const cleanupAudio = async () => {
//     if (soundObject.current) {
//       try {
//         await soundObject.current.stopAsync();
//         await soundObject.current.unloadAsync();
//         soundObject.current = null;
//       } catch (e) {
//         console.warn('Error unloading sound in cleanup:', e);
//       }
//     }
//   };

//   // Enhanced vibration and alert when invitation loads
//   useEffect(() => {
//     if (clickable && job) {
//       playUrgentAlert();
      
//       // Schedule background notifications if app goes to background shortly after initial load
//       const timeout = setTimeout(() => {
//         if (appStateRef.current.match(/inactive|background/)) {
//           console.log('App is in background shortly after job loaded, scheduling reminders.');
//           scheduleBackgroundReminders();
//         }
//       }, 2000); // Give app a moment to settle or determine its state
      
//       return () => clearTimeout(timeout);
//     }
//   }, [clickable, job]); // Re-run if job or clickable status changes

//   // Timer effect for invitation expiry
//   useEffect(() => {
//     if (!invitationExpiresAt) return;
//     const expiry = Date.parse(invitationExpiresAt);
//     const tick = () => {
//       const secs = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
//       setRemaining(secs);
//       if (secs === 0) {
//         // Optional: Navigate away or show expired message more prominently
//         console.log("Job invitation expired.");
//         // Consider cancelling all related notifications here as well
//         cancelJobNotifications();
//       }
//     };
//     tick(); // Initial call
//     const iv = setInterval(tick, 1000);
//     return () => clearInterval(iv);
//   }, [invitationExpiresAt]);

//   // Job details loading effect
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         if (!jobId) throw new Error("Missing jobId param");
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (alive) setJob(data);
//       } catch (err) {
//         console.error("❌ Error fetching job details:", err);
//         Alert.alert("Error", err.response?.data?.msg || "Failed to load job details.");
//       } finally {
//         if (alive) setJobLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [jobId]);

//   const fmt = (s) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
//       2,
//       "0"
//     )}`;

//   const handleAccept = async () => {
//     setLoading(true);
//     try {
//       // Cancel all related notifications for this job when accepted
//       await cancelJobNotifications();
//       cleanupAudio(); // Ensure any playing alert sound is stopped

//       await api.put(`/jobs/${jobId}/accept`);
//       Alert.alert("Accepted", "You’ve claimed this job.", [
//         {
//           text: "OK",
//           onPress: () => navigation.replace("ProviderJobStatus", { jobId }),
//         },
//       ]);
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", err.response?.data?.msg || "Could not accept job.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDecline = async () => {
//     setLoading(true);
//     try {
//       // Cancel all related notifications for this job when declined
//       await cancelJobNotifications();
//       cleanupAudio(); // Ensure any playing alert sound is stopped

//       await api.put(`/jobs/${jobId}/deny`);
//       Alert.alert("Declined", "You’ve passed on this invitation.", [
//         {
//           text: "OK",
//           onPress: () => navigation.replace("ServiceProviderDashboard"),
//         },
//       ]);
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", err.response?.data?.msg || "Could not decline job.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getCoveredDescriptionFromJob = (job) => {
//     if (!job) return "No job data available.";
//     const key = job.details?.issue || job.service || job.category;
//     if (!key) return "Service key not available.";
//     const matched = Object.entries(serviceMatrix.coveredDescriptions).find(
//       ([k]) => k.toLowerCase().trim() === key.toLowerCase().trim()
//     );
//     return matched ? matched[1] : `No description found for service: "${key}"`;
//   };

//   const coveredText = getCoveredDescriptionFromJob(job);
//   const isTeaser = !clickable;
//   const isExpired = remaining === 0;

//   if (jobLoading) {
//     return (
//       <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.centered}>
//         <ActivityIndicator size="large" color="#fff" />
//         <Text style={styles.loadingText}>Loading Job Invitation...</Text>
//       </LinearGradient>
//     )
//   }

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
//                 <Bell color="#facc15" size={16} />
//                 <Text style={styles.headerBadgeText}>New Job Invitation</Text>
//               </View>
//             </View>
//             <View style={{ width: 44 }} />
//           </View>

//           {/* Timer Card */}
//           <View style={[styles.timerCard, isExpired && styles.timerCardExpired]}>
//             <LinearGradient
//               colors={isExpired ? ['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.1)'] : ['rgba(250, 204, 21, 0.2)', 'rgba(234, 179, 8, 0.1)']}
//               style={styles.timerGradient}
//             >
//               <Clock color={isExpired ? "#ef4444" : "#facc15"} size={28} />
//               <Text style={[styles.timerText, isExpired && styles.timerTextExpired]}>
//                 {isExpired ? "Invitation Expired" : `Expires in ${fmt(remaining)}`}
//               </Text>
//             </LinearGradient>
//           </View>

//           {job ? (
//             <>
//             {/* Job Details Card */}
//             <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                     <Wrench color="#60a5fa" size={24} />
//                     <Text style={styles.cardTitle}>Job Details</Text>
//                 </View>
//                 <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Service</Text>
//                     <Text style={styles.detailValue}>{job.service}</Text>
//                 </View>
//                 <View style={styles.detailRow}>
//                     <Text style={styles.detailLabel}>Location</Text>
//                     <Text style={styles.detailValue}>{job.address}, {job.serviceCity}</Text>
//                 </View>
//                 <View style={styles.detailRow}>
//                     <MapPin color="#e0e7ff" size={16} style={{marginRight: 8}}/>
//                     <Text style={styles.detailValue}>{job.distanceFromProvider ? `${job.distanceFromProvider.toFixed(1)} miles away` : 'Calculating distance...'}</Text>
//                 </View>
//             </View>
            
//             {/* Earnings Card */}
//             <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                     <DollarSign color="#22c55e" size={24} />
//                     <Text style={styles.cardTitle}>Potential Earnings</Text>
//                 </View>
//                 <Text style={styles.earningsAmount}>${job.estimatedTotal ? (job.estimatedTotal * 0.7).toFixed(2) : 'N/A'}</Text>
//                 <Text style={styles.earningsSubtext}>Estimated Payout (after 30% platform fee)</Text>
//             </View>

//             {/* Covered Work */}
//             <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                     <ClipboardList color="#c084fc" size={24} />
//                     <Text style={styles.cardTitle}>What's Covered</Text>
//                 </View>
//                 <Text style={styles.coveredText}>{coveredText}</Text>
//             </View>
//             </>
//           ) : (
//             <View style={styles.card}>
//                 <Text style={styles.errorText}>Job not found or failed to load.</Text>
//             </View>
//           )}

//           {/* Action Buttons */}
//           <View style={styles.buttonContainer}>
//             {isTeaser && !isExpired ? (
//               <GradientButton
//                 colors={['#facc15', '#eab308']}
//                 onPress={() => navigation.navigate("MyAccountScreen")}
//                 disabled={loading}
//                 icon={Star}
//                 text="Upgrade to Accept"
//               />
//             ) : (
//               <>
//                 <TouchableOpacity
//                   style={[styles.actionButton, styles.declineButton, (isExpired || loading) && styles.buttonDisabled]}
//                   onPress={handleDecline}
//                   disabled={isExpired || loading}
//                 >
//                   <View style={[styles.buttonGradient, styles.declineButtonContent]}>
//                     <X color="#f87171" size={24} />
//                     <Text style={[styles.buttonText, styles.declineButtonText]}>Decline</Text>
//                   </View>
//                 </TouchableOpacity>

//                 <GradientButton
//                   colors={['#22c55e', '#16a34a']}
//                   onPress={handleAccept}
//                   disabled={isExpired || loading}
//                   icon={Check}
//                   text={loading ? 'Processing...' : 'Accept Job'}
//                 />
//               </>
//             )}
//           </View>
          
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     centered: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center'
//     },
//     loadingText: {
//         color: '#fff',
//         marginTop: 16,
//         fontSize: 16
//     },
//     scrollContent: {
//         padding: 20,
//         paddingBottom: 40,
//     },
//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 20,
//     },
//     backButton: {
//         backgroundColor: 'rgba(255,255,255,0.1)',
//         padding: 10,
//         borderRadius: 22,
//         width: 44,
//         height: 44,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     headerCenter: {
//         alignItems: 'center'
//     },
//     headerBadge: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: 'rgba(250, 204, 21, 0.1)',
//         paddingHorizontal: 16,
//         paddingVertical: 8,
//         borderRadius: 20,
//         borderWidth: 1,
//         borderColor: 'rgba(250, 204, 21, 0.3)'
//     },
//     headerBadgeText: {
//         color: '#facc15',
//         marginLeft: 8,
//         fontSize: 16,
//         fontWeight: 'bold',
//     },
//     timerCard: {
//         marginBottom: 20,
//         borderRadius: 16,
//         overflow: 'hidden',
//     },
//     timerCardExpired: {
//         borderColor: 'rgba(239, 68, 68, 0.3)',
//     },
//     timerGradient: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 16,
//         gap: 12
//     },
//     timerText: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: '#facc15',
//     },
//     timerTextExpired: {
//         color: '#ef4444'
//     },
//     card: {
//         backgroundColor: 'rgba(255,255,255,0.05)',
//         borderRadius: 16,
//         padding: 20,
//         marginBottom: 20,
//         borderWidth: 1,
//         borderColor: 'rgba(255,255,255,0.1)',
//     },
//     cardHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 16
//     },
//     cardTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#fff',
//         marginLeft: 12
//     },
//     detailRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'flex-start',
//         paddingVertical: 8,
//         borderBottomWidth: 1,
//         borderBottomColor: 'rgba(255,255,255,0.1)'
//     },
//     detailLabel: {
//         fontSize: 16,
//         color: '#e0e7ff',
//         fontWeight: '600'
//     },
//     detailValue: {
//         fontSize: 16,
//         color: '#fff',
//         flex: 1,
//         textAlign: 'right'
//     },
//     earningsAmount: {
//         fontSize: 36,
//         fontWeight: '900',
//         color: '#22c55e',
//         textAlign: 'center'
//     },
//     earningsSubtext: {
//         fontSize: 14,
//         color: '#e0e7ff',
//         textAlign: 'center',
//         marginTop: 4
//     },
//     coveredText: {
//         fontSize: 16,
//         color: '#e0e7ff',
//         lineHeight: 24,
//     },
//     errorText: {
//         color: '#f87171',
//         fontSize: 16,
//         textAlign: 'center'
//     },
//     buttonContainer: {
//         flexDirection: 'row',
//         marginTop: 20,
//         gap: 16, // Use gap for spacing
//     },
//     actionButton: {
//         flex: 1,
//         borderRadius: 16,
//         overflow: 'hidden',
//         height: BTN_HEIGHT, // Enforce uniform height
//         justifyContent: 'center', // Center content vertically
//     },
//     declineButton: {
//         backgroundColor: 'rgba(248, 113, 113, 0.1)',
//         borderWidth: 2,
//         borderColor: 'rgba(248, 113, 113, 0.3)',
//     },
//     declineButtonContent: {
//         backgroundColor: 'transparent', // Ensure LinearGradient does not overlap this background
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         height: '100%', // Take full height of parent TouchableOpacity
//         gap: 8,
//     },
//     buttonGradient: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         height: '100%', // Take full height of parent TouchableOpacity
//         gap: 8,
//         paddingVertical: 16, // This will be ignored due to height: '100%'
//     },
//     buttonText: {
//         color: '#fff',
//         fontSize: 16,
//         fontWeight: 'bold'
//     },
//     declineButtonText: {
//         color: '#f87171'
//     },
//     buttonDisabled: {
//         opacity: 0.5
//     },
//     // upgradeButton style is now largely covered by GradientButton,
//     // but leaving it in case there are other uses not evident in the outline.
//     upgradeButton: {
//       flex: 1,
//       borderRadius: 16,
//       overflow: 'hidden',
//       height: BTN_HEIGHT,
//       justifyContent: 'center',
//     }
// });



import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Vibration,
  Platform,
  SafeAreaView,
  AppState,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Clock,
  Check,
  X,
  AlertTriangle,
  ArrowLeft,
  DollarSign,
  MapPin,
  Wrench,
  ClipboardList,
  Star,
  Bell,
} from "lucide-react-native";
import api from "../api/client";
import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Audio } from 'expo-av';
import JobDetails from "../components/JobDetails";

const BTN_HEIGHT = 56; // single source of truth for button height

// Configure notification handler for maximum alertness
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('🔔 Notification received:', notification.request.content);
    
    // Check if this is a job invitation
    const isJobInvite = notification.request.content.data?.type === 'job_invitation' ||
                       notification.request.content.title?.includes('Job Invitation');
    
    if (isJobInvite) {
      // Play custom sound and vibrate for job invitations
      try {
        // Load and play urgent sound
        // IMPORTANT: For production, prefer a local asset like require('../assets/bell-sound.mp3')
        // Remote URLs might fail if network is an issue or server is down.
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
          { shouldPlay: true, isLooping: false, volume: 1.0 }
        );
        
        // Urgent vibration pattern
        Vibration.vibrate([0, 500, 200, 500, 200, 500]);
        
        // Unload sound after playing to free up resources
        // Ensure this doesn't conflict with background playback.
        setTimeout(() => {
          sound.unloadAsync().catch(e => console.warn('Error unloading sound in handler:', e));
        }, 3000);
        
      } catch (error) {
        console.warn('Failed to play custom sound:', error);
        // Fallback to default system sound if custom sound fails
      }
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: isJobInvite ? 
        Notifications.AndroidNotificationPriority.MAX : 
        Notifications.AndroidNotificationPriority.HIGH,
    };
  },
});

// Reusable uniform gradient button
function GradientButton({ colors, onPress, disabled, icon: Icon, text }) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, disabled && styles.buttonDisabled]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <LinearGradient colors={colors} style={styles.buttonGradient}>
        {Icon ? <Icon color="#fff" size={22} /> : null}
        <Text style={styles.buttonText}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function ProviderInvitationScreen() {
  const { jobId, invitationExpiresAt, clickable } = useRoute().params;
  const navigation = useNavigation();

  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);
  const notificationListener = useRef();
  const responseListener = useRef();
  const appStateRef = useRef(AppState.currentState);
  const soundObject = useRef(null);
  const appStateSubscription = useRef(null);


  // Initialize notifications and audio
  useEffect(() => {
    initializeNotifications();
    setupAudio();
    
    return () => {
      cleanupNotifications();
      cleanupAudio();
      appStateSubscription.current?.remove(); // Cleanup AppState listener
    };
  }, []);

  // Setup comprehensive notification system
  const initializeNotifications = async () => {
    try {
      // Request permissions with detailed settings
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
              allowAnnouncements: true,
              allowCriticalAlerts: true, // For critical alerts
            },
            android: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
              priority: Notifications.AndroidNotificationPriority.MAX,
            }
          });
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          Alert.alert(
            'Notifications Required',
            'Please enable notifications in your settings to receive urgent job alerts.'
          );
          // If permissions are not granted, we cannot proceed with push token registration
          return;
        }

        // Create high-priority notification channel for Android
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('job-invitations', {
            name: 'Job Invitations',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250], // Corrected pattern
            lightColor: '#FF231F7C',
            sound: 'default', // Using default sound managed by the channel
            enableVibrate: true,
            showBadge: true,
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, // Show on lock screen
          });
        }
      } else {
        console.log('Must use physical device for Push Notifications');
      }

      // Get push token and register with backend (moved from old registerForPushNotificationsAsync)
      try {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('📱 Push token retrieved:', token);
        
        // Register token with your backend, matching the backend's expected payload
        await api.post('/users/push-token', { token }); // Corrected payload
        console.log('✅ Push token registered with backend.');

      } catch (error) {
        console.error('❌ Failed to get or register push token:', error.response?.data || error.message); // Updated error logging
      }

      // Set up notification listeners
      notificationListener.current = Notifications.addNotificationReceivedListener(handleNotificationReceived);
      responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
      
      // Monitor app state changes
      appStateSubscription.current = AppState.addEventListener('change', handleAppStateChange);
      
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true, // Keep audio active when app is in background
        playsInSilentModeIOS: true, // Play sound even if silent switch is on iOS
        shouldDuckAndroid: true, // Duck audio from other apps on Android
        playThroughEarpieceAndroid: false, // Play through speaker
      });
    } catch (error) {
      console.warn('Failed to setup audio:', error);
    }
  };

  const handleNotificationReceived = async (notification) => {
    console.log('🔔 Foreground notification received:', notification);
    
    // Check if this is specifically a job invitation from the backend (not a reminder)
    if (notification.request.content.data?.type === 'job_invitation') {
      const newJobId = notification.request.content.data?.jobId;
      
      // If it's a new job ID different from the current one, alert the user
      if (newJobId && newJobId !== jobId) {
        // Play urgent sound and vibrate
        await playUrgentAlert();
        
        // Show alert with option to view new job
        Alert.alert(
          '🚨 New Urgent Job!',
          `A new ${notification.request.content.data?.service || 'emergency'} job is available nearby!`,
          [
            { text: 'Later', style: 'cancel' },
            { 
              text: 'View Job', 
              onPress: () => {
                // Ensure sound is stopped before navigating if it's still playing
                cleanupAudio(); 
                navigation.replace('ProviderInvitationScreen', {
                  jobId: newJobId,
                  invitationExpiresAt: notification.request.content.data?.expiresAt,
                  clickable: true
                });
              }
            }
          ],
          { cancelable: false }
        );
      }
    }
  };

  const handleNotificationResponse = (response) => {
    console.log('🔔 Notification response received:', response);
    
    const notificationData = response.notification.request.content.data;
    // Handle opening of job invitation or reminder notifications
    if (notificationData?.type?.includes('job_invitation') && notificationData?.jobId) {
      // Ensure sound is stopped before navigating if it's still playing
      cleanupAudio();
      navigation.replace('ProviderInvitationScreen', {
        jobId: notificationData.jobId,
        invitationExpiresAt: notificationData.expiresAt,
        clickable: true
      });
    }
  };

  const handleAppStateChange = (nextAppState) => {
    console.log('📱 App state changed:', appStateRef.current, '->', nextAppState);
    
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground, cancelling pending job notifications.');
      // App came to foreground - cancel any pending job notifications for this job
      cancelJobNotifications();
    } else if (nextAppState.match(/inactive|background/)) {
      console.log('App going to background, scheduling reminders.');
      // App going to background - schedule reminder notifications
      scheduleBackgroundReminders();
    }
    
    appStateRef.current = nextAppState;
  };

  const playUrgentAlert = async () => {
    try {
      // Vibrate with urgent pattern
      const urgentPattern = [0, 300, 100, 300, 100, 300, 100, 800];
      Vibration.vibrate(urgentPattern);

      // Try to play custom urgent sound
      if (soundObject.current) {
        await soundObject.current.unloadAsync();
      }
      
      // Use a remote URL or create the sound with a web-accessible URL
      // For now, using a basic notification sound approach
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
          { 
            shouldPlay: true, 
            isLooping: false, 
            volume: 1.0,
            rate: 1.0,
            shouldCorrectPitch: true,
          }
        );
        
        soundObject.current = sound;
        
        // Auto-cleanup after playing
        setTimeout(async () => {
          try {
            if (soundObject.current) {
              await soundObject.current.stopAsync();
              await soundObject.current.unloadAsync();
              soundObject.current = null;
            }
          } catch (e) {
            console.warn('Error cleaning up sound:', e);
          }
        }, 5000);
      } catch (soundError) {
        console.warn('Failed to play remote sound:', soundError);
        // If remote sound fails, just use vibration
        Vibration.vibrate([0, 1000, 500, 1000]);
      }
      
    } catch (error) {
      console.warn('Failed to play urgent alert:', error);
      // Fallback to basic vibration
      Vibration.vibrate([0, 1000, 500, 1000]);
    }
  };

  const scheduleBackgroundReminders = async () => {
    // Only schedule if there's time remaining
    if (!remaining || remaining <= 0) {
      console.log('No time remaining or job expired, not scheduling reminders.');
      return;
    }
    
    try {
      // Cancel existing reminders for this job to avoid duplicates
      await cancelJobNotifications();
      
      // Schedule immediate background notification (e.g., 5 seconds from now)
      // This acts as an initial alert when the app is backgrounded
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Job Invitation Waiting!',
          body: job ? `${job.service} job expires in ${Math.floor(remaining/60)}m ${remaining%60}s - Don't miss out!` : 'Job invitation expiring soon!',
          sound: 'default', // Uses channel sound or default system sound
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { 
            type: 'job_invitation_background',
            jobId,
            expiresAt: invitationExpiresAt,
            service: job?.service 
          },
        },
        trigger: { seconds: 5 }, // Triggers quickly
        identifier: `job_background_${jobId}`,
      });

      // Schedule another reminder 30 seconds before expiry if enough time remains
      const reminderTime = Math.max(remaining - 30, 10); // Minimum 10 seconds to allow for notification display
      if (reminderTime > 5) { // Ensure it's scheduled after the immediate one
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🚨 Job Expiring Soon!',
            body: `Last chance: ${job?.service || 'Job'} invitation expires in 30 seconds!`,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.MAX,
            data: { 
              type: 'job_invitation_urgent',
              jobId,
              expiresAt: invitationExpiresAt,
              service: job?.service 
            },
          },
          trigger: { seconds: reminderTime },
          identifier: `job_urgent_${jobId}`,
        });
      }
      
      console.log(`📅 Scheduled background reminders for job ${jobId}`);
      
    } catch (error) {
      console.error('Failed to schedule background reminders:', error);
    }
  };

  const cancelJobNotifications = async () => {
    try {
      // Get all scheduled notifications
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      // Cancel job invitation related notifications by identifier or data.jobId
      for (const notification of scheduledNotifications) {
        const data = notification.content.data;
        if ((data?.type?.includes('job_invitation') || data?.type === 'job_invitation_reminder') && data?.jobId === jobId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          console.log(`Cancelled scheduled notification: ${notification.identifier}`);
        }
      }
      
      // Dismiss any currently presented notifications that are job invitations
      // This is important when the app comes to the foreground.
      if (Platform.OS === 'ios') {
        const presentedNotifications = await Notifications.getPresentedNotificationsAsync();
        for (const notification of presentedNotifications) {
          if (notification.request.content.data?.type?.includes('job_invitation') && notification.request.content.data?.jobId === jobId) {
            await Notifications.dismissNotificationAsync(notification.request.identifier);
            console.log(`Dismissed presented notification: ${notification.request.identifier}`);
          }
        }
      } else { // Android can dismiss all presented
        await Notifications.dismissAllNotificationsAsync();
        console.log('Dismissed all presented notifications on Android.');
      }

      console.log(`🗑️ Cancelled specific notifications for job ${jobId}`);
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  };

  const cleanupNotifications = () => {
    if (notificationListener.current) {
      Notifications.removeNotificationSubscription(notificationListener.current);
      notificationListener.current = null;
    }
    if (responseListener.current) {
      Notifications.removeNotificationSubscription(responseListener.current);
      responseListener.current = null;
    }
    // No need to cancel here, it's handled by handleAppStateChange when app comes to foreground.
    // Or when job is accepted/declined, which calls cancelJobNotifications
  };

  const cleanupAudio = async () => {
    if (soundObject.current) {
      try {
        await soundObject.current.stopAsync();
        await soundObject.current.unloadAsync();
        soundObject.current = null;
      } catch (e) {
        console.warn('Error unloading sound in cleanup:', e);
      }
    }
  };

  // Enhanced vibration and alert when invitation loads
  useEffect(() => {
    if (clickable && job) {
      playUrgentAlert();
      
      // Schedule background notifications if app goes to background shortly after initial load
      const timeout = setTimeout(() => {
        if (appStateRef.current.match(/inactive|background/)) {
          console.log('App is in background shortly after job loaded, scheduling reminders.');
          scheduleBackgroundReminders();
        }
      }, 2000); // Give app a moment to settle or determine its state
      
      return () => clearTimeout(timeout);
    }
  }, [clickable, job]); // Re-run if job or clickable status changes

  // Timer effect for invitation expiry
  useEffect(() => {
    if (!invitationExpiresAt) return;
    const expiry = Date.parse(invitationExpiresAt);
    const tick = () => {
      const secs = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
      setRemaining(secs);
      if (secs === 0) {
        // Optional: Navigate away or show expired message more prominently
        console.log("Job invitation expired.");
        // Consider cancelling all related notifications here as well
        cancelJobNotifications();
      }
    };
    tick(); // Initial call
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [invitationExpiresAt]);

  // Job details loading effect
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!jobId) throw new Error("Missing jobId param");
        const { data } = await api.get(`/jobs/${jobId}`);
        if (alive) setJob(data);
      } catch (err) {
        console.error("❌ Error fetching job details:", err);
        Alert.alert("Error", err.response?.data?.msg || "Failed to load job details.");
      } finally {
        if (alive) setJobLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [jobId]);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  const handleAccept = async () => {
    setLoading(true);
    try {
      // Cancel all related notifications for this job when accepted
      await cancelJobNotifications();
      cleanupAudio(); // Ensure any playing alert sound is stopped

      await api.put(`/jobs/${jobId}/accept`);
      Alert.alert("Accepted", "You’ve claimed this job.", [
        {
          text: "OK",
          onPress: () => navigation.replace("ProviderJobStatus", { jobId }),
        },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.msg || "Could not accept job.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      // Cancel all related notifications for this job when declined
      await cancelJobNotifications();
      cleanupAudio(); // Ensure any playing alert sound is stopped

      await api.put(`/jobs/${jobId}/deny`);
      Alert.alert("Declined", "You’ve passed on this invitation.", [
        {
          text: "OK",
          onPress: () => navigation.replace("ServiceProviderDashboard"),
        },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.msg || "Could not decline job.");
    } finally {
      setLoading(false);
    }
  };

  const getCoveredDescriptionFromJob = (job) => {
    if (!job) return "No job data available.";
    const key = job.details?.issue || job.service || job.category;
    if (!key) return "Service key not available.";
    const matched = Object.entries(serviceMatrix.coveredDescriptions).find(
      ([k]) => k.toLowerCase().trim() === key.toLowerCase().trim()
    );
    return matched ? matched[1] : `No description found for service: "${key}"`;
  };

  const coveredText = getCoveredDescriptionFromJob(job);
  const isTeaser = !clickable;
  const isExpired = remaining === 0;

  if (jobLoading) {
    return (
      <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading Job Invitation...</Text>
      </LinearGradient>
    )
  }

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
                <Bell color="#facc15" size={16} />
                <Text style={styles.headerBadgeText}>New Job Invitation</Text>
              </View>
            </View>
            <View style={{ width: 44 }} />
          </View>

          {/* Timer Card */}
          <View style={[styles.timerCard, isExpired && styles.timerCardExpired]}>
            <LinearGradient
              colors={isExpired ? ['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.1)'] : ['rgba(250, 204, 21, 0.2)', 'rgba(234, 179, 8, 0.1)']}
              style={styles.timerGradient}
            >
              <Clock color={isExpired ? "#ef4444" : "#facc15"} size={28} />
              <Text style={[styles.timerText, isExpired && styles.timerTextExpired]}>
                {isExpired ? "Invitation Expired" : `Expires in ${fmt(remaining)}`}
              </Text>
            </LinearGradient>
          </View>

          {job ? (
            <>
            {/* Job Details Card */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Wrench color="#60a5fa" size={24} />
                    <Text style={styles.cardTitle}>Job Details</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Service</Text>
                    <Text style={styles.detailValue}>{job.service}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{job.address}, {job.serviceCity}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MapPin color="#e0e7ff" size={16} style={{marginRight: 8}}/>
                    <Text style={styles.detailValue}>{job.distanceFromProvider ? `${job.distanceFromProvider.toFixed(1)} miles away` : 'Calculating distance...'}</Text>
                </View>
            </View>
            
            {/* Earnings Card */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <DollarSign color="#22c55e" size={24} />
                    <Text style={styles.cardTitle}>Potential Earnings</Text>
                </View>
                <Text style={styles.earningsAmount}>${job.estimatedTotal ? (job.estimatedTotal * 0.7).toFixed(2) : 'N/A'}</Text>
                <Text style={styles.earningsSubtext}>Estimated Payout (after 30% platform fee)</Text>
            </View>

            {/* Covered Work */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <ClipboardList color="#c084fc" size={24} />
                    <Text style={styles.cardTitle}>What's Covered</Text>
                </View>
                <Text style={styles.coveredText}>{coveredText}</Text>
            </View>
            </>
          ) : (
            <View style={styles.card}>
                <Text style={styles.errorText}>Job not found or failed to load.</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {isTeaser && !isExpired ? (
              <GradientButton
                colors={['#facc15', '#eab308']}
                onPress={() => navigation.navigate("MyAccountScreen")}
                disabled={loading}
                icon={Star}
                text="Upgrade to Accept"
              />
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton, (isExpired || loading) && styles.buttonDisabled]}
                  onPress={handleDecline}
                  disabled={isExpired || loading}
                >
                  <View style={[styles.buttonGradient, styles.declineButtonContent]}>
                    <X color="#f87171" size={24} />
                    <Text style={[styles.buttonText, styles.declineButtonText]}>Decline</Text>
                  </View>
                </TouchableOpacity>

                <GradientButton
                  colors={['#22c55e', '#16a34a']}
                  onPress={handleAccept}
                  disabled={isExpired || loading}
                  icon={Check}
                  text={loading ? 'Processing...' : 'Accept Job'}
                />
              </>
            )}
          </View>
          
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        color: '#fff',
        marginTop: 16,
        fontSize: 16
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
        marginTop: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 10,
        borderRadius: 22,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        alignItems: 'center'
    },
    headerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(250, 204, 21, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(250, 204, 21, 0.3)'
    },
    headerBadgeText: {
        color: '#facc15',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    timerCard: {
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    timerCardExpired: {
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    timerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 12
    },
    timerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#facc15',
    },
    timerTextExpired: {
        color: '#ef4444'
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 12
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    detailLabel: {
        fontSize: 16,
        color: '#e0e7ff',
        fontWeight: '600'
    },
    detailValue: {
        fontSize: 16,
        color: '#fff',
        flex: 1,
        textAlign: 'right'
    },
    earningsAmount: {
        fontSize: 36,
        fontWeight: '900',
        color: '#22c55e',
        textAlign: 'center'
    },
    earningsSubtext: {
        fontSize: 14,
        color: '#e0e7ff',
        textAlign: 'center',
        marginTop: 4
    },
    coveredText: {
        fontSize: 16,
        color: '#e0e7ff',
        lineHeight: 24,
    },
    errorText: {
        color: '#f87171',
        fontSize: 16,
        textAlign: 'center'
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 16, // Use gap for spacing
    },
    actionButton: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        height: BTN_HEIGHT, // Enforce uniform height
        justifyContent: 'center', // Center content vertically
    },
    declineButton: {
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        borderWidth: 2,
        borderColor: 'rgba(248, 113, 113, 0.3)',
    },
    declineButtonContent: {
        backgroundColor: 'transparent', // Ensure LinearGradient does not overlap this background
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%', // Take full height of parent TouchableOpacity
        gap: 8,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%', // Take full height of parent TouchableOpacity
        gap: 8,
        paddingVertical: 16, // This will be ignored due to height: '100%'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    declineButtonText: {
        color: '#f87171'
    },
    buttonDisabled: {
        opacity: 0.5
    },
    // upgradeButton style is now largely covered by GradientButton,
    // but leaving it in case there are other uses not evident in the outline.
    upgradeButton: {
      flex: 1,
      borderRadius: 16,
      overflow: 'hidden',
      height: BTN_HEIGHT,
      justifyContent: 'center',
    }
});
