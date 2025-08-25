import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import api from "../api/client"; // your existing axios instance

/**
 * Props:
 *  - jobId (string, required)
 *  - role: "customer" | "provider" (affects whether confirm UI is shown)
 */
export default function SecurityCodeCard({ jobId, role = "customer" }) {
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("••••••");
  const [revealed, setRevealed] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState(null);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [confirming, setConfirming] = useState(false);

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
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Security Code</Text>
        {/* {confirmedAt ? (
        //   <Text style={[styles.status, { color: "#22c55e" }]}>Confirmed</Text>
        ) : (
        //   <Text style={[styles.status, { color: "#eab308" }]}>Not Confirmed</Text>
        )} */}
      </View>

      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 12 }} />
      ) : error ? (
        <Text style={[styles.errorText]}>{error}</Text>
      ) : (
        <>
          <View style={styles.codeRow}>
            <Text style={styles.codeBubble}>{revealed ? code : "••••••"}</Text>
            <TouchableOpacity
              style={styles.ghostBtn}
              onPress={() => setRevealed((s) => !s)}
            >
              <Text style={styles.ghostBtnText}>
                {revealed ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.ghostBtn} onPress={copyCode}>
              <Text style={styles.ghostBtnText}>Copy</Text>
            </TouchableOpacity> */}
          </View>

          {/* {role === "provider" && !confirmedAt && (
            <View style={styles.confirmRow}>
              <TextInput
                value={input}
                onChangeText={(t) => setInput(String(t).replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirm} disabled={confirming}>
                <Text style={styles.primaryBtnText}>{confirming ? "Confirming…" : "Confirm Arrival"}</Text>
              </TouchableOpacity>
            </View>
          )} */}

          {confirmedAt && (
            <Text style={styles.metaText}>
              Confirmed at: {new Date(confirmedAt).toLocaleString()}
            </Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 14
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#e5e7eb",
    fontWeight: "700",
    fontSize: 16,
    marginHorizontal: "25%",
  },
  status: { fontWeight: "700" },
  errorText: { color: "#ef4444", marginTop: 12 },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 12,
    marginRight: 2,
    // width:'100vw',
  },
  codeBubble: {
    color: "#e5e7eb",
    backgroundColor: "#111827",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    letterSpacing: 4,
    fontSize: 20,
    fontWeight: "800",
    marginHorizontal: "25%",
    
  },
  confirmRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    // alignItems: "center",
    // width:'100%',
  },
  input: {
    flex: 1,
    backgroundColor: "#0b1220",
    color: "#e5e7eb",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 8,
    // paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryBtn: {
    backgroundColor: "#22c55e",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
  ghostBtn: {
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginLeft: -80,
    // gap: 2,
  },
  ghostBtnText: { color: "#e5e7eb", fontWeight: "700", marginRight: 2, },
  metaText: { color: "#9ca3af", fontSize: 12, marginTop: 8, marginRight: 18 },
});
