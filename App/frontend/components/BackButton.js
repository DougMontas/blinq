// components/BackButton.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function BackButton() {
  const navigation = useNavigation();

  return (
    // <TouchableOpacity
    //   style={styles.button}
    //   onPress={() => navigation.goBack()}
    // >
    //   <Text style={styles.text}>← Back</Text>
    // </TouchableOpacity>
    <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
      <Text style={styles.backBtnText}>← Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1976d2",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 15,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 16,
    color: "#1976d2",
    fontWeight: "600",
    padding: 1,
  },
});
