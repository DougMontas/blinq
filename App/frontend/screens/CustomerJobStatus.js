// screens/CustomerJobStatus.js
//previous
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   Pressable,
//   Button,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import io from "socket.io-client";
// import api from "../api/client";
// import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
// import BackButton from "../components/BackButton";

// export default function CustomerJobStatus() {
//   const { jobId } = useRoute().params;
//   const navigation = useNavigation();

//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [confirming, setConfirming] = useState(false);
//   const details = job?.details ?? {};

//   const issueKey = details.issue;
//   const description = issueKey ? getCoveredDescription(issueKey) : null;

//   let entries = [];
//   if (typeof details === "object") {
//     entries = Object.entries(details);
//   }

//   // 1) Socket “jump in” when a provider accepts
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

//     return () => void socket.disconnect();
//   }, [jobId, navigation]);

//   // 2) Poll & if extra-charge arrives, redirect homeowner to PaymentScreen
//   useEffect(() => {
//     let alive = true;

//     const fetchJob = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
//         if (!alive) return;
//         setJob(data);

//         if (data.status === "awaiting-additional-payment") {
//           // redirect *immediately* to the payment flow
//           navigation.replace("PaymentScreen", { jobId });
//         }
//       } catch (err) {
//         alive && Alert.alert("Error", "Unable to load job status.");
//       } finally {
//         alive && setLoading(false);
//       }
//     };

//     fetchJob();
//     const iv = setInterval(fetchJob, 25000);
//     return () => {
//       alive = false;
//       clearInterval(iv);
//     };
//   }, [jobId, navigation]);

//   // 3) Once fully completed, send to rating
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

//   // 4) Customer “confirm complete” button
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

//   // pull out the issue + lookup in your coveredDescriptions map

//   // 5) Price breakdown (including extra charge + convenience fee)
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
//       {/* {description && (
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>What’s Covered:</Text>
//           <Text style={styles.descriptionText}>{description}</Text>
//         </View>
//       )} */}
//       {/* <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
//         <Text style={styles.backBtnText}>← Back</Text>
//        </Pressable> */}
//        <BackButton />
//       <Text style={styles.title}>Your Job Status</Text>
//       <Text>
//         Status: {job.status}
//         {"\n\n"}
//       </Text>

//       {/* <Text style={{ color: "red" }}>
//         Your BlinqFix pro is on their way!
//         {"\n\n"}
//         Make the necessary preparations for the 
//               service provider. For example, put away any dangerous animals 
//               such as dogs, ensure gate access or provide directions if in a 
//               gated community..
//       </Text> */}

// {(job.status === "accepted") && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>Your emergency service pro {"\n"}is now in route</Text>
//           <Text>
        
//             <Text style={{ color: "red",  textAlign: "center", }}>
//               Make the necessary preparations for the 
//               service provider. For example, put away any dangerous animals 
//               such as dogs, ensure gate access or provide directions if in a 
//               gated community..
//             </Text>
//             {"\n\n"}
//             {"\n\n"}
//             <Text style={styles.sectionTitle}>What’s Covered:{"\n"}</Text>
//             <Text style={styles.descriptionText}>{description}</Text>
//           </Text>
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

//       {(job.status === "pending" || job.status === "invited") && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>Please Wait…</Text>
//           <Text>
//             Your BlinqFix emergency request has been sent out to a local professional.
//             {"\n\n"}
//             {/* <Text style={{ color: "red" }}>
//               Make the necessary preparations for the 
//               service provider. For example, put away any dangerous animals 
//               such as dogs, ensure gate access or provide directions if in a 
//               gated community..
//             </Text> */}
//             {"\n\n"}
//             {"\n\n"}
//             <Text style={styles.sectionTitle}>What’s Covered:{"\n"}</Text>
//             <Text style={styles.descriptionText}>{description}</Text>
//           </Text>
//         </View>
//       )}

//       {job.providerCompleted && !job.customerCompleted && (
//         // <View style={styles.confirm}>
//         //   <Text style={styles.heading}>Confirm Job Complete</Text>
//         //   <Text>The provider marked this job complete. Please confirm below:</Text>
//         //   <Button
//         //     title={confirming ? "Confirming…" : "Confirm Job Complete"}
//         //     onPress={handleCustomerComplete}
//         //     disabled={confirming}
//         //   />
//         // </View>
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
//     textAlign: "center",
//   },
//   heading: { fontSize: 18, fontWeight: "600", marginBottom: 8,  textAlign: "center", },
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

//   section: { marginTop: 20 },
//   sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4,  textAlign: "center", },
//   descriptionText: { fontSize: 14, color: "#555", lineHeight: 20 },
// });


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


const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.25;

export default function CustomerJobStatus() {
  const { jobId } = useRoute().params;
  const navigation = useNavigation();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const details = job?.details ?? {};
  const description = details.issue ? getCoveredDescription(details.issue) : null;

  // 1) Socket “join” to receive real-time updates
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

  // 2) Fetch job + auto-redirect for payment
  useEffect(() => {
    let alive = true;

    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
        if (!alive) return;
        setJob(data);

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

  // 3) Navigate to rate screen after completion
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
      <BackButton />
      <View style={styles.containerLogo}>
            <Image
              source={require("../assets/blinqfix_logo-new.jpeg")}
              style={[
                { width: LOGO_SIZE, height: LOGO_SIZE, marginHorizontal: 120},
              ]}
              resizeMode="contain"
            />
          </View>
          <Text>{"\n"}</Text>
      <Text style={styles.title}>Your Job Status</Text>
      <Text style={{ marginBottom: 16 }}>Status: {job.status}</Text>

      {job.status === "accepted" && (
        <View style={styles.waiting}>
          <Text style={styles.heading}>
            Your emergency service pro is now in route
          </Text>
          <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
            Make the necessary preparations. Put away pets, ensure gate access,
            and prepare directions if needed.
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
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
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
});




// frontend/screens/CustomerJobStatusPage.js - original
// import React, { useEffect, useState } from "react";
// import { View, Text, Button, StyleSheet } from "react-native";
// import { io } from "socket.io-client";
// import api from "../api/client";
// import { useAuth } from "../context/AuthProvider";

// const socket = io(process.env.EXPO_PUBLIC_API_URL, { transports: ["websocket"] });

// export default function CustomerJobStatusPage({ route, navigation }) {
//   const { user } = useAuth();
//   const { jobId } = route.params;
//   const [job, setJob] = useState(null);

//   useEffect(() => {
//     socket.emit("joinUserRoom", { userId: user.id });
//     socket.on("jobAccepted", ({ jobId: id }) => {
//       if (id === jobId) setJob((j) => ({ ...j, status: "accepted" }));
//     });
//     socket.on("jobCompleted", ({ jobId: id }) => {
//       if (id === jobId) setJob((j) => ({ ...j, status: "completed" }));
//     });
//     return () => {
//       socket.off("jobAccepted");
//       socket.off("jobCompleted");
//     };
//   }, [user, jobId]);

//   const confirm = async () => {
//     await api.post(`/jobs/${jobId}/confirm`);
//     Alert.alert("Job Confirmed", "Funds will be released shortly.");
//     navigation.navigate("CustomerDashboard");
//   };

//   if (!job) return <Text>Waiting for provider…</Text>;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Job Status</Text>
//       <Text>Status: {job.status}</Text>
//       {job.status === "completed" && (
//         <Button title="Confirm Completion" onPress={confirm} />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16 },
//   title: { fontSize: 20, fontWeight: "bold" }
// });



//last active
// import React, { useEffect, useState } from "react";
// import { View, Text, Button, StyleSheet, Alert } from "react-native";
// import { io } from "socket.io-client";
// import api from "../api/client";
// import { useAuth } from "../context/AuthProvider";

// // Make sure environment variable is defined correctly
// const socket = io(process.env.EXPO_PUBLIC_API_URL, { transports: ["websocket"] });

// export default function CustomerJobStatusPage({ route, navigation }) {
//   const { user } = useAuth();
//   const { jobId } = route.params;
//   const [job, setJob] = useState(null);

//   useEffect(() => {
//     // Join user's room
//     socket.emit("joinUserRoom", { userId: user.id });

//     // Listen for job updates
//     const handleJobAccepted = ({ jobId: id }) => {
//       if (id === jobId) {
//         setJob((j) => ({ ...j, status: "accepted" }));
//       }
//     };

//     const handleJobCompleted = ({ jobId: id }) => {
//       if (id === jobId) {
//         setJob((j) => ({ ...j, status: "completed" }));
//       }
//     };

//     socket.on("jobAccepted", handleJobAccepted);
//     socket.on("jobCompleted", handleJobCompleted);

//     return () => {
//       socket.off("jobAccepted", handleJobAccepted);
//       socket.off("jobCompleted", handleJobCompleted);
//     };
//   }, [user.id, jobId]);

//   const confirm = async () => {
//     await api.post(`/jobs/${jobId}/confirm`);
//     Alert.alert("Job Confirmed", "Funds will be released shortly.");
//     navigation.navigate("CustomerDashboard");
//   };

//   if (!job) return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Waiting for provider…</Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Job Status</Text>
//       <Text>Status: {job.status}</Text>
//       {job.status === "completed" && (
//         <Button title="Confirm Completion" onPress={confirm} />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16 },
//   title: { fontSize: 20, fontWeight: "bold" }
// });


// screens/CustomerJobStatus.js

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   Pressable,
//   Button,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import io from "socket.io-client";
// import api from "../api/client";
// import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
// import BackButton from "../components/BackButton";
// import { useJobPolling } from "../components/usePolling";

// export default function CustomerJobStatus() {
//   const { jobId } = useRoute().params;
//   const navigation = useNavigation();

//   // const [job, setJob] = useState(null);
//   // const [loading, setLoading] = useState(true);
//   const [confirming, setConfirming] = useState(false);
//   const [notifiedComplete, setNotifiedComplete] = useState(false);
//   const details = job?.details ?? {};

//   const issueKey = details.issue;
//   const description = issueKey ? getCoveredDescription(issueKey) : null;

//   let entries = [];
//   if (typeof details === "object") {
//     entries = Object.entries(details);
//   }

//   // 1) Socket “jump in” when a provider accepts
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

//     return () => void socket.disconnect();
//   }, [jobId, navigation]);

//   // 2) Poll & if extra-charge arrives, redirect homeowner to PaymentScreen
//   useEffect(() => {
//     let alive = true;

//     const fetchJob = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
//         if (!alive) return;
//         setJob(data);

//         if (data.status === "awaiting-additional-payment") {
//           // redirect *immediately* to the payment flow
//           navigation.replace("PaymentScreen", { jobId });
//         }
//       } catch (err) {
//         alive && Alert.alert("Error", "Unable to load job status.");
//       } finally {
//         alive && setLoading(false);
//       }
//     };

//     fetchJob();
//     const iv = setInterval(fetchJob, 25000);
//     return () => {
//       alive = false;
//       clearInterval(iv);
//     };
//   }, [jobId, navigation]);

//   // ______________use Polling

//   const { job, loading } = useJobPolling({
//     jobId,
//     navigation,
//     onComplete: () => setNotifiedComplete(true),
//     forProvider: false,
//   });

// //   useEffect(() => {
// //   let alive = true;
// //   const fetchJob = async () => {
// //     try {
// //       const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
// //       if (!alive) return;

// //       setJob(data);

// //       if (data.status === "completed" && !notifiedComplete) {
// //         setNotifiedComplete(true);
// //         Alert.alert("Job Complete", "This job is now fully completed.", [
// //           { text: "OK", onPress: () => navigation.navigate("ServiceProviderDashboard") },
// //         ]);
// //       }

// //       // ⏱ Correct placement: only set timer once after acceptance
// //       if (data.invitationAccepted && !phoneTimer.current && !showPhone) {
// //         phoneTimer.current = setTimeout(() => {
// //           setShowPhone(true);
// //         }, 6 * 60 * 1000); // 6 minutes
// //       }
// //     } catch {
// //       alive && Alert.alert("Error", "Unable to load job");
// //     } finally {
// //       alive && setLoading(false);
// //     }
// //   };

// //   fetchJob();
// //   const iv = setInterval(fetchJob, 25000);

// //   return () => {
// //     alive = false;
// //     clearInterval(iv);
// //     if (phoneTimer.current) clearTimeout(phoneTimer.current);
// //   };
// // }, [jobId, notifiedComplete, navigation, showPhone]);


//   // 3) Once fully completed, send to rating
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

//   // 4) Customer “confirm complete” button
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

//   // pull out the issue + lookup in your coveredDescriptions map

//   // 5) Price breakdown (including extra charge + convenience fee)
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
//       {/* {description && (
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>What’s Covered:</Text>
//           <Text style={styles.descriptionText}>{description}</Text>
//         </View>
//       )} */}
//       {/* <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
//         <Text style={styles.backBtnText}>← Back</Text>
//        </Pressable> */}
//        <BackButton />
//       <Text style={styles.title}>Your Job Status</Text>
//       <Text>
//         Status: {job.status}
//         {"\n\n"}
//       </Text>

//       {/* <Text style={{ color: "red" }}>
//         Your BlinqFix pro is on their way!
//         {"\n\n"}
//         Make the necessary preparations for the 
//               service provider. For example, put away any dangerous animals 
//               such as dogs, ensure gate access or provide directions if in a 
//               gated community..
//       </Text> */}

// {(job.status === "accepted") && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>Your emergency service pro {"\n"}is now in route</Text>
//           <Text>
        
//             <Text style={{ color: "red",  textAlign: "center", }}>
//               Make the necessary preparations for the 
//               service provider. For example, put away any dangerous animals 
//               such as dogs, ensure gate access or provide directions if in a 
//               gated community..
//             </Text>
//             {"\n\n"}
//             {"\n\n"}
//             <Text style={styles.sectionTitle}>What’s Covered:{"\n"}</Text>
//             <Text style={styles.descriptionText}>{description}</Text>
//           </Text>
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

//       {(job.status === "pending" || job.status === "invited") && (
//         <View style={styles.waiting}>
//           <Text style={styles.heading}>Please Wait…</Text>
//           <Text>
//             Your BlinqFix emergency request has been sent out to a local professional.
//             {"\n\n"}
//             {/* <Text style={{ color: "red" }}>
//               Make the necessary preparations for the 
//               service provider. For example, put away any dangerous animals 
//               such as dogs, ensure gate access or provide directions if in a 
//               gated community..
//             </Text> */}
//             {"\n\n"}
//             {"\n\n"}
//             <Text style={styles.sectionTitle}>What’s Covered:{"\n"}</Text>
//             <Text style={styles.descriptionText}>{description}</Text>
//           </Text>
//         </View>
//       )}

//       {job.providerCompleted && !job.customerCompleted && (
//         // <View style={styles.confirm}>
//         //   <Text style={styles.heading}>Confirm Job Complete</Text>
//         //   <Text>The provider marked this job complete. Please confirm below:</Text>
//         //   <Button
//         //     title={confirming ? "Confirming…" : "Confirm Job Complete"}
//         //     onPress={handleCustomerComplete}
//         //     disabled={confirming}
//         //   />
//         // </View>
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
//     textAlign: "center",
//   },
//   heading: { fontSize: 18, fontWeight: "600", marginBottom: 8,  textAlign: "center", },
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

//   section: { marginTop: 20 },
//   sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4,  textAlign: "center", },
//   descriptionText: { fontSize: 14, color: "#555", lineHeight: 20 },
// });


// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import api from "../api/client";
// import JobDetails from "../components/JobDetails";
// import Constants from "expo-constants";
// import { io } from "socket.io-client";

// export default function CustomerJobStatus() {
//   const { jobId } = useRoute().params;
//   const navigation = useNavigation();
//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const socketRef = useRef(null);

//   useEffect(() => {
//     let alive = true;

//     const loadJobOnce = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (alive) setJob(data);
//       } catch (err) {
//         console.error("CustomerJobStatus error:", err);
//         if (alive) Alert.alert("Error", "Unable to load job status.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     };

//     loadJobOnce();

//     socketRef.current = io(Constants.expoConfig.extra.apiUrl, {
//       transports: ["websocket"],
//       withCredentials: true,
//     });

//     socketRef.current.emit("joinUserRoom", {
//       userId: job?.customer?._id,
//     });

//     socketRef.current.on("jobAccepted", (payload) => {
//       if (payload.jobId === jobId) {
//         api.get(`/jobs/${jobId}`).then(({ data }) => setJob(data));
//       }
//     });

//     return () => {
//       alive = false;
//       socketRef.current?.disconnect();
//     };
//   }, [jobId]);

//   if (loading) return <ActivityIndicator style={styles.center} size="large" />;
//   if (!job) return <Text style={styles.center}>Job not found.</Text>;

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <JobDetails jobId={jobId} job={job} />
//       {job.status === "invited" && (
//         <Text style={styles.notice}>
//           Please wait while a provider accepts your job.
//         </Text>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 24, backgroundColor: "#fff" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   notice: {
//     marginTop: 24,
//     textAlign: "center",
//     color: "#666",
//     fontStyle: "italic",
//   },
// });


// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import api from "../api/client";
// import JobDetails from "../components/JobDetails";
// import Constants from "expo-constants";
// import { io } from "socket.io-client";

// export default function CustomerJobStatus() {
//   const { jobId } = useRoute().params;
//   const navigation = useNavigation();
//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const socketRef = useRef(null);

//   useEffect(() => {
//     let alive = true;

//     const loadJobOnce = async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}`);
//         if (alive) setJob(data);
//       } catch (err) {
//         console.error("CustomerJobStatus error:", err);
//         if (alive) Alert.alert("Error", "Unable to load job status.");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     };

//     loadJobOnce();

//     // Initialize socket and join user room
//     socketRef.current = io(Constants.expoConfig.extra.apiUrl, {
//       transports: ["websocket"],
//       withCredentials: true,
//     });

//     // Optional: if job was loaded and has a customer ID, join their room
//     socketRef.current.emit("joinUserRoom", {
//       userId: job?.customer?._id,
//     });

//     // Listen for updates
//     socketRef.current.on("jobAccepted", (payload) => {
//       if (payload.jobId === jobId) {
//         api.get(`/jobs/${jobId}`).then(({ data }) => setJob(data));
//       }
//     });

//     return () => {
//       alive = false;
//       socketRef.current?.disconnect();
//     };
//   }, [jobId]);

//   if (loading) {
//     return <ActivityIndicator style={styles.center} size="large" />;
//   }

//   if (!job) {
//     return <Text style={styles.center}>Job not found.</Text>;
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <JobDetails jobId={jobId} job={job} />
//       {job.status === "invited" && (
//         <Text style={styles.notice}>
//           Please wait while a provider accepts your job. You’ll be notified once accepted.
//         </Text>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 24, backgroundColor: "#fff" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   notice: {
//     marginTop: 24,
//     textAlign: "center",
//     color: "#666",
//     fontStyle: "italic",
//   },
// });


// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import api from "../api/client";
// import JobDetails from "../components/JobDetails";
// import Constants from "expo-constants";
// import { io } from "socket.io-client";
// import { useRef } from "react";



// export default function CustomerJobStatus() {
//   const { jobId } = useRoute().params;
//   const navigation = useNavigation();
//   const [job, setJob] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const socketRef = useRef(null);
  

// // const socket = io(Constants.expoConfig.extra.apiUrl, {
// //   transports: ["websocket"],
// //   withCredentials: true,
// // });

// // req.io.to(job.customer.toString()).emit("jobAccepted", {
// //   jobId: job._id.toString(),
// // });

//   // useEffect(() => {
//   //   let alive = true;

//   //   const loadJobOnce = async () => {
//   //     try {
//   //       const { data } = await api.get(`/jobs/${jobId}`);
//   //       if (alive) setJob(data);
//   //     } catch (err) {
//   //       console.error("CustomerJobStatus error:", err);
//   //       if (alive) Alert.alert("Error", "Unable to load job status.");
//   //     } finally {
//   //       if (alive) setLoading(false);
//   //     }
//   //   };

//   //   loadJobOnce();

//   //   return () => {
//   //     alive = false;
//   //   };
//   // }, [jobId]);

//   useEffect(() => {
//   let alive = true;

//   const loadJobOnce = async () => {
//     try {
//       const { data } = await api.get(`/jobs/${jobId}`);
//       if (alive) setJob(data);
//     } catch (err) {
//       console.error("CustomerJobStatus error:", err);
//       if (alive) Alert.alert("Error", "Unable to load job status.");
//     } finally {
//       if (alive) setLoading(false);
//     }
//   };

//   loadJobOnce();

//   // Listen for real-time acceptance
//   socket.on("jobAccepted", (payload) => {
//     if (payload.jobId === jobId) {
//       // Refresh only that job
//       api.get(`/jobs/${jobId}`).then(({ data }) => setJob(data));
//     }
//   });

//   return () => {
//     alive = false;
//     socket.off("jobAccepted");
//   };
// }, [jobId]);


//   if (loading) {
//     return <ActivityIndicator style={styles.center} size="large" />;
//   }

//   if (!job) {
//     return <Text style={styles.center}>Job not found.</Text>;
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* <Text style={styles.header}>Job Status</Text> */}

//       <JobDetails jobId={jobId} job={job} />

//       {job.status === "invited" && (
//         <Text style={styles.notice}>
//           Please wait while a provider accepts your job. You’ll be notified once accepted.
//         </Text>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 24, backgroundColor: "#fff" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   notice: {
//     marginTop: 24,
//     textAlign: "center",
//     color: "#666",
//     fontStyle: "italic",
//   },
// });
