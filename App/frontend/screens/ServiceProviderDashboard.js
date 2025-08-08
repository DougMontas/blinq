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
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { io } from "socket.io-client";
import api from "../api/client";
import LogoutButton from "../components/LogoutButton";
import ProviderStatsCard from "../components/ProviderStatsCard";
import JobDetails from "../components/JobDetails";
import FooterPro from "../components/FooterPro";
// import DeleteAccountButton from "../components/DeleteAccountButton";
import MyAccountScreen from "./MyAccountScreen";
import ScreenWrapper from "../components/ScreenWrapper";

const SOCKET_HOST = "https://blinqfix.onrender.com";
const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.55;

export default function ServiceProviderDashboard() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [jobInvitations, setJobInvitations] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [jobDetails, setJobDetails] = useState({});
  const [location, setLocation] = useState(null);
  const invitesRef = useRef(jobInvitations);
  const socketRef = useRef(null);
  invitesRef.current = jobInvitations;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        const u = res.data?.user ?? res.data;
        if (!u?.role) return;
        setUser(u);

        const uid = u._id || u.id;
        const newSocket = io(SOCKET_HOST, {
          transports: ["websocket"],
          withCredentials: true,
        });

        newSocket.on("connect", () => {
          newSocket.emit("joinUserRoom", { userId: uid });
          console.log("✅ Connected to socket and joined room for:", uid);
        });

        newSocket.on("connect_error", (err) => {
          console.warn("❌ Socket connection error:", err);
        });

        socketRef.current = newSocket;
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };

    fetchUser();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchInvites = async () => {
      if (!user) return;
      const zip = encodeURIComponent(user.serviceZipcode || user.zipcode || "");
      try {
        const { data } = await api.get(
          `/jobs/pending?serviceType=${encodeURIComponent(
            user.serviceType
          )}&serviceZipcode=${zip}`
        );
        if (mounted) setJobInvitations(data || []);
      } catch (err) {
        if (mounted && err.response?.status === 404) {
          setJobInvitations([]);
        } else {
          console.error("Error fetching pending jobs:", err);
        }
      }
    };
    fetchInvites();
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    const fetchDetails = async () => {
      const result = {};
      await Promise.all(
        jobInvitations.map(async (job) => {
          try {
            const res = await api.get(`/jobs/${job._id}`);
            result[job._id] = res.data;
          } catch (err) {
            console.error("Error loading job detail:", err);
          }
        })
      );
      setJobDetails(result);
    };
    if (jobInvitations.length) fetchDetails();
  }, [jobInvitations]);

  useEffect(() => {
    if (!user || !socketRef.current) return;

    const socket = socketRef.current;

    const handleInvitation = (payload) => {
      const jobId = payload.jobId || payload._id;
      const clickable =
        typeof payload.clickable === "boolean"
          ? payload.clickable
          : payload.buttonsActive ?? true;
      navigation.navigate("ProviderInvitation", {
        jobId,
        invitationExpiresAt: payload.invitationExpiresAt ?? null,
        clickable,
      });
    };

    const handleExpired = ({ jobId }) =>
      setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));
    const handleCancel = ({ jobId }) =>
      setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));
    const handlePaid = ({ jobId }) => {
      setActiveJob({ _id: jobId });
      navigation.navigate("ProviderJobStatus", { jobId });
    };

    socket.on("jobInvitation", handleInvitation);
    socket.on("jobInvitation", (payload) => {
      if (!payload.clickable) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: "New Job Nearby",
            body: "You’ve received a teaser invite. Open the app to view details.",
            sound: "default",
          },
          trigger: null, // fires immediately
        });
      }

      // Continue to navigate or update state if needed
    });
    socket.on("invitationExpired", handleExpired);
    socket.on("jobCancelled", handleCancel);
    socket.on("jobPaid", handlePaid);

    return () => {
      socket.off("jobInvitation", handleInvitation);
      socket.off("invitationExpired", handleExpired);
      socket.off("jobCancelled", handleCancel);
      socket.off("jobPaid", handlePaid);
    };
  }, [user, navigation]);

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
        const { coords } = await Location.getCurrentPositionAsync({});
        setLocation(coords);
        if (socketRef.current) {
          socketRef.current.emit("providerLocationUpdate", {
            coords: { lat: coords.latitude, lng: coords.longitude },
          });
        }
      };
      sendLocation();
      const interval = setInterval(sendLocation, 60000); // every 60 seconds
      return () => clearInterval(interval);
    };
    requestAndTrack();
  }, []);

  const onInvitationAccepted = useCallback(
    (job) => {
      setActiveJob(job);
      setJobInvitations((prev) => prev.filter((j) => j._id !== job._id));
      navigation.navigate("ProviderJobStatus", { jobId: job._id });
    },
    [navigation]
  );

  const onInvitationDenied = useCallback((jobId) => {
    setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));
  }, []);

  const rawName = useMemo(() => {
    if (!user) return "";
    return (
      user.name || [user.firstName, user.lastName].filter(Boolean).join(" ")
    );
  }, [user]);

  const firstName = rawName.split(" ")[0] || "Provider";

  return (
    <View style={styles.wrapper}>
      <ScreenWrapper>
        <ScrollView contentContainerStyle={styles.container}>
          <LogoutButton />

          <View style={styles.containerLogo}>
            <Image
              source={require("../assets/blinqfix_logo-new.jpeg")}
              style={[
                { width: LOGO_SIZE, height: LOGO_SIZE, marginHorizontal: 120 },
              ]}
              resizeMode="contain"
            />
            <Text style={styles.sectionTitle1}>Dashboard</Text>
          </View>

          <Text>{"\n"}</Text>
          <Text style={styles.title}>
            {user ? `Welcome, ${firstName}` : "Loading..."}
          </Text>

          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate("ProviderProfile")}
          >
            <Text style={styles.profileBtnText}>
              Complete / Update Your Profile
            </Text>
          </TouchableOpacity>

          {location && (
            <MapView
              style={{ height: 200, marginVertical: 12, borderRadius: 10 }}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
              />
            </MapView>
          )}

          <ProviderStatsCard />

          <Text style={styles.subtitle}></Text>
          {jobInvitations.length === 0 ? (
            <Text></Text>
          ) : (
            jobInvitations.map((job) => (
              <View key={job._id} style={styles.inviteBox}>
                <Text>Job ID: {job._id}</Text>
                <Text>Service: {job.serviceType}</Text>
                <View style={styles.inviteBtnRow}>
                  <TouchableOpacity
                    style={[styles.inviteBtn, { backgroundColor: "#4caf50" }]}
                    onPress={() => onInvitationAccepted(job)}
                  >
                    <Text style={styles.inviteBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inviteBtn, { backgroundColor: "#f44336" }]}
                    onPress={() => onInvitationDenied(job._id)}
                  >
                    <Text style={styles.inviteBtnText}>Deny</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inviteBtn, { backgroundColor: "#1976d2" }]}
                    onPress={() =>
                      navigation.navigate("ProviderInvitation", {
                        jobId: job._id,
                        invitationExpiresAt: job.invitationExpiresAt,
                        clickable: job.buttonsActive ?? true,
                      })
                    }
                  >
                    <Text style={styles.inviteBtnText}>View Details</Text>
                  </TouchableOpacity>
                </View>
                <JobDetails
                  job={jobDetails[job._id]}
                  onAccept={() => onInvitationAccepted(job)}
                />
              </View>
            ))
          )}

          {activeJob && (
            <Text style={{ marginTop: 20 }}>
              Active job: {activeJob._id} (navigated to ProviderJobStatus)
            </Text>
          )}

          <FooterPro />
        </ScrollView>

        <TouchableOpacity
          style={{
            backgroundColor: "#1976d2",
            padding: 16,
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 999,
            
          }}
          onPress={() => navigation.navigate("MyAccountScreen")}
        >
          <Text
            style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
          >
            My Account
          </Text>
        </TouchableOpacity>
        
      </ScreenWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: "relative",
    backgroundColor: "#fff",
  },
  container: { padding: 36 },
  containerLogo: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  sectionTitle1: {
    color: "black",
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
  },
  subtitle: { marginTop: 20, fontSize: 18, fontWeight: "600" },
  profileBtn: {
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: "#1976d2",
    borderRadius: 6,
    alignItems: "center",
  },
  profileBtnText: { color: "#fff", fontWeight: "600" },
  inviteBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
  inviteBtnRow: { flexDirection: "row", marginTop: 8 },
  inviteBtn: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 6,
    alignItems: "center",
  },
  inviteBtnText: { color: "#fff", fontWeight: "600" },
});
