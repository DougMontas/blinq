// // screens/ProvideRating.js
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import api from "../api/client";

// export default function ProvideRating() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const [rating, setRating] = useState(0);
//   const [comments, setComments] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   // ✅ Safely extract jobId from params
//   const jobId = route?.params?.jobId;

//   useEffect(() => {
//     if (!jobId) {
//       Alert.alert("Missing Job ID", "Cannot submit rating without a job ID.", [
//         {
//           text: "OK",
//           onPress: () => navigation.replace("CustomerDashboard"),
//         },
//       ]);
//     }
//   }, [jobId]);

//   const submitRating = async () => {
//     if (!jobId) return; // ✅ Prevent submission if missing

//     setSubmitting(true);
//     try {
//       await api.put(`/jobs/${jobId}/rate`, { rating, comments });
//       Alert.alert("Thanks!", "Your feedback has been recorded.", [
//         {
//           text: "OK",
//           onPress: () => navigation.replace("CustomerDashboard"),
//         },
//       ]);
//     } catch (err) {
//       console.error(err);
//       Alert.alert("Error", "Failed to submit rating.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Rate Your Service Provider</Text>

//       <TouchableOpacity
//         style={[
//           styles.submitBtn,
//           (submitting || rating === 0 || !jobId) && styles.submitBtnDisabled,
//         ]}
//         onPress={submitRating}
//         disabled={submitting || rating === 0 || !jobId}
//       >
//         <Text style={styles.submitBtnText}>
//           {submitting ? "Submitting…" : "Submit Rating"}
//         </Text>
//       </TouchableOpacity>

//       <View style={styles.stars}>
//         {[1, 2, 3, 4, 5].map((i) => (
//           <TouchableOpacity key={i} onPress={() => setRating(i)}>
//             <Text style={[styles.star, i <= rating && styles.starFilled]}>
//               ★
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <TextInput
//         style={styles.textarea}
//         multiline
//         numberOfLines={4}
//         placeholder="Leave a comment"
//         value={comments}
//         onChangeText={setComments}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 24, justifyContent: "center" },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     textAlign: "center",
//     textShadowColor: "rgba(0,0,0,0.5)",
//     textShadowOffset: { width: 1, height: 2 },
//     textShadowRadius: 2,
//     marginBottom: 24,
//   },
//   stars: { flexDirection: "row", justifyContent: "center", marginBottom: 24 },
//   star: { fontSize: 36, color: "#ccc", marginHorizontal: 4 },
//   starFilled: { color: "#f1c40f" },
//   textarea: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 24,
//     textAlignVertical: "top",
//   },
//   submitBtn: {
//     backgroundColor: "#1976d2",
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   submitBtnDisabled: {
//     backgroundColor: "#aaa",
//   },
//   submitBtnText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Star,
  Send,
  CheckCircle,
  MessageSquare,
  User,
  Shield,
} from "lucide-react-native";
import api from "../api/client";

export default function ProvideRating() {
  const route = useRoute();
  const navigation = useNavigation();
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ Safely extract jobId from params
  const jobId = route?.params?.jobId;

  useEffect(() => {
    if (!jobId) {
      Alert.alert("Missing Job ID", "Cannot submit rating without a job ID.", [
        {
          text: "OK",
          onPress: () => navigation.replace("CustomerDashboard"),
        },
      ]);
    }
  }, [jobId]);

  const submitRating = async () => {
    if (!jobId) return; // ✅ Prevent submission if missing

    setSubmitting(true);
    try {
      await api.put(`/jobs/${jobId}/rate`, { rating, comments });
      Alert.alert("Thanks!", "Your feedback has been recorded.", [
        {
          text: "OK",
          onPress: () => navigation.replace("CustomerDashboard"),
        },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "Select Rating";
    }
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#1e3a8a", "#312e81"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.headerBadge}>
                <CheckCircle color="#22c55e" size={16} />
                <Text style={styles.headerBadgeText}>Service Complete</Text>
              </View>
              <Text style={styles.headerTitle}>Rate Your Experience</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          {/* Success Message */}
          <View style={styles.successCard}>
            <LinearGradient
              colors={["rgba(34, 197, 94, 0.2)", "rgba(16, 185, 129, 0.1)"]}
              style={styles.successGradient}
            >
              <View style={styles.successIcon}>
                <CheckCircle color="#22c55e" size={48} />
              </View>
              <Text style={styles.successTitle}>Service Completed!</Text>
              <Text style={styles.successDescription}>
                Your BlinqFix professional has successfully completed the job.
                Please take a moment to rate your experience.
              </Text>
            </LinearGradient>
          </View>

          {/* Rating Section */}
          <View style={styles.ratingCard}>
            <LinearGradient
              colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
              style={styles.ratingGradient}
            >
              <View style={styles.ratingHeader}>
                <Star color="#facc15" size={24} />
                <Text style={styles.ratingTitle}>How was your service?</Text>
              </View>

              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setRating(i)}
                    style={styles.starButton}
                  >
                    <Star
                      color={i <= rating ? "#facc15" : "#475569"}
                      fill={i <= rating ? "#facc15" : "transparent"}
                      size={40}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.ratingText}>{getRatingText(rating)}</Text>
            </LinearGradient>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsCard}>
            <LinearGradient
              colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
              style={styles.commentsGradient}
            >
              <View style={styles.commentsHeader}>
                <MessageSquare color="#60a5fa" size={24} />
                <Text style={styles.commentsTitle}>Share Your Feedback</Text>
              </View>

              <Text style={styles.commentsDescription}>
                Tell us about your experience to help us improve our service.
              </Text>

              <TextInput
                style={styles.textarea}
                multiline
                numberOfLines={4}
                placeholder="Leave a comment (optional)"
                placeholderTextColor="#94a3b8"
                value={comments}
                onChangeText={setComments}
              />
            </LinearGradient>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (submitting || rating === 0 || !jobId) &&
                styles.submitButtonDisabled,
            ]}
            onPress={submitRating}
            disabled={submitting || rating === 0 || !jobId}
          >
            <LinearGradient
              colors={
                submitting || rating === 0 || !jobId
                  ? ["#6b7280", "#4b5563"]
                  : ["#22c55e", "#16a34a"]
              }
              style={styles.submitButtonGradient}
            >
              <Send color="#fff" size={20} />
              <Text style={styles.submitButtonText}>
                {submitting ? "Submitting..." : "Submit Rating"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Trust Indicators */}
          <View style={styles.trustSection}>
            <View style={styles.trustItem}>
              <Shield color="#22c55e" size={16} />
              <Text style={styles.trustText}>Your feedback is secure</Text>
            </View>
            <View style={styles.trustItem}>
              <User color="#60a5fa" size={16} />
              <Text style={styles.trustText}>
                Helps improve service quality
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    marginTop: 40,
  },
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
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  headerBadgeText: {
    color: "#22c55e",
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  successCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  successGradient: {
    padding: 32,
    alignItems: "center",
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  successDescription: {
    fontSize: 16,
    color: "#e0e7ff",
    textAlign: "center",
    lineHeight: 24,
  },
  ratingCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  ratingGradient: {
    padding: 24,
  },
  ratingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    justifyContent: "center",
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  starButton: {
    padding: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#facc15",
    textAlign: "center",
  },
  commentsCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  commentsGradient: {
    padding: 24,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },
  commentsDescription: {
    fontSize: 14,
    color: "#e0e7ff",
    marginBottom: 16,
    lineHeight: 20,
  },
  textarea: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 100,
  },
  submitButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  trustSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    marginBottom: 60,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trustText: {
    color: "#e0e7ff",
    fontSize: 12,
    fontWeight: "500",
  },
});
