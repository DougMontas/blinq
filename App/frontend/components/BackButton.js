// // components/BackButton.js
// import React from "react";
// import { TouchableOpacity, Text, StyleSheet, Pressable } from "react-native";
// import { useNavigation } from "@react-navigation/native";

// export default function BackButton() {
//   const navigation = useNavigation();

//   return (
//     <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
//       <Text style={styles.backBtnText}>← Back</Text>
//     </Pressable>
//   );
// }

// const styles = StyleSheet.create({
//   button: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 18,
//     paddingHorizontal: 18,
//     borderRadius: 4,
//     alignSelf: "flex-start",
//     marginTop: 15,
//   },
//   text: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//     textShadowColor: "rgba(0, 0, 0, 0.5)",
//     textShadowOffset: { width: 2, height: 2 },
//     textShadowRadius: 2,
//   },
//   backBtn: {
//     paddingVertical: 8,
//     paddingHorizontal: 6,
//     alignSelf: "flex-start",
//     marginBottom: 12,
//   },
//   backBtnText: {
//     fontSize: 16,
//     color: "#1976d2",
//     fontWeight: "600",
//     padding: 1,
//   },
// });

import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function BackButton() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  // Adjust values based on screen width
  const fontSize = width < 360 ? 14 : width < 768 ? 16 : 18;
  const padding = width < 360 ? 4 : width < 768 ? 6 : 8;

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      style={[styles.backBtn, { paddingHorizontal: padding, paddingVertical: padding }]}
    >
      <Text style={[styles.backBtnText, { fontSize:38, color: 'grey' }]}>{'<'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 12,
    marginTop: 25
  },
  backBtnText: {
    color: "#1976d2",
    fontWeight: "600",
    padding: 1,
  },
});
