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
// import * as Device from "expo-device";
// import { Audio } from 'expo-av';
// import JobDetails from "../components/JobDetails";

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
//             'Please enable notifications in your settings to receive urgent job alerts.'
//           );
//           // If permissions are not granted, we cannot proceed with push token registration
//           return;
//         }

//         // Create high-priority notification channel for Android
//         if (Platform.OS === 'android') {
//           await Notifications.setNotificationChannelAsync('job-invitations', {
//             name: 'Job Invitations',
//             importance: Notifications.AndroidImportance.MAX,
//             vibrationPattern: [0, 250, 250, 250], // Corrected pattern
//             lightColor: '#FF231F7C',
//             sound: 'default', // Using default sound managed by the channel
//             enableVibrate: true,
//             showBadge: true,
//             lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, // Show on lock screen
//           });
//         }
//       } else {
//         console.log('Must use physical device for Push Notifications');
//       }

//       // Get push token and register with backend (moved from old registerForPushNotificationsAsync)
//       try {
//         const token = (await Notifications.getExpoPushTokenAsync()).data;
//         console.log('📱 Push token retrieved:', token);
        
//         // Register token with your backend, matching the backend's expected payload
//         await api.post('/users/push-token', { token }); // Corrected payload
//         console.log('✅ Push token registered with backend.');

//       } catch (error) {
//         console.error('❌ Failed to get or register push token:', error.response?.data || error.message); // Updated error logging
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
//         marginTop: 40,
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


//working
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
// import * as Device from "expo-device";
// import { Audio } from 'expo-av';
// import * as Location from "expo-location"; // ✅ added
// import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ ensure present
// import JobDetails from "../components/JobDetails";

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
//         const { sound } = await Audio.Sound.createAsync(
//           { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
//           { shouldPlay: true, isLooping: false, volume: 1.0 }
//         );
        
//         Vibration.vibrate([0, 500, 200, 500, 200, 500]);
        
//         setTimeout(() => {
//           sound.unloadAsync().catch(e => console.warn('Error unloading sound in handler:', e));
//         }, 3000);
        
//       } catch (error) {
//         console.warn('Failed to play custom sound:', error);
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

// /** ---------- distance helpers (new) ---------- */
// const metersToMiles = (m) => m / 1609.344;
// const haversineMiles = (lat1, lon1, lat2, lon2) => {
//   const R = 6371000; // meters
//   const toRad = (d) => (d * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return metersToMiles(R * c);
// };

// export default function ProviderInvitationScreen() {
//   const { jobId, invitationExpiresAt, clickable } = useRoute().params;
//   const navigation = useNavigation();

//   const [remaining, setRemaining] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [job, setJob] = useState(null);
//   const [jobLoading, setJobLoading] = useState(true);

//   // ✅ new distance state
//   const [distanceMiles, setDistanceMiles] = useState(null);

//   const notificationListener = useRef();
//   const responseListener = useRef();
//   const appStateRef = useRef(AppState.currentState);
//   const soundObject = useRef(null);
//   const appStateSubscription = useRef(null);

//   // simple in-memory geocode cache
//   const geocodeCacheRef = useRef({});

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
//               allowCriticalAlerts: true,
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
//             'Please enable notifications in your settings to receive urgent job alerts.'
//           );
//           return;
//         }

//         if (Platform.OS === 'android') {
//           await Notifications.setNotificationChannelAsync('job-invitations', {
//             name: 'Job Invitations',
//             importance: Notifications.AndroidImportance.MAX,
//             vibrationPattern: [0, 250, 250, 250],
//             lightColor: '#FF231F7C',
//             sound: 'notification',
//             enableVibrate: true,
//             showBadge: true,
//             lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
//           });
//         }
//       } else {
//         console.log('Must use physical device for Push Notifications');
//       }

//       try {
//         const token = (await Notifications.getExpoPushTokenAsync()).data;
//         console.log('📱 Push token retrieved:', token);
//         await api.post('/users/push-token', { token });
//         console.log('✅ Push token registered with backend.');
//       } catch (error) {
//         console.error('❌ Failed to get or register push token:', error.response?.data || error.message);
//       }

//       notificationListener.current = Notifications.addNotificationReceivedListener(handleNotificationReceived);
//       responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
//       appStateSubscription.current = AppState.addEventListener('change', handleAppStateChange);
      
//     } catch (error) {
//       console.error('Failed to initialize notifications:', error);
//     }
//   };

//   const setupAudio = async () => {
//     try {
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: false,
//         staysActiveInBackground: true,
//         playsInSilentModeIOS: true,
//         shouldDuckAndroid: true,
//         playThroughEarpieceAndroid: false,
//       });
//     } catch (error) {
//       console.warn('Failed to setup audio:', error);
//     }
//   };

//   const handleNotificationReceived = async (notification) => {
//     console.log('🔔 Foreground notification received:', notification);
//     if (notification.request.content.data?.type === 'job_invitation') {
//       const newJobId = notification.request.content.data?.jobId;
//       if (newJobId && newJobId !== jobId) {
//         await playUrgentAlert();
//         Alert.alert(
//           '🚨 New Urgent Job!',
//           `A new ${notification.request.content.data?.service || 'emergency'} job is available nearby!`,
//           [
//             { text: 'Later', style: 'cancel' },
//             { 
//               text: 'View Job', 
//               onPress: () => {
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
//     if (notificationData?.type?.includes('job_invitation') && notificationData?.jobId) {
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
//       cancelJobNotifications();
//       // ✅ recalc distance when returning to foreground
//       if (job) computeDistance(job).catch(() => {});
//     } else if (nextAppState.match(/inactive|background/)) {
//       console.log('App going to background, scheduling reminders.');
//       scheduleBackgroundReminders();
//     }
//     appStateRef.current = nextAppState;
//   };

//   const playUrgentAlert = async () => {
//     try {
//       const urgentPattern = [0, 300, 100, 300, 100, 300, 100, 800];
//       Vibration.vibrate(urgentPattern);

//       if (soundObject.current) {
//         await soundObject.current.unloadAsync();
//       }
//       try {
//         const { sound } = await Audio.Sound.createAsync(
//           { uri: '../assets/notification.mp3' },
//           { shouldPlay: true, isLooping: false, volume: 10.0, rate: 1.0, shouldCorrectPitch: true }
//         );
//         soundObject.current = sound;
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
//         Vibration.vibrate([0, 1000, 500, 1000]);
//       }
//     } catch (error) {
//       console.warn('Failed to play urgent alert:', error);
//       Vibration.vibrate([0, 1000, 500, 1000]);
//     }
//   };

//   const scheduleBackgroundReminders = async () => {
//     if (!remaining || remaining <= 0) {
//       console.log('No time remaining or job expired, not scheduling reminders.');
//       return;
//     }
//     try {
//       await cancelJobNotifications();
//       await Notifications.scheduleNotificationAsync({
//         content: {
//           title: '⏰ Job Invitation Waiting!',
//           body: job ? `${job.service} job expires in ${Math.floor(remaining/60)}m ${remaining%60}s - Don't miss out!` : 'Job invitation expiring soon!',
//           sound: 'default',
//           priority: Notifications.AndroidNotificationPriority.MAX,
//           data: { 
//             type: 'job_invitation_background',
//             jobId,
//             expiresAt: invitationExpiresAt,
//             service: job?.service 
//           },
//         },
//         trigger: { seconds: 5 },
//       });

//       const reminderTime = Math.max(remaining - 30, 10);
//       if (reminderTime > 5) {
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
//         });
//       }
//       console.log(`📅 Scheduled background reminders for job ${jobId}`);
//     } catch (error) {
//       console.error('Failed to schedule background reminders:', error);
//     }
//   };

//   const cancelJobNotifications = async () => {
//     try {
//       const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
//       for (const n of scheduledNotifications) {
//         const data = n.content.data;
//         if ((data?.type?.includes('job_invitation') || data?.type === 'job_invitation_reminder') && data?.jobId === jobId) {
//           await Notifications.cancelScheduledNotificationAsync(n.identifier);
//           console.log(`Cancelled scheduled notification: ${n.identifier}`);
//         }
//       }
//       if (Platform.OS === 'ios') {
//         const presented = await Notifications.getPresentedNotificationsAsync();
//         for (const pn of presented) {
//           if (pn.request.content.data?.type?.includes('job_invitation') && pn.request.content.data?.jobId === jobId) {
//             await Notifications.dismissNotificationAsync(pn.request.identifier);
//             console.log(`Dismissed presented notification: ${pn.request.identifier}`);
//           }
//         }
//       } else {
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
//       const timeout = setTimeout(() => {
//         if (appStateRef.current.match(/inactive|background/)) {
//           console.log('App is in background shortly after job loaded, scheduling reminders.');
//           scheduleBackgroundReminders();
//         }
//       }, 2000);
//       return () => clearTimeout(timeout);
//     }
//   }, [clickable, job]);

//   // Timer effect for invitation expiry
//   useEffect(() => {
//     if (!invitationExpiresAt) return;
//     const expiry = Date.parse(invitationExpiresAt);
//     const tick = () => {
//       const secs = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
//       setRemaining(secs);
//       if (secs === 0) {
//         console.log("Job invitation expired.");
//         cancelJobNotifications();
//       }
//     };
//     tick();
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
//         if (alive) {
//           setJob(data);
//           // ✅ compute distance as soon as we have job data
//           computeDistance(data).catch((e) =>
//             console.log("⚠️ distance compute failed:", e?.message)
//           );
//         }
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

//   /** ---------- dynamic distance: get coords & compute (new) ---------- */
//   const geocodeCached = async (query) => {
//     if (!query) return null;
//     const key = query.trim().toLowerCase();
//     if (geocodeCacheRef.current[key]) return geocodeCacheRef.current[key];
//     try {
//       const results = await Location.geocodeAsync(query);
//       const hit = results?.[0]
//         ? { lat: results[0].latitude, lng: results[0].longitude }
//         : null;
//       geocodeCacheRef.current[key] = hit;
//       return hit;
//     } catch (e) {
//       console.log("⚠️ geocode failed:", query, e?.message);
//       return null;
//     }
//   };

//   const getJobCoords = async (j) => {
//     if (!j) return null;
//     // prefer GeoJSON if present
//     const coords = j.location?.coordinates;
//     if (Array.isArray(coords) && coords.length >= 2) {
//       return { lat: Number(coords[1]), lng: Number(coords[0]) };
//     }
//     // or flat lat/lng fields
//     if (Number.isFinite(j.latitude) && Number.isFinite(j.longitude)) {
//       return { lat: Number(j.latitude), lng: Number(j.longitude) };
//     }
//     // fallback: geocode address/city/zip/state
//     const parts = [j.address, j.serviceCity, j.serviceState, j.serviceZip].filter(Boolean);
//     const addr = parts.join(", ");
//     return geocodeCached(addr || null);
//   };

//   const getProviderCoords = async () => {
//     try {
//       // try cached /users/me first
//       const raw = await AsyncStorage.getItem("me");
//       if (raw) {
//         let me;
//         try {
//           const parsed = JSON.parse(raw);
//           me = parsed?.user ?? parsed ?? null;
//         } catch {}
//         if (me) {
//           const coords = me.location?.coordinates;
//           if (Array.isArray(coords) && coords.length >= 2) {
//             return { lat: Number(coords[1]), lng: Number(coords[0]) };
//           }
//           const parts = [];
//           if (me.address) parts.push(me.address);
//           // zipcode may be array or string
//           if (Array.isArray(me.zipcode) && me.zipcode[0]) parts.push(String(me.zipcode[0]));
//           else if (typeof me.zipcode === "string" && me.zipcode.trim()) parts.push(me.zipcode.trim());
//           const addr = parts.join(", ");
//           const geocoded = await geocodeCached(addr);
//           if (geocoded) return geocoded;
//         }
//       }

//       // last resort: current device location (requires permission)
//       let { status } = await Location.getForegroundPermissionsAsync();
//       if (status !== "granted") {
//         const req = await Location.requestForegroundPermissionsAsync();
//         status = req.status;
//       }
//       if (status === "granted") {
//         const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
//         return { lat: pos.coords.latitude, lng: pos.coords.longitude };
//       }
//     } catch (e) {
//       console.log("⚠️ provider coords lookup failed:", e?.message);
//     }
//     return null;
//   };

//   const computeDistance = async (j) => {
//     try {
//       // if backend already sent a number, reflect it and bail
//       if (j?.distanceFromProvider && Number.isFinite(j.distanceFromProvider)) {
//         setDistanceMiles(Number(j.distanceFromProvider));
//         return;
//       }
//       const [jc, pc] = await Promise.all([getJobCoords(j), getProviderCoords()]);
//       if (jc && pc) {
//         const miles = haversineMiles(pc.lat, pc.lng, jc.lat, jc.lng);
//         setDistanceMiles(miles);
//       } else {
//         setDistanceMiles(null);
//       }
//     } catch (e) {
//       setDistanceMiles(null);
//     }
//   };

//   const fmt = (s) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
//       2,
//       "0"
//     )}`;

//   const handleAccept = async () => {
//     setLoading(true);
//     try {
//       await cancelJobNotifications();
//       cleanupAudio();
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
//       await cancelJobNotifications();
//       cleanupAudio();
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
//                     <Text style={styles.detailValue}>
//                       {Number.isFinite(job?.distanceFromProvider)
//                         ? `${Number(job.distanceFromProvider).toFixed(1)} miles away`
//                         : (distanceMiles != null
//                             ? `${distanceMiles.toFixed(1)} miles away`
//                             : 'Calculating distance...')}
//                     </Text>
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
//         marginTop: 40,
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
//         gap: 16,
//     },
//     actionButton: {
//         flex: 1,
//         borderRadius: 16,
//         overflow: 'hidden',
//         height: BTN_HEIGHT,
//         justifyContent: 'center',
//     },
//     declineButton: {
//         backgroundColor: 'rgba(248, 113, 113, 0.1)',
//         borderWidth: 2,
//         borderColor: 'rgba(248, 113, 113, 0.3)',
//     },
//     declineButtonContent: {
//         backgroundColor: 'transparent',
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         height: '100%',
//         gap: 8,
//     },
//     buttonGradient: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         height: '100%',
//         gap: 8,
//         paddingVertical: 16,
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
//     upgradeButton: {
//       flex: 1,
//       borderRadius: 16,
//       overflow: 'hidden',
//       height: BTN_HEIGHT,
//       justifyContent: 'center',
//     }
// });

// // screens/ProviderInvitationScreen.js
// import React, { useEffect, useRef, useState, useCallback } from "react";
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
//   ArrowLeft,
//   DollarSign,
//   MapPin,
//   Wrench,
//   ClipboardList,
//   Bell,
//   AlertTriangle,
// } from "lucide-react-native";
// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";
// import { Audio } from "expo-av";
// import * as Location from "expo-location";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../api/client";
// import QUESTIONS from "../utils/serviceMatrix";

// // ✅ local sound asset (adjust the path to your file structure)
// const NOTIF_SOUND = require("../assets/notification.mp3");

// const BTN_HEIGHT = 56;

// // Foreground notifications policy (don’t rely on push payload sound in foreground)
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

// // ---------- small helpers ----------
// const fmtMMSS = (s) =>
//   `${String(Math.floor((s || 0) / 60)).padStart(2, "0")}:${String(
//     (s || 0) % 60
//   ).padStart(2, "0")}`;

// const toMiles = (m) => m / 1609.344;
// const haversineMiles = (lat1, lon1, lat2, lon2) => {
//   const R = 6371000;
//   const toRad = (d) => (d * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
//   return toMiles(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
// };

// // Earnings logic:
// // - If only `estimatedTotal` (what customer pays) exists -> base = total/1.07, payout = base*0.93
// // - If backend provides pct fields, we prefer those.
// // - If backend provides `baseSubtotal` (pre-fees), use that directly.
// function computePayout(job) {
//   if (!job) return { payout: null, breakdown: "" };

//   const customerTotal = Number(job.estimatedTotal ?? job.totalWithFees ?? NaN);

//   const customerFeePct =
//     job.customerFeePct != null ? Number(job.customerFeePct) : 0.07;
//   const providerFeePct =
//     job.providerFeePct != null ? Number(job.providerFeePct) : 0.07;

//   let base;
//   if (Number.isFinite(job.baseSubtotal)) {
//     // backend gave pre-fee subtotal
//     base = Number(job.baseSubtotal);
//   } else if (Number.isFinite(customerTotal)) {
//     // derive base from what customer pays (assumes only customerFeePct added)
//     base = customerTotal / (1 + customerFeePct);
//   } else {
//     return { payout: null, breakdown: "" };
//   }

//   const payout = base * (1 - providerFeePct);

//   const breakdown = Number.isFinite(customerTotal)
//     ? `Based on customer payment $${customerTotal.toFixed(
//         2
//       )}, minus ${Math.round(
//         providerFeePct * 100)}%  provider fee.`
//     : `Estimated payout after ${Math.round(
//         providerFeePct * 100
//       )}% provider fee.`;

//   return { payout, breakdown };
// }

// // Try to extract emergency-form Q&A pairs from several likely shapes
//   // Normalize details
//   let entries = [];
//   try {
//     if (typeof details === "string") {
//       entries = Object.entries(JSON.parse(details));
//     } else if (typeof details === "object" && details !== null) {
//       entries = Object.entries(details);
//     }
//   } catch {
//     entries = [];
//   }

// function extractQA(job) {
//   if (!job) return [];
//   // 1) Array of { question, answer }
//   const arrays =
//     job.formResponses ||
//     job.questionsAnswers ||
//     job.emergencyForm?.answers ||
//     job.intake?.qa ||
//     job.intake?.answers ||
//     null;
//   if (Array.isArray(arrays)) {
//     return arrays
//       .map((x) => ({
//         q: x?.question || x?.q || x?.label || "",
//         a: x?.answer ?? x?.a ?? x?.value ?? "",
//       }))
//       .filter((p) => p.q || p.a);
//   }
//   // 2) Object map { question: answer }
//   const maps =
//     job.formAnswers ||
//     job.questions ||
//     job.intake?.form ||
//     job.details?.questions ||
//     null;
//   if (maps && typeof maps === "object") {
//     return Object.entries(maps)
//       .map(([q, a]) => ({ q, a }))
//       .filter((p) => p.q || p.a);
//   }
//   return [];
// }

// export default function ProviderInvitationScreen() {
//   const { jobId, invitationExpiresAt, clickable } = useRoute().params;
//   const navigation = useNavigation();

//   const [remaining, setRemaining] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [job, setJob] = useState(null);
//   const [jobLoading, setJobLoading] = useState(true);
//   const [distanceMiles, setDistanceMiles] = useState(null);
//   const [hasActiveJobConflict, setHasActiveJobConflict] = useState(false);

//   const appStateRef = useRef(AppState.currentState);
//   const soundRef = useRef(null);
//   const geocodeCacheRef = useRef({});
//   const notifRecvSub = useRef(null);
//   const notifRespSub = useRef(null);
//   const appStateSub = useRef(null);

//   // ----- audio setup for urgent foreground chime -----
//   useEffect(() => {
//     (async () => {
//       try {
//         await Audio.setAudioModeAsync({
//           allowsRecordingIOS: false,
//           staysActiveInBackground: false,
//           playsInSilentModeIOS: true,
//           shouldDuckAndroid: true,
//           interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
//           interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
//         });
//       } catch {}
//     })();
//   }, []);

//   const playUrgentAlert = useCallback(async () => {
//     try {
//       Vibration.vibrate([0, 350, 150, 350, 150, 600]);
//       if (soundRef.current) {
//         await soundRef.current.stopAsync().catch(() => {});
//         await soundRef.current.unloadAsync().catch(() => {});
//         soundRef.current = null;
//       }
//       const { sound } = await Audio.Sound.createAsync(NOTIF_SOUND, {
//         shouldPlay: true,
//         isLooping: false,
//         volume: 1.0, // 0.0 - 1.0
//       });
//       soundRef.current = sound;
//       sound.setOnPlaybackStatusUpdate(async (status) => {
//         if (status.didJustFinish) {
//           try {
//             await sound.unloadAsync();
//           } catch {}
//           if (soundRef.current === sound) soundRef.current = null;
//         }
//       });
//     } catch {}
//   }, []);

//   const cleanupAudio = useCallback(async () => {
//     if (soundRef.current) {
//       try {
//         await soundRef.current.stopAsync();
//         await soundRef.current.unloadAsync();
//       } catch {}
//       soundRef.current = null;
//     }
//   }, []);

//   // ----- expiry timer -----
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

//   // ----- fetch job + check active job + compute distance -----
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         if (!jobId) throw new Error("Missing jobId param");

//         // 1) Get job details
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (!alive) return;
//         setJob(data);

//         // 2) Check active job conflict
//         try {
//           const { data: active } = await api.get("/jobs/provider/active");
//           if (active && active._id && active._id !== jobId) {
//             setHasActiveJobConflict(true);
//           } else {
//             setHasActiveJobConflict(false);
//           }
//         } catch (e) {
//           // 404 == no active job; ignore
//           if (e?.response?.status !== 404) {
//             // other errors can be ignored for UI
//           }
//         }

//         // 3) compute distance
//         await computeDistance(data);
//       } catch (err) {
//         Alert.alert(
//           "Error",
//           err?.response?.data?.msg || "Failed to load job details."
//         );
//       } finally {
//         if (alive) setJobLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [jobId]);

//   // ----- distance helpers -----
//   const geocodeCached = async (query) => {
//     if (!query) return null;
//     const key = query.trim().toLowerCase();
//     if (geocodeCacheRef.current[key]) return geocodeCacheRef.current[key];
//     try {
//       const results = await Location.geocodeAsync(query);
//       const hit = results?.[0]
//         ? { lat: results[0].latitude, lng: results[0].longitude }
//         : null;
//       geocodeCacheRef.current[key] = hit;
//       return hit;
//     } catch {
//       return null;
//     }
//   };

//   const getJobCoords = async (j) => {
//     if (!j) return null;
//     // GeoJSON (lng, lat)
//     const coords = j.location?.coordinates;
//     if (Array.isArray(coords) && coords.length >= 2) {
//       return { lat: Number(coords[1]), lng: Number(coords[0]) };
//     }
//     // flat lat/lng
//     if (Number.isFinite(j.latitude) && Number.isFinite(j.longitude)) {
//       return { lat: Number(j.latitude), lng: Number(j.longitude) };
//     }
//     // geocode address
//     const parts = [j.address, j.serviceCity, j.serviceState, j.serviceZip].filter(
//       Boolean
//     );
//     const addr = parts.join(", ");
//     return geocodeCached(addr || null);
//   };

//   const getProviderCoords = async () => {
//     try {
//       // try cached /users/me in storage
//       const raw = await AsyncStorage.getItem("me");
//       if (raw) {
//         try {
//           const me = JSON.parse(raw)?.user ?? JSON.parse(raw);
//           const coords = me?.location?.coordinates;
//           if (Array.isArray(coords) && coords.length >= 2) {
//             return { lat: Number(coords[1]), lng: Number(coords[0]) };
//           }
//           const parts = [];
//           if (me?.address) parts.push(me.address);
//           if (Array.isArray(me?.zipcode) && me.zipcode[0])
//             parts.push(String(me.zipcode[0]));
//           else if (typeof me?.zipcode === "string" && me.zipcode.trim())
//             parts.push(me.zipcode.trim());
//           const addr = parts.join(", ");
//           const geo = await geocodeCached(addr);
//           if (geo) return geo;
//         } catch {}
//       }
//       // last resort: device location
//       let { status } = await Location.getForegroundPermissionsAsync();
//       if (status !== "granted") {
//         const req = await Location.requestForegroundPermissionsAsync();
//         status = req.status;
//       }
//       if (status === "granted") {
//         const pos = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.Balanced,
//         });
//         return { lat: pos.coords.latitude, lng: pos.coords.longitude };
//       }
//     } catch {}
//     return null;
//   };

//   const computeDistance = async (j) => {
//     try {
//       if (j?.distanceFromProvider && Number.isFinite(j.distanceFromProvider)) {
//         setDistanceMiles(Number(j.distanceFromProvider));
//         return;
//       }
//       const [jc, pc] = await Promise.all([getJobCoords(j), getProviderCoords()]);
//       if (jc && pc) {
//         setDistanceMiles(haversineMiles(pc.lat, pc.lng, jc.lat, jc.lng));
//       } else {
//         setDistanceMiles(null);
//       }
//     } catch {
//       setDistanceMiles(null);
//     }
//   };

//   // ----- foreground chime when a clickable invite is shown -----
//   useEffect(() => {
//     if (clickable && job) {
//       playUrgentAlert();
//     }
//   }, [clickable, job, playUrgentAlert]);

//   // ----- accept / decline -----
//   const onAccept = async () => {
//     if (hasActiveJobConflict) {
//       Alert.alert(
//         "Active Job in Progress",
//         "You already have an active job. Finish it before accepting a new one.",
//         [
//           {
//             text: "Go to Active Job",
//             onPress: () => navigation.replace("ProviderJobStatus"),
//           },
//           { text: "OK", style: "cancel" },
//         ]
//       );
//       return;
//     }
//     setLoading(true);
//     try {
//       await cleanupAudio();
//       await Notifications.dismissAllNotificationsAsync().catch(() => {});
//       await api.put(`/jobs/${jobId}/accept`);
//       Alert.alert("Accepted", "You’ve claimed this job.", [
//         {
//           text: "OK",
//           onPress: () => navigation.replace("ProviderJobStatus", { jobId }),
//         },
//       ]);
//     } catch (err) {
//       Alert.alert("Error", err?.response?.data?.msg || "Could not accept job.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onDecline = async () => {
//     setLoading(true);
//     try {
//       await cleanupAudio();
//       await Notifications.dismissAllNotificationsAsync().catch(() => {});
//       await api.put(`/jobs/${jobId}/deny`);
//       Alert.alert("Declined", "You’ve passed on this invitation.", [
//         {
//           text: "OK",
//           onPress: () => navigation.replace("ServiceProviderDashboard"),
//         },
//       ]);
//     } catch (err) {
//       Alert.alert("Error", err?.response?.data?.msg || "Could not decline job.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ----- UI -----
//   const isExpired = remaining === 0;
//   const qa = extractQA(job);
//   const serviceLabel =
//     job?.serviceType || job?.service || job?.category || "Electrician";

//   const { payout, breakdown } = computePayout(job);

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

//           {/* Timer */}
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
//                   : `Expires in ${fmtMMSS(remaining)}`}
//               </Text>
//             </LinearGradient>
//           </View>

//           {/* Active job conflict banner */}
//           {hasActiveJobConflict && (
//             <View style={styles.conflictBanner}>
//               <AlertTriangle color="#fbbf24" size={18} />
//               <Text style={styles.conflictText}>
//                 You already have an active job. You can’t accept a new one
//                 until it’s finished.
//               </Text>
//             </View>
//           )}

//           {/* Job Details */}
//           {job ? (
//             <>
//               <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                   <Wrench color="#60a5fa" size={24} />
//                   <Text style={styles.cardTitle}>Job Details</Text>
//                 </View>
//                 <Row label="Service" value={serviceLabel} />
//                 <Row
//                   label="Location"
//                   value={`${job.address ?? ""}${job.serviceCity ? `, ${job.serviceCity}` : ""}`}
//                 />
//                 <View style={styles.distanceRow}>
//                   <MapPin color="#e0e7ff" size={16} style={{ marginRight: 8 }} />
//                   <Text style={styles.detailValue}>
//                     {Number.isFinite(job?.distanceFromProvider)
//                       ? `${Number(job.distanceFromProvider).toFixed(1)} miles away`
//                       : distanceMiles != null
//                       ? `${distanceMiles.toFixed(1)} miles away`
//                       : "Calculating distance..."}
//                   </Text>
//                 </View>
//               </View>

//               {/* Potential Earnings */}
//               <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                   <DollarSign color="#22c55e" size={24} />
//                   <Text style={styles.cardTitle}>Potential Earnings</Text>
//                 </View>
//                 <Text style={styles.earningsAmount}>
//                   {Number.isFinite(payout) ? `$${payout.toFixed(2)}` : "N/A"}
//                 </Text>
//                 {!!breakdown && (
//                   <Text style={styles.earningsSubtext}>{breakdown}</Text>
//                 )}
//               </View>

//               {/* Emergency Form Q&A */}
//               {/* <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                   <ClipboardList color="#c084fc" size={24} />
//                   <Text style={styles.cardTitle}>Emergency Form</Text>
//                 </View>
//                 {entries.map(([k, v], i) => (
//               <View key={k} style={styles.qaItem}>
//                 <View style={styles.questionRow}>
//                   <FileText color="#94a3b8" size={16} />
//                   <Text style={styles.question}>{QUESTIONS[k] || k}</Text>
//                 </View>
//                 <Text style={styles.answer}>
//                   {Array.isArray(v) ? v.join(", ") : String(v)}
//                 </Text>
//                 {i < entries.length - 1 && (
//                   <View style={styles.responseDivider} />
//                 )}
//               </View>
//             ))
//                 ) : (
//                   <Text style={styles.muted}>
//                     No additional answers were provided.
//                   </Text>
//                 )}
//               </View>
//                */}
//                <View style={styles.card}>
//   <View style={styles.cardHeader}>
//     <ClipboardList color="#c084fc" size={24} />
//     <Text style={styles.cardTitle}>Emergency Form</Text>
//   </View>

//      {/* Emergency Form Responses */}
//      {entries.length > 0 && (
//         <View style={styles.responsesCard}>
//           <LinearGradient
//             colors={["rgba(168, 85, 247, 0.15)", "rgba(147, 51, 234, 0.05)"]}
//             style={styles.responsesGradient}
//           >
//             <View style={styles.sectionHeader}>
//               <MessageSquare color="#a855f7" size={20} />
//               <Text style={styles.sectionTitle}>Emergency Form Responses</Text>
//             </View>

//             {entries.map(([k, v], i) => (
//               <View key={k} style={styles.qaItem}>
//                 <View style={styles.questionRow}>
//                   <FileText color="#94a3b8" size={16} />
//                   <Text style={styles.question}>{QUESTIONS[k] || k}</Text>
//                 </View>
//                 <Text style={styles.answer}>
//                   {Array.isArray(v) ? v.join(", ") : String(v)}
//                 </Text>
//                 {i < entries.length - 1 && (
//                   <View style={styles.responseDivider} />
//                 )}
//               </View>
//             ))}
//           </LinearGradient>
//         </View>
//       )}

//   {entries.length > 0 ? (
//     entries.map(([k, v], i) => (
//       <View key={`${k}-${i}`} style={styles.qaItem}>
//         <View style={styles.questionRow}>
//           <FileText color="#94a3b8" size={16} />
//           <Text style={styles.question}>
//             {QUESTIONS[k] ?? prettifyKey(k)}
//           </Text>
//         </View>

//         <Text style={styles.answer}>
//           {Array.isArray(v) ? v.join(", ") : String(v)}
//         </Text>

//         {i < entries.length - 1 && <View style={styles.responseDivider} />}
//       </View>
//     ))
//   ) : (
//     <Text style={styles.muted}>No additional answers were provided.</Text>
//   )}
// </View>

//             </>
//           ) : (
//             <View style={styles.card}>
//               <Text style={styles.errorText}>
//                 Job not found or failed to load.
//               </Text>
//             </View>
//           )}

//           {/* Actions */}
//           <View style={styles.buttonRow}>
//             <TouchableOpacity
//               onPress={onDecline}
//               disabled={isExpired || loading}
//               style={[
//                 styles.actionButton,
//                 styles.declineButton,
//                 (isExpired || loading) && styles.buttonDisabled,
//               ]}
//               activeOpacity={0.85}
//             >
//               <View style={[styles.buttonInner, styles.declineInner]}>
//                 <X color="#f87171" size={22} />
//                 <Text style={[styles.buttonText, styles.declineText]}>
//                   Decline
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={onAccept}
//               disabled={isExpired || loading || hasActiveJobConflict}
//               style={[
//                 styles.actionButton,
//                 (isExpired || loading || hasActiveJobConflict) &&
//                   styles.buttonDisabled,
//               ]}
//               activeOpacity={0.9}
//             >
//               <LinearGradient
//                 colors={["#22c55e", "#16a34a"]}
//                 style={styles.buttonInner}
//               >
//                 <Check color="#fff" size={22} />
//                 <Text style={styles.buttonText}>
//                   {loading ? "Processing..." : "Accept Job"}
//                 </Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// // Small row component for label/value
// function Row({ label, value }) {
//   return (
//     <View style={styles.detailRow}>
//       <Text style={styles.detailLabel}>{label}</Text>
//       <Text style={styles.detailValue}>{String(value ?? "—")}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },
//   loadingText: { color: "#fff", marginTop: 16, fontSize: 16 },
//   scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },
//   backButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "rgba(255,255,255,0.1)",
//     alignItems: "center",
//     justifyContent: "center",
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

//   timerCard: { borderRadius: 16, overflow: "hidden", marginBottom: 20 },
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

//   conflictBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: "rgba(250, 204, 21, 0.1)",
//     borderWidth: 1,
//     borderColor: "rgba(250, 204, 21, 0.3)",
//     marginBottom: 16,
//   },
//   conflictText: { color: "#fde68a", flex: 1 },

//   card: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#fff",
//     marginLeft: 12,
//   },

//   detailRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "rgba(255,255,255,0.08)",
//   },
//   detailLabel: { fontSize: 16, color: "#e0e7ff", fontWeight: "600" },
//   detailValue: { fontSize: 16, color: "#fff", flex: 1, textAlign: "right" },

//   distanceRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingTop: 12,
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

//   qaRow: {
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "rgba(255,255,255,0.08)",
//   },
//   qaQ: { color: "#c7d2fe", fontWeight: "600", marginBottom: 4 },
//   qaA: { color: "#fff" },
//   muted: { color: "#94a3b8" },

//   errorText: { color: "#f87171", fontSize: 16, textAlign: "center" },

//   buttonRow: { flexDirection: "row", gap: 16, marginTop: 8 },
//   actionButton: {
//     flex: 1,
//     borderRadius: 16,
//     overflow: "hidden",
//     height: BTN_HEIGHT,
//     justifyContent: "center",
//   },
//   buttonInner: {
//     height: "100%",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     flexDirection: "row",
//   },
//   buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
//   buttonDisabled: { opacity: 0.5 },

//   declineButton: {
//     backgroundColor: "rgba(248, 113, 113, 0.1)",
//     borderWidth: 2,
//     borderColor: "rgba(248, 113, 113, 0.3)",
//   },
//   declineInner: { backgroundColor: "transparent" },
//   declineText: { color: "#f87171" },
// });

// import React, { useEffect, useRef, useState, useCallback } from "react";
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
//   ArrowLeft,
//   DollarSign,
//   MapPin,
//   Wrench,
//   ClipboardList,
//   Bell,
//   AlertTriangle,
//   FileText,          // ✅ needed by Q&A block
//   MessageSquare,     // ✅ needed by Q&A block
// } from "lucide-react-native";
// import * as Notifications from "expo-notifications";
// import { Audio } from "expo-av";
// import * as Location from "expo-location";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../api/client";
// import QUESTIONS from "../utils/serviceMatrix";

// const NOTIF_SOUND = require("../assets/notification.mp3");
// const BTN_HEIGHT = 56;

// // Foreground notifications
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//   }),
// });

// // ---------- helpers ----------
// const fmtMMSS = (s) =>
//   `${String(Math.floor((s || 0) / 60)).padStart(2, "0")}:${String(
//     (s || 0) % 60
//   ).padStart(2, "0")}`;

// const toMiles = (m) => m / 1609.344;
// const haversineMiles = (lat1, lon1, lat2, lon2) => {
//   const R = 6371000;
//   const toRad = (d) => (d * Math.PI) / 180;
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
//   return toMiles(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
// };

// // Nicely format a key if it’s not in QUESTIONS
// function prettifyKey(k = "") {
//   return String(k)
//     .replace(/[_\-]+/g, " ")
//     .replace(/([a-z])([A-Z])/g, "$1 $2")
//     .replace(/\s+/g, " ")
//     .trim()
//     .replace(/^./, (c) => c.toUpperCase());
// }

// // Earnings logic
// function computePayout(job) {
//   if (!job) return { payout: null, breakdown: "" };

//   const customerTotal = Number(job.estimatedTotal ?? job.totalWithFees ?? NaN);
//   const customerFeePct =
//     job.customerFeePct != null ? Number(job.customerFeePct) : 0.07;
//   const providerFeePct =
//     job.providerFeePct != null ? Number(job.providerFeePct) : 0.07;

//   let base;
//   if (Number.isFinite(job.baseSubtotal)) {
//     base = Number(job.baseSubtotal);
//   } else if (Number.isFinite(customerTotal)) {
//     base = customerTotal / (1 + customerFeePct);
//   } else {
//     return { payout: null, breakdown: "" };
//   }

//   const payout = base * (1 - providerFeePct);
//   const breakdown = Number.isFinite(customerTotal)
//     ? `Based on customer payment $${customerTotal.toFixed(
//         2
//       )}, minus ${Math.round(
//         providerFeePct * 100)}%  BlinqFix fee.`
//     : `Estimated payout after ${Math.round(providerFeePct * 100)}% provider fee.`;

//   return { payout, breakdown };
// }

// // Safely turn “details” into pairs
// function pairsFromDetails(details) {
//   try {
//     if (!details) return [];
//     const obj =
//       typeof details === "string" ? JSON.parse(details) : { ...details };

//     // common shapes inside details
//     if (Array.isArray(obj)) {
//       // array of {question, answer} (or similar)
//       return obj
//         .map((x) => ({
//           q: x?.question || x?.q || x?.label || "",
//           a: x?.answer ?? x?.a ?? x?.value ?? "",
//         }))
//         .filter((p) => p.q || p.a);
//     }

//     if (obj?.answers && typeof obj.answers === "object") {
//       return Object.entries(obj.answers).map(([q, a]) => ({ q, a }));
//     }
//     if (obj?.questions && typeof obj.questions === "object") {
//       return Object.entries(obj.questions).map(([q, a]) => ({ q, a }));
//     }
//     if (obj?.qa && Array.isArray(obj.qa)) {
//       return obj.qa
//         .map((x) => ({
//           q: x?.question || x?.q || x?.label || "",
//           a: x?.answer ?? x?.a ?? x?.value ?? "",
//         }))
//         .filter((p) => p.q || p.a);
//     }

//     // fallback: treat every field as a Q/A
//     if (obj && typeof obj === "object") {
//       return Object.entries(obj).map(([q, a]) => ({ q, a }));
//     }
//   } catch {}
//   return [];
// }

// // Extract emergency-form Q&A from likely locations
// function extractQA(job) {
//   if (!job) return [];

//   const out = [];

//   // 1) job.details (string or object)
//   out.push(...pairsFromDetails(job.details));

//   // 2) job.emergencyForm (answers/qa/etc)
//   if (job.emergencyForm) out.push(...pairsFromDetails(job.emergencyForm));

//   // 3) job.intake (form/answers/qa/etc)
//   if (job.intake) out.push(...pairsFromDetails(job.intake));

//   // 4) other top-level fields sometimes used
//   if (Array.isArray(job.formResponses)) {
//     out.push(
//       ...job.formResponses
//         .map((x) => ({
//           q: x?.question || x?.q || x?.label || "",
//           a: x?.answer ?? x?.a ?? x?.value ?? "",
//         }))
//         .filter((p) => p.q || p.a)
//     );
//   }
//   if (job.formAnswers && typeof job.formAnswers === "object") {
//     out.push(...Object.entries(job.formAnswers).map(([q, a]) => ({ q, a })));
//   }
//   if (job.questionsAnswers && typeof job.questionsAnswers === "object") {
//     out.push(...Object.entries(job.questionsAnswers).map(([q, a]) => ({ q, a })));
//   }

//   // De-dup (by q+a)
//   const seen = new Set();
//   const deduped = [];
//   for (const p of out) {
//     const key = `${p.q}::${Array.isArray(p.a) ? p.a.join(",") : String(p.a)}`;
//     if (!seen.has(key) && (p.q || p.a)) {
//       seen.add(key);
//       deduped.push(p);
//     }
//   }
//   return deduped;
// }

// export default function ProviderInvitationScreen() {
//   const { jobId, invitationExpiresAt, clickable } = useRoute().params;
//   const navigation = useNavigation();

//   const [remaining, setRemaining] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [job, setJob] = useState(null);
//   const [jobLoading, setJobLoading] = useState(true);
//   const [distanceMiles, setDistanceMiles] = useState(null);
//   const [hasActiveJobConflict, setHasActiveJobConflict] = useState(false);

//   const appStateRef = useRef(AppState.currentState);
//   const soundRef = useRef(null);
//   const geocodeCacheRef = useRef({});

//   // audio mode
//   useEffect(() => {
//     (async () => {
//       try {
//         await Audio.setAudioModeAsync({
//           allowsRecordingIOS: false,
//           staysActiveInBackground: false,
//           playsInSilentModeIOS: true,
//           shouldDuckAndroid: true,
//           interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
//           interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
//         });
//       } catch {}
//     })();
//   }, []);

//   const playUrgentAlert = useCallback(async () => {
//     try {
//       Vibration.vibrate([0, 350, 150, 350, 150, 600]);
//       if (soundRef.current) {
//         await soundRef.current.stopAsync().catch(() => {});
//         await soundRef.current.unloadAsync().catch(() => {});
//         soundRef.current = null;
//       }
//       const { sound } = await Audio.Sound.createAsync(NOTIF_SOUND, {
//         shouldPlay: true,
//         isLooping: false,
//         volume: 1.0,
//       });
//       soundRef.current = sound;
//       sound.setOnPlaybackStatusUpdate(async (status) => {
//         if (status.didJustFinish) {
//           try {
//             await sound.unloadAsync();
//           } catch {}
//           if (soundRef.current === sound) soundRef.current = null;
//         }
//       });
//     } catch {}
//   }, []);

//   const cleanupAudio = useCallback(async () => {
//     if (soundRef.current) {
//       try {
//         await soundRef.current.stopAsync();
//         await soundRef.current.unloadAsync();
//       } catch {}
//       soundRef.current = null;
//     }
//   }, []);

//   // expiry timer
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

//   // fetch job + active job + distance
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         if (!jobId) throw new Error("Missing jobId param");

//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (!alive) return;
//         setJob(data);

//         try {
//           const { data: active } = await api.get("/jobs/provider/active");
//           if (active && active._id && active._id !== jobId) {
//             setHasActiveJobConflict(true);
//           } else {
//             setHasActiveJobConflict(false);
//           }
//         } catch (e) {
//           if (e?.response?.status !== 404) {
//             // ignore other errors for UI
//           }
//         }

//         await computeDistance(data);
//       } catch (err) {
//         Alert.alert(
//           "Error",
//           err?.response?.data?.msg || "Failed to load job details."
//         );
//       } finally {
//         if (alive) setJobLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [jobId]);

//   // distance helpers
//   const geocodeCached = async (query) => {
//     if (!query) return null;
//     const key = query.trim().toLowerCase();
//     if (geocodeCacheRef.current[key]) return geocodeCacheRef.current[key];
//     try {
//       const results = await Location.geocodeAsync(query);
//       const hit = results?.[0]
//         ? { lat: results[0].latitude, lng: results[0].longitude }
//         : null;
//       geocodeCacheRef.current[key] = hit;
//       return hit;
//     } catch {
//       return null;
//     }
//   };

//   const getJobCoords = async (j) => {
//     if (!j) return null;
//     const coords = j.location?.coordinates; // [lng, lat]
//     if (Array.isArray(coords) && coords.length >= 2) {
//       return { lat: Number(coords[1]), lng: Number(coords[0]) };
//     }
//     if (Number.isFinite(j.latitude) && Number.isFinite(j.longitude)) {
//       return { lat: Number(j.latitude), lng: Number(j.longitude) };
//     }
//     const parts = [j.address, j.serviceCity, j.serviceState, j.serviceZip].filter(Boolean);
//     const addr = parts.join(", ");
//     return geocodeCached(addr || null);
//   };

//   const getProviderCoords = async () => {
//     try {
//       const raw = await AsyncStorage.getItem("me");
//       if (raw) {
//         try {
//           const me = JSON.parse(raw)?.user ?? JSON.parse(raw);
//           const coords = me?.location?.coordinates;
//           if (Array.isArray(coords) && coords.length >= 2) {
//             return { lat: Number(coords[1]), lng: Number(coords[0]) };
//           }
//           const parts = [];
//           if (me?.address) parts.push(me.address);
//           if (Array.isArray(me?.zipcode) && me.zipcode[0])
//             parts.push(String(me.zipcode[0]));
//           else if (typeof me?.zipcode === "string" && me.zipcode.trim())
//             parts.push(me.zipcode.trim());
//           const addr = parts.join(", ");
//           const geo = await geocodeCached(addr);
//           if (geo) return geo;
//         } catch {}
//       }
//       let { status } = await Location.getForegroundPermissionsAsync();
//       if (status !== "granted") {
//         const req = await Location.requestForegroundPermissionsAsync();
//         status = req.status;
//       }
//       if (status === "granted") {
//         const pos = await Location.getCurrentPositionAsync({
//           accuracy: Location.Accuracy.Balanced,
//         });
//         return { lat: pos.coords.latitude, lng: pos.coords.longitude };
//       }
//     } catch {}
//     return null;
//   };

//   const computeDistance = async (j) => {
//     try {
//       if (j?.distanceFromProvider && Number.isFinite(j.distanceFromProvider)) {
//         setDistanceMiles(Number(j.distanceFromProvider));
//         return;
//       }
//       const [jc, pc] = await Promise.all([getJobCoords(j), getProviderCoords()]);
//       if (jc && pc) {
//         setDistanceMiles(haversineMiles(pc.lat, pc.lng, jc.lat, jc.lng));
//       } else {
//         setDistanceMiles(null);
//       }
//     } catch {
//       setDistanceMiles(null);
//     }
//   };

//   // chime when invite appears
//   useEffect(() => {
//     if (clickable && job) {
//       playUrgentAlert();
//     }
//   }, [clickable, job, playUrgentAlert]);

//   // actions
//   const onAccept = async () => {
//     if (hasActiveJobConflict) {
//       Alert.alert(
//         "Active Job in Progress",
//         "You already have an active job. Finish it before accepting a new one.",
//         [
//           { text: "Go to Active Job", onPress: () => navigation.replace("ProviderJobStatus") },
//           { text: "OK", style: "cancel" },
//         ]
//       );
//       return;
//     }
//     setLoading(true);
//     try {
//       await cleanupAudio();
//       await Notifications.dismissAllNotificationsAsync().catch(() => {});
//       await api.put(`/jobs/${jobId}/accept`);
//       Alert.alert("Accepted", "You’ve claimed this job.", [
//         { text: "OK", onPress: () => navigation.replace("ProviderJobStatus", { jobId }) },
//       ]);
//     } catch (err) {
//       Alert.alert("Error", err?.response?.data?.msg || "Could not accept job.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onDecline = async () => {
//     setLoading(true);
//     try {
//       await cleanupAudio();
//       await Notifications.dismissAllNotificationsAsync().catch(() => {});
//       await api.put(`/jobs/${jobId}/deny`);
//       Alert.alert("Declined", "You’ve passed on this invitation.", [
//         { text: "OK", onPress: () => navigation.replace("ServiceProviderDashboard") },
//       ]);
//     } catch (err) {
//       Alert.alert("Error", err?.response?.data?.msg || "Could not decline job.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ----- UI -----
//   const isExpired = remaining === 0;
//   const qa = extractQA(job); // ✅ use this, not a module-scope `entries`
//   const serviceLabel =
//     job?.serviceType || job?.service || job?.category || "Electrician";

//   const { payout, breakdown } = computePayout(job);

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

//           {/* Timer */}
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
//                 {isExpired ? "Invitation Expired" : `Expires in ${fmtMMSS(remaining)}`}
//               </Text>
//             </LinearGradient>
//           </View>

//           {/* Active job conflict banner */}
//           {hasActiveJobConflict && (
//             <View style={styles.conflictBanner}>
//               <AlertTriangle color="#fbbf24" size={18} />
//               <Text style={styles.conflictText}>
//                 You already have an active job. You can’t accept a new one until it’s finished.
//               </Text>
//             </View>
//           )}

//           {/* Job Details */}
//           {job ? (
//             <>
//               <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                   <Wrench color="#60a5fa" size={24} />
//                   <Text style={styles.cardTitle}>Job Details</Text>
//                 </View>
//                 <Row label="Service" value={serviceLabel} />
//                 <Row
//                   label="Location"
//                   value={`${job.address ?? ""}${job.serviceCity ? `, ${job.serviceCity}` : ""}`}
//                 />
//                 <View style={styles.distanceRow}>
//                   <MapPin color="#e0e7ff" size={16} style={{ marginRight: 8 }} />
//                   <Text style={styles.detailValue}>
//                     {Number.isFinite(job?.distanceFromProvider)
//                       ? `${Number(job.distanceFromProvider).toFixed(1)} miles away`
//                       : distanceMiles != null
//                       ? `${distanceMiles.toFixed(1)} miles away`
//                       : "Calculating distance..."}
//                   </Text>
//                 </View>
//               </View>

//               {/* Potential Earnings */}
//               <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                   <DollarSign color="#22c55e" size={24} />
//                   <Text style={styles.cardTitle}>Potential Earnings</Text>
//                 </View>
//                 <Text style={styles.earningsAmount}>
//                   {Number.isFinite(payout) ? `$${payout.toFixed(2)}` : "N/A"}
//                 </Text>
//                 {!!breakdown && <Text style={styles.earningsSubtext}>{breakdown}</Text>}
//               </View>

//               {/* Emergency Form Q&A */}
//               <View style={styles.card}>
//                 <View style={styles.cardHeader}>
//                   <ClipboardList color="#c084fc" size={24} />
//                   <Text style={styles.cardTitle}>Emergency Form</Text>
//                 </View>

//                 {qa.length > 0 ? (
//                   <View style={{ borderRadius: 12, overflow: "hidden" }}>
//                     <LinearGradient
//                       colors={["rgba(168, 85, 247, 0.15)", "rgba(147, 51, 234, 0.05)"]}
//                       style={{ padding: 12, borderRadius: 12 }}
//                     >
//                       <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
//                         <MessageSquare color="#a855f7" size={20} />
//                         <Text style={[styles.cardTitle, { marginLeft: 8 }]}>Responses</Text>
//                       </View>

//                       {qa.map((pair, i) => {
//                         const k = pair.q || "";
//                         const v = pair.a;
//                         const label = QUESTIONS?.[k] ?? prettifyKey(k);
//                         return (
//                           <View key={`${k}-${i}`} style={{ marginBottom: 12 }}>
//                             <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
//                               <FileText color="#94a3b8" size={16} />
//                               <Text style={{ color: "#fff", marginLeft: 8, fontWeight: "600" }}>
//                                 {label}
//                               </Text>
//                             </View>
//                             <Text style={{ color: "#e0e7ff", marginLeft: 24, lineHeight: 20 }}>
//                               {Array.isArray(v) ? v.join(", ") : String(v)}
//                             </Text>
//                             {i < qa.length - 1 && (
//                               <View
//                                 style={{
//                                   height: 1,
//                                   backgroundColor: "rgba(255,255,255,0.1)",
//                                   marginTop: 8,
//                                 }}
//                               />
//                             )}
//                           </View>
//                         );
//                       })}
//                     </LinearGradient>
//                   </View>
//                 ) : (
//                   <Text style={styles.muted}>No additional answers were provided.</Text>
//                 )}
//               </View>
//             </>
//           ) : (
//             <View style={styles.card}>
//               <Text style={styles.errorText}>Job not found or failed to load.</Text>
//             </View>
//           )}

//           {/* Actions */}
//           <View style={styles.buttonRow}>
//             <TouchableOpacity
//               onPress={onDecline}
//               disabled={isExpired || loading}
//               style={[
//                 styles.actionButton,
//                 styles.declineButton,
//                 (isExpired || loading) && styles.buttonDisabled,
//               ]}
//               activeOpacity={0.85}
//             >
//               <View style={[styles.buttonInner, styles.declineInner]}>
//                 <X color="#f87171" size={22} />
//                 <Text style={[styles.buttonText, styles.declineText]}>Decline</Text>
//               </View>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={onAccept}
//               disabled={isExpired || loading || hasActiveJobConflict}
//               style={[styles.actionButton, (isExpired || loading || hasActiveJobConflict) && styles.buttonDisabled]}
//               activeOpacity={0.9}
//             >
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.buttonInner}>
//                 <Check color="#fff" size={22} />
//                 <Text style={styles.buttonText}>{loading ? "Processing..." : "Accept Job"}</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// function Row({ label, value }) {
//   return (
//     <View style={styles.detailRow}>
//       <Text style={styles.detailLabel}>{label}</Text>
//       <Text style={styles.detailValue}>{String(value ?? "—")}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },
//   loadingText: { color: "#fff", marginTop: 16, fontSize: 16 },
//   scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },
//   backButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "rgba(255,255,255,0.1)",
//     alignItems: "center",
//     justifyContent: "center",
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
//   headerBadgeText: { color: "#facc15", marginLeft: 8, fontSize: 16, fontWeight: "bold" },

//   timerCard: { borderRadius: 16, overflow: "hidden", marginBottom: 20 },
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

//   conflictBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: "rgba(250, 204, 21, 0.1)",
//     borderWidth: 1,
//     borderColor: "rgba(250, 204, 21, 0.3)",
//     marginBottom: 16,
//   },
//   conflictText: { color: "#fde68a", flex: 1 },

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
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "rgba(255,255,255,0.08)",
//   },
//   detailLabel: { fontSize: 16, color: "#e0e7ff", fontWeight: "600" },
//   detailValue: { fontSize: 16, color: "#fff", flex: 1, textAlign: "right" },

//   distanceRow: { flexDirection: "row", alignItems: "center", paddingTop: 12 },

//   earningsAmount: { fontSize: 36, fontWeight: "900", color: "#22c55e", textAlign: "center" },
//   earningsSubtext: { fontSize: 14, color: "#e0e7ff", textAlign: "center", marginTop: 4 },

//   muted: { color: "#94a3b8" },

//   errorText: { color: "#f87171", fontSize: 16, textAlign: "center" },

//   buttonRow: { flexDirection: "row", gap: 16, marginTop: 8 },
//   actionButton: {
//     flex: 1,
//     borderRadius: 16,
//     overflow: "hidden",
//     height: BTN_HEIGHT,
//     justifyContent: "center",
//   },
//   buttonInner: {
//     height: "100%",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     flexDirection: "row",
//   },
//   buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
//   buttonDisabled: { opacity: 0.5 },

//   declineButton: {
//     backgroundColor: "rgba(248, 113, 113, 0.1)",
//     borderWidth: 2,
//     borderColor: "rgba(248, 113, 113, 0.3)",
//   },
//   declineInner: { backgroundColor: "transparent" },
//   declineText: { color: "#f87171" },
// });


import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Vibration,
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Clock,
  Check,
  X,
  ArrowLeft,
  DollarSign,
  MapPin,
  Wrench,
  ClipboardList,
  Bell,
  AlertTriangle,
  FileText,
  MessageSquare,
  EyeOff,            // ⬅️ for teaser masking note
  Crown,             // ⬅️ for upgrade button
} from "lucide-react-native";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";
import QUESTIONS from "../utils/serviceMatrix";

const NOTIF_SOUND = require("../assets/notification.mp3");
const BTN_HEIGHT = 56;

// Foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ---------- helpers ----------
const fmtMMSS = (s) =>
  `${String(Math.floor((s || 0) / 60)).padStart(2, "0")}:${String((s || 0) % 60).padStart(2, "0")}`;

const toMiles = (m) => m / 1609.344;
const haversineMiles = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return toMiles(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
};

function prettifyKey(k = "") {
  return String(k)
    .replace(/[_\-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function computePayout(job) {
  if (!job) return { payout: null, breakdown: "" };

  const customerTotal = Number(job.estimatedTotal ?? job.totalWithFees ?? NaN);
  const customerFeePct = job.customerFeePct != null ? Number(job.customerFeePct) : 0.07;
  const providerFeePct = job.providerFeePct != null ? Number(job.providerFeePct) : 0.07;

  let base;
  if (Number.isFinite(job.baseSubtotal)) {
    base = Number(job.baseSubtotal);
  } else if (Number.isFinite(customerTotal)) {
    base = customerTotal / (1 + customerFeePct);
  } else {
    return { payout: null, breakdown: "" };
  }

  const payout = base * (1 - providerFeePct);
  const breakdown = Number.isFinite(customerTotal)
    ? `Based on customer payment $${base.toFixed(2)}, inclusive of a ${Math.round(
        providerFeePct * 100
      )}% BlinqFix fee.`
    : `Estimated payout after ${Math.round(providerFeePct * 100)}% provider fee.`;

  return { payout, breakdown };
}

function pairsFromDetails(details) {
  try {
    if (!details) return [];
    const obj = typeof details === "string" ? JSON.parse(details) : { ...details };

    if (Array.isArray(obj)) {
      return obj
        .map((x) => ({
          q: x?.question || x?.q || x?.label || "",
          a: x?.answer ?? x?.a ?? x?.value ?? "",
        }))
        .filter((p) => p.q || p.a);
    }
    if (obj?.answers && typeof obj.answers === "object") {
      return Object.entries(obj.answers).map(([q, a]) => ({ q, a }));
    }
    if (obj?.questions && typeof obj.questions === "object") {
      return Object.entries(obj.questions).map(([q, a]) => ({ q, a }));
    }
    if (obj?.qa && Array.isArray(obj.qa)) {
      return obj
        .map((x) => ({
          q: x?.question || x?.q || x?.label || "",
          a: x?.answer ?? x?.a ?? x?.value ?? "",
        }))
        .filter((p) => p.q || p.a);
    }
    if (obj && typeof obj === "object") {
      return Object.entries(obj).map(([q, a]) => ({ q, a }));
    }
  } catch {}
  return [];
}

function extractQA(job) {
  if (!job) return [];
  const out = [];
  out.push(...pairsFromDetails(job.details));
  if (job.emergencyForm) out.push(...pairsFromDetails(job.emergencyForm));
  if (job.intake) out.push(...pairsFromDetails(job.intake));
  if (Array.isArray(job.formResponses)) {
    out.push(
      ...job.formResponses
        .map((x) => ({
          q: x?.question || x?.q || x?.label || "",
          a: x?.answer ?? x?.a ?? x?.value ?? "",
        }))
        .filter((p) => p.q || p.a)
    );
  }
  if (job.formAnswers && typeof job.formAnswers === "object") {
    out.push(...Object.entries(job.formAnswers).map(([q, a]) => ({ q, a })));
  }
  if (job.questionsAnswers && typeof job.questionsAnswers === "object") {
    out.push(...Object.entries(job.questionsAnswers).map(([q, a]) => ({ q, a })));
  }
  const seen = new Set();
  const deduped = [];
  for (const p of out) {
    const key = `${p.q}::${Array.isArray(p.a) ? p.a.join(",") : String(p.a)}`;
    if (!seen.has(key) && (p.q || p.a)) {
      seen.add(key);
      deduped.push(p);
    }
  }
  return deduped;
}

// ——— resolve “clickable” robustly ———
function resolveClickable(routeParams, jobDoc) {
  if (routeParams && typeof routeParams.clickable === "boolean") return routeParams.clickable;
  if (routeParams && typeof routeParams.buttonsActive === "boolean") return routeParams.buttonsActive;
  if (jobDoc && typeof jobDoc.clickable === "boolean") return jobDoc.clickable;
  if (jobDoc && typeof jobDoc.buttonsActive === "boolean") return jobDoc.buttonsActive;
  // default safest: teaser
  return false;
}

export default function ProviderInvitationScreen() {
  const { jobId, invitationExpiresAt, clickable: paramClickable, buttonsActive } = useRoute().params || {};
  const navigation = useNavigation();

  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [distanceMiles, setDistanceMiles] = useState(null);
  const [hasActiveJobConflict, setHasActiveJobConflict] = useState(false);

  const soundRef = useRef(null);
  const geocodeCacheRef = useRef({});

  // audio mode
  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        });
      } catch {}
    })();
  }, []);

  const playUrgentAlert = useCallback(async () => {
    try {
      Vibration.vibrate([0, 350, 150, 350, 150, 600]);
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(NOTIF_SOUND, {
        shouldPlay: true,
        isLooping: false,
        volume: 1.0,
      });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          try {
            await sound.unloadAsync();
          } catch {}
          if (soundRef.current === sound) soundRef.current = null;
        }
      });
    } catch {}
  }, []);

  const cleanupAudio = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
  }, []);

  // expiry timer
  useEffect(() => {
    if (!invitationExpiresAt) return;
    const expiry = Date.parse(invitationExpiresAt);
    const tick = () => setRemaining(Math.max(0, Math.ceil((expiry - Date.now()) / 1000)));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [invitationExpiresAt]);

  // fetch job + active job + distance
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!jobId) throw new Error("Missing jobId param");

        // If teaser, hint backend to redact (safe if ignored server-side)
        const teaserHint = paramClickable === false ? "?teaser=1" : "";
        const { data } = await api.get(`/jobs/${jobId}${teaserHint}`);
        if (!alive) return;
        setJob(data);

        try {
          const { data: active } = await api.get("/jobs/provider/active");
          if (active && active._id && active._id !== jobId) {
            setHasActiveJobConflict(true);
          } else {
            setHasActiveJobConflict(false);
          }
        } catch (e) {
          if (e?.response?.status !== 404) {
            // ignore other errors for UI
          }
        }

        await computeDistance(data);
      } catch (err) {
        Alert.alert("Error", err?.response?.data?.msg || "Failed to load job details.");
      } finally {
        if (alive) setJobLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, paramClickable]);

  // resolve teaser vs real (after job load too)
  const resolvedClickable = useMemo(() => resolveClickable({ clickable: paramClickable, buttonsActive }, job), [paramClickable, buttonsActive, job]);
  const isTeaser = !resolvedClickable;

  // DEBUG
  useEffect(() => {
    console.log("[INVITE_DEBUG] ProviderInvitation", {
      jobId,
      invitationExpiresAt,
      routeClickable: paramClickable,
      routeButtonsActive: buttonsActive,
      jobClickable: job?.clickable,
      jobButtonsActive: job?.buttonsActive,
      resolvedClickable,
      isTeaser,
      invitationPhase: job?.invitationPhase,
      roleHint: job?.roleHint, // if you ever attach this from server
    });
  }, [jobId, invitationExpiresAt, paramClickable, buttonsActive, job, resolvedClickable, isTeaser]);

  // chime only for real invites
  useEffect(() => {
    if (resolvedClickable && job) playUrgentAlert();
  }, [resolvedClickable, job, playUrgentAlert]);

  // distance helpers
  const geocodeCached = async (query) => {
    if (!query) return null;
    const key = query.trim().toLowerCase();
    if (geocodeCacheRef.current[key]) return geocodeCacheRef.current[key];
    try {
      const results = await Location.geocodeAsync(query);
      const hit = results?.[0]
        ? { lat: results[0].latitude, lng: results[0].longitude }
        : null;
      geocodeCacheRef.current[key] = hit;
      return hit;
    } catch {
      return null;
    }
  };

  const getJobCoords = async (j) => {
    if (!j) return null;
    const coords = j.location?.coordinates; // [lng, lat]
    if (Array.isArray(coords) && coords.length >= 2) {
      return { lat: Number(coords[1]), lng: Number(coords[0]) };
    }
    if (Number.isFinite(j.latitude) && Number.isFinite(j.longitude)) {
      return { lat: Number(j.latitude), lng: Number(j.longitude) };
    }
    const parts = [j.serviceCity, j.serviceState, j.serviceZip].filter(Boolean);
    const cityish = parts.join(", ");
    return geocodeCached(cityish || null);
  };

  const getProviderCoords = async () => {
    try {
      const raw = await AsyncStorage.getItem("me");
      if (raw) {
        try {
          const me = JSON.parse(raw)?.user ?? JSON.parse(raw);
          const coords = me?.location?.coordinates;
          if (Array.isArray(coords) && coords.length >= 2) {
            return { lat: Number(coords[1]), lng: Number(coords[0]) };
          }
          const parts = [];
          if (me?.address) parts.push(me.address);
          if (Array.isArray(me?.zipcode) && me.zipcode[0]) parts.push(String(me.zipcode[0]));
          else if (typeof me?.zipcode === "string" && me.zipcode.trim()) parts.push(me.zipcode.trim());
          const addr = parts.join(", ");
          const geo = await geocodeCached(addr);
          if (geo) return geo;
        } catch {}
      }
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        const req = await Location.requestForegroundPermissionsAsync();
        status = req.status;
      }
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        return { lat: pos.coords.latitude, lng: pos.coords.longitude };
      }
    } catch {}
    return null;
  };

  const computeDistance = async (j) => {
    try {
      if (j?.distanceFromProvider && Number.isFinite(j.distanceFromProvider)) {
        setDistanceMiles(Number(j.distanceFromProvider));
        return;
      }
      const [jc, pc] = await Promise.all([getJobCoords(j), getProviderCoords()]);
      if (jc && pc) {
        setDistanceMiles(haversineMiles(pc.lat, pc.lng, jc.lat, jc.lng));
      } else {
        setDistanceMiles(null);
      }
    } catch {
      setDistanceMiles(null);
    }
  };

  // mask PII for teaser (client-side in case server forgets)
  const maskedJob = useMemo(() => {
    if (!job) return null;
    if (!isTeaser) return job;

    return {
      ...job,
      // Hide PII or exact address for teaser
      address: "Hidden — upgrade to view",
      unit: undefined,
      customer: undefined,
      customerName: undefined,
      phoneNumber: undefined,
      email: undefined,
      // You may also want to hide very specific notes if they include PII
    };
  }, [job, isTeaser]);

  // actions
  const onAccept = async () => {
    if (isTeaser) {
      Alert.alert("Upgrade required", "This is a job invite. Upgrade your subscription to accept jobs.");
      return;
    }
    if (hasActiveJobConflict) {
      Alert.alert(
        "Active Job in Progress",
        "You already have an active job. Finish it before accepting a new one.",
        [
          { text: "Go to Active Job", onPress: () => navigation.replace("ProviderJobStatus") },
          { text: "OK", style: "cancel" },
        ]
      );
      return;
    }
    setLoading(true);
    try {
      await cleanupAudio();
      await Notifications.dismissAllNotificationsAsync().catch(() => {});
      await api.put(`/jobs/${jobId}/accept`);
      Alert.alert("Accepted", "You’ve claimed this job.", [
        { text: "OK", onPress: () => navigation.replace("ProviderJobStatus", { jobId }) },
      ]);
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.msg || "Could not accept job.");
    } finally {
      setLoading(false);
    }
  };

  const onDecline = async () => {
    if (isTeaser) {
      // Teaser: just close (optional to notify server)
      navigation.replace("ServiceProviderDashboard");
      return;
    }
    setLoading(true);
    try {
      await cleanupAudio();
      await Notifications.dismissAllNotificationsAsync().catch(() => {});
      await api.put(`/jobs/${jobId}/deny`);
      Alert.alert("Declined", "You’ve passed on this invitation.", [
        { text: "OK", onPress: () => navigation.replace("ServiceProviderDashboard") },
      ]);
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.msg || "Could not decline job.");
    } finally {
      setLoading(false);
    }
  };

  const onUpgrade = () => {
    // Change the route if you have a dedicated upgrade screen
    navigation.navigate("MyAccountScreen", { source: "teaser_invite", jobId });
  };

  // ----- UI -----
  const isExpired = remaining === 0;
  const qa = extractQA(maskedJob);
  const serviceLabel = maskedJob?.serviceType || maskedJob?.service || maskedJob?.category || "Service";
  const { payout, breakdown } = computePayout(maskedJob);

  if (jobLoading || !maskedJob) {
    return (
      <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading Job Invitation...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
         {/* Header */}
<View style={styles.header}>
  {/* Top row with just the back button */}
  <View style={styles.headerTopRow}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
      <ArrowLeft color="#fff" size={24} />
    </TouchableOpacity>
  </View>

  {/* Centered banner under the back button */}
  <View style={styles.bannerWrap}>
    <View style={[styles.headerBadge, isTeaser ? styles.teaserBadge : styles.realBadge]}>
      <Bell color={isTeaser ? "#facc15" : "#22c55e"} size={16} />
      <Text
        style={[styles.headerBadgeText, { color: isTeaser ? "#facc15" : "#22c55e" }]}
        numberOfLines={0} // allow wrapping
      >
        {isTeaser
          ? "Job Nearby — only for Priority Users until the last phase of invitations."
          : "New Job Invitation"}
      </Text>
    </View>
  </View>
</View>

          {/* Timer */}
          <View style={[styles.timerCard, isExpired && styles.timerCardExpired]}>
            <LinearGradient
              colors={
                isExpired
                  ? ["rgba(239, 68, 68, 0.2)", "rgba(220, 38, 38, 0.1)"]
                  : ["rgba(250, 204, 21, 0.2)", "rgba(234, 179, 8, 0.1)"]
              }
              style={styles.timerGradient}
            >
              <Clock color={isExpired ? "#ef4444" : "#facc15"} size={28} />
              <Text style={[styles.timerText, isExpired && styles.timerTextExpired]}>
                {isExpired ? "Invitation Expired" : `Expires in ${fmtMMSS(remaining)}`}
              </Text>
            </LinearGradient>
          </View>

          {/* Active job conflict banner */}
          {hasActiveJobConflict && !isTeaser && (
            <View style={styles.conflictBanner}>
              <AlertTriangle color="#fbbf24" size={18} />
              <Text style={styles.conflictText}>
                You already have an active job. You can’t accept a new one until it’s finished.
              </Text>
            </View>
          )}

          {/* Job Details */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Wrench color="#60a5fa" size={24} />
              <Text style={styles.cardTitle}>Job Details</Text>
            </View>
            <Row label="Service" value={serviceLabel} />
            <Row
              label="Location"
              value={
                isTeaser
                  ? "Hidden — upgrade to view"
                  : `${maskedJob.address ?? ""}${maskedJob.serviceCity ? `, ${maskedJob.serviceCity}` : ""}`
              }
            />
            <View style={styles.distanceRow}>
              <MapPin color="#e0e7ff" size={16} style={{ marginRight: 8 }} />
              <Text style={styles.detailValue}>
                {Number.isFinite(maskedJob?.distanceFromProvider)
                  ? `${Number(maskedJob.distanceFromProvider).toFixed(1)} miles away`
                  : distanceMiles != null
                  ? `${distanceMiles.toFixed(1)} miles away`
                  : "Calculating distance..."}
              </Text>
            </View>
            {isTeaser && (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 }}>
                <EyeOff size={14} color="#94a3b8" />
                <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                  Exact address and customer details are not available until last phase of invites.
                </Text>
              </View>
            )}
          </View>

          {/* Potential Earnings */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <DollarSign color="#22c55e" size={24} />
              <Text style={styles.cardTitle}>Potential Earnings</Text>
            </View>
            <Text style={styles.earningsAmount}>
              {Number.isFinite(payout) ? `$${payout.toFixed(2)}` : "N/A"}
            </Text>
            {!!breakdown && <Text style={styles.earningsSubtext}>{breakdown}</Text>}
          </View>

          {/* Emergency Form Q&A */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ClipboardList color="#c084fc" size={24} />
              <Text style={styles.cardTitle}>Emergency Form</Text>
            </View>

            {qa.length > 0 ? (
              <View style={{ borderRadius: 12, overflow: "hidden" }}>
                <LinearGradient
                  colors={["rgba(168, 85, 247, 0.15)", "rgba(147, 51, 234, 0.05)"]}
                  style={{ padding: 12, borderRadius: 12 }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <MessageSquare color="#a855f7" size={20} />
                    <Text style={[styles.cardTitle, { marginLeft: 8 }]}>Responses</Text>
                  </View>

                  {qa.map((pair, i) => {
                    const k = pair.q || "";
                    const v = pair.a;
                    const label = QUESTIONS?.[k] ?? prettifyKey(k);
                    return (
                      <View key={`${k}-${i}`} style={{ marginBottom: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                          <FileText color="#94a3b8" size={16} />
                          <Text style={{ color: "#fff", marginLeft: 8, fontWeight: "600" }}>
                            {label}
                          </Text>
                        </View>
                        <Text style={{ color: "#e0e7ff", marginLeft: 24, lineHeight: 20 }}>
                          {Array.isArray(v) ? v.join(", ") : String(v)}
                        </Text>
                        {i < qa.length - 1 && (
                          <View
                            style={{
                              height: 1,
                              backgroundColor: "rgba(255,255,255,0.1)",
                              marginTop: 8,
                            }}
                          />
                        )}
                      </View>
                    );
                  })}
                </LinearGradient>
              </View>
            ) : (
              <Text style={styles.muted}>No additional answers were provided.</Text>
            )}
          </View>

          {/* Actions */}
          {isTeaser ? (
            <View style={styles.teaserActions}>
              <TouchableOpacity onPress={onUpgrade} activeOpacity={0.9} style={styles.upgradeBtn}>
                <LinearGradient colors={["#facc15", "#eab308"]} style={styles.buttonInner}>
                  <Crown color="#1f2937" size={20} />
                  <Text style={[styles.buttonText, { color: "#1f2937" }]}>Upgrade Subscription</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.replace("ServiceProviderDashboard")} style={styles.secondaryBtn}>
                <X color="#94a3b8" size={18} />
                <Text style={[styles.secondaryText, { color: "#e0e7ff" }]}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={onDecline}
                disabled={isExpired || loading}
                style={[
                  styles.actionButton,
                  styles.declineButton,
                  (isExpired || loading) && styles.buttonDisabled,
                ]}
                activeOpacity={0.85}
              >
                <View style={[styles.buttonInner, styles.declineInner]}>
                  <X color="#f87171" size={22} />
                  <Text style={[styles.buttonText, styles.declineText]}>Decline</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onAccept}
                disabled={isExpired || loading || hasActiveJobConflict}
                style={[styles.actionButton, (isExpired || loading || hasActiveJobConflict) && styles.buttonDisabled]}
                activeOpacity={0.9}
              >
                <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.buttonInner}>
                  <Check color="#fff" size={22} />
                  <Text style={styles.buttonText}>{loading ? "Processing..." : "Accept Job"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{String(value ?? "—")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#fff", marginTop: 16, fontSize: 16 },
  scrollContent: { padding: 20, paddingBottom: 40, marginTop: 60, },

  header: {
    flexDirection: "column",
    alignItems: "start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headerCenter: { alignItems: "center" },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  teaserBadge: {
    backgroundColor: "rgba(250, 204, 21, 0.1)",
    borderColor: "rgba(250, 204, 21, 0.3)",
    
  },
  realBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderColor: "rgba(34, 197, 94, 0.35)",
    marginRight:'30%',
    
  },
  headerBadgeText: { marginLeft: 8, fontSize: 16, fontWeight: "bold" },

  timerCard: { borderRadius: 16, overflow: "hidden", marginBottom: 20 },
  timerCardExpired: { borderColor: "rgba(239, 68, 68, 0.3)" },
  timerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  timerText: { fontSize: 22, fontWeight: "bold", color: "#facc15" },
  timerTextExpired: { color: "#ef4444" },

  conflictBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(250, 204, 21, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.3)",
    marginBottom: 16,
  },
  conflictText: { color: "#fde68a", flex: 1 },

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

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  detailLabel: { fontSize: 16, color: "#e0e7ff", fontWeight: "600" },
  detailValue: { fontSize: 16, color: "#fff", flex: 1, textAlign: "right" },

  distanceRow: { flexDirection: "row", alignItems: "center", paddingTop: 12 },

  earningsAmount: { fontSize: 36, fontWeight: "900", color: "#22c55e", textAlign: "center" },
  earningsSubtext: { fontSize: 14, color: "#e0e7ff", textAlign: "center", marginTop: 4 },

  muted: { color: "#94a3b8" },

  // Real invite actions
  buttonRow: { flexDirection: "row", gap: 16, marginTop: 8 },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    height: BTN_HEIGHT,
    justifyContent: "center",
  },
  buttonInner: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexDirection: "row",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  buttonDisabled: { opacity: 0.5 },
  declineButton: {
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(248, 113, 113, 0.3)",
  },
  declineInner: { backgroundColor: "transparent" },
  declineText: { color: "#f87171" },

  // Teaser actions
  teaserActions: { gap: 12, marginTop: 8 },
  upgradeBtn: { borderRadius: 16, overflow: "hidden", height: BTN_HEIGHT, justifyContent: "center" },
  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  secondaryText: { fontWeight: "800" },
});
