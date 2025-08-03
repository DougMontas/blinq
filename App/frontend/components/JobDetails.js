import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import QUESTIONS from "../utils/serviceMatrix";

export default function JobDetails({ job, onAccept, isTeaser = false }) {
  const [showPhone, setShowPhone] = useState(false);
  const [elapsedReady, setElapsedReady] = useState(false);

  useEffect(() => {
    if (!job?.acceptedAt) return;

    const acceptedTime = new Date(job.acceptedAt).getTime();
    const delay = Math.max(0, 0.2 * 60 * 1000 - (Date.now() - acceptedTime));

    const timeout = setTimeout(() => {
      setElapsedReady(true);
      // console.log('phone button fired')
    }, delay);

    return () => clearTimeout(timeout);
  }, [job?.acceptedAt]);

  if (!job) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  }

  const {
    customer,
    serviceType,
    status,
    paymentStatus,
    address,
    serviceCity,
    serviceZipcode,
    phoneNumber,
    baseAmount = 0,
    adjustmentAmount = 0,
    rushFee = 0,
    additionalCharge = 0,
    details = {},
  } = job;

  const subtotal =
    baseAmount + adjustmentAmount + rushFee + Number(additionalCharge);
  const convenienceFee = Number((subtotal * 0.07).toFixed(2));
  const estimatedTotal = Number((subtotal + convenienceFee).toFixed(2));

  let entries = [];
  try {
    if (typeof details === "string") {
      entries = Object.entries(JSON.parse(details));
    } else if (typeof details === "object" && details !== null) {
      entries = Object.entries(details);
    }
  } catch {
    entries = [];
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.bold}>Emergency Job Awarded. Customer has been notified you are in route shortly.</Text> */}
      <Text></Text>
      <Text style={styles.header}>Job Details</Text>
      <Text>
        <Text style={styles.bold}>Customer Name:</Text> {customer?.name}
      </Text>
      <Text>
        <Text style={styles.bold}>Service Type:</Text> {serviceType}
      </Text>
      <Text>
        <Text style={styles.bold}>Status:</Text> {status}
      </Text>
      <Text>
        <Text style={styles.bold}>Payment Status:</Text> {paymentStatus || "-"}
      </Text>

      <Text>
        <Text style={styles.bold}>Service Address:</Text>{" "}
        {isTeaser
          ? "Gold members get priority. Check back in 15 mins **"
          : address}
      </Text>

      <Text>
        <Text style={styles.bold}>Service City:</Text> {serviceCity}
      </Text>
      <Text>
        <Text style={styles.bold}>Service Zipcode:</Text> {serviceZipcode}
      </Text>

      {elapsedReady && !showPhone && (
        <Button
          title="Reveal Customer Phone"
          onPress={() => setShowPhone(true)}
        />
      )}
      <View style={styles.section}>
        <Text style={styles.bold}>Breakdown (USD):</Text>
        <Text>Additional Charge: ${Number(additionalCharge).toFixed(2)}</Text>
        <Text
          style={{
            fontWeight: "700",
            marginTop: 4,
            fontSize: 22,
            textAlign: "center",
          }}
        >
          Estimated Total: ${estimatedTotal.toFixed(2)}
        </Text>
      </View>
      {entries.length > 0 && (
        <View style={styles.qaContainer}>
          <Text style={styles.qaHeader}>Emergency Form Responses</Text>
          {entries.map(([k, v], i) => (
            <View key={k} style={styles.qaItem}>
              <Text style={styles.q}>{QUESTIONS[k] || k}</Text>
              <Text style={styles.a}>
                {Array.isArray(v) ? v.join(", ") : String(v)}
              </Text>
              {i < entries.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      )}
      {status === "invited" && onAccept && (
        <Button title="Accept" onPress={onAccept} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#fff" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  bold: { fontWeight: "600" },
  section: { marginTop: 16 },
  qaContainer: { marginTop: 20 },
  qaHeader: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  qaItem: { marginBottom: 8 },
  q: { fontWeight: "500" },
  a: { marginLeft: 4, marginBottom: 4 },
  divider: { height: 1, backgroundColor: "#ccc", marginVertical: 4 },
});
