// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Button,
//   ActivityIndicator,
//   Alert,
//   Image,
//   Dimensions,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import JobDetails from "../components/JobDetails";
// import api from "../api/client";
// import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// export default function ProviderInvitationScreen() {
//   const { jobId, invitationExpiresAt, clickable } = useRoute().params;
//   const navigation = useNavigation();

//   const [remaining, setRemaining] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [job, setJob] = useState(null);
//   const [jobLoading, setJobLoading] = useState(true);
//   const [isClickable, setIsClickable] = useState(clickable);

//   useEffect(() => {
//     if (!invitationExpiresAt) return;
//     const expiry = Date.parse(invitationExpiresAt);
//     const tick = () => {
//       const secs = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
//       setRemaining(secs);
//       if (secs <= 0) setIsClickable(true);
//     };
//     tick();
//     const iv = setInterval(tick, 1000);
//     return () => clearInterval(iv);
//   }, [invitationExpiresAt]);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (alive) setJob(data);
//       } catch (err) {
//         console.error("Error fetching job details:", err);
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

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.containerLogo}>
//         <Image
//           source={require("../assets/blinqfix_logo-new.jpeg")}
//           style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
//           resizeMode="contain"
//         />
//       </View>

//       <Text style={styles.header}>New Job Invitation</Text>

//       {remaining != null && (
//         <Text style={styles.timer}>
//           {remaining > 0
//             ? `Expires in ${fmt(remaining)}`
//             : "Invitation expired"}
//         </Text>
//       )}

//       {jobLoading ? (
//         <ActivityIndicator style={{ marginTop: 20 }} />
//       ) : (
//         <>
//           <JobDetails job={job} />
//           <Text style={styles.coveredTitle}>What's Covered:</Text>
//           <Text style={styles.coveredText}>{coveredText}</Text>
//         </>
//       )}

//       {loading ? (
//         <ActivityIndicator style={{ marginTop: 20 }} />
//       ) : (
//         <View style={styles.buttons}>
//           <Button
//             title="Accept"
//             onPress={handleAccept}
//             disabled={!isClickable}
//             color={isClickable ? "#1976d2" : "#999"}
//           />
//           <Button
//             title="Decline"
//             onPress={handleDecline}
//             disabled={remaining === 0}
//             color="#d32f2f"
//           />
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 10, backgroundColor: "#fff", marginTop: 50 },
//   containerLogo: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 12,
//     textAlign: "center",
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
//     justifyContent: "space-around",
//     marginTop: 20,
//     paddingBottom: 100,
//     borderRadius: 8,
//   },
//   coveredTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginTop: 20,
//     textAlign: "center",
//   },
//   coveredText: {
//     fontSize: 14,
//     color: "#444",
//     marginTop: 4,
//     textAlign: "center",
//   },
// });


import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import JobDetails from "../components/JobDetails";
import api from "../api/client";
import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";

const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.55;

export default function ProviderInvitationScreen() {
  const { jobId, invitationExpiresAt, clickable } = useRoute().params;
  const navigation = useNavigation();

  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [isClickable, setIsClickable] = useState(clickable);

  useEffect(() => {
    if (!invitationExpiresAt) return;
    const expiry = Date.parse(invitationExpiresAt);
    const tick = () => {
      const secs = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0) setIsClickable(true);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [invitationExpiresAt]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get(`/jobs/${jobId}`);
        if (alive) setJob(data);
      } catch (err) {
        console.error("Error fetching job details:", err);
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
      Alert.alert("Error", err.response?.data?.msg || err.message);
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
      Alert.alert("Error", err.response?.data?.msg || err.message);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.containerLogo}>
        <Image
          source={require("../assets/blinqfix_logo-new.jpeg")}
          style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.header}>New Job Invitation</Text>

      {remaining != null && (
        <Text style={styles.timer}>
          {remaining > 0
            ? `Expires in ${fmt(remaining)}`
            : "Invitation expired"}
        </Text>
      )}

      {jobLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <>
          <JobDetails job={job} />
          <Text style={styles.coveredTitle}>What's Covered:</Text>
          <Text style={styles.coveredText}>{coveredText}</Text>
        </>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, !isClickable && styles.buttonDisabled]}
            onPress={handleAccept}
            disabled={!isClickable}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.declineButton, remaining === 0 && styles.buttonDisabled]}
            onPress={handleDecline}
            disabled={remaining === 0}
          >
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: "#fff", marginTop: 50 },
  containerLogo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  timer: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingBottom: 100,
  },
  button: {
    backgroundColor: "#1976d2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: "center",
  },
  declineButton: {
    backgroundColor: "#d32f2f",
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  coveredTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  coveredText: {
    fontSize: 14,
    color: "#444",
    marginTop: 4,
    textAlign: "center",
  },
});
