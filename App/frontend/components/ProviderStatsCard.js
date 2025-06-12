import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import api from "../api/client";
import StarRating from "../components/StarRating";

export default function ProviderStatsCard() {
  const [stats, setStats] = useState({
    completedJobsCount: 0,
    totalAmountPaid: 0,
    averageRating: null,
    reviews: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/jobs/me/stats");
        setStats(
          response.data || {
            completedJobsCount: 0,
            totalAmountPaid: 0,
            averageRating: null,
            reviews: [],
          }
        );
      } catch (err) {
        console.error("Error fetching provider stats:", err);
        setError("Error fetching provider stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} />;
  }

  if (error) {
    return <Text style={{ color: "red", marginTop: 20 }}>{error}</Text>;
  }

  return (
    <ScrollView style={styles.card}>
      <Text style={styles.title}>
        Provider Statistics (Year: {new Date().getFullYear()})
      </Text>

      <Text style={styles.info}>
        Completed Jobs: {stats.completedJobsCount}
      </Text>

      <Text style={styles.info}>
        Total Earnings (Provider): $
        {(stats.totalAmountPaid || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>

      <Text style={styles.info}>Average Rating:</Text>
      {stats.averageRating ? (
        <StarRating rating={stats.averageRating} />
      ) : (
        <Text style={styles.info}>No ratings yet</Text>
      )}

      <Text style={styles.note}>
        * Total earnings reflect full job payouts (excluding BlinqFix’s 7% fee)
      </Text>

      {stats.reviews.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.subheader}>Customer Reviews</Text>

          {/* ✅ Sort reviews by most recent first */}
          {[...stats.reviews]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((r, idx) => (
              <View key={idx} style={styles.reviewBox}>
                <Text style={styles.reviewText}>"{r.comment}"</Text>
                {r.rating && (
                  <View style={{ marginTop: 4 }}>
                    <StarRating rating={r.rating} />
                  </View>
                )}
                {r.date && (
                  <Text style={styles.reviewMeta}>
                    Completed: {new Date(r.date).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    marginBottom: 4,
  },
  note: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
  },
  subheader: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 8,
  },
  reviewBox: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 4,
  },
  reviewMeta: {
    fontSize: 12,
    color: "#666",
  },
});
