//ProviderJobStatus.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRoute, useNavigation } from "@react-navigation/native";
import JobDetails from "../components/JobDetails";
import api from "../api/client";
import { saveSession, clearSession } from "../utils/sessionManager";
import ScreenWrapper from "../components/ScreenWrapper";

const TRAVEL_FEE = 100;
const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.55;

const CustomButton = ({ title, onPress, disabled, color = "#1976d2" }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      styles.customButton,
      { backgroundColor: disabled ? "#ccc" : color },
    ]}
  >
    <Text style={styles.customButtonText}>{title}</Text>
  </TouchableOpacity>
);

export default function ProviderJobStatus() {
  const route = useRoute();
  const jobId = route?.params?.jobId;
  const navigation = useNavigation();
  const scrollRef = useRef();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [notifiedComplete, setNotifiedComplete] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [additionalCharge, setAdditionalCharge] = useState("");
  const [additionalChargeReason, setAdditionalChargeReason] = useState("");
  const [showNotCompleteModal, setShowNotCompleteModal] = useState(false);
  const hasSeenNotCompleteRef = useRef(false);
  const [showNotification, setShowNotification] = useState(true);
  const modalDisplayedRef = useRef(false);

  const phoneTimer = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowNotification(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let alive = true;
    const fetchJob = async () => {
      let jobFetched = false;
      try {
        const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
        if (!alive) return;
        setJob(data);
        jobFetched = true;

        if (
          data.customerMarkedIncomplete &&
          !hasSeenNotCompleteRef.current &&
          data.status !== "completed"
        ) {
          setShowNotCompleteModal(true);
          hasSeenNotCompleteRef.current = true;
        }

        if (data.status === "completed" && !notifiedComplete) {
          setNotifiedComplete(true);
          Alert.alert("Job Complete", "This job is now fully completed.", [
            {
              text: "OK",
              onPress: () => navigation.navigate("ServiceProviderDashboard"),
            },
          ]);
          await clearSession();
        }

        if (
          data.status !== "completed" &&
          data.customerMarkedIncomplete === true &&
          data.lastNotCompleteAt &&
          (!job?.lastNotCompleteAt ||
            new Date(data.lastNotCompleteAt).getTime() !==
              new Date(job.lastNotCompleteAt).getTime())
        ) {
          setShowNotCompleteModal(true);
          modalDisplayedRef.current = true;
          try {
            await api.post(`/jobs/${jobId}/log`, {
              event: "modal_not_complete_shown",
              timestamp: new Date().toISOString(),
              jobId,
              triggeredBy: "customerMarkedIncomplete",
            });
          } catch (logErr) {
            console.error("Logging modal event failed:", logErr);
          }
        }

        if (data.acceptedProvider && !phoneTimer.current) {
          phoneTimer.current = setTimeout(
            () => setShowPhone(true),
            6 * 60 * 1000
          );
        }
      } catch (err) {
        console.error("Fetch job failed:", err);
        if (!jobFetched) alive && Alert.alert("Error", "Unable to load job");
      } finally {
        alive && setLoading(false);
      }
    };

    fetchJob();
    const interval = setInterval(fetchJob, 20000);
    return () => {
      alive = false;
      clearInterval(interval);
      if (phoneTimer.current) clearTimeout(phoneTimer.current);
    };
  }, [jobId, notifiedComplete, navigation]);

  // ✅ Always declare hooks at top level; use conditions inside only
  useEffect(() => {
    if (job?.status === "cancelled-by-customer") {
      Alert.alert("Job Cancelled", "The customer has cancelled this job.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("ServiceProviderDashboard"),
        },
      ]);
    }
  }, [job?.status]);

  useEffect(() => {
    if (job && job.status !== "completed") {
      saveSession({ role: "serviceProvider", jobId: job._id });
    }
  }, [job]);

  const handleUpdateCharge = async () => {
    const amt = Number(additionalCharge);
    if (!amt || !additionalChargeReason) {
      return Alert.alert(
        "Missing Info",
        "Both charge and reason are required."
      );
    }
    try {
      const { data } = await api.put(`/jobs/${jobId}/additional-charge`, {
        additionalCharge: amt,
        reason: additionalChargeReason,
      });
      setJob(data);
      Alert.alert("Extra Charge Recorded", "Redirecting homeowner to payment…");
    } catch (err) {
      console.error("Update-charge error:", err);
      Alert.alert("Error", "Failed to record extra charge.");
    }
  };

  const handleCancelJob = async () => {
    Alert.alert("Cancel Job", "Are you sure you want to cancel this job?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          setCancelling(true);
          await clearSession();

          try {
            await api.put(`/jobs/${jobId}/cancelled`, {
              cancelledBy: "serviceProvider",
              travelFee: TRAVEL_FEE,
            });
            Alert.alert("Cancelled", "The job has been cancelled.");
            navigation.navigate("ServiceProviderDashboard");
          } catch (err) {
            console.error("Cancel-job error:", err);
            Alert.alert("Error", "Cancellation failed.");
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  const pickAndUpload = async (phase) => {
    const status = await ImagePicker.requestCameraPermissionsAsync();
    if (status.status !== "granted") {
      return Alert.alert("Permission denied", "Camera access is required.");
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    const uri = result.assets?.[0]?.uri;
    if (!uri) return Alert.alert("Error", "Could not read image.");
    const name = uri.split("/").pop();
    const match = /\.(\w+)$/.exec(name);
    const type = match ? `image/${match[1]}` : "image";
    const form = new FormData();
    form.append("image", { uri, name, type });
    try {
      const { data } = await api.post(`/jobs/${jobId}/upload/${phase}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setJob(data);
      Alert.alert("Uploaded", `Successfully uploaded ${phase} image.`);
    } catch (err) {
      const msg = err.response?.data?.msg || err.message || "Upload failed.";
      Alert.alert("Upload failed", msg);
    }
  };

  const handleFinalize = async () => {
    try {
      const { data } = await api.put(`/jobs/${jobId}/complete/provider`);
      setJob(data);
      Alert.alert(
        "Done",
        "You’ve marked the job complete. Waiting for customer confirmation."
      );
    } catch (err) {
      console.error("Finalize error:", err);
      Alert.alert("Error", "Could not finalize job.");
    }
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;
  if (!job) return <Text style={styles.center}>No job found.</Text>;

  const awaitingAdditional = job.status === "awaiting-additional-payment";
  const ac = job.additionalCharge || 0;
  const estimatedTotal = job.estimatedTotal || 0;

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
          <View style={styles.containerLogo}>
            <Image
              source={require("../assets/blinqfix_logo-new.jpeg")}
              style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
              resizeMode="contain"
            />
          </View>
          {showNotification && (
            <View
              style={{
                backgroundColor: "#e0f7fa",
                padding: 12,
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <Text
                style={[
                  styles.notification,
                  { color: "#00796b", fontWeight: "bold", fontSize: 22 },
                ]}
              >
                Emergency Job Awarded!
              </Text>
              <Text style={[styles.notification, { color: "#004d40" }]}>
                Congrats you got the job. Customer has been notified that you
                will be in route shortly.
              </Text>
            </View>
          )}

          {job.paymentStatus !== "paid" && (
            <Text style={styles.alert}>** Status will update live **</Text>
          )}
          <JobDetails jobId={jobId} job={job} />
          {showPhone && job?.customer?.phoneNumber && (
            <Text style={styles.phone}>
              Customer Phone: {job.customer.phoneNumber}
            </Text>
          )}

          <View style={styles.card}>
            <Text style={styles.title}>Provider Actions</Text>
            <Text style={{ textAlign: "center", marginBottom: 10 }}>
              Additional Charge: ${ac.toFixed(2)}
              {"\n"}
              Estimate Total: ${estimatedTotal.toFixed(2)}
            </Text>
            <Text style={styles.label}>Step1: Arrival Photo</Text>
            <CustomButton
              title="Capture Arrival Photo"
              onPress={() => pickAndUpload("arrival")}
              disabled={awaitingAdditional}
            />
            <Text style={styles.label}>Step2: Additional Charge</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={additionalCharge}
              onChangeText={setAdditionalCharge}
              placeholder="e.g. 50.00"
            />
            <TextInput
              style={styles.input}
              value={additionalChargeReason}
              onChangeText={setAdditionalChargeReason}
              placeholder="Reason for additional charge"
            />
            <CustomButton
              title="Submit Additional Charge"
              onPress={handleUpdateCharge}
              disabled={awaitingAdditional}
            />
            {awaitingAdditional && (
              <Text style={styles.warn}>Awaiting homeowner payment…</Text>
            )}
            <Text style={styles.label}>Step3: Completion Photo</Text>
            <CustomButton
              title="Capture Completion Photo"
              onPress={() => pickAndUpload("completion")}
              disabled={awaitingAdditional}
            />
            <Text style={styles.label}>Step4: Finalize Job</Text>
            <CustomButton
              title="Mark Job Completed"
              onPress={handleFinalize}
              disabled={!job.arrivalImage || !job.completionImage}
            />
            <CustomButton
              title={cancelling ? "Cancelling…" : "Cancel Job"}
              onPress={handleCancelJob}
              color="red"
              disabled={cancelling}
            />
          </View>
        </ScrollView>

        {showNotCompleteModal && (
          <Modal visible transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.title}>Job Marked as Incomplete</Text>
                <Text style={{ marginVertical: 10 }}>
                  The customer marked this job as not complete. Please review
                  and address any issues before re-submitting completion.
                </Text>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => setShowNotCompleteModal(false)}
                >
                  <Text style={styles.confirmButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  containerLogo: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 40,
  },
  alert: {
    color: "red",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#f2f2f2",
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  notification: { color: "red", textAlign: "center" },
  section: { marginTop: 12 },
  label: { fontWeight: "600", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
  },
  warn: { color: "orange", marginTop: 6 },
  phone: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "800",
    color: "red",
    textAlign: "center",
  },
  customButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    marginVertical: 6,
  },
  customButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
});
