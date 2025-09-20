// latest working
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { io } from "socket.io-client";
import { LinearGradient } from "expo-linear-gradient";
import {
  User,
  LogOut,
  Bell,
  MapPin,
  ClipboardEdit,
  ArrowRight,
  Briefcase,
  BellOff,
  X,
  Eye,
  DollarSign,
  RefreshCw,
} from "lucide-react-native";
import api from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProviderStatsCard from "../components/ProviderStatsCard";
import * as Notifications from "expo-notifications";
import FooterPro from "../components/FooterPro";
import { loadSession } from "../utils/sessionManager";

const SOCKET_HOST = "https://blinqfix.onrender.com";

// Foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// --- helpers ----------------------------------------------------
function computeCohort(u) {
  const vals = [
    u?.inviteCohort,
    u?.billingPlan,
    u?.pricingModel,
    u?.planType,
    u?.subscriptionTier,
    u?.subscription,
    u?.plan,
  ]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase());

  if (vals.some((s) => s.includes("hybrid") || s.includes("pro") || s.includes("premium"))) {
    return "hybrid";
  }
  if (vals.some((s) => s.includes("profit"))) {
    return "profit_sharing";
  }
  // default safest: teaser
  return "profit_sharing";
}

/**
 * Old-behavior-compatible resolver:
 * - Prefer server's boolean (payload.clickable or payload.buttonsActive)
 * - Fallback to cohort: hybrid => true (real), profit_sharing => false (teaser)
 */
function resolveClickable(src, cohort) {
  if (src && typeof src.clickable === "boolean") return src.clickable;
  if (src && typeof src.buttonsActive === "boolean") return src.buttonsActive;
  return cohort === "hybrid";
}

export default function ServiceProviderDashboard() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [user, setUser] = useState(null);
  const [jobInvitations, setJobInvitations] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resuming, setResuming] = useState(false);

  const socketRef = useRef(null);

  const inviteCohort = useMemo(() => computeCohort(user || {}), [user]);

  const ensureNotificationSetup = useCallback(async () => {
    try {
      const current = await Notifications.getPermissionsAsync();
      let granted =
        current.granted ||
        current.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
        current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

      if (!granted) {
        const req = await Notifications.requestPermissionsAsync();
        granted =
          req.granted ||
          req.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
          req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("job-invites", {
          name: "Job Invitations",
          importance: Notifications.AndroidImportance.MAX,
          sound: "default",
          vibrationPattern: [0, 250, 250, 250],
          enableVibrate: true,
          bypassDnd: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      }
    } catch (e) {
      console.warn("Notification setup failed:", e);
    }
  }, []);

  const presentInviteNotification = useCallback(
    async (payload, cohort) => {
      const jobId = payload?.jobId || payload?._id || "";
      const clickable = resolveClickable(payload || {}, cohort);

      const title = clickable ? "New Job Invitation" : "New Job Nearby";
      const body = clickable
        ? "A new customer needs you. Tap to open the invite."
        : "You’ve received a job invite. Open the app to view details.";

      try {
        await Notifications.scheduleNotificationAsync({
          content: { title, body, sound: "default", data: { jobId, clickable } },
          trigger: null,
        });
      } catch {
        /* no-op */
      }
    },
    []
  );

  // ✅ logout helper (used when 401s happen)
  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(["token", "refreshToken"]);
    } finally {
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  }, [navigation]);

  // 🔹 fetch (user, active job, invites)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: userData } = await api.get("/users/me");
      const u = userData?.user ?? userData;
      if (!u?.role) {
        setLoading(false);
        return;
      }
      setUser(u);

      // active job (treat 404 as none)
      try {
        const { data: active } = await api.get("/jobs/provider/active");
        setActiveJob(active);
      } catch (e) {
        if (e?.response?.status === 404) setActiveJob(null);
        else throw e;
      }

      // invites (treat 404 as none)
      const zipRaw =
        u?.serviceZipcode ??
        (Array.isArray(u?.zipcode) ? u.zipcode[0] : u?.zipcode) ??
        "";
      const svcRaw = (u?.serviceType || "").trim();

      const zip = encodeURIComponent(zipRaw);
      const svc = encodeURIComponent(svcRaw);

      let invites = [];
      try {
        const { data } = await api.get(
          `/jobs/pending?serviceType=${svc}&serviceZipcode=${zip}`
        );
        invites = data || [];
      } catch (e) {
        if (e?.response?.status !== 404) throw e;
        invites = [];
      }
      setJobInvitations(invites);
    } catch (err) {
      console.error("Failed to fetch initial data", err);
      if (err?.response?.status === 401) {
        await handleLogout();
      } else {
        setJobInvitations([]);
        setActiveJob(null);
      }
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    ensureNotificationSetup();
  }, [ensureNotificationSetup]);

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused, fetchData]);

  // sockets
  useEffect(() => {
    let socket;
    if (user?.id || user?._id) {
      socket = io(SOCKET_HOST, {
        transports: ["websocket"],
        withCredentials: true,
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        const uid = user._id || user.id;
        socket.emit("joinUserRoom", { userId: uid });
        console.log("✅ Connected to socket and joined room for:", uid);
      });

      socket.on("connect_error", (err) =>
        console.warn("❌ Socket error:", err)
      );

      const handleInvitation = async (payload) => {
        // Respect server booleans first (old behavior), then cohort
        const clickable = resolveClickable(payload || {}, inviteCohort);
        await presentInviteNotification(payload, inviteCohort);

        const jobId = payload.jobId || payload._id;
        navigation.navigate("ProviderInvitation", {
          jobId,
          invitationExpiresAt: payload.invitationExpiresAt ?? null,
          clickable,
          inviteKind: clickable ? "full" : "teaser",
        });
      };

      const handleExpired = ({ jobId }) =>
        setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));

      const handleCancel = ({ jobId }) =>
        setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));

      const handlePaid = ({ jobId }) => {
        setActiveJob({ _id: jobId });
        navigation.navigate("ProviderJobStatus", { jobId });
        Notifications.scheduleNotificationAsync({
          content: {
            title: "Job Paid",
            body: "The customer has paid.",
            sound: "default",
          },
          trigger: null,
        }).catch(() => {});
      };

      socket.on("jobInvitation", handleInvitation);
      socket.on("jobExpired", handleExpired);
      socket.on("jobCancelled", handleCancel);
      socket.on("jobAcceptedElsewhere", handleExpired);
      socket.on("jobPaid", handlePaid);
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, navigation, presentInviteNotification, inviteCohort]);

  // location -> emit to socket
  useEffect(() => {
    const requestAndTrack = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Required",
          "Location permission is required to receive jobs."
        );
        return;
      }
      const sendLocation = async () => {
        try {
          const { coords } = await Location.getCurrentPositionAsync({});
          setLocation(coords);
          if (socketRef.current?.connected) {
            socketRef.current.emit("providerLocationUpdate", {
              coords: { lat: coords.latitude, lng: coords.longitude },
            });
          }
        } catch {
          /* no-op */
        }
      };
      sendLocation();
      const interval = setInterval(sendLocation, 60000);
      return () => clearInterval(interval);
    };
    if (user) requestAndTrack();
  }, [user]);

  const handleDeclineJob = async (jobId) => {
    try {
      await api.put(`/jobs/${jobId}/deny`);
      setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));
      Alert.alert("Declined", "You’ve passed on this invitation.");
    } catch (err) {
      console.error("Failed to decline job", err);
      Alert.alert(
        "Error",
        err.response?.data?.msg || "Could not decline the job."
      );
    }
  };

  // 🔁 Resume Active Job helper (session + backend)
  const resumeActiveJob = useCallback(async () => {
    if (resuming) return;
    setResuming(true);
    try {
      // 1) Try local session
      const session = await loadSession();
      if (session?.role === "serviceProvider" && session?.jobId) {
        navigation.navigate("ProviderJobStatus", { jobId: session.jobId });
        return;
      }
      // 2) Ask backend
      try {
        const { data } = await api.get("/jobs/provider/active");
        if (data?._id) {
          navigation.navigate("ProviderJobStatus", { jobId: data._id });
          return;
        }
      } catch (e) {
        if (e?.response?.status !== 404) throw e;
      }
      Alert.alert("No Active Job", "We couldn’t find an active job to resume.");
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.msg || "Could not look up active job."
      );
    } finally {
      setResuming(false);
    }
  }, [navigation, resuming]);

  const firstName = useMemo(() => {
    if (!user) return "";
    const rawName =
      user.name || [user.firstName, user.lastName].filter(Boolean).join(" ");
    return rawName.split(" ")[0] || "Provider";
  }, [user]);

  if (loading) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#312e81"]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#312e81"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{firstName}</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                onPress={() => navigation.navigate("MyAccountScreen")}
                style={styles.iconButton}
              >
                <User color="#fff" size={24} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
                <LogOut color="#f87171" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Resume Active Job */}
          {/* <TouchableOpacity
            onPress={resumeActiveJob}
            activeOpacity={0.9}
            style={styles.resumeButton}
          >
            <LinearGradient
              colors={["#60a5fa", "#2563eb"]}
              style={styles.resumeButtonInner}
            >
              <RefreshCw color="#fff" size={18} />
              <Text style={styles.resumeButtonText}>
                {resuming ? "Checking…" : "Resume Active Job"}
              </Text>
            </LinearGradient>
          </TouchableOpacity> */}

          {/* Active Job Card */}
          {/* {activeJob && activeJob._id && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ProviderJobStatus", {
                  jobId: activeJob._id,
                })
              }
            >
              <LinearGradient
                colors={["rgba(34, 197, 94, 0.2)", "rgba(16, 185, 129, 0.2)"]}
                style={styles.activeJobCard}
              >
                <View style={styles.activeJobLeft}>
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                  </View>
                  <View>
                    <Text style={styles.activeJobTitle}>
                      You have an active job
                    </Text>
                    <Text style={styles.activeJobSubtitle}>
                      Tap to view status & workflow
                    </Text>
                  </View>
                </View>
                <ArrowRight color="#22c55e" size={24} />
              </LinearGradient>
            </TouchableOpacity>
          )} */}

          {/* Profile CTA */}
          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => navigation.navigate("ProviderProfile")}
          >
            <ClipboardEdit color="#60a5fa" size={32} />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileTitle}>Complete / Edit Your Profile</Text>
              <Text style={styles.profileSubtitle}>
                A complete profile helps you get more jobs.
              </Text>
            </View>
            <ArrowRight color="#60a5fa" size={24} />
          </TouchableOpacity>

          {/* Stats Card */}
          <ProviderStatsCard />

          {/* Map */}
          {location && (
            <View style={styles.mapCard}>
              <View style={styles.cardHeader}>
                <MapPin color="#c084fc" size={20} />
                <Text style={styles.cardTitle}>Your Live Location</Text>
              </View>

              <MapView
                style={styles.mapSolid}
                provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onMapReady={() => console.log("🗺️[MAP] ready")}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                />
              </MapView>
            </View>
          )}

          <FooterPro />

          {/* //Job Invitations */}
          {/* <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Bell color="#fb923c" size={20} />
              <Text style={styles.cardTitle}>New Job Invitations</Text>
            </View>
            {jobInvitations.length === 0 ? (
              <View style={styles.noJobsCard}>
                <BellOff color="#94a3b8" size={32} />
                <Text style={styles.noJobsText}>No new jobs right now.</Text>
                <Text style={styles.noJobsSubtext}>
                  We'll notify you when a job is available.
                </Text>
              </View>
            ) : (
              jobInvitations.map((job) => {
                // Respect server-provided flags on each list item, fallback to cohort
                const clickable = resolveClickable(job || {}, inviteCohort);

                return (
                  <View key={job._id} style={styles.jobCard}>
                    <View style={styles.jobCardHeader}>
                      <View style={styles.jobTypeBadge}>
                        <Briefcase color="#fff" size={14} />
                        <Text style={styles.jobTypeText}>{job.serviceType}</Text>
                      </View>
                      <View style={styles.jobEarningsBadge}>
                        <DollarSign color="#22c55e" size={14} />
                        <Text style={styles.jobEarningsText}>
                          ~${(job.estimatedTotal || 150).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.jobLocation}>
                      <MapPin size={14} color="#94a3b8" /> {job.address},{" "}
                      {job.serviceCity}
                    </Text>

                    <View style={styles.jobCardButtons}>
                      <TouchableOpacity
                        style={styles.jobDeclineButton}
                        onPress={() => handleDeclineJob(job._id)}
                      >
                        <X color="#f87171" size={18} />
                        <Text style={styles.jobDeclineButtonText}>Decline</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.jobDetailsButton}
                        onPress={() =>
                          navigation.navigate("ProviderInvitation", {
                            jobId: job._id,
                            invitationExpiresAt: job.invitationExpiresAt,
                            clickable,                          // ← server first, then cohort
                            inviteKind: clickable ? "full" : "teaser",
                          })
                        }
                      >
                        <Eye color="#fff" size={18} />
                        <Text style={styles.jobDetailsButtonText}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View> */}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
    marginBottom: 20,
  },
  welcomeText: { fontSize: 18, color: "#e0e7ff" },
  userName: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  headerIcons: { flexDirection: "row", gap: 16 },
  iconButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 99,
  },

  // Resume Active Job
  resumeButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  resumeButtonInner: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  resumeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  activeJobCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.5)",
    marginBottom: 20,
  },
  activeJobLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  liveIndicator: { width: 12, height: 12, justifyContent: "center", alignItems: "center" },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e" },
  activeJobTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  activeJobSubtitle: { color: "#e0e7ff", fontSize: 14 },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(96, 165, 250, 0.1)",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.3)",
    marginBottom: 20,
    gap: 16,
  },
  profileTextContainer: { flex: 1 },
  profileTitle: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  profileSubtitle: { fontSize: 14, color: "#e0e7ff", marginTop: 4 },

  mapCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  mapSolid: {
    height: 260,
    borderRadius: 12,
  },

  section: { marginTop: 40, marginBottom: 40},
  noJobsCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  noJobsText: { fontSize: 18, fontWeight: "600", color: "#fff" },
  noJobsSubtext: { fontSize: 14, color: "#94a3b8", textAlign: "center" },

  jobCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  jobCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  jobTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  jobTypeText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  jobEarningsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  jobEarningsText: { color: "#22c55e", fontWeight: "bold", fontSize: 12 },
  jobLocation: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 16,
  },
  jobCardButtons: { flexDirection: "row", gap: 12 },
  jobDeclineButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    gap: 8,
  },
  jobDeclineButtonText: { color: "#f87171", fontWeight: "bold" },
  jobDetailsButton: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#60a5fa",
    borderRadius: 12,
    gap: 8,
  },
  jobDetailsButtonText: { color: "#fff", fontWeight: "bold" },
});
