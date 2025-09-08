// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   ScrollView,
//   SafeAreaView,
// } from "react-native";
// import api from "../api/client";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import BackButton from "../components/BackButton";

// export default function MyAccountCustomer() {
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(false);

//   const handleDeleteAccount = async () => {
//     Alert.alert(
//       "Confirm Deletion",
//       "Are you sure you want to delete your account? This action cannot be undone.",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               const token = await AsyncStorage.getItem("token");
//               await api.delete("/users/delete", {
//                 headers: { Authorization: `Bearer ${token}` },
//                 data: { reason: "Customer deleted account via My Account" },
//               });
//               await AsyncStorage.clear();
//               Alert.alert("Deleted", "Your account has been deleted.");
//               navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//             } catch (err) {
//               Alert.alert("Error", "Failed to delete account");
//             }
//           },
//         },
//       ]
//     );
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <BackButton />
//       <View style={styles.container}>
//         <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
//           <Text style={styles.title}>My Account</Text>

//           <Text style={styles.label}>
//             You may delete your account below. This cannot be undone.
//           </Text>

//           <TouchableOpacity
//             style={[styles.button, styles.danger]}
//             onPress={handleDeleteAccount}
//             disabled={loading}
//           >
//             <Text style={styles.buttonText}>Delete My Account</Text>
//           </TouchableOpacity>

//           {/* Updated to correctly navigate to ResetPassword screen */}
//           <TouchableOpacity
//             style={styles.button}
//             onPress={async () => {
//               const token = await AsyncStorage.getItem("token");
//               if (!token) {
//                 Alert.alert(
//                   "Missing Token",
//                   "You are not authorized to reset password this way."
//                 );
//                 return;
//               }
//               navigation.navigate("ResetPasswordScreen", { token });
//             }}
//             disabled={loading}
//           >
//             <Text style={styles.buttonText}>Reset Password</Text>
//           </TouchableOpacity>

//           {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
//         </ScrollView>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     marginTop: 50,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 16,
//     textAlign: "center",
//     marginTop: 24,
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 20,
//     textAlign: "center",
//     paddingHorizontal: 16,
//   },
//   button: {
//     padding: 14,
//     borderRadius: 6,
//     backgroundColor: "#1976d2",
//     marginBottom: 12,
//     alignItems: "center",
//     marginHorizontal: 24,
//   },
//   danger: {
//     backgroundColor: "red",
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 16,
//     textAlign: "center",
//   },
// });

// //latest working
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   ScrollView,
//   SafeAreaView,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import {
//   ArrowLeft,
//   User,
//   Shield,
//   Lock,
//   Trash2,
//   Key,
//   AlertTriangle,
//   Settings,
// } from "lucide-react-native";
// import api from "../api/client";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";

// export default function MyAccountCustomer() {
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(false);

//   const handleDeleteAccount = async () => {
//     Alert.alert(
//       "Confirm Deletion",
//       "Are you sure you want to delete your account? This action cannot be undone.",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             setLoading(true);
//             try {
//               const token = await AsyncStorage.getItem("token");
//               await api.delete("/users/delete", {
//                 headers: { Authorization: `Bearer ${token}` },
//                 data: { reason: "Customer deleted account via My Account" },
//               });
//               await AsyncStorage.clear();
//               Alert.alert("Deleted", "Your account has been deleted.");
//               navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//             } catch (err) {
//               Alert.alert("Error", "Failed to delete account");
//             } finally {
//               setLoading(false);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleResetPassword = async () => {
//     setLoading(true);
//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (!token) {
//         Alert.alert(
//           "Missing Token",
//           "You are not authorized to reset password this way."
//         );
//         return;
//       }
//       navigation.navigate("ResetPasswordScreen", { token });
//     } catch (err) {
//       Alert.alert("Error", "Failed to navigate to reset password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           {/* Header */}
//           <View style={styles.header}>
//             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//               <ArrowLeft color="#fff" size={24} />
//             </TouchableOpacity>
//             <View style={styles.headerCenter}>
//               <View style={styles.headerBadge}>
//                 <Settings color="#60a5fa" size={16} />
//                 <Text style={styles.headerBadgeText}>Account Settings</Text>
//               </View>
//               <Text style={styles.headerTitle}>My Account</Text>
//             </View>
//             <View style={{ width: 40 }} />
//           </View>

//           {/* Profile Section */}
//           <View style={styles.profileCard}>
//             <LinearGradient
//               colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
//               style={styles.profileGradient}
//             >
//               <View style={styles.profileHeader}>
//                 <View style={styles.profileIconContainer}>
//                   <User color="#60a5fa" size={32} />
//                 </View>
//                 <View style={styles.profileInfo}>
//                   <Text style={styles.profileTitle}>Account Management</Text>
//                   <Text style={styles.profileSubtitle}>Manage your BlinqFix account settings and preferences</Text>
//                 </View>
//               </View>
//             </LinearGradient>
//           </View>

//           {/* Security Section */}
//           <View style={styles.sectionCard}>
//             <LinearGradient
//               colors={['rgba(96, 165, 250, 0.1)', 'rgba(59, 130, 246, 0.05)']}
//               style={styles.sectionGradient}
//             >
//               <View style={styles.sectionHeader}>
//                 <Shield color="#60a5fa" size={24} />
//                 <Text style={styles.sectionTitle}>Security & Privacy</Text>
//               </View>
              
//               <Text style={styles.sectionDescription}>
//                 Keep your account secure with these privacy and security options.
//               </Text>

//               <TouchableOpacity
//                 style={styles.actionButton}
//                 onPress={handleResetPassword}
//                 disabled={loading}
//               >
//                 <LinearGradient
//                   colors={['rgba(59, 130, 246, 0.2)', 'rgba(37, 99, 235, 0.1)']}
//                   style={styles.actionButtonGradient}
//                 >
//                   <Key color="#60a5fa" size={20} />
//                   <Text style={styles.actionButtonText}>Reset Password</Text>
//                 </LinearGradient>
//               </TouchableOpacity>
//             </LinearGradient>
//           </View>

//           {/* Danger Zone */}
//           <View style={styles.dangerCard}>
//             <LinearGradient
//               colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.05)']}
//               style={styles.dangerGradient}
//             >
//               <View style={styles.dangerHeader}>
//                 <AlertTriangle color="#ef4444" size={24} />
//                 <Text style={styles.dangerTitle}>Danger Zone</Text>
//               </View>
              
//               <Text style={styles.dangerDescription}>
//                 Once you delete your account, there is no going back. Please be certain.
//               </Text>

//               <TouchableOpacity
//                 style={styles.deleteButton}
//                 onPress={handleDeleteAccount}
//                 disabled={loading}
//               >
//                 <LinearGradient
//                   colors={['#ef4444', '#dc2626']}
//                   style={styles.deleteButtonGradient}
//                 >
//                   <Trash2 color="#fff" size={20} />
//                   <Text style={styles.deleteButtonText}>Delete My Account</Text>
//                 </LinearGradient>
//               </TouchableOpacity>
//             </LinearGradient>
//           </View>

//           {/* Loading Indicator */}
//           {loading && (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#60a5fa" />
//               <Text style={styles.loadingText}>Processing...</Text>
//             </View>
//           )}

//           {/* Trust Indicators */}
//           <View style={styles.trustSection}>
//             <View style={styles.trustItem}>
//               <Shield color="#22c55e" size={16} />
//               <Text style={styles.trustText}>Your data is protected</Text>
//             </View>
//             <View style={styles.trustItem}>
//               <Lock color="#60a5fa" size={16} />
//               <Text style={styles.trustText}>Secure encryption</Text>
//             </View>
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollContent: {
//     padding: 20,
//     paddingBottom: 40,
//     marginTop: 40,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingTop: 10,
//     paddingBottom: 20,
//   },
//   backButton: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     padding: 10,
//     borderRadius: 99,
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   headerCenter: {
//     alignItems: 'center',
//     flex: 1
//   },
//   headerBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginBottom: 8
//   },
//   headerBadgeText: {
//     color: '#fff',
//     marginLeft: 6,
//     fontSize: 12,
//     fontWeight: '500'
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#fff'
//   },
//   profileCard: {
//     marginBottom: 24,
//     borderRadius: 16,
//     overflow: 'hidden'
//   },
//   profileGradient: {
//     padding: 20
//   },
//   profileHeader: {
//     flexDirection: 'row',
//     alignItems: 'center'
//   },
//   profileIconContainer: {
//     backgroundColor: 'rgba(96, 165, 250, 0.2)',
//     padding: 16,
//     borderRadius: 16,
//     marginRight: 16
//   },
//   profileInfo: {
//     flex: 1
//   },
//   profileTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 4
//   },
//   profileSubtitle: {
//     fontSize: 14,
//     color: '#e0e7ff',
//     lineHeight: 20
//   },
//   sectionCard: {
//     marginBottom: 20,
//     borderRadius: 16,
//     overflow: 'hidden'
//   },
//   sectionGradient: {
//     padding: 20
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginLeft: 12
//   },
//   sectionDescription: {
//     fontSize: 14,
//     color: '#e0e7ff',
//     lineHeight: 20,
//     marginBottom: 16
//   },
//   actionButton: {
//     borderRadius: 12,
//     overflow: 'hidden'
//   },
//   actionButtonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     gap: 8
//   },
//   actionButtonText: {
//     color: '#60a5fa',
//     fontSize: 16,
//     fontWeight: '600'
//   },
//   dangerCard: {
//     marginBottom: 20,
//     borderRadius: 16,
//     overflow: 'hidden'
//   },
//   dangerGradient: {
//     padding: 20
//   },
//   dangerHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12
//   },
//   dangerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginLeft: 12
//   },
//   dangerDescription: {
//     fontSize: 14,
//     color: '#e0e7ff',
//     lineHeight: 20,
//     marginBottom: 16
//   },
//   deleteButton: {
//     borderRadius: 12,
//     overflow: 'hidden'
//   },
//   deleteButtonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     gap: 8
//   },
//   deleteButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold'
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 16,
//     marginBottom: 20
//   },
//   loadingText: {
//     color: '#e0e7ff',
//     fontSize: 16,
//     marginTop: 12
//   },
//   trustSection: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingVertical: 16,
//     marginTop: 20
//   },
//   trustItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6
//   },
//   trustText: {
//     color: '#e0e7ff',
//     fontSize: 12,
//     fontWeight: '500'
//   }
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  User,
  Shield,
  Lock,
  Trash2,
  Key,
  AlertTriangle,
  Settings,
  Save,
} from "lucide-react-native";
import api from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function MyAccountCustomer() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    address: "",
    zipcode: "",
    phoneNumber: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { name, email, address, zipcode, phoneNumber } = res.data;
        setProfile({
          name: name || "",
          email: email || "",
          address: address || "",
          zipcode: Array.isArray(zipcode) ? zipcode[0] : zipcode || "",
          phoneNumber: phoneNumber || "",
        });
      } catch (err) {
        console.log("Failed to fetch profile", err);
      }
    })();
  }, []);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No auth token");
      await api.put(
        "/users/update",
        {
          name: profile.name,
          email: profile.email,
          address: profile.address,
          zipcode: [profile.zipcode],
          phoneNumber: profile.phoneNumber,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("Success", "Profile updated successfully.");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const token = await AsyncStorage.getItem("token");
              await api.delete("/users/delete", {
                headers: { Authorization: `Bearer ${token}` },
                data: { reason: "Customer deleted account via My Account" },
              });
              await AsyncStorage.clear();
              Alert.alert("Deleted", "Your account has been deleted.");
              navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            } catch (err) {
              Alert.alert("Error", "Failed to delete account");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert(
          "Missing Token",
          "You are not authorized to reset password this way."
        );
        return;
      }
      navigation.navigate("ResetPasswordScreen", { token });
    } catch (err) {
      Alert.alert("Error", "Failed to navigate to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.headerBadge}>
                <Settings color="#60a5fa" size={16} />
                <Text style={styles.headerBadgeText}>Account Settings</Text>
              </View>
              <Text style={styles.headerTitle}>My Account</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.profileCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
              style={styles.profileGradient}
            >
              <View style={styles.profileHeader}>
                <View style={styles.profileIconContainer}>
                  <User color="#60a5fa" size={32} />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileTitle}>Profile Information</Text>
                  <Text style={styles.profileSubtitle}>Update your personal details</Text>
                </View>
              </View>

              {['name', 'email', 'address', 'zipcode', 'phoneNumber'].map((field) => (
                <TextInput
                  key={field}
                  style={styles.input}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  placeholderTextColor="#9ca3af"
                  value={profile[field]}
                  onChangeText={(text) => handleChange(field, text)}
                />
              ))}

              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile} disabled={loading}>
                <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.saveButtonGradient}>
                  <Save color="#fff" size={20} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.sectionCard}>
            <LinearGradient
              colors={['rgba(96, 165, 250, 0.1)', 'rgba(59, 130, 246, 0.05)']}
              style={styles.sectionGradient}
            >
              <View style={styles.sectionHeader}>
                <Shield color="#60a5fa" size={24} />
                <Text style={styles.sectionTitle}>Security & Privacy</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Keep your account secure with these privacy and security options.
              </Text>

              <TouchableOpacity style={styles.actionButton} onPress={handleResetPassword} disabled={loading}>
                <LinearGradient
                  colors={['rgba(59, 130, 246, 0.2)', 'rgba(37, 99, 235, 0.1)']}
                  style={styles.actionButtonGradient}
                >
                  <Key color="#60a5fa" size={20} />
                  <Text style={styles.actionButtonText}>Reset Password</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.dangerCard}>
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.05)']}
              style={styles.dangerGradient}
            >
              <View style={styles.dangerHeader}>
                <AlertTriangle color="#ef4444" size={24} />
                <Text style={styles.dangerTitle}>Danger Zone</Text>
              </View>
              <Text style={styles.dangerDescription}>
                Once you delete your account, there is no going back. Please be certain.
              </Text>

              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} disabled={loading}>
                <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.deleteButtonGradient}>
                  <Trash2 color="#fff" size={20} />
                  <Text style={styles.deleteButtonText}>Delete My Account</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#60a5fa" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          )}

          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <Shield color="#22c55e" size={16} />
              <Text style={styles.trustText}>Your data is protected</Text>
            </View>
            <View style={styles.trustItem}>
              <Lock color="#60a5fa" size={16} />
              <Text style={styles.trustText}>Secure encryption</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, paddingBottom: 20 },
  backButton: { backgroundColor: "rgba(255,255,255,0.1)", padding: 10, borderRadius: 99, width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  headerCenter: { alignItems: "center", flex: 1 },
  headerBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 8 },
  headerBadgeText: { color: "#fff", marginLeft: 6, fontSize: 12, fontWeight: "500" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  profileCard: { marginBottom: 24, borderRadius: 16, overflow: "hidden" },
  profileGradient: { padding: 20 },
  profileHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  profileIconContainer: { backgroundColor: "rgba(96, 165, 250, 0.2)", padding: 16, borderRadius: 16, marginRight: 16 },
  profileInfo: { flex: 1 },
  profileTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  profileSubtitle: { fontSize: 14, color: "#e0e7ff", lineHeight: 20 },
  input: { backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", padding: 12, borderRadius: 8, marginBottom: 12 },
  saveButton: { borderRadius: 12, overflow: "hidden", marginTop: 8 },
  saveButtonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, paddingHorizontal: 20, gap: 8 },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  sectionCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
  sectionGradient: { padding: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginLeft: 12 },
  sectionDescription: { fontSize: 14, color: "#e0e7ff", lineHeight: 20, marginBottom: 16 },
  actionButton: { borderRadius: 12, overflow: "hidden" },
  actionButtonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, paddingHorizontal: 20, gap: 8 },
  actionButtonText: { color: "#60a5fa", fontSize: 16, fontWeight: "600" },
  dangerCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
  dangerGradient: { padding: 20 },
  dangerHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  dangerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginLeft: 12 },
  dangerDescription: { fontSize: 14, color: "#e0e7ff", lineHeight: 20, marginBottom: 16 },
  deleteButton: { borderRadius: 12, overflow: "hidden" },
  deleteButtonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, paddingHorizontal: 20, gap: 8 },
  deleteButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  loadingContainer: { alignItems: "center", padding: 20, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, marginBottom: 20 },
  loadingText: { color: "#e0e7ff", fontSize: 16, marginTop: 12 },
  trustSection: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 16, marginTop: 20 },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  trustText: { color: "#e0e7ff", fontSize: 12, fontWeight: "500" },
});
