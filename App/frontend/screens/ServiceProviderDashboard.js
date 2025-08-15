// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
//   useMemo,
// } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Image,
//   Dimensions,
//   ActivityIndicator,
//   Alert,
//   Platform,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import * as Location from "expo-location";
// import MapView, { Marker } from "react-native-maps";
// import { io } from "socket.io-client";
// import api from "../api/client";
// import LogoutButton from "../components/LogoutButton";
// import ProviderStatsCard from "../components/ProviderStatsCard";
// import JobDetails from "../components/JobDetails";
// import FooterPro from "../components/FooterPro";
// // import DeleteAccountButton from "../components/DeleteAccountButton";
// import MyAccountScreen from "./MyAccountScreen";
// import ScreenWrapper from "../components/ScreenWrapper";

// const SOCKET_HOST = "https://blinqfix.onrender.com";
// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// export default function ServiceProviderDashboard() {
//   const navigation = useNavigation();
//   const [user, setUser] = useState(null);
//   const [jobInvitations, setJobInvitations] = useState([]);
//   const [activeJob, setActiveJob] = useState(null);
//   const [jobDetails, setJobDetails] = useState({});
//   const [location, setLocation] = useState(null);
//   const invitesRef = useRef(jobInvitations);
//   const socketRef = useRef(null);
//   invitesRef.current = jobInvitations;

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await api.get("/users/me");
//         const u = res.data?.user ?? res.data;
//         if (!u?.role) return;
//         setUser(u);

//         const uid = u._id || u.id;
//         const newSocket = io(SOCKET_HOST, {
//           transports: ["websocket"],
//           withCredentials: true,
//         });

//         newSocket.on("connect", () => {
//           newSocket.emit("joinUserRoom", { userId: uid });
//           console.log("✅ Connected to socket and joined room for:", uid);
//         });

//         newSocket.on("connect_error", (err) => {
//           console.warn("❌ Socket connection error:", err);
//         });

//         socketRef.current = newSocket;
//       } catch (err) {
//         console.error("Failed to fetch user", err);
//       }
//     };

//     fetchUser();

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     let mounted = true;
//     const fetchInvites = async () => {
//       if (!user) return;
//       const zip = encodeURIComponent(user.serviceZipcode || user.zipcode || "");
//       try {
//         const { data } = await api.get(
//           `/jobs/pending?serviceType=${encodeURIComponent(
//             user.serviceType
//           )}&serviceZipcode=${zip}`
//         );
//         if (mounted) setJobInvitations(data || []);
//       } catch (err) {
//         if (mounted && err.response?.status === 404) {
//           setJobInvitations([]);
//         } else {
//           console.error("Error fetching pending jobs:", err);
//         }
//       }
//     };
//     fetchInvites();
//     return () => {
//       mounted = false;
//     };
//   }, [user]);

//   useEffect(() => {
//     const fetchDetails = async () => {
//       const result = {};
//       await Promise.all(
//         jobInvitations.map(async (job) => {
//           try {
//             const res = await api.get(`/jobs/${job._id}`);
//             result[job._id] = res.data;
//           } catch (err) {
//             console.error("Error loading job detail:", err);
//           }
//         })
//       );
//       setJobDetails(result);
//     };
//     if (jobInvitations.length) fetchDetails();
//   }, [jobInvitations]);

//   useEffect(() => {
//     if (!user || !socketRef.current) return;

//     const socket = socketRef.current;

//     const handleInvitation = (payload) => {
//       const jobId = payload.jobId || payload._id;
//       const clickable =
//         typeof payload.clickable === "boolean"
//           ? payload.clickable
//           : payload.buttonsActive ?? true;
//       navigation.navigate("ProviderInvitation", {
//         jobId,
//         invitationExpiresAt: payload.invitationExpiresAt ?? null,
//         clickable,
//       });
//     };

//     const handleExpired = ({ jobId }) =>
//       setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));
//     const handleCancel = ({ jobId }) =>
//       setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));
//     const handlePaid = ({ jobId }) => {
//       setActiveJob({ _id: jobId });
//       navigation.navigate("ProviderJobStatus", { jobId });
//     };

//     socket.on("jobInvitation", handleInvitation);
//     socket.on("jobInvitation", (payload) => {
//       if (!payload.clickable) {
//         Notifications.scheduleNotificationAsync({
//           content: {
//             title: "New Job Nearby",
//             body: "You’ve received a teaser invite. Open the app to view details.",
//             sound: "default",
//           },
//           trigger: null, // fires immediately
//         });
//       }

//       // Continue to navigate or update state if needed
//     });
//     socket.on("invitationExpired", handleExpired);
//     socket.on("jobCancelled", handleCancel);
//     socket.on("jobPaid", handlePaid);

//     return () => {
//       socket.off("jobInvitation", handleInvitation);
//       socket.off("invitationExpired", handleExpired);
//       socket.off("jobCancelled", handleCancel);
//       socket.off("jobPaid", handlePaid);
//     };
//   }, [user, navigation]);

//   useEffect(() => {
//     const requestAndTrack = async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert(
//           "Location Required",
//           "Location permission is required to receive jobs."
//         );
//         return;
//       }
//       const sendLocation = async () => {
//         const { coords } = await Location.getCurrentPositionAsync({});
//         setLocation(coords);
//         if (socketRef.current) {
//           socketRef.current.emit("providerLocationUpdate", {
//             coords: { lat: coords.latitude, lng: coords.longitude },
//           });
//         }
//       };
//       sendLocation();
//       const interval = setInterval(sendLocation, 60000); // every 60 seconds
//       return () => clearInterval(interval);
//     };
//     requestAndTrack();
//   }, []);

//   const onInvitationAccepted = useCallback(
//     (job) => {
//       setActiveJob(job);
//       setJobInvitations((prev) => prev.filter((j) => j._id !== job._id));
//       navigation.navigate("ProviderJobStatus", { jobId: job._id });
//     },
//     [navigation]
//   );

//   const onInvitationDenied = useCallback((jobId) => {
//     setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));
//   }, []);

//   const rawName = useMemo(() => {
//     if (!user) return "";
//     return (
//       user.name || [user.firstName, user.lastName].filter(Boolean).join(" ")
//     );
//   }, [user]);

//   const firstName = rawName.split(" ")[0] || "Provider";

//   return (
//     <View style={styles.wrapper}>
//       <ScreenWrapper>
//         <ScrollView contentContainerStyle={styles.container}>
//           <LogoutButton />

//           <View style={styles.containerLogo}>
//             <Image
//               source={require("../assets/blinqfix_logo-new.jpeg")}
//               style={[
//                 { width: LOGO_SIZE, height: LOGO_SIZE, marginHorizontal: 120 },
//               ]}
//               resizeMode="contain"
//             />
//             <Text style={styles.sectionTitle1}>Dashboard</Text>
//           </View>

//           <Text>{"\n"}</Text>
//           <Text style={styles.title}>
//             {user ? `Welcome, ${firstName}` : "Loading..."}
//           </Text>

//           <TouchableOpacity
//             style={styles.profileBtn}
//             onPress={() => navigation.navigate("ProviderProfile")}
//           >
//             <Text style={styles.profileBtnText}>
//               Complete / Update Your Profile
//             </Text>
//           </TouchableOpacity>

//           {location && (
//             <MapView
//               style={{ height: 200, marginVertical: 12, borderRadius: 10 }}
//               initialRegion={{
//                 latitude: location.latitude,
//                 longitude: location.longitude,
//                 latitudeDelta: 0.01,
//                 longitudeDelta: 0.01,
//               }}
//             >
//               <Marker
//                 coordinate={{
//                   latitude: location.latitude,
//                   longitude: location.longitude,
//                 }}
//               />
//             </MapView>
//           )}

//           <ProviderStatsCard />

//           <Text style={styles.subtitle}></Text>
//           {jobInvitations.length === 0 ? (
//             <Text></Text>
//           ) : (
//             jobInvitations.map((job) => (
//               <View key={job._id} style={styles.inviteBox}>
//                 <Text>Job ID: {job._id}</Text>
//                 <Text>Service: {job.serviceType}</Text>
//                 <View style={styles.inviteBtnRow}>
//                   <TouchableOpacity
//                     style={[styles.inviteBtn, { backgroundColor: "#4caf50" }]}
//                     onPress={() => onInvitationAccepted(job)}
//                   >
//                     <Text style={styles.inviteBtnText}>Accept</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={[styles.inviteBtn, { backgroundColor: "#f44336" }]}
//                     onPress={() => onInvitationDenied(job._id)}
//                   >
//                     <Text style={styles.inviteBtnText}>Deny</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={[styles.inviteBtn, { backgroundColor: "#1976d2" }]}
//                     onPress={() =>
//                       navigation.navigate("ProviderInvitation", {
//                         jobId: job._id,
//                         invitationExpiresAt: job.invitationExpiresAt,
//                         clickable: job.buttonsActive ?? true,
//                       })
//                     }
//                   >
//                     <Text style={styles.inviteBtnText}>View Details</Text>
//                   </TouchableOpacity>
//                 </View>
//                 <JobDetails
//                   job={jobDetails[job._id]}
//                   onAccept={() => onInvitationAccepted(job)}
//                 />
//               </View>
//             ))
//           )}

//           {activeJob && (
//             <Text style={{ marginTop: 20 }}>
//               Active job: {activeJob._id} (navigated to ProviderJobStatus)
//             </Text>
//           )}

//           <FooterPro />
//         </ScrollView>

//         <TouchableOpacity
//           style={{
//             backgroundColor: "#1976d2",
//             padding: 16,
//             position: "absolute",
//             bottom: 0,
//             left: 0,
//             right: 0,
//             zIndex: 999,

//           }}
//           onPress={() => navigation.navigate("MyAccountScreen")}
//         >
//           <Text
//             style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
//           >
//             My Account
//           </Text>
//         </TouchableOpacity>

//       </ScreenWrapper>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//     flex: 1,
//     position: "relative",
//     backgroundColor: "#fff",
//   },
//   container: { padding: 36 },
//   containerLogo: {
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 8,
//     textAlign: "center",
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
//   },
//   sectionTitle1: {
//     color: "black",
//     textAlign: "center",
//     fontSize: 24,
//     fontWeight: "700",
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
//   },
//   subtitle: { marginTop: 20, fontSize: 18, fontWeight: "600" },
//   profileBtn: {
//     marginTop: 12,
//     paddingVertical: 12,
//     backgroundColor: "#1976d2",
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   profileBtnText: { color: "#fff", fontWeight: "600" },
//   inviteBox: {
//     marginTop: 12,
//     padding: 12,
//     backgroundColor: "#eee",
//     borderRadius: 6,
//   },
//   inviteBtnRow: { flexDirection: "row", marginTop: 8 },
//   inviteBtn: {
//     flex: 1,
//     padding: 10,
//     marginHorizontal: 4,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   inviteBtnText: { color: "#fff", fontWeight: "600" },
// });

// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
//   useMemo,
// } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Dimensions,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   SafeAreaView,
// } from "react-native";
// import { useNavigation, useIsFocused } from "@react-navigation/native";
// import * as Location from "expo-location";
// import MapView, { Marker } from "react-native-maps";
// import { io } from "socket.io-client";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   User,
//   LogOut,
//   Bell,
//   MapPin,
//   ClipboardEdit,
//   ArrowRight,
//   Briefcase,
//   BellOff,
//   Check,
//   X,
//   Eye,
//   DollarSign,
//   Clock,
// } from "lucide-react-native";
// import api from "../api/client";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import ProviderStatsCard from "../components/ProviderStatsCard";
// import * as Notifications from "expo-notifications";
// import FooterPro from "../components/FooterPro"

// const SOCKET_HOST = "https://blinqfix.onrender.com";

// // Configure notification handler
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export default function ServiceProviderDashboard() {
//   const navigation = useNavigation();
//   const isFocused = useIsFocused();
//   const [user, setUser] = useState(null);
//   const [jobInvitations, setJobInvitations] = useState([]);
//   const [activeJob, setActiveJob] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const socketRef = useRef(null);
//   const invitesRef = useRef(jobInvitations);
//   invitesRef.current = jobInvitations;

//   const fetchData = async () => {
//     try {
//       const { data: userData } = await api.get("/users/me");
//       const u = userData?.user ?? userData;
//       if (!u?.role) return;
//       setUser(u);

//       const { data: activeJobData } = await api.get("/jobs/provider/active");
//       setActiveJob(activeJobData);

//       const zip = encodeURIComponent(u.serviceZipcode || u.zipcode || "");
//       const { data: invitesData } = await api.get(
//         `/jobs/pending?serviceType=${encodeURIComponent(
//           u.serviceType
//         )}&serviceZipcode=${zip}`
//       );
//       setJobInvitations(invitesData || []);
//     } catch (err) {
//       console.error("Failed to fetch initial data", err);
//       if (err.response?.status === 404) {
//         setJobInvitations([]);
//         setActiveJob(null);
//       } else if (err.response?.status === 401) {
//         handleLogout();
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isFocused) {
//       fetchData();
//     }
//   }, [isFocused]);

//   useEffect(() => {
//     let socket;
//     if (user?._id) {
//       socket = io(SOCKET_HOST, {
//         transports: ["websocket"],
//         withCredentials: true,
//       });
//       socketRef.current = socket;

//       socket.on("connect", () => {
//         const uid = user._id || user.id;
//         socket.emit("joinUserRoom", { userId: uid });
//         console.log("✅ Connected to socket and joined room for:", uid);
//       });

//       socket.on("connect_error", (err) => {
//         console.warn("❌ Socket connection error:", err);
//       });

//       const handleInvitation = (payload) => {
//         const jobId = payload.jobId || payload._id;
//         const clickable =
//           typeof payload.clickable === "boolean"
//             ? payload.clickable
//             : payload.buttonsActive ?? true;

//         if (!clickable) {
//           Notifications.scheduleNotificationAsync({
//             content: {
//               title: "New Job Nearby",
//               body: "You've received a teaser invite. Open the app to view details.",
//               sound: "default",
//             },
//             trigger: null,
//           });
//         }

//         navigation.navigate("ProviderInvitation", {
//           jobId,
//           invitationExpiresAt: payload.invitationExpiresAt ?? null,
//           clickable,
//         });
//       };

//       const handleExpired = ({ jobId }) => {
//         setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));
//       };

//       const handleCancel = ({ jobId }) => {
//         setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));
//       };

//       const handlePaid = ({ jobId }) => {
//         setActiveJob({ _id: jobId });
//         navigation.navigate("ProviderJobStatus", { jobId });
//       };

//       socket.on("jobInvitation", handleInvitation);
//       socket.on("jobExpired", handleExpired);
//       socket.on("jobCancelled", handleCancel);
//       socket.on("jobAcceptedElsewhere", handleExpired);
//       socket.on("jobPaid", handlePaid);
//     }

//     return () => {
//       if (socket) {
//         socket.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, [user, navigation]);

//   useEffect(() => {
//     const requestAndTrack = async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert(
//           "Location Required",
//           "Location permission is required to receive jobs."
//         );
//         return;
//       }
//       const sendLocation = async () => {
//         try {
//           const { coords } = await Location.getCurrentPositionAsync({});
//           setLocation(coords);
//           if (socketRef.current && socketRef.current.connected) {
//             socketRef.current.emit("providerLocationUpdate", {
//               coords: { lat: coords.latitude, lng: coords.longitude },
//             });
//           }
//         } catch (e) {
//           console.log("Could not get location", e);
//         }
//       };
//       sendLocation();
//       const interval = setInterval(sendLocation, 60000); // every 60 seconds
//       return () => clearInterval(interval);
//     };
//     if (user) {
//       requestAndTrack();
//     }
//   }, [user]);

//   const handleLogout = async () => {
//     await AsyncStorage.clear();
//     navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//   };

//   const handleDeclineJob = async (jobId) => {
//     try {
//       await api.put(`/jobs/${jobId}/deny`);
//       setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));
//       Alert.alert("Declined", "You’ve passed on this invitation.");
//     } catch (err) {
//       console.error("Failed to decline job", err);
//       Alert.alert(
//         "Error",
//         err.response?.data?.msg || "Could not decline the job."
//       );
//     }
//   };

//   const firstName = useMemo(() => {
//     if (!user) return "";
//     const rawName =
//       user.name || [user.firstName, user.lastName].filter(Boolean).join(" ");
//     return rawName.split(" ")[0] || "Provider";
//   }, [user]);

//   if (loading) {
//     return (
//       <LinearGradient
//         colors={["#0f172a", "#1e3a8a", "#312e81"]}
//         style={styles.centered}
//       >
//         <ActivityIndicator size="large" color="#fff" />
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
//             <View>
//               <Text style={styles.welcomeText}>Welcome back,</Text>
//               <Text style={styles.userName}>{firstName}</Text>
//             </View>
//             <View style={styles.headerIcons}>
//               <TouchableOpacity
//                 onPress={() => navigation.navigate("MyAccountScreen")}
//                 style={styles.iconButton}
//               >
//                 <User color="#fff" size={24} />
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={handleLogout}
//                 style={styles.iconButton}
//               >
//                 <LogOut color="#f87171" size={24} />
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Active Job Card */}
//           {activeJob && (
//             <TouchableOpacity
//               onPress={() =>
//                 navigation.navigate("ProviderJobStatus", {
//                   jobId: activeJob._id,
//                 })
//               }
//             >
//               <LinearGradient
//                 colors={["rgba(34, 197, 94, 0.2)", "rgba(16, 185, 129, 0.2)"]}
//                 style={styles.activeJobCard}
//               >
//                 <View style={styles.activeJobLeft}>
//                   <View style={styles.liveIndicator}>
//                     <View style={styles.liveDot} />
//                   </View>
//                   <View>
//                     <Text style={styles.activeJobTitle}>
//                       You have an active job
//                     </Text>
//                     <Text style={styles.activeJobSubtitle}>
//                       Tap to view status & workflow
//                     </Text>
//                   </View>
//                 </View>
//                 <ArrowRight color="#22c55e" size={24} />
//               </LinearGradient>
//             </TouchableOpacity>
//           )}

//           {/* Profile CTA */}
//           <TouchableOpacity
//             style={styles.profileCard}
//             onPress={() => navigation.navigate("ProviderProfile")}
//           >
//             <ClipboardEdit color="#60a5fa" size={32} />
//             <View style={styles.profileTextContainer}>
//               <Text style={styles.profileTitle}>Complete Your Profile</Text>
//               <Text style={styles.profileSubtitle}>
//                 A complete profile helps you get more jobs.
//               </Text>
//             </View>
//             <ArrowRight color="#60a5fa" size={24} />
//           </TouchableOpacity>

//           {/* Stats Card */}
//           <ProviderStatsCard />

//           {/* Map */}
//           {location && (
//             <View style={styles.mapCard}>
//               <View style={styles.cardHeader}>
//                 <MapPin color="#c084fc" size={20} />
//                 <Text style={styles.cardTitle}>Your Live Location</Text>
//               </View>
//               <View style={styles.mapContainer}>
//                 <MapView
//                   style={styles.map}
//                   provider={Platform.OS === "android" ? "google" : "standard"}
//                   initialRegion={{
//                     latitude: location.latitude,
//                     longitude: location.longitude,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                   }}
//                   scrollEnabled={false}
//                   zoomEnabled={false}
//                 >
//                   <Marker coordinate={location} />
//                 </MapView>
//               </View>

//           <FooterPro />
//             </View>

//           )}

//           {/* Job Invitations */}
//           <View style={styles.section}>
//             <View style={styles.cardHeader}>
//               <Bell color="#fb923c" size={20} />
//               <Text style={styles.cardTitle}>New Job Invitations</Text>
//             </View>
//             {jobInvitations.length === 0 ? (
//               <View style={styles.noJobsCard}>
//                 <BellOff color="#94a3b8" size={32} />
//                 <Text style={styles.noJobsText}>No new jobs right now.</Text>
//                 <Text style={styles.noJobsSubtext}>
//                   We'll notify you when a job is available.
//                 </Text>
//               </View>
//             ) : (
//               jobInvitations.map((job) => (
//                 <View key={job._id} style={styles.jobCard}>
//                   <View style={styles.jobCardHeader}>
//                     <View style={styles.jobTypeBadge}>
//                       <Briefcase color="#fff" size={14} />
//                       <Text style={styles.jobTypeText}>{job.serviceType}</Text>
//                     </View>
//                     <View style={styles.jobEarningsBadge}>
//                       <DollarSign color="#22c55e" size={14} />
//                       <Text style={styles.jobEarningsText}>
//                         ~${(job.estimatedTotal || 150).toFixed(2)}
//                       </Text>
//                     </View>
//                   </View>
//                   <Text style={styles.jobLocation}>
//                     <MapPin size={14} color="#94a3b8" /> {job.address},{" "}
//                     {job.serviceCity}
//                   </Text>

//                   <View style={styles.jobCardButtons}>
//                     <TouchableOpacity
//                       style={styles.jobDeclineButton}
//                       onPress={() => handleDeclineJob(job._id)}
//                     >
//                       <X color="#f87171" size={18} />
//                       <Text style={styles.jobDeclineButtonText}>Decline</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       style={styles.jobDetailsButton}
//                       onPress={() =>
//                         navigation.navigate("ProviderInvitation", {
//                           jobId: job._id,
//                           invitationExpiresAt: job.invitationExpiresAt,
//                           clickable: true,
//                         })
//                       }
//                     >
//                       <Eye color="#fff" size={18} />
//                       <Text style={styles.jobDetailsButtonText}>
//                         View Details
//                       </Text>
//                     </TouchableOpacity>

//                   </View>
//                 </View>
//               ))
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
//   scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: 10,
//     paddingBottom: 20,
//     marginBottom: 20,
//   },
//   welcomeText: { fontSize: 18, color: "#e0e7ff" },
//   userName: { fontSize: 28, fontWeight: "bold", color: "#fff" },
//   headerIcons: { flexDirection: "row", gap: 16 },
//   iconButton: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     padding: 10,
//     borderRadius: 99,
//   },

//   activeJobCard: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "rgba(34, 197, 94, 0.5)",
//     marginBottom: 20,
//   },
//   activeJobLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
//   liveIndicator: {
//     width: 12,
//     height: 12,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e" },
//   activeJobTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
//   activeJobSubtitle: { color: "#e0e7ff", fontSize: 14 },

//   profileCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(96, 165, 250, 0.1)",
//     padding: 20,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "rgba(96, 165, 250, 0.3)",
//     marginBottom: 20,
//     gap: 16,
//   },
//   profileTextContainer: { flex: 1 },
//   profileTitle: { fontSize: 16, fontWeight: "bold", color: "#fff" },
//   profileSubtitle: { fontSize: 14, color: "#e0e7ff", marginTop: 4 },

//   mapCard: {
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
//     gap: 12,
//     marginBottom: 16,
//   },
//   cardTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
//   mapContainer: { height: 150, borderRadius: 12, overflow: "hidden" },
//   map: { ...StyleSheet.absoluteFillObject },

//   section: { marginTop: 40, marginBottom: 40, },
//   noJobsCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     paddingVertical: 40,
//     paddingHorizontal: 20,
//     alignItems: "center",
//     gap: 12,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   noJobsText: { fontSize: 18, fontWeight: "600", color: "#fff" },
//   noJobsSubtext: { fontSize: 14, color: "#94a3b8", textAlign: "center" },

//   jobCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   jobCardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   jobTypeBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.1)",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//     gap: 6,
//   },
//   jobTypeText: { color: "#fff", fontWeight: "600", fontSize: 12 },
//   jobEarningsBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(34, 197, 94, 0.1)",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//     gap: 6,
//   },
//   jobEarningsText: { color: "#22c55e", fontWeight: "bold", fontSize: 12 },
//   jobLocation: {
//     flexDirection: "row",
//     alignItems: "center",
//     fontSize: 14,
//     color: "#94a3b8",
//     marginBottom: 16,
//   },
//   jobCardButtons: {
//     flexDirection: "row",
//     gap: 12,
//   },
//   jobDeclineButton: {
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 12,
//     backgroundColor: "rgba(239, 68, 68, 0.1)",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "rgba(239, 68, 68, 0.2)",
//     gap: 8,
//   },
//   jobDeclineButtonText: { color: "#f87171", fontWeight: "bold" },
//   jobDetailsButton: {
//     flex: 2,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 12,
//     backgroundColor: "#60a5fa",
//     borderRadius: 12,
//     gap: 8,
//   },
//   jobDetailsButtonText: { color: "#fff", fontWeight: "bold" },

//   linksRow: {
//     padding: 16,
//     position: "absolute",
//     bottom: -40,
//     right: 100,
//     gap: 24,
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     marginTop: 20,
//   },
//   link: {
//     color: "#1976d2",
//     textDecorationLine: "none",
//     fontSize: 14,
//   },
// });

// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
//   useMemo,
// } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Dimensions,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   SafeAreaView,
// } from "react-native";
// import { useNavigation, useIsFocused } from "@react-navigation/native";
// import * as Location from "expo-location";
// import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
// import { io } from "socket.io-client";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   User,
//   LogOut,
//   Bell,
//   MapPin,
//   ClipboardEdit,
//   ArrowRight,
//   Briefcase,
//   BellOff,
//   X,
//   Eye,
//   DollarSign,
// } from "lucide-react-native";
// import api from "../api/client";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import ProviderStatsCard from "../components/ProviderStatsCard";
// import * as Notifications from "expo-notifications";
// import FooterPro from "../components/FooterPro";

// const SOCKET_HOST = "https://blinqfix.onrender.com";

// // Ensure foreground notifications show alert + play sound
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export default function ServiceProviderDashboard() {
//   const navigation = useNavigation();
//   const isFocused = useIsFocused();
//   const [user, setUser] = useState(null);
//   const [jobInvitations, setJobInvitations] = useState([]);
//   const [activeJob, setActiveJob] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const socketRef = useRef(null);
//   const invitesRef = useRef(jobInvitations);
//   invitesRef.current = jobInvitations;

//   /**
//    * 🔔 Notifications setup (permissions + Android channel w/ sound)
//    */
//   const ensureNotificationSetup = useCallback(async () => {
//     try {
//       const current = await Notifications.getPermissionsAsync();
//       let granted =
//         current.granted ||
//         current.ios?.status ===
//           Notifications.IosAuthorizationStatus.AUTHORIZED ||
//         current.ios?.status ===
//           Notifications.IosAuthorizationStatus.PROVISIONAL;

//       if (!granted) {
//         const req = await Notifications.requestPermissionsAsync();
//         granted =
//           req.granted ||
//           req.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
//           req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
//       }

//       if (Platform.OS === "android") {
//         // Channel must have sound enabled for audio to play
//         await Notifications.setNotificationChannelAsync("job-invites", {
//           name: "Job Invitations",
//           importance: Notifications.AndroidImportance.MAX,
//           sound: "default",
//           vibrationPattern: [0, 250, 250, 250],
//           enableVibrate: true,
//           bypassDnd: true,
//           lockscreenVisibility:
//             Notifications.AndroidNotificationVisibility.PUBLIC,
//         });
//       }
//     } catch (e) {
//       console.warn("Notification setup failed:", e);
//     }
//   }, []);

//   /**
//    * 🔊 Present a local notification immediately (plays sound in foreground too)
//    */
//   const presentInviteNotification = useCallback(async (payload) => {
//     const jobId = payload?.jobId || payload?._id || "";
//     const clickable =
//       typeof payload?.clickable === "boolean"
//         ? payload?.clickable
//         : payload?.buttonsActive ?? true;

//     const title = clickable ? "New Job Invitation" : "New Job Nearby (Teaser)";
//     const body = clickable
//       ? "A new customer needs you. Tap to open the invite."
//       : "You’ve received a teaser invite. Open the app to view details.";

//     try {
//       await Notifications.scheduleNotificationAsync({
//         content: {
//           title,
//           body,
//           sound: "default",
//           data: { jobId, clickable },
//         },
//         trigger: null, // show now
//       });
//     } catch (e) {
//       console.warn("Failed to present invite notification:", e);
//     }
//   }, []);

//   const fetchData = useCallback(async () => {
//     try {
//       const { data: userData } = await api.get("/users/me");
//       const u = userData?.user ?? userData;
//       if (!u?.role) return;
//       setUser(u);

//       const { data: activeJobData } = await api.get("/users/providers/active");
//       setActiveJob(activeJobData);

//       const zip = encodeURIComponent(u.serviceZipcode || u.zipcode || "");
//       const { data: invitesData } = await api.get(
//         `/jobs/pending?serviceType=${encodeURIComponent(
//           u.serviceType
//         )}&serviceZipcode=${zip}`
//       );
//       setJobInvitations(invitesData || []);
//     } catch (err) {
//       console.error("Failed to fetch initial data", err);
//       if (err.response?.status === 404) {
//         setJobInvitations([]);
//         setActiveJob(null);
//       } else if (err.response?.status === 401) {
//         handleLogout();
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     ensureNotificationSetup();
//   }, [ensureNotificationSetup]);

//   useEffect(() => {
//     if (isFocused) {
//       fetchData();
//     }
//   }, [isFocused, fetchData]);

//   useEffect(() => {
//     let socket;
//     if (user?._id) {
//       socket = io(SOCKET_HOST, {
//         transports: ["websocket"],
//         withCredentials: true,
//       });
//       socketRef.current = socket;

//       socket.on("connect", () => {
//         const uid = user._id || user.id;
//         socket.emit("joinUserRoom", { userId: uid });
//         console.log("✅ Connected to socket and joined room for:", uid);
//       });

//       socket.on("connect_error", (err) => {
//         console.warn("❌ Socket connection error:", err);
//       });

//       const handleInvitation = async (payload) => {
//         // 🔊 Always play a sound (matches prior behavior expectation)
//         await presentInviteNotification(payload);

//         const jobId = payload.jobId || payload._id;
//         const clickable =
//           typeof payload.clickable === "boolean"
//             ? payload.clickable
//             : payload.buttonsActive ?? true;

//         // Navigate to invite screen
//         navigation.navigate("ProviderInvitation", {
//           jobId,
//           invitationExpiresAt: payload.invitationExpiresAt ?? null,
//           clickable,
//         });
//       };

//       const handleExpired = ({ jobId }) =>
//         setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));

//       const handleCancel = ({ jobId }) =>
//         setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));

//       const handlePaid = ({ jobId }) => {
//         setActiveJob({ _id: jobId });
//         navigation.navigate("ProviderJobStatus", { jobId });
//         // Optional: play a short heads-up sound for paid event
//         Notifications.scheduleNotificationAsync({
//           content: {
//             title: "Job Paid",
//             body: "The customer has paid. You’re good to go!",
//             sound: "default",
//           },
//           trigger: null,
//         }).catch(() => {});
//       };

//       socket.on("jobInvitation", handleInvitation);
//       socket.on("jobExpired", handleExpired);
//       socket.on("jobCancelled", handleCancel);
//       socket.on("jobAcceptedElsewhere", handleExpired);
//       socket.on("jobPaid", handlePaid);
//     }

//     return () => {
//       if (socket) {
//         socket.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, [user, navigation, presentInviteNotification]);

//   useEffect(() => {
//     const requestAndTrack = async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert(
//           "Location Required",
//           "Location permission is required to receive jobs."
//         );
//         return;
//       }
//       const sendLocation = async () => {
//         try {
//           const { coords } = await Location.getCurrentPositionAsync({});
//           setLocation(coords);
//           if (socketRef.current && socketRef.current.connected) {
//             socketRef.current.emit("providerLocationUpdate", {
//               coords: { lat: coords.latitude, lng: coords.longitude },
//             });
//           }
//         } catch (e) {
//           console.log("Could not get location", e);
//         }
//       };
//       sendLocation();
//       const interval = setInterval(sendLocation, 60000); // every 60 seconds
//       return () => clearInterval(interval);
//     };
//     if (user) {
//       requestAndTrack();
//     }
//   }, [user]);

//   const handleLogout = async () => {
//     await AsyncStorage.clear();
//     navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//   };

//   const handleDeclineJob = async (jobId) => {
//     try {
//       await api.put(`/jobs/${jobId}/deny`);
//       setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));
//       Alert.alert("Declined", "You’ve passed on this invitation.");
//     } catch (err) {
//       console.error("Failed to decline job", err);
//       Alert.alert(
//         "Error",
//         err.response?.data?.msg || "Could not decline the job."
//       );
//     }
//   };

//   const firstName = useMemo(() => {
//     if (!user) return "";
//     const rawName =
//       user.name || [user.firstName, user.lastName].filter(Boolean).join(" ");
//     return rawName.split(" ")[0] || "Provider";
//   }, [user]);

//   if (loading) {
//     return (
//       <LinearGradient
//         colors={["#0f172a", "#1e3a8a", "#312e81"]}
//         style={styles.centered}
//       >
//         <ActivityIndicator size="large" color="#fff" />
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
//             <View>
//               <Text style={styles.welcomeText}>Welcome back,</Text>
//               <Text style={styles.userName}>{firstName}</Text>
//             </View>
//             <View style={styles.headerIcons}>
//               <TouchableOpacity
//                 onPress={() => navigation.navigate("MyAccountScreen")}
//                 style={styles.iconButton}
//               >
//                 <User color="#fff" size={24} />
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={handleLogout}
//                 style={styles.iconButton}
//               >
//                 <LogOut color="#f87171" size={24} />
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Active Job Card */}
//           {activeJob && (
//             <TouchableOpacity
//               onPress={() =>
//                 navigation.navigate("ProviderJobStatus", {
//                   jobId: activeJob._id,
//                 })
//               }
//             >
//               <LinearGradient
//                 colors={["rgba(34, 197, 94, 0.2)", "rgba(16, 185, 129, 0.2)"]}
//                 style={styles.activeJobCard}
//               >
//                 <View style={styles.activeJobLeft}>
//                   <View style={styles.liveIndicator}>
//                     <View style={styles.liveDot} />
//                   </View>
//                   <View>
//                     <Text style={styles.activeJobTitle}>
//                       You have an active job
//                     </Text>
//                     <Text style={styles.activeJobSubtitle}>
//                       Tap to view status & workflow
//                     </Text>
//                   </View>
//                 </View>
//                 <ArrowRight color="#22c55e" size={24} />
//               </LinearGradient>
//             </TouchableOpacity>
//           )}

//           {/* Profile CTA */}
//           <TouchableOpacity
//             style={styles.profileCard}
//             onPress={() => navigation.navigate("ProviderProfile")}
//           >
//             <ClipboardEdit color="#60a5fa" size={32} />
//             <View style={styles.profileTextContainer}>
//               <Text style={styles.profileTitle}>Complete Your Profile</Text>
//               <Text style={styles.profileSubtitle}>
//                 A complete profile helps you get more jobs.
//               </Text>
//             </View>
//             <ArrowRight color="#60a5fa" size={24} />
//           </TouchableOpacity>

//           {/* Stats Card */}
//           <ProviderStatsCard />

//           {/* Map */}
//           {/* {location && (
//             <View style={styles.mapCard}>
//               <View style={styles.cardHeader}>
//                 <MapPin color="#c084fc" size={20} />
//                 <Text style={styles.cardTitle}>Your Live Location</Text>
//               </View>
//               <View style={styles.mapContainer}>
//                 <MapView
//                   style={styles.map}
//                   provider={Platform.OS === "android" ? "google" : "standard"}
//                   initialRegion={{
//                     latitude: location.latitude,
//                     longitude: location.longitude,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                   }}
//                   scrollEnabled={false}
//                   zoomEnabled={false}
//                 >
//                   <Marker coordinate={location} />
//                 </MapView>
//               </View>
//               <FooterPro />
//             </View>
//           )} */}

//           {location && (
//             <View style={styles.mapCard}>
//               <View style={styles.cardHeader}>
//                 <MapPin color="#c084fc" size={20} />
//                 <Text style={styles.cardTitle}>Your Live Location</Text>
//               </View>
//               {/* Important: avoid overflow:hidden translucent parents around MapView on Android */}
//               {/* <MapView
//       style={styles.mapDirect} // give the MapView its own height/borderRadius
//       provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
//       initialRegion={{
//         latitude: location.latitude,
//         longitude: location.longitude,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       }}
//       onMapReady={() => console.log("🗺️[MAP] ready")}
//       showsUserLocation={false}
//       scrollEnabled={false}
//       zoomEnabled={false}
//     >
//       <Marker
//         coordinate={{
//           latitude: location.latitude,
//           longitude: location.longitude,
//         }}
//       />
//              </MapView> */}

//               {/* {location && (
//                 <MapView
//                   style={{ height: 200, marginVertical: 12, borderRadius: 10 }}
//                   initialRegion={{
//                     latitude: location.latitude,
//                     longitude: location.longitude,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                   }}
//                 >
//                   <Marker
//                     coordinate={{
//                       latitude: location.latitude,
//                       longitude: location.longitude,
//                     }}
//                   />
//                 </MapView>
//               )} */}

//               <MapView
//                 style={styles.map}
//                 provider={Platform.OS === "android" ? "google" : "standard"}
//                 initialRegion={{
//                   latitude: location.latitude,
//                   longitude: location.longitude,
//                   latitudeDelta: 0.01,
//                   longitudeDelta: 0.01,
//                 }}
//               >
//                 <Marker
//                   coordinate={{
//                     latitude: location.latitude,
//                     longitude: location.longitude,
//                   }}
//                 />
//               </MapView>
//             </View>
//           )}
//           <FooterPro />

//           {/* Job Invitations */}
//           <View style={styles.section}>
//             <View style={styles.cardHeader}>
//               <Bell color="#fb923c" size={20} />
//               <Text style={styles.cardTitle}>New Job Invitations</Text>
//             </View>
//             {jobInvitations.length === 0 ? (
//               <View style={styles.noJobsCard}>
//                 <BellOff color="#94a3b8" size={32} />
//                 <Text style={styles.noJobsText}>No new jobs right now.</Text>
//                 <Text style={styles.noJobsSubtext}>
//                   We'll notify you when a job is available.
//                 </Text>
//               </View>
//             ) : (
//               jobInvitations.map((job) => (
//                 <View key={job._id} style={styles.jobCard}>
//                   <View style={styles.jobCardHeader}>
//                     <View style={styles.jobTypeBadge}>
//                       <Briefcase color="#fff" size={14} />
//                       <Text style={styles.jobTypeText}>{job.serviceType}</Text>
//                     </View>
//                     <View style={styles.jobEarningsBadge}>
//                       <DollarSign color="#22c55e" size={14} />
//                       <Text style={styles.jobEarningsText}>
//                         ~${(job.estimatedTotal || 150).toFixed(2)}
//                       </Text>
//                     </View>
//                   </View>
//                   <Text style={styles.jobLocation}>
//                     <MapPin size={14} color="#94a3b8" /> {job.address},{" "}
//                     {job.serviceCity}
//                   </Text>

//                   <View style={styles.jobCardButtons}>
//                     <TouchableOpacity
//                       style={styles.jobDeclineButton}
//                       onPress={() => handleDeclineJob(job._id)}
//                     >
//                       <X color="#f87171" size={18} />
//                       <Text style={styles.jobDeclineButtonText}>Decline</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       style={styles.jobDetailsButton}
//                       onPress={() =>
//                         navigation.navigate("ProviderInvitation", {
//                           jobId: job._id,
//                           invitationExpiresAt: job.invitationExpiresAt,
//                           clickable: true,
//                         })
//                       }
//                     >
//                       <Eye color="#fff" size={18} />
//                       <Text style={styles.jobDetailsButtonText}>
//                         View Details
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               ))
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
//   scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: 10,
//     paddingBottom: 20,
//     marginBottom: 20,
//   },
//   welcomeText: { fontSize: 18, color: "#e0e7ff" },
//   userName: { fontSize: 28, fontWeight: "bold", color: "#fff" },
//   headerIcons: { flexDirection: "row", gap: 16 },
//   iconButton: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     padding: 10,
//     borderRadius: 99,
//   },

//   activeJobCard: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "rgba(34, 197, 94, 0.5)",
//     marginBottom: 20,
//   },
//   activeJobLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
//   liveIndicator: {
//     width: 12,
//     height: 12,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e" },
//   activeJobTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
//   activeJobSubtitle: { color: "#e0e7ff", fontSize: 14 },

//   profileCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(96, 165, 250, 0.1)",
//     padding: 20,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "rgba(96, 165, 250, 0.3)",
//     marginBottom: 20,
//     gap: 16,
//   },
//   profileTextContainer: { flex: 1 },
//   profileTitle: { fontSize: 16, fontWeight: "bold", color: "#fff" },
//   profileSubtitle: { fontSize: 14, color: "#e0e7ff", marginTop: 4 },

//   mapCard: {
//     // backgroundColor: "transparent",
//     borderRadius: 16,
//     height: 550,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//     overflow: "hidden"
//   },

//   // mapDirect: {
//   //   height: 550,
//   //   borderRadius: 12,
//   //   overflow: "hidden", // okay here because it's *on* the MapView itself
//   // },

//   cardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     marginBottom: 16,
//   },
//   cardTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
//   mapContainer: { height: 150, borderRadius: 12, overflow: "hidden" },
//   map: { ...StyleSheet.absoluteFillObject },

//   section: { marginTop: 40, marginBottom: 40 },
//   noJobsCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     paddingVertical: 40,
//     paddingHorizontal: 20,
//     alignItems: "center",
//     gap: 12,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   noJobsText: { fontSize: 18, fontWeight: "600", color: "#fff" },
//   noJobsSubtext: { fontSize: 14, color: "#94a3b8", textAlign: "center" },

//   jobCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   jobCardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   jobTypeBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.1)",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//     gap: 6,
//   },
//   jobTypeText: { color: "#fff", fontWeight: "600", fontSize: 12 },
//   jobEarningsBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(34, 197, 94, 0.1)",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//     gap: 6,
//   },
//   jobEarningsText: { color: "#22c55e", fontWeight: "bold", fontSize: 12 },
//   jobLocation: {
//     flexDirection: "row",
//     alignItems: "center",
//     fontSize: 14,
//     color: "#94a3b8",
//     marginBottom: 16,
//   },
//   jobCardButtons: { flexDirection: "row", gap: 12 },
//   jobDeclineButton: {
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 12,
//     backgroundColor: "rgba(239, 68, 68, 0.1)",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "rgba(239, 68, 68, 0.2)",
//     gap: 8,
//   },
//   jobDeclineButtonText: { color: "#f87171", fontWeight: "bold" },
//   jobDetailsButton: {
//     flex: 2,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 12,
//     backgroundColor: "#60a5fa",
//     borderRadius: 12,
//     gap: 8,
//   },
//   jobDetailsButtonText: { color: "#fff", fontWeight: "bold" },

//   linksRow: {
//     padding: 16,
//     position: "absolute",
//     bottom: -40,
//     right: 100,
//     gap: 24,
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     marginTop: 20,
//   },
//   link: { color: "#1976d2", textDecorationLine: "none", fontSize: 14 },
// });

// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
//   useMemo,
// } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   SafeAreaView,
// } from "react-native";
// import { useNavigation, useIsFocused } from "@react-navigation/native";
// import * as Location from "expo-location";
// import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
// import { io } from "socket.io-client";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   User,
//   LogOut,
//   Bell,
//   MapPin,
//   ClipboardEdit,
//   ArrowRight,
//   Briefcase,
//   BellOff,
//   X,
//   Eye,
//   DollarSign,
// } from "lucide-react-native";
// import api from "../api/client";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import ProviderStatsCard from "../components/ProviderStatsCard";
// import * as Notifications from "expo-notifications";
// import FooterPro from "../components/FooterPro";

// const SOCKET_HOST = "https://blinqfix.onrender.com";

// // Foreground notifications
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export default function ServiceProviderDashboard() {
//   const navigation = useNavigation();
//   const isFocused = useIsFocused();

//   const [user, setUser] = useState(null);
//   const [jobInvitations, setJobInvitations] = useState([]);
//   const [activeJob, setActiveJob] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const socketRef = useRef(null);
//   const invitesRef = useRef(jobInvitations);
//   invitesRef.current = jobInvitations;

  

//   const ensureNotificationSetup = useCallback(async () => {
//     try {
//       const current = await Notifications.getPermissionsAsync();
//       let granted =
//         current.granted ||
//         current.ios?.status ===
//           Notifications.IosAuthorizationStatus.AUTHORIZED ||
//         current.ios?.status ===
//           Notifications.IosAuthorizationStatus.PROVISIONAL;

//       if (!granted) {
//         const req = await Notifications.requestPermissionsAsync();
//         granted =
//           req.granted ||
//           req.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
//           req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
//       }

//       if (Platform.OS === "android") {
//         await Notifications.setNotificationChannelAsync("job-invites", {
//           name: "Job Invitations",
//           importance: Notifications.AndroidImportance.MAX,
//           sound: "default",
//           vibrationPattern: [0, 250, 250, 250],
//           enableVibrate: true,
//           bypassDnd: true,
//           lockscreenVisibility:
//             Notifications.AndroidNotificationVisibility.PUBLIC,
//         });
//       }
//     } catch (e) {
//       console.warn("Notification setup failed:", e);
//     }
//   }, []);

//   const presentInviteNotification = useCallback(async (payload) => {
//     const jobId = payload?.jobId || payload?._id || "";
//     const clickable =
//       typeof payload?.clickable === "boolean"
//         ? payload?.clickable
//         : payload?.buttonsActive ?? true;

//     const title = clickable ? "New Job Invitation" : "New Job Nearby (Teaser)";
//     const body = clickable
//       ? "A new customer needs you. Tap to open the invite."
//       : "You’ve received a teaser invite. Open the app to view details.";

//     try {
//       await Notifications.scheduleNotificationAsync({
//         content: { title, body, sound: "default", data: { jobId, clickable } },
//         trigger: null,
//       });
//     } catch {}
//   }, []);


 

//   // 🔹 Tiny summary gate + small job fetches
//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { data: userData } = await api.get("/users/me");
//       const u = userData?.user ?? userData;
//       if (!u?.role) return;
//       setUser(u);
  
//       // Active job (ignore 404)
//       try {
//         const { data: active } = await api.get("/jobs/provider/active");
//         setActiveJob(active);
//       } catch (e) {
//         if (e?.response?.status === 404) setActiveJob(null);
//         else throw e;
//       }
      
  
//       // === invites block from above ===
//       const zipRaw =
//         u.serviceZipcode ??
//         (Array.isArray(u.zipcode) ? u.zipcode[0] : u.zipcode) ??
//         "";
//       const svcRaw = (u.serviceType || "").trim();
  
//       const zip = encodeURIComponent(zipRaw);
//       const svc = encodeURIComponent(svcRaw);
  
//       let invites = [];
//       try {
//         const { data } = await api.get(
//           `/jobs/pending?serviceType=${svc}&serviceZipcode=${zip}`
//         );
//         invites = data;
//       } catch (e) {
//         if (e?.response?.status !== 404) throw e;
//         invites = [];
//       }
//       setJobInvitations(invites || []);
//     } catch (err) {
//       console.error("Failed to fetch initial data", err);
//       if (err?.response?.status === 401) {
//         handleLogout();
//       } else {
//         setJobInvitations([]);
//         setActiveJob(null);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, await AsyncStorage.multiRemove(["token", "refreshToken"]);
//   navigation.reset({ index: 0, routes: [{ name: "Login" }] }););
// }
  
// //   const fetchData = useCallback(async () => {
// //     try {
// //       // 1) summary first
// //       const { data: summary } = await api.get("/users/me/summary");
// //       const u = summary?.user;
// //       if (!u?.role) return;
// //       setUser(u);

// //       // 2) if incomplete, go finish profile (skip heavy calls)
// //       if (!summary.profileComplete) {
// //         navigation.navigate("ProviderProfile");
// //         return;
// //       }

// //       // 3) fetch active job (may be 404 if none)
// //       const { data: active } = await api
// //         .get("/jobs/provider/active")
// //         .catch((e) =>
// //           e?.response?.status === 404 ? { data: null } : Promise.reject(e)
// //         );
// //       setActiveJob(active || null);

// //       // 4) pending invites
// //   //     const zip = encodeURIComponent(u.serviceZipcode || u.zipcode || "");
// //   //     const svc = encodeURIComponent(u.serviceType || "");
// //   //     const { data: invites } = await api
// //   //       .get(`/jobs/pending?serviceType=${svc}&serviceZipcode=${zip}`)
// //   //       .catch((e) =>
// //   //         e?.response?.status === 404 ? { data: [] } : Promise.reject(e)
// //   //       );
// //   //     setJobInvitations(invites || []);
// //   //   } catch (err) {
// //   //     console.error("Failed to fetch initial data", err);
// //   //     if (err.response?.status === 401) {
// //   //       handleLogout();
// //   //     } else {
// //   //       setJobInvitations([]);
// //   //       setActiveJob(null);
// //   //     }
// //   //   } finally {
// //   //     setLoading(false);
// //   //   }
// //   // }, [navigation]);
// //   const zipRaw =
// //   u.serviceZipcode ??
// //   (Array.isArray(u.zipcode) ? u.zipcode[0] : u.zipcode) ??
// //   "";
// // const svcRaw = (u.serviceType || "").trim();

// // const zip = encodeURIComponent(zipRaw);
// // const svc = encodeURIComponent(svcRaw);

// // // fetch invites, treat 404 as "none"
// // let invites = [];
// // try {
// //   const { data } = await api.get(
// //     `/jobs/pending?serviceType=${svc}&serviceZipcode=${zip}`
// //   );
// //   invites = data;
// // } catch (e) {
// //   if (e?.response?.status !== 404) throw e; // bubble up real errors
// //   invites = [];
// // }
// // setJobInvitations(invites || []);

// //   useEffect(() => {
// //     ensureNotificationSetup();
// //   }, [ensureNotificationSetup]);

// //   useEffect(() => {
// //     if (isFocused) fetchData();
// //   }, [isFocused, fetchData]);

// //   // sockets
// //   useEffect(() => {
// //     let socket;
// //     if (user?.id || user?._id) {
// //       socket = io(SOCKET_HOST, { transports: ["websocket"], withCredentials: true });
// //       socketRef.current = socket;

// //       socket.on("connect", () => {
// //         const uid = user._id || user.id;
// //         socket.emit("joinUserRoom", { userId: uid });
// //         console.log("✅ Connected to socket and joined room for:", uid);
// //       });

// //       socket.on("connect_error", (err) => console.warn("❌ Socket error:", err));

// //       const handleInvitation = async (payload) => {
// //         await presentInviteNotification(payload);
// //         const jobId = payload.jobId || payload._id;
// //         const clickable =
// //           typeof payload.clickable === "boolean"
// //             ? payload.clickable
// //             : payload.buttonsActive ?? true;
// //         navigation.navigate("ProviderInvitation", {
// //           jobId,
// //           invitationExpiresAt: payload.invitationExpiresAt ?? null,
// //           clickable,
// //         });
// //       };

// //       const handleExpired = ({ jobId }) =>
// //         setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));

// //       const handleCancel = ({ jobId }) =>
// //         setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));

// //       const handlePaid = ({ jobId }) => {
// //         setActiveJob({ _id: jobId });
// //         navigation.navigate("ProviderJobStatus", { jobId });
// //         Notifications.scheduleNotificationAsync({
// //           content: { title: "Job Paid", body: "The customer has paid.", sound: "default" },
// //           trigger: null,
// //         }).catch(() => {});
// //       };

// //       socket.on("jobInvitation", handleInvitation);
// //       socket.on("jobExpired", handleExpired);
// //       socket.on("jobCancelled", handleCancel);
// //       socket.on("jobAcceptedElsewhere", handleExpired);
// //       socket.on("jobPaid", handlePaid);
// //     }

// //     return () => {
// //       if (socket) {
// //         socket.disconnect();
// //         socketRef.current = null;
// //       }
// //     };
// //   }, [user, navigation, presentInviteNotification]);

// //   // location -> send to socket
// //   useEffect(() => {
// //     const requestAndTrack = async () => {
// //       const { status } = await Location.requestForegroundPermissionsAsync();
// //       if (status !== "granted") {
// //         Alert.alert("Location Required", "Location permission is required to receive jobs.");
// //         return;
// //       }
// //       const sendLocation = async () => {
// //         try {
// //           const { coords } = await Location.getCurrentPositionAsync({});
// //           setLocation(coords);
// //           if (socketRef.current?.connected) {
// //             socketRef.current.emit("providerLocationUpdate", {
// //               coords: { lat: coords.latitude, lng: coords.longitude },
// //             });
// //           }
// //         } catch {}
// //       };
// //       sendLocation();
// //       const interval = setInterval(sendLocation, 60000);
// //       return () => clearInterval(interval);
// //     };
// //     if (user) requestAndTrack();
// //   }, [user]);

// //   const handleLogout = async () => {
// //     await AsyncStorage.clear();
// //     navigation.reset({ index: 0, routes: [{ name: "Login" }] });
// //   };

// //   const handleDeclineJob = async (jobId) => {
// //     try {
// //       await api.put(`/jobs/${jobId}/deny`);
// //       setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));
// //       Alert.alert("Declined", "You’ve passed on this invitation.");
// //     } catch (err) {
// //       console.error("Failed to decline job", err);
// //       Alert.alert("Error", err.response?.data?.msg || "Could not decline the job.");
// //     }
// //   };

// //   const firstName = useMemo(() => {
// //     if (!user) return "";
// //     const rawName = user.name || [user.firstName, user.lastName].filter(Boolean).join(" ");
// //     return rawName.split(" ")[0] || "Provider";
// //   }, [user]);

// //   if (loading) {
// //     return (
// //       <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.centered}>
// //         <ActivityIndicator size="large" color="#fff" />
// //       </LinearGradient>
// //     );
// //   }

// //   return (
// //     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
// //       <SafeAreaView style={{ flex: 1 }}>
// //         <ScrollView contentContainerStyle={styles.scrollContent}>
// //           {/* Header */}
// //           <View style={styles.header}>
// //             <View>
// //               <Text style={styles.welcomeText}>Welcome back,</Text>
// //               <Text style={styles.userName}>{firstName}</Text>
// //             </View>
// //             <View style={styles.headerIcons}>
// //               <TouchableOpacity
// //                 onPress={() => navigation.navigate("MyAccountScreen")}
// //                 style={styles.iconButton}
// //               >
// //                 <User color="#fff" size={24} />
// //               </TouchableOpacity>
// //               <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
// //                 <LogOut color="#f87171" size={24} />
// //               </TouchableOpacity>
// //             </View>
// //           </View>

// //           {/* Active Job Card */}
// //           {activeJob && activeJob._id && (
// //             <TouchableOpacity
// //               onPress={() => navigation.navigate("ProviderJobStatus", { jobId: activeJob._id })}
// //             >
// //               <LinearGradient
// //                 colors={["rgba(34, 197, 94, 0.2)", "rgba(16, 185, 129, 0.2)"]}
// //                 style={styles.activeJobCard}
// //               >
// //                 <View style={styles.activeJobLeft}>
// //                   <View style={styles.liveIndicator}>
// //                     <View style={styles.liveDot} />
// //                   </View>
// //                   <View>
// //                     <Text style={styles.activeJobTitle}>You have an active job</Text>
// //                     <Text style={styles.activeJobSubtitle}>Tap to view status & workflow</Text>
// //                   </View>
// //                 </View>
// //                 <ArrowRight color="#22c55e" size={24} />
// //               </LinearGradient>
// //             </TouchableOpacity>
// //           )}

// //           {/* Profile CTA */}
// //           <TouchableOpacity
// //             style={styles.profileCard}
// //             onPress={() => navigation.navigate("ProviderProfile")}
// //           >
// //             <ClipboardEdit color="#60a5fa" size={32} />
// //             <View style={styles.profileTextContainer}>
// //               <Text style={styles.profileTitle}>Complete Your Profile</Text>
// //               <Text style={styles.profileSubtitle}>
// //                 A complete profile helps you get more jobs.
// //               </Text>
// //             </View>
// //             <ArrowRight color="#60a5fa" size={24} />
// //           </TouchableOpacity>

// //           {/* Stats Card */}
// //           <ProviderStatsCard />

// //           {/* Map */}
// //           {location && (
// //             <View style={styles.mapCard}>
// //               <View style={styles.cardHeader}>
// //                 <MapPin color="#c084fc" size={20} />
// //                 <Text style={styles.cardTitle}>Your Live Location</Text>
// //               </View>

// //               <MapView
// //                 style={styles.map}
// //                 provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
// //                 initialRegion={{
// //                   latitude: location.latitude,
// //                   longitude: location.longitude,
// //                   latitudeDelta: 0.01,
// //                   longitudeDelta: 0.01,
// //                 }}
// //                 onMapReady={() => console.log("🗺️[MAP] ready")}
// //                 scrollEnabled={false}
// //                 zoomEnabled={false}
// //               >
// //                 <Marker
// //                   coordinate={{
// //                     latitude: location.latitude,
// //                     longitude: location.longitude,
// //                   }}
// //                 />
// //               </MapView>
// //             </View>
// //           )}
// //           <FooterPro />

// //           {/* Job Invitations */}
// //           <View style={styles.section}>
// //             <View style={styles.cardHeader}>
// //               <Bell color="#fb923c" size={20} />
// //               <Text style={styles.cardTitle}>New Job Invitations</Text>
// //             </View>
// //             {jobInvitations.length === 0 ? (
// //               <View style={styles.noJobsCard}>
// //                 <BellOff color="#94a3b8" size={32} />
// //                 <Text style={styles.noJobsText}>No new jobs right now.</Text>
// //                 <Text style={styles.noJobsSubtext}>
// //                   We'll notify you when a job is available.
// //                 </Text>
// //               </View>
// //             ) : (
// //               jobInvitations.map((job) => (
// //                 <View key={job._id} style={styles.jobCard}>
// //                   <View style={styles.jobCardHeader}>
// //                     <View style={styles.jobTypeBadge}>
// //                       <Briefcase color="#fff" size={14} />
// //                       <Text style={styles.jobTypeText}>{job.serviceType}</Text>
// //                     </View>
// //                     <View style={styles.jobEarningsBadge}>
// //                       <DollarSign color="#22c55e" size={14} />
// //                       <Text style={styles.jobEarningsText}>
// //                         ~${(job.estimatedTotal || 150).toFixed(2)}
// //                       </Text>
// //                     </View>
// //                   </View>
// //                   <Text style={styles.jobLocation}>
// //                     <MapPin size={14} color="#94a3b8" /> {job.address}, {job.serviceCity}
// //                   </Text>

// //                   <View style={styles.jobCardButtons}>
// //                     <TouchableOpacity
// //                       style={styles.jobDeclineButton}
// //                       onPress={() => handleDeclineJob(job._id)}
// //                     >
// //                       <X color="#f87171" size={18} />
// //                       <Text style={styles.jobDeclineButtonText}>Decline</Text>
// //                     </TouchableOpacity>
// //                     <TouchableOpacity
// //                       style={styles.jobDetailsButton}
// //                       onPress={() =>
// //                         navigation.navigate("ProviderInvitation", {
// //                           jobId: job._id,
// //                           invitationExpiresAt: job.invitationExpiresAt,
// //                           clickable: true,
// //                         })
// //                       }
// //                     >
// //                       <Eye color="#fff" size={18} />
// //                       <Text style={styles.jobDetailsButtonText}>View Details</Text>
// //                     </TouchableOpacity>
// //                   </View>
// //                 </View>
// //               ))
// //             )}
// //           </View>
// //         </ScrollView>
// //       </SafeAreaView>
// //     </LinearGradient>
// //   );
// // }
// //   }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },
//   scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: 10,
//     paddingBottom: 20,
//     marginBottom: 20,
//   },
//   welcomeText: { fontSize: 18, color: "#e0e7ff" },
//   userName: { fontSize: 28, fontWeight: "bold", color: "#fff" },
//   headerIcons: { flexDirection: "row", gap: 16 },
//   iconButton: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     padding: 10,
//     borderRadius: 99,
//   },

//   activeJobCard: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "rgba(34, 197, 94, 0.5)",
//     marginBottom: 20,
//   },
//   activeJobLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
//   liveIndicator: { width: 12, height: 12, justifyContent: "center", alignItems: "center" },
//   liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e" },
//   activeJobTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
//   activeJobSubtitle: { color: "#e0e7ff", fontSize: 14 },

//   profileCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(96, 165, 250, 0.1)",
//     padding: 20,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "rgba(96, 165, 250, 0.3)",
//     marginBottom: 20,
//     gap: 16,
//   },
//   profileTextContainer: { flex: 1 },
//   profileTitle: { fontSize: 16, fontWeight: "bold", color: "#fff" },
//   profileSubtitle: { fontSize: 14, color: "#e0e7ff", marginTop: 4 },

//   mapCard: {
//     borderRadius: 16,
//     height: 550,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//     overflow: "hidden",
//   },
//   cardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     marginBottom: 16,
//   },
//   cardTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
//   map: { ...StyleSheet.absoluteFillObject },

//   section: { marginTop: 40, marginBottom: 40 },
//   noJobsCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     paddingVertical: 40,
//     paddingHorizontal: 20,
//     alignItems: "center",
//     gap: 12,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   noJobsText: { fontSize: 18, fontWeight: "600", color: "#fff" },
//   noJobsSubtext: { fontSize: 14, color: "#94a3b8", textAlign: "center" },

//   jobCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   jobCardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   jobTypeBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.1)",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//     gap: 6,
//   },
//   jobTypeText: { color: "#fff", fontWeight: "600", fontSize: 12 },
//   jobEarningsBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(34, 197, 94, 0.1)",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//     gap: 6,
//   },
//   jobEarningsText: { color: "#22c55e", fontWeight: "bold", fontSize: 12 },
//   jobLocation: {
//     flexDirection: "row",
//     alignItems: "center",
//     fontSize: 14,
//     color: "#94a3b8",
//     marginBottom: 16,
//   },
//   jobCardButtons: { flexDirection: "row", gap: 12 },
//   jobDeclineButton: {
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 12,
//     backgroundColor: "rgba(239, 68, 68, 0.1)",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "rgba(239, 68, 68, 0.2)",
//     gap: 8,
//   },
//   jobDeclineButtonText: { color: "#f87171", fontWeight: "bold" },
//   jobDetailsButton: {
//     flex: 2,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 12,
//     backgroundColor: "#60a5fa",
//     borderRadius: 12,
//     gap: 8,
//   },
//   jobDetailsButtonText: { color: "#fff", fontWeight: "bold" },
// });

// // ServiceProviderDashboard.js working
// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
//   useMemo,
// } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   SafeAreaView,
// } from "react-native";
// import { useNavigation, useIsFocused } from "@react-navigation/native";
// import * as Location from "expo-location";
// import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
// import { io } from "socket.io-client";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   User,
//   LogOut,
//   Bell,
//   MapPin,
//   ClipboardEdit,
//   ArrowRight,
//   Briefcase,
//   BellOff,
//   X,
//   Eye,
//   DollarSign,
// } from "lucide-react-native";
// import api from "../api/client";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import ProviderStatsCard from "../components/ProviderStatsCard";
// import * as Notifications from "expo-notifications";
// import Constants from "expo-constants";
// import FooterPro from "../components/FooterPro";
// import TestMapScreen from "./TestMapScreen";

// const SOCKET_HOST = "https://blinqfix.onrender.com";

// // Foreground notifications
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// export default function ServiceProviderDashboard() {
//   const navigation = useNavigation();
//   const isFocused = useIsFocused();

//   const [user, setUser] = useState(null);
//   const [jobInvitations, setJobInvitations] = useState([]);
//   const [activeJob, setActiveJob] = useState(null);
//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const socketRef = useRef(null);

//   const ensureNotificationSetup = useCallback(async () => {
//     try {
//       const current = await Notifications.getPermissionsAsync();
//       let granted =
//         current.granted ||
//         current.ios?.status ===
//           Notifications.IosAuthorizationStatus.AUTHORIZED ||
//         current.ios?.status ===
//           Notifications.IosAuthorizationStatus.PROVISIONAL;

//       if (!granted) {
//         const req = await Notifications.requestPermissionsAsync();
//         granted =
//           req.granted ||
//           req.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
//           req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
//       }

//       if (Platform.OS === "android") {
//         await Notifications.setNotificationChannelAsync("job-invites", {
//           name: "Job Invitations",
//           importance: Notifications.AndroidImportance.MAX,
//           sound: "default",
//           vibrationPattern: [0, 250, 250, 250],
//           enableVibrate: true,
//           bypassDnd: true,
//           lockscreenVisibility:
//             Notifications.AndroidNotificationVisibility.PUBLIC,
//         });
//       }
//     } catch (e) {
//       console.warn("Notification setup failed:", e);
//     }
//   }, []);

//   const presentInviteNotification = useCallback(async (payload) => {
//     const jobId = payload?.jobId || payload?._id || "";
//     const clickable =
//       typeof payload?.clickable === "boolean"
//         ? payload?.clickable
//         : payload?.buttonsActive ?? true;

//     const title = clickable ? "New Job Invitation" : "New Job Nearby (Teaser)";
//     const body = clickable
//       ? "A new customer needs you. Tap to open the invite."
//       : "You’ve received a teaser invite. Open the app to view details.";

//     try {
//       await Notifications.scheduleNotificationAsync({
//         content: { title, body, sound: "default", data: { jobId, clickable } },
//         trigger: null,
//       });
//     } catch {
//       /* no-op */
//     }
//   }, []);

//   // ✅ logout helper (used when 401s happen)
//   const handleLogout = useCallback(async () => {
//     try {
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);
//     } finally {
//       navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//     }
//   }, [navigation]);

//   // 🔹 Tiny fetches (user, active job, invites)
//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     try {
//       // me
//       const { data: userData } = await api.get("/users/me");
//       const u = userData?.user ?? userData;
//       if (!u?.role) {
//         setLoading(false);
//         return;
//       }
//       setUser(u);

//       // active job (treat 404 as none)
//       try {
//         const { data: active } = await api.get("/jobs/provider/active");
//         setActiveJob(active);
//       } catch (e) {
//         if (e?.response?.status === 404) setActiveJob(null);
//         else throw e;
//       }

//       // invites (treat 404 as none)
//       const zipRaw =
//         u?.serviceZipcode ??
//         (Array.isArray(u?.zipcode) ? u.zipcode[0] : u?.zipcode) ??
//         "";
//       const svcRaw = (u?.serviceType || "").trim();

//       const zip = encodeURIComponent(zipRaw);
//       const svc = encodeURIComponent(svcRaw);

//       let invites = [];
//       try {
//         const { data } = await api.get(
//           `/jobs/pending?serviceType=${svc}&serviceZipcode=${zip}`
//         );
//         invites = data;
//       } catch (e) {
//         if (e?.response?.status !== 404) throw e;
//         invites = [];
//       }
//       setJobInvitations(invites || []);
//     } catch (err) {
//       console.error("Failed to fetch initial data", err);
//       if (err?.response?.status === 401) {
//         await handleLogout();
//       } else {
//         setJobInvitations([]);
//         setActiveJob(null);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [handleLogout]);

//   useEffect(() => {
//     ensureNotificationSetup();
//   }, [ensureNotificationSetup]);

//   useEffect(() => {
//     if (isFocused) fetchData();
//   }, [isFocused, fetchData]);

//   // sockets
//   useEffect(() => {
//     let socket;
//     if (user?.id || user?._id) {
//       socket = io(SOCKET_HOST, {
//         transports: ["websocket"],
//         withCredentials: true,
//       });
//       socketRef.current = socket;

//       socket.on("connect", () => {
//         const uid = user._id || user.id;
//         socket.emit("joinUserRoom", { userId: uid });
//         console.log("✅ Connected to socket and joined room for:", uid);
//       });

//       socket.on("connect_error", (err) =>
//         console.warn("❌ Socket error:", err)
//       );

//       const handleInvitation = async (payload) => {
//         await presentInviteNotification(payload);
//         const jobId = payload.jobId || payload._id;
//         const clickable =
//           typeof payload.clickable === "boolean"
//             ? payload.clickable
//             : payload.buttonsActive ?? true;
//         navigation.navigate("ProviderInvitation", {
//           jobId,
//           invitationExpiresAt: payload.invitationExpiresAt ?? null,
//           clickable,
//         });
//       };

//       const handleExpired = ({ jobId }) =>
//         setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));

//       const handleCancel = ({ jobId }) =>
//         setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));

//       const handlePaid = ({ jobId }) => {
//         setActiveJob({ _id: jobId });
//         navigation.navigate("ProviderJobStatus", { jobId });
//         Notifications.scheduleNotificationAsync({
//           content: {
//             title: "Job Paid",
//             body: "The customer has paid.",
//             sound: "default",
//           },
//           trigger: null,
//         }).catch(() => {});
//       };

//       socket.on("jobInvitation", handleInvitation);
//       socket.on("jobExpired", handleExpired);
//       socket.on("jobCancelled", handleCancel);
//       socket.on("jobAcceptedElsewhere", handleExpired);
//       socket.on("jobPaid", handlePaid);
//     }

//     return () => {
//       if (socket) {
//         socket.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, [user, navigation, presentInviteNotification]);

//   // location -> emit to socket
//   useEffect(() => {
//     const requestAndTrack = async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert(
//           "Location Required",
//           "Location permission is required to receive jobs."
//         );
//         return;
//       }
//       const sendLocation = async () => {
//         try {
//           const { coords } = await Location.getCurrentPositionAsync({});
//           setLocation(coords);
//           console.log("Location", location)
//           console.log("coords", coords)
//           if (socketRef.current?.connected) {
//             socketRef.current.emit("providerLocationUpdate", {
//               coords: { lat: coords.latitude, lng: coords.longitude },
//             });
//           }
//         } catch {
//           /* no-op */
//         }
//       };
//       sendLocation();
//       const interval = setInterval(sendLocation, 60000);
//       return () => clearInterval(interval);
//     };
//     if (user) requestAndTrack();
//   }, [user]);

//   const handleDeclineJob = async (jobId) => {
//     try {
//       await api.put(`/jobs/${jobId}/deny`);
//       setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));
//       Alert.alert("Declined", "You’ve passed on this invitation.");
//     } catch (err) {
//       console.error("Failed to decline job", err);
//       Alert.alert(
//         "Error",
//         err.response?.data?.msg || "Could not decline the job."
//       );
//     }
//   };

//   const firstName = useMemo(() => {
//     if (!user) return "";
//     const rawName =
//       user.name || [user.firstName, user.lastName].filter(Boolean).join(" ");
//     return rawName.split(" ")[0] || "Provider";
//   }, [user]);

//   if (loading) {
//     return (
//       <LinearGradient
//         colors={["#0f172a", "#1e3a8a", "#312e81"]}
//         style={styles.centered}
//       >
//         <ActivityIndicator size="large" color="#fff" />
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
//             <View>
//               <Text style={styles.welcomeText}>Welcome back,</Text>
//               <Text style={styles.userName}>{firstName}</Text>
//             </View>
//             <View style={styles.headerIcons}>
//               <TouchableOpacity
//                 onPress={() => navigation.navigate("MyAccountScreen")}
//                 style={styles.iconButton}
//               >
//                 <User color="#fff" size={24} />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
//                 <LogOut color="#f87171" size={24} />
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Active Job Card */}
//           {activeJob && activeJob._id && (
//             <TouchableOpacity
//               onPress={() =>
//                 navigation.navigate("ProviderJobStatus", {
//                   jobId: activeJob._id,
//                 })
//               }
//             >
//               <LinearGradient
//                 colors={["rgba(34, 197, 94, 0.2)", "rgba(16, 185, 129, 0.2)"]}
//                 style={styles.activeJobCard}
//               >
//                 <View style={styles.activeJobLeft}>
//                   <View style={styles.liveIndicator}>
//                     <View style={styles.liveDot} />
//                   </View>
//                   <View>
//                     <Text style={styles.activeJobTitle}>
//                       You have an active job
//                     </Text>
//                     <Text style={styles.activeJobSubtitle}>
//                       Tap to view status & workflow
//                     </Text>
//                   </View>
//                 </View>
//                 <ArrowRight color="#22c55e" size={24} />
//               </LinearGradient>
//             </TouchableOpacity>
//           )}

//           {/* Profile CTA */}
//           <TouchableOpacity
//             style={styles.profileCard}
//             onPress={() => navigation.navigate("ProviderProfile")}
//           >
//             <ClipboardEdit color="#60a5fa" size={32} />
//             <View style={styles.profileTextContainer}>
//               <Text style={styles.profileTitle}>Complete / Edit Your Profile</Text>
//               <Text style={styles.profileSubtitle}>
//                 A complete profile helps you get more jobs.
//               </Text>
//             </View>
//             <ArrowRight color="#60a5fa" size={24} />
//           </TouchableOpacity>

//           {/* Stats Card */}
//           <ProviderStatsCard />

//           {/* Map */}
//           {location && (
//             <View style={styles.mapCard}>
//               <View style={styles.cardHeader}>
//                 <MapPin color="#c084fc" size={20} />
//                 <Text style={styles.cardTitle}>Your Live Location</Text>
//               </View>

//               <MapView
//                 style={styles.mapSolid}
//                 provider={Platform.OS === "android" ? PROVIDER_GOOGLE: undefined}
//                 initialRegion={{
//                   latitude: location.latitude,
//                   longitude: location.longitude,
//                   latitudeDelta: 0.01,
//                   longitudeDelta: 0.01,
//                 }}
//                 onMapReady={() => console.log("🗺️[MAP] ready")}
//                 scrollEnabled={false}
//                 zoomEnabled={false}
//               >
//                 <Marker
//                   coordinate={{
//                     latitude: location.latitude,
//                     longitude: location.longitude,
//                   }}
//                 />
//               </MapView>
//             </View>
//           )}
      
//           <FooterPro />

//           {/* Job Invitations */}
//           <View style={styles.section}>
//             <View className="cardHeader" style={styles.cardHeader}>
//               <Bell color="#fb923c" size={20} />
//               <Text style={styles.cardTitle}>New Job Invitations</Text>
//             </View>
//             {jobInvitations.length === 0 ? (
//               <View style={styles.noJobsCard}>
//                 <BellOff color="#94a3b8" size={32} />
//                 <Text style={styles.noJobsText}>No new jobs right now.</Text>
//                 <Text style={styles.noJobsSubtext}>
//                   We'll notify you when a job is available.
//                 </Text>
//               </View>
//             ) : (
//               jobInvitations.map((job) => (
//                 <View key={job._id} style={styles.jobCard}>
//                   <View style={styles.jobCardHeader}>
//                     <View style={styles.jobTypeBadge}>
//                       <Briefcase color="#fff" size={14} />
//                       <Text style={styles.jobTypeText}>{job.serviceType}</Text>
//                     </View>
//                     <View style={styles.jobEarningsBadge}>
//                       <DollarSign color="#22c55e" size={14} />
//                       <Text style={styles.jobEarningsText}>
//                         ~${(job.estimatedTotal || 150).toFixed(2)}
//                       </Text>
//                     </View>
//                   </View>
//                   <Text style={styles.jobLocation}>
//                     <MapPin size={14} color="#94a3b8" /> {job.address},{" "}
//                     {job.serviceCity}
//                   </Text>

//                   <View style={styles.jobCardButtons}>
//                     <TouchableOpacity
//                       style={styles.jobDeclineButton}
//                       onPress={() => handleDeclineJob(job._id)}
//                     >
//                       <X color="#f87171" size={18} />
//                       <Text style={styles.jobDeclineButtonText}>Decline</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       style={styles.jobDetailsButton}
//                       onPress={() =>
//                         navigation.navigate("ProviderInvitation", {
//                           jobId: job._id,
//                           invitationExpiresAt: job.invitationExpiresAt,
//                           clickable: true,
//                         })
//                       }
//                     >
//                       <Eye color="#fff" size={18} />
//                       <Text style={styles.jobDetailsButtonText}>
//                         View Details
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               ))
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
//   scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: 10,
//     paddingBottom: 20,
//     marginBottom: 20,
//   },
//   welcomeText: { fontSize: 18, color: "#e0e7ff" },
//   userName: { fontSize: 28, fontWeight: "bold", color: "#fff" },
//   headerIcons: { flexDirection: "row", gap: 16 },
//   iconButton: {
//     backgroundColor: "rgba(255,255,255,0.1)",
//     padding: 10,
//     borderRadius: 99,
//   },

//   activeJobCard: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "rgba(34, 197, 94, 0.5)",
//     marginBottom: 20,
//   },
//   activeJobLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
//   liveIndicator: { width: 12, height: 12, justifyContent: "center", alignItems: "center" },
//   liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e" },
//   activeJobTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
//   activeJobSubtitle: { color: "#e0e7ff", fontSize: 14 },

//   profileCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(96, 165, 250, 0.1)",
//     padding: 20,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "rgba(96, 165, 250, 0.3)",
//     marginBottom: 20,
//     gap: 16,
//   },
//   profileTextContainer: { flex: 1 },
//   profileTitle: { fontSize: 16, fontWeight: "bold", color: "#fff" },
//   profileSubtitle: { fontSize: 14, color: "#e0e7ff", marginTop: 4 },

//   mapCard: {
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//     // NOTE: avoid overflow:'hidden' here; it can blank MapView on Android
//   },
//   cardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     marginBottom: 16,
//   },
//   cardTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
//   mapSolid: {
//     height: 260,
//     borderRadius: 12,
//   },

//   section: { marginTop: 40, marginBottom: 40 },
//   noJobsCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     paddingVertical: 40,
//     paddingHorizontal: 20,
//     alignItems: "center",
//     gap: 12,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   noJobsText: { fontSize: 18, fontWeight: "600", color: "#fff" },
//   noJobsSubtext: { fontSize: 14, color: "#94a3b8", textAlign: "center" },

//   jobCard: {
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   jobCardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   jobTypeBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.1)",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//     gap: 6,
//   },
//   jobTypeText: { color: "#fff", fontWeight: "600", fontSize: 12 },
//   jobEarningsBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(34, 197, 94, 0.1)",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 16,
//     gap: 6,
//   },
//   jobEarningsText: { color: "#22c55e", fontWeight: "bold", fontSize: 12 },
//   jobLocation: {
//     flexDirection: "row",
//     alignItems: "center",
//     fontSize: 14,
//     color: "#94a3b8",
//     marginBottom: 16,
//   },
//   jobCardButtons: { flexDirection: "row", gap: 12 },
//   jobDeclineButton: {
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 12,
//     backgroundColor: "rgba(239, 68, 68, 0.1)",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "rgba(239, 68, 68, 0.2)",
//     gap: 8,
//   },
//   jobDeclineButtonText: { color: "#f87171", fontWeight: "bold" },
//   jobDetailsButton: {
//     flex: 2,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 12,
//     backgroundColor: "#60a5fa",
//     borderRadius: 12,
//     gap: 8,
//   },
//   jobDetailsButtonText: { color: "#fff", fontWeight: "bold" },
// });


import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import { io } from "socket.io-client";
import { LinearGradient } from "expo-linear-gradient";
import {
  User,
  LogOut,
  Bell,
  MapPin,
  ClipboardEdit,
  ArrowRight,
  Briefcase,
  BellOff,
  X,
  Eye,
  DollarSign,
  RefreshCw,
} from "lucide-react-native";
import api from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProviderStatsCard from "../components/ProviderStatsCard";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import FooterPro from "../components/FooterPro";
import TestMapScreen from "./TestMapScreen";
import { loadSession } from "../utils/sessionManager";

const SOCKET_HOST = "https://blinqfix.onrender.com";

// Foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ServiceProviderDashboard() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [user, setUser] = useState(null);
  const [jobInvitations, setJobInvitations] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resuming, setResuming] = useState(false);

  const socketRef = useRef(null);

  const ensureNotificationSetup = useCallback(async () => {
    try {
      const current = await Notifications.getPermissionsAsync();
      let granted =
        current.granted ||
        current.ios?.status ===
          Notifications.IosAuthorizationStatus.AUTHORIZED ||
        current.ios?.status ===
          Notifications.IosAuthorizationStatus.PROVISIONAL;

      if (!granted) {
        const req = await Notifications.requestPermissionsAsync();
        granted =
          req.granted ||
          req.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
          req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("job-invites", {
          name: "Job Invitations",
          importance: Notifications.AndroidImportance.MAX,
          sound: "default",
          vibrationPattern: [0, 250, 250, 250],
          enableVibrate: true,
          bypassDnd: true,
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      }
    } catch (e) {
      console.warn("Notification setup failed:", e);
    }
  }, []);

  const presentInviteNotification = useCallback(async (payload) => {
    const jobId = payload?.jobId || payload?._id || "";
    const clickable =
      typeof payload?.clickable === "boolean"
        ? payload?.clickable
        : payload?.buttonsActive ?? true;

    const title = clickable ? "New Job Invitation" : "New Job Nearby (Teaser)";
    const body = clickable
      ? "A new customer needs you. Tap to open the invite."
      : "You’ve received a teaser invite. Open the app to view details.";

    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: "default", data: { jobId, clickable } },
        trigger: null,
      });
    } catch {
      /* no-op */
    }
  }, []);

  // ✅ logout helper (used when 401s happen)
  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(["token", "refreshToken"]);
    } finally {
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  }, [navigation]);

  // 🔹 Tiny fetches (user, active job, invites)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // me
      const { data: userData } = await api.get("/users/me");
      const u = userData?.user ?? userData;
      if (!u?.role) {
        setLoading(false);
        return;
      }
      setUser(u);

      // active job (treat 404 as none)
      try {
        const { data: active } = await api.get("/jobs/provider/active");
        setActiveJob(active);
      } catch (e) {
        if (e?.response?.status === 404) setActiveJob(null);
        else throw e;
      }

      // invites (treat 404 as none)
      const zipRaw =
        u?.serviceZipcode ??
        (Array.isArray(u?.zipcode) ? u.zipcode[0] : u?.zipcode) ??
        "";
      const svcRaw = (u?.serviceType || "").trim();

      const zip = encodeURIComponent(zipRaw);
      const svc = encodeURIComponent(svcRaw);

      let invites = [];
      try {
        const { data } = await api.get(
          `/jobs/pending?serviceType=${svc}&serviceZipcode=${zip}`
        );
        invites = data;
      } catch (e) {
        if (e?.response?.status !== 404) throw e;
        invites = [];
      }
      setJobInvitations(invites || []);
    } catch (err) {
      console.error("Failed to fetch initial data", err);
      if (err?.response?.status === 401) {
        await handleLogout();
      } else {
        setJobInvitations([]);
        setActiveJob(null);
      }
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    ensureNotificationSetup();
  }, [ensureNotificationSetup]);

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused, fetchData]);

  // sockets
  useEffect(() => {
    let socket;
    if (user?.id || user?._id) {
      socket = io(SOCKET_HOST, {
        transports: ["websocket"],
        withCredentials: true,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        const uid = user._id || user.id;
        socket.emit("joinUserRoom", { userId: uid });
        console.log("✅ Connected to socket and joined room for:", uid);
      });

      socket.on("connect_error", (err) =>
        console.warn("❌ Socket error:", err)
      );

      const handleInvitation = async (payload) => {
        await presentInviteNotification(payload);
        const jobId = payload.jobId || payload._id;
        const clickable =
          typeof payload.clickable === "boolean"
            ? payload.clickable
            : payload.buttonsActive ?? true;
        navigation.navigate("ProviderInvitation", {
          jobId,
          invitationExpiresAt: payload.invitationExpiresAt ?? null,
          clickable,
        });
      };

      const handleExpired = ({ jobId }) =>
        setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));

      const handleCancel = ({ jobId }) =>
        setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));

      const handlePaid = ({ jobId }) => {
        setActiveJob({ _id: jobId });
        navigation.navigate("ProviderJobStatus", { jobId });
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Job Paid",
            body: "The customer has paid.",
            sound: "default",
          },
          trigger: null,
        }).catch(() => {});
      };

      socket.on("jobInvitation", handleInvitation);
      socket.on("jobExpired", handleExpired);
      socket.on("jobCancelled", handleCancel);
      socket.on("jobAcceptedElsewhere", handleExpired);
      socket.on("jobPaid", handlePaid);
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, navigation, presentInviteNotification]);

  // location -> emit to socket
  useEffect(() => {
    const requestAndTrack = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Required",
          "Location permission is required to receive jobs."
        );
        return;
      }
      const sendLocation = async () => {
        try {
          const { coords } = await Location.getCurrentPositionAsync({});
          setLocation(coords);
          if (socketRef.current?.connected) {
            socketRef.current.emit("providerLocationUpdate", {
              coords: { lat: coords.latitude, lng: coords.longitude },
            });
          }
        } catch {
          /* no-op */
        }
      };
      sendLocation();
      const interval = setInterval(sendLocation, 60000);
      return () => clearInterval(interval);
    };
    if (user) requestAndTrack();
  }, [user]);

  const handleDeclineJob = async (jobId) => {
    try {
      await api.put(`/jobs/${jobId}/deny`);
      setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));
      Alert.alert("Declined", "You’ve passed on this invitation.");
    } catch (err) {
      console.error("Failed to decline job", err);
      Alert.alert(
        "Error",
        err.response?.data?.msg || "Could not decline the job."
      );
    }
  };

  // 🔁 Resume Active Job helper (session + backend)
  const resumeActiveJob = useCallback(async () => {
    if (resuming) return;
    setResuming(true);
    try {
      // 1) Try local session
      const session = await loadSession();
      if (session?.role === "serviceProvider" && session?.jobId) {
        navigation.navigate("ProviderJobStatus", { jobId: session.jobId });
        return;
      }
      // 2) Ask backend
      try {
        const { data } = await api.get("/jobs/provider/active");
        if (data?._id) {
          navigation.navigate("ProviderJobStatus", { jobId: data._id });
          return;
        }
      } catch (e) {
        if (e?.response?.status !== 404) throw e;
      }
      Alert.alert("No Active Job", "We couldn’t find an active job to resume.");
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.msg || "Could not look up active job."
      );
    } finally {
      setResuming(false);
    }
  }, [navigation, resuming]);

  const firstName = useMemo(() => {
    if (!user) return "";
    const rawName =
      user.name || [user.firstName, user.lastName].filter(Boolean).join(" ");
    return rawName.split(" ")[0] || "Provider";
  }, [user]);

  if (loading) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#312e81"]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#312e81"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{firstName}</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={() => navigation.navigate("MyAccountScreen")}
                style={styles.iconButton}
              >
                <User color="#fff" size={24} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
                <LogOut color="#f87171" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Resume Active Job */}
          <TouchableOpacity
            onPress={resumeActiveJob}
            activeOpacity={0.9}
            style={styles.resumeButton}
          >
            <LinearGradient
              colors={["#60a5fa", "#2563eb"]}
              style={styles.resumeButtonInner}
            >
              <RefreshCw color="#fff" size={18} />
              <Text style={styles.resumeButtonText}>
                {resuming ? "Checking…" : "Resume Active Job"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Active Job Card */}
          {activeJob && activeJob._id && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ProviderJobStatus", {
                  jobId: activeJob._id,
                })
              }
            >
              <LinearGradient
                colors={["rgba(34, 197, 94, 0.2)", "rgba(16, 185, 129, 0.2)"]}
                style={styles.activeJobCard}
              >
                <View style={styles.activeJobLeft}>
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                  </View>
                  <View>
                    <Text style={styles.activeJobTitle}>
                      You have an active job
                    </Text>
                    <Text style={styles.activeJobSubtitle}>
                      Tap to view status & workflow
                    </Text>
                  </View>
                </View>
                <ArrowRight color="#22c55e" size={24} />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Profile CTA */}
          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => navigation.navigate("ProviderProfile")}
          >
            <ClipboardEdit color="#60a5fa" size={32} />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileTitle}>Complete / Edit Your Profile</Text>
              <Text style={styles.profileSubtitle}>
                A complete profile helps you get more jobs.
              </Text>
            </View>
            <ArrowRight color="#60a5fa" size={24} />
          </TouchableOpacity>

          {/* Stats Card */}
          <ProviderStatsCard />

          {/* Map */}
          {location && (
            <View style={styles.mapCard}>
              <View style={styles.cardHeader}>
                <MapPin color="#c084fc" size={20} />
                <Text style={styles.cardTitle}>Your Live Location</Text>
              </View>

              <MapView
                style={styles.mapSolid}
                provider={Platform.OS === "android" ? PROVIDER_GOOGLE: undefined}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onMapReady={() => console.log("🗺️[MAP] ready")}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                />
              </MapView>
            </View>
          )}
      
          <FooterPro />

          {/* Job Invitations */}
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Bell color="#fb923c" size={20} />
              <Text style={styles.cardTitle}>New Job Invitations</Text>
            </View>
            {jobInvitations.length === 0 ? (
              <View style={styles.noJobsCard}>
                <BellOff color="#94a3b8" size={32} />
                <Text style={styles.noJobsText}>No new jobs right now.</Text>
                <Text style={styles.noJobsSubtext}>
                  We'll notify you when a job is available.
                </Text>
              </View>
            ) : (
              jobInvitations.map((job) => (
                <View key={job._id} style={styles.jobCard}>
                  <View style={styles.jobCardHeader}>
                    <View style={styles.jobTypeBadge}>
                      <Briefcase color="#fff" size={14} />
                      <Text style={styles.jobTypeText}>{job.serviceType}</Text>
                    </View>
                    <View style={styles.jobEarningsBadge}>
                      <DollarSign color="#22c55e" size={14} />
                      <Text style={styles.jobEarningsText}>
                        ~${(job.estimatedTotal || 150).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.jobLocation}>
                    <MapPin size={14} color="#94a3b8" /> {job.address},{" "}
                    {job.serviceCity}
                  </Text>

                  <View style={styles.jobCardButtons}>
                    <TouchableOpacity
                      style={styles.jobDeclineButton}
                      onPress={() => handleDeclineJob(job._id)}
                    >
                      <X color="#f87171" size={18} />
                      <Text style={styles.jobDeclineButtonText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.jobDetailsButton}
                      onPress={() =>
                        navigation.navigate("ProviderInvitation", {
                          jobId: job._id,
                          invitationExpiresAt: job.invitationExpiresAt,
                          clickable: true,
                        })
                      }
                    >
                      <Eye color="#fff" size={18} />
                      <Text style={styles.jobDetailsButtonText}>
                        View Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
    marginBottom: 20,
  },
  welcomeText: { fontSize: 18, color: "#e0e7ff" },
  userName: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  headerIcons: { flexDirection: "row", gap: 16 },
  iconButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 99,
  },

  // Resume Active Job
  resumeButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  resumeButtonInner: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  resumeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  activeJobCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.5)",
    marginBottom: 20,
  },
  activeJobLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  liveIndicator: { width: 12, height: 12, justifyContent: "center", alignItems: "center" },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e" },
  activeJobTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  activeJobSubtitle: { color: "#e0e7ff", fontSize: 14 },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(96, 165, 250, 0.1)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.3)",
    marginBottom: 20,
    gap: 16,
  },
  profileTextContainer: { flex: 1 },
  profileTitle: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  profileSubtitle: { fontSize: 14, color: "#e0e7ff", marginTop: 4 },

  mapCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    // NOTE: avoid overflow:'hidden' here; it can blank MapView on Android
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  mapSolid: {
    height: 260,
    borderRadius: 12,
  },

  section: { marginTop: 40, marginBottom: 40 },
  noJobsCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  noJobsText: { fontSize: 18, fontWeight: "600", color: "#fff" },
  noJobsSubtext: { fontSize: 14, color: "#94a3b8", textAlign: "center" },

  jobCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  jobTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  jobTypeText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  jobEarningsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  jobEarningsText: { color: "#22c55e", fontWeight: "bold", fontSize: 12 },
  jobLocation: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 16,
  },
  jobCardButtons: { flexDirection: "row", gap: 12 },
  jobDeclineButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    gap: 8,
  },
  jobDeclineButtonText: { color: "#f87171", fontWeight: "bold" },
  jobDetailsButton: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#60a5fa",
    borderRadius: 12,
    gap: 8,
  },
  jobDetailsButtonText: { color: "#fff", fontWeight: "bold" },
});
