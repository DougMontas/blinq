// frontend/screens/CustomerDashboard.js
// import React, { useEffect, useState } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../api/client";                       // same Axios instance

// // child components you already have
// // import LogoutButton from "../components/LogoutButton";
// // import HomeownerJobStatusPage from "../components/HomeownerJobStatusPage";
// // import PaymentReminder from "../components/PaymentReminder";

// /* ---------- static service categories ---------- */
// const categories = [
//   {
//     name: "Plumbing",
//     img: "https://th.bing.com/th/id/OIP.OAC7CxrSz9r58CBsJWbJHwHaE8"
//   },
//   {
//     name: "Roofing",
//     img: "https://th.bing.com/th/id/OIP.2Go2FQQQiu5xlbpz1pHvpAHaE8"
//   },
//   {
//     name: "HVAC",
//     img: "https://th.bing.com/th/id/OIP.X1BYrb7PTmoHHhrJDtNm_AHaEK"
//   },
//   {
//     name: "Electrician",
//     img: "https://th.bing.com/th/id/OIP.8RNv4Bpl3-Czqtnqzq8FWwHaE8"
//   },
//   {
//     name: "Locksmith",
//     img: "https://th.bing.com/th/id/OIP.VzCe1wLwtG2F6CHjLgS-uQHaE7"
//   },
//   {
//     name: "Cleaning",
//     img: "https://media.istockphoto.com/id/1365606525/photo/shot-of-a-bucket-of-cleaning-supplies.jpg"
//   },
//   {
//     name: "Handyman",
//     img: "https://th.bing.com/th/id/OIP.Y7MggUQCuqmu0R27lITgEAHaKf"
//   }
// ];

// export default function CustomerDashboard() {
//   const navigation = useNavigation();

//   const [user, setUser] = useState(null);
//   const [activeJob, setActiveJob] = useState(null);
//   const [loading, setLoading] = useState(true);

//   /* ---------------- fetch user + active job once ---------------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         const [{ data: me }, { data: job }] = await Promise.all([
//           api.get("/users/me"),
//           api.get("/jobs/homeowner/active")
//         ]);
//         setUser(me);
//         setActiveJob(job);
//       } catch (err) {
//         console.error(err);
//         await AsyncStorage.removeItem("token");   // token probably bad
//         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   /* --------------- one-time info toast ---------------- */
//   useEffect(() => {
//       // only show once, after we have a real user
//       if (user) {
//         Alert.alert(
//           "Tip",
//           "Select the category that best describes your emergency."
//         );
//       }
//      }, [user, loading]);
     

//   const firstName =
//     user && user.name ? user.name.split(" ")[0] : "Customer";

//   if (loading)
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#1976d2" />
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* <LogoutButton /> */}

//       {/* ======== Header / Greeting ======== */}
//       <LinearGradient
//         colors={["#1976d2", "#2f80ed"]}
//         style={styles.hero}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <Text style={styles.heroText}>
//           Hi {firstName},{" "}
//           <Text style={styles.heroSub}>how can we help today?</Text>
//         </Text>

//         <TouchableOpacity
//           style={styles.ctaBtn}
//           onPress={() => navigation.navigate("EmergencyForm")}
//         >
//           <Text style={styles.ctaText}>Request Emergency Service</Text>
//         </TouchableOpacity>
//       </LinearGradient>

//       {/* ======== Service Categories ======== */}
//       <Text style={styles.sectionTitle}>Or choose a category</Text>

//       <View style={styles.cardsWrap}>
//         {categories.map(({ name, img }) => (
//           <TouchableOpacity
//             key={name}
//             style={styles.card}
//             onPress={() =>
//               navigation.navigate("EmergencyForm", { category: name })
//             }
//           >
//             <Image source={{ uri: img }} style={styles.cardImg} />
//             <View style={styles.cardBody}>
//               <Text style={styles.cardLabel}>{name}</Text>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* ======== Active job / reminders ======== */}
//       {activeJob && (
//         <>
//           <Text style={styles.sectionTitle}>Current Job</Text>
//           {/* <HomeownerJobStatusPage job={activeJob} /> */}
//         </>
//       )}

//       {/* <PaymentReminder /> */}

//       {/* bottom margin so last item isn't hidden under iOS home bar */}
//       <View style={{ height: 40 }} />
//     </ScrollView>
//   );
// }

// /* ---------------------- styles ---------------------- */
// const styles = StyleSheet.create({
//   container: { backgroundColor: "#fff", paddingBottom: 24, marginTop: 50 },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     marginTop: 30
//   },

//   /* hero */
//   hero: {
//     padding: 24,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     marginBottom: 16
//   },
//   heroText: {
//     color: "#fff",
//     fontSize: 26,
//     fontWeight: "bold",
//     lineHeight: 32
//   },
//   heroSub: { fontWeight: "400" },
//   ctaBtn: {
//     marginTop: 18,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     alignSelf: "flex-start",
//     paddingVertical: 10,
//     paddingHorizontal: 16
//   },
//   ctaText: {
//     color: "#1976d2",
//     fontWeight: "600",
//     fontSize: 16
//   },

//   /* sections */
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     textAlign: "center",
//     marginVertical: 16
//   },

//   /* cards */
//   cardsWrap: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     paddingHorizontal: 8
//   },
//   card: {
//     width: 160,
//     margin: 8,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 10,
//     overflow: "hidden",
//     elevation: 3
//   },
//   cardImg: { width: "100%", height: 100 },
//   cardBody: { alignItems: "center", paddingVertical: 10 },
//   cardLabel: { fontSize: 16, fontWeight: "600" }
// });

// screens/CustomerDashboard.js
// import React, { useEffect, useState } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../api/client";                       // same Axios instance
// import io from "socket.io-client";
// import Constants from "expo-constants";
// import LogoutButton from "../components/LogoutButton";

// // child components you already have
// // import HomeownerJobStatusPage from "../components/HomeownerJobStatusPage";
// // import PaymentReminder from "../components/PaymentReminder";

// /* ---------- static service categories ---------- */
// const categories = [
//   { name: "Plumbing",   img: "https://th.bing.com/th/id/OIP.OAC7CxrSz9r58CBsJWbJHwHaE8" },
//   { name: "Roofing",    img: "https://th.bing.com/th/id/OIP.2Go2FQQQiu5xlbpz1pHvpAHaE8" },
//   { name: "HVAC",       img: "https://th.bing.com/th/id/OIP.X1BYrb7PTmoHHhrJDtNm_AHaEK" },
//   { name: "Electrician",img: "https://th.bing.com/th/id/OIP.8RNv4Bpl3-Czqtnqzq8FWwHaE8" },
//   { name: "Locksmith",  img: "https://th.bing.com/th/id/OIP.VzCe1wLwtG2F6CHjLgS-uQHaE7" },
//   { name: "Cleaning",   img: "https://media.istockphoto.com/id/1365606525/photo/shot-of-a-bucket-of-cleaning-supplies.jpg" },
//   { name: "Handyman",   img: "https://th.bing.com/th/id/OIP.Y7MggUQCuqmu0R27lITgEAHaKf" },
// ];

// export default function CustomerDashboard() {
//   const navigation = useNavigation();

//   const [user, setUser] = useState(null);
//   const [activeJob, setActiveJob] = useState(null);
//   const [loading, setLoading] = useState(true);

//   /* ---------------- fetch user + active job once ---------------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         const [{ data: me }, { data: job }] = await Promise.all([
//           api.get("/users/me"),
//           api.get("/jobs/homeowner/active"),
//         ]);
//         setUser(me);
//         setActiveJob(job);
//       } catch (err) {
//         console.error(err);
//         await AsyncStorage.removeItem("token");   // token probably bad
//         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   /* --------------- one-time info toast ---------------- */
//   useEffect(() => {
//     if (user) {
//       Alert.alert(
//         "Tip",
//         "Select the category that best describes your emergency."
//       );
//     }
//   }, [user]);

//   /* -- REAL-TIME: join socket room & listen for jobAccepted -- */
//   useEffect(() => {
//     if (!user?.id) return;
//     const socket = io(Constants.expoConfig.extra.socketUrl, {
//       transports: ["websocket"],
//     });
//     // join our per-user room
//     socket.emit("joinUserRoom", { userId: user.id });

//     // when a provider accepts, jump to status
//     socket.on("jobAccepted", ({ jobId }) => {
//       navigation.replace("CustomerJobStatus", { jobId });
//     });

//     return () => {
//       socket.off("jobAccepted");
//       socket.disconnect();
//     };
//   }, [user, navigation]);

//   const firstName =
//     user && user.name ? user.name.split(" ")[0] : "Customer";

//   if (loading)
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#1976d2" />
//       </View>
//     );

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <LogoutButton />

//       {/* ======== Header / Greeting ======== */}
//       <LinearGradient
//         colors={["#1976d2", "#2f80ed"]}
//         style={styles.hero}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <Text style={styles.heroText}>
//           Hi {firstName},{" "}
//           <Text style={styles.heroSub}>how can we help today?</Text>
//         </Text>

//         <TouchableOpacity
//           style={styles.ctaBtn}
//           onPress={() => navigation.navigate("EmergencyForm")}
//         >
//           <Text style={styles.ctaText}>Request Emergency Service</Text>
//         </TouchableOpacity>
//       </LinearGradient>

//       {/* ======== Service Categories ======== */}
//       <Text style={styles.sectionTitle}>Or choose a category</Text>

//       <View style={styles.cardsWrap}>
//         {categories.map(({ name, img }) => (
//           <TouchableOpacity
//             key={name}
//             style={styles.card}
//             onPress={() =>
//               navigation.navigate("EmergencyForm", { category: name })
//             }
//           >
//             <Image source={{ uri: img }} style={styles.cardImg} />
//             <View style={styles.cardBody}>
//               <Text style={styles.cardLabel}>{name}</Text>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* ======== Active job / reminders ======== */}
//       {activeJob && (
//         <>
//           <Text style={styles.sectionTitle}>Current Job</Text>
//           {/* <HomeownerJobStatusPage job={activeJob} /> */}
//         </>
//       )}

//       {/* <PaymentReminder /> */}

//       {/* bottom margin so last item isn't hidden under iOS home bar */}
//       <View style={{ height: 40 }} />
//     </ScrollView>
//   );
// }

// /* ---------------------- styles ---------------------- */
// const styles = StyleSheet.create({
//   container: { backgroundColor: "#fff", paddingBottom: 24, marginTop: 50 },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     marginTop: 30,
//   },
//   /* hero */
//   hero: {
//     padding: 24,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     marginBottom: 16,
//   },
//   heroText: {
//     color: "#fff",
//     fontSize: 26,
//     fontWeight: "bold",
//     lineHeight: 32,
//   },
//   heroSub: { fontWeight: "400" },
//   ctaBtn: {
//     marginTop: 18,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     alignSelf: "flex-start",
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//   },
//   ctaText: {
//     color: "#1976d2",
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   /* sections */
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     textAlign: "center",
//     marginVertical: 16,
//   },
//   /* cards */
//   cardsWrap: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     paddingHorizontal: 8,
//   },
//   card: {
//     width: 160,
//     margin: 8,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 10,
//     overflow: "hidden",
//     elevation: 3,
//   },
//   cardImg: { width: "100%", height: 100 },
//   cardBody: { alignItems: "center", paddingVertical: 10 },
//   cardLabel: { fontSize: 16, fontWeight: "600" },
// });

//working
// screens/CustomerDashboard.js
// import React, { useEffect, useState } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Dimensions,
//   Alert,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../api/client";
// import socket from "../components/socket";
// import LogoutButton from "../components/LogoutButton";



// const categories = [
//   { name: "Plumbing", img: "https://th.bing.com/th/id/OIP.OAC7CxrSz9r58CBsJWbJHwHaE8" },
//   { name: "Roofing", img: "https://th.bing.com/th/id/OIP.2Go2FQQQiu5xlbpz1pHvpAHaE8" },
//   { name: "HVAC", img: "https://th.bing.com/th/id/OIP.X1BYrb7PTmoHHhrJDtNm_AHaEK" },
//   { name: "Electrician", img: "https://th.bing.com/th/id/OIP.8RNv4Bpl3-Czqtnqzq8FWwHaE8" },
//   { name: "Locksmith", img: "https://th.bing.com/th/id/OIP.VzCe1wLwtG2F6CHjLgS-uQHaE7" },
//   { name: "Cleaning", img: "https://media.istockphoto.com/id/1365606525/photo/shot-of-a-bucket-of-cleaning-supplies.jpg" },
//   { name: "Handyman", img: "https://th.bing.com/th/id/OIP.Y7MggUQCuqmu0R27lITgEAHaKf" },
// ];

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.25;

// export default function CustomerDashboard() {
//   const navigation = useNavigation();
//   const [user, setUser] = useState(null);
//   const [activeJob, setActiveJob] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // fetch user + any active job on mount
//   useEffect(() => {
//     (async () => {
//       try {
//         const [{ data: me }, { data: job }] = await Promise.all([
//           api.get("/users/me"),
//           api.get("/jobs/homeowner/active"),
//         ]);
//         setUser(me);
//         setActiveJob(job);
//       } catch (err) {
//         console.error(err);
//         await AsyncStorage.removeItem("token");
//         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   // one-time tip after user loads
//   useEffect(() => {
//     if (user) {
//       Alert.alert("Tip", "Select the category that best describes your emergency.");
//     }
//   }, [user]);

//   // join socket room & listen for jobAccepted
//   useEffect(() => {
//     if (!user?.id) return;
//     socket.emit("joinUserRoom", { userId: user.id });

//     socket.on("jobAccepted", ({ jobId }) => {
//       navigation.replace("CustomerJobStatus", { jobId });
//     });

//     return () => {
//       socket.off("jobAccepted");
//     };
//   }, [user, navigation]);

//   const firstName = user?.name?.split(" ")[0] || "Customer";

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#1976d2" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <LogoutButton />

//       {/* Header */}
//       <LinearGradient
//         colors={["#1976d2", "#2f80ed"]}
//         style={styles.hero}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <Text style={styles.heroText}>
//         <View style={styles.containerLogo}>
//             <Image
//               source={require("../assets/blinqfix_logo-new.jpeg")}
//               style={[
//                 { width: LOGO_SIZE, height: LOGO_SIZE, marginHorizontal: 120},
//               ]}
//               resizeMode="contain"
//             />
//           </View>
//           <Text>{"\n"}</Text>
//           Hi {firstName}, <Text style={styles.heroSub}>how can we help today?</Text>
//         </Text>
//         <TouchableOpacity
//            style={styles.ctaBtn}
//           // onPress={() => navigation.navigate("EmergencyForm")}
//         >
//           <Text style={styles.ctaText}>If this is a life threatining emergency call 911!</Text>
//         </TouchableOpacity>
//       </LinearGradient>

//       {/* Categories */}
//       <Text style={styles.sectionTitle}>Choose a service</Text>
//       <View style={styles.cardsWrap}>
//         {categories.map(({ name, img }) => (
//           <TouchableOpacity
//             key={name}
//             style={styles.card}
//             onPress={() => navigation.navigate("EmergencyForm", { category: name })}
//           >
//             <Image source={{ uri: img }} style={styles.cardImg} />
//             <View style={styles.cardBody}>
//               <Text style={styles.cardLabel}>{name}</Text>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </View>
     

//       {/* Active job */}
//       {activeJob && (
//         <>
//           <Text style={styles.sectionTitle}>Current Job</Text>
//           <TouchableOpacity
//             onPress={() =>
//               navigation.navigate("CustomerJobStatus", { jobId: activeJob._id })
//             }
//           >
//             <Text style={{ color: "#1976d2", textAlign: "center" }}>
//               View Job Status
//             </Text>
//           </TouchableOpacity>
//         </>
//       )}
      

//       {/* bottom spacer */}
//       <View style={{ height: 40 }} />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { backgroundColor: "#fff", paddingBottom: 24, marginTop: 50 },
//   containerLogo: {

//   },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     marginTop: 30,
//   },
//   hero: {
//     padding: 24,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     marginBottom: 16,
//   },
//   heroText: {
//     color: "#fff",
//     fontSize: 26,
//     fontWeight: "bold",
//     lineHeight: 32,
//   },
//   heroSub: { fontWeight: "400" },
//   ctaBtn: {
//     marginTop: 18,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     alignSelf: "flex-start",
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//   },
//   ctaText: {
//     color: "red",
//     fontWeight: "600",
//     fontSize: 16,
//     textAlign: "center",
//     fontStyle: "italic",
//     fontWeight: 500,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     textAlign: "center",
//     marginVertical: 16,
//   },
//   cardsWrap: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     paddingHorizontal: 8,
//   },
//   card: {
//     width: 160,
//     margin: 8,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 10,
//     overflow: "hidden",
//     elevation: 3,
//   },
//   cardImg: { width: "100%", height: 100 },
//   cardBody: { alignItems: "center", paddingVertical: 10 },
//   cardLabel: { fontSize: 16, fontWeight: "600" },
// });

//working
// import React, { useEffect, useState } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Dimensions,
//   Alert,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../api/client";
// import socket from "../components/socket";
// import LogoutButton from "../components/LogoutButton";

// const categories = [
//   { name: "Plumbing", img: "https://th.bing.com/th/id/OIP.OAC7CxrSz9r58CBsJWbJHwHaE8" },
//   { name: "Roofing", img: "https://th.bing.com/th/id/OIP.2Go2FQQQiu5xlbpz1pHvpAHaE8" },
//   { name: "HVAC", img: "https://th.bing.com/th/id/OIP.X1BYrb7PTmoHHhrJDtNm_AHaEK" },
//   { name: "Electrician", img: "https://th.bing.com/th/id/OIP.8RNv4Bpl3-Czqtnqzq8FWwHaE8" },
//   { name: "Locksmith", img: "https://th.bing.com/th/id/OIP.VzCe1wLwtG2F6CHjLgS-uQHaE7" },
//   { name: "Cleaning", img: "https://media.istockphoto.com/id/1365606525/photo/shot-of-a-bucket-of-cleaning-supplies.jpg" },
//   { name: "Handyman", img: "https://th.bing.com/th/id/OIP.Y7MggUQCuqmu0R27lITgEAHaKf" },
// ];

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.25;

// export default function CustomerDashboard() {
//   const navigation = useNavigation();
//   const [user, setUser] = useState(null);
//   const [activeJob, setActiveJob] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const [{ data: me }, { data: job }] = await Promise.all([
//           api.get("/users/me"),
//           api.get("/jobs/homeowner/active"),
//         ]);
//         setUser(me);
//         setActiveJob(job);
//       } catch (err) {
//         console.error(err);
//         await AsyncStorage.removeItem("token");
//         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     if (user) {
//       Alert.alert("Tip", "Select the category that best describes your emergency.");
//     }
//   }, [user]);

//   useEffect(() => {
//     if (!user?.id) return;
//     socket.emit("joinUserRoom", { userId: user.id });

//     socket.on("jobAccepted", ({ jobId }) => {
//       navigation.replace("CustomerJobStatus", { jobId });
//     });

//     return () => {
//       socket.off("jobAccepted");
//     };
//   }, [user, navigation]);

//   const firstName = user?.name?.split(" ")[0] || "Customer";

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#1976d2" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <LogoutButton />

//       <LinearGradient
//         colors={["#1976d2", "#2f80ed"]}
//         style={styles.hero}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <Text style={styles.heroText}>
//           <View style={styles.containerLogo}>
//             <Image
//               source={require("../assets/blinqfix_logo-new.jpeg")}
//               style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginHorizontal: 120 }}
//               resizeMode="contain"
//             />
//           </View>
//           {"\n"}
//           Hi {firstName}, <Text style={styles.heroSub}>how can we help today?</Text>
//         </Text>
//         <TouchableOpacity style={styles.ctaBtn}>
//           <Text style={styles.ctaText}>If this is a life threatining emergency call 911!</Text>
//         </TouchableOpacity>
//       </LinearGradient>

//       <Text style={styles.sectionTitle}>Choose a service</Text>
//       <View style={styles.cardsWrap}>
//         {categories.map(({ name, img }) => (
//           <TouchableOpacity
//             key={name}
//             style={styles.card}
//             onPress={() =>
//               name === "Handyman"
//                 ? navigation.navigate("HandymanCategoryScreen")
//                 : navigation.navigate("EmergencyForm", { category: name })
//             }
//           >
//             <Image source={{ uri: img }} style={styles.cardImg} />
//             <View style={styles.cardBody}>
//               <Text style={styles.cardLabel}>{name}</Text>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {activeJob && (
//         <>
//           <Text style={styles.sectionTitle}>Current Job</Text>
//           <TouchableOpacity
//             onPress={() =>
//               navigation.navigate("CustomerJobStatus", { jobId: activeJob._id })
//             }
//           >
//             <Text style={{ color: "#1976d2", textAlign: "center" }}>
//               View Job Status
//             </Text>
//           </TouchableOpacity>
//         </>
//       )}

//       <View style={{ height: 40 }} />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { backgroundColor: "#fff", paddingBottom: 24, marginTop: 50 },
//   containerLogo: {},
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     marginTop: 30,
//   },
//   hero: {
//     padding: 24,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     marginBottom: 16,
//   },
//   heroText: {
//     color: "#fff",
//     fontSize: 26,
//     fontWeight: "bold",
//     lineHeight: 32,
//   },
//   heroSub: { fontWeight: "400" },
//   ctaBtn: {
//     marginTop: 18,
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     alignSelf: "flex-start",
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//   },
//   ctaText: {
//     color: "red",
//     fontWeight: "600",
//     fontSize: 16,
//     textAlign: "center",
//     fontStyle: "italic",
//     fontWeight: 500,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     textAlign: "center",
//     marginVertical: 16,
//   },
//   cardsWrap: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     paddingHorizontal: 8,
//   },
//   card: {
//     width: 160,
//     margin: 8,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 10,
//     overflow: "hidden",
//     elevation: 3,
//   },
//   cardImg: { width: "100%", height: 100 },
//   cardBody: { alignItems: "center", paddingVertical: 10 },
//   cardLabel: { fontSize: 16, fontWeight: "600" },
// });

import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";
import socket from "../components/socket";
import LogoutButton from "../components/LogoutButton";

const categories = [
  { name: "Plumbing", img: "https://th.bing.com/th/id/OIP.OAC7CxrSz9r58CBsJWbJHwHaE8" },
  { name: "Roofing", img: "https://th.bing.com/th/id/OIP.2Go2FQQQiu5xlbpz1pHvpAHaE8" },
  { name: "HVAC", img: "https://th.bing.com/th/id/OIP.X1BYrb7PTmoHHhrJDtNm_AHaEK" },
  { name: "Electrician", img: "https://th.bing.com/th/id/OIP.8RNv4Bpl3-Czqtnqzq8FWwHaE8" },
  { name: "Locksmith", img: "https://th.bing.com/th/id/OIP.VzCe1wLwtG2F6CHjLgS-uQHaE7" },
  { name: "Cleaning", img: "https://media.istockphoto.com/id/1365606525/photo/shot-of-a-bucket-of-cleaning-supplies.jpg" },
  { name: "Handyman", img: "https://th.bing.com/th/id/OIP.Y7MggUQCuqmu0R27lITgEAHaKf" },
];

const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.25;

export default function CustomerDashboard() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: me }, { data: job }] = await Promise.all([
          api.get("/users/me"),
          api.get("/jobs/homeowner/active"),
        ]);
        setUser(me);
        setActiveJob(job);
      } catch (err) {
        console.error(err);
        await AsyncStorage.removeItem("token");
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (user) {
      Alert.alert("Tip", "Select the category that best describes your emergency.");
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    socket.emit("joinUserRoom", { userId: user.id });

    socket.on("jobAccepted", ({ jobId }) => {
      navigation.replace("CustomerJobStatus", { jobId });
    });

    return () => {
      socket.off("jobAccepted");
    };
  }, [user, navigation]);

  const firstName = user?.name?.split(" ")[0] || "Customer";

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LogoutButton />

      <LinearGradient
        colors={["#1976d2", "#2f80ed"]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.heroText}>
          <View style={styles.containerLogo}>
            <Image
              source={require("../assets/blinqfix_logo-new.jpeg")}
              style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginHorizontal: 120 }}
              resizeMode="contain"
            />
          </View>
          {"\n"}
          Hi {firstName}, <Text style={styles.heroSub}>how can we help today?</Text>
        </Text>
        <TouchableOpacity style={styles.ctaBtn}>
          <Text style={styles.ctaText}>If this is a life-threatening emergency, call 911!</Text>
        </TouchableOpacity>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Choose a service</Text>
      <View style={styles.cardsWrap}>
        {categories.map(({ name, img }) => (
          <TouchableOpacity
            key={name}
            style={styles.card}
            onPress={() =>
              name === "Handyman"
                ? navigation.navigate("HandymanCategoryScreen")
                : navigation.navigate("EmergencyForm", { category: name })
            }
          >
            <Image source={{ uri: img }} style={styles.cardImg} />
            <View style={styles.cardBody}>
              <Text style={styles.cardLabel}>{name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>


      {/* {activeJob && (
        <>
          <Text style={styles.sectionTitle}>Current Job</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CustomerJobStatus", { jobId: activeJob._id })
            }
          >
            <Text style={{ color: "#1976d2", textAlign: "center" }}>
              View Job Status
            </Text>
          </TouchableOpacity>
        </>
      )} */}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", paddingBottom: 24, marginTop: 50 },
  containerLogo: {},
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 30,
  },
  hero: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  heroText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    lineHeight: 32,
  },
  heroSub: { fontWeight: "400" },
  ctaBtn: {
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  ctaText: {
    color: "red",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 16,
  },
  cardsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  card: {
    width: 160,
    margin: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
  },
  cardImg: { width: "100%", height: 100 },
  cardBody: { alignItems: "center", paddingVertical: 10 },
  cardLabel: { fontSize: 16, fontWeight: "600" },
});
