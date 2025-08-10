import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Vibration,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import JobDetails from "../components/JobDetails";
import api from "../api/client";
import serviceMatrix, { getCoveredDescription } from "../utils/serviceMatrix";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import BackButton from "../components/BackButton";
import ScreenWrapper from "../components/ScreenWrapper";

const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.55;

export default function ProviderInvitationScreen() {
  const { jobId, invitationExpiresAt, clickable } = useRoute().params;
  const navigation = useNavigation();

  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);

  useEffect(() => {
    if (!invitationExpiresAt) return;
    const expiry = Date.parse(invitationExpiresAt);
    const tick = () => {
      const secs = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
      setRemaining(secs);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [invitationExpiresAt]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!jobId) throw new Error("Missing jobId param");
        const { data } = await api.get(`/jobs/${jobId}`);
        if (alive) setJob(data);

        if (clickable || !clickable) {
          try {
            const { sound } = await Audio.Sound.createAsync(
              require("../assets/notification.mp3")
            );
            await sound.playAsync();
            Vibration.vibrate(1000);

            await Notifications.scheduleNotificationAsync({
              content: {
                title: "New Job Invitation",
                body: "Expires in 5 minutes",
                sound: "default",
              },
              trigger: null,
            });
          } catch (e) {
            console.warn("🔈 Failed to play sound or schedule notification", e);
          }
        }
      } catch (err) {
        console.error("❌ Error fetching job details:", err);
        Alert.alert("Error", "Failed to load job details.");
      } finally {
        if (alive) setJobLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [jobId]);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  const handleAccept = async () => {
    setLoading(true);
    try {
      await api.put(`/jobs/${jobId}/accept`);
      Alert.alert("Accepted", "You’ve claimed this job.", [
        {
          text: "OK",
          onPress: () => navigation.replace("ProviderJobStatus", { jobId }),
        },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.msg || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await api.put(`/jobs/${jobId}/deny`);
      Alert.alert("Declined", "You’ve passed on this invitation.", [
        {
          text: "OK",
          onPress: () => navigation.replace("ServiceProviderDashboard"),
        },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.msg || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCoveredDescriptionFromJob = (job) => {
    if (!job) return "No job data available.";
    const key = job.details?.issue || job.service || job.category;
    if (!key) return "Service key not available.";
    const matched = Object.entries(serviceMatrix.coveredDescriptions).find(
      ([k]) => k.toLowerCase().trim() === key.toLowerCase().trim()
    );
    return matched ? matched[1] : `No description found for service: "${key}"`;
  };

  const coveredText = getCoveredDescriptionFromJob(job);
  const isTeaser = !clickable;

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton />
        <View style={styles.containerLogo}>
          <Image
            source={require("../assets/blinqfix_logo-new.jpeg")}
            style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.header}>New Job Invitation</Text>

        {remaining != null && (
          <Text style={styles.timer}>
            {remaining > 0
              ? `Expires in ${fmt(remaining)}`
              : "Invitation expired"}
          </Text>
        )}

        {jobLoading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : job ? (
          <>
            <JobDetails job={job} isTeaser={isTeaser} />
            <View style={styles.coveredContainer}>
              <Text style={styles.coveredTitle}>What's Covered:</Text>
              <Text style={styles.coveredText}>{coveredText}</Text>
            </View>
          </>
        ) : (
          <Text style={{ textAlign: "center", color: "red", marginTop: 20 }}>
            Job not found or failed to load.
          </Text>
        )}

        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, !clickable && styles.buttonDisabled]}
              onPress={handleAccept}
              disabled={!clickable}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.declineButton,
                remaining === 0 && styles.buttonDisabled,
              ]}
              onPress={handleDecline}
              disabled={remaining === 0}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>

            {!clickable && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#fbc02d" }]}
                onPress={() => navigation.navigate("MyAccountScreen")}
              >
                <Text style={styles.buttonText}>Upgrade & Accept</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: "#fff", marginTop: 50 },
  containerLogo: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  timer: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
  },
  buttons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 20,
    paddingBottom: 100,
  },
  button: {
    backgroundColor: "#1976d2",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 16,
  },
  declineButton: {
    backgroundColor: "#d32f2f",
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  coveredContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  coveredTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center", 
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  coveredText: {
    fontSize: 14,
    color: "#444",
    marginTop: 4,
    textAlign: "center",
  },
});
