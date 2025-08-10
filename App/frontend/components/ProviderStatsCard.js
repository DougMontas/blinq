// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import api from "../api/client";
// import StarRating from "../components/StarRating";

// export default function ProviderStatsCard() {
//   const [stats, setStats] = useState({
//     completedJobsCount: 0,
//     totalAmountPaid: 0,
//     averageRating: null,
//     reviews: [],
//     invitationsSent: 0,
//     invitationsAccepted: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         console.log("📡 Fetching: /api/userStats/invitation-stats");
//         const statsResponse = await api.get("/jobs/me/stats");
//         const inviteResponse = await api.get("/userStats/invitation-stats");

//         setStats({
//           completedJobsCount: statsResponse.data.completedJobsCount || 0,
//           totalAmountPaid: statsResponse.data.totalAmountPaid || 0,
//           averageRating: statsResponse.data.averageRating || null,
//           reviews: statsResponse.data.reviews || [],
//           invitationsSent: inviteResponse.data.sent || 0,
//           invitationsAccepted: inviteResponse.data.accepted || 0,
//         });
//       } catch (err) {
//         console.error("❌ Stats fetch error", err);
//         setError("Error fetching provider stats.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStats();
//   }, []);

//   if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;
//   if (error)
//     return <Text style={{ color: "red", marginTop: 20 }}>{error}</Text>;

//   return (
//     <ScrollView style={styles.card}>
//       <Text style={styles.title}>
//         Provider Statistics (Year: {new Date().getFullYear()})
//       </Text>
//       <Text style={styles.info}>
//         Completed Jobs: {stats.completedJobsCount}
//       </Text>
//       <Text style={styles.info}>
//         Total Earnings: ${stats.totalAmountPaid.toFixed(2)}
//       </Text>
//       <Text style={styles.info}>
//         Invitations Received: {stats.invitationsSent}
//       </Text>
//       <Text style={styles.info}>
//         Invitations Accepted: {stats.invitationsAccepted}
//       </Text>
//       <Text style={styles.info}>Average Rating:</Text>
//       {stats.averageRating ? (
//         <StarRating rating={stats.averageRating} />
//       ) : (
//         <Text style={styles.info}>No ratings yet</Text>
//       )}
//       <Text style={styles.note}>
//         * Total earnings reflect full job payouts (excluding BlinqFix’s 7% fee)
//       </Text>
//       {stats.reviews.length > 0 && (
//         <View style={{ marginTop: 16 }}>
//           <Text style={styles.subheader}>Customer Reviews</Text>
//           {stats.reviews
//             .sort((a, b) => new Date(b.date) - new Date(a.date))
//             .slice(0, 3) // Limit to 3 most recent
//             .map((r, idx) => (
//               <View key={idx} style={styles.reviewBox}>
//                 <Text style={styles.reviewText}>"{r.comment}"</Text>
//                 {r.rating && <StarRating rating={r.rating} />}
//                 {r.date && (
//                   <Text style={styles.reviewMeta}>
//                     Completed: {new Date(r.date).toLocaleDateString()}
//                   </Text>
//                 )}
//               </View>
//             ))}
//         </View>
//       )}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     marginTop: 16,
//     padding: 16,
//     backgroundColor: "#f2f2f2",
//     borderRadius: 8,
//   },
//   title: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
//   info: { fontSize: 14, marginBottom: 4 },
//   note: { fontSize: 12, color: "#666", marginTop: 6 },
//   subheader: { fontWeight: "600", fontSize: 16, marginBottom: 8 },
//   reviewBox: {
//     backgroundColor: "#fff",
//     padding: 10,
//     borderRadius: 6,
//     borderColor: "#ddd",
//     borderWidth: 1,
//     marginBottom: 10,
//   },
//   reviewText: { fontSize: 14, fontStyle: "italic", marginBottom: 4 },
//   reviewMeta: { fontSize: 12, color: "#666" },
// });


import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  TrendingUp,
  DollarSign,
  CheckCircle,
  Mail,
  MailCheck,
  Star,
  MessageSquare,
  Calendar,
} from "lucide-react-native";
import api from "../api/client";
import StarRating from "../components/StarRating";

const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
  <View style={styles.statCard}>
    <LinearGradient
      colors={[`${color}20`, `${color}10`]}
      style={styles.statGradient}
    >
      <View style={styles.statHeader}>
        <Icon color={color} size={24} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </LinearGradient>
  </View>
);

export default function ProviderStatsCard() {
  const [stats, setStats] = useState({
    completedJobsCount: 0,
    totalAmountPaid: 0,
    averageRating: null,
    reviews: [],
    invitationsSent: 0,
    invitationsAccepted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Keep all original backend logic exactly the same
  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("📡 Fetching: /api/userStats/invitation-stats");
        const statsResponse = await api.get("/jobs/me/stats");
        const inviteResponse = await api.get("/userStats/invitation-stats");

        setStats({
          completedJobsCount: statsResponse.data.completedJobsCount || 0,
          totalAmountPaid: statsResponse.data.totalAmountPaid || 0,
          averageRating: statsResponse.data.averageRating || null,
          reviews: statsResponse.data.reviews || [],
          invitationsSent: inviteResponse.data.sent || 0,
          invitationsAccepted: inviteResponse.data.accepted || 0,
        });
      } catch (err) {
        console.error("❌ Stats fetch error", err);
        setError("Error fetching provider stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#60a5fa" />
          <Text style={styles.loadingText}>Loading your stats...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient
          colors={['rgba(239, 68, 68, 0.15)', 'rgba(220, 38, 38, 0.05)']}
          style={styles.errorGradient}
        >
          <Text style={styles.errorText}>{error}</Text>
        </LinearGradient>
      </View>
    );
  }

  const acceptanceRate = stats.invitationsSent > 0 
    ? ((stats.invitationsAccepted / stats.invitationsSent) * 100).toFixed(1)
    : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <LinearGradient
          colors={['rgba(34, 197, 94, 0.15)', 'rgba(16, 185, 129, 0.05)']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TrendingUp color="#22c55e" size={32} />
            <Text style={styles.headerTitle}>
              Provider Statistics ({new Date().getFullYear()})
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon={CheckCircle}
          title="Completed Jobs"
          value={stats.completedJobsCount.toString()}
          color="#22c55e"
        />
        
        <StatCard
          icon={DollarSign}
          title="Total Earnings"
          value={`$${stats.totalAmountPaid.toFixed(2)}`}
          color="#16a34a"
          subtitle="Before platform fees"
        />
        
        <StatCard
          icon={Mail}
          title="Invitations Received"
          value={stats.invitationsSent.toString()}
          color="#60a5fa"
        />
        
        <StatCard
          icon={MailCheck}
          title="Invitations Accepted"
          value={`${stats.invitationsAccepted} (${acceptanceRate}%)`}
          color="#3b82f6"
        />
      </View>

      {/* Rating Card */}
      <View style={styles.ratingCard}>
        <LinearGradient
          colors={['rgba(168, 85, 247, 0.15)', 'rgba(147, 51, 234, 0.05)']}
          style={styles.ratingGradient}
        >
          <View style={styles.ratingHeader}>
            <Star color="#a855f7" size={24} />
            <Text style={styles.ratingTitle}>Average Rating</Text>
          </View>
          {stats.averageRating ? (
            <View style={styles.ratingContent}>
              <StarRating rating={stats.averageRating} size={32} />
              <Text style={styles.ratingValue}>
                {stats.averageRating.toFixed(1)} / 5.0
              </Text>
            </View>
          ) : (
            <Text style={styles.noRatingText}>No ratings yet</Text>
          )}
        </LinearGradient>
      </View>

      {/* Fee Note */}
      <View style={styles.noteCard}>
        <LinearGradient
          colors={['rgba(251, 146, 60, 0.1)', 'rgba(234, 88, 12, 0.05)']}
          style={styles.noteGradient}
        >
          <Text style={styles.noteText}>
            * Total earnings reflect full job payouts (excluding BlinqFix's 7% fee)
          </Text>
        </LinearGradient>
      </View>

      {/* Reviews Section */}
      {stats.reviews.length > 0 && (
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <MessageSquare color="#60a5fa" size={24} />
            <Text style={styles.reviewsTitle}>Recent Customer Reviews</Text>
          </View>
          
          {stats.reviews
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3) // Limit to 3 most recent
            .map((r, idx) => (
              <View key={idx} style={styles.reviewCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                  style={styles.reviewGradient}
                >
                  <Text style={styles.reviewText}>"{r.comment}"</Text>
                  {r.rating && (
                    <View style={styles.reviewRating}>
                      <StarRating rating={r.rating} size={18} />
                    </View>
                  )}
                  {r.date && (
                    <View style={styles.reviewMeta}>
                      <Calendar color="#94a3b8" size={14} />
                      <Text style={styles.reviewDate}>
                        {new Date(r.date).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </View>
            ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  loadingContainer: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden'
  },
  loadingGradient: {
    padding: 32,
    alignItems: 'center'
  },
  loadingText: {
    color: '#e0e7ff',
    fontSize: 16,
    marginTop: 12
  },
  errorContainer: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden'
  },
  errorGradient: {
    padding: 20
  },
  errorText: {
    color: '#f87171',
    fontSize: 16,
    textAlign: 'center'
  },
  headerCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden'
  },
  headerGradient: {
    padding: 20
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
    flex: 1
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden'
  },
  statGradient: {
    padding: 16
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e0e7ff',
    marginLeft: 8,
    flex: 1
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  statSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4
  },
  ratingCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden'
  },
  ratingGradient: {
    padding: 20
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12
  },
  ratingContent: {
    alignItems: 'center'
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8
  },
  noRatingText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  noteCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden'
  },
  noteGradient: {
    padding: 12
  },
  noteText: {
    fontSize: 12,
    color: '#fb923c',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  reviewsSection: {
    marginBottom: 20
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12
  },
  reviewCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden'
  },
  reviewGradient: {
    padding: 16
  },
  reviewText: {
    fontSize: 15,
    color: '#e0e7ff',
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 12
  },
  reviewRating: {
    marginBottom: 8
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  reviewDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 6
  },
});