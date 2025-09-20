import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Platform,
  SafeAreaView,
  Vibration,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import io from "socket.io-client";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "../api/client";
import * as session from "../utils/sessionManager";
import StarRating from "../components/StarRating";
import { Buffer } from "buffer";
import {
  MapPin,
  Clock,
  CheckCircle,
  X,
  User,
  ArrowLeft,
  Zap,
  Shield,
  Crosshair,
} from "lucide-react-native";
import SecurityCodeCard from "../components/SecurityCodeCard";

const NOTIF_SOUND = require("../assets/notification.mp3");

const CANCELLATION_GRACE_MINUTES = 5;
const CANCELLATION_FEE_USD = 120;
const POST_PAYMENT_COOLDOWN_MS = 7000; // ⏱ block outgoing nav for first 7s

// ---------- logging helper ----------
const L = (...args) => console.log("📌 [CustomerJobStatus]", ...args);

// ---------- utils ----------
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

const getStatusConfig = (status) => {
  switch (status) {
    case "pending":
    case "invited":
      return { color: "#facc15", icon: Clock, text: "Finding Service Pro" };
    case "accepted":
      return { color: "#60a5fa", icon: MapPin, text: "Professional En Route" };
    case "arrived":
      return { color: "#22c55e", icon: CheckCircle, text: "Pro Has Arrived" };
    case "completed":
      return { color: "#22c55e", icon: CheckCircle, text: "Job Completed" };
    default:
      return { color: "#94a3b8", icon: Clock, text: status || "Status" };
  }
};

const distanceMeters = (a, b) => {
  if (!a || !b) return Infinity;
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const formatDistance = (meters) => {
  if (!Number.isFinite(meters)) return "--";
  const feet = meters * 3.28084;
  if (feet < 1000) return `${Math.round(feet)} ft`;
  const miles = meters / 1609.34;
  return `${miles.toFixed(miles < 10 ? 1 : 0)} mi`;
};

const secondsAgo = (dateObj) => {
  if (!dateObj) return null;
  const s = Math.max(0, Math.floor((Date.now() - dateObj.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
};

const deriveRouteJobId = (params) =>
  params?.jobId || params?.id || params?.job?._id || params?.job?.id || null;

const socketOriginFromApiBase = (apiBase) =>
  (apiBase || "").replace(/\/api\/?$/, "") || "https://blinqfix.onrender.com";

// ======================================================
// Component
// ======================================================
export default function CustomerJobStatus() {
  const route = useRoute();
  const navigation = useNavigation();

  // ----- job id resolution -----
  const initialParamJobId = deriveRouteJobId(route?.params);
  const [jobId, setJobId] = useState(initialParamJobId);
  const [resolvingJobId, setResolvingJobId] = useState(!initialParamJobId);

  // ----- state -----
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [providerInfo, setProviderInfo] = useState(null);
  const [providerCoords, setProviderCoords] = useState(null);
  const [lastProviderUpdate, setLastProviderUpdate] = useState(null);

  const [jobLocation, setJobLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  const [showEnRouteBanner, setShowEnRouteBanner] = useState(false);
  const [showArrivalBanner, setShowArrivalBanner] = useState(false);
  const [followProvider, setFollowProvider] = useState(true);

  // ----- refs -----
  const notCompletePressedRef = useRef(false);
  const hasShownEnRouteRef = useRef(false);
  const hasShownArrivalRef = useRef(false);

  const mapRef = useRef(null);
  const socketRef = useRef(null);
  const prevStatusRef = useRef(null);
  const arrivalTimeoutRef = useRef(null);
  const enRouteTimeoutRef = useRef(null);
  const pollRef = useRef(null);
  const notFoundHandledRef = useRef(false);
  const firstErrorAlertRef = useRef(false);
  const lastFitAtRef = useRef(0);
  const clearedPostPaymentRef = useRef(false);
  const mountedRef = useRef(true);

  // Why did we leave? (for logs on unmount)
  const leavingReasonRef = useRef("unknown");

  // Post-payment cooldown: block outgoing resets/backs briefly
  const suppressRedirectRef = useRef(false);
  const removeGuardRef = useRef(null);

  // NEW: capture any blocked nav during cooldown for post-cooldown decision
  const blockedNavActionRef = useRef(null);

  // NEW: track whether job ever loaded (true) or was 404 (missing)
  const jobLoadedRef = useRef(false);
  const jobMissingRef = useRef(false);

  // --- Mount / Nav logs + beforeRemove guard
  useEffect(() => {
    L("Mounted. route.name:", route?.name, "params:", route?.params);
    try {
      const navState = navigation?.getState?.();
      L(
        "Nav routes length:",
        navState?.routes?.length,
        "index:",
        navState?.index
      );
      const cur = navState?.routes?.[navState?.index || 0];
      L("Current route:", cur?.name, "params:", cur?.params);
    } catch (e) {
      L("Nav state read error:", e?.message || e);
    }

    // Install a beforeRemove guard that can block resets during cooldown
    const unsubscribeBeforeRemove = navigation.addListener(
      "beforeRemove",
      (e) => {
        const action = e?.data?.action;
        const type = action?.type;
        const dest = action?.payload?.routes?.[0]?.name;
        L("beforeRemove:", type, "target:", e?.target, "dest:", dest);

        if (suppressRedirectRef.current) {
          // During cooldown: capture and block. We'll decide later whether to dispatch.
          if (type === "RESET") {
            blockedNavActionRef.current = action;
            L(
              "Captured RESET during cooldown (will decide after cooldown). dest:",
              dest
            );
          }
          L("BLOCKED nav action during post-payment cooldown:", type);
          e.preventDefault();
          return;
        }

        // After cooldown: if a RESET tries to dump us to CustomerDashboard but the job is present,
        // treat this as stale and block it.
        if (
          type === "RESET" &&
          dest === "CustomerDashboard" &&
          jobLoadedRef.current &&
          !jobMissingRef.current
        ) {
          L("BLOCKED stale RESET→CustomerDashboard because job is present.");
          e.preventDefault();
          return;
        }

        // otherwise allow navigation & record reason
        leavingReasonRef.current = `nav:${type || "unknown"}`;
      }
    );

    const unsubFocus = navigation.addListener("focus", () => L("→ focus"));
    const unsubBlur = navigation.addListener("blur", () => L("← blur"));

    removeGuardRef.current = () => {
      unsubscribeBeforeRemove?.();
      unsubFocus?.();
      unsubBlur?.();
    };

    return () => {
      mountedRef.current = false;
      L("UNMOUNT. leavingReason:", leavingReasonRef.current);
      removeGuardRef.current?.();
    };
  }, [navigation, route]);

  // --- Post-payment suppression window
  useEffect(() => {
    const from = route?.params?.from;
    if (from === "payment" || from === "payment-fallback") {
      L(
        `Post-payment entry detected (from=${from}). Suppressing outgoing redirects for ${POST_PAYMENT_COOLDOWN_MS}ms`
      );
      suppressRedirectRef.current = true;
      const t = setTimeout(() => {
        suppressRedirectRef.current = false;
        L("Post-payment suppression window ended");

        // DECIDE: if we captured a RESET during cooldown, only dispatch it if the job never loaded (or is missing)
        const blocked = blockedNavActionRef.current;
        if (blocked) {
          const dest = blocked?.payload?.routes?.[0]?.name;
          if (!jobLoadedRef.current || jobMissingRef.current) {
            L(
              "Dispatching previously blocked action because job not loaded/missing. type:",
              blocked?.type,
              "dest:",
              dest
            );
            leavingReasonRef.current = `nav:${blocked?.type || "unknown"}`;
            navigation.dispatch(blocked);
          } else {
            L(
              "Dropping previously blocked RESET (job loaded successfully). dest:",
              dest
            );
          }
          blockedNavActionRef.current = null;
        }
      }, POST_PAYMENT_COOLDOWN_MS);
      return () => clearTimeout(t);
    }
  }, [route?.params?.from, navigation]);

  // --- keep jobId in sync if params change
  useEffect(() => {
    const p = deriveRouteJobId(route?.params);
    if (p && p !== jobId) {
      L("Param jobId changed →", p);
      setJobId(String(p));
      setResolvingJobId(false);
      try {
        AsyncStorage.setItem("activeJobId", String(p));
      } catch {}
    }
  }, [route?.params, jobId]);

  // --- resolve jobId fallbacks (postPayment → active → lastCreated → session → /jobs/active)
  useEffect(() => {
    if (jobId) return;
    let alive = true;

    (async () => {
      setResolvingJobId(true);
      L("No jobId in params, attempting fallbacks…");

      let id = null;

      try {
        const postPay = await AsyncStorage.getItem("postPaymentJobId");
        L("postPaymentJobId:", postPay);
        if (postPay) id = postPay;
      } catch (e) {
        L("Read postPaymentJobId error:", e?.message || e);
      }

      if (!id) {
        try {
          const active = await AsyncStorage.getItem("activeJobId");
          L("activeJobId:", active);
          if (active) id = active;
        } catch (e) {
          L("Read activeJobId error:", e?.message || e);
        }
      }

      if (!id) {
        try {
          const lastId = await AsyncStorage.getItem("lastCreatedJobId");
          L("lastCreatedJobId:", lastId);
          if (lastId) id = lastId;
        } catch (e) {
          L("Read lastCreatedJobId error:", e?.message || e);
        }
      }

      if (!id) {
        try {
          const s = await session.loadSession?.();
          L("session.loadSession present:", Boolean(s));
          if (s?.jobId) id = s.jobId;
        } catch (e) {
          L("loadSession error:", e?.message || e);
        }
      }

      if (!id) {
        try {
          const res = await api.get("/jobs/active?role=customer");
          const active = Array.isArray(res.data) ? res.data[0] : res.data;
          id = active?._id || null;
          L("/jobs/active resolved jobId:", id);
        } catch (e) {
          L(
            "/jobs/active fallback failed:",
            e?.response?.data || e?.message || e
          );
        }
      }

      if (!alive) return;

      if (id) {
        setJobId(String(id));
        if (!route?.params?.jobId) {
          navigation.setParams({ ...(route?.params || {}), jobId: String(id) });
          L("Inserted jobId into route.params:", String(id));
        }
        try {
          await AsyncStorage.setItem("activeJobId", String(id));
        } catch {}
      } else {
        L("⛔ Could not resolve jobId from any source.");
      }

      setResolvingJobId(false);
    })();

    return () => {
      alive = false;
    };
  }, [jobId, navigation, route?.params]);

  // --- persistent socket (only jobId dependency)
  useEffect(() => {
    if (!jobId) return;

    const apiBase = api.defaults.baseURL || "";
    const origin = socketOriginFromApiBase(apiBase);

    let socket;
    let cancelled = false;

    (async () => {
      // avoid duplicate connections
      if (socketRef.current?.connected) {
        L("Socket already connected, skipping new connect");
        return;
      }

      let token = null;
      try {
        token = await AsyncStorage.getItem("token");
      } catch {}

      L("Connecting socket to:", origin, "for job:", jobId);
      socket = io(origin, {
        path: "/socket.io",
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        forceNew: true,
        auth: token ? { token: `Bearer ${token}` } : undefined,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        L("Socket connected. id:", socket.id);
        // always (re)join on connect
        socket.emit("join", jobId, (ack) => L("Join ack:", ack));
      });

      socket.on("connect_error", (err) =>
        L("Socket connect_error:", err?.message || err)
      );
      socket.on("error", (err) => L("Socket error:", err?.message || err));
      socket.on("disconnect", (reason) => L("Socket disconnected:", reason));
      socket.io?.on?.("reconnect_attempt", (n) =>
        L("Socket reconnect_attempt:", n)
      );
      socket.io?.on?.("reconnect", (n) => L("Socket reconnected:", n));

      socket.on("jobUpdated", (updatedJob) => {
        if (!mountedRef.current || cancelled) return;
        if (updatedJob?._id === jobId) {
          L(
            "jobUpdated received for current job → status:",
            updatedJob?.status
          );
          jobLoadedRef.current = true; // NEW
          jobMissingRef.current = false; // NEW
          setJob(updatedJob);
        }
      });

      socket.on("providerLocation", (loc) => {
        if (!mountedRef.current || cancelled) return;
        const lat = Number(loc?.lat ?? loc?.latitude);
        const lng = Number(loc?.lng ?? loc?.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setProviderCoords({ latitude: lat, longitude: lng });
          setLastProviderUpdate(new Date());
        }
      });
    })();

    return () => {
      L("Cleanup: closing socket");
      try {
        socketRef.current?.disconnect();
      } catch {}
      socketRef.current = null;
    };
  }, [jobId]);

  // --- HTTP fallback: provider latest location
  useEffect(() => {
    if (!jobId) return;
    let alive = true;

    const fetchLatestProviderLocation = async () => {
      try {
        const { data } = await api.get(
          `/jobs/${jobId}/provider/location/latest?t=${Date.now()}`
        );
        if (!alive || !data) return;
        const lat = Number(data.latitude ?? data.lat);
        const lng = Number(data.longitude ?? data.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setProviderCoords({ latitude: lat, longitude: lng });
          setLastProviderUpdate(
            data.updatedAt ? new Date(data.updatedAt) : new Date()
          );
        }
      } catch {}
    };

    fetchLatestProviderLocation();
    const id = setInterval(fetchLatestProviderLocation, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [jobId]);

  // --- Poll job (with 404 guard, cooldown suppression & diagnostics)
  useEffect(() => {
    if (!jobId) return;
    L("Start polling job:", jobId);

    let alive = true;

    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
        L("Stopped polling");
      }
    };

    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${jobId}?t=${Date.now()}`);
        if (!alive) return;

        setJob(data);
        jobLoadedRef.current = true; // NEW: mark job loaded
        jobMissingRef.current = false; // NEW: definitely not missing now

        L(
          "Job polled. status:",
          data?.status,
          "| paymentStatus:",
          data?.paymentStatus,
          "| billingStatus:",
          data?.billingStatus,
          "| addPay:",
          data?.additionalPaymentStatus,
          "| custCompleted:",
          data?.customerCompleted,
          "| proCompleted:",
          data?.providerCompleted
        );

        // clear post-payment sentinel after first successful fetch
        if (!clearedPostPaymentRef.current) {
          clearedPostPaymentRef.current = true;
          try {
            await AsyncStorage.removeItem("postPaymentJobId");
            L("Cleared postPaymentJobId sentinel");
          } catch {}
        }

        // fetch provider info once accepted
        if (data.acceptedProvider) {
          try {
            const res = await api.get(`/users/${data.acceptedProvider}`);
            const p = res.data;
            setProviderInfo({
              name: p.name,
              businessName: p.businessName,
              aboutMe: p.aboutMe,
              profilePictureUrl: p.profilePicture || null,
              averageRating: p.averageRating ?? null,
            });
          } catch {}
        }

        // job location
        const jobLoc = data.location?.coordinates;
        if (Array.isArray(jobLoc) && jobLoc.length >= 2) {
          const [lng, lat] = jobLoc;
          setJobLocation({ latitude: lat, longitude: lng });
        }

        // completion flow
        if (data.customerCompleted && data.providerCompleted) {
          if (suppressRedirectRef.current) {
            L("SUPPRESSED redirect → RateProvider (cooldown)");
          } else {
            leavingReasonRef.current = "redirect:completion";
            stopPolling();
            await session.clearSession?.();
            navigation.replace("RateProvider", { jobId: data._id });
            return;
          }
        }

        // awaiting additional payment
        const awaitingAdditional =
          data.status === "awaiting-additional-payment" ||
          data?.paymentStatus === "awaiting_additional" ||
          data?.billingStatus === "awaiting-additional" ||
          data?.additionalPaymentStatus === "awaiting";
        if (awaitingAdditional) {
          if (suppressRedirectRef.current) {
            L("SUPPRESSED redirect → PaymentScreen (cooldown)");
          } else {
            leavingReasonRef.current = "redirect:awaiting_additional";
            stopPolling();
            navigation.replace("PaymentScreen", { jobId: data._id });
            return;
          }
        }

        // arrival server flags
        if (
          !hasShownArrivalRef.current &&
          (data.status === "arrived" || data.arrivedAt || data.providerArrived)
        ) {
          hasShownArrivalRef.current = true;
          setShowArrivalBanner(true);
          playChime();
          sendLocalNotification(
            "Your Pro Has Arrived",
            "Your BlinqFix pro is at your location.",
            {
              jobId: data._id,
              type: "arrival",
            }
          );
          if (arrivalTimeoutRef.current)
            clearTimeout(arrivalTimeoutRef.current);
          arrivalTimeoutRef.current = setTimeout(
            () => setShowArrivalBanner(false),
            10000
          );
        }
      } catch (err) {
        if (!alive) return;

        const status = err?.response?.status;
        if (status === 404) {
          jobMissingRef.current = true; // NEW: mark missing
          if (!notFoundHandledRef.current) {
            notFoundHandledRef.current = true;
            leavingReasonRef.current = "redirect:404";
            stopPolling();
            await session.clearSession?.();
            Alert.alert(
              "Job Not Found",
              "This job may have been closed or removed. Returning to your dashboard.",
              [
                {
                  text: "OK",
                  onPress: () => navigation.replace("CustomerDashboard"),
                },
              ]
            );
          }
          setJob(null);
          setLoading(false);
          return;
        }

        if (!firstErrorAlertRef.current) {
          firstErrorAlertRef.current = true;
          Alert.alert("Error", "Unable to load job status.");
        }
        console.error("[FetchJob Error]:", err?.message || err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchJob();
    pollRef.current = setInterval(fetchJob, 25000);

    return () => {
      alive = false;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [jobId, navigation]);

  // --- Sound + notification helpers ---
  const playChime = useCallback(async () => {
    try {
      Vibration.vibrate([0, 300, 150, 300]);
      const { sound } = await Audio.Sound.createAsync(NOTIF_SOUND, {
        shouldPlay: true,
        isLooping: false,
        volume: 1.0,
      });
      sound.setOnPlaybackStatusUpdate(async (s) => {
        if (s.didJustFinish) {
          try {
            await sound.unloadAsync();
          } catch {}
        }
      });
    } catch {}
  }, []);

  const sendLocalNotification = useCallback(async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: Platform.OS === "ios" ? "notification.wav" : undefined,
        },
        trigger: Platform.select({
          android: { channelId: "job-invites-v2" },
          ios: null,
        }),
      });
    } catch {}
  }, []);

  // --- Status transition banner (accepted -> en route) ---
  useEffect(() => {
    const prev = prevStatusRef.current;
    const curr = job?.status;

    if (
      curr === "accepted" &&
      prev !== "accepted" &&
      !hasShownEnRouteRef.current
    ) {
      hasShownEnRouteRef.current = true;
      setShowEnRouteBanner(true);
      playChime();
      sendLocalNotification(
        "Service Pro Located",
        "Your BlinqFix pro is on the way.",
        {
          jobId,
          type: "service_pro_found",
        }
      );
      if (enRouteTimeoutRef.current) clearTimeout(enRouteTimeoutRef.current);
      enRouteTimeoutRef.current = setTimeout(
        () => setShowEnRouteBanner(false),
        10000
      );
    }

    prevStatusRef.current = curr;
  }, [job?.status, jobId, playChime, sendLocalNotification]);

  // --- Proximity arrival detection (≤ 100m) ---
  useEffect(() => {
    if (providerCoords && jobLocation && !hasShownArrivalRef.current) {
      const d = distanceMeters(providerCoords, jobLocation);
      if (d <= 100) {
        hasShownArrivalRef.current = true;
        setShowArrivalBanner(true);
        playChime();
        sendLocalNotification(
          "Your Pro Has Arrived",
          "Your BlinqFix pro is at your location.",
          {
            jobId,
            type: "arrival_proximity",
          }
        );

        (async () => {
          try {
            await api.put(`/jobs/${jobId}/status`, { status: "arrived" });
          } catch {}
        })();

        if (arrivalTimeoutRef.current) clearTimeout(arrivalTimeoutRef.current);
        arrivalTimeoutRef.current = setTimeout(
          () => setShowArrivalBanner(false),
          10000
        );
      }
    }
  }, [providerCoords, jobLocation, jobId, playChime, sendLocalNotification]);

  // --- Keep map focused on provider + destination (throttled) ---
  useEffect(() => {
    if (!mapRef.current || !providerCoords || !jobLocation) return;

    setRouteCoords([providerCoords, jobLocation]);

    const now = Date.now();
    const THROTTLE_MS = 1000;
    if (!followProvider || now - lastFitAtRef.current < THROTTLE_MS) return;

    lastFitAtRef.current = now;
    try {
      mapRef.current.fitToCoordinates([providerCoords, jobLocation], {
        edgePadding: { top: 80, right: 80, bottom: 240, left: 80 },
        animated: true,
      });
    } catch {}
  }, [providerCoords, jobLocation, followProvider]);

  // --- Cleanup timers/intervals ---
  useEffect(() => {
    return () => {
      if (arrivalTimeoutRef.current) clearTimeout(arrivalTimeoutRef.current);
      if (enRouteTimeoutRef.current) clearTimeout(enRouteTimeoutRef.current);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  // --- Actions ---
  const handleNotComplete = useCallback(async () => {
    try {
      await api.put(`/jobs/${jobId}/status`, {
        status: "accepted",
        providerCompleted: false,
      });
      await api.post(`/jobs/${jobId}/notify-not-complete`);
      Alert.alert(
        "Noted",
        "The service pro has been notified. Please await their update."
      );
      setJob((prev) => ({ ...prev, providerCompleted: false }));
    } catch {
      Alert.alert("Error", "Failed to update status");
    }
  }, [jobId]);

  const handleCustomerComplete = useCallback(async () => {
    try {
      const { data } = await api.put(`/jobs/${jobId}/complete/customer`);
      setJob(data);
    } catch {
      Alert.alert("Error", "Could not confirm completion");
    }
  }, [jobId]);

  const handleCancelJob = useCallback(async () => {
    try {
      const pickPaid = (j) => {
        const candidates = [
          j?.totalAmountPaid,
          j?.amountPaid,
          j?.capturedAmount,
          j?.estimatedTotal,
          j?.customerTotal,
          j?.totalWithFees,
          j?.total,
        ];
        for (const n of candidates) {
          const v = Number(n);
          if (Number.isFinite(v) && v >= 0) return v;
        }
        return 0;
      };

      const amountPaid = pickPaid(job);

      const acceptedAtRaw = job?.acceptedAt || job?.accepted_at;
      let refundEligible = true;
      if (acceptedAtRaw) {
        const acceptedAt = new Date(acceptedAtRaw);
        const diffMs = Date.now() - acceptedAt.getTime();
        if (Number.isFinite(diffMs)) {
          refundEligible = diffMs < CANCELLATION_GRACE_MINUTES * 60 * 1000;
        }
      }

      const cancellationFee = refundEligible ? 0 : CANCELLATION_FEE_USD;
      const refundAmount = refundEligible
        ? amountPaid
        : Math.max(0, amountPaid - cancellationFee);

      const msg = refundEligible
        ? `Cancel now for a full refund of $${amountPaid.toFixed(2)}.`
        : `Canceling now incurs a $${cancellationFee.toFixed(
            2
          )} cancellation fee.\nEstimated refund: $${refundAmount.toFixed(2)}.`;

      const confirmed = await new Promise((resolve) =>
        Alert.alert("Cancel Job", msg, [
          { text: "No", style: "cancel", onPress: () => resolve(false) },
          { text: "Yes, Cancel", onPress: () => resolve(true) },
        ])
      );
      if (!confirmed) return;

      await api.put(`/jobs/${jobId}/cancelled`, {
        cancelledBy: "customer",
        refundEligible,
        cancellationFee,
        refundAmount,
      });

      Alert.alert(
        "Job Cancelled",
        refundEligible
          ? `You cancelled within ${CANCELLATION_GRACE_MINUTES} minutes. A full refund of $${amountPaid.toFixed(
              2
            )} will be issued.`
          : `A $${cancellationFee.toFixed(
              2
            )} cancellation fee applies. Your estimated refund is $${refundAmount.toFixed(
              2
            )}.`
      );

      setTimeout(() => {
        leavingReasonRef.current = "redirect:cancelled";
        navigation.navigate("CustomerDashboard");
      }, 10000);
    } catch {
      Alert.alert("Error", "Unable to cancel the job. Try again.");
    }
  }, [job, jobId, navigation]);

  // --- Loading / Missing id UI ---
  if (resolvingJobId) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#312e81"]}
        style={styles.centered}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff", marginTop: 12 }}>
          Preparing job view…
        </Text>
      </LinearGradient>
    );
  }

  if (!jobId) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#312e81"]}
        style={styles.centered}
      >
        <Text style={styles.errorText}>
          We couldn’t find your job reference.
        </Text>
        <Text style={{ color: "#cbd5e1", marginTop: 6 }}>
          Please go back and start your booking again.
        </Text>
      </LinearGradient>
    );
  }

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

  if (!job) {
    return (
      <LinearGradient
        colors={["#0f172a", "#1e3a8a", "#312e81"]}
        style={styles.centered}
      >
        <Text style={styles.errorText}>Job not found.</Text>
      </LinearGradient>
    );
  }

  // ---- Render ----
  const statusConfig = getStatusConfig(job.status);
  const liveDistance =
    providerCoords && jobLocation
      ? distanceMeters(providerCoords, jobLocation)
      : null;

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#312e81"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            {/* <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity> */}
            <View style={styles.headerCenter}>
              <View style={styles.headerBadge}>
                <Zap color="#facc15" size={16} />
                <Text style={styles.headerBadgeText}>Emergency Service</Text>
              </View>
              <Text style={styles.headerTitle}>Job Status</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <LinearGradient
              colors={[`${statusConfig.color}20`, `${statusConfig.color}10`]}
              style={styles.statusGradient}
            >
              <View style={styles.statusHeader}>
                <statusConfig.icon color={statusConfig.color} size={32} />
                <View style={styles.statusInfo}>
                  <Text style={styles.statusTitle}>{statusConfig.text}</Text>
                  <Text style={styles.statusSubtitle}>
                    Job ID: {String(jobId).slice(-6)}
                  </Text>
                </View>
              </View>
              {job?.service && (
                <Text style={styles.serviceText}>
                  {job.service} • {job.address}
                </Text>
              )}
            </LinearGradient>
          </View>

          {/* “Service Pro Located” banner */}
          {job.status === "accepted" && showEnRouteBanner && (
            <View style={styles.alertCard}>
              <LinearGradient
                colors={["rgba(34, 197, 94, 0.2)", "rgba(16, 185, 129, 0.1)"]}
                style={styles.alertGradient}
              >
                <View style={styles.alertHeader}>
                  <CheckCircle color="#22c55e" size={24} />
                  <Text style={styles.alertTitle}>Service Pro Located!</Text>
                </View>
                <Text style={styles.alertText}>
                  Your BlinqFix professional is in route. We’ll notify you again
                  upon arrival.
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Arrival banner */}
          {showArrivalBanner && (
            <View style={styles.alertCard}>
              <LinearGradient
                colors={[
                  "rgba(96, 165, 250, 0.25)",
                  "rgba(59, 130, 246, 0.12)",
                ]}
                style={styles.alertGradient}
              >
                <View style={styles.alertHeader}>
                  <MapPin color="#60a5fa" size={24} />
                  <Text style={styles.alertTitle}>Your Pro Has Arrived</Text>
                </View>
                <Text style={styles.alertText}>
                  Your BlinqFix professional is at your location.
                </Text>
              </LinearGradient>
            </View>
          )}

          <SecurityCodeCard jobId={jobId} role="customer" />
          {/* Provider Info */}
          {providerInfo && (
            <View style={styles.providerCard}>
              <Text style={styles.cardTitle}>Your Service Pro</Text>
              <View style={styles.providerInfo}>
                {providerInfo.profilePictureUrl ? (
                  <Image
                    source={{
                      uri: convertToBase64Uri(providerInfo.profilePictureUrl),
                    }}
                    style={styles.providerImage}
                  />
                ) : (
                  <View style={styles.providerImagePlaceholder}>
                    <User color="#94a3b8" size={40} />
                  </View>
                )}
                <View style={styles.providerDetails}>
                  <Text style={styles.providerName}>{providerInfo.name}</Text>
                  <Text style={styles.providerBusiness}>
                    {providerInfo.businessName}
                  </Text>
                  {providerInfo.aboutMe && (
                    <Text style={styles.providerAbout}>
                      {providerInfo.aboutMe}
                    </Text>
                  )}
                  <View style={styles.ratingContainer}>
                    <StarRating rating={providerInfo.averageRating} size={18} />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Completion Confirmation */}
          {job.providerCompleted && !job.customerCompleted && (
            <View style={styles.completionCard}>
              <Text style={styles.completionTitle}>Confirm Job Completion</Text>
              <Text style={styles.completionText}>
                The professional has marked this job as complete. Please review
                and confirm:
              </Text>

              {job.arrivalImage && (
                <Image
                  source={{ uri: convertToBase64Uri(job.arrivalImage) }}
                  style={styles.completionImage}
                />
              )}
              {job.completionImage && (
                <Image
                  source={{ uri: convertToBase64Uri(job.completionImage) }}
                  style={styles.completionImage}
                />
              )}

              <View style={styles.completionButtons}>
                <TouchableOpacity
                  style={[styles.confirmButton]}
                  onPress={handleCustomerComplete}
                >
                  <LinearGradient
                    colors={["#22c55e", "#16a34a"]}
                    style={styles.buttonGradient}
                  >
                    <CheckCircle color="#fff" size={20} />
                    <Text style={styles.confirmButtonText}>
                      Confirm Complete
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => {
                    if (!notCompletePressedRef.current) {
                      notCompletePressedRef.current = true;
                      handleNotComplete();
                    }
                  }}
                >
                  <X color="#f87171" size={20} />
                  <Text style={styles.rejectButtonText}>Not Complete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Map */}
          {jobLocation?.latitude && jobLocation?.longitude && (
            <View style={styles.mapCard}>
              <Text style={styles.cardTitle}>Location & Tracking</Text>

              <View style={styles.mapContainer}>
                <MapView
                  ref={mapRef}
                  provider={
                    Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                  }
                  style={styles.map}
                  initialRegion={{
                    latitude: jobLocation.latitude,
                    longitude: jobLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  onPanDrag={() => setFollowProvider(false)}
                >
                  <Marker coordinate={jobLocation} title="Service Location" />

                  {providerCoords && (
                    <Marker
                      coordinate={providerCoords}
                      title="Service Professional"
                      description="Professional's current location"
                      pinColor="blue"
                    />
                  )}

                  {routeCoords.length >= 2 && (
                    <Polyline
                      coordinates={routeCoords}
                      strokeColor="#60a5fa"
                      strokeWidth={4}
                      lineCap="round"
                    />
                  )}
                </MapView>

                {/* HUD overlay */}
                <View style={styles.mapHud}>
                  <View style={styles.mapBadge}>
                    <Text style={styles.mapBadgeText}>
                      {providerCoords
                        ? `${formatDistance(liveDistance)} away`
                        : ""}
                      {lastProviderUpdate
                        ? ` • ${secondsAgo(lastProviderUpdate)}`
                        : ""}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setFollowProvider((s) => !s)}
                    style={[
                      styles.followPill,
                      followProvider ? styles.followOn : styles.followOff,
                    ]}
                  >
                    <Crosshair
                      size={14}
                      color={followProvider ? "#052e16" : "#e0e7ff"}
                    />
                    <Text
                      style={[
                        styles.followText,
                        followProvider
                          ? styles.followTextOn
                          : styles.followTextOff,
                      ]}
                    >
                      {followProvider ? "Following" : "Follow"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Cancel */}
          {job?.status === "accepted" && (
            <>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelJob}
              >
                <X color="#f87171" size={20} />
                <Text style={styles.cancelButtonText}>Cancel Job</Text>
              </TouchableOpacity>
              <Text style={styles.policyNote}>
                Cancel within {CANCELLATION_GRACE_MINUTES} minutes of acceptance
                for a full refund. After that, a $
                {CANCELLATION_FEE_USD.toFixed(2)} cancellation fee applies and
                the remainder will be refunded.
              </Text>
            </>
          )}

          {/* Trust */}
          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <Shield color="#22c55e" size={20} />
              <Text style={styles.trustText}>Licensed & Insured</Text>
            </View>
            <View style={styles.trustItem}>
              <Clock color="#60a5fa" size={20} />
              <Text style={styles.trustText}>Real-time Updates</Text>
            </View>
            <View style={styles.trustItem}>
              <CheckCircle color="#c084fc" size={20} />
              <Text style={styles.trustText}>Quality Guaranteed</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/** Styles **/
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40, marginTop: 40 },

  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#fff", fontSize: 18, textAlign: "center" },

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
  headerCenter: { alignItems: "center", flex: 1 },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  headerBadgeText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#fff" },

  statusCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
  statusGradient: { padding: 20 },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusInfo: { marginLeft: 16, flex: 1 },
  statusTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  statusSubtitle: { fontSize: 14, color: "#e0e7ff", marginTop: 2 },
  serviceText: { fontSize: 16, color: "#e0e7ff" },

  alertCard: { marginBottom: 20, borderRadius: 16, overflow: "hidden" },
  alertGradient: { padding: 20 },
  alertHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },
  alertText: { fontSize: 16, color: "#e0e7ff", lineHeight: 24 },

  providerCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  providerInfo: { flexDirection: "row", alignItems: "center" },
  providerImage: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
  providerImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  providerDetails: { flex: 1 },
  providerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  providerBusiness: { fontSize: 16, color: "#e0e7ff", marginBottom: 8 },
  providerAbout: { fontSize: 14, color: "#94a3b8", marginBottom: 8 },
  ratingContainer: { alignItems: "flex-start" },

  mapCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  mapContainer: { height: 260, borderRadius: 12, overflow: "hidden" },
  map: { flex: 1 },

  mapHud: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mapBadge: {
    backgroundColor: "rgba(2,6,23,0.65)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  mapBadgeText: { color: "#e0e7ff", fontSize: 12, fontWeight: "600" },
  followPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  followOn: { backgroundColor: "#86efac", borderColor: "#16a34a" },
  followOff: {
    backgroundColor: "rgba(2,6,23,0.65)",
    borderColor: "rgba(255,255,255,0.12)",
  },
  followText: { fontSize: 12, fontWeight: "700" },
  followTextOn: { color: "#052e16" },
  followTextOff: { color: "#e0e7ff" },

  completionCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  completionText: {
    fontSize: 16,
    color: "#e0e7ff",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  completionImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  completionButtons: { gap: 12 },
  confirmButton: { borderRadius: 16, overflow: "hidden" },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  rejectButton: {
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(248, 113, 113, 0.3)",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  rejectButtonText: { color: "#f87171", fontSize: 16, fontWeight: "bold" },

  cancelButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  cancelButtonText: { color: "#f87171", fontSize: 16, fontWeight: "bold" },
  policyNote: {
    color: "#e0e7ff",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.8,
  },

  trustSection: { alignItems: "center", justifyContent: "center", gap: 3 },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  trustText: { color: "#e0e7ff", fontSize: 18, fontWeight: "500" },
});
