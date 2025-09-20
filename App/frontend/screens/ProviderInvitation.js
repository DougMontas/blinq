import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Vibration,
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Clock,
  Check,
  X,
  ArrowLeft,
  DollarSign,
  MapPin,
  Wrench,
  ClipboardList,
  Bell,
  AlertTriangle,
  FileText,
  MessageSquare,
  EyeOff, // ⬅️ for teaser masking note
  Crown, // ⬅️ for upgrade button
} from "lucide-react-native";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";
import QUESTIONS from "../utils/serviceMatrix";

const NOTIF_SOUND = require("../assets/notification.mp3");
const BTN_HEIGHT = 56;

// Foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ---------- helpers ----------
const fmtMMSS = (s) =>
  `${String(Math.floor((s || 0) / 60)).padStart(2, "0")}:${String(
    (s || 0) % 60
  ).padStart(2, "0")}`;

const toMiles = (m) => m / 1609.344;
const haversineMiles = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return toMiles(R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
};

function prettifyKey(k = "") {
  return String(k)
    .replace(/[_\-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function computePayout(job) {
  if (!job) return { payout: null, breakdown: "" };

  const customerTotal = Number(job.estimatedTotal ?? job.totalWithFees ?? NaN);
  const customerFeePct =
    job.customerFeePct != null ? Number(job.customerFeePct) : 0.07;
  const providerFeePct =
    job.providerFeePct != null ? Number(job.providerFeePct) : 0.07;

  let base;
  if (Number.isFinite(job.baseSubtotal)) {
    base = Number(job.baseSubtotal);
  } else if (Number.isFinite(customerTotal)) {
    base = customerTotal / (1 + customerFeePct);
  } else {
    return { payout: null, breakdown: "" };
  }

  const payout = base * (1 - providerFeePct);
  const breakdown = Number.isFinite(customerTotal)
    ? `Based on customer payment $${base.toFixed(
        2
      )}, inclusive of a ${Math.round(providerFeePct * 100)}% BlinqFix fee.`
    : `Estimated payout after ${Math.round(
        providerFeePct * 100
      )}% provider fee.`;

  return { payout, breakdown };
}

function pairsFromDetails(details) {
  try {
    if (!details) return [];
    const obj =
      typeof details === "string" ? JSON.parse(details) : { ...details };

    if (Array.isArray(obj)) {
      return obj
        .map((x) => ({
          q: x?.question || x?.q || x?.label || "",
          a: x?.answer ?? x?.a ?? x?.value ?? "",
        }))
        .filter((p) => p.q || p.a);
    }
    if (obj?.answers && typeof obj.answers === "object") {
      return Object.entries(obj.answers).map(([q, a]) => ({ q, a }));
    }
    if (obj?.questions && typeof obj.questions === "object") {
      return Object.entries(obj.questions).map(([q, a]) => ({ q, a }));
    }
    if (obj?.qa && Array.isArray(obj.qa)) {
      return obj
        .map((x) => ({
          q: x?.question || x?.q || x?.label || "",
          a: x?.answer ?? x?.a ?? x?.value ?? "",
        }))
        .filter((p) => p.q || p.a);
    }
    if (obj && typeof obj === "object") {
      return Object.entries(obj).map(([q, a]) => ({ q, a }));
    }
  } catch {}
  return [];
}

function extractQA(job) {
  if (!job) return [];
  const out = [];
  out.push(...pairsFromDetails(job.details));
  if (job.emergencyForm) out.push(...pairsFromDetails(job.emergencyForm));
  if (job.intake) out.push(...pairsFromDetails(job.intake));
  if (Array.isArray(job.formResponses)) {
    out.push(
      ...job.formResponses
        .map((x) => ({
          q: x?.question || x?.q || x?.label || "",
          a: x?.answer ?? x?.a ?? x?.value ?? "",
        }))
        .filter((p) => p.q || p.a)
    );
  }
  if (job.formAnswers && typeof job.formAnswers === "object") {
    out.push(...Object.entries(job.formAnswers).map(([q, a]) => ({ q, a })));
  }
  if (job.questionsAnswers && typeof job.questionsAnswers === "object") {
    out.push(
      ...Object.entries(job.questionsAnswers).map(([q, a]) => ({ q, a }))
    );
  }
  const seen = new Set();
  const deduped = [];
  for (const p of out) {
    const key = `${p.q}::${Array.isArray(p.a) ? p.a.join(",") : String(p.a)}`;
    if (!seen.has(key) && (p.q || p.a)) {
      seen.add(key);
      deduped.push(p);
    }
  }
  return deduped;
}

// ——— resolve “clickable” robustly ———
function resolveClickable(routeParams, jobDoc) {
  if (routeParams && typeof routeParams.clickable === "boolean")
    return routeParams.clickable;
  if (routeParams && typeof routeParams.buttonsActive === "boolean")
    return routeParams.buttonsActive;
  if (jobDoc && typeof jobDoc.clickable === "boolean") return jobDoc.clickable;
  if (jobDoc && typeof jobDoc.buttonsActive === "boolean")
    return jobDoc.buttonsActive;
  // default safest: teaser
  return false;
}

export default function ProviderInvitationScreen() {
  const {
    jobId,
    invitationExpiresAt,
    clickable: paramClickable,
    buttonsActive,
  } = useRoute().params || {};
  const navigation = useNavigation();

  const [remaining, setRemaining] = useState(null);
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [distanceMiles, setDistanceMiles] = useState(null);
  const [hasActiveJobConflict, setHasActiveJobConflict] = useState(false);

  const soundRef = useRef(null);
  const geocodeCacheRef = useRef({});

  // audio mode
  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        });
      } catch {}
    })();
  }, []);

  const playUrgentAlert = useCallback(async () => {
    try {
      Vibration.vibrate([0, 350, 150, 350, 150, 600]);
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(NOTIF_SOUND, {
        shouldPlay: true,
        isLooping: false,
        volume: 1.0,
      });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          try {
            await sound.unloadAsync();
          } catch {}
          if (soundRef.current === sound) soundRef.current = null;
        }
      });
    } catch {}
  }, []);

  const cleanupAudio = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
  }, []);

  // expiry timer
  useEffect(() => {
    if (!invitationExpiresAt) return;
    const expiry = Date.parse(invitationExpiresAt);
    const tick = () =>
      setRemaining(Math.max(0, Math.ceil((expiry - Date.now()) / 1000)));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [invitationExpiresAt]);

  // fetch job + active job + distance
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!jobId) throw new Error("Missing jobId param");

        // If teaser, hint backend to redact (safe if ignored server-side)
        const teaserHint = paramClickable === false ? "?teaser=1" : "";
        const { data } = await api.get(`/jobs/${jobId}${teaserHint}`);
        if (!alive) return;
        setJob(data);

        try {
          const { data: active } = await api.get("/jobs/provider/active");
          if (active && active._id && active._id !== jobId) {
            setHasActiveJobConflict(true);
          } else {
            setHasActiveJobConflict(false);
          }
        } catch (e) {
          if (e?.response?.status !== 404) {
            // ignore other errors for UI
          }
        }

        await computeDistance(data);
      } catch (err) {
        Alert.alert(
          "Error",
          err?.response?.data?.msg || "Failed to load job details."
        );
      } finally {
        if (alive) setJobLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, paramClickable]);

  // resolve teaser vs real (after job load too)
  const resolvedClickable = useMemo(
    () => resolveClickable({ clickable: paramClickable, buttonsActive }, job),
    [paramClickable, buttonsActive, job]
  );
  const isTeaser = !resolvedClickable;

  // DEBUG
  useEffect(() => {
    console.log("[INVITE_DEBUG] ProviderInvitation", {
      jobId,
      invitationExpiresAt,
      routeClickable: paramClickable,
      routeButtonsActive: buttonsActive,
      jobClickable: job?.clickable,
      jobButtonsActive: job?.buttonsActive,
      resolvedClickable,
      isTeaser,
      invitationPhase: job?.invitationPhase,
      roleHint: job?.roleHint, // if you ever attach this from server
    });
  }, [
    jobId,
    invitationExpiresAt,
    paramClickable,
    buttonsActive,
    job,
    resolvedClickable,
    isTeaser,
  ]);

  // chime only for real invites
  useEffect(() => {
    if (resolvedClickable && job) playUrgentAlert();
  }, [resolvedClickable, job, playUrgentAlert]);

  // distance helpers
  const geocodeCached = async (query) => {
    if (!query) return null;
    const key = query.trim().toLowerCase();
    if (geocodeCacheRef.current[key]) return geocodeCacheRef.current[key];
    try {
      const results = await Location.geocodeAsync(query);
      const hit = results?.[0]
        ? { lat: results[0].latitude, lng: results[0].longitude }
        : null;
      geocodeCacheRef.current[key] = hit;
      return hit;
    } catch {
      return null;
    }
  };

  const getJobCoords = async (j) => {
    if (!j) return null;
    const coords = j.location?.coordinates; // [lng, lat]
    if (Array.isArray(coords) && coords.length >= 2) {
      return { lat: Number(coords[1]), lng: Number(coords[0]) };
    }
    if (Number.isFinite(j.latitude) && Number.isFinite(j.longitude)) {
      return { lat: Number(j.latitude), lng: Number(j.longitude) };
    }
    const parts = [j.serviceCity, j.serviceState, j.serviceZip].filter(Boolean);
    const cityish = parts.join(", ");
    return geocodeCached(cityish || null);
  };

  const getProviderCoords = async () => {
    try {
      const raw = await AsyncStorage.getItem("me");
      if (raw) {
        try {
          const me = JSON.parse(raw)?.user ?? JSON.parse(raw);
          const coords = me?.location?.coordinates;
          if (Array.isArray(coords) && coords.length >= 2) {
            return { lat: Number(coords[1]), lng: Number(coords[0]) };
          }
          const parts = [];
          if (me?.address) parts.push(me.address);
          if (Array.isArray(me?.zipcode) && me.zipcode[0])
            parts.push(String(me.zipcode[0]));
          else if (typeof me?.zipcode === "string" && me.zipcode.trim())
            parts.push(me.zipcode.trim());
          const addr = parts.join(", ");
          const geo = await geocodeCached(addr);
          if (geo) return geo;
        } catch {}
      }
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        const req = await Location.requestForegroundPermissionsAsync();
        status = req.status;
      }
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        return { lat: pos.coords.latitude, lng: pos.coords.longitude };
      }
    } catch {}
    return null;
  };

  const computeDistance = async (j) => {
    try {
      if (j?.distanceFromProvider && Number.isFinite(j.distanceFromProvider)) {
        setDistanceMiles(Number(j.distanceFromProvider));
        return;
      }
      const [jc, pc] = await Promise.all([
        getJobCoords(j),
        getProviderCoords(),
      ]);
      if (jc && pc) {
        setDistanceMiles(haversineMiles(pc.lat, pc.lng, jc.lat, jc.lng));
      } else {
        setDistanceMiles(null);
      }
    } catch {
      setDistanceMiles(null);
    }
  };

  // mask PII for teaser (client-side in case server forgets)
  const maskedJob = useMemo(() => {
    if (!job) return null;
    if (!isTeaser) return job;

    return {
      ...job,
      // Hide PII or exact address for teaser
      address: "Hidden — upgrade to view",
      unit: undefined,
      customer: undefined,
      customerName: undefined,
      phoneNumber: undefined,
      email: undefined,
      // You may also want to hide very specific notes if they include PII
    };
  }, [job, isTeaser]);

  // actions
  const onAccept = async () => {
    if (isTeaser) {
      Alert.alert(
        "Upgrade required",
        "This is a job invite. Upgrade your subscription to accept jobs."
      );
      return;
    }
    if (hasActiveJobConflict) {
      Alert.alert(
        "Active Job in Progress",
        "You already have an active job. Finish it before accepting a new one.",
        [
          {
            text: "Go to Active Job",
            onPress: () => navigation.replace("ProviderJobStatus"),
          },
          { text: "OK", style: "cancel" },
        ]
      );
      return;
    }
    setLoading(true);
    try {
      await cleanupAudio();
      await Notifications.dismissAllNotificationsAsync().catch(() => {});
      await api.put(`/jobs/${jobId}/accept`);
      Alert.alert("Accepted", "You’ve claimed this job.", [
        {
          text: "OK",
          onPress: () => navigation.replace("ProviderJobStatus", { jobId }),
        },
      ]);
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.msg || "Could not accept job.");
    } finally {
      setLoading(false);
    }
  };

  const onDecline = async () => {
    if (isTeaser) {
      // Teaser: just close (optional to notify server)
      navigation.replace("ServiceProviderDashboard");
      return;
    }
    setLoading(true);
    try {
      await cleanupAudio();
      await Notifications.dismissAllNotificationsAsync().catch(() => {});
      await api.put(`/jobs/${jobId}/deny`);
      Alert.alert("Declined", "You’ve passed on this invitation.", [
        {
          text: "OK",
          onPress: () => navigation.replace("ServiceProviderDashboard"),
        },
      ]);
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.msg || "Could not decline job."
      );
    } finally {
      setLoading(false);
    }
  };

  const onUpgrade = () => {
    // Change the route if you have a dedicated upgrade screen
    navigation.navigate("MyAccountScreen", { source: "teaser_invite", jobId });
  };

  // ----- UI -----
  const isExpired = remaining === 0;
  const qa = extractQA(maskedJob);
  const serviceLabel =
    maskedJob?.serviceType ||
    maskedJob?.service ||
    maskedJob?.category ||
    "Service";
  const { payout, breakdown } = computePayout(maskedJob);

  if (jobLoading || !maskedJob) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#312e81"]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading Job Invitation...</Text>
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
            {/* Top row with just the back button */}
            <View style={styles.headerTopRow}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <ArrowLeft color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            {/* Centered banner under the back button */}
            <View style={styles.bannerWrap}>
              <View
                style={[
                  styles.headerBadge,
                  isTeaser ? styles.teaserBadge : styles.realBadge,
                ]}
              >
                <Bell color={isTeaser ? "#facc15" : "#22c55e"} size={16} />
                <Text
                  style={[
                    styles.headerBadgeText,
                    { color: isTeaser ? "#facc15" : "#22c55e" },
                  ]}
                  numberOfLines={0} // allow wrapping
                >
                  {isTeaser
                    ? "Job Nearby — only for Priority Users until the last phase of invitations."
                    : "New Job Invitation"}
                </Text>
              </View>
            </View>
          </View>

          {/* Timer */}
          <View
            style={[styles.timerCard, isExpired && styles.timerCardExpired]}
          >
            <LinearGradient
              colors={
                isExpired
                  ? ["rgba(239, 68, 68, 0.2)", "rgba(220, 38, 38, 0.1)"]
                  : ["rgba(250, 204, 21, 0.2)", "rgba(234, 179, 8, 0.1)"]
              }
              style={styles.timerGradient}
            >
              <Clock color={isExpired ? "#ef4444" : "#facc15"} size={28} />
              <Text
                style={[styles.timerText, isExpired && styles.timerTextExpired]}
              >
                {isExpired
                  ? "Invitation Expired"
                  : `Expires in ${fmtMMSS(remaining)}`}
              </Text>
            </LinearGradient>
          </View>

          {/* Active job conflict banner */}
          {hasActiveJobConflict && !isTeaser && (
            <View style={styles.conflictBanner}>
              <AlertTriangle color="#fbbf24" size={18} />
              <Text style={styles.conflictText}>
                You already have an active job. You can’t accept a new one until
                it’s finished.
              </Text>
            </View>
          )}

          {/* Job Details */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Wrench color="#60a5fa" size={24} />
              <Text style={styles.cardTitle}>Job Details</Text>
            </View>
            <Row label="Service" value={serviceLabel} />
            <Row
              label="Location"
              value={
                isTeaser
                  ? "Hidden — upgrade to view"
                  : `${maskedJob.address ?? ""}${
                      maskedJob.serviceCity ? `, ${maskedJob.serviceCity}` : ""
                    }`
              }
            />
            <View style={styles.distanceRow}>
              <MapPin color="#e0e7ff" size={16} style={{ marginRight: 8 }} />
              <Text style={styles.detailValue}>
                {Number.isFinite(maskedJob?.distanceFromProvider)
                  ? `${Number(maskedJob.distanceFromProvider).toFixed(
                      1
                    )} miles away`
                  : distanceMiles != null
                  ? `${distanceMiles.toFixed(1)} miles away`
                  : "Calculating distance..."}
              </Text>
            </View>
            {isTeaser && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                  gap: 8,
                }}
              >
                <EyeOff size={14} color="#94a3b8" />
                <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                  Exact address and customer details are not available until
                  last phase of invites.
                </Text>
              </View>
            )}
          </View>

          {/* Potential Earnings */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <DollarSign color="#22c55e" size={24} />
              <Text style={styles.cardTitle}>Potential Earnings</Text>
            </View>
            <Text style={styles.earningsAmount}>
              {Number.isFinite(payout) ? `$${payout.toFixed(2)}` : "N/A"}
            </Text>
            {!!breakdown && (
              <Text style={styles.earningsSubtext}>{breakdown}</Text>
            )}
          </View>

          {/* Emergency Form Q&A */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ClipboardList color="#c084fc" size={24} />
              <Text style={styles.cardTitle}>Emergency Form</Text>
            </View>

            {qa.length > 0 ? (
              <View style={{ borderRadius: 12, overflow: "hidden" }}>
                <LinearGradient
                  colors={[
                    "rgba(168, 85, 247, 0.15)",
                    "rgba(147, 51, 234, 0.05)",
                  ]}
                  style={{ padding: 12, borderRadius: 12 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <MessageSquare color="#a855f7" size={20} />
                    <Text style={[styles.cardTitle, { marginLeft: 8 }]}>
                      Responses
                    </Text>
                  </View>

                  {qa.map((pair, i) => {
                    const k = pair.q || "";
                    const v = pair.a;
                    const label = QUESTIONS?.[k] ?? prettifyKey(k);
                    return (
                      <View key={`${k}-${i}`} style={{ marginBottom: 12 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <FileText color="#94a3b8" size={16} />
                          <Text
                            style={{
                              color: "#fff",
                              marginLeft: 8,
                              fontWeight: "600",
                            }}
                          >
                            {label}
                          </Text>
                        </View>
                        <Text
                          style={{
                            color: "#e0e7ff",
                            marginLeft: 24,
                            lineHeight: 20,
                          }}
                        >
                          {Array.isArray(v) ? v.join(", ") : String(v)}
                        </Text>
                        {i < qa.length - 1 && (
                          <View
                            style={{
                              height: 1,
                              backgroundColor: "rgba(255,255,255,0.1)",
                              marginTop: 8,
                            }}
                          />
                        )}
                      </View>
                    );
                  })}
                </LinearGradient>
              </View>
            ) : (
              <Text style={styles.muted}>
                No additional answers were provided.
              </Text>
            )}
          </View>

          {/* Actions */}
          {isTeaser ? (
            <View style={styles.teaserActions}>
              <TouchableOpacity
                onPress={onUpgrade}
                activeOpacity={0.9}
                style={styles.upgradeBtn}
              >
                <LinearGradient
                  colors={["#facc15", "#eab308"]}
                  style={styles.buttonInner}
                >
                  <Crown color="#1f2937" size={20} />
                  <Text style={[styles.buttonText, { color: "#1f2937" }]}>
                    Upgrade Subscription
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.replace("ServiceProviderDashboard")}
                style={styles.secondaryBtn}
              >
                <X color="#94a3b8" size={18} />
                <Text style={[styles.secondaryText, { color: "#e0e7ff" }]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={onDecline}
                disabled={isExpired || loading}
                style={[
                  styles.actionButton,
                  styles.declineButton,
                  (isExpired || loading) && styles.buttonDisabled,
                ]}
                activeOpacity={0.85}
              >
                <View style={[styles.buttonInner, styles.declineInner]}>
                  <X color="#f87171" size={22} />
                  <Text style={[styles.buttonText, styles.declineText]}>
                    Decline
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onAccept}
                disabled={isExpired || loading || hasActiveJobConflict}
                style={[
                  styles.actionButton,
                  (isExpired || loading || hasActiveJobConflict) &&
                    styles.buttonDisabled,
                ]}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["#22c55e", "#16a34a"]}
                  style={styles.buttonInner}
                >
                  <Check color="#fff" size={22} />
                  <Text style={styles.buttonText}>
                    {loading ? "Processing..." : "Accept Job"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{String(value ?? "—")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#fff", marginTop: 16, fontSize: 16 },
  scrollContent: { padding: 20, paddingBottom: 40, marginTop: 60 },

  header: {
    flexDirection: "column",
    alignItems: "start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headerCenter: { alignItems: "center" },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  teaserBadge: {
    backgroundColor: "rgba(250, 204, 21, 0.1)",
    borderColor: "rgba(250, 204, 21, 0.3)",
  },
  realBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderColor: "rgba(34, 197, 94, 0.35)",
    marginRight: "30%",
  },
  headerBadgeText: { marginLeft: 8, fontSize: 16, fontWeight: "bold" },

  timerCard: { borderRadius: 16, overflow: "hidden", marginBottom: 20 },
  timerCardExpired: { borderColor: "rgba(239, 68, 68, 0.3)" },
  timerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  timerText: { fontSize: 22, fontWeight: "bold", color: "#facc15" },
  timerTextExpired: { color: "#ef4444" },

  conflictBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(250, 204, 21, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(250, 204, 21, 0.3)",
    marginBottom: 16,
  },
  conflictText: { color: "#fde68a", flex: 1 },

  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  detailLabel: { fontSize: 16, color: "#e0e7ff", fontWeight: "600" },
  detailValue: { fontSize: 16, color: "#fff", flex: 1, textAlign: "right" },

  distanceRow: { flexDirection: "row", alignItems: "center", paddingTop: 12 },

  earningsAmount: {
    fontSize: 36,
    fontWeight: "900",
    color: "#22c55e",
    textAlign: "center",
  },
  earningsSubtext: {
    fontSize: 14,
    color: "#e0e7ff",
    textAlign: "center",
    marginTop: 4,
  },

  muted: { color: "#94a3b8" },

  // Real invite actions
  buttonRow: { flexDirection: "row", gap: 16, marginTop: 8 },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    height: BTN_HEIGHT,
    justifyContent: "center",
  },
  buttonInner: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexDirection: "row",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  buttonDisabled: { opacity: 0.5 },
  declineButton: {
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(248, 113, 113, 0.3)",
  },
  declineInner: { backgroundColor: "transparent" },
  declineText: { color: "#f87171" },

  // Teaser actions
  teaserActions: { gap: 12, marginTop: 8 },
  upgradeBtn: {
    borderRadius: 16,
    overflow: "hidden",
    height: BTN_HEIGHT,
    justifyContent: "center",
  },
  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 40,
  },
  secondaryText: { fontWeight: "800" },
});
