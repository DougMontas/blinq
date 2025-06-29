// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   Platform,
//   ScrollView,
// } from "react-native";
// import api from "../api/client";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";

// export default function MyAccountScreen() {
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(false);
//   const [currentTier, setCurrentTier] = useState(null);

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const { data } = await api.get("/users/me");
//         setCurrentTier(data.billingTier);
//       } catch (err) {
//         console.error("Failed to fetch user", err);
//       }
//     };
//     fetchUser();
//   }, []);

//   const handleDeleteAccount = async () => {
//     Alert.alert("Confirm Delete", "Are you sure you want to delete your account?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await api.put("/users/delete-account");
//             await AsyncStorage.clear();
//             navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//           } catch (err) {
//             Alert.alert("Error", "Failed to delete account");
//           }
//         },
//       },
//     ]);
//   };

//   const handleUpdateTier = async (tier) => {
//     try {
//       setLoading(true);
//       const { data } = await api.post("/stripe/update-billing", { billingTier: tier });
//       if (data?.url) {
//         navigation.navigate("WebViewScreen", { url: data.url });
//       } else {
//         Alert.alert("Success", `Billing updated to ${tier}`);
//         setCurrentTier(tier);
//       }
//     } catch (err) {
//       console.error("Billing update failed", err);
//       Alert.alert("Error", "Could not update billing");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>My Account</Text>

//       <Text style={styles.label}>Current Billing Tier: {currentTier || "Loading..."}</Text>

//       <TouchableOpacity
//         style={[styles.button, currentTier === "hybrid" && styles.selected]}
//         onPress={() => handleUpdateTier("hybrid")}
//         disabled={loading}
//       >
//         <Text style={styles.buttonText}>Gold Subscription</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.button, currentTier === "profit_sharing" && styles.selected]}
//         onPress={() => handleUpdateTier("profit_sharing")}
//         disabled={loading}
//       >
//         <Text style={styles.buttonText}>Profit Sharing</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.button, styles.danger]}
//         onPress={handleDeleteAccount}
//         disabled={loading}
//       >
//         <Text style={styles.buttonText}>Delete Account</Text>
//       </TouchableOpacity>

//       {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 24,
//     backgroundColor: "#fff",
//     flexGrow: 1,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   button: {
//     padding: 14,
//     borderRadius: 6,
//     backgroundColor: "#1976d2",
//     marginBottom: 12,
//     alignItems: "center",
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
//   },
// });

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   Platform,
//   ScrollView,
//   SafeAreaView,
// } from "react-native";
// import api from "../api/client";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";

// export default function MyAccountScreen() {
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(false);
//   const [currentTier, setCurrentTier] = useState(null);

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const { data } = await api.get("/users/me");
//         setCurrentTier(data.billingTier);
//       } catch (err) {
//         console.error("Failed to fetch user", err);
//       }
//     };
//     fetchUser();
//   }, []);

//   const handleDeleteAccount = async () => {
//     Alert.alert("Confirm Delete", "Are you sure you want to delete your account?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await api.put("/users/delete-account");
//             await AsyncStorage.clear();
//             navigation.reset({ index: 0, routes: [{ name: "Login" }] });
//           } catch (err) {
//             Alert.alert("Error", "Failed to delete account");
//           }
//         },
//       },
//     ]);
//   };

//   const handleUpdateTier = async (tier) => {
//     try {
//       setLoading(true);
//       const { data } = await api.post("/stripe/update-billing", { billingTier: tier });
//       if (data?.url) {
//         navigation.navigate("WebViewScreen", { url: data.url });
//       } else {
//         Alert.alert("Success", `Billing updated to ${tier}`);
//         setCurrentTier(tier);
//       }
//     } catch (err) {
//       console.error("Billing update failed", err);
//       Alert.alert("Error", "Could not update billing");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={styles.title}>My Account</Text>

//         <Text style={styles.label}>Current Billing Tier: {currentTier || "Loading..."}</Text>

//         <TouchableOpacity
//           style={[styles.button, currentTier === "hybrid" && styles.selected]}
//           onPress={() => handleUpdateTier("hybrid")}
//           disabled={loading}
//         >
//           <Text style={styles.buttonText}>Gold Subscription</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.button, currentTier === "profit_sharing" && styles.selected]}
//           onPress={() => handleUpdateTier("profit_sharing")}
//           disabled={loading}
//         >
//           <Text style={styles.buttonText}>Profit Sharing</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.button, styles.danger]}
//           onPress={handleDeleteAccount}
//           disabled={loading}
//         >
//           <Text style={styles.buttonText}>Delete Account</Text>
//         </TouchableOpacity>

//         {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 24,
//     backgroundColor: "#fff",
//     flexGrow: 1,
//     paddingBottom: 160,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   label: {
//     fontSize: 16,
//     marginBottom: 20,
//     textAlign: "center",
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
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     zIndex: 999,
//     padding: 16,
//     borderRadius: 0,
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
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import api from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function MyAccountScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/users/me");
        setCurrentTier(data.billingTier);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateTier = async (tier) => {
    try {
      setLoading(true);
      const { data } = await api.post("/stripe/update-billing", { billingTier: tier });
      if (data?.url) {
        navigation.navigate("WebViewScreen", { url: data.url });
      } else {
        Alert.alert("Success", `Billing updated to ${tier}`);
        setCurrentTier(tier);
      }
    } catch (err) {
      console.error("Billing update failed", err);
      Alert.alert("Error", "Could not update billing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
          <Text style={styles.title}>My Account</Text>

          <Text style={styles.label}>Current Billing Tier: {currentTier || "Loading..."}</Text>

          <TouchableOpacity
            style={[styles.button, currentTier === "hybrid" && styles.selected]}
            onPress={() => handleUpdateTier("hybrid")}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Gold Subscription</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, currentTier === "profit_sharing" && styles.selected]}
            onPress={() => handleUpdateTier("profit_sharing")}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Profit Sharing</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
        </ScrollView>

        <TouchableOpacity
          style={styles.fixedButton}
          onPress={() => navigation.navigate("DeleteAccountScreen")}
        >
          <Text style={styles.buttonText}>Delete My Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    padding: 14,
    borderRadius: 6,
    backgroundColor: "#1976d2",
    marginBottom: 12,
    alignItems: "center",
    marginHorizontal: 24,
  },
  selected: {
    backgroundColor: "#004aad",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  fixedButton: {
    backgroundColor: "#1976d2",
    padding: 16,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
});
