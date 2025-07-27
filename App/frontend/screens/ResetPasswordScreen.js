// // screens/ResetPasswordScreen.js
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ScrollView,
//   StyleSheet,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import api from "../api/client"; // your axios instance
// import BackButton from "../components/BackButton";

// export default function ResetPasswordScreen() {
//   // React Navigation approach to get URL-like params
//   const route = useRoute();
//   const navigation = useNavigation();
//   // e.g. route.params = { token: "...someToken..." }
//   const { token } = route.params || {};

//   // local form state
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [loading, setLoading] = useState(false);

//   // Check if token is missing
//   useEffect(() => {
//     if (!token) {
//       Alert.alert("Error", "Reset token is missing from the route params.");
//     }
//   }, [token]);

//   // event handlers
//   const onChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const onSubmit = async () => {
//     if (!token) {
//       Alert.alert(
//         "Error",
//         "Reset token is missing. Please request a new password reset."
//       );
//       return;
//     }
//     if (formData.password !== formData.confirmPassword) {
//       Alert.alert("Error", "Passwords do not match.");
//       return;
//     }

//     try {
//       setLoading(true);

//       // prepare payload
//       const payload = {
//         email: formData.email.trim(),
//         password: formData.password,
//       };
//       // console.log("Reset payload:", payload);

//       // Make the PUT request to your backend: /auth/reset-password/:token
//       await api.put(`/auth/reset-password/${token}`, payload);
//       Alert.alert("Success", "Password reset successfully!");

//       // Navigate back to login or home
//       navigation.reset({
//         index: 0,
//         routes: [{ name: "Login" }], // or your main route
//       });
//     } catch (err) {
//       console.error("Reset password error:", err.response?.data || err);
//       const msg = err.response?.data?.msg || "Failed to reset password";
//       Alert.alert("Error", msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <BackButton />
//       <Text style={styles.title}>Reset Password</Text>

//       {/* Email */}
//       <Text style={styles.label}>Email</Text>
//       <TextInput
//         style={styles.input}
//         keyboardType="email-address"
//         onChangeText={(val) => onChange("email", val)}
//         value={formData.email}
//       />

//       {/* New Password */}
//       <Text style={styles.label}>New Password</Text>
//       <TextInput
//         style={styles.input}
//         secureTextEntry
//         onChangeText={(val) => onChange("password", val)}
//         value={formData.password}
//       />

//       {/* Confirm New Password */}
//       <Text style={styles.label}>Confirm New Password</Text>
//       <TextInput
//         style={styles.input}
//         secureTextEntry
//         onChangeText={(val) => onChange("confirmPassword", val)}
//         value={formData.confirmPassword}
//       />

//       <TouchableOpacity
//         style={styles.btn}
//         onPress={onSubmit}
//         disabled={loading}
//       >
//         <Text style={styles.btnText}>
//           {loading ? "Resetting..." : "Reset Password"}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: "#fff",
//     marginVertical: 50,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginVertical: 16,
//     textAlign: "center",
//   },
//   label: {
//     fontSize: 16,
//     marginTop: 12,
//     marginBottom: 4,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 16,
//   },
//   btn: {
//     padding: 16,
//     borderRadius: 6,
//     backgroundColor: "#1976d2",
//     alignItems: "center",
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
// });

// screens/ResetPasswordScreen.js
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import api from "../api/client";
// import BackButton from "../components/BackButton";

// export default function ResetPasswordScreen() {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);

//   const onSubmit = async () => {
//     if (!email.trim()) {
//       Alert.alert("Error", "Please enter your email address.");
//       return;
//     }

//     try {
//       setLoading(true);

//       await api.post("/auth/request-password-reset", { email });

//       Alert.alert(
//         "Email Sent",
//         "If the email you entered is associated with an account, a reset link has been sent."
//       );

//       navigation.goBack();
//     } catch (err) {
//       const msg = err.response?.data?.msg || "Failed to request password reset";
//       Alert.alert("Error", msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           behavior={Platform.OS === "ios" ? "padding" : undefined}
//           style={{ flex: 1 }}
//         >
//           <BackButton />
//           <Text style={styles.title}>Forgot Password?</Text>
//           <Text style={styles.instructions}>
//             Enter your email and we’ll send you a link to reset your password.
//           </Text>

//           <Text style={styles.label}>Email Address</Text>
//           <TextInput
//             style={styles.input}
//             keyboardType="email-address"
//             autoCapitalize="none"
//             value={email}
//             onChangeText={setEmail}
//           />

//           <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={loading}>
//             <Text style={styles.btnText}>{loading ? "Sending..." : "Send Reset Link"}</Text>
//           </TouchableOpacity>
//         </KeyboardAvoidingView>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: 16,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginVertical: 16,
//     textAlign: "center",
//   },
//   instructions: {
//     fontSize: 14,
//     textAlign: "center",
//     marginBottom: 24,
//     color: "#555",
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 24,
//   },
//   btn: {
//     padding: 16,
//     borderRadius: 6,
//     backgroundColor: "#1976d2",
//     alignItems: "center",
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 16,
//   },
// });

// screens/ResetPasswordScreen.js (React Native - App)
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import api from "../api/client";

// export default function ResetPasswordScreen() {
//   const route = useRoute();
//   const nav = useNavigation();
//   const { token } = route.params;

//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleReset = async () => {
//     if (password !== confirmPassword) {
//       return Alert.alert("Error", "Passwords do not match.");
//     }
//     if (password.length < 6) {
//       return Alert.alert("Error", "Password must be at least 6 characters.");
//     }
//     try {
//       setLoading(true);
//       await api.post(`/reset-password/${token}`, { password });
//       Alert.alert("Success", "Password has been reset.", [
//         { text: "OK", onPress: () => nav.navigate("LoginScreen") }
//       ]);
//     } catch (err) {
//       console.error("Reset error:", err.response?.data || err);
//       Alert.alert("Error", err.response?.data?.msg || "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Reset Your Password</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="New Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Confirm Password"
//         secureTextEntry
//         value={confirmPassword}
//         onChangeText={setConfirmPassword}
//       />
//       <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
//         {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 24,
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "#fff",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 24,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 12,
//     marginBottom: 12,
//   },
//   button: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 14,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });


// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import api from "../api/client";

// export default function ResetPasswordScreen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const token = route?.params?.token ?? null;

//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!token) {
//       Alert.alert("Missing Token", "You cannot reset your password without a valid token.", [
//         { text: "OK", onPress: () => navigation.replace("LoginScreen") },
//       ]);
//     }
//   }, [token]);

//   const handleReset = async () => {
//     if (!token) return;

//     if (password !== confirmPassword) {
//       return Alert.alert("Error", "Passwords do not match.");
//     }
//     if (password.length < 6) {
//       return Alert.alert("Error", "Password must be at least 6 characters.");
//     }
//     try {
//       setLoading(true);
//       await api.post(`/reset-password/${token}`, { password });
//       Alert.alert("Success", "Password has been reset.", [
//         { text: "OK", onPress: () => navigation.replace("LoginScreen") },
//       ]);
//     } catch (err) {
//       console.error("Reset error:", err.response?.data || err.message);
//       Alert.alert("Error", err.response?.data?.msg || "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Reset Your Password</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="New Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Confirm Password"
//         secureTextEntry
//         value={confirmPassword}
//         onChangeText={setConfirmPassword}
//       />
//       <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
//         {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 24,
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "#fff",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 24,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 12,
//     marginBottom: 12,
//   },
//   button: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 14,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });


// //last working
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import api from "../api/client";
// import BackButton from "../components/BackButton";

// export default function ResetPasswordScreen() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const token = route?.params?.token ?? null;

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!token) {
//       Alert.alert("Missing Token", "You cannot reset your password without a valid token.", [
//         { text: "OK", onPress: () => navigation.replace("LoginScreen") },
//       ]);
//     }
//   }, [token]);

//   const handleReset = async () => {
//     if (!token) return;

//     if (!email || !password || !confirmPassword) {
//       return Alert.alert("Error", "All fields are required.");
//     }

//     if (password !== confirmPassword) {
//       return Alert.alert("Error", "Passwords do not match.");
//     }

//     if (password.length < 6) {
//       return Alert.alert("Error", "Password must be at least 6 characters.");
//     }

//     try {
//       setLoading(true);
//       await api.post(`/reset-password/${token}`, { email, password });
//       Alert.alert("Success", "Password has been reset.", [
//         { text: "OK", onPress: () => navigation.replace("LoginScreen") },
//       ]);
//     } catch (err) {
//       console.error("Reset error:", err.response?.data || err.message);
//       Alert.alert("Error", err.response?.data?.msg || "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <BackButton />
//       <Text style={styles.title}>Reset Your Password</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Your Email"
//         keyboardType="email-address"
//         autoCapitalize="none"
//         value={email}
//         onChangeText={setEmail}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="New Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Confirm Password"
//         secureTextEntry
//         value={confirmPassword}
//         onChangeText={setConfirmPassword}
//       />
//       <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
//         {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 24,
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "#fff",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 24,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 12,
//     marginBottom: 12,
//   },
//   button: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 14,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });


import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import api from "../api/client";
import BackButton from "../components/BackButton";

export default function ResetPasswordScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const token = route?.params?.token ?? null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      console.warn("⚠️ Missing token param from route", route?.params);
      Alert.alert("Missing Token", "You cannot reset your password without a valid token.", [
        { text: "OK", onPress: () => navigation.replace("LoginScreen") },
      ]);
    }
  }, [token]);

  const handleReset = async () => {
    if (!token) return;

    if (!email || !password || !confirmPassword) {
      return Alert.alert("Error", "All fields are required.");
    }

    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match.");
    }

    if (password.length < 6) {
      return Alert.alert("Error", "Password must be at least 6 characters.");
    }

    try {
      setLoading(true);
      const cleanedEmail = email.trim().toLowerCase();
      await api.post(`/reset-password/${token}`, { email: cleanedEmail, password });
      Alert.alert("Success", "Password has been reset.", [
        { text: "OK", onPress: () => navigation.replace("LoginScreen") },
      ]);
    } catch (err) {
      console.error("Reset error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.msg || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Reset Your Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Your Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
