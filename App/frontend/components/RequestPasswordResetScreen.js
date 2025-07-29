// screens/RequestPasswordResetScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import api from "../api/client";
import BackButton from "./BackButton";

export default function RequestPasswordResetScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

//   const handleRequestReset = async () => {
//     if (!email.includes("@") || email.length < 6) {
//       return Alert.alert("Invalid Email", "Please enter a valid email address.");
//     }

//     try {
//       setLoading(true);
//       await api.post("/request-password-reset", { email });
//       Alert.alert(
//         "Email Sent",
//         "Check your email for a link to reset your password."
//       );
//     } catch (err) {
//       console.error("Reset Request Error:", err.response?.data || err.message);
//       Alert.alert(
//         "Error",
//         err.response?.data?.msg || "Could not process request."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

// const handleRequestReset = async () => {
//     const cleanedEmail = email.trim();
  
//     if (!cleanedEmail.includes("@") || cleanedEmail.length < 6) {
//       return Alert.alert("Invalid Email", "Please enter a valid email address.");
//     }
  
//     try {
//       setLoading(true);
//       await api.post("/authRoutes/request-password-reset", { email: cleanedEmail });
  
//       Alert.alert(
//         "Email Sent",
//         "Check your email for a link to reset your password."
//       );
//     } catch (err) {
//       console.error("Reset Request Error:", err.response?.data || err.message);
//       Alert.alert(
//         "Error",
//         err.response?.data?.msg || "Could not process request."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

// const handleRequestReset = async () => {
//     const cleanedEmail = email.trim().toLowerCase();
  
//     if (!cleanedEmail.includes("@") || cleanedEmail.length < 6) {
//       return Alert.alert("Invalid Email", "Please enter a valid email address.");
//     }
  
//     console.log("[Request Reset] Starting request for:", cleanedEmail);
  
//     try {
//       setLoading(true);
      
//       const response = await api.post("/auth/request-password-reset", {
//         email: cleanedEmail,
//       });
  
//       console.log("[Request Reset] Response:", response.data);
  
//       Alert.alert(
//         "Email Sent",
//         "Check your email for a link to reset your password.",
//         [
//           {
//             text: "OK",
//             onPress: () => {
//               // ✅ Optional: send user back to Login screen
//               navigation.replace("ResetPasswordScreen");
//             },
//           },
//         ]
//       );
//     } catch (err) {
//       console.log("[Request Reset] Error full object:", err);
//       console.log("[Request Reset] Error response:", err.response?.data);
//       console.log("[Request Reset] Error message:", err.message);
  
//       Alert.alert(
//         "Error",
//         err.response?.data?.msg || "Could not process request."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };
const handleRequestReset = async () => {
  const cleanedEmail = email.trim().toLowerCase();

  if (!cleanedEmail.includes("@") || cleanedEmail.length < 6) {
    return Alert.alert("Invalid Email", "Please enter a valid email address.");
  }

  try {
    setLoading(true);
    const response = await api.post("/auth/request-password-reset", {
      email: cleanedEmail,
    });

    console.log("[✅ Email Sent Response]:", response.data);

    Alert.alert("Email Sent", "Check your inbox to reset your password.", [
      {
        text: "OK",
        onPress: () => navigation.replace("LoginScreen"),
      },
    ]);
  } catch (err) {
    console.error("[❌ Request Reset Error]:", err.response?.data || err.message);
    Alert.alert("Error", err.response?.data?.msg || "Something went wrong.");
  } finally {
    setLoading(false);
  }
};

  
  return (
    <View style={styles.container}>
        <BackButton />
      <Text style={styles.title}>Forgot Your Password?</Text>
      <Text style={styles.instructions}>
        Enter the email associated with your account. We'll send you a link to reset your password.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRequestReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send Reset Link</Text>
        )}
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
    marginBottom: 12,
  },
  instructions: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#1976d2",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
