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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import io from "socket.io-client";
import api from "../api/client";
import LogoutButton from "../components/LogoutButton";
import ProviderStatsCard from "../components/ProviderStatsCard";
import JobDetails from "../components/JobDetails";
import { Platform } from "react-native"
import FooterPro from "../components/FooterPro";


const SOCKET_HOST =
  Platform.OS === "android" ? "http://10.0.2.2:8888" : "http://localhost:8888";
const socket = io(SOCKET_HOST, {
  transports: ["websocket"],
  withCredentials: true,
});

const { width } = Dimensions.get("window");
const LOGO_SIZE = width * 0.25;

export default function ServiceProviderDashboard() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [jobInvitations, setJobInvitations] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [jobDetails, setJobDetails] = useState({});
  const invitesRef = useRef(jobInvitations);
  invitesRef.current = jobInvitations;

  // Fetch user
  useEffect(() => {
    api.get("/users/me")
      .then((res) => {
        const u = res.data?.user ?? res.data;
        if (!u?.role) return;
        setUser(u);
        const uid = u._id || u.id;
        if (socket.connected) {
          socket.emit("joinUserRoom", { userId: uid });
        } else {
          socket.once("connect", () => {
            socket.emit("joinUserRoom", { userId: uid });
          });
        }
      })
      .catch(console.error);
  }, []);

  // Fetch pending job invites
  useEffect(() => {
    let mounted = true;
    const fetchInvites = async () => {
      if (!user) return;
      const zip = encodeURIComponent(user.serviceZipcode || user.zipcode || "");
      try {
        const { data } = await api.get(
          `/jobs/pending?serviceType=${encodeURIComponent(user.serviceType)}&serviceZipcode=${zip}`
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
    return () => { mounted = false };
  }, [user]);

  // Fetch full job details
  useEffect(() => {
    const fetchDetails = async () => {
      const result = {};
      await Promise.all(jobInvitations.map(async (job) => {
        try {
          const res = await api.get(`/jobs/${job._id}`);
          result[job._id] = res.data;
        } catch (err) {
          console.error("Error loading job detail:", err);
        }
      }));
      setJobDetails(result);
    };
    if (jobInvitations.length) fetchDetails();
  }, [jobInvitations]);

  // Socket listeners
  useEffect(() => {
    if (!user) return;

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

  const onInvitationAccepted = useCallback((job) => {
    setActiveJob(job);
    setJobInvitations((prev) => prev.filter((j) => j._id !== job._id));
    navigation.navigate("ProviderJobStatus", { jobId: job._id });
  }, [navigation]);

  const onInvitationDenied = useCallback((jobId) => {
    setJobInvitations((prev) => prev.filter((j) => j._id !== jobId));
  }, []);

  const rawName = useMemo(() => {
    if (!user) return "";
    return user.name || [user.firstName, user.lastName].filter(Boolean).join(" ");
  }, [user]);
  const firstName = rawName.split(" ")[0] || "Provider";

  return (
    <ScrollView style={styles.container}>
      <LogoutButton />
      
      <View style={styles.containerLogo}>
            <Image
              source={require("../assets/blinqfix_logo-new.jpeg")}
              style={[
                { width: LOGO_SIZE, height: LOGO_SIZE, marginHorizontal: 120},
              ]}
              resizeMode="contain"
            />
          </View>
          
          <Text>{"\n"}</Text>
      <Text style={styles.title}>{user ? `Welcome, ${firstName}` : "Loading..."}</Text>
      <TouchableOpacity
        style={styles.profileBtn}
        onPress={() => navigation.navigate("ProviderProfile")}
      >
        <Text style={styles.profileBtnText}>Complete Your Profile</Text>
      </TouchableOpacity>
      <ProviderStatsCard />

      <Text style={styles.subtitle}>Job Invitations:</Text>
      {jobInvitations.length === 0 ? (
        <Text>No job invitations yet.</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", padding: 36 },
  containerLogo: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
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

