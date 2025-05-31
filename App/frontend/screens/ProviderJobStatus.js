import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { useRoute, useNavigation } from "@react-navigation/native";
import JobDetails from "../components/JobDetails";
import api from "../api/client";
import { saveSession } from "../utils/sessionManager";

const TRAVEL_FEE = 100;
const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.55;

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
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const phoneTimer = useRef(null);
  const confirmTimeout = useRef(null);
  
  useEffect(() => {
    if (job && job.status !== "completed") {
      saveSession({ role: "serviceProvider", jobId: job._id });
    }
  }, [job]);

  useEffect(() => {
    let alive = true;
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
        if (!alive) return;
        setJob(data);

        if (data.status === "completed" && !notifiedComplete) {
          setNotifiedComplete(true);
          Alert.alert("Job Complete", "This job is now fully completed.", [
            {
              text: "OK",
              onPress: () => navigation.navigate("ServiceProviderDashboard"),
            },
          ]);
        }

        if (data.acceptedProvider && !phoneTimer.current) {
          phoneTimer.current = setTimeout(
            () => setShowPhone(true),
            6 * 60 * 1000
          ); // 6 minutes after acceptance - phone # renders
        }
      } catch {
        alive && Alert.alert("Error", "Unable to load job");
      } finally {
        alive && setLoading(false);
      }
    };
    fetchJob();
    const interval = setInterval(fetchJob, 25000);
    return () => {
      alive = false;
      clearInterval(interval);
      if (phoneTimer.current) clearTimeout(phoneTimer.current);
    };
  }, [jobId, notifiedComplete, navigation]);

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
    if (!confirmingCancel) {
      setConfirmingCancel(true);
      Alert.alert(
        "Confirm Cancellation",
        "Tap again to confirm job cancellation."
      );
      confirmTimeout.current = setTimeout(
        () => setConfirmingCancel(false),
        5000
      );
      return;
    }

    setCancelling(true);
    try {
      await api.put(`/jobs/${jobId}/cancel`, { travelFee: TRAVEL_FEE });
      Alert.alert(
        "Cancelled",
        `Job cancelled; a $${TRAVEL_FEE} travel fee applies.`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("ServiceProviderDashboard"),
          },
        ]
      );
    } catch (err) {
      console.error("Cancel-job error:", err);
      Alert.alert("Error", "Cancellation failed.");
    } finally {
      setCancelling(false);
      setConfirmingCancel(false);
      if (confirmTimeout.current) clearTimeout(confirmTimeout.current);
    }
  };

  const pickAndUpload = async (phase) => {
    let result;
    const isWeb = Platform.OS === "web";
    const status = isWeb
      ? (await ImagePicker.requestMediaLibraryPermissionsAsync()).status
      : (await ImagePicker.requestCameraPermissionsAsync()).status;
    if (status !== "granted")
      return Alert.alert(
        "Permission needed",
        isWeb ? "Library" : "Camera" + " access is required."
      );

    result = isWeb
      ? await ImagePicker.launchImageLibraryAsync({ quality: 0.7 })
      : await ImagePicker.launchCameraAsync({ quality: 0.7 });

    if (result.cancelled || result.canceled) return;

    const uri = result.uri ?? result.assets?.[0]?.uri;
    if (!uri) return Alert.alert("Error", "Could not read image.");

    const normalized = Platform.OS === "ios" ? uri.replace("file://", "") : uri;
    const name = normalized.split("/").pop();
    const match = /\.(\w+)$/.exec(name);
    const type = match ? `image/${match[1]}` : "image";

    const form = new FormData();
    form.append("image", { uri: normalized, name, type });

    try {
      const { data: updated } = await api.post(
        `/jobs/${jobId}/upload/${phase}`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setJob(updated);
      Alert.alert("Uploaded", `Successfully uploaded ${phase} image.`);
    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        err.message ||
        "Upload failed.";
      console.error("Upload failed:", msg);
      Alert.alert("Upload failed", msg);
    }
  };

  const handleFinalize = async () => {
    try {
      const { data } = await api.put(`/jobs/${jobId}/complete/provider`);
      setJob(data);
      Alert.alert("Done", "You’ve marked the job complete.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("ServiceProviderDashboard"),
        },
      ]);
    } catch (err) {
      console.error("Finalize error:", err);
      Alert.alert("Error", "Could not finalize job.");
    }
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;
  if (!job) return <Text style={styles.center}>No job found.</Text>;

  const awaitingAdditional = job.status === "awaiting-additional-payment";
  const { additionalCharge: ac, estimatedTotal } = job;

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
      <View style={styles.containerLogo}>
        <Image
          source={require("../assets/blinqfix_logo-new.jpeg")}
          style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
          resizeMode="contain"
        />
      </View>

      {job.paymentStatus !== "paid" && (
        <View style={styles.pending}>
          <Text style={styles.alert}>** Status will update live **</Text>
        </View>
      )}

      <JobDetails jobId={jobId} job={job} />

      {showPhone && job?.customer?.phoneNumber && (
        <Text
          style={{
            marginTop: 20,
            fontSize: 16,
            fontWeight: "800",
            color: "red",
            textAlign: "center",
          }}
        >
          Customer Phone: {job.customer.phoneNumber}
        </Text>
      )}

      <View style={styles.card}>
        <Text style={styles.title}>Provider Actions</Text>

        <View style={{ marginBottom: 12, textAlign: "center" }}>
          <Text style={{ marginBottom: 2, textAlign: "center" }}>
            Additional Charge: ${ac.toFixed(2)}
          </Text>
          <Text
            style={{ fontWeight: "700", marginTop: 4, textAlign: "center" }}
          >
            Estimate Total: ${estimatedTotal.toFixed(2)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Step1: Get a picture of the job before work starts:
          </Text>
          <Button
            title="Capture Arrival Photo"
            onPress={() => pickAndUpload("arrival")}
            disabled={awaitingAdditional}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Step2: (Optional) Additional Charge:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={additionalCharge}
            onChangeText={setAdditionalCharge}
            placeholder="e.g. 50.00"
          />
          <Text style={styles.label}>Additional charge details:</Text>
          <TextInput
            style={styles.input}
            value={additionalChargeReason}
            onChangeText={setAdditionalChargeReason}
            placeholder="Reason for additional charge"
          />
          <Button
            title="Submit Additional Charge"
            onPress={handleUpdateCharge}
            disabled={awaitingAdditional}
          />
          {awaitingAdditional && (
            <Text style={styles.warn}>Awaiting homeowner payment…</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Step3: Get a picture of job when completed:
          </Text>
          <Button
            title="Capture Completion Photo"
            onPress={() => pickAndUpload("completion")}
            disabled={awaitingAdditional}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Step4: *Arrival & Completion Images are required for completion:
          </Text>
          <Button
            title="Mark Job Completed"
            onPress={handleFinalize}
            disabled={!job.arrivalImage || !job.completionImage}
          />
        </View>
        <View style={styles.section}>
          <Button
            style={styles.button}
            title={cancelling ? "Cancelling…" : "Cancel Job"}
            color="red"
            onPress={handleCancelJob}
            disabled={cancelling}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#fff" },
  button: {
    backgroundColor: "#1976d2",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },

  containerLogo: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 50,
    
  },
  alert: {
    color: "red",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "bold",
    marginTop: 50,
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
  section: { marginTop: 12 },
  label: { fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
  },
  warn: { color: "orange", marginTop: 6 },
  uploadedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  preview: { width: 80, height: 80, borderRadius: 4 },
  uploadedText: { marginLeft: 8, color: "green", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
