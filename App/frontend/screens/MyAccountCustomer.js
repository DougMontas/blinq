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
// import ResetPasswordScreen from "./ResetPasswordScreen";

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
//         <BackButton />
//       <View style={styles.container}>
//         <BackButton />
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
//           <TouchableOpacity
//             style={[styles.button, styles.danger]}
//             onPress={navigation.navigate(ResetPasswordScreen)}
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

import React, { useState } from "react";
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
import api from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import BackButton from "../components/BackButton";

export default function MyAccountCustomer() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

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
                data: { reason: "Customer deleted account via My Account" },
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BackButton />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <Text style={styles.title}>My Account</Text>

          <Text style={styles.label}>
            You may delete your account below. This cannot be undone.
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.danger]}
            onPress={handleDeleteAccount}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Delete My Account</Text>
          </TouchableOpacity>

          {/* Updated to correctly navigate to ResetPassword screen */}
          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              const token = await AsyncStorage.getItem("token");
              if (!token) {
                Alert.alert("Missing Token", "You are not authorized to reset password this way.");
                return;
              }
              navigation.navigate("ResetPasswordScreen", { token });
            }}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 50,
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
    paddingHorizontal: 16,
  },
  button: {
    padding: 14,
    borderRadius: 6,
    backgroundColor: "#1976d2",
    marginBottom: 12,
    alignItems: "center",
    marginHorizontal: 24,
  },
  danger: {
    backgroundColor: "red",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});
