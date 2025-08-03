import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Linking,
  StyleSheet,
  Platform,
  TextInput,
  Modal,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import io from "socket.io-client";
import api from "../api/client";
import { getCoveredDescription } from "../utils/serviceMatrix";
import { saveSession, clearSession } from "../utils/sessionManager";
import StarRating from "../components/StarRating";
import { Buffer } from "buffer";
import ScreenWrapper from "../components/ScreenWrapper";

const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.55;

const convertToBase64Uri = (input) => {
  if (!input) return null;
  if (typeof input === "string") {
    if (input.startsWith("data:image")) return input;
    return `data:image/jpeg;base64,${input}`;
  }
  if (input?.type === "Buffer" && Array.isArray(input.data)) {
    return `data:image/jpeg;base64,${Buffer.from(input.data).toString(
      "base64"
    )}`;
  }
  return null;
};

export default function CustomerJobStatus() {
  const route = useRoute();
  const { jobId: routeJobId } = route?.params || {};
  const navigation = useNavigation();

  const [jobId, setJobId] = useState(routeJobId);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [providerInfo, setProviderInfo] = useState(null);
  const [providerCoords, setProviderCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [jobLocation, setJobLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [notCompletePressed, setNotCompletePressed] = useState(false);
  const [showNotCompleteModal, setShowNotCompleteModal] = useState(false);
  const hasSeenNotCompleteRef = useRef(false);
  const [disputeMessage, setDisputeMessage] = useState("");
  const [notifiedComplete, setNotifiedComplete] = useState(false);
  const mapRef = useRef(null);
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    if (!routeJobId) {
      Alert.alert(
        "Navigation Error",
        "Missing job ID. Returning to dashboard.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("CustomerDashboard"),
          },
        ]
      );
    }
  }, [routeJobId]);

  const handleNotComplete = async () => {
    try {
      console.log("[NotComplete] marking status accepted");
      await api.put(`/jobs/${jobId}/status`, {
        status: "accepted",
        providerCompleted: false,
      });
      console.log("[NotComplete] notifying service pro");
      await api.post(`/jobs/${jobId}/notify-not-complete`);
      Alert.alert(
        "Noted",
        "The service pro has been notified. Please await their update."
      );
      setJob((prev) => ({ ...prev, providerCompleted: false }));
    } catch (err) {
      console.error("[NotComplete Error]:", err);
      Alert.alert("Error", "Failed to update status");
    }
  };

  useEffect(() => {
    if (job && job.status !== "completed") {
      saveSession({ role: "customer", jobId: job._id });
    }
  }, [job]);

  useEffect(() => {
    if (!jobId) return;
    const socket = io(api.defaults.baseURL?.replace("/api", ""), {
      transports: ["websocket"],
    });
    socket.emit("join", jobId);
    socket.on("jobUpdated", (updatedJob) => {
      if (updatedJob._id === jobId) setJob(updatedJob);
    });
    return () => socket.disconnect();
  }, [jobId]);

  useEffect(() => {
    let alive = true;
    const fetchJob = async () => {
      try {
        console.log("📦 Fetching job", jobId);
        const { data } = await api.get(`/jobs/${jobId}`);
        if (!alive) return;
        console.log("✅ Job data loaded", data.status);
        setJob(data);

        if (
          data.customerMarkedIncomplete &&
          !hasSeenNotCompleteRef.current &&
          data.status !== "completed"
        ) {
          setShowNotCompleteModal(true);
          hasSeenNotCompleteRef.current = true;
        }

        if (!jobId) setJobId(data._id);

        if (
          data.customerCompleted &&
          data.providerCompleted &&
          !notifiedComplete
        ) {
          setNotifiedComplete(true);
          await clearSession();
          navigation.replace("RateProvider", { jobId: data._id });
          await clearSession();
          return;
        }

        if (data.status === "awaiting-additional-payment") {
          navigation.replace("PaymentScreen", { jobId });
          return;
        }

        if (data.acceptedProvider) {
          const res = await api.get(`/users/${data.acceptedProvider}`);
          const provider = res.data;
          setProviderInfo({
            name: provider.name,
            businessName: provider.businessName,
            aboutMe: provider.aboutMe,
            profilePictureUrl: provider.profilePicture || null,
            averageRating: provider.averageRating ?? null,
          });
        }

        const jobLoc = data.location?.coordinates;
        if (jobLoc) {
          const [lng, lat] = jobLoc;
          setJobLocation({ latitude: lat, longitude: lng });
        }
      } catch (err) {
        if (alive) {
          console.error("[FetchJob Error]:", err);
          Alert.alert("Error", "Unable to load job status.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
      const iv = setInterval(fetchJob, 25000);
      return () => {
        alive = false;
        clearInterval(iv);
      };
    }
  }, [jobId, navigation, notifiedComplete]);

  const handleCustomerComplete = async () => {
    setConfirming(true);
    try {
      const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
      console.log("[CustomerComplete] response:", data?._id);
      setJob(data);
    } catch (err) {
      console.error("[CustomerComplete Error]:", err);
      Alert.alert("Error", "Could not confirm completion");
    } finally {
      setConfirming(false);
    }
  };

  const renderConfirmationButtons = () => (
    <View style={styles.confirm}>
      <Text style={styles.heading}>Confirm Job Complete</Text>
      <Text style={styles.confirmText}>
        The provider marked this job complete. Please confirm below:
      </Text>
      {job.arrivalImage && (
        <Image
          source={{ uri: convertToBase64Uri(job.arrivalImage) }}
          style={styles.image}
        />
      )}
      {job.completionImage && (
        <Image
          source={{ uri: convertToBase64Uri(job.completionImage) }}
          style={styles.image}
        />
      )}
      <TouchableOpacity
        style={[
          styles.confirmButton,
          confirming && styles.confirmButtonDisabled,
        ]}
        onPress={handleCustomerComplete}
        disabled={confirming}
      >
        <Text style={styles.confirmButtonText}>
          {confirming ? "Confirming…" : "Confirm Job Complete"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.confirmButton, { backgroundColor: "red" }]}
        onPress={() => {
          if (!notCompletePressed) {
            setNotCompletePressed(true);
            handleNotComplete();
          }
        }}
      >
        <Text style={styles.confirmButtonText}>Not Complete</Text>
      </TouchableOpacity>
    </View>
  );

  const handleCancelJob = async () => {
    try {
      const confirmed = await new Promise((resolve) =>
        Alert.alert(
          "Cancel Job",
          "Are you sure you want to cancel this job?",
          [
            { text: "No", onPress: () => resolve(false), style: "cancel" },
            { text: "Yes, Cancel", onPress: () => resolve(true) },
          ],
          { cancelable: true }
        )
        
      );
      await clearSession();
      if (!confirmed) return;

      const acceptedAt = job.acceptedAt ? new Date(job.acceptedAt) : null;
      const now = new Date();
      let refundEligible = true;

      if (acceptedAt && !isNaN(acceptedAt.getTime())) {
        const diffMinutes = Math.floor((now - acceptedAt) / 60000);
        refundEligible = diffMinutes < 5;
      }

      const { data } = await api.put(`/jobs/${jobId}/cancelled`, {
        cancelledBy: "customer",
        refundEligible,
      });

      Alert.alert(
        "Job Cancelled",
        refundEligible
          ? "Your job was cancelled within 5 minutes. You are eligible for a full refund."
          : "Your job was cancelled after 5 minutes. A $120 travel fee will be deducted."
      );

      setTimeout(() => {
        navigation.navigate("CustomerDashboard");
      }, 10000);
    } catch (err) {
      console.error("[CancelJob Error]:", err);
      Alert.alert("Error", "Unable to cancel the job. Try again.");
    }
  };

  const renderCancelButton = () => (
    <TouchableOpacity
      style={[styles.confirmButton, { backgroundColor: "#d32f2f" }]}
      onPress={handleCancelJob}
    >
      <Text style={styles.confirmButtonText}>Cancel Job</Text>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;
  if (!job) return <Text style={styles.center}>Job not found.</Text>;

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.containerLogo}>
          <Image
            source={require("../assets/blinqfix_logo-new.jpeg")}
            style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
            resizeMode="contain"
          />
        </View>

        {job.providerCompleted &&
          !job.customerCompleted &&
          renderConfirmationButtons()}

        {job?.status === "accepted" && showNotification && (
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
              Emergency Service Pro Located
            </Text>
            <Text style={[styles.notification, { color: "#004d40" }]}>
              Your service Blinqfix professional is in route. Make the necessary
              preparations. This screen will update once the job is completed.
            </Text>
          </View>
        )}

        <Text style={styles.title}>Job Status</Text>
        <Text style={{ marginBottom: 16, color: "white" }}>
          Status: {job.status}
        </Text>

        {(job.status === "pending" || job.status === "invited") && (
          <View style={styles.confirm}>
            <Text style={styles.heading}>Please Wait…</Text>
            <Text style={styles.confirmText}>
              We are locating an emergency Blinqfix Pro for your job. Leave this
              page open, this will not take long.
            </Text>
          </View>
        )}

        {providerInfo && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Your Service Pro</Text>
            {providerInfo.profilePictureUrl && (
              <Image
                source={{
                  uri: convertToBase64Uri(providerInfo.profilePictureUrl),
                }}
                style={{ width: 160, height: 160, borderRadius: 100 }}
              />
            )}
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              {providerInfo.name}
            </Text>
            <Text>{providerInfo.businessName}</Text>
            <Text>{providerInfo.aboutMe}</Text>
            <View style={{ alignItems: "center", marginVertical: 8 }}>
              <StarRating rating={providerInfo.averageRating} size={22} />
            </View>
          </View>
        )}

        {jobLocation?.latitude && jobLocation?.longitude && (
          <View
            style={{
              height: 220,
              borderRadius: 10,
              marginVertical: 12,
              overflow: "hidden",
            }}
          >
            <MapView
              key={`map-${jobId}-${jobLocation.latitude}-${jobLocation.longitude}`}
              ref={mapRef}
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              style={{ flex: 1 }}
              initialRegion={{
                latitude: jobLocation.latitude,
                longitude: jobLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={jobLocation} title="Customer" />
              {providerCoords && (
                <Marker
                  coordinate={providerCoords}
                  title="Service Pro"
                  pinColor="blue"
                  description="Provider's current location"
                />
              )}
              {routeCoords.length === 2 && (
                <Polyline
                  coordinates={routeCoords}
                  strokeColor="#1976d2"
                  strokeWidth={4}
                  lineCap="round"
                />
              )}
            </MapView>
          </View>
        )}

        {job?.status === "accepted" && renderCancelButton()}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  confirm: {
    padding: 12,
    backgroundColor: "#e8f5e9",
    borderRadius: 6,
    marginTop: 16,
  },
  notification: {
    textAlign: "center",
  },
  confirmText: { marginBottom: 10, fontSize: 15 },
  confirmButton: {
    backgroundColor: "#1976d2",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginVertical: 5,
  },
  confirmButtonDisabled: { backgroundColor: "#999" },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  image: { height: 160, width: "100%", marginBottom: 12, borderRadius: 8 },
  containerLogo: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 4,
    textAlign: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 0,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    minHeight: 100,
    textAlignVertical: "top",
  },
});
