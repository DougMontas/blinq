// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Button,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import JobDetails from "../components/JobDetails";
// import api from "../api/client";

// export default function ProviderInvitation() {
//   const { jobId, invitationExpiresAt, clickable } = useRoute().params;
//   const navigation = useNavigation();

//   const [remaining, setRemaining] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // countdown timer
//   useEffect(() => {
//     if (!invitationExpiresAt) return;
//     const expiry = Date.parse(invitationExpiresAt);
//     const tick = () => {
//       const secs = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
//       setRemaining(secs);
//     };
//     tick(); // initial
//     const iv = setInterval(tick, 1000);
//     return () => clearInterval(iv);
//   }, [invitationExpiresAt]);

//   const fmt = (s) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

//   const handleAccept = async () => {
//     setLoading(true);
//     try {
//       await api.put(`/jobs/${jobId}/accept`);
//       Alert.alert("Accepted", "You’ve claimed this job.");
//       navigation.replace("ServiceProviderDashboard");
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
//       Alert.alert("Declined", "You’ve passed on this invitation.");
//       navigation.goBack();
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", err.response?.data?.msg || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>New Job Invitation</Text>

//       {remaining != null && (
//         <Text style={styles.timer}>
//           {remaining > 0
//             ? `Expires in ${fmt(remaining)}`
//             : "Invitation expired"}
//         </Text>
//       )}

//       {/* render every single detail of the job */}
//       <JobDetails jobId={jobId} />

//       {loading ? (
//         <ActivityIndicator style={{ marginTop: 20 }} />
//       ) : (
//         <View style={styles.buttons}>
//           <Button
//             title="Accept"
//             onPress={handleAccept}
//             disabled={!clickable || remaining === 0}
//             color={clickable ? "#1976d2" : "#999"}
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
//   container: { padding: 50, backgroundColor: "#fff" },
//   header: { fontSize: 24, fontWeight: "bold", marginBottom: 12 },
//   timer: {
//     textAlign: "center",
//     marginBottom: 16,
//     fontSize: 16,
//     color: "#555",
//   },
//   buttons: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginTop: 20,
//   },
// });

// screens/ProviderInvitation.js
//previous
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Button,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import JobDetails from "../components/JobDetails";
// import api from "../api/client";
// // import useCountdown from "../components/useCountdown"

// export default function ProviderInvitation() {
//   const { jobId, invitationExpiresAt, clickable } = useRoute().params;
//   const navigation = useNavigation();

//   const [remaining, setRemaining] = useState(null);
//   const [loading, setLoading] = useState(false);
//   // const secondsLeft = useCountdown(job?.invitationExpiresAt);
//   // const isPhaseOneActive = job?.invitationPhase === 1 && secondsLeft > 0;

//   console.log("🧾 Fetching job details for ID:", jobId);

//   // countdown timer
//   useEffect(() => {
//     if (!invitationExpiresAt) return;
//     const expiry = Date.parse(invitationExpiresAt);
//     const tick = () => {
//       const secs = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
//       setRemaining(secs);
//     };
//     tick(); // initial
//     const iv = setInterval(tick, 1000);
//     return () => clearInterval(iv);
//   }, [invitationExpiresAt]);

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
//       Alert.alert(
//         "Declined",
//         "You’ve passed on this invitation. Maybe next time",
//         [
//           {
//             text: "OK",
//             onPress: () => navigation.replace("ServiceProviderDashboard"),
//           },
//         ]
//       );
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", err.response?.data?.msg || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>New Job Invitation</Text>

//       {remaining != null && (
//         <Text style={styles.timer}>
//           {remaining > 0
//             ? `Expires in ${fmt(remaining)}`
//             : "Invitation expired"}
//         </Text>
//       )}

//       {/* render every single detail of the job */}
//       <JobDetails jobId={jobId} />

//       {loading ? (
//         <ActivityIndicator style={{ marginTop: 20 }} />
//       ) : (
//         <View style={styles.buttons}>
//           <Button
//             title="Accept"
//             onPress={handleAccept}
//             disabled={!clickable || remaining === 0}
//             color={clickable ? "#1976d2" : "#999"}
//           />

//           {/* <Button
//           title="Accept"
//           disabled={isPhaseOneActive}
//           onPress={handleAccept}
//           color={clickable ? "#1976d2" : "#999"}
//           /> */}

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
// });

//previous
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Button,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import JobDetails from "../components/JobDetails";
// import api from "../api/client";

// export default function ProviderInvitation() {
//   const { jobId, invitationExpiresAt, clickable } = useRoute().params;
//   const navigation = useNavigation();

//   const [remaining, setRemaining] = useState(null);
//   const [loading, setLoading] = useState(false);

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
//       Alert.alert(
//         "Declined",
//         "You’ve passed on this invitation. Maybe next time",
//         [
//           {
//             text: "OK",
//             onPress: () => navigation.replace("ServiceProviderDashboard"),
//           },
//         ]
//       );
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", err.response?.data?.msg || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>New Job Invitation</Text>

//       {remaining != null && (
//         <Text style={styles.timer}>
//           {remaining > 0
//             ? `Expires in ${fmt(remaining)}`
//             : "Invitation expired"}
//         </Text>
//       )}

//       <JobDetails jobId={jobId} />

//       {loading ? (
//         <ActivityIndicator style={{ marginTop: 20 }} />
//       ) : (
//         <View style={styles.buttons}>
//           <Button
//             title="Accept"
//             onPress={handleAccept}
//             disabled={!clickable || remaining === 0}
//             color={clickable ? "#1976d2" : "#999"}
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
// });

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Button,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import JobDetails from "../components/JobDetails";
// import api from "../api/client";

// export default function ProviderInvitationScreen() {
//   const { jobId, invitationExpiresAt, clickable } = useRoute().params;
//   const navigation = useNavigation();

//   const [remaining, setRemaining] = useState(null);
//   const [loading, setLoading] = useState(false);

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
//       Alert.alert(
//         "Declined",
//         "You’ve passed on this invitation. Maybe next time",
//         [
//           {
//             text: "OK",
//             onPress: () => navigation.replace("ServiceProviderDashboard"),
//           },
//         ]
//       );
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", err.response?.data?.msg || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>New Job Invitation</Text>

//       {remaining != null && (
//         <Text style={styles.timer}>
//           {remaining > 0
//             ? `Expires in ${fmt(remaining)}`
//             : "Invitation expired"}
//         </Text>
//       )}

//       <JobDetails jobId={jobId} />

//       {loading ? (
//         <ActivityIndicator style={{ marginTop: 20 }} />
//       ) : (
//         <View style={styles.buttons}>
//           <Button
//             title="Accept"
//             onPress={handleAccept}
//             disabled={!clickable || remaining === 0}
//             color={clickable ? "#1976d2" : "#999"}
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
// });

//previous
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Button,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import JobDetails from "../components/JobDetails";
// import api from "../api/client";

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
//     (async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}`);
//         setJob(data);
//       } catch (err) {
//         console.error("Error fetching job details:", err);
//         Alert.alert("Error", "Failed to load job details.");
//       } finally {
//         setJobLoading(false);
//       }
//     })();
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

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>New Job Invitation</Text>

//       {remaining != null && (
//         <Text style={styles.timer}>
//           {remaining > 0 ? `Expires in ${fmt(remaining)}` : "Invitation expired"}
//         </Text>
//       )}

//       {jobLoading ? (
//         <ActivityIndicator style={{ marginTop: 20 }} />
//       ) : (
//         <JobDetails job={job} />
//       )}

//       {loading ? (
//         <ActivityIndicator style={{ marginTop: 20 }} />
//       ) : (
//         <View style={styles.buttons}>
//           <Button
//             title="Accept"
//             onPress={handleAccept}
//             disabled={!clickable || remaining === 0}
//             color={clickable ? "#1976d2" : "#999"}
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
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Button,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import JobDetails from "../components/JobDetails";
// import api from "../api/client";

// export default function ProviderInvitation() {
//   const { jobId, invitationExpiresAt, clickable: routeClickable } = useRoute().params;
//   const navigation = useNavigation();

//   const [remaining, setRemaining] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [job, setJob] = useState(null);
//   const [jobLoading, setJobLoading] = useState(true);
//   const [clickable, setClickable] = useState(routeClickable);

//   // Phase 1 countdown
//   useEffect(() => {
//     if (!invitationExpiresAt) return;

//     const expiry = Date.parse(invitationExpiresAt);
//     const updateTimer = () => {
//       const secs = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
//       setRemaining(secs);
//       if (secs <= 0) {
//         setClickable(true); // Enable button for Phase 2
//         clearInterval(iv);
//       }
//     };

//     updateTimer();
//     const iv = setInterval(updateTimer, 1000);
//     return () => clearInterval(iv);
//   }, [invitationExpiresAt]);

//   // Fetch job details
//   useEffect(() => {
//     (async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}`);
//         setJob(data);
//       } catch (err) {
//         console.error("Error fetching job details:", err);
//         Alert.alert("Error", "Failed to load job details.");
//       } finally {
//         setJobLoading(false);
//       }
//     })();
//   }, [jobId]);

//   const fmt = (s) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

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

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>New Job Invitation</Text>

//       {remaining != null && (
//         <Text style={styles.timer}>
//           {remaining > 0 ? `Expires in ${fmt(remaining)}` : "Invitation expired"}
//         </Text>
//       )}

//       {jobLoading ? (
//         <ActivityIndicator style={{ marginTop: 20 }} />
//       ) : (
//         <JobDetails job={job} />
//       )}

//       {loading ? (
//         <ActivityIndicator style={{ marginTop: 20 }} />
//       ) : (
//         <View style={styles.buttons}>
//           <Button
//             title="Accept"
//             onPress={handleAccept}
//             disabled={!clickable}
//             color={clickable ? "#1976d2" : "#999"}
//           />
//           <Button
//             title="Decline"
//             onPress={handleDecline}
//             disabled={!clickable && remaining > 0}
//             color="#d32f2f"
//           />
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 10, backgroundColor: "#fff", marginTop: 50 },
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
// });

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Button,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import JobDetails from "../components/JobDetails";
// import api from "../api/client";

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
//       if (secs <= 0) {
//         setIsClickable(true); // update to clickable once timer expires
//       }
//     };
//     tick();
//     const iv = setInterval(tick, 1000);
//     return () => clearInterval(iv);
//   }, [invitationExpiresAt]);

//   useEffect(() => {
//     (async () => {
//       try {
//         const { data } = await api.get(`/jobs/${jobId}`);
//         setJob(data);
//       } catch (err) {
//         console.error("Error fetching job details:", err);
//         Alert.alert("Error", "Failed to load job details.");
//       } finally {
//         setJobLoading(false);
//       }
//     })();
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

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>New Job Invitation</Text>

//       {remaining != null && (
//         <Text style={styles.timer}>
//           {remaining > 0 ? `Expires in ${fmt(remaining)}` : "Invitation expired"}
//         </Text>
//       )}

//       {jobLoading ? (
//         <ActivityIndicator style={{ marginTop: 20 }} />
//       ) : (
//         <JobDetails job={job} />
//       )}

//       {loading ? (
//         <ActivityIndicator style={{ marginTop: 20 }} />
//       ) : (
//         <View style={styles.buttons}>
//           <Button
//             title="Accept"
//             onPress={handleAccept}
//             disabled={!isClickable || remaining === 0}
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
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import JobDetails from "../components/JobDetails";
import api from "../api/client";

const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.25;

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.containerLogo}>
        <Image
          source={require("../assets/blinqfix_logo-new.jpeg")}
          style={[
            { width: LOGO_SIZE, height: LOGO_SIZE },
          ]}
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
        <JobDetails job={job} />
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.buttons}>
          <Button
            title="Accept"
            onPress={handleAccept}
            disabled={!isClickable}
            color={isClickable ? "#1976d2" : "#999"}
          />
          <Button
            title="Decline"
            onPress={handleDecline}
            disabled={remaining === 0}
            color="#d32f2f"
          />
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
    borderRadius: 8,
  },
});
