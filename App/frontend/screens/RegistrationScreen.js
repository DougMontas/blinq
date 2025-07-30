// // // frontend/screens/RegistrationScreen.js
// // //working profit sharing only
// // import React, { useState, useEffect } from "react";
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   ScrollView,
// //   Alert,
// //   StyleSheet
// // } from "react-native";
// // import * as Location from "expo-location";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { useNavigation } from "@react-navigation/native";
// // // If using @stripe/stripe-react-native (not modified here):
// // import { useStripe } from "@stripe/stripe-react-native";

// // import api from "../api/client";

// // const SERVICES = [
// //   "Electrician",
// //   "HVAC",
// //   "Plumbing",
// //   "Roofing",
// //   "Cleaning",
// //   "Handyman",
// //   "Odd_Jobs"
// // ];
// // const BILLING = ["profit_sharing", "hybrid"]; // you can add "subscription" later

// // export default function RegistrationScreen() {
// //   const navigation = useNavigation();
// //   const stripe = useStripe();

// //   const [formData, setFormData] = useState({
// //     name: "",
// //     email: "",
// //     password: "",
// //     address: "",
// //     phoneNumber: "",
// //     zipcode: "",
// //     role: "customer",
// //     serviceType: "00000",
// //     billingTier: ""
// //   });
// //   const [location, setLocation] = useState(null);
// //   const [loading, setLoading] = useState(false);

// //   // Acquire geolocation if permitted
// //   useEffect(() => {
// //     (async () => {
// //       const { status } = await Location.requestForegroundPermissionsAsync();
// //       if (status === "granted") {
// //         const pos = await Location.getCurrentPositionAsync({});
// //         setLocation([pos.coords.latitude, pos.coords.longitude]);
// //       }
// //     })();
// //   }, []);

// //   // Handle form field changes, plus reset provider-only fields when switching back to customer
// //   const onChange = (field, value) => {
// //     setFormData(prev => {
// //       if (field === "role") {
// //         return {
// //           ...prev,
// //           role: value,
// //           serviceType: value === "serviceProvider" ? prev.serviceType || SERVICES[0] : "",
// //           billingTier: value === "serviceProvider" ? prev.billingTier || BILLING[0] : ""
// //         };
// //       }
// //       return { ...prev, [field]: value };
// //     });
// //   };

// //   const onSubmit = async () => {
// //     // must have address & zipcode
// //     if (!formData.address.trim() || !formData.zipcode.trim()) {
// //       Alert.alert("Error", "Address and zipcode are required.");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       // build payload
// //       const payload = { ...formData };
// //       if (location) {
// //         payload.location = {
// //           type: "Point",
// //           coordinates: [location[1], location[0]]
// //         };
// //       }

// //       if (formData.role === "customer") {
// //         // customer → always active & no provider fields
// //         payload.isActive = true;
// //         delete payload.serviceType;
// //         delete payload.billingTier;
// //       } else {
// //         // serviceProvider → always inactive until approved
// //         payload.isActive = false;
// //       }

// //       // register
// //       const signupRes = await api.post("/auth/register", payload);
// //       // console.log("signupRes.data:", signupRes.data);

// //       // get token (fallback to login if none)
// //       let token = signupRes.data.token || signupRes.data.jwt;
// //       if (!token) {
// //         const loginRes = await api.post("/auth/login", {
// //           email: formData.email,
// //           password: formData.password
// //         });
// //         token = loginRes.data.token || loginRes.data.jwt;
// //       }
// //       if (!token) throw new Error("No JWT returned.");

// //       // store token & name
// //       await AsyncStorage.setItem("token", token);
// //       await AsyncStorage.setItem("userName", signupRes.data.name || formData.name);

// //       // navigate
// //       if (formData.role === "customer") {
// //         Alert.alert("Success", "Signed up! Please log in.");
// //         navigation.reset({
// //           index: 0,
// //           routes: [{ name: "Login" }]   // ← fixed route name
// //         });
// //       } else {
// //         // service provider lands in their dashboard
// //         navigation.reset({
// //           index: 0,
// //           routes: [{ name: "ServiceProviderDashboard" }]
// //         });
// //       }
// //     } catch (err) {
// //       console.error("Signup error:", err.response?.data || err.message);
// //       Alert.alert("Error", err.response?.data?.msg || "Signup failed");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, marginBottom: '2rem' }}>
// //       <Text style={styles.title}>Signup</Text>

// //       {/* Name */}
// //       <Text style={styles.label}>Full Name</Text>
// //       <TextInput
// //         style={styles.input}
// //         value={formData.name}
// //         onChangeText={val => onChange("name", val)}
// //       />

// //       {/* Email */}
// //       <Text style={styles.label}>Email</Text>
// //       <TextInput
// //         style={styles.input}
// //         keyboardType="email-address"
// //         value={formData.email}
// //         onChangeText={val => onChange("email", val)}
// //       />

// //       {/* Password */}
// //       <Text style={styles.label}>Password</Text>
// //       <TextInput
// //         style={styles.input}
// //         secureTextEntry
// //         value={formData.password}
// //         onChangeText={val => onChange("password", val)}
// //       />

// //       {/* Address */}
// //       <Text style={styles.label}>Property Address</Text>
// //       <TextInput
// //         style={styles.input}
// //         value={formData.address}
// //         onChangeText={val => onChange("address", val)}
// //       />

// //       {/* Phone */}
// //       <Text style={styles.label}>Phone Number</Text>
// //       <TextInput
// //         style={styles.input}
// //         keyboardType="phone-pad"
// //         value={formData.phoneNumber}
// //         onChangeText={val => onChange("phoneNumber", val)}
// //       />

// //       {/* Zip */}
// //       <Text style={styles.label}>Zipcode</Text>
// //       <TextInput
// //         style={styles.input}
// //         value={formData.zipcode}
// //         onChangeText={val => onChange("zipcode", val)}
// //       />

// //       {/* Role */}
// //       <Text style={styles.label}>Select Role</Text>
// //       <Text style={styles.label}>Select Billing Tier</Text>
// // <View style={styles.selectRow}>
// //   {BILLING.map((tier) => (
// //     <TouchableOpacity
// //       key={tier}
// //       style={[
// //         styles.selectOptionSmall,
// //         formData.billingTier === tier && styles.selectOptionSelected
// //       ]}
// //       onPress={() => onChange("billingTier", tier)}
// //     >
// //       <Text style={styles.selectOptionText}>
// //         {tier === "hybrid" ? "Hybrid ($49/mo + 7%)" : "Profit Sharing (7%)"}
// //       </Text>
// //     </TouchableOpacity>
// //   ))}
// // </View>

// //       <View style={styles.selectRow}>
// //         <TouchableOpacity
// //           style={[
// //             styles.selectOption,
// //             formData.role === "serviceProvider" && styles.selectOptionSelected
// //           ]}
// //           onPress={() => onChange("role", "serviceProvider")}
// //         >
// //           <Text style={styles.selectOptionText}>Earn with BlinqFix</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity
// //           style={[
// //             styles.selectOption,
// //             formData.role === "customer" && styles.selectOptionSelected
// //           ]}
// //           onPress={() => onChange("role", "customer")}
// //         >
// //           <Text style={styles.selectOptionText}>Book a BlinqFix Job</Text>
// //         </TouchableOpacity>
// //       </View>

// //       {/* Provider-only fields */}
// //       {formData.role === "serviceProvider" && (
// //         <>
// //           <Text style={styles.label}>Select Service Type</Text>
// //           <View style={styles.selectRow}>
// //             {SERVICES.map(svc => (
// //               <TouchableOpacity
// //                 key={svc}
// //                 style={[
// //                   styles.selectOptionSmall,
// //                   formData.serviceType === svc && styles.selectOptionSelected
// //                 ]}
// //                 onPress={() => onChange("serviceType", svc)}
// //               >
// //                 <Text style={styles.selectOptionText}>{svc}</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </View>
// //         </>
// //       )}

// //       {/* Submit */}
// //       <TouchableOpacity
// //         style={styles.submitBtn}
// //         onPress={onSubmit}
// //         disabled={loading}
// //       >
// //         <Text style={styles.submitBtnText}>
// //           {loading ? "Signing Up…" : "Sign Up"}
// //         </Text>
// //       </TouchableOpacity>

// //       {/* Already have an account */}
// //       <Text style={styles.footerText}>
// //         Already have an account?{" "}
// //         <Text style={styles.linkText} onPress={() => navigation.navigate("Login")}>
// //           Login
// //         </Text>
// //       </Text>
// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { backgroundColor: "#fff", marginVertical: 25 },
// //   title: { fontSize: 24, fontWeight: "bold", marginVertical: 26, textAlign: "center" },
// //   label: { fontSize: 16, marginTop: 12, marginBottom: 4 },
// //   input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10 },
// //   selectRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
// //   selectOption: {
// //     flex: 1,
// //     padding: 10,
// //     marginHorizontal: 4,
// //     backgroundColor: "#eee",
// //     borderRadius: 6,
// //     alignItems: "center"
// //   },
// //   selectOptionSmall: {
// //     padding: 8,
// //     marginRight: 8,
// //     marginBottom: 8,
// //     backgroundColor: "#eee",
// //     borderRadius: 6
// //   },
// //   selectOptionSelected: {
// //     backgroundColor: "#a6e1fa",
// //     borderColor: "#1976d2",
// //     borderWidth: 1
// //   },
// //   selectOptionText: { fontSize: 14 },
// //   submitBtn: {
// //     marginTop: 20,
// //     padding: 16,
// //     backgroundColor: "#1976d2",
// //     borderRadius: 6,
// //     alignItems: "center"
// //   },
// //   submitBtnText: { color: "#fff", fontWeight: "600" },
// //   footerText: { marginTop: 16, textAlign: "center", marginBottom: '-2rem' },
// //   linkText: { color: "#1976d2", fontWeight: "600", textDecorationLine: "underline" }
// // });

// //working
// // import React, { useState, useEffect } from "react";
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   ScrollView,
// //   Alert,
// //   StyleSheet,
// //   Linking,
// // } from "react-native";
// // import * as Location from "expo-location";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { useNavigation } from "@react-navigation/native";
// // import { useStripe } from "@stripe/stripe-react-native";

// // import api from "../api/client";

// // const SERVICES = [
// //   "Electrician",
// //   "HVAC",
// //   "Plumbing",
// //   "Roofing",
// //   "Cleaning",
// //   "Handyman",
// //   "Odd_Jobs",
// // ];
// // const BILLING = ["profit_sharing", "hybrid"];

// // export default function RegistrationScreen() {
// //   const navigation = useNavigation();
// //   const stripe = useStripe();

// //   const [formData, setFormData] = useState({
// //     name: "",
// //     email: "",
// //     password: "",
// //     address: "",
// //     phoneNumber: "",
// //     zipcode: "",
// //     role: "customer",
// //     serviceType: "00000",
// //     billingTier: ""
// //   });
// //   const [location, setLocation] = useState(null);
// //   const [loading, setLoading] = useState(false);

// //   useEffect(() => {
// //     (async () => {
// //       const { status } = await Location.requestForegroundPermissionsAsync();
// //       if (status === "granted") {
// //         const pos = await Location.getCurrentPositionAsync({});
// //         setLocation([pos.coords.latitude, pos.coords.longitude]);
// //       }
// //     })();
// //   }, []);

// //   const onChange = (field, value) => {
// //     setFormData((prev) => {
// //       if (field === "role") {
// //         return {
// //           ...prev,
// //           role: value,
// //           serviceType:
// //             value === "serviceProvider" ? prev.serviceType || SERVICES[0] : "",
// //           billingTier:
// //             value === "serviceProvider" ? prev.billingTier || BILLING[0] : "",
// //         };
// //       }
// //       return { ...prev, [field]: value };
// //     });
// //   };

// //   const onSubmit = async () => {
// //     if (!formData.address.trim() || !formData.zipcode.trim()) {
// //       Alert.alert("Error", "Address and zipcode are required.");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const payload = { ...formData };
// //       if (location) {
// //         payload.location = {
// //           type: "Point",
// //           coordinates: [location[1], location[0]]
// //         };
// //       }

// //       if (formData.role === "customer") {
// //         payload.isActive = true;
// //         delete payload.serviceType;
// //         delete payload.billingTier;
// //       } else {
// //         payload.isActive = false;
// //       }

// //       const signupRes = await api.post("/auth/register", payload);

// //       let token = signupRes.data.token || signupRes.data.jwt;
// //       if (!token) {
// //         const loginRes = await api.post("/auth/login", {
// //           email: formData.email,
// //           password: formData.password
// //         });
// //         token = loginRes.data.token || loginRes.data.jwt;
// //       }
// //       if (!token) throw new Error("No JWT returned.");

// //       await AsyncStorage.setItem("token", token);
// //       await AsyncStorage.setItem("userName", signupRes.data.name || formData.name);

// //       if (formData.role === "customer") {
// //         Alert.alert("Success", "Signed up! Please log in.");
// //         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
// //       } else {
// //         const stripeUrl =
// //           signupRes.data.stripeSubscriptionUrl ||
// //           signupRes.data.stripeOnboardingUrl;

// //         if (stripeUrl) {
// //           Alert.alert("Redirecting", "Complete onboarding with Stripe.");
// //           Linking.openURL(stripeUrl);
// //         } else {
// //           navigation.reset({ index: 0, routes: [{ name: "ServiceProviderDashboard" }] });
// //         }
// //       }
// //     } catch (err) {
// //       console.error("Signup error:", err.response?.data || err.message);
// //       Alert.alert("Error", err.response?.data?.msg || "Signup failed");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, marginBottom: '2rem' }}>
// //       <Text style={styles.title}>Signup</Text>

// //       <Text style={styles.label}>Full Name</Text>
// //       <TextInput style={styles.input} value={formData.name} onChangeText={(val) => onChange("name", val)} />

// //       <Text style={styles.label}>Email</Text>
// //       <TextInput style={styles.input} keyboardType="email-address" value={formData.email} onChangeText={(val) => onChange("email", val)} />

// //       <Text style={styles.label}>Password</Text>
// //       <TextInput style={styles.input} secureTextEntry value={formData.password} onChangeText={(val) => onChange("password", val)} />

// //       <Text style={styles.label}>Property Address</Text>
// //       <TextInput style={styles.input} value={formData.address} onChangeText={(val) => onChange("address", val)} />

// //       <Text style={styles.label}>Phone Number</Text>
// //       <TextInput style={styles.input} keyboardType="phone-pad" value={formData.phoneNumber} onChangeText={(val) => onChange("phoneNumber", val)} />

// //       <Text style={styles.label}>Zipcode</Text>
// //       <TextInput style={styles.input} value={formData.zipcode} onChangeText={(val) => onChange("zipcode", val)} />

// //       <Text style={styles.label}>Select Role</Text>
// //       <Text style={styles.label}>Select Billing Tier</Text>
// //       <View style={styles.selectRow}>
// //         {BILLING.map((tier) => (
// //           <TouchableOpacity
// //             key={tier}
// //             style={[styles.selectOptionSmall, formData.billingTier === tier && styles.selectOptionSelected]}
// //             onPress={() => onChange("billingTier", tier)}
// //           >
// //             <Text style={styles.selectOptionText}>{tier === "hybrid" ? "Hybrid ($49/mo + 7%)" : "Profit Sharing (7%)"}</Text>
// //           </TouchableOpacity>
// //         ))}
// //       </View>

// //       <View style={styles.selectRow}>
// //         <TouchableOpacity
// //           style={[styles.selectOption, formData.role === "serviceProvider" && styles.selectOptionSelected]}
// //           onPress={() => onChange("role", "serviceProvider")}
// //         >
// //           <Text style={styles.selectOptionText}>Earn with BlinqFix</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity
// //           style={[styles.selectOption, formData.role === "customer" && styles.selectOptionSelected]}
// //           onPress={() => onChange("role", "customer")}
// //         >
// //           <Text style={styles.selectOptionText}>Book a BlinqFix Job</Text>
// //         </TouchableOpacity>
// //       </View>

// //       {formData.role === "serviceProvider" && (
// //         <>
// //           <Text style={styles.label}>Select Service Type</Text>
// //           <View style={styles.selectRow}>
// //             {SERVICES.map((svc) => (
// //               <TouchableOpacity
// //                 key={svc}
// //                 style={[styles.selectOptionSmall, formData.serviceType === svc && styles.selectOptionSelected]}
// //                 onPress={() => onChange("serviceType", svc)}
// //               >
// //                 <Text style={styles.selectOptionText}>{svc}</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </View>
// //         </>
// //       )}

// //       <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
// //         <Text style={styles.submitBtnText}>{loading ? "Signing Up…" : "Sign Up"}</Text>
// //       </TouchableOpacity>

// //       <Text style={styles.footerText}>
// //         Already have an account?{' '}
// //         <Text style={styles.linkText} onPress={() => navigation.navigate("Login")}>Login</Text>
// //       </Text>
// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { backgroundColor: "#fff", marginVertical: 25 },
// //   title: { fontSize: 24, fontWeight: "bold", marginVertical: 26, textAlign: "center" },
// //   label: { fontSize: 16, marginTop: 12, marginBottom: 4 },
// //   input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10 },
// //   selectRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
// //   selectOption: {
// //     flex: 1,
// //     padding: 10,
// //     marginHorizontal: 4,
// //     backgroundColor: "#eee",
// //     borderRadius: 6,
// //     alignItems: "center"
// //   },
// //   selectOptionSmall: {
// //     padding: 8,
// //     marginRight: 8,
// //     marginBottom: 8,
// //     backgroundColor: "#eee",
// //     borderRadius: 6
// //   },
// //   selectOptionSelected: {
// //     backgroundColor: "#a6e1fa",
// //     borderColor: "#1976d2",
// //     borderWidth: 1
// //   },
// //   selectOptionText: { fontSize: 14 },
// //   submitBtn: {
// //     marginTop: 20,
// //     padding: 16,
// //     backgroundColor: "#1976d2",
// //     borderRadius: 6,
// //     alignItems: "center"
// //   },
// //   submitBtnText: { color: "#fff", fontWeight: "600" },
// //   footerText: { marginTop: 16, textAlign: "center", marginBottom: '-2rem' },
// //   linkText: { color: "#1976d2", fontWeight: "600", textDecorationLine: "underline" }
// // });

// // import React, { useState, useEffect } from "react";
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   ScrollView,
// //   Alert,
// //   StyleSheet,
// //   Linking,
// // } from "react-native";
// // import * as Location from "expo-location";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { useNavigation } from "@react-navigation/native";
// // import { useStripe } from "@stripe/stripe-react-native";

// // import api from "../api/client";

// // const SERVICES = [
// //   "Electrician",
// //   "HVAC",
// //   "Plumbing",
// //   "Roofing",
// //   "Cleaning",
// //   "Handyman",
// //   "Odd_Jobs",
// // ];
// // const BILLING = ["profit_sharing", "hybrid"];

// // export default function RegistrationScreen() {
// //   const navigation = useNavigation();
// //   const stripe = useStripe();

// //   const [formData, setFormData] = useState({
// //     name: "",
// //     email: "",
// //     password: "",
// //     address: "",
// //     phoneNumber: "",
// //     zipcode: "",
// //     role: "customer",
// //     serviceType: "00000",
// //     billingTier: ""
// //   });
// //   const [location, setLocation] = useState(null);
// //   const [loading, setLoading] = useState(false);

// //   useEffect(() => {
// //     (async () => {
// //       const { status } = await Location.requestForegroundPermissionsAsync();
// //       if (status === "granted") {
// //         const pos = await Location.getCurrentPositionAsync({});
// //         setLocation([pos.coords.latitude, pos.coords.longitude]);
// //       }
// //     })();
// //   }, []);

// //   const onChange = (field, value) => {
// //     setFormData((prev) => {
// //       if (field === "role") {
// //         return {
// //           ...prev,
// //           role: value,
// //           serviceType:
// //             value === "serviceProvider" ? prev.serviceType || SERVICES[0] : "",
// //           billingTier: value === "serviceProvider" ? "" : ""
// //         };
// //       }
// //       return { ...prev, [field]: value };
// //     });
// //   };

// //   const onSubmit = async () => {
// //     if (!formData.address.trim() || !formData.zipcode.trim()) {
// //       Alert.alert("Error", "Address and zipcode are required.");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const payload = { ...formData };
// //       if (location) {
// //         payload.location = {
// //           type: "Point",
// //           coordinates: [location[1], location[0]]
// //         };
// //       }

// //       if (formData.role === "customer") {
// //         payload.isActive = true;
// //         delete payload.serviceType;
// //         delete payload.billingTier;
// //       } else {
// //         payload.isActive = false;
// //       }

// //       const signupRes = await api.post("/auth/register", payload);

// //       let token = signupRes.data.token || signupRes.data.jwt;
// //       if (!token) {
// //         const loginRes = await api.post("/auth/login", {
// //           email: formData.email,
// //           password: formData.password
// //         });
// //         token = loginRes.data.token || loginRes.data.jwt;
// //       }
// //       if (!token) throw new Error("No JWT returned.");

// //       await AsyncStorage.setItem("token", token);
// //       await AsyncStorage.setItem("userName", signupRes.data.name || formData.name);

// //       if (formData.role === "customer") {
// //         Alert.alert("Success", "Signed up! Please log in.");
// //         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
// //       } else {
// //         const stripeUrl =
// //           signupRes.data.stripeSubscriptionUrl ||
// //           signupRes.data.stripeOnboardingUrl;

// //         if (stripeUrl) {
// //           Alert.alert("Redirecting", "Complete onboarding with Stripe.");
// //           Linking.openURL(stripeUrl);
// //         } else {
// //           navigation.reset({ index: 0, routes: [{ name: "ServiceProviderDashboard" }] });
// //         }
// //       }
// //     } catch (err) {
// //       console.error("Signup error:", err.response?.data || err.message);
// //       Alert.alert("Error", err.response?.data?.msg || "Signup failed");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, marginBottom: '2rem' }}>
// //       <Text style={styles.title}>Signup</Text>

// //       <Text style={styles.label}>Full Name</Text>
// //       <TextInput style={styles.input} value={formData.name} onChangeText={(val) => onChange("name", val)} />

// //       <Text style={styles.label}>Email</Text>
// //       <TextInput style={styles.input} keyboardType="email-address" value={formData.email} onChangeText={(val) => onChange("email", val)} />

// //       <Text style={styles.label}>Password</Text>
// //       <TextInput style={styles.input} secureTextEntry value={formData.password} onChangeText={(val) => onChange("password", val)} />

// //       <Text style={styles.label}>Property Address</Text>
// //       <TextInput style={styles.input} value={formData.address} onChangeText={(val) => onChange("address", val)} />

// //       <Text style={styles.label}>Phone Number</Text>
// //       <TextInput style={styles.input} keyboardType="phone-pad" value={formData.phoneNumber} onChangeText={(val) => onChange("phoneNumber", val)} />

// //       <Text style={styles.label}>Zipcode</Text>
// //       <TextInput style={styles.input} value={formData.zipcode} onChangeText={(val) => onChange("zipcode", val)} />

// //       <Text style={styles.label}>Select Role</Text>
// //       <View style={styles.selectRow}>
// //         <TouchableOpacity
// //           style={[styles.selectOption, formData.role === "serviceProvider" && styles.selectOptionSelected]}
// //           onPress={() => onChange("role", "serviceProvider")}
// //         >
// //           <Text style={styles.selectOptionText}>Earn with BlinqFix</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity
// //           style={[styles.selectOption, formData.role === "customer" && styles.selectOptionSelected]}
// //           onPress={() => onChange("role", "customer")}
// //         >
// //           <Text style={styles.selectOptionText}>Book a BlinqFix Job</Text>
// //         </TouchableOpacity>
// //       </View>

// //       {formData.role === "serviceProvider" && (
// //         <>
// //           <Text style={styles.label}>Select Billing Tier</Text>
// //           <View style={styles.selectRow}>
// //             {BILLING.map((tier) => (
// //               <TouchableOpacity
// //                 key={tier}
// //                 style={[styles.selectOptionSmall, formData.billingTier === tier && styles.selectOptionSelected]}
// //                 onPress={() => onChange("billingTier", tier)}
// //               >
// //                 <Text style={styles.selectOptionText}>{tier === "hybrid" ? "Hybrid ($49/mo + 7%)" : "Profit Sharing (7%)"}</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </View>

// //           <Text style={styles.label}>Select Service Type</Text>
// //           <View style={styles.selectRow}>
// //             {SERVICES.map((svc) => (
// //               <TouchableOpacity
// //                 key={svc}
// //                 style={[styles.selectOptionSmall, formData.serviceType === svc && styles.selectOptionSelected]}
// //                 onPress={() => onChange("serviceType", svc)}
// //               >
// //                 <Text style={styles.selectOptionText}>{svc}</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </View>
// //         </>
// //       )}

// //       <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
// //         <Text style={styles.submitBtnText}>{loading ? "Signing Up…" : "Sign Up"}</Text>
// //       </TouchableOpacity>

// //       <Text style={styles.footerText}>
// //         Already have an account?{' '}
// //         <Text style={styles.linkText} onPress={() => navigation.navigate("Login")}>Login</Text>
// //       </Text>
// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { backgroundColor: "#fff", marginVertical: 25 },
// //   title: { fontSize: 24, fontWeight: "bold", marginVertical: 26, textAlign: "center" },
// //   label: { fontSize: 16, marginTop: 12, marginBottom: 4 },
// //   input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10 },
// //   selectRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
// //   selectOption: {
// //     flex: 1,
// //     padding: 10,
// //     marginHorizontal: 4,
// //     backgroundColor: "#eee",
// //     borderRadius: 6,
// //     alignItems: "center"
// //   },
// //   selectOptionSmall: {
// //     padding: 8,
// //     marginRight: 8,
// //     marginBottom: 8,
// //     backgroundColor: "#eee",
// //     borderRadius: 6
// //   },
// //   selectOptionSelected: {
// //     backgroundColor: "#a6e1fa",
// //     borderColor: "#1976d2",
// //     borderWidth: 1
// //   },
// //   selectOptionText: { fontSize: 14 },
// //   submitBtn: {
// //     marginTop: 20,
// //     padding: 16,
// //     backgroundColor: "#1976d2",
// //     borderRadius: 6,
// //     alignItems: "center"
// //   },
// //   submitBtnText: { color: "#fff", fontWeight: "600" },
// //   footerText: { marginTop: 16, textAlign: "center", marginBottom: '-2rem' },
// //   linkText: { color: "#1976d2", fontWeight: "600", textDecorationLine: "underline" }
// // });

// //working
// // import React, { useState, useEffect } from "react";
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   ScrollView,
// //   Alert,
// //   StyleSheet,
// //   Linking,
// // } from "react-native";
// // import * as Location from "expo-location";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { useNavigation } from "@react-navigation/native";
// // import { useStripe } from "@stripe/stripe-react-native";

// // import api from "../api/client";

// // const SERVICES = [
// //   "Electrician",
// //   "HVAC",
// //   "Plumbing",
// //   "Roofing",
// //   "Cleaning",
// //   "Handyman",
// //   "Odd_Jobs",
// // ];
// // const BILLING = ["profit_sharing", "hybrid"];

// // const BILLING_PRODUCT_IDS = {
// //   hybrid: "prod_S71nDAu8fYLFGa",
// //   profit_sharing: "prod_SRVui6dGPZ11rv"
// // };

// // export default function RegistrationScreen() {
// //   const navigation = useNavigation();
// //   const stripe = useStripe();

// //   const [formData, setFormData] = useState({
// //     name: "",
// //     email: "",
// //     password: "",
// //     address: "",
// //     phoneNumber: "",
// //     zipcode: "",
// //     role: "customer",
// //     serviceType: "00000",
// //     billingTier: ""
// //   });
// //   const [location, setLocation] = useState(null);
// //   const [loading, setLoading] = useState(false);

// //   useEffect(() => {
// //     (async () => {
// //       const { status } = await Location.requestForegroundPermissionsAsync();
// //       if (status === "granted") {
// //         const pos = await Location.getCurrentPositionAsync({});
// //         setLocation([pos.coords.latitude, pos.coords.longitude]);
// //       }
// //     })();
// //   }, []);

// //   const onChange = (field, value) => {
// //     setFormData((prev) => {
// //       if (field === "role") {
// //         return {
// //           ...prev,
// //           role: value,
// //           serviceType:
// //             value === "serviceProvider" ? prev.serviceType || SERVICES[0] : "",
// //           billingTier:
// //             value === "serviceProvider" ? prev.billingTier || BILLING[0] : "",
// //         };
// //       }
// //       return { ...prev, [field]: value };
// //     });
// //   };

// //   const onSubmit = async () => {
// //     if (!formData.address.trim() || !formData.zipcode.trim()) {
// //       Alert.alert("Error", "Address and zipcode are required.");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const payload = { ...formData };
// //       if (location) {
// //         payload.location = {
// //           type: "Point",
// //           coordinates: [location[1], location[0]]
// //         };
// //       }

// //       if (formData.role === "customer") {
// //         payload.isActive = true;
// //         delete payload.serviceType;
// //         delete payload.billingTier;
// //       } else {
// //         payload.isActive = false;
// //         payload.productId = BILLING_PRODUCT_IDS[formData.billingTier];
// //       }

// //       const signupRes = await api.post("/auth/register", payload);

// //       let token = signupRes.data.token || signupRes.data.jwt;
// //       if (!token) {
// //         const loginRes = await api.post("/auth/login", {
// //           email: formData.email,
// //           password: formData.password
// //         });
// //         token = loginRes.data.token || loginRes.data.jwt;
// //       }
// //       if (!token) throw new Error("No JWT returned.");

// //       await AsyncStorage.setItem("token", token);
// //       await AsyncStorage.setItem("userName", signupRes.data.name || formData.name);

// //       if (formData.role === "customer") {
// //         Alert.alert("Success", "Signed up! Please log in.");
// //         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
// //       } else {
// //         const stripeUrl =
// //           signupRes.data.stripeSubscriptionUrl ||
// //           signupRes.data.stripeOnboardingUrl;

// //         if (stripeUrl) {
// //           Alert.alert("Redirecting", "Complete onboarding with Stripe.");
// //           Linking.openURL(stripeUrl);
// //         } else {
// //           navigation.reset({ index: 0, routes: [{ name: "ServiceProviderDashboard" }] });
// //         }
// //       }
// //     } catch (err) {
// //       console.error("Signup error:", err.response?.data || err.message);
// //       Alert.alert("Error", err.response?.data?.msg || "Signup failed");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, marginBottom: '2rem' }}>
// //       <Text style={styles.title}>Signup</Text>

// //       <Text style={styles.label}>Full Name</Text>
// //       <TextInput style={styles.input} value={formData.name} onChangeText={(val) => onChange("name", val)} />

// //       <Text style={styles.label}>Email</Text>
// //       <TextInput style={styles.input} keyboardType="email-address" value={formData.email} onChangeText={(val) => onChange("email", val)} />

// //       <Text style={styles.label}>Password</Text>
// //       <TextInput style={styles.input} secureTextEntry value={formData.password} onChangeText={(val) => onChange("password", val)} />

// //       <Text style={styles.label}>Property Address</Text>
// //       <TextInput style={styles.input} value={formData.address} onChangeText={(val) => onChange("address", val)} />

// //       <Text style={styles.label}>Phone Number</Text>
// //       <TextInput style={styles.input} keyboardType="phone-pad" value={formData.phoneNumber} onChangeText={(val) => onChange("phoneNumber", val)} />

// //       <Text style={styles.label}>Zipcode</Text>
// //       <TextInput style={styles.input} value={formData.zipcode} onChangeText={(val) => onChange("zipcode", val)} />

// //       <Text style={styles.label}>Select Role</Text>
// //       <View style={styles.selectRow}>
// //         <TouchableOpacity
// //           style={[styles.selectOption, formData.role === "serviceProvider" && styles.selectOptionSelected]}
// //           onPress={() => onChange("role", "serviceProvider")}
// //         >
// //           <Text style={styles.selectOptionText}>Earn with BlinqFix</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity
// //           style={[styles.selectOption, formData.role === "customer" && styles.selectOptionSelected]}
// //           onPress={() => onChange("role", "customer")}
// //         >
// //           <Text style={styles.selectOptionText}>Book a BlinqFix Job</Text>
// //         </TouchableOpacity>
// //       </View>

// //       {formData.role === "serviceProvider" && (
// //         <>
// //           <Text style={styles.label}>Select Billing Tier</Text>
// //           <View style={styles.selectRow}>
// //             {BILLING.map((tier) => (
// //               <TouchableOpacity
// //                 key={tier}
// //                 style={[styles.selectOptionSmall, formData.billingTier === tier && styles.selectOptionSelected]}
// //                 onPress={() => onChange("billingTier", tier)}
// //               >
// //                 <Text style={styles.selectOptionText}>{tier === "hybrid" ? "Hybrid ($49/mo + 7%)" : "Profit Sharing (7%)"}</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </View>

// //           <Text style={styles.label}>Select Service Type</Text>
// //           <View style={styles.selectRow}>
// //             {SERVICES.map((svc) => (
// //               <TouchableOpacity
// //                 key={svc}
// //                 style={[styles.selectOptionSmall, formData.serviceType === svc && styles.selectOptionSelected]}
// //                 onPress={() => onChange("serviceType", svc)}
// //               >
// //                 <Text style={styles.selectOptionText}>{svc}</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </View>
// //         </>
// //       )}

// //       <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
// //         <Text style={styles.submitBtnText}>{loading ? "Signing Up…" : "Sign Up"}</Text>
// //       </TouchableOpacity>

// //       <Text style={styles.footerText}>
// //         Already have an account?{' '}
// //         <Text style={styles.linkText} onPress={() => navigation.navigate("Login")}>Login</Text>
// //       </Text>
// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { backgroundColor: "#fff", marginVertical: 25 },
// //   title: { fontSize: 24, fontWeight: "bold", marginVertical: 26, textAlign: "center" },
// //   label: { fontSize: 16, marginTop: 12, marginBottom: 4 },
// //   input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10 },
// //   selectRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
// //   selectOption: {
// //     flex: 1,
// //     padding: 10,
// //     marginHorizontal: 4,
// //     backgroundColor: "#eee",
// //     borderRadius: 6,
// //     alignItems: "center"
// //   },
// //   selectOptionSmall: {
// //     padding: 8,
// //     marginRight: 8,
// //     marginBottom: 8,
// //     backgroundColor: "#eee",
// //     borderRadius: 6
// //   },
// //   selectOptionSelected: {
// //     backgroundColor: "#a6e1fa",
// //     borderColor: "#1976d2",
// //     borderWidth: 1
// //   },
// //   selectOptionText: { fontSize: 14 },
// //   submitBtn: {
// //     marginTop: 20,
// //     padding: 16,
// //     backgroundColor: "#1976d2",
// //     borderRadius: 6,
// //     alignItems: "center"
// //   },
// //   submitBtnText: { color: "#fff", fontWeight: "600" },
// //   footerText: { marginTop: 16, textAlign: "center", marginBottom: '-2rem' },
// //   linkText: { color: "#1976d2", fontWeight: "600", textDecorationLine: "underline" }
// // });

// //working
// // import React, { useState, useEffect } from "react";
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   ScrollView,
// //   Alert,
// //   StyleSheet,
// //   Linking,
// // } from "react-native";
// // import * as Location from "expo-location";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { useNavigation } from "@react-navigation/native";
// // import { useStripe } from "@stripe/stripe-react-native";

// // import api from "../api/client";

// // const SERVICES = [
// //   "Electrician",
// //   "HVAC",
// //   "Plumbing",
// //   "Roofing",
// //   "Cleaning",
// //   "Handyman",
// //   "Odd_Jobs",
// // ];
// // const BILLING = ["profit_sharing", "hybrid"];

// // const BILLING_PRODUCTS = {
// //   profit_sharing: "prod_SRVui6dGPZ11rv",
// //   hybrid: "prod_S71nDAu8fYLFGa",
// // };

// // export default function RegistrationScreen() {
// //   const navigation = useNavigation();
// //   const stripe = useStripe();

// //   const [formData, setFormData] = useState({
// //     name: "",
// //     email: "",
// //     password: "",
// //     address: "",
// //     phoneNumber: "",
// //     zipcode: "",
// //     role: "customer",
// //     serviceType: "00000",
// //     billingTier: "",
// //   });
// //   const [location, setLocation] = useState(null);
// //   const [loading, setLoading] = useState(false);

// //   useEffect(() => {
// //     (async () => {
// //       const { status } = await Location.requestForegroundPermissionsAsync();
// //       if (status === "granted") {
// //         const pos = await Location.getCurrentPositionAsync({});
// //         setLocation([pos.coords.latitude, pos.coords.longitude]);
// //       }
// //     })();
// //   }, []);

// //   const onChange = (field, value) => {
// //     setFormData((prev) => {
// //       if (field === "role") {
// //         return {
// //           ...prev,
// //           role: value,
// //           serviceType:
// //             value === "serviceProvider" ? prev.serviceType || SERVICES[0] : "",
// //           billingTier: value === "serviceProvider" ? prev.billingTier || BILLING[0] : "",
// //         };
// //       }
// //       return { ...prev, [field]: value };
// //     });
// //   };

// //   const onSubmit = async () => {
// //     if (!formData.address.trim() || !formData.zipcode.trim()) {
// //       Alert.alert("Error", "Address and zipcode are required.");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const payload = { ...formData };
// //       if (location) {
// //         payload.location = {
// //           type: "Point",
// //           coordinates: [location[1], location[0]],
// //         };
// //       }

// //       if (formData.role === "customer") {
// //         payload.isActive = true;
// //         delete payload.serviceType;
// //         delete payload.billingTier;
// //       } else {
// //         payload.isActive = false;
// //         payload.stripeProductId = BILLING_PRODUCTS[formData.billingTier];
// //       }

// //       const signupRes = await api.post("/auth/register", payload);

// //       let token = signupRes.data.token || signupRes.data.jwt;
// //       if (!token) {
// //         const loginRes = await api.post("/auth/login", {
// //           email: formData.email,
// //           password: formData.password,
// //         });
// //         token = loginRes.data.token || loginRes.data.jwt;
// //       }
// //       if (!token) throw new Error("No JWT returned.");

// //       await AsyncStorage.setItem("token", token);
// //       await AsyncStorage.setItem("userName", signupRes.data.name || formData.name);

// //       if (formData.role === "customer") {
// //         Alert.alert("Success", "Signed up! Please log in.");
// //         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
// //       } else {
// //         const stripeUrl =
// //           signupRes.data.stripeSubscriptionUrl ||
// //           signupRes.data.stripeOnboardingUrl;

// //         if (stripeUrl) {
// //           Alert.alert("Redirecting", "Complete onboarding with Stripe.");
// //           Linking.openURL(stripeUrl);
// //         } else {
// //           navigation.reset({ index: 0, routes: [{ name: "ServiceProviderDashboard" }] });
// //         }
// //       }
// //     } catch (err) {
// //       console.error("Signup error:", err.response?.data || err.message);
// //       Alert.alert("Error", err.response?.data?.msg || "Signup failed");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, marginBottom: '2rem' }}>
// //       <Text style={styles.title}>Signup</Text>

// //       <Text style={styles.label}>Full Name</Text>
// //       <TextInput style={styles.input} value={formData.name} onChangeText={(val) => onChange("name", val)} />

// //       <Text style={styles.label}>Email</Text>
// //       <TextInput style={styles.input} keyboardType="email-address" value={formData.email} onChangeText={(val) => onChange("email", val)} />

// //       <Text style={styles.label}>Password</Text>
// //       <TextInput style={styles.input} secureTextEntry value={formData.password} onChangeText={(val) => onChange("password", val)} />

// //       <Text style={styles.label}>Property Address</Text>
// //       <TextInput style={styles.input} value={formData.address} onChangeText={(val) => onChange("address", val)} />

// //       <Text style={styles.label}>Phone Number</Text>
// //       <TextInput style={styles.input} keyboardType="phone-pad" value={formData.phoneNumber} onChangeText={(val) => onChange("phoneNumber", val)} />

// //       <Text style={styles.label}>Zipcode</Text>
// //       <TextInput style={styles.input} value={formData.zipcode} onChangeText={(val) => onChange("zipcode", val)} />

// //       <Text style={styles.label}>Select Role</Text>
// //       <View style={styles.selectRow}>
// //         <TouchableOpacity
// //           style={[styles.selectOption, formData.role === "serviceProvider" && styles.selectOptionSelected]}
// //           onPress={() => onChange("role", "serviceProvider")}
// //         >
// //           <Text style={styles.selectOptionText}>Earn with BlinqFix</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity
// //           style={[styles.selectOption, formData.role === "customer" && styles.selectOptionSelected]}
// //           onPress={() => onChange("role", "customer")}
// //         >
// //           <Text style={styles.selectOptionText}>Book a BlinqFix Job</Text>
// //         </TouchableOpacity>
// //       </View>

// //       {formData.role === "serviceProvider" && (
// //         <>
// //           <Text style={styles.label}>Select Billing Tier</Text>
// //           <View style={styles.selectRow}>
// //             {BILLING.map((tier) => (
// //               <TouchableOpacity
// //                 key={tier}
// //                 style={[styles.selectOptionSmall, formData.billingTier === tier && styles.selectOptionSelected]}
// //                 onPress={() => onChange("billingTier", tier)}
// //               >
// //                 <Text style={styles.selectOptionText}>{tier === "hybrid" ? "Hybrid ($49/mo + 7%)" : "Profit Sharing (7%)"}</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </View>

// //           <Text style={styles.label}>Select Service Type</Text>
// //           <View style={styles.selectRow}>
// //             {SERVICES.map((svc) => (
// //               <TouchableOpacity
// //                 key={svc}
// //                 style={[styles.selectOptionSmall, formData.serviceType === svc && styles.selectOptionSelected]}
// //                 onPress={() => onChange("serviceType", svc)}
// //               >
// //                 <Text style={styles.selectOptionText}>{svc}</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </View>
// //         </>
// //       )}

// //       <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
// //         <Text style={styles.submitBtnText}>{loading ? "Signing Up…" : "Sign Up"}</Text>
// //       </TouchableOpacity>

// //       <Text style={styles.footerText}>
// //         Already have an account?{' '}
// //         <Text style={styles.linkText} onPress={() => navigation.navigate("Login")}>Login</Text>
// //       </Text>
// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { backgroundColor: "#fff", marginVertical: 25 },
// //   title: { fontSize: 24, fontWeight: "bold", marginVertical: 26, textAlign: "center" },
// //   label: { fontSize: 16, marginTop: 12, marginBottom: 4 },
// //   input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10 },
// //   selectRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
// //   selectOption: {
// //     flex: 1,
// //     padding: 10,
// //     marginHorizontal: 4,
// //     backgroundColor: "#eee",
// //     borderRadius: 6,
// //     alignItems: "center"
// //   },
// //   selectOptionSmall: {
// //     padding: 8,
// //     marginRight: 8,
// //     marginBottom: 8,
// //     backgroundColor: "#eee",
// //     borderRadius: 6
// //   },
// //   selectOptionSelected: {
// //     backgroundColor: "#a6e1fa",
// //     borderColor: "#1976d2",
// //     borderWidth: 1
// //   },
// //   selectOptionText: { fontSize: 14 },
// //   submitBtn: {
// //     marginTop: 20,
// //     padding: 16,
// //     backgroundColor: "#1976d2",
// //     borderRadius: 6,
// //     alignItems: "center"
// //   },
// //   submitBtnText: { color: "#fff", fontWeight: "600" },
// //   footerText: { marginTop: 16, textAlign: "center", marginBottom: '-2rem' },
// //   linkText: { color: "#1976d2", fontWeight: "600", textDecorationLine: "underline" }
// // });

// //sort of working
// // import React, { useState, useEffect } from "react";
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   ScrollView,
// //   Alert,
// //   StyleSheet,
// //   Linking,
// // } from "react-native";
// // import * as Location from "expo-location";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { useNavigation } from "@react-navigation/native";
// // import { useStripe } from "@stripe/stripe-react-native";

// // import api from "../api/client";

// // const SERVICES = [
// //   "Electrician",
// //   "HVAC",
// //   "Plumbing",
// //   "Roofing",
// //   "Cleaning",
// //   "Handyman",
// //   "Odd_Jobs",
// // ];
// // const BILLING = ["profit_sharing", "hybrid"];

// // const BILLING_PRODUCTS = {
// //   profit_sharing: "prod_SRVui6dGPZ11rv",
// //   hybrid: "prod_S71nDAu8fYLFGa",
// // };

// // export default function RegistrationScreen() {
// //   const navigation = useNavigation();
// //   const stripe = useStripe();

// //   const [formData, setFormData] = useState({
// //     name: "",
// //     email: "",
// //     password: "",
// //     address: "",
// //     phoneNumber: "",
// //     zipcode: "",
// //     role: "customer",
// //     serviceType: "00000",
// //     billingTier: "",
// //   });
// //   const [location, setLocation] = useState(null);
// //   const [loading, setLoading] = useState(false);

// //   useEffect(() => {
// //     (async () => {
// //       const { status } = await Location.requestForegroundPermissionsAsync();
// //       if (status === "granted") {
// //         const pos = await Location.getCurrentPositionAsync({});
// //         setLocation([pos.coords.latitude, pos.coords.longitude]);
// //       }
// //     })();
// //   }, []);

// //   const onChange = (field, value) => {
// //     setFormData((prev) => {
// //       if (field === "role") {
// //         return {
// //           ...prev,
// //           role: value,
// //           serviceType:
// //             value === "serviceProvider" ? prev.serviceType || SERVICES[0] : "",
// //           billingTier: value === "serviceProvider" ? prev.billingTier || BILLING[0] : "",
// //         };
// //       }
// //       return { ...prev, [field]: value };
// //     });
// //   };

// //   const onSubmit = async () => {
// //     if (!formData.address.trim() || !formData.zipcode.trim()) {
// //       Alert.alert("Error", "Address and zipcode are required.");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const payload = { ...formData };
// //       if (location) {
// //         payload.location = {
// //           type: "Point",
// //           coordinates: [location[1], location[0]],
// //         };
// //       }

// //       if (formData.role === "customer") {
// //         payload.isActive = true;
// //         delete payload.serviceType;
// //         delete payload.billingTier;
// //       } else {
// //         payload.isActive = false;
// //         payload.stripeProductId = BILLING_PRODUCTS[formData.billingTier];
// //       }

// //       const signupRes = await api.post("/auth/register", payload);

// //       let token = signupRes.data.token || signupRes.data.jwt;
// //       const refreshToken = signupRes.data.refreshToken;

// //       if (!token) {
// //         const loginRes = await api.post("/auth/login", {
// //           email: formData.email,
// //           password: formData.password,
// //         });
// //         token = loginRes.data.token || loginRes.data.jwt;
// //       }

// //       if (!token) throw new Error("No JWT returned.");

// //       await AsyncStorage.setItem("token", token);
// //       if (refreshToken) {
// //         await AsyncStorage.setItem("refreshToken", refreshToken);
// //       }
// //       await AsyncStorage.setItem("userName", signupRes.data.name || formData.name);

// //       if (formData.role === "customer") {
// //         Alert.alert("Success", "Signed up! Please log in.");
// //         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
// //       } else {
// //         const stripeUrl =
// //           signupRes.data.stripeSubscriptionUrl ||
// //           signupRes.data.stripeOnboardingUrl;

// //         if (stripeUrl) {
// //           Alert.alert("Redirecting", "Complete onboarding with Stripe.");
// //           Linking.openURL(stripeUrl);
// //         } else {
// //           navigation.reset({ index: 0, routes: [{ name: "ServiceProviderDashboard" }] });
// //         }
// //       }
// //     } catch (err) {
// //       console.error("Signup error:", err.response?.data || err.message);
// //       Alert.alert("Error", err.response?.data?.msg || "Signup failed");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, marginBottom: '2rem' }}>
// //       <Text style={styles.title}>Signup</Text>

// //       <Text style={styles.label}>Full Name</Text>
// //       <TextInput style={styles.input} value={formData.name} onChangeText={(val) => onChange("name", val)} />

// //       <Text style={styles.label}>Email</Text>
// //       <TextInput style={styles.input} keyboardType="email-address" value={formData.email} onChangeText={(val) => onChange("email", val)} />

// //       <Text style={styles.label}>Password</Text>
// //       <TextInput style={styles.input} secureTextEntry value={formData.password} onChangeText={(val) => onChange("password", val)} />

// //       <Text style={styles.label}>Property Address</Text>
// //       <TextInput style={styles.input} value={formData.address} onChangeText={(val) => onChange("address", val)} />

// //       <Text style={styles.label}>Phone Number</Text>
// //       <TextInput style={styles.input} keyboardType="phone-pad" value={formData.phoneNumber} onChangeText={(val) => onChange("phoneNumber", val)} />

// //       <Text style={styles.label}>Zipcode</Text>
// //       <TextInput style={styles.input} value={formData.zipcode} onChangeText={(val) => onChange("zipcode", val)} />

// //       <Text style={styles.label}>Select Role</Text>
// //       <View style={styles.selectRow}>
// //         <TouchableOpacity
// //           style={[styles.selectOption, formData.role === "serviceProvider" && styles.selectOptionSelected]}
// //           onPress={() => onChange("role", "serviceProvider")}
// //         >
// //           <Text style={styles.selectOptionText}>Earn with BlinqFix</Text>
// //         </TouchableOpacity>
// //         <TouchableOpacity
// //           style={[styles.selectOption, formData.role === "customer" && styles.selectOptionSelected]}
// //           onPress={() => onChange("role", "customer")}
// //         >
// //           <Text style={styles.selectOptionText}>Book a BlinqFix Job</Text>
// //         </TouchableOpacity>
// //       </View>

// //       {formData.role === "serviceProvider" && (
// //         <>
// //           <Text style={styles.label}>Select Billing Tier</Text>
// //           <View style={styles.selectRow}>
// //             {BILLING.map((tier) => (
// //               <TouchableOpacity
// //                 key={tier}
// //                 style={[styles.selectOptionSmall, formData.billingTier === tier && styles.selectOptionSelected]}
// //                 onPress={() => onChange("billingTier", tier)}
// //               >
// //                 <Text style={styles.selectOptionText}>{tier === "hybrid" ? "Hybrid ($49/mo + 7%)" : "Profit Sharing (7%)"}</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </View>

// //           <Text style={styles.label}>Select Service Type</Text>
// //           <View style={styles.selectRow}>
// //             {SERVICES.map((svc) => (
// //               <TouchableOpacity
// //                 key={svc}
// //                 style={[styles.selectOptionSmall, formData.serviceType === svc && styles.selectOptionSelected]}
// //                 onPress={() => onChange("serviceType", svc)}
// //               >
// //                 <Text style={styles.selectOptionText}>{svc}</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </View>
// //         </>
// //       )}

// //       <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
// //         <Text style={styles.submitBtnText}>{loading ? "Signing Up…" : "Sign Up"}</Text>
// //       </TouchableOpacity>

// //       <Text style={styles.footerText}>
// //         Already have an account?{' '}
// //         <Text style={styles.linkText} onPress={() => navigation.navigate("Login")}>Login</Text>
// //       </Text>
// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { backgroundColor: "#fff", marginVertical: 25 },
// //   title: { fontSize: 24, fontWeight: "bold", marginVertical: 26, textAlign: "center" },
// //   label: { fontSize: 16, marginTop: 12, marginBottom: 4 },
// //   input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10 },
// //   selectRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
// //   selectOption: {
// //     flex: 1,
// //     padding: 10,
// //     marginHorizontal: 4,
// //     backgroundColor: "#eee",
// //     borderRadius: 6,
// //     alignItems: "center"
// //   },
// //   selectOptionSmall: {
// //     padding: 8,
// //     marginRight: 8,
// //     marginBottom: 8,
// //     backgroundColor: "#eee",
// //     borderRadius: 6
// //   },
// //   selectOptionSelected: {
// //     backgroundColor: "#a6e1fa",
// //     borderColor: "#1976d2",
// //     borderWidth: 1
// //   },
// //   selectOptionText: { fontSize: 14 },
// //   submitBtn: {
// //     marginTop: 20,
// //     padding: 16,
// //     backgroundColor: "#1976d2",
// //     borderRadius: 6,
// //     alignItems: "center"
// //   },
// //   submitBtnText: { color: "#fff", fontWeight: "600" },
// //   footerText: { marginTop: 16, textAlign: "center", marginBottom: '-2rem' },
// //   linkText: { color: "#1976d2", fontWeight: "600", textDecorationLine: "underline" }
// // });

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   StyleSheet,
//   Linking,
// } from "react-native";
// import * as Location from "expo-location";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { useStripe } from "@stripe/stripe-react-native";

// import api from "../api/client";

// const SERVICES = [
//   "Electrician",
//   "HVAC",
//   "Plumbing",
//   "Roofing",
//   "Handyman",
//   // "Cleaning",
//   // "Odd_Jobs",
// ];
// const BILLING = ["profit_sharing", "hybrid"];

// const BILLING_PRODUCTS = {
//   profit_sharing: "prod_SRVui6dGPZ11rv",
//   hybrid: "prod_S71nDAu8fYLFGa",
// };

// export default function RegistrationScreen() {
//   const navigation = useNavigation();
//   const stripe = useStripe();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     address: "",
//     phoneNumber: "",
//     ssnLast4: "",
//     dob: "", // Expect input as YYYY-MM-DD
//     zipcode: "",
//     role: "customer",
//     serviceType: "00000",
//     billingTier: "",
//   });
//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status === "granted") {
//         const pos = await Location.getCurrentPositionAsync({});
//         setLocation([pos.coords.latitude, pos.coords.longitude]);
//       }
//     })();
//   }, []);

//   const onChange = (field, value) => {
//     setFormData((prev) => {
//       if (field === "role") {
//         return {
//           ...prev,
//           role: value,
//           serviceType:
//             value === "serviceProvider" ? prev.serviceType || SERVICES[0] : "",
//           billingTier:
//             value === "serviceProvider" ? prev.billingTier || BILLING[0] : "",
//         };
//       }
//       return { ...prev, [field]: value };
//     });
//   };

//   const onSubmit = async () => {
//     if (!formData.address.trim() || !formData.zipcode.trim()) {
//       Alert.alert("Error", "Address and zipcode are required.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const payload = { ...formData };
//       if (location) {
//         payload.location = {
//           type: "Point",
//           coordinates: [location[1], location[0]],
//         };
//       }

//       if (formData.role === "customer") {
//         payload.isActive = true;
//         delete payload.serviceType;
//         delete payload.billingTier;
//       } else {
//         payload.isActive = false;
//         payload.stripeProductId = BILLING_PRODUCTS[formData.billingTier];
//       }

//       const signupRes = await api.post("/auth/register", payload);

//       let token = signupRes.data.token || signupRes.data.jwt;
//       const refreshToken = signupRes.data.refreshToken;

//       if (!token) {
//         const loginRes = await api.post("/auth/login", {
//           email: formData.email,
//           password: formData.password,
//         });
//         token = loginRes.data.token || loginRes.data.jwt;
//         if (loginRes.data.refreshToken) {
//           await AsyncStorage.setItem(
//             "refreshToken",
//             loginRes.data.refreshToken
//           );
//           console.log(
//             "RefreshToken (from login fallback):",
//             loginRes.data.refreshToken
//           );
//         }
//       }

//       if (!token) throw new Error("No JWT returned.");

//       await AsyncStorage.setItem("token", token);
//       if (refreshToken) {
//         await AsyncStorage.setItem("refreshToken", refreshToken);
//         console.log("RefreshToken (from register):", refreshToken);
//       }
//       await AsyncStorage.setItem(
//         "userName",
//         signupRes.data.name || formData.name
//       );

//       if (formData.role === "customer") {
//         Alert.alert("Success", "Signed up! Please log in.");
//         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//       } else {
//         const stripeUrl =
//           signupRes.data.stripeSubscriptionUrl ||
//           signupRes.data.stripeOnboardingUrl;

//         if (stripeUrl) {
//           Alert.alert("Redirecting", "Complete onboarding with Stripe.");
//           Linking.openURL(stripeUrl);
//         } else {
//           navigation.reset({
//             index: 0,
//             routes: [{ name: "ServiceProviderDashboard" }],
//           });
//         }
//       }
//     } catch (err) {
//       console.error("Signup error:", err.response?.data || err.message);
//       Alert.alert("Error", err.response?.data?.msg || "Signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView
//       style={styles.container}
//       contentContainerStyle={{ padding: 16, marginBottom: "2rem" }}
//     >
//       <Text style={styles.title}>Signup</Text>

//       <Text style={styles.label}>Full Name</Text>
//       <TextInput
//         style={styles.input}
//         value={formData.name}
//         onChangeText={(val) => onChange("name", val)}
//       />

//       <Text style={styles.label}>Email</Text>
//       <TextInput
//         style={styles.input}
//         keyboardType="email-address"
//         value={formData.email}
//         onChangeText={(val) => onChange("email", val)}
//       />

//       <Text style={styles.label}>Password</Text>
//       <TextInput
//         style={styles.input}
//         secureTextEntry
//         value={formData.password}
//         onChangeText={(val) => onChange("password", val)}
//       />

//       <Text style={styles.label}>Property Address</Text>
//       <TextInput
//         style={styles.input}
//         value={formData.address}
//         onChangeText={(val) => onChange("address", val)}
//       />

//       <Text style={styles.label}>Phone Number</Text>
//       <TextInput
//         style={styles.input}
//         keyboardType="phone-pad"
//         value={formData.phoneNumber}
//         onChangeText={(val) => onChange("phoneNumber", val)}
//       />

//       <Text style={styles.label}>Zipcode</Text>
//       <TextInput
//         style={styles.input}
//         value={formData.zipcode}
//         onChangeText={(val) => onChange("zipcode", val)}
//       />

//       <Text style={styles.label}>Select Role</Text>
//       <View style={styles.selectRow}>
//         <TouchableOpacity
//           style={[
//             styles.selectOption,
//             formData.role === "serviceProvider" && styles.selectOptionSelected,
//           ]}
//           onPress={() => onChange("role", "serviceProvider")}
//         >
//           <Text style={styles.selectOptionText}>Earn with BlinqFix</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.selectOption,
//             formData.role === "customer" && styles.selectOptionSelected,
//           ]}
//           onPress={() => onChange("role", "customer")}
//         >
//           <Text style={styles.selectOptionText}>Book a BlinqFix Job</Text>
//         </TouchableOpacity>
//       </View>

//       {formData.role === "serviceProvider" && (
//         <>
//           <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
//           <TextInput
//             style={styles.input}
//             value={formData.dob}
//             onChangeText={(val) => onChange("dob", val)}
//             placeholder="1980-12-31"
//           />

//           <Text style={styles.label}>Last 4 of SSN</Text>
//           <TextInput
//             style={styles.input}
//             value={formData.ssnLast4}
//             onChangeText={(val) => onChange("ssnLast4", val)}
//             placeholder="1234"
//             keyboardType="numeric"
//             maxLength={4}
//           />

//           <Text style={styles.label}>Select Subscription</Text>
//           <View style={styles.selectRow}>
//             {BILLING.map((tier) => (
//               <TouchableOpacity
//                 key={tier}
//                 style={[
//                   styles.selectOptionSmall,
//                   formData.billingTier === tier && styles.selectOptionSelected,
//                 ]}
//                 onPress={() => onChange("billingTier", tier)}
//               >
//                 <Text style={styles.selectOptionText}>
//                   {tier === "hybrid" ? "BlinqFix Gold" : "BlinqFix Go (Free)"}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <Text style={styles.label}>Select Service Type</Text>
//           <View style={styles.selectRow}>
//             {SERVICES.map((svc) => (
//               <TouchableOpacity
//                 key={svc}
//                 style={[
//                   styles.selectOptionSmall,
//                   formData.serviceType === svc && styles.selectOptionSelected,
//                 ]}
//                 onPress={() => onChange("serviceType", svc)}
//               >
//                 <Text style={styles.selectOptionText}>{svc}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </>
//       )}

//       <TouchableOpacity
//         style={styles.submitBtn}
//         onPress={onSubmit}
//         disabled={loading}
//       >
//         <Text style={styles.submitBtnText}>
//           {loading ? "Signing Up…" : "Sign Up"}
//         </Text>
//       </TouchableOpacity>

//       <Text style={styles.footerText}>
//         Already have an account?{" "}
//         <Text
//           style={styles.linkText}
//           onPress={() => navigation.navigate("Login")}
//         >
//           Login
//         </Text>
//       </Text>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { backgroundColor: "#fff", marginVertical: 25 },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginVertical: 26,
//     textAlign: "center",
//   },
//   label: { fontSize: 16, marginTop: 12, marginBottom: 4 },
//   input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10 },
//   selectRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
//   selectOption: {
//     flex: 1,
//     padding: 10,
//     marginHorizontal: 4,
//     backgroundColor: "#eee",
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   selectOptionSmall: {
//     padding: 8,
//     marginRight: 8,
//     marginBottom: 8,
//     backgroundColor: "#eee",
//     borderRadius: 6,
//   },
//   selectOptionSelected: {
//     backgroundColor: "#a6e1fa",
//     borderColor: "#1976d2",
//     borderWidth: 1,
//   },
//   selectOptionText: { fontSize: 14 },
//   submitBtn: {
//     marginTop: 20,
//     padding: 16,
//     backgroundColor: "#1976d2",
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   submitBtnText: { color: "#fff", fontWeight: "600" },
//   footerText: { marginTop: 16, textAlign: "center", marginBottom: "-2rem" },
//   linkText: {
//     color: "#1976d2",
//     fontWeight: "600",
//     textDecorationLine: "underline",
//   },
// });

// screens/RegistrationScreen.js
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   StyleSheet,
//   Linking,
// } from "react-native";
// import * as Location from "expo-location";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { useStripe } from "@stripe/stripe-react-native";

// import api from "../api/client";

// const SERVICES = ["Electrician", "HVAC", "Plumbing", "Roofing", "Handyman"];
// const BILLING = ["profit_sharing", "hybrid"];

// const BILLING_PRODUCTS = {
//   profit_sharing: "prod_SRVui6dGPZ11rv",
//   hybrid: "prod_S71nDAu8fYLFGa",
// };

// export default function RegistrationScreen() {
//   const navigation = useNavigation();
//   const stripe = useStripe();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     address: "",
//     phoneNumber: "",
//     ssnLast4: "",
//     dob: "",
//     zipcode: "",
//     role: "customer",
//     serviceType: "00000",
//     billingTier: "",
//   });
//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status === "granted") {
//         const pos = await Location.getCurrentPositionAsync({});
//         setLocation([pos.coords.latitude, pos.coords.longitude]);
//       }
//     })();
//   }, []);

//   const onChange = (field, value) => {
//     setFormData((prev) => {
//       if (field === "role") {
//         return {
//           ...prev,
//           role: value,
//           serviceType: value === "serviceProvider" ? prev.serviceType || SERVICES[0] : "",
//           billingTier: value === "serviceProvider" ? prev.billingTier || BILLING[0] : "",
//         };
//       }
//       return { ...prev, [field]: value };
//     });
//   };

//   const onSubmit = async () => {
//     const requiredFields = ["name", "email", "password", "address", "phoneNumber", "zipcode"];
//     if (formData.role === "serviceProvider") {
//       requiredFields.push("dob", "ssnLast4", "billingTier", "serviceType");
//     }

//     for (let field of requiredFields) {
//       if (!formData[field] || !formData[field].trim()) {
//         Alert.alert("Error", `Please enter your ${field}`);
//         return;
//       }
//     }

//     setLoading(true);
//     try {
//       const payload = { ...formData };
//       if (location) {
//         payload.location = {
//           type: "Point",
//           coordinates: [location[1], location[0]],
//         };
//       }

//       if (formData.role === "customer") {
//         payload.isActive = true;
//         delete payload.serviceType;
//         delete payload.billingTier;
//       } else {
//         payload.isActive = false;
//         payload.stripeProductId = BILLING_PRODUCTS[formData.billingTier];
//       }

//       const signupRes = await api.post("/auth/register", payload);

//       let token = signupRes.data.token || signupRes.data.jwt;
//       const refreshToken = signupRes.data.refreshToken;

//       if (!token) {
//         const loginRes = await api.post("/auth/login", {
//           email: formData.email,
//           password: formData.password,
//         });
//         token = loginRes.data.token || loginRes.data.jwt;
//         if (loginRes.data.refreshToken) {
//           await AsyncStorage.setItem("refreshToken", loginRes.data.refreshToken);
//         }
//       }

//       if (!token) throw new Error("No JWT returned.");

//       await AsyncStorage.setItem("token", token);
//       if (refreshToken) await AsyncStorage.setItem("refreshToken", refreshToken);
//       await AsyncStorage.setItem("userName", signupRes.data.name || formData.name);

//       if (formData.role === "customer") {
//         Alert.alert("Success", "Signed up! Please log in.");
//         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//       } else {
//         const stripeUrl =
//           signupRes.data.stripeSubscriptionUrl || signupRes.data.stripeOnboardingUrl;

//         if (stripeUrl) {
//           Alert.alert("Redirecting", "Complete onboarding with Stripe.");
//           Linking.openURL(stripeUrl);
//         } else {
//           navigation.reset({ index: 0, routes: [{ name: "ServiceProviderDashboard" }] });
//         }
//       }
//     } catch (err) {
//       Alert.alert("Error", err.response?.data?.msg || "Signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };

// screens/RegistrationScreen.js
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   StyleSheet,
//   Linking,
//   Platform,
// } from "react-native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import * as Application from "expo-application";
// import Constants from "expo-constants";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { useStripe } from "@stripe/stripe-react-native";

// import api from "../api/client";

// const SERVICES = ["Electrician", "HVAC", "Plumbing", "Roofing", "Handyman"];
// const BILLING = ["profit_sharing", "hybrid"];

// const BILLING_PRODUCTS = {
//   profit_sharing: "prod_SRVui6dGPZ11rv",
//   hybrid: "prod_S71nDAu8fYLFGa",
// };

// export default function RegistrationScreen() {
//   const navigation = useNavigation();
//   const stripe = useStripe();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     address: "",
//     phoneNumber: "",
//     ssnLast4: "",
//     dob: "",
//     zipcode: "",
//     role: "customer",
//     serviceType: "00000",
//     billingTier: "",
//   });
//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     (async () => {
//       try {
//         const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
//         if (locStatus === "granted") {
//           const pos = await Location.getCurrentPositionAsync({});
//           setLocation([pos.coords.latitude, pos.coords.longitude]);
//         } else {
//           Alert.alert("Location Required", "Enable location in settings.", [
//             {
//               text: "Go to Settings",
//               onPress: () => {
//                 if (Platform.OS === "ios") {
//                   Linking.openURL("app-settings:");
//                 } else {
//                   IntentLauncher.startActivityAsync(IntentLauncher.ACTION_LOCATION_SOURCE_SETTINGS);
//                 }
//               },
//             },
//           ]);
//         }

//         const { status: notifStatus } = await Notifications.requestPermissionsAsync();
//         if (notifStatus !== "granted") {
//           Alert.alert("Notifications", "Enable notifications for updates.", [
//             {
//               text: "Open Settings",
//               onPress: () => Linking.openSettings(),
//             },
//             { text: "Cancel", style: "cancel" },
//           ]);
//         }
//       } catch (err) {
//         Alert.alert("Permissions Error", "Unable to check device settings.");
//       }
//     })();
//   }, []);

//   const onChange = (field, value) => {
//     setFormData((prev) => {
//       if (field === "role") {
//         return {
//           ...prev,
//           role: value,
//           serviceType: value === "serviceProvider" ? prev.serviceType || SERVICES[0] : "",
//           billingTier: value === "serviceProvider" ? prev.billingTier || BILLING[0] : "",
//         };
//       }
//       return { ...prev, [field]: value };
//     });
//   };

//   const onSubmit = async () => {
//     const requiredFields = ["name", "email", "password", "address", "phoneNumber", "zipcode"];
//     if (formData.role === "serviceProvider") {
//       requiredFields.push("dob", "ssnLast4", "billingTier", "serviceType");
//     }

//     for (let field of requiredFields) {
//       if (!formData[field] || !formData[field].trim()) {
//         Alert.alert("Error", `Please enter your ${field}`);
//         return;
//       }
//     }

//     setLoading(true);
//     try {
//       const payload = { ...formData };
//       if (location) {
//         payload.location = {
//           type: "Point",
//           coordinates: [location[1], location[0]],
//         };
//       }

//       if (formData.role === "customer") {
//         payload.isActive = true;
//         delete payload.serviceType;
//         delete payload.billingTier;
//       } else {
//         payload.isActive = false;
//         payload.stripeProductId = BILLING_PRODUCTS[formData.billingTier];
//       }

//       const signupRes = await api.post("/auth/register", payload);

//       let token = signupRes.data.token || signupRes.data.jwt;
//       const refreshToken = signupRes.data.refreshToken;

//       if (!token) {
//         const loginRes = await api.post("/auth/login", {
//           email: formData.email,
//           password: formData.password,
//         });
//         token = loginRes.data.token || loginRes.data.jwt;
//         if (loginRes.data.refreshToken) {
//           await AsyncStorage.setItem("refreshToken", loginRes.data.refreshToken);
//         }
//       }

//       if (!token) throw new Error("No JWT returned.");

//       await AsyncStorage.setItem("token", token);
//       if (refreshToken) await AsyncStorage.setItem("refreshToken", refreshToken);
//       await AsyncStorage.setItem("userName", signupRes.data.name || formData.name);

//       if (formData.role === "customer") {
//         Alert.alert("Success", "Signed up! Please log in.");
//         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//       } else {
//         const stripeUrl = signupRes.data.stripeSubscriptionUrl || signupRes.data.stripeOnboardingUrl;

//         if (stripeUrl) {
//           Alert.alert("Redirecting", "Complete onboarding with Stripe.");
//           Linking.openURL(stripeUrl);
//         } else {
//           navigation.reset({ index: 0, routes: [{ name: "ServiceProviderDashboard" }] });
//         }
//       }
//     } catch (err) {
//       Alert.alert("Error", err.response?.data?.msg || "Signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, marginBottom: "2rem" }}>
//       <Text style={styles.title}>Signup</Text>

//       <Text style={styles.label}>Full Name</Text>
//       <TextInput style={styles.input} value={formData.name} onChangeText={(val) => onChange("name", val)} />

//       <Text style={styles.label}>Email</Text>
//       <TextInput style={styles.input} keyboardType="email-address" value={formData.email} onChangeText={(val) => onChange("email", val)} />

//       <Text style={styles.label}>Password</Text>
//       <TextInput style={styles.input} secureTextEntry value={formData.password} onChangeText={(val) => onChange("password", val)} />

//       <Text style={styles.label}>Property Address</Text>
//       <TextInput style={styles.input} value={formData.address} onChangeText={(val) => onChange("address", val)} />

//       <Text style={styles.label}>Phone Number</Text>
//       <TextInput style={styles.input} keyboardType="phone-pad" value={formData.phoneNumber} onChangeText={(val) => onChange("phoneNumber", val)} />

//       <Text style={styles.label}>Zipcode</Text>
//       <TextInput style={styles.input} value={formData.zipcode} onChangeText={(val) => onChange("zipcode", val)} />

//       <Text style={styles.label}>Select Role</Text>
//       <View style={styles.selectRow}>
//         <TouchableOpacity
//           style={[styles.selectOption, formData.role === "serviceProvider" && styles.selectOptionSelected]}
//           onPress={() => onChange("role", "serviceProvider")}
//         >
//           <Text style={styles.selectOptionText}>Earn with BlinqFix</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.selectOption, formData.role === "customer" && styles.selectOptionSelected]}
//           onPress={() => onChange("role", "customer")}
//         >
//           <Text style={styles.selectOptionText}>Book a BlinqFix Job</Text>
//         </TouchableOpacity>
//       </View>

//       {formData.role === "serviceProvider" && (
//         <>
//           <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
//           <TextInput style={styles.input} value={formData.dob} onChangeText={(val) => onChange("dob", val)} placeholder="1980-12-31" />

//           <Text style={styles.label}>Last 4 of SSN</Text>
//           <TextInput style={styles.input} value={formData.ssnLast4} onChangeText={(val) => onChange("ssnLast4", val)} placeholder="1234" keyboardType="numeric" maxLength={4} />

//           <Text style={styles.label}>Select Subscription</Text>
//           <View style={styles.selectRow}>
//             {BILLING.map((tier) => (
//               <TouchableOpacity key={tier} style={[styles.selectOptionSmall, formData.billingTier === tier && styles.selectOptionSelected]} onPress={() => onChange("billingTier", tier)}>
//                 <Text style={styles.selectOptionText}>{tier === "hybrid" ? "BlinqFix Gold" : "BlinqFix Go (Free)"}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <Text style={styles.label}>Select Service Type</Text>
//           <View style={styles.selectRow}>
//             {SERVICES.map((svc) => (
//               <TouchableOpacity key={svc} style={[styles.selectOptionSmall, formData.serviceType === svc && styles.selectOptionSelected]} onPress={() => onChange("serviceType", svc)}>
//                 <Text style={styles.selectOptionText}>{svc}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </>
//       )}

//       <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
//         <Text style={styles.submitBtnText}>{loading ? "Signing Up…" : "Sign Up"}</Text>
//       </TouchableOpacity>

//       <Text style={styles.footerText}>
//         Already have an account?{' '}
//         <Text style={styles.linkText} onPress={() => navigation.navigate("Login")}>
//           Login
//         </Text>
//       </Text>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { backgroundColor: "#fff", marginVertical: 25 },
//   title: { fontSize: 24, fontWeight: "bold", marginVertical: 26, textAlign: "center" },
//   label: { fontSize: 16, marginTop: 12, marginBottom: 4 },
//   input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10 },
//   selectRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
//   selectOption: {
//     flex: 1,
//     padding: 10,
//     marginHorizontal: 4,
//     backgroundColor: "#eee",
//     borderRadius: 6,
//     alignItems: "center"
//   },
//   selectOptionSmall: {
//     padding: 8,
//     marginRight: 8,
//     marginBottom: 8,
//     backgroundColor: "#eee",
//     borderRadius: 6
//   },
//   selectOptionSelected: {
//     backgroundColor: "#a6e1fa",
//     borderColor: "#1976d2",
//     borderWidth: 1
//   },
//   selectOptionText: { fontSize: 14 },
//   submitBtn: {
//     marginTop: 20,
//     padding: 16,
//     backgroundColor: "#1976d2",
//     borderRadius: 6,
//     alignItems: "center"
//   },
//   submitBtnText: { color: "#fff", fontWeight: "600" },
//   footerText: { marginTop: 16, textAlign: "center", marginBottom: "-2rem" },
//   linkText: { color: "#1976d2", fontWeight: "600", textDecorationLine: "underline" }
// });

//latest
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   StyleSheet,
//   Linking,
//   Platform,
// } from "react-native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import * as Application from "expo-application";
// import Constants from "expo-constants";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { useStripe } from "@stripe/stripe-react-native";
// import { Ionicons } from "@expo/vector-icons";

// import api from "../api/client";
// import BackButton from "../components/BackButton";

// const SERVICES = ["Electrician", "HVAC", "Plumbing", "Roofing", "Handyman"];
// const BILLING = ["profit_sharing", "hybrid"];

// const BILLING_PRODUCTS = {
//   profit_sharing: "prod_Se5JgrG5D9G2Wq",
//   hybrid: "prod_Se4dOaW9m5lRpw",
// };

// export default function RegistrationScreen() {
//   const navigation = useNavigation();
//   const stripe = useStripe();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     address: "",
//     phoneNumber: "",
//     ssnLast4: "",
//     dob: "",
//     zipcode: "",
//     role: "customer",
//     serviceType: "00000",
//     billingTier: "",
//   });
//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => {
//     (async () => {
//       try {
//         const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
//         if (locStatus === "granted") {
//           const pos = await Location.getCurrentPositionAsync({});
//           setLocation([pos.coords.latitude, pos.coords.longitude]);
//         } else {
//           Alert.alert("Location Required", "Enable location in settings.", [
//             {
//               text: "Go to Settings",
//               onPress: () => {
//                 if (Platform.OS === "ios") {
//                   Linking.openURL("app-settings:");
//                 } else {
//                   IntentLauncher.startActivityAsync(IntentLauncher.ACTION_LOCATION_SOURCE_SETTINGS);
//                 }
//               },
//             },
//           ]);
//         }

//         const { status: notifStatus } = await Notifications.requestPermissionsAsync();
//         if (notifStatus !== "granted") {
//           Alert.alert("Notifications", "Enable notifications for updates.", [
//             {
//               text: "Open Settings",
//               onPress: () => Linking.openSettings(),
//             },
//             { text: "Cancel", style: "cancel" },
//           ]);
//         }
//       } catch (err) {
//         Alert.alert("Permissions Error", "Unable to check device settings.");
//       }
//     })();
//   }, []);

//   const onChange = (field, value) => {
//     setFormData((prev) => {
//       if (field === "role") {
//         return {
//           ...prev,
//           role: value,
//           serviceType: value === "serviceProvider" ? prev.serviceType || SERVICES[0] : "",
//           billingTier: value === "serviceProvider" ? prev.billingTier || BILLING[0] : "",
//         };
//       }
//       return { ...prev, [field]: value };
//     });
//   };

//   const onSubmit = async () => {
//     const requiredFields = ["name", "email", "password", "address", "phoneNumber", "zipcode"];
//     if (formData.role === "serviceProvider") {
//       requiredFields.push("dob", "ssnLast4", "billingTier", "serviceType");
//     }

//     for (let field of requiredFields) {
//       if (!formData[field] || !formData[field].trim()) {
//         Alert.alert("Error", `Please enter your ${field}`);
//         return;
//       }
//     }

//     setLoading(true);
//     try {
//       const payload = { ...formData };
//       if (location) {
//         payload.location = {
//           type: "Point",
//           coordinates: [location[1], location[0]],
//         };
//       }

//       if (formData.role === "customer") {
//         payload.isActive = true;
//         delete payload.serviceType;
//         delete payload.billingTier;
//       } else {
//         payload.isActive = false;
//         payload.stripeProductId = BILLING_PRODUCTS[formData.billingTier];
//       }

//       const signupRes = await api.post("/auth/register", payload);

//       let token = signupRes.data.token || signupRes.data.jwt;
//       const refreshToken = signupRes.data.refreshToken;

//       if (!token) {
//         const loginRes = await api.post("/auth/login", {
//           email: formData.email,
//           password: formData.password,
//         });
//         token = loginRes.data.token || loginRes.data.jwt;
//         if (loginRes.data.refreshToken) {
//           await AsyncStorage.setItem("refreshToken", loginRes.data.refreshToken);
//         }
//       }

//       if (!token) throw new Error("No JWT returned.");

//       await AsyncStorage.setItem("token", token);
//       if (refreshToken) await AsyncStorage.setItem("refreshToken", refreshToken);
//       await AsyncStorage.setItem("userName", signupRes.data.name || formData.name);

//       if (formData.role === "customer") {
//         Alert.alert("Success", "Signed up! Please log in.");
//         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//       } else {
//         const stripeUrl = signupRes.data.stripeSubscriptionUrl || signupRes.data.stripeOnboardingUrl;

//         if (stripeUrl) {
//           Alert.alert("Redirecting", "Complete onboarding with Stripe.");
//           Linking.openURL(stripeUrl);
//         } else {
//           navigation.reset({ index: 0, routes: [{ name: "ServiceProviderDashboard" }] });
//         }
//       }
//     } catch (err) {
//       Alert.alert("Error", err.response?.data?.msg || "Signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, marginBottom: "2rem" }}>
//       <BackButton />
//       <Text style={styles.title}>Signup</Text>

//       <Text style={styles.label}>Full Name</Text>
//       <TextInput style={styles.input} value={formData.name} onChangeText={(val) => onChange("name", val)} />

//       <Text style={styles.label}>Email</Text>
//       <TextInput style={styles.input} keyboardType="email-address" value={formData.email} onChangeText={(val) => onChange("email", val)} />

//       <Text style={styles.label}>Password</Text>
//       <View style={{ position: "relative" }}>
//         <TextInput
//           style={styles.input}
//           secureTextEntry={!showPassword}
//           value={formData.password}
//           onChangeText={(val) => onChange("password", val)}
//         />
//         <TouchableOpacity
//           style={{ position: "absolute", right: 16, top: 'center', height: "100%", justifyContent: "center" }}
//           onPress={() => setShowPassword((prev) => !prev)}
//         >
//           <Ionicons
//             name={showPassword ? "eye-off-outline" : "eye-outline"}
//             size={22}
//             color="#1976d2"
//           />
//         </TouchableOpacity>
//       </View>

//       <Text style={styles.label}>Address</Text>
//       <TextInput style={styles.input} value={formData.address} onChangeText={(val) => onChange("address", val)} />

//       <Text style={styles.label}>Phone Number</Text>
//       <TextInput style={styles.input} keyboardType="phone-pad" value={formData.phoneNumber} onChangeText={(val) => onChange("phoneNumber", val)} />

//       <Text style={styles.label}>Zipcode</Text>
//       <TextInput style={styles.input} value={formData.zipcode} onChangeText={(val) => onChange("zipcode", val)} />

//       <Text style={styles.label}>Select Role</Text>
//       <View style={styles.selectRow}>
//         <TouchableOpacity
//           style={[styles.selectOption, formData.role === "serviceProvider" && styles.selectOptionSelected]}
//           onPress={() => onChange("role", "serviceProvider")}
//         >
//           <Text style={styles.selectOptionText}>Earn with BlinqFix</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.selectOption, formData.role === "customer" && styles.selectOptionSelected]}
//           onPress={() => onChange("role", "customer")}
//         >
//           <Text style={styles.selectOptionText}>Book a BlinqFix Job</Text>
//         </TouchableOpacity>
//       </View>
//       {formData.role === "serviceProvider" && (
//         <>
//           <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
//           <TextInput style={styles.input} value={formData.dob} onChangeText={(val) => onChange("dob", val)} placeholder="1980-12-31" />

//           <Text style={styles.label}>Last 4 of SSN</Text>
//           <TextInput style={styles.input} value={formData.ssnLast4} onChangeText={(val) => onChange("ssnLast4", val)} placeholder="1234" keyboardType="numeric" maxLength={4} />

//           <Text style={styles.label}>Select Subscription</Text>
//           <View style={styles.selectRow}>
//             {BILLING.map((tier) => (
//               <TouchableOpacity key={tier} style={[styles.selectOptionSmall, formData.billingTier === tier && styles.selectOptionSelected]} onPress={() => onChange("billingTier", tier)}>
//                 <Text style={styles.selectOptionText}>{tier === "hybrid" ? "BlinqFix Priority" : "BlinqFix Go (Free)"}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <Text style={styles.label}>Select Service Type</Text>
//           <View style={styles.selectRow}>
//             {SERVICES.map((svc) => (
//               <TouchableOpacity key={svc} style={[styles.selectOptionSmall, formData.serviceType === svc && styles.selectOptionSelected]} onPress={() => onChange("serviceType", svc)}>
//                 <Text style={styles.selectOptionText}>{svc}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </>
//       )}

//       <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
//         <Text style={styles.submitBtnText}>{loading ? "Signing Up…" : "Sign Up"}</Text>
//       </TouchableOpacity>

//       <Text style={styles.footerText}>
//         Already have an account?{' '}
//         <Text style={styles.linkText} onPress={() => navigation.navigate("Login")}>
//           Login
//         </Text>
//       </Text>

//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { backgroundColor: "#fff", marginVertical: 25 },
//   title: { fontSize: 24, fontWeight: "bold", marginVertical: 26, textAlign: "center" },
//   label: { fontSize: 16, marginTop: 12, marginBottom: 4 },
//   input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10 },
//   selectRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
//   selectOption: {
//     flex: 1,
//     padding: 10,
//     marginHorizontal: 4,
//     backgroundColor: "#eee",
//     borderRadius: 6,
//     alignItems: "center"
//   },
//   selectOptionSmall: {
//     padding: 8,
//     marginRight: 8,
//     marginBottom: 8,
//     backgroundColor: "#eee",
//     borderRadius: 6
//   },
//   selectOptionSelected: {
//     backgroundColor: "#a6e1fa",
//     borderColor: "#1976d2",
//     borderWidth: 1
//   },
//   selectOptionText: { fontSize: 14 },
//   submitBtn: {
//     marginTop: 20,
//     padding: 16,
//     backgroundColor: "#1976d2",
//     borderRadius: 6,
//     alignItems: "center"
//   },
//   submitBtnText: { color: "#fff", fontWeight: "600" },
//   footerText: { marginTop: 16, textAlign: "center", marginBottom: "-2rem" },
//   linkText: { color: "#1976d2", fontWeight: "600", textDecorationLine: "underline" }
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Linking,
  Platform,
  Switch,
} from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as IntentLauncher from "expo-intent-launcher";
import * as Permissions from "expo-permissions";
import * as SMS from "expo-sms";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useStripe } from "@stripe/stripe-react-native";
import { Ionicons } from "@expo/vector-icons";

import api from "../api/client";
import BackButton from "../components/BackButton";

const SERVICES = ["Electrician", "HVAC", "Plumbing", "Roofing", "Handyman"];
const BILLING = ["profit_sharing", "hybrid"];

const BILLING_PRODUCTS = {
  profit_sharing: "prod_Se5JgrG5D9G2Wq",
  hybrid: "prod_Se4dOaW9m5lRpw",
};

export default function RegistrationScreen() {
  const navigation = useNavigation();
  const stripe = useStripe();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phoneNumber: "",
    ssnLast4: "",
    dob: "",
    zipcode: "",
    role: "customer",
    serviceType: "00000",
    billingTier: "",
  });
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [optInSms, setOptInSms] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status: locStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (locStatus === "granted") {
          const pos = await Location.getCurrentPositionAsync({});
          setLocation([pos.coords.latitude, pos.coords.longitude]);
        } else {
          Alert.alert("Location Required", "Enable location in settings.", [
            {
              text: "Go to Settings",
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

        const { status: notifStatus } =
          await Notifications.requestPermissionsAsync();
        if (notifStatus !== "granted") {
          Alert.alert("Notifications", "Enable notifications for updates.", [
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
            { text: "Cancel", style: "cancel" },
          ]);
        }

        const { status: smsStatus } = await Permissions.askAsync(
          Permissions.SMS
        );
        if (smsStatus !== "granted") {
          Alert.alert(
            "SMS Permission",
            "Enable SMS permission for text alerts.",
            [
              {
                text: "Open Settings",
                onPress: () => Linking.openSettings(),
              },
              { text: "Cancel", style: "cancel" },
            ]
          );
        }
      } catch (err) {
        Alert.alert("Permissions Error", "Unable to check device settings.");
      }
    })();
  }, []);

  const onChange = (field, value) => {
    setFormData((prev) => {
      if (field === "role") {
        return {
          ...prev,
          role: value,
          serviceType:
            value === "serviceProvider" ? prev.serviceType || SERVICES[0] : "",
          billingTier:
            value === "serviceProvider" ? prev.billingTier || BILLING[0] : "",
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // const onSubmit = async () => {
  //   const requiredFields = [
  //     "name",
  //     "email",
  //     "password",
  //     "address",
  //     "phoneNumber",
  //     "zipcode",
  //   ];
  //   if (formData.role === "serviceProvider") {
  //     requiredFields.push("dob", "ssnLast4", "billingTier", "serviceType");
  //   }

  //   for (let field of requiredFields) {
  //     if (!formData[field] || !formData[field].trim()) {
  //       Alert.alert("Error", `Please enter your ${field}`);
  //       return;
  //     }
  //   }

  //   setLoading(true);
  //   try {
  //     const payload = { ...formData, optInSms };
  //     if (location) {
  //       payload.location = {
  //         type: "Point",
  //         coordinates: [location[1], location[0]],
  //       };
  //     }

  //     if (formData.role === "customer") {
  //       payload.isActive = true;
  //       delete payload.serviceType;
  //       delete payload.billingTier;
  //     } else {
  //       payload.isActive = false;
  //       payload.stripeProductId = BILLING_PRODUCTS[formData.billingTier];
  //     }

  //     const signupRes = await api.post("/auth/register", payload);

  //     let token = signupRes.data.token || signupRes.data.jwt;
  //     const refreshToken = signupRes.data.refreshToken;

  //     if (!token) {
  //       const loginRes = await api.post("/auth/login", {
  //         email: formData.email,
  //         password: formData.password,
  //       });
  //       token = loginRes.data.token || loginRes.data.jwt;
  //       if (loginRes.data.refreshToken) {
  //         await AsyncStorage.setItem(
  //           "refreshToken",
  //           loginRes.data.refreshToken
  //         );
  //       }
  //     }

  //     if (!token) throw new Error("No JWT returned.");

  //     await AsyncStorage.setItem("token", token);
  //     if (refreshToken)
  //       await AsyncStorage.setItem("refreshToken", refreshToken);
  //     await AsyncStorage.setItem(
  //       "userName",
  //       signupRes.data.name || formData.name
  //     );

  //     if (formData.role === "customer") {
  //       Alert.alert("Success", "Signed up! Please log in.");
  //       navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  //     } else {
  //       const stripeUrl =
  //         signupRes.data.stripeSubscriptionUrl ||
  //         signupRes.data.stripeOnboardingUrl;

  //       if (stripeUrl) {
  //         Alert.alert("Redirecting", "Complete onboarding with Stripe.");
  //         Linking.openURL(stripeUrl);
  //       } else {
  //         navigation.reset({
  //           index: 0,
  //           routes: [{ name: "ServiceProviderDashboard" }],
  //         });
  //       }
  //     }
  //   } catch (err) {
  //     Alert.alert("Error", err.response?.data?.msg || "Signup failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onSubmit = async () => {
    const requiredFields = [
      "name",
      "email",
      "password",
      "address",
      "phoneNumber",
      "zipcode",
    ];
    if (formData.role === "serviceProvider") {
      requiredFields.push("dob", "ssnLast4", "billingTier", "serviceType");
    }
  
    for (let field of requiredFields) {
      if (!formData[field] || !formData[field].trim()) {
        Alert.alert("Error", `Please enter your ${field}`);
        return;
      }
    }
  
    setLoading(true);
    try {
      const payload = { ...formData, optInSms };
      if (location) {
        payload.location = {
          type: "Point",
          coordinates: [location[1], location[0]],
        };
      }
  
      if (formData.role === "customer") {
        payload.isActive = true;
        delete payload.serviceType;
        delete payload.billingTier;
      } else {
        payload.isActive = false;
        payload.stripeProductId = BILLING_PRODUCTS[formData.billingTier];
      }
  
      const signupRes = await api.post("/auth/register", payload);
  
      let token = signupRes.data.token || signupRes.data.jwt;
      const refreshToken = signupRes.data.refreshToken;
  
      if (!token) {
        const loginRes = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });
        token = loginRes.data.token || loginRes.data.jwt;
        if (loginRes.data.refreshToken) {
          await AsyncStorage.setItem("refreshToken", loginRes.data.refreshToken);
        }
      }
  
      if (!token) throw new Error("No JWT returned.");
  
      await AsyncStorage.setItem("token", token);
      if (refreshToken) await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("userName", signupRes.data.name || formData.name);
  
      if (formData.role === "customer") {
        Alert.alert("Success", "Signed up! Please log in.");
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      } else {
        // 🟢 New step: hybrid users need to subscribe after registration
        if (formData.billingTier === "hybrid") {
          try {
            const subscribeRes = await api.post("/subscribe", {
              paymentMethodId: "pm_card_visa" // Replace with actual Stripe PaymentMethod ID
            });
  
            const stripeUrl =
              subscribeRes.data.stripeOnboardingUrl ||
              subscribeRes.data.stripeDashboardUrl;
  
            if (stripeUrl) {
              Alert.alert("Redirecting", "Complete onboarding with Stripe.");
              Linking.openURL(stripeUrl);
              return;
            }
          } catch (err) {
            console.error("❌ Subscription error:", err.response?.data || err);
            Alert.alert("Subscription error", err.response?.data?.msg || "Could not start subscription.");
            return;
          }
        }
  
        navigation.reset({ index: 0, routes: [{ name: "ServiceProviderDashboard" }] });
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, marginBottom: "2rem" }}
    >
      <BackButton />
      <Text style={styles.title}>Signup</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={formData.name}
        onChangeText={(val) => onChange("name", val)}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        keyboardType="email-address"
        value={formData.email}
        onChangeText={(val) => onChange("email", val)}
      />

      <Text style={styles.label}>Password</Text>
      <View style={{ position: "relative" }}>
        <TextInput
          style={styles.input}
          secureTextEntry={!showPassword}
          value={formData.password}
          onChangeText={(val) => onChange("password", val)}
        />
        <TouchableOpacity
          style={{
            position: "absolute",
            right: 16,
            top: "center",
            height: "100%",
            justifyContent: "center",
          }}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#1976d2"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        value={formData.address}
        onChangeText={(val) => onChange("address", val)}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        value={formData.phoneNumber}
        onChangeText={(val) => onChange("phoneNumber", val)}
      />

      <Text style={styles.label}>Zipcode</Text>
      <TextInput
        style={styles.input}
        value={formData.zipcode}
        onChangeText={(val) => onChange("zipcode", val)}
      />

      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}
      >
        <Switch value={optInSms} onValueChange={setOptInSms} />
        <Text style={{ marginLeft: 8 }}>I agree to receive SMS alerts</Text>
      </View>

      <Text style={styles.label}>Select Role</Text>
      <View style={styles.selectRow}>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.role === "serviceProvider" && styles.selectOptionSelected,
          ]}
          onPress={() => onChange("role", "serviceProvider")}
        >
          <Text style={styles.selectOptionText}>Earn with BlinqFix</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.role === "customer" && styles.selectOptionSelected,
          ]}
          onPress={() => onChange("role", "customer")}
        >
          <Text style={styles.selectOptionText}>Book a BlinqFix Job</Text>
        </TouchableOpacity>
      </View>

      {formData.role === "serviceProvider" && (
        <>
          <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={formData.dob}
            onChangeText={(val) => onChange("dob", val)}
            placeholder="1980-12-31"
          />

          <Text style={styles.label}>Last 4 of SSN</Text>
          <TextInput
            style={styles.input}
            value={formData.ssnLast4}
            onChangeText={(val) => onChange("ssnLast4", val)}
            placeholder="1234"
            keyboardType="numeric"
            maxLength={4}
          />

          <Text style={styles.label}>Select Subscription</Text>
          <View style={styles.selectRow}>
            {BILLING.map((tier) => (
              <TouchableOpacity
                key={tier}
                style={[
                  styles.selectOptionSmall,
                  formData.billingTier === tier && styles.selectOptionSelected,
                ]}
                onPress={() => onChange("billingTier", tier)}
              >
                <Text style={styles.selectOptionText}>
                  {tier === "hybrid"
                    ? "BlinqFix Priority"
                    : "BlinqFix Go (Free)"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Select Service Type</Text>
          <View style={styles.selectRow}>
            {SERVICES.map((svc) => (
              <TouchableOpacity
                key={svc}
                style={[
                  styles.selectOptionSmall,
                  formData.serviceType === svc && styles.selectOptionSelected,
                ]}
                onPress={() => onChange("serviceType", svc)}
              >
                <Text style={styles.selectOptionText}>{svc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={styles.submitBtnText}>
          {loading ? "Signing Up…" : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Already have an account?{" "}
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate("Login")}
        >
          Login
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", marginVertical: 25 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 26,
    textAlign: "center",
  },
  label: { fontSize: 16, marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10 },
  selectRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  selectOption: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    backgroundColor: "#eee",
    borderRadius: 6,
    alignItems: "center",
  },
  selectOptionSmall: {
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
  selectOptionSelected: {
    backgroundColor: "#a6e1fa",
    borderColor: "#1976d2",
    borderWidth: 1,
  },
  selectOptionText: { fontSize: 14 },
  submitBtn: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#1976d2",
    borderRadius: 6,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontWeight: "600" },
  footerText: { marginTop: 16, textAlign: "center", marginBottom: "-2rem" },
  linkText: {
    color: "#1976d2",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
