// frontend/components/DeleteButton.js
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Alert,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function DeleteButton() {
  const navigation = useNavigation();

  const confirmDeletion = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          style: "destructive",
          onPress: () => navigation.navigate("DeleteAccountScreen"),
        },
      ]
    );
  };

  return (
    <View style={styles.buttonWrapper}>
      <TouchableOpacity style={styles.button} onPress={confirmDeletion}>
        <Text style={styles.buttonText}>Delete My Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#b71c1c",
    paddingHorizontal: 0,
    zIndex: 10,
  },
  button: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
