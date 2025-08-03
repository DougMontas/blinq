// === frontend/screens/DeleteAccountScreen.js ===
import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";

export default function DeleteAccountScreen() {
  const navigation = useNavigation();

  const [reason, setReason] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

  const commonOptions = [
    "Too expensive",
    "Not finding enough jobs",
    "Switching to another platform",
  ];

  const confirmDelete = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to permanently delete your account? This cannot be undone.",
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
                data: {
                  reason: `${
                    selectedOption ? selectedOption + " — " : ""
                  }${reason}`,
                },
              });
              await AsyncStorage.clear();
              Alert.alert(
                "Account Deleted",
                "Your account has been successfully deleted."
              );
              navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            } catch (err) {
              // Only alert without logging stack trace
              Alert.alert(
                "Error",
                "Could not delete account. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          <Text style={styles.label}>
            Emergencies are unpredictable and it's always best to have a plan
            for them. But if you must go just remember, you can download the app
            again, incase you need us. Please tell us why are you deleting your
            account today?
          </Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
            <Text style={styles.label}>Why are you deleting your account?</Text>

            {commonOptions.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.option,
                  selectedOption === option && styles.optionSelected,
                ]}
                onPress={() => setSelectedOption(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}

            <TextInput
              style={styles.input}
              placeholder="Add additional comments (optional)"
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
            />
          </ScrollView>

          <TouchableOpacity
            style={styles.button}
            onPress={confirmDelete}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Delete My Account</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  label: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "600",
    padding: 24,
    paddingBottom: 0,
  },
  option: {
    padding: 14,
    marginHorizontal: 24,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  optionSelected: {
    backgroundColor: "#f0f0f0",
    borderColor: "#1976d2",
  },
  optionText: {
    fontSize: 15,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginTop: 12,
    marginBottom: 16,
    marginHorizontal: 24,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "red",
    padding: 16,
    borderRadius: 0,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
