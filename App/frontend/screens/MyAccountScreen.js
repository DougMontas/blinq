// import React, { useEffect, useState } from "react";
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

// export default function MyAccountScreen() {
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(false);
//   const [currentTier, setCurrentTier] = useState("Loading...");
//   const [isActive, setIsActive] = useState(null);
//   const [successMessage, setSuccessMessage] = useState("");

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const token = await AsyncStorage.getItem("token");
//         const res = await api.get("/users/billing-info", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const { billingTier, isActive } = res.data || {};

//         setCurrentTier(billingTier || "Not Set");
//         setIsActive(
//           isActive === true
//             ? "Active"
//             : isActive === false
//             ? "Inactive"
//             : "Unknown"
//         );
//       } catch (err) {
//         console.error("Failed to fetch billing info:", err);
//         setCurrentTier("Unavailable");
//         setIsActive("Unavailable");
//       }
//     };
//     fetchUser();
//   }, []);

//   const confirmAndUpdateTier = (tier) => {
//     if (tier === currentTier) {
//       Alert.alert("No Change", `You are already on the ${tier} plan.`);
//       return;
//     }

//     Alert.alert(
//       "Confirm Subscription Change",
//       `Switch to ${
//         tier === "hybrid" ? "Gold Subscription" : "Profit Sharing"
//       }?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Confirm",
//           onPress: () => handleUpdateTier(tier),
//         },
//       ]
//     );
//   };

//   const handleUpdateTier = async (tier) => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("token");

//       const { data } = await api.post(
//         "/routes/stripe/update-billing",
//         { billingTier: tier },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (data?.url) {
//         // Redirect to Stripe Checkout or Account Onboarding
//         navigation.navigate("WebViewScreen", { url: data.url });
//       } else {
//         // No URL, just success
//         setSuccessMessage(`✔️ Subscription updated to ${tier}.`);
//         setCurrentTier(tier);
//         setTimeout(() => setSuccessMessage(""), 4000);
//       }
//     } catch (err) {
//       console.error("❌ Billing update failed:", err);
//       Alert.alert(
//         "Error",
//         err.response?.data?.msg || "Could not update billing."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

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
//                 data: { reason: "Deleted from My Account Screen" },
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
//       <View style={styles.container}>
//         <BackButton />
//         <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
//           <Text style={styles.title}>My Account</Text>

//           <Text style={styles.label}>Current Billing Tier: {currentTier}</Text>
//           <Text style={styles.label}>Account Status: {isActive}</Text>
//           {successMessage ? (
//             <Text style={styles.successBanner}>{successMessage}</Text>
//           ) : null}

//           <Text style={styles.label}>Manage Billing Below:</Text>

//           <TouchableOpacity
//             style={[styles.button, currentTier === "hybrid" && styles.selected]}
//             onPress={() => confirmAndUpdateTier("hybrid")}
//             disabled={loading}
//           >
//             <Text style={styles.buttonText}>Priority Subscription</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.button,
//               currentTier === "profit_sharing" && styles.selected,
//             ]}
//             onPress={() => confirmAndUpdateTier("profit_sharing")}
//             disabled={loading}
//           >
//             <Text style={styles.buttonText}>Free Subscription</Text>
//           </TouchableOpacity>

//           {/* <Text style={styles.label}>Delete Account  Below:</Text> */}

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

//           <TouchableOpacity
//             style={[styles.button, styles.danger]}
//             onPress={handleDeleteAccount}
//             disabled={loading}
//           >
//             <Text style={styles.buttonText}>Delete My Account</Text>
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
//   },
//   successBanner: {
//     fontSize: 16,
//     backgroundColor: "#d4edda",
//     color: "#155724",
//     padding: 10,
//     marginHorizontal: 24,
//     marginBottom: 12,
//     borderRadius: 4,
//     textAlign: "center",
//     fontWeight: "500",
//   },
//   button: {
//     padding: 14,
//     borderRadius: 6,
//     backgroundColor: "#1976d2",
//     marginBottom: 12,
//     alignItems: "center",
//     marginHorizontal: 24,
//   },
//   selected: {
//     backgroundColor: "#004aad",
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

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Settings,
  CreditCard,
  Crown,
  Gift,
  Key,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Shield,
  Lock,
  User,
} from "lucide-react-native";
import api from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function MyAccountScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState("Loading...");
  const [isActive, setIsActive] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Keep all original backend logic exactly the same
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await api.get("/users/billing-info", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { billingTier, isActive } = res.data || {};

        setCurrentTier(billingTier || "Not Set");
        setIsActive(
          isActive === true
            ? "Active"
            : isActive === false
            ? "Inactive"
            : "Unknown"
        );
      } catch (err) {
        console.error("Failed to fetch billing info:", err);
        setCurrentTier("Unavailable");
        setIsActive("Unavailable");
      }
    };
    fetchUser();
  }, []);

  const confirmAndUpdateTier = (tier) => {
    if (tier === currentTier) {
      Alert.alert("No Change", `You are already on the ${tier} plan.`);
      return;
    }

    Alert.alert(
      "Confirm Subscription Change",
      `Switch to ${
        tier === "hybrid" ? "Gold Subscription" : "Profit Sharing"
      }?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => handleUpdateTier(tier),
        },
      ]
    );
  };

  const handleUpdateTier = async (tier) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const { data } = await api.post(
        "/routes/stripe/update-billing",
        { billingTier: tier },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data?.url) {
        // Redirect to Stripe Checkout or Account Onboarding
        navigation.navigate("WebViewScreen", { url: data.url });
      } else {
        // No URL, just success
        setSuccessMessage(`✔️ Subscription updated to ${tier}.`);
        setCurrentTier(tier);
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (err) {
      console.error("❌ Billing update failed:", err);
      Alert.alert(
        "Error",
        err.response?.data?.msg || "Could not update billing."
      );
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
            try {
              const token = await AsyncStorage.getItem("token");
              await api.delete("/users/delete", {
                headers: { Authorization: `Bearer ${token}` },
                data: { reason: "Deleted from My Account Screen" },
              });
              await AsyncStorage.clear();
              Alert.alert("Deleted", "Your account has been deleted.");
              navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            } catch (err) {
              Alert.alert("Error", "Failed to delete account");
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "#22c55e";
      case "Inactive": return "#f87171";
      default: return "#94a3b8";
    }
  };

  const getTierDisplay = (tier) => {
    switch (tier) {
      case "hybrid": return "Priority Subscription";
      case "profit_sharing": return "Free Subscription";
      default: return tier;
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e3a8a', '#312e81']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
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

          {/* Success Message */}
          {successMessage ? (
            <View style={styles.successCard}>
              <LinearGradient
                colors={['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.1)']}
                style={styles.successGradient}
              >
                <CheckCircle color="#22c55e" size={24} />
                <Text style={styles.successText}>{successMessage}</Text>
              </LinearGradient>
            </View>
          ) : null}

          {/* Account Status Card */}
          <View style={styles.statusCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
              style={styles.statusGradient}
            >
              <View style={styles.statusHeader}>
                <User color="#60a5fa" size={24} />
                <Text style={styles.statusTitle}>Account Status</Text>
              </View>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Current Plan:</Text>
                <Text style={styles.statusValue}>{getTierDisplay(currentTier)}</Text>
              </View>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status:</Text>
                <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(isActive) }]} />
                  <Text style={[styles.statusValue, { color: getStatusColor(isActive) }]}>
                    {isActive}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Billing Management Card */}
          <View style={styles.billingCard}>
            <LinearGradient
              colors={['rgba(96, 165, 250, 0.1)', 'rgba(59, 130, 246, 0.05)']}
              style={styles.billingGradient}
            >
              <View style={styles.billingHeader}>
                <CreditCard color="#60a5fa" size={24} />
                <Text style={styles.billingTitle}>Subscription Plans</Text>
              </View>
              
              <Text style={styles.billingDescription}>
                Choose the plan that works best for your business needs
              </Text>

              {/* Priority Subscription */}
              <TouchableOpacity
                style={[
                  styles.planButton,
                  currentTier === "hybrid" && styles.planButtonSelected,
                ]}
                onPress={() => confirmAndUpdateTier("hybrid")}
                disabled={loading}
              >
                <LinearGradient
                  colors={currentTier === "hybrid" 
                    ? ['rgba(250, 204, 21, 0.3)', 'rgba(245, 158, 11, 0.2)']
                    : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                  }
                  style={styles.planButtonGradient}
                >
                  <View style={styles.planButtonContent}>
                    <Crown color={currentTier === "hybrid" ? "#facc15" : "#94a3b8"} size={24} />
                    <View style={styles.planInfo}>
                      <Text style={styles.planTitle}>Priority Subscription</Text>
                      <Text style={styles.planSubtitle}>Priority job access</Text>
                    </View>
                    {currentTier === "hybrid" && (
                      <CheckCircle color="#facc15" size={20} />
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Free Subscription */}
              <TouchableOpacity
                style={[
                  styles.planButton,
                  currentTier === "profit_sharing" && styles.planButtonSelected,
                ]}
                onPress={() => confirmAndUpdateTier("profit_sharing")}
                disabled={loading}
              >
                <LinearGradient
                  colors={currentTier === "profit_sharing" 
                    ? ['rgba(34, 197, 94, 0.3)', 'rgba(16, 185, 129, 0.2)']
                    : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                  }
                  style={styles.planButtonGradient}
                >
                  <View style={styles.planButtonContent}>
                    <Gift color={currentTier === "profit_sharing" ? "#22c55e" : "#94a3b8"} size={24} />
                    <View style={styles.planInfo}>
                      <Text style={styles.planTitle}>Free Subscription</Text>
                      <Text style={styles.planSubtitle}>No monthly fees, standard rates</Text>
                    </View>
                    {currentTier === "profit_sharing" && (
                      <CheckCircle color="#22c55e" size={20} />
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Security Section */}
          <View style={styles.securityCard}>
            <LinearGradient
              colors={['rgba(99, 102, 241, 0.1)', 'rgba(79, 70, 229, 0.05)']}
              style={styles.securityGradient}
            >
              <View style={styles.securityHeader}>
                <Shield color="#6366f1" size={24} />
                <Text style={styles.securityTitle}>Security & Privacy</Text>
              </View>

              <TouchableOpacity
                style={styles.securityButton}
                onPress={async () => {
                  const token = await AsyncStorage.getItem("token");
                  if (!token) {
                    Alert.alert(
                      "Missing Token",
                      "You are not authorized to reset password this way."
                    );
                    return;
                  }
                  navigation.navigate("ResetPasswordScreen", { token });
                }}
                disabled={loading}
              >
                <LinearGradient
                  colors={['rgba(99, 102, 241, 0.2)', 'rgba(79, 70, 229, 0.1)']}
                  style={styles.securityButtonGradient}
                >
                  <Key color="#6366f1" size={20} />
                  <Text style={styles.securityButtonText}>Reset Password</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Danger Zone */}
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

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteAccount}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#ef4444', '#dc2626']}
                  style={styles.deleteButtonGradient}
                >
                  <Trash2 color="#fff" size={20} />
                  <Text style={styles.deleteButtonText}>Delete My Account</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#60a5fa" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          )}

          {/* Trust Indicators */}
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 99,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8
  },
  headerBadgeText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  successCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden'
  },
  successGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12
  },
  successText: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '600',
    flex: 1
  },
  statusCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden'
  },
  statusGradient: {
    padding: 20
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  statusLabel: {
    fontSize: 16,
    color: '#e0e7ff'
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  billingCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden'
  },
  billingGradient: {
    padding: 20
  },
  billingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  billingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12
  },
  billingDescription: {
    fontSize: 14,
    color: '#e0e7ff',
    marginBottom: 20,
    lineHeight: 20
  },
  planButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden'
  },
  planButtonSelected: {
    borderWidth: 2,
    borderColor: 'rgba(250, 204, 21, 0.5)'
  },
  planButtonGradient: {
    padding: 16
  },
  planButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  planInfo: {
    flex: 1
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2
  },
  planSubtitle: {
    fontSize: 14,
    color: '#e0e7ff'
  },
  securityCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden'
  },
  securityGradient: {
    padding: 20
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12
  },
  securityButton: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  securityButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8
  },
  securityButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600'
  },
  dangerCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden'
  },
  dangerGradient: {
    padding: 20
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12
  },
  dangerDescription: {
    fontSize: 14,
    color: '#e0e7ff',
    lineHeight: 20,
    marginBottom: 16
  },
  deleteButton: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  deleteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    marginBottom: 20
  },
  loadingText: {
    color: '#e0e7ff',
    fontSize: 16,
    marginTop: 12
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginTop: 20
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  trustText: {
    color: '#e0e7ff',
    fontSize: 12,
    fontWeight: '500'
  }
});