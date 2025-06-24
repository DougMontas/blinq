// // === frontend/components/DeleteButton.js ===
// import React from "react";
// import { TouchableOpacity, Text, StyleSheet } from "react-native";
// import { useNavigation } from "@react-navigation/native";


// export default function DeleteButton() {
//   const navigation = useNavigation();

//   return (
//     <TouchableOpacity
//       style={styles.button}
//       onPress={() => navigation.navigate("DeleteAccountScreen")}
//     >
        
//       <Text style={styles.buttonText}>Delete My Account</Text>
//     </TouchableOpacity>
//   );
// }

// // const styles = StyleSheet.create({
// //   button: {
// //     backgroundColor: "#c62828",
// //     padding: 14,
// //     borderRadius: 6,
// //     alignItems: "center",
// //     marginTop: 220,
// //   },
// //   buttonText: {
// //     color: "#fff",
// //     fontWeight: "bold",
// //     fontSize: 16,
// //   },
// // });

// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: "#fff",
//       justifyContent: "flex-end",
//     },
//     body: {
//       flex: 1,
//       padding: 24,
//       justifyContent: "center",
//     },
//     label: {
//       fontSize: 16,
//       textAlign: "center",
//     },
//     button: {
//       position: "absolute",
//       bottom: 0,
//       left: 0,
//       right: 0,
//       backgroundColor: "red",
//       paddingVertical: 20,
//       paddingHorizontal: 24,
//     },
//     buttonText: {
//       color: "#fff",
//       fontWeight: "bold",
//       textAlign: "center",
//       fontSize: 16,
//     },
//   });
  
import React from "react";
import { TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function DeleteButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("DeleteAccountScreen")}
    >
      <Text style={styles.buttonText}>Delete My Account</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#b71c1c",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginBottom: Platform.OS === "android" ? 30 : 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '100vw',
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});
