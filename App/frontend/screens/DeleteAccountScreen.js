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
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  AlertTriangle,
  Trash2,
  MessageCircle,
  CheckCircle,
  Shield,
  Download,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";

export default function DeleteAccountScreen() {
  const navigation = useNavigation();
  const [reason, setReason] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

  // Keep all original backend logic exactly the same
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
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#312e81"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <ArrowLeft color="#fff" size={24} />
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <View style={styles.headerBadge}>
                  <AlertTriangle color="#f87171" size={16} />
                  <Text style={styles.headerBadgeText}>Account Deletion</Text>
                </View>
                <Text style={styles.headerTitle}>Delete Account</Text>
              </View>
              <View style={{ width: 40 }} />
            </View>

            {/* Warning Card */}
            <View style={styles.warningCard}>
              <LinearGradient
                colors={["rgba(239, 68, 68, 0.15)", "rgba(220, 38, 38, 0.05)"]}
                style={styles.warningGradient}
              >
                <View style={styles.warningHeader}>
                  <AlertTriangle color="#f87171" size={32} />
                  <Text style={styles.warningTitle}>
                    We're Sorry to See You Go
                  </Text>
                </View>
                <Text style={styles.warningText}>
                  Emergencies are unpredictable and it's always best to have a
                  plan for them. But if you must go just remember, you can
                  download the app again, in case you need us.
                </Text>
                <View style={styles.warningBadge}>
                  <Download color="#60a5fa" size={16} />
                  <Text style={styles.warningBadgeText}>
                    Always here when you need us
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Feedback Section */}
            <View style={styles.feedbackCard}>
              <LinearGradient
                colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
                style={styles.feedbackGradient}
              >
                <View style={styles.cardHeader}>
                  <MessageCircle color="#60a5fa" size={24} />
                  <Text style={styles.cardTitle}>
                    Why are you deleting your account?
                  </Text>
                </View>

                <Text style={styles.cardSubtitle}>
                  Your feedback helps us improve BlinqFix for everyone.
                </Text>

                {/* Options */}
                <View style={styles.optionsContainer}>
                  {commonOptions.map((option, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.option,
                        selectedOption === option && styles.optionSelected,
                      ]}
                      onPress={() => setSelectedOption(option)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selectedOption === option &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                      {selectedOption === option && (
                        <CheckCircle color="#22c55e" size={20} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Additional Comments */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Additional Comments (Optional)
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tell us more about your experience..."
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={4}
                    value={reason}
                    onChangeText={setReason}
                  />
                </View>
              </LinearGradient>
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={confirmDelete}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ef4444", "#dc2626"]}
                style={styles.deleteButtonGradient}
              >
                <Trash2 color="#fff" size={20} />
                <Text style={styles.deleteButtonText}>Delete My Account</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Shield color="#94a3b8" size={16} />
              <Text style={styles.securityText}>
                Your data will be permanently deleted within 30 days as per our
                privacy policy.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 99,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(248, 113, 113, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.3)",
  },
  headerBadgeText: {
    color: "#f87171",
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  warningCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  warningGradient: {
    padding: 24,
  },
  warningHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 12,
    textAlign: "center",
  },
  warningText: {
    fontSize: 16,
    color: "#e0e7ff",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(96, 165, 250, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.3)",
  },
  warningBadgeText: {
    color: "#60a5fa",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  feedbackCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  feedbackGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#e0e7ff",
    marginBottom: 20,
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: "rgba(96, 165, 250, 0.2)",
    borderColor: "#60a5fa",
  },
  optionText: {
    fontSize: 16,
    color: "#e0e7ff",
    flex: 1,
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  inputContainer: {
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e0e7ff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    textAlignVertical: "top",
    minHeight: 100,
  },
  deleteButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  deleteButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    gap: 8,
  },
  securityText: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
    flex: 1,
    lineHeight: 16,
  },
});
