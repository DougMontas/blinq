// import React, { useState, useEffect } from "react";
// import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
// import api from "../api/client";

// export default function ProviderStatsCard() {
//   const [stats, setStats] = useState({
//     completedJobsCount: 0,
//     totalAmountPaid: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         // 🔥 point at the jobs router, not users
//         const response = await api.get("/jobs/me/stats");
//         setStats(response.data || { completedJobsCount: 0, totalAmountPaid: 0 });
//       } catch (err) {
//         if (err.response?.status === 404) {
//           console.warn("No stats available yet for this provider.");
//           setStats({ completedJobsCount: 0, totalAmountPaid: 0 });
//         } else {
//           console.error("Error fetching provider stats:", err);
//           setError("Error fetching provider stats.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStats();
//   }, []);

//   if (loading) {
//     return <ActivityIndicator style={{ marginTop: 20 }} />;
//   }
//   if (error) {
//     return <Text style={{ color: "red", marginTop: 20 }}>{error}</Text>;
//   }

//   return (
//     <View style={styles.card}>
//       <Text style={styles.title}>
//         Provider Statistics (Year: {new Date().getFullYear()})
//       </Text>
//       <Text style={styles.info}>
//         Completed Jobs: {stats.completedJobsCount}
//       </Text>
//       <Text style={styles.info}>
//         Grand Total Earnings: $
//         {(stats.totalAmountPaid || 0).toLocaleString(undefined, {
//           minimumFractionDigits: 2,
//           maximumFractionDigits: 2,
//         })}
//       </Text>
//       <Text style={styles.note}>(Includes base cost + additional charges)</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     marginTop: 16,
//     padding: 16,
//     backgroundColor: "#f2f2f2",
//     borderRadius: 8,
//   },
//   title: {
//     fontWeight: "bold",
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   info: {
//     fontSize: 14,
//     marginBottom: 4,
//   },
//   note: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 4,
//   },
// });


import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import api from "../api/client";

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
        setStats(response.data || {
          completedJobsCount: 0,
          totalAmountPaid: 0,
          averageRating: null,
          reviews: [],
        });
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

      <Text style={styles.info}>
        Average Rating:{" "}
        {stats.averageRating
          ? stats.averageRating.toFixed(2) + " / 5"
          : "No ratings yet"}
      </Text>

      <Text style={styles.note}>
        * Total earnings reflect full job payouts (excluding BlinqFix’s 7% fee)
      </Text>

      {stats.reviews.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.subheader}>Customer Reviews</Text>
          {stats.reviews.map((r, idx) => (
            <View key={idx} style={styles.reviewBox}>
              <Text style={styles.reviewText}>"{r.comment}"</Text>
              {r.rating && (
                <Text style={styles.reviewMeta}>Rating: {r.rating} / 5</Text>
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
