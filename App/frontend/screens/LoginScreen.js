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
//   const r = (role || "").toLowerCase();
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

//   /** ---------- side effects: permissions only (no push-token post here) ---------- */
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
//       } catch {
//         // permission check shouldn't block login
//       }
//     })();
//   }, []);

//   /** ---------- handlers ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);
//       const creds = { email: email.trim().toLowerCase(), password };

//       const { data } = await api.post("/auth/login", creds, {
//         headers: { "Content-Type": "application/json" },
//       });
//       if (!data?.token) throw new Error("Token missing from response");

//       // store tokens
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }

//       // ensure future api calls include auth header
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // now that we're authenticated, (optionally) register & send push token
//       try {
//         const expoPush = await registerForPushNotificationsAsync();
//         if (expoPush) {
//           await api.post("/users/push-token", { token: expoPush });
//         }
//       } catch {
//         // non-blocking
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
//         } catch {
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
//         err?.response?.data?.msg ||
//         err?.message ||
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
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
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
//   const binary = typeof atob === "function" ? atob(base64) : Buffer.from(base64, "base64").toString("binary");
//   const jsonPayload = decodeURIComponent(
//     binary
//       .split("")
//       .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//       .join("")
//   );
//   return JSON.parse(jsonPayload);
// }

// function roleToScreen(role) {
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// // Minimal push registration (safe to fail quietly if not configured)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     return tokenData?.data || null;
//   } catch (e) {
//     console.warn("Push token registration failed (non-blocking)", e);
//     return null;
//   }
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /** ---------- legacy: attempt push token post on mount (best-effort, unauth) ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         const token = await registerForPushNotificationsAsync();
//         if (token) {
//           // Some backends allow unauth push-token capture. If your API requires auth, this will be ignored.
//           await api.post("/users/push-token", { token }).catch(() => {});
//         }
//       } catch {}
//     })();
//   }, []);

//   /** ---------- permissions (do not block login) ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         // Location
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
//         console.warn("Permission precheck failed (non-blocking)", e);
//       }
//     })();
//   }, []);

//   /** ---------- handlers ---------- */
//   const navigateByRole = (role) => {
//     const target = roleToScreen(role);
//     const action = { index: 0, routes: [{ name: target }] };
//     if (navigationRef?.isReady?.()) {
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     }
//   };

//   const onSubmit = async () => {
//     try {
//       setLoading(true);
//       const creds = { email: email.trim().toLowerCase(), password };

//       console.log("➡️ Attempting login for:", creds.email);
//       console.log("📡 Login URL:", api.defaults.baseURL + "/auth/login");

//       const { data } = await api.post("/auth/login", creds, {
//         headers: { "Content-Type": "application/json" },
//       });
//       if (!data?.token) throw new Error("Token missing from response");

//       // store tokens
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }

//       // future requests use auth header
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // register + send push token after auth (authoritative path)
//       try {
//         const expoPush = await registerForPushNotificationsAsync();
//         if (expoPush) await api.post("/users/push-token", { token: expoPush });
//       } catch (e) {
//         console.warn("Post-login push-token submit failed (non-blocking)", e);
//       }

//       // read role + stripe account from access token
//       const payload = parseJwt(data.token);
//       const role = payload?.role || "customer";
//       const stripeAccountId = payload?.stripeAccountId;
//       setRole(role);

//       // ✅ Allow service providers to log in even if their profile / onboarding is incomplete.
//       // We *offer* onboarding now, but do not block navigation.
//       if (role === "serviceProvider" && stripeAccountId) {
//         try {
//           console.log("🔍 Checking Stripe onboarding for:", stripeAccountId);
//           const checkRes = await api.post("/routes/stripe/check-onboarding", { stripeAccountId });
//           const { needsOnboarding, stripeOnboardingUrl, stripeDashboardUrl } = checkRes.data || {};

//           if (needsOnboarding) {
//             const redirectUrl = stripeOnboardingUrl || stripeDashboardUrl;
//             // Navigate first so they are inside the app regardless
//             navigateByRole(role);
//             if (redirectUrl && typeof redirectUrl === "string") {
//               Alert.alert(
//                 "Finish Stripe Onboarding?",
//                 "You can do it now or later from My Account.",
//                 [
//                   { text: "Later", style: "cancel" },
//                   {
//                     text: "Continue",
//                     onPress: async () => {
//                       try { await Linking.openURL(redirectUrl); } catch (e) {
//                         Alert.alert("Error", "Could not open onboarding link.");
//                       }
//                     },
//                   },
//                 ]
//               );
//             }
//             return; // we already navigated
//           }
//         } catch (stripeCheckErr) {
//           console.warn("Stripe onboarding check failed (non-blocking)", stripeCheckErr?.response?.data || stripeCheckErr);
//           // Do NOT block login if check fails
//           navigateByRole(role);
//           return;
//         }
//       }

//       // No onboarding needed or non-provider
//       navigateByRole(role);
//     } catch (err) {
//       console.error("❌ Login error:", err?.message);
//       console.log("❌ Full error:", err?.response?.data || err);
//       const msg = err?.response?.data?.msg || err?.message || "Login failed – check credentials.";
//       Alert.alert("Error", msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
//           <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//             {/* Header */}
//             <View style={styles.header}>
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require("../assets/blinqfix_logo-new.jpeg")}
//                   style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={styles.title}>Login</Text>
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
//                 <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeIcon}>
//                   {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => navigation.navigate("RequestPasswordResetScreen")}>
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Login Button */}
//             <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={loading}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.loginButtonGradient}>
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
//               <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
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
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 40 },
//   footerText: { color: "#e0e7ff", fontSize: 16 },
//   footerLink: { color: "#60a5fa", fontSize: 16, fontWeight: "bold", marginLeft: 6 },
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
//   trustText: { color: "#22c55e", marginLeft: 8, fontSize: 12, fontWeight: "500" },
// });

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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
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
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// // Minimal push registration (safe to fail quietly if not configured)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     return tokenData?.data || null;
//   } catch {
//     return null;
//   }
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /** ---------- side effects: permissions only (no push-token post here) ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         // Location
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
//       } catch {
//         // permission check shouldn't block login
//       }
//     })();
//   }, []);

//   /** ---------- helpers ---------- */
//   const openUrlSafely = async (url) => {
//     try {
//       if (url && (await Linking.canOpenURL(url))) {
//         await Linking.openURL(url);
//         return true;
//       }
//     } catch {}
//     Alert.alert("Error", "Could not open onboarding link.");
//     return false;
//   };

//   const goTo = (routeName, params = {}) => {
//     const action = { index: 0, routes: [{ name: routeName, params }] };
//     if (navigationRef?.isReady?.()) {
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     } else {
//       // fallback
//       navigation.navigate(routeName, params);
//     }
//   };

//   /** ---------- handlers ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);

//       // Remove any stale tokens so the login request is clean
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const creds = { email: email.trim().toLowerCase(), password };
//       const { data } = await api.post("/auth/login", creds, {
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!data?.token) throw new Error("Token missing from response");

//       // store tokens
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }

//       // ensure future api calls include auth header
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // non-blocking push token registration
//       registerForPushNotificationsAsync()
//         .then((expoPush) => expoPush && api.post("/users/push-token", { token: expoPush }))
//         .catch(() => {});

//       // read role + stripe account from access token
//       const payload = parseJwt(data.token);
//       const role = payload?.role || "customer";
//       const stripeAccountId = payload?.stripeAccountId;
//       setRole(role);

//       const target = roleToScreen(role);

//       // ---------- Service provider Stripe logic ----------
//       if ((role || "").toLowerCase() === "serviceprovider" && stripeAccountId) {
//         try {
//           const checkRes = await api.post("/routes/stripe/check-onboarding", {
//             stripeAccountId,
//           });

//           const {
//             needsOnboarding,
//             stripeOnboardingUrl,
//             stripeDashboardUrl,
//             requirements, // optional, if backend returns missing KYC fields
//           } = checkRes?.data || {};

//           if (needsOnboarding) {
//             // Let the user choose: Stripe now, fix in app, or continue anyway
//             setLoading(false);
//             Alert.alert(
//               "Finish Stripe Onboarding",
//               "To receive payouts, please finish Stripe onboarding. You can open Stripe now, or fix missing documents in your profile.",
//               [
//                 {
//                   text: "Open Stripe",
//                   onPress: async () => {
//                     const url = stripeOnboardingUrl || stripeDashboardUrl;
//                     await openUrlSafely(url);
//                     // still allow them into the app after launching Stripe
//                     goTo(target);
//                   },
//                 },
//                 {
//                   text: "Fix in App",
//                   onPress: () => {
//                     // Send them to profile with optional missing requirements
//                     goTo("ProviderProfile", {
//                       missingRequirements: requirements || null,
//                     });
//                   },
//                 },
//                 {
//                   text: "Later",
//                   style: "cancel",
//                   onPress: () => goTo(target),
//                 },
//               ]
//             );
//             return; // wait for user choice, don't auto-navigate below
//           }
//         } catch (stripeCheckErr) {
//           // If the check fails, allow login anyway and nudge them to profile
//           setLoading(false);
//           Alert.alert(
//             "Stripe Check Unavailable",
//             "We couldn't check onboarding right now. You can proceed and finish setup from your profile."
//           );
//           goTo(target);
//           return;
//         }
//       } else if ((role || "").toLowerCase() === "serviceprovider" && !stripeAccountId) {
//         // No stripe account on token — still let them in and nudge them
//         setLoading(false);
//         Alert.alert(
//           "Connect Payouts",
//           "To receive payouts, connect your Stripe account from your profile."
//         );
//         goTo(target);
//         return;
//       }

//       // ---------- Everyone else (or providers fully onboarded) ----------
//       setLoading(false);
//       goTo(target);
//     } catch (err) {
//       setLoading(false);
//       const msg =
//         err?.response?.data?.msg ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";
//       Alert.alert("Error", msg);
//     }
//   };

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
//           <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//             {/* Header */}
//             <View style={styles.header}>
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require("../assets/blinqfix_logo-new.jpeg")}
//                   style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={styles.title}>Login</Text>
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
//                 <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeIcon}>
//                   {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.forgotPasswordButton}
//                 onPress={() => navigation.navigate("RequestPasswordResetScreen")}
//               >
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Login Button */}
//             <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={loading}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.loginButtonGradient}>
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
//               <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
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
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 40 },
//   footerText: { color: "#e0e7ff", fontSize: 16 },
//   footerLink: { color: "#60a5fa", fontSize: 16, fontWeight: "bold", marginLeft: 6 },
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
//   trustText: { color: "#22c55e", marginLeft: 8, fontSize: 12, fontWeight: "500" },
// });

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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
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
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// // Minimal push registration (safe to fail quietly if not configured)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     return tokenData?.data || null;
//   } catch {
//     return null;
//   }
// }

// /** Save push token only if user is already active so we don't hit schema validation */
// async function savePushTokenIfAllowed(me) {
//   try {
//     const expoPush = await registerForPushNotificationsAsync();
//     if (!expoPush) return;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     const isActive =
//       me?.independentContractorAgreement === true ||
//       me?.accountStatus === "active" ||
//       me?.isActive === true;

//     if (isProvider && !isActive) {
//       // stash for later; we'll flush after they complete documents
//       await AsyncStorage.setItem("pendingPushToken", expoPush);
//       return;
//     }

//     await api.post("/users/push-token", { token: expoPush });
//     // if successful, clear any pending copy
//     await AsyncStorage.removeItem("pendingPushToken");
//   } catch (e) {
//     // never block login for push-token errors
//     try {
//       const expoPush = await AsyncStorage.getItem("pendingPushToken");
//       if (!expoPush) {
//         const maybe = await registerForPushNotificationsAsync();
//         if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
//       }
//     } catch {}
//   }
// }

// /** Try to flush a previously stashed token (call this again later in dashboard/profile) */
// export async function flushPendingPushTokenIfReady() {
//   try {
//     const pending = await AsyncStorage.getItem("pendingPushToken");
//     if (!pending) return;
//     const meRes = await api.get("/users/me");
//     const me = meRes?.data?.user ?? meRes?.data ?? null;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     const isActive =
//       me?.independentContractorAgreement === true ||
//       me?.accountStatus === "active" ||
//       me?.isActive === true;

//     if (isProvider && !isActive) return;

//     await api.post("/users/push-token", { token: pending });
//     await AsyncStorage.removeItem("pendingPushToken");
//   } catch {
//     // swallow
//   }
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /** ---------- side effects: permissions only ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         // Location
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
//       } catch {
//         // permission checks shouldn't block login
//       }
//     })();
//   }, []);

//   /** ---------- helpers ---------- */
//   const openUrlSafely = async (url) => {
//     try {
//       if (url && (await Linking.canOpenURL(url))) {
//         await Linking.openURL(url);
//         return true;
//       }
//     } catch {}
//     Alert.alert("Error", "Could not open onboarding link.");
//     return false;
//   };

//   const goTo = (routeName, params = {}) => {
//     const action = { index: 0, routes: [{ name: routeName, params }] };
//     if (navigationRef?.isReady?.()) {
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     } else {
//       navigation.navigate(routeName, params);
//     }
//   };

//   /** ---------- handlers ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);

//       // clear stale tokens
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const creds = { email: email.trim().toLowerCase(), password };
//       const { data } = await api.post("/auth/login", creds, {
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!data?.token) throw new Error("Token missing from response");

//       // store tokens
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }

//       // set auth header for subsequent calls
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // get user doc to decide whether we can safely save push token
//       let me = null;
//       try {
//         const meRes = await api.get("/users/me");
//         me = meRes?.data?.user ?? meRes?.data ?? null;
//       } catch {
//         // ignore
//       }

//       // save (or stash) push token without blocking login
//       savePushTokenIfAllowed(me);

//       // read role + stripe account from token
//       const payload = parseJwt(data.token);
//       const role = payload?.role || "customer";
//       const stripeAccountId = payload?.stripeAccountId;
//       setRole(role);

//       const target = roleToScreen(role);

//       // Providers: Stripe onboarding check — DO NOT block login
//       if ((role || "").toLowerCase() === "serviceprovider" && stripeAccountId) {
//         try {
//           const checkRes = await api.post("/routes/stripe/check-onboarding", {
//             stripeAccountId,
//           });

//           const {
//             needsOnboarding,
//             stripeOnboardingUrl,
//             stripeDashboardUrl,
//             requirements,
//           } = checkRes?.data || {};

//           if (needsOnboarding) {
//             setLoading(false);
//             Alert.alert(
//               "Finish Stripe Onboarding",
//               "To receive payouts, please finish Stripe onboarding. You can open Stripe now, or fix missing documents in your profile.",
//               [
//                 {
//                   text: "Open Stripe",
//                   onPress: async () => {
//                     const url = stripeOnboardingUrl || stripeDashboardUrl;
//                     await openUrlSafely(url);
//                     goTo(target);
//                   },
//                 },
//                 {
//                   text: "Fix in App",
//                   onPress: () =>
//                     goTo("ProviderProfile", {
//                       missingRequirements: requirements || null,
//                     }),
//                 },
//                 { text: "Later", style: "cancel", onPress: () => goTo(target) },
//               ]
//             );
//             return;
//           }
//         } catch {
//           // allow login anyway
//           setLoading(false);
//           Alert.alert(
//             "Stripe Check Unavailable",
//             "We couldn't check onboarding right now. You can proceed and finish setup from your profile."
//           );
//           goTo(target);
//           return;
//         }
//       } else if ((role || "").toLowerCase() === "serviceprovider" && !stripeAccountId) {
//         setLoading(false);
//         Alert.alert(
//           "Connect Payouts",
//           "To receive payouts, connect your Stripe account from your profile."
//         );
//         goTo(target);
//         return;
//       }

//       // All good — go to dashboard
//       setLoading(false);
//       goTo(target);
//     } catch (err) {
//       setLoading(false);
//       const msg =
//         err?.response?.data?.msg ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";
//       Alert.alert("Error", msg);
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
//                 onPress={() => navigation.navigate("RequestPasswordResetScreen")}
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
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
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

// function shouldRetryLowercaseLogin(err) {
//   const status = err?.response?.status;
//   const msg =
//     (err?.response?.data?.msg || err?.response?.data?.message || err?.message || "")
//       .toString()
//       .toLowerCase();

//   // Common patterns where retrying with lowercased email helps
//   if (status === 404) return true; // many backends return 404 for user-not-found
//   if (msg.includes("user not found")) return true;
//   if (msg.includes("invalid credentials")) return true; // some backends use this for both not-found/wrong-pass
//   if (status === 400 && (msg.includes("email") || msg.includes("not found"))) return true;

//   return false;
// }

// function roleToScreen(role) {
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// // Minimal push registration (safe to fail quietly if not configured)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     return tokenData?.data || null;
//   } catch {
//     return null;
//   }
// }

// /** Save push token only if user is already active so we don't hit schema validation */
// async function savePushTokenIfAllowed(me) {
//   try {
//     const expoPush = await registerForPushNotificationsAsync();
//     if (!expoPush) return;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     const isActive =
//       me?.independentContractorAgreement === true ||
//       me?.accountStatus === "active" ||
//       me?.isActive === true;

//     if (isProvider && !isActive) {
//       // stash for later; we'll flush after they complete documents
//       await AsyncStorage.setItem("pendingPushToken", expoPush);
//       return;
//     }

//     await api.post("/users/push-token", { token: expoPush });
//     // if successful, clear any pending copy
//     await AsyncStorage.removeItem("pendingPushToken");
//   } catch (e) {
//     // never block login for push-token errors
//     try {
//       const expoPush = await AsyncStorage.getItem("pendingPushToken");
//       if (!expoPush) {
//         const maybe = await registerForPushNotificationsAsync();
//         if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
//       }
//     } catch {}
//   }
// }

// /** Try to flush a previously stashed token (call this again later in dashboard/profile) */
// export async function flushPendingPushTokenIfReady() {
//   try {
//     const pending = await AsyncStorage.getItem("pendingPushToken");
//     if (!pending) return;
//     const meRes = await api.get("/users/me");
//     const me = meRes?.data?.user ?? meRes?.data ?? null;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     const isActive =
//       me?.independentContractorAgreement === true ||
//       me?.accountStatus === "active" ||
//       me?.isActive === true;

//     if (isProvider && !isActive) return;

//     await api.post("/users/push-token", { token: pending });
//     await AsyncStorage.removeItem("pendingPushToken");
//   } catch {
//     // swallow
//   }
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /** ---------- side effects: permissions only ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         // Location
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
//       } catch {
//         // permission checks shouldn't block login
//       }
//     })();
//   }, []);

//   /** ---------- helpers ---------- */
//   const openUrlSafely = async (url) => {
//     try {
//       if (url && (await Linking.canOpenURL(url))) {
//         await Linking.openURL(url);
//         return true;
//       }
//     } catch {}
//     Alert.alert("Error", "Could not open onboarding link.");
//     return false;
//   };

//   const goTo = (routeName, params = {}) => {
//     const action = { index: 0, routes: [{ name: routeName, params }] };
//     if (navigationRef?.isReady?.()) {
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     } else {
//       navigation.navigate(routeName, params);
//     }
//   };

//   /** ---------- handlers ---------- */
//   // const onSubmit = async () => {
//   //   try {
//   //     setLoading(true);

//   //     // clear stale tokens
//   //     await AsyncStorage.multiRemove(["token", "refreshToken"]);

//   //     const creds = { email: email.trim().toLowerCase(), password };
//   //     const { data } = await api.post("/auth/login", creds, {
//   //       headers: { "Content-Type": "application/json" },
//   //     });

//   //     if (!data?.token) throw new Error("Token missing from response");

//   //     // store tokens
//   //     await AsyncStorage.setItem("token", data.token);
//   //     if (data.refreshToken) {
//   //       await AsyncStorage.setItem("refreshToken", data.refreshToken);
//   //     }

//   //     // set auth header for subsequent calls
//   //     api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//   //     // get user doc to decide whether we can safely save push token
//   //     let me = null;
//   //     try {
//   //       const meRes = await api.get("/users/me");
//   //       me = meRes?.data?.user ?? meRes?.data ?? null;
//   //     } catch {
//   //       // ignore
//   //     }

//   //     // save (or stash) push token without blocking login
//   //     savePushTokenIfAllowed(me);

//   //     // read role + stripe account from token (fallback to /me)
//   //     const payload = parseJwt(data.token);
//   //     const role = payload?.role || "customer";
//   //     // Fallbacks if token doesn't include it
//   //     const stripeAccountId =
//   //       payload?.stripeAccountId ||
//   //       me?.stripeAccountId ||
//   //       me?.stripe?.accountId ||
//   //       null;

//   //     setRole(role);
//   //     const target = roleToScreen(role);

//   //     // Quick flags about provider/account status (used for UX nudges; never block)
//   //     const isProvider = (role || "").toLowerCase() === "serviceprovider";
//   //     const isActive =
//   //       me?.independentContractorAgreement === true ||
//   //       me?.accountStatus === "active" ||
//   //       me?.isActive === true;
//   //     const isIncomplete = isProvider && !isActive;

//   //     // ====== PROVIDER BRANCH ======
//   //     if (isProvider) {
//   //       // 1) If NO stripe AND account incomplete -> single combined prompt
//   //       if (!stripeAccountId && isIncomplete) {
//   //         setLoading(false);
//   //         Alert.alert(
//   //           "Finish Setup",
//   //           "You're signed in. To start receiving jobs and payouts, please complete your profile and connect Stripe.",
//   //           [
//   //             {
//   //               text: "Update Profile",
//   //               onPress: () =>
//   //                 goTo("ProviderProfile", {
//   //                   missingRequirements: me?.requirements || null,
//   //                 }),
//   //             },
//   //             { text: "Later", style: "cancel", onPress: () => goTo(target) },
//   //           ]
//   //         );
//   //         return;
//   //       }

//   //       // 2) Stripe present → check onboarding (non-blocking)
//   //       if (stripeAccountId) {
//   //         try {
//   //           const checkRes = await api.post("/routes/stripe/check-onboarding", {
//   //             stripeAccountId,
//   //           });

//   //           const {
//   //             needsOnboarding,
//   //             stripeOnboardingUrl,
//   //             stripeDashboardUrl,
//   //             requirements,
//   //           } = checkRes?.data || {};

//   //           if (needsOnboarding) {
//   //             setLoading(false);
//   //             Alert.alert(
//   //               "Finish Stripe Onboarding",
//   //               "To receive payouts, please finish Stripe onboarding. You can open Stripe now, or fix missing documents in your profile.",
//   //               [
//   //                 {
//   //                   text: "Open Stripe",
//   //                   onPress: async () => {
//   //                     const url = stripeOnboardingUrl || stripeDashboardUrl;
//   //                     await openUrlSafely(url);
//   //                     goTo(target);
//   //                   },
//   //                 },
//   //                 {
//   //                   text: "Fix in App",
//   //                   onPress: () =>
//   //                     goTo("ProviderProfile", {
//   //                       missingRequirements: requirements || null,
//   //                     }),
//   //                 },
//   //                 { text: "Later", style: "cancel", onPress: () => goTo(target) },
//   //               ]
//   //             );
//   //             return;
//   //           }
//   //         } catch {
//   //           // allow login anyway and nudge
//   //           setLoading(false);
//   //           Alert.alert(
//   //             "Stripe Check Unavailable",
//   //             "We couldn't check onboarding right now. You can proceed and finish setup from your profile."
//   //           );
//   //           goTo(target);
//   //           return;
//   //         }
//   //       } else {
//   //         // 3) No Stripe ID → allow login and gently direct to profile to connect
//   //         setLoading(false);
//   //         Alert.alert(
//   //           "Connect Payouts",
//   //           "To receive payouts, connect your Stripe account from your profile.",
//   //           [
//   //             { text: "Go to Profile", onPress: () => goTo("ProviderProfile") },
//   //             { text: "Later", style: "cancel", onPress: () => goTo(target) },
//   //           ]
//   //         );
//   //         return;
//   //       }

//   //       // 4) Stripe OK, but profile not complete → allow login with a nudge
//   //       if (isIncomplete) {
//   //         setLoading(false);
//   //         Alert.alert(
//   //           "Finish Account Setup",
//   //           "You're signed in, but your account isn't fully active yet. You can update your profile now or do it later.",
//   //           [
//   //             {
//   //               text: "Update Profile",
//   //               onPress: () =>
//   //                 goTo("ProviderProfile", {
//   //                   missingRequirements: me?.requirements || null,
//   //                 }),
//   //             },
//   //             { text: "Later", style: "cancel", onPress: () => goTo(target) },
//   //           ]
//   //         );
//   //         return;
//   //       }
//   //     }

//   //     // ====== Everyone else (or providers fully set) ======
//   //     setLoading(false);
//   //     goTo(target);
//   //   } catch (err) {
//   //     setLoading(false);
//   //     const msg =
//   //       err?.response?.data?.msg ||
//   //       err?.response?.data?.message ||
//   //       err?.message ||
//   //       "Login failed – check credentials.";
//   //     Alert.alert("Error", msg);
//   //   }
//   // };
//   const onSubmit = async () => {
//     try {
//       setLoading(true);

//       // clear stale tokens
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const tryLogin = async (emailToUse) => {
//         const creds = { email: emailToUse, password };
//         return api.post("/auth/login", creds, {
//           headers: { "Content-Type": "application/json" },
//         });
//       };

//       let loginRes = null;
//       let firstError = null;

//       // TRY 1: email exactly as typed
//       try {
//         loginRes = await tryLogin(email.trim());
//       } catch (err1) {
//         firstError = err1;
//         // TRY 2: fallback to lowercased email if it makes sense
//         if (shouldRetryLowercaseLogin(err1)) {
//           try {
//             loginRes = await tryLogin(email.trim().toLowerCase());
//           } catch (err2) {
//             throw err2; // show the real backend error after both attempts fail
//           }
//         } else {
//           throw err1;
//         }
//       }

//       const data = loginRes?.data;
//       if (!data?.token) throw new Error("Token missing from response");

//       // store tokens
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }

//       // set auth header for subsequent calls
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // get user doc to decide whether we can safely save push token
//       let me = null;
//       try {
//         const meRes = await api.get("/users/me");
//         me = meRes?.data?.user ?? meRes?.data ?? null;
//       } catch {
//         // ignore
//       }

//       // save (or stash) push token without blocking login
//       savePushTokenIfAllowed(me);

//       // read role + stripe account from token (fallback to /me)
//       const payload = parseJwt(data.token);
//       const role = (payload?.role || "customer");
//       const stripeAccountId =
//         payload?.stripeAccountId ||
//         me?.stripeAccountId ||
//         me?.stripe?.accountId ||
//         null;

//       // route target (don’t change your existing mapping)
//       setRole(role);
//       const target = roleToScreen(role);

//       // ---- Provider non-blocking setup prompts (unchanged behavior, just robust) ----
//       const isProvider = (role || "").toLowerCase() === "serviceprovider";
//       const isActive =
//         me?.independentContractorAgreement === true ||
//         me?.accountStatus === "active" ||
//         me?.isActive === true;
//       const isIncomplete = isProvider && !isActive;

//       if (isProvider) {
//         if (!stripeAccountId && isIncomplete) {
//           setLoading(false);
//           Alert.alert(
//             "Finish Setup",
//             "You're signed in. To start receiving jobs and payouts, please complete your profile and connect Stripe.",
//             [
//               {
//                 text: "Update Profile",
//                 onPress: () =>
//                   goTo("ProviderProfile", {
//                     missingRequirements: me?.requirements || null,
//                   }),
//               },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ]
//           );
//           return;
//         }

//         if (stripeAccountId) {
//           try {
//             const checkRes = await api.post("/routes/stripe/check-onboarding", {
//               stripeAccountId,
//             });

//             const {
//               needsOnboarding,
//               stripeOnboardingUrl,
//               stripeDashboardUrl,
//               requirements,
//             } = checkRes?.data || {};

//             if (needsOnboarding) {
//               setLoading(false);
//               Alert.alert(
//                 "Finish Stripe Onboarding",
//                 "To receive payouts, please finish Stripe onboarding. You can open Stripe now, or fix missing documents in your profile.",
//                 [
//                   {
//                     text: "Open Stripe",
//                     onPress: async () => {
//                       const url = stripeOnboardingUrl || stripeDashboardUrl;
//                       await openUrlSafely(url);
//                       goTo(target);
//                     },
//                   },
//                   {
//                     text: "Fix in App",
//                     onPress: () =>
//                       goTo("ProviderProfile", {
//                         missingRequirements: requirements || null,
//                       }),
//                   },
//                   { text: "Later", style: "cancel", onPress: () => goTo(target) },
//                 ]
//               );
//               return;
//             }
//           } catch {
//             setLoading(false);
//             Alert.alert(
//               "Stripe Check Unavailable",
//               "We couldn't check onboarding right now. You can proceed and finish setup from your profile."
//             );
//             goTo(target);
//             return;
//           }
//         } else {
//           setLoading(false);
//           Alert.alert(
//             "Connect Payouts",
//             "To receive payouts, connect your Stripe account from your profile.",
//             [
//               { text: "Go to Profile", onPress: () => goTo("ProviderProfile") },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ]
//           );
//           return;
//         }

//         if (isIncomplete) {
//           setLoading(false);
//           Alert.alert(
//             "Finish Account Setup",
//             "You're signed in, but your account isn't fully active yet. You can update your profile now or do it later.",
//             [
//               {
//                 text: "Update Profile",
//                 onPress: () =>
//                   goTo("ProviderProfile", {
//                     missingRequirements: me?.requirements || null,
//                   }),
//               },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ]
//           );
//           return;
//         }
//       }

//       // All good — go to dashboard
//       setLoading(false);
//       goTo(target);
//     } catch (err) {
//       setLoading(false);
//       const status = err?.response?.status;
//       const raw =
//         err?.response?.data?.msg ||
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";

//       // More helpful messages
//       let msg = raw;
//       if (status === 404 && raw.toLowerCase().includes("user")) {
//         msg = "We couldn’t find an account with that email.";
//       }
//       if (status === 401 && raw.toLowerCase().includes("invalid")) {
//         msg = "Invalid email or password.";
//       }
//       Alert.alert("Error", msg);
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
//                 onPress={() => navigation.navigate("RequestPasswordResetScreen")}
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
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
// import { useNavigation } from "@react-navigation/native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Buffer } from "buffer";

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";

// /* ---------- helpers ---------- */
// function parseJwt(token) {
//   if (!token) return null;
//   const base64Url = token.split(".")[1];
//   if (!base64Url) return null;
//   const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//   const binary =
//     typeof atob === "function" ? atob(base64) : Buffer.from(base64, "base64").toString("binary");
//   const jsonPayload = decodeURIComponent(
//     binary
//       .split("")
//       .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//       .join("")
//   );
//   return JSON.parse(jsonPayload);
// }

// function shouldRetryLowercaseLogin(err) {
//   const status = err?.response?.status;
//   const msg =
//     (err?.response?.data?.msg || err?.response?.data?.message || err?.message || "")
//       .toString()
//       .toLowerCase();
//   if (status === 404) return true;
//   if (msg.includes("user not found")) return true;
//   if (msg.includes("invalid credentials")) return true;
//   if (status === 400 && (msg.includes("email") || msg.includes("not found"))) return true;
//   return false;
// }

// function roleToScreen(role) {
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// // Minimal push registration (safe to fail quietly if not configured)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     return tokenData?.data || null;
//   } catch {
//     return null;
//   }
// }

// /** Save push token only if user is already active so we don't hit schema validation */
// async function savePushTokenIfAllowed(me) {
//   try {
//     const expoPush = await registerForPushNotificationsAsync();
//     if (!expoPush) return;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     const isActive =
//       me?.independentContractorAgreement === true ||
//       me?.accountStatus === "active" ||
//       me?.isActive === true;

//     if (isProvider && !isActive) {
//       await AsyncStorage.setItem("pendingPushToken", expoPush);
//       return;
//     }

//     await api.post("/users/push-token", { token: expoPush });
//     await AsyncStorage.removeItem("pendingPushToken");
//   } catch {
//     try {
//       const existing = await AsyncStorage.getItem("pendingPushToken");
//       if (!existing) {
//         const maybe = await registerForPushNotificationsAsync();
//         if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
//       }
//     } catch {}
//   }
// }

// /** Try to flush a previously stashed token (call this again later in dashboard/profile) */
// export async function flushPendingPushTokenIfReady() {
//   try {
//     const pending = await AsyncStorage.getItem("pendingPushToken");
//     if (!pending) return;
//     const meRes = await api.get("/users/me");
//     const me = meRes?.data?.user ?? meRes?.data ?? null;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     const isActive =
//       me?.independentContractorAgreement === true ||
//       me?.accountStatus === "active" ||
//       me?.isActive === true;

//     if (isProvider && !isActive) return;

//     await api.post("/users/push-token", { token: pending });
//     await AsyncStorage.removeItem("pendingPushToken");
//   } catch {
//     // swallow
//   }
// }

// /** Prefer backend flag; fallback to simple required-field/ICA heuristic */
// function computeProfileComplete(me) {
//   if (typeof me?.profileComplete === "boolean") return me.profileComplete;
//   const required = ["firstName", "lastName", "phone", "serviceType", "serviceZipcode"];
//   const basicsOk = required.every((k) => !!(me && me[k]));
//   const icaOk = me?.independentContractorAgreement === true || me?.icaAccepted === true;
//   return basicsOk && icaOk;
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /* ---------- side effects: permissions only ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         // Location
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
//       } catch {
//         // don't block login
//       }
//     })();
//   }, []);

//   /* ---------- helpers ---------- */
//   const openUrlSafely = async (url) => {
//     try {
//       if (url && (await Linking.canOpenURL(url))) {
//         await Linking.openURL(url);
//         return true;
//       }
//     } catch {}
//     Alert.alert("Error", "Could not open onboarding link.");
//     return false;
//   };

//   const goTo = (routeName, params = {}) => {
//     const action = { index: 0, routes: [{ name: routeName, params }] };
//     if (navigationRef?.isReady?.()) {
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     } else {
//       navigation.navigate(routeName, params);
//     }
//   };

//   /* ---------- handlers ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);

//       // clear stale tokens
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const tryLogin = async (emailToUse) => {
//         const creds = { email: emailToUse, password };
//         return api.post("/auth/login", creds, {
//           headers: { "Content-Type": "application/json" },
//         });
//       };

//       let loginRes = null;

//       // Try as typed
//       try {
//         loginRes = await tryLogin(email.trim());
//       } catch (err1) {
//         // If backend likely does case-sensitive lookup, retry lowercase
//         if (shouldRetryLowercaseLogin(err1)) {
//           loginRes = await tryLogin(email.trim().toLowerCase());
//         } else {
//           throw err1;
//         }
//       }

//       const data = loginRes?.data;
//       if (!data?.token) throw new Error("Token missing from response");

//       // store tokens
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) await AsyncStorage.setItem("refreshToken", data.refreshToken);

//       // set auth header for subsequent calls
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // fetch /me (for profile completeness & safe push-token save)
//       let me = null;
//       try {
//         const meRes = await api.get("/users/me");
//         me = meRes?.data?.user ?? meRes?.data ?? null;
//       } catch {
//         // ignore; still allow login
//       }

//       // save (or stash) push token without blocking login
//       savePushTokenIfAllowed(me);

//       // figure out role and stripe account id
//       const payload = parseJwt(data.token);
//       const role = payload?.role || "customer";
//       const stripeAccountId =
//         payload?.stripeAccountId || me?.stripeAccountId || me?.stripe?.accountId || null;

//       setRole(role);
//       const target = roleToScreen(role);

//       // ---------- Provider: check Stripe & profile (non-blocking) ----------
//       if ((role || "").toLowerCase() === "serviceprovider") {
//         const profileComplete = computeProfileComplete(me || {});
//         let stripeNeedsOnboarding = false;
//         let stripeOnboardingUrl = null;
//         let stripeDashboardUrl = null;
//         let requirements = null;

//         if (stripeAccountId) {
//           try {
//             const checkRes = await api.post("/routes/stripe/check-onboarding", {
//               stripeAccountId,
//             });
//             const r = checkRes?.data || {};
//             stripeNeedsOnboarding = !!r.needsOnboarding;
//             stripeOnboardingUrl = r.stripeOnboardingUrl || null;
//             stripeDashboardUrl = r.stripeDashboardUrl || null;
//             requirements = r.requirements || null;
//           } catch {
//             // If check fails, we'll still let them in and just offer profile update
//           }
//         } else {
//           // No account yet => needs onboarding
//           stripeNeedsOnboarding = true;
//         }

//         if (stripeNeedsOnboarding || !profileComplete) {
//           setLoading(false);

//           const parts = [];
//           if (stripeNeedsOnboarding) parts.push("Stripe payouts");
//           if (!profileComplete) parts.push("your profile");
//           const msg =
//             parts.length === 2
//               ? "Stripe payouts and your profile need attention."
//               : `${parts[0]} needs attention.`;

//           const buttons = [];

//           if (stripeNeedsOnboarding) {
//             if (stripeOnboardingUrl || stripeDashboardUrl) {
//               buttons.push({
//                 text: "Open Stripe",
//                 onPress: async () => {
//                   const url = stripeOnboardingUrl || stripeDashboardUrl;
//                   await openUrlSafely(url);
//                   goTo(target);
//                 },
//               });
//             } else {
//               // No link available → send to profile to connect payouts
//               buttons.push({
//                 text: "Connect Payouts",
//                 onPress: () => goTo("ProviderProfile"),
//               });
//             }
//           }

//           if (!profileComplete) {
//             buttons.push({
//               text: "Update Profile",
//               onPress: () =>
//                 goTo("ProviderProfile", {
//                   missingRequirements: requirements || me?.requirements || null,
//                 }),
//             });
//           }

//           buttons.push({ text: "Later", style: "cancel", onPress: () => goTo(target) });

//           Alert.alert("Finish Setup", msg + " You can do it now or later.", buttons);
//           return; // wait for user choice
//         }
//       }

//       // All good — go to dashboard
//       setLoading(false);
//       goTo(target);
//     } catch (err) {
//       setLoading(false);
//       const status = err?.response?.status;
//       const raw =
//         err?.response?.data?.msg ||
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";

//       let msg = raw;
//       if (status === 404 && raw.toLowerCase().includes("user")) {
//         msg = "We couldn’t find an account with that email.";
//       }
//       if (status === 401 && raw.toLowerCase().includes("invalid")) {
//         msg = "Invalid email or password.";
//       }
//       Alert.alert("Error", msg);
//     }
//   };

//   /* ---------- UI ---------- */
//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//             {/* Header */}
//             <View style={styles.header}>
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require("../assets/blinqfix_logo-new.jpeg")}
//                   style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={styles.title}>Login</Text>
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
//                 <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeIcon}>
//                   {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.forgotPasswordButton}
//                 onPress={() => navigation.navigate("RequestPasswordResetScreen")}
//               >
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Login Button */}
//             <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={loading}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.loginButtonGradient}>
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
//               <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
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
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 40 },
//   footerText: { color: "#e0e7ff", fontSize: 16 },
//   footerLink: { color: "#60a5fa", fontSize: 16, fontWeight: "bold", marginLeft: 6 },
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
//   trustText: { color: "#22c55e", marginLeft: 8, fontSize: 12, fontWeight: "500" },
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

// /* ---------- helpers ---------- */
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

// function shouldRetryLowercaseLogin(err) {
//   const status = err?.response?.status;
//   const msg = (
//     err?.response?.data?.msg ||
//     err?.response?.data?.message ||
//     err?.message ||
//     ""
//   )
//     .toString()
//     .toLowerCase();
//   if (status === 404) return true;
//   if (msg.includes("user not found")) return true;
//   if (msg.includes("invalid credentials")) return true;
//   if (status === 400 && (msg.includes("email") || msg.includes("not found")))
//     return true;
//   return false;
// }

// function roleToScreen(role) {
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider")
//     return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// // ----- field helpers & active/profile checks (NO hard dep on independentContractorAgreement) -----
// const getPhone = (me) =>
//   me?.phone ?? me?.phoneNumber ?? me?.contactPhone ?? null;
// const getZip = (me) =>
//   me?.serviceZipcode ?? me?.serviceZipCode ?? me?.zip ?? me?.zipcode ?? null;

// // Treat account as active if accepted or already flagged active — do NOT require ICA field
// function isAccountActive(me) {
//   return (
//     me?.acceptedICA === true || // new
//     me?.icaAccepted === true || // alias
//     me?.accountStatus === "active" ||
//     me?.isActive === true
//   );
// }

// // Prefer backend’s profileComplete; otherwise require basics + acceptance (acceptedICA/icaAccepted)
// function computeProfileComplete(me) {
//   if (typeof me?.profileComplete === "boolean") return me.profileComplete;
//   const required = [
//     me?.firstName,
//     me?.lastName,
//     getPhone(me),
//     me?.serviceType,
//     getZip(me),
//   ];
//   const basicsOk = required.every(Boolean);
//   const acceptedOk =
//     me?.acceptedICA === true || me?.icaAccepted === true || isAccountActive(me);
//   return basicsOk && acceptedOk;
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

//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     return tokenData?.data || null;
//   } catch {
//     return null;
//   }
// }

// /** Save push token only if user is active (no ICA:true requirement anymore) */
// async function savePushTokenIfAllowed(me) {
//   try {
//     const expoPush = await registerForPushNotificationsAsync();
//     if (!expoPush) return;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     if (isProvider && !isAccountActive(me)) {
//       await AsyncStorage.setItem("pendingPushToken", expoPush);
//       return;
//     }

//     await api.post("/users/push-token", { token: expoPush });
//     await AsyncStorage.removeItem("pendingPushToken");
//   } catch {
//     try {
//       const existing = await AsyncStorage.getItem("pendingPushToken");
//       if (!existing) {
//         const maybe = await registerForPushNotificationsAsync();
//         if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
//       }
//     } catch {}
//   }
// }

// /** Try to flush a previously stashed token (call later in dashboard/profile) */
// export async function flushPendingPushTokenIfReady() {
//   try {
//     const pending = await AsyncStorage.getItem("pendingPushToken");
//     if (!pending) return;
//     const meRes = await api.get("/users/me");
//     const me = meRes?.data?.user ?? meRes?.data ?? null;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     if (isProvider && !isAccountActive(me)) return;

//     await api.post("/users/push-token", { token: pending });
//     await AsyncStorage.removeItem("pendingPushToken");
//   } catch {
//     // swallow
//   }
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /* ---------- side effects: permissions only ---------- */
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
//       } catch {
//         // don't block login
//       }
//     })();
//   }, []);

//   /* ---------- helpers ---------- */
//   const openUrlSafely = async (url) => {
//     try {
//       if (url && (await Linking.canOpenURL(url))) {
//         await Linking.openURL(url);
//         return true;
//       }
//     } catch {}
//     Alert.alert("Error", "Could not open onboarding link.");
//     return false;
//   };

//   const goTo = (routeName, params = {}) => {
//     const action = { index: 0, routes: [{ name: routeName, params }] };
//     if (navigationRef?.isReady?.()) {
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     } else {
//       navigation.navigate(routeName, params);
//     }
//   };

//   /* ---------- handlers ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);

//       // clear stale tokens
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const tryLogin = async (emailToUse) => {
//         const creds = { email: emailToUse, password };
//         return api.post("/auth/login", creds, {
//           headers: { "Content-Type": "application/json" },
//         });
//       };

//       let loginRes = null;

//       // Try as typed
//       try {
//         loginRes = await tryLogin(email.trim());
//       } catch (err1) {
//         // fallback to lowercase if backend does case-sensitive lookup
//         if (shouldRetryLowercaseLogin(err1)) {
//           loginRes = await tryLogin(email.trim().toLowerCase());
//         } else {
//           throw err1;
//         }
//       }

//       const data = loginRes?.data;
//       if (!data?.token) throw new Error("Token missing from response");

//       // store tokens
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken)
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);

//       // set auth header for subsequent calls
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // fetch /me (for profile completeness & safe push-token save)
//       let me = null;
//       try {
//         const meRes = await api.get("/users/me");
//         me = meRes?.data?.user ?? meRes?.data ?? null;
//       } catch {
//         // ignore; still allow login
//       }

//       // save (or stash) push token without blocking login
//       savePushTokenIfAllowed(me);

//       // figure out role and stripe account id
//       const payload = parseJwt(data.token);
//       const role = payload?.role || "customer";
//       const stripeAccountId =
//         payload?.stripeAccountId ||
//         me?.stripeAccountId ||
//         me?.stripe?.accountId ||
//         null;

//       setRole(role);
//       const target = roleToScreen(role);

//       const isProvider = (role || "").toLowerCase() === "serviceprovider";

//       // treat these as signals the profile is ready enough
//       const profileComplete =
//         asBool(me?.acceptedICA) ||
//         asBool(me?.icaAccepted) ||
//         me?.accountStatus === "active" ||
//         me?.isActive === true;

//       // use this instead of your previous `isActive` / independentContractorAgreement check
//       const isIncomplete = isProvider && !profileComplete;

//       // ---------- Provider: check Stripe & profile (non-blocking) ----------
//       if ((role || "").toLowerCase() === "serviceprovider") {
//         const profileComplete = computeProfileComplete(me || {});
//         let stripeNeedsOnboarding = false;
//         let stripeOnboardingUrl = null;
//         let stripeDashboardUrl = null;
//         let requirements = null;

//         if (stripeAccountId) {
//           try {
//             const checkRes = await api.post("/routes/stripe/check-onboarding", {
//               stripeAccountId,
//             });
//             const r = checkRes?.data || {};
//             stripeNeedsOnboarding = !!r.needsOnboarding;
//             stripeOnboardingUrl = r.stripeOnboardingUrl || null;
//             stripeDashboardUrl = r.stripeDashboardUrl || null;
//             requirements = r.requirements || null;
//           } catch {
//             // allow login; we'll still offer profile update
//           }
//         } else {
//           // No account yet => needs onboarding
//           stripeNeedsOnboarding = true;
//         }

//         if (stripeNeedsOnboarding || !profileComplete) {
//           setLoading(false);

//           const parts = [];
//           if (stripeNeedsOnboarding) parts.push("Stripe payouts");
//           if (!profileComplete) parts.push("your profile");
//           const msg =
//             parts.length === 2
//               ? "Stripe payouts and your profile need attention."
//               : `${parts[0]} needs attention.`;

//           const buttons = [];

//           if (stripeNeedsOnboarding) {
//             if (stripeOnboardingUrl || stripeDashboardUrl) {
//               buttons.push({
//                 text: "Open Stripe",
//                 onPress: async () => {
//                   const url = stripeOnboardingUrl || stripeDashboardUrl;
//                   await openUrlSafely(url);
//                   goTo(target);
//                 },
//               });
//             } else {
//               buttons.push({
//                 text: "Connect Payouts",
//                 onPress: () => goTo("ProviderProfile"),
//               });
//             }
//           }

//           if (!profileComplete) {
//             buttons.push({
//               text: "Update Profile",
//               onPress: () =>
//                 goTo("ProviderProfile", {
//                   missingRequirements: requirements || me?.requirements || null,
//                 }),
//             });
//           }

//           buttons.push({
//             text: "Later",
//             style: "cancel",
//             onPress: () => goTo(target),
//           });

//           Alert.alert(
//             "Finish Setup",
//             msg + " You can do it now or later.",
//             buttons
//           );
//           return;
//         }
//       }

//       // All good — go to dashboard
//       setLoading(false);
//       goTo(target);
//     } catch (err) {
//       setLoading(false);
//       const status = err?.response?.status;
//       const raw =
//         err?.response?.data?.msg ||
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";

//       let msg = raw;
//       if (status === 404 && raw.toLowerCase().includes("user")) {
//         msg = "We couldn’t find an account with that email.";
//       }
//       if (status === 401 && raw.toLowerCase().includes("invalid")) {
//         msg = "Invalid email or password.";
//       }
//       Alert.alert("Error", msg);
//     }
//   };

//   /* ---------- UI ---------- */
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
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
// import { useNavigation } from "@react-navigation/native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Buffer } from "buffer";

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";

// /** ---------- helpers ---------- */
// const asBool = (v) => {
//   if (typeof v === "boolean") return v;
//   if (typeof v === "string") return v.toLowerCase() === "true";
//   return false;
// };

// const isProfileComplete = (me) =>
//   asBool(me?.acceptedICA) ||
//   asBool(me?.icaAccepted) ||
//   me?.accountStatus === "active" ||
//   me?.isActive === true;

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
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// // Minimal push registration (safe to fail quietly if not configured)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     return tokenData?.data || null;
//   } catch {
//     return null;
//   }
// }

// /** Save push token only if the account is already “ready” */
// async function savePushTokenIfAllowed(me) {
//   try {
//     const expoPush = await registerForPushNotificationsAsync();
//     if (!expoPush) return;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     if (isProvider && !isProfileComplete(me)) {
//       // stash for later; we'll flush after they complete documents
//       await AsyncStorage.setItem("pendingPushToken", expoPush);
//       return;
//     }

//     await api.post("/users/push-token", { token: expoPush });
//     await AsyncStorage.removeItem("pendingPushToken");
//   } catch {
//     try {
//       const expoPush = await AsyncStorage.getItem("pendingPushToken");
//       if (!expoPush) {
//         const maybe = await registerForPushNotificationsAsync();
//         if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
//       }
//     } catch {}
//   }
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /** ---------- one-time: permissions ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         // Location
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
//       } catch {
//         // permission checks shouldn't block login
//       }
//     })();
//   }, []);

//   /** ---------- helpers ---------- */
//   const openUrlSafely = async (url) => {
//     try {
//       if (url && (await Linking.canOpenURL(url))) {
//         await Linking.openURL(url);
//         return true;
//       }
//     } catch {}
//     Alert.alert("Error", "Could not open onboarding link.");
//     return false;
//   };

//   const goTo = (routeName, params = {}) => {
//     const action = { index: 0, routes: [{ name: routeName, params }] };
//     if (navigationRef?.isReady?.()) {
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     } else {
//       navigation.navigate(routeName, params);
//     }
//   };

//   /** ---------- LOGIN ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);

//       // Clear stale tokens
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const normalizedEmail = email.trim().toLowerCase();

//       // Send both email and username to be safe (backend can accept either)
//       const creds = { email: normalizedEmail, username: normalizedEmail, password };

//       // Login
//       const { data } = await api.post("/auth/login", creds, {
//         headers: { "Content-Type": "application/json" },
//       });

//       if (!data?.token) throw new Error("Token missing from response");

//       // Store tokens
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }

//       // Set auth header for subsequent calls
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // Load /me (do not assume payload has everything)
//       let me = null;
//       try {
//         const meRes = await api.get("/users/me");
//         me = meRes?.data?.user ?? meRes?.data ?? null;
//       } catch {
//         // continue anyway
//       }

//       // Save (or stash) push token without blocking login
//       savePushTokenIfAllowed(me);

//       // Role + Stripe account
//       const payload = parseJwt(data.token) || {};
//       const role = payload?.role || me?.role || "customer";
//       const stripeAccountId =
//         payload?.stripeAccountId ||
//         me?.stripeAccountId ||
//         me?.stripe?.accountId ||
//         null;

//       setRole(role);
//       const target = roleToScreen(role);

//       // Provider prompts (non-blocking)
//       const isProvider = (role || "").toLowerCase() === "serviceprovider";
//       const profileOk = isProfileComplete(me);

//       if (isProvider) {
//         // 1) No Stripe yet
//         if (!stripeAccountId) {
//           setLoading(false);
//           Alert.alert(
//             "Connect Payouts",
//             "To receive payouts, connect your Stripe account from your profile.",
//             [
//               { text: "Go to Profile", onPress: () => goTo("ProviderProfile") },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ]
//           );
//           return;
//         }

//         // 2) Stripe exists → check onboarding
//         try {
//           const checkRes = await api.post("/routes/stripe/check-onboarding", {
//             stripeAccountId,
//           });

//           const {
//             needsOnboarding,
//             stripeOnboardingUrl,
//             stripeDashboardUrl,
//             requirements,
//           } = checkRes?.data || {};

//           if (needsOnboarding) {
//             setLoading(false);
//             Alert.alert(
//               "Finish Stripe Onboarding",
//               "To receive payouts, please finish Stripe onboarding. You can open Stripe now, or fix missing documents in your profile.",
//               [
//                 {
//                   text: "Open Stripe",
//                   onPress: async () => {
//                     const url = stripeOnboardingUrl || stripeDashboardUrl;
//                     await openUrlSafely(url);
//                     goTo(target);
//                   },
//                 },
//                 {
//                   text: "Fix in App",
//                   onPress: () =>
//                     goTo("ProviderProfile", {
//                       missingRequirements: requirements || null,
//                     }),
//                 },
//                 { text: "Later", style: "cancel", onPress: () => goTo(target) },
//               ]
//             );
//             return;
//           }
//         } catch {
//           // continue with login; user can finish from profile later
//           setLoading(false);
//           Alert.alert(
//             "Stripe Check Unavailable",
//             "We couldn't check onboarding right now. You can proceed and finish setup from your profile."
//           );
//           goTo(target);
//           return;
//         }

//         // 3) Stripe OK but profile not fully marked active → nudge (non-blocking)
//         if (!profileOk) {
//           setLoading(false);
//           Alert.alert(
//             "Finish Account Setup",
//             "You're signed in, but your account isn't fully active yet. You can update your profile now or do it later.",
//             [
//               {
//                 text: "Update Profile",
//                 onPress: () =>
//                   goTo("ProviderProfile", {
//                     missingRequirements: me?.requirements || null,
//                   }),
//               },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ]
//           );
//           return;
//         }
//       }

//       // All good — go to dashboard
//       setLoading(false);
//       goTo(target);
//     } catch (err) {
//       setLoading(false);
//       const status = err?.response?.status;
//       const raw =
//         err?.response?.data?.msg ||
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";

//       let msg = raw;
//       if (status === 404 && raw.toLowerCase().includes("user")) {
//         msg = "We couldn’t find an account with that email.";
//       }
//       if (status === 401 && raw.toLowerCase().includes("invalid")) {
//         msg = "Invalid email or password.";
//       }
//       Alert.alert("Error", msg);
//     }
//   };

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//             {/* Header */}
//             <View style={styles.header}>
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require("../assets/blinqfix_logo-new.jpeg")}
//                   style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={styles.title}>Login</Text>
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
//                 <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeIcon}>
//                   {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.forgotPasswordButton}
//                 onPress={() => navigation.navigate("RequestPasswordResetScreen")}
//               >
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Login Button */}
//             <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={loading}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.loginButtonGradient}>
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
//               <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
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
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   trustText: { color: "#22c55e", marginLeft: 8, fontSize: 12, fontWeight: "500" },
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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
// import { useNavigation } from "@react-navigation/native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Buffer } from "buffer";

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";

// /** ---------- helpers ---------- */
// const asBool = (v) => {
//   if (typeof v === "boolean") return v;
//   if (typeof v === "string") return v.toLowerCase() === "true";
//   return false;
// };

// const isProfileComplete = (me) =>
//   // NOTE: we intentionally removed independentContractorAgreement:null checks
//   asBool(me?.acceptedICA) ||
//   asBool(me?.icaAccepted) ||
//   me?.accountStatus === "active" ||
//   me?.isActive === true;

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
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// // Minimal push registration (safe to fail quietly if not configured)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     return tokenData?.data || null;
//   } catch {
//     return null;
//   }
// }

// /** Save push token only if the account is already “ready” */
// async function savePushTokenIfAllowed(me) {
//   try {
//     const expoPush = await registerForPushNotificationsAsync();
//     if (!expoPush) return;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     if (isProvider && !isProfileComplete(me)) {
//       // stash for later; we'll flush after they complete documents
//       await AsyncStorage.setItem("pendingPushToken", expoPush);
//       return;
//     }

//     await api.post("/users/push-token", { token: expoPush });
//     await AsyncStorage.removeItem("pendingPushToken");
//   } catch {
//     try {
//       const expoPush = await AsyncStorage.getItem("pendingPushToken");
//       if (!expoPush) {
//         const maybe = await registerForPushNotificationsAsync();
//         if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
//       }
//     } catch {}
//   }
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [username, setUsername] = useState(""); // <-- username only
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /** ---------- one-time: permissions ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         // Location
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
//       } catch {
//         // permission checks shouldn't block login
//       }
//     })();
//   }, []);

//   /** ---------- helpers ---------- */
//   const openUrlSafely = async (url) => {
//     try {
//       if (url && (await Linking.canOpenURL(url))) {
//         await Linking.openURL(url);
//         return true;
//       }
//     } catch {}
//     Alert.alert("Error", "Could not open onboarding link.");
//     return false;
//   };

//   const goTo = (routeName, params = {}) => {
//     const action = { index: 0, routes: [{ name: routeName, params }] };
//     if (navigationRef?.isReady?.()) {
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     } else {
//       navigation.navigate(routeName, params);
//     }
//   };

//   /** ---------- LOGIN (username only) ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);

//       // Clear stale tokens
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const raw = username.trim();
//       if (!raw || !password) {
//         setLoading(false);
//         Alert.alert("Missing info", "Please enter your username and password.");
//         return;
//       }

//       // Try EXACT username first, then lowercase fallback
//       const attempts = [raw];
//       if (raw.toLowerCase() !== raw) attempts.push(raw.toLowerCase());

//       let data = null;
//       let lastErr = null;

//       for (const uname of attempts) {
//         try {
//           const res = await api.post(
//             "/auth/login",
//             { username: uname, password },
//             { headers: { "Content-Type": "application/json" } }
//           );
//           data = res?.data;
//           if (data?.token) break;
//         } catch (e) {
//           lastErr = e;
//         }
//       }

//       if (!data?.token) {
//         throw lastErr || new Error("Invalid username or password");
//       }

//       // Store tokens
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }

//       // Set auth header for subsequent calls
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // Load /me (do not assume payload has everything)
//       let me = null;
//       try {
//         const meRes = await api.get("/users/me");
//         me = meRes?.data?.user ?? meRes?.data ?? null;
//       } catch {
//         // continue anyway
//       }

//       // Save (or stash) push token without blocking login
//       savePushTokenIfAllowed(me);

//       // Role + Stripe account
//       const payload = parseJwt(data.token) || {};
//       const role = payload?.role || me?.role || "customer";
//       const stripeAccountId =
//         payload?.stripeAccountId ||
//         me?.stripeAccountId ||
//         me?.stripe?.accountId ||
//         null;

//       setRole(role);
//       const target = roleToScreen(role);

//       // Provider prompts (non-blocking)
//       const isProvider = (role || "").toLowerCase() === "serviceprovider";
//       const profileOk = isProfileComplete(me);

//       if (isProvider) {
//         // 1) No Stripe yet
//         if (!stripeAccountId) {
//           setLoading(false);
//           Alert.alert(
//             "Connect Payouts",
//             "To receive payouts, connect your Stripe account from your profile.",
//             [
//               { text: "Go to Profile", onPress: () => goTo("ProviderProfile") },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ]
//           );
//           return;
//         }

//         // 2) Stripe exists → check onboarding
//         try {
//           const checkRes = await api.post("/routes/stripe/check-onboarding", {
//             stripeAccountId,
//           });

//           const {
//             needsOnboarding,
//             stripeOnboardingUrl,
//             stripeDashboardUrl,
//             requirements,
//           } = checkRes?.data || {};

//           if (needsOnboarding) {
//             setLoading(false);
//             Alert.alert(
//               "Finish Stripe Onboarding",
//               "To receive payouts, please finish Stripe onboarding. You can open Stripe now, or fix missing documents in your profile.",
//               [
//                 {
//                   text: "Open Stripe",
//                   onPress: async () => {
//                     const url = stripeOnboardingUrl || stripeDashboardUrl;
//                     await openUrlSafely(url);
//                     goTo(target);
//                   },
//                 },
//                 {
//                   text: "Fix in App",
//                   onPress: () =>
//                     goTo("ProviderProfile", {
//                       missingRequirements: requirements || null,
//                     }),
//                 },
//                 { text: "Later", style: "cancel", onPress: () => goTo(target) },
//               ]
//             );
//             return;
//           }
//         } catch {
//           // continue with login; user can finish from profile later
//           setLoading(false);
//           Alert.alert(
//             "Stripe Check Unavailable",
//             "We couldn't check onboarding right now. You can proceed and finish setup from your profile."
//           );
//           goTo(target);
//           return;
//         }

//         // 3) Stripe OK but profile not fully marked active → nudge (non-blocking)
//         if (!profileOk) {
//           setLoading(false);
//           Alert.alert(
//             "Finish Account Setup",
//             "You're signed in, but your account isn't fully active yet. You can update your profile now or do it later.",
//             [
//               {
//                 text: "Update Profile",
//                 onPress: () =>
//                   goTo("ProviderProfile", {
//                     missingRequirements: me?.requirements || null,
//                   }),
//               },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ]
//           );
//           return;
//         }
//       }

//       // All good — go to dashboard
//       setLoading(false);
//       goTo(target);
//     } catch (err) {
//       setLoading(false);
//       const status = err?.response?.status;
//       const raw =
//         err?.response?.data?.msg ||
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";

//       let msg = raw;
//       const lower = (raw || "").toLowerCase();
//       if (status === 404 && (lower.includes("user") || lower.includes("username"))) {
//         msg = "We couldn’t find an account with that username.";
//       }
//       if (status === 401 && (lower.includes("invalid") || lower.includes("password"))) {
//         msg = "Invalid username or password.";
//       }
//       Alert.alert("Error", msg);
//     }
//   };

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//             {/* Header */}
//             <View style={styles.header}>
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require("../assets/blinqfix_logo-new.jpeg")}
//                   style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={styles.title}>Login</Text>
//               <Text style={styles.subtitle}>Enter your credentials to access your account</Text>
//             </View>

//             {/* Form */}
//             <View style={styles.formContainer}>
//               <View style={styles.inputContainer}>
//                 {/* Re-using Mail icon just as a leading icon; it's a username field */}
//                 <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Email"
//                   placeholderTextColor="#94a3b8"
//                   keyboardType="default"         // username, not email keyboard
//                   autoCapitalize="none"
//                   autoCorrect={false}
//                   autoComplete="username"        // tell OS it's a username
//                   value={username}
//                   onChangeText={setUsername}
//                   returnKeyType="next"
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
//                 <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeIcon}>
//                   {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.forgotPasswordButton}
//                 onPress={() => navigation.navigate("RequestPasswordResetScreen")}
//               >
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Login Button */}
//             <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={loading}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.loginButtonGradient}>
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
//               <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
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
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   trustText: { color: "#22c55e", marginLeft: 8, fontSize: 12, fontWeight: "500" },
// // });

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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
// import { useNavigation } from "@react-navigation/native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Buffer } from "buffer";

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";

// /** ---------- helpers ---------- */
// const asBool = (v) => {
//   if (typeof v === "boolean") return v;
//   if (typeof v === "string") return v.toLowerCase() === "true";
//   return false;
// };

// // Profile considered complete WITHOUT checking independentContractorAgreement:null
// const isProfileComplete = (me) =>
//   asBool(me?.acceptedICA) ||
//   asBool(me?.icaAccepted) ||
//   me?.accountStatus === "active" ||
//   me?.isActive === true;

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
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// // If the first login attempt fails in a way that suggests case mismatch or not-found,
// // retry with a lower-cased email.
// function shouldRetryLowercaseLogin(err) {
//   const status = err?.response?.status;
//   const msg =
//     (err?.response?.data?.msg || err?.response?.data?.message || err?.message || "")
//       .toString()
//       .toLowerCase();

//   if (status === 404) return true;
//   if (msg.includes("user not found")) return true;
//   if (msg.includes("invalid credentials")) return true;
//   if (status === 400 && (msg.includes("email") || msg.includes("not found"))) return true;

//   return false;
// }

// // Minimal push registration (safe to fail quietly if not configured)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     return tokenData?.data || null;
//   } catch {
//     return null;
//   }
// }

// /** Save push token only if the account is already “ready” */
// async function savePushTokenIfAllowed(me) {
//   try {
//     const expoPush = await registerForPushNotificationsAsync();
//     if (!expoPush) return;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     if (isProvider && !isProfileComplete(me)) {
//       await AsyncStorage.setItem("pendingPushToken", expoPush);
//       return;
//     }

//     await api.post("/users/push-token", { token: expoPush });
//     await AsyncStorage.removeItem("pendingPushToken");
//   } catch {
//     try {
//       const expoPush = await AsyncStorage.getItem("pendingPushToken");
//       if (!expoPush) {
//         const maybe = await registerForPushNotificationsAsync();
//         if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
//       }
//     } catch {}
//   }
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [email, setEmail] = useState("");    // <-- email only
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /** ---------- one-time: permissions ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         // Location
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
//       } catch {
//         // permission checks shouldn't block login
//       }
//     })();
//   }, []);

//   /** ---------- helpers ---------- */
//   const openUrlSafely = async (url) => {
//     try {
//       if (url && (await Linking.canOpenURL(url))) {
//         await Linking.openURL(url);
//         return true;
//       }
//     } catch {}
//     Alert.alert("Error", "Could not open onboarding link.");
//     return false;
//   };

//   const goTo = (routeName, params = {}) => {
//     const action = { index: 0, routes: [{ name: routeName, params }] };
//     if (navigationRef?.isReady?.()) {
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     } else {
//       navigation.navigate(routeName, params);
//     }
//   };

//   /** ---------- LOGIN (email only) ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);

//       // Clear stale tokens
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const typed = email.trim();
//       if (!typed || !password) {
//         setLoading(false);
//         Alert.alert("Missing info", "Please enter your email and password.");
//         return;
//       }

//       const tryLogin = async (emailToUse) =>
//         api.post(
//           "/auth/login",
//           { email: emailToUse, password }, // <-- ONLY email + password
//           { headers: { "Content-Type": "application/json" } }
//         );

//       let loginRes = null;

//       // TRY 1: email exactly as typed
//       try {
//         loginRes = await tryLogin(typed);
//       } catch (err1) {
//         // TRY 2: fallback to lowercased email if backend hints not-found/invalid
//         if (shouldRetryLowercaseLogin(err1)) {
//           loginRes = await tryLogin(typed.toLowerCase());
//         } else {
//           throw err1;
//         }
//       }

//       const data = loginRes?.data;
//       if (!data?.token) throw new Error("Token missing from response");

//       // Store tokens
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }

//       // Set auth header for subsequent calls
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // Load /me (do not assume payload has everything)
//       let me = null;
//       try {
//         const meRes = await api.get("/users/me");
//         me = meRes?.data?.user ?? meRes?.data ?? null;
//       } catch {
//         // continue anyway
//       }

//       // Save (or stash) push token without blocking login
//       savePushTokenIfAllowed(me);

//       // Role + Stripe account
//       const payload = parseJwt(data.token) || {};
//       const role = payload?.role || me?.role || "customer";
//       const stripeAccountId =
//         payload?.stripeAccountId ||
//         me?.stripeAccountId ||
//         me?.stripe?.accountId ||
//         null;

//       setRole(role);
//       const target = roleToScreen(role);

//       // Provider prompts (non-blocking)
//       const isProvider = (role || "").toLowerCase() === "serviceprovider";
//       const profileOk = isProfileComplete(me);

//       if (isProvider) {
//         // 1) No Stripe yet
//         if (!stripeAccountId) {
//           setLoading(false);
//           Alert.alert(
//             "Connect Payouts",
//             "To receive payouts, connect your Stripe account from your profile.",
//             [
//               { text: "Go to Profile", onPress: () => goTo("ProviderProfile") },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ]
//           );
//           return;
//         }

//         // 2) Stripe exists → check onboarding
//         try {
//           const checkRes = await api.post("/routes/stripe/check-onboarding", {
//             stripeAccountId,
//           });

//           const {
//             needsOnboarding,
//             stripeOnboardingUrl,
//             stripeDashboardUrl,
//             requirements,
//           } = checkRes?.data || {};

//           if (needsOnboarding) {
//             setLoading(false);
//             Alert.alert(
//               "Finish Stripe Onboarding",
//               "To receive payouts, please finish Stripe onboarding. You can open Stripe now, or fix missing documents in your profile.",
//               [
//                 {
//                   text: "Open Stripe",
//                   onPress: async () => {
//                     const url = stripeOnboardingUrl || stripeDashboardUrl;
//                     await openUrlSafely(url);
//                     goTo(target);
//                   },
//                 },
//                 {
//                   text: "Fix in App",
//                   onPress: () =>
//                     goTo("ProviderProfile", {
//                       missingRequirements: requirements || null,
//                     }),
//                 },
//                 { text: "Later", style: "cancel", onPress: () => goTo(target) },
//               ]
//             );
//             return;
//           }
//         } catch {
//           // continue with login; user can finish from profile later
//           setLoading(false);
//           Alert.alert(
//             "Stripe Check Unavailable",
//             "We couldn't check onboarding right now. You can proceed and finish setup from your profile."
//           );
//           goTo(target);
//           return;
//         }

//         // 3) Stripe OK but profile not fully marked active → nudge (non-blocking)
//         if (!profileOk) {
//           setLoading(false);
//           Alert.alert(
//             "Finish Account Setup",
//             "You're signed in, but your account isn't fully active yet. You can update your profile now or do it later.",
//             [
//               {
//                 text: "Update Profile",
//                 onPress: () =>
//                   goTo("ProviderProfile", {
//                     missingRequirements: me?.requirements || null,
//                   }),
//               },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ]
//           );
//           return;
//         }
//       }

//       // All good — go to dashboard
//       setLoading(false);
//       goTo(target);
//     } catch (err) {
//       setLoading(false);
//       const status = err?.response?.status;
//       const raw =
//         err?.response?.data?.msg ||
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";

//       let msg = raw;
//       const lower = (raw || "").toLowerCase();
//       if (status === 404 && (lower.includes("user") || lower.includes("email"))) {
//         msg = "We couldn’t find an account with that email.";
//       }
//       if (status === 401 && (lower.includes("invalid") || lower.includes("password"))) {
//         msg = "Invalid email or password.";
//       }
//       Alert.alert("Error", msg);
//     }
//   };

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//             {/* Header */}
//             <View style={styles.header}>
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require("../assets/blinqfix_logo-new.jpeg")}
//                   style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={styles.title}>Login</Text>
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
//                   autoCorrect={false}
//                   autoComplete="email"
//                   value={email}
//                   onChangeText={setEmail}
//                   returnKeyType="next"
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
//                 <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeIcon}>
//                   {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.forgotPasswordButton}
//                 onPress={() => navigation.navigate("RequestPasswordResetScreen")}
//               >
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Login Button */}
//             <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={loading}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.loginButtonGradient}>
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
//               <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
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
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   trustText: { color: "#22c55e", marginLeft: 8, fontSize: 12, fontWeight: "500" },
// });


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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
// import { useNavigation } from "@react-navigation/native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Buffer } from "buffer";

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";

// /** ---------- helpers ---------- */
// const asBool = (v) => {
//   if (typeof v === "boolean") return v;
//   if (typeof v === "string") return v.toLowerCase() === "true";
//   return false;
// };

// // Profile considered complete WITHOUT checking independentContractorAgreement:null
// const isProfileComplete = (me) =>
//   asBool(me?.acceptedICA) ||
//   asBool(me?.icaAccepted) ||
//   me?.accountStatus === "active" ||
//   me?.isActive === true;

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
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// function shouldRetryLowercaseLogin(err) {
//   const status = err?.response?.status;
//   const msg =
//     (err?.response?.data?.msg || err?.response?.data?.message || err?.message || "")
//       .toString()
//       .toLowerCase();

//   if (status === 404) return true;
//   if (msg.includes("user not found")) return true;
//   if (msg.includes("invalid credentials")) return true;
//   if (status === 400 && (msg.includes("email") || msg.includes("not found"))) return true;
//   return false;
// }

// // Minimal push registration (safe to fail quietly if not configured)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     console.log("📮 Expo push token acquired?", !!tokenData?.data);
//     return tokenData?.data || null;
//   } catch (e) {
//     console.log("❌ registerForPushNotificationsAsync failed:", e?.message);
//     return null;
//   }
// }

// /** Save push token only if the account is already “ready” */
// async function savePushTokenIfAllowed(me) {
//   try {
//     const expoPush = await registerForPushNotificationsAsync();
//     if (!expoPush) return;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     if (isProvider && !isProfileComplete(me)) {
//       console.log("🟡 Stashing push token until profile complete.");
//       await AsyncStorage.setItem("pendingPushToken", expoPush);
//       return;
//     }

//     await api.post("/users/push-token", { token: expoPush });
//     await AsyncStorage.removeItem("pendingPushToken");
//     console.log("✅ Push token sent to backend and stored.");
//   } catch (e) {
//     console.log("⚠️ Failed to send push token, will stash:", e?.response?.data || e?.message);
//     try {
//       const already = await AsyncStorage.getItem("pendingPushToken");
//       if (!already) {
//         const maybe = await registerForPushNotificationsAsync();
//         if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
//       }
//     } catch {}
//   }
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [email, setEmail] = useState(""); // email only
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /** ---------- one-time: permissions ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         const { status: locStatus } = await Location.getForegroundPermissionsAsync();
//         console.log("📍 Location permission:", locStatus);
//         if (locStatus !== "granted") {
//           const { status } = await Location.requestForegroundPermissionsAsync();
//           console.log("📍 Location permission requested ->", status);
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
//         console.log("🔔 Notification permission:", notifPerm?.status);
//         if (notifPerm.status !== "granted") {
//           const req = await Notifications.requestPermissionsAsync();
//           console.log("🔔 Notification permission requested ->", req?.status);
//         }
//       } catch (e) {
//         console.log("⚠️ Permission setup error:", e?.message);
//       }
//     })();
//   }, []);

//   const openUrlSafely = async (url) => {
//     try {
//       if (url && (await Linking.canOpenURL(url))) {
//         await Linking.openURL(url);
//         return true;
//       }
//     } catch (e) {
//       console.log("❌ openUrlSafely error:", e?.message, url);
//     }
//     Alert.alert("Error", "Could not open onboarding link.");
//     return false;
//   };

//   const goTo = (routeName, params = {}) => {
//     console.log("🧭 Navigating to", routeName, "params:", params);
//     const action = { index: 0, routes: [{ name: routeName, params }] };
//     if (navigationRef?.isReady?.()) {
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     } else {
//       navigation.navigate(routeName, params);
//     }
//   };

//   /** ---------- LOGIN (email only) ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);
//       console.log("🔑 Login pressed.");

//       // Clear stale tokens
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const typed = email.trim();
//       if (!typed || !password) {
//         setLoading(false);
//         Alert.alert("Missing info", "Please enter your email and password.");
//         return;
//       }

//       const tryLogin = async (emailToUse, label) => {
//         // Log safely (no password)
//         console.log("➡️ POST /auth/login", {
//           email: emailToUse,
//           attempt: label,
//           passwordLength: String(password).length,
//         });
//         // IMPORTANT: send the REAL password here
//         return api.post(
//           "/auth/login",
//           { email: emailToUse, password }, // ✅ fixed: real password
//           { headers: { "Content-Type": "application/json" } }
//         );
//       };

//       let loginRes = null;

//       // TRY 1: email exactly as typed
//       try {
//         loginRes = await tryLogin(typed, "typed");
//       } catch (err1) {
//         const status = err1?.response?.status;
//         console.log("❌ Login attempt #1 failed:", {
//           status,
//           data: err1?.response?.data,
//           message: err1?.message,
//         });

//         if (shouldRetryLowercaseLogin(err1)) {
//           const lower = typed.toLowerCase();
//           console.log("↪️ Retrying with lowercased email:", lower);
//           try {
//             loginRes = await tryLogin(lower, "lowercased");
//           } catch (err2) {
//             console.log("❌ Login attempt #2 failed:", {
//               status: err2?.response?.status,
//               data: err2?.response?.data,
//               message: err2?.message,
//             });
//             throw err2;
//           }
//         } else {
//           throw err1;
//         }
//       }

//       const data = loginRes?.data;
//       console.log("✅ Login response keys:", Object.keys(data || {}));
//       if (!data?.token) throw new Error("Token missing from response");

//       // Store tokens
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }
//       console.log("🔒 Tokens stored. token.len:", data.token?.length, "refresh?", !!data.refreshToken);

//       // Set auth header for subsequent calls
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // Load /me
//       let me = null;
//       try {
//         const meRes = await api.get("/users/me");
//         me = meRes?.data?.user ?? meRes?.data ?? null;
//         console.log("👤 /users/me loaded:", {
//           id: me?._id,
//           role: me?.role,
//           email: me?.email,
//           acceptedICA: me?.acceptedICA,
//           icaAccepted: me?.icaAccepted,
//           accountStatus: me?.accountStatus,
//           isActive: me?.isActive,
//           stripeAccountId: me?.stripeAccountId || me?.stripe?.accountId || null,
//         });
//       } catch (e) {
//         console.log("⚠️ /users/me failed:", e?.response?.data || e?.message);
//       }

//       // Save (or stash) push token without blocking login
//       await savePushTokenIfAllowed(me);

//       // Role + Stripe account
//       const payload = parseJwt(data.token) || {};
//       const role = payload?.role || me?.role || "customer";
//       const stripeAccountId =
//         payload?.stripeAccountId ||
//         me?.stripeAccountId ||
//         me?.stripe?.accountId ||
//         null;

//       console.log("🎭 Derived auth:", {
//         role,
//         stripeAccountId,
//         jwtKeys: Object.keys(payload || {}),
//       });

//       setRole(role);
//       const target = roleToScreen(role);

//       // Provider prompts (non-blocking)
//       const isProvider = (role || "").toLowerCase() === "serviceprovider";
//       const profileOk = isProfileComplete(me);
//       console.log("🧩 Profile completeness:", {
//         isProvider,
//         profileOk,
//         acceptedICA: me?.acceptedICA,
//         icaAccepted: me?.icaAccepted,
//         accountStatus: me?.accountStatus,
//         isActive: me?.isActive,
//       });

//       if (isProvider) {
//         if (!stripeAccountId) {
//           setLoading(false);
//           console.log("💳 No Stripe account on file.");
//           Alert.alert(
//             "Connect Payouts",
//             "To receive payouts, connect your Stripe account from your profile.",
//             [
//               { text: "Go to Profile", onPress: () => goTo("ProviderProfile") },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ]
//           );
//           return;
//         }

//         // Check onboarding
//         try {
//           console.log("🔎 Checking Stripe onboarding…");
//           const checkRes = await api.post("/routes/stripe/check-onboarding", {
//             stripeAccountId,
//           });
//           const {
//             needsOnboarding,
//             stripeOnboardingUrl,
//             stripeDashboardUrl,
//             requirements,
//           } = checkRes?.data || {};
//           console.log("🔎 Stripe onboarding result:", {
//             needsOnboarding,
//             hasOnboardingUrl: !!stripeOnboardingUrl,
//             hasDashboardUrl: !!stripeDashboardUrl,
//             requirements,
//           });

//           if (needsOnboarding) {
//             setLoading(false);
//             Alert.alert(
//               "Finish Stripe Onboarding",
//               "To receive payouts, please finish Stripe onboarding. You can open Stripe now, or fix missing documents in your profile.",
//               [
//                 {
//                   text: "Open Stripe",
//                   onPress: async () => {
//                     const url = stripeOnboardingUrl || stripeDashboardUrl;
//                     await openUrlSafely(url);
//                     goTo(target);
//                   },
//                 },
//                 {
//                   text: "Fix in App",
//                   onPress: () =>
//                     goTo("ProviderProfile", {
//                       missingRequirements: requirements || null,
//                     }),
//                 },
//                 { text: "Later", style: "cancel", onPress: () => goTo(target) },
//               ]
//             );
//             return;
//           }
//         } catch (e) {
//           console.log("⚠️ Stripe check failed:", e?.response?.data || e?.message);
//           setLoading(false);
//           Alert.alert(
//             "Stripe Check Unavailable",
//             "We couldn't check onboarding right now. You can proceed and finish setup from your profile."
//           );
//           goTo(target);
//           return;
//         }

//         if (!profileOk) {
//           setLoading(false);
//           console.log("🟠 Stripe OK, but profile not fully active.");
//           Alert.alert(
//             "Finish Account Setup",
//             "You're signed in, but your account isn't fully active yet. You can update your profile now or do it later.",
//             [
//               {
//                 text: "Update Profile",
//                 onPress: () =>
//                   goTo("ProviderProfile", {
//                     missingRequirements: me?.requirements || null,
//                   }),
//               },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ]
//           );
//           return;
//         }
//       }

//       // All good — go to dashboard
//       setLoading(false);
//       console.log("✅ Login complete →", target);
//       goTo(target);
//     } catch (err) {
//       setLoading(false);
//       const status = err?.response?.status;
//       const raw =
//         err?.response?.data?.msg ||
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";

//       console.log("💥 Login failure:", {
//         status,
//         data: err?.response?.data,
//         message: err?.message,
//       });

//       let msg = raw;
//       const lower = (raw || "").toLowerCase();
//       if (status === 404 && (lower.includes("user") || lower.includes("email"))) {
//         msg = "We couldn’t find an account with that email.";
//       }
//       if (status === 401 && (lower.includes("invalid") || lower.includes("password"))) {
//         msg = "Invalid email or password.";
//       }
//       Alert.alert("Error", msg);
//     }
//   };

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//             {/* Header */}
//             <View style={styles.header}>
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require("../assets/blinqfix_logo-new.jpeg")}
//                   style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={styles.title}>Login</Text>
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
//                   autoCorrect={false}
//                   autoComplete="email"
//                   value={email}
//                   onChangeText={setEmail}
//                   returnKeyType="next"
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
//                 <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeIcon}>
//                   {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.forgotPasswordButton}
//                 onPress={() => navigation.navigate("RequestPasswordResetScreen")}
//               >
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Login Button */}
//             <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={loading}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.loginButtonGradient}>
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
//               <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
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
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   trustText: { color: "#22c55e", marginLeft: 8, fontSize: 12, fontWeight: "500" },
// });

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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
// import { useNavigation } from "@react-navigation/native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Buffer } from "buffer";

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";

// /** ---------- helpers ---------- */
// const asBool = (v) => {
//   if (typeof v === "boolean") return v;
//   if (typeof v === "number") return v === 1;
//   if (typeof v === "string") {
//     const s = v.trim().toLowerCase();
//     return s === "true" || s === "1" || s === "yes" || s === "y";
//   }
//   return false;
// };
// const has = (v) =>
//   v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "");
// const hasDoc = (d) => {
//   if (!d) return false;
//   if (typeof d === "string") return d.trim().length > 0;
//   if (typeof d === "object") {
//     // urls or stored file objects
//     if (typeof d.url === "string" && d.url.trim()) return true;
//     if (typeof d.location === "string" && d.location.trim()) return true;
//     if (typeof d.uri === "string" && d.uri.trim()) return true;
//     if (typeof d.path === "string" && d.path.trim()) return true;
//   }
//   return false;
// };

// const pickEmail = (me) =>
//   me?.email ||
//   me?.username || // some backends store email here
//   me?.contact?.email ||
//   me?.primaryEmail ||
//   (Array.isArray(me?.emails) ? me.emails[0] : "") ||
//   me?.profile?.email ||
//   me?.account?.email ||
//   "";

// const pickPhone = (me) =>
//   me?.phoneNumber ||
//   me?.phone_number ||
//   me?.phone ||
//   me?.mobile ||
//   me?.cell ||
//   me?.contact?.phoneNumber ||
//   me?.contact?.phone ||
//   "";

// const pickZip = (me) => {
//   const first = (v) =>
//     Array.isArray(v) ? String(v[0] ?? "").trim() : String(v ?? "").trim();
//   return first(me?.serviceZipcode) || first(me?.zipcode);
// };

// const pickIcaViewed = (me) =>
//   asBool(me?.icaViewed) ||
//   asBool(me?.independentContractorAgreement?.viewed) ||
//   asBool(me?.independentContractorAgreement?.seen);

// const pickICA = (me) =>
//   asBool(me?.acceptedICA) ||
//   asBool(me?.icaAccepted) ||
//   asBool(me?.independentContractorAgreement?.accepted) ||
//   asBool(me?.independentContractorAgreement?.signed) ||
//   asBool(me?.independentContractorAgreement?.completed);

// const pickSmsOptIn = (me) =>
//   asBool(me?.acceptSMS) ||
//   asBool(me?.acceptsSms) ||
//   asBool(me?.smsOptIn) ||
//   asBool(me?.smsConsent) ||
//   asBool(me?.smsAgreed);

// // Strict provider readiness per your rules
// function computeProviderReadiness(
//   me,
//   stripeInfo = { accountId: null, needsOnboarding: null }
// ) {
//   const email = pickEmail(me);
//   const phone = pickPhone(me);
//   const zipcode = pickZip(me);

//   const requiredFieldsOk =
//     has(email) &&
//     has(phone) &&
//     has(me?.serviceType) &&
//     has(me?.businessName) &&
//     has(me?.address) &&
//     has(zipcode);

//   // documents = w9 + businessLicense + proofOfInsurance + ICA viewed + ICA accepted
//   const icaViewed = pickIcaViewed(me);
//   const icaAccepted = pickICA(me);
//   const requiredDocsOk =
//     hasDoc(me?.w9) &&
//     hasDoc(me?.businessLicense) &&
//     hasDoc(me?.proofOfInsurance) &&
//     (typeof icaViewed === "boolean" ? icaViewed : true) && // if backend sends it, require true; otherwise don't block
//     icaAccepted;

//   const smsOk = pickSmsOptIn(me);

//   const stripeComplete =
//     !!stripeInfo?.accountId && stripeInfo?.needsOnboarding === false;

//   const profileOk = requiredFieldsOk && requiredDocsOk;
//   const overallOk = stripeComplete && profileOk && smsOk;

//   return {
//     overallOk,
//     stripeComplete,
//     profileOk,
//     smsOk,
//     missing: {
//       stripe: !stripeComplete,
//       fields: !requiredFieldsOk,
//       docs: !requiredDocsOk,
//       sms: !smsOk,
//     },
//   };
// }

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
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// function shouldRetryLowercaseLogin(err) {
//   const status = err?.response?.status;
//   const msg =
//     (err?.response?.data?.msg || err?.response?.data?.message || err?.message || "")
//       .toString()
//       .toLowerCase();

//   if (status === 404) return true;
//   if (msg.includes("user not found")) return true;
//   if (msg.includes("invalid credentials")) return true;
//   if (status === 400 && (msg.includes("email") || msg.includes("not found"))) return true;
//   return false;
// }

// // Minimal push registration (safe to fail quietly if not configured)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     console.log("📮 Expo push token acquired?", !!tokenData?.data);
//     return tokenData?.data || null;
//   } catch (e) {
//     console.log("❌ registerForPushNotificationsAsync failed:", e?.message);
//     return null;
//   }
// }

// /** Save push token only if the account is already “ready” */
// async function savePushTokenIfAllowed(me) {
//   try {
//     const expoPush = await registerForPushNotificationsAsync();
//     if (!expoPush) return;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     // We'll stash until fully ready (Stripe + docs + SMS), but we don't block login.
//     if (isProvider) {
//       await AsyncStorage.setItem("pendingPushToken", expoPush);
//       return;
//     }

//     await api.post("/users/push-token", { token: expoPush });
//     await AsyncStorage.removeItem("pendingPushToken");
//     console.log("✅ Push token sent to backend and stored.");
//   } catch (e) {
//     console.log("⚠️ Failed to send push token, will stash:", e?.response?.data || e?.message);
//     try {
//       const already = await AsyncStorage.getItem("pendingPushToken");
//       if (!already) {
//         const maybe = await registerForPushNotificationsAsync();
//         if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
//       }
//     } catch {}
//   }
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [email, setEmail] = useState(""); // email only
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /** ---------- one-time: permissions ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         const { status: locStatus } = await Location.getForegroundPermissionsAsync();
//         console.log("📍 Location permission:", locStatus);
//         if (locStatus !== "granted") {
//           const { status } = await Location.requestForegroundPermissionsAsync();
//           console.log("📍 Location permission requested ->", status);
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
//         console.log("🔔 Notification permission:", notifPerm?.status);
//         if (notifPerm.status !== "granted") {
//           const req = await Notifications.requestPermissionsAsync();
//           console.log("🔔 Notification permission requested ->", req?.status);
//         }
//       } catch (e) {
//         console.log("⚠️ Permission setup error:", e?.message);
//       }
//     })();
//   }, []);

//   const openUrlSafely = async (url) => {
//     try {
//       if (url && (await Linking.canOpenURL(url))) {
//         await Linking.openURL(url);
//         return true;
//       }
//     } catch (e) {
//       console.log("❌ openUrlSafely error:", e?.message, url);
//     }
//     Alert.alert("Error", "Could not open onboarding link.");
//     return false;
//   };

//   const goTo = (routeName, params = {}) => {
//     console.log("🧭 Navigating to", routeName, "params:", params);
//     const action = { index: 0, routes: [{ name: routeName, params }] };
//     if (navigationRef?.isReady?.()) {
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     } else {
//       navigation.navigate(routeName, params);
//     }
//   };

//   /** ---------- LOGIN (email only) ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);
//       console.log("🔑 Login pressed.");

//       // Clear stale tokens
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const typed = email.trim();
//       if (!typed || !password) {
//         setLoading(false);
//         Alert.alert("Missing info", "Please enter your email and password.");
//         return;
//       }

//       const tryLogin = async (emailToUse, label) => {
//         console.log("➡️ POST /auth/login", {
//           email: emailToUse,
//           attempt: label,
//           passwordLength: String(password).length,
//         });
//         return api.post(
//           "/auth/login",
//           { email: emailToUse, password },
//           { headers: { "Content-Type": "application/json" } }
//         );
//       };

//       let loginRes = null;

//       // TRY 1: email exactly as typed
//       try {
//         loginRes = await tryLogin(typed, "typed");
//       } catch (err1) {
//         const status = err1?.response?.status;
//         console.log("❌ Login attempt #1 failed:", {
//           status,
//           data: err1?.response?.data,
//           message: err1?.message,
//         });

//         if (shouldRetryLowercaseLogin(err1)) {
//           const lower = typed.toLowerCase();
//           console.log("↪️ Retrying with lowercased email:", lower);
//           try {
//             loginRes = await tryLogin(lower, "lowercased");
//           } catch (err2) {
//             console.log("❌ Login attempt #2 failed:", {
//               status: err2?.response?.status,
//               data: err2?.response?.data,
//               message: err2?.message,
//             });
//             throw err2;
//           }
//         } else {
//           throw err1;
//         }
//       }

//       const data = loginRes?.data;
//       console.log("✅ Login response keys:", Object.keys(data || {}));
//       if (!data?.token) throw new Error("Token missing from response");

//       // Store tokens
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }
//       console.log("🔒 Tokens stored. token.len:", data.token?.length, "refresh?", !!data.refreshToken);

//       // Set auth header for subsequent calls
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // Load /me
//       let me = null;
//       try {
//         const meRes = await api.get("/users/me");
//         me = meRes?.data?.user ?? meRes?.data ?? null;
//         console.log("👤 /users/me loaded:", {
//           id: me?._id,
//           role: me?.role,
//           email: me?.email,
//           username: me?.username,
//           phoneNumber: me?.phoneNumber,
//           acceptedICA: me?.acceptedICA,
//           icaAccepted: me?.icaAccepted,
//           sms: pickSmsOptIn(me),
//           accountStatus: me?.accountStatus,
//           isActive: me?.isActive,
//           stripeAccountId: me?.stripeAccountId || me?.stripe?.accountId || null,
//           docs: {
//             w9: !!me?.w9,
//             businessLicense: !!me?.businessLicense,
//             proofOfInsurance: !!me?.proofOfInsurance,
//           },
//         });
//       } catch (e) {
//         console.log("⚠️ /users/me failed:", e?.response?.data || e?.message);
//       }

//       // Save (or stash) push token without blocking login
//       await savePushTokenIfAllowed(me);

//       // Role + Stripe account
//       const payload = parseJwt(data.token) || {};
//       const role = payload?.role || me?.role || "customer";
//       const stripeAccountId =
//         payload?.stripeAccountId ||
//         me?.stripeAccountId ||
//         me?.stripe?.accountId ||
//         null;

//       console.log("🎭 Derived auth:", {
//         role,
//         stripeAccountId,
//         jwtKeys: Object.keys(payload || {}),
//       });

//       setRole(role);
//       const target = roleToScreen(role);

//       // Provider prompts per new rules
//       const isProvider = (role || "").toLowerCase() === "serviceprovider";

//       if (isProvider) {
//         if (!stripeAccountId) {
//           setLoading(false);
//           console.log("💳 No Stripe account on file.");
//           Alert.alert(
//             "Connect Payouts",
//             "To receive payouts, connect your Stripe account from your profile.",
//             [
//               { text: "Go to Profile", onPress: () => goTo("ProviderProfile") },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ]
//           );
//           return;
//         }

//         // Check onboarding
//         let needsOnboarding = null;
//         let stripeOnboardingUrl = null;
//         let stripeDashboardUrl = null;
//         let requirements = null;

//         try {
//           console.log("🔎 Checking Stripe onboarding…");
//           const checkRes = await api.post("/routes/stripe/check-onboarding", {
//             stripeAccountId,
//           });
//           needsOnboarding = checkRes?.data?.needsOnboarding ?? null;
//           stripeOnboardingUrl = checkRes?.data?.stripeOnboardingUrl ?? null;
//           stripeDashboardUrl = checkRes?.data?.stripeDashboardUrl ?? null;
//           requirements = checkRes?.data?.requirements ?? null;
//           console.log("🔎 Stripe onboarding result:", {
//             needsOnboarding,
//             hasOnboardingUrl: !!stripeOnboardingUrl,
//             hasDashboardUrl: !!stripeDashboardUrl,
//           });
//         } catch (e) {
//           console.log("⚠️ Stripe check failed:", e?.response?.data || e?.message);
//           // We'll still compute readiness with unknown onboarding; user can finish in profile
//         }

//         const readiness = computeProviderReadiness(me, {
//           accountId: stripeAccountId,
//           needsOnboarding,
//         });

//         console.log("🧩 Provider readiness:", readiness);

//         // If ANY of the required parts are missing, nudge with specific items
//         if (!readiness.overallOk) {
//           setLoading(false);
//           const missingParts = [];
//           if (readiness.missing.stripe) missingParts.push("Stripe onboarding");
//           if (readiness.missing.fields) missingParts.push("profile fields");
//           if (readiness.missing.docs) missingParts.push("documents (incl. ICA)");
//           if (readiness.missing.sms) missingParts.push("SMS consent");

//           Alert.alert(
//             "Finish Account Setup",
//             `You're signed in, but your account isn't fully active. Missing: ${missingParts.join(
//               ", "
//             )}.`,
//             [
//               needsOnboarding
//                 ? {
//                     text: "Open Stripe",
//                     onPress: async () => {
//                       const url = stripeOnboardingUrl || stripeDashboardUrl;
//                       if (url) await openUrlSafely(url);
//                       goTo(target);
//                     },
//                   }
//                 : undefined,
//               {
//                 text: "Fix in App",
//                 onPress: () =>
//                   goTo("ProviderProfile", {
//                     missingRequirements: requirements || null,
//                   }),
//               },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ].filter(Boolean)
//           );
//           return;
//         }
//       }

//       // All good — go to dashboard
//       setLoading(false);
//       console.log("✅ Login complete →", target);
//       goTo(target);
//     } catch (err) {
//       setLoading(false);
//       const status = err?.response?.status;
//       const raw =
//         err?.response?.data?.msg ||
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";

//       console.log("💥 Login failure:", {
//         status,
//         data: err?.response?.data,
//         message: err?.message,
//       });

//       let msg = raw;
//       const lower = (raw || "").toLowerCase();
//       if (status === 404 && (lower.includes("user") || lower.includes("email"))) {
//         msg = "We couldn’t find an account with that email.";
//       }
//       if (status === 401 && (lower.includes("invalid") || lower.includes("password"))) {
//         msg = "Invalid email or password.";
//       }
//       Alert.alert("Error", msg);
//     }
//   };

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//             {/* Header */}
//             <View style={styles.header}>
//               <View className="logoContainer">
//                 <Image
//                   source={require("../assets/blinqfix_logo-new.jpeg")}
//                   style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={styles.title}>Login</Text>
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
//                   autoCorrect={false}
//                   autoComplete="email"
//                   value={email}
//                   onChangeText={setEmail}
//                   returnKeyType="next"
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
//                 <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeIcon}>
//                   {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.forgotPasswordButton}
//                 onPress={() => navigation.navigate("RequestPasswordResetScreen")}
//               >
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Login Button */}
//             <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={loading}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.loginButtonGradient}>
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
//               <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
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
//   trustText: { color: "#22c55e", marginLeft: 8, fontSize: 12, fontWeight: "500" },
// });

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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
// import { useNavigation } from "@react-navigation/native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Buffer } from "buffer";

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";

// /** ---------- helpers ---------- */
// const asBool = (v) => {
//   if (typeof v === "boolean") return v;
//   if (typeof v === "number") return v === 1;
//   if (typeof v === "string") {
//     const s = v.trim().toLowerCase();
//     return s === "true" || s === "1" || s === "yes" || s === "y";
//   }
//   return false;
// };
// const has = (v) =>
//   v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "");

// const hasDoc = (d) => {
//   if (!d) return false;
//   if (typeof d === "string") return d.trim().length > 0;
//   if (typeof d === "object") {
//     if (typeof d.url === "string" && d.url.trim()) return true;
//     if (typeof d.location === "string" && d.location.trim()) return true;
//     if (typeof d.uri === "string" && d.uri.trim()) return true;
//     if (typeof d.path === "string" && d.path.trim()) return true;
//     return Object.keys(d).length > 0; // last resort
//   }
//   return false;
// };

// const pickEmail = (me) =>
//   me?.email ||
//   me?.username ||
//   me?.contact?.email ||
//   me?.primaryEmail ||
//   (Array.isArray(me?.emails) ? me.emails[0] : "") ||
//   me?.profile?.email ||
//   me?.account?.email ||
//   "";

// const pickPhone = (me) =>
//   me?.phoneNumber ||
//   me?.phone_number ||
//   me?.phone ||
//   me?.mobile ||
//   me?.cell ||
//   me?.contact?.phoneNumber ||
//   me?.contact?.phone ||
//   "";

// const pickZip = (me) => {
//   const toStr = (v) =>
//     Array.isArray(v) ? String(v[0] ?? "").trim() : String(v ?? "").trim();
//   return toStr(me?.zipcode) || "";
// };

// const pickIcaViewed = (me) =>
//   asBool(me?.icaViewed) ||
//   asBool(me?.independentContractorAgreement?.viewed) ||
//   asBool(me?.independentContractorAgreement?.seen);

// const pickIcaAccepted = (me) =>
//   asBool(me?.acceptedICA) ||
//   asBool(me?.icaAccepted) ||
//   asBool(me?.independentContractorAgreement?.accepted) ||
//   asBool(me?.independentContractorAgreement?.signed) ||
//   asBool(me?.independentContractorAgreement?.completed);

// const pickSmsOptIn = (me) =>
//   asBool(me?.acceptSMS) ||
//   asBool(me?.acceptsSms) ||
//   asBool(me?.smsOptIn) ||
//   asBool(me?.smsConsent) ||
//   asBool(me?.smsAgreed);

// /**
//  * Strict provider readiness per your rules:
//  * - Stripe onboarding complete
//  * - Required fields filled: aboutMe, yearsExperience, serviceType, businessName,
//  *   address, zipcode, profilePicture, email, phoneNumber, acceptSMS (true)
//  * - Docs present: w9, businessLicense, proofOfInsurance
//  * - ICA: viewed AND agreed
//  * (accountStatus/isActive ignored)
//  */
// function evaluateProviderReadiness(me, stripeInfo) {
//   const missing = [];

//   // Stripe
//   const stripeComplete =
//     !!stripeInfo?.accountId && stripeInfo?.needsOnboarding === false;
//   if (!stripeComplete) missing.push("Stripe onboarding");

//   // Fields
//   const email = pickEmail(me);
//   const phone = pickPhone(me);
//   const zipcode = pickZip(me);
//   const profilePictureOk = hasDoc(me?.profilePicture);

//   if (!has(me?.aboutMe)) missing.push("About Me");
//   if (!has(me?.yearsExperience)) missing.push("Years of Experience");
//   if (!has(me?.serviceType)) missing.push("Primary Service");
//   if (!has(me?.businessName)) missing.push("Business Name");
//   if (!has(me?.address)) missing.push("Business Address");
//   if (!has(zipcode)) missing.push("Zip Code");
//   if (!profilePictureOk) missing.push("Profile Picture");
//   if (!has(email)) missing.push("Email");
//   if (!has(phone)) missing.push("Phone Number");

//   // SMS consent
//   const smsOk = pickSmsOptIn(me);
//   if (!smsOk) missing.push("SMS Consent");

//   // Documents
//   if (!hasDoc(me?.w9)) missing.push("W-9");
//   if (!hasDoc(me?.businessLicense)) missing.push("Business License");
//   if (!hasDoc(me?.proofOfInsurance)) missing.push("Proof of Insurance");

//   // ICA viewed + agreed
//   const icaViewed = pickIcaViewed(me);
//   const icaAccepted = pickIcaAccepted(me);
//   if (!icaViewed) missing.push("ICA Viewed");
//   if (!icaAccepted) missing.push("ICA Agreed");

//   return {
//     ok: missing.length === 0,
//     missing,
//   };
// }

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
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// function shouldRetryLowercaseLogin(err) {
//   const status = err?.response?.status;
//   const msg =
//     (err?.response?.data?.msg || err?.response?.data?.message || err?.message || "")
//       .toString()
//       .toLowerCase();
//   if (status === 404) return true;
//   if (msg.includes("user not found")) return true;
//   if (msg.includes("invalid credentials")) return true;
//   if (status === 400 && (msg.includes("email") || msg.includes("not found"))) return true;
//   return false;
// }

// // Minimal push registration (safe to fail quietly if not configured)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     console.log("📮 Expo push token acquired?", !!tokenData?.data);
//     return tokenData?.data || null;
//   } catch (e) {
//     console.log("❌ registerForPushNotificationsAsync failed:", e?.message);
//     return null;
//   }
// }

// /** Save push token (we’ll stash for providers until fully ready; non-blocking) */
// async function savePushTokenIfAllowed(me) {
//   try {
//     const expoPush = await registerForPushNotificationsAsync();
//     if (!expoPush) return;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     if (isProvider) {
//       await AsyncStorage.setItem("pendingPushToken", expoPush);
//       return;
//     }

//     await api.post("/users/push-token", { token: expoPush });
//     await AsyncStorage.removeItem("pendingPushToken");
//     console.log("✅ Push token sent to backend and stored.");
//   } catch (e) {
//     console.log("⚠️ Failed to send push token, will stash:", e?.response?.data || e?.message);
//     try {
//       const already = await AsyncStorage.getItem("pendingPushToken");
//       if (!already) {
//         const maybe = await registerForPushNotificationsAsync();
//         if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
//       }
//     } catch {}
//   }
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /** ---------- one-time: permissions ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         const { status: locStatus } = await Location.getForegroundPermissionsAsync();
//         console.log("📍 Location permission:", locStatus);
//         if (locStatus !== "granted") {
//           const { status } = await Location.requestForegroundPermissionsAsync();
//           console.log("📍 Location permission requested ->", status);
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
//         console.log("🔔 Notification permission:", notifPerm?.status);
//         if (notifPerm.status !== "granted") {
//           const req = await Notifications.requestPermissionsAsync();
//           console.log("🔔 Notification permission requested ->", req?.status);
//         }
//       } catch (e) {
//         console.log("⚠️ Permission setup error:", e?.message);
//       }
//     })();
//   }, []);

//   const openUrlSafely = async (url) => {
//     try {
//       if (url && (await Linking.canOpenURL(url))) {
//         await Linking.openURL(url);
//         return true;
//       }
//     } catch (e) {
//       console.log("❌ openUrlSafely error:", e?.message, url);
//     }
//     Alert.alert("Error", "Could not open onboarding link.");
//     return false;
//   };

//   const goTo = (routeName, params = {}) => {
//     console.log("🧭 Navigating to", routeName, "params:", params);
//     const action = { index: 0, routes: [{ name: routeName, params }] };
//     if (navigationRef?.isReady?.()) {
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     } else {
//       navigation.navigate(routeName, params);
//     }
//   };

//   /** ---------- LOGIN (email only) ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);
//       console.log("🔑 Login pressed.");

//       // Clear stale tokens
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const typed = email.trim();
//       if (!typed || !password) {
//         setLoading(false);
//         Alert.alert("Missing info", "Please enter your email and password.");
//         return;
//       }

//       const tryLogin = async (emailToUse, label) => {
//         console.log("➡️ POST /auth/login", {
//           email: emailToUse,
//           attempt: label,
//           passwordLength: String(password).length,
//         });
//         return api.post(
//           "/auth/login",
//           { email: emailToUse, password },
//           { headers: { "Content-Type": "application/json" } }
//         );
//       };

//       let loginRes = null;

//       // TRY 1: email exactly as typed
//       try {
//         loginRes = await tryLogin(typed, "typed");
//       } catch (err1) {
//         const status = err1?.response?.status;
//         console.log("❌ Login attempt #1 failed:", {
//           status,
//           data: err1?.response?.data,
//           message: err1?.message,
//         });

//         if (shouldRetryLowercaseLogin(err1)) {
//           const lower = typed.toLowerCase();
//           console.log("↪️ Retrying with lowercased email:", lower);
//           try {
//             loginRes = await tryLogin(lower, "lowercased");
//           } catch (err2) {
//             console.log("❌ Login attempt #2 failed:", {
//               status: err2?.response?.status,
//               data: err2?.response?.data,
//               message: err2?.message,
//             });
//             throw err2;
//           }
//         } else {
//           throw err1;
//         }
//       }

//       const data = loginRes?.data;
//       console.log("✅ Login response keys:", Object.keys(data || {}));
//       if (!data?.token) throw new Error("Token missing from response");

//       // Store tokens
//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }
//       console.log("🔒 Tokens stored. token.len:", data.token?.length, "refresh?", !!data.refreshToken);

//       // Set auth header for subsequent calls
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // Load /me
//       let me = null;
//       try {
//         const meRes = await api.get("/users/me");
//         me = meRes?.data?.user ?? meRes?.data ?? null;
//         console.log("👤 /users/me loaded:", {
//           id: me?._id,
//           role: me?.role,
//           email: me?.email,
//           username: me?.username,
//           phoneNumber: me?.phoneNumber,
//           accountStatus: me?.accountStatus,
//           isActive: me?.isActive,
//           stripeAccountId: me?.stripeAccountId || me?.stripe?.accountId || null,
//           docs: {
//             w9: !!me?.w9,
//             businessLicense: !!me?.businessLicense,
//             proofOfInsurance: !!me?.proofOfInsurance,
//           },
//           haveProfilePic: !!me?.profilePicture,
//           sms: pickSmsOptIn(me),
//           icaViewed: pickIcaViewed(me),
//           icaAccepted: pickIcaAccepted(me),
//         });
//       } catch (e) {
//         console.log("⚠️ /users/me failed:", e?.response?.data || e?.message);
//       }

//       // Save (or stash) push token without blocking login
//       await savePushTokenIfAllowed(me);

//       // Role + Stripe account
//       const payload = parseJwt(data.token) || {};
//       const role = payload?.role || me?.role || "customer";
//       const stripeAccountId =
//         payload?.stripeAccountId ||
//         me?.stripeAccountId ||
//         me?.stripe?.accountId ||
//         null;

//       console.log("🎭 Derived auth:", {
//         role,
//         stripeAccountId,
//         jwtKeys: Object.keys(payload || {}),
//       });

//       setRole(role);
//       const target = roleToScreen(role);

//       // Provider prompts per strict rules
//       const isProvider = (role || "").toLowerCase() === "serviceprovider";

//       if (isProvider) {
//         if (!stripeAccountId) {
//           setLoading(false);
//           Alert.alert(
//             "Connect Payouts",
//             "To receive payouts, connect your Stripe account from your profile.",
//             [
//               { text: "Go to Profile", onPress: () => goTo("ProviderProfile") },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ]
//           );
//           return;
//         }

//         // Check onboarding
//         let needsOnboarding = null;
//         let stripeOnboardingUrl = null;
//         let stripeDashboardUrl = null;
//         let requirements = null;

//         try {
//           console.log("🔎 Checking Stripe onboarding…");
//           const checkRes = await api.post("/routes/stripe/check-onboarding", {
//             stripeAccountId,
//           });
//           needsOnboarding = checkRes?.data?.needsOnboarding ?? null;
//           stripeOnboardingUrl = checkRes?.data?.stripeOnboardingUrl ?? null;
//           stripeDashboardUrl = checkRes?.data?.stripeDashboardUrl ?? null;
//           requirements = checkRes?.data?.requirements ?? null;
//           console.log("🔎 Stripe onboarding result:", {
//             needsOnboarding,
//             hasOnboardingUrl: !!stripeOnboardingUrl,
//             hasDashboardUrl: !!stripeDashboardUrl,
//           });
//         } catch (e) {
//           console.log("⚠️ Stripe check failed:", e?.response?.data || e?.message);
//         }

//         // Strict readiness
//         const readiness = evaluateProviderReadiness(me, {
//           accountId: stripeAccountId,
//           needsOnboarding,
//         });

//         console.log("🧩 Provider readiness:", readiness);

//         if (!readiness.ok) {
//           setLoading(false);
//           const bullets = readiness.missing.map((m) => `• ${m}`).join("\n");
//           Alert.alert(
//             "Finish Account Setup",
//             `You're signed in, but your profile isn't complete yet.\n\nMissing:\n${bullets}`,
//             [
//               needsOnboarding
//                 ? {
//                     text: "Open Stripe",
//                     onPress: async () => {
//                       const url = stripeOnboardingUrl || stripeDashboardUrl;
//                       if (url) await openUrlSafely(url);
//                       goTo(target);
//                     },
//                   }
//                 : undefined,
//               {
//                 text: "Fix in App",
//                 onPress: () =>
//                   goTo("ProviderProfile", {
//                     missingItems: readiness.missing,
//                     missingRequirements: requirements || null,
//                   }),
//               },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ].filter(Boolean)
//           );
//           return;
//         }
//       }

//       // All good — go to dashboard
//       setLoading(false);
//       console.log("✅ Login complete →", target);
//       goTo(target);
//     } catch (err) {
//       setLoading(false);
//       const status = err?.response?.status;
//       const raw =
//         err?.response?.data?.msg ||
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";

//       console.log("💥 Login failure:", {
//         status,
//         data: err?.response?.data,
//         message: err?.message,
//       });

//       let msg = raw;
//       const lower = (raw || "").toLowerCase();
//       if (status === 404 && (lower.includes("user") || lower.includes("email"))) {
//         msg = "We couldn’t find an account with that email.";
//       }
//       if (status === 401 && (lower.includes("invalid") || lower.includes("password"))) {
//         msg = "Invalid email or password.";
//       }
//       Alert.alert("Error", msg);
//     }
//   };

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//             {/* Header */}
//             <View style={styles.header}>
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require("../assets/blinqfix_logo-new.jpeg")}
//                   style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={styles.title}>Login</Text>
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
//                   autoCorrect={false}
//                   autoComplete="email"
//                   value={email}
//                   onChangeText={setEmail}
//                   returnKeyType="next"
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
//                 <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeIcon}>
//                   {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.forgotPasswordButton}
//                 onPress={() => navigation.navigate("RequestPasswordResetScreen")}
//               >
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Login Button */}
//             <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={loading}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.loginButtonGradient}>
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
//               <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
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
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   trustText: { color: "#22c55e", marginLeft: 8, fontSize: 12, fontWeight: "500" },
// });


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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
// import { useNavigation } from "@react-navigation/native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";

// /** ---------- helpers ---------- */
// const asBool = (v) => {
//   if (typeof v === "boolean") return v;
//   if (typeof v === "number") return v === 1;
//   if (typeof v === "string") {
//     const s = v.trim().toLowerCase();
//     return s === "true" || s === "1" || s === "yes" || s === "y";
//   }
//   return false;
// };
// const hasStr = (v) => typeof v === "string" && v.trim().length > 0;
// const hasArr = (v) => Array.isArray(v) && v.length > 0;

// function evaluateProviderReadiness(me, stripeInfo) {
//   const missing = [];

//   // Stripe
//   const accountId = stripeInfo?.accountId || null;
//   const needsOnboarding = stripeInfo?.needsOnboarding; // true/false/null
//   if (!accountId) missing.push("Stripe onboarding");
//   else if (needsOnboarding === true) missing.push("Stripe onboarding");

//   // Required fields (use backend names only)
//   if (!hasStr(me?.aboutMe)) missing.push("About Me");

//   const yearsOk =
//     Number.isFinite(me?.yearsExperience) ||
//     (hasStr(me?.yearsExperience) && !isNaN(Number(me?.yearsExperience)));
//   if (!yearsOk) missing.push("Years of Experience");

//   if (!hasStr(me?.serviceType)) missing.push("Primary Service");
//   if (!hasStr(me?.businessName)) missing.push("Business Name");
//   if (!hasStr(me?.address)) missing.push("Business Address");

//   const zipcodeOk = hasArr(me?.zipcode) && hasStr(me?.zipcode?.[0]);
//   if (!zipcodeOk) missing.push("Zip Code");

//   if (!hasStr(me?.profilePicture)) missing.push("Profile Picture");
//   if (!hasStr(me?.email)) missing.push("Email");
//   if (!hasStr(me?.phoneNumber)) missing.push("Phone Number");

//   // SMS consent (backend: optInSms)
//   if (!asBool(me?.optInSms)) missing.push("SMS Consent");

//   // Documents (backend names)
//   if (!hasStr(me?.w9)) missing.push("W-9");
//   if (!hasStr(me?.businessLicense)) missing.push("Business License");
//   if (!hasStr(me?.proofOfInsurance)) missing.push("Proof of Insurance");

//   // ICA viewed + agreed (backend: independentContractorAgreement (string), acceptedICA (boolean))
//   if (!hasStr(me?.independentContractorAgreement)) missing.push("ICA Viewed");
//   if (!asBool(me?.acceptedICA)) missing.push("ICA Agreed");

//   return { ok: missing.length === 0, missing };
// }

// function parseJwt(token) {
//   if (!token) return null;
//   const base64Url = token.split(".")[1];
//   if (!base64Url) return null;
//   const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//   const binary = globalThis?.atob
//     ? atob(base64)
//     : Buffer.from(base64, "base64").toString("binary");
//   const jsonPayload = decodeURIComponent(
//     binary
//       .split("")
//       .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//       .join("")
//   );
//   return JSON.parse(jsonPayload);
// }

// function roleToScreen(role) {
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// function shouldRetryLowercaseLogin(err) {
//   const status = err?.response?.status;
//   const msg =
//     (err?.response?.data?.msg || err?.response?.data?.message || err?.message || "")
//       .toString()
//       .toLowerCase();
//   if (status === 404) return true;
//   if (msg.includes("user not found")) return true;
//   if (msg.includes("invalid credentials")) return true;
//   if (status === 400 && (msg.includes("email") || msg.includes("not found"))) return true;
//   return false;
// }

// // Minimal push registration (safe to fail quietly if not configured)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     console.log("📮 Expo push token acquired?", !!tokenData?.data);
//     return tokenData?.data || null;
//   } catch (e) {
//     console.log("❌ registerForPushNotificationsAsync failed:", e?.message);
//     return null;
//   }
// }

// /** Save push token (stash for providers; non-blocking) */
// async function savePushTokenIfAllowed(me) {
//   try {
//     const expoPush = await registerForPushNotificationsAsync();
//     if (!expoPush) return;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     if (isProvider) {
//       await AsyncStorage.setItem("pendingPushToken", expoPush);
//       return;
//     }

//     await api.post("/users/push-token", { token: expoPush });
//     await AsyncStorage.removeItem("pendingPushToken");
//     console.log("✅ Push token sent to backend and stored.");
//   } catch (e) {
//     console.log("⚠️ Failed to send push token, will stash:", e?.response?.data || e?.message);
//     try {
//       const already = await AsyncStorage.getItem("pendingPushToken");
//       if (!already) {
//         const maybe = await registerForPushNotificationsAsync();
//         if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
//       }
//     } catch {}
//   }
// }

// /** Always fetch canonical /users/me fresh from backend and cache it for hydration */
// async function fetchCanonicalMe() {
//   const meRes = await api.get("/users/me");
//   const me = meRes?.data?.user ?? meRes?.data ?? null;

//   try {
//     await AsyncStorage.setItem("me", JSON.stringify(me || {}));
//   } catch {}

//   console.log("👤 Canonical /users/me:", {
//     id: me?._id,
//     role: me?.role,
//     email: me?.email,
//     phoneNumber: me?.phoneNumber,
//     zipcode: me?.zipcode,
//     docs: {
//       w9: !!me?.w9,
//       businessLicense: !!me?.businessLicense,
//       proofOfInsurance: !!me?.proofOfInsurance,
//     },
//     haveProfilePic: !!me?.profilePicture,
//     optInSms: !!me?.optInSms,
//     icaViewed: !!me?.independentContractorAgreement,
//     icaAccepted: !!me?.acceptedICA,
//   });

//   return me;
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /** ---------- one-time: permissions ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         const { status: locStatus } = await Location.getForegroundPermissionsAsync();
//         console.log("📍 Location permission:", locStatus);
//         if (locStatus !== "granted") {
//           const { status } = await Location.requestForegroundPermissionsAsync();
//           console.log("📍 Location permission requested ->", status);
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
//         console.log("🔔 Notification permission:", notifPerm?.status);
//         if (notifPerm.status !== "granted") {
//           const req = await Notifications.requestPermissionsAsync();
//           console.log("🔔 Notification permission requested ->", req?.status);
//         }
//       } catch (e) {
//         console.log("⚠️ Permission setup error:", e?.message);
//       }
//     })();
//   }, []);

//   const openUrlSafely = async (url) => {
//     try {
//       if (url && (await Linking.canOpenURL(url))) {
//         await Linking.openURL(url);
//         return true;
//       }
//     } catch (e) {
//       console.log("❌ openUrlSafely error:", e?.message, url);
//     }
//     Alert.alert("Error", "Could not open onboarding link.");
//     return false;
//   };

//   const goTo = (routeName, params = {}) => {
//     console.log("🧭 Navigating to", routeName, "params:", params);
//     const action = { index: 0, routes: [{ name: routeName, params }] };
//     if (navigationRef?.isReady?.()) {
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     } else {
//       navigation.navigate(routeName, params);
//     }
//   };

//   /** ---------- LOGIN (email only) ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);
//       console.log("🔑 Login pressed.");

//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const typed = email.trim();
//       if (!typed || !password) {
//         setLoading(false);
//         Alert.alert("Missing info", "Please enter your email and password.");
//         return;
//       }

//       const tryLogin = async (emailToUse, label) => {
//         console.log("➡️ POST /auth/login", {
//           email: emailToUse,
//           attempt: label,
//           passwordLength: String(password).length,
//         });
//         return api.post(
//           "/auth/login",
//           { email: emailToUse, password },
//           { headers: { "Content-Type": "application/json" } }
//         );
//       };

//       let loginRes = null;

//       try {
//         loginRes = await tryLogin(typed, "typed");
//       } catch (err1) {
//         const status = err1?.response?.status;
//         console.log("❌ Login attempt #1 failed:", {
//           status,
//           data: err1?.response?.data,
//           message: err1?.message,
//         });

//         if (shouldRetryLowercaseLogin(err1)) {
//           const lower = typed.toLowerCase();
//           console.log("↪️ Retrying with lowercased email:", lower);
//           try {
//             loginRes = await tryLogin(lower, "lowercased");
//           } catch (err2) {
//             console.log("❌ Login attempt #2 failed:", {
//               status: err2?.response?.status,
//               data: err2?.response?.data,
//               message: err2?.message,
//             });
//             throw err2;
//           }
//         } else {
//           throw err1;
//         }
//       }

//       const data = loginRes?.data;
//       console.log("✅ Login response keys:", Object.keys(data || {}));
//       if (!data?.token) throw new Error("Token missing from response");

//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // Canonical me (for readiness + hydration)
//       let me = null;
//       try {
//         me = await fetchCanonicalMe();
//       } catch (e) {
//         console.log("⚠️ Initial /users/me failed:", e?.response?.data || e?.message);
//       }

//       await savePushTokenIfAllowed(me);

//       const payload = parseJwt(data.token) || {};
//       const role = payload?.role || me?.role || "customer";
//       const stripeAccountId =
//         payload?.stripeAccountId ||
//         me?.stripeAccountId ||
//         me?.stripe?.accountId ||
//         null;

//       console.log("🎭 Derived auth:", {
//         role,
//         stripeAccountId,
//         jwtKeys: Object.keys(payload || {}),
//       });

//       setRole(role);
//       const target = roleToScreen(role);

//       // Provider strict rules, using canonical backend values only
//       const isProvider = (role || "").toLowerCase() === "serviceprovider";

//       if (isProvider) {
//         let needsOnboarding = null;
//         let stripeOnboardingUrl = null;
//         let stripeDashboardUrl = null;
//         let requirements = null;

//         if (!stripeAccountId) {
//           setLoading(false);
//           Alert.alert(
//             "Connect Payouts",
//             "To receive payouts, connect your Stripe account from your profile.",
//             [
//               { text: "Go to Profile", onPress: () => goTo("ProviderProfile") },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ]
//           );
//           return;
//         }

//         try {
//           console.log("🔎 Checking Stripe onboarding…");
//           const checkRes = await api.post("/routes/stripe/check-onboarding", {
//             stripeAccountId,
//           });
//           needsOnboarding = checkRes?.data?.needsOnboarding ?? null;
//           stripeOnboardingUrl = checkRes?.data?.stripeOnboardingUrl ?? null;
//           stripeDashboardUrl = checkRes?.data?.stripeDashboardUrl ?? null;
//           requirements = checkRes?.data?.requirements ?? null;
//           console.log("🔎 Stripe onboarding result:", {
//             needsOnboarding,
//             hasOnboardingUrl: !!stripeOnboardingUrl,
//             hasDashboardUrl: !!stripeDashboardUrl,
//           });
//         } catch (e) {
//           console.log("⚠️ Stripe check failed:", e?.response?.data || e?.message);
//         }

//         // First pass
//         let readiness = evaluateProviderReadiness(me || {}, {
//           accountId: stripeAccountId,
//           needsOnboarding,
//         });

//         // Re-fetch once if anything missing to avoid false negatives
//         if (!readiness.ok) {
//           try {
//             const fresh = await fetchCanonicalMe();
//             me = fresh;
//             readiness = evaluateProviderReadiness(me || {}, {
//               accountId: stripeAccountId,
//               needsOnboarding,
//             });
//           } catch (e) {
//             console.log("⚠️ Re-fetch /users/me failed:", e?.response?.data || e?.message);
//           }
//         }

//         console.log("🧩 Provider readiness:", readiness);

//         if (!readiness.ok) {
//           setLoading(false);
//           const bullets = readiness.missing.map((m) => `• ${m}`).join("\n");
//           Alert.alert(
//             "Finish Account Setup",
//             `You're signed in, but your profile isn't complete yet.\n\nMissing:\n${bullets}`,
//             [
//               needsOnboarding === true
//                 ? {
//                     text: "Open Stripe",
//                     onPress: async () => {
//                       const url = stripeOnboardingUrl || stripeDashboardUrl;
//                       if (url) await openUrlSafely(url);
//                       goTo(target);
//                     },
//                   }
//                 : undefined,
//               {
//                 text: "Fix in App",
//                 onPress: () =>
//                   goTo("ProviderProfile", {
//                     missingItems: readiness.missing,
//                     missingRequirements: requirements || null,
//                     canonicalMe: me || null,
//                   }),
//               },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ].filter(Boolean)
//           );
//           return;
//         }
//       }

//       setLoading(false);
//       console.log("✅ Login complete →", target);
//       goTo(target);
//     } catch (err) {
//       setLoading(false);
//       const status = err?.response?.status;
//       const raw =
//         err?.response?.data?.msg ||
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";

//       console.log("💥 Login failure:", {
//         status,
//         data: err?.response?.data,
//         message: err?.message,
//       });

//       let msg = raw;
//       const lower = (raw || "").toLowerCase();
//       if (status === 404 && (lower.includes("user") || lower.includes("email"))) {
//         msg = "We couldn’t find an account with that email.";
//       }
//       if (status === 401 && (lower.includes("invalid") || lower.includes("password"))) {
//         msg = "Invalid email or password.";
//       }
//       Alert.alert("Error", msg);
//     }
//   };

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//             <View style={styles.header}>
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require("../assets/blinqfix_logo-new.jpeg")}
//                   style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={styles.title}>Login</Text>
//               <Text style={styles.subtitle}>Enter your credentials to access your account</Text>
//             </View>

//             <View style={styles.formContainer}>
//               <View style={styles.inputContainer}>
//                 <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Email Address"
//                   placeholderTextColor="#94a3b8"
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   autoCorrect={false}
//                   autoComplete="email"
//                   value={email}
//                   onChangeText={setEmail}
//                   returnKeyType="next"
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
//                 <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeIcon}>
//                   {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.forgotPasswordButton}
//                 onPress={() => navigation.navigate("RequestPasswordResetScreen")}
//               >
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={loading}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.loginButtonGradient}>
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

//             <View style={styles.footer}>
//               <Text style={styles.footerText}>Don't have an account?</Text>
//               <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
//                 <Text style={styles.footerLink}>Sign Up</Text>
//               </TouchableOpacity>
//             </View>

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
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   trustText: { color: "#22c55e", marginLeft: 8, fontSize: 12, fontWeight: "500" },
// });

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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
// import { useNavigation } from "@react-navigation/native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";

// /** ---------- helpers ---------- */
// const asBool = (v) => {
//   if (typeof v === "boolean") return v;
//   if (typeof v === "number") return v === 1;
//   if (typeof v === "string") {
//     const s = v.trim().toLowerCase();
//     return s === "true" || s === "1" || s === "yes" || s === "y" || s === "on";
//   }
//   return false;
// };
// const hasStr = (v) => typeof v === "string" && v.trim().length > 0;
// const hasArr = (v) => Array.isArray(v) && v.length > 0;

// // Support both old and new /users/me shapes
// const hasDocField = (me, key) => {
//   if (me?.hasDocs && typeof me.hasDocs[key] !== "undefined") return !!me.hasDocs[key];
//   return hasStr(me?.[key]);
// };
// const hasProfilePic = (me) =>
//   typeof me?.hasProfilePicture !== "undefined"
//     ? !!me.hasProfilePicture
//     : hasStr(me?.profilePicture);

// function evaluateProviderReadiness(me, stripeInfo) {
//   const missing = [];

//   // Stripe
//   const accountId = stripeInfo?.accountId || null;
//   const needsOnboarding = stripeInfo?.needsOnboarding; // true/false/null
//   if (!accountId) missing.push("Stripe onboarding");
//   else if (needsOnboarding === true) missing.push("Stripe onboarding");

//   // Required fields (use backend names only)
//   if (!hasStr(me?.aboutMe)) missing.push("About Me");

//   const yearsOk =
//     Number.isFinite(me?.yearsExperience) ||
//     (hasStr(me?.yearsExperience) && !isNaN(Number(me?.yearsExperience)));
//   if (!yearsOk) missing.push("Years of Experience");

//   if (!hasStr(me?.serviceType)) missing.push("Primary Service");
//   if (!hasStr(me?.businessName)) missing.push("Business Name");
//   if (!hasStr(me?.address)) missing.push("Business Address");

//   // zipcode is an array in the backend; support string fallback just in case
//   const zipFirst = Array.isArray(me?.zipcode) ? me.zipcode[0] : me?.zipcode;
//   const zipcodeOk = hasStr(zipFirst);
//   if (!zipcodeOk) missing.push("Zip Code");

//   if (!hasProfilePic(me)) missing.push("Profile Picture");
//   if (!hasStr(me?.email)) missing.push("Email");
//   if (!hasStr(me?.phoneNumber)) missing.push("Phone Number");

//   // SMS consent (backend: optInSms)
//   if (!asBool(me?.optInSms)) missing.push("SMS Consent");

//   // Documents (prefer booleans from hasDocs; fall back to raw base64 strings if present)
//   if (!hasDocField(me, "w9")) missing.push("W-9");
//   if (!hasDocField(me, "businessLicense")) missing.push("Business License");
//   if (!hasDocField(me, "proofOfInsurance")) missing.push("Proof of Insurance");

//   // ICA viewed + agreed
//   const icaViewed = asBool(me?.icaViewed) || hasStr(me?.independentContractorAgreement) || asBool(me?.acceptedICA);
//   if (!icaViewed) missing.push("ICA Viewed");
//   if (!asBool(me?.acceptedICA)) missing.push("ICA Agreed");

//   return { ok: missing.length === 0, missing };
// }

// function parseJwt(token) {
//   try {
//     if (!token) return null;
//     const base64Url = token.split(".")[1];
//     if (!base64Url) return null;
//     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

//     // Prefer atob if available (Expo/RN often polyfills this)
//     if (globalThis?.atob) {
//       const jsonPayload = decodeURIComponent(
//         Array.prototype.map
//           .call(globalThis.atob(base64), (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//           .join("")
//       );
//       return JSON.parse(jsonPayload);
//     }

//     // Fallback: decode manually (graceful failure)
//     const binary = Buffer.from(base64, "base64").toString("binary");
//     const jsonPayload = decodeURIComponent(
//       binary
//         .split("")
//         .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//         .join("")
//     );
//     return JSON.parse(jsonPayload);
//   } catch {
//     return null;
//   }
// }

// /** map role to initial screen */
// function roleToScreen(role) {
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// function shouldRetryLowercaseLogin(err) {
//   const status = err?.response?.status;
//   const msg =
//     (err?.response?.data?.msg || err?.response?.data?.message || err?.message || "")
//       .toString()
//       .toLowerCase();
//   if (status === 404) return true;
//   if (msg.includes("user not found")) return true;
//   if (msg.includes("invalid credentials")) return true;
//   if (status === 400 && (msg.includes("email") || msg.includes("not found"))) return true;
//   return false;
// }

// // Minimal push registration (safe to fail quietly if not configured)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     console.log("📮 Expo push token acquired?", !!tokenData?.data);
//     return tokenData?.data || null;
//   } catch (e) {
//     console.log("❌ registerForPushNotificationsAsync failed:", e?.message);
//     return null;
//   }
// }

// /** Save push token (stash for providers; non-blocking) */
// async function savePushTokenIfAllowed(me) {
//   try {
//     const expoPush = await registerForPushNotificationsAsync();
//     if (!expoPush) return;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     if (isProvider) {
//       await AsyncStorage.setItem("pendingPushToken", expoPush);
//       return;
//     }

//     await api.post("/users/push-token", { token: expoPush });
//     await AsyncStorage.removeItem("pendingPushToken");
//     console.log("✅ Push token sent to backend and stored.");
//   } catch (e) {
//     console.log("⚠️ Failed to send push token, will stash:", e?.response?.data || e?.message);
//     try {
//       const already = await AsyncStorage.getItem("pendingPushToken");
//       if (!already) {
//         const maybe = await registerForPushNotificationsAsync();
//         if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
//       }
//     } catch {}
//   }
// }

// /** Always fetch canonical /users/me fresh from backend and cache it for hydration */
// async function fetchCanonicalMe() {
//   const meRes = await api.get("/users/me");
//   const me = meRes?.data?.user ?? meRes?.data ?? null;

//   try {
//     await AsyncStorage.setItem("me", JSON.stringify(me || {}));
//   } catch {}

//   console.log("👤 Canonical /users/me:", {
//     id: me?._id,
//     role: me?.role,
//     email: me?.email,
//     phoneNumber: me?.phoneNumber,
//     zipcode: me?.zipcode,
//     docs: me?.hasDocs ?? {
//       w9: undefined,
//       businessLicense: undefined,
//       proofOfInsurance: undefined,
//       independentContractorAgreement: undefined,
//     },
//     hasProfilePicture: !!me?.hasProfilePicture,
//     optInSms: !!me?.optInSms,
//     icaViewed: !!me?.icaViewed,
//     icaAccepted: !!me?.acceptedICA,
//   });

//   return me;
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /** ---------- one-time: permissions ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         const { status: locStatus } = await Location.getForegroundPermissionsAsync();
//         console.log("📍 Location permission:", locStatus);
//         if (locStatus !== "granted") {
//           const { status } = await Location.requestForegroundPermissionsAsync();
//           console.log("📍 Location permission requested ->", status);
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
//         console.log("🔔 Notification permission:", notifPerm?.status);
//         if (notifPerm.status !== "granted") {
//           const req = await Notifications.requestPermissionsAsync();
//           console.log("🔔 Notification permission requested ->", req?.status);
//         }
//       } catch (e) {
//         console.log("⚠️ Permission setup error:", e?.message);
//       }
//     })();
//   }, []);

//   const openUrlSafely = async (url) => {
//     try {
//       if (url && (await Linking.canOpenURL(url))) {
//         await Linking.openURL(url);
//         return true;
//       }
//     } catch (e) {
//       console.log("❌ openUrlSafely error:", e?.message, url);
//     }
//     Alert.alert("Error", "Could not open onboarding link.");
//     return false;
//   };

//   const goTo = (routeName, params = {}) => {
//     console.log("🧭 Navigating to", routeName, "params:", params);
//     const action = { index: 0, routes: [{ name: routeName, params }] };
//     if (navigationRef?.isReady?.()) {
//       navigationRef.reset(action);
//     } else if (navigation && typeof navigation.reset === "function") {
//       navigation.reset(action);
//     } else {
//       navigation.navigate(routeName, params);
//     }
//   };

//   /** ---------- LOGIN (email only) ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);
//       console.log("🔑 Login pressed.");

//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const typed = email.trim();
//       if (!typed || !password) {
//         setLoading(false);
//         Alert.alert("Missing info", "Please enter your email and password.");
//         return;
//       }

//       const tryLogin = async (emailToUse, label) => {
//         console.log("➡️ POST /auth/login", {
//           email: emailToUse,
//           attempt: label,
//           passwordLength: String(password).length,
//         });
//         return api.post(
//           "/auth/login",
//           { email: emailToUse, password },
//           { headers: { "Content-Type": "application/json" } }
//         );
//       };

//       let loginRes = null;

//       try {
//         loginRes = await tryLogin(typed, "typed");
//       } catch (err1) {
//         const status = err1?.response?.status;
//         console.log("❌ Login attempt #1 failed:", {
//           status,
//           data: err1?.response?.data,
//           message: err1?.message,
//         });

//         if (shouldRetryLowercaseLogin(err1)) {
//           const lower = typed.toLowerCase();
//           console.log("↪️ Retrying with lowercased email:", lower);
//           try {
//             loginRes = await tryLogin(lower, "lowercased");
//           } catch (err2) {
//             console.log("❌ Login attempt #2 failed:", {
//               status: err2?.response?.status,
//               data: err2?.response?.data,
//               message: err2?.message,
//             });
//             throw err2;
//           }
//         } else {
//           throw err1;
//         }
//       }

//       const data = loginRes?.data;
//       console.log("✅ Login response keys:", Object.keys(data || {}));
//       if (!data?.token) throw new Error("Token missing from response");

//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // Canonical me (for readiness + hydration)
//       let me = null;
//       try {
//         me = await fetchCanonicalMe();
//       } catch (e) {
//         console.log("⚠️ Initial /users/me failed:", e?.response?.data || e?.message);
//       }

//       await savePushTokenIfAllowed(me);

//       const payload = parseJwt(data.token) || {};
//       const role = payload?.role || me?.role || "customer";
//       const stripeAccountId =
//         payload?.stripeAccountId ||
//         me?.stripeAccountId ||
//         me?.stripe?.accountId ||
//         null;

//       console.log("🎭 Derived auth:", {
//         role,
//         stripeAccountId,
//         jwtKeys: Object.keys(payload || {}),
//       });

//       setRole(role);
//       const target = roleToScreen(role);

//       // Provider strict rules, using canonical backend values only
//       const isProvider = (role || "").toLowerCase() === "serviceprovider";

//       if (isProvider) {
//         let needsOnboarding = null;
//         let stripeOnboardingUrl = null;
//         let stripeDashboardUrl = null;
//         let requirements = null;

//         if (!stripeAccountId) {
//           setLoading(false);
//           Alert.alert(
//             "Connect Payouts",
//             "To receive payouts, connect your Stripe account from your profile.",
//             [
//               { text: "Go to Profile", onPress: () => goTo("ProviderProfile") },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ]
//           );
//           return;
//         }

//         try {
//           console.log("🔎 Checking Stripe onboarding…");
//           const checkRes = await api.post("/routes/stripe/check-onboarding", {
//             stripeAccountId,
//           });
//           needsOnboarding = checkRes?.data?.needsOnboarding ?? null;
//           stripeOnboardingUrl = checkRes?.data?.stripeOnboardingUrl ?? null;
//           stripeDashboardUrl = checkRes?.data?.stripeDashboardUrl ?? null;
//           requirements = checkRes?.data?.requirements ?? null;
//           console.log("🔎 Stripe onboarding result:", {
//             needsOnboarding,
//             hasOnboardingUrl: !!stripeOnboardingUrl,
//             hasDashboardUrl: !!stripeDashboardUrl,
//           });
//         } catch (e) {
//           console.log("⚠️ Stripe check failed:", e?.response?.data || e?.message);
//         }

//         // First pass
//         let readiness = evaluateProviderReadiness(me || {}, {
//           accountId: stripeAccountId,
//           needsOnboarding,
//         });

//         // Re-fetch once if anything missing to avoid false negatives
//         if (!readiness.ok) {
//           try {
//             const fresh = await fetchCanonicalMe();
//             me = fresh;
//             readiness = evaluateProviderReadiness(me || {}, {
//               accountId: stripeAccountId,
//               needsOnboarding,
//             });
//           } catch (e) {
//             console.log("⚠️ Re-fetch /users/me failed:", e?.response?.data || e?.message);
//           }
//         }

//         console.log("🧩 Provider readiness:", readiness);

//         if (!readiness.ok) {
//           setLoading(false);
//           const bullets = readiness.missing.map((m) => `• ${m}`).join("\n");
//           Alert.alert(
//             "Finish Account Setup",
//             `You're signed in, but your profile isn't complete yet.\n\nMissing:\n${bullets}`,
//             [
//               needsOnboarding === true
//                 ? {
//                     text: "Open Stripe",
//                     onPress: async () => {
//                       const url = stripeOnboardingUrl || stripeDashboardUrl;
//                       if (url) await openUrlSafely(url);
//                       goTo(target);
//                     },
//                   }
//                 : undefined,
//               {
//                 text: "Fix in App",
//                 onPress: () =>
//                   goTo("ProviderProfile", {
//                     missingItems: readiness.missing,
//                     missingRequirements: requirements || null,
//                     canonicalMe: me || null,
//                   }),
//               },
//               { text: "Later", style: "cancel", onPress: () => goTo(target) },
//             ].filter(Boolean)
//           );
//           return;
//         }
//       }

//       setLoading(false);
//       console.log("✅ Login complete →", target);
//       goTo(target);
//     } catch (err) {
//       setLoading(false);
//       const status = err?.response?.status;
//       const raw =
//         err?.response?.data?.msg ||
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";

//       console.log("💥 Login failure:", {
//         status,
//         data: err?.response?.data,
//         message: err?.message,
//       });

//       let msg = raw;
//       const lower = (raw || "").toLowerCase();
//       if (status === 404 && (lower.includes("user") || lower.includes("email"))) {
//         msg = "We couldn’t find an account with that email.";
//       }
//       if (status === 401 && (lower.includes("invalid") || lower.includes("password"))) {
//         msg = "Invalid email or password.";
//       }
//       Alert.alert("Error", msg);
//     }
//   };

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//             <View style={styles.header}>
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require("../assets/blinqfix_logo-new.jpeg")}
//                   style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={styles.title}>Login</Text>
//               <Text style={styles.subtitle}>Enter your credentials to access your account</Text>
//             </View>

//             <View style={styles.formContainer}>
//               <View style={styles.inputContainer}>
//                 <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Email Address"
//                   placeholderTextColor="#94a3b8"
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   autoCorrect={false}
//                   autoComplete="email"
//                   value={email}
//                   onChangeText={setEmail}
//                   returnKeyType="next"
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
//                 <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeIcon}>
//                   {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.forgotPasswordButton}
//                 onPress={() => navigation.navigate("RequestPasswordResetScreen")}
//               >
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={loading}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.loginButtonGradient}>
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

//             <View style={styles.footer}>
//               <Text style={styles.footerText}>Don't have an account?</Text>
//               <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
//                 <Text style={styles.footerLink}>Sign Up</Text>
//               </TouchableOpacity>
//             </View>

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
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   trustText: { color: "#22c55e", marginLeft: 8, fontSize: 12, fontWeight: "500" },
// });


// // LoginScreen.tsx / LoginScreen.jsx
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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
// import { useNavigation } from "@react-navigation/native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants"; // ✅ for projectId on real devices
// import { decode as atob } from "base-64"; // ✅ tiny polyfill for JWT decode

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";

// /** ---------- helpers ---------- */
// const asBool = (v) => {
//   if (typeof v === "boolean") return v;
//   if (typeof v === "number") return v === 1;
//   if (typeof v === "string") {
//     const s = v.trim().toLowerCase();
//     return s === "true" || s === "1" || s === "yes" || s === "y" || s === "on";
//   }
//   return false;
// };
// const hasStr = (v) => typeof v === "string" && v.trim().length > 0;
// const hasArr = (v) => Array.isArray(v) && v.length > 0;

// // Support both old and new /users/me shapes
// const hasDocField = (me, key) => {
//   if (me?.hasDocs && typeof me.hasDocs[key] !== "undefined") return !!me.hasDocs[key];
//   return hasStr(me?.[key]);
// };
// const hasProfilePic = (me) =>
//   typeof me?.hasProfilePicture !== "undefined"
//     ? !!me.hasProfilePicture
//     : hasStr(me?.profilePicture);

// // ✅ robust, no-Buffer JWT parser (Hermes-safe)
// function parseJwt(token) {
//   try {
//     if (!token) return null;
//     const base64Url = token.split(".")[1];
//     if (!base64Url) return null;
//     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//     const binary = atob(base64);
//     const jsonPayload = decodeURIComponent(
//       Array.prototype.map
//         .call(binary, (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//         .join("")
//     );
//     return JSON.parse(jsonPayload);
//   } catch {
//     return null;
//   }
// }

// function roleToScreen(role) {
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// function shouldRetryLowercaseLogin(err) {
//   const status = err?.response?.status;
//   const msg =
//     (err?.response?.data?.msg || err?.response?.data?.message || err?.message || "")
//       .toString()
//       .toLowerCase();
//   if (status === 404) return true;
//   if (msg.includes("user not found")) return true;
//   if (msg.includes("invalid credentials")) return true;
//   if (status === 400 && (msg.includes("email") || msg.includes("not found"))) return true;
//   return false;
// }

// // Minimal push registration (safe; EAS-compatible)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     // ✅ pass projectId on real builds
//     const projectId =
//       Constants?.expoConfig?.extra?.eas?.projectId ??
//       Constants?.easConfig?.projectId ??
//       null;

//     const tokenData = await Notifications.getExpoPushTokenAsync(
//       projectId ? { projectId } : undefined
//     );
//     const token = tokenData?.data || null;
//     console.log("📮 Expo push token acquired?", !!token);
//     return token;
//   } catch (e) {
//     console.log("❌ registerForPushNotificationsAsync failed:", e?.message);
//     return null;
//   }
// }

// /** Save push token (stash for providers; non-blocking) */
// async function savePushTokenIfAllowed(me) {
//   try {
//     const expoPush = await registerForPushNotificationsAsync();
//     if (!expoPush) return;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     if (isProvider) {
//       await AsyncStorage.setItem("pendingPushToken", expoPush);
//       return;
//     }

//     await api.post("/users/push-token", { token: expoPush });
//     await AsyncStorage.removeItem("pendingPushToken");
//     console.log("✅ Push token sent to backend and stored.");
//   } catch (e) {
//     console.log("⚠️ Failed to send push token, will stash:", e?.response?.data || e?.message);
//     try {
//       const already = await AsyncStorage.getItem("pendingPushToken");
//       if (!already) {
//         const maybe = await registerForPushNotificationsAsync();
//         if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
//       }
//     } catch {}
//   }
// }

// /** Always fetch canonical /users/me fresh from backend and cache it */
// async function fetchCanonicalMe() {
//   const meRes = await api.get("/users/me");
//   const me = meRes?.data?.user ?? meRes?.data ?? null;
//   try {
//     await AsyncStorage.setItem("me", JSON.stringify(me || {}));
//   } catch {}
//   console.log("👤 Canonical /users/me (safe log):", {
//     id: me?._id,
//     role: me?.role,
//     email: me?.email,
//     phoneNumber: me?.phoneNumber,
//     hasDocs: me?.hasDocs ?? null,
//     hasProfilePicture: !!me?.hasProfilePicture,
//     optInSms: !!me?.optInSms,
//     icaViewed: !!me?.icaViewed,
//     icaAccepted: !!me?.acceptedICA,
//   });
//   return me;
// }

// function evaluateProviderReadiness(me, stripeInfo) {
//   const missing = [];

//   const accountId = stripeInfo?.accountId || null;
//   const needsOnboarding = stripeInfo?.needsOnboarding;
//   if (!accountId) missing.push("Stripe onboarding");
//   else if (needsOnboarding === true) missing.push("Stripe onboarding");

//   if (!hasStr(me?.aboutMe)) missing.push("About Me");
//   const yearsOk =
//     Number.isFinite(me?.yearsExperience) ||
//     (hasStr(me?.yearsExperience) && !isNaN(Number(me?.yearsExperience)));
//   if (!yearsOk) missing.push("Years of Experience");

//   if (!hasStr(me?.serviceType)) missing.push("Primary Service");
//   if (!hasStr(me?.businessName)) missing.push("Business Name");
//   if (!hasStr(me?.address)) missing.push("Business Address");

//   const zipFirst = Array.isArray(me?.zipcode) ? me.zipcode[0] : me?.zipcode;
//   if (!hasStr(zipFirst)) missing.push("Zip Code");

//   if (!hasProfilePic(me)) missing.push("Profile Picture");
//   if (!hasStr(me?.email)) missing.push("Email");
//   if (!hasStr(me?.phoneNumber)) missing.push("Phone Number");

//   if (!asBool(me?.optInSms)) missing.push("SMS Consent");

//   if (!hasDocField(me, "w9")) missing.push("W-9");
//   if (!hasDocField(me, "businessLicense")) missing.push("Business License");
//   if (!hasDocField(me, "proofOfInsurance")) missing.push("Proof of Insurance");

//   const icaViewed =
//     asBool(me?.icaViewed) ||
//     hasStr(me?.independentContractorAgreement) ||
//     asBool(me?.acceptedICA);
//   if (!icaViewed) missing.push("ICA Viewed");
//   if (!asBool(me?.acceptedICA)) missing.push("ICA Agreed");

//   return { ok: missing.length === 0, missing };
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /** ---------- one-time: permissions ---------- */
//   useEffect(() => {
//     (async () => {
//       try {
//         const { status: locStatus } = await Location.getForegroundPermissionsAsync();
//         console.log("📍 Location permission:", locStatus);
//         if (locStatus !== "granted") {
//           const { status } = await Location.requestForegroundPermissionsAsync();
//           console.log("📍 Location permission requested ->", status);
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
//         console.log("🔔 Notification permission:", notifPerm?.status);
//         if (notifPerm.status !== "granted") {
//           const req = await Notifications.requestPermissionsAsync();
//           console.log("🔔 Notification permission requested ->", req?.status);
//         }
//       } catch (e) {
//         console.log("⚠️ Permission setup error:", e?.message);
//       }
//     })();
//   }, []);

//   const openUrlSafely = async (url) => {
//     try {
//       if (url && (await Linking.canOpenURL(url))) {
//         await Linking.openURL(url);
//         return true;
//       }
//     } catch (e) {
//       console.log("❌ openUrlSafely error:", e?.message, url);
//     }
//     Alert.alert("Error", "Could not open onboarding link.");
//     return false;
//   };

//   const goTo = (routeName, params = {}) => {
//     try {
//       console.log("🧭 Navigating to", routeName);
//       const action = { index: 0, routes: [{ name: routeName, params }] };
//       if (navigationRef?.isReady?.()) {
//         navigationRef.reset(action);
//       } else if (navigation && typeof navigation.reset === "function") {
//         navigation.reset(action);
//       } else {
//         navigation.navigate(routeName, params);
//       }
//     } catch (e) {
//       console.log("⚠️ navigation error:", e?.message);
//     }
//   };

//   /** ---------- LOGIN (email only) ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);
//       console.log("🔑 Login pressed.");
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const typed = email.trim();
//       if (!typed || !password) {
//         setLoading(false);
//         Alert.alert("Missing info", "Please enter your email and password.");
//         return;
//       }

//       const tryLogin = async (emailToUse, label) => {
//         console.log("➡️ POST /auth/login", { email: emailToUse, attempt: label });
//         return api.post(
//           "/auth/login",
//           { email: emailToUse, password },
//           { headers: { "Content-Type": "application/json" } }
//         );
//       };

//       let loginRes = null;

//       try {
//         loginRes = await tryLogin(typed, "typed");
//       } catch (err1) {
//         const status = err1?.response?.status;
//         console.log("❌ Login attempt #1 failed:", { status, message: err1?.message });
//         if (shouldRetryLowercaseLogin(err1)) {
//           const lower = typed.toLowerCase();
//           console.log("↪️ Retrying with lowercased email:", lower);
//           loginRes = await tryLogin(lower, "lowercased");
//         } else {
//           throw err1;
//         }
//       }

//       const data = (loginRes && loginRes.data && typeof loginRes.data === "object")
//         ? loginRes.data
//         : {};
//       console.log("✅ Login response: has token?", !!data.token);
//       if (!data?.token) throw new Error("Token missing from response");

//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) {
//         await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       }
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // Canonical me (for readiness + hydration)
//       let me = null;
//       try {
//         me = await fetchCanonicalMe();
//       } catch (e) {
//         console.log("⚠️ Initial /users/me failed:", e?.response?.data || e?.message);
//       }

//       await savePushTokenIfAllowed(me);

//       const payload = parseJwt(data.token) || {};
//       const role = payload?.role || me?.role || "customer";
//       const stripeAccountId =
//         payload?.stripeAccountId ||
//         me?.stripeAccountId ||
//         me?.stripe?.accountId ||
//         null;

//       console.log("🎭 Derived auth:", { role, hasStripeAccountId: !!stripeAccountId });

//       setRole(role);
//       const target = roleToScreen(role);
//       const isProvider = (role || "").toLowerCase() === "serviceprovider";

//       if (isProvider) {
//         try {
//           let needsOnboarding = null;
//           let stripeOnboardingUrl = null;
//           let stripeDashboardUrl = null;
//           let requirements = null;

//           if (!stripeAccountId) {
//             setLoading(false);
//             Alert.alert(
//               "Connect Payouts",
//               "To receive payouts, connect your Stripe account from your profile.",
//               [
//                 { text: "Go to Profile", onPress: () => goTo("ProviderProfile") },
//                 { text: "Later", style: "cancel", onPress: () => goTo(target) },
//               ]
//             );
//             return;
//           }

//           console.log("🔎 Checking Stripe onboarding…");
//           const checkRes = await api.post("/routes/stripe/check-onboarding", {
//             stripeAccountId,
//           });
//           needsOnboarding = checkRes?.data?.needsOnboarding ?? null;
//           stripeOnboardingUrl = checkRes?.data?.stripeOnboardingUrl ?? null;
//           stripeDashboardUrl = checkRes?.data?.stripeDashboardUrl ?? null;
//           requirements = checkRes?.data?.requirements ?? null;

//           // First pass
//           let readiness = evaluateProviderReadiness(me || {}, {
//             accountId: stripeAccountId,
//             needsOnboarding,
//           });

//           // Re-fetch once if anything missing to avoid false negatives
//           if (!readiness.ok) {
//             try {
//               const fresh = await fetchCanonicalMe();
//               me = fresh;
//               readiness = evaluateProviderReadiness(me || {}, {
//                 accountId: stripeAccountId,
//                 needsOnboarding,
//               });
//             } catch (e) {
//               console.log("⚠️ Re-fetch /users/me failed:", e?.response?.data || e?.message);
//             }
//           }

//           console.log("🧩 Provider readiness ok?", readiness.ok);

//           if (!readiness.ok) {
//             setLoading(false);
//             const bullets = readiness.missing.map((m) => `• ${m}`).join("\n");
//             Alert.alert(
//               "Finish Account Setup",
//               `You're signed in, but your profile isn't complete yet.\n\nMissing:\n${bullets}`,
//               [
//                 needsOnboarding === true
//                   ? {
//                       text: "Open Stripe",
//                       onPress: async () => {
//                         const url = stripeOnboardingUrl || stripeDashboardUrl;
//                         if (url) await openUrlSafely(url);
//                         goTo(target);
//                       },
//                     }
//                   : undefined,
//                 {
//                   text: "Fix in App",
//                   onPress: () =>
//                     goTo("ProviderProfile", {
//                       missingItems: readiness.missing,
//                       missingRequirements: requirements || null,
//                       canonicalMe: me || null,
//                     }),
//                 },
//                 { text: "Later", style: "cancel", onPress: () => goTo(target) },
//               ].filter(Boolean)
//             );
//             return;
//           }
//         } catch (providerGateError) {
//           // ✅ NEVER crash—just log and continue to dashboard
//           console.log("⚠️ Provider gating failed (non-fatal):", providerGateError?.message);
//         }
//       }

//       setLoading(false);
//       console.log("✅ Login complete →", target);
//       goTo(target);
//     } catch (err) {
//       setLoading(false);
//       const status = err?.response?.status;
//       const raw =
//         err?.response?.data?.msg ||
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";

//       console.log("💥 Login failure:", { status, message: err?.message });

//       let msg = raw;
//       const lower = (raw || "").toLowerCase();
//       if (status === 404 && (lower.includes("user") || lower.includes("email"))) {
//         msg = "We couldn’t find an account with that email.";
//       }
//       if (status === 401 && (lower.includes("invalid") || lower.includes("password"))) {
//         msg = "Invalid email or password.";
//       }
//       Alert.alert("Error", msg);
//     }
//   };

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//             <View style={styles.header}>
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require("../assets/blinqfix_logo-new.jpeg")}
//                   style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={styles.title}>Login</Text>
//               <Text style={styles.subtitle}>Enter your credentials to access your account</Text>
//             </View>

//             <View style={styles.formContainer}>
//               <View style={styles.inputContainer}>
//                 <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Email Address"
//                   placeholderTextColor="#94a3b8"
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   autoCorrect={false}
//                   autoComplete="email"
//                   value={email}
//                   onChangeText={setEmail}
//                   returnKeyType="next"
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
//                 <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeIcon}>
//                   {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.forgotPasswordButton}
//                 onPress={() => navigation.navigate("RequestPasswordResetScreen")}
//               >
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={loading}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.loginButtonGradient}>
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

//             <View style={styles.footer}>
//               <Text style={styles.footerText}>Don't have an account?</Text>
//               <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
//                 <Text style={styles.footerLink}>Sign Up</Text>
//               </TouchableOpacity>
//             </View>

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
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   trustText: { color: "#22c55e", marginLeft: 8, fontSize: 12, fontWeight: "500" },
// });


// import React, { useEffect, useState, useRef } from "react";
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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
// import { useNavigation } from "@react-navigation/native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants";
// import { decode as atob } from "base-64";

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";

// /* ---------- polyfills & guards ---------- */
// // Ensure atob exists for any lib that expects it (Hermes-safe)
// if (typeof globalThis.atob !== "function") {
//   // eslint-disable-next-line no-global-assign
//   globalThis.atob = atob;
// }

// /* ---------- helpers ---------- */
// const asBool = (v) => {
//   if (typeof v === "boolean") return v;
//   if (typeof v === "number") return v === 1;
//   if (typeof v === "string") {
//     const s = v.trim().toLowerCase();
//     return s === "true" || s === "1" || s === "yes" || s === "y" || s === "on";
//   }
//   return false;
// };
// const hasStr = (v) => typeof v === "string" && v.trim().length > 0;

// // Support both old and new /users/me shapes
// const hasDocField = (me, key) => {
//   if (me?.hasDocs && typeof me.hasDocs[key] !== "undefined") return !!me.hasDocs[key];
//   return hasStr(me?.[key]);
// };
// const hasProfilePic = (me) =>
//   typeof me?.hasProfilePicture !== "undefined"
//     ? !!me.hasProfilePicture
//     : hasStr(me?.profilePicture);

// function parseJwt(token) {
//   try {
//     if (!token) return null;
//     const base64Url = token.split(".")[1];
//     if (!base64Url) return null;
//     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//     const binary = atob(base64);
//     const jsonPayload = decodeURIComponent(
//       Array.prototype.map
//         .call(binary, (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//         .join("")
//     );
//     return JSON.parse(jsonPayload);
//   } catch {
//     return null;
//   }
// }

// function roleToScreen(role) {
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// function shouldRetryLowercaseLogin(err) {
//   const status = err?.response?.status;
//   const msg =
//     (err?.response?.data?.msg || err?.response?.data?.message || err?.message || "")
//       .toString()
//       .toLowerCase();
//   if (status === 404) return true;
//   if (msg.includes("user not found")) return true;
//   if (msg.includes("invalid credentials")) return true;
//   if (status === 400 && (msg.includes("email") || msg.includes("not found"))) return true;
//   return false;
// }

// // Push registration (safe; EAS-compatible)
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     const projectId =
//       Constants?.expoConfig?.extra?.eas?.projectId ??
//       Constants?.easConfig?.projectId ??
//       null;

//     const tokenData = await Notifications.getExpoPushTokenAsync(
//       projectId ? { projectId } : undefined
//     );
//     const token = tokenData?.data || null;
//     console.log("📮 Expo push token acquired?", !!token);
//     return token;
//   } catch (e) {
//     console.log("❌ registerForPushNotificationsAsync failed:", e?.message);
//     return null;
//   }
// }

// /** Save push token (stash for providers; non-blocking) */
// async function savePushTokenIfAllowed(me) {
//   try {
//     const expoPush = await registerForPushNotificationsAsync();
//     if (!expoPush) return;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     if (isProvider) {
//       await AsyncStorage.setItem("pendingPushToken", expoPush);
//       return;
//     }

//     await api.post("/users/push-token", { token: expoPush });
//     await AsyncStorage.removeItem("pendingPushToken");
//     console.log("✅ Push token sent to backend and stored.");
//   } catch (e) {
//     console.log("⚠️ Failed to send push token, will stash:", e?.response?.data || e?.message);
//     try {
//       const already = await AsyncStorage.getItem("pendingPushToken");
//       if (!already) {
//         const maybe = await registerForPushNotificationsAsync();
//         if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
//       }
//     } catch {}
//   }
// }

// /**
//  * Fetch /users/me and cache a **slim** copy (no blobs) to AsyncStorage.
//  * Returns the full object to caller for immediate use.
//  */
// async function fetchCanonicalMe() {
//   const meRes = await api.get("/users/me");
//   const me = meRes?.data?.user ?? meRes?.data ?? null;

//   const ppLen = typeof me?.profilePicture === "string" ? me.profilePicture.length : 0;
//   console.log("👤 /users/me received", {
//     id: me?._id,
//     role: me?.role,
//     hasDocs: me?.hasDocs,
//     hasProfilePictureKey: typeof me?.hasProfilePicture !== "undefined",
//     profilePictureInline: ppLen > 0,
//     profilePictureBytes: ppLen || 0,
//   });

//   // Slim copy for cache
//   const slim = me ? { ...me } : {};
//   const maybeDrop = (k) => {
//     if (typeof slim[k] === "string" && slim[k].startsWith("data:")) {
//       delete slim[k];
//     }
//   };
//   ["profilePicture", "w9", "businessLicense", "proofOfInsurance", "independentContractorAgreement"].forEach(
//     maybeDrop
//   );
//   if (typeof me?.profilePicture === "string") slim.hasProfilePicture = true;

//   try {
//     await AsyncStorage.setItem("me", JSON.stringify(slim || {}));
//   } catch (e) {
//     console.log("⚠️ Failed to cache /users/me:", e?.message);
//   }

//   return me;
// }

// function evaluateProviderReadiness(me, stripeInfo) {
//   const missing = [];

//   const accountId = stripeInfo?.accountId || null;
//   const needsOnboarding = stripeInfo?.needsOnboarding;
//   if (!accountId) missing.push("Stripe onboarding");
//   else if (needsOnboarding === true) missing.push("Stripe onboarding");

//   if (!hasStr(me?.aboutMe)) missing.push("About Me");
//   const yearsOk =
//     Number.isFinite(me?.yearsExperience) ||
//     (hasStr(me?.yearsExperience) && !isNaN(Number(me?.yearsExperience)));
//   if (!yearsOk) missing.push("Years of Experience");

//   if (!hasStr(me?.serviceType)) missing.push("Primary Service");
//   if (!hasStr(me?.businessName)) missing.push("Business Name");
//   if (!hasStr(me?.address)) missing.push("Business Address");

//   const zipFirst = Array.isArray(me?.zipcode) ? me.zipcode[0] : me?.zipcode;
//   if (!hasStr(zipFirst)) missing.push("Zip Code");

//   if (!hasProfilePic(me)) missing.push("Profile Picture");
//   if (!hasStr(me?.email)) missing.push("Email");
//   if (!hasStr(me?.phoneNumber)) missing.push("Phone Number");

//   if (!asBool(me?.optInSms)) missing.push("SMS Consent");

//   if (!hasDocField(me, "w9")) missing.push("W-9");
//   if (!hasDocField(me, "businessLicense")) missing.push("Business License");
//   if (!hasDocField(me, "proofOfInsurance")) missing.push("Proof of Insurance");

//   const icaViewed =
//     asBool(me?.icaViewed) ||
//     hasStr(me?.independentContractorAgreement) ||
//     asBool(me?.acceptedICA);
//   if (!icaViewed) missing.push("ICA Viewed");
//   if (!asBool(me?.acceptedICA)) missing.push("ICA Agreed");

//   return { ok: missing.length === 0, missing };
// }

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const mountedRef = useRef(true);
//   useEffect(() => () => { mountedRef.current = false; }, []);

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /** one-time permissions (non-blocking) */
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
//           await Notifications.requestPermissionsAsync();
//         }
//       } catch (e) {
//         console.log("⚠️ Permission setup error:", e?.message);
//       }
//     })();
//   }, []);

//   const openUrlSafely = async (url) => {
//     try {
//       if (url && (await Linking.canOpenURL(url))) {
//         await Linking.openURL(url);
//         return true;
//       }
//     } catch (e) {
//       console.log("❌ openUrlSafely error:", e?.message, url);
//     }
//     Alert.alert("Error", "Could not open onboarding link.");
//     return false;
//   };

//   const safeReset = (routeName, params = {}) => {
//     try {
//       const action = { index: 0, routes: [{ name: routeName, params }] };
//       if (navigationRef?.isReady?.()) {
//         navigationRef.reset(action);
//       } else if (navigation && typeof navigation.reset === "function") {
//         navigation.reset(action);
//       } else {
//         navigation.navigate(routeName, params);
//       }
//     } catch (e) {
//       console.log("⚠️ navigation error:", e?.message);
//     }
//   };

//   /** run provider checks in background AFTER navigation */
//   const runProviderGate = async ({ me, stripeAccountId, target }) => {
//     try {
//       // Stripe onboarding status
//       let needsOnboarding = null;
//       let stripeOnboardingUrl = null;
//       let stripeDashboardUrl = null;
//       let requirements = null;

//       if (!stripeAccountId) {
//         Alert.alert(
//           "Connect Payouts",
//           "To receive payouts, connect your Stripe account from your profile.",
//           [
//             { text: "Go to Profile", onPress: () => safeReset("ProviderProfile") },
//             { text: "Later", style: "cancel" },
//           ]
//         );
//         return;
//       }

//       const checkRes = await api.post("/routes/stripe/check-onboarding", {
//         stripeAccountId,
//       });
//       needsOnboarding = checkRes?.data?.needsOnboarding ?? null;
//       stripeOnboardingUrl = checkRes?.data?.stripeOnboardingUrl ?? null;
//       stripeDashboardUrl = checkRes?.data?.stripeDashboardUrl ?? null;
//       requirements = checkRes?.data?.requirements ?? null;

//       // Evaluate readiness
//       let readiness = evaluateProviderReadiness(me || {}, {
//         accountId: stripeAccountId,
//         needsOnboarding,
//       });

//       if (!readiness.ok) {
//         // Re-fetch once from source of truth
//         try {
//           const fresh = await fetchCanonicalMe();
//           me = fresh;
//           readiness = evaluateProviderReadiness(me || {}, {
//             accountId: stripeAccountId,
//             needsOnboarding,
//           });
//         } catch (e) {
//           console.log("⚠️ Re-fetch /users/me failed:", e?.response?.data || e?.message);
//         }
//       }

//       console.log("🧩 Provider readiness ok?", readiness.ok);

//       if (!readiness.ok) {
//         const bullets = readiness.missing.map((m) => `• ${m}`).join("\n");
//         Alert.alert(
//           "Finish Account Setup",
//           `You're signed in, but your profile isn't complete yet.\n\nMissing:\n${bullets}`,
//           [
//             needsOnboarding === true
//               ? {
//                   text: "Open Stripe",
//                   onPress: async () => {
//                     const url = stripeOnboardingUrl || stripeDashboardUrl;
//                     if (url) await openUrlSafely(url);
//                     safeReset(target);
//                   },
//                 }
//               : undefined,
//             {
//               text: "Fix in App",
//               onPress: () =>
//                 safeReset("ProviderProfile", {
//                   // do NOT pass the full `me` to avoid large nav payloads
//                   missingItems: readiness.missing,
//                   missingRequirements: requirements || null,
//                 }),
//             },
//             { text: "Later", style: "cancel" },
//           ].filter(Boolean)
//         );
//       }
//     } catch (providerGateError) {
//       console.log("⚠️ Provider gating failed (non-fatal):", providerGateError?.message);
//     }
//   };

//   /** ---------- LOGIN ---------- */
//   const onSubmit = async () => {
//     try {
//       setLoading(true);
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const typed = email.trim();
//       if (!typed || !password) {
//         setLoading(false);
//         Alert.alert("Missing info", "Please enter your email and password.");
//         return;
//       }

//       const tryLogin = async (emailToUse, label) => {
//         console.log("➡️ POST /auth/login", { email: emailToUse, attempt: label });
//         return api.post(
//           "/auth/login",
//           { email: emailToUse, password },
//           { headers: { "Content-Type": "application/json" } }
//         );
//       };

//       let loginRes = null;
//       try {
//         loginRes = await tryLogin(typed, "typed");
//       } catch (err1) {
//         const status = err1?.response?.status;
//         console.log("❌ Login attempt #1 failed:", { status, message: err1?.message });
//         if (shouldRetryLowercaseLogin(err1)) {
//           const lower = typed.toLowerCase();
//           loginRes = await tryLogin(lower, "lowercased");
//         } else {
//           throw err1;
//         }
//       }

//       const data = loginRes?.data || {};
//       if (!data?.token) throw new Error("Token missing from response");

//       await AsyncStorage.setItem("token", data.token);
//       if (data.refreshToken) await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

//       // Fetch canonical me (returns full; caches slim)
//       let me = null;
//       try {
//         me = await fetchCanonicalMe();
//       } catch (e) {
//         console.log("⚠️ Initial /users/me failed:", e?.response?.data || e?.message);
//       }

//       // Push token (non-blocking)
//       savePushTokenIfAllowed(me).catch(() => {});

//       const payload = parseJwt(data.token) || {};
//       const role = payload?.role || me?.role || "customer";
//       const stripeAccountId =
//         payload?.stripeAccountId ||
//         me?.stripeAccountId ||
//         me?.stripe?.accountId ||
//         null;

//       setRole(role);
//       const target = roleToScreen(role);

//       // 🚀 Navigate immediately to avoid heavy work on login view
//       if (mountedRef.current) setLoading(false);
//       safeReset(target);

//       // 🔧 Provider gate runs asynchronously in the background
//       if ((role || "").toLowerCase() === "serviceprovider") {
//         setTimeout(() => {
//           runProviderGate({ me, stripeAccountId, target }).catch(() => {});
//         }, 0);
//       }
//     } catch (err) {
//       if (mountedRef.current) setLoading(false);
//       const status = err?.response?.status;
//       const raw =
//         err?.response?.data?.msg ||
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";

//       console.log("💥 Login failure:", { status, message: err?.message });

//       let msg = raw;
//       const lower = (raw || "").toLowerCase();
//       if (status === 404 && (lower.includes("user") || lower.includes("email"))) {
//         msg = "We couldn’t find an account with that email.";
//       }
//       if (status === 401 && (lower.includes("invalid") || lower.includes("password"))) {
//         msg = "Invalid email or password.";
//       }
//       Alert.alert("Error", msg);
//     }
//   };

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//             <View style={styles.header}>
//               <View className="logoContainer">
//                 <Image
//                   source={require("../assets/blinqfix_logo-new.jpeg")}
//                   style={{ width: LOGO_SIZE, height: LOGO_SIZE, marginInline: "auto" }}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={styles.title}>Login</Text>
//               <Text style={styles.subtitle}>Enter your credentials to access your account</Text>
//             </View>

//             <View style={styles.formContainer}>
//               <View style={styles.inputContainer}>
//                 <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Email Address"
//                   placeholderTextColor="#94a3b8"
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   autoCorrect={false}
//                   autoComplete="email"
//                   value={email}
//                   onChangeText={setEmail}
//                   returnKeyType="next"
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
//                 <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeIcon}>
//                   {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.forgotPasswordButton}
//                 onPress={() => navigation.navigate("RequestPasswordResetScreen")}
//               >
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={loading}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.loginButtonGradient}>
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

//             <View style={styles.footer}>
//               <Text style={styles.footerText}>Don't have an account?</Text>
//               <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
//                 <Text style={styles.footerLink}>Sign Up</Text>
//               </TouchableOpacity>
//             </View>

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
//   trustText: { color: "#22c55e", marginLeft: 8, fontSize: 12, fontWeight: "500" },
// });


// // app/screens/LoginScreen.js
// import React, { useEffect, useState, useRef } from "react";
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
//   Dimensions,
//   Image,
//   Linking,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
// import { useNavigation } from "@react-navigation/native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Constants from "expo-constants";
// import { decode as atob } from "base-64";

// import api from "../api/client";
// import { useAuth, navigationRef } from "../context/AuthProvider";

// /* ---------- polyfills ---------- */
// // Ensure atob exists for Hermes (iOS real devices often need this)
// if (typeof globalThis.atob !== "function") {
//   // eslint-disable-next-line no-global-assign
//   globalThis.atob = atob;
// }

// /* ---------- tiny helpers ---------- */
// const TAG = "LOGIN2";

// function parseJwt(token) {
//   try {
//     if (!token) return null;
//     const base64Url = token.split(".")[1];
//     if (!base64Url) return null;
//     const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
//     const binary = atob(base64);
//     const jsonPayload = decodeURIComponent(
//       Array.prototype.map
//         .call(binary, (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//         .join("")
//     );
//     return JSON.parse(jsonPayload);
//   } catch {
//     return null;
//   }
// }

// function roleToScreen(role) {
//   const r = (role || "").toLowerCase();
//   if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
//   if (r === "admin") return "AdminDashboard";
//   return "CustomerDashboard";
// }

// function shouldRetryLowercaseLogin(err) {
//   const status = err?.response?.status;
//   const msg =
//     (err?.response?.data?.msg || err?.response?.data?.message || err?.message || "")
//       .toString()
//       .toLowerCase();
//   if (status === 404) return true;
//   if (msg.includes("user not found")) return true;
//   if (msg.includes("invalid credentials")) return true;
//   if (status === 400 && (msg.includes("email") || msg.includes("not found"))) return true;
//   return false;
// }

// /* ---------- push notifications ---------- */
// async function registerForPushNotificationsAsync() {
//   try {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") return null;

//     const projectId =
//       Constants?.expoConfig?.extra?.eas?.projectId ??
//       Constants?.easConfig?.projectId ??
//       null;

//     const tokenData = await Notifications.getExpoPushTokenAsync(
//       projectId ? { projectId } : undefined
//     );
//     const token = tokenData?.data || null;
//     console.log("📮 [PUSH] acquired?", !!token, { projectId });
//     return token;
//   } catch (e) {
//     console.log("❌ [PUSH] failed:", e?.message);
//     return null;
//   }
// }

// async function savePushTokenIfAllowed(me) {
//   try {
//     const expoPush = await registerForPushNotificationsAsync();
//     if (!expoPush) return;

//     const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
//     if (isProvider) {
//       await AsyncStorage.setItem("pendingPushToken", expoPush);
//       console.log("🗃️ [PUSH] stashed for provider");
//       return;
//     }

//     await api.post("/users/push-token", { token: expoPush });
//     await AsyncStorage.removeItem("pendingPushToken");
//     console.log("✅ [PUSH] sent to backend");
//   } catch (e) {
//     console.log("⚠️ [PUSH] send failed, stashing:", e?.response?.data || e?.message);
//     try {
//       const already = await AsyncStorage.getItem("pendingPushToken");
//       if (!already) {
//         const maybe = await registerForPushNotificationsAsync();
//         if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
//       }
//     } catch {}
//   }
// }

// /* ---------- slim fetchers (no blobs) ---------- */
// function stripBlobsForCache(obj) {
//   try {
//     if (!obj || typeof obj !== "object") return obj;
//     const clone = { ...obj };
//     const maybeDrop = (k) => {
//       const v = clone[k];
//       if (typeof v === "string" && (v.startsWith("data:") || v.length > 20000)) {
//         delete clone[k];
//       }
//     };
//     ["profilePicture", "w9", "businessLicense", "proofOfInsurance", "independentContractorAgreement"].forEach(
//       maybeDrop
//     );
//     if (typeof obj?.profilePicture === "string") clone.hasProfilePicture = true;
//     return clone;
//   } catch {
//     return obj;
//   }
// }

// async function fetchMeSlim() {
//   console.log(`➡️  [${TAG}] GET /users/me`);
//   const res = await api.get("/users/me");
//   const me = res?.data?.user ?? res?.data ?? {};
//   const slim = stripBlobsForCache(me);
//   await AsyncStorage.setItem("meSlim", JSON.stringify(slim));
//   console.log(`⬅️  [${TAG}] /users/me ok`, {
//     id: slim?._id,
//     role: slim?.role,
//     hasProfilePicture: !!slim?.hasProfilePicture,
//   });
//   return slim;
// }

// async function fetchReadiness() {
//   console.log(`➡️  [${TAG}] GET /users/me/readiness`);
//   const { data } = await api.get("/users/me/readiness"); // { profileComplete, stripeComplete }
//   const readiness = {
//     profileComplete: !!data?.profileComplete,
//     stripeComplete: !!data?.stripeComplete,
//   };
//   await AsyncStorage.setItem("readiness", JSON.stringify(readiness));
//   console.log(`⬅️  [${TAG}] readiness`, readiness);
//   return readiness;
// }

// /* ---------- component ---------- */
// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const { setRole } = useAuth();

//   const mountedRef = useRef(true);
//   useEffect(() => () => { mountedRef.current = false; }, []);

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const { width } = Dimensions.get("window");
//   const LOGO_SIZE = width * 0.55;

//   /* one-time permissions (non-blocking) */
//   useEffect(() => {
//     (async () => {
//       try {
//         const { status: locStatus } = await Location.getForegroundPermissionsAsync();
//         console.log(`📍 [${TAG}] location perm:`, locStatus);
//         if (locStatus !== "granted") {
//           const { status } = await Location.requestForegroundPermissionsAsync();
//           console.log(`📍 [${TAG}] location request ->`, status);
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
//         console.log(`🔔 [${TAG}] notif perm:`, notifPerm?.status);
//         if (notifPerm.status !== "granted") {
//           const req = await Notifications.requestPermissionsAsync();
//           console.log(`🔔 [${TAG}] notif request ->`, req?.status);
//         }
//       } catch (e) {
//         console.log(`⚠️ [${TAG}] perm setup error:`, e?.message);
//       }
//     })();
//   }, []);

//   const safeReset = (routeName, params = {}) => {
//     try {
//       const action = { index: 0, routes: [{ name: routeName, params }] };
//       if (navigationRef?.isReady?.()) {
//         navigationRef.reset(action);
//       } else if (navigation && typeof navigation.reset === "function") {
//         navigation.reset(action);
//       } else {
//         navigation.navigate(routeName, params);
//       }
//       console.log(`🧭 [${TAG}] reset → ${routeName}`);
//     } catch (e) {
//       console.log(`⚠️ [${TAG}] navigation error:`, e?.message);
//     }
//   };

//   /* ---------- LOGIN ---------- */
//   const onSubmit = async () => {
//     const rid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
//     try {
//       setLoading(true);
//       await AsyncStorage.multiRemove(["token", "refreshToken"]);

//       const typed = email.trim();
//       if (!typed || !password) {
//         setLoading(false);
//         Alert.alert("Missing info", "Please enter your email and password.");
//         return;
//       }

//       const tryLogin = async (emailToUse, label) => {
//         console.log(`➡️  [${TAG}:${rid}] POST /auth/login`, { email: emailToUse, attempt: label });
//         return api.post(
//           "/auth/login",
//           { email: emailToUse, password },
//           { headers: { "Content-Type": "application/json" } }
//         );
//       };

//       let loginRes = null;
//       try {
//         loginRes = await tryLogin(typed, "typed");
//       } catch (err1) {
//         const status = err1?.response?.status;
//         console.log(`❌ [${TAG}:${rid}] login #1 failed`, { status, msg: err1?.message });
//         if (shouldRetryLowercaseLogin(err1)) {
//           const lower = typed.toLowerCase();
//           console.log(`↪️ [${TAG}:${rid}] retry lowercased`, lower);
//           loginRes = await tryLogin(lower, "lowercased");
//         } else {
//           throw err1;
//         }
//       }

//       const data = loginRes?.data || {};
//       const token = data?.token;
//       if (!token) throw new Error("Token missing from response");
//       await AsyncStorage.setItem("token", token);
//       if (data.refreshToken) await AsyncStorage.setItem("refreshToken", data.refreshToken);
//       api.defaults.headers.common.Authorization = `Bearer ${token}`;

//       const payload = parseJwt(token) || {};
//       console.log(`🔑 [${TAG}:${rid}] jwt payload keys`, Object.keys(payload || {}));

//       // Fetch small things only (no blobs)
//       let meSlim = {};
//       let readiness = { profileComplete: false, stripeComplete: false };
//       try {
//         [meSlim, readiness] = await Promise.all([fetchMeSlim(), fetchReadiness()]);
//       } catch (e) {
//         console.log(`⚠️ [${TAG}:${rid}] post-login hydrate failed:`, e?.message);
//       }

//       const role = meSlim?.role || payload?.role || "customer";
//       setRole(role);
//       const target = roleToScreen(role);

//       // Navigate immediately (no gating here)
//       if (mountedRef.current) setLoading(false);
//       safeReset(target);

//       // Fire-and-forget push token save
//       savePushTokenIfAllowed(meSlim).catch(() => {});

//       // Optional: Log readiness so we can see why prompts may appear later
//       console.log(`🧩 [${TAG}:${rid}] readiness`, readiness);
//     } catch (err) {
//       if (mountedRef.current) setLoading(false);
//       const status = err?.response?.status;
//       const raw =
//         err?.response?.data?.msg ||
//         err?.response?.data?.error ||
//         err?.response?.data?.message ||
//         err?.message ||
//         "Login failed – check credentials.";
//       console.log(`💥 [${TAG}:${rid}] login failure`, { status, raw });

//       let msg = raw;
//       const lower = (raw || "").toLowerCase();
//       if (status === 404 && (lower.includes("user") || lower.includes("email"))) {
//         msg = "We couldn’t find an account with that email.";
//       }
//       if (status === 401 && (lower.includes("invalid") || lower.includes("password"))) {
//         msg = "Invalid email or password.";
//       }
//       Alert.alert("Error", msg);
//     }
//   };

//   return (
//     <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
//             <View style={styles.header}>
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require("../assets/blinqfix_logo-new.jpeg")}
//                   style={{ width: LOGO_SIZE, height: LOGO_SIZE, alignSelf: "center" }}
//                   resizeMode="contain"
//                 />
//               </View>
//               <Text style={styles.title}>Login</Text>
//               <Text style={styles.subtitle}>Enter your credentials to access your account</Text>
//             </View>

//             <View style={styles.formContainer}>
//               <View style={styles.inputContainer}>
//                 <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Email Address"
//                   placeholderTextColor="#94a3b8"
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   autoCorrect={false}
//                   autoComplete="email"
//                   value={email}
//                   onChangeText={setEmail}
//                   returnKeyType="next"
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
//                 <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeIcon}>
//                   {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.forgotPasswordButton}
//                 onPress={() => navigation.navigate("RequestPasswordResetScreen")}
//               >
//                 <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={loading}>
//               <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.loginButtonGradient}>
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

//             <View style={styles.footer}>
//               <Text style={styles.footerText}>Don't have an account?</Text>
//               <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
//                 <Text style={styles.footerLink}>Sign Up</Text>
//               </TouchableOpacity>
//             </View>

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

// /* ---------- styles ---------- */
// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 40,
//   },
//   header: { alignItems: "center", marginBottom: 40 },
//   logoContainer: { borderColor: "rgba(250, 204, 21, 0.3)" },
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
//   trustText: { color: "#22c55e", marginLeft: 8, fontSize: 12, fontWeight: "500" },
// });

import React, { useEffect, useState, useRef } from "react";
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
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as IntentLauncher from "expo-intent-launcher";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { decode as atob } from "base-64";

import api from "../api/client";
// NOTE: matches your final working pattern
import { useAuth, navigationRef } from "../context/AuthProvider";

/* ---------- polyfills ---------- */
// Ensure atob exists for Hermes (iOS real devices often need this)
if (typeof globalThis.atob !== "function") {
  // eslint-disable-next-line no-global-assign
  globalThis.atob = atob;
}

/* ---------- tiny helpers ---------- */
const TAG = "LOGIN2";

function parseJwt(token) {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const jsonPayload = decodeURIComponent(
      Array.prototype.map
        .call(binary, (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function roleToScreen(role) {
  const r = (role || "").toLowerCase();
  if (r === "serviceprovider" || r === "provider") return "ServiceProviderDashboard";
  if (r === "admin") return "AdminDashboard";
  return "CustomerDashboard";
}

function shouldRetryLowercaseLogin(err) {
  const status = err?.response?.status;
  const msg =
    (err?.response?.data?.msg || err?.response?.data?.message || err?.message || "")
      .toString()
      .toLowerCase();
  if (status === 404) return true;
  if (msg.includes("user not found")) return true;
  if (msg.includes("invalid credentials")) return true;
  if (status === 400 && (msg.includes("email") || msg.includes("not found"))) return true;
  return false;
}

/* ---------- push notifications ---------- */
async function registerForPushNotificationsAsync() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") return null;

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      null;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const token = tokenData?.data || null;
    console.log("📮 [PUSH] acquired?", !!token, { projectId });
    return token;
  } catch (e) {
    console.log("❌ [PUSH] failed:", e?.message);
    return null;
  }
}

async function flushPendingPushToken() {
  // FIX: Make sure any previously stashed token (esp. from provider devices) gets delivered post-login
  try {
    const pending = await AsyncStorage.getItem("pendingPushToken");
    if (pending) {
      await api.post("/users/push-token", { token: pending });
      await AsyncStorage.removeItem("pendingPushToken");
      console.log("✅ [PUSH] flushed pending token");
    }
  } catch (e) {
    console.log("⚠️ [PUSH] flush failed:", e?.response?.data || e?.message);
  }
}

async function savePushTokenIfAllowed(me) {
  try {
    const expoPush = await registerForPushNotificationsAsync();
    if (!expoPush) return;

    const isProvider = (me?.role || "").toLowerCase() === "serviceprovider";
    if (isProvider) {
      // FIX: Stash for reliability; we'll also try flushing immediately after login
      await AsyncStorage.setItem("pendingPushToken", expoPush);
      console.log("🗃️ [PUSH] stashed for provider");
      return;
    }

    await api.post("/users/push-token", { token: expoPush });
    await AsyncStorage.removeItem("pendingPushToken");
    console.log("✅ [PUSH] sent to backend");
  } catch (e) {
    console.log("⚠️ [PUSH] send failed, stashing:", e?.response?.data || e?.message);
    try {
      const already = await AsyncStorage.getItem("pendingPushToken");
      if (!already) {
        const maybe = await registerForPushNotificationsAsync();
        if (maybe) await AsyncStorage.setItem("pendingPushToken", maybe);
      }
    } catch {}
  }
}

/* ---------- slim fetchers (no blobs) ---------- */
function stripBlobsForCache(obj) {
  try {
    if (!obj || typeof obj !== "object") return obj;
    const clone = { ...obj };
    const maybeDrop = (k) => {
      const v = clone[k];
      if (typeof v === "string" && (v.startsWith("data:") || v.length > 20000)) {
        delete clone[k];
      }
    };
    // FIX: keep AsyncStorage payloads small to prevent iOS crashes on larger provider docs
    [
      "profilePicture",
      "w9",
      "businessLicense",
      "proofOfInsurance",
      "independentContractorAgreement",
    ].forEach(maybeDrop);
    if (typeof obj?.profilePicture === "string") clone.hasProfilePicture = true;
    return clone;
  } catch {
    return obj;
  }
}

async function fetchMeSlim() {
  console.log(`➡️  [${TAG}] GET /users/me`);
  const res = await api.get("/users/me");
  const me = res?.data?.user ?? res?.data ?? {};
  const slim = stripBlobsForCache(me);
  // FIX: persist for later screens that assume user is in storage/context
  await AsyncStorage.setItem("meSlim", JSON.stringify(slim));
  await AsyncStorage.setItem("me", JSON.stringify(slim)); // legacy key just in case other screens read this
  console.log(`⬅️  [${TAG}] /users/me ok`, {
    id: slim?._id,
    role: slim?.role,
    hasProfilePicture: !!slim?.hasProfilePicture,
  });
  return slim;
}

async function fetchReadiness() {
  console.log(`➡️  [${TAG}] GET /users/me/readiness`);
  const { data } = await api.get("/users/me/readiness"); // { profileComplete, stripeComplete }
  const readiness = {
    profileComplete: !!data?.profileComplete,
    stripeComplete: !!data?.stripeComplete,
  };
  await AsyncStorage.setItem("readiness", JSON.stringify(readiness));
  console.log(`⬅️  [${TAG}] readiness`, readiness);
  return readiness;
}

/* ---------- component ---------- */
export default function LoginScreen() {
  const navigation = useNavigation();
  const auth = useAuth();
  const { setRole } = auth || {};

  const mountedRef = useRef(true);
  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { width } = Dimensions.get("window");
  const LOGO_SIZE = width * 0.55;

  /* one-time permissions (non-blocking) */
  useEffect(() => {
    (async () => {
      try {
        const { status: locStatus } = await Location.getForegroundPermissionsAsync();
        console.log(`📍 [${TAG}] location perm:`, locStatus);
        if (locStatus !== "granted") {
          const { status } = await Location.requestForegroundPermissionsAsync();
          console.log(`📍 [${TAG}] location request ->`, status);
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
        const notifPerm = await Notifications.getPermissionsAsync();
        console.log(`🔔 [${TAG}] notif perm:`, notifPerm?.status);
        if (notifPerm.status !== "granted") {
          const req = await Notifications.requestPermissionsAsync();
          console.log(`🔔 [${TAG}] notif request ->`, req?.status);
        }
      } catch (e) {
        console.log(`⚠️ [${TAG}] perm setup error:`, e?.message);
      }
    })();
  }, []);

  const safeReset = (routeName, params = {}) => {
    try {
      const action = { index: 0, routes: [{ name: routeName, params }] };
      if (navigationRef?.isReady?.()) {
        navigationRef.reset(action);
      } else if (navigation && typeof navigation.reset === "function") {
        navigation.reset(action);
      } else {
        navigation.navigate(routeName, params);
      }
      console.log(`🧭 [${TAG}] reset → ${routeName}`);
    } catch (e) {
      console.log(`⚠️ [${TAG}] navigation error:`, e?.message);
    }
  };

  /* ---------- LOGIN ---------- */
  const onSubmit = async () => {
    const rid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    try {
      setLoading(true);
      await AsyncStorage.multiRemove(["token", "refreshToken"]);

      const typed = email.trim();
      if (!typed || !password) {
        setLoading(false);
        Alert.alert("Missing info", "Please enter your email and password.");
        return;
      }

      const tryLogin = async (emailToUse, label) => {
        console.log(`➡️  [${TAG}:${rid}] POST /auth/login`, { email: emailToUse, attempt: label });
        return api.post(
          "/auth/login",
          { email: emailToUse, password },
          { headers: { "Content-Type": "application/json" } }
        );
      };

      let loginRes = null;
      try {
        loginRes = await tryLogin(typed, "typed");
      } catch (err1) {
        const status = err1?.response?.status;
        console.log(`❌ [${TAG}:${rid}] login #1 failed`, { status, msg: err1?.message });
        if (shouldRetryLowercaseLogin(err1)) {
          const lower = typed.toLowerCase();
          console.log(`↪️ [${TAG}:${rid}] retry lowercased`, lower);
          loginRes = await tryLogin(lower, "lowercased");
        } else {
          throw err1;
        }
      }

      const data = loginRes?.data || {};
      const token = data?.token;
      if (!token) throw new Error("Token missing from response");

      // Persist tokens first
      await AsyncStorage.setItem("token", token);
      if (data.refreshToken) await AsyncStorage.setItem("refreshToken", data.refreshToken);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      const payload = parseJwt(token) || {};
      console.log(`🔑 [${TAG}:${rid}] jwt payload keys`, Object.keys(payload || {}));

      // Fetch small things only (no blobs)
      let meSlim = {};
      let readiness = { profileComplete: false, stripeComplete: false };
      try {
        [meSlim, readiness] = await Promise.all([fetchMeSlim(), fetchReadiness()]);
      } catch (e) {
        console.log(`⚠️ [${TAG}:${rid}] post-login hydrate failed:`, e?.message);
      }

      const role = meSlim?.role || payload?.role || "customer";

      // FIX: update auth context comprehensively so provider screens don't crash
      try {
        if (typeof setRole === "function") setRole(role);
        if (auth?.setUser) auth.setUser(meSlim);
        if (auth?.setTokens) auth.setTokens({ accessToken: token, refreshToken: data?.refreshToken || null });
        if (auth?.setIsLoggedIn) auth.setIsLoggedIn(true);
      } catch (e) {
        console.log("⚠️ [LOGIN] auth context update failed:", e?.message);
      }

      // Choose target route
      const target = roleToScreen(role);

      // Stop spinner before navigating
      if (mountedRef.current) setLoading(false);

      // Navigate (pass readiness so downstream screens can render safely)
      safeReset(target, { readiness });

      // Fire-and-forget: push token handling (both save + flush any pending)
      Promise.allSettled([
        savePushTokenIfAllowed(meSlim),
        flushPendingPushToken(),
      ]).catch(() => {});

      // Optional: Log readiness so we can see why prompts may appear later
      console.log(`🧩 [${TAG}:${rid}] readiness`, readiness);
    } catch (err) {
      if (mountedRef.current) setLoading(false);
      const status = err?.response?.status;
      const raw =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Login failed – check credentials.";
      console.log(`💥 [${TAG}:${rid}] login failure`, { status, raw });

      let msg = raw;
      const lower = (raw || "").toLowerCase();
      if (status === 404 && (lower.includes("user") || lower.includes("email"))) {
        msg = "We couldn’t find an account with that email.";
      }
      if (status === 401 && (lower.includes("invalid") || lower.includes("password"))) {
        msg = "Invalid email or password.";
      }
      Alert.alert("Error", msg);
    }
  };

  return (
    <LinearGradient colors={["#0f172a", "#1e3a8a", "#312e81"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/blinqfix_logo-new.jpeg")}
                  style={{ width: LOGO_SIZE, height: LOGO_SIZE, alignSelf: "center" }}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>Enter your credentials to access your account</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
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
                <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeIcon}>
                  {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => navigation.navigate("RequestPasswordResetScreen")}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={onSubmit} disabled={loading}>
              <LinearGradient colors={["#22c55e", "#16a34a"]} style={styles.loginButtonGradient}>
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

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>

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

/* ---------- styles ---------- */
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
  trustText: { color: "#22c55e", marginLeft: 8, fontSize: 12, fontWeight: "500" },
});
