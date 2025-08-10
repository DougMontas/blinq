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
import JobDetails from "../components/JobDetails"; // Assuming this component is flexible or we might need to adjust it

export default function ProviderInvitationScreen() {
  const { jobId, invitationExpiresAt, clickable } = useRoute().params;
  const navigation = useNavigation();

  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);

  useEffect(() => {
    async function triggerVibration() {
        try {
            Vibration.vibrate([500, 500, 500]);
        } catch (e) {
            console.warn("📳 Failed to vibrate", e);
        }
    }

    if (clickable) {
        triggerVibration();
    }
  }, [clickable]);

  useEffect(() => {
    if (!invitationExpiresAt) return;
    const expiry = Date.parse(invitationExpiresAt);
    const tick = () => {
      const secs = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
      setRemaining(secs);
      if (secs === 0) {
        // Optional: Navigate away or show expired message more prominently
      }
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [invitationExpiresAt]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!jobId) throw new Error("Missing jobId param");
        const { data } = await api.get(`/jobs/${jobId}`);
        if (alive) setJob(data);
      } catch (err) {
        console.error("❌ Error fetching job details:", err);
        Alert.alert("Error", "Failed to load job details.");
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
              <TouchableOpacity style={styles.upgradeButton} onPress={() => navigation.navigate("MyAccountScreen")}>
                 <LinearGradient colors={['#facc15', '#eab308']} style={styles.buttonGradient}>
                    <Star color="#fff" size={20} />
                    <Text style={styles.buttonText}>Upgrade to Accept</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton, (isExpired || loading) && styles.buttonDisabled]}
                  onPress={handleDecline}
                  disabled={isExpired || loading}
                >
                  <X color="#f87171" size={24} />
                  <Text style={[styles.buttonText, styles.declineButtonText]}>Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton, (isExpired || loading) && styles.buttonDisabled]}
                  onPress={handleAccept}
                  disabled={isExpired || loading}
                >
                  <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.buttonGradient}>
                    <Check color="#fff" size={24} />
                    <Text style={styles.buttonText}>
                        {loading ? 'Processing...' : 'Accept Job'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
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
        gap: 16
    },
    actionButton: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    acceptButton: {},
    declineButton: {
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        borderWidth: 2,
        borderColor: 'rgba(248, 113, 113, 0.3)',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
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
    upgradeButton: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden'
    }
});
