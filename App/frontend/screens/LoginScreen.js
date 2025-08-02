// import React, { useState } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   useWindowDimensions,
//   Dimensions,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { LinearGradient } from "expo-linear-gradient";
// import { Buffer } from "buffer"; // ← react-native buffer polyfill
// import { useNavigation } from "@react-navigation/native";

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";
// import Footer from "../components/Footer";

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// /** tiny inline JWT parser—no external lib needed */
// /**
//  * Decode a JWT and return its payload as an object.
//  *
//  * @param {string} token  The JWT string
//  * @returns {Object}      The decoded payload
//  */
// function parseJwt(token) {
//   if (!token) return null;

//   // Split out the payload
//   const base64Url = token.split(".")[1];
//   if (!base64Url) return null;

//   // Convert from “URL-safe” base64 to standard base64
//   const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

//   // atob() decodes a base64-encoded string into a binary string
//   const binary =
//     typeof atob === "function"
//       ? atob(base64)
//       : Buffer.from(base64, "base64").toString("binary");

//   // Percent-encode each character, then decode the percent-encoded string
//   const jsonPayload = decodeURIComponent(
//     binary
//       .split("")
//       .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//       .join("")
//   );

//   return JSON.parse(jsonPayload);
// }

// // Example usage:
// // const payload = parseJwt(myJwtToken);
// // console.log(payload);

// /** Map your backend roles exactly to screen names */
// function roleToScreen(role) {
//   const r = role?.toLowerCase();
//   if (r === "serviceprovider" || r === "provider")
//     return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// export default function LoginScreen() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const { setRole } = useAuth();
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions();

//   const onChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

//   const onSubmit = async () => {
//     try {
//       const { data } = await api.post("/auth/login", form);
//       if (!data?.token) throw new Error("Token missing");

//       // 1) cache JWT
//       // await AsyncStorage.setItem("token", data.token);
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }

//       // 2) parse it ourselves
//       const payload = parseJwt(data.token);
//       const role = payload.role || "customer";

//       // console.log("[Login] parsed JWT payload:", payload);

//       // 3) update context
//       setRole(role);

//       // 4) reset into correct dashboard
//       const target = roleToScreen(role);
//       // console.log(`[Login] routing role="${role}" → "${target}"`);
//       const action = { index: 0, routes: [{ name: target }] };

//       if (navigationRef.isReady()) {
//         navigationRef.reset(action);
//       } else {
//         navigation.reset(action);
//       }
//     } catch (err) {
//       const msg =
//         err.response?.data?.msg ||
//         err.message ||
//         "Login failed – check credentials.";
//       Alert.alert("Error", msg);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Hero */}

//       <LinearGradient
//         colors={["#1976d2", "#2f80ed"]}
//         style={styles.heroWrapper}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <View style={styles.containerLogo}>
//           <Image
//             source={require("../assets/blinqfix_logo-new.jpeg")}
//             style={[
//               { width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" },
//             ]}
//             resizeMode="contain"
//           />
//         </View>

//         <Text>{"\n"}</Text>
//         <Text style={styles.heroText}>
//           BlinqFix{"\n"}
//           <Text style={styles.heroSub}>
//             Emergency repairs in the blink of an eye!
//           </Text>
//           {"\n"}
//           <Text style={styles.heroSub2}>Residential - Commercial</Text>
//         </Text>
//       </LinearGradient>

//       {/* <ProviderMap customerCoords={{ latitude: 25.7617, longitude: -80.1918 }} />
//       <ProviderMap /> */}
//       {/* <ProviderMapDashboard /> */}

//       {/* Login Form */}
//       <View style={styles.formSection}>
//         <View style={styles.formBox}>
//           <Text style={styles.formTitle}>Login</Text>

//           <TextInput
//             style={styles.input}
//             placeholder="Email"
//             keyboardType="email-address"
//             autoCapitalize="none"
//             onChangeText={(v) => onChange("email", v)}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Password"
//             secureTextEntry
//             onChangeText={(v) => onChange("password", v)}
//           />

//           <TouchableOpacity style={styles.button} onPress={onSubmit}>
//             <Text style={styles.buttonText}>Login</Text>
//           </TouchableOpacity>

//           <View style={{ marginTop: 12 }}>
//             <Text style={styles.linkRow}>
//               <Text style={styles.linkLabel}>Forgot Password? </Text>
//               <Text
//                 style={styles.linkText}
//                 onPress={() => navigation.navigate("ResetPasswordScreen")}
//               >
//                 Reset
//               </Text>
//             </Text>

//             <Text style={[styles.linkRow, { marginTop: 8 }]}>
//               <Text style={styles.linkLabel}>Don’t have an account? </Text>
//               <Text
//                 style={styles.linkText}
//                 onPress={() => navigation.navigate("Registration")}
//               >
//                 Sign Up
//               </Text>
//             </Text>
//           </View>
//         </View>
//       </View>

//       {/* Optional static service cards */}
//       <View style={styles.cards}>
//         {[
//           {
//             label: "PLUMBERS",
//             img: "https://th.bing.com/th/id/OIP.OAC7CxrSz9r58CBsJWbJHwHaE8",
//           },
//           {
//             label: "ROOFERS",
//             img: "https://th.bing.com/th/id/OIP.2Go2FQQQiu5xlbpz1pHvpAHaE8",
//           },
//           {
//             label: "HVAC",
//             img: "https://th.bing.com/th/id/OIP.X1BYrb7PTmoHHhrJDtNm_AHaEK",
//           },
//           {
//             label: "ELECTRIC",
//             img: "https://th.bing.com/th/id/OIP.8RNv4Bpl3-Czqtnqzq8FWwHaE8",
//           },
//           // {
//           //   label: "LOCKSMITH",
//           //   img: "https://th.bing.com/th/id/OIP.VzCe1wLwtG2F6CHjLgS-uQHaE7",
//           // },
//           // {
//           //   label: "CLEANING",
//           //   img: "https://media.istockphoto.com/id/1365606525/photo/shot-of-a-bucket-of-cleaning-supplies.jpg",
//           // },
//           {
//             label: "HANDYMAN",
//             img: "https://imgs.search.brave.com/Eu2EwhIULj4LyBzlme4IwxTKn3xSibta_OUu-2oN5Vo/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9idWls/ZGVyLWhhbmR5bWFu/LWNvbnN0cnVjdGlv/bi10b29scy1ob3Vz/ZS1yZW5vdmF0aW9u/LWJhY2tncm91bmQt/ODk4NTUyMDQuanBn",
//           },
//         ].map(({ label, img }) => (
//           <View
//             key={label}
//             style={[
//               styles.card,
//               { width: width > 700 ? width / 3 - 24 : width / 2 - 24 },
//             ]}
//           >
//             <Image source={{ uri: img }} style={styles.cardImage} />
//             <View style={styles.cardBody}>
//               <Text style={styles.cardLabel}>{label}</Text>
//             </View>
//           </View>
//         ))}
//       </View>

//       <Footer />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     paddingBottom: 32,
//     backgroundColor: "#fff",
//     marginTop: 40,
//   },
//   containerLogo: {
//     // flex: 1,
//     // marginHorizontal: 150,
//     // justifyContent: 'center',
//     // alignItems: 'center',
//   },
//   heroWrapper: {
//     borderRadius: 12,
//     paddingVertical: 40,
//     paddingHorizontal: 24,
//     marginBottom: 24,
//   },
//   heroText: {
//     color: "#fff",
//     fontSize: 32,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   heroSub: { fontSize: 16, fontWeight: "600" },
//   heroSub2: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "red",
//     marginTop: 4,
//     fontWeight: 800,
//   },
//   formSection: { alignItems: "center", marginBottom: 24 },
//   formBox: {
//     width: "100%",
//     maxWidth: 360,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 24,
//     elevation: 3,
//   },
//   formTitle: {
//     fontSize: 26,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 14,
//     marginBottom: 16,
//   },
//   button: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 14,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
//   linkRow: { flexDirection: "row", justifyContent: "center", marginBottom: 2 },
//   linkLabel: { fontSize: 14 },
//   linkText: {
//     fontSize: 14,
//     color: "#1976d2",
//     textDecorationLine: "none",
//     fontWeight: "600",
//   },
//   cards: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     gap: 8,
//   },
//   card: {
//     backgroundColor: "#f9f9f9",
//     borderRadius: 8,
//     overflow: "hidden",
//     elevation: 2,
//   },
//   cardImage: { width: "100%", height: 120 },
//   cardBody: { alignItems: "center", paddingVertical: 12 },
//   cardLabel: { fontSize: 18, fontWeight: "600" },
// });

// LoginScreen.js
//working
// import React, { useState } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   useWindowDimensions,
//   Dimensions,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { LinearGradient } from "expo-linear-gradient";
// import { Buffer } from "buffer";
// import { useNavigation } from "@react-navigation/native";

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";
// import Footer from "../components/Footer";

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// function parseJwt(token) {
//   if (!token) return null;
//   const base64Url = token.split(".")[1];
//   if (!base64Url) return null;
//   const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//   const binary =
//     typeof atob === "function"
//       ? atob(base64)
//       : Buffer.from(base64, "base64").toString("binary");
//   const jsonPayload = decodeURIComponent(
//     binary
//       .split("")
//       .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//       .join("")
//   );
//   return JSON.parse(jsonPayload);
// }

// function roleToScreen(role) {
//   const r = role?.toLowerCase();
//   if (r === "serviceprovider" || r === "provider")
//     return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// export default function LoginScreen() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const { setRole } = useAuth();
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions();

//   const onChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

//   console.log("🌐 Current API:", api.defaults.baseURL);

//   const onSubmit = async () => {
//     try {
//       const { data } = await api.post("/auth/login", form);
//       console.log("✅ Login response:", data);
//       if (!data?.token) throw new Error("Token missing");

//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }

//       const payload = parseJwt(data.token);
//       const role = payload.role || "customer";
//       setRole(role);
//       const target = roleToScreen(role);
//       const action = { index: 0, routes: [{ name: target }] };

//       if (navigationRef.isReady()) {
//         navigationRef.reset(action);
//       } else {
//         navigation.reset(action);
//       }
//     } catch (err) {
//       console.error("❌ Network error", err.message);
//       console.error("➡️ Full error", err?.response?.data || err);
//       const msg =
//         err.response?.data?.msg ||
//         err.message ||
//         "Login failed – check credentials.";
//       Alert.alert("Error", msg);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <LinearGradient
//         colors={["#1976d2", "#2f80ed"]}
//         style={styles.heroWrapper}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <View style={styles.containerLogo}>
//           <Image
//             source={require("../assets/blinqfix_logo-new.jpeg")}
//             style={[
//               { width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" },
//             ]}
//             resizeMode="contain"
//           />
//         </View>

//         <Text>{"\n"}</Text>
//         <Text style={styles.heroText}>
//           BlinqFix{"\n"}
//           <Text style={styles.heroSub}>
//             Emergency repairs in the blink of an eye!
//           </Text>
//           {"\n"}
//           <Text style={styles.heroSub2}>Residential - Commercial</Text>
//         </Text>
//       </LinearGradient>

//       <View style={styles.formSection}>
//         <View style={styles.formBox}>
//           <Text style={styles.formTitle}>Login</Text>

//           <TextInput
//             style={styles.input}
//             placeholder="Email"
//             keyboardType="email-address"
//             autoCapitalize="none"
//             onChangeText={(v) => onChange("email", v)}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Password"
//             secureTextEntry
//             onChangeText={(v) => onChange("password", v)}
//           />

//           <TouchableOpacity style={styles.button} onPress={onSubmit}>
//             <Text style={styles.buttonText}>Login</Text>
//           </TouchableOpacity>

//           <View style={{ marginTop: 12 }}>
//             <Text style={styles.linkRow}>
//               <Text style={{}}>Forgot Password? </Text>
//               <Text
//                 style={styles.linkText}
//                 onPress={() => navigation.navigate("ResetPasswordScreen")}
//               >
//                 Reset
//               </Text>
//             </Text>

//             <Text style={[styles.linkRow, { marginTop: 8 }]}>
//               {" "}
//               <Text style={styles.linkLabel}>Don’t have an account? </Text>
//               <Text
//                 style={styles.linkText}
//                 onPress={() => navigation.navigate("Registration")}
//               >
//                 Sign Up
//               </Text>
//             </Text>
//           </View>
//         </View>
//       </View>

//       <View style={styles.cards}>
//         {[
//           {
//             label: "PLUMBERS",
//             img: "https://th.bing.com/th/id/OIP.OAC7CxrSz9r58CBsJWbJHwHaE8",
//           },
//           {
//             label: "ROOFERS",
//             img: "https://th.bing.com/th/id/OIP.2Go2FQQQiu5xlbpz1pHvpAHaE8",
//           },
//           {
//             label: "HVAC",
//             img: "https://th.bing.com/th/id/OIP.X1BYrb7PTmoHHhrJDtNm_AHaEK",
//           },
//           {
//             label: "ELECTRIC",
//             img: "https://th.bing.com/th/id/OIP.8RNv4Bpl3-Czqtnqzq8FWwHaE8",
//           },
//           {
//             label: "HANDYMAN",
//             img: "https://imgs.search.brave.com/Eu2EwhIULj4LyBzlme4IwxTKn3xSibta_OUu-2oN5Vo/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9idWls/ZGVyLWhhbmR5bWFu/LWNvbnN0cnVjdGlv/bi10b29scy1ob3Vz/ZS1yZW5vdmF0aW9u/LWJhY2tncm91bmQt/ODk4NTUyMDQuanBn",
//           },
//         ].map(({ label, img }) => (
//           <View
//             key={label}
//             style={[
//               styles.card,
//               { width: width > 700 ? width / 3 - 24 : width / 2 - 24 },
//             ]}
//           >
//             <Image source={{ uri: img }} style={styles.cardImage} />
//             <View style={styles.cardBody}>
//               <Text style={styles.cardLabel}>{label}</Text>
//             </View>
//           </View>
//         ))}
//       </View>

//       <Footer />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     paddingBottom: 32,
//     backgroundColor: "#fff",
//     marginTop: 40,
//   },
//   containerLogo: {},
//   heroWrapper: {
//     borderRadius: 12,
//     paddingVertical: 40,
//     paddingHorizontal: 24,
//     marginBottom: 24,
//   },
//   heroText: {
//     color: "#fff",
//     fontSize: 32,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   heroSub: { fontSize: 16, fontWeight: "600" },
//   heroSub2: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "red",
//     marginTop: 4,
//     fontWeight: 800,
//   },
//   formSection: { alignItems: "center", marginBottom: 24 },
//   formBox: {
//     width: "100%",
//     maxWidth: 360,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 24,
//     elevation: 3,
//   },
//   formTitle: {
//     fontSize: 26,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 14,
//     marginBottom: 16,
//   },
//   button: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 14,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
//   linkRow: { flexDirection: "row", justifyContent: "center", marginBottom: 2 },
//   linkLabel: { fontSize: 14 },
//   linkText: {
//     fontSize: 14,
//     color: "#1976d2",
//     textDecorationLine: "none",
//     fontWeight: "600",
//   },
//   cards: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     gap: 8,
//   },
//   card: {
//     backgroundColor: "#f9f9f9",
//     borderRadius: 8,
//     overflow: "hidden",
//     elevation: 2,
//   },
//   cardImage: { width: "100%", height: 120 },
//   cardBody: { alignItems: "center", paddingVertical: 12 },
//   cardLabel: { fontSize: 18, fontWeight: "600" },
// });

// screens/LoginScreen.js
// import React, { useState, useEffect } from "react";
// import {
//   ScrollView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   useWindowDimensions,
//   Dimensions,
//   Alert,
//   Platform,
//   Linking,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import { LinearGradient } from "expo-linear-gradient";
// import { Buffer } from "buffer";
// import { useNavigation } from "@react-navigation/native";
// import { Ionicons } from "@expo/vector-icons";

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";
// import Footer from "../components/Footer";

// const { width } = Dimensions.get("window");
// const LOGO_SIZE = width * 0.55;

// function parseJwt(token) {
//   if (!token) return null;
//   const base64Url = token.split(".")[1];
//   if (!base64Url) return null;
//   const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//   const binary =
//     typeof atob === "function"
//       ? atob(base64)
//       : Buffer.from(base64, "base64").toString("binary");
//   const jsonPayload = decodeURIComponent(
//     binary
//       .split("")
//       .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//       .join("")
//   );
//   return JSON.parse(jsonPayload);
// }

// function roleToScreen(role) {
//   const r = role?.toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// export default function LoginScreen() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [showPassword, setShowPassword] = useState(false);
//   const { setRole } = useAuth();
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions();

//   useEffect(() => {
//     (async () => {
//       try {
//         const { status: locStatus } = await Location.getForegroundPermissionsAsync();
//         if (locStatus !== "granted") {
//           const { status } = await Location.requestForegroundPermissionsAsync();
//           if (status !== "granted") {
//             Alert.alert("Location Required", "Enable location in settings.", [
//               {
//                 text: "Open Settings",
//                 onPress: () => {
//                   if (Platform.OS === "ios") {
//                     Linking.openURL("app-settings:");
//                   } else {
//                     IntentLauncher.startActivityAsync(IntentLauncher.ACTION_LOCATION_SOURCE_SETTINGS);
//                   }
//                 },
//               },
//             ]);
//           }
//         }

//         const notifPerm = await Notifications.getPermissionsAsync();
//         if (notifPerm.status !== "granted") {
//           const request = await Notifications.requestPermissionsAsync();
//           if (request.status !== "granted") {
//             Alert.alert("Notifications", "Enable notifications for updates.", [
//               {
//                 text: "Open Settings",
//                 onPress: () => Linking.openSettings(),
//               },
//               { text: "Cancel", style: "cancel" },
//             ]);
//           }
//         }
//       } catch (e) {
//         console.warn("Permission check failed", e);
//       }
//     })();
//   }, []);

//   const onChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

//   const onSubmit = async () => {
//     try {
//       const { data } = await api.post("/auth/login", form);
//       if (!data?.token) throw new Error("Token missing");
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }
//       const payload = parseJwt(data.token);
//       const role = payload.role || "customer";
//       setRole(role);
//       const target = roleToScreen(role);
//       const action = { index: 0, routes: [{ name: target }] };
//       if (navigationRef.isReady()) {
//         navigationRef.reset(action);
//       } else {
//         navigation.reset(action);
//       }
//     } catch (err) {
//       const msg =
//         err.response?.data?.msg || err.message || "Login failed – check credentials.";
//       Alert.alert("Error", msg);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <LinearGradient
//         colors={["#1976d2", "#2f80ed"]}
//         style={styles.heroWrapper}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//       >
//         <View style={styles.containerLogo}>
//           <Image
//             source={require("../assets/blinqfix_logo-new.jpeg")}
//             style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
//             resizeMode="contain"
//           />
//         </View>

//         <Text>{"\n"}</Text>
//         <Text style={styles.heroText}>
//           BlinqFix{"\n"}
//           <Text style={styles.heroSub}>Emergency repairs in the blink of an eye!</Text>{"\n"}
//           <Text style={styles.heroSub2}>Residential - Commercial</Text>
//         </Text>
//       </LinearGradient>

//       <View style={styles.formSection}>
//         <View style={styles.formBox}>
//           <Text style={styles.formTitle}>Login</Text>

//           <TextInput
//             style={styles.input}
//             placeholder="Email"
//             keyboardType="email-address"
//             autoCapitalize="none"
//             onChangeText={(v) => onChange("email", v)}
//           />

//           <View style={{ position: "relative" }}>
//             <TextInput
//               style={styles.input}
//               placeholder="Password"
//               secureTextEntry={!showPassword}
//               onChangeText={(v) => onChange("password", v)}
//             />
//             <TouchableOpacity
//               style={{ position: "absolute", right: 16, top: 14 }}
//               onPress={() => setShowPassword((s) => !s)}
//             >
//               <Ionicons
//                 name={showPassword ? "eye-off-outline" : "eye-outline"}
//                 size={22}
//                 color="#1976d2"
//               />
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity style={styles.button} onPress={onSubmit}>
//             <Text style={styles.buttonText}>Login</Text>
//           </TouchableOpacity>

//           <View style={{ marginTop: 12 }}>
//             <Text style={styles.linkRow}>
//               <Text>Forgot Password? </Text>
//               <Text
//                 style={styles.linkText}
//                 onPress={() => navigation.navigate("ResetPasswordScreen")}
//               >
//                 Reset
//               </Text>
//             </Text>

//             <Text style={[styles.linkRow, { marginTop: 8 }]}> 
//               <Text style={styles.linkLabel}>Don’t have an account? </Text>
//               <Text
//                 style={styles.linkText}
//                 onPress={() => navigation.navigate("Registration")}
//               >
//                 Sign Up
//               </Text>
//             </Text>
//           </View>
//         </View>
//       </View>

//       <Footer />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     paddingBottom: 32,
//     backgroundColor: "#fff",
//   },
//   containerLogo: {},
//   heroWrapper: {
//     borderRadius: 12,
//     paddingVertical: 40,
//     paddingHorizontal: 24,
//     marginBottom: 24,
//   },
//   heroText: {
//     color: "#fff",
//     fontSize: 32,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   heroSub: { fontSize: 16, fontWeight: "600" },
//   heroSub2: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "red",
//     marginTop: 4,
//   },
//   formSection: { alignItems: "center", marginBottom: 24 },
//   formBox: {
//     width: "100%",
//     maxWidth: 360,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 24,
//     elevation: 3,
//   },
//   formTitle: {
//     fontSize: 26,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 14,
//     marginBottom: 16,
//   },
//   button: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 14,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
//   linkRow: { flexDirection: "row", justifyContent: "center", marginBottom: 2 },
//   linkLabel: { fontSize: 14 },
//   linkText: {
//     fontSize: 14,
//     color: "#1976d2",
//     textDecorationLine: "none",
//     fontWeight: "600",
//   },
// });

// LoginScreen.js – Updated with network error logging, baseURL expectation, and token guard
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  useWindowDimensions,
  Dimensions,
  Alert,
  Platform,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as IntentLauncher from "expo-intent-launcher";
import { LinearGradient } from "expo-linear-gradient";
import { Buffer } from "buffer";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import api from "../api/client";
import { useAuth, navigationRef } from "../context/AuthProvider";
import Footer from "../components/Footer";

const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.55;

function parseJwt(token) {
  if (!token) return null;
  const base64Url = token.split(".")[1];
  if (!base64Url) return null;
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const binary =
    typeof atob === "function"
      ? atob(base64)
      : Buffer.from(base64, "base64").toString("binary");
  const jsonPayload = decodeURIComponent(
    binary
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

function roleToScreen(role) {
  const r = role?.toLowerCase();
  if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
  if (r === "admin") return "AdminDashboard";
  return "CustomerDashboard";
}

export default function LoginScreen() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { setRole } = useAuth();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  useEffect(() => {
    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await api.post("/users/push-token", { token });
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      console.log("📡 Full Login URL:", api.defaults.baseURL + "/auth/login");

      try {
        const { status: locStatus } = await Location.getForegroundPermissionsAsync();
        if (locStatus !== "granted") {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Location Required", "Enable location in settings.", [
              {
                text: "Open Settings",
                onPress: () => {
                  if (Platform.OS === "ios") {
                    Linking.openURL("app-settings:");
                  } else {
                    IntentLauncher.startActivityAsync(IntentLauncher.ACTION_LOCATION_SOURCE_SETTINGS);
                  }
                },
              },
            ]);
          }
        }

        const notifPerm = await Notifications.getPermissionsAsync();
        if (notifPerm.status !== "granted") {
          const request = await Notifications.requestPermissionsAsync();
          if (request.status !== "granted") {
            Alert.alert("Notifications", "Enable notifications for updates.", [
              {
                text: "Open Settings",
                onPress: () => Linking.openSettings(),
              },
              { text: "Cancel", style: "cancel" },
            ]);
          }
        }
      } catch (e) {
        console.warn("Permission check failed", e);
      }
    })();
  }, []);

  const onChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));
//latest
  // const onSubmit = async () => {
  //   try {
  //     console.log("➡️ Attempting login for:", form.email);
  //     console.log("📡 Full Login URL:", api.defaults.baseURL + "/auth/login");
  
  //     const { data } = await api.post("/auth/login", form, {
  //       headers: { "Content-Type": "application/json" },
  //     });
  
  //     console.log("✅ Login response:", data);

  //     if (!data?.token) throw new Error("Token missing from response");
  //     await AsyncStorage.setItem("token", data.token);
  //     if (data.refreshToken) {
  //       await AsyncStorage.setItem("refreshToken", data.refreshToken);
  //     }
  //     const payload = parseJwt(data.token);
  //     const role = payload.role || "customer";
  //     setRole(role);
  //     const target = roleToScreen(role);
  //     const action = { index: 0, routes: [{ name: target }] };
  //     if (navigationRef.isReady()) {
  //       navigationRef.reset(action);
  //     } else {
  //       navigation.reset(action);
  //     }
  //   } catch (err) {
  //     console.error("❌ Login error:", err.message);
  //     console.log("❌ Full error:", err.response?.data || err);
  //     const msg = err.response?.data?.msg || err.message || "Login failed – check credentials.";
  //     Alert.alert("Error", msg);
  //   }
  // };

//   const onSubmit = async () => {
//   try {
//     console.log("➡️ Attempting login for:", form.email);

//     const { data } = await api.post("/auth/login", form, {
//       headers: { "Content-Type": "application/json" },
//     });

//     if (!data?.token) throw new Error("Token missing from response");

//     await AsyncStorage.setItem("token", data.token);
//     if (data.refreshToken) {
//       await AsyncStorage.setItem("refreshToken", data.refreshToken);
//     }

//     const payload = parseJwt(data.token);
//     const role = payload?.role || "customer";
//     setRole(role);

//     if (role === "serviceProvider") {
//       const stripeAccountId = payload?.stripeAccountId;
//       if (stripeAccountId) {
//         try {
//           console.log("🔍 Checking onboarding for account:", stripeAccountId);

//           const checkRes = await api.post("/check-onboarding", {
//             stripeAccountId,
//           });

//           console.log("📬 Onboarding check response:", checkRes.data);

//           if (checkRes.data?.needsOnboarding && checkRes.data?.stripeOnboardingUrl) {
//             console.log("🔗 Redirecting to Stripe onboarding...");

//             const url = checkRes.data.stripeOnboardingUrl;
//             if (url && typeof url === "string") {
//               await Linking.openURL(url);
//               return;
//             } else {
//               Alert.alert("Missing URL", "Stripe onboarding link is invalid.");
//             }
//           }
//         } catch (stripeCheckErr) {
//           console.error("❌ Failed onboarding check:", stripeCheckErr);
//           Alert.alert("Error", "Unable to check onboarding. Please try again later.");
//           return;
//         }
//       }
//     }

//     const target = roleToScreen(role);
//     const action = { index: 0, routes: [{ name: target }] };
//     if (navigationRef.isReady()) {
//       navigationRef.reset(action);
//     } else {
//       navigation.reset(action);
//     }
//   } catch (err) {
//     console.error("❌ Login error:", err.message);
//     console.log("❌ Full error:", err.response?.data || err);
//     const msg = err.response?.data?.msg || err.message || "Login failed – check credentials.";
//     Alert.alert("Error", msg);
//   }
// };

// const onSubmit = async () => {
//   try {
//     console.log("➡️ Attempting login for:", form.email);

//     const { data } = await api.post("/auth/login", form, {
//       headers: { "Content-Type": "application/json" },
//     });

//     if (!data?.token) throw new Error("Token missing from response");

//     await AsyncStorage.setItem("token", data.token);
//     if (data.refreshToken) {
//       await AsyncStorage.setItem("refreshToken", data.refreshToken);
//     }

//     const payload = parseJwt(data.token);
//     const role = payload?.role || "customer";
//     setRole(role);

//     if (role === "serviceProvider") {
//       const stripeAccountId = payload?.stripeAccountId;
//       if (stripeAccountId) {
//         try {
//           console.log("🔍 Checking onboarding for account:", stripeAccountId);

//           const checkRes = await api.post("/check-onboarding", {
//             stripeAccountId,
//           });

//           console.log("📬 Onboarding check response:", checkRes.data);

//           const { stripeOnboardingUrl, stripeDashboardUrl } = checkRes.data;

//           if (checkRes.data?.needsOnboarding && (stripeOnboardingUrl || stripeDashboardUrl)) {
//             Alert.alert("Redirecting", "Complete onboarding with Stripe.");
//             console.log("Needs to compete onboarding")
//             const redirectUrl = stripeOnboardingUrl || stripeDashboardUrl;
//             await Linking.openURL(redirectUrl);
//             return; // ⛔ prevent nav until complete
//           }
//         } catch (stripeCheckErr) {
//           console.error("❌ Failed onboarding check:", stripeCheckErr);
//           Alert.alert("Error", "Unable to check onboarding. Please try again later.");
//           return;
//         }
//       }
//     }

//     const target = roleToScreen(role);
//     const action = { index: 0, routes: [{ name: target }] };
//     if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     } else {
//       navigation.reset(action);
//     }
//   } catch (err) {
//     console.error("❌ Login error:", err.message);
//     console.log("❌ Full error:", err.response?.data || err);
//     const msg = err.response?.data?.msg || err.message || "Login failed – check credentials.";
//     Alert.alert("Error", msg);
//   }
// };

// const onSubmit = async () => {
//   try {
//     console.log("➡️ Attempting login for:", form.email);

//     const { data } = await api.post("/auth/login", form, {
//       headers: { "Content-Type": "application/json" },
//     });

//     if (!data?.token) throw new Error("Token missing from response");

//     await AsyncStorage.setItem("token", data.token);
//     if (data.refreshToken) {
//       await AsyncStorage.setItem("refreshToken", data.refreshToken);
//     }

//     const payload = parseJwt(data.token);
//     const role = payload?.role || "customer";
//     const stripeAccountId = payload?.stripeAccountId;
//     console.log("🎯 Role:", role);
//     console.log("🏦 Stripe Account ID from token:", stripeAccountId);
//     setRole(role);

//     if (role === "serviceProvider" && stripeAccountId) {
//       try {
//         console.log("🔍 Calling /check-onboarding with:", stripeAccountId);

//         const checkRes = await api.post("/stripe/check-onboarding", {
//           stripeAccountId,
//         });

//         console.log("📬 Onboarding check response:", checkRes.data);

//         const { stripeOnboardingUrl, stripeDashboardUrl } = checkRes.data;

//         if (checkRes.data?.needsOnboarding) {
//           const redirectUrl = stripeOnboardingUrl || stripeDashboardUrl;

//           if (!redirectUrl || typeof redirectUrl !== "string") {
//             console.warn("⚠️ Invalid redirect URL:", redirectUrl);
//             Alert.alert("Error", "Onboarding link is invalid or missing.");
//             return;
//           }

//           console.log("🔗 Redirecting to:", redirectUrl);
//           Alert.alert("Redirecting", "Complete onboarding with Stripe.");

//           try {
//             await Linking.openURL(redirectUrl);
//           } catch (linkErr) {
//             console.error("❌ Failed to open link:", linkErr);
//             Alert.alert("Error", "Could not open onboarding link.");
//           }
//           return;
//         }
//       } catch (stripeCheckErr) {
//         console.error("❌ Failed onboarding check:", stripeCheckErr);
//         Alert.alert("Error", "Unable to check onboarding. Please try again later.");
//         return;
//       }
//     }

//     const target = roleToScreen(role);
//     const action = { index: 0, routes: [{ name: target }] };
//     if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     }
//   } catch (err) {
//     console.error("❌ Login error:", err.message);
//     console.log("❌ Full error:", err.response?.data || err);
//     const msg = err.response?.data?.msg || err.message || "Login failed – check credentials.";
//     Alert.alert("Error", msg);
//   }
// };

// const onSubmit = async () => {
//   try {
//     console.log("➡️ Attempting login for:", form.email);

//     const { data } = await api.post("/auth/login", form, {
//       headers: { "Content-Type": "application/json" },
//     });

//     if (!data?.token) throw new Error("Token missing from response");

//     await AsyncStorage.setItem("token", data.token);
//     if (data.refreshToken) {
//       await AsyncStorage.setItem("refreshToken", data.refreshToken);
//     }

//     const payload = parseJwt(data.token);
//     const role = payload?.role || "customer";
//     const stripeAccountId = payload?.stripeAccountId;
//     console.log("🎯 Role:", role);
//     console.log("🏦 Stripe Account ID from token:", stripeAccountId);
//     setRole(role);

//     if (role === "serviceProvider" && stripeAccountId) {
//       try {
//         console.log("🔍 Calling /stripe/check-onboarding with:", stripeAccountId);

//         const checkRes = await api.post("/stripe/check-onboarding", {
//           stripeAccountId,
//         });

//         console.log("📬 Onboarding check response:", checkRes.data);

//         const { stripeOnboardingUrl, stripeDashboardUrl } = checkRes.data;

//         if (checkRes.data?.needsOnboarding) {
//           const redirectUrl = stripeOnboardingUrl || stripeDashboardUrl;

//           if (!redirectUrl || typeof redirectUrl !== "string") {
//             console.warn("⚠️ Invalid redirect URL:", redirectUrl);
//             Alert.alert("Error", "Onboarding link is invalid or missing.");
//             return;
//           }

//           console.log("🔗 Redirecting to:", redirectUrl);
//           Alert.alert("Redirecting", "Complete onboarding with Stripe.");

//           try {
//             await Linking.openURL(redirectUrl);
//           } catch (linkErr) {
//             console.error("❌ Failed to open link:", linkErr);
//             Alert.alert("Error", "Could not open onboarding link.");
//           }
//           return;
//         }
//       } catch (stripeCheckErr) {
//         console.error("❌ Failed onboarding check:", stripeCheckErr);
//         Alert.alert("Error", "Unable to check onboarding. Please try again later.");
//         return;
//       }
//     }

//     const target = roleToScreen(role);
//     const action = { index: 0, routes: [{ name: target }] };
//     if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     }
//   } catch (err) {
//     console.error("❌ Login error:", err.message);
//     console.log("❌ Full error:", err.response?.data || err);
//     const msg = err.response?.data?.msg || err.message || "Login failed – check credentials.";
//     Alert.alert("Error", msg);
//   }
// };

// 🔐 LoginScreen with onboarding recheck + Stripe external redirect fallback + debug logs
//semi working latest
// const onSubmit = async () => {
//   try {
//     console.log("➡️ Attempting login for:", form.email);

//     const { data } = await api.post("/auth/login", form, {
//       headers: { "Content-Type": "application/json" },
//     });

//     if (!data?.token) throw new Error("Token missing from response");

//     await AsyncStorage.setItem("token", data.token);
//     if (data.refreshToken) {
//       await AsyncStorage.setItem("refreshToken", data.refreshToken);
//     }

//     const payload = parseJwt(data.token);
//     const role = payload?.role || "customer";
//     const stripeAccountId = payload?.stripeAccountId;
//     // 🧠 Helpful log for debugging role recognition after login
//     console.log("🎯 Role:", role);
//     // 🧠 Confirms stripeAccountId is correctly embedded in token
//     console.log("🏦 Stripe Account ID from token:", stripeAccountId);
//     setRole(role);

//     if (role === "serviceProvider" && stripeAccountId) {
//       try {
//         console.log("🔍 Calling /check-onboarding with:", stripeAccountId);

//         // 🔁 Onboarding check call to backend
//         const checkRes = await api.post("/routes/stripe/check-onboarding", {
//           stripeAccountId,
//         });

//         console.log("📬 Onboarding check response:", checkRes.data);

//         const { stripeOnboardingUrl, stripeDashboardUrl } = checkRes.data;

//         if (checkRes.data?.needsOnboarding) {
//           const redirectUrl = stripeOnboardingUrl || stripeDashboardUrl;

//           if (!redirectUrl || typeof redirectUrl !== "string") {
//             console.warn("⚠️ Invalid redirect URL:", redirectUrl);
//             Alert.alert("Error", "Onboarding link is invalid or missing.");
//             return;
//           }

//           console.log("🔗 Redirecting to:", redirectUrl);
//           Alert.alert("Redirecting", "Complete onboarding with Stripe.");

//           try {
//             await Linking.openURL(redirectUrl);
//           } catch (linkErr) {
//             console.error("❌ Failed to open link:", linkErr);
//             Alert.alert("Error", "Could not open onboarding link.");
//           }
//           return;
//         }
//       } catch (stripeCheckErr) {
//         console.error("❌ Failed onboarding check:", stripeCheckErr.response?.data || stripeCheckErr);
//         Alert.alert("Error", "Unable to check onboarding. Please try again later.");
//         return;
//       }
//     }

//     const target = roleToScreen(role);
//     const action = { index: 0, routes: [{ name: target }] };
//     if (navigationRef?.isReady?.()) {
//       // 🧭 Prefer navigationRef if initialized
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       // 🧭 Fallback to direct navigation reset
//       navigation.reset(action);
//     } else {
//       console.warn("⚠️ Navigation not ready: fallback route not applied.");
//     }
//   } catch (err) {
//     console.error("❌ Login error:", err.message);
//     console.log("❌ Full error:", err.response?.data || err);
//     const msg = err.response?.data?.msg || err.message || "Login failed – check credentials.";
//     Alert.alert("Error", msg);
//   }
// };

//last working
// const onSubmit = async () => {
//   try {
//     console.log("➡️ Attempting login for:", form.email);

//     const { data } = await api.post("/auth/login", form, {
//       headers: { "Content-Type": "application/json" },
//     });

//     if (!data?.token) throw new Error("Token missing from response");

//     await AsyncStorage.setItem("token", data.token);
//     if (data.refreshToken) {
//       await AsyncStorage.setItem("refreshToken", data.refreshToken);
//     }

//     const payload = parseJwt(data.token);
//     const role = payload?.role || "customer";
//     const stripeAccountId = payload?.stripeAccountId;
//     // 🧠 Helpful log for debugging role recognition after login
//     console.log("🎯 Role:", role);
//     // 🧠 Confirms stripeAccountId is correctly embedded in token
//     console.log("🏦 Stripe Account ID from token:", stripeAccountId);
//     setRole(role);

//     // ✅ Customer logic: route to PaymentScreen
//     if (role === "customer") {
//       console.log("💳 Redirecting customer to PaymentScreen");
//       navigation.reset({ index: 0, routes: [{ name: "PaymentScreen" }] });
//       return;
//     }

//     // ✅ Service provider onboarding logic
//     if (role === "serviceProvider" && stripeAccountId) {
//       try {
//         console.log("🔍 Calling /check-onboarding with:", stripeAccountId);

//         // 🔁 Onboarding check call to backend
//         const checkRes = await api.post("/routes/stripe/check-onboarding", {
//           stripeAccountId,
//         });

//         console.log("📬 Onboarding check response:", checkRes.data);

//         const { stripeOnboardingUrl, stripeDashboardUrl } = checkRes.data;

//         if (checkRes.data?.needsOnboarding) {
//           const redirectUrl = stripeOnboardingUrl || stripeDashboardUrl;

//           if (!redirectUrl || typeof redirectUrl !== "string") {
//             console.warn("⚠️ Invalid redirect URL:", redirectUrl);
//             Alert.alert("Error", "Onboarding link is invalid or missing.");
//             return;
//           }

//           console.log("🔗 Redirecting to:", redirectUrl);
//           Alert.alert("Redirecting", "Complete onboarding with Stripe.");

//           try {
//             await Linking.openURL(redirectUrl);
//           } catch (linkErr) {
//             console.error("❌ Failed to open link:", linkErr);
//             Alert.alert("Error", "Could not open onboarding link.");
//           }
//           return;
//         }
//       } catch (stripeCheckErr) {
//         console.error("❌ Failed onboarding check:", stripeCheckErr.response?.data || stripeCheckErr);
//         Alert.alert("Error", "Unable to check onboarding. Please try again later.");
//         return;
//       }
//     }

//     const target = roleToScreen(role);
//     // const action = { index: 0, routes: [{ name: target }] };
//     const action = {
//       index: 0,
//       routes: [{ name: "PaymentScreen", params: { jobId: "placeholder-id" } }],
//     };
    
//     if (navigationRef?.isReady?.()) {
//       // 🧭 Prefer navigationRef if initialized
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       // 🧭 Fallback to direct navigation reset
//       navigation.reset(action);
//     } else {
//       console.warn("⚠️ Navigation not ready: fallback route not applied.");
//     }
//   } catch (err) {
//     console.error("❌ Login error:", err.message);
//     console.log("❌ Full error:", err.response?.data || err);
//     const msg = err.response?.data?.msg || err.message || "Login failed – check credentials.";
//     Alert.alert("Error", msg);
//   }
// };

const onSubmit = async () => {
  try {
    console.log("➡️ Attempting login for:", form.email);

    const { data } = await api.post("/auth/login", form, {
      headers: { "Content-Type": "application/json" },
    });

    if (!data?.token) throw new Error("Token missing from response");

    await AsyncStorage.setItem("token", data.token);
    if (data.refreshToken) {
      await AsyncStorage.setItem("refreshToken", data.refreshToken);
    }

    const payload = parseJwt(data.token);
    const role = payload?.role || "customer";
    const stripeAccountId = payload?.stripeAccountId;
    console.log("🎯 Role:", role);
    console.log("🏦 Stripe Account ID from token:", stripeAccountId);
    setRole(role);

    if (role === "serviceProvider" && stripeAccountId) {
      try {
        console.log("🔍 Calling /check-onboarding with:", stripeAccountId);

        const checkRes = await api.post("/routes/stripe/check-onboarding", {
          stripeAccountId,
        });

        console.log("📬 Onboarding check response:", checkRes.data);

        const { stripeOnboardingUrl, stripeDashboardUrl } = checkRes.data;

        if (checkRes.data?.needsOnboarding) {
          const redirectUrl = stripeOnboardingUrl || stripeDashboardUrl;

          if (!redirectUrl || typeof redirectUrl !== "string") {
            console.warn("⚠️ Invalid redirect URL:", redirectUrl);
            Alert.alert("Error", "Onboarding link is invalid or missing.");
            return;
          }

          console.log("🔗 Redirecting to:", redirectUrl);
          Alert.alert("Redirecting", "Complete onboarding with Stripe.");

          try {
            await Linking.openURL(redirectUrl);
          } catch (linkErr) {
            console.error("❌ Failed to open link:", linkErr);
            Alert.alert("Error", "Could not open onboarding link.");
          }
          return;
        }
      } catch (stripeCheckErr) {
        console.error("❌ Failed onboarding check:", stripeCheckErr.response?.data || stripeCheckErr);
        Alert.alert("Error", "Unable to check onboarding. Please try again later.");
        return;
      }
    }

    // ✅ Default routing for all roles (excluding direct PaymentScreen navigation)
    const target = roleToScreen(role);
    const action = { index: 0, routes: [{ name: target }] };

    if (navigationRef?.isReady?.()) {
      navigationRef.reset(action);
    } else if (navigation && typeof navigation.reset === "function") {
      navigation.reset(action);
    } else {
      console.warn("⚠️ Navigation not ready: fallback route not applied.");
    }
  } catch (err) {
    console.error("❌ Login error:", err.message);
    console.log("❌ Full error:", err.response?.data || err);
    const msg = err.response?.data?.msg || err.message || "Login failed – check credentials.";
    Alert.alert("Error", msg);
  }
};


  // 🔐 LoginScreen with onboarding recheck for service providers

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient
        colors={["#1976d2", "#2f80ed"]}
        style={styles.heroWrapper}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.containerLogo}>
          <Image
            source={require("../assets/blinqfix_logo-new.jpeg")}
            style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
            resizeMode="contain"
          />
        </View>

        <Text>{"\n"}</Text>
        <Text style={styles.heroText}>
          BlinqFix{"\n"}
          <Text style={styles.heroSub}>Emergency repairs in the blink of an eye!</Text>{"\n"}
          <Text style={styles.heroSub2}>Residential - Commercial</Text>
        </Text>
      </LinearGradient>

      <View style={styles.formSection}>
        <View style={styles.formBox}>
          <Text style={styles.formTitle}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(v) => onChange("email", v)}
          />

          <View style={{ position: "relative" }}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={!showPassword}
              onChangeText={(v) => onChange("password", v)}
            />
            <TouchableOpacity
              style={{ position: "absolute", right: 16, top: 14 }}
              onPress={() => setShowPassword((s) => !s)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#1976d2"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={onSubmit}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 12 }}>
            <Text style={styles.linkRow}>
              <Text>Forgot Password? </Text>
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate("RequestPasswordResetScreen")}
              >
                Reset
              </Text>
            </Text>

            <Text style={[styles.linkRow, { marginTop: 8 }]}> 
              <Text style={styles.linkLabel}>Don’t have an account? </Text>
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate("Registration")}
              >
                Sign Up
              </Text>
            </Text>
          </View>
        </View>
      </View>

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#fff",
  },
  containerLogo: {},
  heroWrapper: {
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  heroText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  heroSub: { fontSize: 16, fontWeight: "600" },
  heroSub2: {
    fontSize: 18,
    fontWeight: "600",
    color: "red",
    marginTop: 4,
  },
  formSection: { alignItems: "center", marginBottom: 24 },
  formBox: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    elevation: 3,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 14,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  linkRow: { flexDirection: "row", justifyContent: "center", marginBottom: 2 },
  linkLabel: { fontSize: 14 },
  linkText: {
    fontSize: 14,
    color: "#1976d2",
    textDecorationLine: "none",
    fontWeight: "600",
  },
});
