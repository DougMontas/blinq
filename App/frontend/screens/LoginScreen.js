// // LoginScreen.js
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
// import ScreenWrapper from "../components/ScreenWrapper";

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
//   const [showPassword, setShowPassword] = useState(false);
//   const { setRole } = useAuth();
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions();

//   useEffect(() => {
//     (async () => {
//       const token = await registerForPushNotificationsAsync();
//       if (token) {
//         await api.post("/users/push-token", { token });
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     (async () => {
//       console.log("📡 Full Login URL:", api.defaults.baseURL + "/auth/login");

//       try {
//         const { status: locStatus } =
//           await Location.getForegroundPermissionsAsync();
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
//                     IntentLauncher.startActivityAsync(
//                       IntentLauncher.ACTION_LOCATION_SOURCE_SETTINGS
//                     );
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
//       console.log("➡️ Attempting login for:", form.email);

//       const { data } = await api.post("/auth/login", form, {
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!data?.token) throw new Error("Token missing from response");

//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }

//       const payload = parseJwt(data.token);
//       const role = payload?.role || "customer";
//       const stripeAccountId = payload?.stripeAccountId;
//       console.log("🎯 Role:", role);
//       console.log("🏦 Stripe Account ID from token:", stripeAccountId);
//       setRole(role);

//       if (role === "serviceProvider" && stripeAccountId) {
//         try {
//           console.log("🔍 Calling /check-onboarding with:", stripeAccountId);

//           const checkRes = await api.post("/routes/stripe/check-onboarding", {
//             stripeAccountId,
//           });

//           console.log("📬 Onboarding check response:", checkRes.data);

//           const { stripeOnboardingUrl, stripeDashboardUrl } = checkRes.data;

//           if (checkRes.data?.needsOnboarding) {
//             const redirectUrl = stripeOnboardingUrl || stripeDashboardUrl;

//             if (!redirectUrl || typeof redirectUrl !== "string") {
//               console.warn("⚠️ Invalid redirect URL:", redirectUrl);
//               Alert.alert("Error", "Onboarding link is invalid or missing.");
//               return;
//             }

//             console.log("🔗 Redirecting to:", redirectUrl);
//             Alert.alert("Redirecting", "Complete onboarding with Stripe.");

//             try {
//               await Linking.openURL(redirectUrl);
//             } catch (linkErr) {
//               console.error("❌ Failed to open link:", linkErr);
//               Alert.alert("Error", "Could not open onboarding link.");
//             }
//             return;
//           }
//         } catch (stripeCheckErr) {
//           console.error(
//             "❌ Failed onboarding check:",
//             stripeCheckErr.response?.data || stripeCheckErr
//           );
//           Alert.alert(
//             "Error",
//             "Unable to check onboarding. Please try again later."
//           );
//           return;
//         }
//       }

//       // ✅ Default routing for all roles (excluding direct PaymentScreen navigation)
//       const target = roleToScreen(role);
//       const action = { index: 0, routes: [{ name: target }] };

//       if (navigationRef?.isReady?.()) {
//         navigationRef.reset(action);
//       } else if (navigation && typeof navigation.reset === "function") {
//         navigation.reset(action);
//       } else {
//         console.warn("⚠️ Navigation not ready: fallback route not applied.");
//       }
//     } catch (err) {
//       console.error("❌ Login error:", err.message);
//       console.log("❌ Full error:", err.response?.data || err);
//       const msg =
//         err.response?.data?.msg ||
//         err.message ||
//         "Login failed – check credentials.";
//       Alert.alert("Error", msg);
//     }
//   };

//   // 🔐 LoginScreen with onboarding recheck for service providers

//   return (
//     <ScreenWrapper>
//       <ScrollView contentContainerStyle={styles.container}>
//         <LinearGradient
//           colors={["#1976d2", "#2f80ed"]}
//           style={styles.heroWrapper}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//         >
//           <View style={styles.containerLogo}>
//             <Image
//               source={require("../assets/blinqfix_logo-new.jpeg")}
//               style={{
//                 width: LOGO_SIZE,
//                 height: LOGO_SIZE,
//                 marginInline: "auto",
//               }}
//               resizeMode="contain"
//             />
//           </View>

//           <Text>{"\n"}</Text>
//           <Text style={styles.heroText}>
//             BlinqFix{"\n"}
//             <Text style={styles.heroSub}>
//               Emergency repairs in the blink of an eye!
//             </Text>
//             {"\n"}
//             <Text style={styles.heroSub2}>Residential - Commercial</Text>
//           </Text>
//         </LinearGradient>

//         <View style={styles.formSection}>
//           <View style={styles.formBox}>
//             <Text style={styles.formTitle}>Login</Text>

//             <TextInput
//               style={styles.input}
//               placeholder="Email"
//               keyboardType="email-address"
//               autoCapitalize="none"
//               onChangeText={(v) => onChange("email", v)}
//             />

//             <View style={{ position: "relative" }}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Password"
//                 secureTextEntry={!showPassword}
//                 onChangeText={(v) => onChange("password", v)}
//               />
//               <TouchableOpacity
//                 style={{ position: "absolute", right: 16, top: 14 }}
//                 onPress={() => setShowPassword((s) => !s)}
//               >
//                 <Ionicons
//                   name={showPassword ? "eye-off-outline" : "eye-outline"}
//                   size={22}
//                   color="#1976d2"
//                 />
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity style={styles.button} onPress={onSubmit}>
//               <Text style={styles.buttonText}>Login</Text>
//             </TouchableOpacity>

//             <View style={{ marginTop: 12 }}>
//               <Text style={styles.linkRow}>
//                 <Text>Forgot Password? </Text>
//                 <Text
//                   style={styles.linkText}
//                   onPress={() =>
//                     // navigation.navigate("ResetPasswordLost")
//                     navigation.navigate("RequestPasswordResetScreen")
//                   }
//                 >
//                   Reset
//                 </Text>
//               </Text>

//               <Text style={[styles.linkRow, { marginTop: 8 }]}>
//                 <Text style={styles.linkLabel}>Don’t have an account? </Text>
//                 <Text
//                   style={styles.linkText}
//                   onPress={() => navigation.navigate("Registration")}
//                 >
//                   Sign Up
//                 </Text>
//               </Text>
//             </View>
//           </View>
//         </View>

//         <Footer />
//       </ScrollView>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     paddingBottom: 0,
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
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
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

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import {
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   ArrowRight,
//   Zap,
//   Shield,
// } from 'lucide-react-native';
// import { useNavigation } from '@react-navigation/native';

// export default function AuthUIDemo() {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading] = useState(false); // Static, always false for UI demo

//   return (
//     <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContent}
//             keyboardShouldPersistTaps="handled"
//           >
//             {/* Header */}
//             <View style={styles.header}>
//               <View style={styles.logoContainer}>
//                 <Zap color="#facc15" size={40} />
//               </View>
//               <Text style={styles.title}>Welcome Back</Text>
//               <Text style={styles.subtitle}>Enter your credentials to access your account</Text>
//             </View>

//             {/* Form */}
//             <View style={styles.formContainer}>
//               <View style={styles.inputContainer}>
//                 <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Email Address"
//                   placeholderTextColor="#94a3b8"
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   value={email}
//                   onChangeText={setEmail}
//                 />
//               </View>
//               <View style={styles.inputContainer}>
//                 <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Password"
//                   placeholderTextColor="#94a3b8"
//                   secureTextEntry={!showPassword}
//                   value={password}
//                   onChangeText={setPassword}
//                 />
//                 <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeIcon}>
//                   {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
//                 </TouchableOpacity>
//               </View>
//               <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => navigation.navigate('ResetPasswordLost')}>
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Login Button */}
//             <TouchableOpacity
//               style={styles.loginButton}
//               disabled={loading}
//             >
//               <LinearGradient
//                 colors={['#22c55e', '#16a34a']}
//                 style={styles.loginButtonGradient}
//               >
//                 {loading ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <>
//                     <Text style={styles.loginButtonText}>Secure Login</Text>
//                     <ArrowRight color="#fff" size={20} />
//                   </>
//                 )}
//               </LinearGradient>
//             </TouchableOpacity>

//             {/* Footer / Sign Up Link */}
//             <View style={styles.footer}>
//               <Text style={styles.footerText}>Don't have an account?</Text>
//               <TouchableOpacity onPress={() => navigation.navigate('RegistrationScreen')}>
//                 <Text style={styles.footerLink}>Sign Up</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Trust Indicator */}
//             <View style={styles.trustIndicator}>
//               <Shield color="#22c55e" size={16} />
//               <Text style={styles.trustText}>Your connection is secure</Text>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 40,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   logoContainer: {
//     backgroundColor: 'rgba(250, 204, 21, 0.2)',
//     padding: 16,
//     borderRadius: 99,
//     marginBottom: 24,
//     borderWidth: 1,
//     borderColor: 'rgba(250, 204, 21, 0.3)',
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: '900',
//     color: '#fff',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#e0e7ff',
//     textAlign: 'center',
//   },
//   formContainer: {
//     gap: 16,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//   },
//   inputIcon: {
//     paddingHorizontal: 16,
//   },
//   input: {
//     flex: 1,
//     paddingVertical: 18,
//     fontSize: 16,
//     color: '#fff',
//   },
//   eyeIcon: {
//     paddingHorizontal: 16,
//   },
//   forgotPasswordButton: {
//     alignSelf: 'flex-end',
//     marginTop: 4,
//   },
//   forgotPasswordText: {
//     color: '#60a5fa',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   loginButton: {
//     marginTop: 24,
//     borderRadius: 16,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 8,
//   },
//   loginButtonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 18,
//     gap: 12,
//   },
//   loginButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 40,
//   },
//   footerText: {
//     color: '#e0e7ff',
//     fontSize: 16,
//   },
//   footerLink: {
//     color: '#60a5fa',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginLeft: 6,
//   },
//   trustIndicator: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 24,
//     backgroundColor: 'rgba(34, 197, 94, 0.1)',
//     alignSelf: 'center',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//   },
//   trustText: {
//     color: '#22c55e',
//     marginLeft: 8,
//     fontSize: 12,
//     fontWeight: '500',
//   },
// });

// // screens/LoginScreen.js
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
//   useWindowDimensions,
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   ArrowRight,
//   Zap,
//   Shield,
// } from "lucide-react-native";
// import { useNavigation } from "@react-navigation/native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Buffer } from "buffer";

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";

// /** ---------- helpers ---------- */
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

// // Minimal push registration (safe to fail quietly if not configured)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } =
//       await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     // If you use EAS project, pass { projectId } here
//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     return tokenData?.data || null;
//   } catch {
//     return null;
//   }
// }

// export default function Screen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /** ---------- side effects: permissions + push token ---------- */
//   useEffect(() => {
//     (async () => {
//       // push token
//       const token = await registerForPushNotificationsAsync();
//       if (token) {
//         try {
//           await api.post("/users/push-token", { token });
//         } catch (e) {
//           // non-blocking
//         }
//       }
//     })();
//   }, []);

//   useEffect(() => {
//     (async () => {
//       try {
//         // Location
//         const { status: locStatus } =
//           await Location.getForegroundPermissionsAsync();
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
//                     IntentLauncher.startActivityAsync(
//                       IntentLauncher.ACTION_LOCATION_SOURCE_SETTINGS
//                     );
//                   }
//                 },
//               },
//             ]);
//           }
//         }

//         // Notifications
//         const notifPerm = await Notifications.getPermissionsAsync();
//         if (notifPerm.status !== "granted") {
//           const req = await Notifications.requestPermissionsAsync();
//           if (req.status !== "granted") {
//             Alert.alert("Notifications", "Enable notifications for updates.", [
//               { text: "Open Settings", onPress: () => Linking.openSettings() },
//               { text: "Cancel", style: "cancel" },
//             ]);
//           }
//         }
//       } catch (e) {
//         // permission check shouldn't block login
//       }
//     })();
//   }, []);

//   /** ---------- handlers ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);
//       const creds = { email: email.trim().toLowerCase(), password };

//       // Helpful debug
//       // console.log("📡 Full Login URL:", api.defaults.baseURL + "/auth/login");

//       const { data } = await api.post("/auth/login", creds, {
//         headers: { "Content-Type": "application/json" },
//       });
//       if (!data?.token) throw new Error("Token missing from response");

//       // store tokens
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }

//       // read role + stripe account from access token
//       const payload = parseJwt(data.token);
//       const role = payload?.role || "customer";
//       const stripeAccountId = payload?.stripeAccountId;
//       setRole(role);

//       // Service providers: check Stripe onboarding
//       if (role === "serviceProvider" && stripeAccountId) {
//         try {
//           const checkRes = await api.post("/routes/stripe/check-onboarding", {
//             stripeAccountId,
//           });
//           const { needsOnboarding, stripeOnboardingUrl, stripeDashboardUrl } =
//             checkRes.data || {};

//           if (needsOnboarding) {
//             const redirectUrl = stripeOnboardingUrl || stripeDashboardUrl;
//             if (!redirectUrl || typeof redirectUrl !== "string") {
//               Alert.alert("Error", "Onboarding link is invalid or missing.");
//             } else {
//               Alert.alert("Redirecting", "Complete onboarding with Stripe.");
//               await Linking.openURL(redirectUrl);
//             }
//             return; // don't continue to dashboard yet
//           }
//         } catch (stripeCheckErr) {
//           Alert.alert(
//             "Error",
//             "Unable to check onboarding. Please try again later."
//           );
//           return;
//         }
//       }

//       // Navigate by role
//       const target = roleToScreen(role);
//       const action = { index: 0, routes: [{ name: target }] };
//       if (navigationRef?.isReady?.()) {
//         navigationRef.reset(action);
//       } else if (navigation && typeof navigation.reset === "function") {
//         navigation.reset(action);
//       }
//     } catch (err) {
//       const msg =
//         err.response?.data?.msg ||
//         err.message ||
//         "Login failed – check credentials.";
//       Alert.alert("Error", msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <LinearGradient
//       colors={["#0f172a", "#1e3a8a", "#312e81"]}
//       style={styles.container}
//     >
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContent}
//             keyboardShouldPersistTaps="handled"
//           >
//             {/* Header */}
//             <View style={styles.header}>
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require("../assets/blinqfix_logo-new.jpeg")}
//                   style={{
//                     width: LOGO_SIZE,
//                     height: LOGO_SIZE,
//                     marginInline: "auto",
//                   }}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={styles.title}>Login</Text>
//               <Text style={styles.subtitle}>
//                 Enter your credentials to access your account
//               </Text>
//             </View>

//             {/* Form */}
//             <View style={styles.formContainer}>
//               <View style={styles.inputContainer}>
//                 <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Email Address"
//                   placeholderTextColor="#94a3b8"
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   value={email}
//                   onChangeText={setEmail}
//                   returnKeyType="next"
//                   autoComplete="email"
//                 />
//               </View>

//               <View style={styles.inputContainer}>
//                 <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Password"
//                   placeholderTextColor="#94a3b8"
//                   secureTextEntry={!showPassword}
//                   value={password}
//                   onChangeText={setPassword}
//                   autoComplete="password"
//                 />
//                 <TouchableOpacity
//                   onPress={() => setShowPassword((p) => !p)}
//                   style={styles.eyeIcon}
//                 >
//                   {showPassword ? (
//                     <EyeOff color="#94a3b8" size={20} />
//                   ) : (
//                     <Eye color="#94a3b8" size={20} />
//                   )}
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.forgotPasswordButton}
//                 onPress={() =>
//                   navigation.navigate("RequestPasswordResetScreen")
//                 }
//               >
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Login Button */}
//             <TouchableOpacity
//               style={styles.loginButton}
//               onPress={onSubmit}
//               disabled={loading}
//             >
//               <LinearGradient
//                 colors={["#22c55e", "#16a34a"]}
//                 style={styles.loginButtonGradient}
//               >
//                 {loading ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <>
//                     <Text style={styles.loginButtonText}>Secure Login</Text>
//                     <ArrowRight color="#fff" size={20} />
//                   </>
//                 )}
//               </LinearGradient>
//             </TouchableOpacity>

//             {/* Footer / Sign Up Link */}
//             <View style={styles.footer}>
//               <Text style={styles.footerText}>Don't have an account?</Text>
//               <TouchableOpacity
//                 onPress={() => navigation.navigate("Registration")}
//               >
//                 <Text style={styles.footerLink}>Sign Up</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Trust Indicator */}
//             <View style={styles.trustIndicator}>
//               <Shield color="#22c55e" size={16} />
//               <Text style={styles.trustText}>Your connection is secure</Text>
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 40,
//   },
//   header: { alignItems: "center", marginBottom: 40 },
//   logoContainer: {
//     // backgroundColor: "rgba(250, 204, 21, 0.2)",
//     // padding: 16,
//     // borderRadius: 99,
//     // marginBottom: 24,
//     // borderWidth: 1,
//     borderColor: "rgba(250, 204, 21, 0.3)",
//   },
//   title: { fontSize: 32, fontWeight: "900", color: "#fff", marginBottom: 8 },
//   subtitle: { fontSize: 16, color: "#e0e7ff", textAlign: "center" },
//   formContainer: { gap: 16 },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.2)",
//   },
//   inputIcon: { paddingHorizontal: 16 },
//   input: { flex: 1, paddingVertical: 18, fontSize: 16, color: "#fff" },
//   eyeIcon: { paddingHorizontal: 16 },
//   forgotPasswordButton: { alignSelf: "flex-end", marginTop: 4 },
//   forgotPasswordText: { color: "#60a5fa", fontSize: 14, fontWeight: "600" },
//   loginButton: {
//     marginTop: 24,
//     borderRadius: 16,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 8,
//   },
//   loginButtonGradient: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 18,
//     gap: 12,
//   },
//   loginButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
//   footer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 40,
//   },
//   footerText: { color: "#e0e7ff", fontSize: 16 },
//   footerLink: {
//     color: "#60a5fa",
//     fontSize: 16,
//     fontWeight: "bold",
//     marginLeft: 6,
//   },
//   trustIndicator: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 24,
//     backgroundColor: "rgba(34, 197, 94, 0.1)",
//     alignSelf: "center",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//   },
//   trustText: {
//     color: "#22c55e",
//     marginLeft: 8,
//     fontSize: 12,
//     fontWeight: "500",
//   },
// });

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as IntentLauncher from "expo-intent-launcher";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";

import api from "../api/client";
import { useAuth, navigationRef } from "../context/AuthProvider";

/** ---------- helpers ---------- */
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
  const r = (role || "").toLowerCase();
  if (r === "serviceprovider" || r === "provider")
    return "ServiceProviderDashboard";
  if (r === "admin") return "AdminDashboard";
  return "CustomerDashboard";
}

// Minimal push registration (safe to fail quietly if not configured)
async function registerForPushNotificationsAsync() {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return null;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData?.data || null;
  } catch {
    return null;
  }
}

export default function Screen() {
  const navigation = useNavigation();
  const { setRole } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { width } = Dimensions.get("window");
  const LOGO_SIZE = width * 0.55;

  /** ---------- side effects: permissions only (no push-token post here) ---------- */
  useEffect(() => {
    (async () => {
      try {
        // Location
        const { status: locStatus } =
          await Location.getForegroundPermissionsAsync();
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
                    IntentLauncher.startActivityAsync(
                      IntentLauncher.ACTION_LOCATION_SOURCE_SETTINGS
                    );
                  }
                },
              },
            ]);
          }
        }

        // Notifications
        const notifPerm = await Notifications.getPermissionsAsync();
        if (notifPerm.status !== "granted") {
          const req = await Notifications.requestPermissionsAsync();
          if (req.status !== "granted") {
            Alert.alert("Notifications", "Enable notifications for updates.", [
              { text: "Open Settings", onPress: () => Linking.openSettings() },
              { text: "Cancel", style: "cancel" },
            ]);
          }
        }
      } catch {
        // permission check shouldn't block login
      }
    })();
  }, []);

  /** ---------- handlers ---------- */
  const onSubmit = async () => {
    try {
      setLoading(true);
      const creds = { email: email.trim().toLowerCase(), password };

      const { data } = await api.post("/auth/login", creds, {
        headers: { "Content-Type": "application/json" },
      });
      if (!data?.token) throw new Error("Token missing from response");

      // store tokens
      await AsyncStorage.setItem("token", data.token);
      if (data.refreshToken) {
        await AsyncStorage.setItem("refreshToken", data.refreshToken);
      }

      // ensure future api calls include auth header
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

      // now that we're authenticated, (optionally) register & send push token
      try {
        const expoPush = await registerForPushNotificationsAsync();
        if (expoPush) {
          await api.post("/users/push-token", { token: expoPush });
        }
      } catch {
        // non-blocking
      }

      // read role + stripe account from access token
      const payload = parseJwt(data.token);
      const role = payload?.role || "customer";
      const stripeAccountId = payload?.stripeAccountId;
      setRole(role);

      // Service providers: check Stripe onboarding
      if (role === "serviceProvider" && stripeAccountId) {
        try {
          const checkRes = await api.post("/routes/stripe/check-onboarding", {
            stripeAccountId,
          });
          const { needsOnboarding, stripeOnboardingUrl, stripeDashboardUrl } =
            checkRes.data || {};

          if (needsOnboarding) {
            const redirectUrl = stripeOnboardingUrl || stripeDashboardUrl;
            if (!redirectUrl || typeof redirectUrl !== "string") {
              Alert.alert("Error", "Onboarding link is invalid or missing.");
            } else {
              Alert.alert("Redirecting", "Complete onboarding with Stripe.");
              await Linking.openURL(redirectUrl);
            }
            return; // don't continue to dashboard yet
          }
        } catch {
          Alert.alert(
            "Error",
            "Unable to check onboarding. Please try again later."
          );
          return;
        }
      }

      // Navigate by role
      const target = roleToScreen(role);
      const action = { index: 0, routes: [{ name: target }] };
      if (navigationRef?.isReady?.()) {
        navigationRef.reset(action);
      } else if (navigation && typeof navigation.reset === "function") {
        navigation.reset(action);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.message ||
        "Login failed – check credentials.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#312e81"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/blinqfix_logo-new.jpeg")}
                  style={{
                    width: LOGO_SIZE,
                    height: LOGO_SIZE,
                    marginInline: "auto",
                  }}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>
                Enter your credentials to access your account
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff color="#94a3b8" size={20} />
                  ) : (
                    <Eye color="#94a3b8" size={20} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() =>
                  navigation.navigate("RequestPasswordResetScreen")
                }
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={onSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={["#22c55e", "#16a34a"]}
                style={styles.loginButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Secure Login</Text>
                    <ArrowRight color="#fff" size={20} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer / Sign Up Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Registration")}
              >
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Trust Indicator */}
            <View style={styles.trustIndicator}>
              <Shield color="#22c55e" size={16} />
              <Text style={styles.trustText}>Your connection is secure</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: { alignItems: "center", marginBottom: 40 },
  logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
  title: { fontSize: 32, fontWeight: "900", color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#e0e7ff", textAlign: "center" },
  formContainer: { gap: 16 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  inputIcon: { paddingHorizontal: 16 },
  input: { flex: 1, paddingVertical: 18, fontSize: 16, color: "#fff" },
  eyeIcon: { paddingHorizontal: 16 },
  forgotPasswordButton: { alignSelf: "flex-end", marginTop: 4 },
  forgotPasswordText: { color: "#60a5fa", fontSize: 14, fontWeight: "600" },
  loginButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  loginButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
  },
  loginButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  footerText: { color: "#e0e7ff", fontSize: 16 },
  footerLink: {
    color: "#60a5fa",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 6,
  },
  trustIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  trustText: {
    color: "#22c55e",
    marginLeft: 8,
    fontSize: 12,
    fontWeight: "500",
  },
});
