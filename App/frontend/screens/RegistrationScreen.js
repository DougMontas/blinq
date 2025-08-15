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
//   Switch,
// } from "react-native";
// import * as Location from "expo-location";
// import * as Notifications from "expo-notifications";
// import * as IntentLauncher from "expo-intent-launcher";
// import * as Permissions from "expo-permissions";
// import * as SMS from "expo-sms";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { useStripe } from "@stripe/stripe-react-native";
// import { Ionicons } from "@expo/vector-icons";

// import api from "../api/client";
// import BackButton from "../components/BackButton";
// import ScreenWrapper from "../components/ScreenWrapper";

// const SERVICES = ["Electrician", "HVAC", "Plumbing", "Roofing", "Handyman"];
// const BILLING = ["profit_sharing", "hybrid"];

// const BILLING_PRODUCTS = {
//   profit_sharing: "prod_Se5JgrG5D9G2Wq",
//   hybrid: "prod_Se4dOaW9m5lRpw",
// };

// export default function RegistrationScreen() {
//   const { initPaymentSheet, presentPaymentSheet } = useStripe();
//   const navigation = useNavigation();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     address: "",
//     phoneNumber: "",
//     // ssnLast4: "",
//     // dob: "",
//     zipcode: "",
//     role: "customer",
//     serviceType: "00000",
//     billingTier: "",
//   });
//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [optInSms, setOptInSms] = useState(false);

//   useEffect(() => {
//     (async () => {
//       try {
//         // 📍 Location permission
//         const { status: locStatus } =
//           await Location.requestForegroundPermissionsAsync();
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
//                   IntentLauncher.startActivityAsync(
//                     IntentLauncher.ACTION_LOCATION_SOURCE_SETTINGS
//                   );
//                 }
//               },
//             },
//           ]);
//         }

//         // 🔔 Notification permission
//         const { status: notifStatus } =
//           await Notifications.requestPermissionsAsync();
//         if (notifStatus !== "granted") {
//           Alert.alert("Notifications", "Enable notifications for updates.", [
//             {
//               text: "Open Settings",
//               onPress: () => Linking.openSettings(),
//             },
//             { text: "Cancel", style: "cancel" },
//           ]);
//         }

//         // 📱 SMS (optional/logging only on Android)
//         if (Platform.OS === "android") {
//           console.log(
//             "ℹ️ Skipping SMS permission — not available in expo-permissions"
//           );
//         }
//       } catch (err) {
//         console.warn("⚠️ Device permission check failed:", err.message);
//         Alert.alert("Permissions Error", "Could not check device permissions.");
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
//     const requiredFields = [
//       "name",
//       "email",
//       "password",
//       "address",
//       "phoneNumber",
//       "zipcode",
//     ];
//     if (formData.role === "serviceProvider") {
//       requiredFields.push("billingTier", "serviceType");
//     }

//     for (let field of requiredFields) {
//       if (!formData[field] || !formData[field].trim()) {
//         Alert.alert("Error", `Please enter your ${field}`);
//         return;
//       }
//     }

//     setLoading(true);
//     try {
//       const payload = { ...formData, optInSms };
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

//       console.log("📤 Registering user with payload:", payload);
//       const signupRes = await api.post("/auth/register", payload);

//       const {
//         token,
//         refreshToken,
//         stripeOnboardingUrl,
//         stripeDashboardUrl,
//         subscriptionClientSecret,
//       } = signupRes.data || {};

//       // ✅ Confirm SetupIntent via PaymentSheet for hybrid tier
//       if (
//         formData.role === "serviceProvider" &&
//         formData.billingTier === "hybrid"
//       ) {
//         if (!subscriptionClientSecret) {
//           Alert.alert(
//             "Stripe Error",
//             "Missing client secret for setup intent."
//           );
//           return;
//         }

//         console.log(
//           "💳 Initializing PaymentSheet with SetupIntent:",
//           subscriptionClientSecret
//         );

//         const { error: initError } = await initPaymentSheet({
//           setupIntentClientSecret: subscriptionClientSecret,
//           merchantDisplayName: "BlinqFix",
//         });

//         if (initError) {
//           console.error("❌ PaymentSheet init error:", initError);
//           Alert.alert("Stripe Error", initError.message);
//           return;
//         }

//         const { error: presentError } = await presentPaymentSheet();
//         if (presentError) {
//           console.error("❌ PaymentSheet present error:", presentError);
//           Alert.alert("Payment Error", presentError.message);
//           return;
//         }

//         console.log("✅ Payment method setup complete");
//       }

//       if (!token) throw new Error("No token returned.");
//       await AsyncStorage.setItem("token", token);
//       if (refreshToken)
//         await AsyncStorage.setItem("refreshToken", refreshToken);
//       await AsyncStorage.setItem("userName", formData.name);

//       if (formData.role === "customer") {
//         Alert.alert("Success", "Signed up! Please log in.");
//         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//         return;
//       }

//       if (stripeOnboardingUrl || stripeDashboardUrl) {
//         Alert.alert("Redirecting", "Complete onboarding with Stripe.");
//         Linking.openURL(stripeOnboardingUrl || stripeDashboardUrl);
//       }

//       navigation.reset({
//         index: 0,
//         routes: [{ name: "ServiceProviderDashboard" }],
//       });
//     } catch (err) {
//       console.error(
//         "❌ Registration flow failed:",
//         err.response?.data || err.message
//       );
//       Alert.alert("Error", err.response?.data?.msg || "Signup failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScreenWrapper>
//       <BackButton />
//       <ScrollView
//         style={styles.container}
//         contentContainerStyle={{ padding: 16, marginBottom: "2rem" }}
//       >
//         <Text style={styles.title}>Signup</Text>

//         <Text style={styles.label}>Full Name</Text>
//         <TextInput
//           style={styles.input}
//           value={formData.name}
//           onChangeText={(val) => onChange("name", val)}
//         />

//         <Text style={styles.label}>Email</Text>
//         <TextInput
//           style={styles.input}
//           keyboardType="email-address"
//           value={formData.email}
//           onChangeText={(val) => onChange("email", val)}
//         />

//         <Text style={styles.label}>Password</Text>
//         <View style={{ position: "relative" }}>
//           <TextInput
//             style={styles.input}
//             secureTextEntry={!showPassword}
//             value={formData.password}
//             onChangeText={(val) => onChange("password", val)}
//           />
//           <TouchableOpacity
//             style={{
//               position: "absolute",
//               right: 16,
//               top: "center",
//               height: "100%",
//               justifyContent: "center",
//             }}
//             onPress={() => setShowPassword((prev) => !prev)}
//           >
//             <Ionicons
//               name={showPassword ? "eye-off-outline" : "eye-outline"}
//               size={22}
//               color="#1976d2"
//             />
//           </TouchableOpacity>
//         </View>

//         <Text style={styles.label}>Address</Text>
//         <TextInput
//           style={styles.input}
//           value={formData.address}
//           onChangeText={(val) => onChange("address", val)}
//         />

//         <Text style={styles.label}>Phone Number</Text>
//         <TextInput
//           style={styles.input}
//           keyboardType="phone-pad"
//           value={formData.phoneNumber}
//           onChangeText={(val) => onChange("phoneNumber", val)}
//         />

//         <Text style={styles.label}>Zipcode</Text>
//         <TextInput
//           style={styles.input}
//           value={formData.zipcode}
//           onChangeText={(val) => onChange("zipcode", val)}
//         />

//         <View
//           style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}
//         >
//           <Switch value={optInSms} onValueChange={setOptInSms} />
//           <Text style={{ marginLeft: 8 }}>I agree to receive SMS alerts</Text>
//         </View>

//         <Text style={styles.label}>Select Role</Text>
//         <View style={styles.selectRow}>
//           <TouchableOpacity
//             style={[
//               styles.selectOption,
//               formData.role === "serviceProvider" &&
//                 styles.selectOptionSelected,
//             ]}
//             onPress={() => onChange("role", "serviceProvider")}
//           >
//             <Text style={styles.selectOptionText}>Earn with BlinqFix</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[
//               styles.selectOption,
//               formData.role === "customer" && styles.selectOptionSelected,
//             ]}
//             onPress={() => onChange("role", "customer")}
//           >
//             <Text style={styles.selectOptionText}>Book a BlinqFix Job</Text>
//           </TouchableOpacity>
//         </View>

//         {formData.role === "serviceProvider" && (
//           <>
//             {/* <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
//               <TextInput
//                 style={styles.input}
//                 value={formData.dob}
//                 onChangeText={(val) => onChange("dob", val)}
//                 placeholder="1980-12-31"
//               />
    
//               <Text style={styles.label}>Last 4 of SSN</Text>
//               <TextInput
//                 style={styles.input}
//                 value={formData.ssnLast4}
//                 onChangeText={(val) => onChange("ssnLast4", val)}
//                 placeholder="1234"
//                 keyboardType="numeric"
//                 maxLength={4}
//               /> */}

//             <Text style={styles.label}>Select Service Type</Text>
//             <View style={styles.selectRow}>
//               {SERVICES.map((svc) => (
//                 <TouchableOpacity
//                   key={svc}
//                   style={[
//                     styles.selectOptionSmall,
//                     formData.serviceType === svc && styles.selectOptionSelected,
//                   ]}
//                   onPress={() => onChange("serviceType", svc)}
//                 >
//                   <Text style={styles.selectOptionText}>{svc}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <Text style={styles.label}>Select Subscription</Text>
//             <View style={styles.selectRow}>
//               {BILLING.map((tier) => (
//                 <TouchableOpacity
//                   key={tier}
//                   style={[
//                     styles.selectOptionSmall,
//                     formData.billingTier === tier &&
//                       styles.selectOptionSelected,
//                   ]}
//                   onPress={() => onChange("billingTier", tier)}
//                 >
//                   <Text style={styles.selectOptionText}>
//                     {tier === "hybrid"
//                       ? "BlinqFix Priority"
//                       : "BlinqFix Go (Free)"}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </>
//         )}

//         <TouchableOpacity
//           style={styles.submitBtn}
//           onPress={onSubmit}
//           disabled={loading}
//         >
//           <Text style={styles.submitBtnText}>
//             {loading ? "Signing Up…" : "Sign Up"}
//           </Text>
//         </TouchableOpacity>

//         <Text style={styles.footerText}>
//           Already have an account?{" "}
//           <Text
//             style={styles.linkText}
//             onPress={() => navigation.navigate("Login")}
//           >
//             Login
//           </Text>
//         </Text>
//       </ScrollView>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   container: { backgroundColor: "#fff", marginVertical: 25 },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginVertical: 26,
//     textAlign: "center",
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
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
  SafeAreaView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as IntentLauncher from "expo-intent-launcher";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useStripe } from "@stripe/stripe-react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Briefcase,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  CheckCircle,
  UserCircle,
  ArrowRight,
} from "lucide-react-native";

import api from "../api/client";
import FooterPro from "../components/FooterPro";

const SERVICES = ["Electrician", "HVAC", "Plumbing", "Roofing", "Handyman"];
const BILLING = ["profit_sharing", "hybrid"];

const BILLING_PRODUCTS = {
  profit_sharing: "prod_Se5JgrG5D9G2Wq",
  hybrid: "prod_Se4dOaW9m5lRpw",
};

export default function RegistrationScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phoneNumber: "",
    zipcode: "",
    role: "customer",
    serviceType: SERVICES[0],
    billingTier: BILLING[0],
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
        if (locStatus !== "granted") {
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
        } else {
            const pos = await Location.getCurrentPositionAsync({});
            setLocation([pos.coords.latitude, pos.coords.longitude]);
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
      } catch (err) {
        console.warn("⚠️ Device permission check failed:", err.message);
      }
    })();
  }, []);

  const onChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
      requiredFields.push("billingTier", "serviceType");
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

      console.log("📤 Registering user with payload:", payload);
      const signupRes = await api.post("/auth/register", payload);

      const {
        token,
        refreshToken,
        stripeOnboardingUrl,
        stripeDashboardUrl,
        subscriptionClientSecret,
      } = signupRes.data || {};
      
      if (
        formData.role === "serviceProvider" &&
        formData.billingTier === "hybrid"
      ) {
        if (!subscriptionClientSecret) {
          Alert.alert("Stripe Error", "Missing client secret for setup intent.");
          setLoading(false);
          return;
        }

        const { error: initError } = await initPaymentSheet({
          setupIntentClientSecret: subscriptionClientSecret,
          merchantDisplayName: "BlinqFix",
          style: 'alwaysDark',
        });

        if (initError) {
          Alert.alert("Stripe Error", initError.message);
          setLoading(false);
          return;
        }

        const { error: presentError } = await presentPaymentSheet();
        if (presentError) {
          Alert.alert("Payment Error", presentError.message);
          setLoading(false);
          return;
        }
      }

      if (!token) throw new Error("No token returned.");
      await AsyncStorage.setItem("token", token);
      if (refreshToken) await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("userName", formData.name);

      if (formData.role === "customer") {
        Alert.alert("Success", "Welcome to BlinqFix! Please log in to continue.");
        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      } else {
         if (stripeOnboardingUrl || stripeDashboardUrl) {
            Alert.alert("Almost there!", "Complete your secure onboarding with Stripe to activate your account.");
            Linking.openURL(stripeOnboardingUrl || stripeDashboardUrl);
        }
         navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      }

    } catch (err) {
      console.error("❌ Registration flow failed:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.msg || "Signup failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <ArrowLeft color="#fff" size={24} />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                 <View style={styles.headerBadge}>
                    <Shield color="#22c55e" size={14} />
                    <Text style={styles.headerBadgeText}>Secure & Fast Signup</Text>
                  </View>
                <Text style={styles.title}>Create Your Account</Text>
              </View>
              <View style={{width: 44}} />
            </View>

            {/* Role Selection */}
            <View style={styles.roleSelectionContainer}>
              {[
                { role: "customer", label: "Book a Job", icon: UserCircle },
                { role: "serviceProvider", label: "Earn with Us", icon: Briefcase },
              ].map(({role, label, icon: Icon}) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleCard,
                    formData.role === role && styles.roleCardSelected,
                  ]}
                  onPress={() => onChange("role", role)}
                >
                  <Icon color={formData.role === role ? '#fff' : '#60a5fa'} size={28} />
                  <Text style={[
                    styles.roleText,
                    formData.role === role && styles.roleTextSelected
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form Inputs */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <User color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#94a3b8"
                  value={formData.name}
                  onChangeText={(val) => onChange("name", val)}
                />
              </View>
              <View style={styles.inputContainer}>
                <Mail color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(val) => onChange("email", val)}
                />
              </View>
              <View style={styles.inputContainer}>
                <Lock color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(val) => onChange("password", val)}
                />
                <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeIcon}>
                  {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <MapPin color="#94a3b8" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Address"
                  placeholderTextColor="#94a3b8"
                  value={formData.address}
                  onChangeText={(val) => onChange("address", val)}
                />
              </View>
               <View style={styles.row}>
                <View style={[styles.inputContainer, {flex: 1}]}>
                  <MapPin color="#94a3b8" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Zip Code"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={formData.zipcode}
                    onChangeText={(val) => onChange("zipcode", val)}
                  />
                </View>
                <View style={[styles.inputContainer, {flex: 1.5}]}>
                  <Phone color="#94a3b8" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    value={formData.phoneNumber}
                    onChangeText={(val) => onChange("phoneNumber", val)}
                  />
                </View>
              </View>
            </View>

            {/* Service Provider Options */}
            {formData.role === "serviceProvider" && (
              <View style={styles.providerSection}>
                <Text style={styles.sectionTitle}>Your Service Details</Text>
                
                <Text style={styles.label}>Primary Service</Text>
                <View style={styles.chipsContainer}>
                  {SERVICES.map((svc) => (
                    <TouchableOpacity
                      key={svc}
                      style={[
                        styles.chip,
                        formData.serviceType === svc && styles.chipSelected,
                      ]}
                      onPress={() => onChange("serviceType", svc)}
                    >
                      <Text style={[styles.chipText, formData.serviceType === svc && styles.chipTextSelected]}>{svc}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Subscription Plan</Text>
                <View style={styles.chipsContainer}>
                  {BILLING.map((tier) => (
                    <TouchableOpacity
                      key={tier}
                      style={[
                        styles.chip,
                        formData.billingTier === tier && styles.chipSelected,
                      ]}
                      onPress={() => onChange("billingTier", tier)}
                    >
                      <Text style={[styles.chipText, formData.billingTier === tier && styles.chipTextSelected]}>
                        {tier === "hybrid" ? "BlinqFix Priority" : "BlinqFix Go (Free)"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                 <Text style={styles.planDescription}>
                    {formData.billingTier === 'hybrid' 
                      ? 'Priority access to jobs and lower platform fees. A payment method is required for the monthly subscription.'
                      : 'Get started with no upfront cost. Standard platform fees apply to completed jobs.'}
                  </Text>
              </View>
            )}

            {/* SMS Opt-in */}
            <View style={styles.switchContainer}>
                <Switch
                    trackColor={{ false: "#767577", true: "#22c55e" }}
                    thumbColor={optInSms ? "#f4f3f4" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={setOptInSms}
                    value={optInSms}
                />
                <Text style={styles.switchLabel}>I agree to receive SMS alerts for job updates</Text>
            </View>


            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={onSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#4ade80', '#3b82f6'] : ['#22c55e', '#16a34a']}
                style={styles.submitButtonGradient}
              >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={styles.submitButtonText}>Create Account</Text>
                        <ArrowRight color="#fff" size={20} />
                    </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.footerLink}>Log In</Text>
              </TouchableOpacity>
            </View>
            <FooterPro />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 20,
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
  headerTitleContainer: {
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
   headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)'
  },
  headerBadgeText: {
    color: '#22c55e',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500'
  },
  roleSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 16
  },
  roleCard: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    gap: 12
  },
  roleCardSelected: {
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderColor: '#60a5fa',
  },
  roleText: {
    fontSize: 16,
    color: '#e0e7ff',
    fontWeight: '600'
  },
  roleTextSelected: {
    color: '#fff',
  },
  formContainer: {
    gap: 16
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputIcon: {
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff',
  },
  eyeIcon: {
    paddingHorizontal: 16
  },
  row: {
    flexDirection: 'row',
    gap: 16
  },
  providerSection: {
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 16
  },
  label: {
      fontSize: 16,
      fontWeight: '600',
      color: '#e0e7ff',
      marginBottom: 12
  },
  chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 16
  },
  chip: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)'
  },
  chipSelected: {
      backgroundColor: '#60a5fa',
      borderColor: '#60a5fa'
  },
  chipText: {
      color: '#e0e7ff',
      fontWeight: '600'
  },
  chipTextSelected: {
      color: '#fff'
  },
  planDescription: {
      fontSize: 13,
      color: '#94a3b8',
      lineHeight: 18
  },
  switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 24,
      padding: 16,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 12
  },
  switchLabel: {
      marginLeft: 12,
      color: '#e0e7ff',
      flex: 1
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24
  },
  footerText: {
    color: "#e0e7ff",
    fontSize: 16,
  },
  footerLink: {
    color: "#60a5fa",
    fontSize: 16,
    fontWeight: "bold",
  },
});