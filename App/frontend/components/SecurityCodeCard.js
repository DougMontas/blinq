import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  useWindowDimensions,
  Platform,
  PixelRatio,
  ColorSchemeName,
  useColorScheme,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import api from "../api/client"; // your existing axios instance

export default function SecurityCodeCard({
  jobId,
  role = "customer",
  style,
  onConfirmed,
}) {
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("••••••");
  const [revealed, setRevealed] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState(null);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [confirming, setConfirming] = useState(false);

  // --- Responsive tokens ---
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light"; // default to dark if unknown

  // scale util based on iPhone 11 baseline width 375
  const scale = useMemo(() => {
    const guidelineBaseWidth = 375; // baseline
    const ratio = Math.min(width / guidelineBaseWidth, 1.4); // cap huge tablets
    const vs = (size) =>
      Math.round(PixelRatio.roundToNearestPixel(size * ratio));
    return { vs, ratio };
  }, [width]);

  const themed = useMemo(() => getStyles(scale, isDark), [scale, isDark]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get(`/jobs/${jobId}/security-code`);
        if (!alive) return;
        if (data?.ok) {
          setCode(String(data.securityCode || "******"));
          setConfirmedAt(data.confirmedAt || null);
        } else {
          setError(data?.error || "Failed to load security code");
        }
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to load security code");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [jobId]);

  const copyCode = async () => {
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert("Copied", "Security code copied to clipboard.");
    } catch {
      Alert.alert("Copy failed", "Unable to copy code.");
    }
  };

  const handleConfirm = async () => {
    if (!input || input.length !== 6) {
      return Alert.alert("Invalid", "Please enter the 6-digit code.");
    }
    try {
      setConfirming(true);
      const { data } = await api.post(`/jobs/${jobId}/security-code/confirm`, {
        code: input,
      });
      if (data?.ok) {
        setConfirmedAt(data.confirmedAt);
        onConfirmed?.(data.confirmedAt);
        Alert.alert("Confirmed", "Arrival confirmed.");
      } else {
        Alert.alert("Error", data?.error || "Invalid code.");
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err?.response?.data?.error || "Confirmation failed."
      );
    } finally {
      setConfirming(false);
    }
  };

  return (
    <View
      style={[themed.card, style]}
      accessibilityLabel="Security code card"
      accessibilityRole="summary"
    >
      <Text style={themed.secmessage}>
        ***For security purposes, the service pro must verbally confirm the
        security code upon arrival.***
      </Text>

      {/* <View style={themed.headerRow}>
        <Text style={themed.title}>Security Code</Text>
        {!!confirmedAt && (
          <View style={[themed.badge, themed.badgeSuccess]}>
            <Text style={themed.badgeText}>Confirmed</Text>
          </View>
        )}
        {!confirmedAt && (
          // <View style={[themed.badge, themed.badgeWarning]}>
            <Text style={themed.badgeText}>Not confirmed</Text>
          </View>
        )}
      </View> */}

      {loading ? (
        <ActivityIndicator
          color={isDark ? "#fff" : "#111"}
          style={{ marginTop: scale.vs(8) }}
        />
      ) : error ? (
        <Text style={[themed.errorText]}>{error}</Text>
      ) : (
        <>
          <View style={themed.codeRow}>
            <Text
              style={themed.codeBubble}
              accessibilityLabel={revealed ? `Code ${code}` : "Code hidden"}
            >
              {revealed ? code : "••••••"}
            </Text>
            <View style={themed.codeActions}>
              <TouchableOpacity
                style={themed.ghostBtn}
                onPress={() => setRevealed((s) => !s)}
                accessibilityRole="button"
              >
                <Text style={themed.ghostBtnText}>
                  {revealed ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={themed.ghostBtn} onPress={copyCode} accessibilityRole="button">
                <Text style={themed.ghostBtnText}>Copy</Text>
              </TouchableOpacity> */}
            </View>
          </View>

          {role === "provider" && !confirmedAt && (
            <View style={themed.confirmRow}>
              {/* <TextInput
                value={input}
                onChangeText={(t) => setInput(String(t).replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code"
                placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                style={themed.input}
                keyboardType={Platform.select({ ios: "number-pad", android: "numeric", default: "numeric" })}
                maxLength={6}
                returnKeyType="done"
              /> */}
              {/* <TouchableOpacity style={[themed.primaryBtn, confirming && { opacity: 0.8 }]}
                onPress={handleConfirm}
                disabled={confirming}
                accessibilityRole="button">
                <Text style={themed.primaryBtnText}>{confirming ? "Confirming…" : "Confirm Arrival"}</Text>
              </TouchableOpacity> */}
            </View>
          )}

          {confirmedAt && (
            <Text style={themed.metaText}>
              Confirmed at: {new Date(confirmedAt).toLocaleString()}
            </Text>
          )}
        </>
      )}
    </View>
  );
}

// ---- Styles (theme + responsive) ----
function getStyles(scale, isDark) {
  const bg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const border = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
  const text = isDark ? "#e5e7eb" : "#111827";
  const subtext = isDark ? "#9ca3af" : "#4b5563";
  const codeBg = isDark ? "#111827" : "#e5e7eb";
  const codeBorder = isDark ? "#374151" : "#d1d5db";

  return StyleSheet.create({
    card: {
      backgroundColor: bg,
      borderColor: border,
      borderWidth: 1,
      borderRadius: 12,
      padding: scale.vs(16),
      marginTop: scale.vs(12),
      marginBottom: scale.vs(14),
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: scale.vs(8),
    },
    title: {
      color: "white",
      fontWeight: "800",
      fontSize: scale.vs(18),
    },
    badge: {
      borderRadius: 999,
      paddingHorizontal: scale.vs(10),
      paddingVertical: scale.vs(4),
      alignSelf: "flex-start",
    },
    badgeSuccess: { backgroundColor: isDark ? "#14532d" : "#dcfce7" },
    badgeWarning: { backgroundColor: isDark ? "#78350f" : "#fef3c7" },
    badgeText: { color: text, fontWeight: "700", fontSize: scale.vs(12) },

    errorText: { color: "#ef4444", marginTop: scale.vs(12) },

    codeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: scale.vs(12),
      marginTop: scale.vs(12),
    },
    codeBubble: {
      flexShrink: 1,
      flexGrow: 1,
      textAlign: "center",
      color: text,
      backgroundColor: codeBg,
      borderColor: codeBorder,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: scale.vs(10),
      paddingHorizontal: scale.vs(14),
      letterSpacing: scale.vs(4),
      fontSize: scale.vs(22),
      fontWeight: "900",
    },
    codeActions: {
      flexDirection: "row",
      gap: scale.vs(8),
    },
    confirmRow: {
      flexDirection: "row",
      gap: scale.vs(8),
      marginTop: scale.vs(12),
      alignItems: "center",
    },
    input: {
      flex: 1,
      backgroundColor: isDark ? "#0b1220" : "#f9fafb",
      color: text,
      borderColor: codeBorder,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: scale.vs(12),
      paddingVertical: Platform.select({
        ios: scale.vs(12),
        android: scale.vs(8),
        default: scale.vs(10),
      }),
      fontSize: scale.vs(16),
    },
    primaryBtn: {
      backgroundColor: "#22c55e",
      borderRadius: 10,
      paddingHorizontal: scale.vs(14),
      paddingVertical: scale.vs(12),
      minWidth: scale.vs(130),
      alignItems: "center",
      justifyContent: "center",
    },
    primaryBtnText: {
      color: "#fff",
      fontWeight: "800",
      fontSize: scale.vs(14),
    },
    ghostBtn: {
      borderColor: isDark ? "#ffffff" : "#111827",
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: scale.vs(12),
      paddingVertical: scale.vs(10),
      minWidth: scale.vs(72),
      alignItems: "center",
      justifyContent: "center",
    },
    ghostBtnText: { color: "white", fontWeight: "800", fontSize: scale.vs(14) },
    metaText: {
      color: subtext,
      fontSize: scale.vs(12),
      marginTop: scale.vs(8),
    },
    secmessage: {
      color: "white",
      textAlign: "center",
      marginBottom: scale.vs(8),
      fontSize: scale.vs(14),
      fontWeight: "600",
    },
  });
}
